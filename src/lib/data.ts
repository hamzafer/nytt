import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Glossary, KeyDate } from './types';

export function getKeyDates(): KeyDate[] {
  const raw = readFileSync(join(process.cwd(), 'data', 'key-dates.json'), 'utf-8');
  return JSON.parse(raw) as KeyDate[];
}

export function getUpcomingKeyDates(todayIso: string): KeyDate[] {
  return getKeyDates()
    .filter((d) => d.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getGlossary(): Glossary {
  const raw = readFileSync(join(process.cwd(), 'data', 'glossary.json'), 'utf-8');
  return JSON.parse(raw) as Glossary;
}

export function withBase(path: string, base: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const baseTrim = base.endsWith('/') ? base.slice(0, -1) : base;
  if (normalized === '/') return `${baseTrim}/`;
  return `${baseTrim}${normalized}`;
}