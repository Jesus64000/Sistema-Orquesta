// sistema-orquesta/src/pages/Instrumentos.jsx
import { useEffect, useMemo, useState } from "react";
import {
  PlusCircle, Search, Edit, Trash2, Filter, ChevronUp, ChevronDown, Eye
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getInstrumentos,
  deleteInstrumento,
  estadoMasivoInstrumentos,
  eliminarMasivoInstrumentos,
} from "../api/instrumentos";

import InstrumentoForm from "../components/Instrumentos/InstrumentoForm";
import InstrumentoDetalle from "../components/Instrumentos/InstrumentoDetalle";
import InstrumentosHeader from "../components/Instrumentos/InstrumentosHeader";
import InstrumentosFilters from "../components/Instrumentos/InstrumentosFilters";
import InstrumentosTable from "../components/Instrumentos/InstrumentosTable";
import InstrumentosPagination from "../components/Instrumentos/InstrumentosPagination";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

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
  const toggleSelectAllPage = () => {
    const idsPage = instrumentosPage.map(i => i.id_instrumento);
    const allSelected = idsPage.every(id => selected.includes(id));
    if (allSelected) setSelected(prev => prev.filter(id => !idsPage.includes(id)));
    else setSelected(prev => Array.from(new Set([...prev, ...idsPage])));
  };

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Load data
  // Cargar instrumentos y su asignación
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInstrumentos();
      const baseList = res.data || [];
      // Para cada instrumento, obtener asignado (si está asignado)
      const withAsignado = await Promise.all(
        baseList.map(async (inst) => {
          try {
            const detailRes = await fetch(`http://localhost:4000/instrumentos/${inst.id_instrumento}`);
            const detail = await detailRes.json();
            return { ...inst, asignado: detail.asignado || null };
          } catch {
            return { ...inst, asignado: null };
          }
        })
      );
      setInstrumentos(withAsignado);
    } catch (e) {
      toast.error("Error cargando instrumentos");
      console.error(e);
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

  // Handlers
  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
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

  // Export masivo
  const bulkExport = async (format = 'csv') => {
    if (!selected.length) return toast.error('Selecciona al menos un instrumento');
    try {
      const res = await fetch('http://localhost:4000/instrumentos/export-masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected, format })
      });
      if (!res.ok) throw new Error('Error exportando');
      const blob = await res.blob();
      const ext = format === 'pdf' ? 'pdf' : (format === 'xlsx' ? 'xlsx' : 'csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instrumentos_export_${Date.now()}.${ext}`;
      a.click();
    } catch (e) {
      console.error(e);
      toast.error('Error exportando instrumentos');
    }
  };

  // Modal Acciones masivas
  const [massActionOpen, setMassActionOpen] = useState(false);
  const [massActionType, setMassActionType] = useState(null); // 'estado' | 'eliminar'
  const [massEstadoNombre, setMassEstadoNombre] = useState('Disponible');

  const handleMassActions = (type) => { setMassActionType(type); setMassActionOpen(true); };

  const runMassAction = async () => {
    try {
      if (massActionType === 'estado') {
        await estadoMasivoInstrumentos({ ids: selected, estado_nombre: massEstadoNombre });
        toast.success('Estado actualizado');
        await loadData();
      } else if (massActionType === 'eliminar') {
        await eliminarMasivoInstrumentos({ ids: selected });
        toast.success('Instrumentos eliminados');
        await loadData();
      }
      setMassActionOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Acción masiva falló');
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <InstrumentosHeader
        onCreate={openCreate}
        selected={selected}
        onExportFormat={(fmt) => bulkExport(fmt)}
        onMassActions={handleMassActions}
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

      {/* Tabla */}
      <InstrumentosTable
        instrumentosPage={instrumentosPage}
        selected={selected}
        toggleSelect={toggleSelect}
        onToggleAllPage={toggleSelectAllPage}
        sortBy={sortBy}
        sortDir={sortDir}
        toggleSort={toggleSort}
        openEdit={openEdit}
        setConfirm={setConfirm}
        openDetail={async (id) => {
          try {
            const res = await fetch(`http://localhost:4000/instrumentos/${id}`);
            const data = await res.json();
            setViewDetail({ ...data, asignado: data.asignado || null });
          } catch (err) {
            console.error(err);
            toast.error("Error cargando detalle del instrumento");
          }
        }}
      />
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

      {/* Modal Acciones Masivas */}
      {massActionOpen && (
        <Modal title="Acciones masivas" onClose={() => setMassActionOpen(false)}>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Seleccionados: {selected.length}</div>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1.5 rounded border ${massActionType === 'estado' ? 'bg-gray-200' : 'bg-white'}`}
                onClick={() => setMassActionType('estado')}
              >Estado</button>
              <button
                className={`px-3 py-1.5 rounded border ${massActionType === 'eliminar' ? 'bg-gray-200' : 'bg-white'}`}
                onClick={() => setMassActionType('eliminar')}
              >Eliminar</button>
            </div>

            {massActionType === 'estado' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Nuevo estado</label>
                <div className="flex gap-2">
                  {['Disponible','Asignado','Mantenimiento','Baja'].map((e) => (
                    <button key={e} className={`px-3 py-1.5 rounded-full border text-xs ${massEstadoNombre === e ? 'bg-yellow-400 border-yellow-500 text-gray-900' : 'bg-white'}`} onClick={() => setMassEstadoNombre(e)}>{e}</button>
                  ))}
                </div>
              </div>
            )}

            {massActionType === 'eliminar' && (
              <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">
                Esta acción eliminará permanentemente los instrumentos seleccionados.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button className="px-3 py-2 rounded border" onClick={() => setMassActionOpen(false)}>Cancelar</button>
              <button className="px-3 py-2 rounded bg-yellow-400 text-gray-900" onClick={runMassAction}>Aplicar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}