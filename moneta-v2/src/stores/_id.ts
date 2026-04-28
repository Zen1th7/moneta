// Tiny ID helper — matches v1 DataManager.generateId() output style:
// timestamp + random suffix, sortable, no external deps.
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
