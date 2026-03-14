import { NextResponse } from 'next/server';
import { db } from '@/db';
import { productGroups, productCategories, productSubcategories, products } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

// Split into 4 categories: Capsule Caffè, Bevande Calde, Accessori Eco, Accessori Plastica
export async function POST() {
  try {
    const [group] = await db
      .select({ id: productGroups.id })
      .from(productGroups)
      .where(eq(productGroups.code, 'GRP-CAFFE'));

    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

    // Define 4 new categories
    const newCats = [
      { code: 'CAT-LVF-CAFFE', name: 'CAPSULE CAFFÈ', slug: 'capsule-caffe', sortOrder: 1 },
      { code: 'CAT-LVF-BEVANDE', name: 'BEVANDE CALDE', slug: 'bevande-calde-cat', sortOrder: 2 },
      { code: 'CAT-LVF-ACC-ECO', name: 'ACCESSORI ECO-FRIENDLY', slug: 'accessori-eco-friendly-cat', sortOrder: 3 },
      { code: 'CAT-LVF-ACC-PLAST', name: 'ACCESSORI DI PLASTICA', slug: 'accessori-plastica-cat', sortOrder: 4 },
    ];

    const catIds: Record<string, number> = {};
    for (const cat of newCats) {
      const [ins] = await db
        .insert(productCategories)
        .values({ ...cat, groupId: group.id })
        .onConflictDoNothing()
        .returning();
      catIds[cat.code] = ins?.id || (await db.select({ id: productCategories.id }).from(productCategories).where(eq(productCategories.code, cat.code)))[0]?.id;
    }

    // Map subcategories to new categories and update products
    const subToNewCat: Record<string, string> = {
      'SUB-LVF-CAFFE': 'CAT-LVF-CAFFE',
      'SUB-LVF-BEVANDE': 'CAT-LVF-BEVANDE',
      'SUB-LVF-ACC-ECO': 'CAT-LVF-ACC-ECO',
      'SUB-LVF-ACC-PLAST': 'CAT-LVF-ACC-PLAST',
    };

    for (const [subCode, newCatCode] of Object.entries(subToNewCat)) {
      const [sub] = await db
        .select({ id: productSubcategories.id })
        .from(productSubcategories)
        .where(eq(productSubcategories.code, subCode));

      if (sub) {
        // Move subcategory to new category
        await db
          .update(productSubcategories)
          .set({ categoryId: catIds[newCatCode] })
          .where(eq(productSubcategories.id, sub.id));

        // Move products to new category
        await db
          .update(products)
          .set({ categoryId: catIds[newCatCode] })
          .where(eq(products.subcategoryId, sub.id));
      }
    }

    // Clean up old empty categories
    const allCats = await db
      .select({ id: productCategories.id, code: productCategories.code })
      .from(productCategories)
      .where(eq(productCategories.groupId, group.id));

    const newCodes = newCats.map(c => c.code);
    for (const cat of allCats) {
      if (!newCodes.includes(cat.code)) {
        // Check if empty
        const hasProducts = await db.select({ id: products.id }).from(products).where(eq(products.categoryId, cat.id)).limit(1);
        const hasSubs = await db.select({ id: productSubcategories.id }).from(productSubcategories).where(eq(productSubcategories.categoryId, cat.id)).limit(1);
        if (hasProducts.length === 0 && hasSubs.length === 0) {
          await db.delete(productCategories).where(eq(productCategories.id, cat.id));
        }
      }
    }

    return NextResponse.json({ success: true, categories: catIds });
  } catch (err) {
    console.error('Fix error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Rename subcategories to match category names
export async function PATCH() {
  try {
    const renames = [
      { code: 'SUB-LVF-CAFFE', newName: 'CAPSULE CAFFÈ', newSlug: 'capsule-caffe' },
      { code: 'SUB-LVF-BEVANDE', newName: 'BEVANDE CALDE', newSlug: 'bevande-calde' },
      { code: 'SUB-LVF-ACC-ECO', newName: 'ACCESSORI ECO-FRIENDLY', newSlug: 'accessori-eco-friendly' },
      { code: 'SUB-LVF-ACC-PLAST', newName: 'ACCESSORI DI PLASTICA', newSlug: 'accessori-di-plastica' },
    ];

    const updated = [];
    for (const r of renames) {
      const result = await db
        .update(productSubcategories)
        .set({ name: r.newName, slug: r.newSlug })
        .where(eq(productSubcategories.code, r.code))
        .returning({ id: productSubcategories.id, name: productSubcategories.name });
      if (result[0]) updated.push(result[0]);
    }

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error('Rename error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
