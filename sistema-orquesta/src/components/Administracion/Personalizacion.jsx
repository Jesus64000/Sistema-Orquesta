import React, { useEffect, useState } from 'react';
import Button from '../ui/Button';
import { getTemasPersonalizacion, guardarTemaPersonalizacion, eliminarTemaPersonalizacion } from '../../api/administracion/personalizacion';

function rgbTripletToHex(triplet) {
  if (!triplet) return null;
  // triplet may be '255 255 255' or '255, 255, 255' or 'rgb(255 255 255)'
  const s = String(triplet).replace(/rgb\(|\)|/g, '').trim();
  const parts = s.split(/[ ,]+/).map(p => parseInt(p, 10)).slice(0,3);
  if (parts.length < 3 || parts.some(isNaN)) return null;
  return '#' + parts.map(n => n.toString(16).padStart(2,'0')).join('');
}

function extractColorFromComputedBackground(elem) {
  try {
    const style = getComputedStyle(elem);
    const bgImage = style.backgroundImage || '';
    // try hex inside gradient
    const hexMatch = bgImage.match(/#[0-9a-fA-F]{3,6}/);
    if (hexMatch) return hexMatch[0];
    // fallback to backgroundColor
    const bg = style.backgroundColor || '';
    const rgbMatch = bg.match(/rgba?\(([^)]+)\)/);
    if (rgbMatch) {
      return rgbTripletToHex(rgbMatch[1]);
    }
  } catch (err) {
    console.warn('extractColorFromComputedBackground error', err);
  }
  return null;
}

function getSystemDefaults() {
  if (typeof document === 'undefined') {
    return {
      claro: { fondo:'#ffffff', texto:'#111827', primario:'#f59e0b', secundario:'#374151', textoSecundario:'#6b7280', card:'#f7f7f7' },
      oscuro: { fondo:'#05060a', texto:'#f8fafc', primario:'#f59e0b', secundario:'#1f2937', textoSecundario:'#9ca3af', card:'#0b0b0b' }
    };
  }
  const html = document.documentElement;
  const hadDark = html.classList.contains('dark');
  // compute light values (ensure dark class removed)
  try { html.classList.remove('dark'); } catch (err) { console.warn('Could not remove dark class', err); }
  const lightStyle = getComputedStyle(document.documentElement);
  const lightBg = rgbTripletToHex(lightStyle.getPropertyValue('--bg')) || '#ffffff';
  const lightFg = rgbTripletToHex(lightStyle.getPropertyValue('--fg')) || '#111827';
  const lightCard = rgbTripletToHex(lightStyle.getPropertyValue('--card')) || '#f7f7f7';
  const lightMuted = rgbTripletToHex(lightStyle.getPropertyValue('--muted')) || '#6b7280';

  // compute dark values (ensure dark class present)
  try { html.classList.add('dark'); } catch (err) { console.warn('Could not add dark class', err); }
  const darkStyle = getComputedStyle(document.documentElement);
  const darkBg = rgbTripletToHex(darkStyle.getPropertyValue('--bg')) || null;
  const darkFg = rgbTripletToHex(darkStyle.getPropertyValue('--fg')) || '#f8fafc';
  const darkCard = rgbTripletToHex(darkStyle.getPropertyValue('--card')) || '#0b0b0b';
  const darkMuted = rgbTripletToHex(darkStyle.getPropertyValue('--muted')) || '#9ca3af';

  // restore original dark class state
  try {
    if (!hadDark) html.classList.remove('dark');
  } catch (err) { console.warn('Could not restore dark class state', err); }

  // try to extract accent color from .pill--active element (works for both themes)
  const tmp = document.createElement('div');
  tmp.style.position = 'absolute'; tmp.style.left = '-9999px'; tmp.style.top = '-9999px';
  tmp.className = 'pill--active';
  document.body.appendChild(tmp);
  const accentFromClass = extractColorFromComputedBackground(tmp) || '#f59e0b';
  document.body.removeChild(tmp);

  return {
    claro: {
      fondo: lightBg,
      texto: lightFg,
      primario: accentFromClass,
      secundario: lightCard,
      textoSecundario: lightMuted,
      card: lightCard,
    },
    oscuro: {
      fondo: darkBg || darkCard || '#05060a',
      texto: darkFg,
      primario: accentFromClass,
      secundario: darkCard,
      textoSecundario: darkMuted,
      card: darkCard,
    }
  };
}

function useThemeLocalStorage() {
  const key = 'app:theme:personalizacion:v1';
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      const defaults = getSystemDefaults();
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      // merge parsed with defaults (deep for claro/oscuro)
      return {
        claro: { ...(defaults.claro || {}), ...(parsed.claro || {}) },
        oscuro: { ...(defaults.oscuro || {}), ...(parsed.oscuro || {}) },
      };
    } catch {
      return getSystemDefaults();
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) { console.warn('Failed to save theme to localStorage', e); }
  }, [state]);
  return [state, setState, () => localStorage.removeItem(key)];
}

const ColorRow = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-4 p-3 rounded border card-90">
    <div className="flex items-center gap-3">
      <div className="text-sm font-medium text-app">{label}</div>
      <div className="text-xs muted">{value}</div>
    </div>
    <input aria-label={`Selector de color para ${label}`} type="color" value={value} onChange={e => onChange(e.target.value)} className="w-12 h-8 p-0 border rounded" />
  </div>
);

export default function Personalizacion() {
  const [theme, setTheme, clearStorage] = useThemeLocalStorage();
  // serverSaved deprecated in favor of themes list
  const [themes, setThemes] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState(null);
  const DEFAULT_THEME_NAME = 'Tema por defecto';

  const setValue = (mode, key, val) => {
    setTheme(prev => ({ ...prev, [mode]: { ...(prev[mode]||{}), [key]: val } }));
  };

  

  // convierte '#rrggbb' o 'rgb(r g b)' o 'r g b' a 'r g b'
  const toRgbTriplet = (c) => {
    if (!c) return null;
    const s = String(c).trim();
    if (s.startsWith('#')) {
      const hex = s.slice(1);
      const long = hex.length === 3 ? hex.split('').map(ch=>ch+ch).join('') : hex;
      const r = parseInt(long.slice(0,2),16);
      const g = parseInt(long.slice(2,4),16);
      const b = parseInt(long.slice(4,6),16);
      return `${r} ${g} ${b}`;
    }
    // rgb(255 255 255) or rgb(255,255,255) or '255 255 255'
    const nums = s.replace(/rgb\(|\)|rgba\(|\)/g,'').trim().split(/[ ,]+/).map(n=>Number(n)).filter(n=>!Number.isNaN(n));
    if (nums.length >= 3) return `${nums[0]} ${nums[1]} ${nums[2]}`;
    return null;
  };

  // inyecta/actualiza un <style id="theme-personalizacion"> que define variables para :root y html.dark
  const applyThemeToRoot = (light, dark) => {
    try {
      const id = 'theme-personalizacion';
      let el = document.getElementById(id);
  const lbg = toRgbTriplet(light.fondo) || toRgbTriplet(getSystemDefaults().claro.fondo);
  const lfg = toRgbTriplet(light.texto) || toRgbTriplet(getSystemDefaults().claro.texto);
  // Prefer 'secundario' for backgrounds used as secondary surfaces (sidebar, cards), fallback to card
  const lcard = toRgbTriplet(light.secundario || light.card) || toRgbTriplet(getSystemDefaults().claro.secundario || getSystemDefaults().claro.card);
  const lmuted = toRgbTriplet(light.textoSecundario) || toRgbTriplet(getSystemDefaults().claro.textoSecundario);
      const dbg = toRgbTriplet(dark.fondo) || toRgbTriplet(getSystemDefaults().oscuro.fondo);
      const dfg = toRgbTriplet(dark.texto) || toRgbTriplet(getSystemDefaults().oscuro.texto);
  const dcard = toRgbTriplet(dark.secundario || dark.card) || toRgbTriplet(getSystemDefaults().oscuro.secundario || getSystemDefaults().oscuro.card);
  const dmuted = toRgbTriplet(dark.textoSecundario) || toRgbTriplet(getSystemDefaults().oscuro.textoSecundario);
  const lprimary = light.primario || getSystemDefaults().claro.primario || '#f59e0b';
  const dprimary = dark.primario || getSystemDefaults().oscuro.primario || '#f59e0b';

  // Use secundario as the visual secondary surface; also expose it as --color-secondary
  const css = `:root { --bg: ${lbg}; --fg: ${lfg}; --card: ${lcard}; --muted: ${lmuted}; --color-primary: ${lprimary}; --color-secondary: ${lcard}; --color-accent: ${lprimary}; }
html.dark { --bg: ${dbg}; --fg: ${dfg}; --card: ${dcard}; --muted: ${dmuted}; --color-primary: ${dprimary}; --color-secondary: ${dcard}; --color-accent: ${dprimary}; }
`;
      if (!el) {
        el = document.createElement('style'); el.id = id; el.appendChild(document.createTextNode(css)); document.head.appendChild(el);
      } else {
        el.textContent = css;
      }
      // Do NOT set inline color variables for primary/secondary here; rely on the injected stylesheet
      // so html.dark selector can override correctly and secundario/primario are theme-scoped.
    } catch (err) {
      console.warn('applyThemeToRoot failed', err);
    }
  };

  const removeInjectedTheme = () => {
    try {
      const id = 'theme-personalizacion';
      const el = document.getElementById(id);
      if (el && el.parentNode) el.parentNode.removeChild(el);
      const root = document.documentElement;
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-secondary');
      root.style.removeProperty('--color-accent');
      // don't remove --bg/--fg/--card inline because we don't set them inline anymore, but safe to try
      root.style.removeProperty('--bg');
      root.style.removeProperty('--fg');
      root.style.removeProperty('--card');
    } catch (err) {
      console.warn('removeInjectedTheme failed', err);
    }
  };
  // restoreDefaults removed — use 'Borrar guardado' button to clear injected theme and localStorage

  // Server persistence helpers
  const fetchSavedFromServer = async () => {
    try {
      const { data } = await getTemasPersonalizacion();
      if (data && data.saved && Array.isArray(data.themes)) {
        const serverThemes = data.themes.slice(0,3);
        setThemes(serverThemes);
        setSelectedName(prev => prev || DEFAULT_THEME_NAME);
      } else setThemes([]);
    } catch (err) {
      console.warn('fetchSavedFromServer failed', err);
      setThemes([]);
    }
  };

  const saveToServer = async (name) => {
    try {
      if (!name) return false;
      if (name.trim() === DEFAULT_THEME_NAME) { alert('No se puede usar el nombre reservado "' + DEFAULT_THEME_NAME + '"'); return false; }
      const res = await guardarTemaPersonalizacion({ name, theme });
      if (res && res.data && res.data.ok) {
        await fetchSavedFromServer();
        return true;
      }
      if (res && res.data && res.data.error === 'max_themes_reached') alert('Máximo de temas guardados alcanzado (3)');
    } catch (err) { console.warn('saveToServer failed', err); }
    return false;
  };

  const deleteServerSave = async (name) => {
    try {
      const res = await eliminarTemaPersonalizacion(name);
      if (res && res.data && res.data.ok) {
        await fetchSavedFromServer();
        return true;
      }
    } catch (err) { console.warn('deleteServerSave failed', err); }
    return false;
  };

  // load server-saved theme once on mount
  useEffect(() => { fetchSavedFromServer(); }, []);

  return (
  <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1 space-y-6">
        <div className="card p-4">
          <h3 className="font-bold text-xl mb-2">Vista Previa</h3>
          <p className="text-sm muted mb-4">Así se verá el tema claro.</p>
          <div className="rounded-lg border p-4" style={{ background: theme.claro.fondo, color: theme.claro.texto }}>
            <h4 className="font-semibold" style={{ color: theme.claro.texto }}>Ejemplo de Tarjeta (Título)</h4>
            <p className="text-sm" style={{ color: theme.claro.textoSecundario }}>Este es un texto de ejemplo dentro de la tarjeta (texto secundario).</p>
            <div className="mt-4 grid grid-cols-1 gap-3 items-center">
              <div className="flex flex-col items-start gap-1">
                <div className="text-xs muted">Secundario (fondos secundarios — p.ej. barra lateral)</div>
                <div className="w-24 h-8 rounded" style={{ background: theme.claro.secundario }} aria-hidden />
              </div>
            </div>
            <div className="mt-3">
              <small className="muted">Nota: los estilos globales de botones no cambian automáticamente; aquí se muestra cómo afectan las variables (fondo, texto, primario, secundario).</small>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-bold text-xl mb-2">Vista Previa</h3>
          <p className="text-sm muted mb-4">Así se verá el tema oscuro.</p>
          <div className="rounded-lg border p-4" style={{ background: theme.oscuro.fondo, color: theme.oscuro.texto }}>
            <h4 className="font-semibold" style={{ color: theme.oscuro.texto }}>Ejemplo de Tarjeta (Título)</h4>
            <p className="text-sm" style={{ color: theme.oscuro.textoSecundario }}>Este es un texto de ejemplo dentro de la tarjeta (texto secundario).</p>
            <div className="mt-4 grid grid-cols-1 gap-3 items-center">
              <div className="flex flex-col items-start gap-1">
                <div className="text-xs muted">Secundario (fondos secundarios — p.ej. barra lateral)</div>
                <div className="w-24 h-8 rounded" style={{ background: theme.oscuro.secundario }} aria-hidden />
              </div>
            </div>
            <div className="mt-3">
              <small className="muted">Nota: los estilos globales de botones no cambian automáticamente; aquí se muestra cómo afectan las variables (fondo, texto, primario, secundario).</small>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-2 card p-4">
        <h3 className="font-bold text-2xl mb-4">Personalizar Tema</h3>
        {/* Save / Create controls moved to top as requested */}
        <div className="mb-4 flex items-center gap-3">
          <input className="border p-2 rounded w-48" placeholder="Nombre del tema" value={newName} onChange={e=>setNewName(e.target.value)} />
          <Button variant="primary" onClick={async ()=>{
              const name = newName && newName.trim();
              if (!name) return alert('Introduce un nombre válido');
              if (name === DEFAULT_THEME_NAME) return alert('Nombre reservado');
              // if creating new and limit reached
              if (!editingName && themes.length >= 3) return alert('Máximo de temas alcanzado');
              if (await saveToServer(name)) { alert('Tema guardado'); setNewName(''); setEditingName(null); }
            }} disabled={(!newName || newName.trim()==='') || (!editingName && themes.length>=3)}>Guardar tema</Button>
          {editingName && <Button variant="ghost" onClick={()=>{ setEditingName(null); setNewName(''); }}>Cancelar</Button>}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Tema Claro</h4>
            <div className="space-y-3">
              <ColorRow label="Fondo" value={theme.claro.fondo} onChange={v=>setValue('claro','fondo',v)} />
              <ColorRow label="Secundario" value={theme.claro.secundario} onChange={v=>setValue('claro','secundario',v)} />
              <ColorRow label="Texto" value={theme.claro.texto} onChange={v=>setValue('claro','texto',v)} />
              <ColorRow label="Texto secundario" value={theme.claro.textoSecundario} onChange={v=>setValue('claro','textoSecundario',v)} />
              
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Tema Oscuro</h4>
            <div className="space-y-3">
              <ColorRow label="Fondo" value={theme.oscuro.fondo} onChange={v=>setValue('oscuro','fondo',v)} />
              <ColorRow label="Secundario" value={theme.oscuro.secundario} onChange={v=>setValue('oscuro','secundario',v)} />
              <ColorRow label="Texto" value={theme.oscuro.texto} onChange={v=>setValue('oscuro','texto',v)} />
              <ColorRow label="Texto secundario" value={theme.oscuro.textoSecundario} onChange={v=>setValue('oscuro','textoSecundario',v)} />
              
            </div>
          </div>
        </div>
        
          <div className="mt-6">
          <h4 className="font-semibold mb-2">Temas guardados (máx 3)</h4>
          <div className="space-y-2 mb-3">
            <div className={`p-2 rounded border flex items-center justify-between ${selectedName === DEFAULT_THEME_NAME ? 'ring-2 ring-app' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="font-medium">{DEFAULT_THEME_NAME}</div>
                <div className="text-xs muted">Tema original del sistema</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={()=>{ 
                  // Restaurar a tema del sistema: eliminar inyección y limpiar guardado local
                  const defs = getSystemDefaults(); 
                  removeInjectedTheme(); 
                  try { clearStorage(); } catch { /* ignore */ }
                  setTheme(defs); 
                  setSelectedName(DEFAULT_THEME_NAME);
                }}>Aplicar</Button>
              </div>
            </div>
            {themes.length === 0 && <div className="text-sm muted">No hay temas guardados en el servidor.</div>}
            {themes.map(t => (
              <div key={t.name} className={`p-2 rounded border flex items-center justify-between ${selectedName === t.name ? 'ring-2 ring-app' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs muted">{t.theme.claro ? 'Tema' : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={()=>{ 
                    setSelectedName(t.name);
                    let parsed = t.theme;
                    if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch { /* ignore parse error */ } }
                    if (!parsed || !parsed.claro || !parsed.oscuro) { return alert('Tema inválido'); }
                    setTheme(parsed); 
                    applyThemeToRoot(parsed.claro, parsed.oscuro); 
                  }}>Aplicar</Button>
                  <Button variant="neutral" onClick={()=>{ 
                    // Edit: load into editor
                    setEditingName(t.name); setNewName(t.name); 
                    let parsed = t.theme; if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch { /* ignore parse error */ } }
                    if (parsed && parsed.claro && parsed.oscuro) setTheme(parsed);
                    setSelectedName(t.name); 
                  }}>Editar</Button>
                  <Button variant="ghost" onClick={async ()=>{ if (t.name === DEFAULT_THEME_NAME) return alert('No puedes eliminar el tema por defecto'); if (confirm(`Eliminar tema ${t.name}?`)) { if (await deleteServerSave(t.name)) alert('Tema eliminado'); } }}>Eliminar</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={()=>{ removeInjectedTheme(); clearStorage(); const defs = getSystemDefaults(); setTheme(defs); setSelectedName(DEFAULT_THEME_NAME); alert('Temas restaurados a los valores por defecto del sistema'); }}>Restaurar temas por defecto</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
