// backend/tests/permissions.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { hasPermission } from '../helpers/permissions.js';

test('hasPermission: permite *', () => {
  const user = { permisos: ['*'] };
  assert.equal(hasPermission(user, 'alumnos:read'), true);
  assert.equal(hasPermission(user, 'cualquier:cosa'), true);
});

test('hasPermission: permite comodín por sección', () => {
  const user = { permisos: ['alumnos:*'] };
  assert.equal(hasPermission(user, 'alumnos:read'), true);
  assert.equal(hasPermission(user, 'alumnos:update'), true);
  assert.equal(hasPermission(user, 'eventos:read'), false);
});

test('hasPermission: compara normalizando', () => {
  const user = { permisos: ['Alumnos:Read', 'Instrumentos:UPDATE'] };
  assert.equal(hasPermission(user, 'alumnos:read'), true);
  assert.equal(hasPermission(user, 'instrumentos:update'), true);
  assert.equal(hasPermission(user, 'instrumentos:delete'), false);
});
