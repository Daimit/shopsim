import { create } from 'zustand';
import { User, DemoAccount } from '../types';
import { api } from '../lib/api';
import { tracker } from '../lib/tracker';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  demoUsers: DemoAccount[];
  
  // Auth Modal state for guarding protected actions (add to cart, buy, checkout)
  isAuthModalOpen: boolean;
  authModalReason: string;
  pendingAction: (() => void) | null;
  openAuthModal: (reason?: string, onAuthorized?: () => void) => void;
  closeAuthModal: () => void;

  // Computed helpers
  isAuthenticated: boolean;
  isAdmin: boolean;

  // Actions
  loadSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  demoLogin: (role: 'user' | 'admin') => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: 'user' | 'admin') => Promise<boolean>;
  logout: () => void;
  fetchDemoUsers: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  demoUsers: [],
  isAuthModalOpen: false,
  authModalReason: 'Please sign in to continue with your shopping experience.',
  pendingAction: null,

  get isAuthenticated() {
    return !!get().user;
  },

  get isAdmin() {
    return get().user?.role === 'admin';
  },

  clearError: () => set({ error: null }),

  openAuthModal: (reason = 'Please sign in to add products to your cart or complete your purchase.', onAuthorized) => {
    set({
      isAuthModalOpen: true,
      authModalReason: reason,
      pendingAction: onAuthorized || null,
      error: null
    });
    tracker.track('auth_required_prompt', 'auth_modal', { reason });
  },

  closeAuthModal: () => {
    set({
      isAuthModalOpen: false,
      pendingAction: null,
      error: null
    });
  },

  loadSession: async () => {
    try {
      const storedToken = localStorage.getItem('shopsim_auth_token');
      const storedUser = localStorage.getItem('shopsim_auth_user');

      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser);
        set({ token: storedToken, user });

        // Validate token in background
        api.getMe(storedToken).then((freshUser) => {
          if (freshUser) {
            localStorage.setItem('shopsim_auth_user', JSON.stringify(freshUser));
            set({ user: freshUser });
          }
        }).catch(() => {
          // If token expired or invalid, keep or clear
        });
      }
    } catch {
      localStorage.removeItem('shopsim_auth_token');
      localStorage.removeItem('shopsim_auth_user');
    }

    // Load demo users list
    get().fetchDemoUsers();
  },

  fetchDemoUsers: async () => {
    try {
      const demoUsers = await api.getDemoUsers();
      if (Array.isArray(demoUsers)) {
        set({ demoUsers });
      }
    } catch {
      // silently handle
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    tracker.track('login_attempt', 'login_form', { email });

    try {
      const res = await api.login({ email, password });
      if (res && res.user && res.token) {
        localStorage.setItem('shopsim_auth_token', res.token);
        localStorage.setItem('shopsim_auth_user', JSON.stringify(res.user));
        
        const pending = get().pendingAction;
        set({
          user: res.user,
          token: res.token,
          isLoading: false,
          error: null,
          isAuthModalOpen: false,
          pendingAction: null
        });

        tracker.track('login_success', 'login_form', {
          userId: res.user.id,
          role: res.user.role,
          email: res.user.email
        });

        if (pending) {
          try {
            pending();
          } catch (e) {
            console.error('Error executing pending action post-login:', e);
          }
        }

        return true;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      set({ error: errorMsg, isLoading: false });
      
      tracker.track('login_failure', 'login_form', {
        email,
        error: errorMsg
      });

      return false;
    }
  },

  demoLogin: async (role: 'user' | 'admin') => {
    set({ isLoading: true, error: null });
    tracker.track('demo_login_attempt', 'quick_login_button', { role });

    try {
      const res = await api.login({ role });
      if (res && res.user && res.token) {
        localStorage.setItem('shopsim_auth_token', res.token);
        localStorage.setItem('shopsim_auth_user', JSON.stringify(res.user));

        const pending = get().pendingAction;
        set({
          user: res.user,
          token: res.token,
          isLoading: false,
          error: null,
          isAuthModalOpen: false,
          pendingAction: null
        });

        tracker.track('demo_login_success', 'quick_login_button', {
          role: res.user.role,
          email: res.user.email
        });

        if (pending) {
          try {
            pending();
          } catch (e) {
            console.error('Error executing pending action post-login:', e);
          }
        }

        return true;
      } else {
        throw new Error('Quick login failed');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Quick login failed';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  register: async (name: string, email: string, password: string, role: 'user' | 'admin' = 'user') => {
    set({ isLoading: true, error: null });
    tracker.track('register_attempt', 'register_form', { email, role });

    try {
      const res = await api.register({ name, email, password, role });
      if (res && res.user && res.token) {
        localStorage.setItem('shopsim_auth_token', res.token);
        localStorage.setItem('shopsim_auth_user', JSON.stringify(res.user));

        const pending = get().pendingAction;
        set({
          user: res.user,
          token: res.token,
          isLoading: false,
          error: null,
          isAuthModalOpen: false,
          pendingAction: null
        });

        tracker.track('register_success', 'register_form', {
          userId: res.user.id,
          role: res.user.role,
          email: res.user.email
        });

        if (pending) {
          try {
            pending();
          } catch (e) {
            console.error('Error executing pending action post-register:', e);
          }
        }

        return true;
      } else {
        throw new Error('Registration failed');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Registration failed';
      set({ error: errorMsg, isLoading: false });

      tracker.track('register_failure', 'register_form', {
        email,
        error: errorMsg
      });

      return false;
    }
  },

  logout: () => {
    const currentUser = get().user;
    if (currentUser) {
      tracker.track('logout', 'user_menu', {
        userId: currentUser.id,
        role: currentUser.role
      });
    }

    localStorage.removeItem('shopsim_auth_token');
    localStorage.removeItem('shopsim_auth_user');

    set({
      user: null,
      token: null,
      error: null
    });
  }
}));
