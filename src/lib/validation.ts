import { CATEGORIES, type Market, type Story } from '../types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isValidStory(value: unknown): value is Story {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && typeof value.headline === 'string' && value.headline.trim().length > 0
    && typeof value.category === 'string' && (CATEGORIES as readonly string[]).includes(value.category) && typeof value.source === 'string'
    && typeof value.description === 'string' && typeof value.url === 'string'
    && Number.isFinite(Date.parse(String(value.publishedAt)))
    && (value.mode === 'live' || value.mode === 'demo');
}

export function isValidMarket(value: unknown): value is Market {
  if (!isRecord(value)) return false;
  return typeof value.name === 'string' && typeof value.symbol === 'string' && typeof value.value === 'string'
    && typeof value.change === 'string' && typeof value.positive === 'boolean'
    && (value.mode === 'live' || value.mode === 'demo') && typeof value.provider === 'string'
    && (value.asOf === null || Number.isFinite(Date.parse(String(value.asOf))));
}

export function validateStories(value: unknown): Story[] {
  if (!Array.isArray(value) || !value.every(isValidStory)) throw new Error('News source returned invalid story data.');
  return value;
}

export function validateMarkets(value: unknown): Market[] {
  if (!Array.isArray(value) || !value.every(isValidMarket)) throw new Error('Market source returned invalid quote data.');
  return value;
}
