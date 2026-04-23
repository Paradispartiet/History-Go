(function () {
  "use strict";

  let previousSnapshot = null;
  let latestNarrative = null;

  function normStr(v) {
    return String(v || "").trim();
  }

  function activeCareerId() {
    return normStr(window.CivicationState?.getActivePosition?.()?.career_id);
  }

  function currentSnapshot() {
    const careerId = activeCareerId() || null;
    const snap = window.CivicationPsyche?.getSnapshot?.(careerId) || null;
    const branch = window.CivicationState?.getMailBranchState?.() || {
      preferred_types: [],
      preferred_families: [],
      flags: []
    };

    return {
      psyche: snap,
      branch
    };
  }

  function getTrustValue(snapshot) {
    return Number(snapshot?.psyche?.trust?.value || 0);
  }

  function computeDelta(prev, next) {
    const a = prev?.psyche || {};
    const b = next?.psyche || {};

    return {
      integrity: Number(b.integrity || 0) - Number(a.integrity || 0),
      visibility: Number(b.visibility || 0) - Number(a.visibility || 0),
      economicRoom: Number(b.economicRoom || 0) - Number(a.economicRoom || 0),
      autonomy: Number(b.autonomy || 0) - Number(a.autonomy || 0),
      trust: getTrustValue(next) - getTrustValue(prev),
      flags: (next?.branch?.flags || []).slice(-6)
    };
  }

  function buildNarrative(delta) {
    if (!delta) return null;

    const lines = [];
    const tone = [];

    if (delta.trust >= 2) {
      lines.push("Laget merker at du forsøker å bære mer enn bare tallene.");
      tone.push("Tillit bygges.");
    } else if (delta.trust <= -2) {
      lines.push("Folk registrerer at systemet ble skjermet mer enn menneskene.");
      tone.push("Tillit svekkes.");
    }

    if (delta.integrity >= 2) {
      lines.push("Du står tydeligere i rollen uten å miste grepet om hva som faktisk skjer.");
      tone.push("Du holder linjen.");
    } else if (delta.integrity <= -2) {
      lines.push("Du kjenner at valget kostet mer innvendig enn det så ut som utad.");
      tone.push("Noe skraper i deg.");
    }

    if (delta.visibility >= 2) {
      lines.push("Du får mer kontroll over rommet, men blir også mer eksponert for hva som følger.");
      tone.push("Du blir mer synlig.");
    } else if (delta.visibility <= -1) {
      lines.push("Du valgte det som fungerer, men uten å gjøre deg selv til sentrum for bildet.");
      tone.push("Du holder lavere profil.");
    }

    if (delta.economicRoom <= -1) {
      lines.push("Valget ditt beskytter noe viktig, men gjør handlingsrommet trangere på kort sikt.");
      tone.push("Prisen er reell.");
    } else if (delta.economicRoom >= 1) {
      lines.push("Du kjøper litt rom her og nå, men det er ikke sikkert kostnaden er borte.");
      tone.push("Du vinner pusterom.");
    }

    if (delta.autonomy <= -2) {
      lines.push("Du merker at systemet lukker seg litt rundt deg etter dette valget.");
      tone.push("Rollen strammer seg til.");
    } else if (delta.autonomy >= 2) {
      lines.push("Du står litt friere etter dette, som om valget ga deg mer faktisk plass å jobbe i.");
      tone.push("Handlingsrommet øker.");
    }

    const flags = Array.isArray(delta.flags) ? delta.flags : [];
    if (flags.includes("systemsannhet") || flags.includes("helhetsblikk")) {
      lines.push("Andre begynner å lese deg som en som tåler mer sannhet i styringen.");
    }
    if (flags.includes("maalstyrt_tilpasning") || flags.includes("overflatestyring")) {
      lines.push("Det ser ryddig ut, men under overflaten blir relasjonene tynnere.");
    }
    if (flags.includes("beskytter_baereevne")) {
      lines.push("Noen merker at du valgte bæreevne foran blank fasade.");
    }
    if (flags.includes("bruker_nokkelperson_hardt")) {
      lines.push("Effekten holder seg oppe, men slitasjen får nå et ansikt.");
    }

    if (!lines.length) {
      lines.push("Valget flyttet ikke mye synlig akkurat nå, men retningen er likevel satt.");
    }

    return {
      title: tone.slice(0, 2).join(" ") || "Valget etterlater spor.",
      lines: lines.slice(0, 3)
    };
  }

  function narrativeHtml() {
    if (!latestNarrative) {
      return `
        <div class="civi-narr-box">
          <div class="civi-narr-head">Etterklang</div>
          <div class="civi-narr-muted">Ingen nylig reaksjon registrert ennå.</div>
        </div>
      `;
    }

    return `
      <div class="civi-narr-box">
        <div class="civi-narr-head">Etterklang</div>
        <div class="civi-narr-title">${latestNarrative.title}</div>
        <div class="civi-narr-lines">
          ${latestNarrative.lines.map((line) => `<div class="civi-narr-line">${line}</div>`).join("")}
        </div>
      </div>
    `;
  }

  function ensureStyles() {
    if (document.getElementById("civiNarrativeConsequencesStyle")) return;
    const style = document.createElement("style");
    style.id = "civiNarrativeConsequencesStyle";
    style.textContent = `
      .civi-narr-box{margin:0 0 12px 0;padding:12px 14px;border:1px solid rgba(0,0,0,.12);border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,248,248,.82))}
      .civi-narr-head{font-size:12px;letter-spacing:.04em;text-transform:uppercase;opacity:.65;margin-bottom:6px}
      .civi-narr-title{font-weight:700;margin-bottom:8px}
      .civi-narr-lines{display:flex;flex-direction:column;gap:6px}
      .civi-narr-line{font-size:14px;line-height:1.35}
      .civi-narr-muted{font-size:13px;opacity:.7}
    `;
    document.head.appendChild(style);
  }

  function injectIntoInbox() {
    const host = document.getElementById("civiInbox");
    if (!host || host.querySelector(".civi-narr-box")) return;
    host.insertAdjacentHTML("afterbegin", narrativeHtml());
  }

  function injectIntoWorkday() {
    const host = document.getElementById("civiWorkdayPanel");
    if (!host || host.querySelector(".civi-narr-box")) return;
    host.insertAdjacentHTML("afterbegin", narrativeHtml());
  }

  function patchRenderer(name, injector) {
    const original = window[name];
    if (typeof original !== "function" || original.__civiNarrativeWrapped) return;

    const wrapped = function () {
      const res = original.apply(this, arguments);
      try { injector(); } catch {}
      return res;
    };

    wrapped.__civiNarrativeWrapped = true;
    window[name] = wrapped;
  }

  function setup() {
    ensureStyles();
    patchRenderer("renderCivicationInbox", injectIntoInbox);
    patchRenderer("renderWorkdayPanel", injectIntoWorkday);

    previousSnapshot = currentSnapshot();

    window.addEventListener("updateProfile", function () {
      const next = currentSnapshot();
      const delta = computeDelta(previousSnapshot, next);
      latestNarrative = buildNarrative(delta);
      previousSnapshot = next;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
