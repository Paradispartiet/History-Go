const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const profilePath = (file) => path.join(root, 'data', 'people', 'litteratur', 'oslo', 'nationaltheatret', file);
const readProfile = (file) => JSON.parse(fs.readFileSync(profilePath(file), 'utf8'))[0];

const profiles = {
  alfred: readProfile('alfred_maurstad.json'),
  gerd: readProfile('gerd_grieg.json'),
  lillebil: readProfile('lillebil_ibsen.json'),
  tore: readProfile('tore_segelcke.json'),
};

const allText = (person) => JSON.stringify(person).toLowerCase();

test('batch 3 separates documented education from auditions, employment and ensemble practice', () => {
  assert.deepEqual(profiles.alfred.education, ['Underoffiserskolen i Bergen, 1916–1917']);
  assert.deepEqual(profiles.gerd.education, []);
  assert.deepEqual(profiles.lillebil.education, [
    'Ballettundervisning hos moren Gyda Christensen',
    'Studier hos ballettmester Hans Beck ved Det Kongelige Teater i København',
    'Studier hos koreograf Mikhail Fokine',
  ]);
  assert.deepEqual(profiles.tore.education, []);

  for (const person of Object.values(profiles)) {
    assert.ok(Array.isArray(person.education));
    assert.ok(person.externalLinks.length >= 4);
    assert.ok(person.externalLinks.every((link) => link.type === 'source' && /^https:\/\//.test(link.url)));
  }
});

test('Alfred Maurstad profile uses the correct inspectable Peer Gynt production', () => {
  const peerLink = profiles.alfred.externalLinks.find((link) => /Peer Gynt/.test(link.label));
  assert.ok(peerLink);
  assert.equal(peerLink.url, 'https://sceneweb.no/nb/production/16651/Peer_Gynt');
  assert.doesNotMatch(allText(profiles.alfred), /production\/41946/);
  assert.ok(profiles.alfred.works.some((work) => work.title === 'Peer Gynt' && /Johanne Dybwad/.test(work.summary)));
  assert.doesNotMatch(allText(profiles.alfred), /nasjonal stjerne|første store filmstjerne|scenisk energi|siste store scenetriumf/);
});

test('Gerd Grieg profile omits the unresolved Kritikerpris year conflict', () => {
  assert.doesNotMatch(allText(profiles.gerd), /kritikerpris/);
  const tora = profiles.gerd.works.find((work) => work.title === 'Paul Lange og Tora Parsberg');
  assert.ok(tora);
  assert.equal(tora.summary, 'Spilte Tora Parsberg i Nationaltheatrets oppsetning.');
  assert.ok(profiles.gerd.works.some((work) => work.title === 'Vår ære og vår makt' && work.year === 1951 && /Jørn Ording/.test(work.summary)));
});

test('Lillebil Ibsen profile keeps documented Reinhardt work outside education', () => {
  assert.ok(profiles.lillebil.education.includes('Studier hos koreograf Mikhail Fokine'));
  assert.equal(profiles.lillebil.education.some((entry) => /Max Reinhardt/.test(entry)), false);
  assert.match(profiles.lillebil.popupDesc, /fikk hun engasjement hos Max Reinhardt/);
  assert.doesNotMatch(allText(profiles.lillebil), /michel fokine/);
  assert.doesNotMatch(profiles.lillebil.popupDesc, /spilt i flere tiår/);
  assert.ok(profiles.lillebil.works.some((work) => work.title === 'Kjære løgnhals' && /Kritikerprisen/.test(work.summary)));
});

test('Tore Segelcke profile does not convert career history into education', () => {
  assert.deepEqual(profiles.tore.education, []);
  assert.ok(profiles.tore.works.some((work) => work.title === 'Ran' && /Torelil Løkkeberg/.test(work.summary)));
  assert.ok(profiles.tore.works.some((work) => work.title === 'Moren' && /Pelagea Vlasova/.test(work.summary)));
  assert.doesNotMatch(allText(profiles.tore), /monumental kraft|klassisk tragedienne for en moderne tid|kunstnerisk veiledning/);
});

test('batch 3 has a traceable audit report and does not claim global verification', () => {
  const reportPath = path.join(root, 'reports', 'people-factuality-audit-nationaltheatret-batch-3.md');
  const report = fs.readFileSync(reportPath, 'utf8');
  assert.match(report, /påstand-for-påstand-kontrollert 2026-07-27/);
  assert.match(report, /Tidligere History GO-tekst, readiness-score, eksisterende tester/);
  assert.match(report, /Norsk biografisk leksikon oppgir 1939, mens Sceneweb registrerer `Kritikerprisen 1940\/41`/);
  assert.match(report, /NBL beskriver Max Reinhardt som et profesjonelt engasjement, mens Sceneweb også bruker formuleringen «studerte»/);
  assert.match(report, /NBL oppgir `Sofie Parelius Ibsen`, mens Sceneweb oppgir `Sofie Parelius Monrad Krohn`/);
  assert.match(report, /En tom `education`-liste er beholdt/);
  assert.match(report, /ikke en påstand om at hele History GO-databasen/);
});
