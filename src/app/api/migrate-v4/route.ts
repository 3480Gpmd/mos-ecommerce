import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    const results: string[] = [];

    const migrations = [
      { name: 'cart_items.is_urgent', def: "ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false NOT NULL" },
      { name: 'order_items.is_urgent', def: "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false NOT NULL" },
      { name: 'customers.birth_date', def: "ALTER TABLE customers ADD COLUMN IF NOT EXISTS birth_date VARCHAR(10)" },
      { name: 'customers.oauth_provider', def: "ALTER TABLE customers ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(20)" },
      { name: 'customers.oauth_id', def: "ALTER TABLE customers ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255)" },
      { name: 'customers.password_hash_nullable', def: "ALTER TABLE customers ALTER COLUMN password_hash DROP NOT NULL" },
    ];

    for (const m of migrations) {
      try {
        await db.execute(sql.raw(m.def));
        results.push(`✅ ${m.name}`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('already exists')) {
          results.push(`⏭️ ${m.name} (esiste già)`);
        } else {
          results.push(`❌ ${m.name}: ${msg}`);
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Migration V4 error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
