// TagSelect.jsx
// Desplegable con apariencia de "tags" (chips) para seleccionar una sola opción.
// Props:
// - options: Array<{ label: string, value: string }>
// - value: string
// - onChange: (value: string) => void
// - size?: 'sm' | 'md'
// - accent?: 'yellow' | 'sky' | 'green' | 'purple' | 'gray'
// - placeholder?: string
// - className?: string

import React, { useEffect, useRef, useState } from "react";

const sizes = {
  sm: {
    trigger: "text-[11px] h-7 px-3",
    chip: "text-[10px] px-2 py-0.5",
  },
  md: {
    trigger: "text-sm h-9 px-4",
    chip: "text-[13px] px-2.5 py-1",
  },
  // ~15% más compacto que md: h-8 (~11% menos), texto 12px (~14% menos), padding más ajustado
  mdCompact: {
    trigger: "text-[12px] h-8 px-3.5",
    // mantenemos el chip del tamaño md para legibilidad en el menú
    chip: "text-[13px] px-2.5 py-1",
  },
};

const accents = {
  yellow: {
    ring: "focus:ring-yellow-300",
    filled: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200",
    // Activo con gradiente suave para armonizar con QuickAction
    active: "bg-gradient-to-b from-yellow-100 to-yellow-200 text-gray-900 border-yellow-300 hover:from-yellow-200 hover:to-yellow-300",
    optionHover: "hover:bg-yellow-100",
    optionActiveExtra: "shadow-inner",
  },
  sky: {
    ring: "focus:ring-sky-400",
    filled: "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200",
    active: "bg-sky-500 text-white border-transparent",
    optionHover: "hover:bg-sky-100",
    optionActiveExtra: "shadow-inner",
  },
  green: {
    ring: "focus:ring-emerald-400",
    filled: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    active: "bg-emerald-500 text-white border-transparent",
    optionHover: "hover:bg-emerald-100",
    optionActiveExtra: "shadow-inner",
  },
  purple: {
    ring: "focus:ring-violet-400",
    filled: "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200",
    active: "bg-violet-500 text-white border-transparent",
    optionHover: "hover:bg-violet-100",
    optionActiveExtra: "shadow-inner",
  },
  gray: {
    ring: "focus:ring-gray-200",
    filled: "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200",
    // Activo con gradiente muy sutil para no verse tan fuerte
    active: "bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 border-gray-300 hover:from-gray-100 hover:to-gray-200",
    optionHover: "hover:bg-gray-100",
    optionActiveExtra: "shadow-inner",
  },
  grayStrong: {
    ring: "focus:ring-gray-300",
    filled: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300",
    active: "bg-gradient-to-b from-gray-200 to-gray-300 text-gray-900 border-gray-400 hover:from-gray-300 hover:to-gray-400",
    optionHover: "hover:bg-gray-200",
    optionActiveExtra: "shadow-inner",
  },
};

export default function TagSelect({ options = [], value, onChange, size = "sm", accent = "gray", placeholder = "Seleccionar", className = "", menuWidth = 160 }) {
  const S = sizes[size] || sizes.sm;
  const A = accents[accent] || accents.gray;
  const [open, setOpen] = useState(false);
  const [align, setAlign] = useState("left"); // left | right
  const ref = useRef(null);

  const current = options.find((o) => o.value === value);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Al abrir, calcular si hay espacio hacia la derecha; si no, alinear a la derecha
  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const desiredWidth = typeof menuWidth === "number" ? menuWidth : parseInt(menuWidth, 10) || 160;
    const gutter = 8; // margen de seguridad
    const spaceRight = window.innerWidth - rect.left;
    if (spaceRight < desiredWidth + gutter) setAlign("right");
    else setAlign("left");
  }, [open, menuWidth]);

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full border ${current ? A.active : A.filled} ${S.trigger} focus:outline-none focus:ring-2 ${A.ring} focus:ring-offset-1 focus:ring-offset-white transition-colors hover:shadow`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{current ? current.label : placeholder}</span>
        <svg className="h-4 w-4 opacity-80" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 bg-white border border-gray-200 shadow-xl rounded-xl p-2 ${align === "right" ? "right-0" : "left-0"}`}
          style={{
            width: typeof menuWidth === "number" ? `${menuWidth}px` : menuWidth,
            maxWidth: "calc(100vw - 16px)",
          }}
        >
          <div className="flex flex-col gap-2">
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => {
                    onChange?.(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left inline-flex items-center justify-start rounded-full border ${S.chip} transition-colors ${selected ? `${A.active} ${A.optionActiveExtra}` : `${A.filled} ${A.optionHover}`}`}
                  role="option"
                  aria-selected={selected}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
