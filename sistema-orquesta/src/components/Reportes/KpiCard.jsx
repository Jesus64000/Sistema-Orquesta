// eslint-disable-next-line no-unused-vars
export default function KpiCard({ icon: IconComp, value, label, color }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow flex flex-col items-center">
  <IconComp className={`h-6 w-6 ${color}`} />
      <p className="font-bold text-lg">{value}</p>
      <span>{label}</span>
    </div>
  );
}
