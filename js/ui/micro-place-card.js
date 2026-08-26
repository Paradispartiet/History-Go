// @ts-nocheck
// Compact PlaceCard for canonical Places with placeTier: "micro".
(function installMicroPlaceCard(global) {
  "use strict";

  const KIND = Object.freeze({
    lesekiosk: { icon:"📚", label:"Lesekiosk" },
    bokskap: { icon:"📖", label:"Bokskap" },
    gjenvinningsstasjon: { icon:"♻️", label:"Gjenvinningsstasjon" },
    ombrukspunkt: { icon:"♻️", label:"Ombrukspunkt" },
    miljostasjon: { icon:"🌱", label:"Miljøstasjon" },
    minneskilt: { icon:"◻️", label:"Minneskilt" },
    snublestein: { icon:"◼️", label:"Snublestein" },
    annet_dokumentert_mikrosted: { icon:"📍", label:"Mikrosted" }
  });
  const STATUS = Object.freeze({
    active:"Aktivt sted",
    temporary_unavailable:"Midlertidig utilgjengelig",
    historic:"Historisk mikrosted"
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

  function categoryLabel(place) {
    const category = text(place?.category).replace(/_/g, " ");
    const subcategory = text(place?.subcategory_id).replace(/_/g, " ");
    return [category, subcategory].filter(Boolean).join(" · ");
  }

  function renderPanel(place, panel) {
    const profile = place.micro_place_profile || {};
    const kind = KIND[text(profile.kind)] || KIND.annet_dokumentert_mikrosted;
    const status = STATUS[text(profile.currentStatus)] || "Dokumentert mikrosted";
    panel.innerHTML = `<span class="pc-micro-icon" aria-hidden="true">${kind.icon}</span><span class="pc-micro-copy"><strong>${esc(kind.label)}</strong><span>${esc(categoryLabel(place))}</span><span class="pc-micro-status">${esc(status)}</span></span>`;
    panel.setAttribute("aria-label", `${kind.label}. ${categoryLabel(place)}. ${status}.`);
  }

  function apply(place) {
    ensureStylesheet();
    const card = document.getElementById("placeCard");
    const panel = ensurePanel();
    if (!card || !panel) return false;

    const micro = isMicro(place);
    card.classList.toggle("is-micro-place", micro);
    card.dataset.placeTier = micro ? "micro" : "standard";
    panel.hidden = !micro;
    panel.setAttribute("aria-hidden", micro ? "false" : "true");

    if (!micro) {
      card.removeAttribute("data-micro-quiz");
      return false;
    }

    renderPanel(place, panel);
    const quizMode = text(place.micro_place_profile?.quizMode) === "place" ? "place" : "none";
    card.dataset.microQuiz = quizMode;
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
