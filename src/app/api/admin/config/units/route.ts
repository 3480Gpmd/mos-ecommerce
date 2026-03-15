import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { unitOfMeasure } from '@/db/schema';
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

  const units = await db.select().from(unitOfMeasure).orderBy(unitOfMeasure.code);
  return NextResponse.json(units);
}

export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { code, name, isActive } = body;

  if (!code || !name) {
    return NextResponse.json({ error: 'Codice e nome sono obbligatori' }, { status: 400 });
  }

  const [unit] = await db.insert(unitOfMeasure).values({
    code,
    name,
    isActive: isActive ?? true,
  }).returning();

  return NextResponse.json(unit, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { id, code, name, isActive } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
  }

  const [unit] = await db.update(unitOfMeasure)
    .set({ code, name, isActive })
    .where(eq(unitOfMeasure.id, id))
    .returning();

  if (!unit) {
    return NextResponse.json({ error: 'Unità non trovata' }, { status: 404 });
  }

  return NextResponse.json(unit);
}

export async function DELETE(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
  }

  await db.delete(unitOfMeasure).where(eq(unitOfMeasure.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
