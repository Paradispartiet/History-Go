#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = 'data/fag/litteratur/litteraturvitenskap_canonical_v1';
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const topic = (id, requiredSubcoverage, requiredConcepts, theoryTraditions, methods, namedAnalysisObjects, historicalCoverage, geographicalCoverage, boundaryAreaIds) => ({
  id,
  requiredSubcoverage,
  requiredConcepts,
  theoryTraditions,
  methods,
  namedAnalysisObjects,
  historicalCoverage,
  geographicalCoverage,
  boundaryAreaIds,
  completionEvidence: [
    'særskrevet hovedartikkel som eksplisitt behandler alle requiredSubcoverage-punkter',
    'definisjoner og grensedragninger for alle requiredConcepts',
    'minst ett fullt arbeidseksempel og to dokumenterte sammenligningsobjekter',
    'påstandsspor for historiske, geografiske og institusjonelle utsagn',
    'anvendelse av minst to teoritradisjoner og to metoder',
    'eksplisitt avgrensning mot alle boundaryAreaIds'
  ]
});

const sharedCompletionRules = [
  'Alle seks topicRequirements må være oppfylt uten tomme eller generiske plassholdere.',
  'Hvert requiredSubcoverage-punkt må være synlig i artikkeltekst eller et særskilt kildeført delkapittel.',
  'Alle requiredConcepts må finnes i områdets canonicale begrepsregister med definisjon og grense mot nabobegrep.',
  'Hvert tema må ha minst ett fullt arbeidseksempel og minst to navngitte sammenligningsobjekter.',
  'Minst to teoritradisjoner og to metoder må anvendes, ikke bare listes, per tema.',
  'Historisk og geografisk dekning må dokumenteres med kilder og kan ikke utledes fra ett enkeltverk.',
  'Vestlige kategorier må ikke presenteres som universelle når andre tradisjoner bruker andre form- eller sjangersystemer.',
  'Grenseflater mot andre dekningsområder skal peke til canonicale area-id-er og forklare faglig eierskap.',
  'Påstander om publikum, virkning, praksis eller institusjon krever resepsjons-, arkiv- eller empirisk evidens.',
  'Området kan først få status expanded_contract_fulfilled når en permanent audit har validert fulfillment-filen.'
];

const dramaContract = {
  schema: 'history_go_literature_full_field_contract_v1',
  version: '1.0.0',
  subjectId: 'litteratur',
  areaId: 'drama_teatertekst_framforing',
  title: 'Bindende fullfeltkontrakt: Drama, teatertekst og framføring',
  status: 'scope_locked_materialization_pending',
  purpose: 'Kontrakten hindrer at dramafeltet erklæres komplett gjennom seks brede overskrifter uten skuespillerarbeid, produksjon, publikum, globale teatertradisjoner, institusjoner og dokumentasjonsmetoder.',
  requiredDimensions: {
    theoryTraditions: ['dramasemiotikk', 'dramaturgisk teori', 'performance studies', 'resepsjonsteori', 'teaterhistoriografi', 'postdramatisk teori', 'ritual- og performativitetsteori', 'dekolonial teaterteori'],
    methods: ['dramatisk nærlesning', 'forestillingsanalyse', 'produksjonsanalyse', 'arkiv- og kildekritikk', 'resepsjonsanalyse', 'komparativ teaterhistoriografi', 'prøveprosessanalyse', 'romlig og multimodal analyse'],
    historicalPeriods: ['antikke og klassiske teatertradisjoner', 'middelalderlige og rituelle framføringsformer', 'tidlig moderne teater', 'det lange 1800-tallet', 'modernistisk og avantgardistisk teater', 'etterkrigstid og postdramatisk teater', 'samtidig digitalt, immersivt og deltakende teater'],
    geographicalTraditions: ['europeiske tradisjoner', 'sørasiatiske tradisjoner', 'østasiatiske tradisjoner', 'afrikanske og afrodiasporiske tradisjoner', 'amerikanske og latinamerikanske tradisjoner', 'urfolks- og stedsspesifikke framføringstradisjoner', 'transnasjonale og migratoriske teaterpraksiser'],
    mediaAndInstitutions: ['trykt dramatekst', 'manuskript og tekstgenese', 'prøverom og regibok', 'sceneproduksjon', 'lyd- og videoopptak', 'teaterarkiv og anmeldelse', 'kringkastet og digital framføring', 'teaterinstitusjon, arbeidsliv og produksjonsøkonomi'],
    boundaryAreaIds: ['sprak_stil_retorikk', 'sjanger_modus_form', 'tekstkritikk_bokhistorie_arkiv', 'medier_intermedialitet_adapsjon', 'litteratursosiologi_institusjoner_offentlighet', 'muntlighet_folklore_urfolkskunnskap']
  },
  completionRules: sharedCompletionRules,
  fulfillmentSchema: {
    requiredFile: 'foundation_texts/drama_teatertekst_framforing/full_field_fulfillment_v1.json',
    requiredTopicEvidenceFields: ['topicId', 'sectionIds', 'conceptIds', 'claimIds', 'sourceIds', 'appliedTheoryTraditions', 'appliedMethods', 'namedAnalysisObjects', 'historicalCoverage', 'geographicalCoverage', 'boundaryAreaIds', 'subcoverageEvidence', 'theoryEvidence', 'methodEvidence', 'namedObjectEvidence'],
    statusWhenComplete: 'expanded_contract_fulfilled'
  },
  topicRequirements: [
    topic('dialog_monolog_didascalier',
      ['replikkveksling, lytting og turorganisering', 'monolog, soliloquium, aside og kor', 'talehandling, implikatur og adressat', 'pause, taushet, avbrudd og usigelighet', 'didaskalier, utgaver og tekstgenese', 'flerspråklighet, oversettelse og surtitling', 'tegnspråk, teksting og tilgjengelig framføring'],
      ['dialog', 'monolog', 'didascalie', 'pause', 'talehandling', 'kor', 'surtitling', 'scenisk_taushet'],
      ['dramasemiotikk', 'pragmatikk og talehandlingsteori', 'dialogisme', 'performance studies'],
      ['replikkanalyse', 'tekstkritisk sammenligning', 'framføringssammenligning', 'multimodal transkripsjon'],
      ['Samuel Beckett: Waiting for Godot', 'William Shakespeare: Hamlet', 'Wole Soyinka: Death and the King’s Horseman', 'Zeami: Atsumori'],
      ['antikke kortradisjoner', 'tidlig moderne replikkteater', 'modernistisk og absurd teater', 'samtidig flerspråklig og tilgjengelig scenepraksis'],
      ['europeisk teater', 'vestafrikansk og afrodiasporisk teater', 'japansk nō-tradisjon', 'transnasjonal flerspråklig scene'],
      ['sprak_stil_retorikk', 'tekstkritikk_bokhistorie_arkiv', 'muntlighet_folklore_urfolkskunnskap']),
    topic('handling_konflikt_dramaturgi',
      ['aristotelisk og ikke-aristotelisk handlingsorganisering', 'episodisk, sirkulær og ritualbasert dramaturgi', 'konflikt, mål, hindring og fravær av konflikt', 'informasjon, gjenkjennelse, omslag og suspense', 'episk, brechtiansk og montagebasert dramaturgi', 'devised, kollektiv og improvisert dramaturgi', 'interaktiv, spillbasert og algoritmisk dramaturgi'],
      ['dramaturgi', 'konflikt', 'vendepunkt', 'gjenkjennelse', 'episode', 'montasje', 'devised_teater', 'interaktiv_dramaturgi'],
      ['aristotelisk poetikk', 'Brecht og episk teater', 'ritual- og performativitetsteori', 'nyere dramaturgiteori'],
      ['hendelsesprotokoll', 'informasjonsanalyse', 'prøveprosessanalyse', 'komparativ dramaturgisk analyse'],
      ['Sofokles: Kong Oidipus', 'Bertolt Brecht: Mutter Courage und ihre Kinder', 'Kālidāsa: Abhijñānaśākuntalam', 'Gao Xingjian: Bus Stop'],
      ['antikk dramaturgi', 'klassisk sanskritdrama', 'modernistisk og episk teater', 'samtidig kollektiv og interaktiv dramaturgi'],
      ['gresk middelhavstradisjon', 'sørasiatisk teater', 'kinesisk teater', 'europeisk og transnasjonalt politisk teater'],
      ['poetikk_estetikk_litteraritet', 'narratologi_prosa', 'muntlighet_folklore_urfolkskunnskap']),
    topic('tragedie_komedie_mellomformer',
      ['tragedie- og komediebegrepenes historiske variasjon', 'sanskritdrama, nō, kabuki og andre ikke-aristoteliske sjangersystemer', 'tragikomedie, farse, melodrama, satire og grotesk', 'affekt, latter, sorg og dokumentert publikumsrespons', 'sjanger, sosial orden, kjønn, klasse og rasialisering', 'rituell, politisk og populær framføring', 'produksjoner som omkoder eldre sjangerforventninger'],
      ['tragedie', 'komedie', 'tragikomedie', 'grotesk', 'farse', 'melodrama', 'satire', 'rasa'],
      ['historisk sjangerteori', 'affektteori', 'resepsjonsteori', 'dekolonial teaterteori'],
      ['sjangerhistorisk analyse', 'resepsjonsanalyse', 'produksjonssammenligning', 'institusjonsanalyse'],
      ['William Shakespeare: The Merchant of Venice', 'Aristofanes: Lysistrata', 'Kālidāsa: Abhijñānaśākuntalam', 'Wole Soyinka: The Road'],
      ['antikkens tragedie og komedie', 'klassiske asiatiske sjangersystemer', 'tidlig moderne blandingsformer', 'moderne og postkoloniale mellomformer'],
      ['middelhavsområdet', 'sør- og østasiatiske tradisjoner', 'europeisk tidlig moderne teater', 'afrikanske og afrodiasporiske tradisjoner'],
      ['sjanger_modus_form', 'leser_resepsjon_affekt', 'kjonn_feminisme_queer', 'postkolonial_dekolonial_rase_migrasjon']),
    topic('tekst_framforing_iscenesettelse',
      ['skuespillerkunst, kropp, stemme og rollearbeid', 'regi, dramaturg og prøveprosess', 'scenografi, kostyme, lys, lyd, musikk og koreografi', 'oversettelse, adaptasjon, kutt og tekstversjon', 'publikum, liveness og dokumentert resepsjon', 'produksjonsøkonomi, arbeidsdeling, sensur og institusjon', 'dokumentasjon gjennom opptak, fotografi, regibok og anmeldelse', 'tilgjengelighet, teksting, tegnspråk og relaxed performance'],
      ['iscenesettelse', 'framforing', 'produksjonskontekst', 'regibok', 'skuespillerarbeid', 'regi', 'scenografi', 'liveness'],
      ['performance studies', 'skuespillerteori', 'resepsjonsteori', 'institusjonell teatervitenskap'],
      ['forestillingsanalyse', 'produksjonsanalyse', 'arkivtriangulering', 'publikums- og resepsjonsanalyse'],
      ['Henrik Ibsen: Et dukkehjem', 'Yaël Farber: Molora', 'The Wooster Group: Hamlet', 'Ariane Mnouchkine: Les Atrides'],
      ['det naturalistiske regiteateret', 'modernistisk ensemble- og regipraksis', 'etterkrigstidens performancevending', 'samtidig transnasjonal og tilgjengelig produksjon'],
      ['nordisk og europeisk teater', 'sørafrikansk teater', 'amerikansk eksperimentteater', 'transnasjonale ensemblepraksiser'],
      ['medier_intermedialitet_adapsjon', 'litteratursosiologi_institusjoner_offentlighet', 'leser_resepsjon_affekt', 'tekstkritikk_bokhistorie_arkiv']),
    topic('dramatisk_rom_tid',
      ['vist rom, omtalt rom og hendelser utenfor scenen', 'scenografi, arkitektur, objekt og terskel', 'publikumsplassering, synslinjer og sosial adgang', 'fiksjonstid, spilletid, rytme, pause og simultanitet', 'stedsspesifikt, immersivt og mobilt teater', 'medialisert, digitalt og distribuert scenerom', 'rom, kolonialitet, kjønn, funksjonsevne og institusjonell makt'],
      ['scenerom', 'dramatisk_tid', 'utenfor_scenen', 'terskel', 'scenografi', 'liveness', 'stedsspesifikk_framforing', 'immersivt_teater'],
      ['romteori', 'performance studies', 'kronotopteori', 'kritisk scenografiteori'],
      ['romkartlegging', 'tidskoding av framføring', 'scenografisk analyse', 'stedsspesifikk feltanalyse'],
      ['Henrik Ibsen: Et dukkehjem', 'Samuel Beckett: Waiting for Godot', 'Punchdrunk: Sleep No More', 'Peter Brook: The Mahabharata'],
      ['prosceniumsteaterets utvikling', 'modernistisk romeksperiment', 'etterkrigstidens stedsspesifikke vending', 'samtidig immersivt og digitalt teater'],
      ['europeiske scenerom', 'sørasiatisk materiale i transnasjonal produksjon', 'amerikansk immersiv praksis', 'globale digitale og distribuerte scener'],
      ['medier_intermedialitet_adapsjon', 'litteratursosiologi_institusjoner_offentlighet', 'postkolonial_dekolonial_rase_migrasjon']),
    topic('lesedrama_postdramatisk_tekst',
      ['lesedrama, closet drama og bokmarked', 'postdramatisk tekst og svekket rolle- og plothierarki', 'tekstflate, partitur, stemme og materialitet', 'dokumentarteater, verbatim og vitnesbyrd', 'devised, improvisert og kollektivt forfatterskap', 'digitalt, deltakende og algoritmisk teater', 'arkiv, bevaring, rekonstruksjon og foreldet teknologi', 'etikk ved biografisk, psykiatrisk og dokumentarisk materiale'],
      ['lesedrama', 'postdramatisk', 'tekstflate', 'partitur', 'dokumentarteater', 'verbatim', 'devised_teater', 'digital_framforing'],
      ['postdramatisk teori', 'dokumentarteaterteori', 'mediearkeologi', 'performance studies'],
      ['tekstflateanalyse', 'produksjonssammenligning', 'arkiv- og rekonstruksjonsanalyse', 'etisk kildekritikk'],
      ['Sarah Kane: 4.48 Psychosis', 'Lord Byron: Manfred', 'Moisés Kaufman/Tectonic Theater Project: The Laramie Project', 'Rimini Protokoll: 100% City'],
      ['romantisk lesedrama', 'modernistisk teksteksperiment', 'postdramatisk teater etter 1960', 'samtidig dokumentarisk og digital performance'],
      ['europeisk lesedrama', 'britisk postdramatisk tekst', 'amerikansk dokumentarteater', 'transnasjonal deltakende performance'],
      ['tekstkritikk_bokhistorie_arkiv', 'medier_intermedialitet_adapsjon', 'minne_traume_vitnesbyrd_livsskriving'])
  ]
};

const genreContract = {
  schema: 'history_go_literature_full_field_contract_v1',
  version: '1.0.0',
  subjectId: 'litteratur',
  areaId: 'sjanger_modus_form',
  title: 'Bindende fullfeltkontrakt: Sjanger, modus og form',
  status: 'scope_locked_materialization_pending',
  purpose: 'Kontrakten hindrer at sjangerfeltet erklæres komplett gjennom en vestlig hovedsjangertrias og noen få markedsfelt uten historisk sjangerteori, globale klassifikasjonssystemer, medieformer og sannhetsforpliktelser.',
  requiredDimensions: {
    theoryTraditions: ['historisk sjangerteori', 'retorisk og pragmatisk sjangerteori', 'resepsjonsteori', 'litteratursosiologi og bokmarked', 'formalisme og modusteori', 'postkolonial og dekolonial sjangerkritikk', 'medie- og plattformteori', 'kognitiv sjangerteori'],
    methods: ['sjangerhistorisk analyse', 'paratekstanalyse', 'komparativ form- og modusanalyse', 'resepsjonsanalyse', 'forlags- og arkivstudium', 'korpus- og metadataanalyse', 'verdensbyggingsanalyse', 'sannhets- og kildekritisk analyse'],
    historicalPeriods: ['antikke og klassiske sjangersystemer', 'middelalderlige og førmoderne former', 'tidlig moderne trykk- og sceneformer', 'det lange 1800-tallet', 'modernismer og avantgarder', 'etterkrigstidens massemarked og postmodernisme', 'samtidige digitale, serielle og plattformbaserte former'],
    geographicalTraditions: ['europeiske tradisjoner', 'arabiske og persiske tradisjoner', 'sørasiatiske tradisjoner', 'østasiatiske tradisjoner', 'afrikanske og afrodiasporiske tradisjoner', 'latinamerikanske tradisjoner', 'urfolks- og minoritetslitterære tradisjoner', 'transnasjonale og oversatte sjangerfelt'],
    mediaAndInstitutions: ['muntlig framføring', 'manuskriptkultur', 'trykt bok og tidsskrift', 'avis, føljetong og pulp', 'radio, film og fjernsyn', 'tegneserie, manga og grafisk litteratur', 'fanmiljø, webroman og sosial plattform', 'forlag, bibliotek, bokhandel og algoritmisk klassifikasjon'],
    boundaryAreaIds: ['poetikk_estetikk_litteraritet', 'narratologi_prosa', 'lyrikk_poetiske_former', 'drama_teatertekst_framforing', 'tekstkritikk_bokhistorie_arkiv', 'medier_intermedialitet_adapsjon', 'komparativ_verdenslitteratur_oversettelse', 'litteratursosiologi_institusjoner_offentlighet']
  },
  completionRules: sharedCompletionRules,
  fulfillmentSchema: {
    requiredFile: 'foundation_texts/sjanger_modus_form/full_field_fulfillment_v1.json',
    requiredTopicEvidenceFields: ['topicId', 'sectionIds', 'conceptIds', 'claimIds', 'sourceIds', 'appliedTheoryTraditions', 'appliedMethods', 'namedAnalysisObjects', 'historicalCoverage', 'geographicalCoverage', 'boundaryAreaIds', 'subcoverageEvidence', 'theoryEvidence', 'methodEvidence', 'namedObjectEvidence'],
    statusWhenComplete: 'expanded_contract_fulfilled'
  },
  topicRequirements: [
    topic('sjangerkontrakt_forventning',
      ['taksonomiske, historiske, pragmatiske og retoriske sjangermodeller', 'sjangerkontrakt, forventningshorisont og leserfellesskap', 'paratekst, forlag, bibliotek og bokhandel', 'oversettelse og konflikt mellom lokale kategorisystemer', 'sjangerblanding, sjangerminne, endring og utdøing', 'fandom, plattformmetadata og algoritmisk kategorisering', 'sannhetskrav og institusjonell klassifikasjon'],
      ['sjanger', 'sjangerkontrakt', 'forventningshorisont', 'paratekst', 'sjangerblanding', 'sjangerminne', 'klassifikasjon', 'leserfellesskap'],
      ['historisk sjangerteori', 'retorisk sjangerteori', 'resepsjonsteori', 'litteratursosiologi'],
      ['paratekstanalyse', 'resepsjonsanalyse', 'forlags- og katalogstudium', 'komparativ terminologianalyse'],
      ['Daniel Defoe: Robinson Crusoe', 'Miguel de Cervantes: Don Quijote', 'Murasaki Shikibu: Genji monogatari', 'Tusen og én natt'],
      ['førmoderne sjangersystemer', 'tidlig moderne trykkultur', 'det moderne bokmarkedet', 'digitale plattformkategorier'],
      ['europeiske sjangersystemer', 'arabisk-persiske fortellingstradisjoner', 'japanske hoff- og prosatradisjoner', 'transnasjonale digitale sjangerfelt'],
      ['tekstkritikk_bokhistorie_arkiv', 'litteratursosiologi_institusjoner_offentlighet', 'komparativ_verdenslitteratur_oversettelse']),
    topic('epikk_lyrikk_dramatikk',
      ['den vestlige hovedsjangertriasens historie og begrensninger', 'epos, roman, lyrisk tale og dramatisk framføring som ulike kriterier', 'sanskritiske rasa- og formtradisjoner', 'arabisk-persiske adab-, qasida- og fortellingstradisjoner', 'østasiatiske wen-, monogatari-, shi- og dramatradisjoner', 'afrikanske muntlige lovprisnings-, epos- og framføringsformer', 'urfolks muntlige og seremonielle kunnskapsformer', 'essay, prosadikt, tegneserie og andre former som krysser triasen'],
      ['epikk', 'lyrikk', 'dramatikk', 'hovedsjanger', 'rasa', 'adab', 'qasida', 'monogatari'],
      ['historisk poetikk', 'komparativ sjangerteori', 'dekolonial teori', 'oralitetsteori'],
      ['begrepshistorie', 'komparativ formkartlegging', 'oversettelsesanalyse', 'framføringsanalyse'],
      ['Dante Alighieri: Den guddommelige komedie', 'Mahābhārata', 'Murasaki Shikibu: Genji monogatari', 'yoruba oríkì-tradisjoner'],
      ['antikke og klassiske systemer', 'middelalderlige og førmoderne former', 'moderne nasjonallitterære systemer', 'samtidige hybride medier'],
      ['europeiske tradisjoner', 'sørasiatiske tradisjoner', 'østasiatiske tradisjoner', 'vestafrikanske muntlige tradisjoner'],
      ['lyrikk_poetiske_former', 'drama_teatertekst_framforing', 'muntlighet_folklore_urfolkskunnskap', 'komparativ_verdenslitteratur_oversettelse']),
    topic('realisme_romantikk_modernisme_som_modus',
      ['skille mellom periode, bevegelse, stil og modus', 'realisme, naturalisme og dokumentarisk virkelighetseffekt', 'romantikk, gotikk, symbolisme og forestillingsformer', 'modernismer, avantgarder og ulike koloniale moderniteter', 'postmodernisme, metamodernisme og samtidige moduskombinasjoner', 'periodiseringens makt, sentrum–periferi og ujevne tidsforløp', 'formtrekk, institusjoner og programmer som evidens'],
      ['modus', 'realisme', 'romantikk', 'modernisme', 'periodisering', 'naturalisme', 'symbolisme', 'avantgarde'],
      ['modusteori', 'litteraturhistoriografi', 'marxistisk formteori', 'postkolonial modernitetsteori'],
      ['formanalyse', 'program- og manifestanalyse', 'komparativ periodisering', 'institusjonell kontekstualisering'],
      ['Gustave Flaubert: Madame Bovary', 'Natsume Sōseki: Kokoro', 'Lu Xun: En gal manns dagbok', 'Tayeb Salih: Season of Migration to the North'],
      ['romantiske og realistiske 1800-tall', 'globale modernismer', 'etterkrigstid og postmodernismer', 'samtidige blandingsmodi'],
      ['vest- og østeuropeiske tradisjoner', 'japansk modernitet', 'kinesisk modernisme', 'arabisk og afrikansk postkolonial modernitet'],
      ['moderne_og_samtidig_litteraturhistorie', 'eldre_litteratur_antik_middelalder_tidligmoderne', 'postkolonial_dekolonial_rase_migrasjon']),
    topic('fantastikk_science_fiction_dystopi',
      ['fantastikk, fantasy, gotikk, horror og det uhyggelige', 'science fiction, novum, spekulasjon og kognitiv fremmedgjøring', 'utopi, dystopi, apokalypse og postapokalypse', 'magisk realisme, fabulasjon og koloniale virkelighetsregimer', 'Afrofuturisme, Indigenous futurisms og dekolonial spekulasjon', 'klimafiksjon, økofiksjon og flerartslige verdener', 'weird, slipstream og samtidige hybridsjangrer', 'verdensbygging, kart, teknikk, politikk og leserens slutninger'],
      ['fantastikk', 'science_fiction', 'novum', 'dystopi', 'utopi', 'horror', 'magisk_realisme', 'verdensbygging'],
      ['fantastikkteori', 'science-fiction-teori', 'postkolonial og dekolonial teori', 'økokritikk'],
      ['verdensbyggingsanalyse', 'novumanalyse', 'komparativ sjangerhistorie', 'politisk og økokritisk analyse'],
      ['Mary Shelley: Frankenstein', 'Octavia E. Butler: Parable of the Sower', 'Ursula K. Le Guin: The Left Hand of Darkness', 'Nnedi Okorafor: Binti', 'Cherie Dimaline: The Marrow Thieves'],
      ['gotikk og tidlig science fiction', 'pulp og modernistisk spekulasjon', 'etterkrigstidens utopier og dystopier', 'samtidig klima- og dekolonial fiksjon'],
      ['europeisk gotikk', 'afrikansk og afrodiasporisk spekulasjon', 'urfolksfuturisme', 'transnasjonal science fiction'],
      ['okokritikk_dyr_miljo', 'postkolonial_dekolonial_rase_migrasjon', 'medier_intermedialitet_adapsjon']),
    topic('krim_romanse_popularlitteratur',
      ['detektivfortelling, politiroman, noir, thriller og true crime', 'romanse, kjærlighetsplot og sjangerspesifikk avslutning', 'horror, eventyr, western, melodrama og populærhistorisk fiksjon', 'føljetong, pulp, pocketbok, serie og franchise', 'tegneserie, manga, webroman, fanfiction og transmedial fortelling', 'formel, variasjon, forfattermerke og sjangerpublikum', 'marked, kjønn, klasse, rase og kanondannelse', 'fandom, anbefalingssystemer og dokumentert leserbruk'],
      ['formel', 'serie', 'sjangerpublikum', 'popularlitteratur', 'franchise', 'fandom', 'noir', 'romanse'],
      ['popularlitteraturteori', 'litteratursosiologi', 'feministisk sjangerteori', 'resepsjonsteori'],
      ['formelanalyse', 'forlags- og markedsanalyse', 'fandom- og resepsjonsanalyse', 'serie- og plattformanalyse'],
      ['Agatha Christie: The Murder of Roger Ackroyd', 'Beverly Jenkins: Indigo', 'Arthur Conan Doyle: The Hound of the Baskervilles', 'Jin Yong: The Legend of the Condor Heroes', 'Natsuo Kirino: Out'],
      ['1800-tallets føljetong og detektivfortelling', 'pulp, pocketbok og massemarked', 'etterkrigstidens serie- og sjangerindustri', 'digitale fan- og plattformkulturer'],
      ['britisk og amerikansk markedslitteratur', 'afroamerikansk romanse', 'østasiatisk krim, wuxia og webpublisering', 'transnasjonale fandom- og franchiseformer'],
      ['litteratursosiologi_institusjoner_offentlighet', 'kjonn_feminisme_queer', 'klasse_marxisme_okonomi_arbeid', 'medier_intermedialitet_adapsjon']),
    topic('hybridformer_essay_litterar_sakprosa',
      ['essayets prøvende, polemiske og personlige tradisjoner', 'biografi, selvbiografi, dagbok, brev og memoar', 'reiseskildring, reportage, nature writing og litterær journalistikk', 'vitnesbyrd, dokumentarlitteratur og muntlig historie', 'autofiksjon, dokufiksjon og sjangerusikker selvframstilling', 'prosadikt, dokumentarpoesi og grafisk sakprosa', 'podkast, digitalt essay og multimodal sakprosa', 'sannhetsansvar, rekonstruksjon, sitat, personvern og kildeetikk'],
      ['essay', 'sakprosa', 'hybridform', 'sannhetsansvar', 'memoar', 'reportage', 'autofiksjon', 'dokumentarlitteratur'],
      ['essaysjangerteori', 'sakprosateori', 'livsskrivingsforskning', 'dokumentar- og vitnesbyrdsteori'],
      ['retorisk og kompositorisk analyse', 'påstandsmatrise og kildekritikk', 'paratekstanalyse', 'etisk representasjonsanalyse'],
      ['Virginia Woolf: A Room of One’s Own', 'Sei Shōnagon: Hodeputeboken', 'James Baldwin: Notes of a Native Son', 'Svetlana Aleksijevitsj: Bønn for Tsjernobyl', 'Claudia Rankine: Citizen'],
      ['førmoderne notat- og samlingsformer', 'det moderne essayet og selvbiografien', '1900-tallets reportage og vitnesbyrd', 'samtidige hybride og digitale sakprosaformer'],
      ['europeiske og amerikanske essaytradisjoner', 'japansk zuihitsu', 'østeuropeisk dokumentarlitteratur', 'afrodiasporiske og transnasjonale hybridformer'],
      ['minne_traume_vitnesbyrd_livsskriving', 'tekstkritikk_bokhistorie_arkiv', 'medier_intermedialitet_adapsjon'])
  ]
};

const contractFiles = {
  drama_teatertekst_framforing: `${PACKAGE}/contracts/drama_teatertekst_framforing_full_field_v1.json`,
  sjanger_modus_form: `${PACKAGE}/contracts/sjanger_modus_form_full_field_v1.json`
};
for (const contract of [dramaContract, genreContract]) {
  const file = contractFiles[contract.areaId];
  if (fs.existsSync(path.join(ROOT, file))) {
    const existing = read(file);
    if (existing.status === 'fulfilled') contract.status = 'fulfilled';
  }
  write(file, contract);
}

const coverageFile = `${PACKAGE}/coverage_contract_v1.json`;
const coverage = read(coverageFile);
coverage.completion_definition.requirements_per_area = [...new Set([
  ...coverage.completion_definition.requirements_per_area,
  'områder med full_field_contract må ha en validert fulfillment-fil før komplettstatus',
  'utvidede kontrakter skal dokumentere underdekning, teorier, metoder, navngitte objekter, historisk og geografisk spenn samt canonicale grenseflater'
])];
coverage.completion_definition.forbidden_shortcuts = [...new Set([
  ...coverage.completion_definition.forbidden_shortcuts,
  'seks brede temaoverskrifter brukt som erstatning for bindende underdekning',
  'teorier, metoder, tradisjoner eller analyseobjekter som bare listes uten anvendelses- og kildespor'
])];
coverage.coverage_areas = coverage.coverage_areas.map((area) => contractFiles[area.id] ? {
  ...area,
  status: read(contractFiles[area.id]).status === 'fulfilled' ? 'expanded_contract_fulfilled' : 'expanded_contract_scope_locked_materialization_pending',
  full_field_contract: contractFiles[area.id].replace(`${PACKAGE}/`, '')
} : area);
const completed = coverage.coverage_areas.filter((area) => ['chapter_and_overview_text_materialized', 'expanded_contract_fulfilled'].includes(area.status));
coverage.progress = {
  areas_total: 28,
  areas_with_foundation_text: 28,
  areas_complete: completed.length,
  topics_total: 168,
  topics_with_foundation_text: 168,
  topics_complete: completed.flatMap((area) => area.topics).length,
  honest_status: `Alle 28 områder og 168 temaer har særskrevet oversiktstekst. Tolv områder og 72 temaer har materialiserte kapitler. ${completed.length} områder og ${completed.flatMap((area) => area.topics).length} temaer er fullført etter gjeldende kontrakt; ${28 - completed.length} områder og ${168 - completed.flatMap((area) => area.topics).length} temaer krever mer full-dybdearbeid.`
};
write(coverageFile, coverage);

const indexFile = `${PACKAGE}/index.json`;
const index = read(indexFile);
index.files.full_field_contracts = Object.values(contractFiles).map((file) => file.replace(`${PACKAGE}/`, ''));
index.summary.expanded_contract_count = 2;
const fulfilledContractCount = Object.values(contractFiles).map(read).filter((contract) => contract.status === 'fulfilled').length;
index.summary.expanded_contract_fulfilled_count = fulfilledContractCount;
index.summary.completion_status = `${fulfilledContractCount}_of_2_expanded_contracts_fulfilled_${18 - fulfilledContractCount}_areas_pending_full_depth`;
write(indexFile, index);

const statusFile = 'data/fagverk/subject_status.json';
const status = read(statusFile);
const literature = status.subjects.find((subject) => subject.id === 'litteratur');
literature.nextGate = fulfilledContractCount === 2 ? 'remaining_16_areas_full_depth_then_runtime' : `fulfill_${2 - fulfilledContractCount}_expanded_contracts_and_remaining_16_areas_then_runtime`;
literature.note = `Litteratur har 28 fagområdesynteser og 168 særskrevne emnetekster. Tolv områder og 72 temaer har materialiserte kapitler. ${completed.length} områder og ${completed.flatMap((area) => area.topics).length} temaer er komplette etter gjeldende kontrakt; ${28 - completed.length} områder og ${168 - completed.flatMap((area) => area.topics).length} temaer krever mer full-dybdearbeid. ${fulfilledContractCount} av 2 utvidede fullfeltkontrakter er oppfylt.`;
write(statusFile, status);
console.log('Låste utvidede fullfeltkontrakter for drama/teater og sjanger/modus/form.');
