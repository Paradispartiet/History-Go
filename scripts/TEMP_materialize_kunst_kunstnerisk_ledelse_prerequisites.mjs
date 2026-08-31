import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const hash = (rel) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex');
const must = (condition, message) => { if (!condition) throw new Error(`PRECHECK: ${message}`); };

const ROLE = 'kunst_kunstnerisk_ledelse';
const MODEL = 'data/Civication/roleModels/kunst/kunst_kunstnerisk_ledelse.json';
const GRAMMAR = 'data/Civication/workGrammars/kunst/kunst_kunstnerisk_ledelse.json';
const PLAN = 'data/Civication/mailPlans/kunst/kunst_kunstnerisk_ledelse_plan.json';
const TYPES = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const locked = {
  'data/Civication/roleModels/kunst/kunstnerisk_leder.json': '5485abfdffadfc08ec19100b41eb4761fa06b8d09f60d6528aa1967ac50ba5ab',
  'data/Civication/kunstCareerLifeEvidence.json': '28293d7f0cf9cad60a1ca2dbd4b9a7b2cf7438dfccaa6008fb6d21c689d1e214',
  'data/badges/kunst.json': '73be0497520bb801c6367d1907e8c76a20ad05b7ed0d21ef9ea2a81c59ba19f0',
  [GRAMMAR]: 'eee3dd3e05b7707bf6765a1bb37e09e9be774631a900d8ea4250cb5d7c8be3ab',
  [MODEL]: '7993a5fde3075fc32d0f34aef2aec6ec35de0242ed0fc6afcafa83fc1d1cce91',
  'data/Civication/roleModels/manifest.json': 'e2527ba7fd6dad02fae7ce062edd99736365ea076137dd98b423ee1ad3e912c4'
};
for (const [rel, expected] of Object.entries(locked)) must(hash(rel) === expected, `${rel} drifted`);
must(!fs.existsSync(path.join(root, PLAN)), `${PLAN} already exists`);
for (const type of TYPES) must(!fs.existsSync(path.join(root, `data/Civication/mailFamilies/kunst/${type}/${ROLE}_${type}.json`)), `${type} catalog already exists`);

const grammar = read(GRAMMAR);
must(grammar.schema === 'civication_work_grammar_v2' && grammar.role_scope === ROLE, 'wrong grammar identity');
must(grammar.practice_stories.length === 5 && grammar.task_families.length === 6 && grammar.quality_axes.length === 6, 'grammar editorial contract changed');
must(!grammar.actor_grammar && !grammar.persistent_work_object_contract, 'grammar was already deepened');

const actors = [
  ['liv_institusjonsdirektor_kunstledelse', 'Liv', 'institusjonsdirektør', 'program_og_portefoljebord', 'Liv holder det delegerte institusjonsmandatet, etterspør et beslutningsklart programgrunnlag og kobler kunstnerisk retning til styrevedtak, økonomi og offentlig ansvar. Hun gjør premissene synlige uten å redusere faglig uenighet til lydighet eller personlig lojalitet.', 'Liv kan avklare delegasjon, budsjettgrense og hvilke saker som må videre til styret. Hun kan ikke gjøre en foreløpig faglig anbefaling til vedtak, instruere spilleren til å skjule habilitet eller overføre direktør- og styremyndighet til kunstnerisk ledelse gjennom uformell støtte.'],
  ['amina_seniorkurator_kunstledelse', 'Amina', 'seniorkurator', 'faglig_vurderingsrom', 'Amina bærer en selvstendig kuratorisk motstemme og prøver programmets kriterier mot verk, kontekst, representasjon og institusjonens uttalte retning. Hun gjør faglig dissens produktiv ved å kreve at både flertall, mindretall og endrede vurderinger blir bevart i beslutningssporet.', 'Amina kan levere faglige vurderinger, utfordre kriterier og be om at uenighet refereres presist. Hun har ikke veto over den kunstneriske porteføljen, og spilleren kan heller ikke bruke lederrollen til å omskrive hennes motstemme, diktere konserveringsfaglige inngrep eller gjøre personlig smak til regel.'],
  ['eirik_produksjonsleder_kunstledelse', 'Eirik', 'produksjonsleder', 'budsjett_og_mandatspunkt', 'Eirik undersøker om programforslaget lar seg realisere gjennom rettigheter, teknikk, bemanning, tidsplan og kostnad. Han viser hvor en sterk kunstnerisk idé skaper reelle avhengigheter og gjør forskjellen mellom løsbart produksjonsarbeid og et premiss som må tilbake til programvurdering.', 'Eirik kan dokumentere realiserbarhet, reservere kapasitet innen delegert plan og stoppe en uavklart produksjonsbestilling. Han kan ikke overta den kunstneriske prioriteringen eller gi budsjettfullmakt; spilleren kan ikke behandle produksjonens varsler som et bekvemt veto eller bestille arbeid uten avklart mandat.'],
  ['sara_kunstnerkontakt_kunstledelse', 'Sara', 'kunstnerkontakt', 'offentlig_begrunnelse_og_evaluering', 'Sara holder dialogen med kunstnere og berørte prosjektteam sammen når en vurdering endres, et forslag må revideres eller et avslag skal forklares. Hun beskytter skillet mellom å invitere til utvikling og å love programplass, og bringer relasjonelle følger tilbake til porteføljen.', 'Sara kan formidle dokumentert status, hente avklaringer og avtale en ny dialog innen det beslutningssporet som faktisk finnes. Hun kan ikke love opptak, skjule at kriterier er endret eller gjøre relasjonell nærhet til myndighet; spilleren kan ikke bruke henne til press, private fordeler eller uformelle forhåndstilsagn.']
].map(([id, name, role, place, fn, authority]) => ({ id, name, role, fictional: true, fictional_scenario_actor: true, canonical_person_ref: null, function: fn, authority_relation: authority, workplace_ids: [place] }));
const places = [
  ['program_og_portefoljebord', 'Program- og porteføljebordet', 'Her registreres forslag, mandat, kriterier, relasjoner og porteføljevirkning før kunstnerisk prioritering får status som anbefaling eller beslutning.'],
  ['faglig_vurderingsrom', 'Det faglige vurderingsrommet', 'Her prøves verk, kontekst, representasjon og motstemmer mot eksplisitte kriterier, med spor for habilitet og reell faglig uenighet.'],
  ['budsjett_og_mandatspunkt', 'Budsjett- og mandatspunktet', 'Her kobles rettigheter, produksjon, bemanning, tid og kostnad til riktig beslutningsnivå før ressurser bindes.'],
  ['offentlig_begrunnelse_og_evaluering', 'Offentlig begrunnelse og evaluering', 'Her forklares valget, berørte parter får korrekt status, og faktisk gjennomføring og respons føres tilbake til porteføljen uten å omskrive opprinnelige kriterier.']
].map(([id, name, fn]) => ({ id, name, function: fn }));

Object.assign(grammar, {
  actor_grammar: actors.map(({id, name, role, workplace_ids}) => ({ id, name, role, workplace_ids })),
  place_grammar: places,
  persistent_work_object_contract: { id: 'kunstnerisk_programportefolje', description: 'Et vedvarende, versjonert programgrunnlag som beholder forslag, kriterier, habilitet, faglige motstemmer, budsjett, beslutningsstatus, begrunnelse og evaluering gjennom hele arbeidsløkken.', states: ['registrert', 'under_faglig_vurdering', 'venter_pa_avklaring', 'beslutningsklart', 'besluttet', 'under_gjennomforing', 'evaluert'], handoff_rule: 'Neste aktør overtar synlig status, eier, ventepunkt og uløst risiko; ingen overlevering sletter tidligere kriterier eller motstemmer.' },
  rhythm_contract: { loop: 'registrering -> vurdering -> waiting/venting på habilitet, rettigheter eller budsjett -> handoff -> beslutning -> gjennomføring -> evaluering -> rework', waiting_states: ['habilitetsavklaring', 'rettigheter', 'produksjonsestimat', 'direktor_eller_styrebeslutning'], rework_rule: 'Endrede premisser gjenåpner den berørte delen av porteføljen med nytt versjonsspor.' },
  knowledge_dependencies: [{ id: 'history_go_kunst_institusjon_og_kanon', badge_id: 'kunst', use: 'Gir historisk og institusjonell kontekst for kriterier, kanon, representasjon og offentlig begrunnelse, men gir verken ansettelse, programmyndighet eller fasit.' }],
  day_one_contract: { entry: 'appointment_required', first_object: 'kunstnerisk_programportefolje', first_task: 'Registrer ett programforslag med mandat, kriterier, habilitet og avhengigheter før vurdering.' },
  mail_generation_contract: { required_mail_types: TYPES, role_scope: ROLE, no_generic_fallback: true }
});
write(GRAMMAR, grammar);

const model = read(MODEL);
Object.assign(model, {
  core_narrative: [model.core_narrative[0], 'Rollen bygger en etterprøvbar programportefølje der forslag, kriterier, habilitet, kostnad, motstemmer, beslutning og offentlig begrunnelse kan følges uten at kunstnerisk autonomi blir grenseløs myndighet.'],
  work_life: { daily_work: ['Registrerer og avgrenser programforslag mot mandat, kriterier og habilitet.', 'Leder faglig vurdering og bevarer begrunnede motstemmer.', 'Kobler prioriteringer til produksjon, rettigheter, budsjett og korrekt beslutningsnivå.', 'Følger gjennomføring og offentlig respons tilbake til et versjonert evalueringsspor.'], responsibilities: ['kunstnerisk kvalitet og programhelhet', 'synlig habilitet og faglig begrunnelse', 'ressursansvar og realistisk gjennomføring', 'korrekt myndighetsgrense og offentlig etterprøvbarhet'], work_environment: ['Arbeidet veksler mellom portefølje, faglig vurdering, mandat-/budsjettavklaringer og offentlig begrunnelse.'], status_position: ['Tillit kommer av sammenhengende faglig skjønn som tåler motstemmer, ressursgrenser og innsyn; status gir ikke privat eller ubegrenset programmyndighet.'], workplaces: places.map(p => p.id) },
  career_path: { entry_from: ['Dokumentert kunstfaglig praksis og formell tilsetting eller utnevnelse; Kunst-badge alene gir ikke rollen.'], progression_to: ['Større portefølje-, program- eller institusjonsansvar innen uttrykkelig delegasjon.'], possible_promotions: ['Utvidet programansvar i en større institusjon.', 'Direktørrolle når styrings-, økonomi- og personalmandat følger med.'], possible_exits: ['Tilbake til kuratorisk eller kunstnerisk spesialistpraksis.', 'Overgang til rådgivning, undervisning eller prosjektbasert programarbeid.'], career_risks: ['Personlig smak, nettverk eller prestisje kan fortrenge eksplisitte kriterier.', 'Uformelle løfter kan binde ressurser før riktig organ har besluttet.'] },
  required_knowledge: { education_basis: ['Kunstfaglig fordypning, institusjonsforståelse og dokumentert ledelsespraksis.'], skills: ['programstrategi', 'faglig vurdering', 'habilitet', 'ressursprioritering', 'kunstnerdialog', 'offentlig begrunnelse'], category_knowledge: ['Kunstinstitusjonens historie, kanondannelse, representasjon, mandat og forholdet mellom kunstnerisk autonomi og offentlig ansvar.'], history_go_badges: ['kunst'], place_connections: places.map(p => p.id), people_connections: actors.map(a => a.id) },
  authority_boundary: { may: grammar.authority_boundary.may, may_not: grammar.authority_boundary.may_not },
  challenges: [{ id: 'autonomi_vs_etterprovbarhet', title: 'Autonomi mot etterprøvbarhet', description: 'Kunstnerisk skjønn må være reelt uten å bli fritatt fra habilitet, ressursansvar, mandat og begrunnelse.', pressure: 'autonomi_vs_institusjonell_legitimitet', affects: ['quality', 'trust', 'risk'] }],
  dilemmas: [{ id: 'sterkt_verk_svak_prosess', title: 'Sterkt verk, svak prosess', setup: 'Et overbevisende forslag har nær relasjon, uavklart kostnad og betydelig porteføljevirkning.', choice_axis: 'personlig_overbevisning_vs_sporbar_vurdering', consequence_axis: 'kortsiktig_programgevinst_vs_langsiktig_legitimitet', mail_hooks: TYPES }],
  related_people: actors,
  related_places: places,
  mail_integration: { role_scope: ROLE, mail_profile: ROLE, can_feed_mail_types: TYPES, recommended_mail_families: TYPES.map(t => `kunstnerisk_ledelse_${t}`), role_model_refs_supported: true }
});
write(MODEL, model);

const manifest = read('data/Civication/roleModels/manifest.json');
must(!manifest.files.includes(MODEL), 'model unexpectedly present in manifest');
manifest.files.push(MODEL);
manifest.files.sort((a, b) => a.localeCompare(b));
write('data/Civication/roleModels/manifest.json', manifest);

const familyIds = {
  job: 'kunstnerisk_ledelse_programportefolje_job', people: 'kunstnerisk_ledelse_profesjonelle_relations', conflict: 'kunstnerisk_ledelse_styre_og_autonomi', story: 'kunstnerisk_ledelse_identitet_og_legitimitet', event: 'kunstnerisk_ledelse_endret_forutsetning', micro: 'kunstnerisk_ledelse_rask_mandatavklaring', followup: 'kunstnerisk_ledelse_portefolje_oppfolging', knowledge: 'kunstnerisk_ledelse_historie_go_kunstinstitusjon', consequence: 'kunstnerisk_ledelse_beslutning_etterspill'
};
const specs = {
  job: [['programforslag', 'Liv', actors[0].id, places[0].id, 'Nytt forslag mangler rettighets- og habilitetsspor'], ['habilitet', 'Amina', actors[1].id, places[1].id, 'Nær faglig relasjon i hovedprogrammet'], ['budsjett', 'Eirik', actors[2].id, places[2].id, 'Hovedsatsingen fortrenger to avtalte prosjekter'], ['evaluering', 'Sara', actors[3].id, places[3].id, 'Evalueringen må beholde opprinnelige kriterier']],
  people: [['liv_mandat', 'Liv', actors[0].id, places[0].id, 'Hva er anbefaling, og hva er faktisk besluttet?'], ['amina_kriterier', 'Amina', actors[1].id, places[1].id, 'Mindretallets vurdering mangler i grunnlaget'], ['eirik_realiserbarhet', 'Eirik', actors[2].id, places[2].id, 'Produksjonen trenger et reelt ventepunkt'], ['sara_kunstnerdialog', 'Sara', actors[3].id, places[3].id, 'Revisjonsinvitasjonen blir lest som et løfte']],
  conflict: [['tryggere_program', 'Liv', actors[0].id, places[0].id, 'Styret ønsker et tryggere program etter kritikken']],
  story: [['lederidentitet', 'Amina', actors[1].id, places[1].id, 'Er retning det samme som din smak?']],
  event: [['endrede_rettigheter', 'Eirik', actors[2].id, places[2].id, 'Rettighetene endrer et foreløpig programvalg']],
  micro: [['kan_vi_kalle_det_besluttet', 'Liv', actors[0].id, places[2].id, 'Kan vi kalle programmet besluttet nå?']],
  followup: [['rework_etter_estimat', 'Eirik', actors[2].id, places[0].id, 'Nytt estimat må tilbake til porteføljen']],
  knowledge: [['institusjon_og_kanon', 'Amina', actors[1].id, places[1].id, 'Historien utfordrer kriteriene, men bestemmer ikke valget']],
  consequence: [['offentlig_etterspill', 'Sara', actors[3].id, places[3].id, 'Avslagene og kritikken trenger et synlig svar']]
};
const scene = (type, [slug, from, peopleRef, placeId, subject], index) => {
  const summary = `Den kunstneriske programporteføljen står i et konkret ${type}-punkt: ${subject.toLowerCase()}. Forslag, mandat, kriterier, habilitet, faglige motstemmer, produksjonsavhengigheter, budsjett og beslutningsstatus peker ikke samme vei. Du må oppdatere det vedvarende arbeidsobjektet uten å omskrive tidligere vurderinger, love mer enn riktig organ har besluttet eller gjøre personlig tillit til formell myndighet.`;
  return { id: `kunstnerisk_ledelse_${type}_${slug}_${String(index + 1).padStart(3, '0')}`, mail_type: type, mail_family: familyIds[type], role_scope: ROLE, phase: index < 1 ? 'forenoon' : 'workday', priority: 130 - index, from, people_ref: peopleRef, place_id: placeId, subject, summary,
    situation: ['Porteføljen viser både det opprinnelige forslaget, kriteriene og hvem som eier neste avklaring.', 'En rask løsning vil gi fremdrift, men kan skjule habilitet, kostnad, motstemme eller faktisk beslutningsstatus.', 'Du må velge et grep som gjør venting, overlevering og mulig omarbeiding synlig for neste aktør.'],
    task_domain: 'kunstnerisk_programledelse', competency: 'etterprovbart_faglig_skonn', pressure: 'kunstnerisk_ambisjon_vs_mandat_og_ressurser', choice_axis: 'sporbar_avklaring_vs_uformell_lukking', consequence_axis: 'institusjonell_legitimitet_vs_skjult_risiko', narrative_arc: slug,
    choices: [
      { id: 'A', label: `Avklar ${slug} i porteføljen`, reply: 'Jeg beholder kriterier, motstemmer og nåværende status i porteføljen, markerer det konkrete ventepunktet og sender bare den avgrensede beslutningen til riktig eier.', effect: 1, tags: ['sporbarhet', 'mandat', 'portefolje'], feedback: 'Arbeidet går ikke nødvendigvis raskere, men neste aktør ser hva som er vurdert, hva som fortsatt venter, hvem som faktisk kan beslutte og hvilke følger en endring får for programhelheten. Kunstnerisk skjønn blir tydeligere fordi begrunnelsen tåler både ressursgrenser og faglig uenighet.', effects: { stats: { quality: 2, trust: 2, risk: -2, energy: -1 } } },
      { id: 'B', label: `Lukk ${slug} gjennom uformell enighet`, reply: 'Jeg behandler den sterke faglige støtten som tilstrekkelig beslutning og rydder bort ventepunktet slik at produksjon og kommunikasjon kan gå videre nå.', effect: -1, tags: ['uformell_myndighet', 'tempo', 'risiko'], feedback: 'Den lokale flyten ser bedre ut, men porteføljen mister skillet mellom anbefaling og vedtak. Motstemmer, habilitet eller kostnad blir vanskeligere å finne igjen, og kunstnere, produksjon og ledelse kan handle på ulike versjoner av det samme løftet. Det svekker både faglig legitimitet og institusjonell tillit.', effects: { stats: { status: 1, quality: -2, trust: -2, risk: 3 } } }
    ] };
};
for (const type of TYPES) write(`data/Civication/mailFamilies/kunst/${type}/${ROLE}_${type}.json`, { schema: 'civication_mail_family_catalog_v1', version: 1, category: 'kunst', role_scope: ROLE, mail_type: type, families: [{ id: familyIds[type], purpose: `Trene ${type} gjennom den vedvarende kunstneriske programporteføljen.`, learning_focus: ['mandat', 'faglig begrunnelse', 'ressurser', 'sporbarhet'], mails: specs[type].map((s, i) => scene(type, s, i)) }] });

const sequenceTypes = ['job', 'people', 'knowledge', 'job', 'people', 'conflict', 'job', 'people', 'event', 'micro', 'job', 'people', 'followup', 'story', 'consequence', 'job'];
write(PLAN, { schema: 'civication_mail_plan_v1', version: 1, id: 'kunst_kunstnerisk_ledelse_foundation_v1', category: 'kunst', role_scope: ROLE, title: 'Kunstnerisk ledelse', description: 'Seksten steg fra første programforslag til sporbar evaluering av den samme porteføljen.', arc: { from: 'Formelt utnevnt leder som arver et uavklart programgrunnlag.', to: 'Leder som kan holde kunstnerisk retning, mandat, ressurser, motstemmer og offentlig begrunnelse sammen.', core_questions: ['Hva er faglig anbefaling, og hva er besluttet?', 'Hvilke premisser må bli stående i porteføljen?', 'Når må en endring gjenåpne vurderingen?'] }, outcome_rules: { promoted: { completion_ratio_gte: 1, score_gte: 2, strikes_lte: 0 }, fired: { stability_values: ['FIRED'], strikes_gte: 3, score_lte: -3 }, stagnated: { autonomy_delta: -10, stability: 'STAGNATED', add_branch_flags: ['career_stagnated', 'kunstnerisk_ledelse_mandatssvikt'] } }, sequence: sequenceTypes.map((type, i) => ({ step: i + 1, type, phase: i < 3 ? 'intro' : i < 10 ? 'advanced' : 'mastery', step_goal: `Føre porteføljen gjennom ${type} med synlig mandat, status, ventepunkt og neste eier.`, allowed_families: [familyIds[type]], fallback_types: [] })) });

for (const [rel, expected] of Object.entries(Object.fromEntries(Object.entries(locked).filter(([rel]) => ![GRAMMAR, MODEL, 'data/Civication/roleModels/manifest.json'].includes(rel))))) must(hash(rel) === expected, `${rel} changed during materialization`);
console.log('PASS: materialized Kunstnerisk ledelse prerequisite foundation without touching protected legacy evidence.');
