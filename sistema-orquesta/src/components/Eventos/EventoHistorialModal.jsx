import { useEffect, useState } from 'react';
import Modal from '../Modal';
import { getEventoHistorial } from '../../api/eventos';
import { History } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EventoHistorialModal({ idEvento, open, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !idEvento) return;
    (async () => {
      try {
        setLoading(true); setError(null);
        const data = await getEventoHistorial(idEvento);
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
        toast.error('Error cargando historial');
      } finally { setLoading(false); }
    })();
  }, [open, idEvento]);

  const titulo = `Historial de Cambios - Evento #${idEvento}`;
  return (
    <Modal title={titulo} onClose={onClose} open={open}>
      <div className="space-y-4 max-h-[60vh] overflow-auto pr-1">
        {loading && <p className="text-sm text-gray-500">Cargando...</p>}
        {!loading && items.length === 0 && <p className="text-sm text-gray-500">Sin cambios registrados.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <ul className="divide-y divide-gray-100">
          {items.map(item => (
            <li key={item.id} className="py-3 text-sm flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-gray-800">{item.campo}</span>
                <span className="ml-auto text-[11px] text-gray-500 font-mono">{item.creado_en}</span>
                {item.usuario && <span className="text-[11px] text-emerald-600 font-semibold">{item.usuario}</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-red-50/60 border border-red-100 rounded-md p-2 min-h-[2.2rem]">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-red-600 mb-0.5">Antes</p>
                  <p className="text-xs text-gray-700 break-words whitespace-pre-wrap">{item.valor_anterior || <em className="text-gray-400">(vacío)</em>}</p>
                </div>
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-md p-2 min-h-[2.2rem]">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-emerald-600 mb-0.5">Después</p>
                  <p className="text-xs text-gray-700 break-words whitespace-pre-wrap">{item.valor_nuevo || <em className="text-gray-400">(vacío)</em>}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
