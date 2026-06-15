(function () {
  "use strict";

  if (window.__HG_PLACE_CARD_QUIZCARDS_PATCHED__ === true) return;
  window.__HG_PLACE_CARD_QUIZCARDS_PATCHED__ = true;

  const FALLBACK_COLLECTIONS = Object.freeze(["litteratur/topp10_lit_kort.json"]);
  let collectionsPromise = null;

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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
    const imgEl = document.getElementById("pcQuizCardImage");
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

  const originalOpenPlaceCard = window.openPlaceCard;
  if (typeof originalOpenPlaceCard !== "function") return;

  window.openPlaceCard = async function patchedOpenPlaceCard(place) {
    const result = await originalOpenPlaceCard.apply(this, arguments);
    try {
      const cardData = await resolveQuizCard(place);
      if (cardData) applyQuizCard(cardData);
    } catch (err) {
      console.warn("[place-card-quizcards-patch] kunne ikke aktivere quizkort", err);
    }
    return result;
  };
})();
