import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const sourceDir = join(root, 'public/images/banners/sady');
const outputDir = join(sourceDir, 'individual');
const sources = ['sada1.png', 'sada2.png', 'sada3.png'];
const tileSize = 418;
const transparentBelow = 78;
const opaqueAbove = 116;

function alphaFor(pixel) {
  const brightness = Math.max(pixel[0], pixel[1], pixel[2]);
  if (brightness <= transparentBelow) return 0;
  if (brightness >= opaqueAbove) return 255;
  return Math.round(((brightness - transparentBelow) / (opaqueAbove - transparentBelow)) * 255);
}

await mkdir(outputDir, { recursive: true });

for (const source of sources) {
  const sourceName = source.replace(/\.png$/i, '');

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const { data, info } = await sharp(join(sourceDir, source))
        .extract({ left: column * tileSize, top: row * tileSize, width: tileSize, height: tileSize })
        .raw()
        .toBuffer({ resolveWithObject: true });
      const rgba = Buffer.alloc(info.width * info.height * 4);

      for (let index = 0; index < data.length; index += 3) {
        const outputIndex = Math.floor(index / 3) * 4;
        rgba[outputIndex] = data[index];
        rgba[outputIndex + 1] = data[index + 1];
        rgba[outputIndex + 2] = data[index + 2];
        rgba[outputIndex + 3] = alphaFor(data.subarray(index, index + 3));
      }

      const output = join(outputDir, `${sourceName}-r${row + 1}-c${column + 1}.png`);
      await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
        .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 })
        .png()
        .toFile(output);
      console.log(output.replace(`${root}\\`, ''));
    }
  }
}
