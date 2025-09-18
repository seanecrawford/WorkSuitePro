import { createContext } from 'react';

// Create a mock context
const MockAuthContext = createContext(null);

export const useAuth = () => {
  // Return a mock object that mimics the original useAuth hook's return value
  // This prevents errors in components that still use this hook.
  return {
    user: null,
    profile: null,
    login: async () => {},
    signUp: async () => {},
    logout: async () => {},
    loading: false,
    isAuthenticated: false,
    fetchUserProfile: async () => {},
    hasAccessToFeature: () => false,
    getFeatureLimit: () => 0,
    currentUser: null,
  };
};