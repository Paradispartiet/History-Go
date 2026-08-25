// js/ui/place-collection-knowledge-routing.js
// Utvider PlaceCard-samlingenes egne popuper med kunnskap som tidligere ble
// presentert som separate stedspopupfaner. Source-data flyttes ikke.
(function installPlaceCollectionKnowledgeRouting(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_PLACE_COLLECTION_KNOWLEDGE_ROUTING_INSTALLED__";
  const text = value => String(value == null ? "" : value).trim();
  const list = value => Array.isArray(value) ? value : [];
  const esc = value => String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function unique(values, keyFn) {
    const seen = new Set();
    return values.filter(Boolean).filter(value => {
      const key = text(keyFn(value)).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function loadLeksikon(placeId) {
    if (!placeId) return [];
    if (!Object.prototype.hasOwnProperty.call(global.LEKSIKON_BY_PLACE || {}, placeId)) {
      try { await global.HGLeksikon?.init?.(); } catch (error) {
        if (global.DEBUG) console.warn("[place-collection-knowledge-routing] Leksikon", error);
      }
    }
    return list(global.LEKSIKON_BY_PLACE?.[placeId]);
  }

  function mainArticle(articles, place) {
    const rows = list(articles).filter(Boolean);
    const name = text(place?.name).toLowerCase();
    return rows.find(article => text(article?.title || article?.name).toLowerCase() === name)
      || rows.find(article => /hoved|main|primary/.test([article?.id, article?.type, article?.kind].map(value => text(value).toLowerCase()).join(" ")))
      || rows[0]
      || null;
  }

  function objectLikeArticle(article) {
    const signals = [
      article?.id, article?.title, article?.name, article?.type, article?.kind,
      article?.category, ...list(article?.tags)
    ].map(value => text(value).toLowerCase()).join(" ");
    return ["object", "objekt", "artifact", "anlegg", "facility", "installation", "infrastructure", "dekke"]
      .some(term => signals.includes(term));
  }

  function normalizeObject(item, fallback = "Spor") {
    if (!item) return null;
    if (typeof item === "string") return { id: item, title: item, desc: "" };
    const title = text(item?.title || item?.name || item?.label || item?.id || fallback);
    const desc = text(item?.summary?.one_liner || item?.popupDesc || item?.description || item?.desc || item?.meaning);
    const id = text(item?.id || item?.slug || title);
    return title ? { id, title, desc } : null;
  }

  function objectKeysAlreadyOwned(place) {
    const keys = new Set();
    for (const item of [...list(place?.objects), ...list(place?.artifacts)]) {
      const normalized = normalizeObject(item);
      for (const value of [normalized?.id, normalized?.title]) {
        const key = text(value).toLowerCase();
        if (key) keys.add(key);
      }
    }
    return keys;
  }

  function renderObjectCards(items) {
    const rows = unique(items.map(item => normalizeObject(item)).filter(Boolean), item => item.id || item.title);
    if (!rows.length) return "";
    return `<section class="pc-collection-supplement" data-collection-supplement="objects"><h3>Spor og objekter</h3><div class="pc-relation-list">${rows.map(item => `<article class="pc-relation-card"><div class="pc-relation-title">${esc(item.title)}</div>${item.desc ? `<p class="pc-relation-desc">${esc(item.desc)}</p>` : ""}</article>`).join("")}</div></section>`;
  }

  function renderNotice(values) {
    const rows = unique(list(values).map(text).filter(Boolean), value => value);
    if (!rows.length) return "";
    return `<section class="pc-collection-supplement" data-collection-supplement="notice"><h3>Legg merke til</h3><ul>${rows.map(value => `<li>${esc(value)}</li>`).join("")}</ul></section>`;
  }

  async function objectsSupplement(place) {
    const placeId = text(place?.id || place?.placeId);
    const cached = global.HGPlacePopupDirectTabs?.getSupplements?.(placeId, "objects") || [];
    if (cached.length) return cached.join("");

    const articles = await loadLeksikon(placeId);
    const main = mainArticle(articles, place);
    if (!main) return "";
    const owned = objectKeysAlreadyOwned(place);
    const candidates = [
      ...list(main?.artifacts),
      ...list(main?.objects),
      ...articles.filter(article => article !== main && objectLikeArticle(article))
    ].map(item => normalizeObject(item)).filter(item => {
      if (!item) return false;
      return !owned.has(text(item.id).toLowerCase()) && !owned.has(text(item.title).toLowerCase());
    });
    const interpretation = main?.interpretation && typeof main.interpretation === "object" ? main.interpretation : {};
    return renderObjectCards(candidates) + renderNotice(interpretation.what_to_notice);
  }

  function relationEndpoints(relation) {
    if (!relation || typeof relation !== "object") return [];
    return [
      relation.person_id, relation.personId, relation.target_person_id, relation.targetPersonId,
      relation.fromId, relation.from_id, relation.sourceId, relation.source_id,
      relation.toId, relation.to_id, relation.targetId, relation.target_id
    ].map(text).filter(Boolean);
  }

  function peopleIds(place) {
    return new Set([
      ...list(place?.people).map(person => text(typeof person === "string" ? person : person?.id || person?.person_id || person?.personId)),
      ...list(place?.people_ids).map(text),
      ...list(place?.person_ids).map(text)
    ].filter(Boolean));
  }

  function personRelations(place) {
    const personIdSet = peopleIds(place);
    const placeIds = new Set(list(global.PLACES).map(row => text(row?.id)).filter(Boolean));
    return list(place?.relations).filter(relation => {
      if (!relation || typeof relation !== "object") return false;
      const endpoints = relationEndpoints(relation);
      if (endpoints.some(id => personIdSet.has(id))) return true;
      if (text(relation?.person_id || relation?.personId || relation?.target_person_id || relation?.targetPersonId)) return true;
      // Ikke legg rene place→place-relasjoner i People; de eies av Relaterte steder.
      return endpoints.length > 0 && endpoints.some(id => !placeIds.has(id));
    });
  }

  function renderRelations(relations) {
    const rows = unique(relations, relation => relation?.id || [relation?.fromId, relation?.toId, relation?.type, relation?.label].map(text).join("|"));
    if (!rows.length) return "";
    return `<section class="pc-collection-supplement" data-collection-supplement="people-relations"><h3>Relasjoner</h3><div class="pc-relation-list">${rows.map(relation => {
      const title = text(relation?.label || relation?.title || relation?.name || relation?.relation || relation?.type || "Relasjon");
      const desc = text(relation?.description || relation?.desc || relation?.note || relation?.why);
      const type = text(relation?.type || relation?.kind || relation?.category);
      return `<article class="pc-relation-card">${type ? `<div class="pc-relation-chip">${esc(type)}</div>` : ""}<div class="pc-relation-title">${esc(title)}</div>${desc ? `<p class="pc-relation-desc">${esc(desc)}</p>` : ""}</article>`;
    }).join("")}</div></section>`;
  }

  function peopleSupplement(place) {
    const placeId = text(place?.id || place?.placeId);
    const cached = global.HGPlacePopupDirectTabs?.getSupplements?.(placeId, "people") || [];
    const canonical = renderRelations(personRelations(place));
    return canonical || cached.join("");
  }

  function install() {
    if (global[INSTALL_FLAG]) return true;
    const current = global.showPlaceCardRoundPopup;
    if (typeof current !== "function" || current.__hgCollectionKnowledgeRouting) return false;

    const wrapped = function showPlaceCardRoundPopupWithOwnedKnowledge(options = {}) {
      const kind = text(options?.kind);
      const place = options?.place || null;
      if (!place || !["objects", "people"].includes(kind)) return current.apply(this, arguments);

      const build = kind === "objects" ? objectsSupplement(place) : Promise.resolve(peopleSupplement(place));
      void Promise.resolve(build)
        .then(extra => current.call(this, { ...options, html: `${text(options?.html)}${extra || ""}` }))
        .catch(error => {
          if (global.DEBUG) console.warn("[place-collection-knowledge-routing]", error);
          current.call(this, options);
        });
      return undefined;
    };
    wrapped.__hgCollectionKnowledgeRouting = true;
    wrapped.__previous = current;
    global.showPlaceCardRoundPopup = wrapped;
    global.HGPlaceCollectionKnowledgeRouting = { objectsSupplement, peopleSupplement, personRelations };
    global[INSTALL_FLAG] = true;
    return true;
  }

  if (!install()) {
    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (install() || attempts > 400) global.clearInterval(timer);
    }, 50);
  }
})(window);
