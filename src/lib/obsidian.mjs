// Obsidian vault index: resolves [[wikilinks]] and ![[embeds]] the way
// Obsidian does, and maps vault files to site URLs. Shared by the remark
// plugin, the media sync script and the page code, so plain JS.
import fs from 'node:fs';
import path from 'node:path';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']);
const indexes = new Map();

export const isImage = (rel) => IMAGE_EXT.has(path.extname(rel).toLowerCase());

/** Frontmatter `publish: false` keeps a note off the site. */
const isPrivate = (source) => {
  const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return !!fm && /^publish:\s*false\s*$/m.test(fm[1]);
};

function walk(dir, rel, files, dirs) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      dirs.add(childRel);
      walk(full, childRel, files, dirs);
    } else if (entry.name.endsWith('.md')) {
      files.set(childRel, { private: isPrivate(fs.readFileSync(full, 'utf8')) });
    } else {
      files.set(childRel, { private: false });
    }
  }
}

/** Builds (once per process) the file index for a vault. */
export function vaultIndex(vault) {
  let index = indexes.get(vault.dir);
  if (!index) {
    const files = new Map();
    const dirs = new Set();
    if (fs.existsSync(vault.dir)) walk(vault.dir, '', files, dirs);
    index = { files, dirs };
    indexes.set(vault.dir, index);
  }
  return index;
}

/**
 * Finds the vault file a link target points to. Order follows Obsidian:
 * path from the vault root, path relative to the linking note, then the
 * shortest path that ends with the target.
 * @returns {string | null} vault-relative path, folder paths end with '/'
 */
export function findFile(vault, target, fromRel = '') {
  const { files, dirs } = vaultIndex(vault);
  const t = target.trim().replace(/\\/g, '/').replace(/^\.?\//, '');
  if (!t) return null;
  const candidates = [t, `${t}.md`];

  for (const c of candidates) if (files.has(c)) return c;

  const fromDir = path.posix.dirname(fromRel);
  for (const c of candidates) {
    const p = path.posix.normalize(path.posix.join(fromDir, c));
    if (files.has(p)) return p;
  }

  const bySuffix = [...files.keys()]
    .filter((f) => candidates.some((c) => f.endsWith(`/${c}`)))
    .sort((a, b) => a.length - b.length);
  if (bySuffix.length) return bySuffix[0];

  const folder = t.replace(/\/$/, '');
  return dirs.has(folder) ? `${folder}/` : null;
}

const encodePath = (rel) => rel.split('/').map(encodeURIComponent).join('/');

export const mediaUrl = (vault, rel) => `${vault.base}/media/${encodePath(rel)}`;

/** Page slug of a published note, e.g. 'Log/2026/2026-10-08.md' -> '2026-10-08'. */
export const noteSlug = (rel) => path.posix.basename(rel, '.md');

/**
 * Site URL for a vault file or folder, or null when it isn't published.
 * Folder READMEs and folders map to the section index.
 */
export function urlFor(vault, rel) {
  if (!rel) return null;
  if (isImage(rel)) return mediaUrl(vault, rel);

  const info = vaultIndex(vault).files.get(rel);
  if (info?.private) return null;

  const [top, ...rest] = rel.replace(/\/$/, '').split('/');
  const section = vault.sections[top];
  if (section) {
    const isIndex = rest.length === 0 || /^README/i.test(rest.at(-1)) || rel.endsWith('/');
    if (isIndex) return `${vault.base}/${section}/`;
    if (!rel.endsWith('.md')) return null;
    return `${vault.base}/${section}/${noteSlug(rel)}/`;
  }

  if (rest.length === 0 && rel.endsWith('.md')) {
    const slug = vault.notes[noteSlug(rel)];
    if (slug) return `${vault.base}/notes/${slug}/`;
  }
  return null;
}

/** Vault the given absolute file path belongs to, with its vault-relative path. */
export function locate(vaults, absPath) {
  if (!absPath) return null;
  for (const vault of vaults) {
    const rel = path.relative(vault.dir, absPath);
    if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) {
      return { vault, rel: rel.split(path.sep).join('/') };
    }
  }
  return null;
}

/** Splits `target#heading|alias` into its parts. */
export function parseLink(inner) {
  const pipe = inner.indexOf('|');
  const linkPart = pipe === -1 ? inner : inner.slice(0, pipe);
  const alias = pipe === -1 ? '' : inner.slice(pipe + 1).trim();
  const hash = linkPart.indexOf('#');
  return {
    target: (hash === -1 ? linkPart : linkPart.slice(0, hash)).trim(),
    heading: hash === -1 ? '' : linkPart.slice(hash + 1).trim(),
    alias,
  };
}

export const WIKILINK_RE = /(!?)\[\[([^\]\n]+?)\]\]/g;

/** Turns wikilinks in a plain string into their display text (for excerpts). */
export function stripWikilinks(text) {
  return text.replace(WIKILINK_RE, (_, embed, inner) => {
    if (embed) return '';
    const { target, alias } = parseLink(inner);
    return alias || path.posix.basename(target);
  });
}
