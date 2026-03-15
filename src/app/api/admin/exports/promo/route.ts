import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { products } from '@/db/schema';
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

  const promoProducts = await db.select({
    code: products.code,
    name: products.name,
    brand: products.brand,
    priceNet: products.priceNet,
    superPrice: products.superPrice,
    promoStartDate: products.promoStartDate,
    promoEndDate: products.promoEndDate,
    isFeatured: products.isFeatured,
    isSuperPrice: products.isSuperPrice,
  })
    .from(products)
    .where(eq(products.isPromo, true))
    .orderBy(products.code);

  const formatDate = (d: Date | null) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('it-IT');
  };

  const rows = promoProducts.map((p) => ({
    codice: p.code,
    nome: p.name,
    brand: p.brand || '',
    prezzo: p.priceNet,
    prezzo_promo: p.superPrice || '',
    inizio_promo: formatDate(p.promoStartDate),
    fine_promo: formatDate(p.promoEndDate),
    vetrina: p.isFeatured ? 'Si' : 'No',
    superprezzo: p.isSuperPrice ? 'Si' : 'No',
  }));

  const ws = XLSX.utils.json_to_sheet(rows, {
    header: ['codice', 'nome', 'brand', 'prezzo', 'prezzo_promo', 'inizio_promo', 'fine_promo', 'vetrina', 'superprezzo'],
  });

  ws['A1'] = { v: 'Codice', t: 's' };
  ws['B1'] = { v: 'Nome', t: 's' };
  ws['C1'] = { v: 'Brand', t: 's' };
  ws['D1'] = { v: 'Prezzo', t: 's' };
  ws['E1'] = { v: 'Prezzo Promo', t: 's' };
  ws['F1'] = { v: 'Inizio Promo', t: 's' };
  ws['G1'] = { v: 'Fine Promo', t: 's' };
  ws['H1'] = { v: 'Vetrina', t: 's' };
  ws['I1'] = { v: 'Superprezzo', t: 's' };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Promo');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="prodotti_promo.xlsx"',
    },
  });
}
