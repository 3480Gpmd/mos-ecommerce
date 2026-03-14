import { NextResponse } from 'next/server';
import { db } from '@/db';
import { productCategories, productSubcategories, products } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function POST() {
  try {
    const results: string[] = [];
    const groupId = 29; // CAFFÈ E BEVANDE CALDE

    // 1. Crea categoria ACCESSORI separata
    let [catAccessori] = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.code, 'CAT-ACCESSORI-CAFFE'))
      .limit(1);

    if (!catAccessori) {
      [catAccessori] = await db.insert(productCategories).values({
        code: 'CAT-ACCESSORI-CAFFE',
        name: 'ACCESSORI',
        slug: 'accessori-caffe',
        groupId,
        sortOrder: 30,
      }).returning();
      results.push(`✅ Categoria creata: ACCESSORI (id: ${catAccessori.id})`);
    } else {
      results.push(`⏭️ Categoria ACCESSORI già esiste (id: ${catAccessori.id})`);
    }

    // 2. Sposta le sottocategorie accessori (624, 625) sotto ACCESSORI
    await db.update(productSubcategories)
      .set({ categoryId: catAccessori.id })
      .where(inArray(productSubcategories.id, [624, 625]));
    results.push(`✅ Sottocategorie 624, 625 spostate sotto ACCESSORI`);

    // 3. Aggiorna i prodotti accessori: categoryId → ACCESSORI
    // Prodotti con subcategoryId 624 o 625
    await db.update(products)
      .set({ categoryId: catAccessori.id })
      .where(inArray(products.subcategoryId, [624, 625]));
    results.push(`✅ Prodotti accessori aggiornati con categoryId = ${catAccessori.id}`);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Restructure caffè error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
