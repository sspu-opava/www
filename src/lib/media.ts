import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
export type Media = { width: number; height: number; variants: { src: string; width: number }[] };
let mediaManifest: Record<string, Media> = {};
try { mediaManifest = JSON.parse(readFileSync(resolve('src/data/generated-media.json'), 'utf8')); } catch { /* Astro check before the first media build. */ }
export { mediaManifest };
