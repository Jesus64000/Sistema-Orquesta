// sistema-orquesta/src/pages/Eventos.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  PlusCircle, Search, Edit, Trash2, ChevronUp, ChevronDown, Eye
} from "lucide-react";
import toast from "react-hot-toast";

import { getEventos, deleteEvento } from "../api/eventos";
import EventoForm from "../components/Eventos/EventoForm";
import EventoDetalle from "../components/Eventos/EventoDetalle";
import EventosHeader from "../components/Eventos/EventosHeader";
import EventosFilters from "../components/Eventos/EventosFilters";
import EventosTable from "../components/Eventos/EventosTable";
import EventosPagination from "../components/Eventos/EventosPagination";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

// === Helpers UI ===
const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border">
    {children}
  </span>
);

export default function Eventos() {
  // Data
  const [eventos, setEventos] = useState([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewDetail, setViewDetail] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });

  // Filtros
  const [search, setSearch] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Orden
  const [sortBy, setSortBy] = useState("titulo");
  const [sortDir, setSortDir] = useState("asc");

  // Selección múltiple
  const [selected, setSelected] = useState([]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEventos();
      setEventos(res.data || res || []);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando eventos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtros + orden + paginación
  const eventosFiltrados = useMemo(() => {
    let list = [...eventos];

    // filtros
    list = list.filter(ev =>
      ev.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      ev.descripcion?.toLowerCase().includes(search.toLowerCase())
    );

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
  }, [eventos, search, sortBy, sortDir]);

  const totalPages = Math.ceil(eventosFiltrados.length / pageSize);
  const eventosPage = eventosFiltrados.slice((page - 1) * pageSize, page * pageSize);

  // Handlers
  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id) => {
    setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);
  };
  const toggleSelectAll = (checked) => {
    setSelected(checked ? eventosPage.map(ev => ev.id_evento) : []);
  };

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (ev) => { setEditing(ev); setShowForm(true); };

  const confirmDelete = async () => {
    try {
      await deleteEvento(confirm.id);
      toast.success("Evento eliminado");
      loadData();
    } catch {
      toast.error("Error eliminando evento");
    } finally {
      setConfirm({ open: false, id: null, name: "" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <EventosHeader onCreate={openCreate} />

      {/* Filtros */}
      <EventosFilters search={search} setSearch={setSearch} />

      {/* Tabla */}

      <EventosTable
        eventosPage={eventosPage}
        selected={selected}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        sortBy={sortBy}
        sortDir={sortDir}
        toggleSort={toggleSort}
        openEdit={openEdit}
        setViewDetail={setViewDetail}
        setConfirm={setConfirm}
      />
      {eventosPage.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          {loading ? "Cargando eventos..." : "No se encontraron eventos"}
        </div>
      )}

      {/* Paginación */}
      <EventosPagination page={page} totalPages={totalPages} setPage={setPage} />

      {/* Formulario */}
      {showForm && (
        <Modal title={editing ? "Editar Evento" : "Nuevo Evento"} onClose={() => setShowForm(false)}>
          <EventoForm
            data={editing}
            onCancel={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); loadData(); }}
          />
        </Modal>
      )}

      {/* Detalle */}
      {viewDetail && (
        <EventoDetalle evento={viewDetail} onClose={() => setViewDetail(null)} />
      )}

      {/* Confirmar eliminar */}
      <ConfirmDialog
        open={confirm.open}
        title="Eliminar evento"
        message={`¿Eliminar "${confirm.name}"?`}
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
