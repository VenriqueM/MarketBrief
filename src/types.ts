export const CATEGORIES = ['Canadian news', 'US markets', 'Global economics', 'Business & finance', 'Technology', 'General news'] as const;
export type Category = typeof CATEGORIES[number];
export interface Story { id: string; headline: string; category: Category; source: string; publishedAt: string; description: string; url: string; }
export interface Market { name: string; symbol: string; value: string; change: string; positive: boolean; }
export interface AppState { bookmarks: string[]; notes: Record<string, string>; watchlist: string[]; }
