// sistema-orquesta/src/pages/Eventos.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  PlusCircle, Search, Edit, Trash2, ChevronUp, ChevronDown, Eye
} from "lucide-react";
import toast from "react-hot-toast";

import { getEventos, deleteEvento, exportEventos } from "../api/eventos";
import ExportModal from "../components/ExportModal";
import EventoForm from "../components/Eventos/EventoForm";
import EventoDetalle from "../components/Eventos/EventoDetalle";
import EventoHistorialModal from "../components/Eventos/EventoHistorialModal";
import EventosHeader from "../components/Eventos/EventosHeader";
import EventosFilters from "../components/Eventos/EventosFilters";
import EventosTable from "../components/Eventos/EventosTable";
import EventosPagination from "../components/Eventos/EventosPagination";
import EventosBulkActionsModal from "../components/Eventos/EventosBulkActionsModal";
import EventosCalendar from "../components/Eventos/EventosCalendar";
import NextEventCard from "../components/Eventos/NextEventCard";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import DataStates from "../components/ui/DataStates";

export default function Eventos() {
  // Data
  const [eventos, setEventos] = useState([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewDetail, setViewDetail] = useState(null);
  const [openHistorial, setOpenHistorial] = useState({ open: false, id: null });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });
  const [openExport, setOpenExport] = useState(false);
  const [openBulk, setOpenBulk] = useState(false);
  const [loadError, setLoadError] = useState(false);

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
      setLoadError(false);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando eventos");
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtros + orden + paginación
  const eventosFiltrados = useMemo(() => {
    let list = [...eventos];

    // filtros: texto (título, descripción, lugar)
    list = list.filter(ev => {
      const term = search.toLowerCase();
      const matchesText = (
        ev.titulo?.toLowerCase().includes(term) ||
        ev.descripcion?.toLowerCase().includes(term) ||
        ev.lugar?.toLowerCase().includes(term)
      );
      return matchesText;
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
  // Seleccionar todos los filtrados (no sólo página)
  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelected(eventosFiltrados.map(ev => ev.id_evento));
    } else {
      setSelected([]);
    }
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

  const handleSelectSuggestion = (evento) => {
    setViewDetail(evento);
  };
  const openHistorialModal = (ev) => {
    if (!ev?.id_evento) return;
    setOpenHistorial({ open: true, id: ev.id_evento });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Columna principal gestión */}
      <div className="lg:col-span-8 space-y-6">
        <EventosHeader
          onCreate={openCreate}
          selected={selected}
          onExport={() => setOpenExport(true)}
          onOpenActions={() => setOpenBulk(true)}
        />
        <EventosFilters search={search} setSearch={setSearch} onSelectSuggestion={handleSelectSuggestion} />
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
        <DataStates
          loading={loading}
          error={loadError}
          hasData={eventos.length>0}
          filteredCount={eventosFiltrados.length}
          onRetry={loadData}
          onHideError={()=>setLoadError(false)}
          filtersActive={!!search.trim()}
          onClearFilters={()=>setSearch('')}
          entitySingular="evento"
          entityPlural="eventos"
          entityIcon="🎼"
          emptyCtaLabel="Nuevo evento"
          onEmptyCta={openCreate}
          emptyInitialTitle="Aún no hay eventos"
          emptyInitialMessage="Crea el primer evento para comenzar a planificar." />
        <EventosPagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      {/* Sidebar: Próximo evento + Calendario */}
      <div className="lg:col-span-4 space-y-6">
        <NextEventCard eventos={eventos} loading={loading} />
        <EventosCalendar
          eventos={eventos}
          onCreate={(fecha) => { setEditing({ fecha_evento: fecha }); setShowForm(true); }}
        />
      </div>

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
        <EventoDetalle evento={viewDetail} onClose={() => setViewDetail(null)} onOpenHistorial={openHistorialModal} />
      )}

      {/* Historial */}
      {openHistorial.open && (
        <EventoHistorialModal idEvento={openHistorial.id} open={openHistorial.open} onClose={() => setOpenHistorial({ open: false, id: null })} />
      )}

      {/* Confirmar eliminar */}
      <ConfirmDialog
        open={confirm.open}
        title="Eliminar evento"
        message={`¿Eliminar "${confirm.name}"?`}
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={confirmDelete}
      />

      {/* Export */}
      <ExportModal
        open={openExport}
        onClose={() => setOpenExport(false)}
        title="Exportar eventos"
        entityName="eventos"
        selectedIds={selected}
        fileBaseName="eventos"
        exporter={({ ids, format }) => exportEventos({ ids, format, search })}
      />

      {/* Bulk actions */}
      <EventosBulkActionsModal
        open={openBulk}
        onClose={() => setOpenBulk(false)}
        selectedIds={selected}
        reload={loadData}
      />
    </div>
  );
}
