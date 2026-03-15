/**
 * 1. Update existing GISE products: set local image paths
 * 2. Insert new products: Cialde ESE, Caffè in Grani, Compatibili Nespresso
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { productGroups, productCategories, productSubcategories, products } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
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

const IMG = '/products/gise';

// Map: product code -> local image filename
const imageMap: Record<string, string> = {
  'GISE-LEVANTE': 'levante.jpg',
  'GISE-LIBECCIO': 'libeccio.jpg',
  'GISE-MAESTRALE': 'maestrale.jpg',
  'GISE-SCIROCCO': 'scirocco.jpg',
  'GISE-ZEFIRO': 'zefiro.jpg',
  'GISE-GRECALE': 'grecale.jpg',
  'GISE-OSTRO': 'ostro.jpg',
  'GISE-MARINO': 'marino.jpg',
  'GISE-VERDE-GANODERMA': 'caffe-verde-ganoderma.jpg',
  'GISE-VIENTO': 'viento-de-la-sierra.jpg',
  'GISE-GHIBLI': 'ghibli.jpg',
  'GISE-MAESTRALE-48': 'maestrale-bauletto-48.jpg',
  'GISE-OSTRO-48': 'ostro-bauletto-48.jpg',
  'GISE-SCIROCCO-48': 'scirocco-bauletto-48.jpg',
  'GISE-MARINO-48': 'marino-bauletto-48.jpg',
  'GISE-CIOCCOLATO': 'cioccolato.jpg',
  'GISE-GINSENG-AMARO': 'ginseng-amaro.jpg',
  'GISE-GINSENG': 'ginseng.jpg',
  'GISE-MOCACCINO': 'mocaccino.jpg',
  'GISE-CAPPUCCINO': 'cappuccino.jpg',
  'GISE-ORZO': 'orzo.jpg',
  'GISE-TE-LIMONE': 'te-al-limone.jpg',
  'GISE-MIRTILLO-MELOGRANO': 'mirtillo-melograno.jpg',
  'GISE-ZENZERO-LIMONE': 'zenzero-limone.jpg',
  'GISE-NOCCIOLINO': 'nocciolino.jpg',
  'GISE-TISANA-ENERGY': 'tisana-te-energy.jpg',
  'GISE-TISANA-VENTRE': 'tisana-ventre-piatto.jpg',
  'GISE-TISANA-SERA': 'tisana-della-sera.jpg',
  'GISE-TISANA-MORA': 'tisana-mora-curcuma.jpg',
  'GISE-TISANA-COCCO': 'tisana-cocco-lampone.jpg',
  'GISE-TISANA-DRENANTE': 'tisana-drenante.jpg',
};

// New products
const newProducts = {
  cialdeEse: [
    { name: 'Libeccio - Cialda ESE', price: '12.95', image: 'libeccio-cialda-ese.jpg', code: 'GISE-LIBECCIO-ESE' },
    { name: 'Maestrale - Cialda ESE', price: '12.65', image: 'maestrale-cialda-ese.jpg', code: 'GISE-MAESTRALE-ESE' },
    { name: 'Marino - Cialda ESE', price: '13.95', image: 'marino-cialda-ese.jpg', code: 'GISE-MARINO-ESE' },
    { name: 'Ostro - Cialda ESE', price: '11.80', image: 'ostro-cialda-ese.jpg', code: 'GISE-OSTRO-ESE' },
    { name: 'Caffe al Ginseng - Cialda ESE', price: '5.90', image: 'ginseng-cialda-ese.jpg', code: 'GISE-GINSENG-ESE' },
    { name: 'Infuso alla Melagrana - Cialda ESE', price: '4.90', image: 'melagrana-cialda-ese.jpg', code: 'GISE-MELAGRANA-ESE' },
    { name: 'Sogno d\'Inverno - Cialda ESE', price: '4.90', image: 'sogno-inverno-cialda-ese.jpg', code: 'GISE-SOGNO-ESE' },
    { name: 'Te Verde - Cialda ESE', price: '4.90', image: 'te-verde-cialda-ese.jpg', code: 'GISE-TE-VERDE-ESE' },
    { name: 'Ghibli - Cialda ESE', price: '11.00', image: 'ghibli-cialda-ese.jpg', code: 'GISE-GHIBLI-ESE' },
  ],
  caffeGrani: [
    { name: 'Libeccio - Caffe in Grani 250g', price: '7.90', image: 'libeccio-grani-250g.jpg', code: 'GISE-LIBECCIO-GRANI' },
    { name: 'Maestrale - Caffe in Grani 250g', price: '7.50', image: 'maestrale-grani-250g.jpg', code: 'GISE-MAESTRALE-GRANI' },
    { name: 'Ostro - Caffe in Grani 250g', price: '7.10', image: 'ostro-grani-250g.jpg', code: 'GISE-OSTRO-GRANI' },
    { name: 'Marino - Caffe Decaffeinato in Grani 250g', price: '8.40', image: 'marino-grani-250g.jpg', code: 'GISE-MARINO-GRANI' },
  ],
  nespresso: [
    { name: 'Ghibli - Capsule Nespresso', price: '3.60', image: 'ghibli-nespresso.jpg', code: 'GISE-GHIBLI-NESPRESSO' },
    { name: 'Maestrale - Capsule Nespresso', price: '3.60', image: 'maestrale-nespresso.jpg', code: 'GISE-MAESTRALE-NESPRESSO' },
  ],
};

async function main() {
  console.log('STEP 1: Aggiorno immagini prodotti esistenti...\n');

  let updated = 0;
  for (const [code, filename] of Object.entries(imageMap)) {
    const localUrl = `${IMG}/${filename}`;
    await db.update(products)
      .set({ imageUrl: localUrl })
      .where(eq(products.code, code));
    console.log(`  ${code} -> ${localUrl}`);
    updated++;
  }
  console.log(`\nAggiornate ${updated} immagini\n`);

  // STEP 2: Get group & category
  console.log('STEP 2: Creo nuove sottocategorie e inserisco prodotti...\n');

  let [group] = await db.select().from(productGroups).where(eq(productGroups.slug, 'caffe-bevande-calde')).limit(1);
  if (!group) {
    const allGroups = await db.select().from(productGroups);
    group = allGroups.find(g => g.name.toLowerCase().includes('caff') || g.slug.includes('caff'))!;
  }
  console.log(`Group: ${group.name} (id: ${group.id})`);

  let [category] = await db.select().from(productCategories).where(eq(productCategories.code, 'GISE')).limit(1);
  if (!category) {
    const allCats = await db.select().from(productCategories).where(eq(productCategories.groupId, group.id));
    category = allCats.find(c => c.name.toLowerCase().includes('gise'))!;
  }
  console.log(`Category: ${category.name} (id: ${category.id})`);

  // New subcategories
  const newSubcats = [
    { code: 'GISE-CIALDE-ESE', name: 'Cialde ESE', slug: 'gise-cialde-ese', sortOrder: 4 },
    { code: 'GISE-GRANI', name: 'Caffe in Grani', slug: 'gise-caffe-grani', sortOrder: 5 },
    { code: 'GISE-NESPRESSO', name: 'Compatibili Nespresso', slug: 'gise-nespresso', sortOrder: 6 },
  ];

  const subcatIds: Record<string, number> = {};
  for (const def of newSubcats) {
    let [sub] = await db.select().from(productSubcategories).where(eq(productSubcategories.code, def.code)).limit(1);
    if (!sub) {
      [sub] = await db.insert(productSubcategories).values({
        ...def,
        categoryId: category.id,
      }).returning();
      console.log(`Creata subcategory: ${sub.name} (id: ${sub.id})`);
    } else {
      console.log(`Subcategory esistente: ${sub.name} (id: ${sub.id})`);
    }
    subcatIds[def.code] = sub.id;
  }

  // Insert new products
  const mapping: Record<string, string> = {
    cialdeEse: 'GISE-CIALDE-ESE',
    caffeGrani: 'GISE-GRANI',
    nespresso: 'GISE-NESPRESSO',
  };

  let inserted = 0, skipped = 0;

  for (const [key, prods] of Object.entries(newProducts)) {
    const subcatCode = mapping[key];
    const subcatId = subcatIds[subcatCode];

    for (const prod of prods) {
      const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.code, prod.code)).limit(1);
      if (existing) {
        console.log(`Gia esistente: ${prod.code}`);
        skipped++;
        continue;
      }

      await db.insert(products).values({
        code: prod.code,
        name: prod.name,
        brand: 'GISE',
        description: `GISE - ${prod.name}`,
        unit: 'CF',
        priceNet: prod.price,
        pricePublic: prod.price,
        vatCode: '22',
        stockAvailable: 100,
        isActive: true,
        isManual: true,
        isNew: true,
        imageUrl: `${IMG}/${prod.image}`,
        groupId: group.id,
        categoryId: category.id,
        subcategoryId: subcatId,
        minOrderQty: 1,
        orderMultiple: 1,
      });

      console.log(`Inserito: ${prod.code} - ${prod.name} (EUR ${prod.price})`);
      inserted++;
    }
  }

  console.log(`\nCompletato!`);
  console.log(`  Immagini aggiornate: ${updated}`);
  console.log(`  Nuovi prodotti: ${inserted}`);
  console.log(`  Saltati: ${skipped}`);

  await client.end();
}

main().catch((err) => {
  console.error('Errore:', err);
  process.exit(1);
});
