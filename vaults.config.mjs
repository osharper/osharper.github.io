// Obsidian vaults rendered as site areas.
//
// Each vault is a git submodule under vaults/<id>. To preview notes you
// haven't pushed yet, point the env var at your working copy:
//   GREENHOUSE_VAULT=../greenhouse-vault npm run dev
import path from 'node:path';

const vaultDir = (envVar, fallback) => path.resolve(process.env[envVar] || fallback);

/**
 * @typedef {object} VaultConfig
 * @property {string} id         area id, also the media folder name under public/
 * @property {string} dir        absolute path to the vault checkout
 * @property {string} base       URL prefix of the area
 * @property {Record<string, string>} sections  vault folder -> URL segment; every note in it gets a page
 * @property {Record<string, string>} notes     root-level note -> URL slug under <base>/notes/
 */

/** @type {VaultConfig[]} */
export const vaults = [
  {
    id: 'greenhouse',
    dir: vaultDir('GREENHOUSE_VAULT', 'vaults/greenhouse'),
    base: '/greenhouse',
    sections: {
      Log: 'log',
      Plantings: 'plantings',
      Seedbank: 'seedbank',
      Inventory: 'inventory',
    },
    // Anything not listed here or in `sections` stays private (Home, Pipelines,
    // Purchases, Design, drafts). A note can also opt out with `publish: false`.
    notes: {
      Profile: 'profile',
      'Growing-Practices': 'growing-practices',
      'Tech-Stack': 'tech-stack',
      Overview: 'overview',
    },
  },
];

export const vaultById = (id) => {
  const vault = vaults.find((v) => v.id === id);
  if (!vault) throw new Error(`Unknown vault: ${id}`);
  return vault;
};
