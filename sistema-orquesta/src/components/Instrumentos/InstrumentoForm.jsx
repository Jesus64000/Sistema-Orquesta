// src/components/InstrumentoForm.jsx

import { useState, useEffect } from "react";
import Button from '../ui/Button';
import { createInstrumento, updateInstrumento } from "../../api/instrumentos";
import { getCategorias } from "../../api/administracion/categorias";
import { getEstados } from "../../api/administracion/estados";
import toast from "react-hot-toast";


function formatDateToInput(dateStr) {
  if (!dateStr) return "";
  // Si ya está en formato yyyy-MM-dd, devolver tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Si es ISO, convertir
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toISOString().slice(0, 10);
}

export default function InstrumentoForm({ data, onCancel, onSaved }) {
  const [form, setForm] = useState(
    data
      ? {
          ...data,
          id_categoria: data.id_categoria || "",
          fecha_adquisicion: formatDateToInput(data.fecha_adquisicion),
        }
      : {
          nombre: "",
          id_categoria: "",
          numero_serie: "",
          id_estado: "",
          fecha_adquisicion: "",
          ubicacion: "",
        }
  );
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await getCategorias();
        setCategorias(Array.isArray(res.data) ? res.data : []);
      } catch {
        setCategorias([]);
      }
    };
    const fetchEstados = async () => {
      try {
        const res = await getEstados();
        setEstados(Array.isArray(res.data) ? res.data : []);
      } catch {
        setEstados([]);
      }
    };
    fetchCategorias();
    fetchEstados();
  }, []);

  // Si data cambia (edición), actualizar el form con la fecha formateada
  useEffect(() => {
    if (data) {
      setForm({
        ...data,
  id_categoria: data.id_categoria || "",
  id_estado: data.id_estado || "",
  fecha_adquisicion: formatDateToInput(data.fecha_adquisicion),
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        id_categoria: form.id_categoria,
        id_estado: form.id_estado,
      };
      if (data) {
        await updateInstrumento(data.id_instrumento, payload);
        toast.success("Instrumento actualizado");
      } else {
        await createInstrumento(payload);
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
        value={form.id_categoria}
        onChange={(e) => handleChange("id_categoria", e.target.value)}
        className="w-full p-2 border rounded-lg"
        required
      >
        <option value="">Selecciona una categoría</option>
        {categorias.map((cat) => (
          <option key={cat.id_categoria} value={cat.id_categoria}>
            {cat.nombre}
          </option>
        ))}
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
        value={form.id_estado}
        onChange={(e) => handleChange("id_estado", e.target.value)}
        className="w-full p-2 border rounded-lg"
        required
      >
        <option value="">Selecciona un estado</option>
        {estados.map((est) => (
          <option key={est.id_estado} value={est.id_estado}>{est.nombre}</option>
        ))}
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

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="neutral" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>{data ? 'Actualizar' : 'Crear'}</Button>
      </div>
    </form>
  );
}