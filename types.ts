
export type Language = 'bg' | 'en';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; 
  phone?: string; 
  image?: string; 
  bio?: string;   
  joinedDate: string;
  role: 'user' | 'admin' | 'trainer_pending' | 'trainer';
  approvedBy?: string; // ID or Name of admin who approved the trainer
  commissionRate?: number; // Percentage (e.g., 20 for 20%)
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  price: number;
  image: string;
  phone: string; 
  bio?: string; 
  availability: string[]; 
  commissionRate?: number;
  approvedBy?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'trainer_completed';

export interface Booking {
  id: string;
  trainerId: string;
  userId?: string; 
  customerName: string;
  customerPhone?: string; 
  customerEmail?: string; 
  language?: Language; 
  date: string; 
  time: string;
  price: number;
  status: BookingStatus;
  paymentMethod?: 'card' | 'cash';
  commissionAmount?: number; // Calculated at completion
}

export interface Membership {
  id: string;
  name: string;
  price: string;
  unit: string; 
  features: string[];
  isPopular?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string; 
}

export interface Review {
  id: string;
  trainerId?: string; 
  author: string;
  rating: number;
  text: string;
  time: string;
  avatar: string;
}
