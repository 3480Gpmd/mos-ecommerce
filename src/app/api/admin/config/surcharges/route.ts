import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bulkySurcharges } from '@/db/schema';
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

    const surcharges = await db
      .select()
      .from(bulkySurcharges);

    return NextResponse.json({ surcharges });
  } catch (error) {
    console.error('GET /api/admin/config/surcharges error:', error);
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
    const { name, categoryId, productId, minQty, surcharge, isActive } = body;

    if (!name || surcharge === undefined) {
      return NextResponse.json({ error: 'Nome e supplemento obbligatori' }, { status: 400 });
    }

    const [created] = await db
      .insert(bulkySurcharges)
      .values({
        name,
        categoryId: categoryId || null,
        productId: productId || null,
        minQty: minQty ?? 1,
        surcharge: String(surcharge),
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json({ surcharge: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/config/surcharges error:', error);
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
    const { id, name, categoryId, productId, minQty, surcharge, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (productId !== undefined) updateData.productId = productId || null;
    if (minQty !== undefined) updateData.minQty = minQty;
    if (surcharge !== undefined) updateData.surcharge = String(surcharge);
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updated] = await db
      .update(bulkySurcharges)
      .set(updateData)
      .where(eq(bulkySurcharges.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Supplemento non trovato' }, { status: 404 });
    }

    return NextResponse.json({ surcharge: updated });
  } catch (error) {
    console.error('PUT /api/admin/config/surcharges error:', error);
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
      .delete(bulkySurcharges)
      .where(eq(bulkySurcharges.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Supplemento non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/config/surcharges error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}
