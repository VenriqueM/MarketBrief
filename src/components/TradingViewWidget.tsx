import { useEffect, useRef, useState } from 'react';

type EmbedKind = 'top-stories' | 'economic-calendar';

const tickerSymbols = [
  { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500 CFD' },
  { proName: 'FOREXCOM:NSXUSD', title: 'US 100 CFD' },
  { proName: 'TSX:TSX', title: 'S&P/TSX Composite' },
  { proName: 'FX:USDCAD', title: 'USD/CAD' },
  { proName: 'TVC:GOLD', title: 'Gold' },
  { proName: 'TVC:USOIL', title: 'WTI crude oil' },
];

export function TradingViewTickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.textContent = JSON.stringify({
      symbols: tickerSymbols,
      colorTheme: 'dark',
      isTransparent: false,
      backgroundColor: '#141619',
      showSymbolLogo: false,
      displayMode: 'adaptive',
      locale: 'en',
      width: '100%',
    });
    script.onerror = () => setFailed(true);

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    const credit = document.createElement('div');
    credit.className = 'tradingview-widget-copyright';
    const link = document.createElement('a');
    link.href = 'https://www.tradingview.com/markets/';
    link.target = '_blank';
    link.rel = 'noopener nofollow noreferrer';
    link.textContent = 'Market data';
    credit.append(link, document.createTextNode(' by TradingView'));
    container.replaceChildren(widget, credit, script);

    return () => container.replaceChildren();
  }, []);

  return <div className={`ticker-bar ${failed ? 'failed' : ''}`} aria-label="Market data ticker">
    <div className="ticker-widget tradingview-widget-container" ref={containerRef} aria-label="TradingView market ticker">
      <span className="ticker-loading">Loading market quotes…</span>
    </div>
    {failed && <span className="ticker-error" role="status">Quotes unavailable · <a href="https://www.tradingview.com/markets/" target="_blank" rel="noopener noreferrer">open markets</a></span>}
  </div>;
}

const iframeWidgets: Record<EmbedKind, { src: string; href: string; title: string; config: Record<string, unknown> }> = {
  'top-stories': {
    src: 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js',
    href: 'https://www.tradingview.com/news/top-providers/tradingview/',
    title: 'Top market stories by TradingView',
    config: { displayMode: 'adaptive', feedMode: 'all_symbols', colorTheme: 'dark', isTransparent: true, locale: 'en', width: '100%' },
  },
  'economic-calendar': {
    src: 'https://s3.tradingview.com/external-embedding/embed-widget-events.js',
    href: 'https://www.tradingview.com/economic-calendar/',
    title: 'Economic calendar by TradingView',
    config: { colorTheme: 'dark', isTransparent: true, locale: 'en', countryFilter: 'ca,us,eu,gb,jp,cn', importanceFilter: '0,1', width: '100%' },
  },
};

export function TradingViewIframeWidget({ kind }: { kind: EmbedKind }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const widget = iframeWidgets[kind];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setFailed(false);
    let renderedHeight = 0;
    const render = () => {
      const width = container.clientWidth;
      if (!width) return;
      const height = width < 480 ? 400 : width < 720 ? 440 : width < 1000 ? 480 : 500;
      if (height === renderedHeight) return;
      renderedHeight = height;
      container.replaceChildren();
      const credit = document.createElement('div');
      credit.className = 'tradingview-widget-copyright';
      const link = document.createElement('a');
      link.href = widget.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = kind === 'top-stories' ? 'Top stories' : 'Economic Calendar';
      credit.append(link, document.createTextNode(' by TradingView'));
      const script = document.createElement('script');
      script.src = widget.src;
      script.async = true;
      script.type = 'text/javascript';
      script.textContent = JSON.stringify({ ...widget.config, height });
      script.onerror = () => setFailed(true);
      container.append(script, credit);
    };
    const observer = new ResizeObserver(render);
    observer.observe(container);
    render();
    return () => { observer.disconnect(); container.replaceChildren(); };
  }, [kind, widget]);

  return <div className="tv-embed" ref={containerRef} aria-label={widget.title}>
    {failed && <div className="tv-fallback" role="status">TradingView could not load this widget. <a href={widget.href} target="_blank" rel="noreferrer">Open it on TradingView</a>.</div>}
  </div>;
}

const marketSectors = [
  { sectionName: 'US & Canada benchmarks', symbols: ['FOREXCOM:SPXUSD', 'FOREXCOM:NSXUSD', 'TSX:TSX'] },
  { sectionName: 'FX & commodities', symbols: ['FX:USDCAD', 'TVC:GOLD', 'TVC:USOIL'] },
  { sectionName: 'Global indices', symbols: ['INDEX:NKY', 'INDEX:DEU40', 'FOREXCOM:UKXGBP'] },
];

export function TradingViewMarketData({ onFailure }: { onFailure: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onFailureRef = useRef(onFailure);
  onFailureRef.current = onFailure;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setFailed(false);
    container.replaceChildren();
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://widgets.tradingview-widget.com/w/en/tv-market-data.js';
    script.onerror = () => { setFailed(true); onFailureRef.current(); };
    const widget = document.createElement('tv-market-data');
    widget.setAttribute('theme', 'dark');
    widget.setAttribute('symbol-sectors', JSON.stringify(marketSectors));
    container.append(script, widget);
    return () => { container.replaceChildren(); };
  }, []);
  return <div className="tv-market-frame">
    <div ref={containerRef} className="tv-market-widget" aria-label="Market data supplied by TradingView" />
    {failed && <p className="tv-fallback" role="status">The TradingView market widget could not be loaded. <a href="https://www.tradingview.com/markets/" target="_blank" rel="noreferrer">Open TradingView markets</a>. Any demo cards below are illustrative only.</p>}
  </div>;
}
