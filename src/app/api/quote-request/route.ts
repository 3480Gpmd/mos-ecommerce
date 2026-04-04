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
  employeeCount: z.string().optional(),
  smartWorking: z.string().optional(),
  currentProduct: z.string().optional(),
  issues: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = quoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Componi messaggio completo con le nuove info
    const extraInfo = [
      parsed.data.employeeCount ? `Persone in azienda: ${parsed.data.employeeCount}` : '',
      parsed.data.smartWorking ? `Smart working: ${parsed.data.smartWorking}` : '',
      parsed.data.currentProduct ? `Prodotto attuale: ${parsed.data.currentProduct}` : '',
      parsed.data.issues ? `Criticità: ${parsed.data.issues}` : '',
    ].filter(Boolean).join('\n');

    const fullMessage = [parsed.data.message, extraInfo].filter(Boolean).join('\n\n---\n');

    const [quote] = await db.insert(quoteRequests).values({
      companyName: parsed.data.companyName || null,
      contactName: parsed.data.contactName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: fullMessage || null,
      interests: parsed.data.interests || null,
    }).returning();

    // Invia email notifica all'admin
    const emailTemplate = quoteRequestAdminEmail({
      contactName: parsed.data.contactName,
      companyName: parsed.data.companyName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: fullMessage,
      interests: parsed.data.interests,
    });
    sendEmail({ to: getAdminEmail(), ...emailTemplate }).catch(console.error);

    return NextResponse.json({ success: true, id: quote.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
