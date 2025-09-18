import React from 'react';

// This is a placeholder as AuthProvider is removed from App.jsx
// It prevents errors if it's imported elsewhere, but it doesn't do anything.
export const AuthContext = React.createContext(null);

export const AuthProvider = ({ children }) => {
  return <>{children}</>;
};