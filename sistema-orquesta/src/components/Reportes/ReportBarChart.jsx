import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

function ReportBarChartInner({ title, data, dataKey, nameKey, loading = false }) {
  const hasData = !loading && Array.isArray(data) && data.length > 0;
  const memoData = useMemo(() => data || [], [data]);

  return (
    <div className="card rounded-2xl shadow-md p-6">
      <h2 className="font-semibold mb-3">{title}</h2>
      {loading || !hasData ? (
        <div className="h-[250px] flex items-center justify-center muted">Cargando...</div>
      ) : (
        <ResponsiveContainer width="100%" height={250} debounce={50}>
          <BarChart data={memoData}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey={nameKey}/>
            <YAxis/>
            <Tooltip/>
            <Legend/>
            <Bar dataKey={dataKey} fill="#facc15"/>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default React.memo(ReportBarChartInner);
