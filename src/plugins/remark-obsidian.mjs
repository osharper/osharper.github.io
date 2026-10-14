// Renders Obsidian syntax in vault notes:
//   [[target]] / [[target|alias]] / [[target#heading]]  -> links to the note's page
//   ![[photo.jpg]] / ![[photo.jpg|300]]                 -> <img>, copied by scripts/sync-vault-media.mjs
//   ![](attachments/photo.jpg)                          -> same, for plain markdown images
// Links to notes that aren't published become plain text. The note's H1 is
// dropped because page layouts render the title themselves.
import path from 'node:path';
import { visit, SKIP } from 'unist-util-visit';
import { findFile, isImage, locate, parseLink, urlFor, WIKILINK_RE } from '../lib/obsidian.mjs';

const headingSlug = (text) =>
  text.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-');

function imageNode(url, label, size) {
  const [width, height] = size.split('x');
  return {
    type: 'image',
    url,
    alt: label,
    data: { hProperties: { loading: 'lazy', ...(width && { width }), ...(height && { height }) } },
  };
}

function wikilinkNode(vault, rel, isEmbed, inner) {
  const { target, heading, alias } = parseLink(inner);
  const file = target ? findFile(vault, target, rel) : rel;
  const url = file ? urlFor(vault, file) : null;
  const label = path.posix.basename(target || heading);

  if (isEmbed && file && isImage(file)) {
    const size = /^\d+(x\d+)?$/.test(alias) ? alias : '';
    return imageNode(url, size ? label : alias || label, size);
  }

  const text = alias || (heading && !target ? heading : label) || inner;
  if (!url) return { type: 'text', value: text };
  const hash = heading ? `#${headingSlug(heading)}` : '';
  return { type: 'link', url: `${url}${hash}`, children: [{ type: 'text', value: text }] };
}

export default function remarkObsidian({ vaults }) {
  return (tree, file) => {
    const where = locate(vaults, file.path ?? file.history?.[0]);
    if (!where) return;
    const { vault, rel } = where;

    const h1 = tree.children.findIndex((n) => n.type === 'heading' && n.depth === 1);
    if (h1 !== -1) tree.children.splice(h1, 1);

    visit(tree, 'image', (node) => {
      if (/^([a-z]+:|\/|#)/i.test(node.url)) return;
      const target = findFile(vault, decodeURIComponent(node.url), rel);
      const url = target && urlFor(vault, target);
      if (url) node.url = url;
    });

    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined || !node.value.includes('[[')) return;
      const parts = [];
      let last = 0;
      for (const match of node.value.matchAll(WIKILINK_RE)) {
        if (match.index > last) parts.push({ type: 'text', value: node.value.slice(last, match.index) });
        parts.push(wikilinkNode(vault, rel, match[1] === '!', match[2]));
        last = match.index + match[0].length;
      }
      if (!parts.length) return;
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
      parent.children.splice(index, 1, ...parts);
      return [SKIP, index + parts.length];
    });
  };
}
