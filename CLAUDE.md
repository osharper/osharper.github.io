# osharper.github.io

Personal site: a hand-written home page plus **areas**, separate sections that usually render an Obsidian vault.
Astro 7 (static), Tailwind v4 + typography, tsParticles background, GitHub Pages. See README.md for the deploy
pipeline and secrets.

## Layout

```
vaults.config.mjs            vaults: checkout dir, URL base, which folders/notes are published
vaults/greenhouse/           git submodule -> osharper/greenhouse-vault (private). Never edit here.
scripts/sync-vault-media.mjs copies images embedded by published notes into public/<id>/media/ (gitignored)
src/areas.ts                 area registry -> header nav + home page "Outside work" cards
src/content.config.ts        collections read from the vault (loose schemas, the vault's READMEs own the formats)
src/lib/obsidian.mjs         Obsidian link resolution + vault path -> URL mapping (shared by everything)
src/plugins/remark-obsidian.mjs  [[wikilinks]], ![[embeds]], drops the note H1
src/lib/greenhouse.ts        collection getters, titles, excerpts, status colours, date formatting
src/layouts/Base.astro       html shell, particles, header/footer; `area` prop sets accent + particle colour
src/layouts/Greenhouse.astro area tabs + page header
src/pages/index.astro        home page content (lives here, not in a vault)
src/pages/greenhouse/        overview, log, plantings, seedbank, inventory, notes
```

## Rules

- Greenhouse page text comes from the vault. Only the short area intros are written here.
- Vault dates are calendar dates (Asia/Bangkok). Format them with `fmtDate` (UTC), never local time.
- Markdown goes through the `unified` processor from `@astrojs/markdown-remark` (set in astro.config.mjs), not
  Astro's default Sätteri, because the vault needs remark plugins.
- Before anything new gets published from a vault, check it for secrets, IPs and personal data. Publishing is
  allowlist-only for that reason. Don't widen `sections`/`notes` without asking.
- `npm run build` must pass before committing; it also validates the vault against the schemas.

## Adding an area

1. Add it to `src/areas.ts`.
2. Create `src/pages/<id>/` with its own layout (copy `Greenhouse.astro`), and give it a colour block in
   `src/styles/global.css` (`:root[data-area="<id>"]`).
3. If it's vault-backed: `git submodule add -b <branch> <url> vaults/<id>`, add the vault to `vaults.config.mjs`,
   add collections to `src/content.config.ts`, and copy greenhouse-vault's `.github/workflows/trigger-site-rebuild.yml`
   into the new vault (plus its `SITE_REBUILD_TOKEN` secret).
