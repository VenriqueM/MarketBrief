# Data source review

Checked 12 October 2026. A source being technically accessible does not by itself grant rights to republish its content. Confirm provider terms again before adding any new data fields or redistribution.

## Embedded briefing widgets

| Source | Access and freshness | MarketBrief decision |
| --- | --- | --- |
| TradingView Market Data widget | Official embeddable Web Component; free widget and provider-owned market data. It is not a quote API and exposes no app-readable timestamp. TradingView states that equity exchange data in widgets is delayed where exchanges require fees; forex/crypto data may be real time. TSX stocks and indices are listed as delayed. Coverage and timing vary by symbol. | Embedded for US, Canadian and global benchmarks, USD/CAD, gold, and crude oil. The direct S&P 500 and Nasdaq Composite symbols were rejected as “Permission denied” in the live widget. We use TradingView’s officially documented FOREX.com S&P 500 index CFD and US 100 (Nasdaq 100) cash CFD symbols instead; the latter is explicitly not the Nasdaq Composite. We label it as TradingView provider data and tell readers to check the widget for symbol-level timing. We do not scrape or re-publish its data. |
| TradingView Top Stories | Official embedded news widget, attributed and loaded from TradingView. Headlines and article availability are provided by the widget. | Used as the concise major-market news panel. Existing official Canadian government release feed remains below as a separate source. |
| TradingView Economic Calendar | Official embedded calendar with country and importance filters. Event/timing information is supplied and rendered by TradingView. | Used for upcoming Canada, US, Europe, UK, Japan, and China macro events. |

All widgets load directly from TradingView in the visitor's browser; they need no API key or server and the frontend remains independently hosted on GitHub Pages. A browser extension or network policy can block them. This is third-party content, and MarketBrief cannot provide a shared quote freshness timestamp for the cross-origin widget.

## News

| Source | Access and reuse finding | MarketBrief decision |
| --- | --- | --- |
| Government of Canada Canada.ca RSS/Atom | The official subscriptions page provides national, audience, organization, and topic feeds with publish dates and links. Canada.ca terms allow non-commercial reproduction of government material if the full title, author where available, and original URL are included; third-party material may have separate restrictions. | Connected through an hourly GitHub Actions refresh. The app keeps source attribution and original links, does not use government symbols, and states it is not affiliated with or endorsed by Canada. Coverage is official Canadian releases, not a general newswire. |
| CBC News RSS | CBC RSS availability and current reuse terms could not be confirmed from accessible official documentation during this review. | Do not fetch or republish until current terms and feed availability are confirmed. |
| BBC News RSS | BBC terms allow an individual to add BBC News RSS to a website if the feed/branding requirements are respected and prominent BBC News attribution/linking is provided. BBC says business RSS use requires permission and may involve a fee. A public GitHub Pages app is public; this project will not assume that personal-use permission applies. | Not connected pending written permission or clearer permission applicable to this public app. |
| Bloomberg | Bloomberg's terms restrict copying, displaying, publishing, and redistributing its service absent written permission. | Not used; link-only editorial discovery is possible later if terms permit. |
| Bank of Canada | Valet exposes central-bank publications/data, not a general news wire. Bank website terms require attribution, caution against excessive requests, and identify possible third-party rights. | Use only the specific Valet daily FX series for which the API documents access; attribute it and request a modest amount of data. |
| Statistics Canada | Statistics Canada releases are available from the Government of Canada organization feed. Separately, its Open Licence permits reuse of covered information with a specific source notice; third-party material is excluded. | Connected through the Canada.ca feed under Canada.ca non-commercial terms, with source attribution and original links. A future direct Statistics Canada feed must include its specific Open Licence source notice. |

For news, the app uses official Canadian Government RSS/Atom stories with public non-commercial reproduction terms. GitHub Actions fetches source feeds hourly and emits `dist/news.json` as a static artifact. Failed feeds do not fail the Pages build; successful sources remain available, and if the feed file is unavailable in the browser the app switches to fictional demo stories. No private key or user-hosted server is required.

## Market data

### Bank of Canada Valet (connected narrowly)

`FXUSDCAD` reports the daily Bank of Canada USD/CAD reference series. This is a daily published reference observation and the API notes there may be a processing delay. It is not a live forex quote. The frontend makes a small request for the two latest observations and includes the rate date and source attribution. If the browser cannot access the endpoint, TradingView's separate USD/CAD widget remains available; demo market values only appear if the TradingView market widget script fails to load.

### Alpha Vantage (not connected)

Official documentation lists US equities, forex, gold, WTI and index endpoints. However:

- The S&P 500 (`SPX`) and Nasdaq Composite (`COMP`) index data endpoints are marked premium.
- Standard free API access is limited to 25 requests per day. Alpha Vantage says real-time and 15-minute delayed US stock data are premium; the exact entitlement depends on endpoint and plan.
- Global equities and commodities are listed, but TSX coverage for the specific TSX Composite index/instruments and redistribution rights were not established in this review.
- An API key shipped in the public JavaScript bundle is visible to every visitor. GitHub Pages has no private server environment, so a private key must not be embedded in this app.

For those reasons it is not the free first choice for this static app. Revisit only after confirming TSX coverage, source-level display rights, rate/freshness needs, and a secure server-side key arrangement. That server would add infrastructure and needs separate approval.

## Provider design and fallback

Provider contracts are separate from UI components. News and market data have independent types, configuration, validation, timestamps, loading/error status, and per-card mode labels. News reads a static GitHub Actions artifact built from official feeds and falls back to demo stories if unavailable. The market adapter tries Bank of Canada and falls back to demo data when the request fails. No API key or backend is required.
