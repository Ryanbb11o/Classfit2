
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Booking, User } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { DEFAULT_PROFILE_IMAGE } from './constants';

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
          if (localUsers) {
            const parsedUsers = JSON.parse(localUsers);
            const mappedDemoUsers = parsedUsers.map((u: User) => ({
                ...u,
                image: u.image || (u.role !== 'admin' ? DEFAULT_PROFILE_IMAGE : '')
            }));
            setUsers(mappedDemoUsers);
          }
        }
        
        const savedUser = localStorage.getItem('classfit_user');
        if (savedUser) {
           const parsedUser = JSON.parse(savedUser);
           if (parsedUser) {
             parsedUser.image = parsedUser.image || (parsedUser.role !== 'admin' ? DEFAULT_PROFILE_IMAGE : '');
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

  // Supabase Realtime Subscription (Notifications)
  useEffect(() => {
    if (isDemoMode) return;

    // Subscribe to changes in public tables to update Admin UI instantly
    const channel = supabase.channel('public:db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
         refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
         refreshData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isDemoMode]);

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('classfit_user');
  };

  const refreshData = async () => {
    if (isDemoMode) {
      // ... (keep demo logic same for development safety) ...
      const localBookings = localStorage.getItem('classfit_bookings');
      const localUsers = localStorage.getItem('classfit_users');
      
      if (localBookings) setBookings(JSON.parse(localBookings));
      if (localUsers) {
          const parsed = JSON.parse(localUsers);
          setUsers(parsed.map((u: User) => ({
             ...u,
             image: u.image || (u.role !== 'admin' ? DEFAULT_PROFILE_IMAGE : '')
          })));
      }
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
          image: u.image || (u.role !== 'admin' ? DEFAULT_PROFILE_IMAGE : ''), 
          bio: u.bio,     
          joinedDate: u.joined_date
        }));
        setUsers(mappedUsers);
      }

      // Security Check
      const storedUserStr = localStorage.getItem('classfit_user');
      if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);
        if (mappedUsers.length > 0) {
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
      const existingUser = users.find(u => u.email === email && u.password === pass);
      let mockUser: User;
      if (existingUser) {
          mockUser = existingUser;
      } else {
          mockUser = { 
            id: 'demo-1', 
            name: 'Demo Admin', 
            email, 
            password: pass, 
            role: email.includes('admin') ? 'admin' : 'user',
            joinedDate: new Date().toISOString()
          };
      }
      mockUser.image = mockUser.image || (mockUser.role !== 'admin' ? DEFAULT_PROFILE_IMAGE : '');
      setCurrentUser(mockUser);
      localStorage.setItem('classfit_user', JSON.stringify(mockUser));
      return true;
    }

    // 1. Try normal login against DB
    const { data, error } = await supabase.from('users').select('*').eq('email', email).eq('password', pass).single();

    if (data) {
        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          phone: data.phone,
          image: data.image || (data.role !== 'admin' ? DEFAULT_PROFILE_IMAGE : ''),
          bio: data.bio,
          joinedDate: data.joined_date
        };
        setCurrentUser(user);
        localStorage.setItem('classfit_user', JSON.stringify(user));
        await refreshData();
        return true;
    }

    // 2. BOOTSTRAP: If login failed, check if this is the "Bootstrap Admin" credentials
    // AND if the database currently has NO admins.
    if (email === 'admin@classfit.bg' && pass === 'admin123') {
        const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');
        
        // If no admins exist, create the first one automatically
        if (!admins || admins.length === 0) {
            const { data: newAdmin, error: createError } = await supabase.from('users').insert([{
                name: 'Master Admin',
                email: email,
                password: pass,
                role: 'admin',
                image: DEFAULT_PROFILE_IMAGE
            }]).select().single();

            if (newAdmin && !createError) {
                const user: User = {
                    id: newAdmin.id,
                    name: newAdmin.name,
                    email: newAdmin.email,
                    password: newAdmin.password,
                    role: newAdmin.role,
                    phone: newAdmin.phone,
                    image: newAdmin.image || DEFAULT_PROFILE_IMAGE,
                    joinedDate: newAdmin.joined_date
                };
                setCurrentUser(user);
                localStorage.setItem('classfit_user', JSON.stringify(user));
                await refreshData();
                return true;
            }
        }
    }

    return false;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    if (isDemoMode) {
       const mockUser: User = { 
        id: Math.random().toString(36).substr(2, 9), 
        name, 
        email, 
        password: pass, 
        role: 'user', 
        joinedDate: new Date().toISOString(),
        image: DEFAULT_PROFILE_IMAGE
       };
       const newUsers = [...users, mockUser];
       localStorage.setItem('classfit_users', JSON.stringify(newUsers));
       setUsers(newUsers);
       setCurrentUser(mockUser);
       localStorage.setItem('classfit_user', JSON.stringify(mockUser));
       return true;
    }

    const { data, error } = await supabase.from('users').insert([{ name, email, password: pass, role: 'user' }]).select().single();
    if (error || !data) return false;
    const user: User = {
      id: data.id, name: data.name, email: data.email, password: data.password, role: data.role, phone: data.phone, joinedDate: data.joined_date, image: DEFAULT_PROFILE_IMAGE
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
        joinedDate: new Date().toISOString(),
        image: DEFAULT_PROFILE_IMAGE
       };
       const newUsers = [...users, newUser];
       localStorage.setItem('classfit_users', JSON.stringify(newUsers));
       setUsers(newUsers);
       return { success: true };
    }
    const { error } = await supabase.from('users').insert([{ name: `${name} (${specialty})`, email, phone, password: pass, role: 'trainer_pending' }]).select().single();
    if (error) return { success: false, msg: error.message };
    await refreshData();
    return { success: true };
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (isDemoMode) {
        const newUsers = users.map(u => u.id === id ? { ...u, ...updates } : u);
        setUsers(newUsers);
        localStorage.setItem('classfit_users', JSON.stringify(newUsers));
        if (currentUser && currentUser.id === id) {
           const updatedUser = { ...currentUser, ...updates };
           updatedUser.image = updatedUser.image || (updatedUser.role !== 'admin' ? DEFAULT_PROFILE_IMAGE : '');
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
