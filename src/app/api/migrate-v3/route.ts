import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    const results: string[] = [];

    // Aggiungi campi ordine minimo ai prodotti
    const newProductCols = [
      { name: 'min_order_qty', def: "ALTER TABLE products ADD COLUMN IF NOT EXISTS min_order_qty INTEGER DEFAULT 1" },
      { name: 'order_multiple', def: "ALTER TABLE products ADD COLUMN IF NOT EXISTS order_multiple INTEGER DEFAULT 1" },
      { name: 'pack_size', def: "ALTER TABLE products ADD COLUMN IF NOT EXISTS pack_size INTEGER" },
    ];

    for (const col of newProductCols) {
      try {
        await db.execute(sql.raw(col.def));
        results.push(`✅ products.${col.name}`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('already exists')) {
          results.push(`⏭️ products.${col.name} (esiste già)`);
        } else {
          results.push(`❌ products.${col.name}: ${msg}`);
        }
      }
    }

    // Aggiungi campi urgenza e destinazione alternativa agli ordini
    const newOrderCols = [
      { name: 'is_urgent', def: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false NOT NULL" },
      { name: 'alt_shipping', def: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS alt_shipping BOOLEAN DEFAULT false NOT NULL" },
      { name: 'alt_shipping_address', def: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS alt_shipping_address TEXT" },
      { name: 'alt_shipping_postcode', def: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS alt_shipping_postcode VARCHAR(10)" },
      { name: 'alt_shipping_city', def: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS alt_shipping_city VARCHAR(100)" },
      { name: 'alt_shipping_province', def: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS alt_shipping_province VARCHAR(5)" },
      { name: 'alt_shipping_name', def: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS alt_shipping_name VARCHAR(255)" },
    ];

    for (const col of newOrderCols) {
      try {
        await db.execute(sql.raw(col.def));
        results.push(`✅ orders.${col.name}`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('already exists')) {
          results.push(`⏭️ orders.${col.name} (esiste già)`);
        } else {
          results.push(`❌ orders.${col.name}: ${msg}`);
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Migration V3 error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
