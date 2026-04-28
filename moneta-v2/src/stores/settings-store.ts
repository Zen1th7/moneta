import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';
import type { Settings, ConversionRates } from './types';

const defaultSettings: Settings = {
  baseCurrency: 'NTD',
  language: 'en',
  themeMode: 'dark',
  biometricEnabled: false,
  notifReminderEnabled: false,
  notifQuickActionsEnabled: false,
};

const defaultRates: ConversionRates = {
  usdToNtd: 31.6,
  usdToIdr: 16900,
  ntdToIdr: 535,
};

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({ ...defaultSettings });
  const rates = ref<ConversionRates>({ ...defaultRates });

  function update(patch: Partial<Settings>): void {
    settings.value = { ...settings.value, ...patch };
  }

  function updateRates(patch: Partial<ConversionRates>): void {
    rates.value = { ...rates.value, ...patch };
  }

  return { settings, rates, update, updateRates };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
