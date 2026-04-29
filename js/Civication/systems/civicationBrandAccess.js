(function initCivicationBrandAccess(globalScope) {
  function normalize(value) {
    return String(value || '').trim();
  }

  function normLower(value) {
    return normalize(value).toLowerCase();
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function uniq(values) {
    return [...new Set(asArray(values).map(normalize).filter(Boolean))];
  }
  const IGNORED_PLACE_KEYS = new Set([
    'points', 'score', 'count', 'total', 'version', 'updated_at', 'created_at',
    'ts', 'ts_last', 'category', 'categories', 'id', 'name', 'title', 'label'
  ]);

  function readStorageJson(key) {
    try {
      return JSON.parse(globalScope.localStorage?.getItem?.(key) || 'null');
    } catch {
      return null;
    }
  }

  function collectPlaceIdsFromAnyShape(raw, bucket, context) {
    const mode = context?.mode || 'generic';
    if (!raw) return;
    if (typeof raw === 'string' || typeof raw === 'number') {
      const id = normalize(raw);
      if (id) bucket.add(id);
      return;
    }
    if (Array.isArray(raw)) {
      raw.forEach(function (item) { collectPlaceIdsFromAnyShape(item, bucket, context); });
      return;
    }
    if (typeof raw === 'object') {
      Object.entries(raw).forEach(function ([k, v]) {
        const key = normalize(k);
        if (!key) return;
        if (mode === 'generic' && IGNORED_PLACE_KEYS.has(normLower(key))) return;
        if (typeof v === 'boolean') {
          if (v) bucket.add(key);
          return;
        }
        if (typeof v === 'number') {
          if (v > 0) bucket.add(key);
          return;
        }
        if (v && typeof v === 'object' && (v.visited || v.unlocked || v.completed || Number(v.points) > 0)) {
          bucket.add(key);
        }
        collectPlaceIdsFromAnyShape(v, bucket, context);
      });
    }
  }

  function collectPlaceAccess() {
    const bySource = {
      completed_place_quiz: new Set(),
      unlocked_place: new Set(),
      visited_place: new Set(),
      place_progress: new Set()
    };
    collectPlaceIdsFromAnyShape(readStorageJson('quiz_progress'), bySource.completed_place_quiz, { mode: 'generic' });
    collectPlaceIdsFromAnyShape(readStorageJson('hg_unlocks_v1'), bySource.unlocked_place, { mode: 'generic' });
    collectPlaceIdsFromAnyShape(readStorageJson('visited_places'), bySource.visited_place, { mode: 'generic' });
    collectPlaceIdsFromAnyShape(readStorageJson('merits_by_category'), bySource.place_progress, { mode: 'generic' });
    return bySource;
  }

  function getPlaceAccessIndex() {
    const bySource = collectPlaceAccess();
    const priority = ['completed_place_quiz', 'unlocked_place', 'visited_place', 'place_progress'];
    const index = new Map();
    priority.forEach(function (source) {
      bySource[source].forEach(function (placeId) {
        if (!index.has(placeId)) index.set(placeId, source);
      });
    });
    return { bySource, index };
  }

  function getPlacesForBrand(brand) {
    const brandId = normalize(brand?.id);
    const placeIds = new Set();
    const byPlace = globalScope.BRANDS_BY_PLACE || {};

    Object.entries(byPlace).forEach(function ([placeId, mapped]) {
      const hit = asArray(mapped).some(function (entry) {
        if (typeof entry === 'string') return normalize(entry) === brandId;
        return normalize(entry?.id) === brandId;
      });
      if (hit) placeIds.add(normalize(placeId));
    });

    asArray(brand?.place_ids).forEach(function (pid) { placeIds.add(normalize(pid)); });
    return uniq([...placeIds]);
  }

  function isRoleRelevant(brand, roleScope) {
    const scope = normLower(roleScope);
    if (scope !== 'ekspeditor') return false;

    const sector = normLower(brand?.sector);
    const brandType = normLower(brand?.brand_type);
    const group = normLower(brand?.brand_group);
    const tags = asArray(brand?.tags).map(normLower);
    const combined = [sector, brandType, group].concat(tags).join(' ');

    const allowed = ['kiosk', 'retail', 'books', 'fashion', 'beauty', 'coffee', 'design', 'jewelry', 'sports_retail'];
    if (allowed.some(function (token) { return combined.includes(token); })) return true;
    if (combined.includes('food_and_drink') && (combined.includes('store') || combined.includes('butikk') || combined.includes('retail'))) return true;
    return false;
  }

  function isEmployerBlocked(brand) {
    const status = normLower(brand?.status);
    const state = normLower(brand?.state);
    const brandType = normLower(brand?.brand_type);
    if (status === 'dead' || state === 'dead') return true;
    if (brandType.includes('signage') || brandType.includes('museum') || brandType.includes('archive')) return true;
    return false;
  }

  function canUseBrandAsEmployer(brand, options) {
    const roleScope = normLower(options?.role_scope || 'ekspeditor');
    if (!brand || !normalize(brand.id) || !normalize(brand.name)) return false;
    if (isEmployerBlocked(brand)) return false;
    if (!isRoleRelevant(brand, roleScope)) return false;
    return true;
  }

  function getAllBrands() {
    const hg = globalScope.HGBrands;
    if (Array.isArray(hg?.all) && hg.all.length) return hg.all;
    if (typeof hg?.getAll === 'function') return hg.getAll();
    return asArray(globalScope.BRANDS_MASTER || globalScope.BRANDS);
  }

  function getUnlockedBrandEmployers(options) {
    const role_scope = normalize(options?.role_scope || 'ekspeditor');
    const career_id = normalize(options?.career_id || 'naeringsliv');
    const access = getPlaceAccessIndex();

    if (normLower(career_id) !== 'naeringsliv' || normLower(role_scope) !== 'ekspeditor') return [];

    return getAllBrands().map(function (brand) {
      if (!canUseBrandAsEmployer(brand, { role_scope, career_id })) return null;
      const connectedPlaces = getPlacesForBrand(brand);
      if (!connectedPlaces.length) return null;
      const place_id = connectedPlaces.find(function (pid) { return access.index.has(pid); });
      if (!place_id) return null;
      const access_source = access.index.get(place_id) || 'place_progress';
      return {
        brand_id: normalize(brand.id),
        brand_name: normalize(brand.name),
        brand_type: normalize(brand.brand_type) || null,
        brand_group: normalize(brand.brand_group) || null,
        sector: normalize(brand.sector) || null,
        place_id,
        access_source,
        fit: 'role_sector_match',
        employer_context: {
          source: 'HGBrands',
          access_source,
          role_scope,
          career_id,
          brand_id: normalize(brand.id),
          brand_name: normalize(brand.name),
          place_id,
          sector: normalize(brand.sector) || null,
          brand_type: normalize(brand.brand_type) || null
        }
      };
    }).filter(Boolean);
  }

  function inspect(options) {
    const access = getPlaceAccessIndex();
    return {
      unlocked_places: [...access.index.keys()],
      place_access: access.bySource,
      employers: getUnlockedBrandEmployers(options)
    };
  }

  const api = { getUnlockedBrandEmployers, canUseBrandAsEmployer, inspect };
  globalScope.CivicationBrandAccess = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
