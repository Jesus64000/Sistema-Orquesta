// Componente del formulario de Alumno
import { useEffect, useState, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import MultiSelect from "../MultiSelect";
import { createAlumno, updateAlumno } from "../../api/alumnos";
import { getRepresentantes, getParentescos } from "../../api/representantes";
import { getEstados } from "../../api/administracion/estados";
import RepresentanteForm from '../Representantes/RepresentanteForm.jsx';
import { normalizaTelefono, validateAlumnoForm } from "./alumnoFormUtils";
import Button from "../ui/Button";

export default function AlumnoForm({ data, programas, onCancel, onSaved }) {
  const [formData, setFormData] = useState({
    nombre: "",
    fecha_nacimiento: "",
    genero: "Masculino",
    telefono_contacto: "",
    estado: "Activo",
    programa_ids: [],
    representantes_links: [],
    id_representante: "",
  });
  const [loading, setLoading] = useState(false);
  const [representantes, setRepresentantes] = useState([]);
  const [parentescos, setParentescos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [nuevoVinculo, setNuevoVinculo] = useState({ id_representante: "", id_parentesco: "", principal: true });
  const [showCrearRep, setShowCrearRep] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const firstFieldRef = useRef(null);
  const initialSnapshotRef = useRef(null);

  // Edad
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

  useEffect(() => { firstFieldRef.current?.focus(); }, []);

  // Carga catálogos
  useEffect(() => {
    (async () => {
      try {
        const [repRes, parRes, estRes] = await Promise.all([
          getRepresentantes(),
          getParentescos(),
          getEstados(),
        ]);
        setRepresentantes(repRes.data || repRes || []);
        setParentescos(parRes.data || parRes || []);
        setEstados(estRes.data || estRes || []);
      } catch (e) { console.error('Error cargando catálogos', e); }
    })();
  }, []);

  // Precarga edición
  useEffect(() => {
    if (data) {
      const links = (data.representantes || []).map(r => ({
        id_representante: r.id_representante,
        id_parentesco: r.id_parentesco || null,
        principal: !!r.principal,
        representante_nombre: r.representante_nombre || r.nombre || '',
        parentesco_nombre: r.parentesco_nombre || r.parentesco || ''
      }));
      setFormData(f => ({
        ...f,
        nombre: data.nombre || "",
        fecha_nacimiento: data.fecha_nacimiento ? String(data.fecha_nacimiento).slice(0, 10) : "",
        genero: data.genero || "Masculino",
        telefono_contacto: data.telefono_contacto || "",
        estado: data.estado || "Activo",
        programa_ids: (data.programas || []).map(p => p.id_programa),
        representantes_links: links,
        id_representante: data.id_representante || "",
      }));
      initialSnapshotRef.current = {
        nombre: data.nombre || "",
        fecha_nacimiento: data.fecha_nacimiento ? String(data.fecha_nacimiento).slice(0, 10) : "",
        genero: data.genero || "Masculino",
        telefono_contacto: data.telefono_contacto || "",
        estado: data.estado || "Activo",
        programa_ids: (data.programas || []).map(p => p.id_programa).slice().sort(),
        representantes_links: links,
        id_representante: data.id_representante || "",
      };
    }
  }, [data]);

  const isDirty = useMemo(() => {
    if (!data) return true;
    if (!initialSnapshotRef.current) return true;
    const snap = initialSnapshotRef.current;
    const current = {
      nombre: formData.nombre,
      fecha_nacimiento: formData.fecha_nacimiento,
      genero: formData.genero,
      telefono_contacto: formData.telefono_contacto,
      estado: formData.estado,
      programa_ids: [...formData.programa_ids].slice().sort(),
      representantes_links: formData.representantes_links,
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

  const openDeactivateFlowIfNeeded = async () => true;

  const doSave = async () => {
    try {
      setLoading(true);
      const payloadBase = {
        nombre: formData.nombre,
        fecha_nacimiento: formData.fecha_nacimiento,
        genero: formData.genero,
        telefono_contacto: formData.telefono_contacto,
        ...(data ? { estado: formData.estado } : {}),
        programa_ids: formData.programa_ids,
        representantes: formData.representantes_links.map(r => ({
          id_representante: r.id_representante,
          id_parentesco: r.id_parentesco || null,
            principal: !!r.principal
        })),
      };
      if (data) {
        await updateAlumno(data.id_alumno, payloadBase);
        toast.success('Alumno actualizado');
      } else {
        await createAlumno(payloadBase);
        toast.success('Alumno creado');
      }
      onSaved?.();
    } catch (err) {
      console.error('Error en submit Alumno:', err);
      const msg = err?.response?.data?.error;
      if (msg) toast.error(msg); else toast.error('No se pudo guardar el alumno');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const v = validateAlumnoForm({
      ...formData,
      id_representante: formData.representantes_links.find(r => r.principal) ? 'ok' : '',
    });
    setErrors(v);
    if (Object.keys(v).length) return; // errores visibles inline tras submit
    const canContinue = await openDeactivateFlowIfNeeded();
    if (!canContinue) return;
    await doSave();
  };

  return (
    <>
  <form onSubmit={handleSubmit} className="space-y-6">

        <fieldset className="space-y-5" aria-labelledby="legend-datos-basicos">
          <legend id="legend-datos-basicos" className="sr-only">Datos básicos</legend>
          <h3 aria-hidden="true" className="text-sm font-semibold text-gray-800 tracking-wide flex items-center gap-2">
            <span className="inline-block h-5 w-1 rounded bg-yellow-400" /> Datos básicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="alumno-nombre" className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                ref={firstFieldRef}
                id="alumno-nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Juan Pérez"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-400 ${ (submitted && errors?.nombre) ? 'border-red-400 focus:ring-red-400 ring-red-300' : 'border-gray-300'}`}
                aria-invalid={(submitted && errors?.nombre) ? 'true' : 'false'}
              />
              {submitted && errors?.nombre && <p className="mt-1 text-xs text-red-600" role="alert">{errors.nombre}</p>}
            </div>
            <div>
              <label htmlFor="alumno-fecha" className="block text-xs font-medium text-gray-600 mb-1">Fecha de nacimiento *</label>
              <input
                id="alumno-fecha"
                type="date"
                value={formData.fecha_nacimiento}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${ (submitted && errors?.fecha_nacimiento) ? 'border-red-400 focus:ring-red-400 ring-red-300' : 'border-gray-300'}`}
                aria-invalid={(submitted && errors?.fecha_nacimiento) ? 'true' : 'false'}
                aria-describedby="hint-fecha"
              />
              <p id="hint-fecha" className="mt-1 text-[11px] text-gray-500">Usa el selector o escribe en formato AAAA-MM-DD.</p>
              {submitted && errors?.fecha_nacimiento && <p className="mt-1 text-xs text-red-600" role="alert">{errors.fecha_nacimiento}</p>}
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
            {data && (
              <div className="md:col-span-1">
                <label className="text-xs text-gray-500">Estado</label>
                <select value={formData.estado || 'Activo'} onChange={e=> setFormData({ ...formData, estado: e.target.value })} className="w-full p-2 border rounded-lg">
                  {estados.map(es => <option key={es.id_estado} value={es.nombre}>{es.nombre}</option>)}
                </select>
              </div>
            )}
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
                className={`w-full p-2 border rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${ (submitted && errors?.telefono_contacto) ? 'border-red-400 focus:ring-red-400 ring-red-300' : 'border-gray-300'}`}
                aria-invalid={(submitted && errors?.telefono_contacto) ? 'true' : 'false'}
                placeholder="Ej: 0412-1234567"
                aria-describedby="hint-telefono"
              />
              <p id="hint-telefono" className="mt-1 text-[11px] text-gray-500">Formato sugerido: 0412-1234567</p>
              {submitted && errors?.telefono_contacto && <p className="mt-1 text-xs text-red-600" role="alert">{errors.telefono_contacto}</p>}
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 tracking-wide flex items-center gap-2">
                    <span className="inline-block h-5 w-1 rounded bg-yellow-400" /> Representante
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCrearRep(true)}
                    className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded px-3 py-1 text-[11px] shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500 transition"
                  >Nuevo representante</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="text-[11px] text-gray-500">Representante {data ? '' : '*'} </label>
                    <select value={nuevoVinculo.id_representante} onChange={e => {
                      const val = e.target.value;
                      setNuevoVinculo(v => ({ ...v, id_representante: val, principal: true }));
                      setFormData(f => {
                        if (!val) return { ...f, representantes_links: [] };
                        const repData = representantes.find(r => String(r.id_representante) === String(val));
                        const parData = parentescos.find(p => String(p.id_parentesco) === String(nuevoVinculo.id_parentesco));
                        // En edición: si ya había varios, reemplazamos al principal o único
                        let otros = data ? f.representantes_links.filter(l => !l.principal) : [];
                        const principalEntry = {
                          id_representante: val,
                          id_parentesco: nuevoVinculo.id_parentesco || null,
                          principal: true,
                          representante_nombre: repData ? (repData.apellido ? `${repData.nombre} ${repData.apellido}` : repData.nombre) : '',
                          parentesco_nombre: parData?.nombre || ''
                        };
                        return {
                          ...f,
                          representantes_links: data ? [principalEntry, ...otros] : [principalEntry]
                        };
                      });
                    }} className="w-full p-2 border rounded bg-white text-sm">
                      <option value="">-- Seleccionar --</option>
                      {representantes.map(r => <option key={r.id_representante} value={r.id_representante}>{r.nombre}{r.apellido ? ` ${r.apellido}` : ''}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] text-gray-500">Parentesco</label>
                    <select value={nuevoVinculo.id_parentesco} onChange={e => {
                      const parVal = e.target.value;
                      setNuevoVinculo(v => ({ ...v, id_parentesco: parVal }));
                      setFormData(f => {
                        if (!nuevoVinculo.id_representante) return f; // no hay representante aún
                        const repData = representantes.find(r => String(r.id_representante) === String(nuevoVinculo.id_representante));
                        const parData = parentescos.find(p => String(p.id_parentesco) === String(parVal));
                        let otros = data ? f.representantes_links.filter(l => !l.principal) : [];
                        const principalEntry = {
                          id_representante: nuevoVinculo.id_representante,
                          id_parentesco: parVal || null,
                          principal: true,
                          representante_nombre: repData ? (repData.apellido ? `${repData.nombre} ${repData.apellido}` : repData.nombre) : '',
                          parentesco_nombre: parData?.nombre || ''
                        };
                        return {
                          ...f,
                          representantes_links: data ? [principalEntry, ...otros] : [principalEntry]
                        };
                      });
                    }} className="w-full p-2 border rounded bg-white text-sm">
                      <option value="">-- Seleccionar --</option>
                      {parentescos.map(p => <option key={p.id_parentesco} value={p.id_parentesco}>{p.nombre}</option>)}
                    </select>
                  </div>
                  {/* Principal siempre true aquí */}
                </div>
                {data && formData.representantes_links.filter(l=>!l.principal).length > 0 && (
                  <div className="rounded border bg-white divide-y">
                    {formData.representantes_links.filter(l=>!l.principal).map((r, idx) => (
                      <div key={idx} className="p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{r.representante_nombre || r.nombre}</p>
                          <p className="text-gray-500">{r.parentesco_nombre || '—'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => {
                            // Promover a principal
                            setFormData(f => {
                              const otros = f.representantes_links.filter(x => x !== r);
                              const repromote = { ...r, principal: true };
                              const remapped = otros.map(o => ({ ...o, principal: false }));
                              return { ...f, representantes_links: [repromote, ...remapped.filter(o=>!o.principal)] };
                            });
                          }} className="text-[11px] text-blue-600 hover:underline">Hacer principal</button>
                          <button type="button" onClick={() => {
                            setFormData(f => ({ ...f, representantes_links: f.representantes_links.filter(x => x !== r) }));
                          }} className="text-[11px] text-red-600 hover:underline">Quitar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-5" aria-labelledby="legend-programas">
          <legend id="legend-programas" className="sr-only">Programas</legend>
          <h3 aria-hidden="true" className="text-sm font-semibold text-gray-800 tracking-wide flex items-center gap-2">
            <span className="inline-block h-5 w-1 rounded bg-yellow-400" /> Programas
          </h3>
          <div>
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
                {formData.programa_ids.length === 0 && !(submitted && errors?.programa_ids) && (
                  <span className="text-gray-400">Selecciona al menos uno para continuar</span>
                )}
                {submitted && errors?.programa_ids && <span className="text-red-600">{errors.programa_ids}</span>}
              </div>
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
                    representantes_links: [],
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
                              representantes_links: snap.representantes_links,
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

      {showCrearRep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b">
              <h3 className="font-medium text-gray-800">Nuevo representante</h3>
              <button onClick={() => setShowCrearRep(false)} className="text-gray-500 hover:text-gray-700 text-sm">✕</button>
            </div>
            <div className="p-6">
              <RepresentanteForm
                onSaved={async () => {
                  const repRes = await getRepresentantes();
                  const repsData = repRes.data || repRes || [];
                  setRepresentantes(repsData);
                  const last = repsData.slice(-1)[0];
                  if (last) {
                    setNuevoVinculo(v => ({ ...v, id_representante: last.id_representante, principal: true }));
                    setFormData(f => {
                      const otros = f.representantes_links.filter(l => !l.principal);
                      return {
                        ...f,
                        representantes_links: [{
                          id_representante: last.id_representante,
                          id_parentesco: nuevoVinculo.id_parentesco || null,
                          principal: true,
                          representante_nombre: last.apellido ? `${last.nombre} ${last.apellido}` : last.nombre,
                          parentesco_nombre: ''
                        }, ...otros]
                      };
                    });
                  }
                  toast.success('Representante creado');
                  setShowCrearRep(false);
                }}
                onCancel={() => setShowCrearRep(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Diálogos de estado eliminados */}
    </>
  );
}
