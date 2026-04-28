// localStorage persistence Pinia plugin for Moneta v2.
//
// - Hydrates each store from its mapped key on creation.
// - Subscribes for mutations and writes back on every change.
// - Uses v1 keys verbatim where possible so v1→v2 migration (task 9) is
//   close to a no-op for the bulk collections (wallets / transactions /
//   budgets / goals / recurring). Only `settings` consolidates many v1
//   keys into a single v2 object.

import type { PiniaPluginContext } from 'pinia';

interface StoreMapping {
  // localStorage key
  key: string;
  // The ref on $state to persist as the raw value, or null to persist the
  // entire $state object as one blob.
  source: string | null;
}

const MAPPINGS: Record<string, StoreMapping> = {
  wallets:      { key: 'moneyManager_wallets',              source: 'wallets' },
  transactions: { key: 'moneyManager_transactions',         source: 'transactions' },
  budgets:      { key: 'moneyManager_budgets',              source: 'budgets' },
  goals:        { key: 'moneyManager_goals',                source: 'goals' },
  recurring:    { key: 'moneyManager_recurringTransactions',source: 'items' },
  settings:     { key: 'moneta_v2_settings',                source: null },
};

function safeParse<T>(raw: string | null): T | undefined {
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function persistencePlugin({ store }: PiniaPluginContext): void {
  const mapping = MAPPINGS[store.$id];
  if (!mapping) return;

  // Hydrate from localStorage, if present.
  const raw = localStorage.getItem(mapping.key);
  const parsed = safeParse<unknown>(raw);
  if (parsed !== undefined) {
    const patch =
      mapping.source === null ? parsed : { [mapping.source]: parsed };
    store.$patch(patch as unknown as Parameters<typeof store.$patch>[0]);
  }

  // Persist on every mutation.
  store.$subscribe(
    (_mutation, state) => {
      const value =
        mapping.source === null ? state : state[mapping.source];
      try {
        localStorage.setItem(mapping.key, JSON.stringify(value));
      } catch (err) {
        // Quota exceeded is the realistic failure here. Surface to console
        // so receipt-photo storage warnings can react; don't throw.
        console.error('[moneta] persistence write failed', store.$id, err);
      }
    },
    { detached: true }
  );
}
