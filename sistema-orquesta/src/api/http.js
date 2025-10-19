import axios from 'axios';

// Cliente HTTP con inyección automática del token JWT desde localStorage
export const http = axios.create({
  // baseURL vacío: usaremos rutas relativas y el proxy de Vite en dev
});

http.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Evitar respuestas 304 en peticiones GET que dejen res.data vacío
    try {
      const method = (config.method || '').toLowerCase();
      if (method === 'get' || !config.method) {
        config.headers = config.headers || {};
        // Forzar no-cache para que el servidor devuelva body en vez de 304
        config.headers['Cache-Control'] = 'no-cache';
        config.headers['Pragma'] = 'no-cache';
      }
    } catch (err) {
      void err;
    }
    // En desarrollo podemos enviar un user-id simulado para cargar un usuario dev
    // Esto permite ver datos protegidos sin login manual. Se aplica solo en modo dev.
    try {
      if (!token && typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
        config.headers = config.headers || {};
        // Usar '1' como id de usuario de desarrollo; ajustar si tu BD tiene otro id
        config.headers['x-user-id'] = '1';
        // pequeño log útil en la consola del navegador
        console.debug('DEV: injecting x-user-id=1 for dev requests');
      }
    } catch {
      // noop
    }
  } catch {
    // Ignorar errores de acceso a localStorage (por ejemplo en SSR o modo incógnito restringido)
  }
  return config;
});

// Manejo de errores común: para 401/403 devolvemos un objeto con _denied para que la UI oculte/controle sin crashear
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      // Propagar error 401 (dejar que capa superior haga logout si aplica)
      return Promise.reject(error);
    }
    if (error?.response?.status === 403) {
      // No lanzar excepción: devolver respuesta simulada con marca _denied
      return Promise.resolve({ data: { _denied: true }, status: 403, headers: error.response.headers, config: error.config });
    }
    return Promise.reject(error);
  }
);

export default http;
