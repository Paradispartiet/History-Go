import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const worldPath = path.join(root, 'data/Civication/roleWorlds/kunst/kunst_publikum_og_formidling.json');
if (!fs.existsSync(worldPath)) throw new Error(`Role World candidate missing: ${worldPath}`);

const world = JSON.parse(fs.readFileSync(worldPath, 'utf8'));
const additions = {
  jon_frontlinje_handoff_og_kapasitet: ' Over tid blir det synlig om spilleren faktisk deler belastning, følger opp det som ble meldt og gir Jon kreditt for observasjoner som forbedrer arbeidet, også når ingen publikummer ser denne delen av kvaliteten.',
  amal_tilgjengelighet_og_rework: ' Relasjonen får tyngde når tidligere tilpasninger blir hentet fram igjen, kontrollert mot nye behov og revidert uten at spilleren gjør Amal til en symbolsk godkjenner av løsninger hun ikke eier.',
  erik_sikkerhet_og_tydelig_handoff: ' Tillit bygges først når spilleren senere kan vise hva som faktisk ble meldt, hva som ble avklart av riktig fagperson og hvilke formuleringer som måtte endres etter hendelsen.',
  leila_partnerforventning_og_gjenbesok: ' Det avgjørende blir om spilleren husker tidligere friksjon ved neste møte, kan forklare hva institusjonen faktisk har endret og samtidig tåler at Leila mener endringen fortsatt ikke er god nok.',
  noah_offentlig_press_og_kildegrense: ' Når oppmerksomheten kommer tilbake flere dager senere, må spilleren kunne skille mellom hva som ble sagt, hva som senere ble dokumentert og hva som fortsatt er en legitim uenighet om tolkning.',
  privat_dekompresjon_og_rollegrense: ' Tråden blir derfor også en prøve på om spilleren kan være nær og tilstede etter krevende dager uten å gjøre partner eller venn til uformell kollega, kriseberedskap eller kilde til profesjonell bekreftelse.'
};

const seen = new Set();
for (const thread of world.primary_threads || []) {
  const addition = additions[thread.id];
  if (!addition) continue;
  if (!thread.relationship.endsWith(addition)) thread.relationship += addition;
  seen.add(thread.id);
}

for (const id of Object.keys(additions)) {
  if (!seen.has(id)) throw new Error(`Expected relationship thread missing: ${id}`);
}
for (const thread of world.primary_threads || []) {
  if ((thread.relationship || '').length < 300) {
    throw new Error(`Relationship depth remains below 300 chars: ${thread.id} (${(thread.relationship || '').length})`);
  }
}

fs.writeFileSync(worldPath, `${JSON.stringify(world, null, 2)}\n`);
console.log('Enriched Publikum og formidling relationship threads:', Object.keys(additions).length);
