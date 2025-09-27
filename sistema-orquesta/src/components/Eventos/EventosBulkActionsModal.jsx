import { useState } from 'react';
import Modal from '../Modal';
import Button from '../ui/Button';
import ConfirmDialog from '../ConfirmDialog';
import toast from 'react-hot-toast';
import { updateEvento, deleteEvento } from '../../api/eventos';

/**
 * EventosBulkActionsModal
 * Acciones masivas iniciales (placeholder):
 * - Cambiar lugar
 * - Cambiar hora
 * - Eliminar (con confirmación)
 * Fallback iterativo: no hay endpoint batch todavía.
 */
export default function EventosBulkActionsModal({ open, onClose, selectedIds = [], reload }) {
  const [mode, setMode] = useState('lugar'); // 'lugar' | 'hora' | 'eliminar'
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reset = () => { setValue(''); setMode('lugar'); };

  const applyChanges = async () => {
    setLoading(true);
    try {
      if (mode === 'eliminar') {
        for (const id of selectedIds) {
          try { await deleteEvento(id); } catch (e) { console.error('Error eliminando evento', id, e); }
        }
        toast.success('Eventos eliminados');
      } else {
        const payload = {};
        if (mode === 'lugar') payload.lugar = value;
        if (mode === 'hora') payload.hora_evento = value;
        for (const id of selectedIds) {
          try { await updateEvento(id, payload); } catch (e) { console.error('Error actualizando evento', id, e); }
        }
        toast.success('Cambios aplicados');
      }
      setTimeout(() => reload?.(), 300);
      onClose?.();
      reset();
    } catch {
      toast.error('Error aplicando cambios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode !== 'eliminar' && !value) {
      toast.error('Ingrese un valor');
      return;
    }
    if (mode === 'eliminar') {
      setConfirmDelete(true);
    } else {
      applyChanges();
    }
  };

  if (!open) return null;

  return (
    <>
      <Modal title="Acciones masivas eventos" onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="flex items-center gap-2 text-[12px] text-gray-600">
            <span className="font-semibold text-gray-800">{selectedIds.length}</span> seleccionados
          </div>
          <div className="flex gap-2 bg-gray-50 p-1 rounded-lg w-max text-[12px]">
            <button type="button" onClick={() => { setMode('lugar'); setValue(''); }} className={`px-3 py-1 rounded-md font-medium transition ${mode==='lugar' ? 'bg-white shadow border' : 'text-gray-500 hover:text-gray-700'}`}>Lugar</button>
            <button type="button" onClick={() => { setMode('hora'); setValue(''); }} className={`px-3 py-1 rounded-md font-medium transition ${mode==='hora' ? 'bg-white shadow border' : 'text-gray-500 hover:text-gray-700'}`}>Hora</button>
            <button type="button" onClick={() => { setMode('eliminar'); setValue(''); }} className={`px-3 py-1 rounded-md font-medium transition ${mode==='eliminar' ? 'bg-white shadow border text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>Eliminar</button>
          </div>

          {mode === 'lugar' && (
            <div className="flex flex-col gap-1">
              <label htmlFor="bulk_lugar" className="text-xs font-medium text-gray-600 uppercase tracking-wide">Nuevo lugar *</label>
              <input id="bulk_lugar" value={value} onChange={e=>setValue(e.target.value)} className="p-2 border rounded-lg text-sm bg-white" placeholder="Ej: Auditorio Principal" />
            </div>
          )}
          {mode === 'hora' && (
            <div className="flex flex-col gap-1">
              <label htmlFor="bulk_hora" className="text-xs font-medium text-gray-600 uppercase tracking-wide">Nueva hora (HH:MM) *</label>
              <input id="bulk_hora" value={value} onChange={e=>setValue(e.target.value)} className="p-2 border rounded-lg text-sm bg-white" placeholder="14:30" />
              <p className="text-[10px] text-gray-500">Se aplica sólo el campo hora_evento.</p>
            </div>
          )}
          {mode === 'eliminar' && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
              Esta acción eliminará permanentemente los {selectedIds.length} eventos seleccionados.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="neutral" onClick={() => { onClose(); reset(); }}>Cerrar</Button>
            <Button type="submit" variant={mode==='eliminar' ? 'danger' : 'primary'} loading={loading} disabled={loading || (mode!=='eliminar' && !value)}>
              {mode === 'eliminar' ? 'Eliminar' : 'Aplicar'}
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={confirmDelete}
        title="Confirmar eliminación"
        message={`¿Eliminar definitivamente ${selectedIds.length} evento${selectedIds.length!==1?'s':''}? Esta acción no se puede deshacer.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => { setConfirmDelete(false); applyChanges(); }}
      />
    </>
  );
}
