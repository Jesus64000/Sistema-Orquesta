import { Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { getCategorias } from "../../api/administracion/categorias";
import { getEstados } from "../../api/administracion/estados";

export default function InstrumentosFilters({ search, setSearch, fEstado, setFEstado, fCategoria, setFCategoria }) {
  const [categorias, setCategorias] = useState([]);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await getCategorias();
        setCategorias(Array.isArray(res.data) ? res.data : []);
      } catch {
        setCategorias([]);
      }
    };
    const fetchEstados = async () => {
      try {
        const res = await getEstados();
        setEstados(Array.isArray(res.data) ? res.data : []);
      } catch {
        setEstados([]);
      }
    };
    fetchCategorias();
    fetchEstados();
  }, []);

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
        {estados.map((est) => (
          <option key={est.id_estado} value={est.id_estado}>{est.nombre}</option>
        ))}
      </select>
      <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white">
        <Filter className="h-4 w-4 text-gray-500" />
        <select value={fCategoria} onChange={(e) => setFCategoria(e.target.value)} className="flex-1 outline-none text-sm bg-transparent">
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
