import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RedirectEntry {
  id: string;
  fromUrl: string;
  toUrl: string;
}

export async function GET(req: NextRequest) {
  try {
    const result = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'redirects_301'));

    let redirects: RedirectEntry[] = [];
    if (result.length > 0 && result[0].value) {
      try {
        redirects = JSON.parse(result[0].value);
      } catch {
        redirects = [];
      }
    }

    return NextResponse.json({ redirects });
  } catch (error) {
    console.error('Error fetching redirects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redirects' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fromUrl, toUrl } = body;

    if (!fromUrl || !toUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch existing redirects
    const result = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'redirects_301'));

    let redirects: RedirectEntry[] = [];
    if (result.length > 0 && result[0].value) {
      try {
        redirects = JSON.parse(result[0].value);
      } catch {
        redirects = [];
      }
    }

    // Add new redirect
    const newRedirect: RedirectEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromUrl,
      toUrl,
    };
    redirects.push(newRedirect);

    // Save to database
    if (result.length > 0) {
      await db
        .update(siteSettings)
        .set({ value: JSON.stringify(redirects), updatedAt: new Date() })
        .where(eq(siteSettings.key, 'redirects_301'));
    } else {
      await db.insert(siteSettings).values({
        key: 'redirects_301',
        value: JSON.stringify(redirects),
        label: '301 Redirects',
        group: 'seo',
        type: 'text',
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ redirect: newRedirect }, { status: 201 });
  } catch (error) {
    console.error('Error creating redirect:', error);
    return NextResponse.json(
      { error: 'Failed to create redirect' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      );
    }

    // Fetch existing redirects
    const result = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'redirects_301'));

    let redirects: RedirectEntry[] = [];
    if (result.length > 0 && result[0].value) {
      try {
        redirects = JSON.parse(result[0].value);
      } catch {
        redirects = [];
      }
    }

    // Remove redirect
    redirects = redirects.filter((r) => r.id !== id);

    // Save to database
    if (result.length > 0) {
      await db
        .update(siteSettings)
        .set({ value: JSON.stringify(redirects), updatedAt: new Date() })
        .where(eq(siteSettings.key, 'redirects_301'));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting redirect:', error);
    return NextResponse.json(
      { error: 'Failed to delete redirect' },
      { status: 500 }
    );
  }
}
