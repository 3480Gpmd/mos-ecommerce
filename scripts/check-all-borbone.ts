import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products, productSubcategories, productCategories } from '../src/db/schema';
import { or, like, eq, ilike } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx);
      const value = trimmed.substring(eqIdx + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  }
} catch {}

const rawUrl = process.env.DATABASE_URL!;
const m = rawUrl.match(/postgresql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/(.+)/);
if (!m) throw new Error('Invalid DATABASE_URL');
const [, dbUser, dbPass, dbHost, dbPort, dbName] = m;
const client = postgres({
  host: dbHost,
  port: Number(dbPort),
  database: dbName,
  username: dbUser,
  password: decodeURIComponent(dbPass),
  prepare: false,
  ssl: 'require',
});
const db = drizzle(client);

async function main() {
  const all = await db.select({
    id: products.id,
    code: products.code,
    name: products.name,
    brand: products.brand,
    priceNet: products.priceNet,
    imageUrl: products.imageUrl,
    subcategoryId: products.subcategoryId,
    categoryId: products.categoryId,
  }).from(products).where(
    or(
      like(products.code, 'BRB%'),
      like(products.code, 'BORB%'),
      ilike(products.brand, '%borbone%'),
    )
  );

  console.log(`Totale prodotti Borbone: ${all.length}\n`);

  const bySubcat: Record<number, typeof all> = {};
  for (const p of all) {
    const sid = p.subcategoryId || 0;
    if (!bySubcat[sid]) bySubcat[sid] = [];
    bySubcat[sid].push(p);
  }

  for (const [sid, items] of Object.entries(bySubcat)) {
    let subName = 'N/A';
    if (Number(sid) > 0) {
      const [sub] = await db.select().from(productSubcategories).where(eq(productSubcategories.id, Number(sid)));
      subName = sub?.name || 'N/A';
    }
    console.log(`\nSubcategory [${sid}] ${subName} (${items.length} prodotti):`);
    items.forEach(p => console.log(`  [${p.id}] ${p.code} | ${p.brand} | ${p.name} | EUR ${p.priceNet} | img: ${p.imageUrl || 'MANCA'}`));
  }

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
