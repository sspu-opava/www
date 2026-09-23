import { createGallery } from './lib/gallery.mjs';
const [source, slug, ...titleParts] = process.argv.slice(2);
try {
  const gallery = await createGallery({ source, slug, title: titleParts.join(' ') });
  console.log('Připraven koncept: ' + gallery.metadata + ' (' + gallery.photos + ' fotografií). Doplňte popis a ALT texty v Pages CMS.');
} catch (error) {
  console.error(error.message + '\nPoužití: npm run gallery:create -- <složka-fotek> <slug> "Název galerie"\nPokud selhalo zpracování některé fotografie, zkontrolujte rozpracovanou cílovou složku. Zdrojové fotografie zůstaly zachovány.');
  process.exitCode = 1;
}
