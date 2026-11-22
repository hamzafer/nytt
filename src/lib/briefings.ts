import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Briefing, CategoryId, SearchIndexEntry } from './types';
import { CATEGORIES } from './types';

const BRIEFINGS_DIR = join(process.cwd(), 'content', 'briefings');

function loadBriefingFile(file: string): Briefing {
  const raw = readFileSync(join(BRIEFINGS_DIR, file), 'utf-8');
  const data = JSON.parse(raw) as Briefing;
  if (!data.date) {
    throw new Error(`Briefing ${file} missing date`);
  }
  return data;
}

export function getAllBriefings(): Briefing[] {
  const files = readdirSync(BRIEFINGS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();
  return files.map(loadBriefingFile).sort((a, b) => a.date.localeCompare(b.date));
}

export function getBriefingByDate(date: string): Briefing | undefined {
  return getAllBriefings().find((b) => b.date === date);
}

export function getLatestBriefing(): Briefing {
  const all = getAllBriefings();
  if (all.length === 0) {
    throw new Error('No briefings found in content/briefings/');
  }
  return all[all.length - 1];
}

export function getAdjacentDates(date: string): { prev?: string; next?: string } {
  const dates = getAllBriefings().map((b) => b.date);
  const i = dates.indexOf(date);
  if (i === -1) return {};
  return {
    prev: i > 0 ? dates[i - 1] : undefined,
    next: i < dates.length - 1 ? dates[i + 1] : undefined,
  };
}

const categoryLabel = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;

export function buildSearchIndex(): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [];
  for (const briefing of getAllBriefings()) {
    for (const [catId, items] of Object.entries(briefing.sections)) {
      if (!items) continue;
      const category = catId as CategoryId;
      items.forEach((item, index) => {
        entries.push({
          id: `${briefing.date}-${category}-${index}`,
          date: briefing.date,
          category,
          categoryLabel: categoryLabel(category),
          emoji: item.emoji,
          text: item.text,
          sources: item.sources,
          takeaway: item.takeaway,
        });
      });
    }
  }
  return entries;
}

export function getItemsByCategory(category: CategoryId): SearchIndexEntry[] {
  return buildSearchIndex().filter((e) => e.category === category);
}

export function formatBriefingDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Oslo',
  });
}

export function getCategoryMeta(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)!;
}