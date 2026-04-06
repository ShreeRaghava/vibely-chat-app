import { Session } from 'next-auth';

// Extended User type for session
export interface ExtendedUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  isPremium?: boolean;
  premiumExpiry?: Date;
}

// Extended Session type
export interface ExtendedSession extends Session {
  user: ExtendedUser;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  isPremium: boolean;
  premiumPlan?: 'location' | 'premium';
  premiumExpiry?: Date;
  autoRenew: boolean;
  chatsCount: number;
  reportsReceived: number;
  banned: boolean;
  friends: string[];
  createdAt: Date;
}

// Chat types
export interface Chat {
  _id: string;
  participants: string[];
  messages: ChatMessage[];
  startedAt: Date;
  endedAt?: Date;
  roomId: string;
  location?: string;
  gender?: string;
}

export interface ChatMessage {
  sender: string;
  content: string;
  timestamp: Date;
}

// Match Request types
export interface MatchRequest {
  _id: string;
  user: string;
  roomId: string;
  chatType: 'text' | 'video';
  gender?: string;
  location?: string;
  createdAt: Date;
}

// Report types
export interface Report {
  _id: string;
  reporter: string;
  reportedUser: string;
  reason: string;
  chatId?: string;
  createdAt: Date;
}

// Payment types
export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  planType: 'location' | 'premium';
  gateway: 'razorpay';
}

export interface PaymentStatus {
  isPremium: boolean;
  plan?: 'location' | 'premium';
  expiry?: Date;
  autoRenew: boolean;
  isExpired: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  name?: string;
  image?: string;
}

export interface FilterPreferences {
  gender?: string;
  location?: string;
  chatType: 'text' | 'video';
}

// Notification types
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}
