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
fs.writeFileSync(p,JSON.stringify(world,null,2)+'\n');
console.log('Explicit degree boundary added to History Go authority separation.');
// Trigger attempt 2 only after the workflow already exists on the branch.
