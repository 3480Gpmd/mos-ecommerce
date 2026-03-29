import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productVariants } from '@/db/schema';
import { eq, and, ne, inArray } from 'drizzle-orm';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Get the product
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.code, code), eq(products.isActive, true)))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: 'Prodotto non trovato' }, { status: 404 });
    }

    // Get all variant groups that include this product
    const variantGroupIds = await db
      .select({ groupId: productVariants.groupId })
      .from(productVariants)
      .where(eq(productVariants.productId, product.id));

    const colorVariants: any[] = [];

    // For each variant group this product belongs to, get all variants in that group
    if (variantGroupIds.length > 0) {
      const groupIds = variantGroupIds.map((v) => v.groupId);

      const variants = await db
        .select({
          id: products.id,
          code: products.code,
          name: products.name,
          imageUrl: products.imageUrl,
          colorHex: productVariants.colorHex,
          variantLabel: productVariants.variantLabel,
        })
        .from(productVariants)
        .innerJoin(products, eq(productVariants.productId, products.id))
        .where(
          and(
            inArray(productVariants.groupId, groupIds),
            eq(products.isActive, true)
          )
        )
        .orderBy(productVariants.sortOrder);

      colorVariants.push(...variants);
    }

    // Get alternative products from same subcategory but different brands
    let alternatives: typeof products.$inferSelect[] = [];
    if (product.subcategoryId) {
      const whereConditions: any[] = [
        eq(products.subcategoryId, product.subcategoryId),
        eq(products.isActive, true),
        ne(products.id, product.id),
      ];

      // Different brand to show alternatives (if current product has brand)
      if (product.brand) {
        whereConditions.push(ne(products.brand, product.brand));
      }

      alternatives = await db
        .select()
        .from(products)
        .where(and(...whereConditions))
        .limit(10);
    }

    return NextResponse.json({
      colorVariants,
      alternatives,
    });
  } catch (err: unknown) {
    console.error('🔴 GET /api/products/[code]/variants error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
