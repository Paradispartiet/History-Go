#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  completeness: 'reports/fagverk/film-tv-curriculum-completeness-v1.json',
  classification: 'reports/fagverk/film-tv-legacy-emne-classification-v1.json',
  status: 'data/fagverk/subject_status.json',
  inventory: 'data/fag/TV_og_Film/film_tv_variable_inventory_v1.json',
  report: 'reports/fagverk/film-tv-variable-inventory-v1-audit.json'
});

const EVIDENCE = Object.freeze([
  {
    id: 'film-tv-legacy-classification-v1',
    authority: 'History-Go canonical migration audit',
    location: P.classification,
    supports: ['legacy_aliases', 'keep_merge_move_split_retire_decisions', 'successor_concepts', 'domain_ownership', 'boundary_rationales']
  },
  {
    id: 'qaa-2024-subject-benchmark',
    authority: 'Quality Assurance Agency for Higher Education',
    location: 'https://www.qaa.ac.uk/docs/qaa/sbs/sbs-communication-media-film-and-cultural-studies-24.pdf',
    supports: ['historical_context', 'global_context', 'representation_and_power', 'accessibility', 'production', 'emerging_technology', 'sustainability', 'research_methods']
  },
  {
    id: 'ntnu-filmvitenskap-2026-program',
    authority: 'NTNU',
    location: 'https://www.ntnu.no/studier/bfv',
    supports: ['film_elements', 'narratology', 'norwegian_and_global_history', 'film_in_society', 'documentary', 'film_experience', 'film_tv_industries']
  },
  {
    id: 'ntnu-filmvitenskap-2026-structure',
    authority: 'NTNU',
    location: 'https://www.ntnu.no/studier/bfv/studiets-oppbygning',
    supports: ['film_narrative', 'film_history', 'nordic_film_tv', 'documentary', 'film_tv_industries', 'film_experience']
  },
  {
    id: 'uio-audiovisual-aesthetics',
    authority: 'Universitetet i Oslo',
    location: 'https://www.uio.no/studier/emner/hf/imk/MEVIT1110/',
    supports: ['audiovisual_form', 'style', 'narrative', 'genre', 'film_and_tv_series']
  },
  {
    id: 'unesco-documentary-heritage-2015',
    authority: 'UNESCO',
    location: 'https://www.unesco.org/en/legal-affairs/recommendation-concerning-preservation-and-access-documentary-heritage-including-digital-form',
    supports: ['analogue_and_digital_preservation', 'metadata', 'access', 'authenticity', 'rights', 'at_risk_heritage', 'community_and_global_memory']
  },
  {
    id: 'nfi-sustainable-film-production',
    authority: 'Norsk filminstitutt',
    location: 'https://www.nfi.no/arrangementer/kurs-i-baerekraftig-filmproduksjon',
    supports: ['sustainable_production', 'production_strategy', 'professional_practice']
  },
  {
    id: 'ebu-public-service-media',
    authority: 'European Broadcasting Union',
    location: 'https://www.ebu.ch/about/public-service-media',
    supports: ['broadcast_history', 'public_service', 'television_institutions', 'democracy', 'technology']
  },
  {
    id: 'ebu-ai-forum-2026',
    authority: 'European Broadcasting Union',
    location: 'https://www.ebu.ch/events/ai-forum',
    supports: ['responsible_ai', 'governance', 'public_media', 'production_workflows']
  }
]);

const QAA = 'qaa-2024-subject-benchmark';
const NTNU = 'ntnu-filmvitenskap-2026-program';
const NTNU_STRUCTURE = 'ntnu-filmvitenskap-2026-structure';
const UIO = 'uio-audiovisual-aesthetics';
const UNESCO = 'unesco-documentary-heritage-2015';
const NFI = 'nfi-sustainable-film-production';
const EBU = 'ebu-public-service-media';
const EBU_AI = 'ebu-ai-forum-2026';

const D = Object.freeze({
  A: 'audiovisuell_form_stil_analyse',
  F: 'fortelling_sjanger_serialitet_format',
  H: 'film_tv_historie_historiografi',
  D: 'dokumentar_virkelighetsformer_etikk',
  S: 'samfunn_representasjon_identitet_makt',
  P: 'produksjon_arbeid_teknologi_praksis',
  I: 'industri_institusjoner_politikk_distribusjon',
  V: 'visning_publikum_resepsjon_deltakelse',
  L: 'sted_location_skjermgeografi',
  R: 'arkiv_kulturarv_minne_stjerner'
});

// These are editorial overlap decisions discovered only after the first 120-row
// classification. They prevent a renamed duplicate from becoming canonical.
const SECOND_ORDER_MERGES = Object.freeze({
  identitetsrepresentasjon_og_makt: 'representasjon_identitet_og_makt',
  rollefigur_og_fremstilling: 'karakter_rollefigur_og_fortellingsfunksjon',
  finansiering_og_produksjonssystem: 'finansiering_samproduksjon_og_produksjonssystemer',
  produksjonssystem_og_finansiering: 'finansiering_samproduksjon_og_produksjonssystemer',
  nasjonalt_produksjonssystem: 'finansiering_samproduksjon_og_produksjonssystemer',
  kringkastingsorganisasjon: 'kringkasting_institusjon_og_allmennoppdrag',
  distribusjon_tilgang_og_tilgjengelighet: 'distribusjon_tilgang_og_visningspolitikk',
  visningspolitikk_og_tilgangsstyring: 'distribusjon_tilgang_og_visningspolitikk',
  strommedistribusjon_og_marked: 'stromming_distribusjon_marked_og_forretningsmodeller',
  strommemarked_og_forretningsmodeller: 'stromming_distribusjon_marked_og_forretningsmodeller',
  kulturarv_programmering: 'cinematek_programmering_og_filmarv',
  filmstjerne_persona_og_myte: 'filmstjerne_persona_rolle_og_myte',
  stjernepersona_og_rolleforhandling: 'filmstjerne_persona_rolle_og_myte',
  nasjonal_film_tv_historie: 'nasjonale_film_tv_historier_og_sammenligning',
  tv_samtidighet_historie: 'direktesendt_samtidighet_som_tv_historie'
});

const INTEGRATIVE_CONCEPTS = new Set([
  'audiovisuell_form_og_stil',
  'fortellingsstruktur_og_narrasjon',
  'dokumentar_sannhet_og_evidens',
  'representasjon_identitet_og_makt',
  'audiovisuell_produksjonsprosess',
  'film_tv_okonomi_og_forretningsmodeller',
  'audiovisuell_publikumsopplevelse',
  'film_tv_geografi_og_romlig_sirkulasjon',
  'film_tv_arkiv_institusjoner_og_praksis'
]);

const g = (domainId, conceptId, title, definition, boundary, evidenceRefs, requiredSubcoverage = []) => Object.freeze({
  domain_id: domainId,
  concept_id: conceptId,
  title,
  definition,
  boundary,
  evidence_refs: evidenceRefs,
  required_subcoverage: requiredSubcoverage
});

// Gaps are semantic requirements, not a target count. A gap exists because the
// legacy successor set cannot own the stated problem; every entry names that
// independent problem and its boundary.
const GAP_EMNER = Object.freeze([
  g(D.A, 'mise_en_scene_og_bildekomposisjon', 'Mise-en-scène og bildekomposisjon', 'Undersøker hvordan scenografi, plassering, dybde, bevegelse og komposisjon organiserer det synlige rommet i film og TV.', 'Produksjonsdesign som arbeidsprosess eies av produksjonsområdet; her analyseres det ferdige bildets form.', [QAA, UIO]),
  g(D.A, 'utsnitt_linse_kamerabevegelse_og_blokkering', 'Utsnitt, linse, kamerabevegelse og blokkering', 'Skiller analytisk mellom bildeutsnitt, optisk perspektiv, kamerabevegelse og aktørers bevegelse foran kamera.', 'Kamerautstyr og opptaksrutiner er produksjonspraksis; dette emnet forklarer den synlige og sanselige virkningen.', [QAA, UIO]),
  g(D.A, 'lydform_dialog_musikk_effekt_og_stillhet', 'Lydform: dialog, musikk, effekt og stillhet', 'Analyserer hvordan stemme, romlyd, effekt, musikk og stillhet bygger perspektiv, rytme, rom og fortolkning.', 'Opptak, miks og lyddesign som arbeidsflyt eies av produksjonsområdet.', [QAA, UIO]),
  g(D.A, 'skuespillerprestasjon_kropp_stemme_og_blikk', 'Skuespillerprestasjon, kropp, stemme og blikk', 'Behandler framføring som audiovisuell form gjennom kropp, stemme, ansikt, timing, samspill og kameraavstand.', 'Stjernepersona eies av kulturarv/stjerneområdet, mens casting og arbeidsledelse eies av produksjon.', [QAA, UIO]),
  g(D.A, 'animasjon_bevegelse_design_og_tidsdannelse', 'Animasjon, bevegelse, design og tidsdannelse', 'Undersøker hvordan tegnede, modellerte og digitale bilder skaper bevegelse, rom, materialitet og tid uten fotografisk opptak som nødvendig grunnlag.', 'Animasjonens produksjonsløp og historie har egne eiere; her ligger den formelle analysen.', [QAA, NTNU]),
  g(D.A, 'digitale_bilder_vfx_og_syntetisk_realisme', 'Digitale bilder, VFX og syntetisk realisme', 'Analyserer hvordan compositing, visuelle effekter og syntetiske bilder etablerer troverdighet og synliggjør eller skjuler sin konstruksjon.', 'Verktøy, arbeidsvilkår og KI-styring eies av produksjonsområdet.', [QAA, EBU_AI]),
  g(D.A, 'bildeformat_skjermflate_og_audiovisuell_materialitet', 'Bildeformat, skjermflate og audiovisuell materialitet', 'Sammenholder sideforhold, oppløsning, bærer, skjermstørrelse og visningsflate som betingelser for form og erfaring.', 'Visningsrommets sosiale organisering eies av publikumsområdet; bevaring av bæreren eies av arkivområdet.', [QAA, UIO]),

  g(D.F, 'fortellingstid_rekkefolge_varighet_og_frekvens', 'Fortellingstid: rekkefølge, varighet og frekvens', 'Skiller hendelsenes tid fra framstillingens rekkefølge, varighet, gjentakelse og sprang i film, episode og serie.', 'Klipperytme er form; sendeskjema og seervane er publikumshistorie.', [NTNU, UIO]),
  g(D.F, 'fokalisering_synsvinkel_og_kunnskapsfordeling', 'Fokalisering, synsvinkel og kunnskapsfordeling', 'Undersøker hvem som ser, vet og hører hva, og hvordan informasjon fordeles mellom verk, rollefigurer og publikum.', 'Kameraperspektiv alene forklarer ikke narrativ kunnskap og eies derfor ikke av formområdet.', [NTNU, UIO]),
  g(D.F, 'adaptasjon_remake_og_intermedialitet', 'Adaptasjon, remake og intermedialitet', 'Behandler forflytning mellom litteratur, scene, film, TV og andre medier som nye form- og fortolkningsvalg, ikke som enkel troskap til et opphav.', 'Rettigheter eies av industri; sammenligning av fortellings- og formvalg eies her.', [QAA, NTNU]),
  g(D.F, 'franchise_univers_og_transmedial_fortelling', 'Franchise, univers og transmedial fortelling', 'Analyserer hvordan fortellinger, figurer og verdener fordeles mellom filmer, serier, korte formater og andre plattformer.', 'Eierskap og marked eies av industriområdet; her ligger fortellingsorganiseringen.', [QAA, NTNU]),
  g(D.F, 'direkte_underholdning_konkurranse_og_formatlogikk', 'Direkteunderholdning, konkurranse og formatlogikk', 'Skiller gameshow, talentformat, talkshow og direktesendt underholdning gjennom regler, gjentakelse, programlederrolle og publikumsdeltakelse.', 'Realitys sannhetskrav eies av dokumentarområdet; flerkameraproduksjon eies av produksjon.', [QAA, NTNU_STRUCTURE, EBU]),
  g(D.F, 'sjangerhistorie_hybridisering_og_revisjon', 'Sjangerhistorie, hybridisering og revisjon', 'Undersøker hvordan sjangerkonvensjoner endres, blandes, siteres og revideres historisk på tvers av film og TV.', 'Enkeltgenrer kan være case, men inventaret skal ikke vokse gjennom én obligatorisk boks per sjanger.', [NTNU, UIO]),

  g(D.H, 'historiografi_periodisering_og_kildekritikk', 'Historiografi, periodisering og kildekritikk', 'Undersøker hvordan film- og TV-historie konstrueres gjennom perioder, kilder, fravær, kanonvalg og konkurrerende forklaringer.', 'Arkivforvaltning eies av arkivområdet; historisk bruk og kritikk av arkivkilder eies her.', [QAA, NTNU, UNESCO]),
  g(D.H, 'tidlig_film_attraksjoner_og_visningskultur', 'Tidlig film, attraksjoner og visningskultur', 'Behandler levende bilders tidlige teknologier, korte former, omreisende visning og publikumspraksiser før den klassiske spillefilmen.', 'Kinoarkitektur som varig visningsform eies av publikumsområdet.', [NTNU, NTNU_STRUCTURE]),
  g(D.H, 'stumfilm_lydovergang_og_modernitet', 'Stumfilm, lydovergang og modernitet', 'Undersøker stumfilmens uttrykk, akkompagnement, produksjon og overgang til synkronisert lyd i ulike nasjonale forløp.', 'Lydens generelle formspråk eies av formanalyse.', [NTNU]),
  g(D.H, 'klassisk_film_studiosystem_og_sjangerindustri', 'Klassisk film, studiosystem og sjangerindustri', 'Kobler klassisk fortelling og stil til studioorganisering, stjernesystem, sjangre og distribusjon uten å gjøre Hollywood til universell norm.', 'Dagens eierskap og forretningsmodell eies av industriområdet.', [QAA, NTNU]),
  g(D.H, 'modernisme_nye_bolger_og_alternative_filmbevegelser', 'Modernisme, nye bølger og alternative filmbevegelser', 'Sammenholder kunstneriske brudd, produksjonsformer og politiske filmbevegelser i flere land og perioder.', 'En navngitt bevegelse er et case innen emnet, ikke automatisk et eget canonicalt emne.', [QAA, NTNU]),
  g(D.H, 'globale_transnasjonale_og_dekoloniale_skjermhistorier', 'Globale, transnasjonale og dekoloniale skjermhistorier', 'Gjør film- og TV-forløp utenfor en vestlig standardkanon eksplisitte og undersøker sirkulasjon, kolonimakt, oversettelse og transnasjonale forbindelser.', 'Representasjon i enkeltverk eies av samfunnsområdet; historiske institusjoner og forløp eies her.', [QAA, NTNU], ['Africa', 'Asia', 'Latin America', 'Middle East', 'Oceania', 'diasporic_and_transnational_routes']),
  g(D.H, 'norsk_filmhistorie_produksjon_verk_og_offentlighet', 'Norsk filmhistorie: produksjon, verk og offentlighet', 'Følger norske produksjonsmiljøer, verk, regulering, visning og offentlighet som skiftende historiske sammenhenger.', 'Norsk film er ikke målestokk for global filmhistorie og må alltid relateres til nordiske og internasjonale forløp.', [NTNU, NTNU_STRUCTURE]),
  g(D.H, 'nordisk_film_og_tv_historie', 'Nordisk film- og TV-historie', 'Sammenholder nordiske filmkulturer, kringkastingsmodeller, samarbeid, språk og estetiske utviklingslinjer uten å behandle Norden som homogent.', 'Nasjonale dybdestudier kan være case; dette emnet eier sammenligningen og forbindelsene.', [NTNU_STRUCTURE, EBU]),
  g(D.H, 'kringkastingsfjernsynets_historie', 'Kringkastingsfjernsynets historie', 'Behandler fjernsynets framvekst, sendeskjema, direktesending, husholdning, allmennkringkasting og nasjonale TV-offentligheter.', 'Institusjonenes nåværende mandat eies av industriområdet.', [NTNU_STRUCTURE, EBU]),
  g(D.H, 'kommersiell_tv_kabel_og_satellitt', 'Kommersiell TV, kabel og satellitt', 'Undersøker hvordan reklamefinansiering, kanalvekst, kabel og satellitt endret programformer, regulering og publikum.', 'Dagens plattformøkonomi eies av industriområdet.', [QAA, EBU]),
  g(D.H, 'video_hjemmemedier_og_digital_omveltning', 'Video, hjemmemedier og digital omveltning', 'Følger VHS, DVD, opptak, utleie, digitalisering og filbaserte arbeidsflyter som historiske endringer i tilgang, produksjon og bruk.', 'Digital bevaring eies av arkivområdet.', [QAA, NTNU]),
  g(D.H, 'stromming_og_fjernsynets_plattformovergang', 'Strømming og fjernsynets plattformovergang', 'Historiserer overgangen fra sendeskjema og kanalpakker til bestilling, katalog, anbefaling og global plattformdistribusjon.', 'Dagens markedsmakt og publikumsdata eies av industri- og publikumsområdene.', [QAA, EBU]),
  g(D.H, 'dokumentarhistorier_og_sannhetsregimer', 'Dokumentarhistorier og sannhetsregimer', 'Følger dokumentariske tradisjoner, teknologier og institusjoner som historisk skiftende måter å gjøre sannhetskrav på.', 'Analyse av en konkret dokumentars evidens og etikk eies av dokumentarområdet.', [NTNU, NTNU_STRUCTURE]),
  g(D.H, 'animasjonshistorier_teknikker_og_industrier', 'Animasjonshistorier, teknikker og industrier', 'Følger tegnfilm, stop-motion, TV-animasjon og digital animasjon som forskjellige historiske teknikker, arbeidsformer og kulturer.', 'Animasjonens form og produksjonsløp har egne eiere i form- og produksjonsområdene.', [QAA, NTNU]),
  g(D.H, 'amatorfilm_hjemmevideo_og_deltakerhistorie', 'Amatørfilm, hjemmevideo og deltakerhistorie', 'Behandler ikke-profesjonelle opptak, familiebruk, klubber og nettvideo som historiske praksiser og kilder til hverdagsliv.', 'Samtidig bruk og fanproduksjon eies av publikumsområdet; bevaring eies av arkiv.', [QAA, UNESCO]),

  g(D.D, 'dokumentarformer_tradisjoner_og_moduser', 'Dokumentarformer, tradisjoner og moduser', 'Skiller dokumentariske organisasjonsformer gjennom stemme, observasjon, argument, poetisk form, deltakelse og refleksivitet.', 'Formene er analytiske tradisjoner, ikke en kvote som krever ett emne per navngitt modus.', [NTNU, NTNU_STRUCTURE]),
  g(D.D, 'observasjon_deltakelse_refleksivitet_og_performance', 'Observasjon, deltakelse, refleksivitet og performance', 'Undersøker filmskaperens synlige og usynlige rolle, relasjonen til deltakere og hvordan opptakssituasjonen former materialet.', 'Samtykke og skade vurderes gjennom det overordnede dokumentaretiske emnet.', [QAA, NTNU]),
  g(D.D, 'essayfilm_subjektivitet_og_audiovisuelt_argument', 'Essayfilm, subjektivitet og audiovisuelt argument', 'Behandler personlig stemme, montasje, tvil og refleksjon som måter å bygge et audiovisuelt argument på.', 'Fiksjonalisering alene gjør ikke et verk til essayfilm.', [QAA, NTNU]),
  g(D.D, 'arkivdokumentar_found_footage_og_ombruk', 'Arkivdokumentar, found footage og ombruk', 'Analyserer hvordan eksisterende bilder får nye evidens-, historie- og argumentfunksjoner gjennom utvalg, montasje og kontekst.', 'Proveniens og bevaring eies av arkivområdet; det nye verkets sannhetskrav eies her.', [QAA, UNESCO]),
  g(D.D, 'rekonstruksjon_animasjon_og_syntetiske_dokumentarbilder', 'Rekonstruksjon, animasjon og syntetiske dokumentarbilder', 'Vurderer reenactment, animasjon, genererte bilder og andre rekonstruksjoner mot åpenhet, evidens, nødvendighet og risiko for villedning.', 'Teknologien eies av produksjon; sannhets- og etikkanalysen eies her.', [QAA, EBU_AI]),
  g(D.D, 'vitnesbyrd_traume_og_dokumentarisk_ansvar', 'Vitnesbyrd, traume og dokumentarisk ansvar', 'Undersøker hvordan vitnesbyrd tas opp, redigeres, kontekstualiseres og formidles når makt, sårbarhet og ettervirkninger står på spill.', 'Emnet gir ikke kliniske vurderinger; det eier framstillings- og deltakeransvaret.', [QAA, UNESCO]),

  g(D.S, 'kjonn_feministisk_filmanalyse_og_skjermmakt', 'Kjønn, feministisk filmanalyse og skjermmakt', 'Undersøker blikk, rollefordeling, arbeid, fortelling og institusjonell synlighet som kjønnete maktforhold.', 'Kjønn skal ikke reduseres til opptelling; form, narrativ betydning og produksjonsmakt må kunne skilles.', [QAA]),
  g(D.S, 'seksualitet_queer_representasjon_og_normkritikk', 'Seksualitet, queer representasjon og normkritikk', 'Analyserer hvordan film og TV former begjær, identitet, normer, sensur, synlighet og motfortellinger.', 'Publikums identitetsarbeid eies av publikumsområdet når resepsjonen er analyseenheten.', [QAA]),
  g(D.S, 'rasialisering_etnisitet_hvithet_og_stereotypi', 'Rasialisering, etnisitet, hvithet og stereotypi', 'Undersøker casting, karakterfunksjon, bildehistorie, fortellerposisjon og fravær som rasialiserte maktprosesser.', 'Nasjonal opprinnelse alene brukes aldri som slutning om representasjon.', [QAA]),
  g(D.S, 'urfolk_samisk_skjermkultur_og_suverenitet', 'Urfolk, samisk skjermkultur og suverenitet', 'Behandler selvrepresentasjon, språk, fortellerkontroll, land, arkiv og institusjonell makt med særlig norsk relevans for samiske perspektiver.', 'Urfolksperspektiver er ikke et undercase av nasjonal identitet; kontroll over bilder, kilder og fortelling må auditeres.', [QAA, UNESCO]),
  g(D.S, 'klasse_arbeid_ulikhet_og_sosial_mobilitet', 'Klasse, arbeid, ulikhet og sosial mobilitet', 'Analyserer hvordan økonomiske posisjoner, arbeid, bolig, smak og mobilitet gjøres synlige, naturlige eller fraværende i film og TV.', 'Produksjonsarbeidernes faktiske vilkår eies av produksjonsområdet.', [QAA]),
  g(D.S, 'funksjonsvariasjon_ableisme_og_tilgjengelighet', 'Funksjonsvariasjon, ableisme og tilgjengelighet', 'Skiller representasjon av funksjonsvariasjon fra reell tilgang til produksjon, verk og visning, og undersøker ableistiske normer.', 'Teksting, synstolking og tilgjengelig produksjonsdesign eies operativt av produksjon og publikum.', [QAA]),
  g(D.S, 'alder_barn_ungdom_og_livslop', 'Alder, barn, ungdom og livsløp', 'Undersøker hvordan alder, generasjon og livsfase organiserer rolletyper, fortellinger, vern, adressering og synlighet.', 'Aldersgrenser som regulering eies av industriområdet; barns faktiske bruk eies av publikumsområdet.', [QAA]),
  g(D.S, 'migrasjon_diaspora_og_transnasjonal_identitet', 'Migrasjon, diaspora og transnasjonal identitet', 'Analyserer tilhørighet, språk, grense, minne og flerstedlighet i verk og produksjonskulturer.', 'Romlig sirkulasjon eies av skjermgeografi når stedet, ikke identitetsmakten, er analyseenheten.', [QAA]),
  g(D.S, 'religion_livssyn_og_audiovisuell_representasjon', 'Religion, livssyn og audiovisuell representasjon', 'Undersøker hvordan tro, sekularitet, ritual, minoritet og konflikt framstilles og forhandles i film og TV.', 'Emnet overtar ikke religionsfagets lære- og praksisinnhold; det analyserer audiovisuell representasjon.', [QAA]),
  g(D.S, 'interseksjonalitet_posisjonalitet_og_metode', 'Interseksjonalitet, posisjonalitet og metode', 'Kontrollerer hvordan flere maktakser virker samtidig, og hvordan forskerens eller produsentens posisjon former spørsmål, materiale og tolkning.', 'Emnet erstatter ikke de konkrete representasjonsfeltene; det binder dem sammen metodisk.', [QAA]),
  g(D.S, 'koloniale_blikk_dekolonisering_og_motbilder', 'Koloniale blikk, dekolonisering og motbilder', 'Analyserer hvordan koloniale bildeordener videreføres, bestrides og omarbeides gjennom perspektiv, arkiv, produksjon og distribusjon.', 'Historiske forløp eies av historieområdet; her ligger representasjons- og maktanalysen.', [QAA, UNESCO]),
  g(D.S, 'klima_miljo_og_okokritisk_skjermanalyse', 'Klima, miljø og økokritisk skjermanalyse', 'Undersøker hvordan natur, ressursbruk, katastrofe og klimaframtid gis form, handlingsrom og politisk betydning i film og TV.', 'Produksjonens faktiske utslipp og locationinngrep eies av produksjons- og stedsområdene.', [QAA]),

  g(D.P, 'utvikling_pitch_research_og_preproduksjon', 'Utvikling, pitch, research og preproduksjon', 'Følger prosjektet fra idé og research gjennom pitch, manusutvikling, rettighetsavklaring, plan og beslutning om produksjon.', 'Fortellingens dramaturgi eies av fortellingsområdet; finansieringssystemet eies av industri.', [QAA, NTNU]),
  g(D.P, 'regi_sceneledelse_og_kreative_beslutninger', 'Regi, sceneledelse og kreative beslutninger', 'Undersøker regissørens arbeid med manus, skuespillere, bilde, lyd, tempo og samarbeid før og under opptak.', 'Auteurhistorie og stjernepersona eies ikke av produksjonspraksis.', [QAA, NTNU]),
  g(D.P, 'produksjonsdesign_scenografi_kostyme_og_rekvisitt', 'Produksjonsdesign, scenografi, kostyme og rekvisitt', 'Behandler hvordan fysiske og digitale miljøer, kostymer og objekter utvikles, bygges, skaffes og kontinuitetsføres i produksjonen.', 'Det ferdige bildets komposisjon analyseres i formområdet.', [QAA]),
  g(D.P, 'casting_skuespillerarbeid_og_intimitetskoordinering', 'Casting, skuespillerarbeid og intimitetskoordinering', 'Kobler rollebesetning og arbeid med utøvere til prøver, ledelse, samtykke, sikkerhet og makt i produksjonen.', 'Representasjonens resultat eies av samfunnsområdet; stjernepersona eies av kulturarvområdet.', [QAA]),
  g(D.P, 'opptaksledelse_planlegging_budsjett_og_logistikk', 'Opptaksledelse, planlegging, budsjett og logistikk', 'Undersøker nedbrytning, opptaksplan, bemanning, transport, tillatelser, beredskap og løpende prioriteringer i en produksjon.', 'Finansieringsordninger og markedsrisiko eies av industriområdet.', [QAA]),
  g(D.P, 'vfx_virtuell_produksjon_og_sanntidsarbeidsflyt', 'VFX, virtuell produksjon og sanntidsarbeidsflyt', 'Behandler previs, motion capture, LED-volum, compositing og sanntidsmotorer som samordnede kreative og tekniske arbeidsprosesser.', 'Det syntetiske bildets estetikk eies av formområdet.', [QAA]),
  g(D.P, 'kunstig_intelligens_automatisering_og_skapende_ansvar', 'Kunstig intelligens, automatisering og skapende ansvar', 'Undersøker KI i utvikling, bilde, lyd, lokalisering og arbeidsflyt mot opphav, samtykke, transparens, kvalitet, arbeidsmakt og miljøkostnad.', 'Emnet er teknologinøytralt: hver påstand må knyttes til dokumentert bruk og styring, ikke framtidsspekulasjon.', [QAA, EBU_AI]),
  g(D.P, 'animasjonsproduksjon_og_pipeline', 'Animasjonsproduksjon og pipeline', 'Følger design, storyboard, layout, animasjon, lys, rendering og compositing i tegnede, modellerte og digitale produksjoner.', 'Animasjonens form og historie eies av egne emner i form- og historieområdene.', [QAA, NTNU]),
  g(D.P, 'hms_arbeidstid_kreditering_og_fagorganisering', 'HMS, arbeidstid, kreditering og fagorganisering', 'Gjør risiko, arbeidstid, kontrakt, kreditering, varsling og kollektiv organisering til konkrete, dokumenterbare produksjonsforhold.', 'Emnet gir ikke juridisk rådgivning og krever oppdaterte avtale- og myndighetskilder.', [QAA]),
  g(D.P, 'baerekraftig_produksjon_og_klimaregnskap', 'Bærekraftig produksjon og klimaregnskap', 'Undersøker strategi, energi, transport, materialer, innkjøp, avfall og måling gjennom hele produksjonsløpet.', 'Økokritisk analyse av verk og stedlig inngrep eies av samfunns- og stedsområdene.', [QAA, NFI]),
  g(D.P, 'teksting_synstolking_og_tilgjengelig_design', 'Teksting, synstolking og tilgjengelig design', 'Behandler teksting, synstolking, tegnspråk, lesbarhet og tilgjengelige grensesnitt som planlagte deler av produksjon og distribusjon.', 'Publikums faktiske hindringer og bruk eies av publikumsområdet.', [QAA]),

  g(D.I, 'eierskap_konsentrasjon_og_vertikal_integrasjon', 'Eierskap, konsentrasjon og vertikal integrasjon', 'Undersøker hvordan eierskap på tvers av produksjon, distribusjon, plattform og visning påvirker tilgang, risiko og redaksjonell eller kreativ autonomi.', 'Enkeltbedrifter brukes som dokumenterte case, ikke som tidløse modeller.', [QAA]),
  g(D.I, 'internasjonal_samproduksjon_insentiver_og_produksjonsflyt', 'Internasjonal samproduksjon, insentiver og produksjonsflyt', 'Analyserer hvordan avtaler, støtte, skatteinsentiver, rettigheter, språk og locationvalg organiserer produksjon over grenser.', 'Transnasjonal estetikk og identitet eies av historie- og samfunnsområdene.', [QAA, NTNU]),
  g(D.I, 'festivaler_priser_markeder_og_portvakt', 'Festivaler, priser, markeder og portvakt', 'Skiller visning for publikum fra festivalers og markedsplassers rolle i finansiering, salg, prestisje, kanon og internasjonal sirkulasjon.', 'Festivalopplevelse og kuratering for publikum eies av publikumsområdet.', [QAA, NTNU]),
  g(D.I, 'uformell_distribusjon_piratkopiering_og_tilgang', 'Uformell distribusjon, piratkopiering og tilgang', 'Undersøker hvordan uautorisert kopiering og uformelle nettverk utfordrer rettigheter, sensur, bevaring, pris og geografisk tilgang.', 'Emnet beskriver og analyserer praksiser; det instruerer ikke i lovbrudd.', [QAA, UNESCO]),
  g(D.I, 'tv_formathandel_lisensiering_og_lokal_tilpasning', 'TV-formathandel, lisensiering og lokal tilpasning', 'Behandler handel med programformater, bibler, merkevarer og produksjonskunnskap, og hvordan formatet endres i lokale TV-systemer.', 'Programmets narrativ og sjanger eies av fortellingsområdet.', [QAA, EBU]),

  g(D.V, 'tilskuerteori_identifikasjon_affekt_og_kropp', 'Tilskuerteori, identifikasjon, affekt og kropp', 'Undersøker oppmerksomhet, identifikasjon, avstand, følelse og kroppslig respons uten å anta én universell tilskuer.', 'Påstander om faktiske publikum krever empiriske data og kan ikke avledes fra verket alene.', [QAA, NTNU]),
  g(D.V, 'resepsjonshistorie_kritikk_og_anmeldelser', 'Resepsjonshistorie, kritikk og anmeldelser', 'Bruker samtidige og senere anmeldelser, debatter og publikumsreaksjoner til å undersøke hvordan et verk har blitt fortolket og vurdert over tid.', 'Verkets form analyseres separat; resepsjonskilder er ikke bevis på produsentens intensjon.', [QAA, NTNU]),
  g(D.V, 'husholdning_mobil_skjerm_og_flerskjermsbruk', 'Husholdning, mobil skjerm og flerskjermsbruk', 'Undersøker hvordan rom, enheter, samtidige aktiviteter og sosiale relasjoner former seing utenfor kinoen.', 'Plattformens forretningsmodell eies av industriområdet.', [QAA, EBU]),
  g(D.V, 'barn_ungdom_og_audiovisuelle_publikum', 'Barn, ungdom og audiovisuelle publikum', 'Behandler barns og unges faktiske bruk, fortolkning, fellesskap og tilgang med alderssensitiv metode framfor å slutte virkning fra innhold alene.', 'Representasjon av alder eies av samfunnsområdet; klassifisering eies av industri.', [QAA]),
  g(D.V, 'tilgjengelige_visninger_og_publikumshindringer', 'Tilgjengelige visninger og publikumshindringer', 'Kartlegger fysiske, sensoriske, språklige, økonomiske og tekniske hindringer i kino, TV og strømmetjenester, samt dokumenterte tilgjengelighetstiltak.', 'Produksjon av teksting og synstolking eies av produksjonsområdet.', [QAA]),
  g(D.V, 'publikumsforskning_intervju_etnografi_og_sporreundersokelse', 'Publikumsforskning: intervju, etnografi og spørreundersøkelse', 'Skiller selvrapportering, observasjon, intervju, spørreundersøkelse og digitale bruksspor, med eksplisitt metodekritikk og personvern.', 'Metoden må velges etter forskningsspørsmål; emnet er ikke en generell oppskrift på datainnsamling.', [QAA]),

  g(D.L, 'studio_backlot_virtuelt_rom_og_stedserstatning', 'Studio, backlot, virtuelt rom og stedserstatning', 'Undersøker hvordan bygde og syntetiske rom står inn for faktiske steder og hvilke estetiske, økonomiske og politiske valg dette innebærer.', 'Studioets arbeidsmiljø eies av produksjonsområdet.', [QAA]),
  g(D.L, 'rurale_perifere_og_arktiske_skjermgeografier', 'Rurale, perifere og arktiske skjermgeografier', 'Analyserer hvordan avstand, ressurslandskap, klima, sentrum–periferi og lokal kunnskap organiserer produksjon og framstilling utenfor storbyen.', 'Området er en motvekt til legacystrukturens urbane overvekt, ikke en ny geografisk kvote.', [QAA]),
  g(D.L, 'mobilitet_grenser_eksil_og_skjermrom', 'Mobilitet, grenser, eksil og skjermrom', 'Undersøker reise, transport, grensepassering, fordrivelse og flerstedlighet som romlige mønstre i film og TV.', 'Identitets- og representasjonsmakten eies av samfunnsområdet når personer og grupper er analyseenheten.', [QAA]),
  g(D.L, 'lokalsamfunn_samtykke_og_stedlig_produksjonsmakt', 'Lokalsamfunn, samtykke og stedlig produksjonsmakt', 'Vurderer informasjon, tillatelser, lokal medvirkning, forstyrrelse, gevinst og ettervirkning når produksjoner bruker faktiske steder og samfunn.', 'Individuelt deltakersamtykke i dokumentar eies av dokumentarområdet.', [QAA]),
  g(D.L, 'locationokologi_inngrep_og_miljokonsekvens', 'Locationøkologi, inngrep og miljøkonsekvens', 'Undersøker transport, terrenginngrep, slitasje, vern og restaurering knyttet til opptak på faktiske steder.', 'Hele produksjonens klimaregnskap eies av produksjonsområdet.', [QAA, NFI]),
  g(D.L, 'urfolkslandskap_stedskunnskap_og_bilderett', 'Urfolkslandskap, stedskunnskap og bilderett', 'Behandler land, navn, ferdsel, hellige eller sårbare steder og lokal kontroll over audiovisuelle framstillinger.', 'Samisk og urfolks representasjon eies av samfunnsområdet; her er stedet og tilgangen analyseenheten.', [QAA, UNESCO]),

  g(D.R, 'digitalfodte_verk_formatforvitring_og_migrering', 'Digitalfødte verk, formatforvitring og migrering', 'Undersøker hvordan filer, kodeker, programvare, plattformer og lagringssystemer gjør digital bevaring til en løpende prosess.', 'Digitalisering av analoge verk og bevaring av digitalfødte objekter skal ikke behandles som samme operasjon.', [UNESCO]),
  g(D.R, 'metadata_katalogisering_proveniens_og_finnbarhet', 'Metadata, katalogisering, proveniens og finnbarhet', 'Behandler identifikasjon, kontekst, versjon, opphav og søkbarhet som forutsetninger for kunnskap, bevaring og tilgang.', 'Metadata er ikke nøytral; kategorier og fravær må kunne auditeres.', [UNESCO]),
  g(D.R, 'restaureringsetikk_autentisitet_og_verkversjoner', 'Restaureringsetikk, autentisitet og verkversjoner', 'Vurderer farge, lyd, hastighet, utsnitt, manglende materiale og konkurrerende versjoner mot dokumentasjon og åpenhet.', 'Teknisk forbedring er ikke automatisk historisk korrekthet.', [UNESCO]),
  g(D.R, 'arkivtilgang_personvern_saarbarhet_og_rettigheter', 'Arkivtilgang, personvern, sårbarhet og rettigheter', 'Avveier offentlig tilgang mot opphavsrett, personvern, sikkerhet, kulturell sensitivitet og skade for avbildede personer og samfunn.', 'Restriksjoner må dokumenteres og kan ikke brukes som ubegrunnet varig lukking.', [UNESCO]),
  g(D.R, 'produksjonsarkiv_manus_kostyme_og_ephemera', 'Produksjonsarkiv: manus, kostyme og ephemera', 'Utvider verkhistorien med manusversjoner, produksjonsnotater, fotografier, kostymer, rekvisitter, kontrakter og markedsmateriale.', 'Objektene brukes som kilder til dokumenterte prosesser, ikke som erstatning for verkanalyse.', [UNESCO]),
  g(D.R, 'familiefilm_lokale_samlinger_og_motarkiv', 'Familiefilm, lokale samlinger og motarkiv', 'Behandler private og lokale opptak som kilder til hverdagsliv og marginaliserte erfaringer, med kontekst, samtykke og bevaringsrisiko.', 'Privat opptak er ikke automatisk representativt for en gruppe eller periode.', [UNESCO]),
  g(D.R, 'dekolonisering_repatriering_og_fellesskapskontroll', 'Dekolonisering, repatriering og fellesskapskontroll', 'Undersøker eierskap, beskrivelse, tilbakeføring, kopi, tilgang og beslutningsmakt for audiovisuelle samlinger med kolonial eller urettmessig proveniens.', 'Digital tilgjengeliggjøring alene løser ikke spørsmål om kontroll og skade.', [QAA, UNESCO]),
  g(D.R, 'plattformkataloger_forsvinnende_verk_og_digital_tilgang', 'Plattformkataloger, forsvinnende verk og digital tilgang', 'Analyserer hvordan lisensutløp, tjenestestenging, geoblokkering og proprietære formater gjør verk usynlige eller utilgjengelige.', 'Markeds- og rettighetsmekanismene eies av industriområdet; tap, dokumentasjon og varig tilgang eies her.', [UNESCO, EBU])
]);

const abs = (file) => path.join(ROOT, file);
const json = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const canonicalConcept = (id) => SECOND_ORDER_MERGES[id] || id;

function titleFromId(id) {
  const replacements = {
    tv: 'TV', vfx: 'VFX', hms: 'HMS', ai: 'KI', okonomi: 'økonomi', stromming: 'strømming',
    strommedistribusjon: 'strømmedistribusjon', strommemarked: 'strømmemarked', tilhorighet: 'tilhørighet',
    fravaer: 'fravær', forlop: 'forløp', pastand: 'påstand', miljo: 'miljø', arbeidsmiljo: 'arbeidsmiljø'
  };
  const words = id.split('_').map((word) => replacements[word] || word);
  let title = words.join(' ');
  title = title.charAt(0).toLocaleUpperCase('nb-NO') + title.slice(1);
  return title.replace(/^Film TV\b/, 'Film og TV').replace(/^Nasjonale film TV\b/, 'Nasjonale film- og TV-');
}

function successorDomain(row, index) {
  if (row.target_domain_ids.length === 1) return row.target_domain_ids[0];
  return row.target_domain_ids[index] || row.target_domain_ids.at(-1);
}

function buildLegacySuccessors(classification) {
  const byConcept = new Map();
  for (const row of classification.classifications) {
    row.successor_concept_ids.forEach((rawConceptId, index) => {
      const conceptId = canonicalConcept(rawConceptId);
      const domainId = successorDomain(row, index);
      const current = byConcept.get(conceptId) || {
        emne_id: `em_film_tv_${conceptId}`,
        concept_id: conceptId,
        title: titleFromId(conceptId),
        domain_id: domainId,
        origin: 'legacy_migration',
        legacy_aliases: [],
        migration_actions: [],
        rationale_parts: [],
        evidence_refs: ['film-tv-legacy-classification-v1'],
        required_subcoverage: []
      };
      assert(current.domain_id === domainId, `${conceptId} er forsøkt eid av flere områder`);
      current.legacy_aliases.push(row.emne_id);
      current.migration_actions.push(row.action);
      current.rationale_parts.push(row.rationale);
      byConcept.set(conceptId, current);
    });
  }
  return [...byConcept.values()].map((row) => ({
    emne_id: row.emne_id,
    concept_id: row.concept_id,
    title: row.title,
    domain_id: row.domain_id,
    origin: row.origin,
    inventory_role: INTEGRATIVE_CONCEPTS.has(row.concept_id) ? 'integrative_foundation' : 'independent_problem',
    status: 'proposed_canonical',
    definition: [...new Set(row.rationale_parts)].join(' '),
    boundary: `Legacyaliasene ${[...new Set(row.legacy_aliases)].join(', ')} migreres hit. Naboområder kan levere case og metoder, men ikke opprette parallelle emner med samme problemstilling.`,
    legacy_aliases: [...new Set(row.legacy_aliases)].sort(),
    migration_actions: [...new Set(row.migration_actions)].sort(),
    evidence_refs: row.evidence_refs,
    required_subcoverage: row.required_subcoverage
  }));
}

function buildGapRows() {
  return GAP_EMNER.map((row) => ({
    emne_id: `em_film_tv_${row.concept_id}`,
    concept_id: row.concept_id,
    title: row.title,
    domain_id: row.domain_id,
    origin: 'gap_addition',
    inventory_role: 'independent_problem',
    status: 'proposed_canonical',
    definition: row.definition,
    boundary: row.boundary,
    legacy_aliases: [],
    migration_actions: ['add'],
    evidence_refs: row.evidence_refs,
    required_subcoverage: row.required_subcoverage
  }));
}

export function buildFilmTvVariableInventoryV1() {
  const completeness = json(P.completeness);
  const classification = json(P.classification);
  const domainCandidates = completeness.proposed_domain_candidates;
  const legacyRows = buildLegacySuccessors(classification);
  const topics = [...legacyRows, ...buildGapRows()].sort((a, b) => a.domain_id.localeCompare(b.domain_id) || a.emne_id.localeCompare(b.emne_id));
  const domains = domainCandidates.map((domain) => ({
    id: domain.id,
    title: domain.title,
    rationale: domain.rationale,
    emne_ids: topics.filter((topic) => topic.domain_id === domain.id).map((topic) => topic.emne_id)
  }));
  return {
    schema: 'history_go_film_tv_variable_inventory_v1',
    version: '1.0.0',
    updated_at: '2026-08-11',
    status: 'designed_gap_audited_migration_pending',
    subject_id: 'film_tv',
    policy: {
      all_relevant_emner_independent_of_number: true,
      domain_and_emne_counts_are_inventory_not_quotas: true,
      no_target_domain_count: true,
      no_target_emne_count: true,
      one_independent_problem_per_emne: true,
      every_legacy_id_keeps_an_alias: true,
      gap_additions_do_not_require_compensating_deletions: true,
      chapter_shape_follows_learning_need: true
    },
    evidence: EVIDENCE,
    migration_sources: {
      legacy_classification: P.classification,
      completeness_baseline: P.completeness,
      second_order_merge_count: new Set(Object.values(SECOND_ORDER_MERGES)).size,
      second_order_merges: SECOND_ORDER_MERGES
    },
    domains,
    emner: topics,
    cross_cutting_gates: completeness.cross_cutting_completeness_gates,
    next_gate: 'migrate_canonical_files_methods_hooks_mappings_quiz_and_runtime'
  };
}

export function auditFilmTvVariableInventoryV1({ write = false, check = true } = {}) {
  const classification = json(P.classification);
  const status = json(P.status).subjects.find((row) => row.id === 'film_tv');
  const inventory = buildFilmTvVariableInventoryV1();
  const evidenceIds = new Set(inventory.evidence.map((row) => row.id));
  const emneIds = inventory.emner.map((row) => row.emne_id);
  const legacyIds = classification.classifications.map((row) => row.emne_id);
  const migratedAliases = inventory.emner.flatMap((row) => row.legacy_aliases);
  const aliasTargetCounts = Object.fromEntries(legacyIds.map((id) => [id, inventory.emner.filter((row) => row.legacy_aliases.includes(id)).length]));
  const gapRows = inventory.emner.filter((row) => row.origin === 'gap_addition');
  const domainCounts = Object.fromEntries(inventory.domains.map((domain) => [domain.id, domain.emne_ids.length]));

  assert(new Set(emneIds).size === emneIds.length, 'Det variable inventaret har duplikate emne-ID-er');
  assert(new Set(migratedAliases).size === legacyIds.length, 'Minst ett legacy-emne mangler aliasdekning');
  assert(legacyIds.every((id) => migratedAliases.includes(id)), 'Minst ett legacy-emne mangler i aliasmigrasjonen');
  assert(classification.classifications.every((row) => row.action === 'split' ? aliasTargetCounts[row.emne_id] > 1 : aliasTargetCounts[row.emne_id] === 1), 'Aliasviften samsvarer ikke med keep/merge/move/split/retire-beslutningen');
  assert(inventory.domains.every((domain) => domain.emne_ids.length > 0), 'Et faglig begrunnet område er tomt');
  assert(new Set(Object.values(domainCounts)).size > 1, 'Områdene har igjen fått identiske emnetall');
  assert(gapRows.every((row) => row.definition.trim() && row.boundary.trim() && row.definition !== row.boundary), 'Et gapemne mangler selvstendig problemstilling eller grense');
  assert(inventory.emner.every((row) => row.evidence_refs.length > 0 && row.evidence_refs.every((id) => evidenceIds.has(id))), 'Et emne mangler gyldig evidensreferanse');
  assert(inventory.emner.every((row) => row.domain_id && row.definition && row.boundary), 'Et emne mangler eier, definisjon eller grense');
  assert(inventory.policy.no_target_domain_count && inventory.policy.no_target_emne_count, 'Inventaret har gjeninnført en målkvote');
  assert(status?.editorialStatus === 'chapters_in_progress', 'Film & TV skal fortsatt stå som pågående');
  assert(['canonical_inventory_migration', 'canonical_inventory_migrated_existing_chapter_reaudit', 'canonical_chapter_reaudit_complete_learning_order_plan', 'learning_order_plan_complete_first_chapter_source_brief'].includes(status?.nextGate), 'Film & TV skal stå på canonical migrasjon, kapittelreaudit, læringsrekkefølge eller første kildebrief etter gapdesign');

  const requiredGapIds = [
    'em_film_tv_historiografi_periodisering_og_kildekritikk',
    'em_film_tv_nordisk_film_og_tv_historie',
    'em_film_tv_globale_transnasjonale_og_dekoloniale_skjermhistorier',
    'em_film_tv_dokumentarformer_tradisjoner_og_moduser',
    'em_film_tv_urfolk_samisk_skjermkultur_og_suverenitet',
    'em_film_tv_kunstig_intelligens_automatisering_og_skapende_ansvar',
    'em_film_tv_baerekraftig_produksjon_og_klimaregnskap',
    'em_film_tv_teksting_synstolking_og_tilgjengelig_design',
    'em_film_tv_digitalfodte_verk_formatforvitring_og_migrering'
  ];
  assert(requiredGapIds.every((id) => emneIds.includes(id)), 'En dokumentert hovedmangel er ikke løst i inventaret');

  const report = {
    schema: 'history_go_film_tv_variable_inventory_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-11',
    status: 'variable_inventory_designed_canonical_migration_next',
    subject_id: 'film_tv',
    integrity_counts_not_quotas: {
      legacy_emne_count: legacyIds.length,
      successor_emne_count: inventory.emner.filter((row) => row.origin === 'legacy_migration').length,
      gap_addition_count: gapRows.length,
      proposed_emne_count: inventory.emner.length,
      domain_emne_counts: domainCounts
    },
    gates: {
      every_legacy_emne_has_alias_coverage_and_only_splits_fan_out: true,
      second_order_overlaps_merged: true,
      documented_gaps_added_without_compensating_quota: true,
      all_gap_emner_have_evidence_and_boundary: true,
      domain_sizes_are_variable: true,
      fixed_target_counts_absent: true,
      chapter_production_still_blocked: true
    },
    next_gate: inventory.next_gate
  };

  if (write) {
    fs.writeFileSync(abs(P.inventory), `${JSON.stringify(inventory, null, 2)}\n`);
    fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (check) {
    assert(isDeepStrictEqual(json(P.inventory), inventory), `${P.inventory} er utdatert`);
    assert(isDeepStrictEqual(json(P.report), report), `${P.report} er utdatert`);
  }
  return { inventory, report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditFilmTvVariableInventoryV1({ write: args.has('--write'), check: !args.has('--no-check') });
    console.log(`Film & TV variabelt inventar OK: ${report.integrity_counts_not_quotas.proposed_emne_count} foreslåtte emner med variable områdestørrelser; canonical migrasjon er neste port.`);
  } catch (error) {
    console.error(`Film & TV variabelt inventar FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
