import React from "react";

function exportToCSV(data, cols, title) {
  if (!data || !data.length) return;
  const csvRows = [];
  // Encabezados
  csvRows.push(cols.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(","));
  // Filas de datos
  data.forEach(row => {
    csvRows.push(cols.map(c => {
      const val = row[c] !== undefined ? row[c] : "";
      // Escapar comillas y separar por comas
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(","));
  });
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${title.replace(/\s+/g, '_').toLowerCase()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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
        {data && data.length > 0 && (
          <button
            className="text-xs px-3 py-1 rounded bg-gradient-to-b from-yellow-100 to-yellow-200 text-gray-900 border border-yellow-300 hover:from-yellow-200 hover:to-yellow-300 transition"
            onClick={() => exportToCSV(data, cols, title)}
            title="Exportar a CSV"
          >
            Exportar CSV
          </button>
        )}
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
