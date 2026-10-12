# Market Plan — Daily Trading Desk

A lightweight, responsive Persian RTL workspace for writing the same structured daily market plan every day. The current UI is intentionally static-first: one HTML page, vanilla JavaScript, inline SVG charts, no build step, no third-party runtime dependency, and no market-data connection.

## What is included

- `frontend/index.html` — the interactive trading-plan desk.
- `data/plan-2026-10-12.example.json` — normalized sample plan based on the supplied HTML report.
- `schemas/daily-plan.schema.json` — versioned data contract for future Python/API integration.
- `docs/DAILY-PLAN-STANDARD.md` — required sections, validation gates, and daily authoring checklist.
- `tests/smoke_test.py` — dependency-free structural checks.
- `tests/runtime-validation.mjs` — executes the production import validator against valid and malformed plans.

## Run locally

Open `frontend/index.html` in a modern browser. It also works as a static site (for example, GitHub Pages) when the repository is published. No npm install or Python server is required for this UI. The root `index.html` redirects to the frontend entry point.

## Daily workflow

1. Select the plan date. Unsaved edits are saved to the current date before switching. A new date creates a draft, clears the reference-data date and removes date-specific session/event schedules and scenario weights; retained historical levels are still unverified until refreshed.
2. Update the data-as-of date, timezone, summary, and instrument levels. The page does not pull live prices or news.
3. The session schedule, weekly events, scenario weights, and other structured fields can be maintained through JSON: export the plan, edit the corresponding `sessionPlan`, `weekEvents`, and `scenarioWeights` arrays, then import the validated file. Empty sections for a newly created date are intentional; they are not a live calendar.
4. Select a scenario. The SVG price map displays its trigger and a schematic path toward the first reference target. It is a levels map, not a live candlestick chart.
5. Verify the conditions, invalidation, spread, target room and risk calculation. The calculator validates BUY/SELL price orientation and includes optional costs expressed in price units; it does not guess lot size.
6. Check the pre-trade checklist, save locally, and export JSON as the portable source for backup or future backend storage. Use Print / PDF to archive the report.
7. Complete the end-of-day review and keep lessons separate from forecasts.

## Persistence and privacy

Changes are saved in this browser's `localStorage` only when saved/auto-saved by the relevant control. Data is not uploaded to a server or shared across devices. Export JSON regularly if the plan must be backed up or moved. Imported JSON should be treated as data and validated before use.

## Important limitations

- No live prices, broker integration, auto-trading, order placement, economic-news feed, backtest, or performance guarantee.
- Historical/reference values in the example are from the supplied report and are intentionally labeled as non-live.
- Broker symbol contract specifications, tick value, commissions, spread, slippage, gaps and account currency must be considered separately.
- The schema is the stable hand-off contract for a future Python service. Keep business rules and plan fields documented before adding an API/database.

## Verify

```bash
python tests/smoke_test.py
node tests/runtime-validation.mjs
python -m json.tool data/plan-2026-10-12.example.json > /dev/null
```