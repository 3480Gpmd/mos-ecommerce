import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, customers } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import * as XLSX from 'xlsx';

const exportSchema = z.object({
  orderIds: z.array(z.number()).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = exportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dati non validi', details: parsed.error.flatten() }, { status: 400 });
    }

    const { orderIds } = parsed.data;

    const ordersData = await db.select().from(orders).where(inArray(orders.id, orderIds));

    const allItems = await Promise.all(
      ordersData.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return items;
      })
    );

    // Flatten all order items into rows matching the Easyfatt import template
    const rows = allItems.flat().map((item) => ({
      'Cod.': item.productCode || '',
      'Descrizione': item.productName || '',
      'Lotto/Seriale': '',
      'Q.tà': item.qty,
      'Prezzo netto': parseFloat(String(item.priceUnit || '0')),
      'U.m.': item.unit || 'PZ',
      'Sconti': parseFloat(String(item.discountPct || '0')) > 0
        ? `${item.discountPct}%`
        : '',
      'Iva': parseFloat(String(item.vatPct || '0')),
      'Mag.': '',
      "Prezzo d'acq.": '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws['!cols'] = [
      { wch: 16 },  // Cod.
      { wch: 40 },  // Descrizione
      { wch: 14 },  // Lotto/Seriale
      { wch: 8 },   // Q.tà
      { wch: 14 },  // Prezzo netto
      { wch: 8 },   // U.m.
      { wch: 10 },  // Sconti
      { wch: 8 },   // Iva
      { wch: 8 },   // Mag.
      { wch: 14 },  // Prezzo d'acq.
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Righe documento');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Mark orders as exported
    await db.update(orders)
      .set({ easyfattExported: true, easyfattDate: new Date() })
      .where(inArray(orders.id, orderIds));

    console.log(`🔵 Export Easyfatt XLSX: ${orderIds.length} ordini esportati (${rows.length} righe)`);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="easyfatt-import-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (err: unknown) {
    console.error('🔴 POST /api/easyfatt/xlsx error:', err);
    return NextResponse.json({ error: 'Errore export XLSX' }, { status: 500 });
  }
}
