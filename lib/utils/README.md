# Utility Functions & Constants

This directory contains reusable utility functions, constants, and type definitions for the Vibely application.

## 📁 Files

### `validation.ts`
Input validation functions for the entire application.

**Usage:**
```typescript
import { isValidEmail, isValidPassword, sanitizeInput } from '@/lib/utils/validation';

if (!isValidEmail(email)) {
  return errorResponse('Invalid email address', 400);
}

const cleanInput = sanitizeInput(userInput);
```

**Available Functions:**
- `isValidEmail(email)` - Validates email format
- `isValidPassword(password)` - Minimum 6 characters
- `isValidName(name)` - 2-100 chars, letters/spaces/hyphens/apostrophes
- `isValidRoomId(roomId)` - Room ID format
- `isValidGender(gender)` - Accepts male/female/other
- `isValidChatType(chatType)` - Accepts text/video
- `isValidLocation(location)` - 0-100 chars
- `sanitizeInput(input)` - Removes unsafe characters

### `api-response.ts`
Standardized API response formatter for all endpoints.

**Usage:**
```typescript
import { successResponse, errorResponse, unauthorizedError, validationError } from '@/lib/utils/api-response';

return successResponse(userData, 'User created successfully', 201);
```

### `constants.ts`
Application-wide constants.

**Usage:**
```typescript
import { ROUTES, VALIDATION, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/utils/constants';

const route = ROUTES.LOGIN;
const maxLength = VALIDATION.MAX_MESSAGE_LENGTH;
const message = ERROR_MESSAGES.INVALID_EMAIL;
```

### `types.ts`
TypeScript interfaces and types.

**Usage:**
```typescript
import { User, Chat, ExtendedSession, ApiResponse } from '@/lib/utils/types';

const user: User = {
  _id: '123',
  name: 'John',
  email: 'john@example.com',
};
```
