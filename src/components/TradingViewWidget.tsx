import { useEffect, useRef, useState } from 'react';

type EmbedKind = 'top-stories' | 'economic-calendar';

const iframeWidgets: Record<EmbedKind, { src: string; href: string; title: string; height: number; config: Record<string, unknown> }> = {
  'top-stories': {
    src: 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js',
    href: 'https://www.tradingview.com/news/top-providers/tradingview/',
    title: 'Top market stories by TradingView',
    height: 465,
    config: { displayMode: 'regular', feedMode: 'all_symbols', colorTheme: 'dark', isTransparent: true, locale: 'en', width: '100%', height: 465 },
  },
  'economic-calendar': {
    src: 'https://s3.tradingview.com/external-embedding/embed-widget-events.js',
    href: 'https://www.tradingview.com/economic-calendar/',
    title: 'Economic calendar by TradingView',
    height: 465,
    config: { colorTheme: 'dark', isTransparent: true, locale: 'en', countryFilter: 'ca,us,eu,gb,jp,cn', importanceFilter: '0,1', width: '100%', height: 465 },
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
    container.replaceChildren();
    const frame = document.createElement('div');
    frame.className = 'tradingview-widget-container__widget';
    frame.style.height = `${widget.height}px`;
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
    script.textContent = JSON.stringify(widget.config);
    script.onerror = () => setFailed(true);
    container.append(frame, credit, script);
    return () => { container.replaceChildren(); };
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
