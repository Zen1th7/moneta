import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import type { Goal } from './types';
import { generateId } from './_id';

export const useGoalStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([]);

  const active = computed(() => goals.value.filter((g) => g.status === 'active'));
  const completed = computed(() => goals.value.filter((g) => g.status === 'completed'));

  function add(
    input: Omit<Goal, 'id' | 'createdAt' | 'savedAmount' | 'status'>
  ): Goal {
    const g: Goal = {
      ...input,
      id: generateId(),
      savedAmount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    goals.value.push(g);
    return g;
  }

  function update(id: string, patch: Partial<Goal>): Goal | null {
    const index = goals.value.findIndex((g) => g.id === id);
    if (index === -1) return null;
    const next = {
      ...goals.value[index]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    goals.value[index] = next;
    return next;
  }

  function remove(id: string): boolean {
    const before = goals.value.length;
    goals.value = goals.value.filter((g) => g.id !== id);
    return goals.value.length < before;
  }

  function contribute(id: string, amount: number): Goal | null {
    const g = goals.value.find((x) => x.id === id);
    if (!g) return null;
    const newSaved = g.savedAmount + amount;
    if (newSaved >= g.targetAmount) {
      return update(id, { savedAmount: newSaved, status: 'completed' });
    }
    return update(id, { savedAmount: newSaved });
  }

  function withdraw(id: string, amount: number): Goal | null {
    const g = goals.value.find((x) => x.id === id);
    if (!g) return null;
    return update(id, {
      savedAmount: Math.max(0, g.savedAmount - amount),
      status: 'active',
    });
  }

  return { goals, active, completed, add, update, remove, contribute, withdraw };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGoalStore, import.meta.hot));
}
