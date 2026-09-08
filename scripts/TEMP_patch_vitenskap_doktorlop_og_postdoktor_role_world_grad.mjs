import fs from 'node:fs';

const p='data/Civication/roleWorlds/vitenskap/vitenskap_doktorlop_og_postdoktor.json';
const world=JSON.parse(fs.readFileSync(p,'utf8'));
if(world.role_scope!=='vitenskap_doktorlop_og_postdoktor') throw new Error('Role scope drift');
const original=world.history_go_affordance?.authority_boundary;
if(typeof original!=='string') throw new Error('History Go authority boundary missing');
for(const required of [/academic_qualification_and_employment/i,/formelt opptak eller ansettelse/i,/godkjenning/i]) {
  if(!required.test(original)) throw new Error('Authority boundary prerequisite text drift: '+required);
}
if(!/grad/i.test(original)) {
  const needle='formelt opptak eller ansettelse,';
  if(!original.includes(needle)) throw new Error('Expected admission/employment boundary text not found');
  world.history_go_affordance.authority_boundary=original.replace(
    needle,
    'formelt opptak eller ansettelse, grad,'
  );
}
const patched=world.history_go_affordance.authority_boundary;
for(const required of [/academic_qualification_and_employment/i,/grad/i,/rådata/i,/metodeversjon/i,/personvern/i,/godkjenning/i]) {
  if(!required.test(patched)) throw new Error('Patched authority boundary missing: '+required);
}

const negativeThread=(world.primary_threads||[]).find(thread=>thread.id==='negative_funn_og_publiseringspress');
if(!negativeThread||typeof negativeThread.relationship!=='string') throw new Error('Negative findings thread missing');
if(negativeThread.relationship.length<500) {
  negativeThread.relationship += ' Avvik mellom hypotese, funn og publiseringsønske må derfor dokumenteres eksplisitt før konklusjonen låses, slik at senere rework kan spores uten resultatjakt.';
}
if(negativeThread.relationship.length<500) throw new Error('Negative findings thread remains below editorial depth floor');

fs.writeFileSync(p,JSON.stringify(world,null,2)+'\n');
console.log('Explicit degree boundary and negative-findings editorial depth added to History Go authority separation.');
// Trigger retry only after the workflow already exists on the branch.
