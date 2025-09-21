// sistema-orquesta/src/pages/Dashboard.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  PlusCircle, Wrench, ClipboardList, MapPin, Clock,
  ChevronLeft, ChevronRight, UserCheck, UserPlus, Hourglass, Briefcase, Filter
} from "lucide-react";

import { getDashboardStats, getProximoEvento } from "../api/dashboard";
import { getEventosFuturos } from "../api/eventos";
import { getProgramas } from "../api/programas";

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

const QuickAction = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 text-xs shadow-sm"
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
  const today = new Date();

  const handleCloseModal = () => {
    setOpenModal(null);
    setEditingData(null);
  };

  const loadDashboard = useCallback(async () => {
    try {
      const resStats = await getDashboardStats(programFilter || null);
      setStats(resStats.data);

      const resEvento = await getProximoEvento(programFilter || null);
      setProximoEvento(resEvento.data);

      const eventos = await getEventosFuturos();
      console.log("Eventos obtenidos del backend:", eventos); // 👀 único log aquí
      setEventosFuturos(Array.isArray(eventos) ? eventos : []);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
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
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              <option value="">General</option>
              {programas.map((p) => (
                <option key={p.id_programa} value={p.id_programa}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick actions + quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <p className="text-sm font-medium mb-3">Acciones Rápidas</p>
            <div className="flex gap-2 flex-wrap">
              <QuickAction icon={PlusCircle} label="Agregar Alumno" onClick={() => setOpenModal("alumno")} />
              <QuickAction icon={Wrench} label="Registrar Instrumento" onClick={() => setOpenModal("instrumento")} />
              <QuickAction icon={ClipboardList} label="Crear Evento" onClick={() => setOpenModal("evento")} />
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium mb-3">Estadísticas Rápidas</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <QuickStat label="Total Alumnos" value={stats.totalAlumnos || 0} icon={UserCheck} />
              <QuickStat label="Activos hoy" value={stats.activos || 0} icon={UserPlus} />
              <QuickStat label="Nuevos ingresos" value={stats.nuevosHoy || 0} icon={Hourglass} />
              <QuickStat label="Personal activo" value={stats.personal || 0} icon={Briefcase} />
            </div>
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