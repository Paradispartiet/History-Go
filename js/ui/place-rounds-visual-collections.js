// @ts-nocheck
// js/ui/place-rounds-visual-collections.js
// Canonical PlaceCard-rundinger. Regler eies kun av data/places/README_place_rounds.md.
(function installCanonicalPlaceRounds(global) {
  "use strict";

  const FIXED_DEFS = Object.freeze([
    { id:"badges", label:"Merker", fallbackIcon:"🏅", iconId:"pcBadgesIcon", listId:"pcBadgesList", kind:"badges" },
    { id:"people", label:"Personer", fallbackIcon:"👥", iconId:"pcPeopleIcon", listId:"pcPeopleList", kind:"people" },
    { id:"objects", label:"Gjenstander", fallbackIcon:"🏺", iconId:"pcObjectsIcon", listId:"pcObjectsList", kind:"objects" },
    { id:"brands", label:"Brands", fallbackIcon:"🏷️", iconId:"pcBrandsIcon", listId:"pcBrandsList", kind:"brands" },
    { id:"map", label:"Kart", fallbackIcon:"🗺️", iconId:"pcNatureMapIcon", listId:"pcNatureMapList", kind:"nature-map" },
    { id:"flora", label:"Flora", fallbackIcon:"🌱", iconId:"pcFloraIcon", listId:"pcFloraList", kind:"flora" },
    { id:"fauna", label:"Fauna", fallbackIcon:"🐾", iconId:"pcFaunaIcon", listId:"pcFaunaList", kind:"fauna" }
  ]);

  const FOURTH_DEFS = Object.freeze({
    productions: { id:"productions", label:"Produksjoner", fallbackIcon:"🎭", iconId:"pcCategoryCollectionIcon", listId:"pcCategoryCollectionList", kind:"productions" },
    structures: { id:"structures", label:"Bygg og anlegg", fallbackIcon:"🏛️", iconId:"pcCategoryCollectionIcon", listId:"pcCategoryCollectionList", kind:"structures" },
    competitions: { id:"competitions", label:"Kamper og konkurranser", fallbackIcon:"🏆", iconId:"pcCategoryCollectionIcon", listId:"pcCategoryCollectionList", kind:"competitions" },
    related: { id:"related", label:"Relaterte steder", fallbackIcon:"🧭", iconId:"pcCategoryCollectionIcon", listId:"pcCategoryCollectionList", kind:"related" },
    destinations: { id:"destinations", label:"Turmål", fallbackIcon:"🥾", iconId:"pcCategoryCollectionIcon", listId:"pcCategoryCollectionList", kind:"destinations" },
    images: { id:"images", label:"Bilder", fallbackIcon:"🖼️", iconId:"pcCategoryCollectionIcon", listId:"pcCategoryCollectionList", kind:"images" }
  });

  const ALL_DEFS = Object.freeze([...FIXED_DEFS, ...Object.values(FOURTH_DEFS)]);
  const BY_ID = new Map(ALL_DEFS.map(def => [def.id, def]));
  const GENERAL_BASE = Object.freeze(["people", "objects", "brands"]);
  const NATURE_BASE = Object.freeze(["map", "flora", "fauna"]);
  const STANDARD_SECOND_ROUNDS = new Set(["objects", "images"]);

  const CATEGORY_FOURTH = Object.freeze({
    by:"structures",
    historie:"related",
    historisk:"related",
    kunst:"productions",
    litteratur:"productions",
    media:"productions",
    musikk:"productions",
    naeringsliv:"structures",
    natur:"destinations",
    politikk:"related",
    psykologi:"related",
    religion:"structures",
    scenekunst:"productions",
    sport:"competitions",
    subkultur:"productions",
    vitenskap:"related",
    filosofi:"related",
    film_tv:"productions",
    lekeplass:"structures",
    trening:"structures",
    transport:"structures"
  });

  const PRODUCTION_LABELS = Object.freeze({
    kunst:"Kunstverk",
    litteratur:"Bøker og tekster",
    musikk:"Sanger og album",
    film_tv:"Filmer og serier",
    scenekunst:"Forestillinger",
    media:"Utgivelser",
    subkultur:"Uttrykk og utgivelser"
  });

  const LEGACY_GRID_ICON_IDS = Object.freeze([
    "pcWorksIcon", "pcDetailsIcon", "pcSpotsIcon", "pcCivicationStoreIcon", "pcNatureIcon",
    "pcForNaIcon", "pcFortellingerIcon", "pcLeksikonIcon", "pcPlayIcon", "pcTrainingIcon",
    "pcTasksIcon", "pcWonderkammerIcon", "pcStoriesIcon", "pcRoutesIcon"
  ]);

  const s = value => String(value == null ? "" : value).trim();
  const arr = value => Array.isArray(value) ? value : [];
  const esc = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");
  let scheduled = false;
  let badgeBound = false;
  let secondBound = false;
  let categoryBound = false;

  function normalizeCategory(place) {
    const raw = s(place?.category || "by").toLowerCase();
    if (["technology", "teknologi", "it", "informasjonsteknologi"].includes(raw)) return "vitenskap";
    if (["økonomi", "okonomi", "næringsliv"].includes(raw)) return "naeringsliv";
    if (["film", "tv"].includes(raw)) return "film_tv";
    if (["teater", "theatre", "theater"].includes(raw)) return "scenekunst";
    return raw;
  }

  function currentPlace() {
    const id = s(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    return id ? arr(global.PLACES).find(place => s(place?.id) === id) || null : null;
  }

  function imageFor(item) {
    return item && typeof item === "object"
      ? s(item.imageCard || item.cardImage || item.image || item.img || item.photo || item.thumbnail || item.cover || item.logo || item.src)
      : "";
  }

  function normalizeItem(item, index, sourceKind) {
    if (typeof item === "string") {
      const linked = arr(global.PLACES).find(place => s(place?.id) === s(item));
      if (linked) return normalizeItem(linked, index, sourceKind);
      return { id:item, title:item, description:"", image:"", sourceKind };
    }
    if (!item || typeof item !== "object") return null;
    const id = s(item.id || item.slug || item.key || item.place_id || item.placeId || `${sourceKind}_${index}`);
    const title = s(item.title || item.name || item.label || item.id || `${sourceKind} ${index + 1}`);
    if (!id && !title) return null;
    return {
      id:id || title,
      title,
      description:s(item.description || item.desc || item.summary || item.placeSpecificDetail || item.whatToNotice || item.whereToFind || item.why_here || item.why),
      image:imageFor(item),
      sourceKind
    };
  }

  function dedupe(items) {
    const seen = new Set();
    return items.filter(Boolean).filter(item => {
      const key = s(item.id || item.image || item.title).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function flattenSources(sources) {
    return dedupe(sources.flatMap(([value, sourceKind]) => arr(value).map((item, index) => normalizeItem(item, index, sourceKind))));
  }

  function civicationItems(place) {
    const id = s(place?.id);
    return [
      ...arr(global.CIVICATION_STORE_BY_PLACE?.[id]),
      ...arr(place?.civication_store), ...arr(place?.civicationStore),
      ...arr(place?.civication_items), ...arr(place?.civicationItems)
    ];
  }

  function physicalCivication(item) {
    if (!item || typeof item !== "object" || !imageFor(item)) return false;
    return Boolean(
      item.physicalObject === true || item.physical === true || item.isPhysical === true ||
      s(item.objectType || item.object_type || item.material || item.historicalFunction || item.historical_function)
    );
  }

  function objectItems(place) {
    return flattenSources([
      [place?.objects, "objects"],
      [place?.artifacts, "artifacts"],
      [civicationItems(place).filter(physicalCivication), "civication"]
    ]);
  }

  function productionItems(place) {
    const category = normalizeCategory(place);
    const profiles = [place?.music_profile, place?.music, place?.literature_profile, place?.film_profile, place?.stage_profile, place?.media_profile, place?.subculture_profile, place?.art_profile];
    const sources = [
      [place?.works, "works"], [place?.productions, "productions"], [place?.publications, "publications"],
      [place?.artworks, "artworks"], [place?.books, "books"], [place?.texts, "texts"],
      [place?.songs, "songs"], [place?.albums, "albums"], [place?.films, "films"],
      [place?.series, "series"], [place?.performances, "performances"], [place?.releases, "releases"]
    ];
    for (const profile of profiles) {
      if (!profile || typeof profile !== "object") continue;
      for (const key of ["works", "productions", "publications", "artworks", "books", "texts", "songs", "albums", "films", "series", "performances", "releases", "tracks"]) {
        sources.push([profile[key], `${category}_${key}`]);
      }
    }
    return flattenSources(sources);
  }

  const STRUCTURE_PATTERN = /\b(bygg|bygning|anlegg|hall|arena|stadion|tribune|tårn|tower|kirke|kapell|rom|scene|bro|bru|tunnel|port|gårdsrom|fabrikk|verksted|bane|terminal|stasjon|campus|paviljong|fort|bunker|batteri|ruin|konstruksjon)\b/i;

  function structureCompatible(item) {
    if (!item || typeof item !== "object") return false;
    return STRUCTURE_PATTERN.test([item.type, item.kind, item.category, item.title, item.name, item.label].map(s).join(" "));
  }

  function structureItems(place) {
    return flattenSources([
      [place?.buildings, "buildings"], [place?.structures, "structures"], [place?.facilities, "facilities"],
      [place?.venues, "venues"], [place?.architecture, "architecture"],
      [arr(place?.subplaces).filter(structureCompatible), "subplaces"],
      [arr(place?.subPlaces).filter(structureCompatible), "subplaces"],
      [arr(place?.spots).filter(structureCompatible), "legacy_spots"]
    ]);
  }

  function competitionItems(place) {
    const profile = place?.sport_profile && typeof place.sport_profile === "object" ? place.sport_profile : {};
    return flattenSources([
      [place?.competitions, "competitions"], [place?.matches, "matches"], [place?.tournaments, "tournaments"],
      [place?.sport_events, "sport_events"], [place?.sporting_events, "sporting_events"],
      [profile.competitions, "sport_profile_competitions"], [profile.matches, "sport_profile_matches"],
      [profile.tournaments, "sport_profile_tournaments"], [profile.major_events, "sport_profile_major_events"],
      [profile.notable_events, "sport_profile_notable_events"], [profile.events, "sport_profile_events"]
    ]);
  }

  function placeFromReference(value) {
    if (!value) return null;
    if (typeof value === "string") return arr(global.PLACES).find(place => s(place?.id) === s(value)) || null;
    if (typeof value !== "object") return null;
    const id = s(value.place_id || value.placeId || value.target_id || value.targetId || value.to || value.id);
    return arr(global.PLACES).find(place => s(place?.id) === id) || (value.title || value.name || value.label ? value : null);
  }

  function relationReferences(place) {
    return [
      ...arr(place?.related_places), ...arr(place?.relatedPlaces), ...arr(place?.related_place_ids),
      ...arr(place?.relations).map(relation => {
        if (typeof relation === "string") return relation;
        if (!relation || typeof relation !== "object") return null;
        return relation.place_id || relation.placeId || relation.target_id || relation.targetId || relation.to || null;
      })
    ].filter(Boolean);
  }

  function relatedItems(place) {
    const selfId = s(place?.id);
    return dedupe(relationReferences(place).map((value, index) => normalizeItem(placeFromReference(value) || value, index, "related")))
      .filter(item => s(item.id) !== selfId);
  }

  function destinationItems(place) {
    const profile = place?.nature_profile && typeof place.nature_profile === "object" ? place.nature_profile : {};
    const direct = flattenSources([
      [place?.destinations, "destinations"], [place?.tour_targets, "tour_targets"], [place?.trail_targets, "trail_targets"],
      [place?.viewpoints, "viewpoints"], [place?.attractions, "attractions"],
      [profile.destinations, "nature_destinations"], [profile.tour_targets, "nature_tour_targets"],
      [profile.trail_targets, "nature_trail_targets"], [profile.viewpoints, "nature_viewpoints"]
    ]);
    const linked = dedupe(arr(profile.nearby_place_ids).map((id, index) => normalizeItem(placeFromReference(id) || id, index, "nature_nearby")));
    return dedupe([...direct, ...linked]).filter(item => s(item.id) !== s(place?.id));
  }

  function imageItems(place) {
    const result = [];
    const push = (value, title, sourceKind) => {
      if (!value) return;
      if (typeof value === "string") {
        result.push({ id:`${sourceKind}_${result.length}`, title, description:"", image:s(value), sourceKind });
        return;
      }
      if (typeof value === "object") {
        const image = imageFor(value);
        if (!image) return;
        result.push({
          id:s(value.id || value.key || `${sourceKind}_${result.length}`),
          title:s(value.title || value.caption || value.label || title),
          description:s(value.description || value.desc || value.summary),
          image,
          sourceKind
        });
      }
    };
    arr(place?.images).forEach(value => push(value, "Bilde", "images"));
    arr(place?.gallery).forEach(value => push(value, "Bilde", "gallery"));
    arr(place?.photos).forEach(value => push(value, "Bilde", "photos"));
    arr(place?.imageGallery).forEach(value => push(value, "Bilde", "imageGallery"));
    arr(place?.media?.images).forEach(value => push(value, "Bilde", "media"));
    push(place?.frontImage, "Hovedbilde", "frontImage");
    push(place?.popupImage, "Stedsbilde", "popupImage");
    push(place?.image, "Stedsbilde", "image");
    if (!result.length) push(place?.cardImage, "Stedsbilde", "cardImage");
    push(place?.for_na?.beforeImage, s(place?.for_na?.beforeImageLabel || "Før"), "beforeImage");
    push(place?.for_na?.nowImage, s(place?.for_na?.nowImageLabel || "Nå"), "nowImage");
    const seen = new Set();
    return result.filter(item => {
      const key = s(item.image).replace(/([_-])card(?=\.[a-z0-9]+$)/i, "").toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function collectionItems(place, id) {
    if (!place) return [];
    if (id === "objects") return objectItems(place);
    if (id === "productions") return productionItems(place);
    if (id === "structures") return structureItems(place);
    if (id === "competitions") return competitionItems(place);
    if (id === "related") return relatedItems(place);
    if (id === "destinations") return destinationItems(place);
    if (id === "images") return imageItems(place);
    return [];
  }

  function preferredFourthId(place) {
    return CATEGORY_FOURTH[normalizeCategory(place)] || "images";
  }

  function configuredRoundIds(place) {
    if (normalizeCategory(place) === "natur") return null;
    const ids = arr(place?.round_profile?.content_round_ids).map(s);
    const valid = ids.length === 4
      && ids[0] === "people"
      && STANDARD_SECOND_ROUNDS.has(ids[1])
      && ids[2] === "brands"
      && Object.prototype.hasOwnProperty.call(FOURTH_DEFS, ids[3])
      && ids[1] !== ids[3]
      && collectionItems(place, ids[1]).length > 0
      && collectionItems(place, ids[3]).length > 0;
    return valid ? ids : null;
  }

  function secondRoundId(place) {
    return configuredRoundIds(place)?.[1] || "objects";
  }

  function fourthRoundId(place) {
    const configured = configuredRoundIds(place);
    if (configured) return configured[3];
    const preferred = preferredFourthId(place);
    return collectionItems(place, preferred).length ? preferred : "images";
  }

  function fourthLabel(place, id = fourthRoundId(place)) {
    if (id === "productions") return PRODUCTION_LABELS[normalizeCategory(place)] || FOURTH_DEFS.productions.label;
    return FOURTH_DEFS[id]?.label || FOURTH_DEFS.images.label;
  }

  function defFor(place, id) {
    const def = BY_ID.get(id);
    if (!def) return null;
    return id in FOURTH_DEFS ? { ...def, label:fourthLabel(place, id) } : def;
  }

  function secondDef(place) {
    const def = defFor(place, secondRoundId(place));
    return def ? { ...def, iconId:"pcObjectsIcon", listId:"pcObjectsList" } : null;
  }

  function selectedIds(place) {
    const configured = configuredRoundIds(place);
    if (configured) return configured;
    const base = normalizeCategory(place) === "natur" ? NATURE_BASE : GENERAL_BASE;
    return [...base, fourthRoundId(place)];
  }

  function ensureBadgePlacement() {
    const titleRow = document.querySelector("#placeCard .pc-title-row");
    const badge = document.getElementById("pcBadgesIcon");
    if (!titleRow || !badge) return;
    badge.classList.add("pc-title-badge");
    badge.hidden = false;
    badge.setAttribute("aria-hidden", "false");
    if (badge.parentElement !== titleRow) titleRow.appendChild(badge);
  }

  function ensureElement(id, className, parent, roleButton = false) {
    let element = document.getElementById(id);
    if (element || !parent) return element;
    element = document.createElement("div");
    element.id = id;
    element.className = className;
    element.hidden = true;
    element.setAttribute("aria-hidden", "true");
    if (roleButton) {
      element.setAttribute("role", "button");
      element.tabIndex = 0;
    }
    parent.appendChild(element);
    return element;
  }

  function ensureDom() {
    const card = document.getElementById("placeCard");
    const grid = card?.querySelector(".pc-icons-quad");
    const body = card?.querySelector(".pc-body");
    if (!card || !grid || !body) return;
    for (const def of FIXED_DEFS.filter(item => ["objects", "map", "flora", "fauna"].includes(item.id))) {
      const icon = ensureElement(def.iconId, "pc-round", grid, true);
      icon?.setAttribute("aria-label", def.label);
      ensureElement(def.listId, "", body, false);
    }
    const categoryIcon = ensureElement("pcCategoryCollectionIcon", "pc-round", grid, true);
    categoryIcon?.setAttribute("aria-label", "Kategoriinnhold");
    ensureElement("pcCategoryCollectionList", "", body, false);
    ensureBadgePlacement();
  }

  function renderRows(items, def) {
    return items.length
      ? items.map(item => `<button type="button" class="pc-person pc-visual-round-item" data-visual-round-item="${esc(item.id)}">${item.image ? `<img src="${esc(item.image)}" class="pc-person-img" alt="">` : ""}<span class="pc-person-meta"><span class="pc-person-name">${esc(item.title)}</span>${item.description ? `<span class="pc-person-desc">${esc(item.description)}</span>` : ""}</span></button>`).join("")
      : `<div class="pc-empty">Ingen ${esc(def.label.toLowerCase())} registrert ennå</div>`;
  }

  async function natureItems(place, kind) {
    const fromBridge = await global.HGNaturePlaceMap?.getForPlace?.(place).catch?.(() => null) || null;
    const bridged = kind === "flora" ? fromBridge?.floraItems : fromBridge?.faunaItems;
    if (arr(bridged).length) return arr(bridged).map((item, index) => normalizeItem(item, index, kind)).filter(Boolean);
    const registry = kind === "flora" ? arr(global.FLORA) : arr(global.FAUNA);
    return arr(place?.[kind]).map((id, index) => normalizeItem(registry.find(row => s(row?.id) === s(id)) || id, index, kind)).filter(Boolean);
  }

  async function renderFixed(place, def) {
    const icon = document.getElementById(def.iconId);
    const list = document.getElementById(def.listId);
    if (!icon || !list) return;
    if (def.id === "map") {
      const preview = await Promise.resolve(global.HGNatureDetailedMap?.getPreview?.(place)).catch(() => "");
      icon.innerHTML = preview ? `<img src="${esc(preview)}" class="pc-person-img" alt="Turkart">` : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span></div>`;
      list.innerHTML = '<div class="pc-empty">Tur- og naturkart åpnes fra Kart-rundingen.</div>';
      return;
    }
    const items = ["flora", "fauna"].includes(def.id) ? await natureItems(place, def.id) : collectionItems(place, def.id);
    list.innerHTML = renderRows(items, def);
    const preview = items.find(item => item.image);
    icon.innerHTML = preview?.image
      ? `<img src="${esc(preview.image)}" class="pc-person-img" alt="${esc(preview.title)}">`
      : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span><span class="pc-round-count">${items.length || ""}</span></div>`;
  }

  async function renderSecond(place) {
    const def = secondDef(place);
    if (!def) return;
    await renderFixed(place, def);
    const icon = document.getElementById("pcObjectsIcon");
    if (!icon) return;
    icon.dataset.roundId = def.id;
    icon.setAttribute("aria-label", def.label);
    icon.title = def.label;
  }

  function renderFourth(place) {
    const id = fourthRoundId(place);
    const def = defFor(place, id);
    const icon = document.getElementById("pcCategoryCollectionIcon");
    const list = document.getElementById("pcCategoryCollectionList");
    if (!def || !icon || !list) return;
    const items = collectionItems(place, id);
    list.innerHTML = renderRows(items, def);
    const preview = items.find(item => item.image);
    icon.dataset.roundId = id;
    icon.setAttribute("aria-label", def.label);
    icon.title = def.label;
    icon.innerHTML = preview?.image
      ? `<img src="${esc(preview.image)}" class="pc-person-img" alt="${esc(preview.title)}">`
      : `<div class="pc-round-label"><span class="pc-round-emoji">${def.fallbackIcon}</span><span class="pc-round-count">${items.length || ""}</span></div>`;
  }

  function showMissingDetailedMap(place) {
    global.showPlaceCardRoundPopup?.({
      title:"Kart", subtitle:s(place?.name || place?.title), kind:"nature-map", place,
      html:'<div class="pc-empty">Tur-/naturkartet er ikke lastet for dette naturstedet. History GO bruker aldri det generelle hovedkartet som fallback for Kart-rundingen.</div>'
    });
  }

  async function openNatureMap(place) {
    if (typeof global.HGNatureDetailedMap?.openPlace === "function") return global.HGNatureDetailedMap.openPlace(place);
    showMissingDetailedMap(place);
  }

  function bindFixed(def) {
    const icon = document.getElementById(def.iconId);
    if (!icon || icon.dataset.canonicalRoundBound === "1") return;
    icon.dataset.canonicalRoundBound = "1";
    const open = async event => {
      if (event?.type === "keydown" && !["Enter", " "].includes(event.key)) return;
      event?.preventDefault?.();
      event?.stopPropagation?.();
      const place = currentPlace();
      if (!place) return;
      if (def.id === "map") return openNatureMap(place);
      await renderFixed(place, def);
      const html = s(document.getElementById(def.listId)?.innerHTML) || '<div class="pc-empty">Ingen innhold ennå</div>';
      global.showPlaceCardRoundPopup?.({ title:def.label, subtitle:s(place.name || place.title), html, place, kind:def.kind });
    };
    icon.addEventListener("click", open);
    icon.addEventListener("keydown", open);
  }

  function bindSecond() {
    if (secondBound) return;
    const icon = document.getElementById("pcObjectsIcon");
    if (!icon) return;
    secondBound = true;
    const open = async event => {
      if (event?.type === "keydown" && !["Enter", " "].includes(event.key)) return;
      event?.preventDefault?.();
      event?.stopPropagation?.();
      const place = currentPlace();
      if (!place) return;
      await renderSecond(place);
      const def = secondDef(place);
      const html = s(document.getElementById("pcObjectsList")?.innerHTML) || '<div class="pc-empty">Ingen innhold ennå</div>';
      global.showPlaceCardRoundPopup?.({ title:def?.label || "Gjenstander", subtitle:s(place.name || place.title), html, place, kind:def?.id || "objects" });
    };
    icon.addEventListener("click", open);
    icon.addEventListener("keydown", open);
  }

  function bindFourth() {
    if (categoryBound) return;
    const icon = document.getElementById("pcCategoryCollectionIcon");
    if (!icon) return;
    categoryBound = true;
    const open = event => {
      if (event?.type === "keydown" && !["Enter", " "].includes(event.key)) return;
      event?.preventDefault?.();
      event?.stopPropagation?.();
      const place = currentPlace();
      if (!place) return;
      renderFourth(place);
      const id = fourthRoundId(place);
      const def = defFor(place, id);
      const html = s(document.getElementById("pcCategoryCollectionList")?.innerHTML) || '<div class="pc-empty">Ingen innhold ennå</div>';
      global.showPlaceCardRoundPopup?.({ title:def?.label || "Bilder", subtitle:s(place.name || place.title), html, place, kind:id });
    };
    icon.addEventListener("click", open);
    icon.addEventListener("keydown", open);
  }

  function bindBadge() {
    if (badgeBound) return;
    badgeBound = true;
    document.addEventListener("click", event => {
      const target = event.target instanceof Element ? event.target.closest("#pcBadgesIcon") : null;
      if (!target) return;
      const id = s(currentPlace()?.id);
      if (!id) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      global.location.href = `fagverk-sted.html?place=${encodeURIComponent(id)}`;
    }, true);
  }

  async function apply(place = currentPlace()) {
    const card = document.getElementById("placeCard");
    if (!card || !place) return;
    ensureDom();
    bindBadge();
    ensureBadgePlacement();
    for (const def of FIXED_DEFS.filter(item => ["map", "flora", "fauna"].includes(item.id))) {
      await renderFixed(place, def);
      bindFixed(def);
    }
    await renderSecond(place);
    bindSecond();
    renderFourth(place);
    bindFourth();

    const selected = selectedIds(place);
    const configured = configuredRoundIds(place);
    const slotIconIds = selected.map((id, index) => {
      if (configured && index === 1) return "pcObjectsIcon";
      if (index === 3) return "pcCategoryCollectionIcon";
      return BY_ID.get(id)?.iconId;
    }).filter(Boolean);
    const allowed = new Set(slotIconIds);
    const grid = card.querySelector(".pc-icons-quad");
    const fourth = selected[3] || "images";
    card.dataset.roundMode = "category-four";
    card.dataset.roundCount = "4";
    card.dataset.roundCategory = normalizeCategory(place);
    card.dataset.roundSecond = selected[1] || "";
    card.dataset.roundFourth = fourth;

    if (grid) {
      grid.querySelectorAll(".pc-round").forEach(icon => {
        const show = allowed.has(icon.id);
        icon.hidden = !show;
        icon.setAttribute("aria-hidden", show ? "false" : "true");
        if (show) {
          icon.style.order = String(slotIconIds.indexOf(icon.id));
        } else {
          icon.style.order = "";
        }
      });
      for (const iconId of LEGACY_GRID_ICON_IDS) {
        const icon = document.getElementById(iconId);
        if (!icon || allowed.has(iconId)) continue;
        icon.hidden = true;
        icon.setAttribute("aria-hidden", "true");
        icon.style.order = "";
      }
      grid.dataset.roundMode = "category-four";
      grid.dataset.roundCount = "4";
      grid.dataset.roundCategory = normalizeCategory(place);
      grid.dataset.roundSecond = selected[1] || "";
      grid.dataset.roundFourth = fourth;
      grid.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
      grid.style.gridTemplateRows = "repeat(2, minmax(0, 1fr))";
    }
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    const run = () => { scheduled = false; apply(); };
    if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(run);
    else global.setTimeout(run, 0);
  }

  function patchOpenPlaceCard() {
    const original = global.openPlaceCard;
    if (typeof original !== "function") return false;
    if (original.__canonicalCategoryFourPatched) return true;
    const patched = async function(...args) {
      const result = await original.apply(this, args);
      scheduleApply();
      return result;
    };
    patched.__canonicalCategoryFourPatched = true;
    global.openPlaceCard = patched;
    return true;
  }

  function installApi() {
    const registry = [...FIXED_DEFS, ...Object.values(FOURTH_DEFS)];
    const byId = Object.fromEntries(registry.map(def => [def.id, def]));
    global.HGPlaceRounds = {
      registry, badge:BY_ID.get("badges"),
      base:{ standard:[...GENERAL_BASE], natur:[...NATURE_BASE] },
      fourthByCategory:CATEGORY_FOURTH,
      byId,
      getConfigured:configuredRoundIds,
      get:place => selectedIds(place).map(id => defFor(place, id)).filter(Boolean),
      getFourth:fourthRoundId,
      getFourthLabel:fourthLabel,
      getItems:collectionItems,
      apply,
      __canonicalCategoryFour:true
    };
    global.getPlaceRounds = global.HGPlaceRounds.get;
  }

  function init() {
    ensureDom();
    installApi();
    bindBadge();
    bindSecond();
    bindFourth();
    patchOpenPlaceCard();
    scheduleApply();
    if (typeof global.openPlaceCard !== "function") {
      let attempts = 0;
      const timer = global.setInterval(() => {
        attempts += 1;
        if (patchOpenPlaceCard() || attempts >= 80) global.clearInterval(timer);
      }, 100);
    }
  }

  global.HGVisualPlaceRounds = {
    ids:ALL_DEFS.map(def => def.id), registry:[...ALL_DEFS], badge:BY_ID.get("badges"),
    base:{ standard:[...GENERAL_BASE], natur:[...NATURE_BASE] },
    fourthByCategory:CATEGORY_FOURTH,
    getConfigured:configuredRoundIds,
    get:selectedIds, getFourth:fourthRoundId, getFourthLabel:fourthLabel, getItems:collectionItems, apply
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
  ["hg:appReady", "hg:place-selected", "hg:places-ready", "hg:placesUpdated", "updateProfile", "hg:nature-detailed-map-ready"].forEach(name => global.addEventListener?.(name, () => { patchOpenPlaceCard(); scheduleApply(); }));
})(window);
