'use client';
// Firebase removed - non-blocking update helpers now use local localStorage store.
import * as store from '@/lib/local-store';
import { LocalDocRef, LocalCollectionRef } from '@/lib/local-firestore';

export function setDocumentNonBlocking(docRef: LocalDocRef, data: any, _options?: any): void {
  store.setItem(docRef._collection, docRef._id, data);
}

export function addDocumentNonBlocking(colRef: LocalCollectionRef, data: any): void {
  store.addItem(colRef._collection, data);
}

export function updateDocumentNonBlocking(docRef: LocalDocRef, data: any): void {
  store.updateItem(docRef._collection, docRef._id, data);
}

export function deleteDocumentNonBlocking(docRef: LocalDocRef): void {
  store.deleteItem(docRef._collection, docRef._id);
}
