export const CATEGORIES = [
  { id: 'big-news', label: 'Big news', emoji: '📰', color: 'coral' },
  { id: 'whats-changing', label: "What's changing", emoji: '🔄', color: 'amber' },
  { id: 'oslo', label: 'Oslo', emoji: '🏙️', color: 'fjord' },
  { id: 'be-aware', label: 'Be aware', emoji: '⚠️', color: 'rust' },
  { id: 'fun-and-free', label: 'Fun and free', emoji: '🎉', color: 'mint' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export interface SourceLink {
  label: string;
  url: string;
}

export interface BriefingItem {
  emoji: string;
  text: string;
  sources: SourceLink[];
  takeaway?: string;
  correction?: string;
}

export type BriefingSections = Partial<Record<CategoryId, BriefingItem[]>>;

export interface Briefing {
  date: string;
  title?: string;
  intro?: string;
  sections: BriefingSections;
}

export interface KeyDate {
  date: string;
  label: string;
  detail?: string;
}

export type Glossary = Record<string, string>;

export interface SearchIndexEntry {
  id: string;
  date: string;
  category: CategoryId;
  categoryLabel: string;
  emoji: string;
  text: string;
  sources: SourceLink[];
  takeaway?: string;
}