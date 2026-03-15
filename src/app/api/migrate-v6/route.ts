import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Tabella per tracciamento email carrello abbandonato
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cart_abandonment_emails (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        email_type VARCHAR(30) NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`CREATE INDEX IF NOT EXISTS cart_abandonment_customer_idx ON cart_abandonment_emails(customer_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS cart_abandonment_type_idx ON cart_abandonment_emails(email_type)`);

    return NextResponse.json({ success: true, message: 'Migrazione v6 completata: cart_abandonment_emails' });
  } catch (error: unknown) {
    console.error('Migration v6 error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
