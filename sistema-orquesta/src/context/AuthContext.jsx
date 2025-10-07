/* eslint-disable react-refresh/only-export-components, no-unused-vars */
import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';

// Fuente única de verdad para autenticación y permisos en el frontend.
// Responsabilidades:
// - Persistir token JWT en localStorage.
// - Recuperar sesión (/auth/me) al cargar.
// - Proveer helpers: login, logout, refresh, tienePermiso, requirePermiso, anyPermiso.
// - Exponer flags de estado (loading, authenticating, initialized).
// - Manejar backlog de peticiones refresh para evitar carreras (simple lock).

const STORAGE_KEY = 'auth_token';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, nombre, rol, permisos: ["recurso:accion", ...] }
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [loading, setLoading] = useState(false); // Loading de operaciones explícitas (login/logout)
  const [initializing, setInitializing] = useState(true); // Restaurando sesión inicial
  const refreshLock = useRef(false);
  const pendingRefreshResolvers = useRef([]);

  const saveToken = useCallback((jwt) => {
    if (jwt) {
      localStorage.setItem(STORAGE_KEY, jwt);
      setToken(jwt);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
    }
  }, []);

  const applySession = useCallback((data) => {
    if (!data) {
      setUser(null);
      return;
    }
    // Asegurar estructura consistente
    setUser({
      id: data.id,
      nombre: data.nombre || data.name || data.usuario || '',
      rol: data.rol || data.role || null,
      permisos: Array.isArray(data.permisos) ? data.permisos : [],
    });
  }, []);

  const fetchMe = useCallback(async (opts = {}) => {
    if (!token) {
      applySession(null);
      return null;
    }
    // Evitar peticiones simultáneas /auth/me múltiples
    if (refreshLock.current && !opts.force) {
      return new Promise((resolve) => pendingRefreshResolvers.current.push(resolve));
    }
    refreshLock.current = true;
    try {
      const res = await fetch('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        applySession(json.user || json);
        return json.user || json;
      } else {
        if (res.status === 401) {
          // Token expirado / inválido
            saveToken(null);
            applySession(null);
        }
        return null;
      }
    } catch (e) {
      console.error('Error recuperando sesión', e);
      return null;
    } finally {
      refreshLock.current = false;
      // Resolver las esperas acumuladas
      pendingRefreshResolvers.current.splice(0).forEach((r) => r(user));
    }
  }, [token, applySession, saveToken, user]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        let msg = 'Credenciales inválidas';
        try {
          const err = await res.json();
          if (err?.error?.message) msg = err.error.message;
          else if (typeof err?.error === 'string') msg = err.error;
        } catch (ignored) { /* mantener mensaje genérico */ }
        throw new Error(msg);
      }
      const data = await res.json();
      saveToken(data.token);
      // Adaptar estructura a la esperada local (plain permisos)
      const plainPerms = [];
      if (data.user?.effectivePerms) {
        for (const recurso of Object.keys(data.user.effectivePerms)) {
          for (const accion of data.user.effectivePerms[recurso]) {
            plainPerms.push(`${recurso}:${accion}`);
          }
        }
      }
      applySession({
        id: data.user.id_usuario,
        nombre: data.user.nombre,
        rol: data.user.rol,
        permisos: plainPerms,
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [saveToken, applySession]);

  const logout = useCallback(() => {
    saveToken(null);
    applySession(null);
  }, [saveToken, applySession]);

  const tienePermiso = useCallback((recurso, accion) => {
    if (!user?.permisos) return false;
    const needle = `${recurso}:${accion}`;
    return user.permisos.includes('*:*') || user.permisos.includes(`${recurso}:*`) || user.permisos.includes(needle);
  }, [user]);

  const anyPermiso = useCallback((pairs) => {
    if (!Array.isArray(pairs) || pairs.length === 0) return true; // vacío => no restricción
    return pairs.some(([r, a]) => tienePermiso(r, a));
  }, [tienePermiso]);

  const requirePermiso = useCallback((recurso, accion) => {
    if (!tienePermiso(recurso, accion)) {
      throw new Error(`Falta permiso ${recurso}:${accion}`);
    }
  }, [tienePermiso]);

  // Restaurar sesión inicial
  useEffect(() => {
    (async () => {
      if (token) {
        await fetchMe();
      }
      setInitializing(false);
    })();
  }, [token, fetchMe]);

  const value = {
    user,
    token,
    initializing,
    loading,
    login,
    logout,
    refresh: fetchMe,
    tienePermiso,
    requirePermiso,
    anyPermiso,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook principal
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

// Hook específico para permisos (ergonomía)
export function usePermiso(recurso, accion) {
  const { tienePermiso } = useAuth();
  return tienePermiso(recurso, accion);
}

// Componente condicional simple
export function IfPermiso({ recurso, accion, fallback = null, children }) {
  const ok = usePermiso(recurso, accion);
  return ok ? children : fallback;
}

// Export default opcional eliminado para evitar conflictos; consumir via named { AuthProvider, useAuth, IfPermiso }
