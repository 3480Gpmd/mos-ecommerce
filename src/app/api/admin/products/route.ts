import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

export async function PUT(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID prodotto obbligatorio' }, { status: 400 });
    }

    const allowedFields: Record<string, unknown> = {};
    const editableKeys = [
      'name', 'brand', 'description', 'priceNet', 'pricePublic',
      'vatCode', 'stockAvailable', 'isActive', 'isPromo', 'isManual',
      'imageUrl', 'imageCustom', 'unit',
      'groupId', 'categoryId', 'subcategoryId',
    ];

    for (const key of editableKeys) {
      if (key in data) {
        allowedFields[key] = data[key];
      }
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 });
    }

    allowedFields.updatedAt = new Date();

    const [updated] = await db
      .update(products)
      .set(allowedFields)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Prodotto non trovato' }, { status: 404 });
    }

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error('PUT /api/admin/products error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { code, name, priceNet, vatCode = '22', ...rest } = body;

    if (!code || !name || priceNet === undefined) {
      return NextResponse.json(
        { error: 'Codice, nome e prezzo netto obbligatori' },
        { status: 400 }
      );
    }

    const [product] = await db.insert(products).values({
      code,
      name,
      priceNet: String(priceNet),
      vatCode: String(vatCode),
      isManual: true,
      ...rest,
    }).returning();

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    const errMsg = String(error);
    if (errMsg.includes('unique') || errMsg.includes('duplicate')) {
      return NextResponse.json({ error: 'Codice prodotto già esistente' }, { status: 409 });
    }
    console.error('POST /api/admin/products error:', error);
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning({ id: products.id });

    if (!deleted) {
      return NextResponse.json({ error: 'Prodotto non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/products error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}
