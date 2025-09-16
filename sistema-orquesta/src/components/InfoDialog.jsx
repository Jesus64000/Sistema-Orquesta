// src/components/InfoDialog.jsx
import React from "react";

export default function ErrorDialog({ open, title, message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-red-600">{title}</h4>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
