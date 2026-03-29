import { db } from '@/db';
import { servicePageSections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const pageId = parseInt(idStr);
    const body = await req.json();
    const { type, title, subtitle, content, imageUrl, backgroundColor, sortOrder } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Missing section type' },
        { status: 400 }
      );
    }

    const result = await db
      .insert(servicePageSections)
      .values({
        pageId,
        type,
        title,
        subtitle,
        content,
        imageUrl,
        backgroundColor,
        sortOrder: sortOrder ?? 0,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ section: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
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
    const pageId = parseInt(idStr);
    const body = await req.json();

    // Check if updating single section or multiple sections (reorder)
    if (body.sections && Array.isArray(body.sections)) {
      // Reorder sections
      await Promise.all(
        body.sections.map((section: any) =>
          db
            .update(servicePageSections)
            .set({ sortOrder: section.sortOrder, updatedAt: new Date() })
            .where(eq(servicePageSections.id, section.id))
        )
      );
      return NextResponse.json({ success: true });
    }

    // Update single section
    const {
      id,
      type,
      title,
      subtitle,
      content,
      imageUrl,
      backgroundColor,
      sortOrder,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing section id' },
        { status: 400 }
      );
    }

    const result = await db
      .update(servicePageSections)
      .set({
        type,
        title,
        subtitle,
        content,
        imageUrl,
        backgroundColor,
        sortOrder,
        isActive,
        updatedAt: new Date(),
      })
      .where(and(eq(servicePageSections.id, id), eq(servicePageSections.pageId, pageId)))
      .returning();

    return NextResponse.json({ section: result[0] });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Failed to update section' },
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
    const pageId = parseInt(idStr);
    const body = await req.json();
    const { id: sectionId } = body;

    if (!sectionId) {
      return NextResponse.json(
        { error: 'Missing section id' },
        { status: 400 }
      );
    }

    await db
      .delete(servicePageSections)
      .where(and(eq(servicePageSections.id, sectionId), eq(servicePageSections.pageId, pageId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const pageId = parseInt(idStr);
    const body = await req.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Invalid sections format' },
        { status: 400 }
      );
    }

    await Promise.all(
      sections.map((section: any) =>
        db
          .update(servicePageSections)
          .set({ sortOrder: section.sortOrder, updatedAt: new Date() })
          .where(and(eq(servicePageSections.id, section.id), eq(servicePageSections.pageId, pageId)))
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering sections:', error);
    return NextResponse.json(
      { error: 'Failed to reorder sections' },
      { status: 500 }
    );
  }
}
