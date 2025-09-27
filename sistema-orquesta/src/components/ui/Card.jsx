// Componente Card reutilizable para unificar estilo entre Dashboard y Eventos
import React from 'react';
export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-md border border-gray-200 p-5 ${className}`}>
    {children}
  </div>
);

export default Card;