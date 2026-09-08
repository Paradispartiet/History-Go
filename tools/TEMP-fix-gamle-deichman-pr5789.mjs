import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const verifiedAt = '2026-09-08';
const placeId = 'gamle_deichman';
const placeFile = 'data/places/litteratur/oslo/places_litteratur/gamle_deichman.json';
const workcardFile = 'reports/place-production/gamle-deichman-workcard-current.json';
const productionFile = 'data/places/production/gamle_deichman.json';
const registryFile = 'data/fagverk/fagverk_registry.json';
const brandsMasterFile = 'data/brands/brands_master.json';
const brandsByPlaceFile = 'data/brands/brands_by_place.json';
const brandId = 'deichmanske_bibliotek_hammersborg';
const brandAsset = 'bilder/kort/brands/deichmanske_bibliotek_hammersborg.webp';

const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const upsertById = (rows, value) => {
  const index = rows.findIndex((row) => row?.id === value.id);
  if (index >= 0) rows[index] = value;
  else rows.push(value);
};

const place = read(placeFile);
delete place.cardImage;
place.place_card_profile = {
  schema: 'history_go_place_card_profile_v2',
  production_profile: 'standard',
  collection_ids: ['people', 'objects', 'brands', 'productions'],
  category_collection_label: 'Bøker og tekster',
  reason: 'Tre direkte personroller, Axel Revolds stedbundne freske, den historiske institusjonsidentiteten Deichmanske bibliotek og Deichman-katalogen fra 1935 gir fire kildebårne litteratursamlinger uten filler.',
  verifiedAt
};
place.productions = [
  {
    id: 'gamle_deichman_nordisk_skjonnlitteratur_i_utvalg_1935',
    title: 'Nordisk skjønnlitteratur i utvalg',
    name: 'Nordisk skjønnlitteratur i utvalg',
    type: 'bibliography',
    kind: 'library_catalogue',
    year: 1935,
    desc: 'Deichmanske bibliotek utga i 1935 katalogen «Nordisk skjønnlitteratur i utvalg», også registrert som «Deichman-katalogen, 1935–36». Den dokumenterer bibliotekets egen litteraturformidling i Hammersborg-perioden.',
    placeSpecific: true,
    placeSpecificReason: 'Katalogpostene tilskriver utgivelsen Deichmanske bibliotek i Oslo og daterer den til 1935, mens Hammersborg-bygget var hovedbibliotek.',
    source_urls: [
      'https://kansalliskirjasto.finna.fi/Record/fikka.1888331',
      'https://openlibrary.org/works/OL36940822W/Nordisk_skj%C3%B8nnlitteratur_i_utvalg_...',
      'https://runeberg.org/biblblad/1935/'
    ]
  }
];
for (const item of [
  { type: 'source', label: 'Finna – Nordisk skjønnlitteratur i utvalg (1935)', url: 'https://kansalliskirjasto.finna.fi/Record/fikka.1888331', verifiedAt },
  { type: 'source', label: 'Open Library – Deichman-katalogen, 1935–36', url: 'https://openlibrary.org/works/OL36940822W/Nordisk_skj%C3%B8nnlitteratur_i_utvalg_...', verifiedAt }
]) {
  if (!place.externalLinks.some((row) => row.url === item.url)) place.externalLinks.push(item);
}

const fagverk = place.fagverk;
fagverk.emne_ids = fagverk.emne_ids.filter((id) => id !== 'em_lit_nordisk_bibliotek_leserhistorie_formidling');
fagverk.chapter_ids = [
  'lesekultur_bokdeling_offentlighet',
  'byliv-offentlige-rom',
  'arkitektur-type-skala-byform'
];
const lensUpdates = {
  gamle_deichman_linse_institusjon: {
    prompt: 'Hvordan endres tolkningen når du skiller Deichman som institusjon fra 1785 fra Hammersborg-bygget som åpnet i 1933?',
    evidence: 'Oslo kommune dokumenterer institusjonsgrunnlaget fra 1785 og skiller dette tydelig fra Hammersborg-bygget som stod ferdig i 1933.'
  },
  gamle_deichman_linse_offentlighet: {
    prompt: 'Hvordan organiserte lesesaler, utlån og samlinger Hammersborg-bygget som et offentlig rom for litteratur og lesing?',
    evidence: 'Oslo kommunes historie beskriver hovedbibliotekets lesesaler, utlån og samlingsfunksjoner som del av det kommunale folkebiblioteket.'
  },
  gamle_deichman_linse_arkitektur: {
    prompt: 'Hvordan kan du se at den bratte tomten påvirket trapper, hall og bevegelse gjennom bibliotekbygningen?',
    evidence: 'Norsk kunstnerleksikon knytter de monumentale trappene direkte til den sterkt skrånende tomten og beskriver sentralhallen med gallerier.'
  },
  gamle_deichman_linse_utsmykning: {
    prompt: 'Hvordan kan Axel Revolds freske leses som en fysisk iscenesettelse av bibliotekets idé om kunnskap og litteratur?',
    evidence: 'Norsk kunstnerleksikon dokumenterer Revolds store freske fra 1932 og oppgir temaene teknikk, vitenskap og diktning i bibliotekets utlånssal.'
  },
  gamle_deichman_linse_ombruk: {
    prompt: 'Hva blir synlig når du sammenligner biblioteksepoken 1933–2019 med den planlagte transformasjonen uten å omtale 2028 som fullført?',
    evidence: 'Fotohuset Deich skiller eksplisitt bibliotekperioden 1933–2019 fra transformasjonen som fortsatt presenteres med planlagt velkomst i 2028.'
  }
};
for (const lens of fagverk.lenses) Object.assign(lens, lensUpdates[lens.id] || {});
fagverk.observable_traces = [
  {
    title: 'Monumentale trappeløp',
    observation: 'Følg den lange stigningen og de monumentale trappeløpene som tar opp terrengforskjellen rundt bibliotekbygningen.',
    interpretation_boundary: 'Trappeløpene dokumenterer arkitektonisk terrengtilpasning, men de beviser ikke alene hvordan ulike brukergrupper opplevde tilgjengeligheten.',
    source_urls: ['https://nkl.snl.no/Nils_Reiersen', 'https://magasin.oslo.kommune.no/byplan/et-hus-med-mange-muligheter']
  },
  {
    title: 'Sentralhall og gallerier',
    observation: 'Undersøk sentralhallens høyde, gallerier og romlige organisering rundt bibliotekets historiske samlings- og utlånsfunksjoner.',
    interpretation_boundary: 'Romorganiseringen viser arkitektoniske prioriteringer, men dokumenterer ikke i seg selv hvem som faktisk brukte hallen til ulike tider.',
    source_urls: ['https://nkl.snl.no/Nils_Reiersen', 'https://magasin.oslo.kommune.no/byplan/et-hus-med-mange-muligheter']
  },
  {
    title: 'Revolds kunnskapsfreske',
    observation: 'Se hvordan teknikk, vitenskap og diktning er samlet som navngitte temaer i Axel Revolds stedbundne freske fra 1932.',
    interpretation_boundary: 'De dokumenterte motivene viser et kunstnerisk program, men kan ikke alene brukes som fullstendig rangering av bibliotekets kunnskapsformer.',
    source_urls: ['https://nkl.snl.no/Axel_Revold', 'https://magasin.oslo.kommune.no/byplan/et-hus-med-mange-muligheter']
  }
];
write(placeFile, place);

const brandsMaster = read(brandsMasterFile);
upsertById(brandsMaster, {
  id: brandId,
  name: 'Deichmanske bibliotek',
  aliases: ['Deichman', 'Deichmanske Bibliotek'],
  brand_group: 'institution_brand',
  brand_type: 'historic_institution_brand',
  brand_kind: 'public_library_identity',
  sector: 'libraries_and_literature',
  state: 'catalog',
  status: 'historical',
  verification: 'verified',
  verified_at: verifiedAt,
  desc: 'Den historiske institusjonsidentiteten «Deichmanske bibliotek» slik den er synlig på Hammersborg-byggets fasadeskilt.',
  popupdesc: 'Brand-kortet gjelder den historiske institusjonsidentiteten på Hammersborg, ikke et påstått moderne logo-samarbeid. Det lokale brandmerket er et rent utsnitt av det autentiske «DEICHMANSKE BIBLIOTEK»-skiltet i Mahlums offentlig-domene-foto av bygningen.',
  tags: ['brand', 'library', 'literature', 'oslo', 'historical_identity', 'gamle_deichman'],
  place_ids: [placeId],
  source_urls: [
    'https://magasin.oslo.kommune.no/byplan/et-hus-med-mange-muligheter',
    'https://snl.no/Deichman_%28bibliotek%29',
    'https://commons.wikimedia.org/wiki/File:Deichman_V.jpg'
  ],
  logo: brandAsset,
  imageMeta: {
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Deichman_V.jpg',
    creator: 'Mahlum',
    credit: 'Mahlum / Wikimedia Commons',
    rightsBasis: 'public_domain_source_photo_with_authentic_facade_wordmark',
    license: 'Public domain',
    reviewStatus: 'manually_approved',
    assetKind: 'authentic_historic_architectural_wordmark',
    sourceForm: 'deichmanske_bibliotek_facade_sign',
    temporalScope: 'historical_hammersborg_identity',
    usageContext: 'referential_identification',
    noEndorsement: true,
    generated: false,
    reconstructed: false,
    transformation: 'Kun beskjæring, proporsjonal skalering og WebP-normalisering av det autentiske fasadeskiltet; ingen rekonstruksjon eller redesign.',
    outputDimensions: '900x520',
    reviewedAt: verifiedAt
  }
});
write(brandsMasterFile, brandsMaster);

const brandsByPlace = read(brandsByPlaceFile);
brandsByPlace[placeId] = Array.from(new Set([...(brandsByPlace[placeId] || []), brandId])).sort();
write(brandsByPlaceFile, brandsByPlace);

const registry = read(registryFile);
if (!registry.subjects.litteratur) {
  registry.subjects.litteratur = {
    title: 'Litteratur',
    description: 'Et tekst-, verk-, sted- og institusjonsbasert fagverk om litterære former, historie, språk, sirkulasjon, lesere, offentlighet og litteraturfelt.',
    canonicalModel: {
      manifest: 'data/fag/fag_manifest.json',
      schemaFamily: 'standard_canonical',
      sourceOfTruth: true,
      note: 'Canonical Litteratur-data eies av fag_manifest, emne-, fagkart- og metodefilene. Det eksisterende fulltekstkapittelet om lesekultur, bokdeling og offentlighet er registrert her som operativt kapittel for stedlig litteratur- og bibliotekkobling.'
    },
    chapters: []
  };
}
const literatureChapter = {
  id: 'lesekultur_bokdeling_offentlighet',
  title: 'Lesekultur, bokdeling og offentlighet',
  subtitle: 'Tilgang, sirkulasjon, bibliotek og litterære møteplasser',
  file: 'data/fagverk/litteratur/lesekultur_bokdeling_offentlighet.json',
  primary_domain_id: 'sted_leser_offentlighet',
  chapter_role: 'core',
  emne_ids: [
    'em_lit_litteraturfelt_institusjoner',
    'em_lit_lesere_offentlighet_formidling',
    'em_lit_litteraere_steder_og_bytekst'
  ]
};
registry.subjects.litteratur.chapters ||= [];
upsertById(registry.subjects.litteratur.chapters, literatureChapter);
registry.placeLinks[placeId] = {
  sourceFile: 'places/litteratur/oslo/places_litteratur/gamle_deichman.json',
  field: 'fagverk',
  schema: place.fagverk.schema,
  level: place.fagverk.level,
  status: place.fagverk.status
};
registry.updatedAt = verifiedAt;
write(registryFile, registry);

if (fs.existsSync(path.join(root, productionFile))) {
  const production = read(productionFile);
  production.collections = {
    people: ['carl_deichman', 'nils_reiersen', 'axel_revold'],
    objects: ['gamle_deichman_revold_freske'],
    brands: [brandId],
    productions: ['gamle_deichman_nordisk_skjonnlitteratur_i_utvalg_1935']
  };
  production.fagverk = {
    ...(production.fagverk || {}),
    status: 'curated',
    level: place.fagverk.level,
    subject_ids: place.fagverk.subject_ids,
    emne_ids: place.fagverk.emne_ids,
    chapter_ids: place.fagverk.chapter_ids
  };
  write(productionFile, production);
}

if (fs.existsSync(path.join(root, workcardFile))) {
  const workcard = read(workcardFile);
  workcard.collections = {
    ...(workcard.collections || {}),
    collection_ids: ['people', 'objects', 'brands', 'productions'],
    status: 'PASS_4',
    brand_id: brandId,
    production_id: 'gamle_deichman_nordisk_skjonnlitteratur_i_utvalg_1935'
  };
  write(workcardFile, workcard);
}

const source = path.join(root, 'bilder/places/gamle_deichman.webp');
const target = path.join(root, brandAsset);
fs.mkdirSync(path.dirname(target), { recursive: true });
await sharp(source)
  .extract({ left: 505, top: 338, width: 255, height: 115 })
  .resize({ width: 900, height: 520, fit: 'contain', background: { r: 245, g: 245, b: 245, alpha: 1 } })
  .webp({ quality: 92 })
  .toFile(target);

console.log('Gamle Deichman PR repair materialized');
