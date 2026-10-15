// Site areas: self-contained sections with their own URL prefix and, usually,
// their own content vault (see vaults.config.mjs). The header nav and the
// home page's "Areas" block are built from this list.
//
// To add one: create src/pages/<id>/, add an entry here, and (if it's
// vault-backed) a vault in vaults.config.mjs plus collections in
// src/content.config.ts.
export interface Area {
  id: string;
  title: string;
  href: string;
  tagline: string;
  /** Show as a card in the home page "Outside work" block. Default true. */
  card?: boolean;
}

export const areas: Area[] = [
  {
    id: 'blog',
    title: 'Blog',
    href: '/blog/',
    tagline: 'Engineering, AI agents, human behaviour, and what I am building.',
    card: false,
  },
  {
    id: 'greenhouse',
    title: 'Greenhouse',
    href: '/greenhouse/',
    tagline:
      'A tropical home greenhouse on Koh Phangan: the daily log, every planting batch, the seed bank and the gear.',
  },
];
