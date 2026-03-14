import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  priceLists,
  categoryMarkups,
  specialDiscounts,
  productGroups,
  productCategories,
  productSubcategories,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false as const, error: 'Non autenticato' };
  }
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
  if (!isAdmin) {
    return { authorized: false as const, error: 'Accesso negato' };
  }
  return { authorized: true as const };
}

// GET: Returns all price lists with markups, discounts, and category tree
export async function GET() {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Non autenticato' ? 401 : 403 }
      );
    }

    const lists = await db
      .select()
      .from(priceLists)
      .orderBy(priceLists.isDefault, priceLists.name);

    const markups = await db
      .select()
      .from(categoryMarkups)
      .orderBy(categoryMarkups.priceListId);

    const discounts = await db
      .select()
      .from(specialDiscounts)
      .orderBy(specialDiscounts.name);

    const groups = await db
      .select()
      .from(productGroups)
      .orderBy(productGroups.sortOrder, productGroups.name);

    const categories = await db
      .select()
      .from(productCategories)
      .orderBy(productCategories.sortOrder, productCategories.name);

    const subcategories = await db
      .select()
      .from(productSubcategories)
      .orderBy(productSubcategories.sortOrder, productSubcategories.name);

    return NextResponse.json({
      priceLists: lists,
      markups,
      discounts,
      groups,
      categories,
      subcategories,
    });
  } catch (error) {
    console.error('GET /api/admin/pricing error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST: Create/update/delete price lists, markups, discounts
export async function POST(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Non autenticato' ? 401 : 403 }
      );
    }

    const body = await req.json();
    const { action, data } = body;

    if (!action || !data) {
      return NextResponse.json(
        { error: 'Azione e dati sono obbligatori' },
        { status: 400 }
      );
    }

    switch (action) {
      // ─── Listini ──────────────────────────────────────────────
      case 'create_list': {
        if (!data.code || !data.name) {
          return NextResponse.json(
            { error: 'Codice e nome sono obbligatori' },
            { status: 400 }
          );
        }
        const [item] = await db
          .insert(priceLists)
          .values({
            code: data.code,
            name: data.name,
            description: data.description || null,
            discountPct: data.discountPct ?? '0',
            isDefault: data.isDefault ?? false,
            isActive: data.isActive ?? true,
          })
          .returning();
        return NextResponse.json({ item }, { status: 201 });
      }

      case 'update_list': {
        if (!data.id) {
          return NextResponse.json(
            { error: 'ID obbligatorio' },
            { status: 400 }
          );
        }
        const [updated] = await db
          .update(priceLists)
          .set({
            ...(data.name !== undefined && { name: data.name }),
            ...(data.code !== undefined && { code: data.code }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.discountPct !== undefined && { discountPct: data.discountPct }),
            ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
          })
          .where(eq(priceLists.id, data.id))
          .returning();
        if (!updated) {
          return NextResponse.json(
            { error: 'Listino non trovato' },
            { status: 404 }
          );
        }
        return NextResponse.json({ item: updated });
      }

      // ─── Ricarichi per categoria ──────────────────────────────
      case 'create_markup': {
        if (!data.priceListId) {
          return NextResponse.json(
            { error: 'priceListId obbligatorio' },
            { status: 400 }
          );
        }
        const [markup] = await db
          .insert(categoryMarkups)
          .values({
            priceListId: data.priceListId,
            groupId: data.groupId || null,
            categoryId: data.categoryId || null,
            subcategoryId: data.subcategoryId || null,
            markupPct: data.markupPct ?? '0',
            discountPct: data.discountPct ?? '0',
          })
          .returning();
        return NextResponse.json({ item: markup }, { status: 201 });
      }

      case 'update_markup': {
        if (!data.id) {
          return NextResponse.json(
            { error: 'ID obbligatorio' },
            { status: 400 }
          );
        }
        const [updatedMarkup] = await db
          .update(categoryMarkups)
          .set({
            ...(data.groupId !== undefined && { groupId: data.groupId || null }),
            ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
            ...(data.subcategoryId !== undefined && { subcategoryId: data.subcategoryId || null }),
            ...(data.markupPct !== undefined && { markupPct: data.markupPct }),
            ...(data.discountPct !== undefined && { discountPct: data.discountPct }),
          })
          .where(eq(categoryMarkups.id, data.id))
          .returning();
        if (!updatedMarkup) {
          return NextResponse.json(
            { error: 'Ricarico non trovato' },
            { status: 404 }
          );
        }
        return NextResponse.json({ item: updatedMarkup });
      }

      case 'delete_markup': {
        if (!data.id) {
          return NextResponse.json(
            { error: 'ID obbligatorio' },
            { status: 400 }
          );
        }
        await db
          .delete(categoryMarkups)
          .where(eq(categoryMarkups.id, data.id));
        return NextResponse.json({ success: true });
      }

      // ─── Sconti speciali ──────────────────────────────────────
      case 'create_discount': {
        if (!data.name || !data.type) {
          return NextResponse.json(
            { error: 'Nome e tipo sono obbligatori' },
            { status: 400 }
          );
        }
        const [discount] = await db
          .insert(specialDiscounts)
          .values({
            name: data.name,
            type: data.type,
            productId: data.productId || null,
            groupId: data.groupId || null,
            categoryId: data.categoryId || null,
            customerId: data.customerId || null,
            priceListId: data.priceListId || null,
            discountPct: data.discountPct ?? '0',
            fixedPrice: data.fixedPrice || null,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            isActive: data.isActive ?? true,
          })
          .returning();
        return NextResponse.json({ item: discount }, { status: 201 });
      }

      case 'update_discount': {
        if (!data.id) {
          return NextResponse.json(
            { error: 'ID obbligatorio' },
            { status: 400 }
          );
        }
        const [updatedDiscount] = await db
          .update(specialDiscounts)
          .set({
            ...(data.name !== undefined && { name: data.name }),
            ...(data.type !== undefined && { type: data.type }),
            ...(data.productId !== undefined && { productId: data.productId || null }),
            ...(data.groupId !== undefined && { groupId: data.groupId || null }),
            ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
            ...(data.customerId !== undefined && { customerId: data.customerId || null }),
            ...(data.priceListId !== undefined && { priceListId: data.priceListId || null }),
            ...(data.discountPct !== undefined && { discountPct: data.discountPct }),
            ...(data.fixedPrice !== undefined && { fixedPrice: data.fixedPrice || null }),
            ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
            ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
          })
          .where(eq(specialDiscounts.id, data.id))
          .returning();
        if (!updatedDiscount) {
          return NextResponse.json(
            { error: 'Sconto non trovato' },
            { status: 404 }
          );
        }
        return NextResponse.json({ item: updatedDiscount });
      }

      case 'delete_discount': {
        if (!data.id) {
          return NextResponse.json(
            { error: 'ID obbligatorio' },
            { status: 400 }
          );
        }
        await db
          .delete(specialDiscounts)
          .where(eq(specialDiscounts.id, data.id));
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: 'Azione non valida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/admin/pricing error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
