import React, { useEffect, useState } from 'react';
import { listCargos } from '../../api/cargos';
import { getProgramas } from '../../api/programas';
import Button from '../ui/Button';
import { toDateInputValue } from '../../utils/date';

export default function PersonalForm({ initialValue, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(() => ({
    ci: '', nombres: '', apellidos: '', email: '', telefono: '', direccion: '',
    fecha_nacimiento: '', fecha_ingreso: '', id_cargo: '', id_programa: '', carga_horaria: 0, estado: 'ACTIVO'
  }));
  const [cargos, setCargos] = useState([]);
  const [programas, setProgramas] = useState([]);

  useEffect(() => {
    if (initialValue) {
      setForm(f => ({
        ...f,
        ...initialValue,
        fecha_nacimiento: toDateInputValue(initialValue.fecha_nacimiento),
        fecha_ingreso: toDateInputValue(initialValue.fecha_ingreso),
      }));
    }
  }, [initialValue]);

  useEffect(() => {
    (async () => {
      try { const cs = await listCargos(); setCargos(cs || []); } catch { /* noop */ }
      try { const ps = await getProgramas(); setProgramas(ps || []); } catch { /* noop */ }
    })();
  }, []);

  const onChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const onChangeNombre = (k) => (e) => {
    const filtered = e.target.value.replace(/[^\p{L}\s]/gu, '').replace(/\s{2,}/g, ' ');
    setForm(f => ({ ...f, [k]: filtered }));
  };
  const onChangeTelefono = (e) => {
    const raw = e.target.value;
    let v = raw.replace(/[^\d+]/g, '');
    if (v.startsWith('+')) v = '+' + v.slice(1).replace(/\+/g, '');
    else v = v.replace(/\+/g, '');
    setForm(f => ({ ...f, telefono: v }));
  };
  const onChangeCi = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    setForm(f => ({ ...f, ci: digits }));
  };
  const isEdit = !!(initialValue && initialValue.id_personal);

  const submit = (e) => { e.preventDefault(); onSubmit && onSubmit(form); };

  return (
    <form onSubmit={submit} className="space-y-6">
      <fieldset className="space-y-5" aria-labelledby="legend-datos-basicos">
        <legend id="legend-datos-basicos" className="sr-only">Datos básicos</legend>
        <h3 aria-hidden="true" className="text-sm font-semibold text-app tracking-wide flex items-center gap-2">
          <span className="inline-block h-5 w-1 rounded bg-yellow-400" /> Datos básicos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
          <span className="label">Nombres</span>
            <input value={form.nombres} onChange={onChangeNombre('nombres')} className="w-full px-3 py-2 border rounded-lg text-sm card focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
        </label>
        <label className="flex flex-col">
          <span className="label">Apellidos</span>
            <input value={form.apellidos} onChange={onChangeNombre('apellidos')} className="w-full px-3 py-2 border rounded-lg text-sm card focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
        </label>
          <label className="flex flex-col">
            <span className="label">CI</span>
            <input value={form.ci} inputMode="numeric" onChange={onChangeCi} className="w-full px-3 py-2 border rounded-lg text-sm card focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
          </label>
          <label className="flex flex-col">
            <span className="label">Email</span>
            <input type="email" value={form.email} onChange={onChange('email')} className="w-full px-3 py-2 border rounded-lg text-sm card focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
          </label>
        <label className="flex flex-col">
          <span className="label">Teléfono</span>
            <input value={form.telefono} inputMode="tel" onChange={onChangeTelefono} className="w-full px-3 py-2 border rounded-lg text-sm card focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
        </label>
        <label className="flex flex-col md:col-span-2">
          <span className="label">Dirección</span>
            <input value={form.direccion} onChange={onChange('direccion')} className="w-full px-3 py-2 border rounded-lg text-sm card focus:outline-none focus:ring-2 focus:ring-yellow-400" />
        </label>
        <label className="flex flex-col">
          <span className="label">Fecha nacimiento</span>
            <div className="relative">
              <input
                id="personal-fecha-nacimiento"
                type="date"
                value={form.fecha_nacimiento}
                onChange={onChange('fecha_nacimiento')}
                className="w-full px-3 py-2 pr-10 border rounded-lg text-sm card focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="button"
                onClick={() => {
                  const el = document.querySelector('#personal-fecha-nacimiento');
                  if (!el) return;
                  try { if (typeof el.showPicker === 'function') { el.showPicker(); } else { el.focus(); } } catch { el.focus(); }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-app p-1"
                aria-label="Abrir calendario"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                  <path d="M16 2v4M8 2v4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
        </label>
        <label className="flex flex-col">
          <span className="label">Fecha ingreso</span>
            <div className="relative">
              <input
                id="personal-fecha-ingreso"
                type="date"
                value={form.fecha_ingreso}
                onChange={onChange('fecha_ingreso')}
                className="w-full px-3 py-2 pr-10 border rounded-lg text-sm card focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="button"
                onClick={() => {
                  const el = document.querySelector('#personal-fecha-ingreso');
                  if (!el) return;
                  try { if (typeof el.showPicker === 'function') { el.showPicker(); } else { el.focus(); } } catch { el.focus(); }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-app p-1"
                aria-label="Abrir calendario"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                  <path d="M16 2v4M8 2v4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
        </label>
        </div>
      </fieldset>

      <fieldset className="space-y-5" aria-labelledby="legend-asignacion">
        <legend id="legend-asignacion" className="sr-only">Asignación</legend>
        <h3 aria-hidden="true" className="text-sm font-semibold text-app tracking-wide flex items-center gap-2">
          <span className="inline-block h-5 w-1 rounded bg-yellow-400" /> Asignación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col">
            <span className="label">Carga horaria (h/sem)</span>
            <input type="number" min="0" max="60" value={form.carga_horaria} onChange={(e)=>setForm(f=>({...f, carga_horaria: Number(e.target.value)}))} className="input" required />
          </label>
          <label className="flex flex-col">
            <span className="label">Estado</span>
            <select value={form.estado} onChange={onChange('estado')} disabled={!isEdit} className="w-full p-2 border rounded-lg text-sm card text-app disabled:opacity-60 disabled:cursor-not-allowed">
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
              <option value="SUSPENDIDO">SUSPENDIDO</option>
              <option value="PERMISO">PERMISO</option>
            </select>
          </label>
          <label className="flex flex-col">
            <span className="label">Programa</span>
            <select value={form.id_programa} onChange={onChange('id_programa')} className="w-full p-2 border rounded-lg text-sm card text-app">
              <option value="">Selecciona…</option>
              {(Array.isArray(programas) ? programas : []).map(p => (
                <option key={p.id_programa} value={p.id_programa}>{p.nombre}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            <span className="label">Cargo</span>
            <select value={form.id_cargo} onChange={onChange('id_cargo')} className="w-full p-2 border rounded-lg text-sm card text-app" required>
              <option value="">Selecciona…</option>
              {(Array.isArray(cargos) ? cargos : []).map(c => (
                <option key={c.id_cargo} value={c.id_cargo}>{c.nombre}</option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <div className="h-4" aria-hidden="true"></div>
      <div className="sticky bottom-0 left-0 right-0 card-90 border-t mt-2">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 order-2 sm:order-1">
            <Button type="button" variant="neutral" onClick={onCancel}>Cancelar</Button>
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <Button type="submit" variant="primary" disabled={submitting} loading={submitting} className="min-w-[140px]">
              {submitting ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
