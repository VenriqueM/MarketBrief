import type { MarketImpactAnalysis } from '../types';

/** Static UI example only. It is never derived from a story or live market data. */
export const demoMarketImpactAnalysis: MarketImpactAnalysis = {
  label: 'Static interface example · not generated from the selected article',
  executiveSummary: 'This example shows how an analyst might structure a market review. It does not assess the selected headline. No verified event details or issuer exposure are supplied in this demo.',
  classification: 'Uncertain',
  classificationNote: 'A potential business impact is unsubstantiated in this demo. This is not a prediction of any stock-price movement.',
  companies: [],
  timeHorizon: null,
  horizonReasoning: 'No time horizon can be supported without a verified event date, implementation schedule, and identified company exposure.',
  bullishScenario: 'If a future, reliable source confirms a policy, contract, or event and identifies an exposed issuer, demand or revenue expectations could improve under favorable implementation assumptions. That remains hypothetical and is not linked to this demo story.',
  bearishScenario: 'If a proposal is delayed, costs outweigh benefits, or the event does not proceed, the business effect could be limited or adverse for a verified exposed issuer. No such issuer is identified here.',
  risks: [
    'The demo contains no verifiable reporting or named public companies.',
    'The event status, jurisdiction, timing, and implementation details are unknown.',
    'Company exposure, financial materiality, and market expectations have not been assessed.',
    'No independent supporting research has been selected for this example.',
  ],
  sources: [],
};
