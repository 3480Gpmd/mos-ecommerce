import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { sendEmail, getAdminEmail, welcomeEmail, newRegistrationAdminEmail } from '@/lib/email';

// Helper: trasforma stringa vuota in undefined (per campi opzionali)
const emptyToUndefined = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().optional(),
);
const emptyEmailToUndefined = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().email().optional(),
);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: emptyToUndefined,
  lastName: emptyToUndefined,
  companyName: emptyToUndefined,
  customerType: z.enum(['privato', 'azienda']),
  vatNumber: emptyToUndefined,
  fiscalCode: emptyToUndefined,
  sdiCode: emptyToUndefined,
  pecEmail: emptyEmailToUndefined,
  phone: emptyToUndefined,
  birthDate: emptyToUndefined,
  address: emptyToUndefined,
  postcode: emptyToUndefined,
  city: emptyToUndefined,
  province: emptyToUndefined,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dati non validi', details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password, ...data } = parsed.data;

    // Check existing
    const existing = await db.select({ id: customers.id }).from(customers).where(eq(customers.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email già registrata' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Utenti privati → attivi subito. Aziende → richiedono attivazione admin
    const isActive = data.customerType === 'privato';

    const [customer] = await db.insert(customers).values({
      email: email.toLowerCase(),
      passwordHash,
      isActive,
      ...data,
    }).returning();

    console.log(`🔵 Nuovo cliente registrato: ${email} (${data.customerType}) - attivo: ${isActive}`);

    // Invia welcome email al cliente
    const welcome = welcomeEmail(data.firstName || '');
    sendEmail({ to: email.toLowerCase(), ...welcome }).catch(console.error);

    // Invia notifica admin
    const adminNotif = newRegistrationAdminEmail({
      email: email.toLowerCase(),
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName,
      customerType: data.customerType,
      phone: data.phone,
    });
    sendEmail({ to: getAdminEmail(), ...adminNotif }).catch(console.error);

    return NextResponse.json({
      id: customer.id,
      email: customer.email,
      customerType: customer.customerType,
      isActive,
    }, { status: 201 });
  } catch (err: unknown) {
    console.error('🔴 POST /api/customers error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const result = await db.select({
      id: customers.id,
      email: customers.email,
      firstName: customers.firstName,
      lastName: customers.lastName,
      companyName: customers.companyName,
      customerType: customers.customerType,
      phone: customers.phone,
      city: customers.city,
      createdAt: customers.createdAt,
    }).from(customers);

    return NextResponse.json({ customers: result });
  } catch (err: unknown) {
    console.error('🔴 GET /api/customers error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
