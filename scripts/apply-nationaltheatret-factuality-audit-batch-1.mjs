import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const verifiedAt = '2026-07-27';
const source = (label, url) => ({ type: 'source', label, url, verifiedAt });
const writeJson = (relative, value) => {
  const full = path.join(root, relative);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
};

const anneMarit = {
  id: 'anne_marit_jacobsen',
  name: 'Anne Marit Jacobsen',
  initials: 'AMJ',
  desc: 'Skuespiller utdannet ved Statens teaterhøgskole, med sin første rolle ved Nationaltheatret i 1969 og et omfattende virke på scene, film, fjernsyn og radio.',
  tags: ['litteratur', 'scenekunst', 'teater', 'skuespiller', 'monolog', 'torshovteatret', 'ibsen', 'jon_fosse', 'film', 'fjernsyn', 'radio', 'nationaltheatret'],
  placeId: 'nationaltheatret',
  category: 'litteratur',
  kindLabel: 'Skuespiller for scene, film, fjernsyn og radio',
  birth_date: '1946-11-07',
  birth_place: 'Oslo',
  active_place: 'Oslo; Nationaltheatret, Torshovteatret, Oslo Nye Teater, Det Norske Teatret og NRK',
  year: 1969,
  education: ['Statens teaterhøgskole'],
  materials: ['skuespillerarbeid', 'monolog', 'dramatisering', 'komedie', 'klassisk dramatikk', 'film', 'fjernsyn', 'radioteater'],
  themes: ['klassisk dramatikk', 'komedie', 'monologarbeid', 'oppsøkende teater', 'litteratur på scenen', 'scene og skjerm'],
  works: [
    { id: 'narren_og_hans_hertug_1969_jacobsen', title: 'Narren og hans hertug', year: 1969, material: 'skuespillerarbeid', place: 'Nationaltheatret', summary: 'Profesjonell scenedebut ved Nationaltheatret som Rikke i Stein Mehrens skuespill.' },
    { id: 'vildanden_1970_jacobsen', title: 'Vildanden', year: 1970, material: 'fjernsynsskuespill', place: 'NRK Fjernsynsteatret', summary: 'Spilte Hedvig i Fjernsynsteatrets oppsetning av Henrik Ibsens drama.' },
    { id: 'bloody_mary_1979_jacobsen', title: 'Bloody Mary', year: 1979, material: 'skuespillerarbeid', place: 'Nationaltheatret', summary: 'Spilte rollen Dolores ved Nationaltheatret.' },
    { id: 'johan_uten_land_1983_jacobsen', title: 'Johan uten land', year: 1983, material: 'skuespillerarbeid', place: 'Torshovteatret', summary: 'Spilte Kong Johan i Nationaltheatrets norgespremiere, basert på Shakespeares King John.' },
    { id: 'lilli_valentin_1989_jacobsen', title: 'Lilli Valentin', year: 1989, material: 'monolog og bearbeidelse', place: 'Nationaltheatret', summary: 'Bearbeidet teksten og spilte tittelrollen i en forestilling som Nationaltheatret oppgir ble spilt over 300 ganger.' },
    { id: 'hvem_er_ernest_2002_jacobsen', title: 'Hvem er Ernest?', year: 2002, material: 'komedie og skuespillerarbeid', place: 'Nationaltheatret', summary: 'Spilte Lady Bracknell; rollen ga nominasjon til Heddaprisen og Komiprisen i 2003.' },
    { id: 'jo_fortere_2014_jacobsen', title: 'Jo fortere jeg går, jo mindre er jeg', year: 2014, material: 'dramatisering og skuespillerarbeid', place: 'Nationaltheatret', summary: 'Dramatiserte romanen sammen med Kjersti Annesdatter Skomsvold og spilte Mathea.' },
    { id: 'morgon_og_kveld_2015_jacobsen', title: 'Morgon og kveld', year: 2015, material: 'skuespillerarbeid', place: 'Nationaltheatret', summary: 'Var initiativtaker og medvirkende i sceneproduksjonen av Jon Fosses roman.' },
    { id: 'jacobsen_vaersagod_2018_jacobsen', title: 'Jacobsen, værsågod!', year: 2018, material: 'monolog, tekst og skuespillerarbeid', place: 'Oslo Nye Teater', summary: 'Medvirket som skuespiller og bidro med tekst i produksjonen til Oslo Nye Teater og Feelgood Scene.' },
    { id: 'sterk_vind_2021_jacobsen', title: 'Sterk vind', year: 2021, material: 'skuespillerarbeid', place: 'Det Norske Teatret', summary: 'Spilte Kvinna i urpremieren på Scene 2 ved Det Norske Teatret.' },
    { id: 'jordbaerstedet_2023_jacobsen', title: 'Jordbærstedet', year: 2023, material: 'skuespillerarbeid', place: 'Nationaltheatret', summary: 'Spilte Frøken Agda i Nationaltheatrets sceneversjon.' }
  ],
  popupDesc: 'Anne Marit Jacobsen ble født i Oslo 7. november 1946 og er utdannet ved Statens teaterhøgskole. Hun hadde sin første rolle ved Nationaltheatret i 1969 som Rikke i Narren og hans hertug, og var ansatt ved teatret fra 1970 til hun gikk av med pensjon i 2016. I Fjernsynsteatrets Vildanden i 1970 spilte hun Hedvig.\n\nVed Nationaltheatret har Jacobsen arbeidet med komedie, klassisk dramatikk, monolog og nyere litteratur. Hun var med på å starte Torshovgruppa og spilte Kong Johan i Johan uten land. I Lilli Valentin bearbeidet hun teksten og spilte tittelrollen; Nationaltheatret oppgir at forestillingen ble spilt over 300 ganger. I Jo fortere jeg går, jo mindre er jeg dramatiserte hun romanen sammen med Kjersti Annesdatter Skomsvold og spilte Mathea. Hun var også initiativtaker og medvirkende i Morgon og kveld.\n\nNationaltheatret er hovedankeret fordi den dokumenterte tilknytningen begynner med scenedebuten i 1969 og omfatter roller og egne sceneprosjekter over flere tiår. Produksjonene ved Torshovteatret, Oslo Nye Teater og Det Norske Teatret, sammen med arbeidet i NRK, dokumenterer at virket også har omfattet andre scener og fjernsyn.',
  places: ['nationaltheatret', 'oslo_nye_teater_hovedscenen', 'det_norske_teatret', 'nrk_huset_marienlyst'],
  image: '',
  cardImage: '',
  externalLinks: [
    source('Store norske leksikon – Anne Marit Jacobsen', 'https://snl.no/Anne_Marit_Jacobsen'),
    source('Nationaltheatret – Anne Marit Jacobsen', 'https://www.nationaltheatret.no/om-oss/ensemble/anne-marit-jacobsen'),
    source('Sceneweb – Anne Marit Jacobsen', 'https://sceneweb.no/nb/artist/7665/Anne_Marit%20Jacobsen'),
    source('Sceneweb – Johan uten land', 'https://sceneweb.no/nb/production/40940/Johan_uten%20land'),
    source('Sceneweb – Lilli Valentin', 'https://sceneweb.no/nb/production/43028/Lilli_Valentin'),
    source('Sceneweb – Jo fortere jeg går, jo mindre er jeg', 'https://sceneweb.no/nb/production/37805/Jo_fortere%20jeg%20g%C3%A5r%2C%20jo%20mindre%20er%20jeg'),
    source('Sceneweb – Jacobsen, værsågod!', 'https://sceneweb.no/nb/production/85684/Jacobsen%2C_v%C3%A6rs%C3%A5god'),
    source('Sceneweb – Sterk vind', 'https://sceneweb.no/nb/production/114184/Sterk_vind')
  ],
  source_urls: [
    'https://snl.no/Anne_Marit_Jacobsen',
    'https://www.nationaltheatret.no/om-oss/ensemble/anne-marit-jacobsen',
    'https://sceneweb.no/nb/artist/7665/Anne_Marit%20Jacobsen',
    'https://sceneweb.no/nb/production/40940/Johan_uten%20land',
    'https://sceneweb.no/nb/production/43028/Lilli_Valentin',
    'https://sceneweb.no/nb/production/37805/Jo_fortere%20jeg%20g%C3%A5r%2C%20jo%20mindre%20er%20jeg',
    'https://sceneweb.no/nb/production/85684/Jacobsen%2C_v%C3%A6rs%C3%A5god',
    'https://sceneweb.no/nb/production/114184/Sterk_vind'
  ],
  verifiedAt
};

const anneke = {
  id: 'anneke_von_der_lippe',
  name: 'Anneke von der Lippe',
  initials: 'AVL',
  desc: 'Skuespiller utdannet ved Statens teaterhøgskole, med dokumenterte roller ved Det Norske Teatret og Nationaltheatret og prisbelønt arbeid i film og fjernsyn.',
  tags: ['litteratur', 'scenekunst', 'teater', 'skuespiller', 'ibsen', 'shakespeare', 'klassikerrepertoar', 'samtidsdramatikk', 'film', 'fjernsyn', 'international_emmy', 'nationaltheatret', 'det_norske_teatret'],
  placeId: 'nationaltheatret',
  category: 'litteratur',
  kindLabel: 'Skuespiller for scene, film og fjernsyn',
  birth_date: '1964-07-22',
  active_place: 'Oslo; Det Norske Teatret, Nationaltheatret og NRK',
  year: 1999,
  education: ['Statens teaterhøgskole'],
  materials: ['skuespillerarbeid', 'klassisk dramatikk', 'samtidsdramatikk', 'film', 'fjernsyn', 'ensemblearbeid'],
  themes: ['Ibsen-roller', 'Shakespeare', 'nynorsk scenekunst', 'samtidsdramatikk', 'scene og skjerm', 'fjernsynsdrama'],
  works: [
    { id: 'salka_valka_1990_von_der_lippe', title: 'Salka Valka', year: 1990, material: 'skuespillerarbeid', place: 'Det Norske Teatret', summary: 'Spilte tittelrollen i norgespremieren på Scene 2 ved Det Norske Teatret.' },
    { id: 'medmenneske_1991_von_der_lippe', title: 'Medmenneske', year: 1991, material: 'skuespillerarbeid', place: 'Det Norske Teatret', summary: 'Spilte Ragnhild i Det Norske Teatrets produksjon.' },
    { id: 'tre_systrer_1993_von_der_lippe', title: 'Tre systrer', year: 1993, material: 'skuespillerarbeid', place: 'Det Norske Teatret', summary: 'Spilte Olga i Anton Tsjekhovs drama.' },
    { id: 'molly_sweeney_1996_von_der_lippe', title: 'Molly Sweeney', year: 1996, material: 'skuespillerarbeid', place: 'Det Norske Teatret', summary: 'Spilte Molly i Brian Friels drama på Scene 2.' },
    { id: 'macbeth_1999_von_der_lippe', title: 'Macbeth', year: 1999, material: 'skuespillerarbeid', place: 'Det Norske Teatret', summary: 'Spilte Lady Macbeth ved Det Norske Teatret.' },
    { id: 'et_dukkehjem_1999_von_der_lippe', title: 'Et dukkehjem', year: 1999, material: 'skuespillerarbeid', place: 'Nationaltheatret', summary: 'Spilte Nora i Nationaltheatrets produksjon.' },
    { id: 'hvem_er_ernest_2002_von_der_lippe', title: 'Hvem er Ernest?', year: 2002, material: 'komedie og skuespillerarbeid', place: 'Nationaltheatret', summary: 'Spilte Gwendolen Fairfax i Oscar Wildes komedie.' },
    { id: 'speer_2005_von_der_lippe', title: 'Speer', year: 2005, material: 'skuespillerarbeid', place: 'Nationaltheatret', summary: 'Spilte Eva Braun og Eva Rubenstein i Nationaltheatrets produksjon.' },
    { id: 'et_spansk_stykke_2006_von_der_lippe', title: 'Et spansk stykke', year: 2006, material: 'skuespillerarbeid', place: 'Nationaltheatret', summary: 'Spilte Nuria i Yasmina Rezas drama.' },
    { id: 'uskyld_2011_von_der_lippe', title: 'Uskyld', year: 2011, material: 'skuespillerarbeid', place: 'Nationaltheatret', summary: 'Spilte Ella i Dea Lohers drama.' },
    { id: 'oyevitne_2014_von_der_lippe', title: 'Øyevitne', year: 2014, material: 'fjernsynsskuespill', place: 'NRK', summary: 'Spilte politietterforskeren Helen Sikkeland og mottok International Emmy for rollen i 2015.' }
  ],
  popupDesc: 'Anneke von der Lippe ble født 22. juli 1964 og er utdannet ved Statens teaterhøgskole. Ved Det Norske Teatret spilte hun blant annet Salka Valka, Ragnhild i Medmenneske, Olga i Tre systrer, Molly Sweeney og Lady Macbeth.\n\nVed Nationaltheatret har hun spilt Nora i Et dukkehjem, Gwendolen Fairfax i Hvem er Ernest?, Eva Braun og Eva Rubenstein i Speer, Nuria i Et spansk stykke og Ella i Uskyld. Nationaltheatrets forestillingsdatabase registrerer arbeidet hennes ved teatret fra 1999.\n\nPå film og fjernsyn har von der Lippe hatt roller i norske og nordiske produksjoner. Hun ble nominert til International Emmy i 2005 for Ved kongens bord og mottok prisen i 2015 for rollen som politietterforskeren Helen Sikkeland i NRK-serien Øyevitne. Nationaltheatret er hovedanker, mens Det Norske Teatret og NRK dokumenterer andre sentrale deler av virket.',
  places: ['nationaltheatret', 'det_norske_teatret', 'nrk_huset_marienlyst'],
  image: '',
  cardImage: '',
  externalLinks: [
    source('Store norske leksikon – Anneke von der Lippe', 'https://snl.no/Anneke_von_der_Lippe'),
    source('Nationaltheatret – Anneke von der Lippe', 'https://www.nationaltheatret.no/om-oss/ensemble/anneke-von-der-lippe'),
    source('Nationaltheatrets forestillingsdatabase – Anneke von der Lippe', 'https://forest.nationaltheatret.no/person/anneke-von-der-lippe'),
    source('Sceneweb – Anneke von der Lippe', 'https://sceneweb.no/nb/artist/4144/Anneke_von%20der%20Lippe'),
    source('Sceneweb – Salka Valka', 'https://sceneweb.no/nb/production/42669/Salka_Valka'),
    source('Sceneweb – Medmenneske', 'https://sceneweb.no/nb/production/42814/Medmenneske'),
    source('Sceneweb – Molly Sweeney', 'https://sceneweb.no/nb/production/80304/Molly_Sweeney'),
    source('Sceneweb – Macbeth', 'https://sceneweb.no/nb/production/46568/Macbeth'),
    source('Sceneweb – Et dukkehjem', 'https://sceneweb.no/nb/production/17574/Et_dukkehjem')
  ],
  source_urls: [
    'https://snl.no/Anneke_von_der_Lippe',
    'https://www.nationaltheatret.no/om-oss/ensemble/anneke-von-der-lippe',
    'https://forest.nationaltheatret.no/person/anneke-von-der-lippe',
    'https://sceneweb.no/nb/artist/4144/Anneke_von%20der%20Lippe',
    'https://sceneweb.no/nb/production/42669/Salka_Valka',
    'https://sceneweb.no/nb/production/42814/Medmenneske',
    'https://sceneweb.no/nb/production/80304/Molly_Sweeney',
    'https://sceneweb.no/nb/production/46568/Macbeth',
    'https://sceneweb.no/nb/production/17574/Et_dukkehjem'
  ],
  verifiedAt
};

const anton = {
  id: 'anton_ronneberg',
  name: 'Anton Rønneberg',
  initials: 'AR',
  desc: 'Dramaturg, teaterkritiker, teatersjef og teaterhistoriker som var knyttet til Nationaltheatret i nærmere førti år og skrev to bind om institusjonens historie.',
  tags: ['litteratur', 'scenekunst', 'teater', 'dramaturg', 'teaterkritiker', 'teatersjef', 'teaterhistorie', 'oversettelse', 'institusjonsminne', 'nationaltheatret'],
  placeId: 'nationaltheatret',
  category: 'litteratur',
  kindLabel: 'Dramaturg, teaterkritiker, teatersjef og teaterhistoriker',
  birth_date: '1902-08-09',
  death_date: '1989-05-07',
  birth_place: 'Ålesund',
  active_place: 'Oslo; Nationaltheatret og norsk dagspresse',
  year: 1930,
  education: ['Examen artium i Ålesund, 1920', 'Cand.mag. ved Universitetet i Oslo, 1925', 'Studiereiser til flere europeiske land fram til 1939'],
  materials: ['dramaturgi', 'teaterkritikk', 'teaterhistorie', 'oversettelse', 'repertoararbeid', 'institusjonsledelse'],
  themes: ['Nationaltheatrets historie', 'repertoar', 'teaterkritikk', 'skuespillerkunst', 'radioteater', 'fjernsynsteater'],
  works: [
    { id: 'norges_kommunistblad_1924_ronneberg', title: 'Teaterkritikk i Norges Kommunistblad', year: 1924, material: 'teaterkritikk', place: 'Norges Kommunistblad', summary: 'Begynte som teateranmelder i Norges Kommunistblad.' },
    { id: 'middagsavisen_1925_ronneberg', title: 'Teaterkritikk i Middagsavisen', year: 1925, material: 'teaterkritikk', place: 'Middagsavisen', summary: 'Skrev teaterkritikk i Middagsavisen fra 1925 til 1927.' },
    { id: 'morgenbladet_1928_ronneberg', title: 'Teaterkritikk i Morgenbladet', year: 1928, material: 'teaterkritikk', place: 'Morgenbladet', summary: 'Skrev teaterkritikk i Morgenbladet fra 1928 til 1930.' },
    { id: 'dramaturg_nationaltheatret_1930_ronneberg', title: 'Dramatisk-litterær konsulent ved Nationaltheatret', year: 1930, material: 'dramaturgi, oversettelse og repertoararbeid', place: 'Nationaltheatret', summary: 'Var konsulent i periodene 1930–1933, 1934–1937 og 1945–1972.' },
    { id: 'teatersjef_nationaltheatret_1933_ronneberg', title: 'Teatersjef ved Nationaltheatret', year: 1933, material: 'institusjonsledelse', place: 'Nationaltheatret', summary: 'Var teatersjef i perioden 1933–1934.' },
    { id: 'aftenposten_1937_ronneberg', title: 'Kritikk i Aftenposten', year: 1937, material: 'teater-, radio- og fjernsynskritikk', place: 'Aftenposten', summary: 'Var teateranmelder 1937–1942 og skrev kritikk av Radioteatret og Fjernsynsteatret 1951–1972.' },
    { id: 'teater_hjemme_og_ute_1945_ronneberg', title: 'Teater hjemme og ute', year: 1945, material: 'artikler og teaterkritikk', place: 'Bokutgivelse', summary: 'Utga artikkelsamlingen Teater hjemme og ute.' },
    { id: 'skuespillerinnen_tore_segelcke_1946_ronneberg', title: 'Skuespillerinnen Tore Segelcke', year: 1946, material: 'kunstnerbiografi', place: 'Bokutgivelse', summary: 'Utga en bok om skuespilleren Tore Segelcke.' },
    { id: 'nationaltheatret_gjennom_femti_aar_1949_ronneberg', title: 'Nationaltheatret gjennom femti år', year: 1949, material: 'institusjonshistorie', place: 'Nationaltheatret', summary: 'Utga første bind av sin historie om Nationaltheatret, som dekker perioden fra 1899.' },
    { id: 'ti_aars_fjernsynsteater_1971_ronneberg', title: 'Ti års fjernsynsteater', year: 1971, material: 'kritikksamling og mediehistorie', place: 'Bokutgivelse', summary: 'Utga en samling kritikker av Fjernsynsteatrets oppsetninger gjennom ti år.' },
    { id: 'nationaltheatret_1949_1974_ronneberg', title: 'Nationaltheatret 1949–1974', year: 1974, material: 'institusjonshistorie', place: 'Nationaltheatret', summary: 'Utga andre bind av sin historie om Nationaltheatret, som dekker perioden 1949–1974.' }
  ],
  popupDesc: 'Anton Johan Rønneberg ble født i Ålesund 9. august 1902 og døde i Oslo 7. mai 1989. Han tok examen artium i Ålesund i 1920 og ble cand.mag. ved Universitetet i Oslo i 1925. Fram til 1939 gjennomførte han studiereiser til flere europeiske land. Han skrev teaterkritikk i Norges Kommunistblad, Middagsavisen og Morgenbladet før han ble knyttet til Nationaltheatret.\n\nVed Nationaltheatret var Rønneberg dramatisk-litterær konsulent i periodene 1930–1933, 1934–1937 og 1945–1972. Han oversatte skuespill og deltok i repertoararbeidet. Han var teatersjef i 1933–1934. I Aftenposten var han teateranmelder fra 1937 til 1942, og fra 1951 til 1972 skrev han kritikk av Radioteatret og Fjernsynsteatret.\n\nRønneberg utga Teater hjemme og ute, Skuespillerinnen Tore Segelcke og Ti års fjernsynsteater. De to bindene Nationaltheatret gjennom femti år og Nationaltheatret 1949–1974 dokumenterer teatrets første 75 år. Nationaltheatret er hovedankeret fordi hans arbeid der omfattet dramaturgi, ledelse, oversettelser, repertoar og institusjonshistorie.',
  places: ['nationaltheatret'],
  image: '',
  cardImage: '',
  externalLinks: [
    source('Store norske leksikon – Anton Rønneberg', 'https://snl.no/Anton_R%C3%B8nneberg'),
    source('Norsk biografisk leksikon – Anton Rønneberg', 'https://nbl.snl.no/Anton_R%C3%B8nneberg'),
    source('Store norske leksikon – Nationaltheatret', 'https://snl.no/Nationaltheatret'),
    source('Sceneweb – Anton Rønneberg', 'https://sceneweb.no/nb/artist/20279/Anton_R%C3%B8nneberg')
  ],
  source_urls: ['https://snl.no/Anton_R%C3%B8nneberg', 'https://nbl.snl.no/Anton_R%C3%B8nneberg', 'https://snl.no/Nationaltheatret', 'https://sceneweb.no/nb/artist/20279/Anton_R%C3%B8nneberg'],
  verifiedAt
};

const arild = {
  id: 'arild_brinchmann',
  name: 'Arild Brinchmann',
  initials: 'AB',
  desc: 'Film-, fjernsyns- og teaterregissør som bygde opp NRKs Fjernsynsteater og var teatersjef ved Nationaltheatret fra 1967 til 1978.',
  tags: ['litteratur', 'scenekunst', 'teater', 'regissor', 'teatersjef', 'fjernsynsteater', 'film', 'oppsokende_teater', 'modernisering', 'ibsen', 'nationaltheatret', 'nrk'],
  placeId: 'nationaltheatret',
  category: 'litteratur',
  kindLabel: 'Film-, fjernsyns- og teaterregissør og teatersjef',
  birth_date: '1922-01-31',
  death_date: '1986-10-09',
  birth_place: 'Kristiania',
  active_place: 'Oslo; NRK Fjernsynsteatret, Nationaltheatret og Det Norske Teatret',
  year: 1967,
  education: ['Jusstudier ved Universitetet i Oslo etter andre verdenskrig', 'Regielev ved Det Norske Teatret', 'Regielev hos Svensk Filmindustri og Terra Film fra 1946', 'Filmstudier ved UFA-atelierene i Berlin og Realfilm i Hamburg'],
  materials: ['filmregi', 'fjernsynsregi', 'sceneregi', 'institusjonsledelse', 'repertoararbeid', 'oppsøkende teater'],
  themes: ['samtidsdramatikk', 'Ibsen', 'fjernsynsteater', 'oppsøkende teater', 'nye publikumsgrupper', 'institusjonsutvikling'],
  works: [
    { id: 'vi_banker_paa_1951_brinchmann', title: 'Vi banker på', year: 1951, material: 'dokumentarfilm', place: 'Det Norske Flyktningeråd', summary: 'Laget dokumentarfilmen fra europeiske flyktningleirer; filmen og Husmorvikaren ble hedret med Statens filmpris.' },
    { id: 'husmorvikaren_1951_brinchmann', title: 'Husmorvikaren', year: 1951, material: 'dokumentarfilm', place: 'Norsk filmproduksjon', summary: 'Laget dokumentarfilmen, som sammen med Vi banker på ble hedret med Statens filmpris.' },
    { id: 'ut_av_morket_1958_brinchmann', title: 'Ut av mørket', year: 1958, material: 'filmregi', place: 'Norsk Film A/S', summary: 'Regisserte sin første spillefilm, etter Alex Brinchmanns manus med tema fra psykiatrien.' },
    { id: 'den_fjerde_nattevakt_1960_brinchmann', title: 'Den fjerde nattevakt', year: 1960, material: 'fjernsynsregi', place: 'NRK Fjernsynsteatret', summary: 'Regisserte Fjernsynsteatrets produksjon, sendt 7. april 1960.' },
    { id: 'hvem_er_redd_1964_brinchmann', title: 'Hvem er redd for Virginia Woolf?', year: 1964, material: 'oversettelse og sceneregi', place: 'Nationaltheatret', summary: 'Debuterte som oversetter og regissør ved Nationaltheatret med Edward Albees drama.' },
    { id: 'mordet_paa_marat_1966_brinchmann', title: 'Mordet på Marat', year: 1966, material: 'sceneregi', place: 'Nationaltheatret', summary: 'Regisserte Peter Weiss-produksjonen ved Nationaltheatret.' },
    { id: 'balansegang_1967_brinchmann', title: 'Balansegang', year: 1967, material: 'sceneregi', place: 'Nationaltheatret', summary: 'Innledet sjefstiden ved Nationaltheatret med Edward Albees drama.' },
    { id: 'byggmester_solness_1969_brinchmann', title: 'Byggmester Solness', year: 1969, material: 'sceneregi', place: 'Nationaltheatret', summary: 'Regisserte Henrik Ibsens drama ved Nationaltheatret.' },
    { id: 'et_spill_om_pugg_1969_brinchmann', title: 'Et spill om pugg', year: 1969, material: 'institusjonsledelse og oppsøkende teater', place: 'Nationaltheatret og Fagerborg skole', summary: 'Som teatersjef støttet Brinchmann den oppsøkende satsingen; Janken Varden var produksjonens regissør.' },
    { id: 'hedda_gabler_1971_brinchmann', title: 'Hedda Gabler', year: 1971, material: 'sceneregi', place: 'Nationaltheatret', summary: 'Regisserte Nationaltheatrets oppsetning; den ble senere omarbeidet til Fjernsynsteatret i 1975.' },
    { id: 'jenteloven_1974_brinchmann', title: 'Jenteloven', year: 1974, material: 'institusjonsledelse og oppsøkende teater', place: 'Nationaltheatret', summary: 'Produksjonen inngikk i den oppsøkende satsingen Brinchmann forsvarte som teatersjef.' },
    { id: 'fruen_fra_havet_1977_brinchmann', title: 'Fruen fra havet', year: 1977, material: 'sceneregi', place: 'Nationaltheatret', summary: 'Regisserte Nationaltheatrets produksjon, som hadde premiere 26. desember 1977.' },
    { id: 'natten_er_dagens_mor_1984_brinchmann', title: 'Natten er dagens mor', year: 1984, material: 'bearbeidelse og sceneregi', place: 'Nationaltheatret', summary: 'Bearbeidet og regisserte Lars Noréns drama på Nationaltheatrets Amfiscene.' }
  ],
  popupDesc: 'Arild Ludvig Brinchmann ble født i Kristiania 31. januar 1922 og døde i Oslo 9. oktober 1986. Etter krigen studerte han jus, før han ble regielev ved Det Norske Teatret. Fra 1946 var han regielev hos Svensk Filmindustri og Terra Film, og han studerte senere film ved UFA-atelierene i Berlin og Realfilm i Hamburg. I 1951 laget han dokumentarfilmene Vi banker på og Husmorvikaren, og i 1958 regisserte han spillefilmen Ut av mørket.\n\nBrinchmann ble ansatt i NRK i 1959 for å bygge opp teateravdelingen og var sjef for Fjernsynsteatret fram til 1967. Han regisserte blant annet Den fjerde nattevakt. Ved Nationaltheatret debuterte han som oversetter og regissør med Hvem er redd for Virginia Woolf? i 1964, fulgt av Mordet på Marat i 1966. Han var teatersjef ved Nationaltheatret fra 1967 til 1978 og regisserte blant annet Byggmester Solness, Hedda Gabler og Fruen fra havet.\n\nSom teatersjef støttet Brinchmann oppsøkende teater og nye biscener. Et spill om pugg ble regissert av Janken Varden, mens Brinchmann som teatersjef ivret for satsingen og forsvarte den da den møtte kritikk. Jenteloven inngikk senere i samme oppsøkende linje. Etter sjefstiden regisserte han ved flere teatre, blant annet Natten er dagens mor ved Nationaltheatret i 1984 og produksjoner ved Det Norske Teatret.',
  places: ['nationaltheatret', 'nrk_huset_marienlyst', 'det_norske_teatret'],
  image: '',
  cardImage: '',
  externalLinks: [
    source('Store norske leksikon – Arild Brinchmann', 'https://snl.no/Arild_Brinchmann'),
    source('Norsk biografisk leksikon – Arild Brinchmann', 'https://nbl.snl.no/Arild_Brinchmann'),
    source('Store norske leksikon – Nationaltheatret', 'https://snl.no/Nationaltheatret'),
    source('Sceneweb – Arild Brinchmann', 'https://sceneweb.no/nb/artist/29899/Arild_Brinchmann'),
    source('Sceneweb – Den fjerde nattevakt', 'https://sceneweb.no/nb/production/65259/Den_fjerde%20nattevakt'),
    source('Sceneweb – Et spill om pugg', 'https://sceneweb.no/nb/production/90034/Et_spill%20om%20pugg'),
    source('Sceneweb – Fruen fra havet', 'https://sceneweb.no/nb/production/17282/Fruen_fra%20havet'),
    source('Sceneweb – Natten er dagens mor', 'https://sceneweb.no/nb/production/43374/Natten_er%20dagens%20mor')
  ],
  source_urls: [
    'https://snl.no/Arild_Brinchmann',
    'https://nbl.snl.no/Arild_Brinchmann',
    'https://snl.no/Nationaltheatret',
    'https://sceneweb.no/nb/artist/29899/Arild_Brinchmann',
    'https://sceneweb.no/nb/production/65259/Den_fjerde%20nattevakt',
    'https://sceneweb.no/nb/production/90034/Et_spill%20om%20pugg',
    'https://sceneweb.no/nb/production/17282/Fruen_fra%20havet',
    'https://sceneweb.no/nb/production/43374/Natten_er%20dagens%20mor'
  ],
  verifiedAt
};

writeJson('data/people/litteratur/oslo/nationaltheatret/anne_marit_jacobsen.json', [anneMarit]);
writeJson('data/people/litteratur/oslo/nationaltheatret/anneke_von_der_lippe.json', [anneke]);
writeJson('data/people/litteratur/oslo/nationaltheatret/anton_ronneberg.json', [anton]);
writeJson('data/people/litteratur/oslo/nationaltheatret/arild_brinchmann.json', [arild]);

const report = `# Faktisitetsaudit — Nationaltheatret people batch 1\n\nStatus: **påstand-for-påstand-kontrollert 2026-07-27**\n\nProfiler:\n\n- Anne Marit Jacobsen\n- Anneke von der Lippe\n- Anton Rønneberg\n- Arild Brinchmann\n\n## Metode\n\nKildene ble åpnet og lest. Navn, livsdata, utdanning, roller, produksjoner, perioder og stedskoblinger ble kontrollert mot Store norske leksikon, Norsk biografisk leksikon, Nationaltheatrets egne ensemble- og forestillingssider og Scenewebs produksjonsdata. Tidligere History GO-tekst og readiness-score ble ikke brukt som faktakilder.\n\n## Korrigeringer og avgrensninger\n\n### Anne Marit Jacobsen\n\n- To arbeidserfaringspunkter ble fjernet fra \`education\`; bare Statens teaterhøgskole beholdes.\n- \`Morgon og kveld\` omtaler henne nå som initiativtaker og medvirkende. Tidligere formulering kunne leses som at hun dramatiserte verket; kildene oppgir Hildegun Riise som dramatisør.\n- Oslo Nye Teater og Det Norske Teatret beholdes fordi Sceneweb dokumenterer \`Jacobsen, værsågod!\` og \`Sterk vind\`.\n- Vurderende formuleringer om kunstnerisk virkning er erstattet av dokumenterte roller og produksjonsopplysninger.\n\n### Anneke von der Lippe\n\n- To arbeidserfaringspunkter ble fjernet fra \`education\`; bare Statens teaterhøgskole beholdes.\n- Ubelagte karakteristikker som «dempet og eksplosiv» og psykologiske tolkningspåstander er fjernet.\n- \`TanGhost\` er tatt ut av verklisten i denne batchen fordi kildene bruker ulike produksjonsår og organisatoriske beskrivelser; andre direkte dokumenterte roller dekker samme periode.\n- Emmy-opplysningen beholdes med støtte i SNL og Nationaltheatrets egen profil.\n\n### Anton Rønneberg\n\n- Aftenposten-periodene er presisert: teateranmeldelser 1937–1942 og kritikk av Radioteatret/Fjernsynsteatret 1951–1972.\n- Dramaturgperiodene er oppgitt som 1930–1933, 1934–1937 og 1945–1972.\n- «Omstridt sjefstid» og udokumenterte beskrivelser av daglige arbeidsprosesser er fjernet.\n- Boktitler og år følger bibliografien i Norsk biografisk leksikon.\n\n### Arild Brinchmann\n\n- \`Et spill om pugg\` er ikke lenger presentert som Brinchmanns regi. Sceneweb oppgir Janken Varden som regissør; Brinchmanns dokumenterte rolle var teatersjefen som støttet og forsvarte den oppsøkende satsingen.\n- \`Jenteloven\` er tilsvarende registrert som institusjonsledelse/oppsøkende teater, ikke som dokumentert regi.\n- \`Fruen fra havet\` beholdes med år 1977 fordi Sceneweb oppgir premiere 26. desember 1977 og det oppdaterte NBL-verksregisteret oppgir 1977. En SNL-oversikt oppgir 1978; konflikten er dokumentert og den konkrete premieredatoen er lagt til grunn.\n- Subjektive vurderinger av enkeltoppsetninger er fjernet eller erstattet av nøkterne produksjonsopplysninger.\n\n## Kildemapping\n\n| Profil | Påstandsgruppe | Kilder |\n|---|---|---|\n| Anne Marit Jacobsen | livsdata, utdanning, Nationaltheatret-perioder, utvalgte roller | SNL; Nationaltheatret |\n| Anne Marit Jacobsen | Johan uten land, Lilli Valentin, Jo fortere…, Oslo Nye og Det Norske Teatret | Sceneweb-produksjonssider |\n| Anneke von der Lippe | livsdata, utdanning, roller, Emmy | SNL; Nationaltheatret; FOREST |\n| Anneke von der Lippe | DNT- og NT-produksjoner | Sceneweb-produksjonssider |\n| Anton Rønneberg | livsdata, utdanning, avisperioder, dramaturgperioder, bøker | SNL; NBL |\n| Anton Rønneberg | teatersjefperiode | SNL Nationaltheatret |\n| Arild Brinchmann | livsdata, opplæring, film, NRK, sjefstid og verker | SNL; NBL |\n| Arild Brinchmann | produksjonsdatoer og konkrete funksjoner | Sceneweb-produksjonssider |\n\n## Avviste produksjonsinsentiver\n\n- Ingen felt er fylt for å beholde tre utdanningspunkter.\n- Ingen verk er beholdt bare for å nå et bestemt antall.\n- Ingen readiness-status brukes som sannhetsbevis.\n- Ingen bilder er lagt til.\n\n## Resultat\n\nDe fire profilene er kontrollert etter \`docs/FACTUALITY_CONTRACT.md\`. Dette betyr at denne batchens påstander er gjennomgått mot de oppførte kildene; det er ikke en påstand om at hele History GO-databasen nå er globalt faktaverifisert.\n`;
fs.writeFileSync(path.join(root, 'reports/people-factuality-audit-nationaltheatret-batch-1.md'), report);

const auditTest = `const assert = require('node:assert/strict');\nconst fs = require('node:fs');\nconst path = require('node:path');\nconst test = require('node:test');\n\nconst ROOT = path.resolve(__dirname, '..');\nconst read = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'))[0];\nconst files = {\n  amj: 'data/people/litteratur/oslo/nationaltheatret/anne_marit_jacobsen.json',\n  avl: 'data/people/litteratur/oslo/nationaltheatret/anneke_von_der_lippe.json',\n  ar: 'data/people/litteratur/oslo/nationaltheatret/anton_ronneberg.json',\n  ab: 'data/people/litteratur/oslo/nationaltheatret/arild_brinchmann.json',\n};\n\ntest('education contains documented education rather than work experience filler', () => {\n  assert.deepEqual(read(files.amj).education, ['Statens teaterhøgskole']);\n  assert.deepEqual(read(files.avl).education, ['Statens teaterhøgskole']);\n  assert.equal(read(files.ar).education.length, 3);\n  assert.equal(read(files.ab).education.length, 4);\n});\n\ntest('corrected factual claims remain locked', () => {\n  const amj = read(files.amj);\n  const avl = read(files.avl);\n  const ar = read(files.ar);\n  const ab = read(files.ab);\n  assert.match(amj.works.find((work) => work.title === 'Morgon og kveld').summary, /initiativtaker og medvirkende/);\n  assert.doesNotMatch(amj.works.find((work) => work.title === 'Morgon og kveld').summary, /dramatiserte/);\n  assert.equal(avl.works.some((work) => work.title === 'TanGhost'), false);\n  assert.doesNotMatch(avl.popupDesc, /dempet og eksplosiv|psykologisk presisjon/i);\n  assert.match(ar.works.find((work) => work.title === 'Kritikk i Aftenposten').summary, /1937–1942.*1951–1972/);\n  assert.doesNotMatch(ar.popupDesc, /omstridt/);\n  const pugg = ab.works.find((work) => work.title === 'Et spill om pugg');\n  assert.match(pugg.summary, /Janken Varden var produksjonens regissør/);\n  assert.doesNotMatch(pugg.material, /sceneregi/);\n  assert.equal(ab.works.find((work) => work.title === 'Fruen fra havet').year, 1977);\n});\n\ntest('audited profiles retain inspectable sources, place grounding and image fallback', () => {\n  for (const relative of Object.values(files)) {\n    const person = read(relative);\n    assert.equal(person.placeId, 'nationaltheatret');\n    assert.ok(person.places.includes('nationaltheatret'));\n    assert.ok(person.externalLinks.length >= 4);\n    assert.ok(person.externalLinks.every((entry) => entry.type === 'source' && entry.url.startsWith('https://') && entry.verifiedAt === '2026-07-27'));\n    assert.equal(person.image, '');\n    assert.equal(person.cardImage, '');\n    assert.equal(person.verifiedAt, '2026-07-27');\n  }\n});\n\ntest('audit report documents corrections, conflicts and rejected completeness incentives', () => {\n  const report = fs.readFileSync(path.join(ROOT, 'reports/people-factuality-audit-nationaltheatret-batch-1.md'), 'utf8');\n  assert.match(report, /påstand-for-påstand-kontrollert/);\n  assert.match(report, /Janken Varden/);\n  assert.match(report, /26\\. desember 1977/);\n  assert.match(report, /Ingen felt er fylt for å beholde tre utdanningspunkter/);\n  assert.match(report, /ikke en påstand om at hele History GO-databasen/);\n});\n`;
fs.writeFileSync(path.join(root, 'tests/nationaltheatret-factuality-audit-people-batch-1.test.js'), auditTest);

const legacyTestPath = path.join(root, 'tests/nationaltheatret-ensemble-leadership-people-v2.test.js');
let legacy = fs.readFileSync(legacyTestPath, 'utf8');
legacy = legacy.replace("    assert.ok(Array.isArray(person.education) && person.education.length >= 3);", "    assert.ok(Array.isArray(person.education) && person.education.length >= 1);");
legacy = legacy.replace("    assert.ok(Array.isArray(person.works) && person.works.length >= 10);", "    assert.ok(Array.isArray(person.works) && person.works.length >= 5);");
fs.writeFileSync(legacyTestPath, legacy);

console.log('Applied Nationaltheatret factuality audit batch 1.');
