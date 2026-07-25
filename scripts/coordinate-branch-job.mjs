#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_offentlighet_mobilisering_bevegelser';
const conceptPath = path.join(historyDir, 'concepts_historie_canonical_v5_5.json');
const theoryPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const targetInventoryPath = path.join(reportDir, 'offentlighet-mobilisering-bevegelser-target-inventory.json');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
fs.mkdirSync(reportDir, { recursive: true });

const C = (label, definition, conceptType, related, distinguish, misuse, indicators, sources, broader = []) => ({
  label,
  definition,
  concept_type: conceptType,
  broader_concepts: broader,
  narrower_concepts: [],
  related_concepts: related,
  distinguish_from: distinguish,
  common_misuse: [misuse],
  indicators,
  source_requirements: sources,
  status: 'canonical_v5_5_curated'
});

const conceptSpecs = {
  con_his_antirasisme: C(
    'antirasisme',
    'Antirasisme er organiserte ideer, praksiser og mobiliseringer som identifiserer, utfordrer og søker å endre rasialisering, diskriminering og institusjonelle maktforhold.',
    'antiracist_mobilization_concept',
    ['con_his_borgerrettighetskamp', 'con_his_solidaritetsbevegelser', 'con_his_offentligheter'],
    ['con_his_solidaritet'],
    'Å kalle enhver generell toleranseerklæring antirasistisk uten å dokumentere hvilket maktforhold, hvilken målgruppe og hvilken endringsstrategi som ble utfordret.',
    ['identifisert rasistisk praksis eller struktur', 'organisert motstand, opplysning eller rettighetskrav', 'dokumentert målgruppe, arena og endringsstrategi'],
    ['organisasjonsarkiv, kampanjemateriale, presse og politiske dokumenter', 'kilder fra berørte grupper som viser mottak, konflikt og faktisk virkning']
  ),
  con_his_arbeider: C(
    'arbeideridentitet',
    'Arbeideridentitet er historisk skapte forestillinger om tilhørighet, verdighet, interesser og fellesskap knyttet til lønnsarbeid, yrke, klasseposisjon og organisering.',
    'collective_worker_identity_concept',
    ['con_his_arbeiderbevegelse', 'con_his_kollektiv', 'con_his_solidaritet'],
    ['con_his_arbeiderbevegelse'],
    'Å avlede en enhetlig arbeideridentitet direkte fra yrke eller inntekt uten å undersøke kjønn, fag, bosted, organisasjonstilknytning og samtidens eget språk.',
    ['selvbetegnelse eller kollektiv symbolbruk', 'felles krav, møter eller organisasjonstilknytning', 'avgrensning mot andre grupper eller identiteter'],
    ['medlems-, møte-, presse- og foreningskilder', 'personlige og lokale kilder som viser variasjon, uenighet og skiftende identifikasjon']
  ),
  con_his_arbeiderbevegelse: C(
    'arbeiderbevegelse',
    'Arbeiderbevegelsen er nettverket av fagforeninger, partier, kooperativer, presse, opplysningsarbeid og lokale foreninger som organiserte lønnsarbeideres interesser og politiske deltakelse.',
    'labour_movement_concept',
    ['con_his_foreninger', 'con_his_partier', 'con_his_protestrepertoar'],
    ['con_his_arbeider'],
    'Å framstille arbeiderbevegelsen som én samlet aktør uten å dokumentere strid mellom fag, regioner, partier, kjønn, reformister og revolusjonære retninger.',
    ['medlemsorganisasjoner og institusjoner', 'kollektive krav og forhandlings- eller protestformer', 'presse, økonomi og varig organisatorisk infrastruktur'],
    ['fagforenings-, parti-, presse- og kooperativarkiv', 'arbeidsplass-, medlems- og motpartskilder som viser representativitet og interne konflikter']
  ),
  con_his_avholdsbevegelse: C(
    'avholdsbevegelse',
    'Avholdsbevegelsen er en organisert reformtradisjon som koblet personlig avhold til familieøkonomi, moral, helse, folkedannelse og politisk regulering av alkohol.',
    'temperance_movement_concept',
    ['con_his_forening', 'con_his_motkultur', 'con_his_kollektiv_handling'],
    ['con_his_avholdsbevegelser'],
    'Å redusere avholdsbevegelsen til privat livsstil uten å undersøke losjer, kjønn, religion, sosial reform, lokalpolitikk og lovgivningsarbeid.',
    ['formell medlemsorganisering og avholdsløfte', 'opplysnings-, møte- og kampanjevirksomhet', 'krav om sosial eller politisk regulering'],
    ['losje-, forenings-, presse- og kampanjearkiv', 'medlems-, kommune- og motstanderkilder som viser sosial sammensetning og virkning']
  ),
  con_his_avholdsbevegelser: C(
    'avholdsbevegelser',
    'Avholdsbevegelser betegner mangfoldet av lokale, religiøse, sekulære, barne-, kvinne- og arbeiderorienterte organisasjoner som fremmet ulike former for avhold og alkoholpolitikk.',
    'temperance_movement_ecology_concept',
    ['con_his_avholdsbevegelse', 'con_his_foreninger', 'con_his_organisasjonssamfunn'],
    ['con_his_avholdsbevegelse'],
    'Å slå alle avholdsorganisasjoner sammen til én bevegelse og overse forskjeller i medlemsgrunnlag, trosforankring, politisk strategi og syn på regulering.',
    ['flere identifiserbare organisasjoner eller retninger', 'ulike medlemsgrupper, ritualer eller programmer', 'samarbeid, konkurranse eller organisatoriske brudd'],
    ['sammenlignbare organisasjonsarkiver og medlemsdata', 'lokale presse- og myndighetskilder som viser samspill og konflikt mellom retningene']
  ),
  con_his_borgerrettigheter: C(
    'borgerrettigheter',
    'Borgerrettigheter er historisk definerte krav og garantier om lik rettslig status, politisk deltakelse, bevegelsesfrihet, ytring, organisering og vern mot diskriminering.',
    'civil_rights_concept',
    ['con_his_borgerrettighetskamp', 'con_his_antirasisme', 'con_his_offentlighet'],
    ['con_his_solidaritet'],
    'Å behandle formelt lovfestede rettigheter som faktisk lik tilgang uten å undersøke håndheving, administrative barrierer, vold og sosial eksklusjon.',
    ['formelt rettighetskrav eller lovvern', 'identifisert diskriminerende regel eller praksis', 'håndheving, klage eller kollektiv mobilisering'],
    ['lov-, domstols-, forvaltnings- og organisasjonskilder', 'kilder fra rettighetshavere som viser faktisk adgang, brudd og konsekvens']
  ),
  con_his_borgerrettighetskamp: C(
    'borgerrettighetskamp',
    'Borgerrettighetskamp er kollektiv mobilisering for å oppnå, håndheve eller utvide lik rettslig og politisk status gjennom organisering, rettssaker, protest, valg og offentlig argumentasjon.',
    'civil_rights_struggle_concept',
    ['con_his_borgerrettigheter', 'con_his_antirasisme', 'con_his_protestrepertoar'],
    ['con_his_solidaritetsbevegelser'],
    'Å bruke betegnelsen om ethvert rettighetskrav uten å dokumentere kollektiv organisering, motpart, konkrete krav og forholdet mellom juridisk og sosial endring.',
    ['organisert rettighetskrav og identifisert motpart', 'rettslig, politisk eller protestbasert strategi', 'dokumentert respons, represjon eller reform'],
    ['bevegelses-, retts-, presse- og myndighetsarkiv', 'deltaker- og motpartskilder som viser strategi, representasjon og resultat']
  ),
  con_his_digital: C(
    'digital offentlighet',
    'Digital offentlighet er kommunikative rom formet av nettbaserte plattformer, søkbarhet, algoritmisk synlighet, deling og datainnsamling, der politiske ytringer og mobilisering kan sirkulere raskt og ulikt.',
    'digital_public_sphere_concept',
    ['con_his_digitale', 'con_his_digital_mobilisering', 'con_his_offentligheter'],
    ['con_his_presse'],
    'Å omtale internett som én åpen offentlighet uten å undersøke plattformregler, algoritmer, tilgang, moderering, eierskap og hvilke grupper som faktisk blir synlige.',
    ['identifisert plattform og teknisk funksjon', 'publikum, synlighetsmekanisme og interaksjon', 'moderering, datafangst eller algoritmisk sortering'],
    ['arkiverte nettsider, plattformdata, vilkår og teknisk dokumentasjon', 'bruker-, kampanje- og mottakskilder som viser faktisk rekkevidde og praksis']
  ),
  con_his_digital_mobilisering: C(
    'digital mobilisering',
    'Digital mobilisering er organisering av oppmerksomhet, deltakelse, ressurser og kollektiv handling gjennom nettverkstjenester, meldingssystemer, digitale kampanjer og hybride forbindelser til fysiske arenaer.',
    'digital_mobilization_concept',
    ['con_his_digital', 'con_his_digitale', 'con_his_mobiliseringsformer'],
    ['con_his_kollektiv_handling'],
    'Å likestille klikk, delinger eller følgertall med varig organisering og politisk virkning uten å dokumentere overgang til deltakelse, ressurser eller beslutningspåvirkning.',
    ['digital rekruttering eller koordinering', 'målbar overgang til deltakelse, ressurs eller handling', 'forbindelse mellom plattform og organisatorisk struktur'],
    ['kampanje- og plattformarkiv, nettverksdata og meldingsspor', 'intervjuer, medlemsdata og hendelseskilder som viser faktisk deltakelse og utfall']
  ),
  con_his_digitale: C(
    'digitale nettverk',
    'Digitale nettverk er teknisk og sosialt organiserte forbindelser mellom brukere, grupper, plattformer og informasjonsstrømmer som muliggjør koordinering, spredning og overvåking.',
    'digital_network_concept',
    ['con_his_nettverk', 'con_his_digital', 'con_his_digital_mobilisering'],
    ['con_his_offentligheter'],
    'Å behandle en visualisert lenkestruktur som et sosialt eller politisk fellesskap uten å undersøke relasjonens betydning, varighet, botaktivitet og plattformens databegrensninger.',
    ['identifiserbare noder, forbindelser og plattform', 'dokumentert informasjons- eller koordineringsflyt', 'nettverksgrenser, varighet og kontrollmekanismer'],
    ['plattform- og nettverksdata med dokumentert innsamlingsmetode', 'kvalitative bruker- og organisasjonskilder som forklarer relasjonenes faktiske innhold']
  ),
  con_his_forening: C(
    'forening',
    'En forening er en medlemsbasert sammenslutning med vedtekter, møter, valgte roller, økonomi og et definert formål som organiserer deltakelse over tid.',
    'voluntary_association_concept',
    ['con_his_foreninger', 'con_his_organisasjon', 'con_his_organisasjonssamfunn'],
    ['con_his_nettverk'],
    'Å slutte fra vedtekter og styreliste til aktivt medlemsliv uten å undersøke oppmøte, økonomi, aktivitet, medlemsutskifting og uformell makt.',
    ['vedtekter, medlemskap og valgte roller', 'møter, økonomi og dokumentert aktivitet', 'kontinuitet eller oppløsning over tid'],
    ['foreningsprotokoller, medlemslister, regnskap og korrespondanse', 'lokal presse og medlemskilder som viser faktisk aktivitet og representativitet']
  ),
  con_his_foreninger: C(
    'foreningslandskap',
    'Foreningslandskap er den historiske helheten av lokale og nasjonale foreninger, overlappende medlemskap, møteplasser og samarbeids- eller konkurranseforhold i et samfunn.',
    'associational_ecology_concept',
    ['con_his_forening', 'con_his_organisasjonssamfunn', 'con_his_nettverk'],
    ['con_his_organisasjon'],
    'Å telle registrerte foreninger som direkte mål på deltakelse uten å undersøke størrelse, aktivitet, levetid, sosiale grenser og overlappende medlemskap.',
    ['flere samtidige medlemsorganisasjoner', 'overlappende medlemskap og møteplasser', 'samarbeid, konkurranse og organisatorisk tetthet'],
    ['foreningsregistre, medlemslister og møtearkiv', 'befolknings-, presse- og lokale kilder som viser sosial rekkevidde og aktivitet']
  ),
  con_his_handling: C(
    'politisk handling',
    'Politisk handling er målrettet praksis som søker å påvirke beslutninger, normer, maktforhold eller offentlig oppmerksomhet, individuelt eller kollektivt og gjennom institusjonelle eller utenomparlamentariske kanaler.',
    'political_action_concept',
    ['con_his_kollektiv_handling', 'con_his_protest', 'con_his_partier'],
    ['con_his_kommunikasjon'],
    'Å lese enhver offentlig ytring som politisk handling uten å dokumentere mål, adressat, arena, strategi eller forbindelse til beslutning og mobilisering.',
    ['uttalt eller dokumenterbart politisk mål', 'identifisert adressat eller maktarena', 'handling, ressursbruk og respons'],
    ['samtidige ytringer, møte-, kampanje- eller myndighetskilder', 'aktør- og mottakskilder som viser hensikt, gjennomføring og virkning']
  ),
  con_his_internasjonalisme: C(
    'internasjonalisme',
    'Internasjonalisme er ideer og organisasjonspraksiser som bygger politisk solidaritet og samarbeid på tvers av stater gjennom felles sak, klasse, religion, fred, rettigheter eller antikolonial kamp.',
    'internationalism_concept',
    ['con_his_solidaritet', 'con_his_solidaritetsbevegelser', 'con_his_nettverk'],
    ['con_his_solidaritetsbevegelser'],
    'Å bruke internasjonalisme som synonym for enhver utenlandsk kontakt uten å dokumentere gjensidighet, felles program, organisatorisk forbindelse og forholdet til nasjonale interesser.',
    ['grensekryssende program eller identitet', 'varige organisatoriske eller kommunikative forbindelser', 'felles kampanje, ressursutveksling eller representasjon'],
    ['internasjonale organisasjons-, kongress- og korrespondansearkiv', 'nasjonale og lokale kilder som viser oversettelse, konflikt og faktisk samarbeid']
  ),
  con_his_kollektiv: C(
    'kollektiv aktør',
    'En kollektiv aktør er en gruppe som gjennom identitet, organisering, beslutningspraksis og representasjon kan opptre samordnet i en bestemt sak, uten at alle medlemmer nødvendigvis er enige.',
    'collective_actor_concept',
    ['con_his_kollektiv_handling', 'con_his_organisasjon', 'con_his_bevegelser'],
    ['con_his_forening'],
    'Å omtale en klasse, befolkning eller bevegelse som kollektiv aktør uten å dokumentere hvem som besluttet, talte, deltok og ble ekskludert.',
    ['felles identitet eller krav', 'koordinerende struktur eller beslutningspraksis', 'representanter, deltakere og avgrensning'],
    ['møte-, medlems-, kampanje- og beslutningskilder', 'interne konflikt- og medlemskilder som viser representasjon og uenighet']
  ),
  con_his_kollektiv_handling: C(
    'kollektiv handling',
    'Kollektiv handling er samordnet aktivitet der flere aktører bidrar med tid, risiko, ressurser eller synlighet for å oppnå et felles mål eller forsvare en felles ordning.',
    'collective_action_concept',
    ['con_his_kollektiv', 'con_his_protest', 'con_his_mobiliseringsformer'],
    ['con_his_handling'],
    'Å likestille samtidig individuell atferd med kollektiv handling uten å dokumentere koordinering, felles mål, gjensidig forventning eller organisatorisk forbindelse.',
    ['flere deltakere med felles mål', 'koordinering eller gjensidig forventning', 'delt ressurs, risiko eller handlingsforløp'],
    ['aksjons-, møte-, kommunikasjons- og organisasjonskilder', 'deltaker- og observatørkilder som viser koordinering, frafall og resultat']
  ),
  con_his_kvinne: C(
    'kvinnemobilisering',
    'Kvinnemobilisering er organisert politisk og sosial handling der kvinner formulerer krav eller bygger institusjoner med utgangspunkt i kjønnede rettigheter, arbeid, familie, kropp og offentlig deltakelse.',
    'women_mobilization_concept',
    ['con_his_kvinnebevegelse', 'con_his_borgerrettigheter', 'con_his_foreninger'],
    ['con_his_kvinnebevegelse'],
    'Å bruke kvinner som én samlet aktør uten å undersøke klasse, religion, etnisitet, familieposisjon, organisasjon og hvilke kvinner som faktisk hadde talerett.',
    ['kjønnsspesifikke krav eller organisering', 'kvinner som dokumenterte initiativtakere og deltakere', 'mobiliseringsarena, strategi og motpart'],
    ['kvinneforenings-, møte-, presse- og kampanjearkiv', 'medlems- og personkilder som viser sosial sammensetning, konflikt og eksklusjon']
  ),
  con_his_lekmanns: C(
    'lekmannsbevegelse',
    'Lekmannsbevegelse er religiøs mobilisering der personer uten ordinert embete organiserer forkynnelse, møter, misjon, presse og lokalsamfunn utenfor eller i spenning med etablerte kirkelige hierarkier.',
    'lay_religious_movement_concept',
    ['con_his_foreninger', 'con_his_motkultur', 'con_his_sprak'],
    ['con_his_motkulturelle'],
    'Å behandle all frivillig religiøs aktivitet som lekmannsbevegelse uten å dokumentere forholdet til embete, kirkelig autoritet, organisasjon og lokal praksis.',
    ['lek forkynnelse eller møteledelse', 'egne foreninger, husmøter, misjon eller presse', 'dokumentert forhold til kirkelig autoritet'],
    ['menighets-, forenings-, møte- og misjonsarkiv', 'lokale presse- og personkilder som viser praksis, konflikt og sosial rekkevidde']
  ),
  con_his_mobiliseringsformer: C(
    'mobiliseringsformer',
    'Mobiliseringsformer er historisk tilgjengelige måter å rekruttere, koordinere og aktivere deltakere på, som møter, medlemskap, underskrifter, streik, demonstrasjon, boikott og digitale kampanjer.',
    'mobilization_form_concept',
    ['con_his_kollektiv_handling', 'con_his_protestrepertoar', 'con_his_digital_mobilisering'],
    ['con_his_repertoarer'],
    'Å liste aksjonstyper uten å undersøke hvem som kunne bruke dem, hvilke ressurser de krevde, hvordan de ble lært og hvordan myndigheter eller medier reagerte.',
    ['rekrutterings- og koordineringsmekanisme', 'deltakerkrav, ressurs og risiko', 'arena, kommunikasjon og respons'],
    ['organisasjons-, kampanje-, politi- og mediekilder', 'deltakerkilder som viser læring, tilpasning og faktisk bruk']
  ),
  con_his_motkultur: C(
    'motkultur',
    'Motkultur er et varig miljø som utfordrer dominerende språk, religion, moral, livsstil eller politisk autoritet gjennom egne organisasjoner, medier, ritualer og møteplasser.',
    'counterculture_concept',
    ['con_his_motkulturelle', 'con_his_lekmanns', 'con_his_offentligheter'],
    ['con_his_protest'],
    'Å kalle enhver avvikende stil eller mening motkultur uten å dokumentere kollektiv identitet, egne institusjoner, sosial reproduksjon og et forhold til dominerende kultur.',
    ['egen norm, identitet eller språkpraksis', 'organisasjoner, medier, ritualer eller møteplasser', 'vedvarende konflikt eller avstand til dominerende institusjoner'],
    ['organisasjons-, presse-, skole-, religions- og kulturkilder', 'medlems- og lokalsamfunnskilder som viser varighet, grenser og intern variasjon']
  ),
  con_his_motkulturelle: C(
    'motkulturelle bevegelser',
    'Motkulturelle bevegelser er organiserte strømninger som kombinerer kulturell forskjell med kollektiv mobilisering, eksempelvis gjennom språk, lekmannsreligion, avhold, ungdomskultur eller alternative livsformer.',
    'countercultural_movement_concept',
    ['con_his_motkultur', 'con_his_bevegelser', 'con_his_lekmanns'],
    ['con_his_motkultur'],
    'Å slå svært ulike språk-, religions- og livsstilsbevegelser sammen som én motkulturell blokk uten å dokumentere felles nettverk, motpart eller politisk prosjekt.',
    ['organisert kulturelt alternativ', 'kollektiv identitet, nettverk og møteplasser', 'mobilisering mot en dominerende norm eller institusjon'],
    ['sammenlignbare bevegelses-, presse- og organisasjonsarkiv', 'lokale og deltakende kilder som viser ulikhet, samarbeid og konflikt']
  ),
  con_his_motmakt: C(
    'motmakt',
    'Motmakt er kapasiteten organiserte grupper bygger for å overvåke, utfordre, begrense eller omfordele etablert makt gjennom kunnskap, mobilisering, alternative institusjoner og kollektiv sanksjon.',
    'counterpower_concept',
    ['con_his_kollektiv_handling', 'con_his_offentligheter', 'con_his_digital_mobilisering'],
    ['con_his_protest'],
    'Å kalle enhver kritisk ytring motmakt uten å dokumentere varig kapasitet, ressurser, organisering og faktisk mulighet til å påvirke eller begrense en maktaktør.',
    ['egen organisatorisk eller kunnskapsmessig kapasitet', 'identifisert maktrelasjon og utfordringsstrategi', 'dokumentert påvirkning, kontroll eller kostnad for motparten'],
    ['organisasjons-, kampanje-, medie- og beslutningskilder', 'motparts- og resultatkilder som viser faktisk kapasitet og begrensninger']
  ),
  con_his_offentligheter: C(
    'offentligheter',
    'Offentligheter er flere delvis overlappende kommunikasjonsrom der bestemte grupper kan formulere saker, bygge publikum og påvirke autoritet gjennom ulike medier, språk og adgangsvilkår.',
    'plural_publics_concept',
    ['con_his_offentlighet', 'con_his_digital', 'con_his_presse'],
    ['con_his_offentlighet'],
    'Å bruke flertallsformen som om alle grupper hadde egne likeverdige arenaer uten å undersøke ressurser, sensur, språk, kjønn, klasse og forbindelsen til beslutningsmakt.',
    ['avgrenset publikum, arena og kommunikasjonsform', 'egne saker, normer eller representanter', 'forbindelser og maktforskjeller mellom offentligheter'],
    ['presse-, møte-, organisasjons- og mediearkiv', 'publikums- og adgangskilder som viser sosial rekkevidde, eksklusjon og gjennomslag']
  ),
  con_his_organisasjon: C(
    'organisasjon',
    'En organisasjon er en varig samordningsstruktur med formål, medlems- eller personellgrenser, roller, beslutningsregler, ressurser og dokumenterbar aktivitet.',
    'organization_concept',
    ['con_his_forening', 'con_his_partier', 'con_his_kollektiv'],
    ['con_his_nettverk'],
    'Å slutte fra navn eller registrering til en fungerende organisasjon uten å undersøke aktivitet, beslutninger, økonomi, medlemskap og faktisk kontinuitet.',
    ['definert formål og grenser', 'roller, beslutningsregler og ressurser', 'dokumentert aktivitet og kontinuitet'],
    ['vedtekter, protokoller, medlems- eller personellister og regnskap', 'eksterne og medlemsbaserte kilder som viser praksis, konflikt og rekkevidde']
  ),
  con_his_organisasjonssamfunn: C(
    'organisasjonssamfunn',
    'Organisasjonssamfunn er en historisk samfunnsform der foreninger, partier, fagorganisasjoner og interessegrupper blir sentrale mellomledd mellom individer, lokalsamfunn og offentlige myndigheter.',
    'organized_society_concept',
    ['con_his_foreninger', 'con_his_organisasjon', 'con_his_partier'],
    ['con_his_offentligheter'],
    'Å måle organisasjonssamfunn bare i antall organisasjoner uten å undersøke medlemsandel, varighet, forhandlingsadgang, sosial skjevhet og forholdet til staten.',
    ['høy og varig organisasjonstetthet', 'representasjon og forhandling gjennom organisasjoner', 'institusjonelle forbindelser til myndigheter og partier'],
    ['organisasjonsregistre, medlemsstatistikk, korporative og politiske arkiv', 'befolknings- og gruppebaserte kilder som viser deltakelse, skjevhet og uorganiserte interesser']
  ),
  con_his_partier: C(
    'politiske partier',
    'Politiske partier er organisasjoner som samler politiske programmer, rekrutterer kandidater, mobiliserer velgere og søker varig innflytelse over representative institusjoner og offentlig politikk.',
    'political_party_concept',
    ['con_his_organisasjon', 'con_his_offentlighet', 'con_his_kollektiv_handling'],
    ['con_his_bevegelser'],
    'Å behandle valgresultat eller partiprogram som direkte uttrykk for medlemmenes og velgernes interesser uten å undersøke nominasjon, organisasjon, fraksjoner og lokal praksis.',
    ['vedtekter, medlemskap og kandidatnominasjon', 'program, valgkamp og parlamentarisk aktivitet', 'lokale og nasjonale organisasjonsledd'],
    ['parti-, valg-, presse- og representasjonsarkiv', 'medlems-, velger- og lokallagskilder som viser intern konflikt og faktisk mobilisering']
  ),
  con_his_presse: C(
    'presse',
    'Presse er periodisk redigert offentlig kommunikasjon produsert gjennom bestemte eierskap, redaksjoner, distribusjonssystemer, sjangre og politiske eller kommersielle relasjoner.',
    'press_institution_concept',
    ['con_his_offentlighet', 'con_his_kommunikasjon', 'con_his_partier'],
    ['con_his_digital'],
    'Å bruke avisinnhold som direkte mål på opinion eller hendelser uten å undersøke eierskap, redaksjonell linje, kildetilgang, opplag, distribusjon og polemisk sjanger.',
    ['redaksjon, utgiver og periodisitet', 'produksjon, distribusjon og dokumentert publikum', 'sjanger, politisk tilknytning eller kommersiell modell'],
    ['originale aviser, redaksjons-, eier- og distribusjonsarkiv', 'leser-, opplags- og konkurrerende mediekilder som viser rekkevidde og mottak']
  ),
  con_his_protest: C(
    'protest',
    'Protest er offentlig uttrykt motstand mot en beslutning, norm eller maktaktør gjennom ytring, demonstrasjon, streik, boikott, okkupasjon eller andre kollektive handlingsformer.',
    'protest_action_concept',
    ['con_his_kollektiv_handling', 'con_his_protestrepertoar', 'con_his_motmakt'],
    ['con_his_handling'],
    'Å klassifisere enhver konflikt eller misnøye som protest uten å dokumentere offentlig adressat, krav, handlingsform, deltakere og reaksjon.',
    ['uttalt krav eller motstand', 'offentlig eller kollektiv handlingsform', 'identifisert adressat, arena og respons'],
    ['aksjons-, politi-, organisasjons- og mediekilder', 'deltaker- og motpartskilder som viser krav, omfang, represjon og utfall']
  ),
  con_his_protestrepertoar: C(
    'protestrepertoar',
    'Protestrepertoar er det begrensede settet av kjente og tilgjengelige aksjonsformer en gruppe kan velge mellom i en bestemt historisk situasjon.',
    'contentious_repertoire_concept',
    ['con_his_protest', 'con_his_repertoarer', 'con_his_mobiliseringsformer'],
    ['con_his_kollektiv_handling'],
    'Å lage en tidløs liste over protestformer uten å undersøke hvordan aktører lærte dem, hvilke ressurser og risikoer de krevde, og hvilke former som var legitime eller mulige.',
    ['gjentatte og gjenkjennelige aksjonsformer', 'historisk tilgjengelighet og læring', 'forhold til myndighetsrespons, ressurser og risiko'],
    ['serier av aksjons-, politi-, presse- og organisasjonskilder', 'deltakerkilder som viser valg, innovasjon og avviste alternativer']
  ),
  con_his_repertoarer: C(
    'historiske handlingsrepertoarer',
    'Historiske handlingsrepertoarer er skiftende kombinasjoner av etablerte og nye mobiliseringsformer som grupper bruker på tvers av saker, steder og perioder.',
    'historical_action_repertoires_concept',
    ['con_his_protestrepertoar', 'con_his_mobiliseringsformer', 'con_his_digital_mobilisering'],
    ['con_his_protestrepertoar'],
    'Å forklare endrede repertoarer bare med teknologi eller idéspredning uten å undersøke organisasjonskontinuitet, statlig regulering, medielogikk og tidligere erfaring.',
    ['sammenlignbare mønstre av handlingsformer over tid', 'introduksjon, videreføring og bortfall av former', 'overføring mellom grupper, saker eller steder'],
    ['lange serier av bevegelses-, politi-, presse- og kampanjekilder', 'organisasjons- og deltakerkilder som dokumenterer læring, lån og strategisk endring']
  ),
  con_his_solidaritet: C(
    'solidaritet',
    'Solidaritet er en praktisert forpliktelse til gjensidig støtte eller felles handling på tvers av individuelle interesser, basert på opplevd fellesskap, rettferdighet eller politisk ansvar.',
    'solidarity_concept',
    ['con_his_solidaritetsbevegelser', 'con_his_internasjonalisme', 'con_his_kollektiv_handling'],
    ['con_his_antirasisme'],
    'Å slutte fra sympatierklæringer til solidaritet uten å dokumentere ressursdeling, risiko, gjensidighet, vedvarende handling og hvem som definerte saken.',
    ['uttalt forpliktelse og identifisert mottaker', 'ressurs, risiko eller konkret støttehandling', 'gjensidighet, varighet eller felles organisering'],
    ['kampanje-, innsamlings-, møte- og korrespondansekilder', 'kilder fra mottakere og deltakere som viser maktforhold, gjensidighet og faktisk støtte']
  ),
  con_his_solidaritetsbevegelser: C(
    'solidaritetsbevegelser',
    'Solidaritetsbevegelser er organiserte nettverk som mobiliserer støtte til andre gruppers kamp gjennom informasjon, økonomiske bidrag, boikott, politisk press og transnasjonale forbindelser.',
    'solidarity_movement_concept',
    ['con_his_solidaritet', 'con_his_internasjonalisme', 'con_his_antirasisme'],
    ['con_his_borgerrettighetskamp'],
    'Å framstille solidaritetsbevegelser som talerør for mottakergrupper uten å undersøke representasjon, prioriteringer, ressursmakt og om støtten var ønsket eller gjensidig.',
    ['organisert støtte til en ekstern eller transnasjonal sak', 'kampanje, ressursmobilisering eller politisk press', 'dokumentert forbindelse til mottakergruppen'],
    ['bevegelses-, kampanje-, innsamlings- og korrespondansearkiv', 'mottaker- og partnerkilder som viser representasjon, gjensidighet og virkning']
  ),
  con_his_sosiale: C(
    'nye sosiale bevegelser',
    'Nye sosiale bevegelser er mobiliseringer som særlig organiserer identitet, miljø, livsform, kjønn, fred eller rettigheter gjennom fleksible nettverk og kulturelle så vel som institusjonelle endringskrav.',
    'new_social_movements_concept',
    ['con_his_bevegelser', 'con_his_miljobevegelse', 'con_his_motkulturelle'],
    ['con_his_arbeiderbevegelse'],
    'Å bruke ny som en absolutt tids- eller verdidom og overse eldre forløpere, klasseinteresser, formelle organisasjoner og forbindelser til partier og fagbevegelse.',
    ['identitets-, miljø-, freds- eller livsformbaserte krav', 'nettverksorganisering og kulturelle handlingsformer', 'forbindelse mellom hverdagspraksis og politisk endring'],
    ['bevegelses-, kampanje-, medie- og organisasjonsarkiv', 'deltaker- og sammenligningskilder som viser kontinuitet, nyhet og sosial sammensetning']
  )
};

const concepts = readJson(conceptPath);
const conceptById = new Map(concepts.map((item) => [item.concept_id, item]));
const curatedConceptIndex = [];
for (const [id, spec] of Object.entries(conceptSpecs)) {
  const current = conceptById.get(id);
  if (!current) throw new Error(`Missing concept ${id}`);
  const previousLabel = current.label;
  Object.assign(current, spec);
  curatedConceptIndex.push({ concept_id: id, previous_label: previousLabel, label: current.label, concept_type: current.concept_type });
}
writeJson(conceptPath, concepts);

const theorySpecs = {
  theory_his_offentlighet_mobilisering_presse_offentlighet_og_politisk_kommunikasjon: {
    definition: 'Forklarer politisk offentlighet gjennom forholdet mellom presseøkonomi, redaksjonelle miljøer, distribusjon, organisasjonstilknytning, lesergrupper og adgang til å sette saker på dagsordenen.',
    limitations: [
      'Publisert innhold dokumenterer redaksjonell kommunikasjon, ikke automatisk publikums oppfatning eller representativ opinion.',
      'Opplag og geografisk distribusjon må skilles fra faktisk lesing, høytlesning, gjenbruk og sosial rekkevidde.',
      'En dominerende presse kan sameksistere med lokale, muntlige og organisatoriske offentligheter som etterlater andre kildetyper.'
    ]
  },
  theory_his_offentlighet_mobilisering_foreninger_partier_og_organisasjonssamfunn: {
    definition: 'Analyserer hvordan medlemsforeninger, partier og interesseorganisasjoner bygde varige mellomledd mellom innbyggere og myndigheter gjennom medlemskap, representasjon, møtepraksis, økonomi og forhandlingsadgang.',
    limitations: [
      'Antall registrerte organisasjoner er ikke et mål på aktiv deltakelse uten medlems-, møte- og aktivitetsdata.',
      'Organisasjonsrepresentasjon kan skjule uorganiserte grupper, interne mindretall og sosialt skjev rekruttering.',
      'Formell adgang til myndigheter må skilles fra faktisk innflytelse over dagsorden, beslutning og gjennomføring.'
    ]
  },
  theory_his_offentlighet_mobilisering_protest_kollektiv_handling_og_repertoarer: {
    definition: 'Forklarer protest gjennom kollektiv organisering, politiske muligheter, tilgjengelige handlingsrepertoarer, ressurser, risiko og myndighetsrespons, med vekt på hvordan aksjonsformer læres og endres.',
    limitations: [
      'Synlige protesthendelser overrepresenteres i politi og presse og må kobles til forarbeid, organisasjon og mindre synlig deltakelse.',
      'Lik aksjonsform kan ha forskjellig betydning etter aktør, krav, arena og historisk situasjon.',
      'Myndighetsreaksjon og politisk utfall kan ikke tilskrives protesten alene uten alternative forklaringer og tidsforløp.'
    ]
  },
  theory_his_offentlighet_mobilisering_arbeider_kvinne_og_avholdsbevegelser: {
    definition: 'Sammenligner arbeider-, kvinne- og avholdsbevegelser gjennom medlemsgrunnlag, folkedannelse, moralske og materielle krav, organisatoriske ressurser og forbindelser til parti, kirke, familie og lokalsamfunn.',
    limitations: [
      'Bevegelsene kan ikke behandles som separate blokker fordi medlemskap, familie, presse og lokale møteplasser ofte overlappet.',
      'Nasjonale ledelser og programmer må kontrolleres mot lokale lag, kjønnede roller og faktisk medlemsaktivitet.',
      'Lik organisasjonsform betyr ikke likt mål eller maktforhold; reform, klassekamp og moralsk regulering må analyseres særskilt.'
    ]
  },
  theory_his_offentlighet_mobilisering_lekmanns_sprak_og_motkulturelle_bevegelser: {
    definition: 'Analyserer lekmanns-, språk- og motkulturelle bevegelser som bygging av alternative autoriteter gjennom egne møter, skoler, presse, ritualer, organisasjoner og regionale identiteter.',
    limitations: [
      'Motkultur må dokumenteres som varige miljøer og institusjoner, ikke bare som avvikende mening eller stil.',
      'Språk og religion kan både mobilisere og ekskludere; intern sosial, geografisk og teologisk variasjon må vises.',
      'Senere nasjonale fortellinger kan gjøre lokale og konfliktfylte bevegelsesforløp mer enhetlige enn samtidige kilder tillater.'
    ]
  },
  theory_his_offentlighet_mobilisering_borgerrettigheter_solidaritet_og_internasjonalisme: {
    definition: 'Forklarer rettighets- og solidaritetsmobilisering gjennom koblingen mellom juridiske krav, moralsk argumentasjon, transnasjonale nettverk, ressursutveksling og nasjonal politisk oversettelse.',
    limitations: [
      'Formell rettighetsendring dokumenterer ikke lik håndheving eller sosial adgang og må følges i praksis.',
      'Solidaritet kan være asymmetrisk; representasjon og mottakergruppens egne prioriteringer må undersøkes.',
      'Internasjonale ideer og modeller får ulik betydning når de oversettes til nasjonale institusjoner, språk og konflikter.'
    ]
  },
  theory_his_offentlighet_mobilisering_miljobevegelse_og_nye_sosiale_bevegelser: {
    definition: 'Analyserer miljøbevegelse og nye sosiale bevegelser gjennom ekspertkunnskap, stedstilknytning, identitet, nettverksorganisering, direkte aksjon og institusjonell påvirkning på tvers av hverdag og politikk.',
    limitations: [
      'Betegnelsen ny må prøves mot eldre naturvern, folkelig organisering og kontinuitet i aktører og repertoarer.',
      'Miljøargumenter kan romme ulike interesser og fordelingsvirkninger og kan ikke behandles som én felles vitenskapelig posisjon.',
      'Løse nettverk kan være mobiliseringssterke i enkeltsaker uten å være varige eller representere alle berørte grupper.'
    ]
  },
  theory_his_offentlighet_mobilisering_digital_mobilisering_overvakning_og_motmakt: {
    definition: 'Forklarer digital mobilisering som et maktforhold mellom aktivisters nettverk, plattformenes synlighets- og datalogikk, myndigheters og selskapers overvåking samt bevegelsers forsøk på å bygge motmakt.',
    limitations: [
      'Digitale spor er plattformproduserte og kan ikke behandles som fullstendige data om deltakere, intensjon eller sosial rekkevidde.',
      'Høy synlighet eller viralitet dokumenterer ikke organisatorisk kapasitet, varighet eller politisk gjennomslag.',
      'Overvåking må påvises gjennom konkrete tekniske, juridiske og institusjonelle mekanismer, ikke bare gjennom generell mulighet.'
    ]
  },
  theory_his_offentlighet_mobilisering_borgerrettighetskamp_antirasisme_og_solidaritetsbevegelser: {
    definition: 'Analyserer borgerrettighetskamp, antirasisme og solidaritetsbevegelser gjennom forholdet mellom berørte gruppers egenorganisering, allianser, juridiske strategier, offentlig vitnesbyrd, protest og institusjonell motstand.',
    limitations: [
      'Allierte organisasjoner må ikke erstatte berørte gruppers egne stemmer, prioriteringer og lederskap i analysen.',
      'Moralsk språk og symbolske markeringer må skilles fra ressursdeling, risiko og varig endring i institusjoner.',
      'Bevegelsens seier kan ikke måles bare i lovendring; håndheving, motmobilisering og langsiktige ulikheter må følges.'
    ]
  },
  theory_his_offentlighet_mobilisering_digitale_offentligheter_nettverk_og_nye_mobiliseringsformer: {
    definition: 'Analyserer digitale offentligheter som hybride nettverk der plattformer, organisasjoner, influensere, medier og fysiske møteplasser sammen skaper nye hastigheter, skalaer og mobiliseringsformer.',
    limitations: [
      'Nettverkskart viser forbindelser i et avgrenset datasett, ikke nødvendigvis sosial tilhørighet, makt eller faktisk koordinering.',
      'Nye digitale former viderefører ofte eldre organisasjoner og repertoarer; teknologisk nyhet må skilles fra organisatorisk kontinuitet.',
      'Plattformendringer, sletting og manglende arkivering gjør historiske sammenligninger sårbare og krever eksplisitt dataproveniens.'
    ]
  }
};

const theories = readJson(theoryPath);
const theoryById = new Map(theories.map((item) => [item.theory_id, item]));
for (const [id, spec] of Object.entries(theorySpecs)) {
  const current = theoryById.get(id);
  if (!current) throw new Error(`Missing theory ${id}`);
  Object.assign(current, spec, { status: 'canonical_v5_5_curated', evidence_ready: false });
}
writeJson(theoryPath, theories);

const run = (name, command, args) => {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  const output = `$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`;
  fs.writeFileSync(path.join(reportDir, name), output);
  process.stdout.write(output);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
};

run('offentlighet-mobilisering-bevegelser-domain-validation.log', process.execPath, ['tools/validate-historie-domain.mjs', domainId]);
run('offentlighet-mobilisering-bevegelser-v5-validation.log', process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
run('offentlighet-mobilisering-bevegelser-quiz-context.log', 'npm', ['run', 'quiz:context']);
run('offentlighet-mobilisering-bevegelser-knowledge-canonical.log', 'npm', ['run', 'knowledge:canonical:write']);
run('offentlighet-mobilisering-bevegelser-quiz-production-context-audit.log', 'npm', ['run', 'audit:quiz-production-context']);
run('offentlighet-mobilisering-bevegelser-quiz-progression-audit.log', 'npm', ['run', 'audit:quiz-progression']);
run('offentlighet-mobilisering-bevegelser-quiz-theory-binding-audit.log', 'npm', ['run', 'audit:quiz-theory-binding']);
run('offentlighet-mobilisering-bevegelser-quiz-production-test.log', 'npm', ['run', 'test:quiz-production']);

const readiness = readJson(path.join(reportDir, 'historie-v5-5-readiness.json'));
const domain = readiness.domains.find((item) => item.domain_id === domainId);
if (!domain?.freeze_ready) throw new Error(`${domainId} did not become freeze_ready: ${JSON.stringify(domain)}`);
const index = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  curated_concepts: curatedConceptIndex,
  curated_theory_ids: Object.keys(theorySpecs)
};
writeJson(path.join(reportDir, 'offentlighet-mobilisering-bevegelser-curation-index.json'), index);
const summary = {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  curated_concept_ids: Object.keys(conceptSpecs),
  curated_theory_ids: Object.keys(theorySpecs),
  domain_readiness: domain,
  global_status: readiness.status,
  v6_allowed: readiness.v6_allowed,
  quality_issue_totals: readiness.quality_issue_totals,
  next_gate: 'Continue individual curation of the remaining V5.5 domains before global freeze and V6 activation.'
};
writeJson(path.join(reportDir, 'offentlighet-mobilisering-bevegelser-curation-readiness.json'), summary);
fs.rmSync(targetInventoryPath, { force: true });
console.log(JSON.stringify(summary, null, 2));
