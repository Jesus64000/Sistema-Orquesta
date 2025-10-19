// src/components/InstrumentoForm.jsx

import { useState, useEffect, useRef } from "react";
import Button from '../ui/Button';
import ConfirmDialog from '../ConfirmDialog';
import { createInstrumento, updateInstrumento } from "../../api/instrumentos";
import { getCategorias } from "../../api/administracion/categorias";
import { getEstados } from "../../api/administracion/estados";
import toast from "react-hot-toast";
import { validateInstrumentoForm, calcularAntiguedad } from './utils/instrumentoFormUtils';


function formatDateToInput(dateStr) {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toISOString().slice(0, 10);
}

export default function InstrumentoForm({ data, onCancel, onSaved }) {
  const [form, setForm] = useState(
    data
      ? {
          ...data,
          id_categoria: data.id_categoria || "",
          id_estado: data.id_estado || "",
          fecha_adquisicion: formatDateToInput(data.fecha_adquisicion),
        }
      : {
          nombre: "",
          id_categoria: "",
          numero_serie: "",
          id_estado: "",
          fecha_adquisicion: "",
          ubicacion: "",
        }
  );
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [errors, setErrors] = useState({});
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const initialSnapshotRef = useRef(JSON.stringify(form));
  const errorSummaryRef = useRef(null);

  const antiguedad = calcularAntiguedad(form.fecha_adquisicion);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await getCategorias();
        setCategorias(Array.isArray(res.data) ? res.data : []);
      } catch {
        setCategorias([]);
      }
    };
    const fetchEstados = async () => {
      try {
        const res = await getEstados();
        setEstados(Array.isArray(res.data) ? res.data : []);
      } catch {
        setEstados([]);
      }
    };
    fetchCategorias();
    fetchEstados();
  }, []);

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        id_categoria: data.id_categoria || "",
        id_estado: data.id_estado || "",
        fecha_adquisicion: formatDateToInput(data.fecha_adquisicion),
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isDirty = JSON.stringify(form) !== initialSnapshotRef.current;

  const focusFirstError = (errs) => {
    const keys = Object.keys(errs);
    if (keys.length === 0) return;
    const first = keys[0];
    const el = document.querySelector(`[name="${first}"]`);
    if (el) el.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: vErrors, isValid, normalizado } = validateInstrumentoForm(form);
    setErrors(vErrors);
    if (!isValid) {
      if (errorSummaryRef.current) {
        errorSummaryRef.current.textContent = `Se encontraron ${Object.keys(vErrors).length} errores en el formulario`;
      }
      focusFirstError(vErrors);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...normalizado,
        id_categoria: normalizado.id_categoria,
        id_estado: normalizado.id_estado,
      };
      if (data) {
        await updateInstrumento(data.id_instrumento, payload);
        toast.success("Instrumento actualizado");
      } else {
        await createInstrumento(payload);
        toast.success("Instrumento creado");
      }
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Error guardando instrumento");
    } finally {
      setLoading(false);
    }
  };

  const requestCancel = () => {
    if (isDirty) setShowConfirmCancel(true); else onCancel();
  };

  const confirmCancel = () => {
    setShowConfirmCancel(false);
    onCancel();
  };

  return (
    <>
      <div ref={errorSummaryRef} aria-live="polite" className="sr-only" />
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Sección Identificación */}
        <fieldset className="border rounded-xl p-4 card-90">
          <legend className="px-2 text-sm font-semibold text-app">Identificación</legend>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="nombre" className="text-xs font-medium muted uppercase tracking-wide">Nombre *</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className={`w-full p-2 border rounded-lg text-sm card ${errors.nombre ? 'border-red-400 focus:ring-red-300' : 'border focus:ring-yellow-300'} focus:outline-none focus:ring-2`}
                aria-invalid={!!errors.nombre}
                aria-describedby={errors.nombre ? 'error-nombre' : undefined}
                placeholder="Ej: Violín 3/4"
              />
              {errors.nombre && <span id="error-nombre" className="text-xs text-red-600">{errors.nombre}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="numero_serie" className="text-xs font-medium muted uppercase tracking-wide">Número de serie *</label>
              <input
                id="numero_serie"
                name="numero_serie"
                type="text"
                value={form.numero_serie}
                onChange={(e) => handleChange("numero_serie", e.target.value)}
                className={`w-full p-2 border rounded-lg text-sm card ${errors.numero_serie ? 'border-red-400 focus:ring-red-300' : 'border focus:ring-yellow-300'} focus:outline-none focus:ring-2`}
                aria-invalid={!!errors.numero_serie}
                aria-describedby={errors.numero_serie ? 'error-numero_serie' : undefined}
                placeholder="Serie..."
              />
              {errors.numero_serie && <span id="error-numero_serie" className="text-xs text-red-600">{errors.numero_serie}</span>}
            </div>
          </div>
        </fieldset>

        {/* Sección Clasificación */}
        <fieldset className="border rounded-xl p-4 card-90">
          <legend className="px-2 text-sm font-semibold text-app">Clasificación</legend>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="id_categoria" className="text-xs font-medium muted uppercase tracking-wide">Categoría *</label>
              <select
                id="id_categoria"
                name="id_categoria"
                value={form.id_categoria}
                onChange={(e) => handleChange("id_categoria", e.target.value)}
                className={`w-full p-2 border rounded-lg text-sm card ${errors.id_categoria ? 'border-red-400 focus:ring-red-300' : 'border focus:ring-yellow-300'} focus:outline-none focus:ring-2`}
                aria-invalid={!!errors.id_categoria}
                aria-describedby={errors.id_categoria ? 'error-id_categoria' : undefined}
              >
                <option value="">Selecciona...</option>
                {categorias.map(cat => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>)}
              </select>
              {errors.id_categoria && <span id="error-id_categoria" className="text-xs text-red-600">{errors.id_categoria}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="id_estado" className="text-xs font-medium muted uppercase tracking-wide">Estado *</label>
              <select
                id="id_estado"
                name="id_estado"
                value={form.id_estado}
                onChange={(e) => handleChange("id_estado", e.target.value)}
                className={`w-full p-2 border rounded-lg text-sm card ${errors.id_estado ? 'border-red-400 focus:ring-red-300' : 'border focus:ring-yellow-300'} focus:outline-none focus:ring-2`}
                aria-invalid={!!errors.id_estado}
                aria-describedby={errors.id_estado ? 'error-id_estado' : undefined}
              >
                <option value="">Selecciona...</option>
                {estados.map(est => <option key={est.id_estado} value={est.id_estado}>{est.nombre}</option>)}
              </select>
              {errors.id_estado && <span id="error-id_estado" className="text-xs text-red-600">{errors.id_estado}</span>}
            </div>
          </div>
        </fieldset>

        {/* Sección Estado y Ubicación */}
        <fieldset className="border rounded-xl p-4 card-90">
          <legend className="px-2 text-sm font-semibold text-gray-700">Estado y Ubicación</legend>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="fecha_adquisicion" className="text-xs font-medium muted uppercase tracking-wide">Fecha adquisición</label>
              <div className="relative">
                <input
                  id="fecha_adquisicion"
                  name="fecha_adquisicion"
                  type="date"
                  value={form.fecha_adquisicion || ''}
                  onChange={(e) => handleChange('fecha_adquisicion', e.target.value)}
                  className={`w-full p-2 pr-10 border rounded-lg text-sm card ${errors.fecha_adquisicion ? 'border-red-400 focus:ring-red-300' : 'border focus:ring-yellow-300'} focus:outline-none focus:ring-2`}
                />
                <button type="button" onClick={() => { const el = document.querySelector('#fecha_adquisicion'); if (el) { el.showPicker?.() || el.focus(); } }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-app p-1" aria-label="Abrir calendario">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                    <path d="M16 2v4M8 2v4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              {errors.fecha_adquisicion && <span id="error-fecha_adquisicion" className="text-xs text-red-600">{errors.fecha_adquisicion}</span>}
              {antiguedad !== null && <span className="text-[11px] muted">Antigüedad: {antiguedad} {antiguedad === 1 ? 'año' : 'años'}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="ubicacion" className="text-xs font-medium text-gray-600 uppercase tracking-wide">Ubicación</label>
              <input
                id="ubicacion"
                name="ubicacion"
                type="text"
                value={form.ubicacion}
                onChange={(e) => handleChange("ubicacion", e.target.value)}
                className={`w-full p-2 border rounded-lg text-sm ${errors.ubicacion ? 'border-red-400 focus:ring-red-300' : 'border focus:ring-yellow-300'} focus:outline-none focus:ring-2`}
                aria-invalid={!!errors.ubicacion}
                aria-describedby={errors.ubicacion ? 'error-ubicacion' : undefined}
                placeholder="Sala 1, Depósito..."
              />
              {errors.ubicacion && <span id="error-ubicacion" className="text-xs text-red-600">{errors.ubicacion}</span>}
            </div>
          </div>
        </fieldset>

        {/* Acciones */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-[11px] muted">{isDirty ? 'Cambios sin guardar' : 'Sin cambios'}</span>
          <div className="flex gap-3">
            <Button type="button" variant="neutral" onClick={requestCancel}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>{data ? 'Actualizar' : 'Crear'}</Button>
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