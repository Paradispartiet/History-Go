#!/usr/bin/env node
'use strict';
// Lillebekk: realistic, source-bound document comparison and internal memo.
// All facts are authored fictional case materials, never external approvals.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createAdapter } = require('../js/Civication/core/civicationWorkWorld.js');
const source=fs.readFileSync(path.resolve(__dirname,'../js/Civication/ui/CivicationInboxTopActionUI.js'),'utf8');
const caseId='by_radgiver_lillebekk_plan_case_001';
let saved={};
let activeRole={role_key:'arealplanlegger',title:'Arealplanlegger'};
const storage={
 getState(){return JSON.parse(JSON.stringify(saved));},
 setState(patch){saved={...saved,...patch};return this.getState();}
};
const world=createAdapter(storage);
const host={innerHTML:'',querySelectorAll(){return [];}};
const ctx={
 document:{
  readyState:'loading',
  addEventListener(){},
  getElementById(id){return id==='civiInbox'?host:null;}
 },
 window:{
  CivicationState:{getActivePosition(){return activeRole;}},
  CivicationWorkWorld:world,
  CivicationMailEngine:{getInbox(){return [];}},
  addEventListener(){},
  setTimeout(){throw new Error('test must not schedule UI refreshes');}
 }
};
vm.runInNewContext(source,ctx,{filename:'CivicationInboxTopActionUI.js'});
const api=ctx.window.CivicationInboxTopActionUI;
assert.equal(api.getLillebekkSaksframleggModel(),null,'no formal case, no review');
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','avklar_forst','Ingen formell sak skal kunne behandles av spilleren.').ok,false);
assert.equal(api.recordLillebekkSaksframlegg('En svært lang anbefaling kan ikke erstatte en registrert formell sak.').ok,false);

world.createWorkObject({
 work_object_id:caseId,kind:'plan_case',role_scope:'by_radgiver_plan',
 title:'Lillebekk formell plansak',status:'open',phase:'formal_review',
 flags:['skolevei_ikke_dokumentert','early_green_corridor_unsecured',
 'politisk_grense_ikke_eksplisitt']
},{event_id:'lillebekk_memo_test_open',at:'2026-11-06T13:00:00Z'});
assert.equal(api.getLillebekkSaksframleggModel().exhibitsReviewed,false);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('Bilagsavstemming og internt saksframlegg'));
assert.ok(host.innerHTML.includes('Behandle alle tre saksbilag'));
assert.ok(!host.innerHTML.includes('data-civi-lillebekk-crosscheck="1"'));
assert.ok(!host.innerHTML.includes('data-civi-lillebekk-draft="1"'));
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','avklar_forst',
 'En skolevei trenger kontroll av faktisk bruk og tidspunkt.').ok,false,
 'cannot claim comparison before processing the case exhibits');

for (const [id,choice] of [
 ['hanne-skolevei-01','A'],
 ['signe-grontdrag-01','A'],
 ['ivar-rekkefolge-01','A']
]) {
 assert.equal(api.recordLillebekkExhibitDecision(id,choice).ok,true);
}
let model=api.getLillebekkSaksframleggModel();
assert.equal(model.exhibitsReviewed,true);
assert.equal(model.checks.length,3);
assert.equal(model.ready,false);
assert.deepEqual(Array.from(model.checks[0].refs),['LBK-MERK-01','LBK-UTB-03']);
assert.deepEqual(Array.from(model.checks[1].refs),['LBK-FAG-02','LBK-UTB-03']);
assert.ok(model.checks[2].refs.includes('LBK-MERK-01'));
assert.equal(api.renderSections(),true);
assert.equal((host.innerHTML.match(/data-civi-lillebekk-crosscheck="1"/g)||[]).length,3);
assert.ok(!host.innerHTML.includes('data-civi-lillebekk-draft="1"'));
assert.equal(api.recordLillebekkComparison('unknown','avklar_forst','Ingen slik kildekontroll finnes i denne saken.').ok,false);
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','godkjenn_plan','Vi kan ikke fatte planvedtak som rådgiver i denne saken.').ok,false);
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','avklar_forst','for kort').ok,false);

const reasons={
 skolevei_tidskrav:'Innspillet dokumenterer faktisk bruk, men ikke trafikkfaglig sikkerhet eller tidspunkt før innflytting.',
 grontdrag_overvann:'Signes notat beskriver mulige funksjoner, men det mangler teknisk grunnlag for flomveien og jorddybden.',
 utbygger_myndighet:'Ivars e-post er en forespørsel om fremdrift, ikke et vedtak eller tilsagn fra kommunen.'
};
const wrong=api.recordLillebekkComparison('skolevei_tidskrav','anta_avklart',reasons.skolevei_tidskrav);
assert.equal(wrong.ok,true);
assert.equal(api.getLillebekkSaksframleggModel().checks[0].safe,false);
assert.equal(api.recordLillebekkSaksframlegg(
 'Jeg anbefaler å få alle faglige forhold godkjent uten kontroll av premissene, og så oversende videre.').ok,false);
const corrected=api.recordLillebekkComparison('skolevei_tidskrav','avklar_forst',reasons.skolevei_tidskrav);
assert.equal(corrected.ok,true);
assert.equal(corrected.alreadyLogged,false);
const repeated=api.recordLillebekkComparison('skolevei_tidskrav','avklar_forst',
 '  Innspillet  dokumenterer faktisk bruk, men ikke trafikkfaglig sikkerhet eller tidspunkt før innflytting.  ');
assert.equal(repeated.alreadyLogged,true,'same normalized evaluation is not journaled twice');
assert.equal(world.getWorkObject(caseId).history.filter(e=>e.id.startsWith('lillebekk_kildeavstemming_skolevei_tidskrav_v')).length,2);

for (const id of ['grontdrag_overvann','utbygger_myndighet']) {
 assert.equal(api.recordLillebekkComparison(id,'avklar_forst',reasons[id]).ok,true);
}
model=api.getLillebekkSaksframleggModel();
assert.equal(model.ready,true);
assert.equal(model.checks.filter(c=>c.safe).length,3);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-lillebekk-draft="1"'));
const short='Bruk faglig skjønn.';
assert.equal(api.recordLillebekkSaksframlegg(short).ok,false);

const recommendation='Jeg anbefaler ny trafikkfaglig kontroll av skoleveien, overvannsnotat og en presisering av rekkefølgekravet. Elin må vurdere om saken har tilstrekkelig grunnlag til videre behandling.';
const first=api.recordLillebekkSaksframlegg(recommendation);
assert.equal(first.ok,true);
assert.equal(first.alreadyLogged,false);
model=api.getLillebekkSaksframleggModel();
assert.equal(model.draftCount,1);
assert.equal(model.upToDate,true,'latest draft tracks precisely the latest source assessment revisions');
assert.equal(model.latestDraft.outcome,'internt_utkast_ikke_godkjent');
for (const token of ['LBK-MERK-01','LBK-FAG-02','LBK-UTB-03',
 'Skolevei','Grøntdrag','Elin','ikke et vedtak','Kildeversjoner:']) {
 assert.ok(model.latestDraft.note.includes(token), 'required case-memo provenance: '+token);
}
assert.equal(world.getWorkObject(caseId).status,'open');
for (const flag of ['skolevei_ikke_dokumentert','early_green_corridor_unsecured','politisk_grense_ikke_eksplisitt']) {
 assert.ok(world.getWorkObject(caseId).flags.includes(flag));
}
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
assert.equal(api.recordLillebekkSaksframlegg('  '+recommendation+'  ').alreadyLogged,true);
assert.equal(world.getWorkObject(caseId).history.filter(e=>e.id.startsWith('lillebekk_saksframlegg_utkast_v')).length,1);

saved=JSON.parse(JSON.stringify(saved));
model=api.getLillebekkSaksframleggModel();
assert.equal(model.upToDate,true,'source trace and memo survive save/reload');
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('Sist journalførte saksframlegg'));
assert.ok(host.innerHTML.includes('gjeldende kildeversjoner'));

// New case evidence is part of the snapshot, not only authored comparison revisions.
world.addFlag(caseId,'stormwater_unsecured_in_plan',{
 event_id:'lillebekk_memo_new_stormwater_issue',at:'2026-11-06T15:00:00Z'
});
model=api.getLillebekkSaksframleggModel();
assert.equal(model.upToDate,false,
 'newly registered stormwater issue must make a previous case memo stale');
assert.ok(model.dossier.topics.find(x=>x.id==='overvann').issue);
api.renderSections();
assert.ok(host.innerHTML.includes('gjennomgå kildeversjoner på nytt'));

// A real new opinion reopens the memo, even if the previous memo remains in case history.
assert.equal(api.recordLillebekkComparison('grontdrag_overvann','anta_avklart',
 'Signe har skrevet et notat som jeg tidligere forvekslet med et prosjektert overvannsanlegg.').ok,true);
model=api.getLillebekkSaksframleggModel();
assert.equal(model.ready,false);
assert.equal(model.upToDate,false);
assert.equal(api.recordLillebekkSaksframlegg(recommendation).ok,false);
assert.equal(api.recordLillebekkComparison('grontdrag_overvann','avklar_forst',
 'Signes fagnotat beskriver manglene og det kreves fortsatt en teknisk dokumentasjon av overvann.').ok,true);
model=api.getLillebekkSaksframleggModel();
assert.equal(model.ready,true);
assert.equal(model.upToDate,false,'a later assessment changes the source signature');
assert.equal(api.recordLillebekkSaksframlegg(recommendation).ok,true);
assert.equal(api.getLillebekkSaksframleggModel().draftCount,2);
assert.equal(api.getLillebekkSaksframleggModel().upToDate,true);

// All player text is escaped when shown in the read-only memo.
const unsafe='Før videre behandling skal Elin hente vurderinger. <img src=x onerror=alert(1)> Dette må omtales som kildekritikk, ikke dokumentasjon.';
assert.equal(api.recordLillebekkSaksframlegg(unsafe).ok,true);
api.renderSections();
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));

// Access and jurisdiction boundaries.
activeRole={role_key:'butikkmedarbeider'};
assert.equal(api.getLillebekkSaksframleggModel(),null);
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','avklar_forst',reasons.skolevei_tidskrav).ok,false);
assert.equal(api.recordLillebekkSaksframlegg(recommendation).ok,false);
activeRole={role_key:'arealplanlegger'};
world.closeWorkObject(caseId,{event_id:'lillebekk_memo_test_close',at:'2026-11-07T10:00:00Z',outcome:'closed_for_test'});
assert.equal(api.getLillebekkSaksframleggModel(),null);
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','avklar_forst',reasons.skolevei_tidskrav).ok,false);
assert.equal(api.recordLillebekkSaksframlegg(recommendation).ok,false);
console.log('Lillebekk saksframlegg: source trace, professional controls, memo versions, access and approvals verified');
