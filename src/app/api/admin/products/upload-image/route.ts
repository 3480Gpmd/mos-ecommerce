import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false as const, error: 'Non autenticato', status: 401 };
  }
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
  if (!isAdmin) {
    return { authorized: false as const, error: 'Accesso negato', status: 403 };
  }
  return { authorized: true as const };
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const formData = await req.formData();
    const productId = formData.get('productId');
    const file = formData.get('file') as File;

    if (!productId || !file) {
      return NextResponse.json(
        { error: 'productId e file obbligatori' },
        { status: 400 }
      );
    }

    const productIdNum = parseInt(String(productId));

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productIdNum))
      .limit(1);

    if (!existingProduct.length) {
      return NextResponse.json(
        { error: 'Prodotto non trovato' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get file extension
    const fileExt = file.name.split('.').pop() || 'jpg';
    const contentType = file.type || 'image/jpeg';
    const timestamp = Date.now();
    const filename = `${timestamp}.${fileExt}`;

    // Upload to Supabase Storage
    const supabaseAdmin = getServiceSupabase();
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(`products/${productIdNum}/${filename}`, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError || !data) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: 'Errore durante l\'upload dell\'immagine' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(data.path);

    const publicUrl = publicUrlData.publicUrl;

    // Update product with imageCustom field
    const [updated] = await db
      .update(products)
      .set({
        imageCustom: publicUrl,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productIdNum))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Errore nell\'aggiornamento del prodotto' },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error('POST /api/admin/products/upload-image error:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento dell\'immagine' },
      { status: 500 }
    );
  }
}
