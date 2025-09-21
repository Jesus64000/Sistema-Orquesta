export default function InstrumentosPagination({ page, totalPages, setPage }) {
  return (
    <div className="flex justify-end items-center gap-2">
      <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
      <span className="text-sm">Página {page} de {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Siguiente</button>
    </div>
  );
}
