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
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
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
        if (savedUser) {
           const parsedUser = JSON.parse(savedUser);
           if (parsedUser) {
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

  // Sync across tabs in Demo Mode
  useEffect(() => {
    if (!isDemoMode) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'classfit_bookings' && e.newValue) {
         setBookings(JSON.parse(e.newValue));
      }
      if (e.key === 'classfit_users' && e.newValue) {
         setUsers(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isDemoMode]);

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('classfit_user');
  };

  const refreshData = async () => {
    if (isDemoMode) {
      // Force refresh from local storage
      const localBookings = localStorage.getItem('classfit_bookings');
      const localUsers = localStorage.getItem('classfit_users');
      if (localBookings) setBookings(JSON.parse(localBookings));
      if (localUsers) setUsers(JSON.parse(localUsers));
      return;
    }

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
          phone: u.phone,
          image: u.image, // Map image
          bio: u.bio,     // Map bio
          joinedDate: u.joined_date
        }));
        setUsers(mappedUsers);
      }

      // 3. Security Check: Validate Session and Update Current User Data
      const storedUserStr = localStorage.getItem('classfit_user');
      if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);
        // Only update if we successfully fetched users
        if (mappedUsers.length > 0) {
            const latestUserData = mappedUsers.find(u => u.id === storedUser.id);
            
            if (latestUserData) {
              // Update session with latest data
              setCurrentUser(latestUserData);
              localStorage.setItem('classfit_user', JSON.stringify(latestUserData));
            } else {
              // Only logout if we are sure the user list is complete and this user is missing
              // For now, we avoid auto-logout to prevent flickering if RLS hides users
              console.warn("User not found in latest refresh, but keeping session active to prevent flicker.");
            }
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
      // Check if user exists in local 'db' first
      const existingUser = users.find(u => u.email === email && u.password === pass);
      
      let mockUser: User;
      if (existingUser) {
          mockUser = existingUser;
      } else {
          // Fallback for "admin" quick login in demo
          mockUser = { 
            id: 'demo-1', 
            name: 'Demo Admin', 
            email, 
            password: pass, 
            role: email.includes('admin') ? 'admin' : 'user',
            joinedDate: new Date().toISOString()
          };
      }
      
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
      phone: data.phone,
      image: data.image,
      bio: data.bio,
      joinedDate: data.joined_date
    };

    setCurrentUser(user);
    localStorage.setItem('classfit_user', JSON.stringify(user));
    await refreshData();
    return true;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    if (isDemoMode) {
       const mockUser: User = { 
        id: Math.random().toString(36).substr(2, 9), 
        name, 
        email, 
        password: pass, 
        role: 'user', 
        joinedDate: new Date().toISOString() 
       };
       
       const currentUsersStr = localStorage.getItem('classfit_users');
       let currentUsers: User[] = [];
       try { currentUsers = currentUsersStr ? JSON.parse(currentUsersStr) : []; } catch(e) {}
       
       const newUsers = [...currentUsers, mockUser];
       localStorage.setItem('classfit_users', JSON.stringify(newUsers));
       setUsers(newUsers);

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
      phone: data.phone,
      joinedDate: data.joined_date
    };

    setCurrentUser(user);
    localStorage.setItem('classfit_user', JSON.stringify(user));
    await refreshData();
    return true;
  };

  const registerTrainer = async (name: string, email: string, pass: string, phone: string, specialty: string): Promise<{ success: boolean; msg?: string }> => {
    if (isDemoMode) {
       const newUser: User = { 
        id: Math.random().toString(36).substr(2, 9), 
        name: `${name} (${specialty})`, 
        email, 
        password: pass, 
        phone,
        role: 'trainer_pending',
        joinedDate: new Date().toISOString()
       };

       // Robust read from localStorage
       const currentUsersStr = localStorage.getItem('classfit_users');
       let currentUsers: User[] = [];
       try {
         currentUsers = currentUsersStr ? JSON.parse(currentUsersStr) : [];
       } catch (e) {
         currentUsers = [];
       }
       
       const newUsers = [...currentUsers, newUser];
       localStorage.setItem('classfit_users', JSON.stringify(newUsers));
       setUsers(newUsers);

       return { success: true };
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        name: `${name} (${specialty})`, 
        email, 
        phone,
        password: pass, 
        role: 'trainer_pending' 
      }])
      .select()
      .single();

    if (error) {
        console.error("Trainer Reg Error", error);
        return { success: false, msg: error.message };
    }
    
    await refreshData();
    return { success: true };
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (isDemoMode) {
        const newUsers = users.map(u => u.id === id ? { ...u, ...updates } : u);
        setUsers(newUsers);
        localStorage.setItem('classfit_users', JSON.stringify(newUsers));
        
        // Update current session if it's the current user
        if (currentUser && currentUser.id === id) {
           const updatedUser = { ...currentUser, ...updates };
           setCurrentUser(updatedUser);
           localStorage.setItem('classfit_user', JSON.stringify(updatedUser));
        }
        return;
    }

    const dbUpdates: any = {};
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.image) dbUpdates.image = updates.image;
    if (updates.bio) dbUpdates.bio = updates.bio;

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
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, 
      bookings, addBooking, updateBooking, deleteBooking,
      isAdmin,
      currentUser, users, login, register, registerTrainer, updateUser, deleteUser, logout, refreshData,
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