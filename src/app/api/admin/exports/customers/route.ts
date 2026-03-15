import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { customers } from '@/db/schema';
import * as XLSX from 'xlsx';

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

  const allCustomers = await db.select({
    email: customers.email,
    nome: customers.firstName,
    cognome: customers.lastName,
    azienda: customers.companyName,
    tipo: customers.customerType,
    piva: customers.vatNumber,
    cf: customers.fiscalCode,
    telefono: customers.phone,
    indirizzo: customers.address,
    cap: customers.postcode,
    citta: customers.city,
    provincia: customers.province,
    listino: customers.priceList,
  }).from(customers).orderBy(customers.lastName);

  const ws = XLSX.utils.json_to_sheet(allCustomers, {
    header: ['email', 'nome', 'cognome', 'azienda', 'tipo', 'piva', 'cf', 'telefono', 'indirizzo', 'cap', 'citta', 'provincia', 'listino'],
  });

  // Set column headers in Italian
  ws['A1'] = { v: 'Email', t: 's' };
  ws['B1'] = { v: 'Nome', t: 's' };
  ws['C1'] = { v: 'Cognome', t: 's' };
  ws['D1'] = { v: 'Azienda', t: 's' };
  ws['E1'] = { v: 'Tipo', t: 's' };
  ws['F1'] = { v: 'P.IVA', t: 's' };
  ws['G1'] = { v: 'Codice Fiscale', t: 's' };
  ws['H1'] = { v: 'Telefono', t: 's' };
  ws['I1'] = { v: 'Indirizzo', t: 's' };
  ws['J1'] = { v: 'CAP', t: 's' };
  ws['K1'] = { v: 'Città', t: 's' };
  ws['L1'] = { v: 'Provincia', t: 's' };
  ws['M1'] = { v: 'Listino', t: 's' };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clienti');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="anagrafica_clienti.xlsx"',
    },
  });
}
