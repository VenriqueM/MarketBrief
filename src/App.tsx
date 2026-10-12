import { useEffect, useMemo, useRef, useState } from 'react';
import { MarketStrip } from './components/MarketStrip';
import { StoryCard } from './components/StoryCard';
import { stories } from './data/stories';
import { loadState, saveState } from './lib/storage';
import { CATEGORIES } from './types';
import type { AppState, Category } from './types';

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [category, setCategory] = useState<Category | 'All stories'>('All stories');
  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [storageNotice, setStorageNotice] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setStorageNotice(!saveState(state)); }, [state]);
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
  }).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)), [category, query, savedOnly, state.bookmarks]);
  const update = (partial: Partial<AppState>) => setState(current => ({ ...current, ...partial }));
  const toggleBookmark = (id: string) => update({ bookmarks: state.bookmarks.includes(id) ? state.bookmarks.filter(item => item !== id) : [...state.bookmarks, id] });
  const toggleWatch = (symbol: string) => update({ watchlist: state.watchlist.includes(symbol) ? state.watchlist.filter(item => item !== symbol) : [...state.watchlist, symbol] });
  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#top"><span className="brand-icon">M<span>·</span></span><span>Market<span>Brief</span></span></a><div className="side-label">WORKSPACE</div><nav className="side-nav" aria-label="Dashboard sections"><a className="nav-link current" href="#markets">◫ <span>Market overview</span></a><a className="nav-link" href="#news">▤ <span>News feed</span></a><button className="nav-link" onClick={() => setSavedOnly(!savedOnly)} aria-pressed={savedOnly}>☆ <span>Saved research</span><b>{state.bookmarks.length}</b></button></nav><div className="sidebar-bottom"><div className="local-card"><span className="local-dot"/><div><strong>Local workspace</strong><small>Saved in this browser</small></div></div><p>Notes and bookmarks stay on this device. They do not sync between devices.</p></div></aside>
    <main id="top" className="main"><header className="topbar"><div className="mobile-brand"><span className="brand-icon">M<span>·</span></span> MarketBrief</div><div className="topbar-right"><span className="demo-pill"><i/> DEMO CONTENT</span><span className="date-label">{shortToday}</span><span className="avatar" aria-hidden="true">MB</span></div></header>
      <div className="content"><div className="welcome"><div><p className="eyebrow">{today.toUpperCase()}</p><h1>Markets, in focus.</h1><p className="welcome-sub">A clear read on the stories moving business and the economy.</p></div><span className="session-status"><i/> DEMO SESSION</span></div>
        <div className="alert-banner"><span className="alert-mark">!</span><span><strong>Illustrative demo only.</strong> Market figures are fictional examples and not live prices. Every story is fictional sample content, not real reporting.</span></div>
        <div id="markets"><MarketStrip watchlist={state.watchlist} toggleWatch={toggleWatch}/></div>
        <section id="news" className="news-section"><div className="section-heading news-heading"><div><p className="eyebrow">LATEST INTELLIGENCE</p><h2>{savedOnly ? 'Saved research' : 'The briefing'}</h2></div><span className="story-count">{filtered.length} STORIES</span></div>
          <div className="feed-controls"><label className="search-box"><span aria-hidden="true">⌕</span><input ref={searchRef} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search headlines and topics…" aria-label="Search headlines and topics"/><kbd>⌘ K</kbd></label><label className="select-wrap"><span className="sr-only">Filter by category</span><select value={category} onChange={event => setCategory(event.target.value as Category | 'All stories')}><option>All stories</option>{CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></label></div>
          <div className="category-pills" aria-label="Filter categories"><button className={category === 'All stories' ? 'chosen' : ''} onClick={() => setCategory('All stories')}>All</button>{CATEGORIES.map(item => <button key={item} className={category === item ? 'chosen' : ''} onClick={() => setCategory(category === item ? 'All stories' : item)}>{item}</button>)}</div>
          <div className="story-list">{filtered.map(story => <StoryCard key={story.id} story={story} bookmarked={state.bookmarks.includes(story.id)} note={state.notes[story.id] || ''} onBookmark={() => toggleBookmark(story.id)} onNote={value => update({ notes: { ...state.notes, [story.id]: value } })}/>)}</div>
          {filtered.length === 0 && <div className="empty-state"><span>⌕</span><h3>No stories found</h3><p>Try a different search or clear your filters to see the full demo feed.</p><button onClick={() => { setQuery(''); setCategory('All stories'); setSavedOnly(false); }}>Clear filters</button></div>}
          <div className="feed-footnote">You’re viewing fictional interface examples. Story links are intentionally disabled until a real editorial source is configured.</div>
        </section>
        {storageNotice && <div className="storage-error" role="status">Browser storage is unavailable or full. Your latest change may not persist after closing this tab.</div>}
        <footer>MARKETBRIEF <span>·</span> An independent demo dashboard <span>·</span> No live market data connected</footer>
      </div>
    </main>
  </div>;
}
