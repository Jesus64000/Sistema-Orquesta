import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#facc15", "#4ade80", "#60a5fa", "#f87171", "#a78bfa", "#f472b6"];

function ReportPieChartInner({ title, data, dataKey, nameKey, loading = false }) {
  const hasData = !loading && Array.isArray(data) && data.length > 0;
  const cells = useMemo(() => {
    if (!hasData) return null;
    return data.map((_, index) => (
      <Cell key={index} fill={COLORS[index % COLORS.length]} />
    ));
  }, [data, hasData]);

  const memoData = useMemo(() => data || [], [data]);

  return (
    <div className="card rounded-2xl shadow-md p-6">
      <h2 className="font-semibold mb-3">{title}</h2>
      {loading || !hasData ? (
        <div className="h-[250px] flex items-center justify-center muted">Cargando...</div>
      ) : (
        <ResponsiveContainer width="100%" height={250} debounce={50}>
          <PieChart>
            <Pie data={memoData} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={80} label>
              {cells}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default React.memo(ReportPieChartInner);
