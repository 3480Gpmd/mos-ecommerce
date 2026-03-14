import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

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

export async function GET() {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const settings = await db.select().from(siteSettings);

    // Group by category
    const grouped: Record<string, typeof settings> = {};
    for (const s of settings) {
      const g = s.group;
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(s);
    }

    return NextResponse.json({ settings, grouped });
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await checkAdmin();
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { updates } = body; // Array of { key, value }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Formato non valido' }, { status: 400 });
    }

    for (const { key, value } of updates) {
      await db
        .update(siteSettings)
        .set({ value: String(value), updatedAt: new Date() })
        .where(eq(siteSettings.key, key));
    }

    return NextResponse.json({ success: true, updated: updates.length });
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Errore nel salvataggio' }, { status: 500 });
  }
}
