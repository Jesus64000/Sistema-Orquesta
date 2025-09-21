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

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInstrumentos();
      setInstrumentos(res.data || []);
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
      const byEstado = fEstado ? i.estado === fEstado : true;
      const byCategoria = fCategoria ? i.categoria === fCategoria : true;
      return byText && byEstado && byCategoria;
    });

    // ordenar
    list.sort((a, b) => {
      let vA = a[sortBy];
      let vB = b[sortBy];
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

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <InstrumentosHeader onCreate={openCreate} />

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
        sortBy={sortBy}
        sortDir={sortDir}
        toggleSort={toggleSort}
        openEdit={openEdit}
        setConfirm={setConfirm}
        openDetail={async (id) => {
          try {
            const res = await fetch(`http://localhost:4000/instrumentos/${id}`);
            const data = await res.json();
            setViewDetail(data);
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
        <InstrumentoDetalle instrumento={viewDetail} onClose={() => setViewDetail(null)} />
      )}

      {/* Confirmar eliminar */}
      <ConfirmDialog
        open={confirm.open}
        title="Eliminar instrumento"
        message={`¿Eliminar a "${confirm.name}"?`}
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}