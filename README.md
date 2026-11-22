# nytt

Norway news in English for people who moved here. A new briefing goes up every morning at [hamzafer.github.io/nytt](https://hamzafer.github.io/nytt/).

Each briefing is a short list of stories sorted into five sections (big news, what's changing, Oslo, be aware, fun and free). Every story links to its Norwegian sources, and some add a line on what it means for you. The site also has an archive, a page per section, search, upcoming deadlines and an RSS feed.

## How a day gets published

A scheduled job writes one JSON file per morning to `content/briefings/YYYY-MM-DD.json` and pushes it to `main`. The push triggers `.github/workflows/deploy-github-pages.yml`, which builds the site and publishes it to GitHub Pages in under a minute. Nothing else needs to change, so you can also add a day by hand the same way.

## Run locally

```bash
npm ci
npm run dev
```

To check the production build with the same `/nytt/` base path as GitHub Pages:

```bash
npm run build
npm run preview
```

## Briefing format

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

Leave a section out, or as `[]`, when it has no stories. The keys map to these headings:

| Key | Heading |
|-----|---------|
| `big-news` | Big news |
| `whats-changing` | What's changing |
| `oslo` | Oslo |
| `be-aware` | Be aware |
| `fun-and-free` | Fun and free |

Each story looks like this:

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

Rules for anything that writes these files:

- `date` must match the filename (`2026-11-23.json` has `"date": "2026-11-23"`).
- Every story needs at least one source with a full `https://` URL.
- Write the summaries in English and in your own words. Don't copy paywalled article text.
- `takeaway` and `correction` are optional. Leave the keys out when you don't use them.

## Other files you might edit

- `data/key-dates.json` holds upcoming deadlines for the "Coming up" panel. Each briefing shows up to six, counting from its own date, so an old briefing still lists the deadlines that were ahead of it then.
- `data/glossary.json` holds Norwegian terms. The first mention in each story gets a dotted underline, and hovering over it shows the meaning (a native tooltip, so most phones won't show it on tap).
- `nytt.config.ts` sets the site name, tagline, URLs, the "Report an error" link and optional analytics (off by default).

## Deploying

GitHub Pages must use **GitHub Actions** as its source (Settings, Pages, Build and deployment), not "Deploy from branch". If the repo is renamed, update `basePath` and the `reportError` link in `nytt.config.ts`. `astro.config.mjs` reads the base path from there.

## Stack

- [Astro](https://astro.build/) (static output), TypeScript and Tailwind CSS v4
- Schibsted Grotesk for all type
- Search runs in the browser from `/search-index.json`, built with the site
- RSS at `/feed.xml`
