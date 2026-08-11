from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Close the phase audit only after 8A1, 8A2 and 8A3 are merged.
audit_path = ROOT / "reports/place-production/torggata-phase8a-people-audit-v1.md"
audit = audit_path.read_text(encoding="utf-8")
audit = audit.replace(
    "- Status: **AUDIT FERDIG – 8A er ikke samlet godkjent**",
    "- Status: **GODKJENT – 8A People er ferdig produsert og UI-verifisert**",
)
closeout = """

## 8A closeout – godkjent resultat

Fase 8A er lukket etter tre separate, mergede innholdsbatcher og en egen UI-/runtimekontroll:

- **8A1 / PR #4831:** eksisterende Thorvald Meyer, Henrik Bull, Christian Morgenstierne og Arne Eide fikk dokumentert Torggata-kobling; Thøger Binneballe, Harald Olsen, Alma Fahlstrøm og Johan Fahlstrøm ble materialisert som nye People v1-profiler.
- **8A2 / PR #4840:** Jensen-familiens dokumenterte gatehandel ble materialisert uten antallskvote, og Adelsten Jensens metadata ble korrigert mot den dedikerte Oslo byleksikon-artikkelen.
- **8A3 / PR #4842:** Nanna Broch, Wulff Becker, Martin Heinz Zilsel, Alexander Claes, Therese Hurwitz, Jenny Hurwitz, Fredrik Hurwitz og Moritz Glott ble materialisert. Den stale antakelsen om en eksisterende Wulff Becker-profil ble korrigert etter fersk tree-/manifestkontroll.

Closeout-testen bruker den faktiske `data/people/manifest.json`-samlingen og kjører `getPeopleForPlace('torggata')` fra runtime. Den krever de dokumenterte 8A-personene som et forventet sett, men setter **ingen øvre eller kunstig numerisk kvote** for Torggata. Eventuelle senere, selvstendig dokumenterte personer kan derfor legges til uten å bryte kontrakten.

### UI-eierskap verifisert

- `popup-utils.js` bygger People-samlingen fra relasjoner og personenes egne place-referanser, med deduplisering og eksplisitte `roundHoldbacks` som eneste stedsspesifikke skjulere.
- `place-card.js` bruker `getPeopleForPlace(place.id)` som kilde både for People-listen og People-previewet; rundingslisten viser korte `desc`-tekster og åpner canonical personpopup via `data-person`.
- `place-rounds-visual-collections.js` beholder `people` i `GENERAL_BASE` og category-four-gridet, slik at vanlig By får `people · objects · brands · fjerderunding` med Badges separat.
- Manglende personbilde gjør ikke samlingen tom: previewet faller tilbake til People-ikon + faktisk samlingsstørrelse. Bilder er derfor fortsatt et kvalitetslag, ikke en sannhetsgate for personkoblingen.

### Stoppgate

Alle 8A-stoppkriterier er nå eksplisitt dekket: canonical koblinger/profiler, claims/source-trace, historisk temporal status, trygg bildepolicy, runtime People-oppslag, reell PlaceCard-runding og regressjonstester. **8A People = GODKJENT.**

Neste fase-8-del er **8B Objects**. Holdback-listen ovenfor står fortsatt som redaksjonell grense og skal ikke omgås i senere rundingsarbeid.
"""
if "## 8A closeout – godkjent resultat" not in audit:
    audit = audit.rstrip() + closeout + "\n"
audit_path.write_text(audit, encoding="utf-8")

report = """# Torggata – fase 8A People closeout V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Baseline: 8A1 PR #4831 · 8A2 PR #4840 · 8A3 PR #4842
- Status: **GODKJENT**

## Hva closeout kontrollerer

Dette er ikke en ny People-produksjonsbatch. Closeout verifiserer at den ferdige canonical People-samlingen faktisk eier den synlige People-rundingen i PlaceCard.

1. Runtime-testen laster hele `data/people/manifest.json` og kjører den virkelige `getPeopleForPlace('torggata')`-funksjonen.
2. Alle personer som ble besluttet og produsert i 8A1–8A3 må finnes i resultatet uten duplikater.
3. Testen bruker et forventet identitetssett, ikke et makstall; flere senere kildebårne personer er tillatt.
4. Ingen av de ferdige 8A-personene kan ha `torggata` i `roundHoldbacks`.
5. PlaceCard-koden må fortsatt hente `persons` via `getPeopleForPlace(place.id)`, rendre `data-person`-rader og bruke samme `persons`-samling til previewet.
6. Category-four-runtime må vise People som første innholdsrunding for et vanlig `by`-sted og fortsatt ha nøyaktig fire innholdsrundinger med Badges utenfor gridet.

## Resultat

People-rundingen er en reell canonical samling. Den er ikke avhengig av legacy `place.rounds`, `people_ids`, en hardkodet Torggata-liste eller tilgjengelige portrettbilder. Manglende bilde gir et ærlig People-ikon med count; selve personlisten er fortsatt tilgjengelig.

Fase 8A kan derfor lukkes. Fase 8 som helhet fortsetter med **8B Objects**, deretter 8C Brands, 8D Bygg og anlegg og 8E legacy-rounds/slutt-UI.
"""
(ROOT / "reports/place-production/torggata-phase8a-closeout-v1.md").write_text(report, encoding="utf-8")

workcard_path = ROOT / "reports/place-production/torggata-workcard-current.md"
workcard = workcard_path.read_text(encoding="utf-8")
if "- Fase 8A-closeout:" not in workcard:
    workcard = workcard.replace(
        "- Fase 8A3-audit: `reports/place-production/torggata-phase8a3-residents-memory-audit-v1.md`",
        "- Fase 8A3-audit: `reports/place-production/torggata-phase8a3-residents-memory-audit-v1.md`\n- Fase 8A-closeout: `reports/place-production/torggata-phase8a-closeout-v1.md`",
    )
workcard = workcard.replace(
    "| 8. Rundinger | **PÅGÅR – 8A People** | audit PR #4829; 8A1 godkjent i PR #4831; 8A2 godkjent i PR #4840; 8A3 beboere/arbeid/minnespor materialisert |",
    "| 8. Rundinger | **PÅGÅR – 8B Objects** | audit PR #4829; **8A People GODKJENT** etter PR #4831, #4840 og #4842 + closeout; 8B er neste del |",
)
old_tail = "Neste steg etter 8A3-merge: **8A closeout + People-runding UI-kontroll**."
new_tail = """8A3 ble squash-merget i PR #4842 og fullførte den planlagte People-innholdsproduksjonen.

## Fase 8A – closeout

People-rundingen er kontrollert mot faktisk runtime: `getPeopleForPlace('torggata')` leverer de kildebårne 8A-personene fra canonical manifest/place-referanser, PlaceCard bruker samme samling til liste og preview, og category-four-gridet beholder People som første innholdsrunding. Testen låser identitetene som 8A faktisk produserte, men innfører ingen antallskvote.

**8A People = GODKJENT.**

Neste fase-8-del: **8B Objects**."""
if old_tail in workcard:
    workcard = workcard.replace(old_tail, new_tail)
workcard_path.write_text(workcard, encoding="utf-8")

test_text = r'''import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";

const ROOT = process.cwd();
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const rows = data => Array.isArray(data) ? data : (Array.isArray(data?.people) ? data.people : (data?.id ? [data] : []));

const manifest = readJson("data/people/manifest.json");
const people = manifest.files.flatMap(rel => rows(readJson(path.join("data", rel))));
const expected = [
  "thorvald_meyer", "henrik_bull", "christian_morgenstierne", "arne_eide",
  "thoger_binneballe", "harald_olsen", "alma_fahlstrom", "johan_fahlstrom",
  "ludvig_christian_jensen", "adelsten_jensen", "peter_marinius_jensen", "karl_a_jensen", "thorvald_jensen",
  "nanna_broch", "wulff_becker", "martin_heinz_zilsel", "alexander_claes",
  "therese_hurwitz", "jenny_hurwitz", "fredrik_hurwitz", "moritz_glott",
];

function runtimePeopleForTorggata() {
  const source = fs.readFileSync(path.join(ROOT, "js/ui/popup-utils.js"), "utf8");
  const context = {
    console,
    window: { PEOPLE: people, PLACES: [{ id: "torggata", category: "by" }], RELATIONS: [] },
    document: { addEventListener() {}, createElement() { return {}; }, body: { appendChild() {} }, getElementById() { return null; } },
    requestAnimationFrame() {}, setTimeout, clearTimeout,
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "popup-utils.js" });
  return Array.from(context.getPeopleForPlace("torggata"));
}

test("Torggata 8A closeout resolves every produced canonical person without a quota ceiling", () => {
  const resolved = runtimePeopleForTorggata();
  const ids = resolved.map(person => String(person?.id || "").trim()).filter(Boolean);
  const idSet = new Set(ids);
  assert.equal(idSet.size, ids.length, "runtime People collection must be deduplicated");
  for (const id of expected) assert.ok(idSet.has(id), `${id} must resolve through getPeopleForPlace('torggata')`);
  assert.ok(ids.length >= expected.length, "later source-backed People may extend the collection; closeout must not impose a maximum quota");
});

test("no completed 8A person is hidden from the Torggata People round", () => {
  const byId = new Map(people.map(person => [String(person?.id || "").trim(), person]));
  for (const id of expected) {
    const person = byId.get(id);
    assert.ok(person, `${id} must exist in manifest data`);
    const holdbacks = Array.isArray(person.roundHoldbacks) ? person.roundHoldbacks.map(String) : [];
    assert.equal(holdbacks.includes("torggata"), false, `${id} must not be held back from Torggata after approval`);
  }
});

test("PlaceCard People list and preview consume getPeopleForPlace rather than a legacy curation field", () => {
  const source = fs.readFileSync(path.join(ROOT, "js/ui/place-card.js"), "utf8");
  assert.match(source, /const persons = getPeopleForPlace\(place\.id\);/);
  assert.match(source, /data-person=/);
  assert.match(source, /const p0 = persons\?\.find/);
  assert.match(source, /setRoundLabel\(peopleIcon, "👥", persons\.length\)/);
  assert.doesNotMatch(source, /Canonical explicit curation wins/);
});

test("Torggata category-four grid keeps People as the first of four content rounds", async () => {
  const roundsSource = fs.readFileSync(path.join(ROOT, "js/ui/place-rounds-visual-collections.js"), "utf8");
  const dom = new JSDOM(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="torggata">
      <div class="pc-body"><div class="pc-title-row"><h2>Torggata</h2></div>
      <div class="pc-icons-quad">
        <div id="pcPeopleIcon" class="pc-round"></div>
        <div id="pcBadgesIcon" class="pc-round"></div>
        <div id="pcBrandsIcon" class="pc-round"></div>
      </div>
      <div id="pcPeopleList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div>
      </div>
    </div></body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const w = dom.window;
  w.PLACES = [{ id: "torggata", category: "by", image: "torggata.jpg" }];
  w.eval(roundsSource);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  await w.HGVisualPlaceRounds.apply(w.PLACES[0]);
  const grid = w.document.querySelector(".pc-icons-quad");
  const visible = [...grid.querySelectorAll(".pc-round")].filter(el => !el.hidden).sort((a, b) => Number(a.style.order) - Number(b.style.order));
  assert.equal(grid.dataset.roundCount, "4");
  assert.equal(visible.length, 4);
  assert.equal(visible[0].id, "pcPeopleIcon");
  assert.deepEqual(visible.map(el => el.id), ["pcPeopleIcon", "pcObjectsIcon", "pcBrandsIcon", "pcCategoryCollectionIcon"]);
  assert.equal(w.document.getElementById("pcBadgesIcon").parentElement.className, "pc-title-row");
  dom.window.close();
});
'''
(ROOT / "tests/torggata-phase8a-closeout.test.mjs").write_text(test_text, encoding="utf-8")
