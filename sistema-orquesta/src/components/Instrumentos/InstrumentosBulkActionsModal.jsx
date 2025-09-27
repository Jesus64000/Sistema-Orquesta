import { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../ui/Button';
import ConfirmDialog from '../ConfirmDialog';
import { getEstados } from '../../api/administracion/estados';
import { getCategorias } from '../../api/administracion/categorias';
import toast from 'react-hot-toast';

// Nota: Asumimos que no existen aún endpoints batch. Usamos fallback iterativo secuencial.
export default function InstrumentosBulkActionsModal({ open, onClose, selectedIds, reload, optimisticUpdate }) {
  const [mode, setMode] = useState('estado'); // 'estado' | 'categoria'
  const [estados, setEstados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [eRes, cRes] = await Promise.all([getEstados(), getCategorias()]);
        setEstados(Array.isArray(eRes.data) ? eRes.data : []);
        setCategorias(Array.isArray(cRes.data) ? cRes.data : []);
      } catch {
        setEstados([]); setCategorias([]);
      }
    })();
  }, [open]);

  useEffect(() => { setValue(''); }, [mode, open]);

  const needsConfirm = () => {
    if (mode === 'estado') {
      const est = estados.find(e => String(e.id_estado) === String(value));
      const nombre = est?.nombre?.toLowerCase();
      if (nombre && (nombre.includes('retir') || nombre.includes('baja') || nombre.includes('inserv'))) return true;
    }
    return false;
  };

  const applyChanges = async () => {
    setLoading(true);
    try {
      // fallback iterativo
      const { updateInstrumento } = await import('../../api/instrumentos');
      for (const id of selectedIds) {
        const payload = {};
        if (mode === 'estado') payload.id_estado = value; else if (mode === 'categoria') payload.id_categoria = value;
        try {
          await updateInstrumento(id, payload);
        } catch (err) {
          console.error('Error actualizando instrumento', id, err);
        }
      }
      // Optimistic update callback (padre ajusta lista antes de recargar)
      if (optimisticUpdate) {
        optimisticUpdate({ mode, value });
      }
      toast.success('Cambios aplicados');
      // Pequeño retraso para que usuario vea feedback instantáneo ya aplicado
      setTimeout(() => { reload(); }, 300);
      onClose();
    } catch {
      toast.error('Error aplicando cambios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value) {
      toast.error('Seleccione un valor');
      return;
    }
    if (needsConfirm()) {
      setConfirm(true);
    } else {
      applyChanges();
    }
  };

  if (!open) return null;

  return (
    <>
      <Modal title="Acciones masivas instrumentos" onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex items-center gap-2 text-[12px] text-gray-600">
            <span className="font-semibold text-gray-800">{selectedIds.length}</span> seleccionados
          </div>
          <div className="flex gap-2 bg-gray-50 p-1 rounded-lg w-max text-[12px]">
            <button type="button" onClick={() => setMode('estado')} className={`px-3 py-1 rounded-md font-medium transition ${mode==='estado' ? 'bg-white shadow border' : 'text-gray-500 hover:text-gray-700'}`}>Estado</button>
            <button type="button" onClick={() => setMode('categoria')} className={`px-3 py-1 rounded-md font-medium transition ${mode==='categoria' ? 'bg-white shadow border' : 'text-gray-500 hover:text-gray-700'}`}>Categoría</button>
          </div>
          {mode === 'estado' && (
            <div className="flex flex-col gap-1">
              <label htmlFor="bulk_estado" className="text-xs font-medium text-gray-600 uppercase tracking-wide">Nuevo estado *</label>
              <select id="bulk_estado" value={value} onChange={e=>setValue(e.target.value)} className="p-2 border rounded-lg text-sm bg-white">
                <option value="">Selecciona...</option>
                {estados.map(e => <option key={e.id_estado} value={e.id_estado}>{e.nombre}</option>)}
              </select>
            </div>
          )}
          {mode === 'categoria' && (
            <div className="flex flex-col gap-1">
              <label htmlFor="bulk_categoria" className="text-xs font-medium text-gray-600 uppercase tracking-wide">Nueva categoría *</label>
              <select id="bulk_categoria" value={value} onChange={e=>setValue(e.target.value)} className="p-2 border rounded-lg text-sm bg-white">
                <option value="">Selecciona...</option>
                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="neutral" onClick={onClose}>Cerrar</Button>
            <Button type="submit" variant="primary" loading={loading} disabled={loading || !value}>Aplicar</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={confirm}
        title="Confirmar acción"
        message="Está a punto de mover instrumentos a un estado crítico (ej: Retirado / Baja). ¿Desea continuar?"
        onCancel={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); applyChanges(); }}
      />
    </>
  );
}
