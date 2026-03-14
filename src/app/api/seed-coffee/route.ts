import { NextResponse } from 'next/server';
import { db } from '@/db';
import { productGroups, productCategories, productSubcategories, products } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST() {
  try {
    // 1. Create group CAFFÈ E BEVANDE CALDE
    const [group] = await db
      .insert(productGroups)
      .values({
        code: 'GRP-CAFFE',
        name: 'CAFFÈ E BEVANDE CALDE',
        slug: 'caffe-e-bevande-calde',
        sortOrder: 1,
      })
      .onConflictDoNothing()
      .returning();

    const groupId = group?.id || (await db.select({ id: productGroups.id }).from(productGroups).where(eq(productGroups.code, 'GRP-CAFFE')))[0]?.id;

    if (!groupId) throw new Error('Failed to create group');

    // 2. Create category LAVAZZA FIRMA
    const [catLavazza] = await db
      .insert(productCategories)
      .values({
        code: 'CAT-LAVAZZA-FIRMA',
        name: 'LAVAZZA FIRMA',
        slug: 'lavazza-firma',
        groupId,
        sortOrder: 1,
      })
      .onConflictDoNothing()
      .returning();

    const catId = catLavazza?.id || (await db.select({ id: productCategories.id }).from(productCategories).where(eq(productCategories.code, 'CAT-LAVAZZA-FIRMA')))[0]?.id;

    // 3. Create subcategories
    const subcatDefs = [
      { code: 'SUB-LVF-CAFFE', name: 'CAFFÈ IN CAPSULE', slug: 'caffe-in-capsule', sortOrder: 1 },
      { code: 'SUB-LVF-BEVANDE', name: 'BEVANDE CALDE E ACCESSORI', slug: 'bevande-calde', sortOrder: 2 },
      { code: 'SUB-LVF-ACC-ECO', name: 'ACCESSORI ECO-FRIENDLY', slug: 'accessori-eco-friendly', sortOrder: 3 },
      { code: 'SUB-LVF-ACC-PLAST', name: 'ACCESSORI DI PLASTICA', slug: 'accessori-plastica', sortOrder: 4 },
    ];

    const subcatIds: Record<string, number> = {};
    for (const sc of subcatDefs) {
      const [ins] = await db
        .insert(productSubcategories)
        .values({ ...sc, categoryId: catId! })
        .onConflictDoNothing()
        .returning();
      subcatIds[sc.code] = ins?.id || (await db.select({ id: productSubcategories.id }).from(productSubcategories).where(eq(productSubcategories.code, sc.code)))[0]?.id;
    }

    // 4. Insert products from Listino Firma 2026
    const productList = [
      // CAFFÈ (48 capsule, tranne dek 24)
      { code: 'LVF-001', name: 'Lavazza Firma Espresso Decaffeinato 100% Arabica - 24 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Espresso Decaffeinato. 100% arabica, tostatura media, intensità 6. Confezione da 24 capsule.', price: '9.55', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: 'https://shop.milanooffreservizi.it/data_img/immagini/200/Lavazza_business_caspule_firma_espresso-decaffeina.jpg' },
      { code: 'LVF-002', name: 'Lavazza Firma Espresso Qualità Oro - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Espresso Qualità Oro. 100% arabica, tostatura media, intensità 7. Confezione da 48 capsule.', price: '20.82', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: 'https://shop.milanooffreservizi.it/data_img/immagini/200/LavazzaFirma-Qualita`Oro-.jpg' },
      { code: 'LVF-003', name: 'Lavazza Firma Espresso Tales of Torino "Lungo" - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Espresso Tales of Torino Lungo. 100% arabica, tostatura scura, intensità 7. Confezione da 48 capsule.', price: '21.20', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: '' },
      { code: 'LVF-004', name: 'Lavazza Firma Espresso Tales of Milano - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Espresso Tales of Milano. 100% arabica, tostatura media, intensità 7. Confezione da 48 capsule.', price: '21.00', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: '' },
      { code: 'LVF-005', name: 'Lavazza Firma Espresso Tales of Roma - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Espresso Tales of Roma. Robusta/arabica, tostatura media, intensità 8. Confezione da 48 capsule.', price: '21.20', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: '' },
      { code: 'LVF-006', name: 'Lavazza Firma Espresso Gran Caffè Paulista 100% Arabica - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Gran Caffè Paulista. 100% arabica selezionata del Brasile, tostatura media, intensità 8. Confezione da 48 capsule.', price: '19.82', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: '' },
      { code: 'LVF-007', name: 'Lavazza Firma Espresso Gustoso - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Espresso Gustoso. Robusta/arabica, tostatura media, intensità 9. Confezione da 48 capsule.', price: '19.09', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: 'https://shop.milanooffreservizi.it/data_img/immagini/200/Lavazza_business_caspule_firma_espresso-gustoso-th.jpg' },
      { code: 'LVF-008', name: 'Lavazza Firma Espresso Qualità Rossa - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Espresso Qualità Rossa. Robusta/arabica, tostatura media, intensità 9. Confezione da 48 capsule.', price: '21.08', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: 'https://shop.milanooffreservizi.it/data_img/immagini/200/Qualita-Rossa-capsule-Lav.jpg' },
      { code: 'LVF-009', name: 'Lavazza Firma Espresso Tales of Torino - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Espresso Tales of Torino. 100% arabica, tostatura scura, intensità 9. Confezione da 48 capsule.', price: '21.20', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: '' },
      { code: 'LVF-010', name: 'Lavazza Firma Espresso Tales of Napoli - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Espresso Tales of Napoli. Robusta/arabica, tostatura scura, intensità 10. Confezione da 48 capsule.', price: '21.00', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: '' },
      { code: 'LVF-011', name: 'Lavazza Firma Espresso Crema e Gusto Classico - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Espresso Crema e Gusto Classico. Robusta/arabica, tostatura media, intensità 12. Confezione da 48 capsule.', price: '18.91', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: 'https://shop.milanooffreservizi.it/data_img/immagini/200/Lavazza_business_caspule_.jpg' },
      { code: 'LVF-012', name: 'Lavazza Firma Espresso Crema e Gusto Forte - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Espresso Crema e Gusto Forte. Robusta/arabica, tostatura scura, intensità 13. Confezione da 48 capsule.', price: '19.09', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: 'https://shop.milanooffreservizi.it/data_img/immagini/200/Crema-Gusto-Forte-capsule-Lavazza-Firma.jpg' },
      { code: 'LVF-013', name: 'Lavazza Firma Espresso Aromatico BioOrganic Compostabile - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule compostabili Lavazza Firma Aromatico BioOrganic. Robusta/arabica, tostatura scura, intensità 8. Confezione da 48 capsule.', price: '21.36', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: 'https://shop.milanooffreservizi.it/data_img/immagini/200/LVZ_Tierra_Firma_48_Aroma.jpg' },
      { code: 'LVF-014', name: 'Lavazza Firma Espresso Intenso BioOrganic Compostabile - 48 Capsule', brand: 'LAVAZZA', desc: 'Capsule compostabili Lavazza Firma Intenso BioOrganic. Robusta/arabica, tostatura scura, intensità 10. Confezione da 48 capsule.', price: '21.36', vat: '10', sub: 'SUB-LVF-CAFFE', stock: 100, img: 'https://shop.milanooffreservizi.it/data_img/immagini/200/LVZ_Tierra_Firma_48_Intenso_370.jpg' },

      // BEVANDE CALDE (24 capsule)
      { code: 'LVF-015', name: 'Lavazza Firma Bevanda Bianca - 24 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Bevanda Bianca. Confezione da 24 capsule.', price: '9.55', vat: '10', sub: 'SUB-LVF-BEVANDE', stock: 100, img: 'https://shop.milanooffreservizi.it/data_img/immagini/200/Bevanda-Bianca-capsule-Lavazza-Firma.jpg' },
      { code: 'LVF-016', name: 'Lavazza Firma Orzo - 24 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Orzo. Confezione da 24 capsule.', price: '9.59', vat: '10', sub: 'SUB-LVF-BEVANDE', stock: 100, img: 'https://shop.milanooffreservizi.it/data_img/immagini/200/3D-Bevanda-Orzo.jpg' },
      { code: 'LVF-017', name: 'Lavazza Firma Bevanda al Caffè con Ginseng Eraclea - 24 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma Ginseng Eraclea. Senza glutine. Confezione da 24 capsule.', price: '9.55', vat: '10', sub: 'SUB-LVF-BEVANDE', stock: 100, img: 'https://shop.milanooffreservizi.it/data_img/immagini/200/caffe-Ginseng-capsule-Lavazza-Firma.jpg' },
      { code: 'LVF-018', name: 'Lavazza Firma The al Limone Whittington - 24 Capsule', brand: 'LAVAZZA', desc: 'Capsule Lavazza Firma The al Limone Whittington. Con succo di Limoni di Sicilia. Confezione da 24 capsule.', price: '9.37', vat: '10', sub: 'SUB-LVF-BEVANDE', stock: 100, img: 'https://shop.milanooffreservizi.it/data_img/immagini/200/The-al-Limone-capsule-Lavazza-Firma.jpg' },
      { code: 'LVF-019', name: 'Preparato al Gusto di Cioccolata Ristora - 50 Bustine', brand: 'RISTORA', desc: 'Preparato solubile al gusto di cioccolata Ristora. Confezione da 50 bustine.', price: '10.91', vat: '10', sub: 'SUB-LVF-BEVANDE', stock: 100, img: '' },
      { code: 'LVF-020', name: 'Preparato al Gusto di Cappuccino Ristora - 50 Bustine', brand: 'RISTORA', desc: 'Preparato solubile al gusto di cappuccino Ristora. Confezione da 50 bustine.', price: '12.27', vat: '10', sub: 'SUB-LVF-BEVANDE', stock: 100, img: '' },
      { code: 'LVF-021', name: 'Panna UHT Bayerland Monodose da Caffè - 10pz x 10g', brand: 'BAYERLAND', desc: 'Panna UHT a lunga conservazione Bayerland da caffè. Monodose 10 pezzi x 10g.', price: '2.00', vat: '10', sub: 'SUB-LVF-BEVANDE', stock: 100, img: '' },

      // ACCESSORI ECO-FRIENDLY
      { code: 'LVF-022', name: 'Bicchieri ECO di Carta per Caffè 80cc - 50pz', brand: 'MOS', desc: 'Bicchieri ECO di carta per caffè e bevande 80cc. Confezione da 50 pezzi.', price: '2.30', vat: '22', sub: 'SUB-LVF-ACC-ECO', stock: 100, img: '' },
      { code: 'LVF-023', name: 'Bicchieri ECO di Carta per The 150cc - 80pz', brand: 'MOS', desc: 'Bicchieri ECO di carta per the e bevande calde 150cc. Confezione da 80 pezzi.', price: '5.61', vat: '22', sub: 'SUB-LVF-ACC-ECO', stock: 100, img: '' },
      { code: 'LVF-024', name: 'Bicchieri ECO di Carta per Acqua 180cc - 50pz', brand: 'MOS', desc: 'Bicchieri ECO di carta per acqua e bevande fredde 180cc. Confezione da 50 pezzi.', price: '3.20', vat: '22', sub: 'SUB-LVF-ACC-ECO', stock: 100, img: '' },
      { code: 'LVF-025', name: 'Palette ECO Incartate in Bambù - 50pz', brand: 'MOS', desc: 'Palette ECO incartate in bambù. Confezione da 50 pezzi.', price: '0.70', vat: '22', sub: 'SUB-LVF-ACC-ECO', stock: 100, img: '' },
      { code: 'LVF-026', name: 'Bustine di Zucchero - 50pz', brand: 'MOS', desc: 'Bustine di zucchero. Confezione da 50 pezzi.', price: '0.86', vat: '10', sub: 'SUB-LVF-ACC-ECO', stock: 100, img: '' },
      { code: 'LVF-027', name: 'Bustine di Zucchero di Canna - 50pz', brand: 'MOS', desc: 'Bustine di zucchero di canna. Confezione da 50 pezzi.', price: '1.32', vat: '10', sub: 'SUB-LVF-ACC-ECO', stock: 100, img: '' },

      // ACCESSORI DI PLASTICA
      { code: 'LVF-028', name: 'Bicchieri di Plastica per Caffè 80cc - 50pz', brand: 'MOS', desc: 'Bicchieri di plastica per caffè e bevande 80cc. Confezione da 50 pezzi.', price: '1.76', vat: '22', sub: 'SUB-LVF-ACC-PLAST', stock: 100, img: '' },
      { code: 'LVF-029', name: 'Bicchieri di Plastica per The 150cc - 100pz', brand: 'MOS', desc: 'Bicchieri di plastica per the e bevande calde 150cc. Confezione da 100 pezzi.', price: '4.43', vat: '22', sub: 'SUB-LVF-ACC-PLAST', stock: 100, img: '' },
      { code: 'LVF-030', name: 'Bicchieri di Plastica per Acqua 200cc - 50pz', brand: 'MOS', desc: 'Bicchieri di plastica per acqua e bevande fredde 200cc. Confezione da 50 pezzi.', price: '2.30', vat: '22', sub: 'SUB-LVF-ACC-PLAST', stock: 100, img: '' },
      { code: 'LVF-031', name: 'Palette Incartate - 50pz', brand: 'MOS', desc: 'Palette incartate. Confezione da 50 pezzi.', price: '0.66', vat: '22', sub: 'SUB-LVF-ACC-PLAST', stock: 100, img: '' },
    ];

    let inserted = 0;
    for (const p of productList) {
      const [ins] = await db
        .insert(products)
        .values({
          code: p.code,
          name: p.name,
          brand: p.brand,
          description: p.desc,
          priceNet: p.price,
          pricePublic: p.price, // same for now
          vatCode: p.vat,
          stockAvailable: p.stock,
          isActive: true,
          isManual: true,
          imageUrl: p.img || null,
          groupId,
          categoryId: catId!,
          subcategoryId: subcatIds[p.sub],
          unit: 'CF',
        })
        .onConflictDoNothing()
        .returning();

      if (ins) inserted++;
    }

    return NextResponse.json({
      success: true,
      groupId,
      categoryId: catId,
      subcategories: subcatIds,
      productsInserted: inserted,
      totalProducts: productList.length,
    });
  } catch (err) {
    console.error('Seed coffee error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH - update image URLs to local paths
export async function PATCH() {
  try {
    const imageMap: Record<string, string> = {
      'LVF-001': '/products/lavazza-firma/LVF-001.jpg',
      'LVF-007': '/products/lavazza-firma/LVF-007.jpg',
      'LVF-008': '/products/lavazza-firma/LVF-008.jpg',
      'LVF-011': '/products/lavazza-firma/LVF-011.jpg',
      'LVF-012': '/products/lavazza-firma/LVF-012.jpg',
      'LVF-013': '/products/lavazza-firma/LVF-013.jpg',
      'LVF-014': '/products/lavazza-firma/LVF-014.jpg',
      'LVF-015': '/products/lavazza-firma/LVF-015.jpg',
      'LVF-016': '/products/lavazza-firma/LVF-016.jpg',
      'LVF-017': '/products/lavazza-firma/LVF-017.jpg',
      'LVF-018': '/products/lavazza-firma/LVF-018.jpg',
    };

    let updated = 0;
    for (const [code, url] of Object.entries(imageMap)) {
      const result = await db
        .update(products)
        .set({ imageUrl: url })
        .where(eq(products.code, code));
      updated++;
    }

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error('Update images error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
