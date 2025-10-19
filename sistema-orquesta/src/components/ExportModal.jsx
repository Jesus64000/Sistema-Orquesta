import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';

export default function ExportModal({
  open,
  onClose,
  title = 'Exportar',
  entityName = 'registros',
  selectedIds = [],
  defaultFormat = 'csv',
  disabledFormats = [],
  fileBaseName = 'export',
  exporter,
  onExported,
}) {
  const [exportFormat, setExportFormat] = useState(defaultFormat);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setExportFormat(defaultFormat);
  }, [defaultFormat, open]);

  const options = useMemo(
    () => [
      { key: 'csv', title: 'CSV', desc: 'Texto separado por comas', badge: 'Ligero' },
      { key: 'xlsx', title: 'Excel', desc: 'Hoja de cálculo .xlsx', badge: 'Recomendado' },
      { key: 'pdf', title: 'PDF', desc: 'Documento imprimible', badge: 'Presentación' },
    ].filter((opt) => !disabledFormats.includes(opt.key)),
    [disabledFormats]
  );

  const doExport = async () => {
    if (!exporter || typeof exporter !== 'function') {
      toast.error('No hay exportador configurado');
      return;
    }

    try {
      setExporting(true);
      const format = exportFormat;
      const ids = Array.isArray(selectedIds) && selectedIds.length > 0 ? selectedIds : [];

      const res = await exporter({ ids, format });
      const dataBlob = res instanceof Blob ? res : res?.data instanceof Blob ? res.data : null;
      if (!dataBlob) throw new Error('Respuesta de exportación inválida');

      const blob = new Blob([dataBlob], {
        type:
          dataBlob.type || (format === 'pdf'
            ? 'application/pdf'
            : format === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv'),
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileBaseName}_export_${Date.now()}.${format}`;
      a.click();
      onExported?.(a.download);
      onClose?.();
    } catch (e) {
      console.error(e);
      toast.error('Error exportando ' + entityName);
    } finally {
      setExporting(false);
    }
  };

  if (!open) return null;

  return (
    <Modal title={title} onClose={onClose}>
      <div className="min-w-[520px] space-y-5">
        <p className="text-sm muted">
          Exportar {selectedIds?.length > 0 ? `${selectedIds.length} seleccionado${selectedIds.length !== 1 ? 's' : ''}` : `todos los ${entityName}`} como:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setExportFormat(opt.key)}
              className={[
                'text-left rounded-lg border p-3 transition shadow-sm hover:shadow',
                exportFormat === opt.key ? 'border-yellow-500 ring-2 ring-yellow-200 card-90' : 'card-90',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-app">{opt.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full card text-app border">{opt.badge}</span>
              </div>
              <p className="text-xs muted mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>

        <div className="text-xs muted">
          {exportFormat === 'csv' && 'CSV es ideal para importar a otros sistemas o Excel básico.'}
          {exportFormat === 'xlsx' && 'Excel (.xlsx) mantiene formatos y es más cómodo para análisis.'}
          {exportFormat === 'pdf' && 'PDF es mejor para compartir o imprimir; incluye un resumen.'}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg card hover:opacity-95">Cancelar</button>
          <button
            onClick={doExport}
            disabled={exporting}
            className={['px-4 py-2 rounded-lg text-white', exporting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'].join(' ')}
          >
            {exporting ? 'Exportando…' : 'Exportar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
