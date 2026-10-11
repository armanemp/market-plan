# Daily Market Plan Standard (v1.0.0)

## Purpose

Use one stable structure each day so that a report is scannable, comparable, traceable to sources, and safe to review. The purpose is decision preparation, not certainty or automated execution.

## Required order

1. **Header and data freshness** — plan date, timezone, generation date, `dataAsOf`, feed status, primary instruments. Explicitly distinguish a historical close from live broker prices. Missing freshness is a blocker, not a field to silently infer.
2. **Executive summary** — market regime, conditional bias per instrument, dominant risk, and what evidence would change the bias. Keep it concise.
3. **Macro/news context** — separate verified facts, interpretation and unresolved/rumoured information. Every time-sensitive claim needs a source and publication date; unverified breaking news never becomes an entry trigger.
4. **Scenario map** — use scenario labels rather than directional certainty. Subjective weights must be labeled subjective; omit them if there is no defensible basis.
5. **Price-level map** — levels use stable IDs so scenarios can reference the same level. Each level includes label, numeric price, type, and reference date/source where available. Keep broker-specific quotes authoritative for execution.
6. **Scenarios for each instrument** — each scenario must specify direction (`long`, `short`, or `wait`), trigger level, activation/entry method, confirmation timeframe, invalidation condition, stop methodology, one or more reference targets, and conditions that cancel/forbid the trade. Do not fabricate an exact entry/SL/TP if price structure and live data were not observed.
7. **Session plan** — preparation, observation windows, event-risk windows and end-of-day review. Always state timezone and verify daylight-saving changes for any timezone conversion.
8. **Risk policy** — account risk budget, daily loss limit, consecutive-loss stop, correlated exposures, minimum target space/R:R, spread/slippage notes and broker-specific sizing caveat.
9. **Pre-trade checklist** — data freshness, event check, spread, timeframe structure, close confirmation, retest/sweep, stop validity, target room, exposure and invalidation. A checked box records user review; it is not a guarantee.
10. **Post-session review** — record no-trade as a valid outcome; evaluate process adherence separately from profit/loss.
11. **Sources and caveats** — direct links, source type, date/age, historical-vs-current tag, and gaps/assumptions.

## Scenario state machine

`Context → Level → Trigger → Confirmation → Entry method → Risk check → Execute manually or stand aside → Review`

A scenario is **not actionable** when any of the following apply: data is stale/unknown, an essential event time is unverified, spread/slippage is abnormal, trigger/confirmation is incomplete, invalidation is undefined, expected space to a realistic obstacle is below the configured minimum, risk limits are hit, or the thesis relies only on a headline.

## Rules for numeric levels

- Keep numeric values as JSON numbers, never locale-formatted strings. Formatting belongs to the UI.
- Use explicit timezone-aware date conventions (`YYYY-MM-DD` for plan/data dates and an IANA timezone such as `Asia/Tehran`). Event times are local to that timezone unless a field explicitly says otherwise.
- Store a stable `id` for each level. `triggerLevelId`, `invalidationLevelId`, and `targetLevelIds` must resolve to real level IDs for the same instrument.
- When data is absent, use null/empty and mark the plan as needing refresh; do not silently keep a prior day's price as current.
- Do not merge levels automatically in the authoring template. If a future clustering rule is added, preserve source levels and document tolerances and importance logic.

## UI and UX standards

- Persian RTL content; price/time strings use LTR or tabular numerals for scanning.
- Clear hierarchy: overview, price map, scenarios, levels, schedule, risk, checklist, review, sources. Avoid dashboard clutter and use progressive disclosure for editors.
- Dark default palette with light mode, contrast-aware semantic colors, keyboard-focus indication, responsive mobile layout and print/PDF stylesheet.
- The chart must disclose whether it is live data, historical levels or a schematic. The current view is an SVG price-level map, not a candlestick chart.
- No remote JS/CSS packages are required; the UI should still work with network access disabled.
- Local storage is browser-local. JSON export is the portable backup; import must validate structure and escape all text inserted in HTML.

## Data quality rubric

Before publishing a daily report, verify these gates:

- [ ] Plan date, timezone and generated-at date are explicit.
- [ ] Data-as-of date and status are explicit; reference levels have sources/dates.
- [ ] Every current/hot news claim was checked against a recent source and is labeled fact vs interpretation.
- [ ] Calendar dates/timezones were verified against official or primary calendar pages.
- [ ] Each instrument has a concise bias and explicit invalidation for that bias.
- [ ] Each scenario links to valid levels and contains trigger, confirmation, invalidation, stop method, targets and no-trade filters.
- [ ] No exact prices are invented where the current chart or contract specifications are unavailable.
- [ ] RR uses the actual entry, stop, target and costs; broker tick/lot calculation is not guessed.
- [ ] Correlated instrument risk, news windows, spread and daily stop limits are explicit.
- [ ] Sources/assumptions are included; stale values are visually prominent.
- [ ] The JSON passes schema validation and the UI smoke test.

## Daily update procedure

1. Copy the last plan to a new date only as a **draft**, clear `dataAsOf`, and mark `dataMode = needs-refresh`.
2. Refresh prices, levels, macro calendar, recent news, broker conditions and timezone conversions.
3. Update scenarios and targets from the new structure; do not mechanically carry over yesterday's prices.
4. Check the data-quality rubric, export JSON, inspect the visual chart, then publish/archive the plan.
5. At end of session, store notes about execution and process quality for tomorrow's review.

## Compatibility with the Python backend roadmap

`schemas/daily-plan.schema.json` and the example JSON are the hand-off contract. A future Python service should validate this contract at API boundaries, persist each daily plan version, store source metadata separately where needed, and keep live-market adapters explicitly optional. The static frontend must not pretend that localStorage is a central database or that manual data is live.