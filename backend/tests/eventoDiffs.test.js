import test from 'node:test';
import assert from 'node:assert/strict';
import { computeEventoDiffs } from '../routes/eventos.js';

test('computeEventoDiffs detecta cambio simple en título', () => {
  const before = { titulo: 'A', descripcion: 'X' };
  const after = { titulo: 'B', descripcion: 'X' };
  const diffs = computeEventoDiffs(before, after);
  assert.ok(diffs.find(d => d.campo === 'titulo'));
  assert.equal(diffs.length, 1);
});

test('computeEventoDiffs devuelve vacío cuando no hay cambios', () => {
  const before = { titulo: 'A', descripcion: 'X' };
  const after = { titulo: 'A', descripcion: 'X' };
  const diffs = computeEventoDiffs(before, after);
  assert.equal(diffs.length, 0);
});

test('computeEventoDiffs normaliza null vs cadena', () => {
  const before = { descripcion: null };
  const after = { descripcion: 'Algo' };
  const diffs = computeEventoDiffs(before, after);
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].valor_anterior, '');
  assert.equal(diffs[0].valor_nuevo, 'Algo');
});

test('computeEventoDiffs detecta múltiples campos cambiados', () => {
  const before = { titulo: 'Concierto', estado: 'PROGRAMADO', lugar: 'Sala 1' };
  const after = { titulo: 'Concierto Final', estado: 'EN_CURSO', lugar: 'Sala 2' };
  const diffs = computeEventoDiffs(before, after);
  const campos = diffs.map(d => d.campo).sort();
  assert.deepEqual(campos, ['estado','lugar','titulo']);
});

test('computeEventoDiffs ignora cambios inexistentes (prop solo en after igual vacía)', () => {
  const before = { titulo: 'A' };
  const after = { titulo: 'A', descripcion: '' }; // descripcion vacía vs undefined -> sin cambio
  const diffs = computeEventoDiffs(before, after);
  assert.equal(diffs.length, 0);
});

test('computeEventoDiffs detecta cambio de estado solamente', () => {
  const before = { estado: 'PROGRAMADO' };
  const after = { estado: 'FINALIZADO' };
  const diffs = computeEventoDiffs(before, after);
  assert.equal(diffs.length, 1);
  assert.equal(diffs[0].campo, 'estado');
});
