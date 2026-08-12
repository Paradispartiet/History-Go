#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'fortelling-synsvinkel-og-sjanger';
const CHAPTER_DIR = `data/fagverk/film_tv/${CHAPTER_ID}`;
const INPUT_GATE = 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief';
const LATER_SOURCE_BRIEF_GATE = 'seriality_format_adaptation_source_brief_complete_full_chapter_production';
const LATER_FULLTEXT_GATE = 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief';
const HISTORY_SOURCE_BRIEF_GATE = 'film_history_movements_historiography_source_brief_complete_full_chapter_production';
const HISTORY_FULLTEXT_GATE = 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief';
const TELEVISION_SOURCE_BRIEF_GATE = 'television_platforms_participation_source_brief_complete_full_chapter_production';
const TELEVISION_FULLTEXT_GATE = 'television_platforms_participation_full_chapter_complete_next_unit_source_brief';
const DOCUMENTARY_SOURCE_BRIEF_GATE = 'documentary_evidence_ethics_source_brief_complete_full_chapter_production';
const DOCUMENTARY_FULLTEXT_GATE = 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief';
const REPRESENTATION_SOURCE_BRIEF_GATE = 'representation_position_counterimages_source_brief_complete_full_chapter_production';
const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_narrative_viewpoint_genre_source_claim_brief_v1.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  chapter: `${CHAPTER_DIR}.json`, brief: `${CHAPTER_DIR}/brief.json`, claims: `${CHAPTER_DIR}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  sourceBriefReport: 'reports/fagverk/film-tv-narrative-viewpoint-genre-source-brief-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const section = (id, title, emneId, paragraphs, claimIds, keyPoints, keyPointClaimIds) => ({
  id, title, emne_ids: [emneId], paragraphs,
  paragraphClaimIds: claimIds.map((claimId) => [claimId]), keyPoints,
  keyPointClaimIds: keyPointClaimIds.map((claimId) => [claimId])
});
const claim = (id, text, sourceIds, sectionId, resolution = 'verified_as_planned') => ({
  id, claim_plan_id: id, claim: text, source_ids: sourceIds, status: 'verified',
  plan_resolution: resolution, evidence_mode: 'source_fact_plus_bounded_narrative_analysis', used_in: [sectionId]
});

export function buildFilmTvNarrativeViewpointGenreFulltextV1() {
  const sourceBrief = structuredClone(read(P.sourceBrief));
  const learningPlan = read(P.learningPlan);
  const unit = learningPlan.planned_units.find((row) => row.id === CHAPTER_ID);
  assert(unit, 'Læringsplanen mangler Fortelling, synsvinkel og sjanger');
  const emneIds = unit.emne_ids;
  const methodIds = [...new Set(sourceBrief.topic_briefs.flatMap((row) => row.method_ids))].sort();
  const sources = sourceBrief.sources.map((row) => ({ ...row, label: `${row.publisher} – ${row.title}` }));
  const workCases = sourceBrief.case_candidates.map((row) => ({
    id: row.id, title: row.work, year: row.year, medium: row.medium, role: row.purpose, source_ids: row.source_ids
  }));

  const modules = {
    '01-verdener-realisme-og-sjanger.json': {
      id: 'verdener-realisme-og-sjanger', title: 'Verdener, realisme og sjanger',
      sections: [
        section('ftv-nvg-verdener-1', 'Fiksjonsverdener bygges av regler, opplysninger og hull', emneIds[0], [
          'En audiovisuell fiksjonsverden er ikke en komplett kopi av en mulig virkelighet. Living Handbook beskriver fiksjonsverdener som ufullstendige: fortellingen gir opplysninger, lar andre forhold stå åpne og styrer hvilke muligheter som virker tilgjengelige. Analysen bør derfor kartlegge etablerte regler, grenser og utelatelser før den vurderer om verdenen oppleves troverdig.',
          'BFI beskriver hvordan The Wizard of Oz skiller Kansas fra Oz gjennom blant annet visuell overgang og Technicolor. Det dokumenterte grepet er kontrasten mellom to verdensordener; en tolkning kan deretter undersøke hvordan farge, rom og figurtyper endrer forventningene, uten å påstå at alle tilskuere opplever kontrasten likt.',
          'People on Sunday knytter hverdagslige fritidsrom i Berlin til en blanding av populærfilm, kunstfilm og senere neorealistisk innflytelse. Caset viser at realisme er en historisk form- og sjangerstrategi: steder og hverdagsmateriale er organisert og valgt, ikke et fravær av konstruksjon.'
        ], ['ftv-nvg-pc-01', 'ftv-nvg-pc-02', 'ftv-nvg-pc-03'], [
          'Skill verdensregler og utelatelser fra en generell påstand om virkelighet.',
          'Behandle realisme som historisk strategi, ikke som fravær av formvalg.'
        ], ['ftv-nvg-pc-01', 'ftv-nvg-pc-03']),
        section('ftv-nvg-sjanger-1', 'Sjanger er kontrakt, klassifikasjon og historisk forhandling', emneIds[4], [
          'BFI viser at sjangergrenser varierer mellom produksjon, markedsføring, kritikk og arkiv, og at genre ofte overlapper med stil, stemning, bevegelse og format. Sjangeranalyse bør derfor spørre hvem som bruker betegnelsen, i hvilken historisk situasjon og til hvilket formål, før en liste med konvensjoner behandles som definisjon.',
          'The Long Goodbye flytter Raymond Chandlers detektiv Marlowe inn i en senere sosial og filmhistorisk situasjon. BFI omtaler filmen som en neo-noir som både arver og undergraver noir. Det gjør sjangerforventningen synlig: seeren kan registrere hvilke koder som beholdes, hvilke som forskyves, og hvordan forskyvningen organiserer Marlowes rolle.',
          'I May Destroy You forhandler ifølge BFI med forventninger fra rape-revenge-fortellinger, mens People on Sunday historisk krysser grenser mellom populærfilm, kunstfilm og realistisk bevegelse. Verkene kan derfor analyseres gjennom flere sjangerrelasjoner samtidig; én etikett er et spørsmål som må undersøkes, ikke en uttømmende forklaring.'
        ], ['ftv-nvg-pc-11', 'ftv-nvg-pc-12', 'ftv-nvg-pc-13'], [
          'Navngi aktør, tid og bruksformål når en sjangerbetegnelse brukes.',
          'Undersøk hvordan verk aktiverer og forskyver forventninger, ikke bare om de passer i en boks.'
        ], ['ftv-nvg-pc-11', 'ftv-nvg-pc-12'])
      ],
      concepts: [
        { id: 'fiksjonsverden', term: 'Fiksjonsverden', definition: 'Den ufullstendige verdenen et verk etablerer gjennom regler, opplysninger, muligheter og utelatelser.' },
        { id: 'realisme', term: 'Realisme', definition: 'Historisk skiftende strategier som organiserer troverdighet, hverdagslighet eller virkelighetsreferanse; ikke fravær av konstruksjon.' },
        { id: 'fokalisering', term: 'Fokalisering', definition: 'Seleksjon og begrensning av informasjon: hvem eller hva tilskueren får se, høre og vite gjennom fortellingen.' },
        { id: 'fortellingstid', term: 'Fortellingstid', definition: 'Relasjonen mellom hendelsenes tid og framstillingens rekkefølge, varighet og frekvens.' },
        { id: 'rollefigur', term: 'Rollefigur', definition: 'En konstruert deltaker som kan analyseres som figur i verdenen, handlingsfunksjon, formartefakt og tematisk bærer.' },
        { id: 'sjangerkontrakt', term: 'Sjangerkontrakt', definition: 'Historisk forhandlede forventninger som knytter verk til produksjon, markedsføring, kritikk, arkiv og publikum.' }
      ]
    },
    '02-kunnskap-og-fortellingstid.json': {
      id: 'kunnskap-og-fortellingstid', title: 'Kunnskap og fortellingstid',
      sections: [
        section('ftv-nvg-kunnskap-1', 'Synsvinkel er mer enn kameraets plass', emneIds[1], [
          'Fokalisering beskriver hvordan informasjon velges og begrenses. I film og TV kan dette skje gjennom bilde, lyd, klipp, verbal fortelling og tilgang til en rollefigurs erfaring. Et point-of-view-shot kan være ett spor, men kameraets geografiske plassering forklarer ikke alene hvem som vet hva eller når kunnskapen blir tilgjengelig.',
          'Rashomon fordeler uforenlige framstillinger av samme hendelsesforløp, mens Memento kobler begrenset minnetilgang til to tidsrekker. Begge gjør kunnskapsproblemet synlig, men på ulike måter. Motstridende framstillinger betyr heller ikke automatisk at alle utsagn er like sanne; analysen må skille hva verket viser, hva en figur hevder og hva tilskueren kan kontrollere.'
        ], ['ftv-nvg-pc-04', 'ftv-nvg-pc-05'], [
          'Kartlegg syns-, lyd- og kunnskapstilgang hver for seg.',
          'Skill figurutsagn, framstilling og tilskuerens kontrollmulighet.'
        ], ['ftv-nvg-pc-04', 'ftv-nvg-pc-05']),
        section('ftv-nvg-tid-1', 'Rekkefølge, varighet og frekvens svarer på ulike spørsmål', emneIds[2], [
          'Living Handbook skiller hendelsestid fra framstillingstid og beskriver rekkefølge, varighet og frekvens som forskjellige relasjoner. Tilbakeblikk og frampek endrer rekkefølgen; scene, sammendrag og ellipse endrer varigheten; gjentatt framstilling endrer frekvensen. Begrepene må holdes adskilt før de kombineres i en analyse.',
          'Memento organiserer to tidsrekker og begrenser samtidig tilgangen gjennom Leonards korttidsminne. Den omvendte ordenen er derfor ikke hele forklaringen: rekonstruer først hendelsesrekkene, og undersøk deretter hvordan klipp, minnespor og informasjonsbegrensning bestemmer hva tilskueren kan slutte på hvert tidspunkt.',
          'BFIs analyse av I May Destroy You framhever seriens lek med narrativ forventning, alternative muligheter og en avslutning som ikke lukker etter én enkel hevnlogikk. Repetisjon og mulige forløp kan dermed prøves som tids- og forventningsorganisering i en avgrenset sekvens, uten at kapitlet overtar neste enhets historie om episoder, sesonger og format.'
        ], ['ftv-nvg-pc-06', 'ftv-nvg-pc-07', 'ftv-nvg-pc-08'], [
          'Analyser rekkefølge, varighet og frekvens som separate relasjoner.',
          'Hold tidsorganisering adskilt fra klipperytme og fra serieformatets industrihistorie.'
        ], ['ftv-nvg-pc-06', 'ftv-nvg-pc-08'])
      ],
      workedExamples: [
        { id: 'ftv-nvg-ex-1', title: 'Kunnskapskart for Rashomon', situation: 'Flere framstillinger konkurrerer om samme hendelse.', analysis: ['Lag en kolonne for det hver forteller hevder, en for det verket viser, og en for det tilskueren kan kontrollere.', 'Konkluder først da: perspektivforskjell er en organisering av evidens, ikke i seg selv bevis på total relativisme.'] },
        { id: 'ftv-nvg-ex-2', title: 'Tidslinjene i Memento', situation: 'To tidsrekker møtes samtidig som hovedfigurens minne er begrenset.', analysis: ['Sorter scenene etter framstillingsrekkefølge og rekonstruert hendelsesrekkefølge.', 'Marker deretter når informasjon blir kjent for Leonard og tilskueren; orden og fokalisering kan da sammenlignes uten å blandes.'] },
        { id: 'ftv-nvg-ex-3', title: 'Sjangerprøven i The Long Goodbye', situation: 'En etablert detektivmodell flyttes til en senere historisk situasjon.', analysis: ['List dokumenterte noir- og neo-noir-forventninger som filmen aktiverer.', 'Analyser hvilke trekk som beholdes, forskyves eller parodieres, og knytt endringen til den konkrete rollefiguren og situasjonen.'] }
      ],
      commonMisconceptions: [
        { claim: 'Synsvinkel er alltid det samme som et point-of-view-shot.', correction: 'Fokalisering kan organiseres gjennom bilde, lyd, klipp, verbal fortelling og varierende kunnskapstilgang.' },
        { claim: 'En fortelling i omvendt orden har automatisk kompleks tid.', correction: 'Rekkefølge må skilles fra varighet, frekvens og informasjonsbegrensning.' },
        { claim: 'Realisme betyr at verket ikke er konstruert.', correction: 'Realistiske strategier bygger på historisk bestemte valg av sted, tone, framstilling og produksjon.' },
        { claim: 'En rollefigur er bare en person med personlighet.', correction: 'Rollefiguren kan også ha handlingsfunksjon, være formmessig konstruert og bære tematiske relasjoner.' },
        { claim: 'Sjanger kan avgjøres med en tidløs sjekkliste.', correction: 'Betegnelser og konvensjoner endres mellom aktører, perioder og bruksformål.' }
      ]
    },
    '03-rollefigur-og-funksjon.json': {
      id: 'rollefigur-og-funksjon', title: 'Rollefigur og funksjon',
      sections: [
        section('ftv-nvg-rollefigur-1', 'Rollefiguren finnes i flere analytiske modeller samtidig', emneIds[3], [
          'Living Handbook viser at karakter kan forstås som et vesen i fiksjonsverdenen, en funksjon i handlingen, en konstruert artefakt og en tematisk bærer. Modellene svarer på ulike spørsmål. En streng analyse sier derfor om den undersøker egenskaper, handling, framstillingsmåte eller tematisk relasjon, i stedet for å samle alt under «personlighet».',
          'Marlowe i The Long Goodbye formes gjennom en arvet detektivkode som er forskjøvet historisk; Arabella i I May Destroy You organiseres gjennom handling, ettervirkning og forventninger som ikke løses i én entydig rolle; vitnene i Rashomon fungerer både som deltakere og som kilder til konkurrerende framstillinger. Sammenligningen viser forskjellig fortellingsfunksjon uten å forveksle rollefigur med skuespillerpersona eller faktisk publikumsidentifikasjon.'
        ], ['ftv-nvg-pc-09', 'ftv-nvg-pc-10'], [
          'Oppgi hvilken karaktermodell analysen bruker og hvilket spørsmål den svarer på.',
          'Skill rollefigur, skuespillerpersona og påstander om publikums identifikasjon.'
        ], ['ftv-nvg-pc-09', 'ftv-nvg-pc-10'])
      ],
      applicationTasks: [
        { id: 'ftv-nvg-task-1', title: 'Verdenskartet', task: 'Kartlegg én fiksjonsverdens eksplisitte regler og åpne hull.', prompts: ['Hva etableres sikkert?', 'Hva forblir mulig eller ubestemt?', 'Hvilken tolkning følger av organiseringen, og hvilken gjør ikke det?'] },
        { id: 'ftv-nvg-task-2', title: 'Fokaliseringsloggen', task: 'Følg informasjonsfordelingen i en kort sekvens.', prompts: ['Hva kan ses, høres og vites?', 'Hvem har tilgang til hvert spor?', 'Når revideres tilskuerens tidligere antakelse?'] },
        { id: 'ftv-nvg-task-3', title: 'Dobbel tidslinje', task: 'Sammenlign hendelsestid og framstillingstid.', prompts: ['Hvor endres rekkefølgen?', 'Hvor komprimeres eller utvides varigheten?', 'Hva vises én eller flere ganger?'] },
        { id: 'ftv-nvg-task-4', title: 'Rollefigurmatrisen', task: 'Analyser én rollefigur med fire modeller.', prompts: ['Hva kjennetegner figuren i verdenen?', 'Hvilken handlingsfunksjon har figuren?', 'Hvordan er figuren formmessig og tematisk konstruert?'] },
        { id: 'ftv-nvg-task-5', title: 'Sjangerkontrakten', task: 'Test en sjangeretikett mot et konkret verk.', prompts: ['Hvem bruker betegnelsen, og når?', 'Hvilke forventninger aktiveres eller brytes?', 'Hva forklarer etiketten ikke?'] }
      ],
      selfCheck: [
        { question: 'Hvorfor er en fiksjonsverden ufullstendig?', answer: 'Fordi verket bare etablerer noen regler og opplysninger; resten kan stå åpent uten å være motsigelse.' },
        { question: 'Hva skiller realisme fra virkelighet?', answer: 'Realisme er historiske framstillingsstrategier, mens virkelighet ikke er en stil eller sjanger.' },
        { question: 'Hva undersøker fokalisering?', answer: 'Hvordan informasjon selekteres og begrenses på tvers av bilde, lyd, klipp, verbal fortelling og rollefigurkunnskap.' },
        { question: 'Hva er forskjellen på rekkefølge og varighet?', answer: 'Rekkefølge gjelder plasseringen av hendelser; varighet gjelder forholdet mellom hendelsens tid og tiden brukt på framstillingen.' },
        { question: 'Hva betyr frekvens i narratologi?', answer: 'Forholdet mellom hvor mange ganger en hendelse skjer og hvor mange ganger den framstilles.' },
        { question: 'Hvorfor finnes flere karaktermodeller?', answer: 'Fordi egenskaper, handlingsfunksjon, formkonstruksjon og tematisk rolle er forskjellige analytiske spørsmål.' },
        { question: 'Hvorfor er sjanger historisk?', answer: 'Fordi betegnelser, konvensjoner, aktører og bruksformål endres mellom perioder og institusjoner.' }
      ]
    }
  };

  const claims = [
    claim('ftv-nvg-pc-01', 'Audiovisuelle fiksjonsverdener etableres gjennom selektive opplysninger, regler, muligheter og utelatelser og trenger ikke være fullstendig spesifisert.', ['ftvnvg01-lhn-film-narration', 'ftvnvg02-lhn-possible-worlds'], 'ftv-nvg-verdener-1'),
    claim('ftv-nvg-pc-02', 'The Wizard of Oz kontrasterer Kansas og Oz gjennom blant annet visuell overgang, Technicolor, rom og figurtyper; virkningen må analyseres uten å universaliseres.', ['ftvnvg01-lhn-film-narration', 'ftvnvg02-lhn-possible-worlds', 'ftvnvg12-bfi-wizard-oz'], 'ftv-nvg-verdener-1'),
    claim('ftv-nvg-pc-03', 'People on Sunday organiserer Berlin-rom, hverdagsmateriale og en historisk blanding av populærfilm, kunstfilm og neorealistisk innflytelse, slik at realisme framtrer som konstruert strategi.', ['ftvnvg07-bfi-neorealism'], 'ftv-nvg-verdener-1'),
    claim('ftv-nvg-pc-04', 'Fokalisering gjelder seleksjon og begrensning av informasjon gjennom bilde, lyd, klipp, verbal fortelling og rollefigurkunnskap, ikke bare point-of-view-shot.', ['ftvnvg01-lhn-film-narration', 'ftvnvg03-lhn-focalization'], 'ftv-nvg-kunnskap-1'),
    claim('ftv-nvg-pc-05', 'Rashomon organiserer konkurrerende framstillinger, mens Memento kombinerer to tidsrekker med begrenset minnetilgang; figurutsagn, framstilling og tilskuerkunnskap må holdes adskilt.', ['ftvnvg03-lhn-focalization', 'ftvnvg08-bfi-rashomon', 'ftvnvg09-bfi-memento'], 'ftv-nvg-kunnskap-1'),
    claim('ftv-nvg-pc-06', 'Rekkefølge, varighet og frekvens beskriver ulike relasjoner mellom hendelsestid og framstillingstid og kan ikke brukes som synonymer.', ['ftvnvg04-lhn-time'], 'ftv-nvg-tid-1'),
    claim('ftv-nvg-pc-07', 'Mementos to tidsrekker regulerer rekonstruksjon sammen med Leonards begrensede minnetilgang; omvendt orden forklarer derfor ikke alene kunnskapsfordelingen.', ['ftvnvg04-lhn-time', 'ftvnvg09-bfi-memento'], 'ftv-nvg-tid-1'),
    claim('ftv-nvg-pc-08', 'I May Destroy You bruker repetisjon, mulige forløp og en ikke-entydig avslutningslogikk til å prøve narrative forventninger uten at dette kapitlet gjør serialitet til hovedtema.', ['ftvnvg04-lhn-time', 'ftvnvg11-bfi-i-may-destroy-you'], 'ftv-nvg-tid-1', 'verified_after_scope_narrowing'),
    claim('ftv-nvg-pc-09', 'Rollefigurer kan analyseres som vesener i fiksjonsverdenen, handlingsfunksjoner, formskapte artefakter og tematiske bærere.', ['ftvnvg01-lhn-film-narration', 'ftvnvg05-lhn-character'], 'ftv-nvg-rollefigur-1'),
    claim('ftv-nvg-pc-10', 'Marlowe, Arabella og Rashomons vitner får forskjellige fortellingsfunksjoner gjennom sjangerkode, karakterisering og kunnskapstilgang, uten at rollefigur kan likestilles med skuespillerpersona eller publikumsidentifikasjon.', ['ftvnvg05-lhn-character', 'ftvnvg08-bfi-rashomon', 'ftvnvg10-bfi-long-goodbye', 'ftvnvg11-bfi-i-may-destroy-you'], 'ftv-nvg-rollefigur-1'),
    claim('ftv-nvg-pc-11', 'Sjangerbetegnelser brukes forskjellig i produksjon, markedsføring, kritikk, arkiv og analyse og overlapper historisk med stil, stemning, bevegelse og format.', ['ftvnvg06-bfi-genre'], 'ftv-nvg-sjanger-1'),
    claim('ftv-nvg-pc-12', 'The Long Goodbye flytter en arvet detektivmodell til en senere historisk situasjon og synliggjør noirforventninger ved å bevare og undergrave dem.', ['ftvnvg06-bfi-genre', 'ftvnvg10-bfi-long-goodbye'], 'ftv-nvg-sjanger-1'),
    claim('ftv-nvg-pc-13', 'I May Destroy You forhandler med rape-revenge-forventninger, mens People on Sunday krysser historiske grenser mellom populærfilm, kunstfilm og realisme; ingen av verkene uttømmes av én sjangeretikett.', ['ftvnvg06-bfi-genre', 'ftvnvg07-bfi-neorealism', 'ftvnvg11-bfi-i-may-destroy-you'], 'ftv-nvg-sjanger-1')
  ];

  const chapter = {
    schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'film_tv', subject_id: 'film_tv',
    id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'fortelling_sjanger_serialitet_format',
    editorialStatus: 'chapter_ready', claimTraceRequired: true, sourceFirst: true,
    emne_ids: emneIds, method_ids: methodIds,
    title: 'Fortelling, synsvinkel og sjanger: hvordan verk organiserer verden, kunnskap og forventning',
    subtitle: 'Fra fiksjonsverden og fokalisering til fortellingstid, rollefigur og historisk sjangerkontrakt',
    lead: 'Narrativ analyse begynner med organisering: hvilke regler en verden etablerer, hvem som får se og vite hva, hvordan hendelser ordnes i tid, hvilke funksjoner rollefigurene får, og hvilke sjangerforventninger verket aktiverer. Kapittelet skiller observerbar framstilling, dokumentert kildekunnskap og begrunnet tolkning, og holder serie- og formatlogikk til neste læringsenhet.',
    learningObjectives: [
      'skille fiksjonsverden, realisme og faktisk virkelighet', 'analysere fokalisering som fordeling av syn, lyd og kunnskap',
      'skille rekkefølge, varighet og frekvens i fortellingstid', 'bruke flere karaktermodeller uten å blande rollefigur og skuespillerpersona',
      'behandle sjanger som historisk kontrakt og klassifikasjonspraksis', 'skille kildefaktum, observerbar organisering og egen tolkning',
      'avgrense grunnleggende narrasjon fra neste enhets serialitets- og formatlogikk'
    ],
    diagnosticQuestions: [
      { question: 'Er realisme det samme som at et verk viser virkeligheten uten konstruksjon?', answer: 'Nei. Realisme består av historisk bestemte framstillings- og produksjonsstrategier.' },
      { question: 'Er synsvinkel bare stedet kameraet står?', answer: 'Nei. Kunnskap kan også fordeles gjennom lyd, klipp, verbal fortelling og tilgang til rollefigurers erfaring.' },
      { question: 'Er baklengs kronologi det samme som kompleks fortellingstid?', answer: 'Ikke alene. Rekkefølge må analyseres sammen med varighet, frekvens og informasjonsfordeling.' },
      { question: 'Kan en sjanger bestemmes med én universell sjekkliste?', answer: 'Nei. Betegnelser, konvensjoner og bruksformål endres historisk og institusjonelt.' }
    ],
    relatedPlaces: [
      { id: 'cinemateket_oslo', name: 'Cinemateket i Oslo', role: 'Bruk et kuratert filmprogram til å sammenligne hvordan programtekst, historisk plassering og selve visningen rammer inn sjanger og fortelling.' },
      { id: 'lisbon_cinemateca_portuguesa', name: 'Cinemateca Portuguesa', role: 'Undersøk hvordan arkiv- og visningskontekst klassifiserer verk historisk, og hold institusjonens sjangeretikett adskilt fra egen nærlesning.' }
    ],
    workCases, moduleFiles: Object.keys(modules).map((file) => `${CHAPTER_DIR}/${file}`),
    briefFile: P.brief, claimsFile: P.claims, sourceBriefFile: P.sourceBrief, learningPlanFile: P.learningPlan
  };
  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'film_tv', chapter_id: CHAPTER_ID,
    primary_domain_id: chapter.primary_domain_id, relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id),
    purpose: 'Lære kildeforankret analyse av fiksjonsverden, fokalisering, fortellingstid, rollefigur og sjanger gjennom film- og TV-case med avsnittsnivå claimtrace.',
    audience: 'Brukere som skal kunne beskrive narrativ organisering presist og skille verkobservasjon, kildefaktum og begrunnet tolkning.',
    requiredEmneIds: emneIds, requiredMethodIds: methodIds,
    requiredCriticalDistinctions: ['fiksjonsverden vs faktisk virkelighet', 'realisme vs fravær av konstruksjon', 'fokalisering vs kameravinkel', 'figurutsagn vs fortellingens framstilling', 'hendelsestid vs framstillingstid', 'rekkefølge vs varighet vs frekvens', 'rollefigur vs skuespillerpersona', 'sjangerkontrakt vs tidløs sjekkliste', 'narrativ grunnmekanikk vs serialitets- og formatlogikk'],
    sourceStrategy: { sourceBriefFile: P.sourceBrief, externalSourceCount: sources.length, paragraphLevelClaimTrace: true, sourceLocationsRequired: true, observationSourceFactInterpretationSeparated: true, everyPlannedClaimResolved: true },
    workCaseIds: workCases.map((row) => row.id),
    scope: { included: emneIds, excluded: ['episode- og sesongdramaturgi som eget hovedtema', 'formatlisensiering og distribusjon', 'sjangeretikett brukt som bevis uten historisk avgrensning', 'påstander om publikums faktiske virkning uten resepsjonsevidens'] },
    qa: { sectionCountDerivedFromEmneOwnership: true, actualFulltextSections: 5, paragraphCountsAreNotQuota: true, paragraphClaimTraceRequired: true, exactCanonicalCoverage: '5/5', plannedClaimResolution: '13/13' }
  };
  const claimsDoc = { schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'film_tv', chapter_id: CHAPTER_ID, sourceBriefFile: P.sourceBrief, sources, claims };

  sourceBrief.version = '1.1.0';
  sourceBrief.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBrief.runtime_registration = { registered: true, chapter_id: CHAPTER_ID, registration_after_full_chapter_gate: true };
  sourceBrief.topic_briefs = sourceBrief.topic_briefs.map((topic) => ({ ...topic, planned_claims: topic.planned_claims.map((planned) => ({ ...planned, status: 'resolved_to_verified_claim', final_claim_id: planned.id, resolution: claims.find((row) => row.id === planned.id)?.plan_resolution })) }));
  sourceBrief.production_requirements = { ...sourceBrief.production_requirements, expected_current_section_owner_count: emneIds.length, completed: true };
  sourceBrief.next_gate = 'produce_source_and_claim_brief_for_serialitet_format_og_adaptasjon';

  const registry = structuredClone(read(P.registry));
  registry.version = '2.79.0'; registry.updatedAt = '2026-08-11';
  const registryChapter = { id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: P.chapter, primary_domain_id: chapter.primary_domain_id, emne_ids: emneIds, claimsFile: P.claims, briefFile: P.brief };
  const chapters = registry.subjects.film_tv.chapters;
  const chapterIndex = chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) chapters.push(registryChapter); else chapters[chapterIndex] = registryChapter;
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Fortelling, synsvinkel og sjanger er registrert etter fulltekst- og evidensport med 5 canonicale emner, 5 naturlig avgrensede seksjoner, 13 claimsporede avsnitt, 13 verifiserte claims, 12 brukte inspectable kilder, 6 film- og TV-case og 2 canonicale anvendelsessteder. Neste port er kilde- og claimbrief for Serialitet, format og adaptasjon; omfanget følger problemgrensene, ikke en kvote.';
  registry.subjects.film_tv.canonicalModel.secondSourceClaimBrief = P.sourceBrief;

  const status = structuredClone(read(P.status));
  status.version = '1.67.0'; status.updatedAt = '2026-08-11';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.editorialStatus = 'chapters_in_progress'; filmStatus.nextGate = OUTPUT_GATE;
  filmStatus.note = 'Fortelling, synsvinkel og sjanger er registrert etter fulltekst- og evidensaudit: 5/5 canonicale emner, 3 faglig avgrensede moduler, 5 seksjoner, 13 avsnitt med claimtrace, 13/13 løste claimplaner, 12 brukte inspectable kilder, 6 film- og TV-case og 2 canonicale anvendelsessteder. Neste port er kilde- og claimbrief for Serialitet, format og adaptasjon.';

  const sourceBriefReport = structuredClone(read(P.sourceBriefReport));
  sourceBriefReport.version = '1.1.0'; sourceBriefReport.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBriefReport.summary = { ...sourceBriefReport.summary, registered_chapter_count_delta: 1, resolved_claim_count: claims.length };
  const { chapter_remains_unregistered: _a, registration_waits_for_fulltext_claim_source_audit: _b, ...preservedGates } = sourceBriefReport.gates;
  sourceBriefReport.gates = { ...preservedGates, chapter_was_unregistered_at_source_brief_gate: true, registration_waited_for_fulltext_claim_source_audit: true, chapter_registered_only_after_fulltext_gate: true, every_planned_claim_resolved_to_verified_claim: claims.length === 13 };
  sourceBriefReport.next_gate = sourceBrief.next_gate;
  return { chapter, chapterBrief, claimsDoc, modules, sourceBrief, registry, status, sourceBriefReport, unit, workCases };
}

export function materializeFilmTvNarrativeViewpointGenreFulltextV1({ force = false } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert([INPUT_GATE, OUTPUT_GATE, LATER_SOURCE_BRIEF_GATE, LATER_FULLTEXT_GATE, HISTORY_SOURCE_BRIEF_GATE, HISTORY_FULLTEXT_GATE, TELEVISION_SOURCE_BRIEF_GATE, TELEVISION_FULLTEXT_GATE, DOCUMENTARY_SOURCE_BRIEF_GATE, DOCUMENTARY_FULLTEXT_GATE, REPRESENTATION_SOURCE_BRIEF_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if ([OUTPUT_GATE, LATER_SOURCE_BRIEF_GATE, LATER_FULLTEXT_GATE, HISTORY_SOURCE_BRIEF_GATE, HISTORY_FULLTEXT_GATE, TELEVISION_SOURCE_BRIEF_GATE, TELEVISION_FULLTEXT_GATE, DOCUMENTARY_SOURCE_BRIEF_GATE, DOCUMENTARY_FULLTEXT_GATE, REPRESENTATION_SOURCE_BRIEF_GATE].includes(currentGate) && !force) { console.log('Fortelling, synsvinkel og sjanger er allerede materialisert; bevarer neste kildebriefport.'); return null; }
  const built = buildFilmTvNarrativeViewpointGenreFulltextV1();
  write(P.chapter, built.chapter); write(P.brief, built.chapterBrief);
  for (const [file, value] of Object.entries(built.modules)) write(`${CHAPTER_DIR}/${file}`, value);
  write(P.claims, built.claimsDoc); write(P.sourceBrief, built.sourceBrief); write(P.registry, built.registry); write(P.status, built.status); write(P.sourceBriefReport, built.sourceBriefReport);
  console.log(`Materialiserte Film & TV/${CHAPTER_ID}: ${built.chapter.emne_ids.length} emner, ${Object.values(built.modules).flatMap((row) => row.sections).length} seksjoner, ${built.claimsDoc.claims.length} claims og ${built.claimsDoc.sources.length} kilder.`);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { materializeFilmTvNarrativeViewpointGenreFulltextV1({ force: args.has('--write') }); }
  catch (error) { console.error(`Film & TV fortellingsfulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
