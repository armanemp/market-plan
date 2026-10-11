# Frontend architecture notes

- **Rendering:** single-page vanilla HTML/CSS/JavaScript; no build tool or runtime dependency.
- **Chart:** inline SVG generated from instrument levels and selected scenario. It intentionally renders a price-level map plus a schematic target path, not fabricated OHLC candles.
- **Domain model:** `DailyPlan → instruments[] → levels[] + scenarios[]`; scenarios reference level IDs instead of duplicating price numbers, so level edits update the map and scenario detail consistently.
- **Local persistence:** `localStorage` keys are namespaced by schema version and plan date. Browser storage is local-only; export/import JSON is the cross-device mechanism until backend storage exists.
- **Safety boundaries:** no live quote fetch, no news scraping, no broker credentials, no lot-size guess, no order placement. The calculator explains the limitations and validates long/short geometry.
- **Python integration path:** preserve `schemaVersion`, validate on API input, and add migrations when the contract changes. Keep the renderer independent from market-data providers.
- **Accessibility:** semantic headings, button-based selectable cards, `aria-pressed`, focus-visible styling, status announcements, responsive layout and print stylesheet.