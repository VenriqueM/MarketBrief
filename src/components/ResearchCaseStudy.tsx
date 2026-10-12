import { useId, useState } from 'react';
import { lngCanadaPhaseTwoAnalysis, lngCanadaPhaseTwoStory } from '../data/researchedImpactCase';
import { MarketImpactPanel } from './MarketImpactPanel';

export function ResearchCaseStudy() {
  const [open, setOpen] = useState(false);
  const panelId = `research-case-${useId().replaceAll(':', '')}`;

  return <section className="research-case-section" aria-labelledby="research-case-title">
    <div className="section-heading">
      <div><p className="eyebrow">SOURCE-BACKED EXAMPLE</p><h2 id="research-case-title">Research case study</h2></div>
      <span className="story-count">HISTORICAL · 29 SEP 2026</span>
    </div>
    <article className="story-card research-case-card">
      <div className="story-meta"><span className="category-tag">Canadian news</span><span>Shell plc · company announcement</span><span>29 Sep 2026</span></div>
      <h3>{lngCanadaPhaseTwoStory.headline}</h3>
      <p className="story-description">{lngCanadaPhaseTwoStory.description}</p>
      <div className="story-actions"><a className="read-link" href={lngCanadaPhaseTwoStory.url} target="_blank" rel="noreferrer">Read original announcement <span aria-hidden="true">↗</span></a></div>
      <button className={`impact-toggle ${open ? 'active' : ''}`} type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(value => !value)}><span className="impact-toggle-mark" aria-hidden="true">{open ? '−' : '+'}</span>{open ? 'Close research analysis' : 'View sourced analysis'}<span className="impact-toggle-label">SOURCED</span></button>
      <MarketImpactPanel story={lngCanadaPhaseTwoStory} analysis={lngCanadaPhaseTwoAnalysis} panelId={panelId} hidden={!open}/>
    </article>
  </section>;
}
