(function () {
  "use strict";

  const LS_IDENTITY = "hg_identity_v1";

  const DEFAULT_IDENTITY = {
    focus: {
      economic: 0.3,
      cultural: 0.3,
      social: 0.3,
      symbolic: 0.3,
      subculture: 0.2,
      political: 0.3
    },
    volatility: 0.2, // 0 = stabil, 1 = kaotisk
    lastShift: Date.now()
  };

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function loadIdentity() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_IDENTITY));
    return raw || DEFAULT_IDENTITY;
  } catch (e) {
    return DEFAULT_IDENTITY;
  }
}

  function saveIdentity(identity) {
    localStorage.setItem(LS_IDENTITY, JSON.stringify(identity));
  }

  function getIdentity() {
    return loadIdentity();
  }

  function getBoost(type) {
    const identity = loadIdentity();
    const weight = identity.focus[type] || 0.2;

    // Boost range 0.8–1.2
    return 0.8 + weight * 0.4;
  }

  function getPsycheModifiers() {
  const identity = loadIdentity();
  const focus = identity.focus;

  const values = Object.values(focus);
  const max = Math.max(...values);
  const sorted = [...values].sort((a,b) => b-a);
  const second = sorted[1] || 0;

  const balance = 1 - (max - second); // grov balanseindikator

  return {
    autonomy: max * 10,
    integrity: (second / max) * 10,
    trust: balance * 10,
    visibility: (focus.subculture || 0) * 10
  };
}

function generatePerceptionProfile(data) {

  const {
    economic = 0,
    cultural = 0,
    symbolic = 0,
    social = 0,
    political = 0,
    integrity = 0,
    visibility = 0,
    autonomy = 0,
    dominant = ""
  } = data || {};

  const lines = [];

  // --------------------------------------------------
  // Økonomisk lesning
  // --------------------------------------------------

  if (economic > 70 && visibility > 60) {
    lines.push("Du kan bli oppfattet som ambisiøs og posisjonert i maktsonen.");
  }

  if (economic > 70 && integrity < 40) {
    lines.push("Noen kan lese deg som kalkulerende.");
  }

  if (economic < 30 && autonomy > 60) {
    lines.push("Du kan fremstå som uavhengig av økonomiske spilleregler.");
  }

  // --------------------------------------------------
  // Synlighet
  // --------------------------------------------------

  if (visibility > 75) {
    lines.push("Du er vanskelig å ignorere i offentligheten.");
  }

  if (visibility < 25 && autonomy > 60) {
    lines.push("Du kan oppleves som bevisst utilgjengelig.");
  }

  // --------------------------------------------------
  // Integritet
  // --------------------------------------------------

  if (integrity > 75) {
    lines.push("Du kan bli sett på som prinsippfast.");
  }

  if (integrity < 30 && symbolic > 60) {
    lines.push("Noen kan mene du prioriterer status fremfor substans.");
  }

  // --------------------------------------------------
  // Autonomi
  // --------------------------------------------------

  if (autonomy > 80) {
    lines.push("Du virker lite avhengig av andres anerkjennelse.");
  }

  if (autonomy < 30 && social > 60) {
    lines.push("Du kan fremstå som sosialt avhengig.");
  }

  // --------------------------------------------------
  // Politisk
  // --------------------------------------------------

  if (political > 70) {
    lines.push("Du beveger deg tett på beslutningsrom.");
  }

  // --------------------------------------------------
  // Dominant identitet
  // --------------------------------------------------

  if (dominant === "subkultur") {
    lines.push("Du kan leses som en som opererer i randsonene.");
  }

  if (dominant === "naeringsliv") {
    lines.push("Du kan oppfattes som strategisk orientert.");
  }

  if (dominant === "vitenskap") {
    lines.push("Du kan fremstå analytisk og systemorientert.");
  }

  if (!lines.length) {
    lines.push("Du fremstår foreløpig som udefinert i det sosiale landskapet.");
  }

  return lines;
}
  

  function getPerception(type) {
  const identity = loadIdentity();
  const weight = identity.focus[type] || 0;

  let tier = 0;
  if (weight > 0.6) tier = 3;
  else if (weight > 0.4) tier = 2;
  else if (weight > 0.2) tier = 1;

  return perceptionTexts(type, tier);
}

function perceptionTexts(type, tier) {

  const data = {
    economic: {
      1: [
        "Du fremstår som målrettet.",
        "Du virker orientert mot struktur og fremdrift."
      ],
      2: [
        "Du signaliserer vekst og ambisjon. Noen vil lese deg som strategisk.",
        "Din retning mot økonomisk styrke gjør deg effektiv i konkurransepregede miljøer."
      ],
      3: [
        "Din økonomiske orientering former relasjoner. Du kan bli lest som effektiv – eller instrumentell.",
        "Høy økonomisk retning gir deg gjennomslag, men kan skape avstand i mer verdibaserte miljøer."
      ]
    },

    subculture: {
      1: [
        "Du signaliserer individualitet.",
        "Du virker uavhengig i stil og uttrykk."
      ],
      2: [
        "Du dyrker stil og uavhengighet. Noen vil se deg som fri.",
        "Din retning gir symbolsk særpreg i urbane rom."
      ],
      3: [
        "Din subkulturelle orientering gir sterk symbolsk kapital, men kan skape friksjon i strukturerte miljøer.",
        "Du fremstår som selvstendig og avvisende mot institusjonelle normer."
      ]
    },

    cultural: {
      1: [
        "Du fremstår som estetisk orientert.",
        "Du virker opptatt av form og uttrykk."
      ],
      2: [
        "Du signaliserer dannelse og refleksjon.",
        "Din kulturelle retning gir deg sosial tyngde i kreative miljøer."
      ],
      3: [
        "Din kulturelle kapital gir symbolsk autoritet, men kan oppfattes som distanse.",
        "Du fremstår som normsettende i estetiske sammenhenger."
      ]
    },

    political: {
      1: [
        "Du viser interesse for struktur og makt.",
        "Du virker orientert mot beslutningsrom."
      ],
      2: [
        "Du beveger deg i institusjonelle rom.",
        "Din politiske retning gir deg tilgang til strukturer."
      ],
      3: [
        "Din politiske orientering påvirker hvem som gir deg tilgang – og hvem som holder avstand.",
        "Du fremstår som en aktør i maktstrukturer."
      ]
    }
  };

  const options = data[type]?.[tier];
  if (!options || options.length === 0) return "";

  // Stabil variasjon: basert på weight
  const identity = loadIdentity();
  const weight = identity.focus[type] || 0;

  const index = Math.floor(weight * 10) % options.length;

  return options[index];
}
  
  
  function shiftFocus(type, intensity = 0.05) {
    const identity = loadIdentity();

    if (!identity.focus[type]) {
      identity.focus[type] = 0;
    }

    const delta = intensity * (1 + identity.volatility);

    identity.focus[type] = clamp01(identity.focus[type] + delta);

    // Lett normalisering (unngå at alt går til 1)
    Object.keys(identity.focus).forEach((k) => {
      if (k !== type) {
        identity.focus[k] = clamp01(identity.focus[k] - delta * 0.2);
      }
    });

    identity.lastShift = Date.now();

    saveIdentity(identity);

    return identity;
  }

  function getIdentityState() {
    const identity = loadIdentity();

    const dominant = Object.entries(identity.focus)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      dominant,
      volatility: identity.volatility,
      focus: identity.focus
    };
  }

  window.HG_IdentityCore = {
    getIdentity,
    getBoost,
    shiftFocus,
    getIdentityState,
    getPerception,
    getPsycheModifiers
  };

})();
