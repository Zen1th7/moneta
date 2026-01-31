# 💰 Smart Money Tracker

A lightweight, powerful, and private multi-currency money management application built for Android.

![Version](https://img.shields.io/badge/version-1.5.0-green.svg)
![Platform](https://img.shields.io/badge/platform-Android-brightgreen.svg)

## 🚀 Overview

Smart Money Tracker helps you manage your finances across different currencies with ease. It is built using standard web technologies (HTML, CSS, JS) and powered by **Capacitor** to run natively on Android.

## ✨ Key Features

- 📱 **Smart Notifications**: Daily reminders and persistent Quick Actions for instant transaction logging.
- 🔁 **Recurring Transactions**: Automate your daily, monthly, or yearly finances with powerful scheduling and a dedicated inline management dashboard. Now with **precise time/date scheduling**.
- 🔐 **Biometric Security**: Protect your financial privacy with **Fingerprint/Face ID** native authentication.
- 🌍 **Multi-Currency Support**: Manage wallets and transactions in **USD**, **NTD**, and **IDR**.
- 🌐 **Multi-Language**: Fully localized in English, Indonesian (Bahasa), and Traditional Chinese.
- 📊 **Detailed Analytics**: Track your spending patterns with daily, monthly, and yearly breakdowns.
- 📂 **Data Management**:
  - Export data to **JSON** for backups.
  - Export transactions to **Excel (XLSX)** for detailed reporting.
- 🌓 **Dark/Light Mode**: Sleek, modern interface with glassmorphism aesthetics.
- 🔒 **Privacy Focused**: All data is stored locally on your device. No cloud syncing, no tracking.

## 🛠 Tech Stack

- **Core**: Vanilla JavaScript, CSS3, HTML5
- **Native Bridge**: [Capacitor](https://capacitorjs.com/)
- **Libraries**:
  - [SheetJS (XLSX)](https://sheetjs.com/) - Excel generation
  - [@capacitor/local-notifications](https://capacitorjs.com/docs/apis/local-notifications) - Daily reminders & quick actions
  - [@capgo/capacitor-native-biometric](https://github.com/Capgo/capacitor-native-biometric) - Biometric auth
  - [@capacitor/share](https://capacitorjs.com/docs/apis/share) - Native file sharing
  - [@capacitor/filesystem](https://capacitorjs.com/docs/apis/filesystem) - Native file management

## 📦 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- [Android Studio](https://developer.android.com/studio)

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Zen1th7/smart-money-tracker.git
   cd smart-money-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Sync with Android**:
   ```bash
   npx cap sync android
   ```

4. **Run on Device**:
   Open the `android` folder in Android Studio and click **Run**.

## 🎯 What's New in v1.5.0

**Major Features:**
- 📱 **Smart Notifications**: Daily reminders + persistent Quick Actions for instant transaction logging
- 🌍 **Base Currency Analytics**: Choose your preferred pivot currency (USD/NTD/IDR) for global summaries
- 📊 **Analytics Overhaul**: Compact view, category detail modals, and pagination for smooth performance
- 💾 **Delete All Data**: Nuclear option to wipe everything and start fresh

**UI/UX Improvements:**
- 🎨 Soft Light Mode with warm parchment palette (reduced eye strain)
- ⚙️ Enhanced Settings UI with persistent icons during language changes
- 📈 Transaction history now sorted newest-first (latest at top)
- 🔧 Fixed cash flow trend chart rendering

**Localization:**
- Full translation standard (no more hardcoded labels)
- Localized system alerts in all languages
- Date localization in Analytics and lists

📖 See the full changelog: [CHANGELOG.md](./CHANGELOG.md)

---
*Created by Zen1th7*
