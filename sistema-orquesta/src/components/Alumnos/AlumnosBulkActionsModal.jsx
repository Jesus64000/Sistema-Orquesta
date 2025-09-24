import { useEffect, useMemo, useState } from 'react';
import Modal from '../Modal';
import toast from 'react-hot-toast';
import ConfirmDialog from '../ConfirmDialog';

export default function AlumnosBulkActionsModal({ open, onClose, selectedIds = [], programas = [], onApplied }) {
  const [section, setSection] = useState('estado'); // 'estado' | 'programa'
  const [loading, setLoading] = useState(false);
  const [confirmarDesactivar, setConfirmarDesactivar] = useState(false);
  const [bloqueados, setBloqueados] = useState([]);

  // Estado
  const [nuevoEstado, setNuevoEstado] = useState('Activo');

  // Programa
  const [idPrograma, setIdPrograma] = useState('');
  const [accionPrograma, setAccionPrograma] = useState('add');

  const total = selectedIds?.length || 0;
  const canApply = useMemo(() => {
    if (section === 'estado') return !!nuevoEstado;
    if (section === 'programa') return !!idPrograma && (accionPrograma === 'add' || accionPrograma === 'remove');
    return false;
  }, [section, nuevoEstado, idPrograma, accionPrograma]);

  useEffect(() => {
    if (!open) {
      setSection('estado');
      setNuevoEstado('Activo');
      setIdPrograma('');
      setAccionPrograma('add');
      setLoading(false);
    }
  }, [open]);

  const apply = async () => {
    try {
      setLoading(true);
      const { bulkEstadoAlumnos, bulkProgramaAlumnos, verifyDesactivarAlumnos, bulkDesactivarAlumnos } = await import('../../api/alumnos.js');

      if (section === 'estado') {
        // Flujo especial si se quiere poner en Inactivo (desactivar)
        if (nuevoEstado === 'Inactivo') {
          // Si aún no se verificó
            if (!confirmarDesactivar) {
              const { data } = await verifyDesactivarAlumnos({ ids: selectedIds });
              if (data.bloqueados?.length) {
                setBloqueados(data.bloqueados);
                toast.error('Algunos alumnos tienen instrumentos activos, no se puede desactivar.');
                setLoading(false);
                return;
              }
              // No bloqueados -> pedir confirmación
              setConfirmarDesactivar(true);
              setLoading(false);
              return;
            }
            // Confirmado -> usar desactivar masivo para registrar historial específico
            await bulkDesactivarAlumnos({ ids: selectedIds });
            toast.success('Alumnos desactivados (Inactivos)');
        } else {
          await bulkEstadoAlumnos({ ids: selectedIds, estado: nuevoEstado });
          toast.success(`Estado actualizado a "${nuevoEstado}"`);
        }
      } else if (section === 'programa') {
        await bulkProgramaAlumnos({ ids: selectedIds, id_programa: Number(idPrograma), action: accionPrograma });
        toast.success(`${accionPrograma === 'add' ? 'Agregado' : 'Removido'} programa correctamente`);
      }
      onApplied?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      toast.error('No se pudo aplicar la acción');
    } finally {
      setLoading(false);
      setConfirmarDesactivar(false);
      setBloqueados([]);
    }
  };

  if (!open) return null;

  return (
    <Modal title={`Acciones masivas (${total} seleccionado${total !== 1 ? 's' : ''})`} onClose={onClose}>
      <div className="flex flex-col md:flex-row gap-6 md:pr-2 max-h-[70vh] overflow-y-auto custom-scrollbar min-w-[300px] md:min-w-[760px]">
        {/* Navegación lateral (colapsa arriba en mobile) */}
        <aside className="md:w-60 flex flex-row md:flex-col gap-2 md:pr-2 md:border-r sticky top-0 bg-white/90 md:bg-transparent z-10">
          {[
            { key: 'estado', label: 'Cambiar estado', desc: 'Estado global' },
            { key: 'programa', label: 'Programas', desc: 'Agregar / quitar' },
          ].map(item => {
            const active = section === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`text-left group rounded-xl p-3 border transition shadow-sm ${active ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-200' : 'bg-white border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium text-sm ${active ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>{item.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${active ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>●</span>
                </div>
                <div className="text-[11px] mt-1 text-gray-500 leading-snug">{item.desc}</div>
              </button>
            );
          })}
          <div className="mt-4 p-3 rounded-lg bg-gray-50 border text-[11px] text-gray-600 leading-relaxed">
            <strong className="block mb-1 text-gray-700">Tips:</strong>
            <ul className="list-disc ml-4 space-y-1">
              <li>Selecciona alumnos con el checkbox superior.</li>
              <li>El estado Inactivo equivale a desactivar.</li>
              <li>Puedes combinar filtros antes de aplicar.</li>
            </ul>
          </div>
        </aside>

        {/* Contenido */}
  <section className="flex-1 flex flex-col gap-8 pb-2">
          {section === 'estado' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-800 text-sm tracking-wide">Seleccionar nuevo estado</h3>
                <p className="text-xs text-gray-500">Se aplicará a todos los alumnos seleccionados inmediatamente.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Activo','Inactivo','Retirado'].map(est => {
                  const active = nuevoEstado === est;
                  return (
                    <button
                      type="button"
                      key={est}
                      onClick={() => setNuevoEstado(est)}
                      className={`text-left rounded-lg border p-3 transition shadow-sm hover:shadow ${active ? 'border-yellow-500 ring-2 ring-yellow-200 bg-yellow-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{est}</span>
                        {active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-700">Activo</span>}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {est === 'Activo' && 'Disponible en el sistema.'}
                        {est === 'Inactivo' && 'No operativo (remplaza desactivar).'}
                        {est === 'Retirado' && 'Histórico, sin participación.'}
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="text-[11px] text-gray-500">Cambiar a Inactivo elimina la necesidad de una acción separada de desactivación.</div>
            </div>
          )}

          {section === 'programa' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-800 text-sm tracking-wide">Gestión de programas</h3>
                <p className="text-xs text-gray-500">Agrega o quita un programa para todos los seleccionados.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Programa</label>
                  <select
                    value={idPrograma}
                    onChange={(e) => setIdPrograma(e.target.value)}
                    className="px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">Selecciona programa…</option>
                    {programas.map(p => (
                      <option key={p.id_programa} value={p.id_programa}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Acción</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'add', label: 'Agregar', desc: 'Suma si hay cupo' },
                      { key: 'remove', label: 'Quitar', desc: 'Elimina si existe' },
                    ].map(opt => {
                      const active = accionPrograma === opt.key;
                      return (
                        <button
                          type="button"
                          key={opt.key}
                          onClick={() => setAccionPrograma(opt.key)}
                          className={`rounded-md border p-2 text-left transition hover:shadow-sm ${active ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200' : 'border-gray-200 bg-white'}`}
                        >
                          <span className="block text-xs font-medium">{opt.label}</span>
                          <span className="block text-[10px] text-gray-500">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <ul className="list-disc ml-5 text-[11px] text-gray-500 space-y-1">
                <li>Máximo de 2 programas por alumno (regla actual del backend).</li>
                <li>Si ya está inscrito y eliges agregar, se ignora sin error.</li>
                <li>Quitar sólo actúa si la relación existe.</li>
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t pt-4 mt-auto sticky bottom-0 bg-white backdrop-blur supports-[backdrop-filter]:bg-white/90">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">Cancelar</button>
            <button
              onClick={apply}
              disabled={loading || !canApply}
              className={`px-5 py-2 rounded-lg text-sm font-medium text-white ${loading || !canApply ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {loading ? 'Aplicando…' : (nuevoEstado === 'Inactivo' && section === 'estado' && !confirmarDesactivar ? 'Verificar' : 'Aplicar')}
            </button>
          </div>
        </section>
      </div>
      {/* Bloqueados aviso */}
      {bloqueados.length > 0 && (
        <div className="mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          No se pudieron desactivar estos IDs por instrumento activo: {bloqueados.join(', ')}
        </div>
      )}
      <ConfirmDialog
        open={confirmarDesactivar}
        title="Confirmar desactivación"
        message={`Se cambiará el estado a Inactivo para ${selectedIds.length} alumno(s). ¿Confirmas?`}
        confirmLabel="Sí, desactivar"
        confirmColor="bg-orange-600 hover:bg-orange-700"
        onCancel={() => setConfirmarDesactivar(false)}
        onConfirm={() => {
          // Después de confirmar, ejecutar apply otra vez (este camino ya confirmará y desactivará)
          apply();
        }}
      />
    </Modal>
  );
}
