import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { giftRules, products } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false as const, error: 'Non autenticato', status: 401 };
  }
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
  if (!isAdmin) {
    return { authorized: false as const, error: 'Non autorizzato', status: 403 };
  }
  return { authorized: true as const };
}

export async function GET() {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const rules = await db
      .select({
        id: giftRules.id,
        name: giftRules.name,
        triggerType: giftRules.triggerType,
        triggerValue: giftRules.triggerValue,
        triggerProductId: giftRules.triggerProductId,
        triggerCategoryId: giftRules.triggerCategoryId,
        giftProductId: giftRules.giftProductId,
        giftQty: giftRules.giftQty,
        minOrderAmount: giftRules.minOrderAmount,
        startDate: giftRules.startDate,
        endDate: giftRules.endDate,
        isActive: giftRules.isActive,
        createdAt: giftRules.createdAt,
        giftProductName: sql<string>`(SELECT ${products.name} FROM ${products} WHERE ${products.id} = ${giftRules.giftProductId})`.as('gift_product_name'),
        giftProductCode: sql<string>`(SELECT ${products.code} FROM ${products} WHERE ${products.id} = ${giftRules.giftProductId})`.as('gift_product_code'),
        giftProductPrice: sql<string>`(SELECT ${products.priceNet} FROM ${products} WHERE ${products.id} = ${giftRules.giftProductId})`.as('gift_product_price'),
        triggerProductName: sql<string>`(SELECT ${products.name} FROM ${products} WHERE ${products.id} = ${giftRules.triggerProductId})`.as('trigger_product_name'),
        triggerProductCode: sql<string>`(SELECT ${products.code} FROM ${products} WHERE ${products.id} = ${giftRules.triggerProductId})`.as('trigger_product_code'),
        triggerProductPrice: sql<string>`(SELECT ${products.priceNet} FROM ${products} WHERE ${products.id} = ${giftRules.triggerProductId})`.as('trigger_product_price'),
      })
      .from(giftRules)
      .orderBy(desc(giftRules.createdAt));

    return NextResponse.json({ giftRules: rules });
  } catch (error) {
    console.error('GET /api/admin/promotions/gifts error:', error);
    return NextResponse.json({ error: 'Errore nel caricamento regole omaggio' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { name, triggerType, triggerValue, triggerProductId, triggerCategoryId, giftProductId, giftQty, minOrderAmount, startDate, endDate, isActive } = body;

    if (!name || !triggerType || !giftProductId) {
      return NextResponse.json({ error: 'Nome, tipo trigger e prodotto omaggio obbligatori' }, { status: 400 });
    }

    const [rule] = await db.insert(giftRules).values({
      name,
      triggerType,
      triggerValue: triggerValue ? String(triggerValue) : null,
      triggerProductId: triggerProductId ? parseInt(triggerProductId) : null,
      triggerCategoryId: triggerCategoryId ? parseInt(triggerCategoryId) : null,
      giftProductId: parseInt(giftProductId),
      giftQty: giftQty ? parseInt(giftQty) : 1,
      minOrderAmount: minOrderAmount ? String(minOrderAmount) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive !== false,
    }).returning();

    return NextResponse.json({ giftRule: rule }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/promotions/gifts error:', error);
    return NextResponse.json({ error: 'Errore nella creazione regola omaggio' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID regola obbligatorio' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.triggerType !== undefined) updateData.triggerType = data.triggerType;
    if (data.triggerValue !== undefined) updateData.triggerValue = data.triggerValue ? String(data.triggerValue) : null;
    if (data.triggerProductId !== undefined) updateData.triggerProductId = data.triggerProductId ? parseInt(data.triggerProductId) : null;
    if (data.triggerCategoryId !== undefined) updateData.triggerCategoryId = data.triggerCategoryId ? parseInt(data.triggerCategoryId) : null;
    if (data.giftProductId !== undefined) updateData.giftProductId = parseInt(data.giftProductId);
    if (data.giftQty !== undefined) updateData.giftQty = parseInt(data.giftQty);
    if (data.minOrderAmount !== undefined) updateData.minOrderAmount = data.minOrderAmount ? String(data.minOrderAmount) : null;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 });
    }

    const [updated] = await db
      .update(giftRules)
      .set(updateData)
      .where(eq(giftRules.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Regola non trovata' }, { status: 404 });
    }

    return NextResponse.json({ giftRule: updated });
  } catch (error) {
    console.error('PUT /api/admin/promotions/gifts error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento regola' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(giftRules)
      .where(eq(giftRules.id, parseInt(id)))
      .returning({ id: giftRules.id });

    if (!deleted) {
      return NextResponse.json({ error: 'Regola non trovata' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/promotions/gifts error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione regola' }, { status: 500 });
  }
}
