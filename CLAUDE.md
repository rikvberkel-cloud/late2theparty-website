# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Rik's DJ hobby project, **not** work/REL. DJ name **all-electric** (do not use the old name "DJ Rikkert010"). Newsletter is a separate brand: **Late 2 The Party**. Live at https://www.late2theparty.nl.

## Commands

There is no build step, package manager, linter, or test suite — this is a hand-written static site (HTML/CSS/JS only).

Preview locally:
```
python3 -m http.server 8000 --directory docs
# → http://localhost:8000
```
(This matches `.cursor/environment.json`, which starts the same server on container boot.)

Ship a change: commit + push to the branch GitHub Pages serves (see "Branch gotcha" below). No CI, no deploy step — Pages rebuilds automatically within about a minute.

## Architecture

**Everything published lives under `docs/`** (GitHub Pages source, with `docs/CNAME` pointing at the custom domain). Never duplicate `index.html`/`style.css`/`main.js` at the repo root — that happened historically and caused stale-content bugs; the root of the repo now holds only docs-about-the-docs (this file, `AGENTS.md`, `AUDIT.md`, `REVIEW.md`) and `.cursor/`.

**One stylesheet drives every page.** `docs/style.css` is shared by the homepage, the newsletter archive, every individual newsletter edition, and the privacy page via one token system defined in `:root`:
- Color: `--neon-yellow`, `--neon-cyan`, `--neon-red`, `--neon-green`, `--bg-dark`, `--bg-alt`, `--bg-panel-2`, `--line`, `--line-strong`, `--text-main`, `--text-muted`, `--text-dim`
- Type: `--font` (Space Grotesk, body), `--font-display` (Archivo, headings), `--font-mono` (Space Mono, nav/buttons/labels/pills), plus a fixed size scale `--fs-kicker` → `--fs-display`
- Radius: `--r-sm` / `--r-md` / `--r-lg` / `--r-pill`; glow shadows: `--glow-yellow*`, `--glow-cyan*`, `--glow-green`, `--glow-red`

Component classes are reused across pages rather than page-scoped: `.btn`, `.section`/`.section__heading`, `.agenda-tab`/`.nb-filter` (same pill component, two contexts), `.nb-*` (newsletter archive + promo block + the shared masthead used by both the newsletter and privacy pages), `.ed-*` (individual-edition article furniture), `.prose` (long-form body copy on editions and privacy). When changing a shared class, check all four page types, not just the one you're looking at.

Fonts are self-hosted as woff2 in `docs/fonts/` (OFL-licensed: Archivo, Space Grotesk, Space Mono) and loaded via `@font-face` in `style.css`. **Never add a Google Fonts `<link>`** — that was deliberately removed.

**One script drives cross-page behavior.** `docs/main.js` is vanilla JS, no dependencies, included on every page (`<script src="main.js">` or a relative `../` path from subpages) and handles, in order: desktop cursor glow, scroll parallax, the "issue tree" scroll-reveal animation, generic `.fade-in` reveal via `IntersectionObserver`, nav scroll-spy, agenda tab switching (with roving-tabindex keyboard support), mobile nav toggle, lazy-mounting Spotify iframes (immediate on desktop, tap-to-load on mobile to avoid autoplay), and lazily injecting the MailerLite Universal script only when a `.ml-embedded` element is present on the page. `docs/nieuwsbrief/nieuwsbrief.js` is a second, page-specific script (loaded in addition to `main.js`) that only powers the tag-filter on the newsletter archive.

**Page tree and relative paths:**
```
docs/index.html                    home
docs/nieuwsbrief/index.html        newsletter archive (tag-filterable list)
docs/nieuwsbrief/NN/index.html     one edition per numbered folder (NN = "01", "02", …)
docs/privacy/index.html            privacy page
```
Every subpage links back to CSS/JS/images with relative paths whose depth matches its folder (`../style.css` one level down, `../../style.css` two levels down). Copy-pasting a `<head>` or nav block between pages at different depths is the most common way to break asset loading — check the depth when adding a new edition folder.

**Content conventions** (see `AGENTS.md` / `.cursor/rules/all-electric.mdc` for the canonical version of this, kept in sync):
- Agenda: hand-written `<li class="agenda__row">` rows in two panels (`#paneel-komend` / `#paneel-geweest`) inside `docs/index.html`. Row order within a panel is soonest-to-today first. Markup order is `datum → agenda__event → agenda__location` (event name is the visually prominent element; location is muted/secondary — deliberately swapped in Sept 2026, don't revert to location-first).
- FAQ: `<details class="faq-item">` blocks in `docs/index.html`, order is meaningful (set intentionally by Rik, not alphabetical/chronological).
- New newsletter edition: copy an `<li class="nb-item">` in `docs/nieuwsbrief/index.html` (its `data-tags` drives the archive filter), add `docs/nieuwsbrief/NN/index.html`, update `docs/sitemap.xml`.
- Newsletter signup: MailerLite embedded form `data-form="aK1pC9"` (account `2547241`), present on the homepage `#aanmelden` and the archive page. The old popup form (`6erjz7`) must stay disabled in the MailerLite dashboard — don't re-enable it from code.
- Booking: a plain `mailto:` link with a prefilled subject/body, not a form.

**Voice/style constraints when writing copy:** Dutch, personal, club-energy tone, no hype language. Fixed vocabulary: "draaien" not "optreden", "plaatjes" not "tracks", "boeken" not "inhuren". "all-electric" is always lowercase, including at the start of a sentence; "Late 2 The Party" keeps its capitals.

## Branch gotcha

GitHub Pages serves `main` (root `/docs`), but this repo's **default branch on GitHub has drifted to a stale branch before** (`claude/dj-r010-website-qzLwf`, which still holds an unrelated older version of the site). A PR opened from the GitHub UI targets whatever the default branch is, not necessarily `main` — check the PR's base before merging, or it will merge cleanly but never go live. Always open PRs explicitly against `main`.
