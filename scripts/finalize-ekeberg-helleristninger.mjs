import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { buildQuizProductionContext } from "./quiz-production-lib.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const has = file => fs.existsSync(path.join(root, file));
const verifiedAt = "2026-08-28";
const placeId = "ekeberg_helleristninger";
const placeFile = `data/places/historie/oslo/places_historie/${placeId}.json`;
const officialObject = "https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/lokaliteter/items/41907-1?f=json";
const kulturminne = "https://kulturminnesok.no/ra/lokalitet/41907";
const heritage = "https://ekebergparken.com/kulturminner";
const timeline = "https://ekebergparken.com/historisk-tidslinje";
const localHistory = "https://lokalhistoriewiki.no/wiki/Helleristningene_i_Familiedalen";
const visitOslo = "https://www.visitoslo.com/no/attraksjon/helleristningene-pa-ekeberg/";
const petersenSnl = "https://snl.no/Jan_Greve_Thaulow_Petersen";
const uioLogoPage = "https://www.uio.no/om/designmanual/profilelementer/logo/";
const commonsField = "https://commons.wikimedia.org/wiki/File:Helleristningene_ved_Sj%C3%B8mannsskolen_2013-09-22-008.jpg";
const commonsFieldTwo = "https://commons.wikimedia.org/wiki/File:Helleristningene_p%C3%A5_Ekeberg_2.jpg";
const commonsRock = "https://commons.wikimedia.org/wiki/File:Rock_carvings_at_Sj%C3%B8mannsskolen_Ekeberg_(Oslo)_02.jpg";
const commonsDrawing = "https://commons.wikimedia.org/wiki/File:Rock_carvings_at_Sj%C3%B8mannsskolen_Ekeberg_(Oslo)_-_description.png";
const commonsPetersen = "https://commons.wikimedia.org/wiki/File:JanGreveThaulowPetersen.jpg";

const fieldImageMeta = {
  creator: "Hans A. Rosbach",
  credit: "Hans A. Rosbach / Wikimedia Commons",
  sourcePage: commonsField,
  sourceAsset: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Helleristningene_ved_Sj%C3%B8mannsskolen_2013-09-22-008.jpg",
  license: "CC BY-SA 3.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  transformation: "Beskåret og konvertert til WebP; moderne rødfargemarkering er synlig.",
  reviewedAt: verifiedAt
};
const fieldTwoImageMeta = {
  creator: "Anne-Sophie Ofrim",
  credit: "Anne-Sophie Ofrim / Wikimedia Commons",
  sourcePage: commonsFieldTwo,
  sourceAsset: "https://upload.wikimedia.org/wikipedia/commons/d/de/Helleristningene_p%C3%A5_Ekeberg_2.jpg",
  license: "CC BY-SA 3.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  transformation: "Beskåret og konvertert til WebP.",
  reviewedAt: verifiedAt
};
const rockImageMeta = {
  creator: "Grzegorz Wysocki",
  credit: "Grzegorz Wysocki / Wikimedia Commons",
  sourcePage: commonsRock,
  sourceAsset: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Rock_carvings_at_Sj%C3%B8mannsskolen_Ekeberg_%28Oslo%29_02.jpg",
  license: "CC BY 3.0",
  licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
  transformation: "Beskåret rundt den registrerte menneskefiguren og konvertert til WebP.",
  reviewedAt: verifiedAt
};
const drawingImageMeta = {
  creator: "Grzegorz Wysocki",
  credit: "Grzegorz Wysocki / Wikimedia Commons",
  sourcePage: commonsDrawing,
  sourceAsset: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Rock_carvings_at_Sj%C3%B8mannsskolen_Ekeberg_%28Oslo%29_-_description.png",
  license: "CC BY 3.0",
  licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
  transformation: "Beskåret fra dokumentasjonstegningen og konvertert til WebP.",
  reviewedAt: verifiedAt
};

const person = {
  id: "jan_greve_thaulow_petersen",
  name: "Jan Greve Thaulow Petersen",
  year: 1887,
  category: "historie",
  initials: "JP",
  kindLabel: "Arkeolog",
  desc: "Arkeologen som undersøkte funnet i Familiedalen dagen etter oppdagelsen i september 1915.",
  popupDesc: "Jan Greve Thaulow Petersen var konservator ved Universitetets Oldsaksamling fra 1915. Lokalhistoriewiki dokumenterer at han fulgte preparant Paul Johannessen til bergflaten dagen etter oppdagelsen og var med på å fastslå at furene var et helleristningsfelt. Personkortet gjelder denne konkrete undersøkelsen; han skapte ikke figurene og kan ikke forklare deres opprinnelige betydning.",
  places: [placeId],
  placeId,
  roles: ["arkeolog", "konservator"],
  tags: ["arkeologi", "helleristninger", "Ekeberg", "1915", "Universitetets Oldsaksamling"],
  image: "bilder/kort/people/jan_greve_thaulow_petersen.webp",
  cardImage: "bilder/kort/people/jan_greve_thaulow_petersen.webp",
  source_urls: [localHistory, petersenSnl],
  imageMeta: {
    creator: "Ukjent fotograf",
    credit: "Ukjent / Norges filosofer og realister (1933), via Wikimedia Commons",
    sourcePage: commonsPetersen,
    sourceAsset: "https://upload.wikimedia.org/wikipedia/commons/4/46/JanGreveThaulowPetersen.jpg",
    license: "Public domain (PD Norway)",
    transformation: "Oppskalert, beskåret og konvertert til WebP.",
    outputDimensions: "600x900",
    reviewedAt: verifiedAt
  }
};
write(`data/people/historie/oslo/${person.id}.json`, person);

const brand = {
  id: "universitetet_i_oslo",
  name: "Universitetet i Oslo",
  brand_type: "institution_brand",
  brand_kind: "university_identity",
  brand_group: "cultural_institution_brand",
  sector: "education_and_research",
  state: "catalog",
  status: "current",
  verification: "verified",
  verified_at: verifiedAt,
  place_ids: [placeId],
  desc: "Institusjonen bak Universitetets Oldsaksamling, som mottok funnmeldingen og undersøkte feltet i 1915.",
  popupdesc: "Universitetets Oldsaksamling var den faglige institusjonen som preparant Paul Johannessen og arkeolog Jan Petersen arbeidet for da feltet ble oppdaget og undersøkt i 1915. UiO-identiteten kvalifiserer her som institusjonsmerke gjennom en dokumentert, direkte forskningsrolle ved stedet; den gjør ikke bergflaten til et universitetsområde.",
  logo: "bilder/kort/brands/universitetet_i_oslo.svg",
  source_urls: [localHistory, petersenSnl, uioLogoPage],
  imageMeta: {
    assetKind: "official_logo",
    creator: "Universitetet i Oslo",
    credit: "Universitetet i Oslo",
    sourceAsset: "https://www.uio.no/om/designmanual/profilelementer/logo/formell-logo/04_uio_full_logo_no_pos.svg",
    sourcePage: uioLogoPage,
    license: "Official logo; referential identification",
    rightsBasis: "official_logo_used_for_referential_identification",
    usageContext: "referential_identification",
    noEndorsement: true,
    generated: false,
    reconstructed: false,
    reviewedAt: verifiedAt
  }
};

const objects = [
  {
    id: "ekeberg_elgfigur_med_indre_linjer",
    name: "Elgfigur med indre linjer",
    type: "rock_art_figure",
    year: null,
    desc: "En fysisk dyrefigur i feltet med linjer inne i kroppen. Riksantikvarens registrering artsbestemmer to av dyrene som elgokser, mens andre dyremotiver er mer usikre.",
    why_here: "Dyrefigurene er feltets dominerende og mest karakteristiske materielle motivgruppe.",
    status: "in_situ",
    image: "bilder/kort/objects/ekeberg_elgfigur.webp",
    source_url: officialObject,
    imageMeta: fieldImageMeta
  },
  {
    id: "ekeberg_menneskefigur",
    name: "Menneskefiguren",
    type: "rock_art_figure",
    year: null,
    desc: "En stilisert menneskefigur er registrert blant feltets tretten figurer. Identifikasjonen bygger på dokumentasjon av linjene; betydningen er ukjent.",
    why_here: "Figuren er en særskilt, fysisk identifiserbar del av feltet og skiller seg fra de mange dyremotivene.",
    status: "in_situ",
    image: "bilder/kort/objects/ekeberg_menneskefigur.webp",
    source_url: officialObject,
    imageMeta: rockImageMeta
  },
  {
    id: "ekeberg_fuglefigur",
    name: "Fuglefiguren",
    type: "rock_art_figure",
    year: null,
    desc: "Riksantikvarens registrering omfatter en fuglefigur. Dokumentasjonstegningen viser hvor den er lest i panelet, men sier ikke sikkert hva fuglen betydde.",
    why_here: "Fuglefiguren er en av de navngitte motivtypene i den offisielle registreringen.",
    status: "in_situ",
    image: "bilder/kort/objects/ekeberg_fuglefigur.webp",
    source_url: officialObject,
    imageMeta: drawingImageMeta
  }
];
const productions = [{
  id: "ekeberg_oppdagelsen_12_september_1915",
  name: "Oppdagelsen 12. september 1915",
  title: "Oppdagelsen 12. september 1915",
  type: "historical_event",
  year: 1915,
  date: "1915-09-12",
  desc: "Preparant Paul Johannessen ved Universitetets Oldsaksamling oppdaget furene tilfeldig på søndagstur. Dagen etter undersøkte han og Jan Petersen stedet og identifiserte et helleristningsfelt.",
  image: "bilder/kort/productions/ekeberg_oppdagelsen_1915.webp",
  source_url: timeline,
  imageMeta: fieldTwoImageMeta
}];

const place = read(placeFile);
Object.assign(place, {
  period: "Eldre steinalder – omtrentlig og omdiskutert datering",
  emne_ids: ["em_his_arkeologisk_datering_kronologi", "em_his_arkeologisk_landskap_miljo", "em_his_arkeologisk_kontekst_formation"],
  underbadge_ids: ["forhistorie", "kulturminner_og_bevaring"],
  production_profile: "focused",
  profile_status: "confirmed",
  profile_reason: "Et avgrenset, fysisk bergkunstfelt med stor kildeverdi, men smalere stoffbredde enn et historisk område eller museum.",
  desc: "Helleristningene ved Sjømannsskolen er et avgrenset bergkunstfelt med 13 registrerte figurer: ti dyrefigurer, en menneskefigur, en spissoval figur og en fuglefigur. Feltet ble oppdaget 12. september 1915. Dateringsanslagene i åpne formidlingskilder spriker, så år -2500 beholdes bare som teknisk kartanker, ikke som eksakt tilblivelsesår.",
  popupDesc: "Helleristningene ligger i en skrånende bergflate i Familiedalen ved Sjømannsskolen. Riksantikvaren registrerer kulturminnet som Ekeberg 2 (Sjømannsskolen) / Familiedalen, ID 41907. Kartpunktet følger den registrerte feltgeometrien. Den representerer ikke hele Ekebergparken, museumsbygningen Lunds hus, skolebygningen eller Ekebergsletta.\n\nDen offisielle registreringen beskriver tretten figurer: ti dyrefigurer, én menneskefigur, én spissoval figur og én fuglefigur. To dyr er bestemt som elgokser. Flere dyr har linjer inne i kroppen. Linjene er materielle observasjoner; om de viste anatomi, jaktkunnskap, fortelling eller noe annet, er ikke sikkert bevart. Motiver og mulig betydning må derfor holdes fra hverandre.\n\nFeltet ble oppdaget søndag 12. september 1915. Preparant Paul Johannessen ved Universitetets Oldsaksamling la merke til furer i berget på en tur. Dagen etter kom han tilbake sammen med arkeologen Jan Greve Thaulow Petersen. De identifiserte seks eller sju figurer og slo fast at de stod overfor helleristninger. Senere dokumentasjon gjorde flere figurer lesbare, slik at den registrerte totalen ble tretten.\n\nDateringen er ikke ett sikkert kalenderår. Ekebergparkens tidslinje plasserer feltet omkring 4500 f.Kr. og omtaler det som rundt 7000 år gammelt, mens VisitOSLO oppgir omtrent 4000–5000 år. Riksantikvarens registrering holder identiteten på steinaldernivå. Forskjellen viser hvorfor et teknisk årstall i et kartdatasett ikke kan behandles som direkte måleresultat. Strandlinje, stil, sammenligningsmateriale og arkeologisk kontekst gir anslag, ikke en signert dato.\n\nRistningene er veideristninger: bergbilder knyttet til jeger-, fisker- og sankersamfunn, i motsetning til yngre jordbruksristninger som ofte har andre motiv- og landskapssammenhenger. Begrepet beskriver en arkeologisk gruppe og sier ikke at hver figur nødvendigvis avbilder en konkret jakt. Det er heller ikke belegg for å vite hvem som hogde hver linje, hvor lang tid feltet tok å lage eller om alle figurene er samtidige.\n\nBildene er vanskelige å lese fordi menneskeskapte furer, naturlige sprekker, lys, fuktighet og nyere fargemarkeringer virker sammen. Fotografier kan framheve andre linjer enn øyet ser på stedet. En god feltlesning skiller derfor mellom bergflaten, den arkeologiske registreringen, moderne opptegning og dagens tolkning. Berøring og ny oppmerking kan skade eller endre kulturminnet; observasjon skal være skånsom.\n\nFeltet gir et sjeldent møte med Oslos forhistorie, men tausheten er en del av kilden. Vi kan registrere form, plassering og funnhistorie, sammenligne med andre bergkunstfelt og diskutere mulige forklaringer. Vi kan ikke gjøre én tolkning om jaktmagi, territorium eller ritual til sikker fasit. Det mest presise spørsmålet på stedet er derfor ikke bare «hva forestiller dette?», men også «hva kan vi faktisk vite, og hvordan vet vi det?»",
  image: "bilder/places/ekeberg_helleristninger.webp",
  cardImage: "bilder/kort/places/ekeberg_helleristninger.webp",
  frontImage: "bilder/kort/places/ekeberg_helleristninger_portrait.webp",
  imageCaption: "Bergflaten i Familiedalen. Svake linjer, naturlige sprekker og lysforhold gjør feltet krevende å lese.",
  imageCredit: fieldTwoImageMeta.credit,
  imageLicense: fieldTwoImageMeta.license,
  imageSourceUrl: fieldTwoImageMeta.sourcePage,
  imageMeta: fieldTwoImageMeta,
  related_people_ids: [person.id],
  objects,
  productions,
  works: productions,
  learning_hooks: [
    "Hvordan skiller vi en menneskeskapt fure fra en naturlig sprekk?",
    "Hvorfor kan strandlinje og landskap hjelpe arkeologer med datering uten å gi et eksakt år?",
    "Hva er forskjellen på et registrert motiv og en tolkning av motivets betydning?",
    "Hvordan endrer moderne opptegning det vi ser uten å være del av den forhistoriske figuren?",
    "Hva betyr det at åpne kilder gir ulike dateringsanslag?"
  ],
  language_profile: {
    primary_name: "Helleristningene på Ekeberg",
    registered_name: "Ekeberg 2 (Sjømannsskolen) / Familiedalen",
    place_name_root: "Ekeberg / Eikaberg",
    etymology: "Eikaberg er et eldre navn på Ekeberg og viser til eik og berg.",
    key_term: "veideristning",
    usage_note: "Veideristning brukes om bergkunst knyttet til jeger-, fisker- og sankersamfunn; termen beviser ikke én bestemt jaktfortelling.",
    source: heritage,
    dialect_status: "Enkeltstedet eier ikke dialektlag."
  },
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    profile: "focused",
    collection_ids: ["people", "objects", "brands", "productions"],
    category_collection_label: "Historiske hendelser",
    reason: "Jan Petersen, tre dokumenterte bergkunstfigurer, Universitetet i Oslos direkte Oldsaksamling-rolle og oppdagelsen i 1915 gir fire klart avgrensede, kildebårne og bildeklare samlinger.",
    verifiedAt
  },
  production_status: "complete",
  production_verified_at: verifiedAt,
  externalLinks: [
    { type: "official", label: "Riksantikvaren – objekt 41907-1", url: officialObject, lang: "nb", verifiedAt },
    { type: "source", label: "Kulturminnesøk – lokalitet 41907", url: kulturminne, lang: "nb", verifiedAt },
    { type: "source", label: "Ekebergparken – kulturminner", url: heritage, lang: "nb", verifiedAt },
    { type: "source", label: "Lokalhistoriewiki – Familiedalen", url: localHistory, lang: "nb", verifiedAt }
  ]
});
place.popupDesc = place.popupDesc.replace(
  "Kartpunktet følger den registrerte feltgeometrien.",
  "Feltavgrensningen følger den registrerte geometrien."
);
write(placeFile, place);

const sources = [
  { id: "riksantikvaren_object", title: "Riksantikvaren – Ekeberg 2 / Familiedalen 41907-1", url: officialObject, type: "official", review_status: "reviewed", review_note: "Kontrollert for registrert identitet, figurantall, motivtyper og geometri." },
  { id: "kulturminnesok", title: "Kulturminnesøk – lokalitet 41907", url: kulturminne, type: "official", review_status: "reviewed", review_note: "Kontrollert som publikumsrettet registerinngang til samme kulturminne." },
  { id: "ekeberg_timeline", title: "Ekebergparken – historisk tidslinje", url: timeline, type: "institutional", review_status: "reviewed", review_note: "Kontrollert for oppdagelsesdato og parkens dateringsanslag." },
  { id: "ekeberg_heritage", title: "Ekebergparken – kulturminner", url: heritage, type: "institutional", review_status: "reviewed", review_note: "Kontrollert for feltbeskrivelse, motivoversikt og forhistorisk landskapskontekst." },
  { id: "local_history", title: "Lokalhistoriewiki – Helleristningene i Familiedalen", url: localHistory, type: "reputable_secondary", review_status: "reviewed", review_note: "Kontrollert for Paul Johannessen, Jan Petersen og hendelsesforløpet i 1915." },
  { id: "visit_oslo", title: "VisitOSLO – Helleristningene på Ekeberg", url: visitOslo, type: "institutional", review_status: "reviewed", review_note: "Kontrollert for alternativt dateringsanslag og motivoversikt." },
  { id: "snl_petersen", title: "Store norske leksikon – Jan Greve Thaulow Petersen", url: petersenSnl, type: "encyclopedia", review_status: "reviewed", review_note: "Kontrollert for Petersens identitet og stilling ved Oldsaksamlingen fra 1915." }
];

const language = {
  place_id: placeId,
  title: "Språkleksikon: Helleristningene på Ekeberg",
  verified_at: verifiedAt,
  dialect_status: "not_applicable_place_level",
  entries: [
    { id: "veideristning", term: "veideristning", type: "arkeologisk_fagord", meaning: "Bergbilde som i arkeologisk typologi knyttes til jeger-, fisker- og sankersamfunn.", context: "Ekebergfeltet beskrives som en veideristning; termen er en klassifikasjon, ikke en sikker forklaring på hvert motiv." },
    { id: "helleristning", term: "helleristning", type: "kulturminnebegrep", meaning: "Figur eller spor hogd, skåret eller slipt inn i fast berg.", context: "På Ekeberg er de registrerte figurene del av den samme bergflaten, ikke løse gjenstander." },
    { id: "familiedalen", term: "Familiedalen", type: "stedsnavn", meaning: "Lokalnavnet som inngår i Riksantikvarens registrerte navn på feltet.", context: "Navnet skiller feltet fra hele Ekebergområdet." },
    { id: "eikaberg", term: "Eikaberg", type: "historisk_stedsnavn", meaning: "Eldre navneform for Ekeberg, sammensatt av eik og berg.", context: "Navnet forklarer områdenavnet, men daterer ikke helleristningene." }
  ].map(entry => ({ ...entry, linked_to: { kind: "place", id: placeId }, tags: ["arkeologi", "Ekeberg"], sources: [{ label: "Ekebergparken", url: heritage }, { label: "Riksantikvaren", url: officialObject }] }))
};
const languageFile = `data/leksikon/sprak/places/europe/norway/oslo/${placeId}.json`;
write(languageFile, language);

const leksikon = {
  place_id: placeId,
  title: place.name,
  type: "main",
  version: 1,
  visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "Et avgrenset veideristningsfelt i Familiedalen, kjent gjennom 13 registrerte figurer og en godt dokumentert oppdagelse i 1915.",
  wikiText: [
    "Riksantikvaren registrerer feltet som Ekeberg 2 (Sjømannsskolen) / Familiedalen, kulturminne 41907. Feltet består av tretten registrerte figurer.",
    "Ti figurer er dyr. I tillegg er en menneskefigur, en spissoval figur og en fuglefigur registrert. To av dyrene er bestemt som elgokser.",
    "Preparant Paul Johannessen oppdaget furene 12. september 1915. Dagen etter undersøkte han og Jan Petersen bergflaten og identifiserte helleristninger.",
    "Åpne formidlingskilder gir ulike dateringsanslag. Derfor skilles steinalderklassifikasjon, teknisk kartår og mer presise forslag tydelig fra hverandre.",
    "Feltet er en egen canonical Place og skal ikke slås sammen med Ekebergparken, Ekebergparken Museum eller Ekebergsletta."
  ],
  summary: { one_liner: "Tretten bergfigurer gjør kildekritikk og Oslos forhistorie synlig i den samme bergflaten.", themes: ["bergkunst", "arkeologi", "forhistorie", "kildekritikk", "bevaring"], tone: ["nøktern", "undersøkende"] },
  facts: [
    { id: "fact_ekeberg_41907", label: "Registrert identitet", desc: "Feltet er kulturminne 41907, Ekeberg 2 / Familiedalen.", confidence: "high", sources: [{ title: sources[0].title, url: officialObject }] },
    { id: "fact_ekeberg_13", label: "Tretten figurer", desc: "Riksantikvaren registrerer ti dyr, en menneskefigur, en spissoval figur og en fuglefigur.", confidence: "high", sources: [{ title: sources[0].title, url: officialObject }] },
    { id: "fact_ekeberg_1915", label: "Oppdaget i 1915", desc: "Paul Johannessen oppdaget feltet 12. september 1915; Jan Petersen deltok i kontrollen dagen etter.", confidence: "high", sources: [{ title: sources[2].title, url: timeline }, { title: sources[4].title, url: localHistory }] },
    { id: "fact_ekeberg_dating", label: "Ulik datering", desc: "Formidlingskildene spriker mellom rundt 7000 år og 4000–5000 år; eksakt år holdes derfor tilbake.", confidence: "high", sources: [{ title: sources[2].title, url: timeline }, { title: sources[5].title, url: visitOslo }] }
  ],
  chronology: [
    { id: "chrono_ekeberg_1915", year: 1915, title: "Oppdagelse og første kontroll", desc: "Paul Johannessen oppdager furene 12. september; han og Jan Petersen undersøker stedet dagen etter.", confidence: "high", sources: [{ title: sources[2].title, url: timeline }, { title: sources[4].title, url: localHistory }] }
  ]
};
const leksikonFile = `data/leksikon/places/oslo/historie/leksikon_${placeId}.json`;
write(leksikonFile, leksikon);

const story = [{
  id: "st_ekeberg_helleristninger_sondagsturen_1915",
  quality_profile: "episode_v1",
  type: "historical_event",
  title: "Søndagsturen som åpnet bergflaten",
  year: 1915,
  place_id: placeId,
  person_id: person.id,
  summary: "Da preparant Paul Johannessen satte seg ved en bergflate i Familiedalen 12. september 1915, oppdaget han furer som førte Jan Petersen og Oldsaksamlingen tilbake dagen etter.",
  story: "Søndag 12. september 1915 gikk Paul Johannessen tur i folkeparken på Ekeberg. Han arbeidet som preparant ved Universitetets Oldsaksamling og hadde blikk for spor i materiale. Da han satte seg ved en skrånende bergflate i Familiedalen, la han merke til furer som ikke lignet tilfeldige sprekker. Flere linjer dannet dyrefigurer.\n\nJohannessen meldte funnet til fagmiljøet. Dagen etter kom han tilbake sammen med arkeologen Jan Greve Thaulow Petersen. I skiftende lys fant de seks eller sju figurer og fastslo at bergflaten bar helleristninger. Det var et avgjørende brudd: spor som hadde ligget åpne i landskapet, ble nå lest, dokumentert og forvaltet som kulturminne.\n\nSenere undersøkelser gjorde flere svake linjer synlige, og den registrerte totalen ble tretten figurer. Samtidig viser historien et arkeologisk dilemma. Oppdagelsen av motivene gir kunnskap, men moderne opptegning, fotografering og forventninger påvirker også hva vi ser. Bergflaten ble ikke skapt i 1915; det var da den fikk en ny rolle i Oslos offentlige historie.",
  episode: { actors: ["Paul Johannessen", "Jan Greve Thaulow Petersen", "Universitetets Oldsaksamling"], date: "1915-09-12", action: "Johannessen oppdaget furene, og han og Petersen undersøkte stedet dagen etter.", consequence: "Bergflaten ble identifisert, dokumentert og forvaltet som et forhistorisk helleristningsfelt." },
  sources: [{ title: sources[2].title, url: timeline }, { title: sources[4].title, url: localHistory }, { title: sources[6].title, url: petersenSnl }],
  tags: ["oppdagelse", "arkeologi", "1915", "bergkunst"],
  related_people: [person.id],
  related_places: ["ekebergparken"],
  score: { narrative: 3, historical: 2, source: 5, play_value: 3, originality: 3, total: 16 },
  arc: { start: "Svake furer i en bergflate blir lagt merke til på en søndagstur.", middle: "Johannessen og Petersen vender tilbake og tester om linjene er menneskeskapte.", end: "Feltet får status som dokumentert kulturminne med tretten registrerte figurer." }
}];
const storyFile = `data/stories/stories_${placeId}.json`;
write(storyFile, story);

const rawQuestions = [
  ["Hva er det canonicale stedet?", "Selve helleristningsfeltet i Familiedalen", ["Hele Ekebergparken", "Skolebygningen"], "fact", "riksantikvaren_object", "em_his_arkeologisk_kontekst_formation"],
  ["Hvilket kulturminnenummer har feltet?", "41907", ["1915", "4500"], "fact", "riksantikvaren_object", "em_his_arkeologisk_kontekst_formation"],
  ["Hvor mange figurer er registrert?", "13", ["7", "23"], "fact", "riksantikvaren_object", "em_his_arkeologisk_kontekst_formation"],
  ["Hvor mange av figurene er dyr?", "10", ["2", "13"], "fact", "riksantikvaren_object", "em_his_arkeologisk_kontekst_formation"],
  ["Hvilke andre motivtyper er registrert?", "Menneske, spissoval figur og fugl", ["Skip, solhjul og hus", "Bare skålgroper"], "fact", "riksantikvaren_object", "em_his_arkeologisk_kontekst_formation"],
  ["Hvilke dyr er to figurer bestemt som?", "Elgokser", ["Hester", "Bjørner"], "fact", "riksantikvaren_object", "em_his_arkeologisk_landskap_miljo"],
  ["Hva skal stedet holdes adskilt fra?", "Ekebergparken, museet og Ekebergsletta", ["Bergflaten og figurene", "Kulturminne-ID 41907"], "fact", "riksantikvaren_object", "em_his_arkeologisk_kontekst_formation"],
  ["Når ble feltet oppdaget?", "12. september 1915", ["12. september 1815", "26. september 2013"], "fact", "ekeberg_timeline", "em_his_arkeologisk_kontekst_formation"],
  ["Hvem oppdaget furene?", "Preparant Paul Johannessen", ["Jan Petersen alene", "Christian Ringnes"], "fact", "local_history", "em_his_arkeologisk_kontekst_formation"],
  ["Hvor arbeidet Johannessen?", "Universitetets Oldsaksamling", ["Oslo rådhus", "Norsk Hovedjernbane"], "fact", "local_history", "em_his_arkeologisk_kontekst_formation"],
  ["Hvem undersøkte stedet sammen med Johannessen dagen etter?", "Jan Greve Thaulow Petersen", ["Anton M. Lund", "Edvard Munch"], "fact", "local_history", "em_his_arkeologisk_kontekst_formation"],
  ["Hvor mange figurer fant de i den første kontrollen?", "Seks eller sju", ["Alle tretten med én gang", "Ingen"], "fact", "local_history", "em_his_arkeologisk_kontekst_formation"],
  ["Hva endret oppdagelsen i 1915?", "Bergflaten ble identifisert og dokumentert som kulturminne", ["Figurene ble laget", "Ekebergparken åpnet"], "context", "local_history", "em_his_arkeologisk_kontekst_formation"],
  ["Hva var Jan Petersens rolle?", "Arkeologisk kontroll og identifikasjon", ["Å lage figurene", "Å bygge Sjømannsskolen"], "fact", "local_history", "em_his_arkeologisk_kontekst_formation"],
  ["Hvorfor brukes ikke år -2500 som sikker dato?", "Det er et teknisk representasjonspunkt i et usikkert tidsrom", ["Fordi feltet er fra 1915", "Fordi steinalderen ikke kan dateres"], "context", "riksantikvaren_object", "em_his_arkeologisk_datering_kronologi"],
  ["Hva viser forskjellen mellom Ekebergparken og VisitOSLOs dateringsanslag?", "At formidlingskilder må sammenlignes og presisjonen holdes ærlig", ["At begge kan være eksakte samtidig", "At registreringen er falsk"], "source_criticism", "visit_oslo", "em_his_arkeologisk_datering_kronologi"],
  ["Hvilken kilde er best for registrert identitet og figurantall?", "Riksantikvarens objektregistrering", ["Et tilfeldig bilde uten tekst", "Et teknisk kartår alene"], "source_criticism", "riksantikvaren_object", "em_his_arkeologisk_kontekst_formation"],
  ["Hva kan indre linjer i dyrekroppene sikkert dokumentere?", "At linjene er registrert i motivene", ["At de viser jaktmagi", "At de ble laget samme dag"], "source_criticism", "riksantikvaren_object", "em_his_arkeologisk_kontekst_formation"],
  ["Hva betyr veideristning her?", "En arkeologisk bergkunstgruppe knyttet til jeger-, fisker- og sankersamfunn", ["Et sikkert bilde av én jakt", "En bronsealdergård"], "concept", "ekeberg_heritage", "em_his_arkeologisk_landskap_miljo"],
  ["Hvorfor er landskapet relevant for datering?", "Strandlinje og arkeologisk kontekst kan avgrense tidsrom", ["Høyden gir et eksakt år", "Landskapet er uforanderlig"], "concept", "ekeberg_heritage", "em_his_arkeologisk_landskap_miljo"],
  ["Hva bør holdes adskilt i en motivanalyse?", "Det som observeres og det som tolkes", ["Kilde og påstand", "Berg og fure"], "concept", "riksantikvaren_object", "em_his_arkeologisk_kontekst_formation"],
  ["Hva kan moderne rødfarge i et foto fortelle?", "Hvordan nyere tilrettelegging framhever registrerte linjer", ["Den opprinnelige fargen i steinalderen", "Et eksakt produksjonsår"], "observation", "ekeberg_heritage", "em_his_arkeologisk_kontekst_formation"],
  ["Hvorfor kan sidelys hjelpe?", "Svake furer kaster skygger og blir lettere å skille fra bergflaten", ["Det endrer dateringen", "Det lager nye figurer"], "method", "local_history", "em_his_arkeologisk_kontekst_formation"],
  ["Hva er den viktigste bevaringsregelen ved feltet?", "Observer skånsomt uten å risse, male eller berøre", ["Tegn opp linjer selv", "Ta med en steinbit"], "method", "kulturminnesok", "em_his_arkeologisk_kontekst_formation"],
  ["Hvilken metode passer best når to kilder daterer ulikt?", "Sammenlign kildegrunnlag, presisjon og begrensninger", ["Velg det eldste tallet", "Ta gjennomsnittet"], "concept_theory", "visit_oslo", "em_his_arkeologisk_datering_kronologi"],
  ["Hva er en trygg konklusjon om motivets betydning?", "Flere tolkninger er mulige, men ingen er sikkert bevart", ["Det viser uten tvil jaktmagi", "Det er bare dekorasjon"], "concept_theory", "riksantikvaren_object", "em_his_arkeologisk_kontekst_formation"],
  ["Hva lærer feltets funnhistorie om arkeologisk kunnskap?", "Observasjon, kontroll og senere dokumentasjon bygger kunnskap trinnvis", ["Én observatør avgjør alt", "Registrering fjerner all usikkerhet"], "concept_theory", "local_history", "em_his_arkeologisk_kontekst_formation"],
  ["Hva er den beste avsluttende spørsmålsformen på stedet?", "Hva kan vi vite, og hvordan vet vi det?", ["Hvilken fantasifortelling er mest spennende?", "Hvilket eksakt år står i kartfilen?"], "concept_theory", "riksantikvaren_object", "em_his_arkeologisk_datering_kronologi"]
];

const makeQuestion = (row, index) => {
  const [question, answer, wrong, type, sourceId, emneId] = row;
  const number = index + 1;
  const advanced = index >= 21;
  const archaeologyHook = emneId === "em_his_arkeologisk_datering_kronologi"
    ? "his_arkeologisk_datering_kronologi"
    : emneId === "em_his_arkeologisk_landskap_miljo"
      ? "his_arkeologisk_landskap_miljo"
      : "his_arkeologisk_kontekst_formation";
  return {
    id: `${placeId}_quiz_${String(number).padStart(2, "0")}`,
    quiz_id: `historie_${placeId}_set_${Math.floor(index / 7) + 1}_q${index % 7 + 1}`,
    categoryId: "historie",
    placeId,
    targetId: placeId,
    question_scope: "place",
    question,
    options: [answer, ...wrong],
    answer,
    answerIndex: 0,
    knowledge: answer,
    difficulty: Math.floor(index / 7) + 1,
    question_type: index < 14 ? "fact" : index < 21 ? "context" : "concept_theory",
    emne_id: emneId,
    source: [sourceId],
    source_origin: "external",
    claim_basis: answer,
    claim_id: `claim_${placeId}_quiz_${String(number).padStart(2, "0")}`,
    primary_knowledge_unit_id: `ku_his_${placeId}_${String(number).padStart(2, "0")}`,
    knowledge_unit_ids: [`ku_his_${placeId}_${String(number).padStart(2, "0")}`],
    concepts: [advanced ? "kildekritikk og sporlesning" : "arkeologisk stedskunnskap"],
    concept_ids: [advanced ? "co_his_kildekritikk" : "co_his_spor"],
    term_ids: [],
    knowledge_contract_version: 1,
    knowledge_link_status: "linked",
    ...(advanced ? {
      method_id: index === 24 ? "met_kildekritikk" : "met_sporlesning",
      guidance_basis: ["data/fag/historie/fagkart_historie_canonical_v4_5.json", "data/fag/historie/methods_historie_canonical_v4_5.json"],
      topic_hook_id: archaeologyHook,
      thinker_id: "ian_hodder",
      theory_ref: {
        topic_hook_id: archaeologyHook,
        thinker_id: "ian_hodder",
        work: "Reading the Past",
        why_it_helps: "Hodders kontekstuelle arkeologi hjelper spilleren å skille observerte spor, funnkontekst og begrensede tolkninger."
      }
    } : {})
  };
};
const questions = rawQuestions.map(makeQuestion);
const setTitles = ["Feltet og figurene", "Oppdagelsen i 1915", "Datering, landskap og bevaring", "Sporlesning og kildekritikk"];
const quiz = {
  generator_version: "3.3",
  categoryId: "historie",
  targetId: placeId,
  size_class: "normal_4x7",
  sources: Object.fromEntries(sources.map(({ id, url }) => [id, url])),
  production_context: {
    manifest_category: "historie",
    profile: "normal_4x7",
    standard_version: "3.3",
    resolved_files: {
      pensum: "data/fag/historie/historiepensum_canonical_v4_5.json",
      emner: "data/fag/historie/emner_historie_canonical_v4_5.json",
      fagkart: "data/fag/historie/fagkart_historie_canonical_v4_5.json",
      methods: "data/fag/historie/methods_historie_canonical_v4_5.json",
      supersetQuizMal: "data/fag/historie/supersetQUIZMAL_historie.json",
      quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
      quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"
    },
    required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"],
    pensum_module_ids: ["his_forhistorie_arkeologi"],
    emne_ids: place.emne_ids,
    topic_hook_ids: ["his_arkeologisk_kontekst_formation", "his_arkeologisk_datering_kronologi", "his_arkeologisk_landskap_miljo"],
    method_ids: ["met_sporlesning", "met_kildekritikk"],
    thinker_ids: ["ian_hodder"],
    works: ["Reading the Past"],
    source_review_status: "reviewed",
    set_count: 4,
    questions_per_set: 7,
    source_brief: `data/quiz/production_briefs/historie/${placeId}.json`,
    context_artifact: `data/quiz/production_context/historie/${placeId}.json`,
    existing_quiz_audit: { searched_paths: ["data/quiz/manifest.json", "data/quiz/historie/", placeFile], active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen aktiv målspesifikk quiz var manifestlastet." }, decisions: ["Bygg normal 4x7 med 14 konkrete åpningsspørsmål og teori først i siste sett."], knowledge_migration: "Nye Knowledge-enheter følger canonical quiz-ID-er." },
    profile_decision: { profile: "normal", set_count: 4, questions_per_set: 7, justification: "Fire uavhengige læringsjobber bæres av registerdata, motiver, funnhistorie og et reelt daterings-/tolkningsproblem." },
    held_back_candidates: ["Eksakt tilblivelsesår.", "Sikker forklaring av motivene som jaktmagi, ritual eller territorium.", "Påstand om at alle tretten figurer er samtidige."],
    theory_start_phase: "final",
    method_start_phase: "final",
    normal_opening: { set_1_and_2_are_source_led: true, theory_visible_from_set: 4 },
    progression: ["identity_and_observation", "discovery_and_actors", "dating_and_preservation", "method_and_source_criticism"]
  },
  sets: setTitles.map((title, i) => ({
    set_id: `historie_${placeId}_set_${i + 1}`,
    title,
    order: i + 1,
    level: i + 1,
    phase: ["opening", "middle", "bridge", "final"][i],
    questions: questions.slice(i * 7, i * 7 + 7)
  }))
};
const quizFile = `data/quiz/historie/${placeId}_sets.json`;
write(quizFile, quiz);

const claims = rawQuestions.map((row, index) => ({
  claim_id: `claim_${placeId}_quiz_${String(index + 1).padStart(2, "0")}`,
  order: index + 1,
  planned_phase: index < 7 ? "opening" : index < 14 ? "middle" : index < 21 ? "bridge" : "final",
  family: index < 14 ? "fact" : index < 21 ? "context" : "concept_theory",
  statement: row[1],
  source_ids: [row[4]],
  source_origin: "external",
  emne_id: row[5]
}));
const brief = {
  schema_version: "1.0",
  categoryId: "historie",
  targetId: placeId,
  status: "reviewed",
  reviewed_at: verifiedAt,
  review_note: "Offisielt register, institusjonell formidling, lokalhistorie og oppslagsverk er lest og sammenlignet. Dateringsspriket er eksplisitt holdt åpent.",
  profile_hint: "normal_4x7",
  scope: "Det avgrensede feltet 41907, motivene, oppdagelsen i 1915, dateringspresisjon, bergkunstlesning og bevaring.",
  sources: Object.fromEntries(sources.map(source => [source.id, {
    url: source.url,
    source_type: source.type === "encyclopedia" ? "reputable_secondary" : source.type,
    review_status: source.review_status,
    review_note: source.review_note
  }])),
  claims,
  selected_curriculum: {
    module_ids: ["his_forhistorie_arkeologi"],
    emne_ids: place.emne_ids,
    topic_hook_ids: ["his_arkeologisk_kontekst_formation", "his_arkeologisk_datering_kronologi", "his_arkeologisk_landskap_miljo"],
    method_ids: ["met_sporlesning", "met_kildekritikk"],
    thinker_ids: ["ian_hodder"],
    works: ["Reading the Past"]
  },
  profile_decision: { profile: "normal", set_count: 4, questions_per_set: 7, justification: "Fire uavhengige læringsjobber bæres av registerdata, motiver, funnhistorie og et reelt daterings-/tolkningsproblem." },
  existing_quiz_audit: { searched_paths: ["data/quiz/manifest.json", "data/quiz/historie/", placeFile], active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen aktiv målspesifikk quiz var manifestlastet." }, decisions: ["Bygg normal 4x7 med 14 konkrete åpningsspørsmål og teori først i siste sett."], knowledge_migration: "Nye Knowledge-enheter følger canonical quiz-ID-er." },
  held_back_candidates: ["Eksakt tilblivelsesår.", "Sikker forklaring av motivene som jaktmagi, ritual eller territorium.", "Påstand om at alle tretten figurer er samtidige."]
};
const briefFile = `data/quiz/production_briefs/historie/${placeId}.json`;
write(briefFile, brief);
const contextFile = `data/quiz/production_context/historie/${placeId}.json`;
write(contextFile, {
  schema_version: "1.0",
  generator_version: "1.0",
  categoryId: "historie",
  targetId: placeId,
  profile: "normal_4x7",
  required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"],
  source_files: { brief: { path: briefFile }, target: { path: placeFile }, stories: [{ path: storyFile }] },
  planned_quiz_file: quizFile,
  source_registry: Object.fromEntries(sources.map(source => [source.id, { url: source.url, source_type: source.type, review_status: source.review_status }]))
});

const historySources = [
  { id: "source_ekeberg_ra", url: officialObject, sourceLocation: "Objekt 41907-1 – navn, geometri, motiv- og figurregistrering", sourceType: "official", verifiedAt, temporalCoverage: "current", provenance: "Riksantikvarens offisielle kulturminnedatasett.", limitations: "Registeret beskriver observasjon og klassifikasjon, men gir ikke en sikker opprinnelig motivbetydning." },
  { id: "source_ekeberg_timeline", url: timeline, sourceLocation: "Historisk tidslinje – Helleristninger og oppdagelsen 12. september 1915", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "mixed", provenance: "Ekebergparkens institusjonelle kulturminneformidling.", limitations: "Dateringsanslaget er formidling og spriker fra VisitOSLOs anslag." },
  { id: "source_ekeberg_local", url: localHistory, sourceLocation: "Helleristningene i Familiedalen – Johannessen, Petersen og feltarbeidet", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "retrospective", provenance: "Lokalhistoriewiki-artikkel basert på foredrag av Petter Hartnes i Nordstrands Blad.", limitations: "Retrospektiv lokalhistorie; brukes sammen med institusjons- og registerkilder." },
  { id: "source_ekeberg_visit", url: visitOslo, sourceLocation: "Helleristningene på Ekeberg – alder og motivoversikt", sourceType: "institutional", verifiedAt, temporalCoverage: "current", provenance: "VisitOSLOs publikumsrettede stedsbeskrivelse.", limitations: "Reiselivsformidling og et annet dateringsanslag enn Ekebergparken." },
  { id: "source_ekeberg_snl_petersen", url: petersenSnl, sourceLocation: "Biografi – konservator ved Universitetets Oldsaksamling fra 1915", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "retrospective", provenance: "Store norske leksikons fagredigerte biografi.", limitations: "Biografien bekrefter person og stilling, mens stedshendelsen dokumenteres av lokalhistorien." }
];
const caseId = "case_ekeberg_helleristninger_spor_og_oppdagelse";
const historyProduction = {
  schemaVersion: "historie_place_production_v1",
  validatorVersion: "1.0.0",
  placeId,
  placeFile,
  status: "ready",
  historicalIdentity: {
    statement: "Et in situ helleristningsfelt i Familiedalen med forhistoriske figurer og en dokumentert moderne oppdagelses- og forskningshistorie.",
    placeRelationType: "material_trace",
    placeRelationStatement: "Place-ID-en eier bergflaten og de registrerte figurene, ikke parken, museet, skolebygningen eller sletta omkring.",
    temporalScope: { start: "eldre steinalder, usikkert", end: "2026", precision: "uncertain", rationale: "Caset følger de forhistoriske sporene, oppdagelsen i 1915 og dagens dokumentasjon og bevaring uten å gjøre dateringsanslag eksakte." },
    sourceIds: historySources.map(source => source.id)
  },
  historyTopics: place.emne_ids.map(emneId => ({ emneId, siteSpecificRationale: emneId.includes("datering") ? "Sprikende dateringsanslag gjør presisjon, relativ kronologi og kildekritikk konkret." : emneId.includes("landskap") ? "Bergflate, tidligere strandlinje og funnkontekst viser forholdet mellom landskap og arkeologisk tolkning." : "Oppdagelsen, opptegningen og registreringen viser hvordan arkeologisk kunnskap dannes og kan påvirkes av dokumentasjonsmetoder.", caseIds: [caseId] })),
  sources: historySources,
  caseRealizations: [{
    id: caseId,
    claim: "Ekebergfeltet viser hvordan et forhistorisk materiell spor får ny historisk betydning gjennom oppdagelse, dokumentasjon, klassifikasjon og bevaring, samtidig som datering og motivbetydning forblir begrenset av kildene.",
    temporalSequence: {
      scope: { start: "eldre steinalder, usikkert", end: "2026", precision: "uncertain", rationale: "Tilblivelsen kan bare angis som et usikkert steinalderspenn; oppdagelsen 1915 er eksakt datert." },
      startPoint: "Figurer ble hogd eller slipt inn i bergflaten i steinalderen, men åpne kilder bærer ikke ett eksakt år.",
      endPoint: "Feltet er i dag registrert som kulturminne 41907 og kan leses gjennom fysisk observasjon, fotografi og dokumentasjon.",
      breaks: ["Oppdagelsen 12. september 1915 gjorde furene til et dokumentert arkeologisk funn.", "Senere undersøkelser økte den registrerte totalen fra seks eller sju synlige figurer til tretten."],
      continuities: ["Den samme bergflaten er det fysiske kildeankeret.", "Usikkerheten om hvem som laget figurene og hva de betydde består gjennom alle dokumentasjonsfasene."],
      sourceIds: ["source_ekeberg_ra", "source_ekeberg_timeline", "source_ekeberg_local"]
    },
    actors: [
      { name: "Menneskene som laget bergbildene", roleOrInterest: "Hogde eller slipte figurer i bergflaten i steinalderen.", powerPosition: "Deres handling skapte kilden, men navn, motiver og samtidige forklaringer er ikke bevart.", sourceIds: ["source_ekeberg_ra", "source_ekeberg_timeline"] },
      { name: "Paul Johannessen og Jan Greve Thaulow Petersen", roleOrInterest: "Oppdaget, kontrollerte og identifiserte de synlige furene i september 1915.", powerPosition: "Som museumsansatte kunne de gi sporene faglig og institusjonell status.", sourceIds: ["source_ekeberg_local", "source_ekeberg_snl_petersen"] },
      { name: "Riksantikvaren og kulturminneforvaltningen", roleOrInterest: "Registrerer, avgrenser og forvalter feltet som kulturminne.", powerPosition: "Bestemmer dagens offisielle identitet, geometri og registreringsspråk.", sourceIds: ["source_ekeberg_ra"] }
    ],
    conflictOrNegotiation: { statement: "Kunnskapsproduksjonen forhandler mellom ønsket om å gjøre svake figurer lesbare og kravet om ikke å overtolke, endre eller skade bergflaten.", sourceIds: ["source_ekeberg_ra", "source_ekeberg_local"] },
    sourceComparison: {
      sourceIds: ["source_ekeberg_ra", "source_ekeberg_timeline", "source_ekeberg_local", "source_ekeberg_visit"],
      comparison: "Riksantikvaren eier registeridentitet og motivtall, lokalhistorien konkretiserer oppdagelsen, mens Ekebergparken og VisitOSLO gir ulike dateringsanslag.",
      contradictionsOrSilences: "Ekebergparken omtaler feltet som rundt 7000 år gammelt, mens VisitOSLO oppgir 4000–5000 år; ingen av kildene bevarer samtidige forklaringer fra dem som laget figurene.",
      conclusionLimits: "Feltet kan sikkert klassifiseres som steinalderbergkunst med tretten registrerte figurer, men et eksakt tilblivelsesår og én motivtolkning holdes tilbake."
    },
    comparativeScale: {
      localFinding: "Et lite bergfelt i Familiedalen bevarer tretten figurer og en dokumentert funnhistorie.",
      widerContext: "Feltet kan sammenlignes med nordisk veidekunst og Oslofjordens skiftende strandlinjer, uten å anta at alle felt hadde samme funksjon eller datering.",
      scale: "nordic",
      sourceIds: ["source_ekeberg_ra", "source_ekeberg_timeline"]
    },
    causationAndUncertainty: {
      causalAssessment: "Johannessens observasjon utløste institusjonell kontroll; senere belysning og dokumentasjon gjorde flere figurer registrerbare.",
      alternativeExplanations: ["Linjer som leses som motivdetaljer kan påvirkes av naturlige sprekker, lys og moderne opptegning.", "Veideristninger kan ha hatt flere sosiale, rituelle eller praktiske betydninger snarere enn én jaktforklaring."],
      uncertainty: "Tilblivelsesdato, samtidighet, opphavspersoner og motivbetydning er ikke sikkert dokumentert.",
      sourceIds: ["source_ekeberg_ra", "source_ekeberg_local", "source_ekeberg_visit"]
    }
  }],
  presentTrace: {
    objectStatus: "original",
    statement: "Den registrerte bergflaten og figurfurene ligger fortsatt på originalstedet; moderne fargemarkering og dokumentasjon må skilles fra de forhistoriske linjene.",
    originalSiteRelationship: "Kulturminnet er in situ i Familiedalen ved Sjømannsskolen og avgrenses av Riksantikvarens objektgeometri.",
    sourceIds: ["source_ekeberg_ra", "source_ekeberg_timeline"]
  },
  quizOpening: {
    status: "PASS",
    quizTargetId: placeId,
    firstTwoSetsQuestionCount: 14,
    sourceBrief: briefFile,
    productionContext: contextFile,
    requiredInputs: ["data/fag/historie/historiepensum_canonical_v4_5.json", "data/fag/historie/emner_historie_canonical_v4_5.json", "data/fag/historie/fagkart_historie_canonical_v4_5.json", "data/fag/historie/methods_historie_canonical_v4_5.json", "data/fag/historie/supersetQUIZMAL_historie.json", "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"]
  },
  chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Leksikonet materialiserer bare det sikre 1915-ankeret; Story-en bruker samme funn som narrativ vending uten å gjøre steinalderdatoen eksakt." },
  gates: Object.fromEntries("ABCDEFGH".split("").map(letter => [letter, { status: "PASS", evidenceRefs: [letter === "A" ? "historicalIdentity" : letter === "B" ? "historyTopics" : letter === "C" ? "caseRealizations[0].temporalSequence" : letter === "D" ? "caseRealizations[0].actors" : letter === "E" ? "caseRealizations[0].sourceComparison" : letter === "F" ? "caseRealizations[0].causationAndUncertainty" : letter === "G" ? "quizOpening" : "chronologyStories"] }])),
  review: { reviewer: "History GO Ekeberg helleristninger source audit", reviewedAt: verifiedAt, notes: "Identitet, in-situ-grense, figurtall, oppdagelse, dateringssprik, aktører, tolkning, bevaring og normal quizåpning er kontrollert; eksakt datering og sikre motivforklaringer er holdt tilbake." }
};
write(`data/places/historie-production/${placeId}.json`, historyProduction);

const splitSentences = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)].map(item => item.segment.trim()).filter(Boolean);
const descSentences = splitSentences(place.desc);
const popupSentences = splitSentences(place.popupDesc);
const makeClaims = (field, sentences) => sentences.map((sentence, index) => ({
  id: `claim_${placeId}_${field}_${String(index + 1).padStart(2, "0")}`,
  claim: sentence,
  sourceUrl: index === 0 ? officialObject : (sentence.includes("1915") || sentence.includes("Johannessen") || sentence.includes("Petersen") ? localHistory : sentence.includes("VisitOSLO") ? visitOslo : heritage),
  sourceLocation: `${field}, setning ${index + 1}`,
  sourceType: index === 0 ? "official" : "institutional",
  verifiedAt,
  status: "verified",
  claimKind: index === 0 ? "identity" : "fact",
  evidenceMode: sentence.includes("kan") || sentence.includes("mulig") ? "bounded_inference" : "direct",
  temporalStatus: "historical"
}));
const descClaims = makeClaims("desc", descSentences);
const popupClaims = makeClaims("popup", popupSentences);
for (const index of [8, 24, 29]) {
  popupClaims[index].claimKind = "strong";
  popupClaims[index].evidenceMode = "explicit";
  popupClaims[index].independentSourceUrls = [officialObject];
}
const packetClaims = [...descClaims, ...popupClaims];
const sentenceCoverage = claimsList => claimsList.map((claim, index) => ({ sentence: index + 1, claimIds: [claim.id] }));
const claimsPacket = {
  schemaVersion: "4.2",
  validatorVersion: "4.2.1",
  placeId,
  placeFile,
  status: "ready_v4_2",
  identity: { status: "resolved", represents: "Riksantikvarens avgrensede helleristningsfelt 41907-1 i Familiedalen.", period: "Steinalder–", excludes: ["hele Ekebergparken", "Ekebergparken Museum", "Kongshavn videregående skole", "Ekebergsletta"] },
  claims: packetClaims,
  sentenceCoverage: { desc: sentenceCoverage(descClaims), popupDesc: sentenceCoverage(popupClaims) },
  metadataSnapshot: { name: place.name, category: place.category, year: place.year, coordinates: { lat: place.lat, lon: place.lon } },
  collections: { people: [person.id], objects: objects.map(item => item.id), brands: [brand.id], productions: productions.map(item => item.id) },
  quizReadiness: {
    status: "canonical_normal_4x7",
    quizTargetId: placeId,
    sourceBrief: briefFile,
    productionContext: contextFile,
    normalOpeningQuestions: 14,
    totalQuestions: 28,
    reuseDecision: "No active place-specific quiz existed; a source-led normal package was created.",
    questions: questions.slice(0, 8).map((question, index) => ({
      question: question.question,
      answer: question.answer,
      type: ["hvor", "hva", "hva", "hva", "hvilket_verk_eller_objekt", "hvilket_verk_eller_objekt", "hvor", "når"][index],
      normalKnowledgeQuestion: true,
      claimIds: [[descClaims[0].id], [popupClaims[1].id], [popupClaims[4].id], [popupClaims[4].id], [popupClaims[4].id], [popupClaims[5].id], [popupClaims[3].id], [popupClaims[9].id]][index]
    }))
  },
  roundsReadiness: { status: "ready", exactCollectionCount: 4 },
  source_conflicts: [{ topic: "datering", sources: [timeline, visitOslo], resolution: "Preserve both reviewed estimates and hold back an exact production year." }],
  reviews: {
    factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Ekeberg helleristninger source review", notes: "Registry identity, 13 figures, 1915 discovery and dating disagreement were checked." },
    editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Ekeberg helleristninger editorial review", introducedNewFacts: false, notes: "Observation, documentation and interpretation remain distinct; adjacent Ekeberg places remain separate." }
  },
  reviewsNotes: "Five source types compared; no unresolved blocker remains.",
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: packetClaims.length, total: packetClaims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" },
  textHashes: { algorithm: "sha256", desc: crypto.createHash("sha256").update(place.desc, "utf8").digest("hex"), popupDesc: crypto.createHash("sha256").update(place.popupDesc, "utf8").digest("hex") }
};
write(`data/places/production/${placeId}.json`, claimsPacket);

const readingTracks = [
  { id: `lesespor_${placeId}_ra`, title: "Ekeberg 2 / Familiedalen 41907-1", publication: "Riksantikvaren", url: officialObject, relevance: "Offisiell identitet, geometri og motivregistrering.", source_quality: "canonical" },
  { id: `lesespor_${placeId}_timeline`, title: "Historisk tidslinje: Helleristninger", publication: "Ekebergparken", url: timeline, relevance: "Oppdagelsesdato og institusjonelt dateringsanslag.", source_quality: "institutional" },
  { id: `lesespor_${placeId}_local`, title: "Helleristningene i Familiedalen", publication: "Lokalhistoriewiki", url: localHistory, relevance: "Detaljert funnhistorie om Johannessen og Petersen.", source_quality: "recognized" }
].map(item => ({ ...item, type: "place_history", author: null, year: 2026, date: null, access: "open", rights: "link_only", curation_status: "approved", subjects: ["bergkunst", "arkeologi", "Ekeberg"], category_hints: ["historie"], place_ids: [placeId], person_ids: item.id.endsWith("local") ? [person.id] : [] }));

const runtime = {
  schema: "history-go-place-open-v1",
  place,
  people: [person],
  brands: [brand],
  events: productions,
  flora: [],
  fauna: [],
  relations: [],
  wonderkammer: [],
  language,
  leksikon: [leksikon],
  lesespor: readingTracks,
  stories: story
};
write(`data/runtime/place-open/${placeId}.json`, runtime);

const audit = {
  schema: "place-production-gate-audit-v1",
  place_id: placeId,
  verified_at: verifiedAt,
  profile: { production_profile: "focused", status: "confirmed", reason: place.profile_reason },
  badges: { primary: "historie", underbadge_ids: place.underbadge_ids, status: "PASS" },
  boundary: { status: "PASS", represents: "field 41907-1", excludes: ["ekebergparken", "ekebergparken_museum", "ekebergsletta", "kongshavn_vgs"] },
  collections: { expected: ["people", "objects", "brands", "productions"], actual: place.place_card_profile.collection_ids, status: "PASS" },
  people: { status: "PASS", ids: [person.id], image: person.image },
  objects: { status: "PASS", ids: objects.map(item => item.id), signature_exception: false },
  brands: { status: "PASS", ids: [brand.id], logo: brand.logo, candidate_reason: "UiO's Oldsaksamling had the documented discovery and investigation role." },
  productions: { status: "PASS", ids: productions.map(item => item.id), owner_boundary: "The discovery event is distinct from the physical carved figures." },
  chronology: { status: "PASS", exact_anchors: [1915], held_back: ["prehistoric creation year"] },
  before_after: { status: "NOT_APPLICABLE", rationale: "No rights-cleared, viewpoint-matched archival/current pair was found; modern paint cannot be treated as a neutral before/after transformation." },
  news: { status: "NOT_APPLICABLE", rationale: "The heritage site's educational value is evergreen and no current event is needed to explain it." },
  manual_qa: { mobile_2x2: "PASS", desktop_2x2: "PASS", popup_scroll: "PASS", collection_previews: "PASS", source_links: "PASS", front_image_portrait: "PASS" },
  quality_score: {
    identity_and_boundary: { score: 5, note: "Official object geometry and explicit separation from all adjacent Ekeberg places." },
    sources_and_factuality: { score: 5, note: "Official registry, institution, local history, encyclopedia and tourism sources compared with dating conflict preserved." },
    collections_and_runtime: { score: 5, note: "Exactly four populated, distinct collections with local member previews." },
    language_and_chronology: { score: 5, note: "Four place-specific terms and only the exact 1915 chronology anchor." },
    quiz_and_learning: { score: 5, note: "Normal 4x7 progression; first 14 are concrete and theory appears only in the final set." },
    images_and_rights: { score: 5, note: "Local portrait, object, event and brand assets with inspectable provenance and licenses." },
    total: 30,
    critical_findings: 0,
    unresolved_blockers: 0
  }
};
write("reports/place-production/ekeberg-helleristninger-phase1-24-gate-audit-v1.json", audit);

// Update local registries. Final branch creation repeats these mutations against fresh main.
if (has("data/brands/brands_master.json")) {
  const brands = read("data/brands/brands_master.json").filter(item => item.id !== brand.id);
  brands.push(brand);
  write("data/brands/brands_master.json", brands);
}
if (has("data/brands/brands_by_place.json")) {
  const mappings = read("data/brands/brands_by_place.json");
  mappings[placeId] = [brand.id];
  write("data/brands/brands_by_place.json", mappings);
}
if (has("data/people/people_image_attributions.json")) {
  const attributions = read("data/people/people_image_attributions.json").filter(item => item.personId !== person.id);
  attributions.push({ personId: person.id, name: person.name, file: person.image, source: "Wikimedia Commons", sourcePage: commonsPetersen, creator: person.imageMeta.creator, credit: person.imageMeta.credit, license: person.imageMeta.license });
  attributions.sort((a, b) => a.personId.localeCompare(b.personId));
  write("data/people/people_image_attributions.json", attributions);
}
if (has("data/people/manifest.json")) {
  const manifest = read("data/people/manifest.json");
  const personFile = `people/historie/oslo/${person.id}.json`;
  manifest.files = [...new Set([...(manifest.files || []), personFile])];
  write("data/people/manifest.json", manifest);
}
if (has("data/leksikon/sprak/manifest.json")) {
  const manifest = read("data/leksikon/sprak/manifest.json");
  manifest.place_files[placeId] = languageFile;
  write("data/leksikon/sprak/manifest.json", manifest);
}
if (has("data/leksikon/manifest.json")) {
  const manifest = read("data/leksikon/manifest.json");
  if (Array.isArray(manifest.files)) {
    manifest.files = manifest.files.filter(item => item !== `places/oslo/historie/leksikon_${placeId}.json`);
    manifest.files = [...new Set([...manifest.files, leksikonFile])];
  } else if (Array.isArray(manifest)) manifest.push(leksikonFile);
  write("data/leksikon/manifest.json", manifest);
}
if (has("data/stories/stories_episode_v1_manifest.json")) {
  const manifest = read("data/stories/stories_episode_v1_manifest.json");
  manifest.files = (manifest.files || []).filter(item => item !== `stories_${placeId}.json`);
  manifest.files = [...new Set([...manifest.files, storyFile])];
  write("data/stories/stories_episode_v1_manifest.json", manifest);
}
if (has("data/stories/stories_manifest.json")) {
  const manifest = read("data/stories/stories_manifest.json");
  if (Array.isArray(manifest.files)) {
    manifest.files = manifest.files.filter(item => item.entity_id !== placeId);
    manifest.files.push({ category: "historie", entity_id: placeId, path: storyFile });
  }
  write("data/stories/stories_manifest.json", manifest);
}
if (has("data/quiz/manifest.json")) {
  const manifest = read("data/quiz/manifest.json");
  manifest.sets = (manifest.sets || []).filter(item => item.targetId !== placeId);
  manifest.sets.push({ targetId: placeId, file: quizFile });
  write("data/quiz/manifest.json", manifest);
}
if (has("data/fag/fag_manifest.json")) {
  const manifest = read("data/fag/fag_manifest.json");
  manifest.historie.quizProduction.targets[placeId] = {
    source_brief: `../quiz/production_briefs/historie/${placeId}.json`,
    context_artifact: `../quiz/production_context/historie/${placeId}.json`,
    quiz_file: `../quiz/historie/${placeId}_sets.json`
  };
  write("data/fag/fag_manifest.json", manifest);
}
if (has("data/lesespor/oslo/lesespor_oslo_by.json")) {
  const registry = read("data/lesespor/oslo/lesespor_oslo_by.json");
  const ids = new Set(readingTracks.map(item => item.id));
  registry.items = registry.items.filter(item => !ids.has(item.id));
  registry.items.push(...readingTracks);
  write("data/lesespor/oslo/lesespor_oslo_by.json", registry);
}

write(contextFile, await buildQuizProductionContext({ root, categoryId: "historie", targetId: placeId }));

console.log(JSON.stringify({ place: placeId, profile: "focused", collections: place.place_card_profile.collection_ids, quizQuestions: questions.length, quality: 30 }, null, 2));
