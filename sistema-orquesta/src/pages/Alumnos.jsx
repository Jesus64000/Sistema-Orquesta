// sistema-orquesta/src/pages/Alumnos.jsx
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
  getAlumno,
  getAlumnoInstrumento,
} from "../api/alumnos";

import AlumnoForm from "../components/Alumno/AlumnoForm";
import AlumnoHistorial from "../components//Alumno/AlumnoHistorial";
import AlumnoInstrumento from "../components//Alumno/AlumnoInstrumento";
import Modal from "../components/Modal";
import AlumnoDetalle from "../components/Alumno/AlumnoDetalle";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorDialog from "../components/InfoDialog";


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
  const [fEstado, setFEstado] = useState("Activo");
  const [fPrograma, setFPrograma] = useState("");

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

  // Diálogos
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});
  const [errorConfig, setErrorConfig] = useState({});
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [checkingId, setCheckingId] = useState(null); // id del alumno mientras verifico instrumentos

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

  // Verifica instrumentos y abre confirmación / muestra ErrorDialog o ConfirmDialog
  const handleEstadoClick = async (alumno) => {
    // evito doble clics mientras se verifica
    if (checkingId) return;

    // Si voy a ACTIVAR, no necesito comprobar instrumentos => abrir confirm
    if (alumno.estado !== "Activo") {
      setSelectedAlumno(alumno);
      setDialogConfig({
        title: "Confirmar activación",
        message: `¿Seguro que deseas activar al alumno ${alumno.nombre}?`,
        confirmLabel: "Activar",
        confirmColor: "bg-green-600 hover:bg-green-700",
      });
      setConfirmOpen(true);
      return;
    }

    // Si está Activo => comprobar si tiene instrumentos asignados antes de desactivar
    try {
      setCheckingId(alumno.id_alumno);

      const res = await getAlumnoInstrumento(alumno.id_alumno);
      const data = res?.data;

      // Determinar si hay instrumentos (aceptamos array u objeto)
      const tieneInstrumento = Array.isArray(data) ? data.length > 0 : !!data;

      if (tieneInstrumento) {
        const lista = Array.isArray(data) ? data : [data];
        const detalle = lista
          .map((it) => {
            const nombre = it?.nombre || it?.instrumento || it?.tipo || "Instrumento";
            const serial = it?.numero_serie || it?.serial || it?.codigo || "";
            return serial ? `${nombre} (${serial})` : nombre;
          })
          .join(", ");

        setErrorConfig({
          title: "Acción no permitida",
          message:
            `No se puede desactivar porque tiene asignado: ${detalle}. ` +
            `Debe devolverlo antes de desactivar.`,
        });
        setErrorOpen(true);
        return;
      }

      // No tiene instrumentos -> abrir confirmación para desactivar
      setSelectedAlumno(alumno);
      setDialogConfig({
        title: "Confirmar desactivación",
        message: `¿Seguro que deseas desactivar al alumno ${alumno.nombre}?`,
        confirmLabel: "Desactivar",
        confirmColor: "bg-red-600 hover:bg-red-700",
      });
      setConfirmOpen(true);
    } catch (err) {
      console.error("Error verificando instrumentos:", err);
      setErrorConfig({
        title: "Error",
        message: "No se pudo verificar si el alumno tiene instrumentos asignados. Intenta de nuevo.",
      });
      setErrorOpen(true);
    } finally {
      setCheckingId(null);
    }
  };


  // eslint-disable-next-line no-unused-vars
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

  const openDetail = async (alumno) => {
  try {
    setLoading(true);
    const res = await getAlumno(alumno.id_alumno);
    setViewDetail(res.data); // 👈 ahora trae edad + representante desde el back
  } catch (err) {
    toast.error("Error cargando detalle del alumno");
    console.error(err);
  } finally {
    setLoading(false);
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
          <option>Activo</option>
          <option>Inactivo</option>
          <option>Retirado</option>
          <option value="">Todos</option>
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
              {/* Selección múltiple */}
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? alumnosPage.map((a) => a.id_alumno) : []
                    )
                  }
                  checked={
                    selected.length === alumnosPage.length && alumnosPage.length > 0
                  }
                />
              </th>

              {/* Columnas */}
              <th
                className="px-3 py-2 border-b cursor-pointer"
                onClick={() => toggleSort("nombre")}
              >
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

              <th className="px-3 py-2 border-b">Edad</th>
              <th className="px-3 py-2 border-b">Fecha nacimiento</th>
              <th className="px-3 py-2 border-b">Género</th>
              <th className="px-3 py-2 border-b">Teléfono</th>
              <th className="px-3 py-2 border-b">Representante</th>
              <th className="px-3 py-2 border-b">Estado</th>
              <th className="px-3 py-2 border-b">Programas</th>
              <th className="px-3 py-2 border-b">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {alumnosPage.map((a) => (
              <tr key={a.id_alumno} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(a.id_alumno)}
                    onChange={() => toggleSelect(a.id_alumno)}
                  />
                </td>

                <td className="px-3 py-2">{a.nombre}</td>
                <td className="px-3 py-2">{a.edad} años</td>
                <td className="px-3 py-2">{a.fecha_nacimiento?.slice(0, 10)}</td>
                <td className="px-3 py-2">{a.genero}</td>
                <td className="px-3 py-2">{a.telefono_contacto}</td>

                {/* Representante */}
                <td className="px-3 py-2">
                  {a.representante_nombre ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{a.representante_nombre}</span>
                      <span className="text-xs text-gray-500">
                        {a.representante_telefono}
                      </span>
                      <span className="text-xs text-gray-400">
                        {a.representante_email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Sin representante</span>
                  )}
                </td>

                <td className="px-3 py-2">{a.estado}</td>

                {/* Programas */}
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {(a.programas || []).map((p) => (
                      <Badge key={p.id_programa}>{p.nombre}</Badge>
                    ))}
                    {(!a.programas || a.programas.length === 0) && (
                      <span className="text-xs text-gray-400">Sin programas</span>
                    )}
                  </div>
                </td>

                {/* Acciones */}
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      onClick={() => openEdit(a)}
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border hover:bg-blue-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    {/* Activar / Desactivar con verificación de instrumentos */}
                    <button
                      onClick={() => handleEstadoClick(a)}
                      disabled={checkingId === a.id_alumno}
                      className={`p-1.5 rounded-lg border ${
                        a.estado === "Activo"
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      } ${checkingId === a.id_alumno ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {checkingId === a.id_alumno ? "..." : (a.estado === "Activo" ? "Desactivar" : "Activar")}
                    </button>

                    <button
                      onClick={() => openDetail(a)}
                      className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg border hover:bg-yellow-100"
                    >
                      Ver
                    </button>
                  </td>

              </tr>
            ))}

            {/* Loader amigable */}
            {alumnosPage.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center py-10 text-gray-500">
                  {loading ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-500"></span>
                      <span>Cargando alumnos...</span>
                    </div>
                  ) : (
                    "No se encontraron alumnos"
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
        <AlumnoDetalle alumno={viewDetail} onClose={() => setViewDetail(null)} />
      )}

      {/* Confirmación Activar/Desactivar */}
      <ConfirmDialog
        open={confirmOpen}
        {...dialogConfig}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedAlumno(null);
        }}
        onConfirm={async () => {
          try {
            const nuevoEstado = selectedAlumno.estado === "Activo" ? "Inactivo" : "Activo";

            const res = await fetch(
              `http://localhost:4000/alumnos/${selectedAlumno.id_alumno}/estado`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: nuevoEstado }),
              }
            );

            if (!res.ok) throw new Error("Error actualizando estado");

            setAlumnos((prev) =>
              prev.map((al) =>
                al.id_alumno === selectedAlumno.id_alumno
                  ? { ...al, estado: nuevoEstado }
                  : al
              )
            );

            toast.success(
              `Alumno ${selectedAlumno.nombre} ${
                nuevoEstado === "Activo" ? "activado" : "desactivado"
              } correctamente`
            );
          } catch (e) {
            toast.error("No se pudo actualizar el estado");
            console.error(e);
          } finally {
            setConfirmOpen(false);
            setSelectedAlumno(null);
          }
        }}
      />

      {/* Error si no se puede desactivar */}
      <ErrorDialog
        open={errorOpen}
        {...errorConfig}
        onClose={() => setErrorOpen(false)}
      />
    </div>
  );
}