import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Tabella relazioni prodotti (up-sell, cross-sell, accessori, simili)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_relations (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        related_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        relation_type VARCHAR(20) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS product_relations_product_idx ON product_relations(product_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS product_relations_type_idx ON product_relations(relation_type)`);
    await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS product_relations_unique_idx ON product_relations(product_id, related_product_id, relation_type)`);

    // 2. Tabella campagne marketing
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(30) NOT NULL,
        status VARCHAR(20) DEFAULT 'draft' NOT NULL,
        target_type VARCHAR(30) DEFAULT 'all' NOT NULL,
        target_value TEXT,
        discount_type VARCHAR(20),
        discount_value DECIMAL(10, 2),
        min_order_amount DECIMAL(10, 2),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        email_subject VARCHAR(500),
        email_body TEXT,
        banner_image_url TEXT,
        banner_link TEXT,
        sent_count INTEGER DEFAULT 0,
        open_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        conversion_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS campaigns_type_idx ON campaigns(type)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS campaigns_start_date_idx ON campaigns(start_date)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS campaigns_end_date_idx ON campaigns(end_date)`);

    // 3. Tabella prodotti campagna
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS campaign_products (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS campaign_products_campaign_idx ON campaign_products(campaign_id)`);

    return NextResponse.json({
      success: true,
      message: 'Migrazione v7 completata: product_relations, campaigns, campaign_products',
    });
  } catch (error) {
    console.error('Migration v7 error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
