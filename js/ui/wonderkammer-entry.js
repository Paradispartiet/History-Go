// wonderkammer-entry.js
// Datadrevet entry-visning for chambers i Wonderkammer-data.
// Støtter hierarki: place/person → chambers → items.
// Bruker eksisterende makePopup-mønster fra popup-utils.js.

(function () {
  "use strict";

  function tUI(key, fallback = "") {
    try {
      return window.HG_I18N?.t?.(key, fallback) || fallback;
    } catch {
      return fallback;
    }
  }

  function tfUI(key, fallback = "", vars = {}) {
    const template = tUI(key, fallback);
    return String(template).replace(/\{(\w+)\}/g, (_, name) =>
      Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
    );
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function norm(value) {
    return String(value ?? "").trim();
  }

  function typeLabel(type) {
    const labels = {
      play_zone: tUI("ui.wonderkammer.type.playZone", "Lekeområde"),
      play_object: tUI("ui.wonderkammer.type.playObject", "Lekeobjekt"),
      open_play_area: tUI("ui.wonderkammer.type.openPlayArea", "Åpent lekeområde"),
      landscape_zone: tUI("ui.wonderkammer.type.landscapeZone", "Landskapssone"),
      nature_discovery: tUI("ui.wonderkammer.type.natureDiscovery", "Naturoppdagelse"),
      sensory_zone: tUI("ui.wonderkammer.type.sensoryZone", "Sansesone"),
      water_play_zone: tUI("ui.wonderkammer.type.waterPlayZone", "Vannlek"),
      seasonal_activity_zone: tUI("ui.wonderkammer.type.seasonalActivityZone", "Sesongaktivitet"),
      season_zone: tUI("ui.wonderkammer.type.seasonZone", "Sesong"),
      seasonal_activity: tUI("ui.wonderkammer.type.seasonalActivity", "Sesongaktivitet"),
      weather_activity: tUI("ui.wonderkammer.type.weatherActivity", "Væraktivitet"),
      light_observation: tUI("ui.wonderkammer.type.lightObservation", "Lysobservasjon"),
      winter_activity: tUI("ui.wonderkammer.type.winterActivity", "Vinteraktivitet"),
      spring_observation: tUI("ui.wonderkammer.type.springObservation", "Vårtegn"),
      summer_activity: tUI("ui.wonderkammer.type.summerActivity", "Sommeraktivitet"),
      autumn_observation: tUI("ui.wonderkammer.type.autumnObservation", "Høstobservasjon"),
      rain_observation: tUI("ui.wonderkammer.type.rainObservation", "Regnobservasjon"),
      snow_observation: tUI("ui.wonderkammer.type.snowObservation", "Snøobservasjon"),
      wind_observation: tUI("ui.wonderkammer.type.windObservation", "Vindobservasjon"),
      water_observation: tUI("ui.wonderkammer.type.waterObservation", "Vannobservasjon"),
      training_zone: tUI("ui.wonderkammer.type.trainingZone", "Treningssone"),
      training: tUI("ui.wonderkammer.type.training", "Trening"),
      art_zone: tUI("ui.wonderkammer.type.artZone", "Kunstsone"),
      artwork: tUI("ui.wonderkammer.type.artwork", "Kunstverk"),
      sculpture: tUI("ui.wonderkammer.type.sculpture", "Skulptur"),
      public_art: tUI("ui.wonderkammer.type.publicArt", "Offentlig kunst"),
      material_study: tUI("ui.wonderkammer.type.materialStudy", "Materialstudie"),
      street_art_zone: tUI("ui.wonderkammer.type.streetArtZone", "Gatekunstsone"),
      mural: tUI("ui.wonderkammer.type.mural", "Veggmaleri"),
      graffiti_piece: tUI("ui.wonderkammer.type.graffitiPiece", "Graffitiverk"),
      street_art_detail: tUI("ui.wonderkammer.type.streetArtDetail", "Gatekunstdetalj"),
      architecture_zone: tUI("ui.wonderkammer.type.architectureZone", "Arkitektursone"),
      architectural_feature: tUI("ui.wonderkammer.type.architecturalFeature", "Arkitektonisk trekk"),
      facade_detail: tUI("ui.wonderkammer.type.facadeDetail", "Fasadedetalj"),
      museum_zone: tUI("ui.wonderkammer.type.museumZone", "Museumssone"),
      library_zone: tUI("ui.wonderkammer.type.libraryZone", "Biblioteksone"),
      knowledge_zone: tUI("ui.wonderkammer.type.knowledgeZone", "Kunnskapssone"),
      collection_activity: tUI("ui.wonderkammer.type.collectionActivity", "Samlingsaktivitet"),
      reading_activity: tUI("ui.wonderkammer.type.readingActivity", "Leseaktivitet"),
      observation_activity: tUI("ui.wonderkammer.type.observationActivity", "Observasjonsaktivitet"),
      archive_trace: tUI("ui.wonderkammer.type.archiveTrace", "Arkivspor"),
      research_trace: tUI("ui.wonderkammer.type.researchTrace", "Forskningsspor"),
      exploration_zone: tUI("ui.wonderkammer.type.explorationZone", "Utforskingssone"),
      thing_to_see: tUI("ui.wonderkammer.type.thingToSee", "Ting å se"),
      viewpoint: tUI("ui.wonderkammer.type.viewpoint", "Utsiktspunkt"),
      urban_space: tUI("ui.wonderkammer.type.urbanSpace", "Byrom"),
      media_concept: tUI("ui.wonderkammer.type.mediaConcept", "Mediekonsept"),
      quiet_zone: tUI("ui.wonderkammer.type.quietZone", "Rolig sone")
    };
    const t = norm(type);
    return labels[t] || t || "Wonderkammer";
  }

  function byId(list, id) {
    const key = norm(id);
    return (Array.isArray(list) ? list : []).find(x => norm(x?.id) === key) || null;
  }

  function placeName(id) {
    const place = byId(window.PLACES, id);
    return place?.name || norm(id);
  }

  function personName(id) {
    const person = byId(window.PEOPLE, id);
    return person?.name || norm(id);
  }

  function findNestedEntry(list, id, parent = null) {
    const key = norm(id);
    for (const entry of (Array.isArray(list) ? list : [])) {
      if (norm(entry?.id) === key) {
        return { entry, parent };
      }

      const childHit = findNestedEntry(entry?.items, key, entry);
      if (childHit) return childHit;
    }
    return null;
  }

  function findEntry(entryId) {
    const id = norm(entryId);
    const wk = window.WONDERKAMMER;
    if (!id || !wk) return null;

    const places = Array.isArray(wk.places) ? wk.places : [];
    for (const row of places) {
      const hit = findNestedEntry(row?.chambers, id);
      if (hit) {
        const parentId = norm(row.place_id || row.place);
        return {
          entry: hit.entry,
          parentEntry: hit.parent,
          parentType: "place",
          parentId,
          parentName: placeName(parentId)
        };
      }
    }

    const people = Array.isArray(wk.people) ? wk.people : [];
    for (const row of people) {
      const hit = findNestedEntry(row?.chambers, id);
      if (hit) {
        const parentId = norm(row.person_id || row.person);
        return {
          entry: hit.entry,
          parentEntry: hit.parent,
          parentType: "person",
          parentId,
          parentName: personName(parentId)
        };
      }
    }

    const legacy = findNestedEntry(wk.chambers, id);
    if (legacy) {
      const placeId = norm(wk.place_id || wk.place);
      const personId = norm(wk.person_id || wk.person);
      return {
        entry: legacy.entry,
        parentEntry: legacy.parent,
        parentType: placeId ? "place" : "person",
        parentId: placeId || personId,
        parentName: placeId ? placeName(placeId) : personName(personId)
      };
    }

    return null;
  }

  function childListHtml(entry) {
    const items = Array.isArray(entry?.items) ? entry.items : [];
    if (!items.length) return "";

    return `
      <section class="wk-entry-section">
        <h3>${esc(tUI("ui.wonderkammer.insideThisLevel", "Inne i dette nivået"))}</h3>
        <div class="pc-wk-chambers">
          ${items.map(item => {
            const id = norm(item?.id);
            const title = norm(item?.title || item?.label || item?.name || id);
            const type = typeLabel(item?.type);
            if (!id) return "";
            const desc = norm(item?.description || item?.desc);
            return `
              <button class="pc-wk-entry" type="button" data-wk-nav="${esc(id)}">
                <span class="pc-wk-entry-title">${esc(title)}</span>
                <span class="pc-wk-entry-type">${esc(type)}</span>
                ${desc ? `<span class="pc-wk-entry-desc">${esc(desc)}</span>` : ""}
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function metaGridHtml(entry) {
    // adultRole får egen seksjon via SMART_SECTIONS når den finnes – derfor
    // utelater vi den fra meta-griden for å unngå duplisert visning.
    const fields = [
      ["safetyNote", "Trygghet"],
      ["durationHint", "Varighet"],
      ["intensity", "Intensitet"],
      ["equipment", "Utstyr"],
      ["season", "Sesong"],
      ["playMode", "Lekemodus"],
      ["socialMode", "Sosial modus"]
    ];

    const blocks = fields
      .map(([key, label]) => {
        const value = norm(entry?.[key]);
        if (!value) return "";
        return `
          <div class="wk-entry-meta-item">
            <h4>${esc(label)}</h4>
            <p>${esc(value)}</p>
          </div>
        `;
      })
      .filter(Boolean)
      .join("");

    if (!blocks) return "";
    return `
      <section class="wk-entry-section">
        <div class="wk-entry-meta-grid">${blocks}</div>
      </section>
    `;
  }

  // Valgfrie smart-felt. Vises kun når feltet finnes på entryen.
  // Rekkefølgen styrer rekkefølgen i popupen.
  const SMART_SECTIONS = [
    ["observationHook", tUI("ui.wonderkammer.lookFor", "Se etter")],
    ["whyItMatters", tUI("ui.wonderkammer.whyItMatters", "Hvorfor det betyr noe")],
    ["placeSpecificDetail", tUI("ui.wonderkammer.placeSpecificDetail", "Stedsspesifikk detalj")],
    ["sensoryPrompt", "Sans dette"],
    ["microMission", "Mikrooppgave"],
    ["childAction", "Barnets handling"],
    ["adultRole", "Voksenrollen"],
    ["historyLayer", "Historisk lag"],
    ["socialLayer", "Sosialt lag"],
    ["materialLayer", "Materiallag"],
    ["conceptHook", "Begrepskrok"],
    ["collectibleHint", "Kan samles som"]
  ];


  const TREASURE_SECTIONS = [
    ["treasureTitle", tUI("ui.wonderkammer.treasure", "Skatten")],
    ["treasureScope", tUI("ui.wonderkammer.treasureType", "Skattetype")],
    ["cabinetCategory", "Kategori"],
    ["treasureType", "Type"],
    ["curiosity", "Hva er forunderlig?"],
    ["whereToFind", "Hvor finner du den?"],
    ["whatToDo", tUI("ui.wonderkammer.type.whatCanYouDoWithIt", "Hva kan du gjøre med den?")],
    ["whatToNotice", "Legg merke til"],
    ["material", "Materiale"],
    ["rarity", "Sjeldenhet"],
    ["collectible", "Kan samles som"],
    ["collectionNote", "Samlingsnotat"],
    ["sourceNote", tUI("ui.wonderkammer.basis", "Grunnlag")]
  ];

  const TREASURE_SCOPE_LABELS = {
    actual_site_treasure: "Faktisk stedsskatt",
    category_object: "Typisk kategoriobjekt"
  };

  function treasureFieldDisplay(key, value) {
    if (key === "treasureScope") {
      return TREASURE_SCOPE_LABELS[value] || value;
    }
    return value;
  }

  function treasureSectionsHtml(entry) {
    return TREASURE_SECTIONS
      .map(([key, label]) => {
        const value = norm(entry?.[key]);
        if (!value) return "";
        const display = treasureFieldDisplay(key, value);
        return `
          <section class="wk-entry-section wk-entry-section--treasure" data-wk-field="${esc(key)}">
            <h3>${esc(label)}</h3>
            <p>${esc(display)}</p>
          </section>
        `;
      })
      .filter(Boolean)
      .join("");
  }

  function smartSectionsHtml(entry) {
    return SMART_SECTIONS
      .map(([key, label]) => {
        const value = norm(entry?.[key]);
        if (!value) return "";
        return `
          <section class="wk-entry-section wk-entry-section--smart" data-wk-field="${esc(key)}">
            <h3>${esc(label)}</h3>
            <p>${esc(value)}</p>
          </section>
        `;
      })
      .filter(Boolean)
      .join("");
  }

  function openEntry(entryId) {
    const resolved = findEntry(entryId);
    if (!resolved) {
      window.showToast?.("Fant ikke Wonderkammer-entry");
      return;
    }

    const entry = resolved.entry || {};
    const title = norm(entry.title || entry.label || entry.name || entry.id);
    const type = typeLabel(entry.type);
    const description = norm(entry.description || entry.desc);
    const activityText = norm(entry.activityText || entry.activity || entry.useText);
    const ageHint = norm(entry.ageHint || entry.age || entry.levelHint);
    const parentTitle = norm(resolved.parentEntry?.title || "");
    const parentEntryId = norm(resolved.parentEntry?.id || "");
    const breadcrumb = [resolved.parentName, parentTitle, title].filter(Boolean).join(" \u2192 ");

    const html = `
      <article class="wk-entry-popup hg-modal">
        <header class="hg-modal-header">
        <p class="wk-entry-breadcrumb hg-modal-meta">${esc(breadcrumb || title)}</p>
        <div class="wk-entry-type-chip hg-modal-meta">${esc(type)}</div>
        ${parentEntryId ? `<button class="wk-entry-back" type="button" data-wk-nav="${esc(parentEntryId)}">${esc(tfUI("ui.wonderkammer.backToParent", "← Tilbake til {parent}", { parent: parentTitle || tUI("ui.wonderkammer.previousLevel", "forrige nivå") }))}</button>` : ""}
        <h2 class="hg-popup-name hg-modal-title">${esc(title)}</h2>
        </header>
        <div class="hg-modal-body">
        ${description ? `<p class="hg-popup-desc">${esc(description)}</p>` : ""}
        ${treasureSectionsHtml(entry)}
        ${activityText ? `<section class="wk-entry-section"><h3>${esc(tUI("ui.wonderkammer.whatCanYouDoHere", "Hva kan man gjøre her?"))}</h3><p>${esc(activityText)}</p></section>` : ""}
        ${ageHint ? `<section class="wk-entry-section"><h3>${esc(tUI("ui.wonderkammer.ageLevel", "Alder / nivå"))}</h3><p>${esc(ageHint)}</p></section>` : ""}
        ${smartSectionsHtml(entry)}
        ${metaGridHtml(entry)}
        ${childListHtml(entry)}
        </div>
        <footer class="hg-modal-footer">
          <button class="reward-ok" data-close-popup>${esc(tUI("ui.attr.close", "Lukk"))}</button>
        </footer>
      </article>
    `;

    const popupFn = window.makePopup || (typeof makePopup === "function" ? makePopup : null);
    if (typeof popupFn === "function") {
      popupFn(html, "wonderkammer-entry-popup");
      const root = /** @type {HTMLElement} */ (document.querySelector(".hg-popup.wonderkammer-entry-popup"));
      if (root && !root.dataset.wkNavBound) {
        root.dataset.wkNavBound = "1";
        root.addEventListener("click", (e) => {
          const btn = /** @type {HTMLElement|null} */ (/** @type {Element} */ (e.target).closest("[data-wk-nav]"));
          if (!btn || !root.contains(btn)) return;
          const nextId = norm(btn.dataset.wkNav);
          if (!nextId) return;
          openEntry(nextId);
        });
      }
      return;
    }

    window.showToast?.("Popup-systemet er ikke lastet");
  }

  window.openWonderkammerEntry = openEntry;
  window.Wonderkammer = window.Wonderkammer || {};
  window.Wonderkammer.openEntry = openEntry;
})();

// ============================================================
// WONDERKAMMER LIST GROUPING
// Grupperer hovedlisten i PlaceCard-rundingen etter type.
// Bevarer eksisterende data-wk-flow og entry-popup.
// ============================================================
(function () {
  "use strict";

  function tUI(key, fallback = "") {
    try {
      return window.HG_I18N?.t?.(key, fallback) || fallback;
    } catch {
      return fallback;
    }
  }

  if (window.__wkListGroupingBound) return;
  window.__wkListGroupingBound = true;

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function norm(value) {
    return String(value ?? "").trim();
  }

  function typeLabel(type) {
    const labels = {
      play_zone: tUI("ui.wonderkammer.type.playZone", "Lekeområde"),
      play_object: tUI("ui.wonderkammer.type.playObject", "Lekeobjekt"),
      open_play_area: tUI("ui.wonderkammer.type.openPlayArea", "Åpent lekeområde"),
      landscape_zone: tUI("ui.wonderkammer.type.landscapeZone", "Landskapssone"),
      nature_discovery: tUI("ui.wonderkammer.type.natureDiscovery", "Naturoppdagelse"),
      sensory_zone: tUI("ui.wonderkammer.type.sensoryZone", "Sansesone"),
      water_play_zone: tUI("ui.wonderkammer.type.waterPlayZone", "Vannlek"),
      seasonal_activity_zone: tUI("ui.wonderkammer.type.seasonalActivityZone", "Sesongaktivitet"),
      season_zone: tUI("ui.wonderkammer.type.seasonZone", "Sesong"),
      seasonal_activity: tUI("ui.wonderkammer.type.seasonalActivity", "Sesongaktivitet"),
      weather_activity: tUI("ui.wonderkammer.type.weatherActivity", "Væraktivitet"),
      light_observation: tUI("ui.wonderkammer.type.lightObservation", "Lysobservasjon"),
      winter_activity: tUI("ui.wonderkammer.type.winterActivity", "Vinteraktivitet"),
      spring_observation: tUI("ui.wonderkammer.type.springObservation", "Vårtegn"),
      summer_activity: tUI("ui.wonderkammer.type.summerActivity", "Sommeraktivitet"),
      autumn_observation: tUI("ui.wonderkammer.type.autumnObservation", "Høstobservasjon"),
      rain_observation: tUI("ui.wonderkammer.type.rainObservation", "Regnobservasjon"),
      snow_observation: tUI("ui.wonderkammer.type.snowObservation", "Snøobservasjon"),
      wind_observation: tUI("ui.wonderkammer.type.windObservation", "Vindobservasjon"),
      water_observation: tUI("ui.wonderkammer.type.waterObservation", "Vannobservasjon"),
      training_zone: tUI("ui.wonderkammer.type.trainingZone", "Treningssone"),
      training: tUI("ui.wonderkammer.type.training", "Trening"),
      art_zone: tUI("ui.wonderkammer.type.artZone", "Kunstsone"),
      artwork: tUI("ui.wonderkammer.type.artwork", "Kunstverk"),
      sculpture: tUI("ui.wonderkammer.type.sculpture", "Skulptur"),
      public_art: tUI("ui.wonderkammer.type.publicArt", "Offentlig kunst"),
      material_study: tUI("ui.wonderkammer.type.materialStudy", "Materialstudie"),
      street_art_zone: tUI("ui.wonderkammer.type.streetArtZone", "Gatekunstsone"),
      mural: tUI("ui.wonderkammer.type.mural", "Veggmaleri"),
      graffiti_piece: tUI("ui.wonderkammer.type.graffitiPiece", "Graffitiverk"),
      street_art_detail: tUI("ui.wonderkammer.type.streetArtDetail", "Gatekunstdetalj"),
      architecture_zone: tUI("ui.wonderkammer.type.architectureZone", "Arkitektursone"),
      architectural_feature: tUI("ui.wonderkammer.type.architecturalFeature", "Arkitektonisk trekk"),
      facade_detail: tUI("ui.wonderkammer.type.facadeDetail", "Fasadedetalj"),
      museum_zone: tUI("ui.wonderkammer.type.museumZone", "Museumssone"),
      library_zone: tUI("ui.wonderkammer.type.libraryZone", "Biblioteksone"),
      knowledge_zone: tUI("ui.wonderkammer.type.knowledgeZone", "Kunnskapssone"),
      collection_activity: tUI("ui.wonderkammer.type.collectionActivity", "Samlingsaktivitet"),
      reading_activity: tUI("ui.wonderkammer.type.readingActivity", "Leseaktivitet"),
      observation_activity: tUI("ui.wonderkammer.type.observationActivity", "Observasjonsaktivitet"),
      archive_trace: tUI("ui.wonderkammer.type.archiveTrace", "Arkivspor"),
      research_trace: tUI("ui.wonderkammer.type.researchTrace", "Forskningsspor"),
      exploration_zone: tUI("ui.wonderkammer.type.explorationZone", "Utforskingssone"),
      thing_to_see: tUI("ui.wonderkammer.type.thingToSee", "Ting å se"),
      viewpoint: tUI("ui.wonderkammer.type.viewpoint", "Utsiktspunkt"),
      urban_space: tUI("ui.wonderkammer.type.urbanSpace", "Byrom"),
      media_concept: tUI("ui.wonderkammer.type.mediaConcept", "Mediekonsept"),
      quiet_zone: tUI("ui.wonderkammer.type.quietZone", "Rolig sone")
    };
    const t = norm(type);
    return labels[t] || t || "Wonderkammer";
  }

  const GROUPS = [
    {
      id: "play",
      title: tUI("ui.wonderkammer.group.play", "Lek"),
      types: ["play_zone", "play_object", "open_play_area"]
    },
    {
      id: "nature",
      title: tUI("ui.wonderkammer.group.nature", "Natur"),
      types: ["landscape_zone", "nature_discovery", "sensory_zone", "water_play_zone", "seasonal_activity_zone"]
    },
    {
      id: "season",
      title: tUI("ui.wonderkammer.group.season", "Sesong"),
      types: ["season_zone", "seasonal_activity", "weather_activity", "light_observation", "winter_activity", "spring_observation", "summer_activity", "autumn_observation", "rain_observation", "snow_observation", "wind_observation", "water_observation"]
    },
    {
      id: "training",
      title: tUI("ui.wonderkammer.group.training", "Trening"),
      types: ["training_zone", "training"]
    },
    {
      id: "art",
      title: tUI("ui.wonderkammer.group.art", "Kunst"),
      types: ["art_zone", "artwork", "sculpture", "public_art", "material_study"]
    },
    {
      id: "street_art",
      title: tUI("ui.wonderkammer.group.streetArt", "Gatekunst"),
      types: ["street_art_zone", "mural", "graffiti_piece", "street_art_detail"]
    },
    {
      id: "architecture",
      title: tUI("ui.wonderkammer.group.architecture", "Arkitektur"),
      types: ["architecture_zone", "architectural_feature", "facade_detail"]
    },
    {
      id: "knowledge",
      title: tUI("ui.wonderkammer.group.knowledge", "Kunnskap"),
      types: ["museum_zone", "library_zone", "knowledge_zone", "collection_activity", "reading_activity", "observation_activity", "archive_trace", "research_trace"]
    },
    {
      id: "explore",
      title: tUI("ui.wonderkammer.group.exploration", "Utforsking"),
      types: ["exploration_zone", "thing_to_see", "viewpoint", "urban_space", "media_concept"]
    },
    {
      id: "quiet",
      title: tUI("ui.wonderkammer.group.quiet", "Rolig"),
      types: ["quiet_zone"]
    },
    {
      id: "other",
      title: tUI("ui.wonderkammer.group.other", "Annet"),
      types: []
    }
  ];

  function groupFor(entry) {
    const type = norm(entry?.type);
    return GROUPS.find(group => group.types.includes(type)) || GROUPS[GROUPS.length - 1];
  }

  function ensureWonderkammerStylesheet() {
    if (document.querySelector('link[href="css/wonderkammer.css"]')) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/wonderkammer.css";
    document.head.appendChild(link);
  }

  function entryButtonHtml(entry) {
    const id = norm(entry?.id);
    if (!id) return "";

    const title = norm(entry?.title || entry?.label || entry?.name || id);
    const type = typeLabel(entry?.type);
    const desc = norm(entry?.description || entry?.desc);

    return `
      <button class="pc-wk-entry" type="button" data-wk="${esc(id)}">
        <span class="pc-wk-entry-title">${esc(title)}</span>
        <span class="pc-wk-entry-type">${esc(type)}</span>
        ${desc ? `<span class="pc-wk-entry-desc">${esc(desc)}</span>` : ""}
      </button>
    `;
  }

  function bindEntryClicks(root) {
    root.querySelectorAll("[data-wk]").forEach(btn => {
      btn.onclick = () => {
        const id = norm(btn.dataset.wk);
        if (!id) return;

        if (window.Wonderkammer && typeof window.Wonderkammer.openEntry === "function") {
          window.Wonderkammer.openEntry(id);
        } else if (typeof window.openWonderkammerEntry === "function") {
          window.openWonderkammerEntry(id);
        } else {
          window.showToast?.(tUI("ui.wonderkammer.notLoaded", "Wonderkammer-handler ikke lastet"));
        }
      };
    });
  }

  function setRoundCount(icon, count) {
    if (!icon) return;
    icon.innerHTML = `
      <div class="pc-round-label">
        <span class="pc-round-emoji">🗃️</span>
        <span class="pc-round-count">${Number(count) || 0}</span>
      </div>
    `;
  }

  function renderGroupedWonderkammerList(place) {
    const listEl = document.getElementById("pcWonderkammerList");
    if (!listEl || !place?.id) return;

    const chambers = Array.isArray(window.WK_BY_PLACE?.[place.id])
      ? window.WK_BY_PLACE[place.id]
      : [];

    if (!chambers.length) return;

    ensureWonderkammerStylesheet();

    const buckets = new Map(GROUPS.map(group => [group.id, { group, entries: [] }]));
    for (const entry of chambers) {
      const group = groupFor(entry);
      buckets.get(group.id).entries.push(entry);
    }

    const groupedHtml = GROUPS
      .map(group => buckets.get(group.id))
      .filter(bucket => bucket.entries.length)
      .map(bucket => `
        <section class="pc-wk-group" data-wk-group="${esc(bucket.group.id)}">
          <div class="pc-wk-group-head">
            <span class="pc-wk-group-title">${esc(bucket.group.title)}</span>
            <span class="pc-wk-group-count">${bucket.entries.length}</span>
          </div>
          <div class="pc-wk-group-list">
            ${bucket.entries.map(entryButtonHtml).join("")}
          </div>
        </section>
      `)
      .join("");

    const relationHtml =
      (typeof window.wonderChambersForPlace === "function")
        ? window.wonderChambersForPlace(place)
        : "";

    listEl.innerHTML = `
      <div class="pc-wk-groups">
        ${groupedHtml}
      </div>
      ${relationHtml || ""}
    `;

    bindEntryClicks(listEl);

    const count = listEl.querySelectorAll("[data-wk]").length ||
      listEl.querySelectorAll(".hg-rel-link").length ||
      0;

    setRoundCount(document.getElementById("pcWonderkammerIcon"), count);
  }

  const originalOpenPlaceCard = window.openPlaceCard;
  if (typeof originalOpenPlaceCard !== "function") return;

  window.openPlaceCard = async function (...args) {
    const result = await originalOpenPlaceCard.apply(this, args);
    try {
      renderGroupedWonderkammerList(args[0]);
    } catch (err) {
      console.warn("[Wonderkammer grouping]", err);
    }
    return result;
  };

  window.renderGroupedWonderkammerList = renderGroupedWonderkammerList;
})();
