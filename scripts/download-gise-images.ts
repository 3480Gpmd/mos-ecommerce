/**
 * Download all GISE product images locally and update DB
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// All images to download: [filename, url]
const images: [string, string][] = [
  // === CAPSULE (existing) ===
  ['levante.jpg', 'https://shop.gisecaffe.com/84-home_default/levante.jpg'],
  ['libeccio.jpg', 'https://shop.gisecaffe.com/86-home_default/libeccio.jpg'],
  ['maestrale.jpg', 'https://shop.gisecaffe.com/87-home_default/maestrale.jpg'],
  ['scirocco.jpg', 'https://shop.gisecaffe.com/88-home_default/scirocco.jpg'],
  ['zefiro.jpg', 'https://shop.gisecaffe.com/89-home_default/zefiro.jpg'],
  ['grecale.jpg', 'https://shop.gisecaffe.com/90-home_default/grecale.jpg'],
  ['ostro.jpg', 'https://shop.gisecaffe.com/92-home_default/ostro.jpg'],
  ['marino.jpg', 'https://shop.gisecaffe.com/97-home_default/marino.jpg'],
  ['caffe-verde-ganoderma.jpg', 'https://shop.gisecaffe.com/105-home_default/caffe-verde-e-ganoderma.jpg'],
  ['viento-de-la-sierra.jpg', 'https://shop.gisecaffe.com/299-home_default/viento-de-la-sierra.jpg'],
  ['ghibli.jpg', 'https://shop.gisecaffe.com/330-home_default/ghibli.jpg'],
  ['maestrale-bauletto-48.jpg', 'https://shop.gisecaffe.com/282-home_default/maestrale-bauletto-48-capsule.jpg'],
  ['ostro-bauletto-48.jpg', 'https://shop.gisecaffe.com/285-home_default/ostro-bauletto-48-capsule.jpg'],
  ['scirocco-bauletto-48.jpg', 'https://shop.gisecaffe.com/317-home_default/maestrale-bauletto-48-capsule.jpg'],
  ['marino-bauletto-48.jpg', 'https://shop.gisecaffe.com/337-home_default/ostro-bauletto-48-capsule.jpg'],
  // === BEVANDE CALDE (existing) ===
  ['cioccolato.jpg', 'https://shop.gisecaffe.com/101-home_default/cioccolato.jpg'],
  ['ginseng-amaro.jpg', 'https://shop.gisecaffe.com/109-home_default/ginseng-amaro.jpg'],
  ['ginseng.jpg', 'https://shop.gisecaffe.com/113-home_default/ginseng.jpg'],
  ['mocaccino.jpg', 'https://shop.gisecaffe.com/117-home_default/mocaccino.jpg'],
  ['cappuccino.jpg', 'https://shop.gisecaffe.com/121-home_default/cappuccino.jpg'],
  ['orzo.jpg', 'https://shop.gisecaffe.com/125-home_default/orzo.jpg'],
  ['te-al-limone.jpg', 'https://shop.gisecaffe.com/129-home_default/te-al-limone.jpg'],
  ['mirtillo-melograno.jpg', 'https://shop.gisecaffe.com/133-home_default/mirtillo-e-melograno.jpg'],
  ['zenzero-limone.jpg', 'https://shop.gisecaffe.com/137-home_default/zenzero-e-limone.jpg'],
  ['nocciolino.jpg', 'https://shop.gisecaffe.com/302-home_default/nocciolino.jpg'],
  // === TISANE (existing) ===
  ['tisana-te-energy.jpg', 'https://shop.gisecaffe.com/192-home_default/tisana-te-energy.jpg'],
  ['tisana-ventre-piatto.jpg', 'https://shop.gisecaffe.com/196-home_default/tisana-ventre-piatto.jpg'],
  ['tisana-della-sera.jpg', 'https://shop.gisecaffe.com/200-home_default/tisana-della-sera-rilassante.jpg'],
  ['tisana-mora-curcuma.jpg', 'https://shop.gisecaffe.com/208-home_default/tisana-mora-curcuma-e-cannella.jpg'],
  ['tisana-cocco-lampone.jpg', 'https://shop.gisecaffe.com/204-home_default/tisana-cocco-e-lampone.jpg'],
  ['tisana-drenante.jpg', 'https://shop.gisecaffe.com/356-home_default/tisana-drenante-anticell.jpg'],
  // === CIALDE ESE (new) ===
  ['libeccio-cialda-ese.jpg', 'https://shop.gisecaffe.com/215-home_default/libeccio-in-cialda.jpg'],
  ['maestrale-cialda-ese.jpg', 'https://shop.gisecaffe.com/217-home_default/maestrale-cialda-ese.jpg'],
  ['marino-cialda-ese.jpg', 'https://shop.gisecaffe.com/225-home_default/marino-cialda-ese.jpg'],
  ['ostro-cialda-ese.jpg', 'https://shop.gisecaffe.com/221-home_default/ostro-cialda-ese.jpg'],
  ['ginseng-cialda-ese.jpg', 'https://shop.gisecaffe.com/310-home_default/caffe-al-ginseng.jpg'],
  ['melagrana-cialda-ese.jpg', 'https://shop.gisecaffe.com/311-home_default/infuso-alla-melagrana-cialda-ese.jpg'],
  ['sogno-inverno-cialda-ese.jpg', 'https://shop.gisecaffe.com/312-home_default/sogno-d-inverno-cialda-ese.jpg'],
  ['te-verde-cialda-ese.jpg', 'https://shop.gisecaffe.com/313-home_default/te-verde-cialda-ese.jpg'],
  ['ghibli-cialda-ese.jpg', 'https://shop.gisecaffe.com/348-home_default/ostro-cialda-ese.jpg'],
  // === CAFFÈ IN GRANI (new) ===
  ['libeccio-grani-250g.jpg', 'https://shop.gisecaffe.com/280-home_default/libeccio-sacchetto-caffe-in-grani-250g.jpg'],
  ['maestrale-grani-250g.jpg', 'https://shop.gisecaffe.com/278-home_default/maestrale-sacchetto-di-caffe-in-grani-250g.jpg'],
  ['ostro-grani-250g.jpg', 'https://shop.gisecaffe.com/276-home_default/ostro-sacchetto-di-caffe-in-grani-250g.jpg'],
  ['marino-grani-250g.jpg', 'https://shop.gisecaffe.com/275-home_default/marino-sacchetto-di-caffe-decaffeinato-in-grani-250g.jpg'],
  // === NESPRESSO (new) ===
  ['ghibli-nespresso.jpg', 'https://shop.gisecaffe.com/353-home_default/ghibli-capsule-compatibili-nespresso.jpg'],
  ['maestrale-nespresso.jpg', 'https://shop.gisecaffe.com/352-home_default/maestrale-capsula-compatibile-nespresso.jpg'],
];

const outDir = resolve(process.cwd(), 'public/products/gise');

async function main() {
  await mkdir(outDir, { recursive: true });
  let ok = 0, fail = 0;
  
  for (const [filename, url] of images) {
    const dest = resolve(outDir, filename);
    if (existsSync(dest)) {
      console.log(`⏭️  Già scaricata: ${filename}`);
      ok++;
      continue;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buf);
      console.log(`✅ ${filename} (${(buf.length / 1024).toFixed(0)} KB)`);
      ok++;
    } catch (err: any) {
      console.error(`❌ ${filename}: ${err.message}`);
      fail++;
    }
  }
  console.log(`\n📦 Scaricate: ${ok} | Errori: ${fail}`);
}

main();
