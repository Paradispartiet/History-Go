import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const upsertById = (rows, value) => {
  const index = rows.findIndex((row) => row?.id === value.id);
  if (index >= 0) rows[index] = value;
  else rows.push(value);
};

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/vulkan_industriomrade.json';
const place = read(placePath);
const evidence = read('data/coordinate-evidence/oslo/natur/vulkan_industriomrade.json');
if (place.id !== 'vulkan_industriomrade') throw new Error('Unexpected Vulkan place id');
if (evidence.placeId !== place.id) throw new Error('Coordinate evidence mismatch');
for (const key of ['lat', 'lon', 'r']) {
  if (place[key] !== evidence.currentCoordinate[key]) {
    throw new Error(`Do not touch Vulkan coordinate field ${key}`);
  }
}

const sources = [
  {
    type: 'reference',
    label: 'Oslo byleksikon – Vulkan Jernstøberi og mekaniske Verksted',
    url: 'https://oslobyleksikon.no/side/Vulkan_Jernst%C3%B8beri_og_mekaniske_Verksted',
    lang: 'nb',
    verifiedAt: '2026-07-19'
  },
  {
    type: 'reference',
    label: 'Store norske leksikon – Vulkan Jernstøberi og mekaniske Verksted',
    url: 'https://snl.no/Vulkan_Jernst%C3%B8beri_og_mekaniske_Verksted',
    lang: 'nb',
    verifiedAt: '2026-07-19'
  },
  {
    type: 'reference',
    label: 'Oslo byleksikon – Vulkan (område)',
    url: 'https://oslobyleksikon.no/side/Vulkan_%28omr%C3%A5de%29',
    lang: 'nb',
    verifiedAt: '2026-07-19'
  },
  {
    type: 'reference',
    label: 'Store norske leksikon – Vulkan (område i Oslo)',
    url: 'https://snl.no/Vulkan_-_omr%C3%A5de_i_Oslo',
    lang: 'nb',
    verifiedAt: '2026-07-19'
  },
  {
    type: 'reference',
    label: 'Oslo byleksikon – Bagaas Brug',
    url: 'https://oslobyleksikon.no/side/Bagaas_Brug',
    lang: 'nb',
    verifiedAt: '2026-07-19'
  },
  {
    type: 'reference',
    label: 'Store norske leksikon – Axel Ingvald Spone Amundsen',
    url: 'https://snl.no/Axel_Ingvald_Spone_Amundsen',
    lang: 'nb',
    verifiedAt: '2026-07-19'
  }
];

Object.assign(place, {
  year: 1873,
  desc: 'Industristed grunnlagt som Vulkan Jernstøberi og mekaniske Verksted i 1873, senere omformet til et tett byområde der verkstedhaller, kulturbygg, undervisning, bolig og elverom overlapper.',
  popupDesc: 'Vulkan industriområde ligger på vestbredden av Akerselva ved Maridalsveien 17. Selve Vulkan Jernstøberi og mekaniske Verksted ble grunnlagt her i 1873 av Halvor Hoaas, på et område som allerede hadde en eldre industrihistorie gjennom blant annet Bagaas Brug. Derfor rettes canonical år fra den generiske legacy-verdien 1857 til 1873: 1850-årene hører til forhistorien på tomten, mens Vulkan-bedriften begynner i 1873.\n\nJernbaneingeniøren Ferdinand Ludvig Vibe kom inn som medeier i 1874 og ble eneeier i 1876. Etter konkursen i 1884 fikk Axel Ingvald Spone Amundsen en sentral rolle og ble eneeier i 1897. Under hans ledelse ble Vulkan særlig kjent for brokonstruksjoner, og bedriften var tidlig ute med rasjonell produksjon av stålbroer. De første broene til NSB og Statens Veivesen ble levert i 1886.\n\nJernstøperiet ble nedlagt i 1968 og den gjenværende virksomheten flyttet til Furuset. Fabrikkområdet ble senere gradvis bygd om. Broverkstedet fra 1908 ble gjenbrukt som Mathallen i 2012, industribygninger fra 1946 ble tatt i bruk av Dansens Hus, og Kristin Jarmunds skolebygg fra 2011 representerer et nytt arkitektonisk lag. Vulkan er derfor et av Oslos tydeligste steder for å lese overgangen fra produksjonsby til kultur-, kunnskaps- og oppholdsby uten at alle industrisporene forsvinner.',
  tags: [
    'akerselva',
    'vulkan',
    'jernstoperi',
    'mekanisk_verksted',
    'industrihistorie',
    'stalbroer',
    'broverksted',
    'transformasjon',
    'adaptiv_ombruk',
    'byutvikling',
    'kulturbygg',
    'samtidsarkitektur'
  ],
  emne_ids: [
    'em_by_industri_havn_logistikk',
    'em_by_transformasjon_ombruk',
    'em_by_gentrifisering_eiendom',
    'em_by_historiske_lag_i_hverdagsrom'
  ],
  quiz_profile: {
    place_type: 'transformert industriområde',
    subtype: 'jernstoperi_broverksted_og_adaptiv_ombruk',
    signature_features: [
      'Vulkan Jernstøberi og mekaniske Verksted grunnlagt i 1873',
      'broproduksjon og Broverkstedet fra 1908',
      'industribygninger fra 1946 gjenbrukt til kulturformål',
      'tidligere kornsilo- og møllelandskap på motsatt elvebredd ved Nedre Foss',
      'nyere arkitektur og offentlig tverrforbindelse over Akerselva'
    ],
    primary_angles: [
      'industri_og_arbeid',
      'teknologi_og_brobygging',
      'eierskap_og_bedriftshistorie',
      'arkitektur_og_adaptiv_ombruk',
      'akerselva_og_industrilokalisering',
      'byutvikling_transformasjon'
    ],
    question_families: [
      'historisk_endring',
      'person_og_eierskap',
      'produksjon_og_teknikk',
      'bygg_og_ombruk',
      'for_nå',
      'kildekritikk'
    ],
    avoid_angles: [
      'generisk_tursti',
      'usikre_artsdetaljer',
      'tidssensitive_restaurantlister',
      'late_som_1857_er_vulkan_jernstoperiets_grunnleggelsesaar'
    ],
    must_include: [
      '1873',
      'Halvor Hoaas',
      'Ferdinand Ludvig Vibe',
      'Axel Ingvald Spone Amundsen',
      'stålbroproduksjonen',
      '1968',
      'adaptiv ombruk'
    ],
    contrast_targets: [
      'nedre_foss',
      'nydalen_industristed',
      'vulkan_energisentral'
    ],
    notes: 'Les Vulkan som et konkret verksted- og industristed med dokumentert bedriftshistorie. Skill mellom Bagaas Brugs eldre industrihistorie på tomten og Vulkan-bedriftens grunnleggelse i 1873.'
  },
  externalLinks: sources,
  underbadge_ids: [
    'samtidsarkitektur',
    'byplanlegging',
    'infrastruktur'
  ],
  works: [
    {
      id: 'vulkan_jernstoberi_1873',
      title: 'Vulkan Jernstøberi og mekaniske Verksted',
      type: 'industribedrift',
      kind: 'iron_foundry_and_mechanical_workshop',
      year: 1873,
      desc: 'Industribedriften som ga området Vulkan-navnet ble grunnlagt av Halvor Hoaas i 1873.',
      why_here: 'Bedriften lå på dette fabrikkområdet ved Akerselva og er den historiske kjernen i Vulkan-stedet.'
    },
    {
      id: 'vulkan_stopejernstrapper_1880',
      title: 'Støpjernstrapper for Kristiania',
      type: 'industriprodukt',
      kind: 'cast_iron_building_components',
      year: 1880,
      desc: 'Vulkan leverte blant annet støpjernstrapper til mange av de nye bygårdene i Kristiania under ekspansjonen rundt 1880.',
      why_here: 'Produktet viser hvordan verkstedet på Vulkan satte fysiske spor langt utenfor selve fabrikkområdet.'
    },
    {
      id: 'vulkan_stalbroer_1886',
      title: 'De første stålbroene',
      type: 'ingeniorprodukt',
      kind: 'steel_bridge_fabrication',
      year: 1886,
      desc: 'Vulkan leverte de første broene til NSB og Statens Veivesen i 1886 og ble tidlig ledende i rasjonell produksjon av stålbroer.',
      why_here: 'Broproduksjonen ble en av Vulkan-bedriftens viktigste tekniske spesialiteter.'
    },
    {
      id: 'vulkan_broverksted_1908',
      title: 'Broverkstedet',
      type: 'industribygning',
      kind: 'bridge_workshop',
      year: 1908,
      desc: 'Det gamle Broverkstedet fra 1908 er et av de tydeligste bevarte produksjonssporene på området.',
      why_here: 'Bygningen var del av verkstedmiljøet og ble senere et hovedeksempel på adaptiv ombruk.'
    },
    {
      id: 'vulkan_industribygg_1946',
      title: 'Stålblåseriet, Maskinverkstedet og Strykejernet',
      type: 'industribygg',
      kind: 'industrial_building_group',
      year: 1946,
      desc: 'Bygningsgruppen ble oppført i 1946 som del av jernstøperiet og fikk senere nye kulturfunksjoner.',
      why_here: 'Byggene gjør overgangen mellom aktiv industri og senere gjenbruk fysisk lesbar.'
    },
    {
      id: 'vulkan_flerbrukshall_1996',
      title: 'Vulkan Flerbrukshall',
      type: 'ombruk',
      kind: 'adaptive_reuse_sports_hall',
      year: 1996,
      desc: 'Den nordligste industribygningen ble ombygd til flerbrukshall og åpnet i 1996.',
      why_here: 'Hallen er et tidlig eksempel på hvordan det gamle fabrikkområdet fikk nye offentlige funksjoner.'
    },
    {
      id: 'vulkan_dansens_hus_2007',
      title: 'Dansens Hus på Vulkan',
      type: 'kulturombruk',
      kind: 'adaptive_reuse_dance_venue',
      year: 2007,
      desc: 'Dansens Hus tok i bruk ombygde industribygninger på Vulkan som nasjonal scene for dans.',
      why_here: 'Kulturinstitusjonen viser hvordan tidligere produksjonshaller ble transformert til scenekunstrom.'
    },
    {
      id: 'vulkan_tverrforbindelse_2010',
      title: 'Ny tverrforbindelse over Akerselva',
      type: 'byforbindelse',
      kind: 'urban_connection',
      year: 2010,
      desc: 'En ny forbindelse over Akerselva knyttet Vulkan tettere til Grünerløkka og Nedre Foss.',
      why_here: 'Forbindelsen endret områdets rolle fra lukket industrikant til mer sammenhengende byrom.'
    },
    {
      id: 'vulkan_westerdals_2011',
      title: 'Westerdals-bygget',
      type: 'arkitektur',
      kind: 'education_building',
      year: 2011,
      desc: 'Skolebygget som stod ferdig i 2011 ble tegnet av Kristin Jarmund.',
      why_here: 'Bygget representerer et nytt arkitektonisk lag i transformasjonen av Vulkan.'
    },
    {
      id: 'vulkan_mathall_2012',
      title: 'Broverkstedet som Mathallen',
      type: 'adaptiv_ombruk',
      kind: 'industrial_hall_to_food_hall',
      year: 2012,
      desc: 'Det gamle Broverkstedet ble rehabilitert og tatt i bruk som Mathallen i 2012.',
      why_here: 'Ombyggingen er et tydelig fysisk eksempel på hvordan industriarv kan få ny bruk uten at bygningen viskes ut.'
    }
  ],
  civication_store: [
    {
      id: 'vulkan_stopejernstrapp_miniplate',
      title: 'Vulkan-støpejernstrappen',
      type: 'industridetalj',
      kind: 'physical_object',
      desc: 'En liten relieffplate inspirert av støpjernstrappene Vulkan leverte til Kristianias bygårder.',
      placeSpecificReason: 'Trappeproduksjonen var en dokumentert del av Vulkan-bedriftens ekspansjon rundt 1880.',
      historicalFunction: 'Viser hvordan verkstedprodukter fra Vulkan ble bygningsdeler i den voksende byen.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 28,
      currency: 'PC',
      collection: 'vulkan_stal_og_ombruk',
      collectable: true,
      source_urls: [sources[0].url, sources[1].url]
    },
    {
      id: 'vulkan_stalbro_klinkeplate',
      title: 'Klinket stålbroplate',
      type: 'ingeniordetalj',
      kind: 'physical_object',
      desc: 'Et samlerobjekt inspirert av Vulkan-bedriftens lange produksjon av stålbrokonstruksjoner.',
      placeSpecificReason: 'Vulkan ble kjent for rasjonell brofabrikasjon og leverte broer fra 1886.',
      historicalFunction: 'Representerer overgangen fra støpegods til mer spesialisert bro- og stålkonstruksjon.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 35,
      currency: 'PC',
      collection: 'vulkan_stal_og_ombruk',
      collectable: true,
      source_urls: [sources[0].url]
    },
    {
      id: 'vulkan_broverksted_1908_model',
      title: 'Broverkstedet 1908',
      type: 'bygningsminiatyr',
      kind: 'physical_object',
      desc: 'En liten modell av Broverkstedet som senere fikk ny bruk.',
      placeSpecificReason: 'Broverkstedet fra 1908 er et konkret bevart bygg på Vulkan.',
      historicalFunction: 'Knytter den gamle industribygningen til både broproduksjon og senere adaptiv ombruk.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 42,
      currency: 'PC',
      collection: 'vulkan_stal_og_ombruk',
      collectable: true,
      source_urls: [sources[1].url, sources[3].url]
    },
    {
      id: 'vulkan_strykejernet_1946_pin',
      title: 'Strykejernet 1946',
      type: 'bygningspin',
      kind: 'physical_object',
      desc: 'En pin inspirert av industribygningen Strykejernet fra 1946.',
      placeSpecificReason: 'Strykejernet inngår i den dokumenterte bygningsgruppen som senere fikk kulturfunksjoner.',
      historicalFunction: 'Viser hvordan etterkrigstidens industribygg ble en del av et nytt kulturkvartal.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 24,
      currency: 'PC',
      collection: 'vulkan_stal_og_ombruk',
      collectable: true,
      source_urls: [sources[3].url]
    },
    {
      id: 'vulkan_transformasjonskart',
      title: 'Vulkan før og nå-kart',
      type: 'foldoutkart',
      kind: 'physical_object',
      desc: 'Et brettkart som legger industriens hovedlag oppå dagens ganglinjer og ombrukte bygg.',
      placeSpecificReason: 'Vulkan er et av Oslos tydeligste transformasjonssteder, og samme bygningsmasse kan leses gjennom flere tidslag.',
      historicalFunction: 'Gjør det mulig å koble verksted, elverom, ombruk og nyere arkitektur i én fysisk oversikt.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 30,
      currency: 'PC',
      collection: 'vulkan_stal_og_ombruk',
      collectable: true,
      source_urls: [sources[2].url, sources[3].url]
    }
  ],
  brands: [
    { id: 'bagaas_brug_vulkan', name: 'Bagaas Brug', brand_kind: 'historical_industry', brand_type: 'industrial_site_predecessor' },
    { id: 'vulkan_jernstoberi_actor', name: 'Vulkan Jernstøberi og mekaniske Verksted', brand_kind: 'historical_industry', brand_type: 'foundry_and_mechanical_workshop' },
    { id: 'as_vulkan_actor', name: 'A/S Vulkan', brand_kind: 'historical_company', brand_type: 'industrial_and_property_company' },
    { id: 'vulkan_flerbrukshall_actor', name: 'Vulkan Flerbrukshall', brand_kind: 'public_use', brand_type: 'adaptive_reuse_sports' },
    { id: 'dansens_hus_vulkan_actor', name: 'Dansens Hus', brand_kind: 'culture', brand_type: 'adaptive_reuse_performing_arts' },
    { id: 'westerdals_vulkan_actor', name: 'Westerdals School of Communication', brand_kind: 'education_history', brand_type: 'education_building_2011' },
    { id: 'mathallen_vulkan_actor', name: 'Mathallen Oslo', brand_kind: 'adaptive_reuse', brand_type: 'broverksted_reuse_2012' },
    { id: 'aspelin_ramm_vulkan_actor', name: 'Aspelin Ramm', brand_kind: 'developer', brand_type: 'area_transformation' },
    { id: 'anton_b_nilsen_vulkan_actor', name: 'Anton B. Nilsen Eiendom', brand_kind: 'developer', brand_type: 'area_transformation' }
  ],
  for_na: {
    title: 'Fra verkstedby til ombruksby',
    before: 'Fra 1873 var Vulkan et mekanisk industrimiljø med støperi, verksteder og senere spesialisert produksjon av blant annet stålbroer. Området var organisert rundt arbeid, materialflyt og store produksjonshaller, og elvelandskapet rundt hadde allerede eldre industrilag fra Bagaas Brug.',
    now: 'I dag brukes mange av de gamle industribyggene til helt andre formål, samtidig som nyere bygg og forbindelser er lagt inn mellom dem. Området fungerer som et offentlig tilgjengelig byrom med kultur, undervisning, aktivitet, bolig og publikumsrettede funksjoner uten at hele fabrikkskalaen er borte.',
    change: 'Det viktigste skiftet er fra lukket produksjonsområde til blandet byområde. Transformasjonen er ikke total utslettelse: Broverkstedet og industribyggene fra 1946 gjør det mulig å se hvordan den nye byen er bygget inn i den gamle.',
    look_for: [
      'Broverkstedets store hallform',
      'industribyggene fra 1946',
      'nyere arkitektur mellom eldre verkstedvolumer',
      'forbindelsen over Akerselva mot Nedre Foss',
      'forskjellen mellom lukkede produksjonsflater og dagens ganglinjer',
      'spor av store porter og industriskala',
      'møtet mellom tegl, stål, glass og nyere materialer',
      'Akerselva som kant og forbindelse'
    ]
  },
  nature_profile: {
    type: 'Akerselva / urban elvekant / industrilandskap / blågrønn forbindelse',
    title: 'Elva som industrikant og ny byforbindelse',
    summary: 'Nature-rundingen på Vulkan handler om hvordan Akerselva har formet lokaliseringen og lesningen av hele området. Før Vulkan-bedriften kom i 1873 hadde Bagaas Brug og andre virksomheter allerede brukt de nederste fallene og elvekanten som industrilandskap. Vulkan overtok derfor ikke en tom naturtomt, men et sted der vann, damhold, terreng og produksjon allerede var tett koblet. I dagens byområde er elva ikke lenger først og fremst en produksjonsressurs. Den fungerer som blågrønn korridor, landskapskant og forbindelse mot Nedre Foss og Grünerløkka. Den nye tverrforbindelsen fra 2010 er et konkret tegn på dette skiftet. Rundingen skal få spilleren til å se elvas bredde, nivåforskjeller, kantsoner og forholdet mellom de gamle industrivolumene og den offentlige ferdselen. Den skal ikke dikte opp arter eller hevde at alle Vulkan-verkstedene ble drevet direkte av vannkraft.',
    themes: [
      'Akerselva som industrilokalisering',
      'eldre dam- og fallandskap',
      'elvekant og terreng',
      'blågrønn korridor',
      'offentlig tilgjengelighet',
      'tverrforbindelsen fra 2010',
      'industriarv i elvelandskapet',
      'kontrasten mellom produksjonskant og byrom'
    ],
    nearby_place_ids: [
      'nedre_foss',
      'kuba_parken',
      'elvestrekning_bla_brenneriveien',
      'vulkan_energisentral'
    ]
  },
  research_notes: [
    {
      id: 'vulkan_current_businesses',
      claim: 'Dagens virksomhetsmiks på Vulkan er tidssensitiv og skal ikke hardkodes som varig stedshistorie.',
      status: 'time_sensitive',
      use_in_app: false,
      next_source_needed: 'Offisielle virksomhets- eller institusjonssider ved behov.'
    },
    {
      id: 'vulkan_industrial_power_detail',
      claim: 'Det bør ikke påstås at alle Vulkan-verkstedene ble drevet direkte av Akerselvas vannkraft uten spesifikk teknisk kilde.',
      status: 'needs_primary_source_check',
      use_in_app: false,
      next_source_needed: 'Teknisk industrihistorisk kilde om energiforsyningen til de enkelte verkstedene.'
    }
  ],
  source_summary: {
    safe_sources: sources.map((source) => source.label),
    resolved_research: [
      'Vulkan Jernstøberi og mekaniske Verksted er dokumentert grunnlagt i 1873.',
      'Halvor Hoaas, Ferdinand Ludvig Vibe og Axel Ingvald Spone Amundsen har dokumenterte fysiske virksomhetskoblinger til Vulkan.',
      'Broproduksjon, Broverkstedet, nedleggelsen i 1968 og de viktigste ombruksfasene er kildebelagt.',
      'Kristin Jarmunds skolebygg fra 2011 er dokumentert i områdehistorien.'
    ],
    remaining_holdbacks: [
      'Skiftende nåværende virksomheter.',
      'Presis energiforsyning til hvert enkelt historisk verksted.'
    ]
  }
});
write(placePath, place);

const newPeople = [
  {
    path: 'data/people/historie/oslo/akerselva/halvor_hoaas.json',
    person: {
      id: 'halvor_hoaas',
      name: 'Halvor Hoaas',
      initials: 'HH',
      desc: 'Ingeniør og industrigründer som grunnla Vulkan Jernstøberi og mekaniske Verksted på området i 1873.',
      tags: ['historie', 'industri', 'akerselva', 'vulkan'],
      placeId: 'vulkan_industriomrade',
      category: 'historie',
      year: 1873,
      popupDesc: 'Halvor Hoaas (1842–1891) grunnla Vulkan Jernstøberi og mekaniske Verksted i 1873. Han var kjent for konstruksjon og produksjon av veiredskaper, og under den tidlige Vulkan-perioden produserte bedriften blant annet vekter, ildfaste pengeskap, støpegods, dampmaskiner og dampkjeler.',
      places: ['vulkan_industriomrade'],
      image: '',
      cardImage: '',
      emne_ids: ['em_by_industri_havn_logistikk', 'em_by_historiske_lag_i_hverdagsrom'],
      source_urls: [sources[0].url, sources[1].url]
    }
  },
  {
    path: 'data/people/historie/oslo/akerselva/ferdinand_ludvig_vibe.json',
    person: {
      id: 'ferdinand_ludvig_vibe',
      name: 'Ferdinand Ludvig Vibe',
      initials: 'FLV',
      desc: 'Jernbaneingeniør som kom inn som medeier i Vulkan i 1874 og ble eneeier i 1876.',
      tags: ['historie', 'ingenior', 'industri', 'vulkan'],
      placeId: 'vulkan_industriomrade',
      category: 'historie',
      year: 1874,
      popupDesc: 'Ferdinand Ludvig Vibe (1838–1912) gikk inn som medeier i Vulkan Jernstøberi og mekaniske Verksted i 1874 og ble eneeier i 1876. Under ekspansjonen rundt 1880 leverte Vulkan blant annet støpjernstrapper til mange nye bygårder i Kristiania. Et skipsverft Vibe startet i 1883 gikk konkurs året etter og dro Vulkan med seg.',
      places: ['vulkan_industriomrade'],
      image: '',
      cardImage: '',
      emne_ids: ['em_by_industri_havn_logistikk'],
      source_urls: [sources[0].url, sources[1].url]
    }
  },
  {
    path: 'data/people/historie/oslo/akerselva/axel_ingvald_spone_amundsen.json',
    person: {
      id: 'axel_ingvald_spone_amundsen',
      name: 'Axel Ingvald Spone Amundsen',
      initials: 'AISA',
      desc: 'Ingeniør og industrileder som ble eneeier av Vulkan i 1897 og ledet bedriften til 1939.',
      tags: ['historie', 'ingenior', 'industri', 'brobygging', 'vulkan'],
      placeId: 'vulkan_industriomrade',
      category: 'historie',
      year: 1897,
      popupDesc: 'Axel Ingvald Spone Amundsen (1856–1939) ble bestyrer og medeier etter konkursen i 1884, og eneeier av Vulkan i 1897. Under hans ledelse ble produksjonen særlig rettet mot brokonstruksjoner og varme- og ventilasjonsanlegg. Han ledet bedriften frem til sin død i 1939.',
      places: ['vulkan_industriomrade'],
      image: '',
      cardImage: '',
      emne_ids: ['em_by_industri_havn_logistikk', 'em_by_infrastruktur_mobilitet'],
      source_urls: [sources[0].url, sources[1].url, sources[5].url]
    }
  }
];

const peopleFiles = [];
for (const dirent of fs.readdirSync('data/people', { recursive: true, withFileTypes: true })) {
  if (!dirent.isFile() || !dirent.name.endsWith('.json')) continue;
  peopleFiles.push(path.join(dirent.parentPath, dirent.name));
}
const reservedIds = new Set(newPeople.map(({ person }) => person.id));
const reservedNames = new Set(newPeople.map(({ person }) => person.name.toLocaleLowerCase('nb')));
for (const file of peopleFiles) {
  if (newPeople.some((candidate) => candidate.path === file)) continue;
  let value;
  try { value = read(file); } catch { continue; }
  const rows = Array.isArray(value) ? value : [];
  for (const person of rows) {
    if (reservedIds.has(person?.id)) throw new Error(`Duplicate canonical person id before write: ${person.id}`);
    if (reservedNames.has(String(person?.name || '').toLocaleLowerCase('nb'))) {
      throw new Error(`Duplicate canonical person name before write: ${person.name}`);
    }
  }
}
for (const { path: file, person } of newPeople) write(file, [person]);

const peopleManifestPath = 'data/people/manifest.json';
const peopleManifest = read(peopleManifestPath);
for (const { path: file } of newPeople) {
  const relative = file.replace(/^data\//, '');
  if (!peopleManifest.files.includes(relative)) peopleManifest.files.push(relative);
}
write(peopleManifestPath, peopleManifest);

const relationsPath = 'data/relations.json';
const relations = read(relationsPath);
for (const relation of [
  {
    id: 'rel_halvor_hoaas_vulkan_grunnlegger',
    type: 'grunnlegger',
    place: 'vulkan_industriomrade',
    person: 'halvor_hoaas',
    label: 'Grunnla Vulkan i 1873',
    why: 'Halvor Hoaas grunnla Vulkan Jernstøberi og mekaniske Verksted på området i 1873.',
    source: sources[0].url
  },
  {
    id: 'rel_ferdinand_ludvig_vibe_vulkan_eier',
    type: 'eierskap',
    place: 'vulkan_industriomrade',
    person: 'ferdinand_ludvig_vibe',
    label: 'Medeier fra 1874, eneeier fra 1876',
    why: 'Ferdinand Ludvig Vibe virket fysisk ved Vulkan som medeier og senere eneeier.',
    source: sources[0].url
  },
  {
    id: 'rel_axel_ingvald_spone_amundsen_vulkan_eier',
    type: 'eierskap',
    place: 'vulkan_industriomrade',
    person: 'axel_ingvald_spone_amundsen',
    label: 'Eneeier og industrileder fra 1897',
    why: 'Axel Ingvald Spone Amundsen ledet Vulkan på stedet og utviklet blant annet broproduksjonen.',
    source: sources[5].url
  },
  {
    id: 'rel_kristin_jarmund_vulkan_arkitekt',
    type: 'arkitektur',
    place: 'vulkan_industriomrade',
    person: 'kristin_jarmund',
    label: 'Arkitekt for skolebygget fra 2011',
    why: 'Store norske leksikon dokumenterer Kristin Jarmund som arkitekt for Westerdals-bygget på Vulkan, ferdig i 2011.',
    source: sources[3].url
  }
]) upsertById(relations, relation);
write(relationsPath, relations);

const storyPath = 'data/stories/stories_vulkan_industriomrade.json';
const story = [{
  id: 'st_vulkan_fra_stalbroer_til_bybro',
  type: 'industrial_engineering_and_adaptive_reuse',
  title: 'Fra stålbroer til bybro',
  year: 1873,
  place_id: 'vulkan_industriomrade',
  person_id: 'halvor_hoaas',
  summary: 'Vulkan begynte som jernstøperi og mekanisk verksted i 1873, ble kjent for blant annet stålbroer og ble etter nedleggelsen i 1968 gradvis omformet til et byområde der de gamle produksjonshallene fikk nye roller.',
  story: 'Før navnet Vulkan kom til Akerselva, var tomten allerede et industristed. Bagaas Brug drev sagbruk og andre virksomheter ved de nederste fallene, og i 1873 overtok den nye bedriften Vulkan Jernstøberi og mekaniske Verksted deler av dette produksjonslandskapet. Halvor Hoaas grunnla bedriften, og året 1873 er derfor det riktige canonical startpunktet for Vulkan-bedriften – selv om stedets industrielle forhistorie er eldre.\n\nFerdinand Ludvig Vibe kom inn som medeier i 1874 og ble eneeier i 1876. Vulkan vokste samtidig med Kristiania og leverte blant annet støpjernstrapper til nye bygårder. Etter konkursen i 1884 fikk Axel Ingvald Spone Amundsen en stadig viktigere rolle. Han ble eneeier i 1897, og under hans ledelse ble bedriften særlig kjent for brokonstruksjoner. Allerede i 1886 leverte Vulkan broer til NSB og Statens Veivesen. Verkstedet på Akerselva laget altså forbindelser som ble reist mange andre steder i landet.\n\nDa jernstøperiet ble nedlagt i 1968 og den gjenværende virksomheten flyttet til Furuset, stod et stort fabrikkområde igjen. I stedet for å rive alle spor ble flere bygninger senere gjenbrukt. Broverkstedet fra 1908 ble til Mathallen, industribygg fra 1946 ble en del av Dansens Hus, og nye bygg som Kristin Jarmunds skolebygg fra 2011 ble lagt inn mellom de eldre volumene.\n\nDet finnes en fin historisk vending i dette. Vulkan produserte broer – konstruksjoner som binder steder sammen. I 2010 fikk selve området en ny tverrforbindelse over Akerselva mot Grünerløkka og Nedre Foss. Et tidligere produksjonsområde som lenge var organisert rundt fabrikkens interne behov, ble gradvis vevd inn i den offentlige byen. På Vulkan kan man derfor lese både industriens lukking og byens åpning i de samme veggene, hallene og ganglinjene.',
  sources: sources.map((source) => ({ title: source.label, url: source.url })),
  tags: ['Vulkan', 'Akerselva', 'jernstøperi', 'stålbroer', 'broverksted', 'adaptiv ombruk', 'bytransformasjon'],
  related_people: ['halvor_hoaas', 'ferdinand_ludvig_vibe', 'axel_ingvald_spone_amundsen', 'kristin_jarmund'],
  related_places: ['nedre_foss', 'kuba_parken', 'vulkan_energisentral'],
  score: { narrative: 5, historical: 5, source: 5, play_value: 5, originality: 5, total: 25 },
  arc: {
    start: 'Et nytt jernstøperi etableres i 1873 på en tomt med eldre industrihistorie.',
    middle: 'Vulkan blir en teknisk industribedrift kjent for blant annet stålbroer og store verkstedhaller.',
    end: 'Etter 1968 får hallene nye funksjoner, og en ny forbindelse over elva gjør området til del av den åpne byen.'
  },
  next_scenes: [
    { place_id: 'nedre_foss', reason: 'Kryss elva og sammenlign Vulkan-bedriftens verkstedhistorie med den enda eldre møllehistorien ved Nedre Foss.' },
    { place_id: 'vulkan_energisentral', reason: 'Fortsett til dagens tekniske energilag og se hvordan byens maskinrom har endret karakter.' }
  ]
}];
write(storyPath, story);

const storiesManifestPath = 'data/stories/stories_manifest.json';
const storiesManifest = read(storiesManifestPath);
if (!storiesManifest.files.some((row) => row.entity_id === place.id && row.path === storyPath)) {
  storiesManifest.files.push({ category: 'by', entity_id: place.id, path: storyPath });
}
write(storiesManifestPath, storiesManifest);

const leksikonPath = 'data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json';
const leksikon = read(leksikonPath);
const article = leksikon.find((row) => row.place_id === place.id);
if (!article) throw new Error('Missing Vulkan leksikon article');
Object.assign(article, {
  version: 2,
  popupDesc: 'Vulkan er et tidligere jernstøperi- og verkstedområde ved Akerselva, grunnlagt som Vulkan Jernstøberi og mekaniske Verksted i 1873. Her kan man følge en konkret linje fra støpegods og stålbroer til gjenbrukte industribygg, kulturfunksjoner og nyere arkitektur.',
  wikiText: [
    'Vulkan Jernstøberi og mekaniske Verksted ble grunnlagt i 1873 av Halvor Hoaas på vestbredden av Akerselva. Tomten hadde allerede en eldre industrihistorie: Bagaas Brug og andre virksomheter hadde brukt området og de nederste fallene i tiårene før Vulkan. Derfor er 1850-årene viktige som forhistorie, men 1873 er det riktige startåret for selve Vulkan-bedriften.',
    'Ferdinand Ludvig Vibe gikk inn som medeier i 1874 og ble eneeier i 1876. Etter konkursen i 1884 fikk ingeniør Axel Ingvald Spone Amundsen en sentral rolle og ble eneeier i 1897. Under Amundsens ledelse ble produksjonen særlig rettet mot brokonstruksjoner samt varme- og ventilasjonsanlegg. Oslo byleksikon beskriver Vulkan som den første norske bedriften som startet rasjonell fabrikasjon av stålbroer, og de første broene til NSB og Statens Veivesen ble levert i 1886.',
    'Industrimiljøet ble stadig bygd ut. Broverkstedet fra 1908 er et av de tydeligste bevarte sporene, mens Stålblåseriet, Maskinverkstedet og Strykejernet ble oppført i 1946. Jernstøperiet ble nedlagt i 1968 og resten av virksomheten flyttet til Furuset. Dermed begynte en lang overgang fra aktivt produksjonsområde til et område med utleie, nye planer og etter hvert omfattende byomforming.',
    'Transformasjonen skjedde lagvis. Vulkan Flerbrukshall åpnet i 1996, Dansens Hus tok i bruk ombygde industribygninger, en ny forbindelse over Akerselva kom i 2010, Kristin Jarmunds skolebygg stod ferdig i 2011, og Broverkstedet ble gjenbrukt som Mathallen i 2012. Vulkan er derfor et godt sted å studere adaptiv ombruk: nye funksjoner er lagt inn i et område der gamle verkstedvolumer fortsatt gjør industrihistorien fysisk lesbar.'
  ],
  summary: {
    one_liner: 'Jernstøperi fra 1873 som ble kjent for stålbroer og senere omformet til et byområde der industribygg og nye funksjoner lever side om side.',
    themes: ['industrihistorie', 'jernstøperi', 'stålbroer', 'Akerselva', 'adaptiv ombruk', 'bytransformasjon', 'samtidsarkitektur'],
    tone: ['nøktern', 'historisk', 'kildebevisst', 'stedsspesifikk']
  },
  facts: [
    { id: 'fact_vulkan_01', label: 'Grunnlagt i 1873', desc: 'Vulkan Jernstøberi og mekaniske Verksted ble grunnlagt av Halvor Hoaas i 1873.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'fact_vulkan_02', label: 'Eldre industri på tomten', desc: 'Bagaas Brug og andre virksomheter brukte tomten før Vulkan overtok fabrikkområdet i 1873.', confidence: 'high', sources: [sources[4].label] },
    { id: 'fact_vulkan_03', label: 'Vibe inn i 1874', desc: 'Ferdinand Ludvig Vibe ble medeier i 1874 og eneeier i 1876.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'fact_vulkan_04', label: 'Broer fra 1886', desc: 'De første broene til NSB og Statens Veivesen ble levert i 1886.', confidence: 'high', sources: [sources[0].label] },
    { id: 'fact_vulkan_05', label: 'Amundsen eneeier i 1897', desc: 'Axel Ingvald Spone Amundsen ble eneeier i 1897 og ledet bedriften til 1939.', confidence: 'high', sources: [sources[0].label, sources[5].label] },
    { id: 'fact_vulkan_06', label: 'Broverksted fra 1908', desc: 'Det gamle Broverkstedet ble oppført i 1908.', confidence: 'high', sources: [sources[1].label] },
    { id: 'fact_vulkan_07', label: 'Industribygg fra 1946', desc: 'Stålblåseriet, Maskinverkstedet og Strykejernet ble oppført i 1946.', confidence: 'high', sources: [sources[3].label] },
    { id: 'fact_vulkan_08', label: 'Jernstøperiet nedlagt i 1968', desc: 'Jernstøperiet ble nedlagt i 1968 og den gjenværende virksomheten flyttet til Furuset.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'fact_vulkan_09', label: 'Ny forbindelse i 2010', desc: 'En ny tverrforbindelse over Akerselva mot Grünerløkka og Nedre Foss ble åpnet i 2010.', confidence: 'high', sources: [sources[3].label] },
    { id: 'fact_vulkan_10', label: 'Skolebygg fra 2011', desc: 'Westerdals-bygget stod ferdig i 2011 og ble tegnet av Kristin Jarmund.', confidence: 'high', sources: [sources[3].label] },
    { id: 'fact_vulkan_11', label: 'Broverkstedet gjenbrukt i 2012', desc: 'Det gamle Broverkstedet ble rehabilitert og tatt i bruk som Mathallen i 2012.', confidence: 'high', sources: [sources[1].label, sources[3].label] }
  ],
  chronology: [
    { id: 'chrono_vulkan_01', year: 1849, period: 'Industriell forhistorie', desc: 'En sementfabrikk blir anlagt ved det nedre fallet på området som senere inngår i Vulkan-tomten.', confidence: 'high', sources: [sources[4].label] },
    { id: 'chrono_vulkan_02', year: 1853, period: 'Bagaas Brug', desc: 'Sagbruksvirksomheten ved Bagaas Brug gjenopptas.', confidence: 'high', sources: [sources[4].label] },
    { id: 'chrono_vulkan_03', year: 1873, period: 'Vulkan grunnlegges', desc: 'Halvor Hoaas grunnlegger Vulkan Jernstøberi og mekaniske Verksted.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'chrono_vulkan_04', year: 1874, period: 'Vibe blir medeier', desc: 'Ferdinand Ludvig Vibe går inn i bedriften.', confidence: 'high', sources: [sources[0].label] },
    { id: 'chrono_vulkan_05', year: 1876, period: 'Vibe blir eneeier', desc: 'Halvor Hoaas går ut og Vibe blir eneeier.', confidence: 'high', sources: [sources[0].label] },
    { id: 'chrono_vulkan_06', year: 1884, period: 'Konkurs og ny fase', desc: 'Vibes skipsverftskonkurs drar Vulkan med seg; Amundsen får senere en sentral lederrolle.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'chrono_vulkan_07', year: 1886, period: 'Tidlig stålbroproduksjon', desc: 'De første broene leveres til NSB og Statens Veivesen.', confidence: 'high', sources: [sources[0].label] },
    { id: 'chrono_vulkan_08', year: 1897, period: 'Amundsen blir eneeier', desc: 'Axel Ingvald Spone Amundsen blir eneeier av Vulkan.', confidence: 'high', sources: [sources[0].label, sources[5].label] },
    { id: 'chrono_vulkan_09', year: 1908, period: 'Broverkstedet', desc: 'Broverkstedet oppføres som del av industrimiljøet.', confidence: 'high', sources: [sources[1].label] },
    { id: 'chrono_vulkan_10', year: 1946, period: 'Nye industribygg', desc: 'Stålblåseriet, Maskinverkstedet og Strykejernet oppføres.', confidence: 'high', sources: [sources[3].label] },
    { id: 'chrono_vulkan_11', year: 1968, period: 'Jernstøperiet avsluttes', desc: 'Jernstøperiet nedlegges og den gjenværende virksomheten flytter til Furuset.', confidence: 'high', sources: [sources[0].label, sources[1].label] },
    { id: 'chrono_vulkan_12', year: 1996, period: 'Flerbrukshall', desc: 'Den nordligste bygningen åpner som Vulkan Flerbrukshall.', confidence: 'high', sources: [sources[3].label] },
    { id: 'chrono_vulkan_13', year: 2007, period: 'Kulturbruk', desc: 'Dansens Hus etableres i det ombygde industrimiljøet på Vulkan.', confidence: 'medium', sources: [sources[2].label, sources[3].label] },
    { id: 'chrono_vulkan_14', year: 2010, period: 'Ny elveforbindelse', desc: 'En ny tverrforbindelse over Akerselva åpnes mot Grünerløkka og Nedre Foss.', confidence: 'high', sources: [sources[3].label] },
    { id: 'chrono_vulkan_15', year: 2011, period: 'Nytt skolebygg', desc: 'Kristin Jarmunds Westerdals-bygning står ferdig.', confidence: 'high', sources: [sources[3].label] },
    { id: 'chrono_vulkan_16', year: 2012, period: 'Broverkstedet får ny bruk', desc: 'Det gamle Broverkstedet tas i bruk som Mathallen.', confidence: 'high', sources: [sources[1].label, sources[3].label] }
  ],
  built_environment: {
    built_year: 1873,
    architects: ['Kristin Jarmund', 'Ulf Thane', 'LPO'],
    materials: ['tegl', 'stål', 'betong', 'glass'],
    style: ['industribygg', 'verkstedhaller', 'adaptiv ombruk', 'samtidsarkitektur'],
    original_function: 'Jernstøperi og mekanisk verkstedområde',
    current_function: 'Blandet byområde med gjenbrukte industribygg, kultur, undervisning, aktivitet, bolig og publikumsrettede funksjoner',
    changes: [
      { label: 'Industribygg til flerbrukshall', year: 1996, desc: 'Den nordligste bygningen får ny offentlig bruk.', confidence: 'high', sources: [sources[3].label] },
      { label: 'Industribygg til dansescene', year: 2007, desc: 'Ombygde industribygg tas i bruk av Dansens Hus.', confidence: 'medium', sources: [sources[2].label, sources[3].label] },
      { label: 'Broverksted til Mathallen', year: 2012, desc: 'Broverkstedet fra 1908 får ny publikumsrettet bruk.', confidence: 'high', sources: [sources[1].label, sources[3].label] }
    ]
  },
  artifacts: [
    { id: 'artifact_vulkan_01', title: 'Broverkstedet', kind: 'industribygning', desc: 'Verkstedhallen fra 1908 er et fysisk hovedspor etter broproduksjonen.', where: 'Vulkan industriområde', confidence: 'high', image_ref: null, sources: [sources[1].label] },
    { id: 'artifact_vulkan_02', title: 'Industribyggene fra 1946', kind: 'bygningsgruppe', desc: 'Stålblåseriet, Maskinverkstedet og Strykejernet viser en senere fase av industrien.', where: 'Vulkan industriområde', confidence: 'high', image_ref: null, sources: [sources[3].label] },
    { id: 'artifact_vulkan_03', title: 'Westerdals-bygget', kind: 'samtidsarkitektur', desc: 'Kristin Jarmunds bygg fra 2011 er et tydelig nytt lag i området.', where: 'Vulkan industriområde', confidence: 'high', image_ref: null, sources: [sources[3].label] },
    { id: 'artifact_vulkan_04', title: 'Tverrforbindelsen over Akerselva', kind: 'byforbindelse', desc: 'Forbindelsen fra 2010 knytter Vulkan fysisk til Nedre Foss og Grünerløkka.', where: 'Akerselva ved Vulkan', confidence: 'high', image_ref: null, sources: [sources[3].label] }
  ],
  interpretation: {
    what_to_notice: [
      'forskjellen mellom gamle industrivolumer og nyere bygg',
      'Broverkstedets hallform',
      'de bevarte 1946-bygningene',
      'Akerselva som kant og forbindelse',
      'hvordan nye ganglinjer skjærer gjennom et tidligere produksjonsområde',
      'Kristin Jarmunds nyere arkitekturlag'
    ],
    why_it_matters: [
      'Vulkan viser hvordan en industribedrift fra 1873 satte tekniske spor både lokalt og gjennom broproduksjon i resten av landet.',
      'Stedet gjør adaptiv ombruk fysisk lesbar fordi flere gamle verkstedbygg fortsatt står i nye funksjoner.',
      'Området knytter industrihistorie, arkitektur og offentlig tilgjengelighet til den samme elvekanten.'
    ],
    counterpoints: [
      '1850-årene hører til den eldre industrihistorien på tomten; Vulkan Jernstøberi og mekaniske Verksted ble grunnlagt i 1873.',
      'Dagens virksomhetsmiks er tidssensitiv og bør beskrives gjennom stabile funksjoner fremfor detaljerte leietakerlister.',
      'Kilder varierer noe i dateringen av Dansens Hus sin etablering i de permanente Vulkan-lokalene; 2007 brukes her som områdekronologi, mens enkelte kilder omtaler innflytting i 2008.'
    ]
  },
  links: {
    entry_ids: [],
    related_places: ['nedre_foss', 'kuba_parken', 'vulkan_energisentral', 'elvestrekning_bla_brenneriveien'],
    related_people: ['halvor_hoaas', 'ferdinand_ludvig_vibe', 'axel_ingvald_spone_amundsen', 'kristin_jarmund']
  },
  sources: sources.map((source, index) => ({
    id: `source_vulkan_${String(index + 1).padStart(2, '0')}`,
    label: source.label,
    type: 'external_reference',
    url: source.url,
    confidence: 'high'
  }))
});
write(leksikonPath, leksikon);

const quizPath = 'data/quiz/historie/vulkan_industriomrade_sets.json';
const quiz = read(quizPath);
quiz.generator_version = 'chatgpt_history_go_manual_v2_source_enriched';
quiz.generated_from = [placePath, leksikonPath, storyPath, 'data/quiz/regler/SET_MAL_README_v3.md'];
quiz.manual_production_notes = {
  quality_direction: 'sted → dokumentert industrihistorie → fysisk observasjon → transformasjon',
  source_upgrade: 'Tidligere generiske holdback-spørsmål er oppgradert med kildebelagt bedriftshistorie, personer, broproduksjon, bygningskronologi og adaptiv ombruk.',
  source_caveats: [
    'Skiftende nåværende virksomheter hardkodes ikke.',
    '1850-årene brukes som dokumentert industriell forhistorie på tomten, mens canonical Vulkan-år er 1873.',
    'Kilder varierer noe mellom 2007 og 2008 for Dansens Hus sin permanente etablering; områdekronologien bruker 2007 med eksplisitt forbehold.'
  ]
};
const setq = (setIndex, questionIndex, question, options, answerIndex, knowledge, sourceLabels, claimBasis = 'documented_external_sources') => {
  const q = quiz.sets?.[setIndex]?.questions?.[questionIndex];
  if (!q) throw new Error(`Missing quiz question at set ${setIndex + 1} q${questionIndex + 1}`);
  q.question = question;
  q.options = options;
  q.answerIndex = answerIndex;
  q.answer = options[answerIndex];
  q.knowledge = knowledge;
  q.source = sourceLabels;
  q.claim_basis = claimBasis;
};
setq(0, 0, 'Når ble Vulkan Jernstøberi og mekaniske Verksted grunnlagt?', ['1873', '1857', '1968'], 0, 'Selve Vulkan-bedriften ble grunnlagt i 1873. 1850-årene hører til eldre industri på tomten.', [sources[0].label, sources[1].label]);
setq(0, 1, 'Hvem grunnla Vulkan Jernstøberi og mekaniske Verksted?', ['Halvor Hoaas', 'Kristin Jarmund', 'Axel Ingvald Spone Amundsen'], 0, 'Halvor Hoaas grunnla Vulkan i 1873.', [sources[0].label, sources[1].label]);
setq(0, 2, 'Hva lå på deler av industriområdet før Vulkan overtok i 1873?', ['Bagaas Brug og eldre industrivirksomhet', 'En flyplass', 'Et kongelig slott'], 0, 'Bagaas Brug og andre virksomheter gir tomten en eldre industrihistorie enn Vulkan-bedriften selv.', [sources[4].label]);
setq(0, 3, 'Hvorfor er 1873 et bedre canonical år for Vulkan enn legacy-året 1857?', ['1873 er grunnleggelsesåret for Vulkan-bedriften, mens 1850-årene tilhører forhistorien på tomten', '1857 er året jernstøperiet stengte', '1873 er året Mathallen åpnet'], 0, 'Kildekritisk må stedets eldre industrihistorie skilles fra selve Vulkan-bedriftens start.', [sources[0].label, sources[4].label], 'source_comparison');
setq(1, 0, 'Hvem kom inn som medeier i Vulkan i 1874?', ['Ferdinand Ludvig Vibe', 'Halvor Schou', 'Thorvald Meyer'], 0, 'Jernbaneingeniør Ferdinand Ludvig Vibe ble medeier i 1874.', [sources[0].label]);
setq(1, 1, 'Når ble Ferdinand Ludvig Vibe eneeier av Vulkan?', ['1876', '1886', '1897'], 0, 'Vibe ble eneeier i 1876 da Halvor Hoaas gikk ut av bedriften.', [sources[0].label]);
setq(1, 2, 'Hva skjedde med Vulkan i 1884?', ['Bedriften ble trukket inn i konkursen etter Vibes skipsverft', 'Jernstøperiet ble flyttet til Furuset', 'Broverkstedet ble Mathallen'], 0, 'Vibes skipsverft gikk konkurs og dro Vulkan med seg.', [sources[0].label, sources[1].label]);
setq(1, 5, 'Hvem ble eneeier av Vulkan i 1897 og ledet bedriften til 1939?', ['Axel Ingvald Spone Amundsen', 'Halvor Hoaas', 'Kristin Jarmund'], 0, 'Axel Ingvald Spone Amundsen utviklet blant annet broproduksjonen under sin lange lederperiode.', [sources[0].label, sources[5].label]);
setq(3, 0, 'Hva begynte Vulkan å levere til NSB og Statens Veivesen i 1886?', ['Stålbroer', 'T-banevogner', 'Fly'], 0, 'De første dokumenterte broleveransene til NSB og Statens Veivesen kom i 1886.', [sources[0].label]);
setq(3, 1, 'Hvilket bevart Vulkan-bygg ble oppført i 1908?', ['Broverkstedet', 'Westerdals-bygget', 'Vulkan Flerbrukshall'], 0, 'Broverkstedet fra 1908 er et sentralt fysisk spor etter den industrielle produksjonen.', [sources[1].label]);
setq(3, 2, 'Hvilken bygningsgruppe på Vulkan ble oppført i 1946?', ['Stålblåseriet, Maskinverkstedet og Strykejernet', 'Slottet og Stortinget', 'Broverkstedet og kornsiloen'], 0, 'Disse industribyggene ble senere viktige i områdets kultur- og ombrukshistorie.', [sources[3].label]);
setq(4, 0, 'Når ble jernstøperiet på Vulkan nedlagt?', ['1968', '1939', '2012'], 0, 'Jernstøperiet ble nedlagt i 1968 og den gjenværende virksomheten flyttet til Furuset.', [sources[0].label, sources[1].label]);
setq(4, 1, 'Hva åpnet i en ombygd industribygning på Vulkan i 1996?', ['Vulkan Flerbrukshall', 'Mathallen', 'MUNCH'], 0, 'Flerbrukshallen var et tidlig nytt bruksnivå på det tidligere fabrikkområdet.', [sources[3].label]);
setq(4, 2, 'Hva viser Dansens Hus på Vulkan særlig tydelig?', ['At gamle industribygg kan få ny kulturfunksjon', 'At alle industribygg må rives', 'At Vulkan aldri hadde verksteder'], 0, 'Dansens Hus tok i bruk ombygde industribygninger og er et klart eksempel på adaptiv ombruk.', [sources[2].label, sources[3].label]);
setq(4, 3, 'Hvem tegnet skolebygget på Vulkan som stod ferdig i 2011?', ['Kristin Jarmund', 'Halvor Hoaas', 'Ferdinand Ludvig Vibe'], 0, 'Kristin Jarmund er dokumentert som arkitekt for Westerdals-bygget fra 2011.', [sources[3].label]);
setq(4, 4, 'Hva skjedde med det gamle Broverkstedet i 2012?', ['Det ble tatt i bruk som Mathallen', 'Det ble flyttet til Furuset', 'Det ble gjort om til jernstøperi igjen'], 0, 'Broverkstedet fra 1908 ble rehabilitert og fikk ny publikumsrettet bruk i 2012.', [sources[1].label, sources[3].label]);
setq(5, 0, 'Hva er den viktigste forskjellen mellom Bagaas Brug og Vulkan i stedets tidslinje?', ['Bagaas Brug tilhører den eldre industriforhistorien, mens Vulkan-bedriften ble grunnlagt i 1873', 'De er to navn på samme bedrift fra samme år', 'Bagaas Brug kom etter 1968'], 0, 'Stedet har flere industrilag som må holdes fra hverandre for at kronologien skal bli riktig.', [sources[0].label, sources[4].label], 'source_comparison');
setq(5, 1, 'Hva er den tryggeste måten å beskrive dagens Vulkan på i et varig quizspørsmål?', ['Bruk stabile funksjoner og dokumentert ombruk fremfor en detaljert liste over dagens leietakere', 'Lås alle nåværende restauranter som evige fakta', 'Unngå all omtale av byomforming'], 0, 'Virksomhetsmiksen kan endres, mens de dokumenterte bygnings- og transformasjonslagene er mer stabile.', [sources[2].label, sources[3].label], 'time_sensitive_holdback');
write(quizPath, quiz);

const routeIndexPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const routeIndex = read(routeIndexPath);
const routeRow = routeIndex.find((row) => row.id === place.id);
if (!routeRow) throw new Error('Missing Vulkan route index row');
for (const key of ['name', 'category', 'lat', 'lon', 'r', 'year', 'coordStatus', 'coordType']) {
  routeRow[key] = place[key];
}
write(routeIndexPath, routeIndex);

const routeManifestPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const routeManifest = read(routeManifestPath);
const manifestRow = routeManifest.places.find((row) => row.id === place.id);
if (!manifestRow) throw new Error('Missing Vulkan split manifest row');
manifestRow.name = place.name;
manifestRow.category = place.category;
manifestRow.sha256 = crypto.createHash('sha256').update(fs.readFileSync(placePath)).digest('hex');
write(routeManifestPath, routeManifest);

const report = `# Vulkan industriområde – PlaceCard rounds batch 1\n\nDato: 2026-07-19\n\n## Avgrensning\n\nBatchen fortsetter Akerselva-ruten etter Nedre Foss og fyller Vulkan industriområde sine ni canonical rundinger i by-profilen. Koordinatene eies av Oslo coordinate control batch 34 og verifiseres mot coordinate-evidence; denne batchen endrer dem ikke.\n\n## Canonical år\n\nLegacy-verdien \`1857\` erstattes med \`1873\`, dokumentert grunnleggelsesår for Vulkan Jernstøberi og mekaniske Verksted. Eldre industri på tomten – blant annet Bagaas Brug og virksomhet fra 1840- og 1850-årene – beholdes som forhistorie, ikke som Vulkan-bedriftens startår.\n\n## Personer\n\n- canonical \`kristin_jarmund\` gjenbrukes\n- Halvor Hoaas opprettes som grunnlegger med direkte fysisk Vulkan-kobling\n- Ferdinand Ludvig Vibe opprettes som medeier/enereeier med direkte fysisk Vulkan-kobling\n- Axel Ingvald Spone Amundsen opprettes som eier og industrileder med direkte fysisk Vulkan-kobling\n\nEksisterende canonical people-data auditeres før opprettelse for å hindre ID- og navneduplikater.\n\n## Rundinger\n\n1. Personer\n2. Natur\n3. Merker\n4. Verk\n5. Civication\n6. Aktører\n7. Før/nå\n8. Fortellinger\n9. Leksikon\n\n## Split-sikkerhet\n\nIngen full Akerselva-splitting. Bare \`vulkan_industriomrade.json\`, Vulkan-raden i route index og Vulkan-radens hash i split-manifestet endres blant route-place-filene.\n\n## Kilder\n\n${sources.map((source) => `- ${source.label}`).join('\n')}\n`;
fs.mkdirSync('reports/vulkan-industriomrade-rounds-batch1', { recursive: true });
fs.writeFileSync('reports/vulkan-industriomrade-rounds-batch1.md', report);

const test = `const assert = require('assert');\nconst crypto = require('crypto');\nconst fs = require('fs');\nconst path = require('path');\nconst repo = path.resolve(__dirname, '..');\nconst read = (file) => JSON.parse(fs.readFileSync(path.join(repo, file), 'utf8'));\nconst placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/vulkan_industriomrade.json';\nconst place = read(placePath);\nconst evidence = read('data/coordinate-evidence/oslo/natur/vulkan_industriomrade.json');\nassert.strictEqual(place.id, 'vulkan_industriomrade');\nassert.strictEqual(place.category, 'by');\nassert.strictEqual(place.year, 1873);\nassert.deepStrictEqual([place.lat, place.lon, place.r], [evidence.currentCoordinate.lat, evidence.currentCoordinate.lon, evidence.currentCoordinate.r]);\nassert.strictEqual(place.coordStatus, 'verified');\nassert.strictEqual(place.address.street, 'Maridalsveien');\nassert.strictEqual(place.address.number, '17');\nconst expectedRounds = ['people','nature','badges','works','civication','brands','før_nå','fortellinger','leksikon'];\nconst runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');\nconst match = runtime.match(/by:\\s*\\[([^\\]]+)\\]/);\nassert(match, 'Missing by round profile');\nassert.deepStrictEqual(JSON.parse('[' + match[1] + ']'), expectedRounds);\nconst kristin = read('data/people/by/oslo/people_by_oslo.json').find((person) => person.id === 'kristin_jarmund');\nassert(kristin && kristin.places.includes('vulkan_industriomrade'));\nconst personPaths = ['data/people/historie/oslo/akerselva/halvor_hoaas.json','data/people/historie/oslo/akerselva/ferdinand_ludvig_vibe.json','data/people/historie/oslo/akerselva/axel_ingvald_spone_amundsen.json'];\nconst newPeople = personPaths.map((file) => read(file)[0]);\nfor (const person of newPeople) { assert.strictEqual(person.placeId, place.id); assert(person.places.includes(place.id)); assert(person.source_urls.length >= 2); }\nconst peopleManifest = read('data/people/manifest.json');\nfor (const file of personPaths) assert(peopleManifest.files.includes(file.replace(/^data\\//, '')));\nconst ids = new Set();\nfor (const person of [kristin, ...newPeople]) { assert(!ids.has(person.id)); ids.add(person.id); }\nconst relations = read('data/relations.json');\nfor (const id of ['rel_halvor_hoaas_vulkan_grunnlegger','rel_ferdinand_ludvig_vibe_vulkan_eier','rel_axel_ingvald_spone_amundsen_vulkan_eier','rel_kristin_jarmund_vulkan_arkitekt']) assert(relations.some((row) => row.id === id));\nassert(place.works.length >= 10);\nassert(place.civication_store.length >= 5 && place.civication_store.every((item) => item.physicalObject && item.placeSpecific));\nassert(place.brands.length >= 9);\nassert(place.for_na.look_for.length >= 8);\nassert(place.nature_profile.summary.length >= 700);\nconst validByBadges = new Set(read('data/badges/by.json').sub);\nassert(place.underbadge_ids.length >= 3 && place.underbadge_ids.every((id) => validByBadges.has(id)));\nconst storyPath = 'data/stories/stories_vulkan_industriomrade.json';\nconst story = read(storyPath)[0];\nassert(story.related_people.includes('halvor_hoaas') && story.related_people.includes('kristin_jarmund'));\nassert(story.sources.length >= 6);\nassert(read('data/stories/stories_manifest.json').files.some((row) => row.entity_id === place.id && row.path === storyPath));\nconst article = read('data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json').find((row) => row.place_id === place.id);\nassert(article && article.version === 2);\nassert(article.facts.length >= 11);\nassert(article.chronology.length >= 16);\nassert(article.sources.length >= 6);\nassert(article.links.related_people.includes('axel_ingvald_spone_amundsen'));\nconst quiz = read('data/quiz/historie/vulkan_industriomrade_sets.json');\nassert.strictEqual(quiz.sets.length, 6);\nassert(quiz.sets.every((set) => set.questions.length === 7));\nconst index = read('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json').find((row) => row.id === place.id);\nassert.deepStrictEqual([index.lat,index.lon,index.r,index.year],[place.lat,place.lon,place.r,place.year]);\nconst manifest = read('data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json').places.find((row) => row.id === place.id);\nconst actualHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(repo, placePath))).digest('hex');\nassert.strictEqual(manifest.sha256, actualHash);\nconst all = JSON.stringify({place, story, article, quiz, newPeople});\nfor (const token of ['1849','1853','1873','1874','1876','1884','1886','1897','1908','1946','1968','1996','2007','2010','2011','2012','Halvor Hoaas','Ferdinand Ludvig Vibe','Axel Ingvald Spone Amundsen','Kristin Jarmund','Broverkstedet','stålbro']) assert(all.includes(token), 'Missing ' + token);\nconsole.log('Vulkan industriområde rounds batch 1 OK');\n`;
fs.writeFileSync('tests/vulkan-industriomrade-rounds-batch1.test.js', test);
