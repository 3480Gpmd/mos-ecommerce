/**
 * 1. Update existing BORB-* products with local images
 * 2. Remove duplicate BRB-* products, subcategories, and category
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products, productSubcategories, productCategories } from '../src/db/schema';
import { eq, like, inArray } from 'drizzle-orm';
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

const IMG = '/products/borbone';

// Map existing BORB-* codes to local images
const imageUpdates: Record<string, string> = {
  // Cialde ESE
  'BORB-ESE-BLU': 'cialda-blu.jpg',
  'BORB-ESE-ROSSA': 'cialda-rossa.jpg',
  'BORB-ESE-NERA': 'cialda-nera.jpg',
  'BORB-ESE-ORO': 'cialda-oro.jpg',
  'BORB-ESE-DEK': 'cialda-dek.jpg',
  // Capsule Nespresso
  'BORB-NESP-BLU': 'respresso-blu.jpg',
  'BORB-NESP-ROSSA': 'respresso-rossa.jpg',
  'BORB-NESP-NERA': 'respresso-nera.jpg',
  'BORB-NESP-ORO': 'respresso-oro.jpg',
  'BORB-NESP-DEK': 'respresso-dek.jpg',
  // Don Carlo (A Modo Mio) - use respresso images as fallback (same blends)
  'BORB-AMM-BLU': 'respresso-blu.jpg',
  'BORB-AMM-ROSSA': 'respresso-rossa.jpg',
  'BORB-AMM-NERA': 'respresso-nera.jpg',
  'BORB-AMM-ORO': 'respresso-oro.jpg',
  'BORB-AMM-DEK': 'respresso-dek.jpg',
  // Dolce Gusto - use respresso images as fallback (same blends)
  'BORB-DG-BLU': 'respresso-blu.jpg',
  'BORB-DG-ROSSA': 'respresso-rossa.jpg',
  'BORB-DG-NERA': 'respresso-nera.jpg',
  'BORB-DG-ORO': 'respresso-oro.jpg',
  'BORB-DG-DEK': 'respresso-dek.jpg',
};

async function main() {
  // 1. Update existing products with local images
  console.log('STEP 1: Aggiorno immagini prodotti BORB-* esistenti...\n');
  let updated = 0;

  for (const [code, filename] of Object.entries(imageUpdates)) {
    const localUrl = `${IMG}/${filename}`;
    await db.update(products)
      .set({ imageUrl: localUrl })
      .where(eq(products.code, code));
    console.log(`  ${code} -> ${localUrl}`);
    updated++;
  }
  console.log(`\nAggiornate: ${updated}\n`);

  // 2. Add Light to existing cialde ESE subcategory (633)
  const [lightExists] = await db.select({ id: products.id }).from(products)
    .where(eq(products.code, 'BORB-ESE-LIGHT')).limit(1);

  if (!lightExists) {
    // Get reference from existing ESE product
    const [ref] = await db.select().from(products).where(eq(products.code, 'BORB-ESE-BLU')).limit(1);
    if (ref) {
      await db.insert(products).values({
        code: 'BORB-ESE-LIGHT',
        name: 'Caffe Borbone Miscela Light - Cialde ESE 44mm - 150 Cialde',
        brand: 'CAFFE BORBONE',
        description: 'Equilibrio perfetto tra Blu e Dek. Cialde ESE 44mm compostabili.',
        unit: 'PZ',
        priceNet: '21.50',
        pricePublic: '22.50',
        vatCode: '22',
        stockAvailable: 100,
        isActive: true,
        isManual: true,
        isNew: true,
        imageUrl: `${IMG}/cialda-light.jpg`,
        groupId: ref.groupId,
        categoryId: ref.categoryId,
        subcategoryId: ref.subcategoryId,
        minOrderQty: 1,
        orderMultiple: 1,
      });
      console.log('Inserito: BORB-ESE-LIGHT - Miscela Light (nelle Cialde ESE esistenti)\n');
    }
  } else {
    await db.update(products).set({ imageUrl: `${IMG}/cialda-light.jpg` }).where(eq(products.code, 'BORB-ESE-LIGHT'));
    console.log('BORB-ESE-LIGHT gia esistente, aggiornata immagine\n');
  }

  // 3. Remove duplicate BRB-* products
  console.log('STEP 2: Rimuovo prodotti duplicati BRB-*...\n');
  const deleted = await db.delete(products).where(like(products.code, 'BRB%'))
    .returning({ id: products.id, code: products.code, name: products.name });
  console.log(`Eliminati ${deleted.length} prodotti duplicati:`);
  deleted.forEach(p => console.log(`  X ${p.code} - ${p.name}`));

  // 4. Remove duplicate subcategories (653, 654) and category (187)
  console.log('\nSTEP 3: Rimuovo sottocategorie e categoria duplicate...\n');
  for (const id of [653, 654]) {
    await db.delete(productSubcategories).where(eq(productSubcategories.id, id));
    console.log(`  Eliminata subcategory ${id}`);
  }
  await db.delete(productCategories).where(eq(productCategories.id, 187));
  console.log('  Eliminata category 187 (Borbone duplicata)');

  // 5. Final check
  console.log('\n--- RISULTATO FINALE ---');
  const final = await db.select({
    code: products.code,
    name: products.name,
    imageUrl: products.imageUrl,
    subcategoryId: products.subcategoryId,
  }).from(products).where(like(products.code, 'BORB%'));

  console.log(`\nProdotti Borbone: ${final.length}`);
  final.forEach(p => console.log(`  ${p.code} | ${p.name} | img: ${p.imageUrl}`));

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
