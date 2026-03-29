import { db } from '@/db';
import { servicePages, servicePageSections } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    const page = await db
      .select()
      .from(servicePages)
      .where(eq(servicePages.id, id))
      .then((res) => res[0]);

    if (!page) {
      return NextResponse.json(
        { error: 'Service page not found' },
        { status: 404 }
      );
    }

    const sections = await db
      .select()
      .from(servicePageSections)
      .where(eq(servicePageSections.pageId, id))
      .orderBy(servicePageSections.sortOrder);

    return NextResponse.json({ page: { ...page, sections } });
  } catch (error) {
    console.error('Error fetching service page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service page' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

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
