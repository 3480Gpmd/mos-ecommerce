import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. ALTER TABLE customers ADD COLUMN free_shipping
    try {
      await db.execute(sql`
        DO $$ BEGIN
          ALTER TABLE customers ADD COLUMN free_shipping BOOLEAN DEFAULT false NOT NULL;
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$;
      `);
    } catch (e) {
      console.log('free_shipping column already exists or error:', e);
    }

    // 2. ALTER TABLE customers ADD COLUMN credit_limit
    try {
      await db.execute(sql`
        DO $$ BEGIN
          ALTER TABLE customers ADD COLUMN credit_limit DECIMAL(10, 2);
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$;
      `);
    } catch (e) {
      console.log('credit_limit column already exists or error:', e);
    }

    // 3. ALTER TABLE customers ADD COLUMN allowed_payment_methods
    try {
      await db.execute(sql`
        DO $$ BEGIN
          ALTER TABLE customers ADD COLUMN allowed_payment_methods TEXT;
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$;
      `);
    } catch (e) {
      console.log('allowed_payment_methods column already exists or error:', e);
    }

    // 4. ALTER TABLE customers ADD COLUMN welcome_email_sent
    try {
      await db.execute(sql`
        DO $$ BEGIN
          ALTER TABLE customers ADD COLUMN welcome_email_sent BOOLEAN DEFAULT false NOT NULL;
        EXCEPTION WHEN duplicate_column THEN NULL;
        END $$;
      `);
    } catch (e) {
      console.log('welcome_email_sent column already exists or error:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Migrazione v8 completata: customers table - freeShipping, creditLimit, allowedPaymentMethods, welcomeEmailSent',
    });
  } catch (error) {
    console.error('Migration v8 error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
