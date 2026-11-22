import type { APIRoute } from 'astro';
import { nyttConfig } from '../../nytt.config';
import { getAllBriefings } from '../lib/briefings';
import { withBase } from '../lib/data';

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const GET: APIRoute = () => {
  const basePath = nyttConfig.basePath;
  const site = nyttConfig.siteUrl;
  const briefings = [...getAllBriefings()].reverse();
  const feedUrl = `${site}${basePath}/feed.xml`;
  const home = `${site}${basePath}/`;

  const items = briefings
    .map((b) => {
      const link = `${site}${withBase(`/day/${b.date}/`, `/${basePath}/`)}`.replace(/([^:]\/)\/+/g, '$1');
      const summary = escapeXml(b.intro ?? b.title ?? '');
      return `<item>
  <title>${escapeXml(b.title ?? `Briefing ${b.date}`)}</title>
  <link>${link}</link>
  <guid isPermaLink="true">${link}</guid>
  <pubDate>${new Date(`${b.date}T07:00:00+01:00`).toUTCString()}</pubDate>
  <description>${summary}</description>
</item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(nyttConfig.name)}</title>
    <link>${home}</link>
    <description>${escapeXml(nyttConfig.tagline)}</description>
    <language>en</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};