import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createApp, nextTick } from 'vue';

import { useWalletStore } from '../wallet-store';
import { useTransactionStore } from '../transaction-store';
import { useBudgetStore } from '../budget-store';
import { useGoalStore } from '../goal-store';
import { useRecurringStore, calculateNextDate } from '../recurring-store';
import { useSettingsStore } from '../settings-store';

beforeEach(() => {
  setActivePinia(createPinia());
});

// ---------------------------------------------------------------------------
// wallet-store
// ---------------------------------------------------------------------------
describe('wallet-store', () => {
  it('adds a wallet and finds it by id', () => {
    const store = useWalletStore();
    const w = store.add({ name: 'Cash', currency: 'NTD', platform: 'cash', balance: 1000 });
    expect(store.wallets).toHaveLength(1);
    expect(store.getById(w.id)).toBe(store.wallets[0]);
  });

  it('updates a wallet', () => {
    const store = useWalletStore();
    const w = store.add({ name: 'Old', currency: 'USD', platform: 'bank', balance: 0 });
    const updated = store.update(w.id, { name: 'New' });
    expect(updated?.name).toBe('New');
    expect(updated?.updatedAt).toBeDefined();
  });

  it('removes a wallet', () => {
    const store = useWalletStore();
    const w = store.add({ name: 'Temp', currency: 'IDR', platform: 'cash', balance: 0 });
    expect(store.remove(w.id)).toBe(true);
    expect(store.wallets).toHaveLength(0);
  });

  it('returns false when removing non-existent wallet', () => {
    const store = useWalletStore();
    expect(store.remove('ghost')).toBe(false);
  });

  it('adjusts balance by delta', () => {
    const store = useWalletStore();
    const w = store.add({ name: 'W', currency: 'NTD', platform: 'cash', balance: 500 });
    store.adjustBalance(w.id, 200);
    expect(store.getById(w.id)?.balance).toBe(700);
    store.adjustBalance(w.id, -100);
    expect(store.getById(w.id)?.balance).toBe(600);
  });

  it('byCurrency filters correctly', () => {
    const store = useWalletStore();
    store.add({ name: 'A', currency: 'NTD', platform: 'cash', balance: 0 });
    store.add({ name: 'B', currency: 'USD', platform: 'bank', balance: 0 });
    expect(store.byCurrency('NTD')).toHaveLength(1);
    expect(store.byCurrency('ALL')).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// transaction-store
// ---------------------------------------------------------------------------
describe('transaction-store', () => {
  function makeWallet(balance = 0) {
    return useWalletStore().add({ name: 'W', currency: 'NTD', platform: 'cash', balance });
  }

  it('income adds to wallet balance', () => {
    const wallets = useWalletStore();
    const tx = useTransactionStore();
    const w = makeWallet(100);
    tx.add({ type: 'income', amount: 50, currency: 'NTD', walletId: w.id, date: new Date().toISOString() });
    expect(wallets.getById(w.id)?.balance).toBe(150);
  });

  it('expense subtracts from wallet balance', () => {
    const wallets = useWalletStore();
    const tx = useTransactionStore();
    const w = makeWallet(200);
    tx.add({ type: 'expense', amount: 80, currency: 'NTD', walletId: w.id, date: new Date().toISOString() });
    expect(wallets.getById(w.id)?.balance).toBe(120);
  });

  it('transfer moves between wallets', () => {
    const wallets = useWalletStore();
    const tx = useTransactionStore();
    const src = makeWallet(500);
    const dst = wallets.add({ name: 'D', currency: 'USD', platform: 'bank', balance: 0 });
    tx.add({
      type: 'transfer',
      amount: 100,
      currency: 'NTD',
      sourceWalletId: src.id,
      targetWalletId: dst.id,
      targetAmount: 3,
      date: new Date().toISOString(),
    });
    expect(wallets.getById(src.id)?.balance).toBe(400);
    expect(wallets.getById(dst.id)?.balance).toBe(3);
  });

  it('remove reverses wallet balance', () => {
    const wallets = useWalletStore();
    const tx = useTransactionStore();
    const w = makeWallet(100);
    const t = tx.add({ type: 'income', amount: 50, currency: 'NTD', walletId: w.id, date: new Date().toISOString() });
    expect(wallets.getById(w.id)?.balance).toBe(150);
    tx.remove(t.id);
    expect(wallets.getById(w.id)?.balance).toBe(100);
  });

  it('update reverses old and applies new wallet balance', () => {
    const wallets = useWalletStore();
    const tx = useTransactionStore();
    const w = makeWallet(200);
    const t = tx.add({ type: 'expense', amount: 50, currency: 'NTD', walletId: w.id, date: new Date().toISOString() });
    expect(wallets.getById(w.id)?.balance).toBe(150);
    tx.update(t.id, { amount: 80 });
    expect(wallets.getById(w.id)?.balance).toBe(120);
  });

  it('byType and byDateRange filter correctly', () => {
    const tx = useTransactionStore();
    const w = useWalletStore().add({ name: 'W', currency: 'NTD', platform: 'cash', balance: 1000 });
    tx.add({ type: 'income',  amount: 10, currency: 'NTD', walletId: w.id, date: '2025-01-15T00:00:00Z' });
    tx.add({ type: 'expense', amount: 5,  currency: 'NTD', walletId: w.id, date: '2025-01-20T00:00:00Z' });
    expect(tx.byType('income')).toHaveLength(1);
    expect(tx.byDateRange(new Date('2025-01-01'), new Date('2025-01-31'))).toHaveLength(2);
    expect(tx.byDateRange(new Date('2025-02-01'), new Date('2025-02-28'))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// budget-store
// ---------------------------------------------------------------------------
describe('budget-store', () => {
  it('adds and removes a budget', () => {
    const store = useBudgetStore();
    const b = store.add({ categoryId: 'food', limitAmount: 3000, currency: 'NTD' });
    expect(store.budgets).toHaveLength(1);
    store.remove(b.id);
    expect(store.budgets).toHaveLength(0);
  });

  it('calculateUsage sums current-month expenses for matching category+currency', () => {
    const wallets = useWalletStore();
    const tx = useTransactionStore();
    const budgets = useBudgetStore();

    const w = wallets.add({ name: 'W', currency: 'NTD', platform: 'cash', balance: 5000 });
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-10T00:00:00Z`;

    tx.add({ type: 'expense', amount: 500, currency: 'NTD', walletId: w.id, categoryId: 'food', date: thisMonth });
    tx.add({ type: 'expense', amount: 300, currency: 'NTD', walletId: w.id, categoryId: 'food', date: thisMonth });
    tx.add({ type: 'expense', amount: 200, currency: 'USD', walletId: w.id, categoryId: 'food', date: thisMonth }); // different currency — excluded

    const b = budgets.add({ categoryId: 'food', limitAmount: 2000, currency: 'NTD' });
    expect(budgets.calculateUsage(b)).toBe(800);
  });

  it('usageByBudget computed updates reactively', () => {
    const wallets = useWalletStore();
    const tx = useTransactionStore();
    const budgets = useBudgetStore();

    const w = wallets.add({ name: 'W', currency: 'NTD', platform: 'cash', balance: 5000 });
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05T00:00:00Z`;

    const b = budgets.add({ categoryId: 'transport', limitAmount: 1000, currency: 'NTD' });
    expect(budgets.usageByBudget[b.id]).toBe(0);

    tx.add({ type: 'expense', amount: 250, currency: 'NTD', walletId: w.id, categoryId: 'transport', date });
    expect(budgets.usageByBudget[b.id]).toBe(250);
  });
});

// ---------------------------------------------------------------------------
// goal-store
// ---------------------------------------------------------------------------
describe('goal-store', () => {
  const base = { name: 'Emergency Fund', targetAmount: 10000, currency: 'NTD' as const, deadline: null, linkedWalletId: null };

  it('adds a goal with savedAmount=0 and status=active', () => {
    const store = useGoalStore();
    const g = store.add(base);
    expect(g.savedAmount).toBe(0);
    expect(g.status).toBe('active');
    expect(store.active).toHaveLength(1);
  });

  it('contribute increases savedAmount', () => {
    const store = useGoalStore();
    const g = store.add(base);
    const result = store.contribute(g.id, 3000);
    expect(result?.savedAmount).toBe(3000);
    expect(result?.status).toBe('active');
  });

  it('contribute marks completed when savedAmount reaches targetAmount', () => {
    const store = useGoalStore();
    const g = store.add({ ...base, targetAmount: 5000 });
    store.contribute(g.id, 5000);
    expect(store.completed).toHaveLength(1);
    expect(store.active).toHaveLength(0);
  });

  it('withdraw reduces savedAmount and reactivates if completed', () => {
    const store = useGoalStore();
    const g = store.add({ ...base, targetAmount: 100 });
    store.contribute(g.id, 100); // now completed
    store.withdraw(g.id, 20);
    const updated = store.goals.find((x) => x.id === g.id);
    expect(updated?.savedAmount).toBe(80);
    expect(updated?.status).toBe('active');
  });

  it('withdraw never goes below 0', () => {
    const store = useGoalStore();
    const g = store.add(base);
    store.withdraw(g.id, 999999);
    expect(store.goals.find((x) => x.id === g.id)?.savedAmount).toBe(0);
  });

  it('remove deletes the goal', () => {
    const store = useGoalStore();
    const g = store.add(base);
    expect(store.remove(g.id)).toBe(true);
    expect(store.goals).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// recurring-store
// ---------------------------------------------------------------------------
describe('recurring-store — calculateNextDate', () => {
  it('advances by one day for daily', () => {
    const result = calculateNextDate('2025-03-01T00:00:00Z', 'daily');
    expect(new Date(result).getUTCDate()).toBe(2);
  });

  it('advances by 7 days for weekly', () => {
    const result = calculateNextDate('2025-03-01T00:00:00Z', 'weekly');
    expect(new Date(result).getUTCDate()).toBe(8);
  });

  it('advances by one month for monthly', () => {
    const result = calculateNextDate('2025-03-15T00:00:00Z', 'monthly');
    expect(new Date(result).getUTCMonth()).toBe(3); // April (0-indexed)
    expect(new Date(result).getUTCDate()).toBe(15);
  });

  it('advances by one year for yearly', () => {
    const result = calculateNextDate('2024-02-29T00:00:00Z', 'yearly'); // leap day
    expect(new Date(result).getUTCFullYear()).toBe(2025);
  });
});

describe('recurring-store — store', () => {
  it('adds an item and pause/resume toggles isPaused', () => {
    const store = useRecurringStore();
    const r = store.add({
      type: 'expense',
      amount: 200,
      currency: 'NTD',
      frequency: 'monthly',
      nextDate: new Date().toISOString(),
    });
    expect(store.active).toHaveLength(1);
    store.pause(r.id);
    expect(store.active).toHaveLength(0);
    expect(store.paused).toHaveLength(1);
    store.resume(r.id);
    expect(store.active).toHaveLength(1);
  });

  it('dueItems returns overdue active items within 90-day window', () => {
    const store = useRecurringStore();
    const now = new Date('2025-06-01T00:00:00Z');

    // 10 days ago — due, within window
    const past10 = new Date(now.getTime() - 10 * 86400000).toISOString();
    // 100 days ago — outside 90-day cap → skipped
    const past100 = new Date(now.getTime() - 100 * 86400000).toISOString();
    // in the future — not due
    const future = new Date(now.getTime() + 5 * 86400000).toISOString();

    store.add({ type: 'expense', amount: 100, currency: 'NTD', frequency: 'monthly', nextDate: past10 });
    store.add({ type: 'expense', amount: 100, currency: 'NTD', frequency: 'monthly', nextDate: past100 });
    store.add({ type: 'expense', amount: 100, currency: 'NTD', frequency: 'monthly', nextDate: future });

    const due = store.dueItems(now);
    expect(due).toHaveLength(1);
  });

  it('removes an item', () => {
    const store = useRecurringStore();
    const r = store.add({ type: 'income', amount: 5000, currency: 'NTD', frequency: 'monthly', nextDate: new Date().toISOString() });
    expect(store.remove(r.id)).toBe(true);
    expect(store.items).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// settings-store
// ---------------------------------------------------------------------------
describe('settings-store', () => {
  it('has correct defaults', () => {
    const store = useSettingsStore();
    expect(store.settings.baseCurrency).toBe('NTD');
    expect(store.settings.language).toBe('en');
    expect(store.settings.themeMode).toBe('dark');
    expect(store.rates.usdToNtd).toBe(31.6);
  });

  it('update patches settings', () => {
    const store = useSettingsStore();
    store.update({ language: 'zh', themeMode: 'light' });
    expect(store.settings.language).toBe('zh');
    expect(store.settings.themeMode).toBe('light');
    expect(store.settings.baseCurrency).toBe('NTD'); // unchanged
  });

  it('updateRates patches rates', () => {
    const store = useSettingsStore();
    store.updateRates({ usdToNtd: 32.5 });
    expect(store.rates.usdToNtd).toBe(32.5);
    expect(store.rates.usdToIdr).toBe(16900); // unchanged
  });
});

// ---------------------------------------------------------------------------
// persistence plugin (localStorage hydration / write)
// happy-dom provides a real localStorage; we use it directly.
// $subscribe fires asynchronously for direct ref mutations, so we await
// nextTick() before checking localStorage in the write test.
// ---------------------------------------------------------------------------
import { persistencePlugin } from '../persistence';

describe('persistence plugin', () => {
  // Each test gets a fresh pinia WITH the plugin and a clean localStorage.
  // Pinia plugins require the pinia to be installed on a Vue app to fire,
  // so we mount a throwaway app per test.
  beforeEach(() => {
    localStorage.clear();
    const app = createApp({});
    const pinia = createPinia();
    pinia.use(persistencePlugin);
    app.use(pinia);
    setActivePinia(pinia);
  });

  it('writes to localStorage on mutation', async () => {
    const store = useWalletStore();
    store.add({ name: 'Test', currency: 'NTD', platform: 'cash', balance: 123 });
    await nextTick(); // flush Vue's async effect queue so $subscribe fires

    const saved = JSON.parse(localStorage.getItem('moneyManager_wallets') ?? '[]') as { balance: number }[];
    expect(saved[0]?.balance).toBe(123);
  });

  it('hydrates store from localStorage on creation', () => {
    // Seed localStorage BEFORE creating the store (hydration happens at store init).
    const seedWallets = [{ id: 'abc', name: 'Seeded', currency: 'USD', platform: 'bank', balance: 999, createdAt: new Date().toISOString() }];
    localStorage.setItem('moneyManager_wallets', JSON.stringify(seedWallets));

    // Force a fresh pinia + Vue app so the plugin re-runs hydration on a brand-new store.
    const app = createApp({});
    const freshPinia = createPinia();
    freshPinia.use(persistencePlugin);
    app.use(freshPinia);
    setActivePinia(freshPinia);

    const store = useWalletStore();
    expect(store.wallets[0]?.name).toBe('Seeded');
    expect(store.wallets[0]?.balance).toBe(999);
  });
});
