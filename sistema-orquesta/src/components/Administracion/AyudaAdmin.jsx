import React from "react";

export default function AyudaAdmin() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ayuda y Documentación Interna</h2>
      <div className="prose max-w-2xl">
        <h3>Manual de Administración</h3>
        <ul>
          <li>Utilice el menú lateral para navegar entre las entidades a gestionar.</li>
          <li>En cada sección puede agregar, editar o eliminar registros.</li>
          <li>Los campos resaltados en amarillo son obligatorios o importantes.</li>
          <li>Consulte la documentación técnica en la carpeta <code>docs/</code> del proyecto para detalles avanzados.</li>
        </ul>
        <h3>Soporte</h3>
        <p>Para soporte técnico, contacte al administrador del sistema o consulte la documentación interna.</p>
      </div>
    </div>
  );
}
