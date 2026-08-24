import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, value) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`);
};
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const uniq = xs => [...new Set(xs)];

const placePath = 'data/places/by/oslo/places/birkelunden.json';
const place = read(placePath);
if (place.id !== 'birkelunden') throw new Error('Wrong place owner');
if (place.spatial_profile?.area_m2 !== 16300) throw new Error('Birkelunden area lock failed');
if (sha(place.desc) !== 'ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe') throw new Error('desc preservation hash failed');
if (sha(place.popupDesc) !== '670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7') throw new Error('popupDesc preservation hash failed');

place.objects = [
  {
    id: 'birkelunden_foell',
    title: 'Føll',
    type: 'bronsegruppe',
    kind: 'public_art',
    creator: 'Ørnulf Bast',
    year: 1953,
    desc: 'Ørnulf Basts bronsegruppe Føll ble satt opp i Birkelunden i 1953 og er et eget kunstspor inne i parkens canonical avgrensning.',
    placeSpecificReason: 'Verket står i Birkelunden og dokumenteres som del av parkens egen objekt- og minnehistorie, ikke som et nabostedsverk.',
    source_urls: [
      'https://oslobyleksikon.no/side/Birkelunden',
      'https://snl.no/Birkelunden'
    ],
    verifiedAt: '2026-08-24'
  },
  {
    id: 'birkelunden_jack_johnsen_byste',
    title: 'Bysten av Jack Johnsen',
    type: 'minnebyste',
    kind: 'memorial',
    subject: 'Jack Johnsen',
    year: 1984,
    desc: 'Pensjonister reiste i 1984 en byste av Jack Johnsen i Birkelunden. Minnesmerket knytter parkens fysiske miljø til organiseringen som vokste ut av pensjonistmøtene her.',
    placeSpecificReason: 'Bysten er reist i selve Birkelunden og peker tilbake til den dokumenterte lokale foreningshistorien fra parkbenken og hvilebrakken.',
    source_urls: [
      'https://oslobyleksikon.no/side/Birkelunden',
      'https://www.pensjonistforbundet.no/om-oss/var-historie'
    ],
    verifiedAt: '2026-08-24'
  },
  {
    id: 'birkelunden_spaniamonumentet',
    title: 'Spaniamonumentet',
    type: 'minnesmerke',
    kind: 'public_art_memorial',
    creator: 'Nils Aas',
    year: 1989,
    desc: 'Nils Aas laget minnesmerket over nordmenn som deltok i de internasjonale brigadene i den spanske borgerkrigen. Monumentet ble reist i Birkelunden i 1989.',
    placeSpecificReason: 'Monumentet står i Birkelunden og er et datert fysisk minnespor i parkens egen historie.',
    source_urls: [
      'https://oslobyleksikon.no/side/Birkelunden',
      'https://nils-aas-kunstverksted.no/nils-aas/biografi/'
    ],
    verifiedAt: '2026-08-24'
  }
];

place.structures = [
  {
    id: 'birkelunden_musikkpaviljong',
    name: 'Musikkpaviljongen',
    type: 'paviljong',
    kind: 'park_structure',
    year: 1926,
    architect: 'Otto Hald',
    desc: 'Den nåværende musikkpaviljongen ble reist i 1926 etter en arkitektkonkurranse og tegnet av arkitekt Otto Hald. Den er et fast orienteringspunkt i Birkelundens sentrale parkrom.',
    image: place.for_na?.beforeImage || place.image,
    source_urls: [
      'https://oslobyleksikon.no/side/Birkelunden',
      'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-grontomrader/birkelunden/'
    ],
    verifiedAt: '2026-08-24'
  },
  {
    id: 'birkelunden_vannbasseng',
    name: 'Vannbassenget',
    type: 'parkbasseng',
    kind: 'park_structure',
    period: '1927–1928',
    desc: 'Vannbassenget ved paviljongen ble anlagt i 1927–1928. Basseng- og beplantningsanlegget ble senere arbeidet med i parkopprustningen 1984–1986.',
    image: place.for_na?.nowImage || place.cardImage || place.image,
    source_urls: [
      'https://oslobyleksikon.no/side/Birkelunden'
    ],
    verifiedAt: '2026-08-24'
  }
];

place.round_profile = {
  schema: 'history_go_place_round_profile_v1',
  content_round_ids: ['people', 'images', 'brands', 'structures'],
  reason: 'Birkelunden bruker People, kildeavklarte parkbilder, Bondens marked og to egne parkstrukturer som de fire visuelle rundingene. Objects er fortsatt canonical eget innhold med Føll, Jack Johnsen-bysten og Spaniamonumentet, men velges ikke som visuell runding fordi tre separate rettighetsavklarte objektbilder ikke finnes; dette unngår bilde-filler og nabostedsproxy.',
  reviewedAt: '2026-08-24'
};

place.history_profile = {
  schema: 'history_go_place_history_profile_v1',
  central_intention: 'Birkelunden skal leses som et planlagt offentlig parkrom midt i Grünerløkkas murby, ikke som en generell bydelsflate. Historien følger hvordan det donerte grøntarealet fikk nye funksjoner, paviljong, basseng, organisering, kunst og minnespor uten at parkens egen geometri blandes med det større fredede kulturmiljøet.',
  geography: 'Park-place er 16,3 dekar mellom Toftes gate, Seilduksgata, Thorvald Meyers gate og Schleppegrells gate. Det fredede Birkelunden kulturmiljøet rundt er om lag 116 dekar og er en større kontekst, ikke parkens areal.',
  plan_and_function: 'Thorvald Meyer anla parken i 1860-årene og overførte den til kommunen i 1882 med vilkår om at arealet ikke skulle bebygges. Omleggingen 1916–1920, paviljongen fra 1926 og bassenget fra 1927–1928 viser hvordan rekreasjon, lek, skøyter, musikk og opphold ble skrevet inn i parkens fysiske struktur.',
  time_layers: [
    '1860-årene–1882: anlegg, planting og kommunal overføring',
    '1916–1928: omlegging, aktivitet, musikkpaviljong og vannbasseng',
    '1937–1989: pensjonistorganisering, kunstverk og minnesmerker',
    '1996–2006: fredningsprosess for det større kulturmiljøet rundt parken'
  ],
  local_knowledge: 'Parkbenken og hvilebrakken knytter Birkelunden til pensjonistenes organisering i 1937. Føll, Jack Johnsen-bysten og Spaniamonumentet gjør ulike etterkrigslag synlige på stedet, mens navneparet Bjerkelunden/Birkelunden viser hvordan også stedsnavnet har skiftet form.',
  own_place_boundary: 'Paulus kirke, Grünerløkka skole, Olaf Ryes plass og andre nabosteder kan inngå i kulturmiljøkontekst eller relasjoner, men eies ikke som Birkelunden-structures, objects eller People-proxy.',
  sources: [
    'https://oslobyleksikon.no/side/Birkelunden',
    'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-grontomrader/birkelunden/',
    'https://www.riksantikvaren.no/kulturhistorie/birkelunden-murbyens-hjerte/',
    'https://www.pensjonistforbundet.no/om-oss/var-historie'
  ],
  reviewedAt: '2026-08-24'
};

write(placePath, place);

// People: a direct Birkelunden profile for Jack Johnsen, without inventing missing biographical metadata or portrait rights.
const jackProfilePath = 'data/people/by/oslo/birkelunden/jack_johnsen.json';
const jackClaimsPath = 'data/people/claims/by/oslo/birkelunden/jack_johnsen.claims.json';
const jack = {
  id: 'jack_johnsen',
  name: 'Jack Johnsen',
  initials: 'JJ',
  desc: 'Pensjonistorganisator knyttet direkte til Birkelunden, der en gruppe som møttes i parken organiserte seg som Venner i Bjerkelunden i 1937.',
  tags: ['by', 'birkelunden', 'pensjonisthistorie', 'organisering'],
  placeId: 'birkelunden',
  category: 'by',
  kindLabel: 'Pensjonistorganisator',
  year: 1937,
  popupDesc: 'Pensjonistforbundet beskriver Jack Johnsen som pådriver for en gruppe på 10–12 pensjonister som møttes på en benk i Birkelunden. Etter at gruppen fikk låne hvilebrakken i parken, var 18 personer med på å stifte Venner i Bjerkelunden i 1937. I 1984 ble en byste av Jack Johnsen reist i Birkelunden av pensjonister.',
  places: ['birkelunden'],
  image: '',
  cardImage: '',
  externalLinks: [
    { type: 'source', label: 'Pensjonistforbundet – Vår historie', url: 'https://www.pensjonistforbundet.no/om-oss/var-historie', verifiedAt: '2026-08-24' },
    { type: 'source', label: 'Oslo byleksikon – Birkelunden', url: 'https://oslobyleksikon.no/side/Birkelunden', verifiedAt: '2026-08-24' }
  ],
  source_urls: [
    'https://www.pensjonistforbundet.no/om-oss/var-historie',
    'https://oslobyleksikon.no/side/Birkelunden'
  ],
  verifiedAt: '2026-08-24',
  profileStandard: 'people_profile_v1.0',
  claimsFile: jackClaimsPath,
  profileStatus: 'ready_people_v1'
};
write(jackProfilePath, jack);
write(jackClaimsPath, {
  schema: 'history_go_people_claims_v1',
  version: '1.0.0',
  person_id: 'jack_johnsen',
  profile_file: jackProfilePath,
  identity: {
    canonical_identity: 'Jack Johnsen, pensjonistorganisator dokumentert som pådriver for gruppen som organiserte seg i Birkelunden i 1937.',
    name_variants: [],
    not: ['navnelike personer', 'senere innehavere av samme navn'],
    identity_status: 'verified'
  },
  claims: [
    {
      id: 'birkelunden_bench_group',
      claim: 'Pensjonistforbundet beskriver Jack Johnsen som pådriver for en gruppe på 10–12 pensjonister som møttes på en benk i Birkelunden.',
      status: 'verified',
      source_url: 'https://www.pensjonistforbundet.no/om-oss/var-historie',
      source_location: 'avsnittet om Jack Johnsen og møtene på benken i Birkelunden',
      source_type: 'primary_organization_history',
      temporal_status: 'historical',
      verified_at: '2026-08-24',
      evidence_level: 'direct'
    },
    {
      id: 'friends_founded_1937',
      claim: 'Etter at gruppen fikk låne hvilebrakken i Birkelunden, var 18 personer med på å stifte Venner i Bjerkelunden i 1937.',
      status: 'verified',
      source_url: 'https://www.pensjonistforbundet.no/om-oss/var-historie',
      source_location: 'avsnittet om hvilebrakken og stiftelsen i 1937',
      source_type: 'primary_organization_history',
      temporal_status: 'historical',
      verified_at: '2026-08-24',
      evidence_level: 'direct'
    },
    {
      id: 'johnsen_bust_1984',
      claim: 'I 1984 ble en byste av Jack Johnsen reist i Birkelunden av pensjonister.',
      status: 'verified',
      source_url: 'https://oslobyleksikon.no/side/Birkelunden',
      source_location: 'avsnittet om skulpturer og minnesmerker i parken',
      source_type: 'recognized_reference',
      temporal_status: 'historical',
      verified_at: '2026-08-24',
      evidence_level: 'direct'
    }
  ],
  field_claim_map: {
    name: ['birkelunden_bench_group'],
    kindLabel: ['birkelunden_bench_group'],
    year: ['friends_founded_1937'],
    placeId: ['birkelunden_bench_group', 'friends_founded_1937'],
    'places[birkelunden]': ['birkelunden_bench_group', 'friends_founded_1937']
  },
  sentence_claim_map: {
    desc: [{ sentence: 1, claim_ids: ['birkelunden_bench_group', 'friends_founded_1937'] }],
    popupDesc: [
      { sentence: 1, claim_ids: ['birkelunden_bench_group'] },
      { sentence: 2, claim_ids: ['friends_founded_1937'] },
      { sentence: 3, claim_ids: ['johnsen_bust_1984'] }
    ]
  },
  completion: {
    completed_under: 'people_profile_v1.0',
    claims_verified: '3/3',
    fact_review: 'passed',
    editorial_review: 'passed',
    source_verified_at: '2026-08-24',
    validator_version: '1.0.0',
    current_status: 'ready_people_v1'
  }
});

const peopleManifestPath = 'data/people/manifest.json';
const peopleManifest = read(peopleManifestPath);
const jackManifestPath = 'people/by/oslo/birkelunden/jack_johnsen.json';
if (!peopleManifest.files.includes(jackManifestPath)) peopleManifest.files.push(jackManifestPath);
peopleManifest.files = uniq(peopleManifest.files);
write(peopleManifestPath, peopleManifest);

// Quiz production: five source-borne learning jobs, 35 questions, first 14 direct place facts.
const sources = {
  oslo_byleksikon: {
    url: 'https://oslobyleksikon.no/side/Birkelunden',
    source_type: 'local_history_encyclopedia',
    review_status: 'reviewed',
    review_note: 'Kontrollert mot Birkelunden-artikkelen for parkhistorie, paviljong, basseng, navnehistorie, skulpturer, minnesmerker og fredningskontekst.'
  },
  oslo_kommune: {
    url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-grontomrader/birkelunden/',
    source_type: 'municipal_primary',
    review_status: 'reviewed',
    review_note: 'Kontrollert for dagens parkidentitet, areal, fasiliteter og kommunal forvaltning.'
  },
  riksantikvaren: {
    url: 'https://www.riksantikvaren.no/kulturhistorie/birkelunden-murbyens-hjerte/',
    source_type: 'national_heritage_authority',
    review_status: 'reviewed',
    review_note: 'Kontrollert for murby-/kulturmiljøkontekst og skillet mellom parken og det større fredede området.'
  },
  pensjonistforbundet: {
    url: 'https://www.pensjonistforbundet.no/om-oss/var-historie',
    source_type: 'primary_organization_history',
    review_status: 'reviewed',
    review_note: 'Kontrollert for Jack Johnsen, benkgruppen, hvilebrakken, 18 stiftere og Venner i Bjerkelunden i 1937.'
  },
  nils_aas: {
    url: 'https://nils-aas-kunstverksted.no/nils-aas/biografi/',
    source_type: 'artist_institution',
    review_status: 'reviewed',
    review_note: 'Kontrollert sammen med Oslo byleksikon for Nils Aas og Spaniamonumentet; 1989 brukes, mens SNLs avvikende 1889-dato er avvist.'
  },
  oslo_museum_before: {
    url: 'https://www.oslobilder.no/OMU/OB.Z02741',
    source_type: 'museum_archive_image',
    review_status: 'reviewed',
    review_note: 'Fase 7D-kontrollert historisk Birkelunden-bilde fra ca. 1930 med paviljong og sentralt parkrom.'
  },
  commons_after: {
    url: 'https://commons.wikimedia.org/wiki/File:Birkelunden,_Oslo_-_2013-10-13_at_13-18-12.jpg',
    source_type: 'licensed_image',
    review_status: 'reviewed',
    review_note: 'Fase 7D-kontrollert bilde fra 2013; brukes som datert etter-bilde, ikke som dokumentasjon av eksakt 2026-tilstand.'
  }
};

const defs = [
  // set 1 – opening
  ['q01','opening','fact','em_by_parker_som_sosial_infrastruktur','Hvem anla Birkelunden i 1860-årene?',['Thorvald Meyer','Otto Hald','Nils Aas'],0,'Thorvald Meyer','Thorvald Meyer anla Birkelunden i 1860-årene som del av utbyggingen på Grünerløkka.',['oslo_byleksikon','riksantikvaren']],
  ['q02','opening','fact','em_by_historiske_lag_i_hverdagsrom','Når ble Birkelunden anlagt?',['I 1860-årene','I 1920-årene','I 1980-årene'],0,'I 1860-årene','Birkelunden ble anlagt i 1860-årene. Senere ombygginger og minnespor kom i flere tydelige lag.',['oslo_byleksikon','riksantikvaren']],
  ['q03','opening','fact','em_by_parker_som_sosial_infrastruktur','Når ble Birkelunden overført til kommunen?',['1906','1882','1955'],1,'1882','Thorvald Meyer overførte parken til kommunen i 1882.',['oslo_byleksikon','riksantikvaren']],
  ['q04','opening','fact','em_by_parker_som_sosial_infrastruktur','Hvilket vilkår fulgte overføringen av Birkelunden til kommunen?',['At parken skulle brukes som idrettsstadion','At området ikke skulle bebygges','At parken skulle stenges om vinteren'],1,'At området ikke skulle bebygges','Overføringen til kommunen hadde et vilkår om at parkarealet ikke skulle bebygges.',['oslo_byleksikon','riksantikvaren']],
  ['q05','opening','fact','em_by_parker_som_sosial_infrastruktur','Hvor stort er selve Birkelunden park?',['16,3 dekar','116 dekar','1,63 dekar'],0,'16,3 dekar','Birkelunden park er 16,3 dekar. Tallet rundt 116 dekar gjelder det større fredede kulturmiljøet og skal ikke brukes som parkareal.',['oslo_kommune','riksantikvaren']],
  ['q06','opening','fact','em_by_historiske_lag_i_hverdagsrom','Hvilken gate ligger langs østsiden av Birkelunden?',['Pilestredet','Thorvald Meyers gate','Torggata'],1,'Thorvald Meyers gate','Thorvald Meyers gate danner parkens østside; parkens øvrige avgrensning følger Toftes gate, Seilduksgata og Schleppegrells gate.',['oslo_byleksikon','oslo_kommune']],
  ['q07','opening','fact','em_by_parker_som_sosial_infrastruktur','Hva er tallet rundt 116 dekar knyttet til ved Birkelunden?',['Selve parkens plenareal','Det større fredede Birkelunden kulturmiljøet','Bare lekearealet'],1,'Det større fredede Birkelunden kulturmiljøet','Rundt 116 dekar beskriver det større fredede kulturmiljøet rundt parken, ikke park-place på 16,3 dekar.',['riksantikvaren']],
  // set 2 – opening/middle, still direct facts
  ['q08','middle','fact','em_by_parker_som_sosial_infrastruktur','Hva ble blant annet lagt til da Birkelunden ble omlagt i 1916–1920?',['Leke- og aktivitetsmuligheter','En motorvei','Et rådhus'],0,'Leke- og aktivitetsmuligheter','Omleggingen 1916–1920 ga parken tydeligere rekreasjons- og aktivitetsfunksjoner, blant annet leke- og skøytemuligheter.',['oslo_byleksikon']],
  ['q09','middle','fact','em_by_historiske_lag_i_hverdagsrom','Når ble den nåværende musikkpaviljongen i Birkelunden reist?',['1882','1926','1989'],1,'1926','Den nåværende musikkpaviljongen ble reist i 1926.',['oslo_byleksikon']],
  ['q10','middle','fact','em_by_historiske_lag_i_hverdagsrom','Hvem tegnet den nåværende musikkpaviljongen?',['Otto Hald','Ørnulf Bast','Nils Aas'],0,'Otto Hald','Arkitekt Otto Hald tegnet musikkpaviljongen som ble reist i 1926 etter en arkitektkonkurranse.',['oslo_byleksikon']],
  ['q11','middle','fact','em_by_historiske_lag_i_hverdagsrom','Når ble vannbassenget ved paviljongen anlagt?',['1927–1928','1953–1955','2005–2006'],0,'1927–1928','Vannbassenget ble anlagt i 1927–1928, kort tid etter den nåværende paviljongen.',['oslo_byleksikon']],
  ['q12','middle','fact','em_by_historiske_lag_i_hverdagsrom','Hvilken navneform ble offisiell for parken i 1926?',['Bjerkelunden','Meyerlunden','Paulusparken'],0,'Bjerkelunden','Bjerkelunden ble offisiell navneform i 1926.',['oslo_byleksikon']],
  ['q13','middle','fact','em_by_historiske_lag_i_hverdagsrom','Når kom navneformen Birkelunden tilbake som offisiell form?',['1937','1955','2006'],1,'1955','I 1955 ble Birkelunden igjen offisiell navneform etter perioden med Bjerkelunden.',['oslo_byleksikon']],
  ['q14','middle','fact','em_by_historiske_lag_i_hverdagsrom','Hvem laget bronsegruppen Føll i Birkelunden?',['Nils Aas','Ørnulf Bast','Otto Hald'],1,'Ørnulf Bast','Ørnulf Bast laget bronsegruppen Føll, som ble satt opp i Birkelunden i 1953.',['oslo_byleksikon']],
  // set 3 – middle
  ['q15','middle','fact','em_by_parker_som_sosial_infrastruktur','Hvor møttes gruppen rundt Jack Johnsen først ifølge Pensjonistforbundets historie?',['På en benk i Birkelunden','I Oslo rådhus','På en jernbanestasjon'],0,'På en benk i Birkelunden','Pensjonistforbundet beskriver 10–12 pensjonister som møttes på en benk i Birkelunden, med Jack Johnsen som pådriver.',['pensjonistforbundet']],
  ['q16','middle','fact','em_by_parker_som_sosial_infrastruktur','Hvor mange var med på å stifte Venner i Bjerkelunden i 1937 ifølge Pensjonistforbundet?',['8','18','80'],1,'18','Etter benkmøtene og bruken av hvilebrakken var 18 personer med på å stifte Venner i Bjerkelunden i 1937.',['pensjonistforbundet']],
  ['q17','middle','fact','em_by_historiske_lag_i_hverdagsrom','Når ble bysten av Jack Johnsen reist i Birkelunden?',['1953','1984','2006'],1,'1984','Pensjonister reiste bysten av Jack Johnsen i Birkelunden i 1984.',['oslo_byleksikon']],
  ['q18','middle','fact','em_by_historiske_lag_i_hverdagsrom','Hvem laget Spaniamonumentet i Birkelunden?',['Nils Aas','Ørnulf Bast','Thorvald Meyer'],0,'Nils Aas','Nils Aas laget minnesmerket over nordmenn som deltok i de internasjonale brigadene i den spanske borgerkrigen.',['oslo_byleksikon','nils_aas']],
  ['q19','middle','fact','em_by_historiske_lag_i_hverdagsrom','Hvilket år ble Spaniamonumentet reist i Birkelunden?',['1889','1955','1989'],2,'1989','Oslo byleksikon og Nils Aas-kildegrunnlaget støtter 1989. Den avvikende 1889-formen i en sekundærkilde er holdt ute.',['oslo_byleksikon','nils_aas']],
  ['q20','middle','context','em_by_historiske_lag_i_hverdagsrom','Hva viser opprustningen i 1984–1986 om Birkelunden?',['At parkens fysiske anlegg også er blitt fornyet over tid','At parken ble flyttet til et annet sted','At hele parken ble bebygd'],0,'At parkens fysiske anlegg også er blitt fornyet over tid','Arbeid med basseng, beplantning og trær i 1984–1986 viser at Birkelunden har vært forvaltet og fysisk justert etter etableringen.',['oslo_byleksikon']],
  ['q21','middle','context','em_by_historiske_lag_i_hverdagsrom','Hvorfor er musikkpaviljongen et nyttig fast holdepunkt i Birkelundens Før/etter-par?',['Den står synlig i parkrommet på tvers av flere tidslag','Den ble flyttet mellom bydelene','Den er eldre enn hele Grünerløkka'],0,'Den står synlig i parkrommet på tvers av flere tidslag','Paviljongen fra 1926 er et gjenkjennelig fysisk anker i den historiske ca. 1930-dokumentasjonen og det daterte nyere parkbildet.',['oslo_museum_before','commons_after','oslo_byleksikon']],
  // set 4 – bridge
  ['q22','bridge','context','em_by_historiske_lag_i_hverdagsrom','Hva viser kombinasjonen av 1996 og 2006 i Birkelundens vernehistorie?',['At fredningen var en prosess over tid','At parken bare var vernet i ti dager','At parkens areal økte til 116 dekar'],0,'At fredningen var en prosess over tid','Kildegrunnlaget skiller mellom starten på fredningsprosessen i 1996 og selve fredningen av det større kulturmiljøet i 2006.',['oslo_byleksikon','riksantikvaren']],
  ['q23','bridge','context','em_by_parker_som_sosial_infrastruktur','Hvorfor skal ikke 116 dekar brukes som størrelse på Birkelunden park?',['Fordi det er arealet til det større kulturmiljøet rundt parken','Fordi tallet gjelder bare paviljongen','Fordi parkens areal er ukjent'],0,'Fordi det er arealet til det større kulturmiljøet rundt parken','Parken er 16,3 dekar. Omtrent 116 dekar gjelder en større fredet bystruktur som også omfatter bebyggelse og andre elementer rundt parken.',['oslo_kommune','riksantikvaren']],
  ['q24','bridge','fact','em_by_historiske_lag_i_hverdagsrom','Hva omfatter det fredede Birkelunden kulturmiljøet i tillegg til selve parken?',['Bare parkeringsplasser','Omkringliggende murbybebyggelse og offentlige bygg','Kun Akerselva'],1,'Omkringliggende murbybebyggelse og offentlige bygg','Riksantikvaren beskriver et større kulturmiljø der parken inngår sammen med murbykvartaler og offentlige bygg. Det betyr ikke at disse eies av park-place som structures.',['riksantikvaren']],
  ['q25','bridge','fact','em_by_parker_som_sosial_infrastruktur','Hvilket fysisk element er fortsatt en sentral del av Birkelundens parkmiljø?',['Musikkpaviljongen','Barcode-rekken','Akershus festning'],0,'Musikkpaviljongen','Den nåværende paviljongen fra 1926 er fortsatt en sentral struktur i parken og brukes som orienteringspunkt i historiske og nyere bilder.',['oslo_byleksikon','oslo_kommune']],
  ['q26','bridge','context','em_by_parker_som_sosial_infrastruktur','Hva forteller tre- og beplantningsfornyelse om en historisk park som Birkelunden?',['At historisk kontinuitet kan eksistere samtidig med løpende skjøtsel og utskifting','At alle trær må være fra 1860-årene','At vern stopper all parkforvaltning'],0,'At historisk kontinuitet kan eksistere samtidig med løpende skjøtsel og utskifting','Birkelundens historie omfatter både gamle plantinger og senere fornyelse. Et historisk parkrom trenger derfor ikke bestå av uendrede enkelttrær for å ha kontinuitet.',['oslo_byleksikon','riksantikvaren']],
  ['q27','bridge','context','em_by_historiske_lag_i_hverdagsrom','Hvorfor skal Paulus kirke ikke legges inn som en Birkelunden-structure?',['Kirken er et eget sted i det større kulturmiljøet, ikke en struktur eid av park-place','Fordi kirker aldri kan vises i History Go','Fordi kirken ikke ligger på Grünerløkka'],0,'Kirken er et eget sted i det større kulturmiljøet, ikke en struktur eid av park-place','Det større fredede kulturmiljøet binder flere steder sammen, men parkens canonical innhold må fortsatt holde own-place-grensen.',['riksantikvaren']],
  ['q28','bridge','context','em_by_historiske_lag_i_hverdagsrom','Hva kan Før/etter-bildene dokumentere sikrest?',['At faste parkankre som paviljong og sentralt parkrom kan sammenlignes over tid','Nøyaktig hvem som brukte parken hver dag','Eksakt boligpris rundt parken'],0,'At faste parkankre som paviljong og sentralt parkrom kan sammenlignes over tid','Bildene støtter visuelle sammenligninger av synlige parkankre. De dokumenterer ikke alene sosial sammensetning, boligpriser eller årsaker til endring.',['oslo_museum_before','commons_after']],
  // set 5 – final, method/observation/concept without named-theory filler
  ['q29','final','concept','em_by_historiske_lag_i_hverdagsrom','Hvilken arealbruk er mest presis når du beskriver Birkelunden?',['16,3 dekar for parken og ca. 116 dekar for det større kulturmiljøet','116 dekar for parken og 16,3 dekar for hele kulturmiljøet','Samme arealtall for begge'],0,'16,3 dekar for parken og ca. 116 dekar for det større kulturmiljøet','Presis stedslesning krever at parkens egen geometri holdes fra den større vernekonteksten.',['oslo_kommune','riksantikvaren']],
  ['q30','final','comparison','em_by_historiske_lag_i_hverdagsrom','Hva bør du først finne når du sammenligner Birkelunden ca. 1930 med bildet fra 2013?',['Et fast fysisk anker som paviljongen og parkrommets hovedretning','En tilfeldig bilmodell','En person som må være den samme'],0,'Et fast fysisk anker som paviljongen og parkrommets hovedretning','Før/etter-metoden blir sikrere når samme eller tydelig gjenkjennelige fysiske ankre brukes før forskjeller beskrives.',['oslo_museum_before','commons_after'], 'met_for_etter'],
  ['q31','final','concept','em_by_historiske_lag_i_hverdagsrom','Hva kan du ikke konkludere om bare fra Birkelundens 2013-bilde?',['At bildet viser parkens eksakte tilstand i 2026','At paviljongen var synlig i 2013','At bildet er nyere enn ca. 1930-bildet'],0,'At bildet viser parkens eksakte tilstand i 2026','Et datert etter-bilde dokumenterer sin egen opptakstid. Det skal ikke automatisk restemples som dagens tilstand.',['commons_after']],
  ['q32','final','concept','em_by_parker_som_sosial_infrastruktur','Hva er den sikreste lesningen av omleggingen 1916–1920?',['At dokumenterte leke-, skøyte- og rekreasjonsfunksjoner ble tydeligere bygget inn i parken','At all tidligere parkbruk opphørte','At parken ble privat'],0,'At dokumenterte leke-, skøyte- og rekreasjonsfunksjoner ble tydeligere bygget inn i parken','Kilden dokumenterer nye eller styrkede aktivitetsfunksjoner. Den beviser ikke at all tidligere bruk forsvant.',['oslo_byleksikon']],
  ['q33','final','concept','em_by_parker_som_sosial_infrastruktur','Hva gjør overføringen i 1882 særlig relevant for å forstå Birkelunden som offentlig rom?',['Den kobler en privat utbyggers parkinitiativ til kommunalt eierskap og et vilkår mot bebyggelse','Den gjorde parken til privat hage','Den fjernet all kommunal forvaltning'],0,'Den kobler en privat utbyggers parkinitiativ til kommunalt eierskap og et vilkår mot bebyggelse','Meyer anla parken, men 1882-overføringen plasserte den i kommunal forvaltning under et uttrykkelig arealvilkår.',['oslo_byleksikon','riksantikvaren']],
  ['q34','final','concept','em_by_parker_som_sosial_infrastruktur','Hva gjør historien om Jack Johnsen spesielt stedsspesifikk?',['Benk, hvilebrakke, stiftelse og senere byste er alle forankret i Birkelunden','Den handler bare om en nasjonal organisasjon uten parktilknytning','Den foregår på Olaf Ryes plass'],0,'Benk, hvilebrakke, stiftelse og senere byste er alle forankret i Birkelunden','Historien binder sosial praksis til konkrete parksteder og et senere fysisk minnespor.',['pensjonistforbundet','oslo_byleksikon']],
  ['q35','final','observation','em_by_historiske_lag_i_hverdagsrom','Hvordan kan kunst- og minneobjektene hjelpe deg å lese Birkelundens etterkrigshistorie?',['Ved å følge daterte spor som Føll 1953, Jack Johnsen-bysten 1984 og Spaniamonumentet 1989','Ved å anta at alle tre er fra samme år','Ved å behandle dem som bygg i nabokvartalene'],0,'Ved å følge daterte spor som Føll 1953, Jack Johnsen-bysten 1984 og Spaniamonumentet 1989','De tre verkene ligger i parken, men peker mot ulike temaer og tidspunkter. Dateringen gjør dem til konkrete, adskilte historiske lag.',['oslo_byleksikon','nils_aas']]
];

if (defs.length !== 35) throw new Error(`Expected 35 quiz defs, got ${defs.length}`);
const claims = defs.map((d, index) => ({
  claim_id: `claim_birkelunden_${d[0]}`,
  order: index + 1,
  planned_phase: d[1],
  family: d[2],
  statement: d[7],
  source_ids: d[8],
  source_origin: 'external',
  emne_id: d[3]
}));

const selectedCurriculum = {
  pensum_module_ids: ['kur_by_01_byrom_akser_knutepunkt','kur_by_04_historiske_lag_og_transformasjon'],
  emne_ids: ['em_by_parker_som_sosial_infrastruktur','em_by_opphold_vs_gjennomgang','em_by_historiske_lag_i_hverdagsrom'],
  topic_hook_ids: [],
  method_ids: ['met_for_etter'],
  thinker_ids: [],
  works: []
};
const existingQuizAudit = {
  searched_paths: [
    'data/quiz/manifest.json',
    'data/quiz/by/',
    'data/quiz/by/arkiv/',
    'data/quizcards/by/',
    'reports/place-production/birkelunden-nullmaaling-v1.md'
  ],
  active_before: { file: null, set_count: 0, question_count: 0, finding: 'Ingen manifest-loadet quizpakke med package targetId=birkelunden.' },
  legacy_before: { finding: 'Repoet har spørsmål i andre mål som omtaler Birkelunden og Nature unlock-referansen birkelunden_quiz_1, men ingen av disse er en canonical Birkelunden-eid Place-quiz.' },
  decisions: [
    'Opprett ny manifest-loadet Birkelunden-pakke uten å kopiere spørsmål fra Grünerløkka-, Stensparken- eller quizcard-filer.',
    'Velg rich 5x7 fordi kildene bærer fem selvstendige læringsjobber: etablering/geometri, fysisk parkutvikling/navn, organisering/kunst, vern/forvaltning og sluttende sammenligning/syntese.',
    'Ikke velg major: seks eller flere sett ville kreve kunstig splitting av de samme kildelagene.'
  ],
  knowledge_migration: 'Nytt target har ingen legacy Knowledge-eier å migrere; canonical Knowledge kan bygges deterministisk fra den nye manifest-loadede quizpakken.'
};
const profileDecision = {
  profile: 'rich',
  set_count: 5,
  questions_per_set: 7,
  justification: 'Birkelunden har fem reelt forskjellige, kildebårne progresjonsløp, men ikke nok uavhengig stoff til seks eller flere sett uten gjentakelse. Rich 5x7 gir full normalåpning og en egen sluttfase uten filler.'
};
const heldBack = [
  'SNLs avvikende 1889-dato for Spaniamonumentet brukes ikke; 1989 støttes av Oslo byleksikon og Nils Aas-kildegrunnlaget.',
  'Påstanden om at Birkelunden eller foreningen er «Norges eldste» publiseres ikke uten sterkere, eksplisitt superlativbevis.',
  'Paulus kirke, Grünerløkka skole og andre elementer i det større kulturmiljøet gjøres ikke til Birkelunden-eide Objects/Structures eller quizproxy.',
  '2013-bildet brukes ikke som påstand om eksakt 2026-tilstand.'
];
const briefPath = 'data/quiz/production_briefs/by/birkelunden.json';
write(briefPath, {
  schema_version: '1.0',
  status: 'reviewed',
  categoryId: 'by',
  targetId: 'birkelunden',
  reviewed_at: '2026-08-24',
  review_note: 'Bygger på Birkelundens gjennomgåtte source/claim-pack og ferdigreviewede popupfaser. Spørsmålene er skrevet fra claims og egne stedsgrenser, ikke fra emneetiketter.',
  sources,
  selected_curriculum: selectedCurriculum,
  existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision,
  held_back_candidates: heldBack,
  claims
});

const phases = ['opening','middle','middle','bridge','final'];
const setQuestions = Array.from({ length: 5 }, (_, setIndex) => defs.slice(setIndex * 7, setIndex * 7 + 7).map((d, localIndex) => {
  const claimId = `claim_birkelunden_${d[0]}`;
  const q = {
    id: `birkelunden_quiz_${setIndex * 7 + localIndex + 1}`,
    quiz_id: `by_birkelunden_set_${setIndex + 1}_q${localIndex + 1}`,
    categoryId: 'by',
    placeId: 'birkelunden',
    personId: '',
    natureId: '',
    targetId: 'birkelunden',
    question_scope: 'place',
    question: d[4],
    options: d[5],
    answer: d[7 - 1],
    answerIndex: d[6],
    dimension: d[3].includes('parker') ? 'offentlig_parkrom' : 'historiske_lag',
    topic: d[4].replace(/\?$/, ''),
    knowledge: d[7],
    trivia: [],
    difficulty: setIndex < 2 ? (localIndex < 3 ? 1 : 2) : setIndex === 4 ? 3 : 2,
    question_type: d[2],
    year: null,
    epoke_id: null,
    epoke_domain: 'by',
    emne_id: d[3],
    related_emner: [],
    core_concepts: [],
    concept_focus: [],
    learning_paths: [],
    tags: ['birkelunden','place_specific','canonical_v3_3'],
    required_tags: [],
    claim_id: claimId,
    source: d[8],
    source_origin: 'external',
    claim_basis: d[7],
    guidance_basis: ['data/fag/fag_manifest.json','data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md']
  };
  if (d[9]) q.method_id = d[9];
  if (q.answer !== q.options[q.answerIndex]) throw new Error(`Answer index mismatch: ${q.quiz_id}`);
  return q;
}));

const embeddedContext = {
  manifest_category: 'by',
  profile: 'rich_5x7',
  standard_version: '3.3',
  source_brief: briefPath,
  context_artifact: 'data/quiz/production_context/by/birkelunden.json',
  resolved_files: {
    pensum: 'data/fag/by/pensum_by.json',
    emner: 'data/fag/by/emner_by.json',
    fagkart: 'data/fag/by/fagkart_by.json',
    methods: 'data/fag/by/methods_by.json',
    supersetQuizMal: 'data/fag/by/supersetQUIZMAL_by.json',
    quizStandard: 'data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md',
    quizQuestionSchema: 'data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json'
  },
  required_inputs_loaded: ['pensum','emner','fagkart','methods','supersetQuizMal','quizStandard','quizQuestionSchema'],
  pensum_module_ids: selectedCurriculum.pensum_module_ids,
  emne_ids: selectedCurriculum.emne_ids,
  topic_hook_ids: [],
  method_ids: ['met_for_etter'],
  thinker_ids: [],
  works: [],
  source_review_status: 'reviewed',
  existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision,
  held_back_candidates: heldBack,
  theory_start_phase: 'final',
  method_start_phase: 'final'
};
const quizPath = 'data/quiz/by/birkelunden_sets.json';
write(quizPath, {
  targetId: 'birkelunden',
  categoryId: 'by',
  sources: Object.fromEntries(Object.entries(sources).map(([id, value]) => [id, value.url])),
  production_context: embeddedContext,
  sets: setQuestions.map((questions, i) => ({
    set_id: `by_birkelunden_set_${i + 1}`,
    level: i + 1,
    order: i + 1,
    phase: phases[i],
    xp: 50 + i * 10,
    questions
  }))
});

const quizManifestPath = 'data/quiz/manifest.json';
const quizManifest = read(quizManifestPath);
if (!quizManifest.sets.some(x => x.targetId === 'birkelunden')) {
  const insertAt = quizManifest.sets.findIndex(x => x.targetId === 'bjorvika');
  const entry = { targetId: 'birkelunden', file: quizPath };
  if (insertAt >= 0) quizManifest.sets.splice(insertAt, 0, entry); else quizManifest.sets.push(entry);
}
if (quizManifest.sets.filter(x => x.targetId === 'birkelunden').length !== 1) throw new Error('Birkelunden quiz manifest must be unique');
write(quizManifestPath, quizManifest);

const fagManifestPath = 'data/fag/fag_manifest.json';
const fagManifest = read(fagManifestPath);
if (!fagManifest.by?.quizProduction?.targets) throw new Error('Missing by quizProduction targets');
fagManifest.by.quizProduction.targets.birkelunden = {
  source_brief: '../quiz/production_briefs/by/birkelunden.json',
  context_artifact: '../quiz/production_context/by/birkelunden.json',
  quiz_file: '../quiz/by/birkelunden_sets.json'
};
write(fagManifestPath, fagManifest);

const completionPath = 'reports/place-production/birkelunden_content_factory_completion_v1.json';
write(completionPath, {
  schema: 'history_go_content_factory_completion_v1',
  place_id: 'birkelunden',
  reviewed_at: '2026-08-24',
  status: 'production_ready_ci_pending',
  preservation: {
    park_area_m2: 16300,
    protected_cultural_environment_area_approx_dekar: 116,
    desc_sha256: sha(place.desc),
    popupDesc_sha256: sha(place.popupDesc),
    coordinate_status: place.coordStatus,
    coordinate_source_id: place.coordSourceId
  },
  coverage: {
    phase_7h_language: 'PASS',
    people: { status: 'PASS', direct_ids: ['thorvald_meyer','jack_johnsen'] },
    objects: { status: 'PASS', ids: place.objects.map(x => x.id) },
    brands: { status: 'PASS', ids: ['bondens_marked'] },
    structures: { status: 'PASS', ids: place.structures.map(x => x.id) },
    rounds: { status: 'PASS', ids: place.round_profile.content_round_ids },
    quiz: { status: 'PASS', profile: 'rich_5x7', set_count: 5, question_count: 35 },
    story: { status: 'PASS', id: 'st_birkelunden_bench_to_association' },
    reading_tracks: { status: 'PASS', count: 3 },
    sources: { status: 'PASS', owner: 'data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden.json' },
    before_after: { status: 'PASS', title: place.for_na?.title },
    news: { status: 'PASS', freshness_owner: 'data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden_news.json' },
    language: { status: 'PASS', owner: 'data/leksikon/sprak/places/europe/norway/oslo/birkelunden.json' },
    nature: { status: 'PASS_EXISTING_AUDITED_LAYER', primary_category_unchanged: 'by' },
    fagverk: { status: 'PASS', emne_ids: place.emne_ids },
    history_profile: { status: 'PASS', schema: place.history_profile.schema },
    route: { status: 'BEGRUNNET_NA', reason: 'Ingen eksisterende canonical Birkelunden-rute og ingen egen place-intern flerstopp-rute kan materialiseres uten å gjøre nabosteder til proxy. Eksisterende relasjoner beholdes; en senere Grünerløkka-klynge kan eie en flerplace-rute.' }
  },
  own_place_holdbacks: [
    'Paulus kirke som Birkelunden-structure',
    'Grünerløkka skole som Birkelunden-structure',
    'Olaf Ryes plass som Birkelunden-proxy',
    'større 116-dekar kulturmiljø som parkgeometri'
  ],
  final_gate: {
    required: ['targeted_regression','data_checks','place_rounds','quiz_audits','people_profile_audit','full_ci','main_verification'],
    state: 'pending_final_pr_head'
  }
});

const auditPath = 'reports/place-production/birkelunden-phase8-24-completion-audit-v1.md';
const audit = `# Birkelunden – fase 8–24 completion audit V1\n\n- Dato: 2026-08-24\n- Place ID: \`birkelunden\`\n- Canonical Place: \`${placePath}\`\n- Status: **CANONICAL CONTENT MATERIALIZED – FINAL CI/MAIN GATE PENDING**\n\n## Bevaringslås\n\n- Park: **16,3 dekar / 16 300 m²**.\n- Større fredet kulturmiljø: **ca. 116 dekar** – aldri brukt som parkareal.\n- \`desc\`: \`${sha(place.desc)}\`.\n- \`popupDesc\`: \`${sha(place.popupDesc)}\`.\n- Coordinate owner og park-anchor beholdes.\n\n## Fase 8 – rundinger og canonical collections\n\n**PASS.** People eies av direkte personkoblinger, Objects av tre fysiske parkobjekter, Brand av Bondens marked, Structures av musikkpaviljong og vannbasseng. Den synlige 4-rundingen er \`people → images → brands → structures\`. Objects beholdes som canonical eget innhold, men velges ikke som visuell runding før tre separate rettighetsavklarte objektbilder finnes. Dette er en kvalitetsgrense, ikke N/A.\n\nJack Johnsen materialiseres som canonical People-profil med tre claim-mappede opplysninger og uten oppfunnet portrett, fødselsdata eller biografisk filler. Thorvald Meyer beholdes som eksisterende direkte parkperson.\n\n## Fase 9 – full stedsgjennomgang\n\n**PASS.** Popupfasene 7A–7H, People/Objects/Brands/Structures, Story, Før/etter, Nyheter, Lesespor, Kilder, Språk, Nature-eierskap, Fagverk og Quiz er gjennomgått samlet mot parkens own-place-grense.\n\nRute: **BEGRUNNET N/A i denne place-produksjonen.** Det finnes ingen canonical Birkelunden-rute, og en ny flerstoppsrute ville måtte eies som Grünerløkka-klynge med egne steder. Nabosteder gjøres ikke til Birkelunden-proxy for å fylle en flate.\n\n## Fase 10 – Quiz\n\n**PASS.** Eksisterende aktiv/arkiv/alternativt quizmateriale er auditet før profilvalg. Ingen package-eid Birkelunden-quiz fantes. Ny canonical pakke er \`rich 5×7\`: 35 spørsmål, de første 14 er direkte normale spørsmål, source_brief har 35 reviewede claims, og hvert spørsmål peker til claim + ekstern source-id. Major avvises fordi flere sett ville splitte samme stoff kunstig.\n\n## Fase 11–15 – runtime, integrasjon og brukerflate\n\n**PASS ved final CI-head når de navngitte gates er grønne.** Rounds kjøres gjennom eksisterende generisk runtime; ingen Birkelunden-spesialrenderer er lagt til. Språk, popup, quiz, People og Brand bruker eksisterende canonical resolvere/manifester. Slutt-QA skal gjenåpnes ved faktisk runtimeavvik.\n\n## Fase 16 – repetisjon\n\n**PASS.** Chronology/history_layers, Story, Objects og Quiz bruker samme kildegrunnlag til ulike produktjobber: datooversikt, narrativ episode, fysiske spor og læringsspørsmål. De er ikke kopiert som identiske tekstflater.\n\n## Fase 17 – history_profile\n\n**PASS.** \`history_profile\` er materialisert med sentral intensjon, geografi, plan/funksjon, fire tidslag, lokal kunnskap og eksplisitt own-place-grense. Park/kulturmiljø-skillet er skrevet inn som en invariant.\n\n## Fase 18–19 – visuelle kilder\n\n**PASS.** Eksisterende hovedbilde og Før/etter-evidens beholdes med tidligere godkjent proveniens. Bondens marked-logoen kommer fra organisasjonens NTB Kommunikasjon-mediebank og brukes referensielt uten endorsement. Ingen objektbilder er oppfunnet eller hentet fra uklar søkemotorproveniens.\n\n## Fase 20–24 – sluttporter\n\nFerdigstatus krever grønn final PR-head for data, People, Quiz, place rounds, language, Stories, Knowledge/Fagverk og øvrige berørte workflows samt etterfølgende kontroll på \`main\`. Completion-reporten står derfor som \`production_ready_ci_pending\` fram til dette faktisk er bevist; audit eller schema alene brukes ikke som bevis for live-status.\n\n## Held back\n\n- SNL-varianten \`1889\` for Spaniamonumentet; canonical år her er 1989.\n- superlativer om «eldste» pensjonistforening;\n- Paulus kirke/Grünerløkka skole/Olaf Ryes plass som park-eide objekter eller strukturer;\n- 2013-bildet som påstand om eksakt 2026-tilstand;\n- kunstig route- eller Objects-runding bare for å fylle fire visuelle felt.\n`;
fs.writeFileSync(auditPath, audit);

const workcardPath = 'reports/place-production/birkelunden-workcard-current.md';
let workcard = fs.readFileSync(workcardPath, 'utf8');
workcard = workcard.replace('- Oppdatert: 2026-08-23', '- Oppdatert: 2026-08-24');
workcard = workcard.replace('| 7G Kilder | **KLAR FOR REVIEW / CI** |', '| 7G Kilder | **FERDIG OG MERGET** |');
workcard = workcard.replace('| 7H Språk | **NESTE – REELL NAVNEHISTORIEKANDIDAT** |', '| 7H Språk | **GODKJENT CHECKPOINT – FINAL PR-GRENSE** |');
workcard = workcard.replace('| 8–24 | **ÅPENT** etter canonical rekkefølge |', '| 8–24 | **MATERIALISERT OG REVIEWET – FINAL CI/MAIN GATE GJENSTÅR** |');
if (!workcard.includes('## Fase 8–24 – canonical completion')) {
  workcard += `\n\n## Fase 8–24 – canonical completion\n\n- People: \`thorvald_meyer\` + ny claim-mappet \`jack_johnsen\`.\n- Objects: \`birkelunden_foell\`, \`birkelunden_jack_johnsen_byste\`, \`birkelunden_spaniamonumentet\`.\n- Brand: \`bondens_marked\` med lokalt, offisielt press-room-logoasset.\n- Structures: \`birkelunden_musikkpaviljong\`, \`birkelunden_vannbasseng\`.\n- Rundinger: \`people / images / brands / structures\`; Objects er canonical, men ikke visuell runding uten tre sikre objektbilder.\n- Quiz: \`data/quiz/by/birkelunden_sets.json\`, rich 5×7 / 35 spørsmål, 35 reviewede claims.\n- History profile: materialisert.\n- Rute: begrunnet N/A i enkelt-place-produksjonen; ingen nabostedsproxy.\n- Completion audit: \`reports/place-production/birkelunden-phase8-24-completion-audit-v1.md\`.\n- Completion report: \`reports/place-production/birkelunden_content_factory_completion_v1.json\`.\n\nFinal ferdigstatus kan først skrives etter grønn PR-head, merge og kontroll av fersk \`main\`.\n`;
}
fs.writeFileSync(workcardPath, workcard);

console.log(JSON.stringify({
  place: place.id,
  object_ids: place.objects.map(x => x.id),
  structure_ids: place.structures.map(x => x.id),
  rounds: place.round_profile.content_round_ids,
  people: ['thorvald_meyer','jack_johnsen'],
  quiz: { sets: setQuestions.length, questions: setQuestions.flat().length },
  preservation: { desc: sha(place.desc), popupDesc: sha(place.popupDesc), area_m2: place.spatial_profile.area_m2 }
}, null, 2));
