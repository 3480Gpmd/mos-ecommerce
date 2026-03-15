import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { sql, gte, count } from 'drizzle-orm';

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

  // Calculate date range
  const now = new Date();
  let startDate: Date;

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

  // Total orders and revenue
  const [totals] = await db.select({
    totalOrders: count(),
    totalRevenue: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)`,
    avgOrderValue: sql<string>`COALESCE(AVG(${orders.total}::numeric), 0)`,
  })
    .from(orders)
    .where(gte(orders.createdAt, startDate));

  // Orders by status
  const ordersByStatus = await db.select({
    status: orders.status,
    count: count(),
  })
    .from(orders)
    .where(gte(orders.createdAt, startDate))
    .groupBy(orders.status);

  // Orders by payment method
  const ordersByPaymentMethod = await db.select({
    paymentMethod: orders.paymentMethod,
    count: count(),
  })
    .from(orders)
    .where(gte(orders.createdAt, startDate))
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

  return NextResponse.json({
    totalOrders: totals.totalOrders,
    totalRevenue: parseFloat(totals.totalRevenue || '0'),
    avgOrderValue: parseFloat(totals.avgOrderValue || '0'),
    ordersByStatus,
    ordersByPaymentMethod,
    monthlyTrend: monthlyTrend.map((m) => ({
      ...m,
      totalRevenue: parseFloat(m.totalRevenue || '0'),
    })),
  });
}
