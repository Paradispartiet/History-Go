(() => {
  // js/progress/placeProgress.ts
  function normalizePlaceId(value) {
    var _a;
    if (value && typeof value === "object" && "id" in value) {
      return String((_a = value.id) != null ? _a : "").trim();
    }
    return String(value != null ? value : "").trim();
  }
  function createPlaceProgressSnapshot(input) {
    const placeId = normalizePlaceId(input.placeId);
    const quizCompleted = input.quizCompleted === true;
    const physicallyVisited = input.physicallyVisited === true;
    const extraPlaceActionCompleted = input.extraPlaceActionCompleted === true;
    const opened = input.opened === true || quizCompleted || physicallyVisited || extraPlaceActionCompleted;
    const explored = quizCompleted && physicallyVisited;
    const mastered = explored && extraPlaceActionCompleted;
    let status = "unopened";
    if (opened) status = "opened";
    if (physicallyVisited) status = "visited";
    if (quizCompleted) status = "quiz_completed";
    if (explored) status = "explored";
    if (mastered) status = "mastered";
    return {
      placeId,
      opened,
      quizCompleted,
      physicallyVisited,
      extraPlaceActionCompleted,
      explored,
      mastered,
      status
    };
  }

  // js/quiz/quizAccess.ts
  var QUIZ_ACCESS_VISITED_VIEW = new Proxy(
    /* @__PURE__ */ Object.create(null),
    {
      get(_target, property) {
        if (property === "toJSON") return () => ({});
        if (typeof property === "symbol") return void 0;
        return true;
      },
      has() {
        return true;
      }
    }
  );
  function patchQuizEngineForDigitalAccess(engine) {
    if (!engine || engine.__HG_DIGITAL_QUIZ_ACCESS_PATCHED__ === true) return engine;
    const originalInit = engine.init;
    if (typeof originalInit === "function") {
      engine.init = function initWithDigitalQuizAccess(api = {}) {
        return originalInit.call(this, {
          ...api,
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
  function installDigitalQuizAccess(runtime) {
    if (runtime.QuizEngine) {
      runtime.QuizEngine = patchQuizEngineForDigitalAccess(runtime.QuizEngine) || void 0;
      return;
    }
    try {
      Object.defineProperty(runtime, "QuizEngine", {
        configurable: true,
        enumerable: true,
        get() {
          return void 0;
        },
        set(value) {
          Object.defineProperty(runtime, "QuizEngine", {
            value: patchQuizEngineForDigitalAccess(value),
            writable: true,
            configurable: true,
            enumerable: true
          });
        }
      });
    } catch (error) {
      console.warn("[quiz-access] kunne ikke installere QuizEngine-hook", error);
    }
  }

  // js/visits/physicalVisits.ts
  function asPlaceId(place) {
    return normalizePlaceId(place);
  }
  function createPhysicalVisitService(runtime, legacySaveVisited) {
    const isVisited = (placeId) => {
      var _a;
      const id = normalizePlaceId(placeId);
      return Boolean(id && ((_a = runtime.visited) == null ? void 0 : _a[id]));
    };
    const toProgress = (placeId, input = {}) => {
      var _a;
      const id = normalizePlaceId(placeId);
      return createPlaceProgressSnapshot({
        ...input,
        placeId: id,
        opened: (_a = input.opened) != null ? _a : true,
        physicallyVisited: isVisited(id)
      });
    };
    const record = (place) => {
      const placeId = asPlaceId(place);
      if (!placeId) return { ok: false, reason: "missing_place_id" };
      if (isVisited(placeId)) return { ok: true, alreadyVisited: true, placeId };
      if (typeof legacySaveVisited !== "function") {
        return { ok: false, reason: "persistence_unavailable", placeId };
      }
      try {
        legacySaveVisited(placeId);
      } catch {
        return { ok: false, reason: "persistence_failed", placeId };
      }
      const ok = isVisited(placeId);
      if (!ok) return { ok: false, reason: "persistence_failed", placeId };
      try {
        runtime.dispatchEvent(
          new CustomEvent("hg:physicalVisitRegistered", {
            detail: { placeId, ts: Date.now() }
          })
        );
      } catch {
      }
      return { ok: true, alreadyVisited: false, placeId };
    };
    return { isVisited, record, toProgress };
  }
  function installPhysicalVisitModel(runtime, legacySaveVisited) {
    const service = createPhysicalVisitService(runtime, legacySaveVisited);
    runtime.HGPhysicalVisits = Object.assign(runtime.HGPhysicalVisits || {}, service);
    runtime.saveVisitedFromQuiz = function saveVisitedFromQuizDeprecated() {
      return false;
    };
    return runtime.HGPhysicalVisits;
  }
  function getPhysicalVisitGate(runtime, place) {
    var _a;
    const fallbackRadius = Number((place == null ? void 0 : place.r) || 150);
    if (runtime.TEST_MODE) return { ok: true, d: null, r: fallbackRadius };
    const pos = typeof runtime.getPos === "function" ? runtime.getPos() : null;
    if (!pos || typeof runtime.distMeters !== "function") {
      return { ok: false, d: null, r: fallbackRadius, reason: "no_pos" };
    }
    const rawTargets = typeof runtime.getPlaceDistanceTargets === "function" ? runtime.getPlaceDistanceTargets(place) : [];
    const targets = Array.isArray(rawTargets) ? rawTargets : [];
    if (!targets.length) {
      return { ok: false, d: null, r: fallbackRadius, reason: "no_anchor" };
    }
    let nearest = null;
    for (const target of targets) {
      const lon = Number((_a = target.lon) != null ? _a : target.lng);
      const d = runtime.distMeters(pos, { lat: Number(target.lat), lon });
      const radius = Number(target.r || fallbackRadius);
      if (!Number.isFinite(d) || !Number.isFinite(radius)) continue;
      if (!nearest || d < nearest.d) nearest = { d, r: radius };
      if (d <= radius) return { ok: true, d, r: radius };
    }
    if (!nearest) {
      return { ok: false, d: null, r: fallbackRadius, reason: "no_anchor" };
    }
    return { ok: false, d: nearest.d, r: nearest.r, reason: "too_far" };
  }

  // js/ui/placeQuizCards.ts
  var FALLBACK_COLLECTIONS = Object.freeze([
    "litteratur/topp10_lit_kort.json"
  ]);
  function isRecord(value) {
    return Boolean(value && typeof value === "object");
  }
  function escapeHTML(value) {
    return String(value != null ? value : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function normalizeKey(value) {
    return String(value != null ? value : "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }
  function pushId(ids, value) {
    const raw = String(value != null ? value : "").trim();
    if (raw) ids.push(raw);
    const normalized = normalizeKey(value);
    if (normalized) ids.push(normalized);
  }
  function collectTargetIds(place) {
    const ids = [];
    pushId(ids, place.id);
    pushId(ids, place.name);
    pushId(ids, place.title);
    pushId(ids, place.personId);
    pushId(ids, place.targetId);
    const quizProfile = isRecord(place.quiz_profile) ? place.quiz_profile : null;
    pushId(ids, quizProfile == null ? void 0 : quizProfile.targetId);
    pushId(ids, quizProfile == null ? void 0 : quizProfile.personId);
    if (Array.isArray(place.people)) {
      for (const person of place.people) {
        if (isRecord(person)) {
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
    if (normalized.has("bjorvika") || normalized.has("deichman_bjorvika") || normalized.has("deichmanske_bjorvika")) {
      ids.push("deichman_bjorvika");
    }
    return [...new Set(ids.filter(Boolean))];
  }
  function renderQuizCard(cardData) {
    const questions = Array.isArray(cardData.questions) ? cardData.questions : [];
    const letters = ["A", "B", "C", "D", "E", "F"];
    const questionItems = questions.map((question) => {
      const options = Array.isArray(question == null ? void 0 : question.options) ? question.options : [];
      const optionsHtml = options.length ? `<div class="pc-rendered-quiz-options">${options.map(
        (option, index) => `${escapeHTML(letters[index] || String(index + 1))}) ${escapeHTML(
          option
        )}`
      ).join(" \xB7 ")}</div>` : "";
      return `<li>${escapeHTML(question == null ? void 0 : question.question)}${optionsHtml}</li>`;
    }).join("");
    const answers = Array.isArray(cardData.answerKey) && cardData.answerKey.length ? cardData.answerKey : questions.map((question, index) => {
      var _a;
      return {
        number: (_a = question == null ? void 0 : question.number) != null ? _a : index + 1,
        answer: question == null ? void 0 : question.answer
      };
    });
    const answerHtml = answers.map(
      (entry) => `${escapeHTML(entry == null ? void 0 : entry.number)}. ${escapeHTML(entry == null ? void 0 : entry.answer)}`
    ).join(" \xB7 ");
    const title = escapeHTML(cardData.title || "Quizkort");
    const subtitle = escapeHTML(
      cardData.subtitle || `${questions.length} sp\xF8rsm\xE5l \xB7 fasit nederst`
    );
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
  function createPlaceQuizCardsController(options) {
    const { runtime, document: document2 } = options;
    let collectionsPromise = null;
    const loadCollectionPaths = async () => {
      var _a;
      const loader = (_a = runtime.DataHub) == null ? void 0 : _a.loadQuizCardsCollection;
      if (typeof loader !== "function") return FALLBACK_COLLECTIONS.slice();
      const manifest = await Promise.resolve(
        loader("litteratur/manifest.json", { cache: "default" })
      ).catch(() => null);
      const collections = isRecord(manifest) && Array.isArray(manifest.collections) ? manifest.collections : [];
      const files = collections.map((file) => String(file != null ? file : "").trim()).map((file) => file.replace(/^\/+/, "")).map((file) => file.replace(/^data\/quizcards\/litteratur\//, "")).filter(Boolean);
      return files.length ? files.map((file) => `litteratur/${file}`) : FALLBACK_COLLECTIONS.slice();
    };
    const loadCollections = async () => {
      var _a;
      const loader = (_a = runtime.DataHub) == null ? void 0 : _a.loadQuizCardsCollection;
      if (typeof loader !== "function") return [];
      if (collectionsPromise) return collectionsPromise;
      collectionsPromise = loadCollectionPaths().then(
        (paths) => Promise.all(
          paths.map(
            (path) => Promise.resolve(loader(path, { cache: "default" })).catch(
              () => null
            )
          )
        )
      ).then(
        (collections) => collections.filter(isRecord)
      ).catch(() => []);
      return collectionsPromise;
    };
    const resolveQuizCard = async (place) => {
      var _a;
      const targetIds = new Set(collectTargetIds(place));
      if (!targetIds.size) return null;
      const collections = await loadCollections();
      for (const collection of collections) {
        const cards = Array.isArray(collection.cards) ? collection.cards : [];
        for (const card of cards) {
          const rawTarget = String((_a = card == null ? void 0 : card.targetId) != null ? _a : "").trim();
          const normalizedTarget = normalizeKey(rawTarget);
          if (rawTarget && (targetIds.has(rawTarget) || targetIds.has(normalizedTarget))) {
            return card;
          }
        }
      }
      return null;
    };
    const applyQuizCard = (cardData) => {
      const flipElement = document2.getElementById("pcFrontCardFlip");
      const contentElement = document2.getElementById("pcQuizCardContent");
      const imageElement = document2.getElementById(
        "pcQuizCardImage"
      );
      if (!flipElement || !contentElement || !cardData) return false;
      contentElement.innerHTML = renderQuizCard(cardData);
      contentElement.hidden = false;
      if (imageElement) {
        imageElement.alt = "";
        imageElement.style.display = "none";
        if (imageElement.getAttribute("src")) {
          imageElement.removeAttribute("src");
        }
      }
      flipElement.classList.add("has-quiz-card");
      flipElement.setAttribute("aria-label", "Vis quizkort");
      return true;
    };
    const prewarm = () => {
      var _a, _b;
      (_b = (_a = runtime.HGQuizLoadAccelerator) == null ? void 0 : _a.prewarm) == null ? void 0 : _b.call(_a);
    };
    const applyForPlace = async (place) => {
      const cardData = await resolveQuizCard(place);
      return cardData ? applyQuizCard(cardData) : false;
    };
    return { prewarm, applyForPlace };
  }

  // js/ui/placeVisitButton.ts
  function createPlaceVisitButtonController(options) {
    const { runtime, document: document2, tUI, tfUI } = options;
    let physicalVisitTimer = null;
    const clear = () => {
      if (physicalVisitTimer === null) return;
      clearInterval(physicalVisitTimer);
      physicalVisitTimer = null;
    };
    const patch = (place) => {
      var _a, _b;
      clear();
      const oldButton = document2.getElementById("pcUnlock");
      if (!oldButton || !place) return;
      const button = oldButton.cloneNode(true);
      oldButton.replaceWith(button);
      const placeId = String((_a = place.id) != null ? _a : "").trim();
      const setButton = (disabled, text) => {
        button.disabled = disabled;
        button.textContent = text;
        button.setAttribute("aria-label", text);
      };
      const update = () => {
        var _a2;
        if (!button.isConnected) {
          clear();
          return;
        }
        if ((_a2 = runtime.HGPhysicalVisits) == null ? void 0 : _a2.isVisited(placeId)) {
          setButton(true, `${tUI("ui.visit.visited", "Bes\xF8kt")} \u2705`);
          clear();
          return;
        }
        const gate = getPhysicalVisitGate(runtime, place);
        if (!gate.ok) {
          const reason = "reason" in gate ? gate.reason : "too_far";
          if (reason === "no_pos") {
            setButton(true, tUI("ui.position.loading", "Henter posisjon\u2026"));
            return;
          }
          if (gate.d != null) {
            const left = Math.max(0, Math.ceil(gate.d - gate.r));
            setButton(
              true,
              tfUI("ui.unlock.goCloserMeters", "G\xE5 n\xE6rmere: {meters} m", {
                meters: left
              })
            );
            return;
          }
          setButton(true, tUI("ui.unlock.goCloser", "G\xE5 n\xE6rmere"));
          return;
        }
        const label = runtime.TEST_MODE ? `${tUI("ui.visit.register", "Registrer bes\xF8k")} (test)` : tUI("ui.visit.register", "Registrer bes\xF8k");
        setButton(false, label);
      };
      button.onclick = () => {
        var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k;
        if ((_a2 = runtime.HGPhysicalVisits) == null ? void 0 : _a2.isVisited(placeId)) {
          (_b2 = runtime.showToast) == null ? void 0 : _b2.call(
            runtime,
            tUI("ui.visit.alreadyVisited", "Bes\xF8ket er allerede registrert")
          );
          update();
          return;
        }
        const gate = getPhysicalVisitGate(runtime, place);
        if (!gate.ok) {
          const reason = "reason" in gate ? gate.reason : "too_far";
          if (reason === "no_pos") {
            (_c = runtime.showToast) == null ? void 0 : _c.call(runtime, tUI("ui.position.loading", "Henter posisjon\u2026"));
            return;
          }
          const left = gate.d != null ? Math.max(0, Math.ceil(gate.d - gate.r)) : null;
          (_d = runtime.showToast) == null ? void 0 : _d.call(
            runtime,
            left != null ? tfUI("ui.unlock.goCloserMeters", "G\xE5 n\xE6rmere: {meters} m", {
              meters: left
            }) : tUI("ui.unlock.goCloser", "G\xE5 n\xE6rmere")
          );
          return;
        }
        const result = ((_e = runtime.HGPhysicalVisits) == null ? void 0 : _e.record(place)) || {
          ok: false,
          reason: "persistence_unavailable"
        };
        if (!result.ok) {
          (_f = runtime.showToast) == null ? void 0 : _f.call(
            runtime,
            tUI("ui.visit.saveFailed", "Kunne ikke registrere bes\xF8ket")
          );
          return;
        }
        (_h = runtime.pulseMarker) == null ? void 0 : _h.call(runtime, place.lat, (_g = place.lon) != null ? _g : place.lng);
        (_k = runtime.showToast) == null ? void 0 : _k.call(
          runtime,
          `${tUI("ui.visit.registered", "Bes\xF8k registrert")}: ${String(
            (_j = (_i = place.name) != null ? _i : place.title) != null ? _j : placeId
          )} \u2705`
        );
        update();
      };
      update();
      if (!runtime.TEST_MODE && !((_b = runtime.HGPhysicalVisits) == null ? void 0 : _b.isVisited(placeId))) {
        physicalVisitTimer = setInterval(update, 1200);
      }
      const closeButton = document2.getElementById("pcClose");
      closeButton == null ? void 0 : closeButton.addEventListener("click", clear, { once: true });
    };
    return { patch, clear };
  }

  // js/ui/place-card-quizcards-patch.ts
  function installPlaceCardQuizVisitRuntime() {
    const runtime = window;
    if (runtime.__HG_PLACE_CARD_QUIZCARDS_PATCHED__ === true) return;
    runtime.__HG_PLACE_CARD_QUIZCARDS_PATCHED__ = true;
    const legacySaveVisited = typeof runtime.saveVisitedFromQuiz === "function" ? runtime.saveVisitedFromQuiz.bind(runtime) : null;
    const tUI = (key, fallback = "") => {
      var _a, _b;
      try {
        return ((_b = (_a = runtime.HG_I18N) == null ? void 0 : _a.t) == null ? void 0 : _b.call(_a, key, fallback)) || fallback;
      } catch {
        return fallback;
      }
    };
    const tfUI = (key, fallback = "", vars = {}) => {
      const template = tUI(key, fallback);
      return String(template).replace(
        /\{(\w+)\}/g,
        (_match, name) => Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
      );
    };
    runtime.HGPlaceProgress = {
      createSnapshot: createPlaceProgressSnapshot
    };
    installPhysicalVisitModel(runtime, legacySaveVisited);
    installDigitalQuizAccess(runtime);
    const visitButton = createPlaceVisitButtonController({
      runtime,
      document,
      tUI,
      tfUI
    });
    const quizCards = createPlaceQuizCardsController({ runtime, document });
    const originalOpenPlaceCard = runtime.openPlaceCard;
    if (typeof originalOpenPlaceCard !== "function") return;
    runtime.openPlaceCard = async function patchedOpenPlaceCard(place, ...args) {
      const result = await originalOpenPlaceCard.call(this, place, ...args);
      quizCards.prewarm();
      visitButton.patch(place);
      try {
        await quizCards.applyForPlace(place);
      } catch (error) {
        console.warn(
          "[place-card-quizcards-patch] kunne ikke aktivere quizkort",
          error
        );
      }
      return result;
    };
  }
  installPlaceCardQuizVisitRuntime();
})();
