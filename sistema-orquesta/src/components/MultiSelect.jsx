// src/components/MultiSelect.jsx
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

/**
 * options: array { id_programa, nombre }
 * value: array of ids
 * onChange: (newArray) => void
 */
export default function MultiSelect({ options = [], value = [], onChange, placeholder = "Seleccionar..." }) {
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
            selected.map((s) => (
              <span key={s.id_programa} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-gray-800 border border-yellow-200">
                {s.nombre}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Quitar ${s.nombre}`}
                  onClick={(e) => { e.stopPropagation(); toggle(s.id_programa); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); toggle(s.id_programa); } }}
                  className="ml-1 cursor-pointer focus:outline-none"
                  style={{ display: 'inline-flex' }}
                >
                  <X className="h-3 w-3" />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-lg p-2">
          <div className="max-h-52 overflow-auto space-y-1">
            {options.map((opt) => {
              const checked = value.includes(opt.id_programa);
              return (
                <label key={opt.id_programa} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={checked} onChange={() => toggle(opt.id_programa)} />
                  <span className="text-sm">{opt.nombre}</span>
                </label>
              );
            })}
          </div>
          {value.length > 0 && (
            <div className="flex justify-between items-center pt-2 mt-2 border-t">
              <span className="text-xs text-gray-500">{value.length} seleccionado(s)</span>
              <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => onChange([])}>
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
