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
world.addFlag(caseId,'stormwater_unsecured_in_plan',{
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

// Access and jurisdiction boundaries.
activeRole={role_key:'butikkmedarbeider'};
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
