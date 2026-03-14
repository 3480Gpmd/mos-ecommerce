import { NextResponse } from 'next/server';
import { db } from '@/db';
import { productCategories, productSubcategories, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getOrCreateCategory(code: string, name: string, slug: string, groupId: number, sortOrder: number) {
  let [cat] = await db.select().from(productCategories).where(eq(productCategories.code, code)).limit(1);
  if (!cat) {
    [cat] = await db.insert(productCategories).values({ code, name, slug, groupId, sortOrder }).returning();
  }
  return cat;
}

async function getOrCreateSubcategory(code: string, name: string, slug: string, categoryId: number, sortOrder: number) {
  let [sub] = await db.select().from(productSubcategories).where(eq(productSubcategories.code, code)).limit(1);
  if (!sub) {
    [sub] = await db.insert(productSubcategories).values({ code, name, slug, categoryId, sortOrder }).returning();
  }
  return sub;
}

async function upsertProduct(p: {
  code: string; name: string; description: string; brand: string;
  netPrice: string; vatCode: string; unit: string;
  categoryId: number; subcategoryId: number; groupId: number;
  minQty: number; stock: number;
}) {
  const [existing] = await db.select().from(products).where(eq(products.code, p.code)).limit(1);
  if (existing) return { action: 'skip', code: p.code };
  await db.insert(products).values({
    code: p.code,
    name: p.name,
    description: p.description,
    brand: p.brand,
    priceNet: p.netPrice,
    vatCode: p.vatCode,
    unit: p.unit,
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId,
    groupId: p.groupId,
    minOrderQty: p.minQty,
    stockAvailable: p.stock,
    isActive: true,
  });
  return { action: 'created', code: p.code };
}

export async function POST() {
  try {
    const results: string[] = [];
    const caffeGroupId = 29; // CAFFÈ E BEVANDE CALDE

    // ═══════════════════════════════════════════════════════════════
    // 1. GISE — sotto Caffè e Bevande Calde
    // ═══════════════════════════════════════════════════════════════
    const catGise = await getOrCreateCategory('CAT-GISE', 'GISE', 'gise', caffeGroupId, 40);
    results.push(`Categoria GISE: id ${catGise.id}`);

    const subGiseCapsule = await getOrCreateSubcategory('SUB-GISE-CAPSULE', 'Capsule GISE', 'capsule-gise', catGise.id, 1);
    const subGiseCialde = await getOrCreateSubcategory('SUB-GISE-CIALDE', 'Cialde GISE', 'cialde-gise', catGise.id, 2);
    const subGiseGrani = await getOrCreateSubcategory('SUB-GISE-GRANI', 'Grani GISE', 'grani-gise', catGise.id, 3);
    const subGiseSolubili = await getOrCreateSubcategory('SUB-GISE-SOLUBILI', 'Solubili e Infusi GISE', 'solubili-infusi-gise', catGise.id, 4);

    // Capsule GISE (box 10)
    const giseCapsule = [
      { code: 'GISE-CPS-SCIROCCO', name: 'Capsule GISE Scirocco - Box 10', desc: 'Capsule compatibili sistema GISE, miscela Scirocco. Box da 10 capsule.', price: '3.70' },
      { code: 'GISE-CPS-OSTRO', name: 'Capsule GISE Ostro - Box 10', desc: 'Capsule compatibili sistema GISE, miscela Ostro. Box da 10 capsule.', price: '3.90' },
      { code: 'GISE-CPS-MARINO', name: 'Capsule GISE Marino - Box 10', desc: 'Capsule compatibili sistema GISE, miscela Marino. Box da 10 capsule.', price: '4.20' },
      { code: 'GISE-CPS-ZEFIRO', name: 'Capsule GISE Zefiro - Box 10', desc: 'Capsule compatibili sistema GISE, miscela Zefiro. Box da 10 capsule.', price: '4.80' },
      { code: 'GISE-CPS-MAESTRALE', name: 'Capsule GISE Maestrale - Box 10', desc: 'Capsule compatibili sistema GISE, miscela Maestrale. Box da 10 capsule.', price: '4.00' },
      { code: 'GISE-CPS-LIBECCIO', name: 'Capsule GISE Libeccio - Box 10', desc: 'Capsule compatibili sistema GISE, miscela Libeccio. Box da 10 capsule.', price: '4.00' },
      { code: 'GISE-CPS-LEVANTE', name: 'Capsule GISE Levante - Box 10', desc: 'Capsule compatibili sistema GISE, miscela Levante. Box da 10 capsule.', price: '4.00' },
      { code: 'GISE-CPS-GRECALE', name: 'Capsule GISE Grecale - Box 10', desc: 'Capsule compatibili sistema GISE, miscela Grecale. Box da 10 capsule.', price: '4.80' },
      { code: 'GISE-CPS-VIENTO', name: 'Capsule GISE Viento de la Sierra - Box 10', desc: 'Capsule compatibili sistema GISE, miscela Viento de la Sierra. Box da 10 capsule.', price: '4.90' },
      { code: 'GISE-CPS-MAESTRALE-48', name: 'Capsule GISE Maestrale - Box 48', desc: 'Capsule compatibili sistema GISE, miscela Maestrale. Box da 48 capsule. Formato risparmio.', price: '19.20' },
      { code: 'GISE-CPS-OSTRO-48', name: 'Capsule GISE Ostro - Box 48', desc: 'Capsule compatibili sistema GISE, miscela Ostro. Box da 48 capsule. Formato risparmio.', price: '18.70' },
    ];

    for (const p of giseCapsule) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: 'GISE',
        netPrice: p.price, vatCode: '22', unit: 'PZ',
        categoryId: catGise.id, subcategoryId: subGiseCapsule.id, groupId: caffeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    // Solubili/Infusi GISE
    const giseSolubili = [
      { code: 'GISE-CPS-GINSENG-AMARO', name: 'Capsule GISE Ginseng Amaro - Box 10', desc: 'Capsule GISE preparato per ginseng amaro. Box da 10.', price: '4.20' },
      { code: 'GISE-CPS-GINSENG-CLASSIC', name: 'Capsule GISE Ginseng Classic - Box 10', desc: 'Capsule GISE preparato per ginseng classico. Box da 10.', price: '4.20' },
      { code: 'GISE-CPS-GANODERMA', name: 'Capsule GISE Ganoderma - Box 10', desc: 'Capsule GISE preparato per ganoderma. Box da 10.', price: '4.90' },
      { code: 'GISE-CPS-CIOCCOLATO', name: 'Capsule GISE Cioccolato - Box 10', desc: 'Capsule GISE preparato per cioccolata calda. Box da 10.', price: '4.30' },
      { code: 'GISE-CPS-CAPPUCCINO', name: 'Capsule GISE Cappuccino - Box 10', desc: 'Capsule GISE preparato per cappuccino. Box da 10.', price: '4.20' },
      { code: 'GISE-CPS-MOCACCINO', name: 'Capsule GISE Mocaccino - Box 10', desc: 'Capsule GISE preparato per mocaccino. Box da 10.', price: '4.80' },
      { code: 'GISE-CPS-ORZO', name: 'Capsule GISE Orzo - Box 10', desc: 'Capsule GISE preparato per orzo. Box da 10.', price: '4.00' },
      { code: 'GISE-CPS-TE-LIMONE', name: 'Capsule GISE Tè al Limone - Box 10', desc: 'Capsule GISE infuso tè al limone. Box da 10.', price: '3.90' },
      { code: 'GISE-CPS-MIRTILLO-MELOGRANO', name: 'Capsule GISE Mirtillo e Melograno - Box 10', desc: 'Capsule GISE infuso mirtillo e melograno. Box da 10.', price: '4.65' },
      { code: 'GISE-CPS-ZENZERO-LIMONE', name: 'Capsule GISE Zenzero e Limone - Box 10', desc: 'Capsule GISE infuso zenzero e limone. Box da 10.', price: '4.65' },
      { code: 'GISE-CPS-NOCCIOLINO', name: 'Capsule GISE Nocciolino - Box 10', desc: 'Capsule GISE preparato al nocciolino. Box da 10.', price: '4.50' },
    ];

    for (const p of giseSolubili) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: 'GISE',
        netPrice: p.price, vatCode: '22', unit: 'PZ',
        categoryId: catGise.id, subcategoryId: subGiseSolubili.id, groupId: caffeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    // Cialde GISE (ESE 44mm)
    const giseCialde = [
      { code: 'GISE-CIAL-MARINO', name: 'Cialde GISE Marino - Box 50', desc: 'Cialde ESE 44mm GISE, miscela Marino. Box da 50 cialde.', price: '13.95' },
      { code: 'GISE-CIAL-MAESTRALE', name: 'Cialde GISE Maestrale - Box 50', desc: 'Cialde ESE 44mm GISE, miscela Maestrale. Box da 50 cialde.', price: '12.65' },
      { code: 'GISE-CIAL-LIBECCIO', name: 'Cialde GISE Libeccio - Box 50', desc: 'Cialde ESE 44mm GISE, miscela Libeccio. Box da 50 cialde.', price: '12.95' },
      { code: 'GISE-CIAL-OSTRO', name: 'Cialde GISE Ostro - Box 50', desc: 'Cialde ESE 44mm GISE, miscela Ostro. Box da 50 cialde.', price: '11.80' },
      { code: 'GISE-CIAL-GINSENG', name: 'Cialde GISE Caffè Ginseng - Box 18', desc: 'Cialde ESE 44mm GISE, preparato caffè e ginseng. Box da 18 cialde.', price: '5.90' },
      { code: 'GISE-CIAL-MELAGRANA', name: 'Cialde GISE Infuso alla Melagrana - Box 18', desc: 'Cialde ESE 44mm GISE, infuso alla melagrana. Box da 18 cialde.', price: '4.90' },
      { code: 'GISE-CIAL-SOGNO-INVERNO', name: 'Cialde GISE Sogno d\'Inverno - Box 18', desc: 'Cialde ESE 44mm GISE, infuso Sogno d\'Inverno. Box da 18 cialde.', price: '4.90' },
      { code: 'GISE-CIAL-TE-VERDE', name: 'Cialde GISE Tè Verde - Box 18', desc: 'Cialde ESE 44mm GISE, infuso tè verde. Box da 18 cialde.', price: '4.90' },
    ];

    for (const p of giseCialde) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: 'GISE',
        netPrice: p.price, vatCode: '22', unit: 'PZ',
        categoryId: catGise.id, subcategoryId: subGiseCialde.id, groupId: caffeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    // Grani GISE (sacchetti 250gr)
    const giseGrani = [
      { code: 'GISE-GRANI-MAESTRALE', name: 'Caffè in Grani GISE Maestrale 250g', desc: 'Caffè in grani GISE, miscela Maestrale. Sacchetto da 250g.', price: '7.50' },
      { code: 'GISE-GRANI-LIBECCIO', name: 'Caffè in Grani GISE Libeccio 250g', desc: 'Caffè in grani GISE, miscela Libeccio. Sacchetto da 250g.', price: '7.90' },
      { code: 'GISE-GRANI-OSTRO', name: 'Caffè in Grani GISE Ostro 250g', desc: 'Caffè in grani GISE, miscela Ostro. Sacchetto da 250g.', price: '7.10' },
      { code: 'GISE-GRANI-MARINO', name: 'Caffè in Grani GISE Marino 250g', desc: 'Caffè in grani GISE, miscela Marino. Sacchetto da 250g.', price: '8.40' },
    ];

    for (const p of giseGrani) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: 'GISE',
        netPrice: p.price, vatCode: '22', unit: 'PZ',
        categoryId: catGise.id, subcategoryId: subGiseGrani.id, groupId: caffeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. CAFFÈ IN GRANI — sotto Caffè e Bevande Calde
    // ═══════════════════════════════════════════════════════════════
    const catGrani = await getOrCreateCategory('CAT-GRANI', 'CAFFÈ IN GRANI', 'caffe-in-grani', caffeGroupId, 50);
    results.push(`Categoria CAFFÈ IN GRANI: id ${catGrani.id}`);

    const subGraniLavazza = await getOrCreateSubcategory('SUB-GRANI-LAVAZZA', 'Lavazza', 'grani-lavazza', catGrani.id, 1);
    const subGraniVergnano = await getOrCreateSubcategory('SUB-GRANI-VERGNANO', 'Vergnano', 'grani-vergnano', catGrani.id, 2);
    const subGraniCovim = await getOrCreateSubcategory('SUB-GRANI-COVIM', 'Covim', 'grani-covim', catGrani.id, 3);
    const subGraniPellini = await getOrCreateSubcategory('SUB-GRANI-PELLINI', 'Pellini', 'grani-pellini', catGrani.id, 4);
    const subGraniAltri = await getOrCreateSubcategory('SUB-GRANI-ALTRI', 'Altre Marche', 'grani-altre-marche', catGrani.id, 5);

    // Lavazza grani
    const graniLavazza = [
      { code: 'GR-2645', name: 'Lavazza Tierra Bio Intenso - 1 kg', desc: 'Caffè in grani Lavazza Tierra Bio Intenso, biologico e certificato. Confezione da 1 kg.', price: '21.00' },
      { code: 'GR-3062', name: 'Lavazza Gusto Pieno - 1 kg', desc: 'Caffè in grani Lavazza Gusto Pieno, miscela corposa e intensa. Confezione da 1 kg.', price: '19.50' },
      { code: 'GR-3154', name: 'Lavazza Gusto Forte - 1 kg', desc: 'Caffè in grani Lavazza Gusto Forte, miscela dal gusto deciso. Confezione da 1 kg.', price: '18.60' },
      { code: 'GR-2964', name: 'Lavazza Crema e Aroma - 1 kg', desc: 'Caffè in grani Lavazza Crema e Aroma, miscela equilibrata e cremosa. Confezione da 1 kg.', price: '21.70' },
      { code: 'GR-3003L', name: 'Lavazza Crema Ricca - 1 kg', desc: 'Caffè in grani Lavazza Crema Ricca, miscela vellutata e ricca. Confezione da 1 kg.', price: '23.70' },
      { code: 'GR-2962', name: 'Lavazza Aroma Top - 1 kg', desc: 'Caffè in grani Lavazza Aroma Top, miscela premium dal gusto intenso. Confezione da 1 kg.', price: '26.00' },
    ];

    for (const p of graniLavazza) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: 'LAVAZZA',
        netPrice: p.price, vatCode: '22', unit: 'KG',
        categoryId: catGrani.id, subcategoryId: subGraniLavazza.id, groupId: caffeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    // Vergnano grani
    const graniVergnano = [
      { code: 'GR-3201V', name: 'Vergnano Gran Aroma - 1 kg', desc: 'Caffè in grani Caffè Vergnano Gran Aroma, miscela morbida e aromatica. Confezione da 1 kg.', price: '20.00' },
      { code: 'GR-32012E', name: 'Vergnano Espresso - 1 kg', desc: 'Caffè in grani Caffè Vergnano Espresso, miscela classica per espresso. Confezione da 1 kg.', price: '24.00' },
      { code: 'GR-32012A', name: 'Vergnano Antica Bottega - 1 kg', desc: 'Caffè in grani Caffè Vergnano Antica Bottega, miscela pregiata tradizionale. Confezione da 1 kg.', price: '29.00' },
    ];

    for (const p of graniVergnano) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: 'CAFFÈ VERGNANO',
        netPrice: p.price, vatCode: '22', unit: 'KG',
        categoryId: catGrani.id, subcategoryId: subGraniVergnano.id, groupId: caffeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    // Covim grani
    const graniCovim = [
      { code: 'GR-3034', name: 'Covim Orocrema - 1 kg', desc: 'Caffè in grani Covim Orocrema, miscela cremosa e dolce. Confezione da 1 kg.', price: '13.50' },
      { code: 'GR-3035', name: 'Covim Gran Bar - 1 kg', desc: 'Caffè in grani Covim Gran Bar, miscela corposa per bar. Confezione da 1 kg.', price: '15.00' },
      { code: 'GR-3200', name: 'Covim Decaffeinato Soave - 500 g', desc: 'Caffè in grani Covim Decaffeinato Soave, decaffeinato naturale. Confezione da 500g.', price: '19.20' },
    ];

    for (const p of graniCovim) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: 'COVIM',
        netPrice: p.price, vatCode: '22', unit: 'KG',
        categoryId: catGrani.id, subcategoryId: subGraniCovim.id, groupId: caffeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    // Pellini grani
    const graniPellini = [
      { code: 'GR-3188', name: 'Pellini Miscela Break Rosso - 1 kg', desc: 'Caffè in grani Pellini Miscela Break Rosso, gusto intenso e corposo. Confezione da 1 kg.', price: '16.80' },
      { code: 'GR-3187', name: 'Pellini Miscela Break Verde - 1 kg', desc: 'Caffè in grani Pellini Miscela Break Verde, gusto delicato e bilanciato. Confezione da 1 kg.', price: '17.80' },
    ];

    for (const p of graniPellini) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: 'PELLINI',
        netPrice: p.price, vatCode: '22', unit: 'KG',
        categoryId: catGrani.id, subcategoryId: subGraniPellini.id, groupId: caffeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    // Altre marche grani
    const graniAltri = [
      { code: 'GR-3059', name: 'Portioli Premium - 1 kg', desc: 'Caffè in grani Portioli Premium, miscela selezionata. Confezione da 1 kg.', price: '11.95', brand: 'PORTIOLI' },
      { code: 'GR-3060', name: 'Portioli Elite - 1 kg', desc: 'Caffè in grani Portioli Elite, miscela pregiata. Confezione da 1 kg.', price: '15.95', brand: 'PORTIOLI' },
      { code: 'GR-3201B', name: 'Best Espresso Intenso Robustino - 1 kg', desc: 'Caffè in grani Best Espresso Intenso Robustino. Confezione da 1 kg.', price: '9.50', brand: 'BEST ESPRESSO' },
      { code: 'GR-3022', name: 'Caffè Valente 1913 Aroma Bar - 1 kg', desc: 'Caffè in grani Caffè Valente 1913 Aroma Bar, tostatura tradizionale. Confezione da 1 kg.', price: '9.50', brand: 'CAFFÈ VALENTE' },
      { code: 'GR-3902', name: 'Bourbon Intenso - 1 kg', desc: 'Caffè in grani Bourbon Intenso, gusto deciso e pieno. Confezione da 1 kg.', price: '12.40', brand: 'BOURBON' },
    ];

    for (const p of graniAltri) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: p.brand,
        netPrice: p.price, vatCode: '22', unit: 'KG',
        categoryId: catGrani.id, subcategoryId: subGraniAltri.id, groupId: caffeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. BOCCIONI — sotto Bevande Fredde (gruppo esistente)
    // ═══════════════════════════════════════════════════════════════
    // Trova il gruppo Bevande Fredde
    const { productGroups } = await import('@/db/schema');
    const [freddeGroup] = await db.select().from(productGroups).where(eq(productGroups.slug, 'bevande-fredde')).limit(1);
    const freddeGroupId = freddeGroup?.id || 30; // fallback

    const catBoccioni = await getOrCreateCategory('CAT-BOCCIONI', 'BOCCIONI', 'boccioni', freddeGroupId, 10);
    results.push(`Categoria BOCCIONI: id ${catBoccioni.id}`);

    const subBoccioniAcqua = await getOrCreateSubcategory('SUB-BOCC-ACQUA', 'Boccioni Acqua', 'boccioni-acqua', catBoccioni.id, 1);
    const subBoccBicchCarta = await getOrCreateSubcategory('SUB-BOCC-BICC-CARTA', 'Bicchieri Carta', 'bicchieri-carta-boccioni', catBoccioni.id, 2);
    const subBoccBicchPlast = await getOrCreateSubcategory('SUB-BOCC-BICC-PLAST', 'Bicchieri Plastica', 'bicchieri-plastica-boccioni', catBoccioni.id, 3);

    // Accessori boccioni — categoria separata
    const catAccBoccioni = await getOrCreateCategory('CAT-ACC-BOCCIONI', 'ACCESSORI BOCCIONI', 'accessori-boccioni', freddeGroupId, 20);
    results.push(`Categoria ACCESSORI BOCCIONI: id ${catAccBoccioni.id}`);

    // Prepagate Boccioni Acqua Splendida 18L
    const boccioni = [
      { code: 'BOCC-12', name: 'Prepagata 12 Boccioni Acqua Splendida 18L', desc: 'Prepagata 12 boccioni da 18 litri Acqua Splendida. Prezzo unitario: 13,90.', price: '166.80' },
      { code: 'BOCC-24', name: 'Prepagata 24 Boccioni Acqua Splendida 18L', desc: 'Prepagata 24 boccioni da 18 litri Acqua Splendida. Prezzo unitario: 12,50.', price: '300.00' },
      { code: 'BOCC-36', name: 'Prepagata 36 Boccioni Acqua Splendida 18L', desc: 'Prepagata 36 boccioni da 18 litri Acqua Splendida. Prezzo unitario: 11,30.', price: '406.80' },
      { code: 'BOCC-48', name: 'Prepagata 48 Boccioni Acqua Splendida 18L', desc: 'Prepagata 48 boccioni da 18 litri Acqua Splendida. Prezzo unitario: 10,50.', price: '504.00' },
      { code: 'BOCC-60', name: 'Prepagata 60 Boccioni Acqua Splendida 18L', desc: 'Prepagata 60 boccioni da 18 litri Acqua Splendida. Prezzo unitario: 9,50.', price: '570.00' },
      { code: 'BOCC-80', name: 'Prepagata 80 Boccioni Acqua Splendida 18L', desc: 'Prepagata 80 boccioni da 18 litri Acqua Splendida. Prezzo unitario: 8,80.', price: '704.00' },
    ];

    for (const p of boccioni) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: 'ACQUA SPLENDIDA',
        netPrice: p.price, vatCode: '10', unit: 'PZ',
        categoryId: catBoccioni.id, subcategoryId: subBoccioniAcqua.id, groupId: freddeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    // Bicchieri Carta
    const bicchieriCarta = [
      { code: 'BOCC-BC-12', name: 'Prepagata 12 Bicchieri Carta 160cc (50 pz)', desc: 'Prepagata 12 confezioni da 50 bicchieri in carta 160cc. Prezzo unitario: 3,20.', price: '38.40' },
      { code: 'BOCC-BC-24', name: 'Prepagata 24 Bicchieri Carta 160cc (50 pz)', desc: 'Prepagata 24 confezioni da 50 bicchieri in carta 160cc. Prezzo unitario: 3,04.', price: '72.96' },
      { code: 'BOCC-BC-36', name: 'Prepagata 36 Bicchieri Carta 160cc (50 pz)', desc: 'Prepagata 36 confezioni da 50 bicchieri in carta 160cc. Prezzo unitario: 2,95.', price: '106.20' },
      { code: 'BOCC-BC-48', name: 'Prepagata 48 Bicchieri Carta 160cc (50 pz)', desc: 'Prepagata 48 confezioni da 50 bicchieri in carta 160cc. Prezzo unitario: 2,80.', price: '134.52' },
      { code: 'BOCC-BC-60', name: 'Prepagata 60 Bicchieri Carta 160cc (50 pz)', desc: 'Prepagata 60 confezioni da 50 bicchieri in carta 160cc. Prezzo unitario: 2,66.', price: '159.60' },
      { code: 'BOCC-BC-80', name: 'Prepagata 80 Bicchieri Carta 160cc (50 pz)', desc: 'Prepagata 80 confezioni da 50 bicchieri in carta 160cc. Prezzo unitario: 2,53.', price: '202.40' },
    ];

    for (const p of bicchieriCarta) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: 'ACQUA SPLENDIDA',
        netPrice: p.price, vatCode: '22', unit: 'PZ',
        categoryId: catBoccioni.id, subcategoryId: subBoccBicchCarta.id, groupId: freddeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    // Bicchieri Plastica
    const bicchieriPlastica = [
      { code: 'BOCC-BP-12', name: 'Prepagata 12 Bicchieri Plastica 160cc (50 pz)', desc: 'Prepagata 12 confezioni da 50 bicchieri in plastica 160cc. Prezzo unitario: 2,28.', price: '27.36' },
      { code: 'BOCC-BP-24', name: 'Prepagata 24 Bicchieri Plastica 160cc (50 pz)', desc: 'Prepagata 24 confezioni da 50 bicchieri in plastica 160cc. Prezzo unitario: 2,16.', price: '51.98' },
      { code: 'BOCC-BP-36', name: 'Prepagata 36 Bicchieri Plastica 160cc (50 pz)', desc: 'Prepagata 36 confezioni da 50 bicchieri in plastica 160cc. Prezzo unitario: 2,05.', price: '74.07' },
      { code: 'BOCC-BP-48', name: 'Prepagata 48 Bicchieri Plastica 160cc (50 pz)', desc: 'Prepagata 48 confezioni da 50 bicchieri in plastica 160cc. Prezzo unitario: 1,95.', price: '93.83' },
      { code: 'BOCC-BP-60', name: 'Prepagata 60 Bicchieri Plastica 160cc (50 pz)', desc: 'Prepagata 60 confezioni da 50 bicchieri in plastica 160cc. Prezzo unitario: 1,86.', price: '111.60' },
      { code: 'BOCC-BP-80', name: 'Prepagata 80 Bicchieri Plastica 160cc (50 pz)', desc: 'Prepagata 80 confezioni da 50 bicchieri in plastica 160cc. Prezzo unitario: 1,78.', price: '141.36' },
    ];

    for (const p of bicchieriPlastica) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: 'ACQUA SPLENDIDA',
        netPrice: p.price, vatCode: '22', unit: 'PZ',
        categoryId: catBoccioni.id, subcategoryId: subBoccBicchPlast.id, groupId: freddeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    // Accessori Boccioni (categoria separata)
    const accBoccioni = [
      { code: 'BOCC-ACC-SUPPORTO', name: 'Supporto Porta Boccioni', desc: 'Supporto porta boccioni per dispenser. Noleggio mensile per 4 boccioni.', price: '2.00' },
      { code: 'BOCC-ACC-BOTT-STYLE', name: 'Bottiglia Style Vetro Trasparente 75cl + Tappo', desc: 'Bottiglia in vetro trasparente modello Style da 75cl con tappo.', price: '7.90' },
      { code: 'BOCC-ACC-BOTT-CASSIOPEA', name: 'Bottiglia Cassiopea Vetro Trasparente 75cl + Tappo', desc: 'Bottiglia in vetro trasparente modello Cassiopea da 75cl con tappo.', price: '4.80' },
      { code: 'BOCC-ACC-BORRACCIA-ALU', name: 'Borraccia Alluminio con Tappo 600ml', desc: 'Borraccia in alluminio con tappo, capacità 600ml.', price: '8.50' },
      { code: 'BOCC-ACC-BORRACCIA-INOX', name: 'Borraccia Inox 500ml con Tappo', desc: 'Borraccia in acciaio inox con tappo, capacità 500ml.', price: '6.10' },
    ];

    for (const p of accBoccioni) {
      const r = await upsertProduct({
        code: p.code, name: p.name, description: p.desc, brand: 'ACQUA SPLENDIDA',
        netPrice: p.price, vatCode: '22', unit: 'PZ',
        categoryId: catAccBoccioni.id, subcategoryId: catAccBoccioni.id, groupId: freddeGroupId,
        minQty: 1, stock: 100,
      });
      results.push(`${r.action}: ${p.code}`);
    }

    return NextResponse.json({
      success: true,
      totals: {
        giseCapsule: giseCapsule.length,
        giseSolubili: giseSolubili.length,
        giseCialde: giseCialde.length,
        giseGrani: giseGrani.length,
        graniLavazza: graniLavazza.length,
        graniVergnano: graniVergnano.length,
        graniCovim: graniCovim.length,
        graniPellini: graniPellini.length,
        graniAltri: graniAltri.length,
        boccioni: boccioni.length,
        bicchieriCarta: bicchieriCarta.length,
        bicchieriPlastica: bicchieriPlastica.length,
        accBoccioni: accBoccioni.length,
      },
      results,
    });
  } catch (error) {
    console.error('Seed GISE/Grani/Boccioni error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
