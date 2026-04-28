import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import type { RecurringTransaction, RecurringFrequency } from './types';
import { generateId } from './_id';

const DAY_MS = 86400000;

export function calculateNextDate(current: string, frequency: RecurringFrequency): string {
  const d = new Date(current);
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString();
}

export const useRecurringStore = defineStore('recurring', () => {
  const items = ref<RecurringTransaction[]>([]);

  const active = computed(() => items.value.filter((r) => !r.isPaused));
  const paused = computed(() => items.value.filter((r) => !!r.isPaused));

  function add(input: Omit<RecurringTransaction, 'id' | 'createdAt'>): RecurringTransaction {
    const r: RecurringTransaction = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    items.value.push(r);
    return r;
  }

  function update(id: string, patch: Partial<RecurringTransaction>): RecurringTransaction | null {
    const index = items.value.findIndex((r) => r.id === id);
    if (index === -1) return null;
    const next = {
      ...items.value[index]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    items.value[index] = next;
    return next;
  }

  function remove(id: string): boolean {
    const before = items.value.length;
    items.value = items.value.filter((r) => r.id !== id);
    return items.value.length < before;
  }

  function pause(id: string): RecurringTransaction | null {
    return update(id, { isPaused: true });
  }

  function resume(id: string): RecurringTransaction | null {
    return update(id, { isPaused: false });
  }

  // Returns recurring entries due now or in the past, capped to last 90 days
  // (older than that are considered abandoned and skipped — matches v1 behavior).
  function dueItems(now: Date = new Date()): RecurringTransaction[] {
    const cutoff = now.getTime() - 90 * DAY_MS;
    return active.value.filter((r) => {
      const next = new Date(r.nextDate).getTime();
      return next <= now.getTime() && next >= cutoff;
    });
  }

  return {
    items,
    active,
    paused,
    add,
    update,
    remove,
    pause,
    resume,
    dueItems,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRecurringStore, import.meta.hot));
}
