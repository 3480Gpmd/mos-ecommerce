import { NextResponse } from 'next/server';

// TEMPORARY - Check which env vars are set
export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '(not set)',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? `set (${process.env.NEXTAUTH_SECRET.length} chars)` : '(not set)',
    AUTH_SECRET: process.env.AUTH_SECRET ? `set (${process.env.AUTH_SECRET.length} chars)` : '(not set)',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'set' : '(not set)',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'set' : '(not set)',
    APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID ? 'set' : '(not set)',
    APPLE_CLIENT_SECRET: process.env.APPLE_CLIENT_SECRET ? 'set' : '(not set)',
    DATABASE_URL: process.env.DATABASE_URL ? 'set' : '(not set)',
    NODE_ENV: process.env.NODE_ENV,
  });
}
