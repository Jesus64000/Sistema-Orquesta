// src/components/Alumno/AlumnoHistorial.jsx
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { getAlumnoHistorial, addAlumnoHistorial } from "../../api/alumnos";

export default function AlumnoHistorial({ idAlumno }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ tipo: "NOTA", descripcion: "" });

  const loadHistorial = async () => {
    if (!idAlumno) return; // 👈 validamos aquí
    setLoading(true);
    try {
      const res = await getAlumnoHistorial(idAlumno);
      setHistorial(res.data || []);
    } catch {
      toast.error("Error cargando historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAlumno]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.descripcion.trim())
      return toast.error("La descripción no puede estar vacía");

    try {
      await addAlumnoHistorial(idAlumno, form);
      toast.success("Historial agregado");
      setForm({ tipo: "NOTA", descripcion: "" });
      loadHistorial();
    } catch {
      toast.error("Error guardando historial");
    }
  };

  if (!idAlumno) return null; // 👈 validamos al renderizar

  return (
    <div className="space-y-3">
      <h4 className="font-semibold">Historial</h4>
      <form onSubmit={handleAdd} className="flex gap-2">
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          className="border rounded-lg px-2 py-1 text-sm bg-transparent"
        >
          <option value="NOTA">Nota</option>
          <option value="ESTADO">Estado</option>
          <option value="PROGRAMA">Programa</option>
          <option value="OTRO">Otro</option>
        </select>
        <input
          type="text"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Descripción"
          className="flex-1 border rounded-lg px-2 py-1 text-sm bg-transparent"
        />
        <Button
          type="submit"
          size="sm"
          variant="primary"
        >
          Agregar
        </Button>
      </form>
      <div className="max-h-60 overflow-auto rounded-lg border card-90">
        <table className="w-full text-sm">
          <thead className="muted">
            <tr>
              <th className="px-2 py-1 text-left">Fecha</th>
              <th className="px-2 py-1 text-left">Tipo</th>
              <th className="px-2 py-1 text-left">Descripción</th>
              <th className="px-2 py-1 text-left">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((h) => (
              <tr key={h.id_historial} className="border-t">
                <td className="px-2 py-1">{h.creado_en?.slice(0, 10)}</td>
                <td className="px-2 py-1">{h.tipo}</td>
                <td className="px-2 py-1">{h.descripcion}</td>
                <td className="px-2 py-1">{h.usuario}</td>
              </tr>
            ))}
            {historial.length === 0 && !loading && (
              <tr>
                <td colSpan="4" className="text-center py-2 muted">
                  Sin historial
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
