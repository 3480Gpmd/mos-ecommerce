# CMS & SEO Management System Guide

This document describes the new CMS backend for managing service pages and comprehensive SEO management features added to the Next.js e-commerce platform.

## Part 1: Service Pages CMS

### Overview
A complete content management system for creating and managing service pages with multiple section types.

### Features

#### Service Pages List (`/admin/servizi`)
- View all service pages with status indicators
- Filter by category (Caffè, Acqua, Ufficio) and search
- Create new pages
- Edit/Delete pages
- See section count for each page

#### Edit Service Page (`/admin/servizi/[id]`)
Manage individual service pages with:

**Basic Information**
- Title (required)
- Slug (URL path, required)
- Subtitle
- Category (Caffè, Acqua, Ufficio)
- Active/Inactive status

**Hero Section**
- Hero Title
- Hero Subtitle
- Hero Image URL

**SEO Fields**
- Meta Title (with character counter, max 60)
- Meta Description (with character counter, max 160)

**Content Sections**
- Add multiple content sections of different types
- Each section supports:
  - Type: hero, text, features, pricing, gallery, cta, faq, testimonial, process
  - Title and Subtitle
  - Rich content area
  - Image URL
  - Background color selector
  - Reorder sections (drag up/down)
  - Edit/Delete sections

### API Endpoints

**Service Pages CRUD**
- `GET /api/admin/service-pages` - List pages with filters
- `POST /api/admin/service-pages` - Create new page
- `PUT /api/admin/service-pages` - Update page
- `DELETE /api/admin/service-pages` - Delete page

**Single Page Operations**
- `GET /api/admin/service-pages/[id]` - Get page with sections
- `PUT /api/admin/service-pages/[id]` - Update page
- `DELETE /api/admin/service-pages/[id]` - Delete page

**Sections Management**
- `POST /api/admin/service-pages/[id]/sections` - Add section
- `PUT /api/admin/service-pages/[id]/sections` - Update section
- `DELETE /api/admin/service-pages/[id]/sections` - Delete section
- `PATCH /api/admin/service-pages/[id]/sections` - Reorder sections

### Database Schema

**servicePages Table**
```
- id (PK)
- slug (UNIQUE)
- title
- subtitle
- heroTitle
- heroSubtitle
- heroImageUrl
- metaTitle
- metaDescription
- category (caffe|acqua|ufficio)
- sortOrder
- isActive
- createdAt
- updatedAt
```

**servicePageSections Table**
```
- id (PK)
- pageId (FK to servicePages)
- type (hero|text|features|pricing|gallery|cta|faq|testimonial|process)
- title
- subtitle
- content (JSON string for complex data)
- imageUrl
- backgroundColor
- sortOrder
- isActive
- createdAt
- updatedAt
```

---

## Part 2: SEO Management System

### Overview
Comprehensive SEO and metadata management dashboard with multiple configuration sections.

### SEO Dashboard (`/admin/seo`)

#### Tabs

**1. Meta Tag Globali (Global Metadata)**
- Site Title
- Site Description
- Site Keywords
- OpenGraph default image
- OpenGraph site name

**2. Pagine Servizi (Service Pages SEO)**
- View all service pages with SEO score indicator
- Color-coded status: Green (Optimal), Yellow (Good), Red (Needs improvement)
- Score is based on:
  - Meta Title completeness (30-60 chars) = 40 points
  - Meta Description completeness (120-160 chars) = 40 points
  - Page title presence = 20 points
- Quick-link to edit page

**3. Pagine Prodotto (Product Page Template)**
- Template for auto-generating product page meta tags
- Supports variables: {name}, {brand}, {price}
- Example: "{name} - {brand} | Miglior prezzo"

**4. Sitemap & Robots**
- Custom robots.txt editor
- Auto-generated sitemap at `/sitemap.xml`
- Includes static pages, service pages, and products
- Automatically revalidates every hour

**5. Google Analytics**
- Google Analytics 4 tracking ID
- Storage in siteSettings table with group='seo'

**6. Google Search Console**
- Meta tag verification field
- Stores only the content value (not full tag)

**7. Schema.org / Structured Data**
- JSON-LD editor for structured data
- Support for Organization, LocalBusiness, Product schemas
- Improves search engine understanding

**8. Social Media**
- Twitter handle
- Twitter card type (summary, summary_large_image, app, player)
- OpenGraph defaults apply to all pages

### Redirects Management (`/admin/seo/redirects`)

**Features**
- Add 301 permanent redirects
- From URL (relative path): `/old-page`
- To URL (relative or absolute): `/new-page` or `https://example.com/page`
- View all redirects in table format
- Delete redirects
- Stored as JSON in siteSettings

**Usage Examples**
```
Old URL: /categorie/caffe-borbone
New URL: /servizi/caffe-borbone

Old URL: /prodotto/old-code
New URL: /prodotto/new-code

Old URL: /contact
New URL: https://example.com/contact-us
```

### API Endpoints

**SEO Settings**
- `GET /api/admin/seo` - Get all SEO settings
- `PUT /api/admin/seo` - Update SEO settings

**Redirects**
- `GET /api/admin/seo/redirects` - List all redirects
- `POST /api/admin/seo/redirects` - Create redirect
- `DELETE /api/admin/seo/redirects` - Delete redirect

### Database Storage

All SEO settings are stored in the `siteSettings` table with `group='seo'`:

```
siteSettings (for SEO group)
- site_title
- site_description
- site_keywords
- og_default_image
- og_site_name
- twitter_handle
- twitter_card_type
- google_analytics_id
- google_search_console_verification
- schema_org_json
- robots_txt_custom
- product_meta_template
- redirects_301 (JSON array)
```

### Dynamic Files

**robots.ts** - Updated to read from siteSettings
- Still maintains default disallow rules
- Can be overridden with custom robots.txt in settings
- Uses environment variable for base URL

**sitemap.ts** - Enhanced to include service pages
- Automatically fetches active service pages from database
- Updates lastModified based on page updatedAt timestamp
- Includes static pages, service pages, and products
- Revalidates every 3600 seconds (1 hour)

---

## File Structure

```
src/app/admin/
├── servizi/
│   ├── page.tsx                 (Service pages list)
│   └── [id]/
│       └── page.tsx             (Edit service page)
└── seo/
    ├── page.tsx                 (SEO dashboard)
    └── redirects/
        └── page.tsx             (Redirects management)

src/app/api/admin/
├── service-pages/
│   ├── route.ts                 (CRUD operations)
│   └── [id]/
│       ├── route.ts             (Single page operations)
│       └── sections/
│           └── route.ts         (Sections CRUD & reorder)
└── seo/
    ├── route.ts                 (SEO settings)
    └── redirects/
        └── route.ts             (Redirects CRUD)

src/app/
├── robots.ts                    (Updated - reads from siteSettings)
└── sitemap.ts                   (Updated - includes service pages)
```

---

## Usage Examples

### Creating a Service Page

1. Go to `/admin/servizi`
2. Click "Nuova pagina"
3. Fill in basic info:
   - Title: "Servizio Caffè Borbone"
   - Slug: "caffe-borbone"
   - Category: "Caffè"
4. Fill in hero section
5. Click "Salva pagina"
6. Add sections:
   - Click "Aggiungi sezione"
   - Select type (e.g., "Text")
   - Edit content in modal
   - Save
7. Reorder sections using arrow buttons
8. Set SEO metadata with proper title/description length

### Setting Up SEO

1. Go to `/admin/seo`
2. Fill in "Meta Tag Globali":
   - Site Title: "Milano Offre Servizi - Caffè e Acqua per Uffici"
   - Site Description: "Fornitura professionale di caffè, acqua e servizi per uffici a Milano"
   - Keywords: "caffè ufficio, acqua, servizi"
3. Check "Pagine Servizi" tab to see SEO scores
4. Set "Pagine Prodotto" template: "{name} - {brand} | Miglior prezzo"
5. Configure social media handles (Twitter, OpenGraph)
6. Add schema.org JSON for Organization
7. Go to "Redirect 301" tab to add redirects if needed

### Adding a 301 Redirect

1. Go to `/admin/seo/redirects`
2. Click "Nuovo redirect"
3. Enter:
   - Da URL: `/old-product/old-code`
   - A URL: `/prodotto/new-code`
4. Click "Crea redirect"

---

## Best Practices

### Service Pages
- Use descriptive slugs (e.g., `caffe-borbone` not `product1`)
- Fill in SEO metadata for every page
- Use hero images optimized for web (< 500KB)
- Organize sections logically
- Keep content well-structured with clear titles

### SEO
- Meta titles: 50-60 characters for optimal display
- Meta descriptions: 150-160 characters for optimal display
- Always fill in metadata for important pages
- Review SEO scores regularly (aim for 80+)
- Use structured data for rich snippets
- Update robots.txt only if needed (defaults are secure)
- Add redirects when changing page URLs

### Content
- Use consistent language (Italian for this site)
- Include keywords naturally in titles and descriptions
- Link between related service pages
- Keep product meta template consistent
- Review sitemap regularly to ensure all pages are indexed

---

## Browser Compatibility

All admin interfaces use:
- Tailwind CSS for styling
- Lucide React for icons
- HTML5 standard form elements
- Modern JavaScript (ES6+)

No special browser requirements; works on all modern browsers (Chrome, Firefox, Safari, Edge).

---

## Future Enhancements

Potential improvements for future versions:

1. **Bulk Operations**
   - Bulk update SEO metadata for multiple pages
   - Bulk create service pages from template
   - Bulk redirect import/export

2. **Advanced Features**
   - A/B testing metadata
   - Keyword research integration
   - SEO analytics dashboard
   - Link checking
   - Broken link detection

3. **Integrations**
   - Google Search Console API
   - Google Analytics API
   - Social media preview generators
   - Structured data validation

4. **Rich Editing**
   - WYSIWYG editor for section content
   - Image upload directly in editor
   - Media gallery management
   - Video embedding

5. **Versioning**
   - Page version history
   - Rollback functionality
   - Change tracking

---

## Support

For issues or questions about the CMS and SEO system:
1. Check this documentation
2. Review the API response messages for errors
3. Check browser console for JavaScript errors
4. Verify database connectivity and schema updates
