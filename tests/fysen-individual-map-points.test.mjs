import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

test('Fysen uses individual restaurant points, never numbered clusters', async () => {
  const sources = new Map(), layers = new Map(), events = new Map();
  const map = {
    getStyle: () => ({}),
    getSource: id => sources.get(id),
    getLayer: id => layers.get(id),
    addSource: (id, source) => sources.set(id, source),
    addLayer: layer => layers.set(layer.id, layer),
    removeLayer: id => layers.delete(id),
    removeSource: id => sources.delete(id),
    on: (event, handler) => events.set(event, handler),
    off: event => events.delete(event),
  };
  const restaurants = ['first', 'second'].map(slug => ({
    slug, name: slug, address: 'Oslo', latitude: 59.92, longitude: 10.75
  }));
  const window = { HGMap: { getMap: () => map }, dispatchEvent() {} };
  vm.runInNewContext(readFileSync(new URL('../dist/web/fysen-map-layer.js', import.meta.url), 'utf8'), {
    window, CustomEvent: class {}, AbortController, console,
    fetch: async () => ({ ok: true, json: async () => ({
      schemaVersion: 1, source: 'fysen-catalog', sourceCommit: 'a'.repeat(40),
      city: 'Oslo', catalogCount: 2, restaurants
    }) })
  });
  assert.equal(await window.HGFysenMap.setEnabled(true), true);
  const source = sources.get('hg-fysen-restaurants');
  assert.equal(source.cluster, false);
  assert.equal(source.data.features.length, 2);
  assert.deepEqual([...layers.keys()], ['hg-fysen-points', 'hg-fysen-labels']);
  assert.equal(layers.get('hg-fysen-points').type, 'circle');
  assert.equal(layers.get('hg-fysen-points').filter, undefined);
  assert.equal(await window.HGFysenMap.setEnabled(false), false);
  assert.equal(sources.size, 0);
  assert.equal(layers.size, 0);
});
