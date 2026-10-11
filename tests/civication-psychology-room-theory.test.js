// Psykoteori must use canonical Fagverk IDs and remain a read-only learning surface.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const json = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const catalog = json("data/psychology/psychology_theories.json");
const phenomena = json("data/psychology/psychology_phenomena.json").phenomena;
const tools = json("data/psychology/cbt_tools.json").tools;
const exercises = json("data/psychology/psychology_exercises.json").exercises;
const tests = json("data/psychology/psychology_tests.json").tests;
const ids = new Set();
assert.equal(catalog.fagverk_subject, "psykologi");
assert.equal(catalog.chapters.length, 6);
assert.equal(catalog.theories.length, 35);

for (const chapter of catalog.chapters) {
  const canonical = json("data/fagverk/psykologi/" + chapter.id + ".json");
  assert.equal(canonical.chapter_id, chapter.id, "canonical chapter must exist");
  assert.equal(canonical.subject_id, "psykologi");
  for (const theory of catalog.theories.filter((item) => item.chapter_id === chapter.id)) {
    assert.ok(!ids.has(theory.id), "theory IDs must be unique");
    ids.add(theory.id);
    assert.ok(canonical.emne_ids.includes(theory.emne_id), "emne must be in canonical chapter: " + theory.id);
    for (const key of ["title", "founders", "period"]) {
      assert.ok(typeof theory[key] === "string" && theory[key].trim().length > 3,
        "missing metadata " + key + " on " + theory.id);
    }
    for (const key of ["idea", "method", "limit", "example", "contrast"]) {
      assert.ok(typeof theory[key] === "string" && theory[key].trim().length > 60,
        "missing authored analysis " + key + " on " + theory.id);
    }
    assert.ok(theory.example.startsWith("Undervisningsscenario:"), "example must be marked hypothetical");
    assert.ok(typeof theory.example_secondary === "string" && theory.example_secondary.startsWith("Undervisningsscenario:") && theory.example_secondary.length > 120,
      "missing second authored hypothetical scenario: " + theory.id);
    assert.notEqual(theory.example, theory.example_secondary, "teaching scenarios must not repeat each other: " + theory.id);
    for (const phenomenonId of theory.related_phenomena) {
      assert.ok(phenomena.some((item) => item.id === phenomenonId),
        "unknown phenomenon: " + phenomenonId);
    }
  }
}
for (const theory of catalog.theories) {
  assert.ok(ids.has(theory.compare_with), "missing compared theory: " + theory.id);
}
assert.equal(ids.size, catalog.theories.length);
const teachingCases = catalog.theories.flatMap((theory) => [theory.example, theory.example_secondary]);
assert.equal(teachingCases.length, 70, "35 theory cards must each have two scenarios");
assert.equal(new Set(teachingCases).size, teachingCases.length,
  "every hypothetical teaching scenario should be independently authored");

// DOM stub captures view transitions without loading the full History Go app.
let rendered = "";
const handlers = new Map();
const node = (selector, dataset = {}) => ({
  dataset,
  addEventListener(event, fn) { handlers.set(selector + ":" + event, fn); },
  classList: { add() {}, remove() {} },
  setAttribute() {},
  appendChild() {},
  querySelector(sel) { return sel === ".psychology-room-content" ? content : node(sel); }
});
const content = {
  set innerHTML(value) { rendered = value; },
  get innerHTML() { return rendered; }
};
let overlay = null;
const existing = new Map();
global.document = {
  body: { appendChild(value) { overlay = value; } },
  getElementById(id) {
    if (id === "psychologyRoomOverlay") return overlay;
    if (["psychologyRoomWorkbenchForm", "psychologyRoomExerciseForm"].includes(id)) return node("#" + id);
    return null;
  },
  createElement() { return node("overlay"); },
  querySelector(selector) {
    if (!existing.has(selector)) existing.set(selector, node(selector));
    return existing.get(selector);
  },
  querySelectorAll(selector) {
    if (selector === "[data-psych-focus]") return phenomena.map((item) => node("focus:" + item.id, { psychFocus: item.id }));
    if (selector === "[data-phenomenon-id]") return phenomena.map((item) => node("phenomenon:" + item.id, { phenomenonId: item.id }));
    if (selector === "[data-psych-next-theory]") return catalog.theories.map((item) => node("next-theory:" + item.id, { psychNextTheory: item.id }));
    if (selector === "[data-psych-related]") return [
      ...tools.map((item) => node("related-tool:" + item.id, { psychRelated: "tool", psychRelatedId: item.id })),
      ...exercises.map((item) => node("related-exercise:" + item.id, { psychRelated: "exercise", psychRelatedId: item.id })),
      ...tests.map((item) => node("related-test:" + item.id, { psychRelated: "test", psychRelatedId: item.id }))
    ];
    if (selector === "[data-theory-id]") return catalog.theories.map((item) => node("theory:" + item.id, { theoryId: item.id }));
    if (selector === "[data-theory-phenomenon]") return phenomena.map((item) => node("related:" + item.id, { theoryPhenomenon: item.id }));
    if (selector === "[data-phenomenon-theory]") return catalog.theories.map((item) => node("linked:" + item.id, { phenomenonTheory: item.id }));
    return [];
  }
};
const storage = new Map();
global.localStorage = {
  getItem(key) { return storage.get(key) || null; },
  setItem(key, value) { storage.set(key, String(value)); }
};
global.window = global;
global.Event = class { constructor(type) { this.type = type; } };
global.CustomEvent = class extends Event {};
global.dispatchEvent = () => true;
global.fetch = async (url) => ({
  ok: true,
  async json() { return json(String(url).replace(/^\/+/, "")); }
});
vm.runInThisContext(fs.readFileSync(path.join(root, "js/psychologyRoom.js"), "utf8"), { filename: "psychologyRoom.js" });
const press = (selector) => {
  const handler = handlers.get(selector + ":click");
  assert.equal(typeof handler, "function", "missing click action for " + selector);
  handler();
};

(async () => {
  await window.PsychologyRoom.open();
  assert.match(overlay.innerHTML, /class="psychology-room-footer"/);
  assert.match(overlay.innerHTML, /aria-label="Navigasjon i Psykologrommet"/);
  for (const item of ["home", "phenomena", "practice", "theories", "profile"]) {
    assert.match(overlay.innerHTML, new RegExp('data-psych-nav="' + item + '"'));
  }
  assert.match(rendered, /Fra opplevelse til innsikt/);
  assert.match(rendered, /Åpne tankeverkstedet/);
  assert.match(rendered, /Et sted å begynne/);
  assert.equal(overlay.dataset.activeSection, "home");
  press('[data-psych-nav="phenomena"]');
  assert.match(rendered, /Fenomenleksikon/);
  assert.equal(overlay.dataset.activeSection, "phenomena");
  press("focus:ruminasjon"); // Direct entry is also available on the start view.
  assert.match(rendered, /FRA BEGREP TIL HANDLING/);
  assert.match(rendered, /data-psych-related="tool"/);
  assert.match(rendered, /data-psych-related="exercise"/);
  assert.match(rendered, /data-psych-related="test"/);
  press("related-tool:alternativ_tanke_v1");
  assert.match(rendered, /Fyll ut verktøyet/);
  assert.equal(overlay.dataset.activeSection, "practice");
  press('[data-psych-nav="home"]');
  assert.equal(overlay.dataset.activeSection, "home");
  assert.match(rendered, /Fra opplevelse til innsikt/);
  press("focus:unngaelsesforsterkning");
  assert.match(rendered, /Teoretisk bakgrunn/);
  press('[data-psych-nav="theories"]');
  assert.match(rendered, /Psykoteori/);
  assert.equal(overlay.dataset.activeSection, "theories");
  press('[data-psych-nav="profile"]');
  assert.match(rendered, /Screeningprofil/);
  assert.equal(overlay.dataset.activeSection, "profile");
  press('[data-psych-nav="practice"]');
  assert.match(rendered, /CBT-verktøy/);
  press('[data-psych-nav="home"]');
  assert.match(rendered, /data-psych-action="theories"/);
  press("[data-psych-action='theories']");
  assert.match(rendered, /Psykoteori/);
  assert.match(rendered, /fagverk\.html\?subject=psykologi&amp;chapter=/);
  press("theory:behaviorisme");
  assert.match(rendered, /Hvordan undersøkes dette\?/);
  assert.match(rendered, /Kilder og videre lesning/);
  assert.match(rendered, /psychology\.fas\.harvard\.edu\/people\/b-f-skinner/);
  assert.match(rendered, /For fordypning, se psykologifagverket/);
  assert.match(rendered, /rel="noopener noreferrer"/);
  assert.match(rendered, /Sammenlign teoriene/);
  assert.match(rendered, /subject=psykologi&amp;emne=em_psy_betinging_vaner/);
  assert.match(rendered, /Også relevant for/);
  assert.match(rendered, /subject=psykologi&amp;emne=em_psy_atferd_laring/);
  assert.match(rendered, /Atferd og læring/);
  assert.match(rendered, /Undervisningseksempel 1 \(hypotetisk\)/);
  assert.match(rendered, /Undervisningseksempel 2 \(hypotetisk\)/);
  assert.match(rendered, /plagsom lyd/);
  press("theory:behaviorisme");
  assert.match(rendered, /John B\. Watson/);
  assert.match(rendered, /forsterkning øke sannsynligheten/);
  assert.doesNotMatch(rendered, /Negativ forsterkning er ikke det samme som straff\./);
  press("theory:kognitiv_psykologi");
  assert.match(rendered, /Neissers bok Cognitive Psychology/);
  press("theory:biopsykososial_modell");
  assert.match(rendered, /Science i 1977/);
  press("theory:tilknytning");
  assert.match(rendered, /Barn søker trygghet hos omsorgspersoner/);
  assert.match(rendered, /Vis flere kilder/);
  assert.match(rendered, /<details><summary>Vis flere kilder/);
  assert.match(rendered, /subject=psykologi&amp;emne=em_psy_familie_samspill/);
  press("theory:emosjonsregulering");
  assert.match(rendered, /James J. Gross/);
  assert.match(rendered, /em_psy_nevroaffekt_regulering/);
  press("theory:stigma_sosial_merking");
  assert.match(rendered, /Erving Goffman/);
  assert.match(rendered, /em_psy_diagnose_hverdagsliv/);
  press("theory:sorg_dobbelprosessmodell");
  assert.match(rendered, /Stroebe/);
  assert.match(rendered, /em_psy_sorg_tap/);
  press("theory:psykometri_validitet");
  assert.match(rendered, /konstruktvaliditet/);
  assert.match(rendered, /em_psy_forskning_metode/);
  press("theory:arbeidsminne_flerkomponent");
  assert.match(rendered, /Baddeley og Hitch/);
  assert.match(rendered, /em_psy_oppmerksomhet_fokus/);
  press("theory:identitetsutvikling_erikson_marcia");
  assert.match(rendered, /Marcia/);
  assert.match(rendered, /em_psy_livslop_overganger/);
  press("theory:globalt_arbeidsrom_bevissthet");
  assert.match(rendered, /Baars/);
  assert.match(rendered, /em_psy_bevissthet_opplevelse/);
  press("theory:persepsjon_prediktiv_prosessering");
  assert.match(rendered, /Gibson/);
  assert.match(rendered, /em_psy_persepsjon_sansing/);
  press("theory:psykiatri_institusjonshistorie");
  assert.match(rendered, /Gaustad/);
  assert.match(rendered, /em_psy_makt_omsorg/);
  assert.match(rendered, /em_psy_omsorg_system/);
  press("theory:diagnostisk_klassifikasjon_historie");
  assert.match(rendered, /Kraepelin/);
  assert.match(rendered, /em_psy_diagnose_klassifikasjon/);
  press("theory:hverdagsattribusjon_og_vaner");
  assert.match(rendered, /Heider/);
  assert.match(rendered, /em_psy_hverdagspsykologi/);
  press("theory:ensomhet_sosial_tilhorighet");
  assert.match(rendered, /Weiss/);
  assert.match(rendered, /em_psy_ensomhet_tilhorighet/);
  press("theory:kollektiv_krise_flerniva");
  assert.match(rendered, /Lindemann/);
  assert.match(rendered, /em_psy_kollektiv_krise/);
  press("theory:trygghet_tillit_krisehjelp");
  assert.match(rendered, /Hobfoll/);
  assert.match(rendered, /em_psy_trygghet_tillit/);
  press("theory:vold_belastning_tvangskontroll");
  assert.match(rendered, /Stark/);
  assert.match(rendered, /em_psy_vold_belastning/);
  for (const [id, pattern] of [["behandling_omsorg_relationshistorie", /Peplau/], ["kriseintervensjon_historie", /Caplan/], ["pasientrolle_medvirkning_historie", /Parsons/], ["terapeutisk_allianse_og_terapirom", /Bordin/]]) {
    press("theory:" + id);
    assert.match(rendered, pattern);
  }
  press("theory:kognitiv_terapi");
  assert.match(rendered, /Kognitiv terapi undersøker hvordan tolkninger/);
  assert.match(rendered, /subject=psykologi&amp;emne=em_psy_terapi_praksis/);
  press("related:unngaelsesforsterkning");
  assert.match(rendered, /Teoretisk bakgrunn/);
  press("linked:behaviorisme");
  assert.match(rendered, /Fordypning i psykologifagverket/);
  const roomCss = fs.readFileSync(path.join(root, "css/psychologyRoom.css"), "utf8");
  assert.match(roomCss, /width:\s*min\(760px,\s*calc\(100vw - 24px\)\)/);
  assert.match(roomCss, /\.psychology-room-content\s*\{[^}]*overflow-y:\s*auto;/s);
  assert.match(roomCss, /\.psychology-room-footer\s*\{[^}]*grid-template-columns:\s*repeat\(5,/s);
  assert.match(roomCss, /\[data-active-section="theories"\]/);
  assert.equal(storage.size, 0, "theory navigation must not write personal data");
  press('[data-psych-nav="home"]');
  press("[data-psych-action='workbench']");
  assert.match(rendered, /Tankeverksted/);
  assert.match(rendered, /Hva skjedde konkret/);
  assert.match(rendered, /Hva tenkte eller antok du/);
  assert.match(rendered, /Hva merket du i kroppen/);
  assert.match(rendered, /Lagre og utforsk fenomener/);
  assert.match(rendered, /Ingen svar sendes til Civication/);
  const localReflection = window.PsychologyRoom.saveWorkbench({
    situation: "Jeg utsetter en oppgave.",
    thoughts: "Den er vanskelig.",
    actions: "Jeg venter."
  });
  assert.equal(localReflection.saved, true);
  assert.equal(window.PsychologyRoom.getWorkbenchEntries().length, 1);
  assert.equal(window.PsychologyRoom.getProfile().psychology_competence, 0);
  assert.equal(storage.size, 1, "a voluntary reflection is stored under one isolated local key");

  // Follow the real end-to-end flow without inferring a phenotype from free text:
  // self-description -> manual phenomenon choice -> short exercise -> theory.
  press('[data-psych-nav="home"]');
  press("[data-psych-action='workbench']");
  const submitWorkbench = handlers.get("#psychologyRoomWorkbenchForm:submit");
  assert.equal(typeof submitWorkbench, "function");
  const formElements = Object.fromEntries(["situation", "thoughts", "feelings", "body", "actions", "next_step"]
    .map((key) => [key, { value: key === "situation" ? "Jeg utsatte oppgaven." : key }]));
  submitWorkbench({ preventDefault() {}, currentTarget: { elements: formElements } });
  assert.match(rendered, /Velg selv et fenomen å undersøke/);
  assert.equal(window.PsychologyRoom.getWorkbenchEntries().length, 2);
  press("phenomenon:unngaelsesforsterkning");
  assert.match(rendered, /Du har valgt dette fenomenet selv/);
  press("related-exercise:dagens_behov_v1");
  assert.match(rendered, /Kort refleksjon/);
  const submitExercise = handlers.get("#psychologyRoomExerciseForm:submit");
  assert.equal(typeof submitExercise, "function");
  submitExercise({ preventDefault() {}, currentTarget: { elements: { reflection: { value: "Neste gang starter jeg med fem minutter." } } } });
  assert.match(rendered, /Du har gjennomført en øvelse/);
  assert.match(rendered, /Trinn 04: Utforsk forskningen/);
  assert.match(rendered, /data-psych-next-theory="behaviorisme"/);
  press("next-theory:behaviorisme");
  assert.match(rendered, /Fordypning i psykologifagverket/);

  press('[data-psych-nav="phenomena"]');
  assert.match(rendered, /Fenomenleksikon/);
  assert.doesNotMatch(rendered, /Velg selv et fenomen å undersøke/,
    "footer navigation does not interpret the click event as a workshop flow");
  press("focus:ruminasjon");
  assert.match(rendered, /FRA BEGREP TIL HANDLING/);
  assert.match(rendered, /data-psych-related="tool"/);
  assert.match(rendered, /Teoretisk bakgrunn/);
  console.log("psychology-room-theory.test.js passed");
})().catch((error) => { console.error(error); process.exitCode = 1; });
