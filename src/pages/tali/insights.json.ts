/**
 * Tali's view of Insights: every published post's title, excerpt, category,
 * topics and link, newest first. Generated at build time from the same
 * content collection as the Insights pages, so a new post is known to Tali
 * automatically. Fetched once, when the chat first opens.
 */
import { getCollection } from 'astro:content';

export async function GET() {
  const posts = (await getCollection('insights', (p) => !p.data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );
  const body = posts.map((p) => ({
    title: p.data.title,
    excerpt: p.data.excerpt,
    category: p.data.category,
    topics: p.data.topics,
    href: `/insights/${p.id}/`,
  }));
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
}
