import type { PlaceLike } from "../visits/physicalVisits";

export type QuizCardQuestion = {
  number?: unknown;
  question?: unknown;
  options?: unknown;
  answer?: unknown;
};

export type QuizCardAnswer = {
  number?: unknown;
  answer?: unknown;
};

export type QuizCardData = {
  targetId?: unknown;
  title?: unknown;
  subtitle?: unknown;
  questions?: unknown;
  answerKey?: unknown;
};

export type QuizCardCollection = {
  cards?: unknown;
};

export type PlaceQuizCardsRuntimeWindow = Window & typeof globalThis & {
  DataHub?: {
    loadQuizCardsCollection?: (
      path: string,
      options?: { cache?: string }
    ) => unknown;
  };
  HGQuizLoadAccelerator?: {
    prewarm?: () => unknown;
  };
};

export type PlaceQuizCardsController = {
  prewarm: () => void;
  applyForPlace: (place: PlaceLike) => Promise<boolean>;
};

const FALLBACK_COLLECTIONS = Object.freeze([
  "litteratur/topp10_lit_kort.json"
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function escapeHTML(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeKey(value: unknown): string {
  return String(value ?? "")
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

function pushId(ids: string[], value: unknown): void {
  const raw = String(value ?? "").trim();
  if (raw) ids.push(raw);
  const normalized = normalizeKey(value);
  if (normalized) ids.push(normalized);
}

function collectTargetIds(place: PlaceLike): string[] {
  const ids: string[] = [];
  pushId(ids, place.id);
  pushId(ids, place.name);
  pushId(ids, place.title);
  pushId(ids, place.personId);
  pushId(ids, place.targetId);

  const quizProfile = isRecord(place.quiz_profile) ? place.quiz_profile : null;
  pushId(ids, quizProfile?.targetId);
  pushId(ids, quizProfile?.personId);

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
  if (
    normalized.has("bjorvika") ||
    normalized.has("deichman_bjorvika") ||
    normalized.has("deichmanske_bjorvika")
  ) {
    ids.push("deichman_bjorvika");
  }

  return [...new Set(ids.filter(Boolean))];
}

function renderQuizCard(cardData: QuizCardData): string {
  const questions = Array.isArray(cardData.questions)
    ? (cardData.questions as QuizCardQuestion[])
    : [];
  const letters = ["A", "B", "C", "D", "E", "F"];
  const questionItems = questions
    .map((question) => {
      const options = Array.isArray(question?.options)
        ? question.options
        : [];
      const optionsHtml = options.length
        ? `<div class="pc-rendered-quiz-options">${options
            .map(
              (option, index) =>
                `${escapeHTML(letters[index] || String(index + 1))}) ${escapeHTML(
                  option
                )}`
            )
            .join(" · ")}</div>`
        : "";
      return `<li>${escapeHTML(question?.question)}${optionsHtml}</li>`;
    })
    .join("");

  const answers =
    Array.isArray(cardData.answerKey) && cardData.answerKey.length
      ? (cardData.answerKey as QuizCardAnswer[])
      : questions.map((question, index) => ({
          number: question?.number ?? index + 1,
          answer: question?.answer
        }));

  const answerHtml = answers
    .map(
      (entry) =>
        `${escapeHTML(entry?.number)}. ${escapeHTML(entry?.answer)}`
    )
    .join(" · ");

  const title = escapeHTML(cardData.title || "Quizkort");
  const subtitle = escapeHTML(
    cardData.subtitle || `${questions.length} spørsmål · fasit nederst`
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

export function createPlaceQuizCardsController(options: {
  runtime: PlaceQuizCardsRuntimeWindow;
  document: Document;
}): PlaceQuizCardsController {
  const { runtime, document } = options;
  let collectionsPromise: Promise<QuizCardCollection[]> | null = null;

  const loadCollectionPaths = async (): Promise<string[]> => {
    const loader = runtime.DataHub?.loadQuizCardsCollection;
    if (typeof loader !== "function") return FALLBACK_COLLECTIONS.slice();

    const manifest = await Promise.resolve(
      loader("litteratur/manifest.json", { cache: "default" })
    ).catch(() => null);
    const collections = isRecord(manifest) && Array.isArray(manifest.collections)
      ? manifest.collections
      : [];
    const files = collections
      .map((file) => String(file ?? "").trim())
      .map((file) => file.replace(/^\/+/, ""))
      .map((file) => file.replace(/^data\/quizcards\/litteratur\//, ""))
      .filter(Boolean);

    return files.length
      ? files.map((file) => `litteratur/${file}`)
      : FALLBACK_COLLECTIONS.slice();
  };

  const loadCollections = async (): Promise<QuizCardCollection[]> => {
    const loader = runtime.DataHub?.loadQuizCardsCollection;
    if (typeof loader !== "function") return [];
    if (collectionsPromise) return collectionsPromise;

    collectionsPromise = loadCollectionPaths()
      .then((paths) =>
        Promise.all(
          paths.map((path) =>
            Promise.resolve(loader(path, { cache: "default" })).catch(
              () => null
            )
          )
        )
      )
      .then((collections) =>
        collections.filter(isRecord) as QuizCardCollection[]
      )
      .catch(() => []);

    return collectionsPromise;
  };

  const resolveQuizCard = async (
    place: PlaceLike
  ): Promise<QuizCardData | null> => {
    const targetIds = new Set(collectTargetIds(place));
    if (!targetIds.size) return null;

    const collections = await loadCollections();
    for (const collection of collections) {
      const cards = Array.isArray(collection.cards)
        ? (collection.cards as QuizCardData[])
        : [];
      for (const card of cards) {
        const rawTarget = String(card?.targetId ?? "").trim();
        const normalizedTarget = normalizeKey(rawTarget);
        if (
          rawTarget &&
          (targetIds.has(rawTarget) || targetIds.has(normalizedTarget))
        ) {
          return card;
        }
      }
    }

    return null;
  };

  const applyQuizCard = (cardData: QuizCardData): boolean => {
    const flipElement = document.getElementById("pcFrontCardFlip");
    const contentElement = document.getElementById("pcQuizCardContent");
    const imageElement = document.getElementById(
      "pcQuizCardImage"
    ) as HTMLImageElement | null;
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

  const prewarm = (): void => {
    runtime.HGQuizLoadAccelerator?.prewarm?.();
  };

  const applyForPlace = async (place: PlaceLike): Promise<boolean> => {
    const cardData = await resolveQuizCard(place);
    return cardData ? applyQuizCard(cardData) : false;
  };

  return { prewarm, applyForPlace };
}
