
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
  currentUser: User | null;
  users: User[];
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  registerTrainer: (data: { 
    name: string; 
    email: string; 
    pass: string; 
    phone: string; 
    specialty: string;
    experience?: string;
    certs?: string;
    social?: string;
    motivation?: string;
    languages?: string[];
  }) => Promise<{ success: boolean; msg?: string }>;
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

const MASTER_ID = '26e38fa6-50ce-4a03-8b8d-cb76da6594b0';
const MASTER_EMAIL = 'admin@classfit.bg';

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
      } catch (err) {
        console.error("Database Init Error:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    init();
  }, [isDemoMode]);

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
          id: String(b.id),
          checkInCode: b.check_in_code || '',
          trainerId: String(b.trainer_id),
          userId: b.user_id ? String(b.user_id) : undefined,
          customerName: b.customer_name || 'Unknown',
          customerPhone: b.customer_phone,
          customerEmail: b.customer_email,
          date: b.booking_date || '',
          time: b.booking_time || '',
          duration: b.duration_mins || 60,
          price: Number(b.price || 0),
          status: b.status || 'pending',
          paymentMethod: b.payment_method,
          language: (b.language as Language) || 'bg',
          commissionAmount: Number(b.commission_amount || 0),
          trainerEarnings: Number(b.trainer_earnings || 0),
          gymAddress: b.gym_address,
          hasBeenReviewed: b.has_been_reviewed || false,
          settledAt: b.settled_at,
          settledBy: b.settled_by
      })));

      const { data: rData } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (rData) setReviews(rData.map((r: any) => ({
          id: String(r.id),
          trainerId: String(r.trainer_id),
          author: r.author_name || 'Anonymous',
          rating: r.rating || 5,
          text: r.content || '',
          time: r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
          avatar: (r.author_name || 'A').charAt(0),
          isAiEnhanced: r.is_ai_enhanced || false,
          isPublished: r.is_published || false,
          bookingId: r.booking_id ? String(r.booking_id) : undefined
      })));
      
      const { data: uData } = await supabase.from('users').select('*').order('joined_date', { ascending: false });
      if (uData) setUsers(uData.map((u: any) => {
          let roles: UserRole[] = u.roles || ['user'];
          if ((u.email === MASTER_EMAIL || String(u.id) === MASTER_ID)) {
            roles = Array.from(new Set([...roles, 'management', 'admin']));
          }

          // Fallback languages for trainers if DB column is empty/null
          const isTrainer = roles.some(r => r === 'trainer' || r === 'trainer_pending');
          const defaultLangs = isTrainer ? ['Bulgarian', 'English'] : [];

          return {
            id: String(u.id),
            name: u.name || 'User',
            email: u.email || '',
            password: u.password || '',
            roles: roles,
            phone: u.phone,
            image: u.image || DEFAULT_PROFILE_IMAGE, 
            bio: u.bio,     
            joinedDate: u.joined_date || new Date().toISOString(),
            approvedBy: u.approved_by,
            commissionRate: u.commission_rate || 25,
            blockedDates: u.blocked_dates || [],
            languages: (u.languages && u.languages.length > 0) ? u.languages : defaultLangs
          };
      }));
    } catch (e) {
      console.error("Refresh failed:", e);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const prevUsers = [...users];
    const updatedUsers = users.map(u => u.id === id ? { ...u, ...updates } : u);
    setUsers(updatedUsers);
    
    if (currentUser?.id === id) {
      const newUser = { ...currentUser, ...updates };
      setCurrentUser(newUser);
      localStorage.setItem('classfit_user', JSON.stringify(newUser));
    }

    if (isDemoMode) {
        localStorage.setItem('classfit_users', JSON.stringify(updatedUsers));
        return;
    }

    const dbPayload: any = {};
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.email !== undefined) dbPayload.email = updates.email;
    if (updates.password !== undefined) dbPayload.password = updates.password;
    if (updates.phone !== undefined) dbPayload.phone = updates.phone;
    if (updates.image !== undefined) dbPayload.image = updates.image;
    if (updates.bio !== undefined) dbPayload.bio = updates.bio;
    if (updates.roles !== undefined) dbPayload.roles = updates.roles;
    if (updates.commissionRate !== undefined) dbPayload.commission_rate = updates.commissionRate;
    if (updates.approvedBy !== undefined) dbPayload.approved_by = updates.approvedBy;
    
    // NOTE: 'languages' is excluded from DB sync to avoid schema mismatch errors.
    // It remains supported in the frontend local state.

    const { error } = await supabase.from('users').update(dbPayload).eq('id', id);
    if (error) {
        console.error("Supabase User Update Error:", error);
        setUsers(prevUsers);
        alert(`Account update failed: ${error.message}`);
        return;
    }
    await refreshData();
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    const adminName = currentUser?.name.split('(')[0].trim() || 'Admin';
    const existing = bookings.find(b => b.id === id);
    if (!existing) return;

    let finalUpdates = { ...existing, ...updates };

    if (updates.status === 'completed' && updates.commissionAmount === undefined) {
      const trainer = users.find(u => u.id === existing.trainerId);
      const rate = trainer?.commissionRate || 25; 
      const gymCut = (existing.price * rate) / 100;
      finalUpdates.commissionAmount = gymCut;
      finalUpdates.trainerEarnings = existing.price - gymCut;
      finalUpdates.settledAt = new Date().toISOString();
      finalUpdates.settledBy = adminName;
    }

    const previousBookings = [...bookings];
    const newBookings = bookings.map(b => b.id === id ? { ...b, ...finalUpdates } : b);
    setBookings(newBookings);

    if (isDemoMode) {
      localStorage.setItem('classfit_bookings', JSON.stringify(newBookings));
      return;
    }

    // SAFE UPDATE: Only sending columns that are guaranteed to exist.
    const { error } = await supabase.from('bookings').update({
       status: finalUpdates.status,
       payment_method: finalUpdates.payment_method,
       booking_date: finalUpdates.date,
       booking_time: finalUpdates.time
    }).eq('id', id);
    
    if (error) {
       console.error("Supabase Booking Update Error:", error);
       setBookings(previousBookings); 
       alert(`Database Error: ${error.message}`);
       return;
    }
    
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
        let roles = data.roles || ['user'];
        if (data.email === MASTER_EMAIL || String(data.id) === MASTER_ID) {
           roles = Array.from(new Set([...roles, 'management', 'admin']));
        }

        const u: User = { 
          id: String(data.id), name: data.name, email: data.email, password: data.password, 
          roles: roles, phone: data.phone, image: data.image || DEFAULT_PROFILE_IMAGE, 
          bio: data.bio, joinedDate: data.joined_date, approvedBy: data.approved_by, 
          commissionRate: data.commission_rate || 25, blockedDates: data.blocked_dates || [],
          languages: data.languages || []
        };
        setCurrentUser(u); localStorage.setItem('classfit_user', JSON.stringify(u)); return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    if (isDemoMode) {
       const mock: User = { id: Math.random().toString(36).substr(2, 9), name, email, password: pass, roles: ['user'], joinedDate: new Date().toISOString(), image: DEFAULT_PROFILE_IMAGE };
       setUsers([...users, mock]); setCurrentUser(mock); localStorage.setItem('classfit_user', JSON.stringify(mock)); return true;
    }
    const { error } = await supabase.from('users').insert([{ name, email, password: pass, roles: ['user'] }]);
    if (error) throw error;
    return login(email, pass);
  };

  const registerTrainer = async (data: any) => {
    const fullName = `${data.name} (${data.specialty})`;
    const bioText = `Experience: ${data.experience || 'N/A'}\nCertifications: ${data.certs || 'N/A'}\nSocial: ${data.social || 'N/A'}\nMotivation: ${data.motivation || 'N/A'}\nLanguages: ${data.languages?.join(', ') || 'Bulgarian'}`;
    if (isDemoMode) {
       const u: User = { id: Math.random().toString(36).substr(2, 9), name: fullName, email: data.email, password: data.pass, phone: data.phone, bio: bioText, roles: ['user', 'trainer_pending'], joinedDate: new Date().toISOString(), image: DEFAULT_PROFILE_IMAGE, commissionRate: 25, languages: data.languages || [] };
       setUsers([...users, u]); return { success: true };
    }
    const { error } = await supabase.from('users').insert([{ name: fullName, email: data.email, phone: data.phone, password: data.pass, bio: bioText, roles: ['user', 'trainer_pending'], commission_rate: 25 }]);
    if (error) return { success: false, msg: error.message };
    await refreshData(); return { success: true };
  };

  const requestTrainerUpgrade = async (userId: string, currentName: string, phone: string, specialty: string) => {
    const formattedName = `${currentName} (${specialty})`;
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, msg: 'User not found' };
    const newRoles: UserRole[] = Array.from(new Set([...user.roles, 'trainer_pending' as UserRole]));
    if (isDemoMode) { 
      setUsers(users.map(u => u.id === userId ? { ...u, roles: newRoles, phone, name: formattedName } : u)); 
      return { success: true }; 
    }
    const { error } = await supabase.from('users').update({ roles: newRoles, name: formattedName, phone }).eq('id', userId);
    if (error) return { success: false, msg: error.message };
    await refreshData(); return { success: true };
  };

  const addReview = async (review: Omit<Review, 'id' | 'time'>) => {
    if (isDemoMode) {
      const newReview: Review = { ...review, id: Math.random().toString(36).substr(2, 9), time: new Date().toLocaleDateString(), avatar: review.author.charAt(0), isPublished: false };
      setReviews([newReview, ...reviews]);
      return;
    }
    const { error } = await supabase.from('reviews').insert([{ trainer_id: review.trainerId, author_name: review.author, rating: review.rating, content: review.text, is_ai_enhanced: review.isAiEnhanced, booking_id: review.bookingId, is_published: false }]);
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
    const checkInCode = booking.id.substring(0, 6).toUpperCase();
    if (isDemoMode) {
      setBookings([{ ...booking, checkInCode }, ...bookings]);
      return;
    }
    const { error } = await supabase.from('bookings').insert([{
      id: booking.id, check_in_code: checkInCode, trainer_id: booking.trainerId, user_id: booking.userId,
      customer_name: booking.customerName, customer_phone: booking.customerPhone, customer_email: booking.customerEmail,
      booking_date: booking.date, booking_time: booking.time, duration_mins: booking.duration, price: booking.price,
      status: booking.status, language: booking.language, gym_address: booking.gymAddress
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
      language, setLanguage, bookings, reviews, addBooking, addReview, updateReview, deleteReview, updateBooking, deleteBooking, isAdmin, isManagement, currentUser, users, login, register, registerTrainer, requestTrainerUpgrade, updateUser, deleteUser, logout, refreshData, isLoading, isDemoMode, confirmAction, confirmState, closeConfirm
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
