import type { APIRoute } from 'astro';
export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL;
  return new Response(`# SŠPU Opava\n\nVeřejný informační web Střední školy průmyslové a umělecké v Opavě.\n\n- [Obory a studium](${base}obory/)\n- [Aktuality](${base}aktuality/)\n- [Projekty](${base}cs/projekty/)\n- [Dokumenty](${base}dokumenty/)\n- [Kalendář akcí](${base}udalosti/)\n- [Kontakty](${base}kontakt/)\n- [Strojově čitelný index](${base}obsah.json)\n- [RSS aktualit](${base}rss.xml)\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
