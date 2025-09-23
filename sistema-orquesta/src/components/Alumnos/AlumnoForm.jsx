// src/components/Alumno/AlumnoForm.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import MultiSelect from "../MultiSelect";
import InfoDialog from "../InfoDialog";
import ConfirmDialog from "../ConfirmDialog";
import { createAlumno, updateAlumno, getAlumnoInstrumento } from "../../api/alumnos";
import { getRepresentantes } from "../../api/representantes";

export default function AlumnoForm({ data, programas, onCancel, onSaved }) {
  const [formData, setFormData] = useState({
    nombre: "",
    fecha_nacimiento: "",
    genero: "Masculino",
    telefono_contacto: "",
    estado: "Activo",
    programa_ids: [],
    id_representante: "",
    edad: "",
  });
  const [loading, setLoading] = useState(false);
  const [representantes, setRepresentantes] = useState([]);
  const [loadingReps, setLoadingReps] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorConfig, setErrorConfig] = useState({ title: "", message: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);

  // precargar datos al editar
  useEffect(() => {
    if (data) {
      setFormData({
        nombre: data.nombre || "",
        fecha_nacimiento: data.fecha_nacimiento
          ? String(data.fecha_nacimiento).slice(0, 10)
          : "",
        genero: data.genero || "Masculino",
        telefono_contacto: data.telefono_contacto || "",
        estado: data.estado || "Activo",
        programa_ids: (data.programas || []).map((p) => p.id_programa),
        id_representante: data.id_representante || "",
        edad: data.edad || "",
      });
    }
  }, [data]);

  // cargar representantes
  useEffect(() => {
    const loadReps = async () => {
      setLoadingReps(true);
      try {
        const res = await getRepresentantes();
        setRepresentantes(res.data || []);
      } catch (err) {
        console.error("Error cargando representantes", err);
      } finally {
        setLoadingReps(false);
      }
    };
    loadReps();
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.nombre?.trim()) return toast.error("El nombre es obligatorio");
  if (!formData.fecha_nacimiento)
    return toast.error("La fecha de nacimiento es obligatoria");
  if (formData.programa_ids.length === 0)
    return toast.error("Selecciona al menos un programa");

  // Si estoy editando y se intenta pasar a Inactivo, comportarse como el botón de desactivar de la tabla
  if (data && formData.estado === 'Inactivo' && data.estado !== 'Inactivo') {
    try {
      setLoading(true);
      const resInst = await getAlumnoInstrumento(data.id_alumno);
      const instData = resInst?.data;
      const tieneInstrumento = Array.isArray(instData) ? instData.length > 0 : !!instData;
      if (tieneInstrumento) {
        const lista = Array.isArray(instData) ? instData : [instData];
        const detalle = lista
          .map((it) => {
            const nombre = it?.nombre || it?.instrumento || it?.tipo || "Instrumento";
            const serial = it?.numero_serie || it?.serial || it?.codigo || "";
            return serial ? `${nombre} (${serial})` : nombre;
          })
          .join(", ");
        setErrorConfig({
          title: "Acción no permitida",
          message: `No se puede desactivar porque tiene asignado: ${detalle}. Debe devolverlo antes de desactivar.`,
        });
        setErrorOpen(true);
        setLoading(false);
        return;
      }
      // No tiene instrumentos: abrir ConfirmDialog consistente
      setConfirmOpen(true);
    } catch {
      setErrorConfig({
        title: "Error",
        message: "No se pudo verificar si el alumno tiene instrumentos asignados. Intenta de nuevo.",
      });
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
    return; // esperar confirmación
  }

  // Si no requiere confirmación especial, guardar directamente
  await doSave();
};

// Extraer guardado para reutilizar tras confirmar
const doSave = async () => {
  try {
    setLoading(true);
    // 👉 Preparo el payload base sin edad
    const payloadBase = {
      nombre: formData.nombre,
      fecha_nacimiento: formData.fecha_nacimiento,
      genero: formData.genero,
      telefono_contacto: formData.telefono_contacto,
      programa_ids: formData.programa_ids,
      id_representante: formData.id_representante || null, // opcional
    };

    if (data) {
      // En edición sí permitimos cambiar estado
      const payload = { ...payloadBase, estado: formData.estado };
      await updateAlumno(data.id_alumno, payload);
      toast.success("Alumno actualizado");
    } else {
      // En creación omitimos 'estado' para que el backend use el default 'Activo'
      const payload = { ...payloadBase };
      await createAlumno(payload);
      toast.success("Alumno creado");
    }

    onSaved?.();
  } catch (err) {
    console.error("Error en submit Alumno:", err);
    const msg = err?.response?.data?.error;
    const code = err?.response?.data?.code;
    if (code === 'BLOQUEADO_INSTRUMENTO' || (msg && msg.toLowerCase().includes('inactivo') && msg.toLowerCase().includes('instrumento'))) {
      toast.error('No se puede desactivar porque hay estudiantes con instrumentos asignados');
    } else if (msg) {
      toast.error(msg);
    } else {
      toast.error("No se pudo guardar el alumno");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Nombre */}
        <div>
          <label className="text-xs text-gray-500">Nombre</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label className="text-xs text-gray-500">Fecha de nacimiento</label>
          <input
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) =>
              setFormData({ ...formData, fecha_nacimiento: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        {/* Edad (solo lectura) */}
        <div>
          <label className="text-xs text-gray-500">Edad</label>
          <input
            type="text"
            value={formData.edad || ""}
            readOnly
            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-600"
          />
        </div>

        {/* Género */}
        <div>
          <label className="text-xs text-gray-500">Género</label>
          <select
            value={formData.genero}
            onChange={(e) =>
              setFormData({ ...formData, genero: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          >
            <option>Masculino</option>
            <option>Femenino</option>
            <option>Otro</option>
          </select>
        </div>

        {/* Teléfono */}
        <div>
          <label className="text-xs text-gray-500">Teléfono</label>
          <input
            type="text"
            value={formData.telefono_contacto}
            onChange={(e) =>
              setFormData({ ...formData, telefono_contacto: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Programas */}
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Programas (máx. 2)</label>
          <MultiSelect
            options={programas}
            value={formData.programa_ids}
            onChange={(val) => {
              if (val.length > 2) {
                toast.error("Un alumno puede estar en máximo 2 programas");
                return;
              }
              setFormData({ ...formData, programa_ids: val });
            }}
            placeholder="Selecciona uno o dos programas"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="text-xs text-gray-500">Estado</label>
          <select
            value={formData.estado}
            onChange={(e) =>
              setFormData({ ...formData, estado: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
            disabled={!data}
          >
            <option>Activo</option>
            <option>Inactivo</option>
            <option>Retirado</option>
          </select>
        </div>

        {/* Representante */}
        <div>
          <label className="text-xs text-gray-500">Representante</label>
          <select
            value={formData.id_representante}
            onChange={(e) =>
              setFormData({ ...formData, id_representante: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          >
            <option value="">-- Sin representante --</option>
            {loadingReps ? (
              <option disabled>Cargando...</option>
            ) : (
              representantes.map((r) => (
                <option key={r.id_representante} value={r.id_representante}>
                  {r.nombre} ({r.telefono})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-60 flex items-center gap-2"
        >
          {loading && (
            <span className="animate-spin border-2 border-t-transparent rounded-full h-4 w-4"></span>
          )}
          {data ? "Guardar cambios" : "Crear alumno"}
        </button>
      </div>
    </form>
    {/* Confirmación consistente para desactivar desde formulario */}
    <ConfirmDialog
      open={confirmOpen}
      title="Confirmar desactivación"
      message={`¿Seguro que deseas desactivar al alumno ${data?.nombre || formData.nombre}?`}
      confirmLabel="Desactivar"
      confirmColor="bg-red-600 hover:bg-red-700"
      onCancel={() => setConfirmOpen(false)}
      onConfirm={async () => {
        setConfirmOpen(false);
        await doSave();
      }}
    />
    {errorOpen && (
      <InfoDialog
        open={errorOpen}
        title={errorConfig.title}
        message={errorConfig.message}
        onClose={() => setErrorOpen(false)}
      />
    )}
    </>
  );
}
