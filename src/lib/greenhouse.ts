// Read helpers over the greenhouse vault collections.
import { getCollection, type CollectionEntry } from 'astro:content';
import path from 'node:path';
import { vaultById } from '../../vaults.config.mjs';
import { findFile, isImage, locate, parseLink, stripWikilinks, urlFor, WIKILINK_RE } from './obsidian.mjs';

export const vault = vaultById('greenhouse');

type Entry =
  | CollectionEntry<'greenhouseLog'>
  | CollectionEntry<'greenhousePlantings'>
  | CollectionEntry<'greenhouseSeeds'>
  | CollectionEntry<'greenhouseInventory'>
  | CollectionEntry<'greenhouseNotes'>;

const published = (entry: { data: { publish?: boolean } }) => entry.data.publish !== false;
const byTime = (a?: Date, b?: Date) => (b?.getTime() ?? 0) - (a?.getTime() ?? 0);

export const getLog = async () =>
  (await getCollection('greenhouseLog', published)).sort((a, b) => byTime(a.data.date, b.data.date));

export const getPlantings = async () =>
  (await getCollection('greenhousePlantings', published)).sort(
    (a, b) => byTime(a.data.sown, b.data.sown) || a.id.localeCompare(b.id),
  );

export const getSeeds = async () =>
  (await getCollection('greenhouseSeeds', published)).sort((a, b) => titleOf(a).localeCompare(titleOf(b)));

export const getInventory = async () =>
  (await getCollection('greenhouseInventory', published)).sort((a, b) => titleOf(a).localeCompare(titleOf(b)));

export const getNotes = async () => getCollection('greenhouseNotes', published);

/** The note's H1, which page layouts render as the title. */
export function titleOf(entry: Entry): string {
  if ('name' in entry.data && entry.data.name) return String(entry.data.name);
  const h1 = entry.body?.match(/^#\s+(.+)$/m)?.[1].trim() ?? entry.id;
  // Planting H1s end with " - <id>", which the page shows separately.
  return h1.replace(new RegExp(`\\s+[-–—]\\s+${entry.id}$`), '');
}

/** Raw markdown under a `## heading`, up to the next heading of that level. */
export function section(entry: Entry, heading: string): string {
  const body = entry.body ?? '';
  const start = body.search(new RegExp(`^##\\s+${heading}\\s*$`, 'm'));
  if (start === -1) return '';
  const rest = body.slice(start).replace(/^.*\n/, '');
  const end = rest.search(/^##\s/m);
  return (end === -1 ? rest : rest.slice(0, end)).trim();
}

/** Plain-text excerpt of a section (or the first paragraph), for cards. */
export function excerpt(entry: Entry, heading?: string, max = 320): string {
  const source = heading ? section(entry, heading) : (entry.body ?? '').replace(/^#.*$/gm, '');
  const text = stripWikilinks(source)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(' ', max))}…`;
}

const vaultPath = (entry: Entry) => locate([vault], path.resolve(entry.filePath ?? ''))?.rel ?? '';

/** Media URL for a vault-relative image reference, resolved from the entry's folder. */
export function imageUrl(entry: Entry, target?: string): string | undefined {
  if (!target) return undefined;
  const file = findFile(vault, target, vaultPath(entry));
  return file && isImage(file) ? (urlFor(vault, file) ?? undefined) : undefined;
}

/** Every image embedded in the note body, in order. */
export function imagesOf(entry: Entry): string[] {
  return [...(entry.body ?? '').matchAll(WIKILINK_RE)]
    .filter((m) => m[1] === '!')
    .map((m) => imageUrl(entry, parseLink(m[2]).target))
    .filter((url): url is string => !!url);
}

/** Frontmatter values like `"[[Seedbank/green-coral-lettuce]]"` or `"unlisted: Name"`. */
export async function linkField(entry: Entry, value?: string): Promise<{ label: string; href?: string } | undefined> {
  if (!value) return undefined;
  const wikilink = value.match(/^\[\[(.+)\]\]$/);
  if (!wikilink) return { label: value.replace(/^unlisted:\s*/, '') };
  const { target, alias } = parseLink(wikilink[1]);
  const file = findFile(vault, target, vaultPath(entry));
  const href = (file && urlFor(vault, file)) || undefined;
  const linked = file?.endsWith('.md') ? (await seedTitles()).get(path.posix.basename(file, '.md')) : undefined;
  return { label: alias || linked || path.posix.basename(target), href };
}

// Seed titles by id, so variety links can show the variety name.
let seedTitleCache: Map<string, string> | undefined;
async function seedTitles() {
  seedTitleCache ??= new Map((await getSeeds()).map((s) => [s.id, titleOf(s)]));
  return seedTitleCache;
}

export const ACTIVE_STATUSES = ['germinating', 'seedling', 'hardening', 'growing', 'harvesting'];

export const isActive = (planting: CollectionEntry<'greenhousePlantings'>) =>
  ACTIVE_STATUSES.includes(planting.data.status);

/** Tailwind classes for a status pill. */
export function statusTone(status = ''): string {
  if (['failed', 'broken', 'retired'].includes(status))
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200';
  if (['done', 'spare', 'not yet planted'].includes(status))
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  if (['planned', 'germinating'].includes(status))
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200';
  return 'bg-accent-soft text-accent-strong';
}

/** Vault dates are calendar dates (Asia/Bangkok); render them without shifting. */
export function fmtDate(date?: Date, style: 'short' | 'long' = 'short'): string {
  if (!date) return '';
  return date.toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    ...(style === 'long' && { weekday: 'long' }),
  });
}

export const isoDate = (date?: Date) => date?.toISOString().slice(0, 10) ?? '';

export function fmtRange(from?: Date, to?: Date): string {
  if (!from) return '';
  if (!to || isoDate(from) === isoDate(to)) return fmtDate(from);
  return `${fmtDate(from)} – ${fmtDate(to)}`;
}
