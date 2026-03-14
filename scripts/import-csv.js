#!/usr/bin/env node

/**
 * Script CLI per import settimanale del listino CSV.
 * Uso: node scripts/import-csv.js [percorso-csv]
 * Default: ./listino_completo.csv
 */

const path = require('path');

async function main() {
  const csvPath = process.argv[2] || process.env.IMPORT_CSV_PATH || './listino_completo.csv';
  const resolvedPath = path.resolve(csvPath);

  console.log(`🔵 Avvio import CSV: ${resolvedPath}`);
  console.log(`📅 ${new Date().toLocaleString('it-IT')}`);

  // Since this is a Next.js project, we call the API endpoint
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const apiKey = process.env.CRM_API_KEY || '';

  try {
    const res = await fetch(`${baseUrl}/api/import-csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: in production, use a proper admin auth token
      },
      body: JSON.stringify({ filePath: resolvedPath }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log('🟢 Import completato!');
      console.log(`   Righe totali: ${data.totalRows}`);
      console.log(`   Nuovi: ${data.productsNew}`);
      console.log(`   Aggiornati: ${data.productsUpdated}`);
      console.log(`   Disattivati: ${data.productsDeactivated}`);
      console.log(`   Errori: ${data.errors}`);
      console.log(`   Durata: ${(data.durationMs / 1000).toFixed(1)}s`);
    } else {
      console.error('🔴 Errore:', data.error);
      process.exit(1);
    }
  } catch (err) {
    console.error('🔴 Errore di connessione:', err.message);
    console.error('   Assicurati che il server sia avviato su', baseUrl);
    process.exit(1);
  }
}

main();
