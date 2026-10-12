# Data source review

Checked 11 October 2026. A source being technically accessible does not by itself grant rights to republish its content. Confirm provider terms again before adding any new data fields or redistribution.

## News

| Source | Access and reuse finding | MarketBrief decision |
| --- | --- | --- |
| CBC News RSS | CBC RSS availability and current reuse terms could not be confirmed from accessible official documentation during this review. | Do not fetch or republish until current terms and feed availability are confirmed. |
| BBC News RSS | BBC terms allow an individual to add BBC News RSS to a website if the feed/branding requirements are respected and prominent BBC News attribution/linking is provided. BBC says business RSS use requires permission and may involve a fee. A public GitHub Pages app is public; this project will not assume that personal-use permission applies. | Not connected pending written permission or clearer permission applicable to this public app. |
| Bloomberg | Bloomberg's terms restrict copying, displaying, publishing, and redistributing its service absent written permission. | Not used; link-only editorial discovery is possible later if terms permit. |
| Bank of Canada | Valet exposes central-bank publications/data, not a general news wire. Bank website terms require attribution, caution against excessive requests, and identify possible third-party rights. | Use only the specific Valet daily FX series for which the API documents access; attribute it and request a modest amount of data. |
| Statistics Canada | The Web Data Service (WDS) is a JSON API for statistical data and metadata, updated on business days; it is not a general-purpose news API. Statistics Canada's Open Licence permits reuse of covered material with its required source notice and excludes third-party material. | Suitable later for attributed statistics/release links, not turned into editorial summaries here. |

For news, the dashboard stays on clearly labelled fictional demo content until a feed's explicit public display rights and browser access are verified.

## Market data

### Bank of Canada Valet (connected narrowly)

`FXUSDCAD` reports the daily Bank of Canada USD/CAD reference series. This is a daily published reference observation and the API notes there may be a processing delay. It is not a live forex quote. The frontend makes a small request for the two latest observations and includes the rate date and source attribution. If the browser cannot access the endpoint, the market cards fall back to demo values.

### Alpha Vantage (not connected)

Official documentation lists US equities, forex, gold, WTI and index endpoints. However:

- The S&P 500 (`SPX`) and Nasdaq Composite (`COMP`) index data endpoints are marked premium.
- Standard free API access is limited to 25 requests per day. Alpha Vantage says real-time and 15-minute delayed US stock data are premium; the exact entitlement depends on endpoint and plan.
- Global equities and commodities are listed, but TSX coverage for the specific TSX Composite index/instruments and redistribution rights were not established in this review.
- An API key shipped in the public JavaScript bundle is visible to every visitor. GitHub Pages has no private server environment, so a private key must not be embedded in this app.

For those reasons it is not the free first choice for this static app. Revisit only after confirming TSX coverage, source-level display rights, rate/freshness needs, and a secure server-side key arrangement. That server would add infrastructure and needs separate approval.

## Provider design and fallback

Provider contracts are separate from UI components. News and market data have independent types, configuration, validation, timestamps, loading/error status, and per-card mode labels. The current news adapter is the demo provider. The market adapter tries Bank of Canada and falls back to demo data when the request fails. No API key or backend is required.
