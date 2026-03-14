import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const csvPath = path.resolve(process.env.IMPORT_CSV_PATH || './listino_completo.csv');
    const rawBuffer = fs.readFileSync(csvPath);
    const content = new TextDecoder('latin1').decode(rawBuffer);
    const lines = content.split(/\r?\n/).filter(l => l.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV vuoto' }, { status: 400 });
    }

    const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim());
    const codeIdx = headers.indexOf('CODICE_ISP');
    const minIdx = headers.indexOf('MIN_ACQUISTO');
    const deltaIdx = headers.indexOf('DELTA_RIORDINO');
    const confIdx = headers.indexOf('CONFEZIONE_PZ');

    // Raccoglie SOLO prodotti con valori non standard
    const toUpdate: { code: string; min: number; delta: number; conf: number | null }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(';').map(v => v.replace(/"/g, '').trim());
      const code = vals[codeIdx];
      if (!code) continue;

      const min = parseInt(vals[minIdx]) || 1;
      const delta = parseInt(vals[deltaIdx]) || 1;
      const conf = parseInt(vals[confIdx]) || null;

      // Solo se almeno un valore è diverso dal default
      if (min > 1 || delta > 1 || (conf && conf > 1)) {
        toUpdate.push({ code, min, delta, conf });
      }
    }

    console.log(`🔵 Aggiornamento min qty: ${toUpdate.length} prodotti da aggiornare`);

    let updated = 0;
    // Batch di 50
    for (let i = 0; i < toUpdate.length; i += 50) {
      const batch = toUpdate.slice(i, i + 50);
      const promises = batch.map(item =>
        db.update(products)
          .set({
            minOrderQty: item.min,
            orderMultiple: item.delta,
            packSize: item.conf,
          })
          .where(eq(products.code, item.code))
      );
      await Promise.all(promises);
      updated += batch.length;
      if (i % 500 === 0) {
        console.log(`  ... ${updated}/${toUpdate.length}`);
      }
    }

    return NextResponse.json({
      success: true,
      totalInCsv: lines.length - 1,
      productsWithMinQty: toUpdate.length,
      updated,
    });
  } catch (error) {
    console.error('Update min qty error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
