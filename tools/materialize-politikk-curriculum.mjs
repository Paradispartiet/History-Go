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

const pensum = readJson(path.join(POLITIKK, 'politikkpensum_canonical_v4_5.json'));
const emners = readJson(path.join(POLITIKK, 'emner_politikk_canonical_v4_5.json'));
const methodsDocument = readJson(path.join(POLITIKK, 'methods_politikk_canonical_v4_5.json'));
const fagkart = readJson(path.join(POLITIKK, 'fagkart_politikk_canonical_v4_5.json'));
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
  ['rett_sikkerhet', 'Rett, kontroll og sikkerhet', 'Rettigheter, domstoler, politi, straff, beredskap og begrensning av offentlig makt.', /rett|domstol|politi|straff|sikkerhet|beredskap|maktbegrensning/i],
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

function collectChapterConcepts() {
  const definitions = new Map();
  for (const chapterDir of fs.readdirSync(FAGVERK)) {
    const directory = path.join(FAGVERK, chapterDir);
    if (!fs.statSync(directory).isDirectory()) continue;
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

function contextualDefinition(term, owner) {
  const lower = normalize(term);
  const context = words(owner.why_it_matters || owner.definition).replace(/[.!?]+$/, '');
  const contextSentence = `Koblingen til emnet er denne: ${context}.`;
  if (/\bvs\.?\b| versus | kontra /.test(lower)) return `${term} er et analytisk skille mellom forklaringer, institusjonsformer eller vurderingskriterier som må holdes fra hverandre i emnet «${owner.title}». Skillet gjør premisser og sammenligninger tydeligere. ${contextSentence}`;
  if (/analyse$|metode|måling|maling|indikator|indeks|modell|design|regresjon|survey|data|kilde|case/.test(lower)) return `${term} betegner en analytisk framgangsmåte, måleenhet eller beleggstype som brukes i emnet «${owner.title}». Bruken må angi analyseenhet, datagrunnlag, slutningsregel og begrensninger. ${contextSentence}`;
  if (/makt|myndighet|autoritet|dominans|innflytelse|kontroll/.test(lower)) return `${term} viser til en kapasitet, posisjon eller relasjon som påvirker andre aktørers handlinger, alternativer eller forståelser innen «${owner.title}». Begrepet krever en eksplisitt maktmekanisme og må ikke reduseres til synlig tvang. ${contextSentence}`;
  if (/rett|rettighet|plikt|lov|hjemmel|jurisdiksjon/.test(lower)) return `${term} viser til et rettslig eller politisk regulert krav, vern, ansvar eller kompetanse innen «${owner.title}». Det analyseres gjennom hjemmel, rekkevidde, prosedyre, kontroll og faktisk virkning. ${contextSentence}`;
  if (/institusjon|organisasjon|forvaltning|byråkrati|styring|stat|regjering|storting|domstol|kommune|organ\b/.test(lower)) return `${term} betegner en regelbundet ordning, offentlig aktør, organisert praksis eller styringsmekanisme innen «${owner.title}». Analysen følger roller, kompetanse, ressurser, skjønn og ansvar. ${contextSentence}`;
  if (/demokrati|representasjon|deltakelse|valg|parti|offentlighet/.test(lower)) return `${term} betegner en ordning eller prosess for politisk deltakelse, konkurranse, representasjon eller ansvarliggjøring innen «${owner.title}». Begrepet avgrenses gjennom hvilke aktører, arenaer og kriterier som omfattes. ${contextSentence}`;
  if (/ulikhet|fordeling|velferd|ressurs|klasse|mobilitet|skatt|budsjett/.test(lower)) return `${term} betegner en fordelingsrelasjon eller mekanisme som påvirker ressurser, risiko, tjenester, status eller livssjanser innen «${owner.title}». Begrepet krever en eksplisitt fordelings- og sammenligningsenhet. ${contextSentence}`;
  if (/norm|identitet|inkludering|ekskludering|minoritet|kjønn|kjonn|tilhørighet/.test(lower)) return `${term} betegner en sosial eller politisk kategori, forventning eller grensedragning innen «${owner.title}». Analysen undersøker hvem som gis tilhørighet, anerkjennelse, rettigheter og handlingsrom. ${contextSentence}`;
  if (/konflikt|forhandling|mobilisering|protest|motstand|polarisering/.test(lower)) return `${term} betegner en politisk relasjon eller prosess der interesser, identiteter, ressurser eller regler bestrides innen «${owner.title}». Analysen må identifisere aktører, krav, maktressurser, arena og utfall. ${contextSentence}`;
  if (/effekt|utfall|resultat|konsekvens|virkning|tilbakekobling/.test(lower)) return `${term} betegner et observert eller forventet resultat av en politisk ordning eller prosess innen «${owner.title}». Begrepet må skilles fra mål og innsats, og krever et tydelig sammenligningsgrunnlag. ${contextSentence}`;
  if (/politikk|policy|regulering|tiltak|virkemiddel|reform|implementering/.test(lower)) return `${term} betegner et politisk problemfelt, mål, virkemiddel eller beslutningsforløp innen «${owner.title}». Analysen følger problemdefinisjon, institusjon, mekanisme, gjennomføring og dokumentert utfall. ${contextSentence}`;
  return `${term} er et kontekstuelt analysebegrep i emnet «${owner.title}». Oppslaget avgrenser begrepets faglige bruk gjennom emnets aktører, relasjoner, mekanismer eller konsekvenser; det er ikke ment som en løs ordbokdefinisjon. ${contextSentence}`;
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
  const exact = exactDefinitions.get(key);
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
  const baseDefinition = exact?.definition || contextualDefinition(row.label, owner);
  const definition = baseDefinition.length >= 85
    ? baseDefinition
    : `${baseDefinition} I dette fagverket brukes begrepet i emnet «${owner.title}» og avgrenses mot emnets øvrige mekanismer og analytiske skiller.`;
  return {
    concept_id: conceptIdByKey.get(key),
    label: row.label,
    concept_type: row.rank === 4 ? 'core_concept' : row.rank === 3 ? 'key_concept' : row.rank === 2 ? 'supporting_concept' : 'keyword',
    definition,
    definition_status: exact?.status || 'contextual_from_canonical_emne',
    definition_source: exact?.source || owner.emne_id,
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
  editorial_status: 'complete',
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
    chapter_count: fs.readdirSync(FAGVERK).filter((entry) => fs.statSync(path.join(FAGVERK, entry)).isDirectory()).length,
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
  status: 'editorially_complete',
  purpose: 'Gjør alle canonicale begreps- og stikkordsoppføringer søkbare og forklarte uten å endre emne- eller quizkontraktene.',
  definition_policy: {
    editorial_chapter: 'Eksakt redigert definisjon fra et kilde- og claimsporet lærekapittel.',
    canonical_hook: 'Eksakt definisjon fra det reviderte statsvitenskapelige hook-registeret.',
    canonical_emne: 'Eksakt definisjon fra et canonicalt emne.',
    canonical_method: 'Eksakt beskrivelse fra et canonicalt metodeobjekt.',
    contextual_from_canonical_emne: 'Kontekstuell forklaring bygget fra emnets canonicale definisjon, avgrensninger, mekanismer og metodekrav; vises som faglig bruk, ikke som løs ordbokfasit.'
  },
  summary: {
    concept_count: concepts.length,
    direct_editorial_or_canonical_definition_count: concepts.filter((concept) => concept.definition_status !== 'contextual_from_canonical_emne').length,
    contextual_definition_count: concepts.filter((concept) => concept.definition_status === 'contextual_from_canonical_emne').length,
    emne_coverage_count: new Set(concepts.flatMap((concept) => concept.source_emne_ids)).size,
    domain_coverage_count: new Set(concepts.flatMap((concept) => concept.domain_ids)).size
  },
  concepts
};

const outputArchitecture = path.join(POLITIKK, 'curriculum_architecture_politikk_v1.json');
const outputConcepts = path.join(POLITIKK, 'concepts_politikk_canonical_v1.json');
fs.writeFileSync(outputArchitecture, `${JSON.stringify(architecture, null, 2)}\n`);
fs.writeFileSync(outputConcepts, `${JSON.stringify(conceptDocument, null, 2)}\n`);
console.log(`Skrev ${path.relative(ROOT, outputArchitecture)} med ${progression.length + foundations.length + disciplinaryFields.length + policyCycle.length + methodFoundation.length + governanceScales.length + appliedTracks.length} forklarte studieløpsdeler.`);
console.log(`Skrev ${path.relative(ROOT, outputConcepts)} med ${concepts.length} forklarte begrepsoppføringer.`);
