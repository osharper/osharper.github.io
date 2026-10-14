// Content collections read straight from the vault submodules. Schemas stay
// loose on purpose: the vault's own READMEs define the formats, and a field
// the site doesn't know about should never break the build.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import path from 'node:path';
import { vaultById } from '../vaults.config.mjs';

const greenhouse = vaultById('greenhouse');

const blankToUndefined = (v: unknown) => (v === null || v === '' ? undefined : v);
const optDate = z.preprocess(blankToUndefined, z.coerce.date().optional());
const optString = z.preprocess(blankToUndefined, z.coerce.string().optional());
const optNumber = z.preprocess(blankToUndefined, z.coerce.number().optional());
const publish = z.boolean().optional();

const fromVault = (folder: string, pattern: string | string[]) =>
  glob({
    base: path.join(greenhouse.dir, folder),
    pattern,
    generateId: ({ entry }) => path.posix.basename(entry, '.md'),
  });

const greenhouseLog = defineCollection({
  loader: fromVault('Log', '[0-9][0-9][0-9][0-9]/*.md'),
  schema: z.looseObject({
    date: z.coerce.date(),
    weather: optString,
    updated: optDate,
    publish,
  }),
});

const greenhousePlantings = defineCollection({
  loader: fromVault('Plantings', ['*.md', '!README*.md']),
  schema: z.looseObject({
    variety: optString,
    status: z.string().default('unknown'),
    system: optString,
    qty: optString,
    sown: optDate,
    sown_approx: z.boolean().optional(),
    germinated: optDate,
    transplanted: optDate,
    first_harvest: optDate,
    germinate_from: optDate,
    germinate_to: optDate,
    transplant_from: optDate,
    transplant_to: optDate,
    harvest_from: optDate,
    harvest_to: optDate,
    next_succession: optDate,
    timeline_basis: optString,
    updated: optDate,
    publish,
  }),
});

const greenhouseSeeds = defineCollection({
  loader: fromVault('Seedbank', ['*.md', '!README*.md']),
  schema: z.looseObject({
    rating: optString,
    status: optString,
    updated: optDate,
    publish,
  }),
});

const greenhouseInventory = defineCollection({
  loader: fromVault('Inventory', ['*.md', '!README*.md']),
  schema: z.looseObject({
    name: optString,
    category: z.string().default('other'),
    qty_total: optNumber,
    status: optString,
    brand: optString,
    shop: optString,
    unit_price_thb: optNumber,
    photo: optString,
    updated: optDate,
    publish,
  }),
});

const greenhouseNotes = defineCollection({
  loader: glob({
    base: greenhouse.dir,
    pattern: Object.keys(greenhouse.notes).map((name) => `${name}.md`),
    generateId: ({ entry }) => greenhouse.notes[path.posix.basename(entry, '.md')],
  }),
  schema: z.looseObject({
    updated: optDate,
    publish,
  }),
});

export const collections = {
  greenhouseLog,
  greenhousePlantings,
  greenhouseSeeds,
  greenhouseInventory,
  greenhouseNotes,
};
