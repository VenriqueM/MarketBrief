# AI-assisted market impact drafts

## Current behavior

MarketBrief prepares a static `impact-analyses.json` file during the GitHub Pages workflow. The site reads that public file; it does not call an AI provider from visitors' browsers. The workflow uses Cloudflare Workers AI and the `@cf/meta/llama-3.3-70b-instruct-fp8-fast` model only when both the account ID variable and API-token secret are configured.

The generation script:

- considers only recent (48-hour) Canadian news, business/finance, and technology stories;
- generates at most one new draft per workflow run, with an application cap of eight drafts per UTC day;
- sends only the headline, category, publisher label, publication time, original article URL, and the feed's short description; it does not fetch the full article or send private notes;
- tells the model that story text is untrusted input and refuses model-created links or citations;
- asks for structured JSON and validates the output shape, citations, company references, secure source links, and required sections;
- publishes the original article as the only source. The model may name an issuer only when the supplied feed fields explicitly state its public ticker, exchange, and relationship. Otherwise it must abstain;
- keeps previously published analyses when credentials are absent, the provider fails, no new story qualifies, or the daily cap is reached.

This is a conservative draft pipeline, not independent research. The model cannot verify issuer exposure from filings or other documents because those sources are not supplied to it. It can still make mistakes even when JSON and citation checks pass. Drafts are marked **AI-assisted, not human-reviewed** and all factual claims require review before being treated as reliable. They are shared publicly with every site visitor. This does not generate an analysis for every story; the first unanalysed eligible item is selected each run.

## Enable the provider

Nothing calls Cloudflare until both values are configured:

1. Create a Cloudflare account and enable Workers AI. The current free allocation is 10,000 Neurons per day; model availability and limits can change. MarketBrief caps generation at eight records per day, and Cloudflare rejects over-limit requests on the Free plan rather than upgrading the project automatically. Check current [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) before enabling it.
2. In Cloudflare, create a scoped API token with the **Workers AI Read** permission for the account that owns the AI account. The model-run endpoint accepts Workers AI Read or Write; use Read unless Cloudflare's current dashboard requires a different permission. Keep the token private.
3. In GitHub, open **VenriqueM/MarketBrief → Settings → Secrets and variables → Actions**.
4. Add repository variable `CLOUDFLARE_ACCOUNT_ID` with the Cloudflare account ID.
5. Add repository secret `CLOUDFLARE_API_TOKEN` with the token value. Do not paste the token into chat, source files, `.env`, or a `VITE_*` variable.
6. Open **Actions → Deploy MarketBrief to GitHub Pages → Run workflow**. Check the logs for the non-secret summary, then check the published `impact-analyses.json` and the deployment URL.

The workflow uses the GitHub-hosted runner, so neither personal computer needs to be on. Runs are scheduled hourly and publish at most one new eligible draft each time. You can also run the workflow manually; the eight-per-UTC-day cap still applies. Keep workflow changes on `main`; pull-request workflows do not receive the Cloudflare secret.

If the secret or variable is missing, GitHub Pages still builds and deploys, with no AI-generated records. If Cloudflare rejects a request or the model returns invalid output, the workflow retains the previous records. Check the Cloudflare dashboard for exact usage. Cloudflare's free allowance is a quota, not a permanent guarantee that this third-party service will remain free or available.

## What this does not do

- It does not fetch or scrape article bodies, perform web search, or independently confirm source facts.
- It does not send notes, bookmarks, account data, or private user information.
- It does not predict share-price movements or create probabilities or price targets.
- It does not provide on-demand per-click analysis. Each published analysis is pre-generated and publicly visible.
- It does not replace human source checking. For stronger issuer analysis, first add a permitted primary-source research layer and require a human review before publishing conclusions.
