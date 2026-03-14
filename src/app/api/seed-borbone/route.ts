import { NextResponse } from 'next/server';
import { db } from '@/db';
import { productGroups, productCategories, productSubcategories, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

const BORBONE_PRODUCTS = [
  // ─── Compatibili Nespresso ──────────────────────────────
  {
    code: 'BORB-NESP-BLU',
    name: 'Caffè Borbone Respresso Miscela Blu - Compatibile Nespresso - 100 Capsule',
    description: 'La Miscela Blu (Nobile) è il blend più amato: un caffè dal gusto intenso e cremoso, con note di cioccolato. Capsule compatibili Nespresso.',
    priceNet: '18.50',
    pricePublic: '22.00',
    subcategoryCode: 'SUB-BORBONE-NESPRESSO',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/r/e/respresso-blu-100.jpg',
  },
  {
    code: 'BORB-NESP-ROSSA',
    name: 'Caffè Borbone Respresso Miscela Rossa - Compatibile Nespresso - 100 Capsule',
    description: 'Miscela Rossa: un caffè dal carattere deciso e forte, con retrogusto persistente. Capsule compatibili Nespresso.',
    priceNet: '17.50',
    pricePublic: '21.00',
    subcategoryCode: 'SUB-BORBONE-NESPRESSO',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/r/e/respresso-rossa-100.jpg',
  },
  {
    code: 'BORB-NESP-ORO',
    name: 'Caffè Borbone Respresso Miscela Oro - Compatibile Nespresso - 100 Capsule',
    description: 'Miscela Oro: equilibrata e armoniosa, con note dolci e delicate. Capsule compatibili Nespresso.',
    priceNet: '18.00',
    pricePublic: '21.50',
    subcategoryCode: 'SUB-BORBONE-NESPRESSO',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/r/e/respresso-oro-100.jpg',
  },
  {
    code: 'BORB-NESP-NERA',
    name: 'Caffè Borbone Respresso Miscela Nera - Compatibile Nespresso - 100 Capsule',
    description: 'Miscela Nera: gusto pieno e corposo, ideale per chi ama il caffè forte. Capsule compatibili Nespresso.',
    priceNet: '17.00',
    pricePublic: '20.50',
    subcategoryCode: 'SUB-BORBONE-NESPRESSO',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/r/e/respresso-nera-100.jpg',
  },
  {
    code: 'BORB-NESP-DEK',
    name: 'Caffè Borbone Respresso Miscela Dek - Compatibile Nespresso - 100 Capsule',
    description: 'Miscela Dek (Verde): decaffeinato dal gusto ricco, per chi vuole il piacere del caffè senza caffeina. Capsule compatibili Nespresso.',
    priceNet: '19.00',
    pricePublic: '23.00',
    subcategoryCode: 'SUB-BORBONE-NESPRESSO',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/r/e/respresso-dek-100.jpg',
  },

  // ─── Compatibili A Modo Mio ────────────────────────────
  {
    code: 'BORB-AMM-BLU',
    name: 'Caffè Borbone Don Carlo Miscela Blu - Compatibile A Modo Mio - 100 Capsule',
    description: 'Don Carlo Miscela Blu (Nobile): caffè cremoso e intenso con note di cioccolato. Capsule compatibili Lavazza A Modo Mio.',
    priceNet: '19.50',
    pricePublic: '23.50',
    subcategoryCode: 'SUB-BORBONE-AMM',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/o/don-carlo-blu-100.jpg',
  },
  {
    code: 'BORB-AMM-ROSSA',
    name: 'Caffè Borbone Don Carlo Miscela Rossa - Compatibile A Modo Mio - 100 Capsule',
    description: 'Don Carlo Miscela Rossa: carattere deciso e forte, retrogusto persistente. Capsule compatibili Lavazza A Modo Mio.',
    priceNet: '18.50',
    pricePublic: '22.50',
    subcategoryCode: 'SUB-BORBONE-AMM',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/o/don-carlo-rossa-100.jpg',
  },
  {
    code: 'BORB-AMM-ORO',
    name: 'Caffè Borbone Don Carlo Miscela Oro - Compatibile A Modo Mio - 100 Capsule',
    description: 'Don Carlo Miscela Oro: equilibrata e armoniosa. Capsule compatibili Lavazza A Modo Mio.',
    priceNet: '19.00',
    pricePublic: '23.00',
    subcategoryCode: 'SUB-BORBONE-AMM',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/o/don-carlo-oro-100.jpg',
  },
  {
    code: 'BORB-AMM-NERA',
    name: 'Caffè Borbone Don Carlo Miscela Nera - Compatibile A Modo Mio - 100 Capsule',
    description: 'Don Carlo Miscela Nera: gusto pieno e corposo. Capsule compatibili Lavazza A Modo Mio.',
    priceNet: '18.00',
    pricePublic: '22.00',
    subcategoryCode: 'SUB-BORBONE-AMM',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/o/don-carlo-nera-100.jpg',
  },
  {
    code: 'BORB-AMM-DEK',
    name: 'Caffè Borbone Don Carlo Miscela Dek - Compatibile A Modo Mio - 100 Capsule',
    description: 'Don Carlo Miscela Dek: decaffeinato dal gusto ricco. Capsule compatibili Lavazza A Modo Mio.',
    priceNet: '20.00',
    pricePublic: '24.00',
    subcategoryCode: 'SUB-BORBONE-AMM',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/o/don-carlo-dek-100.jpg',
  },

  // ─── Compatibili Dolce Gusto ───────────────────────────
  {
    code: 'BORB-DG-BLU',
    name: 'Caffè Borbone Dolce Re Miscela Blu - Compatibile Dolce Gusto - 90 Capsule',
    description: 'Dolce Re Miscela Blu (Nobile): cremoso e intenso. Capsule compatibili Nescafé Dolce Gusto.',
    priceNet: '17.00',
    pricePublic: '20.50',
    subcategoryCode: 'SUB-BORBONE-DG',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/o/dolcere-blu-90.jpg',
  },
  {
    code: 'BORB-DG-ROSSA',
    name: 'Caffè Borbone Dolce Re Miscela Rossa - Compatibile Dolce Gusto - 90 Capsule',
    description: 'Dolce Re Miscela Rossa: forte e deciso. Capsule compatibili Nescafé Dolce Gusto.',
    priceNet: '16.00',
    pricePublic: '19.50',
    subcategoryCode: 'SUB-BORBONE-DG',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/o/dolcere-rossa-90.jpg',
  },
  {
    code: 'BORB-DG-ORO',
    name: 'Caffè Borbone Dolce Re Miscela Oro - Compatibile Dolce Gusto - 90 Capsule',
    description: 'Dolce Re Miscela Oro: gusto equilibrato e dolce. Capsule compatibili Nescafé Dolce Gusto.',
    priceNet: '16.50',
    pricePublic: '20.00',
    subcategoryCode: 'SUB-BORBONE-DG',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/o/dolcere-oro-90.jpg',
  },
  {
    code: 'BORB-DG-NERA',
    name: 'Caffè Borbone Dolce Re Miscela Nera - Compatibile Dolce Gusto - 90 Capsule',
    description: 'Dolce Re Miscela Nera: gusto pieno e intenso. Capsule compatibili Nescafé Dolce Gusto.',
    priceNet: '15.50',
    pricePublic: '19.00',
    subcategoryCode: 'SUB-BORBONE-DG',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/o/dolcere-nera-90.jpg',
  },
  {
    code: 'BORB-DG-DEK',
    name: 'Caffè Borbone Dolce Re Miscela Dek - Compatibile Dolce Gusto - 90 Capsule',
    description: 'Dolce Re Miscela Dek: decaffeinato dal gusto pieno. Capsule compatibili Nescafé Dolce Gusto.',
    priceNet: '17.50',
    pricePublic: '21.00',
    subcategoryCode: 'SUB-BORBONE-DG',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/d/o/dolcere-dek-90.jpg',
  },

  // ─── Cialde ESE 44mm ───────────────────────────────────
  {
    code: 'BORB-ESE-BLU',
    name: 'Caffè Borbone Miscela Blu - Cialde ESE 44mm - 150 Cialde',
    description: 'Miscela Blu (Nobile): il classico caffè napoletano cremoso e intenso. Cialde ESE 44mm compostabili.',
    priceNet: '22.00',
    pricePublic: '26.00',
    subcategoryCode: 'SUB-BORBONE-ESE',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/c/i/cialde-blu-150.jpg',
  },
  {
    code: 'BORB-ESE-ROSSA',
    name: 'Caffè Borbone Miscela Rossa - Cialde ESE 44mm - 150 Cialde',
    description: 'Miscela Rossa: gusto forte e deciso con crema persistente. Cialde ESE 44mm compostabili.',
    priceNet: '21.00',
    pricePublic: '25.00',
    subcategoryCode: 'SUB-BORBONE-ESE',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/c/i/cialde-rossa-150.jpg',
  },
  {
    code: 'BORB-ESE-ORO',
    name: 'Caffè Borbone Miscela Oro - Cialde ESE 44mm - 150 Cialde',
    description: 'Miscela Oro: equilibrata e armoniosa con note dolci. Cialde ESE 44mm compostabili.',
    priceNet: '21.50',
    pricePublic: '25.50',
    subcategoryCode: 'SUB-BORBONE-ESE',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/c/i/cialde-oro-150.jpg',
  },
  {
    code: 'BORB-ESE-NERA',
    name: 'Caffè Borbone Miscela Nera - Cialde ESE 44mm - 150 Cialde',
    description: 'Miscela Nera: gusto pieno e corposo per i veri amanti del caffè forte. Cialde ESE 44mm compostabili.',
    priceNet: '20.50',
    pricePublic: '24.50',
    subcategoryCode: 'SUB-BORBONE-ESE',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/c/i/cialde-nera-150.jpg',
  },
  {
    code: 'BORB-ESE-DEK',
    name: 'Caffè Borbone Miscela Dek - Cialde ESE 44mm - 150 Cialde',
    description: 'Miscela Dek (Verde): decaffeinato con tutto il gusto del caffè napoletano. Cialde ESE 44mm compostabili.',
    priceNet: '23.00',
    pricePublic: '27.00',
    subcategoryCode: 'SUB-BORBONE-ESE',
    imageUrl: 'https://www.caffeborbone.it/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/c/i/cialde-dek-150.jpg',
  },
];

export async function POST() {
  try {
    const results: string[] = [];

    // 1. Trova o conferma il gruppo CAFFÈ
    const [group] = await db
      .select()
      .from(productGroups)
      .where(eq(productGroups.code, 'GRP-CAFFE'))
      .limit(1);

    if (!group) {
      return NextResponse.json({ error: 'Gruppo GRP-CAFFE non trovato. Esegui prima seed-coffee.' }, { status: 400 });
    }
    results.push(`✅ Gruppo: ${group.name} (id: ${group.id})`);

    // 2. Crea categoria CAFFÈ BORBONE
    let [catBorbone] = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.code, 'CAT-BORBONE'))
      .limit(1);

    if (!catBorbone) {
      [catBorbone] = await db.insert(productCategories).values({
        code: 'CAT-BORBONE',
        name: 'CAFFÈ BORBONE',
        slug: 'caffe-borbone',
        groupId: group.id,
        sortOrder: 20,
      }).returning();
      results.push(`✅ Categoria creata: ${catBorbone.name}`);
    } else {
      results.push(`⏭️ Categoria già esistente: ${catBorbone.name}`);
    }

    // 3. Crea sottocategorie
    const subcats = [
      { code: 'SUB-BORBONE-NESPRESSO', name: 'Compatibili Nespresso', slug: 'borbone-nespresso', sortOrder: 1 },
      { code: 'SUB-BORBONE-AMM', name: 'Compatibili A Modo Mio', slug: 'borbone-a-modo-mio', sortOrder: 2 },
      { code: 'SUB-BORBONE-DG', name: 'Compatibili Dolce Gusto', slug: 'borbone-dolce-gusto', sortOrder: 3 },
      { code: 'SUB-BORBONE-ESE', name: 'Cialde ESE 44mm', slug: 'borbone-ese-44mm', sortOrder: 4 },
    ];

    const subcatMap: Record<string, number> = {};

    for (const sc of subcats) {
      let [existing] = await db
        .select()
        .from(productSubcategories)
        .where(eq(productSubcategories.code, sc.code))
        .limit(1);

      if (!existing) {
        [existing] = await db.insert(productSubcategories).values({
          ...sc,
          categoryId: catBorbone.id,
        }).returning();
        results.push(`✅ Sottocategoria creata: ${existing.name}`);
      } else {
        results.push(`⏭️ Sottocategoria già esistente: ${existing.name}`);
      }
      subcatMap[sc.code] = existing.id;
    }

    // 4. Inserisci prodotti
    let created = 0;
    let skipped = 0;

    for (const p of BORBONE_PRODUCTS) {
      const [existing] = await db
        .select()
        .from(products)
        .where(eq(products.code, p.code))
        .limit(1);

      if (existing) {
        skipped++;
        continue;
      }

      await db.insert(products).values({
        code: p.code,
        name: p.name,
        description: p.description,
        brand: 'CAFFÈ BORBONE',
        priceNet: p.priceNet,
        pricePublic: p.pricePublic,
        vatCode: '22',
        unit: 'PZ',
        stockAvailable: 100,
        isActive: true,
        isManual: true,
        imageUrl: p.imageUrl,
        groupId: group.id,
        categoryId: catBorbone.id,
        subcategoryId: subcatMap[p.subcategoryCode],
      });
      created++;
    }

    results.push(`✅ Prodotti creati: ${created}`);
    if (skipped > 0) results.push(`⏭️ Prodotti già esistenti: ${skipped}`);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        category: 'CAFFÈ BORBONE',
        subcategories: subcats.length,
        productsCreated: created,
        productsSkipped: skipped,
        totalProducts: BORBONE_PRODUCTS.length,
      },
    });
  } catch (error) {
    console.error('Seed Borbone error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
