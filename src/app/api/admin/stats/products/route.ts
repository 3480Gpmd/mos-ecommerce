import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { productViews, products } from '@/db/schema';
import { sql, gte, eq, count, desc } from 'drizzle-orm';

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

  // Total views in period
  const [totals] = await db.select({
    totalViews: count(),
  })
    .from(productViews)
    .where(gte(productViews.createdAt, startDate));

  // Top 50 most viewed products
  const topProducts = await db.select({
    productId: productViews.productId,
    productCode: products.code,
    productName: products.name,
    views: count(),
  })
    .from(productViews)
    .leftJoin(products, eq(productViews.productId, products.id))
    .where(gte(productViews.createdAt, startDate))
    .groupBy(productViews.productId, products.code, products.name)
    .orderBy(desc(count()))
    .limit(50);

  // Daily trend
  const dailyTrend = await db.select({
    date: sql<string>`TO_CHAR(${productViews.createdAt}, 'YYYY-MM-DD')`,
    views: count(),
  })
    .from(productViews)
    .where(gte(productViews.createdAt, startDate))
    .groupBy(sql`TO_CHAR(${productViews.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`TO_CHAR(${productViews.createdAt}, 'YYYY-MM-DD')`);

  return NextResponse.json({
    totalViews: totals.totalViews,
    topProducts,
    dailyTrend,
  });
}
