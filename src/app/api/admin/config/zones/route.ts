import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { shippingZones } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

    const zones = await db
      .select()
      .from(shippingZones);

    return NextResponse.json({ zones });
  } catch (error) {
    console.error('GET /api/admin/config/zones error:', error);
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
    const { name, provinces, extraCost, isActive } = body;

    if (!name || !provinces) {
      return NextResponse.json({ error: 'Nome e province obbligatori' }, { status: 400 });
    }

    const [created] = await db
      .insert(shippingZones)
      .values({
        name,
        provinces,
        extraCost: String(extraCost ?? '0'),
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json({ zone: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/config/zones error:', error);
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
    const { id, name, provinces, extraCost, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (provinces !== undefined) updateData.provinces = provinces;
    if (extraCost !== undefined) updateData.extraCost = String(extraCost);
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updated] = await db
      .update(shippingZones)
      .set(updateData)
      .where(eq(shippingZones.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Zona non trovata' }, { status: 404 });
    }

    return NextResponse.json({ zone: updated });
  } catch (error) {
    console.error('PUT /api/admin/config/zones error:', error);
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
      .delete(shippingZones)
      .where(eq(shippingZones.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Zona non trovata' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/config/zones error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}
