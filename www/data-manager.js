/**
 * DATA MANAGER
 * Handles all data persistence using localStorage
 * Manages wallets, transactions, and conversion rates
 */

class DataManager {
  constructor() {
    this.STORAGE_KEYS = {
      WALLETS: 'moneyManager_wallets',
      TRANSACTIONS: 'moneyManager_transactions',
      RATES: 'moneyManager_conversionRates',
      SETTINGS: 'moneyManager_settings',
      CATEGORIES: 'transactionCategories',
      BIOMETRIC_ENABLED: 'moneyManager_biometricEnabled',
      BASE_CURRENCY: 'moneyManager_baseCurrency',
      RECURRING: 'moneyManager_recurringTransactions',
      NOTIF_REMINDER_ENABLED: 'moneyManager_notifReminderEnabled',
      NOTIF_QUICK_ACTIONS_ENABLED: 'moneyManager_notifQuickActionsEnabled'
    };

    this.init();
  }

  /**
   * Initialize data structure
   */
  init() {
    // Check if data exists, if not, create default structure
    if (!this.getWallets()) {
      this.saveWallets([]);
    }
    if (!this.getTransactions()) {
      this.saveTransactions([]);
    }
    if (!this.getConversionRates()) {
      this.saveConversionRates({
        usdToNtd: 31.60,
        usdToIdr: 16900,
        ntdToIdr: 535
      });
    }
    if (!this.getRecurringTransactions()) {
      this.saveRecurringTransactions([]);
    }
  }

  /**
   * WALLETS
   */
  getWallets() {
    const data = localStorage.getItem(this.STORAGE_KEYS.WALLETS);
    return data ? JSON.parse(data) : null;
  }

  saveWallets(wallets) {
    localStorage.setItem(this.STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  }

  addWallet(wallet) {
    const wallets = this.getWallets();
    wallet.id = this.generateId();
    wallet.createdAt = new Date().toISOString();
    wallets.push(wallet);
    this.saveWallets(wallets);
    return wallet;
  }

  updateWallet(id, updatedWallet) {
    const wallets = this.getWallets();
    const index = wallets.findIndex(w => w.id === id);
    if (index !== -1) {
      wallets[index] = { ...wallets[index], ...updatedWallet, updatedAt: new Date().toISOString() };
      this.saveWallets(wallets);
      return wallets[index];
    }
    return null;
  }

  deleteWallet(id) {
    // 1. Remove the wallet
    const wallets = this.getWallets();
    const filteredWallets = wallets.filter(w => w.id !== id);
    this.saveWallets(filteredWallets);

    // 2. Cascading delete: Remove transactions associated with this wallet
    const transactions = this.getTransactions();
    const filteredTransactions = transactions.filter(t => t.walletId !== id && t.targetWalletId !== id);
    this.saveTransactions(filteredTransactions);

    // 3. Cascading delete: Remove recurring transactions associated with this wallet
    const recurring = this.getRecurringTransactions();
    const filteredRecurring = recurring.filter(r => r.walletId !== id && r.targetWalletId !== id);
    this.saveRecurringTransactions(filteredRecurring);

    return true;
  }

  getWalletById(id) {
    const wallets = this.getWallets();
    return wallets.find(w => w.id === id);
  }

  getWalletsByCurrency(currency) {
    const wallets = this.getWallets();
    return currency === 'ALL' ? wallets : wallets.filter(w => w.currency === currency);
  }

  /**
   * TRANSACTIONS
   */
  getTransactions() {
    const data = localStorage.getItem(this.STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : null;
  }

  saveTransactions(transactions) {
    localStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  addTransaction(transaction) {
    const transactions = this.getTransactions();
    transaction.id = this.generateId();
    transaction.createdAt = new Date().toISOString();
    transactions.unshift(transaction); // Add to beginning for recent-first order
    this.saveTransactions(transactions);

    // Update wallet balance
    this.updateWalletBalance(transaction);

    return transaction;
  }

  updateTransaction(id, updatedTransaction) {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      // Reverse the old transaction's effect on wallet
      this.reverseWalletBalance(transactions[index]);

      // Update transaction
      transactions[index] = { ...transactions[index], ...updatedTransaction, updatedAt: new Date().toISOString() };
      this.saveTransactions(transactions);

      // Apply new transaction's effect on wallet
      this.updateWalletBalance(transactions[index]);

      return transactions[index];
    }
    return null;
  }

  deleteTransaction(id) {
    const transactions = this.getTransactions();
    const transaction = transactions.find(t => t.id === id);

    if (transaction) {
      // Reverse the transaction's effect on wallet
      this.reverseWalletBalance(transaction);

      // Remove transaction
      const filtered = transactions.filter(t => t.id !== id);
      this.saveTransactions(filtered);
      return true;
    }
    return false;
  }

  getTransactionsByCurrency(currency) {
    const transactions = this.getTransactions();
    return currency === 'ALL' ? transactions : transactions.filter(t => t.currency === currency);
  }

  getTransactionsByDateRange(startDate, endDate) {
    const transactions = this.getTransactions();
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
  }

  getTransactionsByType(type) {
    const transactions = this.getTransactions();
    return transactions.filter(t => t.type === type);
  }

  /**
   * RECURRING TRANSACTIONS
   */
  getRecurringTransactions() {
    const data = localStorage.getItem(this.STORAGE_KEYS.RECURRING);
    return data ? JSON.parse(data) : [];
  }

  saveRecurringTransactions(recurring) {
    localStorage.setItem(this.STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
  }

  addRecurringTransaction(recurring) {
    const all = this.getRecurringTransactions();
    recurring.id = this.generateId();
    recurring.createdAt = new Date().toISOString();
    all.push(recurring);
    this.saveRecurringTransactions(all);
    return recurring;
  }

  updateRecurringTransaction(id, updated) {
    const all = this.getRecurringTransactions();
    const index = all.findIndex(r => r.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updated, updatedAt: new Date().toISOString() };
      this.saveRecurringTransactions(all);
      return all[index];
    }
    return null;
  }

  deleteRecurringTransaction(id) {
    const all = this.getRecurringTransactions();
    const filtered = all.filter(r => r.id !== id);
    this.saveRecurringTransactions(filtered);
    return true;
  }

  /**
   * Update wallet balance based on transaction
   */
  updateWalletBalance(transaction) {
    // Unified Transfer Logic
    if (transaction.type === 'transfer') {
      // Need to handle cases where walletId is used (legacy) vs source/target
      const sourceId = transaction.sourceWalletId || transaction.walletId;
      const targetId = transaction.targetWalletId;

      const sourceWallet = sourceId ? this.getWalletById(sourceId) : null;
      const targetWallet = targetId ? this.getWalletById(targetId) : null;

      if (sourceWallet) {
        sourceWallet.balance = parseFloat(sourceWallet.balance) - parseFloat(transaction.amount);
        this.updateWallet(sourceWallet.id, sourceWallet);
      }
      if (targetWallet && transaction.targetAmount) {
        targetWallet.balance = parseFloat(targetWallet.balance) + parseFloat(transaction.targetAmount);
        this.updateWallet(targetWallet.id, targetWallet);
      }
      return; // Done
    }

    // Standard Income/Expense Logic
    const wallet = this.getWalletById(transaction.walletId);
    if (!wallet) return;

    let amount = parseFloat(transaction.amount);

    if (transaction.type === 'income') {
      wallet.balance = parseFloat(wallet.balance) + amount;
    } else if (transaction.type === 'expense') {
      wallet.balance = parseFloat(wallet.balance) - amount;
    }

    this.updateWallet(wallet.id, wallet);
  }

  /**
   * Reverse wallet balance change (for editing/deleting transactions)
   */
  reverseWalletBalance(transaction) {
    console.log('Reversing wallet balance for:', transaction);

    // Unified Transfer Reversal
    if (transaction.type === 'transfer') {
      const sourceWallet = this.getWalletById(transaction.sourceWalletId);
      const targetWallet = this.getWalletById(transaction.targetWalletId);

      if (sourceWallet) {
        // Refund the source
        sourceWallet.balance = parseFloat(sourceWallet.balance) + parseFloat(transaction.amount);
        this.updateWallet(sourceWallet.id, sourceWallet);
      }
      if (targetWallet) {
        // Deduct from target
        targetWallet.balance = parseFloat(targetWallet.balance) - parseFloat(transaction.targetAmount);
        this.updateWallet(targetWallet.id, targetWallet);
      }
      return;
    }

    // Standard Reversal
    const wallet = this.getWalletById(transaction.walletId);
    if (!wallet) return;

    let amount = parseFloat(transaction.amount);

    if (transaction.type === 'income') {
      wallet.balance = parseFloat(wallet.balance) - amount;
    } else if (transaction.type === 'expense') {
      wallet.balance = parseFloat(wallet.balance) + amount;
    }

    this.updateWallet(wallet.id, wallet);
  }

  /**
   * CONVERSION RATES
   */
  getConversionRates() {
    const data = localStorage.getItem(this.STORAGE_KEYS.RATES);
    let rates = data ? JSON.parse(data) : null;

    // Migration: If we have old rates, convert to new hierarchy
    if (rates && (!rates.ntdToIdr || !rates.usdToIdr)) {
      if (!rates.usdToNtd) rates.usdToNtd = 32.5;

      // Old idrToNtd was "per 1000 IDR"
      if (!rates.ntdToIdr) {
        rates.ntdToIdr = rates.idrToNtd ? (1000 / rates.idrToNtd) : 480;
      }
      if (!rates.usdToIdr) {
        rates.usdToIdr = rates.usdToNtd * rates.ntdToIdr;
      }

      // Cleanup old key
      delete rates.idrToNtd;

      this.saveConversionRates(rates);
    }

    return rates;
  }

  saveConversionRates(rates) {
    localStorage.setItem(this.STORAGE_KEYS.RATES, JSON.stringify(rates));
  }

  /**
   * EXPORT/IMPORT
   */
  exportAllData() {
    const categoriesData = localStorage.getItem(this.STORAGE_KEYS.CATEGORIES);
    const data = {
      wallets: this.getWallets(),
      transactions: this.getTransactions(),
      conversionRates: this.getConversionRates(),
      categories: categoriesData ? JSON.parse(categoriesData) : null,
      recurring: this.getRecurringTransactions(),
      exportedAt: new Date().toISOString(),
      version: '1.2.0'
    };
    return data;
  }

  importAllData(data) {
    try {
      // Validate data structure (minimum requirements)
      if (!data.wallets || !data.transactions) {
        throw new Error('Invalid data structure: Missing wallets or transactions');
      }

      // Import core data
      this.saveWallets(data.wallets);
      this.saveTransactions(data.transactions);

      if (data.conversionRates) {
        this.saveConversionRates(data.conversionRates);
      }

      // Import categories if present
      if (data.categories) {
        localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
      }

      // Import recurring transactions if present
      if (data.recurring) {
        this.saveRecurringTransactions(data.recurring);
      }

      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  clearAllData() {
    if (confirm(window.i18n.t('confirmDeleteAllData'))) {
      localStorage.clear();
      this.init();
      return true;
    }
    return false;
  }

  /**
   * Get statistics (income/expense) by currency for a specific timeframe
   * @param {string} type 'daily', 'monthly', or 'annual'
   * @param {string} dateStr ISO date string or partial (e.g. '2023-10-27', '2023-10', '2023')
   * @param {Array} additionalTransactions Optional array of extra transactions (e.g. projected)
   */
  getStatsByTimeframe(type, dateStr, additionalTransactions = []) {
    let transactions = this.getTransactions();
    if (additionalTransactions.length > 0) {
      transactions = [...transactions, ...additionalTransactions];
    }

    const stats = {};

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      let match = false;

      if (type === 'daily') {
        const target = new Date(dateStr);
        match = tDate.getFullYear() === target.getFullYear() &&
          tDate.getMonth() === target.getMonth() &&
          tDate.getDate() === target.getDate();
      } else if (type === 'monthly') {
        const [year, month] = dateStr.split('-').map(Number);
        match = tDate.getFullYear() === year && tDate.getMonth() === (month - 1);
      } else if (type === 'annual') {
        match = tDate.getFullYear() === Number(dateStr);
      } else if (type === 'custom') {
        const [start, end] = dateStr.split('|');
        const startDate = new Date(start);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        match = tDate >= startDate && tDate <= endDate;
      }

      if (match) {
        const currency = t.currency || 'NTD';
        if (!stats[currency]) {
          stats[currency] = { income: 0, expense: 0, transactions: [] };
        }

        if (t.type === 'income') {
          stats[currency].income += parseFloat(t.amount);
          stats[currency].transactions.push(t);
        } else if (t.type === 'expense') {
          stats[currency].expense += parseFloat(t.amount);
          stats[currency].transactions.push(t);
        } else if (t.type === 'transfer') {
          if (t.transferFee && parseFloat(t.transferFee) > 0) {
            const feeCurrency = t.targetCurrency || currency;
            if (!stats[feeCurrency]) stats[feeCurrency] = { income: 0, expense: 0, transactions: [] };
            stats[feeCurrency].expense += parseFloat(t.transferFee);
            stats[feeCurrency].transactions.push({
              ...t,
              type: 'expense',
              category: 'Transfer Fee',
              amount: parseFloat(t.transferFee),
              currency: feeCurrency
            });
          }
        }
      }
    });

    return stats;
  }

  getCategoryBreakdownByTimeframe(type, dateStr, transactionType, additionalTransactions = []) {
    const stats = this.getStatsByTimeframe(type, dateStr, additionalTransactions);
    const breakdown = {};

    Object.entries(stats).forEach(([currency, data]) => {
      breakdown[currency] = {};
      data.transactions
        .filter(t => t.type === transactionType)
        .forEach(t => {
          if (!breakdown[currency][t.category]) {
            breakdown[currency][t.category] = {
              total: 0,
              items: []
            };
          }
          breakdown[currency][t.category].total += t.amount;
          breakdown[currency][t.category].items.push(t);
        });
    });

    return breakdown;
  }

  getMonthlyStatsByCurrency(year, month) {
    return this.getStatsByTimeframe('monthly', `${year}-${month + 1}`);
  }

  getCategoryBreakdownByCurrency(year, month, transactionType) {
    const breakdown = this.getCategoryBreakdownByTimeframe('monthly', `${year}-${month + 1}`, transactionType);
    const simplisticBreakdown = {};
    Object.keys(breakdown).forEach(curr => {
      simplisticBreakdown[curr] = {};
      Object.keys(breakdown[curr]).forEach(cat => {
        simplisticBreakdown[curr][cat] = breakdown[curr][cat].total;
      });
    });
    return simplisticBreakdown;
  }

  // Keep old methods for backward compatibility if needed, but they are raw sums
  getMonthlyIncome(year, month) {
    const stats = this.getMonthlyStatsByCurrency(year, month);
    return Object.values(stats).reduce((sum, s) => sum + s.income, 0); // Still raw sum
  }

  getMonthlyExpenses(year, month) {
    const stats = this.getMonthlyStatsByCurrency(year, month);
    return Object.values(stats).reduce((sum, s) => sum + s.expense, 0); // Still raw sum
  }

  getExpensesByCategory(year, month) {
    const breakdown = this.getCategoryBreakdownByCurrency(year, month, 'expense');
    // For legacy, flatten just NTD or sum everything (not recommended)
    const flattened = {};
    Object.values(breakdown).forEach(currBreakdown => {
      Object.entries(currBreakdown).forEach(([cat, amt]) => {
        flattened[cat] = (flattened[cat] || 0) + amt;
      });
    });
    return flattened;
  }

  /**
   * UTILITIES
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  isBiometricEnabled() {
    return localStorage.getItem(this.STORAGE_KEYS.BIOMETRIC_ENABLED) === 'true';
  }

  setBiometricEnabled(enabled) {
    localStorage.setItem(this.STORAGE_KEYS.BIOMETRIC_ENABLED, enabled.toString());
  }

  getBaseCurrency() {
    return localStorage.getItem(this.STORAGE_KEYS.BASE_CURRENCY) || 'IDR';
  }

  setBaseCurrency(currency) {
    localStorage.setItem(this.STORAGE_KEYS.BASE_CURRENCY, currency);
  }

  isReminderEnabled() {
    return localStorage.getItem(this.STORAGE_KEYS.NOTIF_REMINDER_ENABLED) === 'true';
  }

  setReminderEnabled(enabled) {
    localStorage.setItem(this.STORAGE_KEYS.NOTIF_REMINDER_ENABLED, enabled.toString());
  }

  isQuickActionsEnabled() {
    return localStorage.getItem(this.STORAGE_KEYS.NOTIF_QUICK_ACTIONS_ENABLED) === 'true';
  }

  setQuickActionsEnabled(enabled) {
    localStorage.setItem(this.STORAGE_KEYS.NOTIF_QUICK_ACTIONS_ENABLED, enabled.toString());
  }
}

// Create global instance
const dataManager = new DataManager();
