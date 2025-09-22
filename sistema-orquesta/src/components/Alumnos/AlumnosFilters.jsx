import { Search, Filter } from "lucide-react";
import SegmentedDropdown from "../SegmentedDropdown";

export default function AlumnosFilters({ search, setSearch, fEstado, setFEstado, fPrograma, setFPrograma, programas }) {
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
        options={[
          { key: "", label: "Todos" },
          { key: "Activo", label: "Activo" },
          { key: "Inactivo", label: "Inactivo" },
          { key: "Retirado", label: "Retirado" },
        ]}
        selectedKey={String(fEstado)}
        onSelect={(k) => setFEstado(k)}
        align="left"
        matchTriggerWidth
        variant="gray"
      />
      <SegmentedDropdown
        label="Programa"
        options={[{ key: "", label: "Todos" }, ...(programas || []).map((p) => ({ key: String(p.id_programa), label: p.nombre }))]}
        selectedKey={String(fPrograma)}
        onSelect={(k) => setFPrograma(k)}
        align="left"
        matchTriggerWidth
        variant="gray"
      />
    </div>
  );
}
