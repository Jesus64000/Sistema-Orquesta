import { useEffect, useMemo, useRef, useState } from "react";
import {
  UserPlus, Search, Edit, Trash2, Filter, X, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAlumnos,
  createAlumno,
  updateAlumno,
  deleteAlumno,
  getProgramas,
} from "../api/alumnos";

// === UI Primitives ===
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-md border border-gray-200 ${className}`}>{children}</div>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border">
    {children}
  </span>
);

const Pill = ({ children, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-gray-800 border border-yellow-200">
    {children}
    {onRemove && (
      <button onClick={onRemove} className="ml-1 hover:text-gray-900">
        <X className="h-3 w-3" />
      </button>
    )}
  </span>
);

// === Modal ===
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// === Confirm Dialog ===
function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold">{title}</h4>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// === MultiSelect (sin librerías externas) ===
function MultiSelect({ options, value = [], onChange, placeholder = "Seleccionar..." }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const toggle = (id) => {
    const exists = value.includes(id);
    if (exists) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  const selected = options.filter((o) => value.includes(o.id_programa));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg bg-white"
      >
        <div className="flex flex-wrap gap-1">
          {selected.length === 0 ? (
            <span className="text-sm text-gray-500">{placeholder}</span>
          ) : (
            selected.map((s) => <Pill key={s.id_programa}>{s.nombre}</Pill>)
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-lg p-2">
          <div className="max-h-56 overflow-auto space-y-1">
            {options.map((opt) => {
              const checked = value.includes(opt.id_programa);
              return (
                <label
                  key={opt.id_programa}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt.id_programa)}
                  />
                  <span className="text-sm">{opt.nombre}</span>
                </label>
              );
            })}
          </div>
          {value.length > 0 && (
            <div className="flex justify-between items-center pt-2 mt-2 border-t">
              <span className="text-xs text-gray-500">{value.length} seleccionado(s)</span>
              <button
                type="button"
                className="text-xs text-red-600 hover:underline"
                onClick={() => onChange([])}
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Alumnos() {
  // Data
  const [alumnos, setAlumnos] = useState([]);
  const [programas, setProgramas] = useState([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });

  // Filtros / búsqueda
  const [search, setSearch] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fPrograma, setFPrograma] = useState("");

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    fecha_nacimiento: "",
    genero: "Masculino",
    telefono_contacto: "",
    estado: "Activo",
    programa_ids: [], // << múltiples
  });

  // Loaders
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [resP, resA] = await Promise.all([getProgramas(), getAlumnos()]);
        setProgramas(resP.data || []);
        setAlumnos(resA.data || []);
      } catch (e) {
        toast.error("Error cargando datos iniciales");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtro local (además puedes usar params del backend si prefieres)
  const alumnosFiltrados = useMemo(() => {
    return alumnos.filter((a) => {
      const byText =
        a.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        a.estado?.toLowerCase().includes(search.toLowerCase()) ||
        a.telefono_contacto?.toLowerCase().includes(search.toLowerCase());

      const byEstado = fEstado ? a.estado === fEstado : true;

      const byPrograma = fPrograma
        ? (a.programas || []).some((p) => String(p.id_programa) === String(fPrograma))
        : true;

      return byText && byEstado && byPrograma;
    });
  }, [alumnos, search, fEstado, fPrograma]);

  // Handlers CRUD
  const openCreate = () => {
    setEditing(null);
    setFormData({
      nombre: "",
      fecha_nacimiento: "",
      genero: "Masculino",
      telefono_contacto: "",
      estado: "Activo",
      programa_ids: [],
    });
    setShowForm(true);
  };

  const openEdit = (al) => {
    setEditing(al);
    setFormData({
      nombre: al.nombre || "",
      fecha_nacimiento: al.fecha_nacimiento ? String(al.fecha_nacimiento).slice(0, 10) : "",
      genero: al.genero || "Masculino",
      telefono_contacto: al.telefono_contacto || "",
      estado: al.estado || "Activo",
      programa_ids: (al.programas || []).map((p) => p.id_programa),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validaciones rápidas
    if (!formData.nombre?.trim()) return toast.error("El nombre es obligatorio");
    if (!formData.fecha_nacimiento) return toast.error("La fecha de nacimiento es obligatoria");
    if (formData.programa_ids.length === 0) return toast.error("Selecciona al menos un programa");

    try {
      setLoading(true);
      if (editing) {
        await updateAlumno(editing.id_alumno, formData);
        toast.success("Alumno actualizado");
      } else {
        await createAlumno(formData);
        toast.success("Alumno creado");
      }
      const res = await getAlumnos(); // refrescar
      setAlumnos(res.data || []);
      setShowForm(false);
      setEditing(null);
    } catch (e) {
      console.error(e);
      toast.error("No se pudo guardar el alumno");
    } finally {
      setLoading(false);
    }
  };

  const askDelete = (al) => setConfirm({ open: true, id: al.id_alumno, name: al.nombre });

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteAlumno(confirm.id);
      const res = await getAlumnos();
      setAlumnos(res.data || []);
      toast.success("Alumno eliminado");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo eliminar el alumno");
    } finally {
      setConfirm({ open: false, id: null, name: "" });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Alumnos</h1>
          <p className="text-sm text-gray-500">Administra el registro y asignación de programas.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm">
            <UserPlus className="h-4 w-4" />
            Agregar Alumno
          </button>
        </div>
      </div>

      {/* Filtros / Buscador */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Buscar</label>
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-sm">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Nombre, estado, teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>
          <div className="w-full md:w-56">
            <label className="text-xs text-gray-500">Estado</label>
            <select
              value={fEstado}
              onChange={(e) => setFEstado(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Todos</option>
              <option>Activo</option>
              <option>Inactivo</option>
              <option>Retirado</option>
            </select>
          </div>
          <div className="w-full md:w-64">
            <label className="text-xs text-gray-500">Programa</label>
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={fPrograma}
                onChange={(e) => setFPrograma(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
              >
                <option value="">Todos</option>
                {programas.map((p) => (
                  <option key={p.id_programa} value={p.id_programa}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 border-b">Nombre</th>
              <th className="px-4 py-2 border-b">Fecha de nacimiento</th>
              <th className="px-4 py-2 border-b">Género</th>
              <th className="px-4 py-2 border-b">Teléfono</th>
              <th className="px-4 py-2 border-b">Programas</th>
              <th className="px-4 py-2 border-b">Estado</th>
              <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnosFiltrados.map((m) => (
              <tr key={m.id_alumno} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{m.nombre}</td>
                <td className="px-4 py-2 border-b">{m.fecha_nacimiento?.slice(0, 10)}</td>
                <td className="px-4 py-2 border-b">{m.genero}</td>
                <td className="px-4 py-2 border-b">{m.telefono_contacto}</td>
                <td className="px-4 py-2 border-b">
                  <div className="flex flex-wrap gap-1">
                    {(m.programas || []).map((p) => (
                      <Badge key={p.id_programa}>{p.nombre}</Badge>
                    ))}
                    {(!m.programas || m.programas.length === 0) && (
                      <span className="text-xs text-gray-400">Sin programas</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 border-b">{m.estado}</td>
                <td className="px-4 py-2 border-b">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(m)}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => askDelete(m)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {alumnosFiltrados.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  {loading ? "Cargando..." : "No se encontraron alumnos"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <Modal
          title={editing ? "Editar Alumno" : "Agregar Alumno"}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Género</label>
                <select
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
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
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:opacity-60"
              >
                {editing ? "Guardar cambios" : "Crear alumno"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmación eliminar */}
      <ConfirmDialog
        open={confirm.open}
        title="Eliminar alumno"
        message={`¿Seguro que deseas eliminar a "${confirm.name}"? Esta acción no se puede deshacer.`}
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
