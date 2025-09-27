import { describe, it, expect } from 'vitest';
import { validateEventoForm } from '../../src/components/Eventos/utils/validateEventoForm';

const tomorrow = new Date(Date.now() + 24*60*60*1000).toISOString().slice(0,10);

describe('validateEventoForm', () => {
  it('retorna válido con datos correctos', () => {
    const res = validateEventoForm({
      titulo: 'Concierto Apertura',
      fecha_evento: tomorrow,
      hora_evento: '19:30',
      lugar: 'Sala Principal',
      descripcion: 'Evento inaugural.'
    });
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual({});
  });

  it('falla si título es muy corto', () => {
    const res = validateEventoForm({
      titulo: 'Co',
      fecha_evento: tomorrow,
      hora_evento: '10:00',
      lugar: 'Auditorio',
      descripcion: ''
    });
    expect(res.valid).toBe(false);
    expect(res.errors.titulo).toBeDefined();
  });

  it('falla con fecha pasada', () => {
    const pasada = '2000-01-01';
    const res = validateEventoForm({
      titulo: 'Evento',
      fecha_evento: pasada,
      hora_evento: '08:00',
      lugar: 'Lugar',
      descripcion: ''
    });
    expect(res.valid).toBe(false);
    expect(res.errors.fecha_evento).toContain('pasado');
  });

  it('falla con hora inválida', () => {
    const res = validateEventoForm({
      titulo: 'Evento',
      fecha_evento: tomorrow,
      hora_evento: '25:61',
      lugar: 'Lugar',
      descripcion: ''
    });
    expect(res.valid).toBe(false);
    expect(res.errors.hora_evento).toBeDefined();
  });

  it('trim aplica a titulo y lugar y descripcion', () => {
    const res = validateEventoForm({
      titulo: '  Concierto  ',
      fecha_evento: tomorrow,
      hora_evento: '12:00',
      lugar: '  Teatro  ',
      descripcion: '  Algo  '
    });
    expect(res.valid).toBe(true);
    expect(res.normalized.titulo).toBe('Concierto');
    expect(res.normalized.lugar).toBe('Teatro');
    expect(res.normalized.descripcion).toBe('Algo');
  });

  it('reporta múltiples errores', () => {
    const res = validateEventoForm({
      titulo: '',
      fecha_evento: '',
      hora_evento: '99:99',
      lugar: '',
      descripcion: ''
    });
    expect(res.valid).toBe(false);
    expect(Object.keys(res.errors).length).toBeGreaterThan(1);
  });
});
