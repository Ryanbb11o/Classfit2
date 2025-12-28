
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Booking, User } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';

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
  deleteUser: (id: string) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
  isLoading: boolean;
  isDemoMode: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('bg');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = currentUser?.role === 'admin';
  const isDemoMode = !isSupabaseConfigured;

  // Initial Data Fetch
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
        if (savedUser) setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        console.warn("Database Init Error:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    init();
  }, [isDemoMode]);

  const refreshData = async () => {
    if (isDemoMode) return;
    try {
      const { data: bData, error: bError } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (bError) throw bError;
      if (bData) {
        const mappedBookings: Booking[] = bData.map((b: any) => ({
          id: b.id,
          trainerId: b.trainer_id,
          userId: b.user_id,
          customerName: b.customer_name,
          customerPhone: b.customer_phone,
          customerEmail: b.customer_email,
          date: b.booking_date,
          time: b.booking_time,
          price: b.price,
          status: b.status,
          paymentMethod: b.payment_method,
          language: b.language
        }));
        setBookings(mappedBookings);
      }
      
      const { data: uData, error: uError } = await supabase.from('users').select('*');
      if (uError) throw uError;
      if (uData) {
        const mappedUsers: User[] = uData.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          joinedDate: u.joined_date
        }));
        setUsers(mappedUsers);
      }
    } catch (e) {
      console.error("Refresh failed:", e);
    }
  };

  const addBooking = async (booking: Booking) => {
    if (isDemoMode) {
      const newBookings = [booking, ...bookings];
      setBookings(newBookings);
      localStorage.setItem('classfit_bookings', JSON.stringify(newBookings));
      return;
    }

    const { error } = await supabase.from('bookings').insert([{
      trainer_id: booking.trainerId,
      user_id: booking.userId,
      customer_name: booking.customerName,
      customer_phone: booking.customerPhone,
      customer_email: booking.customerEmail,
      booking_date: booking.date,
      booking_time: booking.time,
      price: booking.price,
      status: booking.status,
      language: booking.language
    }]);

    if (error) throw error;
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

    const { error } = await supabase.from('bookings').update(dbUpdates).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const deleteBooking = async (id: string) => {
    if (isDemoMode) {
      const newBookings = bookings.filter(b => b.id !== id);
      setBookings(newBookings);
      localStorage.setItem('classfit_bookings', JSON.stringify(newBookings));
      return;
    }
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (isDemoMode) {
      const mockUser: User = { 
        id: 'demo-1', 
        name: 'Demo Admin', 
        email, 
        password: pass, 
        role: email.includes('admin') ? 'admin' : 'user',
        joinedDate: new Date().toISOString()
      };
      setCurrentUser(mockUser);
      localStorage.setItem('classfit_user', JSON.stringify(mockUser));
      return true;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', pass)
      .single();

    if (error || !data) return false;

    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      joinedDate: data.joined_date
    };

    setCurrentUser(user);
    localStorage.setItem('classfit_user', JSON.stringify(user));
    await refreshData();
    return true;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    if (isDemoMode) {
       const mockUser: User = { id: Math.random().toString(), name, email, password: pass, role: 'user', joinedDate: new Date().toISOString() };
       setCurrentUser(mockUser);
       localStorage.setItem('classfit_user', JSON.stringify(mockUser));
       return true;
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password: pass, role: 'user' }])
      .select()
      .single();

    if (error || !data) return false;

    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      joinedDate: data.joined_date
    };

    setCurrentUser(user);
    localStorage.setItem('classfit_user', JSON.stringify(user));
    await refreshData();
    return true;
  };

  const deleteUser = async (id: string) => {
    if (isDemoMode) {
      const newUsers = users.filter(u => u.id !== id);
      setUsers(newUsers);
      localStorage.setItem('classfit_users', JSON.stringify(newUsers));
      return;
    }
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('classfit_user');
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, 
      bookings, addBooking, updateBooking, deleteBooking,
      isAdmin,
      currentUser, users, login, register, deleteUser, logout, refreshData,
      isLoading,
      isDemoMode
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
