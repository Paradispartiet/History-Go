from pathlib import Path
import re


def replace_once(path, old, new):
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"{path}: expected text not found: {old[:120]!r}")
    p.write_text(text.replace(old, new, 1), encoding="utf-8")


def regex_once(path, pattern, replacement):
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    updated, count = re.subn(pattern, lambda _match: replacement, text, count=1)
    if count != 1:
        raise SystemExit(f"{path}: expected one regex replacement, got {count}")
    p.write_text(updated, encoding="utf-8")


# Canonical Språkleksikon contract: Språkleksikon may be place-specific; dialect ownership is area-only.
replace_once(
    "docs/SPRAKLEKSIKON.md",
    "Språkleksikonet er History GOs system for språk som faktisk er knyttet til steder. Det bygger videre på det eksisterende Leksikon-laget; det er **ikke** en ny dialektmotor, en ny PlaceCard-runding, et nytt History GO-fag eller en separat samlingsdatabase.\n",
    "Språkleksikonet er History GOs system for språk som faktisk er knyttet til steder. Det bygger videre på det eksisterende Leksikon-laget; det er **ikke** en ny dialektmotor, en ny PlaceCard-runding, et nytt History GO-fag eller en separat samlingsdatabase.\n\n**Språkleksikon og dialektlag er ikke synonymer.** Språkleksikon kan finnes på alle typer Places når stedet har dokumentert språkstoff. Dialektlaget er en avgrenset innholdsfamilie inne i Språkleksikonet og kan bare eies av et canonical Place med `placeScope: \"area\"`.\n",
)
replace_once(
    "docs/SPRAKLEKSIKON.md",
    "- `audio`\n- `dialect_area`",
    "- `audio`\n- `layer` (`language` / `dialect`)\n- `dialect_area`",
)

dialect_section = '''## 7. Språkleksikon og dialektlag — hardt skille

Språkleksikonet kan brukes på alle typer Places når språkstoffet har en direkte, dokumentert stedstilknytning. **Dialektlaget er strengere:** Dialektlaget kan bare eies av et canonical Place med `placeScope: "area"`. Det finnes ingen unntak for gater, bygg, institusjoner, markeder, havner, arbeidsplasser eller andre enkelt-Places.

Dette betyr:

- et område-Place kan eie både vanlig Språkleksikon og dialektinnhold;
- enkelt-Places kan ha Språkleksikon med historiske navn, kallenavn, fagord, arbeidsspråk, stedsspesifikke ord og uttrykk eller annen dokumentert språkbruk;
- enkelt-Places skal **ikke** få `layer: "dialect"`, `dialect_area` eller `dialect_feature`, selv når stedet ligger i et dialektområde;
- et stedsspesifikt uttrykk som faktisk oppstod ved et enkeltsted kan eies av enkeltstedets Språkleksikon som vanlig språkinnhold, men gjør ikke enkeltstedet til dialektområde eller dialekteier;
- generelle Sagene-, Oslo-, Østfold- eller andre områdeformer eies av nærmeste relevante område-Place og relateres videre, ikke kopieres til underliggende enkeltsteder.

### Canonical markør for dialektinnhold

Nyproduksjon skal merke dialektinnhold eksplisitt med `layer: "dialect"`. En oppføring regnes som del av dialektlaget når minst ett av disse forholdene gjelder:

- `layer: "dialect"`;
- canonical type er `dialect_feature` / `dialekttrekk`;
- `dialect_area` er satt på oppføringen eller språkfilen.

`word` og `expression` er **ikke automatisk dialekt**. På et område-Place skal et dialektord eller områdebundet lokalt uttrykk produseres som `word`/`expression` med `layer: "dialect"`. På et enkelt-Place kan `word`/`expression` brukes for dokumentert stedsspesifikt språk, men da er laget vanlig `language` og ikke dialekt.

### Produksjonsregel for område-Places

For Places med `placeScope: "area"` er dialektord og lokale talemålsformer en **obligatorisk researchjobb**. Det skal søkes aktivt i ordbøker, dialektarkiv, lokale historiesamlinger, talemålsmateriale og andre relevante eksterne kilder. Når kildene bærer det, skal minst ett reelt kildebelagt **dialektord eller lokalt uttrykk** produseres som `word` eller `expression` med `layer: "dialect"`.

Betydning, geografisk utbredelse og historisk/moderne status skal avgrenses etter kildene. Dialektord skal aldri konstrueres, moderniseres eller gjøres «mer lokale» av språkmodell eller redaksjonell gjetning. Dersom et dokumentert søk ikke finner et forsvarlig dialektord/lokalt uttrykk, registreres søkte kilder og begrunnet holdback/N/A i stedet for filler.

### Enkelt-Places og direkte språksteder

Enkelt-Places kan ha et rikt Språkleksikon, men ikke et dialektlag. Historiske gatenavn på Torggata, et dokumentert kallenavn på en bygning, et fagord ved Bislett stadion eller et arbeidsplassuttrykk kan være gyldig språkinnhold når kildene bærer det. Slike oppføringer skal ikke merkes som dialekt og skal ikke bruke et bredere dialektområde som om enkeltstedet eide det.

Gater, markeder, havner og arbeidsmiljøer kan fortsatt være **direkte språksteder** for stedsspesifikke uttrykk. «Direkte språksted» er en Språkleksikon-klassifisering, ikke en dialektklassifisering.

### Canonical dialekt-eier

Et dialektfenomen eies av **nærmeste relevante område-Place**. Et Sagene-ord eies av Sagene når kildene gjelder Sagene som språkmiljø. En skole, fabrikk, gate eller bygning på Sagene kan peke til språksporet gjennom `related_places` / `related_entries`, men oppretter ikke en konkurrerende dialektkopi.

**Stoppgate:** Dialektinnhold på et Place uten `placeScope: "area"` er en datamodellfeil. Flytt innholdet til riktig områdeeier eller klassifiser det som vanlig, direkte stedsspesifikt Språkleksikon dersom det faktisk tilhører enkeltstedet.

## 8. Presentasjon i stedspopupen'''
regex_once(
    "docs/SPRAKLEKSIKON.md",
    r"## 7\. Dialektord og lokale uttrykk — områdeeierskap styrer kravet\n[\s\S]*?\n## 8\. Presentasjon i stedspopupen",
    dialect_section,
)

# Place production checklist: separate language eligibility from dialect eligibility.
replace_once(
    "docs/PLACE_PRODUCTION_CHECKLIST.md",
    "SPRÅK-PLACE-SCOPE — OMRÅDE / DIREKTE SPRÅKSTED / ENKELTSTED:\nDIALEKTORD/LOKALE UTTRYKK — RESEARCH OG PRODUKSJON:",
    "SPRÅKLEKSIKON-TYPE — OMRÅDE / DIREKTE SPRÅKSTED / ENKELTSTED:\nDIALEKTLAG — KUN `placeScope: \"area\"` / N/A:\nDIALEKTORD/LOKALE UTTRYKK — RESEARCH OG PRODUKSJON:",
)

checklist_section = '''### Språk — direkte fane når relevant
**LES FØRST — obligatorisk ved Språkleksikon-produksjon:** `docs/SPRAKLEKSIKON.md`

- [ ] eksisterende Språkleksikon-record og språkmanifest er søkt;
- [ ] Språkleksikonet og dialektlaget er vurdert som **to forskjellige nivåer**: Språkleksikon kan finnes på alle Place-typer, dialektinnhold kan kun eies av et område-Place;
- [ ] place-objektet er klassifisert som **område-Place**, **direkte språksted** eller **enkeltsted** ut fra canonical identitet — ikke bare navn;
- [ ] `placeScope: "area"` er den eneste canonical tillatelsen til å eie dialektlaget; `coordRole`/`coordType` er bare koordinatgeometri og gir aldri dialekt-eierskap;
- [ ] `DIALEKTLAG` i arbeidskortet er satt til aktivt bare når `placeScope: "area"`; alle andre Places får N/A;
- [ ] for **område-Place** er navnehistorie, ordbruk, dialektord, lokale uttrykk, talemålsmateriale og andre relevante språklag undersøkt i eksterne kilder;
- [ ] for **område-Place** produseres minst ett reelt, kildebelagt **dialektord eller lokalt uttrykk** som `word` eller `expression` med `layer: "dialect"` når kildene bærer det;
- [ ] nyproduksjon som er dialekt merkes eksplisitt med `layer: "dialect"`; `dialect_feature` og `dialect_area` regnes alltid som dialektinnhold og krever derfor `placeScope: "area"`;
- [ ] `word`/`expression` på et **enkeltsted** kan brukes for dokumentert stedsspesifikt Språkleksikon, men er ikke dialekt og skal ikke merkes `layer: "dialect"` eller få `dialect_area`;
- [ ] gater, markeder, havner, arbeidsmiljøer og lignende kan være **direkte språksted** for stedsspesifikt språk, men «direkte språksted» gir aldri rett til å eie dialektlaget;
- [ ] et generelt områdeord eies av nærmeste relevante område-Place og dupliseres ikke inn i underliggende bygg, institusjoner, gater eller andre enkeltsteder; relevante enkeltsteder bruker `related_places` / `related_entries`;
- [ ] betydning, eksempel, geografisk utbredelse og historisk/moderne status avgrenses etter kildene;
- [ ] dialektord eller lokale talemålsformer skal ikke diktes, normaliseres fram eller konstrueres av språkmodell;
- [ ] dersom eksplisitt søk på et område-Place ikke finner et forsvarlig dialektord/lokalt uttrykk, dokumenteres søkte kilder og begrunnet holdback/N/A for denne deljobben i stedet for filler;
- [ ] enkeltsted med Språkleksikon er eksplisitt kontrollert for at innholdet ikke feilklassifiseres som dialekt;
- [ ] språkoppføringer er reelt sted- eller områdebundet og dupliserer ikke bare Om/Historie;
- [ ] brukerrettede kilder er inspectable HTTPS-lenker;
- [ ] tomt eksisterende språksett er aldri alene grunnlag for N/A.

**Stoppgate:** Dialektinnhold kan kun eies av et område-Place med `placeScope: "area"`. `layer: "dialect"`, `dialect_feature` eller `dialect_area` på et enkelt-Place er blocker. Et enkeltsted kan fortsatt ha et godt Språkleksikon med stedsspesifikt språk, men ikke et dialektlag. Manglende dokumenterbart dialektord etter reelt søk på et område-Place er lov; oppdiktet, duplisert eller feil-eid dialektinnhold er ikke lov.

### Datastyrte direkte tilleggsfaner'''
regex_once(
    "docs/PLACE_PRODUCTION_CHECKLIST.md",
    r"### Språk — direkte fane når relevant\n[\s\S]*?\n### Datastyrte direkte tilleggsfaner",
    checklist_section,
)

# Schema: explicit language/dialect content layer.
replace_once(
    "data/leksikon/sprak/schema_v2.json",
    '        "meaning": { "type": "string", "minLength": 1 },\n        "knowledge_unit_id": { "type": "string", "minLength": 1 },',
    '        "meaning": { "type": "string", "minLength": 1 },\n        "layer": { "type": "string", "enum": ["language", "dialect"] },\n        "knowledge_unit_id": { "type": "string", "minLength": 1 },',
)

# Runtime safety: invalid dialect data is not shown or collectible on non-area Places.
runtime_helpers = '''  function canonicalType(entry) {
    const raw = slug(entry?.type || entry?.kind || "term");
    return TYPE_ALIASES[raw] || "term";
  }

  function languageLayer(entry, article = null) {
    const explicit = slug(entry?.layer);
    if (explicit === "dialect") return "dialect";
    if (canonicalType(entry) === "dialect_feature") return "dialect";
    if (text(entry?.dialect_area || article?.dialect_area)) return "dialect";
    return "language";
  }

  function isDialectEntry(entry, article = null) {
    return languageLayer(entry, article) === "dialect";
  }

  function isAllowedLanguageEntry(entry, article, place) {
    if (!isLanguageEntry(entry)) return false;
    return !isDialectEntry(entry, article) || slug(place?.placeScope) === "area";
  }'''
replace_once(
    "js/ui/place-language-layer.js",
    '''  function canonicalType(entry) {
    const raw = slug(entry?.type || entry?.kind || "term");
    return TYPE_ALIASES[raw] || "term";
  }''',
    runtime_helpers,
)
replace_once(
    "js/ui/place-language-layer.js",
    '''  function knowledgeEntryForLanguage(entry, context = {}) {
    const subjectId = resolveSubjectId(entry, context);
    if (!subjectId) return null;

    const now = new Date().toISOString();''',
    '''  function knowledgeEntryForLanguage(entry, context = {}) {
    const subjectId = resolveSubjectId(entry, context);
    if (!subjectId) return null;
    const layer = languageLayer(entry, context.article);
    if (layer === "dialect" && slug(context.place?.placeScope) !== "area") return null;

    const now = new Date().toISOString();''',
)
replace_once(
    "js/ui/place-language-layer.js",
    '    const tags = unique([...(list(entry?.tags)), "språkleksikon", canonical, dialectArea]);',
    '    const tags = unique([...(list(entry?.tags)), "språkleksikon", canonical, layer, dialectArea]);',
)
replace_once(
    "js/ui/place-language-layer.js",
    '''        source_bound: true,
        language_entry_id: text(entry?.id) || null''',
    '''        source_bound: true,
        language_entry_id: text(entry?.id) || null,
        language_layer: layer''',
)
replace_once(
    "js/ui/place-language-layer.js",
    "    const entries = list(article?.entries).filter(isLanguageEntry);",
    "    const entries = list(article?.entries).filter(entry => isAllowedLanguageEntry(entry, article, place));",
)
replace_once(
    "js/ui/place-language-layer.js",
    '      const entry = list(article?.entries).find(row => text(row?.id || row?.term) === entryId && isLanguageEntry(row));',
    '      const entry = list(article?.entries).find(row => text(row?.id || row?.term) === entryId && isAllowedLanguageEntry(row, article, place));',
)
replace_once(
    "js/ui/place-language-layer.js",
    '''    const loaded = await loadForPlace(placeId);
    const entries = list(loaded?.article?.entries).filter(isLanguageEntry);
    if (!loaded || !entries.length) return;''',
    '''    const loaded = await loadForPlace(placeId);
    if (!loaded) return;
    const entries = list(loaded.article?.entries).filter(entry => isAllowedLanguageEntry(entry, loaded.article, place));
    if (!entries.length) return;''',
)
replace_once(
    "js/ui/place-language-layer.js",
    '''    canonicalType,
    isLanguageEntry,
    resolveSubjectId,''',
    '''    canonicalType,
    isLanguageEntry,
    isDialectEntry,
    isAllowedLanguageEntry,
    resolveSubjectId,''',
)

# Existing contract test must assert the hard boundary, not the old exception.
dialect_test = '''test("place-produksjon låser dialektlaget til område-Places", () => {
  const checklist = read("docs/PLACE_PRODUCTION_CHECKLIST.md");
  const contract = read("docs/SPRAKLEKSIKON.md");
  assert.match(checklist, /DIALEKTLAG — KUN `placeScope: "area"` \/ N\/A/);
  assert.match(checklist, /dialektinnhold kan kun eies av et område-Place/i);
  assert.match(checklist, /enkeltsted med Språkleksikon/i);
  assert.match(checklist, /skal ikke diktes/i);
  assert.match(contract, /obligatorisk researchjobb/i);
  assert.match(contract, /Dialektlaget kan bare eies[^\n]*placeScope:\s*"area"/i);
  assert.match(contract, /minst ett reelt kildebelagt \*\*dialektord eller lokalt uttrykk\*\*/i);
  assert.match(contract, /Enkelt-Places kan ha et rikt Språkleksikon, men ikke et dialektlag/i);
  assert.match(contract, /nærmeste relevante område-Place/i);
  assert.match(contract, /related_places.*related_entries/i);
});'''
regex_once(
    "tests/place-language-layer.test.mjs",
    r'test\("place-produksjon låser dialektord til riktig place-eier", \(\) => \{[\s\S]*?\n\}\);',
    dialect_test,
)

# Permanent language workflow owns the new scope regression test.
replace_once(
    ".github/workflows/language-layer-checks.yml",
    "      - 'tests/place-language-layer.test.mjs'\n",
    "      - 'tests/place-language-layer.test.mjs'\n      - 'tests/place-language-dialect-scope.test.mjs'\n",
)
replace_once(
    ".github/workflows/language-layer-checks.yml",
    "        run: node --test tests/place-language-layer.test.mjs tests/place-popup-direct-tabs.test.mjs",
    "        run: node --test tests/place-language-layer.test.mjs tests/place-language-dialect-scope.test.mjs tests/place-popup-direct-tabs.test.mjs",
)
