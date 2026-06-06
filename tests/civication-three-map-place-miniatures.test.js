#!/usr/bin/env node
// tests/civication-three-map-place-miniatures.test.js
//
// Validerer place-miniatyr-logikken i js/Civication/ui/CivicationThreeMap.js mot
// de faktiske History Go-place-dataene – uten WebGL/DOM. Laster den ekte filen
// (med stubbede browser-globaler) og kaller de eksponerte, rene funksjonene, så
// vi tester produksjonskoden og ikke en kopi.
//
// Dekker:
//   - Del 3/4: type-katalog komplett + resolvePlaceMiniatureType gir alltid en
//              gyldig type for hvert Oslo-place (aldri undefined/«hull»).
//   - Del 2:   alias-nøkler er ekte landmark-id-er, og dedupeLandmarkPlaces velger
//              ett kanonisk (eksakt) sted per landemerke (teater foran «… stasjon»).
//   - Del 5:   placeLodLevel-terskler + LOD-grenser innenfor spesifikasjonen.
//   - Del 6:   priorityOfPlace gir landemerke-/stadion-steder høyere score enn
//              et generisk gatepunkt.
//
// Kjør:  node tests/civication-three-map-place-miniatures.test.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function loadScript(relPath) {
  const code = fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));
}

function placesFromFileData(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data && data.places)) return data.places;
  return [];
}

const OSLO_FILTER = { minLat: 59.75, maxLat: 60.10, minLon: 10.45, maxLon: 11.00 };
function isOslo(p) {
  const lat = Number(p.lat), lon = Number(p.lon);
  if (Number.isFinite(lat) && Number.isFinite(lon) &&
      lat >= OSLO_FILTER.minLat && lat <= OSLO_FILTER.maxLat &&
      lon >= OSLO_FILTER.minLon && lon <= OSLO_FILTER.maxLon) return true;
  const cm = p.civiMap || {};
  if (String(cm.region || '').toLowerCase() === 'oslo') return true;
  if (String(p.city || '').toLowerCase() === 'oslo') return true;
  return false;
}

function loadOsloPlaces() {
  const manifest = readJSON('data/places/manifest.json');
  const seen = new Set();
  const out = [];
  for (const rel of (manifest.files || [])) {
    const file = path.join(repoRoot, 'data', rel);
    if (!fs.existsSync(file)) continue;
    let data;
    try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
    for (const p of placesFromFileData(data)) {
      if (!p || !p.id || seen.has(p.id)) continue;
      if (!isOslo(p)) continue;
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}

// The 25 archetypene som Del 3 krever.
const REQUIRED_TYPES = [
  'museum', 'gallery', 'theatre', 'library', 'church', 'school', 'university',
  'station', 'stadium', 'sports_field', 'ice_arena', 'park', 'playground',
  'square', 'street', 'waterfront', 'fortress', 'civic', 'music_venue',
  'cinema', 'subculture', 'industrial', 'commerce', 'apartment', 'default'
];

function run() {
  // Stub browser-globaler slik at IIFE-en kan lastes i node. init() returnerer
  // tidlig fordi CIVICATION_THREE_MAP_ENABLED ikke er true, så Three.js trengs ikke.
  global.window = global;
  global.document = {
    readyState: 'complete',
    addEventListener() {},
    getElementById() { return null; },
    body: { classList: { contains() { return false; }, add() {}, remove() {} } }
  };
  global.addEventListener = () => {};

  // Kalibreringen er nyttig for priority (sentrumsbonus), men ikke påkrevd.
  loadScript('js/Civication/ui/CivicationOsloMapCalibration.js');
  loadScript('js/Civication/ui/CivicationThreeMap.js');

  const M = global.window.CivicationThreeMap;
  assert.ok(M, 'window.CivicationThreeMap skal være registrert');
  ['resolvePlaceMiniatureType', 'matchLandmarkForPlace', 'priorityOfPlace',
   'placeLodLevel', 'getPlaceMiniatureTypeKeys', 'getPlaceLodLimits',
   'getHandModeledPlaceAliases', 'getLandmarkDedup', 'getLandmarkPositions']
    .forEach((fn) => assert.strictEqual(typeof M[fn], 'function', `mangler API: ${fn}`));

  const places = loadOsloPlaces();
  assert.ok(places.length > 100, `forventet > 100 Oslo-places, fikk ${places.length}`);

  let passed = 0;
  const check = (name, fn) => { fn(); passed++; console.log(`  ✓ ${name}`); };

  // --- Del 3: type-katalog komplett ---
  check('type-katalogen inneholder alle 25 påkrevde arketyper', () => {
    const keys = new Set(M.getPlaceMiniatureTypeKeys());
    const missing = REQUIRED_TYPES.filter((t) => !keys.has(t));
    assert.deepStrictEqual(missing, [], `mangler typer: ${missing.join(', ')}`);
  });

  // --- Del 4: resolveren gir alltid en gyldig type ---
  check('resolvePlaceMiniatureType gir en gyldig type for hvert Oslo-place', () => {
    const keys = new Set(M.getPlaceMiniatureTypeKeys());
    const bad = [];
    for (const p of places) {
      const t = M.resolvePlaceMiniatureType(p);
      if (!t || !keys.has(t)) bad.push(`${p.id}=${t}`);
    }
    assert.deepStrictEqual(bad, [], `ugyldig type for: ${bad.slice(0, 10).join(', ')}`);
  });

  // --- Del 4: kjente steder mapper til forventet type ---
  check('kjente Oslo-steder mapper til forventet miniatyrtype', () => {
    const byId = new Map(places.map((p) => [p.id, p]));
    const expect = {
      ullevaal_stadion: 'stadium',
      bislett_stadion: 'stadium',
      jordal_amfi: 'ice_arena',
      nasjonalmuseet: 'museum',
      oslo_domkirke: 'church'
    };
    for (const [id, want] of Object.entries(expect)) {
      const p = byId.get(id);
      if (!p) continue; // tåler datasett-endringer
      const got = M.resolvePlaceMiniatureType(p);
      assert.strictEqual(got, want, `${id}: forventet ${want}, fikk ${got}`);
    }
  });

  // --- Del 2: alias-nøkler er ekte landmark-id-er ---
  check('alle alias-nøkler er gyldige håndmodellerte landmark-id-er', () => {
    const aliases = M.getHandModeledPlaceAliases();
    const landmarkIds = new Set(M.getLandmarkPositions().map((l) => l.id));
    const unknown = Object.keys(aliases).filter((k) => !landmarkIds.has(k));
    assert.deepStrictEqual(unknown, [], `ukjente landmark-id-er: ${unknown.join(', ')}`);
  });

  // --- Del 2: dedup velger ett kanonisk sted per landemerke ---
  check('dedupeLandmarkPlaces velger ett kanonisk (eksakt) sted per landemerke', () => {
    const dedup = M.getLandmarkDedup(places);
    // Hvert landemerke peker på nøyaktig én placeId, og ingen kollisjon i targets.
    const ids = Object.values(dedup.canonical);
    assert.ok(ids.length >= 1, 'forventet minst ett landemerke-koblet place');
    // hiddenCount >= antall kanoniske (duplikater telles i tillegg).
    assert.ok(dedup.hiddenCount >= ids.length, 'hiddenCount skal dekke alle skjulte');
    // Teater foran stasjon: hvis begge finnes skal nationaltheatret-landemerket
    // koble til selve teateret, ikke «… stasjon».
    const hasTheatre = places.some((p) => p.id === 'nationaltheatret');
    if (hasTheatre && dedup.canonical.nationaltheatret) {
      assert.strictEqual(dedup.canonical.nationaltheatret, 'nationaltheatret',
        `nationaltheatret-landemerket koblet feil sted: ${dedup.canonical.nationaltheatret}`);
    }
    // Et place som er kanonisk for et landemerke skal ikke også ligge i kandidat-
    // settet (candidateCount + skjulte = totalen er ikke garantert pga. ikke-Oslo,
    // men kandidater + hiddenCount skal ikke overstige totalen).
    assert.ok(dedup.candidateCount + dedup.hiddenCount <= places.length,
      'kandidater + skjulte kan ikke overstige totalt antall places');
  });

  // --- Del 5: LOD-terskler ---
  check('placeLodLevel har riktige zoom-terskler', () => {
    assert.strictEqual(M.placeLodLevel(0.7), 'low');
    assert.strictEqual(M.placeLodLevel(1.4), 'low');
    assert.strictEqual(M.placeLodLevel(1.41), 'mid');
    assert.strictEqual(M.placeLodLevel(2.6), 'mid');
    assert.strictEqual(M.placeLodLevel(2.61), 'high');
    assert.strictEqual(M.placeLodLevel(4.0), 'high');
    assert.strictEqual(M.placeLodLevel(4.01), 'veryHigh');
  });

  // --- Del 5: LOD-grenser innenfor spesifikasjonen ---
  check('LOD-grensene ligger innenfor spesifiserte intervaller', () => {
    const lim = M.getPlaceLodLimits();
    assert.ok(lim.low >= 20 && lim.low <= 30, `low=${lim.low} utenfor 20–30`);
    assert.ok(lim.mid >= 70 && lim.mid <= 100, `mid=${lim.mid} utenfor 70–100`);
    assert.ok(lim.high >= 160 && lim.high <= 220, `high=${lim.high} utenfor 160–220`);
    assert.ok(lim.veryHigh >= lim.high, `veryHigh=${lim.veryHigh} skal være >= high`);
  });

  // --- Del 6: prioritering ---
  check('priorityOfPlace rangerer landemerke/stadion over generisk gatepunkt', () => {
    const generic = { id: 'tilfeldig_gate_xyz', name: 'Tilfeldig gate', category: 'by', lat: 59.92, lon: 10.75 };
    const stadiumPlace = places.find((p) => M.resolvePlaceMiniatureType(p) === 'stadium')
      || { id: 'ullevaal_stadion', name: 'Ullevaal Stadion', category: 'sport', lat: 59.949, lon: 10.734 };
    assert.ok(M.priorityOfPlace(stadiumPlace) > M.priorityOfPlace(generic),
      'stadion skal prioriteres foran generisk gatepunkt');
  });

  console.log(`\nPASS: ${passed} sjekker (mot ${places.length} Oslo-places).`);
}

try {
  console.log('CivicationThreeMap – place-miniatyr-validering');
  run();
} catch (err) {
  console.error('\nFAIL:', err && err.message ? err.message : err);
  process.exit(1);
}
