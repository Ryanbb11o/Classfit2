
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Booking, User } from './types';
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
  addBooking: (booking: Booking) => Promise<void>;
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  isAdmin: boolean;
  currentUser: User | null;
  users: User[];
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  registerTrainer: (name: string, email: string, pass: string, phone: string, specialty: string) => Promise<{ success: boolean; msg?: string }>;
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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('bg');
  const [bookings, setBookings] = useState<Booking[]>([]);
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
          if (localBookings) setBookings(JSON.parse(localBookings));
          if (localUsers) setUsers(JSON.parse(localUsers));
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
      if (localBookings) setBookings(JSON.parse(localBookings));
      if (localUsers) setUsers(JSON.parse(localUsers));
      return;
    }

    try {
      const { data: bData, error: bError } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (bError) throw bError;
      if (bData) {
        setBookings(bData.map((b: any) => ({
          id: b.id,
          checkInCode: b.check_in_code || b.id.substring(0, 6).toUpperCase(),
          trainerId: b.trainer_id,
          userId: b.user_id,
          customerName: b.customer_name,
          customerPhone: b.customer_phone,
          customerEmail: b.customer_email,
          date: b.booking_date,
          time: b.booking_time,
          duration: b.duration_mins || 60,
          price: b.price,
          status: b.status,
          paymentMethod: b.payment_method,
          language: b.language,
          commissionAmount: b.commission_amount,
          gymAddress: b.gym_address || 'бул. „Осми приморски полк“ 128 (Спирка МИР)',
          hasBeenReviewed: b.has_been_reviewed || false,
          rating: b.rating,
          reviewText: b.review_text,
          isAiEnhanced: b.is_ai_enhanced || false
        })));
      }
      
      const { data: uData, error: uError } = await supabase.from('users').select('*');
      if (uError) throw uError;
      if (uData) {
        const mappedUsers = uData.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          phone: u.phone,
          image: u.image || DEFAULT_PROFILE_IMAGE, 
          bio: u.bio,     
          joinedDate: u.joined_date,
          approvedBy: u.approved_by,
          commissionRate: u.commission_rate || 0
        }));
        setUsers(mappedUsers);
        const storedUserStr = localStorage.getItem('classfit_user');
        if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          const latestUserData = mappedUsers.find(u => u.id === storedUser.id);
          if (latestUserData) {
            setCurrentUser(latestUserData);
            localStorage.setItem('classfit_user', JSON.stringify(latestUserData));
          }
        }
      }
    } catch (e) {
      console.error("Refresh failed:", e);
    }
  };

  const addBooking = async (booking: Booking) => {
    const checkInCode = booking.id.substring(0, 6).toUpperCase();
    const gymAddress = 'бул. „Осми приморски полк“ 128 (Спирка МИР)';
    
    if (isDemoMode) {
      const bookingWithCode = { ...booking, checkInCode, gymAddress };
      const newBookings = [bookingWithCode, ...bookings];
      setBookings(newBookings);
      localStorage.setItem('classfit_bookings', JSON.stringify(newBookings));
      return;
    }

    const payload = {
      id: booking.id,
      check_in_code: checkInCode,
      trainer_id: booking.trainerId,
      user_id: booking.userId || null,
      customer_name: booking.customerName,
      customer_phone: booking.customerPhone || null,
      customer_email: booking.customerEmail || null,
      booking_date: booking.date,
      booking_time: booking.time,
      duration_mins: booking.duration || 60,
      price: booking.price,
      status: booking.status || 'pending',
      language: booking.language || 'bg',
      gym_address: gymAddress
    };

    const { error } = await supabase.from('bookings').insert([payload]);
    if (error) {
      console.error("Supabase Error details:", error.message, error.details, error.hint);
      throw new Error(error.message);
    }
    await refreshData();
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    if (isDemoMode) {
      const newBookings = bookings.map(b => b.id === id ? { ...b, ...updates } : b);
      setBookings(newBookings);
      localStorage.setItem('classfit_bookings', JSON.stringify(newBookings));
      return;
    }
    
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;
    if (updates.commissionAmount !== undefined) dbUpdates.commission_amount = updates.commissionAmount;
    if (updates.hasBeenReviewed !== undefined) dbUpdates.has_been_reviewed = updates.hasBeenReviewed;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.reviewText !== undefined) dbUpdates.review_text = updates.reviewText;
    if (updates.isAiEnhanced !== undefined) dbUpdates.is_ai_enhanced = updates.isAiEnhanced;

    const { error } = await supabase.from('bookings').update(dbUpdates).eq('id', id);
    if (error) {
      console.error("Booking Update Error:", error);
      throw error;
    }
    await refreshData();
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (isDemoMode) {
        const newUsers = users.map(u => u.id === id ? { ...u, ...updates } : u);
        setUsers(newUsers);
        localStorage.setItem('classfit_users', JSON.stringify(newUsers));
        if (currentUser?.id === id) {
           const updatedUser = { ...currentUser, ...updates };
           setCurrentUser(updatedUser);
           localStorage.setItem('classfit_user', JSON.stringify(updatedUser));
        }
        return;
    }
    const dbUpdates: any = {};
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy;
    if (updates.commissionRate !== undefined) dbUpdates.commission_rate = updates.commissionRate;
    
    const { error } = await supabase.from('users').update(dbUpdates).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const deleteUser = async (id: string) => {
    if (isDemoMode) {
      const newUsers = users.filter(u => u.id !== id);
      setUsers(newUsers);
      localStorage.setItem('classfit_users', JSON.stringify(newUsers));
      return;
    }
    await supabase.from('users').delete().eq('id', id);
    await refreshData();
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (isDemoMode) {
      const existingUser = users.find(u => u.email === email && u.password === pass);
      if (existingUser) {
          setCurrentUser(existingUser);
          localStorage.setItem('classfit_user', JSON.stringify(existingUser));
          return true;
      }
      return false;
    }
    const { data } = await supabase.from('users').select('*').eq('email', email).eq('password', pass).single();
    if (data) {
        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          phone: data.phone,
          image: data.image || DEFAULT_PROFILE_IMAGE,
          bio: data.bio,
          joinedDate: data.joined_date,
          approvedBy: data.approved_by,
          commissionRate: data.commission_rate || 0
        };
        setCurrentUser(user);
        localStorage.setItem('classfit_user', JSON.stringify(user));
        await refreshData();
        return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    if (isDemoMode) {
       const mockUser: User = { 
        id: Math.random().toString(36).substr(2, 9), 
        name, email, password: pass, role: 'user', joinedDate: new Date().toISOString(), image: DEFAULT_PROFILE_IMAGE
       };
       const newUsers = [...users, mockUser];
       localStorage.setItem('classfit_users', JSON.stringify(newUsers));
       setUsers(newUsers);
       setCurrentUser(mockUser);
       localStorage.setItem('classfit_user', JSON.stringify(mockUser));
       return true;
    }
    const { data, error } = await supabase.from('users').insert([{ name, email, password: pass, role: 'user' }]).select().single();
    if (error) throw error;
    await refreshData();
    return true;
  };

  const registerTrainer = async (name: string, email: string, pass: string, phone: string, specialty: string): Promise<{ success: boolean; msg?: string }> => {
    if (isDemoMode) {
       const newUser: User = { 
        id: Math.random().toString(36).substr(2, 9), 
        name: `${name} (${specialty})`, 
        email, password: pass, phone, role: 'trainer_pending', joinedDate: new Date().toISOString(), image: DEFAULT_PROFILE_IMAGE, commissionRate: 25
       };
       const newUsers = [...users, newUser];
       localStorage.setItem('classfit_users', JSON.stringify(newUsers));
       setUsers(newUsers);
       return { success: true };
    }
    const { error } = await supabase.from('users').insert([{ name: `${name} (${specialty})`, email, phone, password: pass, role: 'trainer_pending', commission_rate: 25 }]).select().single();
    if (error) return { success: false, msg: error.message };
    await refreshData();
    return { success: true };
  };

  const requestTrainerUpgrade = async (userId: string, currentName: string, phone: string, specialty: string): Promise<{ success: boolean; msg?: string }> => {
    const formattedName = `${currentName} (${specialty})`;
    if (isDemoMode) {
        const newUsers = users.map(u => u.id === userId ? { ...u, role: 'trainer_pending' as const, phone, name: formattedName, commissionRate: 25 } : u);
        setUsers(newUsers);
        localStorage.setItem('classfit_users', JSON.stringify(newUsers));
        return { success: true };
    }
    const { error } = await supabase.from('users').update({ role: 'trainer_pending', name: formattedName, phone, commission_rate: 25 }).eq('id', userId);
    if (error) return { success: false, msg: error.message };
    await refreshData();
    return { success: true };
  };

  const deleteBooking = async (id: string) => {
    if (isDemoMode) {
      const newBookings = bookings.filter(b => b.id !== id);
      setBookings(newBookings);
      localStorage.setItem('classfit_bookings', JSON.stringify(newBookings));
      return;
    }
    await supabase.from('bookings').delete().eq('id', id);
    await refreshData();
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, bookings, addBooking, updateBooking, deleteBooking, isAdmin, currentUser, users, login, register, registerTrainer, requestTrainerUpgrade, updateUser, deleteUser, logout, refreshData, isLoading, isDemoMode, confirmAction, confirmState, closeConfirm
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
