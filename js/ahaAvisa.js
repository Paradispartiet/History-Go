(function (root, factory) {
  const shared = typeof module !== "undefined" && module.exports
    ? require("./ahaModules.js")
    : root.HistoryGoAhaModules;
  const api = factory(root || globalThis, shared);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.HistoryGoAhaAvisa = api;
})(typeof window !== "undefined" ? window : globalThis, function (global, shared) {
  "use strict";

  const STORAGE_KEY = "aha_articles_v1";
  const STATUSES = new Set(["draft", "review", "ready", "published_local"]);
  const PUBLICATION_LAYERS = new Set(["personal", "group", "public_candidate"]);
  const ALLOWED_REFERENCE_SOURCES = new Set(["aha_insights", "aha_lists", "aha_paths", "aha_notes", "aha_groups"]);
  const LOCAL_ONLY_FALLBACK = { ok: false, fallback: "localOnly", database_sync_disabled: true };

  function isDatabaseSyncEnabled() {
    return global.AHA_CONFIG?.avisa?.enableDatabaseSync === true;
  }

  function repository() {
    return isDatabaseSyncEnabled() ? global.AHARepository : null;
  }

  function nowIso() { return new Date().toISOString(); }
  function makeId(prefix = "article") { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
  function storage() { return global.localStorage || null; }
  function readJson(key, fallback) {
    try {
      const raw = storage()?.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    storage()?.setItem(key, JSON.stringify(value));
  }

  function isUnavailableRecord(record) {
    return Boolean(record?.deletedAt || record?.deleted_at || record?.archived === true);
  }

  function isDeletedRecord(record) {
    return isUnavailableRecord(record);
  }

  function normalizeReference(reference = {}) {
    return {
      source: String(reference.source || "").trim(),
      refId: String(reference.refId || reference.id || "").trim(),
      title: String(reference.title || "").trim(),
      type: String(reference.type || "reference").trim()
    };
  }

  function normalizeArticle(input = {}) {
    const existingMeta = input.meta && typeof input.meta === "object" ? input.meta : {};
    const status = STATUSES.has(input.status) ? input.status : "draft";
    const publicationLayer = PUBLICATION_LAYERS.has(input.publicationLayer) ? input.publicationLayer : "personal";
    const publishedExternal = input.published_external === true || existingMeta.published_external === true;
    const echonetShared = input.echonet_shared === true || existingMeta.echonet_shared === true;
    const syncEnabled = input.sync_enabled === true || existingMeta.sync_enabled === true;
    const externalPublishEnabled = input.external_publish_enabled === true || existingMeta.external_publish_enabled === true;
    return {
      ...input,
      id: input.id || makeId(),
      title: String(input.title || "Uten tittel"),
      body: String(input.body || input.content || ""),
      status,
      publicationLayer,
      references: Array.isArray(input.references) ? input.references.map(normalizeReference) : [],
      createdAt: input.createdAt || nowIso(),
      updatedAt: input.updatedAt || nowIso(),
      local_only: true,
      published_local: input.published_local === true || status === "published_local",
      published_external: publishedExternal,
      echonet_shared: echonetShared,
      sync_enabled: syncEnabled,
      external_publish_enabled: externalPublishEnabled,
      meta: {
        ...existingMeta,
        local_only: true,
        published_external: publishedExternal,
        echonet_shared: echonetShared,
        sync_enabled: syncEnabled,
        external_publish_enabled: externalPublishEnabled
      }
    };
  }

  function loadArticles(options = {}) {
    const articles = readJson(STORAGE_KEY, []).map(normalizeArticle);
    return options.includeUnavailable ? articles : articles.filter((article) => !isUnavailableRecord(article));
  }

  function saveArticles(articles) { writeJson(STORAGE_KEY, articles.map(normalizeArticle)); }

  function persistArticle(article) {
    if (!isDatabaseSyncEnabled()) return { ...LOCAL_ONLY_FALLBACK };
    const repo = repository();
    return repo?.saveArticle ? repo.saveArticle(article) : { ok: false, reason: "repository_unavailable" };
  }

  function pushLocalToDatabase(articles = loadArticles({ includeUnavailable: true })) {
    if (!isDatabaseSyncEnabled()) return { ...LOCAL_ONLY_FALLBACK };
    const repo = repository();
    return repo?.saveArticles ? repo.saveArticles(articles) : { ok: false, reason: "repository_unavailable" };
  }

  function syncFromDatabase() {
    if (!isDatabaseSyncEnabled()) return { ...LOCAL_ONLY_FALLBACK };
    const repo = repository();
    if (!repo?.loadArticles) return { ok: false, reason: "repository_unavailable" };
    const articles = repo.loadArticles().map(normalizeArticle);
    saveArticles(articles);
    return { ok: true, articles };
  }

  function upsertLocal(article) {
    const articles = loadArticles({ includeUnavailable: true });
    const index = articles.findIndex((item) => item.id === article.id);
    if (index === -1) articles.push(article); else articles[index] = article;
    saveArticles(articles);
    persistArticle(article);
    return article;
  }

  function createArticle(input = {}) {
    const article = normalizeArticle(input);
    upsertLocal(article);
    return { ok: true, article };
  }

  function updateArticle(articleId, updates = {}) {
    const article = loadArticles({ includeUnavailable: true }).find((item) => item.id === articleId && !isUnavailableRecord(item));
    if (!article) return { ok: false, reason: "article_not_found" };
    const merged = normalizeArticle({ ...article, ...updates, id: article.id, updatedAt: nowIso() });
    upsertLocal(merged);
    return { ok: true, article: merged };
  }

  function deleteArticle(articleId) { return updateArticle(articleId, { deletedAt: nowIso() }); }

  function publishArticleLocally(articleId) {
    return updateArticle(articleId, { status: "published_local", published_local: true, publishedLocalAt: nowIso(), published_external: false, external_publish_enabled: false });
  }

  function setArticleStatus(articleId, status) {
    if (!STATUSES.has(status)) return { ok: false, reason: "invalid_status" };
    return status === "published_local" ? publishArticleLocally(articleId) : updateArticle(articleId, { status });
  }

  function setArticlePublicationLayer(articleId, publicationLayer) {
    if (!PUBLICATION_LAYERS.has(publicationLayer)) return { ok: false, reason: "invalid_publication_layer" };
    return updateArticle(articleId, { publicationLayer, published_external: false, external_publish_enabled: false, echonet_shared: false, sync_enabled: false });
  }

  function normalizeSourceItem(item, source) {
    const refId = String(item.refId || item.id || "").trim();
    const title = String(item.title || item.name || item.label || "").trim();
    const type = String(item.type || source.replace("aha_", "")).trim();
    return { ...item, source, refId, title, type };
  }

  function collectAvailableArticleSources() {
    const buckets = [
      ["aha_insights", readJson("aha_insights_v1", [])],
      ["aha_lists", readJson("aha_lists_v1", [])],
      ["aha_paths", readJson("aha_paths_v1", [])],
      ["aha_notes", readJson("aha_notes_v1", [])],
      ["aha_groups", readJson("aha_groups_v1", [])]
    ];
    return buckets.flatMap(([source, items]) => Array.isArray(items) ? items.map((item) => normalizeSourceItem(item, source)) : [])
      .filter((item) => item.source && item.refId && item.title && item.type && !isUnavailableRecord(item));
  }

  function buildAvailableArticleSourceIndex(items = collectAvailableArticleSources()) {
    return new Map(items.map((item) => [`${item.source}::${item.refId}`, item]));
  }

  function validateArticleReference(referenceInput, availableItems = collectAvailableArticleSources()) {
    const reference = normalizeReference(referenceInput);
    if (!reference.source) return { ok: false, reason: "missing_source" };
    if (!reference.refId) return { ok: false, reason: "missing_refId" };
    if (!ALLOWED_REFERENCE_SOURCES.has(reference.source)) return { ok: false, reason: "unknown_source" };
    const item = buildAvailableArticleSourceIndex(availableItems).get(`${reference.source}::${reference.refId}`);
    if (!item) return { ok: false, reason: "target_unavailable" };
    if (isUnavailableRecord(item)) return { ok: false, reason: "target_unavailable" };
    if (!item.title || !item.type || !item.source || !item.refId) return { ok: false, reason: "target_incomplete" };
    return { ok: true, item };
  }

  function addReferenceToArticle(articleId, referenceInput) {
    const article = loadArticles({ includeUnavailable: true }).find((item) => item.id === articleId && !isUnavailableRecord(item));
    if (!article) return { ok: false, reason: "article_not_found" };
    const validation = validateArticleReference(referenceInput);
    if (!validation.ok) return { ok: false, reason: "invalid_reference", detail: validation.reason };
    const reference = normalizeReference({ ...validation.item, ...referenceInput, refId: validation.item.refId });
    if (article.references.some((item) => item.source === reference.source && item.refId === reference.refId)) return { ok: false, reason: "duplicate", article };
    return updateArticle(articleId, { references: [...article.references, reference] });
  }

  function removeReferenceFromArticle(articleId, referenceInput) {
    const article = loadArticles({ includeUnavailable: true }).find((item) => item.id === articleId && !isUnavailableRecord(item));
    if (!article) return { ok: false, reason: "article_not_found" };
    const reference = normalizeReference(referenceInput);
    return updateArticle(articleId, { references: article.references.filter((item) => !(item.source === reference.source && item.refId === reference.refId)) });
  }

  function renderReference(reference) {
    const validation = validateArticleReference(reference);
    const label = validation.ok ? validation.item.title : `${reference.title || reference.refId || "Referanse"} (ikke lenger tilgjengelig)`;
    return label;
  }

  const renderer = shared.createModuleRenderer({
    id: "avisa",
    mountId: "aha-avisa-module",
    title: "AHAavisa",
    purpose: "Lokale artikkelutkast og publiserte-lokalt tekster. AHAavisa organiserer egne AHA-notater og referanser, men publiserer ikke eksternt.",
    primaryActionLabel: "Nytt utkast",
    emptyState: "Ingen lokale artikkelutkast ennå."
  });

  return Object.assign(renderer, {
    STORAGE_KEY,
    isDatabaseSyncEnabled,
    isUnavailableRecord,
    isDeletedRecord,
    normalizeArticle,
    loadArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    setArticleStatus,
    publishArticleLocally,
    setArticlePublicationLayer,
    addReferenceToArticle,
    removeReferenceFromArticle,
    collectAvailableArticleSources,
    buildAvailableArticleSourceIndex,
    validateArticleReference,
    renderReference,
    persistArticle,
    pushLocalToDatabase,
    syncFromDatabase
  });
});
