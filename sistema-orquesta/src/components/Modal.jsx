// src/components/Modal.jsx
import React from "react";
import DialogShell from "./DialogShell";

/*
  Modal genérico ahora delegado a DialogShell.
  Props: open, title, children, onClose, className, size.
*/

export default function Modal({ open, title, children, onClose, className = "", size = "lg" }) {
  // Backwards compatibility: muchos llamados existentes hacen
  // {state && <Modal ...>} sin pasar 'open'. Antes de la refactor el modal
  // no verificaba 'open' y se renderizaba; el cambio a open=false por defecto
  // rompió esos casos. Si 'open' es undefined/null asumimos que debe mostrarse.
  const isOpen = open === undefined || open === null ? true : open;
  if (!isOpen) return null;
  return (
    <DialogShell
      open={isOpen}
      title={title}
      onClose={onClose}
      size={size}
      className={className}
    >
      {children}
    </DialogShell>
  );
}

