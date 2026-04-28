import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import type { Wallet, Currency } from './types';
import { generateId } from './_id';

export const useWalletStore = defineStore('wallets', () => {
  const wallets = ref<Wallet[]>([]);

  const byId = computed(() =>
    Object.fromEntries(wallets.value.map((w) => [w.id, w]))
  );

  function getById(id: string): Wallet | undefined {
    return byId.value[id];
  }

  function byCurrency(currency: Currency | 'ALL'): Wallet[] {
    return currency === 'ALL'
      ? wallets.value
      : wallets.value.filter((w) => w.currency === currency);
  }

  function add(input: Omit<Wallet, 'id' | 'createdAt'>): Wallet {
    const wallet: Wallet = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    wallets.value.push(wallet);
    return wallet;
  }

  function update(id: string, patch: Partial<Wallet>): Wallet | null {
    const index = wallets.value.findIndex((w) => w.id === id);
    if (index === -1) return null;
    const next = {
      ...wallets.value[index]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    wallets.value[index] = next;
    return next;
  }

  function remove(id: string): boolean {
    const before = wallets.value.length;
    wallets.value = wallets.value.filter((w) => w.id !== id);
    return wallets.value.length < before;
  }

  function adjustBalance(id: string, delta: number): void {
    const w = getById(id);
    if (!w) return;
    update(id, { balance: w.balance + delta });
  }

  return { wallets, byId, getById, byCurrency, add, update, remove, adjustBalance };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWalletStore, import.meta.hot));
}
