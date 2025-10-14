//sistema-orquesta/sistema-orquesta/src/pages/Administracion.jsx
import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProgramasAdmin from "../components/Administracion/ProgramasAdmin";
import CategoriasAdmin from "../components/Administracion/CategoriasAdmin";
import UsuariosAdmin from "../components/Administracion/UsuariosAdmin";
import RolesAdmin from "../components/Administracion/RolesAdmin";
import EstadosAdmin from "../components/Administracion/EstadosAdmin";
import AyudaAdmin from "../components/Administracion/AyudaAdmin";
import ParentescosAdmin from "../components/Administracion/ParentescosAdmin";

const SECCIONES = [
  { key: "programas", label: "Programas", permiso: ['programas','read'] },
  { key: "categorias", label: "Categorías de instrumentos", permiso: ['categorias','read'] },
  { key: "usuarios", label: "Usuarios", permiso: ['usuarios','read'] },
  { key: "roles", label: "Roles y permisos", permiso: ['roles','read'] },
  { key: "estados", label: "Estados de instrumentos", permiso: ['estados','read'] },
  { key: "parentescos", label: "Parentescos", permiso: ['parentescos','read'] },
  { key: "ayuda", label: "Ayuda / Documentación" },
];

export default function Administracion() {
  const { anyPermiso, user } = useAuth();
  const nivelAcceso = typeof user?.nivel_acceso === 'number' ? user.nivel_acceso : (String(user?.rol?.nombre || user?.rol || '').toLowerCase().includes('admin') ? 0 : 2);
  const visibles = useMemo(() => {
    if (nivelAcceso === 0) return SECCIONES;
    if (nivelAcceso === 2) return SECCIONES.filter(s => s.key === 'ayuda');
    // nivel 1: condicional por permisos; además, si tiene total en instrumentos o alumnos, desbloquear secciones relacionadas
    const base = SECCIONES.filter(s => !s.permiso || anyPermiso([s.permiso]));
    const perms = user?.permisos || [];
    const hasTotal = (r) => perms.includes('*:*') || perms.includes(`${r}:*`);
    const extra = new Set(base.map(s=>s.key));
    if (hasTotal('instrumentos')) {
      extra.add('categorias');
      extra.add('estados');
    }
    if (hasTotal('alumnos')) {
      extra.add('parentescos');
    }
    return SECCIONES.filter(s => extra.has(s.key));
  }, [anyPermiso, nivelAcceso, user]);
  const [seccion, setSeccion] = useState(visibles[0]?.key || 'ayuda');

  return (
    <div className="flex h-full">
      {/* Menú lateral */}
      <aside className="w-64 bg-gray-50 border-r p-4 space-y-2">
        <h2 className="font-bold text-lg mb-4">Administración</h2>
        {visibles.map((s) => (
          <button
            key={s.key}
            className={`block w-full text-left px-4 py-2 rounded transition font-medium ${
              seccion === s.key
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => setSeccion(s.key)}
          >
            {s.label}
          </button>
        ))}
      </aside>
      {/* Contenido */}
      <main className="flex-1 p-6 overflow-y-auto">
  {seccion === "programas" && <ProgramasAdmin />}
  {seccion === "categorias" && <CategoriasAdmin />}
  {seccion === "usuarios" && <UsuariosAdmin />}
  {seccion === "roles" && <RolesAdmin />}
  {/* {seccion === "instrumentos" && <InstrumentosAdmin />} */}
  {seccion === "estados" && <EstadosAdmin />}
  {/* {seccion === "representantes" && <RepresentantesAdmin />} */}
  {/* {seccion === "eventos" && <EventosAdmin />} */}
  {seccion === "parentescos" && <ParentescosAdmin />}
  {seccion === "ayuda" && <AyudaAdmin />}
      </main>
    </div>
  );
}
