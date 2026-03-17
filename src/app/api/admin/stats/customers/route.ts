import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { customers, orders, cartItems, products } from '@/db/schema';
import { sql, gte, count, desc, and } from 'drizzle-orm';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
  if (!isAdmin) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
  return null;
}

export async function GET(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Total customers
  const [totalData] = await db.select({ count: count() })
    .from(customers);

  // Active customers (those with at least 1 order)
  const activeCustomerIds = await db.select({ customerId: orders.customerId })
    .from(orders)
    .groupBy(orders.customerId);
  const activeCount = activeCustomerIds.length;

  // New customers this month
  const [newThisMonthData] = await db.select({ count: count() })
    .from(customers)
    .where(gte(customers.createdAt, thisMonthStart));

  // Top customers by lifetime value
  const topCustomers = await db.select({
    customerId: orders.customerId,
    customerName: orders.customerName,
    customerEmail: orders.customerEmail,
    totalSpent: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)`,
    orderCount: sql<number>`count(*)`,
    lastOrder: sql<string>`MAX(${orders.createdAt})::text`,
  })
    .from(orders)
    .groupBy(orders.customerId, orders.customerName, orders.customerEmail)
    .orderBy(desc(sql`SUM(${orders.total}::numeric)`))
    .limit(20);

  // Average order value per customer
  const [avgOrderValueData] = await db.select({
    avgValue: sql<string>`COALESCE(AVG(${orders.total}::numeric), 0)`,
  })
    .from(orders);

  // Customer acquisition trend (registrations per month) - last 12 months
  const acquisitionTrend = await db.select({
    month: sql<string>`TO_CHAR(${customers.createdAt}, 'YYYY-MM')`,
    count: count(),
  })
    .from(customers)
    .where(gte(customers.createdAt, new Date(now.getFullYear() - 1, now.getMonth(), 1)))
    .groupBy(sql`TO_CHAR(${customers.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${customers.createdAt}, 'YYYY-MM')`);

  // Customer segments by spending level (this month)
  const spendingSegments = await db.select({
    segment: sql<string>`
      CASE
        WHEN SUM(${orders.total}::numeric) >= 5000 THEN 'Premium (€5000+)'
        WHEN SUM(${orders.total}::numeric) >= 1000 THEN 'Gold (€1000-€4999)'
        WHEN SUM(${orders.total}::numeric) >= 100 THEN 'Silver (€100-€999)'
        ELSE 'Bronze (<€100)'
      END
    `,
    customerCount: count(),
    totalSpent: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)`,
  })
    .from(orders)
    .where(gte(orders.createdAt, thisMonthStart))
    .groupBy(
      sql`CASE
        WHEN SUM(${orders.total}::numeric) >= 5000 THEN 'Premium (€5000+)'
        WHEN SUM(${orders.total}::numeric) >= 1000 THEN 'Gold (€1000-€4999)'
        WHEN SUM(${orders.total}::numeric) >= 100 THEN 'Silver (€100-€999)'
        ELSE 'Bronze (<€100)'
      END`
    );

  // Customer segments by order frequency (all time)
  const frequencySegments = await db.select({
    segment: sql<string>`
      CASE
        WHEN count(*) >= 20 THEN 'Molto Frequenti (20+ ordini)'
        WHEN count(*) >= 10 THEN 'Frequenti (10-19 ordini)'
        WHEN count(*) >= 5 THEN 'Occasionali (5-9 ordini)'
        ELSE 'Rari (<5 ordini)'
      END
    `,
    customerCount: count(),
  })
    .from(orders)
    .groupBy(
      sql`CASE
        WHEN count(*) >= 20 THEN 'Molto Frequenti (20+ ordini)'
        WHEN count(*) >= 10 THEN 'Frequenti (10-19 ordini)'
        WHEN count(*) >= 5 THEN 'Occasionali (5-9 ordini)'
        ELSE 'Rari (<5 ordini)'
      END`
    );

  // Inactive customers (no order in 60+ days but with at least 1 order)
  const allCustomersWithOrders = await db.select({
    customerId: orders.customerId,
    lastOrder: sql<string>`MAX(${orders.createdAt})::text`,
  })
    .from(orders)
    .groupBy(orders.customerId);

  const activeInLast60 = await db.select({ customerId: orders.customerId })
    .from(orders)
    .where(gte(orders.createdAt, sixtyDaysAgo))
    .groupBy(orders.customerId);
  const activeSet = new Set(activeInLast60.map((r) => r.customerId));

  const inactiveCount = allCustomersWithOrders.filter((c) => !activeSet.has(c.customerId)).length;

  // Abandoned cart analytics
  const [totalCartsData] = await db.select({ count: count() })
    .from(cartItems);

  const totalCartValue = await db.select({
    customerId: cartItems.customerId,
    totalValue: sql<string>`COALESCE(SUM(${products.pricePublic}::numeric * ${cartItems.qty}), COALESCE(SUM(${products.priceNet}::numeric * ${cartItems.qty}), 0))`,
  })
    .from(cartItems)
    .leftJoin(products, sql`${cartItems.productId} = ${products.id}`)
    .groupBy(cartItems.customerId);

  const totalAbandonedValue = totalCartValue.reduce((sum, c) => sum + parseFloat(c.totalValue || '0'), 0);

  // Cart recovery rate (abandoned carts that were recovered = converted to orders)
  // Get customers with carts
  const cartCustomerIds = new Set((await db.select({ customerId: cartItems.customerId })
    .from(cartItems)
    .groupBy(cartItems.customerId)).map((c) => c.customerId));

  // Get customers who have orders
  const orderCustomerIds = new Set(activeCustomerIds.map((c) => c.customerId));

  // Recovery rate: customers with carts who have made orders
  const recoveredCarts = Array.from(cartCustomerIds).filter((cid) => orderCustomerIds.has(cid)).length;
  const cartRecoveryRate = cartCustomerIds.size > 0 ? Math.round((recoveredCarts / cartCustomerIds.size) * 100) : 0;

  return NextResponse.json({
    totalCustomers: totalData.count,
    activeCustomers: activeCount,
    newThisMonth: newThisMonthData.count,
    inactiveCustomers: inactiveCount,
    avgOrderValuePerCustomer: parseFloat(avgOrderValueData.avgValue || '0'),
    topCustomers: topCustomers.map((c) => ({
      ...c,
      totalSpent: parseFloat(c.totalSpent || '0'),
    })),
    acquisitionTrend,
    spendingSegments: spendingSegments.map((s) => ({
      ...s,
      totalSpent: parseFloat(s.totalSpent || '0'),
    })),
    frequencySegments,
    abandonedCarts: {
      totalCarts: totalCartsData.count,
      totalValue: totalAbandonedValue,
      recoveryRate: cartRecoveryRate,
    },
  });
}
