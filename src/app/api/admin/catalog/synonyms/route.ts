import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { searchSynonyms } from '@/db/schema';
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

  const synonyms = await db.select().from(searchSynonyms).orderBy(searchSynonyms.term);
  return NextResponse.json(synonyms);
}

export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { term, synonyms, isActive } = body;

  if (!term || !synonyms) {
    return NextResponse.json({ error: 'Termine e sinonimi sono obbligatori' }, { status: 400 });
  }

  const [synonym] = await db.insert(searchSynonyms).values({
    term,
    synonyms,
    isActive: isActive ?? true,
  }).returning();

  return NextResponse.json(synonym, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { id, term, synonyms, isActive } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
  }

  const [synonym] = await db.update(searchSynonyms)
    .set({ term, synonyms, isActive })
    .where(eq(searchSynonyms.id, id))
    .returning();

  if (!synonym) {
    return NextResponse.json({ error: 'Sinonimo non trovato' }, { status: 404 });
  }

  return NextResponse.json(synonym);
}

export async function DELETE(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
  }

  await db.delete(searchSynonyms).where(eq(searchSynonyms.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
