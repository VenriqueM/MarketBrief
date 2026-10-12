export const CATEGORIES = ['Canadian news', 'US markets', 'Global economics', 'Business & finance', 'Technology', 'General news'] as const;
export type Category = typeof CATEGORIES[number];
export type DataMode = 'demo' | 'live';
export interface Story { id: string; headline: string; category: Category; source: string; publishedAt: string; description: string; url: string; mode: DataMode; }
export interface Market { name: string; symbol: string; value: string; change: string; positive: boolean; mode: DataMode; provider: string; asOf: string | null; }
export interface SourceResult<T> { data: T; fetchedAt: string; provider: string; mode: DataMode; }
export interface ProviderStatus { loading: boolean; error: string | null; fetchedAt: string | null; provider: string; mode: DataMode; }
export interface NewsProvider { readonly id: string; readonly label: string; fetchStories(signal?: AbortSignal): Promise<Story[]>; }
export interface MarketDataProvider { readonly id: string; readonly label: string; fetchQuotes(signal?: AbortSignal): Promise<Market[]>; }
export interface AppState { bookmarks: string[]; notes: Record<string, string>; watchlist: string[]; }
