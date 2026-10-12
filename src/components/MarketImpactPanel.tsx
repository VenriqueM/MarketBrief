import type { MarketImpactAnalysis, Story } from '../types';
import { validateImpactAnalysis } from '../lib/impactValidation';

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

const claimLabels = {
  'verified-fact': 'VERIFIED FACT',
  'source-attributed-fact': 'SOURCE-ATTRIBUTED · AI DRAFT',
  interpretation: 'INTERPRETATION',
  hypothesis: 'HYPOTHESIS',
} as const;

export function MarketImpactPanel({ story, analysis, panelId, hidden }: {
  story: Story;
  analysis: MarketImpactAnalysis | null;
  panelId: string;
  hidden: boolean;
}) {
  const articleLink = story.mode !== 'demo' && isHttpsUrl(story.url) ? story.url : null;
  const validationIssues = analysis ? validateImpactAnalysis(analysis) : [];
  const demoAnalysis = analysis?.provenance === 'demo';
  const aiAnalysis = analysis?.provenance === 'ai-assisted';

  return <section id={panelId} className="market-impact-panel" aria-label={`Market impact analysis for ${story.headline}`} hidden={hidden}>
    {analysis ? <>
      <div className={`impact-demo-banner ${demoAnalysis ? '' : aiAnalysis ? 'impact-ai-banner' : 'impact-research-banner'}`}><span className="impact-demo-dot"/> {demoAnalysis ? <>STATIC DEMO ANALYSIS <span>·</span> NOT GENERATED FROM THIS ARTICLE</> : aiAnalysis ? <>AI-ASSISTED DRAFT <span>·</span> NOT HUMAN-REVIEWED <span>·</span> GENERATED {analysis.generatedAt ? new Date(analysis.generatedAt).toLocaleString() : 'DATE NOT RECORDED'}</> : <>MANUALLY RESEARCHED CASE STUDY <span>·</span> REVIEWED {analysis.reviewedAt ? new Date(`${analysis.reviewedAt}T12:00:00`).toLocaleDateString() : 'DATE NOT RECORDED'}</>}</div>
      <p className="impact-disclaimer">{demoAnalysis ? 'This is a reusable interface example, not a review of the selected story or current market data. It contains no verified company relationships, price targets, probabilities, or stock-price predictions.' : aiAnalysis ? `AI draft based only on the source feed headline, category, short description, and article link. The model did not independently verify claims or research issuers; every statement needs human review. Model: ${analysis.model ?? 'not recorded'}.` : 'Historical company announcement used as a research example, not current news. Facts below are attributed to linked sources; business-impact analysis and scenarios are interpretations, not predictions of share-price movement.'}</p>

      <section className="impact-block impact-summary">
        <h4>Executive summary</h4>
        <p>{analysis.executiveSummary}</p>
      </section>

      <section className="impact-block impact-evidence-ledger">
        <div className="impact-section-title"><h4>Evidence ledger</h4><span>{analysis.claims.length} STATEMENTS</span></div>
        {validationIssues.length > 0 && <p className="impact-validation-warning" role="status">Research entry needs review: {validationIssues.map(issue => issue.message).join(' ')}</p>}
        {analysis.claims.length > 0 ? <ul className="impact-claim-list">{analysis.claims.map(claim => <li key={claim.id}>
          <span className={`impact-claim-type impact-claim-${claim.type}`}>{claimLabels[claim.type]}</span>
          <span>{claim.statement}</span>
          {claim.evidenceIds.length > 0 && <span className="impact-claim-citations">Evidence: {claim.evidenceIds.map(id => {
            const source = analysis.sources.find(item => item.id === id);
            return source && isHttpsUrl(source.url) ? <a key={id} href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} ↗</a> : null;
          })}</span>}
        </li>)}</ul> : <p className="impact-empty-ledger">No sourced research statements are included in this interface demo. In a researched analysis, factual claims will link directly to evidence; interpretation and scenario hypotheses will be labelled separately.</p>}
      </section>

      <section className="impact-block">
        <div className="impact-section-title"><h4>Potentially affected companies</h4><span>ISSUER EXPOSURE</span></div>
        {analysis.companies.length ? <div className="impact-company-list">{analysis.companies.map(company => <article className="impact-company" key={`${company.exchange}:${company.ticker}`}>
          <div className="impact-company-heading"><strong>{company.name}</strong><span className="impact-ticker">{company.exchange}:{company.ticker}</span><span className={classificationClass(company.classification)}>{company.classification}</span></div>
          <p className="impact-relationship">{company.relationship}</p>
          <p>{company.explanation}</p>
          {company.evidenceIds.length > 0 && <p className="impact-company-evidence">Evidence: {company.evidenceIds.map(id => {
            const source = analysis.sources.find(item => item.id === id);
            return source && isHttpsUrl(source.url) ? <a key={id} href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} ↗</a> : null;
          })}</p>}
          <a className="impact-research-link" href={`https://www.tradingview.com/search/?query=${encodeURIComponent(`${company.exchange}:${company.ticker}`)}`} target="_blank" rel="noopener noreferrer">Search ticker on TradingView ↗</a>
        </article>)}</div> : <div className="impact-empty-company"><strong>No companies identified</strong><p>{aiAnalysis ? 'The source feed fields supplied to the model did not support naming a listed company and ticker. This is an abstention, not a finding that the story has no market relevance.' : 'There is not enough verified evidence in this static demo to establish a news-to-company relationship. Naming an issuer would be guesswork.'}</p></div>}
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
        {analysis.sources.map(source => isHttpsUrl(source.url) && <a className="impact-research-link" key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} · {source.publisher}{source.publishedAt ? ` · ${new Date(source.publishedAt).toLocaleDateString()}` : ''} ↗</a>)}
        {!articleLink && analysis.sources.length === 0 && <p>This fictional demo item has no original article or supporting sources. No ticker links are shown because no company has been identified.</p>}
      </section>
    </> : <>
      <div className="impact-demo-banner impact-unavailable-banner"><span className="impact-demo-dot"/> AI DRAFT NOT AVAILABLE</div>
      <p className="impact-disclaimer">No pre-generated AI draft is available for this story. The static demo example is not applied to real news; MarketBrief does not guess which companies may be affected.</p>
      {articleLink && <a className="impact-research-link" href={articleLink} target="_blank" rel="noopener noreferrer">Open original article ↗</a>}
      {!articleLink && <p className="impact-disclaimer">A verifiable original source link is not available for this story.</p>}
    </>}
  </section>;
}
