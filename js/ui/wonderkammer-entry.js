// wonderkammer-entry.js
// Datadrevet entry-visning for chambers i Wonderkammer-data.
// Støtter hierarki: place/person → chambers → items.
// Bruker eksisterende makePopup-mønster fra popup-utils.js.

(function () {
  "use strict";

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
      play_zone: "Lekeområde",
      open_play_area: "Åpent lekeområde",
      exploration_zone: "Utforskingssone",
      thing_to_see: "Ting å se",
      quiet_zone: "Rolig sone",
      water_play_zone: "Vannlek",
      seasonal_activity_zone: "Sesongaktivitet",
      play_object: "Lekeobjekt",
      activity: "Aktivitet",
      training_zone: "Treningssone",
      training: "Trening",
      media_concept: "Mediebegrep",
      art_zone: "Kunstsone",
      artwork: "Kunstverk",
      sculpture: "Skulptur",
      public_art: "Offentlig kunst",
      street_art_zone: "Gatekunst",
      mural: "Veggmaleri",
      graffiti_piece: "Graffiti",
      street_art_detail: "Gatekunst-detalj",
      architecture_zone: "Arkitektursone",
      architectural_feature: "Arkitekturdetalj",
      facade_detail: "Fasadedetalj",
      material_study: "Materialstudie",
      viewpoint: "Utsiktspunkt",
      urban_space: "Byrom"
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
        <h3>Inne i dette nivået</h3>
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
    const fields = [
      ["safetyNote", "Trygghet"],
      ["durationHint", "Varighet"],
      ["intensity", "Intensitet"],
      ["equipment", "Utstyr"],
      ["season", "Sesong"],
      ["adultRole", "Voksenrolle"],
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
      <article class="wk-entry-popup">
        <div class="wk-entry-breadcrumb">${esc(breadcrumb || title)}</div>
        <div class="wk-entry-type-chip">${esc(type)}</div>
        ${parentEntryId ? `<button class="wk-entry-back" type="button" data-wk-nav="${esc(parentEntryId)}">← Tilbake til ${esc(parentTitle || "forrige nivå")}</button>` : ""}
        <h2 class="hg-popup-name">${esc(title)}</h2>
        ${description ? `<p class="hg-popup-desc">${esc(description)}</p>` : ""}
        ${activityText ? `<section class="wk-entry-section"><h3>Hva kan man gjøre her?</h3><p>${esc(activityText)}</p></section>` : ""}
        ${ageHint ? `<section class="wk-entry-section"><h3>Alder / nivå</h3><p>${esc(ageHint)}</p></section>` : ""}
        ${metaGridHtml(entry)}
        ${childListHtml(entry)}
        <button class="reward-ok" data-close-popup>Lukk</button>
      </article>
    `;

    const popupFn = window.makePopup || (typeof makePopup === "function" ? makePopup : null);
    if (typeof popupFn === "function") {
      popupFn(html, "wonderkammer-entry-popup");
      const root = document.querySelector(".hg-popup.wonderkammer-entry-popup");
      if (root && !root.dataset.wkNavBound) {
        root.dataset.wkNavBound = "1";
        root.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-wk-nav]");
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
      play_zone: "Lekeområde",
      open_play_area: "Åpent lekeområde",
      exploration_zone: "Utforskingssone",
      thing_to_see: "Ting å se",
      quiet_zone: "Rolig sone",
      water_play_zone: "Vannlek",
      seasonal_activity_zone: "Sesongaktivitet",
      play_object: "Lekeobjekt",
      activity: "Aktivitet",
      training_zone: "Treningssone",
      training: "Trening",
      media_concept: "Mediebegrep",
      art_zone: "Kunstsone",
      artwork: "Kunstverk",
      sculpture: "Skulptur",
      public_art: "Offentlig kunst",
      street_art_zone: "Gatekunst",
      mural: "Veggmaleri",
      graffiti_piece: "Graffiti",
      street_art_detail: "Gatekunst-detalj",
      architecture_zone: "Arkitektursone",
      architectural_feature: "Arkitekturdetalj",
      facade_detail: "Fasadedetalj",
      material_study: "Materialstudie",
      viewpoint: "Utsiktspunkt",
      urban_space: "Byrom"
    };
    const t = norm(type);
    return labels[t] || t || "Wonderkammer";
  }

  const GROUPS = [
    {
      id: "play",
      title: "Lek",
      types: ["play_zone", "play_object", "open_play_area", "water_play_zone", "seasonal_activity_zone"]
    },
    {
      id: "training",
      title: "Trening",
      types: ["training_zone", "training"]
    },
    {
      id: "art",
      title: "Kunst",
      types: ["art_zone", "artwork", "sculpture", "public_art", "material_study"]
    },
    {
      id: "street_art",
      title: "Gatekunst",
      types: ["street_art_zone", "mural", "graffiti_piece", "street_art_detail"]
    },
    {
      id: "architecture",
      title: "Arkitektur",
      types: ["architecture_zone", "architectural_feature", "facade_detail"]
    },
    {
      id: "explore",
      title: "Utforsking",
      types: ["exploration_zone", "thing_to_see", "viewpoint", "urban_space", "media_concept"]
    },
    {
      id: "quiet",
      title: "Rolig",
      types: ["quiet_zone"]
    },
    {
      id: "other",
      title: "Annet",
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
          window.showToast?.("Wonderkammer-handler ikke lastet");
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
