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
- **Vue 3** — used for interactive islands via `client:only` / `client:load` / `client:visible` directives
- **Tailwind CSS v4** — configured as a Vite plugin (`@tailwindcss/vite`), no `tailwind.config.*` file
- **TypeScript** — strict mode
- **@mlc-ai/web-llm** — on-device LLM inference (runs entirely in the browser via WebGPU)
- **marked** — markdown rendering inside the chat component
- **@tailwindcss/typography** — prose styles for chat assistant messages

## Deployment

Deployed to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`.

- Live URL: `https://oleg-agapov.github.io/olegagapov.com`
- Base path: `/olegagapov.com` (set in `astro.config.mjs`)
- All internal links and asset paths must include the base prefix (e.g. `/olegagapov.com/avatar-oleg.jpg`)

## Architecture

All pages are statically rendered. Vue components only ship JS when explicitly hydrated with a client directive on the component tag.

### Pages

- `src/pages/index.astro` — homepage with avatar, bio, and the Chat widget
- `src/pages/about.astro` — full bio page (work, teaching, hobbies, contact)
- `src/pages/home.astro` — redirects to `/olegagapov.com` (legacy route)

Nav links (rendered in `Base.astro`): **Home**, **About**, **Courses** (Courses page not yet built).

### Chat component (`src/components/Chat.vue`)

The main interactive feature. Mounted with `client:only="vue"` on the homepage. It:
- Loads an on-device LLM (`gemma-2-2b-it-q4f16_1-MLC`) via WebGPU using `@mlc-ai/web-llm`
- Shows a top progress bar while the model downloads/initializes
- Reads the system prompt from `src/data/oleg-context.md` (imported as raw text)
- Streams token-by-token responses and renders them as markdown via `marked`
- Has suggestion pills for quick-start questions

Model can be swapped by changing the `MODEL` constant in `Chat.vue`.

### Service Worker

`public/sw.js` is registered in `Base.astro` and caches assets for offline use.

### Tailwind v4 custom tokens

Defined in `src/styles/global.css` via `@theme {}` — not in a config file:

- Colors: `bg-cream` (`#F7F2EA`), `bg-terra` / `text-terra` (`#D9542B`), `bg-terra-soft` (`#F5D9C9`)
- Fonts: `font-display` (Fraunces), `font-body` (Figtree), `font-mono` (IBM Plex Mono)

These generate utility classes directly — use `font-display`, `text-terra`, etc. in markup. Do not use inline `style` attributes for these.

### Fonts

Loaded from Google Fonts in `global.css`. The three font variables map to the design system:
- `font-display` — headings, nav links (serif, supports italic)
- `font-body` — body text, inputs
- `font-mono` — labels, metadata, uppercase tracking text

### Layout convention

`src/layouts/Base.astro` is the only layout — it accepts a `title` prop and imports `global.css`. All pages use it. It also renders the nav header and registers the service worker.

Static assets (images, icons) go in `public/` and are referenced with the base prefix: `/olegagapov.com/<filename>`.
