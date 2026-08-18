'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, firebaseConfigured } from '@/lib/firebase';

// Minimal mock user used when Firebase is not yet configured
const DEMO_USER = {
  uid: 'demo',
  displayName: 'Demo User',
  email: 'demo@example.com',
  photoURL: null,
} as unknown as User;

const DEMO_USER_KEY = 'su_lab_demo_user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      // No Firebase — restore demo session from sessionStorage
      const stored = typeof window !== 'undefined' && sessionStorage.getItem(DEMO_USER_KEY);
      setUser(stored ? DEMO_USER : null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!firebaseConfigured || !auth || !googleProvider) {
      // Demo mode: pretend the user signed in
      sessionStorage.setItem(DEMO_USER_KEY, '1');
      setUser(DEMO_USER);
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (!firebaseConfigured || !auth) {
      sessionStorage.removeItem(DEMO_USER_KEY);
      setUser(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
