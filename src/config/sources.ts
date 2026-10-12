/** Public source settings only. Never put private API keys in a Vite frontend. */
export const sourceConfig = {
  news: { mode: 'demo' as const, label: 'MarketBrief demo' },
  market: { mode: 'mixed' as const, labels: ['Bank of Canada Valet', 'MarketBrief demo'] },
  timeoutMs: 9000,
};
