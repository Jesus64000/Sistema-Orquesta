import { formatDateDisplay } from '../../utils/date';

export default function PersonalDetalle({ p }) {
  if (!p) return null;
  return (
    <div className="space-y-4 text-sm w-[460px]">
      <div>
        <h3 className="text-base font-semibold">{p.nombres} {p.apellidos}</h3>
        <p className="text-xs text-gray-500">Detalle de personal</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">CI</p>
          <p className="font-medium">{p.ci || '—'}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Email</p>
          <p className="font-medium break-all">{p.email || '—'}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Teléfono</p>
          <p className="font-medium">{p.telefono || '—'}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Programa</p>
          <p className="font-medium">{p.programa || '—'}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Cargo</p>
          <p className="font-medium">{p.cargo || '—'}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Carga horaria</p>
          <p className="font-medium">{(p.carga_horaria ?? 0) + ' h/sem'}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Estado</p>
          <p className="font-medium">{p.estado}</p>
        </div>
      </div>
      {(p.direccion || p.fecha_nacimiento || p.fecha_ingreso) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Dirección</p>
            <p className="font-medium">{p.direccion || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Fecha nacimiento</p>
            <p className="font-medium">{formatDateDisplay(p.fecha_nacimiento) || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Fecha ingreso</p>
            <p className="font-medium">{formatDateDisplay(p.fecha_ingreso) || '—'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
