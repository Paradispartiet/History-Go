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

const editorialExtensions={
  negative_funn_og_publiseringspress:' Avvik mellom hypotese, funn og publiseringsønske må derfor dokumenteres eksplisitt før konklusjonen låses, slik at senere rework kan spores uten resultatjakt.',
  etikk_personvern_og_datagrense:' Hvis formål, mottakere eller datakoblinger endres, må den som faktisk har mandat dokumentere ny avklaring før arbeidet fortsetter; tidligere standing kan ikke fungere som stilltiende samtykke.',
  veiledning_hierarki_og_faglig_uavhengighet:' Faglig uavhengighet betyr derfor ikke å ignorere veiledning, men å bevare begrunnede alternativer, beslutningseier og konsekvensene av uenighet slik at maktasymmetrien ikke blir skjult i ettertid.',
  forfatterskap_bidrag_og_status:' Uenighet om kreditering skal derfor tilbake til dokumenterte bidrag og ansvar, ikke løses gjennom rang, gunst eller frykt for neste kontrakt.',
  milepaeler_karriere_og_midertidighet:' Fremdriftsrapportering må derfor kunne vise forsinkelse, usikkerhet og nødvendig rework uten å omskrive forskningshistorikken for å se mer karrieremessig vellykket ut.',
  privat_baerekraft_og_statusangst:' Bærekraft krever også at arbeidstid, fortrolighet og egne grenser kan forsvares når statuspresset er størst, uten at privat støtte blir en skjult forskningsressurs.'
};
for(const [id,extension] of Object.entries(editorialExtensions)) {
  const thread=(world.primary_threads||[]).find(item=>item.id===id);
  if(!thread||typeof thread.relationship!=='string') throw new Error('Expected primary thread missing: '+id);
  if(thread.relationship.length<500) thread.relationship += extension;
  if(thread.relationship.length<500) throw new Error('Primary thread remains below editorial depth floor: '+id+'/'+thread.relationship.length);
}
for(const thread of world.primary_threads||[]) {
  if(typeof thread.relationship!=='string'||thread.relationship.length<500) throw new Error('Unresolved primary-thread depth: '+thread.id+'/'+String(thread.relationship?.length));
}

fs.writeFileSync(p,JSON.stringify(world,null,2)+'\n');
console.log('Explicit degree boundary and theme-specific primary-thread editorial depth added.');
// Trigger retry only after the workflow already exists on the branch.
