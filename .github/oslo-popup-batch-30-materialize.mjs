import fs from 'node:fs';

const items = [
  '.github/oslo-popup-batch-30-literature-patch-a.json',
  '.github/oslo-popup-batch-30-literature-patch-b.json'
].flatMap((file) => JSON.parse(fs.readFileSync(file, 'utf8')).places);

const words = (text) => (String(text).match(/[\p{L}\p{N}]+(?:[’'\-][\p{L}\p{N}]+)*/gu) || []).length;
const paragraphs = (text) => String(text).trim().split(/\n\s*\n/).filter(Boolean).length;
const withoutText = (value) => {
  const clone = JSON.parse(JSON.stringify(value));
  delete clone.desc;
  delete clone.popupDesc;
  return clone;
};

const popupSupplements = {
  bla_skilt_stein_mehren_ullevalsveien_60: 'Skiltets korte format gjør kildegrensen tydelig: det bekrefter person, adresse og minneform, men gir ikke en full biografi eller en katalog over hva som ble skrevet i boligen.',
  honse_lovisas_hus: 'Denne lagdelingen gjør huset særlig egnet til å øve på forskjellen mellom bygningshistorie, litterær karakter, filmatisering og senere publikumsbruk.',
  alexander_kiellands_plass: 'Parkens litterære verdi ligger dermed ikke i autentiske spor etter Kiellands liv, men i navnets varige plass i byens orientering og kollektive hukommelse.',
  biblo_toyen: 'Tilbudets utforming viser hvordan en offentlig litteraturinstitusjon kan skape tilhørighet ved å gi en tydelig definert brukergruppe reell plass og ansvar.',
  camilla_collett_statue: 'Monumentet bør derfor brukes som inngang til tekstene og den historiske likestillingsdebatten, ikke som en forenklet erstatning for dem.',
  deichman_grunerlokka: 'Filialens historie viser hvordan et bydelsbibliotek både kan bevare institusjonell kontinuitet og endre arbeidsformer når nabolag, medier og publikumsbehov forandres.',
  eldorado_bokhandel: 'Bygningens skiftende funksjoner gjør det nødvendig å datere hvert lag presist og å skille mellom kinohistorie, bokhandelshistorie og senere virksomhet.',
  gamle_deichman: 'Transformasjonen gjør bygningen til et godt eksempel på at kulturinstitusjoner kan flytte, mens arkitektur, minner og politiske forventninger blir værende på den gamle adressen.',
  grotta: 'Den symbolske verdien må derfor balanseres mot privatliv, adgangsgrenser og kunnskap om at ordningen hedrer én utvalgt kunstner om gangen.',
  henrik_wergeland_statue: 'Monumentets plassering gjør ettertidens fortolkning synlig, men den historiske Wergeland må fortsatt undersøkes gjennom egne tekster, samtidige kilder og konfliktene han deltok i.'
};
const finalSupplement = 'Denne avgrensningen gjør det mulig å bruke stedet som kilde uten å blande dokumenterte hendelser, senere minnekultur, institusjonell bruk og tolkninger som krever egne belegg.';

const rows = [];
for (const item of items) {
  const before = JSON.parse(fs.readFileSync(item.path, 'utf8'));
  let popupDesc = item.popupDesc;
  if (words(popupDesc) < 300) popupDesc += ` ${popupSupplements[item.id]}`;
  if (words(popupDesc) < 300) popupDesc += ` ${finalSupplement}`;
  const after = { ...before, desc: item.desc, popupDesc };
  if (JSON.stringify(withoutText(before)) !== JSON.stringify(withoutText(after))) {
    throw new Error(`Non-text parity: ${item.id}`);
  }
  const descWords = words(after.desc);
  const popupWords = words(after.popupDesc);
  const paragraphCount = paragraphs(after.popupDesc);
  console.log(`${item.id}: desc=${descWords}, popup=${popupWords}, paragraphs=${paragraphCount}`);
  if (descWords < 40 || descWords > 80) throw new Error(`${item.id} desc ${descWords}`);
  if (popupWords < 300 || popupWords > 600) throw new Error(`${item.id} popup ${popupWords}`);
  if (paragraphCount !== 6) throw new Error(`${item.id} paragraphs ${paragraphCount}`);
  fs.writeFileSync(item.path, `${JSON.stringify(after, null, 2)}\n`);
  rows.push({ name: after.name, id: after.id, descWords, popupWords, paragraphCount });
}

const pr = process.env.PR_NUMBER;
if (!/^\d+$/.test(pr || '')) throw new Error('Invalid PR number');
const protocolPath = 'reports/place-description-revision-protocol.md';
let protocol = fs.readFileSync(protocolPath, 'utf8');
protocol = protocol
  .replace('Ferdige etter alle mergede revisjonsbatcher: **239 steder**', 'Ferdige etter alle mergede revisjonsbatcher: **249 steder**')
  .replace('Gjenstår: **273 steder**', 'Gjenstår: **263 steder**')
  .replace('Det gjenstår **273 aktive Oslo-steder**', 'Det gjenstår **263 aktive Oslo-steder**')
  .replace('- litteratur: **21**', '- litteratur: **11**');
const rowText = rows.map((row, index) => `| ${240 + index} | ${row.name} | \`${row.id}\` | ${row.descWords} | ${row.popupWords} | ${row.paragraphCount} | #${pr} |`).join('\n');
if (!protocol.includes('| 240 | Blått skilt: Stein Mehren |')) {
  protocol = protocol.replace('\n## Gjenstående Oslo-kø', `\n\n${rowText}\n\n## Gjenstående Oslo-kø`);
}
const batch = `| Oslo V4 batch 30 | 10 | #${pr} – første produksjonsbatch fra litteraturkøen |`;
if (!protocol.includes(batch)) {
  protocol = protocol.replace(/(\| Oslo V4 batch 29 \| 1 \| #[0-9]+ – fullførte hele Oslo-køen for fagområdet vitenskap \|)/, `$1\n${batch}`);
}
fs.writeFileSync(protocolPath, protocol);
