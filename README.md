# osharper.github.io

Personal site of Oleg Dolotov: <https://osharper.github.io>

- `/`: about me, experience and contacts (written in this repo)
- `/blog/`: posts written in this repo (`src/content/blog`), RSS at `/rss.xml`
- `/greenhouse/`: the home greenhouse on Koh Phangan, generated from the
  [greenhouse-vault](https://github.com/osharper/greenhouse-vault) Obsidian vault

Built with [Astro](https://astro.build), Tailwind CSS and [tsParticles](https://particles.js.org), deployed to
GitHub Pages by GitHub Actions.

## Develop

```bash
git clone --recurse-submodules https://github.com/osharper/osharper.github.io.git
npm install
npm run dev          # http://localhost:4321
npm run build        # static site in dist/
```

Already cloned without submodules? `git submodule update --init`.

To preview vault notes you haven't pushed yet, point the build at your working copy of the vault:

```bash
GREENHOUSE_VAULT=../greenhouse-vault npm run dev
```

## How content gets here

```
greenhouse-vault (Obsidian, markdown)          osharper.github.io
  push to master                                 vaults/greenhouse  (git submodule)
    └─ trigger-site-rebuild.yml ──repository_dispatch──▶ deploy.yml
                                                   ├─ git submodule update --remote
                                                   ├─ npm run build
                                                   └─ deploy to GitHub Pages
```

Every build uses the latest vault content, whether it was triggered by a vault push or by a push here.

### Secrets

| Repo | Secret | Token needs |
|---|---|---|
| osharper.github.io | `GH_PAT` | read access to `greenhouse-vault` (it's private) |
| greenhouse-vault | `SITE_REBUILD_TOKEN` | Contents: read & write on `osharper.github.io` (to send `repository_dispatch`) |

One fine-grained PAT covering both repos works for both secrets.

## What gets published from a vault

Only what `vaults.config.mjs` lists: the `sections` folders (every note in them gets a page) and the root `notes`.
Everything else in the vault stays private, and any note can opt out with `publish: false` in its frontmatter.
Images are copied only if a published note embeds them.
