import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, customers } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { generateEasyfattXml } from '@/lib/easyfatt';
import { z } from 'zod';

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

    // Fetch orders with items and customers
    const ordersData = await db.select().from(orders).where(inArray(orders.id, orderIds));

    const ordersWithDetails = await Promise.all(
      ordersData.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId)).limit(1);
        return { order, items, customer };
      })
    );

    const xml = generateEasyfattXml(ordersWithDetails);

    // Mark orders as exported
    await db.update(orders)
      .set({ easyfattExported: true, easyfattDate: new Date() })
      .where(inArray(orders.id, orderIds));

    console.log(`🔵 Export Easyfatt: ${orderIds.length} ordini esportati`);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="easyfatt-export-${new Date().toISOString().split('T')[0]}.xml"`,
      },
    });
  } catch (err: unknown) {
    console.error('🔴 POST /api/easyfatt error:', err);
    return NextResponse.json({ error: 'Errore export' }, { status: 500 });
  }
}
