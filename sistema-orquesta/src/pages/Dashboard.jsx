// sistema-orquesta/src/pages/Dashboard.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  PlusCircle, Wrench, ClipboardList, MapPin, Clock,
  ChevronLeft, ChevronRight, UserCheck, Filter
} from "lucide-react";

import { getDashboardStats, getProximoEvento, getCumpleaniosProximos } from "../api/dashboard";
import { getEventosFuturos } from "../api/eventos";
import { getProgramas } from "../api/programas";
import SegmentedDropdown from "../components/SegmentedDropdown";

import Modal from "../components/Modal";
import EventoForm from "../components/Eventos/EventoForm";
import InstrumentoForm from "../components/Instrumentos/InstrumentoForm";
import AlumnoForm from "../components/Alumnos/AlumnoForm";

// === UI Helpers ===
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-md border border-gray-200 p-5 ${className}`}>
    {children}
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs shadow-sm transition
      ${disabled ? "bg-yellow-300 text-gray-700 opacity-60 cursor-not-allowed" : "bg-yellow-400 text-gray-900 hover:bg-yellow-500"}`}
  >
    {Icon && <Icon className="h-4 w-4" />}
    <span>{label}</span>
  </button>
);

const QuickStat = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 shadow-sm">
    <div className="h-8 w-8 rounded-lg bg-yellow-200 text-gray-900 grid place-items-center shadow">
      {Icon && <Icon className="h-4 w-4" />}
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

// SegmentedDropdown ahora es un componente compartido en ../components/SegmentedDropdown

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
    className={`absolute z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-700 pointer-events-none
      ${align === "left" ? "right-full mr-2" : align === "right" ? "left-full ml-2" : "-translate-x-1/2 left-1/2"}`}
  >
    {eventos.map((evento) => {
      const d = parseDBDate(evento.fecha_evento);
      return (
        <div key={evento.id_evento} className="mb-2 last:mb-0">
          <p className="font-semibold text-gray-900">{evento.titulo}</p>
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
        </div>
      );
    })}
  </div>
);

// === Calendar ===
const MonthCalendar = ({ year, monthIndex, eventos = [] }) => {
  const [cursor, setCursor] = useState({ y: year, m: monthIndex });
  const [hovered, setHovered] = useState(null);

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

  // 👀 único log dentro del calendario
  console.log("Eventos agrupados por día en calendario:", eventosPorDia);

  const monthName = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
    new Date(cursor.y, cursor.m, 1)
  );

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize text-gray-900">
          {monthName} {cursor.y}
        </h3>
        <div className="flex gap-2">
          <button
            className="p-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
            onClick={() => setCursor(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
            onClick={() => setCursor(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Header días */}
      <div className="mt-4 grid grid-cols-7 text-center text-xs font-medium text-gray-500">
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
          const isHovered = hovered?.date.toDateString() === keyDate;

          const colIndex = i % 7;
          let align = "center";
          if (colIndex >= 5) align = "left";
          else if (colIndex <= 1) align = "right";

          return (
            <div
              key={i}
              onMouseEnter={() => setHovered({ date: d, eventos: eventosDia })}
              onMouseLeave={() => setHovered(null)}
              className={`relative aspect-square rounded-xl text-sm grid place-items-center border shadow-sm
                ${inMonth ? "bg-white text-gray-900 border-gray-200" : "bg-gray-50 text-gray-400 border-transparent"}
                ${eventosDia.length ? "bg-yellow-200 font-bold cursor-pointer" : ""}`}
            >
              {day}
              {isHovered && eventosDia.length > 0 && <Tooltip eventos={eventosDia} align={align} />}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// === Dashboard ===
export default function Dashboard() {
  const [programFilter, setProgramFilter] = useState("");
  const [stats, setStats] = useState({});
  const [proximoEvento, setProximoEvento] = useState(null);
  const [eventosFuturos, setEventosFuturos] = useState([]);
  const [openModal, setOpenModal] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [programas, setProgramas] = useState([]);
  const [cumples, setCumples] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const today = new Date();

  // nuevos controles locales para breakdown
  const [alumnoFiltro, setAlumnoFiltro] = useState("total"); // total|activos|inactivos|retirados
  const [instFiltro, setInstFiltro] = useState("total"); // total|disponibles|asignados|mantenimiento|baja

  const handleCloseModal = () => {
    setOpenModal(null);
    setEditingData(null);
  };

  const loadDashboard = useCallback(async () => {
    try {
      setLoadingStats(true);
      const resStats = await getDashboardStats(programFilter || null);
      setStats(resStats.data || {});

      const resEvento = await getProximoEvento(programFilter || null);
      setProximoEvento(resEvento.data);

      const eventos = await getEventosFuturos();
      console.log("Eventos obtenidos del backend:", eventos);
      setEventosFuturos(Array.isArray(eventos) ? eventos : []);

      // cargar cumpleaños
      const resCum = await getCumpleaniosProximos(30, programFilter || null);
      setCumples(Array.isArray(resCum.data) ? resCum.data : []);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [programFilter]);

  useEffect(() => {
    loadDashboard();
    const fetchProgramas = async () => {
      try {
        const res = await getProgramas();
        setProgramas(res.data);
      } catch (err) {
        console.error("Error cargando programas:", err);
      }
    };
    fetchProgramas();
  }, [loadDashboard]);

  // helpers para valores según filtro
  const alumnosDisplay = (() => {
    if (!stats) return 0;
    switch (alumnoFiltro) {
      case "activos":
        return stats.alumnosActivos || 0;
      case "inactivos":
        return stats.alumnosInactivos || 0;
      case "retirados":
        return stats.alumnosRetirados || 0;
      default:
        return stats.totalAlumnos || 0;
    }
  })();

  const instrumentosDisplay = (() => {
    if (!stats) return 0;
    switch (instFiltro) {
      case "disponibles":
        return stats.instrumentosDisponibles || 0;
      case "asignados":
        return stats.instrumentosAsignados || 0;
      case "mantenimiento":
        return stats.instrumentosMantenimiento || 0;
      case "baja":
        return stats.instrumentosBaja || 0;
      default:
        return stats.instrumentosTotal || 0;
    }
  })();

  // conteos para mostrar en los botones de filtro
  const alumnoCounts = {
    total: stats.totalAlumnos || 0,
    activos: stats.alumnosActivos || 0,
    inactivos: stats.alumnosInactivos || 0,
    retirados: stats.alumnosRetirados || 0,
  };
  const instCounts = {
    total: stats.instrumentosTotal || 0,
    disponibles: stats.instrumentosDisponibles || 0,
    asignados: stats.instrumentosAsignados || 0,
    mantenimiento: stats.instrumentosMantenimiento || 0,
    baja: stats.instrumentosBaja || 0,
  };
  const alumnoOptions = [
    { key: "total", label: "Total", count: alumnoCounts.total },
    { key: "activos", label: "Activos", count: alumnoCounts.activos },
    { key: "inactivos", label: "Inactivos", count: alumnoCounts.inactivos },
    { key: "retirados", label: "Retirados", count: alumnoCounts.retirados },
  ];
  const instOptions = [
    { key: "total", label: "Total", count: instCounts.total },
    { key: "disponibles", label: "Disp.", count: instCounts.disponibles },
    { key: "asignados", label: "Asig.", count: instCounts.asignados },
    { key: "mantenimiento", label: "Mant.", count: instCounts.mantenimiento },
    { key: "baja", label: "Baja", count: instCounts.baja },
  ];

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
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm">
            <Filter className="h-4 w-4 text-gray-500" />
            <SegmentedDropdown
              label="Programa"
              options={[{ key: "", label: "General" }, ...programas.map(p => ({ key: String(p.id_programa), label: p.nombre }))]}
              selectedKey={String(programFilter)}
              onSelect={(k) => setProgramFilter(k)}
              disabled={loadingStats}
              align="left"
              matchTriggerWidth
            />
          </div>
        </div>
      </div>

      {/* Quick actions + quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <p className="text-sm font-medium mb-3">Acciones Rápidas</p>
            <div className="flex gap-2 flex-wrap">
              <QuickAction icon={PlusCircle} label="Agregar Alumno" onClick={() => setOpenModal("alumno")} disabled={loadingStats} />
              <QuickAction icon={Wrench} label="Registrar Instrumento" onClick={() => setOpenModal("instrumento")} disabled={loadingStats} />
              <QuickAction icon={ClipboardList} label="Crear Evento" onClick={() => setOpenModal("evento")} disabled={loadingStats} />
            </div>
          </Card>

          {/* KPIs: Alumnos, Instrumentos, Programas */}
          <Card>
            <p className="text-sm font-medium mb-3">Estadísticas Rápidas</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {/* Alumnos */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-yellow-200 text-gray-900 grid place-items-center shadow">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Alumnos</p>
                    <p className="text-xl font-semibold text-gray-900">{alumnosDisplay}</p>
                  </div>
                </div>
                <SegmentedDropdown
                  options={alumnoOptions}
                  selectedKey={alumnoFiltro}
                  onSelect={setAlumnoFiltro}
                  disabled={loadingStats}
                  variant="gray"
                />
              </div>

              {/* Instrumentos */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-yellow-200 text-gray-900 grid place-items-center shadow">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Instrumentos</p>
                    <p className="text-xl font-semibold text-gray-900">{instrumentosDisplay}</p>
                  </div>
                </div>
                <SegmentedDropdown
                  options={instOptions}
                  selectedKey={instFiltro}
                  onSelect={setInstFiltro}
                  disabled={loadingStats}
                  variant="gray"
                />
              </div>

              {/* Programas */}
              <QuickStat label="Total Programas" value={stats.totalProgramas || 0} icon={ClipboardList} />
            </div>
          </Card>

          {/* Lista de próximos cumpleaños */}
          <Card>
            <p className="text-sm font-medium mb-3">Próximos cumpleaños (30 días)</p>
            {(!cumples || cumples.length === 0) ? (
              <p className="text-sm text-gray-500">No hay cumpleaños próximos</p>
            ) : (
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 border-b text-left">Alumno</th>
                      <th className="px-3 py-2 border-b text-left">Fecha</th>
                      <th className="px-3 py-2 border-b text-left">Edad</th>
                      <th className="px-3 py-2 border-b text-left">En</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cumples.map((c) => (
                      <tr key={c.id_alumno}>
                        <td className="px-3 py-2 border-b">{c.nombre}</td>
                        <td className="px-3 py-2 border-b">{c.proximo_cumple ? new Date(c.proximo_cumple).toLocaleDateString("es-ES") : ""}</td>
                        <td className="px-3 py-2 border-b">{c.edad}</td>
                        <td className="px-3 py-2 border-b">{c.dias_restantes} días</td>
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
            {proximoEvento ? (
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
                        {d ? d.toLocaleDateString("es-ES") : ""} •{" "}
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
    </div>
  );
}