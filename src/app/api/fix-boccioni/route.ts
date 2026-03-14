import { NextResponse } from 'next/server';
import { db } from '@/db';
import { productCategories, productSubcategories, products } from '@/db/schema';
import { eq, and, like, sql } from 'drizzle-orm';

export async function POST() {
  try {
    const results: string[] = [];
    const GRP_FREDDE = 31;

    // 1. Trova o crea la categoria BOCCIONI (la teniamo, id 184)
    let [boccioniCat] = await db.select().from(productCategories)
      .where(eq(productCategories.code, 'CAT-BOCCIONI')).limit(1);
    if (!boccioniCat) {
      [boccioniCat] = await db.select().from(productCategories)
        .where(eq(productCategories.id, 184)).limit(1);
    }
    results.push(`Categoria BOCCIONI: id=${boccioniCat?.id || 'non trovata'}`);

    // 2. Trova sottocategorie di ACCESSORI BOCCIONI (id 185)
    const accSubs = await db.select().from(productSubcategories)
      .where(eq(productSubcategories.categoryId, 185));
    results.push(`Sottocategorie ACCESSORI BOCCIONI (185): ${accSubs.length}`);

    // 3. Trova prodotti accessori (SKU BOCC-ACC-*)
    const accProducts = await db.select().from(products)
      .where(like(products.code, 'BOCC-ACC-%'));
    results.push(`Prodotti BOCC-ACC-*: ${accProducts.length}`);

    if (boccioniCat) {
      // 4. Crea sottocategoria "Accessori" dentro BOCCIONI
      let [accSub] = await db.select().from(productSubcategories)
        .where(eq(productSubcategories.code, 'SUB-BOCC-ACCESSORI')).limit(1);
      if (!accSub) {
        [accSub] = await db.insert(productSubcategories).values({
          code: 'SUB-BOCC-ACCESSORI',
          name: 'ACCESSORI',
          slug: 'accessori-boccioni',
          categoryId: boccioniCat.id,
          sortOrder: 50,
        }).returning();
        results.push(`Creata sottocategoria ACCESSORI sotto BOCCIONI: id=${accSub.id}`);
      } else {
        // Sposta sotto BOCCIONI se non lo è già
        if (accSub.categoryId !== boccioniCat.id) {
          await db.update(productSubcategories)
            .set({ categoryId: boccioniCat.id })
            .where(eq(productSubcategories.id, accSub.id));
          results.push(`Spostata sottocategoria ACCESSORI sotto BOCCIONI`);
        } else {
          results.push(`Sottocategoria ACCESSORI già sotto BOCCIONI: id=${accSub.id}`);
        }
      }

      // 5. Sposta i prodotti accessori: categoryId → BOCCIONI, subcategoryId → ACCESSORI
      if (accProducts.length > 0) {
        await db.update(products)
          .set({
            categoryId: boccioniCat.id,
            subcategoryId: accSub.id,
          })
          .where(like(products.code, 'BOCC-ACC-%'));
        results.push(`Spostati ${accProducts.length} prodotti accessori sotto BOCCIONI > ACCESSORI`);
      }

      // 6. Sposta eventuali sottocategorie rimaste in ACCESSORI BOCCIONI (185) sotto BOCCIONI
      if (accSubs.length > 0) {
        for (const sub of accSubs) {
          await db.update(productSubcategories)
            .set({ categoryId: boccioniCat.id })
            .where(eq(productSubcategories.id, sub.id));
          results.push(`Spostata sottocategoria "${sub.name}" (${sub.id}) sotto BOCCIONI`);
        }
      }
    }

    // 7. Elimina la categoria ACCESSORI BOCCIONI (185) — ora vuota
    // Prima controlla che non ci siano più prodotti
    const remainingInAcc = await db.select({ count: sql<number>`count(*)` }).from(products)
      .where(eq(products.categoryId, 185));
    const remainingCount = Number(remainingInAcc[0]?.count || 0);

    if (remainingCount === 0) {
      // Elimina sottocategorie rimaste
      await db.delete(productSubcategories).where(eq(productSubcategories.categoryId, 185));
      // Elimina la categoria
      await db.delete(productCategories).where(eq(productCategories.id, 185));
      results.push('Eliminata categoria ACCESSORI BOCCIONI (185)');
    } else {
      results.push(`ATTENZIONE: categoria 185 ha ancora ${remainingCount} prodotti, non eliminata`);
    }

    // 8. Elimina anche la vecchia "BOCCIONI E ACCESSORI" (178) se vuota
    const remainingIn178 = await db.select({ count: sql<number>`count(*)` }).from(products)
      .where(eq(products.categoryId, 178));
    const count178 = Number(remainingIn178[0]?.count || 0);

    if (count178 === 0) {
      await db.delete(productSubcategories).where(eq(productSubcategories.categoryId, 178));
      await db.delete(productCategories).where(eq(productCategories.id, 178));
      results.push('Eliminata categoria BOCCIONI E ACCESSORI (178)');
    } else {
      results.push(`Categoria 178 ha ${count178} prodotti, non eliminata`);
    }

    // 9. Verifica finale
    const finalSubs = await db.select().from(productSubcategories)
      .where(eq(productSubcategories.categoryId, boccioniCat?.id || 0));
    results.push(`\nStruttura finale BOCCIONI (${boccioniCat?.id}):`);
    for (const s of finalSubs) {
      const prodCount = await db.select({ count: sql<number>`count(*)` }).from(products)
        .where(eq(products.subcategoryId, s.id));
      results.push(`  - ${s.name} (${s.slug}): ${prodCount[0]?.count || 0} prodotti`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
