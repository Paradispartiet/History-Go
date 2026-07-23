import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const readJson = async (p) => JSON.parse(await fs.readFile(path.join(root, p), 'utf8'));
const writeJson = async (p, value) => {
  const full = path.join(root, p);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const writeText = async (p, value) => {
  const full = path.join(root, p);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, value, 'utf8');
};

const expectedRounds = ['tasks', 'nature', 'badges', 'training', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const storyPath = 'data/stories/stories_etne_natur_rounds_batch3.json';
const articlePath = 'data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch3.json';
const reportDir = 'reports/etne-natur-rounds-batch3';

const sourceSets = {
  sandvikevatnet: [
    { title: 'NVE – 042/2 Mosneselva', url: 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/042-2-mosneselva/' },
    { title: 'Etne kommune – naturforvaltning', url: 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/naturforvaltning/' },
    { title: 'Folgefonna nasjonalpark – Om nasjonalparken', url: 'https://folgefonna.info/om-nasjonalparken/' }
  ],
  vaulaelva: [
    { title: 'NVE – 042/1 Vaulaelva med Langfossen', url: 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/042-1-vaulaelva-m-langfossen/' },
    { title: 'Etne kommune – naturforvaltning', url: 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/naturforvaltning/' },
    { title: 'NVE – Verneplan for vassdrag', url: 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/' }
  ],
  saltana: [
    { title: 'NVE – verneplanoversikt Vestland, Saltåna 042/3', url: 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/?page=3' },
    { title: 'NVE – Saltåno kraftverk', url: 'https://www.nve.no/energi/energisystem/vannkraft/vannkraftverk/?id=1612' },
    { title: 'NVE – Saltåna minikraftverk, konsesjonssak', url: 'https://www.nve.no/konsesjon/konsesjonssaker/konsesjonssak/?id=3310&type=V-1' },
    { title: 'Etne kommune – naturforvaltning', url: 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/naturforvaltning/' }
  ]
};

const configs = {
  sandvikevatnet_etne: {
    file: 'data/places/natur/vestland/etne/sandvikevatnet_etne.json',
    tasks: [
      ['sandvikevatnet_finn_innlopet', 'Finn innløpssonen', 'Bruk kart og trygg utsikt til å finne hvor hovedvannet kommer inn i innsjøen. Ikke gå ut på sandur, elvebanke eller løs ur for å komme nærmere.', 'Innløpet viser hvordan brepåvirket vann og sediment kommer inn i innsjøsystemet.'],
      ['sandvikevatnet_les_sanduren', 'Les sanduren på avstand', 'Finn fra trygg ferdsel en lysere eller flatere avsetningsflate ved innløpsområdet dersom den er synlig. Beskriv form og plassering uten å gå ut på løsmassene.', 'NVE bruker sanduren som et konkret spor etter tidligere større og mer masseførende elv.'],
      ['sandvikevatnet_sammenlign_dalsider', 'Sammenlign to dalsider', 'Velg to synlige dalsider og sammenlign bratthet, vegetasjon og spor etter skredmateriale fra samme sikre ståsted.', 'NVE beskriver stor kontrast mellom bratte dalsider, ur og skog på skredmateriale.'],
      ['sandvikevatnet_folg_vannet_videre', 'Følg vannet videre', 'Bruk kartet til å peke ut retningen vannet fortsetter fra innsjøen mot resten av Mosnesvassdraget og Åkrafjorden.', 'Sandvikevatnet er et sentralt ledd i et større bre-til-fjord-system.']
    ],
    natureSummary: 'Sandvikevatnet ligger sentralt i det vernede Mosnesvassdraget og er det største vannet i nedbørfeltet. NVE oppgir innsjøen til omtrent 0,5 kvadratkilometer og 328 meter over havet. Beliggenheten midt i et bratt brevassdrag gjør vannet særlig interessant som overgang mellom høyfjell, sedimenttransport, skredpåvirkede dalsider og det videre elveløpet mot Åkrafjorden. Nedenfor Folgefonna renner elvene gjennom en trang V-formet dal, og store urer og løsmasser viser at både skred og rennende vann flytter materiale. Ved Sandvikevatnet beskriver NVE gråor- og heggeskog i den sørøstvendte dalsiden, utviklet på skredmateriale. Det mest særpregede læringssporet ligger ved innløpet: Elva fra Folgefonna er slamførende, og den store sanduren som er lagt opp der viser at elva tidligere var større og mer masseførende. En del brevann fra Blomstølskardvann er nå overført til kraftverkene i Blåfalli. Dermed fungerer sanduren som et fysisk minne om en tidligere vann- og sedimenttransport som ikke er identisk med dagens. History Go-stedet representerer innsjøen som helhet og ikke sanduren som et oppholdsareal. Oppgaver skal derfor gjøres fra trygg etablert ferdsel, med kart, utsikt og observasjon på avstand. Natur-rundingen handler om innsjøen som prosessknutepunkt: vann kommer fra brepåvirket høyfjell, sediment avsettes, skredmateriale former dalsidene, skog etablerer seg på ustabil grunn, og vannet fortsetter videre gjennom det vernede vassdraget mot fjorden.',
    themes: ['innsjø', 'brevassdrag', 'sandur', 'sedimenttransport', 'skredmateriale', 'skog', 'Mosnesvassdraget'],
    nearby: ['mosneselva_etne', 'folgefonnanasjonalpark_etne', 'akrafjorden'],
    boundaries: ['Kartpunktet representerer hele innsjøen og er ikke et anbefalt innløps- eller sandurpunkt.', 'Sanduren skal observeres fra trygg ferdsel og ikke brukes som treningsflate.', 'Fakta om tidligere større vannføring gjelder Mosnesvassdragets dokumenterte sedimenthistorie.'],
    training: {
      title: 'Rolig feltlesing ved Sandvikevatnet',
      summary: 'Tre lette øvelser for kart, terreng og sedimentlesing fra trygg ferdsel.',
      safety: 'Hold deg på offentlig vei, merket sti eller annen tydelig trygg ferdselslinje. Ikke gå ut på sandur, løs ur, skredmateriale eller glatte vannkanter. Hold avstand til bratte dalsider og vann, og avbryt ved kraftig regn, dårlig sikt eller ustabilt underlag.',
      exercises: [
        { id: 'sandvikevatnet_kartknutepunkt', title: 'Kartknutepunkt', instruction: 'Finn innsjøen på kartet og pek ut retningen mot Folgefonna, innløpet og videre utløpsretning.', duration_minutes: 6, intensity: 'svært lett', why: 'Øvelsen viser hvorfor innsjøen er et knutepunkt i vassdraget.' },
        { id: 'sandvikevatnet_rolig_observasjonsgang', title: 'Rolig observasjonsgang', instruction: 'Gå rolig i opptil ti minutter på trygg ferdselslinje og stopp tre ganger for å registrere vann, løsmasser og vegetasjon.', duration_minutes: 10, intensity: 'lett', why: 'Bevegelse gjør overgangene mellom innsjø, dalside og avsetninger tydeligere.' },
        { id: 'sandvikevatnet_sedimentstopp', title: 'Sedimentstopp', instruction: 'Fra fast trygg grunn: finn ett grovt og ett fint materiale du kan se uten å flytte på noe, og forklar hvor vann eller skred kan ha flyttet det.', duration_minutes: 5, intensity: 'svært lett', why: 'Øvelsen trener prosessforståelse uten å gå inn i utsatte avsetningsområder.' }
      ]
    },
    civication: [
      ['sandvikevatnet_328_brikke', '328-meter-brikken', 'hoydebrikke', 'En fysisk brikke merket 328 moh. og 0,5 km².', 'Høyde og areal er dokumenterte nøkkelfakta for Sandvikevatnet.', 'Gjør innsjøens plassering i det bratte vassdraget konkret.'],
      ['sandvikevatnet_sandurmodell', 'Sandurmodellen', 'sedimentmodell', 'En fysisk modell av avsetningsflaten ved innløpet og strømretningen inn i vannet.', 'NVE framhever sanduren som spor etter tidligere større massetransport.', 'Bevarer sammenhengen mellom brevann, sediment og endret vannføring.'],
      ['sandvikevatnet_skredskogsnitt', 'Skredskogsnittet', 'habitatmodell', 'En taktil modell med skredmateriale, gråor- og heggeskog i lag.', 'NVE beskriver denne vegetasjonen særskilt på sørøstvendt skredmateriale ved vannet.', 'Viser hvordan natur kan etablere seg på materiale som stadig formes av terrengprosesser.'],
      ['sandvikevatnet_bretilfjord_kort', 'Bre-til-fjord-kortet', 'kartobjekt', 'Et fysisk kartkort som plasserer Sandvikevatnet mellom Folgefonna og Åkrafjorden.', 'Innsjøen er et sentralt ledd i Mosnesvassdragets dokumenterte bre-til-fjord-sammenheng.', 'Gjør systemperspektivet synlig i samlingen.']
    ],
    brands: [
      { id: 'nve', name: 'Norges vassdrags- og energidirektorat', brand_kind: 'public_actor', brand_type: 'watercourse_management' },
      { id: 'mosnesvassdraget', name: 'Mosnesvassdraget', brand_kind: 'protected_watercourse_identity', brand_type: 'reference_watercourse' },
      { id: 'folgefonna_nasjonalpark', name: 'Folgefonna nasjonalpark', brand_kind: 'protected_area', brand_type: 'national_park' },
      { id: 'etne_kommune', name: 'Etne kommune', brand_kind: 'public_actor', brand_type: 'municipality' },
      { id: 'kartverket', name: 'Kartverket', brand_kind: 'public_actor', brand_type: 'place_name_authority' }
    ],
    forNa: {
      title: 'Sanduren som husker større vannføring',
      before: 'NVE beskriver at elva inn mot Sandvikevatnet tidligere var større og mer masseførende, og den store sanduren ved innløpet ble bygget opp under denne sterkere transporten.',
      now: 'En del brevann fra Blomstølskardvann er overført til kraftverkene i Blåfalli, mens sanduren fortsatt ligger som et synlig arkiv etter tidligere vann- og sedimentføring.',
      change: 'Vannføringen og materialtransporten er delvis endret, men landskapet bevarer avsetningen som gjør forskjellen mellom før og nå lesbar.',
      lookFor: ['innløpsretningen', 'sandurens form', 'grove og fine løsmasser', 'bratte dalsider', 'skog på skredmateriale']
    },
    story: {
      id: 'st_sandvikevatnet_sanduren_som_husker',
      title: 'Sanduren som husker en større elv',
      summary: 'Ved Sandvikevatnet ligger et landskapsspor som viser at breelva tidligere fraktet mer vann og materiale enn den gjør i dag.',
      text: 'Sandvikevatnet ligger midt i Mosnesvassdraget, 328 meter over havet. Det er ikke bare det største vannet i det vernede feltet; det er også et sted der vassdragets historie har lagt seg fysisk på bakken.\n\nFra Folgefonna kommer vann som kan være fullt av fint bre-slam. Over tid flytter elva også grus, sand og større materiale. Ved innløpet til Sandvikevatnet har denne transporten bygget opp en stor sandur. NVE bruker nettopp sanduren som bevis på at elva tidligere var større og mer masseførende.\n\nSenere ble en del brevann fra Blomstølskardvann overført til kraftverkene i Blåfalli. Vannet som når fram til innsjøen er derfor ikke helt det samme systemet som før. Likevel ligger avsetningen igjen. Sanduren fungerer som et arkiv som kan leses uten dokumenter: formen og materialet forteller at vannets kraft og mengde en gang var annerledes.\n\nRundt innsjøen fortsetter andre prosesser. Bratte dalsider sender stein og skredmateriale nedover, og på deler av dette materialet har gråor- og heggeskog etablert seg. Vann, skred og vegetasjon arbeider samtidig på forskjellige tidsskalaer.\n\nHistory Go-stedet skal derfor ikke sende spilleren ut på sanduren. Det skal lære spilleren å lese den fra trygg ferdsel. Et landskap kan være et historisk dokument selv når historien ikke handler om mennesker.'
    },
    article: {
      title: 'Sandvikevatnet',
      popup: 'Det største vannet i Mosnesvassdraget, med en sandur som dokumenterer tidligere større vann- og sedimenttransport.',
      paragraphs: [
        'Sandvikevatnet ligger sentralt i det vernede Mosnesvassdraget. NVE oppgir innsjøen til omtrent 0,5 km² og 328 meter over havet.',
        'Vannet ligger i en bratt V-formet dal nedenfor Folgefonna. Urene langs dalsidene og løsmassene i dalbunnen viser at skred, elv og brepåvirkning flytter materiale gjennom landskapet.',
        'Ved innløpet ligger en stor sandur. NVE beskriver den som et spor etter at elva tidligere var større og mer masseførende.',
        'En del brevann fra Blomstølskardvann er overført til kraftverkene i Blåfalli. Dermed kan dagens vannføring ikke uten videre brukes som mål på tidligere sedimenttransport.',
        'På den sørøstvendte dalsiden ved vannet beskriver NVE gråor- og heggeskog utviklet på skredmateriale.',
        'History Go-markøren representerer innsjøen som helhet. Sandur, ur og vannkant skal observeres fra trygg etablert ferdsel.'
      ],
      facts: [
        ['01', 'Største vann i feltet', 'Sandvikevatnet er det største vannet i Mosnesvassdraget.'],
        ['02', '0,5 km²', 'NVE oppgir arealet til omtrent 0,5 kvadratkilometer.'],
        ['03', '328 moh.', 'Innsjøen ligger 328 meter over havet.'],
        ['04', 'Sentralt i vassdraget', 'Vannet ligger midt i det vernede bre-til-fjord-systemet.'],
        ['05', 'Stor sandur', 'En stor sandur ligger ved innløpet til innsjøen.'],
        ['06', 'Tidligere større elv', 'Sanduren vitner om tidligere større og mer masseførende elv.'],
        ['07', 'Overført brevann', 'Brevann fra Blomstølskardvann er overført til kraftverkene i Blåfalli.'],
        ['08', 'Skredmateriale', 'Bratte dalsider tilfører store mengder skredmateriale.'],
        ['09', 'Gråor og hegg', 'NVE beskriver gråor- og heggeskog på skredmateriale ved vannet.'],
        ['10', 'Trygt områdeanker', 'Kartpunktet er et innsjøanker og ikke en anbefalt sandur- eller vannkantadkomst.']
      ]
    },
    sources: sourceSets.sandvikevatnet
  },
  vaulaelva_vassdraget: {
    file: 'data/places/natur/vestland/etne/vaulaelva_vassdraget.json',
    tasks: [
      ['vaulaelva_finn_plataet', 'Finn fjellplatået', 'Fra trygg etablert ferdsel eller kart: finn høydeområdet der Vaulaelva renner før det store fallet mot fjorden.', 'NVE beskriver et fjellplatå omkring 800–1000 moh. som en sentral del av vassdraget.'],
      ['vaulaelva_folg_vannkjeden', 'Følg vannkjeden', 'Bruk kartet til å følge Vaulo/Vaulavatnet, elveløpet og retningen mot Langfossen og Åkrafjorden.', 'Vassdraget må forstås som mer enn selve fossen.'],
      ['vaulaelva_les_fallet', 'Les høydefallet', 'Finn med kart og utsikt forskjellen mellom høyfjell og fjordnivå. Ikke gå mot fosskant eller bratt terreng for å få bedre utsikt.', 'Høydegradienten fra 1408 meter til havnivå er en av de mest markante egenskapene.'],
      ['vaulaelva_skill_foss_vassdrag', 'Skill fossen fra vassdraget', 'Pek ut på kartet hva som er Langfossen og hva som er resten av Vaulovassdraget med vann og elv på fjellplatået.', 'History Go har egne markører fordi fossen og hele vassdraget er to ulike naturenheter.']
    ],
    natureSummary: 'Vaulovassdraget er et 31 kvadratkilometer stort vernet fjellvassdrag som strekker seg fra høyfjell til Åkrafjorden. NVE beskriver et attraktivt fjellandskap med flere vann omkring 1000 meters høyde. Det største vannet er Vaulo, også omtalt som Vaulavatnet i lokal og kartmessig sammenheng, med et areal på omtrent 1,1 kvadratkilometer og høyde omkring 875 meter over havet. Vaulaelva renner nordover over fjellplatået, hovedsakelig i høydeområdet 800–1000 meter, før terrenget bryter dramatisk ned mot fjorden gjennom Langfossen. Hele vassdraget spenner fra 1408 meter til havnivå. Vernegrunnlaget handler om urørthet, friluftsliv og rollen som restfelt i en ellers sterkt vannkraftutbygd region. NVE oppgir at feltet i hovedsak er uten inngrep, bortsett fra riksveien som krysser elva nær utløpet. Historien om vernet har to trinn. I Verneplan II i 1980 ble Langfossen vernet bare i sommersesongen, fem måneder i året. I suppleringen av Verneplan for vassdrag i 2005 ble fossen vernet hele året. Dette gjør Vaulovassdraget til et særlig godt sted for å forstå at naturvern også kan endres og utvides over tid. History Go-markøren representerer hele vassdraget, ikke fosskanten eller et bestemt turmål. Fysisk gameplay må derfor skje fra trygg offentlig eller etablert ferdsel. Natur-rundingen skal gjøre systemet lesbart: høyfjellsvannene, platåelva, det store høydefallet, Langfossen som én del av helheten og Åkrafjorden som sluttpunkt.',
    themes: ['vernet vassdrag', 'fjellplatå', 'Vaulo', 'Langfossen', 'høydegradient', 'urørthet', 'vernehistorie'],
    nearby: ['langfoss_etne', 'saltana_etne', 'akrafjorden'],
    boundaries: ['Kartpunktet representerer hele Vaulovassdraget og er ikke et sikkert tilgangspunkt til Langfossen.', 'Ingen oppgave skal sende spilleren mot fosskant, bratt ur eller umerket høyfjell.', 'Langfossen er en egen naturmarkør og skal ikke brukes som synonym for hele vassdraget.'],
    training: {
      title: 'Trygg høyde- og kartlesing ved Vaulovassdraget',
      summary: 'Tre lette øvelser for å forstå høyfjell, vannkjede og fall uten risikofylt terrengferdsel.',
      safety: 'Bruk bare offentlig vei, merket sti eller annen trygg etablert ferdsel. Hold stor avstand til fosskant, stup, sterke strømmer og glatte steiner. Ikke bruk kartmarkøren som turstart uten separat ruteplanlegging. Sjekk vær og snu ved dårlig sikt eller krevende forhold.',
      exercises: [
        { id: 'vaulaelva_kartprofil', title: 'Kartprofil fra 1408 til 0', instruction: 'Bruk kartet til å finne et høyt punkt i feltet, Vaulo og fjorden. Følg høydeendringen uten å forlate trygg ferdsel.', duration_minutes: 7, intensity: 'svært lett', why: 'Høydeprofilen forklarer hvorfor vassdraget endrer karakter så dramatisk.' },
        { id: 'vaulaelva_rolig_plataagang', title: 'Rolig platågang', instruction: 'Hvis du allerede er på en trygg etablert fjellrute, gå rolig i opptil åtte minutter og registrer ett vannspor og ett værtegn. Ellers gjør øvelsen som kartobservasjon.', duration_minutes: 8, intensity: 'lett', why: 'Øvelsen kobler platålandskapet til vannets retning uten å kreve risikofylt ferdsel.' },
        { id: 'vaulaelva_sikkerhetsgrense', title: 'Sett en sikkerhetsgrense', instruction: 'Pek ut én synlig eller kartlagt sone du ikke skal nærme deg, som fosskant, bratt side eller sterk strøm, og forklar hvorfor.', duration_minutes: 4, intensity: 'svært lett', why: 'Å forstå terreng innebærer også å vite hvilke deler som ikke er egnet for nærgående gameplay.' }
      ]
    },
    civication: [
      ['vaulaelva_31km2_relief', '31 km²-relieffet', 'nedborfeltmodell', 'En fysisk modell av Vaulovassdraget fra Vaulo til Åkrafjorden.', 'Areal og landskapsspenn er dokumenterte kjennetegn ved vassdraget.', 'Gjør hele systemet synlig utover den kjente fossen.'],
      ['vaulaelva_1408_0_profil', '1408–0-profilen', 'hoydeprofil', 'En fysisk profil som viser fallet fra høyeste del av feltet til havnivå.', 'Høydenivået 1408–0 moh. er spesifikt dokumentert av NVE.', 'Viser hvordan vannets energi og landskapet endres mot fjorden.'],
      ['vaulaelva_vernepar_1980_2005', 'Verneparet 1980–2005', 'verneobjekt', 'To fysiske brikker: fem måneders sommervern og helårsvern.', 'Vaulovassdragets vernehistorie har to tydelige dokumenterte trinn.', 'Gjør endring i vernepolitikk konkret.'],
      ['vaulaelva_vaulo_vannkjede', 'Vaulo-vannkjeden', 'vannsystemmodell', 'En fysisk kjedemodell fra Vaulo gjennom elva til Langfossen og fjorden.', 'Kjeden viser akkurat dette vassdragets overgang fra fjellvann til stort fossefall.', 'Motvirker at hele vassdraget reduseres til én foss.']
    ],
    brands: [
      { id: 'nve', name: 'Norges vassdrags- og energidirektorat', brand_kind: 'public_actor', brand_type: 'watercourse_management' },
      { id: 'etne_kommune', name: 'Etne kommune', brand_kind: 'public_actor', brand_type: 'municipality' },
      { id: 'vaulovassdraget', name: 'Vaulovassdraget', brand_kind: 'protected_watercourse_identity', brand_type: 'protected_watercourse' },
      { id: 'langfoss', name: 'Langfossen', brand_kind: 'natural_landmark', brand_type: 'waterfall_identity' },
      { id: 'kartverket', name: 'Kartverket', brand_kind: 'public_actor', brand_type: 'place_name_authority' }
    ],
    forNa: {
      title: 'Fra sommervern til helårsvern',
      before: 'Da vassdraget ble vernet i Verneplan II i 1980, var Langfossen bare vernet i sommersesongen – fem måneder i året.',
      now: 'Etter suppleringen av Verneplan for vassdrag i 2005 er Langfossen vernet hele året som del av den større vernesammenhengen.',
      change: 'Vernet gikk fra en sesongavgrenset ordning til helårsbeskyttelse, mens hele vassdragets rolle som urørt restfelt ble tydeligere.',
      lookFor: ['fjellplatået', 'vannkjeden rundt Vaulo', 'det store høydefallet', 'skillet mellom Langfossen og resten av vassdraget', 'riksveien nær utløpet']
    },
    story: {
      id: 'st_vaulaelva_fra_fem_maneder_til_hele_aret',
      title: 'Fra fem måneder til hele året',
      summary: 'Vaulovassdragets vernehistorie viser at et vernevedtak kan være trinnvis og endres når samfunnet vurderer naturverdien på nytt.',
      text: 'Høyt over Åkrafjorden ligger flere vann på et fjellplatå. Fra Vaulo renner Vaulaelva nordover før landskapet plutselig slipper taket og vannet kaster seg ned mot fjorden gjennom Langfossen.\n\nI dag er fossen kjent som selve blikkfanget, men vassdraget er større enn fossen. NVE beskriver et 31 kvadratkilometer stort felt med høyder fra 1408 meter til havnivå. Vaulo er det største vannet, og store deler av elveløpet går gjennom et høyfjellslandskap omkring 800–1000 meter.\n\nDa vassdraget ble vernet i 1980, fikk Langfossen en uvanlig ordning: vernet gjaldt bare i sommersesongen, fem måneder i året. Senere ble vernet vurdert på nytt. I 2005 ble Langfossen vernet hele året gjennom suppleringen av Verneplan for vassdrag.\n\nDet gjør stedet til mer enn en historie om vakker natur. Det viser at vern er politikk og forvaltning over tid. En naturverdi kan være kjent lenge før beskyttelsen blir fullstendig, og nye vedtak kan endre grensene for hva som får bestå.\n\nFor spilleren er den viktigste oppgaven å holde målestokken riktig. Langfossen er én del av et helt vannsystem. Vaulo, fjellplatået, elva, fallet og fjorden hører sammen. History Go-markøren skal derfor lære bort hele kjeden uten å lokke noen mot fosskant eller bratt terreng.'
    },
    article: {
      title: 'Vaulaelva og Vaulovassdraget',
      popup: 'Vernet fjellvassdrag fra Vaulo til Åkrafjorden, med Langfossen som det mest markante enkeltleddet.',
      paragraphs: [
        'Vaulovassdraget dekker omtrent 31 km² og strekker seg fra høyfjell til Åkrafjorden. Høydenivået går fra 1408 meter til havnivå.',
        'Vaulo er største vann i feltet, omtrent 1,1 km² og 875 meter over havet. Vaulaelva renner nordover over fjellplatået før den faller mot fjorden.',
        'NVE beskriver platået hovedsakelig i høydeområdet 800–1000 meter og framhever vassdragets urørthet, friluftsverdi og rolle som restfelt i en sterkt vannkraftutbygd region.',
        'Det eneste inngrepet NVE framhever i feltet er riksveien som krysser elva nær utløpet.',
        'Vassdraget ble vernet i 1980, men Langfossen hadde først bare sommervern fem måneder i året. I 2005 ble fossen vernet hele året.',
        'History Go skiller mellom Langfossen som egen naturattraksjon og Vaulovassdraget som hele vannsystemet.'
      ],
      facts: [
        ['01', '31 km²', 'Vaulovassdraget har et areal på omtrent 31 kvadratkilometer.'],
        ['02', '1408–0 moh.', 'Feltet spenner fra 1408 meter til havnivå.'],
        ['03', 'Vaulo er størst', 'Vaulo er største vann i feltet.'],
        ['04', '1,1 km²', 'Vaulo har et areal på omtrent 1,1 kvadratkilometer.'],
        ['05', '875 moh.', 'Vaulo ligger omkring 875 meter over havet.'],
        ['06', '800–1000 meters platå', 'Vaulaelva renner over et høyt fjellplatå før fallet mot fjorden.'],
        ['07', 'Restfelt', 'Vassdraget er vernet som viktig restfelt i en vannkraftutbygd region.'],
        ['08', 'Riksvei ved utløpet', 'NVE framhever riksveien ved utløpet som feltets tydelige inngrep.'],
        ['09', 'Vernet i 1980', 'Vassdraget ble vernet i Verneplan II i 1980.'],
        ['10', 'Helårsvern fra 2005', 'Langfossen gikk fra sesongvern til helårsvern i 2005.']
      ]
    },
    sources: sourceSets.vaulaelva
  },
  saltana_etne: {
    file: 'data/places/natur/vestland/etne/saltana_etne.json',
    tasks: [
      ['saltana_finn_nabosammenhengen', 'Finn nabosammenhengen', 'Bruk kartet til å finne Saltåna og Vaulaelva og forklar hvorfor to nærliggende vassdrag kan vurderes i sammenheng.', 'NVE sier uttrykkelig at Saltånas vern må sees i sammenheng med Vaulaelva.'],
      ['saltana_les_fjellplasseringen', 'Les fjellplasseringen', 'Fra trygg etablert ferdsel eller kart: finn hvilke høyder, daler eller vann som gjør Saltåna til et tydelig fjellvassdrag.', 'NVE framhever beliggenheten i fjellet som del av vernegrunnlaget.'],
      ['saltana_finn_restfeltet', 'Finn restfelt-perspektivet', 'Se på kartet etter tekniske vannkraftanlegg i regionen og sammenlign med det vernede landskapet. Ikke oppsøk tekniske installasjoner.', 'Vassdraget er verdifullt som restfelt i en ellers sterkt vannkraftutbygd region.'],
      ['saltana_skill_vern_og_kraft', 'Skill vern fra kraftverk', 'Finn i kartdata Saltåno kraftverk som eget teknisk punkt og forklar hvorfor det ikke er det samme som History Go-markøren for det vernede vassdraget.', 'NVE registrerer både verneverdien og et kraftverk i vassdragsområde 042.32Z; disse må ikke blandes sammen.']
    ],
    natureSummary: 'Saltåna er et vernet fjellvassdrag i Etne som NVE framhever for sin plassering i et attraktivt landskap, sin betydning for friluftslivet og rollen som restfelt i en ellers sterkt vannkraftutbygd region. Det særpregede ved vernegrunnlaget er at vassdraget ikke skal leses isolert: NVE sier uttrykkelig at vernet må sees i sammenheng med Vaulaelva. Det gjør Saltåna til et godt eksempel på landskapsvern som nettverk. To nabovassdrag kan hver for seg være små på kartet, men sammen bevare en større fjell- og vannsammenheng. Samtidig viser NVE sine energiregistre at vassdragsområde 042.32Z også har teknisk energibruk. Saltåno kraftverk er registrert i drift fra 2011 med maksimal ytelse 0,3 MW, brutto fallhøyde 92 meter og midlere årsproduksjon 0,9 GWh. En tidligere konsesjonssak for Saltåna minikraftverk ble avgjort som konsesjonsfri i 2005. Disse opplysningene skal brukes med presis avgrensning: History Go-markøren representerer det vernede vassdragets natur- og landskapsverdi, ikke selve kraftverket, og kraftverksdataene viser at vern og bruk kan eksistere i ulike deler eller nivåer av samme vassdragsområde. Natur-rundingen skal derfor lære spilleren tre ting samtidig: hvordan fjellvassdrag henger sammen over landskapet, hvorfor restfelt får større verdi når naboområder er utbygd, og hvorfor tekniske anlegg må skilles fra selve naturankeret. Alle fysiske oppgaver skal gjøres fra trygg etablert ferdsel og aldri ved kraftverksinstallasjoner, inntak, bratte elveløp eller umerket høyfjell.',
    themes: ['vernet fjellvassdrag', 'Vaulaelva-sammenheng', 'restfelt', 'friluftsliv', 'vern og bruk', 'vannkraftkontekst'],
    nearby: ['vaulaelva_vassdraget', 'langfoss_etne', 'akrafjorden'],
    boundaries: ['History Go-markøren representerer det vernede vassdraget, ikke Saltåno kraftverk.', 'Kraftverksdata brukes som kontekst for vern og bruk og skal ikke flyttes til naturankeret som fysisk plassering.', 'Ingen oppgave skal sende spilleren til inntak, kraftverk, bratt elv eller umerket fjellterreng.'],
    training: {
      title: 'Karttrening i et sammenhengende vernelandskap',
      summary: 'Tre lette øvelser for å lese nabovassdrag, restfelt og tekniske punkt uten å oppsøke risikoområder.',
      safety: 'Bruk bare offentlig vei, merket sti eller annen trygg etablert ferdsel. Ikke oppsøk kraftverksinntak, tekniske installasjoner, bratte elveløp eller umerket høyfjell som del av øvelsene. Kartdata brukes til sammenligning; fysisk nærhet er ikke nødvendig.',
      exercises: [
        { id: 'saltana_kartpar', title: 'Kartpar: Saltåna og Vaulaelva', instruction: 'Finn begge vassdragene på kartet og marker hvor de ligger i forhold til hverandre.', duration_minutes: 6, intensity: 'svært lett', why: 'Øvelsen gjør NVEs krav om å lese vernet i sammenheng konkret.' },
        { id: 'saltana_restfelt_runde', title: 'Restfelt-runden', instruction: 'Gå rolig i opptil åtte minutter på trygg ferdselslinje og finn ett naturtrekk som virker lite teknisk påvirket. Kontroller deretter regionens kraftanlegg på kart.', duration_minutes: 8, intensity: 'lett', why: 'Kontrasten mellom landskap og teknisk region forklarer restfeltverdien.' },
        { id: 'saltana_vern_bruk_stopp', title: 'Vern-og-bruk-stopp', instruction: 'Stå stille og formuler én setning som skiller det vernede vassdraget fra kraftverket registrert i samme vassdragsområde.', duration_minutes: 4, intensity: 'svært lett', why: 'Presis begrepsbruk hindrer at natur- og energidata blandes sammen.' }
      ]
    },
    civication: [
      ['saltana_vaula_parmodell', 'Saltåna–Vaula-parmodellen', 'landskapsmodell', 'En fysisk dobbeltmodell som viser de to vernede nabovassdragene side om side.', 'NVE sier at Saltånas vern må sees i sammenheng med Vaulaelva.', 'Gjør landskapsvern som nettverk konkret.'],
      ['saltana_restfelt_brikke', 'Restfelt-brikken', 'verneobjekt', 'En fysisk brikke der et lite vernet vannsystem ligger omgitt av symboler for vannkraftutbygging.', 'Restfeltverdien er en eksplisitt del av NVEs vernegrunnlag for Saltåna.', 'Viser hvorfor gjenværende lite påvirkede felt kan få økt verdi.'],
      ['saltana_04232z_kort', '042.32Z-kortet', 'vassdragskort', 'Et fysisk kort med vassdragsområde 042.32Z og separate symboler for naturvern og kraftverk.', 'NVE bruker samme vassdragsområde i kraftverksregistreringen.', 'Lærer spilleren å skille områdeidentitet fra enkeltanlegg.'],
      ['saltana_vern_bruk_overlay', 'Vern-og-bruk-overlayet', 'kartobjekt', 'To transparente fysiske kartlag: ett for vernegrunnlag og ett for teknisk energibruk.', 'Saltåna er spesielt egnet til å vise at verne- og energidata må leses i riktige geografiske lag.', 'Gjør kildeavgrensning til et samlerobjekt.']
    ],
    brands: [
      { id: 'nve', name: 'Norges vassdrags- og energidirektorat', brand_kind: 'public_actor', brand_type: 'watercourse_and_energy_management' },
      { id: 'etne_kommune', name: 'Etne kommune', brand_kind: 'public_actor', brand_type: 'municipality' },
      { id: 'saltano_kraft_as', name: 'Saltåno Kraft AS', brand_kind: 'energy_actor', brand_type: 'hydropower_owner' },
      { id: 'vaulovassdraget', name: 'Vaulovassdraget', brand_kind: 'protected_watercourse_identity', brand_type: 'related_protected_watercourse' },
      { id: 'kartverket', name: 'Kartverket', brand_kind: 'public_actor', brand_type: 'place_name_authority' }
    ],
    forNa: {
      title: 'Et vernet landskap med teknisk energibruk i samme vassdragsområde',
      before: 'I 2005 ble en konsesjonssak for Saltåna minikraftverk avgjort som konsesjonsfri, før det registrerte Saltåno kraftverket senere ble satt i drift.',
      now: 'NVE registrerer Saltåno kraftverk i drift fra 2011 med 0,3 MW maksimal ytelse, samtidig som vernegrunnlaget for Saltåna fortsatt framhever fjellandskap, friluftsliv, restfelt og sammenhengen med Vaulaelva.',
      change: 'Vassdragsområdet kan derfor ikke leses som enten bare vernet natur eller bare energianlegg; geografiske lag og konkrete inngrep må skilles presist.',
      lookFor: ['fjellandskapet', 'forholdet til Vaulaelva på kart', 'områder uten synlige tekniske inngrep', 'kraftverk som separat kartpunkt', 'skillet mellom vassdrag og anlegg']
    },
    story: {
      id: 'st_saltana_vernet_som_ma_leses_sammen',
      title: 'Vernet som må leses sammen med naboen',
      summary: 'Saltåna viser at et vernet vassdrag kan få sin fulle verdi først når det leses som del av et større fjellandskap.',
      text: 'Noen verneområder forklares best alene. Saltåna er ikke et av dem. I NVEs verneoversikt står det uttrykkelig at vernet må sees i sammenheng med Vaulaelva.\n\nDet betyr at kartgrensen ikke er hele historien. Saltåna inngår i et attraktivt fjellandskap og er viktig for friluftslivet, men verdien øker også fordi vassdraget er et restfelt i en region som ellers er sterkt preget av vannkraftutbygging. Sammen med Vaulaelva bevarer det en større vann- og landskapssammenheng enn hvert felt kan vise alene.\n\nSamtidig finnes det teknisk energibruk i samme vassdragsområde. NVE registrerer Saltåno kraftverk i drift fra 2011. Dette gjør stedet faglig interessant, men krever presisjon. Kraftverket er ikke det samme som History Go-markøren for det vernede vassdraget. Et vassdragsområde kan inneholde både naturverdier og tekniske inngrep, og kildene må leses geografisk.\n\nFor spilleren blir oppgaven derfor å se sammenhenger uten å blande nivåene. Saltåna skal finnes i forhold til Vaulaelva, restfeltet skal forstås i forhold til en utbygd region, og kraftverket skal leses som et separat teknisk punkt.\n\nDet er kanskje den viktigste historien her: Naturforvaltning handler ikke bare om å sette en grønn ring på kartet. Den handler om å vite hva ringen gjelder, hva som ligger ved siden av den, og hvordan vern og bruk faktisk fordeler seg i landskapet.'
    },
    article: {
      title: 'Saltåna',
      popup: 'Vernet fjellvassdrag som NVE sier må leses i sammenheng med Vaulaelva og som restfelt i en vannkraftutbygd region.',
      paragraphs: [
        'Saltåna er ført i NVEs verneplanoversikt for Vestland. Vernegrunnlaget framhever beliggenheten i fjellet, et attraktivt landskap, friluftsliv og rollen som restfelt.',
        'NVE sier uttrykkelig at Saltånas vern må sees i sammenheng med Vaulaelva. De to vassdragene skal derfor forstås som deler av en større vernesammenheng.',
        'Restfelt betyr at gjenværende lite påvirkede eller vernede vassdrag kan få særlig verdi i en region der mange andre felt er teknisk utbygd.',
        'NVE registrerer også Saltåno kraftverk i vassdragsområde 042.32Z. Kraftverket ble satt i drift i 2011 og har maksimal ytelse 0,3 MW, brutto fallhøyde 92 meter og midlere årsproduksjon 0,9 GWh.',
        'En konsesjonssak for Saltåna minikraftverk ble avgjort som konsesjonsfri i 2005. Disse energidataene er et separat lag og betyr ikke at History Go-markøren ligger ved kraftverket.',
        'Rundingsprofilen bruker derfor Saltåna til å lære forskjellen mellom vassdrag, vernegrunnlag, vassdragsområde og enkeltanlegg.'
      ],
      facts: [
        ['01', 'Vernet fjellvassdrag', 'Saltåna står i NVEs verneplanoversikt for Vestland.'],
        ['02', 'Attraktivt landskap', 'Beliggenheten i fjellet inngår i vernegrunnlaget.'],
        ['03', 'Sammen med Vaulaelva', 'NVE sier at vernet må sees i sammenheng med Vaulaelva.'],
        ['04', 'Friluftsliv', 'Vassdraget er viktig for friluftslivet.'],
        ['05', 'Restfelt', 'Saltåna er verdifullt som restfelt i en sterkt vannkraftutbygd region.'],
        ['06', '042.32Z', 'NVE registrerer Saltåno kraftverk i vassdragsområde 042.32Z.'],
        ['07', 'I drift fra 2011', 'Saltåno kraftverk er registrert i drift fra 2011.'],
        ['08', '0,3 MW', 'Kraftverkets registrerte maksimale ytelse er 0,3 MW.'],
        ['09', '92 meters fall', 'Kraftverket har registrert brutto fallhøyde på 92 meter.'],
        ['10', 'Separat teknisk punkt', 'Kraftverket er ikke det samme som History Go-markøren for det vernede vassdraget.']
      ]
    },
    sources: sourceSets.saltana
  }
};

const makeTask = ([id, title, instruction, why]) => ({ id, title, instruction, why });
const makeCivi = ([id, title, type, desc, reason, functionText]) => ({
  id, title, type, kind: 'physical_object', desc,
  placeSpecificReason: reason,
  historicalFunction: functionText,
  physicalObject: true,
  placeSpecific: true,
  storePrice: 35,
  currency: 'PC',
  collection: 'etne_natur',
  collectable: true
});

const stories = [];
const articles = [];
for (const [id, cfg] of Object.entries(configs)) {
  const rows = await readJson(cfg.file);
  const place = rows.find((row) => row.id === id);
  if (!place) throw new Error(`Missing place ${id}`);
  if ('rounds' in place || 'rundinger' in place) throw new Error(`${id} has manual round override`);
  place.tasks_profile = { title: `Oppgaver ved ${place.name}`, summary: 'Fire kildeledede og sikkerhetsavgrensede stedshandlinger.', tasks: cfg.tasks.map(makeTask) };
  place.nature_profile = {
    type: place.nature_profile?.type || 'vernet natur- og vannlandskap',
    title: place.nature_profile?.title || place.name,
    summary: cfg.natureSummary,
    themes: cfg.themes,
    nearby_place_ids: cfg.nearby,
    source_boundaries: cfg.boundaries
  };
  place.training_profile = cfg.training;
  place.civication_store = cfg.civication.map(makeCivi);
  place.brands = cfg.brands;
  place.for_na = { ...cfg.forNa, sources: cfg.sources.map((s) => s.url) };
  await writeJson(cfg.file, rows);

  stories.push({
    id: cfg.story.id,
    type: 'environmental',
    title: cfg.story.title,
    year: place.year ?? null,
    place_id: id,
    person_id: null,
    summary: cfg.story.summary,
    story: cfg.story.text,
    sources: cfg.sources,
    tags: place.tags || [],
    related_people: [],
    related_places: cfg.nearby,
    score: { narrative: 5, historical: 4, source: 5, play_value: 5, originality: 4, total: 23 },
    arc: { start: cfg.story.summary, middle: cfg.forNa.change, end: cfg.boundaries[0] },
    next_scenes: cfg.nearby.slice(0, 2).map((place_id) => ({ place_id, reason: `Neste naturledd fra ${place.name}.` }))
  });

  articles.push({
    place_id: id,
    visual: { designCode: 'article_nature_route_miniature' },
    version: 2,
    title: cfg.article.title,
    popupDesc: cfg.article.popup,
    wikiText: cfg.article.paragraphs,
    summary: { one_liner: cfg.article.popup, themes: cfg.themes, tone: ['nøktern', 'faglig', 'stedsspesifikk', 'sikkerhetsstyrt'] },
    facts: cfg.article.facts.map(([suffix, label, desc]) => ({ id: `fact_${id}_${suffix}`, label, desc, confidence: 'high', sources: [cfg.sources[0].title] })),
    chronology: [
      { id: `chrono_${id}_01`, year: place.year ?? null, period: place.period || 'Dokumentert verne- eller naturhistorie', desc: cfg.forNa.before, confidence: 'high', sources: [cfg.sources[0].title] },
      { id: `chrono_${id}_02`, year: 2026, period: 'Komplett rundingsprofil', desc: 'History Go samler kildeledet naturinnhold og sikkerhetsavgrenset gameplay for stedet.', confidence: 'high', sources: ['History Go place data'] }
    ],
    sources: cfg.sources.map((s, i) => ({ id: `source_${id}_${String(i + 1).padStart(2, '0')}`, label: s.title, type: 'official', url: s.url, confidence: 'high' })),
    interpretation: {
      what_to_notice: cfg.forNa.lookFor,
      why_it_matters: [cfg.story.summary, cfg.forNa.change],
      counterpoints: cfg.boundaries
    },
    links: { entry_ids: [cfg.story.id], related_places: cfg.nearby, related_people: [] }
  });
}

await writeJson(storyPath, stories);
await writeJson(articlePath, articles);

const storyManifest = await readJson('data/stories/stories_manifest.json');
for (const id of Object.keys(configs)) {
  if (!storyManifest.files.some((x) => x.entity_id === id && x.path === storyPath)) {
    storyManifest.files.push({ category: 'natur', entity_id: id, path: storyPath });
  }
}
await writeJson('data/stories/stories_manifest.json', storyManifest);

const leksikonManifest = await readJson('data/leksikon/manifest.json');
if (!leksikonManifest.files.includes(articlePath)) leksikonManifest.files.push(articlePath);
await writeJson('data/leksikon/manifest.json', leksikonManifest);

const testPath = 'tests/etne-natur-rounds-batch3.test.js';
const targetFiles = Object.fromEntries(Object.entries(configs).map(([id, cfg]) => [id, cfg.file]));
const testSource = `const assert = require('assert');\nconst fs = require('fs');\nconst path = require('path');\nconst repo = path.resolve(__dirname, '..');\nconst readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));\nconst runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');\nconst m = runtime.match(/natur:\\s*\\[([^\\]]+)\\]/);\nassert(m, 'runtime mangler naturprofil');\nconst expected = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];\nassert.deepStrictEqual(JSON.parse('[' + m[1] + ']'), expected);\nconst targets = ${JSON.stringify(targetFiles)};\nconst stories = readJson('${storyPath}');\nconst articles = readJson('${articlePath}');\nconst storyManifest = readJson('data/stories/stories_manifest.json');\nconst leksikonManifest = readJson('data/leksikon/manifest.json');\nfor (const [id, file] of Object.entries(targets)) {\n const place = readJson(file).find(x => x.id === id);\n assert(place, 'mangler ' + id);\n assert(!('rounds' in place) && !('rundinger' in place));\n const story = stories.find(x => x.place_id === id);\n const article = articles.find(x => x.place_id === id);\n const content = { tasks: place.tasks_profile, nature: place.nature_profile, badges: place.underbadge_ids, training: place.training_profile, civication: place.civication_store, brands: place.brands, før_nå: place.for_na, fortellinger: story ? [story] : [], leksikon: article ? [article] : [] };\n assert.deepStrictEqual(Object.keys(content), expected);\n for (const [roundId, value] of Object.entries(content)) assert(Array.isArray(value) ? value.length > 0 : value && typeof value === 'object', id + ' mangler ' + roundId);\n assert.strictEqual(place.tasks_profile.tasks.length, 4);\n assert.strictEqual(place.training_profile.exercises.length, 3);\n assert(place.civication_store.length === 4 && place.civication_store.every(x => x.physicalObject && x.placeSpecific));\n assert(place.brands.length >= 5);\n assert(place.nature_profile.summary.length >= 1200);\n assert(place.nature_profile.source_boundaries.length >= 3);\n assert(story && story.sources.length >= 3);\n assert(article && article.facts.length >= 10 && article.sources.length >= 3);\n assert(storyManifest.files.some(x => x.entity_id === id && x.path === '${storyPath}'));\n}\nassert(leksikonManifest.files.includes('${articlePath}'));\nconst vaula = readJson(targets.vaulaelva_vassdraget)[0];\nassert(/1980/.test(JSON.stringify(vaula)) && /2005/.test(JSON.stringify(vaula)));\nconst sandvik = readJson(targets.sandvikevatnet_etne)[0];\nassert(/328/.test(JSON.stringify(sandvik)) && /0,5/.test(JSON.stringify(sandvik)));\nconst salt = readJson(targets.saltana_etne)[0];\nassert(/ikke.*kraftverket|ikke det samme som.*kraftverket/i.test(JSON.stringify(salt)));\nconsole.log('Etne nature rounds batch 3 OK');\n`;
await writeText(testPath, testSource);

await writeJson(`${reportDir}/summary.json`, {
  batch: 'Etne nature rounds batch 3',
  date: '2026-07-23',
  places: Object.keys(configs),
  rounds: expectedRounds,
  content: Object.fromEntries(Object.keys(configs).map((id) => [id, { tasks: 4, trainingExercises: 3, civicationObjects: 4, brands: configs[id].brands.length, storyId: configs[id].story.id, articlePath }])),
  sourcePrinciples: ['official-source-led', 'no manual rounds override', 'no unsafe access implication', 'protected watercourse kept distinct from power-plant point', 'broad anchors treated as area/line anchors']
});
await writeText(`${reportDir}/README.md`, '# Etne natur – rundingsbatch 3\n\nKomplette naturprofiler for Sandvikevatnet, Vaulaelva/Vaulovassdraget og Saltåna.\n\nKildegrunnlag: NVE, Etne kommune og eksisterende canonical place-data. Saltåna-profilen skiller eksplisitt det vernede vassdraget fra Saltåno kraftverk som separat teknisk punkt.\n');

let output = '';
try {
  output = execFileSync(process.execPath, [testPath], { cwd: root, encoding: 'utf8' });
} catch (error) {
  output = `${error.stdout || ''}${error.stderr || ''}`;
  await writeText(`${reportDir}/validation/round-content-test.txt`, output);
  throw error;
}
await writeText(`${reportDir}/validation/round-content-test.txt`, output);
console.log('Etne nature rounds batch 3 generated and validated.');
