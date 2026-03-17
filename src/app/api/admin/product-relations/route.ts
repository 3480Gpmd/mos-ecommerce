import { db } from '@/db';
import { productRelations, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

  const productId = req.nextUrl.searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

  try {
    const relations = await db.query.productRelations.findMany({
      where: eq(productRelations.productId, parseInt(productId)),
      with: { relatedProduct: true },
      orderBy: (pr) => pr.sortOrder,
    });
    return NextResponse.json({ relations });
  } catch (error) {
    console.error('Error fetching relations:', error);
    return NextResponse.json({ error: 'Failed to fetch relations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await checkAdmin();
  if (!authResult.authorized) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

  try {
    const body = await req.json();
    const { productId, relatedProductId, relationType, sortOrder } = body;
    if (!productId || !relatedProductId || !relationType) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const newRelation = await db.insert(productRelations).values({
      productId,
      relatedProductId,
      relationType,
      sortOrder: sortOrder || 0,
      isActive: true,
    }).returning();

    const relatedProduct = await db.query.products.findFirst({
      where: eq(products.id, relatedProductId),
    });

    return NextResponse.json({ relation: { ...newRelation[0], relatedProduct } }, { status: 201 });
  } catch (error) {
    console.error('Error creating relation:', error);
    return NextResponse.json({ error: 'Failed to create relation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await checkAdmin();
  if (!authResult.authorized) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await db.delete(productRelations).where(eq(productRelations.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting relation:', error);
    return NextResponse.json({ error: 'Failed to delete relation' }, { status: 500 });
  }
}
