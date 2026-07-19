const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const writeJson = (relativePath, value) => {
  const absolutePath = path.join(repo, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
};
const upsertById = (rows, row) => {
  const index = rows.findIndex((candidate) => candidate.id === row.id);
  if (index >= 0) rows[index] = row;
  else rows.push(row);
};
const upsertByPlaceId = (rows, row) => {
  const index = rows.findIndex((candidate) => candidate.place_id === row.place_id);
  if (index >= 0) rows[index] = row;
  else rows.push(row);
};

const placeId = 'skanevik_kultur_og_idrettshall';
const placePath = 'data/places/kunst/vestland/etne/skanevik_kultur_og_idrettshall.json';
const placeRows = readJson(placePath);
assert.strictEqual(placeRows.length, 1, 'Forventet ett sted i Skånevik-hallfilen');
const place = placeRows[0];
assert.strictEqual(place.id, placeId);
assert.deepStrictEqual([place.lat, place.lon, place.year], [59.731053106182465, 5.922931264241455, null]);

Object.assign(place, {
  externalLinks: [
    {
      type: 'official',
      label: 'Skånevik Kultur- og Idrettshall – historia til hallen',
      url: 'https://skaanevikidrettshall.no/historie/',
      lang: 'nn',
      verifiedAt: '2026-07-19',
      note: 'Hallens eiga detaljerte framstilling av Husmorlaget, Torgdagane, finansieringa, dugnadsmodellen og den trinnvise ferdigstillinga i 1991–1994.'
    },
    {
      type: 'official',
      label: 'Skånevik Kultur- og Idrettshall – idrettshallen',
      url: 'https://skaanevikidrettshall.no/fasilitetar/idrettshall/',
      lang: 'nn',
      verifiedAt: '2026-07-19',
      note: 'Dokumenterer fleirbruken, hallgolvet på 44 x 22 meter og ferdigstillinga av første og andre etasje.'
    },
    {
      type: 'official',
      label: 'Skånevik Kultur- og Idrettshall – kalender 2026',
      url: 'https://skaanevikidrettshall.no/kalender/',
      lang: 'nn',
      verifiedAt: '2026-07-19',
      note: 'Brukes berre som annonsert programspor for 2026, ikkje som dokumentasjon på gjennomførte resultat.'
    },
    {
      type: 'official',
      label: 'Etne kommune – Skånevik kultur- og idrettshall',
      url: 'https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=13',
      lang: 'nn',
      verifiedAt: '2026-07-19',
      note: 'Kommunal organisasjonsoppføring med adresse, organisasjonsnummer og Marie Kristiansen som dagleg leiar.'
    },
    {
      type: 'registry',
      label: 'Brønnøysundregistrene – Skånevik Kultur- og Idrettshall SA',
      url: 'https://virksomhet.brreg.no/nb/oppslag/enheter/970972285',
      lang: 'nb',
      verifiedAt: '2026-07-19',
      note: 'Stadfestar samvirkeforetaket, organisasjonsnummeret og forretningsadressa Ligrendvegen 11.'
    }
  ],
  emne_ids: ['em_kunst_institusjoner_kanon'],
  underbadge_ids: ['scenekunst', 'design_og_form', 'kunsthistorie'],
  nature_profile: {
    type: 'høgareliggjande fleirbruksbygg / vêr / uteareal og materialitet',
    title: 'Hallen over sentrum mellom skuleveg og vêr',
    summary: 'Natur-rundinga handlar om den konkrete plasseringa over Skånevik sentrum, den korte ganglinja frå skulen, vêret som påverka Torgdagane og overgangen mellom uteareal og eit stort innandørs fleirbruksrom. Kortet legg ikkje inn udokumenterte artar eller naturverdiar.',
    themes: [
      'høgareliggjande plassering over det kompakte sentrumet',
      'åtte minutts dokumentert ganglinje frå skulen under planlegginga',
      'vêr og finvêrsplanlegging som del av Torgdagane',
      'overgang mellom utandørs rigging og innandørs arrangement',
      'materialitet og stort hallvolum bygd gjennom lokal dugnad',
      'innandørs alternativ for aktivitet gjennom skiftande vestlandsvêr'
    ],
    nearby_place_ids: [
      'skanevik_idrettsanlegg',
      'skanevik_skatepark',
      'skanevik_skytebane'
    ]
  },
  works: [
    {
      id: 'skanevik_hall_torgdagane_1985_2019',
      title: 'Torgdagane 1985–2019',
      type: 'lokal kultur- og innsamlingsserie',
      kind: 'documented_fundraising_event_series',
      year: 1985,
      desc: 'Torgdagane blei oppretta for å samle pengar til hallprosjektet og utvikla seg til revy, musikk, mat, leik og bryggjedans. Arrangementet heldt fram til 2019.',
      why_here: 'Torgdagane knyter kulturprogrammet i sentrum direkte til finansieringa av den fysiske hallen.',
      source_note: 'Skånevik Kultur- og Idrettshall, Historia til hallen.'
    },
    {
      id: 'skanevik_hall_dugnadsbygging_1989_1992',
      title: 'Dugnadsbygginga 1989–1992',
      type: 'kollektiv byggeprestasjon',
      kind: 'documented_community_build',
      year: 1989,
      desc: 'Veggelementa blei reiste i 1989. Da første etasje stod ferdig mot slutten av 1991, var rundt 22 000 dugnadstimar registrerte, og første gymtime blei halden 3. januar 1992.',
      why_here: 'Arbeidet skapte sjølve idretts- og arrangementsrommet og er hallens viktigaste lokale prestasjon.',
      source_note: 'Skånevik Kultur- og Idrettshall, Historia til hallen.'
    },
    {
      id: 'skanevik_hall_innviing_1994',
      title: 'Innvielsen av fleirbrukshuset i 1994',
      type: 'lokal kulturmilepæl',
      kind: 'documented_opening_event',
      year: 1994,
      desc: 'Andre etasje med kjøkken og samfunnshusfunksjon blei ferdig, og innvielsesfesten blei halden hausten 1994.',
      why_here: 'Milepælen gjorde idrettshallen til eit komplett kultur- og samfunnshus, ikkje berre ein treningsflate.',
      source_note: 'Skånevik Kultur- og Idrettshall, Historia til hallen.'
    },
    {
      id: 'skanevik_hall_ole_ivars_dansen',
      title: 'Ole Ivars-dansen',
      type: 'dans og konsertarrangement',
      kind: 'documented_high_revenue_event',
      year: null,
      desc: 'Skyttarlaget arrangerte dans med Ole Ivars. Hallens eiga historie omtaler kvelden som det største enkeltarrangementet målt i inntekt.',
      why_here: 'Hendinga viser korleis det store hallrommet blei brukt som regional kultur- og dansemøteplass.',
      source_note: 'Skånevik Kultur- og Idrettshall, Historia til hallen.'
    },
    {
      id: 'skanevik_hall_oppussing_andre_etasje',
      title: 'Dugnadsoppussinga av andre etasje',
      type: 'fornying av samfunnshus',
      kind: 'documented_renovation',
      year: 2026,
      desc: 'Hallens historieside opplyser at andre etasje nyleg var ferdig oppussa, igjen gjennom dugnadsarbeid.',
      why_here: 'Oppussinga viser at den opphavlege dugnadsmodellen framleis blir brukt til å halde kulturromma levande.',
      source_note: 'Skånevik Kultur- og Idrettshall, kontrollert 19. juli 2026.'
    },
    {
      id: 'skanevik_hall_programspor_2026',
      title: 'Annonsert hallprogram i 2026',
      type: 'programspor',
      kind: 'announced_event_program',
      year: 2026,
      desc: 'Den offisielle kalenderen annonserte mellom anna Hoppcup, årsmøte, påskebasar og julemarknad i 2026.',
      why_here: 'Programsporet viser dagens blanding av idrett, organisasjonsliv og bygdearrangement utan å påstå utfallet av arrangementa.',
      source_note: 'Skånevik Kultur- og Idrettshall, kalender kontrollert 19. juli 2026.'
    }
  ],
  civication_store: [
    {
      id: 'skanevik_hall_dugnadsbrev',
      title: 'Dugnadsbrevet til bygda',
      type: 'byggjedokument',
      kind: 'physical_object',
      desc: 'Ei fysisk samlarutgåve av innkallingsbrevet der innbyggjarane kunne melde kor mange timar dei ville arbeide og kva byggjekompetanse dei hadde.',
      placeSpecificReason: 'Brevet representerer akkurat dugnadsmodellen som blei lånt frå Gjesdalhallen og brukt til å organisere hallbygginga i Skånevik.',
      historicalFunction: 'Gjer den lokale arbeidsfordelinga, fagkompetansen og måndagsplanlegginga synleg.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 30,
      currency: 'PC',
      collection: 'skanevik_dugnadshall',
      collectable: true,
      civicationUse: ['dugnadsplanlegging', 'kompetansekartlegging', 'arbeidsfordeling'],
      source_urls: ['https://skaanevikidrettshall.no/historie/']
    },
    {
      id: 'skanevik_hall_andelsbrev_5000',
      title: 'Andelsbrevet på 5 000 kroner',
      type: 'finansieringsobjekt',
      kind: 'physical_object',
      desc: 'Eit fysisk modellbrev for finansieringsordninga der bygdefolk kunne låne 5 000 kroner for å kjøpe andelar i samvirkelaget.',
      placeSpecificReason: 'Objektet viser den særskilde kombinasjonen av bankavtale, lokalt eigarskap og kommunal leige som gjorde hallen mogleg.',
      historicalFunction: 'Trener brukaren i å setje saman kapital, andelar og offentleg støtte utan å gjere kortet til generell økonomiundervisning.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 40,
      currency: 'PC',
      collection: 'skanevik_dugnadshall',
      collectable: true,
      civicationUse: ['lokal finansiering', 'samvirke', 'budsjettforståing'],
      source_urls: ['https://skaanevikidrettshall.no/historie/']
    },
    {
      id: 'skanevik_hall_snittmodell_1992_1994',
      title: 'Snittmodellen 1992/1994',
      type: 'bygningsmodell',
      kind: 'physical_object',
      desc: 'Ein fysisk snittmodell med hallgolvet og garderobane i første etasje og kjøkken, kafé og møterom i andre etasje.',
      placeSpecificReason: 'Modellen viser den trinnvise ferdigstillinga av akkurat denne hallen og skil idrettsflata frå samfunnshusdelen.',
      historicalFunction: 'Gjer det mogleg å forstå kvifor 1992 og 1994 begge er sentrale år utan å velje eitt feilaktig byggjeår.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 55,
      currency: 'PC',
      collection: 'skanevik_dugnadshall',
      collectable: true,
      civicationUse: ['byggjefasar', 'fleirbruk', 'romprogram'],
      source_urls: [
        'https://skaanevikidrettshall.no/historie/',
        'https://skaanevikidrettshall.no/fasilitetar/idrettshall/'
      ]
    }
  ],
  brands: [
    {
      id: 'skanevik_kultur_og_idrettshall_sa',
      name: 'Skånevik Kultur- og Idrettshall SA',
      brand_kind: 'community_owned_multiuse_venue',
      brand_type: 'venue_operator'
    },
    {
      id: 'skanevik_husmorlag_hallinitiativ',
      name: 'Skånevik Husmorlag',
      brand_kind: 'local_voluntary_association',
      brand_type: 'original_initiator'
    },
    {
      id: 'torgdagane_skanevik',
      name: 'Torgdagane i Skånevik',
      brand_kind: 'community_fundraising_festival',
      brand_type: 'fundraising_and_cultural_program'
    },
    {
      id: 'skanevik_idrettslag',
      name: 'Skånevik Idrettslag',
      brand_kind: 'local_sports_club',
      brand_type: 'hall_user_and_event_partner'
    },
    {
      id: 'etne_kommune',
      name: 'Etne kommune',
      brand_kind: 'municipality',
      brand_type: 'public_funder_and_school_user'
    },
    {
      id: 'skanevik_sparebank_og_bergen_bank_hallordning',
      name: 'Skånevik Sparebank og Bergen Bank',
      brand_kind: 'historical_financing_partners',
      brand_type: 'share_purchase_loan_arrangement'
    }
  ],
  for_na: {
    before: {
      period: '1980-åra–1991',
      desc: 'Husmorlaget drøymde om eit større samfunnshus, Torgdagane og andelsordninga skaffa kapital, og bygdefolket organiserte år med planlagt dugnad fram til første etasje stod ferdig.'
    },
    now: {
      period: '1994–2026',
      desc: 'Bygget fungerer som idrettshall, samfunnshus og kulturarena med kroppsøving, trening, messer, marknader, møte, ungdomsaktivitet og arrangement. Andre etasje er igjen oppussa på dugnad.'
    },
    change: 'Eit innsamlingsprosjekt voks til eit lånefritt fleirbrukshus, og den same dugnadslogikken blir framleis brukt til å fornye kulturromma.'
  },
  visual: {
    designCode: 'skanevik_dugnad_hall_cutaway_miniature'
  }
});
writeJson(placePath, placeRows);

const peoplePath = 'data/people/kunst/vestland/etne/skanevik_kultur_og_idrettshall/people_skanevik_kulturhall_batch1.json';
const people = [
  {
    id: 'skanevik_husmorlag_og_dugnadsfolket_hallen',
    name: 'Husmorlaget og dugnadsfolket bak hallen',
    initials: 'HD',
    desc: 'Kollektivt miljøanker for Husmorlaget, arbeidsgruppa og dei dokumenterte dugnadsfolka som finansierte, planla og bygde hallen.',
    tags: ['kunst', 'kulturarena', 'dugnad', 'husmorlag', 'skanevik', 'kollektivt_miljoanker'],
    placeId,
    places: [placeId],
    category: 'kunst',
    year: 1985,
    period: 'hallinitiativ_og_dugnadsbygging_1980_1994',
    popupDesc: 'Kortet er eit avgrensa kollektivt miljøanker for Skånevik Husmorlag, arbeidsgruppa og dugnadsfolka som kjeldene knyter direkte til hallprosjektet. Husmorlaget starta innsamlingsarbeidet, Torgdagane gav prosjektet eit kulturprogram, og bygdefolket organiserte rundt 22 000 registrerte dugnadstimar før første etasje var klar. Kortet påstår ikkje at alle innbyggjarar deltok eller at alle hadde same rolle.',
    image: '',
    cardImage: '',
    source_urls: ['https://skaanevikidrettshall.no/historie/'],
    verifiedAt: '2026-07-19'
  },
  {
    id: 'marie_kristiansen_skanevik_hall',
    name: 'Marie Kristiansen',
    initials: 'MK',
    desc: 'Dagleg leiar for Skånevik Kultur- og Idrettshall, dokumentert i Etne kommune si organisasjonsoversikt.',
    tags: ['kunst', 'kulturarena', 'dagleg_leiar', 'skanevik'],
    placeId,
    places: [placeId],
    category: 'kunst',
    year: 2026,
    period: 'dagleg_leiar_for_fleirbrukshallen',
    popupDesc: 'Etne kommune oppgir Marie Kristiansen som dagleg leiar for Skånevik Kultur- og Idrettshall på Ligrendvegen 11. People-kortet er avgrensa til den dokumenterte leiarrolla ved dette konkrete hall- og kulturarenaankeret.',
    image: '',
    cardImage: '',
    source_urls: ['https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=13'],
    verifiedAt: '2026-07-19'
  },
  {
    id: 'jan_henning_jespersen_skanevik_hall',
    name: 'Jan Henning Jespersen',
    initials: 'JJ',
    desc: 'Byggjeleiar under reisinga av Skånevik Kultur- og Idrettshall.',
    tags: ['kunst', 'bygging', 'dugnad', 'byggjeleiar', 'skanevik'],
    placeId,
    places: [placeId],
    category: 'kunst',
    year: 1989,
    period: 'byggjeleiar_under_hallreisinga',
    popupDesc: 'Hallens eiga historie namngir Jan Henning Jespersen som byggjeleiar under reisinga av bygget. Koblinga gjeld den konkrete byggefasen der veggelementa blei reiste og dugnadsarbeidet blei organisert.',
    image: '',
    cardImage: '',
    source_urls: ['https://skaanevikidrettshall.no/historie/'],
    verifiedAt: '2026-07-19'
  },
  {
    id: 'leif_jonny_johansen_skanevik_hall',
    name: 'Leif Jonny Johansen',
    initials: 'LJ',
    desc: 'Innreiingsleiar under bygginga av Skånevik Kultur- og Idrettshall.',
    tags: ['kunst', 'bygging', 'dugnad', 'innreiing', 'skanevik'],
    placeId,
    places: [placeId],
    category: 'kunst',
    year: 1989,
    period: 'innreiingsleiar_under_hallbygginga',
    popupDesc: 'Hallens eiga historie namngir Leif Jonny Johansen som innreiingsleiar. People-kortet bruker den dokumenterte rollen i arbeidet med å gjere hallbygget til eit fungerande idretts- og samfunnshus.',
    image: '',
    cardImage: '',
    source_urls: ['https://skaanevikidrettshall.no/historie/'],
    verifiedAt: '2026-07-19'
  }
];
writeJson(peoplePath, people);

const peopleManifestPath = 'data/people/manifest.json';
const peopleManifest = readJson(peopleManifestPath);
const manifestEntry = peoplePath.replace(/^data\//, '');
if (!peopleManifest.files.includes(manifestEntry)) peopleManifest.files.push(manifestEntry);
writeJson(peopleManifestPath, peopleManifest);

const relationsPath = 'data/relations.json';
const relations = readJson(relationsPath);
const newRelations = [
  {
    id: 'rel_husmorlag_dugnadsfolk_skanevik_hall',
    type: 'tok_initiativ_finansierte_og_bygde',
    place: placeId,
    person: 'skanevik_husmorlag_og_dugnadsfolket_hallen',
    why: 'Hallens eiga historie dokumenterer Husmorlaget som initiativtakar og bygdefolket som den organiserte dugnadskrafta bak finansiering og bygging.',
    source: 'https://skaanevikidrettshall.no/historie/'
  },
  {
    id: 'rel_marie_kristiansen_skanevik_hall',
    type: 'dagleg_leiar',
    place: placeId,
    person: 'marie_kristiansen_skanevik_hall',
    why: 'Etne kommune oppgir Marie Kristiansen som dagleg leiar for Skånevik Kultur- og Idrettshall.',
    source: 'https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=13'
  },
  {
    id: 'rel_jan_henning_jespersen_skanevik_hall',
    type: 'byggjeleiar_under_reisinga',
    place: placeId,
    person: 'jan_henning_jespersen_skanevik_hall',
    why: 'Hallens eiga historie namngir Jan Henning Jespersen som byggjeleiar under reisinga av bygget.',
    source: 'https://skaanevikidrettshall.no/historie/'
  },
  {
    id: 'rel_leif_jonny_johansen_skanevik_hall',
    type: 'innreiingsleiar_under_bygginga',
    place: placeId,
    person: 'leif_jonny_johansen_skanevik_hall',
    why: 'Hallens eiga historie namngir Leif Jonny Johansen som innreiingsleiar.',
    source: 'https://skaanevikidrettshall.no/historie/'
  }
];
for (const relation of newRelations) upsertById(relations, relation);
writeJson(relationsPath, relations);

const storyPath = 'data/stories/stories_etnesjoen_kunst_rounds_batch1.json';
const stories = readJson(storyPath);
const story = {
  id: 'st_skanevik_hallen_bygda_som_bygde_utan_lan',
  type: 'community_dugnad_cultural_infrastructure',
  title: 'Bygda som bygde hallen utan lån',
  year: 1994,
  place_id: placeId,
  person_id: 'skanevik_husmorlag_og_dugnadsfolket_hallen',
  summary: 'Husmorlaget, Torgdagane, lokale andelar og rundt 22 000 dugnadstimar gjorde ein liten bygd i stand til å reise eit stort idretts- og samfunnshus utan byggjelån.',
  story: 'På 1980-talet drøymde Skånevik Husmorlag om eit større samfunnshus. Loddsal, basarar og bingo gav den første kapitalen, men ideen voks snart til ein kombinert kultur- og idrettshall. Torgdagane blei oppretta som innsamlingsmotor i 1985. Revy, song, mat, leikar og bryggjedans gjorde finansieringa til ein årleg kulturhending i heile sentrum.\n\nEit samvirkelag og ein bankavtale lét bygdefolk låne 5 000 kroner for å kjøpe andelar. Kommunen valde i staden å støtte prosjektet som framtidig leigetakar. Før kroppsøvinga kunne flyttast, måtte elevar prøve gåvegen frå skulen. Dei yngste brukte åtte minutt, og i 1986 løyvde kommunen 1,5 millionar kroner til hallbygginga.\n\nArbeidsgruppa studerte dugnadsmodellen ved Gjesdalhallen. Innbyggjarane fekk brev der dei meldte timar og byggjekompetanse, og kvar måndag blei neste veke planlagd. Veggelementa kom opp i 1989. Jan Henning Jespersen var byggjeleiar under reisinga, medan Leif Jonny Johansen leia innreiinga. Da første etasje stod ferdig mot slutten av 1991, var rundt 22 000 dugnadstimar registrerte. Første gymtime blei halden 3. januar 1992.\n\nArbeidet heldt fram i andre etasje med kjøkken og samfunnshusrom. Hausten 1994 blei heile anlegget innvigd. Hallen var reist utan å ta opp byggjelån, og blei brukt til både trening, revy, dans, basar, bingo og restaurantkveldar. Dansen med Ole Ivars blei det største enkeltarrangementet målt i inntekt.\n\nI dag er hallen framleis både idrettsflate og bygdestove. Kroppsøving, trening, messer, marknader, ungdomsaktivitet og kulturarrangement deler same bygg. Den nylege oppussinga av andre etasje blei igjen gjennomført på dugnad. Historia er derfor ikkje berre om eit bygg som blei ferdig i 1994, men om ein arbeidsmodell som framleis held huset i bruk.',
  sources: [
    { title: 'Skånevik Kultur- og Idrettshall: Historia til hallen', url: 'https://skaanevikidrettshall.no/historie/' },
    { title: 'Skånevik Kultur- og Idrettshall: Idrettshallen', url: 'https://skaanevikidrettshall.no/fasilitetar/idrettshall/' },
    { title: 'Skånevik Kultur- og Idrettshall: Kalender 2026', url: 'https://skaanevikidrettshall.no/kalender/' },
    { title: 'Etne kommune: Skånevik kultur- og idrettshall', url: 'https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=13' },
    { title: 'Brønnøysundregistrene: Skånevik Kultur- og Idrettshall SA', url: 'https://virksomhet.brreg.no/nb/oppslag/enheter/970972285' }
  ],
  tags: ['Skånevik kultur- og idrettshall', 'Husmorlaget', 'Torgdagane', 'dugnad', 'samvirke', 'fleirbrukshall'],
  related_people: [
    'skanevik_husmorlag_og_dugnadsfolket_hallen',
    'marie_kristiansen_skanevik_hall',
    'jan_henning_jespersen_skanevik_hall',
    'leif_jonny_johansen_skanevik_hall'
  ],
  related_places: ['skanevik_idrettsanlegg', 'skanevik_sentrum', 'musikkpaviljongen_doktorhagen'],
  score: { narrative: 5, historical: 5, source: 5, play_value: 5, originality: 5, total: 25 },
  arc: {
    start: 'Husmorlaget samlar pengar til eit større samfunnshus og gjer Torgdagane til kulturdugnad.',
    middle: 'Bygdefolket organiserer kapital, fagkompetanse og rundt 22 000 arbeidstimar fram til første gymtime i 1992.',
    end: 'Heile fleirbrukshuset blir innvigd i 1994 og blir framleis fornya gjennom dugnad.'
  },
  next_scenes: [
    { place_id: 'musikkpaviljongen_doktorhagen', reason: 'Musikkpaviljongen viser ein mindre offentleg kulturarena som også blei reist gjennom lokal innsamling og dugnad.' },
    { place_id: 'house_of_blues_skanevik', reason: 'House of Blues viser den kommersielle livescena som kontrast til hallens samvirke- og fleirbruksmodell.' }
  ]
};
upsertById(stories, story);
writeJson(storyPath, stories);

const articlePath = 'data/leksikon/places/vestland/etne/kunst/leksikon_etnesjoen_kunst_rounds_batch1.json';
const articles = readJson(articlePath);
const article = {
  place_id: placeId,
  title: 'Skånevik-hallen – dugnad som kulturinfrastruktur',
  version: 1,
  visual: { designCode: 'article_art_miniature' },
  popupDesc: 'Eit lånefritt fleirbrukshus bygd gjennom Husmorlaget, Torgdagane, lokale andelar, kommunal støtte og rundt 22 000 registrerte dugnadstimar.',
  wikiText: [
    'Skånevik Kultur- og Idrettshall voks fram frå Husmorlaget sin draum om eit større samfunnshus på 1980-talet. Innsamling gjennom loddsal, basarar og bingo blei utvida med Torgdagane frå 1985. Festivalprogrammet med revy, song, mat, leikar og dans var derfor både kulturformidling og finansieringsarbeid.',
    'Prosjektet kombinerte eit samvirkelag, lokale andelar, bankavtale og offentleg leige. Da elevar brukte åtte minutt på prøvegåinga frå skulen, blei kroppsøving i hallen vurdert som praktisk. Etne kommune løyvde 1,5 millionar kroner i 1986, medan innbyggjarane melde arbeidstimar og fagkompetanse gjennom eit eige dugnadsbrev.',
    'Veggelementa blei reiste i 1989. Jan Henning Jespersen var byggjeleiar under reisinga og Leif Jonny Johansen innreiingsleiar. Første etasje stod ferdig mot slutten av 1991 etter rundt 22 000 registrerte dugnadstimar, og første gymtime blei halden 3. januar 1992. Andre etasje med kjøkken og samfunnshusrom blei innvigd hausten 1994.',
    'Hallgolvet er 44 x 22 meter, men kulturfunksjonen er like viktig som måla. Revy, dans, basarar, bingo, restaurantkveldar, messer, marknader og ungdomsaktivitet har gjort bygget til ei lokal storstove. Ole Ivars-dansen blir omtalt som hallens største enkeltarrangement målt i inntekt.',
    'Etne kommune oppgir Marie Kristiansen som dagleg leiar, og Brønnøysundregistrene stadfestar samvirkeforetaket på Ligrendvegen 11. Den offisielle kalenderen viser framleis ei blanding av idrett og bygdearrangement. Programmet for 2026 blir behandla som annonserte aktivitetar, ikkje som dokumenterte resultat.'
  ],
  summary: {
    one_liner: 'Skånevik bygde eit stort idretts- og samfunnshus gjennom kulturinnsamling, samvirke og år med organisert dugnad.',
    themes: ['dugnad', 'samvirke', 'kulturfinansiering', 'fleirbrukshall', 'lokal infrastruktur'],
    tone: ['fagleg', 'lokalhistorisk', 'institusjonshistorisk']
  },
  facts: [
    { id: 'fact_skanevik_hall_01', label: 'Torgdagane frå 1985', desc: 'Torgdagane blei oppretta som innsamlings- og kulturmotor for hallprosjektet.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] },
    { id: 'fact_skanevik_hall_02', label: '1,5 millionar i 1986', desc: 'Etne kommune løyvde 1,5 millionar kroner og planla kroppsøving i den nye hallen.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] },
    { id: 'fact_skanevik_hall_03', label: 'Rundt 22 000 dugnadstimar', desc: 'Da første etasje stod ferdig mot slutten av 1991, var rundt 22 000 arbeidstimar registrerte.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] },
    { id: 'fact_skanevik_hall_04', label: 'Første gymtime 3. januar 1992', desc: 'Datoen markerer at første etasje var tatt i aktiv skulebruk.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] },
    { id: 'fact_skanevik_hall_05', label: 'Innvigd hausten 1994', desc: 'Andre etasje gjorde hallen til eit komplett samfunns- og kulturhus.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] },
    { id: 'fact_skanevik_hall_06', label: 'Hallgolv 44 x 22 meter', desc: 'Den offisielle fasilitetsomtalen dokumenterer det store fleirbruksarealet.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] }
  ],
  chronology: [
    { id: 'chrono_skanevik_hall_01', year: null, period: '1980-åra', desc: 'Husmorlaget startar innsamlingsarbeidet for eit større samfunnshus.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] },
    { id: 'chrono_skanevik_hall_02', year: 1985, period: 'Torgdagane', desc: 'Første Torgdagane kombinerer kulturprogram og finansiering.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] },
    { id: 'chrono_skanevik_hall_03', year: 1986, period: 'Kommunal støtte', desc: 'Kommunen løyver 1,5 millionar kroner og legg kroppsøving til den planlagde hallen.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] },
    { id: 'chrono_skanevik_hall_04', year: 1989, period: 'Bygget reiser seg', desc: 'Veggelementa blir reiste gjennom organisert dugnad.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] },
    { id: 'chrono_skanevik_hall_05', year: 1992, period: 'Første etasje i bruk', desc: 'Første gymtime blir halden 3. januar.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] },
    { id: 'chrono_skanevik_hall_06', year: 1994, period: 'Innvielse', desc: 'Andre etasje og heile fleirbrukshuset blir innvigd om hausten.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] },
    { id: 'chrono_skanevik_hall_07', year: 2026, period: 'Fornya fleirbruk', desc: 'Andre etasje er nyleg oppussa på dugnad, og kalenderen viser vidare aktivitet.', confidence: 'high', sources: ['Skånevik Kultur- og Idrettshall'] }
  ],
  built_environment: {
    built_year: null,
    architects: [],
    materials: [],
    style: ['dugnadsbygd fleirbruks- og samfunnshus'],
    original_function: 'idrettshall og samfunnshus bygd i to hovudfasar',
    current_function: 'kroppsøving, trening, kulturarrangement, møte, marknader og private samlingar',
    changes: [
      'første etasje ferdig mot slutten av 1991 og tatt i bruk i januar 1992',
      'andre etasje med kjøkken og samfunnshusrom innvigd i 1994',
      'andre etasje nyleg oppussa gjennom ny dugnadsinnsats'
    ]
  },
  stories: [
    {
      id: 'story_skanevik_hall_01',
      entry_id: story.id,
      title: story.title,
      one_liner: 'Frå Husmorlaget og Torgdagane til eit lånefritt fleirbrukshus.',
      confidence: 'high',
      sources: ['Skånevik Kultur- og Idrettshall', 'Etne kommune', 'Brønnøysundregistrene']
    }
  ],
  interpretation: {
    what_to_notice: [
      'skiljet mellom det store hallgolvet og samfunnshusromma i andre etasje',
      'korleis ganglinja frå skulen forklarer den kommunale bruken',
      'spor etter fleire byggje- og oppussingsfasar i same anlegg'
    ],
    why_it_matters: [
      'Hallen viser korleis kulturarrangement kan finansiere varig lokal infrastruktur',
      'Samvirke, offentleg støtte og dugnad gjorde eit stort anlegg mogleg utan byggjelån',
      'Fleirbruk koplar idrett, kultur, skule og frivilligheit i same fysiske rom'
    ],
    counterpoints: [
      '1992 og 1994 er ulike ferdigstillingspunkt; stadskortet får derfor ikkje eitt konstruert byggjeår',
      'Kortet handlar om hallens kultur- og fleirbruksfunksjon, ikkje berre idrett',
      'Annonserte arrangement i 2026 blir ikkje framstilte som dokumentert gjennomførte'
    ]
  },
  links: {
    entry_ids: [story.id],
    related_places: ['skanevik_idrettsanlegg', 'skanevik_sentrum', 'musikkpaviljongen_doktorhagen', 'house_of_blues_skanevik'],
    related_people: story.related_people
  },
  sources: story.sources,
  ui: {
    mini_panel: {
      show: true,
      highlights: ['fact_skanevik_hall_01', 'fact_skanevik_hall_03', 'fact_skanevik_hall_05', 'story_skanevik_hall_01'],
      max_items: 6
    }
  }
};
upsertByPlaceId(articles, article);
writeJson(articlePath, articles);

const reportPath = 'reports/skanevik-kulturhall-rounds-batch1.md';
fs.writeFileSync(path.join(repo, reportPath), `# Skånevik kultur- og idrettshall – rundinger batch 1\n\n## Omfang\n\nAlle ni kunstrundinger er fylt uten manuell \`rounds\`-override:\n\n- people\n- works\n- badges\n- nature\n- civication\n- brands\n- før_nå\n- fortellinger\n- leksikon\n\n## Kildegrunnlag\n\n- hallens egen detaljerte historie\n- hallens fasilitets- og kalendersider\n- Etne kommune sin organisasjonsoppføring\n- Brønnøysundregistrene\n\n## Redaksjonelle grenser\n\n- Recorden gjelder kultur- og flerbruksfunksjonen, ikke bare idrett.\n- Husmorlaget og dugnadsfolket brukes som et avgrenset kollektivt miljøanker; ingen udokumentert deltakerliste konstrueres.\n- Jan Henning Jespersen, Leif Jonny Johansen og Marie Kristiansen brukes bare i dokumenterte roller.\n- Første etasje ble tatt i bruk i 1992 og hele flerbrukshuset innviet i 1994. \`year: null\` beholdes fordi ferdigstillingen skjedde i faser.\n- Natur-rundingen beskriver plassering, vær, ganglinje, materialitet og ute/inne-overgang uten å dikte inn arter.\n- Kalenderen for 2026 behandles som annonsert program, ikke som dokumentert resultat.\n- Eksisterende Kartverket/Geonorge-adressepunkt for Ligrendvegen 11 beholdes.\n`);

const testPath = 'tests/skanevik-kulturhall-batch1-round-content.test.js';
fs.writeFileSync(path.join(repo, testPath), `const assert = require('assert');\nconst fs = require('fs');\nconst path = require('path');\n\nconst repo = path.resolve(__dirname, '..');\nconst readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));\nconst expectedRounds = ['people', 'works', 'badges', 'nature', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];\nconst runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');\nconst artProfileMatch = runtimeSource.match(/kunst:\\s*\\[([^\\]]+)\\]/);\nassert(artProfileMatch, 'Runtime skal ha dokumentert kunstprofil');\nassert.deepStrictEqual(JSON.parse(\`[\${artProfileMatch[1]}]\`), expectedRounds);\n\nconst place = readJson('${placePath}')[0];\nconst people = readJson('${peoplePath}');\nconst peopleIds = ['skanevik_husmorlag_og_dugnadsfolket_hallen', 'marie_kristiansen_skanevik_hall', 'jan_henning_jespersen_skanevik_hall', 'leif_jonny_johansen_skanevik_hall'];\nconst relations = readJson('data/relations.json').filter((row) => row.place === place.id && peopleIds.includes(row.person));\nconst story = readJson('${storyPath}').find((row) => row.id === '${story.id}');\nconst article = readJson('${articlePath}').find((row) => row.place_id === place.id);\nconst validEmneIds = new Set(readJson('data/fag/kunst/emner_kunst_canonical_v4_5.json').map((row) => row.emne_id || row.id));\nconst validUnderbadgeIds = new Set(readJson('data/badges/kunst.json').sub);\nconst manifest = readJson('data/people/manifest.json');\nconst placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));\n\nassert.strictEqual(place.category, 'kunst');\nfor (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) assert(!Object.prototype.hasOwnProperty.call(place, forbidden), \`Hallen skal ikke ha \${forbidden}\`);\nassert(manifest.files.includes('${manifestEntry}'), 'People-filen skal være registrert');\nassert.strictEqual(people.length, 4);\nassert.strictEqual(relations.length, 4);\nfor (const person of people) { assert(peopleIds.includes(person.id)); assert.strictEqual(person.placeId, place.id); assert(person.places.includes(place.id)); assert(person.source_urls.length > 0); }\nassert(story && story.place_id === place.id);\nassert(article && article.place_id === place.id);\nassert(article.links.entry_ids.includes(story.id));\n\nconst roundContent = { people: relations, works: place.works, badges: place.underbadge_ids, nature: place.nature_profile, civication: place.civication_store, brands: place.brands, før_nå: place.for_na, fortellinger: [story], leksikon: [article] };\nassert.deepStrictEqual(Object.keys(roundContent), expectedRounds);\nfor (const [roundId, value] of Object.entries(roundContent)) { const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object'); assert(filled, \`Hallen mangler \${roundId}\`); }\n\nassert(place.externalLinks.length >= 5 && place.externalLinks.every((link) => /^https:\\/\\//.test(link.url)));\nassert(place.works.length >= 6);\nassert(place.civication_store.length >= 3 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true));\nassert(place.emne_ids.every((id) => validEmneIds.has(id)));\nassert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)));\nassert(place.nature_profile.themes.length >= 5 && place.nature_profile.nearby_place_ids.length >= 3);\nassert(place.brands.length >= 6);\nassert(place.for_na.before && place.for_na.now && place.for_na.change);\nassert(story.sources.length >= 5);\nassert(article.wikiText.length >= 5 && article.sources.length >= 5);\nassert.deepStrictEqual([place.lat, place.lon, place.year], [59.731053106182465, 5.922931264241455, null]);\nassert.strictEqual(placeIndex.get(place.id)?.year, null);\n\nconst combined = JSON.stringify({ place, people, relations, story, article });\nassert(/Husmorlaget/.test(combined) && /Torgdagane/.test(combined));\nassert(/22 000|22.000/.test(combined));\nassert(/3\\. januar 1992/.test(combined));\nassert(/1994/.test(combined) && /innvi/.test(combined));\nassert(/utan å ta opp byggjelån|utan byggjelån|lånefritt/.test(combined));\nassert(/annonsert program|annonserte aktivitetar|programspor/.test(combined));\nassert(!/2026-arrangementa var ein suksess|rekordpublikum i 2026|2026-utgåva var utseld/i.test(combined));\nassert(!/artar ved staden|flora ved staden|fauna ved staden/i.test(combined));\nassert(!/berre ein idrettshall|samme sted som House of Blues/i.test(combined));\n\nconsole.log('Skånevik kulturhall batch 1 round content OK');\n`);

console.log('Generated Skånevik kultur- og idrettshall round batch 1');
