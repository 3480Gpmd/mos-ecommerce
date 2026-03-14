import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.code, code), eq(products.isActive, true)))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: 'Prodotto non trovato' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err: unknown) {
    console.error('🔴 GET /api/products/[code] error:', err);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
