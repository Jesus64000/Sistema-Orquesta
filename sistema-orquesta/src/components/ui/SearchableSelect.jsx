import React, { useEffect, useMemo, useRef, useState } from "react";

// SearchableSelect
// Props:
// - options: Array<{ label: string, value: string }>
// - value: string
// - onChange: (value: string) => void
// - placeholder?: string
// - className?: string
// - noResultsText?: string
// - ariaLabel?: string
export default function SearchableSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Seleccionar...",
  className = "",
  noResultsText = "Sin resultados",
  ariaLabel,
}) {
  const ref = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const current = options.find((o) => String(o.value) === String(value));

  // Sync input text with current value when it changes externally
  useEffect(() => {
    if (current) setQuery(current.label);
    else setQuery("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // keyboard navigation within list
  const onListKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((idx) => {
        if (filtered.length === 0) return -1;
        const delta = e.key === "ArrowDown" ? 1 : -1;
        let next = idx + delta;
        if (next < 0) next = filtered.length - 1;
        if (next >= filtered.length) next = 0;
        return next;
      });
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(filtered.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        const opt = filtered[activeIndex];
        onChange?.(opt.value);
        setOpen(false);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (!open) return;
    if (activeIndex < 0) return;
    const list = listRef.current;
    if (!list) return;
    const item = list.querySelector(`[data-opt-index="${activeIndex}"]`);
    if (item) item.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true); setActiveIndex(0); }}
          onFocus={() => { setOpen(true); setActiveIndex(0); }}
          placeholder={placeholder}
          aria-label={ariaLabel || placeholder}
          className="w-full px-3 py-2 border rounded-lg text-sm card focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:muted"
        />
        <svg className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full card rounded-xl shadow-lg p-2 border" role="presentation">
          <div
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            onKeyDown={onListKeyDown}
            className="max-h-56 overflow-auto focus:outline-none"
          >
            {filtered.length === 0 && (
              <div className="px-2 py-1 text-xs muted">{noResultsText}</div>
            )}
            {filtered.map((opt, idx) => {
              const selected = String(opt.value) === String(value);
              const active = idx === activeIndex;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  data-opt-index={idx}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => { onChange?.(opt.value); setOpen(false); }}
                  className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm ${active ? 'card-90 shadow-sm' : 'hover:shadow-sm'} ${selected ? 'font-medium text-app' : 'text-app muted'}`}
                >
                  <span className={`h-4 w-4 inline-flex items-center justify-center border rounded-sm text-[10px] ${selected ? 'bg-yellow-400 border-yellow-400 text-app' : 'card-90 border'}`} aria-hidden="true">
                    {selected ? '✓' : ''}
                  </span>
                  <span className="truncate">{opt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
