import { useEffect, useState } from "react";
import {
  getAlumnosTotal,
  getAlumnosPorPrograma,
  getAlumnosPorEdad,
  getAlumnosPorGenero,
  getInstrumentosTotal,
  getInstrumentosPorEstado,
  getInstrumentosPorCategoria,
  getInstrumentosTopAsignados,
  getRepresentantesTotal,
  getRepresentantesPorAlumnos,
  getEventosTotal,
  getEventosPorMes,
  getAlumnosPorProgramaAnio
} from "../api/reportes";

import { Users, Music2, Calendar, UserCheck } from "lucide-react";

// Componentes
import KpiCard from "../components/Reportes/KpiCard";
import AlumnosSection from "../components/Reportes/AlumnosSection";
import InstrumentosSection from "../components/Reportes/InstrumentosSection";
import RepresentantesSection from "../components/Reportes/RepresentantesSection";
import EventosSection from "../components/Reportes/EventosSection";
import ReportesHeader from "../components/Reportes/ReportesHeader";
import ReportesViewSelector from "../components/Reportes/ReportesViewSelector";
import ReportesTabs from "../components/Reportes/ReportesTabs";

export default function Reportes() {
  const [activeTab, setActiveTab] = useState("alumnos");
  const [viewGlobal, setViewGlobal] = useState("tabla");

  // KPIs
  const [totales, setTotales] = useState({
    alumnos: 0,
    instrumentos: 0,
    representantes: 0,
    eventos: 0,
  });

  // Alumnos
  const [alumnosPrograma, setAlumnosPrograma] = useState([]);
  const [alumnosEdad, setAlumnosEdad] = useState([]);
  const [alumnosGenero, setAlumnosGenero] = useState([]);
  const [alumnosComparativa, setAlumnosComparativa] = useState([]);

  // Instrumentos
  const [instrumentosEstado, setInstrumentosEstado] = useState([]);
  const [instrumentosCategoria, setInstrumentosCategoria] = useState([]);
  const [instrumentosTop, setInstrumentosTop] = useState([]);

  // Representantes
  const [representantesPorAlumnos, setRepresentantesPorAlumnos] = useState([]);

  // Eventos
  const [eventosPorMes, setEventosPorMes] = useState([]);

  // Filtros dinámicos
  const [filtroPrograma, setFiltroPrograma] = useState("todos");
  const [filtroEstadoInstrumento, setFiltroEstadoInstrumento] = useState("todos");
  const [programasDisponibles, setProgramasDisponibles] = useState([]);
  const [estadosInstrumentoDisponibles, setEstadosInstrumentoDisponibles] = useState([]);

  // Cargar reportes al inicio y cuando cambia el filtro de programa
  useEffect(() => {
    loadReportes();
    // eslint-disable-next-line
  }, [filtroPrograma]);

  const loadReportes = async () => {
    try {
      // KPIs
      const resAlumnos = await getAlumnosTotal();
      const resInstrumentos = await getInstrumentosTotal();
      const resRepresentantes = await getRepresentantesTotal();
      const resEventos = await getEventosTotal();
      setTotales({
        alumnos: resAlumnos.data.total,
        instrumentos: resInstrumentos.data.total,
        representantes: resRepresentantes.data.total,
        eventos: resEventos.data.total,
      });

      // Alumnos
      const resAlumnosPrograma = await getAlumnosPorPrograma();
      setAlumnosPrograma(resAlumnosPrograma.data);
      setProgramasDisponibles(resAlumnosPrograma.data.map(a => a.programa));

  // Alumnos por edad y género con filtro de programa
  const resAlumnosEdad = await getAlumnosPorEdad(filtroPrograma);
  setAlumnosEdad(resAlumnosEdad.data);

  const resAlumnosGenero = await getAlumnosPorGenero(filtroPrograma);
  setAlumnosGenero(resAlumnosGenero.data);

      const resComparativa = await getAlumnosPorProgramaAnio(2024, 2025);
      setAlumnosComparativa(resComparativa.data);

      // Instrumentos
      const resInstrumentosEstado = await getInstrumentosPorEstado();
      setInstrumentosEstado(resInstrumentosEstado.data);
      setEstadosInstrumentoDisponibles(resInstrumentosEstado.data.map(i => i.estado));

      const resInstrumentosCategoria = await getInstrumentosPorCategoria();
      setInstrumentosCategoria(resInstrumentosCategoria.data);

      const resInstrumentosTop = await getInstrumentosTopAsignados();
      setInstrumentosTop(resInstrumentosTop.data);

      // Representantes
      const resRepPorAlumnos = await getRepresentantesPorAlumnos();
      setRepresentantesPorAlumnos(resRepPorAlumnos.data);

      // Eventos
      const resEventosPorMes = await getEventosPorMes();
      setEventosPorMes(resEventosPorMes.data);

    } catch (err) {
      console.error("Error cargando reportes:", err);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <ReportesHeader />

      {/* Selector global Tabla / Gráfico */}
      <ReportesViewSelector viewGlobal={viewGlobal} setViewGlobal={setViewGlobal} />

      {/* Filtros dinámicos */}
      {activeTab === "alumnos" && (
        <div className="flex gap-2 mb-4">
          <select
            value={filtroPrograma}
            onChange={(e) => setFiltroPrograma(e.target.value)}
            className="px-3 py-1 border rounded"
          >
            <option value="todos">Todos los programas</option>
            {programasDisponibles.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>
        </div>
      )}

      {activeTab === "instrumentos" && (
        <div className="flex gap-2 mb-4">
          <select
            value={filtroEstadoInstrumento}
            onChange={(e) => setFiltroEstadoInstrumento(e.target.value)}
            className="px-3 py-1 border rounded"
          >
            <option value="todos">Todos los estados</option>
            {estadosInstrumentoDisponibles.map((e, i) => (
              <option key={i} value={e}>{e}</option>
            ))}
          </select>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Users} value={totales.alumnos} label="Alumnos" color="text-yellow-400"/>
        <KpiCard icon={Music2} value={totales.instrumentos} label="Instrumentos" color="text-blue-400"/>
        <KpiCard icon={UserCheck} value={totales.representantes} label="Representantes" color="text-green-400"/>
        <KpiCard icon={Calendar} value={totales.eventos} label="Eventos" color="text-pink-400"/>
      </div>

      {/* Tabs */}
      <ReportesTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab content */}
      <div className="space-y-6 mt-4">
        {activeTab === "alumnos" && (
          <AlumnosSection 
            alumnosPrograma={
              filtroPrograma === "todos"
                ? alumnosPrograma
                : alumnosPrograma.filter(a => a.programa === filtroPrograma)
            }
            alumnosEdad={alumnosEdad}
            alumnosGenero={alumnosGenero}
            alumnosComparativa={
              filtroPrograma === "todos"
                ? alumnosComparativa
                : alumnosComparativa.filter(c => c.programa === filtroPrograma)
            }
            viewGlobal={viewGlobal}
          />
        )}
        {activeTab === "instrumentos" && (
          <InstrumentosSection 
            instrumentosEstado={instrumentosEstado} 
            instrumentosCategoria={instrumentosCategoria} 
            instrumentosTop={instrumentosTop} 
            viewGlobal={viewGlobal}
          />
        )}
        {activeTab === "representantes" && (
          <RepresentantesSection 
            representantesPorAlumnos={representantesPorAlumnos} 
            viewGlobal={viewGlobal}
          />
        )}
        {activeTab === "eventos" && (
          <EventosSection 
            eventosPorMes={eventosPorMes} 
            viewGlobal={viewGlobal}
          />
        )}
      </div>
    </div>
  );
}
