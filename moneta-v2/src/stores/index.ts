import { defineStore } from '#q-app/wrappers';
import { createPinia } from 'pinia';
import { persistencePlugin } from './persistence';

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface PiniaCustomProperties {}
}

export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia();
  pinia.use(persistencePlugin);
  return pinia;
});
