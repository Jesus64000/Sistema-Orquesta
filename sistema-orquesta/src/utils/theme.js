// Utilidades para manejar el tema (light|dark|system)
const STORAGE_KEY = 'theme_preference'; // values: 'dark'|'light'|'system'
const STORAGE_CONTRAST = 'ui_contrast'; // 'normal'|'high'
const STORAGE_PERSONALIZACION = 'app:theme:personalizacion:v1';

// Helpers for personalizacion theme
function toRgbTriplet(c) {
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
  const nums = s.replace(/rgb\(|\)|rgba\(|\)/g,'').trim().split(/[ ,]+/).map(n=>Number(n)).filter(n=>!Number.isNaN(n));
  if (nums.length >= 3) return `${nums[0]} ${nums[1]} ${nums[2]}`;
  return null;
}

function getSystemDefaultsColors() {
  try {
    const html = document.documentElement;
    const hadDark = html.classList.contains('dark');
    // light
    html.classList.remove('dark');
    const ls = getComputedStyle(html);
    const light = {
      fondo: ls.getPropertyValue('--bg').trim() || null,
      texto: ls.getPropertyValue('--fg').trim() || null,
      secundario: ls.getPropertyValue('--card').trim() || null,
      textoSecundario: ls.getPropertyValue('--muted').trim() || null,
      primario: getComputedStyle(html).getPropertyValue('--color-primary').trim() || '#f59e0b'
    };
    // dark
    html.classList.add('dark');
    const ds = getComputedStyle(html);
    const dark = {
      fondo: ds.getPropertyValue('--bg').trim() || null,
      texto: ds.getPropertyValue('--fg').trim() || null,
      secundario: ds.getPropertyValue('--card').trim() || null,
      textoSecundario: ds.getPropertyValue('--muted').trim() || null,
      primario: getComputedStyle(html).getPropertyValue('--color-primary').trim() || '#f59e0b'
    };
    if (!hadDark) html.classList.remove('dark');
    return { claro: light, oscuro: dark };
  } catch {
    return { claro: {}, oscuro: {} };
  }
}

export function applyPersonalizacionTheme() {
  try {
    let saved = null;
    try { const raw = localStorage.getItem(STORAGE_PERSONALIZACION); saved = raw ? JSON.parse(raw) : null; } catch { saved = null; }
    if (!saved || !saved.claro || !saved.oscuro) {
      // nothing to apply, ensure any injected style is removed
      const el = document.getElementById('theme-personalizacion');
      if (el && el.parentNode) el.parentNode.removeChild(el);
      return;
    }
    const defs = getSystemDefaultsColors();
    const lbg = toRgbTriplet(saved.claro.fondo) || toRgbTriplet(defs.claro.fondo) || '255 255 255';
    const lfg = toRgbTriplet(saved.claro.texto) || toRgbTriplet(defs.claro.texto) || '17 24 39';
    const lcard = toRgbTriplet(saved.claro.secundario || saved.claro.card) || toRgbTriplet(defs.claro.secundario) || '247 247 247';
    const lmuted = toRgbTriplet(saved.claro.textoSecundario) || toRgbTriplet(defs.claro.textoSecundario) || '107 114 128';
    const lprimary = saved.claro.primario || defs.claro.primario || '#f59e0b';
    const dbg = toRgbTriplet(saved.oscuro.fondo) || toRgbTriplet(defs.oscuro.fondo) || lbg;
    const dfg = toRgbTriplet(saved.oscuro.texto) || toRgbTriplet(defs.oscuro.texto) || lfg;
    const dcard = toRgbTriplet(saved.oscuro.secundario || saved.oscuro.card) || toRgbTriplet(defs.oscuro.secundario) || lcard;
    const dmuted = toRgbTriplet(saved.oscuro.textoSecundario) || toRgbTriplet(defs.oscuro.textoSecundario) || lmuted;
    const dprimary = saved.oscuro.primario || defs.oscuro.primario || '#f59e0b';
    const css = `:root { --bg: ${lbg}; --fg: ${lfg}; --card: ${lcard}; --muted: ${lmuted}; --color-primary: ${lprimary}; --color-secondary: ${lcard}; --color-accent: ${lprimary}; }
html.dark { --bg: ${dbg}; --fg: ${dfg}; --card: ${dcard}; --muted: ${dmuted}; --color-primary: ${dprimary}; --color-secondary: ${dcard}; --color-accent: ${dprimary}; }
`;
    let el = document.getElementById('theme-personalizacion');
    if (!el) { el = document.createElement('style'); el.id = 'theme-personalizacion'; document.head.appendChild(el); }
    el.textContent = css;
  } catch {
    // noop
  }
}

export function getStoredTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'dark' || v === 'light' || v === 'system') return v;
  } catch (err) {
    void err;
  }
  return null;
}

export function setStoredTheme(value) {
  try {
    if (value === 'dark' || value === 'light' || value === 'system') {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    void err;
  }
}

export function resolveTheme(value) {
  if (value === 'dark' || value === 'light') return value;
  if (value === 'system' || !value) {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (err) {
      void err;
    }
    return 'light';
  }
  return 'light';
}

export function applyTheme(value) {
  // value: 'dark'|'light'|'system' or undefined -> reads stored
  try {
    const stored = value || getStoredTheme();
    const final = resolveTheme(stored);
    const html = document.documentElement;
    if (final === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
    // keep data attribute for UI control (for read by selects)
    if (stored) html.dataset.theme = stored;
    else html.dataset.theme = 'system';
  } catch (err) {
    void err;
  }
}

export function setTheme(value) {
  setStoredTheme(value);
  applyTheme(value);
}

export function getStoredContrast() {
  try {
    const v = localStorage.getItem(STORAGE_CONTRAST);
    if (v === 'high' || v === 'normal') return v;
  } catch (err) { void err; }
  return null;
}

export function setStoredContrast(value) {
  try {
    if (value === 'high' || value === 'normal') localStorage.setItem(STORAGE_CONTRAST, value);
    else localStorage.removeItem(STORAGE_CONTRAST);
  } catch (err) { void err; }
}

export function applyContrast(value) {
  try {
    const stored = value || getStoredContrast();
    if (stored === 'high') document.documentElement.dataset.contrast = 'high';
    else document.documentElement.dataset.contrast = 'normal';
  } catch (err) { void err; }
}

export function setContrast(value) {
  setStoredContrast(value);
  applyContrast(value);
}

const themeUtil = {
  getStoredTheme,
  setStoredTheme,
  resolveTheme,
  applyTheme,
  setTheme,
  getStoredContrast,
  setStoredContrast,
  applyContrast,
  setContrast,
  applyPersonalizacionTheme,
};

export default themeUtil;
