import { describe, it, expect } from 'vitest';
import { validateInstrumentoForm, calcularAntiguedad } from '../components/Instrumentos/utils/instrumentoFormUtils';

describe('calcularAntiguedad', () => {
  it('retorna null si no hay fecha', () => {
    expect(calcularAntiguedad(null)).toBeNull();
  });
  it('retorna 0 para fecha futura', () => {
    const futura = new Date();
    futura.setFullYear(futura.getFullYear() + 1);
    expect(calcularAntiguedad(futura.toISOString().slice(0,10))).toBe(0);
  });
});

describe('validateInstrumentoForm', () => {
  const base = {
    nombre: 'Violin',
    id_categoria: '1',
    numero_serie: 'ABC123',
    id_estado: '2',
    fecha_adquisicion: '2022-01-01',
    ubicacion: 'Sala',
  };

  it('es válido con datos correctos', () => {
    const { isValid, errors } = validateInstrumentoForm(base);
    expect(isValid).toBe(true);
    expect(Object.keys(errors).length).toBe(0);
  });

  it('detecta nombre corto', () => {
    const { isValid, errors } = validateInstrumentoForm({ ...base, nombre: 'A' });
    expect(isValid).toBe(false);
    expect(errors.nombre).toBeDefined();
  });

  it('detecta número de serie vacío', () => {
    const { isValid, errors } = validateInstrumentoForm({ ...base, numero_serie: '' });
    expect(isValid).toBe(false);
    expect(errors.numero_serie).toBeDefined();
  });

  it('rechaza fecha futura', () => {
    const futura = new Date();
    futura.setFullYear(futura.getFullYear() + 1);
    const { isValid, errors } = validateInstrumentoForm({ ...base, fecha_adquisicion: futura.toISOString().slice(0,10) });
    expect(isValid).toBe(false);
    expect(errors.fecha_adquisicion).toBeDefined();
  });
});
