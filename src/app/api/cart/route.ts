import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cartItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const cartActionSchema = z.object({
  productId: z.number(),
  qty: z.number().min(0).default(1),
  isUrgent: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const customerId = parseInt(session.user.id);

    const items = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        qty: cartItems.qty,
        isUrgent: cartItems.isUrgent,
        product: {
          code: products.code,
          name: products.name,
          brand: products.brand,
          priceNet: products.priceNet,
          vatCode: products.vatCode,
          imageUrl: products.imageUrl,
          stockAvailable: products.stockAvailable,
          unit: products.unit,
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.customerId, customerId));

    return NextResponse.json({ items });
  } catch (err: unknown) {
    console.error('🔴 GET /api/cart error:', err);
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
    const parsed = cartActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dati non validi', details: parsed.error.flatten() }, { status: 400 });
    }

    const { productId, qty, isUrgent } = parsed.data;

    // Remove if qty is 0
    if (qty === 0) {
      await db.delete(cartItems).where(
        and(eq(cartItems.customerId, customerId), eq(cartItems.productId, productId))
      );
      return NextResponse.json({ message: 'Rimosso dal carrello' });
    }

    // Upsert
    const existing = await db.select().from(cartItems)
      .where(and(eq(cartItems.customerId, customerId), eq(cartItems.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      const updateData: { qty: number; updatedAt: Date; isUrgent?: boolean } = { qty, updatedAt: new Date() };
      if (isUrgent !== undefined) updateData.isUrgent = isUrgent;
      await db.update(cartItems)
        .set(updateData)
        .where(eq(cartItems.id, existing[0].id));
    } else {
      await db.insert(cartItems).values({ customerId, productId, qty, isUrgent: isUrgent ?? false });
    }

    return NextResponse.json({ message: 'Carrello aggiornato' });
  } catch (err: unknown) {
    console.error('🔴 POST /api/cart error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const customerId = parseInt(session.user.id);
    await db.delete(cartItems).where(eq(cartItems.customerId, customerId));

    return NextResponse.json({ message: 'Carrello svuotato' });
  } catch (err: unknown) {
    console.error('🔴 DELETE /api/cart error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
