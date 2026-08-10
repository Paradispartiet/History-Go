#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'offentlighet-ytringsfrihet-og-medieetikk';
const CHAPTER_DIR = 'data/fagverk/media/' + CHAPTER_ID;
const CHAPTER_FILE = CHAPTER_DIR + '.json';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const abs = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), JSON.stringify(value, null, 2) + '\n');
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const emneIds = [
  'em_media_kritikk_kommentar', 'em_media_debatt_offentlighet', 'em_media_kildevern',
  'em_media_makt_moter_presse', 'em_media_medieansvar', 'em_media_medieetikk',
  'em_media_medielegitimitet', 'em_media_medietillit', 'em_media_minoritetsmedier',
  'em_media_motoffentligheter', 'em_media_opplyst_offentlighet', 'em_media_pressefrihet',
  'em_media_pressekonferanse', 'em_media_pressekritikk', 'em_media_publiseringsansvar',
  'em_media_redaktoransvar', 'em_media_rettelser', 'em_media_tillit_politisering',
  'em_media_var_varsom', 'em_media_varsling', 'em_media_ytringsfrihet'
];

const methodIds = [
  'met_media_ansvarsanalyse', 'met_media_debattanalyse', 'met_media_kildevernanalyse',
  'met_media_legitimitetsanalyse', 'met_media_maktanalyse', 'met_media_medieetisk_analyse',
  'met_media_minoritetsmedieanalyse', 'met_media_motoffentlighetsanalyse',
  'met_media_offentlighetsanalyse', 'met_media_politiseringsanalyse',
  'met_media_pressefrihetsanalyse', 'met_media_pressekonferanseanalyse',
  'met_media_pressekritikkanalyse', 'met_media_publiseringsanalyse',
  'met_media_redaktoransvarsanalyse', 'met_media_rettelsesanalyse',
  'met_media_tillitsanalyse', 'met_media_var_varsom_analyse',
  'met_media_varsleranalyse', 'met_media_ytringsfrihetsanalyse'
];

const relatedPlaces = [
  { id: 'stortinget', name: 'Stortinget', role: 'Undersøk åpne møter, pressetilgang, pressehistorie og institusjonelle vilkår for offentlig kontroll.' },
  { id: 'tinghuset', name: 'Oslo tinghus', role: 'Analyser domstolsoffentlighet mot personvern, anonymisering og journalistisk publiseringsansvar.' },
  { id: 'litteraturhuset', name: 'Litteraturhuset', role: 'Studer debattarena, kunnskapsbasert offentlighet, motstemmer og minoritetsspråklige program.' },
  { id: 'aftenposten_akersgata', name: 'Aftenposten – Akersgata 51', role: 'Følg redaktøransvar, presseetikk, samtidig imøtegåelse og rettelser i et konkret redaktørstyrt medium.' }
];

const section = (id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds) => ({
  id, title, paragraphs, paragraphClaimIds, keyPoints, keyPointClaimIds
});

const chapter = {
  schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'media', subject_id: 'media',
  id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'offentlighet_ytringsfrihet_etikk',
  editorialStatus: 'chapter_ready', claimTraceRequired: true, emne_ids: emneIds, method_ids: methodIds,
  title: 'Offentlighet, ytringsfrihet og medieetikk: frihet, ansvar og tillit',
  subtitle: 'Fra Grunnloven, kildevern og redaktøransvar til presseetikk, mot-offentligheter og medienes legitimitet',
  lead: 'En demokratisk offentlighet krever både frihet til å ytre og institusjoner som gjør deltakelse mulig. Kapittelet viser samtidig hvorfor pressefrihet ikke opphever publiseringsansvar, hvorfor kildevern ikke beviser at en opplysning er sann, og hvorfor tillit må undersøkes som en holdning – ikke brukes som snarvei til sannhet eller kvalitet.',
  learningObjectives: [
    'skille ytringsfrihet, pressefrihet og statens ansvar for en åpen og opplyst offentlig samtale',
    'skille journalistisk kildevern fra arbeidstakerens varslervern og fra redaksjonens verifiseringsplikt',
    'kartlegge redaktørens uavhengighet, innholdsansvar og konkrete publiseringsbeslutninger',
    'skille lovkrav fra Vær Varsom-plakaten og PFUs presseetiske selvjustis',
    'analysere rettelser og samtidig imøtegåelse uten å gi kilder veto over publisering',
    'undersøke debattarenaer, mot-offentligheter og minoritetsmedier gjennom faktisk tilgang og deltakelse',
    'analysere maktens møte med pressen som tilgang, utspørring, dokumentasjon og oppfølging',
    'skille medietillit, politisering og legitimitet fra direkte bevis på sannhet eller journalistisk kvalitet'
  ],
  diagnosticQuestions: [
    { question: 'Betyr ytringsfrihet at enhver ytring må publiseres av et bestemt medium?', answer: 'Nei. Retten til å ytre og redaksjonens rett og ansvar til å velge publisering er forskjellige spørsmål.' },
    { question: 'Gjør kildevern en anonym påstand sann?', answer: 'Nei. Kildevern beskytter identiteten; redaksjonen må fortsatt vurdere kunnskap, motiv og uavhengig dokumentasjon.' },
    { question: 'Er presseetikk det samme som lov?', answer: 'Nei. Lov setter rettslige grenser, mens Vær Varsom-plakaten og PFU er pressens egen etiske norm og klageordning.' },
    { question: 'Beviser høy medietillit at alle publiseringer er sanne?', answer: 'Nei. Tillitsmålinger viser vurderinger i en befolkning; kvalitet og sannhet må prøves mot sakens evidens.' }
  ],
  relatedPlaces,
  moduleFiles: [CHAPTER_DIR + '/01-grunnlag.json', CHAPTER_DIR + '/02-fordypning.json', CHAPTER_DIR + '/03-anvendelse.json'],
  briefFile: CHAPTER_DIR + '/brief.json', claimsFile: CHAPTER_DIR + '/claims.json'
};

const brief = {
  schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'media',
  chapter_id: CHAPTER_ID, primary_domain_id: 'offentlighet_ytringsfrihet_etikk',
  relatedPlaceIds: relatedPlaces.map((place) => place.id),
  purpose: 'Materialisere Medias andre canonicale domene med claimsporet undervisning i offentlighet, ytrings- og pressefrihet, kildevern, redaktøransvar, presseetikk, debatt, minoritetsmedier, tillit og legitimitet.',
  audience: 'Brukere som skal analysere frihet, ansvar og mediemakt uten å forveksle rettigheter med grenseløs publisering, selvjustis med lov eller tillit med sannhet.',
  learningArc: [
    'starte i Grunnloven § 100 og statens infrastrukturelle ansvar',
    'skille kildevern, varsling og journalistisk verifisering',
    'fordele redaktør-, eier- og publiseringsansvar',
    'prøve konkrete publiseringer mot Vær Varsom-plakaten og PFU',
    'analysere rettelser, imøtegåelse og tillit som forskjellige prosesser',
    'undersøke arenaer for debatt, mot-offentlighet og minoritetsstemmer',
    'kartlegge pressetilgang og kritisk kontroll ved Stortinget',
    'avslutte med en legitimitetsanalyse som holder popularitet, sannhet og ansvar fra hverandre'
  ],
  requiredEmneIds: emneIds, requiredMethodIds: methodIds,
  requiredCriticalDistinctions: [
    'ytringsfrihet vs krav om publisering i et bestemt medium', 'pressefrihet vs fravær av rettslig og etisk ansvar',
    'kildevern vs sannhetsbevis', 'journalistisk kildevern vs arbeidstakerens varslervern',
    'redaksjonell uavhengighet vs eier uten økonomisk eller organisatorisk rolle', 'lovansvar vs presseetisk selvjustis',
    'kritikk og kommentar vs kontrollerbar faktapåstand', 'rettelse vs slettet publiseringshistorikk',
    'samtidig imøtegåelse vs kildeveto', 'åpent møte vs ubegrenset opptak og publisering',
    'pressetilgang vs kritisk kontroll', 'målt tillit vs bevis på sannhet og kvalitet',
    'mediemangfold vs alle stemmer i alle medier', 'mot-offentlighet vs lukket ekkokammer',
    'minoritetsmedium vs offentlig irrelevans', 'pressekritikk vs udokumentert delegitimering',
    'legitimitet vs popularitet'
  ],
  sourceStrategy: {
    priority: ['Grunnloven, lovtekst og Stortingets forarbeider', 'EMD og Arbeidstilsynets rettighetskilder', 'Redaktørplakaten, Vær Varsom-plakaten og PFU', 'Medietilsynet, SSB, Domstoladministrasjonen og institusjonenes dokumentasjon'],
    minimumExternalSources: 18, claimLevelTrace: true, sourceLocationsRequired: true,
    currentStatusClaimsRequireCurrentSource: true
  },
  scope: {
    included: ['ytrings- og pressefrihet', 'kildevern og varslervern', 'redaktør- og publiseringsansvar', 'presseetikk, rettelser og imøtegåelse', 'debatt, mot-offentligheter, minoritetsmedier, tillit og legitimitet', 'Stortinget, Oslo tinghus, Litteraturhuset og Akersgata som stedscase'],
    excluded: ['teori brukt som faktabevis', 'rettigheter framstilt som grenseløse', 'anonym kilde brukt uten verifiseringsspor', 'PFU framstilt som domstol', 'tillit brukt som sannhetsmål', 'ett debattsted framstilt som hele offentligheten']
  },
  qa: { exactCanonicalCoverage: '21/21', minimumModules: 3, minimumSections: 9, paragraphClaimTraceRequired: true, rendererFieldsRequired: ['relatedPlaces', 'sources.label', 'commonMisconceptions.claim', 'commonMisconceptions.correction'] }
};

const modules = {
  '01-grunnlag.json': {
    sections: [
      section('oye-grunnlag-1', 'Ytringsfrihet krever både vern og infrastruktur', [
        'Grunnloven § 100 verner ytringsfriheten, men åpner for ansvar når inngrep kan forsvares mot ytringsfrihetens begrunnelser. Vernet betyr derfor ikke at enhver ytring er uten rettslige følger eller at et bestemt redaktørstyrt medium må publisere den.',
        'Den samme bestemmelsen gir rett til innsyn i statens og kommunenes dokumenter og til å følge rettsmøter og folkevalgte organer innen lovbestemte grenser. Offentlighet er dermed institusjonelt organisert tilgang, ikke ubegrenset rett til opptak, spredning eller personopplysninger.',
        'Grunnloven pålegger staten å legge forholdene til rette for en åpen og opplyst offentlig samtale. Stortingets behandling beskriver dette som et aktivt ansvar for kanaler og faktisk deltakelse, men ikke som et krav om at alle får lik oppmerksomhet i enhver kanal.'
      ], [['oye-01'], ['oye-02'], ['oye-03']], [
        'Skill retten til å ytre fra retten til å bli publisert av en bestemt redaksjon.',
        'Test offentlighet gjennom tilgang og deltakelsesvilkår, ikke bare formell frihet.'
      ], [['oye-01'], ['oye-02', 'oye-03']]),
      section('oye-grunnlag-2', 'Kildevern og varslervern beskytter ulike relasjoner', [
        'Den europeiske menneskerettsdomstolen omtaler vern av journalistiske kilder som en grunnbetingelse for pressefrihet. Pålegg om å avsløre en kilde krever en særlig tungtveiende offentlig begrunnelse; vernet beskytter informasjonsstrømmen, ikke sannheten i hvert kildeutsagn.',
        'Arbeidsmiljølovens varslerregler gjelder arbeidstakerens rett til å si fra om kritikkverdige forhold og forbyr gjengjeldelse. Varslervern kan eksistere uten at saken går til pressen, og journalistisk kildevern kan gjelde en kilde som ikke er arbeidstaker.',
        'En kildevernanalyse registrerer derfor hvem som kjenner identiteten, hvilken risiko kilden møter, hva redaksjonen har kontrollert og hvilke alternative dokumenter som finnes. Anonymitet kan være nødvendig, men kan ikke erstatte verifisering eller gjøre en ubegrunnet påstand publiseringsklar.'
      ], [['oye-04'], ['oye-05'], ['oye-06']], [
        'Skill vern av identitet fra kontroll av opplysning.',
        'Skill journalistisk kildevern fra arbeidstakerens varslervern.'
      ], [['oye-04', 'oye-06'], ['oye-05']]),
      section('oye-grunnlag-3', 'Redaktøren er uavhengig og ansvarlig', [
        'Redaktørplakaten gir redaktøren fullt personlig ansvar for mediets innhold og rett til å lede redaksjonen. Eierens økonomiske og overordnede rolle forsvinner ikke, men eieren kan ikke instruere redaktøren i enkeltstående redaksjonelle spørsmål.',
        'Medieansvarsloven lovfester redaksjonell uavhengighet og et særskilt ansvarssystem for redaktørstyrte journalistiske medier. Juridisk ansvar må likevel knyttes til konkret publisering, rolle og lovregel; institusjonens navn alene fordeler ikke skyld.',
        'Publiseringsanalyse skiller dokumentasjon, faktapåstand, kritikk, kommentar, redigering og endelig beslutning. Skarp kritikk kan være legitim, men en kontrollerbar faktapåstand blir ikke til ren mening bare fordi den står i en kommentar.'
      ], [['oye-07'], ['oye-08'], ['oye-09']], [
        'Redaksjonell uavhengighet avskjærer instruksjon i enkeltsaker, ikke all eierstyring.',
        'Skill sjanger og mening fra påstander som kan etterprøves.'
      ], [['oye-07', 'oye-08'], ['oye-09']])
    ],
    concepts: [
      { id: 'ytringsfrihet', term: 'Ytringsfrihet', definition: 'Retten til å meddele og motta ytringer, begrunnet i sannhetssøking, demokrati og individets frie meningsdannelse.' },
      { id: 'pressefrihet', term: 'Pressefrihet', definition: 'Medienes frihet til å innhente, vurdere og publisere journalistikk uten utilbørlig inngrep, innen rettslige og etiske rammer.' },
      { id: 'kildevern', term: 'Kildevern', definition: 'Vern av fortrolige journalistiske kilders identitet for å sikre informasjonsflyt til pressen.' },
      { id: 'redaktoransvar', term: 'Redaktøransvar', definition: 'Redaktørens uavhengige ledelse og personlige ansvar for mediets publiserte innhold.' },
      { id: 'medieetikk', term: 'Medieetikk', definition: 'Pressens profesjonelle normer for sannhetssøking, omtanke, imøtegåelse, rettelser og ansvarlig publisering.' },
      { id: 'motoffentlighet', term: 'Mot-offentlighet', definition: 'Et rom der grupper kan utvikle erfaringer, språk og krav som er svakt representert i dominerende offentligheter.' }
    ]
  },
  '02-fordypning.json': {
    sections: [
      section('oye-fordypning-1', 'Presseetikk er selvjustis, ikke domstol', [
        'Vær Varsom-plakaten er pressens etiske norm for redaktørstyrte medier. Den virker ved siden av loven: en publisering kan være lovlig og likevel kritikkverdig, eller reise juridiske spørsmål som PFU ikke avgjør.',
        'PFU behandler klager på brudd på god presseskikk og publiserer uttalelser. Utvalget er en selvjustisordning, ikke en domstol; en fellelse dokumenterer et presseetisk brudd etter ordningen, ikke automatisk straff- eller erstatningsansvar.',
        'Ved Oslo tinghus må analyse av domstolsoffentlighet holde tilgang til dommer og dokumenter sammen med tidsfrister, konkrete saksopplysninger og begrensninger av hensyn til personvern. At et rettsmøte er åpent betyr ikke ubegrenset opptak eller ansvarsfri viderepublisering.'
      ], [['oye-10'], ['oye-11'], ['oye-12']], [
        'Prøv samme publisering separat mot lov og presseetikk.',
        'Åpen rett er tilgang under regler, ikke fri bruk av alt materialet.'
      ], [['oye-10', 'oye-11'], ['oye-12']]),
      section('oye-fordypning-2', 'Rettelse og imøtegåelse reparerer ulike feil', [
        'Vær Varsom-plakatens punkt 4.13 krever at feilaktige opplysninger rettes og eventuelt beklages snarest mulig. En rettelse gjør endringen synlig; den sletter ikke at den første publiseringen fant sted eller behovet for å bevare versjonsspor.',
        'Punkt 4.14 gir den som utsettes for sterke faktiske beskyldninger adgang til samtidig imøtegåelse så langt det er mulig. Retten er en mulighet til å svare på beskyldningen, ikke et kildeveto eller krav om å godkjenne journalistens konklusjon.',
        'Medietillit kan påvirkes av feil, rettelser, åpen metode og tidligere erfaringer, men måles som publikums vurdering. En tillitsmåling beviser verken at en enkelt sak er sann eller at et medium uten høy tillit leverer falsk journalistikk.'
      ], [['oye-13'], ['oye-14'], ['oye-15']], [
        'Bevar publiseringshistorikken når feil rettes.',
        'Skill svarmulighet og målt tillit fra henholdsvis veto og sannhetsbevis.'
      ], [['oye-13'], ['oye-14', 'oye-15']]),
      section('oye-fordypning-3', 'Debattarenaen er en del av offentligheten, ikke hele den', [
        'Litteraturhuset oppgir at institusjonen skal beskytte den frie ytringen og fremme demokrati og en kunnskapsbasert offentlig samtale. En debattanalyse må likevel registrere invitasjon, format, ordstyring, språk, publikum og distribusjon før arenaens åpenhet vurderes.',
        'Institusjonens prosjekter omfatter blant annet samiske og kvenske, afrikanske, skeive og flerspråklige program. Slike rom kan fungere som mot-offentligheter ved å utvikle perspektiver som får mindre plass andre steder; de er ikke av den grunn lukkede ekkokamre.',
        'Minoritetsmedier kan gi språk, kilder og saker stabil offentlig infrastruktur. Medietilsynets støtteordning for samiske nyhets- og aktualitetsmedier knytter dette til demokratisk debatt og meningsdanning, men mediemangfold betyr ikke at alle grupper må finnes i hver enkelt publikasjon.'
      ], [['oye-16'], ['oye-17'], ['oye-18']], [
        'Undersøk hvem som faktisk får tale, svare og bli distribuert.',
        'Skill mot-offentlighet og minoritetsmedium fra isolasjon og offentlig irrelevans.'
      ], [['oye-16', 'oye-17'], ['oye-18']])
    ],
    workedExamples: [
      { id: 'oye-eksempel-1', title: 'Prøv en anonym kilde', situation: 'En redaksjon mottar alvorlige opplysninger fra en anonym ansatt.', analysis: ['Kartlegg varslerens arbeidsrettslige vern og journalistens løfte om kildevern separat.', 'Test tilgang, motiv og risiko.', 'Finn dokumentasjon og uavhengig bekreftelse før publisering.'] },
      { id: 'oye-eksempel-2', title: 'Etisk og juridisk dobbeltest', situation: 'En omtalt person klager på en artikkel.', analysis: ['Identifiser faktapåstander, kommentar og publiseringstidspunkt.', 'Prøv lovspørsmål og Vær Varsom-punkter hver for seg.', 'Vurder imøtegåelse, rettelse og synlig versjonshistorikk.'] },
      { id: 'oye-eksempel-3', title: 'Kartlegg en debattarena', situation: 'Litteraturhuset arrangerer en offentlig samtale.', analysis: ['Registrer kuratering, språk, pris, lokale og strømming.', 'Tell hvem som inviteres og hvem som bare omtales.', 'Skill bred tilgang fra faktisk lik oppmerksomhet.'] }
    ],
    commonMisconceptions: [
      { claim: 'Ytringsfrihet gir rett til å bli publisert i enhver avis.', correction: 'Ytringsretten og redaksjonens uavhengige publiseringsvalg er forskjellige rettigheter og ansvar.' },
      { claim: 'Kildevern gjør en anonym opplysning troverdig.', correction: 'Vernet gjelder identiteten; opplysningen må fortsatt kildekritiseres og verifiseres.' },
      { claim: 'PFU avgjør om en publisering er ulovlig.', correction: 'PFU vurderer god presseskikk; domstolene avgjør rettslig ansvar.' },
      { claim: 'Samtidig imøtegåelse gir den omtalte vetorett.', correction: 'Den omtalte skal få reell svarmulighet, men kontrollerer ikke redaksjonens konklusjon.' },
      { claim: 'Høy tillit beviser at et medium alltid har rett.', correction: 'Tillit beskriver publikums vurdering; sannhet og kvalitet må undersøkes i den konkrete saken.' }
    ]
  },
  '03-anvendelse.json': {
    sections: [
      section('oye-anvendelse-1', 'Pressetilgang er ikke det samme som kritisk kontroll', [
        'Stortingets adgangsregler krever akkreditering og setter rammer for pressens arbeid i bygningen. Tilgang gjør observasjon og spørsmål mulig, men dokumenterer ikke at alle redaksjoner får like spørsmålstider eller at makthavere faktisk blir kritisk fulgt opp.',
        'Stortingets pressehistorie oppgir at Morgenbladet trykte den første stortingsreportasjen i 1821, før Stortinget fikk stenografer. Pressen ble dermed en tidlig kanal fra forhandlingene til offentligheten, men reportasjen forble et journalistisk utvalg av møtet.',
        'Møter i Stortinget er som hovedregel åpne, og kontrollhøringer er normalt åpne og strømmede. En maktanalyse sammenligner likevel dagsorden, tilgjengelige dokumenter, spørsmål, svar, avbrudd og senere oppfølging; selve åpenheten garanterer ikke kritisk kontroll.'
      ], [['oye-19'], ['oye-20'], ['oye-21']], [
        'Dokumenter akkreditering, spørsmålsmulighet og oppfølging separat.',
        'Åpenhet skaper kontrollmulighet, men er ikke bevis på at kontrollen skjer.'
      ], [['oye-19'], ['oye-20', 'oye-21']]),
      section('oye-anvendelse-2', 'Mangfold må måles i avsender, innhold og bruk', [
        'Medietilsynets mangfoldsarbeid skiller avsendermangfold, innholdsmangfold og bruksmangfold. Flere medieeiere eller titler kan gi flere mulige kilder, men beviser ikke alene tematisk bredde, faktisk bruk eller representasjon.',
        'SSBs analyse av Mediebarometeret viser både utbredt daglig nyhetsbruk og variasjon etter plattform, alder, språk og innvandrerbakgrunn. Slike gruppemønstre må leses som statistiske fordelinger; de beskriver ikke hvert individ og gjør ikke minoritetsmedier til en ubetydelig nisje.',
        'Mediekritisk analyse spør hvem som eier data og målemetode, hvordan tillit eller bruk er operasjonalisert, og hvilke grupper som mangler. Et gjennomsnitt kan belyse offentligheten, men kan også skjule mot-offentligheter og ulike erfaringer med samme medium.'
      ], [['oye-22'], ['oye-23'], ['oye-24']], [
        'Skill avsendere, innhold og faktisk bruk når mediemangfold vurderes.',
        'Les gruppetall som fordelinger og undersøk fravær bak gjennomsnittet.'
      ], [['oye-22'], ['oye-23', 'oye-24']]),
      section('oye-anvendelse-3', 'Kritikk, politisering og legitimitet må skilles', [
        'Pressekritikk kan etterprøve kildevalg, feil, prioritering, språk og maktrelasjoner. Politisering oppstår ikke bare fordi kritikken er skarp; analysen må vise hvordan journalistikk tilordnes partiposisjon eller angripes som illegitim uten å prøve den konkrete evidensen.',
        'Medielegitimitet handler om hvorvidt publikum oppfatter institusjonens rolle, regler og ansvar som berettiget. Popularitet kan bidra til legitimitet, men er ikke identisk med den: et upopulært korrektiv kan følge åpne regler, mens et populært medium kan bryte dem.',
        'Avslutt med fire separate kolonner: dokumentert sannhet i saken, juridisk ansvar, presseetisk vurdering og publikums tillit. Først når kolonnene holdes fra hverandre, kan Stortinget, tinghuset, Litteraturhuset og Akersgata sammenlignes som forskjellige infrastrukturer for offentlighet.'
      ], [['oye-25'], ['oye-26'], ['oye-27']], [
        'Kritiser journalistikk med konkrete spor; ikke erstatt analyse med delegitimering.',
        'Hold sannhet, lov, etikk, tillit og popularitet analytisk adskilt.'
      ], [['oye-25'], ['oye-26', 'oye-27']])
    ],
    applicationTasks: [
      { id: 'oye-oppgave-1', title: 'Test § 100 i praksis', task: 'Velg en offentlig beslutningsprosess.', prompts: ['Hvilke dokumenter og møter er tilgjengelige?', 'Hvilke lovlige begrensninger finnes?', 'Hvem har reell mulighet til å delta?'] },
      { id: 'oye-oppgave-2', title: 'Kildevernmatrise', task: 'Analyser en sak med fortrolig kilde.', prompts: ['Hva beskyttes og hvorfor?', 'Hva er uavhengig kontrollert?', 'Er varslervern også relevant?'] },
      { id: 'oye-oppgave-3', title: 'PFU og lov', task: 'Prøv én publisering mot to normsett.', prompts: ['Hva er de kontrollerbare påstandene?', 'Hvilke VVP-punkter gjelder?', 'Hvilke rettsspørsmål må holdes utenfor PFU-vurderingen?'] },
      { id: 'oye-oppgave-4', title: 'Debatt og mot-offentlighet', task: 'Kartlegg én uke ved Litteraturhuset.', prompts: ['Hvem kuraterer og deltar?', 'Hvilke språk og distribusjonsformer brukes?', 'Hvilke motstemmer får egen infrastruktur?'] },
      { id: 'oye-oppgave-5', title: 'Tillit uten snarveier', task: 'Les en aktuell tillitsmåling.', prompts: ['Hvordan er tillit definert og målt?', 'Hvilke grupper og usikkerheter vises?', 'Hvilken evidens kreves for å bedømme en konkret publisering?'] }
    ],
    selfCheck: [
      { question: 'Hva er statens infrastrukturansvar?', answer: 'Å legge til rette for kanaler og vilkår for en åpen og opplyst offentlig samtale.' },
      { question: 'Hva beskytter kildevernet?', answer: 'Den fortrolige journalistiske kildens identitet og dermed informasjonsflyten til pressen.' },
      { question: 'Hva skiller varslervern fra kildevern?', answer: 'Varslervern gjelder arbeidstakerens forhold til arbeidslivet; kildevern gjelder journalistens fortrolige kilde.' },
      { question: 'Hva er PFUs rolle?', answer: 'Å vurdere klager mot pressens egne etiske normer, ikke å avsi rettslige dommer.' },
      { question: 'Hva innebærer samtidig imøtegåelse?', answer: 'En reell mulighet til å svare på sterke faktiske beskyldninger før publisering, ikke veto.' },
      { question: 'Hva viser en tillitsmåling?', answer: 'Hvordan respondenter vurderer medier under en bestemt metode og periode, ikke om en konkret sak er sann.' },
      { question: 'Hva skiller legitimitet fra popularitet?', answer: 'Legitimitet gjelder berettigede roller og regler; popularitet gjelder oppslutning eller preferanse.' }
    ]
  }
};

const source = (id, publisher, title, url, source_location, type) => ({ id, publisher, title, url, source_location, type, label: publisher + ' – ' + title });
const sources = [
  source('oye01-grunnloven', 'Lovdata', 'Grunnloven § 100', 'https://lovdata.no/nav/lov/1814-05-17/kapE/%C2%A7100', '§ 100 om ytringsfrihet, dokument- og møteoffentlighet og statens infrastrukturansvar', 'constitutional-law'),
  source('oye02-infrastruktur', 'Stortinget', 'Innstilling om ytringsfriheten', 'https://stortinget.no/no/Saker-og-publikasjoner/Publikasjoner/Innstillinger/Stortinget/2003-2004/inns-200304-270/7/', 'Kapittel 7 om infrastrukturkravet, kanaler og faktisk deltakelse', 'parliamentary-report'),
  source('oye03-echr', 'Den europeiske menneskerettsdomstolen', 'Protection of journalistic sources', 'https://www.echr.coe.int/documents/d/echr/fs_journalistic_sources_eng', 'Avsnittet om Goodwin mot Storbritannia og kildevern som grunnbetingelse for pressefrihet', 'court-factsheet'),
  source('oye04-whistle', 'Arbeidstilsynet', 'Varsling', 'https://www.arbeidstilsynet.no/arbeidsmiljo/varsling/', 'Oversikten over retten til å varsle om kritikkverdige forhold og forbudet mot gjengjeldelse', 'regulator-guidance'),
  source('oye05-editor', 'Norsk Redaktørforening', 'Redaktørplakaten', 'https://www.redaktor.no/ressurser/etiske-og-juridiske-rammeverk/redaktorplakaten', 'Avsnittene om redaktørens uavhengighet, ledelse, kildevern og fulle innholdsansvar', 'professional-standards'),
  source('oye06-law', 'Lovdata', 'Medieansvarsloven', 'https://lovdata.no/lov/2020-05-29-59', 'Kapittel 2 om redaksjonell uavhengighet og kapitlene om ansvar', 'statute'),
  source('oye07-vvp', 'Norsk Presseforbund', 'Vær Varsom-plakaten', 'https://www.presse.no/vaer-varsom-plakaten', 'Plakatens virkeområde og presseetiske grunnregler', 'professional-standards'),
  source('oye08-pfu', 'Norsk Presseforbund', 'Pressens Faglige Utvalg', 'https://presse.no/pfu/', 'Beskrivelsen av PFU som pressens klageorgan for god presseskikk', 'self-regulation'),
  source('oye09-court', 'Norges domstoler', 'Lese en dom', 'https://www.domstol.no/no/lese-en-dom/', 'Avsnittene om tilgang til dommer og dokumenter, tidsgrenser og anonymisering', 'court-guidance'),
  source('oye10-correction', 'Norsk Presseforbund', 'Vær Varsom-plakaten 4.13', 'https://www.presse.no/vaer-varsom-plakaten/4-13', 'Punkt 4.13 om å rette og eventuelt beklage feilaktige opplysninger snarest mulig', 'professional-standards'),
  source('oye11-reply', 'Norsk Presseforbund', 'Vær Varsom-plakaten 4.14', 'https://www.presse.no/vaer-varsom-plakaten/4-14', 'Punkt 4.14 om samtidig imøtegåelse av sterke faktiske beskyldninger', 'professional-standards'),
  source('oye12-trust', 'Medietilsynet', 'NRKs bidrag til mediemangfoldet', 'https://www.medietilsynet.no/fakta/rapporter/kringkasting/2026/nrks-bidrag-til-mediemangfoldet/', 'Avsnittene om tillitsundersøkelsen og skillet mellom innholds-, bruks- og avsendermangfold', 'regulator-report'),
  source('oye13-litfree', 'Litteraturhuset', 'Ytringsfrihet og demokrati', 'https://www.litteraturhuset.no/nb/ytringsfrihet-og-demokrati', 'Formålsbeskrivelsen om fri ytring, demokrati og kunnskapsbasert offentlig samtale', 'institution-mission'),
  source('oye14-litprojects', 'Litteraturhuset', 'Større prosjekter', 'https://www.litteraturhuset.no/nb/storre-prosjekter', 'Prosjektene med samiske, kvenske, afrikanske, skeive og flerspråklige program og distribusjon', 'institution-program-record'),
  source('oye15-sami', 'Medietilsynet', 'Samiske nyhets- og aktualitetsmedier', 'https://www.medietilsynet.no/mediestotte/samiske-aviser/om-a-vare-samisk-nyhets--og-aktualitetsmedium/', 'Formålet med støtte til demokratisk debatt, meningsdanning og journalistikk på samiske språk', 'regulator-guidance'),
  source('oye16-access', 'Stortinget', 'Regler for pressens adgang til Stortinget', 'https://www.stortinget.no/no/Hva-skjer-pa-Stortinget/Presse/regler-for-pressens-adgang-til-stortinget/', 'Reglene om akkreditering, adgang og pressearbeid i stortingsbygningen', 'parliamentary-rules'),
  source('oye17-lodge', 'Stortinget', 'Stortingets presselosje', 'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/stortingets-presselosje/', 'Historien om Morgenbladets stortingsreportasje i 1821 og presselosjens utvikling', 'parliamentary-history'),
  source('oye18-archive', 'Stortinget', 'Stortingsarkivet', 'https://www.stortinget.no/stortingsarkivet', 'Avsnittene om åpne møter, lukkede møter, innsyn og offentlig journal', 'parliamentary-access'),
  source('oye19-diversity', 'Medietilsynet', 'Avsendermangfoldsrapporten 2025', 'https://www.medietilsynet.no/globalassets/publikasjoner/mediemangfoldsregnskap/260121_avsendermangfoldsrapport25.pdf', 'Innledningen og rammeverket for avsender-, innholds- og bruksmangfold', 'regulator-report'),
  source('oye20-ssb', 'Statistisk sentralbyrå', 'Innvandrerbakgrunn er av liten betydning for medievanene', 'https://www.ssb.no/kultur-og-fritid/tids-og-mediebruk/statistikk/norsk-mediebarometer/artikler/innvandrerbakgrunn-er-av-liten-betydning-for-medievanene', 'Resultatene fra Norsk mediebarometer 2022 om nyhetsbruk, plattform, alder og språk', 'official-statistics')
];

const claim = (id, text, source_ids, used_in) => ({ id, claim: text, source_ids, status: 'verified', used_in });
const claims = [
  claim('oye-01', 'Grunnloven § 100 verner ytringsfriheten, men tillater ansvar og inngrep som kan forsvares mot bestemmelsens begrunnelser.', ['oye01-grunnloven'], ['oye-grunnlag-1']),
  claim('oye-02', 'Grunnloven § 100 gir tilgang til offentlige dokumenter og møter innen grenser fastsatt i lov.', ['oye01-grunnloven'], ['oye-grunnlag-1']),
  claim('oye-03', 'Staten har et aktivt ansvar for kanaler og vilkår som muliggjør en åpen, opplyst og faktisk tilgjengelig offentlig samtale.', ['oye01-grunnloven', 'oye02-infrastruktur'], ['oye-grunnlag-1']),
  claim('oye-04', 'EMD beskriver journalistisk kildevern som en grunnbetingelse for pressefrihet og krever særlig tungtveiende grunn for avsløring.', ['oye03-echr'], ['oye-grunnlag-2']),
  claim('oye-05', 'Arbeidstilsynet beskriver varsling som arbeidstakerens rett til å si fra om kritikkverdige forhold med vern mot gjengjeldelse.', ['oye04-whistle'], ['oye-grunnlag-2']),
  claim('oye-06', 'Kildevern beskytter identitet og informasjonsflyt, men erstatter ikke redaksjonens verifisering av opplysningen.', ['oye03-echr', 'oye05-editor'], ['oye-grunnlag-2']),
  claim('oye-07', 'Redaktørplakaten gir redaktøren uavhengig ledelse og fullt personlig ansvar for mediets innhold, mens eieren beholder overordnede rammer.', ['oye05-editor'], ['oye-grunnlag-3']),
  claim('oye-08', 'Medieansvarsloven lovfester redaksjonell uavhengighet og særlige ansvarsregler for redaktørstyrte journalistiske medier.', ['oye06-law'], ['oye-grunnlag-3']),
  claim('oye-09', 'Kontrollerbare faktapåstander må etterprøves også når de framsettes i kritikk eller kommentar.', ['oye05-editor', 'oye07-vvp'], ['oye-grunnlag-3']),
  claim('oye-10', 'Vær Varsom-plakaten er et presseetisk normsett som virker ved siden av, og ikke er identisk med, loven.', ['oye07-vvp'], ['oye-fordypning-1']),
  claim('oye-11', 'PFU behandler klager om god presseskikk som pressens selvjustisorgan og er ikke en domstol.', ['oye08-pfu'], ['oye-fordypning-1']),
  claim('oye-12', 'Tilgang til dommer og rettsdokumenter er regulert av sakstilknytning, tidsgrenser og hensyn som kan kreve anonymisering.', ['oye09-court', 'oye01-grunnloven'], ['oye-fordypning-1']),
  claim('oye-13', 'Vær Varsom-plakaten 4.13 krever rask retting og eventuell beklagelse av feilaktige opplysninger.', ['oye10-correction'], ['oye-fordypning-2']),
  claim('oye-14', 'Vær Varsom-plakaten 4.14 gir adgang til samtidig imøtegåelse av sterke faktiske beskyldninger, men ikke redaksjonelt veto.', ['oye11-reply'], ['oye-fordypning-2']),
  claim('oye-15', 'Tillitsundersøkelser måler respondenters vurderinger og kan ikke alene avgjøre sannheten i en konkret publisering.', ['oye12-trust'], ['oye-fordypning-2']),
  claim('oye-16', 'Litteraturhuset knytter virksomheten til vern av fri ytring, demokrati og kunnskapsbasert offentlig samtale.', ['oye13-litfree'], ['oye-fordypning-3']),
  claim('oye-17', 'Litteraturhusets prosjekter dokumenterer særskilte samiske, kvenske, afrikanske, skeive og flerspråklige offentlighetsrom.', ['oye14-litprojects'], ['oye-fordypning-3']),
  claim('oye-18', 'Støtten til samiske nyhets- og aktualitetsmedier skal bidra til demokratisk debatt, meningsdanning og journalistikk på samiske språk.', ['oye15-sami'], ['oye-fordypning-3']),
  claim('oye-19', 'Stortinget regulerer pressens adgang gjennom akkreditering og konkrete arbeidsregler i bygningen.', ['oye16-access'], ['oye-anvendelse-1']),
  claim('oye-20', 'Morgenbladet trykte den første stortingsreportasjen i 1821, før Stortinget fikk egne stenografer.', ['oye17-lodge'], ['oye-anvendelse-1']),
  claim('oye-21', 'Stortingsmøter er som hovedregel åpne, men kan lukkes, og tilgang til dokumenter og journal er regelstyrt.', ['oye18-archive'], ['oye-anvendelse-1']),
  claim('oye-22', 'Mediemangfold må analyseres som avsendermangfold, innholdsmangfold og bruksmangfold, ikke bare som antall titler.', ['oye12-trust', 'oye19-diversity'], ['oye-anvendelse-2']),
  claim('oye-23', 'SSBs Mediebarometer-data viser både utbredt nyhetsbruk og variasjon etter plattform, alder, språk og bakgrunn.', ['oye20-ssb'], ['oye-anvendelse-2']),
  claim('oye-24', 'Statistiske gjennomsnitt om mediebruk må tolkes sammen med metode, grupper og variasjon og kan ikke beskrive hvert individ.', ['oye20-ssb', 'oye19-diversity'], ['oye-anvendelse-2']),
  claim('oye-25', 'Dokumenterbar pressekritikk prøver kilder, feil, prioritering og makt uten å gjøre politisk merkelapp til erstatning for evidens.', ['oye07-vvp', 'oye08-pfu'], ['oye-anvendelse-3']),
  claim('oye-26', 'Medielegitimitet gjelder oppfattet berettigelse av rolle, regler og ansvar og er derfor ikke identisk med popularitet.', ['oye02-infrastruktur', 'oye12-trust'], ['oye-anvendelse-3']),
  claim('oye-27', 'Sannhet, rettslig ansvar, presseetikk og publikums tillit er separate vurderingsspor som krever forskjellige kilder.', ['oye06-law', 'oye07-vvp', 'oye12-trust'], ['oye-anvendelse-3'])
];

const claimsDoc = { schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'media', chapter_id: CHAPTER_ID, sources, claims };

function updateRegistry() {
  const registry = readJson(REGISTRY_FILE);
  const subject = registry.subjects?.media;
  assert(subject && Array.isArray(subject.chapters), 'Media mangler kapittelliste i fagverkregisteret');
  const firstId = 'presse-redaksjoner-og-avishus';
  assert(subject.chapters[0]?.id === firstId, 'Første Media-kapittel er ikke bevart');
  const registryChapter = { id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: CHAPTER_FILE, primary_domain_id: 'offentlighet_ytringsfrihet_etikk', emne_ids: emneIds };
  const existingIndex = subject.chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (existingIndex === -1) {
    assert(subject.chapters.length === 1, 'Media må starte dette steget med nøyaktig ett kapittel');
    subject.chapters.push(registryChapter);
  } else {
    assert(existingIndex === 1 && subject.chapters.length === 2, 'Reproduksjon forventer Media-kapittelet som nummer to');
    subject.chapters[existingIndex] = registryChapter;
  }
  subject.canonicalModel.note = 'Medias seks canonicale hovedområder eier rendererstrukturen. Presse, redaksjoner og avishus samt Offentlighet, ytringsfrihet og medieetikk er materialisert som fulltekst- og claimsporede kapitler; fire hovedområder står igjen. Populærkultur bevares som et komplett nested mediefelt.';
  registry.version = '2.60.0';
  registry.updatedAt = '2026-08-10';
  writeJson(REGISTRY_FILE, registry);
}

function updateStatus() {
  const status = readJson(STATUS_FILE);
  const subject = status.subjects.find((row) => row.id === 'media');
  assert(subject?.editorialStatus === 'chapters_in_progress', 'Media må starte fra dokumentert kapittelproduksjon');
  subject.editorialStatus = 'chapters_in_progress';
  subject.nextGate = 'remaining_domain_chapter_production';
  subject.note = 'Media har 6 canonicale hovedområder og 120 aktive hovedemner. To områder er nå materialisert: Presse, redaksjoner og avishus (21 emner) og Offentlighet, ytringsfrihet og medieetikk (21 emner). Det nye kapittelet har 3 moduler, 9 seksjoner, 27 claimsporede fagavsnitt, 27 verifiserte claims, 20 inspiserbare kilder og alle områdets 20 unike canonicale metoder. Totalt er 42 av 120 hovedemner dekket; fire områder gjenstår. Populærkultur forblir et komplett nested mediefelt.';
  writeJson(STATUS_FILE, status);
}

function main() {
  assert(fs.existsSync(abs(REGISTRY_FILE)), 'Mangler fagverkregister');
  assert(fs.existsSync(abs(STATUS_FILE)), 'Mangler fagverkstatus');
  writeJson(CHAPTER_FILE, chapter);
  writeJson(CHAPTER_DIR + '/brief.json', brief);
  for (const [file, value] of Object.entries(modules)) writeJson(CHAPTER_DIR + '/' + file, value);
  writeJson(CHAPTER_DIR + '/claims.json', claimsDoc);
  updateRegistry();
  updateStatus();
  console.log('Materialiserte Media/' + CHAPTER_ID + ': ' + emneIds.length + ' emner, 3 moduler, ' + claims.length + ' claims og ' + sources.length + ' kilder.');
}

main();
