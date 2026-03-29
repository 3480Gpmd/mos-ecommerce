import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { supplierSettings } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { z } from 'zod';

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

const createSupplierSchema = z.object({
  name: z.string().min(1, 'Nome fornitore obbligatorio'),
  email: z.string().email('Email non valida'),
  phone: z.string().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

const updateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Get single supplier
    if (id) {
      const [supplier] = await db
        .select()
        .from(supplierSettings)
        .where(eq(supplierSettings.id, parseInt(id)))
        .limit(1);

      if (!supplier) {
        return NextResponse.json({ error: 'Fornitore non trovato' }, { status: 404 });
      }

      return NextResponse.json({ supplier });
    }

    // List all suppliers
    const [{ total: totalCount }] = await db
      .select({ total: count() })
      .from(supplierSettings);

    const result = await db
      .select()
      .from(supplierSettings)
      .orderBy(desc(supplierSettings.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      suppliers: result,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/admin/supplier-settings error:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    const parsed = createSupplierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (parsed.data.isDefault) {
      await db
        .update(supplierSettings)
        .set({ isDefault: false })
        .where(eq(supplierSettings.isDefault, true));
    }

    const [supplier] = await db
      .insert(supplierSettings)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        notes: parsed.data.notes || null,
        isDefault: parsed.data.isDefault || false,
        isActive: parsed.data.isActive !== false,
      })
      .returning();

    console.log(`🟢 Fornitore creato: ${parsed.data.name} (${parsed.data.email})`);

    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/supplier-settings error:', error);
    return NextResponse.json({ error: 'Errore nella creazione del fornitore' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID fornitore obbligatorio' }, { status: 400 });
    }

    const parsed = updateSupplierSchema.safeParse(updateData);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (parsed.data.isDefault === true) {
      await db
        .update(supplierSettings)
        .set({ isDefault: false })
        .where(eq(supplierSettings.isDefault, true));
    }

    const [supplier] = await db
      .update(supplierSettings)
      .set({
        ...parsed.data,
      })
      .where(eq(supplierSettings.id, parseInt(id)))
      .returning();

    if (!supplier) {
      return NextResponse.json({ error: 'Fornitore non trovato' }, { status: 404 });
    }

    console.log(`🟡 Fornitore aggiornato: ${supplier.name}`);

    return NextResponse.json({ supplier });
  } catch (error) {
    console.error('PUT /api/admin/supplier-settings error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID fornitore obbligatorio' }, { status: 400 });
    }

    const [supplier] = await db
      .select()
      .from(supplierSettings)
      .where(eq(supplierSettings.id, parseInt(id)))
      .limit(1);

    if (!supplier) {
      return NextResponse.json({ error: 'Fornitore non trovato' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await db
      .update(supplierSettings)
      .set({ isActive: false })
      .where(eq(supplierSettings.id, parseInt(id)));

    console.log(`🔴 Fornitore disattivato: ${supplier.name}`);

    return NextResponse.json({ message: 'Fornitore disattivato con successo' });
  } catch (error) {
    console.error('DELETE /api/admin/supplier-settings error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}
