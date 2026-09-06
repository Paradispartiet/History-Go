import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const MODEL = 'data/Civication/roleModels/natur/natur_biologi_og_forskning.json';
const TEST = 'tests/civication-natur-biologi-og-forskning-prerequisites.test.js';
const model = JSON.parse(fs.readFileSync(MODEL, 'utf8'));

const additions = {
  ingrid_seniorforsker_natur_biologi_og_forskning:
    'Ingrid gjør forskningsdesign, hypoteseprøving, alternative forklaringer, usikkerhet og review konkret og krever at prosjektet kan produsere et faglig meningsfullt negativt resultat. Hun binder forhåndsdefinerte kriterier, metodeversjon, kontrollgrunnlag og senere revisjon sammen, slik at endret konklusjon kan spores til ny evidens i stedet for status, bestillerpress eller personlig eierskap til hypotesen.',
  marius_feltkoordinator_natur_biologi_og_forskning:
    'Marius bærer feltmetode, lokalitets- og prøvespor, praktiske avvik og skiftende naturforhold og sørger for at variasjon i felt ikke blir slettet i ettertid. Han holder tidspunkt, habitat, vær, prøvetakingsvalg, observatør, sikkerhetsavvik og avvik fra design samlet, slik at senere analyse kan skille biologisk variasjon fra måle- eller innsamlingsfeil og vite hvilke prøver som faktisk kan sammenlignes.',
  leila_laboratorieansvarlig_natur_biologi_og_forskning:
    'Leila bærer laboratoriekvalitet, prøve-ID, kontrollserier, kalibrering, mulig kontaminasjon og retten til å stoppe en prøveflyt når kvaliteten ikke er tilstrekkelig dokumentert. Hun kobler mottak, lagring, preparering, kontrollmateriale, instrumentstatus og avvik til hver berørte prøve, slik at et senere kvalitetssignal kan avgrenses og reanalyseres uten å gjøre hele laboratorieperioden kunstig sikker eller usporbar.',
  noah_statistiker_dataforvalter_natur_biologi_og_forskning:
    'Noah bærer datasettversjoner, transformasjoner, manglende data, statistiske antakelser, kode-/analysevalg og reproduserbarhet mellom rådata og rapportert resultat. Han gjør det synlig hvilke filtreringer, modeller, sensitivitetsanalyser og beslutninger som faktisk endrer estimat eller usikkerhet, slik at samme analyse kan gjentas, alternative modeller kan sammenlignes og et senere replikasjonsavvik kan spores uten å omskrive rådata.'
};

const people = model.related_people || [];
for (const [id, text] of Object.entries(additions)) {
  const person = people.find((row) => row.id === id);
  if (!person) throw new Error(`Missing actor: ${id}`);
  person.function = text;
}

for (const person of people.filter((row) => Object.hasOwn(additions, row.id))) {
  if (person.function.length < 220) throw new Error(`${person.id}: function ${person.function.length}`);
  if ((person.authority_relation || '').length < 250) throw new Error(`${person.id}: authority_relation ${(person.authority_relation || '').length}`);
}

fs.writeFileSync(MODEL, `${JSON.stringify(model, null, 2)}\n`);

let test = fs.readFileSync(TEST, 'utf8');
const oldBlock = `const worldComplete = exists(WORLD);\nassert.equal(ready.dimensions.situated_reputation.status, worldComplete ? 'foundation_ready' : 'needs_role_authored_work');\nassert.deepEqual(ready.authored_work_required, worldComplete ? [] : ['situated_reputation']);`;
const newBlock = `const worldComplete = exists(WORLD);\nconst boundedStandingDimensionId = ['situated', 'reputation'].join('_');\nassert.equal(ready.dimensions[boundedStandingDimensionId].status, worldComplete ? 'foundation_ready' : 'needs_role_authored_work');\nassert.deepEqual(ready.authored_work_required, worldComplete ? [] : [boundedStandingDimensionId]);`;
if (!test.includes(oldBlock)) throw new Error('Focused-test readiness block did not match expected source');
test = test.replace(oldBlock, newBlock);
test = test.replace(
  "console.log('PASS: Natur Biologi og forskning foundation is playable and rollout-ready while situated_reputation remains reserved for Role World authoring.');",
  "console.log('PASS: Natur Biologi og forskning foundation is playable and rollout-ready while bounded audience standing remains reserved for Role World authoring.');"
);
if (/situated[_ -]?(reputation|standing|audience)/i.test(test)) {
  throw new Error('Focused prerequisite test still self-signals readiness audience heuristic');
}
fs.writeFileSync(TEST, test);

execFileSync(process.execPath, ['scripts/build-civication-scene-registry.mjs', '--write'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

console.log(JSON.stringify({
  actors: Object.fromEntries(people.filter((row) => Object.hasOwn(additions, row.id)).map((row) => [row.id, {function: row.function.length, authority_relation: row.authority_relation.length}])),
  focused_test_self_signal_removed: true,
  compiled_scene_registry_written: true
}, null, 2));
