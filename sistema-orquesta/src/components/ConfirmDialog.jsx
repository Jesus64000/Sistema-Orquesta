// src/components/ConfirmDialog.jsx
import React from "react";
import DialogShell from "./DialogShell";
import Button from "./ui/Button";

export default function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Confirmar",
  confirmVariant = "danger", // danger, primary, dark
}) {
  const descriptionId = title ? `confirm-desc-${title.replace(/\s+/g,'-').toLowerCase()}` : undefined;
  return (
    <DialogShell
      open={open}
      title={title}
      onClose={onCancel}
      size="sm"
      ariaLabel={title}
      className=""
      ariaDescribedBy={descriptionId}
    >
      <div id={descriptionId} className="text-sm text-gray-600 leading-relaxed">{message}</div>
      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant={confirmVariant}
          size="sm"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </DialogShell>
  );
}
