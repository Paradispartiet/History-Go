import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_ROUTING_REGISTRY_PATH = path.join(repoRoot, '.github', 'ci', 'place-production-routing-v2.json');

export function loadPlaceProductionRoutingRegistry(file = DEFAULT_ROUTING_REGISTRY_PATH) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function matchesPathRule(changedPath, rule) {
  return changedPath === rule || changedPath.startsWith(`${rule}/`);
}

function pathInRules(changedPath, rules = []) {
  return rules.some((rule) => matchesPathRule(changedPath, rule));
}

function pathMatchesPlace(changedPath, place) {
  const lower = changedPath.toLowerCase();
  return (place.match ?? []).some((needle) => lower.includes(String(needle).toLowerCase()));
}

function dedupe(values) {
  return [...new Set(values)];
}

export function classifyPlaceProductionChanges(changedPaths, registry) {
  if (!registry || registry.version !== 2) throw new Error('Place production routing registry must be version 2');
  const paths = dedupe((changedPaths ?? []).filter(Boolean));
  const places = registry.places ?? [];

  const hasFullMatrix = paths.some((value) => pathInRules(value, registry.fullMatrixPaths));
  const hasSharedContract = paths.some((value) => pathInRules(value, registry.sharedContractPaths));
  const governanceOnly = paths.length > 0 && paths.every((value) => pathInRules(value, registry.governanceOnlyPaths));

  const selectedPlaces = hasFullMatrix
    ? places
    : places.filter((place) => paths.some((value) => pathMatchesPlace(value, place)));

  const unknown = paths.filter((value) => {
    const guarded = (registry.failClosedPrefixes ?? []).some((prefix) => value.startsWith(prefix));
    if (!guarded) return false;
    if (pathInRules(value, registry.fullMatrixPaths)) return false;
    if (pathInRules(value, registry.sharedContractPaths)) return false;
    if (pathInRules(value, registry.governanceOnlyPaths)) return false;
    return !places.some((place) => pathMatchesPlace(value, place));
  });

  let mode = 'governance-only';
  if (hasFullMatrix) mode = 'full-matrix';
  else if (hasSharedContract) mode = 'shared-contract';
  else if (selectedPlaces.length) mode = 'affected-places';
  else if (!governanceOnly && paths.length) mode = 'affected-places';

  const tests = (mode === 'affected-places' || mode === 'full-matrix')
    ? dedupe(selectedPlaces.flatMap((place) => place.tests ?? []))
    : [];
  const gates = mode === 'governance-only'
    ? ['place-governance']
    : mode === 'shared-contract'
      ? ['place-governance', 'place-contracts']
      : dedupe(['places', ...selectedPlaces.flatMap((place) => place.gates ?? [])]);

  return {
    mode,
    places: selectedPlaces.map((place) => place.id),
    tests,
    gates,
    unknown,
  };
}
