# CMS & SEO Quick Start Guide

Fast reference guide for using the new CMS and SEO management features.

## Quick Access

| Feature | URL | Purpose |
|---------|-----|---------|
| Service Pages | `/admin/servizi` | Manage content pages |
| Edit Service Page | `/admin/servizi/[id]` | Edit page content & sections |
| SEO Dashboard | `/admin/seo` | Configure SEO & metadata |
| Redirects | `/admin/seo/redirects` | Manage 301 redirects |

## Common Tasks

### Create a Service Page

```
1. /admin/servizi → "Nuova pagina"
2. Fill: Title, Slug, Category
3. Fill: Hero Title, Hero Subtitle, Hero Image
4. Fill: Meta Title (≤60 chars), Meta Description (≤160 chars)
5. Click "Salva pagina"
6. Add sections as needed
```

### Add a Section to a Page

```
1. Open service page at /admin/servizi/[id]
2. Click "Aggiungi sezione"
3. Select type (hero, text, features, pricing, gallery, cta, faq, testimonial, process)
4. Click "Crea"
5. Edit section: title, subtitle, content, image, color
6. Click "Salva"
```

### Configure Global SEO

```
1. /admin/seo → "Meta Tag Globali"
2. Fill: Site Title, Description, Keywords
3. Fill: OG Image URL, OG Site Name
4. Scroll down and click "Salva impostazioni"
```

### Add a 301 Redirect

```
1. /admin/seo/redirects → "Nuovo redirect"
2. From URL: /old-page
3. To URL: /new-page
4. Click "Crea redirect"
```

### Check Service Page SEO Score

```
1. /admin/seo → "Pagine Servizi" tab
2. Look for color indicator:
   - GREEN: Optimal (80+)
   - YELLOW: Good (50-79)
   - RED: Needs work (<50)
3. Click eye icon to edit
```

### Set Up Google Analytics

```
1. /admin/seo → "Analytics" tab
2. Enter: Google Analytics 4 ID (G-XXXXXXXXXX)
3. Click "Salva impostazioni"
```

### Add Structured Data (Schema.org)

```
1. /admin/seo → "Structured Data" tab
2. Paste JSON-LD in textarea
3. Example template available in editor
4. Click "Salva impostazioni"
```

## API Quick Reference

### Service Pages

```bash
# List pages
GET /api/admin/service-pages?q=search&category=caffe&page=1&limit=25

# Create page
POST /api/admin/service-pages
{ "title": "...", "slug": "...", "category": "caffe", "isActive": true }

# Update page
PUT /api/admin/service-pages
{ "id": 1, "title": "...", "slug": "..." }

# Delete page
DELETE /api/admin/service-pages
{ "id": 1 }

# Get page with sections
GET /api/admin/service-pages/1

# Add section
POST /api/admin/service-pages/1/sections
{ "type": "text", "title": "..." }

# Update section
PUT /api/admin/service-pages/1/sections
{ "id": 5, "type": "text", "title": "..." }

# Delete section
DELETE /api/admin/service-pages/1/sections
{ "id": 5 }

# Reorder sections
PATCH /api/admin/service-pages/1/sections
{ "sections": [{ "id": 5, "sortOrder": 0 }, { "id": 6, "sortOrder": 1 }] }
```

### SEO Settings

```bash
# Get all SEO settings
GET /api/admin/seo

# Update SEO settings
PUT /api/admin/seo
{
  "settings": {
    "site_title": "...",
    "site_description": "...",
    "google_analytics_id": "G-...",
    ...
  }
}
```

### Redirects

```bash
# List redirects
GET /api/admin/seo/redirects

# Add redirect
POST /api/admin/seo/redirects
{ "fromUrl": "/old", "toUrl": "/new" }

# Delete redirect
DELETE /api/admin/seo/redirects
{ "id": "..." }
```

## Section Types

| Type | Use Case |
|------|----------|
| **hero** | Large banner with title/subtitle/image |
| **text** | Simple text/paragraph content |
| **features** | Showcase features/benefits |
| **pricing** | Display pricing tables |
| **gallery** | Image gallery |
| **cta** | Call-to-action button section |
| **faq** | Frequently asked questions |
| **testimonial** | Customer testimonials |
| **process** | Step-by-step process |

## SEO Scoring System

**Score Calculation:**
- Meta Title (30-60 chars): 40 points
- Meta Description (120-160 chars): 40 points
- Page Title present: 20 points

**Results:**
- 80+: Green ✓ Optimal
- 50-79: Yellow ⚠ Good
- <50: Red ✗ Needs work

## Best Practices

### For Service Pages
- Use descriptive slugs (hyphens, lowercase)
- Always set meta title and description
- Add hero image for visual appeal
- Organize content into logical sections
- Keep titles under 60 characters
- Keep descriptions between 120-160 characters

### For SEO
- Fill global metadata first
- Check SEO scores monthly
- Update robots.txt only if needed
- Use Twitter handle for social sharing
- Add structured data for better search results
- Review redirects after site changes

### For Content
- Use relevant keywords naturally
- Link to related service pages
- Keep language consistent
- Review before publishing
- Test social media preview
- Validate structured data (schema.org)

## Troubleshooting

**Service page won't save?**
- Check title and slug are filled
- Ensure slug is URL-friendly (lowercase, hyphens)

**SEO score is low?**
- Meta title should be 30-60 characters
- Meta description should be 120-160 characters
- Fill both fields for best score

**Redirect not working?**
- Use relative paths: `/old-page` not `old-page`
- Use absolute URL for external: `https://example.com/page`
- Check for typos in URL paths

**Sitemap not updating?**
- Sitemap revalidates every 1 hour
- Add/update service pages and wait
- Check `/sitemap.xml` to verify

## Database Schema Reference

### servicePages
```
id, slug (UNIQUE), title, subtitle, heroTitle, heroSubtitle,
heroImageUrl, metaTitle, metaDescription, category, sortOrder,
isActive, createdAt, updatedAt
```

### servicePageSections
```
id, pageId, type, title, subtitle, content, imageUrl,
backgroundColor, sortOrder, isActive, createdAt, updatedAt
```

### siteSettings (for SEO)
```
id, key (UNIQUE), value, label, group='seo', type, updatedAt
```

## Performance Tips

- Use optimized images (<500KB)
- Paginate long content
- Lazy load images
- Minify JSON-LD
- Compress videos
- Cache static assets

## Next Steps

1. ✓ Create first service page
2. ✓ Configure global SEO metadata
3. ✓ Set Google Analytics ID
4. ✓ Add structured data
5. ✓ Review SEO scores
6. ✓ Add 301 redirects for old URLs
7. ✓ Monitor sitemap changes

## Support Resources

- Full guide: `/ADMIN_CMS_SEO_GUIDE.md`
- API docs: See API Quick Reference above
- Schema.org: https://schema.org/
- Twitter cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards/
- OpenGraph: https://ogp.me/

---

**Last Updated:** March 2026
**Version:** 1.0
**Status:** Production Ready
