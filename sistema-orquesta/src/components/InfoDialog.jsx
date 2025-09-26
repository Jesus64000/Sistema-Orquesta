// src/components/InfoDialog.jsx
import React from "react";
import DialogShell from "./DialogShell";

export default function ErrorDialog({ open, title, message, onClose }) {
  return (
    <DialogShell
      open={open}
      title={title}
      onClose={onClose}
      size="sm"
      ariaLabel={title}
      className=""
    >
      <div className="text-sm text-gray-600 leading-relaxed">
        {message}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onClose}
          className="h-10 px-5 rounded-full text-sm font-medium bg-gradient-to-b from-red-600 to-red-700 text-white border border-red-700 shadow-sm hover:from-red-500 hover:to-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          Cerrar
        </button>
      </div>
    </DialogShell>
  );
}
