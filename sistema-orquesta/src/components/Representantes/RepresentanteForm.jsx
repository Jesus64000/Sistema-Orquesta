import { useState, useEffect, useCallback } from 'react';
import { createRepresentante, updateRepresentante } from '../../api/representantes';
import toast from 'react-hot-toast';

// Formulario unificado para crear / editar Representante
// Teléfono fijo eliminado: sólo se maneja móvil.
export default function RepresentanteForm({ data, onSaved, onCancel }) {
  const [form, setForm] = useState({ nombre: '', apellido: '', ci: '', telefono_movil: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = useCallback((model = form) => {
    const errs = {};
    if (!model.nombre.trim()) errs.nombre = 'Requerido';
    if (!model.email.trim()) errs.email = 'Requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(model.email.trim())) errs.email = 'Formato inválido';
    if (model.telefono_movil && model.telefono_movil.replace(/\D/g,'').length < 10) errs.telefono_movil = 'Mínimo 10 dígitos';
    if (model.ci && !/^[VEJG]-?\d{5,}$/.test(model.ci.trim())) errs.ci = 'Formato sugerido V-12345678';
    return errs;
  }, [form]);

  useEffect(()=>{ setErrors(validate()); }, [form, validate]);

  useEffect(() => {
    if (data) setForm(f => ({
      ...f,
      nombre: data.nombre || '',
      apellido: data.apellido || '',
      ci: data.ci || '',
      telefono_movil: data.telefono_movil || '',
      email: data.email || ''
    }));
  }, [data]);

  const normalizeNombre = (v) => v.replace(/\s+/g,' ').replace(/(^|\s)\p{L}/gu, m => m.toUpperCase());
  const normalizeApellido = normalizeNombre;
  const normalizeMovil = v => v.replace(/[^0-9+]/g,'');

  const submit = async (e) => {
    e.preventDefault();
    const currentErrors = validate();
    setSubmitted(true);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length) {
      // No toast de error por campo; se muestran inline tras submit
      return;
    }
    try {
      setLoading(true);
      const payload = {
        nombre: normalizeNombre(form.nombre.trim()),
        apellido: form.apellido.trim() ? normalizeApellido(form.apellido.trim()) : null,
        ci: form.ci.trim() || null,
        telefono: null, // eliminado del UI
        telefono_movil: form.telefono_movil.trim() || null,
        email: form.email.trim(),
      };
      if (data) await updateRepresentante(data.id_representante, payload); else await createRepresentante(payload);
      toast.success(data ? 'Representante actualizado' : 'Representante creado');
      onSaved?.();
    } catch (err) {
      console.error(err);
      toast.error('Error guardando');
    } finally { setLoading(false); }
  };

  const showError = (field) => (submitted || touched[field]) && errors[field];
  return (
    <form onSubmit={submit} noValidate className="space-y-8 w-[520px]">
      {/* Sección: Identificación */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-5 rounded bg-yellow-400" aria-hidden="true" />
          <h3 className="text-xs font-bold tracking-wide uppercase text-gray-700">Identificación</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold tracking-wide uppercase text-gray-600 mb-1">Nombre *</label>
          <input
            placeholder="Ej: Carlos"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${showError('nombre') ? 'border-red-400 ring-red-300 focus:ring-red-400' : 'border-gray-300'}`}
            value={form.nombre}
            onChange={e=>setForm({...form,nombre:e.target.value})}
            onBlur={()=>setTouched(t=>({...t,nombre:true}))}
            aria-invalid={!!showError('nombre')}
            aria-describedby={showError('nombre') ? 'err-nombre' : undefined}
          />
          {showError('nombre') && <p id="err-nombre" className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
        </div>
        <div>
          <label className="block text-[11px] font-semibold tracking-wide uppercase text-gray-600 mb-1">Apellido</label>
          <input
            placeholder="Opcional"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={form.apellido}
            onChange={e=>setForm({...form,apellido:e.target.value})}
            onBlur={()=>setTouched(t=>({...t,apellido:true}))}
          />
        </div>
        </div>
        <div className="mt-4">
          <label className="block text-[11px] font-semibold tracking-wide uppercase text-gray-600 mb-1">CI</label>
          <input
            placeholder="V-12345678"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${showError('ci') ? 'border-red-400 ring-red-300 focus:ring-red-400' : 'border-gray-300'}`}
            value={form.ci}
            onChange={e=>setForm({...form,ci:e.target.value.toUpperCase()})}
            onBlur={()=>setTouched(t=>({...t,ci:true}))}
            aria-invalid={!!showError('ci')}
            aria-describedby={showError('ci') ? 'err-ci' : undefined}
          />
          <p className="mt-1 text-[10px] text-gray-500">Formato sugerido: V-12345678</p>
          {showError('ci') && <p id="err-ci" className="mt-1 text-xs text-red-600">{errors.ci}</p>}
        </div>
      </div>

      {/* Sección: Contacto */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-5 rounded bg-yellow-400" aria-hidden="true" />
          <h3 className="text-xs font-bold tracking-wide uppercase text-gray-700">Contacto</h3>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-[11px] font-semibold tracking-wide uppercase text-gray-600 mb-1">Teléfono móvil</label>
            <input
              placeholder="0412-1234567"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${showError('telefono_movil') ? 'border-red-400 ring-red-300 focus:ring-red-400' : 'border-gray-300'}`}
              value={form.telefono_movil}
              onChange={e=>setForm({...form,telefono_movil:normalizeMovil(e.target.value)})}
              onBlur={()=>setTouched(t=>({...t,telefono_movil:true}))}
              aria-invalid={!!showError('telefono_movil')}
              aria-describedby={showError('telefono_movil') ? 'err-movil' : undefined}
            />
            <p className="mt-1 text-[10px] text-gray-500">Formato sugerido: 0412-1234567</p>
            {showError('telefono_movil') && <p id="err-movil" className="mt-1 text-xs text-red-600">{errors.telefono_movil}</p>}
          </div>
          <div>
          <label className="block text-[11px] font-semibold tracking-wide uppercase text-gray-600 mb-1">Email *</label>
          <input
            placeholder="correo@dominio.com"
            type="email"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${showError('email') ? 'border-red-400 ring-red-300 focus:ring-red-400' : 'border-gray-300'}`}
            value={form.email}
            onChange={e=>setForm({...form,email:e.target.value})}
            onBlur={()=>setTouched(t=>({...t,email:true}))}
            aria-invalid={!!showError('email')}
            aria-describedby={showError('email') ? 'err-email' : undefined}
          />
          {showError('email') && <p id="err-email" className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
        </div>
      </div>
      {/* Errores mostrados solo tras intento de submit (submitted) o interacción individual */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
        >Cancelar</button>
        <button
          disabled={loading || (submitted && Object.keys(errors).length > 0)}
          className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 shadow-sm"
        >{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  );
}
