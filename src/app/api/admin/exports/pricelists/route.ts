import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { products, priceLists, categoryMarkups, productCategories } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

  // Fetch all active products
  const allProducts = await db.select({
    codice: products.code,
    nome: products.name,
    brand: products.brand,
    prezzo_pubblico: products.pricePublic,
    prezzo_netto: products.priceNet,
    iva: products.vatCode,
    categoryId: products.categoryId,
  })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.code);

  // Fetch price lists
  const allPriceLists = await db.select().from(priceLists).where(eq(priceLists.isActive, true));

  // Build export rows
  const rows = allProducts.map((p) => ({
    codice: p.codice,
    nome: p.nome,
    brand: p.brand || '',
    prezzo_pubblico: p.prezzo_pubblico || '',
    prezzo_netto: p.prezzo_netto,
    iva: p.iva,
    listino: 'standard',
    sconto: '0',
  }));

  const ws = XLSX.utils.json_to_sheet(rows, {
    header: ['codice', 'nome', 'brand', 'prezzo_pubblico', 'prezzo_netto', 'iva', 'listino', 'sconto'],
  });

  ws['A1'] = { v: 'Codice', t: 's' };
  ws['B1'] = { v: 'Nome', t: 's' };
  ws['C1'] = { v: 'Brand', t: 's' };
  ws['D1'] = { v: 'Prezzo Pubblico', t: 's' };
  ws['E1'] = { v: 'Prezzo Netto', t: 's' };
  ws['F1'] = { v: 'IVA %', t: 's' };
  ws['G1'] = { v: 'Listino', t: 's' };
  ws['H1'] = { v: 'Sconto %', t: 's' };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Listini');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="listini_vendita.xlsx"',
    },
  });
}
