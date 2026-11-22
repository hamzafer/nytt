/** Site metadata — change name and URLs here. */
export const nyttConfig = {
  name: 'nytt',
  tagline: 'Norway news for internationals, every morning',
  /** Full site URL without trailing slash (GitHub Pages project site). */
  siteUrl: 'https://hamzafer.github.io',
  /** Must match `base` in astro.config.mjs (no trailing slash). */
  basePath: '/nytt',
  owner: 'Hamza',
  locale: 'en-GB',
  timezone: 'Europe/Oslo',
  reportError: {
    /** `mailto` or `github` */
    type: 'github' as const,
    href: 'https://github.com/hamzafer/nytt/issues/new?labels=correction&title=Briefing%20correction',
    label: 'Spotted an error?',
  },
  analytics: {
    enabled: false,
    /** e.g. plausible, umami — wire up in Layout when enabled */
    provider: 'plausible',
    scriptUrl: '',
    domain: '',
  },
} as const;