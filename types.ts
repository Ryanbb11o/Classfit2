
export type Language = 'bg' | 'en';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Note: In a real app, never store passwords in plain text/frontend
  joinedDate: string;
  role: 'user' | 'admin'; // <--- New field for security
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  price: number;
  image: string;
  phone: string; // New field for direct contact
  availability: string[]; // Mocked available hours e.g., ["09:00", "10:00"]
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  trainerId: string;
  userId?: string; // Link booking to a specific user account. Undefined if guest.
  customerName: string;
  customerPhone?: string; // New field for guest bookings
  customerEmail?: string; // New field for email notifications
  language?: Language; // Track language preference for notifications
  date: string; // ISO string
  time: string;
  price: number;
  status: BookingStatus;
  paymentMethod?: 'card' | 'cash';
}

export interface Membership {
  id: string;
  name: string;
  price: string;
  unit: string; // e.g., 'visit', 'month'
  features: string[];
  isPopular?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string; // New field for product details
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  time: string;
  avatar: string;
}
