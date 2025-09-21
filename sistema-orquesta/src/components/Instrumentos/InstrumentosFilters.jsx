import { Search, Filter } from "lucide-react";

export default function InstrumentosFilters({ search, setSearch, fEstado, setFEstado, fCategoria, setFCategoria }) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-3">
      <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none text-sm"
        />
      </div>
      <select value={fEstado} onChange={(e) => setFEstado(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
        <option value="">Todos los estados</option>
        <option>Disponible</option>
        <option>Asignado</option>
        <option>Mantenimiento</option>
        <option>Baja</option>
      </select>
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white">
        <Filter className="h-4 w-4 text-gray-500" />
        <select value={fCategoria} onChange={(e) => setFCategoria(e.target.value)} className="flex-1 outline-none text-sm bg-transparent">
          <option value="">Todas las categorías</option>
          <option>Cuerda</option>
          <option>Viento</option>
          <option>Percusión</option>
          <option>Mobiliario</option>
          <option>Teclado</option>
        </select>
      </div>
    </div>
  );
}
