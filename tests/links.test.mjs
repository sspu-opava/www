import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { inspectHtml } from '../scripts/lib/html.mjs';
import { resolveInternalLink } from '../scripts/lib/links.mjs';
const config = { base: '/web1/', site: 'https://example.github.io', dist: resolve('.audit-tmp/site') };
test('link resolution covers relative files, anchors, base errors and unsafe protocols', () => {
  const file = resolveInternalLink('../../uploads/rad.pdf#page=2', '/web1/skola/test/', config);
  assert.equal(file.file, resolve('.audit-tmp/site/uploads/rad.pdf'));
  assert.equal(file.hash, 'page=2');
  assert.match(resolveInternalLink('/uploads/a.pdf', '/web1/', config).error, /base path/);
  assert.equal(resolveInternalLink('https://external.example/a', '/web1/', config).skip, true);
  assert.ok(resolveInternalLink('javascript:alert(1)', '/web1/', config).error);
  assert.ok(resolveInternalLink('/web1/%ZZ', '/web1/', config).error);
});
test('HTML parser sees single-quoted assets, srcset, missing ALT and duplicate ids', () => {
  const page = inspectHtml("<html lang='cs'><head><title>Test</title></head><body><main><h1>Titulek</h1><h2 id='x'>A</h2><p id='x'>B</p><img src='foto.webp' srcset='small.webp 480w, large.webp 960w'><a href='#x'>Odkaz</a></main></body></html>");
  assert.equal(page.h1, 1);
  assert.deepEqual(page.duplicates, ['x']);
  assert.ok(page.links.some(link => link.value === 'large.webp'));
  assert.ok(page.issues.some(issue => issue.includes('ALT')));
});
