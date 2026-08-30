#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const KEY = 'naeringsliv/mellomleder';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/mellomleder.json';
const INDEX_PATH = 'data/Civication/roleWorlds/index.json';
const CHECKLIST_PATH = 'data/Civication/roleWorldAuthoringChecklist.json';
const THEME_BANK_PATH = 'data/Civication/roleWorldThemeBank.json';
const READINESS_PATH = 'data/Civication/roleWorldRolloutReadiness.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/mellomleder_plan.json';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/kapitalforvalter.json';
const JOB_PATH = 'data/Civication/mailFamilies/naeringsliv/job/mellomleder_job.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/mellomleder_people.json';
const CONFLICT_PATH = 'data/Civication/mailFamilies/naeringsliv/conflict/mellomleder_conflict.json';
const STORY_PATH = 'data/Civication/mailFamilies/naeringsliv/story/mellomleder_story.json';
const CAPITAL_GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_finans_og_kapitalforvaltning.json';
const LEADERSHIP_GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_virksomhetsledelse.json';

const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const read = (rel) => JSON.parse(readText(rel));
const write = (rel, value) => {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`);
};
const sha = (rel) => crypto.createHash('sha256').update(readText(rel)).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const same = (actual, expected, message) => assert(JSON.stringify(actual) === JSON.stringify(expected), message);

const protectedPaths = [PLAN_PATH, MODEL_PATH, JOB_PATH, PEOPLE_PATH, CONFLICT_PATH, STORY_PATH, CAPITAL_GRAMMAR_PATH, LEADERSHIP_GRAMMAR_PATH];
const protectedHashes = Object.fromEntries(protectedPaths.map((rel) => [rel, sha(rel)]));
assert(!fs.existsSync(path.join(ROOT, WORLD_PATH)), 'Mellomleder Role World already exists; refusing overwrite');

const readiness = read(READINESS_PATH);
const queueRow = (readiness.rollout_queue || []).find((row) => row.key === KEY);
assert(queueRow?.classification === 'rollout_ready', `unexpected queue classification: ${queueRow?.classification}`);
same(queueRow.authored_work_required, ['situated_reputation'], 'Mellomleder must have exactly one remaining authored dimension');
assert(queueRow.cross_role_need === 'candidate_when_shared_work_is_real', 'cross-role candidacy drifted');

const plan = read(PLAN_PATH);
assert(plan.id === 'mellomleder_naeringsliv_v2' && plan.role_scope === 'mellomleder', 'plan identity drifted');
assert(plan.sequence.length === 25, 'plan must remain 25 steps');
for (let i = 0; i < 20; i += 1) {
  assert(plan.sequence[i].step === i + 1, `step ${i + 1} numbering drifted`);
  assert(plan.sequence[i].type === (i % 2 === 0 ? 'job' : 'people'), `step ${i + 1} type drifted`);
  same(plan.sequence[i].fallback_types, [], `step ${i + 1} fallback drifted`);
}
same(plan.sequence.slice(20).map((step) => step.type), ['conflict', 'people', 'job', 'story', 'event'], 'later arc drifted');

const actorIds = [
  'ingrid_omradesjef_mellomleder',
  'mads_sidestilt_leder_mellomleder',
  'rana_teamkoordinator_mellomleder',
  'thomas_medarbeider_oppfolging_mellomleder'
];
const model = read(MODEL_PATH);
assert(model.role_scope === 'kapitalforvalter' && model.role_id === 'naeringsliv_kapitalforvalter', 'fallback model drifted');
same(model.related_people.map((person) => person.id), actorIds, 'professional actor foundation drifted');
for (const person of model.related_people) assert(person.fictional === true && person.fictional_scenario_actor === true && person.canonical_person_ref === null, `${person.id}: fictional boundary drifted`);

const capital = read(CAPITAL_GRAMMAR_PATH);
const leadership = read(LEADERSHIP_GRAMMAR_PATH);
const workLoops = [...capital.work_loops, ...leadership.work_loops];
same(capital.authority_boundary.may_not, ['love avkastning', 'handle utenfor mandat', 'skjule interessekonflikter', 'late som personlig Badge-status er virksomhetskonsesjon'], 'capital authority boundary drifted');
same(leadership.authority_boundary.may_not, ['behandle eierskap som ledermandat', 'sette selskapsorganer til side', 'skjule vesentlig risiko', 'bruke virksomhetsmidler privat'], 'leadership authority boundary drifted');

const sourceRefs = [
  `${JOB_PATH}#job_mellomleder_week1_first_monday_report`,
  `${PEOPLE_PATH}#mellomleder_people_ingrid_rapport_001`,
  `${PEOPLE_PATH}#mellomleder_people_mads_styringspolitikk_001`,
  `${PEOPLE_PATH}#mellomleder_people_rana_kapasitet_001`,
  `${PEOPLE_PATH}#mellomleder_people_thomas_oppfolging_001`,
  `${CONFLICT_PATH}#ml_core_008`,
  `${CONFLICT_PATH}#ml_core_009`,
  `${STORY_PATH}#ml_core_007`,
  `${PEOPLE_PATH}#personal_mellomleder_week2_meeting_words_at_home`,
  `${PEOPLE_PATH}#ml_people_jahn_001`
];
for (const ref of sourceRefs) {
  const [rel, id] = ref.split('#');
  const mails = (read(rel).families || []).flatMap((family) => family.mails || []);
  assert(mails.some((mail) => mail.id === id), `missing canonical source ${ref}`);
}

const themeIds = [
  'professional_culture', 'class_power', 'bureaucratic_power', 'numerical_control',
  'loyalty_up_down', 'care_vs_efficiency', 'shame_reputation', 'invisible_work',
  'status_anxiety', 'public_private_leakage', 'local_knowledge_vs_system', 'emotional_labor'
];
const themeBank = read(THEME_BANK_PATH);
const validThemes = new Set(themeBank.themes.map((theme) => theme.id));
for (const id of themeIds) assert(validThemes.has(id), `unknown theme ${id}`);
assert(!themeBank.reference_profiles[KEY], 'Mellomleder theme profile already exists');

const recurringPeopleArchetypes = [
  {
    id: 'ingrid_omradesjef_mellomleder_world',
    social_function: 'områdesjefen som trenger et kort styringssignal, men er avhengig av at mellomlederen bevarer forskjellen mellom resultat, kjent kostnad og ukjent belastning',
    class_position: 'overordnet linjeleder med prioriterings- og beslutningsmakt innen eget mandat',
    status: 'høy formell status og direkte påvirkning på spillerens handlingsrom',
    power_over_player: 'kan be om rapport, prioritere og eie linjebeslutninger, men kan ikke gjøre grønn presentasjon til plikt til å skjule risiko eller gi spilleren eier-, styre- eller HR-myndighet',
    wants: 'beslutningsklare signaler, tidlig usikkerhet og en rapport som kan brukes uten å rekonstruere hele arbeidsdagen',
    conceals: 'at beslutningsrommet ofte belønner enkelhet før det belønner synliggjøring av kostnaden teamet bærer',
    speech_style: 'kort, prioriterende og konsekvensorientert; spør hva som er kjent, hva som må velges og når hun må involveres',
    teaches_player: 'at lojal rapportering er å gjøre virkeligheten beslutningsklar uten å gjøre den enklere enn kildene tåler'
  },
  {
    id: 'mads_sidestilt_leder_mellomleder_world',
    social_function: 'sidestilt leder som viser hvordan samme tall blir politiske når investering, kapasitet, status og rivaliserende lederfortellinger konkurrerer om oppmerksomheten',
    class_position: 'lederlikemann med høy uformell styringskompetanse, men uten myndighet over spillerens team',
    status: 'sterk peer-status og tilgang til ledergruppens uskrevne tolkningsregler',
    power_over_player: 'kan gi råd, koordinere og utfordre presentasjonen, men kan ikke godkjenne spillerens rapport eller gjøre strategisk språk til formell fullmakt',
    wants: 'en sak som overlever ledermøtet, tydelige avhengigheter og en kollega som forstår den politiske virkningen av tall',
    conceals: 'at gode råd også kan beskytte hans egen enhet og gjøre felles kostnader mindre synlige',
    speech_style: 'kollegial, analytisk og taktisk; oversetter fakta til hvordan ulike ledere sannsynligvis vil lese dem',
    teaches_player: 'at politisk klokskap må bevare begge sanne sider av saken og aldri låne myndighet fra kollegial nærhet'
  },
  {
    id: 'rana_teamkoordinator_mellomleder_world',
    social_function: 'teamkoordinatoren som gjør opplæring, støttearbeid, tempo og reell kapasitet synlig bak et tilsynelatende fullt bemanningsark',
    class_position: 'operativ kunnskapsbærer med høy lokal tillit og begrenset formell myndighet',
    status: 'høy situert troverdighet om arbeidsflyt og lagets faktiske avhengigheter',
    power_over_player: 'kan påvirke om prioriteringen oppfattes som realistisk og rettferdig, men kan ikke avgjøre personalsak, helseforhold, bemanning eller formell prosess',
    wants: 'prioriteringer som regner støtte og læring som arbeid og en leder som skiller observasjon fra tolkning av personer',
    conceals: 'at nærhet til laget kan gjøre det vanskelig å fortelle hvilken uformell buffer som snart ikke holder mer',
    speech_style: 'konkret, relasjonell og arbeidsnær; beskriver hvor flyten stopper og hva laget gjør for å holde den i gang',
    teaches_player: 'at lokal kunnskap blir legitim styring først når den avgrenses, dokumenteres og brukes uten å krenke personvern'
  },
  {
    id: 'thomas_medarbeider_mellomleder_world',
    social_function: 'medarbeideren som tester om støtte, ordinære forventninger, dokumentasjon og eventuell formell prosess faktisk skilles når tempo og tillit er under press',
    class_position: 'medarbeider med lavere formell makt og direkte eksponering for lederens språk og dokumentasjon',
    status: 'høy moralsk og relasjonell betydning som prøve på rettferdig prosess',
    power_over_player: 'kan korrigere faktagrunnlaget, be om klarhet og påvirke teamets tillit, men kan ikke gi samtykke til diagnose, sladder eller ubegrenset dokumentasjon',
    wants: 'kjent status, observerbare forventninger, avtalte tiltak og tydelig informasjon om dokumentasjon og innsyn',
    conceals: 'at frykten for en skjult sak kan gjøre hvert uklart lederord større enn lederen selv forstår',
    speech_style: 'forsiktig og direkte; spør hva samtalen betyr, hva som registreres og om utfallet allerede er bestemt',
    teaches_player: 'at personalintegritet skapes ved prosessklarhet, dataminimering og fravær av skjulte myndighetsskifter'
  },
  {
    id: 'styring_og_kontroll_mellomleder_world',
    social_function: 'økonomi-, risiko- og kontrollblikket som krever sporbarhet i forutsetninger, interessekonflikter, scenario og oppfølging',
    class_position: 'institusjonell kontrollflate med sterk etterprøvingsmakt og avgrenset beslutningsmyndighet',
    status: 'høy troverdighet i rapport- og risikospørsmål',
    power_over_player: 'kan returnere svakt grunnlag og kreve eskalering, men kan ikke overføre kontrollfunksjonens mandat eller love avkastning og godkjenning på spillerens vegne',
    wants: 'synlige forutsetninger, konsistente tall, avklart eier og en oppfølgingsregel som gjør anbefalingen testbar',
    conceals: 'at det som er lett å revidere ofte får høyere status enn viktig lokal kunnskap som er vanskeligere å måle',
    speech_style: 'presis, sekvensiell og dokumentorientert; skiller data, analyse, anbefaling, beslutning og oppfølging',
    teaches_player: 'at kontrollstanding følger sporbarhet og avgrensning, ikke hvor sikkert spilleren høres ut'
  },
  {
    id: 'eiere_og_beslutningsforum_mellomleder_world',
    social_function: 'eier- og beslutningsforumet som vurderer kapital, strategi og gjennomføring, men ikke kan brukes som bevis på at fallback-scope-en har ett felles mandat',
    class_position: 'høyt beslutningsnivå med ulik formell rolle avhengig av faktisk virksomhet og stilling',
    status: 'stor symbolsk og ressursmessig makt over hvilke historier som blir strategi',
    power_over_player: 'kan velge ressursretning innen rett organ, men kan ikke gjøre Badge-tittel, standing eller nærhet til forumet til personlig eier-, styre- eller investeringsmyndighet',
    wants: 'tydelige tradeoffs, risiko som kan eies og en anbefaling som skiller virksomhetens interesse fra spillerens statusbehov',
    conceals: 'at ønsket om en tydelig fortelling kan flytte kompleksitet og menneskelig kostnad nedover før beslutningen blir synlig som valg',
    speech_style: 'strategisk, komprimert og mandatbevisst; spør hva som skaper verdi, hvem som bærer risiko og hvilket organ som beslutter',
    teaches_player: 'at tilgang til beslutningsrom ikke er det samme som mandat, og at god anbefaling viser kostnaden forumet helst slipper å se'
  },
  {
    id: 'privat_relasjon_mellomleder_world',
    social_function: 'privat nær relasjon som møter møteord, oppfølgingsspråk og bufferrollen etter at arbeidsdagen formelt er slutt',
    class_position: 'likemann uten arbeidsmyndighet og uten plikt til å absorbere virksomhetens emosjonelle restarbeid',
    status: 'høy emosjonell betydning uten profesjonell rang',
    power_over_player: 'kan sette grenser for fravær og styringsspråk hjemme, men kan ikke løse rapport, kapasitet eller personalprosess',
    wants: 'nærvær, gjensidighet og et språk der et privat menneske ikke behandles som tiltak, ressurs eller oppfølgingspunkt',
    conceals: 'at gjentatt profesjonell kontroll hjemme kan oppleves som avstand lenge før spilleren selv merker lekkasjen',
    speech_style: 'hverdagslig og avvæpnende; stopper møteord og spør hva spilleren faktisk føler eller trenger',
    teaches_player: 'at ansvar kan avgrenses og overleveres, og at profesjonell standing aldri gir privat styringsrett'
  }
];

const slowAxes = [
  { id: 'executive_reporting_integrity_standing', meaning: 'situert standing oppover for sann rapport, synlig usikkerhet og beslutningsklare konsekvenser', runtime_binding: 'editorial_only_until_governed' },
  { id: 'peer_political_truth_standing', meaning: 'situert peer-standing for å forstå styringspolitikk uten å forfalske eller låne godkjenning', runtime_binding: 'editorial_only_until_governed' },
  { id: 'team_capacity_fairness_standing', meaning: 'situert standing i teamet for realistisk kapasitet, arbeidsdeling og lokal stemme', runtime_binding: 'editorial_only_until_governed' },
  { id: 'employee_process_integrity_standing', meaning: 'situert standing hos medarbeider i oppfølging for klar status, relevante fakta og personvern', runtime_binding: 'editorial_only_until_governed' },
  { id: 'governance_traceability_standing', meaning: 'situert kontrollstanding for sporbar analyse, risiko, mandat og oppfølging', runtime_binding: 'editorial_only_until_governed' },
  { id: 'decision_forum_tradeoff_standing', meaning: 'situert standing i eier- og beslutningsforum for eksplisitte tradeoffs og korrekt organ', runtime_binding: 'editorial_only_until_governed' },
  { id: 'private_role_containment_standing', meaning: 'situert privat standing for gjensidighet, nærvær og avgrensning av bufferrollen', runtime_binding: 'editorial_only_until_governed' }
];
const audiences = [
  { id: 'executive_management', standing_axis: slowAxes[0].id, cares_about: ['sanne styringssignaler som skiller resultat, kostnad og usikkerhet', 'tidlig eskalering med tydelig konsekvens og beslutningseier'], cannot_grant: 'Standing hos ledelsen kan ikke gi større fullmakt, HR-myndighet eller tillatelse til å skjule vesentlig risiko i rapporten.' },
  { id: 'peer_leadership', standing_axis: slowAxes[1].id, cares_about: ['kollegial koordinering som bevarer hele faktagrunnlaget', 'politisk klok presentasjon uten skjult kostnadsflytting'], cannot_grant: 'Peer-standing kan ikke godkjenne spillerens rapport, styre spillerens team eller erstatte delegert mandat.' },
  { id: 'work_team', standing_axis: slowAxes[2].id, cares_about: ['kapasitet som inkluderer opplæring, støtte og faktisk arbeidsflyt', 'rettferdig prioritering og en brukbar vei for å si fra'], cannot_grant: 'Teamstanding kan ikke gjøre tillit til personalmyndighet, diagnose eller fritak fra virksomhetens krav og prosesser.' },
  { id: 'employee_followup', standing_axis: slowAxes[3].id, cares_about: ['klart skille mellom støtte, ordinære forventninger og formell prosess', 'relevant faktadokumentasjon, korrigering og kjent innsyn'], cannot_grant: 'Relasjonell standing kan ikke oppheve personvern, legitimere skjult personalsak eller gi rett til diagnose og ubegrenset dokumentasjon.' },
  { id: 'governance_and_control', standing_axis: slowAxes[4].id, cares_about: ['sporbarhet fra mandat og data til risiko, anbefaling og oppfølging', 'synlige interessekonflikter og riktig eskaleringslinje'], cannot_grant: 'Kontrollstanding kan ikke love avkastning, godkjenne uten mandat eller gjøre en ryddig rapport til virksomhetskonsesjon.' },
  { id: 'owners_and_decision_forums', standing_axis: slowAxes[5].id, cares_about: ['strategiske tradeoffs med synlig ressurs- og menneskelig kostnad', 'at riktig organ eier beslutning, risiko og oppfølging'], cannot_grant: 'Standing i beslutningsforum kan ikke gjøre fallback-tittel til eier-, styre-, investerings- eller konsernmyndighet.' },
  { id: 'private_relations', standing_axis: slowAxes[6].id, cares_about: ['nærvær og gjensidighet uten møte- og oppfølgingsspråk', 'at arbeid kan dokumenteres, overleveres og få bli på jobb'], cannot_grant: 'Privat standing kan ikke løse arbeidsmandat, og profesjonell standing kan ikke brukes som rang eller styringsrett hjemme.' }
];

const REF = Object.freeze({ report: sourceRefs[0], ingrid: sourceRefs[1], mads: sourceRefs[2], rana: sourceRefs[3], thomas: sourceRefs[4], demand: sourceRefs[5], cost: sourceRefs[6], identity: sourceRefs[7], private: sourceRefs[8], jahn: sourceRefs[9] });
const beat = (summary, standing_audience, ref, impact) => ({ summary, standing_audience, ref, impact });
const dayBlueprints = [
  [
    beat('Den første mandagsrapporten viser 101 prosent levering og moderat overtid, men ingen sikker kunnskap om skjult støtte eller bærekraftig tempo; du må skille måling, tolkning og beslutningsbehov før statusen får farge.', 'executive_management', REF.report, 'Ingrid får større tillit til rapporten når usikkerheten har navn, mens en entydig grønnstatus ville kjøpt kort ro på bekostning av senere forklaringskraft.'),
    beat('Ingrid ber om ett kort styringssignal før ledermøtet, og du må komprimere uten å gjøre fravær av arbeidsmiljødata til bevis på at kapasiteten er trygg eller til påstand om en krise som ikke er dokumentert.', 'executive_management', REF.ingrid, 'Standing oppover følger evnen til å levere en kort sannhet som fortsatt viser beslutningspunktet; statusen svekkes dersom enkelhet blir en metode for å skjule kjent kostnad.'),
    beat('Du kobler resultatet til registrert overtid og bestiller et avgrenset kapasitetsgrunnlag med eier og frist; handlingen holder analyse, anbefaling og Ingrids beslutningsmyndighet fra hverandre.', 'governance_and_control', REF.report, 'Kontrollflaten kan rekonstruere hva som var observert og fortsatt ukjent, mens teamet foreløpig bare ser om rapportarbeidet faktisk fører til en synlig prioritering.'),
    beat('Hjemme fortsetter du å redigere setningen til den høres ufarlig ut, og en nær relasjon merker at samtalen behandles som et nytt ledermøte; du må la usikkerheten være personlig uten å gjøre kjøkkenet til rapporteringsflate.', 'private_relations', REF.private, 'Privat standing styrkes når møteformen legges bort og tvilen kan deles uten tiltaksspråk; profesjonell kontroll gir ingen ekstra rett til å styre samtalen hjemme.')
  ],
  [
    beat('Bemanningsarket viser åtte av åtte, men opplæring, langsommere tempo og Idas uformelle veiledning reduserer leverbar kapasitet; du må spørre etter arbeid og avhengigheter før navn blir gjort til forklaring.', 'work_team', REF.rana, 'Rana og teamet får tillit når støttearbeid blir regnet som arbeid uten at enkeltpersoner diagnostiseres; standing faller dersom full bemanning brukes til å avvise kjent friksjon.'),
    beat('Rana beskriver hvilke oppgaver som stopper og hvem som hjelper hvem, samtidig som hun avgrenser hva hun ikke vet om årsak eller formell status; lokal kunnskap må bli evidens uten å bli personsladder.', 'work_team', REF.rana, 'Teamstanding øker når koordinatorens observasjoner brukes til arbeidsdesign og ikke sosial rangering, mens personvernstanding tåler at årsakstolkninger holdes utenfor loggen.'),
    beat('Ingrid trenger en ny prognose, og du oversetter kapasitetsbildet til konkrete leveransevalg fremfor å be om ubestemte ressurser; det tydeliggjør hvem som kan prioritere og hva teamet faktisk kan love.', 'executive_management', REF.ingrid, 'Ledelsen ser en mellomleder som bringer valg i stedet for bare press, mens teamet senere vil måle legitimiteten mot om den valgte prioriteringen faktisk blir respektert.'),
    beat('Du oppdager at du hjemme fortsatt teller menneskers kapasitet som om alle relasjoner var en arbeidsplan; en privat grense minner om at nærvær ikke kan optimaliseres med samme språk som bemanning.', 'private_relations', REF.private, 'Privat standing avhenger av at kapasitetsblikket kan slås av og gjensidighet få ta tid, uten at arbeidsdagens uferdige prognose dumpes på den som står nærmest.')
  ],
  [
    beat('Ledelsen ber om fart samtidig som teamet ber om ro etter flere endringer; du må gjøre det motstridende kravet eksplisitt og nekte å behandle stillhet nedenfra som aksept for økt tempo.', 'executive_management', REF.demand, 'Standing kan stige oppover for et beslutningsklart dilemma og samtidig være skjør i teamet dersom oversettelsen ikke fører til en faktisk grense mot skjult overbelastning.'),
    beat('Rana sier at enda en generell beskjed om prioritering bare vil flytte koordineringsarbeidet tilbake til laget; du må spesifisere hva som tas ut, hva som må vente og hvem som eier neste avklaring.', 'work_team', REF.rana, 'Teamet får grunn til å stole på retningen når et nytt krav også fjerner noe annet, mens tomt prioriteringsspråk ville gjort Rana til fortsatt usynlig buffer.'),
    beat('Mads foreslår en formulering som gjør tempoøkningen strategisk forståelig, men den skjuler at én leveranse må ned; du beholder rådet om lesbarhet og avviser utelatelsen av kostnaden.', 'peer_leadership', REF.mads, 'Peer-standing bygges ved å forstå ledergruppens språk uten å bruke kollegial taktikk som godkjenning for et ufullstendig faktagrunnlag eller skjult kostnadsflytting.'),
    beat('På kvelden svarer du en venn med en ferdig konklusjon før spørsmålet er stilt ferdig; dagens krysspress har gjort kontroll til refleks, og den private relasjonen trenger plass uten beslutningsfrist.', 'private_relations', REF.private, 'Privat standing svekkes når arbeidsdagens hastverk blir sosial styringsrett, men kan repareres når spilleren stopper, lytter og lar samtalen mangle et umiddelbart tiltak.')
  ],
  [
    beat('Thomas spør om oppfølgingen er støtte, ordinær forventningsavklaring eller starten på en formell sak; du må svare med kjent status før organisasjonens uklare språk får produsere sin egen trussel.', 'employee_followup', REF.thomas, 'Thomas får prosessuell tillit når statusen sies høyt og skjult formalisering avvises; vag fleksibilitet ville gitt lederen ro og medarbeideren all risikoen.'),
    beat('Notatene blander observerbare frister med tolkninger av energi og motivasjon; du må rense grunnlaget til relevante fakta og forklare hvem som har innsyn uten å love fortrolighet utenfor policy.', 'employee_followup', REF.thomas, 'Standing hos medarbeideren følger dataminimering, korrigeringsmulighet og synlige innsynsgrenser, ikke mengden dokumentasjon eller hvor omsorgsfull en antakelse høres ut.'),
    beat('Du avtaler ett konkret støttegrep, én ordinær forventning og tidspunkt for ny faktasamtale, mens enhver eventuell formell prosess må starte i riktig linje og varsles som det.', 'governance_and_control', REF.thomas, 'Kontrollstanding styrkes fordi prosess, fakta og eier kan rekonstrueres; relasjonell tillit bevares fordi dokumentasjonen ikke brukes som skjult reserve for et utfall som ikke er besluttet.'),
    beat('Hjemme hører du deg selv spørre om en privat samtale er støtte eller løsning, og den andre reagerer på å bli gjort til oppfølgingssak; du må vende tilbake til gjensidighet uten lederens kategorier.', 'private_relations', REF.private, 'Privat standing repareres når oppfølgingsspråket legges bort og den andre får definere sitt behov, mens Thomas-saken forblir på jobb med sine avtalte innsynsgrenser.')
  ],
  [
    beat('Fredagens samlede status viser god levering, utsatt forbedringsarbeid og en personalsamtale som fortsatt bare er avgrenset oppfølging; du må beskrive uken uten å gjøre alt til enten seier eller krise.', 'governance_and_control', REF.identity, 'Styringsstanding vokser når ulike typer uferdig arbeid beholder ulik status, og svekkes dersom én samlet fortelling vasker bort både kapasitetsgjeld og prosessgrenser.'),
    beat('Ingrid spør hva du faktisk trenger fra henne neste uke, og du må skille beslutningen hun eier fra koordineringen du selv kan gjennomføre; synlig begrensning blir en del av profesjonell handlekraft.', 'executive_management', REF.ingrid, 'Ledelsesstanding følger presis eskalering med konkret beslutningsbehov, ikke forestillingen om at en sterk mellomleder absorberberer alle uløste spørsmål uten støtte.'),
    beat('Rana spør hva teamet kan stole på etter alle formuleringene om prioritering; du oversetter beslutningen til oppgaver som tas ut, kontrollpunkt og hvem som får beskjed når forutsetningene endres.', 'work_team', REF.rana, 'Teamstanding blir bundet til observerbar endring i arbeidet, slik at tillit ikke må baseres på lederens tone eller på at koordinatoren fortsetter å oversette løfter gratis.'),
    beat('Helgen begynner med trang til å sjekke om alle har forstått planen, men overleveringen har eier og frist; du øver på å la dokumentert ansvar bli i virksomheten fremfor å bære det som personlig vakt.', 'private_relations', REF.private, 'Privat standing styrkes når spilleren tåler at et avgrenset ansvar kan overleveres, og den profesjonelle identiteten slutter å kreve kontinuerlig tilgjengelighet som bevis på verdi.')
  ],
  [
    beat('Tiltaksplanen lover opplæring, bedre flyt og uendret leveranse samtidig; du må vise hvilke ressurser og tidsvalg planen forutsetter før optimistiske verb blir behandlet som gjennomføring.', 'owners_and_decision_forums', REF.cost, 'Beslutningsforumets standing følger en anbefaling som synliggjør ressurser og kostnadsbærer, mens et løfte om alt samtidig ville flyttet risikoen ned uten et formelt valg.'),
    beat('Mads foreslår å ramme opplæring som investering, og du legger til den kortsiktige kapasitetskostnaden slik at én sann historie ikke fortrenger den andre når planen vurderes.', 'peer_leadership', REF.mads, 'Peer-standing øker for politisk lesbarhet med integritet; Mads kan påvirke formen, men hans anerkjennelse kan ikke fungere som godkjenning av budsjett eller leveranseforutsetninger.'),
    beat('Ingrid velger rekkefølge og eier ressursavklaringen, mens du setter indikatorer for om tiltaket virker; oppfølgingen blir en styringsloop fremfor et løfte som bare lever i presentasjonen.', 'executive_management', REF.ingrid, 'Ledelsen får tillit til at beslutningen kan korrigeres på fakta, og kontrollflaten får et spor som skiller Ingrids valg fra spillerens analyse og gjennomføringsansvar.'),
    beat('Hjemme frister det å omtale tiltaksplanen som noe du endelig har fått kontroll på, men den inneholder fortsatt avhengigheter andre eier; privat språk må tåle begrenset ansvar uten skam.', 'private_relations', REF.private, 'Privat standing blir sterkere når usikkerhet kan beskrives uten selviscenesettelse som redningsperson, og arbeidsplanens åpne avhengigheter ikke gjøres til familiens emosjonelle oppgave.')
  ],
  [
    beat('Teamet spør hva som faktisk endres etter ledermøtet, og du må svare med arbeid som stopper, opplæring som prioriteres og tidspunkt for ny vurdering fremfor å gjenta strategiske formuleringer.', 'work_team', REF.rana, 'Teamstanding måles mot konkrete endringer og forutsigbarhet, ikke tilgang til ledermøtet; Rana slipper å være eneste kanal mellom et abstrakt tiltak og hverdagsarbeidet.'),
    beat('Thomas spør om den nye prioriteringen påvirker oppfølgingen hans, og du må holde generell kapasitetsstyring adskilt fra de avtalte observasjonene og støttepunktene i hans sak.', 'employee_followup', REF.thomas, 'Medarbeiderstanding styrkes når organisasjonsendring ikke brukes som skjult prosesseskalering, og når Thomas kan se at samme personvern- og faktagrense fortsatt gjelder.'),
    beat('Du rapporterer til Ingrid hvilke tiltak som er utført, hva som venter og hvilken forutsetning som allerede har endret seg; det gjør avviket til læring uten å omskrive den opprinnelige beslutningen.', 'executive_management', REF.ingrid, 'Ledelsesstanding vokser for tidlig korrigering, mens en pyntet framdriftsstatus ville beskyttet spillerens status kort og svekket muligheten til å velge på nytt.'),
    beat('En privat avtale har blitt skjøvet fordi arbeidsplanen krevde enda en oppfølging; du må erkjenne kostnaden uten å bruke jobbens betydning som automatisk rang over den andres tid.', 'private_relations', REF.private, 'Privat standing avhenger av en reell reparasjon og ny grense, ikke en effektiv forklaring på hvorfor virksomheten alltid syntes viktigere i øyeblikket.')
  ],
  [
    beat('Tallene for opplæring kan presenteres som fremtidig verdi eller ukens produktivitetstap, og Mads viser hvordan ledergruppen vil rangere historiene; du må bevare begge i samme beslutningsgrunnlag.', 'peer_leadership', REF.mads, 'Peer-standing følger evnen til å være taktisk uten å bli selektiv med sannheten, mens andre ledere kan mislike friksjonen selv om saken blir mer styringsdyktig.'),
    beat('Mads advarer om at et ærlig kostnadsbilde kan bli brukt mot enheten, men hans egen enhet tjener på at opplæringen fortsetter; interesse og råd må skilles uten å gjøre kollegaen til motstander.', 'peer_leadership', REF.mads, 'Kollegial tillit blir mer robust når interessekonflikten kan sies uten anklage, og svekkes dersom taktisk lojalitet krever at konsekvensen skjules for beslutningseierne.'),
    beat('Du sender en dobbel ramme med investering, kortsiktig kapasitet, usikkerhet og oppfølgingspunkt; rapporten lar riktig forum velge uten at spilleren later som anbefalingen er selve vedtaket.', 'owners_and_decision_forums', REF.mads, 'Beslutningsforumet får et sant tradeoff og tydelig organ, mens spillerens standing ikke kan omgjøre tilgang til rommet til eier-, styre- eller investeringsmandat.'),
    beat('Jahn-kilden minner om at rapporter er institusjonelle handlinger, ikke bare speil av tall; historisk kontekst hjelper deg å spørre hva som må bevares som usikkerhet uten å gi moderne fullmakt.', 'governance_and_control', REF.jahn, 'History Go-kunnskap styrker kontrollstanding gjennom et bedre spørsmål om måling og styringssignal, men gir ingen særrett til data, beslutning eller historisk autoritet over dagens organisasjon.')
  ],
  [
    beat('Etter Thomas-samtalen sirkulerer ulike antakelser om hvorfor tempoet hans har falt; du må stoppe teamets forklaringer uten å bekrefte at en personalsak finnes eller dele hva som ble sagt.', 'employee_followup', REF.thomas, 'Thomas sin standing og personvern beskyttes når lederen korrigerer prosessrykter uten å fylle tomrommet med fortrolig informasjon, mens teamet får en generell arbeidsavklaring.'),
    beat('Thomas leser et notat og påpeker at én formulering beskriver motivasjon snarere enn observerbart arbeid; du korrigerer grunnlaget og dokumenterer uenigheten fremfor å forsvare lederens første tolkning.', 'employee_followup', REF.thomas, 'Medarbeiderstanding øker når korrigering er reell og ikke blir lest som illojalitet; kontrollstanding styrkes fordi faktagrunnlaget nå viser både observasjon og rettet tolkning.'),
    beat('Neste samtale følger de avtalte punktene og viser ett fremskritt, én fortsatt friksjon og behov for samme støtteperiode; du unngår både forhåndsfrikjennelse og skjult opptrapping.', 'governance_and_control', REF.thomas, 'Prosessuell standing følger konsistent avgrensning over tid, slik at verken omsorg eller resultatpress kan flytte saken til et nytt nivå uten eksplisitt beslutning i riktig linje.'),
    beat('Hjemme merker du lettelsen over at samtalen gikk rolig og fristes til å dele detaljer for å bli forstått; du må fortelle om egen belastning uten å gjøre Thomas til privat samtalestoff.', 'private_relations', REF.private, 'Privat nærhet kan styrkes gjennom spillerens egen erfaring samtidig som medarbeiderens personvern forblir intakt; fortrolighet kan ikke kjøpes med en annens historie.')
  ],
  [
    beat('Andre uke viser at du fortsatt absorberberer små motsetninger før de når beslutningseierne; identiteten som pålitelig buffer begynner å skjule hvor organisasjonen faktisk trenger et valg.', 'executive_management', REF.identity, 'Ledelsesstanding kan først falle når flere dilemmaer blir synlige, men blir mer bærekraftig dersom pålitelighet betyr tidlig beslutningsgrunnlag fremfor lydløs absorpsjon.'),
    beat('Rana viser en liste over uformelle avklaringer hun og teamet har tatt for å holde planen sammen; du må gjøre arbeidet synlig uten å straffe initiativ eller formalisere hvert lite skjønn.', 'work_team', REF.rana, 'Teamstanding styrkes når usynlig koordinering anerkjennes og de kritiske avhengighetene får eiere, mens lokalt skjønn fortsatt kan eksistere innen tydelige grenser.'),
    beat('Ingrid mottar tre saker du tidligere ville løst alene, hver med konsekvens og foreslått nivå; du må tåle at eskalering kan tolkes som mindre kontroll før den viser seg som bedre styring.', 'executive_management', REF.ingrid, 'Oppoverstanding flyttes fra personlig tilgjengelighet til kvaliteten på grense og beslutningsgrunnlag, uten at Ingrid overtar spillerens ansvar for gjennomføring og oppfølging.'),
    beat('Helgen uten bufferrolle føles først som fravær av verdi, og en privat relasjon merker at du leter etter problemer å ordne; du må la ansvar være avgrenset uten å fylle tomrommet med ny kontroll.', 'private_relations', REF.private, 'Privat standing styrkes når gjensidighet ikke trenger et problem som inngangsbillett, og statusangsten får eksistere uten at andre blir gjort til oppgaver eller bekreftelseskilder.')
  ],
  [
    beat('Du mottar to motstridende krav om kostnadsreduksjon og uendret levering med samme frist; oppgaven er å gjøre konflikten eksplisitt, ikke å late som god mellomledelse opphever aritmetikken.', 'owners_and_decision_forums', REF.demand, 'Beslutningsforumets standing følger et klart valg mellom konsekvenser, mens spillerens status kan presses av at konflikten ikke lenger kan skjules i generell effektivitet.'),
    beat('Ledelsen spør hva du anbefaler, teamet spør hva som rammes, og Mads spør hva som er politisk mulig; du må holde anbefaling, beslutning og oversettelse som tre ulike handlinger.', 'peer_leadership', REF.demand, 'Peer- og ledelsesstanding kan divergere når rådet er tydeligere enn kompromisset, men ingen av dem kan gi spilleren mandat til å vedta på vegne av riktig organ.'),
    beat('Du modellerer to scenarioer med ressursvalg, risiko og oppfølgingspunkt og nekter å føre uvalgt arbeid tilbake til teamet som en vag forventning om å strekke seg.', 'governance_and_control', REF.demand, 'Kontrollstanding øker fordi scenario og forutsetning kan prøves, mens teamstanding avhenger av at den kommende beslutningen faktisk oversettes til arbeid som tas ut.'),
    beat('Mads sier privat i gangen at du gjorde saken vanskeligere å selge, men også vanskeligere å misforstå; den kollegiale relasjonen må tåle at profesjonalitet ikke alltid maksimerer felles komfort.', 'peer_leadership', REF.mads, 'Peer-standing blir mer moden når uenigheten kan bæres uten skjult gjengjeldelse eller falsk enighet, og Mads sitt bifall fortsatt ikke blir formell godkjenning.')
  ],
  [
    beat('Når forumet velger uendret frist, må noen bære kostnaden gjennom lavere kvalitet, utsatt arbeid eller høyere belastning; du må nekte at kostnaden forsvinner bare fordi vedtaket er kort.', 'owners_and_decision_forums', REF.cost, 'Beslutningsstanding følger synlig kostnadsallokering og navngitt risiko, mens en pen implementeringsfortelling ville latt forumet beholde gevinsten og teamet arve usikkerheten.'),
    beat('Teamet hører beslutningen og spør hvem som blir buffer denne gangen; du må fordele avgrenset arbeid, vise hva som utsettes og etablere stoppsignal før lojalitet blir målt i taus overbelastning.', 'work_team', REF.cost, 'Teamstanding styrkes når kostnaden fordeles som et eksplisitt ledervalg med grenser, ikke som moralsk test på hvem som er mest fleksibel eller pålitelig.'),
    beat('Kontrollflaten ber om hvorfor risikoen ble akseptert og hvem som følger den; du registrerer beslutningseier, forutsetning og returkriterium uten å omskrive vedtaket som din egen fullmakt.', 'governance_and_control', REF.cost, 'Sporbarhetsstanding øker når akseptert risiko fortsatt har eier og kontrollpunkt, og spilleren avstår fra å bruke dokumentasjonen som etterfølgende statusforsvar.'),
    beat('Thomas merker at den nye belastningen treffer oppfølgingstiltaket hans og spør om forventningen er endret; du må justere arbeid eller eskalere uten å la en generell beslutning skjult endre personalsaken.', 'employee_followup', REF.thomas, 'Medarbeiderstanding bevares når systemkostnaden ikke individualiseres som ny prestasjonssvikt, og enhver endret forventning blir uttrykkelig, relevant og behandlet i riktig prosess.')
  ],
  [
    beat('Jahn-scenen lar deg sammenligne en rapport som speil med en rapport som institusjonell styringshandling; du bruker forskjellen til å spørre hva tallene utelater og hvilket organ som trenger usikkerheten.', 'governance_and_control', REF.jahn, 'History Go-affordancen styrker analytisk standing gjennom bedre kilde- og institusjonsspørsmål, men fortiden gir ingen moderne tilgang, fullmakt eller rett til å overstyre dagens kontrollinje.'),
    beat('Du gransker ett nøkkeltall gjennom kildedefinisjon, utvalg og beslutningsbruk og oppdager at stabilitet delvis skyldes utsatt arbeid; kunnskapen endrer spørsmålet før den endrer anbefalingen.', 'executive_management', REF.jahn, 'Ledelsesstanding kan bli mer friksjonsfylt når et kjent tall mister enkelheten, men beslutningskvaliteten øker fordi utsatt arbeid blir synlig før det returnerer som overraskelse.'),
    beat('I styringsmøtet markerer du hva som er målt, hva som er inferert, hva som er besluttet og fortsatt ukjent; den historiske refleksjonen blir en konkret profesjonell affordance, ikke pynt.', 'owners_and_decision_forums', REF.jahn, 'Forumets standing følger et grunnlag som viser epistemisk og institusjonell grense, mens kunnskapspoeng aldri blir stemmerett, styremandat eller investeringsgodkjenning.'),
    beat('Rolleidentiteten endres når du ser at makten ofte ligger i kategoriene rapporten tilbyr; du må eie dette ansvaret uten å late som språkmakt er det samme som formell beslutningsmyndighet.', 'peer_leadership', REF.identity, 'Peer-standing styrkes når kategoriene kan diskuteres og utfordres, mens statusen svekkes dersom innsikten brukes til å gjøre spillerens fortolkning uangripelig.')
  ],
  [
    beat('Den siste rapportflaten samler levering, opplæring, kapasitetsgjeld, Thomas-oppfølging og akseptert risiko; du må bevare ulik status og eier i stedet for å presse alt inn i én konklusjon.', 'governance_and_control', REF.report, 'Kontrollstanding når en moden form når rapporten kan rekonstrueres uten global score, og hvert åpent punkt fortsatt peker mot riktig mandat, kilde og neste kontroll.'),
    beat('Ingrid vurderer om du har blitt en leder som skaper klarhet eller bare mer kompleksitet; du svarer med hva som kan besluttes nå, hva som må undersøkes og hva hun uttrykkelig eier.', 'executive_management', REF.ingrid, 'Ledelsesstanding styrkes gjennom brukbar avgrensning, ikke maksimal sikkerhet; Ingrid kan gi prioritet og tillit, men ikke utvide fallback-scope-ens formelle mandat.'),
    beat('Du overleverer de åpne sporene med fakta, eier og frist og lar rolleidentiteten være oversetter, koordinator og eskaleringspunkt fremfor skjult beslutningstaker for hele systemet.', 'work_team', REF.identity, 'Team- og peer-standing kan nå hvile på synlige grenser og faktisk overlevering, mens ingen samlet anerkjennelse gir HR-, eier-, styre- eller kontrollmyndighet.'),
    beat('Rollen kan legges fra seg fordi arbeidet er dokumentert og overlevert: stolthet, tvil og statusbehov får eksistere privat uten at andre mennesker behandles som rapporter eller oppfølgingspunkter.', 'private_relations', REF.private, 'Privat standing avslutter sesongen med gjensidighet og nærvær, og profesjonell standing forblir på sine arbeidsflater uten å bli rang, beredskapsplikt eller styringsrett hjemme.')
  ]
];

const phases = ['morning', 'lunch', 'afternoon', 'evening'];
const beatTypes = ['info', 'relationship', 'task', 'decision', 'conversation', 'social', 'consequence', 'private_consequence'];
const standingRule = 'Standing er situert hos det navngitte publikummet og kan divergere fra andre relasjoner; den kan aldri utvide mandat, gi HR-, eier-, styre-, investerings- eller kontrollmyndighet, oppheve personvern eller gjøre uriktig rapportering legitim.';
const consequenceRule = 'Denne reaksjonen er redaksjonell Standing, ikke en global score eller ny runtime, og den flytter verken formell myndighet, innsyn, prosessnivå eller beslutningseierskap.';
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex += 1) {
    const phase = phases[phaseIndex];
    const item = dayBlueprints[day - 1][phaseIndex];
    coverage.push({
      day,
      phase,
      beat_type: beatTypes[((day - 1) * 4 + phaseIndex) % beatTypes.length],
      summary: `Dag ${day}, ${phase}: ${item.summary} ${standingRule}`,
      standing_audience: item.standing_audience,
      standing_consequence: `Dag ${day}/${phase}: ${item.impact} ${consequenceRule}`,
      materialization_refs: [item.ref]
    });
  }
}
assert(coverage.length === 56, 'coverage must contain 56 beats');
assert(new Set(coverage.map((row) => row.summary)).size === 56, 'summaries must be unique');
assert(new Set(coverage.map((row) => row.standing_consequence)).size === 56, 'standing consequences must be unique');
const useCounts = new Map(sourceRefs.map((ref) => [ref, 0]));
for (const row of coverage) useCounts.set(row.materialization_refs[0], useCounts.get(row.materialization_refs[0]) + 1);
for (const [ref, uses] of useCounts) assert(uses >= 2, `${ref} must ground at least two beats`);

const world = {
  schema: 'civication_role_world_v1',
  version: 1,
  category: 'naeringsliv',
  role_scope: 'mellomleder',
  title: 'Mellomleder — rapportmakt, bufferarbeid og situert legitimitet',
  status: 'role_world_complete',
  sociological_core: {
    main_problem: 'Å oversette mellom tall, beslutningsfora, sidestilte ledere, teamets faktiske kapasitet og avgrenset medarbeideroppfølging uten å gjøre mellomposisjonen til skjult allmakt eller usynlig bufferarbeid.',
    description: 'Role World-en lukker bare situated reputation rundt eksisterende Mellomleder-praksis. Plan, fallback-modell, profesjonelle People, arbeidsflater, to work grammars og authority-grenser forblir authoritative og uendret.'
  },
  theme_ids: themeIds,
  social_environments: [
    'Analyse- og rapporteringsflaten der et målt resultat blir et styringssignal og ukjent belastning risikerer å forsvinne i fargen på statusen.',
    'Strategi- og beslutningsrommet der råd, anbefaling, interesse, organ og formell beslutning må holdes fra hverandre.',
    'Drift- og kapasitetsgjennomgangen der opplæring, støtte, tempo og lokal kunnskap viser hva åtte av åtte faktisk betyr.',
    'Risiko- og oppfølgingsbordet der fakta, forutsetning, personvern, prosessnivå, eier og neste kontroll må kunne rekonstrueres.',
    'Lederkollegiet der de samme tallene blir politiske uten å slutte å være fakta, og der kollegial støtte aldri er godkjenning.',
    'Privatlivet der møteord, oppfølgingsrefleks og bufferidentitet må kunne legges bort uten at ansvar eller omsorg fornektes.'
  ],
  recurring_people_archetypes: recurringPeopleArchetypes,
  slow_axes: slowAxes,
  existing_work_continuity: {
    runtime_binding: 'existing_mail_and_shared_work_grammars',
    new_runtime_state: false,
    work_loops: workLoops,
    canonical_surfaces: [MODEL_PATH, CAPITAL_GRAMMAR_PATH, LEADERSHIP_GRAMMAR_PATH, PLAN_PATH, JOB_PATH, PEOPLE_PATH, CONFLICT_PATH, STORY_PATH],
    rule: 'Den eksisterende 25-stegs Mellomleder-planen, to-ukers praksisbuen, fallback-modellen og fire canonical work loops forblir authoritative; Role World-en legger bare situert Standing rundt eksisterende scener og skaper ingen ny scene-, plan-, work-object-, rytme- eller personalruntime.'
  },
  situated_reputation_model: {
    global_score_allowed: false,
    audiences,
    authority_separation: 'Standing uttrykker situert tillit og kan aldri utvide mandat eller myndighet, gi HR-, eier-, styre-, investerings- eller kontrollfullmakt, oppheve personvern og personalprosess eller legitimere uriktig rapportering og skjult risiko.',
    rule: 'Standing kan divergere mellom ledelse, lederkolleger, team, medarbeider i oppfølging, kontroll, beslutningsforum og privatliv uten å bli én global sosial score.'
  },
  history_go_affordance: {
    source_ref: REF.jahn,
    knowledge_use: 'Gunnar Jahn-konteksten brukes til å se rapporten som både måling og institusjonell styringshandling og dermed undersøke kilde, kategori, usikkerhet og beslutningsbruk før anbefaling.',
    better_question: 'Hvilke forhold er faktisk observert, hvilke er inferert gjennom rapportens kategorier, hvem har myndighet til å beslutte på grunnlaget, og hvilken relevant usikkerhet må fortsatt være synlig for at beslutningen kan korrigeres senere?',
    authority_boundary: 'Historisk innsikt kan gi et bedre spørsmål og en mer kildekritisk anbefaling, men kan ikke gi moderne datatilgang, HR-innsyn, kontrollgodkjenning, styremandat, investeringsfullmakt eller rett til å sette dagens selskapsorganer til side.'
  },
  cross_role_link: {
    status: 'candidate_when_shared_work_is_real',
    materialized: false,
    new_runtime: false,
    companion_keys: ['naeringsliv/avdelingsleder', 'naeringsliv/controller', 'naeringsliv/finansanalytiker', 'naeringsliv/formann', 'naeringsliv/okonomi_og_finanssjef'],
    rule: 'Nærliggende roller er plausible kompanjonger, men dette rolleeide materialet deler ikke et styrt persistent objekt med eksplisitt eierskap, handoff-status og authority-kontrakt. Ingen cross-role runtime opprettes for å tilfredsstille en kandidatetikett.'
  },
  season: { days: 14, day_phases: phases, coverage },
  primary_threads: [
    { id: 'report_measurement_and_decision', beat_refs: ['1/morning', '1/lunch', '2/afternoon', '5/lunch', '8/afternoon', '14/morning'] },
    { id: 'capacity_local_knowledge_and_team', beat_refs: ['2/morning', '2/lunch', '3/lunch', '5/afternoon', '7/morning', '10/lunch'] },
    { id: 'thomas_process_and_privacy', beat_refs: ['4/morning', '4/lunch', '4/afternoon', '7/lunch', '9/lunch', '12/evening'] },
    { id: 'numbers_politics_and_peer_truth', beat_refs: ['3/afternoon', '6/lunch', '8/morning', '8/lunch', '11/evening', '13/evening'] },
    { id: 'tradeoff_cost_and_authority', beat_refs: ['6/morning', '11/morning', '11/afternoon', '12/morning', '12/lunch', '12/afternoon'] },
    { id: 'history_go_and_governance', beat_refs: ['8/evening', '13/morning', '13/lunch', '13/afternoon', '14/morning'] },
    { id: 'private_buffer_containment', beat_refs: ['1/evening', '4/evening', '5/evening', '7/evening', '10/evening', '14/evening'] }
  ],
  private_aftermath: [
    { id: 'rapporten_i_hodet', beat_refs: ['1/evening', '6/evening'], meaning: 'Rapporten kan avsluttes som arbeid uten at privat nærhet blir en ny flate for redigering, forsvar og beslutning.' },
    { id: 'moteord_hjemme', beat_refs: ['3/evening', '4/evening'], meaning: 'Støtte og gjensidighet krever et annet språk enn oppfølging, tiltak og avklarte leveranser.' },
    { id: 'utsatt_privat_avtale', beat_refs: ['7/evening', '9/evening'], meaning: 'Virksomhetens frist kan ikke automatisk rangeres over andres tid, og medarbeiderens historie kan ikke brukes som privat bearbeidingsmateriale.' },
    { id: 'helg_uten_buffer', beat_refs: ['5/evening', '10/evening'], meaning: 'Avgrenset og overlevert ansvar kan få bli på jobb uten at fravær av beredskap blir lest som tap av verdi.' },
    { id: 'rolle_avsluttet_uten_rang', beat_refs: ['13/evening', '14/evening'], meaning: 'Profesjonell innsikt og status kan eksistere uten å bli privat styringsrett, møteform eller krav om kontinuerlig tilgjengelighet.' }
  ],
  delayed_consequences: [
    { id: 'first_report_return', setup_ref: '1/morning', return_ref: '7/afternoon', meaning: 'Det første skillet mellom resultat, kostnad og usikkerhet avgjør om tiltaket senere kan korrigeres uten å omskrive historien.' },
    { id: 'capacity_sheet_return', setup_ref: '2/morning', return_ref: '10/lunch', meaning: 'Tidlig synlig støttearbeid avgjør om bufferrollen senere kan avvikles uten at teamets lokale koordinering kollapser.' },
    { id: 'pressure_translation_return', setup_ref: '3/morning', return_ref: '11/afternoon', meaning: 'Det første beslutningsklare krysspresset gir senere et språk for scenarioer som ikke sender alle uvalgte krav nedover.' },
    { id: 'thomas_status_return', setup_ref: '4/morning', return_ref: '9/lunch', meaning: 'Den eksplisitte prosessgrensen gjør det mulig å korrigere dokumentasjonen uten at korrigeringen blir lest som opptrapping eller illojalitet.' },
    { id: 'action_plan_return', setup_ref: '6/morning', return_ref: '12/morning', meaning: 'Synlige ressurser og kostnadsbærer avslører senere hvem som faktisk arver prisen når forumet fastholder fristen.' },
    { id: 'numbers_politics_return', setup_ref: '8/morning', return_ref: '13/afternoon', meaning: 'Den doble sanne rammen kommer tilbake som et eksplisitt skille mellom målt, inferert, besluttet og ukjent.' },
    { id: 'private_language_return', setup_ref: '1/evening', return_ref: '14/evening', meaning: 'Tidlig møteform hjemme blir senere en konkret prøve på om rollen kan avgrenses og overleveres uten at omsorg forsvinner.' },
    { id: 'cost_allocation_return', setup_ref: '11/morning', return_ref: '14/afternoon', meaning: 'Den synlige konflikten mellom krav gjør den siste overleveringen i stand til å navngi restkostnad, eier og kontrollpunkt.' }
  ],
  employment_conditions: [
    'Mellomleder-, kapital-, eier- og konserntitler forutsetter faktisk stilling, virksomhetsorgan, delegasjon og relevant kompetanse; Badge-poeng eller Standing gir ingen jobb eller myndighet.',
    'Rapportering, bemanning, budsjett, personalsak, datatilgang, investering og styrebeslutning er institusjonelle forhold og ikke nye globale runtimefelt.',
    'Utvidet HR-, eier-, styre-, kontroll- eller investeringsmyndighet krever faktisk hjemmel og kan ikke materialiseres gjennom teamtillit, lederstatus eller History Go-kunnskap.'
  ],
  professional_culture: [
    'God mellomlederkultur gjør resultat, menneskelig kostnad, usikkerhet og beslutningseier synlige uten å gjøre rapporten til diagnose eller statusforestilling.',
    'Lojalitet oppover, sidelengs og nedover kan bare sameksistere når informasjon oversettes sannferdig og uvalgte krav ikke gjøres til teamets skjulte bufferarbeid.',
    'Avgrenset medarbeideroppfølging krever observerbare fakta, kjent status, relevant dokumentasjon og rett prosess; omsorg er aldri tillatelse til diagnose eller ubegrenset innsyn.'
  ],
  materialization: {
    authored_dimensions: ['situated_reputation'],
    no_new_runtime: true,
    existing_plan_preserved: true,
    existing_role_model_preserved: true,
    existing_people_foundation_preserved: true,
    existing_work_grammar_preserved: true,
    existing_persistent_work_preserved: true,
    existing_rhythm_preserved: true,
    cross_role_link_materialized: false,
    source_refs: sourceRefs
  }
};

write(WORLD_PATH, world);
const index = read(INDEX_PATH);
assert(!index.roles.some((entry) => entry.category === 'naeringsliv' && entry.role_scope === 'mellomleder'), 'Mellomleder already indexed');
index.roles.push({ category: 'naeringsliv', role_scope: 'mellomleder', status: 'role_world_complete', path: WORLD_PATH });
index.status = `${index.roles.length}_role_worlds_materialized`;
write(INDEX_PATH, index);

const checklist = read(CHECKLIST_PATH);
assert(!checklist.reference_worlds.includes(WORLD_PATH), 'Mellomleder already in checklist');
checklist.reference_worlds.push(WORLD_PATH);
write(CHECKLIST_PATH, checklist);

themeBank.reference_profiles[KEY] = themeIds;
write(THEME_BANK_PATH, themeBank);

for (const [rel, before] of Object.entries(protectedHashes)) assert(sha(rel) === before, `${rel} changed during materialization`);
console.log(JSON.stringify({ role_world: WORLD_PATH, index_status: index.status, source_refs: sourceRefs.length, beats: coverage.length, audiences: audiences.length, protected_surfaces_unchanged: protectedPaths }, null, 2));
