export default function ReportesViewSelector({ viewGlobal, setViewGlobal }) {
  return (
    <div className="flex gap-2 mb-4 mt-2">
      <button
        onClick={() => setViewGlobal("tabla")}
        className={`px-3 py-1 rounded text-sm ${viewGlobal === "tabla" ? "bg-yellow-400 text-gray-900" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
      >
        Tabla
      </button>
      <button
        onClick={() => setViewGlobal("grafico")}
        className={`px-3 py-1 rounded text-sm ${viewGlobal === "grafico" ? "bg-yellow-400 text-gray-900" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
      >
        Gráfico
      </button>
    </div>
  );
}
