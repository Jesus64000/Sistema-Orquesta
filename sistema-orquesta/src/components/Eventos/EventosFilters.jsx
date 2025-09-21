import { Search } from "lucide-react";

export default function EventosFilters({ search, setSearch }) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-3">
      <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por título o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none text-sm"
        />
      </div>
    </div>
  );
}
