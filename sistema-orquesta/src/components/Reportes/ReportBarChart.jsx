import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

export default function ReportBarChart({ title, data, dataKey, nameKey }) {
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
