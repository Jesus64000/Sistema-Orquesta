const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function req(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    let msg = 'Error HTTP';
  try { const data = await res.json(); msg = data.error || msg; } catch { /* ignore parse error */ }
    throw new Error(msg);
  }
  return res.json();
}

export function listarParentescos(q) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return req(`/administracion/parentescos${qs}`);
}

export function crearParentesco(data) {
  return req('/administracion/parentescos', { method: 'POST', body: data });
}

export function actualizarParentesco(id, data) {
  return req(`/administracion/parentescos/${id}`, { method: 'PUT', body: data });
}

export function eliminarParentesco(id) {
  return req(`/administracion/parentescos/${id}`, { method: 'DELETE' });
}
