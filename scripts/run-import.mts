/**
 * Standalone CSV import script
 * Usage: npx tsx scripts/run-import.mts
 */
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(import.meta.dirname || '.', '..', '.env.local');
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

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  products, productGroups, productCategories, productSubcategories, csvImports
} from '../src/db/schema';
import { eq, notInArray, and } from 'drizzle-orm';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
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

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

const csvPath = path.resolve(process.argv[2] || './listino_completo.csv');
console.log(`🔵 Avvio import CSV: ${csvPath}`);

const rawBuffer = fs.readFileSync(csvPath);
const content = new TextDecoder('latin1').decode(rawBuffer);
const lines = content.split(/\r?\n/).filter((l) => l.trim());

if (lines.length < 2) {
  console.error('CSV vuoto o non valido');
  process.exit(1);
}

const headers = parseCsvLine(lines[0]);
console.log(`📋 Headers (${headers.length}): ${headers.slice(0, 10).join(', ')}...`);
console.log(`📊 Righe dati: ${lines.length - 1}`);

interface CsvRow {
  [key: string]: string;
}

const rows: CsvRow[] = [];
for (let i = 1; i < lines.length; i++) {
  const values = parseCsvLine(lines[i]);
  if (values.length < 5) continue;
  const row: CsvRow = {};
  headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
  rows.push(row);
}

console.log(`📊 Righe valide: ${rows.length}`);

const startTime = Date.now();
let productsNew = 0;
let productsUpdated = 0;
let errors = 0;
const importedCodes: string[] = [];

// Create import log
const [importLog] = await db.insert(csvImports).values({
  filename: 'listino_completo.csv',
  status: 'running',
  totalRows: rows.length,
}).returning();

// Cache groups/categories/subcategories
const groupCache = new Map<string, number>();
const categoryCache = new Map<string, number>();
const subcategoryCache = new Map<string, number>();

const existingGroups = await db.select().from(productGroups);
existingGroups.forEach((g) => groupCache.set(g.code, g.id));
const existingCategories = await db.select().from(productCategories);
existingCategories.forEach((c) => categoryCache.set(c.code, c.id));
const existingSubcategories = await db.select().from(productSubcategories);
existingSubcategories.forEach((s) => subcategoryCache.set(s.code, s.id));

const BATCH_SIZE = 200;
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);

  for (const row of batch) {
    try {
      const code = row.CODICE_ISP;
      if (!code) continue;

      // Ensure group
      let groupId: number | null = null;
      if (row.CATALOGO_GRUPPO_CODICE) {
        if (!groupCache.has(row.CATALOGO_GRUPPO_CODICE)) {
          const [g] = await db.insert(productGroups).values({
            code: row.CATALOGO_GRUPPO_CODICE,
            name: row.CATALOGO_GRUPPO_DESCRIZIONE || row.CATALOGO_GRUPPO_CODICE,
            slug: slugify(row.CATALOGO_GRUPPO_DESCRIZIONE || row.CATALOGO_GRUPPO_CODICE),
          }).onConflictDoNothing().returning();
          if (g) groupCache.set(g.code, g.id);
          else {
            const ex = await db.select().from(productGroups).where(eq(productGroups.code, row.CATALOGO_GRUPPO_CODICE)).limit(1);
            if (ex[0]) groupCache.set(ex[0].code, ex[0].id);
          }
        }
        groupId = groupCache.get(row.CATALOGO_GRUPPO_CODICE) || null;
      }

      // Ensure category
      let categoryId: number | null = null;
      if (row.CATALOGO_CATEGORIA_CODICE && groupId) {
        if (!categoryCache.has(row.CATALOGO_CATEGORIA_CODICE)) {
          const [c] = await db.insert(productCategories).values({
            code: row.CATALOGO_CATEGORIA_CODICE,
            name: row.CATALOGO_CATEGORIA_DESCRIZIONE || row.CATALOGO_CATEGORIA_CODICE,
            slug: slugify(row.CATALOGO_CATEGORIA_DESCRIZIONE || row.CATALOGO_CATEGORIA_CODICE),
            groupId,
          }).onConflictDoNothing().returning();
          if (c) categoryCache.set(c.code, c.id);
          else {
            const ex = await db.select().from(productCategories).where(eq(productCategories.code, row.CATALOGO_CATEGORIA_CODICE)).limit(1);
            if (ex[0]) categoryCache.set(ex[0].code, ex[0].id);
          }
        }
        categoryId = categoryCache.get(row.CATALOGO_CATEGORIA_CODICE) || null;
      }

      // Ensure subcategory
      let subcategoryId: number | null = null;
      if (row.CATALOGO_SOTTOCAT_CODICE && categoryId) {
        if (!subcategoryCache.has(row.CATALOGO_SOTTOCAT_CODICE)) {
          const [s] = await db.insert(productSubcategories).values({
            code: row.CATALOGO_SOTTOCAT_CODICE,
            name: row.CATALOGO_SOTTOCAT_DESCRIZIONE || row.CATALOGO_SOTTOCAT_CODICE,
            slug: slugify(row.CATALOGO_SOTTOCAT_DESCRIZIONE || row.CATALOGO_SOTTOCAT_CODICE),
            categoryId,
          }).onConflictDoNothing().returning();
          if (s) subcategoryCache.set(s.code, s.id);
          else {
            const ex = await db.select().from(productSubcategories).where(eq(productSubcategories.code, row.CATALOGO_SOTTOCAT_CODICE)).limit(1);
            if (ex[0]) subcategoryCache.set(ex[0].code, ex[0].id);
          }
        }
        subcategoryId = subcategoryCache.get(row.CATALOGO_SOTTOCAT_CODICE) || null;
      }

      // Check existing product
      const existing = await db.select({ id: products.id, isManual: products.isManual })
        .from(products)
        .where(eq(products.code, code))
        .limit(1);

      const productData = {
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
        isActive: true,
        imageUrl: row.IMMAGINE || null,
        unit: row.UNITA_MISURA_QTA || 'PZ',
        groupId,
        categoryId,
        subcategoryId,
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        if (existing[0].isManual) {
          importedCodes.push(code);
          continue;
        }
        await db.update(products).set(productData).where(eq(products.code, code));
        productsUpdated++;
      } else {
        await db.insert(products).values({ code, ...productData });
        productsNew++;
      }

      importedCodes.push(code);
    } catch (err: unknown) {
      errors++;
      if (errors <= 10) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  ❌ ${row.CODICE_ISP}: ${msg}`);
      }
    }
  }

  const progress = Math.min(i + BATCH_SIZE, rows.length);
  const pct = ((progress / rows.length) * 100).toFixed(1);
  console.log(`🔵 ${progress}/${rows.length} (${pct}%) - nuovi: ${productsNew}, aggiornati: ${productsUpdated}, errori: ${errors}`);
}

const durationMs = Date.now() - startTime;

// Update import log
await db.update(csvImports).set({
  status: 'completed',
  productsNew,
  productsUpdated,
  productsDeactivated: 0,
  errors,
  durationMs,
}).where(eq(csvImports.id, importLog.id));

console.log(`\n🟢 Import completato in ${(durationMs / 1000).toFixed(1)}s`);
console.log(`   Nuovi: ${productsNew}`);
console.log(`   Aggiornati: ${productsUpdated}`);
console.log(`   Errori: ${errors}`);
console.log(`   Gruppi: ${groupCache.size}, Categorie: ${categoryCache.size}, Sottocategorie: ${subcategoryCache.size}`);

await client.end();
process.exit(0);
