// ============================================================
// HISTORY GO – HGNavigator
// Bygger kontekstuell NextUp for sist åpne placeCard.
//
// Kontrakt brukt av js/ui/place-card.js:
// window.HGNavigator.buildForPlace(place, { nearbyPlaces, personsHere })
// -> { spatial, wk, narrative, concept }
// ============================================================

(function () {
  "use strict";

  function s(value) {
    return String(value ?? "").trim();
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function placeId(place) {
    return s(place?.id);
  }

  function placeLabel(place) {
    return s(place?.name) || placeId(place);
  }

  function categoryOf(place) {
    return s(place?.categoryId || place?.category || place?.subject_id || "by");
  }

  function getVisited() {
    try {
      const v = JSON.parse(localStorage.getItem("visited_places") || "{}");
      return v && typeof v === "object" ? v : {};
    } catch {
      return {};
    }
  }

  function getQuizSets() {
    try {
      const v = JSON.parse(localStorage.getItem("hg_quiz_sets_v1") || "{}");
      return v && typeof v === "object" ? v : {};
    } catch {
      return {};
    }
  }

  function hasAnyCompletedSetForPlace(place) {
    const id = placeId(place);
    if (!id) return false;

    const sets = getQuizSets();
    return Object.keys(sets).some(key => key.startsWith(`${id}::`) && !!sets[key]?.completed);
  }

  function distanceFromCurrent(place) {
    if (Number.isFinite(place?._d)) return Number(place._d);

    try {
      const pos = typeof window.getPos === "function" ? window.getPos() : null;
      if (!pos || typeof window.distMeters !== "function") return Infinity;
      if (place?.lat == null || place?.lon == null) return Infinity;
      return window.distMeters(pos, { lat: place.lat, lon: place.lon });
    } catch {
      return Infinity;
    }
  }

  function getCandidatePlaces(currentPlace, nearbyPlaces = []) {
    const currentId = placeId(currentPlace);
    const seen = new Set();
    const out = [];

    const push = (place) => {
      const id = placeId(place);
      if (!id || id === currentId || seen.has(id)) return;
      seen.add(id);
      out.push(place);
    };

    arr(nearbyPlaces).forEach(push);
    arr(window.NEARBY_PLACES).forEach(push);
    arr(window.PLACES).forEach(push);

    return out;
  }

  function buildSpatial(currentPlace, nearbyPlaces = []) {
    const visited = getVisited();
    const currentCategory = categoryOf(currentPlace);

    const candidates = getCandidatePlaces(currentPlace, nearbyPlaces)
      .map(place => ({ place, d: distanceFromCurrent(place) }))
      .sort((a, b) => a.d - b.d);

    const preferred =
      candidates.find(x => !visited[placeId(x.place)] && categoryOf(x.place) === currentCategory) ||
      candidates.find(x => !visited[placeId(x.place)]) ||
      candidates.find(x => categoryOf(x.place) === currentCategory) ||
      candidates[0];

    if (!preferred?.place) return null;

    const label = Number.isFinite(preferred.d)
      ? `${placeLabel(preferred.place)} · ${Math.round(preferred.d)} m`
      : placeLabel(preferred.place);

    return {
      place_id: placeId(preferred.place),
      label,
      because: "Nærmeste relevante sted videre fra dette kortet"
    };
  }

  function buildWonderkammer(place) {
    const id = placeId(place);
    const chambers = arr(window.WK_BY_PLACE?.[id]);
    if (!chambers.length) return null;

    const first = chambers.find(c => s(c?.id || c?.entry_id || c?.title || c?.label || c?.name)) || chambers[0];
    const entryId = s(first?.id || first?.entry_id || first?.slug || "");
    const label = s(first?.title || first?.label || first?.name || entryId || "Wonderkammer");

    if (!entryId && !label) return null;

    return {
      entry_id: entryId,
      label,
      because: "Dette stedet har Wonderkammer-innhold"
    };
  }

  function buildNarrative(place, nearbyPlaces = []) {
    const currentId = placeId(place);

    try {
      if (window.HGStories && typeof window.HGStories.getByPlace === "function") {
        const stories = arr(window.HGStories.getByPlace(currentId));
        const storyWithPlace = stories.find(st => {
          const ids = arr(st?.place_ids || st?.places || st?.next_places);
          return ids.some(id => s(id) && s(id) !== currentId);
        });

        if (storyWithPlace) {
          const ids = arr(storyWithPlace.place_ids || storyWithPlace.places || storyWithPlace.next_places);
          const nextId = s(ids.find(id => s(id) && s(id) !== currentId));
          const nextPlace = arr(window.PLACES).find(p => placeId(p) === nextId);
          if (nextId) {
            return {
              next_place_id: nextId,
              label: s(storyWithPlace.title || storyWithPlace.summary || placeLabel(nextPlace) || "Neste fortelling"),
              because: "Fortellingen peker videre til et annet sted"
            };
          }
        }
      }
    } catch {}

    const spatial = buildSpatial(place, nearbyPlaces);
    if (!spatial) return null;

    return {
      next_place_id: spatial.place_id,
      label: spatial.label,
      because: "Neste sted kan fungere som neste scene"
    };
  }

  function buildConcept(place) {
    const ids = arr(place?.emne_ids).map(s).filter(Boolean);
    const first = ids[0];
    if (!first) return null;

    let label = first;

    try {
      const subject = categoryOf(place);
      // Synkron cache finnes ikke garantert, så label kan senere forbedres av knowledge-siden.
      // Her holder emne_id som robust fallback.
      if (window.Emner && typeof window.Emner.getEmne === "function") {
        window.Emner.getEmne(first, subject).then(emne => {
          // Ingen DOM-mutasjon her: NextUp re-renderes ikke bare for label.
        }).catch(() => {});
      }
    } catch {}

    label = s(place?.quiz_profile?.primary_angles?.[0]) || s(place?.quiz_profile?.subtype) || first;

    return {
      emne_id: first,
      subject_id: categoryOf(place),
      label,
      because: "Stedet er koblet til dette emnet"
    };
  }

  async function buildForPlace(place, context = {}) {
    if (!place) return {};

    const nearbyPlaces = arr(context.nearbyPlaces);

    return {
      spatial: buildSpatial(place, nearbyPlaces),
      wk: buildWonderkammer(place),
      narrative: buildNarrative(place, nearbyPlaces),
      concept: buildConcept(place)
    };
  }

  window.HGNavigator = {
    buildForPlace,
    _debug: {
      buildSpatial,
      buildWonderkammer,
      buildNarrative,
      buildConcept
    }
  };
})();
