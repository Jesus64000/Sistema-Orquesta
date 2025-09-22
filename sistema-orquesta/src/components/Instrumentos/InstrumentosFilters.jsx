import { Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { getCategorias } from "../../api/administracion/categorias";
import { getEstados } from "../../api/administracion/estados";
import SegmentedDropdown from "../SegmentedDropdown";

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
      <SegmentedDropdown
        label="Estado"
        options={[{ key: "", label: "Todos los estados" }, ...estados.map((e) => ({ key: String(e.id_estado), label: e.nombre }))]}
        selectedKey={String(fEstado)}
        onSelect={(k) => setFEstado(k)}
        align="left"
        matchTriggerWidth
        variant="gray"
      />
      <SegmentedDropdown
        label="Categoría"
        options={[{ key: "", label: "Todas las categorías" }, ...categorias.map((c) => ({ key: String(c.id_categoria), label: c.nombre }))]}
        selectedKey={String(fCategoria)}
        onSelect={(k) => setFCategoria(k)}
        align="left"
        matchTriggerWidth
        variant="gray"
      />
    </div>
  );
}
