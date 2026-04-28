## 1. Budget Tracking (Vanilla JS)

- [x] 1.1 Add `budgets` array to localStorage schema with fields: id, categoryId, limitAmount, currency, createdAt
- [x] 1.2 Create `budget-manager.js` with CRUD methods: createBudget, updateBudget, deleteBudget, getBudgets
- [x] 1.3 Add calculateBudgetUsage() that sums expense transactions for a category in the current calendar month
- [x] 1.4 Build budget list UI: cards with progress bar, used/remaining amounts, percentage label
- [x] 1.5 Add "Over budget" red state and "80% warning" amber state to budget cards
- [x] 1.6 Build Add/Edit Budget modal: category picker, amount input, currency selector
- [x] 1.7 Wire budget usage recalculation on every transaction save/delete
- [x] 1.8 Add push notification trigger when budget exceeds 80% and 100% (via existing notification-manager)

## 2. Financial Goals (Vanilla JS)

- [x] 2.1 Add `goals` array to localStorage schema: id, name, targetAmount, savedAmount, currency, deadline, linkedWalletId, status, createdAt
- [x] 2.2 Create `goal-manager.js` with: createGoal, contributeToGoal, withdrawFromGoal, completeGoal, deleteGoal
- [x] 2.3 Build goals list UI: cards with progress bar, saved/target amounts, projected completion date
- [x] 2.4 Add "On track" green and "Behind schedule" amber indicators based on contribution rate vs. deadline
- [x] 2.5 Build Add Goal modal: name, target amount, deadline (optional), linked wallet (optional)
- [x] 2.6 Build Contribute / Withdraw flow with confirmation dialogs
- [x] 2.7 Add goal completion animation and move completed goals to an archived section

## 3. Recurring Transactions — Enhancements Only (Vanilla JS)

> Core feature already exists in `recurring-manager.js`. Only adding: weekly frequency, pause/resume, 90-day cap, summary notification.

- [x] 3.1 Add `'weekly'` case to `calculateNextDate()` in recurring-manager.js (advances by 7 days)
- [x] 3.2 Add "Weekly" option to the frequency dropdown in Add/Edit Recurring modal UI
- [x] 3.3 Add `isPaused` field to recurring schema; add pauseRecurring() and resumeRecurring() methods
- [x] 3.4 Add Pause/Resume toggle button to each recurring card in the list UI with "Paused" badge state
- [x] 3.5 Cap catch-up in checkAndExecute() to skip occurrences older than 90 days
- [x] 3.6 Show dismissible in-app banner after catch-up: "X recurring transactions were automatically added"

## 4. Spending Insights (Vanilla JS)

- [x] 4.1 Add category breakdown donut chart to Analytics tab using existing Chart.js
- [x] 4.2 Build income vs. expense grouped bar chart for last 6 periods
- [x] 4.3 Add net cash flow summary card below the trend chart
- [x] 4.4 Build top 5 spending categories ranked list with amount and percentage
- [x] 4.5 Add month-over-month comparison badge (% change, red up arrow / green down arrow)
- [x] 4.6 Wire all insights to respect the active currency filter

## 5. Receipt Photos (Vanilla JS)

- [x] 5.1 Add `receiptPhoto` (base64 string, nullable) field to transaction schema
- [x] 5.2 Build image compression utility: resize to max 1024px longest side, ~200KB JPEG output
- [x] 5.3 Add "Add Receipt" button to the Add/Edit Transaction modal with camera + gallery options
- [x] 5.4 Wire camera via `<input type="file" accept="image/*" capture="environment">` for PWA phase
- [x] 5.5 Display receipt thumbnail in transaction detail view; tap to open fullscreen
- [x] 5.6 Add "Remove Receipt" action on transaction detail
- [x] 5.7 Show camera icon indicator on transaction list rows that have a receipt
- [x] 5.8 Add localStorage usage monitor: warn user at 80% capacity with option to clear receipt photos

## 6. Vue 3 + Quasar + Capacitor Project Setup

- [ ] 6.1 Scaffold new Quasar project with Vue 3, TypeScript, Pinia, and Capacitor mode enabled
- [ ] 6.2 Add Capacitor platforms: `npx cap add android` and `npx cap add ios`
- [ ] 6.3 Install Capacitor plugins: @capacitor/camera, @capacitor/local-notifications, @capacitor/filesystem
- [ ] 6.4 Configure Quasar SCSS variables to match Midnight Gold design system (dark + light theme)
- [ ] 6.5 Add Plus Jakarta Sans and JetBrains Mono fonts to Quasar project
- [ ] 6.6 Create Pinia stores: useWalletStore, useTransactionStore, useBudgetStore, useGoalStore, useRecurringStore, useSettingsStore
- [ ] 6.7 Implement localStorage persistence Pinia plugin that auto-saves each store on mutation

## 7. Vue 3 Migration — Screen by Screen

- [ ] 7.1 Port Wallets tab: WalletList, WalletCard, AddWalletModal components
- [ ] 7.2 Port Transactions tab: TransactionList, TransactionItem, AddTransactionModal with receipt photo support
- [ ] 7.3 Port Analytics tab: all existing charts + new spending insights components
- [ ] 7.4 Port Settings tab: all existing settings panels including theme toggle and language switcher
- [ ] 7.5 Port Budget tab: BudgetList, BudgetCard, AddBudgetModal
- [ ] 7.6 Port Goals tab: GoalList, GoalCard, AddGoalModal, ContributeModal
- [ ] 7.7 Port Recurring tab: RecurringList, RecurringCard, AddRecurringModal
- [ ] 7.8 Port global components: AppHeader, BottomNav, SplashScreen, LockScreen

## 8. Native Camera Integration (Capacitor)

- [ ] 8.1 Replace `<input file>` receipt capture with `@capacitor/camera` Camera.getPhoto()
- [ ] 8.2 Request and handle camera permission gracefully (prompt + settings redirect on denial)
- [ ] 8.3 Test receipt capture on physical Android device

## 9. Data Migration

- [ ] 9.1 Write v1→v2 localStorage migration script that transforms all v1 keys to v2 Pinia store format
- [ ] 9.2 Add migration version marker to localStorage (e.g. `moneta_schema_version: 2`)
- [ ] 9.3 Run migration on app init if version marker is absent or < 2
- [ ] 9.4 Test migration with real v1 data: wallets, transactions, categories, settings

## 10. Capacitor Build & Release

- [ ] 10.1 Configure `capacitor.config.ts`: appId, appName, webDir pointing to Quasar output
- [ ] 10.2 Run `quasar build -m capacitor -T android` and verify Android APK builds
- [ ] 10.3 Open Android Studio, test on emulator and physical device
- [ ] 10.4 Configure app signing for Google Play Store release build
- [ ] 10.5 Create Google Play Console listing and upload first internal test build
