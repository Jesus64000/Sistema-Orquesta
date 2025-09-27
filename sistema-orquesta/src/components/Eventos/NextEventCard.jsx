import { MapPin, Clock } from 'lucide-react';
import Card from '../ui/Card';

// Mapea estado a estilos consistentes
const estadoColors = {
  PROGRAMADO: 'bg-blue-50 text-blue-700 border-blue-200',
  EN_CURSO: 'bg-amber-50 text-amber-700 border-amber-300',
  FINALIZADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELADO: 'bg-red-50 text-red-700 border-red-200'
};

export default function NextEventCard({ eventos = [], loading }) {
  const now = new Date();
  const futuros = (eventos || [])
    .filter(ev => ev.fecha_evento && ev.hora_evento && new Date(`${ev.fecha_evento}T${ev.hora_evento}`).getTime() >= now.getTime())
    .sort((a,b) => new Date(`${a.fecha_evento}T${a.hora_evento}`) - new Date(`${b.fecha_evento}T${b.hora_evento}`));

  const next = futuros[0];
  if (loading) {
    return <Card className="p-4 animate-pulse" aria-busy="true"><p className="text-sm text-gray-500">Buscando próximo evento...</p></Card>;
  }
  if (!next) {
    return <Card className="p-4"><p className="text-sm text-gray-500">No hay eventos próximos</p></Card>;
  }

  const dtNext = new Date(`${next.fecha_evento}T${next.hora_evento}`);
  const diffMs = dtNext.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor((diffMs % 86400000) / 3600000);
  const diffMinutes = Math.floor((diffMs % 3600000) / 60000);
  let countdown = '';
  if (diffDays > 0) countdown += `${diffDays}d `;
  if (diffHours >= 0) countdown += `${diffHours}h `;
  countdown += `${diffMinutes}m`;

  const estado = next.estado || 'PROGRAMADO';

  return (
    <Card className="p-4 flex flex-col gap-2" role="region" aria-label="Próximo evento">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Próximo evento</h2>
          <p className="text-lg font-bold text-gray-900 truncate" title={next.titulo}>{next.titulo}</p>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${estadoColors[estado] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{estado.replace('_',' ')}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1"><strong className="font-medium">Fecha:</strong> {next.fecha_evento}</span>
        <span className="inline-flex items-center gap-1"><strong className="font-medium">Hora:</strong> {next.hora_evento}</span>
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {next.lugar}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {countdown}</span>
      </div>
      {next.descripcion && (
        <p className="text-xs text-gray-500 line-clamp-2" title={next.descripcion}>{next.descripcion}</p>
      )}
    </Card>
  );
}