// backend/middleware/rateLimit.js
// Rate limiting en memoria (sencillo) por IP y ruta.
// NOTA: Para producción a gran escala, usar almacenes centralizados (Redis) o paquetes probados.

const defaultOpts = {
  windowMs: 10 * 60 * 1000, // 10 minutos
  maxAttempts: 10, // por ventana por clave
  keyGenerator: (req) => `${req.ip}:${req.path}`,
  onLimitReached: null, // (req, res, info)
  headers: true,
};

export function rateLimit(opts = {}) {
  const options = { ...defaultOpts, ...opts };
  const store = new Map(); // key => { count, resetAt }

  function cleanup() {
    const now = Date.now();
    for (const [k, v] of store.entries()) {
      if (v.resetAt <= now) store.delete(k);
    }
  }

  return function rateLimitMiddleware(req, res, next) {
    const key = options.keyGenerator(req);
    const now = Date.now();
    let entry = store.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + options.windowMs };
      store.set(key, entry);
    }
    entry.count += 1;

    const remaining = Math.max(0, options.maxAttempts - entry.count);
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);

    if (options.headers) {
      res.setHeader('X-RateLimit-Limit', String(options.maxAttempts));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, remaining)));
      res.setHeader('X-RateLimit-Reset', String(Math.floor(entry.resetAt / 1000)));
    }

    if (entry.count > options.maxAttempts) {
      if (options.onLimitReached) {
        try { options.onLimitReached(req, res, { key, remaining, retryAfterSec }); } catch {}
      }
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Demasiados intentos, intente más tarde', retry_after_seconds: retryAfterSec } });
    }

    // Exponer helper para reset del contador (p.ej. en login exitoso)
    req.rateLimit = {
      key,
      reset: () => { store.delete(key); },
      info: { remaining, resetAt: entry.resetAt }
    };

    // Ocasional: limpiar entradas viejas
    if (Math.random() < 0.01) cleanup();

    next();
  };
}

export default rateLimit;
