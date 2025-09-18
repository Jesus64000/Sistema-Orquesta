// sistema-orquesta/src/components/Eventos/EventoForm.jsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { createEvento, updateEvento } from "../../api/eventos";
import Modal from "../Modal";

export default function EventoForm({ data, onCancel, onSaved }) {
  const [form, setForm] = useState({
    titulo: "",
    fecha_evento: "",
    lugar: "",
    descripcion: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      // Mapear nombres del backend si vienen distintos
      setForm({
        titulo: data.titulo || "",
        fecha_evento: data.fecha_evento || "",
        lugar: data.lugar || "",
        descripcion: data.descripcion || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo || !form.fecha_evento || !form.lugar) {
      toast.error("Todos los campos obligatorios deben completarse");
      return;
    }

    try {
      setSaving(true);

      // Asegurarse que fecha_evento esté en formato ISO
      const payload = {
        ...form,
        fecha_evento: form.fecha_evento.replace("T", " "),
      };

      if (data?.id_evento) {
        await updateEvento(data.id_evento, payload);
        toast.success("Evento actualizado correctamente");
      } else {
        await createEvento(payload);
        toast.success("Evento creado correctamente");
      }

      onSaved?.();
      onCancel?.();
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar evento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={data ? "Editar Evento" : "Crear Evento"} onClose={onCancel}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input
            type="text"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium">Fecha</label>
          <input
            type="datetime-local"
            name="fecha_evento"
            value={form.fecha_evento.slice(0, 16)}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Lugar */}
        <div>
          <label className="block text-sm font-medium">Lugar</label>
          <input
            type="text"
            name="lugar"
            value={form.lugar}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
          >
            {saving ? "Guardando..." : data ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
