// src/api/dashboard.js
import { http } from './http';

export const getDashboardStats = (programaId) =>
  http.get(`/dashboard/stats`, {
    params: programaId ? { programa_id: programaId } : {},
  });

export const getProximoEvento = (programaId) =>
  http.get(`/dashboard/proximo-evento`, {
    params: programaId ? { programa_id: programaId } : {},
  });

export const getEventosMes = (year, month, programaId) =>
  http.get(`/dashboard/eventos-mes`, {
    params: { year, month, programa_id: programaId || null },
  });

// Próximos cumpleaños (por defecto 30 días)
export const getCumpleaniosProximos = (days = 30, programaId) =>
  http.get(`/dashboard/cumpleanios-proximos`, {
    params: { days, programa_id: programaId || null },
  });
