import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../ui/Button';
import { changeUsuarioPassword } from '../../api/administracion/usuarios';

export default function UserPasswordModal({ open, onClose, user, onChanged }) {
  const [form, setForm] = useState({ current_password:'', new_password:'', confirm_password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(()=>{ if(open){ setForm({ current_password:'', new_password:'', confirm_password:'' }); setError(''); } }, [open]);

  const handleChange = e => setForm(f=>({...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if(!form.current_password) return setError('Contraseña actual requerida');
    if(!form.new_password) return setError('Nueva contraseña requerida');
    if(form.new_password.length < 6) return setError('Mínimo 6 caracteres');
    if(form.new_password !== form.confirm_password) return setError('Las contraseñas no coinciden');
    setLoading(true);
    try {
      await changeUsuarioPassword(user.id_usuario, form);
      onChanged && onChanged();
      onClose();
    } catch(err){
      setError(err?.response?.data?.error?.message || 'Error al cambiar contraseña');
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Cambiar contraseña: ${user?.nombre || ''}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</div>}
        <div>
          <label className="block text-xs font-semibold mb-1">Contraseña actual</label>
          <input type="password" name="current_password" value={form.current_password} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Nueva contraseña</label>
          <input type="password" name="new_password" value={form.new_password} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Confirmar nueva contraseña</label>
          <input type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>Guardar</Button>
        </div>
      </form>
    </Modal>
  );
}
