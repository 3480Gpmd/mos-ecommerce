import { db } from '@/db';
import { campaigns, campaignProducts } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { authorized: false as const, error: 'Non autenticato', status: 401 };
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
  if (!isAdmin) return { authorized: false as const, error: 'Accesso negato', status: 403 };
  return { authorized: true as const };
}

export async function GET(req: NextRequest) {
  const authResult = await checkAdmin();
  if (!authResult.authorized) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

  const searchParams = req.nextUrl.searchParams;
  const campaignId = searchParams.get('id');
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    if (campaignId) {
      const campaign = await db.query.campaigns.findFirst({
        where: eq(campaigns.id, parseInt(campaignId)),
        with: {
          campaignProducts: {
            with: { product: true },
          },
        },
      });
      if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      return NextResponse.json({ campaign });
    }

    const conditions: ReturnType<typeof eq>[] = [];
    if (status) conditions.push(eq(campaigns.status, status));
    if (type) conditions.push(eq(campaigns.type, type));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db.select().from(campaigns).where(whereClause).orderBy(campaigns.createdAt).limit(limit).offset((page - 1) * limit),
      db.select({ count: sql<number>`count(*)` }).from(campaigns).where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      campaigns: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await checkAdmin();
  if (!authResult.authorized) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

  try {
    const body = await req.json();
    const { name, description, type, status, targetType, targetValue, discountType, discountValue, minOrderAmount, startDate, endDate, emailSubject, emailBody, bannerImageUrl, bannerLink, productIds } = body;

    if (!name || !type) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const campaign = await db.insert(campaigns).values({
      name,
      description,
      type,
      status: status || 'draft',
      targetType: targetType || 'all',
      targetValue,
      discountType,
      discountValue: discountValue ? String(discountValue) : undefined,
      minOrderAmount: minOrderAmount ? String(minOrderAmount) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      emailSubject,
      emailBody,
      bannerImageUrl,
      bannerLink,
    }).returning();

    if (productIds && productIds.length > 0) {
      for (const productId of productIds) {
        await db.insert(campaignProducts).values({ campaignId: campaign[0].id, productId });
      }
    }

    return NextResponse.json({ campaign: campaign[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authResult = await checkAdmin();
  if (!authResult.authorized) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

  try {
    const body = await req.json();
    const { id, name, description, type, status, targetType, targetValue, discountType, discountValue, minOrderAmount, startDate, endDate, emailSubject, emailBody, bannerImageUrl, bannerLink, productIds } = body;

    if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 });

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (targetType !== undefined) updateData.targetType = targetType;
    if (targetValue !== undefined) updateData.targetValue = targetValue;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = discountValue ? String(discountValue) : null;
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount ? String(minOrderAmount) : null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (emailSubject !== undefined) updateData.emailSubject = emailSubject;
    if (emailBody !== undefined) updateData.emailBody = emailBody;
    if (bannerImageUrl !== undefined) updateData.bannerImageUrl = bannerImageUrl;
    if (bannerLink !== undefined) updateData.bannerLink = bannerLink;

    const updated = await db.update(campaigns).set(updateData).where(eq(campaigns.id, id)).returning();

    if (productIds !== undefined) {
      await db.delete(campaignProducts).where(eq(campaignProducts.campaignId, id));
      if (productIds && productIds.length > 0) {
        for (const productId of productIds) {
          await db.insert(campaignProducts).values({ campaignId: id, productId });
        }
      }
    }

    return NextResponse.json({ campaign: updated[0] });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authResult = await checkAdmin();
  if (!authResult.authorized) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

  try {
    const body = await req.json();
    const { id, status, sentCount, openCount, clickCount, conversionCount } = body;
    if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 });

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status !== undefined) updates.status = status;
    if (sentCount !== undefined) updates.sentCount = sentCount;
    if (openCount !== undefined) updates.openCount = openCount;
    if (clickCount !== undefined) updates.clickCount = clickCount;
    if (conversionCount !== undefined) updates.conversionCount = conversionCount;

    const updated = await db.update(campaigns).set(updates).where(eq(campaigns.id, id)).returning();
    return NextResponse.json({ campaign: updated[0] });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await checkAdmin();
  if (!authResult.authorized) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 });
    await db.delete(campaignProducts).where(eq(campaignProducts.campaignId, id));
    await db.delete(campaigns).where(eq(campaigns.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
