// Componente del formulario de Alumno (versión corregida y limpia)
import { useEffect, useState, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import MultiSelect from "../MultiSelect";
import InfoDialog from "../InfoDialog";
import ConfirmDialog from "../ConfirmDialog";
import { createAlumno, updateAlumno, getAlumnoInstrumento } from "../../api/alumnos";
import { getRepresentantes } from "../../api/representantes";
import { normalizaTelefono, validateAlumnoForm } from "./alumnoFormUtils";
import Button from "../ui/Button";

export default function AlumnoForm({ data, programas, onCancel, onSaved }) {
  // Estado principal del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    fecha_nacimiento: "",
    genero: "Masculino",
    telefono_contacto: "",
    estado: "Activo",
    programa_ids: [],
    id_representante: "",
  });

  // Otros estados
  const [loading, setLoading] = useState(false);
  const [representantes, setRepresentantes] = useState([]);
  const [loadingReps, setLoadingReps] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorConfig, setErrorConfig] = useState({ title: "", message: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errors, setErrors] = useState({});

  // Refs
  const firstFieldRef = useRef(null);
  const initialSnapshotRef = useRef(null);

  // Edad dinámica derivada
  const edadCalculada = useMemo(() => {
    if (!formData.fecha_nacimiento) return "";
    const fn = new Date(formData.fecha_nacimiento + "T00:00:00");
    if (isNaN(fn.getTime())) return "";
    const hoy = new Date();
    let years = hoy.getFullYear() - fn.getFullYear();
    const mDiff = hoy.getMonth() - fn.getMonth();
    if (mDiff < 0 || (mDiff === 0 && hoy.getDate() < fn.getDate())) years--;
    if (years < 0 || years > 110) return "";
    return String(years);
  }, [formData.fecha_nacimiento]);

  // Autofocus
  useEffect(() => { firstFieldRef.current?.focus(); }, []);

  // Precarga en modo edición
  useEffect(() => {
    if (data) {
      setFormData({
        nombre: data.nombre || "",
        fecha_nacimiento: data.fecha_nacimiento ? String(data.fecha_nacimiento).slice(0, 10) : "",
        genero: data.genero || "Masculino",
        telefono_contacto: data.telefono_contacto || "",
        estado: data.estado || "Activo",
        programa_ids: (data.programas || []).map(p => p.id_programa),
        id_representante: data.id_representante || "",
      });
    }
  }, [data]);

  // Cargar representantes
  useEffect(() => {
    (async () => {
      setLoadingReps(true);
      try { const res = await getRepresentantes(); setRepresentantes(res.data || []); }
      catch (e) { console.error("Error cargando representantes", e); }
      finally { setLoadingReps(false); }
    })();
  }, []);

  // Snapshot inicial para dirty check
  useEffect(() => {
    if (data && !initialSnapshotRef.current) {
      initialSnapshotRef.current = {
        nombre: data.nombre || "",
        fecha_nacimiento: data.fecha_nacimiento ? String(data.fecha_nacimiento).slice(0, 10) : "",
        genero: data.genero || "Masculino",
        telefono_contacto: data.telefono_contacto || "",
        estado: data.estado || "Activo",
        programa_ids: (data.programas || []).map(p => p.id_programa).slice().sort(),
        id_representante: data.id_representante || "",
      };
    }
  }, [data]);

  // Dirty check
  const isDirty = useMemo(() => {
    if (!data) return true; // creación siempre editable
    if (!initialSnapshotRef.current) return true;
    const snap = initialSnapshotRef.current;
    const current = {
      nombre: formData.nombre,
      fecha_nacimiento: formData.fecha_nacimiento,
      genero: formData.genero,
      telefono_contacto: formData.telefono_contacto,
      estado: formData.estado,
      programa_ids: [...formData.programa_ids].slice().sort(),
      id_representante: formData.id_representante,
    };
    return Object.keys(current).some(k => {
      if (k === 'programa_ids') {
        const a = snap.programa_ids || []; const b = current.programa_ids || [];
        if (a.length !== b.length) return true;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return true;
        return false;
      }
      return snap[k] !== current[k];
    });
  }, [data, formData]);

  // Validaciones centralizadas importadas

  // Flujo especial para desactivar
  const openDeactivateFlowIfNeeded = async () => {
    if (data && formData.estado === 'Inactivo' && data.estado !== 'Inactivo') {
      try {
        setLoading(true);
        const resInst = await getAlumnoInstrumento(data.id_alumno);
        const instData = resInst?.data;
        const tieneInstrumento = Array.isArray(instData) ? instData.length > 0 : !!instData;
        if (tieneInstrumento) {
          const lista = Array.isArray(instData) ? instData : [instData];
          const detalle = lista.map(it => {
            const nombre = it?.nombre || it?.instrumento || it?.tipo || 'Instrumento';
            const serial = it?.numero_serie || it?.serial || it?.codigo || '';
            return serial ? `${nombre} (${serial})` : nombre;
          }).join(', ');
          setErrorConfig({ title: 'Acción no permitida', message: `No se puede desactivar porque tiene asignado: ${detalle}. Debe devolverlo antes de desactivar.` });
          setErrorOpen(true);
          return false;
        }
        setConfirmOpen(true);
        return false; // esperar confirmación
      } catch {
        setErrorConfig({ title: 'Error', message: 'No se pudo verificar instrumentos asignados. Intenta de nuevo.' });
        setErrorOpen(true);
        return false;
      } finally { setLoading(false); }
    }
    return true;
  };

  const doSave = async () => {
    try {
      setLoading(true);
      const payloadBase = {
        nombre: formData.nombre,
        fecha_nacimiento: formData.fecha_nacimiento,
        genero: formData.genero,
        telefono_contacto: formData.telefono_contacto,
        programa_ids: formData.programa_ids,
        id_representante: formData.id_representante || null,
      };
      if (data) {
        await updateAlumno(data.id_alumno, { ...payloadBase, estado: formData.estado });
        toast.success('Alumno actualizado');
      } else {
        await createAlumno(payloadBase);
        toast.success('Alumno creado');
      }
      onSaved?.();
    } catch (err) {
      console.error('Error en submit Alumno:', err);
      const msg = err?.response?.data?.error;
      const code = err?.response?.data?.code;
      if (code === 'BLOQUEADO_INSTRUMENTO' || (msg && msg.toLowerCase().includes('inactivo') && msg.toLowerCase().includes('instrumento'))) {
        toast.error('No se puede desactivar porque hay estudiantes con instrumentos asignados');
      } else if (msg) toast.error(msg); else toast.error('No se pudo guardar el alumno');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  const v = validateAlumnoForm(formData);
    setErrors(v);
    if (Object.keys(v).length) {
      const order = ['nombre', 'fecha_nacimiento', 'programa_ids', 'telefono_contacto'];
      for (const k of order) {
        if (v[k]) {
          const el = document.getElementById(k === 'nombre' ? 'alumno-nombre' : k === 'fecha_nacimiento' ? 'alumno-fecha' : null);
          if (el) el.focus();
          // Scroll suave al centro para mejorar percepción de error
          if (el && el.scrollIntoView) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          break;
        }
      }
      return;
    }
    const canContinue = await openDeactivateFlowIfNeeded();
    if (!canContinue) return;
    await doSave();
  };

  return (
    <>
  <form onSubmit={handleSubmit} className="space-y-6" aria-describedby={Object.keys(errors).length ? 'form-errors' : undefined}>
        {Object.keys(errors).length === 1 && (
          <div id="form-errors" role="alert" aria-live="assertive" className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            Falta completar: {Object.keys(errors)[0]}
          </div>
        )}
        {Object.keys(errors).length > 1 && (
          <div id="form-errors" role="alert" aria-live="assertive" className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            Corrige los siguientes campos: {Object.keys(errors).join(', ')}
          </div>
        )}

        <fieldset className="space-y-5" aria-labelledby="legend-datos-basicos">
          <legend id="legend-datos-basicos" className="sr-only">Datos básicos</legend>
          <h3 aria-hidden="true" className="text-sm font-semibold text-gray-800 tracking-wide flex items-center gap-2">
            <span className="inline-block h-5 w-1 rounded bg-yellow-400" /> Datos básicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="alumno-nombre" className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                ref={firstFieldRef}
                id="alumno-nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Juan Pérez"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-400"
                required
                aria-invalid={errors?.nombre ? 'true' : 'false'}
              />
              {errors?.nombre && <p className="mt-1 text-xs text-red-600" role="alert">{errors.nombre}</p>}
            </div>
            <div>
              <label htmlFor="alumno-fecha" className="block text-xs font-medium text-gray-600 mb-1">Fecha de nacimiento *</label>
              <input
                id="alumno-fecha"
                type="date"
                value={formData.fecha_nacimiento}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
                aria-invalid={errors?.fecha_nacimiento ? 'true' : 'false'}
                aria-describedby="hint-fecha"
              />
              <p id="hint-fecha" className="mt-1 text-[11px] text-gray-500">Usa el selector o escribe en formato AAAA-MM-DD.</p>
              {errors?.fecha_nacimiento && <p className="mt-1 text-xs text-red-600" role="alert">{errors.fecha_nacimiento}</p>}
            </div>
            <div className="flex flex-col">
              <span className="block text-xs font-medium text-gray-600 mb-1">Edad</span>
              {edadCalculada ? (
                <span className="inline-flex items-center self-start rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200">
                  {edadCalculada} años
                </span>
              ) : (
                <span className="text-[11px] text-gray-400">—</span>
              )}
            </div>
            <div className="md:col-span-1">
              <label className="text-xs text-gray-500">Género</label>
              <select
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option>Masculino</option>
                <option>Femenino</option>
                <option>Otro</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-5" aria-labelledby="legend-contacto">
          <legend id="legend-contacto" className="sr-only">Contacto</legend>
          <h3 aria-hidden="true" className="text-sm font-semibold text-gray-800 tracking-wide flex items-center gap-2">
            <span className="inline-block h-5 w-1 rounded bg-yellow-400" /> Contacto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500" htmlFor="alumno-telefono">Teléfono</label>
              <input
                id="alumno-telefono"
                type="text"
                value={formData.telefono_contacto}
                onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })}
                onBlur={(e) => {
                  const val = normalizaTelefono(e.target.value);
                  setFormData(f => ({ ...f, telefono_contacto: val }));
                  setErrors(prev => ({ ...prev, telefono_contacto: undefined }));
                }}
                className="w-full p-2 border rounded-lg placeholder:text-gray-400"
                aria-invalid={errors?.telefono_contacto ? 'true' : 'false'}
                placeholder="Ej: 0412-1234567"
                aria-describedby="hint-telefono"
              />
              <p id="hint-telefono" className="mt-1 text-[11px] text-gray-500">Formato sugerido: 0412-1234567</p>
              {errors?.telefono_contacto && <p className="mt-1 text-xs text-red-600" role="alert">{errors.telefono_contacto}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-500">Representante</label>
              <select
                value={formData.id_representante}
                onChange={(e) => setFormData({ ...formData, id_representante: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">-- Sin representante --</option>
                {loadingReps ? <option disabled>Cargando...</option> : (
                  representantes.map(r => (
                    <option key={r.id_representante} value={r.id_representante}>{r.nombre} ({r.telefono})</option>
                  ))
                )}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-5" aria-labelledby="legend-programas-estado">
          <legend id="legend-programas-estado" className="sr-only">Programas y estado</legend>
          <h3 aria-hidden="true" className="text-sm font-semibold text-gray-800 tracking-wide flex items-center gap-2">
            <span className="inline-block h-5 w-1 rounded bg-yellow-400" /> Programas y estado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500" htmlFor="alumno-programas">Programas (máx. 2) *</label>
              <div id="alumno-programas">
                <MultiSelect
                  options={programas}
                  value={formData.programa_ids}
                  onChange={(val) => {
                    if (val.length > 2) {
                      setErrors(prev => ({ ...prev, programa_ids: 'Máximo 2 programas' }));
                      return;
                    }
                    setErrors(prev => ({ ...prev, programa_ids: undefined }));
                    setFormData({ ...formData, programa_ids: val });
                  }}
                  placeholder="Selecciona uno o dos programas"
                />
                <div id="hint-programas" className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                  <span>{formData.programa_ids.length} / 2 seleccionados</span>
                  {formData.programa_ids.length === 0 && !errors?.programa_ids && (
                    <span className="text-gray-400">Selecciona al menos uno para continuar</span>
                  )}
                  {errors?.programa_ids && <span className="text-red-600">{errors.programa_ids}</span>}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full p-2 border rounded-lg"
                disabled={!data}
              >
                <option>Activo</option>
                <option>Inactivo</option>
                <option>Retirado</option>
              </select>
            </div>
          </div>
        </fieldset>

        <div className="h-4" aria-hidden="true"></div>
        <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t mt-8">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 order-2 sm:order-1">
              {/* Botón fantasma: limpiar (creación) o revertir (edición) */}
              {(() => {
                const isCreation = !data;
                if (isCreation) {
                  const defaults = {
                    nombre: "",
                    fecha_nacimiento: "",
                    genero: "Masculino",
                    telefono_contacto: "",
                    estado: "Activo",
                    programa_ids: [],
                    id_representante: "",
                  };
                  const hasContent = Object.keys(defaults).some(k => {
                    const v = formData[k];
                    if (Array.isArray(v)) return v.length > 0;
                    return v !== defaults[k];
                  });
                  if (hasContent) {
                    return (
                      <button
                        type="button"
                        onClick={() => { setFormData(defaults); setErrors({}); }}
                        className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 focus:outline-none underline decoration-dotted"
                      >Limpiar</button>
                    );
                  }
                } else {
                  if (isDirty) {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          if (initialSnapshotRef.current) {
                            const snap = initialSnapshotRef.current;
                            setFormData({
                              nombre: snap.nombre,
                              fecha_nacimiento: snap.fecha_nacimiento,
                              genero: snap.genero,
                              telefono_contacto: snap.telefono_contacto,
                              estado: snap.estado,
                              programa_ids: snap.programa_ids.slice(),
                              id_representante: snap.id_representante,
                            });
                            setErrors({});
                          }
                        }}
                        className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 focus:outline-none underline decoration-dotted"
                      >Revertir cambios</button>
                    );
                  }
                }
                return null;
              })()}
              <Button type="button" variant="neutral" onClick={onCancel}>Cancelar</Button>
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !isDirty}
                loading={loading}
                className="min-w-[150px]"
              >
                {data ? (isDirty ? 'Guardar cambios' : 'Sin cambios') : 'Crear alumno'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar desactivación"
        message={`¿Seguro que deseas desactivar al alumno ${data?.nombre || formData.nombre}?`}
        confirmLabel="Desactivar"
        confirmColor="bg-red-600 hover:bg-red-700"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => { setConfirmOpen(false); await doSave(); }}
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
