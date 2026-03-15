import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync, existsSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
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
  // 1. Download image
  const imgDir = resolve(process.cwd(), 'public/products/borbone');
  await mkdir(imgDir, { recursive: true });
  const filename = 'cialda-light.jpg';
  const dest = resolve(imgDir, filename);

  if (!existsSync(dest)) {
    const res = await fetch('https://www.caffeborbone.com/dw/image/v2/BHCB_PRD/on/demandware.static/-/Sites-master-catalog/default/dwd783f280/cialde/cialde-borbone-compostabili-ese-44mm-miscela-light_01.jpg?sw=600&sh=600');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    console.log(`Scaricata: ${filename} (${(buf.length / 1024).toFixed(0)} KB)`);
  } else {
    console.log(`Gia scaricata: ${filename}`);
  }

  // 2. Get subcategory ID from existing Borbone cialda product
  const [existing] = await db.select().from(products).where(eq(products.code, 'BRB-CIALDA-BLU')).limit(1);
  if (!existing) throw new Error('Prodotto Borbone Blu non trovato');

  // 3. Insert Light
  const [alreadyExists] = await db.select({ id: products.id }).from(products).where(eq(products.code, 'BRB-CIALDA-LIGHT')).limit(1);
  if (alreadyExists) {
    console.log('Prodotto Light gia esistente, aggiorno immagine...');
    await db.update(products).set({ imageUrl: `/products/borbone/${filename}` }).where(eq(products.code, 'BRB-CIALDA-LIGHT'));
  } else {
    await db.insert(products).values({
      code: 'BRB-CIALDA-LIGHT',
      name: 'Cialde ESE Borbone Miscela Light',
      brand: 'Borbone',
      description: 'Equilibrio perfetto tra Blu e Dek. Cialde ESE 44mm compostabili.',
      unit: 'CF',
      priceNet: '5.90',
      pricePublic: '5.90',
      vatCode: '22',
      stockAvailable: 100,
      isActive: true,
      isManual: true,
      isNew: true,
      imageUrl: `/products/borbone/${filename}`,
      groupId: existing.groupId,
      categoryId: existing.categoryId,
      subcategoryId: existing.subcategoryId,
      minOrderQty: 1,
      orderMultiple: 1,
    });
    console.log('Inserito: BRB-CIALDA-LIGHT - Cialde ESE Borbone Miscela Light (EUR 5.90)');
  }

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
