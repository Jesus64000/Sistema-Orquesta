//sistema-orquesta/sistema-orquesta/src/pages/Administracion.jsx
import React, { useState } from "react";
import ProgramasAdmin from "../components/Administracion/ProgramasAdmin";
import CategoriasAdmin from "../components/Administracion/CategoriasAdmin";
import UsuariosAdmin from "../components/Administracion/UsuariosAdmin";
import RolesAdmin from "../components/Administracion/RolesAdmin";
import EstadosAdmin from "../components/Administracion/EstadosAdmin";
import AyudaAdmin from "../components/Administracion/AyudaAdmin";
import ParentescosAdmin from "../components/Administracion/ParentescosAdmin";

const SECCIONES = [
  { key: "programas", label: "Programas" },
  { key: "categorias", label: "Categorías de instrumentos" },
  { key: "usuarios", label: "Usuarios" },
  { key: "roles", label: "Roles y permisos" },
  // { key: "instrumentos", label: "Instrumentos" },
  { key: "estados", label: "Estados de instrumentos" },
  // { key: "representantes", label: "Representantes" },
  // { key: "eventos", label: "Eventos" },
  { key: "parentescos", label: "Parentescos" },
  { key: "ayuda", label: "Ayuda / Documentación" },
];

export default function Administracion() {
  const [seccion, setSeccion] = useState(SECCIONES[0].key);

  return (
    <div className="flex h-full">
      {/* Menú lateral */}
      <aside className="w-64 bg-gray-50 border-r p-4 space-y-2">
        <h2 className="font-bold text-lg mb-4">Administración</h2>
        {SECCIONES.map((s) => (
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
