import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const customerId = parseInt(session.user.id);
    const [customer] = await db
      .select({
        firstName: customers.firstName,
        lastName: customers.lastName,
        companyName: customers.companyName,
        customerType: customers.customerType,
        email: customers.email,
        phone: customers.phone,
        birthDate: customers.birthDate,
        address: customers.address,
        postcode: customers.postcode,
        city: customers.city,
        province: customers.province,
        vatNumber: customers.vatNumber,
        fiscalCode: customers.fiscalCode,
      })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (!customer) {
      return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (err: unknown) {
    console.error('🔴 GET /api/customers/me error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
