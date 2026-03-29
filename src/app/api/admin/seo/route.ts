import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SEO_KEYS = [
  'site_title',
  'site_description',
  'site_keywords',
  'og_default_image',
  'og_site_name',
  'twitter_handle',
  'twitter_card_type',
  'google_analytics_id',
  'google_search_console_verification',
  'schema_org_json',
  'robots_txt_custom',
  'product_meta_template',
];

export async function GET(req: NextRequest) {
  try {
    const results = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.group, 'seo'));

    const settings: Record<string, string> = {};
    results.forEach((setting) => {
      settings[setting.key] = setting.value;
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEO settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings format' },
        { status: 400 }
      );
    }

    // Update or insert each setting
    for (const [key, value] of Object.entries(settings)) {
      if (!SEO_KEYS.includes(key)) continue;

      const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, key));

      const stringValue = String(value || '');
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      if (existing.length > 0) {
        await db
          .update(siteSettings)
          .set({ value: stringValue, updatedAt: new Date() })
          .where(eq(siteSettings.key, key));
      } else {
        await db.insert(siteSettings).values({
          key,
          value: stringValue,
          label,
          group: 'seo',
          type: 'text',
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    return NextResponse.json(
      { error: 'Failed to update SEO settings' },
      { status: 500 }
    );
  }
}
