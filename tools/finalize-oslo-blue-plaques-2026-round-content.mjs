import fs from 'node:fs';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const appendUnique = (array, value, predicate = (item) => item === value) => {
  if (!array.some(predicate)) array.push(value);
};

const SOURCE_BLUE = 'https://www.oslobyesvel.no/blaa-skilt-i-oslo';

const placePatches = {
  bla_skilt_aud_schonemann_vetlandsveien_69d: {
    rounds_exclude: ['nature'],
    works: [
      {
        id: 'aud_schonemann_bla_skilt_2026',
        title: 'Det blå skiltet for Aud Schønemann',
        type: 'minneskilt',
        desc: 'Den fysiske plaketten som gjør Schønemanns mangeårige hjem på Oppsal til et offentlig minnepunkt.',
        why_here: 'Skiltet står ved adressen der Aud Schønemann bodde fra 1958 til 1981.',
        source_note: 'Oslo Byes Vel og Oslo byleksikon, kontrollert 19. juli 2026.'
      },
      {
        id: 'aud_schonemann_valborg_olsenbanden',
        title: 'Valborg i Olsen-banden',
        type: 'filmrolle',
        desc: 'Schønemanns rolle som Valborg ble en av hennes mest gjenkjennelige bidrag til norsk populærkultur.',
        why_here: 'Minneskiltet knytter den nasjonalt kjente filmrollen til skuespillerens hverdagsliv på Oppsal.',
        source_note: 'Store norske leksikon: Aud Schønemann.'
      },
      {
        id: 'aud_schonemann_modern_fleksnes',
        title: "Moder'n i Fleksnes",
        type: 'tv_rolle',
        desc: 'Schønemann spilte den markante morsrollen i TV-serien Fleksnes fataliteter.',
        why_here: 'Skiltet lar TV-historien kobles til personen som faktisk bodde på adressen.',
        source_note: 'Store norske leksikon: Aud Schønemann.'
      }
    ],
    civication_store: [
      {
        id: 'aud_schonemann_bla_skilt_objekt',
        title: 'Det blå Aud Schønemann-skiltet',
        type: 'minneplakett',
        kind: 'physical_object',
        desc: 'Den blå plaketten ved Vetlandsveien 69D som markerer Schønemanns tilknytning til adressen.',
        placeSpecificReason: 'Objektet finnes ved akkurat dette minnepunktet og er hele grunnlaget for den offentlige stedmarkeringen.',
        physicalObject: true,
        placeSpecific: true,
        storePrice: 20,
        currency: 'PC',
        collection: 'oslo_bla_skilt_2026',
        collectable: true,
        source_urls: [SOURCE_BLUE, 'https://oslobyleksikon.no/side/Vetlandsveien']
      },
      {
        id: 'aud_schonemann_vetlandsveien_fasadeanker',
        title: 'Fasadeankeret i Vetlandsveien',
        type: 'fasadedetalj',
        kind: 'physical_object',
        desc: 'Den synlige delen av boligfasaden og oppgangen som skiltet er knyttet til.',
        placeSpecificReason: 'Fasaden gjør det mulig å forstå skiltet som et offentlig minnepunkt uten å gjøre privatboligen til besøksobjekt.',
        physicalObject: true,
        placeSpecific: true,
        storePrice: 10,
        currency: 'PC',
        collection: 'oslo_bla_skilt_2026',
        collectable: true,
        source_urls: ['https://oslobyleksikon.no/side/Vetlandsveien']
      }
    ],
    brands: [
      { id: 'oslo_byes_vel', name: 'Oslo Byes Vel', brand_kind: 'heritage_organisation', brand_type: 'blue_plaque_programme' },
      { id: 'nrk_aud_schonemann_memory', name: 'NRK', brand_kind: 'public_broadcaster', brand_type: 'major_tv_context_for_aud_schonemann' }
    ],
    for_na: {
      title: 'Fra privat hjem til offentlig minnepunkt',
      before: 'Fra 1958 til 1981 var Vetlandsveien 69 først og fremst Aud Schønemanns private hjem. Adressen bar ingen egen offentlig rolle som kulturminnested.',
      now: 'Et blått skilt ved oppgang D gjør forbindelsen mellom adressen og skuespillerhistorien synlig fra offentlig rom.',
      change: 'Boligen er fortsatt privat, men fasaden har fått et offentlig minnelag som gjør Schønemanns liv i byen lesbart uten å gjøre hjemmet til museum.',
      lookFor: ['det blå skiltet', 'oppgangsankeret ved 69D', 'hvordan minnet er lagt til en vanlig boligfasade'],
      sources: [SOURCE_BLUE, 'https://oslobyleksikon.no/side/Vetlandsveien']
    }
  },
  bla_skilt_stein_mehren_ullevalsveien_60: {
    rounds_exclude: ['nature'],
    underbadge_ids: ['poesi', 'forfattere_og_litteratursteder'],
    works: [
      {
        id: 'stein_mehren_bla_skilt_2026',
        title: 'Det blå skiltet for Stein Mehren',
        type: 'litteraert_minneskilt',
        desc: 'Plaketten som markerer Ullevålsveien 60 som sted i Stein Mehrens forfatterbiografi.',
        why_here: 'Mehren bodde på adressen gjennom store deler av livet.',
        source_note: 'Oslo Byes Vel og Oslo byleksikon, kontrollert 19. juli 2026.'
      },
      {
        id: 'stein_mehren_lyrikkforfatterskap',
        title: 'Lyrikkforfatterskapet',
        type: 'forfatterskap',
        desc: 'Mehrens omfattende lyriske produksjon gjorde ham til en markant stemme i norsk etterkrigslitteratur.',
        why_here: 'Minneskiltet knytter forfatterskapet til stedet der han hadde et langvarig hjem.',
        source_note: 'Store norske leksikon: Stein Mehren.'
      },
      {
        id: 'stein_mehren_essayistikk',
        title: 'Essayistikken',
        type: 'sakprosa',
        desc: 'Mehren skrev essays om blant annet kunst, samfunn, filosofi og menneskets plass i verden.',
        why_here: 'Stedet gir en fysisk inngang til bredden i Mehrens arbeid utover lyrikken.',
        source_note: 'Store norske leksikon: Stein Mehren.'
      }
    ],
    civication_store: [
      {
        id: 'stein_mehren_bla_skilt_objekt',
        title: 'Stein Mehren-skiltet',
        type: 'minneplakett',
        kind: 'physical_object',
        desc: 'Det blå skiltet som gjør Ullevålsveien 60 til et offentlig litterært minnepunkt.',
        placeSpecificReason: 'Plaketten står på adressen som er dokumentert som Mehrens mangeårige hjem.',
        physicalObject: true,
        placeSpecific: true,
        storePrice: 20,
        currency: 'PC',
        collection: 'oslo_bla_skilt_2026',
        collectable: true,
        source_urls: [SOURCE_BLUE, 'https://oslobyleksikon.no/side/Ullev%C3%A5lsveien']
      },
      {
        id: 'stein_mehren_ullevalsveien_1902_fasade',
        title: 'Leiegårdsfasaden fra 1902',
        type: 'bygningsfasade',
        kind: 'physical_object',
        desc: 'Den synlige fasaden til leiegården der Mehren bodde gjennom store deler av livet.',
        placeSpecificReason: 'Bygningen er det fysiske hverdagsankeret som det litterære minneskiltet er festet til.',
        physicalObject: true,
        placeSpecific: true,
        storePrice: 15,
        currency: 'PC',
        collection: 'oslo_bla_skilt_2026',
        collectable: true,
        source_urls: ['https://oslobyleksikon.no/side/Ullev%C3%A5lsveien']
      }
    ],
    brands: [
      { id: 'oslo_byes_vel', name: 'Oslo Byes Vel', brand_kind: 'heritage_organisation', brand_type: 'blue_plaque_programme' }
    ],
    for_na: {
      title: 'Fra forfatterhjem til litterært minnested',
      before: 'Ullevålsveien 60 var Stein Mehrens hjem og arbeidsnære hverdagsmiljø gjennom store deler av livet, uten å være et offentlig litteratursted.',
      now: 'Det blå skiltet gjør forbindelsen mellom forfatteren og adressen synlig for forbipasserende.',
      change: 'En privat boligadresse har fått et offentlig litterært minnelag, men bygningen er fortsatt bolig og ikke museum.',
      lookFor: ['det blå skiltet', 'leiegårdsfasaden', 'forholdet mellom en vanlig boliggate og et stort forfatterskap'],
      sources: [SOURCE_BLUE, 'https://oslobyleksikon.no/side/Ullev%C3%A5lsveien', 'https://snl.no/Stein_Mehren']
    }
  },
  bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5: {
    rounds_exclude: ['nature'],
    underbadge_ids: ['storting_og_regjering', 'arbeiderbevegelse'],
    works: [
      {
        id: 'christopher_hornsrud_bla_skilt_2026',
        title: 'Det blå skiltet for Christopher Hornsrud',
        type: 'politisk_minneskilt',
        desc: 'Plaketten som markerer Hornsruds mangeårige hjem i Oslo.',
        why_here: 'Skiltet gjør privatadressen til et offentlig politisk minnepunkt.',
        source_note: 'Oslo Byes Vel, kontrollert 19. juli 2026.'
      },
      {
        id: 'hornsrud_regjeringen_1928',
        title: 'Hornsrud-regjeringen',
        type: 'regjeringsdannelse',
        desc: 'Norges første regjering utgått fra Arbeiderpartiet, ledet av Christopher Hornsrud i 1928.',
        why_here: 'Minneskiltet knytter den nasjonale regjeringshistorien til Hornsruds personlige Oslo-anker.',
        source_note: 'Store norske leksikon: Christopher Hornsrud.'
      },
      {
        id: 'hornsrud_finansminister_1928',
        title: 'Finansminister i 1928',
        type: 'politisk_verv',
        desc: 'Hornsrud var både statsminister og finansminister i den korte Arbeiderparti-regjeringen.',
        why_here: 'Vervet viser bredden i det politiske ansvaret som knyttes til personen minneskiltet hedrer.',
        source_note: 'Store norske leksikon: Christopher Hornsrud.'
      }
    ],
    civication_store: [
      {
        id: 'christopher_hornsrud_bla_skilt_objekt',
        title: 'Christopher Hornsrud-skiltet',
        type: 'minneplakett',
        kind: 'physical_object',
        desc: 'Det blå skiltet ved Mogens Thorsens gate 5.',
        placeSpecificReason: 'Skiltet er den offentlige, fysiske markøren for Hornsruds tilknytning til adressen.',
        physicalObject: true,
        placeSpecific: true,
        storePrice: 20,
        currency: 'PC',
        collection: 'oslo_bla_skilt_2026',
        collectable: true,
        source_urls: [SOURCE_BLUE]
      },
      {
        id: 'christopher_hornsrud_boligfasade_anker',
        title: 'Boligfasaden i Mogens Thorsens gate',
        type: 'fasadeanker',
        kind: 'physical_object',
        desc: 'Den offentlig synlige fasaden som skiltet er knyttet til.',
        placeSpecificReason: 'Fasaden viser forskjellen mellom et offentlig minnepunkt og en fortsatt privat bolig.',
        physicalObject: true,
        placeSpecific: true,
        storePrice: 10,
        currency: 'PC',
        collection: 'oslo_bla_skilt_2026',
        collectable: true,
        source_urls: [SOURCE_BLUE]
      }
    ],
    brands: [
      { id: 'oslo_byes_vel', name: 'Oslo Byes Vel', brand_kind: 'heritage_organisation', brand_type: 'blue_plaque_programme' },
      { id: 'arbeiderpartiet', name: 'Arbeiderpartiet', brand_kind: 'political_party', brand_type: 'party_of_hornsrud_government' },
      { id: 'stortinget', name: 'Stortinget', brand_kind: 'parliament', brand_type: 'parliamentary_context' }
    ],
    for_na: {
      title: 'Fra privat hjem til politisk minnepunkt',
      before: 'Mogens Thorsens gate 5 var et privat hjem knyttet til Christopher Hornsruds hverdagsliv, mens hans nasjonale politiske virke utspilte seg på andre arenaer.',
      now: 'Det blå skiltet gjør bolutadressen til et offentlig lesbart spor etter Norges første statsminister fra Arbeiderpartiet.',
      change: 'Den politiske historien er flyttet ut i byrommet gjennom en minneplakett, uten at privatboligen blir et museum.',
      lookFor: ['det blå skiltet', 'boligfasaden', 'kontrasten mellom den stille boliggaten og den nasjonale regjeringshistorien'],
      sources: [SOURCE_BLUE, 'https://snl.no/Christopher_Hornsrud']
    }
  },
  bla_skilt_helverschous_lokke_munkedamsveien_35: {
    rounds_exclude: ['nature'],
    underbadge_ids: ['attenhundretallet', 'byhistorie', 'kulturminner_og_bevaring'],
    works: [
      {
        id: 'helverschous_lokke_bla_skilt_2026',
        title: 'Det blå skiltet for Helverschous løkke',
        type: 'historisk_minneskilt',
        desc: 'Plaketten som markerer minnet om den forsvunne byløkken ved dagens Munkedamsveien 35.',
        why_here: 'Skiltet er dagens fysiske inngang til en løkke og et løkkehus som ikke lenger finnes.',
        source_note: 'Oslo Byes Vel og Oslo byleksikon, kontrollert 19. juli 2026.'
      },
      {
        id: 'helverschous_lokke_sommerfryd',
        title: 'Sommerfryd / Helverschous løkke',
        type: 'historisk_bylokke',
        desc: 'Den tidligere løkkeeiendommen som fikk navn etter Nils Helverschou etter 1819.',
        why_here: 'Minneskiltet står som stedlig erstatning for et historisk anlegg som er borte.',
        source_note: 'Oslo byleksikon: Helverschous løkke.'
      },
      {
        id: 'helverschous_lokke_skytekonkurranser',
        title: 'Skytekonkurransene på løkken',
        type: 'historisk_aktivitet',
        desc: 'Skydeselskabet Christian Augusts Venner brukte stedet til skytekonkurranser fram til 1869.',
        why_here: 'Aktiviteten viser at løkken også var et sosialt og organisert fritidssted.',
        source_note: 'Oslo byleksikon: Helverschous løkke.'
      }
    ],
    civication_store: [
      {
        id: 'helverschous_lokke_bla_skilt_objekt',
        title: 'Helverschous løkke-skiltet',
        type: 'minneplakett',
        kind: 'physical_object',
        desc: 'Det blå skiltet som gjør den forsvunne løkken synlig i dagens gatebilde.',
        placeSpecificReason: 'Skiltet er den konkrete gjenstanden brukeren kan finne på stedet i dag.',
        physicalObject: true,
        placeSpecific: true,
        storePrice: 20,
        currency: 'PC',
        collection: 'oslo_bla_skilt_2026',
        collectable: true,
        source_urls: [SOURCE_BLUE, 'https://oslobyleksikon.no/side/Helverschous_l%C3%B8kke']
      },
      {
        id: 'helverschous_lokke_grondahlgarden_kontrast',
        title: 'Grøndahlgården som før/nå-anker',
        type: 'dagens_bygningsfasade',
        kind: 'physical_object',
        desc: 'Dagens bygning på Munkedamsveien 35, oppført lenge etter at løkkehuset var revet.',
        placeSpecificReason: 'Den synlige bygningen er et viktig fysisk kontrastobjekt som hindrer at brukeren forveksler dagens hus med den historiske løkken.',
        physicalObject: true,
        placeSpecific: true,
        storePrice: 15,
        currency: 'PC',
        collection: 'oslo_bla_skilt_2026',
        collectable: true,
        source_urls: ['https://oslobyleksikon.no/side/Munkedamsveien']
      }
    ],
    brands: [
      { id: 'oslo_byes_vel', name: 'Oslo Byes Vel', brand_kind: 'heritage_organisation', brand_type: 'blue_plaque_programme' },
      { id: 'skydeselskabet_christian_augusts_venner', name: 'Skydeselskabet Christian Augusts Venner', brand_kind: 'historical_association', brand_type: 'documented_user_of_the_lokke' }
    ],
    for_na: {
      title: 'Fra byløkke til tett by',
      before: 'Området var del av en større byløkke kjent først som Sommerfryd og senere som Helverschous løkke. Løkkehuset, serveringsstedet og aktivitetene hørte til et langt åpnere landskap rundt Christiania.',
      now: 'Løkkehuset er borte. Dagens Munkedamsveien 35 er Grøndahlgården fra 1935, og det blå skiltet er minneankeret for den eldre historien.',
      change: 'Utparsellering og byutvikling fjernet den historiske løkken som fysisk helhet. Minneskiltet legger ett lesbart historisk lag tilbake i den tette byen.',
      lookFor: ['det blå skiltet', 'dagens Grøndahlgården', 'mangelen på et bevart løkkehus', 'hvordan den moderne gaten skjuler det eldre løkkelandskapet'],
      sources: [SOURCE_BLUE, 'https://oslobyleksikon.no/side/Helverschous_l%C3%B8kke', 'https://oslobyleksikon.no/side/Munkedamsveien']
    }
  },
  bla_skilt_enerhaugen_samfund_smedgata_34: {
    rounds_exclude: ['nature'],
    underbadge_ids: ['attenhundretallet', 'sosialhistorie', 'byhistorie'],
    works: [
      {
        id: 'enerhaugen_samfund_bla_skilt_2026',
        title: 'Det blå skiltet for Enerhaugens Samfund',
        type: 'historisk_minneskilt',
        desc: 'Plaketten ved dagens Smedgata 34 som markerer omtrent hvor Samfundets bygning sto.',
        why_here: 'Skiltet gjør et sosialt og organisatorisk miljø synlig igjen etter saneringen.',
        source_note: 'Oslo Byes Vel og Enerhaugen, Grønland og Tøyen historielag, kontrollert 19. juli 2026.'
      },
      {
        id: 'enerhaugen_samfund_bedehuset_1851',
        title: 'Samfundets bedehus',
        type: 'forsamlingshus',
        desc: 'Bedehuset som ble innviet i 1851 og senere forsvant under saneringen av Enerhaugen.',
        why_here: 'Minneskiltet er dagens fysiske anker for den revne bygningen.',
        source_note: 'Oslo byleksikon: Enerhaugens Samfund.'
      },
      {
        id: 'enerhaugen_samfund_sosiale_ordninger',
        title: 'Sykekasse, sparing og bibliotek',
        type: 'sosial_infrastruktur',
        desc: 'Samfundet utviklet praktiske ordninger som sykekasse, sparevirksomhet og bibliotek for arbeiderbefolkningen.',
        why_here: 'Ordningene viser at Samfundet var mer enn et bedehus: det var også sosial og organisatorisk infrastruktur.',
        source_note: 'Oslo byleksikon: Enerhaugens Samfund.'
      }
    ],
    civication_store: [
      {
        id: 'enerhaugen_samfund_bla_skilt_objekt',
        title: 'Enerhaugens Samfund-skiltet',
        type: 'minneplakett',
        kind: 'physical_object',
        desc: 'Det blå skiltet som ble satt opp ved dagens Smedgata 34 i 2026.',
        placeSpecificReason: 'Skiltet er dagens konkrete, offentlige minneobjekt for en bygning og organisasjon som er borte.',
        physicalObject: true,
        placeSpecific: true,
        storePrice: 20,
        currency: 'PC',
        collection: 'oslo_bla_skilt_2026',
        collectable: true,
        source_urls: [SOURCE_BLUE, 'https://egt-historielag.no/informasjon/nyheter/vis/?ID=60485&T=Referat+arrangementer+14%2F4+2026+&af=1']
      },
      {
        id: 'enerhaugen_samfund_smedgata_34_dagens_anker',
        title: 'Dagens Smedgata 34',
        type: 'adresseanker',
        kind: 'physical_object',
        desc: 'Det synlige inngangs- og fasadepunktet der minneskiltet er montert i dagens bystruktur.',
        placeSpecificReason: 'Objektet gjør forskjellen mellom dagens skiltadresse og den eldre historiske adressen fysisk forståelig.',
        physicalObject: true,
        placeSpecific: true,
        storePrice: 10,
        currency: 'PC',
        collection: 'oslo_bla_skilt_2026',
        collectable: true,
        source_urls: ['https://egt-historielag.no/informasjon/nyheter/vis/?ID=60485&T=Referat+arrangementer+14%2F4+2026+&af=1']
      }
    ],
    brands: [
      { id: 'oslo_byes_vel', name: 'Oslo Byes Vel', brand_kind: 'heritage_organisation', brand_type: 'blue_plaque_programme' },
      { id: 'egt_historielag', name: 'Enerhaugen, Grønland og Tøyen historielag', brand_kind: 'local_history_association', brand_type: 'plaque_unveiling_and_local_documentation' },
      { id: 'enerhaugens_samfund', name: 'Enerhaugens Samfund', brand_kind: 'historical_association', brand_type: 'historical_social_and_worker_association' }
    ],
    for_na: {
      title: 'Fra Smedgata 38 til et minne ved Smedgata 34',
      before: 'Enerhaugens Samfund hadde et bedehus og sosialt organisasjonsmiljø i den gamle bebyggelsen på Enerhaugen. Eldre kilder knytter bygningen til Smedgata 38.',
      now: 'Den gamle bygningen og store deler av strøket er borte. Det blå skiltet står ved dagens Smedgata 34, omtrent der historielaget oppgir at Samfundet lå.',
      change: 'Saneringen endret både bebyggelsen og adressebildet. Minneskiltet gjør det nødvendig å lese dagens punkt sammen med den eldre adressen, ikke erstatte den ene med den andre.',
      lookFor: ['det blå skiltet', 'dagens adresse 34', 'det moderne gatelandskapet', 'hvordan et skilt kan markere et sted som ikke lenger har sin opprinnelige bygning'],
      sources: [SOURCE_BLUE, 'https://egt-historielag.no/informasjon/nyheter/vis/?ID=60485&T=Referat+arrangementer+14%2F4+2026+&af=1', 'https://oslobyleksikon.no/side/Enerhaugens_Samfund']
    }
  }
};

const placeFiles = [
  'data/places/popkultur/oslo/places_populaerkultur_oslo_bla_skilt_2026_batch_01.json',
  'data/places/litteratur/oslo/places_litteratur_oslo_bla_skilt_2026_batch_01.json',
  'data/places/politikk/oslo/places_politikk_oslo_bla_skilt_2026_batch_01.json',
  'data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01.json'
];

for (const file of placeFiles) {
  const rows = readJson(file);
  for (const place of rows) {
    const patch = placePatches[place.id];
    if (patch) Object.assign(place, patch);
  }
  writeJson(file, rows);
}

const peopleManifestPath = 'data/people/manifest.json';
const peopleManifest = readJson(peopleManifestPath);
for (const file of [
  'people/historie/oslo/bla_skilt_2026/nils_helverschou.json',
  'people/historie/oslo/bla_skilt_2026/honoratus_halling.json'
]) appendUnique(peopleManifest.files, file);
writeJson(peopleManifestPath, peopleManifest);

const storyPath = 'data/stories/stories_oslo_bla_skilt_2026_rounds_batch1.json';
const storyManifestPath = 'data/stories/stories_manifest.json';
const storyManifest = readJson(storyManifestPath);
for (const [category, entity_id] of [
  ['populaerkultur', 'bla_skilt_aud_schonemann_vetlandsveien_69d'],
  ['litteratur', 'bla_skilt_stein_mehren_ullevalsveien_60'],
  ['politikk', 'bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5'],
  ['historie', 'bla_skilt_helverschous_lokke_munkedamsveien_35'],
  ['historie', 'bla_skilt_enerhaugen_samfund_smedgata_34']
]) {
  const entry = { category, entity_id, path: storyPath };
  appendUnique(storyManifest.files, entry, (item) => item.entity_id === entity_id && item.path === storyPath);
}
writeJson(storyManifestPath, storyManifest);

const leksikonPath = 'data/leksikon/places/oslo/mixed/leksikon_oslo_bla_skilt_2026_rounds_batch1.json';
const leksikonManifestPath = 'data/leksikon/manifest.json';
const leksikonManifest = readJson(leksikonManifestPath);
appendUnique(leksikonManifest.files, leksikonPath);
writeJson(leksikonManifestPath, leksikonManifest);

const relationsPath = 'data/relations.json';
const relations = readJson(relationsPath);
const newRelations = [
  {
    id: 'rel_aud_schonemann_bla_skilt_vetlandsveien_69d',
    type: 'bodde_her',
    place: 'bla_skilt_aud_schonemann_vetlandsveien_69d',
    person: 'aud_schonemann',
    label: 'Bodde på adressen 1958–1981',
    why: 'Det blå skiltet markerer Aud Schønemanns mangeårige hjem på Oppsal.',
    source: 'https://oslobyleksikon.no/side/Vetlandsveien'
  },
  {
    id: 'rel_stein_mehren_bla_skilt_ullevalsveien_60',
    type: 'bodde_her',
    place: 'bla_skilt_stein_mehren_ullevalsveien_60',
    person: 'stein_mehren',
    label: 'Mangeårig hjem',
    why: 'Det blå skiltet markerer adressen Stein Mehren var knyttet til gjennom store deler av livet.',
    source: 'https://oslobyleksikon.no/side/Ullev%C3%A5lsveien'
  },
  {
    id: 'rel_christopher_hornsrud_bla_skilt_mogens_thorsens_gate_5',
    type: 'bodde_her',
    place: 'bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5',
    person: 'christopher_hornsrud',
    label: 'Mangeårig hjem i Oslo',
    why: 'Minneskiltet markerer Hornsruds personlige Oslo-anker uten å gjøre privatboligen til museum.',
    source: 'https://www.oslobyesvel.no/blaa-skilt-i-oslo'
  },
  {
    id: 'rel_nils_helverschou_bla_skilt_helverschous_lokke',
    type: 'ga_navnet_til_stedet',
    place: 'bla_skilt_helverschous_lokke_munkedamsveien_35',
    person: 'nils_helverschou',
    label: 'Overtok Sommerfryd i 1819',
    why: 'Løkken ble senere kjent som Helverschous løkke etter traktør Nils Helverschou.',
    source: 'https://oslobyleksikon.no/side/Helverschous_l%C3%B8kke'
  },
  {
    id: 'rel_honoratus_halling_bla_skilt_enerhaugen_samfund',
    type: 'initiativtaker',
    place: 'bla_skilt_enerhaugen_samfund_smedgata_34',
    person: 'honoratus_halling',
    label: 'Tok initiativ til Enerhaugens Samfund i 1850',
    why: 'Halling er det direkte personankeret for organisasjonen som minneskiltet markerer.',
    source: 'https://oslobyleksikon.no/side/Enerhaugens_Samfund'
  }
];
for (const relation of newRelations) appendUnique(relations, relation, (item) => item.id === relation.id);
writeJson(relationsPath, relations);

const runtimePath = 'js/ui/place-card.js';
let runtime = fs.readFileSync(runtimePath, 'utf8');
if (!runtime.includes('rounds_exclude?: string[]')) {
  runtime = runtime.replace(
    ' *   rounds?: string[],\n *   rundinger?: string[],',
    ' *   rounds?: string[],\n *   rundinger?: string[],\n *   rounds_exclude?: string[],'
  );
}
if (!runtime.includes('const excludedRoundIds = new Set(')) {
  runtime = runtime.replace(
    '  const declared = Array.isArray(place?.rounds) ? place.rounds :\n    Array.isArray(place?.rundinger) ? place.rundinger :\n    [];\n  const outputIds = profileIds.slice();',
    '  const declared = Array.isArray(place?.rounds) ? place.rounds :\n    Array.isArray(place?.rundinger) ? place.rundinger :\n    [];\n  const excludedRoundIds = new Set(\n    (Array.isArray(place?.rounds_exclude) ? place.rounds_exclude : [])\n      .map((entry) => PLACE_ROUND_BY_ID[String(entry || "").trim()]?.id)\n      .filter(Boolean)\n  );\n  const outputIds = profileIds.slice();'
  );
  runtime = runtime.replace(
    '  return uniqueIds.slice(0, 9).map(id => PLACE_ROUND_BY_ID[id]);',
    '  return uniqueIds\n    .filter(id => !excludedRoundIds.has(id))\n    .slice(0, 9)\n    .map(id => PLACE_ROUND_BY_ID[id]);'
  );
}
runtime = runtime.replace(
  '    if (kind === "works") html = `<div class="pc-empty">Ingen verk eller prestasjoner ennå</div>`;',
  '    if (kind === "works") html = renderPlaceCardWorks(currentPlace || place);'
);
fs.writeFileSync(runtimePath, runtime);

const roundsDocsPath = 'data/places/README_place_rounds.md';
let roundsDocs = fs.readFileSync(roundsDocsPath, 'utf8');
const roundsMarker = '## Kuraterte eksklusjoner (`rounds_exclude`)';
if (!roundsDocs.includes(roundsMarker)) {
  roundsDocs += `\n\n${roundsMarker}\n\nKategori-profilene er standardprofiler, ikke et krav om at alle steder skal tvinges inn i ni rundinger. Når en standardrunding er faglig irrelevant, kan stedet bruke \`rounds_exclude\`. Ekskluderte rundinger fjernes uten at runtime fyller hullet med en tilfeldig erstatning.\n\n### Minneskilt, minneplaketter og blå skilt\n\nNår gameplay-objektet er et **minneskilt, en minneplakett eller en tilsvarende liten offentlig minnemarkør**, skal stedet alltid ha:\n\n\`\`\`json\n{\n  "rounds_exclude": ["nature"]\n}\n\`\`\`\n\nSlike steder skal **ikke få Nature-rundingen**. Ikke fyll Nature med generell bynatur, vær, gatebeplantning, fasadematerialer eller andre tilfeldige omgivelser bare for å fylle et 3x3-grid. Dersom det historiske emnet faktisk har et eget natursted, skal det naturstedet representeres separat; naturen skal ikke legges på minneplaketten.\n\nDet er heller ikke tillatt å erstatte den fjernede Nature-rundingen med irrelevante \`tasks\`, \`play\` eller \`training\`. Et kuratert minneskilt kan derfor ha færre enn ni rundinger.\n`;
  fs.writeFileSync(roundsDocsPath, roundsDocs);
}

const placeStandardPath = 'docs/PLACE_STANDARD.md';
let placeStandard = fs.readFileSync(placeStandardPath, 'utf8');
const standardMarker = '## Minneskilt og plaketter: ingen automatisk Nature';
if (!placeStandard.includes(standardMarker)) {
  placeStandard += `\n\n${standardMarker}\n\nFor canonical steder der selve gameplay-objektet er et blått skilt, minneskilt, minneplakett eller en tilsvarende liten minnemarkør, gjelder en fast produksjonsregel:\n\n- sett \`rounds_exclude: ["nature"]\`;\n- ikke opprett \`nature_profile\`;\n- ikke bruk tilfeldig bynatur, vær, trær, fasadematerialer eller omgivelsesbeskrivelser som fyllstoff;\n- ikke erstatt Nature med en annen irrelevant handlingsrunding bare for å beholde ni ikoner;\n- fyll i stedet de faglig relevante rundingene rundt personen, historien, verket, minnet, aktørene og før/nå-laget.\n\nDenne regelen gjelder minnemarkøren som stedstype uavhengig av om primærkategorien er historie, politikk, litteratur, populærkultur eller et annet kulturfag.\n`;
  fs.writeFileSync(placeStandardPath, placeStandard);
}

const productionContractPath = 'docs/DATA_PRODUCTION_CONTRACT.md';
let productionContract = fs.readFileSync(productionContractPath, 'utf8');
const contractMarker = '### Rundingsregel for minneskilt og plaketter';
if (!productionContract.includes(contractMarker)) {
  productionContract += `\n\n${contractMarker}\n\nBlå skilt, minneskilt og minneplaketter skal ikke automatisk arve Nature fra kategori-profilen. Nye slike records skal bruke \`rounds_exclude: ["nature"]\` og skal ikke ha \`nature_profile\`. Naturinnhold må tilhøre et faktisk natursted eller et sted der naturen er en selvstendig dokumentert del av gameplay-objektet, ikke selve minneplaketten.\n`;
  fs.writeFileSync(productionContractPath, productionContract);
}

console.log('Finalized five Oslo blue-plaque places with eight curated non-nature rounds.');
