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

// A positive earlier fagspor does not erase a newer missing-document assessment.
world.addFlag(caseId,'early_map_conflict_documented',{
 event_id:'lillebekk_memo_map_existing_fagspor',at:'2026-11-06T14:50:00Z'
});
assert.equal(api.recordLillebekkDocumentReceipt('plankart','J-2026-214',
 'Kommunens planteam','Datert kartutkast med byggegrenser og foreløpig tegnforklaring.').ok,true);
assert.equal(api.recordLillebekkDocumentAssessment('plankart','mangelfull',
 'Kartutkastet mangler dokumentert versjonsdato og avklaring av byggegrense mot grøntdraget.').ok,true);
model=api.getLillebekkSaksframleggModel();
assert.equal(model.dossier.topics.find(x=>x.id==='plankart').status,'Faglig spor registrert');
assert.equal(model.upToDate,false);
assert.equal(api.recordLillebekkSaksframlegg(recommendation).ok,true);
model=api.getLillebekkSaksframleggModel();
assert.equal(model.draftCount,2);
assert.ok(model.latestDraft.note.includes('Plankart og areal: Faglig spor registrert.'));
assert.ok(model.latestDraft.note.includes('Kartutkastet mangler dokumentert versjonsdato'));
assert.equal(model.upToDate,true);

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
assert.equal(api.getLillebekkSaksframleggModel().draftCount,3);
assert.equal(api.getLillebekkSaksframleggModel().upToDate,true);

// All player text is escaped when shown in the read-only memo.
const unsafe='Før videre behandling skal Elin hente vurderinger. <img src=x onerror=alert(1)> Dette må omtales som kildekritikk, ikke dokumentasjon.';
assert.equal(api.recordLillebekkSaksframlegg(unsafe).ok,true);
api.renderSections();
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));

// Revision caps must not trap a role permanently in an unsafe assessment.
for(let i=0;i<9;i++) {
 assert.equal(api.recordLillebekkComparison('utbygger_myndighet','anta_avklart',
  'Denne bevisst uforsvarlige konklusjonen er revisjon '+i+
  ' og kan ikke brukes som formell avgjørelse for plansaken.').ok,true);
}
model=api.getLillebekkSaksframleggModel();
assert.equal(model.checks.find(x=>x.id==='utbygger_myndighet').revisionCount,10);
assert.equal(model.ready,false);
assert.equal(api.recordLillebekkComparison('utbygger_myndighet','avklar_forst',
 'En full kildevurdering må vise at Ivars henvendelse ikke gir noen forhåndsgodkjenning.').ok,true);
model=api.getLillebekkSaksframleggModel();
assert.equal(model.checks.find(x=>x.id==='utbygger_myndighet').revisionCount,11);
assert.equal(model.ready,true);
assert.equal(api.recordLillebekkComparison('utbygger_myndighet','anta_avklart',
 'Ikke åpne for et nytt uforsvarlig standpunkt etter at sluttkorrigeringen er gjort.').ok,false);

// Manager rework: Elin is a fictional authored role, not an external approver.
assert.equal(api.recordLillebekkSaksframlegg(recommendation).ok,true,
 'fresh source snapshot must precede leader review');
// Exhaust the ten ordinary draft versions before the manager return.
// A returned review must still permit exactly one corrective draft.
while (api.getLillebekkSaksframleggModel().draftCount < 10) {
 const n=api.getLillebekkSaksframleggModel().draftCount+1;
 assert.equal(api.recordLillebekkSaksframlegg(
  recommendation+' Ytterligere intern gjennomgang av saksgrunnlaget i versjon '+n+'.').ok,true);
}
assert.equal(api.getLillebekkSaksframleggModel().draftCount,10);
assert.equal(api.recordLillebekkSaksframlegg(recommendation+' Overskridelse av ordinær grense.').ok,false);
let leader=api.getLillebekkLeaderReviewModel();
assert.equal(leader.canRequestReview,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-lillebekk-leader-return="1"'));
const returnedId=leader.memo.latestDraft.id;
assert.equal(api.recordLillebekkLeaderReturn().ok,true);
leader=api.getLillebekkLeaderReviewModel();
assert.equal(leader.returnEvent?.choice_id,returnedId);
assert.equal(leader.returnEvent?.outcome,'simulert_leder_returnert_ikke_godkjent');
assert.ok(leader.returnEvent.note.includes('SIMULERT INTERN LEDERRETUR'));
assert.equal(leader.points.length,3);
assert.equal(new Set(leader.points.map(p=>p.needed)).size,3);
assert.equal(api.recordLillebekkLeaderReturn().ok,false);
assert.equal(api.recordLillebekkSaksframlegg(recommendation+' En omgåelse av ledermerknader.').ok,false);
assert.equal(api.recordLillebekkCorrectedMemo(recommendation).ok,false);
assert.equal(api.renderSections(),true);
assert.equal((host.innerHTML.match(/data-civi-lillebekk-leader-response="1"/g)||[]).length,3);
assert.ok(!host.innerHTML.includes('data-civi-lillebekk-draft="1"'),
 'the ordinary memo editor must not remain available after leader return');
assert.ok(!host.innerHTML.includes('data-civi-lillebekk-revised-memo="1"'));

const leaderReason='Fagansvarlig må vurdere de konkrete forholdene mot dokumentasjonen før videre saksbehandling. Ingen kommunal godkjenning er gitt.';
assert.equal(api.recordLillebekkLeaderResponse('ukjent','trafikkfag',leaderReason).ok,false);
assert.equal(api.recordLillebekkLeaderResponse('skolevei','godkjent',leaderReason).ok,false);
assert.equal(api.recordLillebekkLeaderResponse('skolevei','trafikkfag','for kort').ok,false);
assert.equal(api.recordLillebekkLeaderResponse('skolevei','antatt_avklart',leaderReason).ok,true);
assert.equal(api.getLillebekkLeaderReviewModel().points.find(p=>p.id==='skolevei').safe,false);
assert.equal(api.recordLillebekkLeaderResponse('skolevei','trafikkfag',leaderReason).ok,true);
assert.equal(api.recordLillebekkLeaderResponse('skolevei','trafikkfag',' '+leaderReason+' ').alreadyLogged,true);
assert.equal(world.getWorkObject(caseId).history.filter(e=>e.id.startsWith('lillebekk_leder_svar_skolevei_v')).length,2);
assert.equal(api.recordLillebekkLeaderResponse('grontdrag','overvannsfag',leaderReason).ok,true);
assert.equal(api.recordLillebekkLeaderResponse('utbygger','planjuss',leaderReason).ok,true);
leader=api.getLillebekkLeaderReviewModel();
assert.equal(leader.answeredCount,3);
assert.equal(leader.canRevise,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-lillebekk-revised-memo="1"'));

world.addFlag(caseId,'participation_record_missing',{
 event_id:'lillebekk_memo_leader_new_participation_issue',at:'2026-11-06T16:00:00Z'
});
assert.equal(api.getLillebekkLeaderReviewModel().canRevise,true);
assert.equal(api.getLillebekkLeaderReviewModel().memo.upToDate,false);
const correctedRecommendation='Jeg anbefaler kontroll hos trafikkfag, overvannsfag og planjuss av de dokumenterte manglene før videre behandling. Medvirkningsprotokollen må også gjennomgås av ansvarlig saksbehandler.';
assert.equal(api.recordLillebekkCorrectedMemo(correctedRecommendation).ok,true);
leader=api.getLillebekkLeaderReviewModel();
assert.equal(leader.corrected,true);
assert.equal(leader.canRevise,false);
assert.equal(leader.memo.upToDate,true);
assert.equal(leader.memo.latestDraft.outcome,'korrigert_internt_utkast_ikke_godkjent');
assert.equal(leader.memo.draftCount,11,
 'exactly one corrective version is available after ten regular drafts');
assert.ok(leader.memo.latestDraft.note.includes('Lederretur: lillebekk_leder_retur_v1'));
assert.ok(leader.memo.latestDraft.note.includes('Skolevei og tidspunkt for trygg adkomst'));
assert.ok(leader.memo.latestDraft.note.includes('Grøntdrag, flomvei og planbestemmelser'));
assert.ok(leader.memo.latestDraft.note.includes('Medvirkning'));
for(const flag of ['skolevei_ikke_dokumentert','early_green_corridor_unsecured','participation_record_missing']) {
 assert.ok(world.getWorkObject(caseId).flags.includes(flag));
}
assert.equal(world.getWorkObject(caseId).status,'open');
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
assert.equal(api.recordLillebekkCorrectedMemo(correctedRecommendation).ok,false);
assert.equal(api.recordLillebekkLeaderReturn().ok,false);
assert.equal(api.recordLillebekkSaksframlegg(correctedRecommendation).ok,false);
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkLeaderReviewModel().corrected,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('Korrigert saksframlegg journalført'));
assert.ok(!host.innerHTML.includes('data-civi-lillebekk-revised-memo="1"'));

// Fictional professional replies after the manager's returned, corrected memo.
const beforeFagsvar=api.getLillebekkFagsvarModel();
assert.ok(beforeFagsvar?.leader.corrected,'the manager step is a prerequisite');
assert.equal(beforeFagsvar.intake,null);
assert.equal(beforeFagsvar.docs.length,3);
assert.deepEqual(Array.from(beforeFagsvar.docs.map(d=>d.ref)),['LBK-TRAF-04','LBK-OV-05','LBK-JUS-06']);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-fagsvar-intake="1"'));
assert.ok(!host.innerHTML.includes('data-civi-fagsvar-assess="1"'));
assert.equal(api.recordLillebekkFagsvarFollowup('Et notat kan ikke journalføres før de tre faglige svarene er vurdert.').ok,false);
assert.equal(api.recordLillebekkFagsvarAssessment('trafikk','bestill_trafikkontroll',
 'Skolevei må kontrolleres av fagansvarlig før noe kan konkluderes om sikkerhet.').ok,false);
assert.equal(api.recordLillebekkFagsvarIntake().ok,true);
assert.equal(api.recordLillebekkFagsvarIntake().ok,false);
let fag=api.getLillebekkFagsvarModel();
assert.equal(fag.intake.outcome,'fiktive_fagsvar_klargjort_for_gjennomgang');
assert.ok(fag.intake.note.includes('Ingen ekstern rapport er mottatt'));
assert.equal(api.renderSections(),true);
assert.equal((host.innerHTML.match(/data-civi-fagsvar-assess="1"/g)||[]).length,3);
for(const ref of ['LBK-TRAF-04','LBK-OV-05','LBK-JUS-06']) {
 assert.ok(host.innerHTML.includes(ref));
}
assert.ok(host.innerHTML.includes('forhåndsskrevne, fiktive spillbilag'));
assert.equal(api.recordLillebekkFagsvarAssessment('ukjent','bestill_trafikkontroll',
 'Det er uklart hvilket bilag dette skal knyttes til i den formelle plansaken.').ok,false);
assert.equal(api.recordLillebekkFagsvarAssessment('trafikk','avklart',
 'Rådgiveren kan ikke uten videre godkjenne hele planen ut fra dette brevet.').ok,false);
assert.equal(api.recordLillebekkFagsvarAssessment('trafikk','bestill_trafikkontroll','for kort').ok,false);

const fagReason='Fagansvarlig må innhente datert og kontrollerbart grunnlag, oppgi videre arbeidsoppgave og holde de dokumenterte forholdene åpne før videre behandling.';
assert.equal(api.recordLillebekkFagsvarAssessment('trafikk','fastsla_trygg_skolevei',fagReason).ok,true);
assert.equal(api.getLillebekkFagsvarModel().docs.find(d=>d.id==='trafikk').safe,false);
assert.equal(api.recordLillebekkFagsvarFollowup(
 'Jeg anbefaler kontroll av trafikk, overvann og planjuss før intern lederbehandling.').ok,false);
assert.equal(api.recordLillebekkFagsvarAssessment('trafikk','bestill_trafikkontroll',fagReason).ok,true);
assert.equal(api.recordLillebekkFagsvarAssessment('trafikk','bestill_trafikkontroll','  '+fagReason+'  ').alreadyLogged,true);
assert.equal(world.getWorkObject(caseId).history.filter(e=>e.id.startsWith('lillebekk_fagsvar_trafikk_v')).length,2);
assert.equal(api.recordLillebekkFagsvarAssessment('overvann','bestill_overvannsgrunnlag',fagReason).ok,true);
assert.equal(api.recordLillebekkFagsvarAssessment('planjuss','bestill_juridisk_kontroll',fagReason).ok,true);
fag=api.getLillebekkFagsvarModel();
assert.equal(fag.ready,true);
assert.equal(fag.docs.filter(d=>d.safe).length,3);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-fagsvar-followup="1"'));
assert.equal(api.recordLillebekkFagsvarFollowup('Kort').ok,false);

const fagRecommendation='Jeg anbefaler at trafikkfag undersøker ganglinje og tidspunkt før innflytting, at overvannsfag utarbeider flomveikart og snitt, og at planjuss vurderer utbyggers forslag før ny ledergjennomgang.';
assert.equal(api.recordLillebekkFagsvarFollowup(fagRecommendation).ok,true);
fag=api.getLillebekkFagsvarModel();
assert.equal(fag.current,true);
assert.equal(fag.notesCount,1);
assert.equal(fag.latestNote.outcome,'supplerende_fagnotat_ikke_godkjent');
for(const keyword of ['LBK-TRAF-04','LBK-OV-05','LBK-JUS-06',
 'Skolevei','Overvann','Medvirkning','Kildeversjoner:','ikke verifiserte rapporter']) {
 assert.ok(fag.latestNote.note.toLowerCase().includes(keyword.toLowerCase()),keyword);
}
assert.equal(api.recordLillebekkFagsvarFollowup('  '+fagRecommendation+'  ').alreadyLogged,true);
assert.equal(api.getLillebekkFagsvarModel().notesCount,1);
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
for(const flag of ['skolevei_ikke_dokumentert','early_green_corridor_unsecured','participation_record_missing']) {
 assert.ok(world.getWorkObject(caseId).flags.includes(flag));
}

// New evidence makes a saved note stale; a fresh evaluation restores the trail.
world.addFlag(caseId,'map_conflict_not_verified',{
 event_id:'lillebekk_fagsvar_new_map_issue',at:'2026-11-06T18:00:00Z'
});
fag=api.getLillebekkFagsvarModel();
assert.equal(fag.current,false);
assert.equal(fag.ready,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('utdatert grunnlag'));
assert.equal(api.recordLillebekkFagsvarFollowup(fagRecommendation).ok,true);
assert.equal(api.getLillebekkFagsvarModel().notesCount,2);
assert.equal(api.getLillebekkFagsvarModel().current,true);

// A later unsafe document comparison invalidates the entire downstream
// professional note even though all three expert replies remain safe.
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','anta_avklart',
 'Innspillet omtaler skoleveien, men det foreligger fortsatt ingen undersøkelse som dokumenterer trygg skolevei før innflytting.').ok,true);
fag=api.getLillebekkFagsvarModel();
assert.equal(fag.docs.every(d=>d.safe),true);
assert.equal(fag.leader.memo.ready,false);
assert.equal(fag.ready,false);
assert.equal(fag.current,false);
const unsafeSourceFollowup=api.recordLillebekkFagsvarFollowup(fagRecommendation);
assert.equal(unsafeSourceFollowup.ok,false,
 'unsafe earlier source assessment must block a newly journaled follow-up');
assert.ok(unsafeSourceFollowup.reason.includes('opprinnelige kildeavstemmingen'));
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('Stopp i grunnlaget'));
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','avklar_forst',
 'Skoleveien må undersøkes av trafikkfag, og tidspunkt og ansvar for trygg ferdsel før innflytting må avklares.').ok,true);
assert.equal(api.getLillebekkFagsvarModel().ready,true);
assert.equal(api.getLillebekkFagsvarModel().current,false,
 'returning to a sound comparison changes the source version');
assert.equal(api.recordLillebekkFagsvarFollowup(fagRecommendation).ok,true);
assert.equal(api.getLillebekkFagsvarModel().notesCount,3);
assert.equal(api.getLillebekkFagsvarModel().current,true);
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkFagsvarModel().current,true,'professional reviews persist after reload');
assert.equal(api.getLillebekkFagsvarModel().docs.filter(d=>d.safe).length,3);

// Test escaping of the player's recommendation in the newly displayed read-only memo.
const malicious='<img src=x onerror=alert(1)> Trafikkfag må kontrollere ganglinjen, overvannsfag må levere snitt og planjuss må gå gjennom rekkefølgebestemmelsene før videre behandling.';
assert.equal(api.recordLillebekkFagsvarFollowup(malicious).ok,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));

// Correct an incorrect tenth assessment rather than permanently blocking the workflow.
for(let i=0;i<9;i++){
 assert.equal(api.recordLillebekkFagsvarAssessment('planjuss','lov_utbygger_godkjenning',
 'Dette er et bevisst feilvalg i revisjon '+i+'. Juridisk ansvarlig må kontrollere bestemmelsen; rettsvirkningen er ikke fastlagt.').ok,true);
}
fag=api.getLillebekkFagsvarModel();
assert.equal(fag.docs.find(d=>d.id==='planjuss').revisionCount,10);
assert.equal(fag.ready,false);
assert.equal(api.recordLillebekkFagsvarAssessment('planjuss','bestill_juridisk_kontroll',fagReason).ok,true);
assert.equal(api.getLillebekkFagsvarModel().docs.find(d=>d.id==='planjuss').revisionCount,11);
assert.equal(api.getLillebekkFagsvarModel().ready,true);
assert.equal(api.recordLillebekkFagsvarAssessment('planjuss','lov_utbygger_godkjenning',fagReason).ok,false);

// Fictional source-extract review: three concrete conflicts, not simulated approvals.
// The last legal expert reassessment changed the expert-source signature.
let kontroll=api.getLillebekkKontrollbilagModel();
assert.equal(kontroll.sourcesCurrent,false);
assert.equal(api.recordLillebekkKontrollFunn('ganglinje','krev_samordnet_skoleveikontroll',
 'Punkt B og vareleveringen må undersøkes før gangforbindelsen kan kalles sikker for skolebarn.').ok,false);
assert.equal(api.recordLillebekkFagsvarFollowup(fagRecommendation).ok,true);
kontroll=api.getLillebekkKontrollbilagModel();
assert.equal(kontroll.sourcesCurrent,true);
assert.equal(kontroll.docs.length,3);
assert.deepEqual(Array.from(kontroll.docs.map(d=>d.ref)), ['LBK-KONT-07','LBK-KONT-08','LBK-KONT-09']);
assert.equal(kontroll.ready,false);
assert.equal(api.renderSections(),true);
for (const snippet of ['data-civi-kontrollbilag-assess="1"', '1,55 m',
 '0,85 m','07.45','+6,20','+6,80','før første bolig tas i bruk','ferdigattest']) {
 assert.ok(host.innerHTML.includes(snippet), 'visible contrasting fictional source extract: '+snippet);
}
assert.equal((host.innerHTML.match(/data-civi-kontrollbilag-assess="1"/g)||[]).length,3);
assert.ok(!host.innerHTML.includes('data-civi-kontrollbilag-report="1"'));
assert.equal(api.recordLillebekkKontrollFunn('feil','krev_samordnet_skoleveikontroll',
 'Ingen av disse kildene finnes som dokumenterte kontrollutdrag i plansaken.').ok,false);
assert.equal(api.recordLillebekkKontrollFunn('ganglinje','godkjent',
 'Det er ikke grunnlag for å godkjenne den tegnede ganglinjen på dette dokumentgrunnlaget.').ok,false);
assert.equal(api.recordLillebekkKontrollFunn('ganglinje','krev_samordnet_skoleveikontroll','for kort').ok,false);
assert.equal(api.recordLillebekkKontrollprotokoll(
 'Denne protokollen må ikke journalføres før alle tre bilagskonfliktene er vurdert.').ok,false);

const kontrollReason='Skissene er ikke samstemte og dokumenterer ikke ferdig fagkontroll. Fagansvarlig må kontrollere de oppgitte forholdene og foreslå konkret retting.';
assert.equal(api.recordLillebekkKontrollFunn('ganglinje','regn_ganglinje_som_sikret',kontrollReason).ok,true);
assert.equal(api.getLillebekkKontrollbilagModel().docs.find(d=>d.id==='ganglinje').safe,false);
assert.equal(api.recordLillebekkKontrollFunn('ganglinje','krev_samordnet_skoleveikontroll',kontrollReason).ok,true);
assert.equal(api.recordLillebekkKontrollFunn('ganglinje','krev_samordnet_skoleveikontroll','  '+kontrollReason+'  ').alreadyLogged,true);
assert.equal(world.getWorkObject(caseId).history.filter(e=>e.id.startsWith('lillebekk_kontrollbilag_ganglinje_v')).length,2);
assert.equal(api.recordLillebekkKontrollFunn('flomvei','krev_koter_og_flomveikontroll',kontrollReason).ok,true);
assert.equal(api.recordLillebekkKontrollFunn('rekkefolge','krev_juridisk_versjonskontroll',kontrollReason).ok,true);
kontroll=api.getLillebekkKontrollbilagModel();
assert.equal(kontroll.ready,true);
assert.equal(kontroll.docs.filter(d=>d.safe).length,3);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-kontrollbilag-report="1"'));
assert.equal(api.recordLillebekkKontrollprotokoll('Et kort notat.').ok,false);

const kontrollRecommendation='Jeg anbefaler at trafikkfag kontrollerer punkt B og leveringstiden, overvannsfag gjennomgår flomveikart og terrengsnitt, og planjuss avklarer rekkefølgekravets tidspunkt før ledervurdering.';
assert.equal(api.recordLillebekkKontrollprotokoll(kontrollRecommendation).ok,true);
kontroll=api.getLillebekkKontrollbilagModel();
assert.equal(kontroll.current,true);
assert.equal(kontroll.reportCount,1);
assert.equal(kontroll.latestReport.outcome,'intern_kontrollprotokoll_ikke_godkjent');
for (const ref of ['LBK-KONT-07','LBK-KONT-08','LBK-KONT-09',
 'LBK-SKISSE-07A','LBK-DRIFT-07B','LBK-KART-08A','LBK-SNITT-08B',
 'LBK-BEST-09A','LBK-UTB-09B','Kildeversjoner:']) {
 assert.ok(kontroll.latestReport.note.includes(ref), 'source trace '+ref);
}
for (const marker of ['Skolevei','Grøntdrag','Overvann','Medvirkning']) {
 assert.ok(kontroll.latestReport.note.includes(marker),'the original unresolved topic '+marker);
}
assert.equal(api.recordLillebekkKontrollprotokoll(' '+kontrollRecommendation+' ').alreadyLogged,true);
assert.equal(api.getLillebekkKontrollbilagModel().reportCount,1);
assert.equal(world.getWorkObject(caseId).status,'open');
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
for (const flag of ['skolevei_ikke_dokumentert','early_green_corridor_unsecured','participation_record_missing']) {
 assert.ok(world.getWorkObject(caseId).flags.includes(flag),'preserved open issue '+flag);
}
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkKontrollbilagModel().current,true);

// New issue changes the upstream note signature and temporarily blocks control.
world.addFlag(caseId,'kontrollbilag_nytt_kotegrunnlag_mangler',{
 event_id:'lillebekk_kontrollbilag_new_stormwater_issue',at:'2026-11-07T11:00:00Z'
});
kontroll=api.getLillebekkKontrollbilagModel();
assert.equal(kontroll.sourcesCurrent,false);
assert.equal(kontroll.current,false);
assert.equal(api.recordLillebekkKontrollprotokoll(kontrollRecommendation).ok,false);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('Tidligere kildeavstemming eller supplerende fagnotat er utdatert'));
assert.equal(api.recordLillebekkFagsvarFollowup(fagRecommendation).ok,true);
kontroll=api.getLillebekkKontrollbilagModel();
assert.equal(kontroll.sourcesCurrent,true);
assert.equal(kontroll.ready,true);
assert.equal(kontroll.current,false);
assert.equal(api.recordLillebekkKontrollprotokoll(kontrollRecommendation).ok,true);
assert.equal(api.getLillebekkKontrollbilagModel().reportCount,2);
assert.equal(api.getLillebekkKontrollbilagModel().current,true);

// A newly unsafe original source assessment must also stop a new control report.
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','anta_avklart',
 'Skissen alene kan ikke dokumentere trygg skolevei, men dette valget gjøres med vilje for å teste sperren.').ok,true);
kontroll=api.getLillebekkKontrollbilagModel();
assert.equal(kontroll.sourcesCurrent,false);
assert.equal(kontroll.current,false);
assert.equal(api.recordLillebekkKontrollFunn('rekkefolge','krev_juridisk_versjonskontroll',kontrollReason).ok,false);
assert.equal(api.recordLillebekkKontrollprotokoll(kontrollRecommendation).ok,false);
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','avklar_forst',
 'Trafikkfag må gjennomføre ny kontroll av trygg skolevei og tidspunktet før første innflytting.').ok,true);
assert.equal(api.recordLillebekkFagsvarFollowup(fagRecommendation).ok,true);
assert.equal(api.recordLillebekkKontrollprotokoll(kontrollRecommendation).ok,true);
assert.equal(api.getLillebekkKontrollbilagModel().current,true);

// Even after the tenth bad revision, one safe correction must remain possible.
for(let i=0;i<9;i++){
 assert.equal(api.recordLillebekkKontrollFunn('flomvei','godkjenn_føreslått_flomvei',
 'Dette er et uriktig eksempelvalg nummer '+i+', og kontroll av koter og snitt er nødvendig før konklusjon.').ok,true);
}
kontroll=api.getLillebekkKontrollbilagModel();
assert.equal(kontroll.docs.find(d=>d.id==='flomvei').count,10);
assert.equal(kontroll.ready,false);
assert.equal(api.recordLillebekkKontrollFunn('flomvei','krev_koter_og_flomveikontroll',kontrollReason).ok,true);
assert.equal(api.getLillebekkKontrollbilagModel().docs.find(d=>d.id==='flomvei').count,11);
assert.equal(api.recordLillebekkKontrollFunn('flomvei','godkjenn_føreslått_flomvei',kontrollReason).ok,false);
assert.equal(api.recordLillebekkKontrollprotokoll(kontrollRecommendation).ok,true);
assert.equal(api.getLillebekkKontrollbilagModel().current,true);

// Always escape player-authored text in the read-only report.
const controlInjection='<img src=x onerror=alert(1)> Fagansvarlig trafikk må kontrollere punkt B og tidspunkt, planjuss må vurdere rekkefølgekrav, og overvann må ettergå snittet før ledergjennomgang.';
assert.equal(api.recordLillebekkKontrollprotokoll(controlInjection).ok,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));

// Ten protocol versions must not prevent a genuine later source correction.
while (api.getLillebekkKontrollbilagModel().reportCount < 10) {
 const count=api.getLillebekkKontrollbilagModel().reportCount+1;
 assert.equal(api.recordLillebekkKontrollprotokoll(
   kontrollRecommendation+' Videre intern arbeidsfordeling er presisert i notatversjon '+count+'.').ok,true);
}
assert.equal(api.getLillebekkKontrollbilagModel().reportCount,10);
assert.equal(api.getLillebekkKontrollbilagModel().current,true);
assert.equal(api.recordLillebekkKontrollprotokoll(
 kontrollRecommendation+' Ubegrunnet omformulering uten ny kilde.').ok,false,
 'unchanged sources remain subject to the normal version limit');
assert.equal(api.recordLillebekkKontrollFunn('ganglinje','krev_samordnet_skoleveikontroll',
 'Ny avstemming presiserer leveringsvindu og breddeforskjell ved punkt B; fagansvarlig trafikk må kontrollere framkommelighet.').ok,true);
kontroll=api.getLillebekkKontrollbilagModel();
assert.equal(kontroll.ready,true);
assert.equal(kontroll.current,false);
assert.equal(api.recordLillebekkKontrollprotokoll(kontrollRecommendation).ok,true,
 'new source revision must permit a version even after ten earlier protocols');
assert.equal(api.getLillebekkKontrollbilagModel().reportCount,11);
assert.equal(api.getLillebekkKontrollbilagModel().current,true);
assert.equal(api.recordLillebekkKontrollprotokoll(
 kontrollRecommendation+' Ny omformulering uten kildeendring.').ok,false);
assert.equal(world.getWorkObject(caseId).status,'open');

// Author-created fictional check results: inspect limits, not simulated approvals.
let resultater=api.getLillebekkKontrollresultatModel();
assert.ok(resultater,'the verified internal protocol gates the next work phase');
assert.equal(resultater.sourcesCurrent,true);
assert.equal(resultater.intake,null);
assert.equal(resultater.ready,false);
assert.deepEqual(Array.from(resultater.docs.map(d=>d.ref)),
 ['LBK-RES-10','LBK-RES-11','LBK-RES-12']);
assert.equal(api.recordLillebekkResultatvurdering('ganglinje',
 'registrer_kontrollbehov_for_ganglinje','Nødvendig oppmåling og kontroll mangler før en konklusjon om sikkerhet.').ok,false);
assert.equal(api.recordLillebekkBeslutningsgrunnlag(
 'Skolevei og overvann må vurderes av relevante fagansvarlige før videre saksbehandling.').ok,false);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-resultater-intake="1"'));
assert.ok(!host.innerHTML.includes('data-civi-resultat-assess="1"'));
assert.equal(api.recordLillebekkResultatMottak().ok,true);
assert.equal(api.recordLillebekkResultatMottak().ok,false);
resultater=api.getLillebekkKontrollresultatModel();
assert.equal(resultater.intake.outcome,'fiktive_kontrollresultater_apnet');
assert.ok(resultater.intake.note.includes('Ingen faktisk oppmåling'));
assert.equal(api.renderSections(),true);
assert.equal((host.innerHTML.match(/data-civi-resultat-assess="1"/g)||[]).length,3);
for(const fragment of ['0,90 m','1,50 m','07.55','42 m³','26 m³','16 m³',
 'første bolig tas i bruk','ferdigattest','LBK-RES-10','LBK-RES-11','LBK-RES-12']) {
 assert.ok(host.innerHTML.includes(fragment),'fictional specific check findings: '+fragment);
}
assert.equal(api.recordLillebekkResultatvurdering('falsk','registrer_kontrollbehov_for_ganglinje',
 'Kildene må sammenstilles før råd gis til planleder, og dette bilaget finnes ikke.').ok,false);
assert.equal(api.recordLillebekkResultatvurdering('ganglinje','godkjent',
 'Fagansvarlig må først gjennomføre kontroll og sikre dokumentasjon for skoleveien.').ok,false);
assert.equal(api.recordLillebekkResultatvurdering('ganglinje',
 'registrer_kontrollbehov_for_ganglinje','for kort').ok,false);

const resultatReason='Fagansvarlig må kontrollere forutsetninger og manglende dokumentasjon. Disse fiktive utsnittene er ikke nok til å konkludere at planen er trygg eller godkjent.';
assert.equal(api.recordLillebekkResultatvurdering('ganglinje',
 'godkjenn_ganglinje_paa_to_maalinger',resultatReason).ok,true);
assert.equal(api.getLillebekkKontrollresultatModel().ready,false);
assert.equal(api.recordLillebekkBeslutningsgrunnlag(
 'Jeg anbefaler ny trafikkfaglig kontroll, overvannsberegninger og planjuridisk kontroll før planleder vurderer videre behandling.').ok,false);
assert.equal(api.recordLillebekkResultatvurdering('ganglinje',
 'registrer_kontrollbehov_for_ganglinje',resultatReason).ok,true);
assert.equal(api.recordLillebekkResultatvurdering('ganglinje',
 'registrer_kontrollbehov_for_ganglinje',' '+resultatReason+' ').alreadyLogged,true);
assert.equal(world.getWorkObject(caseId).history.filter(e=>e.id.startsWith('lillebekk_resultatvurdering_ganglinje_v')).length,2);
assert.equal(api.recordLillebekkResultatvurdering('overvann',
 'krev_beregning_for_16m3_og_flomvei',resultatReason).ok,true);
assert.equal(api.recordLillebekkResultatvurdering('planjuss',
 'returner_ordlyd_for_juridisk_kontroll',resultatReason).ok,true);
resultater=api.getLillebekkKontrollresultatModel();
assert.equal(resultater.ready,true);
assert.equal(resultater.docs.filter(d=>d.safe).length,3);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-beslutningsgrunnlag-save="1"'));
assert.equal(api.recordLillebekkBeslutningsgrunnlag('En kort anbefaling.').ok,false);
const decisionRecommendation='Jeg anbefaler at planleder Elin returnerer ganglinje og leveringsplan for trafikkfaglig oppmåling, etterspør fullstendig overvannsberegning med flomveikart og ber planjuss vurdere bestemmelsens tidspunkt før ny intern behandling.';
assert.equal(api.recordLillebekkBeslutningsgrunnlag(decisionRecommendation).ok,true);
resultater=api.getLillebekkKontrollresultatModel();
assert.equal(resultater.current,true);
assert.equal(resultater.proposalCount,1);
assert.equal(resultater.latestProposal.outcome,'internt_beslutningsgrunnlag_ikke_godkjent');
for(const token of ['LBK-RES-10','LBK-RES-11','LBK-RES-12',
 '0,90 m','42 m³','16 m³','ferdigattest','Kildeversjoner:']) {
 assert.ok(resultater.latestProposal.note.includes(token),'decision memo source '+token);
}
for(const unresolved of ['Skolevei','Overvann','Grøntdrag','Medvirkning']) {
 assert.ok(resultater.latestProposal.note.includes(unresolved),'unresolved issue '+unresolved);
}
assert.ok(resultater.latestProposal.note.includes('Ingen kontroller er erklært utført'));
assert.equal(api.recordLillebekkBeslutningsgrunnlag('  '+decisionRecommendation+'  ').alreadyLogged,true);
assert.equal(api.getLillebekkKontrollresultatModel().proposalCount,1);
assert.equal(world.getWorkObject(caseId).status,'open');
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
for(const flag of ['skolevei_ikke_dokumentert','early_green_corridor_unsecured','participation_record_missing']) {
 assert.ok(world.getWorkObject(caseId).flags.includes(flag));
}
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkKontrollresultatModel().current,true);

// An additional documented issue blocks the downstream result until all
// upstream notes are refreshed, without deleting any earlier case history.
world.addFlag(caseId,'lillebekk_stikkrenne_kontroll_ikke_gjennomfort',{
 event_id:'lillebekk_resultat_test_new_undocumented_channel',at:'2026-11-08T06:00:00Z'
});
resultater=api.getLillebekkKontrollresultatModel();
assert.equal(resultater.sourcesCurrent,false);
assert.equal(resultater.current,false);
assert.equal(api.recordLillebekkResultatvurdering('planjuss',
 'returner_ordlyd_for_juridisk_kontroll',resultatReason).ok,false);
assert.equal(api.recordLillebekkBeslutningsgrunnlag(decisionRecommendation).ok,false);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('Den tidligere kontrollprotokollen er utdatert'));
assert.equal(api.recordLillebekkFagsvarFollowup(fagRecommendation).ok,true);
assert.equal(api.recordLillebekkKontrollprotokoll(kontrollRecommendation).ok,true);
resultater=api.getLillebekkKontrollresultatModel();
assert.equal(resultater.sourcesCurrent,true);
assert.equal(resultater.ready,true);
assert.equal(resultater.current,false);
assert.equal(api.recordLillebekkBeslutningsgrunnlag(decisionRecommendation).ok,true);
assert.equal(api.getLillebekkKontrollresultatModel().proposalCount,2);
assert.equal(api.getLillebekkKontrollresultatModel().current,true);

// Earlier unsafe source choices also block a decision basis despite safe results.
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','anta_avklart',
 'Trafikkfag har ennå ikke kontrollert reell sikkerhet, men dette er et bevisst feilvalg for å teste sperren.').ok,true);
assert.equal(api.getLillebekkKontrollresultatModel().sourcesCurrent,false);
assert.equal(api.getLillebekkKontrollresultatModel().current,false);
assert.equal(api.recordLillebekkBeslutningsgrunnlag(decisionRecommendation).ok,false);
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','avklar_forst',
 'Trafikkfag må dokumentere ganglinje og tidspunkt før første bruk, da to fiktive målinger ikke er tilstrekkelig.').ok,true);
assert.equal(api.recordLillebekkFagsvarFollowup(fagRecommendation).ok,true);
assert.equal(api.recordLillebekkKontrollprotokoll(kontrollRecommendation).ok,true);
assert.equal(api.getLillebekkKontrollresultatModel().current,false);
assert.equal(api.recordLillebekkBeslutningsgrunnlag(decisionRecommendation).ok,true);
assert.equal(api.getLillebekkKontrollresultatModel().current,true);

// A wrong tenth revision can still be corrected, but not reversed again.
for(let i=0;i<9;i++){
 assert.equal(api.recordLillebekkResultatvurdering('overvann','godkjenn_magasin_paa_26m3',
 'Bevisst feilvalg nummer '+i+'. Regnearket har ikke beskrevet utløp, infiltrasjon, sikkerhetsmargin eller dokumenterte faglige premisser.').ok,true);
}
resultater=api.getLillebekkKontrollresultatModel();
assert.equal(resultater.docs.find(d=>d.id==='overvann').revisionCount,10);
assert.equal(resultater.ready,false);
assert.equal(api.recordLillebekkResultatvurdering('overvann',
 'krev_beregning_for_16m3_og_flomvei',resultatReason).ok,true);
assert.equal(api.getLillebekkKontrollresultatModel().docs.find(d=>d.id==='overvann').revisionCount,11);
assert.equal(api.recordLillebekkResultatvurdering('overvann','godkjenn_magasin_paa_26m3',resultatReason).ok,false);

// Player-authored content is escaped when rendered.
const resultInjection='<img src=x onerror=alert(1)> Trafikkfag må kontrollere ganglinjen, overvannsfag må dokumentere differansen, og planjuss må vurdere rekkefølgekravet før videre saksbehandling.';
assert.equal(api.recordLillebekkBeslutningsgrunnlag(resultInjection).ok,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));

// Revisions remain possible after 10 proposals if new source evidence arrives.
while(api.getLillebekkKontrollresultatModel().proposalCount < 10) {
 const n=api.getLillebekkKontrollresultatModel().proposalCount+1;
 assert.equal(api.recordLillebekkBeslutningsgrunnlag(decisionRecommendation+
 ' Oppfølging fra planleder føres som ny intern arbeidsversjon nummer '+n+'.').ok,true);
}
assert.equal(api.getLillebekkKontrollresultatModel().proposalCount,10);
assert.equal(api.recordLillebekkBeslutningsgrunnlag(decisionRecommendation+
 ' En ren omskriving som skal blokkeres uten kildeendring.').ok,false);
assert.equal(api.recordLillebekkResultatvurdering('ganglinje',
 'registrer_kontrollbehov_for_ganglinje',
 'Et revidert faglig notat krever oppmåling av ganglinjen ved varelevering og dokumentasjon av varighet, gangbredde og sikkerhet.').ok,true);
assert.equal(api.getLillebekkKontrollresultatModel().current,false);
assert.equal(api.recordLillebekkBeslutningsgrunnlag(decisionRecommendation).ok,true);
assert.equal(api.getLillebekkKontrollresultatModel().proposalCount,11);
assert.equal(api.getLillebekkKontrollresultatModel().current,true);
assert.equal(api.recordLillebekkBeslutningsgrunnlag(decisionRecommendation+
 ' Ingen ny kilde har kommet siden siste utkast.').ok,false);


// Second, authored leader review after the updated source-bound decision basis.
let nextLeader=api.getLillebekkNyLedervurderingModel();
assert.ok(nextLeader);
assert.equal(nextLeader.decision.current,true);
assert.equal(nextLeader.latestReview,null);
assert.equal(nextLeader.ready,false);
assert.equal(api.recordLillebekkLeder2Oppgave('trafikk','ettersporr_trafikkgrunnlag',
 'Trafikkfag må dokumentere sikker adkomst før første bolig tas i bruk.').ok,false);
assert.equal(api.recordLillebekkLeder2Oppfolgingsnotat(
 'Uavklarte forhold må følges opp av relevante kommunale fagmiljøer før videre behandling.').ok,false);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-leder2-review="1"'));
assert.ok(!host.innerHTML.includes('data-civi-leder2-task-save="1"'));
const newLeaderReason='Dokumentutdragene viser at skolevei er innsnevret ved varelevering, at avrenning og flomvei ikke er kontrollert, og at rekkefølgekravet må vurderes juridisk.';
assert.equal(api.recordLillebekkNyLedervurdering('ukjent',newLeaderReason).ok,false);
assert.equal(api.recordLillebekkNyLedervurdering('returner_for_supplering','for kort').ok,false);
assert.equal(api.recordLillebekkNyLedervurdering('send_til_planvedtak',newLeaderReason).ok,true);
nextLeader=api.getLillebekkNyLedervurderingModel();
assert.equal(nextLeader.currentReview,true);
assert.equal(nextLeader.accepted,false);
assert.equal(nextLeader.latestReview.outcome,'simulert_leder_avvist_uforsvarlig_oversendelse');
assert.ok(nextLeader.latestReview.note.includes('Anbefalingen avvises'));
assert.equal(api.recordLillebekkLeder2Oppgave('trafikk','ettersporr_trafikkgrunnlag',newLeaderReason).ok,false);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('Elin har avvist direkte oversendelse'));
assert.equal(api.recordLillebekkNyLedervurdering('returner_for_supplering',newLeaderReason).ok,true);
nextLeader=api.getLillebekkNyLedervurderingModel();
assert.equal(nextLeader.accepted,true);
assert.equal(nextLeader.currentReview,true);
assert.equal(nextLeader.latestReview.outcome,'simulert_leder_retur_for_supplering');
assert.equal(nextLeader.tasks.length,3);
assert.deepEqual(Array.from(nextLeader.tasks.map(t=>t.ref)),['LBK-RES-10','LBK-RES-11','LBK-RES-12']);
assert.ok(nextLeader.latestReview.note.includes('Kildeversjoner:'));
assert.equal(api.recordLillebekkNyLedervurdering('forbered_intern_sakspakke',newLeaderReason).ok,false);
assert.equal(api.renderSections(),true);
assert.equal((host.innerHTML.match(/data-civi-leder2-task-save="1"/g)||[]).length,3);
assert.equal(api.recordLillebekkLeder2Oppgave('ukjent','ettersporr_trafikkgrunnlag',newLeaderReason).ok,false);
assert.equal(api.recordLillebekkLeder2Oppgave('trafikk','godkjent',newLeaderReason).ok,false);
assert.equal(api.recordLillebekkLeder2Oppgave('trafikk','ettersporr_trafikkgrunnlag','kort').ok,false);
assert.equal(api.recordLillebekkLeder2Oppfolgingsnotat(newLeaderReason).ok,false);
const taskReason='Den ansvarlige fagfunksjonen må skaffe datert, etterprøvbar dokumentasjon og vurdere de åpne avvikene før saken kan forberedes for formell behandling. Lederhendelse: lillebekk_ny_ledervurdering_v3; er bare brukerens fritekst og ikke en gyldig journalreferanse.';
assert.equal(api.recordLillebekkLeder2Oppgave('trafikk','lukk_skoleveiavvik',taskReason).ok,true);
assert.equal(api.getLillebekkNyLedervurderingModel().tasks.find(t=>t.id==='trafikk').safe,false);
assert.equal(api.recordLillebekkLeder2Oppgave('trafikk','ettersporr_trafikkgrunnlag',taskReason).ok,true);
assert.equal(api.recordLillebekkLeder2Oppgave('trafikk','ettersporr_trafikkgrunnlag',' '+taskReason+' ').alreadyLogged,true);
assert.equal(api.recordLillebekkLeder2Oppgave('overvann','ettersporr_beregning_og_hoyder',taskReason).ok,true);
assert.equal(api.recordLillebekkLeder2Oppgave('planjuss','ettersporr_juridisk_kontroll',taskReason).ok,true);
nextLeader=api.getLillebekkNyLedervurderingModel();
assert.equal(nextLeader.ready,true);
assert.equal(nextLeader.tasks.filter(t=>t.safe).length,3);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-leder2-report-save="1"'));
assert.equal(api.recordLillebekkLeder2Oppfolgingsnotat('Kort').ok,false);
const leaderRecommendation='Trafikkfag får ansvar for befaring, sikt og revidert varelevering. Overvannsfag må levere beregning og høydesnitt. Planjuss skal vurdere rekkefølgekravet før Elin kan gå videre.';
assert.equal(api.recordLillebekkLeder2Oppfolgingsnotat(leaderRecommendation).ok,true);
nextLeader=api.getLillebekkNyLedervurderingModel();
assert.equal(nextLeader.current,true);
assert.equal(nextLeader.reportCount,1);
assert.equal(nextLeader.latestReport.outcome,'intern_lederoppfolging_uten_godkjenning');
for(const text of ['LBK-RES-10','LBK-RES-11','LBK-RES-12','Medvirkning','Skolevei','Grøntdrag','Kildeversjoner:']) {
 assert.ok(nextLeader.latestReport.note.includes(text),'leader follow-up source '+text);
}
assert.ok(nextLeader.latestReport.note.includes('Ingen avvik er lukket'));
assert.equal(api.recordLillebekkLeder2Oppfolgingsnotat(' '+leaderRecommendation+' ').alreadyLogged,true);
assert.equal(world.getWorkObject(caseId).status,'open');
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
for(const flag of ['skolevei_ikke_dokumentert','early_green_corridor_unsecured','participation_record_missing']) {
 assert.ok(world.getWorkObject(caseId).flags.includes(flag));
}
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkNyLedervurderingModel().current,true);

// An old return may never govern changed evidence. A fresh decision basis
// gets a new simulated manager review and three new source-bound tasks.
assert.equal(api.recordLillebekkResultatvurdering('ganglinje','registrer_kontrollbehov_for_ganglinje',
 'Fagansvarlig må oppdatere dokumentkontroll og presisere ganglinje, sikt og vareleveringsvinduer etter ny faglig vurdering.').ok,true);
nextLeader=api.getLillebekkNyLedervurderingModel();
assert.equal(nextLeader.decision.current,false);
assert.equal(nextLeader.current,false);
assert.equal(nextLeader.accepted,false);
assert.equal(api.recordLillebekkNyLedervurdering('forbered_intern_sakspakke',newLeaderReason).ok,false);
assert.equal(api.recordLillebekkLeder2Oppfolgingsnotat(leaderRecommendation).ok,false);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('Oppdatert beslutningsgrunnlag er ikke gjeldende'));
assert.equal(api.recordLillebekkBeslutningsgrunnlag(decisionRecommendation).ok,true);
nextLeader=api.getLillebekkNyLedervurderingModel();
assert.equal(nextLeader.decision.current,true);
assert.equal(nextLeader.currentReview,false);
assert.equal(nextLeader.accepted,false);
assert.equal(nextLeader.ready,false);
assert.equal(api.recordLillebekkNyLedervurdering('forbered_intern_sakspakke',newLeaderReason).ok,true);
nextLeader=api.getLillebekkNyLedervurderingModel();
assert.equal(nextLeader.currentReview,true);
assert.equal(nextLeader.latestReview.outcome,'simulert_leder_intern_forberedelse_med_forbehold');
assert.ok(nextLeader.latestReview.note.includes('intern oversikt over mangler'));
assert.ok(!nextLeader.latestReview.note.includes('planvedtak er gitt'));
assert.equal(nextLeader.accepted,true);
assert.equal(nextLeader.tasks.some(t=>t.safe),false,
 'the new manager review cannot inherit previous source-bound tasks');
assert.equal(nextLeader.current,false);
assert.ok(nextLeader.tasks.every(t=>t.latestNote.includes('Lederhendelse: lillebekk_ny_ledervurdering_v3;')),
 'old notes intentionally contain a forged future reference in player-controlled reasoning');
assert.ok(nextLeader.tasks.every(t=>!t.safe),
 'a forged leader reference anywhere outside the generated note prefix must not make old tasks safe');
for(const [id,choice] of [['trafikk','ettersporr_trafikkgrunnlag'],['overvann','ettersporr_beregning_og_hoyder'],['planjuss','ettersporr_juridisk_kontroll']]) {
 assert.equal(api.recordLillebekkLeder2Oppgave(id,choice,taskReason).ok,true);
}
assert.equal(api.getLillebekkNyLedervurderingModel().ready,true);
assert.equal(api.recordLillebekkLeder2Oppfolgingsnotat(leaderRecommendation).ok,true);
assert.equal(api.getLillebekkNyLedervurderingModel().reportCount,2);
assert.equal(api.getLillebekkNyLedervurderingModel().current,true);

// Even after ten wrong task revisions, a safe correction and later new-source
// task record must be possible without dropping the original history.
for(let i=0;i<8;i++){
 assert.equal(api.recordLillebekkLeder2Oppgave('planjuss','lov_utbygger_ferdigattest',
 'Dette er bevisst feilvalg '+i+'. Bestemmelsen er ikke lovlighetskontrollert, og kommunens beslutningsmyndighet må respekteres.').ok,true);
}
nextLeader=api.getLillebekkNyLedervurderingModel();
assert.equal(nextLeader.tasks.find(t=>t.id==='planjuss').count,10);
assert.equal(nextLeader.ready,false);
assert.equal(api.recordLillebekkLeder2Oppgave('planjuss','ettersporr_juridisk_kontroll',taskReason).ok,true);
assert.equal(api.getLillebekkNyLedervurderingModel().tasks.find(t=>t.id==='planjuss').count,11);
assert.equal(api.recordLillebekkLeder2Oppgave('planjuss','lov_utbygger_ferdigattest',taskReason).ok,false);
assert.equal(api.recordLillebekkLeder2Oppfolgingsnotat(leaderRecommendation).ok,true);
const maliciousLeader='<img src=x onerror=alert(1)> Trafikkfag må kontrollere skoleveien, overvannsfag må kontrollere flomveien, og planjuss må vurdere ordlyden før videre saksbehandling.';
assert.equal(api.recordLillebekkLeder2Oppfolgingsnotat(maliciousLeader).ok,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));

// Realistic bounded review of the three fictional supplement responses.
let supplements=api.getLillebekkSuppleringssvarModel();
assert.ok(supplements,'a current leader follow-up note opens review of authored supplemental documents');
assert.equal(supplements.sourceCurrent,true);
assert.equal(supplements.ready,false);
assert.equal(supplements.docs.length,3);
assert.deepEqual(Array.from(supplements.docs.map(d=>d.ref)),['LBK-SUP-13','LBK-SUP-14','LBK-SUP-15']);
assert.equal(supplements.latestMatrix,null);
assert.equal(api.renderSections(),true);
for(const fragment of ['LBK-SUP-13','LBK-SUP-14','LBK-SUP-15','4 meter','+6,80','+6,20',
 '42 m³','26 m³','§ 4.1','fiktive, forhåndsskrevne']) {
 assert.ok(host.innerHTML.includes(fragment),'present realistic fictional supplement '+fragment);
}
assert.equal((host.innerHTML.match(/data-civi-supplering-save="1"/g)||[]).length,3);
assert.ok(!host.innerHTML.includes('data-civi-supplering-matrix-save="1"'));
const supReason='Den reviderte skissen og teksten er bare et delvis svar. Fagansvarlig må kontrollere dokumenterbare forhold og levere nødvendige analyser før konklusjon.';
assert.equal(api.recordLillebekkSuppleringsgjennomgang('ukjent','returner_trafikk_med_konkret_mangelliste',supReason).ok,false);
assert.equal(api.recordLillebekkSuppleringsgjennomgang('trafikk','ukjent',supReason).ok,false);
assert.equal(api.recordLillebekkSuppleringsgjennomgang('trafikk','returner_trafikk_med_konkret_mangelliste','kort').ok,false);
assert.equal(api.recordLillebekkSuppleringsmatrise('Ingen fagavvik kan ennå godkjennes på dette dokumentgrunnlaget.').ok,false);
assert.equal(api.recordLillebekkSuppleringsgjennomgang('trafikk','godkjenn_revidert_skolevei',supReason).ok,true);
assert.equal(api.getLillebekkSuppleringssvarModel().docs.find(d=>d.id==='trafikk').safe,false);
assert.equal(api.recordLillebekkSuppleringsgjennomgang('trafikk','returner_trafikk_med_konkret_mangelliste',supReason).ok,true);
assert.equal(api.recordLillebekkSuppleringsgjennomgang('trafikk','returner_trafikk_med_konkret_mangelliste',' '+supReason+' ').alreadyLogged,true);
assert.equal(api.recordLillebekkSuppleringsgjennomgang('overvann','registrer_delvis_retting_og_krev_hydraulikk',supReason).ok,true);
assert.equal(api.recordLillebekkSuppleringsgjennomgang('planjuss','journalfor_utkast_med_juridiske_forbehold',supReason).ok,true);
supplements=api.getLillebekkSuppleringssvarModel();
assert.equal(supplements.ready,true);
assert.equal(supplements.docs.filter(d=>d.safe).length,3);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-supplering-matrix-save="1"'));
assert.equal(api.recordLillebekkSuppleringsmatrise('Kort').ok,false);
const supPlan='Trafikkfag må kontrollere målsatt gangbredde, sikt og varelevering. Overvannsfag må dokumentere utløp, beregning og virkninger for vestre nabo. Planjuss må kontrollere plankart, rekkefølgeordlyd, ansvar og hjemmel.';
assert.equal(api.recordLillebekkSuppleringsmatrise(supPlan).ok,true);
supplements=api.getLillebekkSuppleringssvarModel();
assert.equal(supplements.current,true);
assert.equal(supplements.matrixCount,1);
assert.equal(supplements.latestMatrix.outcome,'intern_restanseliste_ikke_godkjent');
for(const token of ['LBK-SUP-13','LBK-SUP-14','LBK-SUP-15','42 m³',
 '4 meter','utløpskapasitet','Skolevei','Overvann','Grøntdrag','Medvirkning','Kildeversjoner:']) {
 assert.ok(supplements.latestMatrix.note.includes(token),'traceable outstanding issue '+token);
}
assert.equal(api.recordLillebekkSuppleringsmatrise(' '+supPlan+' ').alreadyLogged,true);

// Two separate unsent documents; the developer cannot approve legal wording.
let drafts=api.getLillebekkUtkastModel();
assert.equal(drafts.ready,true);
assert.equal(drafts.complete,false);
assert.deepEqual(Array.from(drafts.drafts.map(d=>d.id)),['utbygger','planjuss']);
assert.equal(api.renderSections(),true);
assert.equal((host.innerHTML.match(/data-civi-utkast-save="1"/g)||[]).length,2);
const requestReason='Den nye skissen og overvannstabellen dokumenterer ikke sikker gangbredde, sikt eller utløpskapasitet. Utbygger må konkretisere teknisk grunnlag, og planjurist må kontrollere bestemmelsesordlyden internt.';
assert.equal(api.recordLillebekkUtkast('ukjent',requestReason).ok,false);
assert.equal(api.recordLillebekkUtkast('utbygger','kort').ok,false);
assert.equal(api.recordLillebekkUtkast('utbygger',requestReason).ok,true);
assert.equal(api.getLillebekkSvarrundeModel().canOpen,false);
assert.equal(api.recordLillebekkSvarrundeStart().ok,false);
assert.equal(api.recordLillebekkUtkast('utbygger',' '+requestReason+' ').alreadyLogged,true);
assert.equal(api.recordLillebekkUtkast('planjuss',requestReason).ok,true);
drafts=api.getLillebekkUtkastModel();
assert.equal(drafts.complete,true);
assert.equal(drafts.drafts[0].count,1);
assert.equal(drafts.drafts[1].count,1);
assert.ok(drafts.drafts[0].latestNote.includes('LBK-SUP-13'));
assert.ok(drafts.drafts[0].latestNote.includes('LBK-SUP-14'));
assert.ok(!drafts.drafts[0].latestNote.includes('Kvalitetssikre § 4.1'));
assert.ok(drafts.drafts[1].latestNote.includes('LBK-SUP-15'));
assert.ok(drafts.drafts[1].latestNote.includes('Juridisk sluttkontroll er kommunens oppgave'));
assert.ok(drafts.drafts.every(d=>d.latestNote.includes('IKKE SENDT')));
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkUtkastModel().complete,true);

// The previous drafts were NOT sent. A fresh exercise only opens through an
// explicit player action, with two authored and explicitly fictional responses.
let answers=api.getLillebekkSvarrundeModel();
assert.equal(answers.canOpen,true);
assert.equal(answers.opened,false);
assert.equal(answers.ready,false);
assert.equal(api.getLillebekkSvarnotatModel(),null);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-svarrunde-open="1"'));
assert.ok(!host.innerHTML.includes('data-civi-svarrunde-save="1"'));
assert.equal(api.recordLillebekkSvarvurdering('utbygger','returner_for_trafikk_og_va_kontroll',requestReason).ok,false);
assert.equal(api.recordLillebekkSvarrundeStart().ok,true);
assert.equal(api.recordLillebekkSvarrundeStart().alreadyLogged,true);
answers=api.getLillebekkSvarrundeModel();
assert.equal(answers.opened,true);
assert.equal(answers.docs.length,2);
assert.deepEqual(Array.from(answers.docs.map(d=>d.ref)),['LBK-SVAR-16','LBK-SVAR-17']);
assert.equal(api.renderSections(),true);
for(const token of ['LBK-SVAR-16','LBK-SVAR-17','1,25 meter','0,90 meter','42 m³','26 m³','§ 4.1','fiktiv']) {
 assert.ok(host.innerHTML.includes(token),'authored exercise response '+token);
}
assert.equal((host.innerHTML.match(/data-civi-svarrunde-save="1"/g)||[]).length,2);
const svarReason='De fiktive dokumentene gir bare delvise opplysninger. Trafikkfag må kontrollere bredde og sikt, VA må beregne utløp og planjuss må avklare kart, hjemmel og ansvar før saken går videre.';
assert.equal(api.recordLillebekkSvarvurdering('ukjent','returner_for_trafikk_og_va_kontroll',svarReason).ok,false);
assert.equal(api.recordLillebekkSvarvurdering('utbygger','ukjent',svarReason).ok,false);
assert.equal(api.recordLillebekkSvarvurdering('utbygger','returner_for_trafikk_og_va_kontroll','for kort').ok,false);
assert.equal(api.recordLillebekkSvarvurdering('utbygger','godkjenn_teknisk_grunnlag',svarReason).ok,true);
assert.equal(api.getLillebekkSvarrundeModel().docs[0].safe,false);
assert.equal(api.getLillebekkSvarnotatModel().ready,false);
assert.equal(api.recordLillebekkSvarnotat('avvent_supplering_og_ny_ledervurdering',svarReason).ok,false);
assert.equal(api.recordLillebekkSvarvurdering('utbygger','returner_for_trafikk_og_va_kontroll',svarReason).ok,true);
assert.equal(api.recordLillebekkSvarvurdering('utbygger','returner_for_trafikk_og_va_kontroll','  '+svarReason+' ').alreadyLogged,true);
assert.equal(api.recordLillebekkSvarvurdering('planjuss','behold_utkast_og_krev_sluttkontroll',svarReason).ok,true);
answers=api.getLillebekkSvarrundeModel();
assert.equal(answers.ready,true);
assert.ok(answers.docs[0].latestNote.includes('Øvingsrunde: lillebekk_svarrunde_v1;'));
assert.ok(answers.docs[1].latestNote.includes('LBK-SVAR-17'));
assert.ok(answers.docs.every(d=>d.latestNote.includes('ikke dokumentmottak')));
const responseInjection='<img src=x onerror=alert(1)> Øvingssvarene må kontrolleres av trafikk og VA, og planjuristen må kontrollere bestemmelsens hjemmel og kartforankring før videre intern behandling.';
assert.equal(api.recordLillebekkSvarvurdering('planjuss','behold_utkast_og_krev_sluttkontroll',responseInjection).ok,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));
assert.equal(world.getWorkObject(caseId).status,'open');
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkSvarrundeModel().ready,true);

// Combine only the two source-current, professionally assessed fictional
// responses into an internal memo; even a premature choice cannot approve.
let responseMemo=api.getLillebekkSvarnotatModel();
assert.equal(responseMemo.ready,true);
assert.equal(responseMemo.current,false);
assert.equal(responseMemo.count,0);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-svarnotat-save="1"'));
assert.ok(host.innerHTML.includes('Samlet faglig oppfølgingsnotat'));
const responseMemoReason='Trafikkfag må kontrollere gangbredde, sikt og levering ved punkt B. VA må beregne utløp og nabovirkning. Kommunal planjurist må kontrollere § 4.1 mot plankart og hjemmel før ny intern ledervurdering.';
assert.equal(api.recordLillebekkSvarnotat('ukjent',responseMemoReason).ok,false);
assert.equal(api.recordLillebekkSvarnotat('avvent_supplering_og_ny_ledervurdering','for kort').ok,false);
assert.equal(api.recordLillebekkSvarnotat('foresla_vedtak_uten_dokumentkontroll',responseMemoReason).ok,true);
assert.equal(api.getLillebekkSvarnotatModel().current,false);
assert.equal(api.getLillebekkSvarnotatModel().latestReport.outcome,'foresla_vedtak_uten_dokumentkontroll');
assert.equal(api.getLillebekkElinSvarmoteModel().memo.current,false);
assert.equal(api.recordLillebekkElinSvarmoteSvar('skolevei','krever_trafikkfaglig_dokumentasjon',responseMemoReason).ok,false);
assert.equal(api.recordLillebekkSvarnotat('avvent_supplering_og_ny_ledervurdering',responseMemoReason).ok,true);
assert.equal(api.recordLillebekkSvarnotat('avvent_supplering_og_ny_ledervurdering',' '+responseMemoReason+' ').alreadyLogged,true);
responseMemo=api.getLillebekkSvarnotatModel();
assert.equal(responseMemo.current,true);
assert.equal(responseMemo.count,2);
for(const fragment of ['LBK-SVAR-16','LBK-SVAR-17','LBK-SUP-15','1,25 meter','0,90 meter','42 m³',
 '26 m³','§ 4.1','Skolevei','Overvann','Grøntdrag','Medvirkning','Kildeversjoner:',
 'IKKE SENDT','Ingen åpne avvik lukkes']) {
 assert.ok(responseMemo.latestReport.note.includes(fragment),'source bound follow-up memo '+fragment);
}
assert.ok(!responseMemo.latestReport.note.includes('Teknisk kontroll er bestått'));
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
const memoInjection='<img src=x onerror=alert(1)> Skoleveien er ikke kontrollert av trafikkfag; overvannets utløp og nabovirkning krever VA-beregning, og § 4.1 krever kommunal juridisk kontroll.';
assert.equal(api.recordLillebekkSvarnotat('avvent_supplering_og_ny_ledervurdering',memoInjection).ok,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));
assert.equal(api.getLillebekkSvarnotatModel().current,true);
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkSvarnotatModel().current,true);


// A third simulated manager meeting, following the now-current internal memo.
// Elin asks three distinct professional questions, not a generic approval test.
let manager3=api.getLillebekkElinSvarmoteModel();
assert.equal(manager3.memo.current,true);
assert.equal(manager3.complete,false);
assert.equal(manager3.current,false);
assert.equal(manager3.questions.length,3);
assert.deepEqual(Array.from(manager3.questions.map(q=>q.ref)),['LBK-SVAR-16','LBK-SVAR-16','LBK-SVAR-17']);
assert.equal(api.renderSections(),true);
assert.equal((host.innerHTML.match(/data-civi-elin3-save="1"/g)||[]).length,3);
assert.ok(!host.innerHTML.includes('data-civi-elin3-report-save="1"'));
for(const token of ['0,90 meter','1,25 meter','42 m³','26 m³','§ 4.1','Hvem har myndighet']) {
  assert.ok(host.innerHTML.includes(token),'Elin professional meeting question '+token);
}
const manager3Reason='Den fiktive skissen og svarteksten dokumenterer ikke kontrollert skolevei eller overvannskapasitet. Trafikkfag, VA og kommunal planjurist må levere hver sin verifiserte vurdering før videre behandling.';
const manager3Plan='Trafikkfag skal kontrollere målsatt gangbredde, sikt og leveringsdrift. VA skal beregne kapasitet, flomvei og nabovirkning. Kommunal planjurist skal kontrollere plankart, hjemmel og § 4.1 før ny intern behandling.';
assert.equal(api.recordLillebekkElinSvarmoteSvar('ukjent','krever_trafikkfaglig_dokumentasjon',manager3Reason).ok,false);
assert.equal(api.recordLillebekkElinSvarmoteSvar('skolevei','ukjent',manager3Reason).ok,false);
assert.equal(api.recordLillebekkElinSvarmoteSvar('skolevei','krever_trafikkfaglig_dokumentasjon','kort').ok,false);
assert.equal(api.recordLillebekkElinSvarmoteReferat(manager3Plan).ok,false);
assert.equal(api.recordLillebekkElinSvarmoteSvar('skolevei','godkjenn_skolevei_ut_fra_skisse',manager3Reason).ok,true);
assert.equal(api.getLillebekkElinSvarmoteModel().questions[0].safe,false);
assert.ok(api.getLillebekkElinSvarmoteModel().questions[0].latestNote.includes('Elin avviser den premature konklusjonen'));
assert.equal(api.recordLillebekkElinSvarmoteSvar('skolevei','krever_trafikkfaglig_dokumentasjon',manager3Reason).ok,true);
assert.equal(api.recordLillebekkElinSvarmoteSvar('skolevei','krever_trafikkfaglig_dokumentasjon',' '+manager3Reason+' ').alreadyLogged,true);
assert.equal(api.recordLillebekkElinSvarmoteSvar('overvann','krever_va_kapasitet_og_nabovirkning',manager3Reason).ok,true);
assert.equal(api.recordLillebekkElinSvarmoteSvar('planjuss','krever_intern_juridisk_sluttkontroll',manager3Reason).ok,true);
manager3=api.getLillebekkElinSvarmoteModel();
assert.equal(manager3.complete,true);
assert.equal(manager3.current,false);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-elin3-report-save="1"'));
assert.equal(api.recordLillebekkElinSvarmoteReferat('kort').ok,false);
assert.equal(api.recordLillebekkElinSvarmoteReferat(manager3Plan).ok,true);
assert.equal(api.recordLillebekkElinSvarmoteReferat(' '+manager3Plan+' ').alreadyLogged,true);
manager3=api.getLillebekkElinSvarmoteModel();
assert.equal(manager3.current,true);
assert.equal(manager3.reportsCount,1);
for(const token of ['LBK-SVAR-16','LBK-SVAR-17','0,90 meter','42 m³','§ 4.1',
  'Trafikkfag','VA','planjurist','Kildeversjoner:','Ingen fagavvik er automatisk lukket']) {
  assert.ok(manager3.latestReport.note.includes(token),'source-bound Elin meeting report '+token);
}
assert.equal(world.getWorkObject(caseId).status,'open');
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
const manager3Injection='<img src=x onerror=alert(1)> Elin har ikke godkjent noe. Trafikkfag og VA må utrede kontrollert grunnlag, og kommunal planjurist må kontrollere § 4.1 før videre intern behandling.';
assert.equal(api.recordLillebekkElinSvarmoteReferat(manager3Injection).ok,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));
assert.equal(api.getLillebekkElinSvarmoteModel().current,true);
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkElinSvarmoteModel().current,true);


// Elin's record enables three internal work packages, not a confirmation that
// any request has been sent or that the underlying reports exist.
let controlPlan=api.getLillebekkKontrollplanModel();
assert.equal(controlPlan.meeting.current,true);
assert.equal(controlPlan.ready,false);
assert.equal(controlPlan.current,false);
assert.equal(controlPlan.packages.length,3);
assert.deepEqual(Array.from(controlPlan.packages.map(p=>p.ref)),['LBK-KP-18','LBK-KP-19','LBK-KP-20']);
assert.equal(api.renderSections(),true);
assert.equal((host.innerHTML.match(/data-civi-kontrollpakke-save="1"/g)||[]).length,3);
assert.ok(!host.innerHTML.includes('data-civi-kontrollplan-save="1"'));
for(const t of ['LBK-KP-18','LBK-KP-19','LBK-KP-20','1,25 m','0,90 m','42 m³','26 m³',
 '§ 4.1','Kommunens trafikkfaglige','Kommunal planjurist']) {
 assert.ok(host.innerHTML.includes(t),'render specific work package '+t);
}
const packageReason='Fagansvarlig må dokumentere beregninger, risiko og ansvar med kontrollerbare bilag. Uten skriftlig kontrollgrunnlag kan saken ikke gå videre til vedtak.';
const planReason='Trafikkfag og VA skal kontrollere bredde, sikt, vannets kapasitet og nabovirkning. Planjurist avstemmer deretter § 4.1 og plankart. Rådgiver må kontrollere at alle tre rapportene er vurdert før en ny lederbehandling.';
assert.equal(api.recordLillebekkKontrollpakke('ukjent','be_om_trafikkfaglig_kontrollpakke',packageReason).ok,false);
assert.equal(api.recordLillebekkKontrollpakke('trafikk','ukjent',packageReason).ok,false);
assert.equal(api.recordLillebekkKontrollpakke('trafikk','be_om_trafikkfaglig_kontrollpakke','kort').ok,false);
assert.equal(api.recordLillebekkKontrollplan(planReason).ok,false);
assert.equal(api.getLillebekkKontrollovelseModel(),null);
assert.equal(api.recordLillebekkKontrollovelseStart().ok,false);
assert.equal(api.recordLillebekkKontrollpakke('trafikk','marker_skolevei_som_kontrollert',packageReason).ok,true);
assert.equal(api.getLillebekkKontrollplanModel().packages[0].safe,false);
assert.ok(api.getLillebekkKontrollplanModel().packages[0].latestNote.includes('FAGLIG FEIL'));
assert.equal(api.recordLillebekkKontrollpakke('trafikk','be_om_trafikkfaglig_kontrollpakke',packageReason).ok,true);
assert.equal(api.recordLillebekkKontrollpakke('trafikk','be_om_trafikkfaglig_kontrollpakke',' '+packageReason+' ').alreadyLogged,true);
assert.equal(api.recordLillebekkKontrollpakke('overvann','be_om_hydraulisk_kontrollpakke',packageReason).ok,true);
assert.equal(api.recordLillebekkKontrollpakke('planjuss','be_om_planjuridisk_sluttkontroll',packageReason).ok,true);
controlPlan=api.getLillebekkKontrollplanModel();
assert.equal(controlPlan.ready,true);
assert.equal(controlPlan.current,false);
assert.equal(controlPlan.packages.filter(p=>p.safe).length,3);
assert.ok(controlPlan.packages.every(p=>p.latestNote.includes('IKKE SENDT')));
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-kontrollplan-save="1"'));
assert.equal(api.recordLillebekkKontrollplan('kort').ok,false);
assert.equal(api.recordLillebekkKontrollplan(planReason).ok,true);
assert.equal(api.recordLillebekkKontrollplan('  '+planReason+'  ').alreadyLogged,true);
controlPlan=api.getLillebekkKontrollplanModel();
assert.equal(controlPlan.current,true);
assert.equal(controlPlan.planCount,1);
for(const t of ['LBK-KP-18','LBK-KP-19','LBK-KP-20','0,90 m','42 m³',
 '26 m³','§ 4.1','Stoppunkt A','Stoppunkt B','Stoppunkt C','Kildeversjoner:','Ingen bestilling er sendt']) {
 assert.ok(controlPlan.latestPlan.note.includes(t),'source-traced internal control plan '+t);
}
assert.equal(world.getWorkObject(caseId).status,'open');
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
for(const flag of ['skolevei_ikke_dokumentert','early_green_corridor_unsecured','participation_record_missing']) {
 assert.ok(world.getWorkObject(caseId).flags.includes(flag),'preserved open case issue '+flag);
}
const planInjection='<img src=x onerror=alert(1)> Fagansvarlige må levere kontrollgrunnlag for skolevei, overvann og § 4.1 før rådgiveren kan utarbeide et nytt forslag til Elin.';
assert.equal(api.recordLillebekkKontrollplan(planInjection).ok,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkKontrollplanModel().current,true);


// The preceding control packages were NOT sent. Author-controlled excerpts
// are only available after the player deliberately opens a new fictional case exercise.
let exercise=api.getLillebekkKontrollovelseModel();
assert.equal(exercise.canOpen,true);
assert.equal(exercise.opened,false);
assert.equal(exercise.ready,false);
assert.equal(exercise.summaryCount,0);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-kontrollovelse-open="1"'));
assert.ok(!host.innerHTML.includes('data-civi-kontrollovelse-save="1"'));
const exerciseReason='Dette er bare et fiktivt faglig øvingsutdrag, ikke verifisert kontroll. Fagansvarlig må kontrollere bredde og sikt, flomvei og nabo, samt § 4.1 og plankart før behandling.';
const exerciseFollowup='Trafikkfag må dokumentere framkommelighet under levering og signert driftsplan. VA må forklare 4 m³ og beregne vestre utløp og nabovirkning. Planjurist må avstemme § 4.1 med kart, ansvar og trafikkpremisser.';
assert.equal(api.recordLillebekkKontrollovelseVurdering('trafikk','returner_trafikkbilag_til_kontroll',exerciseReason).ok,false);
assert.equal(api.recordLillebekkKontrollovelseStart().ok,true);
assert.equal(api.recordLillebekkKontrollovelseStart().alreadyLogged,true);
exercise=api.getLillebekkKontrollovelseModel();
assert.equal(exercise.opened,true);
assert.equal(exercise.roundsCount,1);
assert.deepEqual(Array.from(exercise.docs.map(d=>d.ref)),['LBK-KR-21','LBK-KR-22','LBK-KR-23']);
assert.equal(api.renderSections(),true);
for(const token of ['LBK-KR-21','LBK-KR-22','LBK-KR-23','1,25 meter','0,90 meter',
 '42 m³','26 m³','12 m³','4 m³','§ 4.1','ikke faktisk mottatte fagrapporter']) {
 assert.ok(host.innerHTML.includes(token),'authored independent fictional control excerpt '+token);
}
assert.equal((host.innerHTML.match(/data-civi-kontrollovelse-save="1"/g)||[]).length,3);
assert.ok(!host.innerHTML.includes('data-civi-kontrollovelse-summary-save="1"'));
assert.equal(api.recordLillebekkKontrollovelseVurdering('ukjent','returner_trafikkbilag_til_kontroll',exerciseReason).ok,false);
assert.equal(api.recordLillebekkKontrollovelseVurdering('trafikk','ukjent',exerciseReason).ok,false);
assert.equal(api.recordLillebekkKontrollovelseVurdering('trafikk','returner_trafikkbilag_til_kontroll','kort').ok,false);
assert.equal(api.recordLillebekkKontrollovelseOppsummering(exerciseFollowup).ok,false);
assert.equal(api.recordLillebekkKontrollovelseVurdering('trafikk','lukk_skolevei_etter_ovingsutdrag',exerciseReason).ok,true);
assert.equal(api.getLillebekkKontrollovelseModel().docs[0].safe,false);
assert.ok(api.getLillebekkKontrollovelseModel().docs[0].latestNote.includes('Prematur godkjenning avvises'));
assert.equal(api.recordLillebekkKontrollovelseVurdering('trafikk','returner_trafikkbilag_til_kontroll',exerciseReason).ok,true);
assert.equal(api.recordLillebekkKontrollovelseVurdering('trafikk','returner_trafikkbilag_til_kontroll',' '+exerciseReason+' ').alreadyLogged,true);
assert.equal(api.recordLillebekkKontrollovelseVurdering('overvann','returner_va_bilag_med_beregningskrav',exerciseReason).ok,true);
assert.equal(api.recordLillebekkKontrollovelseVurdering('planjuss','behold_paragraf_under_juridisk_kontroll',exerciseReason).ok,true);
exercise=api.getLillebekkKontrollovelseModel();
assert.equal(exercise.ready,true);
assert.equal(exercise.current,false);
assert.equal(exercise.docs.filter(d=>d.safe).length,3);
assert.ok(exercise.docs.every(d=>d.latestNote.includes('IKKE reelt dokumentmottak')));
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-kontrollovelse-summary-save="1"'));
assert.equal(api.recordLillebekkKontrollovelseOppsummering('kort').ok,false);
assert.equal(api.recordLillebekkKontrollovelseOppsummering(exerciseFollowup).ok,true);
assert.equal(api.recordLillebekkKontrollovelseOppsummering(' '+exerciseFollowup+' ').alreadyLogged,true);
exercise=api.getLillebekkKontrollovelseModel();
assert.equal(exercise.current,true);
assert.equal(exercise.summaryCount,1);
for(const token of ['LBK-KP-18','LBK-KP-19','LBK-KP-20','LBK-KR-21','LBK-KR-22',
 'LBK-KR-23','42 m³','26 m³','12 m³','4 m³','§ 4.1','grøntdrag','medvirkning',
 'IKKE GODKJENNING','Kildeversjoner:']) {
 assert.ok(exercise.latestSummary.note.includes(token),'source-traced critical review '+token);
}
assert.equal(world.getWorkObject(caseId).status,'open');
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
const exerciseInjection='<img src=x onerror=alert(1)> Fiktive kontrollbilag kan ikke brukes som faktiske rapporter. Trafikk, VA og planjuss må dokumentere sine faglige vurderinger før ny intern lederbehandling.';
assert.equal(api.recordLillebekkKontrollovelseOppsummering(exerciseInjection).ok,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkKontrollovelseModel().current,true);


let reg=api.getLillebekkRestanseprioritetModel();
assert.equal(reg.exercise.current,true);
assert.equal(reg.ready,false);
assert.equal(reg.current,false);
assert.deepEqual(Array.from(reg.items.map(x=>x.ref)),['LBK-REST-24','LBK-REST-25','LBK-REST-26']);
assert.equal(api.renderSections(),true);
assert.equal((host.innerHTML.match(/data-civi-restansestatus-save="1"/g)||[]).length,3);
assert.ok(!host.innerHTML.includes('data-civi-restanselogg-save="1"'));
const regReason='Trafikkfag må kontrollere gangbredde og sikt ved levering, VA må dokumentere flomvei og nabovirkning, og kommunal planjurist må avklare hjemmel og plankart før ny lederbehandling.';
const regPlan='Trafikkfag og VA skal dokumentere skolevei, kapasitetsforhold og nabovirkning først. Planjurist kontrollerer deretter § 4.1 mot riktig plankart. Ingen avvik lukkes på fiktive øvingsbilag.';
assert.equal(api.recordLillebekkRestansestatus('ganglinje','prioriter_sikkerhet_og_dokumentkrav','kort').ok,false);
assert.equal(api.recordLillebekkRestansestatus('ukjent','prioriter_sikkerhet_og_dokumentkrav',regReason).ok,false);
assert.equal(api.recordLillebekkRestansestatus('ganglinje','ukjent',regReason).ok,false);
assert.equal(api.recordLillebekkRestanselogg(regPlan).ok,false);
assert.equal(api.recordLillebekkRestansestatus('ganglinje','lukk_avvik_pa_skisse',regReason).ok,true);
assert.equal(api.getLillebekkRestanseprioritetModel().items[0].safe,false);
assert.ok(api.getLillebekkRestanseprioritetModel().items[0].latestNote.includes('FAGLIG AVVIK'));
assert.equal(api.recordLillebekkRestansestatus('ganglinje','prioriter_sikkerhet_og_dokumentkrav',regReason).ok,true);
assert.equal(api.recordLillebekkRestansestatus('ganglinje','prioriter_sikkerhet_og_dokumentkrav','  '+regReason+'  ').alreadyLogged,true);
assert.equal(api.recordLillebekkRestansestatus('avrenning','prioriter_full_va_kontroll',regReason).ok,true);
assert.equal(api.recordLillebekkRestansestatus('rekkefolge','prioriter_juridisk_avstemming',regReason).ok,true);
reg=api.getLillebekkRestanseprioritetModel();
assert.equal(reg.ready,true);
assert.equal(reg.current,false);
assert.equal(reg.items.filter(x=>x.safe).length,3);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('data-civi-restanselogg-save="1"'));
assert.equal(api.recordLillebekkRestanselogg('kort').ok,false);
assert.equal(api.recordLillebekkRestanselogg(regPlan).ok,true);
assert.equal(api.recordLillebekkRestanselogg(' '+regPlan+' ').alreadyLogged,true);
reg=api.getLillebekkRestanseprioritetModel();
assert.equal(reg.current,true);
assert.equal(reg.logCount,1);
for(const v of ['LBK-REST-24','LBK-REST-25','LBK-REST-26','LBK-KR-21','LBK-KR-22','LBK-KR-23',
 '1,25 m','0,90 m','42 m³','26 m³','12 m³','4 m³','§ 4.1','Kildeversjoner:']) {
 assert.ok(reg.latestLog.note.includes(v),'source trace '+v);
}
assert.equal(world.getWorkObject(caseId).status,'open');
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
const regInjection='<img src=x onerror=alert(1)> Trafikkfag må etterprøve skoleveien, VA må kontrollere vestre utløp og planjurist må avstemme § 4.1 før intern lederbehandling.';
assert.equal(api.recordLillebekkRestanselogg(regInjection).ok,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkRestanseprioritetModel().current,true);

assert.equal(world.getWorkObject(caseId).status,'open');
assert.equal(world.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
for(const flag of ['skolevei_ikke_dokumentert','early_green_corridor_unsecured','participation_record_missing']) {
 assert.ok(world.getWorkObject(caseId).flags.includes(flag),'preserved legal/planning issue '+flag);
}
saved=JSON.parse(JSON.stringify(saved));
assert.equal(api.getLillebekkSuppleringssvarModel().current,true);

// An upstream source revision must invalidate the restanse matrix; the
// original subject-matter reviews and their history are retained.
assert.equal(api.recordLillebekkLeder2Oppgave('trafikk','ettersporr_trafikkgrunnlag',
 'Presisert bestilling for kontroll av skolevei og endret leveringsvindu. Trafikkfag må dokumentere fri bredde, sikt og trygghet før innflytting.').ok,true);
supplements=api.getLillebekkSuppleringssvarModel();
assert.equal(supplements.sourceCurrent,false);
assert.equal(supplements.current,false);
assert.equal(api.getLillebekkUtkastModel().ready,false);
assert.equal(api.getLillebekkUtkastModel().complete,false);
assert.equal(api.getLillebekkSvarrundeModel().canOpen,false);
assert.equal(api.getLillebekkSvarrundeModel().opened,false);
assert.equal(api.getLillebekkSvarrundeModel().ready,false);
assert.equal(api.getLillebekkSvarnotatModel().ready,false);
assert.equal(api.getLillebekkSvarnotatModel().current,false);
assert.equal(api.getLillebekkElinSvarmoteModel().current,false);
assert.equal(api.getLillebekkKontrollplanModel().ready,false);
assert.equal(api.getLillebekkKontrollplanModel().current,false);
assert.equal(api.getLillebekkKontrollovelseModel().canOpen,false);
assert.equal(api.getLillebekkKontrollovelseModel().opened,false);
assert.equal(api.getLillebekkKontrollovelseModel().current,false);
assert.equal(api.getLillebekkRestanseprioritetModel().ready,false);
assert.equal(api.getLillebekkRestanseprioritetModel().current,false);
assert.equal(api.recordLillebekkRestansestatus('ganglinje','prioriter_sikkerhet_og_dokumentkrav',regReason).ok,false);
assert.equal(api.recordLillebekkRestanselogg(regPlan).ok,false);
assert.equal(api.recordLillebekkKontrollovelseStart().ok,false);
assert.equal(api.recordLillebekkKontrollovelseVurdering('trafikk','returner_trafikkbilag_til_kontroll',exerciseReason).ok,false);
assert.equal(api.recordLillebekkKontrollovelseOppsummering(exerciseFollowup).ok,false);
assert.equal(api.recordLillebekkKontrollpakke('trafikk','be_om_trafikkfaglig_kontrollpakke',packageReason).ok,false);
assert.equal(api.recordLillebekkKontrollplan(planReason).ok,false);
assert.equal(api.getLillebekkElinSvarmoteModel().complete,false);
assert.equal(api.recordLillebekkElinSvarmoteSvar('skolevei','krever_trafikkfaglig_dokumentasjon',manager3Reason).ok,false);
assert.equal(api.recordLillebekkElinSvarmoteReferat(manager3Plan).ok,false);
assert.equal(api.recordLillebekkSvarnotat('avvent_supplering_og_ny_ledervurdering',responseMemoReason).ok,false);
assert.equal(api.recordLillebekkSvarrundeStart().ok,false);
assert.equal(api.recordLillebekkSvarvurdering('utbygger','returner_for_trafikk_og_va_kontroll',svarReason).ok,false);
assert.equal(api.recordLillebekkUtkast('utbygger',requestReason).ok,false);
assert.equal(api.recordLillebekkSuppleringsmatrise(supPlan).ok,false);
assert.equal(api.recordLillebekkSuppleringsgjennomgang('overvann','registrer_delvis_retting_og_krev_hydraulikk',supReason).ok,false);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('Oppfølgingsnotatet etter Elins ledervurdering er ikke gjeldende'));
assert.equal(api.recordLillebekkLeder2Oppfolgingsnotat(leaderRecommendation).ok,true);
supplements=api.getLillebekkSuppleringssvarModel();
assert.equal(supplements.sourceCurrent,true);
assert.equal(supplements.ready,false);
assert.equal(supplements.docs.every(d=>!d.safe),true,'old supplement decisions cannot silently carry to new leader memo');
for(const [id,choice] of [['trafikk','returner_trafikk_med_konkret_mangelliste'],
 ['overvann','registrer_delvis_retting_og_krev_hydraulikk'],
 ['planjuss','journalfor_utkast_med_juridiske_forbehold']]) {
 assert.equal(api.recordLillebekkSuppleringsgjennomgang(id,choice,supReason).ok,true);
}
assert.equal(api.getLillebekkSuppleringssvarModel().ready,true);
assert.equal(api.getLillebekkSuppleringssvarModel().current,false);
assert.equal(api.recordLillebekkSuppleringsmatrise(supPlan).ok,true);
assert.equal(api.getLillebekkSuppleringssvarModel().current,true);
assert.equal(api.getLillebekkSuppleringssvarModel().matrixCount,2);
assert.equal(api.getLillebekkUtkastModel().ready,true);
assert.equal(api.getLillebekkUtkastModel().complete,false);
assert.equal(api.getLillebekkUtkastModel().drafts.every(d=>!d.current),true);
assert.equal(api.recordLillebekkUtkast('utbygger',requestReason).ok,true);
assert.equal(api.getLillebekkUtkastModel().drafts[0].count,2);
assert.equal(api.recordLillebekkUtkast('planjuss',requestReason).ok,true);
assert.equal(api.getLillebekkUtkastModel().complete,true);
assert.equal(api.getLillebekkSvarrundeModel().canOpen,true);
assert.equal(api.getLillebekkSvarrundeModel().opened,false);
assert.equal(api.recordLillebekkSvarrundeStart().ok,true);
assert.equal(api.getLillebekkSvarrundeModel().rounds,2);
assert.equal(api.getLillebekkSvarrundeModel().docs.every(d=>!d.safe),true);
assert.equal(api.recordLillebekkSvarvurdering('utbygger','returner_for_trafikk_og_va_kontroll',svarReason).ok,true);
assert.equal(api.recordLillebekkSvarvurdering('planjuss','behold_utkast_og_krev_sluttkontroll',svarReason).ok,true);
assert.equal(api.getLillebekkSvarrundeModel().ready,true);
assert.equal(api.getLillebekkSvarnotatModel().ready,true);
assert.equal(api.getLillebekkSvarnotatModel().current,false);
assert.equal(api.recordLillebekkSvarnotat('avvent_supplering_og_ny_ledervurdering',responseMemoReason).ok,true);
assert.equal(api.getLillebekkSvarnotatModel().current,true);
assert.equal(api.getLillebekkSvarnotatModel().count,4);
assert.equal(api.getLillebekkElinSvarmoteModel().complete,false);
assert.equal(api.getLillebekkElinSvarmoteModel().current,false);
assert.equal(api.recordLillebekkElinSvarmoteReferat(manager3Plan).ok,false);
for(const [id,action] of [['skolevei','krever_trafikkfaglig_dokumentasjon'],
 ['overvann','krever_va_kapasitet_og_nabovirkning'],
 ['planjuss','krever_intern_juridisk_sluttkontroll']]) {
 assert.equal(api.recordLillebekkElinSvarmoteSvar(id,action,manager3Reason).ok,true);
}
assert.equal(api.getLillebekkElinSvarmoteModel().complete,true);
assert.equal(api.recordLillebekkElinSvarmoteReferat(manager3Plan).ok,true);
assert.equal(api.getLillebekkElinSvarmoteModel().current,true);
assert.equal(api.getLillebekkElinSvarmoteModel().reportsCount,3);
assert.equal(api.getLillebekkKontrollplanModel().ready,false);
assert.equal(api.getLillebekkKontrollplanModel().current,false);
assert.equal(api.recordLillebekkKontrollplan(planReason).ok,false);
for(const [id,choice] of [['trafikk','be_om_trafikkfaglig_kontrollpakke'],
 ['overvann','be_om_hydraulisk_kontrollpakke'],
 ['planjuss','be_om_planjuridisk_sluttkontroll']]) {
 assert.equal(api.recordLillebekkKontrollpakke(id,choice,packageReason).ok,true);
}
assert.equal(api.getLillebekkKontrollplanModel().ready,true);
assert.equal(api.recordLillebekkKontrollplan(planReason).ok,true);
assert.equal(api.getLillebekkKontrollplanModel().planCount,3);
assert.equal(api.getLillebekkKontrollplanModel().current,true);
assert.equal(api.getLillebekkKontrollovelseModel().opened,false);
assert.equal(api.getLillebekkKontrollovelseModel().current,false);
assert.equal(api.recordLillebekkKontrollovelseStart().ok,true);
assert.equal(api.getLillebekkKontrollovelseModel().roundsCount,2);
assert.equal(api.getLillebekkKontrollovelseModel().docs.every(d=>!d.safe),true);
assert.equal(api.recordLillebekkKontrollovelseOppsummering(exerciseFollowup).ok,false);
for(const [id,choice] of [['trafikk','returner_trafikkbilag_til_kontroll'],
 ['overvann','returner_va_bilag_med_beregningskrav'],
 ['planjuss','behold_paragraf_under_juridisk_kontroll']]) {
 assert.equal(api.recordLillebekkKontrollovelseVurdering(id,choice,exerciseReason).ok,true);
}
assert.equal(api.getLillebekkKontrollovelseModel().ready,true);
assert.equal(api.recordLillebekkKontrollovelseOppsummering(exerciseFollowup).ok,true);
assert.equal(api.getLillebekkKontrollovelseModel().summaryCount,3);
assert.equal(api.getLillebekkKontrollovelseModel().current,true);
assert.equal(api.getLillebekkRestanseprioritetModel().ready,false);
for(const [id,choice] of [['ganglinje','prioriter_sikkerhet_og_dokumentkrav'],
 ['avrenning','prioriter_full_va_kontroll'],
 ['rekkefolge','prioriter_juridisk_avstemming']]) {
 assert.equal(api.recordLillebekkRestansestatus(id,choice,regReason).ok,true);
}
assert.equal(api.getLillebekkRestanseprioritetModel().ready,true);
assert.equal(api.recordLillebekkRestanselogg(regPlan).ok,true);
assert.equal(api.getLillebekkRestanseprioritetModel().logCount,3);
assert.equal(api.getLillebekkRestanseprioritetModel().current,true);

// The latest documented assessment, rather than player text with an embedded
// old note ID, decides whether a source is current.
const fakeFuture='Oppfølgingsnotat: lillebekk_leder2_oppfolgingsnotat_v999; Dette er kun brukerfritekst.';
assert.equal(api.recordLillebekkSuppleringsgjennomgang('planjuss','journalfor_utkast_med_juridiske_forbehold',
 supReason+' '+fakeFuture).ok,true);
assert.equal(api.getLillebekkSuppleringssvarModel().ready,true);
assert.equal(api.getLillebekkSuppleringssvarModel().current,false);
assert.equal(api.recordLillebekkSuppleringsmatrise(supPlan).ok,true);
const letterInjection='<img src=x onerror=alert(1)> Utbygger må dokumentere målsatt fri gangbredde og hydraulisk utløpskapasitet før kommunen vurderer det tekniske materialet.';
assert.equal(api.recordLillebekkUtkast('utbygger',letterInjection).ok,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));
const supInjection='<img src=x onerror=alert(1)> Trafikkfag må utrede målsatt bredde og sikt, overvannsfag må beregne utløp og planjuss må kontrollere bestemmelsesutkastet før ny intern vurdering.';
assert.equal(api.recordLillebekkSuppleringsmatrise(supInjection).ok,true);
assert.equal(api.renderSections(),true);
assert.ok(host.innerHTML.includes('&lt;img'));
assert.ok(!host.innerHTML.includes('<img src=x onerror=alert(1)>'));

// Ten discretionary matrix revisions may not block a source-driven correction.
while(api.getLillebekkSuppleringssvarModel().matrixCount < 10) {
 const n=api.getLillebekkSuppleringssvarModel().matrixCount+1;
 assert.equal(api.recordLillebekkSuppleringsmatrise(supPlan+
 ' Intern oppfølging og dokumentkrav presiseres i arbeidsversjon '+n+'.').ok,true);
}
assert.equal(api.getLillebekkSuppleringssvarModel().matrixCount,10);
assert.equal(api.recordLillebekkSuppleringsmatrise(supPlan+
 ' Ikke begrunnet omformulering uten kildeendring.').ok,false);
assert.equal(api.recordLillebekkSuppleringsgjennomgang('trafikk','returner_trafikk_med_konkret_mangelliste',
 'En ny faglig gjennomgang presiserer målsatt fri bredde og risiko ved avvikende varelevering, som fremdeles må kontrolleres av trafikkfag.').ok,true);
assert.equal(api.getLillebekkSuppleringssvarModel().current,false);
assert.equal(api.recordLillebekkSuppleringsmatrise(supPlan).ok,true);
assert.equal(api.getLillebekkSuppleringssvarModel().matrixCount,11);
assert.equal(api.getLillebekkSuppleringssvarModel().current,true);

// Access and jurisdiction boundaries.
activeRole={role_key:'butikkmedarbeider'};
assert.equal(api.getLillebekkSuppleringssvarModel(),null);
assert.equal(api.getLillebekkUtkastModel(),null);
assert.equal(api.getLillebekkSvarrundeModel(),null);
assert.equal(api.getLillebekkSvarnotatModel(),null);
assert.equal(api.getLillebekkElinSvarmoteModel(),null);
assert.equal(api.getLillebekkKontrollplanModel(),null);
assert.equal(api.getLillebekkKontrollovelseModel(),null);
assert.equal(api.getLillebekkRestanseprioritetModel(),null);
assert.equal(api.recordLillebekkRestansestatus('ganglinje','prioriter_sikkerhet_og_dokumentkrav',regReason).ok,false);
assert.equal(api.recordLillebekkRestanselogg(regPlan).ok,false);
assert.equal(api.recordLillebekkKontrollovelseStart().ok,false);
assert.equal(api.recordLillebekkKontrollovelseVurdering('trafikk','returner_trafikkbilag_til_kontroll',exerciseReason).ok,false);
assert.equal(api.recordLillebekkKontrollovelseOppsummering(exerciseFollowup).ok,false);
assert.equal(api.recordLillebekkKontrollpakke('trafikk','be_om_trafikkfaglig_kontrollpakke',packageReason).ok,false);
assert.equal(api.recordLillebekkKontrollplan(planReason).ok,false);
assert.equal(api.recordLillebekkElinSvarmoteSvar('skolevei','krever_trafikkfaglig_dokumentasjon',manager3Reason).ok,false);
assert.equal(api.recordLillebekkElinSvarmoteReferat(manager3Plan).ok,false);
assert.equal(api.recordLillebekkSvarnotat('avvent_supplering_og_ny_ledervurdering',responseMemoReason).ok,false);
assert.equal(api.recordLillebekkSvarrundeStart().ok,false);
assert.equal(api.recordLillebekkSvarvurdering('utbygger','returner_for_trafikk_og_va_kontroll',svarReason).ok,false);
assert.equal(api.recordLillebekkUtkast('utbygger',requestReason).ok,false);
assert.equal(api.recordLillebekkSuppleringsgjennomgang('trafikk','returner_trafikk_med_konkret_mangelliste',supReason).ok,false);
assert.equal(api.recordLillebekkSuppleringsmatrise(supPlan).ok,false);
assert.equal(api.getLillebekkNyLedervurderingModel(),null);
assert.equal(api.recordLillebekkNyLedervurdering('returner_for_supplering',newLeaderReason).ok,false);
assert.equal(api.recordLillebekkLeder2Oppgave('trafikk','ettersporr_trafikkgrunnlag',taskReason).ok,false);
assert.equal(api.recordLillebekkLeder2Oppfolgingsnotat(leaderRecommendation).ok,false);
assert.equal(api.getLillebekkKontrollresultatModel(),null);
assert.equal(api.recordLillebekkResultatMottak().ok,false);
assert.equal(api.recordLillebekkResultatvurdering('ganglinje','registrer_kontrollbehov_for_ganglinje',resultatReason).ok,false);
assert.equal(api.recordLillebekkBeslutningsgrunnlag(decisionRecommendation).ok,false);
assert.equal(api.getLillebekkKontrollbilagModel(),null);
assert.equal(api.recordLillebekkKontrollFunn('ganglinje','krev_samordnet_skoleveikontroll',kontrollReason).ok,false);
assert.equal(api.recordLillebekkKontrollprotokoll(kontrollRecommendation).ok,false);
assert.equal(api.getLillebekkFagsvarModel(),null);
assert.equal(api.recordLillebekkFagsvarIntake().ok,false);
assert.equal(api.recordLillebekkFagsvarAssessment('trafikk','bestill_trafikkontroll',fagReason).ok,false);
assert.equal(api.recordLillebekkFagsvarFollowup(fagRecommendation).ok,false);
assert.equal(api.getLillebekkLeaderReviewModel(),null);
assert.equal(api.recordLillebekkLeaderReturn().ok,false);
assert.equal(api.recordLillebekkLeaderResponse('skolevei','trafikkfag',leaderReason).ok,false);
assert.equal(api.recordLillebekkCorrectedMemo(correctedRecommendation).ok,false);
assert.equal(api.getLillebekkSaksframleggModel(),null);
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','avklar_forst',reasons.skolevei_tidskrav).ok,false);
assert.equal(api.recordLillebekkSaksframlegg(recommendation).ok,false);
activeRole={role_key:'arealplanlegger'};
world.closeWorkObject(caseId,{event_id:'lillebekk_memo_test_close',at:'2026-11-07T10:00:00Z',outcome:'closed_for_test'});
assert.equal(api.getLillebekkSuppleringssvarModel(),null);
assert.equal(api.getLillebekkUtkastModel(),null);
assert.equal(api.getLillebekkSvarrundeModel(),null);
assert.equal(api.getLillebekkSvarnotatModel(),null);
assert.equal(api.getLillebekkElinSvarmoteModel(),null);
assert.equal(api.getLillebekkKontrollplanModel(),null);
assert.equal(api.getLillebekkKontrollovelseModel(),null);
assert.equal(api.getLillebekkRestanseprioritetModel(),null);
assert.equal(api.recordLillebekkRestansestatus('ganglinje','prioriter_sikkerhet_og_dokumentkrav',regReason).ok,false);
assert.equal(api.recordLillebekkRestanselogg(regPlan).ok,false);
assert.equal(api.recordLillebekkKontrollovelseStart().ok,false);
assert.equal(api.recordLillebekkKontrollovelseVurdering('trafikk','returner_trafikkbilag_til_kontroll',exerciseReason).ok,false);
assert.equal(api.recordLillebekkKontrollovelseOppsummering(exerciseFollowup).ok,false);
assert.equal(api.recordLillebekkKontrollpakke('trafikk','be_om_trafikkfaglig_kontrollpakke',packageReason).ok,false);
assert.equal(api.recordLillebekkKontrollplan(planReason).ok,false);
assert.equal(api.recordLillebekkElinSvarmoteSvar('skolevei','krever_trafikkfaglig_dokumentasjon',manager3Reason).ok,false);
assert.equal(api.recordLillebekkElinSvarmoteReferat(manager3Plan).ok,false);
assert.equal(api.recordLillebekkSvarnotat('avvent_supplering_og_ny_ledervurdering',responseMemoReason).ok,false);
assert.equal(api.recordLillebekkSvarrundeStart().ok,false);
assert.equal(api.recordLillebekkSvarvurdering('utbygger','returner_for_trafikk_og_va_kontroll',svarReason).ok,false);
assert.equal(api.recordLillebekkUtkast('utbygger',requestReason).ok,false);
assert.equal(api.recordLillebekkSuppleringsgjennomgang('trafikk','returner_trafikk_med_konkret_mangelliste',supReason).ok,false);
assert.equal(api.recordLillebekkSuppleringsmatrise(supPlan).ok,false);
assert.equal(api.getLillebekkNyLedervurderingModel(),null);
assert.equal(api.recordLillebekkNyLedervurdering('returner_for_supplering',newLeaderReason).ok,false);
assert.equal(api.recordLillebekkLeder2Oppgave('trafikk','ettersporr_trafikkgrunnlag',taskReason).ok,false);
assert.equal(api.recordLillebekkLeder2Oppfolgingsnotat(leaderRecommendation).ok,false);
assert.equal(api.getLillebekkKontrollresultatModel(),null);
assert.equal(api.recordLillebekkResultatMottak().ok,false);
assert.equal(api.recordLillebekkResultatvurdering('ganglinje','registrer_kontrollbehov_for_ganglinje',resultatReason).ok,false);
assert.equal(api.recordLillebekkBeslutningsgrunnlag(decisionRecommendation).ok,false);
assert.equal(api.getLillebekkKontrollbilagModel(),null);
assert.equal(api.recordLillebekkKontrollFunn('ganglinje','krev_samordnet_skoleveikontroll',kontrollReason).ok,false);
assert.equal(api.recordLillebekkKontrollprotokoll(kontrollRecommendation).ok,false);
assert.equal(api.getLillebekkFagsvarModel(),null);
assert.equal(api.recordLillebekkFagsvarIntake().ok,false);
assert.equal(api.recordLillebekkFagsvarAssessment('trafikk','bestill_trafikkontroll',fagReason).ok,false);
assert.equal(api.recordLillebekkFagsvarFollowup(fagRecommendation).ok,false);
assert.equal(api.getLillebekkLeaderReviewModel(),null);
assert.equal(api.recordLillebekkLeaderReturn().ok,false);
assert.equal(api.recordLillebekkLeaderResponse('skolevei','trafikkfag',leaderReason).ok,false);
assert.equal(api.recordLillebekkCorrectedMemo(correctedRecommendation).ok,false);
assert.equal(api.getLillebekkSaksframleggModel(),null);
assert.equal(api.recordLillebekkComparison('skolevei_tidskrav','avklar_forst',reasons.skolevei_tidskrav).ok,false);
assert.equal(api.recordLillebekkSaksframlegg(recommendation).ok,false);
console.log('Lillebekk saksframlegg: source trace, professional controls, memo versions, access and approvals verified');
