export default function AccessDenied({ title = 'Acceso restringido', message = 'No tienes permisos para ver esta sección.', action = null }) {
  return (
    <div className="min-h-[50vh] grid place-items-center">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-red-50 border border-red-100 text-red-600 grid place-items-center text-xl font-bold">!</div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-600">{message}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
