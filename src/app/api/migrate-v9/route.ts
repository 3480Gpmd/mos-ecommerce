import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const results: string[] = [];

  try {
    // ─── 1. New columns on products table ───────────────────────
    const productCols = [
      { name: 'alternative_code_1', type: 'VARCHAR(100)' },
      { name: 'alternative_code_2', type: 'VARCHAR(100)' },
      { name: 'replacement_code', type: 'VARCHAR(100)' },
      { name: 'weight', type: 'DECIMAL(10,3)' },
      { name: 'package_qty', type: 'INTEGER' },
      { name: 'box_qty', type: 'INTEGER' },
      { name: 'pallet_qty', type: 'INTEGER' },
    ];

    for (const col of productCols) {
      try {
        await db.execute(sql.raw(`ALTER TABLE products ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`));
        results.push(`✅ products.${col.name} added`);
      } catch (e: any) {
        if (e.message?.includes('already exists')) {
          results.push(`⏭️ products.${col.name} already exists`);
        } else {
          results.push(`❌ products.${col.name}: ${e.message}`);
        }
      }
    }

    // ─── 2. New columns on orders table ─────────────────────────
    const orderCols = [
      { name: 'delivery_type', type: "VARCHAR(20)" },
      { name: 'supplier_forwarded', type: "BOOLEAN DEFAULT false NOT NULL" },
      { name: 'supplier_forwarded_at', type: "TIMESTAMP" },
    ];

    for (const col of orderCols) {
      try {
        await db.execute(sql.raw(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`));
        results.push(`✅ orders.${col.name} added`);
      } catch (e: any) {
        if (e.message?.includes('already exists')) {
          results.push(`⏭️ orders.${col.name} already exists`);
        } else {
          results.push(`❌ orders.${col.name}: ${e.message}`);
        }
      }
    }

    // ─── 3. supplier_settings table ─────────────────────────────
    try {
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS supplier_settings (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(30),
          notes TEXT,
          is_active BOOLEAN DEFAULT true NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `));
      results.push('✅ supplier_settings table created');
    } catch (e: any) {
      results.push(`❌ supplier_settings: ${e.message}`);
    }

    // ─── 4. supplier_orders table ───────────────────────────────
    try {
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS supplier_orders (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES orders(id),
          supplier_id INTEGER REFERENCES supplier_settings(id),
          delivery_type VARCHAR(20) NOT NULL,
          delivery_address TEXT,
          status VARCHAR(20) DEFAULT 'pending' NOT NULL,
          email_sent_at TIMESTAMP,
          email_error TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `));
      results.push('✅ supplier_orders table created');
    } catch (e: any) {
      results.push(`❌ supplier_orders: ${e.message}`);
    }

    // ─── 5. product_variant_groups table ────────────────────────
    try {
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS product_variant_groups (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(20) DEFAULT 'color' NOT NULL,
          is_active BOOLEAN DEFAULT true NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `));
      results.push('✅ product_variant_groups table created');
    } catch (e: any) {
      results.push(`❌ product_variant_groups: ${e.message}`);
    }

    // ─── 6. product_variants table ──────────────────────────────
    try {
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS product_variants (
          id SERIAL PRIMARY KEY,
          group_id INTEGER NOT NULL REFERENCES product_variant_groups(id) ON DELETE CASCADE,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          variant_label VARCHAR(100),
          color_hex VARCHAR(7),
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `));
      results.push('✅ product_variants table created');
    } catch (e: any) {
      results.push(`❌ product_variants: ${e.message}`);
    }

    // ─── 7. service_pages table ─────────────────────────────────
    try {
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS service_pages (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          subtitle TEXT,
          hero_title VARCHAR(500),
          hero_subtitle TEXT,
          hero_image_url TEXT,
          category VARCHAR(50) NOT NULL,
          meta_title VARCHAR(255),
          meta_description TEXT,
          is_active BOOLEAN DEFAULT true NOT NULL,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `));
      results.push('✅ service_pages table created');
    } catch (e: any) {
      results.push(`❌ service_pages: ${e.message}`);
    }

    // ─── 8. service_page_sections table ─────────────────────────
    try {
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS service_page_sections (
          id SERIAL PRIMARY KEY,
          page_id INTEGER NOT NULL REFERENCES service_pages(id) ON DELETE CASCADE,
          type VARCHAR(30) NOT NULL,
          title VARCHAR(500),
          subtitle TEXT,
          content TEXT,
          image_url TEXT,
          background_color VARCHAR(20),
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `));
      results.push('✅ service_page_sections table created');
    } catch (e: any) {
      results.push(`❌ service_page_sections: ${e.message}`);
    }

    // ─── 9. Indexes ─────────────────────────────────────────────
    const indexes = [
      'CREATE INDEX IF NOT EXISTS supplier_orders_order_idx ON supplier_orders(order_id)',
      'CREATE INDEX IF NOT EXISTS product_variants_group_idx ON product_variants(group_id)',
      'CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants(product_id)',
      'CREATE INDEX IF NOT EXISTS service_pages_slug_idx ON service_pages(slug)',
      'CREATE INDEX IF NOT EXISTS service_pages_category_idx ON service_pages(category)',
      'CREATE INDEX IF NOT EXISTS service_page_sections_page_idx ON service_page_sections(page_id)',
    ];

    for (const idx of indexes) {
      try {
        await db.execute(sql.raw(idx));
        results.push(`✅ Index created: ${idx.split(' ON ')[0].replace('CREATE INDEX IF NOT EXISTS ', '')}`);
      } catch (e: any) {
        results.push(`⏭️ Index: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration v9 completed',
      results,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      results,
    }, { status: 500 });
  }
}
