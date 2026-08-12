#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'representasjon-posisjon-og-motbilder';
const CHAPTER_DIR = `data/fagverk/film_tv/${CHAPTER_ID}`;
const INPUT_GATE = 'representation_position_counterimages_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'representation_position_counterimages_full_chapter_complete_next_unit_source_brief';
const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_representation_position_counterimages_source_claim_brief_v1.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  chapter: `${CHAPTER_DIR}.json`, brief: `${CHAPTER_DIR}/brief.json`, claims: `${CHAPTER_DIR}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json',
  sourceBriefReport: 'reports/fagverk/film-tv-representation-position-counterimages-source-brief-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const section = (id, title, emneId, paragraphs, claimIds, keyPoints, keyPointClaimIds) => ({
  id, title, emne_ids: [emneId], paragraphs, paragraphClaimIds: claimIds.map((id) => [id]),
  keyPoints, keyPointClaimIds: keyPointClaimIds.map((id) => [id])
});
const claim = (id, text, sourceIds, sectionId, resolution = 'verified_as_planned') => ({
  id, claim_plan_id: id, claim: text, source_ids: sourceIds, status: 'verified', plan_resolution: resolution,
  evidence_mode: 'source_fact_plus_bounded_form_power_analysis', used_in: [sectionId]
});

export function buildFilmTvRepresentationPositionCounterimagesFulltextV1() {
  const sourceBrief = structuredClone(read(P.sourceBrief));
  const learningPlan = read(P.learningPlan);
  const unit = learningPlan.planned_units.find((row) => row.id === CHAPTER_ID);
  assert(unit, 'Læringsplanen mangler Representasjon, posisjon og motbilder');
  const emneIds = unit.emne_ids;
  const topicByEmne = new Map(sourceBrief.topic_briefs.map((row) => [row.emne_id, row]));
  const methodIds = [...new Set(sourceBrief.topic_briefs.flatMap((row) => row.method_ids))].sort();
  const sources = sourceBrief.sources.map((row) => ({ ...row, label: `${row.publisher} – ${row.title}` }));
  const workCases = sourceBrief.case_candidates.map((row) => ({
    id: row.id, title: row.work, year: row.years, medium: row.medium, role: row.purpose, source_ids: row.source_ids
  }));
  const emne = (title) => {
    const row = sourceBrief.topic_briefs.find((topic) => topic.title === title);
    assert(row, `Mangler topic brief: ${title}`);
    return row.emne_id;
  };

  const modules = {
    '01-representasjon-makt-og-posisjon.json': {
      id: 'representasjon-makt-og-posisjon', title: 'Representasjon, makt og posisjon',
      sections: [
        section('ftv-rp-representasjon-1', 'Representasjon er fordeling av synlighet, kunnskap og handlekraft', emne('Representasjon identitet og makt'), [
          'En representasjonsanalyse begynner med en konkret fordelingslogg: hvem er til stede, hvem får navn og indre kunnskap, hvem setter handling i gang, og hvem må leve med konsekvensene. BFI skiller nettopp mellom numerisk tilstedeværelse, betydningsfulle roller, perspektiv og ikke-stereotyp framstilling. Opptelling kan vise et mønster, men den kan ikke alene fortelle hvem verket lar definere problemet eller endre forløpet.',
          'Et verk, en finansieringsstandard, en katalogtekst og en markedsføringskampanje er forskjellige ytringer. Standard E hos BFI gjelder tilgjengelighet gjennom utvikling, produksjon, arbeid og lansering; den er ikke bevis for hvordan en bestemt scene betyr. Analysen må derfor merke hvert utsagn med avsender og funksjon og holde institusjonell hensikt, verkobservasjon, markedsføring og dokumentert resepsjon fra hverandre.',
          'Representasjon blir audiovisuell gjennom utsnitt, lyd, klipp, rom, sjanger og rollefunksjon. Library of Congress framhever nabolagsrommet, fargebruken og den rasialiserte konflikten i Do the Right Thing. En avgrenset analyse kan følge hvem kameraet blir hos, hvilke stemmer som avbryter hverandre og hvordan varme og farge organiserer press, uten å redusere figurene til demografiske symboler.',
          'Et motbilde er ikke automatisk et hyggelig eller positivt bilde. The Watermelon Woman undersøker ifølge BFI og Library of Congress fraværet av Black kvinner i filmhistorien gjennom Black lesbisk skaperposisjon og et oppdiktet arkiv. Motkraften ligger dermed også i hvem som kan produsere kilden, definere hullet og blande formater—en endring av autoritet og form, ikke bare av innhold.'
        ], ['rp-representation-1', 'rp-representation-2', 'rp-representation-3', 'rp-representation-4'], [
          'Skill alltid tilstedeværelse, perspektiv, agens, form, opphav og distribusjonsmakt.',
          'Kall bare noe et motbilde når autoritet eller representasjonsform faktisk forskyves.'
        ], ['rp-representation-1', 'rp-representation-4']),
        section('ftv-rp-interseksjon-1', 'Interseksjonalitet krever dokumenterte relasjoner og lokalisert metode', emne('Interseksjonalitet, posisjonalitet og metode'), [
          'Interseksjonalitet er ikke en sjekkliste over identiteter. Columbia Law Schools institusjonshistorie beskriver feltet som analyse av hvordan kategorier og maktstrukturer virker sammen. I praksis må analytikeren navngi hvilke akser materialet dokumenterer, hvilken struktur som fordeler makt, og hvordan relasjonen kan ses i en konkret rolle, institusjon, kilde eller formbeslutning.',
          'Posisjonalitet gjelder flere steder samtidig: den som analyserer, den som lager verket, institusjonen som finansierer eller katalogiserer, og kilden som brukes. En redelig arbeidslogg skiller disse posisjonene og skriver også hva materialet ikke kan avgjøre. Selv når en kilde beskriver en skapers ståsted, gir det ikke tillatelse til å generalisere om alle personer som tilskrives samme kategori.',
          'The Watermelon Woman gjør samvirket mellom rase, kjønn, seksualitet, klasse og arkivmakt analyserbart fordi BFI og Library of Congress dokumenterer Cheryl Dunyes forfatterposisjon og filmens arbeid med historisk fravær. Det fiktive arkivet kan da undersøkes som formgrep og maktkritikk. Identitetsaksene skal ikke gjettes fra ansikt, navn eller nasjonal opprinnelse.',
          'Når én kategori brukes som forklaring på en annen, må forbindelsen ha eksplisitt evidens. Crip Camp kan knyttes til funksjonsvariasjon og forfatterposisjon gjennom Sundance; OFELAŠ kan knyttes til Sámi fortellereierskap gjennom en Sámi-ledet protokoll. Kildene støtter bestemte relasjoner, men de gjør ikke alle tenkelige kryssende identiteter eller publikumsvirkninger sanne.'
        ], ['rp-intersection-1', 'rp-intersection-2', 'rp-intersection-3', 'rp-intersection-4'], [
          'Navngi både de dokumenterte aksene og strukturene som får dem til å virke sammen.',
          'Marker analytikerens, verkets, institusjonens og kildens posisjon før generalisering.'
        ], ['rp-intersection-1', 'rp-intersection-2'])
      ],
      concepts: [
        { id: 'representasjonsmakt', term: 'Representasjonsmakt', definition: 'Makt til å fordele synlighet, perspektiv, kunnskap, handlekraft, konsekvens og definisjonsrett i og rundt et verk.' },
        { id: 'agens', term: 'Narrativ agens', definition: 'En rollefigurs eller aktørs dokumenterbare mulighet til å initiere, endre eller stanse et handlingsforløp.' },
        { id: 'posisjonalitet', term: 'Posisjonalitet', definition: 'Lokalisering av analytiker, skaper, institusjon og kilde i relasjon til kunnskap og makt.' },
        { id: 'interseksjonalitet', term: 'Interseksjonalitet', definition: 'Analyse av gjensidig formende kategorier og strukturer, ikke addisjon av identitetsmerkelapper.' },
        { id: 'motbilde', term: 'Motbilde', definition: 'En dokumenterbar forskyvning av representasjonsautoritet, arkiv, perspektiv eller form.' },
        { id: 'identitetsstatus', term: 'Identitetsstatus', definition: 'Eksplisitt skille mellom selvidentifikasjon, historisk kategori, rollefunksjon og analytisk rasialisering.' },
        { id: 'synlighet', term: 'Synlighet', definition: 'Målt eller beskrevet tilstedeværelse innen et definert korpus; ikke synonymt med kompleksitet eller makt.' },
        { id: 'skjermsuverenitet', term: 'Skjermsuverenitet', definition: 'Urfolksstyrt kontroll over fortelling, bilde, språk, kilder, produksjon, finansiering og sirkulasjon.' }
      ]
    },
    '02-kjonn-rasialisering-og-klasse.json': {
      id: 'kjonn-rasialisering-og-klasse', title: 'Kjønn, rasialisering og klasse',
      sections: [
        section('ftv-rp-kjonn-1', 'Feministisk analyse følger blikkets relasjoner og skjermmakt', emne('Kjønn, feministisk filmanalyse og skjermmakt'), [
          'Et blikkbegrep må brytes ned i observerbare relasjoner: hvem ser, hvem vet at de blir sett, hvem rammes inn, hvem kan svare, og hvem kontrollerer synsvinkelen. BFI-standardene skiller rollebetydning og perspektiv fra ren tilstedeværelse. Feministisk filmanalyse blir dermed en prøve av konkret form og makt, ikke en etikett som kan festes til et verk ut fra handlingen alene.',
          'BFIs analyse av Portrait of a Lady on Fire knytter det kvinnelige blikket til gjensidighet, komposisjon, fravær og kreativ kontroll. I en sekvensanalyse bør varigheten av blikkene, motblikket og hvem som sitter med kunnskap loggføres. Det viser hva filmen faktisk organiserer, uten å forutsette at alle seere identifiserer seg likt eller at kvinnelig opphav automatisk gir én bestemt estetikk.',
          'The Fits gjør kjønnede normer synlige gjennom kropp, bevegelse, kostyme, lyd og sosial tilhørighet, slik BFI beskriver. Analysen kan sammenligne bokseringen, dansen og de uforklarlige anfallenes rytmer og rom. Poenget er ikke å diagnostisere figurene, men å undersøke hvordan filmen fordeler bevegelsesmulighet, observasjon og press mellom miljøene.',
          'Rolleantall, narrativ agens og makt bak kameraet er tre separate evidensfelt. Et verk kan ha mange kvinnelige roller uten å gi dem handlingskraft; en kompleks hovedfigur sier ikke hvem som kontrollerte produksjonen; dokumentert skaperkontroll beviser ikke en bestemt publikumsvirkning. Først når feltene holdes adskilt, kan forbindelsene mellom dem begrunnes.'
        ], ['rp-gender-1', 'rp-gender-2', 'rp-gender-3', 'rp-gender-4'], [
          'Gjør blikk til en konkret relasjon mellom syn, kunnskap, svarmulighet og kontroll.',
          'Hold rolleantall, narrativ agens og produksjonsmakt som separate evidensfelt.'
        ], ['rp-gender-1', 'rp-gender-4']),
        section('ftv-rp-rasialisering-1', 'Rasialisering analyseres uten å gjøre mennesker til visuelle kategorier', emne('Rasialisering, etnisitet, hvithet og stereotypi'), [
          'Analysen må skille fire statuser: dokumentert selvidentifikasjon, en historisk kildekategori, rollefigurens funksjon og analytisk rasialisering. Ingen av dem kan fastslås bare fra utseende, navn eller antatt nasjonal opprinnelse. Denne statusloggen gjør det mulig å undersøke stereotype mønstre og institusjonell norm samtidig som enkeltpersoners identitet ikke blir oppfunnet.',
          'Library of Congress katalogiserer Within Our Gates med skaper-, objekt- og emnedata som knytter filmen til Oscar Micheaux, rasistisk vold, utdanning og mobilitet. Filmen kan derfor undersøkes som en motfortelling med dokumentert historisk plassering. Men katalogmetadata og egen formanalyse må fortsatt skilles: kilden etablerer objekt og kontekst, mens analysen må vise hvordan fortellingen organiserer volden og handlingsrommet.',
          'Do the Right Thing kan analyseres gjennom nabolagsrom, sterk fargebruk, flerstemmighet og eskalerende konflikt, støttet av Library of Congress. En streng analyse følger hvordan figurer får ulike talerom og relasjoner gjennom døgnet. Den unngår å bruke dem som ferdige representanter for grupper og beskriver i stedet hvordan filmens form produserer, bryter og kolliderer rasialiserte posisjoner.',
          'Hvithet bør gjøres synlig som norm eller institusjonell posisjon bare der materialet bærer påstanden. Academy Museums Regeneration gjør tidligere utelatt Black produksjonsdeltakelse til et kuratorisk problem; BFI beskriver kolonial og rasialisert arbeidsmakt i Black Girl. Slike kilder kan dokumentere strukturelle kontraster, men ikke legitimere at ukjente personer kategoriseres visuelt.'
        ], ['rp-race-1', 'rp-race-2', 'rp-race-3', 'rp-race-4'], [
          'Registrer identitetsstatus før en person eller rolle inngår i analysen.',
          'Analyser stereotypi som gjentatt form- og maktrelasjon, ikke som påstått essens.'
        ], ['rp-race-1', 'rp-race-3']),
        section('ftv-rp-klasse-1', 'Klasse blir synlig gjennom materielle relasjoner og narrativ mulighet', emne('Klasse, arbeid, ulikhet og sosial mobilitet'), [
          'En klassepåstand må forankres i arbeid, bolig, fritid, institusjoner, økonomisk avhengighet og handlingsrom i det konkrete verket. BFIs materiale om We Are the Lambeth Boys, Distant Voices, Still Lives og Saturday Night and Sunday Morning gjør slike forhold inspectable. Aksent, klær eller gatebilde kan inngå som formspor, men kan ikke alene fastslå en persons klasse.',
          'We Are the Lambeth Boys gir ungdommer talerom innen en sponsorstyrt dokumentarisk ramme, mens Distant Voices, Still Lives organiserer arbeiderklassefamilie gjennom fragmentert minne, sang, lys og materielle rom. Sammenligningen må derfor kartlegge både hvem som får stemme og hvilken form som samler stemmene. Den ene filmen er ikke bare direkte evidens og den andre bare personlig erindring.',
          'Saturday Night and Sunday Morning knytter fabrikkarbeid, fritid og sosial mobilitet til en navngitt rolle og et bestemt Nottingham-miljø. Mobilitet bør analyseres som muligheter, grenser og valg fortellingen etablerer. Den kan ikke tilskrives rollefiguren eller utøveren gjennom antatt bakgrunn, aksent eller kostyme uten støtte i verk og kilder.'
        ], ['rp-class-1', 'rp-class-2', 'rp-class-3'], [
          'Koble klasse til arbeid, bolig, fritid, institusjon og handlingsrom.',
          'Les sosial mobilitet som narrativ mulighet, ikke som visuelt identitetsbevis.'
        ], ['rp-class-1', 'rp-class-3'])
      ],
      workedExamples: [
        { id: 'ftv-rp-ex-1', title: 'Blikkloggen', situation: 'To rollefigurer ser på hverandre i Portrait of a Lady on Fire.', analysis: ['Noter blikkretning, varighet, utsnitt, kunnskap og mulighet til å svare.', 'Skill deretter den observerte gjensidigheten fra kildens blikkbegrep og fra en hypotese om publikums opplevelse.'] },
        { id: 'ftv-rp-ex-2', title: 'Identitetsstatus før analyse', situation: 'En rolle skal inngå i en analyse av rasialisering.', analysis: ['Finn eksplisitt kilde for selvidentifikasjon eller historisk kategori; hvis den mangler, merk status som ukjent.', 'Analyser deretter rollefunksjon og rasialiserende form uten å gjøre utseende eller navn til identitetsbevis.'] },
        { id: 'ftv-rp-ex-3', title: 'Klasse uten kostymelesning', situation: 'En film viser fabrikk, hjem og fritid.', analysis: ['Kartlegg arbeid, lønnsmakt, bolig, institusjoner og handlingsvalg.', 'Bruk aksent og klær som formspor bare når de kobles til denne dokumenterte strukturen.'] },
        { id: 'ftv-rp-ex-4', title: 'Tre evidensfelt', situation: 'Et verk omtales som representativt fordi rollebesetningen er variert.', analysis: ['Lag separate kolonner for rolleantall, narrativ agens og skaper-/produksjonsmakt.', 'Skriv bare en sammenheng mellom kolonnene når en kilde eller konkret formanalyse støtter den.'] }
      ],
      commonMisconceptions: [
        { claim: 'Mange roller betyr automatisk god representasjon.', correction: 'Antall må skilles fra rollebetydning, perspektiv, agens, form og makt bak kameraet.' },
        { claim: 'Identitet kan leses sikkert fra ansikt eller navn.', correction: 'Selvidentifikasjon og historiske kategorier krever eksplisitt kilde; analytisk rasialisering må merkes som analyse.' },
        { claim: 'Et kvinnelig opphav garanterer et kvinnelig blikk.', correction: 'Skaperposisjon og formrelasjoner må dokumenteres hver for seg.' },
        { claim: 'Aksent eller kostyme beviser klasse.', correction: 'Klassepåstander må knyttes til materielle og institusjonelle relasjoner.' },
        { claim: 'Et motbilde må være positivt.', correction: 'Motbildet kan være ubehagelig og handler om forskjøvet autoritet, kildegrunnlag eller form.' }
      ]
    },
    '03-synlighet-queer-og-funksjonsvariasjon.json': {
      id: 'synlighet-queer-og-funksjonsvariasjon', title: 'Synlighet, queer normkritikk og funksjonsvariasjon',
      sections: [
        section('ftv-rp-synlighet-1', 'Fravær kan bare måles i et definert korpus', emne('Synlighet fravær og frasortering'), [
          'Før synlighet eller fravær tallfestes, må analysen definere korpus, tidsrom, analyseenhet, kategoriregel og behandling av ukjentdata. USC-studien av Netflix-originaler og GLAADs Studio Responsibility Index oppgir utvalg og variabler nettopp fordi tall uten nevner ikke kan sammenlignes. Resultatet gjelder det undersøkte materialet, ikke film og TV som helhet.',
          'Frasortering kan skje i produksjon, casting, kreditering, bevaring, katalogisering, distribusjon eller kuratering. Academy Museums Regeneration undersøker historisk utelatelse gjennom kuratering; Ruderman-programmet dokumenterer bestemte castingkriterier. Disse er ulike mekanismer og må ikke slås sammen til ett generelt fraværstall.',
          'Kvantitativ synlighet bør sammenholdes med rollebetydning, skjermtid, form, opphav og dokumentert institusjonsmakt. GLAAD kan støtte en avgrenset opptelling, mens en sceneanalyse må avgjøre hvordan en rolle faktisk får perspektiv og agens. Ingen av metodene kan erstatte den andre, og ukjent identitetsstatus skal forbli ukjent.'
        ], ['rp-visibility-1', 'rp-visibility-2', 'rp-visibility-3'], [
          'Oppgi korpus, tidsrom, enhet, kategori, nevner og ukjentdata før tall brukes.',
          'Skill produksjon, casting, kreditering, bevaring, katalogisering, distribusjon og kuratering.'
        ], ['rp-visibility-1', 'rp-visibility-2']),
        section('ftv-rp-queer-1', 'Queer analyse skiller identifikasjon, relasjon og normativ ramme', emne('Seksualitet, queer representasjon og normkritikk'), [
          'Queer representasjon må kartlegge eksplisitt identifikasjon, relasjon, rollebetydning, skjermtid og normativ ramme hver for seg. GLAADs metode viser hvorfor kategorier og måleenheter må oppgis; BFI skiller samtidig betydningsfulle roller fra ren forekomst. Verken stil, kropp eller navn er i seg selv sikker dokumentasjon på seksualitet eller kjønnsidentitet.',
          'The Watermelon Woman kan analyseres som queer form fordi kildene dokumenterer Cheryl Dunyes Black lesbiske skaperposisjon og filmens arbeid med et reparerende fiksjonsarkiv. Vekslingen mellom video, film, dokumentarisk søk og oppdiktet objekt utfordrer hvem arkivet kan bekrefte. Analysen beholder samtidig skillet mellom historisk fravær, filmens konstruksjon og tilskuerens mulige tolkning.',
          'GLAAD-data kan vise forekomst, varighet og fordeling innen et definert studiokorpus, men opptellingen er ikke en kvalitetsdom over hvert verk. Et høyere antall sier ikke alene om rollene har agens, om fortellingen bryter normer, eller hvem som hadde produksjonsmakt. Slike påstander krever nærlesning og separate kilder.',
          'Blikk, sjanger og narrativ agens kan naturalisere eller forstyrre hetero- og cisnormer ved å fordele hva som framstår forventet, forklaringskrevende eller mulig. Portrait of a Lady on Fire og The Watermelon Woman gir konkrete, kildeforankrede prøver. Normkritikk må vises i form og relasjon; den kan ikke utledes automatisk av én rolle eller skaperkategori.'
        ], ['rp-queer-1', 'rp-queer-2', 'rp-queer-3', 'rp-queer-4'], [
          'Skill eksplisitt identifikasjon, relasjon, rollebetydning, skjermtid og normativ ramme.',
          'Bruk opptelling som synlighetsmål, aldri som automatisk kvalitetsdom.'
        ], ['rp-queer-1', 'rp-queer-3']),
        section('ftv-rp-funksjon-1', 'Funksjonsvariasjon analyseres gjennom posisjon, form og tilgang', emne('Funksjonsvariasjon, ableisme og tilgjengelighet'), [
          'Representasjonsposisjon må fastslås gjennom dokumentert rolle, utøver, selvidentifikasjon og skaperkontroll—aldri gjennom bildebasert gjetning. Sundance identifiserer funksjonshemmede kunstneres forfatterposisjon; Ruderman-programmet navngir utøvere og kriterier for autentisk casting. Slike kilder gjør påstanden inspectable og avgrenser hva analysen faktisk vet.',
          'Crip Camp bruker arkivmateriale og fellesskapsminne til å fortelle en rettighetshistorie fra en dokumentert funksjonshemmet medregissørposisjon, slik Sundance beskriver. Fortellerautoriteten kan analyseres gjennom hvem som introduserer arkivet, hvem som får forklare hendelsene og hvordan leirfellesskapet forbindes med politisk handling. Caset bør ikke reduseres til individuell inspirasjon.',
          'Autentisk casting, arbeidsadgang, narrativ kompleksitet og tilgjengelig distribusjon er fire forskjellige forhold. Ruderman kan dokumentere casting; BFI Standard E beskriver adgang i produksjon og lansering; USC kan telle synlighet. Ingen av dem beviser alene at en rolle er kompleks eller at verket faktisk er tilgjengelig i alle visningssituasjoner.',
          'Ableisme kan prøves i utsnitt, lyd, handlingsrom og kausalitet: får en figur bare forklare andres utvikling, blir hjelpemidler gjort til spektakel, eller fordeles kunnskap og konsekvens på mer komplekse måter? BFI-standardene gir spørsmål om rollebetydning og stereotypi. Den endelige vurderingen må likevel bygge på konkrete sekvenser, ikke på jakt etter ett positivt bilde.'
        ], ['rp-function-1', 'rp-function-2', 'rp-function-3', 'rp-function-4'], [
          'Dokumenter rolle, utøver, selvidentifikasjon og skaperkontroll før identitetsrelaterte påstander.',
          'Skill casting, arbeidsadgang, narrativ kompleksitet og tilgjengelig distribusjon.'
        ], ['rp-function-1', 'rp-function-3'])
      ],
      applicationTasks: [
        { id: 'ftv-rp-task-1', title: 'Representasjonsmatrisen', task: 'Kartlegg én sekvens langs seks maktfelt.', prompts: ['Hvem er synlig?', 'Hvem har perspektiv og agens?', 'Hvem kontrollerer form, opphav og distribusjon?'] },
        { id: 'ftv-rp-task-2', title: 'Korpusprotokollen', task: 'Design en avgrenset synlighetsopptelling.', prompts: ['Hva er korpus, tidsrom og enhet?', 'Hvordan defineres kategorien?', 'Hvordan beholdes ukjentdata og begrensninger?'] },
        { id: 'ftv-rp-task-3', title: 'Normtesten', task: 'Undersøk en queer rolle uten visuell identitetsinferens.', prompts: ['Hva er eksplisitt dokumentert?', 'Hvordan fordeles rollebetydning og agens?', 'Hvilken normativ ramme produserer formen?'] },
        { id: 'ftv-rp-task-4', title: 'Tilgangens fire felt', task: 'Skill funksjonsrepresentasjonens ulike evidensområder.', prompts: ['Hva vet vi om casting?', 'Hva vet vi om arbeids- og distribusjonstilgang?', 'Hva viser nærlesningen om narrativ kompleksitet?'] },
        { id: 'ftv-rp-task-5', title: 'Kildestatusloggen', task: 'Merk hver identitetspåstand før bruk.', prompts: ['Er dette selvidentifikasjon, historisk kategori, rollefunksjon eller analyse?', 'Hvilken kilde støtter statusen?', 'Hva forblir ukjent?'] }
      ],
      selfCheck: [
        { question: 'Hvorfor er synlighet ikke det samme som makt?', answer: 'Fordi tilstedeværelse ikke avgjør perspektiv, agens, formkontroll, opphav eller distribusjon.' },
        { question: 'Hva må oppgis før fravær tallfestes?', answer: 'Korpus, tidsrom, enhet, kategori, nevner, ukjentdata og metodiske begrensninger.' },
        { question: 'Kan identitet fastslås fra utseende eller navn?', answer: 'Nei; selvidentifikasjon og historiske kategorier krever eksplisitt kildestatus.' },
        { question: 'Hva skiller autentisk casting fra narrativ kompleksitet?', answer: 'Casting gjelder dokumentert samsvar mellom rolle og utøver; kompleksitet gjelder verkets form og rollefunksjon.' },
        { question: 'Hva kan en synlighetsrapport ikke avgjøre alene?', answer: 'Om enkeltroller har agens, om formen er normkritisk, eller hvem som kontrollerte produksjonen.' },
        { question: 'Hvorfor må resepsjon holdes utenfor uten egne kilder?', answer: 'Fordi verkets form ikke dokumenterer hvordan faktiske publikum tolket eller brukte det.' }
      ]
    },
    '04-koloniale-blikk-motbilder-og-skjermsuverenitet.json': {
      id: 'koloniale-blikk-motbilder-og-skjermsuverenitet', title: 'Koloniale blikk, motbilder og skjermsuverenitet',
      sections: [
        section('ftv-rp-kolonial-1', 'Dekolonial analyse flytter spørsmålet fra motiv til kontroll', emne('Koloniale blikk, dekolonisering og motbilder'), [
          'Et kolonialt blikk må undersøkes i hele produksjonsforløpet: hvem navngir mennesker og steder, hvem velger kilder og utsnitt, hvem krediteres, og hvem distribuerer resultatet. BFI om Black Girl, Academy Museum om Regeneration, OFELAŠ og NFB om Kanehsatake gjør ulike deler av denne maktkjeden synlige. Ingen enkelt indikator kan erstatte den samlede kontrollanalysen.',
          'Black Girl kan analyseres som motbilde gjennom Diouanas stemme, leilighetens avgrensede rom, masken, arbeidsrelasjonen og Sembènes formelle kontroll. BFI knytter filmen til postkolonialt arbeid, rasisme, nektelse og Mbissine Thérèse Diops framføring. Motbildet ligger ikke i en enkel positiv identitet, men i hvordan kolonial og kjønnet makt gis romlig, økonomisk og auditiv form.',
          'OFELAŠ skiller konsultasjon fra samarbeid og narrativ selvbestemmelse ved å spørre om fortellereierskap, tidlig medbestemmelse, kulturkunnskap og ressursulikhet. En produksjon er derfor ikke urfolksstyrt bare fordi den har rådgivere eller et samisk motiv. Protokollen må brukes til å dokumentere når makt faktisk deles og hvem som kan endre prosjektet.',
          'Regeneration bygger et forsknings- og kurateringsbasert motarkiv for Black kinohistorie; Kanehsatake bygger et posisjonert konfliktbilde gjennom Alanis Obomsawins langvarige tilstedeværelse bak Kanien’kéhaka-linjene. De forskyver autoritet på ulike nivåer—utstilling og film—og bør sammenlignes gjennom kildevalg, tilgang, sted og institusjonell sirkulasjon.'
        ], ['rp-colonial-1', 'rp-colonial-2', 'rp-colonial-3', 'rp-colonial-4'], [
          'Følg kontroll over navn, bilde, kilder, kreditering, produksjon og distribusjon.',
          'Skill konsultasjon, samarbeid og narrativ selvbestemmelse.'
        ], ['rp-colonial-1', 'rp-colonial-3']),
        section('ftv-rp-sami-1', 'Samisk og urfolks skjermsuverenitet omfatter hele fortellerkjeden', emne('Urfolk, samisk skjermkultur og suverenitet'), [
          'OFELAŠ kan brukes som en konkret audit av story ownership, konsultasjon, kreditering, kulturkunnskap og tidspunktet for medbestemmelse. Spørsmålene må stilles fra idé og finansiering til ferdig distribusjon. Samisk språk, motiv eller location er ikke alene bevis på suverenitet dersom beslutningsretten over bilde, kilder og fortelling ligger et annet sted.',
          'ISFIs mandat knytter narrativ selvbestemmelse til finansiering, kompetansebygging, bærekraftig bransje og tilgang til nasjonale og globale markeder. Skjermsuverenitet er dermed både estetisk og institusjonell. Analysen bør vise hvem som kan utvikle, produsere, eie og sirkulere verk, og ikke stoppe ved spørsmålet om hvem som finnes foran kameraet.',
          'ÁRRAN 360° samler Sámi-regisserte 360-gradersverk, en spesialbygd lávvu som visningsarkitektur og en kuratert internasjonal sirkulasjon. ISFIs dokumentasjon gjør det mulig å analysere skaperkontroll, XR-form og visningsrom som én representasjonspraksis. Den omsluttende teknologien skal ikke behandles som nøytral effekt løsrevet fra fortellernes og institusjonens kontroll.',
          'Nasjonalbiblioteket beskriver La elva leve! som et samarbeid i Alta-aksjonens kontekst og som en blanding av dokumentar og fiksjon; NFB dokumenterer Obomsawins 78 dager bak Kanien’kéhaka-linjene i Kanehsatake. Sammenligningen bør følge samarbeid, forfatterposisjon, stedstilgang, konflikt og dokumentarisk autoritet—uten å slå sammen Sámi og Kanien’kéhaka erfaringer til én generell urfolksfortelling.'
        ], ['rp-sami-1', 'rp-sami-2', 'rp-sami-3', 'rp-sami-4'], [
          'Auditér fortelling, bilde, kilder, språk, kreditering, produksjon, finansiering og sirkulasjon.',
          'Sammenlign urfolkscase uten å viske ut folk, sted, konflikt eller institusjonell forskjell.'
        ], ['rp-sami-1', 'rp-sami-4'])
      ],
      workedExamples: [
        { id: 'ftv-rp-ex-5', title: 'OFELAŠ-protokollen', situation: 'En ekstern produksjon vil fortelle en samisk historie.', analysis: ['Kartlegg story ownership, kulturkunnskap, konsultasjon, kreditering, ressurser og når medbestemmelsen starter.', 'Konkluder separat om konsultasjon, samarbeid og narrativ selvbestemmelse; samisk motiv er ikke tilstrekkelig.'] },
        { id: 'ftv-rp-ex-6', title: 'To ulike motarkiv', situation: 'Regeneration og Kanehsatake utfordrer etablerte historiebilder.', analysis: ['Sammenlign kildeutvalg, skaperposisjon, fysisk tilgang, institusjon og sirkulasjon.', 'Behold forskjellen mellom kuratert utstilling og posisjonert dokumentarfilm i konklusjonen.'] },
        { id: 'ftv-rp-ex-7', title: 'Skjermsuverenitetens kjede', situation: 'Et verk har samisk språk og samisk location.', analysis: ['Undersøk hvem som eier historie og bilde, velger kilder, finansierer, krediteres og kontrollerer distribusjonen.', 'Merk hvilke ledd som er urfolksstyrte, delte eller eksternt kontrollerte.'] }
      ],
      protocols: [
        { id: 'ftv-rp-protocol-1', title: 'Ingen visuell identitetsinferens', steps: ['Bruk eksplisitt selvidentifikasjon eller kildefestet historisk kategori.', 'Skill menneske, utøver, rollefigur og analytisk kategori.', 'Behold ukjent status når kilden ikke avgjør spørsmålet.'] },
        { id: 'ftv-rp-protocol-2', title: 'Urfolks skjermsuverenitetsaudit', steps: ['Kartlegg fortellereierskap, bilde, kilder, språk og kulturkunnskap.', 'Kartlegg konsultasjon, beslutningspunkt, kreditering, produksjon og finansiering.', 'Kartlegg visningsarkitektur, distribusjon og hvem som kan trekke eller endre materialet.'] }
      ],
      applicationTasks: [
        { id: 'ftv-rp-protocol-task-1', protocol_id: 'ftv-rp-protocol-1', title: 'Bruk protokollen: Ingen visuell identitetsinferens', task: 'Gjennomfør identitetsstatuskontrollen før en rolle eller person inngår i analysen.', prompts: ['Bruk eksplisitt selvidentifikasjon eller kildefestet historisk kategori.', 'Skill menneske, utøver, rollefigur og analytisk kategori.', 'Behold ukjent status når kilden ikke avgjør spørsmålet.'] },
        { id: 'ftv-rp-protocol-task-2', protocol_id: 'ftv-rp-protocol-2', title: 'Bruk protokollen: Urfolks skjermsuverenitetsaudit', task: 'Auditér hele fortellerkjeden før et verk omtales som urfolksstyrt.', prompts: ['Kartlegg fortellereierskap, bilde, kilder, språk og kulturkunnskap.', 'Kartlegg konsultasjon, beslutningspunkt, kreditering, produksjon og finansiering.', 'Kartlegg visningsarkitektur, distribusjon og hvem som kan trekke eller endre materialet.'] }
      ]
    }
  };

  const sectionIdByClaim = new Map(Object.values(modules).flatMap((module) => module.sections).flatMap((row) => row.paragraphClaimIds.flat().map((id) => [id, row.id])));
  const claimTexts = new Map([
    ['rp-representation-1', 'Representasjonsanalyse må skille synlighet, navngiving, kunnskap, agens og konsekvens; numerisk tilstedeværelse er ikke tilstrekkelig.'],
    ['rp-representation-2', 'Verkutsagn, institusjonell hensikt, markedsføring og dokumentert resepsjon er ulike evidensfelt som må merkes med avsender og funksjon.'],
    ['rp-representation-3', 'Do the Right Thing organiserer rasialisert makt gjennom nabolagsrom, farge, flerstemmighet og konflikt, slik at representasjon kan spores i konkret form.'],
    ['rp-representation-4', 'The Watermelon Woman fungerer som motbilde ved å forskyve arkiv- og representasjonsautoritet gjennom Black lesbisk skaperposisjon og fiktivt arkiv.'],
    ['rp-intersection-1', 'Interseksjonalitet analyserer gjensidig formende strukturer og krever at materialets faktisk dokumenterte akser navngis.'],
    ['rp-intersection-2', 'Analytikerens, verkets, institusjonens og kildens posisjoner må lokaliseres før fortolkningen generaliseres.'],
    ['rp-intersection-3', 'The Watermelon Woman gjør samtidige strukturer for rase, kjønn, seksualitet, klasse og arkivmakt analyserbare gjennom dokumentert skaperposisjon og form.'],
    ['rp-intersection-4', 'En forklaring som kobler identitetskategorier eller maktakser krever eksplisitt kildegrunnlag og kan ikke utledes visuelt.'],
    ['rp-gender-1', 'Feministisk formanalyse må skille hvem som ser, vet, rammes inn, kan svare og kontrollerer synsvinkelen.'],
    ['rp-gender-2', 'Portrait of a Lady on Fire organiserer et gjensidig blikk gjennom komposisjon, varighet, fravær og kreativ kontroll.'],
    ['rp-gender-3', 'The Fits gjør sosialt kjønnede normer analyserbare gjennom kropp, bevegelse, kostyme, lyd og rom.'],
    ['rp-gender-4', 'Rolleantall, narrativ agens og makt bak kameraet er tre separate evidensfelt.'],
    ['rp-race-1', 'Dokumentert selvidentifikasjon, historisk kategori, rollefunksjon og analytisk rasialisering må holdes adskilt; utseende og navn er ikke identitetsbevis.'],
    ['rp-race-2', 'Within Our Gates kan prøves som motfortelling gjennom dokumentert skaperkreditering, objektdata, vold, utdanning og mobilitet.'],
    ['rp-race-3', 'Do the Right Thing organiserer rom, farge, flerstemmighet og konflikt uten at rollefigurene kan reduseres til demografiske typer.'],
    ['rp-race-4', 'Hvithet kan analyseres som norm og institusjonell posisjon bare der kilder og konkret materiale dokumenterer relasjonen.'],
    ['rp-class-1', 'Klassepåstander må kobles til arbeid, bolig, fritid, institusjoner, økonomisk avhengighet og handlingsrom i konkrete verk.'],
    ['rp-class-2', 'We Are the Lambeth Boys og Distant Voices, Still Lives organiserer arbeiderklasseerfaring forskjellig gjennom stemmerom, sponsorramme, minne, sang og materiell form.'],
    ['rp-class-3', 'Sosial mobilitet må prøves som narrativ mulighet og kan ikke utledes av aksent, klær eller antatt bakgrunn.'],
    ['rp-visibility-1', 'Korpus, tidsrom, enhet, kategori, nevner, ukjentdata og begrensninger må defineres før synlighet eller fravær tallfestes.'],
    ['rp-visibility-2', 'Manglende produksjon, casting, kreditering, bevaring, katalogisering, distribusjon og kuratering er ulike frasorteringsmekanismer.'],
    ['rp-visibility-3', 'Kvantitativ synlighet må sammenholdes med rollebetydning, form, opphav og dokumentert institusjonsmakt.'],
    ['rp-queer-1', 'Queer representasjonsanalyse må skille eksplisitt identifikasjon, relasjon, rollebetydning, skjermtid og normativ ramme.'],
    ['rp-queer-2', 'The Watermelon Woman kombinerer Black lesbisk skaperposisjon, queer form og et reparerende fiksjonsarkiv.'],
    ['rp-queer-3', 'GLAAD-data støtter avgrensede synlighetspåstander, men opptelling kan ikke alene fungere som kvalitetsdom over verk eller roller.'],
    ['rp-queer-4', 'Blikk, sjanger og narrativ agens kan naturalisere eller forstyrre hetero- og cisnormer når relasjonen vises i konkret form.'],
    ['rp-function-1', 'Representasjonsposisjon ved funksjonsvariasjon krever dokumentert rolle, utøver, selvidentifikasjon og skaperkontroll uten bildebasert inferens.'],
    ['rp-function-2', 'Crip Camp bruker arkiv og fellesskapsminne fra en dokumentert funksjonshemmet medregissørposisjon til å forskyve fortellerautoriteten i rettighetshistorien.'],
    ['rp-function-3', 'Autentisk casting, arbeidsadgang, narrativ kompleksitet og tilgjengelig distribusjon er fire separate forhold.'],
    ['rp-function-4', 'Ableisme må prøves i utsnitt, lyd, handlingsrom og kausalitet, ikke avgjøres ved å finne ett positivt bilde.'],
    ['rp-colonial-1', 'Dekolonial analyse må følge hvem som navngir, rammer inn, velger kilder, krediteres, produserer og distribuerer.'],
    ['rp-colonial-2', 'Black Girl gjør kolonialt og kjønnet arbeid synlig gjennom stemme, rom, maske, kropp, økonomisk makt og formell kontroll.'],
    ['rp-colonial-3', 'OFELAŠ skiller konsultasjon, samarbeid og narrativ selvbestemmelse gjennom story ownership, tidlig medbestemmelse, kulturkunnskap og ressursmakt.'],
    ['rp-colonial-4', 'Regeneration og Kanehsatake forskyver historisk autoritet forskjellig gjennom kuratert motarkiv og posisjonert konfliktbilde.'],
    ['rp-sami-1', 'OFELAŠ gjør story ownership, konsultasjon, kreditering, kulturkunnskap og tidspunkt for medbestemmelse auditerbart.'],
    ['rp-sami-2', 'ISFIs mandat knytter Sámi narrativ selvbestemmelse til finansiering, kompetanse, bærekraftig bransje og markedstilgang.'],
    ['rp-sami-3', 'ÁRRAN 360° forener Sámi skaperkontroll, XR-form, kuratering og en særskilt lávvu-basert visningsarkitektur.'],
    ['rp-sami-4', 'La elva leve! og Kanehsatake kan sammenlignes på samarbeid, forfatterposisjon, stedstilgang, konflikt og dokumentarisk autoritet uten å likestille folkene eller historiene.']
  ]);
  const sourceSelection = new Map([
    ['rp-representation-1', ['ftvrp01-bfi-diversity', 'ftvrp02-bfi-onscreen']], ['rp-representation-2', ['ftvrp03-bfi-access']],
    ['rp-representation-3', ['ftvrp17-loc-do-right']], ['rp-representation-4', ['ftvrp07-bfi-watermelon', 'ftvrp08-loc-watermelon']],
    ['rp-intersection-1', ['ftvrp05-columbia-intersectionality']], ['rp-intersection-2', ['ftvrp05-columbia-intersectionality', 'ftvrp20-isfi-ofelas']],
    ['rp-intersection-3', ['ftvrp07-bfi-watermelon', 'ftvrp08-loc-watermelon']], ['rp-intersection-4', ['ftvrp18-sundance-crip-camp', 'ftvrp20-isfi-ofelas']],
    ['rp-gender-1', ['ftvrp01-bfi-diversity', 'ftvrp02-bfi-onscreen']], ['rp-gender-2', ['ftvrp06-bfi-portrait']],
    ['rp-gender-3', ['ftvrp25-bfi-fits']], ['rp-gender-4', ['ftvrp01-bfi-diversity', 'ftvrp03-bfi-access']],
    ['rp-race-1', ['ftvrp15-academy-regeneration', 'ftvrp16-loc-within']], ['rp-race-2', ['ftvrp16-loc-within']],
    ['rp-race-3', ['ftvrp17-loc-do-right']], ['rp-race-4', ['ftvrp13-bfi-black-girl', 'ftvrp14-bfi-black-girl-performance', 'ftvrp15-academy-regeneration']],
    ['rp-class-1', ['ftvrp10-bfi-lambeth', 'ftvrp11-bfi-distant', 'ftvrp12-bfi-saturday']], ['rp-class-2', ['ftvrp10-bfi-lambeth', 'ftvrp11-bfi-distant']],
    ['rp-class-3', ['ftvrp12-bfi-saturday']], ['rp-visibility-1', ['ftvrp04-usc-inclusion', 'ftvrp09-glaad-sri']],
    ['rp-visibility-2', ['ftvrp15-academy-regeneration', 'ftvrp19-ruderman-authentic']], ['rp-visibility-3', ['ftvrp04-usc-inclusion', 'ftvrp09-glaad-sri']],
    ['rp-queer-1', ['ftvrp02-bfi-onscreen', 'ftvrp09-glaad-sri']], ['rp-queer-2', ['ftvrp07-bfi-watermelon', 'ftvrp08-loc-watermelon']],
    ['rp-queer-3', ['ftvrp09-glaad-sri']], ['rp-queer-4', ['ftvrp06-bfi-portrait', 'ftvrp07-bfi-watermelon']],
    ['rp-function-1', ['ftvrp18-sundance-crip-camp', 'ftvrp19-ruderman-authentic']], ['rp-function-2', ['ftvrp18-sundance-crip-camp']],
    ['rp-function-3', ['ftvrp03-bfi-access', 'ftvrp04-usc-inclusion', 'ftvrp19-ruderman-authentic']], ['rp-function-4', ['ftvrp01-bfi-diversity', 'ftvrp02-bfi-onscreen']],
    ['rp-colonial-1', ['ftvrp13-bfi-black-girl', 'ftvrp15-academy-regeneration', 'ftvrp20-isfi-ofelas', 'ftvrp24-nfb-kanehsatake']],
    ['rp-colonial-2', ['ftvrp13-bfi-black-girl', 'ftvrp14-bfi-black-girl-performance']], ['rp-colonial-3', ['ftvrp20-isfi-ofelas']],
    ['rp-colonial-4', ['ftvrp15-academy-regeneration', 'ftvrp24-nfb-kanehsatake']], ['rp-sami-1', ['ftvrp20-isfi-ofelas']],
    ['rp-sami-2', ['ftvrp21-isfi-selfdetermination']], ['rp-sami-3', ['ftvrp22-isfi-arran']],
    ['rp-sami-4', ['ftvrp23-nb-la-elva', 'ftvrp24-nfb-kanehsatake']]
  ]);
  const plannedClaims = sourceBrief.topic_briefs.flatMap((row) => row.planned_claims);
  const claims = plannedClaims.map((planned) => {
    assert(claimTexts.has(planned.id) && sourceSelection.has(planned.id) && sectionIdByClaim.has(planned.id), `Mangler fulltekstbinding for ${planned.id}`);
    const selected = sourceSelection.get(planned.id);
    assert(selected.every((id) => planned.source_ids.includes(id)), `${planned.id} bruker kilde utenfor claimplanen`);
    return claim(planned.id, claimTexts.get(planned.id), selected, sectionIdByClaim.get(planned.id));
  });

  const chapter = {
    schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', id: CHAPTER_ID, subject_id: 'film_tv',
    title: 'Representasjon, posisjon og motbilder: hvem får synlighet, autoritet og kontroll',
    subtitle: 'Fra blikk, interseksjonalitet, klasse og queer normkritikk til ableisme, motarkiv og samisk skjermsuverenitet',
    primary_domain_id: 'samfunn_representasjon_identitet_makt', editorialStatus: 'chapter_ready', sourceFirst: true, claimTraceRequired: true,
    lead: 'Kapittelet undersøker representasjon som fordeling av synlighet, perspektiv, kunnskap, handlekraft, form, opphav og sirkulasjonsmakt. Det kombinerer nærlesning, eksplisitt identitetsstatus, avgrenset synlighetsdata og institusjonsanalyse uten å inferere identitet fra utseende, navn eller nasjonal opprinnelse, og avslutter med en særskilt audit av samisk og urfolks skjermsuverenitet.',
    diagnosticQuestions: [
      { question: 'Betyr flere synlige roller automatisk mer representasjonsmakt?', answer: 'Nei. Synlighet må skilles fra perspektiv, agens, formkontroll, opphav og distribusjon.' },
      { question: 'Kan identitet fastslås fra utseende, navn eller nasjonal opprinnelse?', answer: 'Nei. Selvidentifikasjon og historiske kategorier krever eksplisitt kilde, mens analytisk rasialisering må merkes som analyse.' },
      { question: 'Er et motbilde alltid et positivt bilde?', answer: 'Nei. Motbildet kjennetegnes av en dokumenterbar forskyvning i autoritet, arkiv, perspektiv eller form.' },
      { question: 'Kan en opptelling avgjøre om representasjonen er kompleks?', answer: 'Nei. Opptelling beskriver et definert korpus; rollebetydning og form krever egne analyser.' },
      { question: 'Er samisk motiv eller språk alene bevis på skjermsuverenitet?', answer: 'Nei. Fortellereierskap, bilde, kilder, medbestemmelse, kreditering, finansiering og sirkulasjon må auditeres.' }
    ],
    learningObjectives: [
      'skille synlighet, perspektiv, kunnskap, narrativ agens, form, opphav og distribusjonsmakt',
      'merke selvidentifikasjon, historisk kategori, rollefunksjon og analytisk rasialisering med riktig kildestatus',
      'bruke interseksjonalitet som analyse av dokumenterte samvirkende strukturer fremfor en liste over identiteter',
      'avgrense korpus, tidsrom, enhet, kategori, nevner og ukjentdata før synlighet eller fravær tallfestes',
      'analysere kjønn, rasialisering, klasse, seksualitet og funksjonsvariasjon gjennom konkret form og makt',
      'skille casting, arbeidsadgang, narrativ kompleksitet og tilgjengelig distribusjon',
      'prøve motbilder gjennom endret arkiv-, forteller- og produksjonsautoritet',
      'skille konsultasjon, samarbeid og narrativ selvbestemmelse',
      'auditere samisk og urfolks skjermsuverenitet gjennom fortelling, bilde, språk, kilder, produksjon, finansiering og sirkulasjon',
      'holde verkutsagn, institusjonell hensikt, markedsføring og dokumentert resepsjon som separate evidensfelt'
    ],
    emne_ids: emneIds, method_ids: methodIds,
    relatedPlaces: [
      { id: 'nasjonalbiblioteket', name: 'Nasjonalbiblioteket', role: 'Undersøk hvordan katalogisering, bevaring, programtekst og tilgang former hvilke norske og samiske skjermhistorier som kan finnes og sammenlignes.' },
      { id: 'beaivvas_coarvematta', name: 'Beaivváš – Čoarvemátta', role: 'Bruk stedet som inngang til å skille samisk synlighet fra samisk kontroll over språk, fortelling, institusjon, rom og sirkulasjon.' }
    ],
    workCases, moduleFiles: Object.keys(modules).map((file) => `${CHAPTER_DIR}/${file}`),
    briefFile: P.brief, claimsFile: P.claims, sourceBriefFile: P.sourceBrief, learningPlanFile: P.learningPlan
  };
  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'film_tv', chapter_id: CHAPTER_ID,
    primary_domain_id: chapter.primary_domain_id, relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id),
    purpose: 'Lære kildeforankret analyse av representasjonsmakt gjennom nærlesning, eksplisitt identitetsstatus, avgrenset synlighetsdata og audit av opphav, institusjon og skjermsuverenitet.',
    audience: 'Brukere som skal kunne skille tilstedeværelse fra perspektiv, agens, form, opphav og distribusjonsmakt uten å inferere identitet visuelt.',
    requiredEmneIds: emneIds, requiredMethodIds: methodIds,
    requiredCriticalDistinctions: ['synlighet vs perspektiv og agens', 'rolleantall vs narrativ betydning', 'selvidentifikasjon vs historisk kategori vs rollefunksjon vs analytisk rasialisering', 'verkutsagn vs institusjonell hensikt vs markedsføring vs resepsjon', 'casting vs arbeidsadgang vs narrativ kompleksitet vs distribusjonstilgang', 'konsultasjon vs samarbeid vs narrativ selvbestemmelse', 'samisk motiv vs samisk kontroll', 'opptelling vs kvalitetsdom'],
    sourceStrategy: { sourceBriefFile: P.sourceBrief, externalSourceCount: sources.length, paragraphLevelClaimTrace: true, sourceLocationsRequired: true, noVisualIdentityInference: true, everyPlannedClaimResolved: true },
    workCaseIds: workCases.map((row) => row.id),
    scope: { included: emneIds, excluded: ['nasjon, offentlighet, migrasjon, religion, alder, by og klima som hovedanalyse', 'publikumsresepsjon og identitetsarbeid uten egne resepsjonskilder', 'produksjonsarbeid og operasjonell tilgjengelighet som eget hovedtema'] },
    qa: { sectionCountDerivedFromEmneOwnership: true, actualFulltextSections: 10, paragraphCountsAreNotQuota: true, paragraphClaimTraceRequired: true, exactCanonicalCoverage: '10/10', plannedClaimResolution: '38/38' }
  };
  const claimsDoc = { schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'film_tv', chapter_id: CHAPTER_ID, sourceBriefFile: P.sourceBrief, sources, claims };

  sourceBrief.version = '1.1.0'; sourceBrief.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBrief.runtime_registration = { registered: true, chapter_id: CHAPTER_ID, registration_after_full_chapter_gate: true };
  sourceBrief.topic_briefs = sourceBrief.topic_briefs.map((topic) => ({ ...topic, planned_claims: topic.planned_claims.map((planned) => ({ ...planned, status: 'resolved_to_verified_claim', final_claim_id: planned.id, resolution: 'verified_as_planned' })) }));
  sourceBrief.production_requirements = { ...sourceBrief.production_requirements, expected_current_section_owner_count: emneIds.length, completed: true };
  sourceBrief.next_gate = 'produce_source_and_claim_brief_for_skjermoffentlighet_fellesskap_og_samfunn';

  const registry = structuredClone(read(P.registry));
  registry.version = '2.89.0'; registry.updatedAt = '2026-08-12';
  const registryChapter = { id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: P.chapter, primary_domain_id: chapter.primary_domain_id, emne_ids: emneIds, claimsFile: P.claims, briefFile: P.brief };
  const chapters = registry.subjects.film_tv.chapters;
  const chapterIndex = chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) chapters.push(registryChapter); else chapters[chapterIndex] = registryChapter;
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Representasjon, posisjon og motbilder er registrert etter fulltekst-, claim- og evidensport med 10 canonicale emner, 4 moduler, 10 emneeide seksjoner, 38 claimsporede avsnitt, 38/38 verifiserte claims, 25 brukte inspectable kilder, 21 case og 2 canonicale anvendelsessteder. Kapitlet sperrer visuell identitetsinferens og auditerer samisk og urfolks skjermsuverenitet gjennom fortelling, bilde, språk, kilder, kreditering, produksjon, finansiering og sirkulasjon. Neste port er kilde- og claimbrief for Skjermoffentlighet, fellesskap og samfunn; omfanget følger problemgrensene, ikke en kvote.';
  registry.subjects.film_tv.canonicalModel.seventhSourceClaimBrief = P.sourceBrief;

  const status = structuredClone(read(P.status));
  status.version = '1.77.0'; status.updatedAt = '2026-08-12';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.editorialStatus = 'chapters_in_progress'; filmStatus.nextGate = OUTPUT_GATE;
  filmStatus.note = 'Representasjon, posisjon og motbilder er registrert etter fulltekst- og evidensaudit: 10/10 canonicale emner, 4 moduler, 10 seksjoner, 38 avsnitt med claimtrace, 38/38 løste claimplaner, 25 brukte inspectable kilder, 21 case og 2 canonicale anvendelsessteder. Ingen identitet infereres fra utseende, navn eller nasjonal opprinnelse. Neste port er kilde- og claimbrief for Skjermoffentlighet, fellesskap og samfunn.';

  const sourceBriefReport = structuredClone(read(P.sourceBriefReport));
  sourceBriefReport.version = '1.1.0'; sourceBriefReport.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBriefReport.summary = { ...sourceBriefReport.summary, registered_chapter_count_delta: 1, resolved_claim_count: claims.length };
  const { chapter_remains_unregistered: _a, registration_waits_for_fulltext_claim_source_audit: _b, ...preservedGates } = sourceBriefReport.gates;
  sourceBriefReport.gates = { ...preservedGates, chapter_was_unregistered_at_source_brief_gate: true, registration_waited_for_fulltext_claim_source_audit: true, chapter_registered_only_after_fulltext_gate: true, every_planned_claim_resolved_to_verified_claim: claims.length === 38 };
  sourceBriefReport.next_gate = sourceBrief.next_gate;
  assert(new Set(claims.flatMap((row) => row.source_ids)).size === sources.length, 'Alle 25 kilder må brukes av minst én final claim');
  assert(topicByEmne.size === 10, 'Kildebriefen må ha ti unike emneeiere');
  return { chapter, chapterBrief, claimsDoc, modules, sourceBrief, registry, status, sourceBriefReport, unit, workCases };
}

export function materializeFilmTvRepresentationPositionCounterimagesFulltextV1({ force = false } = {}) {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert([INPUT_GATE, OUTPUT_GATE].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if (currentGate === OUTPUT_GATE && !force) { console.log('Representasjon, posisjon og motbilder er allerede materialisert; bevarer neste kildebriefport.'); return null; }
  const built = buildFilmTvRepresentationPositionCounterimagesFulltextV1();
  write(P.chapter, built.chapter); write(P.brief, built.chapterBrief);
  for (const [file, value] of Object.entries(built.modules)) write(`${CHAPTER_DIR}/${file}`, value);
  write(P.claims, built.claimsDoc); write(P.sourceBrief, built.sourceBrief); write(P.registry, built.registry); write(P.status, built.status); write(P.sourceBriefReport, built.sourceBriefReport);
  console.log(`Materialiserte Film & TV/${CHAPTER_ID}: ${built.chapter.emne_ids.length} emner, ${Object.values(built.modules).flatMap((row) => row.sections).length} seksjoner, ${built.claimsDoc.claims.length} claims og ${built.claimsDoc.sources.length} kilder.`);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { materializeFilmTvRepresentationPositionCounterimagesFulltextV1({ force: args.has('--write') }); }
  catch (error) { console.error(`Film & TV representasjonsfulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
