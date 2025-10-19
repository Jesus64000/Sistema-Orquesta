// sistema-orquesta/src/pages/Dashboard.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  PlusCircle, Wrench, ClipboardList, MapPin, Clock,
  ChevronLeft, ChevronRight, UserCheck, UserPlus, Hourglass, Briefcase, Filter, Calendar as CalendarIcon
} from "lucide-react";

import { getDashboardStats, getProximoEvento, getCumpleaniosProximos } from "../api/dashboard";
import { getEventosFuturos } from "../api/eventos";
import { getProgramas } from "../api/programas";

import Modal from "../components/Modal";
import EventoForm from "../components/Eventos/EventoForm";
import InstrumentoForm from "../components/Instrumentos/InstrumentoForm";
import AlumnoForm from "../components/Alumnos/AlumnoForm";
import SegmentedDropdown from "../components/SegmentedDropdown";
import TagSelect from "../components/TagSelect";

// === UI Helpers ===
const Card = ({ children, className = "" }) => (
  <div className={`card rounded-2xl shadow-md p-5 ${className}`}>
    {children}
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-yellow-300 bg-gradient-to-b from-yellow-100 to-yellow-200 text-gray-900 shadow-sm hover:shadow-md hover:from-yellow-200 hover:to-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300/60 focus:ring-offset-1 active:scale-[0.98]"
  >
    {Icon && (
      <span className="h-5 w-5 rounded-md bg-yellow-200 text-yellow-800 grid place-items-center ring-1 ring-yellow-300">
        <Icon className="h-3.5 w-3.5" />
      </span>
    )}
    <span className="text-sm font-semibold">{label}</span>
  </button>
);
 
const QuickStat = ({ label, value, icon: Icon, right = null }) => (
  <div className="flex items-center justify-between gap-3 p-3 rounded-lg card-90 border shadow-sm">
    <div className="h-8 w-8 rounded-lg bg-yellow-200 text-gray-900 grid place-items-center shadow">
      {Icon && <Icon className="h-4 w-4" />}
    </div>
    <div className="flex-1">
      <p className="text-xs muted">{label}</p>
      <p className="text-xl font-semibold text-app">{value}</p>
    </div>
    {right}
  </div>
);

// util: parsear datetimes que vienen de la BD
const parseDBDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val;
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/.test(s)) {
    return new Date(s.replace(" ", "T"));
  }
  return new Date(s);
};

// === Tooltip ===
const Tooltip = ({ eventos, align = "center" }) => (
  <div
  className={`absolute z-50 w-64 card rounded-lg shadow-lg p-3 text-xs text-app pointer-events-none
      ${align === "left" ? "right-full mr-2" : align === "right" ? "left-full ml-2" : "-translate-x-1/2 left-1/2"}`}
  >
    {eventos.map((evento) => {
      const d = parseDBDate(evento.fecha_evento);
      return (
        <div key={evento.id_evento} className="mb-2 last:mb-0">
          <p className="font-semibold text-app">{evento.titulo}</p>
          <p className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {d ? d.toLocaleDateString("es-ES") : ""}
            {" • "}
            {evento.hora_evento
              ? evento.hora_evento.slice(0, 5)
              : d
                ? d.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true, // ✅ formato 12 horas
                  })
                : ""}
          </p>
          <p className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {evento.lugar}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {evento.categoria && (
              <span className="px-1.5 py-0.5 rounded-md bg-yellow-100 text-yellow-800 border border-yellow-200 text-[10px] font-medium">{evento.categoria}</span>
              )}
              {evento.programa_nombre && (
                <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 text-[10px]">{evento.programa_nombre}</span>
              )}
            {evento.estado && (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] capitalize">{evento.estado}</span>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

// === Calendar ===
const MonthCalendar = ({ year, monthIndex, eventos = [] }) => {
  const [cursor, setCursor] = useState({ y: year, m: monthIndex });
  const [hovered, setHovered] = useState(null);
  const today = new Date();

  const matrix = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));

    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [cursor]);

  const eventosPorDia = (Array.isArray(eventos) ? eventos : []).reduce((acc, e) => {
    if (!e.fecha_evento) return acc;
    const [y, m, d] = String(e.fecha_evento).split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const key = dateObj.toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  // (sin logs de consola en producción)

  const monthName = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
    new Date(cursor.y, cursor.m, 1)
  );

  const eventosMesActual = Object.entries(eventosPorDia).filter(([key]) => {
    const d = new Date(key);
    return d.getFullYear() === cursor.y && d.getMonth() === cursor.m;
  }).length;

  const isDifferentMonth = cursor.y !== today.getFullYear() || cursor.m !== today.getMonth();

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize text-gray-900 tracking-wide">
          {monthName} {cursor.y}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Mes anterior"
            onClick={() => setCursor(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-yellow-200 bg-yellow-100 text-gray-700 hover:bg-yellow-200 hover:text-gray-900 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!isDifferentMonth}
            onClick={() => setCursor({ y: today.getFullYear(), m: today.getMonth() })}
            className={`px-3 h-9 inline-flex items-center justify-center rounded-full text-[11px] font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300
              ${isDifferentMonth ? 'bg-yellow-100 border-yellow-200 text-gray-700 hover:bg-yellow-200 hover:text-gray-900 shadow-sm' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}
            aria-label="Volver al mes actual"
          >
            Hoy
          </button>
          <button
            type="button"
            aria-label="Mes siguiente"
            onClick={() => setCursor(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-yellow-200 bg-yellow-100 text-gray-700 hover:bg-yellow-200 hover:text-gray-900 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Header días */}
      <div className="mt-4 grid grid-cols-7 text-center text-xs font-medium muted">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Celdas */}
      <div className="grid grid-cols-7 gap-1 mt-1 relative">
        {matrix.map((d, i) => {
          const inMonth = d.getMonth() === cursor.m;
          const day = d.getDate();
          const keyDate = d.toDateString();
          const eventosDia = eventosPorDia[keyDate] || [];
          const isHovered = hovered?.date && hovered.date.toDateString() === keyDate;
          const isToday = d.toDateString() === today.toDateString();

          const colIndex = i % 7;
          let align = "center";
          if (colIndex >= 5) align = "left";
          else if (colIndex <= 1) align = "right";

          return (
            <div
              key={i}
              onMouseEnter={() => setHovered({ date: d })}
              onMouseLeave={() => setHovered(null)}
              className={`relative aspect-square rounded-xl text-sm grid place-items-center border shadow-sm
                ${inMonth ? "card-90 text-app border" : "muted border-transparent"}
                ${eventosDia.length ? "bg-yellow-200 font-bold cursor-pointer dark:bg-yellow-600/30" : ""}
                ${isToday ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-white font-semibold dark:ring-yellow-400 dark:ring-offset-gray-900" : ""}`}
            >
              {day}
              {isHovered && eventosDia.length > 0 && <Tooltip eventos={eventosDia} align={align} />}
            </div>
          );
        })}
      </div>
      {eventosMesActual === 0 && (
        <div className="mt-4 flex flex-col items-center gap-2 muted text-xs">
          <CalendarIcon className="h-6 w-6 muted" />
          <p className="font-medium muted">No hay eventos en este mes</p>
          <p className="text-[11px] muted">Crea uno desde "Acciones Rápidas"</p>
        </div>
      )}
    </Card>
  );
};

// === Dashboard ===
export default function Dashboard() {
  const { tienePermiso } = useAuth();
  const canCreateAlumno = tienePermiso('alumnos','create');
  const canCreateInstrumento = tienePermiso('instrumentos','create');
  const canCreateEvento = tienePermiso('eventos','create');
  const [programFilter, setProgramFilter] = useState("");
  const [stats, setStats] = useState({});
  const [proximoEvento, setProximoEvento] = useState(null);
  const [eventosFuturos, setEventosFuturos] = useState([]);
  const [cumples, setCumples] = useState({ loading: true, rows: [], error: null });
  const [openModal, setOpenModal] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [programas, setProgramas] = useState([]);
  const [kpiAlumnosMode, setKpiAlumnosMode] = useState("total");
  const [kpiInstrumentosMode, setKpiInstrumentosMode] = useState("total");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const [debugPayloads, setDebugPayloads] = useState({});
  const today = new Date();

  const debugEnabled = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  // Defensive: asegurar que cumples.rows sea siempre un array antes de renderizar
  const cumpleRows = Array.isArray(cumples?.rows) ? cumples.rows : (cumples && cumples.rows ? [cumples.rows] : []);

  const handleCloseModal = () => {
    setOpenModal(null);
    setEditingData(null);
  };

  const loadDashboard = useCallback(async () => {
    try {
    setLoadingStats(true);
  const resStats = await getDashboardStats(programFilter || null);
    console.debug("Dashboard: received stats:", resStats);
  setDebugPayloads((p) => ({ ...p, stats: resStats }));
    // getDashboardStats ya devuelve body normalizado
    setStats(resStats && resStats._denied ? {} : (resStats || {}));
    setLoadingStats(false);

      setLoadingEvento(true);
  const resEvento = await getProximoEvento(programFilter || null);
  console.debug("Dashboard: received proximoEvento:", resEvento);
  setDebugPayloads((p) => ({ ...p, proximoEvento: resEvento }));
  setProximoEvento(resEvento && resEvento._denied ? null : (resEvento || null));
      setLoadingEvento(false);

  // Eventos siempre globales (no filtrados por programa)
  const eventos = await getEventosFuturos();
    console.debug("Dashboard: received eventosFuturos:", eventos);
      setDebugPayloads((p) => ({ ...p, eventosFuturos: eventos }));
    // getEventosFuturos ya devuelve array normalizado
    setEventosFuturos(Array.isArray(eventos) ? eventos : []);

      setCumples((prev) => ({ ...prev, loading: true }));
  const resCum = await getCumpleaniosProximos(30, programFilter || null);
  console.debug("Dashboard: received cumples:", resCum);
  setDebugPayloads((p) => ({ ...p, cumples: resCum }));
  // El wrapper de la API puede devolver un array directo (normalizado) o
  // un objeto axios (con .data). Aceptamos ambas formas.
  let cumplRows = [];
  // getCumpleaniosProximos ya devuelve preferentemente un array, pero mantenemos compatibilidad
  if (Array.isArray(resCum)) cumplRows = resCum;
  else if (resCum && Array.isArray(resCum.data)) cumplRows = resCum.data;
  else if (resCum && Array.isArray(resCum.value)) cumplRows = resCum.value;
  setCumples({ loading: false, rows: cumplRows, error: null });
    } catch (err) {
  // error ya reflejado en estados de carga/errores
      setLoadingStats(false);
      setLoadingEvento(false);
      setCumples({ loading: false, rows: [], error: err?.message || "Error" });
    }
  }, [programFilter]);

  const { token, initializing } = useAuth();
  useEffect(() => {
    const fetchAndLoad = async () => {
      // Primero cargar programas porque el filtro depende de ellos
      if (!initializing && token) {
        try {
          const programasRes = await getProgramas();
          const programasList = programasRes && programasRes._denied ? [] : (programasRes || []);
          setProgramas(programasList);
          setDebugPayloads((p) => ({ ...p, programas: programasList }));
        } catch (err) {
          if (token) console.error("Error cargando programas:", err);
          setProgramas([]);
        }
      }
      // Luego cargar el resto del dashboard
      await loadDashboard();
    };
    fetchAndLoad();
  }, [loadDashboard, token, initializing]);

  return (
    <div>
      {/* Top bar */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Panel de control</h1>
          <p className="text-sm text-gray-500">
            Bienvenido de vuelta, <span className="font-medium">Usuario X</span>.
          </p>
        </div>

        {/* Filtro por programa */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <TagSelect
            value={programFilter}
            onChange={setProgramFilter}
            options={[
              { label: "Todos los programas", value: "" },
              ...programas.map((p) => ({
                label: p.nombre || p.nombre_programa || p.nombre_corto || String(p.id_programa || ''),
                value: String(p.id_programa ?? p.id ?? ''),
              })),
            ]}
            size="mdCompact"
            accent="grayStrong"
            menuWidth={188}
          />
        </div>
      </div>

      {/* Quick actions + KPIs + Cumpleaños */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <p className="text-sm font-medium mb-3">Acciones Rápidas</p>
            <div className="flex gap-2 flex-wrap">
              {canCreateAlumno && (<QuickAction icon={PlusCircle} label="Agregar Alumno" onClick={() => setOpenModal("alumno")} />)}
              {canCreateInstrumento && (<QuickAction icon={Wrench} label="Registrar Instrumento" onClick={() => setOpenModal("instrumento")} />)}
              {canCreateEvento && (<QuickAction icon={ClipboardList} label="Crear Evento" onClick={() => setOpenModal("evento")} />)}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium mb-3">Estadísticas Rápidas</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* KPI Alumnos */}
              <QuickStat
                label="Alumnos"
                value={(() => {
                  if (loadingStats) return "…";
                  switch (kpiAlumnosMode) {
                    case "activos":
                      return stats.alumnosActivos ?? 0;
                    case "inactivos":
                      return stats.alumnosInactivos ?? 0;
                    case "retirados":
                      return stats.alumnosRetirados ?? 0;
                    default:
                      return stats.totalAlumnos ?? 0;
                  }
                })()}
                icon={UserCheck}
                right={
                  <TagSelect
                    value={kpiAlumnosMode}
                    onChange={setKpiAlumnosMode}
                    options={[
                      { label: "Total", value: "total" },
                      { label: "Activos", value: "activos" },
                      { label: "Inactivos", value: "inactivos" },
                      { label: "Retirados", value: "retirados" },
                    ]}
                    size="sm"
                    accent="yellow"
                    menuWidth={100}
                  />
                }
              />

              {/* KPI Instrumentos */}
              <QuickStat
                label="Instrumentos"
                value={(() => {
                  if (loadingStats) return "…";
                  switch (kpiInstrumentosMode) {
                    case "disponibles":
                      return stats.instrumentosDisponibles ?? 0;
                    case "asignados":
                      return stats.instrumentosAsignados ?? 0;
                    case "mantenimiento":
                      return stats.instrumentosMantenimiento ?? 0;
                    case "baja":
                      return stats.instrumentosBaja ?? 0;
                    default:
                      return stats.instrumentosTotal ?? 0;
                  }
                })()}
                icon={Wrench}
                right={
                  <TagSelect
                    value={kpiInstrumentosMode}
                    onChange={setKpiInstrumentosMode}
                    options={[
                      { label: "Total", value: "total" },
                      { label: "Disponibles", value: "disponibles" },
                      { label: "Asignados", value: "asignados" },
                      { label: "Mantenimiento", value: "mantenimiento" },
                      { label: "Baja", value: "baja" },
                    ]}
                    size="sm"
                    accent="yellow"
                    menuWidth={100}
                  />
                }
              />

              {/* KPI Programas */}
              <QuickStat
                label="Total Programas"
                value={loadingStats ? "…" : (stats.totalProgramas ?? 0)}
                icon={Briefcase}
              />
            </div>
          </Card>

          {/* Próximos cumpleaños debajo de KPIs */}
          <Card>
            <p className="text-sm font-medium mb-3">Próximos cumpleaños (30 días)</p>
            {cumples.loading ? (
              <p className="text-sm text-gray-400">Cargando…</p>
            ) : cumples.error ? (
              <p className="text-sm text-red-600">{cumples.error}</p>
            ) : cumpleRows.length === 0 ? (
              <p className="text-sm text-gray-400">Sin cumpleaños en los próximos 30 días</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left muted">
                      <th className="py-2">Alumno</th>
                      <th className="py-2">Fecha</th>
                      <th className="py-2">Edad</th>
                      <th className="py-2">En</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cumpleRows.map((r, i) => (
                      <tr key={r?.id_alumno ?? `cumple-${i}` } className="text-app">
                        <td className="py-2">{r.nombre}</td>
                        <td className="py-2">
                          {(() => {
                            const d = new Date(r.proximo_cumple || r.fecha_nacimiento);
                            return isNaN(d) ? "" : d.toLocaleDateString("es-ES");
                          })()}
                        </td>
                        <td className="py-2">{r.edad}</td>
                        <td className="py-2">{r.dias_restantes} días</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-5">
          {/* Próximo evento */}
          <Card>
            <p className="text-gray-500 text-sm">Próximo Evento</p>
            {loadingEvento ? (
              <p className="text-sm text-gray-400">Cargando…</p>
            ) : proximoEvento ? (
              <>
                <h3 className="text-lg font-semibold mt-1">{proximoEvento.titulo}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" /> {proximoEvento.lugar}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Clock className="h-4 w-4" />{" "}
                  {(() => {
                    const d = parseDBDate(proximoEvento.fecha_evento);
                    return (
                      <>
                        {d ? `${d.toLocaleDateString("es-ES", { weekday: "long" })} ${d.toLocaleDateString("es-ES")}` : ""} •{" "}
                        {proximoEvento.hora_evento
                          ? proximoEvento.hora_evento.slice(0, 5)
                          : d
                            ? d.toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : ""}
                      </>
                    );
                  })()}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">No hay eventos próximos</p>
            )}
          </Card>

          {/* Calendario */}
          <MonthCalendar
            year={today.getFullYear()}
            monthIndex={today.getMonth()}
            eventos={eventosFuturos}
          />

          {/* Modales */}
          {openModal === "evento" && (
            <Modal title="Crear Evento" onClose={handleCloseModal}>
              <EventoForm
                data={editingData}
                onCancel={handleCloseModal}
                onSaved={() => {
                  handleCloseModal();
                  loadDashboard();
                }}
              />
            </Modal>
          )}

          {openModal === "instrumento" && (
            <Modal title="Registrar Instrumento" onClose={handleCloseModal}>
              <InstrumentoForm
                data={editingData}
                onCancel={handleCloseModal}
                onSaved={() => {
                  handleCloseModal();
                  loadDashboard();
                }}
              />
            </Modal>
          )}

          {openModal === "alumno" && (
            <Modal title="Agregar Alumno" onClose={handleCloseModal}>
              <AlumnoForm
                data={editingData}
                programas={programas}
                onCancel={handleCloseModal}
                onSaved={() => {
                  handleCloseModal();
                  loadDashboard();
                }}
              />
            </Modal>
          )}
        </div>
      </div>
      {/* Debug panel (activar con ?debug=1 en la URL) */}
      {debugEnabled && (
        <div className="mt-6 p-4 rounded-md bg-black/5 border">
          <p className="text-sm font-medium mb-2">Debug payloads (solo debug=1)</p>
          <pre className="text-xs overflow-auto max-h-60">
            {JSON.stringify(debugPayloads, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
