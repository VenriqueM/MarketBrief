import type { MarketImpactAnalysis, Story } from '../types';

/** Historical hand-researched example. Kept separate from the live feed and UI demo record. */
export const lngCanadaPhaseTwoStory: Story = {
  id: 'research-lng-canada-phase-two-fid-2026',
  headline: 'Shell takes final investment decision to double LNG Canada capacity',
  category: 'Canadian news',
  source: 'Shell plc · company announcement',
  publishedAt: '2026-09-29T00:00:00Z',
  description: 'Shell announced a final investment decision for LNG Canada Phase 2, a planned expansion that would add two processing trains at Kitimat. This historical case study examines the disclosed business exposure and its uncertainties.',
  url: 'https://www.shell.com/news-and-insights/newsroom/news-and-media-releases/2026/shell-takes-final-investment-decision-to-double-lng-canada-capacity.html',
  mode: 'research',
};

export const lngCanadaPhaseTwoAnalysis: MarketImpactAnalysis = {
  provenance: 'manual-research',
  reviewedAt: '2026-10-12',
  label: 'Hand-researched historical case study · not an assessment of current news',
  executiveSummary: 'Shell’s Phase 2 final investment decision creates a direct, long-dated project exposure for Shell: the company says it holds 40% of LNG Canada and expects nearly 6 million tonnes per annum of additional LNG entitlement from the expansion. That creates a possible route to higher long-run sales, while adding a large construction and infrastructure commitment. The release does not disclose Phase 2 capital cost or independent project economics, so the net business effect remains uncertain.',
  classification: 'Mixed',
  classificationNote: 'Potential business opportunity from additional LNG capacity is balanced by capital, delivery, infrastructure, and market risks. This describes possible business effects, not a predicted Shell share-price move.',
  companies: [{
    name: 'Shell plc',
    ticker: 'SHEL',
    exchange: 'NYSE',
    relationship: '40% joint-venture participant in LNG Canada; Shell says it will receive nearly 6 mtpa of additional LNG from Phase 2.',
    classification: 'Mixed',
    explanation: 'This is a direct project link. More saleable LNG could support Shell’s Integrated Gas business if construction is completed and commercial terms and market conditions are favorable. The release gives no Phase 2 capital cost, realized-price outlook, or independent cash-flow estimate, so materiality to Shell as a whole cannot be assessed from these sources.',
    evidenceIds: ['shell-phase-two-release', 'shell-nyse-ads'],
  }],
  timeHorizon: 'Long-term',
  horizonReasoning: 'Shell expects commercial operations in the early 2030s. Construction and capital allocation occur earlier, but the stated capacity and operating benefits are mainly long-dated.',
  bullishScenario: 'If the two additional trains and associated infrastructure are delivered near plan, LNG demand and prices support attractive netbacks, and Shell can market its proportional production effectively, the added output could contribute to long-term Integrated Gas sales and cash generation. These are assumptions; Shell’s stated return expectation is management guidance, not a realized result.',
  bearishScenario: 'If construction or pipeline expansion costs rise, start-up slips, or LNG prices and demand are weaker than assumed, the project could earn less than Shell expects or tie up capital for longer. The release describes five new pipeline compressor stations and an early-2030s operating target, but does not quantify Phase 2 cost or provide an independent sensitivity analysis.',
  risks: [
    'The announcement does not state Phase 2 capital cost, financing details, or a project-level cash-flow forecast.',
    'Commercial operations are expected in the early 2030s; schedule, construction, and pipeline expansion risks remain.',
    'LNG prices, Asian demand, gas sourcing costs, shipping costs, and contract mix could differ from management assumptions.',
    'The cited return claim is Shell management’s expectation; no independent project economics were reviewed for this case.',
    'This case has not assessed what investors already expected or the effect on Shell’s valuation.',
  ],
  claims: [
    { id: 'fid-and-ownership', statement: 'On 29 September 2026 Shell announced a final investment decision for LNG Canada Phase 2 and stated that Shell has a 40% interest in the joint venture.', type: 'verified-fact', evidenceIds: ['shell-phase-two-release'] },
    { id: 'capacity-and-timing', statement: 'Shell says Phase 2 would add two trains, take facility capacity from 14 to 28 mtpa, provide Shell nearly 6 mtpa of additional LNG, and target commercial operations in the early 2030s.', type: 'verified-fact', evidenceIds: ['shell-phase-two-release'] },
    { id: 'company-return-guidance', statement: 'Shell says it expects Phase 2 returns above the Integrated Gas business hurdle rate. This is attributed company guidance, not an independently verified outcome.', type: 'verified-fact', evidenceIds: ['shell-phase-two-release'] },
    { id: 'cashflow-channel', statement: 'The added LNG entitlement could support sales and cash flow if the project is delivered and sold at attractive netbacks; costs, prices, and realized returns are not disclosed in the announcement.', type: 'interpretation', evidenceIds: ['shell-phase-two-release'] },
    { id: 'delivery-downside', statement: 'A delay, cost increase, weaker LNG market, or lower netback could reduce the project’s business benefit relative to Shell’s expectation. These are downside scenarios, not reported outcomes.', type: 'hypothesis', evidenceIds: ['shell-phase-two-release'] },
  ],
  sources: [
    { id: 'shell-phase-two-release', label: 'Phase 2 decision, project share, added capacity, timing and company return guidance', publisher: 'Shell plc', url: 'https://www.shell.com/news-and-insights/newsroom/news-and-media-releases/2026/shell-takes-final-investment-decision-to-double-lng-canada-capacity.html', kind: 'original', publishedAt: '2026-09-29', accessedAt: '2026-10-12' },
    { id: 'shell-nyse-ads', label: 'Shareholder FAQ: NYSE ADS symbol SHEL', publisher: 'Shell plc', url: 'https://www.shell.com/investors/information-for-shareholders/shareholder-faqs.html', kind: 'primary', publishedAt: null, accessedAt: '2026-10-12' },
  ],
};
