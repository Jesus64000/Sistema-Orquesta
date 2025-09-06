import { useEffect, useMemo, useState } from "react";
import {
  UserPlus, Search, Edit, Trash2, Filter, ChevronUp, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getAlumnos,
  deleteAlumno,
  getProgramas,
  exportAlumnosCSV,
} from "../api/alumnos";

import AlumnoForm from "../components/AlumnoForm";
import AlumnoHistorial from "../components/AlumnoHistorial";
import AlumnoInstrumento from "../components/AlumnoInstrumento";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

// === Helpers UI ===
const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border">
    {children}
  </span>
);

export default function Alumnos() {
  // Data
  const [alumnos, setAlumnos] = useState([]);
  const [programas, setProgramas] = useState([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });
  const [viewDetail, setViewDetail] = useState(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fPrograma, setFPrograma] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const pageSize = 5;

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
      const [resP, resA] = await Promise.all([getProgramas(), getAlumnos()]);
      setProgramas(resP.data || []);
      setAlumnos(resA.data || []);
    } catch (e) {
      toast.error("Error cargando alumnos");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadData(); }, []);

  // Filtros + orden + paginación
  const alumnosFiltrados = useMemo(() => {
    let list = [...alumnos];

    // filtros
    list = list.filter((a) => {
      const byText =
        a.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        a.telefono_contacto?.toLowerCase().includes(search.toLowerCase());
      const byEstado = fEstado ? a.estado === fEstado : true;
      const byPrograma = fPrograma
        ? (a.programas || []).some((p) => String(p.id_programa) === String(fPrograma))
        : true;
      return byText && byEstado && byPrograma;
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
  }, [alumnos, search, fEstado, fPrograma, sortBy, sortDir]);

  const totalPages = Math.ceil(alumnosFiltrados.length / pageSize);
  const alumnosPage = alumnosFiltrados.slice((page - 1) * pageSize, page * pageSize);

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
  const openEdit = (al) => { setEditing(al); setShowForm(true); };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteAlumno(confirm.id);
      toast.success("Alumno eliminado");
      loadData();
    } catch {
      toast.error("Error eliminando alumno");
    } finally {
      setConfirm({ open: false, id: null, name: "" });
      setLoading(false);
    }
  };

  const bulkExport = async () => {
    try {
      const res = await exportAlumnosCSV({ ids: selected });
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alumnos_export_${Date.now()}.csv`;
      a.click();
    } catch {
      toast.error("Error exportando alumnos");
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Alumnos</h1>
          <p className="text-sm text-gray-500">Administra alumnos y sus programas.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <>
              <button onClick={bulkExport} className="px-3 py-2 rounded-lg bg-green-500 text-white">
                Exportar seleccionados
              </button>
            </>
          )}
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm">
            <UserPlus className="h-4 w-4" />
            Agregar Alumno
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
          <option value="">Todos</option>
          <option>Activo</option>
          <option>Inactivo</option>
          <option>Retirado</option>
        </select>
        <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white">
          <Filter className="h-4 w-4 text-gray-500" />
          <select value={fPrograma} onChange={(e) => setFPrograma(e.target.value)} className="flex-1 outline-none text-sm bg-transparent">
            <option value="">Todos</option>
            {programas.map((p) => (
              <option key={p.id_programa} value={p.id_programa}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-3 py-2"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? alumnosPage.map((a) => a.id_alumno) : [])} checked={selected.length === alumnosPage.length && alumnosPage.length > 0} /></th>
              {["nombre", "fecha_nacimiento", "genero", "telefono_contacto", "estado"].map((col) => (
                <th key={col} className="px-3 py-2 border-b cursor-pointer" onClick={() => toggleSort(col)}>
                  <div className="flex items-center gap-1 capitalize">
                    {col.replace("_", " ")}
                    {sortBy === col && (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
              ))}
              <th className="px-3 py-2 border-b">Programas</th>
              <th className="px-3 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnosPage.map((a) => (
              <tr key={a.id_alumno} className="hover:bg-gray-50">
                <td className="px-3 py-2"><input type="checkbox" checked={selected.includes(a.id_alumno)} onChange={() => toggleSelect(a.id_alumno)} /></td>
                <td className="px-3 py-2">{a.nombre}</td>
                <td className="px-3 py-2">{a.fecha_nacimiento?.slice(0, 10)}</td>
                <td className="px-3 py-2">{a.genero}</td>
                <td className="px-3 py-2">{a.telefono_contacto}</td>
                <td className="px-3 py-2">{a.estado}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {(a.programas || []).map((p) => <Badge key={p.id_programa}>{p.nombre}</Badge>)}
                  </div>
                </td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={() => openEdit(a)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border hover:bg-blue-100"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => setConfirm({ open: true, id: a.id_alumno, name: a.nombre })} className="p-1.5 bg-red-50 text-red-600 rounded-lg border hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                  <button onClick={() => setViewDetail(a)} className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg border hover:bg-yellow-100">Ver</button>
                </td>
              </tr>
            ))}
            {alumnosPage.length === 0 && (
              <tr><td colSpan="8" className="text-center py-6 text-gray-500">{loading ? "Cargando..." : "No se encontraron alumnos"}</td></tr>
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
        <Modal title={editing ? "Editar Alumno" : "Nuevo Alumno"} onClose={() => setShowForm(false)}>
          <AlumnoForm
            data={editing}
            programas={programas}
            onCancel={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); loadData(); }}
          />
        </Modal>
      )}

      {/* Detalle */}
      {viewDetail && (
        <Modal title={`Detalle de ${viewDetail.nombre}`} onClose={() => setViewDetail(null)}>
          <div className="space-y-4">
            <AlumnoInstrumento idAlumno={viewDetail.id_alumno} />
            <AlumnoHistorial idAlumno={viewDetail.id_alumno} />
          </div>
        </Modal>
      )}

      {/* Confirmar eliminar */}
      <ConfirmDialog
        open={confirm.open}
        title="Eliminar alumno"
        message={`¿Eliminar a "${confirm.name}"?`}
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
