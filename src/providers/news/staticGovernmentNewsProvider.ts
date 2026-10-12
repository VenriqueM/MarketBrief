import { validateStories } from '../../lib/validation';
import type { NewsFeedPayload, NewsProvider, Story } from '../../types';

export const staticGovernmentNewsProvider: NewsProvider = {
  id: 'government-of-canada-static-feed',
  label: 'Official Government of Canada feeds',
  async fetchStories(signal?: AbortSignal): Promise<Story[]> {
    const feedUrl = new URL(`${import.meta.env.BASE_URL}news.json`, window.location.origin);
    const response = await fetch(feedUrl, { signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`The latest official news feed is unavailable (HTTP ${response.status}).`);
    const payload: unknown = await response.json();
    if (typeof payload !== 'object' || payload === null || !('stories' in payload)) {
      throw new Error('The official news feed returned an unexpected response.');
    }
    const feed = payload as NewsFeedPayload;
    const stories = validateStories(feed.stories);
    if (stories.length === 0) throw new Error('Official news feeds could not be reached during the latest refresh.');
    return stories;
  },
};
