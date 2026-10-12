import type { Market, ProviderStatus } from '../types';
import { TradingViewMarketData } from './TradingViewWidget';

const watchable = [
  { symbol: 'SPX', name: 'S&P 500' },
  { symbol: 'IXIC', name: 'Nasdaq 100 CFD' },
  { symbol: 'GSPTSE', name: 'S&P/TSX Composite' },
  { symbol: 'USDCAD', name: 'USD/CAD' },
  { symbol: 'XAU', name: 'Gold' },
  { symbol: 'WTI', name: 'Crude oil' },
];

export function MarketStrip({ markets, status, watchlist, toggleWatch, widgetFailed, onWidgetFailure }: {
  markets: Market[];
  status: ProviderStatus;
  watchlist: string[];
  toggleWatch: (symbol: string) => void;
  widgetFailed: boolean;
  onWidgetFailure: () => void;
}) {
  const bankOfCanada = markets.find(market => market.provider.toLowerCase().includes('bank of canada'));
  return <section className="market-section" aria-labelledby="markets-title">
    <div className="section-heading"><div><p className="eyebrow">THE PULSE</p><h2 id="markets-title">Market overview</h2></div><span className="demo-label"><i /> TradingView data · delays vary by instrument</span></div>
    <p className="market-caveat">Quote freshness depends on each instrument and exchange. TradingView does not expose a shared update timestamp here; use the widget’s source details. Its permitted US benchmarks here are the S&P 500 index CFD and US 100 (Nasdaq 100) cash CFD; the latter is not the Nasdaq Composite. This is a quick snapshot, not a charting terminal.</p>
    <TradingViewMarketData onFailure={onWidgetFailure}/>
    {bankOfCanada && <div className={`reference-quote ${bankOfCanada.mode}`}><strong>USD/CAD daily reference</strong><span>{bankOfCanada.value} CAD per USD</span><span>{bankOfCanada.mode === 'live' ? `Bank of Canada · rate date ${bankOfCanada.asOf?.slice(0, 10) ?? 'unavailable'}` : 'Demo value · not live'}</span></div>}
    {widgetFailed && <>
      <p className="demo-label fallback-label">Illustrative fallback values · DEMO · NOT LIVE</p>
      <div className="market-grid">{markets.map(market => <article className="market-card" key={market.symbol}>
        <div className="market-card-top"><span className="market-symbol">{market.symbol}</span><button className={`watch-button ${watchlist.includes(market.symbol) ? 'selected' : ''}`} onClick={() => toggleWatch(market.symbol)} aria-label={`${watchlist.includes(market.symbol) ? 'Remove' : 'Add'} ${market.name} ${watchlist.includes(market.symbol) ? 'from' : 'to'} watchlist`} aria-pressed={watchlist.includes(market.symbol)}>{watchlist.includes(market.symbol) ? '★' : '☆'}</button></div>
        <p className="market-name">{market.name}</p><strong className="market-value">{market.value}</strong><span className={`market-change ${market.positive ? 'up' : 'down'}`}>{market.positive ? '▲' : '▼'} {market.change}</span><span className="quote-source demo">DEMO · NOT LIVE</span>
      </article>)}</div>
    </>}
    <div className="watchlist-row"><div><strong>My watchlist</strong><span>Saved on this device · select to add or remove</span></div><div className="watchlist-pills">{watchable.map(item => <button key={item.symbol} className={watchlist.includes(item.symbol) ? 'selected' : ''} onClick={() => toggleWatch(item.symbol)} aria-pressed={watchlist.includes(item.symbol)}>{watchlist.includes(item.symbol) ? '★' : '☆'} {item.name}</button>)}</div></div>
    {status.error && <div className="source-error" role="status">Bank of Canada daily reference unavailable: {status.error}. The widget’s USD/CAD may still load separately.</div>}
  </section>;
}
