export const CATEGORIES = ['Canadian news', 'US markets', 'Global economics', 'Business & finance', 'Technology', 'General news'] as const;
export type Category = typeof CATEGORIES[number];
export type DataMode = 'demo' | 'live';
export interface Story { id: string; headline: string; category: Category; source: string; publishedAt: string; description: string; url: string; mode: DataMode; }
export type ImpactClassification = 'Positive' | 'Negative' | 'Mixed' | 'Uncertain';
export type ImpactTimeHorizon = 'Short-term' | 'Medium-term' | 'Long-term';
export interface AffectedCompany {
  name: string;
  ticker: string;
  exchange: string;
  relationship: string;
  classification: ImpactClassification;
  explanation: string;
}
export interface ImpactSource { label: string; url: string; kind: 'supporting' | 'research'; }
export interface MarketImpactAnalysis {
  label: string;
  executiveSummary: string;
  classification: ImpactClassification;
  classificationNote: string;
  companies: AffectedCompany[];
  timeHorizon: ImpactTimeHorizon | null;
  horizonReasoning: string;
  bullishScenario: string;
  bearishScenario: string;
  risks: string[];
  sources: ImpactSource[];
}
export interface Market { name: string; symbol: string; value: string; change: string; positive: boolean; mode: DataMode; provider: string; asOf: string | null; }
export interface SourceResult<T> { data: T; fetchedAt: string; provider: string; mode: DataMode; }
export interface ProviderStatus { loading: boolean; error: string | null; fetchedAt: string | null; provider: string; mode: DataMode; }
export interface NewsProvider { readonly id: string; readonly label: string; fetchStories(signal?: AbortSignal): Promise<Story[]>; }
export interface NewsFeedPayload { generatedAt: string; provider: string; stories: unknown; errors?: string[]; }
export interface MarketDataProvider { readonly id: string; readonly label: string; fetchQuotes(signal?: AbortSignal): Promise<Market[]>; }
export interface AppState { bookmarks: string[]; notes: Record<string, string>; watchlist: string[]; }
