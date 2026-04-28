function showToast(msg, ms = null) {
  const t = el.toast;
  if (!t) return;

  clearTimeout(t._hide);
  t._hide = null;

  t.innerHTML = "";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "toast-close";
  closeBtn.setAttribute("aria-label", "Lukk melding");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => {
    t.style.display = "none";
  });

  const body = document.createElement("div");
  body.className = "toast-body";
  body.textContent = String(msg || "");

  t.appendChild(closeBtn);
  t.appendChild(body);
  t.style.display = "block";

  if (Number.isFinite(ms) && Number(ms) > 0) {
    t._hide = setTimeout(() => {
      t.style.display = "none";
    }, Number(ms));
  }
}

// ============================================================
// WONDERKAMMER ENTRY HANDLER
// Datadrevet entry-visning for chambers i Wonderkammer-data.
// Støtter hierarki: place/person → chambers → items.
// Bruker eksisterende makePopup-mønster fra popup-utils.js.
// ============================================================
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
