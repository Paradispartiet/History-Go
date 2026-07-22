import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ROOT = process.cwd();
const SOURCE_PATH = join(ROOT, 'data/places/subkultur/oslo/places_subkultur.json');
const REPORT_DIR = join(ROOT, 'reports/subkultur-oslo-randsoner-batch-02');
const GEO_DIR = join(REPORT_DIR, 'geonorge');
const VERIFIED_AT = '2026-07-22';

function normalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'History-Go-data-pipeline/1.0',
      accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function geonorgeAddress({ key, street, number, letter = '', postcode }) {
  const attempts = [
    new URL('https://ws.geonorge.no/adresser/v1/sok'),
    new URL('https://ws.geonorge.no/adresser/v1/sok'),
  ];

  attempts[0].searchParams.set('adressenavn', street);
  attempts[0].searchParams.set('nummer', number);
  if (letter) attempts[0].searchParams.set('bokstav', letter);
  attempts[0].searchParams.set('kommunenummer', '0301');
  attempts[0].searchParams.set('treffPerSide', '100');

  attempts[1].searchParams.set('sok', `${street} ${number}${letter} Oslo`);
  attempts[1].searchParams.set('kommunenummer', '0301');
  attempts[1].searchParams.set('treffPerSide', '100');

  const evidence = [];
  for (const url of attempts) {
    const data = await fetchJson(url);
    evidence.push({ url: url.toString(), data });
    const rows = Array.isArray(data?.adresser) ? data.adresser : [];
    const exact = rows.filter((row) => {
      const streetOk = normalize(row?.adressenavn || row?.adressetekst || '').includes(normalize(street));
      const numberOk = Number(row?.nummer) === Number(number);
      const letterOk = normalize(row?.bokstav || '') === normalize(letter || '');
      const postcodeOk = !postcode || String(row?.postnummer || '') === String(postcode);
      const kommuneOk = String(row?.kommunenummer || row?.kommune?.kommunenummer || '') === '0301';
      return streetOk && numberOk && letterOk && postcodeOk && kommuneOk;
    });
    if (exact.length === 1) {
      await mkdir(GEO_DIR, { recursive: true });
      await writeFile(join(GEO_DIR, `${key}.json`), `${JSON.stringify({ query: evidence, selected: exact[0] }, null, 2)}\n`, 'utf8');
      return { row: exact[0], url: url.toString() };
    }
  }

  await mkdir(GEO_DIR, { recursive: true });
  await writeFile(join(GEO_DIR, `${key}.json`), `${JSON.stringify({ query: evidence, error: 'No unique exact match' }, null, 2)}\n`, 'utf8');
  throw new Error(`No unique exact Geonorge address match for ${street} ${number}${letter}`);
}

function officialAddressFields(result, { street, number, letter = '', postcode }) {
  const row = result.row;
  const point = row?.representasjonspunkt;
  const lat = Number(point?.lat);
  const lon = Number(point?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error(`Missing Geonorge representation point for ${street} ${number}${letter}`);
  }
  const addressCode = row?.adressekode;
  const sourceObjectId = `geonorge-adresser-v1:0301:${addressCode}:${number}${letter}`;
  return {
    lat,
    lon,
    coordType: 'address_point',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: sourceObjectId,
    coordSourceUrl: result.url,
    coordStatus: 'verified',
    coordVerifiedAt: VERIFIED_AT,
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId,
    address: {
      street,
      number: `${number}${letter}`,
      postcode,
      city: 'Oslo',
      country: 'NO',
    },
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
  };
}

function placeQuizProfile({ placeType, subtype, signatures, angles, avoid, include, contrasts, notes }) {
  return {
    place_type: placeType,
    subtype,
    signature_features: signatures,
    primary_angles: angles,
    question_families: ['bruk', 'sosial_geografi', 'konflikt_og_kontroll', 'historisk_endring'],
    avoid_angles: avoid,
    must_include: include,
    contrast_targets: contrasts,
    notes,
  };
}

await mkdir(REPORT_DIR, { recursive: true });

const [prindsenGeo, fyrlysetGeo, evangeliesenteretGeo] = await Promise.all([
  geonorgeAddress({ key: 'prindsen_mottakssenter', street: 'Hausmanns gate', number: '11', postcode: '0182' }),
  geonorgeAddress({ key: 'fyrlyset_oslo', street: 'Urtegata', number: '16', letter: 'A', postcode: '0187' }),
  geonorgeAddress({ key: 'evangeliesenteret_kontaktsenter_oslo', street: "Osterhaus' gate", number: '1', postcode: '0183' }),
]);

const places = JSON.parse(await readFile(SOURCE_PATH, 'utf8'));
if (!Array.isArray(places)) throw new Error('Expected places_subkultur.json to be an array.');

const candidates = [
  {
    id: 'plata_oslo',
    name: 'Plata',
    lat: 59.91025,
    lon: 10.75037,
    r: 110,
    category: 'subkultur',
    year: 1998,
    desc: 'Historisk åpen russcene ved Oslo S – et sosialt territorium, omsetningssted og møtepunkt for mennesker i Oslos tunge rusmiljø.',
    popupDesc: 'Plata var det folkelige navnet på delen av Christian Frederiks plass ved Oslo S som fra slutten av 1990-årene ble et av Norges mest kjente åpne rusmiljøer. Stedet var både et sentrum for ulovlig rusomsetning og et sosialt møtepunkt for mennesker som ofte manglet andre stabile offentlige rom. Historien om Plata handler derfor ikke bare om narkotika, men om tilhørighet, synlighet, kontroll og hvordan marginaliserte miljøer flyttes gjennom byen når politi og myndigheter forsøker å oppløse åpne russcener.\n\nI History Go skal Plata leses som en del av Oslos uoffisielle sosiale geografi: et sted mange opplevde som utrygt, men som samtidig var et viktig fellesskap og orienteringspunkt for menneskene som brukte det. Spørsmål bør undersøke forholdet mellom åpen russcene, gatefellesskap, politiaksjoner og retten til å eksistere i sentrale byrom – uten å romantisere rus eller redusere mennesker til et problem.',
    emne_ids: ['em_sub_marginalisering', 'em_sub_rett_til_byen'],
    underbadge_ids: ['rusmiljo_og_gatefellesskap', 'gatekultur_og_territorier'],
    quiz_profile: placeQuizProfile({
      placeType: 'historisk_moteplass',
      subtype: 'apen_russcene_og_sosialt_territorium',
      signatures: [
        'historisk åpen russcene ved Christian Frederiks plass og Oslo S',
        'både omsetningssted og sosial møteplass',
        'sentral i historien om kontroll, politiaksjoner og fortrengning av rusmiljøer i sentrum',
      ],
      angles: ['marginalisering', 'gatefellesskap', 'kontroll_og_fortrengning', 'retten_til_byen'],
      avoid: ['sensasjonalisering', 'romantisering_av_rus', 'kun_kriminalitet'],
      include: ['dobbelrollen som omsetningssted og sosial møteplass', 'hvordan kontroll og politiaksjoner flyttet miljøet gjennom byen'],
      contrasts: ['prindsen_mottakssenter', 'fyrlyset_oslo', 'oslo_s'],
      notes: 'Spør som historisk sosialt territorium og åpen russcene, ikke som kuriositet eller kriminalitetskulisse.',
    }),
    coordType: 'historical_site_anchor',
    coordSource: 'Lokalhistoriewiki – Plata (Oslo), koordinatfestet til den historiske Plata-delen av Christian Frederiks plass; fysisk plassering kryssjekket mot Oslo kommune – Christian Frederiks plass.',
    coordSourceId: 'lokalhistoriewiki:plata-oslo',
    coordSourceUrl: 'https://lokalhistoriewiki.no/wiki/Plata_%28Oslo%29',
    coordStatus: 'verified_historical_source',
    coordVerifiedAt: VERIFIED_AT,
    coordNote: 'Historisk områdeanker. Lokalhistoriewiki oppgir koordinatene 59.91025, 10.75037 for Plata ved Christian Frederiks plass. Punktet representerer den dokumenterte historiske russcenen som område, ikke en eksakt posisjon for enkeltpersoner eller hendelser.',
    locatorType: 'historic_site',
    sourceProvider: 'manual_research',
    sourceObjectId: 'lokalhistoriewiki:plata-oslo',
    geocodeAccuracy: 'historical_approximation',
    coordRole: 'historical_anchor',
    externalLinks: [
      { type: 'local_history', label: 'Lokalhistoriewiki – Plata (Oslo)', url: 'https://lokalhistoriewiki.no/wiki/Plata_%28Oslo%29', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'official', label: 'Oslo kommune – Christian Frederiks plass', url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/christian-frederiks-plass/', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'history', label: 'Foreningen for human ruspolitikk – Rus og redsel ved Oslo S', url: 'https://humanruspolitikk.no/rus-og-redsel-ved-oslo-s/', lang: 'nb', verifiedAt: VERIFIED_AT },
    ],
  },
  {
    id: 'prindsen_mottakssenter',
    name: 'Prindsen mottakssenter',
    ...officialAddressFields(prindsenGeo, { street: 'Hausmanns gate', number: '11', postcode: '0182' }),
    r: 60,
    category: 'subkultur',
    year: 2012,
    desc: 'Kommunalt lavterskel- og skadereduksjonstilbud for mennesker med tilhørighet til rus- og gatemiljøet i Oslo sentrum.',
    popupDesc: 'Prindsen mottakssenter samler flere av Oslos mest sentrale lavterskeltilbud for mennesker med rusrelaterte utfordringer. Her finnes blant annet brukerrom, feltpleie, smittevern og akuttovernatting. Senteret ble etablert i 2012 ved å samordne tjenester som tidligere var mer spredt, og ligger midt i den sentrumsgeografien der hjelpeapparat og åpent rusmiljø møtes.\n\nI History Go er Prindsen viktig som sosial infrastruktur i en subkulturell randsone. Stedet viser at undergrunn og marginalisering ikke bare består av uformelle møteplasser: det finnes også konkrete støttepunkter bygget rundt skadereduksjon, helse og overlevelse. Spørsmål bør handle om forholdet mellom gatemiljø, lavterskel hjelp, brukerrom og retten til et verdig sted i byen – ikke behandle menneskene som bruker tilbudet som kulisse.',
    emne_ids: ['em_sub_marginalisering', 'em_sub_rett_til_byen'],
    underbadge_ids: ['lavterskel_og_sosiale_randsoner', 'rusmiljo_og_gatefellesskap'],
    quiz_profile: placeQuizProfile({
      placeType: 'lavterskelsenter',
      subtype: 'skadereduserende_stottepunkt_i_rus_og_gatemiljo',
      signatures: ['brukerrom og skadereduksjon', 'feltpleie og smittevern', 'møtepunkt mellom formelt hjelpeapparat og rus- og gatemiljø'],
      angles: ['skadereduksjon', 'sosial_infrastruktur', 'rus_og_gatemiljo', 'retten_til_byen'],
      avoid: ['institusjonell_brosjyretekst', 'moraliserende_rusvinkel', 'romantisering'],
      include: ['lavterskeltilbudenes konkrete funksjon', 'forholdet mellom formell hjelp og gatemiljø'],
      contrasts: ['plata_oslo', 'fyrlyset_oslo', 'evangeliesenteret_kontaktsenter_oslo'],
      notes: 'Spør som skadereduserende sosial infrastruktur i et marginalisert bymiljø, ikke bare som kommunal institusjon.',
    }),
    coordNote: 'Address-first: Oslo kommune oppgir Hausmanns gate 11 som besøksadresse. Eksakt Geonorge-adressetreff brukes som canonical display-marker.',
    externalLinks: [
      { type: 'official', label: 'Oslo kommune – Prindsen mottakssenter', url: 'https://www.oslo.kommune.no/helse-og-omsorg/rustjenester/alle-rusinstitusjoner/prindsen-mottakssenter/', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'organization', label: 'Rusfeltets hovedorganisasjon – Prindsen', url: 'https://www.rusfeltet.no/arkiv/trenger-trygge-arbeidsteam-i-mote-med-mennesker-i-kaos', lang: 'nb', verifiedAt: VERIFIED_AT },
    ],
  },
  {
    id: 'fyrlyset_oslo',
    name: 'Fyrlyset',
    ...officialAddressFields(fyrlysetGeo, { street: 'Urtegata', number: '16', letter: 'A', postcode: '0187' }),
    r: 60,
    category: 'subkultur',
    desc: 'Langvarig lavterskel kontaktsenter i Urtegata for mennesker med rusproblemer – mat, klær, hygiene, omsorg og sosialt fellesskap.',
    popupDesc: 'Fyrlyset i Urtegata er et av Oslos langvarige lavterskelsteder for mennesker med rusproblemer. Her dekkes grunnleggende behov som mat, drikke, klær og hygiene, og stedet fungerer samtidig som et sosialt rom der mennesker kan komme inn fra gata uten krav om rusfrihet. Frelsesarmeens egne kilder dokumenterer at Fyrlyset var i drift allerede tidlig på 1980-tallet.\n\nI History Go er Fyrlyset viktig fordi det ligger i skjæringspunktet mellom hjelp, gatefellesskap og bykonflikt. Lavterskelsteder påvirker byrommet rundt seg fordi de samler mennesker som ellers ofte blir forsøkt flyttet videre. Spørsmål bør undersøke hvordan støtte, tilhørighet, nabolag og marginalisering møtes på samme adresse – uten å gjøre rusmiljøet til en eksotisk underverden.',
    emne_ids: ['em_sub_marginalisering', 'em_sub_rett_til_byen'],
    underbadge_ids: ['lavterskel_og_sosiale_randsoner', 'rusmiljo_og_gatefellesskap'],
    quiz_profile: placeQuizProfile({
      placeType: 'lavterskel_kontaktsenter',
      subtype: 'gatenart_stottepunkt_og_moteplass',
      signatures: ['mat, klær og hygiene uten krav om rusfrihet', 'langvarig tilstedeværelse i Urtegata', 'sosial møteplass tett på byens rus- og gatemiljø'],
      angles: ['grunnleggende_behov', 'gatefellesskap', 'lavterskel', 'nabolag_og_retten_til_byen'],
      avoid: ['sensasjonalisering', 'romantisering_av_rus', 'a_gi_tilbudet_skyld_for_alt_i_nabolaget'],
      include: ['stedets rolle som både hjelpetilbud og sosial møteplass', 'spenningen mellom tilhørighet, nabolag og marginalisering'],
      contrasts: ['prindsen_mottakssenter', 'plata_oslo', 'evangeliesenteret_kontaktsenter_oslo'],
      notes: 'Spør som langvarig lavterskel møteplass i rus- og gatemiljøet, ikke som veldedighetsbrosjyre.',
    }),
    coordNote: 'Address-first: Frelsesarmeen og Oslo kommune oppgir Urtegata 16 A. Eksakt Geonorge-adressetreff brukes som canonical display-marker.',
    externalLinks: [
      { type: 'official', label: 'Frelsesarmeen – Fyrlyset Oslo', url: 'https://frelsesarmeen.no/rusomsorg/fyrlyset-oslo', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'history', label: 'Frelsesarmeen – dokumentert Fyrlyset-virksomhet i 1982', url: 'https://frelsesarmeen.no/aktuelt/frode-woldsund-er-tildelt-kongens-fortjenstmedalje', lang: 'nb', verifiedAt: VERIFIED_AT },
    ],
  },
  {
    id: 'evangeliesenteret_kontaktsenter_oslo',
    name: 'Evangeliesenterets kontaktsenter',
    ...officialAddressFields(evangeliesenteretGeo, { street: "Osterhaus' gate", number: '1', postcode: '0183' }),
    r: 60,
    category: 'subkultur',
    desc: 'Lavterskel kontaktsenter i Osterhaus’ gate med mat, klær, sosialt fellesskap, oppsøkende arbeid og hjelp videre til behandling.',
    popupDesc: 'Evangeliesenterets kontaktsenter i Oslo er en kontaktkafé og lavterskel møteplass for mennesker som strever med rusavhengighet og for enkelte andre utsatte grupper. Stedet serverer varm mat, deler ut matposer og klær, tilbyr sosialt fellesskap og samtaler, og driver også oppsøkende arbeid i byen. Sosionomtjenesten kan hjelpe mennesker videre mot avrusning og rehabilitering.\n\nI History Go er stedet relevant fordi det viser infrastrukturen rundt byens marginaliserte miljøer: ikke bare de synlige møteplassene i gata, men rommene som gir mat, samtale og en vei videre. Spørsmål bør handle om hvordan frivillighet, lavterskel hjelp og gatekontakt virker sammen, og hvordan slike steder blir viktige noder i den uoffisielle sosiale geografien.',
    emne_ids: ['em_sub_marginalisering', 'em_sub_tilhorighet_miljo'],
    underbadge_ids: ['lavterskel_og_sosiale_randsoner', 'rusmiljo_og_gatefellesskap'],
    quiz_profile: placeQuizProfile({
      placeType: 'lavterskel_kontaktsenter',
      subtype: 'mat_omsorg_og_gatekontakt',
      signatures: ['varm mat og utdeling av mat og klær', 'kontaktkafé og sosial møteplass', 'oppsøkende arbeid og hjelp videre mot behandling'],
      angles: ['lavterskel', 'frivillighet', 'gatekontakt', 'veien_videre'],
      avoid: ['forkynnelsesbrosjyre', 'stigmatisering', 'generisk_veldedighet'],
      include: ['stedets konkrete lavterskelfunksjoner', 'koblingen mellom kontaktsted, gatearbeid og videre hjelp'],
      contrasts: ['fyrlyset_oslo', 'prindsen_mottakssenter', 'plata_oslo'],
      notes: 'Spør som sosialt støttepunkt i byens randsoner, ikke som generell organisasjonspresentasjon.',
    }),
    coordNote: 'Address-first: Evangeliesenteret og Brønnøysundregistrene oppgir Osterhaus’ gate 1. Eksakt Geonorge-adressetreff brukes som canonical display-marker.',
    externalLinks: [
      { type: 'official', label: 'Evangeliesenteret – Kontaktsenter Oslo', url: 'https://www.evangeliesenteret.no/kontaktsenter/oslo', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'registry', label: 'Brønnøysundregistrene – Evangeliesenterets kontaktsenter Oslo', url: 'https://virksomhet.brreg.no/en/oppslag/underenheter/921054637', lang: 'nb', verifiedAt: VERIFIED_AT },
      { type: 'official', label: 'Oslo kommune – mottak av overskuddsmat', url: 'https://www.oslo.kommune.no/helse-og-omsorg/fag-og-kompetanse/ernaring/mottak-av-overskuddsmat/', lang: 'nb', verifiedAt: VERIFIED_AT },
    ],
  },
];

const existingIds = new Set(places.map((place) => place?.id).filter(Boolean));
for (const candidate of candidates) {
  if (existingIds.has(candidate.id)) throw new Error(`Refusing to overwrite existing place id: ${candidate.id}`);
  places.push(candidate);
  existingIds.add(candidate.id);
}

await writeFile(SOURCE_PATH, `${JSON.stringify(places, null, 2)}\n`, 'utf8');

const report = `# Subkultur Oslo – randsoner batch 02\n\nDato: ${VERIFIED_AT}\n\n## Lagt til\n\n${candidates.map((p) => `- \`${p.id}\` – ${p.name}`).join('\n')}\n\n## Redaksjonell avgrensning\n\nBatchen utvider Subkultur med dokumenterte sosiale randsoner og støttepunkter. Stedstekstene skiller mellom historisk åpen russcene, sosial møteplass og lavterskel hjelpeinfrastruktur, og unngår å romantisere eller stigmatisere menneskene som bruker stedene.\n\n## Koordinater\n\n- Plata bruker et dokumentert historisk områdeanker fra Lokalhistoriewiki, kryssjekket mot Oslo kommunes beskrivelse av Christian Frederiks plass.\n- Prindsen, Fyrlyset og Evangeliesenterets kontaktsenter bruker eksakte Geonorge-adressepunkter hentet address-first i denne batchen. Rå Geonorge-svar er lagret under \`reports/subkultur-oslo-randsoner-batch-02/geonorge/\`.\n\n## Bevisst utsatt\n\n- Brugata/Storgata-rusmiljøet legges ikke inn som ny markør i denne batchen. \`storgata\` finnes allerede som canonical fysisk sted under By, og en egen oppfølging må avgjøre om Subkultur skal legges som sekundært lag på eksisterende sted eller om et separat sosialhistorisk anker er nødvendig.\n`;

await writeFile(join(REPORT_DIR, 'README.md'), report, 'utf8');
console.log(`Added ${candidates.length} Subkultur places and wrote coordinate evidence.`);
