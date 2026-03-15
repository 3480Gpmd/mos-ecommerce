import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false as const, error: 'Non autenticato', status: 401 };
  }
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
  if (!isAdmin) {
    return { authorized: false as const, error: 'Non autorizzato', status: 403 };
  }
  return { authorized: true as const };
}

export async function GET() {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const superPriced = await db
      .select({
        id: products.id,
        code: products.code,
        name: products.name,
        brand: products.brand,
        priceNet: products.priceNet,
        pricePublic: products.pricePublic,
        superPrice: products.superPrice,
        imageUrl: products.imageUrl,
        isSuperPrice: products.isSuperPrice,
      })
      .from(products)
      .where(eq(products.isSuperPrice, true));

    return NextResponse.json({ products: superPriced });
  } catch (error) {
    console.error('GET /api/admin/promotions/superprice error:', error);
    return NextResponse.json({ error: 'Errore nel caricamento prodotti SuperPrezzo' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { productId, isSuperPrice, superPrice } = body;

    if (!productId) {
      return NextResponse.json({ error: 'ID prodotto obbligatorio' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (isSuperPrice !== undefined) updateData.isSuperPrice = isSuperPrice;
    if (superPrice !== undefined) updateData.superPrice = superPrice ? String(superPrice) : null;

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(productId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Prodotto non trovato' }, { status: 404 });
    }

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error('PUT /api/admin/promotions/superprice error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}
