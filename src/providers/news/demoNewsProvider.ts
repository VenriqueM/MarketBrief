import { stories } from '../../data/stories';
import { validateStories } from '../../lib/validation';
import type { NewsProvider } from '../contracts';

export const demoNewsProvider: NewsProvider = {
  id: 'marketbrief-demo-news',
  label: 'MarketBrief demo',
  async fetchStories() {
    return validateStories(stories);
  },
};
