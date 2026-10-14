// Copies the images that published vault notes reference into
// public/<vault id>/media/, so the site only ships photos that are actually
// shown somewhere. Runs before `astro dev` and `astro build`.
import fs from 'node:fs';
import path from 'node:path';
import { vaults } from '../vaults.config.mjs';
import { findFile, isImage, parseLink, urlFor, vaultIndex, WIKILINK_RE } from '../src/lib/obsidian.mjs';

const MD_IMAGE_RE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const PHOTO_FIELD_RE = /^photo:\s*["']?([^"'\n#]+?)["']?\s*$/m;

for (const vault of vaults) {
  const outDir = path.resolve('public', vault.id, 'media');
  fs.rmSync(outDir, { recursive: true, force: true });

  if (!fs.existsSync(vault.dir) || !fs.readdirSync(vault.dir).length) {
    console.warn(`[media] ${vault.id}: vault not found at ${vault.dir} (run: git submodule update --init)`);
    continue;
  }

  const wanted = new Set();
  for (const [rel] of vaultIndex(vault).files) {
    if (!rel.endsWith('.md') || !urlFor(vault, rel)) continue;
    const source = fs.readFileSync(path.join(vault.dir, rel), 'utf8');
    const targets = [
      ...[...source.matchAll(WIKILINK_RE)].filter((m) => m[1] === '!').map((m) => parseLink(m[2]).target),
      ...[...source.matchAll(MD_IMAGE_RE)].map((m) => decodeURIComponent(m[1])),
      source.match(PHOTO_FIELD_RE)?.[1],
    ];
    for (const target of targets) {
      if (!target || /^[a-z]+:/i.test(target)) continue;
      const file = findFile(vault, target, rel);
      if (file && isImage(file)) wanted.add(file);
    }
  }

  for (const rel of wanted) {
    const dest = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(vault.dir, rel), dest);
  }
  console.log(`[media] ${vault.id}: copied ${wanted.size} images`);
}
