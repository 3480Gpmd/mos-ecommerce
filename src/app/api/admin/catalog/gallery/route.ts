import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { productImages } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId obbligatorio' }, { status: 400 });
  }

  const images = await db.select()
    .from(productImages)
    .where(eq(productImages.productId, parseInt(productId)))
    .orderBy(productImages.sortOrder);

  return NextResponse.json(images);
}

export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { productId, imageUrl, altText, sortOrder, isPrimary } = body;

  if (!productId || !imageUrl) {
    return NextResponse.json({ error: 'productId e imageUrl sono obbligatori' }, { status: 400 });
  }

  // If setting as primary, unset other primaries for this product
  if (isPrimary) {
    await db.update(productImages)
      .set({ isPrimary: false })
      .where(eq(productImages.productId, productId));
  }

  const [image] = await db.insert(productImages).values({
    productId,
    imageUrl,
    altText: altText || null,
    sortOrder: sortOrder ?? 0,
    isPrimary: isPrimary ?? false,
  }).returning();

  return NextResponse.json(image, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { id, sortOrder, altText, isPrimary } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
  }

  // If setting as primary, unset other primaries for this product
  if (isPrimary) {
    const [existing] = await db.select({ productId: productImages.productId })
      .from(productImages)
      .where(eq(productImages.id, id));

    if (existing) {
      await db.update(productImages)
        .set({ isPrimary: false })
        .where(eq(productImages.productId, existing.productId));
    }
  }

  const [image] = await db.update(productImages)
    .set({
      sortOrder,
      altText,
      isPrimary: isPrimary ?? false,
    })
    .where(eq(productImages.id, id))
    .returning();

  if (!image) {
    return NextResponse.json({ error: 'Immagine non trovata' }, { status: 404 });
  }

  return NextResponse.json(image);
}

export async function DELETE(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
  }

  await db.delete(productImages).where(eq(productImages.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
