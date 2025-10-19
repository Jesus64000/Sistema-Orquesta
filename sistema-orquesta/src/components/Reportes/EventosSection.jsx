import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
import ReportTable from "./ReportTable";

export default function EventosSection({ eventosPorMes, viewGlobal, loading = false }) {
  if (viewGlobal === "tabla") {
    return <ReportTable title="Eventos por Mes" data={eventosPorMes} cols={["mes","cantidad"]}/>;
  } else {
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="card rounded-2xl shadow-md p-6">
          <h2 className="font-semibold mb-3">Eventos por Mes</h2>
          {loading || !Array.isArray(eventosPorMes) || eventosPorMes.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center muted">Cargando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300} debounce={50}>
              <LineChart data={eventosPorMes}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="mes"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <Line type="monotone" dataKey="cantidad" stroke="#4ade80"/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }
}
