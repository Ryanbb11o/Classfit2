
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
  approvedBy?: string; 
  commissionRate?: number; 
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
  checkInCode: string; // 6-digit verification code
  trainerId: string;
  userId?: string; 
  customerName: string;
  customerPhone?: string; 
  customerEmail?: string; 
  language?: Language; 
  date: string; 
  time: string;
  duration: number; // in minutes
  price: number;
  status: BookingStatus;
  paymentMethod?: 'card' | 'cash';
  commissionAmount?: number;
  gymAddress?: string;
  hasBeenReviewed?: boolean;
  rating?: number;
  reviewText?: string;
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
