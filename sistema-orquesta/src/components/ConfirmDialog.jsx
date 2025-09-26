// src/components/ConfirmDialog.jsx
import React from "react";
import DialogShell from "./DialogShell";

export default function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Confirmar",
  confirmColor = "bg-gray-900 hover:bg-black",
}) {
  return (
    <DialogShell
      open={open}
      title={title}
      onClose={onCancel}
      size="sm"
      ariaLabel={title}
      className=""
    >
      <div className="text-sm text-gray-600 leading-relaxed">
        {message}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onCancel}
          className="h-10 px-5 rounded-full text-sm font-medium bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 border border-gray-300 hover:from-gray-100 hover:to-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className={`h-10 px-5 rounded-full text-sm font-medium text-white shadow-sm ${confirmColor} focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300`}
        >
          {confirmLabel}
        </button>
      </div>
    </DialogShell>
  );
}
