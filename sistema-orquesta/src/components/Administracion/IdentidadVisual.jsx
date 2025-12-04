import React, { useEffect, useState, useRef } from 'react';
import Button from '../ui/Button';
import { getIdentidad, guardarIdentidad } from '../../api/administracion/identidad';

function Preview({ url, file, label }) {
  const [objUrl, setObjUrl] = useState(null);
  useEffect(() => {
    if (file) {
      const u = URL.createObjectURL(file);
      setObjUrl(u);
      return () => URL.revokeObjectURL(u);
    }
    setObjUrl(null);
  }, [file]);
  const src = objUrl || url || '';
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="text-xs muted">{label}</div>
      {src ? (
        <img src={src} alt={label} className="border rounded max-h-28 max-w-[220px] object-contain" />
      ) : (
        <div className="border rounded h-28 w-40 grid place-items-center text-xs muted bg-white">Sin {label.toLowerCase()}</div>
      )}
    </div>
  );
}

export default function IdentidadVisual() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState({ appLogo: '/logo.png', sello: null, firma: null, includeSeal: true, includeSignature: true });
  // No permitimos cambiar el logo de la app desde la UI: el logo del
  // sistema se mantiene fijo desde `public/logo.png`. Aquí solo se pueden
  // subir el `sello` y la `firma` que se usan en los PDFs.
  const [files, setFiles] = useState({ sello: null, firma: null });

  const fetchState = async () => {
    setLoading(true);
    try {
      const { data } = await getIdentidad();
      if (data && data.ok) {
        setState({
          appLogo: '/logo.png', // Siempre mostrar el logo del sistema
          sello: data.sello || null,
          firma: data.firma || null,
          includeSeal: typeof data.includeSeal === 'boolean' ? data.includeSeal : true,
          includeSignature: typeof data.includeSignature === 'boolean' ? data.includeSignature : true,
        });
      }
    } catch (e) {
      console.warn('getIdentidad failed', e);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchState(); }, []);

  const onFile = (key, f) => setFiles(prev => ({ ...prev, [key]: f || null }));
  const selloRef = useRef(null);
  const firmaRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    // Permitir guardar aunque no haya archivos (para actualizar solo toggles)
    setSaving(true);
    try {
      // No enviamos `appLogo` para no afectar el logo del sistema.
      const payload = {
        sello: files.sello,
        firma: files.firma,
        includeSeal: state.includeSeal,
        includeSignature: state.includeSignature,
      };
      const res = await guardarIdentidad(payload);
      if (res?.data?.ok) {
        // Actualizar UI con respuesta del servidor sin esperar nuevo GET
        const d = res.data;
        setFiles({ sello: null, firma: null });
        setState(s => ({
          ...s,
          // Aunque el servidor pueda devolver appLogo, no lo usamos como
          // logo de la app en la UI principal.
          appLogo: '/logo.png',
          sello: d.sello || s.sello,
          firma: d.firma || s.firma,
          includeSeal: typeof d.includeSeal === 'boolean' ? d.includeSeal : s.includeSeal,
          includeSignature: typeof d.includeSignature === 'boolean' ? d.includeSignature : s.includeSignature,
        }));
        // Notificar globalmente para que la navbar se actualice sin recargar
  try { window.dispatchEvent(new CustomEvent('identity:updated', { detail: d })); } catch (e) { void e; }
        alert('Identidad actualizada');
      }
    } catch (e) {
      alert('No se pudo guardar. Revisa el formato/tamaño.');
      console.warn('guardarIdentidad error', e);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Identidad visual</h2>
        <p className="muted text-sm">Sube tu logo institucional, sello y firma para usarlos en el sistema y las exportaciones PDF.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="card p-4 space-y-4">
          <h3 className="font-semibold">Actual</h3>
          {loading ? <div className="text-sm muted">Cargando…</div> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Preview url={state.appLogo} label="Logo de la app" />
              <Preview url={state.sello} label="Sello" />
              <Preview url={state.firma} label="Firma" />
            </div>
          )}
        </div>

        <form className="card p-4 space-y-4" onSubmit={onSubmit}>
          <h3 className="font-semibold">Subir nuevos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Logo de la app</label>
              <div className="mt-1">
                <Preview url={state.appLogo} label="Logo de la app" />
                <p className="text-xs muted mt-1">El logo del sistema se toma desde <code>public/logo.png</code> y no puede cambiarse desde aquí.</p>
              </div>
            </div>
            {/* exportLogo retirado: el logo de exportación se toma del logo del sistema fijo */}
            <div>
              <label className="text-sm font-medium">Sello</label>
              <div className="mt-1 flex items-center gap-3">
                <input ref={selloRef} type="file" accept="image/*" onChange={e=>onFile('sello', e.target.files?.[0] || null)} className="hidden" />
                <Button type="button" variant="neutral" onClick={() => selloRef.current?.click()}>Seleccionar sello</Button>
                {files.sello ? (
                  <span className="text-sm muted">{files.sello.name}</span>
                ) : (state.sello ? (
                  <a href={state.sello} target="_blank" rel="noreferrer" className="text-sm muted underline">Ver actual</a>
                ) : null)}
              </div>
              <div className="mt-2">
                <Preview file={files.sello} url={state.sello} label="Sello" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Firma</label>
              <div className="mt-1 flex items-center gap-3">
                <input ref={firmaRef} type="file" accept="image/*" onChange={e=>onFile('firma', e.target.files?.[0] || null)} className="hidden" />
                <Button type="button" variant="neutral" onClick={() => firmaRef.current?.click()}>Seleccionar firma</Button>
                {files.firma ? (
                  <span className="text-sm muted">{files.firma.name}</span>
                ) : (state.firma ? (
                  <a href={state.firma} target="_blank" rel="noreferrer" className="text-sm muted underline">Ver actual</a>
                ) : null)}
              </div>
              <div className="mt-2">
                <Preview file={files.firma} url={state.firma} label="Firma" />
              </div>
            </div>
            <div className="flex items-center gap-4 col-span-1 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!state.includeSeal} onChange={e=>setState(s=>({...s, includeSeal: e.target.checked}))} />
                Incluir sello en PDFs
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!state.includeSignature} onChange={e=>setState(s=>({...s, includeSignature: e.target.checked}))} />
                Incluir firma en PDFs
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
            <Button type="button" variant="ghost" onClick={()=>setFiles({ sello: null, firma: null })}>Limpiar selección</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
