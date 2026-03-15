import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pageViews } from '@/db/schema';
import { sql, gte, count } from 'drizzle-orm';

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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Total views
  const [totals] = await db.select({
    totalViews: count(),
    uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})`,
  })
    .from(pageViews)
    .where(gte(pageViews.createdAt, thirtyDaysAgo));

  // Top pages
  const topPages = await db.select({
    path: pageViews.path,
    views: count(),
  })
    .from(pageViews)
    .where(gte(pageViews.createdAt, thirtyDaysAgo))
    .groupBy(pageViews.path)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(20);

  // Daily trend (last 30 days)
  const dailyTrend = await db.select({
    date: sql<string>`TO_CHAR(${pageViews.createdAt}, 'YYYY-MM-DD')`,
    views: count(),
    uniqueVisitors: sql<number>`COUNT(DISTINCT ${pageViews.sessionId})`,
  })
    .from(pageViews)
    .where(gte(pageViews.createdAt, thirtyDaysAgo))
    .groupBy(sql`TO_CHAR(${pageViews.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`TO_CHAR(${pageViews.createdAt}, 'YYYY-MM-DD')`);

  return NextResponse.json({
    totalViews: totals.totalViews,
    uniqueVisitors: totals.uniqueVisitors,
    topPages,
    dailyTrend,
  });
}
