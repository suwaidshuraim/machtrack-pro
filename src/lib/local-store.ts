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

// Bump this version string any time a breaking data-schema change requires a
// clean slate. On first load after a version bump every collection is wiped so
// no stale seed / demo data survives across deployments.
const SCHEMA_VERSION = '3';
const SCHEMA_KEY = 'machtrack_schema_v';

function initEmpty(collectionName: string): void {
  if (typeof window === 'undefined') return;
  const key = storageKey(collectionName);
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, JSON.stringify([]));
  }
}

export function seedAllCollections(): void {
  if (typeof window === 'undefined') return;

  // If the stored schema version doesn't match, wipe all collections so that
  // previously seeded demo data is removed. User data added after this
  // migration will persist as normal.
  if (localStorage.getItem(SCHEMA_KEY) !== SCHEMA_VERSION) {
    const collections = [
      'machines', 'lines', 'transfers', 'maintenanceTasks',
      'machineTypes', 'users',
    ];
    collections.forEach(c => localStorage.setItem(storageKey(c), JSON.stringify([])));
    localStorage.setItem(SCHEMA_KEY, SCHEMA_VERSION);
    console.info('[MachTrack] Storage migrated to v' + SCHEMA_VERSION + ' — demo data cleared.');
  }

  // Ensure all keys exist (no-op if they were just created above or already exist).
  initEmpty('machines');
  initEmpty('lines');
  initEmpty('transfers');
  initEmpty('maintenanceTasks');
  initEmpty('machineTypes');
  initEmpty('users');
}
