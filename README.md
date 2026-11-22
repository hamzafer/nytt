# nytt

**Norway news for internationals, every morning** — a static site for daily English briefings. Built for [GitHub Pages](https://hamzafer.github.io/nytt/) at `https://hamzafer.github.io/nytt/`.

## Run locally

```bash
npm ci
npm run dev
```

Open the URL Astro prints (default port). For production-like paths:

```bash
npm run build
npm run preview
```

Preview uses the same `/nytt/` base path as GitHub Pages.

## Add a daily briefing (one file per day)

1. Create **`content/briefings/YYYY-MM-DD.json`** (one new file per day — nothing else required).
2. Commit and push to `main`. The GitHub Actions workflow rebuilds and deploys the site.

### JSON format

```json
{
  "date": "2026-11-23",
  "title": "Optional headline for the page",
  "intro": "Optional one-line summary under the title.",
  "sections": {
    "big-news": [],
    "whats-changing": [],
    "oslo": [],
    "be-aware": [],
    "fun-and-free": []
  }
}
```

**Section keys** (use only the ones that have items; omit empty sections or leave them as `[]`):

| Key | Category |
|-----|----------|
| `big-news` | Big news |
| `whats-changing` | What's changing |
| `oslo` | Oslo |
| `be-aware` | Be aware |
| `fun-and-free` | Fun and free |

**Each item:**

```json
{
  "emoji": "🚇",
  "text": "Short summary in your own words.",
  "sources": [
    { "label": "NRK", "url": "https://www.nrk.no/..." }
  ],
  "takeaway": "Optional one-line 'What this means for you'.",
  "correction": "Optional visible correction note."
}
```

Rules for automated writers:

- Keep `date` equal to the filename stem (`2026-11-23.json` → `"date": "2026-11-23"`).
- Every item needs at least one `sources` entry with a full `https://` URL.
- Write summaries in English; do not copy paywalled article body text.
- `takeaway` and `correction` are optional strings (omit the keys if unused).

### Other data files

- **`data/key-dates.json`** — upcoming deadlines (past dates are hidden automatically on each briefing page).
- **`data/glossary.json`** — Norwegian terms explained on first occurrence per item (hover/tap via `<abbr title="…">`).
- **`nytt.config.ts`** — site name, tagline, base URL, error-report link, analytics placeholder.

## Deploy on GitHub Pages

1. Create a GitHub repo (e.g. `hamzafer/nytt`) and push this project to `main`.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. On each push to `main`, `.github/workflows/deploy-github-pages.yml` runs `npm ci`, `npm run build`, and publishes the `dist/` folder.

Live URL: **`https://<user>.github.io/<repo>/`** (for this project: `https://hamzafer.github.io/nytt/`).

If the repo name changes, update `basePath` and `siteUrl` in **`nytt.config.ts`** (and keep `astro.config.mjs` in sync).

First deploy may take a few minutes. Use **GitHub Actions** as the Pages source, not “Deploy from branch”.

## Stack

- [Astro](https://astro.build/) static output, TypeScript, Tailwind CSS v4
- Client-side search (`/search-index.json` generated at build)
- RSS at `/feed.xml`