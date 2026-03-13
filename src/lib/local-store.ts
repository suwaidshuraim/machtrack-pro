/**
 * local-store.ts
 * Event-driven localStorage CRUD store — replaces Firestore entirely.
 * Operates only in the browser; SSR calls are no-ops.
 */

const PREFIX = 'machtrack_';

// ─── Event Emitter ───────────────────────────────────────────────────────────

type Listener = () => void;
const listeners: Map<string, Set<Listener>> = new Map();

export function subscribe(collectionName: string, fn: Listener): () => void {
  if (!listeners.has(collectionName)) listeners.set(collectionName, new Set());
  listeners.get(collectionName)!.add(fn);
  return () => listeners.get(collectionName)?.delete(fn);
}

function emit(collectionName: string) {
  listeners.get(collectionName)?.forEach(fn => fn());
}

// ─── Core Storage Helpers ─────────────────────────────────────────────────────

function storageKey(collectionName: string): string {
  return `${PREFIX}${collectionName}`;
}

export function getAll<T = any>(collectionName: string): (T & { id: string })[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(collectionName));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getById<T = any>(
  collectionName: string,
  id: string
): (T & { id: string }) | null {
  return getAll<T>(collectionName).find((item: any) => item.id === id) ?? null;
}

export function setItem<T = any>(
  collectionName: string,
  id: string,
  data: T
): void {
  if (typeof window === 'undefined') return;
  const items = getAll<T>(collectionName).filter((i: any) => i.id !== id);
  items.push({ ...data, id } as any);
  localStorage.setItem(storageKey(collectionName), JSON.stringify(items));
  emit(collectionName);
}

export function updateItem<T = any>(
  collectionName: string,
  id: string,
  partial: Partial<T>
): void {
  if (typeof window === 'undefined') return;
  const items = getAll<T>(collectionName).map((item: any) =>
    item.id === id ? { ...item, ...partial } : item
  );
  localStorage.setItem(storageKey(collectionName), JSON.stringify(items));
  emit(collectionName);
}

export function deleteItem(collectionName: string, id: string): void {
  if (typeof window === 'undefined') return;
  const items = getAll(collectionName).filter((item: any) => item.id !== id);
  localStorage.setItem(storageKey(collectionName), JSON.stringify(items));
  emit(collectionName);
}

export function addItem<T = any>(collectionName: string, data: T): string {
  const id =
    Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  setItem(collectionName, id, data);
  return id;
}

// ─── Initialize Empty Collections ────────────────────────────────────────────

function initEmpty(collectionName: string): void {
  if (typeof window === 'undefined') return;
  const key = storageKey(collectionName);
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, JSON.stringify([]));
  }
}

export function seedAllCollections(): void {
  // Initialize all collections as empty arrays on first load.
  // No demo/seed data — all data is entered by the user and persists in localStorage.
  initEmpty('machines');
  initEmpty('lines');
  initEmpty('transfers');
  initEmpty('maintenanceTasks');
  initEmpty('machineTypes');
  initEmpty('users');
}
