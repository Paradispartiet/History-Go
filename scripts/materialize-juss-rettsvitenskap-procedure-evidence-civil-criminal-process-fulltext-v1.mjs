#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const DATE = '2026-09-01';
const sourceBriefFile = 'data/fag/politikk/juss_rettsvitenskap/procedure_evidence_civil_criminal_process_source_claim_brief_v1.json';
const sourceBrief = read(sourceBriefFile);
const claims = sourceBrief.topic_briefs.flatMap((topic) => topic.planned_claims || []);
const sourceById = new Map(sourceBrief.sources.map((source) => [source.id, source]));
const chapterId = 'rettergang-bevis-sivilprosess-og-straffeprosess';
const chapterDir = `data/fagverk/politikk/juss_rettsvitenskap/${chapterId}`;
const chapterFile = `data/fagverk/politikk/juss_rettsvitenskap/${chapterId}.json`;

const topicFrames = {
  'rettferdig-rettergang-domstol-og-prosessramme': {
    analysis: 'Den metodiske kjernen er å identifisere sakstype, beslutningsorgan, prosessledd og den konkrete garantien før resultatet vurderes. Uavhengighet gjelder institusjonen og dommeren; kontradiksjon gjelder partenes reelle mulighet til å møte materialet; rimelig tid gjelder forløpet som helhet.',
    steps: 'Løsningen bør derfor angi anvendelsesområdet for Grunnloven § 95 og EMK artikkel 6, klassifisere det omstridte inngrepet og først deretter prøve om prosessen samlet oppfyller garantien.'
  },
  'sivilprosess-partskontroll-saksstyring-og-proporsjonalitet': {
    analysis: 'I sivilprosessen danner krav og påstander den ytre rammen, mens påstandsgrunnlag og bevis forklarer henholdsvis hvorfor kravet påstås og hvordan faktum søkes bevist. Aktiv saksstyring skal konsentrere tvisten uten å gjøre retten til ny part eller erstatte partenes materielle disposisjoner.',
    steps: 'En løsning skal kartlegge krav, påstand, påstandsgrunnlag, bevistema og bevismiddel hver for seg, og deretter kontrollere relevans, proporsjonalitet og kontradiksjon.'
  },
  'straffeprosess-roller-uskyldspresumsjon-og-forsvar': {
    analysis: 'Straffeprosessens rollefordeling er en rettssikkerhetsmekanisme: påtalemyndigheten etterforsker og fører saken, forsvareren ivaretar siktedes interesser, og retten avgjør uavhengig. Uskyldspresumsjonen styrer både bevisbyrden og hvordan offentlige myndigheter omtaler skyldspørsmålet.',
    steps: 'Drøftelsen må vise hvem som har handlings- og bevisansvaret, hvilke forsvarsrettigheter som aktualiseres, og hvorfor siktedes taushet eller manglende alternative forklaring ikke kan erstatte påtalemyndighetens bevis.'
  },
  'bevisbyrde-beviskrav-og-fri-bevisvurdering': {
    analysis: 'Bevistemaet beskriver hvilket faktum som må avklares; bevisbyrden plasserer risikoen for vedvarende tvil; beviskravet angir terskelen; bevisvekten er rettens konkrete vurdering. Disse fire nivåene må holdes fra hverandre for at begrunnelsen skal kunne etterprøves.',
    steps: 'Start med hjemmelen og det rettslig relevante faktum, fastsett deretter byrde og standard, og vurder til slutt hvert bevis og den samlede bevisbildet uten å innføre en lovfremmed tallfestet sannsynlighet.'
  },
  'sivil-bevistilgang-vitneplikt-og-bevisforbud': {
    analysis: 'Relevans åpner ikke automatisk tilgang. Retten må skille plikten til å opplyse saken fra absolutte eller betingede bevisforbud og fritak. For advokatkommunikasjon er formålet, rollen, fortroligheten og et eventuelt konkret frafall sentrale, ikke bare hvem som fysisk oppbevarer dokumentet.',
    steps: 'En forsvarlig rekkefølge er å avgrense bevisbegjæringen, prøve relevans og spesifikasjon, identifisere § 22-5 eller annet vern, og først deretter vurdere om vernet gjelder, er frafalt eller kan håndteres med et snevrere tiltak.'
  },
  'straffe-bevis-kontradiksjon-og-tidligere-forklaringer': {
    analysis: 'Ved tidligere forklaringer er det avgjørende å identifisere den egentlige beviskilden, hvorfor vedkommende ikke kan prøves muntlig, og hvilken vekt opplysningen får. Al-Khawaja-strukturen krever mer enn en formalistisk kontroll av om dokumentet ligger i saken.',
    steps: 'Drøftelsen skal undersøke god grunn for fraværet, om forklaringen er eneste eller avgjørende bevis, og om tilstrekkelige motbalanserende garantier gjør rettergangen samlet rettferdig.'
  },
  'bevisavskjaring-ulovlig-bevis-og-prosessuell-kontroll': {
    analysis: 'Innhentingsfeil, føringsadgang og bevisvekt er tre forskjellige spørsmål. Norsk rett bruker en konkret prosessuell kontroll fremfor en universell eksklusjonsregel, slik at rettsgrunnlag, krenkelsens karakter, gjentakelsesvirkning, bevisets betydning og alternative tiltak må synliggjøres.',
    steps: 'Analysen bør først beskrive feilen og vernet den rammer, deretter hjemmelen for avskjæring, og til slutt om avskjæring eller et mindre inngripende tiltak er nødvendig for en rettferdig prosess.'
  },
  'avgjorelser-begrunnelse-anke-og-overproving': {
    analysis: 'Avgjørelsestype og instans bestemmer både form, begrunnelse og angrepsvei. En anke er ikke alltid en full ny behandling: loven kan begrense hvilke spørsmål som prøves, kreve samtykke eller tillate nektelse, mens begrunnelsen må gjøre den reelle kontrollen synlig der rettskildene krever det.',
    steps: 'Klassifiser avgjørelsen, identifiser ankegrunn og kompetanse, prøv eventuelle filtre, og vurder deretter om en prosessfeil kan ha virket inn før rettsvirkningen fastsettes.'
  }
};

const claimNotes = {
  'proc-01': 'Bestemmelsene må leses med virkeområdet synlig: EMK artikkel 6 skiller mellom avgjørelse av sivile rettigheter og plikter og straffesiktelse, mens Grunnloven § 95 er den nasjonale konstitusjonelle garantien. Det avgjørende kontrollspørsmålet er derfor ikke bare om en domstol deltok, men om organet, tidsbruken og behandlingsformen oppfylte kravene som gjelder for akkurat denne saken.',
  'proc-02': 'Helhetskravet gjør at ett prosessuelt trekk ikke kan vurderes isolert fra muligheten til å svare, sakens betydning og virkningen på utfallet. Offentlighet, likhet mellom partene og begrunnelse har dessuten egne unntak og intensitet; metoden er å vise hvilken delgaranti som berøres og deretter hvordan den påvirker prosessen samlet.',
  'proc-03': 'En praktisk beslutningssti begynner med sivil sak eller straffesak, fortsetter med dom, kjennelse, beslutning eller prosesshandling, og avsluttes med riktig hjemmel og kontrollkompetanse. Hopper analysen direkte til rimelighet eller bevisvekt, kan den bruke feil lov, feil partsrettighet og feil prøvingsstandard.',
  'proc-04': 'Uavhengighet gjelder blant annet institusjonell og personlig avstand til saken, mens upartiskhet retter oppmerksomheten mot mulig forutinntatthet og hvordan situasjonen fremstår. En uriktig bevisvurdering kan være en ankegrunn uten at den av den grunn dokumenterer manglende uavhengighet; kategoriene må begrunnes hver for seg.',
  'proc-05': 'Kravet beskriver rettsfølgen parten vil ha, påstanden uttrykker resultatet retten bes avsi, og påstandsgrunnlaget er de rettsstiftende faktiske omstendighetene. Bevistemaet er hva som må bevises, mens bevismiddelet er informasjonskilden. Denne begrepsrekkefølgen hindrer at omfattende, men irrelevante opplysninger flytter tvisten.',
  'proc-06': 'Proporsjonalitet knytter ressursbruk og bevisføring til tvistens betydning, kompleksitet og behovet for forsvarlig opplysning. Aktiv saksstyring kan sette frister og konsentrere behandlingen, men må samtidig bevare kontradiksjonen og partenes reelle mulighet til å presentere det som er avgjørende.',
  'proc-07': 'Bevistilgang avgjør om en part eller tredjeperson må gjøre materiale tilgjengelig; først senere avgjør retten om materialet er troverdig og hvilken vekt det har. En tilgangsavgjørelse skal derfor ikke forskuttere hovedsaken, og en påstand om lav bevisverdi er normalt ikke det samme som et lovlig grunnlag for å nekte tilgang.',
  'proc-08': 'Kontradiksjon forutsetter kunnskap og en reell svarmulighet, men gir ikke rett til materiale som loven forbyr retten å motta. Analysen må derfor prøve både partens behov for innsyn og vernets rettsgrunnlag; balansen kan kreve avgrensning eller prosessuelle tiltak, ikke at ett hensyn uten videre utsletter det andre.',
  'proc-09': 'Påtalemyndighetens oppgave er å fremme og opplyse straffekravet, men retten er ikke bundet av aktors bevisvurdering eller rettslige konklusjon. Rollefordelingen skal spores gjennom hele forløpet: etterforskning, tiltale, bevisføring, forsvar og dom. Sammenblanding svekker både objektivitetskrav og domstolskontroll.',
  'proc-10': 'Presumsjonen virker før endelig dom og påvirker både beviskravet og myndighetenes språk om den siktede. Den praktiske testen er om skyld er etablert av påtalemyndighetens bevis etter straffesakens standard, ikke om den siktede har gjort sin uskyld mer sannsynlig enn tiltalen.',
  'proc-11': 'Forsvarerretten må være praktisk og effektiv: den siktede trenger tilstrekkelig tid, tilgang til relevant materiale og anledning til å utfordre bevisføringen. Kontradiksjon betyr ikke at alle prosessønsker skal innvilges, men at begrensninger må ha hjemmel, legitimt formål og en utforming som ikke tømmer forsvaret for reelt innhold.',
  'proc-12': 'En alternativ forklaring kan inngå i bevisbildet, men fraværet av en overbevisende alternativ historie fyller ikke et hull i påtalemyndighetens bevis. Begrunnelsen skal vise hva tiltalen krever bevist, hvilke bevis som bærer hvert ledd, og hvorfor eventuell tvil er overvunnet uten en skjult omvendt bevisbyrde.',
  'proc-13': 'Byrden er en risikoregel for det tilfellet at tvilen består, mens kravet er terskelen som bevisene må nå. De kan ikke utledes bare av hvem som lettest kunne skaffet et dokument. En presis drøftelse knytter begge til det materielle rettsgrunnlaget, bevistemaets art og eventuelle særregler.',
  'proc-14': 'Sivile saker tar ofte utgangspunkt i sannsynlighetsovervekt, men lov, rettspraksis og hensynet bak regelen kan skjerpe, senke eller flytte vurderingen. Straffesakens standard beskytter mot uriktig domfellelse og kan ikke kopieres til en sivil tvist bare fordi samme hendelse omtales i begge sakene.',
  'proc-15': 'Fri bevisvurdering gir retten ansvar for en konkret og samlet vurdering, ikke frihet fra rettsregler. Før vektingen må retten kontrollere føringsadgang, bevisforbud, kontradiksjon og riktig beviskrav. Først innenfor denne lovlige rammen kan troverdighet, pålitelighet og sammenheng vurderes.',
  'proc-16': 'En etterprøvbar begrunnelse navngir bevistemaet, viser hvem som bærer tvilsrisikoen, angir standarden og forklarer hvorfor sentrale bevis styrker eller svekker påstanden. Oppramsing av dokumenter er ikke nok; koblingen mellom bevis, slutning og rettslig relevant faktum må være synlig.',
  'proc-17': 'En begjæring om tilgang må identifisere materialet eller en praktisk avgrenset kategori og forklare relevansen for et bestemt bevistema. Deretter prøves rådighet, byrde og eventuelle forbud eller fritak. En vid søken etter mulige opplysninger kan ikke begrunnes bare med at noe interessant kanskje finnes.',
  'proc-18': 'Vernet etter § 22-5 gjelder innholdet i fortrolig kommunikasjon innenfor den beskyttede advokatrollen, ikke bare dokumenter med en bestemt etikett. Kontrollspørsmålene er hvem kommunikasjonen var mellom, i hvilken egenskap advokaten handlet, hva opplysningen røper og om klienten har disponert over vernet.',
  'proc-19': 'Frafall må knyttes til klientens konkrete håndtering av fortroligheten og rekkevidden av delingen. At en tredjeperson deltar eller mottar opplysningen kan være relevant, men besvarer ikke alene om materialet senere kan kreves av enhver motpart. Formål, mottakerkrets og etterfølgende bruk må beskrives.',
  'proc-20': 'Advokattittelen skaper ikke et generelt vitneforbud. Retten må skille egentlig advokatvirksomhet og fortrolig rådgivning fra administrative, forretningsmessige eller observerte forhold utenfor vernekjernen. Under forklaringen kan enkelte spørsmål stoppes selv om advokaten ellers har møte- og vitneplikt.',
  'proc-21': 'Opplesningsspørsmålet oppstår fordi umiddelbar muntlig prøving mangler. Retten må identifisere lovhjemmelen, hvorfor vitnet ikke avgir vanlig forklaring, om forsvaret tidligere har kunnet stille spørsmål og hvilken betydning utsagnet får. En politiprotokoll er ikke automatisk et fullgodt substitutt for krysseksaminasjon.',
  'proc-22': 'Al-Khawaja-strukturen organiserer tre spørsmål: god grunn for at vitnet ikke prøves, om utsagnet er eneste eller avgjørende bevis, og om motbalanserende garantier sikrer samlet rettferdighet. Trinnene er vurderingsmomenter i en helhet, ikke en mekanisk sjekkliste der ett ja automatisk avgjør saken.',
  'proc-23': 'Et dokument kan være bevis for at skribenten mottok eller gjenga en opplysning, mens den underliggende tredjepersonen kan være kilden til sannheten i selve utsagnet. Retten må klargjøre hvilket utsagn som brukes til hvilket bevistema; først da kan den identifisere hvem forsvaret må kunne utfordre.',
  'proc-24': 'Samlet rettferdighet avhenger av bevisets funksjon, styrke og muligheten til å kontrollere svakheter gjennom andre kilder, instrukser eller begrenset bruk. Formell tilgang til dokumentet hjelper lite dersom forsvaret ikke kan teste den avgjørende opplysningen eller rette opp en skjev presentasjon.',
  'proc-25': 'Avskjæring bestemmer om beviset får inngå i prosessen; vekt bestemmer hvilken slutning retten eventuelt trekker dersom det føres. Blander man spørsmålene, kan et bevis med mulig lav vekt avskjæres uten hjemmel, eller et ulovlig bevis tillates bare fordi det synes overbevisende.',
  'proc-26': 'Korrekt lovforståelse krever at retten identifiserer den aktuelle avskjæringsnormen og hvilke hensyn den tillater. Kontradiksjon, privatliv, gjentakelse av krenkelsen og sakens opplysning kan trekke ulikt. Begrunnelsen må vise hvilke momenter som faktisk bar avgjørelsen.',
  'proc-27': 'Norsk prosess har ikke en generell regel tilsvarende en automatisk «frukt av det forgiftede tre»-doktrine. Det betyr heller ikke at innhentingsmåten er irrelevant. Krenkelsens alvor, bevisets tilknytning, prosessformen og muligheten for fortsatt eller gjentatt krenkelse må vurderes konkret.',
  'proc-28': 'Et forholdsmessig tiltak kan være avgrenset føring, skjerming, utsatt innsyn eller annen prosessledelse dersom loven åpner for det og tiltaket faktisk beskytter rettigheten. Analysen skal forklare hvorfor full avskjæring er nødvendig, eller hvorfor et snevrere tiltak er tilstrekkelig, uten å forskuttere bevisvekten.',
  'proc-29': 'En dom avgjør typisk realiteten, en kjennelse brukes for bestemte prosessuelle og materielle avgjørelser loven angir, og en beslutning dekker andre prosessledende avgjørelser. Klassifikasjonen må hentes fra prosessloven fordi den påvirker form, begrunnelse, rettskraft og hvilke ankegrunner som kan prøves.',
  'proc-30': 'Lagmannsretten og Høyesterett har forskjellige oppgaver og adgangsfiltre, og Høyesterett er i hovedsak en prejudikatdomstol. En part må derfor identifisere hvilken instans som kan prøve faktum, lovanvendelse eller saksbehandling, og om samtykke eller andre vilkår begrenser en full realitetsprøving.',
  'proc-31': 'Ved nektelse etter § 321 andre ledd er kontrollpunktet om lagmannsretten har prøvd anken reelt og gjort det forståelig hvorfor den klart ikke kan føre frem i den aktuelle saken. Begrunnelseskravet kan ikke oppfylles med en tom standardfrase dersom sakens spørsmål krever synlig vurdering.',
  'proc-32': 'Innvirkningsvurderingen spør om feilen kan ha påvirket avgjørelsens innhold eller den forsvarlige behandlingen, innenfor feilregelen som gjelder. Noen feil har særskilte virkninger, mens andre krever konkret prøving. Opphevelse skal derfor begrunnes i hjemmel og mulig innvirkning, ikke i feiletiketten alene.'
};

function paragraph(topic, claim) {
  const frame = topicFrames[topic.id];
  assert(frame, `Mangler redaksjonell ramme for ${topic.id}`);
  const note = claimNotes[claim.id];
  assert(note, `Mangler claim-spesifikk analyse for ${claim.id}`);
  const sourceIds = claim.source_ids.join(', ');
  const sourceNames = claim.source_ids.map((id) => {
    const source = sourceById.get(id);
    assert(source, `Ukjent kilde ${id}`);
    return `${source.title} (${source.publisher})`;
  }).join(' og ');
  const text = `${claim.text} ${note} Kildesporet for ${claim.id} er ${sourceIds}: ${sourceNames}. Kildene må leses i sine respektive autoritetsroller; lovtekst, konvensjon, institusjonell veiledning og konkret Høyesterettsavgjørelse er ikke utskiftbare. Per 1. september 2026 må lovtekst og nyere avgjørelser versjonskontrolleres, og en senere lovendring eller ny prejudikatavklaring kan endre analysen. Fremstillingen er juridisk opplæring og ikke individuell juridisk rådgivning.`;
  assert(text.length >= 850, `${claim.id} er for kort (${text.length})`);
  return text;
}

assert(sourceBrief.status === 'source_first_ready_not_materialized', 'Felt 7 må være source-first før materialisering');
assert(sourceBrief.domain.ordinal === 7 && sourceBrief.domain.id === 'rettergang_bevis_sivilprosess_straffeprosess', 'Felt 7 har feil domene');
assert(sourceBrief.sources.length === 13 && sourceBrief.topic_briefs.length === 8 && claims.length === 32, 'Felt 7 source-first-kontrakt er brutt');

const moduleDefs = [
  ['01-rettergang-og-sivil-prosessramme', 'Rettferdig rettergang og sivil prosessramme', 0, 2],
  ['02-straffeprosess-og-beviskrav', 'Straffeprosess og beviskrav', 2, 4],
  ['03-bevistilgang-og-kontradiksjon', 'Bevistilgang og kontradiksjon', 4, 6],
  ['04-beviskontroll-og-overproving', 'Beviskontroll og overprøving', 6, 8]
];
const moduleFiles = [];

for (const [id, title, start, end] of moduleDefs) {
  const sections = sourceBrief.topic_briefs.slice(start, end).map((topic) => ({
    id: topic.id,
    title: topic.title,
    method_ids: topic.method_ids,
    boundary: topic.boundary,
    analysisFrame: [topicFrames[topic.id].analysis, topicFrames[topic.id].steps],
    paragraphs: topic.planned_claims.map((claim) => paragraph(topic, claim)),
    paragraphClaimIds: topic.planned_claims.map((claim) => [claim.id])
  }));
  const file = `${chapterDir}/${id}.json`;
  moduleFiles.push(file);
  write(file, { schema: 'history_go_fagverk_module_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'juss_rettsvitenskap', chapter_id: chapterId, id, title, sections });
}

write(chapterFile, {
  schema: 'history_go_fagverk_chapter_v1',
  version: '1.0.0',
  subject: 'politikk',
  subject_id: 'politikk',
  canonical_subcategory_id: 'juss_rettsvitenskap',
  domain_id: 'rettergang_bevis_sivilprosess_straffeprosess',
  id: chapterId,
  chapter_id: chapterId,
  title: 'Rettergang, bevis, sivilprosess og straffeprosess',
  subtitle: 'Fra rettferdig rettergang og partsroller til beviskontroll, begrunnelse og overprøving',
  lead: 'Kapittelet trener prosessformbevisst, kildebelagt og etterprøvbar analyse av norske sivile saker og straffesaker.',
  learningObjectives: sourceBrief.topic_briefs.map((topic) => `analysere ${topic.title.toLowerCase()} med eksplisitt prosessform-, hjemmels- og beviskontroll`),
  moduleFiles,
  briefFile: `${chapterDir}/brief.json`,
  claimsFile: `${chapterDir}/claims.json`,
  assessmentFile: `${chapterDir}/assessment.json`,
  editorialStatus: 'chapter_ready',
  claimTraceRequired: true,
  sourceFirst: true
});

write(`${chapterDir}/brief.json`, {
  schema: 'history_go_fagverk_chapter_brief_v1',
  version: '1.0.0',
  subject_id: 'politikk',
  canonical_subcategory_id: 'juss_rettsvitenskap',
  domain_id: 'rettergang_bevis_sivilprosess_straffeprosess',
  chapter_id: chapterId,
  sourceBriefFile,
  purpose: 'Materialisere rettergang og bevis som prosessformbevisst analyse med klare skiller mellom tilgang, føring, byrde, krav, vekt og overprøving.',
  sections: sourceBrief.topic_briefs.map((topic, index) => ({ ordinal: index + 1, id: topic.id, claim_ids: topic.planned_claims.map((claim) => claim.id) })),
  strict_boundaries: sourceBrief.topic_briefs.map((topic) => topic.boundary),
  fulltext_status: 'materialized_pending_strict_audit',
  source_first: true,
  claim_trace_required: true
});

write(`${chapterDir}/claims.json`, {
  schema: 'history_go_fagverk_claims_v1',
  version: '1.0.0',
  subject_id: 'politikk',
  canonical_subcategory_id: 'juss_rettsvitenskap',
  chapter_id: chapterId,
  retrieval_status: 'verified_2026-09-01',
  verified_at: DATE,
  trace_mode: 'source_brief_claim_text_and_sources_immutable',
  sourceBriefFile,
  verifiedClaims: claims.map((claim) => ({ id: claim.id, status: 'verified', verified_at: DATE, source_ids: claim.source_ids }))
});

const assessmentBlueprints = [
  ['Hvilken start gir en etterprøvbar vurdering av rettferdig rettergang?', ['Vurder om resultatet virker rimelig.', 'Fastsett sakstype, prosessledd, beslutningsorgan og aktuell garanti før helhetsvurderingen.', 'Bruk samme prosessregel i sivile saker og straffesaker.', 'Start med bevisvekten og utled derfra om domstolen var uavhengig.'], 1],
  ['Hva må holdes atskilt i sivil saksstyring?', ['Krav og domsslutning er alltid identiske.', 'Krav, påstand, påstandsgrunnlag, bevistema og bevismiddel har ulike funksjoner.', 'Retten kan fritt erstatte partenes tvistetema.', 'Relevans gjør ethvert bevis proporsjonalt.'], 1],
  ['Hva følger av uskyldspresumsjonen?', ['Siktede må bevise en alternativ hendelse.', 'Påtalemyndigheten bærer bevisansvaret, og retten skal prøve saken uavhengig.', 'Forsvareren avgjør hvilke bevis retten kan vektlegge.', 'Taushet er alltid et bevis for skyld.'], 1],
  ['Hvordan bygges en bevisdrøftelse?', ['Fastsett først ønsket resultat.', 'Identifiser bevistema, bevisbyrde og beviskrav før den konkrete og samlede bevisvekten forklares.', 'Bruk strafferettslig standard i alle saker.', 'Likestill bevisføring med bevisvekt.'], 1],
  ['Hva er riktig ved krav om advokatkommunikasjon?', ['Relevans opphever alltid taushetsvernet.', 'Avgrens begjæringen og prøv § 22-5, fortrolighet, rolle og eventuelt konkret frafall.', 'Tredjepartsdeling betyr automatisk universelt frafall.', 'Alt en advokat vet ligger utenfor vitneplikt.'], 1],
  ['Hva krever bruk av en tidligere politiforklaring?', ['At dokumentet finnes i saksmappen.', 'Kontroll av lovhjemmel, god grunn, bevisets betydning, krysseksaminasjon og motbalanserende garantier.', 'At aktor omtaler forklaringen som pålitelig.', 'At vitnet har forklart seg én gang tidligere.'], 1],
  ['Hva er riktig om ulovlig ervervede bevis?', ['De skal alltid føres.', 'Innhentingsfeil, føringsadgang og vekt må skilles, og avskjæring krever konkret rettslig forankring.', 'De skal alltid avskjæres.', 'Bevisets vekt avgjør alene om det kan føres.'], 1],
  ['Hva må avklares før en anke vurderes?', ['Bare om parten er uenig.', 'Avgjørelsestype, instans, ankegrunn, kompetanse, filtre og mulig innvirkning av prosessfeil.', 'At alle anker gir full ny behandling.', 'At enhver prosessfeil automatisk fører til opphevelse.'], 1]
];

const questions = sourceBrief.topic_briefs.map((topic, index) => {
  const [prompt, choices, correctIndex] = assessmentBlueprints[index];
  return {
    id: `proc-q${String(index + 1).padStart(2, '0')}`,
    prompt,
    choices,
    correctIndex,
    claim_ids: topic.planned_claims.map((claim) => claim.id),
    source_ids: [...new Set(topic.planned_claims.flatMap((claim) => claim.source_ids))]
  };
});
const caseClaimIds = [['proc-05', 'proc-08'], ['proc-13', 'proc-16'], ['proc-17', 'proc-20'], ['proc-21', 'proc-24'], ['proc-25', 'proc-28'], ['proc-29', 'proc-32']];
const caseTasks = sourceBrief.decision_scenarios.map((scenario, index) => ({
  id: `proc-case-${String(index + 1).padStart(2, '0')}`,
  title: scenario.title,
  prompt: scenario.prompt,
  responseMode: 'guided_discussion_no_required_typing',
  claim_ids: caseClaimIds[index],
  source_ids: scenario.source_ids
}));

write(`${chapterDir}/assessment.json`, { schema: 'history_go_fagverk_assessment_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'juss_rettsvitenskap', chapter_id: chapterId, questions, caseTasks });
console.log('Rettergang/bevis materialisert deterministisk: 4 moduler / 8 seksjoner / 32 avsnitt / 32 claims.');
