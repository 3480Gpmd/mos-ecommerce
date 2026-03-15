import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, customers } from '@/db/schema';
import { eq, sql, desc, and, gte, lt } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  if (type === 'top-customers') {
    // Top 10 clienti per fatturato mese corrente
    const topCustomers = await db
      .select({
        customerId: orders.customerId,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        totalSpent: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)::text`,
        orderCount: sql<number>`count(*)`,
      })
      .from(orders)
      .where(and(
        gte(orders.createdAt, thisMonthStart),
        eq(orders.status, 'consegnato'),
      ))
      .groupBy(orders.customerId, orders.customerName, orders.customerEmail)
      .orderBy(desc(sql`SUM(${orders.total}::numeric)`))
      .limit(10);

    return NextResponse.json({ topCustomers });
  }

  if (type === 'declining') {
    // Clienti con calo >30% vs mese precedente
    const thisMonth = await db
      .select({
        customerId: orders.customerId,
        total: sql<number>`COALESCE(SUM(${orders.total}::numeric), 0)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, thisMonthStart))
      .groupBy(orders.customerId);

    const lastMonth = await db
      .select({
        customerId: orders.customerId,
        total: sql<number>`COALESCE(SUM(${orders.total}::numeric), 0)`,
      })
      .from(orders)
      .where(and(gte(orders.createdAt, lastMonthStart), lt(orders.createdAt, thisMonthStart)))
      .groupBy(orders.customerId);

    const lastMonthMap = new Map(lastMonth.map((r) => [r.customerId, Number(r.total)]));
    const thisMonthMap = new Map(thisMonth.map((r) => [r.customerId, Number(r.total)]));

    const declining: { customerId: number; lastMonthTotal: number; thisMonthTotal: number; changePct: number }[] = [];
    for (const [cId, lastTotal] of lastMonthMap) {
      if (lastTotal < 50) continue; // ignora clienti con poco volume
      const thisTotal = thisMonthMap.get(cId) || 0;
      const changePct = ((thisTotal - lastTotal) / lastTotal) * 100;
      if (changePct < -30) {
        declining.push({ customerId: cId, lastMonthTotal: lastTotal, thisMonthTotal: thisTotal, changePct: Math.round(changePct) });
      }
    }

    // Enrichisci con nome cliente
    const customerIds = declining.map((d) => d.customerId);
    const customerData = customerIds.length > 0
      ? await db.select({ id: customers.id, companyName: customers.companyName, firstName: customers.firstName, lastName: customers.lastName, email: customers.email })
          .from(customers).where(sql`${customers.id} IN (${sql.join(customerIds.map(id => sql`${id}`), sql`, `)})`)
      : [];

    const customerMap = new Map(customerData.map((c) => [c.id, c]));
    const enriched = declining.map((d) => ({
      ...d,
      customer: customerMap.get(d.customerId) || null,
    })).sort((a, b) => a.changePct - b.changePct);

    return NextResponse.json({ declining: enriched });
  }

  if (type === 'inactive') {
    // Clienti che non ordinano da 60+ giorni ma hanno almeno 1 ordine
    const activeCustomerIds = await db
      .select({ customerId: orders.customerId })
      .from(orders)
      .where(gte(orders.createdAt, sixtyDaysAgo))
      .groupBy(orders.customerId);

    const activeIds = new Set(activeCustomerIds.map((r) => r.customerId));

    const allWithOrders = await db
      .select({
        customerId: orders.customerId,
        lastOrder: sql<string>`MAX(${orders.createdAt})::text`,
        totalOrders: sql<number>`count(*)`,
        totalSpent: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)::text`,
      })
      .from(orders)
      .groupBy(orders.customerId);

    const inactive = allWithOrders
      .filter((r) => !activeIds.has(r.customerId))
      .sort((a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime())
      .slice(0, 20);

    // Enrichisci
    const customerIds = inactive.map((d) => d.customerId);
    const customerData = customerIds.length > 0
      ? await db.select({ id: customers.id, companyName: customers.companyName, firstName: customers.firstName, lastName: customers.lastName, email: customers.email })
          .from(customers).where(sql`${customers.id} IN (${sql.join(customerIds.map(id => sql`${id}`), sql`, `)})`)
      : [];
    const customerMap = new Map(customerData.map((c) => [c.id, c]));

    return NextResponse.json({
      inactive: inactive.map((d) => ({ ...d, customer: customerMap.get(d.customerId) || null })),
    });
  }

  if (type === 'monthly-trend') {
    // Trend ordini ultimi 6 mesi
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const trend = await db
      .select({
        month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        orderCount: sql<number>`count(*)`,
        revenue: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)::text`,
      })
      .from(orders)
      .where(gte(orders.createdAt, sixMonthsAgo))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`);

    return NextResponse.json({ trend });
  }

  return NextResponse.json({ error: 'type richiesto: top-customers, declining, inactive, monthly-trend' }, { status: 400 });
}
