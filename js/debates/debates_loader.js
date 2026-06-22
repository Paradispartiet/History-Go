// js/debates/debates_loader.js
// HGDebatesContent — History Go debatt-flate (innhold + view). Holder innhold adskilt fra
// signalet: js/hgDebates.js eier hg_debate_log_v1 (HGDebates.record/log). Denne modulen laster
// debatt-data, viser én debatt (#/debate/:id via HGMapView.openDebate eller PlaceCard-knapp),
// og kaller HGDebates.record(...) ved deltakelse og standpunktsvalg. Civication-broen leser
// signalet og fullfører history_go_debate-oppgaver.
// Se docs/CIVICATION_HISTORY_GO_DEBATE_SURFACE.md.
(function () {
  "use strict";

  const MANIFEST = "data/debates/manifest.json";

  let byId = {};
  let byPlace = {};
  let initPromise = null;

  function norm(v) {
    return String(v == null ? "" : v).trim();
  }

  function esc(v) {
    return norm(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  async function fetchJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`[HGDebatesContent] ${path} HTTP ${res.status}`);
    return res.json();
  }

  function indexDebate(debate) {
    const id = norm(debate && debate.id);
    if (!id) return;
    byId[id] = debate;
    const placeId = norm(debate.place_id);
    if (placeId) {
      (byPlace[placeId] = byPlace[placeId] || []).push(debate);
    }
  }

  async function init() {
    if (initPromise) return initPromise;
    initPromise = (async function () {
      byId = {};
      byPlace = {};
      const manifest = await fetchJson(MANIFEST);
      const files = Array.isArray(manifest && manifest.files) ? manifest.files : [];
      const payloads = await Promise.all(
        files.map(function (f) { return fetchJson(String(f)).catch(function () { return []; }); })
      );
      payloads.forEach(function (list) {
        (Array.isArray(list) ? list : []).forEach(indexDebate);
      });
    })();
    return initPromise;
  }

  function getById(id) {
    return byId[norm(id)] || null;
  }

  function getByPlace(placeId) {
    return byPlace[norm(placeId)] || [];
  }

  // Lesbar etikett for en Civication-konfliktakse. Aksene har ingen label-registry, så vi
  // utleder deterministisk fra id-en: "bevaring_vs_utvikling" -> "Bevaring vs. utvikling".
  function conflictLabel(id) {
    const raw = norm(id);
    if (!raw) return "";
    const sides = raw.split("_vs_");
    const human = sides
      .map(function (side) { return side.replace(/_/g, " ").trim(); })
      .filter(Boolean)
      .join(" vs. ");
    return human ? human.charAt(0).toUpperCase() + human.slice(1) : raw;
  }

  // Lesbar etikett for én pol av en akse: "myke_trafikanter" -> "Myke trafikanter",
  // "midt" -> "Midt imellom".
  function poleLabel(pole) {
    const p = norm(pole);
    if (!p) return "";
    if (p === "midt") return "Midt imellom";
    const human = p.replace(/_/g, " ").trim();
    return human.charAt(0).toUpperCase() + human.slice(1);
  }

  // Spillerens tendens på en konfliktakse: teller registrerte standpunkt (via HGDebates) på
  // tvers av alle debatter som deler conflict_id, og mapper hvert valg til sin pol.
  function leaning(conflictId) {
    const cId = norm(conflictId);
    const sides = cId.split("_vs_");
    const out = {
      conflictId: cId,
      poleA: sides[0] || "",
      poleB: sides[1] || "",
      counts: {},
      total: 0,
      lean: null
    };
    if (!cId) return out;
    out.counts[out.poleA] = 0;
    out.counts[out.poleB] = 0;
    out.counts.midt = 0;
    Object.keys(byId).forEach(function (did) {
      const debate = byId[did];
      if (!debate || norm(debate.conflict_id) !== cId) return;
      let chosen = "";
      try {
        const row = window.HGDebates && window.HGDebates.getById ? window.HGDebates.getById(did) : null;
        chosen = row && row.position ? norm(row.position) : "";
      } catch {}
      if (!chosen) return;
      const pos = (debate.positions || []).find(function (p) { return norm(p.id) === chosen; });
      const pole = pos ? norm(pos.pole) : "";
      if (pole && Object.prototype.hasOwnProperty.call(out.counts, pole)) {
        out.counts[pole] += 1;
        out.total += 1;
      }
    });
    const a = out.counts[out.poleA];
    const b = out.counts[out.poleB];
    const mid = out.counts.midt;
    if (out.total === 0) out.lean = null;
    else if (mid > a && mid > b) out.lean = "midt";
    else if (a > b) out.lean = out.poleA;
    else if (b > a) out.lean = out.poleB;
    else out.lean = "midt";
    out.distribution = [
      { pole: out.poleA, label: poleLabel(out.poleA), count: a },
      { pole: out.poleB, label: poleLabel(out.poleB), count: b },
      { pole: "midt", label: poleLabel("midt"), count: mid }
    ];
    return out;
  }

  // Spillerens tendens på tvers av alle konfliktakser som finnes i debatt-dataene. Tar bare med
  // akser der spilleren faktisk har tatt standpunkt (total >= 1), sortert etter engasjement.
  function leaningAll() {
    const seen = {};
    Object.keys(byId).forEach(function (did) {
      const cId = norm(byId[did] && byId[did].conflict_id);
      if (cId) seen[cId] = true;
    });
    return Object.keys(seen)
      .map(function (cId) { return leaning(cId); })
      .filter(function (l) { return l.total >= 1; })
      .sort(function (a, b) { return b.total - a.total; });
  }

  function overviewDistribution(l) {
    const counts = l && l.counts ? l.counts : {};
    const items = Array.isArray(l && l.distribution) ? l.distribution : [
      { pole: l && l.poleA, label: poleLabel(l && l.poleA), count: counts[l && l.poleA] || 0 },
      { pole: l && l.poleB, label: poleLabel(l && l.poleB), count: counts[l && l.poleB] || 0 },
      { pole: "midt", label: poleLabel("midt"), count: counts.midt || 0 }
    ];
    return items.map(function (item) {
      return esc(item.label) + " " + esc(item.count);
    }).join(" · ");
  }

  function overviewHtml() {
    const rows = leaningAll();
    const body = rows.length
      ? rows.map(function (l) {
          const lean = l.lean === "midt" ? "Midt imellom" : poleLabel(l.lean);
          return (
            `<div class="hg-debate-overview__row">` +
            `<div class="hg-debate-overview__main">` +
            `<div class="hg-debate-overview__axis">⚖️ ${esc(conflictLabel(l.conflictId))}</div>` +
            `<div class="hg-debate-overview__distribution">${overviewDistribution(l)}</div>` +
            `</div>` +
            `<div class="hg-debate-overview__summary">` +
            `<div class="hg-debate-overview__lean">${esc(lean)}</div>` +
            `<div class="hg-debate-overview__count">${esc(l.total)} standpunkt</div>` +
            `</div>` +
            `</div>`
          );
        }).join("")
      : `<p class="hg-debate-overview__empty">Du har ikke tatt standpunkt i noen debatter ennå.</p>`;
    return (
      `<div class="hg-debate-overview">` +
      `<h2 class="hg-debate__title">Dine debatt-tendenser</h2>` +
      `<p class="hg-debate-overview__intro">Hvor valgene dine lener seg på Civications verdikonflikter.</p>` +
      body +
      `</div>`
    );
  }

  function openOverview() {
    ensureStyles();
    const popupFn = window.makePopup || (typeof makePopup === "function" ? makePopup : null);
    if (typeof popupFn !== "function") {
      window.showToast?.("Popup-systemet er ikke lastet");
      return false;
    }
    popupFn(overviewHtml(), "hg-debate-popup");
    return true;
  }

  function debateHtml(debate, priorPosition, tendencyText) {
    const context = Array.isArray(debate.context) ? debate.context : [];
    const positions = Array.isArray(debate.positions) ? debate.positions : [];
    const conflict = norm(debate.conflict_id);
    const prior = norm(priorPosition);
    const priorLabel = prior
      ? ((positions.find(function (p) { return norm(p.id) === prior; }) || {}).label || prior)
      : "";
    return (
      `<div class="hg-debate">` +
      `<h2 class="hg-debate__title">${esc(debate.title || debate.question || "Debatt")}</h2>` +
      (conflict
        ? `<div class="hg-debate__conflict" title="Knyttet til en Civication-verdikonflikt">` +
          `⚖️ <span class="hg-debate__conflict-label">${esc(conflictLabel(conflict))}</span></div>`
        : "") +
      (norm(tendencyText)
        ? `<div class="hg-debate__tendency">📊 <span>${esc(tendencyText)}</span></div>`
        : "") +
      (debate.question ? `<p class="hg-debate__question">${esc(debate.question)}</p>` : "") +
      context.map(function (line) { return `<p class="hg-debate__context">${esc(line)}</p>`; }).join("") +
      `<div class="hg-debate__positions">` +
      positions.map(function (pos) {
        const isChosen = prior && norm(pos.id) === prior;
        return (
          `<button type="button" class="hg-debate__position${isChosen ? " is-chosen" : ""}" ` +
          (isChosen ? `aria-pressed="true" ` : "") +
          `data-debate-position="${esc(pos.id)}" data-debate-id="${esc(debate.id)}">` +
          `<span class="hg-debate__position-label">${esc(pos.label || pos.id)}</span>` +
          (pos.blurb ? `<span class="hg-debate__position-blurb">${esc(pos.blurb)}</span>` : "") +
          `</button>`
        );
      }).join("") +
      `</div>` +
      `<p class="hg-debate__hint" data-debate-feedback>${prior ? "Du valgte: " + esc(priorLabel) : ""}</p>` +
      `<button type="button" class="hg-debate__overview-link" data-debate-overview>Se alle dine tendenser</button>` +
      `</div>`
    );
  }

  function ensureStyles() {
    if (typeof document === "undefined" || document.getElementById("hgDebateStyles")) return;
    const style = document.createElement("style");
    style.id = "hgDebateStyles";
    style.textContent =
      ".hg-debate{display:flex;flex-direction:column;gap:8px}" +
      ".hg-debate__title{margin:0;font-size:18px}" +
      ".hg-debate__conflict{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;" +
      "padding:3px 10px;border-radius:999px;background:#eef2ff;color:#3730a3;font-size:12px;font-weight:600}" +
      ".hg-debate__tendency{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;" +
      "font-size:12px;font-weight:600;color:#3730a3}" +
      ".hg-debate__question{margin:0;font-weight:600}" +
      ".hg-debate__context{margin:0;opacity:.85;font-size:14px}" +
      ".hg-debate__positions{display:flex;flex-direction:column;gap:8px;margin-top:6px}" +
      ".hg-debate__position{display:flex;flex-direction:column;gap:2px;text-align:left;padding:10px 12px;" +
      "border:1px solid rgba(0,0,0,.15);border-radius:10px;background:#f6f7f9;cursor:pointer}" +
      ".hg-debate__position.is-chosen{border-color:#1d4ed8;background:#e8efff}" +
      ".hg-debate__position-label{font-weight:600}" +
      ".hg-debate__position-blurb{font-size:13px;opacity:.8}" +
      ".hg-debate__hint{margin:4px 0 0;font-size:13px;color:#1d4ed8;min-height:1em}" +
      ".hg-debate__overview-link{align-self:flex-start;margin-top:2px;padding:0;border:0;background:none;" +
      "color:#1d4ed8;font-size:13px;font-weight:600;text-decoration:underline;cursor:pointer}" +
      ".hg-debate-overview{display:flex;flex-direction:column;gap:8px}" +
      ".hg-debate-overview__intro{margin:0;opacity:.85;font-size:14px}" +
      ".hg-debate-overview__empty{margin:6px 0;opacity:.85;font-size:14px}" +
      ".hg-debate-overview__row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;" +
      "padding:8px 0;border-top:1px solid rgba(0,0,0,.08)}" +
      ".hg-debate-overview__main{min-width:0}" +
      ".hg-debate-overview__axis{font-size:13px;color:#3730a3;font-weight:600}" +
      ".hg-debate-overview__distribution{margin-top:2px;font-size:12px;opacity:.72}" +
      ".hg-debate-overview__summary{text-align:right;white-space:nowrap}" +
      ".hg-debate-overview__lean{font-size:14px;font-weight:700}" +
      ".hg-debate-overview__count{font-size:12px;font-weight:400;opacity:.7}";
    document.head?.appendChild(style);
  }

  // Åpne debatten. Registrerer deltakelse umiddelbart; standpunkt registreres ved klikk.
  async function open(id) {
    const debateId = norm(id);
    if (!debateId) return false;
    await init();
    const debate = getById(debateId);
    if (!debate) {
      window.showToast?.("Fant ikke debatten");
      return false;
    }

    // Deltakelse-signal (idempotent i HGDebates).
    try {
      window.HGDebates?.record?.({ debateId: debateId, conflictId: debate.conflict_id || null });
    } catch {}

    // Hent tidligere standpunkt (om noen) så popupen kan vise og forhåndsmarkere valget.
    let priorPosition = "";
    try {
      const row = window.HGDebates?.getById?.(debateId)
        || (debate.conflict_id ? window.HGDebates?.getById?.(debate.conflict_id) : null);
      priorPosition = row && row.position ? row.position : "";
    } catch {}

    // Tendens på aksen vises kun når spilleren har tatt standpunkt i >=2 debatter på samme
    // konflikt — da er det en reell tverr-debatt-lesning, ikke bare gjentakelse av dette valget.
    let tendencyText = "";
    try {
      if (debate.conflict_id) {
        const l = leaning(debate.conflict_id);
        if (l.total >= 2 && l.lean) {
          tendencyText = "Din tendens på aksen: " + poleLabel(l.lean);
        }
      }
    } catch {}

    ensureStyles();
    const popupFn = window.makePopup || (typeof makePopup === "function" ? makePopup : null);
    if (typeof popupFn === "function") {
      popupFn(debateHtml(debate, priorPosition, tendencyText), "hg-debate-popup");
    } else {
      window.showToast?.("Popup-systemet er ikke lastet");
    }
    return true;
  }

  function onClick(ev) {
    const target = ev && ev.target;
    if (!target || typeof target.closest !== "function") return;
    if (target.closest("[data-debate-overview]")) {
      openOverview();
      return;
    }
    const btn = target.closest("[data-debate-position]");
    if (!btn) return;
    const debateId = norm(btn.getAttribute("data-debate-id"));
    const position = norm(btn.getAttribute("data-debate-position"));
    if (!debateId || !position) return;
    try {
      window.HGDebates?.record?.({ debateId: debateId, position: position });
    } catch {}
    const host = btn.closest(".hg-debate");
    const feedback = host && host.querySelector("[data-debate-feedback]");
    if (feedback) feedback.textContent = "Standpunktet ditt er registrert.";
    const chosen = host && host.querySelectorAll("[data-debate-position]");
    if (chosen) chosen.forEach(function (b) { b.classList.toggle("is-chosen", b === btn); });
  }

  // PlaceCard-inngang: injiser en «Debatter her»-knapp i handlingsraden når stedet har debatter.
  function patchPlaceCard() {
    const original = window.openPlaceCard;
    if (typeof original !== "function" || original.__debatesPatched) return;

    window.openPlaceCard = async function (...args) {
      const result = await original.apply(this, args);
      try {
        await init();
        const place = args[0];
        const placeId = norm(place && place.id);
        const actions = document.querySelector("#placeCard .app-actions");
        const existing = document.getElementById("pcDebate");
        const debates = getByPlace(placeId);
        if (actions && debates.length) {
          const firstId = norm(debates[0].id);
          let btn = /** @type {HTMLButtonElement} */ (existing);
          if (!btn) {
            btn = /** @type {HTMLButtonElement} */ (document.createElement("button"));
            btn.id = "pcDebate";
            btn.type = "button";
            btn.className = "pc-action pc-action-text";
            actions.appendChild(btn);
          }
          btn.textContent = "Debatter her";
          btn.dataset.debateId = firstId;
          btn.onclick = function () { void open(firstId); };
          btn.hidden = false;
        } else if (existing) {
          existing.hidden = true;
        }
      } catch (err) {
        console.warn("[HGDebatesContent PlaceCard]", err);
      }
      return result;
    };

    window.openPlaceCard.__debatesPatched = true;
  }

  function setup() {
    document.addEventListener("click", onClick);
    patchPlaceCard();
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setup, { once: true });
    } else {
      setup();
    }
  }

  window.HGDebatesContent = {
    init,
    getById,
    getByPlace,
    open,
    debateHtml,
    conflictLabel,
    poleLabel,
    leaning,
    leaningAll,
    openOverview,
    overviewHtml
  };
})();
