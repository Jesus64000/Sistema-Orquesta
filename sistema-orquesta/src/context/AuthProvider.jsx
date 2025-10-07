import React, { useState, useCallback, useEffect } from 'react';
import AuthContext from './AuthContext';

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  }, []);

  const tienePermiso = useCallback((recurso, accion) => {
    if (!user?.effectivePerms) return false;
    const acciones = user.effectivePerms[recurso] || [];
    return acciones.includes(accion);
  }, [user]);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error?.message || 'Error login');
      setToken(data.token);
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }, []);

  const refreshFromToken = useCallback( async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else logout();
    } catch { logout(); }
    finally { setLoading(false); }
  }, [token, logout]);

  useEffect(() => { refreshFromToken(); }, [refreshFromToken]);

  const value = { token, user, loading, error, login, logout, tienePermiso };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
