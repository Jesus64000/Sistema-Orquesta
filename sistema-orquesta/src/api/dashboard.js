// src/api/dashboard.js

import axios from "axios";
const API = "http://localhost:4000";

export const getDashboardStats = (programaId) =>
  axios.get(`${API}/dashboard/stats`, {
    params: programaId ? { programa_id: programaId } : {},
  });

export const getProximoEvento = (programaId) =>
  axios.get(`${API}/dashboard/proximo-evento`, {
    params: programaId ? { programa_id: programaId } : {},
  });

export const getEventosMes = (year, month, programaId) =>
  axios.get(`${API}/dashboard/eventos-mes`, {
    params: { year, month, programa_id: programaId || null },
  });

export const getCumpleaniosProximos = (days = 30, programaId) =>
  axios.get(`${API}/dashboard/cumpleanios-proximos`, {
    params: { days, programa_id: programaId || null },
  });
