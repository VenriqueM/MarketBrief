import { useEffect, useMemo, useRef, useState } from 'react';
import { MarketStrip } from './components/MarketStrip';
import { StoryCard } from './components/StoryCard';
import { ResearchCaseStudy } from './components/ResearchCaseStudy';
import { TradingViewIframeWidget, TradingViewTickerTape } from './components/TradingViewWidget';
import { loadState, saveState } from './lib/storage';
import { CATEGORIES } from './types';
import type { AppState, Category, GeneratedImpactAnalysis, Market, ProviderStatus, Story } from './types';
import { sourceConfig } from './config/sources';
import { demoNewsProvider } from './providers/news/demoNewsProvider';
import { staticGovernmentNewsProvider } from './providers/news/staticGovernmentNewsProvider';
import { bankOfCanadaProvider } from './providers/market/bankOfCanadaProvider';
import { demoMarketProvider } from './providers/market/demoMarketProvider';
import { staticImpactAnalysisProvider } from './providers/impact/staticImpactAnalysisProvider';

const initialStatus: ProviderStatus = { loading: true, error: null, fetchedAt: null, provider: 'Starting', mode: 'demo' };

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [stories, setStories] = useState<Story[]>([]);
  const [aiAnalyses, setAiAnalyses] = useState<Record<string, GeneratedImpactAnalysis>>({});
  const [markets, setMarkets] = useState<Market[]>([]);
  const [newsStatus, setNewsStatus] = useState<ProviderStatus>(initialStatus);
  const [marketStatus, setMarketStatus] = useState<ProviderStatus>(initialStatus);
  const [category, setCategory] = useState<Category | 'All stories'>('All stories');
  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [storageNotice, setStorageNotice] = useState(false);
  const [marketWidgetFailed, setMarketWidgetFailed] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setStorageNotice(!saveState(state)); }, [state]);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), sourceConfig.timeoutMs);
    const load = async () => {
      try {
        const data = await staticGovernmentNewsProvider.fetchStories(controller.signal);
        setStories(data);
        setNewsStatus({ loading: false, error: null, fetchedAt: new Date().toISOString(), provider: staticGovernmentNewsProvider.label, mode: 'live' });
      } catch (error) {
        try {
          const fallback = await demoNewsProvider.fetchStories();
          setStories(fallback);
        } catch {
          setStories([]);
        }
        const reason = error instanceof SyntaxError ? 'The official news data could not be read.' : error instanceof Error ? error.message : 'The official news feed is unavailable.';
        setNewsStatus({ loading: false, error: `${reason} Showing clearly labelled demo stories instead.`, fetchedAt: null, provider: demoNewsProvider.label, mode: 'demo' });
      }
      try {
        const data = await bankOfCanadaProvider.fetchQuotes(controller.signal);
        setMarkets(data);
        setMarketStatus({ loading: false, error: null, fetchedAt: new Date().toISOString(), provider: bankOfCanadaProvider.label, mode: 'live' });
      } catch (error) {
        const fallback = await demoMarketProvider.fetchQuotes();
        setMarkets(fallback);
        setMarketStatus({ loading: false, error: error instanceof Error ? error.message : 'Live market source unavailable.', fetchedAt: new Date().toISOString(), provider: demoMarketProvider.label, mode: 'demo' });
      }
    };
    void load();
    void staticImpactAnalysisProvider.fetchAnalyses(controller.signal)
      .then(setAiAnalyses)
      .catch(() => setAiAnalyses({}));
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const shortToday = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }).toUpperCase();
  const filtered = useMemo(() => stories.filter(story => {
    const matchesCategory = category === 'All stories' || story.category === category;
    const text = `${story.headline} ${story.description} ${story.source} ${story.category}`.toLowerCase();
    return matchesCategory && text.includes(query.toLowerCase()) && (!savedOnly || state.bookmarks.includes(story.id));
  }).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)), [stories, category, query, savedOnly, state.bookmarks]);
  const update = (partial: Partial<AppState>) => setState(current => ({ ...current, ...partial }));
  const toggleBookmark = (id: string) => update({ bookmarks: state.bookmarks.includes(id) ? state.bookmarks.filter(item => item !== id) : [...state.bookmarks, id] });
  const toggleWatch = (symbol: string) => update({ watchlist: state.watchlist.includes(symbol) ? state.watchlist.filter(item => item !== symbol) : [...state.watchlist, symbol] });
  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#top"><span className="brand-icon">M<span>·</span></span><span>Market<span>Brief</span></span></a><div className="side-label">WORKSPACE</div><nav className="side-nav" aria-label="Dashboard sections"><a className="nav-link" href="#markets">◫ <span>Market overview</span></a><a className="nav-link current" href="#news">▤ <span>News feed</span></a><button className="nav-link" onClick={() => setSavedOnly(!savedOnly)} aria-pressed={savedOnly}>☆ <span>Saved research</span><b>{state.bookmarks.length}</b></button></nav><div className="sidebar-bottom"><div className="local-card"><span className="local-dot"/><div><strong>Local workspace</strong><small>Saved in this browser</small></div></div><p>Notes and bookmarks stay on this device. They do not sync between devices.</p></div></aside>
    <main id="top" className="main"><header className="topbar"><div className="mobile-brand"><span className="brand-icon">M<span>·</span></span> MarketBrief</div><div className="topbar-right"><span className="demo-pill"><i/> {newsStatus.loading ? 'UPDATING FEED' : newsStatus.mode === 'live' ? 'OFFICIAL NEWS' : 'DEMO CONTENT'}</span><span className="date-label">{shortToday}</span><span className="avatar" aria-hidden="true">MB</span></div></header><TradingViewTickerTape /><nav className="mobile-nav" aria-label="Dashboard sections"><a href="#news">Briefing</a><a href="#markets">Markets</a><button onClick={() => setSavedOnly(!savedOnly)} aria-pressed={savedOnly}>☆ Saved <span>{state.bookmarks.length}</span></button></nav>
      <div className="content"><div className="welcome"><div><p className="eyebrow">{today.toUpperCase()}</p><h1>Markets, in focus.</h1><p className="welcome-sub">A quick read on Canadian, US and global markets, news, and economic events.</p></div><span className="session-status"><i/> THIRD-PARTY WIDGETS</span></div>
        <div className="alert-banner"><span className="alert-mark">!</span><span><strong>Data freshness varies by source.</strong> TradingView labels delays where available; its timestamps are instrument-specific. The Bank of Canada USD/CAD reference is daily, not an intraday quote.</span></div>
        <section id="news" className="news-section"><div className="section-heading news-heading"><div><p className="eyebrow">LATEST INTELLIGENCE</p><h2>{savedOnly ? 'Saved research' : 'The briefing'}</h2></div><span className="story-count">{filtered.length} STORIES</span></div>
          <div className="feed-controls"><label className="search-box"><span aria-hidden="true">⌕</span><input ref={searchRef} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search headlines and topics…" aria-label="Search headlines and topics"/><kbd>⌘ K</kbd></label><label className="select-wrap"><span className="sr-only">Filter by category</span><select value={category} onChange={event => setCategory(event.target.value as Category | 'All stories')}><option>All stories</option>{CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></label></div>
          <div className="category-pills" aria-label="Filter categories"><button className={category === 'All stories' ? 'chosen' : ''} onClick={() => setCategory('All stories')}>All</button>{CATEGORIES.map(item => <button key={item} className={category === item ? 'chosen' : ''} onClick={() => setCategory(category === item ? 'All stories' : item)}>{item}</button>)}</div>
          {newsStatus.error && <div className="source-error" role="status">{newsStatus.error}</div>}
          {newsStatus.loading && <div className="empty-state" role="status">Loading the latest briefing…</div>}
          <div className="story-list">{filtered.map(story => <StoryCard key={story.id} story={story} bookmarked={state.bookmarks.includes(story.id)} note={state.notes[story.id] || ''} onBookmark={() => toggleBookmark(story.id)} onNote={value => update({ notes: { ...state.notes, [story.id]: value } })} analysis={story.mode === 'live' ? aiAnalyses[story.id]?.analysis ?? null : undefined}/>)}</div>
          {filtered.length === 0 && <div className="empty-state"><span>⌕</span><h3>No stories found</h3><p>Try a different search or clear your filters to see the full demo feed.</p><button onClick={() => { setQuery(''); setCategory('All stories'); setSavedOnly(false); }}>Clear filters</button></div>}
          <div className="feed-footnote">{newsStatus.mode === 'demo' ? 'Fictional demo stories only. Their links are disabled.' : <>Official Government of Canada material reproduced for non-commercial use under <a href="https://www.canada.ca/en/transparency/terms.html" target="_blank" rel="noreferrer">Canada.ca terms</a>. Headlines and descriptions are copied from source feeds, linked to the original, and do not imply government endorsement. GitHub refreshes feeds hourly; news coverage is limited to these official Canadian sources.</>}</div>
        </section>
        <ResearchCaseStudy />
        <div id="markets"><MarketStrip markets={markets} status={marketStatus} watchlist={state.watchlist} toggleWatch={toggleWatch} widgetFailed={marketWidgetFailed} onWidgetFailure={() => setMarketWidgetFailed(true)}/></div>
        <section className="intel-grid" aria-label="Market news and upcoming economic events">
          <article className="intel-panel"><div className="section-heading"><div><p className="eyebrow">MARKET MOVERS</p><h2>Top stories</h2></div><span className="widget-source">TRADINGVIEW</span></div><p className="panel-note">Market stories from TradingView. Story times are supplied by the provider.</p><TradingViewIframeWidget kind="top-stories"/></article>
          <article className="intel-panel"><div className="section-heading"><div><p className="eyebrow">WHAT’S AHEAD</p><h2>Economic events</h2></div><span className="widget-source">TRADINGVIEW</span></div><p className="panel-note">Canada, US, Europe, UK, Japan, and China · times shown by TradingView.</p><TradingViewIframeWidget kind="economic-calendar"/></article>
        </section>
        {storageNotice && <div className="storage-error" role="status">Browser storage is unavailable or full. Your latest change may not persist after closing this tab.</div>}
        <p className="tradingview-link"><a href="https://www.tradingview.com/chart/" target="_blank" rel="noreferrer">Open TradingView for detailed charts and calculations ↗</a></p>
        <footer>MARKETBRIEF <span>·</span> TradingView market/news/calendar widgets <span>·</span> {newsStatus.mode === 'live' ? 'Official Canadian releases' : 'News demo content'}</footer>
      </div>
    </main>
  </div>;
}
