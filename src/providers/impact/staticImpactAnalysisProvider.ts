import type { GeneratedImpactAnalysis } from '../../types';
import { validateImpactFeed } from '../../lib/impactFeedValidation';

export const staticImpactAnalysisProvider = {
  async fetchAnalyses(signal?: AbortSignal): Promise<Record<string, GeneratedImpactAnalysis>> {
    const feedUrl = new URL(`${import.meta.env.BASE_URL}impact-analyses.json`, window.location.origin);
    const response = await fetch(feedUrl, { signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`The published AI analysis file is unavailable (HTTP ${response.status}).`);
    const payload: unknown = await response.json();
    return validateImpactFeed(payload).analyses;
  },
};
