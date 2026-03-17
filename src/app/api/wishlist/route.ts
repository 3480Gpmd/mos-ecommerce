import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wishlists, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const wishlistActionSchema = z.object({
  productId: z.number(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const customerId = parseInt(session.user.id);

    const wishlistItems = await db
      .select({
        productId: wishlists.productId,
        productName: products.name,
        productCode: products.code,
        currentPrice: products.priceNet,
        imageUrl: products.imageUrl,
        unit: products.unit,
        stockAvailable: products.stockAvailable,
        brand: products.brand,
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.customerId, customerId))
      .orderBy(wishlists.createdAt);

    return NextResponse.json({ products: wishlistItems });
  } catch (err: unknown) {
    console.error('🔴 GET /api/wishlist error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const customerId = parseInt(session.user.id);
    const body = await req.json();
    const parsed = wishlistActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { productId } = parsed.data;

    // Check if already in wishlist
    const existing = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.customerId, customerId), eq(wishlists.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ message: 'Già nei preferiti' });
    }

    // Add to wishlist
    await db.insert(wishlists).values({
      customerId,
      productId,
    });

    return NextResponse.json({ message: 'Aggiunto ai preferiti' });
  } catch (err: unknown) {
    console.error('🔴 POST /api/wishlist error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const customerId = parseInt(session.user.id);
    const body = await req.json();
    const parsed = wishlistActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { productId } = parsed.data;

    await db
      .delete(wishlists)
      .where(and(eq(wishlists.customerId, customerId), eq(wishlists.productId, productId)));

    return NextResponse.json({ message: 'Rimosso dai preferiti' });
  } catch (err: unknown) {
    console.error('🔴 DELETE /api/wishlist error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
