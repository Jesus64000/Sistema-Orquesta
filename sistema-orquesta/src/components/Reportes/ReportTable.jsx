import React from "react";

// Detecta si el valor es numérico
function isNumeric(val) {
  return typeof val === 'number' || (!isNaN(val) && val !== null && val !== '' && !Array.isArray(val) && isFinite(val));
}

export default function ReportTable({ title, data = [], cols, Icon }) {
  // Determinar alineación por columna usando la primera fila de datos
  const alignByCol = cols.map(c => {
    if (data && data.length > 0) {
      return isNumeric(data[0][c]) ? 'text-right' : 'text-left';
    }
    // Por defecto, texto a la izquierda
    return 'text-left';
  });

  return (
    <div className="card-90 rounded-2xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold flex items-center gap-2 text-app">
          {Icon && <Icon className="h-4 w-4"/>}
          {title}
        </h2>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left muted">
            {cols.map((c, idx) => (
              <th key={c} className={`px-4 py-2 border-b ${alignByCol[idx]}`}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row,i)=>(
            <tr key={i} className="text-app">
              {cols.map((c, idx) => (
                <td key={c} className={`px-4 py-2 border-b ${alignByCol[idx]}`}>{row[c]}</td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={cols.length} className="text-center py-4 muted">
                No hay datos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
