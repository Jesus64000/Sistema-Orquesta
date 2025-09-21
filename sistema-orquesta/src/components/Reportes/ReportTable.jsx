export default function ReportTable({ title, data, cols, Icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <h2 className="font-semibold mb-3 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4"/>}
        {title}
      </h2>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {cols.map(c => (
              <th key={c} className="px-4 py-2 border-b">
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row,i)=>(
            <tr key={i}>
              {cols.map(c=><td key={c} className="px-4 py-2 border-b">{row[c]}</td>)}
            </tr>
          )) : (
            <tr>
              <td colSpan={cols.length} className="text-center py-4 text-gray-500">
                No hay datos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
