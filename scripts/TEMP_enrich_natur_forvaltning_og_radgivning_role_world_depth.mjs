import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const WORLD = 'data/Civication/roleWorlds/natur/natur_forvaltning_og_radgivning.json';
const full = path.join(root, WORLD);
const world = JSON.parse(fs.readFileSync(full, 'utf8'));

const relationshipSupplement = ' Den fler-dagers utviklingen skal dessuten gjøre det mulig å se forskjell på sosial tilslutning og faglig kvalitet: spilleren kan få mer tillit ved å synliggjøre et ubehagelig datagap, korrigere mandatglidning eller avgrense et råd, selv når dette koster tempo eller gjennomslag. Relasjonen kan påvirke informasjonsflyt, kontrollbehov og samarbeid, men kan aldri gjøre standing til evidens, oppfylle relevant_education_or_employer_qualification, gi juridisk hjemmel eller delegasjon, eller gjøre rådgiveren til beslutningseier.';
const aftermathSupplement = ' Etterklangen holder samtidig konfidensielle saksopplysninger ute av privatlivet og skiller mellom ansvar for et redelig faglig grunnlag og ansvar for den formelle beslutningen. Verken skam, stolthet, kundetilfredshet, lederros eller privat støtte kan endre data, regelverk, kvalifikasjon, delegasjon eller vedtak; personlig verdi skal heller ikke følge dagens profesjonelle standing.';

for (const thread of world.primary_threads || []) {
  if (String(thread.relationship || '').length < 450) thread.relationship = `${thread.relationship}${relationshipSupplement}`;
}
for (const aftermath of world.private_aftermath || []) {
  if (String(aftermath.description || '').length < 420) aftermath.description = `${aftermath.description}${aftermathSupplement}`;
}

for (const thread of world.primary_threads || []) {
  if (String(thread.relationship || '').length < 380) throw new Error(`${thread.id}: relationship depth ${String(thread.relationship || '').length}`);
}
for (const aftermath of world.private_aftermath || []) {
  if (String(aftermath.description || '').length < 350) throw new Error(`${aftermath.id}: aftermath depth ${String(aftermath.description || '').length}`);
}

fs.writeFileSync(full, `${JSON.stringify(world, null, 2)}\n`);
console.log(JSON.stringify({threads:world.primary_threads?.map((x)=>[x.id,x.relationship.length]),aftermath:world.private_aftermath?.map((x)=>[x.id,x.description.length])},null,2));
