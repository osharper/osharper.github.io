// RSS feed for the blog. Hand-written on purpose: CI installs with `npm ci`,
// so a new dependency would also need an updated package-lock.json.
import type { APIRoute } from 'astro';
import { getPosts } from '../lib/blog';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://osharper.github.io');
  const posts = await getPosts();

  const items = posts
    .map((post) => {
      const url = new URL(`/blog/${post.id}/`, origin).href;
      return `    <item>
      <title>${esc(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <description>${esc(post.data.description)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Oleg Dolotov — Blog</title>
    <link>${new URL('/blog/', origin).href}</link>
    <description>Engineering, AI agents, human behaviour, and what I'm building.</description>
    <language>en</language>
    <atom:link href="${new URL('/rss.xml', origin).href}" rel="self" type="application/rss+xml" />
${posts[0] ? `    <lastBuildDate>${posts[0].data.date.toUTCString()}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
