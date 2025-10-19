import { useEffect, useState } from "react";
import {
  getAlumnosTotal,
  getAlumnosPorPrograma,
  getAlumnosPorEdad,
  getAlumnosPorGenero,
  getInstrumentosTotal,
  getInstrumentosPorEstado,
  getInstrumentosTopAsignados,
  getRepresentantesTotal,
  getRepresentantesPorAlumnos,
  getEventosTotal,
  getEventosPorMes,
  getAlumnosPorProgramaAnio
} from "../api/reportes";
import { getEstados } from "../api/administracion/estados";

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
import TagSelect from "../components/TagSelect";

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
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);

  // Instrumentos
  const [instrumentosEstado, setInstrumentosEstado] = useState([]);
  const [instrumentosCategoria, setInstrumentosCategoria] = useState([]);
  const [instrumentosTop, setInstrumentosTop] = useState([]);
  const [loadingInstrumentos, setLoadingInstrumentos] = useState(false);

  // Representantes
  const [representantesPorAlumnos, setRepresentantesPorAlumnos] = useState([]);
  const [loadingRepresentantes, setLoadingRepresentantes] = useState(false);

  // Eventos
  const [eventosPorMes, setEventosPorMes] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(false);

  // Filtros dinámicos
  const [filtroPrograma, setFiltroPrograma] = useState("todos");
  const [filtroEstadoInstrumento, setFiltroEstadoInstrumento] = useState("todos");
  const [filtroCategoriaInstrumento, setFiltroCategoriaInstrumento] = useState("todos");
  const [programasDisponibles, setProgramasDisponibles] = useState([]);
  const [estadosInstrumentoDisponibles, setEstadosInstrumentoDisponibles] = useState([]);
  const [categoriasInstrumentoDisponibles, setCategoriasInstrumentoDisponibles] = useState([]);

  // Cargar reportes al inicio y cuando cambia el filtro de programa

  // Fetch KPIs and programas on mount (fast essentials)
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const [resAlumnos, resInstrumentos, resRepresentantes, resEventos] = await Promise.all([
          getAlumnosTotal(),
          getInstrumentosTotal(),
          getRepresentantesTotal(),
          getEventosTotal(),
        ]);
        if (!mounted) return;
        setTotales({
          alumnos: resAlumnos.data.total,
          instrumentos: resInstrumentos.data.total,
          representantes: resRepresentantes.data.total,
          eventos: resEventos.data.total,
        });

        // programas disponibles
        const resProgramas = await getAlumnosPorPrograma();
        if (!mounted) return;
        setProgramasDisponibles(resProgramas.data.map(a => a.programa));

        // estados y categorias (needed for instrumentos filters) - load once
        const resEstados = await getEstados();
        if (!mounted) return;
        setEstadosInstrumentoDisponibles(Array.isArray(resEstados.data) ? resEstados.data : []);
        const { getCategorias } = await import("../api/administracion/categorias");
        const resCategorias = await getCategorias();
        if (!mounted) return;
        setCategoriasInstrumentoDisponibles(Array.isArray(resCategorias.data) ? resCategorias.data : []);
      } catch (err) {
        console.error("Error inicializando reportes:", err);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  // Fetch data only for the active tab (and respect filters)
  useEffect(() => {
    let mounted = true;
    const fetchSection = async () => {
      try {
        if (activeTab === "alumnos") {
          setLoadingAlumnos(true);
          const [resAlumnosPrograma, resAlumnosEdad, resAlumnosGenero, resComparativa] = await Promise.all([
            getAlumnosPorPrograma(),
            getAlumnosPorEdad(filtroPrograma),
            getAlumnosPorGenero(filtroPrograma),
            getAlumnosPorProgramaAnio(2024, 2025),
          ]);
          if (!mounted) return;
          setAlumnosPrograma(resAlumnosPrograma.data || []);
          setAlumnosEdad(resAlumnosEdad.data || []);
          setAlumnosGenero(resAlumnosGenero.data || []);
          setAlumnosComparativa(resComparativa.data || []);
          setLoadingAlumnos(false);
        } else if (activeTab === "instrumentos") {
          setLoadingInstrumentos(true);
          const [resInstrumentosEstado, resInstrumentosCategoria, resInstrumentosTop] = await Promise.all([
            getInstrumentosPorEstado(filtroEstadoInstrumento, filtroCategoriaInstrumento),
            // dynamic import kept for backward compatibility
            (async () => {
              const { getInstrumentosPorCategoria } = await import("../api/reportes");
              const r = await getInstrumentosPorCategoria(filtroCategoriaInstrumento, filtroEstadoInstrumento);
              return r;
            })(),
            getInstrumentosTopAsignados(),
          ]);
          if (!mounted) return;
          setInstrumentosEstado(resInstrumentosEstado.data || []);
          setInstrumentosCategoria(resInstrumentosCategoria.data || []);
          setInstrumentosTop(resInstrumentosTop.data || []);
          setLoadingInstrumentos(false);
        } else if (activeTab === "representantes") {
          setLoadingRepresentantes(true);
          const resRepPorAlumnos = await getRepresentantesPorAlumnos();
          if (!mounted) return;
          setRepresentantesPorAlumnos(resRepPorAlumnos.data || []);
          setLoadingRepresentantes(false);
        } else if (activeTab === "eventos") {
          setLoadingEventos(true);
          const resEventosPorMes = await getEventosPorMes();
          if (!mounted) return;
          setEventosPorMes(resEventosPorMes.data || []);
          setLoadingEventos(false);
        }
      } catch (err) {
        console.error("Error cargando sección de reportes:", err);
        setLoadingAlumnos(false);
        setLoadingInstrumentos(false);
        setLoadingRepresentantes(false);
        setLoadingEventos(false);
      }
    };
    fetchSection();
    return () => { mounted = false; };
  }, [activeTab, filtroPrograma, filtroEstadoInstrumento, filtroCategoriaInstrumento]);


  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <ReportesHeader />

      {/* Selector global Tabla / Gráfico */}
      <ReportesViewSelector viewGlobal={viewGlobal} setViewGlobal={setViewGlobal} />

      {/* Filtros dinámicos */}
      {activeTab === "alumnos" && (
        <div className="flex gap-2 mb-4">
          <TagSelect
            value={filtroPrograma}
            onChange={setFiltroPrograma}
            options={[{ label: "Todos los programas", value: "todos" }, ...programasDisponibles.map((p) => ({ label: p, value: p }))]}
            size="mdCompact"
            accent="grayStrong"
            menuWidth={220}
          />
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
            {estadosInstrumentoDisponibles.map((e) => (
              <option key={e.id_estado} value={e.id_estado}>{e.nombre}</option>
            ))}
          </select>
          <select
            value={filtroCategoriaInstrumento}
            onChange={(e) => setFiltroCategoriaInstrumento(e.target.value)}
            className="px-3 py-1 border rounded"
          >
            <option value="todos">Todas las categorías</option>
            {categoriasInstrumentoDisponibles.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
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
            loading={loadingAlumnos}
          />
        )}
        {activeTab === "instrumentos" && (
          <InstrumentosSection 
            instrumentosEstado={
              filtroEstadoInstrumento === "todos"
                ? instrumentosEstado
                : instrumentosEstado.filter(i => String(i.id_estado) === String(filtroEstadoInstrumento))
            }
            instrumentosCategoria={instrumentosCategoria}
            instrumentosTop={instrumentosTop}
            viewGlobal={viewGlobal}
            loading={loadingInstrumentos}
          />
        )}
        {activeTab === "representantes" && (
          <RepresentantesSection 
            representantesPorAlumnos={representantesPorAlumnos} 
            viewGlobal={viewGlobal}
            loading={loadingRepresentantes}
          />
        )}
        {activeTab === "eventos" && (
          <EventosSection 
            eventosPorMes={eventosPorMes} 
            viewGlobal={viewGlobal}
            loading={loadingEventos}
          />
        )}
      </div>
    </div>
  );
}
