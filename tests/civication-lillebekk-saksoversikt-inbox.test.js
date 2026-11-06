#!/usr/bin/env node
'use strict';
// SAKSOVERSIKT: only actual WorkWorld flags; no fabricated approvals,
// automated outcome, new story, or data writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,
  '../js/Civication/ui/CivicationInboxTopActionUI.js'),'utf8');
const earlyId='by_radgiver_lillebekk_early_analysis_case_001';
const formalId='by_radgiver_lillebekk_plan_case_001';

function preview(options={}) {
 const host={
   innerHTML:'',querySelectorAll(){return [];}
 };
 const active=options.active===undefined?{role_scope:'by_radgiver_plan'}:options.active;
 const records=options.records||{};
 const ctx={
  document:{
    readyState:'loading',
    addEventListener(){},
    getElementById(id){return id==='civiInbox'?host:null;}
  },
  window:{
    CivicationState:{getActivePosition(){return active;}},
    CivicationMailEngine:{getInbox(){return [];}},
    CivicationWorkWorld:{getWorkObject(id){return records[id]||null;}},
    addEventListener(){},
    setTimeout(){throw new Error('no delayed effects in deterministic rendering');}
  }
 };
 vm.runInNewContext(source,ctx,{filename:'CivicationInboxTopActionUI.js'});
 const api=ctx.window.CivicationInboxTopActionUI;
 const model=api.getLillebekkReviewModel();
 assert.equal(api.renderSections(),true);
 return {model,markup:host.innerHTML};
}
const blank=preview();
assert.equal(blank.model,null);
assert.ok(!blank.markup.includes('Lillebekk · saksoversikt'));
const early={
  work_object_id:earlyId,role_scope:'by_radgiver_plan',
  flags:['map_conflict_written_for_review','green_corridor_draft_requirement_proposed',
   'participation_record_missing','developer_formal_request_pending',
   'school_route_timing_unverified','material_risks_stated_for_politics']
};
const formal={
  work_object_id:formalId,role_scope:'by_radgiver_plan',
  flags:['early_map_conflict_documented','early_green_corridor_unsecured',
   'early_material_risks_visible','early_stormwater_unsecured'],
  status:'awaiting_approval'
};
const result=preview({records:{[earlyId]:early,[formalId]:formal}});
assert.equal(result.model.phase,'Formell saksforberedelse');
assert.equal(result.model.topics.length,7);
assert.equal(result.model.approved,false);
assert.ok(result.model.documented>0);
assert.ok(result.model.open>0);
const byTitle=new Map(result.model.topics.map(row=>[row.title,row]));
assert.equal(byTitle.get('Plankart og areal').status,'Faglig spor registrert');
assert.equal(byTitle.get('Grøntdrag').status,'Motstridende spor – avklar');
assert.equal(byTitle.get('Skolevei').status,'Åpent avvik');
assert.equal(byTitle.get('Medvirkning').status,'Åpent avvik');
assert.equal(byTitle.get('Overvann').status,'Åpent avvik');
assert.equal(byTitle.get('Utbyggerkontakt').status,'Faglig spor registrert');
assert.equal(byTitle.get('Faglig risiko i saksframlegget').status,'Faglig spor registrert');
assert.ok(result.markup.includes('Lillebekk · saksoversikt'));
assert.ok(result.markup.includes('Se faglige vurderinger og åpne avvik'));
assert.equal((result.markup.match(/class="civi-inbox-card"/g)||[]).length,7,
 'seven explicit areas, not generic extra mail');
assert.ok(result.markup.includes('ikke bekreftede bilag'));
assert.ok(result.markup.includes('gir ikke planvedtak eller ledergodkjenning'));
assert.equal(new Set(result.model.topics.map(row=>row.document)).size,7,
 'each discipline needs its own named document control');
assert.ok(result.model.topics.every(row=>row.document && row.check && row.consequence));
assert.equal(byTitle.get('Skolevei').document,
 'Trafikksikkerhetsvurdering og forslag til rekkefølgekrav');
assert.ok(byTitle.get('Skolevei').check.includes('hvem som utfører tiltak'));
assert.equal(byTitle.get('Grøntdrag').consequence,
 'Avviket må føres som uavklart i revisjonsgrunnlaget.');
assert.ok(byTitle.get('Plankart og areal').consequence.includes('kontrolleres mot bilag'));
assert.ok(result.markup.includes('Kontrollgrunnlag som må etterspørres eller leses:'));
assert.ok(result.markup.includes('Kontrollpunkt:'));
assert.ok(result.markup.includes('Neste arbeidsoppgave:'));
assert.ok(result.markup.includes('Faglig følge:'));
assert.ok(result.markup.includes('Saksbilag til gjennomgang (3)'));
assert.equal((result.markup.match(/data-exhibit-id=/g)||[]).length,3);
assert.equal((result.markup.match(/data-civi-lillebekk-exhibit="1"/g)||[]).length,9);
for(const ref of ['LBK-MERK-01','LBK-FAG-02','LBK-UTB-03']) {
 assert.ok(result.markup.includes(ref), 'concrete fictional case exhibit is visible');
}
assert.ok(result.markup.includes('ikke et ekte kommunalt dokument'));
assert.equal((result.markup.match(/data-civi-lillebekk-review="1"/g)||[]).length,14,
 'two legitimate revision notes per topic are available on a formal open case');
assert.ok(result.markup.includes('Registrert faglig spor betyr ikke at et dokument er kontrollert'));
assert.ok(!result.markup.includes('Godkjent av Elin'));
assert.ok(result.markup.indexOf('Lillebekk · saksoversikt')<
 result.markup.indexOf('Jobbmail'),'dossier appears before ordinary inbox history');
const afterRestart=preview({records:JSON.parse(JSON.stringify({[earlyId]:early,[formalId]:formal}))});
assert.equal(JSON.stringify(result.model),JSON.stringify(afterRestart.model),
 'state-backed review is deterministic after reload');

const earlyOnly=preview({records:{[earlyId]:early}});
assert.equal(earlyOnly.model.phase,'Tidlig saksarbeid');
assert.equal(earlyOnly.model.approved,false);
assert.equal(earlyOnly.model.canRevise,false);
assert.ok(!earlyOnly.markup.includes('data-civi-lillebekk-review="1"'),
 'no formal-case action buttons before formal case exists');
const laterRole=preview({active:{role_id:'film_tv_produksjonsassistent'},
 records:{[earlyId]:early,[formalId]:formal}});
assert.equal(laterRole.model,null,
 'case records from another occupation are not displayed to a different active role');
assert.ok(!laterRole.markup.includes('Lillebekk · saksoversikt'));
const roleViaId=preview({active:{role_id:'by_radgiver_plan'},records:{[formalId]:formal}});
assert.ok(roleViaId.model);
// The formal case is created with two unresolved facts even when no early work exists.
// These must not disappear into the generic «Ingen registrert vurdering» label.
const initialFormal=preview({records:{[formalId]:{
 work_object_id:formalId,role_scope:'by_radgiver_plan',status:'open',
 flags:['skolevei_ikke_dokumentert','politisk_grense_ikke_eksplisitt']
}}});
const initialTopics=new Map(initialFormal.model.topics.map(row=>[row.title,row]));
assert.equal(initialTopics.get('Skolevei').status,'Åpent avvik');
assert.equal(initialTopics.get('Faglig risiko i saksframlegget').status,'Åpent avvik');
assert.equal(initialFormal.model.open,7);
// If later work documents the subject while the old unresolved marker remains,
// the player sees a conflict to check, not a falsely approved outcome.
const documentedButNotReconciled=preview({records:{[formalId]:{
 work_object_id:formalId,role_scope:'by_radgiver_plan',
 flags:['skolevei_ikke_dokumentert','early_school_route_condition_proposed']
}}});
assert.equal(documentedButNotReconciled.model.topics.find(row=>row.title==='Skolevei').status,
 'Motstridende spor – avklar');
// Real accepted job offers use CivicationState.setActivePosition({
 // career_id, title, role_key, ...}) rather than the mail plan's role_scope.
const acceptedPosition=preview({active:{
 career_id:'by',title:'Arealplanlegger',role_key:'arealplanlegger'
},records:{[formalId]:formal}});
assert.ok(acceptedPosition.model,
 'Lillebekk is visible when the player actually accepts the Arealplanlegger job');
assert.ok(acceptedPosition.markup.includes('Lillebekk · saksoversikt'));
const differentPosition=preview({active:{
 career_id:'by',title:'Arkitekt',role_key:'arkitekt'
},records:{[formalId]:formal}});
assert.equal(differentPosition.model,null);
const noData=preview({active:{role_scope:'by_radgiver_plan'},
 records:{[formalId]:{work_object_id:formalId,flags:[],status:'open'}}});
assert.equal(noData.model.documented,0);
assert.equal(noData.model.open,7);
assert.ok(noData.model.topics.every(row=>row.status==='Ingen registrert vurdering'));
assert.ok(!noData.markup.includes('Faglig spor registrert'));
assert.ok(noData.model.topics.every(row=>row.consequence.includes('Ingen registrert vurdering')),
 'missing case material cannot be passed off as checked');
// The revision actions must write to the existing persisted WorkWorld object, not
// just look interactive. They must never erase an earlier unresolved issue.
const WorkWorld=require(path.resolve(__dirname,'../js/Civication/core/civicationWorkWorld.js'));
let saved={};
const store={getState(){return JSON.parse(JSON.stringify(saved));},
 setState(patch){saved={...saved,...patch};return this.getState();}};
const adapter=WorkWorld.createAdapter(store);
adapter.createWorkObject({
 work_object_id:formalId,kind:'plan_case',role_scope:'by_radgiver_plan',
 title:'Lillebekk formell plansak',status:'open',phase:'formal_review',
 flags:['skolevei_ikke_dokumentert','politisk_grense_ikke_eksplisitt']
},{event_id:'lillebekk_review_test_open',at:'2026-11-06T10:00:00Z'});
let activeRole={role_key:'arealplanlegger',title:'Arealplanlegger'};
const interactiveHost={innerHTML:'',querySelectorAll(){return [];}};
const liveCtx={
 document:{readyState:'loading',addEventListener(){},getElementById(id){return id==='civiInbox'?interactiveHost:null;}},
 window:{CivicationState:{getActivePosition(){return activeRole;}},
  CivicationMailEngine:{getInbox(){return [];}},CivicationWorkWorld:adapter,
  addEventListener(){},setTimeout(){throw new Error('no timers in deterministic revision test');}}
};
vm.runInNewContext(source,liveCtx,{filename:'CivicationInboxTopActionUI.js'});
const actions=liveCtx.window.CivicationInboxTopActionUI;
assert.equal(actions.getLillebekkReviewModel().canRevise,true);
const exhibits=actions.getLillebekkCaseExhibits(actions.getLillebekkReviewModel());
assert.equal(exhibits.length,3);
assert.ok(exhibits.every(e=>e.ref && e.sender && e.type && e.paragraphs.length>=2));
assert.ok(exhibits.every(e=>e.choices.length===3));
assert.equal(actions.recordLillebekkExhibitDecision('unknown-document','A').ok,false);
assert.equal(actions.recordLillebekkExhibitDecision('hanne-skolevei-01','D').ok,false);
assert.equal(actions.recordLillebekkExhibitDecision('hanne-skolevei-01','A').ok,true);
assert.equal(actions.recordLillebekkExhibitDecision('hanne-skolevei-01','B').ok,false,
 'an exhibit cannot silently overwrite a previous professional decision');
const hanneDecision=adapter.getWorkObject(formalId).history.find(
 e=>e.id==='lillebekk_bilag_hanne-skolevei-01_valg_v1');
assert.equal(hanneDecision.outcome,'skolevei_fagkontroll_bestilt_i_sak');
assert.ok(hanneDecision.note.includes('Fiktivt spillbilag LBK-MERK-01'));
assert.ok(hanneDecision.note.includes('ikke ekstern utsendelse'));
assert.ok(adapter.getWorkObject(formalId).flags.includes('skolevei_ikke_dokumentert'),
 'a fictional case exhibit cannot close a missing-evidence flag');
assert.equal(actions.getLillebekkCaseExhibits(actions.getLillebekkReviewModel())
  .find(e=>e.ref==='LBK-MERK-01').decided,true);
assert.equal(actions.recordLillebekkExhibitDecision('signe-grontdrag-01','C').ok,true);
assert.equal(actions.recordLillebekkExhibitDecision('ivar-rekkefolge-01','B').ok,true);
assert.equal(actions.getLillebekkCaseExhibits(actions.getLillebekkReviewModel())
 .filter(e=>e.decided).length,3);
assert.equal(adapter.getWorkObject('by_radgiver_lillebekk_approval_001'),null);

assert.equal(actions.recordLillebekkReviewAction('skolevei','kontrollbehov').ok,true);
let current=adapter.getWorkObject(formalId);
assert.ok(current.flags.includes('skolevei_ikke_dokumentert'));
assert.ok(current.flags.includes('lillebekk_revisjon_skolevei_kontrollbehov'));
const controlLog=current.history.find(x=>x.id==='lillebekk_revisjon_skolevei_kontrollbehov_v1');
assert.ok(controlLog?.note.includes('Trafikksikkerhetsvurdering'));
assert.ok(controlLog?.note.includes('ikke registrert mottatt eller verifisert'));
const historyCount=current.history.length;
assert.equal(actions.recordLillebekkReviewAction('skolevei','kontrollbehov').alreadyLogged,true);
assert.equal(adapter.getWorkObject(formalId).history.length,historyCount,
 'same control requirement cannot produce duplicate history');
assert.equal(actions.recordLillebekkReviewAction('skolevei','forbehold').ok,true);
current=adapter.getWorkObject(formalId);
assert.ok(current.flags.includes('lillebekk_revisjon_skolevei_forbehold'));
assert.ok(current.flags.includes('skolevei_ikke_dokumentert'));
assert.ok(current.flags.includes('politisk_grense_ikke_eksplisitt'));
assert.equal(current.status,'open');
assert.equal(adapter.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
assert.equal(actions.getLillebekkReviewModel().topics.find(t=>t.id==='skolevei').caveatLogged,true);
const savedCopy=JSON.parse(JSON.stringify(saved));
saved=savedCopy;
assert.equal(actions.getLillebekkReviewModel().topics.find(t=>t.id==='skolevei').reviewNeedLogged,true,
 'review log remains visible after serialize/reload');

assert.equal(actions.recordLillebekkDocumentAssessment('skolevei','mangelfull','Ingen dokumentasjon mottatt ennå').ok,false,
 'a conclusion without a logged document is forbidden');
assert.equal(actions.recordLillebekkDocumentReceipt('skolevei','x','y','kort').ok,false,
 'a receipt must carry a source reference, sender and content description');
assert.equal(actions.recordLillebekkDocumentReceipt('skolevei',
 'JOURNAL-2026-104','Trafikkfaglig avdeling',
 'Utkast til strekning og planlagt rekkefølge for trygg skolevei.').ok,true);
current=adapter.getWorkObject(formalId);
const receipt=current.history.find(x=>x.id==='lillebekk_dokument_skolevei_oppgitt_mottak_v1');
assert.equal(receipt?.outcome,'spilleroppgitt_ikke_verifisert');
assert.ok(receipt.note.includes('JOURNAL-2026-104'));
assert.ok(receipt.note.includes('Kilde og innhold er ikke verifisert'));
assert.equal(actions.recordLillebekkDocumentReceipt('skolevei',
 'JOURNAL-2026-999','En annen avsender','Et annet påstått bilag har kommet').ok,false,
 'later entries may not silently overwrite the traceable receipt');
assert.equal(actions.recordLillebekkDocumentAssessment('skolevei','verified',
 'Jeg godkjenner hele planvedtaket automatisk').ok,false,
 'no option may certify a document or political approval');
assert.equal(actions.recordLillebekkDocumentAssessment('skolevei','fagkontroll','for kort').ok,false);
assert.equal(actions.recordLillebekkDocumentAssessment('skolevei','mangelfull',
 'Utkastet mangler avklaring av ansvarlig tiltakshaver og frist før innflytting.').ok,true);
assert.equal(actions.recordLillebekkDocumentAssessment('skolevei','fagkontroll',
 'Be planjurist og trafikkfaglig ansvarlig kontrollere rekkefølgekravets utforming.').ok,true);
current=adapter.getWorkObject(formalId);
const assessments=current.history.filter(x=>x.id.startsWith('lillebekk_dokument_skolevei_vurdering_'));
assert.equal(assessments.length,2);
assert.equal(assessments[0].outcome,'mangelfull');
assert.equal(assessments[1].outcome,'fagkontroll');
assert.ok(current.flags.includes('skolevei_ikke_dokumentert'),
 'player assessment cannot erase the original missing-evidence marker');
assert.equal(current.status,'open');
assert.equal(adapter.getWorkObject('by_radgiver_lillebekk_approval_001'),null);
saved=JSON.parse(JSON.stringify(saved));
const journalModel=actions.getLillebekkReviewModel();
const schoolTopic=journalModel.topics.find(x=>x.id==='skolevei');
assert.equal(schoolTopic.receiptLogged,true);
assert.equal(schoolTopic.assessmentOutcome,'fagkontroll');
assert.ok(schoolTopic.assessmentNote.includes('Oversend til ansvarlig fagkontroll'));
assert.equal(actions.renderSections(),true);
assert.ok(interactiveHost.innerHTML.includes('JOURNAL-2026-104'));
assert.ok(interactiveHost.innerHTML.includes('data-civi-lillebekk-assess="1"'));
assert.equal((interactiveHost.innerHTML.match(/data-civi-lillebekk-receipt="1"/g)||[]).length,6,
 'receipt is registered in exactly one of seven subject areas');
assert.equal(actions.recordLillebekkReviewAction('unknown','forbehold').ok,false);
assert.equal(actions.recordLillebekkReviewAction('skolevei','approve').ok,false);
activeRole={role_key:'film_tv_produksjonsassistent'};
assert.equal(actions.recordLillebekkExhibitDecision('signe-grontdrag-01','A').ok,false,
 'another role cannot rewrite an existing exhibit assessment');
assert.equal(actions.recordLillebekkDocumentReceipt('grontdrag',
 'J-2026-55','Byøkolog Signe','En annen rapport skal føres i saken.').ok,false);
assert.equal(actions.recordLillebekkDocumentAssessment('skolevei','mangelfull',
 'Utenforstående rolle skal ikke kunne kommentere denne saken.').ok,false);
assert.equal(actions.recordLillebekkReviewAction('grontdrag','kontrollbehov').ok,false,
 'other roles cannot write to the Lillebekk case');
activeRole={role_key:'arealplanlegger'};
adapter.closeWorkObject(formalId,{event_id:'lillebekk_review_test_close',at:'2026-11-07T10:00:00Z',outcome:'closed_for_test'});
assert.equal(actions.recordLillebekkReviewAction('grontdrag','kontrollbehov').ok,false,
 'closed cases cannot be changed by the revision UI');
assert.equal(actions.getLillebekkCaseExhibits(actions.getLillebekkReviewModel()).length,0,
 'closed case has no active exhibit actions');
assert.equal(actions.recordLillebekkExhibitDecision('ivar-rekkefolge-01','C').ok,false);
assert.equal(actions.recordLillebekkDocumentReceipt('grontdrag',
 'J-2026-78','Byøkolog Signe','Forsøkt etterført bilag i lukket sak.').ok,false);
assert.equal(actions.recordLillebekkDocumentAssessment('skolevei','motstridende',
 'Vurdering etter at saken ble avsluttet er ikke tillatt.').ok,false);
console.log('Lillebekk saksoversikt: seven document controls and persistent bounded review decisions verified');
