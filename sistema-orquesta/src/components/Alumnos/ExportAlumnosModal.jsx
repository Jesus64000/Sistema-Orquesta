import { useState, useEffect } from 'react';
import Modal from '../Modal';
import toast from 'react-hot-toast';

/**
 * ExportAlumnosModal
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - selectedIds: number[] | undefined
 * - defaultFormat?: 'csv' | 'xlsx' | 'pdf'
 * - onExported?: (fileName: string) => void
 */
export default function ExportAlumnosModal({ open, onClose, selectedIds = [], defaultFormat = 'csv', onExported }) {
  const [exportFormat, setExportFormat] = useState(defaultFormat);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setExportFormat(defaultFormat);
  }, [defaultFormat, open]);

  const doExport = async () => {
    try {
      setExporting(true);
      const { exportAlumnos } = await import('../../api/alumnos.js');
      const format = exportFormat;
      const ids = Array.isArray(selectedIds) && selectedIds.length > 0 ? selectedIds : [];
      const res = await exportAlumnos({ ids, format });
      const blob = new Blob([res.data], {
        type:
          format === 'pdf'
            ? 'application/pdf'
            : format === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alumnos_export_${Date.now()}.${format}`;
      a.click();
      if (onExported) onExported(a.download);
      onClose?.();
    } catch (e) {
      console.error(e);
      toast.error('Error exportando alumnos');
    } finally {
      setExporting(false);
    }
  };

  if (!open) return null;

  return (
    <Modal title="Exportar alumnos" onClose={onClose}>
      <div className="min-w-[520px] space-y-5">
        <p className="text-sm text-gray-600">
          Exportar {selectedIds?.length > 0 ? `${selectedIds.length} seleccionado${selectedIds.length !== 1 ? 's' : ''}` : 'todos los alumnos'} como:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: 'csv', title: 'CSV', desc: 'Texto separado por comas', badge: 'Ligero' },
            { key: 'xlsx', title: 'Excel', desc: 'Hoja de cálculo .xlsx', badge: 'Recomendado' },
            { key: 'pdf', title: 'PDF', desc: 'Documento imprimible', badge: 'Presentación' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setExportFormat(opt.key)}
              className={[
                'text-left rounded-lg border p-3 transition shadow-sm hover:shadow',
                exportFormat === opt.key ? 'border-yellow-500 ring-2 ring-yellow-200 bg-yellow-50' : 'border-gray-200 bg-white',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{opt.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border">{opt.badge}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-500">
          {exportFormat === 'csv' && 'CSV es ideal para importar a otros sistemas o Excel básico.'}
          {exportFormat === 'xlsx' && 'Excel (.xlsx) mantiene formatos y es más cómodo para análisis.'}
          {exportFormat === 'pdf' && 'PDF es mejor para compartir o imprimir; incluye un resumen.'}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancelar</button>
          <button
            onClick={doExport}
            disabled={exporting}
            className={[
              'px-4 py-2 rounded-lg text-white',
              exporting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700',
            ].join(' ')}
          >
            {exporting ? 'Exportando…' : 'Exportar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
