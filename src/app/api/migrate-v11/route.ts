import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Migration v11: aggiunge le colonne aggiunte allo schema nel commit
 * 55644c7 (Phase 2/3/4 admin features) che non avevano una migration
 * corrispondente, più i nuovi campi customers e tabelle aggiuntive.
 *
 * Sintomo che richiedeva questa migration: /api/products e /api/navigation
 * tornavano 500 in production perché Drizzle SELECT * referenziava colonne
 * inesistenti nel DB (es. is_new, is_featured, relevance_score).
 */
export async function GET() {
  const results: string[] = [];

  const run = async (label: string, statement: string) => {
    try {
      await db.execute(sql.raw(statement));
      results.push(`OK ${label}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('already exists')) {
        results.push(`SKIP ${label} (already exists)`);
      } else {
        results.push(`FAIL ${label}: ${msg}`);
      }
    }
  };

  try {
    // ─── products: nuove colonne (commit 55644c7) ───────────────────
    const productCols: Array<[string, string]> = [
      ['max_order_qty', 'INTEGER'],
      ['is_featured', 'BOOLEAN DEFAULT false NOT NULL'],
      ['is_super_price', 'BOOLEAN DEFAULT false NOT NULL'],
      ['is_zero_markup', 'BOOLEAN DEFAULT false NOT NULL'],
      ['is_new', 'BOOLEAN DEFAULT false NOT NULL'],
      ['super_price', 'DECIMAL(10,2)'],
      ['featured_sort', 'INTEGER DEFAULT 0'],
      ['relevance_score', 'INTEGER DEFAULT 0'],
      ['promo_start_date', 'TIMESTAMP'],
      ['promo_end_date', 'TIMESTAMP'],
      ['new_until_date', 'TIMESTAMP'],
    ];
    for (const [name, type] of productCols) {
      await run(
        `products.${name}`,
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS ${name} ${type}`,
      );
    }

    // ─── product_groups / product_categories: relevance_score ───────
    await run(
      'product_groups.relevance_score',
      `ALTER TABLE product_groups ADD COLUMN IF NOT EXISTS relevance_score INTEGER DEFAULT 0`,
    );
    await run(
      'product_categories.relevance_score',
      `ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS relevance_score INTEGER DEFAULT 0`,
    );

    // ─── customers: campi aggiunti dopo l'init schema ───────────────
    const customerCols: Array<[string, string]> = [
      ['oauth_provider', 'VARCHAR(20)'],
      ['oauth_id', 'VARCHAR(255)'],
      ['birth_date', 'VARCHAR(10)'],
      ['price_list', "VARCHAR(50) DEFAULT 'standard'"],
      ['easyfatt_code', 'VARCHAR(50)'],
      ['crm_id', 'VARCHAR(100)'],
      ['free_shipping', 'BOOLEAN DEFAULT false NOT NULL'],
      ['credit_limit', 'DECIMAL(10,2)'],
      ['allowed_payment_methods', 'TEXT'],
      ['welcome_email_sent', 'BOOLEAN DEFAULT false NOT NULL'],
    ];
    for (const [name, type] of customerCols) {
      await run(
        `customers.${name}`,
        `ALTER TABLE customers ADD COLUMN IF NOT EXISTS ${name} ${type}`,
      );
    }

    // password_hash deve diventare nullable per utenti OAuth
    await run(
      'customers.password_hash NULLABLE',
      `ALTER TABLE customers ALTER COLUMN password_hash DROP NOT NULL`,
    );

    return NextResponse.json({
      success: true,
      migration: 'v11 - allinea colonne aggiunte da Phase 2-4 senza migration',
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
        results,
      },
      { status: 500 },
    );
  }
}
