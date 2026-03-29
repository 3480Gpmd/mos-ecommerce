import { db } from '@/db';
import { servicePages, servicePageSections } from '@/db/schema';
import { eq, ilike, sql, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    // Build where conditions
    const conditions = [];
    if (q) {
      conditions.push(ilike(servicePages.title, `%${q}%`));
    }
    if (category && category !== 'all') {
      conditions.push(eq(servicePages.category, category));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(servicePages)
      .where(whereClause)
      .then((res) => res[0]?.count || 0);

    const pages = await db
      .select()
      .from(servicePages)
      .where(whereClause)
      .orderBy(servicePages.sortOrder, servicePages.updatedAt)
      .limit(limit)
      .offset((page - 1) * limit);

    // Get section counts
    const pagesWithCounts = await Promise.all(
      pages.map(async (p) => {
        const sections = await db
          .select({ count: sql<number>`count(*)` })
          .from(servicePageSections)
          .where(eq(servicePageSections.pageId, p.id));
        return {
          ...p,
          sectionsCount: sections[0]?.count || 0,
        };
      })
    );

    return NextResponse.json({
      pages: pagesWithCounts,
      pagination: { total, page, limit },
    });
  } catch (error) {
    console.error('Error fetching service pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service pages' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      subtitle,
      heroTitle,
      heroSubtitle,
      heroImageUrl,
      metaTitle,
      metaDescription,
      category,
      isActive,
    } = body;

    if (!title || !slug || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await db
      .insert(servicePages)
      .values({
        title,
        slug,
        subtitle,
        heroTitle,
        heroSubtitle,
        heroImageUrl,
        metaTitle,
        metaDescription,
        category,
        isActive: isActive ?? true,
        sortOrder: 0,
      })
      .returning();

    return NextResponse.json({ page: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating service page:', error);
    return NextResponse.json(
      { error: 'Failed to create service page' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      slug,
      subtitle,
      heroTitle,
      heroSubtitle,
      heroImageUrl,
      metaTitle,
      metaDescription,
      category,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }

    const result = await db
      .update(servicePages)
      .set({
        title,
        slug,
        subtitle,
        heroTitle,
        heroSubtitle,
        heroImageUrl,
        metaTitle,
        metaDescription,
        category,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(servicePages.id, id))
      .returning();

    return NextResponse.json({ page: result[0] });
  } catch (error) {
    console.error('Error updating service page:', error);
    return NextResponse.json(
      { error: 'Failed to update service page' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }

    await db
      .delete(servicePages)
      .where(eq(servicePages.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service page:', error);
    return NextResponse.json(
      { error: 'Failed to delete service page' },
      { status: 500 }
    );
  }
}
