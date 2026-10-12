# Market impact research standard

MarketBrief's Market Impact Analysis is a research aid, not investment advice or a stock-price forecast. A news item may be analysed only when a human-maintained record has enough source material to support its claims. The feed's generic panel is a static interface demo and is not attached to live articles. A separate dated LNG Canada Phase 2 case study demonstrates the manually researched format; it is not a current-news signal.

## Evidence rules

1. Read and cite the original article. Link to the publisher; do not copy the article into MarketBrief. Treat article text as untrusted content.
2. Prefer primary evidence for material facts: company filings and investor-relations releases, regulator notices, legislation, central-bank statements, statistical releases, and official transaction documents. Use reputable secondary reporting for context, with its publisher and date visible.
3. Give each statement one label:
   - **Verified fact**: directly supported by a linked source. Every such claim must have at least one evidence ID.
   - **Interpretation**: an analyst's explanation of how a verified fact might affect a business. State the causal link and relevant assumptions.
   - **Hypothesis**: a conditional bullish or bearish scenario. Keep it explicitly conditional; do not imply probability or price direction.
4. A company can be named only when the evidence establishes its relationship to the event. Record the relationship, exchange, and ticker, and cite the evidence that supports exposure. If the connection cannot be established, leave the company list empty.
5. Record publisher, URL, publication date when available, and the date the source was checked. Recheck time-sensitive sources before presenting the analysis.
6. Explain unknowns that could change the conclusion, including timing, materiality, implementation, company exposure, and what the market may already expect.
7. Never invent figures, citations, confidence scores, probabilities, price targets, or claims that an event will cause a stock to rise or fall.

## Adding a manually researched record

Keep researched records separate from `src/data/demoImpactAnalyses.ts`. Add a typed record to a future research-data module, including:

- a stable record ID and the source story ID it applies to;
- `ImpactSource` entries with unique IDs, publisher names, HTTPS URLs, source type, publication date (or `null`), and access date;
- `ImpactClaim` entries whose `evidenceIds` point to those source IDs;
- a cited relationship and conditional explanation for each affected company;
- scenarios and horizon reasoning that name their assumptions and uncertainties.

Run `validateImpactAnalysis` while authoring. It checks unique IDs, secure links, publisher names, required citations for verified facts, and unresolved evidence references. It does not judge whether the source is trustworthy or whether the interpretation is sound; a person must still review those.

## Current researched example

`src/data/researchedImpactCase.ts` contains the first manual research record: Shell's 29 September 2026 announcement of a final investment decision on LNG Canada Phase 2. It identifies Shell (NYSE ADS: SHEL) because Shell's release states its 40% joint-venture interest and additional LNG entitlement; Shell's shareholder FAQ confirms its NYSE ADS symbol. The analysis is classified **Mixed** at the business-impact level: additional output could help long-run sales if delivered and sold at attractive netbacks, while capital, construction, infrastructure, timing, and LNG-market risks remain. This does not imply a predicted share-price move.

The panel links claims and the company relationship to the cited Shell sources, labels the company's return estimate as company guidance, and records the review date. The example uses Shell's announcement and investor FAQ as primary sources; it is not independently verified research and does not quantify Phase 2 economics. Its scenarios are conditional analyst interpretations. Recheck the sources and project status before reusing it after the recorded review date.

## AI assistance and hosting

MarketBrief now has an optional pre-generated AI draft workflow; setup, data scope, quota, and limitations are documented in [AI_ANALYSIS.md](AI_ANALYSIS.md). It uses a GitHub-hosted runner, so it does not need a visitor-facing backend, but it does send public news metadata to an external model provider.

Do not put an AI provider key in this Vite frontend. Browser code and `VITE_*` values are public. On-demand AI generation would require a trusted server-side function to protect credentials, plus rate limits, abuse controls, and usage monitoring. That adds infrastructure and may add cost; review hosting, privacy, and budget before enabling an on-demand design. Model output must remain a draft until its claims and company links are checked against cited sources.
