import { NextResponse } from 'next/server';
import { db } from '@/db';
import { productGroups, productCategories, productSubcategories, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

/* ═══════════════════════════════════════════════════════════════
   CAFFÈ BORBONE — CATALOGO COMPLETO A MODO MIO + DOLCE GUSTO
   Prezzi REALI dal sito caffeborbone.com (aprile 2026) + 5%
   Prezzo netto = pricePublic / 1.22 (IVA 22%)
   ═══════════════════════════════════════════════════════════════ */

const AMM_PRODUCTS = [
  // ─── A MODO MIO — Don Carlo 100 capsule ─────────────────
  {
    code: 'BORB-AMM-BLU-100',
    name: 'Caffè Borbone Don Carlo Miscela Blu - 100 Capsule A Modo Mio',
    description: 'La Miscela Blu è il blend più amato di Caffè Borbone: un caffè dal gusto equilibrato, intenso e cremoso, con note persistenti di cioccolato fondente e retrogusto dolce. Miscela di Arabica e Robusta accuratamente selezionate. Intensità: 8/10. Tostatura: media. Capsule autoprotette compatibili con tutte le macchine Lavazza® A Modo Mio®. Peso netto: 7,2g per capsula.',
    priceNet: '21.39',
    pricePublic: '26.09',
    packSize: 100,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
  {
    code: 'BORB-AMM-ROSSA-100',
    name: 'Caffè Borbone Don Carlo Miscela Rossa - 100 Capsule A Modo Mio',
    description: 'La Miscela Rossa è un caffè dal carattere deciso e pieno di energia. Gusto forte e corposo con crema persistente e retrogusto intenso. Ideale per chi ama un espresso vigoroso e strutturato. Prevalenza Robusta. Intensità: 9/10. Tostatura: scura. Capsule autoprotette compatibili con tutte le macchine Lavazza® A Modo Mio®. Peso netto: 7,2g per capsula.',
    priceNet: '20.27',
    pricePublic: '24.73',
    packSize: 100,
    imageUrl: '/products/borbone/respresso-rossa.jpg',
  },
  {
    code: 'BORB-AMM-NERA-100',
    name: 'Caffè Borbone Don Carlo Miscela Nera - 100 Capsule A Modo Mio',
    description: 'La Miscela Nera è dedicata agli intenditori del caffè forte e deciso. Gusto pieno e corposo con note tostate marcate, crema densa e persistente. 100% Robusta per un espresso di grande personalità. Intensità: 10/10. Tostatura: molto scura. Capsule autoprotette compatibili con tutte le macchine Lavazza® A Modo Mio®. Peso netto: 7,2g per capsula.',
    priceNet: '19.45',
    pricePublic: '23.73',
    packSize: 100,
    imageUrl: '/products/borbone/respresso-nera.jpg',
  },
  {
    code: 'BORB-AMM-DEK-100',
    name: 'Caffè Borbone Don Carlo Miscela Dek - 100 Capsule A Modo Mio',
    description: 'La Miscela Dek offre tutto il piacere del caffè napoletano senza caffeina. Decaffeinato naturalmente, mantiene un gusto ricco e pieno con crema vellutata. Processo di decaffeinizzazione naturale. Intensità: 6/10. Tostatura: media. Capsule autoprotette compatibili con tutte le macchine Lavazza® A Modo Mio®. Peso netto: 7,2g per capsula.',
    priceNet: '22.47',
    pricePublic: '27.41',
    packSize: 100,
    imageUrl: '/products/borbone/respresso-dek.jpg',
  },

  // ─── A MODO MIO — Compostabili 100 capsule ──────────────
  {
    code: 'BORB-AMM-COMP-ORO-100',
    name: 'Caffè Borbone Compostabili Miscela Oro - 100 Capsule A Modo Mio',
    description: 'Le capsule Compostabili Miscela Oro rappresentano l\'eccellenza di Caffè Borbone in chiave sostenibile. Capsule 100% compostabili compatibili Lavazza® A Modo Mio® con un gusto equilibrato, armonioso e avvolgente. Note dolci e delicate sfumature di frutta secca. Prevalenza Arabica. Intensità: 7/10. Tostatura: media-chiara. Capsule certificate compostabili secondo la norma EN 13432.',
    priceNet: '23.54',
    pricePublic: '28.72',
    packSize: 100,
    imageUrl: '/products/borbone/respresso-oro.jpg',
  },
  {
    code: 'BORB-AMM-COMP-ROSSA-100',
    name: 'Caffè Borbone Compostabili Miscela Rossa - 100 Capsule A Modo Mio',
    description: 'Le capsule Compostabili Miscela Rossa uniscono il gusto forte e deciso della tradizionale Miscela Rossa alla sostenibilità ambientale. Capsule 100% compostabili compatibili Lavazza® A Modo Mio®. Gusto corposo, crema persistente, retrogusto intenso. Prevalenza Robusta. Intensità: 9/10. Tostatura: scura. Certificate compostabili EN 13432.',
    priceNet: '22.25',
    pricePublic: '27.14',
    packSize: 100,
    imageUrl: '/products/borbone/respresso-rossa.jpg',
  },

  // ─── A MODO MIO — Light 100 capsule ─────────────────────
  {
    code: 'BORB-AMM-LIGHT-100',
    name: 'Caffè Borbone Light Miscela - 100 Capsule A Modo Mio',
    description: 'La miscela Light è pensata per chi desidera un caffè più leggero ma senza rinunciare al gusto. Contenuto ridotto di caffeina per un espresso dolce, delicato e facilmente digeribile. Ideale per i momenti di relax. Capsule compatibili Lavazza® A Modo Mio®. Peso netto: 7,2g per capsula.',
    priceNet: '21.73',
    pricePublic: '26.51',
    packSize: 100,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },

  // ─── A MODO MIO — Confezione da 50 ─────────────────────
  {
    code: 'BORB-AMM-COMP-ARABICA-50',
    name: 'Caffè Borbone Compostabili 100% Arabica - 50 Capsule A Modo Mio',
    description: 'Capsule 100% compostabili con miscela pregiata 100% Arabica. Gusto dolce ed elegante con note floreali e di frutta, acidità delicata e corpo medio. Compatibili Lavazza® A Modo Mio®. Confezione da 50 capsule. Certificate compostabili EN 13432.',
    priceNet: '12.04',
    pricePublic: '14.69',
    packSize: 50,
    imageUrl: '/products/borbone/respresso-oro.jpg',
  },

  // ─── A MODO MIO — Solubili 16 capsule ──────────────────
  {
    code: 'BORB-AMM-ORZO-16',
    name: 'Caffè Borbone Orzo - 16 Capsule A Modo Mio',
    description: 'Bevanda solubile all\'orzo in capsule compatibili Lavazza® A Modo Mio®. Gusto naturale e delicato dell\'orzo tostato, senza caffeina. Ideale a qualsiasi ora del giorno. Confezione da 16 capsule.',
    priceNet: '4.12',
    pricePublic: '5.03',
    packSize: 16,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
  {
    code: 'BORB-AMM-TE-LIMONE-16',
    name: 'Caffè Borbone Tè al Limone - 16 Capsule A Modo Mio',
    description: 'Bevanda solubile al tè e limone in capsule compatibili Lavazza® A Modo Mio®. Gusto fresco e dissetante del tè con una delicata nota di limone. Confezione da 16 capsule.',
    priceNet: '4.12',
    pricePublic: '5.03',
    packSize: 16,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
  {
    code: 'BORB-AMM-GINSENG-16',
    name: 'Caffè Borbone Ginseng - 16 Capsule A Modo Mio',
    description: 'Bevanda solubile al ginseng in capsule compatibili Lavazza® A Modo Mio®. Gusto dolce e avvolgente con le proprietà energizzanti del ginseng. Ideale come alternativa al caffè. Confezione da 16 capsule.',
    priceNet: '4.12',
    pricePublic: '5.03',
    packSize: 16,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
  {
    code: 'BORB-AMM-GINSENG-ZERO-16',
    name: 'Caffè Borbone Ginseng Zero - 16 Capsule A Modo Mio',
    description: 'Bevanda solubile al ginseng senza zucchero in capsule compatibili Lavazza® A Modo Mio®. Tutto il gusto del ginseng classico ma senza zuccheri aggiunti. Confezione da 16 capsule.',
    priceNet: '4.12',
    pricePublic: '5.03',
    packSize: 16,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
];

const DG_PRODUCTS = [
  // ─── DOLCE GUSTO — Confezione da 90 capsule ────────────
  {
    code: 'BORB-DG-BLU-90',
    name: 'Caffè Borbone Dolce Re Miscela Blu - 90 Capsule Dolce Gusto',
    description: 'La Miscela Blu di Borbone in capsule compatibili Nescafé® Dolce Gusto®. Gusto equilibrato, intenso e cremoso con note di cioccolato fondente e retrogusto dolce. Miscela Arabica/Robusta bilanciata. Intensità: 8/10. Tostatura: media. Capsule sigillate senza linguetta. Peso netto: 7g per capsula. Compatibili con tutte le macchine Dolce Gusto® Krups e DeLonghi.',
    priceNet: '18.93',
    pricePublic: '23.09',
    packSize: 90,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
  {
    code: 'BORB-DG-ROSSA-90',
    name: 'Caffè Borbone Dolce Re Miscela Rossa - 90 Capsule Dolce Gusto',
    description: 'La Miscela Rossa: caffè dal carattere forte e pieno di energia. Crema densa e persistente, retrogusto intenso e strutturato. Prevalenza Robusta. Intensità: 9/10. Tostatura: scura. Capsule compatibili Nescafé® Dolce Gusto®. Peso netto: 7g per capsula.',
    priceNet: '18.93',
    pricePublic: '23.09',
    packSize: 90,
    imageUrl: '/products/borbone/respresso-rossa.jpg',
  },
  {
    code: 'BORB-DG-ORO-90',
    name: 'Caffè Borbone Dolce Re Miscela Oro - 90 Capsule Dolce Gusto',
    description: 'La Miscela Oro: massima espressione della tradizione napoletana. Gusto equilibrato e armonioso con note dolci di frutta secca. Prevalenza Arabica. Intensità: 7/10. Tostatura: media-chiara. Capsule compatibili Nescafé® Dolce Gusto®. Peso netto: 7g per capsula.',
    priceNet: '18.93',
    pricePublic: '23.09',
    packSize: 90,
    imageUrl: '/products/borbone/respresso-oro.jpg',
  },
  {
    code: 'BORB-DG-NERA-90',
    name: 'Caffè Borbone Dolce Re Miscela Nera - 90 Capsule Dolce Gusto',
    description: 'La Miscela Nera: per gli amanti del caffè forte e deciso. Gusto pieno e corposo con note tostate marcate. 100% Robusta. Intensità: 10/10. Tostatura: molto scura. Capsule compatibili Nescafé® Dolce Gusto®. Peso netto: 7g per capsula.',
    priceNet: '18.93',
    pricePublic: '23.09',
    packSize: 90,
    imageUrl: '/products/borbone/respresso-nera.jpg',
  },
  {
    code: 'BORB-DG-DEK-90',
    name: 'Caffè Borbone Dolce Re Miscela Dek - 90 Capsule Dolce Gusto',
    description: 'La Miscela Dek: tutto il gusto del caffè napoletano senza caffeina. Decaffeinato naturalmente, gusto ricco e pieno. Intensità: 6/10. Tostatura: media. Capsule compatibili Nescafé® Dolce Gusto®. Peso netto: 7g per capsula.',
    priceNet: '18.93',
    pricePublic: '23.09',
    packSize: 90,
    imageUrl: '/products/borbone/respresso-dek.jpg',
  },

  // ─── DOLCE GUSTO — Confezione piccola ──────────────────
  {
    code: 'BORB-DG-BLU-48',
    name: 'Caffè Borbone Dolce Re Miscela Blu - 48 Capsule Dolce Gusto',
    description: 'Miscela Blu: gusto equilibrato, intenso e cremoso. Capsule compatibili Nescafé® Dolce Gusto®. Confezione da 48 capsule (3x16).',
    priceNet: '10.32',
    pricePublic: '12.59',
    packSize: 48,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
  {
    code: 'BORB-DG-ROSSA-48',
    name: 'Caffè Borbone Dolce Re Miscela Rossa - 48 Capsule Dolce Gusto',
    description: 'Miscela Rossa: carattere deciso e forte. Capsule compatibili Nescafé® Dolce Gusto®. Confezione da 48 capsule (3x16).',
    priceNet: '10.32',
    pricePublic: '12.59',
    packSize: 48,
    imageUrl: '/products/borbone/respresso-rossa.jpg',
  },
  {
    code: 'BORB-DG-ORO-48',
    name: 'Caffè Borbone Dolce Re Miscela Oro - 48 Capsule Dolce Gusto',
    description: 'Miscela Oro: equilibrata e dolce. Capsule compatibili Nescafé® Dolce Gusto®. Confezione da 48 capsule (3x16).',
    priceNet: '10.32',
    pricePublic: '12.59',
    packSize: 48,
    imageUrl: '/products/borbone/respresso-oro.jpg',
  },
  {
    code: 'BORB-DG-NERA-48',
    name: 'Caffè Borbone Dolce Re Miscela Nera - 48 Capsule Dolce Gusto',
    description: 'Miscela Nera: gusto pieno e corposo. Capsule compatibili Nescafé® Dolce Gusto®. Confezione da 48 capsule (3x16).',
    priceNet: '10.32',
    pricePublic: '12.59',
    packSize: 48,
    imageUrl: '/products/borbone/respresso-nera.jpg',
  },
  {
    code: 'BORB-DG-DEK-48',
    name: 'Caffè Borbone Dolce Re Miscela Dek - 48 Capsule Dolce Gusto',
    description: 'Miscela Dek: decaffeinato dal gusto pieno. Capsule compatibili Nescafé® Dolce Gusto®. Confezione da 48 capsule (3x16).',
    priceNet: '10.32',
    pricePublic: '12.59',
    packSize: 48,
    imageUrl: '/products/borbone/respresso-dek.jpg',
  },

  // ─── DOLCE GUSTO — Solubili 64 capsule ─────────────────
  {
    code: 'BORB-DG-CAFE-CON-LECHE-64',
    name: 'Caffè Borbone Café con Leche - 64 Capsule Dolce Gusto',
    description: 'Bevanda solubile al caffè e latte in capsule compatibili Nescafé® Dolce Gusto®. Un classico spagnolo: il piacere del caffè mescolato al latte per una bevanda cremosa e avvolgente. Confezione da 64 capsule (4x16).',
    priceNet: '18.90',
    pricePublic: '23.06',
    packSize: 64,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
  {
    code: 'BORB-DG-GINSENG-64',
    name: 'Caffè Borbone Ginseng - 64 Capsule Dolce Gusto',
    description: 'Bevanda solubile al ginseng in capsule compatibili Nescafé® Dolce Gusto®. Gusto dolce e avvolgente con le proprietà energizzanti del ginseng. Confezione da 64 capsule (4x16).',
    priceNet: '18.90',
    pricePublic: '23.06',
    packSize: 64,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
  {
    code: 'BORB-DG-CORTADO-64',
    name: 'Caffè Borbone Cortado - 64 Capsule Dolce Gusto',
    description: 'Bevanda solubile cortado (caffè macchiato) in capsule compatibili Nescafé® Dolce Gusto®. Il caffè espresso si incontra con una piccola quantità di latte caldo per un gusto deciso ma morbido. Confezione da 64 capsule (4x16).',
    priceNet: '18.90',
    pricePublic: '23.06',
    packSize: 64,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
  {
    code: 'BORB-DG-NOCCIOLONE-64',
    name: 'Caffè Borbone Nocciolone - 64 Capsule Dolce Gusto',
    description: 'Bevanda solubile alla nocciola in capsule compatibili Nescafé® Dolce Gusto®. Il gusto irresistibile della nocciola in una bevanda calda e cremosa. Confezione da 64 capsule (4x16).',
    priceNet: '18.90',
    pricePublic: '23.06',
    packSize: 64,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
  {
    code: 'BORB-DG-SUPERCIOK-64',
    name: 'Caffè Borbone Superciok - 64 Capsule Dolce Gusto',
    description: 'Cioccolata calda in capsule compatibili Nescafé® Dolce Gusto®. Bevanda densa e cremosa al cioccolato, perfetta per i momenti di dolcezza. Confezione da 64 capsule (4x16).',
    priceNet: '18.90',
    pricePublic: '23.06',
    packSize: 64,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
  {
    code: 'BORB-DG-SUPERGINSENG-64',
    name: 'Caffè Borbone Superginseng - 64 Capsule Dolce Gusto',
    description: 'Bevanda solubile al ginseng extra forte in capsule compatibili Nescafé® Dolce Gusto®. Doppia dose di ginseng per un effetto energizzante ancora più intenso. Confezione da 64 capsule (4x16).',
    priceNet: '18.90',
    pricePublic: '23.06',
    packSize: 64,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
  {
    code: 'BORB-DG-ORZO-64',
    name: 'Caffè Borbone Orzo - 64 Capsule Dolce Gusto',
    description: 'Bevanda solubile all\'orzo in capsule compatibili Nescafé® Dolce Gusto®. Gusto naturale e delicato dell\'orzo tostato, senza caffeina. Ideale a qualsiasi ora. Confezione da 64 capsule (4x16).',
    priceNet: '18.90',
    pricePublic: '23.06',
    packSize: 64,
    imageUrl: '/products/borbone/respresso-blu.jpg',
  },
];

export async function POST() {
  try {
    const results: string[] = [];

    // 1. Trova il gruppo CAFFÈ
    const [group] = await db
      .select()
      .from(productGroups)
      .where(eq(productGroups.code, 'GRP-CAFFE'))
      .limit(1);

    if (!group) {
      return NextResponse.json({ error: 'Gruppo GRP-CAFFE non trovato. Esegui prima seed-borbone.' }, { status: 400 });
    }

    // 2. Trova la categoria BORBONE
    const [catBorbone] = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.code, 'CAT-BORBONE'))
      .limit(1);

    if (!catBorbone) {
      return NextResponse.json({ error: 'Categoria CAT-BORBONE non trovata. Esegui prima seed-borbone.' }, { status: 400 });
    }

    // 3. Trova le sottocategorie
    const [subcatAMM] = await db
      .select()
      .from(productSubcategories)
      .where(eq(productSubcategories.code, 'SUB-BORBONE-AMM'))
      .limit(1);

    const [subcatDG] = await db
      .select()
      .from(productSubcategories)
      .where(eq(productSubcategories.code, 'SUB-BORBONE-DG'))
      .limit(1);

    if (!subcatAMM || !subcatDG) {
      return NextResponse.json({ error: 'Sottocategorie AMM/DG non trovate. Esegui prima seed-borbone.' }, { status: 400 });
    }

    // 4. Aggiorna/inserisci prodotti A MODO MIO
    let ammCreated = 0;
    let ammUpdated = 0;

    for (const p of AMM_PRODUCTS) {
      const [existing] = await db
        .select()
        .from(products)
        .where(eq(products.code, p.code))
        .limit(1);

      if (existing) {
        await db.update(products)
          .set({
            name: p.name,
            description: p.description,
            priceNet: p.priceNet,
            pricePublic: p.pricePublic,
            packSize: p.packSize,
            imageUrl: p.imageUrl,
            isActive: true,
            isManual: true,
            stockAvailable: 100,
          })
          .where(eq(products.code, p.code));
        ammUpdated++;
      } else {
        await db.insert(products).values({
          code: p.code,
          name: p.name,
          description: p.description,
          brand: 'CAFFÈ BORBONE',
          priceNet: p.priceNet,
          pricePublic: p.pricePublic,
          vatCode: '22',
          unit: 'CF',
          packSize: p.packSize,
          stockAvailable: 100,
          isActive: true,
          isManual: true,
          imageUrl: p.imageUrl,
          groupId: group.id,
          categoryId: catBorbone.id,
          subcategoryId: subcatAMM.id,
          minOrderQty: 1,
          orderMultiple: 1,
        });
        ammCreated++;
      }
    }
    results.push(`A Modo Mio — Creati: ${ammCreated}, Aggiornati: ${ammUpdated}`);

    // 5. Disattiva vecchi codici AMM (seed originale senza suffisso pack)
    const oldAMMCodes = ['BORB-AMM-BLU', 'BORB-AMM-ROSSA', 'BORB-AMM-ORO', 'BORB-AMM-NERA', 'BORB-AMM-DEK',
      'BORB-AMM-ORO-100', 'BORB-AMM-GRANRIS-100', 'BORB-AMM-BLU-50', 'BORB-AMM-ROSSA-50', 'BORB-AMM-ORO-50', 'BORB-AMM-NERA-50', 'BORB-AMM-DEK-50'];
    let oldDeactivated = 0;
    for (const code of oldAMMCodes) {
      const [existing] = await db.select().from(products).where(eq(products.code, code)).limit(1);
      if (existing) {
        await db.update(products).set({ isActive: false }).where(eq(products.code, code));
        oldDeactivated++;
      }
    }
    if (oldDeactivated > 0) results.push(`Vecchi codici AMM disattivati: ${oldDeactivated}`);

    // 6. Aggiorna/inserisci prodotti DOLCE GUSTO
    let dgCreated = 0;
    let dgUpdated = 0;

    for (const p of DG_PRODUCTS) {
      const [existing] = await db
        .select()
        .from(products)
        .where(eq(products.code, p.code))
        .limit(1);

      if (existing) {
        await db.update(products)
          .set({
            name: p.name,
            description: p.description,
            priceNet: p.priceNet,
            pricePublic: p.pricePublic,
            packSize: p.packSize,
            imageUrl: p.imageUrl,
            isActive: true,
            isManual: true,
            stockAvailable: 100,
          })
          .where(eq(products.code, p.code));
        dgUpdated++;
      } else {
        await db.insert(products).values({
          code: p.code,
          name: p.name,
          description: p.description,
          brand: 'CAFFÈ BORBONE',
          priceNet: p.priceNet,
          pricePublic: p.pricePublic,
          vatCode: '22',
          unit: 'CF',
          packSize: p.packSize,
          stockAvailable: 100,
          isActive: true,
          isManual: true,
          imageUrl: p.imageUrl,
          groupId: group.id,
          categoryId: catBorbone.id,
          subcategoryId: subcatDG.id,
          minOrderQty: 1,
          orderMultiple: 1,
        });
        dgCreated++;
      }
    }
    results.push(`Dolce Gusto — Creati: ${dgCreated}, Aggiornati: ${dgUpdated}`);

    // 7. Disattiva vecchi codici DG
    const oldDGCodes = ['BORB-DG-BLU', 'BORB-DG-ROSSA', 'BORB-DG-ORO', 'BORB-DG-NERA', 'BORB-DG-DEK'];
    let oldDGDeactivated = 0;
    for (const code of oldDGCodes) {
      const [existing] = await db.select().from(products).where(eq(products.code, code)).limit(1);
      if (existing) {
        await db.update(products).set({ isActive: false }).where(eq(products.code, code));
        oldDGDeactivated++;
      }
    }
    if (oldDGDeactivated > 0) results.push(`Vecchi codici DG disattivati: ${oldDGDeactivated}`);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        aModMio: { created: ammCreated, updated: ammUpdated, total: AMM_PRODUCTS.length },
        dolceGusto: { created: dgCreated, updated: dgUpdated, total: DG_PRODUCTS.length },
        prezzi: 'Listino Borbone reale (aprile 2026) + 5%',
      },
    });
  } catch (error) {
    console.error('Update Borbone error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
