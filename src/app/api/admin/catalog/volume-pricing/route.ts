import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { volumePricing } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
  if (!isAdmin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
  return null;
}

export async function GET(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId obbligatorio' }, { status: 400 });
  }

  const tiers = await db.select()
    .from(volumePricing)
    .where(eq(volumePricing.productId, parseInt(productId)))
    .orderBy(volumePricing.minQty);

  return NextResponse.json(tiers);
}

export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { productId, minQty, maxQty, discountPct, priceOverride } = body;

  if (!productId || !minQty) {
    return NextResponse.json({ error: 'productId e minQty sono obbligatori' }, { status: 400 });
  }

  const [tier] = await db.insert(volumePricing).values({
    productId,
    minQty,
    maxQty: maxQty || null,
    discountPct: discountPct || null,
    priceOverride: priceOverride || null,
  }).returning();

  return NextResponse.json(tier, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { id, minQty, maxQty, discountPct, priceOverride } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
  }

  const [tier] = await db.update(volumePricing)
    .set({
      minQty,
      maxQty: maxQty || null,
      discountPct: discountPct || null,
      priceOverride: priceOverride || null,
    })
    .where(eq(volumePricing.id, id))
    .returning();

  if (!tier) {
    return NextResponse.json({ error: 'Scaglione non trovato' }, { status: 404 });
  }

  return NextResponse.json(tier);
}

export async function DELETE(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
  }

  await db.delete(volumePricing).where(eq(volumePricing.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
