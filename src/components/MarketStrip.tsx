import { markets } from '../data/market';

export function MarketStrip({ watchlist, toggleWatch }: { watchlist: string[]; toggleWatch: (symbol: string) => void }) {
  return <section className="market-section" aria-labelledby="markets-title">
    <div className="section-heading"><div><p className="eyebrow">THE PULSE</p><h2 id="markets-title">Market overview</h2></div><span className="demo-label"><i /> Illustrative demo values · not live</span></div>
    <div className="market-grid">{markets.map(market => <article className="market-card" key={market.symbol}>
      <div className="market-card-top"><span className="market-symbol">{market.symbol}</span><button className={`watch-button ${watchlist.includes(market.symbol) ? 'selected' : ''}`} onClick={() => toggleWatch(market.symbol)} aria-label={`${watchlist.includes(market.symbol) ? 'Remove' : 'Add'} ${market.name} ${watchlist.includes(market.symbol) ? 'from' : 'to'} watchlist`} aria-pressed={watchlist.includes(market.symbol)}>{watchlist.includes(market.symbol) ? '★' : '☆'}</button></div>
      <p className="market-name">{market.name}</p><strong className="market-value">{market.value}</strong><span className={`market-change ${market.positive ? 'up' : 'down'}`}>{market.positive ? '▲' : '▼'} {market.change}</span>
    </article>)}</div>
  </section>;
}
