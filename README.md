# Venture Investor

A venture-style **public-market screener** for finding asymmetric small-cap
growth opportunities — the kind of small companies entering huge markets that
occasionally turn into 10–50x winners.

It encodes one thesis: the biggest public winners usually start as **small,
fast-growing, founder-led real businesses riding a major technology shift**. The
app ranks a curated universe of such companies by the factors that tend to
*precede* hockey-stick returns, and gives you a workflow to research them.

> ⚠️ **Educational tool, not investment advice.** Scores are a heuristic for
> *prioritizing research*, never a buy signal. Do your own work.

---

## What it does

- **Screener** — ranks ~35 curated companies (0–100) by a weighted blend of
  revenue growth, gross margins, cash flow, market-cap fit, founder leadership,
  and theme tailwind. Filter by theme, founder-led, growth threshold, and the
  $500M–$5B "sweet spot."
- **Company scorecards** — live fundamentals, a transparent score breakdown, and
  one-click links to earnings transcripts, SEC filings, Finviz, and Yahoo.
- **Watchlist** — save up to ~25 names (stored in your browser) with a built-in
  weekly 15-minute review checklist.
- **Method page** — explains exactly how every number is computed.

The universe spans the themes worth watching: AI infrastructure, robotics,
defense tech, energy storage, nuclear power, digital health, cybersecurity,
space, fintech, and semiconductors.

## Tech

- **Next.js 14** (App Router) + TypeScript + Tailwind
- **yahoo-finance2** for free, no-API-key fundamentals
- **Vitest** unit tests for the scoring engine
- Watchlist persisted in `localStorage` (no database required)

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build + type-check
npm run start      # serve the production build
npm test           # run the scoring-engine unit tests
npm run lint
```

### A note on data and networks

Live fundamentals are fetched from Yahoo Finance at request time and cached for
30 minutes. If outbound network is blocked (e.g. inside a restricted CI sandbox),
every metric comes back empty and the app shows a clear **"live financials not
loaded"** banner rather than fabricating numbers. Run it locally or deploy it
somewhere with open network access to see real data, then hit **Refresh**.

## Deploying

Deploys cleanly to **Vercel** (open network, so live data works out of the box).
Point Vercel at this repo and accept the defaults — no environment variables are
required for the free data path.

## How scoring works

The composite is a weighted average of six 0–100 sub-scores. Missing metrics drop
out and the remaining weights renormalize, so a data gap doesn't unfairly tank a
company.

| Factor             | Weight | What it rewards                                  |
| ------------------ | ------ | ------------------------------------------------ |
| Revenue growth     | 35%    | 30%+ YoY clears the bar; 50%+ is elite           |
| Gross margins      | 20%    | 50%+, software-like is best                      |
| Cash flow          | 15%    | Positive / near-breakeven FCF margin             |
| Market-cap fit     | 10%    | Peaks in the $500M–$5B band institutions ignore  |
| Founder-led        | 10%    | Founder-CEO with long-term skin in the game      |
| Theme tailwind     | 10%    | Riding one (or more) major technology shift      |

See `/method` in the app for the full explanation, and `lib/scoring.ts` for the
exact ramps (all unit-tested in `lib/scoring.test.ts`).

## Adding companies

The universe is hand-curated in [`lib/universe.ts`](lib/universe.ts). Add an
entry and the screener picks it up automatically:

```ts
{
  ticker: "EXMP",
  name: "Example Corp",
  themes: ["AI Infrastructure"],
  founderLed: true,
  founder: "Jane Doe",
  blurb: "One line on what they do.",
  thesis: "Why this is a venture-style candidate.",
}
```

Static facts (sector, theme, founder-led) are curated by hand — **re-verify
them, CEOs change.** Financials are always pulled live.

## Project layout

```
app/                 # routes: dashboard, screener, company/[ticker], watchlist, method
  api/screen         # JSON: scored + ranked universe
  api/company/[t]    # JSON: one scored company
components/           # UI (ScreenerTable, CompanyCard, ScoreBadge, ...)
hooks/useWatchlist   # localStorage-backed watchlist
lib/
  universe.ts        # the curated company list  ← edit me
  scoring.ts         # the scoring engine        ← the heart
  scoring.test.ts    # unit tests
  provider.ts        # Yahoo Finance fetch (graceful failure)
  screen.ts          # fetch + score + rank, with caching
```
