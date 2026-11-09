import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);

  useEffect(() => {
    if (!tokenStore.get()) return;
    api('/auth/me').then((d) => setUser(d.user)).catch(() => tokenStore.clear()).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.addEventListener('bc-unauthorized', logout);
    return () => window.removeEventListener('bc-unauthorized', logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } });
    tokenStore.set(d.token);
    setUser(d.user);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
