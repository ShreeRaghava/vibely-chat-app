import { NextResponse } from 'next/server';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

// Standardized successful response
export const successResponse = <T,>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      statusCode,
    },
    { status: statusCode }
  );
};

// Standardized error response
export const errorResponse = (
  error: string,
  statusCode: number = 500
): NextResponse<ApiResponse<null>> => {
  return NextResponse.json(
    {
      success: false,
      error,
      statusCode,
    },
    { status: statusCode }
  );
};

// Unauthorized error (401)
export const unauthorizedError = (): NextResponse<ApiResponse<null>> => {
  return errorResponse('Unauthorized', 401);
};

// Forbidden error (403)
export const forbiddenError = (): NextResponse<ApiResponse<null>> => {
  return errorResponse('Forbidden', 403);
};

// Not found error (404)
export const notFoundError = (resource: string = 'Resource'): NextResponse<ApiResponse<null>> => {
  return errorResponse(`${resource} not found`, 404);
};

// Bad request error (400)
export const badRequestError = (message: string = 'Bad request'): NextResponse<ApiResponse<null>> => {
  return errorResponse(message, 400);
};

// Validation error (422)
export const validationError = (message: string): NextResponse<ApiResponse<null>> => {
  return errorResponse(`Validation error: ${message}`, 422);
};

// Internal server error (500)
export const internalServerError = (message: string = 'Internal server error'): NextResponse<ApiResponse<null>> => {
  return errorResponse(message, 500);
};
