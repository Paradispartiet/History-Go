export type PlaceProgressStatus =
  | "unopened"
  | "opened"
  | "quiz_completed"
  | "visited"
  | "explored"
  | "mastered";

export type PlaceProgressInput = {
  placeId: unknown;
  opened?: unknown;
  quizCompleted?: unknown;
  physicallyVisited?: unknown;
  extraPlaceActionCompleted?: unknown;
};

export type PlaceProgressSnapshot = {
  placeId: string;
  opened: boolean;
  quizCompleted: boolean;
  physicallyVisited: boolean;
  extraPlaceActionCompleted: boolean;
  explored: boolean;
  mastered: boolean;
  status: PlaceProgressStatus;
};

export function normalizePlaceId(value: unknown): string {
  if (value && typeof value === "object" && "id" in value) {
    return String((value as { id?: unknown }).id ?? "").trim();
  }
  return String(value ?? "").trim();
}

export function createPlaceProgressSnapshot(input: PlaceProgressInput): PlaceProgressSnapshot {
  const placeId = normalizePlaceId(input.placeId);
  const quizCompleted = input.quizCompleted === true;
  const physicallyVisited = input.physicallyVisited === true;
  const extraPlaceActionCompleted = input.extraPlaceActionCompleted === true;
  const opened = input.opened === true || quizCompleted || physicallyVisited || extraPlaceActionCompleted;
  const explored = quizCompleted && physicallyVisited;
  const mastered = explored && extraPlaceActionCompleted;

  let status: PlaceProgressStatus = "unopened";
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
