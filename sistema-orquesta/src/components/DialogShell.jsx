import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

/*
 DialogShell: contenedor base para todos los diálogos/modales.
 Props:
  - open: boolean
  - title?: string
  - children
  - onClose?: () => void
  - size?: 'sm' | 'md' | 'lg' | 'xl'
  - hideHeader?: boolean
  - showClose?: boolean (default true)
  - className?: string (se aplica al panel)
  - initialFocus?: React.RefObject<HTMLElement> (opcional)
  - ariaLabel?: string (si no hay title)

 Accesibilidad básica: role="dialog" aria-modal="true".
 Bloqueo de scroll: añade overflow-hidden al body mientras haya un DialogShell abierto.
*/

let openCount = 0; // contador global simple

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export default function DialogShell({
  open,
  title,
  children,
  onClose,
  size = "md",
  hideHeader = false,
  showClose = true,
  className = "",
  initialFocus,
  ariaLabel,
}) {
  const localRef = useRef(null);
  const panelRef = initialFocus || localRef;

  useEffect(() => {
    if (open) {
      openCount += 1;
      document.body.classList.add("overflow-hidden");
      setTimeout(() => {
        try { panelRef.current?.focus?.(); } catch { /* noop */ }
      }, 0);
    }
    return () => {
      if (open) {
        openCount = Math.max(0, openCount - 1);
        if (openCount === 0) document.body.classList.remove("overflow-hidden");
      }
    };
  }, [open, panelRef]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) {
        onClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const labelId = title ? `dialog-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => onClose?.()} />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        aria-label={!title ? ariaLabel : undefined}
        className={`relative w-full ${sizeMap[size] || sizeMap.md} bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden outline-none ${className}`}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-b from-gray-50 to-white">
            <h3 id={labelId} className="text-base font-semibold text-gray-800">
              {title}
            </h3>
            {showClose && (
              <button
                onClick={() => onClose?.()}
                className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
