import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentMethods } from '@/db/schema';
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

    const methods = await db
      .select()
      .from(paymentMethods)
      .orderBy(asc(paymentMethods.sortOrder));

    return NextResponse.json({ methods });
  } catch (error) {
    console.error('GET /api/admin/config/payments error:', error);
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
    const { code, name, description, isActive, sortOrder } = body;

    if (!code || !name) {
      return NextResponse.json({ error: 'Codice e nome obbligatori' }, { status: 400 });
    }

    const [created] = await db
      .insert(paymentMethods)
      .values({
        code,
        name,
        description: description || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      })
      .returning();

    return NextResponse.json({ method: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/config/payments error:', error);
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
    const { id, code, name, description, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const [updated] = await db
      .update(paymentMethods)
      .set(updateData)
      .where(eq(paymentMethods.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Metodo non trovato' }, { status: 404 });
    }

    return NextResponse.json({ method: updated });
  } catch (error) {
    console.error('PUT /api/admin/config/payments error:', error);
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
      .delete(paymentMethods)
      .where(eq(paymentMethods.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Metodo non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/config/payments error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}
