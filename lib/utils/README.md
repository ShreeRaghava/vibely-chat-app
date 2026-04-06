# Utility Functions & Constants

This directory contains reusable utility functions, constants, and type definitions for the Vibely application.

## 📁 Files

### `validation.ts`
Input validation functions for the entire application.

**Usage:**
```typescript
import { isValidEmail, isValidPassword, sanitizeInput } from '@/lib/utils/validation';

// Validate email
if (!isValidEmail(email)) {
  return errorResponse('Invalid email address', 400);
}

// Validate password
if (!isValidPassword(password)) {
  return errorResponse('Password must be at least 6 characters', 400);
}

// Sanitize user input
const cleanInput = sanitizeInput(userInput);
```

**Available Functions:**
- `isValidEmail(email)` - Validates email format
- `isValidPassword(password)` - Min 6 characters
- `isValidName(name)` - 2-100 chars, letters/spaces/hyphens/apostrophes
- `isValidRoomId(roomId)` - Room ID format
- `isValidGender(gender)` - male/female/other
- `isValidChatType(chatType)` - text/video
- `isValidLocation(location)` - 0-100 chars
- `isValidPlanType(planType)` - location/premium
- `isValidAmount(amount)` - Positive number
- `sanitizeInput(input)` - Remove XSS characters

### `api-response.ts`
Standardized API response formatter for all endpoints.

**Usage:**
```typescript
import { 
  successResponse, 
  errorResponse, 
  unauthorizedError,
  validationError 
} from '@/lib/utils/api-response';

// Success response
return successResponse(userData, 'User created successfully', 201);

// Error responses
return unauthorizedError();
return validationError('Invalid email format');
return errorResponse('Something went wrong', 500);
```

**Available Functions:**
- `successResponse(data, message, statusCode)` - 200 OK
- `errorResponse(error, statusCode)` - Generic error
- `unauthorizedError()` - 401
- `forbiddenError()` - 403
- `notFoundError(resource)` - 404
- `badRequestError(message)` - 400
- `validationError(message)` - 422
- `internalServerError(message)` - 500

### `constants.ts`
Application-wide constants.

**Usage:**
```typescript
import { PAYMENT_PLANS, ROUTES, VALIDATION, ERROR_MESSAGES } from '@/lib/utils/constants';

// Access payment plans
const price = PAYMENT_PLANS.premium.price;

// Access routes
const url = ROUTES.PREMIUM;

// Access validation limits
const maxLength = VALIDATION.MAX_MESSAGE_LENGTH;

// Access messages
const msg = ERROR_MESSAGES.INVALID_EMAIL;
```

**Available Constants:**
- `APP_NAME`, `APP_DESCRIPTION` - App metadata
- `PAYMENT_PLANS` - Premium plan details
- `PAYMENT_GATEWAYS` - Payment gateway names
- `CHAT_TYPES` - text/video
- `GENDERS` - Gender options
- `ROUTES` - All app routes
- `API_ENDPOINTS` - API route paths
- `STORAGE_KEYS` - LocalStorage keys
- `VALIDATION` - Validation limits
- `ERROR_MESSAGES` - Common error messages
- `SUCCESS_MESSAGES` - Common success messages

### `types.ts`
TypeScript interfaces and types.

**Usage:**
```typescript
import { User, Chat, ExtendedSession, ApiResponse } from '@/lib/utils/types';

const user: User = {
  _id: '123',
  name: 'John',
  email: 'john@example.com',
  // ...
};

const response: ApiResponse<User> = {
  success: true,
  data: user,
  statusCode: 200
};
```

**Available Types:**
- `ExtendedUser` - User with auth fields
- `ExtendedSession` - NextAuth session with extended user
- `ApiResponse<T>` - Generic API response
- `User` - User document
- `Chat` - Chat document
- `ChatMessage` - Message structure
- `MatchRequest` - Match request document
- `Report` - Report document
- `PaymentOrder` - Payment order details
- `PaymentStatus` - Payment status
- `LoginFormData`, `SignupFormData` - Form types
- `FilterPreferences` - Search filters
- `Notification` - Notification structure

---

## 🚀 Best Practices

1. **Always use validation functions** before processing user input
2. **Use type definitions** for better type safety
3. **Use constants** instead of hardcoding values
4. **Use standardized API responses** from all endpoints
5. **Sanitize user input** to prevent XSS attacks

---

## 📝 Adding New Utilities

When adding new utility functions:
1. Place in appropriate file or create new file
2. Export from index (if creating index.ts)
3. Add TypeScript types
4. Add JSDoc comments
5. Update this README

Example:
```typescript
/**
 * Converts date to user-friendly format
 * @param date - Date object to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
```
