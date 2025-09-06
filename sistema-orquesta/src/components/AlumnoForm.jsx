import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import MultiSelect from "./MultiSelect";
import { createAlumno, updateAlumno } from "../api/alumnos";

export default function AlumnoForm({ data, programas, onCancel, onSaved }) {
  const [formData, setFormData] = useState({
    nombre: "",
    fecha_nacimiento: "",
    genero: "Masculino",
    telefono_contacto: "",
    estado: "Activo",
    programa_ids: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        nombre: data.nombre || "",
        fecha_nacimiento: data.fecha_nacimiento
          ? String(data.fecha_nacimiento).slice(0, 10)
          : "",
        genero: data.genero || "Masculino",
        telefono_contacto: data.telefono_contacto || "",
        estado: data.estado || "Activo",
        programa_ids: (data.programas || []).map((p) => p.id_programa),
      });
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre?.trim()) return toast.error("El nombre es obligatorio");
    if (!formData.fecha_nacimiento)
      return toast.error("La fecha de nacimiento es obligatoria");
    if (formData.programa_ids.length === 0)
      return toast.error("Selecciona al menos un programa");

    try {
      setLoading(true);
      if (data) {
        await updateAlumno(data.id_alumno, formData);
        toast.success("Alumno actualizado");
      } else {
        await createAlumno(formData);
        toast.success("Alumno creado");
      }
      onSaved?.();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar el alumno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Nombre</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Fecha de nacimiento</label>
          <input
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) =>
              setFormData({ ...formData, fecha_nacimiento: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Género</label>
          <select
            value={formData.genero}
            onChange={(e) =>
              setFormData({ ...formData, genero: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          >
            <option>Masculino</option>
            <option>Femenino</option>
            <option>Otro</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Teléfono</label>
          <input
            type="text"
            value={formData.telefono_contacto}
            onChange={(e) =>
              setFormData({ ...formData, telefono_contacto: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Programas (máx. 2)</label>
          <MultiSelect
            options={programas}
            value={formData.programa_ids}
            onChange={(val) => {
              if (val.length > 2) {
                toast.error("Un alumno puede estar en máximo 2 programas");
                return;
              }
              setFormData({ ...formData, programa_ids: val });
            }}
            placeholder="Selecciona uno o dos programas"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Estado</label>
          <select
            value={formData.estado}
            onChange={(e) =>
              setFormData({ ...formData, estado: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          >
            <option>Activo</option>
            <option>Inactivo</option>
            <option>Retirado</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-60"
        >
          {data ? "Guardar cambios" : "Crear alumno"}
        </button>
      </div>
    </form>
  );
}
