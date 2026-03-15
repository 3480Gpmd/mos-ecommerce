import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products, productSubcategories, productCategories, productGroups } from '../src/db/schema';
import { eq, inArray, like } from 'drizzle-orm';
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
  // 1. Check current GISE subcategories
  const allSubcats = await db.select().from(productSubcategories).where(inArray(productSubcategories.id, [647, 648, 649, 650, 651, 652]));
  console.log('Subcategorie attuali:');
  allSubcats.forEach(s => console.log(`  [${s.id}] ${s.name} (code: ${s.code}, slug: ${s.slug})`));

  // 2. Rename subcategory 647 (Caffe) to "Capsule GISE" and move all products there
  const targetSubcatId = 647;
  const oldSubcatIds = [648, 649]; // Bevande Calde and Tisane - merge into 647

  // Rename 647 to "Capsule GISE"
  await db.update(productSubcategories).set({
    name: 'Capsule GISE',
    slug: 'capsule-gise',
    code: 'GISE-CAPSULE',
    sortOrder: 1,
  }).where(eq(productSubcategories.id, targetSubcatId));
  console.log('\nRinominata subcat 647 -> "Capsule GISE"');

  // Move products from 648, 649 to 647
  for (const oldId of oldSubcatIds) {
    const moved = await db.update(products)
      .set({ subcategoryId: targetSubcatId })
      .where(eq(products.subcategoryId, oldId))
      .returning({ id: products.id, name: products.name });
    console.log(`Spostati ${moved.length} prodotti da subcat ${oldId} -> ${targetSubcatId}`);
    moved.forEach(p => console.log(`  -> ${p.name}`));
  }

  // Delete old subcategories
  for (const oldId of oldSubcatIds) {
    await db.delete(productSubcategories).where(eq(productSubcategories.id, oldId));
    console.log(`Eliminata subcat ${oldId}`);
  }

  // 3. Rename remaining subcategories with proper GISE capitalization
  await db.update(productSubcategories).set({ name: 'Cialde ESE GISE', slug: 'cialde-ese-gise' }).where(eq(productSubcategories.id, 650));
  await db.update(productSubcategories).set({ name: 'Caffe in Grani GISE', slug: 'caffe-grani-gise' }).where(eq(productSubcategories.id, 651));
  await db.update(productSubcategories).set({ name: 'Compatibili Nespresso GISE', slug: 'nespresso-gise' }).where(eq(productSubcategories.id, 652));
  console.log('\nRinominate sottocategorie con GISE maiuscolo');

  // 4. Fix category name: ensure GISE is capitalized
  const [cat] = await db.select().from(productCategories).where(eq(productCategories.id, 182));
  if (cat) {
    const newName = cat.name.includes('Gise') ? cat.name.replace(/Gise/gi, 'GISE') : cat.name;
    if (newName !== cat.name) {
      await db.update(productCategories).set({ name: newName }).where(eq(productCategories.id, 182));
      console.log(`\nCategory rinominata: "${cat.name}" -> "${newName}"`);
    } else {
      console.log(`\nCategory OK: "${cat.name}"`);
    }
  }

  // 5. Final check
  console.log('\n--- RISULTATO FINALE ---');
  const finalSubcats = await db.select().from(productSubcategories).where(eq(productSubcategories.categoryId, 182));
  for (const sub of finalSubcats) {
    const prods = await db.select({ id: products.id }).from(products).where(eq(products.subcategoryId, sub.id));
    console.log(`[${sub.id}] ${sub.name} -> ${prods.length} prodotti`);
  }

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
