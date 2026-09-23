import type { APIRoute } from 'astro';
import { searchContent } from '../lib/search-content';
export const GET: APIRoute = async () => new Response(JSON.stringify({
  name: 'SŠPU Opava', generatedAt: new Date().toISOString(), content: await searchContent()
}), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
