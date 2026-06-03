#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.resolve(__dirname, '..');

function loadMindmap() {
  const context = {
    console,
    globalThis: null,
    localStorage: makeStorage(),
    window: null
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  const code = fs.readFileSync(path.join(repoRoot, 'js/ahaMindmap.js'), 'utf8');
  vm.runInContext(code, context, { filename: 'js/ahaMindmap.js' });
  return context;
}

function makeStorage() {
  return {
    getItemCalls: [],
    setItemCalls: [],
    removeItemCalls: [],
    clearCalls: 0,
    getItem(key) {
      this.getItemCalls.push(String(key));
      return null;
    },
    setItem(key, value) {
      this.setItemCalls.push([String(key), String(value)]);
    },
    removeItem(key) {
      this.removeItemCalls.push(String(key));
    },
    clear() {
      this.clearCalls += 1;
    }
  };
}

function makeRaw(overrides = {}) {
  return {
    notes: [
      {
        id: 'note-1',
        title: 'Reanalysert note',
        last_reanalyzed_at: '2026-06-03T10:11:12.000Z',
        ...(overrides.note || {})
      }
    ],
    sourceEvents: [
      {
        id: 'event-1',
        source_type: 'note_reanalysis',
        source_app: 'aha_notes',
        title: 'Reanalyse',
        meta: { note_id: 'note-1', reanalyze: true },
        ...(overrides.event || {})
      }
    ]
  };
}

(function run() {
  const context = loadMindmap();
  const mindmap = context.AHAMindmap;

  assert.strictEqual(typeof mindmap.isDeletedRecord, 'function');
  assert.strictEqual(mindmap.isDeletedRecord({ deletedAt: '2026-06-03T00:00:00.000Z' }), true);
  assert.strictEqual(mindmap.isDeletedRecord({ deleted_at: '2026-06-03T00:00:00.000Z' }), true);
  assert.strictEqual(mindmap.isDeletedRecord({}), false);

  let graph = mindmap.buildMindmapData(makeRaw());
  const noteNodeId = 'note::aha_notes::note-1';
  const sourceEventNodeId = 'source_event::aha_source_events::event-1';
  const noteNode = graph.nodes.find((node) => node.id === noteNodeId);
  assert(noteNode, 'note node should exist');
  assert.strictEqual(noteNode.meta.lastReanalyzedAt, '2026-06-03T10:11:12.000Z');

  const edge = graph.edges.find((candidate) => candidate.type === 'note_reanalysis');
  assert(edge, 'note reanalysis edge should exist');
  assert.strictEqual(edge.label, 'analysert på nytt');
  assert.strictEqual(edge.from, sourceEventNodeId);
  assert.strictEqual(edge.to, noteNodeId);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(edge.meta)), { noteId: 'note-1', reanalyze: true });

  graph = mindmap.buildMindmapData(makeRaw({ note: { deleted_at: '2026-06-03T00:00:00.000Z' } }));
  assert.strictEqual(graph.nodes.some((node) => node.id === noteNodeId), false);
  assert.strictEqual(graph.edges.some((candidate) => candidate.type === 'note_reanalysis'), false);

  graph = mindmap.buildMindmapData(makeRaw({ note: { deletedAt: '2026-06-03T00:00:00.000Z' } }));
  assert.strictEqual(graph.nodes.some((node) => node.id === noteNodeId), false);
  assert.strictEqual(graph.edges.some((candidate) => candidate.type === 'note_reanalysis'), false);

  graph = mindmap.buildMindmapData(makeRaw({ event: { deleted_at: '2026-06-03T00:00:00.000Z' } }));
  assert.strictEqual(graph.nodes.some((node) => node.id === sourceEventNodeId), false);
  assert.strictEqual(graph.edges.some((candidate) => candidate.type === 'note_reanalysis'), false);

  graph = mindmap.buildMindmapData(makeRaw({ event: { deletedAt: '2026-06-03T00:00:00.000Z' } }));
  assert.strictEqual(graph.nodes.some((node) => node.id === sourceEventNodeId), false);
  assert.strictEqual(graph.edges.some((candidate) => candidate.type === 'note_reanalysis'), false);

  graph = mindmap.buildMindmapData({
    notes: makeRaw().notes,
    sourceEvents: [makeRaw().sourceEvents[0], { ...makeRaw().sourceEvents[0] }]
  });
  assert.strictEqual(graph.edges.filter((candidate) => candidate.type === 'note_reanalysis').length, 1);

  mindmap.buildMindmapData();
  assert.deepStrictEqual(context.localStorage.setItemCalls, []);
  assert.deepStrictEqual(context.localStorage.removeItemCalls, []);
  assert.strictEqual(context.localStorage.clearCalls, 0);

  context.AHAIngest = { touched: false };
  context.AHASources = { touched: false };
  context.AHARepository = { touched: false };
  mindmap.buildMindmapData(makeRaw());
  assert.deepStrictEqual(context.AHAIngest, { touched: false });
  assert.deepStrictEqual(context.AHASources, { touched: false });
  assert.deepStrictEqual(context.AHARepository, { touched: false });

  console.log('aha mindmap tombstone and note reanalysis tests passed');
})();
