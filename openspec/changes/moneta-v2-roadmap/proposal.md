## Why

Moneta v1 delivers core wallet and transaction tracking but lacks the features users need to actively manage and grow their wealth — budgets, goals, recurring entries, and meaningful spending insights. The app also runs as a vanilla JS PWA, which limits scalability and the ability to ship as a native mobile app. Now is the right time to add high-value finance features and migrate to Vue 3 + Quasar + Capacitor to enable app store distribution.

## What Changes

- Add budget tracking: users can set monthly spending limits per category and see live progress
- Add financial goals: users can define savings targets with deadlines and track contributions
- Add recurring transactions: income and expense entries that auto-repeat on a schedule (daily/weekly/monthly)
- Add spending insights: visual breakdown of where money goes (by category, trend over time)
- Add receipt photos: users can attach a photo of a receipt to any transaction for record-keeping
- Migrate frontend from vanilla JS to Vue 3 + Quasar Framework + Capacitor for native iOS/Android packaging

## Capabilities

### New Capabilities

- `budget-tracking`: Set per-category monthly spending budgets and track live usage vs. limit with visual progress indicators
- `financial-goals`: Create savings goals with a target amount, deadline, and linked wallet; track contributions and projected completion
- `spending-insights`: Charts and summaries showing spending breakdown by category, income vs. expense trends, and month-over-month comparisons
- `receipt-photos`: Attach a photo (from camera or gallery) to any transaction; stored locally on device via Capacitor; viewable inline on the transaction detail
- `vue3-migration`: Migrate the entire frontend from vanilla JS/HTML/CSS to Vue 3 single-file components, Quasar Framework UI, and Capacitor for native mobile builds

### Modified Capabilities

- `recurring-transactions`: Feature already exists in v1 (daily/monthly/yearly, catch-up on open, CRUD). Adding: weekly frequency, pause/resume toggle, 90-day catch-up cap, and auto-created summary notification

## Impact

- **Code**: All `www/` files will be replaced by a new `src/` Vue 3 project structure; existing `app.js`, `styles.css`, `index.html` deprecated
- **Dependencies**: Add Vue 3, Quasar Framework, Capacitor, Vite; remove vanilla JS approach
- **Data**: localStorage schema extended with `budgets`, `goals`, `recurring`, and `receiptPhotos` collections; backward-compatible migration required
- **Distribution**: Capacitor enables submission to Google Play Store and Apple App Store
- **Design**: Midnight Gold design system (colors, typography) preserved and ported to Quasar theme variables
