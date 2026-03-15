import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { shippingRules } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
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
      .select()
      .from(shippingRules)
      .orderBy(asc(shippingRules.sortOrder));

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('GET /api/admin/config/shipping error:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { name, minAmount, maxAmount, minWeight, maxWeight, cost, isActive, sortOrder } = body;

    if (!name || cost === undefined) {
      return NextResponse.json({ error: 'Nome e costo obbligatori' }, { status: 400 });
    }

    const [created] = await db
      .insert(shippingRules)
      .values({
        name,
        minAmount: minAmount ?? '0',
        maxAmount: maxAmount || null,
        minWeight: minWeight || null,
        maxWeight: maxWeight || null,
        cost: String(cost),
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      })
      .returning();

    return NextResponse.json({ rule: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/config/shipping error:', error);
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { id, name, minAmount, maxAmount, minWeight, maxWeight, cost, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (minAmount !== undefined) updateData.minAmount = String(minAmount);
    if (maxAmount !== undefined) updateData.maxAmount = maxAmount ? String(maxAmount) : null;
    if (minWeight !== undefined) updateData.minWeight = minWeight ? String(minWeight) : null;
    if (maxWeight !== undefined) updateData.maxWeight = maxWeight ? String(maxWeight) : null;
    if (cost !== undefined) updateData.cost = String(cost);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const [updated] = await db
      .update(shippingRules)
      .set(updateData)
      .where(eq(shippingRules.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Regola non trovata' }, { status: 404 });
    }

    return NextResponse.json({ rule: updated });
  } catch (error) {
    console.error('PUT /api/admin/config/shipping error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(shippingRules)
      .where(eq(shippingRules.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Regola non trovata' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/config/shipping error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}
