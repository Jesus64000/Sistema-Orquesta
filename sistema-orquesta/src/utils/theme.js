// Utilidades para manejar el tema (light|dark|system)
const STORAGE_KEY = 'theme_preference'; // values: 'dark'|'light'|'system'
const STORAGE_CONTRAST = 'ui_contrast'; // 'normal'|'high'

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
};

export default themeUtil;
