// @ts-nocheck
// Compact PlaceCard for canonical Places with placeTier: "micro".
(function installMicroPlaceCard(global) {
  "use strict";

  const ICON = Object.freeze({
    book:'<path d="M5 5.5c2.5-.8 4.7-.4 7 1.1v12c-2.3-1.5-4.5-1.9-7-1.1z"/><path d="M19 5.5c-2.5-.8-4.7-.4-7 1.1v12c2.3-1.5 4.5-1.9 7-1.1z"/>',
    circular:'<path d="M6.2 8.4A6.8 6.8 0 0 1 18 7l1.6 2.2"/><path d="m19.7 5.6-.1 3.7-3.7-.1"/><path d="M17.8 15.6A6.8 6.8 0 0 1 6 17l-1.6-2.2"/><path d="m4.3 18.4.1-3.7 3.7.1"/>',
    leaf:'<path d="M19.5 4.5C12 4.7 6.6 7.8 6.2 13.2c-.2 2.7 1.7 5 4.5 5.1 5.4.2 8.5-5.6 8.8-13.8Z"/><path d="M5 20c2.1-4.1 5.1-7.3 9.4-9.5"/>',
    plaque:'<rect x="5" y="4.5" width="14" height="15" rx="2"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4"/>',
    stone:'<path d="M7.2 5.2 12 3.8l4.8 1.4 1.4 4.8-1.4 8.8-4.8 1.4-4.8-1.4L5.8 10z"/><path d="M9 9h6M9 12h6M9 15h4"/>',
    pin:'<path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/>'
  });
  const KIND = Object.freeze({
    lesekiosk: { icon:ICON.book, label:"Lesekiosk" },
    bokskap: { icon:ICON.book, label:"Bokskap" },
    gjenvinningsstasjon: { icon:ICON.circular, label:"Gjenvinningsstasjon" },
    ombrukspunkt: { icon:ICON.circular, label:"Ombrukspunkt" },
    miljostasjon: { icon:ICON.leaf, label:"Miljøstasjon" },
    minneskilt: { icon:ICON.plaque, label:"Minneskilt" },
    snublestein: { icon:ICON.stone, label:"Snublestein" },
    annet_dokumentert_mikrosted: { icon:ICON.pin, label:"Mikrosted" }
  });
  const STATUS = Object.freeze({
    active:"Aktiv",
    temporary_unavailable:"Midlertidig stengt",
    historic:"Historisk"
  });
  let scheduled = false;

  const text = value => String(value == null ? "" : value).trim();
  const esc = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");

  function isMicro(place) {
    return text(place?.placeTier).toLowerCase() === "micro"
      && text(place?.micro_place_profile?.schema) === "history_go_micro_place_profile_v1";
  }

  function ensureStylesheet() {
    const href = "css/micro-place-card.css";
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function ensurePanel() {
    const grid = document.querySelector("#placeCard .pc-grid");
    if (!grid) return null;
    let panel = document.getElementById("pcMicroIdentity");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "pcMicroIdentity";
      panel.className = "pc-micro-identity";
      panel.hidden = true;
      panel.setAttribute("aria-live", "polite");
      grid.appendChild(panel);
    }
    return panel;
  }

  function humanize(value) {
    const cleaned = text(value).replace(/_/g, " ");
    return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "";
  }

  function categoryLabel(place) {
    const category = humanize(place?.category);
    const subcategory = humanize(place?.subcategory_id).replace("Miljo gjenbruk", "Miljø og gjenbruk");
    return [category, subcategory].filter(Boolean).join(" · ");
  }

  function iconSvg(paths) {
    return `<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  }

  function renderPanel(place, panel) {
    const profile = place.micro_place_profile || {};
    const kind = KIND[text(profile.kind)] || KIND.annet_dokumentert_mikrosted;
    const status = STATUS[text(profile.currentStatus)] || "Dokumentert mikrosted";
    const statusCode = text(profile.currentStatus) || "documented";
    panel.innerHTML = `<span class="pc-micro-icon">${iconSvg(kind.icon)}</span><span class="pc-micro-copy"><span class="pc-micro-eyebrow">Mikrosted</span><strong>${esc(kind.label)}</strong><span class="pc-micro-taxonomy">${esc(categoryLabel(place))}</span></span><span class="pc-micro-status" data-status="${esc(statusCode)}"><span aria-hidden="true"></span>${esc(status)}</span>`;
    panel.setAttribute("aria-label", `${kind.label}. ${categoryLabel(place)}. ${status}.`);
  }

  function apply(place) {
    ensureStylesheet();
    const card = document.getElementById("placeCard");
    const panel = ensurePanel();
    if (!card || !panel) return false;

    const micro = isMicro(place);
    card.classList.toggle("is-micro-place", micro);
    document.body?.classList.toggle("is-micro-place-open", micro);
    card.dataset.placeTier = micro ? "micro" : "standard";
    panel.hidden = !micro;
    panel.setAttribute("aria-hidden", micro ? "false" : "true");

    if (!micro) {
      document.body?.classList.remove("is-micro-place-quizless");
      for (const id of ["pcQuiz", "pcObserve"]) {
        const action = document.getElementById(id);
        if (!action) continue;
        action.hidden = false;
        action.setAttribute("aria-hidden", "false");
      }
      ["microQuiz", "microKind", "microStatus"].forEach(key => delete card.dataset[key]);
      const collectionGrid = card.querySelector(".pc-icons-quad");
      if (card.dataset.collectionProfileSource === "micro_place_profile_v1") {
        delete card.dataset.collectionCount;
        delete card.dataset.collectionProfileSource;
      }
      if (collectionGrid?.dataset.collectionProfileSource === "micro_place_profile_v1") {
        delete collectionGrid.dataset.collectionCount;
        delete collectionGrid.dataset.collectionProfileSource;
      }
      return false;
    }

    renderPanel(place, panel);
    card.dataset.microKind = text(place.micro_place_profile?.kind) || "annet_dokumentert_mikrosted";
    card.dataset.microStatus = text(place.micro_place_profile?.currentStatus) || "documented";
    const quizMode = text(place.micro_place_profile?.quizMode) === "place" ? "place" : "none";
    card.dataset.microQuiz = quizMode;
    document.body?.classList.toggle("is-micro-place-quizless", quizMode === "none");
    const quiz = document.getElementById("pcQuiz");
    if (quiz) {
      quiz.hidden = quizMode === "none";
      quiz.setAttribute("aria-hidden", quizMode === "none" ? "true" : "false");
    }
    const observe = document.getElementById("pcObserve");
    if (observe) {
      observe.hidden = true;
      observe.setAttribute("aria-hidden", "true");
    }
    const grid = card.querySelector(".pc-icons-quad");
    if (grid) {
      grid.dataset.collectionCount = "0";
      grid.dataset.collectionProfileSource = "micro_place_profile_v1";
    }
    card.dataset.collectionCount = "0";
    card.dataset.collectionProfileSource = "micro_place_profile_v1";
    return true;
  }

  function currentPlace() {
    const id = text(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id && Array.isArray(global.PLACES)
      ? global.PLACES.find(place => text(place?.id) === id) || null
      : null;
  }

  function schedule(place) {
    if (scheduled) return;
    scheduled = true;
    const run = () => {
      scheduled = false;
      apply(place || currentPlace());
    };
    if (typeof global.requestAnimationFrame === "function") {
      global.requestAnimationFrame(() => global.requestAnimationFrame(run));
    } else global.setTimeout(run, 0);
  }

  function patchOpenPlaceCard() {
    const original = global.openPlaceCard;
    if (typeof original !== "function") return false;
    if (original.__hgMicroPlaceCardPatched) return true;
    const patched = async function openPlaceCardWithMicroTier(place) {
      const result = await original.apply(this, arguments);
      apply(place);
      schedule(place);
      return result;
    };
    patched.__hgMicroPlaceCardPatched = true;
    global.openPlaceCard = patched;
    return true;
  }

  function init() {
    ensureStylesheet();
    ensurePanel();
    if (!patchOpenPlaceCard()) {
      let attempts = 0;
      const timer = global.setInterval(() => {
        attempts += 1;
        if (patchOpenPlaceCard() || attempts >= 120) global.clearInterval(timer);
      }, 50);
    }
    schedule();
  }

  global.HGMicroPlaceCard = { isMicro, apply, schedule, __canonicalMicroPlaceCardV1:true };
  ["hg:appReady", "hg:place-selected", "hg:places-ready", "hg:placesUpdated"].forEach(name => global.addEventListener?.(name, () => schedule()));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})(window);
