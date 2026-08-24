// js/ui/place-popup-v2.js
// Rich place popup: popupDesc-first content, graceful media fallback and denser place context.
(function installPlacePopupV2(global) {
  "use strict";

  const INSTALL_FLAG = "__HG_PLACE_POPUP_V2_INSTALLED__";
  const POLL_FLAG = "__HG_PLACE_POPUP_V2_POLLING__";

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function firstText() {
    for (const value of arguments) {
      const candidate = text(value);
      if (candidate) return candidate;
    }
    return "";
  }

  function humanize(value) {
    const cleaned = text(value).replaceAll("_", " ").replace(/\s+/g, " ");
    if (!cleaned) return "";
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  function compactText(value, maxLength = 190) {
    const cleaned = text(value).replace(/\s+/g, " ");
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.slice(0, Math.max(0, maxLength - 1)).trimEnd() + "…";
  }

  function localizePlace(place) {
    try {
      if (typeof global.HG_I18N?.localizePlace === "function") {
        return global.HG_I18N.localizePlace(place) || place;
      }
    } catch {}
    return place;
  }

  function popupText(place) {
    return firstText(
      place?.popupDesc,
      place?.popupdesc,
      place?.description,
      place?.desc
    );
  }

  function renderParagraphs(value) {
    const source = text(value);
    if (!source) return "";

    return source
      .split(/\n\s*\n+/)
      .map(paragraph => text(paragraph))
      .filter(Boolean)
      .map(paragraph => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
      .join("");
  }

  function uniqueStrings(values) {
    const seen = new Set();
    const out = [];
    values.forEach(value => {
      const candidate = text(value);
      if (!candidate || seen.has(candidate)) return;
      seen.add(candidate);
      out.push(candidate);
    });
    return out;
  }

  function imageCandidates(place) {
    return uniqueStrings([
      place?.popupImage,
      place?.image,
      place?.cardImage,
      place?.imageCard,
      place?.frontImage
    ]);
  }

  function routeLengthMeters(place) {
    const segments = list(place?.routeSegments);
    const total = segments.reduce((sum, segment) => {
      const length = Number(segment?.lengthM);
      return Number.isFinite(length) && length > 0 ? sum + length : sum;
    }, 0);

    if (total > 0) return total;

    const direct = Number(
      place?.routeLengthM ??
      place?.lengthM ??
      place?.distanceM
    );
    return Number.isFinite(direct) && direct > 0 ? direct : 0;
  }

  function formatDistance(meters) {
    const value = Number(meters);
    if (!Number.isFinite(value) || value <= 0) return "";

    if (value >= 1000) {
      return `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 }).format(value / 1000)} km`;
    }
    return `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 }).format(value)} m`;
  }

  function helper(name) {
    return typeof global[name] === "function" ? global[name] : null;
  }

  function peopleForPlace(place) {
    const getPeople = helper("getPeopleForPlace");
    if (!getPeople) return [];
    try {
      return list(getPeople(place?.id));
    } catch {
      return [];
    }
  }

  function curatedRelationsForPlace(place) {
    const getRelations = helper("getRelationsForPlace");
    if (!getRelations) return [];

    try {
      const relations = list(getRelations(place?.id));
      const filterCurated = helper("filterCuratedRels");
      return filterCurated ? list(filterCurated(relations)) : relations;
    } catch {
      return [];
    }
  }

  function observationsForPlace(place) {
    const getObservations = helper("getObservationsForTarget");
    if (!getObservations) return [];
    try {
      return list(getObservations(place?.id, "place"));
    } catch {
      return [];
    }
  }

  function renderFeatureSection(title, items, extraClass = "") {
    const values = list(items).map(text).filter(Boolean);
    if (!values.length) return "";

    return `
      <section class="hg-section hg-place-section ${escapeAttr(extraClass)}">
        <h3>${escapeHtml(title)}</h3>
        <ul class="hg-place-feature-list">
          ${values.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `;
  }

  function renderRouteSection(place, routeLength) {
    const segments = list(place?.routeSegments);
    const anchors = list(place?.anchors);
    if (!segments.length && !anchors.length && !routeLength) return "";

    const firstAnchor = anchors[0];
    const lastAnchor = anchors.length > 1 ? anchors[anchors.length - 1] : null;
    const fromName = firstText(firstAnchor?.name, firstAnchor?.title);
    const toName = firstText(lastAnchor?.name, lastAnchor?.title);

    return `
      <section class="hg-section hg-place-section hg-place-route-section">
        <h3>Utstrekning</h3>
        <div class="hg-place-route-summary">
          ${fromName ? `<div><span>Fra</span><strong>${escapeHtml(fromName)}</strong></div>` : ""}
          ${toName ? `<div><span>Til</span><strong>${escapeHtml(toName)}</strong></div>` : ""}
          ${routeLength ? `<div><span>Lengde</span><strong>${escapeHtml(formatDistance(routeLength))}</strong></div>` : ""}
          ${segments.length ? `<div><span>Kartlagt som</span><strong>${segments.length} segmenter</strong></div>` : ""}
        </div>
      </section>
    `;
  }

  function numberValue(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function objectValue(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function spatialProfile(place) {
    return objectValue(place?.spatial_profile || place?.spatialProfile);
  }

  function temporalProfile(place) {
    return objectValue(place?.temporal_profile || place?.temporalProfile);
  }

  function formatArea(squareMeters) {
    const value = numberValue(squareMeters);
    if (value <= 0) return "";
    const formatter = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 });
    if (value >= 1000000) return `${formatter.format(value / 1000000)} km²`;
    if (value >= 1000) return `${formatter.format(value / 1000)} daa`;
    return `${formatter.format(value)} m²`;
  }

  function formatElevation(meters) {
    const value = numberValue(meters);
    if (value <= 0) return "";
    return `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 }).format(value)} moh`;
  }

  function formatHeight(meters) {
    const value = numberValue(meters);
    if (value <= 0) return "";
    return `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 }).format(value)} m`;
  }

  function renderMetric(label, value, note = "") {
    const safeValue = text(value);
    if (!safeValue) return "";
    return `
      <div class="hg-place-metric">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(safeValue)}</strong>
        ${note ? `<small>${escapeHtml(note)}</small>` : ""}
      </div>
    `;
  }

  function renderSpatialSection(place, routeLength) {
    const profile = spatialProfile(place);
    if (!Object.keys(profile).length) return "";

    const highestPoint = objectValue(profile.highest_point || profile.highestPoint);
    const linearExtent = numberValue(profile.linear_extent_m || profile.linearExtentM);
    const boundary = firstText(profile.boundary_description, profile.boundaryDescription);
    const terrain = firstText(profile.terrain_type, profile.terrainType, profile.landform);
    const metrics = [
      renderMetric("Areal", formatArea(profile.area_m2 || profile.areaM2)),
      renderMetric("Utstrekning", formatDistance(linearExtent)),
      renderMetric("Høyeste punkt", firstText(highestPoint.name, highestPoint.title)),
      renderMetric("Høyde", formatElevation(highestPoint.elevation_masl || highestPoint.elevationMasl || profile.elevation_masl || profile.elevationMasl)),
      renderMetric("Byggehøyde", formatHeight(profile.height_m || profile.heightM)),
      renderMetric("Terreng", humanize(terrain))
    ].filter(Boolean).join("");

    if (!metrics && !boundary) return "";
    return `
      <section class="hg-section hg-place-section hg-place-spatial-section">
        <h3>Nøkkeltall og landskap</h3>
        ${metrics ? `<div class="hg-place-metric-grid">${metrics}</div>` : ""}
        ${boundary ? `<p class="hg-place-boundary">${escapeHtml(boundary)}</p>` : ""}
      </section>
    `;
  }

  function findCanonicalSubplace(subplace) {
    const ids = uniqueStrings([
      subplace?.place_id,
      subplace?.placeId,
      subplace?.target_id,
      subplace?.targetId,
      subplace?.id
    ]);
    const places = list(global.PLACES);
    return ids.map(id => places.find(place => text(place?.id) === id)).find(Boolean) || null;
  }

  function renderSubplacesSection(place) {
    const subplaces = list(place?.subplaces).filter(item => item && typeof item === "object");
    if (!subplaces.length) return "";

    return `
      <section class="hg-section hg-place-section hg-place-subplaces-section">
        <h3>Dette finnes her</h3>
        <div class="hg-place-subplace-grid">
          ${subplaces.map(subplace => {
            const canonical = findCanonicalSubplace(subplace);
            const tag = canonical ? "button" : "article";
            const linkAttrs = canonical
              ? ` type="button" data-place="${escapeAttr(canonical.id)}"`
              : "";
            const typeLabel = humanize(firstText(subplace?.type, canonical?.locatorType, canonical?.type));
            const name = firstText(subplace?.name, subplace?.title, canonical?.name, subplace?.id);
            const summary = compactText(firstText(subplace?.summary, subplace?.desc, canonical?.desc), 230);
            return `
              <${tag} class="hg-place-subplace-card${canonical ? " is-linked" : ""}"${linkAttrs}>
                ${typeLabel ? `<span class="hg-place-subplace-type">${escapeHtml(typeLabel)}</span>` : ""}
                <strong>${escapeHtml(name)}</strong>
                ${summary ? `<p>${escapeHtml(summary)}</p>` : ""}
                ${canonical ? `<span class="hg-place-subplace-open">Åpne sted →</span>` : ""}
              </${tag}>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function timelineOrder(item, index) {
    const explicit = Number(item?.sort_order ?? item?.sortOrder);
    return Number.isFinite(explicit) ? explicit : index + 1;
  }

  function renderHistoryTimeline(place) {
    const layers = list(place?.history_layers)
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item && typeof item === "object")
      .sort((a, b) => timelineOrder(a.item, a.index) - timelineOrder(b.item, b.index));
    if (!layers.length) return "";

    return `
      <section class="hg-section hg-place-section hg-place-history-section">
        <h3>Historiske lag</h3>
        <div class="hg-place-timeline">
          ${layers.map(({ item }) => {
            const period = firstText(item?.period, item?.year, item?.date);
            const title = firstText(item?.title, item?.name, item?.id);
            const summary = firstText(item?.summary, item?.desc, item?.description);
            return `
              <article class="hg-place-timeline-item">
                <span class="hg-place-timeline-marker" aria-hidden="true"></span>
                <div class="hg-place-timeline-copy">
                  ${period ? `<span class="hg-place-timeline-period">${escapeHtml(period)}</span>` : ""}
                  <strong>${escapeHtml(title)}</strong>
                  ${summary ? `<p>${escapeHtml(summary)}</p>` : ""}
                </div>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderChips(values, maxItems = 18) {
    const items = uniqueStrings(list(values)).slice(0, maxItems);
    if (!items.length) return "";
    return `<div class="hg-place-chip-list">${items.map(item => `<span class="hg-place-chip">${escapeHtml(humanize(item))}</span>`).join("")}</div>`;
  }

  function renderNatureLandscape(place) {
    const profile = objectValue(place?.nature_profile || place?.natureProfile);
    if (!Object.keys(profile).length) return "";

    const birding = objectValue(profile.birding);
    const terrain = list(profile.terrain);
    const habitats = list(profile.habitats || profile.habitat_types || profile.nature_types);
    const species = list(birding.notable_species || profile.notable_species || profile.species);
    const seasons = list(birding.seasonal_focus || profile.seasonal_focus);
    const summary = firstText(profile.summary, profile.description);

    if (!terrain.length && !habitats.length && !species.length && !seasons.length && !summary) return "";
    return `
      <section class="hg-section hg-place-section hg-place-nature-section">
        <h3>Natur og landskap</h3>
        ${summary ? `<p class="hg-place-nature-summary">${escapeHtml(summary)}</p>` : ""}
        <div class="hg-place-nature-grid">
          ${terrain.length || habitats.length ? `
            <div class="hg-place-nature-block">
              <h4>Terreng og naturtyper</h4>
              ${renderChips([...terrain, ...habitats])}
            </div>
          ` : ""}
          ${species.length ? `
            <div class="hg-place-nature-block">
              <h4>Artsliv <span>${species.length}</span></h4>
              ${renderChips(species)}
            </div>
          ` : ""}
          ${seasons.length ? `
            <div class="hg-place-nature-block">
              <h4>Beste observasjonstid</h4>
              ${renderChips(seasons, 8)}
            </div>
          ` : ""}
        </div>
      </section>
    `;
  }

  function renderSourceSummary(place) {
    const sourceSummary = objectValue(place?.source_summary || place?.sourceSummary);
    const sources = uniqueStrings(list(sourceSummary.safe_sources || sourceSummary.sources));
    if (!sources.length) return "";

    return `
      <section class="hg-section hg-place-section hg-place-sources-section">
        <h3>Kilder i stedprofilen</h3>
        <ul class="hg-place-source-list">
          ${sources.map(source => `<li>${escapeHtml(source)}</li>`).join("")}
        </ul>
      </section>
    `;
  }

  function personMeta(person) {
    const parts = [
      humanize(person?.kind),
      firstText(person?.role, person?.occupation, person?.profession),
      person?.year ? String(person.year) : ""
    ].filter(Boolean);
    return uniqueStrings(parts).join(" · ");
  }

  function renderPeopleSection(people) {
    if (!people.length) return "";

    return `
      <section class="hg-section hg-place-section hg-place-people-section">
        <h3>Personer</h3>
        <div class="hg-place-people-grid">
          ${people.map(person => {
            const image = firstText(person?.imageCard, person?.cardImage, person?.image);
            const summary = compactText(firstText(person?.desc, person?.wiki, person?.description));
            const meta = personMeta(person);
            return `
              <button type="button" class="hg-place-person-card" data-person="${escapeAttr(person?.id)}">
                <span class="hg-place-person-media${image ? "" : " is-missing"}">
                  ${image ? `<img src="${escapeAttr(image)}" alt="" loading="lazy" onerror="this.hidden=true;this.parentElement.classList.add('is-missing')">` : ""}
                  <span class="hg-place-person-placeholder" aria-hidden="true">${escapeHtml(firstText(person?.name).charAt(0) || "•")}</span>
                </span>
                <span class="hg-place-person-copy">
                  <strong>${escapeHtml(firstText(person?.name, person?.id))}</strong>
                  ${meta ? `<span class="hg-place-person-meta">${escapeHtml(meta)}</span>` : ""}
                  ${summary ? `<span class="hg-place-person-summary">${escapeHtml(summary)}</span>` : ""}
                </span>
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderRelationsSection(relations) {
    if (!relations.length) return "";

    const renderRow = helper("renderRelationRow");
    if (!renderRow) return "";

    return `
      <section class="hg-section hg-place-section hg-place-relations-section">
        <h3>Tilknytning</h3>
        <ul class="hg-rel-list hg-place-relations-list">
          ${relations.map(relation => renderRow(relation)).join("")}
        </ul>
      </section>
    `;
  }

  function renderKnowledgeSection(place) {
    const completed = helper("hasCompletedQuiz")?.(place?.id) === true;
    if (!completed) return "";

    const categoryId = firstText(place?.category, place?.categoryId);
    const knowledge = categoryId
      ? helper("getInlineKnowledgeFor")?.(categoryId, place?.id)
      : null;
    const trivia = categoryId
      ? list(helper("getInlineTriviaFor")?.(categoryId, place?.id))
      : [];

    if (!knowledge && !trivia.length) return "";

    const knowledgeHtml = knowledge && typeof knowledge === "object"
      ? Object.entries(knowledge).map(([dimension, items]) => {
          const rows = list(items).filter(Boolean);
          if (!rows.length) return "";
          return `
            <div class="hg-place-knowledge-group">
              <h4>${escapeHtml(humanize(dimension))}</h4>
              <ul>
                ${rows.map(item => {
                  const topic = firstText(item?.topic, item?.title);
                  const body = firstText(item?.text, item?.knowledge, item?.desc);
                  return `<li>${topic ? `<strong>${escapeHtml(topic)}:</strong> ` : ""}${escapeHtml(body)}</li>`;
                }).join("")}
              </ul>
            </div>
          `;
        }).join("")
      : "";

    return `
      <section class="hg-section hg-place-section hg-place-knowledge-section">
        <h3>Kunnskap</h3>
        ${knowledgeHtml}
        ${trivia.length ? `
          <div class="hg-place-knowledge-group">
            <h4>Funfacts</h4>
            <ul>${trivia.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        ` : ""}
      </section>
    `;
  }

  function renderObservationsSection(observations) {
    if (!observations.length) return "";
    const renderObservations = helper("renderObsList");
    if (!renderObservations) return "";

    return `
      <section class="hg-section hg-place-section hg-place-observations-section">
        <h3>Observasjoner</h3>
        ${renderObservations(observations)}
      </section>
    `;
  }

  function renderWonderkammer(place) {
    const blocks = [];
    const dossier = global.WK_PLACE_DOC?.[place?.id];
    const chambers = list(global.WK_BY_PLACE?.[place?.id]);

    const renderDossier = helper("renderWonderkammerDossier");
    const renderChambers = helper("renderWonderkammerSection");

    if (dossier && renderDossier) blocks.push(renderDossier(dossier));
    if (chambers.length && renderChambers) {
      blocks.push(renderChambers(chambers, "Wonderkammer"));
    }
    return blocks.join("");
  }

  function attachHeroImage(popup, candidates) {
    const media = popup?.querySelector?.("[data-place-hero-media]");
    const image = popup?.querySelector?.("[data-place-hero-image]");
    if (!media || !image) return;

    if (!candidates.length) {
      media.classList.add("is-missing");
      image.hidden = true;
      return;
    }

    let index = 0;
    const loadNext = () => {
      if (index >= candidates.length) {
        image.removeAttribute("src");
        image.hidden = true;
        media.classList.add("is-missing");
        return;
      }

      media.classList.add("is-loading");
      image.hidden = false;
      image.src = candidates[index++];
    };

    image.addEventListener("load", () => {
      media.classList.remove("is-loading", "is-missing");
    });
    image.addEventListener("error", loadNext);
    loadNext();
  }

  async function showPlacePopupV2(inputPlace) {
    if (!inputPlace) return;
    if (global.HGPlaceOpen?.ensure && !global.HGPlaceOpen.has?.(inputPlace)) {
      inputPlace = await global.HGPlaceOpen.ensure(inputPlace) || inputPlace;
    } else {
      inputPlace = global.HGPlaceOpen?.getPlace?.(inputPlace) || inputPlace;
    }
    const place = localizePlace(inputPlace);

    const makePopup = helper("makePopup");
    if (!makePopup) return;

    const name = firstText(place?.name, place?.title, place?.id);
    const category = humanize(firstText(place?.category, place?.categoryId));
    const fullText = popupText(place);
    const shortDesc = firstText(place?.desc);
    const showLead = shortDesc && shortDesc !== fullText;
    const profile = place?.quiz_profile && typeof place.quiz_profile === "object"
      ? place.quiz_profile
      : {};
    const placeType = humanize(firstText(profile?.place_type, place?.locatorType, place?.type));
    const subtype = humanize(firstText(profile?.subtype));
    const year = firstText(place?.year, place?.builtYear, place?.fromYear);
    const routeLength = routeLengthMeters(place);
    const people = peopleForPlace(place);
    const relations = curatedRelationsForPlace(place);
    const observations = observationsForPlace(place);
    const events = list(global.HGEvents?.getByPlace?.(place?.id) || global.HG_PLACE_OPEN_EVENTS?.[place?.id]);
    const stories = list(global.HGStories?.getByPlace?.(place?.id));
    const candidates = imageCandidates(place);

    try {
      stories.forEach(story => {
        global.HGReads?.recordStory?.({ storyId: story?.id, placeId: place?.id });
      });
    } catch {}

    const headerMeta = uniqueStrings([category, year, placeType]).join(" · ");
    const renderEvents = helper("renderEventsSection");
    const renderStories = helper("renderStoriesSection");

    const html = `
      <article class="hg-modal hg-place-popup-v2">
        <header class="hg-modal-header hg-place-popup-header">
          <div class="hg-place-popup-heading">
            <p class="hg-place-popup-eyebrow">${escapeHtml(category || "Sted")}</p>
            <h2 class="hg-popup-title hg-modal-title">${escapeHtml(name)}</h2>
            ${headerMeta ? `<p class="hg-popup-cat hg-modal-meta">${escapeHtml(headerMeta)}</p>` : ""}
          </div>
        </header>

        <div class="hg-modal-body hg-place-popup-body">
          <section class="hg-place-hero">
            <div class="hg-place-hero-media is-missing" data-place-hero-media>
              <img class="hg-place-hero-image" data-place-hero-image alt="${escapeAttr(name)}" hidden>
              <div class="hg-place-hero-placeholder">
                <span aria-hidden="true">⌖</span>
                <strong>${escapeHtml(name)}</strong>
                <small>${escapeHtml(category || placeType || "History Go")}</small>
              </div>
            </div>

            <div class="hg-place-overview">
              ${subtype ? `<span class="hg-place-type-chip">${escapeHtml(subtype)}</span>` : ""}
              ${showLead ? `
                <div class="hg-place-lead">
                  <span>Kort fortalt</span>
                  <p>${escapeHtml(shortDesc)}</p>
                </div>
              ` : ""}
              <button class="hg-quiz-btn hg-place-quiz-btn" data-quiz="${escapeAttr(place?.id)}">Ta quiz</button>
            </div>
          </section>

          ${fullText ? `
            <section class="hg-section hg-place-section hg-place-about-section">
              <h3>Om stedet</h3>
              <div class="hg-place-longread">${renderParagraphs(fullText)}</div>
            </section>
          ` : ""}

          ${renderSpatialSection(place, routeLength)}
          ${renderSubplacesSection(place)}
          ${renderHistoryTimeline(place)}
          ${renderNatureLandscape(place)}

          <div class="hg-place-context-grid">
            ${renderFeatureSection("Særtrekk", profile?.signature_features, "hg-place-signatures-section")}
            ${renderFeatureSection("Se etter på stedet", profile?.must_include, "hg-place-look-section")}
          </div>

          ${renderRouteSection(place, routeLength)}
          ${renderPeopleSection(people)}
          ${renderRelationsSection(relations)}
          ${renderWonderkammer(place)}
          ${renderKnowledgeSection(place)}
          ${renderEvents ? renderEvents(events) : ""}
          ${renderStories ? renderStories(stories) : ""}
          ${renderSourceSummary(place)}
          ${renderObservationsSection(observations)}
        </div>
      </article>
    `;

    makePopup(html, "place-popup place-popup-v2");

    const popup = document.querySelector(".hg-popup.place-popup-v2");
    attachHeroImage(popup, candidates);

    const quizButton = popup?.querySelector?.(`[data-quiz="${global.CSS?.escape ? global.CSS.escape(String(place?.id || "")) : String(place?.id || "")}"]`)
      || popup?.querySelector?.("[data-quiz]");
    helper("enhanceQuizButton")?.(quizButton, place?.id);
  }

  function install() {
    if (global[INSTALL_FLAG]) return true;
    if (typeof global.showPlacePopup !== "function") return false;
    if (typeof global.makePopup !== "function") return false;

    const previous = global.showPlacePopup;
    /** @type {any} */
    const popup = showPlacePopupV2;
    popup.__previous = previous;
    popup.__usesPopupDesc = true;
    popup.__hgPlacePopupV2 = true;
    global.showPlacePopup = popup;
    global[INSTALL_FLAG] = true;
    return true;
  }

  if (!install() && !global[POLL_FLAG]) {
    global[POLL_FLAG] = true;
    let attempts = 0;
    const timer = global.setInterval(() => {
      attempts += 1;
      if (install() || attempts > 400) {
        global.clearInterval(timer);
        global[POLL_FLAG] = false;
      }
    }, 50);
  }
})(window);
