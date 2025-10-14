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
