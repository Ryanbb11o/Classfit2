
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Booking, User, Review } from './types';
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

const parseBioField = (bio: string | undefined, key: string) => {
  if (!bio) return '';
  const regex = new RegExp(`${key}: (.*)(\\n|$)`, 'i');
  const match = bio.match(regex);
  return match ? match[1].trim() : '';
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('bg');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmState, setConfirmState] = useState<ConfirmConfig | null>(null);

  const isAdmin = currentUser?.role === 'admin';
  const isDemoMode = !isSupabaseConfigured;

  const confirmAction = (config: ConfirmConfig) => setConfirmState(config);
  const closeConfirm = () => setConfirmState(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        if (!isDemoMode) {
          await refreshData();
        } else {
          const localBookings = localStorage.getItem('classfit_bookings');
          const localUsers = localStorage.getItem('classfit_users');
          const localReviews = localStorage.getItem('classfit_reviews');
          if (localBookings) setBookings(JSON.parse(localBookings));
          if (localUsers) setUsers(JSON.parse(localUsers));
          if (localReviews) setReviews(JSON.parse(localReviews));
        }
        const savedUser = localStorage.getItem('classfit_user');
        if (savedUser) {
           const parsedUser = JSON.parse(savedUser);
           if (parsedUser) setCurrentUser(parsedUser);
        }
      } catch (err) {
        console.warn("Database Init Error:", err);
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
      if (bData) {
        setBookings(bData.map((b: any) => ({
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
          hasBeenReviewed: b.has_been_reviewed || false
        })));
      }

      const { data: rData } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (rData) {
        setReviews(rData.map((r: any) => ({
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
      }
      
      const { data: uData } = await supabase.from('users').select('*').order('joined_date', { ascending: false });
      if (uData) {
        setUsers(uData.map((u: any) => {
          const langString = parseBioField(u.bio, 'Languages');
          const langs = langString ? langString.split(',').map(s => s.trim()) : [];
          return {
            id: String(u.id),
            name: u.name || 'User',
            email: u.email || '',
            password: u.password || '',
            role: u.role || 'user',
            phone: u.phone,
            image: u.image || DEFAULT_PROFILE_IMAGE, 
            bio: u.bio,     
            joinedDate: u.joined_date || new Date().toISOString(),
            approvedBy: u.approved_by,
            commissionRate: u.commission_rate || 0,
            languages: langs,
            blockedDates: u.blocked_dates || []
          };
        }));
      }
    } catch (e) {
      console.error("Refresh failed:", e);
    }
  };

  const addBooking = async (booking: Booking) => {
    const checkInCode = booking.id.substring(0, 6).toUpperCase();
    if (isDemoMode) {
      const newBookings = [{ ...booking, checkInCode }, ...bookings];
      setBookings(newBookings);
      localStorage.setItem('classfit_bookings', JSON.stringify(newBookings));
      return;
    }
    const { error } = await supabase.from('bookings').insert([{
      id: booking.id,
      check_in_code: checkInCode,
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
      gym_address: booking.gymAddress
    }]);
    if (error) throw error;
    await refreshData();
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    let finalUpdates = { ...updates };
    
    // Automatic Financial Split Calculation
    if (updates.status === 'completed') {
      const booking = bookings.find(b => b.id === id);
      const trainer = users.find(u => u.id === booking?.trainerId);
      if (booking && trainer) {
        const rate = trainer.commissionRate || 25; // Default 25% gym commission
        const gymCut = (booking.price * rate) / 100;
        const trainerCut = booking.price - gymCut;
        finalUpdates.commissionAmount = gymCut;
        finalUpdates.trainerEarnings = trainerCut;
      }
    }

    if (isDemoMode) {
      const newBookings = bookings.map(b => b.id === id ? { ...b, ...finalUpdates } : b);
      setBookings(newBookings);
      localStorage.setItem('classfit_bookings', JSON.stringify(newBookings));
      return;
    }

    const dbUpdates: any = {};
    if (finalUpdates.status) dbUpdates.status = finalUpdates.status;
    if (finalUpdates.paymentMethod) dbUpdates.payment_method = finalUpdates.paymentMethod;
    if (finalUpdates.hasBeenReviewed !== undefined) dbUpdates.has_been_reviewed = finalUpdates.hasBeenReviewed;
    if (finalUpdates.commissionAmount !== undefined) dbUpdates.commission_amount = finalUpdates.commissionAmount;
    if (finalUpdates.trainerEarnings !== undefined) dbUpdates.trainer_earnings = finalUpdates.trainerEarnings;
    
    const { error } = await supabase.from('bookings').update(dbUpdates).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (isDemoMode) {
        const newUsers = users.map(u => u.id === id ? { ...u, ...updates } : u);
        setUsers(newUsers);
        localStorage.setItem('classfit_users', JSON.stringify(newUsers));
        if (currentUser?.id === id) {
           const updated = { ...currentUser, ...updates };
           setCurrentUser(updated);
           localStorage.setItem('classfit_user', JSON.stringify(updated));
        }
        return;
    }

    const dbUpdates: any = { ...updates };
    // Map to camelCase or direct if matching
    const { error } = await supabase.from('users').update(dbUpdates).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  // Remaining CRUD operations... (addReview, updateReview, deleteReview, deleteBooking, deleteUser, login, register, registerTrainer, requestTrainerUpgrade)
  // ... (Same as before but keeping refreshData calls)

  const addReview = async (review: Omit<Review, 'id' | 'time'>) => {
    if (isDemoMode) {
      const newReview: Review = { ...review, id: Math.random().toString(36).substr(2, 9), time: new Date().toLocaleDateString(), avatar: review.avatar || review.author.charAt(0), isPublished: false };
      const newReviews = [newReview, ...reviews];
      setReviews(newReviews);
      localStorage.setItem('classfit_reviews', JSON.stringify(newReviews));
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

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (isDemoMode) {
      const u = users.find(u => u.email === email && u.password === pass);
      if (u) { setCurrentUser(u); localStorage.setItem('classfit_user', JSON.stringify(u)); return true; }
      return false;
    }
    const { data } = await supabase.from('users').select('*').eq('email', email).eq('password', pass).maybeSingle();
    if (data) {
        const u: User = { id: String(data.id), name: data.name, email: data.email, password: data.password, role: data.role, phone: data.phone, image: data.image || DEFAULT_PROFILE_IMAGE, bio: data.bio, joinedDate: data.joined_date, approvedBy: data.approved_by, commissionRate: data.commission_rate || 0, languages: [], blockedDates: data.blocked_dates || [] };
        setCurrentUser(u); localStorage.setItem('classfit_user', JSON.stringify(u)); return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    if (isDemoMode) {
       const mock: User = { id: Math.random().toString(36).substr(2, 9), name, email, password: pass, role: 'user', joinedDate: new Date().toISOString(), image: DEFAULT_PROFILE_IMAGE, languages: [] };
       setUsers([...users, mock]); setCurrentUser(mock); localStorage.setItem('classfit_user', JSON.stringify(mock)); return true;
    }
    const { error } = await supabase.from('users').insert([{ name, email, password: pass, role: 'user' }]);
    if (error) throw error;
    return login(email, pass);
  };

  const registerTrainer = async (data: any) => {
    const fullName = `${data.name} (${data.specialty})`;
    const bioText = `Experience: ${data.experience || 'N/A'}\nCertifications: ${data.certs || 'N/A'}\nSocial: ${data.social || 'N/A'}\nMotivation: ${data.motivation || 'N/A'}\nLanguages: ${data.languages?.join(', ') || 'Bulgarian'}`;
    if (isDemoMode) {
       const u: User = { id: Math.random().toString(36).substr(2, 9), name: fullName, email: data.email, password: data.pass, phone: data.phone, bio: bioText, role: 'trainer_pending', joinedDate: new Date().toISOString(), image: DEFAULT_PROFILE_IMAGE, languages: data.languages || [] };
       setUsers([...users, u]); return { success: true };
    }
    const { error } = await supabase.from('users').insert([{ name: fullName, email: data.email, phone: data.phone, password: data.pass, bio: bioText, role: 'trainer_pending' }]);
    if (error) return { success: false, msg: error.message };
    await refreshData(); return { success: true };
  };

  const requestTrainerUpgrade = async (userId: string, currentName: string, phone: string, specialty: string) => {
    const formattedName = `${currentName} (${specialty})`;
    if (isDemoMode) { setUsers(users.map(u => u.id === userId ? { ...u, role: 'trainer_pending' as const, phone, name: formattedName } : u)); return { success: true }; }
    const { error } = await supabase.from('users').update({ role: 'trainer_pending', name: formattedName, phone }).eq('id', userId);
    if (error) return { success: false, msg: error.message };
    await refreshData(); return { success: true };
  };

  const deleteBooking = async (id: string) => {
    if (isDemoMode) { setBookings(bookings.filter(b => b.id !== id)); return; }
    await supabase.from('bookings').delete().eq('id', id);
    await refreshData();
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, bookings, reviews, addBooking, addReview, updateReview, deleteReview, updateBooking, deleteBooking, isAdmin, currentUser, users, login, register, registerTrainer, requestTrainerUpgrade, updateUser, deleteUser, logout, refreshData, isLoading, isDemoMode, confirmAction, confirmState, closeConfirm
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
