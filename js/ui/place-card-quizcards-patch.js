(function () {
  "use strict";

  if (window.__HG_PLACE_CARD_QUIZCARDS_PATCHED__ === true) return;
  window.__HG_PLACE_CARD_QUIZCARDS_PATCHED__ = true;

  const FALLBACK_COLLECTIONS = Object.freeze(["litteratur/topp10_lit_kort.json"]);
  const QUIZ_ACCESS_VISITED_VIEW = new Proxy(Object.create(null), {
    get(_target, property) {
      if (property === "toJSON") return () => ({});
      if (typeof property === "symbol") return undefined;
      return true;
    },
    has() {
      return true;
    }
  });

  let collectionsPromise = null;
  let physicalVisitTimer = null;

  const legacySaveVisited = typeof window.saveVisitedFromQuiz === "function"
    ? window.saveVisitedFromQuiz.bind(window)
    : null;

  function escapeHTML(value) {
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

  function normalizeKey(value) {
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

  function pushId(ids, value) {
    const raw = String(value ?? "").trim();
    if (raw) ids.push(raw);
    const normalized = normalizeKey(value);
    if (normalized) ids.push(normalized);
  }

  function collectTargetIds(place) {
    const ids = [];
    pushId(ids, place?.id);
    pushId(ids, place?.name);
    pushId(ids, place?.title);
    pushId(ids, place?.personId);
    pushId(ids, place?.targetId);
    pushId(ids, place?.quiz_profile?.targetId);
    pushId(ids, place?.quiz_profile?.personId);

    if (Array.isArray(place?.people)) {
      for (const person of place.people) {
        if (person && typeof person === "object") {
          pushId(ids, person.id);
          pushId(ids, person.personId);
          pushId(ids, person.targetId);
          pushId(ids, person.name);
          pushId(ids, person.title);
        } else {
          pushId(ids, person);
        }
      }
    }

    const normalized = new Set(ids.map(normalizeKey).filter(Boolean));
    if (
      normalized.has("bjorvika") ||
      normalized.has("deichman_bjorvika") ||
      normalized.has("deichmanske_bjorvika")
    ) {
      ids.push("deichman_bjorvika");
    }

    return [...new Set(ids.filter(Boolean))];
  }

  async function loadCollectionPaths() {
    const loader = window.DataHub?.loadQuizCardsCollection;
    if (typeof loader !== "function") return FALLBACK_COLLECTIONS.slice();

    const manifest = await Promise.resolve(loader("litteratur/manifest.json", { cache: "default" })).catch(() => null);
    const files = Array.isArray(manifest?.collections)
      ? manifest.collections
          .map(file => String(file || "").trim())
          .map(file => file.replace(/^\/+/, ""))
          .map(file => file.replace(/^data\/quizcards\/litteratur\//, ""))
          .filter(Boolean)
      : [];

    return files.length ? files.map(file => `litteratur/${file}`) : FALLBACK_COLLECTIONS.slice();
  }

  async function loadCollections() {
    const loader = window.DataHub?.loadQuizCardsCollection;
    if (typeof loader !== "function") return [];
    if (collectionsPromise) return collectionsPromise;

    collectionsPromise = loadCollectionPaths()
      .then(paths => Promise.all(paths.map(path => Promise.resolve(loader(path, { cache: "default" })).catch(() => null))))
      .then(collections => collections.filter(Boolean))
      .catch(() => []);

    return collectionsPromise;
  }

  async function resolveQuizCard(place) {
    const targetIds = new Set(collectTargetIds(place));
    if (!targetIds.size) return null;

    const collections = await loadCollections();
    for (const collection of collections) {
      const cards = Array.isArray(collection?.cards) ? collection.cards : [];
      for (const card of cards) {
        const rawTarget = String(card?.targetId || "").trim();
        const normalizedTarget = normalizeKey(rawTarget);
        if (rawTarget && (targetIds.has(rawTarget) || targetIds.has(normalizedTarget))) {
          return card;
        }
      }
    }
    return null;
  }

  function prewarmQuizData() {
    if (typeof window.HGQuizLoadAccelerator?.prewarm !== "function") return;
    window.HGQuizLoadAccelerator.prewarm();
  }

  function renderQuizCard(cardData) {
    const questions = Array.isArray(cardData?.questions) ? cardData.questions : [];
    const letters = ["A", "B", "C", "D", "E", "F"];
    const questionItems = questions.map((q) => {
      const options = Array.isArray(q?.options) ? q.options : [];
      const optionsHtml = options.length
        ? `<div class="pc-rendered-quiz-options">${options.map((opt, idx) => `${escapeHTML(letters[idx] || String(idx + 1))}) ${escapeHTML(opt)}`).join(" · ")}</div>`
        : "";
      return `<li>${escapeHTML(q?.question || "")}${optionsHtml}</li>`;
    }).join("");

    const answers = Array.isArray(cardData?.answerKey) && cardData.answerKey.length
      ? cardData.answerKey
      : questions.map((q, idx) => ({ number: q?.number ?? idx + 1, answer: q?.answer }));

    const answerHtml = answers
      .map(entry => `${escapeHTML(entry?.number)}. ${escapeHTML(entry?.answer)}`)
      .join(" · ");

    const title = escapeHTML(cardData?.title || "Quizkort");
    const subtitle = escapeHTML(cardData?.subtitle || `${questions.length} spørsmål · fasit nederst`);

    return `
      <div class="pc-rendered-quiz-card">
        <div class="pc-rendered-quiz-head">
          <div class="pc-rendered-quiz-kicker">Litteraturquiz</div>
          <h3>${title}</h3>
          <p>${subtitle}</p>
        </div>
        <ol class="pc-rendered-quiz-list">${questionItems}</ol>
        <div class="pc-rendered-quiz-answer-key"><strong>Fasit:</strong> ${answerHtml}</div>
      </div>
    `;
  }

  function applyQuizCard(cardData) {
    const flipEl = document.getElementById("pcFrontCardFlip");
    const contentEl = document.getElementById("pcQuizCardContent");
    const imgEl = /** @type {HTMLImageElement|null} */ (document.getElementById("pcQuizCardImage"));
    if (!flipEl || !contentEl || !cardData) return;

    contentEl.innerHTML = renderQuizCard(cardData);
    contentEl.hidden = false;

    if (imgEl) {
      imgEl.alt = "";
      imgEl.style.display = "none";
      if (imgEl.getAttribute("src")) imgEl.removeAttribute("src");
    }

    flipEl.classList.add("has-quiz-card");
    flipEl.setAttribute("aria-label", "Vis quizkort");
  }

  function installPhysicalVisitModel() {
    const model = {
      isVisited(placeId) {
        const id = String(placeId || "").trim();
        return !!(id && window.visited?.[id]);
      },

      record(place) {
        const id = String(place?.id || place || "").trim();
        if (!id) return { ok: false, reason: "missing_place_id" };
        if (this.isVisited(id)) return { ok: true, alreadyVisited: true };
        if (typeof legacySaveVisited !== "function") {
          return { ok: false, reason: "persistence_unavailable" };
        }

        legacySaveVisited(id);
        const ok = this.isVisited(id);
        if (ok) {
          try {
            window.dispatchEvent(new CustomEvent("hg:physicalVisitRegistered", {
              detail: { placeId: id, ts: Date.now() }
            }));
          } catch {}
        }
        return { ok, alreadyVisited: false };
      }
    };

    window.HGPhysicalVisits = Object.assign(window.HGPhysicalVisits || {}, model);

    // Deprecated compatibility entrypoint. Quiz completion must never write
    // physical visit-state. Physical check-in uses HGPhysicalVisits.record().
    window.saveVisitedFromQuiz = function saveVisitedFromQuizDeprecated() {
      return false;
    };
  }

  function patchQuizEngine(engine) {
    if (!engine || engine.__HG_DIGITAL_QUIZ_ACCESS_PATCHED__ === true) return engine;

    const originalInit = engine.init;
    if (typeof originalInit === "function") {
      engine.init = function initWithDigitalQuizAccess(api = {}) {
        return originalInit.call(this, {
          ...api,
          // Compatibility view for the old quiz gate: every valid target is
          // digitally accessible, without mutating physical visited_places.
          getVisited: () => QUIZ_ACCESS_VISITED_VIEW,
          saveVisitedFromQuiz: () => false
        });
      };
    }

    Object.defineProperty(engine, "__HG_DIGITAL_QUIZ_ACCESS_PATCHED__", {
      value: true,
      configurable: true
    });
    return engine;
  }

  function installQuizEngineHook() {
    if (window.QuizEngine) {
      window.QuizEngine = patchQuizEngine(window.QuizEngine);
      return;
    }

    try {
      Object.defineProperty(window, "QuizEngine", {
        configurable: true,
        enumerable: true,
        get() {
          return undefined;
        },
        set(value) {
          Object.defineProperty(window, "QuizEngine", {
            value: patchQuizEngine(value),
            writable: true,
            configurable: true,
            enumerable: true
          });
        }
      });
    } catch (err) {
      console.warn("[quiz-access] kunne ikke installere QuizEngine-hook", err);
    }
  }

  function getPhysicalVisitGate(place) {
    const fallbackRadius = Number(place?.r || 150);
    if (window.TEST_MODE) return { ok: true, d: null, r: fallbackRadius };

    const pos = typeof window.getPos === "function" ? window.getPos() : null;
    if (!pos || typeof window.distMeters !== "function") {
      return { ok: false, d: null, r: fallbackRadius, reason: "no_pos" };
    }

    const targets = typeof window.getPlaceDistanceTargets === "function"
      ? window.getPlaceDistanceTargets(place)
      : [];
    if (!Array.isArray(targets) || !targets.length) {
      return { ok: false, d: null, r: fallbackRadius, reason: "no_anchor" };
    }

    let nearest = null;
    for (const target of targets) {
      const d = window.distMeters(pos, { lat: Number(target.lat), lon: Number(target.lon) });
      const radius = Number(target.r || fallbackRadius);
      if (!Number.isFinite(d) || !Number.isFinite(radius)) continue;
      if (!nearest || d < nearest.d) nearest = { d, r: radius };
      if (d <= radius) return { ok: true, d, r: radius };
    }

    if (!nearest) return { ok: false, d: null, r: fallbackRadius, reason: "no_anchor" };
    return { ok: false, d: nearest.d, r: nearest.r };
  }

  function clearPhysicalVisitTimer() {
    if (!physicalVisitTimer) return;
    clearInterval(physicalVisitTimer);
    physicalVisitTimer = null;
  }

  function patchPhysicalVisitButton(place) {
    clearPhysicalVisitTimer();

    const oldButton = document.getElementById("pcUnlock");
    if (!oldButton || !place) return;

    // Clone removes the old unlock onclick and isolates this button from the
    // legacy timer, whose element reference now points to a detached node.
    const button = /** @type {HTMLButtonElement} */ (oldButton.cloneNode(true));
    oldButton.replaceWith(button);

    const placeId = String(place.id || "").trim();
    const setButton = (disabled, text) => {
      button.disabled = disabled;
      button.textContent = text;
      button.setAttribute("aria-label", text);
    };

    const update = () => {
      if (!button.isConnected) {
        clearPhysicalVisitTimer();
        return;
      }

      if (window.HGPhysicalVisits?.isVisited?.(placeId)) {
        setButton(true, `${tUI("ui.visit.visited", "Besøkt")} ✅`);
        clearPhysicalVisitTimer();
        return;
      }

      const gate = getPhysicalVisitGate(place);
      if (!gate.ok) {
        if (gate.reason === "no_pos") {
          setButton(true, tUI("ui.position.loading", "Henter posisjon…"));
          return;
        }
        if (gate.d != null) {
          const left = Math.max(0, Math.ceil(gate.d - gate.r));
          setButton(true, tfUI("ui.unlock.goCloserMeters", "Gå nærmere: {meters} m", { meters: left }));
          return;
        }
        setButton(true, tUI("ui.unlock.goCloser", "Gå nærmere"));
        return;
      }

      const label = window.TEST_MODE
        ? `${tUI("ui.visit.register", "Registrer besøk")} (test)`
        : tUI("ui.visit.register", "Registrer besøk");
      setButton(false, label);
    };

    button.onclick = () => {
      if (window.HGPhysicalVisits?.isVisited?.(placeId)) {
        window.showToast?.(tUI("ui.visit.alreadyVisited", "Besøket er allerede registrert"));
        update();
        return;
      }

      const gate = getPhysicalVisitGate(place);
      if (!gate.ok) {
        if (gate.reason === "no_pos") {
          window.showToast?.(tUI("ui.position.loading", "Henter posisjon…"));
          return;
        }
        const left = gate.d != null ? Math.max(0, Math.ceil(gate.d - gate.r)) : null;
        window.showToast?.(
          left != null
            ? tfUI("ui.unlock.goCloserMeters", "Gå nærmere: {meters} m", { meters: left })
            : tUI("ui.unlock.goCloser", "Gå nærmere")
        );
        return;
      }

      const result = window.HGPhysicalVisits?.record?.(place) || { ok: false };
      if (!result.ok) {
        window.showToast?.(tUI("ui.visit.saveFailed", "Kunne ikke registrere besøket"));
        return;
      }

      if (typeof window.pulseMarker === "function") {
        window.pulseMarker(place.lat, place.lon);
      }
      window.showToast?.(`${tUI("ui.visit.registered", "Besøk registrert")}: ${place.name} ✅`);
      update();
    };

    update();
    if (!window.TEST_MODE && !window.HGPhysicalVisits?.isVisited?.(placeId)) {
      physicalVisitTimer = setInterval(update, 1200);
    }

    const closeButton = document.getElementById("pcClose");
    closeButton?.addEventListener("click", clearPhysicalVisitTimer, { once: true });
  }

  installPhysicalVisitModel();
  installQuizEngineHook();

  const originalOpenPlaceCard = window.openPlaceCard;
  if (typeof originalOpenPlaceCard !== "function") return;

  window.openPlaceCard = async function patchedOpenPlaceCard(place) {
    const result = await originalOpenPlaceCard.apply(this, arguments);

    // Start alle quizpayloads parallelt mens brukeren leser PlaceCard.
    prewarmQuizData();

    // Quiz er alltid digitalt tilgjengelig. Denne knappen registrerer derimot
    // bare fysisk besøk etter posisjonskontroll.
    patchPhysicalVisitButton(place);

    try {
      const cardData = await resolveQuizCard(place);
      if (cardData) applyQuizCard(cardData);
    } catch (err) {
      console.warn("[place-card-quizcards-patch] kunne ikke aktivere quizkort", err);
    }
    return result;
  };
})();