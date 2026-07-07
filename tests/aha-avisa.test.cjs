const assert = require('assert');
const fs = require('fs');
const path = require('path');

function makeLocalStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear()
  };
}

global.localStorage = makeLocalStorage();
global.AHA_CONFIG = { avisa: { enableDatabaseSync: false } };
let saveArticleCalls = 0;
global.AHARepository = {
  saveArticle(article) { saveArticleCalls += 1; return { ok: true, article }; },
  saveArticles(articles) { return { ok: true, articles }; },
  loadArticles() { return [{ id: 'db-1', title: 'DB article' }]; }
};

const Avisa = require('../js/ahaAvisa.js');

function storedArticles() {
  return JSON.parse(global.localStorage.getItem(Avisa.STORAGE_KEY) || '[]');
}

const created = Avisa.createArticle({ id: 'a1', title: 'Local draft' });
assert.strictEqual(created.ok, true);
assert.strictEqual(storedArticles().length, 1, 'createArticle stores locally');
assert.strictEqual(created.article.local_only, true);
assert.strictEqual(created.article.published_external, false);
assert.strictEqual(created.article.echonet_shared, false);
assert.strictEqual(created.article.sync_enabled, false);
assert.strictEqual(created.article.external_publish_enabled, false);
assert.strictEqual(saveArticleCalls, 0, 'createArticle does not call repository without config flag');

Avisa.updateArticle('a1', { body: 'Updated' });
assert.strictEqual(saveArticleCalls, 0, 'updateArticle does not call repository without config flag');
assert.strictEqual(storedArticles()[0].body, 'Updated');

const localPublish = Avisa.setArticleStatus('a1', 'published_local');
assert.strictEqual(localPublish.ok, true);
assert.strictEqual(localPublish.article.status, 'published_local');
assert.strictEqual(localPublish.article.published_local, true);
assert.strictEqual(localPublish.article.published_external, false);
assert.strictEqual(localPublish.article.external_publish_enabled, false);
assert(localPublish.article.publishedLocalAt, 'published_local sets a local timestamp');

const candidate = Avisa.setArticlePublicationLayer('a1', 'public_candidate');
assert.strictEqual(candidate.ok, true);
assert.strictEqual(candidate.article.publicationLayer, 'public_candidate');
assert.strictEqual(candidate.article.published_external, false);
assert.strictEqual(candidate.article.external_publish_enabled, false);
assert.strictEqual(candidate.article.echonet_shared, false);
assert.strictEqual(candidate.article.sync_enabled, false);

assert.strictEqual(Avisa.deleteArticle('a1').ok, true, 'deleteArticle soft-deletes');
assert.strictEqual(Avisa.loadArticles().length, 0, 'deleted articles are not active');
Avisa.createArticle({ id: 'a2', title: 'Archived', archived: true });
assert.strictEqual(Avisa.loadArticles().length, 0, 'archived articles are not active');

localStorage.setItem('aha_insights_v1', JSON.stringify([{ id: 'i1', title: 'Insight', type: 'insight' }, { id: 'i2', title: 'Gone', archived: true }]));
localStorage.setItem('aha_lists_v1', JSON.stringify([{ id: 'l1', title: 'List' }]));
localStorage.setItem('aha_paths_v1', JSON.stringify([{ id: 'p1', title: 'Path' }]));
localStorage.setItem('aha_notes_v1', JSON.stringify([{ id: 'n1', title: 'Note' }, { id: 'n2', title: 'Deleted', deletedAt: 'x' }]));
const sources = Avisa.collectAvailableArticleSources();
assert.deepStrictEqual(sources.map((item) => item.source).sort(), ['aha_insights', 'aha_lists', 'aha_notes', 'aha_paths']);
assert(!sources.some((item) => item.refId === 'i2' || item.refId === 'n2'), 'deleted/archived refs are ignored');
assert.strictEqual(Avisa.validateArticleReference({ source: 'aha_insights', refId: 'i1' }).ok, true);
assert.strictEqual(Avisa.validateArticleReference({ source: 'remote', refId: 'i1' }).reason, 'unknown_source');
assert.strictEqual(Avisa.validateArticleReference({ source: 'aha_insights' }).reason, 'missing_refId');

Avisa.createArticle({ id: 'a3', title: 'Reference host' });
const badRef = Avisa.addReferenceToArticle('a3', { source: 'aha_insights', refId: 'missing' });
assert.deepStrictEqual({ ok: badRef.ok, reason: badRef.reason, detail: badRef.detail }, { ok: false, reason: 'invalid_reference', detail: 'target_unavailable' });
const goodRef = Avisa.addReferenceToArticle('a3', { source: 'aha_insights', refId: 'i1' });
assert.strictEqual(goodRef.ok, true);
assert.strictEqual(goodRef.article.references[0].title, 'Insight');
const dupeRef = Avisa.addReferenceToArticle('a3', { source: 'aha_insights', refId: 'i1' });
assert.strictEqual(dupeRef.reason, 'duplicate');
assert(Avisa.renderReference({ source: 'aha_insights', refId: 'missing', title: 'Old ref' }).includes('ikke lenger tilgjengelig'));

assert.deepStrictEqual(Avisa.syncFromDatabase(), { ok: false, fallback: 'localOnly', database_sync_disabled: true });
global.AHA_CONFIG.avisa.enableDatabaseSync = true;
assert.strictEqual(Avisa.isDatabaseSyncEnabled(), true);
assert.strictEqual(Avisa.createArticle({ id: 'a4', title: 'DB gated' }).ok, true);
assert(saveArticleCalls > 0, 'repository can be used when config explicitly enables database sync');
assert.strictEqual(Avisa.syncFromDatabase().ok, true);

const source = fs.readFileSync(path.join(__dirname, '../js/ahaAvisa.js'), 'utf8');
assert.strictEqual(/\bfetch\s*\(/.test(source), false, 'no fetch');
assert.strictEqual(/EchoNet/.test(source), false, 'no EchoNet');
assert.strictEqual(/Sync Hub|syncHistoryGoPayload|writeAhaManualSyncAuditLog/.test(source), false, 'no Sync Hub');
assert.strictEqual(/createClient\s*\(|Supabase|supabase/i.test(source), false, 'no Supabase/createClient');
assert.strictEqual(/publishExternal|publishTo[A-Z]|shareTo[A-Z]|externalPublish\s*\(/.test(source), false, 'no external publish function/API');

console.log('AHAavisa local publishing boundary tests passed.');
