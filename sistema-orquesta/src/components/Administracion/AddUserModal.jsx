import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../ui/Button';
import { createUsuario } from '../../api/administracion/usuarios';
import { getRoles } from '../../api/administracion/roles';

export default function AddUserModal({ open, onClose, onCreated, usuarios = [] }) {
  const [form, setForm] = useState({ nombre: '', email: '', id_rol: '', password: '', nivel_acceso: null });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(()=>{ if(open){ fetchRoles(); } }, [open]);

  const fetchRoles = async () => {
    try { const res = await getRoles(); setRoles(Array.isArray(res.data)?res.data:[]); } catch { setRoles([]); }
  };

  const validarEmail = (email)=> /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  const handleChange = e => setForm(f=>({...f, [e.target.name]: e.target.value }));

  const reset = () => { setForm({ nombre:'', email:'', id_rol:'', password:'', nivel_acceso: null }); setError(''); setSubmitted(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitted(true);
    // Validación de campos
    const ok = form.nombre.trim() && form.email.trim() && validarEmail(form.email) && form.id_rol && form.password && form.password.length >= 6 && (form.nivel_acceso===1 || form.nivel_acceso===2);
    if(!ok) return;
    const dup = usuarios.some(u => u.email?.toLowerCase() === form.email.trim().toLowerCase());
    if(dup) return setError('Ya existe un usuario con ese email');
    setLoading(true);
    try {
  await createUsuario({ nombre: form.nombre.trim(), email: form.email.trim().toLowerCase(), id_rol: form.id_rol, password: form.password, nivel_acceso: form.nivel_acceso });
      onCreated && onCreated();
      reset();
      onClose && onClose();
    } catch(err){
      setError(err?.response?.data?.error?.message || 'Error al crear');
    }
    setLoading(false);
  };

  // Validación en vivo para deshabilitar enviar hasta que todo sea válido
  const emailOk = form.email.trim() && validarEmail(form.email);
  const isValid = Boolean(
    form.nombre.trim() &&
    emailOk &&
    form.id_rol &&
    form.password && form.password.length >= 6 &&
    (form.nivel_acceso === 1 || form.nivel_acceso === 2)
  );

  return (
    <Modal open={open} onClose={()=>{ onClose(); reset(); }} title="Nuevo Usuario" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</div>}
        <div>
          <label className="block text-xs font-semibold muted mb-1" htmlFor="adduser-nombre">Nombre</label>
          <input id="adduser-nombre" name="nombre" value={form.nombre} onChange={handleChange} className={`w-full card rounded px-3 py-2 text-sm ${submitted && !form.nombre.trim() ? 'border border-red-400' : ''}`} aria-invalid={submitted && !form.nombre.trim()} aria-describedby={submitted && !form.nombre.trim() ? 'err-nombre' : undefined} />
          {submitted && !form.nombre.trim() && (<p id="err-nombre" className="text-xs text-red-500 mt-1">El nombre es obligatorio.</p>)}
        </div>
        <div>
          <label className="block text-xs font-semibold muted mb-1" htmlFor="adduser-email">Email</label>
          <input id="adduser-email" name="email" type="email" value={form.email} onChange={handleChange} className={`w-full card rounded px-3 py-2 text-sm ${submitted && (!form.email.trim() || !validarEmail(form.email)) ? 'border border-red-400' : ''}`} aria-invalid={submitted && (!form.email.trim() || !validarEmail(form.email))} aria-describedby={submitted && (!form.email.trim() || !validarEmail(form.email)) ? 'err-email' : undefined} />
          {submitted && (!form.email.trim() || !validarEmail(form.email)) && (<p id="err-email" className="text-xs text-red-500 mt-1">Ingresa un email válido.</p>)}
        </div>
        <div>
          <label className="block text-xs font-semibold muted mb-1" htmlFor="adduser-rol">Rol</label>
          <select id="adduser-rol" name="id_rol" value={form.id_rol} onChange={handleChange} className={`w-full card rounded px-3 py-2 text-sm ${submitted && !form.id_rol ? 'border border-red-400' : ''}`} aria-invalid={submitted && !form.id_rol} aria-describedby={submitted && !form.id_rol ? 'err-rol' : undefined}>
            <option value="">Seleccione</option>
            {roles.map(r=>(<option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>))}
          </select>
          {submitted && !form.id_rol && (<p id="err-rol" className="text-xs text-red-500 mt-1">Debes seleccionar un rol.</p>)}
        </div>
        <div>
          <label className="block text-xs font-semibold muted mb-1" htmlFor="adduser-pass">Contraseña</label>
          <input id="adduser-pass" name="password" type="password" value={form.password} onChange={handleChange} className={`w-full card rounded px-3 py-2 text-sm ${submitted && (!form.password || form.password.length < 6) ? 'border border-red-400' : ''}`} aria-invalid={submitted && (!form.password || form.password.length < 6)} aria-describedby={submitted && (!form.password || form.password.length < 6) ? 'err-pass' : undefined} />
          {submitted && (!form.password || form.password.length < 6) && (<p id="err-pass" className="text-xs text-red-500 mt-1">La contraseña debe tener al menos 6 caracteres.</p>)}
        </div>
        <div>
          <label className="block text-xs font-semibold muted mb-1">Nivel de acceso</label>
          <div className="flex gap-3">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="nivel" checked={form.nivel_acceso===1} onChange={()=>setForm(f=>({...f, nivel_acceso:1}))} />
              <span className="text-sm">1 - Administración según permisos</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="nivel" checked={form.nivel_acceso===2} onChange={()=>setForm(f=>({...f, nivel_acceso:2}))} />
              <span className="text-sm">2 - Sin acceso a Administración</span>
            </label>
          </div>
          {submitted && (form.nivel_acceso!==1 && form.nivel_acceso!==2) && (<p className="text-xs text-red-500 mt-1">Selecciona un nivel de acceso.</p>)}
          <p className="text-[11px] muted mt-1">El nivel 0 está reservado para Administrador.</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={()=>{ onClose(); reset(); }} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading || !isValid}>Crear</Button>
        </div>
      </form>
    </Modal>
  );
}
