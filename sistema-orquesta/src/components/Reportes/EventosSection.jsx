import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
import ReportTable from "./ReportTable";

export default function EventosSection({ eventosPorMes, viewGlobal }) {
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
