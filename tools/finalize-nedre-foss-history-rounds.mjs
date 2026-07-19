import crypto from 'node:crypto';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const write = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const appendUnique = (array, value, predicate = (row) => row === value) => {
  if (!array.some(predicate)) array.push(value);
};

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/nedre_foss.json';
const indexPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const splitManifestPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const leksikonPath = 'data/leksikon/places/oslo/historie/leksikon_oslo_historie_nedre_foss.json';
const peopleManifestPath = 'data/people/manifest.json';
const storyManifestPath = 'data/stories/stories_manifest.json';
const relationsPath = 'data/relations.json';
const personManifestEntry = 'people/naeringsliv/oslo/akerselva/friedrich_gruner.json';
const storyPath = 'data/stories/stories_nedre_foss.json';

const sourceLinks = [
  {
    type: 'official',
    label: 'Oslo kommune – Nedre Foss park',
    url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/nedre-foss-park',
    lang: 'nb',
    verifiedAt: '2026-07-19'
  },
  {
    type: 'reference',
    label: 'Oslo byleksikon – Foss gård',
    url: 'https://oslobyleksikon.no/side/Foss_g%C3%A5rd',
    lang: 'nb',
    verifiedAt: '2026-07-19'
  },
  {
    type: 'reference',
    label: 'Oslo byleksikon – Nedre Foss park',
    url: 'https://oslobyleksikon.no/side/Nedre_Foss_park',
    lang: 'nb',
    verifiedAt: '2026-07-19'
  },
  {
    type: 'reference',
    label: 'Industrimuseum – Akerselva Digitalt',
    url: 'https://www.industrimuseum.no/akerselvadigitalt',
    lang: 'nb',
    verifiedAt: '2026-07-19'
  },
  {
    type: 'reference',
    label: 'Store norske leksikon – Friedrich Grüner',
    url: 'https://snl.no/Friedrich_Gr%C3%BCner',
    lang: 'nb',
    verifiedAt: '2026-07-19'
  },
  {
    type: 'reference',
    label: 'Lokalhistoriewiki – Nedre Foss mølle',
    url: 'https://lokalhistoriewiki.no/wiki/Nedre_Foss_m%C3%B8lle',
    lang: 'nb',
    verifiedAt: '2026-07-19'
  }
];

const place = read(placePath);
Object.assign(place, {
  name: 'Nedre Foss',
  year: 1220,
  desc: 'Akerselvas nederste foss og et dokumentert møllested fra middelalderen, senere Kongens mølle og i dag del av et offentlig park- og elverom.',
  popupDesc: 'Nedre Foss er det nederste fossefallet i Akerselva og et av byens lengst dokumenterte vannkraftsteder. En kvern under Hovedøya kloster nevnes her i 1220, mens Oslo kommune daterer etableringen av møllevirksomheten til perioden mellom 1148 og 1200. Etter reformasjonen ble anlegget krongods og kjent som Kongens mølle.\n\nMyntmester Friedrich Grüner kjøpte Nedre Foss med møllen av kronen i 1672. Møllevirksomheten ble modernisert gjennom århundrene og fortsatte på stedet fram til 1985. Den siste møllebygningen ble senere revet, men hovedbygningen på Nedre Foss gård er bevart som et separat bygningslag i området.\n\nNedre Foss park åpnet i 2017. Parken bruker møllehistorien aktivt gjennom lekelandskap og møllehjul, og ved fossen finnes laksetrapp, elvenær gangvei og regnbed som håndterer overvann. Lars Fiskes friser ved Mølleplassen forteller dessuten Akerselvas historie i selve parkarkitekturen. Stedet viser derfor en uvanlig lang overgang fra middelalderens produksjonskraft til offentlig natur-, leke- og historierom.',
  tags: [
    'foss', 'vannkraft', 'møllehistorie', 'middelalder', 'kongens_mølle', 'akerselva',
    'friedrich_gruner', 'nedre_foss_park', 'laksetrapp', 'regnbed', 'kulturhistorie'
  ],
  quiz_profile: {
    place_type: 'middelaldersk vannkraftsted og transformert elverom',
    subtype: 'akerselva_nederste_foss_kongens_molle_park',
    signature_features: [
      'Akerselvas nederste fossefall',
      'kvern under Hovedøya kloster dokumentert i 1220',
      'Kongens mølle etter reformasjonen',
      'Friedrich Grüners kjøp av Nedre Foss i 1672',
      'mølledrift fram til 1985',
      'Nedre Foss park åpnet i 2017 med mølleinspirert lekelandskap',
      'laksetrapp, regnbed og offentlig elvekorridor'
    ],
    primary_angles: [
      'middelalder_og_klostergods', 'vannkraft_og_molledrift', 'eierskap_og_byhistorie',
      'produksjon_til_park', 'elverehabilitering', 'offentlig_kunst_og_historieformidling'
    ],
    question_families: [
      'historisk_endring', 'stedsspesifikk_funksjon', 'person_og_sted',
      'vannkraft_og_infrastruktur', 'for_nå', 'fysiske_spor', 'kildekritikk'
    ],
    avoid_angles: [
      'generisk_tursti', 'påstand_om_at_fossen_ble_til_i_1220',
      'forveksle_nedre_foss_med_nedre_foss_gard', 'forveksle_nedre_foss_med_vulkan',
      'hardkode_dagens_restauranter_eller_virksomheter', 'udokumenterte_artsfunn'
    ],
    must_include: [
      '1220 som første dokumenterte omtale av kvernstedet',
      'Kongens mølle', 'Friedrich Grüner 1672', 'mølledrift til 1985', 'parken fra 2017'
    ],
    contrast_targets: ['beierbrua', 'vulkan_industriomrade', 'voienfossen'],
    notes: 'Årstallet 1220 markerer første dokumenterte omtale av kvernstedet, ikke fossens alder. Hold foss, gård, park og Vulkan analytisk adskilt.'
  },
  underbadge_ids: ['middelalder', 'byhistorie', 'industrihistorie', 'kulturminner_og_bevaring'],
  works: [
    {
      id: 'nedre_foss_molle_1220',
      title: 'Nedre Foss mølle',
      type: 'kornmølle',
      kind: 'medieval_water_mill',
      year: 1220,
      desc: 'Kvernstedet er dokumentert under Hovedøya kloster i 1220; Oslo kommune beskriver mølleetablering mellom 1148 og 1200.',
      why_here: 'Møllen er det historiske hovedverket som gjør fossens vannkraft til konkret produksjonshistorie.'
    },
    {
      id: 'nedre_foss_kongens_molle',
      title: 'Kongens mølle',
      type: 'krongodsmølle',
      kind: 'royal_grain_mill',
      year: 1537,
      desc: 'Etter reformasjonen ble møllen krongods og kjent som Kongens mølle, med privilegert kornmaling i området rundt Christiania.',
      why_here: 'Navnet viser hvordan kontrollen over fossens energi også var økonomisk og politisk makt.'
    },
    {
      id: 'nedre_foss_park_2017',
      title: 'Nedre Foss park',
      type: 'bypark',
      kind: 'urban_river_park',
      year: 2017,
      desc: 'Parken åpnet på det historiske mølleområdet med turvei, lekelandskap, møteplass og sterk formidling av stedets historie.',
      why_here: 'Parken er det tydeligste fysiske uttrykket for overgangen fra produksjonsområde til offentlig by- og elverom.'
    },
    {
      id: 'nedre_foss_mollehjul_lekelandskap',
      title: 'Møllehjulet i lekelandskapet',
      type: 'leke- og historieinstallasjon',
      kind: 'public_history_play_object',
      year: 2017,
      desc: 'Et fysisk møllehjul i lekelandskapet bruker den historiske vannkraften som lekbart og synlig motiv.',
      why_here: 'Objektet gjør møllehistorien direkte lesbar for barn og andre parkbrukere.'
    },
    {
      id: 'nedre_foss_laksetrapp',
      title: 'Laksetrappen ved Nedre Foss',
      type: 'elveteknisk naturtiltak',
      kind: 'fish_passage',
      year: 2017,
      desc: 'Laksetrappen på østsiden av fossen gjør det mulig for laks å passere fossen på vei mot gyteområder lenger opp i elva.',
      why_here: 'Tiltaket viser hvordan dagens elveforvaltning forsøker å gjenåpne en historisk regulert elv for fisk.'
    },
    {
      id: 'nedre_foss_lars_fiske_friser',
      title: 'Akerselva-frisene av Lars Fiske',
      type: 'offentlig kunst og historieformidling',
      kind: 'public_history_frieze',
      year: 2017,
      desc: 'Friser på trappen ved Mølleplassen viser motiver fra Akerselvas historie.',
      why_here: 'Kunsten bygger historiefortelling inn i parkens fysiske infrastruktur.'
    }
  ],
  for_na: {
    title: 'Fra møllemaskin til offentlig elverom',
    before: {
      period: 'ca. 1150–1985',
      desc: 'Fossen ble utnyttet til kornmaling gjennom mange hundre år. Møllen gikk fra klostergods til krongods og privat eierskap, og anlegget ble modernisert mens vannkraften fortsatt var selve produksjonsgrunnlaget.'
    },
    now: {
      period: '2017–2026',
      desc: 'Nedre Foss er nå et offentlig park- og elverom. Turveier, lekelandskap, møllehjul, laksetrapp, regnbed og historiske friser gjør både naturprosesser og møllehistorie tilgjengelige uten at området fungerer som produksjonsanlegg.'
    },
    change: 'Stedet har gått fra et langvarig produksjons- og energisystem til et offentlig landskap for lek, naturkontakt, ferdsel og historisk tolkning. Fossen er fortsatt den fysiske motoren i stedet, men samfunnsfunksjonen rundt den er helt forandret.',
    look_for: [
      'selve fossefallet og hvordan vannet konsentrerer energi',
      'møllehjulet i lekelandskapet',
      'laksetrappen på østsiden av fossen',
      'regnbed og andre overvannsgrep i parken',
      'Lars Fiskes friser ved Mølleplassen',
      'forholdet mellom fossen, den bevarte gårdsbygningen og den nyere parkstrukturen',
      'grensen mellom Nedre Foss og det separate Vulkan-området'
    ],
    sources: ['Oslo kommune', 'Oslo byleksikon', 'Industrimuseum', 'Store norske leksikon', 'Lokalhistoriewiki']
  },
  civication_store: [
    {
      id: 'nedre_foss_munkekorn_mollehjul',
      title: 'Munkekorn og møllehjul',
      type: 'møllemodell',
      kind: 'physical_object',
      desc: 'En fysisk modell med kornbåt, kvernstein og vannhjul som viser hvordan Hovedøya klosters korn kunne fraktes til Nedre Foss og males med fossens kraft.',
      placeSpecificReason: 'Kombinasjonen av seilbar elv, klosterkorn og vannkraft er et særtrekk ved Nedre Foss sin dokumenterte middelalderhistorie.',
      historicalFunction: 'Gjør logistikk- og energikjeden fra korntransport til maling håndgripelig.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 40,
      currency: 'PC',
      collection: 'nedre_foss',
      collectable: true
    },
    {
      id: 'nedre_foss_kongens_molle_1723',
      title: 'Kongens mølle – to hjul og åtte kvernsteiner',
      type: 'møllemaskinmodell',
      kind: 'physical_object',
      desc: 'En fysisk snittmodell av mølleoppsettet Industrimuseum beskriver fra 1723, med to vannhjul og åtte kvernsteiner.',
      placeSpecificReason: 'Tallene dokumenterer den konkrete skalaen på Kongens mølle ved Nedre Foss.',
      historicalFunction: 'Viser hvordan ett fossefall kunne drive flere kvernsteiner samtidig.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 45,
      currency: 'PC',
      collection: 'nedre_foss',
      collectable: true
    },
    {
      id: 'nedre_foss_laksetrapp_modell',
      title: 'Laksetrappen',
      type: 'elveøkologisk modell',
      kind: 'physical_object',
      desc: 'En fysisk modell av trinnene som lar laks passere den nederste fossen i Akerselva.',
      placeSpecificReason: 'Laksetrappen er et konkret moderne naturtiltak direkte ved Nedre Foss.',
      historicalFunction: 'Setter dagens restaurering av elvas vandringsvei opp mot århundrer med teknisk utnyttelse av fossen.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 30,
      currency: 'PC',
      collection: 'nedre_foss',
      collectable: true
    },
    {
      id: 'nedre_foss_regnbed_brett',
      title: 'Regnbedet ved den gamle industrigrunnen',
      type: 'overvannsmodell',
      kind: 'physical_object',
      desc: 'Et fysisk terrengbrett som viser hvordan regnbed holder tilbake overvann i det tidligere forurensede industriområdet.',
      placeSpecificReason: 'Oslo kommune beskriver regnbedene som en del av den konkrete miljøopprustningen på Nedre Foss.',
      historicalFunction: 'Knytter gammel industriell forurensning til moderne klimatilpasning og overvannshåndtering.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 32,
      currency: 'PC',
      collection: 'nedre_foss',
      collectable: true
    }
  ],
  brands: [
    {
      id: 'hovedoya_kloster_nedre_foss',
      name: 'Hovedøya kloster',
      brand_kind: 'medieval_monastic_owner',
      brand_type: 'first_documented_mill_actor'
    },
    {
      id: 'kongens_molle_nedre_foss',
      name: 'Kongens mølle',
      brand_kind: 'royal_grain_mill',
      brand_type: 'crown_mill_actor'
    },
    {
      id: 'gruner_familien_nedre_foss',
      name: 'Familien Grüner',
      brand_kind: 'historic_property_owner',
      brand_type: 'long_term_owner_actor'
    },
    {
      id: 'bjoelsen_valsemolle_nedre_foss',
      name: 'Bjølsen Valsemølle',
      brand_kind: 'industrial_flour_mill_company',
      brand_type: 'late_mill_operator'
    },
    {
      id: 'oslo_kommune_nedre_foss_park',
      name: 'Oslo kommune',
      brand_kind: 'municipal_park_owner',
      brand_type: 'public_space_and_environment_actor'
    }
  ],
  nature_profile: {
    type: 'nederste foss / regulert byelv / laksevandringspunkt',
    title: 'Den nederste terskelen i Akerselva',
    summary: 'Natur-rundingen viser Nedre Foss som det nederste fossefallet i Akerselva, der vannets fall fortsatt er fysisk tydelig gjennom strøm, lyd, sprøyt og høydeforskjell. Den samme energien som i århundrer drev møllen, former fortsatt elverommet. På østsiden er det anlagt en laksetrapp slik at laks kan passere fossen på vei oppover elva, mens turvei og bryggesti gjør det mulig å observere vannet fra offentlig område. Parken har også regnbed som håndterer overvann i et område med historisk forurenset grunn. Natur-rundingen skal derfor handle om fossen som levende vannsystem, fiskepassasje, flom- og overvannsrom og urban grønnstruktur – ikke om udokumenterte artslister. Sterk strøm, glatte kanter og tekniske anlegg skal observeres på avstand fra lovlig offentlig ferdselsareal.',
    themes: [
      'Akerselvas nederste fossefall',
      'fallhøyde, strøm, fosselyd og sprøyt',
      'vannkraft som naturgrunnlag for mølledrift',
      'laksetrapp og vandringsvei for laks',
      'regnbed og lokal overvannshåndtering',
      'historisk forurenset grunn og miljøopprustning',
      'offentlig turvei og elvenær observasjon',
      'grensen mellom naturprosess og bygget elveinfrastruktur'
    ],
    nearby_place_ids: ['kuba_parken', 'beierbrua', 'vulkan_industriomrade']
  },
  externalLinks: sourceLinks
});
write(placePath, place);

const indexRows = read(indexPath);
const indexRow = indexRows.find((row) => row.id === 'nedre_foss');
if (!indexRow) throw new Error('Missing nedre_foss route-index row');
Object.assign(indexRow, {
  name: place.name,
  category: place.category,
  lat: place.lat,
  lon: place.lon,
  r: place.r,
  year: place.year
});
write(indexPath, indexRows);

const article = read(leksikonPath);
Object.assign(article, {
  version: 2,
  popupDesc: 'Nedre Foss er Akerselvas nederste foss og et dokumentert møllested fra middelalderen. Her kan mer enn åtte hundre år med vannkraft, eierskap, mølledrift og byomforming leses i ett sammenhengende elverom.',
  wikiText: [
    'Nedre Foss er det nederste fossefallet i Akerselva. En kvern under Hovedøya kloster nevnes i 1220, og Oslo kommune beskriver mølleetablering på stedet mellom 1148 og 1200. Plasseringen var strategisk: korn kunne fraktes opp elva med båt, mens selve fossen leverte den mekaniske energien til malingen. Dermed var Nedre Foss både transportpunkt og energikilde lenge før den moderne industribyen.',
    'Etter reformasjonen ble møllen krongods og kjent som Kongens mølle. I 1672 kjøpte myntmester Friedrich Grüner Nedre Foss med møllen av kronen. Familienavnet ble senere knyttet til Grünerløkka, men den konkrete eierskapshistorien begynner ved dette mølle- og gårdsanlegget. Møllen ble modernisert gjennom århundrene, og mølledrift fortsatte ved Nedre Foss helt til 1985.',
    'Produksjonslandskapet ble deretter omformet. Nedre Foss park åpnet i 2017 på området rundt fossen og gården. Parkens lekelandskap er inspirert av møllehistorien og inneholder et møllehjul som fysisk historieformidling. Lars Fiskes friser på trappen ved Mølleplassen viser motiver fra Akerselvas historie, slik at fortellingen om elva er bygget inn i det offentlige byrommet.',
    'Dagens Nedre Foss er også et natur- og klimatilpasningssted. En laksetrapp gjør det mulig for laks å passere fossen, turveien bringer publikum nærmere elverommet, og regnbed reduserer overvann i et område med historisk forurenset grunn. Det gjør stedet til et tydelig før-og-nå-landskap: den samme fossen som i århundrer drev kvernsteiner, inngår nå i et offentlig system for naturkontakt, lek, ferdsel, fiskevandring og lokal overvannshåndtering.'
  ],
  summary: {
    one_liner: 'Akerselvas nederste foss, fra middelaldermølle og Kongens mølle til offentlig park, laksetrapp og klimatilpasning.',
    themes: ['Akerselva', 'middelalder', 'vannkraft', 'Kongens mølle', 'Friedrich Grüner', 'møllehistorie', 'park', 'elverehabilitering'],
    tone: ['nøktern', 'faglig', 'stedlig']
  },
  facts: [
    { id: 'fact_01', label: 'Nederste foss', desc: 'Nedre Foss er det nederste fossefallet i Akerselva.', confidence: 'high', sources: ['Oslo byleksikon', 'Lokalhistoriewiki'] },
    { id: 'fact_02', label: 'Dokumentert i 1220', desc: 'En kvern under Hovedøya kloster er dokumentert ved Nedre Foss i 1220.', confidence: 'high', sources: ['Oslo byleksikon'] },
    { id: 'fact_03', label: 'Middelaldermølle', desc: 'Oslo kommune daterer etableringen av møllevirksomheten til perioden mellom 1148 og 1200.', confidence: 'high', sources: ['Oslo kommune'] },
    { id: 'fact_04', label: 'Kongens mølle', desc: 'Etter reformasjonen ble anlegget krongods og møllen kjent som Kongens mølle.', confidence: 'high', sources: ['Oslo byleksikon', 'Industrimuseum'] },
    { id: 'fact_05', label: 'Friedrich Grüner', desc: 'Friedrich Grüner kjøpte Nedre Foss med Kongens mølle av kronen i 1672.', confidence: 'high', sources: ['Store norske leksikon', 'Oslo byleksikon'] },
    { id: 'fact_06', label: 'Lang driftskontinuitet', desc: 'Oslo kommune oppgir at mølledriften fortsatte til 1985.', confidence: 'high', sources: ['Oslo kommune'] },
    { id: 'fact_07', label: 'Park fra 2017', desc: 'Nedre Foss park åpnet i 2017 og bruker møllehistorien aktivt i lekelandskap og utforming.', confidence: 'high', sources: ['Oslo kommune', 'Oslo byleksikon'] },
    { id: 'fact_08', label: 'Laksetrapp', desc: 'En laksetrapp på østsiden av fossen gjør det mulig for laks å passere fossen.', confidence: 'high', sources: ['Oslo kommune'] },
    { id: 'fact_09', label: 'Regnbed', desc: 'Parken har regnbed som reduserer overvann i et område med historisk forurenset grunn.', confidence: 'high', sources: ['Oslo kommune'] },
    { id: 'fact_10', label: 'Historiske friser', desc: 'Lars Fiskes friser på trappen ved Mølleplassen viser motiver fra Akerselvas historie.', confidence: 'high', sources: ['Oslo byleksikon'] }
  ],
  chronology: [
    { id: 'chrono_01', year: 1220, period: 'Middelalder', desc: 'Kvern under Hovedøya kloster er dokumentert ved Nedre Foss.', confidence: 'high', sources: ['Oslo byleksikon'] },
    { id: 'chrono_02', year: 1537, period: 'Etter reformasjonen', desc: 'Møllen går over til kronen og blir kjent som Kongens mølle.', confidence: 'high', sources: ['Oslo byleksikon', 'Industrimuseum'] },
    { id: 'chrono_03', year: 1672, period: 'Grüner-eierskap', desc: 'Friedrich Grüner kjøper Nedre Foss med Kongens mølle av kronen.', confidence: 'high', sources: ['Store norske leksikon', 'Oslo byleksikon'] },
    { id: 'chrono_04', year: 1723, period: 'Møllekapasitet', desc: 'Industrimuseum beskriver Kongens mølle med to vannhjul og åtte kvernsteiner.', confidence: 'high', sources: ['Industrimuseum'] },
    { id: 'chrono_05', year: 1985, period: 'Slutt på mølledriften', desc: 'Oslo kommune oppgir at mølledriften ved Nedre Foss varer fram til 1985.', confidence: 'high', sources: ['Oslo kommune'] },
    { id: 'chrono_06', year: 1986, period: 'Møllebygningen forsvinner', desc: 'Lokalhistoriewiki oppgir at den siste møllebygningen blir revet i 1986.', confidence: 'medium', sources: ['Lokalhistoriewiki'] },
    { id: 'chrono_07', year: 2017, period: 'Nedre Foss park', desc: 'Den nye parken åpner med mølleinspirert lekelandskap, turveier og miljøtiltak.', confidence: 'high', sources: ['Oslo kommune', 'Oslo byleksikon'] }
  ],
  built_environment: {
    built_year: null,
    architects: ['Norconsult – konkurranseutkastet «Flyt» for parkutformingen'],
    materials: ['vann', 'stein', 'granittdekke', 'trebrygge', 'vegetasjon', 'park- og lekeinstallasjoner'],
    style: ['historisk elvelandskap', 'moderne bypark', 'blågrønn infrastruktur'],
    original_function: 'Vannkraftsted for kornmaling og mølledrift',
    current_function: 'Offentlig park, elverom, turvei, leke- og historieformidlingssted',
    changes: [
      {
        label: 'Fra produksjon til offentlig park',
        year: 2017,
        desc: 'Mølleområdet blir et offentlig parklandskap som beholder fossen som fysisk og historisk sentrum.',
        confidence: 'high',
        sources: ['Oslo kommune', 'Oslo byleksikon']
      }
    ]
  },
  events: { crime: [], fires_accidents: [], politics_society: [] },
  stories: [
    { id: 'story_01', entry_id: 'st_nedre_foss_fra_munkekorn_til_bypark', title: 'Fra munkekorn til bypark', one_liner: 'Mer enn åtte hundre år med vannkraft og byforandring kan leses i samme foss.', confidence: 'high', sources: ['Oslo kommune', 'Oslo byleksikon', 'Industrimuseum'] },
    { id: 'story_02', entry_id: 'wk_nedre_foss_elva_som_maskin', title: 'Elva som maskin', one_liner: 'Nedre Foss viser hvordan vannets fall ble gjort til et produksjonssystem.', confidence: 'high', sources: ['Industrimuseum'] }
  ],
  artifacts: [
    { id: 'artifact_01', title: 'Fossefallet', kind: 'landskapselement', desc: 'Det nederste fallet i Akerselva og energikilden bak den historiske mølledriften.', where: 'Nedre Foss', confidence: 'high', image_ref: null, sources: ['Oslo byleksikon'] },
    { id: 'artifact_02', title: 'Møllehjulet i lekelandskapet', kind: 'historieinstallasjon', desc: 'Et fysisk lekeobjekt som formidler områdets møllehistorie.', where: 'Nedre Foss park', confidence: 'high', image_ref: null, sources: ['Oslo kommune'] },
    { id: 'artifact_03', title: 'Laksetrappen', kind: 'naturtiltak', desc: 'Fiskepassasje på østsiden av fossen.', where: 'Nedre Foss', confidence: 'high', image_ref: null, sources: ['Oslo kommune'] },
    { id: 'artifact_04', title: 'Akerselva-frisene', kind: 'offentlig kunst', desc: 'Lars Fiskes friser med motiver fra Akerselvas historie på trappen ved Mølleplassen.', where: 'Nedre Foss park', confidence: 'high', image_ref: null, sources: ['Oslo byleksikon'] }
  ],
  interpretation: {
    what_to_notice: ['fossens fall og lyd', 'møllehjulet i lekelandskapet', 'laksetrappen', 'regnbedene', 'Lars Fiskes friser', 'forholdet mellom historisk gårdsbygning og nyere park', 'grensen mot Vulkan'],
    why_it_matters: ['Stedet dokumenterer svært lang kontinuitet i bruk av vannkraft', 'Nedre Foss knytter middelalder, kongemakt, privat eierskap og moderne bypark sammen', 'Parken viser hvordan industri- og produksjonslandskap kan bli blågrønn offentlig infrastruktur'],
    counterpoints: ['Årstallet 1220 er første dokumenterte omtale av kvernstedet, ikke fossens alder', 'Nedre Foss gård er et eget bygningslag og skal ikke forveksles med selve fossen', 'Dagens virksomheter rundt parken er tidssensitive og er ikke canonical del av denne artikkelen']
  },
  links: {
    entry_ids: ['st_nedre_foss_fra_munkekorn_til_bypark', 'wk_nedre_foss_vannkraften', 'wk_nedre_foss_elva_som_maskin', 'wk_nedre_foss_molle_og_industri', 'wk_nedre_foss_fra_produksjon_til_byliv', 'wk_nedre_foss_elvekant_og_bynatur', 'wk_nedre_foss_akerselva_korridoren'],
    related_places: ['kuba_parken', 'beierbrua', 'vulkan_industriomrade'],
    related_people: ['friedrich_gruner']
  },
  classification: {
    tags: ['Akerselva', 'middelalder', 'foss', 'vannkraft', 'møllehistorie', 'Kongens mølle', 'bypark', 'elverehabilitering'],
    knagger: ['vannkraft', 'middelalder', 'mølledrift', 'eierskap', 'byomforming', 'blågrønn infrastruktur'],
    entry_types_in_use: ['historisk_elverom', 'middelaldermolle', 'transformert_byrom'],
    epoker_refs: ['middelalder', 'tidlig_nytid', 'industrialisering', 'moderne', 'samtid']
  },
  sources: sourceLinks.map((link, index) => ({
    id: `source_${String(index + 1).padStart(2, '0')}`,
    label: link.label,
    type: link.type,
    url: link.url,
    confidence: 'high'
  })),
  ui: {
    mini_panel: {
      show: true,
      highlights: ['fact_01', 'fact_02', 'fact_05', 'fact_07', 'artifact_02', 'artifact_03'],
      max_items: 6
    }
  }
});
write(leksikonPath, article);

const peopleManifest = read(peopleManifestPath);
appendUnique(peopleManifest.files, personManifestEntry);
write(peopleManifestPath, peopleManifest);

const storyManifest = read(storyManifestPath);
appendUnique(storyManifest.files, {
  category: 'historie',
  entity_id: 'nedre_foss',
  path: storyPath
}, (row) => row.entity_id === 'nedre_foss' || row.path === storyPath);
write(storyManifestPath, storyManifest);

const relations = read(relationsPath);
appendUnique(relations, {
  id: 'rel_friedrich_gruner_nedre_foss_eier_1672',
  person: 'friedrich_gruner',
  place: 'nedre_foss',
  type: 'owner_of_place',
  relation: 'Kjøpte Nedre Foss med Kongens mølle av kronen i 1672.',
  year: 1672,
  source: 'Store norske leksikon – Friedrich Grüner'
}, (row) => row.id === 'rel_friedrich_gruner_nedre_foss_eier_1672');
write(relationsPath, relations);

const splitManifest = read(splitManifestPath);
const manifestRow = splitManifest.places.find((row) => row.id === 'nedre_foss');
if (!manifestRow) throw new Error('Missing nedre_foss split-manifest row');
Object.assign(manifestRow, {
  name: place.name,
  category: place.category,
  sha256: crypto.createHash('sha256').update(fs.readFileSync(placePath)).digest('hex')
});
write(splitManifestPath, splitManifest);

console.log('Nedre Foss history rounds, leksikon, manifests and Friedrich Grüner relation finalized.');
