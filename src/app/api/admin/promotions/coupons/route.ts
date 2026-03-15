import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { coupons, couponRedemptions } from '@/db/schema';
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

    const result = await db
      .select({
        id: coupons.id,
        code: coupons.code,
        description: coupons.description,
        discountType: coupons.discountType,
        discountValue: coupons.discountValue,
        minOrderAmount: coupons.minOrderAmount,
        maxUses: coupons.maxUses,
        usedCount: coupons.usedCount,
        startDate: coupons.startDate,
        endDate: coupons.endDate,
        isActive: coupons.isActive,
        createdAt: coupons.createdAt,
        redemptionCount: sql<number>`(SELECT COUNT(*) FROM ${couponRedemptions} WHERE ${couponRedemptions.couponId} = ${coupons.id})`.as('redemption_count'),
      })
      .from(coupons)
      .orderBy(desc(coupons.createdAt));

    return NextResponse.json({ coupons: result });
  } catch (error) {
    console.error('GET /api/admin/promotions/coupons error:', error);
    return NextResponse.json({ error: 'Errore nel caricamento coupon' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { code, description, discountType, discountValue, minOrderAmount, maxUses, startDate, endDate, isActive } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: 'Codice, tipo sconto e valore obbligatori' }, { status: 400 });
    }

    const [coupon] = await db.insert(coupons).values({
      code: code.toUpperCase(),
      description: description || null,
      discountType,
      discountValue: String(discountValue),
      minOrderAmount: minOrderAmount ? String(minOrderAmount) : null,
      maxUses: maxUses ? parseInt(maxUses) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive !== false,
    }).returning();

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: unknown) {
    const errMsg = String(error);
    if (errMsg.includes('unique') || errMsg.includes('duplicate')) {
      return NextResponse.json({ error: 'Codice coupon già esistente' }, { status: 409 });
    }
    console.error('POST /api/admin/promotions/coupons error:', error);
    return NextResponse.json({ error: 'Errore nella creazione coupon' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID coupon obbligatorio' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.code !== undefined) updateData.code = data.code.toUpperCase();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = String(data.discountValue);
    if (data.minOrderAmount !== undefined) updateData.minOrderAmount = data.minOrderAmount ? String(data.minOrderAmount) : null;
    if (data.maxUses !== undefined) updateData.maxUses = data.maxUses ? parseInt(data.maxUses) : null;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 });
    }

    const [updated] = await db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Coupon non trovato' }, { status: 404 });
    }

    return NextResponse.json({ coupon: updated });
  } catch (error) {
    console.error('PUT /api/admin/promotions/coupons error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento coupon' }, { status: 500 });
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
      .delete(coupons)
      .where(eq(coupons.id, parseInt(id)))
      .returning({ id: coupons.id });

    if (!deleted) {
      return NextResponse.json({ error: 'Coupon non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/promotions/coupons error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione coupon' }, { status: 500 });
  }
}
