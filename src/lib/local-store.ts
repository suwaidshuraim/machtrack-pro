/**
 * local-store.ts  — fetch-based API client
 *
 * All reads/writes go through Next.js API routes (/api/[collection]).
 * Data is stored server-side in data/database.json and is shared across
 * every device on the same network.
 *
 * Public API is intentionally identical to the old localStorage version
 * (now async) so that local-firestore.ts and all hooks continue to work.
 */

// ─── Same-device event emitter (instant UI refresh after a local write) ───────

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

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

const BASE = '/api';

async function apiFetch(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(
      `[MachTrack] API ${options?.method ?? 'GET'} ${url} → ${res.status}`
    );
  }
  return res.json();
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getAll<T = any>(
  collectionName: string
): Promise<(T & { id: string })[]> {
  try {
    return await apiFetch(`${BASE}/${collectionName}`);
  } catch {
    return [];
  }
}

export async function getById<T = any>(
  collectionName: string,
  id: string
): Promise<(T & { id: string }) | null> {
  const all = await getAll<T>(collectionName);
  return all.find((item: any) => item.id === id) ?? null;
}

export async function setItem<T = any>(
  collectionName: string,
  id: string,
  data: T
): Promise<void> {
  await apiFetch(`${BASE}/${collectionName}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, id }),
  });
  emit(collectionName);
}

export async function updateItem<T = any>(
  collectionName: string,
  id: string,
  partial: Partial<T>
): Promise<void> {
  await apiFetch(`${BASE}/${collectionName}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial),
  });
  emit(collectionName);
}

export async function deleteItem(
  collectionName: string,
  id: string
): Promise<void> {
  await apiFetch(`${BASE}/${collectionName}/${id}`, { method: 'DELETE' });
  emit(collectionName);
}

export async function addItem<T = any>(
  collectionName: string,
  data: T
): Promise<string> {
  const id =
    Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  await apiFetch(`${BASE}/${collectionName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, id }),
  });
  emit(collectionName);
  return id;
}

// ─── No-op bootstrap (data lives on the server, nothing to initialise here) ───

export function seedAllCollections(): void {
  // No-op: data is stored in data/database.json on the Next.js server.
  // API routes create the file automatically on first request.
}
