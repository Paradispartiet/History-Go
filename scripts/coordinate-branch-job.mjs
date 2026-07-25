import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = 'agent/history-v5-5-religion-curation';
const domainId = 'his_religion_reformasjon_livssyn';
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const conceptPath = path.join(historyDir, 'concepts_historie_canonical_v5_5.json');
const theoryPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const emnePath = path.join(historyDir, 'emner_historie_canonical_v4_5.json');
const readinessPath = path.join(reportDir, 'historie-v5-5-readiness.json');
const commandLogPath = path.join(reportDir, 'religion-reformasjon-livssyn-curation-command.log');
const validationPath = path.join(reportDir, 'religion-reformasjon-livssyn-curation-validation.txt');
const resultPath = path.join(reportDir, 'religion-reformasjon-livssyn-curation-result.json');
const A = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(commandLogPath, 'Historie V5.5 – Religion, reformasjon og livssyn\n');
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, env: process.env });
  fs.appendFileSync(commandLogPath, `\n$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`);
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
  return result.stdout || '';
}

const curation = {
  con_his_disiplin: { label: 'religiøs disiplin', type: 'institutional_practice_concept', group: 'institution', definition: 'Praksiser for å forme tro, moral og atferd gjennom forkynnelse, undervisning, tilsyn, kirketukt, ritualer og sanksjoner i religiøse institusjoner og lokalsamfunn.' },
  con_his_dissenter: { label: 'dissenter', type: 'legal_status_concept', group: 'minority', definition: 'En person som tilhører eller praktiserer et kristent trossamfunn utenfor den etablerte statskirken, særlig som historisk rettslig og administrativ kategori.' },
  con_his_dissentere: { label: 'dissentersamfunn', type: 'religious_community_concept', group: 'movement', definition: 'Organiserte religiøse fellesskap utenfor statskirken, formet av lovgivning, migrasjon, nettverk, møtepraksis og kamp om trosfrihet.' },
  con_his_forkristne: { label: 'førkristen religion', type: 'historical_religion_concept', group: 'religion', definition: 'Religiøse forestillinger, ritualer, kultsteder og sosiale praksiser før kristendommens institusjonelle dominans i et avgrenset område.' },
  con_his_hverdagsliv: { label: 'hverdagsliv', type: 'social_history_concept', group: 'practice', definition: 'Gjentatte praksiser i hjem, arbeid, nabolag og fritid der normer, ressurser, kjønn, tro og makt blir levd, forhandlet og endret.' },
  con_his_kjonn: { label: 'kjønn', type: 'social_category_concept', group: 'practice', definition: 'Historisk skiftende kategorier, normer og maktrelasjoner knyttet til kropp, identitet, arbeid, familie, seksualitet og sosial posisjon.' },
  con_his_konfesjonalisering: { label: 'konfesjonalisering', type: 'institutional_process_concept', group: 'institution', definition: 'Prosessen der religiøs lære, statlig styring, kirkeorganisasjon, undervisning og sosial disiplin kobles for å forme tydeligere konfesjonelle samfunn.' },
  con_his_kristning: { label: 'kristning', type: 'religious_change_concept', group: 'change', definition: 'En langvarig og ujevn prosess der kristne ritualer, institusjoner, normer og identiteter etableres, forhandles og blandes med eldre praksiser.' },
  con_his_lekmannsbevegelse: { label: 'lekmannsbevegelse', type: 'collective_action_concept', group: 'movement', definition: 'Religiøs mobilisering ledet av ikke-ordinerte aktører gjennom møter, forkynnelse, foreninger, trykksaker og omsorgsarbeid, ofte i spenning med kirkelig embete.' },
  con_his_levd_religion: { label: 'levd religion', type: 'practice_concept', group: 'practice', definition: 'Religion slik den praktiseres, erfares og fortolkes i hverdagen, inkludert ritualer, kropp, hjem, arbeid, materialitet og lokale tilpasninger.' },
  con_his_livssyn: { label: 'livssyn', type: 'worldview_concept', group: 'plurality', definition: 'En sammenhengende eller praktisk orientering om menneske, virkelighet, mening, moral og livsførsel, religiøs eller ikke-religiøs.' },
  con_his_livssynspluralisme: { label: 'livssynspluralisme', type: 'plurality_concept', group: 'plurality', definition: 'Historisk sameksistens og institusjonell håndtering av flere religiøse og ikke-religiøse livssyn med ulik størrelse, status og offentlig innflytelse.' },
  con_his_migrasjon: { label: 'migrasjon', type: 'mobility_process_concept', group: 'network', definition: 'Flytting av mennesker mellom steder over kortere eller lengre tid, formet av arbeid, familie, tvang, politikk, religion, nettverk og rettslig status.' },
  con_his_minoriteter: { label: 'minoriteter', type: 'relational_group_concept', group: 'minority', definition: 'Grupper som i en bestemt historisk sammenheng har mindre demografisk, institusjonell eller politisk makt enn en dominerende befolkning eller norm.' },
  con_his_nettverk: { label: 'nettverk', type: 'relational_concept', group: 'network', definition: 'Relasjoner mellom personer, organisasjoner og steder som formidler informasjon, tillit, ressurser, mobilisering og praksiser over tid.' },
  con_his_offentlighet: { label: 'offentlighet', type: 'public_sphere_concept', group: 'public', definition: 'Arenaer, medier og institusjoner der saker gjøres synlige, diskuteres og gis kollektiv betydning, med historisk skiftende adgang og makt.' },
  con_his_orden: { label: 'religiøs orden', type: 'institutional_order_concept', group: 'institution', definition: 'Et normativt og institusjonelt system som organiserer lære, ritual, embete, medlemskap og legitim religiøs praksis.' },
  con_his_pietisme: { label: 'pietisme', type: 'religious_movement_concept', group: 'movement', definition: 'En protestantisk fornyelsesretning som vektla personlig omvendelse, bibellesning, moralsk liv, fellesskap og praktisk fromhet.' },
  con_his_pluralisme: { label: 'religiøs pluralisme', type: 'plurality_concept', group: 'plurality', definition: 'Samtidig tilstedeværelse av flere religiøse tradisjoner og organisasjoner, med varierende rettigheter, autoritet, kontakt og konflikt.' },
  con_his_politikk: { label: 'politikk', type: 'power_process_concept', group: 'public', definition: 'Prosesser der bindende beslutninger, ressurser, rettigheter og kollektive mål forhandles, vedtas, gjennomføres og bestrides.' },
  con_his_reformasjon: { label: 'reformasjon', type: 'religious_political_change_concept', group: 'change', definition: 'Omformingen av vestlig kristendom på 1500-tallet som endret lære, kirkeorganisasjon, eiendom, ritual, kongemakt og religiøst hverdagsliv.' },
  con_his_religion: { label: 'religion', type: 'historical_category', group: 'religion', definition: 'Historisk skiftende forestillinger, praksiser, institusjoner og materialiteter knyttet til det hellige, kosmologi, ritual, moral og fellesskap.' },
  con_his_religioner: { label: 'religionsmangfold', type: 'plurality_concept', group: 'plurality', definition: 'Tilstedeværelsen av flere religiøse tradisjoner, praksisformer og organisasjoner i samme samfunn eller område.' },
  con_his_religios: { label: 'religiøs norm', type: 'normative_concept', group: 'practice', definition: 'En forventning om tro, ritual, moral, kropp eller livsførsel som begrunnes religiøst og håndheves gjennom institusjoner, fellesskap eller selvdisiplin.' },
  con_his_sekularisering: { label: 'sekularisering', type: 'historical_process_concept', group: 'change', definition: 'Ujevne prosesser der religiøse institusjoners myndighet, deltakelse eller samfunnsfunksjoner endres, differensieres eller svekkes uten at religion nødvendigvis forsvinner.' },
  con_his_sekularitet: { label: 'sekularitet', type: 'institutional_cultural_condition', group: 'plurality', definition: 'Historisk bestemte ordninger og forestillinger som regulerer forholdet mellom religion, stat, offentlighet og ikke-religiøse livssyn.' },
  con_his_statskirke: { label: 'statskirke', type: 'church_state_institution_concept', group: 'institution', definition: 'En kirke med formelle rettslige, økonomiske og administrative bånd til staten og en særstilling i styring, ritualer og offentlig liv.' },
  con_his_transnasjonale: { label: 'transnasjonale religionsnettverk', type: 'network_concept', group: 'network', definition: 'Religiøse forbindelser som krysser statsgrenser gjennom personer, organisasjoner, misjon, penger, medier, ideer og autoritetsstrukturer.' },
  con_his_trosfrihet: { label: 'trosfrihet', type: 'rights_concept', group: 'minority', definition: 'Retten til å ha, endre, praktisere eller avstå fra religion og livssyn, historisk avgrenset av lov, institusjoner og andres rettigheter.' },
  con_his_vekkelse: { label: 'vekkelse', type: 'religious_mobilization_concept', group: 'movement', definition: 'En intens periode med religiøs forkynnelse, omvendelse og organisering som kan skape nye fellesskap, praksiser og konflikter.' }
};
const relations = {
  institution: { broader: ['religion'], related: ['statskirke','konfesjonalisering','religiøs disiplin'], distinguish: ['levd religion'] },
  minority: { broader: ['minoriteter'], related: ['trosfrihet','dissenter','dissentersamfunn'], distinguish: ['religiøs pluralisme'] },
  movement: { broader: ['vekkelse'], related: ['pietisme','lekmannsbevegelse','dissentersamfunn'], distinguish: ['statskirke'] },
  religion: { broader: ['religion'], related: ['førkristen religion','kristning','religionsmangfold'], distinguish: ['livssyn'] },
  practice: { broader: ['levd religion'], related: ['hverdagsliv','kjønn','religiøs norm'], distinguish: ['religiøs orden'] },
  change: { broader: ['religion'], related: ['kristning','reformasjon','sekularisering'], distinguish: ['konfesjonalisering'] },
  plurality: { broader: ['livssynspluralisme'], related: ['religiøs pluralisme','religionsmangfold','sekularitet'], distinguish: ['statskirke'] },
  network: { broader: ['nettverk'], related: ['migrasjon','transnasjonale religionsnettverk','offentlighet'], distinguish: ['statskirke'] },
  public: { broader: ['offentlighet'], related: ['politikk','sekularitet','trosfrihet'], distinguish: ['levd religion'] }
};
const narrower = {
  religion: ['førkristen religion','kristning','reformasjon','levd religion','religionsmangfold'],
  livssynspluralisme: ['religiøs pluralisme','religionsmangfold','sekularitet'],
  vekkelse: ['pietisme','lekmannsbevegelse','dissentersamfunn'],
  statskirke: ['religiøs orden','religiøs disiplin','konfesjonalisering'],
  nettverk: ['transnasjonale religionsnettverk'],
  minoriteter: ['dissenter']
};
const misuse = {
  institution: (l)=>`Å behandle «${l}» som en ensartet og fullt gjennomført ordning uten å skille formell lære, institusjonell kapasitet, lokal praksis og motstand.`,
  minority: (l)=>`Å bruke «${l}» som en tidløs identitet uten å avgrense lovstatus, selvidentifikasjon, institusjonell makt og historisk kontekst.`,
  movement: (l)=>`Å omtale «${l}» som én samlet aktør uten å undersøke ledelse, lokale miljøer, nettverk, kjønn og interne konflikter.`,
  religion: (l)=>`Å projisere et moderne og enhetlig religionsbegrep på «${l}» uten å analysere samtidige kategorier, ritualer, institusjoner og materialitet.`,
  practice: (l)=>`Å slutte fra norm eller lære til «${l}» uten kilder til faktisk praksis, erfaring og sosial variasjon.`,
  change: (l)=>`Å framstille «${l}» som et øyeblikkelig og fullstendig brudd uten å undersøke kontinuitet, lokal variasjon og ulike endringstempo.`,
  plurality: (l)=>`Å bruke «${l}» som synonym for likestilling uten å undersøke rettigheter, ressurser, representasjon og institusjonell asymmetri.`,
  network: (l)=>`Å påstå at «${l}» forklarer spredning eller mobilisering uten å dokumentere konkrete forbindelser, formidlere, retning og tidsforløp.`,
  public: (l)=>`Å behandle «${l}» som åpent for alle uten å undersøke adgang, medier, makt, sensur og uformelle eksklusjoner.`
};
const concepts = readJson(conceptPath);
const byId = new Map(concepts.map(x=>[x.concept_id,x]));
if(Object.keys(curation).length!==30) throw new Error(`Expected 30 concepts, got ${Object.keys(curation).length}`);
for(const [id,s] of Object.entries(curation)){const c=byId.get(id);if(!c)throw new Error(`Missing ${id}`);c.label=s.label;c.definition=s.definition;c.concept_type=s.type;c.historical_scope='cross_period_context_dependent';c.common_misuse=[misuse[s.group](s.label)];c.status='canonical_v5_5';}
const idByLabel=new Map(concepts.map(c=>[c.label,c.concept_id]));
const ids=(labels,self)=>unique(labels.map(l=>{const id=idByLabel.get(l);if(!id)throw new Error(`Unknown relation ${l}`);return id;})).filter(id=>id!==self);
for(const [id,s] of Object.entries(curation)){const c=byId.get(id),r=relations[s.group];c.broader_concepts=ids(r.broader,id);c.narrower_concepts=ids(narrower[s.label]||[],id);c.related_concepts=ids(r.related,id);c.distinguish_from=ids(r.distinguish,id);}
writeJson(conceptPath,concepts);

const theoryCuration={
 theory_his_religion_reformasjon_dissentere_trosfrihet_og_minoriteter:{type:'middle_range_model',definition:'En modell for å følge hvordan lovgivning, statskirkelig privilegium, organisering og offentlig debatt formet dissenteres og religiøse minoriteters adgang til trosutøvelse, medlemskap og sivile rettigheter.',limitations:['Formell trosfrihet sier ikke alene hvordan lokale myndigheter, arbeidsgivere, familier og institusjoner praktiserte eller begrenset rettighetene.','Dissenter- og minoritetskategorier kan være administrative betegnelser som ikke fullt ut samsvarer med aktørenes egen identitet eller praksis.']},
 theory_his_religion_reformasjon_forkristne_religioner_og_kristning:{type:'middle_range_model',definition:'En modell for å undersøke kristning som en ujevn prosess av institusjonsbygging, ritualendring, maktforhandling og blanding mellom eldre og kristne praksiser.',limitations:['Kristne tekster om førkristen religion er ofte sene og polemiske og må kontrolleres mot arkeologiske og materielle spor.','Kristne symboler eller kirker dokumenterer ikke alene full omvendelse eller ensartet praksis i befolkningen.']},
 theory_his_religion_reformasjon_livssyn_sekularitet_og_offentlighet:{type:'theory_framework',definition:'Et rammeverk for å analysere hvordan religiøse og ikke-religiøse livssyn får adgang, autoritet og synlighet i offentligheten under historisk skiftende sekulære ordninger.',limitations:['Sekularitet er ikke fravær av religion, men en bestemt regulering av religionens plass og må avgrenses institusjonelt og historisk.','Synlighet i offentligheten kan ikke brukes som direkte mål på utbredelse, personlig tro eller likeverdig innflytelse.']},
 theory_his_religion_reformasjon_pietisme_vekkelse_og_lekmannsbevegelse:{type:'historiographical_tradition',definition:'En historiografisk tradisjon som undersøker pietisme, vekkelser og lekmannsbevegelser som religiøs mobilisering, sosial organisering, kunnskapspraksis og utfordring av embetskirkelig autoritet.',limitations:['Vekkelsesbevegelser varierer lokalt og internt; teologiske programtekster kan ikke stå som belegg for alle deltakeres praksis.','Sammenfall med demokratisering eller organisasjonsvekst dokumenterer ikke en enkel årsak uten konkrete nettverk og tidsforløp.']},
 theory_his_religion_reformasjon_reformasjon_og_konfesjonalisering:{type:'middle_range_model',definition:'En modell for å analysere reformasjonen gjennom endringer i lære, eiendom, ritual, kirkeorganisasjon, kongemakt, skole og sosial disiplin, samt kontinuitet i lokal praksis.',limitations:['Reformatoriske vedtak må skilles fra gjennomføring og mottak; endringstempoet varierte mellom institusjoner, regioner og sosiale grupper.','Konfesjonalisering kan overvurdere statlig og kirkelig kontroll dersom uformell praksis, forhandling og motstand ikke undersøkes.']},
 theory_his_religion_reformasjon_religion_kjonn_og_hverdagsliv:{type:'theory_framework',definition:'Et rammeverk for å undersøke hvordan religiøse normer, ritualer og institusjoner formet kjønn, familie, kropp, arbeid og autoritet, og hvordan disse ble forhandlet i hverdagen.',limitations:['Normative tekster og religiøse idealer dokumenterer ikke alene faktisk kjønnet praksis eller erfaring.','Kjønn må analyseres sammen med klasse, alder, familieposisjon og institusjonell rolle for å unngå å gjøre kvinner eller menn til ensartede grupper.']},
 theory_his_religion_reformasjon_religion_migrasjon_og_transnasjonale_nettverk:{type:'middle_range_model',definition:'En modell for å følge hvordan migrasjon og transnasjonale nettverk flytter religiøse aktører, autoriteter, penger, tekster, ritualer og organisasjonsformer mellom steder.',limitations:['Lik religiøs praksis på flere steder beviser ikke direkte kontakt; forbindelser, formidlere og retning må dokumenteres.','Migrasjon endrer både avsender- og mottakermiljøer, men ikke alle migranter deltar likt i religiøse nettverk eller institusjoner.']},
 theory_his_religion_reformasjon_religion_politikk_og_offentlighet:{type:'theory_framework',definition:'Et rammeverk for å analysere hvordan religion inngår i legitimering, lovgivning, mobilisering og offentlig konflikt, og hvordan politiske institusjoner regulerer religiøse aktører og uttrykk.',limitations:['Religiøst språk i politikk kan være tro, strategi, konvensjon eller flere ting samtidig og krever aktør- og kontekstanalyse.','Formelle kirke–stat-relasjoner forklarer ikke alene uformell makt, medieinnflytelse eller lokal religiøs mobilisering.']},
 theory_his_religion_reformasjon_sekularisering_og_livssynspluralisme:{type:'theory_framework',definition:'Et rammeverk for å undersøke sekularisering som differensiering og endret autoritet, samtidig med vekst i religions- og livssynsmangfold, nye organisasjoner og nye former for tro.',limitations:['Sekularisering er ikke én lineær eller universell prosess og må måles gjennom spesifikke institusjoner, praksiser og tidsserier.','Lavere medlemskap eller deltakelse dokumenterer ikke nødvendigvis mindre religiøs betydning i identitet, politikk eller hverdagsliv.']},
 theory_his_religion_reformasjon_statskirke_disiplin_og_religios_orden:{type:'middle_range_model',definition:'En modell for å analysere hvordan statskirke, embeter, lovverk, skole, ritualer og kirketukt forsøkte å produsere religiøs orden og lydighet i lokalsamfunn.',limitations:['Formelt statskirkelig monopol må skilles fra faktisk trospraksis, lokale forhandlinger og skjult dissens.','Disiplinerende kilder overrepresenterer konflikter og regelbrudd og kan ikke alene beskrive normal hverdagspraksis.']}
};
const theories=readJson(theoryPath),tById=new Map(theories.map(t=>[t.theory_id,t]));for(const[id,s]of Object.entries(theoryCuration)){const t=tById.get(id);if(!t)throw new Error(`Missing ${id}`);t.object_type=s.type;t.definition=s.definition;t.limitations=s.limitations;t.evidence_ready=false;t.status='canonical_v5_5';}writeJson(theoryPath,theories);

const models={
 em_his_religion_reformasjon_dissentere_trosfrihet_og_minoriteter:{core:['dissentersamfunn','dissenter','trosfrihet','minoriteter','statskirke','religiøs pluralisme','sekularitet','offentlighet'],sub:['livssynspluralisme','religiøs disiplin','politikk','nettverk','migrasjon','levd religion','religiøs norm','reformasjon']},
 em_his_religion_reformasjon_forkristne_religioner_og_kristning:{core:['førkristen religion','kristning','religion','religiøs norm','religiøs orden','levd religion','landskap','ritual'],sub:['reformasjon','religionsmangfold','statskirke','hverdagsliv','kjønn','makt','materialitet','kontinuitet']},
 em_his_religion_reformasjon_livssyn_sekularitet_og_offentlighet:{core:['livssyn','sekularitet','offentlighet','livssynspluralisme','religiøs pluralisme','religionsmangfold','trosfrihet','politikk'],sub:['sekularisering','statskirke','minoriteter','nettverk','levd religion','religiøs norm','migrasjon','religion']},
 em_his_religion_reformasjon_pietisme_vekkelse_og_lekmannsbevegelse:{core:['pietisme','vekkelse','lekmannsbevegelse','religiøs mobilisering','nettverk','statskirke','religiøs disiplin','offentlighet'],sub:['dissenter','dissentersamfunn','trosfrihet','kjønn','hverdagsliv','levd religion','politikk','migrasjon']},
 em_his_religion_reformasjon_reformasjon_og_konfesjonalisering:{core:['reformasjon','konfesjonalisering','statskirke','religiøs orden','religiøs disiplin','kristning','politikk','offentlighet'],sub:['kontinuitet','brudd','levd religion','hverdagsliv','kjønn','makt','trosfrihet','religionsmangfold']},
 em_his_religion_reformasjon_religion_kjonn_og_hverdagsliv:{core:['religion','kjønn','hverdagsliv','levd religion','religiøs norm','religiøs disiplin','familie','makt'],sub:['statskirke','pietisme','vekkelse','minoriteter','trosfrihet','livssyn','offentlighet','religiøs pluralisme']},
 em_his_religion_reformasjon_religion_migrasjon_og_transnasjonale_nettverk:{core:['religion','migrasjon','transnasjonale religionsnettverk','nettverk','religionsmangfold','minoriteter','livssynspluralisme','offentlighet'],sub:['trosfrihet','dissentersamfunn','levd religion','politikk','sekularitet','kjønn','hverdagsliv','religiøs pluralisme']},
 em_his_religion_reformasjon_religion_politikk_og_offentlighet:{core:['religion','politikk','offentlighet','statskirke','trosfrihet','sekularitet','religiøs pluralisme','religiøs orden'],sub:['minoriteter','nettverk','religiøs mobilisering','livssyn','sekularisering','religiøs norm','makt','dissentersamfunn']},
 em_his_religion_reformasjon_sekularisering_og_livssynspluralisme:{core:['sekularisering','livssynspluralisme','sekularitet','religiøs pluralisme','religionsmangfold','livssyn','trosfrihet','offentlighet'],sub:['statskirke','minoriteter','migrasjon','nettverk','levd religion','politikk','hverdagsliv','religiøs norm']},
 em_his_religion_reformasjon_statskirke_disiplin_og_religios_orden:{core:['statskirke','religiøs disiplin','religiøs orden','konfesjonalisering','politikk','religiøs norm','trosfrihet','dissenter'],sub:['reformasjon','pietisme','vekkelse','hverdagsliv','levd religion','minoriteter','offentlighet','makt']}
};
const emners=readJson(emnePath),eById=new Map(emners.map(e=>[e.emne_id,e]));for(const[id,m]of Object.entries(models)){const e=eById.get(id);if(!e)throw new Error(`Missing ${id}`);for(const l of [...m.core,...m.sub])if(!idByLabel.has(l))throw new Error(`${id} unknown ${l}`);e.core_concepts=m.core;e.key_concepts=m.core.slice(0,8);e.sub_concepts=m.sub;e.keywords=unique([...m.core,...m.sub]);}writeJson(emnePath,emners);
const invalid=['dissentere','førkristne','religioner','religiøs','orden','transnasjonale'];for(const id of Object.keys(models)){const e=eById.get(id),used=[...A(e.core_concepts),...A(e.sub_concepts),...A(e.key_concepts),...A(e.keywords)];const bad=invalid.filter(x=>used.includes(x));if(bad.length)throw new Error(`${id} retains ${bad}`);}
const validator=path.join(root,'tools/validate-historie-religion-reformasjon-livssyn.mjs');if(!fs.existsSync(validator))throw new Error('Missing religion domain validator');run(process.execPath,[validator]);run(process.execPath,['tools/validate-historie-v5.mjs','--write']);let readiness=readJson(readinessPath),domain=A(readiness.domains).find(x=>x.domain_id===domainId);if(!domain?.freeze_ready||domain.issue_counts.emner||domain.issue_counts.concepts||domain.issue_counts.theories)throw new Error(`Not freeze ready ${JSON.stringify(domain)}`);
const contextDir=path.join(root,'data/quiz/production_context/historie');if(fs.existsSync(contextDir)){for(const file of fs.readdirSync(contextDir).filter(n=>n.endsWith('.json')).sort()){const target=path.basename(file,'.json');run(process.execPath,['scripts/build-quiz-production-context.mjs','--category','historie','--target',target,'--output',path.join('data/quiz/production_context/historie',file)]);}}
run('npm',['run','audit:quiz-production-context']);run('npm',['run','audit:quiz-theory-binding']);run('npm',['run','test:quiz-production']);run('npm',['run','knowledge:canonical:write']);run('npm',['run','knowledge:canonical:check']);run('npm',['run','knowledge:legacy:check']);run(process.execPath,['tools/validate-historie-v5.mjs','--write']);run('git',['diff','--check']);
readiness=readJson(readinessPath);domain=A(readiness.domains).find(x=>x.domain_id===domainId);if(!domain?.freeze_ready)throw new Error('Lost freeze ready');const result={version:'historie-v5.5-religion-curation-1',generated_at:new Date().toISOString(),domain_id:domainId,status:'CURATED_FREEZE_READY',concepts_curated:Object.keys(curation).length,theories_curated:Object.keys(theoryCuration).length,emner_corrected:Object.keys(models).length,domain_readiness:domain,global_quality_issue_totals:readiness.quality_issue_totals,global_v6_allowed:readiness.v6_allowed};writeJson(resultPath,result);const validation=['Historie V5.5 – Religion, reformasjon og livssyn','Status: CURATED_FREEZE_READY',`Begreper kuratert: ${result.concepts_curated}`,`Teoriobjekter kuratert: ${result.theories_curated}`,`Emner korrigert: ${result.emner_corrected}`,`Domene freeze_ready: ${domain.freeze_ready}`,`Domene kvalitetsfeil: emner=${domain.issue_counts.emner}, begreper=${domain.issue_counts.concepts}, teorier=${domain.issue_counts.theories}`,`Global V6 tillatt: ${readiness.v6_allowed}`].join('\n')+'\n';fs.writeFileSync(validationPath,validation);fs.appendFileSync(commandLogPath,`\n${validation}`);
for(const f of ['religion-reformasjon-livssyn-curation-labels.txt','religion-reformasjon-livssyn-curation-audit.txt'])fs.rmSync(path.join(reportDir,f),{force:true});fs.rmSync('scripts/coordinate-branch-job.mjs',{force:true});const rr=process.env.RUNNER_REPORT_DIR;if(rr){const ep=path.join('.git','info','exclude');fs.mkdirSync(path.dirname(ep),{recursive:true});const rule=`/${rr.replaceAll('\\','/')}/`,existing=fs.existsSync(ep)?fs.readFileSync(ep,'utf8'):'';if(!existing.split(/\r?\n/).includes(rule))fs.appendFileSync(ep,`${existing.endsWith('\n')||!existing?'':'\n'}${rule}\n`);}
run('git',['config','user.name','github-actions[bot]']);run('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);run('git',['add','-A']);run('git',['commit','-m','Curate religion reformation and worldview domain']);run('git',['push','origin',`HEAD:${branch}`]);console.log(validation);
