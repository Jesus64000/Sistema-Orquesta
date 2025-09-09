// src/components/AlumnoDetalle.jsx
import React from "react";
import { X } from "lucide-react";

export default function Modal({ title, children, onClose, className = "" }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3">
      <div className={`bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${className}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
