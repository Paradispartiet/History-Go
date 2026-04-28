#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const workModelPath = path.join(repoRoot, 'data', 'Civication', 'workModels', 'naeringsliv_work_model.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function choice(id, label, effect, tags, feedback) {
  return { id, label, effect, tags, feedback };
}

const ekspeditorTemplates = [
  {
    family: 'kasse_og_pris',
    mail_type: 'job',
    task_domain: 'kasse',
    competency: 'noyaktighet',
    pressure: 'ko_bygger_seg_opp',
    choice_axis: 'tempo_vs_korrekthet',
    consequence_axis: 'kundetillit',
    narrative_arc: 'forste_uke_pa_gulvet',
    scenarios: [
      {
        key: 'prisavvik',
        subject: 'Prisavvik i kassa – kunden har sett tilbudsskiltet',
        summary: 'Kassa viser høyere pris enn skiltet i hylla, og køen bygger seg opp.',
        situation: [
          'En kunde kommer til kassa med en vare som går inn til høyere pris enn skiltet i hylla.',
          'Bak kunden bygger køen seg opp, og du kjenner presset mot å bare få transaksjonen unna.',
          'Du må velge mellom tempo, korrekthet og kundens opplevelse av å bli tatt på alvor.'
        ],
        choices: [
          choice('A', 'Stopp opp, sjekk skiltet og korriger hvis kunden har rett', 1, ['noyaktighet', 'kundetillit', 'rutine'], 'Du taper litt tempo, men beskytter både kunden og butikkens troverdighet.'),
          choice('B', 'Si at kassa gjelder og send kunden videre til kundeservice', -1, ['tempo', 'friksjon', 'lav_service'], 'Køen går raskere, men kunden opplever at problemet skyves bort.'),
          choice('C', 'Gi rabatt uten å sjekke skiltet', 0, ['service', 'svinn_risiko', 'snarvei'], 'Kunden blir fornøyd nå, men du lærer ikke om systemet eller skiltet faktisk er feil.')
        ]
      },
      {
        key: 'gavekort_feiler',
        subject: 'Gavekortet virker ikke mens køen vokser',
        summary: 'En kunde vil betale med gavekort, men terminalen avviser kortet.',
        situation: [
          'En kunde legger gavekortet på disken og sier at det ble kjøpt i går.',
          'Terminalen avviser kortet to ganger, og kunden begynner å bli synlig flau.',
          'Bak kunden ser du at køen flytter vekten fra fot til fot.'
        ],
        choices: [
          choice('A', 'Forklar rolig hva du sjekker, og be om hjelp før kunden mister ansikt', 1, ['kundebehandling', 'noyaktighet', 'kollega_tillit'], 'Du holder kunden inne i prosessen og hindrer at teknisk feil blir sosial ydmykelse.'),
          choice('B', 'Be kunden gå til siden mens du tar neste i køen', 0, ['tempo', 'risiko_for_friksjon'], 'Køen går videre, men kunden føler seg parkert med problemet alene.'),
          choice('C', 'Si at gavekortet ikke fungerer og avslutt forsøket', -1, ['lav_service', 'kundetillit_minus'], 'Du avslutter saken raskt, men uten å undersøke om butikken faktisk kan løse den.')
        ]
      },
      {
        key: 'retur_uten_kvittering',
        subject: 'Retur uten kvittering rett før vaktskifte',
        summary: 'En kunde vil returnere en vare uten kvittering mens vaktskiftet nærmer seg.',
        situation: [
          'Kunden sier varen er kjøpt her, men har ingen kvittering.',
          'Du vet at returreglene finnes av en grunn, men du ser også at varen virker ubrukt.',
          'Vaktskiftet nærmer seg, og den som skal ta over, venter allerede ved kassa.'
        ],
        choices: [
          choice('A', 'Følg returprosedyren og forklar rolig hvilke alternativer kunden har', 1, ['regel', 'kundebehandling', 'noyaktighet'], 'Du setter grense uten å gjøre kunden til motpart.'),
          choice('B', 'Godta returen for å bli ferdig før vaktskiftet', -1, ['snarvei', 'svinn_risiko', 'tempo'], 'Du løser øyeblikket, men svekker sporbarheten.'),
          choice('C', 'Avvis kunden kort og vis til reglene', 0, ['regel', 'lav_service'], 'Du har regelen på din side, men gjør situasjonen hardere enn nødvendig.')
        ]
      }
    ]
  },
  {
    family: 'kundemote_og_service',
    mail_type: 'job',
    task_domain: 'kundemote',
    competency: 'kundebehandling',
    pressure: 'kunde_er_stresset',
    choice_axis: 'service_vs_regel',
    consequence_axis: 'kundetillit',
    narrative_arc: 'kundenes_blikk',
    scenarios: [
      {
        key: 'produkt_du_ikke_kjenner',
        subject: 'Kunden spør etter noe du ikke kjenner',
        summary: 'En kunde spør etter et produkt du ikke vet hvor står.',
        situation: [
          'Kunden spør raskt og presist etter et produkt du ikke kjenner.',
          'Du kjenner butikken bedre enn første dag, men ikke godt nok til å svare sikkert.',
          'Du kan late som du vet, sende kunden videre eller bruke situasjonen til å lære kartet bedre.'
        ],
        choices: [
          choice('A', 'Si at du skal finne det ut, og følg kunden til riktig person eller hylle', 1, ['kundebehandling', 'produktkunnskap', 'laering'], 'Du viser at service også kan være å innrømme usikkerhet uten å slippe kunden.'),
          choice('B', 'Pek i den retningen du tror varen står', -1, ['snarvei', 'lav_service'], 'Det går fort, men kunden kan ende med å lete etter din gjetning.'),
          choice('C', 'Send kunden til kundeservice uten å undersøke mer', 0, ['rollegrense', 'lavt_eierskap'], 'Du sender saken videre, men lærer lite og eier ikke møtet.')
        ]
      },
      {
        key: 'dyr_vare_passer_ikke',
        subject: 'Den dyreste varen passer ikke best',
        summary: 'Kunden ber om anbefaling, men kampanjevaren er ikke det beste valget.',
        situation: [
          'En kunde ber om hjelp til å velge mellom to produkter.',
          'Den dyreste varen er på kampanje, og leder har minnet dere på mersalg denne uken.',
          'Du hører på behovet og skjønner at den billigere varen faktisk passer bedre.'
        ],
        choices: [
          choice('A', 'Anbefal varen som passer kundens behov best', 1, ['integritet', 'kundetillit', 'produktkunnskap'], 'Du bygger tillit på riktig behovsavklaring, ikke bare høyere salg.'),
          choice('B', 'Skyv kunden mot kampanjevaren fordi tallene teller denne uken', -1, ['salg', 'integritet_minus', 'kortsiktig'], 'Du kan øke salget nå, men svekker den faglige troverdigheten.'),
          choice('C', 'Forklar forskjellen og la kunden velge selv', 1, ['produktkunnskap', 'service', 'autonomi'], 'Du gjør kunden i stand til å velge og beholder faglig ryddighet.')
        ]
      }
    ]
  },
  {
    family: 'vareflyt_og_hylle',
    mail_type: 'job',
    task_domain: 'varepafylling',
    competency: 'vareflyt',
    pressure: 'lagerstatus_stemmer_ikke',
    choice_axis: 'tempo_vs_korrekthet',
    consequence_axis: 'driftsflyt',
    narrative_arc: 'varene_som_system',
    scenarios: [
      {
        key: 'tom_hylle_varen_finnes',
        subject: 'Hylla er tom, men systemet sier at varen finnes',
        summary: 'Lagerstatus og butikkgulv forteller to forskjellige historier.',
        situation: [
          'En kunde spør etter en vare som systemet sier er på lager.',
          'Hylla er tom, og bakrommet er fullt nok til at letingen kan spise mye tid.',
          'Du må velge mellom å stole på systemet, stole på gulvet eller undersøke avviket.'
        ],
        choices: [
          choice('A', 'Sjekk bakrommet og noter avviket hvis varen ikke finnes', 1, ['vareflyt', 'noyaktighet', 'driftsflyt'], 'Du gjør mer enn å hjelpe én kunde; du forbedrer butikkens bilde av seg selv.'),
          choice('B', 'Si at varen dessverre er utsolgt', 0, ['tempo', 'lav_kontroll'], 'Du sparer tid, men lar avviket leve videre.'),
          choice('C', 'Send kunden til en annen avdeling uten å sjekke', -1, ['lav_service', 'ansvar_minus'], 'Du flytter problemet uten å finne ut om systemet eller hylla tar feil.')
        ]
      },
      {
        key: 'kampanjeskilt_feil',
        subject: 'Kampanjeskiltet henger fortsatt oppe',
        summary: 'Et gammelt tilbudsskilt skaper feil forventning hos kundene.',
        situation: [
          'Du ser at kampanjeskiltet fra forrige uke fortsatt henger ved hylla.',
          'Det er travelt, og ingen har bedt deg ta skiltene nå.',
          'Samtidig vet du at hvert minutt skiltet henger, kan bli en ny prisdiskusjon i kassa.'
        ],
        choices: [
          choice('A', 'Ta ned skiltet og si fra til kassa om mulig prisforvirring', 1, ['vareflyt', 'noyaktighet', 'samarbeid'], 'Du kobler hylle og kasse sammen før feilen blir kundens problem.'),
          choice('B', 'La skiltet stå til noen med ansvar ser det', -1, ['ansvar_minus', 'friksjon'], 'Du holder deg til rollen, men lar en kjent feil fortsette.'),
          choice('C', 'Ta et bilde og melde det etter rush', 0, ['observasjon', 'utsettelse'], 'Du dokumenterer feilen, men løser ikke den akutte kundeeffekten.')
        ]
      }
    ]
  },
  {
    family: 'snarveier_og_rutine',
    mail_type: 'conflict',
    task_domain: 'samarbeid',
    competency: 'integritet',
    pressure: 'kollega_tar_snarvei',
    choice_axis: 'snarvei_vs_rutine',
    consequence_axis: 'kollega_tillit',
    narrative_arc: 'snarveien',
    scenarios: [
      {
        key: 'kollega_larer_snarvei',
        subject: 'Den raske måten alle gjør det på',
        summary: 'En erfaren kollega viser deg en snarvei som ikke står i rutinen.',
        situation: [
          'En erfaren kollega viser deg en raskere måte å registrere svinn på.',
          'Han sier at alle gjør det slik når det er travelt.',
          'Du ser at metoden sparer tid, men også at den gjør tallene mindre presise.'
        ],
        choices: [
          choice('A', 'Spør hvorfor rutinen finnes før du bruker snarveien', 1, ['integritet', 'laering', 'svinnkontroll'], 'Du gjør ikke kollegaen til fiende, men du gjør heller ikke snarveien usynlig.'),
          choice('B', 'Bruk snarveien fordi det er slik kulturen fungerer', -1, ['snarvei', 'svinn_risiko', 'tilhorighet'], 'Du passer inn raskere, men lærer en praksis som kan koste senere.'),
          choice('C', 'Nekt å gjøre det og si at dette er feil', 0, ['integritet', 'konflikt'], 'Du markerer grense, men kan miste en mulighet til å forstå praksisen før du utfordrer den.')
        ]
      }
    ]
  },
  {
    family: 'ny_kollega_og_tillit',
    mail_type: 'people',
    task_domain: 'samarbeid',
    competency: 'samarbeid',
    pressure: 'du_kan_ikke_alt_enna',
    choice_axis: 'hjelpe_vs_egen_oppgave',
    consequence_axis: 'kollega_tillit',
    narrative_arc: 'forste_uke_pa_gulvet',
    scenarios: [
      {
        key: 'ny_kollega_spor',
        subject: 'Ny kollega spør deg mens du selv henger etter',
        summary: 'En ny kollega trenger hjelp, men du har egne varer som skulle vært fylt på.',
        situation: [
          'En ny kollega stopper deg og spør hvordan returer skal legges inn.',
          'Du kan svaret, men du vet også at din egen hylle skulle vært ferdig før rush.',
          'Situasjonen tester om du ser samarbeid som forstyrrelse eller som del av driften.'
        ],
        choices: [
          choice('A', 'Hjelp kort og presist, og si hva du må tilbake til etterpå', 1, ['samarbeid', 'prioritering', 'kollega_tillit'], 'Du hjelper uten å miste egen oppgave helt av syne.'),
          choice('B', 'Si at du ikke har tid og be henne spørre noen andre', -1, ['tempo', 'kollega_tillit_minus'], 'Du beskytter egen oppgave, men gjør terskelen høyere for neste spørsmål.'),
          choice('C', 'Ta over hele returen for å få det riktig', 0, ['hjelp', 'lav_opplaring', 'tidspress'], 'Du løser saken, men lærer ikke kollegaen å mestre den selv.')
        ]
      }
    ]
  },
  {
    family: 'yrkesidentitet_pa_gulvet',
    mail_type: 'story',
    task_domain: 'butikkstandard',
    competency: 'service',
    pressure: 'du_vil_vaere_effektiv',
    choice_axis: 'synlighet_vs_arbeidsro',
    consequence_axis: 'faglig_rykte',
    narrative_arc: 'kundenes_blikk',
    scenarios: [
      {
        key: 'service_er_arbeid',
        subject: 'Service er ikke å smile hele tiden',
        summary: 'Du begynner å forstå at service er situasjonslesing, ikke bare høflighet.',
        situation: [
          'Etter noen vakter merker du forskjell på kunder som trenger fart, kunder som trenger trygghet og kunder som trenger avstand.',
          'Ingen av delene står tydelig i rutinene.',
          'Likevel er det ofte akkurat denne vurderingen som avgjør om dagen flyter.'
        ],
        choices: [
          choice('A', 'Bruk neste kundemøte til å lese behov før du foreslår løsning', 1, ['service', 'kundebehandling', 'situasjonslesing'], 'Du begynner å se service som fag, ikke bare personlighet.'),
          choice('B', 'Hold deg til samme høflige standard uansett kunde', 0, ['rutine', 'begrenset_tilpasning'], 'Det er trygt og ryddig, men ikke alltid presist.'),
          choice('C', 'Fokuser på tempo og la kundene styre resten selv', -1, ['tempo', 'lav_service'], 'Du får unna køen, men mister noe av arbeidet som skjer mellom ordene.')
        ]
      }
    ]
  },
  {
    family: 'travelt_gulv',
    mail_type: 'event',
    task_domain: 'butikkstandard',
    competency: 'prioritering',
    pressure: 'kampanje_ma_ferdigstilles',
    choice_axis: 'tempo_vs_korrekthet',
    consequence_axis: 'driftsflyt',
    narrative_arc: 'varene_som_system',
    scenarios: [
      {
        key: 'apning_kampanje_ikke_klar',
        subject: 'Åpning nærmer seg og kampanjen er ikke klar',
        summary: 'Butikken åpner snart, men kampanjeområdet mangler både skilt og varer.',
        situation: [
          'Det er tjue minutter til åpning.',
          'Kampanjeområdet mangler skilt, og halvparten av varene står fortsatt på pall.',
          'Du kan gjøre området pent, gjøre det riktig, eller få nok på plass til at dagen ikke starter i kaos.'
        ],
        choices: [
          choice('A', 'Prioriter riktige priser og nok varer fremfor perfekt uttrykk', 1, ['prioritering', 'noyaktighet', 'driftsflyt'], 'Du velger det som hindrer flest problemer når dørene åpner.'),
          choice('B', 'Gjør området pent først, selv om prisene må vente', 0, ['synlighet', 'prisrisiko'], 'Det ser bedre ut, men kan skape kasseproblemer.'),
          choice('C', 'La kampanjen stå og ta kassa først', -1, ['tempo', 'friksjon', 'ansvar_minus'], 'Du dekker ett behov, men lar kampanjen starte som feil.')
        ]
      }
    ]
  }
];

function buildCatalog(roleScope, type) {
  const families = [];
  ekspeditorTemplates
    .filter(t => t.mail_type === type)
    .forEach(t => {
      families.push({
        id: t.family,
        mails: t.scenarios.map((scenario, index) => ({
          id: `${roleScope}_${t.mail_type}_${scenario.key}_${String(index + 1).padStart(3, '0')}`,
          mail_type: t.mail_type,
          mail_family: t.family,
          role_scope: roleScope,
          subject: scenario.subject,
          summary: scenario.summary,
          situation: scenario.situation,
          task_domain: t.task_domain,
          competency: t.competency,
          pressure: t.pressure,
          choice_axis: t.choice_axis,
          consequence_axis: t.consequence_axis,
          narrative_arc: t.narrative_arc,
          choices: scenario.choices
        }))
      });
    });

  return {
    schema: 'civication_mail_family_catalog_v1',
    version: 1,
    category: 'naeringsliv',
    role_scope: roleScope,
    mail_type: type,
    families
  };
}

function buildPlan(roleScope) {
  return {
    schema: 'civication_mail_plan_v1',
    version: 1,
    id: `${roleScope}_naeringsliv_v1`,
    category: 'naeringsliv',
    role_scope: roleScope,
    title: 'Ekspeditør / butikkmedarbeider',
    purpose: 'Første Næringsliv-plan: konkrete arbeidssituasjoner på gulvet før spilleren får mer ansvar.',
    sequence: [
      { step: 1, phase: 'intro', type: 'job', allowed_families: ['kasse_og_pris'], fallback_types: ['people', 'story'] },
      { step: 2, phase: 'early', type: 'job', allowed_families: ['kundemote_og_service'], fallback_types: ['people', 'conflict'] },
      { step: 3, phase: 'early', type: 'people', allowed_families: ['ny_kollega_og_tillit'], fallback_types: ['job', 'story'] },
      { step: 4, phase: 'early', type: 'job', allowed_families: ['vareflyt_og_hylle'], fallback_types: ['conflict', 'event'] },
      { step: 5, phase: 'mid', type: 'conflict', allowed_families: ['snarveier_og_rutine'], fallback_types: ['job', 'people'] },
      { step: 6, phase: 'mid', type: 'story', allowed_families: ['yrkesidentitet_pa_gulvet'], fallback_types: ['job', 'people'] },
      { step: 7, phase: 'mid', type: 'event', allowed_families: ['travelt_gulv'], fallback_types: ['job', 'conflict'] },
      { step: 8, phase: 'advanced', type: 'job', allowed_families: ['kasse_og_pris', 'kundemote_og_service', 'vareflyt_og_hylle'], fallback_types: ['people', 'conflict'] },
      { step: 9, phase: 'advanced', type: 'people', allowed_families: ['ny_kollega_og_tillit'], fallback_types: ['story', 'job'] },
      { step: 10, phase: 'mastery', type: 'event', allowed_families: ['travelt_gulv'], fallback_types: ['conflict', 'story'] }
    ]
  };
}

function writeJson(relPath, value) {
  const full = path.join(repoRoot, relPath);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  console.log(`wrote ${relPath}`);
}

function main() {
  const workModel = readJson(workModelPath);
  const roleScope = process.argv[2] || 'ekspeditor';
  const validRole = (workModel.internal_role_ladder || []).some(r => r.role_scope === roleScope);
  if (!validRole) {
    console.error(`Unknown role_scope '${roleScope}' in work model`);
    process.exit(1);
  }

  writeJson(`data/Civication/mailPlans/naeringsliv/${roleScope}_plan.json`, buildPlan(roleScope));
  for (const type of ['job', 'people', 'conflict', 'story', 'event']) {
    writeJson(`data/Civication/mailFamilies/naeringsliv/${type}/${roleScope}_${type}.json`, buildCatalog(roleScope, type));
  }
}

main();
