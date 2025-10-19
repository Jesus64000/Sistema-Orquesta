import React, { useState, useMemo } from 'react';
import { MapPin, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';

// Tooltip replicado del dashboard
const Tooltip = ({ eventos, align = 'center' }) => (
  <div className={`absolute z-50 w-64 card rounded-lg shadow-lg p-3 text-xs text-app pointer-events-none ${align === 'left' ? 'right-full mr-2' : align === 'right' ? 'left-full ml-2' : '-translate-x-1/2 left-1/2'}`}>
    {eventos.map(ev => {
      const d = ev.fecha_evento ? new Date(ev.fecha_evento) : null;
      return (
        <div key={ev.id_evento} className="mb-2 last:mb-0">
          <p className="font-semibold text-gray-900">{ev.titulo}</p>
          <p className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {d ? d.toLocaleDateString('es-ES') : ''} {' • '} {ev.hora_evento?.slice(0,5) || ''}
          </p>
          {ev.lugar && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {ev.lugar}</p>}
          <div className="mt-1 flex flex-wrap gap-1">
            {ev.estado && <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] capitalize">{ev.estado}</span>}
          </div>
        </div>
      );
    })}
  </div>
);

export default function EventosCalendar({ eventos = [] }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [hovered, setHovered] = useState(null);

  const matrix = useMemo(() => {
    // Igual que antes, pero guardamos si está fuera del mes para estilos
    const first = new Date(cursor.y, cursor.m, 1);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({ date: d, outside: d.getMonth() !== cursor.m });
    }
    return days;
  }, [cursor]);

  const eventosPorDia = (Array.isArray(eventos) ? eventos : []).reduce((acc, e) => {
    if (!e.fecha_evento) return acc;
    const [y, m, d] = String(e.fecha_evento).split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const key = dateObj.toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(cursor.y, cursor.m, 1));
  const eventosMesActual = Object.entries(eventosPorDia).filter(([key]) => {
    const d = new Date(key);
    return d.getFullYear() === cursor.y && d.getMonth() === cursor.m;
  }).length;
  const isDifferentMonth = cursor.y !== today.getFullYear() || cursor.m !== today.getMonth();

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize text-gray-900 tracking-wide">{monthName} {cursor.y}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Mes anterior"
            onClick={() => setCursor(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-yellow-200 bg-yellow-100 text-gray-700 hover:bg-yellow-200 hover:text-gray-900 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!isDifferentMonth}
            onClick={() => setCursor({ y: today.getFullYear(), m: today.getMonth() })}
            className={`px-3 h-9 inline-flex items-center justify-center rounded-full text-[11px] font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300
              ${isDifferentMonth ? 'bg-yellow-100 border-yellow-200 text-gray-700 hover:bg-yellow-200 hover:text-gray-900 shadow-sm' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}
            aria-label="Volver al mes actual"
          >
            Hoy
          </button>
          <button
            type="button"
            aria-label="Mes siguiente"
            onClick={() => setCursor(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-yellow-200 bg-yellow-100 text-gray-700 hover:bg-yellow-200 hover:text-gray-900 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 text-center text-xs font-medium text-gray-500">
        {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-1 relative">
        {matrix.map((cell, i) => {
          const d = cell.date;
          const inMonth = !cell.outside;
          const day = d.getDate();
          const keyDate = d.toDateString();
          const eventosDia = eventosPorDia[keyDate] || [];
          const isHovered = hovered?.date.toDateString() === keyDate;
          const isToday = d.toDateString() === today.toDateString();
          const colIndex = i % 7;
          let align = 'center';
          if (colIndex >= 5) align = 'left';
          else if (colIndex <= 1) align = 'right';
          return (
            <div
              key={i}
              onMouseEnter={() => setHovered({ date: d, eventos: eventosDia })}
              onMouseLeave={() => setHovered(null)}
              className={`relative aspect-square rounded-xl text-sm grid place-items-center border shadow-sm select-none
                ${inMonth ? 'card-90 text-app border' : 'muted text-muted border-transparent'}
                ${eventosDia.length ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 font-semibold cursor-pointer hover:from-yellow-200 hover:to-yellow-300 transition' : ''}
                ${isToday ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-white font-semibold' : ''}`}
              aria-label={`Día ${day}${eventosDia.length ? ` con ${eventosDia.length} evento${eventosDia.length===1?'':'s'}` : ''}`}
            >
              {day}
              {isHovered && eventosDia.length > 0 && <Tooltip eventos={eventosDia} align={align} />}
            </div>
          );
        })}
      </div>
      {eventosMesActual === 0 && (
        <div className="mt-4 flex flex-col items-center gap-2 text-gray-500 text-xs">
          <CalendarIcon className="h-6 w-6 text-gray-300" />
          <p className="font-medium text-gray-600">No hay eventos en este mes</p>
          <p className="text-[11px] text-gray-400">Crea uno desde el botón Nuevo</p>
        </div>
      )}
    </Card>
  );
}
