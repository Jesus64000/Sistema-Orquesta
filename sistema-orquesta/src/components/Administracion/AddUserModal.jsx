import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../ui/Button';
import { createUsuario } from '../../api/administracion/usuarios';
import { getRoles } from '../../api/administracion/roles';

export default function AddUserModal({ open, onClose, onCreated, usuarios = [] }) {
  const [form, setForm] = useState({ nombre: '', email: '', id_rol: '', password: '' });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ if(open){ fetchRoles(); } }, [open]);

  const fetchRoles = async () => {
    try { const res = await getRoles(); setRoles(Array.isArray(res.data)?res.data:[]); } catch { setRoles([]); }
  };

  const validarEmail = (email)=> /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  const handleChange = e => setForm(f=>({...f, [e.target.name]: e.target.value }));

  const reset = () => { setForm({ nombre:'', email:'', id_rol:'', password:'' }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if(!form.nombre.trim()) return setError('Nombre requerido');
    if(!form.email.trim()) return setError('Email requerido');
    if(!validarEmail(form.email)) return setError('Email inválido');
    if(!form.id_rol) return setError('Rol requerido');
    if(!form.password) return setError('Contraseña requerida');
    const dup = usuarios.some(u => u.email?.toLowerCase() === form.email.trim().toLowerCase());
    if(dup) return setError('Ya existe un usuario con ese email');
    setLoading(true);
    try {
      await createUsuario({ nombre: form.nombre.trim(), email: form.email.trim().toLowerCase(), id_rol: form.id_rol, password: form.password });
      onCreated && onCreated();
      reset();
      onClose && onClose();
    } catch(err){
      setError(err?.response?.data?.error?.message || 'Error al crear');
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={()=>{ onClose(); reset(); }} title="Nuevo Usuario" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</div>}
        <div>
          <label className="block text-xs font-semibold mb-1">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Rol</label>
          <select name="id_rol" value={form.id_rol} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm">
            <option value="">Seleccione</option>
            {roles.map(r=>(<option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Contraseña</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={()=>{ onClose(); reset(); }} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>Crear</Button>
        </div>
      </form>
    </Modal>
  );
}
