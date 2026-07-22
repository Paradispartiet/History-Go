export type QuizEngineApi = {
  getVisited?: () => unknown;
  saveVisitedFromQuiz?: (placeId: unknown) => unknown;
  [key: string]: unknown;
};

export type QuizEngineLike = {
  init?: (api?: QuizEngineApi) => unknown;
  __HG_DIGITAL_QUIZ_ACCESS_PATCHED__?: boolean;
  [key: string]: unknown;
};

export type QuizAccessRuntimeWindow = Window & typeof globalThis & {
  QuizEngine?: QuizEngineLike;
};

const QUIZ_ACCESS_VISITED_VIEW = new Proxy<Record<string, boolean>>(
  Object.create(null) as Record<string, boolean>,
  {
    get(_target, property) {
      if (property === "toJSON") return () => ({});
      if (typeof property === "symbol") return undefined;
      return true;
    },
    has() {
      return true;
    }
  }
);

export function getDigitalQuizVisitedView(): Record<string, boolean> {
  return QUIZ_ACCESS_VISITED_VIEW;
}

export function patchQuizEngineForDigitalAccess(engine: QuizEngineLike | null | undefined): QuizEngineLike | null | undefined {
  if (!engine || engine.__HG_DIGITAL_QUIZ_ACCESS_PATCHED__ === true) return engine;

  const originalInit = engine.init;
  if (typeof originalInit === "function") {
    engine.init = function initWithDigitalQuizAccess(api: QuizEngineApi = {}) {
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

export function installDigitalQuizAccess(runtime: QuizAccessRuntimeWindow): void {
  if (runtime.QuizEngine) {
    runtime.QuizEngine = patchQuizEngineForDigitalAccess(runtime.QuizEngine) || undefined;
    return;
  }

  try {
    Object.defineProperty(runtime, "QuizEngine", {
      configurable: true,
      enumerable: true,
      get() {
        return undefined;
      },
      set(value: QuizEngineLike | undefined) {
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
