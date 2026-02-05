import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { 
  onAuthChange, 
  signInWithGoogle, 
  signInWithTwitter,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  logOut,
  getUserData,
  type UserData
} from '../config/firebase';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  usage: {
    canUse: boolean;
    remaining: number;
    limit: number;
  };
  signInWithGoogle: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  trackUsage: (count?: number) => Promise<void>;
  refreshUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  // Default: allow access for new users (5 images)
  const [usage, setUsage] = useState({ canUse: true, remaining: 5, limit: 5 });

  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://blurmagic-backend-823039970129.asia-southeast1.run.app';

  const fetchEntitlements = useCallback(
    async (firebaseUser: User) => {
      const token = await firebaseUser.getIdToken();
      try {
        const res = await fetch(`${apiBase}/entitlements`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const text = await res.text();
        const payload = (() => {
          try {
            return text ? JSON.parse(text) : {};
          } catch {
            return { error: 'Non-JSON response from entitlements API', raw: text.slice(0, 200) };
          }
        })();
        if (!res.ok) {
          throw new Error(payload?.error || `Failed to fetch entitlements (${res.status})`);
        }
        return payload as { canUse: boolean; remaining: number; limit: number };
      } catch (error) {
        // Local dev may not be running Vercel `/api` (e.g. `npm run dev`).
        console.warn('⚠️ Entitlements API unavailable, using default quota:', error);
        return { canUse: true, remaining: 5, limit: 5 };
      }
    },
    [apiBase]
  );

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const data = await getUserData(firebaseUser.uid);
          setUserData(data);
          
          // Even if Firestore is offline, assume user can use with default quota
          if (!data) {
            console.log('⚠️ User data not found (offline?), using default quota');
            setUsage({ canUse: true, remaining: 5, limit: 5 });
          } else {
            const entitlements = await fetchEntitlements(firebaseUser);
            setUsage(entitlements);
          }
        } catch (error) {
          console.error('❌ Error loading user data:', error);
          // Fail-safe: allow access with default quota
          setUsage({ canUse: true, remaining: 5, limit: 5 });
        }
      } else {
        setUserData(null);
        setUsage({ canUse: false, remaining: 0, limit: 5 });
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchEntitlements]);

  const refreshUsage = useCallback(async () => {
    if (user) {
      try {
        const entitlements = await fetchEntitlements(user);
        setUsage(entitlements);
      } catch (error) {
        console.error('❌ Failed to refresh entitlements:', error);
        // Fail-safe: don't hard block if billing API is temporarily down
        setUsage({ canUse: true, remaining: 5, limit: 5 });
      }
    }
  }, [user, fetchEntitlements]);

  const handleSignInWithGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) throw new Error(error);
  };

  const handleSignInWithTwitter = async () => {
    const { error } = await signInWithTwitter();
    if (error) throw new Error(error);
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    const { error } = await signInWithEmail(email, password);
    if (error) throw new Error(error);
  };

  const handleSignUpWithEmail = async (email: string, password: string, displayName: string) => {
    const { error } = await signUpWithEmail(email, password, displayName);
    if (error) throw new Error(error);
  };

  const handleResetPassword = async (email: string) => {
    const { error } = await resetPassword(email);
    if (error) throw new Error(error);
  };

  const handleLogout = async () => {
    const { error } = await logOut();
    if (error) throw new Error(error);
  };

  const trackUsage = useCallback(async (count: number = 1) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${apiBase}/consume-credit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ count, reason: 'process_image' }),
        });
        const text = await res.text();
        const payload = (() => {
          try {
            return text ? JSON.parse(text) : {};
          } catch {
            return { error: 'Non-JSON response from consume-credit API', raw: text.slice(0, 200) };
          }
        })();
        if (!res.ok) {
          throw new Error(payload?.error || `Usage tracking failed (${res.status})`);
        }
        setUsage(payload as { canUse: boolean; remaining: number; limit: number });
      } catch (error) {
        // In dev without `/api`, don't hard-break image processing UX.
        console.warn('⚠️ consume-credit failed (API unavailable?). Skipping usage decrement:', error);
      }
    }
  }, [user, apiBase]);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    usage,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithTwitter: handleSignInWithTwitter,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    resetPassword: handleResetPassword,
    logout: handleLogout,
    trackUsage,
    refreshUsage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
