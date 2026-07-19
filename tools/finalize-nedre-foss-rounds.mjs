import crypto from 'node:crypto';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const appendUnique = (array, value, predicate = (item) => item === value) => {
  if (!array.some(predicate)) array.push(value);
};

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/nedre_foss.json';
const indexPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const splitManifestPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const leksikonPath = 'data/leksikon/places/oslo/historie/leksikon_oslo_historie_nedre_foss.json';
const peopleManifestPath = 'data/people/manifest.json';
const storyManifestPath = 'data/stories/stories_manifest.json';
const relationsPath = 'data/relations.json';

const place = read(placePath);
Object.assign(place, {
  name: 'Nedre Foss',
  year: 1220,
  desc: 'Historisk foss-, mølle- og gårdssted ved Akerselva, dokumentert med kverndrift fra 1220 og senere kjent som Kongens mølle.',
  popupDesc: 'Nedre Foss er dokumentert som kvern under Hovedøya kloster i 1220. Etter reformasjonen ble anlegget krongods og kjent som Kongens mølle. Friedrich Grüner kjøpte eiendommen i 1672, og Grüner-familien eide Nedre Foss i to lange perioder. Hovedbygningen som fortsatt står ble oppført i 1801/1802.\n\nFossen og fallhøyden gjorde stedet til et varig produksjonspunkt langs Akerselva. Mølleanleggene ble senere modernisert og knyttet til Bjølsen Valsemølle. Den tidligere kornsiloen ble ombygd til studentboliger i 2001, og Nedre Foss park åpnet i 2017. I dag kan stedet leses som en sammenheng mellom vannkraft, møllehistorie, bevarte bygninger, offentlig park og Akerselvas blågrønne byrom.',
  tags: [
    'Akerselva', 'foss', 'vannkraft', 'Kongens mølle', 'møllehistorie', 'Hovedøya kloster',
    'Grüner', 'industrihistorie', 'Nedre Foss park', 'historiske lag'
  ],
  quiz_profile: {
    place_type: 'historisk foss-, mølle- og gårdssted',
    subtype: 'middelalderkvern_kongens_molle_og_transformert_elverom',
    signature_features: [
      'kvern dokumentert i 1220',
      'Hovedøya kloster og senere Kongens mølle',
      'Friedrich Grüner kjøper i 1672',
      'hovedbygningen fra 1801/1802',
      'tidligere kornsilo ombygd til studentboliger i 2001',
      'Nedre Foss park åpnet i 2017',
      'fossen som varig natur- og energigrunnlag'
    ],
    primary_angles: [
      'middelalder_og_mollehistorie', 'vannkraft', 'eierskap_og_byutvikling',
      'industriell_transformasjon', 'bevarte_fysiske_spor', 'naturgrunnlag'
    ],
    question_families: [
      'historisk_endring', 'stedsspesifikk_funksjon', 'person_og_sted',
      'vannkraft_og_infrastruktur', 'for_na', 'fysiske_spor'
    ],
    avoid_angles: [
      'generisk_industrihistorie', 'hardkode_navaerende_restaurantvirksomhet', 'udokumenterte_artsfunn',
      'forveksle_nedre_foss_park_med_hele_det_historiske_stedet'
    ],
    must_include: ['1220', 'Kongens mølle', '1672', '1801/1802', '2001', '2017'],
    contrast_targets: ['vulkan_industriomrade', 'kuba_parken', 'beierbrua'],
    notes: 'Nedre Foss skal leses som et langt stedsløp fra middelalderkvern via mølle- og industribruk til park og offentlig elverom. Fossen er den kontinuerlige fysiske forbindelsen mellom periodene.'
  },
  externalLinks: [
    { type: 'reference', label: 'Store norske leksikon – Foss (Oslo)', url: 'https://snl.no/Foss_-_Oslo', lang: 'nb', verifiedAt: '2026-07-19' },
    { type: 'reference', label: 'Oslo byleksikon – Foss gård', url: 'https://oslobyleksikon.no/side/Foss_g%C3%A5rd', lang: 'nb', verifiedAt: '2026-07-19' },
    { type: 'reference', label: 'Industrimuseum – Akerselva Digitalt / Nedre Foss', url: 'https://www.industrimuseum.no/akerselvadigitalt', lang: 'nb', verifiedAt: '2026-07-19' },
    { type: 'reference', label: 'Oslo byleksikon – Nedre Foss park', url: 'https://oslobyleksikon.no/side/Nedre_Foss_park', lang: 'nb', verifiedAt: '2026-07-19' }
  ],
  works: [
    {
      id: 'nedre_foss_kongens_molle_1220',
      title: 'Nedre Foss mølle / Kongens mølle',
      type: 'historisk_molleanlegg',
      kind: 'water_power_production_site',
      year: 1220,
      desc: 'Kvern ved Nedre Foss er dokumentert under Hovedøya kloster i 1220; etter reformasjonen ble anlegget krongods og kjent som Kongens mølle.',
      why_here: 'Mølleanlegget er den lengste dokumenterte produksjonstradisjonen ved selve fossen.',
      source_note: 'Store norske leksikon, Oslo byleksikon og Industrimuseum, kontrollert 19. juli 2026.'
    },
    {
      id: 'nedre_foss_hovedbygning_1801_1802',
      title: 'Nedre Foss hovedbygning',
      type: 'historisk_gardsbygning',
      kind: 'built_heritage',
      year: 1801,
      desc: 'Den bevarte hovedbygningen ved Nedre Foss ble oppført i 1801/1802.',
      why_here: 'Bygningen er et synlig fysisk anker for gårds- og eiendomshistorien ved fossen.',
      source_note: 'Store norske leksikon: Foss (Oslo).'
    },
    {
      id: 'nedre_foss_kornsilo_studenthus_2001',
      title: 'Kornsiloen som studenthus',
      type: 'industriell_gjenbruk',
      kind: 'adaptive_reuse',
      year: 2001,
      desc: 'Den tidligere kornsiloen ble ombygd til studentboliger i 2001.',
      why_here: 'Siloen viser hvordan et produksjonsbygg kan få ny bruk uten å forsvinne fra bylandskapet.',
      source_note: 'Store norske leksikon: Foss (Oslo).'
    },
    {
      id: 'nedre_foss_park_2017',
      title: 'Nedre Foss park',
      type: 'park_og_byrom',
      kind: 'landscape_architecture',
      year: 2017,
      desc: 'Parken åpnet i 2017 på området til Nedre Foss gård og binder foss, elvepromenade, Mølleplassen og historiske spor sammen.',
      why_here: 'Parkanlegget er det tydeligste nyere laget i transformasjonen fra produksjonslandskap til offentlig elverom.',
      source_note: 'Oslo byleksikon: Nedre Foss park.'
    }
  ],
  civication_store: [
    {
      id: 'nedre_foss_fossen',
      title: 'Fossen',
      type: 'foss_og_vannkraftpunkt',
      kind: 'physical_object',
      desc: 'Selve fallet i Akerselva som gjorde kvern- og mølledrift mulig.',
      placeSpecificReason: 'Fossen er den kontinuerlige fysiske årsaken til stedets mer enn 800 år lange produksjonshistorie.',
      historicalFunction: 'Leverte vannkraft til kvern- og mølledrift.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 45,
      currency: 'PC',
      collection: 'nedre_foss_vannkraft_og_molle',
      collectable: true,
      source_urls: ['https://snl.no/Foss_-_Oslo', 'https://oslobyleksikon.no/side/Foss_g%C3%A5rd']
    },
    {
      id: 'nedre_foss_hovedbygning_objekt',
      title: 'Hovedbygningen fra 1801/1802',
      type: 'bygningsminiatyr',
      kind: 'physical_object',
      desc: 'En miniatyr av den bevarte hovedbygningen ved Nedre Foss.',
      placeSpecificReason: 'Bygningen står fortsatt og er et direkte fysisk spor etter gårdsanlegget.',
      historicalFunction: 'Hovedbygning for Nedre Foss gård.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 38,
      currency: 'PC',
      collection: 'nedre_foss_vannkraft_og_molle',
      collectable: true,
      source_urls: ['https://snl.no/Foss_-_Oslo']
    },
    {
      id: 'nedre_foss_kornsilo_objekt',
      title: 'Den tidligere kornsiloen',
      type: 'silomodell',
      kind: 'physical_object',
      desc: 'En fysisk modell av kornsiloen som senere ble ombygd til studentboliger.',
      placeSpecificReason: 'Siloen er et markant bevart spor etter den senere mølle- og lagringshistorien ved Nedre Foss.',
      historicalFunction: 'Kornlagring knyttet til møllevirksomheten før ombyggingen i 2001.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 35,
      currency: 'PC',
      collection: 'nedre_foss_vannkraft_og_molle',
      collectable: true,
      source_urls: ['https://snl.no/Foss_-_Oslo']
    },
    {
      id: 'nedre_foss_fisketrapp',
      title: 'Fisketrappen',
      type: 'elveinfrastruktur',
      kind: 'physical_object',
      desc: 'Fisketrappen nord for brua er et synlig nyere tiltak i elverommet ved Nedre Foss.',
      placeSpecificReason: 'Den ligger ved fossen og viser en moderne måte å håndtere elvas økologiske sammenheng i et historisk regulert vannløp.',
      historicalFunction: 'Moderne passasjeinfrastruktur i et elverom som tidligere først og fremst ble utnyttet som energikilde.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 25,
      currency: 'PC',
      collection: 'nedre_foss_vannkraft_og_molle',
      collectable: true,
      source_urls: ['https://oslobyleksikon.no/side/Nedre_Foss_park']
    }
  ],
  brands: [
    { id: 'hovedoya_kloster_nedre_foss', name: 'Hovedøya kloster', brand_kind: 'historical_religious_institution', brand_type: 'medieval_mill_owner_context' },
    { id: 'kongens_molle_nedre_foss', name: 'Kongens mølle', brand_kind: 'historical_crown_property', brand_type: 'post_reformation_mill_context' },
    { id: 'gruner_familien_nedre_foss', name: 'Grüner-familien', brand_kind: 'historical_owner_family', brand_type: 'long_term_estate_and_mill_owner' },
    { id: 'bjolsen_valsemolle_nedre_foss', name: 'Bjølsen Valsemølle', brand_kind: 'historical_industrial_company', brand_type: 'later_mill_operator_context' },
    { id: 'oslo_kommune_nedre_foss_park', name: 'Oslo kommune', brand_kind: 'municipality', brand_type: 'public_park_and_river_space_actor' }
  ],
  nature_profile: {
    type: 'foss / urban elvekorridor / historisk vannkraftpunkt',
    title: 'Fossen som naturgrunnlag og historisk maskinkraft',
    summary: 'Natur-rundingen ved Nedre Foss handler om selve Akerselva, fallet og elvekorridoren som gjorde kvern- og mølledrift mulig. Fra offentlige ganglinjer kan brukeren observere vannfart, fall, stein, elvekanter og hvordan fisketrapp og park møter et historisk regulert vannløp. Det finnes ingen aktiv artskartlegging til `nedre_foss` i repoets naturkart, så rundingen skal ikke fylle inn sannsynlige arter som dokumenterte funn.',
    themes: [
      'foss og fallhøyde',
      'Akerselva som blågrønn korridor',
      'vann som historisk energikilde',
      'elvekanter i tett by',
      'fisketrapp og passasje',
      'møtet mellom naturgrunnlag og byomforming'
    ],
    nearby_place_ids: ['vulkan_industriomrade', 'kuba_parken', 'beierbrua']
  },
  for_na: {
    title: 'Fra klosterkvern og Kongens mølle til offentlig park',
    before: 'Fra middelalderen ble fossens kraft brukt til kornmaling. Etter reformasjonen var anlegget krongods og kjent som Kongens mølle. Senere fortsatte mølle- og industribruken under skiftende eiere, blant annet Grüner-familien og Bjølsen Valsemølle.',
    now: 'Den bevarte hovedbygningen og den tidligere kornsiloen står fortsatt som fysiske spor, mens Nedre Foss park fra 2017 gjør elverommet tilgjengelig som offentlig park. Fossen og vannløpet er fortsatt stedets tydeligste naturgrunnlag.',
    change: 'Produksjonen som organiserte området er borte, men bygninger, foss, parkstruktur og elveinfrastruktur gjør det mulig å lese hvordan samme sted har gått fra kvern og mølle til studentboliger, grøntdrag og offentlig byrom.',
    lookFor: [
      'selve fossen og fallhøyden',
      'hovedbygningen fra 1801/1802',
      'den tidligere kornsiloen',
      'Mølleplassen og parkens historiefortellende elementer',
      'fisketrappen',
      'overgangen mellom park, elvekant og det transformerte Vulkan-området'
    ],
    sources: [
      'https://snl.no/Foss_-_Oslo',
      'https://oslobyleksikon.no/side/Foss_g%C3%A5rd',
      'https://www.industrimuseum.no/akerselvadigitalt',
      'https://oslobyleksikon.no/side/Nedre_Foss_park'
    ]
  }
});
write(placePath, place);

const index = read(indexPath);
const indexRow = index.find((row) => row.id === 'nedre_foss');
if (!indexRow) throw new Error('Missing Nedre Foss route index row');
Object.assign(indexRow, {
  name: place.name ?? null,
  category: place.category ?? null,
  lat: place.lat ?? null,
  lon: place.lon ?? null,
  r: place.r ?? null,
  year: place.year ?? null,
  coordStatus: place.coordStatus ?? null,
  coordType: place.coordType ?? null
});
write(indexPath, index);

const splitManifest = read(splitManifestPath);
const manifestRow = splitManifest.places.find((row) => row.id === 'nedre_foss');
if (!manifestRow) throw new Error('Missing Nedre Foss split-manifest row');
manifestRow.name = place.name ?? null;
manifestRow.category = place.category ?? null;
manifestRow.sha256 = crypto.createHash('sha256').update(fs.readFileSync(placePath)).digest('hex');
write(splitManifestPath, splitManifest);

const article = read(leksikonPath);
Object.assign(article, {
  version: 2,
  popupDesc: 'Nedre Foss er et dokumentert mølle- og kraftsted fra middelalderen der Akerselvas fall, Kongens mølle, Grüner-familiens eiendom, bevarte bygninger og dagens park kan leses som ett langt historisk forløp.',
  wikiText: [
    'Kvern ved Nedre Foss nevnes i 1220 som del av Hovedøya klosters virksomhet. Etter reformasjonen ble anlegget krongods og kjent som Kongens mølle. Friedrich Grüner kjøpte Nedre Foss Mølle av kronen i 1672. Grüner-familien eide eiendommen i periodene 1672–1758 og 1803–1911, og gårdens jorder inngikk senere i området som fikk navnet Grünerløkka. Hovedbygningen ved Nedre Foss ble oppført i 1801/1802.',
    'Mølleanleggene ble modernisert gjennom 1800-tallet og senere knyttet til Bjølsen Valsemølle. Den tidligere kornsiloen ble brukt til kornlagring fram til 1990 og ombygd til studentboliger i 2001. Nedre Foss park åpnet i 2017 på gårdsområdet. Parken, fossen, hovedbygningen og siloen gjør det mulig å lese mer enn åtte hundre år med skiftende bruk i samme elverom: fra klosterkvern og krongods til mølleindustri, bolig og offentlig park.'
  ],
  summary: {
    one_liner: 'Middelalderkvern, Kongens mølle og senere møllelandskap ved Akerselvas nederste foss, i dag et transformert offentlig elverom.',
    themes: ['Akerselva', 'møllehistorie', 'Kongens mølle', 'Grüner', 'vannkraft', 'byomforming'],
    tone: ['nøktern', 'historisk', 'stedsspesifikk']
  },
  facts: [
    { id: 'fact_nedre_foss_01', label: 'Kvern dokumentert i 1220', desc: 'Nedre Foss nevnes i 1220 som kvern under Hovedøya kloster.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)', 'Oslo byleksikon – Foss gård'] },
    { id: 'fact_nedre_foss_02', label: 'Krongods etter reformasjonen', desc: 'Nedre Foss var krongods fra 1537 til 1672 og ble kjent som Kongens mølle.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)', 'Oslo byleksikon – Foss gård'] },
    { id: 'fact_nedre_foss_03', label: 'Friedrich Grüner kjøper i 1672', desc: 'Friedrich Grüner kjøpte Nedre Foss Mølle av kronen i 1672.', confidence: 'high', sources: ['Oslo byleksikon – Grünerløkka', 'Store norske leksikon – Foss (Oslo)'] },
    { id: 'fact_nedre_foss_04', label: 'Grüner-familien i to perioder', desc: 'Familien Grüner eide Nedre Foss i periodene 1672–1758 og 1803–1911.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)', 'Oslo byleksikon – Foss gård'] },
    { id: 'fact_nedre_foss_05', label: 'Hovedbygning fra 1801/1802', desc: 'Den bevarte hovedbygningen ble oppført i 1801/1802.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)'] },
    { id: 'fact_nedre_foss_06', label: 'Senere mølledrift', desc: 'Nedre Foss mølle ble senere drevet av Bjølsen Valsemølle.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)', 'Industrimuseum – Nedre Foss'] },
    { id: 'fact_nedre_foss_07', label: 'Silo ombygd i 2001', desc: 'Den tidligere kornsiloen ble ombygd til studentboliger i 2001.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)'] },
    { id: 'fact_nedre_foss_08', label: 'Park åpnet i 2017', desc: 'Nedre Foss park åpnet i 2017 på området til Nedre Foss gård.', confidence: 'high', sources: ['Oslo byleksikon – Nedre Foss park'] }
  ],
  chronology: [
    { id: 'chrono_nedre_foss_01', year: 1220, period: 'Klosterkvern', desc: 'Kvern ved Nedre Foss dokumenteres under Hovedøya kloster.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)', 'Oslo byleksikon – Foss gård'] },
    { id: 'chrono_nedre_foss_02', year: 1537, period: 'Krongods', desc: 'Etter reformasjonen går anlegget over til kronen og forbindes med navnet Kongens mølle.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)'] },
    { id: 'chrono_nedre_foss_03', year: 1672, period: 'Grüner-familien', desc: 'Friedrich Grüner kjøper Nedre Foss Mølle av kronen.', confidence: 'high', sources: ['Oslo byleksikon – Grünerløkka', 'Store norske leksikon – Foss (Oslo)'] },
    { id: 'chrono_nedre_foss_04', year: 1801, period: 'Hovedbygningen 1801/1802', desc: 'Den bevarte hovedbygningen oppføres omkring 1801–1802.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)'] },
    { id: 'chrono_nedre_foss_05', year: 2001, period: 'Kornsilo blir studenthus', desc: 'Den tidligere kornsiloen ombygges til studentboliger.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)'] },
    { id: 'chrono_nedre_foss_06', year: 2017, period: 'Nedre Foss park åpner', desc: 'Parken åpner på det historiske gårds- og mølleområdet.', confidence: 'high', sources: ['Oslo byleksikon – Nedre Foss park'] }
  ],
  built_environment: {
    built_year: 1801,
    architects: [],
    materials: ['mur', 'stein', 'tegl', 'vann', 'elvekant'],
    style: ['historisk gårds- og møllelandskap', 'transformert offentlig elverom'],
    original_function: 'Kvern-, mølle- og gårdsdrift basert på vannkraft fra Nedre Foss',
    current_function: 'Historisk bygningsmiljø, studentboliger, park og offentlig elverom',
    changes: [
      { label: 'Hovedbygningen', year: 1801, desc: 'Hovedbygningen oppføres i 1801/1802.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)'] },
      { label: 'Silo til studentboliger', year: 2001, desc: 'Den tidligere kornsiloen bygges om til studentboliger.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)'] },
      { label: 'Nedre Foss park', year: 2017, desc: 'Det historiske området får et nytt offentlig park- og elveromslag.', confidence: 'high', sources: ['Oslo byleksikon – Nedre Foss park'] }
    ]
  },
  stories: [
    { id: 'story_nedre_foss_01', entry_id: 'wk_nedre_foss_vannkraften', title: 'Vannkraften', one_liner: 'Fossen gjorde kvern- og mølledrift mulig gjennom århundrer.', confidence: 'high', sources: ['Store norske leksikon – Foss (Oslo)'] },
    { id: 'story_nedre_foss_02', entry_id: 'wk_nedre_foss_fra_produksjon_til_byliv', title: 'Fra produksjon til park', one_liner: 'Bygninger og landskap viser hvordan et produksjonssted fikk nye funksjoner uten at alle spor forsvant.', confidence: 'high', sources: ['Oslo byleksikon – Nedre Foss park'] }
  ],
  links: {
    entry_ids: [
      'wk_nedre_foss_vannkraften', 'wk_nedre_foss_elva_som_maskin', 'wk_nedre_foss_molle_og_industri',
      'wk_nedre_foss_fra_produksjon_til_byliv', 'wk_nedre_foss_elvekant_og_bynatur', 'wk_nedre_foss_akerselva_korridoren'
    ],
    related_places: ['vulkan_industriomrade', 'kuba_parken', 'beierbrua', 'elvestrekning_bla_brenneriveien'],
    related_people: ['friedrich_gruner']
  },
  sources: [
    { id: 'source_nedre_foss_01', label: 'Store norske leksikon – Foss (Oslo)', type: 'reference', url: 'https://snl.no/Foss_-_Oslo', confidence: 'high' },
    { id: 'source_nedre_foss_02', label: 'Oslo byleksikon – Foss gård', type: 'reference', url: 'https://oslobyleksikon.no/side/Foss_g%C3%A5rd', confidence: 'high' },
    { id: 'source_nedre_foss_03', label: 'Industrimuseum – Nedre Foss / Akerselva Digitalt', type: 'reference', url: 'https://www.industrimuseum.no/akerselvadigitalt', confidence: 'high' },
    { id: 'source_nedre_foss_04', label: 'Oslo byleksikon – Nedre Foss park', type: 'reference', url: 'https://oslobyleksikon.no/side/Nedre_Foss_park', confidence: 'high' }
  ]
});
write(leksikonPath, article);

const peopleManifest = read(peopleManifestPath);
appendUnique(peopleManifest.files, 'people/historie/oslo/akerselva/friedrich_gruner.json');
write(peopleManifestPath, peopleManifest);

const storyManifest = read(storyManifestPath);
const storyPath = 'data/stories/stories_nedre_foss.json';
appendUnique(storyManifest.files, { category: 'historie', entity_id: 'nedre_foss', path: storyPath }, (row) => row.entity_id === 'nedre_foss' && row.path === storyPath);
write(storyManifestPath, storyManifest);

const relations = read(relationsPath);
appendUnique(relations, {
  id: 'rel_friedrich_gruner_nedre_foss_1672',
  type: 'eier',
  place: 'nedre_foss',
  person: 'friedrich_gruner',
  label: 'Kjøpte Nedre Foss Mølle i 1672',
  why: 'Friedrich Grüner kjøpte Nedre Foss Mølle/Kongens mølle av kronen i 1672 og etablerte Grüner-familiens dokumenterte tilknytning til stedet.',
  source: 'https://snl.no/Foss_-_Oslo'
}, (row) => row.id === 'rel_friedrich_gruner_nedre_foss_1672');
write(relationsPath, relations);

console.log('Nedre Foss rounds, leksikon, manifests and Friedrich Grüner relation finalized.');
