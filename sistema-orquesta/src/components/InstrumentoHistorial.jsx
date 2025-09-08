// src/components/InstrumentoHistorial.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getInstrumentoHistorial } from "../api/instrumentos";

export default function InstrumentoHistorial({ idInstrumento }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHistorial = async () => {
      setLoading(true);
      try {
        const res = await getInstrumentoHistorial(idInstrumento);
        setHistorial(res.data || []);
      } catch (err) {
        toast.error("Error cargando historial del instrumento");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (idInstrumento) loadHistorial();
  }, [idInstrumento]);

  if (loading) return <p className="text-sm text-gray-500">Cargando historial...</p>;

  if (!historial.length) {
    return <p className="text-sm text-gray-400">Sin historial registrado</p>;
  }

  return (
    <div className="space-y-3">
      {historial.map((h) => (
        <div
          key={h.id_historial}
          className="p-3 border rounded-lg bg-gray-50 text-sm"
        >
          <div className="flex justify-between">
            <span className="font-medium">{h.tipo}</span>
            <span className="text-xs text-gray-400">
              {new Date(h.creado_en).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-600">{h.descripcion}</p>
          <p className="text-xs text-gray-400">Por: {h.usuario}</p>
        </div>
      ))}
    </div>
  );
}
