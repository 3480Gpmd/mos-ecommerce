import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// TEMPORARY - Tests credential login logic directly, bypassing NextAuth
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ step: 'validation', error: 'Email e password richiesti' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Step 1: Find customer
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, normalizedEmail))
      .limit(1);

    if (!customer) {
      return NextResponse.json({ step: 'find_customer', error: 'Cliente non trovato', email: normalizedEmail });
    }

    // Step 2: Check password hash exists
    if (!customer.passwordHash) {
      return NextResponse.json({ step: 'password_hash', error: 'Nessuna password impostata (account OAuth only)', email: normalizedEmail });
    }

    // Step 3: Verify password
    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      return NextResponse.json({ step: 'bcrypt_compare', error: 'Password non corrisponde', email: normalizedEmail });
    }

    // Step 4: Check active status
    if (customer.role !== 'admin' && !customer.isActive) {
      return NextResponse.json({ step: 'active_check', error: 'Account non attivo', email: normalizedEmail, role: customer.role });
    }

    // Step 5: Success
    return NextResponse.json({
      step: 'success',
      message: 'Login OK - credenziali valide',
      customer: {
        id: customer.id,
        email: customer.email,
        role: customer.role,
        isActive: customer.isActive,
        customerType: customer.customerType,
        name: customer.companyName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
      },
    });
  } catch (error) {
    return NextResponse.json({ step: 'exception', error: String(error) }, { status: 500 });
  }
}
