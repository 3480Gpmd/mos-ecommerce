import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { orders, customers } from '@/db/schema';
import { sql, gte, lte, count, desc } from 'drizzle-orm';

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

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'month';
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  // Calculate date range
  const now = new Date();
  let startDate: Date;
  let endDate = new Date();

  if (startDateParam && endDateParam) {
    startDate = new Date(startDateParam);
    endDate = new Date(endDateParam);
  } else {
    switch (period) {
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }
  }

  // Total orders and revenue
  const [totals] = await db.select({
    totalOrders: count(),
    totalRevenue: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)`,
    avgOrderValue: sql<string>`COALESCE(AVG(${orders.total}::numeric), 0)`,
  })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${startDate} AND ${orders.createdAt} <= ${endDate}`);

  // Orders this month
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [monthTotals] = await db.select({
    monthOrders: count(),
  })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${thisMonthStart} AND ${orders.createdAt} <= ${now}`);

  // Orders by status
  const ordersByStatus = await db.select({
    status: orders.status,
    count: count(),
  })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${startDate} AND ${orders.createdAt} <= ${endDate}`)
    .groupBy(orders.status);

  // Orders by payment method
  const ordersByPaymentMethod = await db.select({
    paymentMethod: orders.paymentMethod,
    count: count(),
  })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${startDate} AND ${orders.createdAt} <= ${endDate}`)
    .groupBy(orders.paymentMethod);

  // Monthly trend (last 12 months)
  const monthlyTrend = await db.select({
    month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
    totalOrders: count(),
    totalRevenue: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)`,
  })
    .from(orders)
    .where(gte(orders.createdAt, new Date(now.getFullYear() - 1, now.getMonth(), 1)))
    .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`);

  // Top 10 customers by revenue
  const topCustomers = await db.select({
    customerId: orders.customerId,
    customerName: orders.customerName,
    customerEmail: orders.customerEmail,
    totalSpent: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)`,
    orderCount: sql<number>`count(*)`,
  })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${startDate} AND ${orders.createdAt} <= ${endDate}`)
    .groupBy(orders.customerId, orders.customerName, orders.customerEmail)
    .orderBy(desc(sql`SUM(${orders.total}::numeric)`))
    .limit(10);

  return NextResponse.json({
    totalOrders: totals.totalOrders,
    totalRevenue: parseFloat(totals.totalRevenue || '0'),
    avgOrderValue: parseFloat(totals.avgOrderValue || '0'),
    ordersThisMonth: monthTotals.monthOrders,
    ordersByStatus,
    ordersByPaymentMethod,
    monthlyTrend: monthlyTrend.map((m) => ({
      ...m,
      totalRevenue: parseFloat(m.totalRevenue || '0'),
    })),
    topCustomers: topCustomers.map((c) => ({
      ...c,
      totalSpent: parseFloat(c.totalSpent || '0'),
    })),
  });
}
