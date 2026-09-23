import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { withBasePath } from './urls.mjs';

/** No raw HTML in new rich-text blocks; legacy article bodies remain unchanged. */
const processor = createMarkdownProcessor({ syntaxHighlight: false, remarkRehype: { allowDangerousHtml: false } });

export async function renderMarkdown(text, base = '/') {
  const { code } = await (await processor).render(text);
  return code.replace(/(\b(?:href|src)=["'])(\/[^"']*)/g, (_match, prefix, url) => `${prefix}${withBasePath(url, base)}`);
}
