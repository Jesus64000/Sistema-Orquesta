// src/api/dashboard.js
import { http } from './http';

// Normalizamos las respuestas: devolvemos el body (.data) o estructuras simples
export const getDashboardStats = async (programaId) => {
  const res = await http.get(`/dashboard/stats`, {
    params: programaId ? { programa_id: programaId } : {},
  });
  let data = res.data || {};
  // Desempaquetar formas comunes: res.data.stats, res.data.data, res.data.counts, etc.
  if (data && typeof data === 'object') {
    if (data.stats && typeof data.stats === 'object') data = data.stats;
    else if (data.data && typeof data.data === 'object') data = data.data;
    else if (data.counts && typeof data.counts === 'object') data = data.counts;
    else if (data.summary && typeof data.summary === 'object') data = data.summary;
    else if (data.metrics && typeof data.metrics === 'object') data = data.metrics;
    else if (data.totales && typeof data.totales === 'object') data = data.totales;
  }
  // Si la respuesta indica denial, retornar tal cual para que la UI lo maneje
  if (data && data._denied) return data;

  // Mapeo explícito de keys que el Dashboard espera (camelCase) desde posibles snake_case del backend
  const map = {
    totalAlumnos: ['totalAlumnos', 'total_alumnos', 'total'],
    alumnosActivos: ['alumnosActivos', 'alumnos_activos'],
    alumnosInactivos: ['alumnosInactivos', 'alumnos_inactivos'],
    alumnosRetirados: ['alumnosRetirados', 'alumnos_retirados'],
    instrumentosTotal: ['instrumentosTotal', 'instrumentos_total'],
    instrumentosDisponibles: ['instrumentosDisponibles', 'instrumentos_disponibles'],
    instrumentosAsignados: ['instrumentosAsignados', 'instrumentos_asignados'],
    instrumentosMantenimiento: ['instrumentosMantenimiento', 'instrumentos_mantenimiento'],
    instrumentosBaja: ['instrumentosBaja', 'instrumentos_baja'],
    totalProgramas: ['totalProgramas', 'total_programas'],
  };

  const normalized = { ...data };
  Object.entries(map).forEach(([camel, candidates]) => {
    for (const key of candidates) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        normalized[camel] = data[key];
        break;
      }
    }
    // si no existe ninguno, dejar undefined (el componente usará ?? 0)
  });

  // Convertir claves snake_case a camelCase para cubrir respuestas variadas
  const toCamel = (s) => String(s).replace(/_([a-z])/g, (_, c) => (c ? c.toUpperCase() : ''));
  Object.entries(data).forEach(([k, v]) => {
    const camel = toCamel(k);
    if (camel && !Object.prototype.hasOwnProperty.call(normalized, camel)) {
      normalized[camel] = v;
    }
  });

  // Si después de normalizar faltan métricas, intentar heurísticas: buscar en objetos anidados
  const expectedKeys = Object.keys(map);
  const isEmptyStats = expectedKeys.every((k) => normalized[k] == null || normalized[k] === 0);
  if (isEmptyStats) {
    // búsqueda recursiva: devuelve el primer valor cuyo key coincida con el patrón
    const deepFind = (obj, pattern) => {
      if (!obj || typeof obj !== 'object') return undefined;
      for (const [k, v] of Object.entries(obj)) {
        if (pattern.test(k) && (typeof v === 'number' || typeof v === 'string')) return v;
        if (v && typeof v === 'object') {
          const found = deepFind(v, pattern);
          if (found !== undefined) return found;
        }
      }
      return undefined;
    };

    const heuristics = {
      totalAlumnos: /alumn|total.*alumn|total_alumnos|totalalumnos/i,
      alumnosActivos: /activos|alumnos_activos|alumnosActivos/i,
      alumnosInactivos: /inactivos|alumnos_inactivos|alumnosInactivos/i,
      alumnosRetirados: /retirados|alumnos_retirados|alumnosRetirados/i,
      instrumentosTotal: /instrumentos.*total|instrumentos_total|instrumentostotal/i,
      instrumentosDisponibles: /disponibles|instrumentos_disponibles|instrumentosDisponibles/i,
      instrumentosAsignados: /asignados|instrumentos_asignados|instrumentosAsignados/i,
      instrumentosMantenimiento: /mantenimiento|instrumentos_mantenimiento|instrumentosMantenimiento/i,
      instrumentosBaja: /baja|instrumentos_baja|instrumentosBaja/i,
      totalProgramas: /programas.*total|total_programas|totalProgramas/i,
    };

    expectedKeys.forEach((key) => {
      if (normalized[key] == null || normalized[key] === 0) {
        const pat = heuristics[key];
        const v = deepFind(data, pat);
        if (v !== undefined) normalized[key] = v;
      }
    });
  }

  return normalized;
};

export const getProximoEvento = async (programaId) => {
  const res = await http.get(`/dashboard/proximo-evento`, {
    params: programaId ? { programa_id: programaId } : {},
  });
  let data = res.data;
  if (!data) return null;
  // Desempaquetar formas comunes
  if (data.evento && typeof data.evento === 'object') data = data.evento;
  else if (data.next && typeof data.next === 'object') data = data.next;
  else if (data.proximo && typeof data.proximo === 'object') data = data.proximo;

  // Normalizar claves snake_case -> camelCase en el evento
  const toCamel = (s) => String(s).replace(/_([a-z])/g, (_, c) => (c ? c.toUpperCase() : ''));
  const normalized = {};
  if (data && typeof data === 'object') {
    Object.entries(data).forEach(([k, v]) => {
      normalized[toCamel(k)] = v;
    });
  }
  return normalized;
};

export const getEventosMes = async (year, month, programaId) => {
  const res = await http.get(`/dashboard/eventos-mes`, {
    params: { year, month, programa_id: programaId || null },
  });
  return res.data;
};

// Próximos cumpleaños (por defecto 30 días)
export const getCumpleaniosProximos = async (days = 30, programaId) => {
  const res = await http.get(`/dashboard/cumpleanios-proximos`, {
    params: { days, programa_id: programaId || null },
  });
  const data = res.data;
  // Aceptar varias formas: array directo, { value: [...] }, { rows: [...] }, { cumples: [...] }
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.value)) return data.value;
  if (data && Array.isArray(data.rows)) return data.rows;
  if (data && Array.isArray(data.cumples)) return data.cumples;
  // Si está anidado en data.data
  if (data && data.data && Array.isArray(data.data)) return data.data;
  return [];
};
