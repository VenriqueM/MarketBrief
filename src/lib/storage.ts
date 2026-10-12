import type { AppState } from '../types';

const KEY = 'marketbrief.v1';
const initial: AppState = { bookmarks: [], notes: {}, watchlist: ['SPX', 'USDCAD'] };
export function loadState(): AppState {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!value || typeof value !== 'object') return initial;
    const data = value as Partial<AppState>;
    return {
      bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks.filter((x): x is string => typeof x === 'string') : initial.bookmarks,
      notes: data.notes && typeof data.notes === 'object' ? data.notes as Record<string, string> : initial.notes,
      watchlist: Array.isArray(data.watchlist) ? data.watchlist.filter((x): x is string => typeof x === 'string') : initial.watchlist,
    };
  } catch { return initial; }
}
export function saveState(state: AppState): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}
