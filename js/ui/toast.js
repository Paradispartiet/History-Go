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
// Datadrevet entry-visning for chambers i data/wonderkammer.json.
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
      play_object: "Lekeobjekt",
      activity: "Aktivitet",
      training: "Trening",
      media_concept: "Mediebegrep"
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

  function findEntry(entryId) {
    const id = norm(entryId);
    const wk = window.WONDERKAMMER;
    if (!id || !wk) return null;

    const places = Array.isArray(wk.places) ? wk.places : [];
    for (const row of places) {
      const chambers = Array.isArray(row?.chambers) ? row.chambers : [];
      const hit = chambers.find(c => norm(c?.id) === id);
      if (hit) {
        const parentId = norm(row.place_id || row.place);
        return {
          entry: hit,
          parentType: "place",
          parentId,
          parentName: placeName(parentId)
        };
      }
    }

    const people = Array.isArray(wk.people) ? wk.people : [];
    for (const row of people) {
      const chambers = Array.isArray(row?.chambers) ? row.chambers : [];
      const hit = chambers.find(c => norm(c?.id) === id);
      if (hit) {
        const parentId = norm(row.person_id || row.person);
        return {
          entry: hit,
          parentType: "person",
          parentId,
          parentName: personName(parentId)
        };
      }
    }

    const legacy = (Array.isArray(wk.chambers) ? wk.chambers : []).find(c => norm(c?.id) === id);
    if (legacy) {
      const placeId = norm(wk.place_id || wk.place);
      const personId = norm(wk.person_id || wk.person);
      return {
        entry: legacy,
        parentType: placeId ? "place" : "person",
        parentId: placeId || personId,
        parentName: placeId ? placeName(placeId) : personName(personId)
      };
    }

    return null;
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

    const html = `
      <article class="wk-entry-popup">
        <div class="wk-entry-kicker">${esc(type)}${resolved.parentName ? ` · ${esc(resolved.parentName)}` : ""}</div>
        <h2 class="hg-popup-name">${esc(title)}</h2>
        ${description ? `<p class="hg-popup-desc">${esc(description)}</p>` : ""}
        ${activityText ? `<section class="wk-entry-section"><h3>Hva kan man gjøre her?</h3><p>${esc(activityText)}</p></section>` : ""}
        ${ageHint ? `<section class="wk-entry-section"><h3>Alder / nivå</h3><p>${esc(ageHint)}</p></section>` : ""}
        <button class="reward-ok" data-close-popup>Lukk</button>
      </article>
    `;

    const popupFn = window.makePopup || (typeof makePopup === "function" ? makePopup : null);
    if (typeof popupFn === "function") {
      popupFn(html, "wonderkammer-entry-popup");
      return;
    }

    window.showToast?.("Popup-systemet er ikke lastet");
  }

  window.openWonderkammerEntry = openEntry;
  window.Wonderkammer = window.Wonderkammer || {};
  window.Wonderkammer.openEntry = openEntry;
})();
