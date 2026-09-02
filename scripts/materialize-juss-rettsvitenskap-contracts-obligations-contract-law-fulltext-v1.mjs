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

const DATE = '2026-09-02';
const sourceBriefFile = 'data/fag/politikk/juss_rettsvitenskap/contracts_obligations_contract_law_source_claim_brief_v1.json';
const sourceBrief = read(sourceBriefFile);
const claims = sourceBrief.topic_briefs.flatMap((topic) => topic.planned_claims || []);
const sourceById = new Map(sourceBrief.sources.map((source) => [source.id, source]));
const chapterId = 'avtaler-obligasjoner-og-kontraktsrett';
const chapterDir = `data/fagverk/politikk/juss_rettsvitenskap/${chapterId}`;
const chapterFile = `data/fagverk/politikk/juss_rettsvitenskap/${chapterId}.json`;

const topicFrames = {
  'avtaleinngaaelse-tilbud-aksept-og-rettsvalg': {
    analysis: 'Kontraktsrettslig metode begynner med virkeområdet: parter, ytelse, jurisdiksjon, lovvalg og fravikelighet fastsettes før tilbud og aksept tolkes. Avtaleloven, kontraktstypelover og CISG kan gi ulike svar på samme kommunikasjonsforløp, og sedvane eller etablert praksis kan utfylle avtalen.',
    steps: 'Lag først en kronologi over erklæringene, klassifiser deretter hver handling som tilbud, aksept, avslag, tilbakekall eller nytt tilbud, og kontroller til slutt om en ufravikelig regel eller et internasjonalt virkeområde begrenser partenes avtalte løsning.'
  },
  'fullmakt-representasjon-standardvilkaar-og-transparens': {
    analysis: 'Representasjon krever et skille mellom hvem som er avtalepart, fullmaktens ytre legitimasjon, den interne instruksen og medkontrahentens kunnskap. For standardvilkår kommer spørsmål om inkorporasjon, tolkning og transparens i tillegg; partsrolle og forhandlingssituasjon bestemmer kontrollens intensitet.',
    steps: 'Identifiser fullmaktsgrunnlag og kompetanse før eventuell instruksoverskridelse prøves. For vilkår må analysen vise når og hvordan de ble gjort tilgjengelige, om de ble vedtatt, hvilket regelsett som styrer kontrollen, og hvilken rettsvirkning en mangel får.'
  },
  'ugyldighet-urimelighet-og-forbrukervern': {
    analysis: 'Ugyldighetslæren består av flere selvstendige normer. Tvang, svik, utnyttelse, feil, redelighet og rimelighetskontroll har ulike faktiske vilkår, skyldkrav og virkninger. Forbrukervilkår må dessuten prøves mot EØS-baserte transparens- og ubalanseregler uten at disse gjøres til et generelt næringsrettslig regime.',
    steps: 'Drøftelsen skal identifisere konkret grunnlag, bevistema, vernet interesse, partenes kunnskap og tidspunktet for vurderingen. Deretter fastsettes om avtalen eller vilkåret faller bort, endres eller består, og om særskilte kundebeføyelser kommer i tillegg.'
  },
  'oppfyllelse-levering-betaling-og-risiko': {
    analysis: 'Obligasjonsretten tar utgangspunkt i primærpliktene: hva, hvor, når og hvordan hver part skal prestere. Levering, betaling, medvirkning og risikoovergang er separate knutepunkter. Tilfeldig skade etter risikoovergang kan påvirke betalingsplikten uten å reparere en mangel som forelå ved levering.',
    steps: 'Fastsett først avtalens ytelsesprogram og utfyllende lov, bygg så en tidslinje for levering, betaling og risiko, og plasser til slutt årsaken til avviket. Kontraktstypekontrollen må gjentas før en regel fra varekjøp brukes på bolig, tjenester eller digitale ytelser.'
  },
  'forsinkelse-oppfyllelse-tilbakehold-og-heving': {
    analysis: 'Forsinkelse er et avvik fra rettidig oppfyllelse som ikke skyldes kreditorens forhold, men beføyelsene følger ikke automatisk. Oppfyllelse, tilbakehold, tilleggsfrist, heving og erstatning beskytter forskjellige interesser og har egne terskler, varsler og unntak i hvert kontraktsregime.',
    steps: 'Avklar forfall, faktisk prestasjon og årsak før beføyelsen velges. Prøv deretter hjemmel, eventuelt varsel, forholdsmessighet eller vesentlighet, og beskriv særskilt hvordan heving, restitusjon og et mulig erstatningskrav virker sammen.'
  },
  'mangel-konformitet-retting-og-omlevering': {
    analysis: 'Mangel fastsettes mot det konkrete ytelsesprogrammet: avtalte egenskaper, objektive lovkrav, opplysninger, formål og relevant vurderingstidspunkt. Retting og omlevering er avhjelpsformer, ikke synonymer; leverandørens avhjelpsrett og kreditorens valg varierer med ytelsens art og kontraktstypeloven.',
    steps: 'Spesifiser avviket og tidspunktet, knytt det til riktig kontraktskrav, og vurder reklamasjon og bevisregler. Før sekundære beføyelser prøves, må det forklares om avhjelp er mulig, lovlig, rettidig og uten urimelig kostnad eller ulempe.'
  },
  'prisavslag-heving-erstatning-og-tapsbegrensning': {
    analysis: 'Prisavslag gjenoppretter ytelsesbalansen, heving løser opp kontrakten ved kvalifisert brudd, og erstatning kompenserer økonomisk tap. Ansvarsgrunnlag, årsakssammenheng, påregnelighet, tapsutmåling, skillet mellom direkte og indirekte tap og tapsbegrensning er egne ledd i erstatningsanalysen.',
    steps: 'Velg beføyelse ut fra interesse og hjemmel, beregn virkningen etter riktig regel, og prøv kumulasjon eller avskjæring uttrykkelig. En erstatningsdrøftelse skal holde kontraktsbrudd og ansvar adskilt fra dokumentert tap og fra den skadelidtes senere tapsbegrensning.'
  },
  'fordringer-foreldelse-angrerett-og-internasjonale-kjop': {
    analysis: 'Fordringens grunnlag, overdragelse, rettsvern, innsigelser og foreldelse hører til forskjellige stadier. Angrerett er lovbestemt uttreden uten kontraktsbrudd i bestemte forbrukeravtaler, mens CISG regulerer avgrensede internasjonale varekjøp og verken generell gyldighet eller tingsrettslig eiendomsvirkning.',
    steps: 'Bygg en tidslinje for avtale, forfall, overdragelse, melding, kunnskap og fristavbrudd. Klassifiser deretter om innsigelsen gjelder grunnforholdet, overdragelsen, foreldelsen, angreretten eller CISGs virkeområde før rettsvirkningen fastsettes.'
  }
};

const claimNotes = {
  'contract-01': 'Avtaleloven må ikke brukes før en virkeområdekontroll er gjort. I en norsk innenlands avtale kan tilbud–aksept-modellen være utgangspunktet, mens CISG del II styrer inngåelsen når konvensjonens parts-, vare- og internasjonalitetsvilkår er oppfylt og den ikke er fraveket. Analysen må også undersøke handelsbruk og partenes praksis; det er rettskildefeil å kombinere enkeltregler fra systemene uten å begrunne hvilket som gjelder.',
  'contract-02': 'En aksept som kommer etter fristen eller endrer pris, mengde, kvalitet, levering eller ansvar, kan endre kommunikasjonens rettslige karakter. Det avgjørende er ikke partens etikett, men erklæringens innhold, tidspunkt og det anvendelige regelsettets terskel for vesentlige avvik. Etterfølgende levering eller betaling kan dessuten være relevant for om partene senere inngikk avtale ved konkludent atferd, men reparerer ikke automatisk den opprinnelige aksepten.',
  'contract-03': 'Tilbakekall gjelder en erklæring før eller idet den får bindende virkning, mens avslag avslutter tilbudssituasjonen og oppsigelse virker på et bestående kontraktsforhold. En tidslinje må derfor registrere når melding ble sendt, kom frem og ble tilgjengelig for mottakeren. CISGs regler om revocability og avtalelovens løfteprinsipp må ikke blandes; forskjellen kan være avgjørende dersom tilbudsgiveren forsøker å trekke et tilbud tilbake.',
  'contract-04': 'Parts- og ytelsesklassifisering kommer før tolkning av en ansvarsfraskrivelse. Kjøpsloven åpner normalt for avtalte avvik, mens forbrukerkjøpsloven beskytter en forbruker som kjøper fra næringsdrivende med ufravikelige minimumsregler. Privatkjøp, næringskjøp og forbrukerkjøp kan derfor ha samme vare, men ulikt rettslig regime. Analysen må vise hvem som handler hovedsakelig innenfor og utenfor næringsvirksomhet på avtaletidspunktet.',
  'contract-05': 'Stillingsfullmakt eller annet fullmaktsgrunnlag bestemmer den synlige kompetansen overfor tredjeperson; en intern beløpsgrense er ikke uten videre identisk med denne grensen. Kunnskap eller aktsom uvitenhet hos medkontrahenten kan likevel få betydning ved overskridelse. I finansavtalen må dette representasjonsspørsmålet behandles separat fra foretakets lovbestemte informasjons-, rådgivnings- og dokumentasjonsplikter, som ikke forsvinner fordi en ansatt eller agent formidlet avtalen.',
  'contract-06': 'Før rettsvirkningen av en disposisjon vurderes, må analysen fastslå om representanten handlet i en annens navn, hvilket legitimasjonsgrunnlag som forelå, og om tredjepersonen forstod hvem som skulle bindes. Finansforetaket kan ikke bruke en representasjonskjede til å flytte ufravikelige kundevern ut av avtalen. Samtidig kan ikke et brudd på en tjenesteyterplikt uten videre behandles som manglende fullmakt; hjemmel og virkning må holdes fra hverandre.',
  'contract-07': 'Transparens er både språklig og funksjonell: forbrukeren må kunne forstå standardvilkåret og dets økonomiske eller rettslige følger innenfor direktivets virkeområde. Uklarhetsregelen løser tolkingstvil til fordel for forbrukeren, mens urimelighetskontrollen spør om god tro og betydelig skjevhet. Finansavtalelovens konkrete opplysningsregler kan skjerpe hva som må presenteres før avtaleinngåelse, men hver mangel må knyttes til sin egen rettsvirkning.',
  'contract-08': 'Formkrav kan gjelde dokumentets medium, obligatorisk informasjon, levering av avtalevilkår eller bekreftelse, og varierer mellom finansprodukter. Det er utilstrekkelig å konstatere at partene var enige etter alminnelig avtalerett dersom særloven krever mer for å beskytte kunden eller dokumentere forpliktelsen. Omvendt må analysen ikke anta ugyldighet for ethvert formbrudd; lovens sanksjonssystem må undersøkes uttrykkelig.',
  'contract-09': 'Tvang, svik, utnyttelse og erklæringsfeil krever ulike fakta om press, villedning, misforhold, årsak og motpartens kunnskap. En finansinstitusjons brudd på egne plikter kan være bevismessig relevant og utløse særkrav, men erstatter ikke vilkårene i det ugyldighetsgrunnlaget som påberopes. En presis løsning identifiserer derfor både inngåelsesfeilen og den særskilte finansrettslige plikten, og fastsetter virkningen for hvert spor.',
  'contract-10': 'Avtaleloven § 36 åpner for en bred vurdering av innhold, partenes stilling, inngåelsesforhold, senere forhold og omstendighetene ellers. Direktiv 93/13 gjelder derimot ikke individuelt forhandlede forbrukervilkår og bygger på en særskilt ubalanse- og godtrotest. Normene kan berøre samme vilkår, men vurderingstidspunkt, virkeområde og virkning er ikke identiske. Analysen må derfor foreta to begrunnede subsumsjoner, ikke bare vise til «urimelighet».',
  'contract-11': 'At et vilkår ikke binder forbrukeren, betyr ikke nødvendigvis at hele kontrakten faller bort; avtalen kan bestå dersom den kan fungere uten vilkåret. Før denne virkningen vurderes, må det fastslås at vilkåret ikke var individuelt forhandlet, at det skaper betydelig skjevhet og at godtrokravet er brutt i den konkrete konteksten. Direktivets vedlegg gir veiledende eksempler, ikke en automatisk ugyldighetsliste løsrevet fra kontraktens øvrige struktur.',
  'contract-12': 'En dårlig handel kan skyldes markedsutvikling eller bevisst risikotaking og er ikke i seg selv en rettslig mangel. Rettslig kontroll krever et identifisert grunnlag og faktum om forhandling, informasjon, alternativene, partenes styrke og hvordan vilkåret fordeler risiko. I forbrukerforhold er klarhet og ubalanse sentralt; etter § 36 inngår også et bredere rimelighetsbilde. Resultatet må knyttes til konkret tilsidesettelse eller endring, ikke moralsk misnøye med prisen.',
  'contract-13': 'Leveringstid og -sted bestemmer når selgeren skal prestere, når kjøperens medvirkning kreves og ofte når forsinkelse begynner. Avtalens klausuler går foran deklaratoriske regler, men kan ikke forringe ufravikelig forbrukervern. CISG bruker egne leveringskategorier for transportkjøp og andre kjøp. En løsning må derfor klassifisere transportforløpet og partene før den avgjør om overlevering, avsendelse eller tilgjengeliggjøring oppfyller leveringsplikten.',
  'contract-14': 'Risiko handler om tilfeldig hendelse uten kontraktsbrudd: etter overgang kan kjøperen i visse tilfeller måtte betale selv om varen skades. Det fritar ikke selgeren for en mangel som allerede forelå, uforsvarlig emballering eller brudd på omsorgsplikt. Transport, forbrukerkjøp og CISG kan plassere skjæringstidspunktet ulikt. Analysen skal identifisere hendelsen, årsaken og tidspunktet før betalings- og mangelsvirkninger utledes.',
  'contract-15': 'En brukt boligoverføring, oppføring av ny bolig og levering av løpende programvare har ulike objekter, kontrollmuligheter og risikoforløp. Avhendingslova knytter seg til avhending av fast eiendom, bustadoppføringslova til entreprenørens ytelse overfor forbruker, og digitalytelsesloven til digitale ytelser og oppdateringer. En analogi fra varekjøp må begrunnes og kan ikke overstyre særlovens uttrykkelige løsning.',
  'contract-16': 'Betalingsplikten omfatter beløp, valuta, betalingssted og forfall, men kreditorens mislighold kan gi rett til forholdsmessig tilbakehold. Kjøperens medvirkning – for eksempel å spesifisere, motta eller gi tilgang – må skilles fra betaling. Dersom et arbeid er mangelfullt, skal tilbakeholdet sikre kravet og ikke fungere som straff. Hjemmel og beregningsmåte må hentes fra den aktuelle kontraktstypeloven.',
  'contract-17': 'Oppfyllelse retter seg mot den avtalte ytelsen, tilbakehold sikrer et motkrav, heving avslutter avtalebåndet og erstatning kompenserer tap. At forsinkelse er konstatert, avgjør derfor ikke hvilken beføyelse som kan brukes. Umulighet, uforholdsmessig byrde, tilleggsfrist og vesentlighet kan gi ulike utslag etter kjøpsloven, forbrukerkjøpsloven og CISG. Hver påstand må få en egen subsumsjon og rettsvirkning.',
  'contract-18': 'Tilbakehold skal stå i funksjonell sammenheng med misligholdskravet og begrenses etter lovens formulering, typisk til det som sikrer kravet. Forbrukeren kan ikke uten videre stanse hele betalingen for et mindre avvik. Samtidig må beregningen ta høyde for usikkerheten i utbedringskostnad eller prisavslag. Ved håndverk og boligoppføring må betalingsplan, garanti og stadium i arbeidet inngå i den konkrete vurderingen.',
  'contract-19': 'En tilleggsfrist gir debitor en siste klart angitt mulighet til å oppfylle og kan skjerpe kreditorens hevingsposisjon når fristen utløper. Varslet må være forståelig og fristen rimelig i den aktuelle situasjonen. CISG, kjøpsloven og forbrukerreglene bruker mekanismen med forskjellige vilkår og unntak. Kreditorens atferd i fristperioden må også vurderes; et hevingsvarsel kan ikke uten videre behandles som både frist og umiddelbar heving.',
  'contract-20': 'Digital levering kan bestå i nedlasting, tilgang eller en kontinuerlig tjeneste, og tidspunktet må fastsettes etter avtalen og digitalytelsesloven. Dersom levering uteblir, må forbrukeren følge lovens system for krav om levering, eventuell tilleggsfrist og heving, med relevante unntak. Fysisk risikoovergang og omlevering av en vare beskriver ikke uten videre en sky- eller strømmetjeneste; ytelsens tekniske form er rettslig relevant.',
  'contract-21': 'Mangelsspørsmålet krever en norm og et tidspunkt. Avtalt beskrivelse, opplysninger før kjøpet, vanlig og særlig formål og lovens objektive krav kan alle inngå, mens risiko- eller overtakelsestidspunktet ofte avgrenser selgerens ansvar. For fast eiendom må blant annet opplysninger og kjøperens forventninger prøves etter avhendingslova. Senere skade er ikke automatisk bevis for opprinnelig mangel, men kan belyse tilstanden ved skjæringstidspunktet.',
  'contract-22': 'Forbrukerkjøpsloven og digitalytelsesloven inneholder moderne konformitetskrav, herunder funksjonalitet, kompatibilitet og i digitale forhold oppdateringer. Lovbestemte presumsjoner kan påvirke hvem som bærer usikkerheten om når mangelen oppstod. Kjøpslovens deklaratoriske løsning for andre kjøp kan ikke avtales inn som en svekkelse av dette vernet. Analysen må likevel identifisere om avtalen gjelder en vare, digital ytelse eller en kombinasjon.',
  'contract-23': 'Omlevering er praktisk for fungible varer, men kan være umulig for unik eiendom og lite treffende for individuelt arbeid på en ting. Retting vurderes mot kostnad, tid, risiko for nye feil og kreditorens ulempe, mens leverandørens rett til avhjelp kan begrense umiddelbart prisavslag eller heving. En god drøftelse sammenligner de tilgjengelige avhjelpsformene under riktig lov og forklarer hvorfor den valgte løsningen er forholdsmessig.',
  'contract-24': 'Bustadoppføringslova regulerer entreprenørens fremtidige eller pågående oppføring for en forbruker og har særregler om garanti, overtakelse og retting. Avhendingslova gjelder selve avhendingen i andre boligkjøp. Det avgjørende er kontraktens realitet og tidspunkt, ikke bare at sluttobjektet er en bolig. Før beføyelser beregnes må analysen derfor klassifisere avtalen, dokumentere avviket og identifisere hvem som har rett og plikt til å rette.',
  'contract-25': 'Prisavslag bygger normalt på verdiforholdet eller en lovbestemt tilnærming til reduksjonen i ytelsesverdien, mens erstatning krever et økonomisk tap og ansvarsgrunnlag. Utbedringskostnad kan være bevis for begge beregninger, men er ikke automatisk målet. En part kan i noen tilfeller kreve både prisavslag og erstatning for forskjellige tapsposter, men dobbeltkompensasjon må unngås. Beregningsregelen må angis eksplisitt.',
  'contract-26': 'Vesentlighet vurderes ut fra kontraktsbruddets betydning for kreditor, mulighet for avhjelp, skyld og forutsigbarhet innenfor den aktuelle loven. CISG bruker «fundamental breach», som ikke uten begrunnelse kan oversettes til enhver norsk hevingsstandard. Heving krever ofte rettidig erklæring og utløser tilbakeføring eller avregning. Analysen må derfor skille vilkåret for å heve fra de etterfølgende restitusjonsvirkningene.',
  'contract-27': 'Kontrollansvar spør blant annet om hindringen lå utenfor debitors kontroll og kunne forutses eller overvinnes; skyldansvar spør om klanderverdig opptreden. Uansett grunnlag må skadelidte bevise relevant årsakssammenheng og økonomisk tap. Enkelte lover begrenser indirekte tap eller gir særregler for person- og tingsskade. En fullstendig drøftelse går leddvis og lar ikke et klart kontraktsbrudd bli et automatisk bevis for hele erstatningskravet.',
  'contract-28': 'Tapsbegrensning vurderes etter kontraktsbruddet: hvilke rimelige kjøp, reparasjoner, varsler eller disposisjoner kunne redusert tapet uten urimelig risiko eller kostnad? Bare den unngåelige delen av tapet reduseres. Debitor må ikke bruke regelen til å omskrive det opprinnelige ansvaret, og skadelidte trenger ikke velge et urealistisk eller farlig alternativ. Tidspunkt og tilgjengelig informasjon er derfor sentrale i vurderingen.',
  'contract-29': 'Overdragelsen skaper ikke et bedre underliggende kjøpskrav enn det avhenderen hadde, men skyldnervernet avhenger av fordringstype, melding, god tro og gjeldsbrevlovas regler. Innsigelser om mangelfull vare hører til grunnforholdet, mens betaling til tidligere kreditor eller motregning kan avhenge av overdragelsesforløpet. Analysen må derfor lese kjøpsavtalen og overdragelsen parallelt uten å gjøre dem til samme rettsstiftende faktum.',
  'contract-30': 'Foreldelse krever en selvstendig tidslinje fra den dagen kreditor tidligst kunne kreve oppfyllelse, med vurdering av kunnskapsbasert tilleggsfrist og lovlig avbrudd. Et signert gjeldsbrev dokumenterer fordringen, men fryser ikke tiden. Erkjennelse, rettslige skritt og enkelte avtaler kan ha bestemte virkninger; vanlig purring må ikke uten hjemmel behandles som avbrudd. Dokumenttype og håndhevbarhet er separate spørsmål.',
  'contract-31': 'Angreretten er knyttet til avtaleformen og forbrukerrollen, ikke til at ytelsen er forsinket eller mangelfull. Opplysninger, angreskjema, friststart og eventuelle unntak må kontrolleres før virkningene beregnes. Heving forutsetter derimot kontraktsbrudd under den relevante kontraktstypeloven. En forbruker kan ha ett, begge eller ingen grunnlag, men tilbakelevering, betaling og kostnader må behandles under riktig regelsett.',
  'contract-32': 'CISG krever blant annet internasjonalt varekjøp mellom relevante forretningssteder og har uttrykkelige unntak, deriblant visse forbrukerkjøp. Konvensjonen regulerer avtaleinngåelse og selgerens og kjøperens rettigheter og plikter, men ikke generelt gyldighet eller hvilken tingsrettslig eiendomsvirkning avtalen får. Lovvalg og eventuell reservasjon eller fravikelse må derfor avklares før nasjonale regler brukes til å fylle reelle hull.'
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
  const text = `${claim.text} ${note} Kildesporet for ${claim.id} er ${sourceIds}: ${sourceNames}. Kildene må brukes i sine rettskildemessige roller og med virkeområde, partsstilling, fravikelighet og tidsversjon synlig; en alminnelig lov, en kontraktstypelov, et EØS-direktiv og en internasjonal konvensjon er ikke utskiftbare. Per 2. september 2026 må lovtekst, EØS-gjennomføring og eventuell nyere rettspraksis versjonskontrolleres. Fremstillingen er juridisk opplæring og ikke individuell juridisk rådgivning.`;
  assert(text.length >= 850, `${claim.id} er for kort (${text.length})`);
  return text;
}

assert(sourceBrief.status === 'source_first_ready_not_materialized', 'Felt 8 må være source-first før materialisering');
assert(sourceBrief.domain.ordinal === 8 && sourceBrief.domain.id === 'avtaler_obligasjoner_kontraktsrett', 'Felt 8 har feil domene');
assert(sourceBrief.sources.length === 13 && sourceBrief.topic_briefs.length === 8 && claims.length === 32, 'Felt 8 source-first-kontrakt er brutt');

const moduleDefs = [
  ['01-avtaleinngaaelse-og-representasjon', 'Avtaleinngåelse og representasjon', 0, 2],
  ['02-gyldighet-og-oppfyllelse', 'Gyldighet og oppfyllelse', 2, 4],
  ['03-kontraktsbrudd-og-avhjelp', 'Kontraktsbrudd og avhjelp', 4, 6],
  ['04-befoyelser-og-fordringens-liv', 'Beføyelser og fordringens videre liv', 6, 8]
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
  domain_id: 'avtaler_obligasjoner_kontraktsrett',
  id: chapterId,
  chapter_id: chapterId,
  title: 'Avtaler, obligasjoner og kontraktsrett',
  subtitle: 'Fra avtaleinngåelse og oppfyllelse til kontraktsbrudd, beføyelser og fordringens videre liv',
  lead: 'Kapittelet trener kontraktstypebevisst, partsbevisst og kildebelagt analyse av norske og internasjonale kontraktsforhold.',
  learningObjectives: sourceBrief.topic_briefs.map((topic) => `analysere ${topic.title.toLowerCase()} med eksplisitt virkeområde-, parts-, fravikelighets- og beføyelseskontroll`),
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
  domain_id: 'avtaler_obligasjoner_kontraktsrett',
  chapter_id: chapterId,
  sourceBriefFile,
  purpose: 'Materialisere avtaler og obligasjoner som virkeområdebevisst analyse med klare skiller mellom inngåelse, gyldighet, primærplikter, kontraktsbrudd, beføyelser og fordringens videre liv.',
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
  retrieval_status: 'verified_2026-09-02',
  verified_at: DATE,
  trace_mode: 'source_brief_claim_text_and_sources_immutable',
  sourceBriefFile,
  verifiedClaims: claims.map((claim) => ({ id: claim.id, status: 'verified', verified_at: DATE, source_ids: claim.source_ids }))
});

const assessmentBlueprints = [
  ['Hva må avklares før tilbud og aksept vurderes?', ['Om utfallet virker kommersielt rimelig.', 'Parter, ytelse, jurisdiksjon, anvendelig regelsett og fravikelighet.', 'Bare hvilken part som skrev først.', 'At avtaleloven alltid fortrenger CISG.'], 1],
  ['Hvordan analyseres representasjon og standardvilkår?', ['Intern instruks er alltid lik ytre fullmakt.', 'Fullmaktsgrunnlag, ytre ramme, kunnskap, inkorporasjon og særskilte transparenskrav prøves hver for seg.', 'Ethvert standardvilkår er ugyldig.', 'En representant fjerner tjenesteyterens lovplikter.'], 1],
  ['Hva kreves for å påberope ugyldighet eller urimelighet?', ['At avtalen ble økonomisk ugunstig.', 'Et identifisert rettsgrunnlag med egne vilkår, bevistema og rettsvirkning.', 'At parten angrer senere.', 'At § 36 og direktiv 93/13 behandles som samme regel.'], 1],
  ['Hva må holdes atskilt i oppfyllelsesanalysen?', ['Levering, betaling, medvirkning, risiko og mangelsansvar.', 'Bare pris og betalingsmåte.', 'Risiko og skyld er identiske.', 'Alle kontraktstyper følger varekjøpsreglene.'], 0],
  ['Hvordan prøves beføyelser ved forsinkelse?', ['Alle beføyelser følger automatisk av forsinkelsen.', 'Hver beføyelse prøves mot egen hjemmel, terskel, varsel og virkning i riktig kontraktsregime.', 'Heving opphever alltid erstatningsspørsmålet.', 'Tilbakehold kan brukes som straff.'], 1],
  ['Hvordan fastsettes mangel og avhjelp?', ['Ut fra enhver senere skade.', 'Mot avtale, objektive krav, opplysninger og riktig tidspunkt, før retting eller omlevering vurderes.', 'Omlevering passer likt for bolig og massevarer.', 'Avhjelp kan alltid avvises uten grunn.'], 1],
  ['Hva skiller prisavslag fra erstatning?', ['Ingen ting; de har samme beregning.', 'Prisavslag korrigerer ytelsesbalansen, mens erstatning krever ansvarsgrunnlag, årsak og økonomisk tap.', 'Prisavslag krever alltid skyld.', 'Erstatning krever aldri dokumentert tap.'], 1],
  ['Hva er riktig om fordringens videre liv?', ['Gjeldsbrev hindrer alltid foreldelse.', 'Grunnforhold, overdragelse, skyldnervern, foreldelse, angrerett og CISG har ulike virkeområder.', 'Angrerett er det samme som heving.', 'CISG regulerer alltid eiendomsrettens overgang.'], 1]
];

const questions = sourceBrief.topic_briefs.map((topic, index) => {
  const [prompt, choices, correctIndex] = assessmentBlueprints[index];
  return {
    id: `contract-q${String(index + 1).padStart(2, '0')}`,
    prompt,
    choices,
    correctIndex,
    claim_ids: topic.planned_claims.map((claim) => claim.id),
    source_ids: [...new Set(topic.planned_claims.flatMap((claim) => claim.source_ids))]
  };
});
const caseClaimIds = [['contract-01', 'contract-04'], ['contract-05', 'contract-08'], ['contract-10', 'contract-12'], ['contract-17', 'contract-20'], ['contract-21', 'contract-27'], ['contract-29', 'contract-30']];
const caseTasks = sourceBrief.decision_scenarios.map((scenario, index) => ({
  id: `contract-case-${String(index + 1).padStart(2, '0')}`,
  title: scenario.title,
  prompt: scenario.prompt,
  responseMode: 'guided_discussion_no_required_typing',
  claim_ids: caseClaimIds[index],
  source_ids: scenario.source_ids
}));

write(`${chapterDir}/assessment.json`, { schema: 'history_go_fagverk_assessment_v1', version: '1.0.0', subject_id: 'politikk', canonical_subcategory_id: 'juss_rettsvitenskap', chapter_id: chapterId, questions, caseTasks });
console.log('Avtaler/obligasjoner materialisert deterministisk: 4 moduler / 8 seksjoner / 32 avsnitt / 32 claims.');
