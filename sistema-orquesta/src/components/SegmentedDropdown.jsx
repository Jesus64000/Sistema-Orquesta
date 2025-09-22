import { useEffect, useRef, useState } from "react";

export default function SegmentedDropdown({
  label = "Seleccionar",
  options = [], // [{ key, label }]
  selectedKey,
  onSelect,
  disabled = false,
  align = "right", // right|left
  matchTriggerWidth = false,
  className = "",
  variant = "yellow", // 'yellow' | 'gray'
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const current = options.find((o) => o.key === selectedKey) || options[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`px-2 py-1 rounded-full text-xs border transition flex items-center gap-2 ${
          disabled
            ? (variant === 'gray'
                ? "bg-gray-200 border-gray-300 text-gray-600 opacity-60 cursor-not-allowed"
                : "bg-yellow-300 border-yellow-400 text-gray-700 opacity-60 cursor-not-allowed")
            : (variant === 'gray'
                ? "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                : "bg-yellow-400 border-yellow-500 text-gray-900 hover:bg-yellow-500")
        }`}
      >
        <span className="font-medium">{current?.label || label}</span>
        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute ${align === "left" ? "left-0" : "right-0"} mt-2 ${
            matchTriggerWidth ? "min-w-full" : "w-64"
          } bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50`}
        >
          <div className="flex flex-col gap-1">
            {options.map((o) => (
              <button
                key={o.key}
                disabled={disabled}
                onClick={() => {
                  onSelect?.(o.key);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-lg text-xs border transition flex items-center justify-start ${
                  selectedKey === o.key
                    ? (variant === 'gray'
                        ? "bg-gray-200 border-gray-300 text-gray-900"
                        : "bg-yellow-400 border-yellow-500 text-gray-900")
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="font-medium">{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
