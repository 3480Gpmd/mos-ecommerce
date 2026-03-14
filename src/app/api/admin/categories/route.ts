import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  productGroups,
  productCategories,
  productSubcategories,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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

// GET: Returns all groups with their categories and subcategories (nested)
export async function GET() {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Non autenticato' ? 401 : 403 }
      );
    }

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

    // Build nested structure
    const tree = groups.map((group) => ({
      ...group,
      categories: categories
        .filter((cat) => cat.groupId === group.id)
        .map((cat) => ({
          ...cat,
          subcategories: subcategories.filter(
            (sub) => sub.categoryId === cat.id
          ),
        })),
    }));

    return NextResponse.json({ groups: tree });
  } catch (error) {
    console.error('GET /api/admin/categories error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST: Create a new group, category, or subcategory
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
    const { type, data } = body;

    if (!type || !data?.name) {
      return NextResponse.json(
        { error: 'Tipo e nome sono obbligatori' },
        { status: 400 }
      );
    }

    const slug = slugify(data.name);
    const code = slug.toUpperCase().replace(/-/g, '_');

    switch (type) {
      case 'group': {
        const [group] = await db
          .insert(productGroups)
          .values({
            name: data.name,
            slug,
            code,
            sortOrder: data.sortOrder ?? 0,
          })
          .returning();
        return NextResponse.json({ item: group }, { status: 201 });
      }

      case 'category': {
        if (!data.groupId) {
          return NextResponse.json(
            { error: 'groupId obbligatorio per le categorie' },
            { status: 400 }
          );
        }
        const [category] = await db
          .insert(productCategories)
          .values({
            name: data.name,
            slug,
            code,
            groupId: data.groupId,
            sortOrder: data.sortOrder ?? 0,
          })
          .returning();
        return NextResponse.json({ item: category }, { status: 201 });
      }

      case 'subcategory': {
        if (!data.categoryId) {
          return NextResponse.json(
            { error: 'categoryId obbligatorio per le sottocategorie' },
            { status: 400 }
          );
        }
        const [subcategory] = await db
          .insert(productSubcategories)
          .values({
            name: data.name,
            slug,
            code,
            categoryId: data.categoryId,
            sortOrder: data.sortOrder ?? 0,
          })
          .returning();
        return NextResponse.json({ item: subcategory }, { status: 201 });
      }

      default:
        return NextResponse.json(
          { error: 'Tipo non valido. Usa: group, category, subcategory' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/admin/categories error:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione' },
      { status: 500 }
    );
  }
}

// PUT: Update name/slug of a group, category, or subcategory
export async function PUT(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Non autenticato' ? 401 : 403 }
      );
    }

    const body = await req.json();
    const { type, id, data } = body;

    if (!type || !id || !data?.name) {
      return NextResponse.json(
        { error: 'Tipo, id e nome sono obbligatori' },
        { status: 400 }
      );
    }

    const slug = slugify(data.name);
    const code = slug.toUpperCase().replace(/-/g, '_');

    switch (type) {
      case 'group': {
        const [updated] = await db
          .update(productGroups)
          .set({ name: data.name, slug, code })
          .where(eq(productGroups.id, id))
          .returning();
        if (!updated) {
          return NextResponse.json(
            { error: 'Gruppo non trovato' },
            { status: 404 }
          );
        }
        return NextResponse.json({ item: updated });
      }

      case 'category': {
        const [updated] = await db
          .update(productCategories)
          .set({ name: data.name, slug, code })
          .where(eq(productCategories.id, id))
          .returning();
        if (!updated) {
          return NextResponse.json(
            { error: 'Categoria non trovata' },
            { status: 404 }
          );
        }
        return NextResponse.json({ item: updated });
      }

      case 'subcategory': {
        const [updated] = await db
          .update(productSubcategories)
          .set({ name: data.name, slug, code })
          .where(eq(productSubcategories.id, id))
          .returning();
        if (!updated) {
          return NextResponse.json(
            { error: 'Sottocategoria non trovata' },
            { status: 404 }
          );
        }
        return NextResponse.json({ item: updated });
      }

      default:
        return NextResponse.json(
          { error: 'Tipo non valido' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('PUT /api/admin/categories error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a group, category, or subcategory
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === 'Non autenticato' ? 401 : 403 }
      );
    }

    const body = await req.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Tipo e id sono obbligatori' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'group': {
        // Check if group has categories
        const cats = await db
          .select({ id: productCategories.id })
          .from(productCategories)
          .where(eq(productCategories.groupId, id));
        if (cats.length > 0) {
          return NextResponse.json(
            {
              error:
                'Impossibile eliminare: il gruppo contiene categorie. Elimina prima le categorie.',
            },
            { status: 409 }
          );
        }
        await db
          .delete(productGroups)
          .where(eq(productGroups.id, id));
        return NextResponse.json({ success: true });
      }

      case 'category': {
        // Check if category has subcategories
        const subs = await db
          .select({ id: productSubcategories.id })
          .from(productSubcategories)
          .where(eq(productSubcategories.categoryId, id));
        if (subs.length > 0) {
          return NextResponse.json(
            {
              error:
                'Impossibile eliminare: la categoria contiene sottocategorie. Elimina prima le sottocategorie.',
            },
            { status: 409 }
          );
        }
        await db
          .delete(productCategories)
          .where(eq(productCategories.id, id));
        return NextResponse.json({ success: true });
      }

      case 'subcategory': {
        await db
          .delete(productSubcategories)
          .where(eq(productSubcategories.id, id));
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: 'Tipo non valido' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('DELETE /api/admin/categories error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione' },
      { status: 500 }
    );
  }
}
