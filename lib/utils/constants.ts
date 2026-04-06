// App constants
export const APP_NAME = 'Meet-New-Make-New';
export const APP_DESCRIPTION = 'Connect with strangers through anonymous chat';

// Payment plans
export const PAYMENT_PLANS = {
  location: {
    name: 'Location Filter',
    price: 110,
    currency: 'INR',
    duration: 'month',
    features: ['Filter by location', '30 day access'],
  },
  premium: {
    name: 'Premium',
    price: 220,
    currency: 'INR',
    duration: 'month',
    features: [
      'Filter by location & gender',
      'No ads',
      'Priority matching',
      '30 day access',
    ],
  },
};

// Payment gateways
export const PAYMENT_GATEWAYS = {
  RAZORPAY: 'razorpay',
};

// Chat types
export const CHAT_TYPES = {
  TEXT: 'text',
  VIDEO: 'video',
};

// Gender options
export const GENDERS = ['male', 'female', 'other'];

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  LOBBY: '/lobby',
  MATCHING: '/matching',
  ROOM: '/room',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  FRIENDS: '/friends',
  PREMIUM: '/premium',
  ADMIN: '/admin',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_FAILURE: '/payment/failure',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  SIGNUP: '/api/signup',
  USER: '/api/user',
  FRIENDS: '/api/friends',
  MATCH: '/api/match',
  PAYMENT: '/api/payment',
  ADMIN: '/api/admin',
};

// Session and storage
export const STORAGE_KEYS = {
  ROOM_ID: 'vibely_room_id',
  CHAT_MESSAGES: 'vibely_chat_messages',
  USER_PREFS: 'vibely_user_prefs',
};

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 1000,
  MAX_LOCATION_LENGTH: 100,
};

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PASSWORD: 'Password must be at least 6 characters',
  INVALID_NAME: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  USER_EXISTS: 'User with this email already exists',
  USER_NOT_FOUND: 'User not found',
  PAYMENT_FAILED: 'Payment processing failed',
  VALIDATION_ERROR: 'Please check your input and try again',
};

// Success messages
export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  PROFILE_UPDATE: 'Profile updated successfully',
  PAYMENT_SUCCESS: 'Payment processed successfully',
  FRIEND_ADDED: 'Friend added successfully',
};
