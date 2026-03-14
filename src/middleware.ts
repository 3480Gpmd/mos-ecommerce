import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!req.auth?.user) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', req.url));
    }

    const isAdmin = (req.auth.user as { isAdmin?: boolean }).isAdmin;
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
