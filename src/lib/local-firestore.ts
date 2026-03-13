/**
 * local-firestore.ts
 * Drop-in replacement for `firebase/firestore` using localStorage.
 * Exports the same function names so pages only need an import path change.
 */

import * as store from '@/lib/local-store';

// ─── Ref/Query Types ─────────────────────────────────────────────────────────

export interface LocalDocRef {
  _type: 'doc';
  _collection: string;
  _id: string;
  path: string;
  id: string;
}

export interface LocalCollectionRef {
  _type: 'collection';
  _collection: string;
  path: string;
  type: 'collection';
  __memo?: boolean;
}

export interface WhereConstraint {
  _type: 'where';
  field: string;
  op: string;
  value: any;
}

export interface OrderByConstraint {
  _type: 'orderBy';
  field: string;
  direction: 'asc' | 'desc';
}

export type QueryConstraintLocal = WhereConstraint | OrderByConstraint;

export interface LocalQuery {
  _type: 'query';
  _collection: string;
  _constraints: QueryConstraintLocal[];
  path: string;
  type: 'query';
  __memo?: boolean;
  // Mimics Firestore internal shape expected by old useCollection error handler
  _query: { path: { canonicalString(): string; toString(): string } };
}

// ─── Builders (same API as firebase/firestore) ────────────────────────────────

// Firebase's Firestore type is now just a marker; we ignore it.
export type Firestore = { _local: true };
export const LOCAL_FIRESTORE: Firestore = { _local: true };

export function collection(_db: any, name: string): LocalCollectionRef {
  return {
    _type: 'collection',
    _collection: name,
    path: name,
    type: 'collection',
  };
}

export function doc(_db: any, collectionName: string, id: string): LocalDocRef {
  return {
    _type: 'doc',
    _collection: collectionName,
    _id: id,
    id,
    path: `${collectionName}/${id}`,
  };
}

export function query(
  ref: LocalCollectionRef | LocalQuery,
  ...constraints: QueryConstraintLocal[]
): LocalQuery {
  const colName = ref._collection;
  return {
    _type: 'query',
    _collection: colName,
    _constraints: constraints,
    path: colName,
    type: 'query',
    _query: {
      path: {
        canonicalString: () => colName,
        toString: () => colName,
      },
    },
  };
}

export function where(field: string, op: string, value: any): WhereConstraint {
  return { _type: 'where', field, op, value };
}

export function orderBy(
  field: string,
  direction: 'asc' | 'desc' = 'asc'
): OrderByConstraint {
  return { _type: 'orderBy', field, direction };
}

// ─── CRUD (async to match firebase/firestore signature) ───────────────────────

export async function setDoc(ref: LocalDocRef, data: any): Promise<void> {
  store.setItem(ref._collection, ref._id, data);
}

export async function updateDoc(
  ref: LocalDocRef,
  data: Partial<any>
): Promise<void> {
  store.updateItem(ref._collection, ref._id, data);
}

export async function deleteDoc(ref: LocalDocRef): Promise<void> {
  store.deleteItem(ref._collection, ref._id);
}

export async function addDoc(
  ref: LocalCollectionRef,
  data: any
): Promise<LocalDocRef> {
  const id = store.addItem(ref._collection, data);
  return doc(null, ref._collection, id);
}

// ─── Query Execution Helper (used by useCollection/useDoc) ───────────────────

export function applyConstraints<T extends { id: string }>(
  items: T[],
  constraints: QueryConstraintLocal[]
): T[] {
  let result = [...items];

  for (const c of constraints) {
    if (c._type === 'where') {
      result = result.filter(item => {
        const val = (item as any)[c.field];
        switch (c.op) {
          case '==':  return val === c.value;
          case '!=':  return val !== c.value;
          case '<':   return val < c.value;
          case '<=':  return val <= c.value;
          case '>':   return val > c.value;
          case '>=':  return val >= c.value;
          case 'array-contains': return Array.isArray(val) && val.includes(c.value);
          default:    return true;
        }
      });
    } else if (c._type === 'orderBy') {
      result.sort((a, b) => {
        const av = (a as any)[c.field];
        const bv = (b as any)[c.field];
        if (av === undefined || av === null) return 1;
        if (bv === undefined || bv === null) return -1;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return c.direction === 'desc' ? -cmp : cmp;
      });
    }
  }

  return result;
}
