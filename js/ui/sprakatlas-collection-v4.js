// js/ui/sprakatlas-collection-v4.js
// Explicit collection bridge from canonical Språkatlas feature_evidence to Knowledge V2.
// The atlas profile remains the content owner; this runtime writes only to hg_knowledge_entries_v2.
(function installSprakatlasCollectionV4(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_SPRAKATLAS_COLLECTION_V4_INSTALLED__";
  const ATLAS_PATH = "data/leksikon/sprak/norge_atlas_v1.json";
  const MANIFEST_PATH = "data/leksikon/sprak/manifest.json";
  const KNOWLEDGE_KEY = "hg_knowledge_entries_v2";
  const KNOWLEDGE_SCHEMA = "history_go_knowledge_entry_v2";
  const KNOWLEDGE_VERSION = 2;
  const COLLECTION_KIND = "language";
  const SOURCE_TYPE = "language_atlas";
  const STYLE_ID = "hg-sprakatlas-collection-v4-style";

  if (global[INSTALL_FLAG]) return;
  global[INSTALL_FLAG] = true;

  const text = value => String(value == null ? "" : value).trim();
  const list = value => Array.isArray(value) ? value : [];
  const esc = value => String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const unique = values => [...new Set(list(values).map(text).filter(Boolean))];
  const slug = value => text(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);

  let atlasPromise = null;
  let manifestPromise = null;
  const articleCache = new Map();
  const linkedContextCache = new Map();

  function safeHttpsUrl(value) {
    const raw = text(value);
    if (!raw) return "";
    try {
      const parsed = new URL(raw, global.location?.origin || undefined);
      return parsed.protocol === "https:" ? parsed.href : "";
    } catch {
      return "";
    }
  }

  function ensureStyle() {
    if (!global.document || document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .hg-sprakatlas-collect-note{margin:.55rem 0 .25rem;color:var(--text-secondary,#53606a);font-size:.88rem}
      .hg-sprakatlas-evidence-meta{display:flex;flex-wrap:wrap;gap:.35rem;margin:.35rem 0}
      .hg-sprakatlas-evidence-meta span{font-size:.76rem;padding:.18rem .42rem;border-radius:999px;background:rgba(31,108,78,.08)}
      .hg-sprakatlas-collect{margin-top:.5rem;border:1px solid currentColor;border-radius:999px;padding:.42rem .72rem;background:transparent;font:inherit;font-weight:700;cursor:pointer}
      .hg-sprakatlas-collect.is-collected,.hg-sprakatlas-collect:disabled{opacity:.62;cursor:default}
      .hg-sprakatlas-collect-blocked{margin:.55rem 0 0;font-size:.82rem;color:var(--text-secondary,#53606a)}
    `;
    document.head.appendChild(style);
  }

  async function loadJson(path) {
    try {
      const response = await fetch(path, { cache: "default" });
      return response.ok ? response.json() : null;
    } catch {
      return null;
    }
  }

  function loadAtlas() {
    if (!atlasPromise) atlasPromise = loadJson(ATLAS_PATH);
    return atlasPromise;
  }

  function loadManifest() {
    if (!manifestPromise) manifestPromise = loadJson(MANIFEST_PATH).then(value => value || { place_files: {} });
    return manifestPromise;
  }

  async function loadArticle(placeId, sourceFile) {
    const id = text(placeId);
    if (!id || !sourceFile) return null;
    if (articleCache.has(id)) return articleCache.get(id);
    const article = await loadJson(sourceFile);
    const result = article && text(article.place_id) === id ? article : null;
    articleCache.set(id, result);
    return result;
  }

  function canonicalSubjectIds() {
    return new Set(Object.keys(global.HGKnowledgeV2?.SUBJECT_LABELS || {}));
  }

  function normalizeSubjectId(value) {
    const raw = text(value);
    if (!raw || raw === "sprak") return "";
    let resolved = raw;
    try {
      if (typeof global.DomainRegistry?.toRuntimeCategoryId === "function") {
        resolved = text(global.DomainRegistry.toRuntimeCategoryId(raw)) || raw;
      } else if (typeof global.DomainRegistry?.resolve === "function") {
        resolved = text(global.DomainRegistry.resolve(raw)) || raw;
      }
    } catch {}
    if (resolved === "popkultur") resolved = "populaerkultur";
    if (resolved === "sprak") return "";
    return canonicalSubjectIds().has(resolved) ? resolved : "";
  }

  function subjectForContext(place, article) {
    const candidates = [
      article?.subject_id,
      article?.fagkart_category_id,
      place?.subject_id,
      place?.fagkart_category_id,
      place?.categoryId,
      place?.category,
      place?.domain
    ];
    for (const candidate of candidates) {
      const subjectId = normalizeSubjectId(candidate);
      if (subjectId) return subjectId;
    }
    return "";
  }

  async function linkedContexts(profileId) {
    const id = text(profileId);
    if (!id) return [];
    if (linkedContextCache.has(id)) return linkedContextCache.get(id);

    const promise = (async () => {
      const manifest = await loadManifest();
      const placeById = new Map(list(global.PLACES).map(place => [text(place?.id), place]));
      const rows = await Promise.all(Object.entries(manifest?.place_files || {}).map(async ([placeId, sourceFile]) => {
        const article = await loadArticle(placeId, sourceFile);
        if (!article || !unique(article?.atlas_local_ids).includes(id)) return null;
        const place = placeById.get(text(placeId)) || null;
        const subjectId = subjectForContext(place, article);
        return {
          placeId: text(placeId),
          place,
          placeName: text(place?.name || placeId),
          article,
          sourceFile: text(sourceFile),
          subjectId
        };
      }));
      return rows.filter(Boolean);
    })().catch(() => []);

    linkedContextCache.set(id, promise);
    return promise;
  }

  function selectedProfileId(selection) {
    return text(selection?.querySelector?.("[data-atlas-selection-places]")?.getAttribute?.("data-atlas-place-selection"));
  }

  function currentPlaceId(selection) {
    return text(selection?.closest?.("[data-language-place]")?.getAttribute?.("data-language-place"));
  }

  async function collectionContext(selection, profile) {
    const contexts = await linkedContexts(profile?.id);
    const valid = contexts.filter(row => row?.subjectId);
    const currentId = currentPlaceId(selection);
    const current = valid.find(row => row.placeId === currentId) || null;
    const subjects = unique(valid.map(row => row.subjectId));
    const anchor = current || (subjects.length === 1 ? valid.find(row => row.subjectId === subjects[0]) || null : null);

    return {
      anchor,
      subjectId: text(anchor?.subjectId),
      placeIds: unique(contexts.map(row => row.placeId)),
      placeNames: unique(contexts.map(row => row.placeName)),
      sourceFiles: unique(contexts.map(row => row.sourceFile)),
      subjectIds: subjects
    };
  }

  function readKnowledgeEntries() {
    try {
      if (typeof global.HGKnowledgeV2?.getEntries === "function") {
        const rows = global.HGKnowledgeV2.getEntries();
        if (Array.isArray(rows)) return rows;
      }
    } catch {}
    try {
      const rows = JSON.parse(global.localStorage?.getItem(KNOWLEDGE_KEY) || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  function evidenceKnowledgeId(profile, evidence) {
    return `ku_atlas_${slug(profile?.id) || "profile"}_${slug(evidence?.id) || "evidence"}`;
  }

  function isCollected(profile, evidence) {
    const id = evidenceKnowledgeId(profile, evidence);
    return readKnowledgeEntries().some(row =>
      text(row?.id) === id ||
      text(row?.knowledge_unit_id) === id ||
      (text(row?.source?.atlas_profile_id) === text(profile?.id) && text(row?.source?.feature_evidence_id) === text(evidence?.id))
    );
  }

  function regionName(atlas, profile) {
    const region = list(atlas?.dialect_regions).find(row => text(row?.id) === text(profile?.region_id));
    return text(region?.name || profile?.region_id);
  }

  function macroName(atlas, profile) {
    const macro = list(atlas?.macro_regions).find(row => text(row?.id) === text(profile?.macro_region_id));
    return text(macro?.name || profile?.macro_region_id);
  }

  function knowledgeEntryForEvidence(atlas, profile, evidence, context) {
    const subjectId = text(context?.subjectId);
    if (!subjectId || subjectId === "sprak" || !canonicalSubjectIds().has(subjectId)) return null;
    if (text(profile?.profile_status) !== "evidence_materialized") return null;
    if (!text(profile?.id) || !text(evidence?.id) || !text(evidence?.claim)) return null;

    const id = evidenceKnowledgeId(profile, evidence);
    const sourceUrls = unique(evidence?.source_urls).map(safeHttpsUrl).filter(Boolean);
    const placeIds = unique(context?.placeIds);
    const placeNames = unique(context?.placeNames);
    const region = regionName(atlas, profile);
    const macro = macroName(atlas, profile);
    const now = new Date().toISOString();

    return {
      schema: KNOWLEDGE_SCHEMA,
      version: KNOWLEDGE_VERSION,
      id,
      knowledge_unit_id: id,
      subject_id: subjectId,
      fagkart_category_id: subjectId,
      emne_ids: [],
      concept_ids: [],
      term_ids: [`term_${slug(subjectId)}_sprakatlas_${slug(evidence?.id) || "evidence"}`],
      story_ids: [],
      concepts: [],
      terms: unique([evidence?.label]),
      tags: unique(["språkatlas", "dialekt", evidence?.kind, profile?.id, profile?.region_id, profile?.macro_region_id]),
      kind: COLLECTION_KIND,
      collection_kind: COLLECTION_KIND,
      dimension: text(evidence?.kind || "dialect_feature"),
      topic: `Talemål i ${text(profile?.name || profile?.id)}`,
      text: text(evidence?.claim),
      sources: sourceUrls.map((url, index) => ({ url, label: sourceUrls.length > 1 ? `Kilde ${index + 1}` : "Kilde" })),
      source: {
        type: SOURCE_TYPE,
        quiz_id: null,
        target_id: `atlas:${text(profile.id)}`,
        place_id: text(context?.anchor?.placeId) || null,
        person_id: null,
        source_file: ATLAS_PATH,
        unit_id: text(evidence.id),
        atlas_profile_id: text(profile.id),
        feature_evidence_id: text(evidence.id),
        source_urls: sourceUrls
      },
      atlas_provenance: {
        owner: "local_varieties.feature_evidence",
        atlas_profile_id: text(profile.id),
        atlas_profile_name: text(profile?.name),
        feature_evidence_id: text(evidence.id),
        evidence_label: text(evidence?.label),
        evidence_kind: text(evidence?.kind),
        profile_status: text(profile?.profile_status),
        evidence_last_verified: text(profile?.evidence_last_verified) || null,
        time_scope: text(evidence?.time_scope) || null,
        geographic_scope: {
          macro_region_id: text(profile?.macro_region_id) || null,
          macro_region_name: macro || null,
          region_id: text(profile?.region_id) || null,
          region_name: region || null,
          place_ids: placeIds,
          place_names: placeNames
        },
        related_place_source_files: unique(context?.sourceFiles),
        source_urls: sourceUrls
      },
      learned_at: now,
      last_seen_at: now,
      times_seen: 1,
      content_quality: {
        version: 2,
        precise_claim: true,
        canonical_capture: true,
        source_bound: true,
        atlas_owner_preserved: true
      },
      link_status: "atlas_source_bound"
    };
  }

  function writeCanonicalKnowledgeEntry(entry) {
    if (!entry?.id || !entry?.text) return null;
    const rows = readKnowledgeEntries();
    const existing = rows.find(row =>
      text(row?.id) === text(entry.id) ||
      text(row?.knowledge_unit_id) === text(entry.knowledge_unit_id) ||
      (text(row?.source?.atlas_profile_id) === text(entry?.source?.atlas_profile_id) &&
       text(row?.source?.feature_evidence_id) === text(entry?.source?.feature_evidence_id))
    );
    if (existing) return existing;

    const next = [...rows, entry];
    try {
      global.localStorage?.setItem(KNOWLEDGE_KEY, JSON.stringify(next));
    } catch {
      return null;
    }

    try {
      global.dispatchEvent?.(new CustomEvent("hg:knowledgeCollected", {
        detail: { source: SOURCE_TYPE, collection_kind: COLLECTION_KIND, entry }
      }));
      global.dispatchEvent?.(new Event("updateProfile"));
    } catch {}
    return entry;
  }

  function collectFeatureEvidence(atlas, profile, evidence, context) {
    const entry = knowledgeEntryForEvidence(atlas, profile, evidence, context);
    return entry ? writeCanonicalKnowledgeEntry(entry) : null;
  }

  function sourceLinks(evidence) {
    const links = unique(evidence?.source_urls).map(safeHttpsUrl).filter(Boolean);
    if (!links.length) return "";
    return `<div>${links.map((url, index) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Kilde${links.length > 1 ? ` ${index + 1}` : ""} ↗</a>`).join("")}</div>`;
  }

  function evidenceRowsHtml(atlas, profile, context) {
    const canCollect = Boolean(context?.subjectId);
    return list(profile?.feature_evidence).map(evidence => {
      const collected = isCollected(profile, evidence);
      return `<li data-sprakatlas-collection-v4="1" data-sprakatlas-profile-id="${esc(profile.id)}" data-sprakatlas-evidence-id="${esc(evidence.id)}">
        <span>${esc(evidence?.label || evidence?.claim)}</span>
        <p>${esc(evidence?.claim)}</p>
        <div class="hg-sprakatlas-evidence-meta">
          ${evidence?.time_scope ? `<span>${esc(evidence.time_scope)}</span>` : ""}
          ${profile?.evidence_last_verified ? `<span>Verifisert ${esc(profile.evidence_last_verified)}</span>` : ""}
          ${regionName(atlas, profile) ? `<span>${esc(regionName(atlas, profile))}</span>` : ""}
        </div>
        ${sourceLinks(evidence)}
        ${canCollect
          ? `<button type="button" class="hg-sprakatlas-collect${collected ? " is-collected" : ""}" data-sprakatlas-collect-evidence="${esc(evidence.id)}" data-sprakatlas-profile="${esc(profile.id)}" ${collected ? "disabled" : ""}>${collected ? "Samlet" : "Samle kunnskapen"}</button>`
          : `<p class="hg-sprakatlas-collect-blocked">Kan ikke samles før profilen kan knyttes til ett faktisk History Go-fag via et eksplisitt canonical Place-spor.</p>`}
      </li>`;
    }).join("");
  }

  async function enhanceSelection(selection, force = false) {
    if (!selection || selection.hidden) return;
    const profileId = selectedProfileId(selection);
    if (!profileId) return;

    const atlas = await loadAtlas();
    const profile = list(atlas?.local_varieties).find(row => text(row?.id) === profileId) || null;
    const evidenceHost = selection.querySelector?.("[data-atlas-selection-evidence]");
    if (!evidenceHost || !profile) return;

    if (text(profile?.profile_status) !== "evidence_materialized" || !list(profile?.feature_evidence).length) {
      evidenceHost.querySelectorAll?.("[data-sprakatlas-collection-v4]").forEach(node => node.remove());
      return;
    }

    if (!force && evidenceHost.dataset?.sprakatlasCollectionProfile === profileId && evidenceHost.querySelector?.("[data-sprakatlas-collection-v4]")) return;
    if (evidenceHost.dataset) evidenceHost.dataset.sprakatlasCollectionPending = profileId;
    const context = await collectionContext(selection, profile);
    if (selectedProfileId(selection) !== profileId) return;

    evidenceHost.hidden = false;
    evidenceHost.innerHTML = `<strong>Dokumenterte målmerker og endringer</strong>
      <p class="hg-sprakatlas-collect-note">Samling skjer bare når du velger «Samle kunnskapen». Atlasprofilen beholder eierskapet til belegget.</p>
      <ul>${evidenceRowsHtml(atlas, profile, context)}</ul>`;
    if (evidenceHost.dataset) {
      evidenceHost.dataset.sprakatlasCollectionProfile = profileId;
      delete evidenceHost.dataset.sprakatlasCollectionPending;
    }
  }

  function enhanceVisibleSelections(force = false) {
    if (!global.document) return;
    document.querySelectorAll("[data-atlas-selection]:not([hidden])").forEach(selection => {
      void enhanceSelection(selection, force);
    });
  }

  async function handleCollect(button) {
    const selection = button.closest?.("[data-atlas-selection]");
    const profileId = text(button.getAttribute?.("data-sprakatlas-profile"));
    const evidenceId = text(button.getAttribute?.("data-sprakatlas-collect-evidence"));
    if (!selection || !profileId || !evidenceId || button.hasAttribute?.("disabled")) return;

    const atlas = await loadAtlas();
    const profile = list(atlas?.local_varieties).find(row => text(row?.id) === profileId) || null;
    const evidence = list(profile?.feature_evidence).find(row => text(row?.id) === evidenceId) || null;
    if (!profile || text(profile?.profile_status) !== "evidence_materialized" || !evidence) return;

    const context = await collectionContext(selection, profile);
    const captured = collectFeatureEvidence(atlas, profile, evidence, context);
    if (!captured) {
      global.showToast?.("Atlasbelegget mangler en sikker canonical fagkobling og ble ikke samlet.");
      return;
    }

    await enhanceSelection(selection, true);
    global.showToast?.(`Samlet i kunnskapen din: ${text(evidence?.label || evidence?.id)}`);
  }

  function bind() {
    if (!global.document) return;
    ensureStyle();

    document.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target : null;
      const collectButton = target?.closest?.("[data-sprakatlas-collect-evidence]");
      if (collectButton) {
        void handleCollect(collectButton);
        return;
      }

      if (target?.closest?.("[data-atlas-local],[data-open-atlas-target]")) {
        queueMicrotask(() => enhanceVisibleSelections(false));
      }
    });

    const observer = new MutationObserver(() => enhanceVisibleSelections(false));
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "data-atlas-place-selection"] });
    enhanceVisibleSelections(false);
  }

  global.HGSprakatlasCollectionV4 = {
    KNOWLEDGE_KEY,
    COLLECTION_KIND,
    SOURCE_TYPE,
    evidenceKnowledgeId,
    knowledgeEntryForEvidence,
    collectFeatureEvidence,
    isCollected,
    enhanceVisibleSelections
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
  else bind();
})(window);
