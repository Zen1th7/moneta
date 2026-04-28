import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import type { Budget } from './types';
import { generateId } from './_id';
import { useTransactionStore } from './transaction-store';

export const useBudgetStore = defineStore('budgets', () => {
  const budgets = ref<Budget[]>([]);

  function add(input: Omit<Budget, 'id' | 'createdAt'>): Budget {
    const b: Budget = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    budgets.value.push(b);
    return b;
  }

  function update(id: string, patch: Partial<Budget>): Budget | null {
    const index = budgets.value.findIndex((b) => b.id === id);
    if (index === -1) return null;
    const next = {
      ...budgets.value[index]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    budgets.value[index] = next;
    return next;
  }

  function remove(id: string): boolean {
    const before = budgets.value.length;
    budgets.value = budgets.value.filter((b) => b.id !== id);
    return budgets.value.length < before;
  }

  // Sum of expense transactions for a category in the current calendar month, in the budget's currency.
  function calculateUsage(budget: Budget): number {
    const tx = useTransactionStore();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return tx.transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.categoryId === budget.categoryId &&
          t.currency === budget.currency &&
          new Date(t.date) >= start &&
          new Date(t.date) < end
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  const usageByBudget = computed(() =>
    Object.fromEntries(budgets.value.map((b) => [b.id, calculateUsage(b)]))
  );

  return { budgets, add, update, remove, calculateUsage, usageByBudget };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBudgetStore, import.meta.hot));
}
