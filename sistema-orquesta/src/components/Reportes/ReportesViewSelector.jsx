export default function ReportesViewSelector({ viewGlobal, setViewGlobal }) {
  const options = [
    { key: 'tabla', label: 'Tabla' },
    { key: 'grafico', label: 'Gráfico' }
  ];

  const onKeyDown = (e) => {
    const idx = options.findIndex(o => o.key === viewGlobal);
    if (e.key === 'ArrowRight') {
      const next = options[(idx + 1) % options.length];
      setViewGlobal(next.key);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prev = options[(idx - 1 + options.length) % options.length];
      setViewGlobal(prev.key);
      e.preventDefault();
    }
  };

  return (
    <div className="flex gap-2 mb-4 mt-2" role="tablist" aria-label="Ver como">
      {options.map((opt) => {
        const active = viewGlobal === opt.key;
        return (
          <button
            key={opt.key}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={onKeyDown}
            onClick={() => setViewGlobal(opt.key)}
            className={`pill ${active ? 'pill--active' : 'pill--inactive'}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
