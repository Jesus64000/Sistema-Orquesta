import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RepresentantesFilters({ value, onChange }) {
  const [q, setQ] = useState(value || '');
  useEffect(()=>{ setQ(value||''); }, [value]);
  return (
  <div className="card-90 backdrop-blur-sm p-4 rounded-2xl border shadow-sm flex flex-col gap-4 relative" role="search" aria-label="Filtros de representantes">
      <div className="flex flex-col md:flex-row gap-4 flex-wrap items-stretch md:items-center">
        <div className="group flex items-center gap-2 px-3 h-10 rounded-full border card shadow-sm focus-within:ring-2 focus-within:ring-yellow-300 transition w-full md:w-80" role="search">
          <Search className="h-4 w-4 text-muted group-focus-within:text-app" />
          <input
            type="text"
            placeholder="Buscar nombre, teléfono o email..."
            value={q}
            onChange={(e)=>{ setQ(e.target.value); onChange?.(e.target.value); }}
            className="flex-1 bg-transparent outline-none text-sm placeholder:muted"
            aria-label="Buscar representantes"
          />
        </div>
      </div>
    </div>
  );
}
