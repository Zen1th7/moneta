# 💰 Smart Money Tracker

A lightweight, powerful, and private multi-currency money management application built for Android.

![Version](https://img.shields.io/badge/version-1.4.0-green.svg)
![Platform](https://img.shields.io/badge/platform-Android-brightgreen.svg)

## 🚀 Overview

Smart Money Tracker helps you manage your finances across different currencies with ease. It is built using standard web technologies (HTML, CSS, JS) and powered by **Capacitor** to run natively on Android.

## ✨ Key Features

- 🔁 **Recurring Transactions**: Automate your daily, monthly, or yearly finances with powerful scheduling and a dedicated inline management dashboard. Now with **precise time/date scheduling**.
- 🔐 **Biometric Security**: Protect your financial privacy with **Fingerprint/Face ID** native authentication.
- 🌍 **Multi-Currency Support**: Manage wallets and transactions in **USD**, **NTD**, and **IDR**. Now with **manual exchange rate management**.
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

## 🚀 What's New in v1.4.0
- **Manual Currency Ratios**: Define exact exchange rates for USD, NTD, and IDR in Settings.
- **Strong-to-Weak Hierarchy**: "Smart Suggestions" now use a hierarchy logic (USD > NTD > IDR) for more intuitive transfers.
- **Precision Scheduling**: Set exact hours for daily runs, or specific dates/times for monthly and yearly cycles.
- **Aesthetic Number Formatting**: Thousands separators (10,000) are now active across all currency rate and transaction fields.

---
*Created by Zen1th7*
