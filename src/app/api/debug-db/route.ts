import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result: Record<string, unknown> = {
    DATABASE_URL_prefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
  };

  // Test 1: raw SELECT 1
  try {
    await db.execute(sql`SELECT 1 as ok`);
    result.select1 = 'OK';
  } catch (e: unknown) {
    const err = e as Error & { cause?: Error & { code?: string; detail?: string } };
    result.select1 = 'FAIL';
    result.select1_message = err.message;
    result.select1_cause = err.cause?.message;
    result.select1_code = err.cause?.code;
    result.select1_detail = err.cause?.detail;
  }

  // Test 2: list tables
  try {
    const rows = await db.execute(sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    result.tables = (rows as Array<{ table_name: string }>).map(r => r.table_name);
  } catch (e: unknown) {
    const err = e as Error & { cause?: Error & { code?: string } };
    result.tables = 'FAIL: ' + err.message;
    result.tables_cause = err.cause?.message;
    result.tables_code = err.cause?.code;
  }

  // Test 3: count products
  try {
    const rows = await db.execute(sql`SELECT COUNT(*) as n FROM products`);
    result.products_count = (rows as Array<{ n: string }>)[0]?.n;
  } catch (e: unknown) {
    const err = e as Error & { cause?: Error & { code?: string; detail?: string } };
    result.products_count = 'FAIL';
    result.products_count_message = err.message;
    result.products_count_cause = err.cause?.message;
    result.products_count_code = err.cause?.code;
  }

  return NextResponse.json(result, { status: 200 });
}
