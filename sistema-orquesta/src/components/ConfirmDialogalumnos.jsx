// Obsoleto: confirm dialog específico alumnos. Reescrito usando DialogShell para consistencia.
import React from "react";
import DialogShell from "./DialogShell";

export default function ConfirmDialogAlumnos({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = "Confirmar",
  confirmColor = "red",
}) {
  const colorClasses =
    confirmColor === "red"
      ? "from-red-600 to-red-700 border-red-700 hover:from-red-500 hover:to-red-600"
      : "from-emerald-600 to-emerald-700 border-emerald-700 hover:from-emerald-500 hover:to-emerald-600";

  return (
    <DialogShell open={open} title={title} onClose={onCancel} size="sm" ariaLabel={title}>
      <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onCancel}
          className="h-10 px-5 rounded-full text-sm font-medium bg-gradient-to-b from-gray-50 to-gray-100 text-gray-700 border border-gray-300 hover:from-gray-100 hover:to-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className={`h-10 px-5 rounded-full text-sm font-medium text-white border shadow-sm bg-gradient-to-b ${colorClasses} focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300`}
        >
          {confirmText}
        </button>
      </div>
    </DialogShell>
  );
}
