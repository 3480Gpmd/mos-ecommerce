import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products } from '../src/db/schema';
import { like, sql } from 'drizzle-orm';
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
  // Get all GISE products
  const allGise = await db.select({
    id: products.id,
    code: products.code,
    name: products.name,
    priceNet: products.priceNet,
    subcategoryId: products.subcategoryId,
    imageUrl: products.imageUrl,
  }).from(products).where(like(products.code, 'GISE-%'));

  console.log(`Totale prodotti GISE: ${allGise.length}\n`);

  // Check for duplicate codes
  const codeCounts: Record<string, number> = {};
  for (const p of allGise) {
    codeCounts[p.code] = (codeCounts[p.code] || 0) + 1;
  }
  const dupes = Object.entries(codeCounts).filter(([, c]) => c > 1);
  if (dupes.length > 0) {
    console.log('DOPPIONI PER CODICE:');
    for (const [code, count] of dupes) {
      console.log(`  ${code}: ${count} volte`);
      const items = allGise.filter(p => p.code === code);
      items.forEach(i => console.log(`    id=${i.id} name="${i.name}" price=${i.priceNet} subcat=${i.subcategoryId}`));
    }
  } else {
    console.log('Nessun doppione per codice.');
  }

  // Check for duplicate names
  const nameCounts: Record<string, typeof allGise> = {};
  for (const p of allGise) {
    const key = p.name.toLowerCase().trim();
    if (!nameCounts[key]) nameCounts[key] = [];
    nameCounts[key].push(p);
  }
  const nameDupes = Object.entries(nameCounts).filter(([, items]) => items.length > 1);
  if (nameDupes.length > 0) {
    console.log('\nNOMI SIMILI/DOPPIONI:');
    for (const [name, items] of nameDupes) {
      console.log(`  "${name}":`);
      items.forEach(i => console.log(`    id=${i.id} code=${i.code} price=${i.priceNet} subcat=${i.subcategoryId}`));
    }
  } else {
    console.log('Nessun doppione per nome.');
  }

  // List all products grouped by subcategory
  console.log('\n--- TUTTI I PRODOTTI GISE ---');
  const bySubcat: Record<number, typeof allGise> = {};
  for (const p of allGise) {
    const sid = p.subcategoryId || 0;
    if (!bySubcat[sid]) bySubcat[sid] = [];
    bySubcat[sid].push(p);
  }
  for (const [sid, items] of Object.entries(bySubcat)) {
    console.log(`\nSubcategory ID ${sid} (${items.length} prodotti):`);
    items.forEach(p => console.log(`  [${p.id}] ${p.code} | ${p.name} | EUR ${p.priceNet} | img: ${p.imageUrl ? 'OK' : 'MANCA'}`));
  }

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
