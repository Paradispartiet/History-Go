from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def write(path, value):
    (ROOT / path).write_text(value, encoding="utf-8")


def replace_once(path, old, new):
    value = read(path)
    count = value.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one occurrence, got {count}: {old[:100]!r}")
    write(path, value.replace(old, new, 1))


# 1. Refine dialect ownership by canonical place scope.
path = "docs/SPRAKLEKSIKON.md"
value = read(path)
section7 = """## 7. Dialektord og lokale uttrykk — områdeeierskap styrer kravet

Dialektord og lokale uttrykk skal ikke presses inn på alle Places. Før språkproduksjon klassifiseres place-objektets **canonical identitet**: representerer det et område/språkmiljø, et enkeltsted, eller et enkeltsted med en direkte dokumentert språkhistorie?

For **område-Places** er dialektord og lokale uttrykk en **obligatorisk produksjonsjobb**. Det gjelder steder som faktisk representerer et strøk, en bydel, by/bygd, ladested eller annet dokumentert lokalt miljø. `coordRole: "area_anchor"` er den primære eksisterende datamarkøren for slikt områdeeierskap. `coordType: "district_anchor"` og tilsvarende dokumentert områdeidentitet kan støtte klassifiseringen, men skal ikke brukes til å overstyre hva place-objektet faktisk representerer.

Produksjonsregelen er:

- et område-Place skal ha et eksplisitt researchspor etter dokumenterte dialektord, lokale ordformer, lokale uttrykk og talemåter som kan knyttes til området eller det dokumenterte dialektmiljøet;
- det skal søkes aktivt i ordbøker, dialektarkiv, lokale historiesamlinger, talemålsmateriale og andre relevante kilder — ikke bare i eksisterende History GO-data;
- når kildene bærer det, skal minst ett reelt kildebelagt **dialektord eller lokalt uttrykk** produseres som `word` eller `expression`;
- et område-Språkleksikon som bare består av stedsnavn, administrative fagord eller generelt norsk regnes ikke som redaksjonelt ferdig dersom researchen dokumenterer lokale ordformer eller uttrykk;
- betydning, geografisk utbredelse og historisk/moderne status skal avgrenses etter kilden;
- dialektord skal aldri konstrueres, moderniseres eller gjøres «mer lokale» av språkmodell eller redaksjonell gjetning;
- dersom et dokumentert søk faktisk ikke finner et forsvarlig dialektord/lokalt uttrykk, registreres søket og kildene som begrunnet holdback/N/A for akkurat denne deljobben. Fravær skal dokumenteres, ikke fylles med oppdiktet språk.

For **enkelt-Places** — for eksempel et enkelt bygg, en institusjon, et monument, et kunstverk eller et annet avgrenset objekt — er geografisk plassering i et dialektområde **ikke nok** til å kreve dialektord. Slike steder får `word`/`expression` bare når ordet, kallenavnet, talemåten, fag-/arbeidsspråket eller språkfenomenet har en direkte dokumentert forbindelse til akkurat stedet.

Gater, markeder, havner, arbeidsmiljøer og andre avgrensede miljøer kan derfor få lokale ord selv om de ikke er område-Places, men bare når den direkte stedstilknytningen er dokumentert. Generelle Oslo-, Sagene- eller Østfold-ord skal ikke kopieres inn i hvert enkelt Place som ligger der.

### Canonical språk-eier

Et språkfenomen skal som hovedregel eies av **nærmeste relevante område-Place**. Et Sagene-ord eies derfor av Sagene når kildene gjelder Sagene som språkmiljø. En skole, fabrikk eller bygning på Sagene kan peke til språksporet gjennom `related_places` / `related_entries` når det er relevant, i stedet for å opprette en konkurrerende kopi.

Unntaket er når enkeltstedet selv er den dokumenterte språk-eieren — for eksempel et lokalt kallenavn på bygget, et uttrykk som oppstod ved arbeidsplassen eller et stedsspesifikt fagord.

Dette er et produksjonskrav for relevante Språkleksikon, ikke et krav om at alle steder i History GO må ha en språkfane.

"""
value, count = re.subn(r"## 7\. Dialektord og lokale uttrykk.*?(?=## 8\. Presentasjon i stedspopupen\n)", section7, value, count=1, flags=re.S)
if count != 1:
    raise SystemExit("SPRAKLEKSIKON: could not replace section 7")
write(path, value)

path = "docs/PLACE_PRODUCTION_CHECKLIST.md"
value = read(path)
value = value.replace(
    "SPRÅKLEKSIKON-STATUS:\nDIALEKTORD/LOKALE UTTRYKK — RESEARCH OG PRODUKSJON:",
    "SPRÅKLEKSIKON-STATUS:\nSPRÅK-PLACE-SCOPE — OMRÅDE / DIREKTE SPRÅKSTED / ENKELTSTED:\nDIALEKTORD/LOKALE UTTRYKK — RESEARCH OG PRODUKSJON:",
    1,
)
new_language_block = """### Språk — direkte fane når relevant
**LES FØRST — obligatorisk ved Språkleksikon-produksjon:** `docs/SPRAKLEKSIKON.md`

- [ ] eksisterende Språkleksikon-record og språkmanifest er søkt;
- [ ] place-objektet er klassifisert som **område-Place**, **direkte språksted** eller **enkeltsted** ut fra canonical identitet — ikke bare navn;
- [ ] `coordRole: "area_anchor"` behandles som primær eksisterende markør for områdeeierskap; dokumentert `district_anchor`/områdeidentitet kan støtte vurderingen;
- [ ] for **område-Place** er navnehistorie, ordbruk, dialektord, lokale uttrykk, talemålsmateriale og andre relevante språklag undersøkt i eksterne kilder;
- [ ] for **område-Place** produseres minst ett reelt, kildebelagt **dialektord eller lokalt uttrykk** som `word` eller `expression` når kildene bærer det — området skal ikke stoppe ved bare navn eller generelle fagord når lokale former finnes;
- [ ] for **enkeltsted** er dialektord ikke et krav bare fordi stedet ligger i et dialektområde; ord/uttrykk produseres bare når det finnes en direkte dokumentert språklig forbindelse til akkurat stedet;
- [ ] gater, markeder, havner, arbeidsmiljøer og lignende behandles som **direkte språksted** bare når den lokale ordbruken faktisk er dokumentert for miljøet;
- [ ] et generelt områdeord eies av nærmeste relevante område-Place og dupliseres ikke inn i underliggende bygg/institusjoner; relevante enkeltsteder bruker `related_places` / `related_entries`;
- [ ] betydning, eksempel, geografisk utbredelse og historisk/moderne status avgrenses etter kildene;
- [ ] dialektord eller lokale uttrykk skal ikke diktes, normaliseres fram eller konstrueres av språkmodell;
- [ ] dersom eksplisitt søk på et område-Place ikke finner et forsvarlig dialektord/lokalt uttrykk, dokumenteres søkte kilder og begrunnet holdback/N/A for denne deljobben i stedet for filler;
- [ ] språkoppføringer er reelt sted- eller områdebundet og dupliserer ikke bare Om/Historie;
- [ ] brukerrettede kilder er inspectable HTTPS-lenker;
- [ ] tomt eksisterende språksett er aldri alene grunnlag for N/A.

**Stoppgate:** Et område-Språkleksikon kan ikke ferdigmeldes etter bare stedsnavn, administrative begreper eller generelle fagord dersom kildegrunnlaget dokumenterer lokale ordformer eller uttrykk. Et enkeltbygg eller en institusjon skal på den andre siden ikke få generelle områdeord bare for å fylle Språk-fanen. Manglende dokumenterbart dialektord etter reelt søk er lov; oppdiktet eller feil-eid dialektord er ikke lov.

"""
value, count = re.subn(r"### Språk — direkte fane når relevant\n.*?(?=### Datastyrte direkte tilleggsfaner\n)", new_language_block, value, count=1, flags=re.S)
if count != 1:
    raise SystemExit("PLACE_PRODUCTION_CHECKLIST: could not replace language block")
write(path, value)

# Strengthen the existing language contract test with area-vs-single ownership.
path = "tests/place-language-layer.test.mjs"
value = read(path)
old_test = '''test("place-produksjon låser dialektord som Språkleksikon-jobb", () => {\n  const checklist = read("docs/PLACE_PRODUCTION_CHECKLIST.md");\n  const contract = read("docs/SPRAKLEKSIKON.md");\n  assert.match(checklist, /dialektord/i);\n  assert.match(checklist, /lokalt uttrykk|lokale uttrykk/i);\n  assert.match(checklist, /skal ikke diktes/i);\n  assert.match(contract, /obligatorisk produksjonsjobb/i);\n  assert.match(contract, /minst ett reelt kildebelagt \\*\\*dialektord eller lokalt uttrykk\\*\\*/i);\n});'''
new_test = '''test("place-produksjon låser dialektord til riktig place-eier", () => {\n  const checklist = read("docs/PLACE_PRODUCTION_CHECKLIST.md");\n  const contract = read("docs/SPRAKLEKSIKON.md");\n  assert.match(checklist, /SPRÅK-PLACE-SCOPE — OMRÅDE \/ DIREKTE SPRÅKSTED \/ ENKELTSTED/);\n  assert.match(checklist, /coordRole: \"area_anchor\"/);\n  assert.match(checklist, /for \*\*enkeltsted\*\* er dialektord ikke et krav/i);\n  assert.match(checklist, /skal ikke diktes/i);\n  assert.match(contract, /obligatorisk produksjonsjobb/i);\n  assert.match(contract, /coordRole: \"area_anchor\"/);\n  assert.match(contract, /minst ett reelt kildebelagt \\*\\*dialektord eller lokalt uttrykk\\*\\*/i);\n  assert.match(contract, /geografisk plassering i et dialektområde \*\*ikke nok\*\*/i);\n  assert.match(contract, /nærmeste relevante område-Place/i);\n  assert.match(contract, /related_places.*related_entries/i);\n});'''
if old_test not in value:
    raise SystemExit("place-language-layer test block not found")
write(path, value.replace(old_test, new_test, 1))

# 2. Map LOD: below zoom 12 only canonical area points remain visible/clickable.
path = "js/map.ts"
value = read(path)
value = value.replace(
    '  const PLACE_LABEL_MIN_ZOOM = 13.8;\n',
    '  const PLACE_LABEL_MIN_ZOOM = 13.8;\n  const PLACE_DETAIL_MIN_ZOOM = 12;\n  const PLACE_ZOOM_LOD_FILTER: any = ["any", [">=", ["zoom"], PLACE_DETAIL_MIN_ZOOM], ["==", ["get", "isAreaPlace"], 1]];\n',
    1,
)
marker = '  function drawPlaceMarkers() {\n'
helper = '''  function isAreaPlace(place) {\n    const coordRole = String(place?.coordRole || "").trim().toLowerCase();\n    const coordType = String(place?.coordType || "").trim().toLowerCase();\n    return coordRole === "area_anchor" || coordType === "district_anchor" || coordType.endsWith("_area_anchor");\n  }\n\n'''
if marker not in value:
    raise SystemExit("map.ts: drawPlaceMarkers marker missing")
value = value.replace(marker, helper + marker, 1)
value = value.replace(
    '          visited: isVisited ? 1 : 0,\n          coordinateTrust,',
    '          visited: isVisited ? 1 : 0,\n          isAreaPlace: isAreaPlace(p) ? 1 : 0,\n          coordinateTrust,',
    1,
)
for layer_id in ["L_GLOW", "L_DOTS", "L_LAB", "L_HIT"]:
    old = f'''      id: {layer_id},\n      type: '''
    new = f'''      id: {layer_id},\n      filter: PLACE_ZOOM_LOD_FILTER,\n      type: '''
    if old not in value:
        raise SystemExit(f"map.ts: layer marker missing for {layer_id}")
    value = value.replace(old, new, 1)
value = value.replace(
    '    getCoordinateTrust,\n\n    maybeDrawMarkers,',
    '    getCoordinateTrust,\n    isAreaPlace,\n\n    maybeDrawMarkers,',
    1,
)
write(path, value)

# New static/runtime-contract test: data signal + source/build contract.
map_test = '''import test from "node:test";\nimport assert from "node:assert/strict";\nimport fs from "node:fs";\nimport path from "node:path";\nimport { fileURLToPath } from "node:url";\n\nconst root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");\nconst read = relative => fs.readFileSync(path.join(root, relative), "utf8");\nconst json = relative => JSON.parse(read(relative));\n\nconst source = read("js/map.ts");\nconst legacy = read("js/map.js");\nconst dist = read("dist/web/map.js");\n\ntest("kartets detalj-LOD bruker canonical area_anchor og zoom 12", () => {\n  assert.match(source, /PLACE_DETAIL_MIN_ZOOM\\s*=\\s*12/);\n  assert.match(source, /coordRole === \"area_anchor\"/);\n  assert.match(source, /coordType === \"district_anchor\"/);\n  assert.match(source, /isAreaPlace:\\s*isAreaPlace\\(p\\) \\? 1 : 0/);\n  assert.match(source, /\\[\">=\", \\[\"zoom\"\\], PLACE_DETAIL_MIN_ZOOM\\]/);\n  assert.match(source, /\\[\"==\", \\[\"get\", \"isAreaPlace\"\\], 1\\]/);\n});\n\ntest("samme LOD-filter beskytter prikk, halo, label og klikkeflate", () => {\n  for (const layer of ["L_GLOW", "L_DOTS", "L_LAB", "L_HIT"]) {\n    const pattern = new RegExp(`id: ${layer},\\\\n\\\\s*filter: PLACE_ZOOM_LOD_FILTER`);\n    assert.match(source, pattern, `mangler LOD-filter på ${layer}`);\n  }\n});\n\ntest("område-Places i dagens data har canonical area_anchor", () => {\n  const sagene = json("data/places/by/oslo/places/sagene.json");\n  const torshov = json("data/places/by/oslo/places/torshov.json");\n  const son = json("data/places/by/akershus/son_ladested/son_ladested.json");\n  assert.equal(sagene.coordRole, "area_anchor");\n  assert.equal(torshov.coordRole, "area_anchor");\n  assert.equal(son.coordRole, "area_anchor");\n});\n\ntest("TypeScript source og begge committed runtime-builds inneholder område-LOD", () => {\n  for (const [name, code] of [["source", source], ["legacy", legacy], ["dist", dist]]) {\n    assert.match(code, /isAreaPlace/ , `${name}: mangler isAreaPlace`);\n    assert.match(code, /PLACE_DETAIL_MIN_ZOOM|place_detail_min_zoom|12/, `${name}: mangler detaljzoom`);\n  }\n});\n'''
write("tests/map-place-area-lod.test.mjs", map_test)

# One-shot helper removes itself from the final feature diff.
Path(__file__).unlink()
