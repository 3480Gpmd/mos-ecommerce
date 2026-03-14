import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customerNotes, customers } from '@/db/schema';
import { eq, desc, and, lte, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const noteSchema = z.object({
  customerId: z.number(),
  content: z.string().min(1),
  type: z.enum(['nota', 'chiamata', 'visita', 'email', 'promemoria']).default('nota'),
  reminderDate: z.string().optional(), // ISO date string
});

const updateSchema = z.object({
  id: z.number(),
  isCompleted: z.boolean().optional(),
  content: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');
  const type = searchParams.get('type');
  const upcoming = searchParams.get('upcoming'); // 'true' per promemoria in scadenza

  // Promemoria in scadenza (per dashboard)
  if (upcoming === 'true') {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const notes = await db
      .select({
        id: customerNotes.id,
        customerId: customerNotes.customerId,
        content: customerNotes.content,
        type: customerNotes.type,
        reminderDate: customerNotes.reminderDate,
        isCompleted: customerNotes.isCompleted,
        createdAt: customerNotes.createdAt,
        customerName: sql<string>`COALESCE(${customers.companyName}, ${customers.firstName} || ' ' || ${customers.lastName})`,
        customerEmail: customers.email,
      })
      .from(customerNotes)
      .leftJoin(customers, eq(customerNotes.customerId, customers.id))
      .where(
        and(
          eq(customerNotes.isCompleted, false),
          lte(customerNotes.reminderDate, sevenDaysFromNow)
        )
      )
      .orderBy(customerNotes.reminderDate)
      .limit(10);

    return NextResponse.json({ notes });
  }

  // Note per cliente specifico
  if (!customerId) {
    return NextResponse.json({ error: 'customerId richiesto' }, { status: 400 });
  }

  const conditions = [eq(customerNotes.customerId, parseInt(customerId))];
  if (type) {
    conditions.push(eq(customerNotes.type, type));
  }

  const notes = await db
    .select()
    .from(customerNotes)
    .where(and(...conditions))
    .orderBy(desc(customerNotes.createdAt))
    .limit(50);

  return NextResponse.json({ notes });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { customerId, content, type, reminderDate } = parsed.data;

  const [note] = await db.insert(customerNotes).values({
    customerId,
    content,
    type,
    reminderDate: reminderDate ? new Date(reminderDate) : null,
  }).returning();

  return NextResponse.json({ note });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.isCompleted !== undefined) updates.isCompleted = parsed.data.isCompleted;
  if (parsed.data.content !== undefined) updates.content = parsed.data.content;

  const [note] = await db
    .update(customerNotes)
    .set(updates)
    .where(eq(customerNotes.id, parsed.data.id))
    .returning();

  return NextResponse.json({ note });
}
