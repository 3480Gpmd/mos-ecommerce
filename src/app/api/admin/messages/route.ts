import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { userMessages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

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

  const messages = await db.select().from(userMessages).orderBy(desc(userMessages.createdAt));
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { title, content, type, targetType, targetId, startDate, endDate, isActive } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Titolo e contenuto sono obbligatori' }, { status: 400 });
  }

  const [message] = await db.insert(userMessages).values({
    title,
    content,
    type: type || 'banner',
    targetType: targetType || 'all',
    targetId: targetId || null,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    isActive: isActive ?? true,
  }).returning();

  return NextResponse.json(message, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { id, title, content, type, targetType, targetId, startDate, endDate, isActive } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
  }

  const [message] = await db.update(userMessages)
    .set({
      title,
      content,
      type,
      targetType,
      targetId: targetId || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive,
    })
    .where(eq(userMessages.id, id))
    .returning();

  if (!message) {
    return NextResponse.json({ error: 'Messaggio non trovato' }, { status: 404 });
  }

  return NextResponse.json(message);
}

export async function DELETE(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
  }

  await db.delete(userMessages).where(eq(userMessages.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
