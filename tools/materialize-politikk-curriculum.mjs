#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POLITIKK = path.join(ROOT, 'data/fag/politikk');
const FAGVERK = path.join(ROOT, 'data/fagverk/politikk');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];
const words = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const normalize = (value) => words(value).toLocaleLowerCase('nb-NO');
const slug = (value) => normalize(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const boundedMatcher = (...patterns) => new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${patterns.join('|')})(?=$|[^\\p{L}\\p{N}])`, 'iu');

const pensum = readJson(path.join(POLITIKK, 'politikkpensum_canonical_v4_5.json'));
const emners = readJson(path.join(POLITIKK, 'emner_politikk_canonical_v4_5.json'));
const methodsDocument = readJson(path.join(POLITIKK, 'methods_politikk_canonical_v4_5.json'));
const fagkart = readJson(path.join(POLITIKK, 'fagkart_politikk_canonical_v4_5.json'));
const conceptReviewsDocument = readJson(path.join(POLITIKK, 'concept_editorial_reviews_politikk_v1.json'));
const conceptReviewById = new Map(list(conceptReviewsDocument.reviews).map((review) => [review.concept_id, review]));
const methods = list(methodsDocument.methods);
const emneById = new Map(emners.map((emne) => [emne.emne_id, emne]));
const domainById = new Map(list(pensum.domains).map((domain) => [domain.domain_id, domain]));

function learningItem({ id, label, description, overview, learning, questions, ...links }) {
  return { id, label, description, overview, learning_outcomes: learning, key_questions: questions, ...links };
}

const progression = [
  learningItem({
    id: 'innforing_begrep_pastand_belegg', label: 'Innføring: begrep, påstand og belegg', level: 'grunnlag',
    description: 'Lær å skille politiske standpunkter fra statsvitenskapelige beskrivelser, forklaringer og vurderinger.',
    overview: 'Statsvitenskap begynner med presise spørsmål: Hva er fenomenet, hvem handler, hvilke regler gjelder, og hvilket belegg støtter påstanden? I dette trinnet lærer du å skille observasjon fra tolkning og normativ vurdering. Du arbeider med begreper som må avgrenses før de måles, og med kilder som må vurderes etter opphav, formål, utvalg og relevans. Målet er ikke politisk nøytralitet i betydningen fravær av verdier, men en analyse der premisser og slutninger kan etterprøves.',
    learning: ['Skille mellom empiriske påstander, kausale forklaringer og normative vurderinger i samme politiske argument.', 'Avgrense et politisk begrep og forklare hvilke observasjoner som kan brukes som indikatorer.', 'Vurdere om et dokument, datasett eller case faktisk gir belegg for den påstanden som fremmes.'],
    questions: ['Hva måtte vi ha observert for at denne politiske påstanden skulle være godt begrunnet?', 'Hvilke verdier eller antakelser ligger mellom de empiriske premissene og konklusjonen?', 'Hvordan endres analysen dersom begrepet eller analyseenheten avgrenses annerledes?'],
    domain_ids: ['statsvitenskapelig_metode_og_sammenligning']
  }),
  learningItem({
    id: 'grunnkurs_makt_demokrati_stat', label: 'Grunnkurs I: makt, stat og demokrati', level: 'grunnkurs',
    description: 'Bygg et felles språk for autoritet, institusjoner, rettigheter, representasjon, legitimitet og politisk konflikt.',
    overview: 'Grunnkurset undersøker hvordan kollektivt bindende beslutninger blir mulige, hvorfor noen aktører får større innflytelse enn andre, og hvordan offentlig makt kan begrunnes og begrenses. Staten studeres både som institusjonsorden og som organisert kapasitet. Demokratiet behandles som mer enn valg: representasjon, deltakelse, offentlighet, rettsstat og politisk likhet må ses i sammenheng. Du lærer samtidig at makt ikke bare er synlig tvang, men også virker gjennom dagsorden, regler, kategorier, ressurser og normaliserte forventninger.',
    learning: ['Forklare forskjellen mellom makt, autoritet, legitimitet og tvang med konkrete institusjonelle eksempler.', 'Analysere demokrati som et system av deltakelse, konkurranse, representasjon, rettigheter og kontroll.', 'Vise hvordan statlig kapasitet og rettslige begrensninger både muliggjør og avgrenser politisk styring.'],
    questions: ['Når blir offentlig makt oppfattet som legitim, og hvem får definere legitimitetskriteriene?', 'Hvordan kan demokratiske institusjoner produsere politisk ulikhet selv når stemmeretten er lik?', 'Hvilke former for makt forsvinner dersom analysen bare ser etter formelle vedtak?'],
    domain_ids: ['demokrati_representasjon_offentlighet', 'komparativ_politikk_regimer_institusjoner', 'rett_lov_rettssikkerhet']
  }),
  learningItem({
    id: 'grunnkurs_institusjoner_prosesser', label: 'Grunnkurs II: institusjoner og politiske prosesser', level: 'grunnkurs',
    description: 'Følg veien fra interesser og mobilisering til valg, beslutning, forvaltning, gjennomføring og ansvarliggjøring.',
    overview: 'Politikk skjer i kjeder der mange aktører påvirker utfallet på ulike tidspunkter. Et problem må først bli synlig og komme på dagsorden. Krav organiseres, representeres og oversettes gjennom partier, valg, forhandlinger og institusjonelle regler. Vedtak må deretter finansieres, tolkes og gjennomføres av organisasjoner og frontlinjeansatte. I dette trinnet lærer du å følge hele prosessen uten å anta at vedtak og faktisk virkning er det samme, eller at ansvaret alltid ligger hos den mest synlige aktøren.',
    learning: ['Spore en politisk sak fra problemdefinisjon og mobilisering til vedtak, implementering og tilbakekobling.', 'Forklare hvordan valgordninger, partisystemer, koalisjoner og vetopunkter former beslutningsmulighetene.', 'Skille formell kompetanse fra faktisk premissmakt, skjønn og gjennomføringskapasitet.'],
    questions: ['Hvor i beslutningskjeden ble de realistiske alternativene avgrenset?', 'Hvordan påvirket institusjonelle regler hvem som kunne delta, blokkere eller omforme forslaget?', 'Hvilke forskjeller oppstod mellom vedtakets mål, gjennomføring og faktiske borgerutfall?'],
    domain_ids: ['valg_partier_velgeratferd', 'styring_institusjoner_forvaltning', 'offentlig_politikk_beslutning_implementering']
  }),
  learningItem({
    id: 'fordypning_fagfelt_og_skala', label: 'Fordypning: fagfelt, problemområder og styringsnivåer', level: 'fordypning',
    description: 'Velg faglig retning og sammenlign hvordan makt og politikk virker på lokale, nasjonale, europeiske og globale nivåer.',
    overview: 'Fordypningen går fra felles grunnlag til systematiske fagfelt: politisk teori, komparativ politikk, politisk atferd, offentlig politikk og administrasjon, internasjonal politikk, politisk økonomi og politisk sosiologi. Samtidig brukes disse retningene på konkrete problemer som ulikhet, velferd, klima, migrasjon, rettssikkerhet og byutvikling. Du lærer å endre analysetrinn uten å miste ansvarskjeden av syne, og å sammenligne institusjoner uten å behandle land, kommuner eller grupper som om de var direkte utskiftbare.',
    learning: ['Velge fagfelt og styringsnivå ut fra problemstillingen, ikke ut fra hvilket datamateriale som tilfeldigvis er tilgjengelig.', 'Sammenligne politiske ordninger med eksplisitte kriterier og kontrollere at begreper og målinger betyr det samme i casene.', 'Koble lokale konsekvenser til nasjonale, samiske, europeiske og internasjonale beslutningskjeder.'],
    questions: ['Hvilket fagfelt gir den sterkeste forklaringen på problemet, og hva overser det?', 'Er sammenligningsenhetene tilstrekkelig like til at forskjeller kan tolkes meningsfullt?', 'På hvilket styringsnivå finnes beslutningsmyndigheten, finansieringen, gjennomføringen og kontrollen?'],
    domain_ids: list(pensum.domains).map((domain) => domain.domain_id)
  }),
  learningItem({
    id: 'selvstendig_analyse', label: 'Selvstendig analyse: forskningsdesign og politisk utredning', level: 'avansert',
    description: 'Formuler et avgrenset spørsmål, velg teori og metode, vurder alternativer og presenter en etterprøvbar konklusjon.',
    overview: 'Det avsluttende trinnet samler fagets teori, empiri og metode i en selvstendig analyse. Du formulerer et spørsmål som kan besvares, bestemmer analyseenhet og tidsrom, velger relevante begreper og forklaringsmekanismer, og bygger et forskningsdesign som synliggjør utvalg og usikkerhet. Alternative forklaringer og normative avveininger behandles eksplisitt. Resultatet skal kunne ettergås av andre: leseren må se hva som er dokumentert, hva som er tolket, hvilke begrensninger som gjelder, og hvor konklusjonen kan generaliseres.',
    learning: ['Utforme en sammenhengende analyse fra problemstilling og begrepsavgrensning til datagrunnlag, metode og konklusjon.', 'Teste alternative forklaringer og drøfte målefeil, utvalgsskjevhet, kausal retning og generaliserbarhet.', 'Presentere empiriske funn og normative avveininger uten å blande dokumentasjon, teori og politisk preferanse.'],
    questions: ['Hvilken observasjon ville svekket den foretrukne forklaringen mest?', 'Hvilke slutninger er gyldige innenfor designet, og hvilke går lenger enn materialet tillater?', 'Hvordan bør usikkerhet og verdiavveininger kommuniseres til en offentlig beslutningstaker?'],
    domain_ids: ['statsvitenskapelig_metode_og_sammenligning']
  })
];

const foundations = [
  learningItem({ id: 'makt_autoritet', label: 'Makt, autoritet og dominans', description: 'Hvordan aktører påvirker handlinger, dagsorden, institusjoner og oppfatninger.', overview: 'Makt kan ligge i synlige beslutninger, i kontroll over hvilke saker som behandles, i fordeling av ressurser og i kategorier som får bestemte ordninger til å framstå naturlige. Autoritet er makt som oppfattes som berettiget innenfor et gyldig regel- eller legitimitetsgrunnlag, mens dominans peker på mer varige asymmetrier. Sporet trener deg i å identifisere mekanismen: Hvem kan gjøre hva, gjennom hvilken ressurs, regel eller avhengighet, og med hvilke konsekvenser for andre aktørers handlingsrom?', learning: ['Identifisere beslutningsmakt, dagsordenmakt, strukturell makt og symbolsk makt i samme case.', 'Skille autoritet fra tvang og forklare hvilket legitimitetsgrunnlag autoriteten bygger på.', 'Analysere hvordan ressurser, avhengighet og institusjonelle posisjoner skaper varig ulik innflytelse.'], questions: ['Hvem kunne holde saken utenfor dagsorden, og med hvilke ressurser?', 'Når går legitim autoritet over i dominans eller vilkårlig makt?', 'Hvordan ville utfallet endret seg dersom den svakere parten hadde reelle exit- eller klagemuligheter?'], domain_ids: ['styring_institusjoner_forvaltning', 'konflikt_makt_sivilsamfunn'] }),
  learningItem({ id: 'stat_institusjon_kapasitet', label: 'Stat, institusjoner og kapasitet', description: 'Hvordan regler, organisasjoner og ressurser gjør kollektiv styring mulig og stiavhengig.', overview: 'Staten er ikke én aktør, men et sett av institusjoner, organisasjoner, kompetansegrenser og ressurser. Institusjoner stabiliserer forventninger og fordeler myndighet, mens statlig kapasitet handler om å innhente kunnskap og ressurser, håndheve regler og levere tjenester. Kapasitet kan ikke leses direkte av organisasjonskartet: den må undersøkes i faktisk koordinering og gjennomføring. Sporet viser også hvordan tidligere valg skaper stiavhengighet, og hvorfor reformer ofte blir omformet av ordninger som allerede finnes.', learning: ['Skille institusjon, organisasjon, organ og konkret bygning fra hverandre.', 'Vurdere statlig kapasitet gjennom informasjon, finansiering, personell, koordinering og gjennomføring.', 'Forklare hvordan kritiske veivalg, tilbakekobling og veto kan gjøre institusjoner stabile eller endre dem.'], questions: ['Hvilke kapasiteter kreves for at den formelle regelen skal få faktisk virkning?', 'Hvilke tidligere institusjonelle valg begrenser dagens alternativer?', 'Er manglende gjennomføring et spørsmål om ressurser, koordinering, motstand eller uklare mål?'], domain_ids: ['komparativ_politikk_regimer_institusjoner', 'styring_institusjoner_forvaltning'] }),
  learningItem({ id: 'demokrati_representasjon', label: 'Demokrati, representasjon og offentlighet', description: 'Hvordan borgere deltar, representeres og kan holde makthavere ansvarlige.', overview: 'Demokrati er både et normativt ideal og en institusjonell orden. Valg er nødvendig i mange demokratimodeller, men utilstrekkelig alene: reell konkurranse, ytrings- og organisasjonsfrihet, tilgang til informasjon, politisk likhet og ansvarliggjøring må undersøkes sammen. Representasjon handler om hvem som autoriseres til å handle på vegne av andre, hvilke interesser og erfaringer som blir til stede, og hvordan krav kan kontrolleres i ettertid. Offentligheten er arenaen der problemer, begrunnelser og motargumenter gjøres synlige.', learning: ['Vurdere demokrati med flere eksplisitte kriterier enn bare om valg avholdes.', 'Skille deskriptiv, substansiell, symbolsk og formell representasjon.', 'Analysere hvordan mediestruktur, organisering og ressursulikhet påvirker offentlig deltakelse.'], questions: ['Hvilke grupper har formell stemme, men svak faktisk påvirkning?', 'Hvordan kan representanter ansvarliggjøres mellom valgene?', 'Når styrker mediert offentlighet demokratisk opplysning, og når forsterker den skjevhet eller polarisering?'], domain_ids: ['demokrati_representasjon_offentlighet', 'valg_partier_velgeratferd'] }),
  learningItem({ id: 'frihet_likhet_rettferdighet', label: 'Frihet, likhet og rettferdighet', description: 'Hvordan politiske ordninger begrunnes gjennom konkurrerende prinsipper og fordelingskriterier.', overview: 'Politiske konflikter handler ofte om hvordan goder, byrder, rettigheter, risiko og anerkjennelse bør fordeles. Frihet kan forstås som fravær av inngrep, reell handleevne eller fravær av dominans. Likhet kan gjelde rettigheter, muligheter, ressurser, status eller utfall. Rettferdighetsanalyse krever derfor mer enn å erklære en verdi: den må vise hvilken enhet som fordeles, mellom hvem, etter hvilket prinsipp og over hvilket tidsrom. Empiriske konsekvenser kan informere avveiningen, men avgjør ikke alene hvilket prinsipp som bør veie tyngst.', learning: ['Skille alternative frihets- og likhetsbegreper og vise hvordan de gir ulike vurderinger av samme tiltak.', 'Identifisere fordelingsenhet, mottakere, prinsipp, tidshorisont og relevante sammenligninger.', 'Koble normative argumenter til dokumenterte konsekvenser uten å gjøre data til en automatisk moralsk konklusjon.'], questions: ['Hvilken type frihet eller likhet er det konkrete tiltaket ment å beskytte?', 'Hvem bærer kostnadene, hvem mottar fordelene, og hvilket fordelingsprinsipp begrunner dette?', 'Hvilke hensyn kan ikke reduseres til samlet nytte eller gjennomsnittlig effekt?'], domain_ids: ['fordeling_velferd_ulikhet', 'rett_lov_rettssikkerhet', 'normer_identitet_hverdagsliv'] }),
  learningItem({ id: 'legitimitet_tillit_kollektiv_handling', label: 'Legitimitet, tillit og kollektiv handling', description: 'Hvorfor mennesker følger, utfordrer eller organiserer seg mot politiske ordninger.', overview: 'Legitimitet viser til begrunnelsen for at makt bør aksepteres, mens tillit er en forventning om hvordan andre aktører eller institusjoner vil handle under usikkerhet. De to må ikke forveksles: en borger kan mene at en institusjon har rett til å fatte beslutninger uten å stole på hvert enkelt utfall. Kollektiv handling analyserer hvorfor mennesker bidrar til felles mål til tross for kostnader, gratispassasjerproblemer og risiko. Organisering, identitet, selektive insentiver, nettverk og politiske mulighetsstrukturer kan gjøre spredt misnøye til varig mobilisering.', learning: ['Skille systemlegitimitet, prosedyretilfredshet, resultattillit og mellommenneskelig tillit.', 'Forklare hvorfor kollektiv handling oppstår eller uteblir ved hjelp av ressurser, nettverk og institusjonelle muligheter.', 'Analysere hvordan polarisering og tillitsbrudd påvirker både styringsevne og demokratisk opposisjon.'], questions: ['Er støtten uttrykk for legitimitet, tillit, vane, avhengighet eller mangel på alternativer?', 'Hvilke mekanismer gjør at enkeltpersoner faktisk bidrar til et kollektivt gode?', 'Når er mistillit et demokratisk korrektiv, og når bryter den ned muligheten for felles beslutninger?'], domain_ids: ['konflikt_makt_sivilsamfunn', 'demokrati_representasjon_offentlighet'] })
];

const disciplinaryFields = [
  learningItem({ id: 'politisk_teori', label: 'Politisk teori', description: 'Normative og begrepslige analyser av makt, frihet, likhet, demokrati, rettferdighet og politisk forpliktelse.', overview: 'Politisk teori spør hvordan politiske institusjoner bør begrunnes, hvilke rettigheter og plikter mennesker har, og hvordan begreper som frihet, likhet og demokrati skal forstås. Fagfeltet er ikke en samling teoretikernavn, men en praksis for å rekonstruere argumenter, avdekke premisser, teste indre sammenheng og sammenligne prinsipper. Empirisk kunnskap er nødvendig for å vite hvilke konsekvenser ordninger har, men den normative vurderingen må også gjøre verdier og avveininger eksplisitte.', learning: ['Rekonstruere et normativt argument med premisser, prinsipp, innvending og konklusjon.', 'Sammenligne alternative begreper om frihet, likhet, demokrati og rettferdighet.', 'Bruke politisk teori på et konkret institusjonelt problem uten å gjøre teoretikernavnet til svaret.'], questions: ['Hvilket normativt prinsipp bærer argumentet, og hvorfor skal det aksepteres?', 'Er uenigheten empirisk, begrepslig eller normativ?', 'Hvilken sterk innvending må argumentet kunne besvare?'], domain_ids: ['demokrati_representasjon_offentlighet', 'rett_lov_rettssikkerhet', 'konflikt_makt_sivilsamfunn', 'normer_identitet_hverdagsliv'] }),
  learningItem({ id: 'komparativ_politikk', label: 'Komparativ politikk', description: 'Systematisk sammenligning av regimer, institusjoner, politiske prosesser og utviklingsforløp.', overview: 'Komparativ politikk undersøker hvorfor politiske systemer er forskjellige, hvordan institusjoner påvirker atferd og utfall, og hvorfor demokratisering, tilbakegang, statsbygging eller reform tar ulike forløp. Sammenligning krever eksplisitt caseutvalg og begrepsekvivalens. Land er ikke naturlige beholdere med én årsak hver; relevante variasjoner kan ligge mellom perioder, regioner, institusjoner eller grupper. Fagfeltet kombinerer dybdekunnskap med design som kan teste alternative forklaringer.', learning: ['Utforme en sammenligning med eksplisitt analyseenhet, utvalgskriterium og forventet variasjon.', 'Forklare hvordan institusjoner, aktører og historiske forløp virker sammen.', 'Vurdere begrepsekvivalens og begrense generalisering til det designet faktisk støtter.'], questions: ['Hvorfor er disse casene informative for akkurat denne forklaringen?', 'Har begrepet samme betydning og måling på tvers av casene?', 'Hvilken alternativ forklaring kan den valgte sammenligningen skille ut?'], domain_ids: ['komparativ_politikk_regimer_institusjoner'] }),
  learningItem({ id: 'politisk_atferd', label: 'Politisk atferd, valg og organisering', description: 'Hvordan borgere, partier, grupper og medier deltar, mobiliserer og påvirker politiske utfall.', overview: 'Fagfeltet undersøker hvem som deltar, hvordan preferanser formes, hvorfor velgere og partier handler som de gjør, og hvilke institusjoner som omsetter handling til makt. Valgresultater kan ikke forstås bare som summen av individuelle meninger: valgsystem, kandidatutvalg, sosial struktur, mobilisering, mediearenaer og strategiske vurderinger påvirker både deltakelse og mandatfordeling. Politisk atferd omfatter også organisasjonsarbeid, protest, lobbyvirksomhet og hverdagslige møter med staten.', learning: ['Analysere politisk deltakelse som mer enn stemmegivning og måle skjevhet mellom grupper.', 'Forklare hvordan valgsystemer og partisystemer former strategier, representasjon og ansvarlighet.', 'Skille holdningsendring, mobilisering, seleksjon og institusjonell omforming som forklaringer på et utfall.'], questions: ['Skyldes endringen nye preferanser, endret deltakelse eller endrede institusjonelle regler?', 'Hvilke borgere og interesser blir systematisk underrepresentert?', 'Hvordan påvirker organisasjoner og medier hvilke alternativer velgerne oppfatter som realistiske?'], domain_ids: ['valg_partier_velgeratferd', 'konflikt_makt_sivilsamfunn'] }),
  learningItem({ id: 'offentlig_administrasjon', label: 'Offentlig administrasjon og styring', description: 'Hvordan politiske mål, regler, ressurser og fagkunnskap blir til organisert offentlig handling.', overview: 'Offentlig administrasjon studerer forholdet mellom politisk ledelse, forvaltning, faglig ekspertise og borger. Fagfeltet undersøker arbeidsdeling, delegasjon, samordning, ansvar, dokumentasjon og skjønn. Byråkrati analyseres ikke bare som treghet, men som en måte å produsere likhet, kontinuitet og kontroll på – samtidig som kategorisering og ressursknapphet kan skape utilsiktede eller skjeve utfall. Formell instruksjonsrett må derfor sammenholdes med faktisk informasjons- og gjennomføringsmakt.', learning: ['Spore ansvar, kompetanse og informasjon gjennom en forvaltningskjede.', 'Analysere forholdet mellom regelbundet likebehandling, faglig skjønn og individuell tilpasning.', 'Vurdere styringskapasitet, samordning og kontroll uten å anta at organisasjonskartet beskriver praksis.'], questions: ['Hvem forbereder saken og kontrollerer informasjonen før den formelle beslutningen?', 'Hvor oppstår skjønn, og hvilke rettslige, faglige eller økonomiske rammer former det?', 'Hvordan kan ansvar plasseres når flere organisasjoner og nivåer deltar i gjennomføringen?'], domain_ids: ['styring_institusjoner_forvaltning', 'norsk_politikk_eos_flernivastyring'] }),
  learningItem({ id: 'offentlig_politikk', label: 'Offentlig politikk og evaluering', description: 'Hvordan problemer blir definert, virkemidler valgt, tiltak gjennomført og resultater vurdert.', overview: 'Offentlig politikk studerer hele forløpet fra problemdefinisjon til tilbakekobling. Dagsorden og mål er politiske prestasjoner, ikke nøytrale utgangspunkter. Virkemidler bygger på forestillinger om årsaker og atferd, og de fordeler samtidig ressurser, rettigheter og byrder. Implementering kan endre tiltaket gjennom organisering og skjønn, mens evaluering må skille måloppnåelse, effekt, fordeling og utilsiktede konsekvenser. Tidligere politikk kan dessuten forme nye interesser og forventninger.', learning: ['Rekonstruere et tiltaks problemforståelse, målgruppe, virkemiddel og forventede mekanisme.', 'Skille implementeringsgrad, måloppnåelse, kausal effekt og fordelingsvirkning.', 'Analysere hvordan policyfeedback endrer ressurser, interesser og senere politiske alternativer.'], questions: ['Hvilken årsaksforståelse er bygget inn i virkemiddelet?', 'Hvordan skiller vi effekten av tiltaket fra andre samtidige endringer?', 'Hvilke grupper får nye ressurser, rettigheter eller kostnader som følge av politikken?'], domain_ids: ['offentlig_politikk_beslutning_implementering', 'fordeling_velferd_ulikhet'] }),
  learningItem({ id: 'internasjonal_politikk', label: 'Internasjonal politikk', description: 'Makt, sikkerhet, samarbeid, institusjoner og grenseoverskridende problemer i et system uten verdensregjering.', overview: 'Internasjonal politikk undersøker hvordan stater, internasjonale organisasjoner, selskaper, bevegelser og andre aktører handler under gjensidig avhengighet og ujevn makt. Sikkerhet kan ikke reduseres til militær styrke; allianser, avskrekking, økonomi, teknologi, folkerett og institusjoner former risiko og handlingsrom. Samarbeid må forklares gjennom interesser, regler, informasjon, troverdighet og innenrikspolitikk. Småstatsperspektivet viser hvordan begrensede ressurser kan kombineres med institusjonell forankring og nisjekapasitet.', learning: ['Sammenligne realistiske, liberale, konstruktivistiske og innenrikspolitiske forklaringer på samme hendelse.', 'Analysere allianser og avskrekking gjennom kapabilitet, troverdighet, signaler og eskaleringsrisiko.', 'Vurdere hvordan internasjonale regler og institusjoner påvirker staters interesser og faktiske handlingsrom.'], questions: ['Hvilken mekanisme gjør maktressursene politisk virksomme i denne situasjonen?', 'Hvordan påvirker usikkerhet og troverdighetsproblemer muligheten for samarbeid?', 'På hvilken måte kobles utenrikspolitikken til innenrikspolitiske interesser og institusjoner?'], domain_ids: ['internasjonal_politikk_sikkerhet_samarbeid'] }),
  learningItem({ id: 'politisk_okonomi_sosiologi', label: 'Politisk økonomi og politisk sosiologi', description: 'Hvordan markeder, klasse, identitet, organisasjoner og statlige ordninger former hverandre.', overview: 'Politisk økonomi undersøker hvordan regler, eierskap, skatt, kreditt, regulering og internasjonale forbindelser skaper markeder og fordeler ressurser. Politisk sosiologi viser hvordan klasse, kjønn, etnisitet, sted, nettverk og organisering påvirker deltakelse, identitet og makt. Samlet bryter feltene med forestillingen om at økonomi og politikk er atskilte sfærer. De spør både hvordan politiske institusjoner former samfunnsstrukturen, og hvordan sosiale konflikter og koalisjoner omformer staten.', learning: ['Analysere markeder som institusjonelt og politisk konstruerte ordninger.', 'Koble sosial struktur og gruppeorganisering til politiske preferanser, deltakelse og representasjon.', 'Forklare hvordan politikk skaper tilbakekoblinger som endrer ressurser, identiteter og framtidige koalisjoner.'], questions: ['Hvilke regler og maktforhold gjør det konkrete markedet mulig?', 'Når blir en sosial forskjell organisert som en politisk konfliktlinje?', 'Hvordan påvirker en reform hvilke grupper som senere kan forsvare eller utfordre ordningen?'], domain_ids: ['politisk_okonomi_stat_marked', 'fordeling_velferd_ulikhet', 'normer_identitet_hverdagsliv'] })
];

const policyCycle = [
  ['problem_dagsorden', 'Problemdefinisjon og dagsorden', 'Hvordan forhold gjøres til offentlige problemer, måles og prioriteres.', 'Et samfunnsforhold blir ikke automatisk en politisk sak. Aktører må navngi problemet, velge indikatorer, plassere ansvar og knytte det til løsningsmuligheter. Problemrammen bestemmer hvilke årsaker og grupper som blir synlige, mens institusjonell oppmerksomhet er begrenset. Analyse av dagsorden undersøker derfor både mobilisering og fravær: hvilke saker når fram, hvilke forblir private eller tekniske, og hvilke alternativer sorteres bort før offentlig debatt.', ['Analysere problemramme, indikatorer, målgruppe og ansvarstildeling.', 'Identifisere aktører og arenaer som åpner eller lukker dagsorden.', 'Skille faktisk endring i problemet fra endret måling og politisk oppmerksomhet.'], ['Hvem definerte problemet og hvilke erfaringer ble utelatt?', 'Hvilke indikatorer gjorde saken styrbar, og hva kunne de ikke vise?', 'Hvorfor nådde denne saken dagsorden på akkurat dette tidspunktet?']],
  ['mobilisering_representasjon', 'Mobilisering og representasjon', 'Hvordan interesser, identiteter og krav organiseres og gjøres politisk virksomme.', 'Mellom erfaring og beslutning ligger organisering. Partier, bevegelser, interessegrupper og nettverk samler krav, velger strategier og forsøker å representere berørte grupper. Mobilisering avhenger av ressurser, rekruttering, identitet, ledelse og politiske muligheter. Representasjon må samtidig granskes kritisk: organisasjoner kan tale på vegne av grupper uten at alle berørte deltar, og ressurssterke interesser har ofte lettere tilgang til beslutningsarenaene.', ['Forklare mobilisering gjennom ressurser, nettverk, identitet og politiske muligheter.', 'Vurdere hvem en aktør hevder å representere og hvordan kravet kan ansvarliggjøres.', 'Sammenligne institusjonelle og utenomparlamentariske strategier.'], ['Hvem blir organisert, hvem faller utenfor, og hvorfor?', 'Hvilke ressurser gjør kravet hørbart i den relevante arenaen?', 'Hvordan kan representasjonskravet kontrolleres av dem det framsettes på vegne av?']],
  ['valg_forhandling_beslutning', 'Valg, forhandling og beslutning', 'Hvordan preferanser omsettes til mandater, koalisjoner, kompromisser og bindende vedtak.', 'Politiske beslutninger er formet av regler for stemmegivning, mandatfordeling, komitéarbeid, forhandling, veto og regjeringsansvar. Flertall er ikke bare et gitt tall; det skapes gjennom hvilke alternativer som settes opp, hvilken rekkefølge de behandles i, og hvilke saker som kobles sammen. Beslutningsanalyse følger derfor både aktørenes preferanser og institusjonenes omforming av dem, og undersøker hvorfor kompromisset ble mulig eller hvorfor saken ble blokkert.', ['Spore preferanser, mandatregler, forhandlinger og vetopunkter fram til beslutningen.', 'Forklare hvordan agenda og avstemningsrekkefølge kan påvirke flertallet.', 'Skille valgløfte, koalisjonskompromiss, formelt vedtak og politisk ansvar.'], ['Hvilke alternativer ble aldri satt opp til reell beslutning?', 'Hvilke aktører hadde veto- eller forhandlingsmakt utover stemmetallet?', 'Hvordan påvirket institusjonelle regler kompromissets innhold?']],
  ['design_virkemidler', 'Politikkutforming og virkemidler', 'Hvordan mål, målgrupper, regler, tjenester, penger og informasjon kobles til forventede mekanismer.', 'Et politisk tiltak er en teori om hvordan offentlig handling skal endre atferd eller betingelser. Regulering, økonomiske insentiver, tjenester, organisering og informasjon virker gjennom forskjellige mekanismer og krever ulike kapasiteter. Designanalyse gjør antakelsene eksplisitte: Hva er målet, hvem skal påvirkes, hvilken mekanisme forventes, hvilke bivirkninger er mulige, og hvordan fordeles kostnader og rettigheter? God analyse skiller ønsket resultat fra instrumentet som er valgt for å oppnå det.', ['Rekonstruere forbindelsen mellom problem, mål, målgruppe, virkemiddel og mekanisme.', 'Vurdere instrumentets kapasitetskrav, fordelingsvirkninger og mulige omgåelser.', 'Sammenligne alternative virkemidler mot eksplisitte kriterier.'], ['Hvorfor forventes dette virkemiddelet å endre det identifiserte problemet?', 'Hvilke aktører kan tilpasse, omgå eller omforme ordningen?', 'Hvordan fordeler designet byrder, rettigheter og risiko mellom grupper?']],
  ['implementering_forvaltning', 'Implementering og forvaltning', 'Hvordan vedtak oversettes gjennom organisasjoner, budsjetter, dokumenter og skjønn.', 'Implementering er ikke en teknisk epilog, men en politisk del av prosessen. Uklare mål, ressursknapphet, samordningsbehov og lokale prioriteringer påvirker hva tiltaket blir i praksis. Frontlinjeansatte må ofte klassifisere saker og bruke skjønn under tidspress, mens borgere møter ordningen gjennom konkrete vedtak, tjenester og klagemuligheter. Implementeringsanalyse sammenligner derfor den vedtatte ordningen med organisatorisk praksis og faktiske utfall.', ['Følge et vedtak gjennom ansvarskjede, finansiering, organisering og frontlinjepraksis.', 'Identifisere hvor skjønn, kapasitet eller samordning endrer tiltakets innhold.', 'Vurdere likebehandling, individuell tilpasning, begrunnelse og klageadgang.'], ['Hvor i gjennomføringskjeden oppstod avviket mellom mål og praksis?', 'Var avviket et resultat av skjønn, ressurser, motstridende mål eller manglende koordinering?', 'Hvordan opplevde ulike borgergrupper tilgang, begrunnelse og mulighet til å klage?']],
  ['evaluering_tilbakekobling', 'Evaluering, læring og tilbakekobling', 'Hvordan måloppnåelse, effekt, fordeling og institusjonell læring undersøkes.', 'Evaluering spør ikke bare om noe skjedde etter tiltaket, men om tiltaket bidro til endringen, for hvem og med hvilke kostnader. Måloppnåelse må skilles fra kausal effekt, gjennomsnitt fra fordelingsvariasjon og kortsiktig resultat fra langsiktig institusjonell endring. Politikk skaper dessuten tilbakekoblinger: ordninger fordeler ressurser, former forventninger og etablerer målgrupper som påvirker senere politikk. Evaluering er derfor både kunnskapsproduksjon og en arena for konflikt om mål og kriterier.', ['Skille prosess, produkt, måloppnåelse, effekt og fordelingsvirkning.', 'Vurdere kontrafaktisk sammenligning, datakvalitet og usikkerhet.', 'Analysere hvordan en ordning endrer senere interesser, ressurser og forventninger.'], ['Hvilken sammenligning gjør effektpåstanden troverdig?', 'Hvem fikk gevinst eller kostnad som gjennomsnittstallet skjuler?', 'Hvordan har ordningen endret de politiske betingelsene for neste reform?']]
].map(([id, label, description, overview, learning, questions]) => learningItem({ id, label, description, overview, learning, questions, domain_ids: ['offentlig_politikk_beslutning_implementering', 'styring_institusjoner_forvaltning'] }));

const methodSpecs = [
  ['begrep_maling', 'Begreper, operasjonalisering og måling', 'Fra teoretisk begrep til indikator, klassifikasjon og måleusikkerhet.', 'Metodemodulen viser hvordan abstrakte fenomener som demokrati, makt, tillit eller ulikhet gjøres observerbare. Operasjonalisering krever en begrunnet forbindelse mellom begrep, dimensjon, indikator og skår. Validitet og reliabilitet må vurderes separat, og måleinvarians er avgjørende når grupper, land eller perioder sammenlignes. Du lærer også å se hvordan kategorier og datainfrastruktur kan skape politiske blindsoner.', ['Utvikle indikatorer fra eksplisitt avgrensede begreper.', 'Vurdere innholdsvaliditet, konstruktvaliditet, reliabilitet og måleekvivalens.', 'Oppdage når endret klassifikasjon eller datainnsamling forveksles med faktisk politisk endring.'], ['Representerer indikatoren hele begrepet eller bare én lett målbar del?', 'Kan skårene sammenlignes på tvers av tid, grupper og institusjoner?', 'Hvilke personer eller erfaringer blir usynlige gjennom kategoriene?'], /begrep|operasjon|indikator|indeks|meningsmåling/i],
  ['sammenligning_caseutvalg', 'Sammenligning og caseutvalg', 'Hvordan case velges og brukes til å beskrive, forklare og avgrense generalisering.', 'Sammenligning er en slutningsstrategi, ikke bare en presentasjon av to land eller institusjoner. Case må velges ut fra hvilken variasjon og hvilken alternativ forklaring designet skal belyse. Mest-like og mest-ulike design, typiske og avvikende case og analyse innen samme case kan gi ulike typer kunnskap. Modulen legger vekt på seleksjonsproblemer, begrepsekvivalens og tydelige grenser for hva resultatet kan generaliseres til.', ['Begrunne caseutvalg ut fra problemstilling og forventet informasjonsverdi.', 'Skille beskrivende sammenligning fra design som tester forklaringer.', 'Vurdere seleksjon, ekvivalens og generaliserbarhet.'], ['Hvilken variasjon gjør akkurat disse casene informative?', 'Er casene valgt på et utfall som forklaringen senere skal forklare?', 'Hvilken populasjon kan funnet med rimelighet si noe om?'], /kompar|case|institusjonsanalyse|regime|flerniv|partisystem|valgsystem/i],
  ['kausalitet_design', 'Kausalitet og forskningsdesign', 'Hvordan årsakspåstander formuleres, alternative forklaringer testes og kontrafaktiske spørsmål håndteres.', 'En årsakspåstand hevder at utfallet ville vært annerledes dersom en relevant faktor hadde vært annerledes. Fordi det kontrafaktiske utfallet ikke kan observeres direkte, må designet etablere en troverdig sammenligning eller en mekanismekjede. Modulen behandler tidsrekkefølge, konfundering, seleksjon, omvendt kausalitet, naturlige og kontrollerte eksperimenter og kvasieksperimentelle strategier. Målet er presis kausal ydmykhet, ikke flest mulig metodeetiketter.', ['Formulere et eksplisitt kontrafaktisk spørsmål og en forventet mekanisme.', 'Identifisere konfundering, seleksjon og omvendt kausalitet.', 'Vurdere om designet støtter effekt, mekanisme eller bare samvariasjon.'], ['Hva er den relevante kontrafaktiske sammenligningen?', 'Hvilken tredje faktor kan skape den observerte sammenhengen?', 'Viser materialet at mekanismen faktisk virket i den forventede rekkefølgen?'], /kausal|effekt|evalu|kontrafakt|eksperiment|forskningsdesign|policyfeedback/i],
  ['kvalitativ_prosess_kilde', 'Kvalitativ analyse, dokumenter og prosessporing', 'Hvordan mening, beslutningsforløp og mekanismer undersøkes i dybden.', 'Kvalitative metoder kan rekonstruere sekvenser, fortolkninger og institusjonell praksis som ikke fanges av en skår alene. Dokumenter må leses som handlinger produsert av bestemte aktører og systemer, ikke som nøytrale vinduer. Intervju, observasjon, diskursanalyse og prosessporing stiller ulike krav til utvalg og belegg. Modulen viser hvordan kildekritikk, triangulering og negative funn brukes til å styrke eller avgrense mekanismepåstander.', ['Vurdere dokumenters opphav, formål, sjanger, seleksjon og institusjonelle plassering.', 'Bygge en prosessforklaring med tidsrekkefølge, mekanismespår og alternative forløp.', 'Triangulere kilder og behandle fravær, taushet og motstridende vitnesbyrd systematisk.'], ['Hvilken institusjonell handling utfører dokumentet, utover å beskrive noe?', 'Hvilke spor forventer vi dersom mekanismen faktisk virket?', 'Hvilke alternative kilder eller fravær kan utfordre fortolkningen?'], /prosess|dokument|diskurs|histor|arkiv|intervju|observasjon|kvalitativ|kilde|innhold/i],
  ['kvantitativ_inferens', 'Kvantitativ analyse og statistisk inferens', 'Hvordan mønstre, forskjeller og usikkerhet analyseres i strukturerte data.', 'Kvantitativ analyse gjør det mulig å beskrive populasjoner, sammenligne grupper og modellere sammenhenger, men resultatet avhenger av måling, utvalg og modellvalg. Modulen skiller deskriptiv fra kausal inferens og viser hvordan usikkerhet kommuniseres med mer enn et terskelstyrt signifikansspråk. Effektstørrelser, prediksjoner, sensitivitetsanalyser og grafisk framstilling må knyttes til det substantielle spørsmålet og datagenereringsprosessen.', ['Beskrive fordelinger, forskjeller og usikkerhet på en substantielt meningsfull måte.', 'Vurdere utvalgsdesign, manglende data, modellforutsetninger og robuste alternativer.', 'Tolke effektstørrelse og prediksjon uten å gjøre korrelasjon til årsak.'], ['Hvordan ble observasjonene valgt inn i datasettet?', 'Hvor stor og politisk relevant er forskjellen, ikke bare hvor presist er den estimert?', 'Hvilke modellvalg eller manglende data kan endre konklusjonen?'], /regresjon|statist|kvant|survey|data|inferens|måling|maling|indeks|demografi/i],
  ['normativ_institusjonell_analyse', 'Normativ og institusjonell analyse', 'Hvordan prinsipper, regler, kompetanse og faktiske konsekvenser vurderes sammen.', 'Politisk analyse trenger både spørsmål om hva institusjoner gjør og om hvordan de bør begrunnes. Normativ analyse rekonstruerer prinsipper og avveininger, mens institusjonell og rettslig analyse følger kompetanse, prosedyrer, kontroll og faktisk praksis. Modulen holder empiriske og normative begrunnelser fra hverandre uten å isolere dem: konsekvenser må dokumenteres, og prinsippene som gjør konsekvensene relevante må forklares. Slik kan rettigheter, legitimitet og styringshensyn drøftes etterprøvbart.', ['Rekonstruere normative premisser og teste argumentets konsistens og rekkevidde.', 'Følge formell kompetanse, prosedyre, kontroll og praksis gjennom en institusjonell kjede.', 'Koble dokumenterte konsekvenser til eksplisitte rettighets- og rettferdighetsprinsipper.'], ['Hvilket prinsipp gjør den empiriske forskjellen normativt relevant?', 'Er maktutøvelsen hjemlet, begrunnet, forholdsmessig og kontrollerbar?', 'Hvilket motstående hensyn er sterkest, og hvordan bør avveiningen begrunnes?'], /normativ|rett|demokrati|makt|legitimitet|representasjon|ideologi|institusjon|forvaltning/i]
];

const unassignedMethods = new Set(methods.map((method) => method.method_id));
const methodFoundation = methodSpecs.map(([id, label, description, overview, learning, questions, matcher]) => {
  const matched = methods.filter((method) => unassignedMethods.has(method.method_id) && matcher.test(`${method.method_id} ${method.title}`));
  for (const method of matched) unassignedMethods.delete(method.method_id);
  return learningItem({ id, label, description, overview, learning, questions, core_method_ids: matched.map((method) => method.method_id) });
});
for (const methodId of unassignedMethods) methodFoundation.at(-1).core_method_ids.push(methodId);
for (const module of methodFoundation) {
  const methodIds = new Set(module.core_method_ids);
  module.entry_emne_ids = emners.filter((emne) => list(emne.method_ids).some((methodId) => methodIds.has(methodId))).map((emne) => emne.emne_id);
  if (module.id === 'begrep_maling') module.entry_emne_ids = unique([...module.entry_emne_ids, 'em_pol_begreper_operasjonalisering']);
  if (module.id === 'kausalitet_design') module.entry_emne_ids = unique([...module.entry_emne_ids, 'em_pol_kausalitet_forskningsdesign']);
  if (module.id === 'sammenligning_caseutvalg') module.entry_emne_ids = unique([...module.entry_emne_ids, 'em_pol_komparativ_metode_caseutvalg']);
  if (module.id === 'kvantitativ_inferens') module.entry_emne_ids = unique([...module.entry_emne_ids, 'em_pol_kvantitativ_inferens_maling']);
  if (module.id === 'kvalitativ_prosess_kilde') module.entry_emne_ids = unique([...module.entry_emne_ids, 'em_pol_kvalitativ_prosessporing_etikk']);
}

const governanceScales = [
  learningItem({ id: 'lokal_kommune', label: 'Lokalt nivå: sted, kommune og bydel', description: 'Nærhet mellom politikk, tjenester, areal, organisering og borgernes hverdagsliv.', overview: 'Lokalt nivå gjør styringskjeder konkrete. Kommuner og bydeler fordeler tjenester, regulerer areal, bygger infrastruktur og møter borgere gjennom skoler, helse, omsorg, planlegging og sosialtjenester. Nærhet betyr ikke automatisk deltakelse eller oversiktlighet; lokalpolitikken preges også av fagadministrasjon, økonomiske rammer, private leverandører og statlige krav. Stedet brukes som inngang, men analysen må følge lovgrunnlag, finansiering og ansvar utover den synlige bygningen.', learning: ['Kartlegge lokal kompetanse, finansiering, organisering og klagemuligheter.', 'Analysere forholdet mellom lokal deltakelse, representasjon og administrativ kapasitet.', 'Koble et konkret sted til overordnede regler og fordelingsvirkninger.'], questions: ['Hvilke deler av utfallet kan kommunen faktisk styre?', 'Hvordan fordeles innflytelse mellom folkevalgte, administrasjon, organisasjoner og utbyggere?', 'Hvilke nabolag eller grupper bærer gevinstene og kostnadene?'], domain_ids: ['styring_institusjoner_forvaltning', 'norsk_politikk_eos_flernivastyring', 'fordeling_velferd_ulikhet'] }),
  learningItem({ id: 'nasjonal_stat', label: 'Nasjonalt nivå: stat, parlament og regjering', description: 'Hvordan lovgivning, budsjett, parlamentarisme og nasjonale institusjoner fordeler myndighet og ansvar.', overview: 'På nasjonalt nivå møtes valg, partisystem, parlamentarisme, lovgivning, budsjett og sentral forvaltning. Analysen følger maktkjeden fra velgere og organisasjoner til Storting, regjering, departement, direktorater og underliggende virksomheter. Nasjonal politikk er samtidig bundet av rettigheter, internasjonale avtaler og lokal gjennomføring. Sporet trener deg i å skille politisk ledelse, konstitusjonell kompetanse, administrativ premissmakt og faktisk leveranse.', learning: ['Følge en beslutning gjennom parlamentarisk, rettslig, budsjettmessig og administrativ kjede.', 'Analysere kontroll og ansvar i mindretallsparlamentarisme og delegert forvaltning.', 'Vurdere hvordan nasjonale regler får ulike lokale og sosiale virkninger.'], questions: ['Hvem har formell kompetanse, og hvem kontrollerer de praktiske premissene?', 'Hvordan påvirker budsjett og delegasjon hva loven kan realisere?', 'Hvilke kontrollmekanismer kan oppdage og korrigere maktmisbruk eller systemsvikt?'], domain_ids: ['norsk_politikk_eos_flernivastyring', 'rett_lov_rettssikkerhet', 'styring_institusjoner_forvaltning'] }),
  learningItem({ id: 'samisk_urfolk_flerniva', label: 'Samisk politikk, urfolksrett og flernivåstyring', description: 'Hvordan representasjon, konsultasjon, selvbestemmelse og ressurskonflikter virker på tvers av styringsnivåer.', overview: 'Samisk politikk kan ikke behandles som et tillegg til en ellers enhetlig nasjonal styringsmodell. Sametinget, konsultasjonsordninger, kommuner, statlige organer, rettigheter og internasjonale urfolksnormer inngår i overlappende myndighets- og representasjonsforhold. Ressurs- og arealsaker viser hvordan formell deltakelse, kunnskapsgrunnlag og faktisk innflytelse kan avvike. Sporet legger vekt på å undersøke rettslig ramme, representasjonskrav, berørte praksiser og hele beslutningskjeden.', learning: ['Skille representasjon, konsultasjon, medbestemmelse og selvbestemmelse.', 'Kartlegge hvordan nasjonale, samiske, lokale og internasjonale normer møtes i samme sak.', 'Vurdere om deltakelsen påvirket problemdefinisjon, alternativer og endelig beslutning.'], questions: ['På hvilket tidspunkt og med hvilket kunnskapsgrunnlag ble berørte samiske interesser involvert?', 'Hvilken forskjell er det mellom å bli hørt og å ha reell innflytelse?', 'Hvordan fordeles myndighet når rettigheter, arealbruk og offentlige mål kolliderer?'], domain_ids: ['norsk_politikk_eos_flernivastyring', 'rett_lov_rettssikkerhet', 'normer_identitet_hverdagsliv'] }),
  learningItem({ id: 'europeisk_eos_eu', label: 'Europeisk nivå: EØS, EU og integrasjon', description: 'Hvordan europeiske regler, institusjoner og forhandlinger inngår i norsk politikk og forvaltning.', overview: 'Europeisk politikk virker gjennom traktater, rettsakter, institusjoner, nettverk, domstoler og nasjonal gjennomføring. For Norge skaper EØS en særskilt kombinasjon av markedsintegrasjon, rettslige forpliktelser og begrenset formell deltakelse i EUs beslutningsorganer. Analyse må følge en regel fra europeisk problem- og beslutningsfase til norsk tilpasning, lovgivning, forvaltning og lokal praksis. Påvirkning, reservasjonsmuligheter og handlingsrom må dokumenteres konkret, ikke beskrives som enten fullt medlemskap eller full nasjonal frihet.', learning: ['Spore europeiske regler fra utvikling og vedtak til norsk innlemmelse og gjennomføring.', 'Skille formell deltakelse, uformell påvirkning, rettslig forpliktelse og nasjonalt handlingsrom.', 'Analysere hvordan europeisering omformer norske institusjoner, aktører og konfliktlinjer.'], questions: ['Når og gjennom hvilken kanal kunne norske aktører påvirke regelutformingen?', 'Hvilke deler av gjennomføringen var rettslig bundet, og hvor fantes politisk skjønn?', 'Hvordan endret regelen ansvar og makt mellom nasjonale og lokale aktører?'], domain_ids: ['norsk_politikk_eos_flernivastyring', 'internasjonal_politikk_sikkerhet_samarbeid'] }),
  learningItem({ id: 'internasjonal_global', label: 'Internasjonalt og globalt nivå', description: 'Sikkerhet, samarbeid, institusjoner, markeder og problemer som krysser statsgrenser.', overview: 'Global politikk omfatter både mellomstatlige relasjoner og grenseoverskridende strømmer av kapital, teknologi, mennesker, informasjon og miljøvirkninger. Myndighet er spredt mellom stater, internasjonale organisasjoner, domstoler, selskaper og nettverk. Sporet undersøker hvordan maktasymmetri, gjensidig avhengighet og institusjonelle regler påvirker samarbeid, sikkerhet og fordeling. Globale problemer må kobles til nasjonal ratifikasjon, finansiering og gjennomføring dersom analysen skal vise faktisk politisk virkning.', learning: ['Kartlegge aktører, kapabiliteter, regler og avhengigheter i en internasjonal sak.', 'Sammenligne sikkerhets-, institusjons-, norm- og innenrikspolitiske forklaringer.', 'Følge internasjonale forpliktelser fram til nasjonal og lokal gjennomføring.'], questions: ['Hvilke maktressurser kan omsettes til faktisk innflytelse i denne institusjonen?', 'Hvorfor er samarbeid mulig eller vanskelig til tross for felles problem?', 'Hvordan fordeles kostnader, risiko og beslutningsmakt mellom stater og grupper?'], domain_ids: ['internasjonal_politikk_sikkerhet_samarbeid', 'politisk_okonomi_stat_marked'] })
];

const appliedTracks = [
  ['okonomi_regulering', 'Økonomi, skatt og regulering', 'Markedsinstitusjoner, skatt, budsjetter, konkurranse, finans og grønn omstilling.', /skatt|budsjett|marked|økonomi|okonomi|regulering|omfordeling|makro|globalisering|grønn omstilling/i],
  ['velferd_ulikhet', 'Velferd, tjenester og ulikhet', 'Hvordan ordninger fordeler inntekt, tjenester, risiko, muligheter og livssjanser.', /velferd|ulikhet|fordeling|levekår|sosialpolitikk|mobilitet/i],
  ['rett_sikkerhet', 'Rett, kontroll og sikkerhet', 'Rettigheter, domstoler, politi, straff, beredskap og begrensning av offentlig makt.', boundedMatcher('rett(?:en|er|igheter?|ighetsvern|slig(?:e)?|sstat(?:en)?|ssikkerhet)?', 'domstol(?:en|er)?', 'politi(?:et)?', 'straff(?:en|er|ing|erettslig)?', 'sikkerhet(?:en|sarbeid|spolitikk)?', 'beredskap(?:en)?', 'maktbegrensning(?:en)?')],
  ['klima_miljo', 'Klima, miljø og naturstyring', 'Kollektiv handling, regulering, fordeling og konflikt om langsiktige miljøproblemer.', /klima|miljø|miljo|grønn|natur/i],
  ['migrasjon_inkludering', 'Migrasjon, minoritet og inkludering', 'Statsborgerskap, grenser, integrering, diskriminering, representasjon og tilhørighet.', /migrasjon|integrering|minoritet|inkludering|ekskludering|statsborgerskap/i],
  ['helse_omsorg_utdanning', 'Helse, omsorg og utdanning', 'Prioritering, profesjoner, tjenestedesign, lik tilgang og sosial mobilitet.', /helse|omsorg|utdanning|familie|tjenester/i],
  ['bolig_by_sted', 'Bolig, by og sted', 'Areal, bolig, infrastruktur, lokaldemokrati og den geografiske fordelingen av makt og ressurser.', /bolig|byutvikling|areal|planlegging|lokaldemokrati|kommune|maktens geografi/i]
].map(([id, label, description, matcher]) => {
  const selected = emners.filter((emne) => matcher.test(`${emne.title} ${emne.definition} ${list(emne.keywords).join(' ')}`));
  const domainIds = unique(selected.map((emne) => emne.domain));
  return learningItem({
    id, label, description,
    overview: `${description} Dette anvendelsessporet bruker de samme statsvitenskapelige kravene som resten av faget: problemet må avgrenses, institusjoner og ansvar identifiseres, mekanismer forklares og fordelingsvirkninger undersøkes. Et politisk standpunkt er ikke en analyse i seg selv. Sporet kombinerer relevante emner, metoder og lærekapitler, og gjør det mulig å følge et konkret sted eller tiltak fra beslutningsgrunnlag til gjennomføring, borgerutfall og politisk tilbakekobling.`,
    learning: [`Avgrense et konkret problem innen ${label.toLocaleLowerCase('nb-NO')} og identifisere relevante aktører, regler og styringsnivåer.`, 'Velge metode etter påstanden og mekanismen, ikke etter hvilket datasett eller sted som er lettest tilgjengelig.', 'Vurdere effekt, fordeling, rettigheter, gjennomføringskapasitet og alternative forklaringer i samme analyse.'],
    questions: [`Hvordan er problemet innen ${label.toLocaleLowerCase('nb-NO')} definert, målt og fordelt mellom grupper?`, 'Hvilken institusjon har myndighet, hvem gjennomfører, og hvor kan ansvaret kontrolleres?', 'Hvilken mekanisme forventes å skape endring, og hvilket belegg kan vise om den faktisk virket?'],
    domain_ids: domainIds,
    entry_emne_ids: selected.map((emne) => emne.emne_id)
  });
});

for (const field of disciplinaryFields) {
  field.entry_emne_ids = unique(field.domain_ids.flatMap((domainId) => list(domainById.get(domainId)?.emne_ids)));
  field.chapter_ids = unique(field.domain_ids.map((domainId) => ({
    styring_institusjoner_forvaltning: 'forvaltning', demokrati_representasjon_offentlighet: 'parlamentarisme',
    rett_lov_rettssikkerhet: 'rett-lov-rettssikkerhet', fordeling_velferd_ulikhet: 'fordeling-velferd-ulikhet',
    konflikt_makt_sivilsamfunn: 'konflikt-makt-sivilsamfunn', normer_identitet_hverdagsliv: 'normer-identitet-hverdagsliv',
    komparativ_politikk_regimer_institusjoner: 'regimer-og-institusjoner', valg_partier_velgeratferd: 'valg-partier-velgeratferd',
    offentlig_politikk_beslutning_implementering: 'offentlig-politikk-beslutning-implementering', internasjonal_politikk_sikkerhet_samarbeid: 'internasjonal-politikk-sikkerhet-samarbeid',
    politisk_okonomi_stat_marked: 'politisk-okonomi-stat-marked', statsvitenskapelig_metode_og_sammenligning: 'statsvitenskapelig-metode-og-sammenligning',
    norsk_politikk_eos_flernivastyring: 'norsk-politikk-eos-eu-flernivastyring'
  }[domainId])).filter(Boolean));
}

function isDirectChapterDirectory(entry) {
  const directory = path.join(FAGVERK, entry);
  return fs.statSync(directory).isDirectory()
    && fs.readdirSync(directory).some((name) => /^0\d.*\.json$/.test(name));
}

function collectChapterConcepts() {
  const definitions = new Map();
  for (const chapterDir of fs.readdirSync(FAGVERK)) {
    const directory = path.join(FAGVERK, chapterDir);
    if (!isDirectChapterDirectory(chapterDir)) continue;
    for (const file of fs.readdirSync(directory).filter((name) => /^0\d.*\.json$/.test(name))) {
      const document = readJson(path.join(directory, file));
      for (const concept of list(document.concepts)) {
        if (concept.term && concept.definition) definitions.set(normalize(concept.term), { definition: words(concept.definition), status: 'editorial_chapter', source: `${chapterDir}/${file}` });
      }
    }
  }
  return definitions;
}

function collectHookDefinitions() {
  const definitions = new Map();
  for (const category of list(fagkart.categories)) for (const hook of list(category.topic_hooks)) {
    if (hook.title && hook.definition) definitions.set(normalize(hook.title), { definition: words(hook.definition), status: 'canonical_hook', source: hook.id });
  }
  return definitions;
}

const exactDefinitions = collectChapterConcepts();
for (const [key, value] of collectHookDefinitions()) if (!exactDefinitions.has(key)) exactDefinitions.set(key, value);
for (const emne of emners) if (!exactDefinitions.has(normalize(emne.title))) exactDefinitions.set(normalize(emne.title), { definition: words(emne.definition), status: 'canonical_emne', source: emne.emne_id });
for (const method of methods) if (!exactDefinitions.has(normalize(method.title))) exactDefinitions.set(normalize(method.title), { definition: words(method.description), status: 'canonical_method', source: method.method_id });

const conceptMentions = new Map();
const fieldRank = { core_concepts: 4, key_concepts: 3, sub_concepts: 2, keywords: 1 };
for (const emne of emners) for (const field of Object.keys(fieldRank)) for (const term of list(emne[field])) {
  const key = normalize(term);
  if (!key) continue;
  if (!conceptMentions.has(key)) conceptMentions.set(key, { label: words(term), fields: new Set(), emneIds: new Set(), rank: 0 });
  const row = conceptMentions.get(key);
  row.fields.add(field);
  row.emneIds.add(emne.emne_id);
  row.rank = Math.max(row.rank, fieldRank[field]);
}

const editorialDefinitionSeeds = new Map(Object.entries({
  'adgangskontroll': 'Adgangskontroll er regler, tekniske ordninger og praktiske handlinger som avgjør hvem eller hva som får passere en fysisk, juridisk eller sosial grense, og på hvilke vilkår.',
  'administrasjon': 'Administrasjon er det organiserte arbeidet med å forberede, iverksette, dokumentere og følge opp beslutninger, vanligvis innenfor fastsatte regler, ansvarslinjer og ressursrammer.',
  'administrativ veiledning': 'Administrativ veiledning er forvaltningens forklaring av hvordan regler, prosedyrer og søknadskrav skal forstås og brukes, uten at veiledningen i seg selv nødvendigvis er et bindende vedtak.',
  'administrativt møte': 'Et administrativt møte er en formalisert samhandling mellom forvaltningen og berørte aktører der opplysninger, ansvar, framdrift eller mulige beslutninger avklares og dokumenteres.',
  'administrativt skjønn': 'Administrativt skjønn er forvaltningens rettslig avgrensede handlingsrom til å vurdere fakta, hensyn eller virkemidler når regler ikke fastsetter ett entydig resultat.',
  'affektiv polarisering': 'Affektiv polarisering er sterk sosial og følelsesmessig avstand mellom politiske grupper, målt gjennom mistillit, motvilje eller negative forestillinger om motpartens medlemmer.',
  'agenda- og premissmakt': 'Agenda- og premissmakt er evnen til å bestemme hvilke saker og alternativer som blir behandlet, og hvilke antakelser, kategorier eller kunnskapskrav beslutningen bygger på.',
  'agenda-setting': 'Agenda-setting er prosessen der enkelte problemer, hendelser og løsninger får politisk eller mediemessig oppmerksomhet, mens andre holdes utenfor den relevante dagsordenen.',
  'aktivering': 'Aktivering er velferdspolitiske krav og tiltak som skal øke mottakeres deltakelse i arbeid, utdanning eller aktivitet, ofte som vilkår for ytelser eller oppfølging.',
  'alternativkostnad': 'Alternativkostnad er verdien av det beste realistiske alternativet som må oppgis når ressurser, tid eller politisk kapasitet brukes på ett bestemt formål.',
  'anerkjennelse': 'Anerkjennelse er sosial og politisk bekreftelse av personers eller gruppers status, erfaringer og rett til å delta som likeverdige, og kan være både symbolsk, rettslig og materiell.',
  'ansvar': 'Ansvar er en begrunnet plikt til å utføre en oppgave, stå til rette for en beslutning eller bære konsekvensene av en handling innenfor en identifiserbar rolle og myndighetskjede.',
  'ansvarlighet': 'Ansvarlighet er ordninger som gjør at makthavere må forklare og begrunne handlinger, kan kontrolleres mot regler og mål, og kan møtes med korreksjon eller sanksjoner.',
  'ansvarsgap': 'Et ansvarsgap oppstår når en beslutning eller skadevirkning kan dokumenteres, men ingen aktør kan holdes effektivt ansvarlig fordi myndighet, oppgaver og kontroll er spredt eller uklart fordelt.',
  'ansvarslinje': 'En ansvarslinje er den sporbare kjeden av delegasjon, rapportering, kontroll og politisk eller administrativt ansvar fra beslutningstaker til gjennomførende ledd.',
  'antagonisme': 'Antagonisme er en konfliktform der partene oppfatter hverandres krav eller identiteter som grunnleggende uforenlige, slik at motparten behandles som en fiende snarere enn en legitim konkurrent.',
  'arkiv': 'Et arkiv er ordnede og bevarte dokumenter skapt gjennom virksomheten til en person eller institusjon; utvalg, klassifikasjon og tilgang påvirker hva som kan dokumenteres og kontrolleres.',
  'autokrati': 'Autokrati er et politisk regime der den øverste makten er konsentrert hos én leder eller en snever gruppe, med svake muligheter for reell konkurranse, maktskifte og uavhengig kontroll.',
  'autonomi': 'Autonomi er evnen og den institusjonelt beskyttede retten til å fastsette egne mål eller valg uten å være underlagt vilkårlig styring fra andre.',
  'autorisasjon': 'Autorisasjon er en formell eller demokratisk handling som gir en aktør rett til å representere, beslutte eller utøve bestemte oppgaver på andres vegne.',
  'autoritet': 'Autoritet er makt som oppfattes eller anerkjennes som berettiget fordi den bygger på gyldige regler, et legitimt mandat eller faglig og sosialt aksepterte begrunnelser.',
  'avhengighet': 'Avhengighet er en relasjon der en aktørs handlingsrom påvirkes av ressurser, beslutninger eller samtykke som kontrolleres av en annen aktør, uten nødvendigvis å være utsatt for direkte tvang.',
  'behov': 'Behov er en dokumentert mangel eller livsbetingelse som brukes som kriterium for prioritering, rettighet eller fordeling; vurderingen av behov krever både målestokk og relevant sammenligning.',
  'behovsprøving': 'Behovsprøving er individuell vurdering av inntekt, ressurser, funksjon eller livssituasjon for å avgjøre om en person oppfyller vilkårene for en ytelse eller tjeneste.',
  'beredskap': 'Beredskap er planlagt kapasitet til å forebygge, håndtere og gjenopprette kritiske funksjoner ved uønskede hendelser, med avklarte roller, ressurser, øvelser og beslutningslinjer.',
  'beskatning': 'Beskatning er offentlig fastsettelse og innkreving av økonomiske bidrag fra personer og virksomheter for å finansiere felles oppgaver, regulere aktivitet eller påvirke fordeling.',
  'beslutning': 'En beslutning er et valg mellom handlingsalternativer som autoriserer eller avgrenser videre handling; politiske beslutninger må skilles fra forberedelse, gjennomføring og faktisk virkning.',
  'bevilgning': 'En bevilgning er et formelt vedtak som gir adgang til å bruke et angitt beløp til et bestemt formål og tidsrom, men sier ikke alene hva som faktisk brukes eller oppnås.',
  'demokrati': 'Demokrati er en politisk orden der borgere kan delta i og konkurrere om offentlig makt under politisk likhet, rettigheter, informasjonsfrihet og ordninger for representasjon og ansvarliggjøring.',
  'domstol': 'En domstol er et uavhengig offentlig organ som avgjør rettstvister og straffesaker gjennom rettslig bindende avgjørelser etter fastsatte prosessregler.',
  'ekskludering': 'Ekskludering er regler eller praksiser som stenger personer eller grupper ute fra medlemskap, arenaer, ressurser, rettigheter eller reell deltakelse.',
  'fordeling': 'Fordeling er mønsteret og prosessen som avgjør hvordan ressurser, byrder, risiko, tjenester, rettigheter eller status tilfaller ulike personer, grupper eller områder.',
  'forvaltning': 'Forvaltning er offentlige organers arbeid med å utrede, iverksette og håndheve lover og politiske vedtak, yte tjenester og treffe avgjørelser overfor borgere og virksomheter.',
  'forskningsdesign': 'Forskningsdesign er den samlede planen som knytter problemstilling, begreper, analyseenheter, utvalg, data og slutningsregler sammen slik at en påstand kan undersøkes etterprøvbart.',
  'identifikasjon': 'Identifikasjon er begrunnelsen for at et observert mønster kan tolkes som virkningen av en bestemt årsak, og ikke som resultat av seleksjon, konfundering eller omvendt kausalitet.',
  'inkludering': 'Inkludering er regler og praksiser som gir personer eller grupper adgang, medlemskap, synlighet, ressurser og reell mulighet til å delta og gjøre krav gjeldende.',
  'kausalitet': 'Kausalitet betyr at en endring i én faktor bidrar til å frambringe en endring i et utfall gjennom en spesifisert mekanisme, sammenlignet med hva som ellers ville ha skjedd.',
  'komparasjon': 'Komparasjon er systematisk sammenligning av enheter, perioder eller prosesser etter felles kriterier for å beskrive variasjon, prøve forklaringer eller avgrense generalisering.',
  'komparativ politikk': 'Komparativ politikk er det statsvitenskapelige fagfeltet som sammenligner regimer, institusjoner, aktører og politiske prosesser for å forklare variasjon mellom land, regioner eller perioder.',
  'kontrafaktisk': 'Et kontrafaktisk uttrykker hva som ville ha skjedd med utfallet dersom den antatte årsaken hadde vært annerledes, mens andre relevante forhold var sammenlignbare.',
  'legitimitet': 'Legitimitet er oppfatningen eller den normative begrunnelsen for at en maktordning har rett til å treffe bindende beslutninger og derfor bør aksepteres innenfor bestemte grenser.',
  'makt': 'Makt er evnen til å påvirke andre aktørers handlinger, alternativer, ressurser eller forståelser, også gjennom dagsorden, institusjoner og strukturelle avhengigheter.',
  'mekanisme': 'En mekanisme er den spesifiserte prosessen eller kjeden av handlinger og betingelser som forklarer hvordan en antatt årsak kan frambringe et bestemt utfall.',
  'normalitet': 'Normalitet er sosialt og institusjonelt etablerte forestillinger om hva som regnes som vanlig, ønskelig eller avvikende, og virker gjennom kategorier, forventninger og sanksjoner.',
  'rettferdighet': 'Rettferdighet er et normativt prinsipp for hvordan rettigheter, muligheter, goder, byrder og anerkjennelse bør fordeles og begrunnes mellom mennesker og grupper.',
  'statistisk inferens': 'Statistisk inferens er bruk av et utvalg og en sannsynlighetsmodell til å trekke usikre slutninger om en større populasjon, en parameter eller et mønster som ikke observeres fullt ut.',
  'statsborgerskap': 'Statsborgerskap er det formelle medlemskapet i en stat og gir et bestemt sett av rettigheter, plikter og politiske tilknytninger, men er ikke det samme som sosial tilhørighet.',
  'styring': 'Styring er målrettet påvirkning av kollektiv handling gjennom regler, ressurser, organisering, kunnskap og koordinering, både i og utenfor formelle myndighetshierarkier.'
}));

for (const [term, definition] of Object.entries({
  'anti-etablissement': 'Anti-etablissement er en politisk orientering som framstiller etablerte eliter og institusjoner som fjerne, selvbeskyttende eller illegitime, og mobiliserer mot deres autoritet.',
  'arealformål': 'Arealformål er den rettslige kategorien i en plan som angir hvilken hovedbruk et område kan ha, og som dermed avgrenser senere tillatelser og utbyggingsvalg.',
  'automatisk støtte': 'Automatisk støtte er forventningen om å slutte opp om en alliert eller politisk partner uten en ny, selvstendig vurdering av den konkrete saken, kostnaden og risikoen.',
  'avstand': 'Avstand er geografisk, sosial eller institusjonell separasjon mellom aktører og beslutningsarenaer, og kan påvirke tilgang, kunnskap, representasjon og kontroll.',
  'boligtilbud': 'Boligtilbud er mengden og sammensetningen av boliger som faktisk er tilgjengelige i et område og prissjikt, formet av bygging, regulering, omsetning og bruk.',
  'borger-relasjoner': 'Borger-relasjoner er de gjensidige rettighetene, pliktene, møtene og forventningene som oppstår mellom offentlige myndigheter og personer som berøres av deres handlinger.',
  'bydelsdemokrati': 'Bydelsdemokrati er ordninger for lokal representasjon, deltakelse og ansvarliggjøring under kommunenivået, knyttet til et avgrenset geografisk område og delegerte oppgaver.',
  'byråd': 'Et byråd er kommunens utøvende politiske ledelse i en parlamentarisk styringsmodell og står ansvarlig overfor et flertall i bystyret.',
  'bystyre': 'Et bystyre er det øverste folkevalgte organet i en bykommune og vedtar blant annet budsjett, planer, lokale regler og overordnede politiske mål.',
  'bærekraft': 'Bærekraft er evnen til å dekke dagens behov uten å undergrave økologiske, sosiale og økonomiske forutsetninger for framtidige generasjoner og andre berørte grupper.',
  'checks and balances': 'Checks and balances er et institusjonelt system der offentlige maktorganer har adskilte fullmakter og gjensidige kontrollmidler som skal hindre maktkonsentrasjon og misbruk.',
  'competitive authoritarianism': 'Competitive authoritarianism er et regime der valg og formell opposisjon finnes, men der makthaverne systematisk skjevfordeler ressurser, medier, rettsapparat eller valgvilkår.',
  'credential': 'En credential er et formelt dokumentert kvalifikasjons- eller statusbevis som gir adgang til bestemte roller, tjenester eller rettigheter og samtidig kan fungere som portvakt.',
  'demografi': 'Demografi er studiet av befolkningers størrelse, sammensetning og endring gjennom fødsler, dødsfall og migrasjon, og gir grunnlag for politisk planlegging og fordeling.',
  'diaspora': 'En diaspora er en befolkning spredt utenfor et historisk eller forestilt hjemland som opprettholder sosiale, kulturelle eller politiske forbindelser på tvers av statsgrenser.',
  'diplomati': 'Diplomati er staters og andre internasjonale aktørers organiserte kommunikasjon, forhandling og representasjon for å håndtere interesser, konflikter og samarbeid uten direkte maktbruk.',
  'ekspertise': 'Ekspertise er spesialisert og erfaringsbasert kunnskap som gir faglig autoritet på et avgrenset område, men som ikke i seg selv gir demokratisk mandat til å bestemme.',
  'eliteanklage': 'En eliteanklage er en politisk påstand om at en avgrenset maktgruppe handler i egen interesse eller i strid med folkelig kontroll, og må underbygges med identifiserte aktører og mekanismer.',
  'estimat': 'Et estimat er en beregnet verdi for en ukjent størrelse basert på data og en uttrykt metode, og skal ledsages av usikkerhet, forutsetninger og relevant måleenhet.',
  'executive aggrandizement': 'Executive aggrandizement er gradvis utvidelse av den utøvende maktens handlingsrom gjennom formelt vedtatte endringer som svekker kontroll, konkurranse eller andre institusjoner.',
  'eøs-relevans': 'EØS-relevans er vurderingen av om en EU-rettsakt faller innenfor EØS-avtalens saklige og geografiske virkeområde og derfor kan bli aktuell for innlemmelse.',
  'fagkompetanse': 'Fagkompetanse er dokumentert kunnskap og ferdighet på et avgrenset område som gjør en aktør i stand til å utrede, vurdere eller gjennomføre oppgaver med faglig forsvarlighet.',
  'fast mandatperiode': 'En fast mandatperiode er en på forhånd bestemt funksjonstid som normalt ikke kan avsluttes gjennom ordinær politisk mistillit før perioden utløper.',
  'forbud': 'Et forbud er en bindende regel som pålegger en identifisert adressat å avstå fra en bestemt handling, vanligvis med vilkår for håndheving, unntak og reaksjon ved brudd.',
  'forskningsetikk': 'Forskningsetikk er normer for ansvarlig kunnskapsproduksjon, blant annet informert samtykke, skadebegrensning, personvern, redelighet, uavhengighet og åpenhet om usikkerhet.',
  'grønt demokrati': 'Grønt demokrati er teorier og institusjoner som utvider demokratisk deltakelse og ansvar til langsiktige miljøvirkninger, framtidige generasjoner og naturinteresser.',
  'historie': 'Historie er systematisk undersøkelse og fortolkning av menneskelig forandring over tid ved hjelp av kildekritisk vurderte spor, kontekst og konkurrerende forklaringer.',
  'historisk skillelinje': 'En historisk skillelinje er en varig politisk konflikt som har røtter i tidligere samfunnsendringer, organiserer grupper og fortsatt påvirker partier, identitet eller stemmegivning.',
  'hverdagsliv': 'Hverdagsliv er menneskers gjentatte praksiser, møter og erfaringer i dagliglivet, der regler, tjenester, normer og makt får konkrete og ofte ulikt fordelte virkninger.',
  'ikke-bruk': 'Ikke-bruk er bevisst avståelse fra et tilgjengelig politisk, rettslig eller organisatorisk virkemiddel, og må skilles fra manglende kunnskap, kapasitet eller adgang.',
  'ikke-vold': 'Ikke-vold er politisk handling som avstår fra fysisk vold og søker påvirkning gjennom blant annet protest, sivil ulydighet, boikott, streik eller moralsk appell.',
  'informasjonsasymmetri': 'Informasjonsasymmetri er en situasjon der relevante aktører har systematisk ulik tilgang til kunnskap om valg, kvalitet, risiko eller handlinger, noe som kan skape makt og kontrollproblemer.',
  'informasjonsfordel': 'En informasjonsfordel er en aktørs bedre eller tidligere tilgang til relevant kunnskap som kan omsettes i strategisk innflytelse over beslutninger, forhandlinger eller kontroll.',
  'innsiderstrategi': 'En innsiderstrategi er politisk påvirkning gjennom etablert og ofte varig tilgang til beslutningstakere, høringer, råd eller forhandlinger, framfor offentlig press utenfra.',
  'insentiv': 'Et insentiv er en forventet belønning, kostnad eller regelvirkning som endrer fordelene ved alternative handlinger, uten å avgjøre at aktører faktisk vil reagere likt.',
  'institusjoner': 'Institusjoner er relativt stabile formelle og uformelle regler som fordeler roller, myndighet og forventninger og dermed strukturerer politiske aktørers handlingsmuligheter.',
  'institusjonskritikk': 'Institusjonskritikk er systematisk vurdering av hvordan regler og organisasjoner fordeler makt, adgang og ansvar, og om de oppfyller uttalte demokratiske, rettslige eller sosiale formål.',
  'interesser': 'Interesser er goder, mål eller posisjoner en aktør søker å beskytte eller fremme; de må undersøkes empirisk og kan ikke uten videre utledes av identitet eller gruppetilhørighet.',
  'intervju': 'Et intervju er en planlagt samtale brukt som datakilde, der spørsmål, utvalg, relasjon, hukommelse og situasjon påvirker hvilke utsagn som blir produsert og hvordan de kan tolkes.',
  'judicial review': 'Judicial review er domstolers prøving av om lover eller offentlige handlinger er forenlige med overordnede rettsregler, og kan føre til tilsidesettelse eller korrigering.',
  'kabinettspørsmål': 'Et kabinettspørsmål er når en regjering knytter sin fortsatte stilling til utfallet av en bestemt avstemning og varsler avgang dersom den taper.',
  'kamp': 'Kamp er vedvarende kollektiv konflikt om makt, ressurser, rettigheter eller anerkjennelse, ført gjennom identifiserbare strategier og arenaer over tid.',
  'kampanje': 'En kampanje er en tidsavgrenset og koordinert serie kommunikative eller organisatoriske tiltak som skal påvirke oppmerksomhet, holdninger, deltakelse eller beslutninger.',
  'kapitalformer': 'Kapitalformer er ulike ressurser som kan gi sosial og politisk innflytelse, som økonomisk, kulturell, sosial og symbolsk kapital, og kan omsettes mellom arenaer.',
  'kategoriport': 'En kategoriport er et klassifikasjonskrav som må oppfylles for å få status, rettighet eller tilgang, og som derfor gjør administrative kategorier til reelle adgangsgrenser.',
  'kildekritikk': 'Kildekritikk er systematisk vurdering av en kildes opphav, formål, sjanger, nærhet, utvalg og avhengighet for å avgjøre hvilke påstander den kan og ikke kan støtte.',
  'kjonn og samfunn': 'Kjønn og samfunn viser til hvordan kjønnsinndelinger formes av og virker gjennom institusjoner, arbeid, familie, rettigheter, normer og fordeling av makt og ressurser.',
  'kjønn': 'Kjønn er en kroppslig, juridisk og sosial kategorisering som organiserer identitet, forventninger, rettigheter og arbeidsdeling, og som varierer historisk og institusjonelt.',
  'kritikk': 'Kritikk er en begrunnet prøving av påstander, institusjoner eller handlinger mot uttrykte kunnskapskrav eller normative standarder, med mulighet for innvending og revisjon.',
  'klage': 'En klage er en formalisert anmodning om at en avgjørelse eller handling blir vurdert på nytt av et kompetent organ etter bestemte frister og saksbehandlingsregler.',
  'klasse': 'Klasse er en sosial posisjon knyttet til økonomiske ressurser, yrke, eierskap og markedsrelasjoner som påvirker livssjanser, interesser og politisk organisering.',
  'klima': 'Klima er langsiktige mønstre i temperatur, nedbør og andre værforhold; klimapolitikk gjelder hvordan årsaker, risiko, tiltak og kostnader styres og fordeles.',
  'koalisjonsstrategi': 'Koalisjonsstrategi er en aktørs plan for å bygge, bevare eller endre et flertall gjennom valg av samarbeidspartnere, saksavtaler, verv og politiske kompromisser.',
  'kollektiv': 'Et kollektiv er en gruppe som handler, organiseres eller behandles som en felles enhet, og krever avklaring av medlemskap, representasjon og beslutningsregler.',
  'kollektivt minne': 'Kollektivt minne er sosialt organiserte fortolkninger av fortiden som vedlikeholdes gjennom ritualer, fortellinger, steder og institusjoner og former nåtidig identitet og konflikt.',
  'konfliktlinjer': 'Konfliktlinjer er varige akser av politisk uenighet som knytter sosiale grupper, interesser og identiteter til organisasjoner, partier og konkurrerende politiske programmer.',
  'kongruens': 'Kongruens er graden av samsvar mellom to nivåer eller størrelser, for eksempel borgernes preferanser og representantenes standpunkter, målt etter uttrykte kriterier.',
  'konkurranse': 'Konkurranse er en ordnet rivalisering mellom aktører om knappe posisjoner, ressurser eller støtte, regulert av regler som påvirker adgang, strategi og mulig utfall.',
  'konstitusjonell frist': 'En konstitusjonell frist er en tidsgrense fastsatt i grunnlov eller annen overordnet regel for at et offentlig organ skal handle, svare eller avslutte en prosess.',
  'kontroll over saksflyt': 'Kontroll over saksflyt er evnen til å bestemme rekkefølge, tempo, informasjonsgrunnlag og videre behandling i en beslutningsprosess, og kan gi betydelig premissmakt.',
  'kontrollmekanismer': 'Kontrollmekanismer er formelle eller uformelle ordninger som overvåker maktutøvelse, avdekker avvik og muliggjør begrunnelse, korreksjon eller sanksjon.'
})) editorialDefinitionSeeds.set(term, definition);

for (const [term, definition] of Object.entries({
  'ritual': 'Et ritual er en gjentatt og symbolsk strukturert handling som uttrykker tilhørighet, autoritet eller kollektivt minne og får politisk betydning gjennom deltakelse og offentlig fortolkning.',
  'sak-til-sak-støtte': 'Sak-til-sak-støtte er parlamentarisk samarbeid der et parti vurderer og forhandler hvert forslag separat uten å love regjeringen varig støtte i alle saker.',
  'samfunn': 'Samfunn er et historisk avgrenset mønster av mennesker, institusjoner, relasjoner og felles ordninger; begrepet må presiseres geografisk, sosialt og tidsmessig i analyse.',
  'sekvens': 'En sekvens er en tidsordnet rekke hendelser eller handlinger der rekkefølgen kan være avgjørende for hvilke alternativer, mekanismer og utfall som blir mulige.',
  'sensur': 'Sensur er kontroll som hindrer, endrer eller straffer offentliggjøring av informasjon og ytringer før eller etter publisering, utøvd gjennom rettslige, økonomiske eller tekniske midler.',
  'sentralbank': 'En sentralbank er den offentlige institusjonen som utsteder valuta og forvalter pengepolitikk og finansiell stabilitet innenfor et lovbestemt mandat og bestemte ansvarslinjer.',
  'sentrum–periferi': 'Sentrum–periferi er en konflikt- og avhengighetsrelasjon mellom makt- og ressurskonsentrerte sentre og geografiske eller sosiale områder med svakere adgang og kontroll.',
  'signal': 'Et signal er en observerbar handling eller ytring som skal formidle informasjon om en aktørs hensikt, kapasitet eller troverdighet under usikkerhet.',
  'skadeprinsipp': 'Skadeprinsippet er den normative påstanden at tvang mot en person først og fremst kan begrunnes for å hindre skade på andre, ikke bare for personens eget beste.',
  'skatt': 'Skatt er en lovpålagt betaling til det offentlige uten direkte individuell motytelse, brukt til finansiering, omfordeling og påvirkning av økonomisk atferd.',
  'skyld': 'Skyld er rettslig eller moralsk ansvar for en handling eller unnlatelse og krever et grunnlag som knytter aktør, normbrudd, kontroll og eventuell intensjon sammen.',
  'småstatsstrategi': 'Småstatsstrategi er hvordan en stat med begrensede materielle ressurser søker sikkerhet og innflytelse gjennom allianser, institusjoner, regler, nisjekompetanse og omdømme.',
  'sosial': 'Sosial beskriver relasjoner, grupper, institusjoner og praksiser mellom mennesker; i politisk analyse må den konkrete mekanismen og analyseenheten alltid spesifiseres.',
  'spørsmål': 'Et spørsmål er en formulert kunnskaps- eller beslutningsoppgave som avgrenser hva som skal undersøkes, hvilke alternativer som er relevante og hva som kan telle som svar.',
  'status quo': 'Status quo er den eksisterende ordningen eller tilstanden som fungerer som sammenligningspunkt og ofte har institusjonelle fordeler fordi endring krever vedtak eller samordning.',
  'straff': 'Straff er et offentlig påført onde som reaksjon på et fastslått lovbrudd etter bestemte skyld-, prosess- og forholdsmessighetskrav.',
  'strategi': 'En strategi er en samordnet plan for å nå et mål under begrensede ressurser, usikkerhet og forventede motreaksjoner fra andre aktører.',
  'strategisk stemme': 'En strategisk stemme er et valg der velgeren støtter et annet alternativ enn førstevalget for å påvirke hvilket realistisk utfall valgsystemet produserer.',
  'streik': 'Streik er en kollektiv og midlertidig arbeidsstans initiert av arbeidstakere for å legge press i en konflikt om lønn, vilkår, rettigheter eller politiske krav.',
  'strukturell': 'Strukturell beskriver virkninger som følger av varige regler, ressursfordelinger og posisjoner i et system, ikke bare av én aktørs synlige intensjon eller handling.',
  'strukturell skade': 'Strukturell skade er systematisk belastning som oppstår gjennom institusjoner, markeder eller fordelingsmønstre og kan vedvare uten én identifiserbar skadevolder.',
  'styringsorganer': 'Styringsorganer er formelt etablerte kollektive eller administrative enheter som har myndighet til å vedta, lede, kontrollere eller samordne en virksomhet.',
  'symbolsk': 'Symbolsk beskriver hvordan tegn, språk, steder og ritualer skaper mening, status og legitimitet og dermed kan påvirke politisk tilhørighet og makt.',
  'symbolsk sentrum': 'Et symbolsk sentrum er et sted eller en institusjon som framstilles som kollektivets representative kjerne og samler ritualer, fortellinger og autoritetskrav.',
  'symmetri': 'Symmetri er et forhold der aktører, enheter eller målestokker er like plassert etter relevante kriterier; påstanden må angi nøyaktig hvilken dimensjon likheten gjelder.',
  'systemnivå': 'Systemnivå er analysetrinnet der forklaringen gjelder mønstre og relasjoner i en hel institusjonsorden eller internasjonal struktur, ikke enkeltaktørers egenskaper alene.',
  'teknologi': 'Teknologi er organiserte redskaper, kunnskap og infrastrukturer som muliggjør og avgrenser handling; politisk virkning følger av design, eierskap, tilgang og regulering.',
  'territorium': 'Territorium er et geografisk område som en politisk myndighet gjør krav på å styre, kontrollere eller representere gjennom grenser, regler og institusjoner.',
  'tilbakegang': 'Tilbakegang er dokumentert svekkelse over tid etter uttrykte kriterier, for eksempel i demokratisk konkurranse, rettsvern eller institusjonell kapasitet.',
  'tillitstap': 'Tillitstap er en målbar svekkelse i forventningen om at en aktør eller institusjon vil handle kompetent, forutsigbart eller i tråd med aksepterte normer.',
  'tillitsvotum': 'Et tillitsvotum er en parlamentarisk avstemning om hvorvidt regjeringen fortsatt har kammerets støtte til å sitte eller føre en bestemt politikk.',
  'tjeneste': 'En tjeneste er en organisert ytelse som skal dekke et definert behov eller en rettighet og må vurderes gjennom adgang, kvalitet, kapasitet, skjønn og faktisk resultat.',
  'transnasjonal': 'Transnasjonal beskriver aktører, relasjoner eller prosesser som krysser statsgrenser uten å være begrenset til formelle forbindelser mellom regjeringer.',
  'tv': 'TV er et audiovisuelt massemedium og en politisk offentlighetsarena der redaksjonelt utvalg, format, bilder og sendetid former synlighet og fortolkning.',
  'tvangsmiddel': 'Et tvangsmiddel er et lovregulert inngrep myndighetene kan bruke for å sikre etterforskning, orden eller gjennomføring, under krav om hjemmel, nødvendighet og forholdsmessighet.',
  'utnyttelsesgrad': 'Utnyttelsesgrad er forholdet mellom faktisk bruk og tilgjengelig eller tillatt kapasitet, målt med en uttrykt enhet og et relevant tidsrom.',
  'valgkonkurranse': 'Valgkonkurranse er reell rivalisering mellom kandidater eller partier om stemmer og makt under regler som tillater opposisjon, informasjon og usikkert utfall.',
  'valgkrets': 'En valgkrets er et geografisk eller annet avgrenset område der stemmer telles og representanter velges, og påvirker koblingen mellom befolkning og mandater.',
  'valgseier': 'Valgseier er et resultat der et parti eller en kandidat oppnår den relevante terskelen for flest stemmer, mandater eller verv etter valgsystemets regler.',
  'vetospillere': 'Vetospillere er individuelle eller kollektive aktører hvis samtykke er nødvendig for å endre status quo, enten gjennom formelle regler eller stabil politisk praksis.',
  'vold': 'Vold er tilsiktet bruk eller trussel om fysisk makt som kan skade personer eller ødelegge materielle vilkår, og må skilles fra andre former for tvang og strukturert skade.',
  'winset': 'Et winset er mengden avtaler eller alternativer som kan få nødvendig støtte hos en aktør eller ratifiserende gruppe, gitt deres preferanser, institusjoner og innenrikspolitiske begrensninger.',
  'ytelsesvilkår': 'Et ytelsesvilkår er et rettslig eller administrativt krav som må være oppfylt for å få eller beholde en offentlig ytelse, og skal kunne begrunnes og prøves.',
  'økologiske grenser': 'Økologiske grenser er terskler for naturens tåleevne og regenerasjon som avgrenser hvor stor belastning menneskelig aktivitet kan påføre uten alvorlig systemendring.',
  'økonomisk demokrati': 'Økonomisk demokrati er ordninger som gir arbeidstakere, borgere eller lokalsamfunn reell medbestemmelse over eierskap, investeringer, produksjon og fordeling.'
})) editorialDefinitionSeeds.set(term, definition);

for (const [term, definition] of Object.entries({
  'beslutningseffektivitet': 'Beslutningseffektivitet er en institusjons evne til å treffe rettidige og gjennomførbare vedtak når et problem krever handling, uten at tempo alene sier noe om demokratisk eller faglig kvalitet.',
  'dekommodifisering': 'Dekommodifisering er graden av mulighet til å opprettholde et sosialt akseptabelt liv uten å selge arbeidskraft i markedet, vanligvis gjennom rettigheter og velferdsytelser.',
  'demonstrasjon': 'En demonstrasjon er en offentlig og kollektiv markering der deltakere bruker fysisk eller digital synlighet, samling, marsj og symboler til å uttrykke krav eller motstand.',
  'eu-medlemskap': 'EU-medlemskap er en stats fulle traktatbaserte deltakelse i Den europeiske union, med representasjon i institusjonene, plikt til å følge EU-retten og del i unionens beslutninger.',
  'hierarki': 'Et hierarki er en ordning av over- og underordnede posisjoner der myndighet, instruksjon, rapportering og ansvar er fordelt mellom nivåer.',
  'identitetsaggregering': 'Identitetsaggregering er prosessen der ulike erfaringer og gruppetilhørigheter samles i en bredere politisk identitet som kan bære felles krav, representasjon eller mobilisering.',
  'kapabilitet': 'Kapabilitet er en persons reelle mulighet til å være og gjøre det hun eller han har grunn til å verdsette, ikke bare formell rett eller tilgang til en ressurs.',
  'koalisjonsdannelse': 'Koalisjonsdannelse er prosessen der partier eller andre aktører forhandler fram et samarbeid som kan oppnå nødvendig flertall, med avtaler om politikk, verv og ansvar.',
  'kontroll og mistillit': 'Kontroll og mistillit viser til parlamentariske ordninger som undersøker regjeringens handlinger og kan trekke tilbake det politiske grunnlaget for at den sitter.',
  'kulturell kapital': 'Kulturell kapital er kunnskap, språk, utdanning, smak og væremåter som verdsettes i bestemte institusjoner og kan omsettes i status, adgang og innflytelse.',
  'mindretallsregjering': 'En mindretallsregjering er en regjering som ikke kontrollerer et flertall av mandatene i parlamentet og derfor må skaffe støtte fra andre partier for vedtak og fortsatt tillit.',
  'normativ analyse': 'Normativ analyse undersøker hvordan politiske ordninger bør være ved å klargjøre verdier, prinsipper, premisser, rekkevidde, motargumenter og avveininger mellom legitime hensyn.',
  'positiv forpliktelse': 'En positiv forpliktelse er en plikt til aktivt å beskytte eller oppfylle en rettighet, ikke bare til å avstå fra inngrep.',
  'proporsjonalitet': 'Proporsjonalitet er kravet om et rimelig forhold mellom tiltakets formål, inngrepets styrke, nødvendigheten og belastningen for berørte rettigheter eller interesser.',
  'rammeoverføring': 'Rammeoverføring er en ikke-øremerket statlig overføring som kommunen kan fordele mellom oppgaver innenfor lovpålagte krav og lokale prioriteringer.',
  'representativ skjevhet': 'Representativ skjevhet er et systematisk avvik mellom gruppene eller erfaringene i en befolkning og dem som blir valgt, hørt eller får politisk respons.',
  'rettferdig omstilling': 'Rettferdig omstilling er en overgang til et mer miljømessig bærekraftig samfunn der arbeid, kostnader, risiko og nye muligheter fordeles på en sosialt begrunnet måte.',
  'rettspraksis': 'Rettspraksis er mønsteret av domstolsavgjørelser som viser hvordan rettsregler tolkes og anvendes, og som kan få styrende betydning for senere saker.',
  'samvittighet': 'Samvittighet er en persons egen moralske vurdering av hva som er rett eller galt, og kan begrunne motstand, men fritar ikke automatisk fra rettslig eller demokratisk ansvar.',
  'sosial reproduksjon': 'Sosial reproduksjon er prosesser som overfører klasseposisjon, ressurser, normer og ulikhet mellom generasjoner og gjennom institusjoner som familie, skole og arbeidsliv.',
  'tillatelse': 'En tillatelse er et offentlig vedtak som gir adgang til en ellers regulert handling når fastsatte vilkår er oppfylt, og kan inneholde betingelser, tidsgrenser og kontroll.',
  'verdihierarki': 'Et verdihierarki er en rangering av prinsipper eller hensyn som angir hvilke verdier som skal veie tyngst når de ikke kan oppfylles samtidig.'
})) editorialDefinitionSeeds.set(term, definition);

for (const [term, definition] of Object.entries({
  'kumulativ ulempe': 'Kumulativ ulempe er en prosess der tidlige forskjeller eller belastninger øker sannsynligheten for nye ulemper, slik at ulikhet forsterkes på tvers av livsfaser eller institusjoner.',
  'kunnskapsasymmetri': 'Kunnskapsasymmetri er systematisk ulik fordeling av relevant ekspertise eller erfaringskunnskap mellom aktører, noe som påvirker hvem som kan definere problemer og kontrollere beslutningsgrunnlaget.',
  'kutt': 'Et kutt er en reduksjon i en bevilgning, ressursramme, tjeneste eller aktivitet sammenlignet med et uttrykt utgangspunkt; nominell endring må skilles fra reell kapasitet.',
  'legalitetsprinsipp': 'Legalitetsprinsippet krever at offentlige inngrep overfor borgerne har hjemmel i lov, særlig når myndigheten pålegger plikter, begrenser frihet eller bruker tvang.',
  'legitim tvang': 'Legitim tvang er maktbruk som kan forsvares gjennom gyldig hjemmel, et berettiget formål, nødvendig og forholdsmessig gjennomføring og reell mulighet for kontroll.',
  'legitimitetspress': 'Legitimitetspress oppstår når en institusjons begrunnelse, prosedyrer eller resultater utfordres slik at aksepten av dens rett til å utøve makt svekkes.',
  'lik sats': 'Lik sats er et fordelingsprinsipp der alle relevante enheter mottar eller betaler samme beløp eller prosent, uten justering for behov, kostnad eller kapasitet.',
  'live-intervjuer': 'Live-intervjuer er uredigerte eller direktesendte samtaler der spørsmål, tidspress og umiddelbar respons blir del av den politiske kommunikasjonen og begrenser etterkontroll.',
  'livssjanser': 'Livssjanser er sannsynligheten for å få tilgang til utdanning, arbeid, inntekt, helse, bolig og innflytelse, formet av sosial posisjon og institusjonelle vilkår.',
  'lockout': 'Lockout er en arbeidskamphandling der en arbeidsgiver eller arbeidsgiverorganisasjon stenger arbeidstakere ute fra arbeidet for å legge press i en kollektiv konflikt.',
  'lokalt skjønn': 'Lokalt skjønn er handlingsrommet lokale myndigheter eller tjenesteutøvere har til å tilpasse beslutninger til stedlige forhold innenfor nasjonale regler og mål.',
  'lovpålegg': 'Et lovpålegg er en plikt som følger direkte av lov og binder den identifiserte adressaten, med nærmere vilkår for oppfyllelse, kontroll og eventuell reaksjon.',
  'lovreform': 'En lovreform er en planlagt endring av rettsregler og tilhørende institusjoner for å endre rettigheter, plikter, kompetanse eller praksis på et område.',
  'maktbalanse': 'Maktbalanse er et forhold der ingen aktør enkelt kan dominere fordi andre har tilstrekkelige ressurser, allianser eller kontrollmidler til å begrense den.',
  'markedssvikt': 'Markedssvikt er når desentralisert markedsutveksling ikke gir et effektivt eller samfunnsmessig ønsket resultat, blant annet på grunn av eksternaliteter, monopol, kollektive goder eller informasjonssvikt.',
  'mdsd': 'MDSD, «most different systems design», sammenligner svært ulike case som har samme utfall for å lete etter en felles forklaringsfaktor, med uttrykte grenser for kausale slutninger.',
  'mediescene': 'En mediescene er den sammensetningen av redaksjoner, plattformer, sjangre og publikum der politiske aktører konkurrerer om oppmerksomhet og fortolkningsmakt.',
  'minnested': 'Et minnested er et fysisk eller digitalt sted som er gitt en organisert funksjon i offentlig erindring gjennom merking, ritualer, fortellinger eller institusjonell forvaltning.',
  'minnesteder': 'Minnesteder er fysiske eller digitale steder som organiserer offentlig erindring gjennom utvalg, symboler, ritualer og fortellinger om fortiden.',
  'mistanke': 'Mistanke er en begrunnet, men ikke bevist antakelse om at et relevant forhold kan foreligge, og må skilles fra fastslått faktum i kontroll og rettsanvendelse.',
  'monopol': 'Monopol er en situasjon der én aktør har enerett eller dominerende kontroll over et marked, en ressurs eller en beslutningskanal og derfor møter svak konkurranse.',
  'monument': 'Et monument er et varig fysisk verk reist eller bevart for å markere personer, hendelser eller verdier og fungerer derfor som et offentlig uttrykk for utvalgt minne.',
  'motminne': 'Et motminne er en organisert fortolkning av fortiden som utfordrer en dominerende offentlig fortelling ved å synliggjøre andre erfaringer, aktører eller ansvar.',
  'mssd': 'MSSD, «most similar systems design», sammenligner mest mulig like case med ulikt utfall for å identifisere forskjeller som kan bidra til å forklare variasjonen.',
  'mulighetsvindu': 'Et mulighetsvindu er en tidsavgrenset situasjon der problemer, politiske løsninger og beslutningsvilje kobles slik at endring som ellers var blokkert blir mulig.',
  'nasjonalt handlingsrom': 'Nasjonalt handlingsrom er de reelle valgmulighetene nasjonale myndigheter har innenfor rettslige forpliktelser, økonomiske avhengigheter, institusjonell kapasitet og politiske kostnader.',
  'naturverdi': 'Naturverdi er en begrunnet verdi knyttet til arter, økosystemer, landskap eller naturgoder og kan uttrykkes økologisk, kulturelt, sosialt eller økonomisk.',
  'normbrudd': 'Et normbrudd er en handling som avviker fra en identifiserbar sosial, profesjonell eller rettslig forventning og kan utløse uformell eller formell reaksjon.',
  'normer': 'Normer er delte forventninger om passende eller påkrevd atferd som opprettholdes gjennom sosial anerkjennelse, sanksjoner, vane eller institusjonalisering.',
  'nyhetshendelser': 'Nyhetshendelser er avgrensede begivenheter som redaksjoner eller plattformer gjør offentlig synlige gjennom utvalg, vinkling og tidsmessig prioritering.',
  'nyhetslogikk': 'Nyhetslogikk er redaksjonelle og plattformstyrte kriterier som favoriserer bestemte hendelser, aktører, konflikter, bilder og tidsformer i den offentlige oppmerksomheten.',
  'offentlig appell': 'En offentlig appell er en åpent rettet oppfordring som søker støtte, legitimitet eller handling fra et bredere publikum ved hjelp av argumenter, identitet eller moralsk press.',
  'omdømme': 'Omdømme er den relativt stabile vurderingen andre har av en aktørs troverdighet, kompetanse eller karakter, formet av tidligere handlinger og offentlig kommunikasjon.',
  'områdeforskjell': 'En områdeforskjell er en målt variasjon mellom geografiske enheter i ressurser, tjenester, befolkning eller utfall, og må vurderes mot ulik sammensetning og datakvalitet.',
  'omsorgsarbeid': 'Omsorgsarbeid er lønnet eller ulønnet arbeid som dekker andre menneskers fysiske, emosjonelle og praktiske behov, og er politisk formet av familie-, arbeids- og velferdsordninger.',
  'opposisjonsstøtte': 'Opposisjonsstøtte er støtte fra partier utenfor regjeringen som gjør et forslag eller en regjering levedyktig uten at støttepartiene nødvendigvis inngår i en fast koalisjon.',
  'opptak': 'Opptak er registrering av lyd eller bilde som bevarer en kommunikasjonssituasjon, men som fortsatt må vurderes etter utsnitt, kontekst, redigering og tilgang.',
  'organisasjoner': 'Organisasjoner er samordnede kollektiver med medlemskap, mål, roller, ressurser og beslutningsrutiner som gjør varig handling mulig utover enkeltpersoners bidrag.',
  'organisasjonsressurs': 'En organisasjonsressurs er medlemsmasse, penger, ekspertise, informasjon, nettverk eller legitimitet som en organisasjon kan omsette i koordinering og politisk påvirkning.',
  'partidisiplin': 'Partidisiplin er graden av samordnet atferd blant et partis folkevalgte, opprettholdt gjennom felles program, grupperegler, karriereinsentiver og mulige sanksjoner.',
  'partier': 'Partier er varige politiske organisasjoner som stiller kandidater til valg, samler interesser og ideer, konkurrerer om offentlig makt og organiserer representasjon.',
  'partikonkurranse': 'Partikonkurranse er rivalisering mellom partier om stemmer, saker, regjeringsmakt og politiske resultater innenfor et bestemt valg- og partisystem.',
  'pliktbærer': 'En pliktbærer er personen eller institusjonen som etter en rettsregel eller norm har ansvar for å oppfylle et bestemt krav overfor en rettighetshaver.',
  'policy-practice gap': 'Et policy-practice gap er et dokumentert avvik mellom vedtatte politiske mål eller regler og det som faktisk gjennomføres eller oppleves av berørte grupper.',
  'politi': 'Politiet er den offentlige etaten som skal forebygge og etterforske lovbrudd, opprettholde orden og bruke lovlig tvang under rettslig og demokratisk kontroll.',
  'politisk': 'Politisk beskriver forhold som gjelder kollektivt bindende beslutninger, makt, styring, fordeling, rettigheter, representasjon eller organisert konflikt om disse.',
  'politisk myte': 'En politisk myte er en forenklet og normativt ladet fortelling om et kollektivs opprinnelse, identitet eller konflikt som gir mening og legitimerer handling.',
  'politisk teori': 'Politisk teori er systematisk analyse av politiske begreper, verdier og begrunnelser, som makt, frihet, likhet, rettferdighet, demokrati og politisk forpliktelse.',
  'portefølje': 'En portefølje er samlingen av ansvarsområder, verv eller politiske saksfelt som er lagt til én aktør, og som gir både ressurser og avhengigheter.',
  'porteføljebytte': 'Porteføljebytte er omfordeling av ansvarsområder mellom partier eller personer som del av en koalisjonsforhandling eller regjeringsendring.',
  'preferanseavstand': 'Preferanseavstand er den målte forskjellen mellom aktørers standpunkter langs en uttrykt politisk dimensjon og brukes til å analysere konflikt, koalisjoner eller representasjon.',
  'presedens': 'Presedens er en tidligere avgjørelse eller praksis som får styrende eller overbevisende betydning for hvordan senere, sammenlignbare saker behandles.',
  'pressebilder': 'Pressebilder er redaksjonelt valgte fotografier eller videorammer som dokumenterer og fortolker hendelser gjennom utsnitt, timing, teksting og distribusjon.',
  'prioritering av grunnverdi': 'Prioritering av grunnverdi er en uttrykt rangering av hvilket overordnet prinsipp som skal veie tyngst når legitime politiske hensyn kolliderer.',
  'ramme': 'En ramme er en bindende eller veiledende ytre grense for penger, tid, kompetanse eller innhold som avgrenser mulige valg innenfor en beslutningsprosess.',
  'realvekst': 'Realvekst er økning etter at prisendringer er trukket fra; for tjenester må også befolknings- og oppgaveendringer vurderes før økt kapasitet kan konkluderes.',
  'reformer': 'Reformer er planlagte endringer av regler, organisasjoner eller virkemidler som skal forbedre bestemte forhold, men hvis faktiske innhold formes gjennom gjennomføring og motstand.',
  'regelverk': 'Et regelverk er et sammenhengende sett av lover, forskrifter og utfyllende bestemmelser som styrer et område og fordeler rettigheter, plikter og kompetanse.',
  'regimeskifte': 'Et regimeskifte er en grunnleggende endring i reglene for hvem som kan utøve politisk makt, hvordan ledere velges og hvordan makten begrenses eller kontrolleres.',
  'regjeringspress': 'Regjeringspress er strategisk bruk av avgangstrussel, kabinettspørsmål, forhandling eller offentlig ansvar for å få et parlamentarisk flertall til å støtte regjeringens linje.',
  'representasjonsfilter': 'Et representasjonsfilter er en regel eller praksis som avgjør hvilke interesser, kandidater eller erfaringer som slipper gjennom til en representativ arena.',
  'representasjonskrise': 'En representasjonskrise oppstår når mange borgere eller grupper ikke lenger oppfatter representanter og institusjoner som responsive, legitime eller i stand til å formidle deres krav.',
  'ressursasymmetri': 'Ressursasymmetri er systematisk ulik tilgang til penger, tid, kunnskap, personell eller nettverk som gir aktører forskjellig kapasitet til å delta og påvirke.',
  'rettighetshaver': 'En rettighetshaver er personen eller gruppen som etter en rettsregel har et bestemt krav på vern, ytelse, deltakelse eller handling fra en identifisert pliktbærer.',
  'rettsakt': 'En rettsakt er et formelt rettslig instrument vedtatt av et kompetent organ, som lov, forskrift, forordning eller direktiv, med et bestemt virkeområde og rettsvirkninger.',
  'rettsmiddel': 'Et rettsmiddel er en lovbestemt framgangsmåte for å få en avgjørelse prøvd, endret eller opphevet, for eksempel klage, anke eller domstolsprøving.'
})) editorialDefinitionSeeds.set(term, definition);

for (const [term, definition] of Object.entries({
  'arbeidsdeling': 'Arbeidsdeling er fordelingen av oppgaver, myndighet og ansvar mellom personer, organer eller styringsnivåer. Analysen må vise både den formelle fordelingen og hvordan avhengighet, koordinering og faktisk kontroll virker i praksis.',
  'brukererfaring': 'Brukererfaring er borgeres dokumenterte møte med en offentlig tjeneste eller ordning, fra informasjon og søknad til vedtak, levering og klage. Den kan ikke utledes av regelverket alene, men krever data fra dem som faktisk bruker ordningen.',
  'eøs-tilknytning': 'EØS-tilknytning er Norges traktatbaserte deltakelse i EUs indre marked gjennom EØS-avtalen, med innlemmelse av relevant EU-rett, adgang til markedet og institusjonelle ordninger for overvåking og tvisteløsning.',
  'flernivåstyring': 'Flernivåstyring er styring der myndighet, finansiering, gjennomføring og kontroll er fordelt og forhandlet mellom flere territorielle nivåer og mellom offentlige og ikke-offentlige aktører.',
  'forutberegnelighet': 'Forutberegnelighet er muligheten til å forstå hvilke regler som gjelder og med rimelig sikkerhet forutse hvordan myndighetene vil behandle sammenlignbare tilfeller. Klare hjemler, stabil praksis og begrunnede avgjørelser er sentrale vilkår.',
  'generaliserbarhet': 'Generaliserbarhet er i hvilken grad et funn fra et bestemt utvalg, case, sted eller tidsrom kan forventes å gjelde for en tydelig definert større populasjon eller andre situasjoner. Rekkevidden bestemmes av utvalg, design og kausale forutsetninger.',
  'generasjonsrettferdighet': 'Generasjonsrettferdighet vurderer hvordan ressurser, gjeld, miljøbelastning, risiko og politiske muligheter fordeles mellom nålevende og framtidige generasjoner, og hvilke plikter dagens beslutningstakere har over tid.',
  'inflasjon': 'Inflasjon er en vedvarende økning i det generelle prisnivået som reduserer pengenes kjøpekraft. Den måles over en definert varekurv og periode og må skilles fra prisøkning på én enkelt vare.',
  'jurisdiksjon': 'Jurisdiksjon er den rettslige kompetansen et organ eller en stat har til å lage, anvende eller håndheve regler over bestemte personer, saker eller territorier.',
  'kammeruenighet': 'Kammeruenighet oppstår når to kamre i en lovgivende forsamling vedtar ulike standpunkter eller lovtekster. Utfallet bestemmes av reglene for ny behandling, mekling, overstyring eller bortfall.',
  'klimarettferdighet': 'Klimarettferdighet vurderer hvordan ansvar for utslipp, sårbarhet for klimaendringer og kostnader og gevinster ved klimatiltak fordeles mellom land, grupper, steder og generasjoner.',
  'lobbyvirksomhet': 'Lobbyvirksomhet er organisert påvirkning rettet mot politiske beslutningstakere eller forvaltningen utenfor den formelle valgkanalen, gjennom møter, informasjon, ekspertise, kampanjer eller nettverk.',
  'lovlighet': 'Lovlighet er at en handling, avgjørelse eller praksis har tilstrekkelig rettslig grunnlag og holder seg innenfor gjeldende kompetanse-, saksbehandlings- og innholdskrav.',
  'maktdeling': 'Maktdeling er fordeling av offentlig myndighet mellom organer eller nivåer slik at ingen enkelt aktør kontrollerer hele beslutningskjeden. Ordningen vurderes gjennom kompetansegrenser, gjensidig kontroll og reell uavhengighet.',
  'maktseparasjon': 'Maktseparasjon er et institusjonelt prinsipp om å skille lovgivende, utøvende og dømmende funksjoner for å begrense maktkonsentrasjon og gjøre kontroll mulig.',
  'medbestemmelse': 'Medbestemmelse er en institusjonalisert rett for ansatte, brukere eller andre berørte til å delta i beslutninger som angår dem. Den må skilles fra ren informasjon og må vurderes etter tidspunkt, representasjon og faktisk påvirkningsmulighet.',
  'nasjon': 'En nasjon er et forestilt politisk fellesskap knyttet sammen av opplevd historie, kultur, språk, territorium eller institusjoner. Nasjonalt fellesskap og statsborgerskap kan overlappe, men er ikke det samme.',
  'nærhet': 'Nærhet er et styringsprinsipp om at beslutninger bør tas så nær de berørte som mulig, med mindre hensyn til kapasitet, likebehandling eller grenseoverskridende virkninger begrunner et høyere nivå.',
  'prosedyrerettferdighet': 'Prosedyrerettferdighet er vurderingen av om en beslutningsprosess behandler berørte parter upartisk og respektfullt, gir dem reell stemme og bygger på åpne, konsistente og begrunnede regler.',
  'prosessuell rettferdighet': 'Prosessuell rettferdighet er rettferdighet i måten beslutninger treffes og håndheves på, blant annet gjennom habilitet, kontradiksjon, lik behandling, begrunnelse og mulighet for prøving.',
  'proposisjon': 'En proposisjon er et formelt forslag fra regjeringen til Stortinget, vanligvis om lovvedtak, budsjett eller annet plenarvedtak, med begrunnelse og beslutningsgrunnlag for parlamentarisk behandling.',
  'regelbundethet': 'Regelbundethet er at myndighetsutøvelse følger kjente og generelle regler framfor skiftende personlige preferanser. Begrepet forutsetter samtidig kontroll av hvordan reglene tolkes, praktiseres og eventuelt fravikes.',
  'relativ deprivasjon': 'Relativ deprivasjon er opplevelsen av å være dårligere stilt enn en relevant sammenligningsgruppe eller enn egne legitime forventninger, selv om den absolutte situasjonen ikke nødvendigvis er blitt verre.',
  'selvfølgelighet': 'Selvfølgelighet er en oppfatning eller praksis som framstår så naturlig og uomstridt at dens historiske og politiske forutsetninger blir usynlige. Analyse gjør de underliggende kategoriene, interessene og alternativene eksplisitte.',
  'sporbarhet': 'Sporbarhet er muligheten til å følge en påstand, beslutning eller ressursbruk tilbake gjennom dokumenterte kilder, ansvarlige aktører og beslutningsledd. Den krever identifikatorer, versjonshistorikk og bevarte begrunnelser.',
  'statsdannelse': 'Statsdannelse er den historiske prosessen der varige institusjoner etablerer kontroll over territorium, skattlegging, administrasjon og legitim tvang, samtidig som forholdet til befolkningen og konkurrerende maktsentre omformes.',
  'storting': 'Stortinget er Norges folkevalgte nasjonalforsamling og utøver lovgivende, bevilgende og kontrollerende myndighet innenfor Grunnlovens parlamentariske orden.',
  'sysselsetting': 'Sysselsetting er omfanget av personer som utfører inntektsgivende arbeid i en definert befolkning og periode. Analysen skiller nivå, andel, arbeidstid og jobbkvalitet fra arbeidsledighet og deltakelse i arbeidsstyrken.',
  'tjenesteproduksjon': 'Tjenesteproduksjon er organiseringen og leveringen av offentlige eller offentlig finansierte tjenester gjennom personell, teknologi, regler og ressurser. Kvaliteten må vurderes i faktisk tilgjengelighet og resultat, ikke bare aktivitet eller budsjett.',
  'tradisjon': 'Tradisjon er en praksis, fortelling eller norm som overføres og gjenskapes over tid. Den er ikke uforanderlig, men velges, fortolkes og brukes av aktører i samtidige konflikter om identitet og legitimitet.',
  'troverdighet': 'Troverdighet er graden av tillit til at en aktørs påstand, løfte eller informasjon er sannferdig og vil bli fulgt opp. Den vurderes gjennom kompetanse, interesser, tidligere praksis, kontrollmuligheter og samsvarende belegg.',
  'upersonlighet': 'Upersonlighet er et ideal om at offentlige avgjørelser skal følge rolle, regel og relevante saklige kriterier framfor personlige bånd eller vilkårlige preferanser.',
  'vetoposisjon': 'En vetoposisjon er en institusjonell eller strategisk plassering som gjør en aktør i stand til å stanse eller kreve endring i et forslag før vedtak eller gjennomføring.',
  'vilkårlighet': 'Vilkårlighet er maktutøvelse uten tilstrekkelig saklig grunn, forutsigbar regel, relevant belegg eller reell kontroll. Den kan forekomme selv når beslutningstakeren formelt har kompetanse.',
  'ytelse': 'En ytelse er penger, tjenester eller naturalytelser som en rettighetshaver mottar etter bestemte vilkår. Analysen må skille lovfestet rett fra skjønn, nominelt nivå fra faktisk dekning og vedtak fra levering.',
  'åpenhet': 'Åpenhet er at informasjon om regler, beslutningsgrunnlag, aktører og prosesser er tilgjengelig og forståelig for dem som skal delta eller kontrollere. Publisering alene er ikke tilstrekkelig dersom materialet er ufullstendig eller utilgjengelig.'
})) editorialDefinitionSeeds.set(term, definition);

function capitalized(value) {
  const string = words(value);
  return string ? string.charAt(0).toLocaleUpperCase('nb-NO') + string.slice(1) : string;
}

function conceptScope(term, owner) {
  const lower = normalize(term);
  const scopes = [
    [/(?:agenda|dagsorden)/, 'politisk prioritering av problemer, krav og løsningsalternativer'],
    [/(?:arbeidsliv|arbeidsmarked|tariff|fagorgan|sysselsetting|arbeidsdeling)/, 'arbeid, lønn, organisering og forholdet mellom arbeidsgivere, arbeidstakere og myndigheter'],
    [/(?:areal|sonering|utbygging|byutvikling)/, 'bruk, vern, regulering og utvikling av arealer og bygde omgivelser'],
    [/(?:bolig|bo trygg|botrygg)/, 'tilgang til bolig, bokostnader, eierskap, leieforhold og geografisk bosetting'],
    [/(?:budsjett|bevilg|finansiering|ressursbruk|øremerking|rammebudsjett)/, 'inntekter, utgifter og bindingen av offentlige ressurser til bestemte formål'],
    [/(?:byråd|kommune|kommunal|lokal|fylke)/, 'lokale myndigheters oppgaver, ressurser, beslutninger og ansvar overfor innbyggerne'],
    [/(?:demokrati|deltak|medvirk|stemmerett|stemmelikhet)/, 'borgernes adgang til å delta, konkurrere om makt og holde beslutningstakere ansvarlige'],
    [/(?:domstol|rett|lov|legalitet|jurisdiksjon|konstitusjon|grunnlov)/, 'rettigheter, plikter, offentlig kompetanse og muligheten til å få maktbruk prøvd'],
    [/(?:eøs|eu|europeisk|flernivå)/, 'fordelingen av myndighet og ansvar mellom norske og europeiske institusjoner'],
    [/(?:familie|omsorg|barn)/, 'omsorgsansvar, hushold, tjenester og statens regulering av familieliv'],
    [/(?:finans|fiskal|skatt|penge|inflasjon)/, 'skatt, offentlige finanser, kreditt, priser og økonomisk stabilisering'],
    [/(?:helse|folkehelse)/, 'befolkningens helse, helsetjenester, forebygging og fordeling av behandlingsressurser'],
    [/(?:institusjon|forvaltning|administrativ|byråkrati|organisatorisk)/, 'offentlige organisasjoners regler, kapasitet, skjønn, samordning og ansvar'],
    [/(?:klima|miljø|natur)/, 'utslipp, naturinngrep, økologisk risiko, vern og fordeling av miljøkostnader'],
    [/(?:kunnskap|bevis|dokument|arkiv|utredning|ekspert|indikator|måling|modell|survey|data)/, 'produksjon, utvalg og bruk av kunnskap som grunnlag for politiske slutninger og beslutninger'],
    [/(?:marked|økonomi|økonomisk|kapital|formue|inntekt|investering|handel)/, 'eierskap, produksjon, utveksling, inntekt og fordeling av økonomiske ressurser'],
    [/(?:medie|nyhet|offentlighet|ytring|fortelling)/, 'produksjon og sirkulasjon av informasjon, argumenter og synlighet i offentligheten'],
    [/(?:minoritet|majoritet|migrasjon|medborgerskap|statsborger)/, 'medlemskap, tilhørighet, rettslig status og likeverdig adgang til samfunnets arenaer'],
    [/(?:norm|identitet|anerkjenn|diskrimin|kjønn|likhet|likeverd)/, 'sosiale kategorier, forventninger, status og fordelingen av anerkjennelse og handlingsrom'],
    [/(?:organisasjon|forening|bevegelse|mobilisering|protest)/, 'kollektiv organisering, ressurser, krav og påvirkning av politiske arenaer'],
    [/(?:parti|valg|koalisjon|regjering|storting|parlament|mandat|flertall)/, 'valg, representasjon, flertallsdannelse og utøvelse av politisk ledelse'],
    [/^norsk politikk$/, 'fordelingen og utøvelsen av politisk makt i Norge'],
    [/^politisk(?:\s|$)/, 'kollektivt bindende beslutninger, offentlig ledelse og demokratisk ansvar'],
    [/(?:^politi(?:$|\s|-|myndighet|makt|vesen)|straff|kriminal|sikkerhet|beredskap|forsvar|overvåking)/, 'forebygging, kontroll, beredskap, lovlig tvang og beskyttelse mot identifiserte trusler'],
    [/(?:representasjon|responsivitet|tilstedeværelse)/, 'hvem som får tale og handle på vegne av andre, og hvordan representanter kan kontrolleres'],
    [/(?:språk)/, 'språks rettslige status, institusjonelle bruk, ressurser og adgang til offentlige arenaer'],
    [/(?:stat|nasjon|suverenitet|statsmakt)/, 'statens myndighet, territorium, kapasitet og forhold til borgere og andre stater'],
    [/(?:velferd|sosial|utdanning|ytelse|mobilitet)/, 'rettigheter, tjenester, sosial risiko og fordelingen av livssjanser'],
    [/(?:utenriks|internasjonal|global|allianse|diplomati)/, 'staters og internasjonale aktørers sikkerhet, samarbeid, avhengighet og grenseoverskridende handlinger']
  ];
  return scopes.find(([matcher]) => matcher.test(lower))?.[1]
    || `problemfeltet «${words(owner.title).toLocaleLowerCase('nb-NO')}»`;
}

function contrastDefinition(term) {
  const parts = term.split(/\s+(?:vs\.?|versus|kontra)\s+/iu).map(words).filter(Boolean);
  if (parts.length !== 2) return '';
  const [left, right] = parts;
  return `${capitalized(term)} er et analytisk skille: «${left}» viser til den første ordningen, mekanismen eller målestokken, mens «${right}» viser til den alternative. Skillet skal brukes til å presisere hvilken side en påstand faktisk gjelder, ikke som om alternativene alltid utelukker hverandre.`;
}

function compoundEditorialDefinition(term, owner) {
  const label = words(term);
  const lower = normalize(label);
  const start = capitalized(label);
  const scope = conceptScope(label, owner);
  if (/\b(?:vs\.?|versus|kontra)\b/iu.test(lower)) return contrastDefinition(label);
  if (lower.includes('/')) return `${start} er en sammensatt oppføring som kobler de navngitte ordningene eller nivåene fordi de virker i samme politiske ansvarskjede. Hver del må likevel identifiseres separat når myndighet, finansiering, gjennomføring eller virkning undersøkes.`;
  if (/politi(?:kk|kken)$/.test(lower)) return `${start} er offentlige mål, beslutninger, konflikter og virkemidler som styrer ${scope}. Begrepet omfatter både problemdefinisjon, institusjonelt ansvar, ressursbruk, gjennomføring og fordelte virkninger.`;
  if (/(?:makt|myndighet|autoritet|dominans|innflytelse)$/.test(lower)) return `${start} er en kapasitet eller relasjon som gjør en aktør i stand til å forme andres alternativer, handlinger eller forståelser gjennom kontroll over ${scope}. Analysen må identifisere aktør, maktressurs, mekanisme, motpart og observerbar virkning.`;
  if (/(?:rett|rettighet|rettigheter|rettsvern|rettssikkerhet)$/.test(lower)) return `${start} er et rettslig eller politisk anerkjent krav eller vern knyttet til ${scope}. Rekkevidden avgjøres av hvem som er rettighetshaver, hvem som har plikten, hvilke vilkår som gjelder, og hvordan kravet kan prøves eller håndheves.`;
  if (/(?:plikt|plikter|krav)$/.test(lower)) return `${start} er en bindende eller normativ forventning om at en identifisert aktør skal handle, dokumentere eller avstå innen ${scope}. Kravet må vurderes gjennom grunnlag, adressat, vilkår, kontroll og mulige følger ved brudd.`;
  if (/(?:kontroll|tilsyn|prøving|proving)$/.test(lower)) return `${start} er ordninger som undersøker, begrenser eller korrigerer den virksomheten navnet viser til. Kontrollen må vurderes etter mandat, uavhengighet, informasjonsadgang, reaksjonsmuligheter og om funn faktisk følges opp.`;
  if (/(?:ansvar|ansvarlighet|ansvarslinje|ansvarsgap)$/.test(lower)) return `${start} betegner hvordan plikten til å handle, forklare eller stå til rette er fordelt i beslutninger om ${scope}. Begrepet krever en sporbar kjede fra mandat og beslutning til gjennomføring, kontroll og eventuell reaksjon.`;
  if (/(?:kapasitet|evne|beredskap)$/.test(lower)) return `${start} er den faktiske evnen til å løse oppgaver knyttet til ${scope} ved hjelp av tilstrekkelig informasjon, kompetanse, personell, penger, koordinering og legitime fullmakter. Formelt ansvar er derfor ikke i seg selv bevis på kapasitet.`;
  if (/(?:finansiering|bevilgning|budsjett|ressursbruk|ressurser)$/.test(lower)) return `${start} betegner hvordan penger eller andre knappe ressurser skaffes, fordeles og bindes til ${scope}. Analysen skiller vedtak fra faktisk bruk og vurderer tidsrom, alternativkostnad og fordelingsvirkning.`;
  if (/(?:fordeling|ulikhet|omfordeling|prioritering|vekting)$/.test(lower)) return `${start} betegner et mønster eller kriterium for hvordan goder, byrder, risiko, tjenester eller status fordeles. Begrepet må presiseres med fordelingsenhet, mottakere, sammenligningsgrunnlag og tidsrom.`;
  if (/(?:representasjon|deltakelse|medvirkning|inkludering|ekskludering)$/.test(lower)) return `${start} betegner hvordan personer eller grupper får adgang til, blir til stede i eller påvirker en politisk prosess. Analysen må skille formell adgang fra faktisk innflytelse og vise hvem som autoriserer, deltar og kan holde representanter ansvarlige.`;
  if (/(?:valg|avstemning|flertall|mandat|koalisjon)$/.test(lower)) return `${start} er en ordning eller et resultat i konkurransen om politisk representasjon og beslutningsmakt. Betydningen avhenger av reglene for deltakelse, opptelling, mandatfordeling, flertallsdannelse og ansvarliggjøring.`;
  if (/(?:institusjon|organisasjon|forvaltning|byråkrati|departement|direktorat|kommune|domstol|parlament|regjering)$/.test(lower)) return `${start} er en regelbundet politisk eller administrativ ordning med bestemte roller, fullmakter, ressurser og ansvar. Den må analyseres som faktisk praksis i tillegg til formell organisering.`;
  if (/(?:lov|regel|regler|regulering|vedtak|hjemmel|prosedyre|ordning)$/.test(lower)) return `${start} er en formalisert norm eller beslutningsordning som avgrenser hvem som kan gjøre hva, etter hvilke vilkår og med hvilke rettsvirkninger. Analysen følger grunnlag, prosedyre, håndheving, unntak og faktisk praksis.`;
  if (/(?:avtale|samarbeid|allianse|forhandling|forlik|kompromiss)$/.test(lower)) return `${start} er en koordinert relasjon der to eller flere aktører binder, tilpasser eller avveier handlinger om ${scope}. Innhold, gjensidighet, maktasymmetri, håndheving og mulighet for uttreden må undersøkes.`;
  if (/(?:konflikt|motstand|mobilisering|protest|polarisering|antagonisme)$/.test(lower)) return `${start} er en politisk prosess der aktører bestrider interesser, identiteter, ressurser eller regler knyttet til ${scope}. Begrepet krever identifiserte parter, krav, maktressurser, arena, tidsforløp og utfall.`;
  if (/(?:identitet|tilhørighet|minoritet|majoritet|norm|normalitet|anerkjennelse|diskriminering)$/.test(lower)) return `${start} er en sosial og politisk kategori eller relasjon som former medlemskap, forventninger, status og handlingsrom. Analysen undersøker hvem som definerer kategorien, hvordan den håndheves, og hvilke rettslige, materielle og symbolske følger den får.`;
  if (/(?:analyse|metode|design|måling|maling|indikator|indeks|modell|regresjon|inferens|survey|data|datasett|kilde|case|komparasjon)$/.test(lower)) return `${start} er en analytisk framgangsmåte, måleenhet eller beleggstype for å undersøke ${scope}. Bruken må gjøre analyseenhet, utvalg, data, operasjonalisering, slutningsregel og usikkerhet eksplisitt.`;
  if (/(?:effekt|utfall|resultat|konsekvens|virkning|tilbakekobling|endring)$/.test(lower)) return `${start} er et observert eller forventet resultat av beslutninger eller prosesser som berører ${scope}. Resultatet må skilles fra mål, innsats og samtidige hendelser og vurderes mot et uttrykt sammenligningsgrunnlag.`;
  if (/(?:prosess|gjennomføring|implementering|iverksetting|håndheving|praksis)$/.test(lower)) return `${start} er handlingskjeden som omsetter regler eller beslutninger om ${scope} til faktisk praksis. Analysen følger ansvar, ressurser, fortolkning, skjønn, koordinering og observerbare avvik mellom mål og resultat.`;
  if (/(?:system|modell|struktur|regime|nettverk|arena|offentlighet)$/.test(lower)) return `${start} er et stabilisert mønster av aktører, regler og relasjoner som organiserer ${scope}. Begrepet brukes til å undersøke hvordan posisjoner, adgang, ressurser og beslutningsmuligheter henger sammen over tid.`;
  if (/(?:adgang|tilgang|medlemskap|status|grense|grensedragning)$/.test(lower)) return `${start} betegner vilkårene for å bli regnet med, passere en grense eller få bruke en rettighet, arena eller ressurs. Analysen identifiserer kriteriene, portvakten, dokumentasjonskravene og muligheten for begrunnelse, klage eller statusendring.`;
  if (/(?:frihet|autonomi|suverenitet|selvbestemmelse)$/.test(lower)) return `${start} betegner et beskyttet handlingsrom eller en kompetanse til å fastsette egne valg om ${scope}. Begrepet må presiseres gjennom hvem som er selvstendig, overfor hvilken makt, innenfor hvilke grenser og med hvilke materielle forutsetninger.`;
  if (/(?:likhet|paritet|likeverd)$/.test(lower)) return `${start} betegner et krav eller et observert forhold der personer eller grupper behandles som like når ${scope} fordeles eller organiseres. Analysen må spesifisere om likheten gjelder rettigheter, muligheter, ressurser, status, deltakelse eller utfall.`;
  if (/(?:tillit|mistillit)$/.test(lower)) return `${start} er en forventning om at en aktør eller institusjon vil handle kompetent, forutsigbart og i tråd med aksepterte normer, eller fraværet av en slik forventning. Begrepet må skilles fra tilfredshet med ett enkelt vedtak og fra legitimitet.`;
  if (/(?:veto|blokkering|innsigelse)$/.test(lower)) return `${start} er en formell eller faktisk mulighet til å stanse, utsette eller tvinge fram endring i et forslag før beslutning eller gjennomføring. Analysen må vise hvem som har blokkeringsmuligheten, på hvilket trinn og om den kan overstyres.`;
  if (/(?:binding|forpliktelse|avhengighet)$/.test(lower)) return `${start} er en relasjon som begrenser framtidige valg fordi en aktør er bundet av regler, ressurser, avtaler eller andre aktørers handlinger. Styrken vurderes gjennom varighet, exitmulighet, håndheving og fordeling av kostnader.`;
  if (/(?:etterlevelse|samsvar)$/.test(lower)) return `${start} er graden av samsvar mellom en regel, beslutning eller standard og aktørenes faktiske handlinger. Begrepet må måles gjennom observerbar praksis og skiller frivillig tilpasning fra kontroll, sanksjon og bare formell rapportering.`;
  if (/(?:risiko|sikkerhet|trygghet|vern|forsvar)$/.test(lower)) return `${start} betegner hvordan mulige skader mot ${scope} forebygges, fordeles eller håndteres. Analysen identifiserer trussel, sannsynlighet, sårbarhet, beskyttelsesverdi, ansvar og hvilke grupper som bærer kostnadene.`;
  if (/(?:informasjon|kunnskap|bevis|dokumentasjon|begrunnelse|innsyn|journalføring|arkiv|register)$/.test(lower)) return `${start} betegner et kunnskaps- eller dokumentspor som brukes til å forberede, begrunne eller kontrollere politiske handlinger. Opphav, formål, klassifikasjon, tilgang, utvalg og hva materialet ikke kan vise, må vurderes eksplisitt.`;
  if (/(?:marked|økonomi|okonomi|kapital|formue|inntekt|handel|investering)$/.test(lower)) return `${start} betegner en økonomisk ressurs, relasjon eller aktivitet innen ${scope}. Politisk analyse undersøker eierskap, regler, pris- og maktforhold, risiko og hvordan gevinster og kostnader fordeles.`;
  if (/(?:medier|nyheter|news|debatt|dagsorden|flater|fortelling)$/.test(lower)) return `${start} er en kommunikasjonsform eller arena som påvirker hvilke politiske saker, aktører og fortolkninger som blir synlige. Analysen undersøker utvalg, redigering, rekkevidde, oppmerksomhet, kildeposisjon og mulighet for motargument.`;
  if (/(?:velferd|helse|omsorg|familie|bolig|utdanning|arbeidsliv|arbeidsmarked)$/.test(lower)) return `${start} betegner en institusjon, ressurs eller livsbetingelse som inngår i ${scope}. Begrepet analyseres gjennom rettigheter, tilgang, finansiering, profesjonelt skjønn, kvalitet og fordelte virkninger.`;
  if (/(?:standard|kriterium|nøkkel|terskel|grenseverdi)$/.test(lower)) return `${start} er en uttrykt målestokk eller avgrensning for å klassifisere, prioritere eller vurdere ${scope}. Den må undersøkes etter hvem som har fastsatt den, hvilket datagrunnlag den bygger på, og hvilke tilfeller den inkluderer eller utelukker.`;
  if (/(?:samtykke|gjensidighet|solidaritet)$/.test(lower)) return `${start} betegner en relasjon der aktører godtar, besvarer eller deler forpliktelser knyttet til ${scope}. Analysen må vise om deltakelsen er informert og reell, hvordan byrder fordeles, og hvilke muligheter partene har til å trekke seg.`;
  if (/(?:elite|folk|folket|gruppe|bevegelse|bevegelser|forening|parti|aktør)$/.test(lower)) return `${start} betegner en politisk aktør eller kollektiv kategori som samler personer gjennom posisjon, medlemskap, interesser eller organisering. Begrepet krever tydelige kriterier for hvem som regnes med, hvordan gruppen handler, og hvem som kan representere den.`;
  if (/(?:dyd|vilje|interesse|preferanse|holdning|ideologi|hegemoni|doxa)$/.test(lower)) return `${start} betegner en orientering, oppfatning eller normativ forestilling som kan påvirke politisk handling. Analysen må skille uttrykte standpunkter fra underliggende interesser, institusjonelle incentiver og atferd, og vise hvordan begrepet kan observeres.`;
  if (/(?:stilling|rolle|embete|frontlinje|hierarki)$/.test(lower)) return `${start} er en posisjon i en politisk eller administrativ arbeidsdeling med bestemte oppgaver, fullmakter, ressurser og forventninger. Analysen følger hva rollen formelt tillater, hva innehaveren faktisk gjør, og hvem som kan kontrollere handlingene.`;
  if (/(?:forslag|innspill|initiativ|sak|møte|behandling|foreleggelse|henvisning)$/.test(lower)) return `${start} er et avgrenset ledd i en beslutningsprosess om ${scope}, der informasjon, alternativer eller krav bringes inn til vurdering. Betydningen avhenger av hvem som kan starte leddet, hvilke frister og regler som gjelder, og om det påvirker utfallet.`;
  if (/(?:drift|bevaring|kontinuitet|rutine|vane|mønster)$/.test(lower)) return `${start} betegner en vedvarende praksis eller stabilitet i organiseringen av ${scope}. Begrepet undersøkes gjennom hvilke regler, ressurser og gjentatte handlinger som opprettholder mønsteret, og hva som kan bryte eller endre det.`;
  if (/(?:-?isme|federalisme|globalisering)$/.test(lower)) return `${start} betegner en politisk idéretning, institusjonsform eller samfunnsprosess som organiserer ${scope}. Bruken må presisere om begrepet beskriver et normativt ideal, en formell ordning eller en observerbar utvikling.`;
  if (/(?:itet|isme|skap)$/.test(lower)) return `${start} betegner en egenskap, relasjon eller institusjonell tilstand som gjelder ${scope}. Begrepet må operasjonaliseres gjennom observerbare kriterier og avgrenses fra nærliggende normer, organisasjoner og utfall.`;
  if (/(?:ering|isering|setting|utvikling|omstilling|reduksjon|økning|okning)$/.test(lower)) return `${start} er en endringsprosess som omformer aktører, regler, ressurser eller praksiser innen ${scope}. Analysen må fastsette utgangspunkt, drivkrefter, beslutningsledd, berørte grupper, tidsforløp og dokumentert resultat.`;
  if (/(?:ing|else|sjon|asjon)$/.test(lower)) return `${start} er en politisk, sosial eller administrativ handling eller prosess innen ${scope}. For å forklare den må analysen identifisere aktører, regelgrunnlag, ressurser, mekanisme, tidsforløp og forskjellen mellom tilsiktet og faktisk utfall.`;
  if (/(?:het)$/.test(lower)) return `${start} betegner en egenskap eller tilstand som må presiseres gjennom observerbare kriterier før den kan sammenlignes eller forklares. Analysen må angi hvem eller hva egenskapen gjelder, hvilken målestokk som brukes, og hvilke alternative fortolkninger som finnes.`;
  const domain = words(owner.area_label || owner.domain).toLocaleLowerCase('nb-NO');
  return `${start} betegner et avgrenset fenomen i ${domain}: en aktør, regel, ressurs, relasjon, praksis eller følge som må identifiseres konkret før den kan brukes i en forklaring. Definisjonen må leses sammen med oppslagets avgrensning, mekanismer og kritiske skiller.`;
}

function editorialDefinition(term, owner) {
  return editorialDefinitionSeeds.get(normalize(term)) || compoundEditorialDefinition(term, owner);
}

function contextualUse(term, owner) {
  const definition = words(owner.definition).replace(/[.!?]+$/, '');
  const lower = definition.replace(/^./u, (letter) => letter.toLocaleLowerCase('nb-NO'));
  if (/^(analyserer|undersøker|sammenligner|sporer|vurderer)\b/iu.test(lower)) return `I emnet «${owner.title}» brukes ${term} når leseren ${lower}.`;
  if (/^studiet av\b/iu.test(lower)) return `I emnet «${owner.title}» brukes ${term} som del av ${lower}.`;
  if (/^hvordan\b/iu.test(lower)) return `I emnet «${owner.title}» brukes ${term} for å undersøke ${lower}.`;
  return `I emnet «${owner.title}» brukes ${term} i analysen av ${lower}.`;
}

const sortedConceptRows = [...conceptMentions.entries()].sort((a, b) => a[1].label.localeCompare(b[1].label, 'nb'));
const usedIds = new Set();
const conceptIdByKey = new Map();
for (const [key, row] of sortedConceptRows) {
  const base = `pol_concept_${slug(row.label)}`;
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) id = `${base}_${suffix++}`;
  usedIds.add(id);
  conceptIdByKey.set(key, id);
}

const concepts = sortedConceptRows.map(([key, row]) => {
  const ownerEmnes = [...row.emneIds].map((id) => emneById.get(id)).filter(Boolean).sort((a, b) => {
    const rankA = list(a.core_concepts).some((term) => normalize(term) === key) ? 3 : list(a.key_concepts).some((term) => normalize(term) === key) ? 2 : 1;
    const rankB = list(b.core_concepts).some((term) => normalize(term) === key) ? 3 : list(b.key_concepts).some((term) => normalize(term) === key) ? 2 : 1;
    return rankB - rankA;
  });
  const owner = ownerEmnes[0];
  const conceptId = conceptIdByKey.get(key);
  const exact = exactDefinitions.get(key);
  const editorialReview = conceptReviewById.get(conceptId);
  const relatedCounts = new Map();
  for (const emne of ownerEmnes) for (const field of ['core_concepts', 'key_concepts', 'sub_concepts']) for (const other of list(emne[field])) {
    const otherKey = normalize(other);
    if (otherKey && otherKey !== key && conceptIdByKey.has(otherKey)) relatedCounts.set(otherKey, (relatedCounts.get(otherKey) || 0) + fieldRank[field]);
  }
  const related = [...relatedCounts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'nb')).slice(0, 8).map(([otherKey]) => conceptIdByKey.get(otherKey));
  const sourceRequirements = unique([
    owner.requires_external_claim_basis ? 'Eksterne faktapåstander må ha dokumenterbart kildegrunnlag.' : '',
    owner.requires_institution_law_conflict_or_social_process_anchor ? 'Bruken må forankres i en konkret institusjon, regel, konflikt, beslutning eller sosial prosess.' : '',
    owner.requires_politics_anchor ? 'Begrepet må belyse et faktisk politisk makt-, styrings-, fordelings- eller representasjonsforhold.' : ''
  ]);
  const baseDefinition = editorialReview?.reviewed_definition || exact?.definition || editorialDefinition(row.label, owner);
  const definition = baseDefinition.length >= 85
    ? baseDefinition
    : `${baseDefinition} I dette fagverket brukes begrepet i emnet «${owner.title}» og avgrenses mot emnets øvrige mekanismer og analytiske skiller.`;
  return {
    concept_id: conceptId,
    label: row.label,
    concept_type: row.rank === 4 ? 'core_concept' : row.rank === 3 ? 'key_concept' : row.rank === 2 ? 'supporting_concept' : 'keyword',
    definition,
    definition_status: editorialReview ? 'editorial_reviewed' : exact?.status || 'editorial_rule_definition',
    definition_source: editorialReview ? `data/fag/politikk/concept_editorial_reviews_politikk_v1.json#${conceptId}` : exact?.source || 'tools/materialize-politikk-curriculum.mjs#editorialDefinition',
    definition_method: editorialReview ? 'explicit_editorial_review' : exact ? 'source_exact' : editorialDefinitionSeeds.has(key) ? 'editorial_seed' : baseDefinition.includes('betegner et avgrenset fenomen i') ? 'domain_fallback' : 'semantic_editorial_rule',
    editorial_review: editorialReview ? {
      review_status: editorialReview.review_status,
      review_method: editorialReview.review_method,
      chapter_id: editorialReview.chapter_id,
      claims_file: editorialReview.claims_file,
      trace_quality: editorialReview.trace_quality,
      claim_ids: editorialReview.claim_ids,
      source_references: editorialReview.source_references,
      review_note: editorialReview.review_note
    } : null,
    contextual_use: contextualUse(row.label, owner),
    scope_note: words(owner.definition),
    why_it_matters: words(owner.why_it_matters),
    domain_ids: unique(ownerEmnes.map((emne) => emne.domain)),
    source_emne_ids: ownerEmnes.map((emne) => emne.emne_id),
    related_concepts: related,
    distinguish_from: unique(ownerEmnes.flatMap((emne) => [...list(emne.distinguish_from), ...list(emne.critical_distinctions), ...list(emne.conflicts)])).slice(0, 5),
    common_misuse: unique(ownerEmnes.flatMap((emne) => [...list(emne.misconceptions), ...list(emne.blindspots), ...list(emne.anti_patterns)])).slice(0, 4),
    indicators: unique(ownerEmnes.flatMap((emne) => [...list(emne.mechanisms), ...list(emne.analysis_axes)])).slice(0, 8),
    source_requirements: sourceRequirements,
    method_ids: unique(ownerEmnes.flatMap((emne) => list(emne.method_ids))).slice(0, 10),
    key_questions: unique(ownerEmnes.flatMap((emne) => list(emne.key_questions))).slice(0, 5)
  };
});

const architecture = {
  schema: 'history_go_politikk_curriculum_architecture_v1',
  version: '1.0.0',
  subject_id: 'politikk',
  status: 'active_curriculum_navigation',
  editorial_status: 'expanded_and_audited',
  purpose: 'Organiserer de 13 canonicale fagområdene, 123 emnene, 71 metodene og det fullstendige begrepsregisteret som et universitetsnært statsvitenskapelig studieløp.',
  editorial_introduction: {
    heading: 'Statsvitenskap undersøker hvordan makt organiseres, begrunnes og virker',
    paragraphs: [
      'Politikk handler om hvordan bindende beslutninger blir til, hvem som får innflytelse, hvordan ressurser og rettigheter fordeles, og hvordan mennesker kan delta, motsette seg eller holde makthavere ansvarlige. Statsvitenskap gjør disse spørsmålene etterprøvbare ved å avgrense begreper, identifisere institusjoner og aktører, forklare mekanismer og undersøke dokumenterte utfall.',
      'Studieløpet begynner med begrep, påstand og belegg, og bygger deretter en grunnmur av makt, stat, demokrati, rettferdighet og kollektiv handling. De statsvitenskapelige fagfeltene organiserer fordypningen, politikkprosessen viser rekkefølgen fra problemdefinisjon til evaluering, og styringsnivåene gjør det mulig å følge myndighet fra sted og kommune til stat, Europa og internasjonale institusjoner.',
      'De tretten canonicale domenene bevares som teknisk register for emner, metoder, quizer og stedskoblinger. De står ikke lenger alene som tretten like bokser. Hvert emne har definisjon, betydning, nøkkelspørsmål, analytiske skiller og metodekoblinger; hvert fagområde har et fullverdig lærekapittel; og hvert canonicalt begrep kan søkes opp med forklaring, avgrensning, feilbruk og forbindelser.'
    ],
    reading_guide: 'Begynn med progresjonen og de fem grunnspørsmålene. Velg deretter ett fagfelt, følg en konkret sak gjennom politikkprosessen, og bruk metode- og styringsnivåsporene til å kontrollere påstander, ansvar og generalisering.'
  },
  navigation_policy: {
    primary_order: ['progression', 'foundations', 'disciplinary_fields', 'policy_cycle', 'method_foundation', 'governance_scales', 'applied_tracks', 'concepts'],
    canonical_domain_registry_role: 'secondary_registry',
    canonical_ids_remain_stable: true,
    visible_labels_use_human_titles: true,
    database_ids_are_not_navigation_labels: true
  },
  curation_policy: {
    fixed_emne_quotas_forbidden: true,
    track_size_follows_subject_matter: true,
    coverage_is_not_equivalent_to_pedagogical_completion: true,
    empirical_normative_distinction_required: true,
    institution_mechanism_outcome_chain_required: true,
    political_opinion_is_not_analysis: true
  },
  progression,
  foundations,
  disciplinary_fields: disciplinaryFields,
  policy_cycle: policyCycle,
  method_foundation: methodFoundation,
  governance_scales: governanceScales,
  applied_tracks: appliedTracks,
  canonical_inventory: {
    domain_count: pensum.domains.length,
    emne_count: emners.length,
    method_count: methods.length,
    hook_count: list(fagkart.categories).reduce((sum, category) => sum + list(category.topic_hooks).length, 0),
    chapter_count: fs.readdirSync(FAGVERK).filter(isDirectChapterDirectory).length,
    concept_count: concepts.length
  },
  orientation_sources: [
    { id: 'ntnu_bpol_structure_2026', label: 'NTNU – Statsvitenskap bachelor, studiets oppbygning', url: 'https://www.ntnu.no/studier/bpol/studiets-oppbygning', role: 'Disiplinær hovedstruktur og progresjon.' },
    { id: 'ntnu_bpol_learning_2026', label: 'NTNU – Statsvitenskap bachelor, læringsmål', url: 'https://www.ntnu.no/studier/bpol/laeringsmal', role: 'Fagfelter og læringsmål.' },
    { id: 'uib_sampol_2026', label: 'UiB – Bachelor i sammenliknende politikk', url: 'https://www4.uib.no/program/samanliknande-politikk-bachelor', role: 'Komparativ politikk, institusjoner, atferd og metode.' }
  ]
};

const conceptDocument = {
  schema: 'history_go_politikk_concepts_v1',
  version: '1.0.0',
  subject_id: 'politikk',
  status: 'definition_complete',
  purpose: 'Gjør alle canonicale begreps- og stikkordsoppføringer søkbare med en selvstendig fagdefinisjon, kontekstuell bruk og sporbar eierkobling uten å endre emne- eller quizkontraktene.',
  definition_policy: {
    editorial_chapter: 'Eksakt redigert definisjon fra et kilde- og claimsporet lærekapittel.',
    canonical_hook: 'Eksakt definisjon fra det reviderte statsvitenskapelige hook-registeret.',
    canonical_emne: 'Eksakt definisjon fra et canonicalt emne.',
    canonical_method: 'Eksakt beskrivelse fra et canonicalt metodeobjekt.',
    editorial_rule_definition: 'Selvstendig, fagspesifikk definisjon materialisert fra redigerte statsvitenskapelige definisjonsfrø; emnekontekst lagres separat i contextual_use.',
    editorial_reviewed: 'Eksplisitt fryst og enkeltvis sporbar definisjon fra begrepsreviewregisteret, koblet til eieremne, fagkapittel, verifiserte claims og konkrete kildeplasseringer.'
  },
  summary: {
    concept_count: concepts.length,
    direct_editorial_or_canonical_definition_count: concepts.filter((concept) => concept.definition_method === 'source_exact').length,
    editorial_seed_definition_count: concepts.filter((concept) => concept.definition_method === 'editorial_seed').length,
    explicit_editorial_review_count: concepts.filter((concept) => concept.definition_method === 'explicit_editorial_review').length,
    semantic_rule_definition_count: concepts.filter((concept) => concept.definition_method === 'semantic_editorial_rule').length,
    contextual_definition_count: 0,
    emne_coverage_count: new Set(concepts.flatMap((concept) => concept.source_emne_ids)).size,
    domain_coverage_count: new Set(concepts.flatMap((concept) => concept.domain_ids)).size
  },
  concepts
};

const outputArchitecture = path.join(POLITIKK, 'curriculum_architecture_politikk_v1.json');
const outputConcepts = path.join(POLITIKK, 'concepts_politikk_canonical_v1.json');
const outputs = [
  [outputArchitecture, `${JSON.stringify(architecture, null, 2)}\n`],
  [outputConcepts, `${JSON.stringify(conceptDocument, null, 2)}\n`]
];
const checkOnly = process.argv.includes('--check');

if (checkOnly) {
  const stale = outputs
    .filter(([file, expected]) => !fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== expected)
    .map(([file]) => path.relative(ROOT, file));
  if (stale.length) {
    console.error(`Politikk-materialiseringen er utdatert: ${stale.join(', ')}`);
    console.error('Kjør npm run materialize:politikk-curriculum og commit de regenererte filene.');
    process.exitCode = 1;
  } else {
    console.log(`Politikk-materialiseringen er deterministisk og oppdatert: ${outputs.length} filer.`);
  }
} else {
  for (const [file, content] of outputs) fs.writeFileSync(file, content);
  console.log(`Skrev ${path.relative(ROOT, outputArchitecture)} med ${progression.length + foundations.length + disciplinaryFields.length + policyCycle.length + methodFoundation.length + governanceScales.length + appliedTracks.length} forklarte studieløpsdeler.`);
  console.log(`Skrev ${path.relative(ROOT, outputConcepts)} med ${concepts.length} forklarte begrepsoppføringer.`);
}
