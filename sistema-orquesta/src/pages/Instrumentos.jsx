// sistema-orquesta/src/pages/Instrumentos.jsx
import { useEffect, useMemo, useState } from "react";
import {
  PlusCircle, Search, Edit, Trash2, Filter, ChevronUp, ChevronDown, Eye
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getInstrumentos,
  deleteInstrumento,
} from "../api/instrumentos";

import InstrumentoForm from "../components/Instrumentos/InstrumentoForm";
import InstrumentoDetalle from "../components/Instrumentos/InstrumentoDetalle";
import InstrumentosHeader from "../components/Instrumentos/InstrumentosHeader";
import InstrumentosFilters from "../components/Instrumentos/InstrumentosFilters";
import InstrumentosTable from "../components/Instrumentos/InstrumentosTable";
import InfoDialog from "../components/InfoDialog";
import InstrumentosPagination from "../components/Instrumentos/InstrumentosPagination";
import { http } from "../api/http";
import InstrumentosBulkActionsModal from "../components/Instrumentos/InstrumentosBulkActionsModal";
import Modal from "../components/Modal";
import ExportModal from "../components/ExportModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog";
import DataStates from "../components/ui/DataStates";

// === Helpers UI ===
const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border">
    {children}
  </span>
);

export default function Instrumentos() {
  // Data
  const [instrumentos, setInstrumentos] = useState([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });
  const [infoDialog, setInfoDialog] = useState({ open: false, title: '', message: '' });
  const [viewDetail, setViewDetail] = useState(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fCategoria, setFCategoria] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Orden
  const [sortBy, setSortBy] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");

  // Selección múltiple
  const [selected, setSelected] = useState([]);
  // No se usa invitación estilo Gmail; master checkbox actúa sobre todo el conjunto filtrado (paridad con Alumnos)
  const [exportOpen, setExportOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Load data
  // Cargar instrumentos (sin n+1) - actualmente backend no devuelve asignación consolidada.
  // TODO: Crear endpoint /instrumentos?include=asignacion para eliminar second fetch al abrir detalle.
  const [loadError, setLoadError] = useState(false);
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInstrumentos();
      const baseList = res.data || [];
      setInstrumentos(baseList);
      setLoadError(false);
    } catch (e) {
      toast.error("Error cargando instrumentos");
      console.error(e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadData(); }, []);

  // Filtros + orden + paginación
  const instrumentosFiltrados = useMemo(() => {
    let list = [...instrumentos];

    // filtros
    list = list.filter((i) => {
      const byText =
        i.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        i.numero_serie?.toLowerCase().includes(search.toLowerCase());
      // Comparar id_estado (numérico) con fEstado (string o numérico)
      const byEstado = fEstado ? String(i.id_estado) === String(fEstado) : true;
      const byCategoria = fCategoria ? String(i.id_categoria) === String(fCategoria) : true;
      return byText && byEstado && byCategoria;
    });

    // ordenar
    list.sort((a, b) => {
      let vA = a[sortBy];
      let vB = b[sortBy];
      // Si se ordena por categoria, usar categoria_nombre
      if (sortBy === "categoria" || sortBy === "categoria_nombre") {
        vA = a.categoria_nombre || "";
        vB = b.categoria_nombre || "";
      }
      if (typeof vA === "string") vA = vA.toLowerCase();
      if (typeof vB === "string") vB = vB.toLowerCase();
      if (vA < vB) return sortDir === "asc" ? -1 : 1;
      if (vA > vB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [instrumentos, search, fEstado, fCategoria, sortBy, sortDir]);

  const totalPages = Math.ceil(instrumentosFiltrados.length / pageSize);
  const instrumentosPage = instrumentosFiltrados.slice((page - 1) * pageSize, page * pageSize);

  // Cuando cambian filtros o página, recalcular bandera de página completa
  // Sin barra intermedia — nada que hacer aquí.

  // Handlers
  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const toggleSelect = (idOrObj) => {
    // Soporte bulkReplace desde la tabla
    if (typeof idOrObj === 'object' && idOrObj.bulkReplace) {
      setSelected(idOrObj.bulkReplace);
      return;
    }
    const id = idOrObj;
    setSelected((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };
  // Seleccionar/deseleccionar todos los filtrados (paridad con Alumnos)
  const toggleSelectAllFiltered = (checked) => {
    if (checked) {
      const ids = instrumentosFiltrados.map(i => i.id_instrumento);
      setSelected(ids);
    } else {
      setSelected([]);
    }
  };

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (inst) => { setEditing(inst); setShowForm(true); };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteInstrumento(confirm.id);
      toast.success("Instrumento eliminado");
      loadData();
    } catch {
      toast.error("Error eliminando instrumento");
    } finally {
      setConfirm({ open: false, id: null, name: "" });
      setLoading(false);
    }
  };

  const attemptDelete = (i) => {
    if (i.asignado && i.asignado.nombre) {
      setInfoDialog({
        open: true,
        title: 'Instrumento asignado',
        message: `No puedes eliminar "${i.nombre}" porque está asignado a ${i.asignado.nombre}. Desasigna primero para continuar.`,
      });
      return;
    }
    setConfirm({ open: true, id: i.id_instrumento, name: i.nombre });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
  <InstrumentosHeader
        onCreate={openCreate}
        onExport={() => setExportOpen(true)}
        selectedCount={selected.length}
        onBulk={() => setBulkOpen(true)}
      />

      {/* Filtros */}
      <InstrumentosFilters
        search={search}
        setSearch={setSearch}
        fEstado={fEstado}
        setFEstado={setFEstado}
        fCategoria={fCategoria}
        setFCategoria={setFCategoria}
      />

      {/* Sin barra intermedia - selección total directa */}

      {/* Tabla o skeleton */}
      <DataStates
        loading={loading}
        error={loadError}
        hasData={instrumentos.length>0}
        filteredCount={instrumentosFiltrados.length}
        onRetry={loadData}
        onHideError={()=>setLoadError(false)}
        filtersActive={!!(search || fEstado || fCategoria)}
        onClearFilters={()=>{ setSearch(''); setFEstado(''); setFCategoria(''); }}
        entitySingular="instrumento"
        entityPlural="instrumentos"
        entityIcon="🎺"
        emptyCtaLabel="Nuevo instrumento"
        onEmptyCta={openCreate}
        emptyInitialTitle="Aún no hay instrumentos"
        emptyInitialMessage="Registra el primer instrumento para empezar a gestionarlos." />

      {!loading && !loadError && instrumentosFiltrados.length > 0 && (
        <InstrumentosTable
          instrumentosPage={instrumentosPage}
          selected={selected}
          toggleSelect={toggleSelect}
          sortBy={sortBy}
          sortDir={sortDir}
          toggleSort={toggleSort}
          openEdit={openEdit}
          setConfirm={({ open, id, name }) => {
            const inst = instrumentos.find(x => x.id_instrumento === id);
            if (open && inst) {
              attemptDelete(inst);
            } else {
              setConfirm({ open, id, name });
            }
          }}
          openDetail={async (id) => {
            try {
              const res = await http.get(`/instrumentos/${id}`);
              const data = res.data;
              setViewDetail({ ...data, asignado: data.asignado || null });
            } catch (err) {
              console.error(err);
              toast.error("Error cargando detalle del instrumento");
            }
          }}
          toggleSelectAllFiltered={toggleSelectAllFiltered}
          totalFiltered={instrumentosFiltrados.length}
        />
      )}
      {/* Loader amigable */}
      {instrumentosPage.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-500"></span>
              <span>Cargando instrumentos...</span>
            </div>
          ) : (
            "No se encontraron instrumentos"
          )}
        </div>
      )}

      {/* Paginación */}
      <InstrumentosPagination page={page} totalPages={totalPages} setPage={setPage} />

      {/* Exportar (formato) */}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Exportar instrumentos"
        entityName="instrumentos"
        fileBaseName="instrumentos"
        selectedIds={selected}
        exporter={async ({ ids, format }) => {
          const { exportInstrumentos } = await import('../api/instrumentos');
          return exportInstrumentos({ ids, format });
        }}
      />
      <InstrumentosBulkActionsModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        selectedIds={selected}
        reload={loadData}
        optimisticUpdate={({ mode, value }) => {
          setInstrumentos(prev => prev.map(inst => {
            if (!selected.includes(inst.id_instrumento)) return inst;
            if (mode === 'estado') {
              // No tenemos el catálogo acá; mantenemos nombre existente para UX inmediata
              return { ...inst, id_estado: value };
            }
            if (mode === 'categoria') return { ...inst, id_categoria: value };
            return inst;
          }));
        }}
      />

      {/* Formulario */}
      {showForm && (
        <Modal title={editing ? "Editar Instrumento" : "Nuevo Instrumento"} onClose={() => setShowForm(false)}>
          <InstrumentoForm
            data={editing}
            onCancel={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); loadData(); }}
          />
        </Modal>
      )}

      {/* Detalle */}
      {viewDetail && (
        <InstrumentoDetalle
          instrumento={viewDetail}
          onClose={() => { setViewDetail(null); loadData(); }}
        />
      )}

      {/* Confirmar eliminar */}
      <ConfirmDialog
        open={confirm.open}
        title="Eliminar instrumento"
        message={`¿Eliminar a "${confirm.name}"?`}
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={confirmDelete}
      />
      <InfoDialog
        open={infoDialog.open}
        title={infoDialog.title}
        message={infoDialog.message}
        onClose={() => setInfoDialog({ open: false, title: '', message: '' })}
      />
    </div>
  );
}