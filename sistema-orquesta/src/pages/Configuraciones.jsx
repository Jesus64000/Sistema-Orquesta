// Página de ajustes personales del usuario
import { useEffect, useState } from "react";
import { Settings, Lock, User, Eye } from "lucide-react";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { updatePerfil, changePassword } from "../api/usuarios";

export default function Configuraciones() {
  const { user, refresh } = useAuth();
  const [perfil, setPerfil] = useState({ nombre: "", email: "" });
  const [clave, setClave] = useState({ actual: "", nueva: "", repetir: "" });
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [savingClave, setSavingClave] = useState(false);

  useEffect(() => {
    if (user) {
      setPerfil({ nombre: user.nombre || "", email: user.email || "" });
    }
  }, [user]);

  const guardarPerfil = async (e) => {
    e?.preventDefault?.();
    setSavingPerfil(true);
    try {
      await updatePerfil({ nombre: perfil.nombre, email: perfil.email });
      toast.success("Perfil actualizado");
      await refresh?.({ force: true });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Error al actualizar perfil");
    } finally {
      setSavingPerfil(false);
    }
  };

  const cambiarClave = async (e) => {
    e?.preventDefault?.();
    if (!clave.actual?.trim()) { toast.error('Ingresa tu contraseña actual'); return; }
    if (!clave.nueva || clave.nueva !== clave.repetir) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setSavingClave(true);
    try {
      await changePassword({ actual: clave.actual, nueva: clave.nueva });
      toast.success("Contraseña actualizada");
      setClave({ actual: "", nueva: "", repetir: "" });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Error al cambiar contraseña");
    } finally {
      setSavingClave(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" /> Configuración de la cuenta
        </h1>
      </div>

      {/* Perfil */}
      <section className="bg-white border rounded-2xl shadow-sm p-5">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3"><User className="h-5 w-5"/> Perfil</h2>
        <form onSubmit={guardarPerfil} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nombre</label>
            <input className="w-full border rounded px-3 py-2" value={perfil.nombre} onChange={(e)=>setPerfil(p=>({...p, nombre: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" value={perfil.email} onChange={(e)=>setPerfil(p=>({...p, email: e.target.value}))} required />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" variant="primary" disabled={savingPerfil}>{savingPerfil? 'Guardando…':'Guardar cambios'}</Button>
          </div>
        </form>
      </section>

      {/* Contraseña */}
      <section className="bg-white border rounded-2xl shadow-sm p-5">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3"><Lock className="h-5 w-5"/> Seguridad</h2>
        <form onSubmit={cambiarClave} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Contraseña actual</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={clave.actual} onChange={(e)=>setClave(s=>({...s, actual: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nueva contraseña</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={clave.nueva} onChange={(e)=>setClave(s=>({...s, nueva: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Repetir contraseña</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={clave.repetir} onChange={(e)=>setClave(s=>({...s, repetir: e.target.value}))} required />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <Button type="submit" variant="secondary" disabled={savingClave}>{savingClave? 'Guardando…':'Actualizar contraseña'}</Button>
          </div>
        </form>
      </section>

      {/* Apariencia */}
      <section className="bg-white border rounded-2xl shadow-sm p-5">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3"><Eye className="h-5 w-5"/> Apariencia</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Tema</label>
            <select className="w-full border rounded px-3 py-2" defaultValue={localStorage.getItem('ui_theme') || 'system'} onChange={(e)=>{ localStorage.setItem('ui_theme', e.target.value); document.documentElement.dataset.theme = e.target.value; }}>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="system">Sistema</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Contraste</label>
            <select className="w-full border rounded px-3 py-2" defaultValue={localStorage.getItem('ui_contrast') || 'normal'} onChange={(e)=>{ localStorage.setItem('ui_contrast', e.target.value); document.documentElement.dataset.contrast = e.target.value; }}>
              <option value="normal">Normal</option>
              <option value="high">Alto</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Tamaño de fuente</label>
            <select className="w-full border rounded px-3 py-2" defaultValue={localStorage.getItem('ui_font') || 'md'} onChange={(e)=>{ localStorage.setItem('ui_font', e.target.value); document.documentElement.dataset.font = e.target.value; }}>
              <option value="sm">Pequeña</option>
              <option value="md">Mediana</option>
              <option value="lg">Grande</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}
