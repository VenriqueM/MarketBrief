import { isRecord } from '../../lib/validation';
import type { Market, MarketDataProvider } from '../../types';
import { demoMarketProvider } from './demoMarketProvider';

const apiUrl = 'https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=2';

/** Daily Bank of Canada reference rate; deliberately not described as an intraday quote. */
export const bankOfCanadaProvider: MarketDataProvider = {
  id: 'bank-of-canada-valet',
  label: 'Bank of Canada Valet',
  async fetchQuotes(signal) {
    const response = await fetch(apiUrl, { signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Bank of Canada request failed (${response.status}).`);
    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.observations)) throw new Error('Bank of Canada response did not contain observations.');
    const observations = payload.observations.filter((item): item is { d: string; FXUSDCAD: { v: string } } => isRecord(item)
      && typeof item.d === 'string' && isRecord(item.FXUSDCAD) && typeof item.FXUSDCAD.v === 'string'
      && Number.isFinite(Number(item.FXUSDCAD.v)));
    const current = observations.at(-1);
    if (!current) throw new Error('No valid USD/CAD observation was returned.');
    const previous = observations.at(-2);
    const value = Number((current.FXUSDCAD as { v: string }).v);
    const priorValue = previous && isRecord(previous.FXUSDCAD) ? Number(previous.FXUSDCAD.v) : value;
    const pctChange = priorValue ? ((value - priorValue) / priorValue) * 100 : 0;
    const quote: Market = {
      name: 'USD / CAD', symbol: 'USDCAD', value: value.toFixed(4),
      change: `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(2)}%`, positive: pctChange >= 0,
      mode: 'live', provider: 'Bank of Canada · daily reference rate', asOf: current.d,
    };
    const demo = await demoMarketProvider.fetchQuotes();
    return demo.map(item => item.symbol === quote.symbol ? quote : item);
  },
};
