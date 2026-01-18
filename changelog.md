# 📜 Changelog

All notable changes to the **Smart Money Tracker** app will be documented in this file.

---

## [1.4.0] - 2026-01-18
### 💱 Manual Currency Management & Precision Scheduling
- **Manual Currency Ratios**: Introduced a new "Currency Rates" section in Settings. Users can now manually define exact ratios for `USD/NTD`, `USD/IDR`, and `NTD/IDR`.
- **Smart Transfer Logic**: Transaction forms now dynamically suggest the correct conversion rate based on the source/target wallet's currency hierarchy (Strong-to-Weak logic).
- **Precision Recurring Schedules**: Added "Next Occurrence" date-time selector to recurring templates. Users can now specify the exact hour, date, or month for their automated transactions.
- **Improved UI Formatting**: Implemented automatic thousands separators (e.g., 16,900) for all currency rate inputs, maintaining a premium feel throughout the settings and forms.
- **Real-time Localization**: Conversion prompts and recurrence labels now update instantly when the app language is switched.

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
