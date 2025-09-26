// src/components/Modal.jsx
import React from "react";
import DialogShell from "./DialogShell";

/*
  Modal genérico ahora delegado a DialogShell.
  Props compatibles previas: title, children, onClose, className.
  Nuevo: size (opcional) para permitir distintos anchos si se requiere.
*/

export default function Modal({ title, children, onClose, className = "", size = "lg" }) {
  return (
    <DialogShell
      open={true}
      title={title}
      onClose={onClose}
      size={size}
      className={className}
    >
      {children}
    </DialogShell>
  );
}

