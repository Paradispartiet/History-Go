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


# Bootstrap: direct-tab adapter loads after language so it can normalize the complete tab strip.
replace_once(
    "js/config.js",
    '    "js/ui/place-language-layer.js",\n    "js/ui/header-menu.js",',
    '    "js/ui/place-language-layer.js",\n    "js/ui/place-popup-direct-tabs.js",\n    "js/ui/header-menu.js",',
)

# One horizontal, swipeable row.
replace_once(
    "css/place-popup-tabs.css",
    "  display: flex;\n  gap: 8px;",
    "  display: flex;\n  flex-wrap: nowrap;\n  gap: 8px;",
)
replace_once(
    "css/place-popup-tabs.css",
    "  padding: 4px 4px 10px;\n  overflow-x: auto;\n  overscroll-behavior-x: contain;\n  scrollbar-width: thin;",
    "  padding: 4px 4px 10px;\n  max-width: 100%;\n  overflow-x: auto;\n  overflow-y: hidden;\n  overscroll-behavior-x: contain;\n  -webkit-overflow-scrolling: touch;\n  touch-action: pan-x;\n  scroll-snap-type: x proximity;\n  scroll-padding-inline: 4px;\n  white-space: nowrap;\n  scrollbar-width: thin;",
)
replace_once(
    "css/place-popup-tabs.css",
    "  flex: 0 0 auto;\n  min-height: 38px;",
    "  flex: 0 0 auto;\n  scroll-snap-align: start;\n  min-height: 38px;",
)

# Canonical popup contract.
path = "docs/PLACE_POPUP_SYSTEM.md"
value = read(path)
value = value.replace(
    "Et slikt delsted kan vises som tydelig merket relasjon eller supplement, men kan ikke brukes i stedet for parent-place i Om, Historie, Fortellinger, Før/etter, Nyheter, Lesespor, Kilder, Språk eller Mer.",
    "Et slikt delsted kan vises som tydelig merket relasjon eller supplement, men kan ikke brukes i stedet for parent-place i Om, Historie, Fortellinger, Før/etter, Nyheter, Lesespor, Kilder, Språk eller andre datastyrte direktefaner.",
)
section4 = """## 4. Canonical popupfaner

Popupen har sju faste grunnfaner:

```text
Om
Historie
Fortellinger
Før/etter
Nyheter
Lesespor
Kilder
```

I tillegg kan source-eide, **datastyrte direktefaner** materialiseres når stedet faktisk har slikt innhold. Dagens definerte familier er:

```text
Språk
Spor & objekter
Legg merke til
Betydning
Motpunkter
Relasjoner
Kunnskap
Observasjoner
```

Det finnes **ingen brukerrettet `Mer`-fane**. Legacy-runtimen kan fortsatt bruke et frakoblet `more`-panel som intern staging under migrering, men alt innhold som havner der skal materialiseres som en navngitt direktefane før brukeren ser popupen. Ukjent legacy-innhold får en konkret faneetikett fra sin egen overskrift og skal reviewes; det skal ikke samles i en ny restkategori.

Datastyrte faner vises bare når innholdet finnes. Et sted uten språk, observasjoner eller andre tilleggslag skal ikke få tomme faner.

På alle skjermstørrelser er fanene **én sammenhengende horisontal rad**. Raden brytes ikke. På mobil og smale vinduer kan hele fanestripen sveipes/rulles horisontalt, og aktiv fane rulles inn i synsfeltet. Tab-semantikk og tastaturnavigasjon beholdes.

"""
value, count = re.subn(r"## 4\. Canonical popupfaner\n.*?(?=## 5\. Om\n)", section4, value, count=1, flags=re.S)
if count != 1:
    raise SystemExit("PLACE_POPUP_SYSTEM: section 4 replacement failed")
section13 = """## 13. Datastyrte direktefaner

Smale kunnskapslag som tidligere ble samlet under **Mer**, vises nå direkte i den samme scrollbar fanestripen. Hver fane beholder sin canonical kildeeier:

- **Spor & objekter** — kildebelagte `artifacts`/legacy-objekter som fortsatt er popupkunnskap og ikke en egen PlaceCard-runding;
- **Legg merke til** — `interpretation.what_to_notice`;
- **Betydning** — `interpretation.why_it_matters`;
- **Motpunkter** — `interpretation.counterpoints` og tydelige inferensgrenser;
- **Relasjoner** — curated relations som faktisk forklarer stedet;
- **Kunnskap** — source-eid Knowledge/funfacts når gjeldende unlock- og Knowledge-regler tillater det;
- **Observasjoner** — dokumenterte observasjonsflater;
- **Språk** — eies separat av Språkleksikon-kontrakten i punkt 12.

Handlinger skal ikke ligge i disse fanene. Fysiske stedselementer skal heller ikke flyttes hit bare fordi en annen presentasjonsflate mangler.

En direktefane skal bare materialiseres når den har reelt innhold. Det er ikke lov å gjeninnføre `Mer`, «Annet» eller en annen generell søppelskuff for å redusere antall faner; bredden håndteres av den horisontalt scrollbar fanestripen.

"""
value, count = re.subn(r"## 13\. Mer\n.*?(?=## 14\. På stedet\n)", section13, value, count=1, flags=re.S)
if count != 1:
    raise SystemExit("PLACE_POPUP_SYSTEM: section 13 replacement failed")
write(path, value)

# Språkleksikon: a dialect/local-word research-and-production gate.
path = "docs/SPRAKLEKSIKON.md"
value = read(path)
for old in range(13, 6, -1):
    value = value.replace(f"## {old}. ", f"## {old + 1}. ")
marker = "## 8. Presentasjon i stedspopupen\n"
if marker not in value:
    raise SystemExit("SPRAKLEKSIKON: renumbered presentation heading missing")
dialect_section = """## 7. Dialektord og lokale uttrykk er en obligatorisk produksjonsjobb

Når et sted **får eller vesentlig reviderer et Språkleksikon**, skal produksjonen alltid inneholde et eksplisitt søk etter dokumenterte dialektord, lokale ordformer, lokale uttrykk og talemåter som faktisk kan knyttes til stedet eller dialektområdet.

Produksjonsregelen er:

- det skal søkes aktivt i ordbøker, dialektarkiv, lokale historiesamlinger, talemålsmateriale og andre relevante kilder — ikke bare i eksisterende History GO-data;
- når kildene bærer det, skal minst ett reelt kildebelagt **dialektord eller lokalt uttrykk** produseres som `word` eller `expression`;
- et Språkleksikon som bare består av stedsnavn, administrative fagord eller generelt norsk regnes ikke som redaksjonelt ferdig dersom researchen dokumenterer lokale ordformer eller uttrykk;
- betydning, geografisk utbredelse og historisk/moderne status skal avgrenses etter kilden;
- dialektord skal aldri konstrueres, moderniseres eller gjøres «mer lokale» av språkmodell eller redaksjonell gjetning;
- dersom et dokumentert søk faktisk ikke finner et forsvarlig dialektord/lokalt uttrykk, registreres søket og kildene som begrunnet holdback/N/A for akkurat denne deljobben. Fravær skal dokumenteres, ikke fylles med oppdiktet språk.

Dette er et produksjonskrav for Språkleksikon, ikke et krav om at alle steder i History GO må ha en språkfane.

"""
value = value.replace(marker, dialect_section + marker, 1)
value = value.replace(
    "De åtte grunnfanene i stedspopupen består. Når stedet har minst én gyldig språkoppføring, legger `place-language-layer.js` til en valgfri **Språk**-fane før **Mer**.",
    "De faste grunnfanene i stedspopupen består. Når stedet har minst én gyldig språkoppføring, legger `place-language-layer.js` til en valgfri, direkte **Språk**-fane i den samme horisontalt scrollbar fanestripen. Det finnes ingen brukerrettet **Mer**-fane.",
)
value = value.replace(
    "7. språk-auditen passerer.",
    "7. det eksplisitte dialektord-/lokaluttrykk-søket er gjennomført, og minst ett kildebelagt ord/uttrykk er produsert når materialet bærer det;\n8. språk-auditen passerer.",
)
value = value.replace(
    "- Ikke presenter historiske former som moderne uten dokumentasjon.\n",
    "- Ikke presenter historiske former som moderne uten dokumentasjon.\n- Ikke avslutt et Språkleksikon med bare navn eller generelle fagtermer når kildene dokumenterer lokale ord eller uttrykk.\n",
)
write(path, value)

# Leksikon routing: semantic data gets direct tabs, never More.
path = "data/leksikon/README_LEKSIKON.md"
value = read(path)
replace_map = {
    "| tolkning, klassifikasjon, legacy-objekter | **Mer** |": "| `interpretation.what_to_notice` | valgfri **Legg merke til**-fane |\n| `interpretation.why_it_matters` | valgfri **Betydning**-fane |\n| `interpretation.counterpoints` | valgfri **Motpunkter**-fane |\n| legacy-objekter / `artifacts` | valgfri **Spor & objekter**-fane |",
    "Når et sted har minst én språkoppføring, fremhever `js/ui/place-language-layer.js` materialet med en valgfri **Språk**-fane og en kompakt «Språk på stedet»-forhåndsvisning i Om. Tomme språkflater vises ikke.": "Når et sted har minst én språkoppføring, fremhever `js/ui/place-language-layer.js` materialet med en valgfri, direkte **Språk**-fane i den horisontalt scrollbar fanestripen og en kompakt «Språk på stedet»-forhåndsvisning i Om. Tomme språkflater vises ikke.",
}
for old, new in replace_map.items():
    if old not in value:
        raise SystemExit(f"README_LEKSIKON: missing expected text {old[:70]!r}")
    value = value.replace(old, new, 1)
write(path, value)

# Place production checklist: explicit dialect production and no More status.
path = "docs/PLACE_PRODUCTION_CHECKLIST.md"
value = read(path)
value = value.replace(
    "| Stedspopup / åtte faner | **`docs/PLACE_POPUP_SYSTEM.md`** |",
    "| Stedspopup / direkte faner og scrollbar | **`docs/PLACE_POPUP_SYSTEM.md`** |\n| Språkleksikon / dialektord og lokale uttrykk | **`docs/SPRAKLEKSIKON.md`** |",
)
value = value.replace("alle åtte popupfaner", "alle relevante popupfaner, inkludert datastyrte direktefaner")
value = value.replace(
    "LEKSIKON-ID/FIL:\nMÅL FOR INNHOLDSRUNDINGER:",
    "LEKSIKON-ID/FIL:\nSPRÅKLEKSIKON-STATUS:\nDIALEKTORD/LOKALE UTTRYKK — RESEARCH OG PRODUKSJON:\nMÅL FOR INNHOLDSRUNDINGER:",
)
value = value.replace(
    "POPUPSTATUS — MER:\nMANUELL SLUTT-QA — FØR/ETTER-SAMMENLIGNING:",
    "POPUPSTATUS — SPRÅK:\nPOPUPSTATUS — SPOR OG OBJEKTER:\nPOPUPSTATUS — LEGG MERKE TIL:\nPOPUPSTATUS — BETYDNING:\nPOPUPSTATUS — MOTPUNKTER:\nPOPUPSTATUS — RELASJONER:\nPOPUPSTATUS — KUNNSKAP:\nPOPUPSTATUS — OBSERVASJONER:\nMANUELL SLUTT-QA — FØR/ETTER-SAMMENLIGNING:",
)
value = value.replace("MANUELL SLUTT-QA — MER-DEKNING:", "MANUELL SLUTT-QA — DIREKTE TILLEGGSFANER:")
value = value.replace("## 7. Alle åtte faner vurderes", "## 7. Alle relevante faner vurderes")
replacement = """### Språk — direkte fane når relevant
**LES FØRST — obligatorisk ved Språkleksikon-produksjon:** `docs/SPRAKLEKSIKON.md`

- [ ] eksisterende Språkleksikon-record og språkmanifest er søkt;
- [ ] navnehistorie, ordbruk, lokale uttrykk, talemålsmateriale og andre relevante språklag er undersøkt i eksterne kilder;
- [ ] **hver opprettelse eller vesentlige revisjon av Språkleksikon inkluderer et eksplisitt researchspor etter dialektord og lokale uttrykk**;
- [ ] når kildene bærer det, produseres minst ett reelt, kildebelagt **dialektord eller lokalt uttrykk** som `word` eller `expression` — Språkleksikon skal ikke stoppe ved bare navn eller generelle fagord når lokale former finnes;
- [ ] betydning, eksempel, geografisk utbredelse og historisk/moderne status avgrenses etter kildene;
- [ ] dialektord eller lokale uttrykk skal ikke diktes, normaliseres fram eller konstrueres av språkmodell;
- [ ] dersom eksplisitt søk ikke finner et forsvarlig dialektord/lokalt uttrykk, dokumenteres søkte kilder og begrunnet holdback/N/A for denne deljobben i stedet for filler;
- [ ] språkoppføringer er reelt sted- eller områdebundet og dupliserer ikke bare Om/Historie;
- [ ] brukerrettede kilder er inspectable HTTPS-lenker;
- [ ] tomt eksisterende språksett er aldri alene grunnlag for N/A.

**Stoppgate:** Et Språkleksikon kan ikke ferdigmeldes etter bare stedsnavn, administrative begreper eller generelle fagord dersom kildegrunnlaget dokumenterer lokale ordformer eller uttrykk. Manglende dokumenterbart dialektord etter reelt søk er lov; oppdiktet dialektord er ikke lov.

### Datastyrte direkte tilleggsfaner

Det finnes ikke lenger en brukerrettet **Mer**-fane. Når source-data finnes, materialiseres de som egne faner i den samme horisontalt scrollbar fanestripen:

- [ ] **Spor & objekter** vurdert for kildebelagte popup-`artifacts`/legacy-objekter som ikke eies av en annen flate;
- [ ] **Legg merke til** vurdert fra `interpretation.what_to_notice`;
- [ ] **Betydning** vurdert fra `interpretation.why_it_matters`;
- [ ] **Motpunkter** vurdert fra `interpretation.counterpoints` og inferensgrenser;
- [ ] **Relasjoner** vurdert når curated relations faktisk forklarer stedet;
- [ ] **Kunnskap** vurdert etter Knowledge-/unlock-eierskapet;
- [ ] **Observasjoner** vurdert når observasjonsdata finnes;
- [ ] hvert tilleggslag får en navngitt direktefane bare når det faktisk har innhold;
- [ ] ukjent legacy-innhold får en konkret, reviewbar faneetikett fra sin egen overskrift og parkeres ikke i en ny restkategori;
- [ ] ingen av disse fanene brukes som søppelskuff for handlinger eller for fysiske elementer som egentlig eies av rundinger eller andre places.

**Stoppgate:** Innhold som tidligere lå i Mer kan ikke skjules bak en restfane. Det skal enten ligge hos riktig eksisterende eier, vises som en konkret direktefane, eller utelates med dokumentert grunn.

Hver fast og hver faktisk materialisert datastyrt fane får egen status:"""
value, count = re.subn(r"### Mer\n.*?\n\nAlle åtte får egen status:", replacement, value, count=1, flags=re.S)
if count != 1:
    raise SystemExit("PLACE_PRODUCTION_CHECKLIST: More block replacement failed")
if "POPUPSTATUS — MER:" in value or "### Mer\n" in value:
    raise SystemExit("PLACE_PRODUCTION_CHECKLIST: legacy Mer checklist remains")
if "dialektord" not in value.lower():
    raise SystemExit("PLACE_PRODUCTION_CHECKLIST: dialect requirement missing")
write(path, value)

# Dedicated language/direct-tab CI.
path = ".github/workflows/language-layer-checks.yml"
value = read(path)
value = value.replace(
    "      - 'js/ui/place-language-layer.js'\n      - 'css/place-language-layer.css'",
    "      - 'js/ui/place-language-layer.js'\n      - 'js/ui/place-popup-direct-tabs.js'\n      - 'css/place-language-layer.css'\n      - 'css/place-popup-tabs.css'",
)
value = value.replace(
    "      - 'docs/PLACE_POPUP_SYSTEM.md'\n      - 'data/leksikon/README_LEKSIKON.md'",
    "      - 'docs/PLACE_POPUP_SYSTEM.md'\n      - 'docs/PLACE_PRODUCTION_CHECKLIST.md'\n      - 'data/leksikon/README_LEKSIKON.md'",
)
value = value.replace(
    "      - 'tests/place-language-layer.test.mjs'\n      - 'tests/knowledge-browser-e2e.test.mjs'",
    "      - 'tests/place-language-layer.test.mjs'\n      - 'tests/place-popup-direct-tabs.test.mjs'\n      - 'tests/knowledge-browser-e2e.test.mjs'",
)
value = value.replace(
    "      - name: Check language runtime syntax\n        run: node --check js/ui/place-language-layer.js",
    "      - name: Check language and direct-tab runtime syntax\n        run: |\n          node --check js/ui/place-language-layer.js\n          node --check js/ui/place-popup-direct-tabs.js",
)
value = value.replace(
    "      - name: Test language data and integration contract\n        run: node --test tests/place-language-layer.test.mjs",
    "      - name: Test language data, dialect checklist and direct-tab contract\n        run: node --test tests/place-language-layer.test.mjs tests/place-popup-direct-tabs.test.mjs",
)
write(path, value)

# Language contract test locks loader order and production checklist.
path = "tests/place-language-layer.test.mjs"
value = read(path)
value = value.replace(
    "  const languageIndex = config.indexOf('\"js/ui/place-language-layer.js\"');",
    "  const languageIndex = config.indexOf('\"js/ui/place-language-layer.js\"');\n  const directTabsIndex = config.indexOf('\"js/ui/place-popup-direct-tabs.js\"');",
)
value = value.replace(
    '  assert.ok(languageIndex > popupLoaderIndex, "språkflaten må lastes etter popup-tab-loaderen");',
    '  assert.ok(languageIndex > popupLoaderIndex, "språkflaten må lastes etter popup-tab-loaderen");\n  assert.ok(directTabsIndex > languageIndex, "direktefane-adapteren må lastes etter språkadapteren");',
)
value += """

test("place-produksjon låser dialektord som Språkleksikon-jobb", () => {
  const checklist = read("docs/PLACE_PRODUCTION_CHECKLIST.md");
  const contract = read("docs/SPRAKLEKSIKON.md");
  assert.match(checklist, /dialektord/i);
  assert.match(checklist, /lokalt uttrykk|lokale uttrykk/i);
  assert.match(checklist, /skal ikke diktes/i);
  assert.match(contract, /obligatorisk produksjonsjobb/i);
  assert.match(contract, /minst ett reelt kildebelagt \*\*dialektord eller lokalt uttrykk\*\*/i);
});
"""
write(path, value)

# Torggata historical phase test follows current presentation contract.
path = "tests/torggata-phase7h-more.test.js"
value = read(path)
value = value.replace(
    "const runtime = read('js/ui/place-popup-tabs.js');",
    "const runtime = read('js/ui/place-popup-tabs.js');\nconst directTabsRuntime = read('js/ui/place-popup-direct-tabs.js');",
)
old = """assert.match(runtime, /renderMore\\(main, buckets\\.objects, language\\)/);
assert.match(runtime, /interpretation\\.what_to_notice/);
assert.match(runtime, /interpretation\\.why_it_matters/);
assert.match(runtime, /interpretation\\.counterpoints/);
assert.match(runtime, /list\\(languageArticle\\?\\.entries\\)/);
assert.match(runtime, /Språkleksikon/);"""
new = """assert.match(runtime, /renderMore\\(main, buckets\\.objects, language\\)/);
assert.match(directTabsRuntime, /Spor & objekter/);
assert.match(directTabsRuntime, /Legg merke til/);
assert.match(directTabsRuntime, /Betydning/);
assert.match(directTabsRuntime, /Motpunkter/);
assert.match(directTabsRuntime, /Språk/);
assert.match(directTabsRuntime, /moreTab\\?\\.remove\\(\\)/);"""
if old not in value:
    raise SystemExit("torggata-phase7h-more: renderer assertion block missing")
value = value.replace(old, new, 1)
value = value.replace(
    r"/kan ikke brukes i stedet for parent-place i Om, Historie, Fortellinger, Før\/etter, Nyheter, Lesespor, Kilder eller Mer/",
    r"/kan ikke brukes i stedet for parent-place i Om, Historie, Fortellinger, Før\/etter, Nyheter, Lesespor, Kilder, Språk eller andre datastyrte direktefaner/",
)
write(path, value)

# Regjeringskvartalet's old phase name remains historical; runtime checks use direct tabs.
path = "tests/regjeringskvartalet-more-phase.test.mjs"
value = read(path)
value = value.replace(
    "const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');",
    "const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');\nconst directTabsRuntime = fs.readFileSync('js/ui/place-popup-direct-tabs.js', 'utf8');",
)
old = """test('Eksisterende Mer-renderer viser tolkning, Språkleksikon og sikre kildelenker', () => {
  assert.match(runtime, /function languageCards\\(items\\)/);
  assert.match(runtime, /item\\?\\.context/);
  assert.match(runtime, /class=\"hg-place-more-source\"/);
  assert.match(runtime, /target=\"_blank\" rel=\"noopener noreferrer\"/);
  assert.match(runtime, /section\\(\"Legg merke til\"/);
  assert.match(runtime, /section\\(\"Hvorfor det betyr noe\"/);
  assert.match(runtime, /section\\(\"Motpunkter\"/);
  assert.match(runtime, /section\\(\"Språkleksikon\", languageCards\\(languageEntries\\)\\)/);
});"""
new = """test('Legacy Mer-hydrering materialiseres som direkte faner', () => {
  assert.match(runtime, /section\\(\"Legg merke til\"/);
  assert.match(runtime, /section\\(\"Hvorfor det betyr noe\"/);
  assert.match(runtime, /section\\(\"Motpunkter\"/);
  assert.match(directTabsRuntime, /\"legg merke til\": \\[\"notice\", \"Legg merke til\"\\]/);
  assert.match(directTabsRuntime, /\"hvorfor det betyr noe\": \\[\"meaning\", \"Betydning\"\\]/);
  assert.match(directTabsRuntime, /\"motpunkter\": \\[\"counterpoints\", \"Motpunkter\"\\]/);
  assert.match(directTabsRuntime, /moreTab\\?\\.remove\\(\\)/);
});"""
if old not in value:
    raise SystemExit("regjeringskvartalet-more: renderer assertion block missing")
value = value.replace(old, new, 1)
write(path, value)

# Full Chromium audit: final presentation layer contains only direct tabs.
path = "tests/regjeringskvartalet-ui-production-audit.test.mjs"
value = read(path)
value = value.replace(
    "const popupRuntime = read('js/ui/place-popup-tabs.js');\nconst roundsRuntime",
    "const popupRuntime = read('js/ui/place-popup-tabs.js');\nconst directTabsRuntime = read('js/ui/place-popup-direct-tabs.js');\nconst roundsRuntime",
)
value = value.replace("  ['sources', 'Kilder'],\n  ['more', 'Mer']\n]) {", "  ['sources', 'Kilder']\n]) {")
value = value.replace(
    "assert.match(popupCss, /overflow-x:\\s*auto/);",
    "assert.match(popupCss, /overflow-x:\\s*auto/);\nassert.match(popupCss, /flex-wrap:\\s*nowrap/);\nassert.match(popupCss, /white-space:\\s*nowrap/);\nassert.match(directTabsRuntime, /moreTab\\?\\.remove\\(\\)/);\nassert.match(directTabsRuntime, /scrollIntoView/);",
)
value = value.replace(
    """        <section class=\"hg-place-hero\">\n          <h1>Regjeringskvartalet</h1>\n          <div class=\"hg-place-popup-text\"><p>Canonical popupgrunnlag.</p></div>\n        </section>""",
    """        <section class=\"hg-place-hero\">\n          <h1>Regjeringskvartalet</h1>\n          <div class=\"hg-place-popup-text\"><p>Canonical popupgrunnlag.</p></div>\n        </section>\n        <section class=\"hg-place-relations-section\"><h3>Relasjoner</h3><p>Canonical relasjon.</p></section>\n        <section class=\"hg-place-knowledge-section\"><h3>Kunnskap</h3><p>Canonical kunnskap.</p></section>\n        <section class=\"hg-place-observations-section\"><h3>Observasjoner</h3><p>Canonical observasjon.</p></section>""",
)
value = value.replace(
    '  <script src="/js/ui/place-popup-tabs.js"></script>',
    '  <script src="/js/ui/place-popup-tabs.js"></script>\n  <script src="/js/ui/place-popup-direct-tabs.js"></script>',
)
old = """    'Kilder',
    'Mer'
  ]);
  assert.equal(await page.locator('[role=\"tabpanel\"]').count(), 8);

  for (const id of ['about', 'history', 'stories', 'before-after', 'news', 'reading', 'sources', 'more']) {"""
new = """    'Kilder',
    'Relasjoner',
    'Kunnskap',
    'Observasjoner'
  ]);
  assert.equal(await page.locator('[role=\"tabpanel\"]').count(), 10);
  assert.equal(await page.locator('[data-place-tab=\"more\"]').count(), 0);

  for (const id of ['about', 'history', 'stories', 'before-after', 'news', 'reading', 'sources', 'relations', 'knowledge', 'observations']) {"""
if old not in value:
    raise SystemExit("regjeringskvartalet-ui: tab list assertion block missing")
value = value.replace(old, new, 1)
value = value.replace(
    "  assert.equal(await page.locator('[data-place-tab=\"more\"]').getAttribute('aria-selected'), 'true');",
    "  assert.equal(await page.locator('[data-place-tab=\"observations\"]').getAttribute('aria-selected'), 'true');",
)
write(path, value)

# Preconditions and final guards.
if '["more", "Mer"]' not in read("js/ui/place-popup-tabs.js"):
    raise SystemExit("legacy staging tab unexpectedly removed; adapter expects it during migration")
if "js/ui/place-popup-direct-tabs.js" not in read("js/config.js"):
    raise SystemExit("direct-tab runtime not bootstrapped")
if "### Mer\n" in read("docs/PLACE_PRODUCTION_CHECKLIST.md"):
    raise SystemExit("canonical checklist still contains a Mer section")

# One-shot helper files must not be part of the final feature diff.
for temporary in [
    ".github/workflows/agent-write-smoke.yml",
    "scripts/agent_direct_tabs_patch.py",
]:
    target = ROOT / temporary
    if target.exists():
        target.unlink()
