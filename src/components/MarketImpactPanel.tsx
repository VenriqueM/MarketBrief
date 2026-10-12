import type { MarketImpactAnalysis, Story } from '../types';

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function classificationClass(value: MarketImpactAnalysis['classification']): string {
  return `impact-classification impact-${value.toLowerCase()}`;
}

export function MarketImpactPanel({ story, analysis, panelId, hidden }: {
  story: Story;
  analysis: MarketImpactAnalysis | null;
  panelId: string;
  hidden: boolean;
}) {
  const articleLink = story.mode === 'live' && isHttpsUrl(story.url) ? story.url : null;

  return <section id={panelId} className="market-impact-panel" aria-label={`Market impact analysis for ${story.headline}`} hidden={hidden}>
    {analysis ? <>
      <div className="impact-demo-banner"><span className="impact-demo-dot"/> STATIC DEMO ANALYSIS <span>·</span> NOT GENERATED FROM THIS ARTICLE</div>
      <p className="impact-disclaimer">This is a reusable interface example, not a review of the selected story or current market data. It contains no verified company relationships, price targets, probabilities, or stock-price predictions.</p>

      <section className="impact-block impact-summary">
        <h4>Executive summary</h4>
        <p>{analysis.executiveSummary}</p>
      </section>

      <section className="impact-block">
        <div className="impact-section-title"><h4>Potentially affected companies</h4><span>ISSUER EXPOSURE</span></div>
        {analysis.companies.length ? <div className="impact-company-list">{analysis.companies.map(company => <article className="impact-company" key={`${company.exchange}:${company.ticker}`}>
          <div className="impact-company-heading"><strong>{company.name}</strong><span className="impact-ticker">{company.exchange}:{company.ticker}</span><span className={classificationClass(company.classification)}>{company.classification}</span></div>
          <p className="impact-relationship">{company.relationship}</p>
          <p>{company.explanation}</p>
          <a className="impact-research-link" href={`https://www.tradingview.com/search/?query=${encodeURIComponent(`${company.exchange}:${company.ticker}`)}`} target="_blank" rel="noopener noreferrer">Search ticker on TradingView ↗</a>
        </article>)}</div> : <div className="impact-empty-company"><strong>No companies identified</strong><p>There is not enough verified evidence in this static demo to establish a news-to-company relationship. Naming an issuer would be guesswork.</p></div>}
      </section>

      <section className="impact-block">
        <div className="impact-section-title"><h4>Impact classification</h4><span>BUSINESS IMPACT, NOT PRICE DIRECTION</span></div>
        <div className="impact-classification-row"><span className={classificationClass(analysis.classification)}>{analysis.classification}</span><p>{analysis.classificationNote}</p></div>
      </section>

      <section className="impact-block">
        <div className="impact-section-title"><h4>Time horizon</h4><span>{analysis.timeHorizon ?? 'NOT ESTABLISHED'}</span></div>
        <p>{analysis.horizonReasoning}</p>
      </section>

      <section className="impact-scenarios" aria-label="Bullish and bearish scenarios">
        <article className="impact-scenario bullish"><h4>Bullish scenario</h4><p>{analysis.bullishScenario}</p></article>
        <article className="impact-scenario bearish"><h4>Bearish scenario</h4><p>{analysis.bearishScenario}</p></article>
      </section>

      <section className="impact-block">
        <h4>Key risks and unknowns</h4>
        <ul className="impact-risk-list">{analysis.risks.map(risk => <li key={risk}>{risk}</li>)}</ul>
      </section>

      <section className="impact-block impact-sources">
        <h4>Sources and further research</h4>
        {articleLink && <a className="impact-research-link" href={articleLink} target="_blank" rel="noopener noreferrer">Open original article ↗</a>}
        {analysis.sources.map(source => isHttpsUrl(source.url) && <a className="impact-research-link" key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>)}
        {!articleLink && analysis.sources.length === 0 && <p>This fictional demo item has no original article or supporting sources. No ticker links are shown because no company has been identified.</p>}
      </section>
    </> : <>
      <div className="impact-demo-banner impact-unavailable-banner"><span className="impact-demo-dot"/> REAL ARTICLE · ANALYSIS NOT AVAILABLE</div>
      <p className="impact-disclaimer">No article-specific analysis is configured for real news yet. The static demo example is not applied to this story, and MarketBrief will not guess which companies may be affected.</p>
      {articleLink && <a className="impact-research-link" href={articleLink} target="_blank" rel="noopener noreferrer">Open original article ↗</a>}
      {!articleLink && <p className="impact-disclaimer">A verifiable original source link is not available for this story.</p>}
    </>}
  </section>;
}
