import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { productViews, products, orderItems, productCategories, orders } from '@/db/schema';
import { sql, gte, eq, count, desc, and, isNull } from 'drizzle-orm';

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
  const period = searchParams.get('period') || 'all';

  const now = new Date();
  let startDate: Date | null = null;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
    default:
      startDate = null;
      break;
  }

  // Total products count
  const [totalProductsData] = await db.select({ count: count() })
    .from(products);

  // Active products count
  const [activeProductsData] = await db.select({ count: count() })
    .from(products)
    .where(sql`${products.isActive} = true`);

  // Out of stock count
  const [outOfStockData] = await db.select({ count: count() })
    .from(products)
    .where(sql`${products.stockAvailable} <= 0 AND ${products.isActive} = true`);

  // Average price
  const [avgPriceData] = await db.select({
    avgPrice: sql<string>`COALESCE(AVG(${products.pricePublic}::numeric), COALESCE(AVG(${products.priceNet}::numeric), 0))`,
  })
    .from(products)
    .where(sql`${products.isActive} = true`);

  // Top 20 most ordered products by quantity
  const whereClause = startDate ? gte(orders.createdAt, startDate) : sql`1=1`;
  const topOrderedByQty = await db.select({
    productId: orderItems.productId,
    productCode: orderItems.productCode,
    productName: orderItems.productName,
    totalQty: sql<number>`COALESCE(SUM(${orderItems.qty}), 0)`,
    totalRevenue: sql<string>`COALESCE(SUM(${orderItems.lineTotal}::numeric), 0)`,
  })
    .from(orderItems)
    .where(whereClause)
    .groupBy(orderItems.productId, orderItems.productCode, orderItems.productName)
    .orderBy(desc(sql`SUM(${orderItems.qty})`))
    .limit(20);

  // Top 20 most ordered products by revenue
  const topOrderedByRevenue = await db.select({
    productId: orderItems.productId,
    productCode: orderItems.productCode,
    productName: orderItems.productName,
    totalQty: sql<number>`COALESCE(SUM(${orderItems.qty}), 0)`,
    totalRevenue: sql<string>`COALESCE(SUM(${orderItems.lineTotal}::numeric), 0)`,
  })
    .from(orderItems)
    .where(whereClause)
    .groupBy(orderItems.productId, orderItems.productCode, orderItems.productName)
    .orderBy(desc(sql`SUM(${orderItems.lineTotal}::numeric)`))
    .limit(20);

  // Top 20 most viewed products
  const viewsWhere = startDate ? gte(productViews.createdAt, startDate) : sql`1=1`;
  const topViewed = await db.select({
    productId: productViews.productId,
    productCode: products.code,
    productName: products.name,
    views: count(),
  })
    .from(productViews)
    .leftJoin(products, eq(productViews.productId, products.id))
    .where(viewsWhere)
    .groupBy(productViews.productId, products.code, products.name)
    .orderBy(desc(count()))
    .limit(20);

  // Products never ordered
  const orderedProductIds = await db.select({ productId: orderItems.productId })
    .from(orderItems)
    .groupBy(orderItems.productId);
  const orderedIdSet = new Set(orderedProductIds.map((p) => p.productId).filter(Boolean));

  const neverOrdered = await db.select({
    productId: products.id,
    code: products.code,
    name: products.name,
    pricePublic: products.pricePublic,
    stockAvailable: products.stockAvailable,
  })
    .from(products)
    .where(sql`${products.isActive} = true`)
    .limit(20);
  const neverOrderedFiltered = neverOrdered.filter((p) => !orderedIdSet.has(p.productId));

  // Low stock products (stock < 5)
  const lowStock = await db.select({
    productId: products.id,
    code: products.code,
    name: products.name,
    stockAvailable: products.stockAvailable,
    pricePublic: products.pricePublic,
  })
    .from(products)
    .where(sql`${products.isActive} = true AND ${products.stockAvailable} > 0 AND ${products.stockAvailable} < 5`)
    .orderBy(products.stockAvailable)
    .limit(20);

  // Category breakdown
  const categoryBreakdown = await db.select({
    categoryId: products.categoryId,
    categoryName: productCategories.name,
    productCount: count(),
  })
    .from(products)
    .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
    .where(sql`${products.isActive} = true`)
    .groupBy(products.categoryId, productCategories.name)
    .orderBy(desc(count()));

  return NextResponse.json({
    totalProducts: totalProductsData.count,
    activeProducts: activeProductsData.count,
    outOfStockCount: outOfStockData.count,
    avgPrice: parseFloat(avgPriceData.avgPrice || '0'),
    topOrderedByQty: topOrderedByQty.map((p) => ({
      ...p,
      totalRevenue: parseFloat(p.totalRevenue || '0'),
    })),
    topOrderedByRevenue: topOrderedByRevenue.map((p) => ({
      ...p,
      totalRevenue: parseFloat(p.totalRevenue || '0'),
    })),
    topViewed,
    neverOrdered: neverOrderedFiltered,
    lowStock,
    categoryBreakdown,
  });
}
