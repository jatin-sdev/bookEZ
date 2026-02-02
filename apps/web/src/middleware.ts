import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/checkout', '/tickets'];
// Routes that require ADMIN role
const ADMIN_ROUTES = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Note: We cannot access localStorage in middleware.
  // We check for the presence of the cookie or header if you switch to cookies.
  // For this architecture using purely client-side JWTs in localStorage, 
  // we rely on Client-Side protection (AuthProvider) for UX, 
  // but we can add basic checks here if you store token in cookies too.
  
  // However, for this specific setup where you strictly store in LocalStorage,
  // Middleware cannot see the token. 
  // Use 'AuthGuard' components in the client or migrate to HttpOnly cookies.
  
  // OPTION B: If you pass token via header/cookie (Recommended for future):
  // const token = request.cookies.get('token')?.value; 
  
  // For now, we will allow the request to pass and let the Client Components
  // redirect if the user is null.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/checkout/:path*'],
};