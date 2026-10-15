// Blog posts: markdown files in src/content/blog (written in this repo, not
// in a vault). `draft: true` keeps a post off the site in production (list,
// page, RSS); `npm run dev` still shows drafts so they can be previewed.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function fmtPostDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
}
