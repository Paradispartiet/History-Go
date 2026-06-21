// ============================================================
// 5. PLACE CARD (det store kortpanelet) — REN SAMLET VERSJON
// ============================================================
/**
 * @typedef {Record<string, unknown>} PlaceCardRecord
 *
 * @typedef {import("../../schemas/place").Place & PlaceCardRecord & {
 *   id?: string,
 *   name?: string,
 *   title?: string,
 *   category?: string,
 *   categoryId?: string,
 *   subcategory?: string,
 *   subcategory_label?: string,
 *   desc?: string,
 *   popupDesc?: string,
 *   image?: string,
 *   frontImage?: string,
 *   cardImage?: string,
 *   quizCardImage?: string,
 *   quizCard?: string,
 *   quiz_card_image?: string,
 *   people?: unknown[],
 *   badges?: unknown[],
 *   relations?: unknown[],
 *   nature?: unknown[],
 *   tags?: string[],
 *   wonderkammer?: unknown[],
 *   rounds?: string[],
 *   rundinger?: string[],
 *   emne_ids?: string[],
 *   quiz_profile?: PlaceCardRecord,
 *   social_profile?: PlaceCardRecord,
 *   sport_profile?: PlaceCardRecord,
 *   lat?: number,
 *   lon?: number,
 *   lng?: number
 * }} PlaceCardPlace
 *
 * @typedef {PlaceCardRecord & {
 *   id?: string,
 *   name?: string,
 *   title?: string,
 *   image?: string,
 *   portrait?: string,
 *   role?: string,
 *   desc?: string,
 *   places?: string[],
 *   placeId?: string,
 *   place_ids?: string[],
 *   categories?: string[],
 *   tags?: string[],
 *   emne_ids?: string[],
 *   badges?: unknown[],
 *   relations?: unknown[],
 *   meta?: PlaceCardRecord
 * }} PlaceCardPerson
 *
 * @typedef {PlaceCardRecord & {
 *   id?: string,
 *   title?: string,
 *   name?: string,
 *   icon?: string,
 *   image?: string,
 *   category?: string,
 *   desc?: string,
 *   sub?: unknown[],
 *   points?: number
 * }} PlaceCardBadge
 *
 * @typedef {PlaceCardRecord & {
 *   id?: string,
 *   type?: string,
 *   title?: string,
 *   label?: string,
 *   target_id?: string,
 *   source_id?: string,
 *   desc?: string
 * }} PlaceCardRelation
 */


function escapePlaceCardHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
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

const PLACE_CARD_NATURE_FALLBACK_PROFILE = Object.freeze({
  title: "Natur",
  summary: "Natursporet for dette stedet er ikke fylt ut ennå.",
  themes: []
});

function normalizePlaceCardStringList(value) {
  return (Array.isArray(value) ? value : [])
    .map(item => String(item ?? "").trim())
    .filter(Boolean);
}

function formatMusicRelation(value) {
  const labels = {
    formed_in: "Dannet på stedet",
    born_in: "Født på stedet",
    based_in: "Basert på stedet",
    recorded_in: "Spilt inn på stedet",
    performed_at: "Opptrådte på stedet",
    through_artist: "Koblet gjennom artist",
    related_to: "Knyttet til dette stedet"
  };
  const key = String(value || "").trim();
  return labels[key] || key.replace(/[_-]+/g, " ").replace(/^\w/, letter => letter.toUpperCase());
}

function formatMusicStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  if (["verified", "approved", "confirmed"].includes(status)) return "Denne koblingen er verifisert.";
  if (["automatic", "auto_matched", "matched"].includes(status)) return "Denne koblingen er automatisk matchet.";
  if (["candidate", "review"].includes(status)) return "Denne koblingen venter på gjennomgang.";
  return status && status !== "unknown" ? `Status: ${status.replace(/[_-]+/g, " ")}.` : "";
}

function renderMusicRelationMeta(item) {
  const confidence = Number.isFinite(item.confidence)
    ? `<span class="pc-music-confidence">${Math.round(item.confidence * 100)} % sikkerhet</span>`
    : "";
  const status = formatMusicStatus(item.status);
  return `
    <div class="pc-music-relation">${escapePlaceCardHTML(formatMusicRelation(item.relationType))}</div>
    ${item.sourceNote ? `<p>${escapePlaceCardHTML(item.sourceNote)}</p>` : ""}
    ${status ? `<p>${escapePlaceCardHTML(status)}</p>` : ""}
    ${confidence}
  `;
}

/**
 * @param {any} obj
 * @param {string} label
 */
function renderMusicUnlockAction(obj, label) {
  if (!obj?.id) return `<p class="pc-music-unlock-text">Foreslått kobling – ikke låsbar ennå.</p>`;
  const unlocked = Boolean(window.HGAhaMusic?.isMusicObjectUnlocked?.(obj.id));
  return `
    <p class="pc-music-unlock-text">${escapePlaceCardHTML(obj.unlockText || "Du har låst opp en musikkoppdagelse.")}</p>
    <button class="pc-music-unlock" type="button" data-music-unlock-id="${escapePlaceCardHTML(obj.id)}" ${unlocked ? "disabled" : ""}>
      ${unlocked ? "Låst opp" : escapePlaceCardHTML(label)}
    </button>
  `;
}

/**
 * @param {any} music
 * @param {string} placeId
 */
function renderPlaceMusic(music, placeId = "") {
  const unlocks = window.HGAhaMusic?.getUnlockableObjectsForPlace?.(placeId) || { artists: [], tracks: [] };
  const artistUnlocksByKey = new Map((unlocks.artists || []).map(obj => [String(obj.artistId || obj.artistName || obj.id), obj]));
  const trackUnlocksByKey = new Map((unlocks.tracks || []).map(obj => [String(obj.trackId || obj.trackTitle || obj.id), obj]));
  const isRejected = (item) => String(item?.status || "").trim().toLowerCase() === "rejected";
  const artists = (music?.artists || []).filter(artist => !isRejected(artist));
  const tracks = (music?.tracks || []).filter(track => !isRejected(track));
  const artistHtml = artists.length ? `
    <section class="pc-music-section">
      <h3>Artister knyttet til stedet</h3>
      ${artists.map(artist => `
        <article class="pc-music-entry">
          <strong>${escapePlaceCardHTML(artist.artistName)}</strong>
          ${renderMusicRelationMeta(artist)}
          ${artist.ahaMusicUrl ? `<a href="${escapePlaceCardHTML(artist.ahaMusicUrl)}" target="_blank" rel="noopener">Åpne i AHA Music</a>` : ""}
          ${renderMusicUnlockAction(artistUnlocksByKey.get(String(artist.artistId || artist.artistName || "")), "Lås opp artist")}
        </article>
      `).join("")}
    </section>
  ` : "";
  const trackHtml = tracks.length ? `
    <section class="pc-music-section">
      <h3>Sanger fra AHA Music</h3>
      ${tracks.map(track => `
        <article class="pc-music-entry">
          <strong>${escapePlaceCardHTML(track.trackTitle)}</strong>
          ${track.artistName ? `<div class="pc-music-artist">${escapePlaceCardHTML(track.artistName)}</div>` : ""}
          ${renderMusicRelationMeta(track)}
          ${track.ahaMusicUrl ? `<a href="${escapePlaceCardHTML(track.ahaMusicUrl)}" target="_blank" rel="noopener">Åpne i AHA Music</a>` : ""}
          ${renderMusicUnlockAction(trackUnlocksByKey.get(String(track.trackId || track.trackTitle || "")), "Lås opp sang")}
        </article>
      `).join("")}
    </section>
  ` : "";
  return (artistHtml || trackHtml) ? `<div class="pc-music-profile">${artistHtml}${trackHtml}</div>` : "";
}

function resolvePlaceCardNameById(placeId) {
  const id = String(placeId || "").trim();
  if (!id) return "";
  const places = Array.isArray(window.PLACES) ? window.PLACES : [];
  const match = places.find(p => String(p?.id || "").trim() === id);
  return String(match?.name || match?.title || id).trim();
}

function normalizePlaceCardNatureProfile(place) {
  const raw = place?.nature_profile && typeof place.nature_profile === "object"
    ? place.nature_profile
    : null;

  if (!raw) {
    return {
      type: "fallback",
      title: PLACE_CARD_NATURE_FALLBACK_PROFILE.title,
      summary: PLACE_CARD_NATURE_FALLBACK_PROFILE.summary,
      themes: [],
      nearby_place_ids: [],
      isFallback: true
    };
  }

  return {
    type: String(raw.type || "").trim(),
    title: String(raw.title || PLACE_CARD_NATURE_FALLBACK_PROFILE.title).trim(),
    summary: String(raw.summary || PLACE_CARD_NATURE_FALLBACK_PROFILE.summary).trim(),
    themes: normalizePlaceCardStringList(raw.themes),
    nearby_place_ids: normalizePlaceCardStringList(raw.nearby_place_ids),
    isFallback: false
  };
}

function renderPlaceCardNatureProfile(place) {
  const profile = normalizePlaceCardNatureProfile(place);
  const themesHtml = profile.themes.length
    ? `
      <div class="pc-nature-profile-themes" aria-label="Naturtemaer">
        ${profile.themes.map(theme => `<span class="pc-badges-chip pc-nature-theme">${escapePlaceCardHTML(theme)}</span>`).join("")}
      </div>
    `
    : "";

  const nearbyHtml = profile.nearby_place_ids.length
    ? `
      <div class="pc-nature-profile-nearby">
        <div class="pc-nature-section-title">Nærnatur</div>
        <div class="pc-badges-chip-list">
          ${profile.nearby_place_ids.map(id => {
            const label = resolvePlaceCardNameById(id) || id;
            return `<span class="pc-badges-chip pc-nature-nearby" data-place-id="${escapePlaceCardHTML(id)}">${escapePlaceCardHTML(label)}</span>`;
          }).join("")}
        </div>
      </div>
    `
    : "";

  return `
    <div class="pc-nature-profile${profile.isFallback ? " pc-nature-profile-fallback" : ""}">
      <h3 class="pc-nature-profile-title">${escapePlaceCardHTML(profile.title)}</h3>
      <p class="pc-nature-profile-summary">${escapePlaceCardHTML(profile.summary)}</p>
      ${themesHtml}
      ${nearbyHtml}
    </div>
  `;
}

window.HGPlaceNatureProfile = {
  fallback: PLACE_CARD_NATURE_FALLBACK_PROFILE,
  normalize: normalizePlaceCardNatureProfile,
  render: renderPlaceCardNatureProfile
};

// ============================================================
// PLACE ROUNDS — kategori-profiler med manuelle overstyringer
// ------------------------------------------------------------
// Registeret under er rundingspoolen. Hver stedskategori velger nøyaktig ni
// rundinger i CATEGORY_ROUND_PROFILES, og `place.rounds`/`place.rundinger`
// brukes bare som manuelle overstyringer ved behov. Output skal alltid være
// et fullt 3x3-grid uten duplikater. Ukjente id-er ignoreres trygt med warn.
// ============================================================

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   fallbackIcon: string,
 *   iconId: string,
 *   listId: string,
 *   kind: string,
 *   aliases?: string[]
 * }} PlaceRoundDef
 */

/** @type {PlaceRoundDef[]} */
const PLACE_ROUND_REGISTRY = [
  { id: "people",       label: "Personer",      fallbackIcon: "👥", iconId: "pcPeopleIcon",          listId: "pcPeopleList",          kind: "people" },
  { id: "nature",       label: "Natur",         fallbackIcon: "🌿", iconId: "pcNatureIcon",          listId: "pcNatureList",          kind: "nature" },
  { id: "badges",       label: "Merker",        fallbackIcon: "🏅", iconId: "pcBadgesIcon",          listId: "pcBadgesList",          kind: "badges" },
  { id: "works",        label: "Verk",          fallbackIcon: "🎭", iconId: "pcWorksIcon",           listId: "pcWorksList",           kind: "works", aliases: ["football", "music"] },
  { id: "civication",   label: "Civication",    fallbackIcon: "🏛", iconId: "pcCivicationStoreIcon", listId: "pcCivicationStoreList", kind: "civication" },
  { id: "brands",       label: "Aktører",       fallbackIcon: "🏷️", iconId: "pcBrandsIcon",          listId: "pcBrandsList",          kind: "brands" },
  { id: "routes",       label: "Ruter",         fallbackIcon: "🧭", iconId: "pcRoutesIcon",          listId: "pcRoutesList",          kind: "routes" },
  { id: "fortellinger", label: "Fortellinger",  fallbackIcon: "📖", iconId: "pcFortellingerIcon",    listId: "pcFortellingerList",    kind: "fortellinger", aliases: ["stories", "story"] },
  { id: "leksikon",     label: "Leksikon",      fallbackIcon: "📚", iconId: "pcLeksikonIcon",        listId: "pcLeksikonList",        kind: "leksikon", aliases: ["lexicon", "wonderkammer"] },
  { id: "play",         label: "Lek",           fallbackIcon: "🛝", iconId: "pcPlayIcon",            listId: "pcPlayList",            kind: "play" },
  { id: "training",     label: "Trening",       fallbackIcon: "🏃", iconId: "pcTrainingIcon",        listId: "pcTrainingList",        kind: "training" },
  { id: "tasks",        label: "Oppgaver",      fallbackIcon: "✅", iconId: "pcTasksIcon",           listId: "pcTasksList",           kind: "tasks" }
];

const CATEGORY_ROUND_PROFILES = Object.freeze({
  by: ["people", "nature", "badges", "works", "civication", "brands", "routes", "fortellinger", "leksikon"],
  historie: ["people", "works", "badges", "routes", "civication", "brands", "tasks", "fortellinger", "leksikon"],
  historisk: ["people", "works", "badges", "routes", "civication", "brands", "tasks", "fortellinger", "leksikon"],
  natur: ["tasks", "nature", "badges", "training", "civication", "brands", "routes", "fortellinger", "leksikon"],
  sport: ["people", "training", "badges", "works", "civication", "brands", "routes", "fortellinger", "leksikon"],
  lekeplass: ["play", "nature", "badges", "tasks", "civication", "brands", "routes", "fortellinger", "leksikon"],
  trening: ["people", "nature", "badges", "training", "civication", "brands", "routes", "tasks", "leksikon"],
  politikk: ["people", "works", "badges", "routes", "civication", "brands", "tasks", "fortellinger", "leksikon"],
  kunst: ["people", "works", "badges", "tasks", "civication", "brands", "routes", "fortellinger", "leksikon"],
  litteratur: ["people", "works", "badges", "tasks", "civication", "brands", "routes", "fortellinger", "leksikon"],
  musikk: ["people", "works", "badges", "tasks", "civication", "brands", "routes", "fortellinger", "leksikon"],
  subkultur: ["people", "works", "badges", "tasks", "civication", "brands", "routes", "fortellinger", "leksikon"],
  naeringsliv: ["people", "works", "badges", "routes", "civication", "brands", "tasks", "fortellinger", "leksikon"],
  transport: ["people", "works", "badges", "routes", "civication", "brands", "tasks", "fortellinger", "leksikon"]
});

const DEFAULT_PLACE_ROUNDS = CATEGORY_ROUND_PROFILES.by.slice();

/** @type {Record<string, PlaceRoundDef>} id (+ alias) → definisjon. */
const PLACE_ROUND_BY_ID = (() => {
  /** @type {Record<string, PlaceRoundDef>} */
  const map = {};
  for (const def of PLACE_ROUND_REGISTRY) {
    map[def.id] = def;
    for (const alias of def.aliases || []) map[alias] = def;
  }
  return map;
})();

/**
 * Returnerer kategoriens faste 3x3-profil, med eventuell manuell
 * `place.rounds`/`rundinger`-overstyring fylt tilbake til nøyaktig ni slots.
 *
 * @param {PlaceCardPlace | PlaceCardRecord | null | undefined} place
 * @returns {PlaceRoundDef[]}
 */
function getPlaceRounds(place) {
  const category = String(place?.category || "by").trim().toLowerCase();
  const profileIds = (CATEGORY_ROUND_PROFILES[category] || DEFAULT_PLACE_ROUNDS).slice(0, 9);
  const declared = Array.isArray(place?.rounds) ? place.rounds :
    Array.isArray(place?.rundinger) ? place.rundinger :
    [];
  const outputIds = profileIds.slice();
  const seenOverrideIds = new Set(outputIds);

  for (const entry of declared) {
    const rawId = String(entry || "").trim();
    if (!rawId) continue;
    const def = PLACE_ROUND_BY_ID[rawId];
    if (!def) {
      console.warn(`[placeCard] Ukjent runding ignorert: "${rawId}" (sted: ${String(place?.id || "ukjent")})`);
      continue;
    }
    if (seenOverrideIds.has(def.id)) continue;

    const replaceIndex = outputIds.findIndex((id) => !declared.some((candidate) => PLACE_ROUND_BY_ID[String(candidate || "").trim()]?.id === id));
    outputIds[replaceIndex >= 0 ? replaceIndex : outputIds.length - 1] = def.id;
    seenOverrideIds.add(def.id);
  }

  const uniqueIds = [];
  for (const id of outputIds) {
    if (PLACE_ROUND_BY_ID[id] && !uniqueIds.includes(id)) uniqueIds.push(id);
  }
  for (const id of profileIds) {
    if (uniqueIds.length >= 9) break;
    if (PLACE_ROUND_BY_ID[id] && !uniqueIds.includes(id)) uniqueIds.push(id);
  }

  return uniqueIds.slice(0, 9).map(id => PLACE_ROUND_BY_ID[id]);
}

/**
 * Viser kategoriens 9 aktive PlaceCard-rundinger i profilrekkefølge.
 * Legacy/ikke-canonical DOM-rundinger skjules dersom de fortsatt finnes i eldre markup.
 *
 * @param {PlaceCardPlace | PlaceCardRecord | null | undefined} place
 * @returns {void}
 */
function applyPlaceRounds(place) {
  const active = getPlaceRounds(place);
  const activeIds = new Set(active.map(def => def.id));
  const canonicalIconIds = new Set(PLACE_ROUND_REGISTRY.map(def => def.iconId));

  for (const def of PLACE_ROUND_REGISTRY) {
    const el = document.getElementById(def.iconId);
    if (!el) continue;
    el.hidden = !activeIds.has(def.id);
    el.style.order = String(active.findIndex(activeDef => activeDef.id === def.id));
  }

  for (const legacyIconId of ["pcWonderkammerIcon", "pcObservationsIcon", "pcFootballIcon", "pcMusicIcon"]) {
    if (canonicalIconIds.has(legacyIconId)) continue;
    const el = document.getElementById(legacyIconId);
    if (!el) continue;
    el.hidden = true;
    el.style.order = "";
  }
}

window.HGPlaceRounds = {
  registry: PLACE_ROUND_REGISTRY,
  profiles: CATEGORY_ROUND_PROFILES,
  defaults: DEFAULT_PLACE_ROUNDS,
  byId: PLACE_ROUND_BY_ID,
  get: getPlaceRounds,
  apply: applyPlaceRounds
};
window.getPlaceRounds = getPlaceRounds;

const PLACE_CARD_QUIZ_CARD_BY_ID = Object.freeze({
  aker_brygge: "bilder/QuizCards/Akerbrygge.PNG",
  barcode: "bilder/QuizCards/Barcode.PNG",
  bispelokket: "bilder/QuizCards/Bispelokket.PNG",
  bjorvika: "bilder/QuizCards/Bjørvika.PNG",
  bogstadveien: "bilder/QuizCards/Bogstadveien.PNG",
  damstredet_telthusbakken: "bilder/QuizCards/DamstredetTelthusbakken.PNG",
  gronland_basarene: "bilder/QuizCards/Grønland basarene.PNG"
});

function normalizePlaceCardQuizKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveQuizCardImage(place) {
  const explicit = [place?.quizCardImage, place?.quizCard, place?.quiz_card_image]
    .map(value => String(value || "").trim())
    .find(Boolean);
  if (explicit) return explicit;

  const keys = new Set([
    normalizePlaceCardQuizKey(place?.id),
    normalizePlaceCardQuizKey(place?.name),
    normalizePlaceCardQuizKey(place?.title)
  ].filter(Boolean));

  if (keys.has("damstredet_og_telthusbakken")) keys.add("damstredet_telthusbakken");
  if (keys.has("damstredet_telthusbakken")) keys.add("damstredet_og_telthusbakken");

  for (const key of keys) {
    if (PLACE_CARD_QUIZ_CARD_BY_ID[key]) return PLACE_CARD_QUIZ_CARD_BY_ID[key];
  }

  return "";
}

function setPlaceCardImgSrcStable(img, src, alt) {
  if (!img) return;

  const next = String(src || "").trim();

  if (alt != null && img.alt !== String(alt)) {
    img.alt = String(alt);
  }

  if (!next) {
    if (img.getAttribute("src")) img.removeAttribute("src");
    return;
  }

  const current = img.getAttribute("src") || "";
  if (current === next) return;

  img.src = next;
}

function bindPlaceCardQuizFlip(card, quizImgEl) {
  if (!card || card.dataset.pcQuizFlipBound === "1") return;
  card.dataset.pcQuizFlipBound = "1";

  const toggle = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (!card.classList.contains("has-quiz-card")) return;
    card.classList.toggle("is-flipped");
    card.setAttribute(
      "aria-label",
      card.classList.contains("is-flipped") ? tUI("ui.place.showFrontImage", "Vis frontbilde") : tUI("ui.attr.showQuizCard", "Vis quizkort")
    );
  };

  card.addEventListener("click", toggle);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") toggle(event);
  });

  if (quizImgEl && quizImgEl.dataset.pcQuizErrorBound !== "1") {
    quizImgEl.dataset.pcQuizErrorBound = "1";
    quizImgEl.addEventListener("error", () => {
      if (String(card.dataset.currentPlaceId || "") !== String(quizImgEl.dataset.placeId || "")) return;
      card.classList.remove("has-quiz-card", "is-flipped");
      card.setAttribute("aria-label", tUI("ui.place.quizCardMissing", "Quizkort mangler"));
      quizImgEl.removeAttribute("src");
    });
  }
}

function setPlaceCardQuizImage(card, quizImgEl, place) {
  if (!card) return;
  card.dataset.currentPlaceId = String(place?.id || "").trim();

  const quizCardImage = resolveQuizCardImage(place);

  if (quizImgEl) {
    quizImgEl.dataset.placeId = String(place?.id || "").trim();
  }

  if (!quizCardImage || !quizImgEl) {
    card.classList.remove("has-quiz-card", "is-flipped");
    card.setAttribute("aria-label", tUI("ui.place.quizCardMissing", "Quizkort mangler"));
    if (quizImgEl) {
      quizImgEl.alt = "";
      if (quizImgEl.getAttribute("src")) quizImgEl.removeAttribute("src");
    }
    return;
  }

  const alt = tfUI("ui.place.quizCardFor", "Quizkort for {place}", { place: place?.name || place?.title || "stedet" });
  setPlaceCardImgSrcStable(quizImgEl, quizCardImage, alt);
  card.classList.add("has-quiz-card");
  card.setAttribute("aria-label", tUI("ui.attr.showQuizCard", "Vis quizkort"));
}

// ------------------------------------------------------------
// Data-renderet quizkort på baksiden av frontImage-flippen
// ------------------------------------------------------------
const PLACE_CARD_QUIZ_CARD_MANIFEST_PATH = "data/quizcards/litteratur/manifest.json";
const PLACE_CARD_QUIZ_CARD_FALLBACK_COLLECTIONS = Object.freeze([
  "litteratur/topp10_lit_kort.json"
]);

let placeCardQuizCollectionsPromise = null;

async function loadPlaceCardQuizCollectionPaths() {
  try {
    const response = await fetch(PLACE_CARD_QUIZ_CARD_MANIFEST_PATH, { cache: "default" });
    if (!response.ok) throw new Error(`Kunne ikke laste quizkort-manifest (${response.status})`);

    const manifest = await response.json();
    const files = Array.isArray(manifest?.collections)
      ? manifest.collections
          .map(file => String(file || "").trim())
          .filter(Boolean)
      : [];

    if (!files.length) throw new Error("Quizkort-manifest mangler collections");

    return files.map(file => `litteratur/${file.replace(/^\/+/, "")}`);
  } catch {
    return [...PLACE_CARD_QUIZ_CARD_FALLBACK_COLLECTIONS];
  }
}

function loadPlaceCardQuizCollections() {
  if (placeCardQuizCollectionsPromise) return placeCardQuizCollectionsPromise;

  const loader = window.DataHub?.loadQuizCardsCollection;
  if (typeof loader !== "function") {
    placeCardQuizCollectionsPromise = Promise.resolve([]);
    return placeCardQuizCollectionsPromise;
  }

  placeCardQuizCollectionsPromise = loadPlaceCardQuizCollectionPaths()
    .then(paths => Promise.all(
      paths.map(path =>
        Promise.resolve(loader(path, { cache: "default" })).catch(() => null)
      )
    ))
    .then(collections => collections.filter(Boolean));

  return placeCardQuizCollectionsPromise;
}

/**
 * @param {PlaceCardPlace | PlaceCardRecord | null | undefined} place
 * @returns {string[]}
 */
function getPlaceCardQuizTargetIds(place) {
  const ids = [];
  const push = (value) => {
    const id = String(value ?? "").trim();
    if (id) ids.push(id);
  };

  push(place?.id);
  push(place?.personId);
  push(place?.targetId);
  const quizProfile = /** @type {any} */ (place?.quiz_profile);
  push(quizProfile?.targetId);
  push(quizProfile?.personId);

  if (Array.isArray(place?.people)) {
    for (const person of place.people) {
      if (person && typeof person === "object") {
        push(person.id);
        push(person.personId);
        push(person.targetId);
      } else {
        push(person);
      }
    }
  }

  return [...new Set(ids)];
}

/**
 * @param {PlaceCardPlace | PlaceCardRecord | null | undefined} place
 * @returns {Promise<PlaceCardRecord | null>}
 */
async function resolvePlaceCardQuizData(place) {
  if (!place) return null;

  const targetIds = new Set(getPlaceCardQuizTargetIds(place));
  if (!targetIds.size) return null;

  let collections;
  try {
    collections = await loadPlaceCardQuizCollections();
  } catch {
    return null;
  }

  for (const collection of collections) {
    const cards = Array.isArray(collection?.cards) ? collection.cards : [];
    for (const card of cards) {
      const cardTarget = String(card?.targetId ?? "").trim();
      if (cardTarget && targetIds.has(cardTarget)) return card;
    }
  }

  return null;
}

/**
 * @param {PlaceCardRecord | null | undefined} cardData
 * @returns {string}
 */
function renderPlaceCardQuizData(cardData) {
  const title = escapePlaceCardHTML(cardData?.title || "Quizkort");
  const subtitle = escapePlaceCardHTML(cardData?.subtitle || "");

  const questions = Array.isArray(cardData?.questions) ? cardData.questions : [];
  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  const questionsHtml = questions.map((q) => {
    const questionText = escapePlaceCardHTML(q?.question || "");
    const options = Array.isArray(q?.options) ? q.options : [];
    const optionsHtml = options.length
      ? `<div class="pc-rendered-quiz-options">${options
          .map((opt, idx) => `${escapePlaceCardHTML(optionLetters[idx] || String(idx + 1))}) ${escapePlaceCardHTML(opt)}`)
          .join(" · ")}</div>`
      : "";
    return `<li>${questionText}${optionsHtml}</li>`;
  }).join("");

  const answerSource = Array.isArray(cardData?.answerKey) && cardData.answerKey.length
    ? cardData.answerKey
    : questions.map((q, idx) => ({ number: q?.number ?? idx + 1, answer: q?.answer }));

  const answerHtml = answerSource
    .map((entry) => `${escapePlaceCardHTML(entry?.number)}. ${escapePlaceCardHTML(entry?.answer)}`)
    .join(" · ");

  return `
    <div class="pc-rendered-quiz-card">
      <div class="pc-rendered-quiz-head">
        <div class="pc-rendered-quiz-kicker">${escapePlaceCardHTML(tUI("ui.place.litteratureQuiz", "Litteraturquiz"))}</div>
        <h3>${title}</h3>
        <p>${subtitle || `${questions.length} spørsmål · fasit nederst`}</p>
      </div>
      <ol class="pc-rendered-quiz-list">
        ${questionsHtml}
      </ol>
      <div class="pc-rendered-quiz-answer-key">
        <strong>Fasit:</strong> ${answerHtml}
      </div>
    </div>
  `;
}

/**
 * @param {HTMLElement | null} card
 * @param {HTMLImageElement | null} quizImgEl
 * @param {HTMLElement | null} quizContentEl
 * @param {PlaceCardPlace | PlaceCardRecord | null | undefined} place
 * @returns {Promise<void>}
 */
async function setPlaceCardQuizBack(card, quizImgEl, quizContentEl, place) {
  if (!card) return;

  let cardData = null;
  try {
    cardData = await resolvePlaceCardQuizData(place);
  } catch {
    cardData = null;
  }

  // Sjekk at vi fortsatt viser samme sted (unngå race ved raske kortbytter)
  const currentPlaceId = String(card.dataset.currentPlaceId || "").trim();
  const requestedPlaceId = String(place?.id || "").trim();
  if (requestedPlaceId && currentPlaceId && requestedPlaceId !== currentPlaceId) return;

  if (cardData) {
    if (quizContentEl) {
      quizContentEl.innerHTML = renderPlaceCardQuizData(cardData);
      quizContentEl.hidden = false;
    }
    if (quizImgEl) {
      quizImgEl.alt = "";
      if (quizImgEl.getAttribute("src")) quizImgEl.removeAttribute("src");
      quizImgEl.style.display = "none";
    }
    card.classList.add("has-quiz-card");
    card.setAttribute("aria-label", tUI("ui.attr.showQuizCard", "Vis quizkort"));
    return;
  }

  // Fallback: eksisterende bildebaserte quizkort
  if (quizContentEl) {
    quizContentEl.innerHTML = "";
    quizContentEl.hidden = true;
  }
  if (quizImgEl) {
    quizImgEl.style.display = "";
  }
  setPlaceCardQuizImage(card, quizImgEl, place);
}

/**
 * @param {PlaceCardPlace | PlaceCardRecord | null | undefined} place
 * @returns {Promise<void>}
 */
window.openPlaceCard = async function (place) {
  console.trace("[placeCard] openPlaceCard", { placeId: place?.id, placeName: place?.name });
  if (!place) return;
  const placeId = String(place.id || "").trim();
  if (placeId && window.DataHub?.loadFullPlace) {
    try {
      const fullPlace = await window.DataHub.loadFullPlace(placeId, { cache: "default" });
      if (fullPlace && typeof fullPlace === "object") {
        place = /** @type {PlaceCardPlace} */ ({ ...place, ...fullPlace });
        const placesArr = Array.isArray(window.PLACES) ? window.PLACES : [];
        const idx = placesArr.findIndex((p) => String(p?.id || "").trim() === placeId);
        if (idx >= 0) placesArr[idx] = place;
      }
    } catch (e) {
      console.warn("[openPlaceCard.loadFullPlace]", e);
    }
  }
  if (!Array.isArray(window.LESESPOR) && window.DataHub?.loadLesespor) {
    try {
      await /** @type {any} */ (window.DataHub.loadLesespor)({ cache: "default" });
    } catch (e) {
      console.warn("[openPlaceCard.loadLesespor]", e);
    }
  }

  const tt = tUI;

  // 🎓 Learning: mark seen for place-emner
   if (window.KnowledgeLearning && Array.isArray(place.emne_ids)) {
    place.emne_ids.forEach(emneId => {
     window.KnowledgeLearning.setSeen(emneId);
    });
   }

const card = document.getElementById("placeCard");
const frontCardFlipEl = document.getElementById("pcFrontCardFlip");
const frontImgEl = /** @type {HTMLImageElement|null} */ (document.getElementById("pcFrontImage"));
const quizCardImgEl = /** @type {HTMLImageElement|null} */ (document.getElementById("pcQuizCardImage"));
const quizCardContentEl = document.getElementById("pcQuizCardContent");
const titleEl    = document.getElementById("pcTitle");
const metaEl     = document.getElementById("pcMeta");
const descEl     = document.getElementById("pcDesc");
const lesesporEl = document.getElementById("pcLesespor");

const peopleIcon          = document.getElementById("pcPeopleIcon");
const fortellingerIcon    = document.getElementById("pcFortellingerIcon");
const wonderkammerIcon    = document.getElementById("pcWonderkammerIcon");
const badgesIcon          = document.getElementById("pcBadgesIcon");
const natureIcon          = document.getElementById("pcNatureIcon");
const playIcon            = document.getElementById("pcPlayIcon");
const trainingIcon        = document.getElementById("pcTrainingIcon");
const routesIcon          = document.getElementById("pcRoutesIcon");
const tasksIcon           = document.getElementById("pcTasksIcon");
const observationsIcon    = document.getElementById("pcObservationsIcon");
const civicationStoreIcon = document.getElementById("pcCivicationStoreIcon");
const brandsIcon          = document.getElementById("pcBrandsIcon");
const leksikonIcon        = document.getElementById("pcLeksikonIcon");
const worksIcon           = document.getElementById("pcWorksIcon");
  
const previousPlaceId = String(card.dataset.currentPlaceId || "").trim();
const nextPlaceId = String(place.id || "").trim();
const samePlace = previousPlaceId && previousPlaceId === nextPlaceId;
card.dataset.currentPlaceId = nextPlaceId;
bindPlaceCardQuizFlip(frontCardFlipEl, quizCardImgEl);
  
const iconsWrap = card ? card.querySelector(".pc-icons-quad") : null;

const peopleEl          = document.getElementById("pcPeopleList");
const fortellingerEl    = document.getElementById("pcFortellingerList");
const wonderkammerEl    = document.getElementById("pcWonderkammerList");
const badgesEl          = document.getElementById("pcBadgesList");
const natureEl          = document.getElementById("pcNatureList");
const playEl            = document.getElementById("pcPlayList");
const trainingEl        = document.getElementById("pcTrainingList");
const routesEl          = document.getElementById("pcRoutesList");
const tasksEl           = document.getElementById("pcTasksList");
const observationsEl    = document.getElementById("pcObservationsList");
const civicationStoreEl = document.getElementById("pcCivicationStoreList");
const brandsEl          = document.getElementById("pcBrandsList");
const leksikonEl        = document.getElementById("pcLeksikonList");
const worksEl           = document.getElementById("pcWorksList");

const eventsBox         = document.getElementById("pcEventsBox");
const addEventBtn       = document.getElementById("pcAddEvent");
  
const btnInfo   = document.getElementById("pcInfo");
const btnQuiz   = document.getElementById("pcQuiz");
const btnUnlock = /** @type {HTMLButtonElement|null} */ (document.getElementById("pcUnlock"));
const btnRoute  = document.getElementById("pcRoute");
const btnNote   = document.getElementById("pcNote");
const btnObs    = document.getElementById("pcObserve");
const btnClose  = document.getElementById("pcClose");

    // ------------------------------------------------------------
  // FIX: Ikke la ikon-klikk boble opp og lukke/kollapse placeCard
  // + Toggle lister uten å påvirke kortet
  // (bindes kun én gang)
  // ------------------------------------------------------------
if (!card.dataset.pcIconsBound) {
  card.dataset.pcIconsBound = "1";

  const closeAllLists = () => {
    peopleEl?.classList.remove("is-open");
    fortellingerEl?.classList.remove("is-open");
    wonderkammerEl?.classList.remove("is-open");
    badgesEl?.classList.remove("is-open");
    natureEl?.classList.remove("is-open");
    playEl?.classList.remove("is-open");
    trainingEl?.classList.remove("is-open");
    routesEl?.classList.remove("is-open");
    tasksEl?.classList.remove("is-open");
    observationsEl?.classList.remove("is-open");
    civicationStoreEl?.classList.remove("is-open");
    brandsEl?.classList.remove("is-open");
    leksikonEl?.classList.remove("is-open");
    worksEl?.classList.remove("is-open");
  };

  const bindRoundPopup = (iconEl, listEl, title, kind) => {
  iconEl?.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    closeAllLists();

    const currentPlaceId = String(card?.dataset?.currentPlaceId || "").trim();
    const currentPlace = /** @type {PlaceCardPlace} */ ((Array.isArray(window.PLACES) ? window.PLACES : []).find(
      p => String(p?.id || "").trim() === currentPlaceId
    ) || place);

    if (kind === "leksikon") {
      if (currentPlaceId && typeof window.HGLeksikon?.openPlace === "function") {
        void window.HGLeksikon.openPlace(currentPlaceId);
      } else {
        window.showToast?.("Leksikon er ikke lastet ennå");
      }
      return;
    }

    // Ruter-rundingen åpner eksisterende rute-funksjonalitet direkte
    // (ikke et generisk popup-kort).
    if (kind === "routes") {
      if (typeof window.showNavRouteToPlace === "function") {
        void window.showNavRouteToPlace(currentPlace || place);
      } else if (typeof window.showRouteTo === "function") {
        window.showRouteTo(currentPlace || place);
      } else if (typeof window.setLeftPanelMode === "function") {
        window.setLeftPanelMode("routes");
        if (typeof window.renderLeftRoutesList === "function") void window.renderLeftRoutesList();
      } else {
        window.showToast?.("Rute-funksjon ikke lastet");
      }
      return;
    }

    const htmlBase = (listEl && listEl.innerHTML && listEl.innerHTML.trim())
      ? listEl.innerHTML
      : `<div class="pc-empty">Ingen innhold ennå</div>`;

    let html = htmlBase;
    if (kind === "badges") {
      const placeBadge = getBadgeForPlace(currentPlace || place || {}, getBadgesSource());
      const mainBadgeLabel = placeBadge?.name || placeBadge?.title || placeBadge?.id
        || String((currentPlace || place)?.category || "Ukjent fagområde");
      const relevantSubcategories = getRelevantBadgeSubcategories(currentPlace || place || {}, placeBadge);
      const subcategoryItems = relevantSubcategories.length
        ? relevantSubcategories.map((subId) => `
            <span class="pc-badges-chip">${formatSubcategoryLabel(subId, placeBadge)}</span>
          `).join("")
        : `<div class="pc-badges-empty">Ingen stedsspesifikke underbadges registrert ennå</div>`;

      const timeInfo = (typeof window.HGTimeResolver?.resolvePlaceTime === "function")
        ? window.HGTimeResolver.resolvePlaceTime(currentPlace || place || {})
        : null;
      const yearText = Number.isFinite(timeInfo?.year) ? String(timeInfo.year) : "Ikke registrert";
      const epokeText = String(timeInfo?.epokeLabel || "").trim() || "Ikke registrert";
      const isZeitgeist = Boolean(timeInfo?.isZeitgeist);

      const emner = await getRelevantPlaceEmner(currentPlace || place || {});
      const emnerItems = emner.length
        ? emner.map((emne) => {
            const label = emne.shortLabel || emne.title || emne.id;
            const definition = emne.definition
              ? `<div class="pc-badges-topic-definition">${emne.definition}</div>`
              : "";
            return `
              <article class="pc-badges-topic">
                <div class="pc-badges-topic-title">${label}</div>
                ${definition}
              </article>
            `;
          }).join("")
        : `<div class="pc-badges-empty">Ingen emner registrert ennå</div>`;

      html = `
        <div class="pc-badges-profile">
          <section class="pc-badges-section">
            <h3 class="pc-badges-section-title">Fagområde</h3>
            <div class="pc-badges-main">${mainBadgeLabel}</div>
            <div class="pc-badges-empty">Stedets faglige hovedkategori</div>
          </section>

          <section class="pc-badges-section">
            <h3 class="pc-badges-section-title">Tid og epoke</h3>
            <div class="pc-badges-time-grid">
              <div><span class="pc-badges-time-label">År</span><span class="pc-badges-time-value">${yearText}</span></div>
              <div><span class="pc-badges-time-label">Epoke</span><span class="pc-badges-time-value">${epokeText}</span></div>
            </div>
            ${isZeitgeist ? `<div class="pc-badges-empty">Zeitgeist: Nåtid / siste epoke</div>` : ""}
          </section>

          <section class="pc-badges-section">
            <h3 class="pc-badges-section-title">Underbadges</h3>
            <div class="pc-badges-chip-list">${subcategoryItems}</div>
          </section>

          <section class="pc-badges-section">
            <h3 class="pc-badges-section-title">Emner</h3>
            <div class="pc-badges-topic-list">${emnerItems}</div>
          </section>
        </div>
      `;
    }

    if (kind === "fortellinger" && currentPlaceId) {
      if (typeof window.HGStories?.openPlace === "function") {
        void window.HGStories.openPlace(currentPlaceId).catch((err) => {
          console.warn("[HGStories.openPlace]", err);
          if (typeof window.showPlaceCardRoundPopup === "function") {
            window.showPlaceCardRoundPopup({
              title,
              subtitle: currentPlace?.name || "",
              html: `<div class="pc-empty">Fortellinger lastes ikke ennå</div>`,
              place: currentPlace,
              kind
            });
          }
        });
        return;
      }

      html = `<div class="pc-empty">Fortellinger lastes ikke ennå</div>`;
    }

    if (kind === "tasks") html = `<div class="pc-empty">Ingen oppgaver ennå</div>`;
    if (kind === "observations") html = `<div class="pc-empty">Ingen observasjoner ennå</div>`;
    if (kind === "works") html = `<div class="pc-empty">Ingen verk eller prestasjoner ennå</div>`;
    if (kind === "nature") html = `<div class="pc-empty">Ingen naturinnhold ennå</div>`;
    if (kind === "play") html = `<div class="pc-empty">Ingen lekeforslag ennå</div>`;
    if (kind === "training") html = `<div class="pc-empty">Ingen treningsinnhold ennå</div>`;

    if (typeof window.showPlaceCardRoundPopup === "function") {
      window.showPlaceCardRoundPopup({
        title,
        subtitle: currentPlace?.name || "",
        html,
        place: currentPlace,
        kind
      });
    }
  });
};

iconsWrap?.addEventListener("click", (e) => {
  e.stopPropagation();
});

bindRoundPopup(peopleIcon, peopleEl, "People", "people");
bindRoundPopup(fortellingerIcon, fortellingerEl, "Fortellinger", "fortellinger");
bindRoundPopup(wonderkammerIcon, wonderkammerEl, "Wonderkammer", "wonderkammer");
bindRoundPopup(badgesIcon, badgesEl, "Badges", "badges");
bindRoundPopup(natureIcon, natureEl, "Natur", "nature");
bindRoundPopup(playIcon, playEl, "Lek", "play");
bindRoundPopup(trainingIcon, trainingEl, "Trening", "training");
bindRoundPopup(routesIcon, routesEl, "Ruter", "routes");
bindRoundPopup(tasksIcon, tasksEl, "Oppgaver", "tasks");
bindRoundPopup(observationsIcon, observationsEl, "Observasjoner", "observations");
bindRoundPopup(civicationStoreIcon, civicationStoreEl, "Civication Store", "civication");
bindRoundPopup(brandsIcon, brandsEl, "Brands", "brands");
bindRoundPopup(leksikonIcon, leksikonEl, "Leksikon", "leksikon");
bindRoundPopup(worksIcon, worksEl, "Verk", "works");

peopleEl?.addEventListener("click", (e) => e.stopPropagation());
fortellingerEl?.addEventListener("click", (e) => e.stopPropagation());
wonderkammerEl?.addEventListener("click", (e) => e.stopPropagation());
badgesEl?.addEventListener("click", (e) => e.stopPropagation());
natureEl?.addEventListener("click", (e) => e.stopPropagation());
playEl?.addEventListener("click", (e) => e.stopPropagation());
trainingEl?.addEventListener("click", (e) => e.stopPropagation());
routesEl?.addEventListener("click", (e) => e.stopPropagation());
tasksEl?.addEventListener("click", (e) => e.stopPropagation());
observationsEl?.addEventListener("click", (e) => e.stopPropagation());
civicationStoreEl?.addEventListener("click", (e) => e.stopPropagation());
brandsEl?.addEventListener("click", (e) => e.stopPropagation());
leksikonEl?.addEventListener("click", (e) => e.stopPropagation());
worksEl?.addEventListener("click", (e) => e.stopPropagation());
}

// --- pc-actions: ikonmodus (kun på smale skjermer) ---
const isNarrow = window.matchMedia && window.matchMedia("(max-width: 520px)").matches;

const setPcIcon = (btn, icon, label) => {
  if (!btn) return;
  btn.textContent = icon;
  btn.setAttribute("aria-label", label);
  btn.title = label;
  btn.classList.add("pc-iconbtn");
};

const setPcText = (btn, text) => {
  if (!btn) return;
  btn.textContent = text;
  btn.setAttribute("aria-label", text);
  btn.title = text;
  btn.classList.remove("pc-iconbtn");
};

/**
 * @param {HTMLElement | null} el
 * @param {string} emoji
 * @param {number | string | null} [count] Tom streng/null skjuler tallet.
 * @returns {void}
 */
const setRoundLabel = (el, emoji, count = 0) => {
  if (!el) return;
  const hasCount = !(count === "" || count == null);
  el.innerHTML = `
    <div class="pc-round-label">
      <span class="pc-round-emoji">${emoji}</span>
      ${hasCount ? `<span class="pc-round-count">${count}</span>` : ""}
    </div>
  `;
};

if (isNarrow) {
  setPcIcon(btnInfo,  "ℹ️", tt("ui.place.moreInfo", "Mer info"));
  setPcText(btnQuiz,  tt("ui.place.takeQuiz", "Ta quiz"));
  setPcText(btnRoute, tt("ui.place.route", "Rute"));
  setPcIcon(btnObs,   "👁️", tt("ui.place.observe", "Observer"));
  setPcIcon(btnNote,  "📝", tt("ui.place.note", "Notat"));
  setPcIcon(btnClose, "✕",  tt("ui.quiz.close", "Lukk"));
} else {
  setPcText(btnInfo,  tt("ui.place.moreInfo", "Mer info"));
  setPcText(btnQuiz,  tt("ui.place.takeQuiz", "Ta quiz"));
  // btnUnlock settes lenger nede av unlock-UI – la den være
  setPcText(btnRoute, tt("ui.place.route", "Rute"));
  setPcText(btnObs,   tt("ui.place.observe", "Observer"));
  setPcText(btnNote,  tt("ui.place.note", "Notat"));
  setPcText(btnClose, tt("ui.quiz.close", "Lukk"));
}

if (btnClose) {
  btnClose.textContent = "";
  btnClose.setAttribute("aria-label", tt("ui.attr.minimize", "Minimer"));
  btnClose.title = tt("ui.attr.minimize", "Minimer");
  btnClose.classList.add("pc-iconbtn");
}

if (!card) return;

  // Smooth “skifte sted”
  if (!samePlace) card.classList.add("is-switching");

  // Basic content
  setPlaceCardImgSrcStable(frontImgEl, place.frontImage || place.cardImage || place.image || "");
  await setPlaceCardQuizBack(frontCardFlipEl, quizCardImgEl, quizCardContentEl, place);
  // ---- MINI PREVIEW BILDE ----
  const miniImgEl = /** @type {HTMLImageElement|null} */ (document.getElementById("pcMiniImg"));
  setPlaceCardImgSrcStable(miniImgEl, frontImgEl?.getAttribute("src") || String(place.image ?? ""));
  
  if (titleEl) titleEl.textContent = String(place.name || "");
  const categoryLabel = (window.CATEGORY_LIST || []).find(c => String(c?.id || "").trim() === String(place.category || "").trim())?.name || place.category || "";
  const sportProfile = /** @type {any} */ ((place?.category === "sport" && place?.sport_profile && typeof place.sport_profile === "object") ? place.sport_profile : null);
  if (metaEl) {
    const metaLines = [categoryLabel];
    if (sportProfile && sportProfile.groundhopper_relevant !== false) {
      const sports = Array.isArray(sportProfile.sports) ? sportProfile.sports.filter(Boolean).slice(0, 3).join(", ") : "";
      const venueKind = String(sportProfile.venue_kind || "").trim();
      const clubs = Array.isArray(sportProfile.clubs_or_teams) ? sportProfile.clubs_or_teams.filter(Boolean).slice(0, 3).join(" / ") : "";
      metaLines.push("Groundhopper-sted");
      if (sports) metaLines.push(`Sport: ${sports}`);
      if (venueKind) metaLines.push(`Type: ${venueKind}`);
      if (clubs) metaLines.push(`Klubb/spor: ${clubs}`);
    }
    const lineNodes = metaLines.map((line) => {
      const row = document.createElement("div");
      row.textContent = String(line || "");
      return row;
    });
    metaEl.replaceChildren(...lineNodes);
  }
  if (descEl)  descEl.textContent  = String(place.desc || "");
  if (lesesporEl) lesesporEl.innerHTML = "";

  // (valgfritt men nyttig): beregn avstand live for NextUp hvis mulig
  try {
    const pos = (typeof window.getPos === "function") ? window.getPos() : null;
    if (pos && typeof window.distMeters === "function") {
      const getTargets = (typeof window.getPlaceDistanceTargets === "function")
        ? window.getPlaceDistanceTargets
        : null;
      const targets = getTargets ? getTargets(place) : [{ lat: place.lat, lon: place.lon }];
      let best = Infinity;
      for (const target of targets) {
        const d = window.distMeters(pos, { lat: target.lat, lon: target.lon });
        if (Number.isFinite(d) && d < best) best = d;
      }
      if (Number.isFinite(best)) place._d = best;
    }
  } catch {}

  // --- PERSONER (robust: støtter både PEOPLE og window.PEOPLE) ---
  const PEOPLE_LIST =
    (typeof PEOPLE !== "undefined" && Array.isArray(PEOPLE)) ? PEOPLE :
    (Array.isArray(window.PEOPLE) ? window.PEOPLE : []);

  const persons = getPeopleForPlace(place.id);
  if (!window.HGAhaMusic?.state?.loaded) await window.HGAhaMusic?.load?.();
  const music = window.HGAhaMusic?.getForPlace?.(place.id);

  const musicUnlockables = window.HGAhaMusic?.getUnlockableObjectsForPlace?.(String(place.id || "")) || { artists: [], tracks: [] };
  const musicCount = (musicUnlockables.artists?.length || 0) + (musicUnlockables.tracks?.length || 0);

  // --- FLORA (place.flora = ["flora_id", ...]) ---
  let FLORA_LIST =
    (typeof FLORA !== "undefined" && Array.isArray(FLORA)) ? FLORA :
    (Array.isArray(window.FLORA) ? window.FLORA : []);

  // Hvis flora ikke er lastet globalt ennå: last via DataHub og cache på window.FLORA
  if (!FLORA_LIST.length && window.DataHub?.loadNature) {
    try {
      await window.DataHub.loadNature();
      if (Array.isArray(window.FLORA)) FLORA_LIST = window.FLORA;
    } catch {}
  }

  const floraIds = Array.isArray(place.flora) ? place.flora : [];
  const floraHere = floraIds
    .map(id => FLORA_LIST.find(a => String(a?.id || "").trim() === String(id || "").trim()))
    .filter(Boolean);
  
// --- MiniProfile: send TriNext + Fordi ---
try {
  const completedQuiz = hasCompletedQuiz(place.id);
  const isVisited = !!(window.visited && window.visited[/** @type {string} */ (place.id)]);
  const cat = place.category || "";

  const because = [];
  if (cat) because.push(cat);
  because.push(completedQuiz ? "quiz fullført" : "quiz ikke tatt");
  because.push(isVisited ? "låst opp" : "ikke låst opp");
  if (persons.length) because.push(tfUI("ui.place.peopleHereCount", "{count} personer her", { count: persons.length }));
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

 
  
  
// --- PEOPLE LIST ---
if (peopleEl) {
  const popupPersons = Array.isArray(persons) ? persons : [];
  const personIdsInList = new Set(popupPersons.map(p => String(p?.id || "").trim()).filter(Boolean));
  const placeId = String(place?.id || "").trim();
  const peopleById = new Map(PEOPLE_LIST.map(p => /** @type {[string, any]} */ ([String(p?.id || "").trim(), p])).filter(([id]) => id));
  const placesList = Array.isArray(window.PLACES) ? window.PLACES : [];
  const placesById = new Map(placesList.map(p => /** @type {[string, any]} */ ([String(p?.id || "").trim(), p])).filter(([id]) => id));

  const placeRels = (typeof getRelationsForPlace === "function") ? getRelationsForPlace(place.id) : [];
  const curatedPlaceRels = (typeof filterCuratedRels === "function") ? filterCuratedRels(placeRels) : placeRels;

  const readableValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value !== "string") return "";
    const txt = value.trim();
    if (!txt) return "";
    const low = txt.toLowerCase();
    if (low === "undefined" || low === "null" || low === "[object object]") return "";
    return txt;
  };

  const prettifyToken = (value) => readableValue(value).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  const relationMetaValue = (r) => [
    r?.description,
    r?.note,
    r?.why,
    r?.type,
    r?.kind,
    r?.category,
    r?.relation
  ].map(prettifyToken).find(Boolean) || "";

  const relationChipValue = (r) => {
    const base = [r?.type, r?.kind, r?.category].map(prettifyToken).find(Boolean);
    return base ? base.toUpperCase() : tt("ui.place.relationFallback", "RELASJON");
  };

  const getRelationDisplayModel = (r) => {
    const fromId = String(r?.fromId || r?.from_id || r?.sourceId || r?.source_id || "").trim();
    const toId = String(r?.toId || r?.to_id || r?.targetId || r?.target_id || "").trim();
    const fromType = String(r?.fromType || r?.from_type || "").trim();
    const toType = String(r?.toType || r?.to_type || "").trim();
    const placeRelId = String(r?.placeId || r?.place_id || r?.place || "").trim();
    const personRelId = String(r?.personId || r?.person_id || r?.person || "").trim();

    const resolveName = (id, typeHint = "") => {
      const t = String(typeHint || "").trim();
      if (!id) return "";
      if (t === "person") return String(peopleById.get(id)?.name || "").trim();
      if (t === "place") return String(placesById.get(id)?.name || "").trim();
      return String(peopleById.get(id)?.name || placesById.get(id)?.name || "").trim();
    };

    let aId = fromId || placeId;
    let bId = toId || personRelId || placeRelId;
    let aName = resolveName(aId, fromType) || (aId === placeId ? String(place?.name || "").trim() : "");
    let bName = resolveName(bId, toType);

    if (!bName && personRelId) bName = resolveName(personRelId, "person");
    if (!bName && placeRelId && placeRelId !== placeId) bName = resolveName(placeRelId, "place");

    const label = [r?.label, r?.title, r?.name].map(readableValue).find(Boolean) || "";
    const placeName = readableValue(place?.name) || "";
    const title = label || ((aName && bName) ? `${aName} ↔ ${bName}` : ((placeName && bName) ? `${placeName} ↔ ${bName}` : ""));
    const meta = relationMetaValue(r);
    const chip = relationChipValue(r);

    const key = String(r?.id || "").trim() || [
      String(r?.fromId || r?.from_id || r?.sourceId || r?.source_id || "").trim(),
      String(r?.toId || r?.to_id || r?.targetId || r?.target_id || "").trim(),
      String(r?.type || r?.relation || r?.kind || "").trim(),
      String(r?.label || r?.title || r?.name || "").trim()
    ].join("|");

    return { key, title, meta, chip };
  };

  const renderRelationCard = (display) => `
    <article class="pc-relation-card">
      <div class="pc-relation-chip">${display.chip}</div>
      <div class="pc-relation-title">${display.title}</div>
      ${display.meta ? `<div class="pc-relation-meta">${display.meta}</div>` : ""}
    </article>
  `;

  const renderRelationCards = () => {
    const relationCards = [];
    const relationSeen = new Set();

    curatedPlaceRels.forEach(r => {
      const display = getRelationDisplayModel(r);
      if (!display.key || relationSeen.has(display.key) || !display.title) return;
      relationSeen.add(display.key);
      relationCards.push(renderRelationCard(display));
    });

    if (!relationCards.length) return "";
    return `
      <section class="pc-relations-section">
        <h4 class="pc-relations-heading">Relasjoner</h4>
        <div class="pc-relations-list">
          ${relationCards.join("")}
        </div>
      </section>
    `;
  };

  const allPeopleRows = [...popupPersons];

  const peopleHtml = allPeopleRows
    .map(p => {
      const personDesc = String(p.popupdesc || p.desc || "").trim();

      return `
        <button class="pc-person" data-person="${p.id}">
          <img src="${p.image}" class="pc-person-img" alt="">
          <div class="pc-person-meta">
            <div class="pc-person-name-row">
              <span class="pc-person-name">${p.name || ""}</span>
              ${p.year ? `<span class="pc-person-year">${p.year}</span>` : ""}
            </div>
            ${personDesc ? `<div class="pc-person-desc">${personDesc}</div>` : ""}
          </div>
        </button>
      `;
    })
    .join("");

  const relationTextHtml = renderRelationCards();

  peopleEl.innerHTML =
    (peopleHtml || relationTextHtml)
      ? `${peopleHtml}${relationTextHtml}`
      : `<div class="pc-empty">Ingen personer ennå</div>`;

  peopleEl.querySelectorAll("[data-person]").forEach((/** @type {HTMLElement} */ btn) => {
    btn.onclick = () => {
      const pr = PEOPLE_LIST.find(x => x.id === btn.dataset.person);
      if (pr) window.showPersonPopup?.(pr);
    };
  });
}

// people icon preview (første person)
if (peopleIcon) {
  const p0 = persons?.[0];
  if (p0?.image) {
    peopleIcon.innerHTML = `<img src="${p0.image}" class="pc-person-img" alt="">`;
  } else {
    setRoundLabel(peopleIcon, "👥", persons.length);
  }
}


// --- WONDERKAMMER LIST (place.wonderkammer + nature_profile + flora) ---
if (wonderkammerEl) {
  const profileHtml = renderPlaceCardNatureProfile(place);
  const floraHtml = floraHere.length
    ? `
      <div class="pc-flora-row">
        ${floraHere.map(a => {
          const img = a.imageCard || a.image || a.img || "";
          if (!img) return "";
          return `
            <button class="pc-flora" data-flora="${escapePlaceCardHTML(a.id)}" aria-label="${escapePlaceCardHTML(a.name || "")}">
              <img src="${escapePlaceCardHTML(img)}" class="pc-person-img" alt="">
            </button>
          `;
        }).join("")}
      </div>
    `
    : "";

  wonderkammerEl.innerHTML = `${profileHtml}${floraHtml}`;

  // flora click (åpne infokort)
  wonderkammerEl.querySelectorAll("[data-flora]").forEach((/** @type {HTMLElement} */ btn) => {
    btn.onclick = () => {
      const a = FLORA_LIST.find(x => String(x?.id || "").trim() === String(btn.dataset.flora || "").trim());
      if (a && typeof window.showFloraPopup === "function") window.showFloraPopup(a);
    };
  });
}

// nature icon preview (første flora med bilde)
if (wonderkammerIcon) {
  const f0 = floraHere.find(a => (a.imageCard || a.image || a.img));
  const img = f0 ? (f0.imageCard || f0.image || f0.img || "") : "";
  if (img) {
    wonderkammerIcon.innerHTML = `<img src="${img}" class="pc-person-img" alt="">`;
  } else {
    setRoundLabel(wonderkammerIcon, "🔎", floraHere.length);
  }
}


/**
 * @param {PlaceCardPlace | PlaceCardRecord | null | undefined} place
 * @param {PlaceCardBadge[] | unknown} badgesSource
 * @returns {PlaceCardBadge | null}
 */
function getBadgeForPlace(place, badgesSource) {
  const badges = Array.isArray(badgesSource)
    ? badgesSource
    : getBadgesSource();

  const categoryId = String(place?.category || "").trim();
  if (!categoryId || !badges.length) return null;

  return badges.find(b => String(b?.id || "").trim() === categoryId) || null;
}

/**
 * @returns {PlaceCardBadge[]}
 */
function getBadgesSource() {
  if (typeof BADGES !== "undefined" && Array.isArray(BADGES)) return BADGES;
  if (Array.isArray(window.BADGES)) return window.BADGES;
  return [];
}

/**
 * @param {unknown} rawValue
 * @returns {string}
 */
function formatSubcategoryLabel(rawValue, placeBadge) {
  const raw = String(rawValue || "").trim();
  if (!raw) return "";
  const normalizedRaw = raw.toLowerCase();
  const groupChildren = Array.isArray(placeBadge?.groups)
    ? placeBadge.groups.flatMap((group) => Array.isArray(group?.children) ? group.children : [])
    : [];
  const childMatch = groupChildren.find((child) => String(child?.id || "").trim().toLowerCase() === normalizedRaw);
  if (childMatch?.name) return String(childMatch.name).trim();
  return raw
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * @param {PlaceCardPlace | PlaceCardRecord | null | undefined} place
 * @param {PlaceCardBadge | null | undefined} placeBadge
 * @returns {string[]}
 */
function getRelevantBadgeSubcategories(place, placeBadge) {
  const groupChildren = Array.isArray(placeBadge?.groups)
    ? placeBadge.groups.flatMap((group) => Array.isArray(group?.children) ? group.children : [])
    : [];
  const badgeSubcategories = groupChildren.length
    ? groupChildren.map((child) => String(child?.id || "").trim()).filter(Boolean)
    : (Array.isArray(placeBadge?.sub) ? placeBadge.sub : []);
  if (!badgeSubcategories.length) return [];

  const normalizeToken = (value) => String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_");

  const badgeSubcategorySet = new Set(
    badgeSubcategories
      .map((sub) => normalizeToken(sub))
      .filter(Boolean)
  );
  if (!badgeSubcategorySet.size) return [];

  const explicitMatches = new Set();
  const appendExplicitToken = (value) => {
    const normalized = normalizeToken(value);
    if (normalized && badgeSubcategorySet.has(normalized)) explicitMatches.add(normalized);
  };

  const extractTokenCandidates = (value) => {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return value.flatMap((item) => extractTokenCandidates(item));
    if (value && typeof value === "object") {
      const record = /** @type {Record<string, unknown>} */ (value);
      const keys = ["id", "slug", "key", "value", "label"];
      for (const key of keys) {
        const tokenValue = record[key];
        if (typeof tokenValue === "string" && tokenValue.trim()) return [tokenValue];
      }
    }
    return [];
  };

  const appendFieldTokens = (values, appendTokenFn) => {
    for (const tokenCandidate of extractTokenCandidates(values)) appendTokenFn(tokenCandidate);
  };

  const explicitFields = [
    place?.underbadge_ids,
    place?.sub_badges,
    place?.subBadges,
    place?.badge_subcategories,
    place?.badgeSubcategories,
    place?.underbadges,
    place?.underBadges,
    place?.merke_sub,
    place?.merkeSub
  ];

  for (const fieldValue of explicitFields) {
    appendFieldTokens(fieldValue, appendExplicitToken);
  }

  const fallbackFields = [
    place?.badges,
    place?.badgeIds,
    place?.merker,
    place?.merkeIds
  ];

  if (!explicitMatches.size) {
    for (const fieldValue of fallbackFields) {
      appendFieldTokens(fieldValue, appendExplicitToken);
    }
  }

  return badgeSubcategories
    .map((sub) => normalizeToken(sub))
    .filter((subId, index, arr) => subId && arr.indexOf(subId) === index && explicitMatches.has(subId));
}

/**
 * @param {PlaceCardPlace | PlaceCardRecord | null | undefined} place
 * @returns {Promise<Array<{id: string, title: string, shortLabel: string, definition: string}>>}
 */
async function getRelevantPlaceEmner(place) {
  const emneIds = Array.isArray(place?.emne_ids)
    ? place.emne_ids.map((id) => String(id || "").trim()).filter(Boolean)
    : [];
  if (!emneIds.length) return [];

  const subjectId = String(place?.category || "").trim();
  const emnerApi = window.Emner;

  if (!subjectId) {
    return emneIds.map((id) => ({ id, title: "", shortLabel: "", definition: "" }));
  }

  let canResolveWithApi = false;
  try {
    if (emnerApi && typeof emnerApi.loadForSubject === "function") {
      await emnerApi.loadForSubject(subjectId);
      canResolveWithApi = typeof emnerApi.getEmne === "function";
    } else if (typeof window.DataHub?.loadEmner === "function") {
      await window.DataHub.loadEmner(subjectId);
      canResolveWithApi = emnerApi && typeof emnerApi.getEmne === "function";
    }
  } catch (err) {
    console.warn("[placeCard.getRelevantPlaceEmner] emne load failed", err);
    canResolveWithApi = false;
  }

  const mapped = await Promise.all(emneIds.map(async (id) => {
    if (!canResolveWithApi) return { id, title: "", shortLabel: "", definition: "" };
    try {
      const emne = await emnerApi.getEmne(id, subjectId);
      if (!emne || typeof emne !== "object") return { id, title: "", shortLabel: "", definition: "" };
      return {
        id,
        title: String(emne.title || "").trim(),
        shortLabel: String(emne.short_label || "").trim(),
        definition: String(emne.definition || "").trim()
      };
    } catch (err) {
      console.warn("[placeCard.getRelevantPlaceEmner] emne resolve failed", { id, err });
      return { id, title: "", shortLabel: "", definition: "" };
    }
  }));

  return mapped;
}

// --- BADGES LIST + BADGES ICON ---
if (badgesEl) {
  const BADGES_LIST = getBadgesSource();

  const rels = (window.REL_BY_PLACE && window.REL_BY_PLACE[/** @type {string} */ (place.id)]) ? window.REL_BY_PLACE[/** @type {string} */ (place.id)] : [];

  let badgeIds = [];

  for (const r of rels) {
    const id =
      r?.badge || r?.badge_id || r?.badgeId ||
      r?.merke || r?.merke_id || r?.merkeId;
    if (id) badgeIds.push(String(id).trim());
  }

  const placeArrays = [
    place.badges, place.badgeIds, place.merker, place.merkeIds
  ];

  for (const arr of placeArrays) {
    if (Array.isArray(arr)) badgeIds.push(...arr.map(x => String(x).trim()));
  }

  const allBadgeIds = new Set(BADGES_LIST.map(b => String(b.id).trim()));
  if (place.category && allBadgeIds.has(String(place.category).trim())) {
    badgeIds.push(String(place.category).trim());
  }

  if (Array.isArray(place.tags)) {
    for (const t of place.tags) {
      const id = String(t).trim();
      if (allBadgeIds.has(id)) badgeIds.push(id);
    }
  }

  badgeIds = [...new Set(badgeIds)];

  const badges = badgeIds
    .map(id => BADGES_LIST.find(b => String(b.id).trim() === String(id).trim()))
    .filter(Boolean);

  const placeBadge = getBadgeForPlace(place, BADGES_LIST);
  const relevantSubcategories = getRelevantBadgeSubcategories(place, placeBadge);

  badgesEl.innerHTML = placeBadge
    ? `
      <div class="pc-badges-main">
        <strong>${placeBadge.name || placeBadge.title || placeBadge.id || "Badge"}</strong>
      </div>
      ${
        relevantSubcategories.length
          ? relevantSubcategories.map(sub => `
            <div class="pc-badges-chip">${formatSubcategoryLabel(sub, placeBadge)}</div>
          `).join("")
          : `<div class="pc-badges-empty">Ingen stedsspesifikke underbadges registrert ennå</div>`
      }
    `
    : `<div class="pc-empty">Badges.json mangler badge for category: ${String(place?.category || "ukjent").trim() || "ukjent"}</div>`;

  if (badgesIcon) {
    const img = placeBadge ? (placeBadge.image || placeBadge.icon || "") : "";
    if (img) {
      const label = placeBadge?.name || placeBadge?.title || placeBadge?.id || "Badge";
      badgesIcon.innerHTML = `<img src="${img}" class="pc-person-img" alt="${label}" title="${label}">`;
    } else {
      const badgeCount = placeBadge ? (1 + relevantSubcategories.length) : 0;
      setRoundLabel(badgesIcon, "🏅", badgeCount);
    }
  }
}

// --- CIVICATION STORE LIST + ICON ---
if (civicationStoreEl) {
  const rawStoreItems = [
    ...(Array.isArray(window.CIVICATION_STORE_BY_PLACE?.[/** @type {string} */ (place.id)]) ? window.CIVICATION_STORE_BY_PLACE[/** @type {string} */ (place.id)] : []),
    ...(Array.isArray(place.civication_store) ? place.civication_store : []),
    ...(Array.isArray(place.civicationStore) ? place.civicationStore : []),
    ...(Array.isArray(place.civication_items) ? place.civication_items : []),
    ...(Array.isArray(place.civicationItems) ? place.civicationItems : []),
    ...(Array.isArray(place.civication_store_items) ? place.civication_store_items : []),
    ...(Array.isArray(place.civicationStoreItems) ? place.civicationStoreItems : [])
  ];

  const seenStore = new Set();
  const storeItems = rawStoreItems
    .map((item, i) => {
      if (typeof item === "string") {
        return {
          id: item,
          label: item,
          image: ""
        };
      }

      return {
        id: String(item?.id ?? item?.slug ?? item?.key ?? `civi_${i}`).trim(),
        label: String(item?.title ?? item?.name ?? item?.label ?? item?.id ?? `Objekt ${i + 1}`).trim(),
        image: String(item?.image ?? item?.icon ?? "").trim(),
        placeSpecificReason: String(item?.placeSpecificReason ?? item?.place_specific_reason ?? "").trim(),
        historicalFunction: String(item?.historicalFunction ?? item?.historical_function ?? "").trim(),
        storePrice: item?.storePrice ?? item?.store_price ?? item?.price ?? "",
        currency: String(item?.currency ?? "").trim(),
        civicationUse: Array.isArray(item?.civicationUse) ? item.civicationUse : Array.isArray(item?.civication_use) ? item.civication_use : []
      };
    })
    .filter(item => item.id && item.label)
    .filter(item => {
      if (seenStore.has(item.id)) return false;
      seenStore.add(item.id);
      return true;
    });

  civicationStoreEl.innerHTML = storeItems.length
    ? storeItems.map(item => {
        const price = String(item.storePrice ?? "").trim();
        const currency = String(item.currency || "").trim();
        const civicationUse = item.civicationUse
          .map(value => String(value || "").trim())
          .filter(Boolean)
          .join(", ");

        return `
          <button class="pc-civi-entry" data-civi-store="${escapePlaceCardHTML(item.id)}">
            ${item.image ? `<img src="${escapePlaceCardHTML(item.image)}" class="pc-person-img" alt="">` : `<span class="pc-civi-emoji">🛒</span>`}
            <span class="pc-civi-entry-title">${escapePlaceCardHTML(item.label)}</span>
            ${item.placeSpecificReason ? `<span class="pc-civi-entry-meta">${escapePlaceCardHTML(item.placeSpecificReason)}</span>` : ""}
            ${item.historicalFunction ? `<span class="pc-civi-entry-meta">${escapePlaceCardHTML(item.historicalFunction)}</span>` : ""}
            ${price ? `<span class="pc-civi-entry-meta">Pris: ${escapePlaceCardHTML(price)}${currency ? ` ${escapePlaceCardHTML(currency)}` : ""}</span>` : ""}
            ${civicationUse ? `<span class="pc-civi-entry-meta">Bruk i Civication: ${escapePlaceCardHTML(civicationUse)}</span>` : ""}
          </button>
        `;
      }).join("")
    : `<div class="pc-empty">Ingen stedsspesifikke store-objekter registrert ennå.</div>`;

  civicationStoreEl.querySelectorAll("[data-civi-store]").forEach((/** @type {HTMLElement} */ btn) => {
    btn.onclick = () => {
      const id = String(btn.dataset.civiStore || "").trim();
      if (!id) return;

      if (window.CivicationStore && typeof window.CivicationStore.openEntry === "function") {
        window.CivicationStore.openEntry(id, place);
      } else if (typeof window.openCivicationStoreEntry === "function") {
        window.openCivicationStoreEntry(id, place);
      } else {
        window.showToast?.("Civication Store-handler ikke lastet");
      }
    };
  });

  setRoundLabel(civicationStoreIcon, "🛒", storeItems.length);
}

// --- BRANDS LIST + BRANDS ICON ---
if (brandsEl) {
  const rawBrands = [
    ...(Array.isArray(window.BRANDS_BY_PLACE?.[/** @type {string} */ (place.id)]) ? window.BRANDS_BY_PLACE[/** @type {string} */ (place.id)] : []),
    ...(Array.isArray(place.brands) ? place.brands : []),
    ...(Array.isArray(place.brand_ids) ? place.brand_ids : [])
  ];

  const brandGroups = [
    { kind: "brand", title: "Merker" },
    { kind: "shop", title: "Shops" },
    { kind: "gallery", title: "Gallerier" },
    { kind: "restaurant", title: "Restauranter / kafeer" },
    { kind: "bar_club", title: "Barer / klubber" },
    { kind: "professional", title: "Profesjon" },
    { kind: "legacy", title: "Historiske brands" },
    { kind: "signage", title: "Skilt / signage" }
  ];
  const knownBrandKinds = new Set(brandGroups.map(group => group.kind));
  const normalizeBrandKind = (value) => {
    const kind = String(value || "").trim();
    return knownBrandKinds.has(kind) ? kind : "brand";
  };

  const seenBrands = new Set();

  const brands = rawBrands
    .map((item, i) => {
      if (typeof item === "string") {
        const resolved = window.HGBrands?.getById?.(item);
        return {
          id: item,
          label: resolved?.name || item,
          logo: resolved?.logo || "",
          brandKind: normalizeBrandKind(resolved?.brand_kind)
        };
      }

      return {
        id: String(item?.id ?? item?.slug ?? `brand_${i}`).trim(),
        label: String(item?.title ?? item?.name ?? item?.label ?? item?.id ?? `Brand ${i + 1}`).trim(),
        logo: String(item?.logo ?? item?.image ?? item?.icon ?? "").trim(),
        brandKind: normalizeBrandKind(item?.brand_kind)
      };
    })
    .filter(item => item.id && item.label)
    .filter(item => {
      if (seenBrands.has(item.id)) return false;
      seenBrands.add(item.id);
      return true;
    });

  const brandGroupsHtml = brandGroups
    .map(group => {
      const groupBrands = brands
        .filter(item => item.brandKind === group.kind)
        .sort((a, b) => a.label.localeCompare(b.label, "no", { sensitivity: "base" }));

      if (!groupBrands.length) return "";

      return `
        <section class="pc-brand-group" data-brand-kind="${group.kind}">
          <h3 class="pc-brand-group-title">${group.title}</h3>
          <div class="pc-brand-group-list">
            ${groupBrands.map(item => `
              <button class="pc-brand-entry" data-brand="${item.id}">
                ${item.logo ? `<img src="${item.logo}" class="pc-person-img" alt="">` : `<span class="pc-brand-emoji">🏷️</span>`}
                <span class="pc-brand-entry-title">${item.label}</span>
              </button>
            `).join("")}
          </div>
        </section>
      `;
    })
    .filter(Boolean)
    .join("");

  brandsEl.innerHTML = brands.length
    ? brandGroupsHtml
    : `<div class="pc-empty">Ingen brands ennå</div>`;

  const b0 = brands.find(b => b.logo);
  if (b0?.logo) {
    brandsIcon.innerHTML = `<img src="${b0.logo}" class="pc-person-img" alt="">`;
  } else {
    setRoundLabel(brandsIcon, "🏷️", brands.length);
  }
}


/**
 * @param {string | number | null | undefined} placeId
 * @returns {Promise<PlaceCardRecord | null>}
 */
async function loadPlaceSocialData(placeId) {
  const id = String(placeId || "").trim();
  if (!id) return null;

  if (!window.__HG_PLACE_SOCIAL_CACHE__) window.__HG_PLACE_SOCIAL_CACHE__ = {};
  if (Object.prototype.hasOwnProperty.call(window.__HG_PLACE_SOCIAL_CACHE__, id)) {
    return window.__HG_PLACE_SOCIAL_CACHE__[id];
  }

  const url = `data/social/place_social/oslo/place_social.json`;
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = Array.isArray(json) ? json : [json].filter(Boolean);
    const out = list.find(item => String(item?.place_id || "").trim() === id) || null;
    window.__HG_PLACE_SOCIAL_CACHE__[id] = out;
    return out;
  } catch (err) {
    console.warn("[social] could not load place_social", err);
    window.__HG_PLACE_SOCIAL_CACHE__[id] = null;
    return null;
  }
}

/**
 * @returns {Promise<PlaceCardRecord[]>}
 */
async function loadCanonicalSocialEvents() {
  if (Array.isArray(window.__HG_CANONICAL_SOCIAL_EVENTS__)) {
    return window.__HG_CANONICAL_SOCIAL_EVENTS__;
  }

  const url = `data/social/events/oslo/canonical_events.json`;
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = Array.isArray(json) ? json : [json].filter(Boolean);
    window.__HG_CANONICAL_SOCIAL_EVENTS__ = list;
    return list;
  } catch (err) {
    console.warn("[social] could not load canonical events", err);
    window.__HG_CANONICAL_SOCIAL_EVENTS__ = [];
    return [];
  }
}

// --- EVENTS BOX (ikke runding) ---
if (eventsBox) {
  const socialData = await loadPlaceSocialData(String(place.id));
  const canonicalEvents = await loadCanonicalSocialEvents();

  const defaultSocialData = {
    place_id: place.id,
    social_enabled: true,
    people_count: 0,
    friends_count: 0,
    active_event_ids: [],
    canonical_event_ids: [],
    social_modes: ["meetup", "message_game", "group_quiz"]
  };

  const social = socialData || defaultSocialData;
  const socialEnabled = social?.social_enabled !== false;

  const head = `
    <div class="pc-events-head">
      <span class="pc-events-title">${tt("ui.static.onSite", "På stedet")}</span>
      <button id="pcAddEvent" class="pc-events-add" type="button" aria-label="${tt("ui.attr.add", "Legg til")}">＋</button>
    </div>
  `;

  const peopleCount = Number(social?.people_count) || 0;
  const friendsCount = Number(social?.friends_count) || 0;
  const canonicalIds = Array.isArray(social?.canonical_event_ids)
    ? social.canonical_event_ids.map(id => String(id || "").trim()).filter(Boolean)
    : [];

  const canonicalForPlace = socialEnabled
    ? canonicalEvents.filter(evt => {
        const evtPlaceId = String(evt?.place_id || "").trim();
        const evtId = String(evt?.id || "").trim();
        const placeMatch = evtPlaceId === String(place.id || "").trim();
        const idMatch = !canonicalIds.length || canonicalIds.includes(evtId);
        return placeMatch && idMatch;
      })
    : [];

  const modes = new Set(
    Array.isArray(social?.social_modes) && social.social_modes.length
      ? social.social_modes
      : defaultSocialData.social_modes
  );

  const modeButtons = [
    modes.has("meetup")
      ? `<button class="pc-events-action" type="button" data-social-action="meetup">${tt("ui.events.meetup", "Avtal å møtes")}</button>`
      : "",
    modes.has("message_game")
      ? `<button class="pc-events-action" type="button" data-social-action="message_game">${tt("ui.events.messageGame", "Start meldingsspill")}</button>`
      : "",
    modes.has("group_quiz")
      ? `<button class="pc-events-action" type="button" data-social-action="group_quiz">${tt("ui.events.groupQuiz", "Ta quiz sammen")}</button>`
      : ""
  ].filter(Boolean).join("");

  const compactStatus = tfUI("ui.events.peopleFriendsHere", "{people} her · {friends} venner", { people: peopleCount, friends: friendsCount });
  const compactEvents = canonicalForPlace.length
    ? tfUI("ui.events.countHere", "{count} ting skjer her", { count: canonicalForPlace.length })
    : tt("ui.events.none", "Ingen hendelser");

  const body = `
    <div class="pc-events-preview-line" title="${escapePlaceCardHTML(compactStatus)}">${escapePlaceCardHTML(compactStatus)}</div>
    <div class="pc-events-preview-line" title="${escapePlaceCardHTML(compactEvents)}">${escapePlaceCardHTML(compactEvents)}</div>
  `;

  eventsBox.innerHTML = head + body;

  const addBtn = document.getElementById("pcAddEvent");
  if (addBtn) {
    addBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const currentPlaceId = String(document.getElementById("placeCard")?.dataset?.currentPlaceId || place.id || "").trim();
      console.log("[social] add/forslag", currentPlaceId);
    };
  }

  eventsBox.onclick = () => {
    const socialPopupHtml = `
      <section class="pc-events-section">
        <div class="pc-event-entry-title">${tt("ui.events.hereNow", "Her nå")}</div>
        <div class="pc-events-row">${tt("ui.events.people", "Personer:")} ${peopleCount}</div>
        <div class="pc-events-row">${tt("ui.events.friends", "Venner:")} ${friendsCount}</div>
      </section>
      <section class="pc-events-section">
        <div class="pc-event-entry-title">${tt("ui.events.happeningHere", "Skjer her")}</div>
        ${canonicalForPlace.length
          ? canonicalForPlace.map(evt => `<div class="pc-events-row">${evt.title || evt.id || "Event"}</div>`).join("")
          : `<div class="pc-events-row">${tt("ui.events.noCanonicalYet", "Ingen kanoniserte hendelser lagt til ennå.")}</div>`
        }
      </section>
      <section class="pc-events-section">
        <div class="pc-event-entry-title">${tt("ui.events.social", "Sosialt")}</div>
        ${modeButtons}
      </section>
    `;

    if (typeof window.showPlaceCardRoundPopup === "function") {
      window.showPlaceCardRoundPopup({
        title: tt("ui.static.onSite", "På stedet"),
        subtitle: place?.name || "",
        html: socialPopupHtml,
        place,
        kind: "events"
      });
    }
  };
}

// --- LEKSIKON LIST + LEKSIKON ICON ---
if (leksikonEl) {
  const leksikonPath = `/leksikon/${String(place.category || "by").trim()}/${String(place.id || "").trim()}.html`;

  leksikonEl.innerHTML = `
    <a class="pc-leksikon-entry" href="${leksikonPath}" target="_blank" rel="noopener">
      <span class="pc-leksikon-entry-title">${tt("ui.place.openLexicon", "Åpne leksikon")}</span>
      <span class="pc-leksikon-entry-meta">${place.name}</span>
    </a>
  `;

  setRoundLabel(leksikonIcon, "📚", 1);
}

// --- WORKS LIST + ICON (verk, musikk og sport/prestasjoner) ---
if (worksEl) {
  const sp = (place?.sport_profile && typeof place.sport_profile === "object")
    ? /** @type {any} */ (place.sport_profile)
    : null;

  const sports = Array.isArray(sp?.sports) ? sp.sports.filter(Boolean) : [];
  const clubs = Array.isArray(sp?.clubs_or_teams) ? sp.clubs_or_teams.filter(Boolean)
    : (Array.isArray(sp?.teams) ? sp.teams.filter(Boolean) : []);
  const venueKind = String(sp?.venue_kind || "").trim();

  const sportRow = (chip, value) => `
    <article class="pc-relation-card">
      <div class="pc-relation-chip">${escapePlaceCardHTML(chip)}</div>
      <div class="pc-relation-title">${escapePlaceCardHTML(value)}</div>
    </article>
  `;

  const footballRows = [
    sports.length ? sportRow("Sport", sports.join(", ")) : "",
    venueKind ? sportRow("Arena", venueKind) : "",
    clubs.length ? sportRow("Klubb / lag", clubs.join(" / ")) : ""
  ].filter(Boolean);

  const musicHtml = music ? renderPlaceMusic(music, String(place.id || "")) : "";
  worksEl.innerHTML = [footballRows.join(""), musicHtml].filter(Boolean).join("")
    || `<div class="pc-empty">Ingen verk eller prestasjoner ennå</div>`;

  const worksCount = musicCount + (clubs.length || sports.length || (sp ? 1 : 0));
  setRoundLabel(worksIcon, "🎭", worksCount || "");

  worksEl.querySelectorAll("[data-music-unlock-id]").forEach((node) => {
    const btn = /** @type {HTMLButtonElement} */ (node);
    btn.onclick = () => {
      const id = btn.getAttribute("data-music-unlock-id") || "";
      const unlocks = window.HGAhaMusic?.getUnlockableObjectsForPlace?.(String(place.id || "")) || { artists: [], tracks: [] };
      const obj = [...(unlocks.artists || []), ...(unlocks.tracks || [])].find(item => item.id === id);
      const result = obj ? window.HGAhaMusic?.unlockMusicObject?.(obj) : null;
      if (result?.ok) {
        btn.textContent = "Låst opp";
        btn.setAttribute("disabled", "");
        const note = document.createElement("div");
        note.className = "pc-music-unlocked-note";
        note.textContent = "Du har låst opp en musikkoppdagelse.";
        btn.insertAdjacentElement("afterend", note);
      }
    };
  });
}

// --- ROUTES LIST + ICON (åpner eksisterende rute-flyt, se bindRoundPopup) ---
if (routesEl) {
  routesEl.innerHTML = `<div class="pc-empty">${tt("ui.routes.openForPlace", "Åpne ruter for dette stedet")}</div>`;
  setRoundLabel(routesIcon, "🧭", "");
}

if (fortellingerEl) {
  fortellingerEl.innerHTML = `<div class="pc-empty">Ingen fortellinger ennå</div>`;
  setRoundLabel(fortellingerIcon, "📖", "");
}
if (tasksEl) {
  tasksEl.innerHTML = `<div class="pc-empty">Ingen oppgaver ennå</div>`;
  setRoundLabel(tasksIcon, "✅", "");
}
if (observationsEl) {
  observationsEl.innerHTML = `<div class="pc-empty">Ingen observasjoner ennå</div>`;
  setRoundLabel(observationsIcon, "📝", "");
}

// Datastyrt visning: vis kun rundingene stedet deklarerer (krav 3, 4, 10).
applyPlaceRounds(place);

  
// --- Mer info ---
  
if (btnInfo) btnInfo.onclick = () => window.showPlacePopup?.(place);

// --- Quiz (ny motor) ---
if (btnQuiz) {
  btnQuiz.onclick = () => {
    const targetId = String(place.id || "").trim();
    if (!targetId) return;

    const next = `#/quiz/${encodeURIComponent(targetId)}`;
    if (window.HGAppRouter?.navigate) {
      window.HGAppRouter.navigate(next);
    } else if (location.hash !== next) {
      location.hash = next;
    }
  };
}

// --- Rute ---
if (btnRoute) {
  btnRoute.onclick = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const wasOpen = Boolean(document.getElementById("pcRouteMenu"));
    if (typeof window.__closePcRouteMenu === "function") {
      window.__closePcRouteMenu();
      if (wasOpen) return;
    }

    const footer = btnRoute.closest(".app-footer") || document.body;
    const menu = document.createElement("div");
    menu.id = "pcRouteMenu";
    menu.className = "pc-route-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", tt("ui.routes.menuLabel", "Rutevalg"));
    menu.innerHTML = `
      <button type="button" role="menuitem" data-route-action="go">${tt("ui.routes.goHere", "Gå Hit")}</button>
      <button type="button" role="menuitem" data-route-action="routes">${tt("ui.tabs.routes", "Ruter")}</button>
    `;

    const placeMenu = () => {
      const footerRect = footer.getBoundingClientRect();
      const btnRect = btnRoute.getBoundingClientRect();
      menu.style.left = `${btnRect.left - footerRect.left + (btnRect.width / 2)}px`;
    };

    menu.addEventListener("click", (menuEvent) => {
      menuEvent.preventDefault();
      menuEvent.stopPropagation();

      const action = /** @type {any} */ (menuEvent.target)?.closest?.("[data-route-action]")?.dataset?.routeAction;
      if (!action) return;

      window.__closePcRouteMenu?.();

      if (action === "go") {
        if (typeof window.showNavRouteToPlace === "function") return window.showNavRouteToPlace(place);
        if (typeof window.showRouteTo === "function") return window.showRouteTo(place);
        window.showToast?.(tt("ui.routes.notLoaded", "Rute-funksjon ikke lastet"));
        return;
      }

      if (action === "routes") {
        const modeSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById("leftPanelMode"));
        if (modeSelect) {
          modeSelect.value = "routes";
          modeSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
        if (typeof window.setLeftPanelMode === "function") window.setLeftPanelMode("routes");
        if (typeof window.renderLeftRoutesList === "function") window.renderLeftRoutesList();
        window.showToast?.(tt("ui.routes.shownInExplorePanel", "Ruter vises i utforsk-panelet"));
      }
    });

    footer.appendChild(menu);
    placeMenu();

    const closeOnOutsideClick = (outsideEvent) => {
      if (menu.contains(outsideEvent.target) || btnRoute.contains(outsideEvent.target)) return;
      window.__closePcRouteMenu?.();
    };

    const closeOnResize = () => window.__closePcRouteMenu?.();

    window.__closePcRouteMenu = () => {
      menu.remove();
      document.removeEventListener("click", closeOnOutsideClick);
      window.removeEventListener("resize", closeOnResize);
      if (window.__closePcRouteMenu) window.__closePcRouteMenu = null;
    };

    document.addEventListener("click", closeOnOutsideClick);
    window.addEventListener("resize", closeOnResize);
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
      window.showToast?.(tt("ui.observations.notLoaded", "Observasjoner er ikke lastet"));
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

// --- UNLOCK GATE ---
let _unlockTimer = null;
let _lastUnlockText = null;
let _lastUnlockDisabled = null;

/**
 * @param {boolean} disabled
 * @param {string} text
 * @returns {void}
 */
function setUnlockUI(disabled, text) {
  if (!btnUnlock) return;
  if (_lastUnlockDisabled === disabled && _lastUnlockText === text) return;
  _lastUnlockDisabled = disabled;
  _lastUnlockText = text;
  btnUnlock.disabled = disabled;
  btnUnlock.textContent = text;
}

/**
 * @returns {void}
 */
function updateUnlockUI() {
  if (!btnUnlock) return;

  const isUnlocked = !!(window.visited && window.visited[/** @type {string} */ (place.id)]);

  if (isUnlocked) {
    setUnlockUI(true, `${tt("ui.unlock.unlocked", "Låst opp")} ✅`);
    return;
  }

  if (window.TEST_MODE) {
    setUnlockUI(false, `${tt("ui.unlock.locked", "Lås opp")} (test)`);
    return;
  }

  const gate = canUnlockPlaceNow(place);

  if (!gate.ok) {
    if (gate.reason === "no_pos") {
      setUnlockUI(true, tt("ui.position.loading", "Henter posisjon…"));
      return;
    }

    if (gate.d != null) {
      const left = Math.max(0, Math.ceil(gate.d - gate.r));
      setUnlockUI(true, tfUI("ui.unlock.goCloserMeters", "Gå nærmere: {meters} m", { meters: left }));
      return;
    }

    setUnlockUI(true, tt("ui.unlock.goCloser", "Gå nærmere"));
    return;
  }

  setUnlockUI(false, tt("ui.unlock.locked", "Lås opp"));
}

updateUnlockUI();
_unlockTimer = window.TEST_MODE ? null : setInterval(updateUnlockUI, 1200);

if (btnUnlock) {
  btnUnlock.onclick = () => {
    if (window.visited && window.visited[/** @type {string} */ (place.id)]) {
      window.showToast?.(tt("ui.unlock.alreadyUnlocked", "Allerede låst opp"));
      return;
    }

    const gate = canUnlockPlaceNow(place);
    if (!gate.ok) {
      if (gate.reason === "no_pos") {
        window.showToast?.(`${tt("ui.position.loading", "Henter posisjon…")} (${tt("ui.place.unlock", "Lås opp")})`);
        return;
      }
      const left = gate.d != null ? Math.max(0, Math.ceil(gate.d - gate.r)) : null;
      window.showToast?.(left != null ? tfUI("ui.unlock.goCloserMeters", "Gå nærmere: {meters} m", { meters: left }) : `${tt("ui.unlock.goCloser", "Gå nærmere")} (${tt("ui.place.unlock", "Lås opp")})`);
      return;
    }

    const isGroundhopperRelevant = typeof window.HG_isGroundhopperPlace === "function"
      ? !!window.HG_isGroundhopperPlace(/** @type {any} */ (place))
      : !!(place?.category === "sport" && /** @type {any} */ (place?.sport_profile)?.groundhopper_relevant !== false);

    if (typeof window.saveVisitedFromQuiz === "function") {
      window.saveVisitedFromQuiz(String(place.id));
    } else {
      window.visited = window.visited || {};
      window.visited[/** @type {string} */ (place.id)] = true;
      if (typeof window.HG_updateGroundhopperFromPlace === "function") {
        window.HG_updateGroundhopperFromPlace(/** @type {any} */ (place));
      }
      if (typeof window.saveVisited === "function") window.saveVisited();
    }

    if (window.HGMap) {
      window.HGMap.setVisited(window.visited);
      window.HGMap.refreshMarkers();
    } else if (typeof window.drawPlaceMarkers === "function") {
      window.drawPlaceMarkers();
    }

    if (typeof window.pulseMarker === "function") {
      window.pulseMarker(place.lat, place.lon);
    }

    const badgeId = String(place.badgeId || place.categoryId || "").trim();
    if (badgeId) {
      window.merits = window.merits || {};
      window.merits[badgeId] = window.merits[badgeId] || { points: 0 };
      /** @type {any} */ (window.merits[badgeId]).points++;
      if (typeof window.saveMerits === "function") window.saveMerits();
      if (typeof window.updateMeritLevel === "function") {
        window.updateMeritLevel(badgeId, /** @type {any} */ (window.merits[badgeId]).points);
      }
    }

    window.showToast?.(`Låst opp: ${place.name} ✅`);
    if (isGroundhopperRelevant) {
      window.showToast?.("Groundhopper: sted registrert");
    }
    updateUnlockUI();
  };
}

if (btnClose) {
  const prev = btnClose.onclick;

  btnClose.onclick = (e) => {
    if (_unlockTimer) {
      clearInterval(_unlockTimer);
      _unlockTimer = null;
    }

    if (typeof window.collapsePlaceCard === "function") {
      window.collapsePlaceCard();
      return;
    }

    if (typeof prev === "function") prev.call(btnClose, e);
  };
}

requestAnimationFrame(() => {
  card.classList.remove("is-switching");
});

card.setAttribute("aria-hidden", "false");
expandPlaceCard();
};

// ============================================================
// PLACE CARD – bottom sheet bridge (engine-controlled)
// ============================================================

/**
 * @param {boolean} on
 * @returns {void}
 */
function setPlaceCardMiniVisible(on){
  const mini = document.getElementById("pcMini");
  if (!mini) return;
  mini.style.display = on ? "block" : "none";
  mini.setAttribute("aria-hidden", on ? "false" : "true");
}

/**
 * @returns {HTMLElement | null}
 */
function getPlaceCardEl() {
  return hg$("placeCard");
}

/**
 * @returns {boolean}
 */
function isPlaceCardCollapsed() {
  return !!getPlaceCardEl()?.classList.contains("is-collapsed");
}

/**
 * @returns {void}
 */
function requestMapResize() {}

/**
 * @returns {void}
 */
function collapsePlaceCard() {
  const pc = getPlaceCardEl();
  if (!pc) return;

  // Kompatibilitet: behold flagg + body-hook (hvis andre steder bruker det)
  pc.classList.add("is-collapsed");
  document.body.classList.add("pc-collapsed");

  if (window.LayerManager) {
  LayerManager.setMode(LayerManager.getMode());
}

  try { localStorage.setItem("hg_placecard_collapsed_v1", "1"); } catch {}

  setPlaceCardMiniVisible(true);

 if (window.bottomSheetController?.hide) {
  window.bottomSheetController.hide();
} else if (window.bottomSheetController?.setState) {
  window.bottomSheetController.setState("hidden");
 }
}

/**
 * @returns {void}
 */
function expandPlaceCard() {
  const pc = getPlaceCardEl();
  if (!pc) return;

  pc.classList.remove("is-collapsed");
  document.body.classList.remove("pc-collapsed");

  if (window.LayerManager) {
  LayerManager.setMode(LayerManager.getMode());
}

  try { localStorage.setItem("hg_placecard_collapsed_v1", "0"); } catch {}

  setPlaceCardMiniVisible(false);

  if (window.bottomSheetController?.open) {
  window.bottomSheetController.open();
} else if (window.bottomSheetController?.setState) {
  window.bottomSheetController.setState("open"); // fallback
 }
}

/**
 * @returns {void}
 */
function togglePlaceCard() {
  isPlaceCardCollapsed() ? expandPlaceCard() : collapsePlaceCard();
}

/**
 * @returns {void}
 */
function initPlaceCardCollapse() {
  const pc = getPlaceCardEl();
  if (!pc) return;

  const currentPlaceId = String(pc.dataset.currentPlaceId || "").trim();

  if (!currentPlaceId) {
    if (window.bottomSheetController?.hide) {
      window.bottomSheetController.hide();
    } else {
      pc.classList.remove("is-open", "is-collapsed");
      pc.classList.add("is-hidden");
      pc.setAttribute("aria-hidden", "true");
    }
    setPlaceCardMiniVisible(false);
  } else {
    let collapsed = false;
    try {
      collapsed = (localStorage.getItem("hg_placecard_collapsed_v1") === "1");
    } catch {}

    if (collapsed) collapsePlaceCard();
    else expandPlaceCard();
  }

  if (pc.dataset.pcCollapseBound === "1") return;
  pc.dataset.pcCollapseBound = "1";

  const btn = document.getElementById("pcCollapseBtn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePlaceCard();
    });
  }

  const expandBtn = document.getElementById("pcExpandBtn");
  if (expandBtn) {
    expandBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      expandPlaceCard();
    });
  }

  const mini = document.getElementById("pcMini");
  if (mini) {
    mini.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      expandPlaceCard();
    });
  }
}

window.initPlaceCardCollapse = initPlaceCardCollapse;
window.collapsePlaceCard = collapsePlaceCard;
window.expandPlaceCard = expandPlaceCard;
window.togglePlaceCard = togglePlaceCard;
window.isPlaceCardCollapsed = isPlaceCardCollapsed;

window.addEventListener("hg:langchange", () => {
  const card = document.getElementById("placeCard");
  const placeId = String(card?.dataset?.currentPlaceId || "").trim();
  if (!placeId || !Array.isArray(window.PLACES)) return;
  const place = window.PLACES.find((p) => String(p?.id || "").trim() === placeId);
  if (place && typeof window.openPlaceCard === "function") {
    window.openPlaceCard(place);
  }
});
