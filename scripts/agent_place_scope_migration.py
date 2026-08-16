from pathlib import Path
import json
import re

ROOT = Path('.')
MANIFEST = ROOT / 'data/places/manifest.json'
AREA_QUIZ_TYPES = {
    'omrade', 'område', 'boligomrade', 'boligområde', 'bydel', 'by', 'tettstad',
    'ladested', 'ladested_og_ferdselssted', 'alternativ_bydel'
}


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'{path}: expected source text not found')
    target.write_text(text.replace(old, new, 1), encoding='utf-8')


def write(path: str, content: str) -> None:
    (ROOT / path).write_text(content, encoding='utf-8')


manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
migrated = []
for rel in manifest.get('files', []):
    path = ROOT / 'data' / rel
    data = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(data, dict):
        continue
    quiz_type = str((data.get('quiz_profile') or {}).get('place_type') or '').strip().lower()
    coord_type = str(data.get('coordType') or '').strip().lower()
    is_explicit_area = coord_type == 'district_anchor' or quiz_type in AREA_QUIZ_TYPES
    if not is_explicit_area:
        continue
    if data.get('placeScope') not in (None, 'area'):
        raise SystemExit(f'{rel}: conflicting placeScope={data.get("placeScope")!r}')
    if data.get('placeScope') == 'area':
        migrated.append((str(data.get('id') or ''), rel))
        continue

    text = path.read_text(encoding='utf-8')
    match = re.search(r'^(\s*)"name"\s*:\s*.*?,\s*$', text, flags=re.MULTILINE)
    if not match:
        raise SystemExit(f'{rel}: could not find stable name insertion point')
    indent = match.group(1)
    insertion = match.group(0) + '\n' + indent + '"placeScope": "area",'
    text = text[:match.start()] + insertion + text[match.end():]
    parsed = json.loads(text)
    if parsed.get('placeScope') != 'area':
        raise SystemExit(f'{rel}: placeScope insertion failed')
    path.write_text(text, encoding='utf-8')
    migrated.append((str(parsed.get('id') or ''), rel))

if len(migrated) != 38:
    raise SystemExit(f'Expected 38 explicit area Places in this migration snapshot, got {len(migrated)}')
if len({item[0] for item in migrated}) != len(migrated):
    raise SystemExit('Duplicate area Place ids in migration set')
print('Migrated explicit area Places:', len(migrated))
for place_id, rel in sorted(migrated):
    print(f'  {place_id}: {rel}')

replace_once(
    'js/map.ts',
    '  const PLACE_DETAIL_MIN_ZOOM = 12;\n  const PLACE_ZOOM_LOD_FILTER: any = ["any", [">=", ["zoom"], PLACE_DETAIL_MIN_ZOOM], ["==", ["get", "isAreaPlace"], 1]];',
    '  const PLACE_DETAIL_MIN_ZOOM = 12;\n  const PLACE_SCOPE_AREA = "area";\n  const PLACE_ZOOM_LOD_FILTER: any = ["any", [">=", ["zoom"], PLACE_DETAIL_MIN_ZOOM], ["==", ["get", "isAreaPlace"], 1]];'
)
replace_once(
    'js/map.ts',
    '  function isAreaPlace(place) {\n    const coordRole = String(place?.coordRole || "").trim().toLowerCase();\n    const coordType = String(place?.coordType || "").trim().toLowerCase();\n    return coordRole === "area_anchor" || coordType === "district_anchor" || coordType.endsWith("_area_anchor");\n  }',
    '  function isAreaPlace(place) {\n    return String(place?.placeScope || "").trim().toLowerCase() === PLACE_SCOPE_AREA;\n  }'
)

replace_once(
    'docs/SPRAKLEKSIKON.md',
    'For **område-Places** er dialektord og lokale uttrykk en **obligatorisk produksjonsjobb**. Det gjelder steder som faktisk representerer et strøk, en bydel, by/bygd, ladested eller annet dokumentert lokalt miljø. `coordRole: "area_anchor"` er den primære eksisterende datamarkøren for slikt områdeeierskap. `coordType: "district_anchor"` og tilsvarende dokumentert områdeidentitet kan støtte klassifiseringen, men skal ikke brukes til å overstyre hva place-objektet faktisk representerer.',
    'For **område-Places** er dialektord og lokale uttrykk en **obligatorisk produksjonsjobb**. Det gjelder steder som faktisk representerer et strøk, en bydel, by/bygd, ladested eller annet dokumentert lokalt miljø. `placeScope: "area"` er den canonicale semantiske datamarkøren for slikt områdeeierskap. `coordRole` og `coordType` beskriver hvordan et sted eller en flate er koordinatfestet; `area_anchor`, `park_anchor`, sentroid- og andre geometriske ankertyper gir derfor **ikke** områdeeierskap alene. Eldre `district_anchor`- og eksplisitte områdeklassifikasjoner brukes bare som migreringsbelegg for å sette `placeScope` eksplisitt.'
)

replace_once(
    'docs/PLACE_PRODUCTION_CHECKLIST.md',
    'KOORDINATSTATUS:\nDESCRIPTION-PRODUCTION-PACKAGE:',
    'KOORDINATSTATUS:\nPLACE-SCOPE (canonical): `area` / ikke satt\nDESCRIPTION-PRODUCTION-PACKAGE:'
)
replace_once(
    'docs/PLACE_PRODUCTION_CHECKLIST.md',
    '### Språk — direkte fane når relevant',
    '''### Place-scope — semantisk områdeeierskap\n\n- [ ] `placeScope: "area"` settes bare når Place faktisk representerer et geografisk, urbant eller lokalt område som brukeren kan forstå som et område — for eksempel strøk, bydel, by/bygd, tettsted eller ladested;\n- [ ] `coordRole` og `coordType` beskriver koordinatgeometri og kan **ikke** alene gjøre et Place til område-Place; parker, torg, stadioner, gravlunder, museer, festninger og andre fysiske flater blir ikke område-Places bare fordi koordinaten bruker `area_anchor`;\n- [ ] nye område-Places får `placeScope` eksplisitt i canonical Place-data; runtime skal ikke gjette områdeeierskap fra navn, kategori eller koordinatrolle;\n- [ ] ved lav kartzoom er `placeScope: "area"` den eneste Place-klassen som beholder vanlig place-prikk, label og klikkeflate; detalj-Places kommer tilbake ved innzooming;\n- [ ] et område-Place kan eie områdebundet språk og relasjoner, mens underliggende enkeltsteder peker til områdeeieren i stedet for å kopiere samme innhold.\n\n**Stoppgate:** `area_anchor` er ikke synonymt med område-Place. Semantisk scope og koordinatankertype skal holdes som to separate kontrakter.\n\n### Språk — direkte fane når relevant'''
)
replace_once(
    'docs/PLACE_PRODUCTION_CHECKLIST.md',
    '- [ ] `coordRole: "area_anchor"` behandles som primær eksisterende markør for områdeeierskap; dokumentert `district_anchor`/områdeidentitet kan støtte vurderingen;',
    '- [ ] `placeScope: "area"` er canonical markør for områdeeierskap; `coordRole`/`coordType` er bare koordinatgeometri og gir ikke språk-eierskap alene;\n- [ ] ved migrering kan eksplisitt `district_anchor`, `quiz_profile.place_type: "omrade"` og andre klart semantiske områdeklassifikasjoner brukes som belegg, men resultatet skal lagres som `placeScope: "area"`;'
)

map_test = r'''import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const json = relative => JSON.parse(read(relative));

const source = read("js/map.ts");
const legacy = read("js/map.js");
const dist = read("dist/web/map.js");

test("kartets detalj-LOD bruker canonical placeScope=area og zoom 12", () => {
  assert.match(source, /PLACE_DETAIL_MIN_ZOOM\s*=\s*12/);
  assert.match(source, /PLACE_SCOPE_AREA\s*=\s*"area"/);
  assert.match(source, /place\?\.placeScope/);
  assert.match(source, /isAreaPlace:\s*isAreaPlace\(p\) \? 1 : 0/);
  assert.match(source, /\[">=", \["zoom"\], PLACE_DETAIL_MIN_ZOOM\]/);
  assert.match(source, /\["==", \["get", "isAreaPlace"\], 1\]/);

  const areaFn = source.match(/function isAreaPlace\(place\) \{[\s\S]*?\n  \}/)?.[0] || "";
  assert.match(areaFn, /placeScope/);
  assert.doesNotMatch(areaFn, /coordRole|coordType|area_anchor|district_anchor/);
});

test("samme LOD-filter beskytter prikk, halo, label og klikkeflate", () => {
  for (const layer of ["L_GLOW", "L_DOTS", "L_LAB", "L_HIT"]) {
    const pattern = new RegExp(`id: ${layer},\\n\\s*filter: PLACE_ZOOM_LOD_FILTER`);
    assert.match(source, pattern, `mangler LOD-filter på ${layer}`);
  }
});

test("eksplisitte område-Places har placeScope, mens geometriske area_anchor ikke arver scope", () => {
  const sagene = json("data/places/by/oslo/places/sagene.json");
  const alfama = json("data/places/by/europe/portugal/lisbon/places_lisbon_by/lisbon_alfama.json");
  const son = json("data/places/by/akershus/son_ladested/son_ladested.json");
  const etne = json("data/places/by/vestland/etne/etnesjoen_tettstad/etnesjoen_tettstad.json");
  const svartlamon = json("data/places/subkultur/trondelag/svartlamon_trondheim/svartlamon_trondheim.json");
  const park = json("data/places/by/oslo/places/st_hanshaugen_park.json");
  const square = json("data/places/by/oslo/places/radhusplassen.json");

  for (const place of [sagene, alfama, son, etne, svartlamon]) {
    assert.equal(place.placeScope, "area", `${place.id}: mangler canonical area scope`);
  }
  assert.notEqual(park.placeScope, "area", "park med area_anchor skal ikke bli område-Place automatisk");
  assert.notEqual(square.placeScope, "area", "torg/plass med area_anchor skal ikke bli område-Place automatisk");
});

test("permanent scope-audit låser semantikk uten områdekvote", () => {
  const audit = read("scripts/audit-place-scope.mjs");
  assert.match(audit, /placeScope/);
  assert.match(audit, /district_anchor/);
  assert.match(audit, /boligomrade/);
  assert.match(audit, /ladested/);
  assert.doesNotMatch(audit, /minimum|min_count|quota/i);
});

test("TypeScript source og begge committed runtime-builds inneholder område-LOD", () => {
  for (const [name, code] of [["source", source], ["legacy", legacy], ["dist", dist]]) {
    assert.match(code, /isAreaPlace/, `${name}: mangler isAreaPlace`);
    assert.match(code, /placeScope/, `${name}: mangler canonical placeScope`);
    assert.match(code, /PLACE_DETAIL_MIN_ZOOM|12/, `${name}: mangler detaljzoom`);
  }
});
'''
write('tests/map-place-area-lod.test.mjs', map_test)

language_test = ROOT / 'tests/place-language-layer.test.mjs'
language_text = language_test.read_text(encoding='utf-8')
marker = 'områdeeierskap bruker canonical placeScope'
if marker not in language_text:
    language_text += r'''


test("områdeeierskap bruker canonical placeScope, ikke koordinatrollen", () => {
  const checklist = read("docs/PLACE_PRODUCTION_CHECKLIST.md");
  const contract = read("docs/SPRAKLEKSIKON.md");
  assert.match(checklist, /placeScope:\s*"area"/);
  assert.match(contract, /placeScope:\s*"area"/);
  assert.match(contract, /coordRole[\s\S]{0,180}koordinat/i);
  assert.doesNotMatch(contract, /coordRole:\s*"area_anchor"[^\n]*primær/i);
});
'''
    language_test.write_text(language_text, encoding='utf-8')

audit_script = r'''import fs from "node:fs";
import path from "node:path";

const manifest = JSON.parse(fs.readFileSync("data/places/manifest.json", "utf8"));
const areaQuizTypes = new Set([
  "omrade", "område", "boligomrade", "boligområde", "bydel", "by", "tettstad",
  "ladested", "ladested_og_ferdselssted", "alternativ_bydel"
]);
const allowedScopes = new Set(["area"]);
const errors = [];
const scoped = [];

for (const rel of manifest.files || []) {
  const file = path.join("data", rel);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const items = Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : [data];
  for (const place of items) {
    if (!place || typeof place !== "object" || (!place.id && !place.name)) continue;
    const scope = String(place.placeScope || "").trim().toLowerCase();
    const coordType = String(place.coordType || "").trim().toLowerCase();
    const quizType = String(place.quiz_profile?.place_type || "").trim().toLowerCase();
    const legacyExplicitArea = coordType === "district_anchor" || areaQuizTypes.has(quizType);

    if (scope && !allowedScopes.has(scope)) {
      errors.push(`${rel}/${place.id || place.name}: ukjent placeScope ${JSON.stringify(scope)}`);
    }
    if (legacyExplicitArea && scope !== "area") {
      errors.push(`${rel}/${place.id || place.name}: eksplisitt områdeklassifikasjon mangler placeScope=area`);
    }
    if (scope === "area") {
      scoped.push({ id: place.id || "", name: place.name || "", file: rel });
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`placeScope audit ok: ${scoped.length} eksplisitte område-Places`);
'''
write('scripts/audit-place-scope.mjs', audit_script)

print('Canonical placeScope source/docs/tests/audit patch applied')
