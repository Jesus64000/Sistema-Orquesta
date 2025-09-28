import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RepresentantesFilters({ value, onChange }) {
  const [q, setQ] = useState(value || '');
  useEffect(()=>{ setQ(value||''); }, [value]);
  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4 relative" role="search" aria-label="Filtros de representantes">
      <div className="flex flex-col md:flex-row gap-4 flex-wrap items-stretch md:items-center">
        <div className="group flex items-center gap-2 px-3 h-10 rounded-full border border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm focus-within:ring-2 focus-within:ring-yellow-300 focus-within:border-yellow-300 transition w-full md:w-80" role="search">
          <Search className="h-4 w-4 text-gray-500 group-focus-within:text-gray-700" />
          <input
            type="text"
            placeholder="Buscar nombre, teléfono o email..."
            value={q}
            onChange={(e)=>{ setQ(e.target.value); onChange?.(e.target.value); }}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
            aria-label="Buscar representantes"
          />
        </div>
      </div>
    </div>
  );
}
