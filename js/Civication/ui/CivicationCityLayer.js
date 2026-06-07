// CivicationCityLayer.js
// HTML-overlay som gjør Civication-kartet til en levende by: fasepunkter som
// synlige steder + simulerte venner som figurer. Ligger over canvas/3D-kartet
// og er uavhengig av hvilken kartmotor som tegner bakgrunnen.
//
// Datadrevet via CivicationFriendsEngine. Ingen GPS / ekte posisjon – kun
// simulert spilltilstedeværelse.
(function () {
  "use strict";

  if (window.CivicationCityLayer) return;

  const LAYER_CLASS = "civi-city-layer";

  // ---------------------------------------------------------------------------
  // Hjelpere
  // ---------------------------------------------------------------------------
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function engine() {
    return window.CivicationFriendsEngine || null;
  }

  function districtCenter(zoneId) {
    const districts = window.CIVI_MAP_DISTRICTS || [];
    const d = districts.find((x) => String(x && x.id) === String(zoneId || ""));
    if (d && Array.isArray(d.center) && d.center.length === 2) {
      return { x: Number(d.center[0]), y: Number(d.center[1]) };
    }
    return null;
  }

  // Normalisert posisjon (0-1) for et sted: eksplisitt position vinner, ellers
  // bydelssenter fra kartmodellen, ellers midten.
  function locationXY(loc) {
    if (loc && loc.position && typeof loc.position.x === "number" && typeof loc.position.y === "number") {
      return { x: loc.position.x, y: loc.position.y };
    }
    const center = districtCenter(loc && loc.mapZone);
    if (center) return center;
    return { x: 0.5, y: 0.5 };
  }

  const ACTIVITY_LABELS = {
    rest: "Hvile",
    personal_messages: "Personlige meldinger",
    family: "Familie",
    evening_consequence: "Kveldskonsekvenser",
    job_mail: "Jobbmail",
    tasks: "Oppgaver",
    promotion_path: "Forfremmelse",
    stagnation_path: "Stagnasjon",
    coffee: "Kaffe",
    meet_friends: "Møte venner",
    reflection: "Refleksjon",
    shopping: "Handle",
    errands: "Ærender",
    walking: "Gåtur",
    training: "Trening",
    health: "Helse",
    social: "Sosialt",
    culture: "Kultur",
    scene: "Scene",
    aha_insight: "AHA-innsikt",
    profile_interpretation: "Profiltolkning",
    economy: "Økonomi",
    help: "Hjelp",
    system: "System",
    visit: "Besøk"
  };

  function activityLabel(key) {
    return ACTIVITY_LABELS[String(key || "")] || String(key || "");
  }

  const CHANNEL_HINTS = {
    job: "Jobbmail og arbeidsoppgaver hører til her.",
    personal: "Personlige meldinger og hjemmehendelser hører til her.",
    social: "Sosiale møter med venner hører til her.",
    system: "System, økonomi og hjelp hører til her.",
    insight: "Refleksjon og innsikt hører til her."
  };

  // ---------------------------------------------------------------------------
  // Layer-oppsett
  // ---------------------------------------------------------------------------
  function ensureLayer() {
    const host = document.getElementById("civiMapWorld");
    if (!host) return null;

    let layer = host.querySelector("." + LAYER_CLASS);
    if (layer) return layer;

    layer = document.createElement("div");
    layer.className = LAYER_CLASS;
    layer.innerHTML =
      '<div class="civi-city-markers" aria-label="Civication-byens steder og venner"></div>' +
      '<div class="civi-city-self" aria-live="polite" hidden></div>' +
      '<aside class="civi-city-detail" aria-live="polite" hidden>' +
      '<button type="button" class="civi-city-detail-close" aria-label="Lukk">×</button>' +
      '<div class="civi-city-detail-body"></div>' +
      "</aside>";
    host.appendChild(layer);

    layer.querySelector(".civi-city-detail-close")?.addEventListener("click", closeDetail);
    return layer;
  }

  function markersHost() {
    const layer = ensureLayer();
    return layer ? layer.querySelector(".civi-city-markers") : null;
  }

  function detailEl() {
    const layer = ensureLayer();
    return layer ? layer.querySelector(".civi-city-detail") : null;
  }

  function selfEl() {
    const layer = ensureLayer();
    return layer ? layer.querySelector(".civi-city-self") : null;
  }

  function closeDetail() {
    const detail = detailEl();
    if (!detail) return;
    detail.setAttribute("hidden", "");
    markersHost()?.querySelectorAll(".is-selected").forEach((n) => n.classList.remove("is-selected"));
  }

  function setPos(el, xy) {
    el.style.left = (xy.x * 100).toFixed(2) + "%";
    el.style.top = (xy.y * 100).toFixed(2) + "%";
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  let _model = null;
  let rendering = false;

  async function render() {
    const eng = engine();
    const mh = markersHost();
    if (!eng || !mh) return;
    if (rendering) return;
    rendering = true;

    try {
      _model = await eng.getCityModel();
    } catch (e) {
      console.warn("[CivicationCityLayer] kunne ikke bygge bymodell:", (e && e.message) || e);
      rendering = false;
      return;
    }

    const { phase, locations, friends } = _model;
    mh.innerHTML = "";

    // Spilleren er i aktiv fase og ser på byen -> lagre spillerens egen
    // fase-status for nettopp denne fasen (deterministisk standard for fasen).
    capturePlayerSnapshot();
    renderSelfStatus();

    // 1) Stedsmarkører.
    (locations || []).forEach((loc) => {
      const active = eng.isLocationActive(loc, phase);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "civi-city-place" + (active ? " is-active" : "") + (loc.type === "friend_home" ? " is-friend-home" : "");
      btn.setAttribute("data-place-id", String(loc.id || ""));
      btn.innerHTML =
        '<span class="civi-city-place-icon">' + esc(loc.icon || "📍") + "</span>" +
        '<span class="civi-city-place-label">' + esc(loc.label || loc.id || "") + "</span>";
      setPos(btn, locationXY(loc));
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openPlaceDetail(String(loc.id || ""));
      });
      mh.appendChild(btn);
    });

    // 2) Vennefigurer – grupper pr. sted for å spre dem litt.
    const visible = (friends || []).filter((row) => row.presence && row.presence.visibleOnMap);
    const byLocation = {};
    visible.forEach((row) => {
      const id = String(row.presence.locationId || "");
      (byLocation[id] = byLocation[id] || []).push(row);
    });

    Object.keys(byLocation).forEach((locId) => {
      const group = byLocation[locId];
      const loc = eng.locationById(locations, locId);
      const base = loc ? locationXY(loc) : { x: 0.5, y: 0.5 };
      group.forEach((row, index) => {
        // Deterministisk liten forskyvning rundt stedet (sirkel).
        const angle = (index / Math.max(1, group.length)) * Math.PI * 2;
        const ring = group.length > 1 ? 0.028 : 0;
        const xy = { x: base.x + Math.cos(angle) * ring, y: base.y + Math.sin(angle) * ring + 0.03 };
        mh.appendChild(buildFriendMarker(row, xy));
      });
    });
  }

  function buildFriendMarker(row, xy) {
    const friend = row.friend || {};
    const presence = row.presence || {};
    const color = (friend.avatar && friend.avatar.color) || "#cfd6e0";
    const initial = String(friend.name || "?").trim().charAt(0).toUpperCase();

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "civi-city-friend is-" + esc(presence.state || "at_home");
    btn.setAttribute("data-friend-id", String(friend.id || ""));
    btn.innerHTML =
      '<span class="civi-city-friend-figure" style="--friend-color:' + esc(color) + '">' + esc(initial) + "</span>" +
      '<span class="civi-city-friend-tag">' + esc(friend.name || "") +
      '<small>' + esc(presence.lastSeenText || presence.statusText || "") + "</small></span>";
    setPos(btn, xy);
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openFriendDetail(String(friend.id || ""));
    });
    return btn;
  }

  // ---------------------------------------------------------------------------
  // Spillerens eget fase-minne (player phase snapshot)
  // ---------------------------------------------------------------------------
  // Lagrer spillerens egen siste status for den aktive fasen. currentState kan
  // overstyre sted/aktivitet/kanal (f.eks. når et bestemt sted brukes); resten
  // fylles deterministisk av motoren. Lokalt minne/localStorage, ingen backend.
  function capturePlayerSnapshot(currentState) {
    const eng = engine();
    if (!eng || typeof eng.capturePlayerPhaseSnapshot !== "function") return null;
    const snapshotPhase = _model ? _model.snapshotPhase : null;
    try {
      return eng.capturePlayerPhaseSnapshot(currentState || null, snapshotPhase);
    } catch (_e) {
      return null;
    }
  }

  // Diskret linje: "Denne fasen lagres som din siste arbeidsfase – Arbeidsplass".
  function renderSelfStatus() {
    const eng = engine();
    const el = selfEl();
    if (!eng || !el || !_model) return;

    const snapshotPhase = _model.snapshotPhase;
    const snap = typeof eng.getPlayerSnapshotForPhase === "function"
      ? eng.getPlayerSnapshotForPhase(snapshotPhase)
      : null;

    if (!snap) {
      el.setAttribute("hidden", "");
      el.textContent = "";
      return;
    }

    const phaseLabel = (eng.snapshotPhaseLabel
      ? eng.snapshotPhaseLabel(snapshotPhase)
      : (_model.snapshotPhaseLabel || "")).toLowerCase();
    const loc = eng.locationById(_model.locations, snap.locationId);
    const placeLabel = loc ? loc.label : (snap.locationId || "");

    el.innerHTML =
      '<span class="civi-city-self-icon">📍</span>' +
      '<span class="civi-city-self-text">Denne fasen lagres som din siste ' +
      esc(phaseLabel) + (placeLabel ? ": <strong>" + esc(placeLabel) + "</strong>" : "") +
      "</span>";
    el.removeAttribute("hidden");
  }

  // ---------------------------------------------------------------------------
  // Detalj-paneler
  // ---------------------------------------------------------------------------
  function markSelected(selector) {
    const mh = markersHost();
    if (!mh) return;
    mh.querySelectorAll(".is-selected").forEach((n) => n.classList.remove("is-selected"));
    const el = mh.querySelector(selector);
    if (el) el.classList.add("is-selected");
  }

  function showDetail(html) {
    const detail = detailEl();
    if (!detail) return;
    detail.querySelector(".civi-city-detail-body").innerHTML = html;
    detail.removeAttribute("hidden");
    bindDetailActions(detail);
  }

  function phaseLabel(phase) {
    return window.CivicationCalendar?.getPhaseLabel?.(phase) || String(phase || "");
  }

  function openPlaceDetail(placeId) {
    const eng = engine();
    if (!eng || !_model) return;
    const loc = eng.locationById(_model.locations, placeId);
    if (!loc) return;

    markSelected('[data-place-id="' + cssEscape(placeId) + '"]');

    // Spilleren bruker et sted i den aktive fasen -> oppdater spillerens eget
    // fase-minne så det peker hit (sted + kanal fra stedet). Resten er fasens
    // deterministiske standard.
    capturePlayerSnapshot({ locationId: String(loc.id || ""), channel: String(loc.channel || "") });
    renderSelfStatus();

    // Venner her = de hvis aktive fase-minne (snapshot/fallback) peker hit.
    const here = (_model.friends || []).filter((r) =>
      r.presence && r.presence.visibleOnMap && String(r.presence.locationId || "") === String(placeId));
    const active = eng.isLocationActive(loc, _model.phase);

    const activitiesHtml = (Array.isArray(loc.availableActivities) ? loc.availableActivities : [])
      .map((a) => '<span class="civi-city-chip">' + esc(activityLabel(a)) + "</span>")
      .join("");

    const friendsHtml = here.length
      ? here.map((r) =>
          '<li><strong>' + esc(r.friend.name) + "</strong> – " + esc(r.presence.statusText) +
          (r.presence.activity ? " (" + esc(r.presence.activity) + ")" : "") + "</li>"
        ).join("")
      : "<li class=\"muted\">Ingen venner her akkurat nå.</li>";

    const channelHint = CHANNEL_HINTS[String(loc.channel || "")] || "";
    const relatedSection = String(loc.relatedSection || "");

    showDetail(
      '<div class="civi-city-detail-kicker">' + esc(loc.icon || "📍") + " Sted · " + esc(phaseLabel(loc.phase)) + "</div>" +
      "<h3>" + esc(loc.label || loc.id) + "</h3>" +
      '<p class="civi-city-detail-desc">' + esc(loc.description || "") + "</p>" +
      '<div class="civi-city-detail-status' + (active ? " is-active" : "") + '">' +
        (active ? "Aktivt i denne fasen" : "Roligere i denne fasen") + "</div>" +
      (activitiesHtml ? '<div class="civi-city-detail-section"><h4>Aktiviteter</h4><div class="civi-city-chips">' + activitiesHtml + "</div></div>" : "") +
      '<div class="civi-city-detail-section"><h4>Venner her</h4><ul class="civi-city-detail-list">' + friendsHtml + "</ul></div>" +
      (channelHint ? '<p class="civi-city-detail-hint">' + esc(channelHint) + "</p>" : "") +
      (relatedSection ? '<div class="civi-city-detail-actions"><button type="button" class="civi-btn" data-civi-goto-section="' + esc(relatedSection) + '">Åpne i Civication</button></div>' : "")
    );
  }

  function openFriendDetail(friendId) {
    const eng = engine();
    if (!eng || !_model) return;
    const row = (_model.friends || []).find((r) => String(r.friend && r.friend.id) === String(friendId));
    if (!row) return;

    markSelected('[data-friend-id="' + cssEscape(friendId) + '"]');
    showDetail(buildFriendDetailHtml(row, _model));
  }

  // Ren funksjon: bygger HTML for vennens profilkort i byen. Tar (row, model)
  // eksplisitt så den kan enhetstestes headless (ingen DOM, ingen fetch). All
  // tekst hentes fra de deterministiske motorhjelperne – dette er fase-minne,
  // ikke live-posisjon.
  function buildFriendDetailHtml(row, model) {
    const eng = engine();
    const friend = (row && row.friend) || {};
    const presence = (row && row.presence) || {};
    const avatar = friend.avatar || {};
    const locations = (model && model.locations) || [];

    const homeLoc = eng ? eng.locationById(locations, avatar.homeId) : null;
    const snapshotLoc = eng ? eng.locationById(locations, presence.locationId) : null;

    // Aktiv semantisk fase som spilleren selv er i (fase-minne, ikke live).
    const snapshotPhase = presence.phase || (model && model.snapshotPhase) || "morning";
    const phaseLbl = friendPhaseLabel(snapshotPhase) || presence.snapshotPhaseLabel ||
      (model && model.snapshotPhaseLabel) || "";
    const lastSeen = presence.lastSeenText || (phaseLbl ? "Siste " + phaseLbl.toLowerCase() : "");
    const hasHistory = presence.source !== "none";
    const firstName = String(friend.name || "Vennen").trim().split(/\s+/)[0] || "Vennen";

    // 1) Header-statuslinje: tydelig at dette er SISTE fase-status.
    const headerStatus = hasHistory
      ? lastSeen || "Siste fase"
      : "Ingen fasehistorikk ennå for denne fasen.";

    // 2) Livstegn: hvor, hva og hvilken stemning vennen sist hadde i fasen.
    const placeLabel = snapshotLoc ? snapshotLoc.label : (presence.locationId || "—");
    const lifeRows = hasHistory
      ? (row2("Sted", placeLabel) +
         row2("Aktivitet", presence.activity || "—") +
         (presence.mood ? row2("Stemning", presence.mood) : "") +
         (presence.updatedAtLabel ? row2("Oppdatert", presence.updatedAtLabel) : ""))
      : '<p class="civi-city-detail-list muted">' + esc(firstName) +
        " har ikke lagret denne fasen ennå.</p>";

    // 3) Figur: utseende og hvordan vennen beveger seg i byen.
    const figureRows =
      row2("Klær/stil", [avatar.clothes, avatar.style].filter(Boolean).join(" · ")) +
      row2("Transport", avatar.vehicle) +
      row2("Hjem", homeLoc ? homeLoc.label : (avatar.homeId || "—"));

    // 4) Relasjon: nivå + kort sosial tekst.
    const rel = Number(friend.relationshipLevel || 0);
    const relText = "Nivå " + rel + " · " + relationshipLabel(rel);
    const relBlurb = relationshipBlurb(rel);

    // Disclosure: skiller fase-minne fra live-sporing.
    const disclosure = hasHistory
      ? friendDisclosure(firstName, snapshotPhase)
      : esc(firstName) + " har ingen lagret " +
        esc((phaseLbl || "fase").toLowerCase()) + " i Civication ennå.";

    const fid = esc(friend.id);
    const fname = esc(friend.name || "");
    const fphase = esc(snapshotPhase);
    function actionBtn(action, label, extra) {
      return '<button type="button" class="civi-btn" data-civi-friend-action="' + action +
        '" data-friend-id="' + fid + '" data-friend-name="' + fname +
        '" data-friend-phase="' + fphase + '"' + (extra || "") + ">" + esc(label) + "</button>";
    }

    return (
      // 1) Header
      '<div class="civi-city-detail-kicker">👤 Venn</div>' +
      "<h3>" + esc(friend.name || "") + (friend.role ? " — " + esc(friend.role) : "") + "</h3>" +
      '<div class="civi-city-detail-status' + (hasHistory && presence.visibleOnMap ? " is-active" : "") + '">' +
        esc(headerStatus) + "</div>" +
      // 2) Livstegn
      '<div class="civi-city-detail-section"><h4>Livstegn</h4>' +
        '<div class="civi-city-detail-grid">' + lifeRows + "</div></div>" +
      // 3) Figur
      '<div class="civi-city-detail-section"><h4>Figur</h4>' +
        '<div class="civi-city-detail-grid">' + figureRows + "</div></div>" +
      // 4) Relasjon
      '<div class="civi-city-detail-section civi-friend-relation"><h4>Relasjon</h4>' +
        '<div class="civi-city-detail-status">' + esc(relText) + "</div>" +
        (relBlurb ? '<p class="civi-friend-relation-blurb">' + esc(relBlurb) + "</p>" : "") +
      "</div>" +
      // Disclosure (fase-minne, ikke live)
      '<p class="civi-city-detail-hint">' + disclosure + "</p>" +
      // 5) Handlinger – stabile data-attributter/event hooks
      '<div class="civi-city-detail-actions">' +
        actionBtn("message", "Send melding") +
        actionBtn("visit", "Besøk") +
        actionBtn("invite", "Inviter") +
        actionBtn("profile", "Se profil", ' data-civi-goto-section="civiPeopleSection"') +
      "</div>" +
      '<p class="civi-city-detail-feedback" data-friend-feedback hidden></p>'
    );
  }

  function row2(label, value) {
    return '<div class="civi-city-detail-cell"><span>' + esc(label) + "</span><strong>" + esc(value || "—") + "</strong></div>";
  }

  // Tynne wrappere som foretrekker motorens deterministiske hjelpere, med
  // trygg fallback hvis motoren ikke er lastet ennå.
  function friendPhaseLabel(phase) {
    const eng = engine();
    return eng && typeof eng.getPhaseLabel === "function" ? eng.getPhaseLabel(phase) : "";
  }

  function relationshipLabel(level) {
    const eng = engine();
    if (eng && typeof eng.getRelationshipLabel === "function") return eng.getRelationshipLabel(level);
    if (level >= 3) return "nær venn";
    if (level === 2) return "venn";
    if (level === 1) return "bekjent";
    return "ny kontakt";
  }

  function relationshipBlurb(level) {
    const eng = engine();
    if (eng && typeof eng.getRelationshipBlurb === "function") return eng.getRelationshipBlurb(level);
    return "";
  }

  function friendDisclosure(friendName, phase) {
    const eng = engine();
    if (eng && typeof eng.getSnapshotDisclosureText === "function") {
      return esc(eng.getSnapshotDisclosureText(friendName, phase));
    }
    return esc(friendName) + "s siste lagrede fase i Civication – simulert fasehistorikk, ikke live-posisjon.";
  }

  // CSS.escape-fallback for attributtselektorer.
  function cssEscape(value) {
    const s = String(value == null ? "" : value);
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(s);
    return s.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  // ---------------------------------------------------------------------------
  // Detalj-handlinger
  // ---------------------------------------------------------------------------
  function bindDetailActions(detail) {
    detail.querySelectorAll("[data-civi-goto-section]").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const id = btn.getAttribute("data-civi-goto-section");
        gotoSection(id);
      });
    });

    detail.querySelectorAll("[data-civi-friend-action]").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        handleFriendAction(detail, {
          action: btn.getAttribute("data-civi-friend-action"),
          friendId: btn.getAttribute("data-friend-id"),
          friendName: btn.getAttribute("data-friend-name"),
          phase: btn.getAttribute("data-friend-phase")
        });
      });
    });
  }

  function gotoSection(sectionId) {
    const id = String(sectionId || "").trim();
    if (!id) return;
    // Lukk kartmodus slik at panelene er synlige, og scroll til seksjonen.
    document.body.classList.remove("civi-mapmode");
    closeDetail();
    const el = document.getElementById(id);
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Lokale, utkastede invitasjoner (ren lokal spillhandling, ingen backend).
  const _friendInvites = [];

  // Datadrevet action-router: oversetter en knappetrykk i vennens profilkort til
  // riktig sosial spillflyt via motorens rene handleFriendAction. Viser tydelig
  // respons i kartlaget og sender stabile event-hooks. Muterer ikke jobbmail/
  // innboks direkte – sosial flyt holdes adskilt.
  function handleFriendAction(detail, info) {
    const eng = engine();
    const action = String((info && info.action) || "").toLowerCase();
    const friendId = info && info.friendId;
    const row = _model && (_model.friends || [])
      .find((r) => String(r.friend && r.friend.id) === String(friendId));
    const phase = (info && info.phase) || (_model && _model.snapshotPhase) || "morning";

    let result = null;
    if (eng && typeof eng.handleFriendAction === "function") {
      result = eng.handleFriendAction(action, friendId, {
        phase,
        friends: _model ? (_model.friends || []).map((r) => r.friend) : null,
        snapshots: _model ? _model.snapshots : null,
        locations: _model ? _model.locations : null,
        dayIndex: _model ? _model.dayIndex : 1
      });
    }

    const model = (result && result.model) || null;
    const name = (model && model.friendName) ||
      (info && info.friendName) || (row ? row.friend.name : "vennen");

    // 1) Tydelig respons i kartlaget (fase-minne-tekst, ikke live-posisjon).
    let feedbackText = model ? model.resultText : "";
    if (action === "visit" && model && model.lastActivity) {
      feedbackText += " Sist sett her: " + model.lastActivity + ".";
    }
    const feedback = detail.querySelector("[data-friend-feedback]");
    if (feedback && feedbackText) {
      feedback.textContent = feedbackText;
      feedback.removeAttribute("hidden");
    }

    // 2) Handlingsspesifikke effekter.
    if (result && result.ok && model) {
      if (action === "message") {
        dispatchOpenPrivateMessage(model);
      } else if (action === "visit") {
        performFriendVisit(model);
      } else if (action === "invite") {
        storeFriendInvite(model);
      }
      // "profile" navigerer til folk-seksjonen via egen goto-handler; modellen
      // sendes med i event-hooken under for framtidig full profilflate.
    }

    // 3) Stabil, bakoverkompatibel event-hook for andre systemer.
    try {
      window.dispatchEvent(new CustomEvent("civi:friendAction", {
        detail: {
          action,
          friendId,
          friendName: name,
          snapshotPhase: (info && info.phase) || (row && row.presence ? row.presence.phase : null),
          phase: _model ? _model.phase : null,
          locationId: model ? model.locationId : (row ? row.presence.locationId : null),
          model
        }
      }));
    } catch (_e) {}
  }

  // Send melding: stabil event-hook for et framtidig privat meldingssystem.
  function dispatchOpenPrivateMessage(model) {
    try {
      window.dispatchEvent(new CustomEvent("civi:openPrivateMessage", {
        detail: {
          friendId: model.friendId,
          friendName: model.friendName,
          phase: model.phase,
          status: model.status,
          source: "civicationCityLayer"
        }
      }));
    } catch (_e) {}
  }

  // Besøk: marker vennens siste simulerte sted på kartet (fase-minne). Beholder
  // vennekortet åpent slik at fase-minne-teksten fortsatt vises.
  function performFriendVisit(model) {
    const locId = model && model.locationId;
    if (!locId) return;
    const eng = engine();
    const loc = eng && _model ? eng.locationById(_model.locations, locId) : null;
    if (loc) {
      markSelected('[data-place-id="' + cssEscape(locId) + '"]');
    }
  }

  // Inviter: lager lokal invitasjonsstate (drafted). Ingen backend.
  function storeFriendInvite(model) {
    if (!model) return null;
    const invite = {
      friendId: model.friendId,
      phase: model.phase,
      locationId: model.locationId,
      intent: "invite",
      label: model.label,
      status: "drafted"
    };
    _friendInvites.push(invite);
    return invite;
  }

  function getFriendInvites() {
    return _friendInvites.slice();
  }

  // ---------------------------------------------------------------------------
  // Init / events
  // ---------------------------------------------------------------------------
  let renderQueued = false;
  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      render();
    });
  }

  function init() {
    ensureLayer();
    scheduleRender();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  ["civi:booted", "civi:dataReady", "civi:dayPhaseChanged", "civi:homeChanged", "updateProfile"]
    .forEach((ev) => window.addEventListener(ev, scheduleRender));

  // Tegn på nytt (og lukk evt. detalj) når kartmodus åpnes/lukkes.
  document.getElementById("btnCiviMap")?.addEventListener("click", function () {
    setTimeout(function () {
      if (!document.body.classList.contains("civi-mapmode")) closeDetail();
      scheduleRender();
    }, 30);
  });

  window.CivicationCityLayer = {
    render,
    scheduleRender,
    openPlaceDetail,
    openFriendDetail,
    buildFriendDetailHtml,
    getFriendInvites,
    closeDetail
  };
})();
