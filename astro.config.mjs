import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// `actions/configure-pages` returns a base path without a trailing slash
// (for example `/web1`). Astro exposes that value to templates through
// `import.meta.env.BASE_URL`, where the slash is required when composing URLs.
const configuredBase = process.env.ASTRO_BASE;
const base = configuredBase && configuredBase !== '/'
  ? `/${configuredBase.replace(/^\/+|\/+$/g, '')}/`
  : undefined;
const site = process.env.ASTRO_SITE || 'https://www.sspu-opava.cz';

function withConfiguredBase(value) {
  if (!base || base === '/' || !value.startsWith('/') || value.startsWith('//')) return value;
  if (value === base.slice(0, -1) || value.startsWith(base)) return value;
  return `${base.slice(0, -1)}${value}`;
}

/**
 * Legacy Markdown articles can contain raw HTML links and images. Astro
 * components use `withBase()`, but raw Markdown is rendered by the content
 * pipeline before it reaches those components. Prefix the configured project
 * path here so CMS-authored `/uploads/...` URLs also work on GitHub Pages.
 */
function prefixMarkdownUrls() {
  return function transformer(tree) {
    const visit = (node) => {
      if (['link', 'image', 'definition'].includes(node.type) && typeof node.url === 'string') {
        node.url = withConfiguredBase(node.url);
      }
      if (node.type === 'html' && typeof node.value === 'string') {
        node.value = node.value.replace(
          /(\b(?:href|src|poster|action|cite)\s*=\s*["'])(\/[^"'#?]*)([^"']*)/gi,
          (_match, attribute, path, suffix) => `${attribute}${withConfiguredBase(path)}${suffix}`
        );
      }
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };
    visit(tree);
  };
}

export default defineConfig({
  site,
  base,
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
    remarkPlugins: [prefixMarkdownUrls]
  }
});
