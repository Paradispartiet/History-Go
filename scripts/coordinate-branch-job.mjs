import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const TODAY = '2026-07-20';
const PLACE_ID = 'langebudalen_naturreservat';
const PLACE_REL = 'data/places/natur/vestland/langebudalen_naturreservat.json';
const FLORA_FILE = 'karplanter_etne_langebudalen.json';
const FLORA_REL = `data/natur/flora/${FLORA_FILE}`;
const EVIDENCE_REL = `data/coordinate-evidence/vestland/natur/${PLACE_ID}.json`;

const kringomUrl = 'https://kringom.no/nb/sunnhordland/etne/langebudalen';
const lovdataUrl = 'https://lovdata.no/forskrift/2000-10-13-1022';
const etneUrl = 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/naturforvaltning/';
const arcgisLayer = 'https://kart.miljodirektoratet.no/arcgis/rest/services/vern/FeatureServer/0';

function abs(rel) {
  return path.join(ROOT, rel);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
}

function writeJson(rel, value) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeText(rel, value) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

async function fetchJson(url, label) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'History-Go-coordinate-runner/1.0' }
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error(`${label} failed: ${lastError?.message || lastError}`);
}

function textValues(object) {
  return Object.values(object || {}).filter(value => typeof value === 'string');
}

async function fetchLangebudalenFeature() {
  const endpoints = [
    `${arcgisLayer}/query`,
    'https://kart.miljodirektoratet.no/arcgis/rest/services/vern/MapServer/0/query',
    'https://arcgis002.miljodirektoratet.no/arcgis/rest/services/vern/FeatureServer/0/query'
  ];
  const whereClauses = [
    "navn LIKE '%Langebudalen%'",
    "offisieltNavn LIKE '%Langebudalen%'",
    "verneomradenavn LIKE '%Langebudalen%'"
  ];
  const errors = [];

  for (const endpoint of endpoints) {
    for (const where of whereClauses) {
      const query = new URLSearchParams({
        where,
        outFields: '*',
        returnGeometry: 'true',
        outSR: '4326',
        f: 'geojson'
      });
      const url = `${endpoint}?${query}`;
      try {
        const payload = await fetchJson(url, 'Miljødirektoratet query');
        const matches = (payload.features || []).filter(feature =>
          textValues(feature.properties).some(value => value.toLowerCase().includes('langebudalen'))
        );
        if (matches.length === 1) return { feature: matches[0], queryUrl: url };
        if (matches.length > 1) {
          const exact = matches.filter(feature =>
            textValues(feature.properties).some(value => /^langebudalen(?: naturreservat)?$/i.test(value.trim()))
          );
          if (exact.length === 1) return { feature: exact[0], queryUrl: url };
          errors.push(`${url}: ${matches.length} ambiguous matches`);
        } else {
          errors.push(`${url}: no matches`);
        }
      } catch (error) {
        errors.push(`${url}: ${error.message}`);
      }
    }
  }

  throw new Error(`Could not resolve official Langebudalen polygon. ${errors.join(' | ')}`);
}

function ringArea(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

function ringCentroid(ring) {
  let twiceArea = 0;
  let x = 0;
  let y = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    x += (x1 + x2) * cross;
    y += (y1 + y2) * cross;
  }
  if (Math.abs(twiceArea) < 1e-12) {
    const points = ring.slice(0, -1);
    return [
      points.reduce((sum, point) => sum + point[0], 0) / points.length,
      points.reduce((sum, point) => sum + point[1], 0) / points.length
    ];
  }
  return [x / (3 * twiceArea), y / (3 * twiceArea)];
}

function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function outerRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return geometry.coordinates.length ? [geometry.coordinates[0]] : [];
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map(polygon => polygon[0]).filter(Boolean);
  }
  return [];
}

function representativePoint(geometry) {
  const rings = outerRings(geometry);
  if (!rings.length) throw new Error(`Unsupported or empty geometry: ${geometry?.type || 'missing'}`);
  const ring = [...rings].sort((a, b) => Math.abs(ringArea(b)) - Math.abs(ringArea(a)))[0];
  let point = ringCentroid(ring);
  if (!pointInRing(point, ring)) {
    const xs = ring.map(([x]) => x);
    const ys = ring.map(([, y]) => y);
    const bboxCenter = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
    if (pointInRing(bboxCenter, ring)) point = bboxCenter;
    else {
      const average = [
        xs.reduce((sum, value) => sum + value, 0) / xs.length,
        ys.reduce((sum, value) => sum + value, 0) / ys.length
      ];
      point = pointInRing(average, ring) ? average : ring[0];
    }
  }
  return { lon: Number(point[0].toFixed(7)), lat: Number(point[1].toFixed(7)), ring };
}

function pick(properties, keys) {
  for (const key of keys) {
    const hit = Object.keys(properties || {}).find(candidate => candidate.toLowerCase() === key.toLowerCase());
    if (hit && properties[hit] !== null && properties[hit] !== '') return properties[hit];
  }
  return null;
}

function withTaxonId(base, taxonId) {
  if (Number.isInteger(taxonId)) base.taxonomy.artskart_taxon_id = taxonId;
  return base;
}

async function lookupTaxonId(scientificName) {
  const url = `https://artsdatabanken.no/Api/Taxon/ScientificName?ScientificName=${encodeURIComponent(scientificName)}`;
  try {
    const payload = await fetchJson(url, `Artsdatabanken ${scientificName}`);
    const queue = [payload];
    while (queue.length) {
      const value = queue.shift();
      if (Array.isArray(value)) {
        queue.push(...value);
      } else if (value && typeof value === 'object') {
        const direct = value.TaxonId ?? value.taxonId ?? value.TaxonID ?? value.taxonID;
        if (Number.isInteger(direct)) return direct;
        queue.push(...Object.values(value));
      }
    }
  } catch (error) {
    console.warn(`Taxon lookup skipped for ${scientificName}: ${error.message}`);
  }
  return null;
}

function makeFloraCards(dynamicIds) {
  const common = {
    place: 'Langebudalen naturreservat',
    sourceUrls: [kringomUrl]
  };
  return [
    withTaxonId({
      id: 'emne_ved_barlind',
      title: 'Barlind',
      latin: 'Taxus baccata',
      taxonomy: { norsk_navn: 'Barlind', latin_navn: 'Taxus baccata', klasse: 'Pinopsida', orden: 'Pinales', familie: 'Taxaceae' },
      habitat: { biotop: ['bratt bergside', 'kystnær skog', 'lokalklimatisk varm dal'], jord: ['næringsfattig skogsjord og bergsprekker'], lys: ['halvskygge til skygge'], fukt: ['frisk til fuktig'] },
      fenologi: { aktiv: ['hele året'], strategi: 'Eviggrønt, svært langlivet bartre som i Langebudalen vokser fleirstammet og krypende under et tykt, stabilt snødekke.' },
      kjennetegn: ['flate mørkegrønne nåler', 'rød frøkappe rundt ett frø', 'greiner uten kongler', 'kan danne krypende stammer og mange skudd'],
      økologi: { rolle: ['eviggrønt tre', 'strukturart i vernet forekomst', 'skjul og mikrohabitat'], samspill: ['lokalklima', 'granittberg', 'snødekke', 'skogbunn'] },
      bykontekst: { typiske_steder: [common.place], oslo_observert_typisk: 'Kortet er opprettet for den særpregede, høytliggende barlindforekomsten i Langebudalen.' },
      observasjonstips: ['Observer fra eksisterende ferdselslinje og på avstand.', 'Ikke ta nåler, greiner, bark eller andre plantedeler; vegetasjonen i reservatet er fredet.'],
      source_urls: [...common.sourceUrls, 'https://artsdatabanken.no/arter/takson/139448', lovdataUrl]
    }, 139448),
    withTaxonId({
      id: 'emne_bregne_bjonnkam',
      title: 'Bjønnkam',
      latin: 'Blechnum spicant',
      taxonomy: { norsk_navn: 'Bjønnkam', latin_navn: 'Blechnum spicant', klasse: 'Polypodiopsida', orden: 'Polypodiales', familie: 'Blechnaceae' },
      habitat: { biotop: ['næringsfattig skog', 'hei', 'fuktig skogbunn'], jord: ['sur og humusrik jord'], lys: ['skygge til halvskygge'], fukt: ['frisk til fuktig'] },
      fenologi: { aktiv: ['vår', 'sommer', 'høst'], strategi: 'Flerårig bregne med separate sterile og sporebærende blad.' },
      kjennetegn: ['smal rosett av vintergrønne blad', 'sterile blad ligger ofte utover bakken', 'sporeblad står mer opprett og er smalere', 'bladfliker sitter kamformet langs midtnerven'],
      økologi: { rolle: ['skogbunnplante', 'dekke i fuktig hei og skog'], samspill: ['sur jord', 'moser', 'fuktig mikroklima'] },
      bykontekst: { typiske_steder: [common.place], oslo_observert_typisk: 'Kortet er koblet til Kringoms dokumenterte kystplanteflora i Langebudalen.' },
      observasjonstips: ['Se etter kontrasten mellom brede sterile blad og smale opprette sporeblad.', 'La planten stå urørt i naturreservatet.'],
      source_urls: [...common.sourceUrls, 'https://artsdatabanken.no/arter/takson/217514']
    }, 217514),
    withTaxonId({
      id: 'emne_siv_heisiv',
      title: 'Heisiv',
      latin: 'Juncus squarrosus',
      taxonomy: { norsk_navn: 'Heisiv', latin_navn: 'Juncus squarrosus', klasse: 'Monocots', orden: 'Poales', familie: 'Juncaceae' },
      habitat: { biotop: ['hei', 'næringsfattig skog', 'fuktig beitemark'], jord: ['sur og næringsfattig jord'], lys: ['åpent til halvskygge'], fukt: ['frisk til fuktig'] },
      fenologi: { aktiv: ['sommer', 'høst'], strategi: 'Tuedannende siv som tåler sur og næringsfattig mark.' },
      kjennetegn: ['stiv tue med smale blad', 'bladene står ofte ut til sidene', 'brunlig blomsterstand nær toppen', 'seige, trådsmale blad'],
      økologi: { rolle: ['tuedannende heiplante', 'dekke på næringsfattig mark'], samspill: ['sur jord', 'hei', 'fuktig kystklima'] },
      bykontekst: { typiske_steder: [common.place], oslo_observert_typisk: 'Kortet er opprettet for den dokumenterte kystplanten i Langebudalen.' },
      observasjonstips: ['Se etter den stive, stjerneaktige tua i åpen skog eller hei.', 'Ikke tråkk inn i vegetasjonen for å komme nærmere.'],
      source_urls: [...common.sourceUrls, dynamicIds.heisiv ? `https://artsdatabanken.no/arter/takson/${dynamicIds.heisiv}` : 'https://artsdatabanken.no/arter']
    }, dynamicIds.heisiv),
    withTaxonId({
      id: 'emne_urt_kystmaure',
      title: 'Kystmaure',
      latin: 'Galium saxatile',
      taxonomy: { norsk_navn: 'Kystmaure', latin_navn: 'Galium saxatile', klasse: 'Magnoliopsida', orden: 'Gentianales', familie: 'Rubiaceae' },
      habitat: { biotop: ['hei', 'næringsfattig skog', 'berg og knauser'], jord: ['sur og mager jord'], lys: ['åpent til halvskygge'], fukt: ['frisk'] },
      fenologi: { aktiv: ['sommer'], strategi: 'Lav, krypende flerårig urt som danner matter på sur mark.' },
      kjennetegn: ['små hvite blomster', 'fire kronfliker', 'blad i kranser rundt stengelen', 'lav og krypende vekst'],
      økologi: { rolle: ['markdekkende urt', 'blomsterressurs for små insekter'], samspill: ['hei', 'sur jord', 'kystklima'] },
      bykontekst: { typiske_steder: [common.place], oslo_observert_typisk: 'Kortet er koblet til den dokumenterte kystfloraen i reservatet.' },
      observasjonstips: ['Se etter små hvite blomster over en lav matte.', 'Bruk foto eller kikkert fremfor å plukke planten.'],
      source_urls: [...common.sourceUrls, 'https://artsdatabanken.no/arter/takson/133374']
    }, 133374),
    withTaxonId({
      id: 'emne_bregne_smoretelg',
      title: 'Smørtelg',
      latin: 'Oreopteris limbosperma',
      taxonomy: { norsk_navn: 'Smørtelg', latin_navn: 'Oreopteris limbosperma', klasse: 'Polypodiopsida', orden: 'Polypodiales', familie: 'Thelypteridaceae' },
      habitat: { biotop: ['fuktig skog', 'bekkedal', 'skyggefull bergside'], jord: ['sur og humusrik jord'], lys: ['skygge til halvskygge'], fukt: ['fuktig'] },
      fenologi: { aktiv: ['vår', 'sommer', 'høst'], strategi: 'Flerårig bregne som danner store tuer i fuktig og skyggefull mark.' },
      kjennetegn: ['store gulgrønne blad i tue', 'bladplaten smalner tydelig mot basis', 'gule kjertler på undersiden', 'sporehoper sitter nær bladflikkens kant'],
      økologi: { rolle: ['skogbunnplante', 'dekke i fuktig mikrohabitat'], samspill: ['bekkesig', 'skygge', 'humusjord'] },
      bykontekst: { typiske_steder: [common.place], oslo_observert_typisk: 'Kortet er opprettet for Kringoms dokumenterte forekomst i Langebudalen.' },
      observasjonstips: ['Se etter store bregnetuer i fuktige søkk og langs berg.', 'Ikke bøy eller samle blad i reservatet.'],
      source_urls: [...common.sourceUrls, dynamicIds.smoretelg ? `https://artsdatabanken.no/arter/takson/${dynamicIds.smoretelg}` : 'https://artsdatabanken.no/arter']
    }, dynamicIds.smoretelg),
    withTaxonId({
      id: 'emne_urt_rome',
      title: 'Rome',
      latin: 'Narthecium ossifragum',
      taxonomy: { norsk_navn: 'Rome', latin_navn: 'Narthecium ossifragum', klasse: 'Monocots', orden: 'Dioscoreales', familie: 'Nartheciaceae' },
      habitat: { biotop: ['fuktig hei', 'myrkant', 'næringsfattig skog'], jord: ['sur, torv- og humusrik jord'], lys: ['åpent til halvskygge'], fukt: ['fuktig til våt'] },
      fenologi: { aktiv: ['sommer', 'høst'], strategi: 'Flerårig kystplante med jordstengel som kan danne tydelige bestander på fuktig mark.' },
      kjennetegn: ['gule stjerneformede blomster', 'blomster i tett aks', 'sverdformede blad', 'oransjebrune fruktstander utover høsten'],
      økologi: { rolle: ['blomsterplante i fuktig hei', 'ressurs for pollinerende insekter'], samspill: ['sur torvjord', 'kystnedbør', 'hei og myrkant'] },
      bykontekst: { typiske_steder: [common.place], oslo_observert_typisk: 'Kortet er koblet til den dokumenterte kystplantefloraen i Langebudalen.' },
      observasjonstips: ['Se etter gule blomsteraks i fuktige partier om sommeren.', 'Hold deg til eksisterende ferdselslinje for å unngå tråkk i våtmark.'],
      source_urls: [...common.sourceUrls, 'https://artsdatabanken.no/arter/takson/134764']
    }, 134764),
    withTaxonId({
      id: 'emne_kratt_klokkelyng',
      title: 'Klokkelyng',
      latin: 'Erica tetralix',
      taxonomy: { norsk_navn: 'Klokkelyng', latin_navn: 'Erica tetralix', klasse: 'Magnoliopsida', orden: 'Ericales', familie: 'Ericaceae' },
      habitat: { biotop: ['fuktig hei', 'myrkant', 'åpen næringsfattig skog'], jord: ['sur og torvrik jord'], lys: ['åpent til halvskygge'], fukt: ['fuktig'] },
      fenologi: { aktiv: ['sommer', 'høst'], strategi: 'Eviggrønn dvergbusk som trives i fuktig, sur kysthei.' },
      kjennetegn: ['rosa klokkeformede blomster', 'blomster samlet i toppstilt hode', 'nåleaktige blad i kranser på fire', 'lav busk med lodne unge skudd'],
      økologi: { rolle: ['dvergbusk i fuktig hei', 'nektarkilde for insekter'], samspill: ['sur jord', 'fuktig kystklima', 'pollinatorer'] },
      bykontekst: { typiske_steder: [common.place], oslo_observert_typisk: 'Kortet er opprettet for den dokumenterte kystplanten i Langebudalen.' },
      observasjonstips: ['Se etter rosa klokker i fuktig hei om sommeren.', 'Ikke plukk blomster eller plantedeler i naturreservatet.'],
      source_urls: [...common.sourceUrls, 'https://artsdatabanken.no/arter/takson/61748']
    }, 61748)
  ];
}

function makePlace({ lat, lon, sourceObjectId, sourceName, sourceFactsUrl }) {
  return [{
    id: PLACE_ID,
    name: 'Langebudalen naturreservat',
    lat,
    lon,
    r: 160,
    coordType: 'area_center',
    coordStatus: 'verified_geometry',
    coordSource: `Miljødirektoratet Naturvernområder – offisiell polygon for ${sourceName}`,
    coordVerifiedAt: TODAY,
    coordNote: 'Representativt områdeanker beregnet inne i Miljødirektoratets offisielle vernepolygon. Punktet representerer naturreservatet som areal og er ikke en parkeringsplass, stiinnkomst eller oppfordring til å forlate eksisterende ferdselslinjer.',
    locatorType: 'natural_area',
    sourceProvider: 'official_map',
    sourceObjectId,
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    category: 'natur',
    fylke: 'vestland',
    kommune: 'Etne',
    year: 2000,
    period: 'Naturreservat for barlind',
    tags: ['langebudalen', 'naturreservat', 'barlind', 'kystplanter', 'lokalklima', 'vernet_skog'],
    desc: 'Lite naturreservat ved Skromme i Etne, vernet for en uvanlig høytliggende forekomst av barlind. Den bratte dalen kombinerer lokalt varmt bergklima, stabilt snødekke og næringsfattig kystvegetasjon.',
    popupDesc: 'Langebudalen naturreservat ble fredet 13. oktober 2000 og omfatter om lag 17 dekar. Barlinda vokser omkring 550–600 meter over havet, blant de høyeste kjente forekomstene i Nord-Europa. Kringom forklarer forekomsten gjennom et gunstig lokalklima: dalen ligger skjermet mot kjølige vinder, mens store granittmasser lagrer varme. Barlinda har samtidig utviklet en lav, fleirstammet og krypende vekstform tilpasset et tykt og stabilt snødekke. Rundt den vokser kystplanter fra næringsfattig skog og hei, blant annet bjønnkam, heisiv, kystmaure, smørtelg, rome og klokkelyng. Hele vegetasjonen er fredet, og natur-rundingen skal brukes til observasjon uten plukking eller skade.',
    nature_profile: {
      type: 'barlindreservat / bratt dal / næringsfattig kystskog og hei',
      title: 'Barlind høyt over fjorden',
      summary: 'Langebudalen viser hvordan topografi og mikroklima kan flytte en varmekrevende art langt høyere enn normalt. Granittberget lagrer varme, dalen skjermer mot kald vind, og et stabilt snødekke former barlinda til fleirstammete, krypende individer. Natur-rundingen kobler barlindforekomsten til seks dokumenterte kystplanter og til vernet som beskytter hele vegetasjonen.',
      themes: ['barlind ved høydegrensen', 'lokalklima og varmelagrende granitt', 'snøtilpasset vekstform', 'kystplanter i næringsfattig skog og hei', 'naturreservat og plantelivsfredning'],
      nearby_place_ids: ['jettegrytene_rullestad', 'postvegen_rullestadjuvet', 'langfoss_etne']
    },
    quiz_profile: {
      place_type: 'naturreservat',
      subtype: 'hoytliggende_barlindforekomst_med_kystflora',
      signature_features: ['barlind 550–600 meter over havet', 'granittberg og skjermet dal gir gunstig lokalklima', 'fleirstammet krypende vekstform under stabilt snødekke', 'seks navngitte kystplanter i den øvrige vegetasjonen'],
      primary_angles: ['botanikk', 'lokalklima', 'tilpasning', 'naturvern'],
      question_families: ['art_og_levested', 'mikroklima', 'vekstform_og_sno', 'verneformaal'],
      avoid_angles: ['generisk_skogsquiz', 'oppfordring_til_plukking', 'udokumenterte_dyrearter'],
      must_include: ['hvorfor barlind kan vokse uvanlig høyt her', 'at all vegetasjon i reservatet er fredet'],
      contrast_targets: ['langfoss_etne', 'stordalsvatnet_etne'],
      notes: 'Skal spørres som botanisk verneområde og mikroklimatisk særtilfelle. Spilleren skal observere fra eksisterende ferdselslinje og aldri samle plantedeler.'
    },
    externalLinks: [
      { type: 'reference', label: 'Kringom – Langebudalen', url: kringomUrl, lang: 'nn', verifiedAt: TODAY },
      { type: 'official', label: 'Lovdata – fredningsforskriften', url: lovdataUrl, lang: 'nn', verifiedAt: TODAY },
      { type: 'official', label: 'Etne kommune – verna område', url: etneUrl, lang: 'nn', verifiedAt: TODAY },
      { type: 'official_map', label: 'Miljødirektoratet – naturvernområde', url: sourceFactsUrl || arcgisLayer, lang: 'nb', verifiedAt: TODAY }
    ],
    emne_ids: ['em_natur_arter_habitat_mangfold', 'em_natur_vern_forvaltning_politikk'],
    underbadge_ids: ['botanikk', 'biologisk_mangfold', 'naturvern', 'skog']
  }];
}

function makeEvidence({ lat, lon, sourceObjectId, sourceName, sourceFactsUrl, queryUrl, properties }) {
  return {
    schemaVersion: '1.0',
    placeId: PLACE_ID,
    placeFile: PLACE_REL,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: {
      lat, lon, r: 160,
      coordStatus: 'verified_geometry',
      coordSource: `Miljødirektoratet Naturvernområder – offisiell polygon for ${sourceName}`,
      coordType: 'area_center',
      coordNote: 'Representativt områdeanker beregnet inne i den offisielle vernepolygonen. Ikke et tilgangs-, parkerings- eller stipunkt.'
    },
    identity: {
      currentName: 'Langebudalen naturreservat',
      resolvedIdentity: sourceName,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'natural_area',
      requiresSplit: false,
      splitReason: ''
    },
    requiredEvidence: ['offisiell navngitt vernepolygon', 'stabilt verneområde-ID', 'representativt punkt inne i polygonet', 'kildebelagt verneformål for barlind'],
    evidence: [{
      sourceProvider: 'official_map',
      sourceName: 'Miljødirektoratet Naturvernområder',
      sourceUrl: sourceFactsUrl || queryUrl,
      sourceObjectId,
      sourceQuality: 'official_protected_area_polygon',
      finding: 'Miljødirektoratets åpne karttjeneste returnerer ett navngitt polygon for Langebudalen naturreservat. Representasjonspunktet er beregnet inne i polygonet og brukes som områdeanker.',
      canVerifyCoordinate: true,
      reason: 'Naturreservatet er et arealobjekt, og offisiell polygon med stabil identitet tilfredsstiller geometri- og kildekravet for verified_geometry.'
    }],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: 'official_map', sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [{
      geometryType: 'polygon',
      sourceProvider: 'official_map',
      sourceObjectId,
      sourceUrl: queryUrl,
      canApplyToPlace: true
    }],
    coordinateCandidates: [{ lat, lon, coordRole: 'area_anchor', canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Offisiell vernepolygon og representativt områdeanker er anvendt på canonical place.' },
    notes: [
      'Punktet er ikke en inngang eller parkeringsplass.',
      `Kildeegenskaper: ${JSON.stringify(properties)}`
    ]
  };
}

function makeFishTest() {
  return `const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const readText = relativePath => fs.readFileSync(path.join(repo, relativePath), 'utf8');

const manifest = readJson('data/natur/fauna/manifest.json');
assert(manifest.files.includes('fisk_etne.json'), 'Faunamanifestet skal laste fisk_etne.json');

const fish = readJson('data/natur/fauna/fisk_etne.json');
const expectedSpecies = {
  emne_fauna_laks: 'Salmo salar',
  emne_fauna_orret: 'Salmo trutta',
  emne_fauna_roye: 'Salvelinus alpinus',
  emne_fauna_al: 'Anguilla anguilla',
  emne_fauna_trepigget_stingsild: 'Gasterosteus aculeatus'
};

assert.strictEqual(fish.length, Object.keys(expectedSpecies).length, 'Batchen skal ha fem biologiske fiskearter');
for (const entry of fish) {
  assert.strictEqual(entry.latin, expectedSpecies[entry.id], `Uventet eller duplisert fiskeart: ${entry.id}`);
  assert.strictEqual(entry.taxonomy?.klasse, 'Actinopterygii', `${entry.id} skal identifiseres som strålefinnefisk`);
  assert(Number.isInteger(entry.taxonomy?.artskart_taxon_id), `${entry.id} mangler Artsdatabanken taxon-id`);
  assert(Array.isArray(entry.kjennetegn) && entry.kjennetegn.length >= 3, `${entry.id} mangler kjennetegn`);
  assert(Array.isArray(entry.observasjonstips) && entry.observasjonstips.length >= 1, `${entry.id} mangler observasjonstips`);
}

const placeMap = readJson('data/natur/nature_etne_place_map.json');
const expectedFishByPlace = {
  etneelva: ['emne_fauna_laks', 'emne_fauna_orret'],
  etneelva_forskningsplattform: ['emne_fauna_laks', 'emne_fauna_orret'],
  stordalsvatnet_etne: [
    'emne_fauna_laks',
    'emne_fauna_orret',
    'emne_fauna_roye',
    'emne_fauna_al',
    'emne_fauna_trepigget_stingsild'
  ]
};
for (const [placeId, speciesIds] of Object.entries(expectedFishByPlace)) {
  const fauna = placeMap.places[placeId]?.fauna || [];
  for (const speciesId of speciesIds) {
    assert(fauna.includes(speciesId), `${placeId} mangler fiskearten ${speciesId}`);
  }
}

const knownIds = new Set(fish.map(entry => entry.id));
for (const [placeId, speciesIds] of Object.entries(expectedFishByPlace)) {
  for (const speciesId of speciesIds) {
    assert(knownIds.has(speciesId), `${placeId} peker til ukjent fiskeart ${speciesId}`);
  }
}

const bridge = readText('js/nature_place_map_bridge.js');
assert(bridge.includes('"data/natur/nature_etne_place_map.json"'), 'Runtime skal laste Etne-artskartet');
assert(bridge.includes('klass.includes("actinopteryg")'), 'Fisk skal gjenkjennes fra taksonomisk klasse');
assert(bridge.includes('return "🐟"'), 'Fisk uten bilde skal få fiskeikon');
assert(bridge.includes('nature.floraItems.length + nature.faunaItems.length'), 'Natur-rundingen skal telle flora og fauna samlet');
assert(bridge.includes('window.openNatureCard({ ...item, _kind: kind })'), 'Fiskekort skal åpnes i fullt artskort');

console.log('Etne fish species round mapping OK');
`;
}

function makeLangebudalenTest() {
  return `const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const floraManifest = readJson('data/natur/flora/manifest.json');
assert(floraManifest.files.includes('${FLORA_FILE}'), 'Floramanifestet skal laste Langebudalen-plantene');

const flora = readJson('${FLORA_REL}');
const expected = {
  emne_ved_barlind: 'Taxus baccata',
  emne_bregne_bjonnkam: 'Blechnum spicant',
  emne_siv_heisiv: 'Juncus squarrosus',
  emne_urt_kystmaure: 'Galium saxatile',
  emne_bregne_smoretelg: 'Oreopteris limbosperma',
  emne_urt_rome: 'Narthecium ossifragum',
  emne_kratt_klokkelyng: 'Erica tetralix'
};
assert.strictEqual(flora.length, 7, 'Langebudalen skal ha sju kildebelagte karplanter');
for (const item of flora) {
  assert.strictEqual(item.latin, expected[item.id], `Uventet plante-ID eller latinsk navn: ${item.id}`);
  assert(Array.isArray(item.kjennetegn) && item.kjennetegn.length >= 3, `${item.id} mangler kjennetegn`);
  assert(Array.isArray(item.observasjonstips) && item.observasjonstips.length >= 2, `${item.id} mangler observasjonstips`);
  assert(item.source_urls.includes('${kringomUrl}'), `${item.id} mangler stedskilden Kringom`);
}

const placeManifest = readJson('data/places/manifest.json');
assert(placeManifest.files.includes('places/natur/vestland/langebudalen_naturreservat.json'));
const place = readJson('${PLACE_REL}')[0];
assert.strictEqual(place.id, '${PLACE_ID}');
assert.strictEqual(place.coordStatus, 'verified_geometry');
assert.strictEqual(place.sourceProvider, 'official_map');
assert(place.sourceObjectId, 'Langebudalen mangler stabilt kildeobjekt');
assert(place.nature_profile?.summary?.length >= 180, 'Langebudalen trenger langt naturinnhold');
assert(place.nature_profile?.themes?.length >= 5, 'Langebudalen trenger minst fem naturtemaer');

const map = readJson('data/natur/nature_etne_place_map.json');
assert.deepStrictEqual(map.places.${PLACE_ID}.flora, Object.keys(expected));
assert.deepStrictEqual(map.places.${PLACE_ID}.fauna, []);
assert(map.places.${PLACE_ID}.documentation.includes('Kringom'));

const evidence = readJson('${EVIDENCE_REL}');
assert.strictEqual(evidence.placeId, '${PLACE_ID}');
assert.strictEqual(evidence.evidenceStatus, 'applied_to_place');
assert.strictEqual(evidence.decision.canBecomeVerified, true);

console.log('Etne Langebudalen nature round mapping OK');
`;
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

const { feature, queryUrl } = await fetchLangebudalenFeature();
const properties = feature.properties || {};
const { lat, lon } = representativePoint(feature.geometry);
const officialName = String(pick(properties, ['offisieltNavn', 'navn', 'verneomradenavn']) || 'Langebudalen naturreservat');
const stableId = pick(properties, ['naturvernId', 'naturvernID', 'cddaId', 'cddaID', 'verneomradeId', 'verneområdeId', 'OBJECTID']);
const sourceObjectId = `miljodirektoratet-naturvern:${stableId || 'cdda-182963'}`;
const factsUrl = String(pick(properties, ['faktaark', 'faktaarkUrl', 'url']) || arcgisLayer);

if (!/langebudalen/i.test(officialName)) throw new Error(`Unexpected official feature: ${officialName}`);
if (!(lat > 58 && lat < 61 && lon > 4 && lon < 8)) throw new Error(`Official polygon centroid is outside expected Etne region: ${lat}, ${lon}`);

const dynamicIds = {
  heisiv: await lookupTaxonId('Juncus squarrosus'),
  smoretelg: await lookupTaxonId('Oreopteris limbosperma')
};

writeJson(PLACE_REL, makePlace({ lat, lon, sourceObjectId, sourceName: officialName, sourceFactsUrl: factsUrl }));
writeJson(FLORA_REL, makeFloraCards(dynamicIds));
writeJson(EVIDENCE_REL, makeEvidence({ lat, lon, sourceObjectId, sourceName: officialName, sourceFactsUrl: factsUrl, queryUrl, properties }));

const placeManifest = readJson('data/places/manifest.json');
const manifestPath = 'places/natur/vestland/langebudalen_naturreservat.json';
if (!placeManifest.files.includes(manifestPath)) placeManifest.files.push(manifestPath);
writeJson('data/places/manifest.json', placeManifest);

const floraManifest = readJson('data/natur/flora/manifest.json');
if (!floraManifest.files.includes(FLORA_FILE)) floraManifest.files.push(FLORA_FILE);
writeJson('data/natur/flora/manifest.json', floraManifest);

const natureMap = readJson('data/natur/nature_etne_place_map.json');
natureMap.meta.version = '0.5.0';
natureMap.meta.updatedAt = TODAY;
for (const source of [kringomUrl, lovdataUrl, etneUrl, arcgisLayer]) {
  if (!natureMap.meta.sources.includes(source)) natureMap.meta.sources.push(source);
}
natureMap.places[PLACE_ID] = {
  fauna: [],
  flora: ['emne_ved_barlind', 'emne_bregne_bjonnkam', 'emne_siv_heisiv', 'emne_urt_kystmaure', 'emne_bregne_smoretelg', 'emne_urt_rome', 'emne_kratt_klokkelyng'],
  documentation: 'Kringom dokumenterer barlind, bjønnkam, heisiv, kystmaure, smørtelg, rome og klokkelyng i Langebudalen. Lovdata dokumenterer naturreservatet, verneformålet, arealet på om lag 17 dekar og at vegetasjonen ikke skal skades eller fjernes.'
};
writeJson('data/natur/nature_etne_place_map.json', natureMap);

// Parsing and rewriting removes the obsolete duplicate nature_profile key while preserving the effective final profile.
writeJson('data/places/natur/vestland/etneelva.json', readJson('data/places/natur/vestland/etneelva.json'));
writeText('tests/etne-fish-species-rounds.test.js', makeFishTest());

const roundTestPath = 'tests/etne-nature-round-content.test.js';
let roundTest = fs.readFileSync(abs(roundTestPath), 'utf8');
if (!roundTest.includes(PLACE_REL)) {
  roundTest = roundTest.replace(
    "  'data/places/natur/vestland/stordalsvatnet_etne.json'",
    "  'data/places/natur/vestland/stordalsvatnet_etne.json',\n  'data/places/natur/vestland/langebudalen_naturreservat.json'"
  );
}
writeText(roundTestPath, roundTest);
writeText('tests/etne-langebudalen-nature-rounds.test.js', makeLangebudalenTest());

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(abs(protocolPath), 'utf8');
if (!protocol.includes(`\`${PLACE_ID}\``)) {
  protocol += `\n\n## Vestland – Etne\n\n| batch | placeId | navn | godkjent status | kildeobjekt |\n|---:|---|---|---|---|\n| 1 | \`${PLACE_ID}\` | Langebudalen naturreservat | verified_geometry | \`${sourceObjectId}\` |\n\nEtne batch 1 (2026-07-20) bruker Miljødirektoratets offisielle vernepolygon som områdegeometri. Representasjonspunktet ligger inne i polygonet og er ikke et tilgangs- eller parkeringspunkt.\n`;
}
writeText(protocolPath, protocol);

writeText('reports/etne-natur-batch-2-langebudalen.md', `# Etne natur batch 2 – Langebudalen\n\n## Sted\n\n- \`${PLACE_ID}\` – Langebudalen naturreservat\n- Offisiell geometri: Miljødirektoratet Naturvernområder\n- Kildeobjekt: \`${sourceObjectId}\`\n- Representativt områdeanker: \`${lat}, ${lon}\`\n- Fredet 13. oktober 2000, om lag 17 dekar\n\n## Dokumenterte planter\n\n- barlind – *Taxus baccata*\n- bjønnkam – *Blechnum spicant*\n- heisiv – *Juncus squarrosus*\n- kystmaure – *Galium saxatile*\n- smørtelg – *Oreopteris limbosperma*\n- rome – *Narthecium ossifragum*\n- klokkelyng – *Erica tetralix*\n\nArtsutvalget er begrenset til artene Kringom uttrykkelig navngir for Langebudalen. Det er ikke lagt inn antatte eller generiske skogsarter.\n\n## Tekniske rettelser\n\n- fjerner den overskrevne duplikate \`nature_profile\`-nøkkelen i \`etneelva.json\` ved kanonisk JSON-omskriving\n- gjør fisketesten robust mot senere dokumenterte fugleutvidelser ved å teste inklusjon av fiskearter, ikke eksakt total faunaliste\n\n## Kilder\n\n- ${kringomUrl}\n- ${lovdataUrl}\n- ${etneUrl}\n- ${arcgisLayer}\n`);

run('node', ['tests/etne-langebudalen-nature-rounds.test.js']);
run('node', ['tests/etne-fish-species-rounds.test.js']);
run('node', ['tests/etne-nature-round-content.test.js']);

console.log(`Langebudalen batch written at ${lat}, ${lon} from ${sourceObjectId}`);
