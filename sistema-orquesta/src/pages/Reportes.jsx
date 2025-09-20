// src/pages/Reportes.jsx
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
  getUsuariosTotal,
  getUsuariosPorRol,
  getAlumnosPorProgramaAnio
} from "../api/reportes";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from "recharts";

import { BarChart3, Users, Music2, Calendar, UserCheck, UserMinus } from "lucide-react";

const COLORS = ["#facc15", "#4ade80", "#60a5fa", "#f87171", "#a78bfa", "#f472b6"];

export default function Reportes() {
  const [activeTab, setActiveTab] = useState("alumnos"); // alumnos, instrumentos, representantes, eventos

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
const [programasDisponibles, setProgramasDisponibles] = useState([]); // para select
const [estadosInstrumentoDisponibles, setEstadosInstrumentoDisponibles] = useState([]); // para select

// Vista global de reportes: "tabla" o "grafico"
const [viewGlobal, setViewGlobal] = useState("tabla");

  useEffect(() => {
    loadReportes();
  }, []);

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

      const resAlumnosEdad = await getAlumnosPorEdad();
      setAlumnosEdad(resAlumnosEdad.data);

      const resAlumnosGenero = await getAlumnosPorGenero();
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Reportes
        </h1>
      </div>

      {/* Selector global Tabla / Gráfico */}
        <div className="flex gap-2 mb-4 mt-2">
          <button
            onClick={() => setViewGlobal("tabla")}
            className={`px-3 py-1 rounded text-sm ${viewGlobal==="tabla" ? "bg-yellow-400 text-gray-900" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Tabla
          </button>
          <button
            onClick={() => setViewGlobal("grafico")}
            className={`px-3 py-1 rounded text-sm ${viewGlobal==="grafico" ? "bg-yellow-400 text-gray-900" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Gráfico
          </button>
        </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Users} value={totales.alumnos} label="Alumnos" color="text-yellow-400"/>
        <KpiCard icon={Music2} value={totales.instrumentos} label="Instrumentos" color="text-blue-400"/>
        <KpiCard icon={UserCheck} value={totales.representantes} label="Representantes" color="text-green-400"/>
        <KpiCard icon={Calendar} value={totales.eventos} label="Eventos" color="text-pink-400"/>
      </div>



      {/* Tabs */}
      <div className="flex gap-2 border-b mt-4">
        {["alumnos","instrumentos","representantes","eventos"].map(tab => (
          <button
            key={tab}
            onClick={()=>setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg ${activeTab===tab ? "bg-yellow-400 text-gray-900 font-semibold" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-6 mt-4">
        {activeTab === "alumnos" && <AlumnosSection 
          alumnosPrograma={alumnosPrograma} 
          alumnosEdad={alumnosEdad} 
          alumnosGenero={alumnosGenero} 
          alumnosComparativa={alumnosComparativa} 
          viewGlobal={viewGlobal}
        />}
        {activeTab === "instrumentos" && <InstrumentosSection 
          instrumentosEstado={instrumentosEstado} 
          instrumentosCategoria={instrumentosCategoria} 
          instrumentosTop={instrumentosTop} 
          viewGlobal={viewGlobal}
        />}
        {activeTab === "representantes" && <RepresentantesSection 
          representantesPorAlumnos={representantesPorAlumnos} 
          viewGlobal={viewGlobal}
        />}
        {activeTab === "eventos" && <EventosSection 
          eventosPorMes={eventosPorMes} 
          viewGlobal={viewGlobal}
        />}
      </div>
    </div>
  );
}

/* ------------------ COMPONENTES ------------------ */

function KpiCard({ icon: Icon, value, label, color }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow flex flex-col items-center">
      <Icon className={`h-6 w-6 ${color}`} />
      <p className="font-bold text-lg">{value}</p>
      <span>{label}</span>
    </div>
  );
}

/* ---- Alumnos ---- */
function AlumnosSection({ alumnosPrograma, alumnosEdad, alumnosGenero, alumnosComparativa, viewGlobal }) {
  if (viewGlobal === "tabla") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportTable title="Alumnos por Programa" data={alumnosPrograma} cols={["programa","cantidad"]}/>
        <ReportTable title="Alumnos por Edad" data={alumnosEdad} cols={["edad","cantidad"]}/>
        <ReportTable title="Alumnos por Género" data={alumnosGenero} cols={["genero","cantidad"]}/>
        <ReportTable title="Comparativa Alumnos 2024-2025" data={alumnosComparativa} cols={["programa","cantidad"]}/>
      </div>
    );
  } else {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportBarChart title="Alumnos por Programa" data={alumnosPrograma} dataKey="cantidad" nameKey="programa"/>
        <ReportBarChart title="Alumnos por Edad" data={alumnosEdad} dataKey="cantidad" nameKey="edad"/>
        <ReportPieChart title="Alumnos por Género" data={alumnosGenero} dataKey="cantidad" nameKey="genero"/>
        <ReportBarChart title="Comparativa Alumnos 2024-2025" data={alumnosComparativa} dataKey="cantidad" nameKey="programa"/>
      </div>
    );
  }
}

/* ---- Instrumentos ---- */
function InstrumentosSection({ instrumentosEstado, instrumentosCategoria, instrumentosTop, viewGlobal }) {
  if (viewGlobal === "tabla") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportTable title="Instrumentos por Estado" data={instrumentosEstado} cols={["estado","cantidad"]}/>
        <ReportTable title="Instrumentos por Categoría" data={instrumentosCategoria} cols={["categoria","cantidad"]}/>
        <ReportTable title="Top Instrumentos Asignados" data={instrumentosTop} cols={["nombre","cantidad"]}/>
      </div>
    );
  } else {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportPieChart title="Instrumentos por Estado" data={instrumentosEstado} dataKey="cantidad" nameKey="estado"/>
        <ReportBarChart title="Instrumentos por Categoría" data={instrumentosCategoria} dataKey="cantidad" nameKey="categoria"/>
        <ReportBarChart title="Top Instrumentos Asignados" data={instrumentosTop} dataKey="cantidad" nameKey="nombre"/>
      </div>
    );
  }
}

/* ---- Representantes ---- */
function RepresentantesSection({ representantesPorAlumnos, viewGlobal }) {
  if (viewGlobal === "tabla") {
    return (
      <div className="grid grid-cols-1 gap-4">
        <ReportTable title="Representantes por Alumnos" data={representantesPorAlumnos} cols={["nombre","cantidad"]}/>
      </div>
    );
  } else {
    // Representantes no tiene gráficos específicos, pero podemos mostrar un PieChart
    return (
      <div className="grid grid-cols-1 gap-4">
        <ReportPieChart title="Representantes por Alumnos" data={representantesPorAlumnos} dataKey="cantidad" nameKey="nombre"/>
      </div>
    );
  }
}


/* ---- Eventos ---- */
function EventosSection({ eventosPorMes, viewGlobal }) {
  if (viewGlobal === "tabla") {
    return <ReportTable title="Eventos por Mes" data={eventosPorMes} cols={["mes","cantidad"]}/>;
  } else {
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="font-semibold mb-3">Eventos por Mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={eventosPorMes}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="mes"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Line type="monotone" dataKey="cantidad" stroke="#4ade80"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}


/* ------------------ Reportes genéricos ------------------ */

function ReportTable({ title, data, cols, Icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <h2 className="font-semibold mb-3 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4"/>}
        {title}
      </h2>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {cols.map(c => <th key={c} className="px-4 py-2 border-b">{c.charAt(0).toUpperCase() + c.slice(1)}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row,i)=>(
            <tr key={i}>
              {cols.map(c=><td key={c} className="px-4 py-2 border-b">{row[c]}</td>)}
            </tr>
          )) : (
            <tr>
              <td colSpan={cols.length} className="text-center py-4 text-gray-500">No hay datos</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ReportBarChart({ title, data, dataKey, nameKey }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="font-semibold mb-3">{title}</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey={nameKey}/>
          <YAxis/>
          <Tooltip/>
          <Legend/>
          <Bar dataKey={dataKey} fill="#facc15"/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ReportPieChart({ title, data, dataKey, nameKey }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="font-semibold mb-3">{title}</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={80} label>
            {data.map((_,index)=><Cell key={index} fill={COLORS[index % COLORS.length]}/>)}
          </Pie>
          <Tooltip/>
          <Legend/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
