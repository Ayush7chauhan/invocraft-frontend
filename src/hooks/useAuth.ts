import { useMemo } from 'react';
import type { User } from '@/types';

/** Reads auth state from localStorage — used by ProtectedRoute and throughout the app */
export function useAuth() {
  const token = localStorage.getItem('auth_token');
  const userRaw = localStorage.getItem('user');

  const user = useMemo<User | null>(() => {
    if (!userRaw) return null;
    try {
      return JSON.parse(userRaw) as User;
    } catch {
      return null;
    }
  }, [userRaw]);

  return {
    isAuthenticated: Boolean(token && userRaw),
    token,
    user,
    shopName: user?.shop_name ?? user?.owner_name ?? 'My Shop',
    ownerName: user?.owner_name ?? 'Owner',
  };
}
