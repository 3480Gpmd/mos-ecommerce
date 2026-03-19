import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

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

// POST: reset password for admin accounts
export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json();

    // Simple protection - must know the secret
    if (secret !== 'mos-reset-2026') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const tempPassword = 'MosAdmin2026!';
    const hash = await bcrypt.hash(tempPassword, 12);

    // Reset both accounts
    const results = [];

    // Admin account
    const [admin] = await db.update(customers)
      .set({ passwordHash: hash, isActive: true })
      .where(eq(customers.email, 'dave@milanooffreservizi.it'))
      .returning({ id: customers.id, email: customers.email });
    if (admin) results.push({ ...admin, status: 'password reset' });

    // Gmail account
    const [gmail] = await db.update(customers)
      .set({ passwordHash: hash, isActive: true })
      .where(eq(customers.email, 'davide.mareggini@gmail.com'))
      .returning({ id: customers.id, email: customers.email });
    if (gmail) results.push({ ...gmail, status: 'password reset' });

    return NextResponse.json({
      success: true,
      message: 'Password resettate. Usa la nuova password per accedere.',
      accounts: results,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
