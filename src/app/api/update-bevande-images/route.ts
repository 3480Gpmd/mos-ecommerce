import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

const imageMap: Record<string, string> = {
  'SP21': '/images/products/bevande/SP21-levissima-nat.jpg',
  'SP22': '/images/products/bevande/SP22-levissima-gas.jpg',
  'ZA17': '/images/products/bevande/ZA17-sb-frizz.jpg',
  'ZA15': '/images/products/bevande/ZA15-sb-legg-frizz.png',
  'ZA101': '/images/products/bevande/ZA101-acquamia-nat.png',
  'ZA102': '/images/products/bevande/ZA102-acquamia-frizz.jpg',
  'ZA65': '/images/products/bevande/ZA65-santanna-nat.jpg',
  'ZA66': '/images/products/bevande/ZA66-santanna-frizz.jpg',
  'BIO-VF-MIRTILLO-24': '/images/products/bevande/BIO-VF-MIRTILLO-valfrutta-mirtillo.png',
  'BIO-VF-PERA-24': '/images/products/bevande/BIO-VF-PERA-valfrutta-pera.png',
  'BIO-VF-PESCA-24': '/images/products/bevande/BIO-VF-PESCA-valfrutta-pesca.png',
  'BIO-YG-PERA-12': '/images/products/bevande/BIO-YG-PERA-yoga-pera.jpg',
  'BIO-YG-PESCA-12': '/images/products/bevande/BIO-YG-PESCA-yoga-pesca.jpg',
  'BIO-YG-ALBICOCCA-12': '/images/products/bevande/BIO-YG-ALBICOCCA-yoga-albicocca.jpg',
  'BIO-YG-ACE-12': '/images/products/bevande/BIO-YG-ACE-yoga-ace.jpg',
  'BIO-YG-MIRTILLO-12': '/images/products/bevande/BIO-YG-MIRTILLO-yoga-mirtillo.jpg',
};

export async function POST() {
  try {
    let updated = 0;
    for (const [code, imageUrl] of Object.entries(imageMap)) {
      await db
        .update(products)
        .set({ imageUrl })
        .where(eq(products.code, code));
      updated++;
    }

    return NextResponse.json({
      success: true,
      message: `Aggiornate ${updated} immagini su ${Object.keys(imageMap).length} prodotti`,
      updated,
    });
  } catch (error) {
    console.error('Errore update immagini bevande:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
