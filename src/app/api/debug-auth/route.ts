import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

// TEMPORARY DEBUG ENDPOINT - DELETE AFTER USE
export async function GET() {
  try {
    const results = await db
      .select({
        id: customers.id,
        email: customers.email,
        role: customers.role,
        isActive: customers.isActive,
        hasPassword: customers.passwordHash,
        oauthProvider: customers.oauthProvider,
        customerType: customers.customerType,
      })
      .from(customers)
      .where(
        or(
          eq(customers.role, 'admin'),
          eq(customers.email, 'davide.mareggini@gmail.com')
        )
      )
      .limit(10);

    const safe = results.map((r) => ({
      id: r.id,
      email: r.email,
      role: r.role,
      isActive: r.isActive,
      hasPassword: !!r.hasPassword,
      oauthProvider: r.oauthProvider,
      customerType: r.customerType,
    }));

    return NextResponse.json({ accounts: safe });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
