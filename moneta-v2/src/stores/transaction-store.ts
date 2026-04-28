import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import type { Transaction, Currency, TransactionType } from './types';
import { generateId } from './_id';
import { useWalletStore } from './wallet-store';

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([]);

  function byCurrency(currency: Currency | 'ALL'): Transaction[] {
    return currency === 'ALL'
      ? transactions.value
      : transactions.value.filter((t) => t.currency === currency);
  }

  function byType(type: TransactionType): Transaction[] {
    return transactions.value.filter((t) => t.type === type);
  }

  function byDateRange(start: Date, end: Date): Transaction[] {
    return transactions.value.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  }

  function applyToWallet(t: Transaction, sign: 1 | -1): void {
    const wallets = useWalletStore();
    if (t.type === 'transfer') {
      const sourceId = t.sourceWalletId ?? t.walletId;
      if (sourceId) wallets.adjustBalance(sourceId, -sign * t.amount);
      if (t.targetWalletId && t.targetAmount != null) {
        wallets.adjustBalance(t.targetWalletId, sign * t.targetAmount);
      }
      return;
    }
    if (!t.walletId) return;
    const dir = t.type === 'income' ? 1 : -1;
    wallets.adjustBalance(t.walletId, sign * dir * t.amount);
  }

  function add(input: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const tx: Transaction = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    transactions.value.unshift(tx);
    applyToWallet(tx, 1);
    return tx;
  }

  function update(id: string, patch: Partial<Transaction>): Transaction | null {
    const index = transactions.value.findIndex((t) => t.id === id);
    if (index === -1) return null;
    const old = transactions.value[index]!;
    applyToWallet(old, -1);
    const next: Transaction = {
      ...old,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    transactions.value[index] = next;
    applyToWallet(next, 1);
    return next;
  }

  function remove(id: string): boolean {
    const tx = transactions.value.find((t) => t.id === id);
    if (!tx) return false;
    applyToWallet(tx, -1);
    transactions.value = transactions.value.filter((t) => t.id !== id);
    return true;
  }

  return { transactions, byCurrency, byType, byDateRange, add, update, remove };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTransactionStore, import.meta.hot));
}
