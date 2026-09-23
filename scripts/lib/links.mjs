import { resolve, relative, sep } from 'node:path';
import { normalizeBase, withoutBase } from '../../src/lib/urls.mjs';
export function resolveInternalLink(value, fromPath, { base = '/', site = 'https://www.sspu-opava.cz', dist }) {
  if (!value || /^(mailto:|tel:|data:|blob:)/i.test(value)) return { skip: true };
  if (/^(javascript:|vbscript:)/i.test(value)) return { error: 'Nepovolený protokol odkazu.' };
  let url;
  try { url = new URL(value, new URL(fromPath, site)); } catch { return { error: 'Neplatná URL.' }; }
  if (!['http:', 'https:'].includes(url.protocol)) return { skip: true };
  if (url.origin !== new URL(site).origin) return { skip: true };
  const prefix = normalizeBase(base);
  if (prefix !== '/' && !url.pathname.startsWith(prefix) && url.pathname !== prefix.slice(0, -1)) return { error: 'Chybí base path ' + prefix };
  let path, hash;
  try { path = decodeURIComponent(withoutBase(url.pathname, prefix)); hash = decodeURIComponent(url.hash.slice(1)); } catch { return { error: 'Neplatné kódování URL.' }; }
  const file = resolve(dist, '.' + path);
  const local = relative(resolve(dist), file);
  if (local === '..' || local.startsWith('..' + sep) || /^[A-Za-z]:/.test(local)) return { error: 'Odkaz vede mimo výstupní složku.' };
  return { file, hash: hash.split(':~:text=')[0], pathname: path };
}
