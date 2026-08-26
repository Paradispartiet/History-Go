import { isDeepStrictEqual } from 'node:util';

function stripPlaceScopeFromPlace(place) {
  if (!place || typeof place !== 'object' || Array.isArray(place) || typeof place.id !== 'string') return place;
  const copy = { ...place };
  delete copy.placeScope;
  return copy;
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

export function isImageOptionalMicroPlace(place) {
  return place?.placeTier === 'micro'
    && place?.micro_place_profile?.schema === 'history_go_micro_place_profile_v1';
}
