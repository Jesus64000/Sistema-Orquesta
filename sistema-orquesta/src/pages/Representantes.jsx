import { useEffect, useState, useMemo, useCallback, useDeferredValue, useRef } from 'react';
import { getRepresentantes, deleteRepresentante, getRepresentante, exportRepresentantes } from '../api/representantes';
import Modal from '../components/Modal';
import ExportModal from '../components/ExportModal';
import RepresentanteForm from '../components/Representantes/RepresentanteForm';
import RepresentantesHeader from '../components/Representantes/RepresentantesHeader';
import RepresentantesFilters from '../components/Representantes/RepresentantesFilters';
import RepresentantesTable from '../components/Representantes/RepresentantesTable';
import RepresentanteDetalle from '../components/Representantes/RepresentanteDetalle';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import DataStates from '../components/ui/DataStates';

export default function Representantes() {
  const [representantes, setRepresentantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false); // nuevo control error
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [selected, setSelected] = useState([]);
  // Orden & paginación
  const [sortBy, setSortBy] = useState('nombre'); // base (nombre) pero la tabla mostrará nombre+apellido
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

  // aria-live resultados
  const resultsLiveRef = useRef(null);
  // El live region se actualiza en efecto dependiente de filteredCount más abajo

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const res = await getRepresentantes();
      const data = res?.data || res; // soporte por si API retorna directamente array
      setRepresentantes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLoadError(true);
    } finally { setLoading(false); }
  }, []);

  useEffect(()=>{ load(); },[load]);

  const filtered = useMemo(()=> {
    if (!deferredQuery.trim()) return representantes;
    const q = deferredQuery.toLowerCase();
    return representantes.filter(r => [r.nombre, r.apellido, r.ci, r.telefono, r.telefono_movil, r.email, r.parentesco_nombre]
      .some(v => (v||'').toLowerCase().includes(q)));
  }, [representantes, deferredQuery]);

  // Orden
  const sorted = useMemo(()=>{
    const list = [...filtered];
    list.sort((a,b)=>{
      let vA = a[sortBy];
      let vB = b[sortBy];
      if (typeof vA === 'string') vA = vA.toLowerCase();
      if (typeof vB === 'string') vB = vB.toLowerCase();
      if (vA < vB) return sortDir==='asc' ? -1 : 1;
      if (vA > vB) return sortDir==='asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortBy, sortDir]);

  // Paginación
  const filteredCount = sorted.length;
  const totalPages = Math.ceil(filteredCount / pageSize) || 1;
  const pageData = useMemo(()=> sorted.slice((page-1)*pageSize, page*pageSize), [sorted, page]);

  useEffect(()=>{ if(page>totalPages) setPage(1); }, [totalPages, page]);
  useEffect(()=>{ if(resultsLiveRef.current){ resultsLiveRef.current.textContent = `${filteredCount} resultado${filteredCount===1?'':'s'}`; }}, [filteredCount]);

  const toggleSelectAll = () => {
    if (selected.length === filteredCount) setSelected([]);
    else setSelected(sorted.map(r => r.id_representante));
  };
  const toggleOne = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const openCreate = () => { setEditing(null); setModalFormOpen(true); };
  const openEdit = (rep) => { setEditing(rep); setModalFormOpen(true); };
  const openView = async (rep) => {
    try {
      const res = await getRepresentante(rep.id_representante);
      setDetalle(res?.data || res);
      setModalDetalleOpen(true);
    } catch { toast.error('No se pudo cargar detalle'); }
  };
  const requestDelete = (rep) => { setPendingDelete(rep); setConfirmOpen(true); };

  const doDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteRepresentante(pendingDelete.id_representante);
      toast.success('Eliminado');
      setConfirmOpen(false);
      setPendingDelete(null);
      load();
    } catch { toast.error('No se pudo eliminar'); }
  };

  const toggleSort = (col)=>{
    if (sortBy === col) setSortDir(sortDir==='asc'?'desc':'asc'); else { setSortBy(col); setSortDir('asc'); }
  };

  return (
    <div className="space-y-6">
      <div aria-live="polite" aria-atomic="true" ref={resultsLiveRef} className="sr-only" />
  <RepresentantesHeader onCreate={openCreate} selected={selected} onExport={()=>setExportOpen(true)} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <RepresentantesFilters value={query} onChange={setQuery} />
        <div className="text-xs text-gray-500">{filteredCount} resultado(s){selected.length>0 && ` · ${selected.length} seleccionados`}</div>
      </div>

      <DataStates
        loading={loading}
        error={loadError}
        hasData={representantes.length>0}
        filteredCount={filtered.length}
        onRetry={load}
        onHideError={()=>setLoadError(false)}
        onClearFilters={()=>setQuery('')}
        filtersActive={!!query.trim()}
        entitySingular="representante"
        entityPlural="representantes"
        entityIcon="👥"
        emptyCtaLabel="Nuevo representante"
        onEmptyCta={openCreate}
        emptyInitialTitle="Aún no hay representantes"
        emptyInitialMessage="Crea el primero para asociarlo a alumnos menores de edad."
        skeletonCols={4}
      />

      {!loading && !loadError && filteredCount > 0 && (
        <RepresentantesTable
          data={pageData}
          loading={false}
          onEdit={openEdit}
          onDelete={requestDelete}
          onView={openView}
          selectedIds={selected}
          onToggleSelectAll={toggleSelectAll}
          onToggleOne={toggleOne}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={toggleSort}
          totalFiltered={filteredCount}
        />
      )}

      {/* Paginación */}
      {!loading && !loadError && filteredCount > 0 && (
        <div className="flex justify-end items-center gap-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
          <span className="text-sm">Página {page} de {totalPages}</span>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 border rounded disabled:opacity-50">Siguiente</button>
        </div>
      )}

      {/* Modales */}
      <Modal open={modalFormOpen} onClose={()=>setModalFormOpen(false)} title={editing? 'Editar representante' : 'Nuevo representante'}>
        <RepresentanteForm data={editing} onSaved={()=>{ setModalFormOpen(false); load(); }} onCancel={()=>setModalFormOpen(false)} />
      </Modal>
      <Modal open={modalDetalleOpen} onClose={()=>setModalDetalleOpen(false)} title={detalle?.nombre || 'Detalle representante'}>
        <RepresentanteDetalle rep={detalle} />
      </Modal>
      <ExportModal
        open={exportOpen}
        onClose={()=>setExportOpen(false)}
        title="Exportar representantes"
        entityName="representantes"
        selectedIds={selected}
        fileBaseName="representantes"
        exporter={({ ids, format }) => exportRepresentantes({ ids, format, search: query })}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar eliminación"
        message={pendingDelete ? `¿Seguro que deseas eliminar a ${pendingDelete.nombre}?` : ''}
        confirmLabel="Eliminar"
        confirmColor="bg-red-600 hover:bg-red-700"
        onCancel={()=>{ setConfirmOpen(false); setPendingDelete(null); }}
        onConfirm={doDelete}
      />
    </div>
  );
}
