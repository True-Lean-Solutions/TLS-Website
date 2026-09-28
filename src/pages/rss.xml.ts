import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts, categoryMeta } from '../data/insights';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: 'True Lean Solutions — Insights',
    description:
      'Practical notes on integration, automation and hiring for small businesses.',
    site: context.site ?? 'https://www.trueleansolutions.com',
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: p.data.date,
      link: `/insights/${p.id}/`,
      categories: [categoryMeta[p.data.category].label, ...p.data.topics],
    })),
  });
}
