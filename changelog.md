# 📜 Changelog

All notable changes to the **Smart Money Tracker** app will be documented in this file.

---

## [1.5.0] - 2026-01-31
### 🎉 Major Release: Smart Notifications, Analytics Overhaul, Base Currency, and Complete UI Refinement

#### 🆕 New Features
- **Smart Notifications System**:
  - Daily Reminder Notifications: Evening reminders to log transactions  
  - Quick Actions: Persistent notification with Income/Expense shortcuts
  - Fully localized (EN, ID, ZH)
  
- **Base Currency for Analytics**: Choose your preferred pivot currency (USD, NTD, IDR) for global Analytics summaries
- **Delete All Data**: Nuclear option in Settings to wipe all transactions and start fresh

#### 📊 Analytics & Data Improvements
- **Compact Analytics View**: Shows only categories and totals (decluttered)
- **Category Detail Modal**: Click any category to see individual transactions
- **Modal Pagination**: 7 items per page for smooth performance
- **Transaction History Sorting**: Now displays newest transactions first (latest at top)
- **Cash Flow Trend**: Fixed chart rendering and data accuracy
- **Full Date Localization**: Month and day names adapt to selected language

#### 🎨 User Interface Refinements
- **Soft Light Mode**: Warm cream/parchment palette to reduce eye strain (vs harsh white)
- **Settings UI Overhaul**: Icons persist correctly during language changes
- **Recurring UI Cleanup**: Fixed category field visibility in Edit modal
- **Form Improvements**: Better visual feedback, calculator for amount inputs
- **Global Padding**: Added spacing to prevent FAB (Floating Action Button) overlap

#### 🐛 Bug Fixes & Stability
- Fixed cascading wallet deletion (transactions properly removed)
- Fixed wallet dropdown sync after deletions
- Improved focus behavior when scrolling
- Fixed notification scheduling reliability

#### 🌐 Localization & Translation
- **Full Translation Standard**: Removed ALL hardcoded labels
- **Localized System Alerts**: All confirm/alert dialogs in EN/ID/ZH
- Enhanced translation engine with scoped DOM updates
- Everything dynamically translated based on selected language


## [1.4.4] - 2026-01-28
### 📊 Advanced Analytics: Compact Lists & Detail Modals
- **Compact Analytics**: Refactored the Income/Expense breakdown to show only categories and totals, significantly decluttering the view.
- **Detail Modal**: Added a new "Detail Sheet" that opens when clicking a category, displaying individual transactions with notes and dates.
- **Modal Pagination**: Implemented 7-item pagination within the category detail modal to ensure smooth performance even with hundreds of transactions.
- **Scroll Memory**: Modal automatically scrolls to top when navigating pages for better UX.

## [1.4.3] - 2026-01-28
### 🐛 Layout Fixes & Full Localization
- **Layout Repair**: Fixed critical bug where Settings cards (Security, Category Management, etc.) were incorrectly visible in Wallets, History, and Analytics sections.
- **Full Date Localization**: Analytics and Transaction lists now correctly display month and day names in Bahasa, Chinese, or English based on the selected app language.
- **Soothing Theme**: Refined Light Mode with a "Soft Yellow/Parchment" palette to further reduce eye strain and improve readability.

## [1.4.2] - 2026-01-27
### 🎨 Visual Comfort & Transparency
- **Soft Light Mode**: Replaced harsh pure white backgrounds with a more comfortable Cream/Light Yellow palette to reduce eye strain.
- **Analytics Transparency**: Added "Converted from [Source]" notes to breakdown items in the global "ALL" view.
- **Default Currency**: Set IDR as the standard default base currency for new users.

## [1.4.1] - 2026-01-27
### 🌐 Localization Refinement & Base Currency
- **Base Currency Setting**: Added option in Settings to choose preferred pivot currency (USD, NTD, IDR) for global Analytics.
- **Full Translation Standard**: Removed hardcoded "All" labels and hacky string splits. All tabs and buttons are now dynamically localized.
- **Localized System Alerts**: Standardized all `confirm()` and `alert()` dialogs across English, Bahasa, and Mandarin.
- **Sync Fix**: Ensuring transaction wallet dropdowns siempre show up-to-date balances after deletions.

## [1.4.0] - 2026-01-18
### 💱 Manual Currency Management & Precision Scheduling
- **Manual Currency Ratios**: Introduced a new "Currency Rates" section in Settings. Users can now manually define exact ratios for `USD/NTD`, `USD/IDR`, and `NTD/IDR`.
- **Smart Transfer Logic**: Transaction forms now dynamically suggest the correct conversion rate based on the source/target wallet's currency hierarchy (Strong-to-Weak logic).
- **Precision Recurring Schedules**: Added "Next Occurrence" date-time selector to recurring templates. Users can now specify the exact hour, date, or month for their automated transactions.


---

## [1.3.0] - 2026-01-18
### 🔁 Recurring Management & UI Refinement
- **Full Recurring Management**: Added full edit functionality allowed users to update categories, amounts, notes, and frequency of active templates.
- **Dashboard Spacing**: Optimized visual rhythm with improved breathing space between sections for a more professional feel.

---

## [1.2.0] - 2026-01-12
### 🔐 Biometric Security & Analytics update
- **Native Authentication**: Secure your data using Fingerprint or Face ID. Enable it in Settings → Appearance.
- **Privacy Guard**: The app now automatically triggers a biometric lock when you switch apps or return from the background.
- **Full Localization**: All charts (Balance Trend, Spending Analysis, Cash Flow) now feature fully translated titles, legends, and axis labels.
- **Refined Visuals**: Improved line chart logic and donut chart styling for better readability across all currencies.
- **Safe Data Migration**: Backups (JSON) now correctly include your custom categories—no more losing them after an import!

---

## [1.1.0] - 2026-01-08
### 🌐 Multi-Language Support
- **Full Localization**: Support for English, Indonesian (Bahasa), and Traditional Chinese across the entire app.
- **Settings Reorganization**: Improved the settings UI for better discoverability.
- **Bug Fix**: Android JSON & Excel Export fixes for native platforms.
- **Bug Fix**: Wallet window now closes automatically after deletion.
- **Bug Fix**: Corrected negative number formatting (e.g., -5,000).

---

## [1.0.0] - 2026-01-01
### 🚀 Initial Release
- **Transaction Tracking**: Easy recording of income and expenses.
- **Multi-Currency**: Support for USD, NTD, and IDR wallets.
- **History View**: detailed list of all past transactions.
- **Basic Analytics**: Simple spending visualization.
- **Privacy First**: All data stored locally on device.
