import fs from 'node:fs';
import crypto from 'node:crypto';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, value) => { fs.mkdirSync(p.slice(0, p.lastIndexOf('/')), { recursive: true }); fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`); };
const hash = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const R = 'psykologi_arbeids_og_karriereveiledning';
const MODEL = `data/Civication/roleModels/psykologi/${R}.json`;
const GRAMMAR = `data/Civication/workGrammars/psykologi/${R}.json`;
const PLAN = `data/Civication/mailPlans/psykologi/${R}_plan.json`;
const TYPES = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const locks = {
  [MODEL]: 'b0fd2e9b62f611b10ed476f43b813a8e346c73acb3c1f9d5a1452a0147f9d3fc',
  [GRAMMAR]: '68f7a88d9198f4bacc81ea106839e5a65e4f84b254d1100c0d26c21aad9bdada',
  'data/Civication/lifestory/roles/psykologi_arbeids_og_karriereveiledning/role.json': '6537e1dd985ec61dbf313b8af1dc24ec458a425996846a01a8acd8ba4403e01b',
  'data/Civication/lifestory/roles/psykologi_arbeids_og_karriereveiledning/scenes.json': '78b187671956bd347f05965014bef6182ca0afdf69d4b6573729e5830a0e402e',
  'data/Civication/lifestory/roles/psykologi_arbeids_og_karriereveiledning/threads.json': '13f644f1f0ae970345976b64806f3dde596221356f75ebb1b61a39dae19c0a53',
  'data/Civication/psychologyGuidanceEvidence.json': '1846b3d925dd60522cd9df2932f5e7224f1419cf867add3869ac0de4771fbe89'
};
for (const [p, expected] of Object.entries(locks)) if (hash(p) !== expected) throw new Error(`source drift: ${p}`);

const actors = [
  { id: 'nora_veisoker_karriereskifte', name: 'Nora', role: 'veisøker i karriereskifte', workplace_ids: ['veiledningsrommet_for_maal_og_samtykke'], function: 'Nora eier målet, begrunnelsen og beslutningen i overgangsplanen. Hun prøver å bygge videre på erfaring uten å reduseres til et fravær i CV-en, et tiltaksmål eller resultatet fra ett kartleggingsverktøy.', authority_relation: 'Nora kan gi, avgrense og trekke samtykke og kan velge bort veilederens forslag. Veilederen kan strukturere alternativer, men kan ikke diagnostisere henne, dele helseopplysninger eller bestemme arbeid eller utdanning på hennes vegne.' },
  { id: 'samir_fagkollega_karriereveiledning', name: 'Samir', role: 'fagkollega og metodeansvarlig', workplace_ids: ['kartleggings_og_mulighetsverkstedet'], function: 'Samir kvalitetssikrer at interessekartlegging, kompetansebeskrivelse og arbeidsmarkedsinformasjon brukes som spørsmål som kan motsies av erfaring, verdier og hverdagsrammer, ikke som en sorteringsfasit.', authority_relation: 'Samir kan utfordre metodebruk og be om ny begrunnelse. Han kan ikke gjøre et kartleggingsresultat til klinisk vurdering eller overstyre veisøkerens mål, og faglig uenighet må bevares i neste handoff.' },
  { id: 'elin_arbeidsgiverkontakt_inkludering', name: 'Elin', role: 'arbeidsgiverkontakt', workplace_ids: ['arbeidsgiverdialogens_matchbord'], function: 'Elin konkretiserer arbeidsoppgaver, krav, tilretteleggingsmuligheter og rekrutteringsfrister. Hun gjør jobbmatch mulig, men hennes behov for trygghet skaper press for mer personinformasjon enn stillingen nødvendigvis krever.', authority_relation: 'Elin kan avgjøre hvem arbeidsgiveren går videre med innen lovlige rammer. Hun kan ikke kreve at veilederen deler sensitive opplysninger uten grunnlag og avklart samtykke, eller bruke veilederens antakelser som helse- eller arbeidsevnevurdering.' },
  { id: 'marius_nav_oppfolgingskontakt', name: 'Marius', role: 'NAV-kontakt og oppfølgingspartner', workplace_ids: ['oppfolgingsplanens_handoffpunkt'], function: 'Marius forvalter reelle frister og rammer i oppfølgingen og trenger en plan som kan etterprøves. Han synliggjør når systemets tempo ikke samsvarer med tiden veisøkeren trenger for å undersøke alternativer.', authority_relation: 'Marius kan be om avtalte oppfølgingspunkter innen eget mandat. Han kan ikke gjøre en foreløpig plan til veisøkerens endelige valg, kreve overskuddsinformasjon eller låne klinisk myndighet til oppfølgingssystemet.' }
];
const places = [
  { id: 'veiledningsrommet_for_maal_og_samtykke', name: 'Veiledningsrommet for mål og samtykke', function: 'Her formulerer veisøkeren hva hjelpen skal gjelde, hvilke alternativer som er åpne og hva som eventuelt kan deles videre.' },
  { id: 'kartleggings_og_mulighetsverkstedet', name: 'Kartleggings- og mulighetsverkstedet', function: 'Her prøves interesser, kompetanse, erfaring, verdier og arbeidsmarkedsinformasjon mot hverandre uten at verktøy blir diagnose eller fasit.' },
  { id: 'arbeidsgiverdialogens_matchbord', name: 'Arbeidsgiverdialogens matchbord', function: 'Her avgrenses jobbrelevante krav, muligheter og informasjon før en kandidat presenteres eller et intervju forberedes.' },
  { id: 'oppfolgingsplanens_handoffpunkt', name: 'Oppfølgingsplanens handoffpunkt', function: 'Her versjoneres neste steg, ventepunkt, samtykke, eier og ny vurderingsdato mellom veisøker, veileder og samarbeidspartner.' }
];

const model = read(MODEL);
model.work_life.workplaces = places.map((p) => p.id);
model.related_people = actors.map((a) => ({ ...a, fictional: true, fictional_scenario_actor: true, canonical_person_ref: null }));
model.related_places = places;
model.required_knowledge.place_connections = places.map((p) => p.id);
model.required_knowledge.people_connections = actors.map((a) => a.id);
model.mail_integration.can_feed_mail_types = TYPES;
model.mail_integration.recommended_mail_families = TYPES.map((type) => `${R}_${type}_overgangsplan`);
write(MODEL, model);

const grammar = read(GRAMMAR);
grammar.work_loops = [
  'eget mål -> evidens og alternativer -> venting på avklaring -> samtykkebundet handoff -> handling -> oppfølging -> rework eller lukking',
  'arbeidsgiver- eller systemkrav -> relevansavklaring -> veisøkerens valg -> avgrenset deling -> respons -> planrevisjon'
];
grammar.actor_grammar = actors.map(({ id, name, role, workplace_ids }) => ({ id, name, role, workplace_ids }));
grammar.place_grammar = places;
grammar.persistent_work_object_contract = {
  id: 'samtykkebundet_valg_og_overgangsplan',
  description: 'Versjonert plan med veisøkerens eget mål, kilder, alternativer, begrunnelse, samtykkeomfang, ventepunkt, neste handling, eier og vurderingsdato uten unødvendige sensitive opplysninger.',
  states: ['maal_avklares', 'alternativer_undersokes', 'venter_pa_svar', 'samtykke_avgrenses', 'handling_avtalt', 'under_oppfolging', 'rework_eller_lukket'],
  handoff_rule: 'Handoff navngir planversjon, hva veisøkeren selv har valgt, hva som kan deles, hvem som eier neste handling og når planen skal prøves på nytt; mottakeren får aldri mer personinformasjon enn formålet og samtykket bærer.'
};
grammar.rhythm_contract = {
  loop: 'målavklaring -> waiting/venting på veisøker, arbeidsgiver eller partner -> samtykkebundet handoff -> handling -> respons -> oppfølging -> rework',
  waiting_states: ['veisokerens_beslutning', 'arbeidsgivers_respons', 'utdannings_eller_tiltaksinformasjon', 'samtykke_til_avgrenset_deling'],
  rework_rule: 'Når planen ikke brukes, jobbkravet endres eller samtykket avgrenses, gjenåpnes berørte alternativer uten at tidligere begrunnelse eller veisøkerens eierskap slettes.'
};
grammar.knowledge_dependencies = [{
  id: 'history_go_karriereveiledning_institusjon_testing_og_arbeidsmarked',
  badge_id: 'psykologi',
  use: 'Historie om yrkesveiledning, testing, arbeidsinkludering og institusjonell sortering brukes til å spørre hvordan kategorier former mulighetsbildet; den avgjør aldri individuell egnethet og gir ingen klinisk myndighet.'
}];
grammar.day_one_contract = {
  entry: 'direct_offer',
  first_object: 'samtykkebundet_valg_og_overgangsplan',
  first_task: 'Registrer veisøkerens eget spørsmål, ett åpent alternativ, samtykkeomfang, neste handling og et eksplisitt ventepunkt før planen deles.'
};
grammar.mail_generation_contract = { required_mail_types: TYPES, role_scope: R, no_generic_fallback: true };
write(GRAMMAR, grammar);

const scenes = [
  ['job','eget_maal','Nora','nora_veisoker_karriereskifte',places[0].id,'«Hva som helst» er ikke et mål Nora kan eie','Nora sier ja til å søke alt fordi fristen nærmer seg','et lånt mål blir registrert som hennes motivasjon','avklare hva hun vil ha mer av i en arbeidshverdag før ett foreløpig mål føres','sette lagerarbeid som mål fordi markedet har flest åpninger','Nora formulerer selv en retning og kan forklare hvorfor neste steg hører til den','planen ser effektiv ut, men blir liggende fordi den beskriver veilederens løsning','autonomi_vs_styring'],
  ['job','kartlegging','Samir','samir_fagkollega_karriereveiledning',places[1].id,'Interesseprofilen peker mot kontor — erfaringen peker bort','skjemaet fremhever struktur mens Nora beskriver isolasjon som hovedproblemet','et aggregert mønster blir brukt som personmerkelapp','splitte resultatet i oppgaver hun liker og arbeidsvilkår hun vil unngå','bygge hele planen rundt den høyeste skåren','kartleggingen åpner et mer presist alternativ: koordinerende arbeid med kontakt og bevegelse','resultatet lukker samtalen og gjør senere moteksempler til avvik','utforsking_vs_fasit'],
  ['job','jobbmatch','Elin','elin_arbeidsgiverkontakt_inkludering',places[2].id,'Jobbkravet må oversettes uten å overselge kandidaten','Elin trenger noen som kan koordinere skift, men annonsen blander krav og ønsker','Nora presses inn i en match som ikke tåler første arbeidsuke','skille absolutte krav fra lærbare oppgaver og la Nora vurdere matchen','tone ned manglende erfaring og love at veilederen følger opp alt','Nora møter et ærlig kravbilde og kan selv velge om gapet er håndterbart','arbeidsgiver og kandidat starter med ulike forventninger og tilliten må repareres','realistisk_match_vs_rask_plassering'],
  ['job','systemfrist','Marius','marius_nav_oppfolgingskontakt',places[3].id,'Fristen trenger et neste steg, ikke et oppdiktet sluttvalg','Marius må ha en konkret aktivitet før dagen er over mens to spor fortsatt undersøkes','systemets datofelt gjør foreløpig utforsking til endelig retning','registrere en tidsavgrenset undersøkelse av begge spor med ny beslutningsdato','føre jobbsøking som hovedmål for å få planen komplett','fristen blir en ramme for læring, og Nora beholder retten til hovedvalget','systemet rapporterer framdrift mens Nora opplever at valget allerede er tatt','systemkrav_vs_individuell_prosess'],
  ['people','nora_samtykke','Nora','nora_veisoker_karriereskifte',places[0].id,'Nora vil trekke tilbake delen om helse før arbeidsgiverkontakten','samtykket var bredt da planen ble laget, men Nora avgrenser det før deling','en gammel planversjon brukes fordi den er enklere å sende','versjonere samtykket og beskrive bare funksjonelle, jobbrelevante behov Nora godkjenner','sende den tidligere teksten fordi arbeidsgiveren allerede venter','Nora ser at samtykke faktisk kan endres og beholder tillit til videre dialog','overskuddsinformasjon slipper ut og senere samarbeid må bygges opp på nytt','samtykke_vs_framdrift'],
  ['people','samir_metode','Samir','samir_fagkollega_karriereveiledning',places[1].id,'Samir finner en konklusjon som er sikrere enn notatene','planen kaller Nora umotivert selv om samtalen viser ambivalens og tidligere nederlag','kollegial autoritet gjør en tolkning til et stabilt faktum','be Samir skille observasjon, hypotese og hva Nora selv har sagt','beholde formuleringen fordi den forklarer manglende aktivitet kort','notatet blir etterprøvbart og åpner for et mindre, gjennomførbart steg','etiketten følger Nora mellom møter og gjør motstridende evidens vanskeligere å høre','faglig_kvalitet_vs_kategorisering'],
  ['people','elin_informasjon','Elin','elin_arbeidsgiverkontakt_inkludering',places[2].id,'Elin spør hva CV-hullet egentlig skyldes','arbeidsgiveren vurderer intervju, men etterspør helsebakgrunn som ikke er nødvendig for utvelgelsen','jobbmuligheten brukes som pressmiddel for privat informasjon','holde svaret til kompetanse, tilgjengelighet og det Nora selv vil formidle','gi en kort helseforklaring for å redusere Elins usikkerhet','Elin får et relevant beslutningsgrunnlag og Nora eier sin egen forklaring i intervjuet','arbeidsgiveren vet mer, men Nora mister kontrollen over hvem som kjenner historien','jobbmatch_vs_personvern'],
  ['people','marius_handoff','Marius','marius_nav_oppfolgingskontakt',places[3].id,'Marius mottar planen uten eier for arbeidsgiversvaret','planen sier at arbeidsgiverdialog pågår, men ikke hvem som følger opp eller når stillhet blir avslag','venting blir usynlig og Nora får skylden for manglende aktivitet','navngi Elin som ekstern respondent, veilederen som oppfølger og dato for alternativ handling','markere punktet som utført idet e-posten er sendt','stillheten får en eier og planen kan gå videre uten å late som svaret foreligger','systemet teller utsendt e-post som resultat mens Nora blir stående uten neste steg','handoff_vs_ansvarsopplosning'],
  ['conflict','helsepress','Elin','elin_arbeidsgiverkontakt_inkludering',places[2].id,'Jobbmuligheten kobles til et krav om helseforklaring','Elin sier intervjuet blir enklere å godkjenne dersom hun får vite hvorfor Nora var borte','maktasymmetrien gjør et frivillig samtykke tvilsomt','avgrense dialogen til arbeidsoppgaver og la Nora velge sin egen intervjuforklaring','overtale Nora til å dele fordi dette kan være hennes eneste sjanse','jobbmatchen prøves på relevante forhold uten at veilederen blir kanal for helseopplysninger','et kortsiktig intervju kjøpes med et tillitsbrudd som følger hele overgangen','mulighet_vs_personvern'],
  ['story','vikariat','Nora','nora_veisoker_karriereskifte',places[0].id,'Et vikariat kan starte mandag, men peker bort fra Noras retning','jobben gir lønn nå og relevant referanse, men fortrenger kvalifiseringsløpet hun undersøker','rask plassering blir automatisk behandlet som bedre valg','sammenligne økonomi, læring, varighet og alternativkostnad og la Nora velge','anbefale et ja før arbeidsgiveren går videre til neste kandidat','Nora velger vikariatet med sluttdato og parallelt kvalifiseringssteg hun selv har begrunnet','hun sier ja under press og tolker senere sammenbrudd som personlig svikt','rask_plassering_vs_baerekraftig_valg'],
  ['event','intervjuendring','Elin','elin_arbeidsgiverkontakt_inkludering',places[2].id,'Intervjuet flyttes fram mens samtykketeksten fortsatt revideres','Elin tilbyr et ledig tidspunkt samme ettermiddag, men Nora har ikke godkjent presentasjonen','kalenderpress gjør foreløpig tekst til autorisert deling','bekrefte tidspunktet uten å sende persontekst og gjøre Nora klar med jobbrelevante eksempler','sende utkastet nå slik at Elin rekker å lese bakgrunnen','intervjuet reddes uten å gjøre hastverk til nytt samtykke','den raske delingen kan ikke trekkes tilbake når Nora senere endrer formuleringen','tempo_vs_samtykke'],
  ['micro','cv_hull','Nora','nora_veisoker_karriereskifte',places[1].id,'Én CV-linje må være sann uten å bli en journal','Nora vil forklare perioden uten arbeid, men utkastet avslører mer helsehistorie enn hun ønsker','en ryddig kronologi blir viktigere enn hennes kontroll over privat informasjon','skrive en kort aktivitet- og kompetanseorientert linje Nora kan utdype selv','beholde helseforklaringen fordi den gjør tidslinjen komplett','CV-en er forståelig og lar Nora bestemme om mer skal sies i samtalen','dokumentet sprer en forklaring hun ikke kan tilpasse til ulike mottakere','klarhet_vs_minimering'],
  ['followup','ubrukt_plan','Nora','nora_veisoker_karriereskifte',places[3].id,'Ingen av søknadene ble sendt — planen må gjenåpnes','oppfølgingen viser at Nora forsto oppgavene, men aldri brukte målet som ble registrert','manglende handling tolkes som lav motivasjon i stedet for svak måleierskap','gå tilbake til begrunnelsen, redusere neste steg og versjonere målet i Noras språk','øke antall søknader og legge inn tettere kontroll','rework avdekker at retningen var lånt og gir ett steg Nora faktisk starter','mer kontroll produserer aktivitet i systemet, men mindre selvstendig handling','oppfolging_vs_sanksjon'],
  ['knowledge','historisk_sortering','Samir','samir_fagkollega_karriereveiledning',places[1].id,'Historien om testing endrer spørsmålet, ikke Noras egnethet','et historisk spor viser hvordan veiledning og tester har sortert mennesker etter skiftende arbeidsmarkedsbehov','fortidens kategorier brukes som tidløs forklaring på individet','spørre hvilke institusjonelle behov verktøyet synliggjør og prøve resultatet mot dagens evidens og Noras erfaring','bruke historisk utbredelse som bevis på at kategorien er faglig sikker','History Go gjør metodekritikken skarpere uten å levere et individuelt svar eller klinisk mandat','historisk autoritet maskerer at dagens plan bygger på en utestet slutning','historisk_kontekst_vs_individuell_fasit'],
  ['consequence','tillit_og_tilbud','Nora','nora_veisoker_karriereskifte',places[3].id,'Arbeidsgiversvaret viser hva den første delingen kostet','Elin tilbyr intervju, men refererer til en privat opplysning Nora ikke visste var sendt','et positivt resultat skjuler at prosessen brøt samtykkegrensen','erkjenne bruddet, stoppe videre deling og la Nora avgjøre om kontakten skal repareres','framstille opplysningen som nødvendig fordi den bidro til tilbudet','konsekvensen blir synlig i planen og videre kontakt skjer bare på Noras nye vilkår','jobbtilbudet brukes til å legitimere bruddet og gjør tillit til en pris Nora måtte betale','resultat_vs_integritet']
].map(([type,slug,from,people_ref,place_id,subject,evidence,risk,good,bad,goodOutcome,badOutcome,axis], index) => ({ type, slug, from, people_ref, place_id, subject, evidence, risk, good, bad, goodOutcome, badOutcome, axis, index }));

const makeMail = (s) => ({
  id: `${R}_${s.type}_${s.slug}_${String(s.index + 1).padStart(3, '0')}`,
  mail_type: s.type,
  mail_family: `${R}_${s.type}_overgangsplan`,
  role_scope: R,
  phase: s.index === 0 ? 'forenoon' : 'workday',
  priority: 160 - s.index,
  from: s.from,
  people_ref: s.people_ref,
  place_id: s.place_id,
  subject: s.subject,
  summary: `${s.subject}. I den samtykkebundne valg- og overgangsplanen er den konkrete evidensen at ${s.evidence}. Risikoen er at ${s.risk}. Spilleren må skille veisøkerens eget valg fra veilederens råd, versjonere samtykke, ventepunkt, neste eier og vurderingsdato, og holde diagnostikk, psykoterapi, klinisk arbeidsevnevurdering og beslutningen om arbeid eller utdanning utenfor rollen.`,
  situation: [
    `Planen viser hva veisøkeren selv har sagt, hva som er observert, og hva som fortsatt bare er en hypotese om ${s.axis}.`,
    `Valget avgjør om venting og handoff blir synlig eller om ${s.risk}.`,
    'Ingen mottaker får sensitive opplysninger utover uttrykkelig formål, rettslig grunnlag og avklart samtykke; kartlegging er aldri diagnose eller klinisk fasit.'
  ],
  task_domain: 'arbeids_og_karriereveiledning',
  competency: 'autonomi_samtykke_og_overgangsplan',
  pressure: s.axis,
  choice_axis: s.axis,
  consequence_axis: 'eierskap_tillit_og_gjennomforbarhet',
  narrative_arc: s.slug,
  choices: [
    {
      id: 'A', label: `Bevar eierskap: ${s.good}`, reply: `Jeg vil ${s.good}. Jeg oppdaterer planversjonen med evidens, samtykkeomfang, ventepunkt, neste eier og ny vurderingsdato, og lar Nora selv eie begrunnelsen og beslutningen.`, effect: 1,
      tags: ['autonomi', 'samtykke', 'handoff'],
      feedback: `${s.goodOutcome}. Dermed kan neste aktør se forskjellen mellom observasjon, hypotese og veisøkerens valg, og rework kan skje uten skjult persondeling. Veilederen styrker handlingsrommet uten å diagnostisere, behandle, gjøre klinisk arbeidsevnevurdering eller overta beslutningen.`,
      effects: { stats: { quality: 2, trust: 2, autonomy: 2, risk: -2 } }
    },
    {
      id: 'B', label: `Prioriter framdrift: ${s.bad}`, reply: `Jeg vil ${s.bad}. Jeg registrerer løsningen som framdrift nå og lar mottakeren eller Nora rydde samtykke, usikkerhet og restarbeid når konsekvensene blir tydeligere.`, effect: -1,
      tags: ['styring', 'personvernrisiko', 'skjult_rework'],
      feedback: `${s.badOutcome}. Planen ser mer komplett ut, men skiller ikke lenger tydelig mellom veisøkerens mål og systemets eller veilederens løsning. Venting, samtykke og ansvar blir vanskeligere å rekonstruere, og rollen glir mot styring eller kliniske slutninger den ikke har mandat til.`,
      effects: { stats: { status: 1, quality: -2, trust: -2, risk: 3 } }
    }
  ]
});

for (const type of TYPES) {
  const mails = scenes.filter((s) => s.type === type).map(makeMail);
  const catalog = { schema: 'civication_mail_family_catalog_v1', version: 1, category: 'psykologi', role_scope: R, mail_type: type, families: [{ id: `${R}_${type}_overgangsplan`, purpose: `Trene ${type} gjennom den samme samtykkebundne valg- og overgangsplanen.`, learning_focus: ['autonomi', 'samtykke', 'venting_handoff_rework', 'rollegrense'], mails }] };
  write(`data/Civication/mailFamilies/psykologi/${type}/${R}_${type}.json`, catalog);
}

const sequenceTypes = ['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job'];
const plan = {
  schema: 'civication_mail_plan_v1', version: 1, id: 'psykologi_arbeids_og_karriereveiledning_foundation_v1', category: 'psykologi', role_scope: R, title: 'Arbeids- og karriereveiledning',
  description: 'Seksten steg gjennom samme samtykkebundne valg- og overgangsplan.',
  arc: { from: 'Veileder med fragmenterte mål, kartleggingsfunn og systemfrister.', to: 'Veileder som holder veisøkerens eierskap, realistiske alternativer, samtykke og handoff sammen.', core_questions: ['Er dette veisøkerens eget mål?', 'Hva kan deles og med hvem?', 'Hva venter, hvem eier neste steg, og når gjenåpnes planen?'] },
  outcome_rules: {
    promoted: { completion_ratio_gte: 1, score_gte: 2, strikes_lte: 0 },
    fired: { stability_values: ['FIRED'], strikes_gte: 3, score_lte: -3 },
    stagnated: { autonomy_delta: -10, stability: 'STAGNATED', add_branch_flags: ['career_stagnated', 'karriereveiledning_lant_maal_eller_samtykkebrudd'] }
  },
  sequence: sequenceTypes.map((type, index) => ({ step: index + 1, type, phase: index < 3 ? 'intro' : index < 10 ? 'advanced' : 'mastery', step_goal: `Før overgangsplanen gjennom ${type} med veisøkerens mål, evidens, samtykke, ventepunkt, neste eier og vurderingsdato synlig.`, allowed_families: [`${R}_${type}_overgangsplan`], fallback_types: [] }))
};
write(PLAN, plan);
console.log('Materialized arbeids- og karriereveiledning prerequisites: 15 scenes, 4 actors, 4 surfaces, 1 persistent plan');
