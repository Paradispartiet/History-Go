const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))[0];

const profiles = {
  agnes: read('data/people/litteratur/oslo/nationaltheatret/agnes_mowinckel.json'),
  ragna: read('data/people/litteratur/oslo/nationaltheatret/ragna_wettergreen.json'),
  egil: read('data/people/litteratur/oslo/nationaltheatret/egil_eide.json'),
  august: read('data/people/litteratur/oslo/nationaltheatret/august_oddvar.json'),
};

const serialized = (person) => JSON.stringify(person).toLowerCase();

test('batch 5 keeps study travel, debut and employment out of education', () => {
  assert.equal(profiles.agnes.education.some((entry) => /London|Paris|1912/.test(entry)), false);
  assert.match(profiles.agnes.popupDesc, /studiereise, ikke et eget formelt utdanningsløp/);

  assert.deepEqual(profiles.ragna.education, ['Teaterstudier og rollelesning hos Lucie Wolf']);
  assert.equal(profiles.ragna.education.some((entry) => /debut|Christiania Theater|Nationaltheatret/i.test(entry)), false);

  assert.deepEqual(profiles.egil.education, ['Middelskoleeksamen i Haugesund']);
  assert.equal(profiles.egil.education.some((entry) => /USA|debut|Den Nationale Scene/i.test(entry)), false);

  assert.deepEqual(profiles.august.education, [
    'Typograflære i Kristiania',
    'Teaterskole hos Thora Lundh',
  ]);
  assert.equal(profiles.august.education.some((entry) => /Bjørn Bjørnson|rollelesning|Nationaltheatret/i.test(entry)), false);
});

test('Agnes Mowinckel profile uses inspectable production dates', () => {
  const myrkemakti = profiles.agnes.works.find((work) => work.title === 'Myrkemakti');
  const rur = profiles.agnes.works.find((work) => work.title === 'R.U.R.');
  const tante = profiles.agnes.works.find((work) => work.title === 'Tante Ulrikke');

  assert.equal(myrkemakti.year, 1923);
  assert.match(myrkemakti.summary, /7\. februar 1923/);
  assert.equal(rur.year, 1924);
  assert.match(rur.summary, /17\. oktober 1924/);
  assert.equal(tante.year, 1952);
  assert.match(tante.summary, /24\. november 1952/);
  assert.doesNotMatch(serialized(profiles.agnes), /kunstnerisk risiko|første rekke blant norske regissører/);
});

test('Ragna Wettergreen profile locks employment periods and dated roles', () => {
  assert.match(profiles.ragna.popupDesc, /Christiania Theater til 1899/);
  assert.match(profiles.ragna.popupDesc, /1904\/1905 til 1909\/1910/);
  assert.match(profiles.ragna.popupDesc, /fast ansatt til 1934/);

  const vildanden = profiles.ragna.works.find((work) => work.id === 'vildanden_1904_wettergreen');
  const eventyret = profiles.ragna.works.find((work) => work.id === 'eventyret_1952_wettergreen');
  assert.equal(vildanden.year, 1904);
  assert.match(vildanden.summary, /16\. mars 1904/);
  assert.equal(eventyret.year, 1952);
  assert.match(eventyret.summary, /12\. juni 1952/);
  assert.doesNotMatch(serialized(profiles.ragna), /mest gripende og presise|glansrollen|publikumssuksess/);
});

test('Egil Eide profile keeps exact debut, Brand and Kong Lear dates', () => {
  const debut = profiles.egil.works.find((work) => work.title === 'Axel og Valborg');
  const brand = profiles.egil.works.find((work) => work.title === 'Brand');
  const lear = profiles.egil.works.find((work) => work.title === 'Kong Lear');

  assert.equal(debut.year, 1894);
  assert.match(debut.summary, /4\. november 1894/);
  assert.equal(brand.year, 1904);
  assert.match(brand.summary, /første gang.*oppført i Norge/i);
  assert.match(brand.summary, /14\. september 1904/);
  assert.equal(lear.year, 1937);
  assert.match(lear.summary, /28\. oktober 1937/);
  assert.match(profiles.egil.popupDesc, /knyttet til teatret til 1939/);
  assert.doesNotMatch(serialized(profiles.egil), /kraftige naturtalentet|monumental tittelrolle|bærende kraft/);
});

test('August Oddvar profile preserves the Sigurd Jorsalfar source conflict', () => {
  const sigurd = profiles.august.works.find((work) => work.title === 'Sigurd Jorsalfar');
  const brand = profiles.august.works.find((work) => work.title === 'Brand');
  const finalRole = profiles.august.works.find((work) => work.title === 'Han som sa nei');

  assert.equal(sigurd.year, '1899/1901');
  assert.match(sigurd.summary, /Kildene er uenige/);
  assert.match(sigurd.summary, /NBL oppgir Ottar Birting 28\. september 1899/);
  assert.match(sigurd.summary, /Sceneweb.*navnløs mann i 1899.*Ottar Birting.*1901/);
  assert.match(profiles.august.popupDesc, /velger derfor ikke én av versjonene som ubestridt faktum/);

  assert.equal(brand.year, 1942);
  assert.match(brand.summary, /2\. april 1942/);
  assert.equal(finalRole.year, 1959);
  assert.match(finalRole.summary, /1\. oktober 1959/);
  assert.doesNotMatch(serialized(profiles.august), /intensitet, patos, stilisert kropp og stor scenisk fantasi/);
});

test('batch 5 audit report records source conflicts and rejects completeness incentives', () => {
  const report = fs.readFileSync(
    path.join(root, 'reports', 'people-factuality-audit-nationaltheatret-batch-5.md'),
    'utf8',
  );

  assert.match(report, /påstand-for-påstand-kontrollert 2026-07-27/);
  assert.match(report, /London og Paris i 1912.*studiereise.*ikke som formell utdanning/s);
  assert.match(report, /Scenewebs artistpost oppgir `1\. januar 1868`.*SNL og NBL oppgir `24\. august 1868`/s);
  assert.match(report, /NBL oppgir Ottar Birting 28\. september 1899/);
  assert.match(report, /Sceneweb.*navnløs mann.*1899.*Ottar Birting.*1901/s);
  assert.match(report, /Ingen profil må ha tre utdanningspunkter/);
  assert.match(report, /Ingen kildekonflikt skal løses ved at en språkmodell/);
  assert.match(report, /ikke en påstand om at hele History GO-databasen/);
});
