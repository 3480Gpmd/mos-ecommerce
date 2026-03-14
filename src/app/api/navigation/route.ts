import { NextResponse } from 'next/server';
import { db } from '@/db';
import { productGroups, productCategories, productSubcategories } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';

export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const groups = await db
      .select({
        id: productGroups.id,
        name: productGroups.name,
        slug: productGroups.slug,
      })
      .from(productGroups)
      .orderBy(asc(productGroups.sortOrder), asc(productGroups.name));

    const categories = await db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        slug: productCategories.slug,
        groupId: productCategories.groupId,
      })
      .from(productCategories)
      .orderBy(asc(productCategories.name));

    const subcategories = await db
      .select({
        id: productSubcategories.id,
        name: productSubcategories.name,
        slug: productSubcategories.slug,
        categoryId: productSubcategories.categoryId,
      })
      .from(productSubcategories)
      .orderBy(asc(productSubcategories.name));

    const subcatsByCategory = new Map<number, { id: number; name: string; slug: string }[]>();
    for (const sub of subcategories) {
      const list = subcatsByCategory.get(sub.categoryId) ?? [];
      list.push({ id: sub.id, name: sub.name, slug: sub.slug });
      subcatsByCategory.set(sub.categoryId, list);
    }

    const categoriesByGroup = new Map<number, { id: number; name: string; slug: string; subcategories: { id: number; name: string; slug: string }[] }[]>();
    for (const cat of categories) {
      const list = categoriesByGroup.get(cat.groupId) ?? [];
      list.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        subcategories: subcatsByCategory.get(cat.id) ?? [],
      });
      categoriesByGroup.set(cat.groupId, list);
    }

    const result = groups.map((group) => ({
      ...group,
      categories: categoriesByGroup.get(group.id) ?? [],
    }));

    return NextResponse.json({ groups: result });
  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json(
      { error: 'Failed to load navigation' },
      { status: 500 },
    );
  }
}
