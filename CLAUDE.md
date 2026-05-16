# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server at localhost:4321
npm run build    # static build to ./dist/
npm run preview  # preview production build
```

## Stack

- **Astro 6** — static site generator, outputs zero JS by default
- **Vue 3** — used for interactive islands via `client:load` / `client:visible` directives
- **Tailwind CSS v4** — configured as a Vite plugin (`@tailwindcss/vite`), no `tailwind.config.*` file
- **TypeScript** — strict mode

## Architecture

All pages are statically rendered. Vue components only ship JS when explicitly hydrated with a client directive on the component tag.

### Tailwind v4 custom tokens

Defined in `src/styles/global.css` via `@theme {}` — not in a config file:

- Colors: `bg-cream` (`#F7F2EA`), `bg-terra` / `text-terra` (`#D9542B`)
- Fonts: `font-display` (Fraunces), `font-body` (Figtree), `font-mono` (IBM Plex Mono)

These generate utility classes directly — use `font-display`, `text-terra`, etc. in markup. Do not use inline `style` attributes for these.

### Fonts

Loaded from Google Fonts in `global.css`. The three font variables map to the design system:
- `font-display` — headings, nav links (serif, supports italic)
- `font-body` — body text, inputs
- `font-mono` — labels, metadata, uppercase tracking text

### Layout convention

`src/layouts/Base.astro` is the only layout — it accepts a `title` prop and imports `global.css`. All pages use it.

Static assets (images, icons) go in `public/` and are referenced with root-relative paths (`/avatar-oleg.jpg`).
