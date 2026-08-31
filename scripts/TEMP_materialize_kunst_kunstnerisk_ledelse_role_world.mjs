#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const KEY = 'kunst/kunst_kunstnerisk_ledelse';
const ROLE = 'kunst_kunstnerisk_ledelse';
const WORLD = 'data/Civication/roleWorlds/kunst/kunst_kunstnerisk_ledelse.json';
const INDEX = 'data/Civication/roleWorlds/index.json';
const CHECKLIST = 'data/Civication/roleWorldAuthoringChecklist.json';
const THEMES = 'data/Civication/roleWorldThemeBank.json';
const READINESS = 'data/Civication/roleWorldRolloutReadiness.json';
const PLAN = 'data/Civication/mailPlans/kunst/kunst_kunstnerisk_ledelse_plan.json';
const MODEL = 'data/Civication/roleModels/kunst/kunst_kunstnerisk_ledelse.json';
const GRAMMAR = 'data/Civication/workGrammars/kunst/kunst_kunstnerisk_ledelse.json';
const family = (type) => `data/Civication/mailFamilies/kunst/${type}/${ROLE}_${type}.json`;
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const read = (rel) => JSON.parse(readText(rel));
const write = (rel, value) => { const abs = path.join(ROOT, rel); fs.mkdirSync(path.dirname(abs), { recursive: true }); fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`); };
const sha = (rel) => crypto.createHash('sha256').update(readText(rel)).digest('hex');
const assert = (ok, message) => { if (!ok) throw new Error(`PRECHECK: ${message}`); };
const same = (a, b, message) => assert(JSON.stringify(a) === JSON.stringify(b), message);

const protectedPaths = [PLAN, MODEL, GRAMMAR, ...['job','people','conflict','story','event','micro','followup','knowledge','consequence'].map(family)];
const protectedHashes = Object.fromEntries(protectedPaths.map((rel) => [rel, sha(rel)]));
assert(!fs.existsSync(path.join(ROOT, WORLD)), 'Role World already exists');
const readiness = read(READINESS);
const row = (readiness.rollout_queue || []).find((item) => item.key === KEY);
assert(row?.classification === 'rollout_ready', `classification drifted: ${row?.classification}`);
same(row.authored_work_required, ['situated_reputation'], 'Role World must close exactly one gap');
assert(row.cross_role_need === 'candidate_when_shared_work_is_real', 'cross-role policy drifted');

const grammar = read(GRAMMAR);
same(grammar.work_loops, ['mandat -> mål -> programvalg -> ressursprioritering -> gjennomforing -> evaluering','forslag -> habilitet -> faglig vurdering -> budsjett -> beslutning -> offentlig begrunnelse'], 'work loops drifted');
same(grammar.authority_boundary.may_not, ['overstyre styre- eller direktørmyndighet','omgå habilitetskrav','bruke institusjonen til private interesser','diktere konserveringsinngrep uten faglig grunnlag'], 'authority boundary drifted');
assert(grammar.persistent_work_object_contract.id === 'kunstnerisk_programportefolje', 'persistent object drifted');
const plan = read(PLAN);
assert(plan.sequence.length === 16, 'plan length drifted');
const model = read(MODEL);
same(model.related_people.map((p) => p.id), ['liv_institusjonsdirektor_kunstledelse','amina_seniorkurator_kunstledelse','eirik_produksjonsleder_kunstledelse','sara_kunstnerkontakt_kunstledelse'], 'actor foundation drifted');
for (const person of model.related_people) assert(person.fictional === true && person.fictional_scenario_actor === true && person.canonical_person_ref === null, `${person.id} fictional boundary drifted`);

const sourceRefs = [
  `${family('job')}#kunstnerisk_ledelse_job_programforslag_001`, `${family('job')}#kunstnerisk_ledelse_job_habilitet_002`,
  `${family('job')}#kunstnerisk_ledelse_job_budsjett_003`, `${family('job')}#kunstnerisk_ledelse_job_evaluering_004`,
  `${family('people')}#kunstnerisk_ledelse_people_liv_mandat_001`, `${family('people')}#kunstnerisk_ledelse_people_amina_kriterier_002`,
  `${family('people')}#kunstnerisk_ledelse_people_eirik_realiserbarhet_003`, `${family('people')}#kunstnerisk_ledelse_people_sara_kunstnerdialog_004`,
  `${family('conflict')}#kunstnerisk_ledelse_conflict_tryggere_program_001`, `${family('story')}#kunstnerisk_ledelse_story_lederidentitet_001`,
  `${family('event')}#kunstnerisk_ledelse_event_endrede_rettigheter_001`, `${family('micro')}#kunstnerisk_ledelse_micro_kan_vi_kalle_det_besluttet_001`,
  `${family('followup')}#kunstnerisk_ledelse_followup_rework_etter_estimat_001`, `${family('knowledge')}#kunstnerisk_ledelse_knowledge_institusjon_og_kanon_001`,
  `${family('consequence')}#kunstnerisk_ledelse_consequence_offentlig_etterspill_001`
];
for (const ref of sourceRefs) { const [rel,id] = ref.split('#'); assert(read(rel).families.flatMap((f) => f.mails || []).some((m) => m.id === id), `missing ${ref}`); }

const themeIds = ['professional_culture','class_power','bureaucratic_power','loyalty_up_down','care_vs_efficiency','shame_reputation','status_anxiety','public_private_leakage','local_knowledge_vs_system','public_attention','invisible_work','emotional_labor'];
const bank = read(THEMES);
const validThemes = new Set(bank.themes.map((t) => t.id));
for (const id of themeIds) assert(validThemes.has(id), `unknown theme ${id}`);
assert(!bank.reference_profiles[KEY], 'theme profile already exists');

const audiences = [
  ['director_and_board','mandate_and_governance_standing',['klart skille mellom anbefaling og vedtak','synlig risiko, ressursvirkning og riktig beslutningsorgan'],'Standing hos direktør og styre kan ikke gi spilleren styre-, direktør- eller budsjettmyndighet eller tillatelse til å skjule habilitet.'],
  ['curatorial_team','curatorial_process_standing',['eksplisitte kriterier og reell faglig motstemme','at lederens smak ikke omskrives til uangripelig fagregel'],'Faglig standing kan ikke gi rett til å slette mindretall, omgå habilitet eller diktere konserveringsfaglige inngrep.'],
  ['production_delivery','realizability_and_handoff_standing',['realistiske rettigheter, kostnader, kapasitet og ventepunkter','versjonert handoff når premisser endres'],'Produksjonstillit kan ikke bli kunstnerisk veto, og kunstnerisk standing kan ikke bestille arbeid uten avklart mandat og ressurs.'],
  ['artists_and_project_teams','artist_process_standing',['korrekt status uten uformelle forhåndsløfter','rettferdig dialog om revisjon, avslag og endrede premisser'],'Relasjonell standing hos kunstnere kan ikke love programplass, gjøre nærhet til habilitet eller binde institusjonen før beslutning.'],
  ['funders_and_partners','resource_accountability_standing',['etterprøvbar bruk av midler og avhengigheter','at finansiering ikke skjult bestemmer kunstnerisk innhold'],'Partnerstanding kan ikke overføre programmyndighet, gjøre finansiering til skjult sensur eller sette innkjøps- og habilitetskrav til side.'],
  ['public_and_critics','public_legitimacy_standing',['begrunnelse som viser kriterier, tradeoffs og endringer','evne til selvkritikk uten å gjøre kritikk til automatisk veto'],'Offentlig standing kan ikke erstatte mandat, og oppmerksomhet eller kritikk kan verken gi programrett eller kreve skjult sensur.'],
  ['private_relations','private_role_containment_standing',['nærvær uten kuratorisk rang eller møteform','at ansvar dokumenteres og blir på institusjonen når arbeidsdagen slutter'],'Profesjonell standing kan ikke brukes som privat rang, styringsrett eller krav om at nære relasjoner absorberer institusjonens emosjonelle restarbeid.']
].map(([id,standing_axis,cares_about,cannot_grant]) => ({id,standing_axis,cares_about,cannot_grant}));
const slowAxes = audiences.map((a) => ({ id: a.standing_axis, meaning: `Situert og langsom tillit hos ${a.id}; kan divergere fra alle andre publikum og må knyttes til konkrete porteføljehandlinger.`, runtime_binding: 'editorial_only_until_governed' }));

const cases = [
  ['første forslag','Et lovende hovedprosjekt ankommer uten fullstendig rettighets-, kostnads- eller habilitetsgrunnlag; porteføljen må vise både kunstnerisk potensial og hva som faktisk mangler før vurderingen får status.'],
  ['habilitet','En nær faglig relasjon er kandidat til en sentral programplass, og en synlig uavhengig vurdering må opprettes uten at relasjonen skjules eller kandidaten behandles som skyldig.'],
  ['kuratorisk dissens','Amina mener hovedretningen bygger på for smale kriterier; mindretallet må bevares som reell faglig evidens uten å gjøre uenigheten til personlig illojalitet.'],
  ['programhelhet','Den dyre satsingen fortrenger to avtalte prosjekter; hvert tap, avhengighetsbrudd og løfte må bli synlig før ambisjon kalles helhetlig retning.'],
  ['styrepress','Etter offentlig kritikk ønsker styret et tryggere program; økonomisk og institusjonell risiko må skilles fra ren uenighet med kunstnerisk innhold.'],
  ['produksjonsestimat','Eiriks estimat viser at rettigheter, bemanning og teknikk ikke passer den foreløpige tidsplanen; beslutningen må vente uten at venting blir lest som manglende vilje.'],
  ['kunstnerdialog','Sara oppdager at en invitasjon til revisjon blir lest som løfte om programplass; status må korrigeres tydelig uten å gjøre dialogen straffende eller kald.'],
  ['finansiering','En partner tilbyr nødvendig støtte mot synlighet og tematisk innramming; bidrag, programkriterier og redaksjonell uavhengighet må skilles før avtalen formes.'],
  ['endrede rettigheter','Rettighetshaver endrer vilkårene etter foreløpig utvalg; bare den berørte delen skal gjenåpnes, men porteføljevirkningen må vurderes på nytt.'],
  ['offentlig begrunnelse','Programmet annonseres og kritiseres for lukkede nettverk; institusjonen må vise kriterier, habilitet og faktiske endringer uten å avsløre fortrolig materiale.'],
  ['gjennomføring','Produksjonen oppdager at et sentralt verk krever en løsning som presser både budsjett og konserveringsfaglig grense; kunstnerisk ledelse må avgrense eget mandat.'],
  ['etterspill','Avslåtte prosjektteam sammenligner begrunnelser og finner ulikt språk; porteføljen må skille saklig forskjell fra inkonsistent prosess og åpne relevant korrigering.'],
  ['historisk perspektiv','History Go-kontekst om institusjon og kanon utfordrer hva kriteriene gjør synlig; kunnskapen skal forbedre spørsmålet uten å bestemme programvalget.'],
  ['evaluering','Faktisk gjennomføring, publikumssvar, kostnad og faglig læring føres tilbake til opprinnelige kriterier; evalueringen må tåle at noen publikums standing stiger mens andres faller.']
];
const phaseNames = ['morning','lunch','afternoon','evening'];
const phaseActions = [
  'Om morgenen registrerer du kilder, status, eier og usikkerhet før noen får bruke forslaget som beslutning eller løfte.',
  'Ved lunsj møter vurderingen et navngitt publikum som leser den gjennom egne interesser, erfaringer og institusjonelle grenser.',
  'Om ettermiddagen må porteføljen få en konkret handoff, beslutning, ventestatus eller avgrenset rework som neste aktør kan etterprøve.',
  'Om kvelden viser ettervirkningen hvem som bærer kostnaden, hvilken standing som faktisk endres, og hva som må bli igjen på arbeidsflaten.'
];
const consequenceTail = 'Dette er redaksjonell, situert Standing og ikke en global score; reaksjonen flytter aldri mandat, habilitet, budsjettfullmakt, programrett eller beslutningseierskap.';
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (let p = 0; p < 4; p += 1) {
    const [caseName,caseText] = cases[day - 1];
    const audience = audiences[(day + p - 1) % audiences.length];
    const ref = sourceRefs[((day - 1) * 4 + p) % sourceRefs.length];
    coverage.push({
      day, phase: phaseNames[p], beat_type: ['info','relationship','task','private_consequence'][p],
      summary: `Dag ${day}, ${phaseNames[p]} — ${caseName}: ${caseText} ${phaseActions[p]} Handlingen må bevare mandat, tidligere kriterier og synlig motstemme i den samme kunstneriske programporteføljen.`,
      standing_audience: audience.id,
      standing_consequence: `Dag ${day}/${phaseNames[p]}: ${audience.id} vurderer om du gjorde ${caseName} mer etterprøvbart uten å låne myndighet fra status, nærhet eller oppmerksomhet. Tilliten kan styrkes her og samtidig svekkes hos et annet publikum med legitime, ulike kriterier. ${consequenceTail}`,
      materialization_refs: [ref]
    });
  }
}
assert(coverage.length === 56 && new Set(coverage.map((b) => b.summary)).size === 56 && new Set(coverage.map((b) => b.standing_consequence)).size === 56, 'coverage uniqueness failed');
const uses = new Map(sourceRefs.map((r) => [r,0]));
for (const b of coverage) uses.set(b.materialization_refs[0], uses.get(b.materialization_refs[0]) + 1);
for (const [ref,count] of uses) assert(count >= 2, `${ref} underused`);

const recurring = model.related_people.map((p) => ({ id: `${p.id}_world`, social_function: p.function, class_position: p.role, status: `Situert profesjonell standing knyttet til ${p.workplace_ids[0]}.`, power_over_player: p.authority_relation, wants: 'At porteføljens status, kriterier, avhengigheter og neste eier er presise nok til at egen rolle kan utøves uten myndighetsglidning.', conceals: 'Eget press og egne interesser kan påvirke hva personen ønsker synlig, selv når innspillet er faglig legitimt.', speech_style: 'Presis, arbeidsnær og tydelig på forskjellen mellom faglig innspill, anbefaling og beslutning.', teaches_player: 'At profesjonell tillit følger etterprøvbare handlinger i en avgrenset relasjon og aldri blir generell popularitet eller fullmakt.' }));

const world = {
  schema:'civication_role_world_v1', version:1, category:'kunst', role_scope:ROLE,
  title:'Kunstnerisk ledelse — programportefølje, motstemmer og situert legitimitet', status:'role_world_complete',
  sociological_core:{ main_problem:'Å sette kunstnerisk retning gjennom et etterprøvbart institusjonelt program uten å gjøre personlig smak, nettverk, finansiering, publikumstrykk eller formell tittel til grenseløs myndighet.', description:'Role World-en lukker bare situated reputation rundt den eksisterende programporteføljen. Plan, scener, profesjonelle aktører, arbeidsflater, rytme og authority-grenser forblir authoritative og uendret.' },
  theme_ids:themeIds,
  social_environments:['Program- og porteføljebordet der forslag, kriterier, habilitet og porteføljevirkning får synlig status.','Det faglige vurderingsrommet der flertall og mindretall må være reelle spor, ikke en smakskonkurranse.','Budsjett- og mandatspunktet der rettigheter, produksjon og ressurser møter riktig beslutningsorgan.','Kunstnerdialogen der revisjon, foreløpig status og avslag må kommuniseres uten skjulte løfter.','Den offentlige begrunnelsen der kritikk, representasjon og institusjonell selvkritikk virker ulikt på ulike publikums standing.','Privatlivet der kunstnerisk identitet og offentlig oppmerksomhet må kunne legges fra seg uten at andre blir publikum, jury eller emosjonell buffer.'],
  recurring_people_archetypes:recurring, slow_axes:slowAxes,
  existing_work_continuity:{ runtime_binding:'existing_mail_plan_and_work_grammar', new_runtime_state:false, work_loops:grammar.work_loops, persistent_work_object:grammar.persistent_work_object_contract.id, canonical_surfaces:[MODEL,GRAMMAR,PLAN,...protectedPaths.slice(3)], rule:'Den eksisterende 16-stegs planen, ni mailtyper, fire profesjonelle aktører, fire arbeidsflater, programporteføljen og waiting/handoff/rework-rytmen forblir authoritative; Role World-en legger bare situert Standing rundt disse kildene.' },
  situated_reputation_model:{ global_score_allowed:false, audiences, authority_separation:'Standing uttrykker situert tillit og kan aldri gi styre-, direktør-, budsjett-, program-, innkjøps- eller konserveringsmyndighet, oppheve habilitet eller personvern, eller gjøre offentlig oppmerksomhet til mandat.', rule:'Standing kan divergere mellom direktør/styre, kuratorisk team, produksjon, kunstnere, partnere, offentlighet og privatliv uten å summeres til én global sosial score.' },
  history_go_affordance:{ source_ref:sourceRefs[13], knowledge_use:'Institusjons- og kanonhistorie brukes til å se hvilke kriterier, nettverk og fravær som former programmet, slik at spørsmålet kan forbedres før anbefalingen endres.', better_question:'Hvilke kunsthistoriske og institusjonelle premisser gjør dette verket, denne kunstneren eller denne formen synlig som kvalitet nå, hvilke relevante motstemmer eller fravær finnes, og hvem har faktisk myndighet til å endre programkriteriet?', authority_boundary:'History Go-kunnskap kan skjerpe kildekritikk og faglig begrunnelse, men kan ikke gi programplass, moderne tilgang, habilitet, budsjettfullmakt, konserveringsmyndighet eller rett til å sette direktør og styre til side.' },
  cross_role_link:{ status:'candidate_when_shared_work_is_real', materialized:false, new_runtime:false, companion_keys:['kunst/kunst_kuratering_og_program','kunst/kunst_utstillingsproduksjon'], rule:'Nærliggende Kunst-roller er plausible kompanjonger, men ingen ny cross-role runtime eller delt objekt opprettes før faktisk eierskap, handoff og authority er eksplisitt styrt.' },
  season:{days:14,day_phases:phaseNames,coverage},
  primary_threads:[
    {id:'proposal_habilitet_and_criteria',beat_refs:['1/morning','2/lunch','3/afternoon','4/evening','9/morning','14/afternoon']},
    {id:'director_board_and_mandate',beat_refs:['1/lunch','5/morning','5/lunch','8/afternoon','10/lunch','14/lunch']},
    {id:'production_budget_and_rework',beat_refs:['4/morning','6/morning','6/afternoon','9/afternoon','11/morning','14/morning']},
    {id:'artists_promises_and_aftermath',beat_refs:['2/evening','7/morning','7/lunch','7/afternoon','10/afternoon','12/lunch']},
    {id:'public_legitimacy_and_criticism',beat_refs:['5/afternoon','8/lunch','10/morning','10/evening','12/evening','14/evening']},
    {id:'history_canon_and_better_questions',beat_refs:['3/morning','8/morning','11/lunch','13/morning','13/lunch','13/afternoon']},
    {id:'private_role_containment',beat_refs:['1/evening','5/evening','8/evening','11/evening','13/evening','14/evening']}
  ],
  private_aftermath:[
    {id:'smak_uten_jury',beat_refs:['1/evening','3/evening'],meaning:'Privat smak kan deles uten at nær relasjon blir jury eller strategisk rådgiver.'},
    {id:'kritikk_uten_beredskap',beat_refs:['5/evening','10/evening'],meaning:'Offentlig kritikk kan bearbeides uten kontinuerlig privat kriseberedskap.'},
    {id:'lofte_som_ikke_var_lovet',beat_refs:['7/evening','12/evening'],meaning:'Relasjonelle følger kan erkjennes uten at privat skyld omskriver faktisk beslutningsstatus.'},
    {id:'institusjonshistorie_uten_rang',beat_refs:['8/evening','13/evening'],meaning:'Kunnskap og profesjonell status gir ingen privat rang eller fortolkningsmonopol.'},
    {id:'portefoljen_blir_pa_jobb',beat_refs:['11/evening','14/evening'],meaning:'Dokumentert ansvar kan overleveres og bli på institusjonen når sesongen slutter.'}
  ],
  delayed_consequences:[
    {id:'proposal_return',setup_ref:'1/morning',return_ref:'9/morning',meaning:'Det første rettighets- og habilitetssporet avgjør om endrede vilkår kan behandles uten historieskriving.'},
    {id:'dissent_return',setup_ref:'3/lunch',return_ref:'10/lunch',meaning:'Bevart kuratorisk motstemme avgjør om offentlig kritikk kan møtes med reell dokumentasjon.'},
    {id:'portfolio_cost_return',setup_ref:'4/morning',return_ref:'12/morning',meaning:'Tidlig synlig fortrengning avgjør om avslag kan forklares konsistent senere.'},
    {id:'board_pressure_return',setup_ref:'5/morning',return_ref:'10/afternoon',meaning:'Skillet mellom risiko og uenighet kommer tilbake i den offentlige begrunnelsen.'},
    {id:'estimate_return',setup_ref:'6/morning',return_ref:'11/afternoon',meaning:'Produksjonens tidlige ventepunkt beskytter senere authority- og konserveringsgrense.'},
    {id:'artist_promise_return',setup_ref:'7/morning',return_ref:'12/lunch',meaning:'Korrigert foreløpig status avgjør om etterspillet kan repareres uten nye løfter.'},
    {id:'history_question_return',setup_ref:'13/morning',return_ref:'14/afternoon',meaning:'Det historiske spørsmålet kommer tilbake som evaluering av kriterier, ikke fasit på programmet.'},
    {id:'private_containment_return',setup_ref:'1/evening',return_ref:'14/evening',meaning:'Tidlig avgrensning av rollen avgjør om sesongen kan avsluttes uten privat rang og beredskap.'}
  ],
  employment_conditions:['Kunstnerisk ledelse krever faktisk utnevnelse eller tilsetting; Kunst-badge og Standing gir verken jobb eller programmyndighet.','Program, budsjett, innkjøp, habilitet, rettigheter og konservering følger institusjonens organer og kan ikke materialiseres som global personlig fullmakt.','Utvidet myndighet krever uttrykkelig delegasjon og kan ikke oppstå gjennom nettverk, publikumssuksess, finansiering eller faglig anerkjennelse.'],
  professional_culture:['God kunstnerisk ledelse gjør kriterier, motstemmer, habilitet, ressurser og beslutningsstatus synlige uten å late som skjønn kan automatiseres.','Kunstnerisk autonomi er et institusjonelt ansvar, ikke frihet fra budsjett, etikk, styringsstruktur eller offentlig begrunnelse.','Relasjoner til kunstnere, kuratorer, partnere og offentlighet krever presis status; nærhet, kritikk og oppmerksomhet er aldri skjulte vedtak.'],
  materialization:{authored_dimensions:['situated_reputation'],no_new_runtime:true,existing_plan_preserved:true,existing_role_model_preserved:true,existing_people_foundation_preserved:true,existing_work_grammar_preserved:true,existing_persistent_work_preserved:true,existing_rhythm_preserved:true,cross_role_link_materialized:false,source_refs:sourceRefs}
};

write(WORLD, world);
const index = read(INDEX); assert(!index.roles.some((r) => r.category === 'kunst' && r.role_scope === ROLE), 'already indexed'); index.roles.push({category:'kunst',role_scope:ROLE,status:'role_world_complete',path:WORLD}); index.status = `${index.roles.length}_role_worlds_materialized`; write(INDEX,index);
const checklist = read(CHECKLIST); assert(!checklist.reference_worlds.includes(WORLD), 'already checklist reference'); checklist.reference_worlds.push(WORLD); write(CHECKLIST,checklist);
bank.reference_profiles[KEY] = themeIds; write(THEMES,bank);
for (const [rel,before] of Object.entries(protectedHashes)) assert(sha(rel) === before, `${rel} changed during materialization`);
console.log(JSON.stringify({role_world:WORLD,beats:coverage.length,audiences:audiences.length,sources:sourceRefs.length,index_status:index.status},null,2));
