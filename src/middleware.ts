import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/analyze', '/history', '/recommendations', '/profile', '/assessment', '/analysis-result'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('token')?.value;
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/analyze/:path*',
    '/history/:path*',
    '/recommendations/:path*',
    '/profile/:path*',
    '/assessment/:path*',
    '/analysis-result/:path*',
  ],
};
