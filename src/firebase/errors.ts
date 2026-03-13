'use client';

// Firebase auth removed � FirestorePermissionError kept as a plain error class
// so existing error-handling code in pages compiles without changes.

type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly path: string;
  public readonly operation: string;
  public readonly requestResourceData?: any;

  constructor({ path, operation, requestResourceData }: SecurityRuleContext) {
    super(`[LocalStore] ${operation.toUpperCase()} on "${path}" noted locally.`);
    this.name = 'FirestorePermissionError';
    this.path = path;
    this.operation = operation;
    this.requestResourceData = requestResourceData;
  }
}
