import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productGroups, productCategories, productSubcategories } from '@/db/schema';
import { eq, and, ilike, sql, desc, asc } from 'drizzle-orm';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().optional(),
  group: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  promo: z.string().optional(),
  isNew: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(24),
  sort: z.enum(['name', 'price_asc', 'price_desc', 'newest']).default('name'),
});

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = searchSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Parametri non validi', details: parsed.error.flatten() }, { status: 400 });
    }

    const { q, group, category, subcategory, brand, promo, isNew, page, limit, sort } = parsed.data;
    const offset = (page - 1) * limit;

    const conditions = [eq(products.isActive, true)];

    if (q) {
      conditions.push(ilike(products.name, `%${q}%`));
    }
    if (brand) {
      conditions.push(ilike(products.brand, `%${brand}%`));
    }
    if (promo === 'true') {
      conditions.push(eq(products.isPromo, true));
    }
    if (isNew === 'true') {
      conditions.push(eq(products.isNew, true));
    }
    if (group) {
      const [g] = await db.select({ id: productGroups.id }).from(productGroups).where(eq(productGroups.slug, group)).limit(1);
      if (g) conditions.push(eq(products.groupId, g.id));
    }
    if (category) {
      const [c] = await db.select({ id: productCategories.id }).from(productCategories).where(eq(productCategories.slug, category)).limit(1);
      if (c) conditions.push(eq(products.categoryId, c.id));
    }
    if (subcategory) {
      const [s] = await db.select({ id: productSubcategories.id }).from(productSubcategories).where(eq(productSubcategories.slug, subcategory)).limit(1);
      if (s) conditions.push(eq(products.subcategoryId, s.id));
    }

    const where = and(...conditions);

    const orderBy = sort === 'price_asc'
      ? [asc(products.priceNet)]
      : sort === 'price_desc'
        ? [desc(products.priceNet)]
        : sort === 'newest'
          ? [desc(products.createdAt)]
          : [asc(products.name)];

    const [items, countResult] = await Promise.all([
      db.select()
        .from(products)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` })
        .from(products)
        .where(where),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      products: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    console.error('🔴 GET /api/products error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
