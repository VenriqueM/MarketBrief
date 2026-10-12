import type { MarketImpactAnalysis } from '../types';

export interface ImpactValidationIssue {
  claimId: string;
  message: string;
}

/** Checks the evidence links and required sourcing for a manually maintained analysis. */
export function validateImpactAnalysis(analysis: MarketImpactAnalysis): ImpactValidationIssue[] {
  const issues: ImpactValidationIssue[] = [];
  const sourceIds = new Set<string>();

  for (const source of analysis.sources) {
    if (sourceIds.has(source.id)) {
      issues.push({ claimId: source.id, message: 'Evidence source IDs must be unique.' });
    }
    sourceIds.add(source.id);

    try {
      if (new URL(source.url).protocol !== 'https:') throw new Error('not https');
    } catch {
      issues.push({ claimId: source.id, message: 'Evidence links must be valid HTTPS URLs.' });
    }

    if (!source.publisher.trim()) {
      issues.push({ claimId: source.id, message: 'Name the publisher for each evidence source.' });
    }
    if (!Number.isFinite(Date.parse(source.accessedAt))) {
      issues.push({ claimId: source.id, message: 'Each evidence source needs a valid access date.' });
    }
  }

  const claimIds = new Set<string>();
  for (const claim of analysis.claims) {
    if (claimIds.has(claim.id)) {
      issues.push({ claimId: claim.id, message: 'Claim IDs must be unique.' });
    }
    claimIds.add(claim.id);

    if (claim.type === 'verified-fact' && claim.evidenceIds.length === 0) {
      issues.push({ claimId: claim.id, message: 'Verified facts need at least one cited source.' });
    }
    for (const evidenceId of claim.evidenceIds) {
      if (!sourceIds.has(evidenceId)) {
        issues.push({ claimId: claim.id, message: `Evidence source “${evidenceId}” is missing.` });
      }
    }
  }

  for (const company of analysis.companies) {
    const companyId = `${company.exchange}:${company.ticker}`;
    if (company.evidenceIds.length === 0) {
      issues.push({ claimId: companyId, message: 'A named company needs cited evidence for its relationship to the story.' });
    }
    for (const evidenceId of company.evidenceIds) {
      if (!sourceIds.has(evidenceId)) {
        issues.push({ claimId: companyId, message: `Company evidence source “${evidenceId}” is missing.` });
      }
    }
  }

  return issues;
}
