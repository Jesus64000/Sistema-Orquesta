import React, { useEffect, useState } from 'react';
import themeUtil from '../../utils/theme';

export default function ThemeToggle({ className = '', variant = 'chip' }) {
  // displayMode holds the resolved theme we show in the UI: 'dark' | 'light'
  const [displayMode, setDisplayMode] = useState(() => themeUtil.resolveTheme(themeUtil.getStoredTheme()));

  useEffect(() => {
    // Ensure theme applied on mount
    themeUtil.applyTheme();
    setDisplayMode(themeUtil.resolveTheme(themeUtil.getStoredTheme()));

  // If the stored theme is 'system' (or unset), listen for system changes to update displayMode
  const mql = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const onChange = () => {
      const curStored = themeUtil.getStoredTheme();
      if (!curStored || curStored === 'system') {
        setDisplayMode(themeUtil.resolveTheme('system'));
      }
    };
    if (mql) {
      if (mql.addEventListener) mql.addEventListener('change', onChange);
      else mql.addListener(onChange);
    }
    return () => {
      if (mql) {
        if (mql.removeEventListener) mql.removeEventListener('change', onChange);
        else mql.removeListener(onChange);
      }
    };
  }, []);

  const toggle = () => {
    const resolved = themeUtil.resolveTheme(themeUtil.getStoredTheme());
    const next = resolved === 'dark' ? 'light' : 'dark';
    // Persist explicit choice and apply
    themeUtil.setTheme(next);
    setDisplayMode(next);
  };

  const isSidebar = variant === 'sidebar';
  const baseClasses = isSidebar
    ? 'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:card card text-app justify-start'
    : 'inline-flex items-center gap-2 px-3 py-1 rounded-full card text-app text-sm';

  return (
    <button
      type="button"
      onClick={toggle}
      title={`Tema: ${displayMode === 'dark' ? 'Oscuro' : 'Claro'}`}
      className={`${baseClasses} ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isSidebar ? 'h-5 w-5' : 'h-4 w-4'}>
        {displayMode === 'dark' ? (
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        ) : (
          <circle cx="12" cy="12" r="5" />
        )}
      </svg>
      <span className={isSidebar ? '' : 'hidden sm:inline'}>
        {displayMode === 'dark' ? 'Oscuro' : 'Claro'}
      </span>
    </button>
  );
}
