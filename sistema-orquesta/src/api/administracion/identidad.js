// API identidad visual (logo, sello, firma)
import http from '../http';

export function getIdentidad() {
  return http.get('/administracion/identidad');
}

export function guardarIdentidad({ logo, appLogo, exportLogo, sello, firma, includeSeal, includeSignature }) {
  const fd = new FormData();
  if (logo instanceof File) fd.append('logo', logo); // legacy: opcional
  if (appLogo instanceof File) fd.append('appLogo', appLogo);
  if (exportLogo instanceof File) fd.append('exportLogo', exportLogo);
  if (sello instanceof File) fd.append('sello', sello);
  if (firma instanceof File) fd.append('firma', firma);
  if (typeof includeSeal !== 'undefined') fd.append('includeSeal', String(includeSeal));
  if (typeof includeSignature !== 'undefined') fd.append('includeSignature', String(includeSignature));
  // axios detecta FormData y pone multipart automáticamente
  return http.post('/administracion/identidad', fd);
}
