import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quoteRequests } from '@/db/schema';
import { z } from 'zod';
import { sendEmail, getAdminEmail, quoteRequestAdminEmail } from '@/lib/email';

const quoteSchema = z.object({
  companyName: z.string().optional(),
  contactName: z.string().min(2, 'Nome richiesto'),
  email: z.string().email('Email non valida'),
  phone: z.string().optional(),
  message: z.string().optional(),
  interests: z.string().optional(), // comma-separated
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = quoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const [quote] = await db.insert(quoteRequests).values({
      companyName: parsed.data.companyName || null,
      contactName: parsed.data.contactName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message || null,
      interests: parsed.data.interests || null,
    }).returning();

    // Invia email notifica all'admin
    const emailTemplate = quoteRequestAdminEmail({
      contactName: parsed.data.contactName,
      companyName: parsed.data.companyName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      interests: parsed.data.interests,
    });
    sendEmail({ to: getAdminEmail(), ...emailTemplate }).catch(console.error);

    return NextResponse.json({ success: true, id: quote.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
