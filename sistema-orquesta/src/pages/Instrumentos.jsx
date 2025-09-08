import { useEffect, useMemo, useState } from "react";
import {
  PlusCircle, Search, Edit, Trash2, Filter, ChevronUp, ChevronDown, Eye
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getInstrumentos,
  deleteInstrumento,
} from "../api/instrumentos";

import InstrumentoForm from "../components/InstrumentoForm";
import InstrumentoDetalle from "../components/InstrumentoDetalle";
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Instrumentos</h1>
          <p className="text-sm text-gray-500">Administra los instrumentos disponibles.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            Agregar Instrumento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm"
          />
        </div>
        <select value={fEstado} onChange={(e) => setFEstado(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
          <option value="">Todos los estados</option>
          <option>Disponible</option>
          <option>Asignado</option>
          <option>Mantenimiento</option>
          <option>Baja</option>
        </select>
        <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white">
          <Filter className="h-4 w-4 text-gray-500" />
          <select value={fCategoria} onChange={(e) => setFCategoria(e.target.value)} className="flex-1 outline-none text-sm bg-transparent">
            <option value="">Todas las categorías</option>
            <option>Cuerda</option>
            <option>Viento</option>
            <option>Percusión</option>
            <option>Mobiliario</option>
            <option>Teclado</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {/* Selección múltiple */}
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? instrumentosPage.map((i) => i.id_instrumento) : []
                    )
                  }
                  checked={
                    selected.length === instrumentosPage.length && instrumentosPage.length > 0
                  }
                />
              </th>

              <th className="px-3 py-2 border-b cursor-pointer" onClick={() => toggleSort("nombre")}>
                <div className="flex items-center gap-1">
                  Nombre
                  {sortBy === "nombre" &&
                    (sortDir === "asc" ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </th>
              <th className="px-3 py-2 border-b">Categoría</th>
              <th className="px-3 py-2 border-b">Número de serie</th>
              <th className="px-3 py-2 border-b">Estado</th>
              <th className="px-3 py-2 border-b">Fecha adquisición</th>
              <th className="px-3 py-2 border-b">Ubicación</th>
              <th className="px-3 py-2 border-b">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {instrumentosPage.map((i) => (
              <tr key={i.id_instrumento} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(i.id_instrumento)}
                    onChange={() => toggleSelect(i.id_instrumento)}
                  />
                </td>

                <td className="px-3 py-2">{i.nombre}</td>
                <td className="px-3 py-2">{i.categoria}</td>
                <td className="px-3 py-2">{i.numero_serie}</td>
                <td className="px-3 py-2">
                  <Badge>{i.estado}</Badge>
                </td>
                <td className="px-3 py-2">{i.fecha_adquisicion?.slice(0, 10)}</td>
                <td className="px-3 py-2">{i.ubicacion}</td>

                {/* Acciones */}
                <td className="px-3 py-2 flex gap-2">
                  <button
                    onClick={() => openEdit(i)}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border hover:bg-blue-100"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setConfirm({ open: true, id: i.id_instrumento, name: i.nombre })
                    }
                    className="p-1.5 bg-red-50 text-red-600 rounded-lg border hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`http://localhost:4000/instrumentos/${i.id_instrumento}`);
                        const data = await res.json();
                        setViewDetail(data); // 👈 ahora incluye asignado
                      } catch (err) {
                        console.error(err);
                        toast.error("Error cargando detalle del instrumento");
                      }
                    }}
                    className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg border hover:bg-yellow-100"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {/* Loader amigable */}
            {instrumentosPage.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500">
                  {loading ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-500"></span>
                      <span>Cargando instrumentos...</span>
                    </div>
                  ) : (
                    "No se encontraron instrumentos"
                  )}
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
