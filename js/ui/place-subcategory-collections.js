// @ts-nocheck
// js/ui/place-subcategory-collections.js
// Scoped PlaceCard renderer for canonical place subcategories whose collection
// semantics differ from the top-category default. Ordinary PlaceCards are untouched.
(function installPlaceSubcategoryCollections(global) {
  "use strict";

  const TARGET_CATEGORY = "natur";
  const TARGET_SUBCATEGORY = "miljo_gjenbruk";
  const DEFS = Object.freeze([
    { id:"reuse", label:"Ombruk", icon:"♻️", iconId:"pcReuseIcon", listId:"pcReuseList" },
    { id:"materials", label:"Materialer", icon:"🧱", iconId:"pcMaterialsIcon", listId:"pcMaterialsList" },
    { id:"environment", label:"Kretsløp & miljø", icon:"🌍", iconId:"pcEnvironmentIcon", listId:"pcEnvironmentList" },
    { id:"systems", label:"Sted & system", icon:"🏙️", iconId:"pcSystemsIcon", listId:"pcSystemsList" }
  ]);
  const CUSTOM_ICON_IDS = new Set(DEFS.map(def => def.iconId));
  let patched = false;
  let scheduled = false;

  const s = value => String(value == null ? "" : value).trim();
  const arr = value => Array.isArray(value) ? value : [];
  const esc = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");

  function isTarget(place) {
    return s(place?.placeTier).toLowerCase() !== "micro"
      && s(place?.category).toLowerCase() === TARGET_CATEGORY
      && s(place?.subcategory_id).toLowerCase() === TARGET_SUBCATEGORY;
  }

  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? arr(global.PLACES).find(place => s(place?.id) === id) || null : null;
  }

  function profileItems(place, id) {
    const profile = place?.circular_profile && typeof place.circular_profile === "object" ? place.circular_profile : {};
    return arr(profile[id]).map((item, index) => {
      if (typeof item === "string") return { id:`${id}_${index}`, title:item, description:"", image:"" };
      if (!item || typeof item !== "object") return null;
      return {
        id:s(item.id || `${id}_${index}`),
        title:s(item.title || item.name || item.label || `${id} ${index + 1}`),
        description:s(item.description || item.desc || item.summary),
        image:s(item.imageCard || item.cardImage || item.image || item.thumbnail || item.src)
      };
    }).filter(Boolean);
  }

  function ensureDom() {
    const card = document.getElementById("placeCard");
    const grid = card?.querySelector(".pc-icons-quad");
    const body = card?.querySelector(".pc-body");
    if (!grid || !body) return false;
    for (const def of DEFS) {
      let icon = document.getElementById(def.iconId);
      if (!icon) {
        icon = document.createElement("div");
        icon.id = def.iconId;
        icon.className = "pc-round pc-collection pc-subcategory-collection";
        icon.hidden = true;
        icon.setAttribute("role", "button");
        icon.tabIndex = 0;
        grid.appendChild(icon);
      }
      icon.dataset.collectionId = def.id;
      icon.dataset.collectionShape = "rectangle";
      icon.setAttribute("aria-label", def.label);
      icon.title = def.label;

      let list = document.getElementById(def.listId);
      if (!list) {
        list = document.createElement("div");
        list.id = def.listId;
        list.hidden = true;
        body.appendChild(list);
      }
      if (icon.dataset.subcategoryCollectionBound !== "1") {
        const open = event => {
          if (event?.type === "keydown" && !["Enter", " "].includes(event.key)) return;
          const place = currentPlace();
          if (!isTarget(place)) return;
          event?.preventDefault?.();
          event?.stopPropagation?.();
          const items = profileItems(place, def.id);
          const html = items.length
            ? items.map(item => `<div class="pc-person pc-visual-round-item">${item.image ? `<img src="${esc(item.image)}" class="pc-person-img" alt="">` : ""}<span class="pc-person-meta"><span class="pc-person-name">${esc(item.title)}</span>${item.description ? `<span class="pc-person-desc">${esc(item.description)}</span>` : ""}</span></div>`).join("")
            : `<div class="pc-empty">Ingen ${esc(def.label.toLowerCase())} registrert ennå</div>`;
          global.showPlaceCardRoundPopup?.({ title:def.label, subtitle:s(place.name || place.title), html, place, kind:def.id });
        };
        icon.addEventListener("click", open);
        icon.addEventListener("keydown", open);
        icon.dataset.subcategoryCollectionBound = "1";
      }
    }
    return true;
  }

  function renderIcon(place, def) {
    const icon = document.getElementById(def.iconId);
    if (!icon) return;
    const items = profileItems(place, def.id);
    const preview = items.find(item => item.image);
    const fallback = `<div class="pc-round-label"><span class="pc-round-emoji">${def.icon}</span><span class="pc-round-count">${items.length || ""}</span></div>`;
    icon.innerHTML = preview?.image ? `<img src="${esc(preview.image)}" class="pc-person-img" alt="${esc(preview.title)}">` : fallback;
    icon.querySelector("img")?.addEventListener("error", () => { icon.innerHTML = fallback; }, { once:true });
  }

  function apply(place = currentPlace()) {
    const card = document.getElementById("placeCard");
    const grid = card?.querySelector(".pc-icons-quad");
    if (!card || !grid || !place || !ensureDom()) return false;

    if (!isTarget(place)) {
      for (const def of DEFS) {
        const icon = document.getElementById(def.iconId);
        if (icon) {
          icon.hidden = true;
          icon.setAttribute("aria-hidden", "true");
          icon.style.order = "";
        }
      }
      return false;
    }

    grid.querySelectorAll(".pc-round").forEach(icon => {
      if (CUSTOM_ICON_IDS.has(icon.id)) return;
      icon.hidden = true;
      icon.setAttribute("aria-hidden", "true");
      icon.style.order = "";
    });

    DEFS.forEach((def, index) => {
      const icon = document.getElementById(def.iconId);
      if (!icon) return;
      renderIcon(place, def);
      icon.hidden = false;
      icon.setAttribute("aria-hidden", "false");
      icon.style.order = String(index);
      icon.dataset.collectionPosition = String(index);
      icon.dataset.collectionShape = "rectangle";
    });

    card.dataset.collectionMode = "place-card-collections-v2-subcategory";
    card.dataset.collectionCount = "4";
    card.dataset.collectionProfileSource = "subcategory:miljo_gjenbruk";
    card.dataset.roundMode = "collections-v2";
    card.dataset.roundCount = "4";
    grid.dataset.collectionMode = "place-card-collections-v2-subcategory";
    grid.dataset.collectionCount = "4";
    grid.dataset.collectionProfileSource = "subcategory:miljo_gjenbruk";
    grid.dataset.roundMode = "collections-v2";
    grid.dataset.roundCount = "4";
    global.HGPlaceRoundsFillLayout?.scheduleLayout?.();
    return true;
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    const run = () => { scheduled = false; apply(); };
    if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(() => global.requestAnimationFrame(run));
    else global.setTimeout(run, 0);
  }

  function patchOpenPlaceCard() {
    if (patched || !global.HGPlaceCardCollections?.__canonicalPlaceCardCollectionsV2 || typeof global.openPlaceCard !== "function") return false;
    const original = global.openPlaceCard;
    global.openPlaceCard = async function openPlaceCardWithSubcategoryCollections(...args) {
      const result = await original.apply(this, args);
      scheduleApply();
      return result;
    };
    patched = true;
    return true;
  }

  function init() {
    ensureDom();
    if (!patchOpenPlaceCard()) {
      let attempts = 0;
      const timer = global.setInterval(() => {
        attempts += 1;
        if (patchOpenPlaceCard() || attempts >= 120) global.clearInterval(timer);
      }, 50);
    }
    scheduleApply();
  }

  global.HGPlaceSubcategoryCollections = {
    subcategoryId: TARGET_SUBCATEGORY,
    collectionIds: DEFS.map(def => def.id),
    getItems: profileItems,
    apply,
    __canonicalSubcategoryCollectionsV1:true
  };
  ["hg:appReady", "hg:place-selected", "hg:places-ready", "hg:placesUpdated", "updateProfile"].forEach(name => global.addEventListener?.(name, scheduleApply));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})(window);
