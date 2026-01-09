
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Booking, User, Review, UserRole } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { DEFAULT_PROFILE_IMAGE } from './constants';

interface ConfirmConfig {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  bookings: Booking[];
  reviews: Review[];
  addBooking: (booking: Booking) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'time'>) => Promise<void>;
  updateReview: (id: string, updates: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  isAdmin: boolean;
  isManagement: boolean;
  isCashier: boolean;
  currentUser: User | null;
  users: User[];
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  registerTrainer: (data: any) => Promise<{ success: boolean; msg?: string }>;
  requestTrainerUpgrade: (userId: string, currentName: string, phone: string, specialty: string) => Promise<{ success: boolean; msg?: string }>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
  isLoading: boolean;
  isDemoMode: boolean;
  confirmAction: (config: ConfirmConfig) => void;
  confirmState: ConfirmConfig | null;
  closeConfirm: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const MASTER_EMAIL = 'admin@classfit.bg';
const GYM_ADDRESS = 'ул. „Студентска“ 1А, Варна';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('bg');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmState, setConfirmState] = useState<ConfirmConfig | null>(null);

  const isAdmin = currentUser?.roles?.some(r => r === 'admin' || r === 'management') || false;
  const isManagement = currentUser?.roles?.includes('management') || false;
  const isCashier = currentUser?.roles?.some(r => r === 'cashier' || r === 'management' || r === 'admin') || false;
  const isDemoMode = !isSupabaseConfigured;

  const confirmAction = (config: ConfirmConfig) => setConfirmState(config);
  const closeConfirm = () => setConfirmState(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await refreshData();
        const savedUser = localStorage.getItem('classfit_user');
        if (savedUser) {
           const parsedUser = JSON.parse(savedUser);
           if (parsedUser) setCurrentUser(parsedUser);
        }
        const savedLang = localStorage.getItem('classfit_lang');
        if (savedLang) setLanguage(savedLang as Language);
      } catch (err) {
        console.error("Database Init Error:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    init();
  }, [isDemoMode]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('classfit_lang', lang);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('classfit_user');
  };

  const refreshData = async () => {
    if (isDemoMode) {
      const localBookings = localStorage.getItem('classfit_bookings');
      const localUsers = localStorage.getItem('classfit_users');
      const localReviews = localStorage.getItem('classfit_reviews');
      if (localBookings) setBookings(JSON.parse(localBookings) || []);
      if (localUsers) setUsers(JSON.parse(localUsers) || []);
      if (localReviews) setReviews(JSON.parse(localReviews) || []);
      return;
    }

    try {
      const { data: bData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (bData) setBookings(bData.map((b: any) => ({
          ...b,
          id: String(b.id),
          checkInCode: b.check_in_code || '', 
          trainerId: String(b.trainer_id),
          userId: b.user_id ? String(b.user_id) : undefined,
          customerName: b.customer_name || 'Unknown',
          customerPhone: b.customer_phone,
          customerEmail: b.customer_email,
          date: b.booking_date || '',
          time: b.booking_time || '',
          price: Number(b.price || 0),
          status: b.status,
          hasBeenReviewed: b.has_been_reviewed || false
      })));

      const { data: rData } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (rData) {
        setReviews(rData.map((r: any) => ({
          ...r,
          id: String(r.id),
          trainerId: String(r.trainer_id),
          author: r.author_name || 'Anonymous', 
          text: r.content || r.text || '', // Defensive mapping: checking both fields
          isPublished: r.is_published || false,
          rating: Number(r.rating || 5),
          time: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently'
        })));
      }
      
      const { data: uData } = await supabase.from('users').select('*').order('joined_date', { ascending: false });
      if (uData) {
        const mappedUsers = uData.map((u: any) => {
          let roles: UserRole[] = u.roles || (u.role ? [u.role as UserRole] : ['user']);
          if (u.email === MASTER_EMAIL) roles = Array.from(new Set([...roles, 'management', 'admin']));
          return {
            id: String(u.id),
            name: u.name || 'User',
            email: u.email || '',
            password: u.password || '',
            roles: roles,
            phone: u.phone,
            image: u.image || DEFAULT_PROFILE_IMAGE, 
            joinedDate: u.joined_date || new Date().toISOString(),
            commissionRate: u.commission_rate || 25,
            languages: u.languages || ['Bulgarian'],
            bio: u.bio || '',
            blockedDates: u.blocked_dates || []
          };
        });
        setUsers(mappedUsers);

        const currentStoredUser = localStorage.getItem('classfit_user');
        if (currentStoredUser) {
           const parsed = JSON.parse(currentStoredUser);
           const freshSelf = mappedUsers.find(u => u.id === parsed.id);
           if (freshSelf) {
             setCurrentUser(freshSelf);
             localStorage.setItem('classfit_user', JSON.stringify(freshSelf));
           }
        }
      }
    } catch (e) {
      console.error("Refresh failed:", e);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const dbUpdates: any = { ...updates };
    if (updates.commissionRate !== undefined) { dbUpdates.commission_rate = updates.commissionRate; delete dbUpdates.commissionRate; }
    if (updates.blockedDates !== undefined) { dbUpdates.blocked_dates = updates.blockedDates; delete dbUpdates.blockedDates; }
    if (updates.joinedDate !== undefined) { dbUpdates.joined_date = updates.joinedDate; delete dbUpdates.joinedDate; }

    if (isDemoMode) {
        const updatedUsers = users.map(u => u.id === id ? { ...u, ...updates } : u);
        setUsers(updatedUsers);
        if (currentUser?.id === id) {
          const newUser = { ...currentUser, ...updates };
          setCurrentUser(newUser);
          localStorage.setItem('classfit_user', JSON.stringify(newUser));
        }
        localStorage.setItem('classfit_users', JSON.stringify(updatedUsers));
        return;
    }

    const { error } = await supabase.from('users').update(dbUpdates).eq('id', id);
    if (error) {
        console.error("Supabase update error:", error);
        throw new Error(`Failed to update user profile: ${error.message}`);
    }
    await refreshData();
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    const dbUpdates: any = { ...updates };
    if (updates.checkInCode) { dbUpdates.check_in_code = updates.checkInCode; delete dbUpdates.checkInCode; }
    if (updates.hasBeenReviewed !== undefined) { dbUpdates.has_been_reviewed = updates.hasBeenReviewed; delete dbUpdates.hasBeenReviewed; }

    if (isDemoMode) {
      const newBookings = bookings.map(b => b.id === id ? { ...b, ...updates } : b);
      setBookings(newBookings);
      localStorage.setItem('classfit_bookings', JSON.stringify(newBookings));
      return;
    }

    const { error } = await supabase.from('bookings').update(dbUpdates).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (isDemoMode) {
      const u = users.find(u => u.email === email && u.password === pass);
      if (u) { 
        setCurrentUser(u); localStorage.setItem('classfit_user', JSON.stringify(u)); return true; 
      }
      return false;
    }
    const { data } = await supabase.from('users').select('*').eq('email', email).eq('password', pass).maybeSingle();
    if (data) {
        const roles = data.roles || (data.role ? [data.role as UserRole] : ['user']);
        const u: User = { 
          id: String(data.id), name: data.name, email: data.email, password: data.password, 
          roles: roles, phone: data.phone, image: data.image || DEFAULT_PROFILE_IMAGE, 
          joinedDate: data.joined_date, commissionRate: data.commission_rate || 25,
          languages: data.languages || ['Bulgarian'], bio: data.bio || '',
          blockedDates: data.blocked_dates || []
        };
        setCurrentUser(u); localStorage.setItem('classfit_user', JSON.stringify(u)); return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    if (isDemoMode) {
       const mock: User = { id: Math.random().toString(36).substr(2, 9), name, email, password: pass, roles: ['user'], joinedDate: new Date().toISOString(), image: DEFAULT_PROFILE_IMAGE, blockedDates: [] };
       setUsers([...users, mock]); setCurrentUser(mock); localStorage.setItem('classfit_user', JSON.stringify(mock)); return true;
    }
    const { error } = await supabase.from('users').insert([{ name, email, password: pass, roles: ['user'] }]);
    if (error) throw error;
    return login(email, pass);
  };

  const registerTrainer = async (data: any) => {
    if (isDemoMode) {
       const u: User = { id: Math.random().toString(36).substr(2, 9), name: data.name, email: data.email, password: data.pass, phone: data.phone, roles: ['user', 'trainer_pending'], joinedDate: new Date().toISOString(), image: DEFAULT_PROFILE_IMAGE, blockedDates: [] };
       setUsers([...users, u]); return { success: true };
    }
    const { error } = await supabase.from('users').insert([{ name: data.name, email: data.email, phone: data.phone, password: data.pass, roles: ['user', 'trainer_pending'] }]);
    if (error) return { success: false, msg: error.message };
    await refreshData(); return { success: true };
  };

  const requestTrainerUpgrade = async (userId: string, currentName: string, phone: string, specialty: string) => {
    const formattedName = `${currentName} (${specialty})`;
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, msg: 'User not found' };
    const newRoles: UserRole[] = Array.from(new Set([...(user.roles || []), 'trainer_pending' as UserRole]));
    if (isDemoMode) { 
      setUsers(users.map(u => u.id === userId ? { ...u, roles: newRoles, phone, name: formattedName } : u)); 
      return { success: true }; 
    }
    const { error } = await supabase.from('users').update({ roles: newRoles, name: formattedName, phone }).eq('id', userId);
    if (error) return { success: false, msg: error.message };
    await refreshData(); return { success: true };
  };

  const addReview = async (review: any) => {
    if (isDemoMode) {
      const newReview: Review = { ...review, id: Math.random().toString(36).substr(2, 9), time: new Date().toLocaleDateString(), isPublished: false };
      setReviews([newReview, ...reviews]);
      return;
    }
    const { error } = await supabase.from('reviews').insert([{ trainer_id: review.trainerId, author_name: review.author, rating: review.rating, content: review.text, is_published: false }]);
    if (error) throw error;
    await refreshData();
  };

  const updateReview = async (id: string, updates: Partial<Review>) => {
    if (isDemoMode) {
      setReviews(reviews.map(r => r.id === id ? { ...r, ...updates } : r));
      return;
    }
    const { error } = await supabase.from('reviews').update({ is_published: updates.isPublished }).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const deleteReview = async (id: string) => {
    if (isDemoMode) { setReviews(reviews.filter(r => r.id !== id)); return; }
    await supabase.from('reviews').delete().eq('id', id);
    await refreshData();
  };

  const deleteUser = async (id: string) => {
    if (isDemoMode) { setUsers(users.filter(u => u.id !== id)); return; }
    await supabase.from('users').delete().eq('id', id);
    await refreshData();
  };

  const addBooking = async (booking: Booking) => {
    if (isDemoMode) {
      setBookings([booking, ...bookings]);
      localStorage.setItem('classfit_bookings', JSON.stringify([booking, ...bookings]));
      return;
    }
    const { error } = await supabase.from('bookings').insert([{
      id: booking.id, 
      check_in_code: booking.checkInCode, 
      trainer_id: booking.trainerId, 
      user_id: booking.userId,
      customer_name: booking.customerName, 
      customer_phone: booking.customerPhone, 
      customer_email: booking.customerEmail,
      booking_date: booking.date, 
      booking_time: booking.time, 
      duration_mins: booking.duration, 
      price: booking.price,
      status: booking.status, 
      language: booking.language, 
      gym_address: GYM_ADDRESS
    }]);
    if (error) throw error;
    await refreshData(); 
  };

  const deleteBooking = async (id: string) => {
    if (isDemoMode) { setBookings(bookings.filter(b => b.id !== id)); return; }
    await supabase.from('bookings').delete().eq('id', id);
    await refreshData();
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage: changeLanguage, bookings, reviews, addBooking, addReview, updateReview, deleteReview, updateBooking, deleteBooking, isAdmin, isManagement, isCashier, currentUser, users, login, register, registerTrainer, requestTrainerUpgrade, updateUser, deleteUser, logout, refreshData, isLoading, isDemoMode, confirmAction, confirmState, closeConfirm
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
