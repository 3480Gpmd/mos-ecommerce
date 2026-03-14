import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productGroups, productCategories, productSubcategories } from '@/db/schema';
import { eq, and, asc, sql, ilike } from 'drizzle-orm';

// GET /api/printer-search?action=brands       → marche stampanti (categorie sotto CONSUMABILI)
// GET /api/printer-search?action=models&brand=hp  → modelli/sottocategorie per marca
// GET /api/printer-search?action=products&brand=hp&model=laserjet-pro  → prodotti per marca+modello
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const action = searchParams.get('action');

  try {
    // Trova il gruppo CONSUMABILI
    const consumabiliGroup = await db
      .select({ id: productGroups.id })
      .from(productGroups)
      .where(sql`UPPER(${productGroups.name}) = 'CONSUMABILI'`)
      .limit(1);

    if (!consumabiliGroup[0]) {
      return NextResponse.json({ error: 'Gruppo CONSUMABILI non trovato' }, { status: 404 });
    }
    const groupId = consumabiliGroup[0].id;

    if (action === 'brands') {
      // Le categorie dentro CONSUMABILI sono le marche (HP, EPSON, CANON, ecc.)
      const categories = await db
        .select({
          id: productCategories.id,
          name: productCategories.name,
          slug: productCategories.slug,
        })
        .from(productCategories)
        .where(eq(productCategories.groupId, groupId))
        .orderBy(asc(productCategories.name));

      return NextResponse.json({
        brands: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })),
      });
    }

    if (action === 'models') {
      const brandSlug = searchParams.get('brand');
      if (!brandSlug) return NextResponse.json({ error: 'brand required' }, { status: 400 });

      // Trova la categoria (marca)
      const cat = await db
        .select({ id: productCategories.id })
        .from(productCategories)
        .where(
          and(
            eq(productCategories.groupId, groupId),
            eq(productCategories.slug, brandSlug),
          ),
        )
        .limit(1);

      if (!cat[0]) return NextResponse.json({ models: [] });

      // Le sottocategorie sono i modelli di stampante
      const subcategories = await db
        .select({
          id: productSubcategories.id,
          name: productSubcategories.name,
          slug: productSubcategories.slug,
        })
        .from(productSubcategories)
        .where(eq(productSubcategories.categoryId, cat[0].id))
        .orderBy(asc(productSubcategories.name));

      return NextResponse.json({
        models: subcategories.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
        })),
      });
    }

    if (action === 'products') {
      const brandSlug = searchParams.get('brand');
      const modelSlug = searchParams.get('model');
      const q = searchParams.get('q');

      const conditions = [
        eq(products.isActive, true),
        eq(products.groupId, groupId),
      ];

      if (brandSlug) {
        // Trova la categoria per lo slug della marca
        const cat = await db
          .select({ id: productCategories.id })
          .from(productCategories)
          .where(
            and(
              eq(productCategories.groupId, groupId),
              eq(productCategories.slug, brandSlug),
            ),
          )
          .limit(1);

        if (cat[0]) {
          conditions.push(eq(products.categoryId, cat[0].id));
        }
      }

      if (modelSlug) {
        // Trova la sottocategoria per lo slug del modello
        const sub = await db
          .select({ id: productSubcategories.id })
          .from(productSubcategories)
          .where(eq(productSubcategories.slug, modelSlug))
          .limit(1);

        if (sub[0]) {
          conditions.push(eq(products.subcategoryId, sub[0].id));
        }
      }

      if (q) {
        conditions.push(
          sql`(
            UPPER(${products.name}) LIKE UPPER(${`%${q}%`})
            OR UPPER(${products.partNumber}) LIKE UPPER(${`%${q}%`})
            OR UPPER(${products.code}) LIKE UPPER(${`%${q}%`})
          )`,
        );
      }

      const results = await db
        .select({
          code: products.code,
          name: products.name,
          brand: products.brand,
          partNumber: products.partNumber,
          priceNet: products.priceNet,
          pricePublic: products.pricePublic,
          vatCode: products.vatCode,
          stockAvailable: products.stockAvailable,
          imageUrl: products.imageUrl,
          isPromo: products.isPromo,
        })
        .from(products)
        .where(and(...conditions))
        .orderBy(asc(products.name))
        .limit(100);

      return NextResponse.json({ products: results });
    }

    return NextResponse.json({ error: 'action required (brands|models|products)' }, { status: 400 });
  } catch (err) {
    console.error('Printer search error:', err);
    return NextResponse.json({ error: 'Errore ricerca' }, { status: 500 });
  }
}
