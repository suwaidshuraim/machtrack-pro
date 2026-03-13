'use client';
// Firebase auth removed - returns a static mock user for local-only mode.
export function useUser() {
  return {
    user: { displayName: 'Floor Operator', email: 'operator@factory.com', uid: 'local-user' },
    loading: false,
  };
}
