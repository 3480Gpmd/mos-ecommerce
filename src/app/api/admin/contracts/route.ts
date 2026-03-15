import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { customerContracts, customers, priceLists } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
  if (!isAdmin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
  return null;
}

export async function GET() {
  const denied = await checkAdmin();
  if (denied) return denied;

  const contracts = await db.select({
    id: customerContracts.id,
    customerId: customerContracts.customerId,
    customerName: customers.companyName,
    customerEmail: customers.email,
    firstName: customers.firstName,
    lastName: customers.lastName,
    priceListId: customerContracts.priceListId,
    priceListName: priceLists.name,
    discountPct: customerContracts.discountPct,
    startDate: customerContracts.startDate,
    endDate: customerContracts.endDate,
    notes: customerContracts.notes,
    isActive: customerContracts.isActive,
    createdAt: customerContracts.createdAt,
  })
    .from(customerContracts)
    .leftJoin(customers, eq(customerContracts.customerId, customers.id))
    .leftJoin(priceLists, eq(customerContracts.priceListId, priceLists.id))
    .orderBy(customerContracts.createdAt);

  return NextResponse.json(contracts);
}

export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { customerId, priceListId, discountPct, startDate, endDate, notes, isActive } = body;

  if (!customerId) {
    return NextResponse.json({ error: 'Cliente obbligatorio' }, { status: 400 });
  }

  const [contract] = await db.insert(customerContracts).values({
    customerId,
    priceListId: priceListId || null,
    discountPct: discountPct || '0',
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    notes: notes || null,
    isActive: isActive ?? true,
  }).returning();

  return NextResponse.json(contract, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { id, priceListId, discountPct, startDate, endDate, notes, isActive } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
  }

  const [contract] = await db.update(customerContracts)
    .set({
      priceListId: priceListId || null,
      discountPct: discountPct || '0',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      notes: notes || null,
      isActive,
    })
    .where(eq(customerContracts.id, id))
    .returning();

  if (!contract) {
    return NextResponse.json({ error: 'Contratto non trovato' }, { status: 404 });
  }

  return NextResponse.json(contract);
}

export async function DELETE(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
  }

  await db.delete(customerContracts).where(eq(customerContracts.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
