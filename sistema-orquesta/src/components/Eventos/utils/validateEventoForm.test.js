import { describe, it, expect } from 'vitest';
import { validateEventoForm } from './validateEventoForm.js';

function futureDate(days=1) {
  const d = new Date(Date.now() + days*86400000);
  return d.toISOString().slice(0,10);
}

describe('validateEventoForm', () => {
  it('rechaza título corto', () => {
    const { valid, errors } = validateEventoForm({ titulo:'ab', fecha_evento: futureDate(), hora_evento: '10:00', lugar: 'Sala' });
    expect(valid).toBe(false);
    expect(errors.titulo).toBeTruthy();
  });
  it('acepta datos mínimos válidos', () => {
    const { valid, errors, normalized } = validateEventoForm({ titulo:'Evento X', fecha_evento: futureDate(), hora_evento: '09:30', lugar: 'Sala 1', descripcion:'  test  ' });
    expect(valid).toBe(true);
    expect(errors.titulo).toBeUndefined();
    expect(normalized.descripcion).toBe('test');
    expect(normalized.estado).toBe('PROGRAMADO');
  });
  it('detecta fecha pasada', () => {
    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
    const { valid, errors } = validateEventoForm({ titulo:'Evento', fecha_evento: yesterday, hora_evento: '10:00', lugar: 'Sitio' });
    expect(valid).toBe(false);
    expect(errors.fecha_evento).toContain('pasado');
  });
  it('normaliza estado válido a mayúsculas', () => {
    const { valid, normalized } = validateEventoForm({ titulo:'Aaa', fecha_evento: futureDate(), hora_evento:'11:00', lugar:'Sala', estado:'en_curso' });
    expect(valid).toBe(true);
    expect(normalized.estado).toBe('EN_CURSO');
  });
  it('rechaza estado inválido', () => {
    const { valid, errors } = validateEventoForm({ titulo:'Aaa', fecha_evento: futureDate(), hora_evento:'11:00', lugar:'Sala', estado:'XXX' });
    expect(valid).toBe(false);
    expect(errors.estado).toBe('Estado inválido');
  });
});
