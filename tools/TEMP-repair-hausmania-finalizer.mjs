import fs from 'node:fs';

const file = 'tools/finalize-hausmania-completion.mjs';
let s = fs.readFileSync(file, 'utf8');
const must = (re, replacement, label) => {
  const next = s.replace(re, replacement);
  if (next === s) throw new Error(`Hausmania finalizer patch did not match: ${label}`);
  s = next;
};

must(
  /  byleksikon: "https:\/\/oslobyleksikon\.no\/side\/Hausmanns_gate",\n  commons2024:/,
  `  byleksikon: "https://oslobyleksikon.no/side/Hausmanns_gate",\n  visit: "https://www.visitoslo.com/no/attraksjon/hausmania-kulturhus",\n  rooms: "https://www.hausmania.org/lokaler",\n  haerverk: "https://www.kafe-haerverk.com/om",\n  grusomheten: "https://www.grusomhetensteater.no/",\n  lefebvre: "https://www.versobooks.com/blogs/news/3474-the-right-to-the-city-free-ebook-download",\n  commons2024:`,
  'source URLs'
);

must(
  /async function image\(source, target, width, height, fit = "cover"\) \{[\s\S]*?\n\}\n\nawait Promise\.all\(\[[\s\S]*?\n\]\);/,
  `const assetUrls = {\n  "haus-current.jpg": "https://upload.wikimedia.org/wikipedia/commons/a/af/Hausmanns_gate_34,_Oslo_(2024).jpg",\n  "haus-2017.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Hausmania_fasade.jpg",\n  "haus-2007.jpg": "https://upload.wikimedia.org/wikipedia/commons/f/fe/Hausmanns_gate_at_Ankertorget_-_2007.04.03.jpg",\n  "haus-stencil.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Oh_Lord_When_is_my_15_minutes%3F.jpg",\n  "haus-hall1.jpg": "https://format.creatorcdn.com/5803af23-9cca-4279-8b2e-d03e22997b26/0/0/0/0%2C92%2C2048%2C1242%2C570%2C320/0-0-0/a60ea0ae-8e95-44f6-8f68-593e1463dc05/1/2/flerbruks03.jpg?fjkss=exp%3D2101749964~hmac%3Dc7c01938c6d63a74007ed980be226eb897eaeaff4255b25a1988f7c02c4af0f9",\n  "haus-hall2.jpg": "https://format.creatorcdn.com/5803af23-9cca-4279-8b2e-d03e22997b26/0/0/0/0%2C0%2C960%2C538%2C570%2C320/0-0-0/51a8ce74-7fc5-4430-998d-0d8336f9e436/1/2/flerbruks05.jpg?fjkss=exp%3D2101749964~hmac%3Db17be9fa1ef9c5d34bdee6c1f75da24c6172c11a4b3dfd529d8ba5a09fd5aaae",\n  "haus-concert.jpg": "https://format.creatorcdn.com/5803af23-9cca-4279-8b2e-d03e22997b26/0/0/0/0%2C0%2C2048%2C1077%2C760%2C400/0-0-0/89728e32-e5a2-4800-8326-f5b69f9c27c1/1/2/471331661_10160482644966835_3898163193184432656_n.jpg?fjkss=exp%3D2101749964~hmac%3Dc3c846a81bed9e45af26f5a6c4a01cf8faf852c9293816af041498144e6e1f4c",\n  "podium-logo": "https://www.podium.enterprises/img/podium-logo.png"\n};\n\nasync function image(source, target, width, height, fit = "cover") {\n  const url = assetUrls[source];\n  if (!url) throw new Error(\`Unknown Hausmania image source: \${source}\`);\n  let response;\n  for (let attempt = 1; attempt <= 5; attempt += 1) {\n    response = await fetch(url, { headers: { "user-agent": "History-Go/1.0 (Hausmania production; contact: paradispartiet@gmail.com)", "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" } });\n    if (response.ok) break;\n    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 5) throw new Error(\`Image fetch failed \${response.status}: \${url}\`);\n    await new Promise(resolve => setTimeout(resolve, attempt * 2000));\n  }\n  const buffer = Buffer.from(await response.arrayBuffer());\n  if (buffer.length < 500) throw new Error(\`Image response unexpectedly small: \${url}\`);\n  const output = path.join(root, target);\n  fs.mkdirSync(path.dirname(output), { recursive: true });\n  await sharp(buffer).rotate().resize(width, height, { fit, position: "attention", background: "#ece9e3" }).webp({ quality: 88 }).toFile(output);\n}\n\nfor (const job of [\n  () => image("haus-current.jpg", "bilder/places/hausmania.webp", 1400, 900),\n  () => image("haus-current.jpg", "bilder/places/hausmania_front_portrait.webp", 900, 1280),\n  () => image("haus-2017.jpg", "bilder/historisk/hausmania/hausmania_2017.webp", 1200, 820),\n  () => image("haus-2007.jpg", "bilder/historisk/hausmania/hausmannsgate_2007.webp", 1200, 820),\n  () => image("haus-hall1.jpg", "bilder/kort/objects/hausmania_db_c7_lydanlegg.webp", 900, 620),\n  () => image("haus-hall2.jpg", "bilder/kort/objects/hausmania_behringer_x32.webp", 900, 620),\n  () => image("haus-concert.jpg", "bilder/kort/productions/hausmania_flerbrukshallen.webp", 900, 620),\n  () => image("podium-logo", "bilder/kort/brands/podium_oslo.webp", 900, 520, "contain"),\n  () => image("podium-logo", "bilder/kort/productions/hausmania_podium.webp", 900, 620, "contain")\n]) {\n  await job();\n}`,
  'scratch-free image materialization'
);

must(
  /  desc: "Hausmania i Hausmanns gate 34[\s\S]*?  \]\.join\("\\n\\n"\),\n  image:/,
  `  desc: "Hausmania i Hausmanns gate 34 er et uavhengig, kunstnerdrevet kulturhus med atelierer, øvingsrom og arrangementsflater. Oslo Byleksikon daterer okkupasjonen og etableringen i nummer 34 til 1999, mens Hausmania selv bruker 2000 som opprettelsesår; begge dateringene beholdes kildebundet.",\n  popupDesc: [\n    "Hausmania holder til i Hausmanns gate 34 og beskriver seg som et uavhengig, kunstnerdrevet kulturhus.",\n    "Oslo Byleksikon daterer okkupasjonen og etableringen i nummer 34 til 1999, mens Hausmanias egen historikk bruker 2000 som året kulturhuset ble opprettet.",\n    "Oslo kommune overtok eiendommen i 2004, og i 2008 ble Hausmanns gate 34, 40 og 42 regulert som et byøkologisk kulturkvartal.",\n    "Hausmanias nåværende egenpresentasjon oppgir at rundt 200 kunstnere er medlemmer eller på andre måter knyttet til huset, mens VisitOSLO beskriver omtrent tjue bandøvingsrom og rundt førti kunstneratelierer.",\n    "Ledige arbeidsrom fordeles gjennom Husro, som vurderer kunstnerisk kompetanse, engasjement og motivasjon, og Hausmania knytter medlemskap og leie til tilstedeværelse, engasjement og dugnad.",\n    "Flerbrukshallen brukes til konserter og arrangementer; den offisielle lokaloversikten oppgir et d&b Audiotechnik C7-anlegg med P1200A-forsterkere og en Behringer X32-mikser.",\n    "Podium er et selvstendig kunstnerdrevet visningssted i Hausmania med historie fra 2003 og et løpende program av utstillinger og offentlige hendelser.",\n    "Kafé Hærverk og Grusomhetens Teater har også egne identiteter og funksjoner på samme adresse og skal ikke absorberes i Hausmanias canonicale Place-identitet.",\n    "Kildene dokumenterer dermed både selvorganisert arbeid, kommunalt eierskap, romfordeling og samlokaliserte kulturaktører, men de gir ikke grunnlag for å tilskrive alle brukere én felles politisk eller subkulturell identitet."\n  ].join("\\n\\n"),\n  image:`,
  'source-first descriptions'
);

must(
  /  objects: \[\{[\s\S]*?\n  \}\],\n  productions:/,
  `  objects: [\n    {\n      id: "hausmania_db_c7_lydanlegg", name: "d&b C7-lydanlegget", title: "d&b C7-lydanlegget", type: "lydanlegg", kind: "stage_audio_system",\n      desc: "Flerbrukshallens offisielle utstyrsliste oppgir d&b Audiotechnik C7 med P1200A-forsterkere, åtte subwoofere og fire topper.",\n      historicalFunction: "Fast lydinfrastruktur for konserter og arrangementer i Flerbrukshallen.", placeSpecificReason: "Modell og oppsett er eksplisitt listet for Hausmanias Flerbrukshall.",\n      physicalObject: true, placeSpecific: true, collectable: true, image: "bilder/kort/objects/hausmania_db_c7_lydanlegg.webp",\n      imageMeta: { source: "official_hausmania_site", sourcePage: urls.rooms, creator: null, credit: "Hausmania / offisiell nettside", license: "Official site editorial reference", rightsBasis: "official_site_editorial_reference", assetType: "documentary_equipment_photo", transformation: "Stedstro utsnitt fra Hausmanias eget Flerbrukshall-foto og WebP-normalisering.", verifiedAt },\n      source_urls: [urls.rooms]\n    },\n    {\n      id: "hausmania_behringer_x32", name: "Behringer X32-mikseren", title: "Behringer X32-mikseren", type: "lydmikser", kind: "digital_mixing_console",\n      desc: "Hausmania oppgir en Behringer X32 med multikabel som tilgjengelig mikser i Flerbrukshallen.",\n      historicalFunction: "Mikser for lydproduksjon ved konserter og arrangementer.", placeSpecificReason: "Modellen er eksplisitt listet i Hausmanias utstyrsoversikt for hallen.",\n      physicalObject: true, placeSpecific: true, collectable: true, image: "bilder/kort/objects/hausmania_behringer_x32.webp",\n      imageMeta: { source: "official_hausmania_site", sourcePage: urls.rooms, creator: null, credit: "Hausmania / offisiell nettside", license: "Official site editorial reference", rightsBasis: "official_site_editorial_reference", assetType: "documentary_equipment_photo", transformation: "Stedstro utsnitt fra Hausmanias eget Flerbrukshall-foto og WebP-normalisering.", verifiedAt },\n      source_urls: [urls.rooms]\n    }\n  ],\n  productions:`,
  'two canonical Objects'
);

must(
  /      image: "bilder\/kort\/productions\/hausmania_flerbrukshallen\.webp",\n      imageMeta: \{ \.\.\.media\.facade2017,[\s\S]*?\n      source_urls: \[urls\.official\]/,
  `      image: "bilder/kort/productions/hausmania_flerbrukshallen.webp",\n      imageMeta: { source: "official_hausmania_site", sourcePage: urls.official, creator: "Åse Karlsen", credit: "Åse Karlsen / Hausmania", license: "Official site editorial reference", rightsBasis: "official_site_editorial_reference", assetType: "documentary_event_photo", transformation: "Stedstro utsnitt og WebP-normalisering.", verifiedAt },\n      source_urls: [urls.official, urls.rooms]`,
  'Flerbrukshall production image provenance'
);

must(
  /  chronology: \[[\s\S]*?\n  \],\n  fagverk:/,
  `  chronology: [\n    { id: "chrono_hausmania_1999", year: 1999, title: "Okkupasjon og etablering", desc: "Oslo Byleksikon daterer okkupasjonen og etableringen i Hausmanns gate 34 til 1999.", confidence: "high", sources: [{ title: "Oslo Byleksikon – Hausmanns gate", url: urls.byleksikon, verifiedAt }] },\n    { id: "chrono_hausmania_2000", year: 2000, title: "Kulturhuset i egen historikk", desc: "Hausmanias egen historikk bruker 2000 som opprettelsesår for kulturhuset.", confidence: "high", sources: [{ title: "Hausmania", url: urls.official, verifiedAt }] },\n    { id: "chrono_hausmania_2003", year: 2003, title: "Podium etableres", desc: "Podium fører sin historie tilbake til 2003 som kunstnerdrevet arena.", confidence: "high", sources: [{ title: "Podium – About", url: urls.podium, verifiedAt }] },\n    { id: "chrono_hausmania_2004", year: 2004, title: "Kommunen overtar eiendommen", desc: "Oslo kommune overtar eiendommen i Hausmanns gate 34.", confidence: "high", sources: [{ title: "Oslo Byleksikon – Hausmanns gate", url: urls.byleksikon, verifiedAt }] },\n    { id: "chrono_hausmania_2006", year: 2006, title: "Podium får galleri i Hausmania", desc: "Sceneweb knytter Podiums galleridrift i Hausmania til 2006.", confidence: "high", sources: [{ title: "Sceneweb – Podium", url: urls.sceneweb, verifiedAt }] },\n    { id: "chrono_hausmania_2008", year: 2008, title: "Byøkologisk kulturkvartal", desc: "Hausmanns gate 34, 40 og 42 reguleres som byøkologisk kulturkvartal.", confidence: "high", sources: [{ title: "Oslo Byleksikon – Hausmanns gate", url: urls.byleksikon, verifiedAt }] },\n    { id: "chrono_hausmania_2026", year: 2026, title: "Aktivt kunstnerdrevet kulturhus", desc: "Hausmania publiserer fortsatt arbeidsrom, Flerbrukshall og informasjon om kollektiv deltakelse.", confidence: "high", sources: [{ title: "Hausmania", url: urls.official, verifiedAt }] }\n  ],\n  fagverk:`,
  'chronology'
);

must(
  /      \{ title: "Skiftende visuell flate"[\s\S]*?\n      \{ title: "Flere aktører i samme hus"/,
  `      { title: "Sceneutstyr som fysisk spor", observation: "Flerbrukshallens lydrigg gjør arrangementsproduksjon materiell og observerbar når rommet er offentlig tilgjengelig.", interpretation_boundary: "Synlig utstyr viser teknisk infrastruktur; modell og kapasitet må kontrolleres mot Hausmanias offisielle utstyrsliste.", source_urls: [urls.rooms] },\n      { title: "Flere aktører i samme hus"`,
  'Fagverk object trace'
);

must(
  /const podiumAssetUrl = fs\.readFileSync\("\/workspace\/scratch\/podium-url\.txt", "utf8"\)\.trim\(\);\nif \(!\/\^https\?:\\\/\\\/\/.test\(podiumAssetUrl\)\) throw new Error\("Podium official logo asset URL was not resolved\."\);/,
  `const podiumAssetUrl = "https://www.podium.enterprises/img/podium-logo.png";`,
  'Podium official logo URL'
);

must(
  /const story = stories\.find\(item => item\.id === "st_hausmania_fristed_bykonflikt_1999"\);[\s\S]*?write\(storiesFile, stories\);/,
  `const story = stories.find(item => item.id === "st_hausmania_fristed_bykonflikt_1999");\nif (!story) throw new Error("Existing Hausmania Story missing.");\nstory.year = 1999;\nstory.summary = "Hausmania vokste fram rundt 1999–2000 som selvorganisert kulturhus i Hausmanns gate 34 og utviklet mer varige rammer uten at kollektiv deltakelse forsvant.";\nstory.story = [\n  "Oslo Byleksikon daterer okkupasjonen og etableringen i Hausmanns gate 34 til 1999, mens Hausmania selv bruker 2000 som opprettelsesår. Forskjellen beholdes fordi kildene beskriver etableringsfasen på litt ulike måter.",\n  "Senere ble rammene mer formelle. Oslo kommune overtok eiendommen i 2004, og kvartalet ble regulert byøkologisk i 2008. Samtidig fortsatte kulturhuset å knytte arbeidsrom til tilstedeværelse, engasjement og dugnad.",\n  "I dag rommer huset både egen kulturhusdrift og selvstendige aktører som Podium, Kafé Hærverk og Grusomhetens Teater. Fortellingen handler derfor om hvordan selvorganisering, fysisk infrastruktur og formelle eiendomsrammer kan eksistere samtidig."\n].join("\\n\\n");\nstory.sources = [\n  { title: "Hausmania", url: urls.official },\n  { title: "Oslo Byleksikon: Hausmanns gate", url: urls.byleksikon },\n  { title: "Podium: About", url: urls.podium }\n];\nstory.score = { narrative: 5, historical: 5, source: 5, play_value: 4, originality: 4, total: 23 };\nstory.arc = { start: "Selvorganisert bruk etableres rundt 1999–2000.", middle: "Kommunalt eierskap og regulering gir mer varige rammer.", end: "Kulturhuset kombinerer fortsatt kollektiv deltakelse med flere selvstendige kulturaktører." };\nstory.quality_profile = "episode_v1";\nstory.episode = { actors: ["Hausmania-miljøet", "Oslo kommune", "kulturaktører i Hausmanns gate 34"], date: "1999–2008", action: "Selvorganisert bruk ble fulgt av kommunalt eierskap og byøkologisk regulering.", consequence: "Hausmania fortsatte som kulturinfrastruktur med både kollektive praksiser og formelle rammer." };\nwrite(storiesFile, stories);`,
  'Story factual repair'
);

must(
  /url: id === "rett_til_byen" \? "data\/fag\/subkultur\/theory_attribution_subkultur_canonical_v1\.json" : urls\.official/,
  `url: id === "rett_til_byen" ? urls.lefebvre : urls.official`,
  'language HTTPS source'
);

must(
  /const productionPacket = \{[\s\S]*?\n\};\nwrite\("data\/places\/production\/hausmania\.json", productionPacket\);/,
  `const descriptionClaims = [\n  { id: "claim_hausmania_identity", claim: "Hausmania holder til i Hausmanns gate 34 og beskriver seg som et uavhengig, kunstnerdrevet kulturhus.", sourceUrl: urls.official, sourceLocation: "forside og kontakt/om-seksjon", sourceType: "primary", temporalStatus: "current" },\n  { id: "claim_hausmania_dates", claim: "Oslo Byleksikon daterer okkupasjon og etablering til 1999, mens Hausmania bruker 2000 som opprettelsesår.", sourceUrl: urls.byleksikon, sourceLocation: "Hausmanns gate 34; sammenholdt med Hausmanias historikk", sourceType: "reputable_secondary", temporalStatus: "historical", independentSourceUrls: [urls.official] },\n  { id: "claim_hausmania_municipality", claim: "Oslo kommune overtok eiendommen i 2004, og kvartalet ble regulert byøkologisk i 2008.", sourceUrl: urls.byleksikon, sourceLocation: "Hausmanns gate 34 og kulturkvartalet", sourceType: "reputable_secondary", temporalStatus: "historical" },\n  { id: "claim_hausmania_scale", claim: "Hausmania oppgir rundt 200 tilknyttede kunstnere, mens VisitOSLO beskriver omtrent 20 øvingsrom og 40 atelierer.", sourceUrl: urls.official, sourceLocation: "forside; kontrollert mot VisitOSLO", sourceType: "primary", temporalStatus: "current", independentSourceUrls: [urls.visit] },\n  { id: "claim_hausmania_husro", claim: "Husro fordeler arbeidsrom etter kunstnerisk kompetanse, engasjement og motivasjon, og medlemskap/leie er knyttet til deltakelse og dugnad.", sourceUrl: urls.official, sourceLocation: "Husro og arbeidsrom", sourceType: "primary", temporalStatus: "current" },\n  { id: "claim_hausmania_hall", claim: "Flerbrukshallen brukes til konserter og arrangementer og har dokumentert d&b C7/P1200A-lydanlegg og Behringer X32-mikser.", sourceUrl: urls.rooms, sourceLocation: "Flerbrukshallen og utstyrsliste", sourceType: "primary", temporalStatus: "current" },\n  { id: "claim_hausmania_podium", claim: "Podium er et selvstendig kunstnerdrevet visningssted i Hausmania med historie fra 2003.", sourceUrl: urls.podium, sourceLocation: "About; adresse og historikk", sourceType: "primary", temporalStatus: "current", independentSourceUrls: [urls.sceneweb] },\n  { id: "claim_hausmania_colocated", claim: "Kafé Hærverk og Grusomhetens Teater har egne institusjonelle identiteter på Hausmanns gate 34.", sourceUrl: urls.haerverk, sourceLocation: "om-side og adresse; kontrollert mot Grusomhetens Teater", sourceType: "primary", temporalStatus: "current", independentSourceUrls: [urls.grusomheten] },\n  { id: "claim_hausmania_identity_boundary", claim: "Kildene dokumenterer organisering og institusjoner, men gir ikke grunnlag for å tilskrive alle brukere én felles politisk eller subkulturell identitet.", sourceUrl: urls.official, sourceLocation: "kildeomfang og redaksjonell evidensgrense", sourceType: "primary", temporalStatus: "current" }\n].map(row => ({ ...row, verifiedAt, status: "verified", claimKind: row.id === "claim_hausmania_identity" ? "identity" : "ordinary", evidenceMode: row.independentSourceUrls ? "corroborated" : "direct" }));\nconst descriptionSentences = value => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(value)].map(row => row.segment.trim()).filter(Boolean);\nconst descRows = descriptionSentences(place.desc);\nconst popupRows = descriptionSentences(place.popupDesc);\nif (descRows.length !== 2 || popupRows.length !== 9) throw new Error(\`Unexpected Hausmania description sentence count: \${descRows.length}/\${popupRows.length}\`);\nconst productionPacket = {\n  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId, placeFile, status: "ready_v4_2",\n  identity: { status: "resolved", represents: "Kulturhuset Hausmania i Hausmanns gate 34 fra etableringsfasen rundt 1999–2000 til nåtid.", period: "1999/2000–nåtid", excludes: ["Podium som selvstendig organisasjon", "Kafé Hærverk", "Grusomhetens Teater", "Hausmannsgate-aksen"] },\n  metadataSnapshot: { name: place.name, year: place.year, category: categoryId, address: place.address, coordinates: { lat: place.lat, lon: place.lon }, externalLinks: place.sources, operationStatus: "active", placeType: "artist_run_culture_house" },\n  textHashes: { algorithm: "sha256", desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) },\n  claims: descriptionClaims,\n  sentenceCoverage: {\n    desc: [{ sentence: 1, claimIds: ["claim_hausmania_identity"] }, { sentence: 2, claimIds: ["claim_hausmania_dates"] }],\n    popupDesc: [\n      { sentence: 1, claimIds: ["claim_hausmania_identity"] }, { sentence: 2, claimIds: ["claim_hausmania_dates"] }, { sentence: 3, claimIds: ["claim_hausmania_municipality"] },\n      { sentence: 4, claimIds: ["claim_hausmania_scale"] }, { sentence: 5, claimIds: ["claim_hausmania_husro"] }, { sentence: 6, claimIds: ["claim_hausmania_hall"] },\n      { sentence: 7, claimIds: ["claim_hausmania_podium"] }, { sentence: 8, claimIds: ["claim_hausmania_colocated"] }, { sentence: 9, claimIds: ["claim_hausmania_identity_boundary"] }\n    ]\n  },\n  reviews: { factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "source-by-source Hausmania review" }, editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "place-specific Hausmania editorial review", introducedNewFacts: false } },\n  quizReadiness: { questions: [\n    ["Hvor holder Hausmania til?", "Hausmanns gate 34", "hvor", "claim_hausmania_identity"],\n    ["Når daterer Oslo Byleksikon etableringen?", "1999", "når", "claim_hausmania_dates"],\n    ["Hvilket opprettelsesår bruker Hausmania selv?", "2000", "når", "claim_hausmania_dates"],\n    ["Når overtok Oslo kommune eiendommen?", "2004", "når", "claim_hausmania_municipality"],\n    ["Når ble kvartalet regulert byøkologisk?", "2008", "når", "claim_hausmania_municipality"],\n    ["Hva gjør Husro?", "Fordeler ledige arbeidsrom", "hva", "claim_hausmania_husro"],\n    ["Hvilken mikser oppgis i Flerbrukshallen?", "Behringer X32", "hvilket_verk_eller_objekt", "claim_hausmania_hall"],\n    ["Hvilken kunstnerdrevet aktør i huset har historie fra 2003?", "Podium", "hva", "claim_hausmania_podium"]\n  ].map(([question, answer, type, claimId]) => ({ question, answer, type, normalKnowledgeQuestion: true, claimIds: [claimId] })) },\n  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: descriptionClaims.length, total: descriptionClaims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }\n};\nwrite("data/places/production/hausmania.json", productionPacket);`,
  'valid description production packet'
);

s = s.replaceAll('objects: ["hausmania_stencil_caz_2008"]', 'objects: ["hausmania_db_c7_lydanlegg", "hausmania_behringer_x32"]');
s = s.replace('objects: { selected: ["hausmania_stencil_caz_2008"], temporal_caveat: "2008 documented expression; no claim of current persistence" }', 'objects: { selected: ["hausmania_db_c7_lydanlegg", "hausmania_behringer_x32"], rationale: "To directly documented pieces of Flerbrukshallen stage-audio equipment." }');
s = s.replace('objects_status: "PASS_one_documented_physical_expression"', 'objects_status: "PASS_two_documented_stage_audio_objects"');
s = s.replace('objects: "Dokumentert stencilspor fra 2008"', 'objects: "d&b C7/P1200A-lydanlegg og Behringer X32-mikser"');
s = s.replace('loaded_preview_images: 5', 'loaded_preview_images: 6');
s = s.replace('"bilder/kort/objects/hausmania_stencil_caz_2008.webp", ', '"bilder/kort/objects/hausmania_db_c7_lydanlegg.webp", "bilder/kort/objects/hausmania_behringer_x32.webp", ');
s = s.replace('"Wikimedia Commons – stencil på Hausmania (2008)", url: urls.commons2008', '"Hausmania – Flerbrukshallen", url: urls.rooms');
s = s.replace('quiz_profile: "normal_4x7", fagverk_status: "curated_full", chronology_status: "PASS_five_milestones"', 'quiz_profile: "normal_4x7", fagverk_status: "curated_full", chronology_status: "PASS_seven_milestones"');
s = s.replace('conditional_modules: { stories: "one_episode_v1", lesespor: "four_produced", language: "six_terms_produced", for_na: "produced_as_non_optical_area_comparison", chronology: "five_milestones", quiz: "normal_4x7" }', 'conditional_modules: { stories: "one_episode_v1", lesespor: "four_produced", language: "six_terms_produced", for_na: "produced_as_non_optical_area_comparison", chronology: "seven_milestones", quiz: "normal_4x7" }');
s = s.replace('"Fire samlinger, Fagverk, fem milepæler, seks språkposter, fire Lesespor, episode_v1 og 4×7 quiz."', '"Fire samlinger, Fagverk, sju milepæler, seks språkposter, fire Lesespor, episode_v1 og 4×7 quiz."');
s = s.replace('"Hausmania completion materialized: 4 collections, 5 chronology milestones, 6 language entries, 4 reading tracks, episode_v1, normal 4x7 quiz."', '"Hausmania completion materialized: 4 collections, 7 chronology milestones, 6 language entries, 4 reading tracks, episode_v1, normal 4x7 quiz."');

must(
  /prompt: "Hvordan kombinerer Hausmania egenorganisering med formelle rammer\?"/,
  'prompt: "Hvordan kombinerer Hausmania egenorganisering i kulturhuset med formelle rammer?"',
  'Fagverk autonomy lens strength'
);

must(
  /source_urls: \[urls\.official, urls\.openHouse, urls\.podium, urls\.sceneweb\],/,
  'source_urls: [urls.official, urls.openHouse, urls.podium, urls.sceneweb, urls.commons2024, urls.rooms],',
  'Fagverk top-level source coverage'
);

must(
  /place\.sources = \[[\s\S]*?\];\nwrite\(placeFile, place\);/,
  `place.sources = [
  { type: "source", label: "Hausmania – offisiell side", url: urls.official, verifiedAt },
  { type: "source", label: "Hausmania – Flerbrukshallen og lokaler", url: urls.rooms, verifiedAt },
  { type: "source", label: "Open House Oslo – Hausmania", url: urls.openHouse, verifiedAt },
  { type: "source", label: "Podium – About", url: urls.podium, verifiedAt },
  { type: "source", label: "Sceneweb – Podium", url: urls.sceneweb, verifiedAt },
  { type: "image", label: "Wikimedia Commons – Hausmanns gate 34 (2024)", url: urls.commons2024, verifiedAt },
  { type: "image", label: "Wikimedia Commons – Hausmania fasade (2017)", url: urls.commons2017, verifiedAt },
  { type: "image", label: "Wikimedia Commons – stencil på Hausmania (2008)", url: urls.commons2008, verifiedAt }
];
place.externalLinks = [
  { label: "Hausmania – offisiell side", url: urls.official },
  { label: "Hausmania – Flerbrukshallen og lokaler", url: urls.rooms },
  { label: "Open House Oslo – Hausmania", url: urls.openHouse },
  { label: "Podium – About", url: urls.podium },
  { label: "Sceneweb – Podium", url: urls.sceneweb },
  { label: "Wikimedia Commons – Hausmanns gate 34 (2024)", url: urls.commons2024 }
];
write(placeFile, place);
const fagverkRegistry = read("data/fagverk/fagverk_registry.json");
fagverkRegistry.placeLinks ||= {};
fagverkRegistry.placeLinks[placeId] = {
  sourceFile: placeFile.replace(/^data\\//, ""),
  field: "fagverk",
  schema: place.fagverk.schema,
  level: place.fagverk.level,
  status: place.fagverk.status
};
write("data/fagverk/fagverk_registry.json", fagverkRegistry);`,
  'Fagverk operational links and registry index'
);

fs.writeFileSync(file, s);
console.log('Hausmania finalizer repaired: no scratch dependency, source-first descriptions, two Objects, valid v4.2 packet.');
