const fs = require('fs');
const path = require('path');

const repo = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const writeJson = (relativePath, value) => {
  const fullPath = path.join(repo, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (relativePath, value) => {
  const fullPath = path.join(repo, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, value.endsWith('\n') ? value : `${value}\n`);
};
const upsert = (rows, key, value) => {
  const index = rows.findIndex((row) => row && row[key] === value[key]);
  if (index === -1) rows.push(value);
  else rows[index] = value;
};

const placePath = 'data/places/sport/vestland/etne/engebanen_etne.json';
const peoplePath = 'data/people/sport/vestland/etne/pal_askvig.json';
const relationsPath = 'data/relations.json';
const storiesPath = 'data/stories/stories_etnesjoen_sport_rounds_batch1.json';
const leksikonPath = 'data/leksikon/places/vestland/etne/sport/leksikon_etnesjoen_sport_rounds_batch1.json';

const nff = {
  y2023: 'https://www.fotball.no/finn-klubbturneringer/turneringssoknad/?tournamentApplicationId=146700',
  y2024: 'https://www.fotball.no/finn-klubbturneringer/turneringssoknad/?tournamentApplicationId=210984',
  y2025: 'https://www.fotball.no/finn-klubbturneringer/turneringssoknad/?tournamentApplicationId=337732',
  y2026: 'https://www.fotball.no/finn-klubbturneringer/turneringssoknad/?tournamentApplicationId=486544'
};
const etnecupBanar = 'https://www.etnecup.no/cup-info/banar';
const etnecupContact = 'https://www.etnecup.no/kontakt-oss';

const placeRows = readJson(placePath);
const place = placeRows.find((row) => row.id === 'engebanen_etne');
if (!place) throw new Error('Fant ikke engebanen_etne');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'play', 'nature_profile']) delete place[forbidden];
Object.assign(place, {
  externalLinks: [
    {
      type: 'official',
      label: 'Etnecup – banar',
      url: etnecupBanar,
      lang: 'nn',
      verifiedAt: '2026-07-19',
      note: 'Banekartet fører Enge som seks nummererte grasflater, 31–36, fordelt på tre 7er- og tre 5er-flater.'
    },
    {
      type: 'official',
      label: 'Etnecup – kontakt og turneringsleiing',
      url: etnecupContact,
      lang: 'nn',
      verifiedAt: '2026-07-19',
      note: 'Pål Askvig er oppført med ansvar for påmelding, kampoppsett, kampavvikling og dommararbeid.'
    },
    {
      type: 'federation',
      label: 'NFF – Etnecup 2023',
      url: nff.y2023,
      lang: 'nb',
      verifiedAt: '2026-07-19',
      note: 'NFF fører Engebanen som ein av turneringsarenaene i 2023.'
    },
    {
      type: 'federation',
      label: 'NFF – Etnecup 2024',
      url: nff.y2024,
      lang: 'nb',
      verifiedAt: '2026-07-19',
      note: 'NFF fører Engebane i arenaoversikta for 2024.'
    },
    {
      type: 'federation',
      label: 'NFF – Etnecup 2025',
      url: nff.y2025,
      lang: 'nb',
      verifiedAt: '2026-07-19',
      note: 'NFF fører Engebane i arenaoversikta for 2025.'
    },
    {
      type: 'federation',
      label: 'NFF – Etnecup 2026',
      url: nff.y2026,
      lang: 'nb',
      verifiedAt: '2026-07-19',
      note: 'NFF fører Engebane saman med Etne stadion, Etne kunstgress og Steinsvollen for turneringa 12.–14. juni 2026.'
    }
  ],
  emne_ids: [
    'em_sport_idrettsarena_sted',
    'em_sport_treningsinfrastruktur',
    'em_sport_turnering_format',
    'em_sport_frivillighet_dugnad',
    'em_sport_idrettsopplaring',
    'em_sport_trening_oving'
  ],
  underbadge_ids: [
    'fotball',
    'idrettsarenaer',
    'idrettslag',
    'lokalidrett',
    'turneringer',
    'frivillighet',
    'utendors_trening',
    'koordinasjon'
  ],
  training_profile: {
    title: 'Trygg lågterskeløkt på Engebanen',
    summary: 'Tre enkle øvingar som lærer brukaren å lese bane 31–36, skilje 7er frå 5er og trene kontrollert utan å forstyrre kamp, trening eller banestell.',
    safety: 'Bruk berre ei grasflate som er open, tørr, ledig og uttrykkeleg tillaten å bruke. Følg booking, skilting og beskjedar frå Etnecup, Etne IL og grunneigar. Gå aldri inn under kamp, organisert trening, oppmerking eller vedlikehald. Ikkje bruk våt eller stengd grasbane, hald god avstand til andre grupper, og bruk ikkje harde skot eller lange pasningar nær menneske, mål, veg eller parkerte køyretøy.',
    exercises: [
      {
        id: 'engebanen_les_31_36',
        title: 'Les seksflatesystemet frå utsida',
        instruction: 'Stå utanfor aktive speleflater og bruk banekartet til å peike ut 31–36, dei tre 7er-flatene, dei tre 5er-flatene og trygge gangliner mellom dei.',
        duration_minutes: 7,
        intensity: 'svært lett',
        why: 'Engebanen er eitt fysisk område som blir delt i seks operative kampflater under Etnecup.'
      },
      {
        id: 'engebanen_korte_pasningar',
        title: 'Korte pasningar gjennom brei port',
        instruction: 'Når ei tillaten grasflate er heilt fri, set to eigne markørar som ei brei port og spel ti rolige pasningar gjennom henne frå kort avstand. Stopp ballen før kvar ny pasning.',
        duration_minutes: 8,
        intensity: 'lett',
        why: 'Øvinga trenar mottak og retning utan skot, taklingar eller bruk av heile kampflata.'
      },
      {
        id: 'engebanen_rolig_kantintervall',
        title: 'Gange og roleg jogg langs fri banekant',
        instruction: 'På utsida av ei open og ledig bane går du eitt minutt og joggar roleg eitt minutt langs ei trygg kantlinje. Snu før målsona og gjenta tre gonger utan å krysse andre sin aktivitet.',
        duration_minutes: 8,
        intensity: 'lett',
        why: 'Den samla grasflata gir ei enkel kondisjonsøkt som ikkje krev kamp, målbruk eller kontaktspel.'
      }
    ]
  },
  works: [
    {
      id: 'engebanen_kampflater_31_36',
      title: 'Seks nummererte cupflater: 31–36',
      type: 'turneringsinfrastruktur',
      kind: 'numbered_match_surfaces',
      year: null,
      desc: 'Etnecup sitt offisielle banekart deler Engebanen inn i seks kampflater: 31, 32, 33, 34, 35 og 36.',
      why_here: 'Nummereringa gjer eitt samla grasområde om til eit presist kamp- og logistikksystem under turneringa.',
      source_note: 'Etnecup – Banar, kontrollert 19. juli 2026.'
    },
    {
      id: 'engebanen_tre_7er_tre_5er',
      title: 'Tre 7er- og tre 5er-flater',
      type: 'kampformat',
      kind: 'multi_format_football_area',
      year: null,
      desc: 'Flatene 31–33 er førte som 7er, medan 34–36 er førte som 5er.',
      why_here: 'Den jamne fordelinga mellom to speleformat er Engebanen sitt tydelegaste stadsspesifikke cupkjenneteikn.',
      source_note: 'Etnecup – Banar.'
    },
    {
      id: 'engebanen_cuparena_2023_2026',
      title: 'Dokumentert cupbruk 2023–2026',
      type: 'turneringshistorikk',
      kind: 'recurring_tournament_venue',
      year: 2023,
      desc: 'NFF sine turneringssøknader dokumenterer Engebanen eller Engebane som arena i kvar tilgjengeleg årsoversikt frå 2023 til 2026.',
      why_here: 'Kjelderekka viser gjenteken bruk utan å gjere 2023 til eit påstått bygge- eller opningsår.',
      source_note: 'NFF-turneringssøknader for 2023, 2024, 2025 og 2026.'
    },
    {
      id: 'engebanen_del_av_fire_arenaer_2026',
      title: 'Ein av fire arenaer i 2026',
      type: 'turneringsavvikling',
      kind: 'distributed_tournament_network',
      year: 2026,
      desc: 'NFF fører Etne stadion, Etne kunstgress, Engebane og Steinsvollen som arenaer for Etnecup 2026, med minst fem kampar per lag.',
      why_here: 'Oversikta viser at Engebanen er ein planlagd del av cupnettet og ikkje ei tilfeldig reserveflate.',
      source_note: 'NFF – Etnecup 2026.'
    }
  ],
  civication_store: [
    {
      id: 'engebanen_banekart_31_36',
      title: 'Foldekartet Enge 31–36',
      type: 'turneringskart',
      kind: 'physical_object',
      desc: 'Eit fysisk foldekart med dei seks nummererte kampflatene og tydeleg markering av 7er på 31–33 og 5er på 34–36.',
      placeSpecificReason: 'Nummerrekkja 31–36 og formatfordelinga kjem direkte frå Etnecup sitt Enge-kart.',
      historicalFunction: 'Gjer den årlege omforminga frå grasområde til organisert turneringsnett synleg.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 30,
      currency: 'PC',
      collection: 'engebanen_etne',
      collectable: true,
      civicationUse: ['kampplanlegging', 'baneforstaing', 'turneringslogistikk'],
      source_urls: [etnecupBanar]
    },
    {
      id: 'engebanen_formatkort_7er_5er',
      title: 'Formatkortet 7er / 5er',
      type: 'kampformat',
      kind: 'physical_object',
      desc: 'Eit dobbeltsidig fysisk kort som koplar 31–33 til 7er og 34–36 til 5er.',
      placeSpecificReason: 'Kortet uttrykkjer den nøyaktige formatfordelinga på Engebanen og mistar meining på andre anlegg.',
      historicalFunction: 'Viser korleis banestorleik og nummerering blir brukte for å organisere barnefotball i ein stor cup.',
      physicalObject: true,
      placeSpecific: true,
      storePrice: 22,
      currency: 'PC',
      collection: 'engebanen_etne',
      collectable: true,
      civicationUse: ['formatforstaing', 'lagplanlegging', 'stadssystem'],
      source_urls: [etnecupBanar]
    }
  ],
  brands: [
    {
      id: 'etnecup',
      name: 'Etnecup',
      brand_kind: 'sports_tournament',
      brand_type: 'local_youth_football_tournament'
    },
    {
      id: 'etne_idrettslag',
      name: 'Etne Idrettslag',
      brand_kind: 'sports_club',
      brand_type: 'tournament_organiser_and_facility_user'
    },
    {
      id: 'nff_rogaland',
      name: 'NFF Rogaland',
      brand_kind: 'sports_federation',
      brand_type: 'regional_football_association'
    }
  ],
  for_na: {
    title: 'Frå dokumentert grasarena til seksdelt cupnett',
    before: 'Den eldste NFF-kjelda i denne batchen fører Engebanen som Etnecup-arena i 2023. Kjeldene dokumenterer ikkje når sjølve fotballområdet blei bygd eller opna, og 2023 skal derfor ikkje brukast som anleggsår.',
    now: 'Etnecup fører Enge som seks nummererte grasflater, 31–36: tre 7er-flater og tre 5er-flater. NFF fører Engebane som ein av fire arenaer i 2026-turneringa.',
    change: 'Den tydelegaste endringa i kjeldene er organisatorisk: same samla grasområde blir nummerert, formatdelt og kopla til eit større nett av kampoppsett, lag og turneringsleiing.',
    lookFor: [
      'korleis eitt grasområde kan delast i seks kampflater',
      'skiljet mellom 7er på 31–33 og 5er på 34–36',
      'trygge gangliner mellom kampflatene',
      'kvar lag og publikum kan vente utanfor spelearealet',
      'skiljet mellom Engebanen, hovudanlegget og Steinsvollen'
    ],
    sources: [etnecupBanar, nff.y2023, nff.y2026]
  }
});
writeJson(placePath, placeRows);

const peopleRows = readJson(peoplePath);
const person = peopleRows.find((row) => row.id === 'pal_askvig');
if (!person) throw new Error('Fant ikke pal_askvig');
person.places = Array.from(new Set([...(person.places || []), 'engebanen_etne']));
person.popupDesc = 'Etnecup oppgir Pål Askvig med ansvar for påmelding, kampoppsett, kampavvikling og dommararbeid. NFF fører han som ansvarleg kontaktperson og fair play-ansvarleg for Etnecup i 2021 og 2023–2026. People-kortet har Steinsvollen som primærstad, men er også knytt til Engebanen fordi det same dokumenterte turneringsansvaret omfattar arenaen i cupnettet. Koplinga betyr ikkje at Askvig bygde anlegga eller eig grasflatene.';
writeJson(peoplePath, peopleRows);

const relations = readJson(relationsPath);
upsert(relations, 'id', {
  id: 'rel_pal_askvig_engebanen_etne',
  type: 'turneringsleiing_og_kampavvikling',
  place: 'engebanen_etne',
  person: 'pal_askvig',
  why: 'Etnecup oppgir Pål Askvig med ansvar for påmelding, kampoppsett, kampavvikling og dommararbeid, og NFF fører han som ansvarleg kontaktperson for turneringa som bruker Engebane.',
  source: etnecupContact
});
writeJson(relationsPath, relations);

const sources = [
  { title: 'Etnecup: Banar', url: etnecupBanar },
  { title: 'Etnecup: Kontakt oss', url: etnecupContact },
  { title: 'NFF: Etnecup 2023', url: nff.y2023 },
  { title: 'NFF: Etnecup 2024', url: nff.y2024 },
  { title: 'NFF: Etnecup 2025', url: nff.y2025 },
  { title: 'NFF: Etnecup 2026', url: nff.y2026 }
];

const stories = readJson(storiesPath);
upsert(stories, 'id', {
  id: 'st_engebanen_seks_flater_i_cupnettet',
  type: 'distributed_youth_tournament_venue',
  title: 'Seks flater på Enge',
  year: 2023,
  place_id: 'engebanen_etne',
  person_id: 'pal_askvig',
  summary: 'Engebanen blir under Etnecup delt i seks nummererte grasflater, med tre 7er-baner og tre 5er-baner i det geografisk fordelte cupnettet.',
  story: 'Engebanen er eitt samla fotballområde, ikkje seks separate History Go-stader. Etnecup sitt banekart gir grasflatene nummer 31–36. Dei tre første, 31–33, er 7er-flater, medan 34–36 er 5er-flater. Nummereringa gjer at lag, dommarar og publikum kan finne fram i eit tett kampoppsett utan at den operative baneinndelinga blir forveksla med seks permanente anlegg.\n\nNFF fører Engebanen eller Engebane som Etnecup-arena i 2023, 2024, 2025 og 2026. I 2026 står Engebane saman med Etne stadion, Etne kunstgress og Steinsvollen, og turneringa oppgir minst fem kampar per lag. Engebanen er derfor ein planlagd del av den fordelte cupkapasiteten, ikkje ei tilfeldig reserveflate.\n\nPål Askvig er dokumentert i turneringsleiinga med ansvar for påmelding, kampoppsett, kampavvikling og dommararbeid, og NFF fører han som ansvarleg kontaktperson. People-koplinga viser den organisatoriske innsatsen som bind seks kampflater inn i eitt system. Kjeldene fortel ikkje når Engebanen blei bygd eller opna; 2023 er berre det eldste dokumenterte turneringsåret i denne batchen.',
  sources,
  tags: ['Engebanen', 'Etnecup', '7er', '5er', 'kampoppsett', 'turneringslogistikk'],
  related_people: ['pal_askvig'],
  related_places: ['etne_idrettsanlegg', 'steinsvollen_fotballanlegg'],
  score: {
    narrative: 4,
    historical: 4,
    source: 5,
    play_value: 5,
    originality: 4,
    total: 22
  },
  arc: {
    start: 'Eitt grasområde blir delt i seks nummererte kampflater.',
    middle: 'Tre 7er- og tre 5er-flater blir fordelte inn i kampoppsettet.',
    end: 'NFF-kjeldene 2023–2026 viser Engebanen som ein fast del av Etnecup-nettet.'
  },
  next_scenes: [
    {
      place_id: 'etne_idrettsanlegg',
      reason: 'Hovudanlegget viser stadion- og kunstgrasflatene som cupnettet blir organisert rundt.'
    },
    {
      place_id: 'steinsvollen_fotballanlegg',
      reason: 'Steinsvollen viser den andre separate grasarenaen og ei anna blanding av kampformat.'
    }
  ]
});
writeJson(storiesPath, stories);

const leksikon = readJson(leksikonPath);
upsert(leksikon, 'place_id', {
  place_id: 'engebanen_etne',
  title: 'Engebanen som seksdelt cuparena',
  version: 1,
  visual: {
    designCode: 'article_sports_history_miniature'
  },
  popupDesc: 'Det separate grasområdet der Etnecup deler Enge inn i seks nummererte 7er- og 5er-flater.',
  wikiText: [
    'Engebanen er eit eige grasområde i Etnecup sitt banenett. Det offisielle banekartet fører seks kampflater, nummererte 31–36. Flatene 31–33 er 7er, medan 34–36 er 5er. Nummera er operative turneringsinndelingar av eitt samla fysisk område og skal ikkje bli seks separate History Go-stader.',
    'NFF dokumenterer Engebanen eller Engebane som arena i turneringsoversiktene for 2023, 2024, 2025 og 2026. I 2026 er Engebane lista saman med Etne stadion, Etne kunstgress og Steinsvollen. Denne geografiske fordelinga viser korleis ein stor barne- og ungdomsturnering bruker fleire lokale arenaer for å gi kvart lag minst fem kampar.',
    'Kjeldene dokumenterer ikkje bygge- eller opningsår for Engebanen. Året 2023 er derfor berre den eldste NFF-kjelda i batchen. People-rundinga bruker Pål Askvig som organisatorisk anker fordi Etnecup og NFF dokumenterer ansvaret hans for påmelding, kampoppsett, kampavvikling, dommararbeid og turneringskontakt.'
  ],
  summary: {
    one_liner: 'Engebanen er seks nummererte cupflater – tre 7er og tre 5er – samla i eitt fysisk grasområde.',
    themes: ['fleirbaneanlegg', 'Etnecup', '7er og 5er', 'turneringslogistikk', 'breiddefotball'],
    tone: ['idrettsfagleg', 'stadsspesifikk', 'kjeldeforsiktig']
  },
  facts: [
    {
      id: 'fact_engebanen_01',
      label: 'Seks kampflater',
      desc: 'Etnecup nummererer Enge 31–36.',
      confidence: 'high',
      sources: ['Etnecup']
    },
    {
      id: 'fact_engebanen_02',
      label: 'Tre 7er og tre 5er',
      desc: '31–33 er 7er, medan 34–36 er 5er.',
      confidence: 'high',
      sources: ['Etnecup']
    },
    {
      id: 'fact_engebanen_03',
      label: 'Fast del av cupnettet',
      desc: 'NFF dokumenterer arenaen i 2023–2026.',
      confidence: 'high',
      sources: ['NFF']
    },
    {
      id: 'fact_engebanen_04',
      label: 'Ein av fire arenaer i 2026',
      desc: 'NFF listar Engebane saman med Etne stadion, Etne kunstgress og Steinsvollen.',
      confidence: 'high',
      sources: ['NFF']
    }
  ],
  chronology: [
    {
      id: 'chrono_engebanen_01',
      year: 2023,
      period: 'Eldste kjelde i batchen',
      desc: 'NFF-turneringssøknaden listar Engebanen som arena. Året er ikkje eit opningsår.',
      confidence: 'high',
      sources: ['NFF']
    },
    {
      id: 'chrono_engebanen_02',
      year: 2024,
      period: 'Gjenteken cupbruk',
      desc: 'Engebane står igjen som arena i NFF-oversiktene for 2024, 2025 og 2026.',
      confidence: 'high',
      sources: ['NFF']
    },
    {
      id: 'chrono_engebanen_03',
      year: 2026,
      period: 'Dokumentert seksflatesystem',
      desc: 'Etnecup og NFF dokumenterer nummerering, kampformat og arenaens plass i turneringsnettet.',
      confidence: 'high',
      sources: ['Etnecup', 'NFF']
    }
  ],
  built_environment: {
    built_year: null,
    architects: [],
    materials: ['naturgras'],
    style: ['fleirbanesområde for breiddefotball'],
    original_function: null,
    current_function: 'Separat 7er- og 5er-arena i Etnecup sitt banenett',
    changes: [
      'grasområdet blir delt i seks nummererte kampflater under cupen',
      'tre flater blir brukte til 7er og tre til 5er',
      'digitale kampoppsett og arenaoversikter knyter Engebanen til hovudområdet og Steinsvollen'
    ]
  },
  stories: [
    {
      id: 'story_engebanen_01',
      entry_id: 'st_engebanen_seks_flater_i_cupnettet',
      title: 'Seks flater på Enge',
      one_liner: 'Engebanen gjer eitt grasområde om til seks operative cupflater.',
      confidence: 'high',
      sources: ['Etnecup', 'NFF']
    }
  ],
  interpretation: {
    what_to_notice: [
      'korleis linjer og mål kan forme seks kampflater på same grasområde',
      'forskjellen mellom 7er og 5er',
      'nummereringa 31–36 i kampoppsettet',
      'ventesoner og gangliner utanfor speleflatene',
      'skiljet mellom Engebanen, Etne idrettsanlegg og Steinsvollen'
    ],
    why_it_matters: [
      'Anlegget viser at store breiddeturneringar er avhengige av eit nett av lokale baner',
      'Engebanen gjer kampoppsett, dommararbeid og formatdeling til ein synleg del av idrettshistoria'
    ],
    counterpoints: [
      'Kjeldene dokumenterer ikkje når fotballområdet blei bygd eller opna',
      'Dei seks kampflatene skal ikkje opprettast som seks separate History Go-stader',
      '2023 er den eldste kjelda i batchen, ikkje eit anleggsår'
    ]
  },
  links: {
    entry_ids: ['st_engebanen_seks_flater_i_cupnettet'],
    related_places: ['etne_idrettsanlegg', 'steinsvollen_fotballanlegg'],
    related_people: ['pal_askvig']
  },
  sources,
  ui: {
    mini_panel: {
      show: true,
      highlights: ['fact_engebanen_01', 'fact_engebanen_02', 'story_engebanen_01'],
      max_items: 6
    }
  }
});
writeJson(leksikonPath, leksikon);

writeText('reports/engebanen-rounds-batch1.md', `# Engebanen – rundingsbatch 1

## Omfang

Alle ni rundinger i sportprofilen er fylt: people, training, badges, works, civication, brands, før_nå, fortellinger og leksikon.

## Kilde- og avgrensningsvalg

- Etnecup nummererer seks Enge-flater 31–36.
- Flatene 31–33 er 7er, mens 34–36 er 5er.
- NFF dokumenterer Engebanen eller Engebane som turneringsarena i 2023–2026.
- 2023 brukes som eldste kilde i batchen, aldri som bygge- eller åpningsår.
- De seks kampflatene beholdes som ett samlet fysisk History Go-sted.
- Pål Askvig gjenbrukes som dokumentert organisatorisk people-anker, ikke som eier eller anleggsbygger.

## Trygghet

Treningsinnholdet krever åpen, tørr, ledig og tillatt grasflate. Det forbyr bruk under kamp, organisert trening, oppmerking og vedlikehold, og unngår harde skudd, lange pasninger og kontaktspill.

## Validering

Den midlertidige generator-workflowen kjører stedstesten, arvede sportstester, PlaceCard-auditer, people-manifestkontroll, TypeScript tools/web og git diff-kontroll før den skriver den rene batchen tilbake til feature-grenen.
`);

writeText('tests/engebanen-batch1-round-content.test.js', `const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');

const profileMatch = runtimeSource.match(/const CATEGORY_ROUND_PROFILES = Object\\.freeze\\((\\{[\\s\\S]*?\\})\\);/);
assert(profileMatch, 'Runtime skal eksponere kategori-profilane statisk');
const profiles = Function(\`return (\${profileMatch[1]});\`)();
const expectedRounds = ['people', 'training', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
assert.deepStrictEqual(profiles.sport, expectedRounds, 'Engebanen skal bruke den dokumenterte sportprofilen');

const placePath = 'data/places/sport/vestland/etne/engebanen_etne.json';
const place = readJson(placePath)[0];
const peoplePath = 'people/sport/vestland/etne/pal_askvig.json';
const person = readJson(\`data/\${peoplePath}\`)[0];
const peopleManifest = readJson('data/people/manifest.json');
const relations = readJson('data/relations.json');
const relation = relations.find((row) => row.id === 'rel_pal_askvig_engebanen_etne');
const storyPath = 'data/stories/stories_etnesjoen_sport_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_engebanen_seks_flater_i_cupnettet');
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/sport/leksikon_etnesjoen_sport_rounds_batch1.json';
const article = readJson(leksikonPath).find((row) => row.place_id === place.id);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validEmneIds = new Set(readJson('data/fag/sport/emner_sport_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/sport.json').sub);

assert.strictEqual(place.id, 'engebanen_etne');
assert.strictEqual(place.category, 'sport');
assert.strictEqual(place.year, null, 'Ukjent opningsår skal halde fram som null');
assert.deepStrictEqual([place.lat, place.lon], [59.669146210923635, 5.943586219300233], 'Det representative Enge-ankeret skal bevarast');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'play', 'nature_profile']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), \`Engebanen skal ikkje få irrelevant eller manuell \${forbidden}\`);
}

assert.strictEqual(peopleManifest.files.filter((file) => file === peoplePath).length, 1, 'Pål Askvig skal vere manifestlasta nøyaktig éin gong');
assert.strictEqual(person.id, 'pal_askvig');
assert.strictEqual(person.placeId, 'steinsvollen_fotballanlegg', 'Primærstad skal ikkje flyttast kunstig');
assert(person.places.includes('steinsvollen_fotballanlegg') && person.places.includes(place.id), 'People-kortet skal knytast til både Steinsvollen og Engebanen');
assert(relation, 'People-rundingen skal ha ei eksplisitt person–stad-kopling');
assert.strictEqual(relation.person, person.id);
assert.strictEqual(relation.place, place.id);

assert(storyManifest.files.some((entry) => entry.category === 'sport' && entry.path === storyPath), 'Sportsforteljinga skal vere manifestlasta');
assert(leksikonManifest.files.includes(leksikonPath), 'Sportsleksikonet skal vere manifestlasta');
assert(story && story.place_id === place.id, 'Engebanen skal ha eiga forteljing');
assert.strictEqual(story.person_id, person.id, 'Forteljinga skal lenkje turneringsorganisatoren');
assert(article && article.place_id === place.id, 'Engebanen skal ha eigen leksikonartikkel');
assert.strictEqual(article.visual.designCode, 'article_sports_history_miniature');
assert(article.links.entry_ids.includes(story.id));

const roundContent = {
  people: [relation],
  training: place.training_profile,
  badges: place.underbadge_ids,
  works: place.works,
  civication: place.civication_store,
  brands: place.brands,
  før_nå: place.for_na,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds);
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, \`Engebanen manglar innhald i rundingen \${roundId}\`);
}

assert(place.externalLinks.length >= 6 && place.externalLinks.every((link) => /^https:\\/\\//.test(link.url)), 'Engebanen skal ha kontrollerte HTTPS-kjelder');
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Berre kanoniske sportsemne er tillatne');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Berre dokumenterte sport-underbadges er tillatne');
assert.strictEqual(place.training_profile.exercises.length, 3);
assert(/open|ope|ledig|booking/i.test(place.training_profile.safety), 'Treninga skal krevje open og ledig flate');
assert(/våt|stengd|kamp|vedlikehald/i.test(place.training_profile.safety), 'Treninga skal verne graset og organisert aktivitet');
assert(/ikkje harde skot|ikkje.*lange pasningar/i.test(place.training_profile.safety), 'Treninga skal unngå risikofylt ballbruk');
assert(place.works.length >= 4);
assert(place.civication_store.length >= 2);
assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true));
assert(place.brands.length >= 3);
assert(place.for_na.before && place.for_na.now && place.for_na.change);
assert(story.sources.length >= 6, 'Forteljinga skal bruke Etnecup og NFF-kjelderekka');
assert(article.wikiText.length >= 3 && article.sources.length >= 6, 'Leksikonet skal vere fullstendig og breitt kjeldebelagt');

const combined = JSON.stringify({ place, person, relation, story, article });
assert(/31.{0,3}36/.test(combined), 'Dei seks nummererte kampflatene 31–36 skal dokumenterast');
assert(/7er/.test(combined) && /5er/.test(combined), 'Både 7er- og 5er-format skal dokumenterast');
for (const year of ['2023', '2024', '2025', '2026']) {
  assert(combined.includes(year), \`Kjelderekka manglar \${year}\`);
}
assert(/påmelding/.test(combined) && /kampoppsett/.test(combined) && /kampavvikling/.test(combined) && /dommar/.test(combined), 'People-koplinga skal byggje på dokumentert turneringsansvar');
assert(/ikkje.*opningsår|ikkje eit opningsår|ikkje.*anleggsår/i.test(combined), '2023 skal ikkje framstillast som opningsår');
assert(!/(?:blei|vart|var)\\s+(?:opna|bygd)\\s+i\\s+2023/i.test(combined), 'Batchen skal ikkje dikte bygge- eller opningshistorie i 2023');
assert(/eitt stadobjekt|eitt samla fysisk område|ikkje seks separate/i.test(combined), 'Dei seks kampflatene skal haldast samla i eitt stadobjekt');

console.log('Engebanen batch 1 round content OK');
`);

console.log('Generated Engebanen round batch 1');
