import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  const results: string[] = [];

  const migrations = [
    {
      name: 'customer_notes',
      sql: `CREATE TABLE IF NOT EXISTS customer_notes (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'nota',
        reminder_date TIMESTAMP,
        is_completed BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
    },
    {
      name: 'customer_notes_indexes',
      sql: `CREATE INDEX IF NOT EXISTS customer_notes_customer_idx ON customer_notes(customer_id);
            CREATE INDEX IF NOT EXISTS customer_notes_type_idx ON customer_notes(type);
            CREATE INDEX IF NOT EXISTS customer_notes_reminder_idx ON customer_notes(reminder_date)`,
    },
    {
      name: 'quote_requests',
      sql: `CREATE TABLE IF NOT EXISTS quote_requests (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255),
        contact_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(30),
        message TEXT,
        interests TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'nuovo',
        admin_notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
    },
    {
      name: 'quote_requests_indexes',
      sql: `CREATE INDEX IF NOT EXISTS quote_requests_status_idx ON quote_requests(status);
            CREATE INDEX IF NOT EXISTS quote_requests_created_idx ON quote_requests(created_at)`,
    },
  ];

  for (const m of migrations) {
    try {
      await db.execute(sql.raw(m.sql));
      results.push(`✅ ${m.name}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('already exists')) {
        results.push(`✅ ${m.name} (già esistente)`);
      } else {
        results.push(`❌ ${m.name}: ${msg}`);
      }
    }
  }

  return NextResponse.json({ success: true, results });
}
