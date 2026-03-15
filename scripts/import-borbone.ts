/**
 * Download Borbone images and import products into DB
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { productGroups, productCategories, productSubcategories, products } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync, existsSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
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

const IMG_DIR = resolve(process.cwd(), 'public/products/borbone');
const IMG_PATH = '/products/borbone';

// All Borbone images to download
const images: { filename: string; url: string }[] = [
  // Cialde ESE
  { filename: 'cialda-blu.jpg', url: 'https://www.caffeborbone.com/dw/image/v2/BHCB_PRD/on/demandware.static/-/Sites-master-catalog/default/dwb68445e0/cialde/cialde-borbone-compostabili-ese-44mm-miscela-blu_01.jpg?sw=600&sh=600' },
  { filename: 'cialda-rossa.jpg', url: 'https://www.caffeborbone.com/dw/image/v2/BHCB_PRD/on/demandware.static/-/Sites-master-catalog/default/dw5f6f94e4/cialde/cialde-borbone-compostabili-ese-44mm-miscela-rossa_01.jpg?sw=600&sh=600' },
  { filename: 'cialda-nera.jpg', url: 'https://www.caffeborbone.com/dw/image/v2/BHCB_PRD/on/demandware.static/-/Sites-master-catalog/default/dwe65ab76d/cialde/cialde-borbone-compostabili-ese-44mm-miscela-nera_01.jpg?sw=600&sh=600' },
  { filename: 'cialda-oro.jpg', url: 'https://www.caffeborbone.com/dw/image/v2/BHCB_PRD/on/demandware.static/-/Sites-master-catalog/default/dwb6f460b4/cialde/cialde-borbone-compostabili-ese-44mm-miscela-oro_01.jpg?sw=600&sh=600' },
  { filename: 'cialda-dek.jpg', url: 'https://www.caffeborbone.com/dw/image/v2/BHCB_PRD/on/demandware.static/-/Sites-master-catalog/default/dw5a680a2e/cialde/cialde-borbone-compostabili-ese-44mm-miscela-dek_01.jpg?sw=600&sh=600' },
  // Capsule Respresso (Nespresso)
  { filename: 'respresso-blu.jpg', url: 'https://www.caffeborbone.com/dw/image/v2/BHCB_PRD/on/demandware.static/-/Sites-master-catalog/default/dw072d7c06/capsule-compatibili/respresso/capsule-respresso-borbone-miscela-blu_01.jpg?sw=600&sh=600' },
  { filename: 'respresso-rossa.jpg', url: 'https://www.caffeborbone.com/dw/image/v2/BHCB_PRD/on/demandware.static/-/Sites-master-catalog/default/dw40461a40/capsule-compatibili/respresso/capsule-respresso-borbone-miscela-rossa_01.jpg?sw=600&sh=600' },
  { filename: 'respresso-nera.jpg', url: 'https://www.caffeborbone.com/dw/image/v2/BHCB_PRD/on/demandware.static/-/Sites-master-catalog/default/dwf78848f8/capsule-compatibili/respresso/capsule-respresso-borbone-miscela-nera_01.jpg?sw=600&sh=600' },
  { filename: 'respresso-oro.jpg', url: 'https://www.caffeborbone.com/dw/image/v2/BHCB_PRD/on/demandware.static/-/Sites-master-catalog/default/dw4522310e/capsule-compatibili/respresso/capsule-respresso-borbone-miscela-oro_01.jpg?sw=600&sh=600' },
  { filename: 'respresso-dek.jpg', url: 'https://www.caffeborbone.com/dw/image/v2/BHCB_PRD/on/demandware.static/-/Sites-master-catalog/default/dwf111b222/capsule-compatibili/respresso/capsule-respresso-borbone-miscela-dek_01.jpg?sw=600&sh=600' },
];

// Products to insert
const borboneProducts = {
  cialdeESE: [
    { code: 'BRB-CIALDA-BLU', name: 'Cialde ESE Borbone Miscela Blu', price: '5.90', image: 'cialda-blu.jpg', desc: 'Equilibrata e corposa, la tradizione del caffe napoletano. Cialde ESE 44mm compostabili.' },
    { code: 'BRB-CIALDA-ROSSA', name: 'Cialde ESE Borbone Miscela Rossa', price: '5.90', image: 'cialda-rossa.jpg', desc: 'Energica e intensa, per chi ama il gusto forte. Cialde ESE 44mm compostabili.' },
    { code: 'BRB-CIALDA-NERA', name: 'Cialde ESE Borbone Miscela Nera', price: '5.90', image: 'cialda-nera.jpg', desc: 'Cremosa, tostata al punto giusto, corpo deciso. Cialde ESE 44mm compostabili.' },
    { code: 'BRB-CIALDA-ORO', name: 'Cialde ESE Borbone Miscela Oro', price: '5.90', image: 'cialda-oro.jpg', desc: 'Dolce e morbida, adatta ad ogni momento della giornata. Cialde ESE 44mm compostabili.' },
    { code: 'BRB-CIALDA-DEK', name: 'Cialde ESE Borbone Miscela Verde Dek', price: '6.50', image: 'cialda-dek.jpg', desc: 'Decaffeinato leggero con la stessa cremosita. Cialde ESE 44mm compostabili.' },
  ],
  capsuleNespresso: [
    { code: 'BRB-RESP-BLU', name: 'Capsule Borbone Respresso Miscela Blu', price: '5.50', image: 'respresso-blu.jpg', desc: 'Equilibrata e corposa. Capsule compatibili Nespresso.' },
    { code: 'BRB-RESP-ROSSA', name: 'Capsule Borbone Respresso Miscela Rossa', price: '5.50', image: 'respresso-rossa.jpg', desc: 'Energica e intensa. Capsule compatibili Nespresso.' },
    { code: 'BRB-RESP-NERA', name: 'Capsule Borbone Respresso Miscela Nera', price: '5.50', image: 'respresso-nera.jpg', desc: 'Cremosa e corposa. Capsule compatibili Nespresso.' },
    { code: 'BRB-RESP-ORO', name: 'Capsule Borbone Respresso Miscela Oro', price: '5.50', image: 'respresso-oro.jpg', desc: 'Dolce e morbida. Capsule compatibili Nespresso.' },
    { code: 'BRB-RESP-DEK', name: 'Capsule Borbone Respresso Miscela Verde Dek', price: '6.00', image: 'respresso-dek.jpg', desc: 'Decaffeinato leggero. Capsule compatibili Nespresso.' },
  ],
};

async function main() {
  // 1. Download images
  console.log('STEP 1: Download immagini Borbone...\n');
  await mkdir(IMG_DIR, { recursive: true });
  let downloaded = 0;

  for (const img of images) {
    const dest = resolve(IMG_DIR, img.filename);
    if (existsSync(dest)) {
      console.log(`  Gia scaricata: ${img.filename}`);
      downloaded++;
      continue;
    }
    try {
      const res = await fetch(img.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buf);
      console.log(`  OK ${img.filename} (${(buf.length / 1024).toFixed(0)} KB)`);
      downloaded++;
    } catch (err: any) {
      console.error(`  ERRORE ${img.filename}: ${err.message}`);
    }
  }
  console.log(`\nScaricate: ${downloaded}/${images.length}\n`);

  // 2. Find or create group and category
  console.log('STEP 2: Creo gruppo/categoria/sottocategorie Borbone...\n');

  // Use existing group "CAFFÈ E BEVANDE CALDE" (id: 29)
  const [group] = await db.select().from(productGroups).where(eq(productGroups.id, 29));
  console.log(`Group: ${group.name} (id: ${group.id})`);

  // Create Borbone category
  let [category] = await db.select().from(productCategories).where(eq(productCategories.code, 'BORBONE')).limit(1);
  if (!category) {
    [category] = await db.insert(productCategories).values({
      code: 'BORBONE',
      name: 'Borbone',
      slug: 'borbone',
      groupId: group.id,
      sortOrder: 2,
      relevanceScore: 90,
    }).returning();
    console.log(`Creata category: ${category.name} (id: ${category.id})`);
  } else {
    console.log(`Category esistente: ${category.name} (id: ${category.id})`);
  }

  // Create subcategories
  const subcatDefs = [
    { code: 'BRB-CIALDE-ESE', name: 'Cialde ESE Borbone', slug: 'cialde-ese-borbone', sortOrder: 1 },
    { code: 'BRB-CAPSULE-NESPRESSO', name: 'Capsule Nespresso Borbone', slug: 'capsule-nespresso-borbone', sortOrder: 2 },
  ];

  const subcatIds: Record<string, number> = {};
  for (const def of subcatDefs) {
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

  // 3. Insert products
  console.log('\nSTEP 3: Inserisco prodotti Borbone...\n');

  const mapping: Record<string, string> = {
    cialdeESE: 'BRB-CIALDE-ESE',
    capsuleNespresso: 'BRB-CAPSULE-NESPRESSO',
  };

  let inserted = 0, skipped = 0;

  for (const [key, prods] of Object.entries(borboneProducts)) {
    const subcatCode = mapping[key];
    const subcatId = subcatIds[subcatCode];

    for (const prod of prods) {
      const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.code, prod.code)).limit(1);
      if (existing) {
        console.log(`  Gia esistente: ${prod.code}`);
        skipped++;
        continue;
      }

      await db.insert(products).values({
        code: prod.code,
        name: prod.name,
        brand: 'Borbone',
        description: prod.desc,
        unit: 'CF',
        priceNet: prod.price,
        pricePublic: prod.price,
        vatCode: '22',
        stockAvailable: 100,
        isActive: true,
        isManual: true,
        isNew: true,
        imageUrl: `${IMG_PATH}/${prod.image}`,
        groupId: group.id,
        categoryId: category.id,
        subcategoryId: subcatId,
        minOrderQty: 1,
        orderMultiple: 1,
      });

      console.log(`  Inserito: ${prod.code} - ${prod.name} (EUR ${prod.price})`);
      inserted++;
    }
  }

  console.log(`\nCompletato!`);
  console.log(`  Immagini scaricate: ${downloaded}`);
  console.log(`  Nuovi prodotti: ${inserted}`);
  console.log(`  Saltati: ${skipped}`);

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
