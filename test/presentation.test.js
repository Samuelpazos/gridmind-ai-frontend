import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readingSourceLabel, recentDataSourceLabel } from '../src/utils/telemetry.js';
import { probabilityLabel } from '../src/utils/probability.js';
import { simulationMeasurement } from '../src/utils/measurements.js';

test('compact hardware source', () => {
  assert.equal(readingSourceLabel('HARDWARE'), 'HW');
});
