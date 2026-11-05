import { tracker } from './tracker';

const readStoredUserId = (): number | null => {
  try {
    const rawUser = localStorage.getItem('shopsim_auth_user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    return typeof user?.id === 'number' ? user.id : null;
  } catch {
    return null;
  }
};

export const getShoppingScope = (): string => {
  const userId = readStoredUserId();
  return userId === null ? `guest_${tracker.getSessionId()}` : `user_${userId}`;
};

export const getShoppingSessionId = (): string => `shopsim_cart_${getShoppingScope()}`;

export const getFavoritesStorageKey = (): string => `shopsim_favorite_items_${getShoppingScope()}`;

