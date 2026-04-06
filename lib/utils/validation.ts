// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 6 chars)
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Name validation (2-100 chars, no special chars except space/hyphen)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-']{2,100}$/;
  return nameRegex.test(name.trim());
};

// Room ID validation (UUID format or custom)
export const isValidRoomId = (roomId: string): boolean => {
  return roomId.length > 0 && roomId.length < 100;
};

// Gender filter validation
export const isValidGender = (gender: string): boolean => {
  return ['', 'male', 'female', 'other'].includes(gender.toLowerCase());
};

// Chat type validation
export const isValidChatType = (chatType: string): boolean => {
  return ['text', 'video'].includes(chatType.toLowerCase());
};

// Location validation (flexible - any non-empty string up to 100 chars)
export const isValidLocation = (location: string): boolean => {
  return location.length >= 0 && location.length <= 100;
};

// Plan type validation
export const isValidPlanType = (planType: string): boolean => {
  return ['location', 'premium'].includes(planType.toLowerCase());
};

// Amount validation (positive number)
export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && amount < 1000000;
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000); // Max 1000 chars
};
