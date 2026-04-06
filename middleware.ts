import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = await auth();

  // Public routes that don't need authentication
  const publicRoutes = [
    '/login',
    '/signup',
    '/',
    '/privacy',
    '/terms',
    '/api/auth',
    '/api/signup',
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Protected routes that require authentication
  const protectedRoutes = [
    '/lobby',
    '/matching',
    '/room',
    '/profile',
    '/friends',
    '/premium',
    '/admin',
    '/api/user',
    '/api/match',
    '/api/friends',
    '/api/payment',
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and tries to access login/signup, redirect to lobby
  if ((pathname === '/login' || pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/lobby', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
