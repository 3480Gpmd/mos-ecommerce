import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const results: string[] = [];

    // ─── Orders: E-Sell order options ───────────────────────────────
    const orderCols = [
      { name: 'forward_status', sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS forward_status varchar(30) DEFAULT 'da_inoltrare'` },
      { name: 'full_fulfillment', sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS full_fulfillment boolean DEFAULT false` },
      { name: 'balance_management', sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS balance_management boolean DEFAULT true` },
      { name: 'prices_on_invoice', sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS prices_on_invoice boolean DEFAULT false` },
      { name: 'confirmation_email', sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_email text` },
      { name: 'delivery_method', sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method varchar(20) DEFAULT 'corriere'` },
      { name: 'cs_notes', sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS cs_notes text` },
      { name: 'cost_no_vat', sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS cost_no_vat decimal(10,2)` },
      { name: 'margin', sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS margin decimal(10,2)` },
    ];

    for (const col of orderCols) {
      try {
        await db.execute(sql.raw(col.sql));
        results.push(`✅ orders.${col.name} added`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('already exists')) {
          results.push(`⏭️ orders.${col.name} already exists`);
        } else {
          results.push(`❌ orders.${col.name}: ${msg}`);
        }
      }
    }

    // ─── Order Items: E-Sell line details ───────────────────────────
    const itemCols = [
      { name: 'purchase_price', sql: `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS purchase_price decimal(10,2)` },
      { name: 'supplier_article', sql: `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS supplier_article varchar(100)` },
      { name: 'availability', sql: `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS availability text` },
      { name: 'pack_size', sql: `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS pack_size integer` },
      { name: 'min_sale_unit', sql: `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS min_sale_unit integer DEFAULT 1` },
      { name: 'qty_to_forward', sql: `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS qty_to_forward integer` },
      { name: 'is_selected', sql: `ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_selected boolean DEFAULT true` },
    ];

    for (const col of itemCols) {
      try {
        await db.execute(sql.raw(col.sql));
        results.push(`✅ order_items.${col.name} added`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('already exists')) {
          results.push(`⏭️ order_items.${col.name} already exists`);
        } else {
          results.push(`❌ order_items.${col.name}: ${msg}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      migration: 'v10 - E-Sell order management fields',
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    );
  }
}
