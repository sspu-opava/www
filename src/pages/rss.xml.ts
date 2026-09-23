import rss from '@astrojs/rss';
import { entries } from '../lib/content';
import type { APIRoute } from 'astro';
export const GET: APIRoute = async (context) => rss({ title: 'SŠPU Opava – aktuality', description: 'Školní zpravodaj SŠPU Opava.', site: new URL(import.meta.env.BASE_URL, context.site ?? 'https://www.sspu-opava.cz').href, items: (await entries('articles')).map((article) => ({ title: article.data.title, description: article.data.description, pubDate: article.data.publishedAt, link: `aktuality/${article.id}/` })) });
