import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
let lastActiveElement = null; // elemento que tenía foco antes de abrir el primer dialog

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
  ariaDescribedBy,
}) {
  const localRef = useRef(null);
  const panelRef = initialFocus || localRef;

  // Ensure a global tracker that records when the last mousedown/touchstart
  // happened inside an element marked with [data-no-close] or a flatpickr calendar.
  // This helps the overlay ignore accidental downs that should not close dialogs.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__dialogNoCloseInstalled) return;
    window.__dialogNoCloseInstalled = true;
    window.__dialogLastNoCloseTime = 0;
    const onDown = (ev) => {
      try {
        const t = ev.target;
        if (t && t instanceof Element && (t.closest('[data-no-close]') || t.closest('.flatpickr-calendar'))) {
          window.__dialogLastNoCloseTime = Date.now();
        } else {
          // reset to 0 when down is outside
          window.__dialogLastNoCloseTime = 0;
        }
      } catch {
        /* noop */
      }
    };
    document.addEventListener('mousedown', onDown, true);
    document.addEventListener('touchstart', onDown, true);
  }, []);

  // Manejo de apertura/cierre: scroll lock + foco inicial + restaurar foco + aria-hidden fondo
  useEffect(() => {
    if (open) {
      if (openCount === 0) {
        lastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }
      openCount += 1;
      document.body.classList.add("overflow-hidden");
      // Mover foco al panel primero para evitar que un hijo del root quede enfocado
      try { panelRef.current?.focus?.(); } catch { /* noop */ }
      // Luego ocultar el root (y hacerlo inerte) para lectores de pantalla y navegación
      if (openCount === 1) {
        const root = document.getElementById("root");
        if (root) {
          try { root.setAttribute("aria-hidden", "true"); } catch { /* noop */ }
          try { root.setAttribute("inert", ""); } catch { /* noop */ }
        }
      }
    }
    return () => {
      if (open) {
        openCount = Math.max(0, openCount - 1);
        if (openCount === 0) {
          document.body.classList.remove("overflow-hidden");
          const root = document.getElementById("root");
          if (root) {
            try { root.removeAttribute("aria-hidden"); } catch { /* noop */ }
            try { root.removeAttribute("inert"); } catch { /* noop */ }
          }
          // Restaurar foco al último elemento activo si sigue en el documento
            if (lastActiveElement && document.contains(lastActiveElement)) {
              try { lastActiveElement.focus(); } catch { /* noop */ }
            }
            lastActiveElement = null;
        }
      }
    };
  }, [open, panelRef]);

  // Escape + focus trap (Tab y Shift+Tab) dentro del panel
  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (e.key === "Tab") {
        const root = panelRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const list = Array.from(focusables);
        const first = list[0];
        const last = list[list.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, panelRef]);

  if (!open) return null;

  const isStringTitle = typeof title === 'string';
  const labelId = isStringTitle ? `dialog-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onMouseDown={(e) => {
          try {
            // Use elementFromPoint to determine the topmost element at the pointer.
            const x = e.clientX;
            const y = e.clientY;
            const top = (typeof document.elementFromPoint === 'function') ? document.elementFromPoint(x, y) : null;
            if (top && top instanceof Element) {
              if (top.closest('.flatpickr-calendar') || top.closest('[data-no-close]')) return;
            }
            // Fallback: also check the original event target
            const t = e.target;
            if (t && t instanceof Element) {
              if (t.closest('.flatpickr-calendar') || t.closest('[data-no-close]')) return;
            }
          } catch {
            // noop
          }
          onClose?.();
        }}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
  aria-labelledby={labelId}
  aria-label={!isStringTitle ? (ariaLabel || 'Diálogo') : undefined}
        aria-describedby={ariaDescribedBy}
  className={`relative w-full ${sizeMap[size] || sizeMap.md} card rounded-2xl shadow-xl border outline-none min-h-[200px] ${className}`}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between px-5 py-4 border-b card-90">
            <h3 id={labelId} className="text-base font-semibold text-app">
              {isStringTitle ? title : title}
            </h3>
            {showClose && (
              <button
                onClick={() => onClose?.()}
                className="p-2 rounded-lg hover:card-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
