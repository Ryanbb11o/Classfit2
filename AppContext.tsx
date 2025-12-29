
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
  registerTrainer: (name: string, email: string, pass: string, phone: string, specialty: string) => Promise<{ success: boolean; msg?: string }>;
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
        
        // Note: refreshData logic below now handles validation, but we still load initially for demo mode or offline
        const savedUser = localStorage.getItem('classfit_user');
        if (savedUser) {
           const parsedUser = JSON.parse(savedUser);
           // Only set if we haven't been logged out by refreshData validation logic
           if (localStorage.getItem('classfit_user')) {
             setCurrentUser(parsedUser);
           }
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
    if (isDemoMode) return;
    try {
      // 1. Fetch Bookings
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
      
      // 2. Fetch Users
      const { data: uData, error: uError } = await supabase.from('users').select('*');
      if (uError) throw uError;
      
      let mappedUsers: User[] = [];
      if (uData) {
        mappedUsers = uData.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          joinedDate: u.joined_date
        }));
        setUsers(mappedUsers);
      }

      // 3. Security Check: Validate Session
      // If a user is stored in local storage, check if they still exist in the database.
      const storedUserStr = localStorage.getItem('classfit_user');
      if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);
        // We check if the stored user ID exists in the freshly fetched users list
        const userExistsInDb = mappedUsers.some(u => u.id === storedUser.id);
        
        if (!userExistsInDb) {
          console.warn(`User session invalid: User ${storedUser.email} deleted from database. Logging out.`);
          logout(); // This clears localStorage and currentUser state
        }
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

  const registerTrainer = async (name: string, email: string, pass: string, phone: string, specialty: string): Promise<{ success: boolean; msg?: string }> => {
    if (isDemoMode) {
       // Mock trainer application
       return { success: true };
    }

    // Combine name with specialty for simple storage in MVP without schema migration
    // Or just store basic info. The Role is key.
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        name: `${name} (${specialty})`, 
        email, 
        password: pass, 
        role: 'trainer_pending' 
      }])
      .select()
      .single();

    if (error) {
        console.error("Trainer Reg Error", error);
        return { success: false, msg: error.message };
    }
    
    // We do NOT auto-login pending trainers
    await refreshData();
    return { success: true };
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

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, 
      bookings, addBooking, updateBooking, deleteBooking,
      isAdmin,
      currentUser, users, login, register, registerTrainer, deleteUser, logout, refreshData,
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
