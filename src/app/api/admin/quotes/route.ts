import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quoteRequests } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt)).limit(100).$dynamic();

  if (status) {
    query = query.where(eq(quoteRequests.status, status));
  }

  const quotes = await query;
  return NextResponse.json({ quotes });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = z.object({
    id: z.number(),
    status: z.enum(['nuovo', 'contattato', 'preventivo_inviato', 'chiuso']).optional(),
    adminNotes: z.string().optional(),
  }).safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.adminNotes !== undefined) updates.adminNotes = parsed.data.adminNotes;

  const [quote] = await db.update(quoteRequests)
    .set(updates)
    .where(eq(quoteRequests.id, parsed.data.id))
    .returning();

  return NextResponse.json({ quote });
}
