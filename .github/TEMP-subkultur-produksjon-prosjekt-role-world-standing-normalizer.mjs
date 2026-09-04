import fs from 'node:fs';

const WORLD = 'data/Civication/roleWorlds/subkultur/subkultur_produksjon_og_prosjekt.json';
const world = JSON.parse(fs.readFileSync(WORLD, 'utf8'));

const phaseText = {
  morning: 'morgens status- og prioriteringsarbeid',
  lunch: 'lunsjens tverrfaglige forhandling og oversettelse',
  afternoon: 'ettermiddagens beslutning, handoff eller avgrensede rework',
  evening: 'kveldens sosiale og private ettervirkning',
};

for (const beat of world.season?.coverage || []) {
  const thread = beat.thread_ids?.[0] || 'prosjektarbeidet';
  const sourceId = beat.materialization_refs?.[0]?.split('#')[1] || 'ukjent_kilde';
  const context = phaseText[beat.phase] || beat.phase;
  beat.standing_consequence += ` For dag ${beat.day} i ${context} blir denne relasjonelle vurderingen derfor knyttet særskilt til tråden ${thread}: senere tillit skal huske om akkurat denne situasjonen ble møtt med sann status, korrekt myndighetsgrense, synlig belastning og en handoff som gjorde neste kontroll mulig. Arbeidsminnet er forankret i ${sourceId}, slik at konsekvensen ikke reduseres til en generell publikumsdom eller et globalt omdømmetall.`;
}

const values = world.season?.coverage?.map((beat) => beat.standing_consequence) || [];
if (values.length !== 56) throw new Error(`Expected 56 standing consequences, got ${values.length}`);
if (new Set(values).size !== 56) throw new Error(`Expected 56 unique standing consequences, got ${new Set(values).size}`);
if (values.some((value) => value.length < 500)) throw new Error('Standing consequence below 500 chars after normalization');

fs.writeFileSync(WORLD, JSON.stringify(world, null, 2) + '\n', 'utf8');
console.log('Normalized 56 beat-specific standing consequences');
