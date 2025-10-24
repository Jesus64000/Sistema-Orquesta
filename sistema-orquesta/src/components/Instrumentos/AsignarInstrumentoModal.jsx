import { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import SearchableSelect from "../ui/SearchableSelect";
import { http } from "../../api/http";
import toast from "react-hot-toast";

export default function AsignarInstrumentoModal({ open, onClose, onAssigned }) {
  const [loading, setLoading] = useState(false);
  const [alumnos, setAlumnos] = useState([]);
  const [instrumentos, setInstrumentos] = useState([]);
  const [alumnoId, setAlumnoId] = useState("");
  const [instrumentoId, setInstrumentoId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [alRes, instRes] = await Promise.all([
        http.get('/alumnos'),
        http.get('/instrumentos'),
      ]);
      const alumnosList = (alRes.data || alRes || []).map(a => ({ id_alumno: a.id_alumno, nombre: a.nombre }));
      const instrumentosList = (instRes.data || instRes || []);
      setAlumnos(alumnosList);
      setInstrumentos(instrumentosList);
    } catch (e) {
      console.error(e);
      toast.error('Error cargando datos para asignación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (open) { setAlumnoId(""); setInstrumentoId(""); load(); } }, [open]);

  const alumnoOptions = useMemo(() => alumnos.map(a => ({ label: a.nombre, value: String(a.id_alumno) })), [alumnos]);
  const instrumentoOptions = useMemo(() => {
    // Sugerir sólo disponibles y sin asignación activa
    return instrumentos
      .filter(i => !i.asignado && (String(i.estado_nombre || '').toLowerCase() === 'disponible' || !i.estado_nombre))
      .map(i => ({ label: `${i.nombre} · ${i.numero_serie || 's/n'}`, value: String(i.id_instrumento) }));
  }, [instrumentos]);

  const canAssign = alumnoId && instrumentoId && !loading;

  const asignar = async () => {
    if (!alumnoId) return toast.error('Selecciona un alumno');
    if (!instrumentoId) return toast.error('Selecciona un instrumento');
    try {
      setLoading(true);
      await http.post(`/alumnos/${alumnoId}/instrumento`, { id_instrumento: Number(instrumentoId) });
      toast.success('Instrumento asignado');
      onAssigned?.();
      onClose?.();
    } catch (e) {
      const msg = e?.response?.data?.error || 'No se pudo asignar';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Asignar instrumento">
      <div className="space-y-4">
        <div>
          <label className="text-xs muted">Alumno</label>
          <SearchableSelect
            options={alumnoOptions}
            value={alumnoId}
            onChange={setAlumnoId}
            placeholder="Escribe para buscar alumno"
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs muted">Instrumento</label>
          <SearchableSelect
            options={instrumentoOptions}
            value={instrumentoId}
            onChange={setInstrumentoId}
            placeholder="Escribe para buscar instrumento"
            className="w-full"
          />
          {instrumentoOptions.length === 0 && (
            <p className="text-[11px] mt-1 muted">No hay instrumentos disponibles sin asignación.</p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm border rounded-lg card hover:shadow-sm"
          >Cancelar</button>
          <button
            type="button"
            onClick={asignar}
            disabled={!canAssign}
            className={`px-3 py-1.5 text-sm rounded-lg text-black font-medium ${canAssign ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-200 cursor-not-allowed'}`}
          >Asignar</button>
        </div>
      </div>
    </Modal>
  );
}
