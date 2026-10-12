/** Public source settings only. Never put private API keys in a Vite frontend. */
export const sourceConfig = {
  news: { mode: 'mixed' as const, label: 'Official Government of Canada RSS/Atom feeds' },
  market: { mode: 'mixed' as const, labels: ['Bank of Canada Valet', 'MarketBrief demo'] },
  timeoutMs: 9000,
};
