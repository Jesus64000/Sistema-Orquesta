import { Search } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { getCategorias } from '../../api/administracion/categorias';
import { getEstados } from '../../api/administracion/estados';
import TagSelect from '../TagSelect';

// Barra de filtros de Instrumentos alineada visualmente con la de Alumnos
export default function InstrumentosFilters({
  search,
  setSearch,
  fEstado,
  setFEstado,
  fCategoria,
  setFCategoria,
}) {
  const [categorias, setCategorias] = useState([]);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [cRes, eRes] = await Promise.all([getCategorias(), getEstados()]);
        setCategorias(Array.isArray(cRes.data) ? cRes.data : []);
        setEstados(Array.isArray(eRes.data) ? eRes.data : []);
      } catch {
        setCategorias([]);
        setEstados([]);
      }
    })();
  }, []);

  // Opciones TagSelect (incluye "Todos" con value vacía)
  const estadoOptions = useMemo(
    () => [
      { label: 'Todos', value: '' },
      ...estados.map((e) => ({ label: e.nombre, value: String(e.id_estado) })),
    ],
    [estados]
  );

  const categoriaOptions = useMemo(
    () => [
      { label: 'Todos', value: '' },
      ...categorias.map((c) => ({ label: c.nombre, value: String(c.id_categoria) })),
    ],
    [categorias]
  );

  // Determinar si hay filtros activos (además de texto)
  const hasAnyFilter = Boolean(search || fEstado || fCategoria);

  const clearAll = () => {
    setSearch('');
    setFEstado('');
    setFCategoria('');
  };

  return (
    <div
  className="card-90 backdrop-blur-sm p-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between relative z-20"
      role="region"
      aria-label="Filtros de instrumentos"
      aria-describedby="instrumentos-filtros-descripcion"
    >
      {/* Grupo principal: búsqueda + selects */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 items-stretch md:items-center flex-wrap">
        {/* Input búsqueda */}
        <div
          className="group flex items-center gap-2 px-3 h-10 rounded-full border bg-transparent shadow-sm focus-within:ring-2 focus-within:ring-yellow-300 transition"
          role="search"
        >
          <Search className="h-4 w-4 muted group-focus-within:text-app" />
          <input
            type="text"
            placeholder="Buscar nombre o serie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:muted focus-visible:outline-none"
            aria-label="Buscar instrumentos por nombre o serie"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-[10px] font-medium muted hover:text-app focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded-full px-2 py-0.5"
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        {/* Estado */}
        <TagSelect
          options={estadoOptions}
          value={fEstado}
          onChange={setFEstado}
          size="mdCompact"
          accent="yellow"
          placeholder="Estado"
          menuWidth={180}
          className="focus-visible:outline-none"
          ariaLabel="Filtrar por estado"
        />

        {/* Categoría */}
        <TagSelect
          options={categoriaOptions}
          value={fCategoria}
          onChange={setFCategoria}
          size="mdCompact"
          accent="grayStrong"
          placeholder="Categoría"
          menuWidth={200}
          className="focus-visible:outline-none"
          ariaLabel="Filtrar por categoría"
        />

        {hasAnyFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-[11px] font-medium muted hover:text-app underline decoration-dotted focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded"
            aria-label="Limpiar todos los filtros"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Descripción accesible */}
      <div
        className="flex items-center gap-3 text-xs muted"
        id="instrumentos-filtros-descripcion"
        aria-live="polite"
      >
        <span className="sr-only">Usa los filtros para refinar la lista de instrumentos.</span>
      </div>
    </div>
  );
}
