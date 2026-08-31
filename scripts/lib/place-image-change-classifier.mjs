import { isDeepStrictEqual } from 'node:util';

function stripPlaceScopeFromPlace(place) {
  if (!place || typeof place !== 'object' || Array.isArray(place) || typeof place.id !== 'string') return place;
  const copy = { ...place };
  delete copy.placeScope;
  return copy;
}

function stripImageNeutralFieldsFromPlace(place) {
  const copy = stripPlaceScopeFromPlace(place);
  if (!copy || typeof copy !== 'object' || Array.isArray(copy) || typeof copy.id !== 'string') return copy;
  if (!copy.quiz_profile || typeof copy.quiz_profile !== 'object' || Array.isArray(copy.quiz_profile)) return copy;
  const quizProfile = { ...copy.quiz_profile };
  delete quizProfile.contrast_targets;
  return { ...copy, quiz_profile: quizProfile };
}

function withoutTopLevelPlaceScope(data) {
  if (Array.isArray(data)) return data.map(stripPlaceScopeFromPlace);
  if (data && typeof data === 'object' && Array.isArray(data.places)) {
    return { ...data, places: data.places.map(stripPlaceScopeFromPlace) };
  }
  return stripPlaceScopeFromPlace(data);
}

export function isPlaceScopeOnlyJsonChange(before, after) {
  if (isDeepStrictEqual(before, after)) return false;
  return isDeepStrictEqual(withoutTopLevelPlaceScope(before), withoutTopLevelPlaceScope(after));
}

function withoutImageNeutralFields(data) {
  if (Array.isArray(data)) return data.map(stripImageNeutralFieldsFromPlace);
  if (data && typeof data === 'object' && Array.isArray(data.places)) {
    return { ...data, places: data.places.map(stripImageNeutralFieldsFromPlace) };
  }
  return stripImageNeutralFieldsFromPlace(data);
}

export function isPlaceImageNeutralJsonChange(before, after) {
  if (isDeepStrictEqual(before, after)) return false;
  return isDeepStrictEqual(withoutImageNeutralFields(before), withoutImageNeutralFields(after));
}

export function isImageOptionalMicroPlace(place) {
  return place?.placeTier === 'micro'
    && place?.micro_place_profile?.schema === 'history_go_micro_place_profile_v1';
}
