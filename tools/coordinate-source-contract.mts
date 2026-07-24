export const allowedLocatorTypes = ['current_place','poi','building','entrance','street','square','park','linear_area','institutional_area','route','quay','historic_site','archaeological_site','natural_area','unknown'] as const;
export const allowedSourceProviders = ['official_address','official_map','osm','google_places','mapbox','kartverket','municipality','historical_map','manual_research','legacy_unknown'] as const;
export const allowedGeocodeAccuracy = ['rooftop','entrance','building','parcel','interpolated','geometric_center','approximate','historical_approximation','semantic_anchor','unknown'] as const;
export const allowedCoordRoles = ['display_marker','unlock_point','label_anchor','entrance','building_center','site_center','line_anchor','area_anchor','historical_anchor'] as const;
export const allowedCoordStatuses = ['verified','verified_geometry','verified_historical_source','needs_manual_visual_qa','needs_source','legacy_unverified','historical_approximation','invalid'] as const;

type Trust = 'verified' | 'review' | 'unknown' | 'invalid';
type Problem = { field: string; problem: string; severity: 'error' | 'warning' | 'info'; recommendedAction: string };
const verifiedStatuses = new Set(['verified','verified_geometry','verified_historical_source']);
const reviewStatuses = new Set(['needs_manual_visual_qa','needs_source','legacy_unverified','historical_approximation']);
const linearTypes = new Set(['street','linear_area','route','quay','park','natural_area']);
const lowAccuracy = new Set(['approximate','historical_approximation','semantic_anchor','unknown']);
const preciseBuildingAccuracy = new Set(['rooftop','entrance','building','parcel']);
const hasText = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
const hasStructuredAddress = (a: any) => !!a && typeof a === 'object' && ['street','number','postcode','city','country'].some((f) => hasText(a[f]));
const hasSourceIdentity = (p: any) => hasText(p?.sourceObjectId) || hasStructuredAddress(p?.address);
const decimals = (v: number) => { const s = String(v); if (/e-/i.test(s)) return Number(s.split(/e-/i)[1]) || 0; return s.split('.')[1]?.length ?? 0; };
const hasGeometryOrAnchors = (p: any) => !!p?.geometry || (Array.isArray(p?.anchors) && p.anchors.length > 0) || p?.coordRole === 'line_anchor' || p?.coordRole === 'area_anchor';
const onlyManualMapCheck = (p: any) => String(p?.coordSource ?? '').trim() === 'manual_map_check' && !hasText(p?.sourceObjectId) && !hasStructuredAddress(p?.address) && !hasText(p?.sourceProvider);
function add(problems: Problem[], field: string, problem: string, severity: Problem['severity'], recommendedAction: string) { problems.push({ field, problem, severity, recommendedAction }); }
export function validateCoordinateSource(place: any): { ok: boolean; trust: Trust; problems: Problem[] } {
  const problems: Problem[] = [];
  const lat = place?.lat, lon = place?.lon, r = place?.r;
  if (!isNum(lat) || lat < -90 || lat > 90) add(problems, 'lat', 'Mangler eller ugyldig lat.', 'error', 'downgrade_to_needs_source');
  if (!isNum(lon) || lon < -180 || lon > 180) add(problems, 'lon', 'Mangler eller ugyldig lon.', 'error', 'downgrade_to_needs_source');
  if (!isNum(r) || r <= 0) add(problems, 'r', 'Mangler eller ugyldig radius r.', 'error', 'downgrade_to_needs_source');
  if (problems.some((p) => p.severity === 'error' && ['lat','lon','r'].includes(p.field))) return { ok: false, trust: 'invalid', problems };
  const status = String(place?.coordStatus ?? '').trim();
  if (!status) add(problems, 'coordStatus', 'Mangler coordStatus.', 'warning', 'downgrade_to_needs_source');
  else if (!allowedCoordStatuses.includes(status as any)) add(problems, 'coordStatus', `Ugyldig coordStatus=${status}.`, 'error', 'downgrade_to_needs_source');
  const locatorType = String(place?.locatorType ?? '').trim();
  const sourceProvider = String(place?.sourceProvider ?? '').trim();
  if (!locatorType) add(problems, 'locatorType', 'Mangler locatorType i coordinate source contract v1.', verifiedStatuses.has(status) ? 'error' : 'warning', 'upgrade_to_address_source');
  else if (!allowedLocatorTypes.includes(locatorType as any)) add(problems, 'locatorType', `Ugyldig locatorType=${locatorType}.`, 'error', 'downgrade_to_needs_source');
  if (!sourceProvider) add(problems, 'sourceProvider', 'Mangler sourceProvider i coordinate source contract v1.', verifiedStatuses.has(status) ? 'error' : 'warning', 'upgrade_to_osm_or_place_id');
  else if (!allowedSourceProviders.includes(sourceProvider as any)) add(problems, 'sourceProvider', `Ugyldig sourceProvider=${sourceProvider}.`, 'error', 'downgrade_to_needs_source');
  if (sourceProvider === 'legacy_unknown' && verifiedStatuses.has(status)) add(problems, 'sourceProvider', 'legacy_unknown kan aldri gi verified.', 'error', 'downgrade_to_needs_source');
  if (verifiedStatuses.has(status) && !hasSourceIdentity(place)) add(problems, 'sourceObjectId', 'Verified krever sourceObjectId eller strukturert address.', 'error', 'upgrade_to_osm_or_place_id');
  const accuracy = String(place?.geocodeAccuracy ?? '').trim();
  if (!accuracy) add(problems, 'geocodeAccuracy', 'Mangler geocodeAccuracy.', verifiedStatuses.has(status) ? 'error' : 'warning', 'downgrade_to_needs_manual_visual_qa');
  else if (!allowedGeocodeAccuracy.includes(accuracy as any)) add(problems, 'geocodeAccuracy', `Ugyldig geocodeAccuracy=${accuracy}.`, 'error', 'downgrade_to_needs_source');
  if (verifiedStatuses.has(status) && (accuracy === 'approximate' || accuracy === 'unknown')) add(problems, 'geocodeAccuracy', 'Lav geocodeAccuracy kan ikke være verified.', 'error', 'downgrade_to_needs_source');
  if (verifiedStatuses.has(status) && accuracy === 'interpolated' && (place?.coordRole === 'unlock_point' || !hasText(place?.coordNote))) add(problems, 'geocodeAccuracy', 'Interpolert geokoding krever tydelig note og kan ikke brukes som unlock-punkt.', 'error', 'downgrade_to_needs_manual_visual_qa');
  if (!hasText(place?.coordRole)) add(problems, 'coordRole', 'Mangler coordRole.', verifiedStatuses.has(status) ? 'error' : 'warning', 'downgrade_to_needs_source');
  else if (!allowedCoordRoles.includes(String(place.coordRole) as any)) add(problems, 'coordRole', `Ugyldig coordRole=${place.coordRole}.`, 'error', 'downgrade_to_needs_source');
  for (const f of ['coordType','coordNote']) if (verifiedStatuses.has(status) && !hasText(place?.[f])) add(problems, f, `Verified krever ${f}.`, 'error', 'downgrade_to_needs_source');
  if (String(place?.coordSource ?? '').trim() === 'manual_map_check' && verifiedStatuses.has(status) && !hasSourceIdentity(place)) add(problems, 'coordSource', 'manual_map_check kan bare være QA-lag, ikke primær kilde alene.', 'error', 'upgrade_to_osm_or_place_id');
  if (isNum(lat) && isNum(lon) && verifiedStatuses.has(status) && (decimals(lat) < 4 || decimals(lon) < 4)) add(problems, 'lat/lon', 'Lavpresisjons lat/lon kan ikke være verified.', 'error', 'downgrade_to_needs_manual_visual_qa');
  if (verifiedStatuses.has(status) && linearTypes.has(locatorType) && !hasGeometryOrAnchors(place)) add(problems, 'geometry', 'Lineære steder må ha geometry, anchors eller coordRole line_anchor/area_anchor.', 'error', 'upgrade_to_geometry');
  if (verifiedStatuses.has(status) && ['historic_site','archaeological_site'].includes(locatorType) && !['historical_map','manual_research'].includes(sourceProvider)) add(problems, 'sourceProvider', 'Historiske steder krever historical_map eller manual_research som historisk kilde.', 'error', 'upgrade_to_historical_source');
  if (verifiedStatuses.has(status) && ['building','entrance','current_place'].includes(locatorType) && !preciseBuildingAccuracy.has(accuracy as any)) add(problems, 'geocodeAccuracy', 'Bygg/adresse-steder bør bruke rooftop/entrance/building/parcel for verified.', 'warning', 'upgrade_to_address_source');
  const verifiedGeometrySemanticAnchor = status === 'verified_geometry' && accuracy === 'semantic_anchor' && hasGeometryOrAnchors(place) && ['line_anchor', 'area_anchor'].includes(String(place?.coordRole ?? ''));
  const verifiedHistoricalApproximation = status === 'verified_historical_source' && accuracy === 'historical_approximation' && ['historical_map', 'manual_research'].includes(sourceProvider) && String(place?.coordRole ?? '') === 'historical_anchor';
  const verifiedHistoricalSemanticAnchor = status === 'verified_historical_source' && accuracy === 'semantic_anchor' && ['historical_map', 'manual_research'].includes(sourceProvider) && hasGeometryOrAnchors(place) && ['line_anchor', 'area_anchor', 'historical_anchor'].includes(String(place?.coordRole ?? ''));
  const acceptedLowAccuracy = verifiedGeometrySemanticAnchor || verifiedHistoricalApproximation || verifiedHistoricalSemanticAnchor;
  let trust: Trust = 'review';
  if (!status || !locatorType || !sourceProvider) trust = 'unknown';
  else if (status === 'invalid') trust = 'invalid';
  else if (verifiedStatuses.has(status) && !problems.some((p) => p.severity === 'error') && sourceProvider !== 'legacy_unknown' && !onlyManualMapCheck(place) && (!lowAccuracy.has(accuracy) || acceptedLowAccuracy)) trust = 'verified';
  else if (reviewStatuses.has(status) || problems.length > 0 || lowAccuracy.has(accuracy)) trust = 'review';
  return { ok: trust === 'verified' || (!verifiedStatuses.has(status) && !problems.some((p) => p.severity === 'error')), trust, problems };
}
export function getCanonicalCoordinateTrust(place: any): Trust { return validateCoordinateSource(place).trust; }
export function explainCoordinateSourceProblems(place: any): Problem[] { return validateCoordinateSource(place).problems; }
