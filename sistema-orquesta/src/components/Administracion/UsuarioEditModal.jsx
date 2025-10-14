import React, { useEffect, useState } from "react";
import Modal from "../Modal";
import Button from "../ui/Button";
import { resetPassword } from "../../api/usuarios";
import { updateUsuario } from "../../api/administracion/usuarios";

export default function UsuarioEditModal({ open, onClose, usuario, roles = [], onSaved }) {
  const [form, setForm] = useState({ nombre: "", email: "", id_rol: "", password: "", nivel_acceso: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  useEffect(() => {
    if (usuario) {
	  setForm({ nombre: usuario.nombre || "", email: usuario.email || "", id_rol: usuario.id_rol || "", password: "", nivel_acceso: (usuario.nivel_acceso ?? "") });
    }
  }, [usuario]);

  const validarEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
    if (!form.email.trim() || !validarEmail(form.email)) return setError("Email inválido.");
    if (!form.id_rol) return setError("Debe seleccionar un rol.");
  // La contraseña manual se gestiona sólo vía reset o se ignora aquí (no la enviamos en updateUsuario).

    setLoading(true);
    try {
      const payload = { nombre: form.nombre, email: form.email, id_rol: form.id_rol };
      if (form.nivel_acceso !== "") {
        payload.nivel_acceso = Number(form.nivel_acceso);
      }
      // Si el backend soporta cambio de contraseña aquí, podríamos enviarla en otro endpoint.
      await updateUsuario(usuario.id_usuario, payload);
      onSaved?.();
    } catch {
      setError("Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  const doResetPassword = async () => {
    if (!usuario) return;
    const nueva = form.password?.trim();
    if (!nueva || nueva.length < 8) return setError("Ingresa la nueva contraseña (mínimo 8 caracteres) antes de resetear.");
    setLoading(true);
    setError("");
    setResetMsg("");
    try {
      await resetPassword(usuario.id_usuario, nueva);
      setResetMsg("Contraseña actualizada. El usuario ya puede ingresar con la nueva contraseña.");
      setForm(f => ({ ...f, password: "" }));
      onSaved?.();
    } catch {
      setError("No se pudo resetear la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} title={`Editar usuario`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-700 font-semibold mb-1">Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-300" />
          </div>
          <div>
            <label className="block text-xs text-gray-700 font-semibold mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-300" />
          </div>
          <div>
            <label className="block text-xs text-gray-700 font-semibold mb-1">Rol</label>
            <select name="id_rol" value={form.id_rol} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-300">
              <option value="">Seleccione</option>
              {roles.map((r) => (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-700 font-semibold mb-1">Nivel acceso</label>
            <select
              name="nivel_acceso"
              value={form.nivel_acceso}
              onChange={handleChange}
              disabled={usuario?.nivel_acceso === 0}
              className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">(auto por rol)</option>
              <option value="1">1 - Supervisor</option>
              <option value="2">2 - Básico</option>
            </select>
            {usuario?.nivel_acceso === 0 && (
              <p className="text-[11px] text-gray-500 mt-1">Nivel 0 (Admin) no modificable aquí.</p>
            )}
            {usuario?.nivel_acceso !== 0 && (
              <p className="text-[11px] text-gray-500 mt-1">Solo se puede asignar 1 (Supervisor) o 2 (Básico).</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-700 font-semibold mb-1">Nueva contraseña (para reset)</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Ingresa la nueva contraseña del usuario" className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-300" />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[11px] text-gray-600">Escribe la nueva contraseña y pulsa Resetear.</p>
              <button type="button" onClick={doResetPassword} disabled={loading} className="px-3 h-8 inline-flex items-center rounded-full text-[12px] font-medium border bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800 border-gray-300 hover:from-white hover:to-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-50">{loading ? '...' : 'Resetear'}</button>
            </div>
            {resetMsg && <p className="mt-2 text-xs text-green-600">{resetMsg}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={loading} disabled={loading}>Guardar</Button>
        </div>
      </form>
    </Modal>
  );
}
