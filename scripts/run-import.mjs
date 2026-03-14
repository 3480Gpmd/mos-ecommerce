/**
 * Optimized CSV import script using bulk SQL operations
 * Usage: node scripts/run-import.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  const val = trimmed.slice(eqIdx + 1);
  if (!process.env[key]) process.env[key] = val;
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 5 });

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ';' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

// Read CSV
const csvPath = path.resolve(process.argv[2] || './listino_completo.csv');
console.log(`🔵 Avvio import CSV: ${csvPath}`);

const rawBuffer = fs.readFileSync(csvPath);
const content = new TextDecoder('latin1').decode(rawBuffer);
const lines = content.split(/\r?\n/).filter(l => l.trim());

const headers = parseCsvLine(lines[0]);
console.log(`📋 Headers (${headers.length})`);

const rows = [];
for (let i = 1; i < lines.length; i++) {
  const values = parseCsvLine(lines[i]);
  if (values.length < 5) continue;
  const row = {};
  headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
  rows.push(row);
}

console.log(`📊 Righe valide: ${rows.length}`);

const startTime = Date.now();

// Step 1: Extract and insert all unique groups/categories/subcategories first
console.log('\n📂 Fase 1: Inserimento gerarchie categorie...');

const groupsMap = new Map();
const categoriesMap = new Map();
const subcategoriesMap = new Map();

for (const row of rows) {
  if (row.CATALOGO_GRUPPO_CODICE && !groupsMap.has(row.CATALOGO_GRUPPO_CODICE)) {
    groupsMap.set(row.CATALOGO_GRUPPO_CODICE, {
      code: row.CATALOGO_GRUPPO_CODICE,
      name: row.CATALOGO_GRUPPO_DESCRIZIONE || row.CATALOGO_GRUPPO_CODICE,
      slug: slugify(row.CATALOGO_GRUPPO_DESCRIZIONE || row.CATALOGO_GRUPPO_CODICE),
    });
  }
  if (row.CATALOGO_CATEGORIA_CODICE && !categoriesMap.has(row.CATALOGO_CATEGORIA_CODICE)) {
    categoriesMap.set(row.CATALOGO_CATEGORIA_CODICE, {
      code: row.CATALOGO_CATEGORIA_CODICE,
      name: row.CATALOGO_CATEGORIA_DESCRIZIONE || row.CATALOGO_CATEGORIA_CODICE,
      slug: slugify(row.CATALOGO_CATEGORIA_DESCRIZIONE || row.CATALOGO_CATEGORIA_CODICE),
      groupCode: row.CATALOGO_GRUPPO_CODICE,
    });
  }
  if (row.CATALOGO_SOTTOCAT_CODICE && !subcategoriesMap.has(row.CATALOGO_SOTTOCAT_CODICE)) {
    subcategoriesMap.set(row.CATALOGO_SOTTOCAT_CODICE, {
      code: row.CATALOGO_SOTTOCAT_CODICE,
      name: row.CATALOGO_SOTTOCAT_DESCRIZIONE || row.CATALOGO_SOTTOCAT_CODICE,
      slug: slugify(row.CATALOGO_SOTTOCAT_DESCRIZIONE || row.CATALOGO_SOTTOCAT_CODICE),
      categoryCode: row.CATALOGO_CATEGORIA_CODICE,
    });
  }
}

console.log(`   Gruppi unici: ${groupsMap.size}, Categorie: ${categoriesMap.size}, Sottocategorie: ${subcategoriesMap.size}`);

// Insert groups
const groupValues = [...groupsMap.values()];
if (groupValues.length > 0) {
  // Handle slug conflicts by appending code
  const slugCounts = {};
  for (const g of groupValues) {
    slugCounts[g.slug] = (slugCounts[g.slug] || 0) + 1;
    if (slugCounts[g.slug] > 1) g.slug = `${g.slug}-${g.code.toLowerCase()}`;
  }

  for (const g of groupValues) {
    await sql`
      INSERT INTO product_groups (code, name, slug)
      VALUES (${g.code}, ${g.name}, ${g.slug})
      ON CONFLICT (code) DO NOTHING
    `;
  }
}

// Fetch all group IDs
const groupIdMap = new Map();
const allGroups = await sql`SELECT id, code FROM product_groups`;
allGroups.forEach(g => groupIdMap.set(g.code, g.id));

// Insert categories
const catValues = [...categoriesMap.values()];
if (catValues.length > 0) {
  const slugCounts = {};
  for (const c of catValues) {
    slugCounts[c.slug] = (slugCounts[c.slug] || 0) + 1;
    if (slugCounts[c.slug] > 1) c.slug = `${c.slug}-${c.code.toLowerCase()}`;
  }

  for (const c of catValues) {
    const gid = groupIdMap.get(c.groupCode);
    if (!gid) continue;
    await sql`
      INSERT INTO product_categories (code, name, slug, group_id)
      VALUES (${c.code}, ${c.name}, ${c.slug}, ${gid})
      ON CONFLICT (code) DO NOTHING
    `;
  }
}

// Fetch all category IDs
const catIdMap = new Map();
const allCats = await sql`SELECT id, code FROM product_categories`;
allCats.forEach(c => catIdMap.set(c.code, c.id));

// Insert subcategories
const subValues = [...subcategoriesMap.values()];
if (subValues.length > 0) {
  const slugCounts = {};
  for (const s of subValues) {
    slugCounts[s.slug] = (slugCounts[s.slug] || 0) + 1;
    if (slugCounts[s.slug] > 1) s.slug = `${s.slug}-${s.code.toLowerCase()}`;
  }

  for (const s of subValues) {
    const cid = catIdMap.get(s.categoryCode);
    if (!cid) continue;
    await sql`
      INSERT INTO product_subcategories (code, name, slug, category_id)
      VALUES (${s.code}, ${s.name}, ${s.slug}, ${cid})
      ON CONFLICT (code) DO NOTHING
    `;
  }
}

// Fetch all subcategory IDs
const subIdMap = new Map();
const allSubs = await sql`SELECT id, code FROM product_subcategories`;
allSubs.forEach(s => subIdMap.set(s.code, s.id));

console.log(`   ✅ Gruppi: ${groupIdMap.size}, Categorie: ${catIdMap.size}, Sottocategorie: ${subIdMap.size}`);

// Step 2: Get existing product codes to know which to INSERT vs UPDATE
console.log('\n📦 Fase 2: Caricamento prodotti esistenti...');
const existingProducts = await sql`SELECT code, is_manual FROM products`;
const existingMap = new Map();
existingProducts.forEach(p => existingMap.set(p.code, p.is_manual));
console.log(`   Prodotti esistenti: ${existingMap.size}`);

// Step 3: Bulk insert/update products
console.log('\n📦 Fase 3: Import prodotti...');

// Create import log
const [importLog] = await sql`
  INSERT INTO csv_imports (filename, status, total_rows, imported_at)
  VALUES ('listino_completo.csv', 'running', ${rows.length}, NOW())
  RETURNING id
`;

let productsNew = 0;
let productsUpdated = 0;
let errors = 0;

const BATCH_SIZE = 500;
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);

  const newProducts = [];
  const updateProducts = [];

  for (const row of batch) {
    const code = row.CODICE_ISP;
    if (!code) continue;

    const groupId = groupIdMap.get(row.CATALOGO_GRUPPO_CODICE) || null;
    const categoryId = catIdMap.get(row.CATALOGO_CATEGORIA_CODICE) || null;
    const subcategoryId = subIdMap.get(row.CATALOGO_SOTTOCAT_CODICE) || null;

    const product = {
      code,
      name: row.DESCRIZIONE,
      brand: row.MARCA || null,
      partNumber: row.PARTNUMBER || null,
      barcode: row.BARCODE_PZ || null,
      pricePublic: row.PREZZO_PUBBLICO ? row.PREZZO_PUBBLICO.replace(',', '.') : null,
      priceNet: row.PREZZO_NETTO ? row.PREZZO_NETTO.replace(',', '.') : '0',
      vatCode: row.CODIVA ? row.CODIVA.replace(',', '.') : '22',
      stockAvailable: parseInt(row.GIACENZA_DISPONIBILE) || 0,
      stockOrdered: parseInt(row.ORDINATO_FORNITORE) || 0,
      stockArrivalDate: row.PREVISIONE_ARRIVO || null,
      isPromo: row.IN_PROMOZIONE === 'S',
      isExhausting: row.IN_ESAURIMENTO === 'S',
      imageUrl: row.IMMAGINE || null,
      unit: row.UNITA_MISURA_QTA || 'PZ',
      groupId,
      categoryId,
      subcategoryId,
    };

    if (existingMap.has(code)) {
      if (!existingMap.get(code)) { // skip manual products
        updateProducts.push(product);
      }
    } else {
      newProducts.push(product);
    }
  }

  // Bulk INSERT new products using ON CONFLICT to handle any duplicates from previous partial run
  if (newProducts.length > 0) {
    try {
      const result = await sql`
        INSERT INTO products ${sql(newProducts.map(p => ({
          code: p.code,
          name: p.name,
          brand: p.brand,
          part_number: p.partNumber,
          barcode: p.barcode,
          price_public: p.pricePublic,
          price_net: p.priceNet,
          vat_code: p.vatCode,
          stock_available: p.stockAvailable,
          stock_ordered: p.stockOrdered,
          stock_arrival_date: p.stockArrivalDate,
          is_promo: p.isPromo,
          is_exhausting: p.isExhausting,
          is_active: true,
          image_url: p.imageUrl,
          unit: p.unit,
          group_id: p.groupId,
          category_id: p.categoryId,
          subcategory_id: p.subcategoryId,
        })))}
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          brand = EXCLUDED.brand,
          part_number = EXCLUDED.part_number,
          barcode = EXCLUDED.barcode,
          price_public = EXCLUDED.price_public,
          price_net = EXCLUDED.price_net,
          vat_code = EXCLUDED.vat_code,
          stock_available = EXCLUDED.stock_available,
          stock_ordered = EXCLUDED.stock_ordered,
          stock_arrival_date = EXCLUDED.stock_arrival_date,
          is_promo = EXCLUDED.is_promo,
          is_exhausting = EXCLUDED.is_exhausting,
          is_active = true,
          image_url = EXCLUDED.image_url,
          unit = EXCLUDED.unit,
          group_id = EXCLUDED.group_id,
          category_id = EXCLUDED.category_id,
          subcategory_id = EXCLUDED.subcategory_id,
          updated_at = NOW()
      `;
      productsNew += newProducts.length;
    } catch (err) {
      errors += newProducts.length;
      if (errors <= 10) console.error(`  ❌ Batch insert error: ${err.message}`);
    }
  }

  // Bulk UPDATE existing products
  if (updateProducts.length > 0) {
    for (const p of updateProducts) {
      try {
        await sql`
          UPDATE products SET
            name = ${p.name}, brand = ${p.brand}, part_number = ${p.partNumber},
            barcode = ${p.barcode}, price_public = ${p.pricePublic}, price_net = ${p.priceNet},
            vat_code = ${p.vatCode}, stock_available = ${p.stockAvailable},
            stock_ordered = ${p.stockOrdered}, stock_arrival_date = ${p.stockArrivalDate},
            is_promo = ${p.isPromo}, is_exhausting = ${p.isExhausting}, is_active = true,
            image_url = ${p.imageUrl}, unit = ${p.unit},
            group_id = ${p.groupId}, category_id = ${p.categoryId}, subcategory_id = ${p.subcategoryId},
            updated_at = NOW()
          WHERE code = ${p.code}
        `;
        productsUpdated++;
      } catch (err) {
        errors++;
        if (errors <= 10) console.error(`  ❌ Update ${p.code}: ${err.message}`);
      }
    }
  }

  const progress = Math.min(i + BATCH_SIZE, rows.length);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  const pct = ((progress / rows.length) * 100).toFixed(1);
  console.log(`🔵 ${progress}/${rows.length} (${pct}%) [${elapsed}s] nuovi: ${productsNew}, aggiornati: ${productsUpdated}, errori: ${errors}`);
}

const durationMs = Date.now() - startTime;

// Update import log
await sql`
  UPDATE csv_imports SET
    status = 'completed',
    products_new = ${productsNew},
    products_updated = ${productsUpdated},
    products_deactivated = 0,
    errors = ${errors},
    duration_ms = ${durationMs}
  WHERE id = ${importLog.id}
`;

console.log(`\n🟢 Import completato in ${(durationMs / 1000).toFixed(1)}s`);
console.log(`   Nuovi: ${productsNew}`);
console.log(`   Aggiornati: ${productsUpdated}`);
console.log(`   Errori: ${errors}`);

await sql.end();
process.exit(0);
