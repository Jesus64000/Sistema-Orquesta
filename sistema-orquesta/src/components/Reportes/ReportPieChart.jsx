import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#facc15", "#4ade80", "#60a5fa", "#f87171", "#a78bfa", "#f472b6"];

export default function ReportPieChart({ title, data, dataKey, nameKey }) {
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
