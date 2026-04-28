## Context

Moneta is currently a vanilla JS PWA stored entirely in `www/`. All state lives in localStorage. The app has wallets, transactions, categories, multi-currency support, and basic analytics. There are no native device APIs (camera, file system). The codebase is a single-page app driven by `app.js` with no build step.

The migration to Vue 3 + Quasar + Capacitor is the foundation everything else builds on — it unlocks native device APIs (camera for receipt photos), a proper component model for complex UI (budgets, goals), and app store distribution.

## Goals / Non-Goals

**Goals:**
- Add budget tracking, financial goals, recurring transactions, spending insights, and receipt photos as new features
- Migrate to Vue 3 + Quasar + Capacitor with full feature parity to v1
- Preserve all existing localStorage data with a backward-compatible migration
- Keep the Midnight Gold design system intact via Quasar theme variables
- Enable native Android/iOS builds via Capacitor

**Non-Goals:**
- Cloud sync or backend server (stays fully offline/local)
- Multi-user or account sharing
- Bank/card API integrations (Plaid, Open Banking)
- Web-only Quasar SSR/PWA deployment (native app is the target)

## Decisions

### 1. Vue 3 + Quasar + Capacitor (not React Native / Flutter)
**Decision**: Use Vue 3 with Quasar Framework and Capacitor for native wrapping.
**Rationale**: Quasar provides a complete mobile-first component library with Capacitor integration out of the box. Vue 3's Composition API maps cleanly to the existing app's manager pattern. Capacitor gives access to native Camera, Filesystem, and Notifications APIs — all needed for receipt photos and recurring transaction alerts. React Native / Flutter would require a full rewrite with no code reuse.

### 2. Pinia for state management (not Vuex)
**Decision**: Use Pinia stores, one per domain (wallets, transactions, budgets, goals, recurring, settings).
**Rationale**: Pinia is the official Vue 3 state library, has a simpler API than Vuex 4, and its store structure maps 1:1 to the existing manager classes (`wallet-manager.js` → `useWalletStore`). Each store handles its own localStorage persistence via a Pinia plugin.

### 3. localStorage stays as the data layer (not SQLite)
**Decision**: Keep localStorage as the primary store, extended with new keys.
**Rationale**: The existing data is already in localStorage. Moving to SQLite (via Capacitor) would require a migration strategy and adds complexity. localStorage is sufficient for the data volumes a personal finance app generates. If scaling becomes an issue, a SQLite migration can be a future change.

### 4. Receipt photos stored as base64 in localStorage (not Filesystem)
**Decision**: Store receipt images as base64 strings inside the transaction record in localStorage.
**Rationale**: Simpler than managing a separate Capacitor Filesystem store with file path references. For a personal finance app, receipts are typically low-resolution phone photos — acceptable at base64. If storage limits become a problem, a future change can move to Filesystem with path references.

### 5. Recurring transactions use a "catch-up on open" strategy
**Decision**: When the app opens, check for any recurring transactions past their due date and create them all at once.
**Rationale**: Capacitor background tasks are complex and platform-inconsistent. A catch-up strategy (create all missed entries on next app open) is simpler, reliable, and consistent with how most mobile finance apps work.

### 6. Feature build order: specs first, then Vue migration
**Decision**: Implement all new features (budget, goals, recurring, insights, receipt photos) in the current vanilla JS codebase first, then migrate to Vue 3.
**Rationale**: Implementing in vanilla JS first lets us validate the data model and UX before the Vue migration. This reduces risk — the Vue migration becomes a pure refactor with working features to port, not a simultaneous feature + platform change.

## Risks / Trade-offs

- **localStorage limits (~5MB)**: Base64 receipt photos can fill storage quickly → Mitigation: warn user when storage > 80%, offer to clear receipt photos
- **Recurring catch-up on open**: If user doesn't open app for months, many transactions created at once → Mitigation: cap catch-up at 90 days, show a summary notification
- **Quasar + Capacitor version coupling**: Quasar and Capacitor versions must stay in sync → Mitigation: pin exact versions, only upgrade intentionally
- **Vanilla JS → Vue migration scope**: Large refactor risk → Mitigation: feature flags to toggle new Vue components; migrate screen by screen

## Migration Plan

1. **Phase 1 — New features in vanilla JS** (budget, goals, recurring, insights, receipt photos)
2. **Phase 2 — Vue 3 + Quasar project scaffold** alongside existing `www/` (no replacement yet)
3. **Phase 3 — Port screen by screen**: Wallets → Transactions → Analytics → Settings
4. **Phase 4 — localStorage migration script** runs on first app launch after update
5. **Phase 5 — Capacitor build** for Android (Google Play) then iOS (App Store)

## Open Questions

- Should budgets reset on calendar month or rolling 30 days? → Recommend calendar month (matches how people think about budgets)
- Should goals allow partial withdrawals (dipping into savings)? → Recommend yes, with a warning
- Receipt photo max resolution before compression? → Recommend 1024px longest side, ~200KB target
