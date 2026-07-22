import {
  createPlaceProgressSnapshot,
  type PlaceProgressInput,
  type PlaceProgressSnapshot
} from "../progress/placeProgress";
import {
  installDigitalQuizAccess,
  type QuizAccessRuntimeWindow
} from "../quiz/quizAccess";
import {
  installPhysicalVisitModel,
  type PhysicalVisitRuntimeWindow,
  type PlaceLike
} from "../visits/physicalVisits";
import {
  createPlaceQuizCardsController,
  type PlaceQuizCardsRuntimeWindow
} from "./placeQuizCards";
import {
  createPlaceVisitButtonController,
  type PlaceVisitButtonRuntimeWindow
} from "./placeVisitButton";

type HistoryGoQuizVisitRuntime = PhysicalVisitRuntimeWindow &
  QuizAccessRuntimeWindow &
  PlaceQuizCardsRuntimeWindow &
  PlaceVisitButtonRuntimeWindow & {
    __HG_PLACE_CARD_QUIZCARDS_PATCHED__?: boolean;
    openPlaceCard?: (place: PlaceLike, ...args: unknown[]) => unknown;
    HG_I18N?: {
      t?: (key: string, fallback?: string) => string;
    };
    HGPlaceProgress?: {
      createSnapshot: (input: PlaceProgressInput) => PlaceProgressSnapshot;
    };
  };

function installPlaceCardQuizVisitRuntime(): void {
  const runtime = window as HistoryGoQuizVisitRuntime;
  if (runtime.__HG_PLACE_CARD_QUIZCARDS_PATCHED__ === true) return;
  runtime.__HG_PLACE_CARD_QUIZCARDS_PATCHED__ = true;

  const legacySaveVisited =
    typeof runtime.saveVisitedFromQuiz === "function"
      ? runtime.saveVisitedFromQuiz.bind(runtime)
      : null;

  const tUI = (key: string, fallback = ""): string => {
    try {
      return runtime.HG_I18N?.t?.(key, fallback) || fallback;
    } catch {
      return fallback;
    }
  };

  const tfUI = (
    key: string,
    fallback = "",
    vars: Record<string, unknown> = {}
  ): string => {
    const template = tUI(key, fallback);
    return String(template).replace(/\{(\w+)\}/g, (_match, name: string) =>
      Object.prototype.hasOwnProperty.call(vars, name)
        ? String(vars[name])
        : `{${name}}`
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

  runtime.openPlaceCard = async function patchedOpenPlaceCard(
    this: unknown,
    place: PlaceLike,
    ...args: unknown[]
  ) {
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

export { installPlaceCardQuizVisitRuntime };
