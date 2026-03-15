/**
 * Script di importazione prodotti GISE Caffè
 * Dati estratti da shop.gisecaffe.com/12-capsule
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { productGroups, productCategories, productSubcategories, products } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
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

// Parse DATABASE_URL manually to avoid URI decoding issues with % in password
const rawUrl = process.env.DATABASE_URL!;
const match = rawUrl.match(/postgresql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/(.+)/);
if (!match) throw new Error('Invalid DATABASE_URL format');
const [, dbUser, dbPass, dbHost, dbPort, dbName] = match;
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

// Tutti i 31 prodotti GISE organizzati per sottocategoria
const giseProducts = {
  caffe: [
    { name: 'Levante', price: '4.30', image: 'https://shop.gisecaffe.com/84-home_default/levante.jpg', code: 'GISE-LEVANTE' },
    { name: 'Libeccio', price: '4.30', image: 'https://shop.gisecaffe.com/86-home_default/libeccio.jpg', code: 'GISE-LIBECCIO' },
    { name: 'Maestrale', price: '4.30', image: 'https://shop.gisecaffe.com/87-home_default/maestrale.jpg', code: 'GISE-MAESTRALE' },
    { name: 'Scirocco', price: '4.00', image: 'https://shop.gisecaffe.com/88-home_default/scirocco.jpg', code: 'GISE-SCIROCCO' },
    { name: 'Zefiro', price: '4.90', image: 'https://shop.gisecaffe.com/89-home_default/zefiro.jpg', code: 'GISE-ZEFIRO' },
    { name: 'Grecale', price: '4.90', image: 'https://shop.gisecaffe.com/90-home_default/grecale.jpg', code: 'GISE-GRECALE' },
    { name: 'Ostro', price: '4.00', image: 'https://shop.gisecaffe.com/92-home_default/ostro.jpg', code: 'GISE-OSTRO' },
    { name: 'Marino', price: '4.50', image: 'https://shop.gisecaffe.com/97-home_default/marino.jpg', code: 'GISE-MARINO' },
    { name: 'Caffè Verde e Ganoderma', price: '5.00', image: 'https://shop.gisecaffe.com/105-home_default/caffe-verde-e-ganoderma.jpg', code: 'GISE-VERDE-GANODERMA' },
    { name: 'VIENTO DE LA SIERRA - Limited Edition', price: '4.70', image: 'https://shop.gisecaffe.com/299-home_default/viento-de-la-sierra.jpg', code: 'GISE-VIENTO' },
    { name: 'Ghibli', price: '4.00', image: 'https://shop.gisecaffe.com/330-home_default/ghibli.jpg', code: 'GISE-GHIBLI' },
    // Bauletti
    { name: 'Maestrale - Bauletto 48 capsule', price: '19.50', image: 'https://shop.gisecaffe.com/282-home_default/maestrale-bauletto-48-capsule.jpg', code: 'GISE-MAESTRALE-48' },
    { name: 'Ostro - Bauletto 48 capsule', price: '18.30', image: 'https://shop.gisecaffe.com/285-home_default/ostro-bauletto-48-capsule.jpg', code: 'GISE-OSTRO-48' },
    { name: 'Scirocco - Bauletto 48 capsule', price: '17.90', image: 'https://shop.gisecaffe.com/317-home_default/maestrale-bauletto-48-capsule.jpg', code: 'GISE-SCIROCCO-48' },
    { name: 'Marino - Bauletto 48 capsule', price: '20.00', image: 'https://shop.gisecaffe.com/337-home_default/ostro-bauletto-48-capsule.jpg', code: 'GISE-MARINO-48' },
  ],
  bevandeCalde: [
    { name: 'Cioccolato', price: '4.40', image: 'https://shop.gisecaffe.com/101-home_default/cioccolato.jpg', code: 'GISE-CIOCCOLATO' },
    { name: 'Ginseng Amaro', price: '4.30', image: 'https://shop.gisecaffe.com/109-home_default/ginseng-amaro.jpg', code: 'GISE-GINSENG-AMARO' },
    { name: 'Ginseng', price: '4.30', image: 'https://shop.gisecaffe.com/113-home_default/ginseng.jpg', code: 'GISE-GINSENG' },
    { name: 'Mocaccino', price: '4.90', image: 'https://shop.gisecaffe.com/117-home_default/mocaccino.jpg', code: 'GISE-MOCACCINO' },
    { name: 'Cappuccino', price: '4.40', image: 'https://shop.gisecaffe.com/121-home_default/cappuccino.jpg', code: 'GISE-CAPPUCCINO' },
    { name: 'Orzo', price: '4.30', image: 'https://shop.gisecaffe.com/125-home_default/orzo.jpg', code: 'GISE-ORZO' },
    { name: 'Tè al Limone', price: '4.00', image: 'https://shop.gisecaffe.com/129-home_default/te-al-limone.jpg', code: 'GISE-TE-LIMONE' },
    { name: 'Mirtillo e Melograno', price: '4.80', image: 'https://shop.gisecaffe.com/133-home_default/mirtillo-e-melograno.jpg', code: 'GISE-MIRTILLO-MELOGRANO' },
    { name: 'Zenzero e Limone', price: '4.80', image: 'https://shop.gisecaffe.com/137-home_default/zenzero-e-limone.jpg', code: 'GISE-ZENZERO-LIMONE' },
    { name: 'Nocciolino', price: '4.60', image: 'https://shop.gisecaffe.com/302-home_default/nocciolino.jpg', code: 'GISE-NOCCIOLINO' },
  ],
  tisane: [
    { name: 'Tisana - Tè Energy', price: '4.30', image: 'https://shop.gisecaffe.com/192-home_default/tisana-te-energy.jpg', code: 'GISE-TISANA-ENERGY' },
    { name: 'Tisana - Ventre Piatto', price: '4.30', image: 'https://shop.gisecaffe.com/196-home_default/tisana-ventre-piatto.jpg', code: 'GISE-TISANA-VENTRE' },
    { name: 'Tisana - Della Sera Rilassante', price: '4.30', image: 'https://shop.gisecaffe.com/200-home_default/tisana-della-sera-rilassante.jpg', code: 'GISE-TISANA-SERA' },
    { name: 'Tisana - Mora Curcuma e Cannella', price: '4.30', image: 'https://shop.gisecaffe.com/208-home_default/tisana-mora-curcuma-e-cannella.jpg', code: 'GISE-TISANA-MORA' },
    { name: 'Tisana - Cocco e Lampone', price: '4.30', image: 'https://shop.gisecaffe.com/204-home_default/tisana-cocco-e-lampone.jpg', code: 'GISE-TISANA-COCCO' },
    { name: 'Tisana - Drenante Anticell', price: '4.30', image: 'https://shop.gisecaffe.com/356-home_default/tisana-drenante-anticell.jpg', code: 'GISE-TISANA-DRENANTE' },
  ],
};

async function main() {
  console.log('🚀 Inizio importazione prodotti GISE Caffè...\n');

  // 1. Cerca o crea il group "Caffè e Bevande Calde"
  let [group] = await db.select().from(productGroups).where(eq(productGroups.slug, 'caffe-bevande-calde')).limit(1);
  if (!group) {
    [group] = await db.select().from(productGroups).where(eq(productGroups.code, 'CAFFE-BEVANDE')).limit(1);
  }
  if (!group) {
    // Cerca qualsiasi group con "caffè" o "caffe" nel nome
    const allGroups = await db.select().from(productGroups);
    group = allGroups.find(g => g.name.toLowerCase().includes('caff') || g.slug.includes('caff'));
    if (!group) {
      console.log('⚠️ Nessun group "Caffè" trovato. Gruppi esistenti:');
      allGroups.forEach(g => console.log(`  - [${g.id}] ${g.code}: ${g.name} (slug: ${g.slug})`));
      // Creo il gruppo
      [group] = await db.insert(productGroups).values({
        code: 'CAFFE-BEVANDE',
        name: 'Caffè e Bevande Calde',
        slug: 'caffe-bevande-calde',
        sortOrder: 1,
      }).returning();
      console.log(`✅ Creato group: ${group.name} (id: ${group.id})`);
    }
  }
  console.log(`📁 Group: ${group.name} (id: ${group.id})`);

  // 2. Cerca o crea la category "Caffè e Bevande GISE"
  let [category] = await db.select().from(productCategories).where(eq(productCategories.code, 'GISE')).limit(1);
  if (!category) {
    const allCats = await db.select().from(productCategories).where(eq(productCategories.groupId, group.id));
    category = allCats.find(c => c.name.toLowerCase().includes('gise'));
    if (!category) {
      [category] = await db.insert(productCategories).values({
        code: 'GISE',
        name: 'Caffè e Bevande GISE',
        slug: 'caffe-bevande-gise',
        groupId: group.id,
        sortOrder: 10,
      }).returning();
      console.log(`✅ Creata category: ${category.name} (id: ${category.id})`);
    }
  }
  console.log(`📂 Category: ${category.name} (id: ${category.id})`);

  // 3. Crea le sottocategorie
  const subcatDefs = [
    { code: 'GISE-CAFFE', name: 'Caffè', slug: 'gise-caffe', sortOrder: 1 },
    { code: 'GISE-BEVANDE-CALDE', name: 'Bevande Calde', slug: 'gise-bevande-calde', sortOrder: 2 },
    { code: 'GISE-TISANE', name: 'Tisane', slug: 'gise-tisane', sortOrder: 3 },
  ];

  const subcatIds: Record<string, number> = {};
  for (const def of subcatDefs) {
    let [sub] = await db.select().from(productSubcategories).where(eq(productSubcategories.code, def.code)).limit(1);
    if (!sub) {
      [sub] = await db.insert(productSubcategories).values({
        ...def,
        categoryId: category.id,
      }).returning();
      console.log(`✅ Creata subcategory: ${sub.name} (id: ${sub.id})`);
    } else {
      console.log(`📄 Subcategory esistente: ${sub.name} (id: ${sub.id})`);
    }
    subcatIds[def.code] = sub.id;
  }

  // 4. Inserisci i prodotti
  const subcatMapping: Record<string, string> = {
    caffe: 'GISE-CAFFE',
    bevandeCalde: 'GISE-BEVANDE-CALDE',
    tisane: 'GISE-TISANE',
  };

  let inserted = 0;
  let skipped = 0;

  for (const [key, prods] of Object.entries(giseProducts)) {
    const subcatCode = subcatMapping[key];
    const subcatId = subcatIds[subcatCode];

    for (const prod of prods) {
      // Check se esiste già
      const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.code, prod.code)).limit(1);
      if (existing) {
        console.log(`⏭️  Prodotto già esistente: ${prod.code} - ${prod.name}`);
        skipped++;
        continue;
      }

      await db.insert(products).values({
        code: prod.code,
        name: prod.name,
        brand: 'GISE',
        description: `Capsule compatibili GISE - ${prod.name}`,
        unit: 'CF',
        priceNet: prod.price,
        pricePublic: prod.price,
        vatCode: '22',
        stockAvailable: 100,
        isActive: true,
        isManual: true,
        isNew: true,
        imageUrl: prod.image,
        groupId: group.id,
        categoryId: category.id,
        subcategoryId: subcatId,
        minOrderQty: 1,
        orderMultiple: 1,
      });

      console.log(`✅ Inserito: ${prod.code} - ${prod.name} (€${prod.price})`);
      inserted++;
    }
  }

  console.log(`\n🎉 Importazione completata!`);
  console.log(`   ✅ Inseriti: ${inserted}`);
  console.log(`   ⏭️  Saltati: ${skipped}`);
  console.log(`   📦 Totale: ${inserted + skipped}`);

  await client.end();
}

main().catch((err) => {
  console.error('🔴 Errore:', err);
  process.exit(1);
});
