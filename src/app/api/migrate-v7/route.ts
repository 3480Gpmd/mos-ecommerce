import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: string[] = [];

  try {
    // ─── Nuovi campi su products ──────────────────────────────────
    const productCols = [
      { col: 'max_order_qty', def: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS max_order_qty INTEGER' },
      { col: 'is_featured', def: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false' },
      { col: 'is_super_price', def: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS is_super_price BOOLEAN NOT NULL DEFAULT false' },
      { col: 'is_zero_markup', def: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS is_zero_markup BOOLEAN NOT NULL DEFAULT false' },
      { col: 'is_new', def: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN NOT NULL DEFAULT false' },
      { col: 'super_price', def: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS super_price DECIMAL(10,2)' },
      { col: 'featured_sort', def: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_sort INTEGER DEFAULT 0' },
      { col: 'relevance_score', def: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS relevance_score INTEGER DEFAULT 0' },
      { col: 'promo_start_date', def: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS promo_start_date TIMESTAMP' },
      { col: 'promo_end_date', def: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS promo_end_date TIMESTAMP' },
      { col: 'new_until_date', def: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS new_until_date TIMESTAMP' },
    ];
    for (const c of productCols) {
      await db.execute(sql.raw(c.def));
      results.push(`products.${c.col}`);
    }

    // ─── Nuovi campi su product_groups e product_categories ───────
    await db.execute(sql`ALTER TABLE product_groups ADD COLUMN IF NOT EXISTS relevance_score INTEGER DEFAULT 0`);
    results.push('product_groups.relevance_score');
    await db.execute(sql`ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS relevance_score INTEGER DEFAULT 0`);
    results.push('product_categories.relevance_score');

    // ─── payment_methods ─────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push('payment_methods');

    // ─── shipping_rules ──────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS shipping_rules (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        min_amount DECIMAL(10,2) DEFAULT 0,
        max_amount DECIMAL(10,2),
        min_weight DECIMAL(10,2),
        max_weight DECIMAL(10,2),
        cost DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push('shipping_rules');

    // ─── bulky_surcharges ────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bulky_surcharges (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category_id INTEGER REFERENCES product_categories(id),
        product_id INTEGER REFERENCES products(id),
        min_qty INTEGER DEFAULT 1,
        surcharge DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push('bulky_surcharges');

    // ─── shipping_zones ──────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS shipping_zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        provinces TEXT NOT NULL,
        extra_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push('shipping_zones');

    // ─── coupons ─────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        discount_type VARCHAR(20) NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        min_order_amount DECIMAL(10,2),
        max_uses INTEGER,
        used_count INTEGER NOT NULL DEFAULT 0,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS coupons_code_idx ON coupons(code)`);
    results.push('coupons');

    // ─── coupon_redemptions ──────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coupon_redemptions (
        id SERIAL PRIMARY KEY,
        coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        order_id INTEGER REFERENCES orders(id),
        customer_id INTEGER REFERENCES customers(id),
        redeemed_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS coupon_redemptions_coupon_idx ON coupon_redemptions(coupon_id)`);
    results.push('coupon_redemptions');

    // ─── gift_rules ──────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gift_rules (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        trigger_type VARCHAR(30) NOT NULL,
        trigger_value DECIMAL(10,2),
        trigger_product_id INTEGER REFERENCES products(id),
        trigger_category_id INTEGER REFERENCES product_categories(id),
        gift_product_id INTEGER NOT NULL REFERENCES products(id),
        gift_qty INTEGER NOT NULL DEFAULT 1,
        min_order_amount DECIMAL(10,2),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push('gift_rules');

    // ─── unit_of_measure ─────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS unit_of_measure (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(50) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true
      )
    `);
    results.push('unit_of_measure');

    // ─── volume_pricing ──────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS volume_pricing (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        min_qty INTEGER NOT NULL,
        max_qty INTEGER,
        discount_pct DECIMAL(5,2),
        price_override DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS volume_pricing_product_idx ON volume_pricing(product_id)`);
    results.push('volume_pricing');

    // ─── customer_contracts ──────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS customer_contracts (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        price_list_id INTEGER REFERENCES price_lists(id),
        discount_pct DECIMAL(5,2) DEFAULT 0,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        notes TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS customer_contracts_customer_idx ON customer_contracts(customer_id)`);
    results.push('customer_contracts');

    // ─── search_synonyms ─────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS search_synonyms (
        id SERIAL PRIMARY KEY,
        term VARCHAR(100) NOT NULL,
        synonyms TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push('search_synonyms');

    // ─── user_messages ───────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_messages (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'banner',
        target_type VARCHAR(20) NOT NULL DEFAULT 'all',
        target_id INTEGER,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push('user_messages');

    // ─── product_images ──────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        alt_text VARCHAR(255),
        sort_order INTEGER DEFAULT 0,
        is_primary BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images(product_id)`);
    results.push('product_images');

    // ─── product_views ───────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_views (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES customers(id),
        session_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS product_views_product_idx ON product_views(product_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS product_views_created_idx ON product_views(created_at)`);
    results.push('product_views');

    // ─── page_views ──────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        path VARCHAR(500) NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        session_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views(path)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS page_views_created_idx ON page_views(created_at)`);
    results.push('page_views');

    // ─── catalogs ────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS catalogs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        file_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    results.push('catalogs');

    // ─── Seed dati iniziali pagamenti ────────────────────────────
    const existingPayments = await db.execute(sql`SELECT COUNT(*) as cnt FROM payment_methods`);
    const paymentCount = Number((existingPayments as unknown as { rows: { cnt: string }[] }).rows?.[0]?.cnt ?? 0);
    if (paymentCount === 0) {
      await db.execute(sql`
        INSERT INTO payment_methods (code, name, description, is_active, sort_order) VALUES
        ('paypal', 'PayPal', 'Pagamento sicuro tramite PayPal', true, 1),
        ('teamsystem', 'TeamSystem Pay', 'Pagamento tramite TeamSystem', true, 2),
        ('bonifico', 'Bonifico Bancario', 'Pagamento tramite bonifico bancario', true, 3)
      `);
      results.push('seed: payment_methods (3 metodi)');
    }

    // ─── Seed unità di misura ────────────────────────────────────
    const existingUnits = await db.execute(sql`SELECT COUNT(*) as cnt FROM unit_of_measure`);
    const unitCount = Number((existingUnits as unknown as { rows: { cnt: string }[] }).rows?.[0]?.cnt ?? 0);
    if (unitCount === 0) {
      await db.execute(sql`
        INSERT INTO unit_of_measure (code, name) VALUES
        ('PZ', 'Pezzo'), ('CF', 'Confezione'), ('KG', 'Chilogrammo'),
        ('LT', 'Litro'), ('MT', 'Metro'), ('RS', 'Risma'),
        ('SC', 'Scatola'), ('PK', 'Pacco'), ('RT', 'Rotolo')
      `);
      results.push('seed: unit_of_measure (9 unità)');
    }

    return NextResponse.json({
      success: true,
      message: `Migrazione v7 completata: ${results.length} operazioni`,
      details: results,
    });
  } catch (error: unknown) {
    console.error('Migration v7 error:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      completedBefore: results,
    }, { status: 500 });
  }
}
