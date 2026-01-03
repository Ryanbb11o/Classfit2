
export type Language = 'bg' | 'en';

export type UserRole = 'user' | 'admin' | 'trainer_pending' | 'trainer' | 'management';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; 
  phone?: string; 
  image?: string; 
  bio?: string;   
  joinedDate: string;
  roles: UserRole[]; 
  approvedBy?: string; 
  commissionRate?: number; // % that the gym takes
  languages?: string[];
  blockedDates?: string[]; // Dates the trainer is unavailable
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
  languages?: string[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'trainer_completed';

export interface Booking {
  id: string;
  checkInCode: string;
  trainerId: string;
  userId?: string; 
  customerName: string;
  customerPhone?: string; 
  customerEmail?: string; 
  language?: Language; 
  date: string; 
  time: string;
  duration: number;
  price: number;
  status: BookingStatus;
  paymentMethod?: 'card' | 'cash';
  commissionAmount?: number; // What the gym makes
  trainerEarnings?: number; // What the trainer makes
  gymAddress?: string;
  hasBeenReviewed?: boolean;
  settledAt?: string; // Timestamp of admin settlement
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
  avatar?: string;
  isAiEnhanced?: boolean;
  bookingId?: string;
  isPublished?: boolean;
}
