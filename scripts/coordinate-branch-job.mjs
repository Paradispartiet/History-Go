import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const PLACE_MANIFEST = 'data/places/manifest.json';

function abs(rel) {
  return path.join(ROOT, rel);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
}

function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}

function sha256File(rel) {
  return crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex');
}

function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}

function splitManifestRel(sourceRel) {
  const p = path.parse(sourceRel);
  return path.join(p.dir, `${p.name}_manifest${p.ext || '.json'}`).replace(/\\/g, '/');
}

function findActiveSource(placeId) {
  const hits = [];
  for (const entry of readJson(PLACE_MANIFEST).files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    const data = readJson(rel);
    const rows = rowsFrom(data);
    const index = rows.findIndex((row) => row?.id === placeId);
    if (index >= 0) hits.push({ sourceRel: rel, data, rows, index });
  }
  if (hits.length !== 1) {
    throw new Error(`${placeId}: expected exactly one active source, found ${hits.length}`);
  }
  return hits[0];
}

function writeActivePlace(hit, place) {
  if (Array.isArray(hit.data)) hit.data[hit.index] = place;
  else if (Array.isArray(hit.data.places)) hit.data.places[hit.index] = place;
  else if (Array.isArray(hit.data.items)) hit.data.items[hit.index] = place;
  else hit.data = place;
  writeJson(hit.sourceRel, hit.data);

  const manifestRel = splitManifestRel(hit.sourceRel);
  if (!fs.existsSync(abs(manifestRel))) return;

  const splitManifest = readJson(manifestRel);
  const manifestRow = (splitManifest.places || []).find((row) => row?.id === place.id);
  if (!manifestRow?.file) {
    throw new Error(`${place.id}: split child missing from ${manifestRel}`);
  }
  const childRel = path.join(path.dirname(manifestRel), manifestRow.file).replace(/\\/g, '/');
  writeJson(childRel, place);
  manifestRow.sha256 = sha256File(childRel);
  if (splitManifest.source_sha256 !== undefined) splitManifest.source_sha256 = sha256File(hit.sourceRel);
  if (splitManifest.generated_at !== undefined) splitManifest.generated_at = new Date().toISOString();
  writeJson(manifestRel, splitManifest);
}

function upsertExternalLink(place, link) {
  const links = Array.isArray(place.externalLinks) ? [...place.externalLinks] : [];
  const index = links.findIndex((item) => item?.url === link.url);
  if (index >= 0) links[index] = { ...links[index], ...link };
  else links.push(link);
  place.externalLinks = links;
}

function updatePlace(placeId, mutate) {
  const hit = findActiveSource(placeId);
  const place = structuredClone(hit.rows[hit.index]);
  const beforeCoordinates = JSON.stringify({
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    locatorType: place.locatorType,
    sourceProvider: place.sourceProvider,
    sourceObjectId: place.sourceObjectId,
    address: place.address,
    geocodeAccuracy: place.geocodeAccuracy,
    coordRole: place.coordRole,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordSourceId: place.coordSourceId,
    coordSourceUrl: place.coordSourceUrl,
    coordType: place.coordType,
    coordVerifiedAt: place.coordVerifiedAt,
    coordNote: place.coordNote
  });

  mutate(place);

  const afterCoordinates = JSON.stringify({
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    locatorType: place.locatorType,
    sourceProvider: place.sourceProvider,
    sourceObjectId: place.sourceObjectId,
    address: place.address,
    geocodeAccuracy: place.geocodeAccuracy,
    coordRole: place.coordRole,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordSourceId: place.coordSourceId,
    coordSourceUrl: place.coordSourceUrl,
    coordType: place.coordType,
    coordVerifiedAt: place.coordVerifiedAt,
    coordNote: place.coordNote
  });

  if (beforeCoordinates !== afterCoordinates) {
    throw new Error(`${placeId}: enrichment unexpectedly changed coordinate metadata`);
  }

  writeActivePlace(hit, place);
  console.log(`Updated ${placeId} in ${hit.sourceRel}`);
}

updatePlace('gronland_politistasjon', (place) => {
  place.desc = 'Tidligere politistasjon fra 1903 med bevart arrestfløy og okkupasjonshistorie; siden 1978 omformet til kultur- og museumssted, i dag blant annet hjem for Interkulturelt Museum.';
  place.popupDesc = 'Bygningen i Tøyenbekken ble reist i årene 1900–1902 og åpnet som Bækkegatens politistasjon i 1903, senere kjent som Grønland politistasjon. I bakgården er en arrestfløy over to etasjer bevart. Under den tyske okkupasjonen holdt spesialenheten Schnellkommando til i denne delen av anlegget, noe som gir stedet et mørkt lag av politi- og okkupasjonshistorie.\n\nPolitiet flyttet ut i 1978. Siden har bygningen fått en helt annen offentlig rolle som Grønland kulturstasjon, med kultur- og musikkaktiviteter, kulturskole og museumsvirksomhet. I dag holder Interkulturelt Museum til i den tidligere politistasjonen, og de gamle cellene brukes som utstillingsrom. I History Go er kontrasten sentral: et bygg konstruert for kontroll, arrest og myndighetsutøvelse er senere blitt brukt til kultur, læring og offentlig deltakelse. Stedet viser hvordan institusjonsbygninger kan skifte mening uten at de fysiske sporene etter tidligere maktbruk forsvinner.';
  const features = Array.isArray(place.quiz_profile?.signature_features)
    ? [...place.quiz_profile.signature_features]
    : [];
  const museumFeature = 'Interkulturelt Museum bruker i dag den tidligere politistasjonen og de gamle cellene som utstillingsrom';
  if (!features.includes(museumFeature)) features.push(museumFeature);
  place.quiz_profile.signature_features = features;
  place.quiz_profile.notes = 'Skal tydelig skilles fra dagens operative politistasjoner. Den historiske bygningen i Tøyenbekken er nå kultur- og museumssted, med Interkulturelt Museum som en sentral nåværende bruk.';
  upsertExternalLink(place, {
    type: 'official',
    label: 'Oslo Museum – Interkulturelt Museum',
    url: 'https://www.oslomuseum.no/besok-oss/interkulturelt-museum/',
    lang: 'nb',
    verifiedAt: '2026-07-20'
  });
});

updatePlace('schous_bryggeri', (place) => {
  place.desc = 'Grunnlagt i 1837 på Grünerløkka – et stort bryggeri- og industrikompleks som senere er omformet til kulturbruk; Popsenteret holdt til i anlegget fram til museets permanente stenging ved utgangen av 2024.';
  place.popupDesc = 'Schous bryggeri på Grünerløkka var både produksjonsanlegg og stor arbeidsplass i en voksende industriby. Bryggeriet knyttet råvarelogistikk, maskinteknologi og forbrukermarked sammen. Etter at bryggeridriften forsvant, fikk det store anlegget nye kulturfunksjoner. Popsenteret holdt til i bygg T i Schous-komplekset og formidlet norsk populærmusikk fram til museet stengte permanent etter siste åpningsdag 22. desember 2024.\n\nI History Go er stedet viktig både for å forstå bryggerinæringen som industri og for å lese hvordan et tidligere produksjonskompleks kan få nye kulturelle funksjoner. Popsenteret behandles som et historisk brukslag på Schous, ikke som et eget aktivt besøkssted etter nedleggelsen.';
  place.quiz_profile.signature_features = [
    'Schous bryggeri',
    'grunnlagt i 1837 som et sentralt bryggeri- og industrikompleks på Grünerløkka',
    'knyttet til næringslivets infrastruktur og byens industrialisering',
    'senere omformet til kulturbruk, med Popsenteret som ett av brukslagene fram til permanent stenging i 2024'
  ];
  place.quiz_profile.notes = 'Spør stedet gjennom arbeid, infrastruktur og byøkonomi, men bruk også den senere kulturbruken som eksempel på transformasjon. Popsenteret skal ikke omtales som et aktivt museum etter 2024.';
  upsertExternalLink(place, {
    type: 'official',
    label: 'Popsenteret – permanent stenging',
    url: 'https://www.popsenteret.no/nyheter/popsenteret-avvikles',
    lang: 'nb',
    verifiedAt: '2026-07-20'
  });
});

updatePlace('gamle_deichman', (place) => {
  place.year = 1933;
  place.desc = 'Det tidligere Deichman-hovedbiblioteket på Hammersborg, åpnet i 1933 og brukt som hovedbibliotek fram til 2019; bygningen transformeres nå til Fotohuset Deich, planlagt åpnet i 2028.';
  place.popupDesc = 'Bibliotekbygningen på Hammersborg åpnet i 1933 og var Deichmans hovedbibliotek fram til flyttingen til Bjørvika i 2019. Med sin monumentale plassering ved Arne Garborgs plass ble huset et av Oslos viktigste offentlige kunnskapsrom gjennom store deler av 1900-tallet: et sted for lesing, studier, litteratur og fri tilgang til informasjon.\n\nEtter at bibliotekfunksjonen flyttet ut, gikk bygningen inn i en ny transformasjonsfase. Den utvikles nå som Fotohuset Deich, et framtidig museum-, møte- og formidlingshus for fotografi, med Fotografiska Oslo som en del av satsingen. Den nåværende planen er åpning i 2028. I History Go skal dette behandles som et framtidig brukslag, ikke som et museum som allerede er åpent. Stedet viser dermed hvordan et offentlig kunnskapsbygg kan få et nytt kulturelt liv uten at den tidligere bibliotekshistorien forsvinner.';
  place.quiz_profile.subtype = 'hovedbibliotek_og_kulturbygg_i_transformasjon';
  place.quiz_profile.signature_features = [
    'Deichmans hovedbibliotek på Hammersborg fra 1933 til 2019',
    'monumentalt offentlig kunnskapsbygg ved Arne Garborgs plass',
    'transformeres til Fotohuset Deich med planlagt åpning i 2028'
  ];
  const angles = Array.isArray(place.quiz_profile.primary_angles) ? [...place.quiz_profile.primary_angles] : [];
  if (!angles.includes('transformasjon')) angles.push('transformasjon');
  place.quiz_profile.primary_angles = angles;
  place.quiz_profile.avoid_angles = [
    'generisk_turiststed',
    'omtale_fotohuset_som_allerede_apent'
  ];
  place.quiz_profile.must_include = [
    'perioden som hovedbibliotek fra 1933 til 2019',
    'stedets rolle som offentlig kunnskapsrom',
    'den planlagte ombruken til fotohus som et framtidig lag'
  ];
  place.quiz_profile.contrast_targets = [
    'nasjonalbiblioteket',
    'litteraturhuset',
    'deichman_bjorvika'
  ];
  place.quiz_profile.notes = 'Skal spørres som tidligere hovedbibliotek og offentlig kunnskapsbygg i transformasjon. Fotohuset Deich/Fotografiska er planlagt for 2028 og må ikke omtales som et aktivt museum før åpning.';
  upsertExternalLink(place, {
    type: 'official',
    label: 'Fotohuset Deich',
    url: 'https://www.deich.no/no/fotohuset-deich',
    lang: 'nb',
    verifiedAt: '2026-07-20'
  });
  upsertExternalLink(place, {
    type: 'official',
    label: 'Fotografiska Oslo',
    url: 'https://oslo.fotografiska.com/no',
    lang: 'nb',
    verifiedAt: '2026-07-20'
  });
});

fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));
console.log('Applied three existing Oslo museum-use enrichments without changing coordinate metadata.');
