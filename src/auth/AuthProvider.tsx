import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Role } from "../api/auth";
import {
    clearSession as clearPersistedSession,
    getLastRole,
    getRole,
    getToken,
    setSession as persistSession,
} from "./session";

type AuthState = {
  /** null while we're still reading SecureStore on launch */
  isLoading: boolean;
  token: string | null;
  role: Role | null;
  /** Persisted even after logout — drives "remember last role" */
  lastRole: Role | null;
};

type AuthActions = {
  /** Call after a successful login / register */
  signIn: (token: string, role: Role) => Promise<void>;
  /** Clear credentials and redirect to login */
  signOut: () => Promise<void>;
};

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    token: null,
    role: null,
    lastRole: null,
  });

  // Hydrate from SecureStore on mount
  useEffect(() => {
    (async () => {
      const [token, role, lastRole] = await Promise.all([
        getToken(),
        getRole(),
        getLastRole(),
      ]);
      setState({
        isLoading: false,
        token,
        role,
        lastRole,
      });
    })();
  }, []);

  const signIn = useCallback(async (token: string, role: Role) => {
    await persistSession(token, role);
    setState((prev) => ({ ...prev, token, role, lastRole: role }));
  }, []);

  const signOut = useCallback(async () => {
    await clearPersistedSession();
    setState((prev) => ({
      ...prev,
      token: null,
      role: null,
      // lastRole stays unchanged
    }));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signIn, signOut }),
    [state, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Access the current auth state + actions from any component.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
