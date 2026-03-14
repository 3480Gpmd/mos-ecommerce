import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envContent = fs.readFileSync(path.resolve(__dirname, '..', '.env.local'), 'utf-8');
for (const line of envContent.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i === -1) continue;
  if (!process.env[t.slice(0, i)]) process.env[t.slice(0, i)] = t.slice(i + 1);
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

const groups = await sql`SELECT id, code, name, slug FROM product_groups ORDER BY sort_order, name`;
console.log('GRUPPI:', JSON.stringify(groups, null, 2));

const cats = await sql`SELECT id, name, slug, group_id FROM product_categories ORDER BY name`;
console.log('\nCATEGORIE per gruppo:');
for (const g of groups) {
  const groupCats = cats.filter(c => c.group_id === g.id);
  if (groupCats.length > 0) {
    console.log(`  ${g.name} (${g.id}): ${groupCats.map(c => c.name).join(', ')}`);
  }
}
console.log('\nTotale gruppi:', groups.length, 'Totale categorie:', cats.length);

await sql.end();
