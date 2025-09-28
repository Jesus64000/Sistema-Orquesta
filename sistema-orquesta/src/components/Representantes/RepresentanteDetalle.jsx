export default function RepresentanteDetalle({ rep }) {
  if (!rep) return null;
  return (
    <div className="space-y-4 text-sm w-[420px]">
      <div>
        <h3 className="text-base font-semibold">{rep.nombre}</h3>
        <p className="text-xs text-gray-500">Detalle del representante</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Teléfono</p>
          <p className="font-medium">{rep.telefono || '—'}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Email</p>
          <p className="font-medium break-all">{rep.email || '—'}</p>
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Alumnos asociados</p>
        {rep.alumnos && rep.alumnos.length > 0 ? (
          <ul className="list-disc ml-5 space-y-1">
            {rep.alumnos.map(a => <li key={a.id_alumno}>{a.nombre}</li>)}
          </ul>
        ) : <p className="text-gray-500 text-xs">Ninguno</p>}
      </div>
    </div>
  );
}
