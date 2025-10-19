import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { createEvento, updateEvento } from "../../api/eventos";
import validateEventoForm from "./utils/validateEventoForm";
import Button from "../ui/Button";
import ConfirmDialog from "../ConfirmDialog";

export default function EventoForm({ data, onCancel, onSaved }) {
  const [form, setForm] = useState({
    titulo: "",
    fecha_evento: "",
    hora_evento: "",
    lugar: "",
    descripcion: "",
    estado: "PROGRAMADO",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const initialSnapshotRef = useRef(JSON.stringify(form));
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const firstErrorRef = useRef(null);
  const errorSummaryRef = useRef(null);

  useEffect(() => {
    if (data) {
      setForm({
        titulo: data.titulo || "",
        fecha_evento: data.fecha_evento || "",
        hora_evento: data.hora_evento || "",
        lugar: data.lugar || "",
        descripcion: data.descripcion || "",
        estado: data.estado || "PROGRAMADO",
      });
      setErrors({});
      initialSnapshotRef.current = JSON.stringify({
        titulo: data.titulo || "",
        fecha_evento: data.fecha_evento || "",
        hora_evento: data.hora_evento || "",
        lugar: data.lugar || "",
        descripcion: data.descripcion || "",
        estado: data.estado || "PROGRAMADO",
      });
    } else {
      // Prefill hora redondeada a la hora actual con minutos 00
      const now = new Date();
      const hour = String(now.getHours()).padStart(2, '0');
      const prefill = `${hour}:00`;
      setForm(f => {
        const next = { ...f, hora_evento: prefill };
        initialSnapshotRef.current = JSON.stringify(next);
        return next;
      });
    }
    }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isDirty = JSON.stringify(form) !== initialSnapshotRef.current;


  const runValidation = (mode = 'field') => {
    const { valid, errors: vErrors, normalized } = validateEventoForm(form);
    setErrors(vErrors);
    if (valid) return { valid, payload: normalized };
    // Sólo enfocar en modo submit para no interrumpir tabbing normal
    if (mode === 'submit') {
      setTimeout(() => {
        if (firstErrorRef.current) {
          firstErrorRef.current.focus();
        } else if (errorSummaryRef.current) {
          errorSummaryRef.current.focus();
        }
      }, 0);
    }
    return { valid: false };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const { valid, payload } = runValidation('submit');
    if (!valid) {
      toast.error("Hay errores en el formulario");
      return;
    }

    try {
      setSaving(true);
      if (data?.id_evento) {
        await updateEvento(data.id_evento, payload);
        toast.success("Evento actualizado correctamente");
      } else {
        await createEvento(payload);
        toast.success("Evento creado correctamente");
        setForm({
          titulo: "",
          fecha_evento: "",
          hora_evento: "",
          lugar: "",
          descripcion: "",
          estado: "PROGRAMADO",
        });
      }
      onSaved?.();
      onCancel?.();
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar evento");
    } finally {
      setSaving(false);
    }
  };

  const requestCancel = () => {
    if (isDirty && !saving) setShowConfirmCancel(true); else onCancel?.();
  };
  const confirmCancel = () => { setShowConfirmCancel(false); onCancel?.(); };

  useEffect(() => {
    const beforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty]);

  const fieldError = (name) => errors[name];

  return (
    <>
      <div ref={errorSummaryRef} aria-live="polite" className="sr-only" />
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Resumen global eliminado: errores visibles en línea */}

        {/* Fieldset Datos base */}
        <fieldset className="border rounded-xl p-4 card-90 space-y-5">
          <legend className="px-2 text-sm font-semibold text-app">Datos del evento</legend>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="evento-estado" className="text-xs font-medium muted uppercase tracking-wide">Estado *</label>
              <select
                id="evento-estado"
                name="estado"
                value={form.estado}
                onChange={handleChange}
                onBlur={() => submitted && runValidation('field')}
                className={`w-full p-2 border rounded-lg text-sm card ${fieldError('estado') ? 'border-red-400 focus:ring-red-300' : 'border focus:ring-yellow-300'} focus:outline-none focus:ring-2`}
                aria-invalid={!!fieldError('estado')}
                aria-describedby={fieldError('estado') ? 'error-estado' : undefined}
              >
                <option value="PROGRAMADO">Programado</option>
                <option value="EN_CURSO">En curso</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
              {fieldError('estado') && <span id="error-estado" className="text-xs text-red-600">{fieldError('estado')}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="evento-titulo" className="text-xs font-medium muted uppercase tracking-wide">Título *</label>
              <input
                id="evento-titulo"
                name="titulo"
                type="text"
                value={form.titulo}
                onChange={handleChange}
                onBlur={() => submitted && runValidation('field')}
                className={`w-full p-2 border rounded-lg text-sm card ${fieldError('titulo') ? 'border-red-400 focus:ring-red-300' : 'border focus:ring-yellow-300'} focus:outline-none focus:ring-2`}
                aria-invalid={!!fieldError('titulo')}
                aria-describedby={fieldError('titulo') ? 'error-titulo' : undefined}
                ref={fieldError('titulo') ? firstErrorRef : null}
                placeholder="Ej: Concierto de Primavera"
              />
              {fieldError('titulo') && <span id="error-titulo" className="text-xs text-red-600">{fieldError('titulo')}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="evento-fecha" className="text-xs font-medium muted uppercase tracking-wide">Fecha *</label>
              <div className="relative">
              <input
                id="evento-fecha"
                name="fecha_evento"
                type="date"
                value={form.fecha_evento}
                onChange={handleChange}
                onBlur={() => submitted && runValidation('field')}
                className={`w-full p-2 pr-10 border rounded-lg text-sm card ${fieldError('fecha_evento') ? 'border-red-400 focus:ring-red-300' : 'border focus:ring-yellow-300'} focus:outline-none focus:ring-2`}
                aria-invalid={!!fieldError('fecha_evento')}
                aria-describedby={fieldError('fecha_evento') ? 'error-fecha_evento' : undefined}
              />
              <button type="button" onClick={() => { const el = document.getElementById('evento-fecha'); if (el) { if (el._flatpickr) { el._flatpickr.open(); } else if (typeof el.showPicker === 'function') { el.showPicker(); } else { el.focus(); } } }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-app p-1" aria-label="Abrir calendario">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                  <path d="M16 2v4M8 2v4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              </div>
              {fieldError('fecha_evento') && <span id="error-fecha_evento" className="text-xs text-red-600">{fieldError('fecha_evento')}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="evento-hora" className="text-xs font-medium muted uppercase tracking-wide">Hora *</label>
              <input
                id="evento-hora"
                name="hora_evento"
                type="time"
                value={form.hora_evento}
                onChange={handleChange}
                onBlur={() => submitted && runValidation('field')}
                className={`w-full p-2 border rounded-lg text-sm ${fieldError('hora_evento') ? 'border-red-400 focus:ring-red-300' : 'border focus:ring-yellow-300'} focus:outline-none focus:ring-2`}
                aria-invalid={!!fieldError('hora_evento')}
                aria-describedby={fieldError('hora_evento') ? 'error-hora_evento' : undefined}
              />
              {fieldError('hora_evento') && <span id="error-hora_evento" className="text-xs text-red-600">{fieldError('hora_evento')}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="evento-lugar" className="text-xs font-medium muted uppercase tracking-wide">Lugar *</label>
              <input
                id="evento-lugar"
                name="lugar"
                type="text"
                value={form.lugar}
                onChange={handleChange}
                onBlur={() => submitted && runValidation('field')}
                className={`w-full p-2 border rounded-lg text-sm ${fieldError('lugar') ? 'border-red-400 focus:ring-red-300' : 'border focus:ring-yellow-300'} focus:outline-none focus:ring-2`}
                aria-invalid={!!fieldError('lugar')}
                aria-describedby={fieldError('lugar') ? 'error-lugar' : undefined}
                placeholder="Auditorio Principal"
              />
              {fieldError('lugar') && <span id="error-lugar" className="text-xs text-red-600">{fieldError('lugar')}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="evento-descripcion" className="text-xs font-medium muted uppercase tracking-wide">Descripción</label>
              <textarea
                id="evento-descripcion"
                name="descripcion"
                rows={3}
                value={form.descripcion}
                onChange={handleChange}
                onBlur={() => submitted && runValidation('field')}
                className="w-full p-2 border rounded-lg text-sm card focus:outline-none focus:ring-2 focus:ring-yellow-300"
                placeholder="Notas adicionales, invitados, repertorio..."
              />
            </div>
          </div>
        </fieldset>

        {/* Botones */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-[11px] muted">{isDirty ? 'Cambios sin guardar' : 'Sin cambios'}</span>
          <div className="flex gap-3">
            <Button type="button" variant="neutral" size="sm" onClick={requestCancel}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm" loading={saving} disabled={saving}>{data ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </div>
      </form>
      <ConfirmDialog
        open={showConfirmCancel}
        title="Descartar cambios"
        message="Tienes cambios sin guardar. ¿Seguro que deseas cerrar el formulario?"
        onCancel={() => setShowConfirmCancel(false)}
        onConfirm={confirmCancel}
      />
    </>
  );
}
