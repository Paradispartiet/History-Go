// ============================================================
// HISTORY GO – POPUP-UTILS (ENDLIG VERISON)
// Bruker KUN filbaner fra JSON: image, imageCard, cardImage
// Ingen fallback, ingen automatikk, ingen _face-filnavn
//
// + OBSERVASJONER:
// - Leser fra hg_learning_log_v1 (type:"observation")
// - Viser siste 10 i person- og steds-popup
// - Trigger Observations fra placeCard via #pcObserve (hvis finnes)
//
// NB: STRICT: ingen normalisering utover trim.
// ============================================================

let currentPopup = null;


// ============================================================
// 0b. RELATIONS → UI (TILKNYTNING) + RUNTIME INDEX
// Formelle relasjoner: jobb, rolle, virke, institusjon
// SOLID: bygger runtime-index (byPlace/byPerson) fra window.RELATIONS
// STRICT: kun trim. Ingen normalisering utover det.
// ============================================================

function _arr(x) { return Array.isArray(x) ? x : []; }
function _s(x) { return String(x ?? "").trim(); }

function getRelationsRaw() {
  return Array.isArray(window.RELATIONS) ? window.RELATIONS : [];
}

/**
 * Runtime index:
 * window.HG_REL_INDEX = {
 *   _srcRef, _srcLen,
 *   byPlace: { [placeId]: [rel, ...] },
 *   byPerson:{ [personId]: [rel, ...] }
 * }
 */
function ensureRelationsIndex() {
  const rels = getRelationsRaw();
  const idx = window.HG_REL_INDEX;

  // Hvis samme array-ref + samme lengde: anta uendret (billig).
  if (idx && idx._srcRef === rels && idx._srcLen === rels.length) return idx;

  const byPlace = Object.create(null);
  const byPerson = Object.create(null);

  // små hjelpere
  const push = (map, key, rel) => {
    if (!key) return;
    (map[key] || (map[key] = [])).push(rel);
  };

  const getPlaceIdFromRel = (r) => {
    const direct = _s(r?.placeId || r?.place_id || r?.place);
    if (direct) return direct;

    const fromT = _s(r?.fromType || r?.from_type);
    const toT   = _s(r?.toType   || r?.to_type);
    const fromI = _s(r?.fromId   || r?.from_id);
    const toI   = _s(r?.toId     || r?.to_id);

    if (fromT === "place" && fromI) return fromI;
    if (toT   === "place" && toI)   return toI;
    return "";
  };

  const getPersonIdFromRel = (r) => {
    const direct = _s(r?.personId || r?.person_id || r?.person);
    if (direct) return direct;

    const fromT = _s(r?.fromType || r?.from_type);
    const toT   = _s(r?.toType   || r?.to_type);
    const fromI = _s(r?.fromId   || r?.from_id);
    const toI   = _s(r?.toId     || r?.to_id);

    if (fromT === "person" && fromI) return fromI;
    if (toT   === "person" && toI)   return toI;
    return "";
  };

  rels.forEach(r => {
    const pid = getPlaceIdFromRel(r);
    const pe  = getPersonIdFromRel(r);
    if (pid) push(byPlace, pid, r);
    if (pe)  push(byPerson, pe, r);
  });

  const out = { _srcRef: rels, _srcLen: rels.length, byPlace, byPerson };
  window.HG_REL_INDEX = out;
  return out;
}

function getRelationsForPlace(placeId) {
  const pid = _s(placeId);
  if (!pid) return [];
  const idx = ensureRelationsIndex();
  return _arr(idx.byPlace[pid]);
}

function getRelationsForPerson(personId) {
  const pid = _s(personId);
  if (!pid) return [];
  const idx = ensureRelationsIndex();
  return _arr(idx.byPerson[pid]);
}

// ============================================================
// RELATIONS → lookup helpers (ID→obj)
// ============================================================

function getPeopleForPlace(placeId) {
  const pid = _s(placeId);
  if (!pid) return [];

  const rels = getRelationsForPlace(pid);

  const ids = rels
    .map(r => {
      const direct = _s(r?.personId || r?.person_id || r?.person);
      if (direct) return direct;

      const fromT = _s(r?.fromType || r?.from_type);
      const toT   = _s(r?.toType   || r?.to_type);
      const fromI = _s(r?.fromId   || r?.from_id);
      const toI   = _s(r?.toId     || r?.to_id);

      if (fromT === "person" && fromI) return fromI;
      if (toT   === "person" && toI)   return toI;
      return "";
    })
    .filter(Boolean);

  const uniq = [...new Set(ids)];
  const peopleArr = Array.isArray(window.PEOPLE) ? window.PEOPLE : (Array.isArray(PEOPLE) ? PEOPLE : []);
  const out = uniq.map(id => peopleArr.find(p => _s(p?.id) === id)).filter(Boolean);

  out.sort((a, b) => _s(a.name).localeCompare(_s(b.name), "no"));
  return out;
}

function getPlacesForPerson(personId) {
  const pid = _s(personId);
  if (!pid) return [];

  const rels = getRelationsForPerson(pid);

  const ids = rels
    .map(r => {
      const direct = _s(r?.placeId || r?.place_id || r?.place);
      if (direct) return direct;

      const fromT = _s(r?.fromType || r?.from_type);
      const toT   = _s(r?.toType   || r?.to_type);
      const fromI = _s(r?.fromId   || r?.from_id);
      const toI   = _s(r?.toId     || r?.to_id);

      if (fromT === "place" && fromI) return fromI;
      if (toT   === "place" && toI)   return toI;
      return "";
    })
    .filter(Boolean);

  const uniq = [...new Set(ids)];
  const placesArr = Array.isArray(window.PLACES) ? window.PLACES : (Array.isArray(PLACES) ? PLACES : []);
  const out = uniq.map(id => placesArr.find(s => _s(s?.id) === id)).filter(Boolean);

  out.sort((a, b) => _s(a.name).localeCompare(_s(b.name), "no"));
  return out;
}

// ============================================================
// RELATIONS → render (TILKNYTNING)
// ============================================================

function findPersonById(id) {
  const pid = _s(id);
  if (!pid) return null;
  const arr = Array.isArray(window.PEOPLE) ? window.PEOPLE : [];
  return arr.find(p => _s(p.id) === pid) || null;
}

function getPersonIdFromSide(r, side /* "from" | "to" */) {
  const t = _s(r?.[side + "Type"] || r?.[side + "_type"]);
  const id = _s(r?.[side + "Id"] || r?.[side + "_id"]);
  return t === "person" ? id : "";
}

function renderRelationRow(r) {
  const type  = _s(r?.type || r?.rel || r?.kind) || "kobling";
  const why   = _s(r?.why || r?.reason || r?.desc || r?.note);
  const src   = _s(r?.source || r?.src);

  // 1) Støtt person↔person edges (slekt/mentor/etc)
  const fromPid = getPersonIdFromSide(r, "from");
  const toPid   = getPersonIdFromSide(r, "to");

  const fromP = fromPid ? findPersonById(fromPid) : null;
  const toP   = toPid ? findPersonById(toPid) : null;

  const mkPersonBtn = (p, fallbackId) => {
    const id = _s(p?.id || fallbackId);
    const name = _s(p?.name) || id;
    return id
      ? `<button class="hg-rel-link" data-person="${hgEscAttr(id)}"><strong>${hgEsc(name)}</strong></button>`
      : `<strong>${hgEsc(name)}</strong>`;
  };

  let head = "";

  // Edge-format hvis begge ender er personer
  if (fromPid && toPid) {
    const left  = mkPersonBtn(fromP, fromPid);
    const right = mkPersonBtn(toP, toPid);
    head = `${left} <span class="hg-muted">—</span> <strong>${hgEsc(type)}</strong> <span class="hg-muted">→</span> ${right}`;
  } else {
    // 2) Fallback: finn én person via personId / from/to
    const pid =
      _s(r?.personId || r?.person_id || r?.person) ||
      fromPid || toPid;

    const person = pid ? findPersonById(pid) : null;
    const label = person ? person.name : _s(r?.label || r?.title || r?.name);

    head = label
      ? `${hgEsc(type)}: ${
          person
            ? `<button class="hg-rel-link" data-person="${hgEscAttr(person.id)}"><strong>${hgEsc(label)}</strong></button>`
            : `<strong>${hgEsc(label)}</strong>`
        }`
      : `<strong>${hgEsc(type)}</strong>`;
  }

  const tail = [
    why ? `<div class="hg-muted" style="margin-top:4px;">${hgEsc(why)}</div>` : "",
    src ? `<div class="hg-muted" style="margin-top:4px;">Kilde: ${hgEsc(src)}</div>` : ""
  ].filter(Boolean).join("");

  return `<li style="margin:8px 0;">${head}${tail}</li>`;
}

function isAutoMigratedRel(r) {
  const id = _s(r?.id);
  if (id.startsWith("mig_")) return true;

  const type = _s(r?.type || r?.rel || r?.kind).toLowerCase();
  const why  = _s(r?.why || r?.reason || r?.desc || r?.note);
  const src  = _s(r?.source || r?.src);
  const label = _s(r?.label || r?.title || r?.name);

  // "tilknytning" uten ekstra info = bare kobling (dupliserer people.json)
  if (type === "tilknytning" && !why && !src && !label) return true;

  return false;
}

function filterCuratedRels(rels) {
  const list = _arr(rels);
  return list.filter(r => !isAutoMigratedRel(r));
}

function buildWonderChamberHtml({ title, rels }) {
  const list = _arr(rels);

  return `
  <div class="hg-section">
    ${title ? `<h3>${title}</h3>` : ``}
      ${
        list.length
          ? `<ul style="margin:0;padding-left:18px;">${list.map(renderRelationRow).join("")}</ul>`
          : `<p class="hg-muted">Ingen relasjoner registrert ennå.</p>`
      }
    </div>
  `;
}

// ✅ behold disse navnene: de brukes allerede i UI (placeCard/personPopup)
function wonderChambersForPlace(place) {
  const rels = getRelationsForPlace(place?.id);

  // ✅ PlaceCard: vis bare "kuraterte" relasjoner (ikke migrert tilknytning)
  const curated = filterCuratedRels(rels);

  return buildWonderChamberHtml({ title: "", rels: curated });
}

function wonderChambersForPerson(person) {
  const rels = getRelationsForPerson(person?.id);
  const curated = filterCuratedRels(rels);
  return buildWonderChamberHtml({ title: "", rels: curated });
}



// ============================================================
// 1. LUKK POPUP
// ============================================================
function closePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
}

// ============================================================
// 2. GENERELL POPUP-GENERATOR
// ============================================================
function makePopup(html, extraClass = "", onClose = null) {
  closePopup();

  const el = document.createElement("div");
  el.className = `hg-popup ${extraClass}`;

  el.innerHTML = `
    <div class="hg-popup-inner">
      <button class="hg-popup-close" data-close-popup>✕</button>
      ${html}
    </div>
  `;

  let _closed = false;

  // klikkbare personer fra Vunderkamre
  el.querySelectorAll("[data-person]").forEach(btn => {
    btn.onclick = () => {
      const pid = String(btn.dataset.person || "").trim();
      const pr = (Array.isArray(window.PEOPLE) ? window.PEOPLE : []).find(x => String(x.id).trim() === pid);
      if (pr) {
        closePopup();
        window.showPersonPopup(pr);
      }
    };
  });
  
  function finishClose() {
    if (_closed) return;
    _closed = true;

    // fjern popup (samme som closePopup, men lokalt)
    if (el && el.parentNode) el.parentNode.removeChild(el);
    if (currentPopup === el) currentPopup = null;

    // kjør callback ETTER at popup faktisk er borte
    if (typeof onClose === "function") {
      try { onClose(); } catch (e) { if (window.DEBUG) console.warn("[makePopup] onClose failed", e); }
    }
  }

  el.addEventListener("click", e => {
    if (e.target.closest("[data-close-popup]")) finishClose();
  });

  el.addEventListener("click", e => {
    if (e.target === el) finishClose();
  });

  document.body.appendChild(el);
  currentPopup = el;
  requestAnimationFrame(() => el.classList.add("visible"));
}

// ------------------------------------------------------------
// 2b. HJELPERE FOR QUIZ / KUNNSKAP / TRIVIA
// ------------------------------------------------------------

// Sjekk om en quiz for person/sted er fullført
function hasCompletedQuiz(targetId) {
  try {
    const hist = JSON.parse(localStorage.getItem("quiz_history") || "[]");
    return hist.some(h => h.id === targetId);
  } catch {
    return false;
  }
}

function getLastQuizCategoryId(targetId) {
  try {
    const hist = JSON.parse(localStorage.getItem("quiz_history") || "[]");
    const last = [...hist].reverse().find(h => String(h.id) === String(targetId));
    return last?.categoryId || null;
  } catch {
    return null;
  }
}

// Hent kunnskapsblokker for en bestemt kategori + mål (person/sted)
// Leser direkte fra localStorage: knowledge_universe
function getInlineKnowledgeFor(categoryId, targetId) {
  if (!categoryId || !targetId) return null;

  let uni;
  try {
    uni = JSON.parse(localStorage.getItem("knowledge_universe") || "{}");
  } catch {
    return null;
  }

  const cat = uni[categoryId];
  if (!cat) return null;

  const out = {};
  const prefix = ("quiz_" + targetId + "_").toLowerCase();

  Object.entries(cat).forEach(([dimension, items]) => {
    if (!Array.isArray(items)) return;

    const filtered = items.filter(k =>
      k.id &&
      typeof k.id === "string" &&
      k.id.toLowerCase().startsWith(prefix)
    );

    if (filtered.length) {
      out[dimension] = filtered;
    }
  });

  return Object.keys(out).length ? out : null;
}

// Hent trivia-liste for en bestemt kategori + mål (person/sted)
// Leser direkte fra localStorage: trivia_universe
function getInlineTriviaFor(categoryId, targetId) {
  if (!categoryId || !targetId) return [];

  let uni;
  try {
    uni = JSON.parse(localStorage.getItem("trivia_universe") || "{}");
  } catch {
    return [];
  }

  const cat = uni[categoryId];
  if (!cat || typeof cat !== "object") return [];

  const list = cat[targetId] || [];
  if (Array.isArray(list)) return list;
  if (typeof list === "string") return [list];
  return [];
}

// ============================================================
// HELPER: Unlock-gate (reell unlock innenfor radius)
// - TEST_MODE: bypass
// - Live: krever getPos() + distMeters()
// ============================================================
function canUnlockPlaceNow(place) {
  const r = Number(place?.r || 150);

  // Testmodus: alltid lov
  if (window.TEST_MODE) {
    return { ok: true, d: null, r };
  }

  const pos = (typeof window.getPos === "function") ? window.getPos() : null;
  if (!pos || typeof window.distMeters !== "function") {
    // Hvis vi ikke har pos/distanse-funksjon: ikke lås opp (reell)
    return { ok: false, d: null, r, reason: "no_pos" };
  }

  const d = window.distMeters(pos, { lat: place.lat, lon: place.lon });
  return { ok: d <= r, d, r };
}

function fmtDist(m) {
  if (m == null || !isFinite(m)) return "";
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

// ------------------------------------------------------------
// 2c. OBSERVASJONER (hg_learning_log_v1)
// ------------------------------------------------------------
function getObservationsForTarget(targetId, targetType) {
  try {
    const log = JSON.parse(localStorage.getItem("hg_learning_log_v1") || "[]");
    if (!Array.isArray(log)) return [];
    const tid = String(targetId || "").trim();
    const ttype = String(targetType || "").trim();

    return log
      .filter(e =>
        e &&
        e.type === "observation" &&
        String(e.targetId || "").trim() === tid &&
        String(e.targetType || "").trim() === ttype
      )
      .sort((a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0));
  } catch {
    return [];
  }
}

function renderObsList(obs) {
  if (!obs || !obs.length) return `<p class="hg-muted">Ingen observasjoner ennå.</p>`;

  return `
    <ul style="margin:0;padding-left:18px;">
      ${obs.slice(0, 10).map(o => {
        const lens = String(o.lens_id || "").trim() || "linse";
        const selected = Array.isArray(o.selected) ? o.selected : [];
        const note = String(o.note || "").trim();
        const when = o.ts ? new Date(o.ts).toLocaleString("no-NO") : "";
        return `
          <li style="margin:6px 0;">
            <strong>${lens}</strong>
            <div class="hg-muted" style="margin-top:2px;">
              ${selected.length ? selected.join(" · ") : "—"}
              ${when ? ` · ${when}` : ""}
            </div>
            ${note ? `<div style="margin-top:4px;">📝 ${note}</div>` : ""}
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

// ============================================================
// 2c. FLORA-POPUP
// ============================================================
window.showFloraPopup = function (flora) {
  if (!flora) return;

  const img =
    flora.imageCard || flora.image || flora.img || "";

  const title = String(flora.name || "").trim() || "Plante";
  const desc  = String(flora.desc || flora.description || "").trim();

  makePopup(
    `
      <div class="hg-flora-popup">
        ${img ? `<img src="${img}" class="hg-flora-img">` : ``}
        <h2 class="hg-popup-name">${title}</h2>
        ${desc ? `<p class="hg-popup-desc">${desc}</p>` : `<p class="hg-muted">Ingen beskrivelse ennå.</p>`}
        <button class="reward-ok" data-close-popup>Lukk</button>
      </div>
    `,
    "flora-popup"
  );
};

// ============================================================
// 3. PERSON-POPUP
// ============================================================
window.showPersonPopup = function(person) {
  if (!person) return;

  const face    = person.image;      // portrett
  const cardImg = person.imageCard;  // kortbilde
  const works   = person.works || [];
  const wiki    = person.wiki || "";
  const kind = String(person.kind || "").trim();
  const kindLabel =
  kind === "ikon" ? "Ikon" :
  kind === "institusjonsbærer" ? "Institusjonsbærer" :
  kind === "kontekst" ? "Kontekst" : "";
  
  const categoryId =
    person.category ||
    (Array.isArray(person.tags) && person.tags.length ? person.tags[0] : null);

  const completed = hasCompletedQuiz(person.id);
  const knowledgeBlocks =
    completed && categoryId ? getInlineKnowledgeFor(categoryId, person.id) : null;
  const triviaList =
    completed && categoryId ? getInlineTriviaFor(categoryId, person.id) : [];

  // Finn steder knyttet til personen
  const placeMatches = getPlacesForPerson(person.id);

  // OBSERVASJONER (person)
  const observations = getObservationsForTarget(person.id, "person");
  const obsHtml = renderObsList(observations);

    // VUNDERKAMRE
  const chambersHtml = (typeof wonderChambersForPerson === "function")
    ? wonderChambersForPerson(person)
    : "";
  
  const html = `
    <img src="${face}" class="hg-popup-face">
    <h2 class="hg-popup-name">${person.name}</h2>
    ${kindLabel ? `<p class="hg-popup-cat">${kindLabel}</p>` : ``}
    <img src="${cardImg}" class="hg-popup-cardimg">

      <div class="hg-section">
        <h3>Verk</h3>
      ${
      works.length
        ? `<ul class="hg-works">${works.map(w => `<li>${w}</li>`).join("")}</ul>`
        : `<p class="hg-muted">Ingen registrerte verk.</p>`
        }
        <button class="hg-quiz-btn" data-quiz="${person.id}">Ta quiz</button>
    </div>


      <div class="hg-section">
        <h3>Om personen</h3>
        <p class="hg-wiki">${wiki}</p>
      </div>
  ${chambersHtml}
      <div class="hg-section">
        <h3>Steder</h3>
        ${
          placeMatches.length
            ? `<div class="hg-places">
                ${placeMatches
                  .map(pl => `<div class="hg-place" data-place="${pl.id}">📍 ${pl.name}</div>`)
                  .join("")}
              </div>`
            : `<p class="hg-muted">Ingen stedstilknytning.</p>`
        }
      </div>

      <!-- Samtale & notat -->
      <div class="hg-section">
        <h3>Samtale & notat</h3>
        <div class="hg-actions-row">
          <button class="hg-ghost-btn" data-chat-person="${person.id}">
            💬 Snakk med ${person.name}
          </button>
          <button class="hg-ghost-btn" data-note-person="${person.id}">
            📝 Notat
          </button>
        </div>
      </div>

      <!-- Observasjoner -->
      <div class="hg-section">
        <h3>Observasjoner</h3>
        ${obsHtml}
      </div>

      ${
        completed && (knowledgeBlocks || triviaList.length)
          ? `
      <div class="hg-section">
        <h3>Kunnskap</h3>
        ${
          knowledgeBlocks
            ? Object.entries(knowledgeBlocks)
                .map(([dim, items]) => `
                  <strong>${dim}</strong>
                  <ul>
                    ${items
                      .map(i => `<li><strong>${i.topic}:</strong> ${i.text || i.knowledge || ""}</li>`)
                      .join("")}
                  </ul>
                `)
                .join("")
            : `<p class="hg-muted">Ingen kunnskap registrert ennå.</p>`
        }
      </div>

      <div class="hg-section">
        <h3>Funfacts</h3>
        ${
          triviaList.length
            ? `<ul>${triviaList.map(t => `<li>${t}</li>`).join("")}</ul>`
            : `<p class="hg-muted">Ingen funfacts ennå.</p>`
        }
      </div>
          `
          : ""
      }
  `;

  makePopup(html, "person-popup");

  currentPopup.querySelectorAll("[data-place]").forEach(btn => {
    btn.onclick = () => {
      const place = PLACES.find(x => x.id === btn.dataset.place);
      closePopup();
      showPlacePopup(place);
    };
  });
};

// ============================================================
// 4. STEDS-POPUP
// ============================================================
window.showPlacePopup = function(place) {
  if (!place) return;

  // RIKTIG: kun stedsbilde
  const img = place.image || "";

  const rels = window.REL_BY_PLACE?.[place.id] || [];

const peopleHere = rels
  .map(r => r.person)
  .filter(Boolean)
  .map(pid => window.PEOPLE.find(p => p.id === pid))
  .filter(Boolean);
  
  const categoryId = place.category || null;
  const completed = hasCompletedQuiz(place.id);
  const knowledgeBlocks =
    completed && categoryId ? getInlineKnowledgeFor(categoryId, place.id) : null;
  const triviaList =
    completed && categoryId ? getInlineTriviaFor(categoryId, place.id) : [];

  // OBSERVASJONER (place)
  const observations = getObservationsForTarget(place.id, "place");
  const obsHtml = renderObsList(observations);
    // VUNDERKAMRE
  const chambersHtml = (typeof wonderChambersForPlace === "function")
    ? wonderChambersForPlace(place)
    : "";
  
  const html = `
      <img src="${img}" class="hg-popup-img">
      <h3 class="hg-popup-title">${place.name}</h3>
      <p class="hg-popup-cat">${place.category || ""}</p>
      <p class="hg-popup-desc">${place.desc || ""}</p>

      <button class="hg-quiz-btn" data-quiz="${place.id}">Ta quiz</button>

      ${chambersHtml}
    
      ${
        peopleHere.length
          ? `<div class="hg-popup-subtitle">Personer</div>
             <div class="hg-popup-people">
               ${peopleHere
                 .map(
                   pr => `
                 <div class="hg-popup-face" data-person="${pr.id}">
                   <img src="${pr.imageCard}">
                 </div>
               `
                 )
                 .join("")}
             </div>`
          : ""
      }

      ${
        completed && (knowledgeBlocks || triviaList.length)
          ? `
      <div class="hg-section">
        <h3>Kunnskap</h3>
        ${
          knowledgeBlocks
            ? Object.entries(knowledgeBlocks)
                .map(
                  ([dim, items]) => `
                  <strong>${dim}</strong>
                  <ul>
                    ${items
                      .map(i => `<li><strong>${i.topic}:</strong> ${i.text}</li>`)
                      .join("")}
                  </ul>
                `
                )
                .join("")
            : `<p class="hg-muted">Ingen kunnskap registrert ennå.</p>`
        }
      </div>

      <div class="hg-section">
        <h3>Funfacts</h3>
        ${
          triviaList.length
            ? `<ul>${triviaList.map(t => `<li>${t}</li>`).join("")}</ul>`
            : `<p class="hg-muted">Ingen funfacts ennå.</p>`
        }
      </div>
          `
          : ""
      }

      <div class="hg-section">
        <h3>Observasjoner</h3>
        ${obsHtml}
      </div>
  `;
  makePopup(html, "place-popup");
};


// ============================================================
// HGNavigator (BY) — 3 dimensjoner: gå / historie / forstå
// Bruker: emner_by.json, emnekart_by.json, fagkart_by_oslo.json, quiz_by.json
// ============================================================
const HGNavigator = (() => {
  const cache = {
    by: {
      loaded: false,
      fagkart: null,
      emnekart: null,
      emner: [],
      quiz: [],
      stories: []   // optional
    }
  };

  async function loadJSON(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${path}`);
    return await r.json();
  }

  async function ensureByLoaded() {
    if (cache.by.loaded) return;

    // tilpass paths til din struktur:
    cache.by.fagkart  = await loadJSON("data/fagkart_by_oslo.json");
    cache.by.emnekart = await loadJSON("data/emnekart_by.json");
    cache.by.emner    = await loadJSON("data/emner_by.json");
    cache.by.quiz     = await loadJSON("data/quiz_by.json");

    // optional: stories (hvis fil finnes)
    try {
      cache.by.stories = await loadJSON("data/stories_by.json");
    } catch {
      cache.by.stories = [];
    }

    cache.by.loaded = true;
  }

  function uniq(arr) { return [...new Set((arr || []).filter(Boolean).map(String))]; }

  // -------------------------
  // 🧭 Romlig neste (sted)
  // -------------------------
  function pickSpatialNext(place, ctx = {}) {
    // “romlig neste” er alltid sted.
    // Vi bruker: nearby (hvis du har) ellers null.
    const nearby = Array.isArray(ctx.nearbyPlaces) ? ctx.nearbyPlaces : [];
    const next = nearby.find(p => p && p.id && String(p.id) !== String(place.id)) || null;

    if (!next) return null;
    return {
      type: "spatial",
      place_id: next.id,
      label: next.name || next.id,
      why: "I nærheten"
    };
  }

  // -------------------------
  // 📖 Narrativ neste (story beat)
  // -------------------------
  function pickNarrativeNext(place, byData) {
    const stories = byData.stories || [];
    if (!stories.length) return null;

    const placeId = String(place.id);

    // Finn story-beat hvor place_id matcher, og ta next_place_id
    for (const st of stories) {
      const beats = Array.isArray(st.beats) ? st.beats : [];
      const beat = beats.find(b => String(b.place_id || "") === placeId);
      if (beat && beat.next_place_id) {
        return {
          type: "narrative",
          story_id: st.id,
          label: st.title || "Fortsett historien",
          next_place_id: String(beat.next_place_id),
          why: "Neste kapittel"
        };
      }
    }
    return null; // ingen story => ikke vis
  }

  // -------------------------
  // 🧠 Begrepsmessig neste (emne fra fagkart)
  // Logikk (uten gjetting):
  // - samle core_concepts fra relevante quiz-spørsmål (personer knyttet til stedet)
  // - match mot emner_by.core_concepts
  // -------------------------
  function pickConceptNext(place, personsHere, byData) {
    const emner = byData.emner || [];
    const quiz  = byData.quiz || [];

    // 1) finn quiz-items for personer her (quiz_by har personId + core_concepts + emne_id)  [oai_citation:5‡quiz_by.json](sediment://file_00000000b6d07243b2aa58bfca7023d1)
    const personIds = new Set((personsHere || []).map(p => String(p.id)));
    const relatedQuiz = quiz.filter(q => q && q.personId && personIds.has(String(q.personId)));

    // 2) samle concepts fra quiz (kurert i data)
    const concepts = uniq(relatedQuiz.flatMap(q => Array.isArray(q.core_concepts) ? q.core_concepts : []));

    if (!concepts.length) return null; // ingen concepts => ikke vis

    // 3) score emner_by på overlap i core_concepts  [oai_citation:6‡emner_by.json](sediment://file_00000000cf3c7243990459177610100e)
    let best = null;
    let bestScore = 0;

    for (const e of emner) {
      const eConcepts = Array.isArray(e.core_concepts) ? e.core_concepts.map(String) : [];
      let overlap = 0;
      for (const c of concepts) if (eConcepts.includes(c)) overlap++;
      if (overlap > bestScore) { bestScore = overlap; best = e; }
    }

    if (!best || bestScore < 2) return null; // terskel: “må faktisk bære resonnement”

    return {
      type: "concept",
      emne_id: best.emne_id,
      label: best.title || "Forstå mer",
      why: `Begreper ×${bestScore}`
    };
  }

  // -------------------------
  // Public API
  // -------------------------
  async function buildForPlace(place, ctx = {}) {
    await ensureByLoaded();

    const byData = cache.by;

    const spatial = pickSpatialNext(place, ctx);

    const narrative = pickNarrativeNext(place, byData);

    const concept = pickConceptNext(place, ctx.personsHere || [], byData);

    return { spatial, narrative, concept };
  }

  return { buildForPlace, ensureByLoaded };
})();



// ============================================================
// 5. PLACE CARD (det store kortpanelet) — REN SAMLET VERSJON
// ============================================================
window.openPlaceCard = async function (place) {
  if (!place) return;

  const card      = document.getElementById("placeCard");
  const imgEl     = document.getElementById("pcImage");
  const titleEl   = document.getElementById("pcTitle");
  const metaEl    = document.getElementById("pcMeta");
  const descEl    = document.getElementById("pcDesc");
  const peopleEl  = document.getElementById("pcPeople");

  const btnInfo   = document.getElementById("pcInfo");
  const btnQuiz   = document.getElementById("pcQuiz");
  const btnUnlock = document.getElementById("pcUnlock");
  const btnRoute  = document.getElementById("pcRoute");
  const btnNote   = document.getElementById("pcNote");
  const btnObs    = document.getElementById("pcObserve");
  const btnClose  = document.getElementById("pcClose");
  
  if (!card) return;

  // Smooth “skifte sted”
  card.classList.add("is-switching");

  // Basic content
  if (imgEl)   imgEl.src = place.image || "";
  if (titleEl) titleEl.textContent = place.name || "";
  if (metaEl)  metaEl.textContent  = `${place.category || ""} • radius ${place.r || 150} m`;
  if (descEl)  descEl.textContent  = place.desc || "";

  // (valgfritt men nyttig): beregn avstand live for NextUp hvis mulig
  try {
    const pos = (typeof window.getPos === "function") ? window.getPos() : null;
    if (pos && typeof window.distMeters === "function" && place.lat != null && place.lon != null) {
      place._d = window.distMeters(pos, { lat: place.lat, lon: place.lon });
    }
  } catch {}

  // --- PERSONER (robust: støtter både PEOPLE og window.PEOPLE) ---
  const PEOPLE_LIST =
    (typeof PEOPLE !== "undefined" && Array.isArray(PEOPLE)) ? PEOPLE :
    (Array.isArray(window.PEOPLE) ? window.PEOPLE : []);

  const persons = getPeopleForPlace(place.id);

  // --- FLORA (place.flora = ["flora_id", ...]) ---
  let FLORA_LIST =
    (typeof FLORA !== "undefined" && Array.isArray(FLORA)) ? FLORA :
    (Array.isArray(window.FLORA) ? window.FLORA : []);

  // Hvis flora ikke er lastet globalt ennå: last fra fil én gang og cache på window.FLORA
  if (!FLORA_LIST.length) {
    try {
      const url = new URL("data/nature/flora.json", document.baseURI).toString();
      const r = await fetch(url, { cache: "no-store" });
      if (r.ok) {
        const arr = await r.json();
        if (Array.isArray(arr)) {
          window.FLORA = arr;
          FLORA_LIST = arr;
        }
      }
    } catch {}
  }

  const floraIds = Array.isArray(place.flora) ? place.flora : [];
  const floraHere = floraIds
    .map(id => FLORA_LIST.find(a => String(a?.id || "").trim() === String(id || "").trim()))
    .filter(Boolean);
  
// --- MiniProfile: send TriNext + Fordi ---
try {
  const completedQuiz = hasCompletedQuiz(place.id);
  const isVisited = !!(window.visited && window.visited[place.id]);
  const cat = place.category || "";

  const because = [];
  if (cat) because.push(cat);
  because.push(completedQuiz ? "quiz fullført" : "quiz ikke tatt");
  because.push(isVisited ? "låst opp" : "ikke låst opp");
  if (persons.length) because.push(`${persons.length} personer her`);
  const becauseLine = because.join(" • ");

  const nearbyPlaces = Array.isArray(window.NEARBY_PLACES) ? window.NEARBY_PLACES : [];

  const tri = (window.HGNavigator && typeof window.HGNavigator.buildForPlace === "function")
    ? await window.HGNavigator.buildForPlace(place, { nearbyPlaces, personsHere: persons })
    : null;

  window.dispatchEvent(new CustomEvent("hg:mpNextUp", {
    detail: { tri, becauseLine }
  }));
} catch (e) {
  console.warn("[mpNextUp]", e);
}

  // VUNDERKAMRE (vises over personlista)
  const chambersHtml = (typeof wonderChambersForPlace === "function")
    ? wonderChambersForPlace(place)
    : "";
  
  // --- Render personer + flora (flora = kun bilder) i placeCard ---
  if (peopleEl) {
    const peopleHtml =
      (chambersHtml || "") +
      persons
        .map(p => `
          <button class="pc-person" data-person="${p.id}">
            <img src="${p.image}" class="pc-person-img" alt="">
            <span>${p.name}</span>
          </button>
        `)
        .join("");

    const floraHtml =
      floraHere.length
        ? `
          <div class="pc-flora-row">
            ${floraHere.map(a => {
              const img = a.imageCard || a.image || a.img || "";
              if (!img) return ""; // kun bilder => ingen img, ingen visning
              return `
                <button class="pc-flora" data-flora="${a.id}" aria-label="${a.name || ""}">
                  <img src="${img}" class="pc-person-img" alt="">
                </button>
              `;
            }).join("")}
          </div>
        `
        : "";

    peopleEl.innerHTML = peopleHtml + floraHtml;

    // people click (som før)
    peopleEl.querySelectorAll("[data-person]").forEach(btn => {
      btn.onclick = () => {
        const pr = PEOPLE_LIST.find(x => x.id === btn.dataset.person);
        if (pr) window.showPersonPopup?.(pr);
      };
    });

    // flora click (åpne infokort)
    peopleEl.querySelectorAll("[data-flora]").forEach(btn => {
      btn.onclick = () => {
        const a = FLORA_LIST.find(x => String(x?.id || "").trim() === String(btn.dataset.flora || "").trim());
        if (a && typeof window.showFloraPopup === "function") window.showFloraPopup(a);
        };
       });
      }

  // --- Mer info ---
  if (btnInfo) btnInfo.onclick = () => window.showPlacePopup?.(place);

  // --- Quiz (ny motor) ---
  if (btnQuiz) {
    btnQuiz.onclick = () => {
      if (window.QuizEngine && typeof window.QuizEngine.start === "function") {
        window.QuizEngine.start(place.id);
      } else {
        window.showToast?.("Quiz-modul ikke lastet");
      }
    };
  }

  // --- Rute ---
  if (btnRoute) {
    btnRoute.onclick = () => {
      if (typeof window.showNavRouteToPlace === "function") return window.showNavRouteToPlace(place);
      if (typeof window.showRouteTo === "function") return window.showRouteTo(place);
      window.showToast?.("Rute-funksjon ikke lastet");
    };
  }

  // --- Notat ---
  if (btnNote && typeof window.handlePlaceNote === "function") {
    btnNote.onclick = () => window.handlePlaceNote(place);
  }

  // --- Observasjon ---
  if (btnObs) {
    btnObs.onclick = () => {
      if (!window.HGObservations || typeof window.HGObservations.start !== "function") {
        window.showToast?.("Observasjoner er ikke lastet");
        return;
      }

      const subjectId = String(place.categoryId || place.category || place.subject_id || "by").trim();

      window.HGObservations.start({
        target: {
          targetId: String(place.id || "").trim(),
          targetType: "place",
          subject_id: subjectId,
          categoryId: subjectId,
          title: place.name
        },
        lensId: "by_byliv"
      });
    };
  }

  // --- UNLOCK GATE: oppdater knapp basert på posisjon (stabil, ingen blinking) ---
  let _unlockTimer = null;
  let _lastUnlockText = null;
  let _lastUnlockDisabled = null;

  function setUnlockUI(disabled, text) {
    if (!btnUnlock) return;

    // Ikke skriv til DOM hvis det ikke endrer seg (hindrer "blink")
    if (_lastUnlockDisabled === disabled && _lastUnlockText === text) return;

    _lastUnlockDisabled = disabled;
    _lastUnlockText = text;

    btnUnlock.disabled = disabled;
    btnUnlock.textContent = text;
  }

  function updateUnlockUI() {
    if (!btnUnlock) return;

    const isUnlocked = !!(window.visited && window.visited[place.id]);

    // 1) Allerede låst opp: alltid stabilt
    if (isUnlocked) {
      setUnlockUI(true, "Låst opp ✅");
      return;
    }

    // 2) TEST_MODE: aldri "gå nærmere" — bare la knappen være aktiv
    if (window.TEST_MODE) {
      setUnlockUI(false, "Lås opp (test)");
      return;
    }

    // 3) Live gate
    const gate = canUnlockPlaceNow(place);

    if (!gate.ok) {
      if (gate.reason === "no_pos") {
        setUnlockUI(true, "Aktiver posisjon");
        return;
      }

      if (gate.d != null) {
        const left = Math.max(0, Math.ceil(gate.d - gate.r));
        setUnlockUI(true, `Gå nærmere (${left} m)`);
        return;
      }

      setUnlockUI(true, "Gå nærmere");
      return;
    }

    // Innenfor radius
    setUnlockUI(false, "Lås opp");
  }

  updateUnlockUI();
  _unlockTimer = window.TEST_MODE ? null : setInterval(updateUnlockUI, 1200);

  // --- Lås opp (REELL: gate-check også i onclick) ---
  if (btnUnlock) {
    btnUnlock.onclick = () => {
      if (window.visited && window.visited[place.id]) {
        window.showToast?.("Allerede låst opp");
        return;
      }

      // Reell sperre (bypass i TEST_MODE)
      const gate = canUnlockPlaceNow(place);
      if (!gate.ok) {
        if (gate.reason === "no_pos") {
          window.showToast?.("Aktiver posisjon for å låse opp");
          return;
        }
        const left = gate.d != null ? Math.max(0, Math.ceil(gate.d - gate.r)) : null;
        window.showToast?.(left != null ? `Gå nærmere: ${left} m igjen` : "Gå nærmere for å låse opp");
        return;
      }

      // visited
      window.visited = window.visited || {};
      window.visited[place.id] = true;
      if (typeof window.saveVisited === "function") window.saveVisited();

      // markers
      if (window.HGMap) {
        window.HGMap.setVisited(window.visited);
        window.HGMap.refreshMarkers();
      } else if (typeof window.drawPlaceMarkers === "function") {
        window.drawPlaceMarkers();
      }

      if (typeof window.pulseMarker === "function") {
        window.pulseMarker(place.lat, place.lon);
      }

      // merits
      const cat = place.category;
      if (cat) {
        window.merits = window.merits || {};
        window.merits[cat] = window.merits[cat] || { points: 0, level: "Nybegynner" };
        window.merits[cat].points++;
        if (typeof window.saveMerits === "function") window.saveMerits();
        if (typeof window.updateMeritLevel === "function") window.updateMeritLevel(cat, window.merits[cat].points);
      }

      window.showToast?.(`Låst opp: ${place.name} ✅`);
      window.dispatchEvent(new Event("updateProfile"));

      // oppdater UI umiddelbart
      updateUnlockUI();
    };
  }

  // --- Stop interval når du lukker kortet ---
  if (btnClose) {
    const prev = btnClose.onclick;
    btnClose.onclick = (e) => {
      if (_unlockTimer) { clearInterval(_unlockTimer); _unlockTimer = null; }
      if (typeof prev === "function") prev.call(btnClose, e);
    };
  }

  
  requestAnimationFrame(() => {
    card.classList.remove("is-switching");
  });

  card.setAttribute("aria-hidden", "false");
};


// ============================================================
// 6. ÅPNE placeCard FRA PERSON (kart-modus)
// ============================================================
window.openPlaceCardByPerson = function(person) {
  if (!person) return;

  const relPlaces = getPlacesForPerson(person.id);
let place = relPlaces.length ? relPlaces[0] : null;

  // Hvis person ikke har et registrert sted → generer et "midlertidig"
  if (!place) {
    place = {
      id: person.id,
      name: person.name,
      category: tagToCat(person.tags || []),
      desc: person.desc || "",
      r: person.r || 150,
      lat: person.lat,
      lon: person.lon,
      cardImage: person.imageCard
    };
  }

  openPlaceCard(place);
};

// ============================================================
// 7. REWARD-POPUPS + KONFETTI
// ============================================================
function launchConfetti() {
  const duration = 900;
  const end = Date.now() + duration;

  (function frame() {
    const timeLeft = end - Date.now();
    if (timeLeft <= 0) return;

    const count = 12;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "confetti-particle";

      const colors = ["#f6c800", "#ff66cc", "#ffb703", "#4caf50", "#c77dff"];
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];

      particle.style.left = Math.random() * 100 + "vw";
      particle.style.animationDuration =
        0.7 + Math.random() * 0.6 + "s";

      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }

    requestAnimationFrame(frame);
  })();
}

window.showRewardPlace = function(place) {
  if (!place) return;

  const BASE = document.querySelector("base")?.href || "";
  const card =
    place.cardImage || place.image || `${BASE}bilder/kort/places/${place.id}.PNG`;

  const categoryId = getLastQuizCategoryId(place.id);
  const knowledgeBlocks =
    categoryId ? getInlineKnowledgeFor(categoryId, place.id) : null;
  const triviaList =
    categoryId ? getInlineTriviaFor(categoryId, place.id) : [];

  makePopup(
    `
      <div class="reward-center">
        <h2 class="reward-title">🎉 Gratulerer!</h2>
        <p class="reward-sub">Du har samlet kortet</p>

        <img id="rewardCardImg" src="${card}" class="reward-card-img">

        ${
          knowledgeBlocks || triviaList.length
            ? `
        <div class="hg-section">
          <h3>Kunnskap</h3>
          ${
            knowledgeBlocks
              ? Object.entries(knowledgeBlocks)
                  .map(([dim, items]) => `
                    <strong>${dim}</strong>
                    <ul>
                      ${items.map(i => `<li><strong>${i.topic}:</strong> ${i.text}</li>`).join("")}
                    </ul>
                  `).join("")
              : `<p class="hg-muted">Ingen kunnskap registrert ennå.</p>`
          }
        </div>

        <div class="hg-section">
          <h3>Funfacts</h3>
          ${
            triviaList.length
              ? `<ul>${triviaList.map(t => `<li>${t}</li>`).join("")}</ul>`
              : `<p class="hg-muted">Ingen funfacts ennå.</p>`
          }
        </div>
            `
            : ""
        }

        <button class="reward-ok" data-close-popup>Fortsett</button>
      </div>
    `,
    "reward-popup",
    () => {
      // ÅPNE NESTE POPUP ETTER "FORTSETT"
      if (typeof window.showPlacePopup === "function") {
        window.showPlacePopup(place);
      }
    }
  );

  launchConfetti();

  requestAnimationFrame(() => {
    const img = document.getElementById("rewardCardImg");
    if (img) img.classList.add("visible");
  });
};

window.showRewardPerson = function(person) {
  if (!person) return;

  const BASE = document.querySelector("base")?.href || "";
  const card =
    person.cardImage || person.image || `${BASE}bilder/kort/people/${person.id}.PNG`;

  const categoryId = getLastQuizCategoryId(person.id);
  const knowledgeBlocks =
    categoryId ? getInlineKnowledgeFor(categoryId, person.id) : null;
  const triviaList =
    categoryId ? getInlineTriviaFor(categoryId, person.id) : [];

  makePopup(
    `
      <div class="reward-center">
        <h2 class="reward-title">🎉 Gratulerer!</h2>
        <p class="reward-sub">Du har samlet kortet</p>

        <img id="rewardCardImg" src="${card}" class="reward-card-img">

        ${
          knowledgeBlocks || triviaList.length
            ? `
        <div class="hg-section">
          <h3>Kunnskap</h3>
          ${
            knowledgeBlocks
              ? Object.entries(knowledgeBlocks)
                  .map(([dim, items]) => `
                    <strong>${dim}</strong>
                    <ul>
                      ${items.map(i => `<li><strong>${i.topic}:</strong> ${i.text}</li>`).join("")}
                    </ul>
                  `).join("")
              : `<p class="hg-muted">Ingen kunnskap registrert ennå.</p>`
          }
        </div>

        <div class="hg-section">
          <h3>Funfacts</h3>
          ${
            triviaList.length
              ? `<ul>${triviaList.map(t => `<li>${t}</li>`).join("")}</ul>`
              : `<p class="hg-muted">Ingen funfacts ennå.</p>`
          }
        </div>
            `
            : ""
        }

        <button class="reward-ok" data-close-popup>Fortsett</button>
      </div>
    `,
    "reward-popup",
    () => {
      // ÅPNE NESTE POPUP ETTER "FORTSETT"
      if (typeof window.showPersonPopup === "function") {
        window.showPersonPopup(person);
      }
    }
  );

  launchConfetti();

  requestAnimationFrame(() => {
    const img = document.getElementById("rewardCardImg");
    if (img) img.classList.add("visible");
  });
};

// ============================================================
// 8. ESC = LUKK
// ============================================================
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && currentPopup) closePopup();
});
