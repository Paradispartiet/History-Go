import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const worldPath = path.join(root, 'data/Civication/roleWorlds/kunst/kunst_publikum_og_formidling.json');
if (!fs.existsSync(worldPath)) throw new Error(`Role World candidate missing: ${worldPath}`);

const world = JSON.parse(fs.readFileSync(worldPath, 'utf8'));
const relationshipAdditions = {
  jon_frontlinje_handoff_og_kapasitet: ' Over tid blir det synlig om spilleren faktisk deler belastning, følger opp det som ble meldt og gir Jon kreditt for observasjoner som forbedrer arbeidet, også når ingen publikummer ser denne delen av kvaliteten.',
  amal_tilgjengelighet_og_erfaringsdata: ' Relasjonen får tyngde når tidligere tilpasninger blir hentet fram igjen, kontrollert mot nye behov og revidert uten at spilleren gjør Amal til en symbolsk godkjenner av løsninger hun ikke eier.',
  erik_sikkerhet_hendelse_og_laring: ' Tillit bygges først når spilleren senere kan vise hva som faktisk ble meldt, hva som ble avklart av riktig fagperson og hvilke formuleringer som måtte endres etter hendelsen.',
  leila_partnerforberedelse_og_gruppeminne: ' Det avgjørende blir om spilleren husker tidligere friksjon ved neste møte, kan forklare hva institusjonen faktisk har endret og samtidig tåler at Leila mener endringen fortsatt ikke er god nok.',
  noah_kritikk_og_offentlig_korrigering: ' Når oppmerksomheten kommer tilbake flere dager senere, må spilleren kunne skille mellom hva som ble sagt, hva som senere ble dokumentert og hva som fortsatt er en legitim uenighet om tolkning.',
  privat_grense_og_sosial_energi: ' Tråden blir derfor også en prøve på om spilleren kan være nær og tilstede etter krevende dager uten å gjøre partner eller venn til uformell kollega, kriseberedskap eller kilde til profesjonell bekreftelse.'
};

const aftermathAdditions = {
  provenienssporsmalet_folger_hjem: ' Det private etterspillet skal dermed bevare både rollegrensen og spørsmålets sporbarhet fram til arbeidstiden åpner riktig avklaring igjen.',
  hendelsen_uten_heltefortelling: ' Hjemme må spilleren kunne la saken være uavklart uten å bygge en privat skadefortelling; hendelsesloggen, ikke selvbildet, bærer saken videre til neste kontrollerte vurdering.',
  korrigeringen_etter_popularitet: ' Det som skal tas med videre er den dokumenterte korreksjonen, hvorfor den ble nødvendig og hvem som eier neste versjon, ikke et behov for å vinne tilbake sosial sikkerhet før neste møte.',
  tilgjengelighetsarbeidet_som_ikke_blir_synlig: ' Privat bærekraft betyr også å akseptere at godt omsorgs- og tilgjengelighetsarbeid ofte er målbart i færre barrierer og bedre handoff, ikke i synlig personlig anerkjennelse.',
  sesongslutt_uten_publikumsscore: ' Spilleren må kunne avslutte uten å presse divergerende relasjoner inn i én dom, og la både åpne fagspørsmål, uenighet og dokumentert læring eksistere samtidig.'
};

const seenRelationships = new Set();
for (const thread of world.primary_threads || []) {
  const addition = relationshipAdditions[thread.id];
  if (!addition) continue;
  if (!thread.relationship.endsWith(addition)) thread.relationship += addition;
  seenRelationships.add(thread.id);
}
for (const id of Object.keys(relationshipAdditions)) {
  if (!seenRelationships.has(id)) throw new Error(`Expected relationship thread missing: ${id}`);
}
for (const thread of world.primary_threads || []) {
  if ((thread.relationship || '').length < 300) {
    throw new Error(`Relationship depth remains below 300 chars: ${thread.id} (${(thread.relationship || '').length})`);
  }
}

const seenAftermaths = new Set();
for (const aftermath of world.private_aftermath || []) {
  const addition = aftermathAdditions[aftermath.id];
  if (!addition) continue;
  if (!aftermath.description.endsWith(addition)) aftermath.description += addition;
  seenAftermaths.add(aftermath.id);
}
for (const id of Object.keys(aftermathAdditions)) {
  if (!seenAftermaths.has(id)) throw new Error(`Expected private aftermath missing: ${id}`);
}
for (const aftermath of world.private_aftermath || []) {
  if ((aftermath.description || '').length < 350) {
    throw new Error(`Private aftermath depth remains below 350 chars: ${aftermath.id} (${(aftermath.description || '').length})`);
  }
}

fs.writeFileSync(worldPath, `${JSON.stringify(world, null, 2)}\n`);
console.log('Enriched Publikum og formidling relationship threads:', Object.keys(relationshipAdditions).length);
console.log('Enriched Publikum og formidling private aftermaths:', Object.keys(aftermathAdditions).length);
