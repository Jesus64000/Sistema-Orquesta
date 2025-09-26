// sistema-orquesta/src/pages/Alumnos.jsx
import { useEffect, useMemo, useState, useDeferredValue, useRef } from "react";
import toast from "react-hot-toast";

import {
  getAlumnos,
  deleteAlumno,
  getProgramas,
  getAlumno,
  getAlumnoInstrumento,
} from "../api/alumnos";

import AlumnoForm from "../components/Alumnos/AlumnoForm";
import AlumnoHistorial from "../components/Alumnos/AlumnoHistorial";
import AlumnoInstrumento from "../components/Alumnos/AlumnoInstrumento";
import Modal from "../components/Modal";
import AlumnoDetalle from "../components/Alumnos/AlumnoDetalle";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorDialog from "../components/InfoDialog";
import ExportAlumnosModal from "../components/Alumnos/ExportAlumnosModal.jsx";
import AlumnosHeader from "../components/Alumnos/AlumnosHeader";
import AlumnosFilters from "../components/Alumnos/AlumnosFilters";
import AlumnosTable from "../components/Alumnos/AlumnosTable";
import AlumnosPagination from "../components/Alumnos/AlumnosPagination";
import AlumnosBulkActionsModal from "../components/Alumnos/AlumnosBulkActionsModal.jsx";





export default function Alumnos() {
  // Data
  const [alumnos, setAlumnos] = useState([]);
  const [programas, setProgramas] = useState([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });
  const [loadError, setLoadError] = useState(false);
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
  const [actionsOpen, setActionsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  

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
  const [updatingId, setUpdatingId] = useState(null); // id del alumno mientras se persiste cambio de estado

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [resP, resA] = await Promise.all([getProgramas(), getAlumnos()]);
      setProgramas(resP.data || []);
      setAlumnos(resA.data || []);
      setLoadError(false);
    } catch (e) {
      toast.error("Error cargando alumnos");
      console.error(e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadData(); }, []);

  // Filtros + orden + paginación
  // Debounce simple de búsqueda usando deferred value (React 18+)
  const deferredSearch = useDeferredValue(search);

  const alumnosFiltrados = useMemo(() => {
    let list = [...alumnos];

    // filtros
    list = list.filter((a) => {
      const byText =
  a.nombre?.toLowerCase().includes(deferredSearch.toLowerCase()) ||
  a.telefono_contacto?.toLowerCase().includes(deferredSearch.toLowerCase());
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
  }, [alumnos, deferredSearch, fEstado, fPrograma, sortBy, sortDir]);

  const totalPages = Math.ceil(alumnosFiltrados.length / pageSize);
  const alumnosPage = alumnosFiltrados.slice((page - 1) * pageSize, page * pageSize);

  // Live region conteo resultados (announces after cambios de filtros/búsqueda)
  const resultsLiveRef = useRef(null);
  useEffect(() => {
    if (resultsLiveRef.current) {
      // Mensaje conciso, no spam: announce length
      resultsLiveRef.current.textContent = `${alumnosFiltrados.length} resultado${alumnosFiltrados.length === 1 ? '' : 's'}`;
    }
  }, [alumnosFiltrados.length]);

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

  // Seleccionar todo del conjunto filtrado (o todo en general si no hay filtros aplicados)
  const toggleSelectAllFiltered = (checked) => {
    if (checked) {
      // Todos los IDs del conjunto filtrado actual
      const ids = alumnosFiltrados.map((a) => a.id_alumno);
      setSelected(ids);
    } else {
      setSelected([]);
    }
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
    setExportOpen(true);
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
      {/* Región aria-live para anunciar conteo filtrado (invisible) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        ref={resultsLiveRef}
      />
      {/* Encabezado */}
      <AlumnosHeader
        selected={selected}
        onExport={bulkExport}
        onCreate={openCreate}
        onOpenActions={() => setActionsOpen(true)}
      />

      {/* Filtros */}
      <AlumnosFilters
        search={search}
        setSearch={setSearch}
        fEstado={fEstado}
        setFEstado={setFEstado}
        fPrograma={fPrograma}
        setFPrograma={setFPrograma}
        programas={programas}
      />

      {/* Tabla / Estados */}
      {loading && (
        <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 animate-pulse">
              <div className="col-span-2 h-4 rounded bg-gray-200" />
              <div className="h-4 rounded bg-gray-200" />
              <div className="h-4 rounded bg-gray-200" />
              <div className="h-4 rounded bg-gray-200" />
              <div className="h-4 rounded bg-gray-200" />
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2 text-xs text-gray-400">
            <span className="h-3 w-3 animate-spin rounded-full border-t-2 border-b-2 border-yellow-400"></span>
            Cargando alumnos...
          </div>
        </div>
      )}

      {!loading && loadError && (
        <div className="bg-white border rounded-2xl shadow-sm p-10 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-red-50 border border-red-200 text-red-600 text-xl font-bold">!</div>
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-800">No se pudieron cargar los datos</h3>
            <p className="text-sm text-gray-500 max-w-sm">Ocurrió un problema al intentar obtener la lista de alumnos. Verifica tu conexión o reintenta.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="inline-flex items-center h-10 px-5 rounded-full text-sm font-medium bg-gradient-to-b from-yellow-300 to-yellow-400 text-gray-900 border border-yellow-400 shadow-sm hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-1"
            >Reintentar</button>
            <button
              onClick={() => setLoadError(false)}
              className="inline-flex items-center h-10 px-5 rounded-full text-sm font-medium bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm hover:from-gray-100 hover:to-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
            >Ocultar</button>
          </div>
        </div>
      )}

      {!loading && !loadError && alumnosFiltrados.length === 0 && (
        <div className="bg-white border rounded-2xl shadow-sm p-10 flex flex-col items-center gap-5 text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
              <span className="text-2xl">👤</span>
            </div>
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-yellow-200 text-yellow-800 text-xs font-semibold flex items-center justify-center border border-yellow-300">0</div>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-800">Sin resultados</h3>
            <p className="text-sm text-gray-500 max-w-xs">Ajusta los filtros arriba o limpia la búsqueda para ver más alumnos.</p>
          </div>
          {(search || fEstado || fPrograma) && (
            <button
              onClick={() => { setSearch(""); setFEstado("Activo"); setFPrograma(""); }}
              className="inline-flex items-center h-9 px-4 rounded-full text-[13px] font-medium bg-gradient-to-b from-gray-800 to-gray-900 text-white border border-gray-800 shadow-sm hover:from-black hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
            >Limpiar filtros</button>
          )}
        </div>
      )}

      {!loading && !loadError && alumnosFiltrados.length > 0 && (
        <AlumnosTable
          alumnosPage={alumnosPage}
          alumnosFiltrados={alumnosFiltrados}
          selected={selected}
          toggleSelect={toggleSelect}
          toggleSelectAllFiltered={toggleSelectAllFiltered}
          sortBy={sortBy}
          sortDir={sortDir}
          toggleSort={toggleSort}
          openEdit={openEdit}
          handleEstadoClick={handleEstadoClick}
          checkingId={checkingId}
          updatingId={updatingId}
          openDetail={openDetail}
        />
      )}
      
      {/* Paginación */}
      <AlumnosPagination page={page} totalPages={totalPages} setPage={setPage} />

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

      {/* Acciones (Alumnos) */}
      {actionsOpen && (
        <AlumnosBulkActionsModal
          open={actionsOpen}
          onClose={() => setActionsOpen(false)}
          selectedIds={selected}
          programas={programas}
          onApplied={() => {
            // Tras aplicar, refrescamos datos para ver los cambios
            loadData();
            setSelected([]);
          }}
        />
      )}

      {/* Exportar (formato) */}
      <ExportAlumnosModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        selectedIds={selected}
        defaultFormat="csv"
      />


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
            const alumnoId = selectedAlumno.id_alumno;
            setUpdatingId(alumnoId);
            // Optimistic update
            setAlumnos(prev => prev.map(al => al.id_alumno === alumnoId ? { ...al, estado: nuevoEstado } : al));

            let toastId;
            try { toastId = toast.loading("Guardando cambio..."); } catch { /* noop */ }

            const res = await fetch(`http://localhost:4000/alumnos/${alumnoId}/estado`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ estado: nuevoEstado }),
            });

            if (!res.ok) throw new Error("Error actualizando estado");

            toast.success(`Alumno ${selectedAlumno.nombre} ${nuevoEstado === "Activo" ? "activado" : "desactivado"} correctamente`, { id: toastId });
          } catch (e) {
            // Revertir si falló
            setAlumnos(prev => prev.map(al => al.id_alumno === selectedAlumno.id_alumno ? { ...al, estado: selectedAlumno.estado } : al));
            toast.error("No se pudo actualizar el estado");
            console.error(e);
          } finally {
            setUpdatingId(null);
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