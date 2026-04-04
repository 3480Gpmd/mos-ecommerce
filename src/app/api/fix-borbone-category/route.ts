import { NextResponse } from 'next/server';
import { db } from '@/db';
import { productCategories, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * FIX: Unifica le due categorie "Caffè Borbone" duplicate.
 * - Sposta tutti i prodotti dalla categoria duplicata (id=188) alla categoria originale (id=179)
 * - Elimina la categoria duplicata
 */
export async function POST() {
  try {
    const results: string[] = [];

    // 1. Trova tutte le categorie con slug "caffe-borbone"
    const borboneCategories = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.slug, 'caffe-borbone'));

    results.push(`Categorie "caffe-borbone" trovate: ${borboneCategories.length}`);

    if (borboneCategories.length < 2) {
      return NextResponse.json({
        success: true,
        message: 'Nessun duplicato trovato — solo una categoria Caffè Borbone.',
        results,
      });
    }

    // La categoria "buona" è quella con le sottocategorie (seed-borbone, id più basso)
    const goodCat = borboneCategories.reduce((a, b) => (a.id < b.id ? a : b));
    const dupes = borboneCategories.filter((c) => c.id !== goodCat.id);

    results.push(`Categoria principale: id=${goodCat.id} (${goodCat.name}, code=${goodCat.code})`);

    // 2. Sposta prodotti dalle categorie duplicate alla principale
    for (const dupe of dupes) {
      await db
        .update(products)
        .set({ categoryId: goodCat.id })
        .where(eq(products.categoryId, dupe.id));

      results.push(`Prodotti spostati da id=${dupe.id} (${dupe.name})`);

      // 3. Elimina la categoria duplicata
      await db.delete(productCategories).where(eq(productCategories.id, dupe.id));
      results.push(`Categoria duplicata id=${dupe.id} eliminata`);
    }

    // 4. Normalizza il nome della categoria principale
    await db
      .update(productCategories)
      .set({ name: 'Caffè Borbone' })
      .where(eq(productCategories.id, goodCat.id));
    results.push('Nome normalizzato a "Caffè Borbone"');

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Fix Borbone category error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
