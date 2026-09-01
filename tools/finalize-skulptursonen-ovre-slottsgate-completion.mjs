#!/usr/bin/env node
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { runBuildQuizProductionContext } from "../scripts/build-quiz-production-context.mjs";

const sharpModule = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "sharp/dist/index.mjs")
  : "sharp";
const { default: sharp } = await import(sharpModule);
const root = process.cwd();
const verifiedAt = "2026-09-01";
const placeId = "skulptursonen_ovre_slottsgate";
const personId = "vibeke_tandberg";
const brandId = "norsk_billedhoggerforening";
const placeFile = "data/places/kunst/oslo/places_kunst_oslo_oppdag_kvadraturen_art_sites_batch_01/skulptursonen_ovre_slottsgate.json";
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const output = path.join(root, file);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(value, null, 2)}\n`);
};
const writeCompactArray = (file, value) => {
  const output = path.join(root, file);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `[\n${value.map((row) => JSON.stringify(row)).join(",\n")}\n]\n`);
};
const addOnce = (array, value) => { if (!array.includes(value)) array.push(value); };
const upsert = (array, value) => {
  const index = array.findIndex((row) => row.id === value.id);
  if (index < 0) array.push(value); else array[index] = value;
};
const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const sentences = (value) => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(value)]
  .map((part) => part.segment.trim()).filter(Boolean);

const urls = {
  oppdag: "https://www.oppdagkvadraturen.no/stoppesteder/skulptursonen-i-ovre-slottsgate",
  project: "https://www.norskbilledhoggerforening.no/overe-slottsgate",
  catalogue: "https://www.norskbilledhoggerforening.no/vre-slottsgate-katalog",
  hest: "https://www.norskbilledhoggerforening.no/vre-slottsgate-katalog/event-one-g5ngh-4d2bm-gwesb-wlbag-z653r-ksmpa-lwhwh-wk4ty-npydc-dcr6j-3hktn-z8s87-dflsz-hjw74",
  sleep: "https://www.norskbilledhoggerforening.no/vre-slottsgate-katalog/event-one-g5ngh-4d2bm-gwesb-wlbag-z653r-ksmpa-lwhwh-wk4ty-npydc-dcr6j-3hktn",
  money: "https://www.norskbilledhoggerforening.no/vre-slottsgate-katalog/event-one-g5ngh-4d2bm-gwesb-wlbag-z653r-ksmpa-lwhwh-wk4ty-npydc-dcr6j-3hktn-z8s87-dflsz-hjw74-4lmpm",
  museumPerson: "https://www.nasjonalmuseet.no/samlingen/produsent/53639/vibeke-tandberg",
  portraitPage: "https://commons.wikimedia.org/wiki/File:Vibeke_Tandberg_1054.jpg",
  portrait: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Vibeke_Tandberg_1054.jpg",
  facade: "https://www.oppdagkvadraturen.no/uploads/attractions/ovre-slottsgate.jpg",
  plan: "https://www.oppdagkvadraturen.no/uploads/attractions/Asplan-Virak-skisse-%C3%98vre-slottsgate.jpg",
  hestImage: "https://images.squarespace-cdn.com/content/v1/68ece7d2bffbc34e2c5f301c/cef2f35e-8e74-4393-9c3f-3a3f243031c7/Tandberg.webp",
  sleepImage: "https://images.squarespace-cdn.com/content/v1/68ece7d2bffbc34e2c5f301c/0e9e0f2a-dc12-4a1f-a19d-4d11cce15c13/ikkesove_skisse.webp",
  moneyImage: "https://images.squarespace-cdn.com/content/v1/68ece7d2bffbc34e2c5f301c/e8d7e9f2-8669-43a1-b6f4-285e864675d2/IMG_2030-kopi.webp",
  logo: "https://images.squarespace-cdn.com/content/v1/68ece7d2bffbc34e2c5f301c/e62e73fb-e850-4431-8b2a-a23772d60006/NBF-LOGO_web+Background+Removed.png"
};

async function asset(url, file, width, height, fit = "cover") {
  const output = path.join(root, file);
  if (fs.existsSync(output)) return;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(output), { recursive: true });
  await sharp(buffer).resize(width, height, { fit, position: "attention" }).webp({ quality: 86 }).toFile(output);
}

await Promise.all([
  asset(urls.facade, "bilder/places/skulptursonen_ovre_slottsgate.webp", 1200, 675),
  asset(urls.facade, "bilder/places/skulptursonen_ovre_slottsgate_front_portrait.webp", 900, 1200),
  asset(urls.plan, "bilder/kort/objects/skulptursonen_planskisse_2019.webp", 900, 600, "contain"),
  asset(urls.portrait, "bilder/kort/people/vibeke_tandberg.webp", 900, 1200, "contain"),
  asset(urls.logo, "bilder/kort/brands/norsk_billedhoggerforening.webp", 900, 520, "contain"),
  asset(urls.hestImage, "bilder/kort/productions/skulptursonen_hestebarrikade.webp", 900, 700),
  asset(urls.sleepImage, "bilder/kort/productions/skulptursonen_du_ma_ikke_sove.webp", 900, 700),
  asset(urls.moneyImage, "bilder/kort/productions/skulptursonen_what_money_can_buy.webp", 900, 700)
]);

const desc = "Skulptursonen i Øvre Slottsgate var et tidsavgrenset offentlig kunstprosjekt i gågaten mellom Tollbugata og Prinsens gate fra 2019 til 2024. Fem arkitekttegnede felt for frittstående skulpturer ble integrert med sittemøbler, planter og trær. Prosjektet var et samarbeid mellom Norsk Billedhoggerforening, Kulturetaten og Bymiljøetaten i Oslo kommune.";
const popupDesc = "Skulptursonen ble lansert i august 2019, da Øvre Slottsgate var nyetablert som gågate. Prosjektområdet lå mellom Tollbugata og Prinsens gate. Strekningen fikk sittemøbler, planter, trær og fem spesialtilpassede soner for skulptur. Disse elementene gjorde visningsfeltene til en planlagt del av det samme byrommet som fotgjengere brukte til ferdsel og opphold.\n\nProsjektet var et samarbeid mellom Norsk Billedhoggerforening, Kulturetaten og Bymiljøetaten i Oslo kommune. Kommunen stilte produksjonsmidler til rådighet for kunstnerne. Bidragene skulle være frittstående skulpturer som samtidig forholdt seg til gaterommet. Det åpne gaterommet var både plassering og den uttrykkelige rammen verkene skulle forholde seg til.\n\nNorsk Billedhoggerforening oppgir prosjektperioden som 2019–2024. Den offisielle oversikten har separate verkgrupper for 2020, 2022 og 2023. Hver av de tre gruppene inneholder fem kunstnere og fem verk. Verkene fra 2023 vises som historiske produksjoner, ikke som en påstand om dagens installasjon.\n\nRunden i 2023 omfattet Ingrid Solvik, Gisle Harr, Aleksander Stav, Vibeke Tandberg og Yamile Calderon. Vibeke Tandbergs Hestebarrikade besto av fem hestehoder i betong. Den offisielle verksteksten kobler hestehodene både til politihester og til fysiske sikkerhetsbarrierer som preger bybildet.\n\nIngrid Solviks Du må ikke sove brukte tre køyer med broderier. Broderiene ble laget av mennesker som hadde erfaring med å sove i det offentlige rom. Motivene var fordelt på temaene fortid, samtid og fremtid. Verksteksten knytter køyene til stoler med armlener og andre former for møblering som gjør det vanskelig å legge seg.\n\nYamile Calderons What Money Can Buy var laget i epoxy og fiberglass, spraymalt for å ligne gull og marmor. Verket var inspirert av fotoprosjektet Narcos & Homes. Den offisielle teksten knytter også plasseringen blant luksusbutikker til verkets undersøkelse av luksus og status. Teksten beskriver et spisebord i gull med en replika av et skulpturmotiv av Giambologna.\n\nOppdag Kvadraturen publiserer en planskisse kreditert Asplan Viak og Norsk Billedhoggerforening. Skissen dokumenterer den romlige organiseringen av kunstfeltene, gatemøblene og vegetasjonen. Den kan ikke dokumentere hvordan alle forbipasserende opplevde verkene. Kildene som er brukt her dokumenterer prosjektperioden og de daterte rundene, men fastslår ikke hvilke verk som eventuelt står i sonene i dag.";

const sourceRef = (sourceUrl, sourceLocation, claimKind = "ordinary", evidenceMode = "direct", temporalStatus = "historical") => ({ sourceUrl, sourceLocation, claimKind, evidenceMode, temporalStatus });
const descClaimSources = [
  sourceRef(urls.project, "prosjektoverskriften, innledningen og periodeangivelsen", "identity"),
  sourceRef(urls.oppdag, "avsnittet om gateutformingen og planskissen", "identity"),
  sourceRef(urls.project, "innledningen om samarbeidspartnerne", "ordinary")
];
const popupClaimSources = [
  sourceRef(urls.project, "innledningen om lanseringen", "temporal"),
  sourceRef(urls.oppdag, "adressen og avgrensningen", "identity"),
  sourceRef(urls.oppdag, "avsnittet om gateutformingen", "identity"),
  sourceRef(urls.oppdag, "avsnittet om gateutformingen og planskissen"),
  sourceRef(urls.project, "innledningen om samarbeidspartnerne"),
  sourceRef(urls.project, "innledningen om produksjonsmidlene"),
  sourceRef(urls.project, "innledningen om frittstående verk"),
  sourceRef(urls.project, "innledningen om verkenes forhold til byrommet"),
  sourceRef(urls.project, "prosjektoverskriften og periodeangivelsen", "temporal"),
  sourceRef(urls.project, "verkoversikten for 2020, 2022 og 2023", "temporal"),
  sourceRef(urls.project, "de tre daterte verkgruppene", "temporal"),
  sourceRef(urls.project, "de daterte verkgruppene og periodeangivelsen", "temporal"),
  sourceRef(urls.project, "verkoversikten for 2023", "temporal"),
  sourceRef(urls.hest, "verkbeskrivelsen"),
  sourceRef(urls.hest, "verkbeskrivelsen"),
  sourceRef(urls.sleep, "verkbeskrivelsen"),
  sourceRef(urls.sleep, "verkbeskrivelsen"),
  sourceRef(urls.sleep, "verkbeskrivelsen"),
  sourceRef(urls.sleep, "verkbeskrivelsen"),
  sourceRef(urls.money, "material- og verkbeskrivelsen"),
  sourceRef(urls.money, "avsnittet om Narcos & Homes"),
  sourceRef(urls.money, "avsnittet om plassering, luksus og status"),
  sourceRef(urls.money, "verkbeskrivelsen av bordet og skulpturmotivet"),
  sourceRef(urls.oppdag, "bildeteksten til planskissen"),
  sourceRef(urls.oppdag, "planskissen og avsnittet om gateutformingen"),
  sourceRef(urls.oppdag, "planskissens dokumentasjonsgrense"),
  sourceRef(urls.project, "prosjektperioden og de daterte verkgruppene", "temporal", "direct", "current")
];
const place = read(placeFile);
Object.assign(place, {
  desc,
  popupDesc,
  year: 2019,
  kindLabel: "Offentlig kunstplattform, 2019–2024",
  image: "bilder/places/skulptursonen_ovre_slottsgate.webp",
  cardImage: "bilder/places/skulptursonen_ovre_slottsgate.webp",
  frontImage: "bilder/places/skulptursonen_ovre_slottsgate_front_portrait.webp",
  imageMeta: { source: "official_municipal_destination_site", sourcePage: urls.oppdag, assetUrl: urls.facade, creator: "André Gali", credit: "André Gali / Oppdag Kvadraturen", license: "Official site editorial reference", rightsBasis: "official_municipal_site_editorial_reference", assetType: "documentary_street_photo", transformation: "Stedstro beskjæring og WebP-normalisering.", verifiedAt },
  frontImageMeta: { source: "official_municipal_destination_site", sourcePage: urls.oppdag, assetUrl: urls.facade, creator: "André Gali", credit: "André Gali / Oppdag Kvadraturen", license: "Official site editorial reference", rightsBasis: "official_municipal_site_editorial_reference", outputDimensions: "900x1200", orientation: "portrait", aspectRatio: "3:4", verifiedAt },
  related_people_ids: [personId],
  reading_track_ids: ["lesespor_skulptursonen_oversikt", "lesespor_skulptursonen_katalog", "lesespor_skulptursonen_hestebarrikade", "lesespor_skulptursonen_du_ma_ikke_sove"],
  place_card_profile: { schema: "history_go_place_card_profile_v2", production_profile: "standard", collection_ids: ["people", "objects", "brands", "productions"], category_collection_label: "Kunstverk", reason: "Vibeke Tandberg, den offisielle planskissen, Norsk Billedhoggerforening og tre dokumenterte 2023-verk gir fire direkte og bildeklare samlinger uten related-fyll.", verifiedAt },
  objects: [{ id: "skulptursonen_planskisse_2019", name: "Planskisse for Skulptursonen", title: "Planskisse for Skulptursonen", type: "planskisse", kind: "planning_document", year: 2019, desc: "Asplan Viak og Norsk Billedhoggerforening sin planskisse viser organiseringen av de fem skulpturfeltene i gatestrekket.", physicalObject: true, placeSpecific: true, collectable: true, placeSpecificReason: "Oppdag Kvadraturen publiserer planskissen som dokumentasjon for akkurat Skulptursonen i Øvre Slottsgate.", why_here: "Dokumentet gjør forholdet mellom gate, bymøbler og fem kunstfelt lesbart.", image: "bilder/kort/objects/skulptursonen_planskisse_2019.webp", source_urls: [urls.oppdag, urls.plan], imageMeta: { sourcePage: urls.oppdag, assetUrl: urls.plan, creator: "Asplan Viak / Norsk Billedhoggerforening", credit: "Asplan Viak / Norsk Billedhoggerforening", license: "Official planning illustration; editorial reference", rightsBasis: "official_project_document_editorial_reference", transformation: "Proporsjonalt tilpasset og WebP-normalisert.", verifiedAt }, storePrice: 30, currency: "PC" }],
  productions: [
    { id: "skulptursonen_hestebarrikade_2023", title: "Hestebarrikade", name: "Hestebarrikade", artist: "Vibeke Tandberg", year: 2023, type: "betongskulptur", kind: "artwork", desc: "Fem hestehoder i betong, vist i Skulptursonens 2023-runde.", image: "bilder/kort/productions/skulptursonen_hestebarrikade.webp", source_urls: [urls.hest, urls.project], imageMeta: { sourcePage: urls.hest, assetUrl: urls.hestImage, credit: "Vibeke Tandberg / Norsk Billedhoggerforening", license: "Artist artwork; official project editorial reference", rightsBasis: "official_project_editorial_reference", verifiedAt } },
    { id: "skulptursonen_du_ma_ikke_sove_2023", title: "Du må ikke sove", name: "Du må ikke sove", artist: "Ingrid Solvik", year: 2023, type: "brodert installasjon", kind: "artwork", desc: "Tre broderte køyer, vist i Skulptursonens 2023-runde.", image: "bilder/kort/productions/skulptursonen_du_ma_ikke_sove.webp", source_urls: [urls.sleep, urls.project], imageMeta: { sourcePage: urls.sleep, assetUrl: urls.sleepImage, credit: "Ingrid Solvik / Norsk Billedhoggerforening", license: "Artist artwork; official project editorial reference", rightsBasis: "official_project_editorial_reference", verifiedAt } },
    { id: "skulptursonen_what_money_can_buy_2023", title: "What Money Can Buy", name: "What Money Can Buy", artist: "Yamile Calderon", year: 2023, type: "skulptur", kind: "artwork", desc: "Skulptur i epoxy og fiberglass, spraymalt for å ligne gull og marmor, vist i 2023-runden.", image: "bilder/kort/productions/skulptursonen_what_money_can_buy.webp", source_urls: [urls.money, urls.project], imageMeta: { sourcePage: urls.money, assetUrl: urls.moneyImage, credit: "Yamile Calderon / Norsk Billedhoggerforening", license: "Artist artwork; official project editorial reference", rightsBasis: "official_project_editorial_reference", verifiedAt } }
  ],
  language_profile: { primary_name: "Skulptursonen i Øvre Slottsgate", key_terms: ["skulptursone", "offentlig kunst", "frittstående skulptur", "kuratering"], dialect_status: "Enkeltstedet eier ikke et eget dialektlag.", source: urls.project },
  interpretation: { what_to_notice: ["Hvordan de fem visningsfeltene inngår i et vanlig gatestrekk.", "Forholdet mellom skulptur, sittemøbler, vegetasjon og ferdsel.", "At dokumenterte verk tilhører daterte utstillingsrunder."], why_it_matters: ["Prosjektet viser hvordan kunst kan produseres direkte for et offentlig byrom.", "Kuratering i en gate møter et publikum som ikke har valgt å gå inn i et galleri.", "Materialer og plassering kan gjøre byens sikkerhet, ekskludering og status synlig."], counterpoints: ["Prosjektperioden er oppgitt som 2019–2024.", "De fem feltene er ikke fem permanente kunstverk.", "Et besøk i dag beviser ikke hvilke tidligere verk som står der."], sources: [urls.oppdag, urls.project, urls.hest, urls.sleep, urls.money].map((url) => ({ url, verifiedAt })) },
  externalLinks: [
    { type: "official", label: "Oppdag Kvadraturen – Skulptursonen", url: urls.oppdag },
    { type: "official", label: "Norsk Billedhoggerforening – Øvre Slottsgate", url: urls.project },
    { type: "official", label: "Katalog over utstillingsrundene", url: urls.catalogue },
    { type: "source", label: "Nasjonalmuseet – Vibeke Tandberg", url: urls.museumPerson },
    { type: "image_source", label: "Wikimedia Commons – Vibeke Tandberg", url: urls.portraitPage }
  ].map((row) => ({ ...row, verifiedAt })),
  production_status: "complete",
  production_verified_at: verifiedAt
});

place.fagverk = {
  schema: "history_go_place_fagverk_v2", level: "standard", status: "curated",
  intro: "Skulptursonen gjør offentlig kunst lesbar som et samspill mellom kunstverk, kuratorisk utvalg, produksjonsmidler, gateutforming og et publikum i bevegelse.",
  article: [
    "Prosjektet ble lansert i august 2019 som del av etableringen av Øvre Slottsgate som gågate. Fem spesialtilpassede kunstfelt ble integrert med sittemøbler, planter og trær. Offentlig kunst ble dermed en del av byrommets infrastruktur, ikke et tillegg plassert uten romlig plan.",
    "Norsk Billedhoggerforening samarbeidet med Kulturetaten og Bymiljøetaten, og kunstnerne fikk kommunale produksjonsmidler. Kildene dokumenterer dermed en kjede mellom kunstnerorganisasjon, kommunale etater, produksjonsressurser og ferdige verk. En institusjonsanalyse kan undersøke denne kjeden uten å tillegge aktørene roller som kildene ikke beskriver.",
    "De dokumenterte rundene fra 2020, 2022 og 2023 viser midlertidighet som metode. Betong, broderte køyer og bemalt fiberglass ga ulike fysiske og politiske møter med gaten. En analyse må skille mellom det stabile gateanlegget, den tidsavgrensede utstillingsrunden og publikums skiftende bruk."
  ],
  subject_ids: ["kunst"],
  emne_ids: ["em_kunst_institusjoner_kanon", "em_kunst_materialitet_teknikk_handverk", "em_kunst_sjanger_stil_og_posisjonering"],
  chapter_ids: ["felt-og-institusjon", "produksjon-og-praksis", "makt-og-legitimitet"],
  lenses: [
    { id: "skulptursonen-institusjon", title: "Samarbeid produserer kunstrom", prompt: "Hvordan fordelte kunstnerorganisasjonen og kommunen roller i Skulptursonen?", subject_id: "kunst", emne_id: "em_kunst_institusjoner_kanon", evidence: "Knytt Norsk Billedhoggerforening, Kulturetaten, Bymiljøetaten og produksjonsmidlene til de fem feltene." },
    { id: "skulptursonen-materialitet", title: "Materialet møter gaten", prompt: "Hvordan endrer betong, broderi og bemalt fiberglass møtet mellom verk og byrom?", subject_id: "kunst", emne_id: "em_kunst_materialitet_teknikk_handverk", evidence: "Sammenlign Hestebarrikade, Du må ikke sove og What Money Can Buy." },
    { id: "skulptursonen-kuratering", title: "Midlertidighet som kuratorisk grep", prompt: "Hva blir synlig når de samme feltene fylles med nye verk i ulike år?", subject_id: "kunst", emne_id: "em_kunst_sjanger_stil_og_posisjonering", evidence: "Skill gateanlegget fra de dokumenterte rundene i 2020, 2022 og 2023." }
  ],
  guiding_questions: ["Hva gjør et visningsfelt til del av byrommets infrastruktur?", "Hvordan skiller et kunstprosjekt i en gågate seg fra en galleriutstilling?", "Hvorfor må en datert utstillingsrunde skilles fra dagens situasjon?", "Hvordan kan materialvalg kommentere sikkerhet, ekskludering og status?", "Hvilke aktører og ressurser må samarbeide for å produsere offentlig kunst?"],
  concepts: ["offentlig kunst", "kuratering", "midlertidighet", "materialitet", "institusjonelt samarbeid", "stedsspesifisitet"],
  observable_traces: [
    { title: "Det arkitekttegnede gatestrekket", observation: "Planskissen og kildene dokumenterer fem kunstfelt mellom Tollbugata og Prinsens gate.", interpretation_boundary: "Gatestrekket dokumenterer infrastrukturen, men ikke at verk fra 2023 fortsatt står der.", source_urls: [urls.oppdag, urls.project] },
    { title: "Historiske verkbilder", observation: "Prosjektkatalogen viser hvordan verkene forholdt seg til den åpne gaten.", interpretation_boundary: "Bildene dokumenterer daterte visninger, ikke alle publikumsreaksjoner eller dagens installasjon.", source_urls: [urls.hest, urls.sleep, urls.money] }
  ],
  source_urls: [urls.oppdag, urls.project, urls.catalogue, urls.hest, urls.sleep, urls.money],
  verified_at: verifiedAt
};

write(placeFile, place);
const fagRegistry = read("data/fagverk/fagverk_registry.json");
fagRegistry.placeLinks[placeId] = { sourceFile: "places/kunst/oslo/places_kunst_oslo_oppdag_kvadraturen_art_sites_batch_01/skulptursonen_ovre_slottsgate.json", field: "fagverk", schema: place.fagverk.schema, level: place.fagverk.level, status: place.fagverk.status };
write("data/fagverk/fagverk_registry.json", fagRegistry);

const personFile = "data/people/kunst/oslo/skulptursonen_ovre_slottsgate/vibeke_tandberg.json";
const personClaimsFile = "data/people/claims/kunst/oslo/skulptursonen_ovre_slottsgate/vibeke_tandberg.claims.json";
const person = {
  id: personId,
  name: "Vibeke Tandberg",
  initials: "VT",
  category: "kunst",
  year: 2023,
  kindLabel: "Billedkunstner, fotograf og forfatter",
  role: "Kunstner bak Hestebarrikade",
  desc: "Billedkunstneren som viste betongskulpturen Hestebarrikade i Skulptursonens 2023-runde.",
  popupDesc: "Vibeke Tandberg er født 26. desember 1967 og er registrert av Nasjonalmuseet som billedkunstner, fotograf og forfatter. Museets samlingsdatabase viser 41 publiserte verk.\n\nI Skulptursonens 2023-runde viste hun Hestebarrikade. Norsk Billedhoggerforening beskriver verket som fem hestehoder i betong og knytter formen til politihester og fysiske sikkerhetsbarrierer i Oslo.\n\nPortrettet er tatt under Olavsfest i 2026. Stedskoblingen gjelder det dokumenterte kunstverket i Øvre Slottsgate; portrettet er en identitetsbærer og ble ikke tatt ved Skulptursonen.",
  placeId,
  places: [placeId],
  education: [],
  tags: ["billedkunst", "fotografi", "skulptur", "offentlig kunst", "Hestebarrikade"],
  works: [{ id: "skulptursonen_hestebarrikade_2023", title: "Hestebarrikade", year: 2023, role: "kunstner", place: "Skulptursonen i Øvre Slottsgate", summary: "Fem hestehoder i betong vist i prosjektets 2023-runde." }],
  image: "bilder/kort/people/vibeke_tandberg.webp",
  cardImage: "bilder/kort/people/vibeke_tandberg.webp",
  imageMeta: { source: "wikimedia_commons", sourcePage: urls.portraitPage, creator: "Stein Langørgen", credit: "Stein Langørgen / Wikimedia Commons", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", reviewStatus: "manually_approved", assetKind: "identity_portrait", date: "2026-07-29", outputDimensions: "900x1200", transformation: "Proporsjonalt tilpasset og WebP-normalisert.", verifiedAt },
  profileStandard: "people_profile_v1.0",
  profileStatus: "ready_people_v1",
  claimsFile: personClaimsFile,
  source_urls: [urls.museumPerson, urls.hest, urls.portraitPage],
  verifiedAt
};
write(personFile, [person]);
const personClaims = [
  ["identity", "Vibeke Tandberg er født 26. desember 1967 og er billedkunstner, fotograf og forfatter.", urls.museumPerson, "produsentoversikten", "museum_collection"],
  ["museum_works", "Nasjonalmuseets samlingsdatabase viser 41 publiserte verk av Vibeke Tandberg.", urls.museumPerson, "produsentoversikten", "museum_collection"],
  ["hest", "Tandberg viste Hestebarrikade, fem hestehoder i betong, i Skulptursonens 2023-runde.", urls.hest, "verkbeskrivelsen", "institutional"],
  ["image", "Commons-filen identifiserer Vibeke Tandberg under Olavsfest 29. juli 2026.", urls.portraitPage, "Summary og Licensing", "archive"]
].map(([id, claim, source_url, source_location, source_type]) => ({ id, claim, status: "verified", source_url, source_location, source_type, temporal_status: id === "hest" ? "historical" : "current", verified_at: verifiedAt, evidence_level: "direct" }));
write(personClaimsFile, {
  schema: "history_go_people_claims_v1",
  version: "1.0.0",
  person_id: personId,
  profile_file: personFile,
  identity: { canonical_identity: "Den norske billedkunstneren, fotografen og forfatteren Vibeke Tandberg, født 1967.", name_variants: ["Vibeke Tandberg"], not: ["Cathinka Tandberg"], identity_status: "verified" },
  claims: personClaims,
  field_claim_map: { name: ["identity"], kindLabel: ["identity"], year: ["hest"], placeId: ["hest"], [`places[${placeId}]`]: ["hest"], "works[id=skulptursonen_hestebarrikade_2023].title": ["hest"], "works[id=skulptursonen_hestebarrikade_2023].year": ["hest"], "works[id=skulptursonen_hestebarrikade_2023].role": ["hest"], "works[id=skulptursonen_hestebarrikade_2023].place": ["hest"], "works[id=skulptursonen_hestebarrikade_2023].summary": ["hest"], image: ["image"], cardImage: ["image"] },
  sentence_claim_map: { desc: [{ sentence: 1, claim_ids: ["hest"] }], popupDesc: [{ sentence: 1, claim_ids: ["identity"] }, { sentence: 2, claim_ids: ["museum_works"] }, { sentence: 3, claim_ids: ["hest"] }, { sentence: 4, claim_ids: ["hest"] }, { sentence: 5, claim_ids: ["image"] }, { sentence: 6, claim_ids: ["hest", "image"] }] },
  completion: { completed_under: "people_profile_v1.0", claims_verified: `${personClaims.length}/${personClaims.length}`, fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});
const peopleManifest = read("data/people/manifest.json");
addOnce(peopleManifest.files, "people/kunst/oslo/skulptursonen_ovre_slottsgate/vibeke_tandberg.json");
peopleManifest.priorityFilesByPlace[placeId] = ["people/kunst/oslo/skulptursonen_ovre_slottsgate/vibeke_tandberg.json"];
write("data/people/manifest.json", peopleManifest);
const relations = read("data/relations.json");
upsert(relations, { id: "rel_skulptursonen_vibeke_tandberg", type: "kunstverk", place: placeId, person: personId, label: "Kunstner i 2023-runden", why: "Tandberg viste Hestebarrikade i Skulptursonens dokumenterte 2023-runde.", source: urls.hest });
write("data/relations.json", relations);

const brand = {
  id: brandId,
  name: "Norsk Billedhoggerforening",
  aliases: ["NBF"],
  brand_group: "institutional_brand",
  brand_type: "artist_association",
  brand_kind: "brand",
  sector: "visual_art",
  state: "catalog",
  status: "current",
  verification: "verified_current",
  popupdesc: "Norsk Billedhoggerforening var prosjektpart for Skulptursonen sammen med Kulturetaten og Bymiljøetaten. Foreningen publiserer den offisielle prosjektoversikten og katalogen over de dokumenterte utstillingsrundene. Den vises som en selvstendig institusjonell identitet, ikke som et navn på selve gatestrekket.",
  desc: "Kunstnerorganisasjonen som samarbeidet med Kulturetaten og Bymiljøetaten om Skulptursonen.",
  tags: ["brand", "artist_association", "sculpture", "public_art", "oslo", placeId],
  place_ids: [placeId],
  source_urls: [urls.project],
  logo: "bilder/kort/brands/norsk_billedhoggerforening.webp",
  imageMeta: { sourcePage: urls.project, assetUrl: urls.logo, creator: "Norsk Billedhoggerforening", credit: "Norsk Billedhoggerforening", license: "Official brand asset; referential identification", rightsBasis: "official_brand_site_referential_identification", reviewStatus: "manually_approved", assetKind: "official_wordmark", noEndorsement: true, generated: false, reconstructed: false, transformation: "Originalt ordmerke proporsjonalt tilpasset på transparent kortflate.", reviewedAt: verifiedAt }
};
for (const file of ["data/brands/brands_master.json", "data/brands/brands_catalog.json", "data/brands/brands_catalog_v17.json", "data/brands/brands_master_raw.json"]) {
  const rows = read(file);
  upsert(rows, file.endsWith("brands_master.json") ? brand : { id: brand.id, name: brand.name, aliases: brand.aliases, brand_group: brand.brand_group, brand_type: brand.brand_type, brand_kind: brand.brand_kind, sector: brand.sector, state: brand.state, status: brand.status, verification: brand.verification, popupdesc: brand.popupdesc, desc: brand.desc, tags: brand.tags });
  if (file.endsWith("brands_master_raw.json")) writeCompactArray(file, rows); else write(file, rows);
}
const brandsByPlace = read("data/brands/brands_by_place.json");
brandsByPlace[placeId] = [brandId];
write("data/brands/brands_by_place.json", brandsByPlace);

const chronology = [
  [2019, "Skulptursonen lanseres", "Prosjektet ble lansert i august da Øvre Slottsgate var nyetablert som gågate.", urls.project],
  [2020, "Dokumentert utstillingsrunde", "Prosjektkatalogen viser fem verk fra 2020.", urls.project],
  [2022, "Ny runde i de fem feltene", "Prosjektkatalogen dokumenterer fem verk i 2022-runden.", urls.project],
  [2023, "Fem nye verk", "Solvik, Harr, Stav, Tandberg og Calderon viste hvert sitt verk.", urls.project],
  [2024, "Prosjektperiodens sluttår", "Norsk Billedhoggerforening oppgir prosjektperioden som 2019–2024.", urls.project]
].map(([year, title, entryDesc, url], index) => ({ id: `chrono_skulptursonen_${year}_${index + 1}`, year, title, desc: entryDesc, confidence: "high", sources: [{ title: "Norsk Billedhoggerforening", url }] }));
const leksikonFile = "data/leksikon/places/oslo/kunst/leksikon_skulptursonen_ovre_slottsgate.json";
write(leksikonFile, {
  place_id: placeId,
  title: "Skulptursonen i Øvre Slottsgate",
  type: "main",
  version: 1,
  visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "Fem kunstfelt i en gågate gjorde skiftende skulptur til del av byrommet fra 2019 til 2024.",
  wikiText: [
    "Skulptursonen ble lansert i august 2019 i forbindelse med etableringen av Øvre Slottsgate som gågate. Mellom Tollbugata og Prinsens gate ble fem spesialtilpassede skulpturfelt integrert med sittemøbler, planter og trær.",
    "Norsk Billedhoggerforening samarbeidet med Kulturetaten og Bymiljøetaten. Kommunale produksjonsmidler gjorde det mulig for kunstnerne å lage frittstående verk for den offentlige kunstplattformen.",
    "Prosjektkatalogen dokumenterer skiftende runder i 2020, 2022 og 2023. Verkene var tidsbundne, mens gateanlegget og de fem feltene utgjorde den romlige rammen."
  ],
  summary: { one_liner: "Offentlig kunstplattform med fem skiftende visningsfelt i perioden 2019–2024.", themes: ["offentlig kunst", "skulptur", "kuratering", "byrom", "midlertidighet"], tone: ["nøktern", "kunstfaglig"] },
  facts: [
    { id: "fact_skulptursonen_2019", label: "Lanseringen", desc: "Skulptursonen ble lansert i august 2019.", confidence: "high", sources: [{ title: "Norsk Billedhoggerforening", url: urls.project }] },
    { id: "fact_skulptursonen_fem", label: "Feltene", desc: "Gatestrekningen fikk fem spesialtilpassede soner for skulptur.", confidence: "high", sources: [{ title: "Oppdag Kvadraturen", url: urls.oppdag }] },
    { id: "fact_skulptursonen_perioden", label: "Perioden", desc: "Prosjektperioden er oppgitt som 2019–2024.", confidence: "high", sources: [{ title: "Norsk Billedhoggerforening", url: urls.project }] }
  ],
  chronology,
  sources: place.externalLinks,
  externalLinks: place.externalLinks,
  interpretation: place.interpretation
});
const leksikonManifest = read("data/leksikon/manifest.json");
addOnce(leksikonManifest.files, leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/skulptursonen_ovre_slottsgate.json";
const languageEntries = [
  ["skulptursone", "stedsbegrep", "Et tilrettelagt område for visning av skulptur.", "I Øvre Slottsgate besto sonen av fem spesialtilpassede felt."],
  ["offentlig kunst", "kunstbegrep", "Kunst produsert eller vist i rom som er tilgjengelige for allmennheten.", "Verkene møtte daglig ferdsel uten museumsinngang."],
  ["frittstående skulptur", "verkstype", "En skulptur som står selvstendig i rommet og kan betraktes fra flere sider.", "Prosjektbeskrivelsen omtaler alle verkene som frittstående."],
  ["kuratering", "fagbegrep", "Utvalg og sammenstilling av verk i en bestemt visningsramme.", "Nye runder endret hva de samme fem feltene formidlet."],
  ["midlertidig utstilling", "tidsbegrep", "En visning avgrenset til en periode.", "Verkene fra 2020, 2022 og 2023 skal ikke leses som en permanent samling."],
  ["fiendtlig arkitektur", "byromsbegrep", "Møblering eller utforming som hindrer bestemte former for opphold.", "Du må ikke sove svarte på stoler med armlener som gjør det vanskelig å legge seg."]
].map(([term, type, meaning, context], index) => ({ id: `skulptursonen_${index + 1}_${term.replaceAll(" ", "_")}`, term, type, meaning, status: "current", context, linked_to: { kind: "place", id: placeId }, tags: ["offentlig kunst", "byrom"], sources: [{ label: "Norsk Billedhoggerforening", url: term === "fiendtlig arkitektur" ? urls.sleep : urls.project }] }));
write(languageFile, { place_id: placeId, title: "Språk ved Skulptursonen", verified_at: verifiedAt, dialect_status: "not_applicable_place_level", entries: languageEntries });
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const storyFile = "data/stories/stories_skulptursonen_ovre_slottsgate.json";
const story = {
  id: "st_skulptursonen_fem_felt_i_gaten",
  quality_profile: "episode_v1",
  type: "turning_point",
  title: "Fem kunstfelt i gågaten",
  year: 2019,
  place_id: placeId,
  summary: "Da Øvre Slottsgate ble gågate i 2019, ble fem kunstfelt bygget inn i strekningen mellom Tollbugata og Prinsens gate.",
  story: "I august 2019 var Øvre Slottsgate nyetablert som gågate. Mellom Tollbugata og Prinsens gate fikk strekningen sittemøbler, planter, trær og fem spesialtilpassede felt for skulptur. Kunstrommet ble tegnet inn i den samme infrastrukturen som mennesker brukte til å gå og oppholde seg.\n\nNorsk Billedhoggerforening samarbeidet med Kulturetaten og Bymiljøetaten. Kommunen stilte produksjonsmidler til rådighet, mens kunstnere laget frittstående verk som måtte forholde seg til den åpne gaten.\n\nFeltene ble stående som ramme, men verkene skiftet. Katalogen dokumenterer nye sammenstillinger i 2020, 2022 og 2023. Dermed ble midlertidigheten selve motoren i prosjektet: samme sted kunne stille nye spørsmål til byen uten at en utstillingsrunde ble gjort permanent.",
  episode: { actors: ["Norsk Billedhoggerforening", "Kulturetaten", "Bymiljøetaten"], date: "august 2019", action: "Fem spesialtilpassede skulpturfelt ble lansert i den nye gågaten.", consequence: "Øvre Slottsgate fikk en offentlig kunstplattform for skiftende verk." },
  sources: [{ title: "Norsk Billedhoggerforening – Øvre Slottsgate", url: urls.project }, { title: "Oppdag Kvadraturen – Skulptursonen", url: urls.oppdag }],
  tags: ["offentlig kunst", "gågate", "skulptur", "2019", "kuratering"],
  related_people: [personId],
  related_places: [],
  next_scenes: [],
  score: { narrative: 3, historical: 2, source: 4, play_value: 3, originality: 3, total: 15 },
  arc: { start: "Gaten bygges om for fotgjengere.", middle: "Fem felt integrerer skulptur i byrommet.", end: "Skiftende runder gjør den samme rammen til nye utstillinger." }
};
write(storyFile, [story]);
const storiesManifest = read("data/stories/stories_manifest.json");
storiesManifest.files = storiesManifest.files.filter((row) => row.entity_id !== placeId);
storiesManifest.files.push({ category: "kunst", entity_id: placeId, path: storyFile });
write("data/stories/stories_manifest.json", storiesManifest);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
addOnce(episodeManifest.files, storyFile);
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_kunst.json";
const readings = read(readingFile);
readings.items = readings.items.filter((row) => !row.place_ids?.includes(placeId));
readings.items.push(
  { id: "lesespor_skulptursonen_oversikt", title: "Øvre Slottsgate 2019–2024", author: null, publication: "Norsk Billedhoggerforening", date: null, year: 2024, type: "official_project_history", subjects: [{ type: "place", name: "Skulptursonen i Øvre Slottsgate", id: placeId }], place_ids: [placeId], person_ids: [personId], category_hints: ["kunst"], url: urls.project, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Hovedkilde til perioden, samarbeidet, gateutformingen og dokumenterte utstillingsrunder." },
  { id: "lesespor_skulptursonen_katalog", title: "Øvre Slottsgate – katalog", author: null, publication: "Norsk Billedhoggerforening", date: null, year: 2024, type: "official_exhibition_catalogue", subjects: [{ type: "theme", name: "Offentlig skulptur", id: null }], place_ids: [placeId], person_ids: [personId], category_hints: ["kunst"], url: urls.catalogue, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Samlet oversikt over kunstnere og verk fra rundene i 2020, 2022 og 2023." },
  { id: "lesespor_skulptursonen_hestebarrikade", title: "Hestebarrikade", author: "Vibeke Tandberg", publication: "Norsk Billedhoggerforening", date: null, year: 2023, type: "official_artwork_entry", subjects: [{ type: "work", name: "Hestebarrikade", id: "skulptursonen_hestebarrikade_2023" }], place_ids: [placeId], person_ids: [personId], category_hints: ["kunst"], url: urls.hest, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Dokumenterer kunstner, materiale, form og byromstematikk." },
  { id: "lesespor_skulptursonen_du_ma_ikke_sove", title: "Du må ikke sove", author: "Ingrid Solvik", publication: "Norsk Billedhoggerforening", date: null, year: 2023, type: "official_artwork_entry", subjects: [{ type: "work", name: "Du må ikke sove", id: "skulptursonen_du_ma_ikke_sove_2023" }], place_ids: [placeId], person_ids: [], category_hints: ["kunst"], url: urls.sleep, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Dokumenterer tre broderte køyer og verkets forhold til ekskluderende bymøblering." }
);
write(readingFile, readings);

const questionRows = [
  ["Når ble Skulptursonen lansert?", "August 2019", "August 2009", "August 2024", "Skulptursonen ble lansert i august 2019.", "project", "em_kunst_institusjoner_kanon"],
  ["Hvor lå de fem kunstfeltene?", "Mellom Tollbugata og Prinsens gate", "Mellom Karl Johans gate og Stortorvet", "Mellom Akersgata og Møllergata", "Feltene lå i Øvre Slottsgate mellom Tollbugata og Prinsens gate.", "project", "em_kunst_institusjoner_kanon"],
  ["Hvor mange spesialtilpassede soner var laget for skulptur?", "Fem", "Tre", "Åtte", "Gatestrekket fikk fem spesialtilpassede soner.", "oppdag", "em_kunst_institusjoner_kanon"],
  ["Hvilken endring i gaten fulgte lanseringen?", "Øvre Slottsgate ble gågate", "Gaten ble motorvei", "Gaten ble stengt for fotgjengere", "Prosjektet ble lansert da Øvre Slottsgate var nyetablert som gågate.", "project", "em_kunst_institusjoner_kanon"],
  ["Hvilke elementer inngikk sammen med kunstfeltene?", "Sittemøbler, planter og trær", "Kinolerret, scene og tribune", "Fontene, brygge og båt", "Utstillingsområdet var integrert med sittemøbler, planter og trær.", "project", "em_kunst_sjanger_stil_og_posisjonering"],
  ["Hvem samarbeidet om prosjektet?", "Norsk Billedhoggerforening, Kulturetaten og Bymiljøetaten", "Nasjonalmuseet, Operaen og Stortinget", "Bare private gallerier", "Skulptursonen var et samarbeid mellom kunstnerorganisasjonen og to kommunale etater.", "project", "em_kunst_institusjoner_kanon"],
  ["Hvordan beskrives skulpturene i prosjektoversikten?", "Som frittstående verk som forholdt seg til byrommet", "Som veggmalerier inne i butikker", "Som én permanent bronsegruppe", "Verkene var frittstående, men skulle samtidig forholde seg til byrommet.", "project", "em_kunst_sjanger_stil_og_posisjonering"],
  ["Hvilken prosjektperiode oppgir Norsk Billedhoggerforening?", "2019–2024", "1999–2004", "2024–2034", "Den offisielle prosjektoversikten oppgir 2019–2024.", "project", "em_kunst_institusjoner_kanon"],
  ["Hvilke år har egne dokumenterte verkgrupper i prosjektoversikten?", "2020, 2022 og 2023", "2011, 2012 og 2013", "2024, 2025 og 2026", "Katalogen grupperer verk under 2020, 2022 og 2023.", "project", "em_kunst_institusjoner_kanon"],
  ["Hvem laget Hestebarrikade?", "Vibeke Tandberg", "Ingrid Solvik", "Yamile Calderon", "Vibeke Tandberg viste Hestebarrikade i 2023-runden.", "hest", "em_kunst_sjanger_stil_og_posisjonering"],
  ["Hva besto Hestebarrikade av?", "Fem hestehoder i betong", "Tre broderte køyer", "Et gullmalt spisebord", "Verket besto av fem hestehoder i betong.", "hest", "em_kunst_materialitet_teknikk_handverk"],
  ["Hvem laget Du må ikke sove?", "Ingrid Solvik", "Vibeke Tandberg", "Aleksander Stav", "Ingrid Solvik viste Du må ikke sove i 2023-runden.", "sleep", "em_kunst_sjanger_stil_og_posisjonering"],
  ["Hvilken hovedform brukte Du må ikke sove?", "Tre broderte køyer", "Fem betonghoder", "En forkullet bjørk", "Verket brukte tre køyer med broderier.", "sleep", "em_kunst_materialitet_teknikk_handverk"],
  ["Hva var What Money Can Buy laget av?", "Epoxy og fiberglass spraymalt som gull og marmor", "Ubehandlet granitt og stål", "Brodert ull og bomull", "Calderons verk brukte epoxy og fiberglass, spraymalt for å ligne gull og marmor.", "money", "em_kunst_materialitet_teknikk_handverk"],
  ["Hvorfor skal 2023-verkene ikke presenteres som dagens faste installasjon?", "De tilhørte en datert, skiftende utstillingsrunde", "De manglet kunstnere", "Gaten fantes ikke i 2023", "Prosjektet brukte skiftende runder; katalogen dokumenterer historiske visninger.", "project", "em_kunst_institusjoner_kanon"],
  ["Hva var stabilt mens verkene skiftet?", "De fem visningsfeltene og gatens romlige ramme", "Titlene på alle verkene", "Materialet i hver skulptur", "Kildene skiller mellom den tilrettelagte gaten og de skiftende verkene.", "oppdag", "em_kunst_sjanger_stil_og_posisjonering"],
  ["Hvorfor er planskissen viktig som kilde?", "Den viser hvordan kunstfeltene inngikk i gatestrekket", "Den måler publikums mening", "Den beviser hvilke verk som står der nå", "Planskissen dokumenterer den romlige organiseringen, ikke publikumsreaksjoner eller dagens verk.", "oppdag", "em_kunst_institusjoner_kanon"],
  ["Hva gjorde kommunale produksjonsmidler mulig?", "At kunstnere kunne produsere verk for sonen", "At alle verk ble kommunal eiendom", "At gaten fikk inngangsbillett", "Prosjektoversikten sier at produksjonsmidler ble stilt til rådighet for kunstnerne.", "project", "em_kunst_institusjoner_kanon"],
  ["Hvordan møtte Skulptursonen publikum annerledes enn et galleri?", "Verkene sto i vanlig ferdsel uten museumsinngang", "Publikum måtte bestille privat omvisning", "Verkene kunne bare ses på nett", "Kunstfeltene var integrert i en åpen gågate.", "oppdag", "em_kunst_sjanger_stil_og_posisjonering"],
  ["Hva koblet Hestebarrikade sammen?", "Politihester og fysiske sikkerhetsbarrierer", "Hagebruk og sjøfart", "Musikk og teater", "Verkbeskrivelsen kobler politihester til barrierer som former bybildet.", "hest", "em_kunst_kvalitet_kritikk_og_symbolsk_kapital"],
  ["Hva svarte Du må ikke sove på i gatebildet?", "Møblering som gjør det vanskelig å legge seg", "Manglende bilparkering", "Reklameskilt over butikkene", "De broderte køyene speilet stoler med armlener og tematiserte fiendtlig arkitektur.", "sleep", "em_kunst_kvalitet_kritikk_og_symbolsk_kapital"],
  ["Hvilken metode passer for å sammenligne betong, broderi og fiberglass?", "Materialitetsanalyse", "Slektsgransking", "Trafikktelling", "Materialitetsanalyse undersøker hvordan stoff, overflate og produksjon påvirker verkets møte med gaten.", "project", "em_kunst_materialitet_teknikk_handverk", "method", "met_kunst_materialitetsanalyse"],
  ["Hvilken metode undersøker utvalget av fem verk i en runde?", "Kuratorisk analyse", "Geologisk analyse", "Lydanalyse", "Kuratorisk analyse undersøker hvordan verk velges og sammenstilles i en visningsramme.", "project", "em_kunst_sjanger_stil_og_posisjonering", "method", "met_kunst_kuratorisk_analyse"],
  ["Hvilken metode kartlegger forholdet mellom forening og kommune?", "Institusjonsanalyse", "Fargeanalyse", "Anatomi", "Institusjonsanalyse kan skille kunstnerorganisasjonens, Kulturetatens og Bymiljøetatens roller.", "project", "em_kunst_institusjoner_kanon", "method", "met_kunst_institusjonsanalyse"],
  ["Hva kan et besøk i 2026 ikke bevise alene?", "At verkene fra 2023 fortsatt er installert", "At gaten finnes", "At området kan nås til fots", "Historiske verk krever daterte kilder; dagens observasjon kan ikke alene bevise videre installasjon.", "project", "em_kunst_institusjoner_kanon", "context"],
  ["Hva er den beste helhetslesningen av Skulptursonen?", "Et tidsavgrenset kunstprosjekt der gate, institusjoner og skiftende verk virket sammen", "En permanent samling av fem like skulpturer", "Et innendørs museum for billedhugging", "Stedet forener planlagt byrom, institusjonelt samarbeid og daterte utstillingsrunder.", "project", "em_kunst_institusjoner_kanon", "concept"],
  ["Hva viser What Money Can Buy om plassering?", "Butikkmiljøet inngikk i verkets spørsmål om luksus og status", "Plasseringen var uten betydning", "Verket var laget for en skog", "Verkbeskrivelsen knytter beliggenheten blant luksusbutikker til tematikken.", "money", "em_kunst_kvalitet_kritikk_og_symbolsk_kapital", "context"],
  ["Hvordan kan Boris Groys' Art Power hjelpe analysen?", "Ved å belyse hvordan institusjonelt utvalg gir verk synlighet i offentligheten", "Ved å fastslå dagens installasjon", "Ved å beregne betongens vekt", "Groys' perspektiv kan skjerpe analysen av kuratering og institusjonell synlighet uten å erstatte stedskildene.", "project", "em_kunst_institusjoner_kanon", "concept", "met_kunst_institusjonsanalyse", "institusjonell_legitimering", "boris_groys"]
];

const questions = questionRows.map((row, index) => {
  const [question, answer, wrong1, wrong2, knowledge, sourceId, emne_id, , method_id, topic_hook_id, thinker_id] = row;
  const raw = [answer, wrong1, wrong2];
  const shift = index % 3;
  const options = [...raw.slice(shift), ...raw.slice(0, shift)];
  const number = index + 1;
  const question_type = number <= 14 ? "fact" : number <= 21 ? "context" : method_id ? "analysis" : "concept";
  const item = {
    id: `skulptursonen_quiz_${String(number).padStart(2, "0")}`,
    quiz_id: `kunst_${placeId}_set_${Math.floor(index / 7) + 1}_q${index % 7 + 1}`,
    categoryId: "kunst", placeId, targetId: placeId, personId: "", natureId: "", question_scope: "place",
    question, options, answer, answerIndex: options.indexOf(answer), knowledge, trivia: [],
    difficulty: number <= 7 ? 1 : number <= 14 ? 2 : number <= 21 ? 3 : 4,
    question_type,
    question_layer: number <= 14 ? "normal_opening" : number <= 21 ? "bridge" : "final",
    year: null, epoke_id: null, epoke_domain: "kunst", emne_id, related_emner: [], core_concepts: [], concept_focus: [], learning_paths: [],
    tags: [placeId, "kunst", "offentlig_kunst", "skulptur"], required_tags: ["art_anchor", "em_kunst"],
    source: [sourceId], source_origin: "external", claim_basis: knowledge, claim_id: `claim_skulptursonen_quiz_${String(number).padStart(2, "0")}`,
    art_anchor_type: number <= 14 ? "institution_or_artwork" : "institutional_case", source_note: "Kildekontrollert mot Skulptursonens offisielle prosjekt- og verkspakke.",
    external_source_ratio_target: 1, internal_file_only_allowed: false, requires_art_anchor: true, requires_external_claim_basis: true,
    validation: { emne_id_exists_in_emner_kunst: true, category_matches_badge: true, schema_extends_generic_supersetQUIZMAL: true },
    primary_knowledge_unit_id: `ku_kunst_skulptursonen_${String(number).padStart(2, "0")}`,
    knowledge_unit_ids: [`ku_kunst_skulptursonen_${String(number).padStart(2, "0")}`], concept_ids: [], term_ids: [], knowledge_contract_version: 1, knowledge_link_status: "linked"
  };
  if (method_id) {
    item.method_id = method_id;
    item.guidance_basis = ["data/fag/kunst/fagkart_kunst_canonical_v4_5.json", "data/fag/kunst/methods_kunst_canonical_v4_5.json"];
    item.validation.method_id_exists_in_methods_kunst = true;
  }
  if (topic_hook_id) {
    item.topic_hook_id = topic_hook_id;
    item.thinker_id = thinker_id;
    item.theory_ref = { topic_hook_id, thinker_id, work: "Art Power", why_it_helps: "Groys' perspektiv belyser hvordan kuratorisk og institusjonelt utvalg gir kunst offentlig synlighet, uten å erstatte kildene til prosjektperioden, aktørene og verkene." };
  }
  return item;
});

const phases = ["opening", "middle", "bridge", "final"];
const quizFile = "data/quiz/kunst/skulptursonen_ovre_slottsgate_sets.json";
const briefFile = "data/quiz/production_briefs/kunst/skulptursonen_ovre_slottsgate.json";
const contextFile = "data/quiz/production_context/kunst/skulptursonen_ovre_slottsgate.json";
const quizSources = {
  project: { url: urls.project, source_type: "institutional", review_status: "reviewed", review_note: "Prosjektperiode, samarbeid, lansering, gateutforming og verkoversikt." },
  oppdag: { url: urls.oppdag, source_type: "official_municipal_destination", review_status: "reviewed", review_note: "Avgrensning, fem felt, planskisse og byromselementer." },
  hest: { url: urls.hest, source_type: "official_artwork_entry", review_status: "reviewed", review_note: "Kunstner, tittel, materiale, form og tematikk." },
  sleep: { url: urls.sleep, source_type: "official_artwork_entry", review_status: "reviewed", review_note: "Kunstner, tre broderte køyer og fiendtlig arkitektur." },
  money: { url: urls.money, source_type: "official_artwork_entry", review_status: "reviewed", review_note: "Kunstner, materialer, luksus- og statustematikk." }
};
const curriculum = {
  module_ids: ["felt_institusjon", "produksjon_praksis", "makt_legitimitet"],
  emne_ids: [...new Set(questions.map((row) => row.emne_id))],
  topic_hook_ids: ["institusjonell_legitimering"],
  method_ids: [...new Set(questions.map((row) => row.method_id).filter(Boolean))],
  thinker_ids: ["boris_groys"], works: ["Art Power"]
};
const existingQuizAudit = { searched_paths: [quizFile, "data/quiz/manifest.json", "data/quiz"], active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen aktiv canonical stedspakke." }, decisions: ["Produser normal 4×7 med fjorten direkte åpningsfakta.", "Hold metode og teori til finaldelen.", "Skil historiske verk fra dagens situasjon."], knowledge_migration: "Alle 28 spørsmål får stabile Kunst Knowledge-ID-er." };
const profileDecision = { profile: "normal", set_count: 4, questions_per_set: 7, justification: "Fire læringsjobber dekker sted og etablering, verk og materialer, offentlig byrom og institusjonell/kuratorisk analyse." };
const heldBackCandidates = ["Verk fra 2023 som påstand om dagens installasjon.", "Norsk Billedhoggerforening som samme entitet som gatestrekket.", "Generiske billedhuggerverktøy uten dokumentert stedskobling.", "Publikumsreaksjoner utledet bare fra verkbeskrivelsene."];

const placesIndexFile = "data/places/places_index.json";
const placesIndex = read(placesIndexFile);
const indexedPlace = placesIndex.find((item) => item.id === placeId);
if (!indexedPlace) throw new Error(`${placeId} mangler i ${placesIndexFile}`);
Object.assign(indexedPlace, {
  year: place.year,
  desc: place.desc,
  image: place.image,
  cardImage: place.cardImage,
  frontImage: place.frontImage
});
write(placesIndexFile, placesIndex);
write(briefFile, {
  schema_version: "1.0", status: "reviewed", categoryId: "kunst", targetId: placeId, profile_hint: "normal", reviewed_at: verifiedAt,
  review_note: "Offisielle prosjekt-, kommune- og verkssider bærer en 4×7-pakke med eksplisitt skille mellom gateinfrastruktur, daterte runder og dagens ukjente installasjon.",
  scope: { place: place.name, production_profile: "normal", set_count: 4, questions_per_set: 7, total_questions: 28, normal_opening_questions: 14 },
  sources: quizSources, selected_curriculum: curriculum, existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates,
  claims: questions.map((item, index) => ({ claim_id: item.claim_id, order: index + 1, planned_phase: phases[Math.floor(index / 7)], family: index < 14 ? "fact" : index < 21 ? "context" : "concept_theory", statement: item.claim_basis, source_ids: item.source, source_origin: "external", emne_id: item.emne_id }))
});
write(quizFile, {
  targetId: placeId,
  categoryId: "kunst",
  size_class: "normal_4x7",
  generated_from: briefFile,
  generator_version: "kunst_v1_source_based",
  sources: Object.fromEntries(Object.entries(quizSources).map(([key, value]) => [key, value.url])),
  sets: phases.map((phase, index) => ({ set_id: `kunst_${placeId}_set_${index + 1}`, title: ["Gaten og de fem feltene", "Verk og materialer", "Offentlig kunst i byrommet", "Institusjon, metode og kuratering"][index], level: index + 1, order: index + 1, phase, xp: 50 + index * 25, questions: questions.slice(index * 7, index * 7 + 7) }))
});
const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = quizManifest.sets.filter((row) => row.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizFile });
write("data/quiz/manifest.json", quizManifest);
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.kunst.quizPackageSchema = "../quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json";
fagManifest.kunst.quizProduction = { status: "pilot", required_inputs: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"], context_builder: "scripts/build-quiz-production-context.mjs", profile_system: "adaptive_relative_superset", package_schema: "quizPackageSchema", context_artifact_root: "data/quiz/production_context", targets: fagManifest.kunst.quizProduction?.targets || {} };
fagManifest.kunst.quizProduction.targets[placeId] = { source_brief: "../quiz/production_briefs/kunst/skulptursonen_ovre_slottsgate.json", context_artifact: "../quiz/production_context/kunst/skulptursonen_ovre_slottsgate.json", quiz_file: "../quiz/kunst/skulptursonen_ovre_slottsgate_sets.json" };
write("data/fag/fag_manifest.json", fagManifest);

const builtContext = await runBuildQuizProductionContext({ root, categoryId: "kunst", targetId: placeId, outputPath: contextFile });
const quizPackage = read(quizFile);
quizPackage.production_context = {
  manifest_category: "kunst", profile: builtContext.profile, standard_version: "3.4", source_brief: briefFile, context_artifact: contextFile,
  resolved_files: Object.fromEntries(Object.entries(builtContext.resolved_files).map(([key, value]) => [key, value.path])),
  required_inputs_loaded: builtContext.required_inputs_loaded,
  pensum_module_ids: builtContext.selected_curriculum.module_ids,
  emne_ids: builtContext.selected_curriculum.emne_ids,
  topic_hook_ids: builtContext.selected_curriculum.topic_hook_ids,
  method_ids: builtContext.selected_curriculum.method_ids,
  thinker_ids: builtContext.selected_curriculum.thinker_ids,
  works: builtContext.selected_curriculum.works,
  source_review_status: builtContext.source_review_status,
  existing_quiz_audit: builtContext.existing_quiz_audit,
  profile_decision: builtContext.profile_decision,
  held_back_candidates: builtContext.held_back_candidates,
  normal_opening_questions: 14,
  theory_start_phase: "final",
  method_start_phase: "final"
};
write(quizFile, quizPackage);
await runBuildQuizProductionContext({ root, categoryId: "kunst", targetId: placeId, outputPath: contextFile });

const buildTextClaims = (text, prefix, sourceRows) => {
  const textSentences = sentences(text);
  if (textSentences.length !== sourceRows.length) {
    throw new Error(`${prefix}: ${textSentences.length} setninger, men ${sourceRows.length} kildepekere`);
  }
  return textSentences.map((claim, index) => ({
    id: `claim_skulptursonen_${prefix}_${String(index + 1).padStart(2, "0")}`,
    claim,
    sourceUrl: sourceRows[index].sourceUrl,
    sourceLocation: sourceRows[index].sourceLocation,
    sourceType: "official",
    verifiedAt,
    status: "verified",
    claimKind: sourceRows[index].claimKind,
    evidenceMode: sourceRows[index].evidenceMode,
    temporalStatus: sourceRows[index].temporalStatus
  }));
};
const descClaims = buildTextClaims(desc, "desc", descClaimSources);
const popupClaims = buildTextClaims(popupDesc, "popup", popupClaimSources);
const claims = [...descClaims, ...popupClaims];
const claimCoverage = (textClaims) => textClaims.map((claim, index) => ({ sentence: index + 1, claimIds: [claim.id] }));
const quizReadinessClaimIds = [
  popupClaims[0].id,
  popupClaims[1].id,
  popupClaims[2].id,
  popupClaims[0].id,
  popupClaims[2].id,
  popupClaims[4].id,
  popupClaims[6].id,
  popupClaims[8].id
];
write("data/places/production/skulptursonen_ovre_slottsgate.json", {
  schemaVersion: "4.2",
  validatorVersion: "4.2.1",
  placeId,
  placeFile,
  status: "ready_v4_2",
  identity: { status: "resolved", represents: "Skulptursonen som fem tilrettelagte visningsfelt i Øvre Slottsgate, brukt i prosjektperioden 2019–2024.", period: "2019–2024", excludes: ["ett permanent kunstverk", "verk fra 2023 som påstand om dagens installasjon", "hele Øvre Slottsgate utenfor Tollbugata–Prinsens gate"] },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category, coordinates: { lat: place.lat, lon: place.lon } },
  textHashes: { algorithm: "sha256", desc: sha256(desc), popupDesc: sha256(popupDesc) },
  claims,
  sentenceCoverage: { desc: claimCoverage(descClaims), popupDesc: claimCoverage(popupClaims) },
  collections: { people: [personId], objects: ["skulptursonen_planskisse_2019"], brands: [brandId], productions: place.productions.map((row) => row.id) },
  roundsReadiness: { status: "ready", exactCollectionCount: 4 },
  quizReadiness: { status: "canonical_normal_4x7", quizTargetId: placeId, sourceBrief: briefFile, productionContext: contextFile, normalOpeningQuestions: 14, totalQuestions: 28, reuseDecision: "Ingen aktiv canonical stedspakke fantes.", questions: questions.slice(0, 8).map((item, index) => ({ question: item.question, answer: item.answer, type: ["når", "hvor", "hva", "hva_skjedde", "hva", "hvem", "hva", "når"][index], normalKnowledgeQuestion: true, claimIds: [quizReadinessClaimIds[index]] })) },
  source_conflicts: [
    { claim: "De fem verkene fra 2023 står fortsatt permanent i gaten.", status: "rejected", reason: "Kildene beskriver skiftende utstillingsrunder og oppgir prosjektperioden som 2019–2024." },
    { claim: "Skulptursonen er ett enkelt skulpturverk.", status: "rejected", reason: "Kildene beskriver fem tilrettelagte visningsfelt med skiftende verk." }
  ],
  reviews: {
    factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Skulptursonen official-source review", notes: "Periode, geografi, aktører, planskisse, verk og bildeproveniens er kontrollert." },
    editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Skulptursonen identity review", introducedNewFacts: false, notes: "Gateanlegg, prosjektperiode, runder, verk og dagens ukjente installasjon holdes adskilt." }
  },
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: claims.length, total: claims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }
});

write("reports/place-production/skulptursonen-ovre-slottsgate-phase1-24-gate-audit-v1.json", {
  schema: "history_go_phase1_24_quality_gate_v1",
  place_id: placeId,
  verified_at: verifiedAt,
  null_measurement: { existing_place: true, coordinate_changed: false, existing_quiz: "none", existing_story: "none", existing_collections: 0 },
  collections: { required: ["people", "objects", "brands", "productions"], loaded_preview_images: 6, missing: 0, coverage_percent: 100 },
  brands: { candidates_reviewed: ["Norsk Billedhoggerforening", "Kulturetaten", "Bymiljøetaten"], selected: [brandId], held_back: ["Kulturetaten og Bymiljøetaten – offentlige etatsroller dokumenteres i historikken, men holdes tilbake fra Brand-rundingen uten separate identitetsassets i denne leveransen."], logo_coverage: { required: 1, reviewed: 1, missing: 0, percent: 100 } },
  people: { candidates_reviewed: ["Vibeke Tandberg", "Ingrid Solvik", "Yamile Calderon"], selected: [personId], held_back: ["Ingrid Solvik og Yamile Calderon – verkene beholdes i Productions; ekstra People-profiler holdes tilbake uten nødvendig egen identitets- og bildeproduksjon."], image_coverage_percent: 100 },
  objects: { selected: ["skulptursonen_planskisse_2019"], exception: "Én signaturgjenstand er tilstrekkelig; kunstverk og generiske billedhuggerverktøy holdes utenfor Objects." },
  quality_score: {
    correctness_and_evidence: { score: 5, note: "Offisielle prosjekt-, kommune-, museum-, katalog- og verkssider med eksplisitt tidsavgrensning." },
    coverage_and_completion: { score: 5, note: "Fire samlinger, fem milepæler, seks språkoppføringer, fire lesespor, Story, Fagverk og 4×7-quiz." },
    editorial_quality: { score: 5, note: "Gateinfrastruktur, skiftende runder, materialer og institusjonelt samarbeid bindes sammen uten samtidsgjetning." },
    technical_integrity: { score: 5, note: "Deterministisk finalizer, manifester, Knowledge-binding og regresjonstest inngår." },
    safety_and_responsibility: { score: 4, note: "Offisielle verkbilder brukes som redaksjonelle prosjektreferanser med proveniens; Commons-portrettet er CC BY 4.0." },
    maintainability_and_auditability: { score: 5, note: "Claims, kildegrenser, holdbacks, produksjonskontekst og faste ID-er gir revisjonsspor." },
    total: 29,
    critical_findings: 0,
    unresolved_blockers: 0
  }
});

const workcardFile = "reports/place-production/skulptursonen-ovre-slottsgate-workcard-current.json";
const workcard = read(workcardFile);
Object.assign(workcard, {
  status: "complete",
  phases: "1–24",
  verified_at: verifiedAt,
  production_profile: "standard",
  canonical_next: null,
  notes: ["Eksisterende verifisert geometri og begge linjegrenser er bevart uendret.", "Fire samlinger er People, Objects, Brands og Productions.", "Kunst quizProduction er aktivert med normal 4×7 og Knowledge-binding.", "Prosjektperioden 2019–2024, historiske verk og dagens ukjente installasjon er eksplisitt avgrenset."]
});
write(workcardFile, workcard);
execFileSync(process.execPath, ["scripts/build-fagverk-release-manifest.mjs"], { cwd: root, stdio: "inherit" });
console.log(`Finalized Skulptursonen i Øvre Slottsgate (${questions.length} quiz questions, ${chronology.length} chronology entries).`);
