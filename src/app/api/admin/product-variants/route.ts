import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productVariantGroups, productVariants } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false as const, error: 'Non autenticato', status: 401 };
  }
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
  if (!isAdmin) {
    return { authorized: false as const, error: 'Accesso negato', status: 403 };
  }
  return { authorized: true as const };
}

// GET: List all variant groups with their products
export async function GET(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Get all variant groups
    const groups = await db
      .select()
      .from(productVariantGroups)
      .orderBy(productVariantGroups.createdAt);

    // For each group, get its variants
    const groupsWithVariants = await Promise.all(
      groups.map(async (group) => {
        const variants = await db
          .select()
          .from(productVariants)
          .innerJoin(products, eq(productVariants.productId, products.id))
          .where(eq(productVariants.groupId, group.id));

        return {
          ...group,
          variants: variants.map((v) => ({
            productId: v.product_variants.productId,
            product: v.products,
            variantLabel: v.product_variants.variantLabel,
            colorHex: v.product_variants.colorHex,
            sortOrder: v.product_variants.sortOrder,
          })),
        };
      })
    );

    return NextResponse.json({
      variantGroups: groupsWithVariants,
      total: groupsWithVariants.length,
    });
  } catch (error) {
    console.error('GET /api/admin/product-variants error:', error);
    return NextResponse.json({ error: 'Errore nel recupero gruppi varianti' }, { status: 500 });
  }
}

// POST: Create new variant group with products
export async function POST(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { name, type = 'color', variants } = body;

    if (!name || !variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: 'Nome e array di varianti obbligatori' },
        { status: 400 }
      );
    }

    // Create the variant group
    const [newGroup] = await db
      .insert(productVariantGroups)
      .values({
        name,
        type,
      })
      .returning();

    // Create variant entries for each product
    const variantEntries = await Promise.all(
      variants.map((v: any) =>
        db
          .insert(productVariants)
          .values({
            groupId: newGroup.id,
            productId: parseInt(v.productId),
            variantLabel: v.variantLabel || '',
            colorHex: v.colorHex || null,
            sortOrder: v.sortOrder || 0,
          })
          .returning()
      )
    );

    return NextResponse.json(
      {
        group: newGroup,
        variants: variantEntries.map((v) => v[0]),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/product-variants error:', error);
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

// PUT: Update variant group
export async function PUT(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { id, name, type, variants } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID gruppo obbligatorio' }, { status: 400 });
    }

    // Update group
    if (name || type) {
      await db
        .update(productVariantGroups)
        .set({
          ...(name && { name }),
          ...(type && { type }),
        })
        .where(eq(productVariantGroups.id, parseInt(id)));
    }

    // Update variants if provided
    if (variants && Array.isArray(variants)) {
      // Delete existing variants
      await db
        .delete(productVariants)
        .where(eq(productVariants.groupId, parseInt(id)));

      // Create new variants
      await Promise.all(
        variants.map((v: any) =>
          db
            .insert(productVariants)
            .values({
              groupId: parseInt(id),
              productId: parseInt(v.productId),
              variantLabel: v.variantLabel || '',
              colorHex: v.colorHex || null,
              sortOrder: v.sortOrder || 0,
            })
        )
      );
    }

    // Get updated group with variants
    const [updatedGroup] = await db
      .select()
      .from(productVariantGroups)
      .where(eq(productVariantGroups.id, parseInt(id)));

    const updatedVariants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.groupId, parseInt(id)));

    return NextResponse.json({
      group: updatedGroup,
      variants: updatedVariants,
    });
  } catch (error) {
    console.error('PUT /api/admin/product-variants error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

// DELETE: Delete variant group
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID gruppo obbligatorio' }, { status: 400 });
    }

    // Delete all variants first (cascade happens automatically)
    await db
      .delete(productVariants)
      .where(eq(productVariants.groupId, parseInt(id)));

    // Delete the group
    const [deleted] = await db
      .delete(productVariantGroups)
      .where(eq(productVariantGroups.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Gruppo non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/product-variants error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}
