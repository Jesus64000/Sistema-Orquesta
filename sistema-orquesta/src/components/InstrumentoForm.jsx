// src/components/InstrumentoForm.jsx
import { useState } from "react";
import { createInstrumento, updateInstrumento } from "../api/instrumentos";

import toast from "react-hot-toast";

export default function InstrumentoForm({ data, onCancel, onSaved }) {
  const [form, setForm] = useState(
    data || {
      nombre: "",
      categoria: "Cuerda",
      numero_serie: "",
      estado: "Disponible",
      fecha_adquisicion: "",
      ubicacion: "",
    }
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (data) {
        await updateInstrumento(data.id_instrumento, form);
        toast.success("Instrumento actualizado");
      } else {
        await createInstrumento(form);
        toast.success("Instrumento creado");
      }
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Error guardando instrumento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => handleChange("nombre", e.target.value)}
        className="w-full p-2 border rounded-lg"
        required
      />

      <select
        value={form.categoria}
        onChange={(e) => handleChange("categoria", e.target.value)}
        className="w-full p-2 border rounded-lg"
      >
        <option>Cuerda</option>
        <option>Viento</option>
        <option>Percusión</option>
        <option>Mobiliario</option>
        <option>Teclado</option>
      </select>

      <input
        type="text"
        placeholder="Número de serie"
        value={form.numero_serie}
        onChange={(e) => handleChange("numero_serie", e.target.value)}
        className="w-full p-2 border rounded-lg"
        required
      />

      <select
        value={form.estado}
        onChange={(e) => handleChange("estado", e.target.value)}
        className="w-full p-2 border rounded-lg"
      >
        <option>Disponible</option>
        <option>Asignado</option>
        <option>Mantenimiento</option>
        <option>Baja</option>
      </select>

      <input
        type="date"
        value={form.fecha_adquisicion || ""}
        onChange={(e) => handleChange("fecha_adquisicion", e.target.value)}
        className="w-full p-2 border rounded-lg"
      />

      <input
        type="text"
        placeholder="Ubicación"
        value={form.ubicacion}
        onChange={(e) => handleChange("ubicacion", e.target.value)}
        className="w-full p-2 border rounded-lg"
      />

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}