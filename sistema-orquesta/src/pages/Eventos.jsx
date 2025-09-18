// sistema-orquesta/src/pages/Eventos.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  PlusCircle, Search, Edit, Trash2, ChevronUp, ChevronDown, Eye
} from "lucide-react";
import toast from "react-hot-toast";

import { getEventos, deleteEvento } from "../api/eventos";
import EventoForm from "../components/Eventos/EventoForm";
import EventoDetalle from "../components/Eventos/EventoDetalle";
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Eventos</h1>
          <p className="text-sm text-gray-500">Administra todos los eventos de la orquesta.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Agregar Evento
          </button>
        </div>
      </div>

      {/* Filtros */}
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

      {/* Tabla */}
      <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  onChange={(e) => setSelected(
                    e.target.checked ? eventosPage.map(ev => ev.id_evento) : []
                  )}
                  checked={selected.length === eventosPage.length && eventosPage.length > 0}
                />
              </th>
              <th className="px-3 py-2 border-b cursor-pointer" onClick={() => toggleSort("titulo")}>
                <div className="flex items-center gap-1">
                  Título
                  {sortBy === "titulo" &&
                    (sortDir === "asc" ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </th>
              <th className="px-3 py-2 border-b">Descripción</th>
              <th className="px-3 py-2 border-b cursor-pointer" onClick={() => toggleSort("fecha_evento")}>
                Fecha
                {sortBy === "fecha_evento" &&
                  (sortDir === "asc" ? (
                    <ChevronUp className="h-3 w-3 inline" />
                  ) : (
                    <ChevronDown className="h-3 w-3 inline" />
                  ))}
              </th>
              <th className="px-3 py-2 border-b">Lugar</th>
              <th className="px-3 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {eventosPage.map(ev => (
              <tr key={ev.id_evento} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(ev.id_evento)}
                    onChange={() => toggleSelect(ev.id_evento)}
                  />
                </td>
                <td className="px-3 py-2">{ev.titulo}</td>
                <td className="px-3 py-2">{ev.descripcion || "-"}</td>
                <td className="px-3 py-2">{ev.fecha_evento?.slice(0, 10)}</td>
                <td className="px-3 py-2">{ev.lugar}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button
                    onClick={() => openEdit(ev)}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border hover:bg-blue-100"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewDetail(ev)}
                    className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg border hover:bg-yellow-100"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setConfirm({ open: true, id: ev.id_evento, name: ev.titulo })}
                    className="p-1.5 bg-red-50 text-red-600 rounded-lg border hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {eventosPage.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  {loading ? "Cargando eventos..." : "No se encontraron eventos"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-end items-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
        <span className="text-sm">Página {page} de {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Siguiente</button>
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
