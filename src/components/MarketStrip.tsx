import type { Market, ProviderStatus } from '../types';

export function MarketStrip({ markets, status, watchlist, toggleWatch }: { markets: Market[]; status: ProviderStatus; watchlist: string[]; toggleWatch: (symbol: string) => void }) {
  return <section className="market-section" aria-labelledby="markets-title">
    <div className="section-heading"><div><p className="eyebrow">THE PULSE</p><h2 id="markets-title">Market overview</h2></div><span className="demo-label"><i /> {status.loading ? 'Loading sources…' : status.error ? 'Live source unavailable · demo fallback' : 'Each card is labelled by source'}</span></div>
    {status.error && <div className="source-error" role="status">Could not load the daily Bank of Canada rate ({status.error}). Demo market values are shown as fallback.</div>}
    <div className="market-grid">{markets.map(market => <article className="market-card" key={market.symbol}>
      <div className="market-card-top"><span className="market-symbol">{market.symbol}</span><button className={`watch-button ${watchlist.includes(market.symbol) ? 'selected' : ''}`} onClick={() => toggleWatch(market.symbol)} aria-label={`${watchlist.includes(market.symbol) ? 'Remove' : 'Add'} ${market.name} ${watchlist.includes(market.symbol) ? 'from' : 'to'} watchlist`} aria-pressed={watchlist.includes(market.symbol)}>{watchlist.includes(market.symbol) ? '★' : '☆'}</button></div>
      <p className="market-name">{market.name}</p><strong className="market-value">{market.value}</strong><span className={`market-change ${market.positive ? 'up' : 'down'}`}>{market.positive ? '▲' : '▼'} {market.change}</span>
      <span className={`quote-source ${market.mode}`}>{market.mode === 'live' ? 'DAILY REFERENCE' : 'DEMO · NOT LIVE'}</span>
      {market.asOf && <time className="quote-time" dateTime={market.asOf}>{market.mode === 'live' ? `Rate date ${market.asOf.slice(0, 10)}` : new Date(market.asOf).toLocaleString()}</time>}
    </article>)}</div>
  </section>;
}
