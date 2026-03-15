import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products, productSubcategories } from '../src/db/schema';
import { eq, inArray } from 'drizzle-orm';
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
  // Old duplicate subcategory IDs (634, 635, 636, 637)
  const oldSubcatIds = [634, 635, 636, 637];

  // Delete old products in those subcategories
  for (const subcatId of oldSubcatIds) {
    const deleted = await db.delete(products).where(eq(products.subcategoryId, subcatId)).returning({ id: products.id, code: products.code, name: products.name });
    console.log(`Subcategory ${subcatId}: eliminati ${deleted.length} prodotti`);
    deleted.forEach(p => console.log(`  X ${p.code} - ${p.name}`));
  }

  // Delete old subcategories
  for (const subcatId of oldSubcatIds) {
    await db.delete(productSubcategories).where(eq(productSubcategories.id, subcatId));
    console.log(`Eliminata subcategory ${subcatId}`);
  }

  console.log('\nDoppioni rimossi!');
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
