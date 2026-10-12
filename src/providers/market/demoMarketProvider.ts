import { markets } from '../../data/market';
import { validateMarkets } from '../../lib/validation';
import type { MarketDataProvider } from '../contracts';

export const demoMarketProvider: MarketDataProvider = {
  id: 'marketbrief-demo-markets',
  label: 'MarketBrief demo',
  async fetchQuotes() {
    return validateMarkets(markets);
  },
};
