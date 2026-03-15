import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { products, productGroups, productCategories } from '@/db/schema';
import { eq, gt, desc } from 'drizzle-orm';

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
  const type = searchParams.get('type') || 'products';
  const search = searchParams.get('search') || '';

  if (type === 'products') {
    const items = await db.select({
      id: products.id,
      code: products.code,
      name: products.name,
      brand: products.brand,
      relevanceScore: products.relevanceScore,
    })
      .from(products)
      .where(gt(products.relevanceScore, 0))
      .orderBy(desc(products.relevanceScore))
      .limit(100);

    return NextResponse.json(items);
  }

  if (type === 'groups') {
    const items = await db.select({
      id: productGroups.id,
      code: productGroups.code,
      name: productGroups.name,
      relevanceScore: productGroups.relevanceScore,
    })
      .from(productGroups)
      .where(gt(productGroups.relevanceScore, 0))
      .orderBy(desc(productGroups.relevanceScore));

    return NextResponse.json(items);
  }

  if (type === 'categories') {
    const items = await db.select({
      id: productCategories.id,
      code: productCategories.code,
      name: productCategories.name,
      relevanceScore: productCategories.relevanceScore,
    })
      .from(productCategories)
      .where(gt(productCategories.relevanceScore, 0))
      .orderBy(desc(productCategories.relevanceScore));

    return NextResponse.json(items);
  }

  return NextResponse.json({ error: 'Tipo non valido' }, { status: 400 });
}

export async function PUT(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = await req.json();
  const { id, type, relevanceScore } = body;

  if (!id || !type || relevanceScore === undefined) {
    return NextResponse.json({ error: 'ID, tipo e punteggio sono obbligatori' }, { status: 400 });
  }

  const score = Math.max(0, Math.min(100, parseInt(relevanceScore)));

  if (type === 'products') {
    await db.update(products)
      .set({ relevanceScore: score })
      .where(eq(products.id, id));
  } else if (type === 'groups') {
    await db.update(productGroups)
      .set({ relevanceScore: score })
      .where(eq(productGroups.id, id));
  } else if (type === 'categories') {
    await db.update(productCategories)
      .set({ relevanceScore: score })
      .where(eq(productCategories.id, id));
  } else {
    return NextResponse.json({ error: 'Tipo non valido' }, { status: 400 });
  }

  return NextResponse.json({ success: true, relevanceScore: score });
}
