#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const mode = process.argv.find(arg => arg.startsWith("--phase="))?.split("=")[1] || "all";
if (!new Set(["content", "integration", "all"]).has(mode)) throw new Error(`Unknown phase: ${mode}`);
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const addUnique = (rows, value, key = item => item) => {
  if (!rows.some(item => key(item) === key(value))) rows.push(value);
};

const placeFile = "data/places/by/oslo/places/olaf_ryes_plass.json";
const sourceUrls = {
  municipality: "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/olaf-ryes-plass/",
  byleksikon: "https://oslobyleksikon.no/side/Olaf_Ryes_plass",
  rye: "https://snl.no/Olaf_Rye",
  sundt: "https://snl.no/Eilert_Sundt",
  parkteatret: "https://www.parkteatret.no/english",
  lokkadagene: "https://visitlokka.no/lokkadagene/",
  lokkaprogram: "https://visitlokka.no/program-for-lokkadagene-12-13-sept-2026/",
  visitlokka: "https://visitlokka.no/",
  byokologi: "https://magasin.oslo.kommune.no/byplan/byokologi-hva-er-det-egentlig",
  before: "https://www.oslobilder.no/OMU/OB.Y1272",
  after: "https://commons.wikimedia.org/wiki/File:Olaf_Ryes_plass_sommer.JPG"
};

function buildContent() {
  const place = read(placeFile);
  const originalCoordinates = { lat: place.lat, lon: place.lon, r: place.r };
  Object.assign(place, {
    aliases: ["Olaf Ryes Plads"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Olaf_Ryes_plass_sommer.JPG/1280px-Olaf_Ryes_plass_sommer.JPG",
    cardImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Olaf_Ryes_plass_sommer.JPG/1280px-Olaf_Ryes_plass_sommer.JPG",
    frontImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Olaf_Ryes_plass_sommer.JPG/1280px-Olaf_Ryes_plass_sommer.JPG",
    desc: "Oslo kommune kjøpte den åpne løkken i 1863, plassen fikk navn etter offiseren Olaf Rye i 1864, og parken ble opparbeidet i 1890. Eilert Sundt-bysten fra 1892, fontenen fra 1927 og den fortsatte bruken som lokalt møtested gjør flere historiske lag synlige i samme parkrom.",
    popupDesc: `Olaf Ryes plass er det avgrensede park- og plassrommet mellom Markveien, Grüners gate, Thorvald Meyers gate og Sofienberggata. Kommunen kjøpte den åpne løkken i 1863, og i 1864 fikk plassen navn etter offiseren Olaf Rye. Store norske leksikon daterer Ryes død ved Fredericia til 6. juli 1849; denne dateringen brukes framfor en feilaktig 1848-formulering i én av stedskildene.

I 1890 ble området opparbeidet som park. To år senere ble Mathias Skeibroks bronsebyste av samfunnsforskeren Eilert Sundt reist her. Oslo byleksikon oppgir at Oslo Arbeidersamfund og Selskabet for Folkeoplysningens Fremme finansierte monumentet. Bysten knytter et fysisk stedsspor til Sundts arbeid med levekår og samfunnsforhold.

En fontene ble anlagt midt på plassen i 1927. Sammen med trærne, plenene, ganglinjene og Eilert Sundt-bysten gjør den parkens historiske struktur lesbar. Kommunens side beskriver fortsatt fontenen som et anlegg på selve plassen.

Parkteatret ligger ved Olaf Ryes plass 11, men bygningen og virksomheten er ikke en del av den canonicale plassflaten. Parkteatrets egen presentasjon daterer kinohistorien til 1907 og beskriver dagens bruk som konsertsted. Her behandles dette som nabokontekst og Brand-kandidat, ikke som om plassen eier hele institusjonshistorien.

Historiske og nyere fotografier viser parkrommet i 1903 og 2009. De deler motiver som vegetasjon, opphold og Eilert Sundt-bysten, men er ikke dokumentert som et eksakt optisk før/etter-par. De brukes til å sammenligne tidslag, ikke til å bevise alle endringer eller dagens tilstand i 2026.

Plassen brukes fortsatt som lokalt møte- og arrangementsrom. Visit Løkka annonserer Løkkadagene og marked på Olaf Ryes plass i september 2026 og julemarked og tenning av julestjernen i november. Slike daterte programmer viser aktuell bruk, men gjøres ikke om til permanente egenskaper ved stedet.`,
    spatial_profile: {
      place_form: "offentlig_park_og_plass",
      canonical_scope: "Selve den navngitte Olaf Ryes plass-parken mellom Markveien, Grüners gate, Thorvald Meyers gate og Sofienberggata; ikke omkringliggende gårder, serveringssteder, holdeplass eller hele Grünerløkka.",
      boundary_description: "Oslo kommune avgrenser plassen med Markveien i vest, Grüners gate i sør, Thorvald Meyers gate i øst og Sofienberggata i nord.",
      geometry_status: "verified_named_square_geometry",
      measurement_status: "no_area_claim",
      sources: [{ source: "Oslo kommune – Olaf Ryes plass", url: sourceUrls.municipality, supports: ["canonical_scope", "boundary_description"] }]
    },
    temporal_profile: {
      municipal_purchase_year: 1863,
      naming_year: 1864,
      park_laid_out_year: 1890,
      eilert_sundt_bust_year: 1892,
      parkteatret_cinema_origin_year: 1907,
      fountain_year: 1927
    },
    history_layers: [
      { id: "olaf_ryes_plass_lokke_og_navn", title: "Fra løkke til navngitt plass", period: "1863–1864", sort_order: 10, summary: "Kommunen kjøpte den åpne løkken i 1863, og plassen fikk navn etter Olaf Rye i 1864." },
      { id: "olaf_ryes_plass_park_og_byste", title: "Park og folkeopplysning", period: "1890–1892", sort_order: 20, summary: "Parken ble opparbeidet i 1890, og Mathias Skeibroks Eilert Sundt-byste ble reist i 1892." },
      { id: "olaf_ryes_plass_kino_som_nabo", title: "Kinoen ved plassen", period: "1907–", sort_order: 30, summary: "Kinohistorien ved Olaf Ryes plass 11 startet i 1907; dagens Parkteatret viderefører huset som konsertsted, men forblir et eget nabosted." },
      { id: "olaf_ryes_plass_fontene_og_bruk", title: "Fontene og levende møteplass", period: "1927–", sort_order: 40, summary: "Fontenen fra 1927 ble et fast parkanker, mens marked, opphold og daterte arrangementer fortsetter å fylle plassen med skiftende bruk." }
    ],
    for_na: {
      title: "Olaf Ryes plass i 1903 og 2009",
      beforeImage: "https://dms08.dimu.org/image/012uKXXWeWFR?dimension=1200x1200",
      beforeImageLabel: "Olaf Ryes Plads med park, benker og byste (1903)",
      beforeImageMeta: { source: "oslo_museum_oslobilder", sourcePage: sourceUrls.before, objectId: "OB.Y1272", author: "Anders Beer Wilse", credit: "Anders Beer Wilse / Oslo Museum (OB.Y1272)", license: "Creative Commons 3.0", date: "1903", depictedPlace: "Olaf Ryes plass, Oslo", verified: true, verifiedAt: "2026-08-25" },
      nowImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Olaf_Ryes_plass_sommer.JPG/1280px-Olaf_Ryes_plass_sommer.JPG",
      nowImageLabel: "Olaf Ryes plass om sommeren (1. august 2009)",
      nowImageMeta: { source: "wikimedia_commons", sourcePage: sourceUrls.after, author: "Helge Høifødt", credit: "Helge Høifødt / Wikimedia Commons", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", date: "2009-08-01", cameraLocation: "59.922871, 10.756079", verified: true, verifiedAt: "2026-08-25" },
      before: "Anders Beer Wilses fotografi fra 1903 er katalogisert av Oslo Museum som Olaf Ryes Plads og viser parken, benker, mennesker, portrettbysten og omkringliggende bygninger.",
      now: "Helge Høifødts fotografi fra 2009 viser sommerlig opphold, vegetasjon og parkrom på Olaf Ryes plass. Datoen 2009 oppgis eksplisitt; bildet dokumenterer ikke den nøyaktige 2026-tilstanden.",
      change: "Bildene gir en kildebelagt sammenligning av to tidslag med park, vegetasjon, opphold og bysten som felles motiver. Kamerastandpunktene er ikke dokumentert som identiske, så paret brukes ikke til eksakt optisk måling eller som selvstendig bevis for årsaken til endringer.",
      lookFor: ["Finn Eilert Sundt-bysten og vurder hvordan den virker som stedsanker.", "Sammenlign trær, ganglinjer, benker og måter å oppholde seg på.", "Skill det bildene viser fra to tidspunkter, fra forklaringer som krever tekstkilder."],
      sources: [sourceUrls.before, sourceUrls.after, sourceUrls.byleksikon, sourceUrls.municipality]
    },
    externalLinks: [
      { type: "source", label: "Oslo kommune – Olaf Ryes plass", url: sourceUrls.municipality, lang: "nb", verifiedAt: "2026-08-25" },
      { type: "source", label: "Oslo byleksikon – Olaf Ryes plass", url: sourceUrls.byleksikon, lang: "nb", verifiedAt: "2026-08-25" },
      { type: "source", label: "Store norske leksikon – Olaf Rye", url: sourceUrls.rye, lang: "nb", verifiedAt: "2026-08-25" },
      { type: "source", label: "Store norske leksikon – Eilert Sundt", url: sourceUrls.sundt, lang: "nb", verifiedAt: "2026-08-25" },
      { type: "source", label: "Parkteatret – English", url: sourceUrls.parkteatret, lang: "en", verifiedAt: "2026-08-25" },
      { type: "source", label: "Visit Løkka – Løkkadagene", url: sourceUrls.lokkadagene, lang: "nb", verifiedAt: "2026-08-25" },
      { type: "image_source", label: "Oslo Museum / Oslobilder – Olaf Ryes Plads 1903", url: sourceUrls.before, verifiedAt: "2026-08-25" },
      { type: "image_source", label: "Wikimedia Commons – Olaf Ryes plass 2009", url: sourceUrls.after, verifiedAt: "2026-08-25" },
      { type: "license", label: "Creative Commons BY-SA 3.0", url: "https://creativecommons.org/licenses/by-sa/3.0/", verifiedAt: "2026-08-25" }
    ],
    interpretation: {
      what_to_notice: ["Eilert Sundt-bysten og fontenen er faste stedsankre i parkrommet.", "Ganglinjer, plen, trær og benker organiserer både ferdsel og opphold.", "Fasadene rundt plassen rammer inn rommet, men tilhører ikke automatisk den canonicale plassflaten."],
      why_it_matters: ["Plassen viser hvordan et tett bystrøk fikk et offentlig grøntrom i siste del av 1800-tallet.", "Navnet, bysten og fontenen legger militær minnekultur, samfunnsforskning og parkhistorie oppå hverdagsbruken.", "Daterte arrangementer viser at parkrommet fortsatt fungerer som nabolagets offentlige scene."],
      counterpoints: ["Parkteatret er en viktig nabo, men plassen eier ikke hele kino- og konsertstedets historie.", "Fotografier fra 1903 og 2009 viser tidslag, men ikke alle årsaker eller den nøyaktige nåsituasjonen.", "Et arrangement i 2026 dokumenterer bruk på en dato, ikke en permanent og universell bruksmåte."],
      sources: [sourceUrls.municipality, sourceUrls.byleksikon, sourceUrls.before, sourceUrls.after].map(url => ({ url, verifiedAt: "2026-08-25" }))
    }
  });
  if (place.lat !== originalCoordinates.lat || place.lon !== originalCoordinates.lon || place.r !== originalCoordinates.r) throw new Error("Coordinate invariant failed");
  write(placeFile, place);

  const claim = (id, text, url, location, sourceType, claimKind, temporalStatus, extra = {}) => ({
    id, claim: text, sourceUrl: url, sourceLocation: location, sourceType,
    verifiedAt: "2026-08-25", status: "verified", claimKind,
    evidenceMode: extra.independentSourceUrls ? "corroborated" : "direct", temporalStatus, ...extra
  });
  const productionClaims = [
    claim("claim_olaf_identity", "Olaf Ryes plass er den avgrensede offentlige park-/plassflaten mellom Markveien, Grüners gate, Thorvald Meyers gate og Sofienberggata.", sourceUrls.municipality, "Ingress og avsnitt om avgrensende gater.", "official", "identity", "current", { independentSourceUrls: [sourceUrls.byleksikon] }),
    claim("claim_olaf_purchase_name_park", "Kommunen kjøpte den åpne løkken i 1863, plassen fikk navn etter Olaf Rye i 1864, og området ble opparbeidet som park i 1890.", sourceUrls.byleksikon, "Ingress og avsnitt om løkke, kjøp, navn og park.", "institutional", "identity", "historical"),
    claim("claim_olaf_rye_1849", "Olaf Rye døde 6. juli 1849 ved Fredericia.", sourceUrls.rye, "Ingress og avsnitt om Fredericia.", "reputable_secondary", "ordinary", "historical"),
    claim("claim_olaf_sundt_bust", "Mathias Skeibroks bronsebyste av Eilert Sundt ble reist på Olaf Ryes plass i 1892.", sourceUrls.byleksikon, "Avsnittet om monumentet i sørenden.", "institutional", "ordinary", "current"),
    claim("claim_olaf_sundt_funding", "Oslo Arbeidersamfund og Selskabet for Folkeoplysningens Fremme finansierte Eilert Sundt-bysten.", sourceUrls.byleksikon, "Avsnittet om finansieringen.", "institutional", "ordinary", "historical"),
    claim("claim_olaf_sundt_work", "Eilert Sundt var samfunnsforsker og undersøkte levekår og samfunnsforhold.", sourceUrls.sundt, "Ingress og avsnitt om samfunnsforskningen.", "reputable_secondary", "ordinary", "historical"),
    claim("claim_olaf_fountain", "Fontenen ble anlagt midt på Olaf Ryes plass i 1927 og beskrives fortsatt av kommunen som et anlegg på plassen.", sourceUrls.byleksikon, "Avsnittet om fontenen fra 1927.", "institutional", "ordinary", "current", { independentSourceUrls: [sourceUrls.municipality] }),
    claim("claim_olaf_parkteatret_neighbour", "Parkteatret ved Olaf Ryes plass 11 daterer kinohistorien til 1907 og beskriver dagens virksomhet som konsertsted; adressen ligger ved, ikke i, parkflaten.", sourceUrls.parkteatret, "English-side: history, current use and address.", "primary", "ordinary", "current", { independentSourceUrls: [sourceUrls.byleksikon] }),
    claim("claim_olaf_photo_1903", "Oslo Museum katalogiserer Anders Beer Wilses fotografi OB.Y1272 som Olaf Ryes Plads i 1903, med park, benker, mennesker og portrettbyste.", sourceUrls.before, "Objekttittel, datering, fotograf og motivord.", "catalogue", "ordinary", "historical"),
    claim("claim_olaf_photo_2009", "Helge Høifødts Commons-fotografi viser Olaf Ryes plass 1. august 2009 og er lisensiert CC BY-SA 3.0.", sourceUrls.after, "Filside: tittel, dato, skaper, koordinater og lisens.", "catalogue", "ordinary", "historical"),
    claim("claim_olaf_photo_limits", "1903- og 2009-bildene har felles parkmotiver, men kildene dokumenterer ikke identisk kamerastandpunkt eller alle endringsårsaker.", sourceUrls.before, "Museumskatalogen sammenholdt med Commons-filens dokumentasjon.", "catalogue", "ordinary", "historical", { independentSourceUrls: [sourceUrls.after] }),
    claim("claim_olaf_events_2026", "Visit Løkka annonserer Løkkadagene og marked 12.–13. september 2026 samt julemarked og stjernetenning 28. november 2026 på Olaf Ryes plass.", sourceUrls.lokkadagene, "Arrangementssidene med sted og datoer.", "primary", "temporal", "planned", { independentSourceUrls: [sourceUrls.lokkaprogram, sourceUrls.visitlokka] })
  ];
  const popupCoverage = [
    ["claim_olaf_identity"], ["claim_olaf_purchase_name_park"], ["claim_olaf_rye_1849"],
    ["claim_olaf_purchase_name_park"], ["claim_olaf_sundt_bust"], ["claim_olaf_sundt_funding"],
    ["claim_olaf_sundt_bust", "claim_olaf_sundt_work"], ["claim_olaf_fountain"],
    ["claim_olaf_sundt_bust", "claim_olaf_fountain"], ["claim_olaf_fountain"],
    ["claim_olaf_identity", "claim_olaf_parkteatret_neighbour"], ["claim_olaf_parkteatret_neighbour"],
    ["claim_olaf_identity", "claim_olaf_parkteatret_neighbour"], ["claim_olaf_photo_1903", "claim_olaf_photo_2009"],
    ["claim_olaf_photo_limits"], ["claim_olaf_photo_limits"], ["claim_olaf_events_2026"],
    ["claim_olaf_events_2026"], ["claim_olaf_events_2026"]
  ].map((claimIds, index) => ({ sentence: index + 1, claimIds }));
  write("data/places/production/olaf_ryes_plass.json", {
    schemaVersion: "4.2", validatorVersion: "4.2.1", placeId: "olaf_ryes_plass", placeFile, status: "ready_v4_2",
    identity: { status: "resolved", represents: "Olaf Ryes plass som den avgrensede offentlige park-/plassflaten mellom fire navngitte gater.", period: "1863–", excludes: ["Parkteatret og øvrige omkringliggende gårder og virksomheter", "holdeplassen", "de fire avgrensende gatene som egne gateløp", "hele Grünerløkka"] },
    metadataSnapshot: { name: place.name, year: place.year, category: place.category },
    textHashes: { algorithm: "sha256", desc: crypto.createHash("sha256").update(place.desc).digest("hex"), popupDesc: crypto.createHash("sha256").update(place.popupDesc).digest("hex") },
    claims: productionClaims,
    sentenceCoverage: { desc: [{ sentence: 1, claimIds: ["claim_olaf_purchase_name_park"] }, { sentence: 2, claimIds: ["claim_olaf_sundt_bust", "claim_olaf_fountain", "claim_olaf_events_2026"] }], popupDesc: popupCoverage },
    quizReadiness: { status: "source_ready_for_rich_5x7", quizTargetId: "olaf_ryes_plass", questions: [
      ["Hvilke gater avgrenser Olaf Ryes plass?", "Markveien, Grüners gate, Thorvald Meyers gate og Sofienberggata", "hvor", "claim_olaf_identity"],
      ["Når kjøpte kommunen løkken?", "1863", "når", "claim_olaf_purchase_name_park"],
      ["Hvem ga navn til plassen i 1864?", "Offiseren Olaf Rye", "hvem", "claim_olaf_purchase_name_park"],
      ["Hva skjedde med området i 1890?", "Det ble opparbeidet som park", "hva_skjedde", "claim_olaf_purchase_name_park"],
      ["Hvilket verk ble reist i 1892?", "Mathias Skeibroks bronsebyste av Eilert Sundt", "hvilket_verk_eller_objekt", "claim_olaf_sundt_bust"],
      ["Hvem finansierte Sundt-bysten?", "Oslo Arbeidersamfund og Selskabet for Folkeoplysningens Fremme", "hvem", "claim_olaf_sundt_funding"],
      ["Hva ble anlagt midt på plassen i 1927?", "Fontenen", "hva_ble_bygget_produsert_eller_endret", "claim_olaf_fountain"],
      ["Hva kan 1903- og 2009-bildene ikke dokumentere alene?", "Identisk kamerastandpunkt og alle endringsårsaker", "hva", "claim_olaf_photo_limits"]
    ].map(([question, answer, type, claimId]) => ({ question, answer, type, normalKnowledgeQuestion: true, claimIds: [claimId] })) },
    reviews: { factual: { status: "passed", reviewedAt: "2026-08-25", reviewer: "Olaf Ryes plass phase 0–7 source review", notes: "Alle synlige setninger er claim-dekket; 1848-konflikten er rettet med SNL 1849." }, editorial: { status: "passed", reviewedAt: "2026-08-25", reviewer: "Olaf Ryes plass phase 0–7 editorial review", introducedNewFacts: false, notes: "Teksten holder én stedseier og uttrykker bilde- og arrangementbegrensninger." } },
    completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: "2026-08-25", claimsVerified: { verified: productionClaims.length, total: productionClaims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" },
    reviewsNotes: "Phase 0–7 source/scope packet; collections, full quiz/Knowledge and onsite readiness follow in the next risk-boundary PR."
  });

  const leksikon = {
    place_id: "olaf_ryes_plass", title: "Olaf Ryes plass", type: "main", version: 1, suppress_untitled_legacy_articles: true,
    visual: { designCode: "article_place_essay_miniature" },
    popupDesc: "Et avgrenset park- og plassrom fra 1800-tallet der Olaf Rye-navnet, Eilert Sundt-bysten, fontenen og dagens møteplassbruk kan leses sammen.",
    wikiText: ["Kommunen kjøpte den åpne løkken i 1863, plassen fikk navn etter Olaf Rye i 1864, og parken ble opparbeidet i 1890. Mathias Skeibroks Eilert Sundt-byste kom i 1892 og fontenen i 1927.", "Parkteatret ved nummer 11 er en viktig nabo, men denne artikkelen gjelder den offentlige plassflaten mellom de fire avgrensende gatene."],
    summary: { one_liner: "Navngitt park, minnelandskap og levende nabolagsrom siden 1800-tallet.", themes: ["parkhistorie", "minnekultur", "offentlig rom", "Grünerløkka"], tone: ["nøktern", "stedsspesifikk"] },
    facts: [
      { id: "fact_olaf_ryes_plass_01", label: "Navngitt i 1864", desc: "Plassen fikk navn etter Olaf Rye i 1864.", confidence: "high", sources: ["Oslo byleksikon – Olaf Ryes plass"] },
      { id: "fact_olaf_ryes_plass_02", label: "Park fra 1890", desc: "Området ble opparbeidet som park i 1890.", confidence: "high", sources: ["Oslo byleksikon – Olaf Ryes plass"] },
      { id: "fact_olaf_ryes_plass_03", label: "Eilert Sundt-byste fra 1892", desc: "Mathias Skeibroks bronsebyste ble reist i sørenden i 1892.", confidence: "high", sources: ["Oslo byleksikon – Olaf Ryes plass"] }
    ],
    chronology: [[1863,"Kommunen kjøper løkken","Den åpne løkken ble kommunal grunn."],[1864,"Plassen får navn","Navnet hedrer offiseren Olaf Rye."],[1890,"Parken opparbeides","Den åpne tomten ble utformet som offentlig park."],[1892,"Eilert Sundt-bysten reises","Mathias Skeibroks bronsebyste fikk plass i sørenden."],[1907,"Kinohistorien starter ved plassen","Parkteatrets egen historikk daterer kinoen ved nummer 11 til 1907."],[1927,"Fontenen anlegges","Fontenen ble etablert midt på plassen."],[2026,"Daterte nabolagsarrangementer","Visit Løkka annonserte marked og andre arrangementer på plassen."]].map(([year,title,desc], index) => ({ id: `chrono_olaf_ryes_plass_${year}_${index+1}`, year, title, desc, confidence: "high", sources: [{ title: year === 2026 ? "Visit Løkka" : year === 1907 ? "Parkteatret" : "Oslo byleksikon", url: year === 2026 ? sourceUrls.visitlokka : year === 1907 ? sourceUrls.parkteatret : sourceUrls.byleksikon }] })),
    sources: place.externalLinks.filter(link => link.type === "source"), externalLinks: place.externalLinks, interpretation: place.interpretation
  };
  const leksikonMain = "data/leksikon/places/oslo/by/leksikon_olaf_ryes_plass.json";
  const leksikonNews = "data/leksikon/places/oslo/by/leksikon_olaf_ryes_plass_news.json";
  write(leksikonMain, leksikon);
  write(leksikonNews, [
    { id: "olaf_ryes_plass_news_lokkadagene_2026", place_id: "olaf_ryes_plass", title: "Løkkadagene og marked er annonsert 12.–13. september", type: "news_note", version: 1, date: "2026-09-12", date_type: "scheduled_event", status: "scheduled", valid_through: "2026-09-13", location: "Olaf Ryes plass", popupDesc: "Visit Løkka annonserer Løkkadagene 12.–13. september 2026 med Løkkamarkedet på Olaf Ryes plass og programpunkt ved Eilert Sundt-bysten.", summary: { one_liner: "Løkkadagene er annonsert på Olaf Ryes plass 12.–13. september 2026.", themes: ["marked", "nabolag", "arrangement"] }, tags: ["news_note", "Olaf Ryes plass"], sources: [{ label: "Visit Løkka – Løkkadagene", url: sourceUrls.lokkadagene }, { label: "Visit Løkka – program", url: sourceUrls.lokkaprogram }], verifiedAt: "2026-08-25" },
    { id: "olaf_ryes_plass_news_julestjerne_2026", place_id: "olaf_ryes_plass", title: "Julemarked og stjernetenning er annonsert 28. november", type: "news_note", version: 1, date: "2026-11-28", date_type: "scheduled_event", status: "scheduled", valid_through: "2026-11-28", location: "Olaf Ryes plass", popupDesc: "Visit Løkka annonserer julemarked og tenning av julestjernen på Olaf Ryes plass 28. november 2026.", summary: { one_liner: "Julemarked og stjernetenning er annonsert på plassen 28. november 2026.", themes: ["julemarked", "nabolag", "arrangement"] }, tags: ["news_note", "Olaf Ryes plass"], sources: [{ label: "Visit Løkka", url: sourceUrls.visitlokka }], verifiedAt: "2026-08-25" }
  ]);
  const leksikonManifest = read("data/leksikon/manifest.json");
  for (const file of [leksikonMain, leksikonNews]) addUnique(leksikonManifest.files, file);
  write("data/leksikon/manifest.json", leksikonManifest);

  const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/olaf_ryes_plass.json";
  write(languageFile, { place_id: "olaf_ryes_plass", title: "Språkleksikon: Olaf Ryes plass", verified_at: "2026-08-25", dialect_status: "not_applicable_place_level", entries: [
    { id: "olaf_ryes_plass_navn", term: "Olaf Ryes plass", type: "stedsnavn", meaning: "Navnet viser til offiseren Olaf Rye og ble tatt i bruk i 1864.", context: "Genitivformen Ryes knytter personnavnet til den avgrensede plassen.", linked_to: { kind: "place", id: "olaf_ryes_plass" }, tags: ["stedsnavn", "Olaf Rye", "1864"], sources: [{ label: "Oslo byleksikon – Olaf Ryes plass", url: sourceUrls.byleksikon }] },
    { id: "olaf_ryes_plass_plads", term: "Olaf Ryes Plads", type: "historisk_skrivemåte", meaning: "Eldre dansk-norsk skrivemåte av plassnavnet.", context: "Oslo Museums katalogtittel for Anders Beer Wilses fotografi fra 1903 bruker formen «Olaf Ryes Plads».", linked_to: { kind: "place", id: "olaf_ryes_plass" }, tags: ["ortografi", "fotokatalog", "1903"], sources: [{ label: "Oslo Museum / Oslobilder – OB.Y1272", url: sourceUrls.before }] },
    { id: "olaf_ryes_plass_lokke", term: "løkke", type: "historisk_bybegrep", meaning: "Et åpent jord- eller engareal utenfor den eldre tettbyen, ofte knyttet til en eiendom.", context: "Oslo byleksikon beskriver arealet kommunen kjøpte i 1863 som en åpen løkke; ordet forklarer stedets form før parkopparbeidelsen.", linked_to: { kind: "place", id: "olaf_ryes_plass" }, tags: ["byhistorie", "arealbruk", "1863"], sources: [{ label: "Oslo byleksikon – Olaf Ryes plass", url: sourceUrls.byleksikon }] }
  ] });
  const languageManifest = read("data/leksikon/sprak/manifest.json");
  languageManifest.place_files.olaf_ryes_plass = languageFile;
  write("data/leksikon/sprak/manifest.json", languageManifest);

  const storiesFile = "data/stories/stories_olaf_ryes_plass.json";
  write(storiesFile, [
    { id: "st_olaf_ryes_plass_park_1890", quality_profile: "episode_v1", type: "turning_point", title: "Da løkken ble offentlig park", year: 1890, place_id: "olaf_ryes_plass", person_id: "olaf_rye", summary: "Kommunens kjøp i 1863, navngivingen i 1864 og parkopparbeidelsen i 1890 gjorde en åpen løkke til et varig offentlig rom i den tette bydelen.", story: "I 1863 kjøpte kommunen den åpne løkken som lå der Olaf Ryes plass ligger. Kjøpet skjedde mens gatenettet på Grünerløkka ble opparbeidet.\n\nÅret etter fikk området navn etter Olaf Rye. Navnet la et militært minnelag over et areal som ennå ikke var den ferdige parken dagens besøkende møter.\n\nI 1890 ble området opparbeidet som park. Ganglinjer, vegetasjon og oppholdsareal gjorde løkken til et offentlig frirom mellom de nye kvartalene. På stedet kan overgangen leses i selve parkformen, men omkringliggende bygårder og gater forblir egne steder.", episode: { actors: ["Kristiania kommune"], date: "1890", action: "Den kommunalt kjøpte og navngitte løkken ble opparbeidet som park.", consequence: "Grünerløkka fikk et offentlig grønt- og møterom som fortsatt består." }, sources: [{ title: "Oslo byleksikon – Olaf Ryes plass", url: sourceUrls.byleksikon }, { title: "Oslo kommune – Olaf Ryes plass", url: sourceUrls.municipality }], tags: ["park", "løkke", "byutvikling", "1890"], related_people: ["olaf_rye"], related_places: [], score: { narrative: 3, historical: 2, source: 4, play_value: 3, originality: 3, total: 15 }, arc: { start: "En åpen løkke ble kommunal grunn.", middle: "Området fikk navn etter Olaf Rye.", end: "Løkken ble opparbeidet som offentlig park i 1890." }, next_scenes: [{ place_id: "birkelunden", reason: "Birkelunden er neste canonicale park i Pilot 02 og gir et sammenlignbart, men separat parkhistorisk forløp." }] },
    { id: "st_olaf_ryes_plass_sundt_1892", quality_profile: "episode_v1", type: "cultural", title: "Da samfunnsforskningen fikk et ansikt i parken", year: 1892, place_id: "olaf_ryes_plass", person_id: "eilert_sundt", summary: "Mathias Skeibroks bronsebyste av Eilert Sundt ble reist i 1892, finansiert av to folkeopplysnings- og arbeidersamfunnsaktører.", story: "To år etter at parken ble opparbeidet, kom et nytt fysisk lag i sørenden. Mathias Skeibroks bronsebyste viste Eilert Sundt, samfunnsforskeren som undersøkte levekår og samfunnsforhold.\n\nOslo byleksikon oppgir at Oslo Arbeidersamfund og Selskabet for Folkeoplysningens Fremme finansierte monumentet. Det var dermed ikke bare et personportrett, men et offentlig minnespor reist gjennom organisert folkeopplysning.\n\nBysten står fortsatt i plassrommet. Den gjør det mulig å starte med en fysisk observasjon og deretter spørre hvem som ble hedret, hvem som betalte, og hvilke former for kunnskap som ble gjort synlige i den nye arbeiderbyen.", episode: { actors: ["Mathias Skeibrok", "Oslo Arbeidersamfund", "Selskabet for Folkeoplysningens Fremme"], date: "1892", action: "Eilert Sundt-bysten ble reist i sørenden av Olaf Ryes plass.", consequence: "Samfunnsforskning og folkeopplysning fikk et varig fysisk minnespor i parken." }, sources: [{ title: "Oslo byleksikon – Olaf Ryes plass", url: sourceUrls.byleksikon }, { title: "Store norske leksikon – Eilert Sundt", url: sourceUrls.sundt }], tags: ["Eilert Sundt", "folkeopplysning", "monument", "1892"], related_people: ["eilert_sundt"], related_places: [], score: { narrative: 3, historical: 2, source: 4, play_value: 3, originality: 3, total: 15 }, arc: { start: "Den nye parken manglet et monumentalt midtpunkt.", middle: "Organisasjoner finansierte Mathias Skeibroks Sundt-byste.", end: "Bysten gjorde kunnskap og folkeopplysning fysisk synlig i parken." }, next_scenes: [] },
    { id: "st_olaf_ryes_plass_fontene_1927", quality_profile: "episode_v1", type: "turning_point", title: "Da fontenen ble et nytt parkanker", year: 1927, place_id: "olaf_ryes_plass", person_id: null, summary: "Fontenen som ble anlagt i 1927 la et nytt fast orienteringspunkt inn i det allerede etablerte parkrommet.", story: "Parken hadde stått i flere tiår da en fontene ble anlagt midt på Olaf Ryes plass i 1927. Den tilførte et nytt fysisk og sanselig midtpunkt mellom ganglinjer, trær og oppholdsareal.\n\nFontenen kom etter både navngivingen, parkopparbeidelsen og Eilert Sundt-bysten. Den viser derfor at et offentlig rom ikke blir ferdig i ett øyeblikk, men bygges opp lag for lag.\n\nOslo kommune omtaler fortsatt fontenen som et anlegg på plassen. Den kan brukes som orienteringspunkt for å sammenligne parkens struktur, samtidig som historiske fotografier må leses varsomt fordi kamerastandpunkt og tidspunkt varierer.", episode: { actors: ["Oslo kommune"], date: "1927", action: "En fontene ble anlagt midt på Olaf Ryes plass.", consequence: "Parken fikk et nytt varig orienterings- og oppholdspunkt." }, sources: [{ title: "Oslo byleksikon – Olaf Ryes plass", url: sourceUrls.byleksikon }, { title: "Oslo kommune – Olaf Ryes plass", url: sourceUrls.municipality }], tags: ["fontene", "parkstruktur", "1927"], related_people: [], related_places: [], score: { narrative: 3, historical: 2, source: 4, play_value: 3, originality: 3, total: 15 }, arc: { start: "Parken hadde navn, vegetasjon og et personmonument.", middle: "En fontene ble anlagt i det sentrale plassrommet.", end: "Fontenen ble et fast anker i senere bruk og sammenligning." }, next_scenes: [] }
  ]);
  const storyManifest = read("data/stories/stories_manifest.json");
  addUnique(storyManifest.files, { category: "by", entity_id: "olaf_ryes_plass", path: storiesFile }, item => item.entity_id);
  write("data/stories/stories_manifest.json", storyManifest);
  const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
  addUnique(episodeManifest.files, storiesFile);
  write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

  const sourceRegistryFile = "data/fag/by/source_registry_by_v1.json";
  const sourceRegistryPath = path.join(root, sourceRegistryFile);
  const previousSourceLine = /    \{"place_id":"olaf_ryes_plass"[^\n]+/;
  const sourceEntry = { place_id: "olaf_ryes_plass", source_status: "externally_reviewed", source_refs: Object.entries(sourceUrls).map(([id, url]) => ({ id: `olaf_${id}`, url })), verified_claims: ["canonical boundary", "municipal purchase 1863", "naming 1864", "park 1890", "Eilert Sundt bust 1892", "Parkteatret neighbour since 1907", "fountain 1927", "dated 2026 events"], allowed_generation: "reviewed_claims_and_logged_on_site_observation", editorial_note: "Olaf Rye's death is dated to 1849 from SNL; the inconsistent 1848 wording in Oslo byleksikon is not propagated." };
  const sourceRegistryText = fs.readFileSync(sourceRegistryPath, "utf8")
    .replace(/"updated_at": "[^"]+"/, '"updated_at": "2026-08-25"')
    .replace(previousSourceLine, `    ${JSON.stringify(sourceEntry)},`);
  fs.writeFileSync(sourceRegistryPath, sourceRegistryText);

  const readings = read("data/lesespor/lesespor_oslo_batch2.json");
  for (const item of [
    { id: "lesespor_olaf_ryes_plass_byleksikon", title: "Olaf Ryes plass", author: null, publication: "Oslo byleksikon", date: null, year: null, type: "reference_article", subjects: ["Olaf Ryes plass", "parkhistorie", "Eilert Sundt"], place_ids: ["olaf_ryes_plass"], person_ids: ["olaf_rye", "eilert_sundt"], category_hints: ["by", "historie"], url: sourceUrls.byleksikon, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Stedsspesifikk oversikt over avgrensning, navngiving, park, byste og fontene." },
    { id: "lesespor_olaf_ryes_plass_byokologi", title: "Byøkologi – hva er det, egentlig?", author: null, publication: "Oslo kommune / Byplan", date: null, year: null, type: "municipal_article", subjects: ["byøkologi", "offentlig rom", "Olaf Ryes plass"], place_ids: ["olaf_ryes_plass"], person_ids: [], category_hints: ["by", "natur"], url: sourceUrls.byokologi, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Kommunal refleksjon om byøkologi med Olaf Ryes plass som konkret samtale- og observasjonssted." },
    { id: "lesespor_olaf_ryes_plass_oslobilder_1903", title: "Olaf Ryes Plads", author: "Anders Beer Wilse", publication: "Oslo Museum / Oslobilder", date: "1903-01-01", year: 1903, type: "historical_photo", subjects: ["park", "byste", "offentlig rom"], place_ids: ["olaf_ryes_plass"], person_ids: ["eilert_sundt"], category_hints: ["by", "historie"], url: sourceUrls.before, access: "open", rights: "cc_3_0", source_quality: "institutional", curation_status: "strong_candidate", relevance: "Katalogisert 1903-fotografi av selve parkrommet med benker, mennesker og portrettbyste." }
  ]) addUnique(readings.items, item, row => row.id);
  write("data/lesespor/lesespor_oslo_batch2.json", readings);

  const normalize = value => String(value || "").normalize("NFC").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();
  const sourceHash = crypto.createHash("sha256").update(JSON.stringify({ name: normalize(place.name), desc: normalize(place.desc), popupDesc: normalize(place.popupDesc) })).digest("hex").slice(0, 16);
  const translations = {
    en: { desc: "The municipality bought the open field in 1863, the square was named after officer Olaf Rye in 1864, and the park was laid out in 1890. The Eilert Sundt bust from 1892, the fountain from 1927 and continued use as a local meeting place make several historical layers visible in the same park space.", popupDesc: "Olaf Ryes plass is the bounded park and square between Markveien, Grüners gate, Thorvald Meyers gate and Sofienberggata. The municipality bought the open field in 1863, named the square after Olaf Rye in 1864 and laid out the park in 1890. Mathias Skeibrok’s bust of social researcher Eilert Sundt was erected in 1892, and the fountain followed in 1927. Parkteatret at number 11 is important neighbouring context, not part of the canonical square surface. Photographs from 1903 and 2009 show historical layers rather than an exact optical before-and-after pair. Dated 2026 programmes document current event use without turning it into a permanent property of the place." },
    es: { desc: "El municipio compró el terreno abierto en 1863, la plaza recibió el nombre del oficial Olaf Rye en 1864 y el parque se trazó en 1890. El busto de Eilert Sundt de 1892, la fuente de 1927 y el uso continuado como lugar de encuentro hacen visibles varias capas históricas en el mismo espacio.", popupDesc: "Olaf Ryes plass es el parque y plaza delimitado entre Markveien, Grüners gate, Thorvald Meyers gate y Sofienberggata. El municipio compró el terreno abierto en 1863, nombró la plaza por Olaf Rye en 1864 y trazó el parque en 1890. El busto del investigador social Eilert Sundt, obra de Mathias Skeibrok, se erigió en 1892 y la fuente llegó en 1927. Parkteatret, en el número 11, es un contexto vecino importante, no parte de la superficie canónica de la plaza. Las fotografías de 1903 y 2009 muestran capas históricas, no un par óptico exacto. Los programas fechados de 2026 documentan usos actuales sin convertirlos en una propiedad permanente del lugar." },
    pt: { desc: "O município comprou o terreno aberto em 1863, a praça recebeu o nome do oficial Olaf Rye em 1864 e o parque foi implantado em 1890. O busto de Eilert Sundt de 1892, a fonte de 1927 e o uso contínuo como ponto de encontro tornam visíveis várias camadas históricas no mesmo espaço.", popupDesc: "Olaf Ryes plass é o parque e praça delimitado entre Markveien, Grüners gate, Thorvald Meyers gate e Sofienberggata. O município comprou o terreno aberto em 1863, deu à praça o nome de Olaf Rye em 1864 e implantou o parque em 1890. O busto do pesquisador social Eilert Sundt, de Mathias Skeibrok, foi erguido em 1892, e a fonte veio em 1927. O Parkteatret, no número 11, é um contexto vizinho importante, não parte da superfície canônica da praça. Fotografias de 1903 e 2009 mostram camadas históricas, e não um par óptico exato. Programas datados de 2026 documentam o uso atual sem transformá-lo em característica permanente do lugar." }
  };
  for (const [lang, translation] of Object.entries(translations)) {
    const file = `data/i18n/content/places/${lang}.json`;
    const pack = read(file);
    pack.olaf_ryes_plass = { _sourceHash: sourceHash, _status: "machine_translated", name: "Olaf Ryes plass", ...translation };
    write(file, pack);
  }
}

function buildQuiz(place, production) {
  const E1 = "em_by_parker_som_sosial_infrastruktur";
  const E2 = "em_by_opphold_vs_gjennomgang";
  const E3 = "em_by_historiske_lag_i_hverdagsrom";
  const sources = {
    municipality: { url: sourceUrls.municipality, source_type: "official_municipality", review_status: "reviewed", review_note: "Canonical avgrensning og fontene på plassen." },
    byleksikon: { url: sourceUrls.byleksikon, source_type: "institutional_reference", review_status: "reviewed", review_note: "Kjøp, navn, park, byste, finansiering og fontene." },
    rye: { url: sourceUrls.rye, source_type: "reputable_encyclopedia", review_status: "reviewed", review_note: "Olaf Ryes biografi og korrekt dødsår 1849." },
    sundt: { url: sourceUrls.sundt, source_type: "reputable_encyclopedia", review_status: "reviewed", review_note: "Eilert Sundts samfunnsforskning og levekårsarbeid." },
    parkteatret: { url: sourceUrls.parkteatret, source_type: "primary_venue", review_status: "reviewed", review_note: "Adresse, kinohistorie fra 1907 og dagens konsertbruk; nabokontekst." },
    before: { url: sourceUrls.before, source_type: "museum_catalogue", review_status: "reviewed", review_note: "1903-fotografi, fotograf og motiv." },
    after: { url: sourceUrls.after, source_type: "licensed_media_catalogue", review_status: "reviewed", review_note: "2009-fotografi, fotograf, dato og lisens." },
    events: { url: sourceUrls.lokkadagene, source_type: "primary_event_program", review_status: "reviewed", review_note: "Daterte 2026-arrangementer; ikke permanent stedsegenskap." },
    byokologi: { url: sourceUrls.byokologi, source_type: "official_municipal_article", review_status: "reviewed", review_note: "Byøkologi og offentlig rom med plassen som observasjonssted." }
  };
  const specs = [
    ["fact","Hvilke fire gater avgrenser Olaf Ryes plass?",["Markveien, Grüners gate, Thorvald Meyers gate og Sofienberggata","Toftes gate, Seilduksgata, Fossveien og Sannergata","Torggata, Storgata, Brugata og Hausmanns gate"],"Markveien, Grüners gate, Thorvald Meyers gate og Sofienberggata","Kommunen avgrenser plassen med disse fire gatene.","municipality",E1],
    ["fact","Når kjøpte kommunen den åpne løkken?",["1863","1890","1927"],"1863","Kommunen kjøpte løkken i 1863.","byleksikon",E3],
    ["fact","Når fikk plassen navn etter Olaf Rye?",["1864","1849","1907"],"1864","Plassen fikk navnet Olaf Ryes plass i 1864.","byleksikon",E3],
    ["fact","Hvem var navnet hentet fra?",["Offiseren Olaf Rye","Samfunnsforskeren Eilert Sundt","Billedhuggeren Mathias Skeibrok"],"Offiseren Olaf Rye","Navnet viser til offiseren Olaf Rye.","byleksikon",E3],
    ["fact","Hvilket dødsår for Olaf Rye brukes etter kildekontrollen?",["1849","1848","1864"],"1849","Store norske leksikon daterer Olaf Ryes død til 6. juli 1849.","rye",E3],
    ["fact","Hva skjedde med området i 1890?",["Det ble opparbeidet som park","Fontenen ble anlagt","Parkteatret åpnet som kino"],"Det ble opparbeidet som park","Området ble opparbeidet som park i 1890.","byleksikon",E3],
    ["fact","Hvilket monument ble reist i 1892?",["Eilert Sundt-bysten","Olaf Rye-statuen","Fontenen"],"Eilert Sundt-bysten","Bronsebysten av Eilert Sundt ble reist i 1892.","byleksikon",E3],
    ["fact","Hvem laget Eilert Sundt-bysten?",["Mathias Skeibrok","Olaf Rye","Helge Høifødt"],"Mathias Skeibrok","Mathias Skeibrok utførte bronsebysten.","byleksikon",E3],
    ["fact","Hvem finansierte Sundt-bysten?",["Oslo Arbeidersamfund og Selskabet for Folkeoplysningens Fremme","Parkteatret og Oslo kommune","Visit Løkka og Oslo Museum"],"Oslo Arbeidersamfund og Selskabet for Folkeoplysningens Fremme","To folkeopplysnings- og arbeidersamfunn finansierte monumentet.","byleksikon",E3],
    ["fact","Hva arbeidet Eilert Sundt med?",["Levekår og samfunnsforhold","Militær strategi ved Fredericia","Kinodrift og konsertprogram"],"Levekår og samfunnsforhold","Sundt undersøkte levekår og samfunnsforhold.","sundt",E1],
    ["context","Hvorfor passer Eilert Sundt inn i plassens historie?",["Bysten gjør samfunnsforskning og folkeopplysning fysisk synlig","Han tegnet parkens fire gater","Han åpnet kinoen i 1907"],"Bysten gjør samfunnsforskning og folkeopplysning fysisk synlig","Det fysiske monumentet binder personen til det offentlige parkrommet.","byleksikon",E1],
    ["fact","Hva ble anlagt midt på plassen i 1927?",["Fontenen","Kinoen","Nybrua"],"Fontenen","Fontenen ble anlagt midt på plassen i 1927.","byleksikon",E3],
    ["context","Hvorfor er fontenen et historisk lag?",["Den kom etter parkopparbeidelsen og ble et fast parkanker","Den viser at parken først åpnet i 1927","Den gjør alle nabobygg til parkobjekter"],"Den kom etter parkopparbeidelsen og ble et fast parkanker","Fontenen legger et mellomkrigslag til parken fra 1890.","municipality",E3],
    ["context","Hva betyr own-place-grensen ved parkens kanter?",["Parkflaten eier ikke automatisk fasader og virksomheter rundt","Alle adresser ved plassen er del av samme sted","Holdeplassen og hele Grünerløkka inngår i parken"],"Parkflaten eier ikke automatisk fasader og virksomheter rundt","Canonical avgrensning skiller parkflaten fra naboene.","municipality",E1],
    ["fact","Hvilken adresse oppgir Parkteatret?",["Olaf Ryes plass 11","Markveien 1","Sofienberggata 27"],"Olaf Ryes plass 11","Parkteatrets primærside oppgir Olaf Ryes plass 11.","parkteatret",E1],
    ["fact","Hvilket år daterer Parkteatret kinohistorien til?",["1907","1890","1927"],"1907","Parkteatret daterer kinohistorien i huset til 1907.","parkteatret",E3],
    ["context","Hvordan brukes Parkteatret i denne pakken?",["Som eget nabobygg og kontekst, ikke parkobjekt","Som fontenens opprinnelige eier","Som synonym for hele plassflaten"],"Som eget nabobygg og kontekst, ikke parkobjekt","Nabokontekst bevares uten at parken overtar institusjonshistorien.","parkteatret",E1],
    ["fact","Hvilket år er Oslo Museums fotografi fra?",["1903","1892","2009"],"1903","Oslo Museum katalogiserer fotografiet til 1903.","before",E3],
    ["fact","Hvem tok fotografiet fra 1903?",["Anders Beer Wilse","Helge Høifødt","Mathias Skeibrok"],"Anders Beer Wilse","Museumskatalogen oppgir Anders Beer Wilse som fotograf.","before",E3],
    ["context","Hvilke motiver kan sammenlignes i 1903 og 2009?",["Park, vegetasjon, opphold og bysten","Et identisk kinointeriør","Den samme julemarkedsboden"],"Park, vegetasjon, opphold og bysten","Bildene deler flere parkmotiver på tvers av tid.","before",E3],
    ["fact","Når ble det nyere sammenligningsbildet tatt?",["1. august 2009","12. september 2026","6. juli 1849"],"1. august 2009","Commons-filsiden daterer bildet til 1. august 2009.","after",E3],
    ["fact","Hvem tok sammenligningsbildet fra 2009?",["Helge Høifødt","Anders Beer Wilse","Eilert Sundt"],"Helge Høifødt","Commons-filsiden oppgir Helge Høifødt.","after",E3],
    ["context","Hva kan bildeparet ikke bevise alene?",["Identisk kamerastandpunkt og alle endringsårsaker","At begge bildene viser Oslo","At parken har vegetasjon"],"Identisk kamerastandpunkt og alle endringsårsaker","Kildekritikken holder optisk likhet og årsaksforklaring tilbake.","after",E3],
    ["fact","Når er Løkkadagene annonsert i 2026?",["12.–13. september","1.–2. januar","24.–25. desember"],"12.–13. september","Visit Løkka annonserer Løkkadagene disse datoene.","events",E1],
    ["context","Hva er den presise stedskoblingen for Løkkadagene?",["Løkkamarkedet er annonsert på Olaf Ryes plass","Hele arrangementet gjør alle nabobygg til parkobjekter","Programmet dokumenterer permanent bruk hver dag"],"Løkkamarkedet er annonsert på Olaf Ryes plass","Programmet dokumenterer en datert aktivitet på selve plassen.","events",E1],
    ["fact","Når er julemarked og stjernetenning annonsert?",["28. november 2026","28. november 1903","13. september 1927"],"28. november 2026","Visit Løkka annonserer julemarked og stjernetenning 28. november 2026.","events",E1],
    ["context","Hva viser et datert 2026-program?",["Bruk på bestemte datoer","En permanent bruksgaranti","At alle besøkende gjør det samme"],"Bruk på bestemte datoer","Et arrangement dokumenterer datert bruk, ikke en varig universaltilstand.","events",E2],
    ["context","Hvilke to objekter fungerer som faste parkankre?",["Eilert Sundt-bysten og fontenen","Parkteatret og Markveien","Løkkamarkedet og julemarkedet"],"Eilert Sundt-bysten og fontenen","De to fysiske objektene kan observeres på selve plassen.","byleksikon",E3],
    ["concept","Hva betyr det å lese en park som sosial infrastruktur?",["Å undersøke hvordan utforming støtter møter og opphold","Å telle bare trær","Å behandle alle naboer som samme sted"],"Å undersøke hvordan utforming støtter møter og opphold","Parkens kanter, ganglinjer, benker og ankre kan analyseres som støtte for sosialt liv.","byokologi",E1,"met_for_etter","byliv_aapne_rom","william_h_whyte","The Social Life of Small Urban Spaces"],
    ["concept","Hva ville en systematisk observasjon registrere?",["Hvor mennesker sitter, stopper og beveger seg","Kun plassens navneår","Bare byggehøyder rundt parken"],"Hvor mennesker sitter, stopper og beveger seg","Systematisk observasjon skiller opphold, ferdsel og mønstre i bruk.","municipality",E2,"met_for_etter","byliv_opphold_vs_gjennomgang","michel_de_certeau","The Practice of Everyday Life"],
    ["concept","Hva er første steg i en forsvarlig før/etter-analyse?",["Finn felles ankre og noter ulikt standpunkt","Anta identisk kamera","Forklar årsaken uten tekstkilder"],"Finn felles ankre og noter ulikt standpunkt","Metoden begynner med sammenlignbare elementer og uttrykte begrensninger.","before",E3,"met_for_etter","his_spor_gatebilde","walter_benjamin","The Arcades Project"],
    ["concept","Hvordan skiller man gjennomgang fra opphold?",["Observer bevegelseslinjer og steder der folk stanser","Bruk bare arrangementskalenderen","Spør bare hvem plassen er oppkalt etter"],"Observer bevegelseslinjer og steder der folk stanser","Romlig observasjon kan skille ferdsel fra lengre opphold uten å gjette motiv.","municipality",E2,"met_for_etter","byliv_opphold_vs_gjennomgang","michel_de_certeau","The Practice of Everyday Life"],
    ["concept","Hva er en own-place-analyse av Parkteatret?",["Skille naboens virksomhet fra parkens egne objekter","Flytte hele kinohistorien inn i parken","Fjerne all nabokontekst"],"Skille naboens virksomhet fra parkens egne objekter","Analysen beholder relevant kontekst uten falskt eierskap.","parkteatret",E1,"met_for_etter","byliv_aapne_rom","william_h_whyte","The Social Life of Small Urban Spaces"],
    ["concept","Hvorfor kombineres kommune-, oppslags- og museumskilder?",["De belyser grense, historikk og visuelle tidslag","Én kilde kan erstattes med filler","Flere lenker gjør alle påstander sanne"],"De belyser grense, historikk og visuelle tidslag","Kildetriangulering fordeler ulike dokumentasjonsjobber på egnede kildetyper.","byleksikon",E3,"met_for_etter","his_spor_gatebilde","walter_benjamin","The Arcades Project"],
    ["concept","Hva er den mest kildekritiske helhetslesningen?",["Parken har dokumenterte historiske lag, mens bruk og endringsårsak må belegges særskilt","Alle bilder og arrangementer viser samme tilstand","Nabobyggene er automatisk parkobjekter"],"Parken har dokumenterte historiske lag, mens bruk og endringsårsak må belegges særskilt","Stedet tåler en flerlagsanalyse når identitet, tid, observasjon og kildegrenser holdes tydelige.","after",E3,"met_for_etter","his_spor_gatebilde","kevin_lynch","The Image of the City"]
  ];
  const phases = ["opening", "middle", "middle", "bridge", "final"];
  const claims = specs.map((row, index) => ({
    claim_id: `claim_olaf_ryes_plass_quiz_${index + 1}`, order: index + 1,
    planned_phase: phases[Math.floor(index / 7)], family: row[0] === "concept" ? "concept_theory" : row[0],
    statement: row[4], source_ids: [row[5]], source_origin: "external", emne_id: row[6],
    ...(row[7] ? { method_id: row[7], topic_hook_id: row[8], thinker_id: row[9], work: row[10] } : {})
  }));
  const existing_quiz_audit = { searched_paths: ["data/quiz/manifest.json", "data/quiz/by/", placeFile], active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen manifest-loadet quizpakke med targetId=olaf_ryes_plass." }, decisions: ["Opprett rich 5x7 fra reviewede eksterne kilder.", "Hold teori og metode ute av de første 28 spørsmålene.", "Ikke bruk Parkteatret som proxy for parkflaten."], knowledge_migration: "Nytt target har ingen canonical Knowledge-eier; registre genereres deterministisk fra pakken." };
  const profile_decision = { profile: "rich", set_count: 5, questions_per_set: 7, justification: "Fem selvstendige læringsjobber: identitet/navn, park og personer, fysiske tidslag/bilder, nabo og datert bruk, samt avsluttende stedsobservasjon og kildekritikk." };
  const held_back_candidates = ["Parkteatret som synlig Brand uten verifisert logo/wordmark.", "Eksakt optisk før/etter-påstand for 1903/2009.", "Generalisering fra daterte arrangementer til permanent bruk.", "Den feilaktige 1848-formuleringen om Olaf Ryes død."];
  const selected_curriculum = { module_ids: ["kur_by_04_historiske_lag_og_transformasjon", "kur_by_07_gronn_blaa_og_offentlig_natur"], emne_ids: [E1,E2,E3], topic_hook_ids: ["byliv_aapne_rom","byliv_opphold_vs_gjennomgang","his_spor_gatebilde"], method_ids: ["met_for_etter"], thinker_ids: ["william_h_whyte","michel_de_certeau","walter_benjamin","kevin_lynch"], works: ["The Social Life of Small Urban Spaces","The Practice of Everyday Life","The Arcades Project","The Image of the City"] };
  const briefFile = "data/quiz/production_briefs/by/olaf_ryes_plass.json";
  const brief = { schema_version: "1.0", status: "reviewed", categoryId: "by", targetId: "olaf_ryes_plass", profile_hint: "rich", reviewed_at: "2026-08-25", review_note: "Kildene skiller parkflaten fra nabobygg, løser 1848/1849-konflikten og bærer fem kildekritiske læringsjobber.", scope: { place: "Olaf Ryes plass", production_profile: "rich", set_count: 5, questions_per_set: 7, total_questions: 35, normal_opening_questions: 14 }, sources, selected_curriculum, existing_quiz_audit, profile_decision, held_back_candidates, claims };
  write(briefFile, brief);
  const production_context = { manifest_category: "by", profile: "rich_5x7", standard_version: "3.3", source_brief: briefFile, context_artifact: "data/quiz/production_context/by/olaf_ryes_plass.json", resolved_files: { pensum: "data/fag/by/pensum_by.json", emner: "data/fag/by/emner_by.json", fagkart: "data/fag/by/fagkart_by.json", methods: "data/fag/by/methods_by.json", supersetQuizMal: "data/fag/by/supersetQUIZMAL_by.json", quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json" }, required_inputs_loaded: ["pensum","emner","fagkart","methods","supersetQuizMal","quizStandard","quizQuestionSchema"], pensum_module_ids: selected_curriculum.module_ids, emne_ids: selected_curriculum.emne_ids, topic_hook_ids: selected_curriculum.topic_hook_ids, method_ids: selected_curriculum.method_ids, thinker_ids: selected_curriculum.thinker_ids, works: selected_curriculum.works, source_review_status: "reviewed", existing_quiz_audit, profile_decision, held_back_candidates, theory_start_phase: "final", method_start_phase: "final" };
  const questions = specs.map((row, index) => {
    const [family, question, options, answer, knowledge, sourceId, emne, method_id, topic_hook_id, thinker_id, work] = row;
    const setNo = Math.floor(index / 7) + 1;
    const value = { id: `olaf_ryes_plass_quiz_${index + 1}`, quiz_id: `by_olaf_ryes_plass_set_${setNo}_q${index % 7 + 1}`, categoryId: "by", placeId: "olaf_ryes_plass", targetId: "olaf_ryes_plass", question_scope: "place", question, options, answer, answerIndex: options.indexOf(answer), knowledge, difficulty: Math.min(4, setNo), question_type: family, emne_id: emne, source: [sourceId], source_origin: "external", claim_basis: claims[index].statement, claim_id: claims[index].claim_id, primary_knowledge_unit_id: `ku_by_olaf_ryes_plass_${String(index + 1).padStart(2, "0")}`, knowledge_unit_ids: [`ku_by_olaf_ryes_plass_${String(index + 1).padStart(2, "0")}`], concepts: [emne === E1 ? "offentlig park" : emne === E2 ? "opphold og gjennomgang" : "historiske lag"], concept_ids: [], term_ids: [], knowledge_contract_version: 1, knowledge_link_status: "linked" };
    if (method_id) Object.assign(value, { method_id, topic_hook_id, thinker_id, work, theory_ref: { topic_hook_id, thinker_id, work, why_it_helps: "Teoriperspektivet strukturerer observasjon, romlig lesning og bildesammenligning uten å erstatte stedskildene." }, guidance_basis: ["data/fag/by/fagkart_by.json","data/fag/by/methods_by.json"] });
    return value;
  });
  const titles = ["Løkken, navnet og grensen","Park, mennesker og monument","Fontene og fotografiske tidslag","Naboer og datert bruk","Observasjon, metode og kildekritikk"];
  const quizFile = "data/quiz/by/olaf_ryes_plass_sets.json";
  write(quizFile, { targetId: "olaf_ryes_plass", categoryId: "by", sources: Object.fromEntries(Object.entries(sources).map(([id, source]) => [id, source.url])), production_context, sets: titles.map((title, index) => ({ set_id: `by_olaf_ryes_plass_set_${index + 1}`, title, level: index + 1, order: index + 1, phase: phases[index], xp: 50 + index * 10, questions: questions.slice(index * 7, index * 7 + 7) })) });
  const quizManifest = read("data/quiz/manifest.json");
  addUnique(quizManifest.sets, { targetId: "olaf_ryes_plass", file: quizFile }, item => item.targetId);
  write("data/quiz/manifest.json", quizManifest);
  const fagManifest = read("data/fag/fag_manifest.json");
  fagManifest.by.quizProduction.targets.olaf_ryes_plass = { source_brief: "../quiz/production_briefs/by/olaf_ryes_plass.json", context_artifact: "../quiz/production_context/by/olaf_ryes_plass.json", quiz_file: "../quiz/by/olaf_ryes_plass_sets.json" };
  write("data/fag/fag_manifest.json", fagManifest);
  production.quizReadiness = { status: "canonical_rich_5x7", quizTargetId: "olaf_ryes_plass", sourceBrief: briefFile, productionContext: "data/quiz/production_context/by/olaf_ryes_plass.json", normalOpeningQuestions: 14, totalQuestions: 35, questions: production.quizReadiness.questions };
  write("data/places/production/olaf_ryes_plass.json", production);
}

function buildIntegration() {
  const place = read(placeFile);
  const ownerSentence = "De fire gatene fungerer som kontrollpunkter for hva stedet eier: parkens ganglinjer, vegetasjon, byste og fontene hører til plassfortellingen, mens fasader og virksomheter rundt behandles som egne steder eller nabokontekst.";
  if (!place.popupDesc.includes(ownerSentence)) place.popupDesc = `${place.popupDesc} ${ownerSentence}`;
  place.place_card_profile = { schema: "history_go_place_card_profile_v2", collection_ids: ["people","objects","brands","related"], reason: "Olaf Ryes plass er et vanlig bysted. People og Objects har direkte stedsevidens, Related viser separate canonicale nabosteder, og Brands bruker ærlig tomtilstand etter avvist Parkteatret-logo.", verifiedAt: "2026-08-25" };
  place.related_people_ids = ["olaf_rye","eilert_sundt"];
  place.related_place_ids = ["birkelunden","sofienbergparken","markveien","daelenenga_idrettspark"];
  place.objects = [
    { id: "olaf_ryes_plass_eilert_sundt_bust", title: "Eilert Sundt-bysten", type: "bronsebyste", kind: "physical_object", desc: "Mathias Skeibroks bronsebyste av samfunnsforskeren Eilert Sundt ble reist i sørenden av plassen i 1892.", why_here: "Bysten gjør forbindelsen mellom folkeopplysning, samfunnsforskning og det offentlige parkrommet fysisk lesbar.", placeSpecificReason: "Oslo byleksikon plasserer og daterer bysten eksplisitt på Olaf Ryes plass.", historicalFunction: "Offentlig minnespor finansiert av Oslo Arbeidersamfund og Selskabet for Folkeoplysningens Fremme.", physicalObject: true, placeSpecific: true, collectable: true, storePrice: 30, currency: "PC", collection: "olaf_ryes_plass_minnespor", unlock: "Finn bysten i sørenden og les navnet før du åpner Eilert Sundt-kortet.", source_urls: [sourceUrls.byleksikon,sourceUrls.sundt] },
    { id: "olaf_ryes_plass_fontene", title: "Fontenen", type: "fontene", kind: "physical_object", desc: "Fontenen ble anlagt midt på Olaf Ryes plass i 1927 og er fortsatt et fast orienteringspunkt i parkrommet.", why_here: "Fontenen viser at parken fikk nye fysiske lag også etter opparbeidelsen i 1890.", placeSpecificReason: "Oslo byleksikon daterer fontenen, og Oslo kommune lister den som anlegg på selve plassen.", historicalFunction: "Sentralt park- og oppholdselement fra mellomkrigstiden.", physicalObject: true, placeSpecific: true, collectable: true, storePrice: 25, currency: "PC", collection: "olaf_ryes_plass_parkstruktur", unlock: "Finn fontenen og bruk den som anker når du sammenligner ganglinjer og oppholdssoner.", source_urls: [sourceUrls.byleksikon,sourceUrls.municipality] }
  ];
  place.tasks_profile = { title: "Les parkrommets lag på stedet", summary: "Tre korte oppgaver bruker offentlige ganglinjer og synlige stedsankre uten å kreve inngang til nabovirksomheter.", safety: "Hold ganglinjer og innganger frie. Utfør oppgavene fra offentlig parkflate og avbryt ved tett arrangementstrafikk eller glatt underlag.", tasks: [
    { id: "olaf_ryes_plass_oppgave_grense", title: "Finn fire kanter", instruction: "Stå inne i parken og orienter deg mot Markveien, Grüners gate, Thorvald Meyers gate og Sofienberggata.", why: "Oppgaven skiller plassflaten fra gatene, gårdene og virksomhetene rundt." },
    { id: "olaf_ryes_plass_oppgave_byste", title: "Les hvem som minnes", instruction: "Finn Eilert Sundt-bysten, les navnet og se hvordan monumentet er plassert i forhold til ganglinjene.", why: "Bysten gjør samfunnsforskning og folkeopplysning til et fysisk stedsminne." },
    { id: "olaf_ryes_plass_oppgave_tidslag", title: "Sammenlign to parkankre", instruction: "Bruk bysten og fontenen som faste punkter og sammenlign dem med 1903- og 2009-bildene uten å anta identisk kamerastandpunkt.", why: "Oppgaven trener skillet mellom det bildene viser og forklaringer som krever tekstkilder." }
  ] };
  write(placeFile, place);

  const brands = read("data/brands/brands_by_place.json"); delete brands.olaf_ryes_plass; write("data/brands/brands_by_place.json",brands);
  const actors = read("data/brands/actors_by_place.json");
  if (Object.hasOwn(actors,"olaf_ryes_plass")) { delete actors.olaf_ryes_plass; write("data/brands/actors_by_place.json",actors); }
  const historyFile = "data/people/historie/oslo/people_historie_oslo.json";
  const history = read(historyFile); const olaf = history.find(person => person.id === "olaf_rye");
  Object.assign(olaf, { desc: "Offiseren Olaf Rye (1791–1849), som plassen fikk navn etter i 1864.", popupDesc: "Olaf Rye deltok som offiser i krigen i 1814 og gikk senere i dansk tjeneste. Store norske leksikon daterer hans død ved Fredericia til 6. juli 1849. Olaf Ryes plass fikk navn etter ham i 1864, og personkoblingen gjelder derfor selve stedsnavnet, ikke en påstand om at han bodde eller virket på Grünerløkka.", source_urls: [sourceUrls.rye,sourceUrls.byleksikon], externalLinks: [{ type:"source",label:"Store norske leksikon – Olaf Rye",url:sourceUrls.rye,verifiedAt:"2026-08-25" },{ type:"source",label:"Oslo byleksikon – Olaf Ryes plass",url:sourceUrls.byleksikon,verifiedAt:"2026-08-25" }] });
  write(historyFile, history);
  const scienceFile = "data/people/vitenskap/oslo/people_vitenskap_oslo.json";
  const science = read(scienceFile); const sundt = science.find(person => person.id === "eilert_sundt");
  sundt.places = [...new Set([...(sundt.places || []),"olaf_ryes_plass"])];
  sundt.source_urls = [...new Set([...(sundt.source_urls || []),sourceUrls.sundt,sourceUrls.byleksikon])];
  sundt.externalLinks = [{ type:"source",label:"Store norske leksikon – Eilert Sundt",url:sourceUrls.sundt,verifiedAt:"2026-08-25" },{ type:"source",label:"Oslo byleksikon – Olaf Ryes plass",url:sourceUrls.byleksikon,verifiedAt:"2026-08-25" }];
  sundt.popupDesc = "Eilert Sundt var samfunnsforsker og undersøkte levekår, arbeid og samfunnsforhold på 1800-tallet. Mathias Skeibroks bronsebyste av ham ble reist i sørenden av Olaf Ryes plass i 1892, finansiert av Oslo Arbeidersamfund og Selskabet for Folkeoplysningens Fremme. Koblingen til plassen er det fysiske monumentet, mens hans øvrige liv og virksomhet hører til den bredere personprofilen.";
  write(scienceFile, science);

  const readingBatch = read("data/lesespor/lesespor_oslo_batch2.json");
  const placeReadings = readingBatch.items.filter(item => item.place_ids?.includes("olaf_ryes_plass"));
  if (placeReadings.length !== 3) throw new Error(`Expected three Olaf Ryes plass readings, found ${placeReadings.length}`);
  const readingFile = "data/lesespor/oslo/lesespor_oslo_by.json";
  const readingPack = read(readingFile);
  for (const item of placeReadings) addUnique(readingPack.items, item, row => row.id);
  write(readingFile, readingPack);
  const dedicatedReadingFile = path.join(root, "data/lesespor/oslo/lesespor_oslo_olaf_ryes_plass.json");
  if (fs.existsSync(dedicatedReadingFile)) fs.unlinkSync(dedicatedReadingFile);
  const readingManifest = read("data/lesespor/manifest.json");
  readingManifest.files = readingManifest.files.filter(file => file !== "oslo/lesespor_oslo_olaf_ryes_plass.json");
  write("data/lesespor/manifest.json",readingManifest);
  const eventsFile = "data/events/by/events_olaf_ryes_plass.json";
  write(eventsFile,[
    { id:"evt_olaf_ryes_plass_lokkadagene_2026",place_id:"olaf_ryes_plass",title:"Løkkadagene og Løkkamarkedet",start:"2026-09-12",end:"2026-09-13",status:"upcoming",source:"Visit Løkka",source_url:sourceUrls.lokkadagene,organizer:"Visit Løkka",category:"marked_og_nabolagsarrangement",description:"Visit Løkka annonserer Løkkadagene 12.–13. september 2026 med Løkkamarkedet på Olaf Ryes plass. Kontroller arrangørens program før besøk.",tags:["grünerløkka","marked","nabolag"],valid_through:"2026-09-13",verified_at:"2026-08-25",additional_source_urls:[sourceUrls.lokkaprogram] },
    { id:"evt_olaf_ryes_plass_julemarked_2026",place_id:"olaf_ryes_plass",title:"Julemarked og tenning av julestjernen",start:"2026-11-28",end:"2026-11-28",status:"upcoming",source:"Visit Løkka",source_url:sourceUrls.visitlokka,organizer:"Visit Løkka",category:"julemarked",description:"Visit Løkka annonserer julemarked og tenning av julestjernen på Olaf Ryes plass 28. november 2026. Kontroller arrangørens program før besøk.",tags:["grünerløkka","julemarked","nabolag"],valid_through:"2026-11-28",verified_at:"2026-08-25" }
  ]);
  const eventManifest = read("data/events/events_manifest.json"); addUnique(eventManifest.files,{category:"by",entity_id:"olaf_ryes_plass",path:eventsFile},item=>item.entity_id); write("data/events/events_manifest.json",eventManifest);

  const normalize = value => String(value || "").normalize("NFC").replace(/\r\n?/g,"\n").replace(/[ \t]+/g," ").trim();
  const sourceHash = crypto.createHash("sha256").update(JSON.stringify({name:normalize(place.name),desc:normalize(place.desc),popupDesc:normalize(place.popupDesc)})).digest("hex").slice(0,16);
  const translatedOwner = { en:"The four streets also act as ownership checks: the paths, vegetation, bust and fountain belong to the square narrative, while surrounding façades and businesses remain separate places or neighbouring context.", es:"Las cuatro calles también sirven para controlar la pertenencia: senderos, vegetación, busto y fuente forman parte de la plaza, mientras fachadas y negocios circundantes siguen siendo lugares propios o contexto vecino.", pt:"As quatro ruas também controlam o pertencimento: caminhos, vegetação, busto e fonte integram a narrativa da praça, enquanto fachadas e negócios ao redor permanecem lugares próprios ou contexto vizinho." };
  for (const [lang, sentence] of Object.entries(translatedOwner)) { const file=`data/i18n/content/places/${lang}.json`; const pack=read(file); if (!pack.olaf_ryes_plass.popupDesc.includes(sentence)) pack.olaf_ryes_plass.popupDesc=`${pack.olaf_ryes_plass.popupDesc} ${sentence}`; pack.olaf_ryes_plass._sourceHash=sourceHash; write(file,pack); }

  const production = read("data/places/production/olaf_ryes_plass.json");
  if (production.sentenceCoverage.popupDesc.length === 19) production.sentenceCoverage.popupDesc.push({ sentence:20,claimIds:["claim_olaf_identity","claim_olaf_sundt_bust","claim_olaf_fountain","claim_olaf_parkteatret_neighbour"] });
  production.textHashes.popupDesc = crypto.createHash("sha256").update(place.popupDesc).digest("hex");
  production.roundsReadiness = { status:"production_ready",reviewedAt:"2026-08-25",auditFile:"reports/place-production/olaf-ryes-plass-phase20-24-gate-audit-v1.json",badgePlacement:"separate_header",contentRoundIds:place.place_card_profile.collection_ids,placeCardProfile:place.place_card_profile.schema,peopleIds:place.related_people_ids,objectIds:place.objects.map(item=>item.id),brandIds:[],brandFallback:"honest_empty_state_after_candidate_and_logo_audit",relatedPlaceIds:place.related_place_ids,objectSourceCoveragePercent:100,routeStopResolutionPercent:100 };
  production.reviewsNotes = "Full phase 0–24 production: exact two-person target, two sourced Objects, four related canonical places, honest empty Brands after Parkteatret logo holdback, rich 5x7 quiz/Knowledge, safe onsite tasks and final gate evidence.";
  write("data/places/production/olaf_ryes_plass.json",production);
  buildQuiz(place,production);
}

if (mode === "content" || mode === "all") buildContent();
if (mode === "integration" || mode === "all") buildIntegration();
