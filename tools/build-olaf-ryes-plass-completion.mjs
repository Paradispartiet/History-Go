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
    { id: "lesespor_olaf_ryes_plass_byleksikon", title: "Olaf Ryes plass", author: null, publication: "Oslo byleksikon", date: null, year: null, type: "reference_article", subjects: ["Olaf Ryes plass", "parkhistorie", "Eilert Sundt"], place_ids: ["olaf_ryes_plass"], person_ids: ["olaf_rye", "eilert_sundt"], category_hints: ["by", "historie"], url: sourceUrls.byleksikon, access: "open", rights: "link_only", source_quality: "institutional_reference", curation_status: "strong_candidate", relevance: "Stedsspesifikk oversikt over avgrensning, navngiving, park, byste og fontene." },
    { id: "lesespor_olaf_ryes_plass_byokologi", title: "Byøkologi – hva er det, egentlig?", author: null, publication: "Oslo kommune / Byplan", date: null, year: null, type: "municipal_article", subjects: ["byøkologi", "offentlig rom", "Olaf Ryes plass"], place_ids: ["olaf_ryes_plass"], person_ids: [], category_hints: ["by", "natur"], url: sourceUrls.byokologi, access: "open", rights: "link_only", source_quality: "official_municipality", curation_status: "strong_candidate", relevance: "Kommunal refleksjon om byøkologi med Olaf Ryes plass som konkret samtale- og observasjonssted." },
    { id: "lesespor_olaf_ryes_plass_oslobilder_1903", title: "Olaf Ryes Plads", author: "Anders Beer Wilse", publication: "Oslo Museum / Oslobilder", date: "1903-01-01", year: 1903, type: "historical_photo", subjects: ["park", "byste", "offentlig rom"], place_ids: ["olaf_ryes_plass"], person_ids: ["eilert_sundt"], category_hints: ["by", "historie"], url: sourceUrls.before, access: "open", rights: "cc_3_0", source_quality: "museum_collection", curation_status: "strong_candidate", relevance: "Katalogisert 1903-fotografi av selve parkrommet med benker, mennesker og portrettbyste." }
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

function buildIntegration() {
  throw new Error("Integration phase is added after the source/content risk boundary is merged.");
}

if (mode === "content" || mode === "all") buildContent();
if (mode === "integration" || mode === "all") buildIntegration();
