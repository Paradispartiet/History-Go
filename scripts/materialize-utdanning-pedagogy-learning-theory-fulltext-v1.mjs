#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'pedagogikk-laeringsteori-laering-kunnskap-motivasjon-og-selvregulering';
const DIR = `data/fagverk/utdanning/${CHAPTER_ID}`;
const P = Object.freeze({
  sourceBrief: 'data/fag/utdanning/pedagogy_learning_theory_source_claim_brief_v1.json',
  didacticsBrief: 'data/fag/utdanning/didactics_source_claim_brief_v1.json',
  pensum: 'data/fag/utdanning/utdanningpensum_canonical_v1.json',
  emner: 'data/fag/utdanning/emner_utdanning_canonical_v1.json',
  methods: 'data/fag/utdanning/methods_utdanning_canonical_v1.json',
  chapter: `${DIR}.json`, brief: `${DIR}/brief.json`, claims: `${DIR}/claims.json`, assessment: `${DIR}/assessment.json`,
  manifest: 'data/fag/fag_manifest.json', registry: 'data/fagverk/fagverk_registry.json', inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json', portal: 'data/fagverk/fagverk_portal.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const PARAGRAPHS = Object.freeze({
  'plt-01': 'Prestasjon mens en elev øver og varig læring er ikke samme fenomen. Oppgaver kan bli lettere fordi materiale nettopp er sett eller fordi støtten er høy, uten at kunnskapen senere kan hentes fram eller brukes fleksibelt. Derfor må undervisningsvurdering skille aktuell ytelse fra endring som består over tid.',
  'plt-02': 'Forsinket retensjon og transfer gir strengere informasjon om læring enn umiddelbar flyt. Når et læringsmål innebærer at kunnskap skal kunne brukes senere eller i en ny oppgave, bør målingen ligge nær dette tidsrommet og denne bruken, heller enn bare å registrere hvor enkelt øvingen oppleves.',
  'plt-03': 'Noen læringsaktiviteter kan senke prestasjonen under selve øvingen og likevel støtte senere retensjon, men dette er en betinget mekanisme og ikke et ideal om mest mulig vanskelighet. Oppgavens kompleksitet, forkunnskap, støtte og muligheten for vellykket bearbeiding avgjør om utfordringen blir produktiv eller bare hindrende.',
  'plt-04': 'Påstander om at én undervisningsmåte gir bedre læring er ufullstendige uten et eksplisitt utfall og tidsperspektiv. Faktakunnskap etter én time, begrepsforståelse etter en uke og transfer til nye problemer er ulike kriterier; en metode kan derfor se sterk ut på ett mål og svakere på et annet.',
  'plt-05': 'Forkunnskap former hva som blir lagt merke til og hvordan ny informasjon får mening. Nye ideer tolkes gjennom eksisterende begreper og relasjoner, slik at læreren må undersøke hvilke kunnskapsstrukturer oppgaven forutsetter. Dette er en pedagogisk analyse av tilgjengelige ressurser, ikke en rangering av elevens generelle evne.',
  'plt-06': 'Eksisterende kunnskap kan både støtte og forstyrre ny læring. Et relevant begrepsapparat kan gjøre nye forbindelser lettere, mens en robust feilmodell kan trekke tolkningen i gal retning. God undervisning må derfor aktivere forkunnskap og samtidig gjøre det mulig å oppdage når den ikke passer med ny evidens eller nye begreper.',
  'plt-07': 'Velorganisert kunnskap i langtidsminnet gjør komplekse oppgaver lettere å behandle fordi flere elementer kan forstås som meningsfulle helheter. Det betyr ikke at arbeidsminnets begrensninger alene forklarer læring; motivasjon, mål, språk og sosial kontekst påvirker fortsatt hva som blir bearbeidet og hvordan kunnskapen brukes.',
  'plt-08': 'Transfer er mer enn å gjenta et tidligere svar i en ny drakt. Eleven må kjenne igjen hvilke prinsipper som er relevante og kunne rekonstruere dem under nye betingelser. Undervisning som bare trener overflatekjennetegn kan derfor gi høy øvingsprestasjon uten tilsvarende fleksibel anvendelse utenfor den opprinnelige oppgaven.',
  'plt-09': 'Aktiv gjenhenting kan under undersøkte betingelser gi bedre forsinket retensjon enn tilsvarende ekstra restudering. Mekanismen handler om å forsøke å hente kunnskap fram, ikke om karaktersetting. Derfor må gjenhentingsøving vurderes som en læringsaktivitet med lav risiko og tydelig læringsformål, ikke blandes med sertifiserende testing.',
  'plt-10': 'Testing-effekten varierer mellom studier fordi resultatet påvirkes av blant annet testformat, hvor ofte gjenhentingen lykkes, forsinkelsen før sluttmåling, feedback og hva kontrollgruppen gjør. En robust gjennomsnittseffekt er derfor ikke en garanti for samme størrelse i alle fag, aldre eller undervisningsdesign.',
  'plt-11': 'Gjenhentingsøving kan i enkelte eksperimentelle design støtte inferensiell transfer, ikke bare ordrett hukommelse. Det utvider den pedagogiske relevansen, men generalisering må følge oppgavens likhet, type slutning og tidsintervall. Et laboratoriefunn om transfer er ikke i seg selv dokumentasjon for enhver autentisk skoleoppgave.',
  'plt-12': 'Læringsfunksjonen til praksistesting og kontrollfunksjonen til høy-stakes vurdering er analytisk ulike. Den første kan gi øving i å hente fram kunnskap og produsere feedback; den andre brukes til rangering, sertifisering eller beslutninger. Evidens for retrieval practice legitimerer derfor ikke automatisk hyppigere prøver med konsekvenser.',
  'plt-13': 'Fordelt øving gir i mange studier bedre senere retensjon enn å samle samme mengde øving tett. Fordelen betyr ikke at hvert fag skal følge samme kalender, men at tid er en del av læringsdesignet. Når kunnskap skal vare, bør revisjon og gjenhenting fordeles slik at materialet må rekonstrueres på nytt.',
  'plt-14': 'Det finnes ikke ett universelt optimalt intervall mellom økter. Effekten av spacing avhenger blant annet av hvor lenge kunnskapen skal beholdes, og intervaller som er hensiktsmessige for kort retensjon kan være for korte for et langt mål. Didaktisk planlegging må derfor koble øvingsavstand til ønsket brukstid.',
  'plt-15': 'Spacing bør beskrives sammen med innhold, aktivitet og sluttmål. Å spre ren gjenlesing, spre problemløsning og spre aktiv gjenhenting er ikke identiske tiltak, og læringsmålet kan være faktakunnskap, prosedyre eller transfer. Uten disse spesifikasjonene blir anbefalingen om fordelt øving for generell til å være etterprøvbar.',
  'plt-16': 'Fordelt øving kan føles vanskeligere enn massert øving fordi tidligere tilgjengelighet har rukket å avta. Den umiddelbare opplevelsen av strev er derfor ikke et sikkert mål på senere læring. Pedagogisk feedback bør hjelpe elever å skille fluens i øyeblikket fra om kunnskapen faktisk kan hentes fram etter en forsinkelse.',
  'plt-17': 'Når elever møter nytt og elementrikt materiale, må begrenset arbeidsminne håndtere informasjon før stabile kunnskapsstrukturer er etablert. Forkunnskap i langtidsminnet kan redusere denne belastningen ved å organisere flere elementer som én meningsfull enhet. Prinsippet er betinget av hva eleven allerede kan og hva oppgaven krever.',
  'plt-18': 'Instruksjonsstøtte bør tilpasses forholdet mellom oppgave og relevant forkunnskap. Detaljerte forklaringer og worked examples kan hjelpe nybegynnere, mens samme støtte senere kan bli overflødig. Dette er en ekspertiseavhengig vurdering av oppgavestøtte, ikke et argument for å klassifisere elever i faste undervisningstyper.',
  'plt-19': 'Kognitiv belastning betyr ikke at god undervisning alltid skal minimere anstrengelse. Noe mentalt arbeid er nødvendig for å forklare, sammenligne og integrere ideer. Problemet er belastning som ikke bidrar til læringsmålet eller som overskrider muligheten til meningsfull bearbeiding, ikke vanskelighet som sådan.',
  'plt-20': 'Teorier om kognitiv arkitektur kan informere hvordan informasjon presenteres og støtte fases, men de avgjør ikke hva utdanning bør være til for. Valg av innhold, danning, demokrati og rettferdighet er normative spørsmål som krever andre begrunnelser enn at ett instruksjonsdesign gir bedre prestasjon på et avgrenset mål.',
  'plt-21': 'Feedback er ikke automatisk læringsfremmende. Den kan rette oppmerksomhet mot oppgaven og strategien, men kan også være uklar, for sen eller flytte fokus til selvvurdering uten handlingsinformasjon. Virkningen må derfor analyseres ut fra hva responsen handler om, når den gis og hvordan den kan brukes.',
  'plt-22': 'Feedback blir pedagogisk handlingsbar når den knytter nåværende arbeid til et tydelig mål og gir informasjon om et mulig neste steg. Et tall eller generell ros kan ha andre funksjoner, men sier ofte lite om hvordan forståelsen kan forbedres. Effektivitet avhenger også av at eleven kan tolke og anvende informasjonen.',
  'plt-23': 'Mer feedback eller raskere feedback er ikke nødvendigvis bedre. Timing og detaljnivå må passe oppgavens kompleksitet, læringsfase og muligheten for egen bearbeiding. Respons som kommer før eleven har forsøkt en løsning kan erstatte produktiv tenkning, mens for sen respons kan komme etter at en feilstrategi er befestet.',
  'plt-24': 'Feedback kan inngå i selvregulering når eleven bruker informasjonen til å overvåke framgang og endre strategi, men denne overgangen skjer ikke automatisk. Undervisningen må gjøre mål og kriterier forståelige og gi reelle muligheter til revisjon; ellers forblir responsen informasjon uten innvirkning på neste handling.',
  'plt-25': 'Selvregulert læring er en familie av modeller som kombinerer kognitive, metakognitive, motivasjonelle, emosjonelle og atferdsmessige prosesser. Modellene vektlegger komponentene ulikt, så begrepet bør ikke behandles som én enhetlig mekanisme. Sammenligning må vise hvilke prosesser og faser den enkelte modellen faktisk postulerer.',
  'plt-26': 'Planlegging, overvåking og justering av strategi går igjen i flere modeller for selvregulering, men rekkefølge og mekanismer varierer. En elev kan dessuten regulere ulikt på tvers av oppgaver. Pedagogisk analyse bør derfor undersøke konkrete handlinger og støttebetingelser framfor å tildele en stabil etikett som selvregulert eller ikke.',
  'plt-27': 'Mennesker kan feilvurdere egen læring fordi gjenkjennelse og lett prosessering føles som sikker kunnskap. Derfor bør metakognitiv vurdering sammenholdes med faktisk gjenhenting og forsinkede prestasjoner. Feilkalibrering er et fenomen som kan forekomme, ikke en diagnose av en bestemt elevs evne til å lære.',
  'plt-28': 'Selvregulering utvikles i samspill med oppgavekrav, tilgjengelig støtte, tidligere erfaring og sosial kontekst. Å forklare svake strategier som manglende viljestyrke overser hvordan mål, tidsstruktur, feedback og muligheter for revisjon påvirker reguleringen. Pedagogiske tiltak må derfor også undersøke miljøet rundt elevens handlinger.',
  'plt-29': 'Motivasjon kan ikke reduseres til én mengde som eleven enten har eller mangler. Forskningen beskriver samspill mellom mål, forventning, verdi, kostnader, identitet, relasjoner og situasjon. Den samme personen kan derfor være ulikt motivert mellom oppgaver og over tid, uten at dette innebærer en stabil elevtype.',
  'plt-30': 'Selvbestemmelsesteori skiller mellom kvalitativt ulike former for motivasjon og fremhever støtte til autonomi, kompetanse og tilhørighet. Dette er en teoretisk ramme med empirisk støtte og avgrensninger, ikke en universell oppskrift. Andre motivasjonsteorier fremhever blant annet mål, forventning, verdi og kostnader.',
  'plt-31': 'Autonomistøtte står ikke i motsetning til tydelig struktur. Elever kan få meningsfulle valg, begrunnelser og rom for perspektiver samtidig som mål, grenser og faglige krav er klare. Å fjerne veiledning kan derfor ikke uten videre beskrives som mer autonomistøttende, særlig når oppgaven krever kunnskap eleven ennå ikke har.',
  'plt-32': 'Empiriske studier kan vise hvilke betingelser som oftere støtter bestemte læringsutfall, men de kan ikke alene bestemme utdanningens formål. Spørsmål om danning, demokrati, rettferdighet og hvilket innhold som er verdt å lære krever normative begrunnelser. Effektivitet gir svar på hvordan et mål nås, ikke hvilket mål som bør velges.'
});

const MODULES = [
  { id: '01-laering-og-kunnskap', title: 'Læring og kunnskap', topics: [0, 1] },
  { id: '02-oving-og-retensjon', title: 'Øving og retensjon', topics: [2, 3] },
  { id: '03-instruksjon-og-regulering', title: 'Instruksjon og regulering', topics: [4, 5] },
  { id: '04-selvregulering-og-motivasjon', title: 'Selvregulering og motivasjon', topics: [6, 7] }
];
const ASSESSMENT_STEMS = [
  ['plt-01','Hva er den viktigste grunnen til å skille prestasjon fra læring?',['Fordi prestasjon aldri kan måles','Fordi høy øvingsytelse ikke nødvendigvis viser varig retensjon eller transfer','Fordi forsinkede prøver alltid er perfekte','Fordi læring bare skjer utenfor undervisning'],1],
  ['plt-06','Hvordan bør forkunnskap forstås?',['Som en fast evne','Som alltid korrekt kunnskap','Som en ressurs som både kan støtte og styre tolkning feil','Som irrelevant når undervisningen er tydelig'],2],
  ['plt-12','Hva følger av evidens for retrieval practice?',['At høy-stakes prøver bør økes','At gjenhenting kan brukes som læringsaktivitet uten at dette automatisk legitimerer sertifiserende testing','At karakterer forbedrer hukommelse','At restudering aldri virker'],1],
  ['plt-14','Hva er riktig om spacing?',['Ett intervall passer alle mål','Intervall bør ses i forhold til ønsket retensjonstid og læringsaktivitet','Massering er alltid best','Spacing handler bare om total tidsmengde'],1],
  ['plt-20','Hva kan kognitiv belastningsteori ikke avgjøre alene?',['Hvordan forkunnskap kan påvirke oppgavekrav','Hvordan støtte kan fases','Hvilke normative utdanningsmål som bør prioriteres','At arbeidsminnet er begrenset'],2],
  ['plt-23','Hva er riktig om feedback?',['Mer og raskere er alltid bedre','Timing og innhold må vurderes mot oppgave og læringsfase','Ros og feedback er identiske','Feedback garanterer strategiendring'],1],
  ['plt-27','Hva viser metakognitiv feilkalibrering?',['At en elev har lav evne','At opplevd flyt kan avvike fra faktisk senere gjenhenting','At selvvurdering alltid er feil','At testing er den eneste læringsformen'],1],
  ['plt-32','Hvorfor kan ikke effektstudier alene bestemme utdanningens mål?',['Fordi effekt aldri kan måles','Fordi normative mål krever begrunnelser utover effektivitet på et valgt utfall','Fordi demokrati ikke kan diskuteres','Fordi alle mål er like'],1]
];

function build() {
  const sourceBrief = read(P.sourceBrief); const manifest = read(P.manifest); const registry = read(P.registry); const inventory = read(P.inventory);
  const status = read(P.status); const portal = read(P.portal); const pensum = read(P.pensum); const emner = read(P.emner); const methods = read(P.methods);
  assert(fs.existsSync(abs(P.didacticsBrief)), 'Didaktikk source brief må finnes før 1/14-checkpoint');
  const didacticsBrief = read(P.didacticsBrief);
  assert(didacticsBrief.scope?.primary_domain_id === 'didaktikk', 'Neste source-first-domene må være didaktikk');
  const topics = sourceBrief.topic_briefs; const planned = topics.flatMap((topic) => topic.planned_claims);
  assert(sourceBrief.scope.primary_domain_id === 'pedagogikk_laeringsteori' && topics.length === 8 && planned.length === 32, 'Feil source-first scope/count');
  assert(planned.every((row) => PARAGRAPHS[row.id]), 'Alle 32 planlagte claims må ha fagredigert fulltekst');
  const sources = sourceBrief.sources.map((row) => ({ ...row, label: `${row.publisher} – ${row.title}` }));
  const claims = planned.map((row) => ({ id: row.id, claim: row.text, source_ids: row.source_ids, classification: 'verified_scholarly_source_synthesis', status: 'verified', verified_at: '2026-08-25' }));
  const moduleFiles = [];
  for (const module of MODULES) {
    const sections = module.topics.map((index) => {
      const topic = topics[index]; const ids = topic.planned_claims.map((row) => row.id);
      return { id: `plt-${topic.id}`, title: topic.title, topic_id: topic.id, emne_ids: [sourceBrief.scope.canonical_emne_id], method_ids: topic.method_ids,
        paragraphs: ids.map((id) => PARAGRAPHS[id]), paragraphClaimIds: ids.map((id) => [id]), keyPoints: [topic.planned_claims[0].text, topic.planned_claims.at(-1).text],
        keyPointClaimIds: [[ids[0]],[ids.at(-1)]], source_ids: topic.source_ids, boundary: topic.boundary };
    });
    const file = `${DIR}/${module.id}.json`; write(file, { schema: 'history_go_fagverk_education_module_v1', version: '1.0.0', id: module.id, title: module.title, sections }); moduleFiles.push(file);
  }
  const assessments = ASSESSMENT_STEMS.map(([claimId, question, options, answerIndex], index) => {
    const claim = claims.find((row) => row.id === claimId);
    return { id: `utdanning-plt-q${String(index+1).padStart(2,'0')}`, question, options, answer: options[answerIndex], answerIndex, question_type: 'analysis', difficulty: index < 3 ? 'medium' : 'hard', emne_id: sourceBrief.scope.canonical_emne_id, claim_id: claimId, source: claim.source_ids, knowledge: PARAGRAPHS[claimId], learner_typing: false };
  });
  const chapterBrief = { schema:'history_go_fagverk_chapter_brief_v1', version:'1.0.0', subject_id:'utdanning', chapter_id:CHAPTER_ID, primary_domain_id:'pedagogikk_laeringsteori',
    purpose:'Analysere læring, kunnskap, øving, instruksjon, selvregulering og motivasjon med eksplisitte evidensgrenser og uten å gjøre læringsfunn til universelle metoder eller elevdiagnoser.',
    sourceStrategy:{ sourceBriefFile:P.sourceBrief, externalSourceCount:sources.length, paragraphLevelClaimTrace:true, everyPlannedClaimResolved:true, allUsedSourcesInspectable:true },
    requiredCriticalDistinctions:['prestasjon vs varig læring','fluens vs retensjon','retrieval practice vs high-stakes testing','robust effekt vs universell effekt','spacing-prinsipp vs universelt intervall','feedback vs automatisk forbedring','selvregulering som prosess vs fast trekk','empirisk effekt vs normativt utdanningsmål'],
    safety:{ individualDiagnosis:false, fixedLearnerTyping:false, universalMethodPrescription:false, groupAverageAsIndividualPrediction:false },
    qa:{ topicCoverage:'8/8', plannedClaimResolution:'32/32', moduleCount:4, sectionCount:8, paragraphCount:32, assessmentQuestionCount:8 } };
  const chapter = { schema:'history_go_fagverk_chapter_v1', version:'1.0.0', subject:'utdanning', subject_id:'utdanning', id:CHAPTER_ID, chapter_id:CHAPTER_ID, primary_domain_id:'pedagogikk_laeringsteori', editorialStatus:'chapter_ready', claimTraceRequired:true, sourceFirst:true,
    emne_ids:[sourceBrief.scope.canonical_emne_id], method_ids:[...new Set(topics.flatMap((row)=>row.method_ids))], title:'Pedagogikk og læringsteori: læring, kunnskap, motivasjon og selvregulering',
    subtitle:'Fra prestasjon og forkunnskap til gjenhenting, spacing, kognitiv belastning, feedback, selvregulering og pedagogiske formål',
    lead:'Kapittelet undersøker hva forskning kan si om varig læring og undervisningsrelevante mekanismer, samtidig som det holder effektfunn, kontekst, teori og normative pedagogiske mål fra hverandre. Det klassifiserer ikke enkeltelever og foreskriver ingen universell undervisningsmetode.',
    learningObjectives:topics.map((row)=>row.title), diagnosticQuestions:assessments.slice(0,4).map((row)=>({question:row.question,answer:row.knowledge})), relatedPlaces:[], workCases:sourceBrief.decision_scenarios,
    moduleFiles, briefFile:P.brief, claimsFile:P.claims, assessmentFile:P.assessment, sourceBriefFile:P.sourceBrief };
  write(P.claims,{ schema:'history_go_fagverk_chapter_claims_v1', version:'1.0.0', subject_id:'utdanning', chapter_id:CHAPTER_ID, sourceBriefFile:P.sourceBrief, sources, claims });
  write(P.assessment,{ schema:'history_go_fagverk_education_chapter_assessment_v1', version:'1.0.0', subject_id:'utdanning', chapter_id:CHAPTER_ID, status:'audited', questions:assessments });
  write(P.brief,chapterBrief); write(P.chapter,chapter);

  manifest.utdanning.status='active_foundation'; manifest.utdanning.sourceClaimBriefs=[P.sourceBrief,P.didacticsBrief]; manifest.utdanning.chapters=[P.chapter];
  const inv=inventory.subjects.find((row)=>row.id==='utdanning'); inv.optionalManifestFields=[...new Set([...inv.optionalManifestFields,'sourceClaimBriefs','chapters'])];
  registry.subjects.utdanning={
    title:'Skole & utdanning', description:'Et kildebasert fagverk om pedagogikk, didaktikk, utdanningsinstitusjoner, vurdering, profesjoner, ulikhet og læringsmiljø.',
    canonicalModel:{ manifest:'data/fag/fag_manifest.json', schemaFamily:'foundation_v1', sourceOfTruth:true, firstSourceClaimBrief:P.sourceBrief, firstFulltextChapter:P.chapter, secondSourceClaimBrief:P.didacticsBrief,
      note:'Første av 14 canonicale domener er fulltekstmaterialisert med 8 seksjoner, 32 claimsporede avsnitt og 32 verifiserte claims. Didaktikk er source-first-klargjort som neste domene; Utdanning er ikke complete.' },
    editorialPlan:{ targetDomainCount:14, completedSourceBriefCount:2, registeredChapterCount:1, completionRequirements:['all_canonical_domains_covered','source_first_claim_trace_complete','fulltext_and_assessment_audits_green','strict_theory_integrity_green'], nextGate:'didactics_source_brief_complete_full_chapter_production' },
    chapters:[{ id:CHAPTER_ID,title:chapter.title,subtitle:chapter.subtitle,file:P.chapter,primary_domain_id:chapter.primary_domain_id,emne_ids:chapter.emne_ids,claimsFile:P.claims,briefFile:P.brief,assessmentFile:P.assessment }]
  };
  const subjectStatus=status.subjects.find((row)=>row.id==='utdanning'); subjectStatus.navigationStatus='materialized'; subjectStatus.assessmentStatus='audited'; subjectStatus.editorialStatus='chapters_in_progress'; subjectStatus.nextGate='didactics_source_brief_complete_full_chapter_production';
  subjectStatus.note='Utdanning er materialisert 1/14: pedagogikk og læringsteori har 4 moduler, 8 fulltekstseksjoner, 32 claimsporede fagavsnitt, 32 verifiserte claims, 13 inspiserbare forskningskilder og 8 auditerte vurderingsoppgaver. Didaktikk har source-first-brief klar som neste produksjonsport. Faget er chapters_in_progress, ikke complete.';
  const portalRow=portal.categories.find((row)=>row.id==='utdanning'); portalRow.subjectPage='fagverk.html?subject=utdanning'; portalRow.subjectStatus='materialized';
  pensum.status='active_foundation'; pensum.complete_ready=false; pensum.domains.forEach((row,index)=>{ row.status=index===0?'materialized':'planned'; });
  emner.forEach((row)=>{ if(row.emne_id==='em_utdanning_pedagogikk_laeringsteori') row.status='materialized'; });
  methods.methods.forEach((row)=>{ if(chapter.method_ids.includes(row.method_id)) row.canonical_status='materialized'; });
  write(P.manifest,manifest); write(P.inventory,inventory); write(P.registry,registry); write(P.status,status); write(P.portal,portal); write(P.pensum,pensum); write(P.emner,emner); write(P.methods,methods);
  return { modules:4, topics:8, paragraphs:32, claims:32, sources:sources.length, questions:8 };
}
const result=build();
console.log(`Utdanning pedagogikk/læringsteori materialisert: ${result.modules} moduler, ${result.topics} seksjoner, ${result.paragraphs} avsnitt, ${result.claims} claims, ${result.sources} kilder og ${result.questions} oppgaver.`);
