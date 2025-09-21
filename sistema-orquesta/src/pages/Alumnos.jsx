// sistema-orquesta/src/pages/Alumnos.jsx
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  getAlumnos,
  deleteAlumno,
  getProgramas,
  exportAlumnosCSV,
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

import AlumnosHeader from "../components/Alumnos/AlumnosHeader";
import AlumnosFilters from "../components/Alumnos/AlumnosFilters";
import AlumnosTable from "../components/Alumnos/AlumnosTable";
import AlumnosPagination from "../components/Alumnos/AlumnosPagination";





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
      <AlumnosHeader selected={selected} onExport={bulkExport} onCreate={openCreate} />

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

      {/* Tabla */}
      <AlumnosTable
        alumnosPage={alumnosPage}
        selected={selected}
        toggleSelect={toggleSelect}
        sortBy={sortBy}
        sortDir={sortDir}
        toggleSort={toggleSort}
        openEdit={openEdit}
        handleEstadoClick={handleEstadoClick}
        checkingId={checkingId}
        openDetail={openDetail}
      />
      {/* Loader amigable */}
      {alumnosPage.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-500"></span>
              <span>Cargando alumnos...</span>
            </div>
          ) : (
            "No se encontraron alumnos"
          )}
        </div>
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