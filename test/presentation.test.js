import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readingSourceLabel, recentDataSourceLabel } from '../src/utils/telemetry.js';
import { probabilityLabel } from '../src/utils/probability.js';
import { simulationMeasurement } from '../src/utils/measurements.js';

test('compact hardware source', () => {
  assert.equal(readingSourceLabel('HARDWARE'), 'HW');
});

test('expanded hardware source', () => {
  assert.equal(readingSourceLabel('HARDWARE', true), 'Hardware');
});

test('compact simulation source', () => {
  assert.equal(readingSourceLabel('SIMULATION'), 'SIM');
});

test('expanded simulation source', () => {
  assert.equal(readingSourceLabel('SIMULATION', true), 'Simulación');
});

test('legacy compact simulation source', () => {
  assert.equal(readingSourceLabel('SIMULATED'), 'SIM');
});

test('legacy expanded simulation source', () => {
  assert.equal(readingSourceLabel('SIMULATED', true), 'Simulación');
});

test('unknown reading source', () => {
  assert.equal(readingSourceLabel(null), null);
});

test('recent hardware origin', () => {
  assert.equal(recentDataSourceLabel('HARDWARE'), 'Datos: Hardware');
});

test('recent simulation origin', () => {
  assert.equal(recentDataSourceLabel('SIMULATION'), 'Datos: Simulados');
});

test('recent legacy simulation origin', () => {
  assert.equal(recentDataSourceLabel('SIMULATED'), 'Datos: Simulados');
});

test('mixed recent origins', () => {
  assert.equal(recentDataSourceLabel('MIXED'), 'Datos: Mixtos');
});

test('missing recent origin', () => {
  assert.equal(recentDataSourceLabel(undefined), 'Datos: Sin lecturas recientes');
});

test('zero failure probability', () => {
  assert.equal(probabilityLabel(0), '0%');
});

test('maximum failure probability', () => {
  assert.equal(probabilityLabel(1), '100%');
});

test('rounded failure probability', () => {
  assert.equal(probabilityLabel(0.567), '57%');
});

test('failure probability rounding down', () => {
  assert.equal(probabilityLabel(0.564), '56%');
});

test('missing failure probability', () => {
  assert.equal(probabilityLabel(null), '—');
});
