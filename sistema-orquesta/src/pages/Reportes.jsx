import { useEffect, useState } from "react";
import {
  getAlumnosPorPrograma,
  getInstrumentosPorEstado,
} from "../api/reportes";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { BarChart3, Users, Music2 } from "lucide-react";

const COLORS = ["#facc15", "#4ade80", "#60a5fa", "#f87171"];

export default function Reportes() {
  const [alumnosPrograma, setAlumnosPrograma] = useState([]);
  const [instrumentosEstado, setInstrumentosEstado] = useState([]);
  const [view, setView] = useState("tabla"); // "tabla" | "grafico"

  useEffect(() => {
    loadReportes();
  }, []);

  const loadReportes = async () => {
    try {
      const resAlumnos = await getAlumnosPorPrograma();
      setAlumnosPrograma(resAlumnos.data);

      const resInstruments = await getInstrumentosPorEstado();
      setInstrumentosEstado(resInstruments.data);
    } catch (err) {
      console.error("Error cargando reportes:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Reportes
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView("tabla")}
            className={`px-3 py-1 rounded-lg text-sm ${
              view === "tabla"
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Tabla
          </button>
          <button
            onClick={() => setView("grafico")}
            className={`px-3 py-1 rounded-lg text-sm ${
              view === "grafico"
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Gráfico
          </button>
        </div>
      </div>

      {/* Vista en TABLA */}
      {view === "tabla" && (
        <>
          {/* Alumnos por programa */}
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Alumnos por Programa
            </h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border-b">Programa</th>
                  <th className="px-4 py-2 border-b">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {alumnosPrograma.map((p) => (
                  <tr key={p.programa}>
                    <td className="px-4 py-2 border-b">{p.programa}</td>
                    <td className="px-4 py-2 border-b">{p.cantidad}</td>
                  </tr>
                ))}
                {alumnosPrograma.length === 0 && (
                  <tr>
                    <td colSpan="2" className="text-center py-4 text-gray-500">
                      No hay datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Instrumentos por estado */}
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Music2 className="h-4 w-4" />
              Instrumentos por Estado
            </h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border-b">Estado</th>
                  <th className="px-4 py-2 border-b">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {instrumentosEstado.map((i) => (
                  <tr key={i.estado}>
                    <td className="px-4 py-2 border-b">{i.estado}</td>
                    <td className="px-4 py-2 border-b">{i.cantidad}</td>
                  </tr>
                ))}
                {instrumentosEstado.length === 0 && (
                  <tr>
                    <td colSpan="2" className="text-center py-4 text-gray-500">
                      No hay datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Vista en GRÁFICO */}
      {view === "grafico" && (
        <>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="font-semibold mb-3">Alumnos por Programa</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alumnosPrograma}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="programa" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="font-semibold mb-3">Instrumentos por Estado</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={instrumentosEstado}
                  dataKey="cantidad"
                  nameKey="estado"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {instrumentosEstado.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
