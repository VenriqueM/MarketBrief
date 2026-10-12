import { isRecord } from './validation';
import { validateImpactAnalysis } from './impactValidation';
import type { GeneratedImpactAnalysis, ImpactAnalysisFeedPayload, ImpactClaim, ImpactClaimType, ImpactSource, MarketImpactAnalysis } from '../types';

const classifications = ['Positive', 'Negative', 'Mixed', 'Uncertain'];
const horizons = ['Short-term', 'Medium-term', 'Long-term'];
const claimTypes: ImpactClaimType[] = ['verified-fact', 'source-attributed-fact', 'interpretation', 'hypothesis'];

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isSource(value: unknown): value is ImpactSource {
  return isRecord(value) && typeof value.id === 'string' && typeof value.label === 'string'
    && typeof value.publisher === 'string' && typeof value.url === 'string'
    && ['original', 'primary', 'secondary', 'research'].includes(String(value.kind))
    && (value.publishedAt === null || typeof value.publishedAt === 'string')
    && typeof value.accessedAt === 'string';
}

function isClaim(value: unknown): value is ImpactClaim {
  return isRecord(value) && typeof value.id === 'string' && typeof value.statement === 'string'
    && claimTypes.includes(value.type as ImpactClaimType) && isStringArray(value.evidenceIds);
}

function isAnalysis(value: unknown): value is MarketImpactAnalysis {
  if (!isRecord(value)) return false;
  return value.provenance === 'ai-assisted' && value.reviewedAt === null
    && typeof value.generatedAt === 'string' && typeof value.model === 'string'
    && typeof value.label === 'string' && typeof value.executiveSummary === 'string'
    && classifications.includes(String(value.classification)) && typeof value.classificationNote === 'string'
    && Array.isArray(value.companies) && value.companies.every(company => isRecord(company)
      && typeof company.name === 'string' && typeof company.ticker === 'string' && typeof company.exchange === 'string'
      && typeof company.relationship === 'string' && classifications.includes(String(company.classification))
      && typeof company.explanation === 'string' && isStringArray(company.evidenceIds))
    && (value.timeHorizon === null || horizons.includes(String(value.timeHorizon)))
    && typeof value.horizonReasoning === 'string' && typeof value.bullishScenario === 'string'
    && typeof value.bearishScenario === 'string' && isStringArray(value.risks)
    && Array.isArray(value.claims) && value.claims.every(claim => isClaim(claim) && claim.type !== 'verified-fact')
    && Array.isArray(value.sources) && value.sources.length === 1 && value.sources.every(isSource)
    && value.sources[0].id === 'story-source' && value.sources[0].kind === 'original';
}

export function validateImpactFeed(value: unknown): ImpactAnalysisFeedPayload {
  if (!isRecord(value) || (value.generatedAt !== null && typeof value.generatedAt !== 'string')
    || typeof value.provider !== 'string'
    || !['not-configured', 'ready', 'degraded'].includes(String(value.status))
    || !isRecord(value.analyses)) {
    throw new Error('AI analysis feed has an invalid payload.');
  }

  const analyses: Record<string, GeneratedImpactAnalysis> = {};
  for (const [storyId, record] of Object.entries(value.analyses)) {
    if (!isRecord(record) || typeof record.generatedAt !== 'string'
      || !Number.isFinite(Date.parse(record.generatedAt)) || typeof record.model !== 'string'
      || !isAnalysis(record.analysis)) continue;
    const issues = validateImpactAnalysis(record.analysis);
    if (issues.length > 0 || record.analysis.generatedAt !== record.generatedAt || record.analysis.model !== record.model) continue;
    analyses[storyId] = record as unknown as GeneratedImpactAnalysis;
  }

  return {
    generatedAt: typeof value.generatedAt === 'string' ? value.generatedAt : null,
    provider: value.provider,
    status: value.status as ImpactAnalysisFeedPayload['status'],
    analyses,
  };
}
