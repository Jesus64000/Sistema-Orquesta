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
import CargosAdmin from "../components/Administracion/CargosAdmin.jsx";
import Personalizacion from "../components/Administracion/Personalizacion";
import IdentidadVisual from "../components/Administracion/IdentidadVisual.jsx";

// Cada sección puede definir múltiples permisos alternativos (OR):
// Ej: permisos: [["instrumentos","read"],["instrumentos","update"]]
const SECCIONES = [
  { key: "programas", label: "Programas", permisos: [["programas","read"]] },
  { key: "categorias", label: "Categorías de instrumentos", permisos: [["instrumentos","read"],["instrumentos","update"],["instrumentos","create"]] },
  { key: "usuarios", label: "Usuarios", permisos: [["usuarios","read"]] },
  { key: "roles", label: "Roles y permisos", permisos: [["roles","read"]] },
  { key: "estados", label: "Estados de instrumentos", permisos: [["instrumentos","read"],["instrumentos","update"],["instrumentos","create"]] },
  { key: "parentescos", label: "Parentescos", permisos: [["representantes","read"],["representantes","update"],["representantes","create"]] },
  { key: "cargos", label: "Cargos (personal)", permisos: [["personal","read"],["personal","update"],["personal","create"]] },
  { key: "personalizacion", label: "Personalización", permisos: [["personalizacion","read"]] },
  { key: "identidad", label: "Identidad visual", permisos: [["identidad","read"]] },
  { key: "ayuda", label: "Ayuda / Documentación" },
];

export default function Administracion() {
  const { anyPermiso, user } = useAuth();
  const nivelAcceso = typeof user?.nivel_acceso === 'number' ? user.nivel_acceso : (String(user?.rol?.nombre || user?.rol || '').toLowerCase().includes('admin') ? 0 : 2);
  const visibles = useMemo(() => {
    if (nivelAcceso === 0) return SECCIONES;
    if (nivelAcceso === 2) return SECCIONES.filter(s => s.key === 'ayuda');
    // nivel 1: mostrar secciones según permisos declarados
    return SECCIONES.filter(s => !s.permisos || anyPermiso(s.permisos));
  }, [anyPermiso, nivelAcceso]);
  const [seccion, setSeccion] = useState(visibles[0]?.key || 'ayuda');

  return (
    <div className="flex h-full">
      {/* Menú lateral */}
      <aside className="w-64 admin-aside">
        <h2 className="font-bold text-lg mb-4">Administración</h2>
        {visibles.map((s) => (
          <button
            key={s.key}
            className={`admin-item ${seccion === s.key ? 'active' : ''}`}
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
  {seccion === "personalizacion" && <Personalizacion />}
  {seccion === "identidad" && <IdentidadVisual />}
  {/* {seccion === "representantes" && <RepresentantesAdmin />} */}
  {/* {seccion === "eventos" && <EventosAdmin />} */}
  {seccion === "parentescos" && <ParentescosAdmin />}
  {seccion === "cargos" && <CargosAdmin />}
  {seccion === "ayuda" && <AyudaAdmin />}
      </main>
    </div>
  );
}
