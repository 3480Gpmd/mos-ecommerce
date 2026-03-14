import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productGroups, productCategories } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    // Trova il gruppo "Bevande Fredde"
    const [freddeGroup] = await db
      .select()
      .from(productGroups)
      .where(eq(productGroups.slug, 'bevande-fredde'));

    if (!freddeGroup) {
      return NextResponse.json({ error: 'Gruppo "Bevande Fredde" non trovato' }, { status: 404 });
    }

    // Trova le categorie
    const categories = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.groupId, freddeGroup.id));

    const catAcqua = categories.find(c => c.slug === 'acqua');
    const catBibiteSucchi = categories.find(c => c.slug === 'bibite-e-succhi');
    const catEnergy = categories.find(c => c.slug === 'energy-drink');

    if (!catAcqua || !catBibiteSucchi) {
      return NextResponse.json({ error: 'Categorie non trovate', categories: categories.map(c => c.slug) }, { status: 404 });
    }

    const prodottiDaInserire = [
      // ==========================================
      // ACQUA - dal listino Acqua e Bevande 2024
      // ==========================================
      {
        code: 'SP21',
        name: 'ACQUA LEVISSIMA NATURALE 0,50L',
        brand: 'LEVISSIMA',
        description: 'Acqua minerale naturale Levissima in bottiglia PET da 0,50 lt. Confezione da 24 pezzi.',
        unit: 'CF',
        priceNet: '12.50',
        pricePublic: '15.25',
        vatCode: '22',
        stockAvailable: 50,
        groupId: freddeGroup.id,
        categoryId: catAcqua.id,
      },
      {
        code: 'SP22',
        name: 'ACQUA LEVISSIMA GASATA 0,50L',
        brand: 'LEVISSIMA',
        description: 'Acqua minerale gasata Levissima in bottiglia PET da 0,50 lt. Confezione da 24 pezzi.',
        unit: 'CF',
        priceNet: '12.50',
        pricePublic: '15.25',
        vatCode: '22',
        stockAvailable: 35,
        groupId: freddeGroup.id,
        categoryId: catAcqua.id,
      },
      {
        code: 'ZA17',
        name: 'ACQUA SAN BENEDETTO FRIZZANTE 0,5L',
        brand: 'SAN BENEDETTO',
        description: 'Acqua minerale frizzante San Benedetto in bottiglia PET da 0,5 lt. Confezione da 24 pezzi.',
        unit: 'CF',
        priceNet: '10.00',
        pricePublic: '12.20',
        vatCode: '22',
        stockAvailable: 40,
        groupId: freddeGroup.id,
        categoryId: catAcqua.id,
      },
      {
        code: 'ZA15',
        name: 'ACQUA SAN BENEDETTO LEGGERMENTE FRIZZANTE 0,5L',
        brand: 'SAN BENEDETTO',
        description: 'Acqua minerale leggermente frizzante San Benedetto in bottiglia PET da 0,5 lt. Confezione da 24 pezzi.',
        unit: 'CF',
        priceNet: '10.00',
        pricePublic: '12.20',
        vatCode: '22',
        stockAvailable: 30,
        groupId: freddeGroup.id,
        categoryId: catAcqua.id,
      },
      {
        code: 'ZA101',
        name: 'ACQUA MIA NATURALE 0,5L',
        brand: 'FONTI DI VINADIO',
        description: 'Acqua minerale naturale Acqua Mia (Fonti di Vinadio) in bottiglia PET da 0,5 lt. Confezione da 24 pezzi.',
        unit: 'CF',
        priceNet: '8.20',
        pricePublic: '10.00',
        vatCode: '22',
        stockAvailable: 60,
        groupId: freddeGroup.id,
        categoryId: catAcqua.id,
      },
      {
        code: 'ZA102',
        name: 'ACQUA MIA FRIZZANTE 0,5L',
        brand: 'FONTI DI VINADIO',
        description: 'Acqua minerale frizzante Acqua Mia (Fonti di Vinadio) in bottiglia PET da 0,5 lt. Confezione da 24 pezzi.',
        unit: 'CF',
        priceNet: '8.20',
        pricePublic: '10.00',
        vatCode: '22',
        stockAvailable: 45,
        groupId: freddeGroup.id,
        categoryId: catAcqua.id,
      },
      {
        code: 'ZA65',
        name: "ACQUA SANT'ANNA NATURALE 0,5L",
        brand: "SANT'ANNA",
        description: "Acqua minerale naturale Sant'Anna in bottiglia PET da 0,5 lt. Confezione da 24 pezzi.",
        unit: 'CF',
        priceNet: '10.00',
        pricePublic: '12.20',
        vatCode: '22',
        stockAvailable: 55,
        groupId: freddeGroup.id,
        categoryId: catAcqua.id,
      },
      {
        code: 'ZA66',
        name: "ACQUA SANT'ANNA FRIZZANTE 0,5L",
        brand: "SANT'ANNA",
        description: "Acqua minerale frizzante Sant'Anna in bottiglia PET da 0,5 lt. Confezione da 24 pezzi.",
        unit: 'CF',
        priceNet: '10.00',
        pricePublic: '12.20',
        vatCode: '22',
        stockAvailable: 40,
        groupId: freddeGroup.id,
        categoryId: catAcqua.id,
      },

      // ==========================================
      // SUCCHI BIO - dal listino Succhio Bio 2025
      // ==========================================
      {
        code: 'BIO-VF-MIRTILLO-24',
        name: 'VALFRUTTA MIRTILLO BIO 200ML (24 BOTT.)',
        brand: 'VALFRUTTA',
        description: 'Succo di mirtillo biologico Valfrutta in bottiglia di vetro da 200 ml. Confezione da 24 bottiglie.',
        unit: 'CF',
        priceNet: '60.84',
        pricePublic: '74.22',
        vatCode: '22',
        stockAvailable: 15,
        groupId: freddeGroup.id,
        categoryId: catBibiteSucchi.id,
      },
      {
        code: 'BIO-VF-PERA-24',
        name: 'VALFRUTTA PERA BIO 200ML (24 BOTT.)',
        brand: 'VALFRUTTA',
        description: 'Succo di pera biologico Valfrutta in bottiglia di vetro da 200 ml. Confezione da 24 bottiglie.',
        unit: 'CF',
        priceNet: '48.00',
        pricePublic: '58.56',
        vatCode: '22',
        stockAvailable: 20,
        groupId: freddeGroup.id,
        categoryId: catBibiteSucchi.id,
      },
      {
        code: 'BIO-VF-PESCA-24',
        name: 'VALFRUTTA PESCA BIO 200ML (24 BOTT.)',
        brand: 'VALFRUTTA',
        description: 'Succo di pesca biologico Valfrutta in bottiglia di vetro da 200 ml. Confezione da 24 bottiglie.',
        unit: 'CF',
        priceNet: '48.00',
        pricePublic: '58.56',
        vatCode: '22',
        stockAvailable: 20,
        groupId: freddeGroup.id,
        categoryId: catBibiteSucchi.id,
      },
      {
        code: 'BIO-YG-PERA-12',
        name: 'YOGA 100% FRUTTA PERA 200ML (12 BOTT.)',
        brand: 'YOGA',
        description: 'Succo 100% frutta gusto pera Yoga in bottiglia di vetro da 200 ml. Confezione da 12 bottiglie.',
        unit: 'CF',
        priceNet: '19.50',
        pricePublic: '23.79',
        vatCode: '22',
        stockAvailable: 25,
        groupId: freddeGroup.id,
        categoryId: catBibiteSucchi.id,
      },
      {
        code: 'BIO-YG-PESCA-12',
        name: 'YOGA 100% FRUTTA PESCA 200ML (12 BOTT.)',
        brand: 'YOGA',
        description: 'Succo 100% frutta gusto pesca Yoga in bottiglia di vetro da 200 ml. Confezione da 12 bottiglie.',
        unit: 'CF',
        priceNet: '19.50',
        pricePublic: '23.79',
        vatCode: '22',
        stockAvailable: 5,
        groupId: freddeGroup.id,
        categoryId: catBibiteSucchi.id,
      },
      {
        code: 'BIO-YG-ALBICOCCA-12',
        name: 'YOGA 100% FRUTTA ALBICOCCA MIX 200ML (12 BOTT.)',
        brand: 'YOGA',
        description: 'Succo 100% frutta gusto albicocca mix Yoga in bottiglia di vetro da 200 ml. Confezione da 12 bottiglie.',
        unit: 'CF',
        priceNet: '19.50',
        pricePublic: '23.79',
        vatCode: '22',
        stockAvailable: 18,
        groupId: freddeGroup.id,
        categoryId: catBibiteSucchi.id,
      },
      {
        code: 'BIO-YG-ACE-12',
        name: 'YOGA 100% FRUTTA ACE 200ML (12 BOTT.)',
        brand: 'YOGA',
        description: 'Succo 100% frutta gusto ACE Yoga in bottiglia di vetro da 200 ml. Confezione da 12 bottiglie.',
        unit: 'CF',
        priceNet: '19.50',
        pricePublic: '23.79',
        vatCode: '22',
        stockAvailable: 22,
        groupId: freddeGroup.id,
        categoryId: catBibiteSucchi.id,
      },
      {
        code: 'BIO-YG-MIRTILLO-12',
        name: 'YOGA 100% FRUTTA MIRTILLO 200ML (12 BOTT.)',
        brand: 'YOGA',
        description: 'Succo 100% frutta gusto mirtillo Yoga in bottiglia di vetro da 200 ml. Confezione da 12 bottiglie.',
        unit: 'CF',
        priceNet: '36.50',
        pricePublic: '44.53',
        vatCode: '22',
        stockAvailable: 12,
        groupId: freddeGroup.id,
        categoryId: catBibiteSucchi.id,
      },
    ];

    // Inserisci i prodotti (ignora duplicati)
    let inserted = 0;
    let skipped = 0;

    for (const prod of prodottiDaInserire) {
      try {
        await db.insert(products).values({
          code: prod.code,
          name: prod.name,
          brand: prod.brand,
          description: prod.description,
          unit: prod.unit,
          priceNet: prod.priceNet,
          pricePublic: prod.pricePublic,
          vatCode: prod.vatCode,
          stockAvailable: prod.stockAvailable,
          isActive: true,
          isManual: true,
          groupId: prod.groupId,
          categoryId: prod.categoryId,
        });
        inserted++;
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        if (errMsg.includes('duplicate') || errMsg.includes('unique')) {
          skipped++;
        } else {
          throw e;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bevande fredde inserite: ${inserted} nuovi, ${skipped} già presenti`,
      totale: prodottiDaInserire.length,
      inserted,
      skipped,
      categorie: {
        acqua: prodottiDaInserire.filter(p => p.categoryId === catAcqua.id).length,
        bibiteSucchi: prodottiDaInserire.filter(p => p.categoryId === catBibiteSucchi.id).length,
      }
    });

  } catch (error) {
    console.error('Errore seed bevande:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
