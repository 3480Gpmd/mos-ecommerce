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

// Execute migration SQL
const migrationSql = fs.readFileSync(path.resolve(__dirname, '..', 'drizzle', '0001_colorful_juggernaut.sql'), 'utf-8');
const statements = migrationSql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);

console.log(`Eseguendo ${statements.length} statement SQL...`);
for (let i = 0; i < statements.length; i++) {
  try {
    await sql.unsafe(statements[i]);
    console.log(`  ✅ Statement ${i + 1}/${statements.length} OK`);
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log(`  ⏭️ Statement ${i + 1}/${statements.length} già esistente, skip`);
    } else {
      console.error(`  ❌ Statement ${i + 1}/${statements.length}: ${err.message}`);
    }
  }
}

// Seed default price lists
console.log('\nCreazione listini predefiniti...');
const lists = [
  { code: 'standard', name: 'Listino Standard', description: 'Listino base per clienti privati', discount_pct: '0', is_default: true },
  { code: 'rivenditori', name: 'Listino Rivenditori', description: 'Listino scontato per rivenditori', discount_pct: '15' },
  { code: 'vip', name: 'Listino VIP', description: 'Listino premium per clienti VIP', discount_pct: '10' },
];

for (const list of lists) {
  try {
    await sql`
      INSERT INTO price_lists (code, name, description, discount_pct, is_default)
      VALUES (${list.code}, ${list.name}, ${list.description}, ${list.discount_pct}, ${list.is_default || false})
      ON CONFLICT (code) DO NOTHING
    `;
    console.log(`  ✅ Listino "${list.name}" creato`);
  } catch (err) {
    console.log(`  ⏭️ Listino "${list.name}": ${err.message}`);
  }
}

console.log('\n🟢 Migrazione completata!');
await sql.end();
