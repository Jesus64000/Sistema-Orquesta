// src/components/MultiSelect.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDown, X } from "lucide-react";

/**
 * options: array { id_programa, nombre }
 * value: array of ids
 * onChange: (newArray) => void
 */
export default function MultiSelect({ options = [], value = [], onChange, placeholder = "Seleccionar..." }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // índice para navegación por teclado
  const rootRef = useRef(null);
  const listRef = useRef(null);

  // cerrar clic fuera
  useEffect(() => {
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const toggle = useCallback((id) => {
    const exists = value.includes(id);
    if (exists) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  }, [value, onChange]);

  const selected = options.filter((o) => value.includes(o.id_programa));

  // manejar teclas en el botón activador
  const onTriggerKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setTimeout(() => setActiveIndex(0), 0);
      } else {
        setActiveIndex((idx) => {
          if (options.length === 0) return -1;
            const delta = e.key === 'ArrowDown' ? 1 : -1;
            let next = idx + delta;
            if (next < 0) next = options.length - 1;
            if (next >= options.length) next = 0;
            return next;
        });
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((s) => !s);
      if (!open) setTimeout(() => setActiveIndex(0), 0);
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Backspace' && !open && value.length > 0) {
      // quitar el último seleccionado
      const last = value[value.length - 1];
      onChange(value.filter(v => v !== last));
    }
  };

  // manejar teclas dentro del listado
  const onListKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((idx) => {
        if (options.length === 0) return -1;
        const delta = e.key === 'ArrowDown' ? 1 : -1;
        let next = idx + delta;
        if (next < 0) next = options.length - 1;
        if (next >= options.length) next = 0;
        return next;
      });
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < options.length) {
        toggle(options[activeIndex].id_programa);
      }
    } else if (e.key === 'Tab') {
      // cerrar al tabular fuera
      setOpen(false);
    }
  };

  // scroll al elemento activo
  useEffect(() => {
    if (!open) return;
    if (activeIndex < 0) return;
    const list = listRef.current;
    if (!list) return;
    const item = list.querySelector(`[data-opt-index="${activeIndex}"]`);
    if (item) {
      const r = item.getBoundingClientRect();
      const lr = list.getBoundingClientRect();
      if (r.top < lr.top) item.scrollIntoView({ block: 'nearest' });
      else if (r.bottom > lr.bottom) item.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open ? 'true' : 'false'}
        onClick={() => { setOpen((s) => !s); if (!open) setActiveIndex(0); }}
        onKeyDown={onTriggerKeyDown}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
      >
        <div className="flex flex-wrap gap-1 text-left">
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
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-lg p-2" role="presentation">
          <div
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            onKeyDown={onListKeyDown}
            className="max-h-52 overflow-auto focus:outline-none"
            aria-multiselectable="true"
          >
            {options.map((opt, idx) => {
              const checked = value.includes(opt.id_programa);
              const active = idx === activeIndex;
              return (
                <div
                  key={opt.id_programa}
                  role="option"
                  aria-selected={checked ? 'true' : 'false'}
                  data-opt-index={idx}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => toggle(opt.id_programa)}
                  className={
                    `flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm ` +
                    (active ? 'bg-yellow-50 ring-1 ring-yellow-300 ' : 'hover:bg-gray-50 ') +
                    (checked ? 'font-medium text-gray-900' : 'text-gray-700')
                  }
                >
                  <span
                    className={`h-4 w-4 inline-flex items-center justify-center border rounded-sm text-[10px] ` +
                      (checked ? 'bg-yellow-400 border-yellow-400 text-gray-900' : 'bg-white border-gray-300')}
                    aria-hidden="true"
                  >
                    {checked ? '✓' : ''}
                  </span>
                  {opt.nombre}
                </div>
              );
            })}
            {options.length === 0 && (
              <div className="px-2 py-1 text-xs text-gray-500">Sin opciones</div>
            )}
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
