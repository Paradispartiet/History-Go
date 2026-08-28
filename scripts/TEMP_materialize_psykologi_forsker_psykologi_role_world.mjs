#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const write = (rel, value) => {
  const target = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n');
};

const ROLE = 'forsker_psykologi';
const KEY = 'psykologi/forsker_psykologi';
const WORLD_PATH = 'data/Civication/roleWorlds/psykologi/forsker_psykologi.json';
const catalogPath = type => `data/Civication/mailFamilies/psykologi/${type}/forsker_psykologi_${type}.json`;
const refs = {
  job: `${catalogPath('job')}#psykologi_forsker_psykologi_job_analyseplan_001`,
  people: `${catalogPath('people')}#psykologi_forsker_psykologi_people_metodekritikk_001`,
  conflict: `${catalogPath('conflict')}#psykologi_forsker_psykologi_conflict_sterkere_resultat_001`,
  knowledge: `${catalogPath('knowledge')}#psykologi_forsker_psykologi_knowledge_planlagt_utforskende_001`,
  event: `${catalogPath('event')}#psykologi_forsker_psykologi_event_frist_data_001`,
  micro: `${catalogPath('micro')}#psykologi_forsker_psykologi_micro_figur_usikkerhet_001`,
  followup: `${catalogPath('followup')}#psykologi_forsker_psykologi_followup_analyseavvik_001`,
  story: `${catalogPath('story')}#psykologi_forsker_psykologi_story_sluttrapport_001`,
  consequence: `${catalogPath('consequence')}#psykologi_forsker_psykologi_consequence_robusthet_001`
};
const refCycle = Object.values(refs);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = { morning:'info', lunch:'conversation', afternoon:'task', evening:'private_consequence' };
const phaseThread = {
  morning:'analyseintegritet_og_sporbarhet',
  lunch:'metodekritikk_og_faglig_standing',
  afternoon:'partnerpress_personvern_og_formidling',
  evening:'forskeridentitet_og_privatrelation'
};
const dayThemes = [
  'Forskningsperioden åpnes før resultatene er lest. Primærutfall, hovedmodell og analysehistorikk må låses slik at senere standing hos prosjektleder eller partner aldri kan omskrive hva som faktisk var planlagt.',
  'Metodekollegaen viser svakere målekvalitet i en del av utvalget. Kritikken blir en sosial test: forskeren må tåle rework uten å lese innvendingen som statusangrep eller forkaste hele datagrunnlaget.',
  'Hovedanalysen er svak, mens et post hoc analysegrep gir en tydeligere effekt. Prosjektlederens leveransebehov er legitimt, men ønsket om en sterk fortelling kan ikke gi det nye funnet en forhåndsdefinert evidensstatus.',
  'Forskergruppen skiller planlagt fra utforskende analyse og dokumenterer tidspunktet for valgene. Metodekollegers tillit kan øke samtidig som prosjektets kortsiktige status oppleves mindre imponerende.',
  'En ekstern partner vil ha data og konklusjon før kvalitetskontroll og dataminimering er ferdig. Forskerens oppgave er å møte informasjonsbehovet uten å gjøre partnerstanding til tilgangsgrunnlag for persondata.',
  'Personvern- og forskningsetikkrådgiveren holder et datauttrekk tilbake til formål, minimering og sikker deling er avklart. Venting kan være frustrerende, men sosialt press skaper verken behandlingsgrunnlag eller forskningsetisk dispensasjon.',
  'En teknisk korrekt figur gjør usikkerheten mindre synlig enn punktestimatet. Manusarbeidet går til rework fordi visuell tydelighet er del av evidensformidlingen, ikke bare et spørsmål om design eller publiserbarhet.',
  'Sensitivitetsanalysen svekker effektstørrelsen. Forskeren må la robusthetsinformasjonen endre hovedteksten, selv om dette kan redusere kortsiktig standing hos aktører som har investert i den sterkere historien.',
  'Et nullfunn og en lovende utforskende analyse må eksistere samtidig. Forskergruppen trenger et handoff der begge funn beholder riktig kunnskapsstatus og neste studie får et avgrenset spørsmål i stedet for et løfte.',
  'En samarbeidspartner ber om en enklere formulering som kan brukes i beslutningsarbeid. Forskeren må oversette usikkerhet til en konkret bruksgrense uten å gjøre forskerrollen til klinisk eller lovregulert beslutningsmyndighet.',
  'Manusutkastet møter intern kritikk fordi robusthet og nullfunn ligger for langt bak i teksten. Reworken viser at forskningsmiljøets standing kan styrkes av mer synlig usikkerhet selv om kommunikasjonsflaten blir mindre dramatisk.',
  'Prosjektledelsen trenger en sluttrapport og ny søknad. Forskeren må skille prosjektets behov for framdrift fra evidensens styrke og vise hvilke deler som er etablert, utforskende, usikre eller fortsatt uavklart.',
  'Den eksterne partneren vender tilbake og spør hvor sikkert funnet kan brukes. En tidligere robusthetsbeslutning får nå praktisk konsekvens: begrensningen må følge kunnskapen ut av forskningsgruppen og inn i anvendelsen.',
  'Rollouten lukkes uten en samlet omdømmescore. Forskerens standing kan være ulik hos prosjektledelse, metodekolleger, partner, etikkfunksjon og forskningsmiljø, mens autorisasjon, datarettigheter og evidensstatus fortsatt bestemmes av andre kontrakter.'
];
const phaseTail = {
  morning:'Morgenen etablerer siste bekreftede analyse- og datastatus og gjør det eksplisitt hva som er planlagt, hva som er utforskende og hvilke beslutninger som fortsatt ikke kan tas.',
  lunch:'Lunsjflaten gjør den sosiale asymmetrien synlig: hvem belønner tempo, hvem belønner metodekritikk, og hvordan tillit kan divergere uten at sannhetsstatus eller formell myndighet flyttes.',
  afternoon:'Ettermiddagen bruker eksisterende Scene Pipeline til et konkret analyse-, personvern-, rapporterings- eller partnerproblem der standing aldri får erstatte sporbar metode eller gyldig datagrunnlag.',
  evening:'Kvelden viser skam, lettelse, prestasjonspress eller privat etterklang og holder forskerstatus atskilt fra personlig verdi; uferdige spørsmål kan forbli uferdige uten at de pyntes på.'
};

const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (const [pi, phase] of phases.entries()) {
    coverage.push({
      day,
      phase,
      beat_type: phaseTypes[phase],
      summary: `Dag ${day}, ${phase}: ${dayThemes[day - 1]} ${phaseTail[phase]}`,
      thread_ids: [phaseThread[phase]],
      materialization_refs: [refCycle[((day - 1) * 4 + pi) % refCycle.length]]
    });
  }
}

const theme_ids = [
  'professional_culture',
  'status_anxiety',
  'shame_reputation',
  'loyalty_up_down',
  'social_mask',
  'precarity',
  'bureaucratic_power',
  'public_attention'
];

const situated_reputation_model = {
  global_score_allowed:false,
  rule:'Standing er audience-spesifikk og kan divergere. Ingen global reputation-score kan brukes som evidens, psykologautorisasjon, klinisk myndighet, datatilgang eller erstatning for dokumentert analysehistorikk.',
  audiences:[
    {
      id:'project_leadership',
      standing_axis:'project_delivery_standing',
      cares_about:['sporbar framdrift og tydelige leveranser','at risiko, forsinkelse og analyseavvik blir synlige tidlig','at rapporten kan brukes uten at prosjektet lover mer enn dataene bærer'],
      cannot_grant:'evidensstatus, psykologautorisasjon, rett til å omskrive analysehistorikken eller rett til å overstyre forskningsetikk og personvern'
    },
    {
      id:'method_peers_and_coauthors',
      standing_axis:'method_peer_standing',
      cares_about:['datakvalitet og etterprøvbar analysehistorikk','åpen metodekritikk og robusthetstesting','tydelig skille mellom planlagt og utforskende analyse'],
      cannot_grant:'sannhetsstatus til et funn, klinisk myndighet eller rett til å skjule nullfunn og relevante analyseavvik'
    },
    {
      id:'ethics_privacy_governance',
      standing_axis:'ethics_privacy_standing',
      cares_about:['formålsavgrensning og dataminimering','trygg deling og dokumentert grunnlag','at frister ikke omgår etikk- eller personvernkontroll'],
      cannot_grant:'behandlingsgrunnlag, samtykke, tilgang til persondata eller dispensasjon fra sikkerhetskrav gjennom sosial tillit'
    },
    {
      id:'external_partners',
      standing_axis:'partner_application_standing',
      cares_about:['brukbare svar innen realistisk tid','presise bruksgrenser og forklaring av usikkerhet','forutsigbar status når datakvalitet eller personvern forsinker leveranse'],
      cannot_grant:'evidensstyrke, rådatatilgang, klinisk autoritet eller rett til å gjøre et utforskende funn til etablert beslutningsgrunnlag'
    },
    {
      id:'research_community_and_reviewers',
      standing_axis:'research_community_standing',
      cares_about:['transparent rapportering av nullfunn og robusthet','sporbare avvik fra analyseplan','påstander som er kalibrert mot design, utvalg og usikkerhet'],
      cannot_grant:'sannhet gjennom prestisje, fagfellekonsensus som erstatning for data eller klinisk myndighet uten separat kvalifikasjon'
    },
    {
      id:'private_relationships',
      standing_axis:'private_role_boundary_standing',
      cares_about:['at prosjektpress ikke blir hele personens egenverdi','at forskerrollen kan legges ned når andre eier neste steg','at kritikk og nullfunn kan bæres uten å bli privat skam'],
      cannot_grant:'arbeidsmyndighet, forskningsetisk godkjenning, autorisasjon eller evidensstatus'
    }
  ],
  divergence_examples:[
    'Å rapportere et tydelig nullfunn kan svekke kortsiktig standing hos prosjektleder eller partner som trenger en sterk leveranse, samtidig som metodekollegers og forskningsmiljøets tillit øker fordi evidenshistorikken bevares.',
    'Å la en sensitivitetsanalyse svekke hovedkonklusjonen kan oppleves som rework og tap av framdrift i prosjektet, men øke standing hos medforfattere og reviewers som trenger en robust og etterprøvbar rapport.',
    'Å nekte rådata før dataminimering og sikker deling er avklart kan skape partnerfriksjon, samtidig som standing hos personvern- og etikkfunksjonen øker fordi fristen ikke brukes som tilgangsgrunnlag.',
    'Å merke et attraktivt post hoc funn som utforskende kan redusere kortsiktig synlighet, men styrke langsiktig forskningsstanding fordi neste studie får et ærlig og testbart spørsmål.'
  ],
  authority_separation:'Standing kan påvirke hvem som har tillit til forskerens arbeid, men kan aldri gi psykologautorisasjon, diagnose- eller behandlingsmyndighet, tilgang til persondata eller rett til å overstyre etikk-, personvern- eller arbeidsgivermandat.',
  evidence_separation:'Standing kan aldri endre om en analyse var planlagt eller utforskende, gjøre et post hoc funn til forhåndsdefinert evidens, skjule et nullfunn eller gjøre en påstand sterkere enn datakvalitet, design og robusthetsanalyser bærer.'
};

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:'psykologi',
  role_scope:ROLE,
  title:'Forsker (psykologi) — etterprøvbarhet under resultat- og leveransepress',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Å bevare sporbarheten fra spørsmål til data til konklusjon når karriere, prosjektframdrift, publisering og eksterne behov belønner tydelige resultater raskere enn forskningsprosessen kan love dem.',
    description:'Role World-en lukker kun readiness-gjelden situated_reputation. Den eksisterende åtte-trinns mailplanen, alle ni mailtyper, akademisk kvalifikasjons- og ansettelsesgate, roleModel, work grammar og Scene Pipeline beholdes uendret. Standing blir eksplisitt audience-spesifikk uten å bli evidens, autorisasjon eller datatilgang.'
  },
  theme_ids,
  social_environments:[
    'Det fiktive analyserommet der analyseplan, hovedanalyse, sensitivitetskontroller og nullfunn holdes sporbare uten deltakeridentifiserbare opplysninger.',
    'Det fiktive prosjektmøtet der leveranse, finansiering, metodekritikk, datakvalitet og forskningsintegritet kan trekke i ulike retninger uten at prosjektlederen eier konklusjonen.',
    'Det fiktive manusverkstedet der hovedfunn, nullfunn, utforskende analyser og usikkerhet må bli til en lesbar rapport uten at sterk formidling overstyrer evidensstatus.',
    'Personvern- og etikkflaten der formål, minimering og trygg deling må være avklart før et datauttrekk kan gå videre, uavhengig av partnerens eller prosjektets statusbehov.',
    'Samarbeidsflaten med ekstern partner der anvendbarhet krever klare bruksgrenser og der ønsket om ett enkelt svar ikke kan gjøre et foreløpig funn sikkert.',
    'Forskningsmiljøet og fagfelleblikket der åpen rework, nullfunn og metodekritikk kan koste kortsiktig prestisje samtidig som langsiktig troverdighet styrkes.',
    'Privatlivet etter en svak analyse eller hard metodekritikk der forskerrollen må kunne legges ned uten at profesjonell standing blir total identitet.'
  ],
  recurring_people_archetypes:[
    {
      id:'psykologi_forsker_prosjektleder_world',
      social_function:'prosjektleder som eier leveranse, tidsplan og koordinering uten å eie hva dataene betyr',
      class_position:'formell prosjektleder med ressurs- og framdriftsmakt',
      status:'høy organisatorisk status i prosjektet',
      power_over_player:'kan prioritere oppgaver, synliggjøre frister og påvirke videre prosjektmuligheter, men kan ikke omskrive analysehistorikken eller gi klinisk autoritet',
      wants:'en tydelig leveranse som kan forklares til finansiering og samarbeidspartnere',
      conceals:'hvor fristende det er å lese metodisk forsiktighet som manglende handlekraft når prosjektet trenger et resultat',
      speech_style:'kort og leveranseorientert; spør hva som kan sies nå, hva som venter og hva neste beslutning krever',
      teaches_player:'at upward standing ikke skal kjøpes med sterkere påstander enn dataene bærer'
    },
    {
      id:'psykologi_forsker_metodekollega_world',
      social_function:'medforsker som utfordrer målekvalitet, analysevalg og robusthet slik at arbeidet kan etterprøves',
      class_position:'faglig likemann med høy situert metodisk autoritet',
      status:'høy faglig status på metode og analyse',
      power_over_player:'kan utløse rework og gjøre svak analyse synlig, men kan ikke alene erklære et funn sant',
      wants:'en analysehistorikk der innvendinger, avvik og sensitiviteter faktisk får påvirke fortolkningen',
      conceals:'at metodekritikk også kan være statuskamp og derfor må begrunnes i data og metode, ikke person',
      speech_style:'presis og kritisk; skiller planlagt, observert, robust, utforskende og ubesvart',
      teaches_player:'at kollegial kritikk kan øke kvalitet uten å bli sosial straff'
    },
    {
      id:'psykologi_forsker_personvernradgiver_world',
      social_function:'personvern- og forskningsetikkrådgiver som avklarer formål, minimering, sikkerhet og eskalering',
      class_position:'governancefunksjon med avgrenset, men reell stoppmakt på databruk',
      status:'høy situert status på data- og etikkgrenser',
      power_over_player:'kan holde et datauttrekk tilbake når grunnlag eller minimering er uavklart, uten å eie forskningskonklusjonen',
      wants:'at nyttig forskning gjennomføres med dokumenterbar og formålsbegrenset databruk',
      conceals:'at governance kan oppleves som treghet når krav kommer sent inn i prosjektet',
      speech_style:'avgrensende og dokumentorientert; spør formål, nødvendighet, tilgang og lagring før frist',
      teaches_player:'at tillit til forskeren ikke er et behandlingsgrunnlag for persondata'
    },
    {
      id:'psykologi_forsker_partner_world',
      social_function:'ekstern samarbeidspartner som trenger anvendbar kunnskap og skaper legitimt press for tydelige svar',
      class_position:'ekstern aktør med påvirkning på prosjektets relevans og videre samarbeid',
      status:'høy situert status på anvendelse og leveransebehov',
      power_over_player:'kan påvirke videre samarbeid og hvordan resultater tas i bruk, men kan ikke oppgradere usikker evidens til sikker kunnskap',
      wants:'et svar som kan brukes innen en konkret beslutnings- eller utviklingskontekst',
      conceals:'at organisasjonens behov for handlingsgrunnlag kan gjøre nyanser og nullfunn ubehagelige',
      speech_style:'praktisk og konklusjonsorientert; spør hva funnet betyr, hvor sikkert det er og hva som kan gjøres nå',
      teaches_player:'at anvendbarhet krever en tydelig grense for hva studien ikke støtter'
    },
    {
      id:'psykologi_forsker_reviewer_world',
      social_function:'generisk fagfelle eller redaksjonell leser som vurderer om påstander, analysehistorikk og usikkerhet er etterprøvbare',
      class_position:'ekstern faglig portvokter uten klinisk eller arbeidsgivermyndighet',
      status:'høy situert fagstatus i vurderingsøyeblikket',
      power_over_player:'kan kreve forklaring eller rework og påvirke publiseringsmulighet, men kan ikke skape evidens gjennom prestisje',
      wants:'at hovedfunn, nullfunn, utforskende analyser og robusthet kan skilles uten å rekonstruere prosjektet selv',
      conceals:'at reviewer-preferanser også kan være uenige og ikke må forveksles med sannhet',
      speech_style:'argumenterende og etterprøvbar; spør hva som var planlagt, hva som endret seg og hvorfor konklusjonen følger dataene',
      teaches_player:'at forskningsstanding bygges av sporbarhet mer enn av et spektakulært resultat'
    },
    {
      id:'psykologi_forsker_privathjem_world',
      social_function:'privat nær relasjon som møter personen etter nullfunn, kritikk og fristpress uten å være en del av prosjektet',
      class_position:'privat likemann uten faglig eller organisatorisk myndighet',
      status:'emosjonell nærhet uten profesjonell rang',
      power_over_player:'kan gjøre prestasjonsskammen synlig og utfordre forestillingen om at hver svak analyse er et personlig nederlag',
      wants:'at forskeren kan være til stede uten å gjøre hjemmet til et nytt reviewmøte',
      conceals:'at hun kan bli sliten når alle samtaler blir til forsvar av prosjektets verdi',
      speech_style:'uformell og direkte; spør hva som faktisk gikk galt, hva som bare var et nullfunn og hva som kan vente til i morgen',
      teaches_player:'at faglig standing er situert og ikke identisk med personlig verdi'
    }
  ],
  slow_axes:[
    {id:'analysis_traceability',meaning:'om skillet mellom planlagt, avvikende og utforskende analyse forblir lesbart gjennom hele prosjektet',runtime_binding:'editorial_only_until_governed'},
    {id:'method_peer_standing',meaning:'situert standing hos metodekolleger og medforfattere når kritikk, robusthet og rework behandles åpent',runtime_binding:'editorial_only_until_governed'},
    {id:'project_delivery_standing',meaning:'situert standing hos prosjektledelse når framdrift, risiko og leveranse kommuniseres uten falsk sikkerhet',runtime_binding:'editorial_only_until_governed'},
    {id:'ethics_privacy_standing',meaning:'situert standing hos etikk- og personvernfunksjoner basert på formålsavgrensning, dataminimering og trygg deling',runtime_binding:'editorial_only_until_governed'},
    {id:'partner_application_standing',meaning:'situert standing hos eksterne partnere når forskeren gir nyttige, men kalibrerte svar og bruksgrenser',runtime_binding:'editorial_only_until_governed'},
    {id:'research_community_standing',meaning:'situert faglig standing knyttet til transparent rapportering, nullfunn, robusthet og korrigerbarhet',runtime_binding:'editorial_only_until_governed'},
    {id:'data_quality_confidence',meaning:'om datakvalitet og målebegrensninger forblir synlige i analyse- og rapporteringsbeslutninger',runtime_binding:'editorial_only_until_governed'},
    {id:'private_role_boundary_standing',meaning:'om forskerrollen og profesjonell status kan skilles fra privat egenverdi og nærhet',runtime_binding:'editorial_only_until_governed'},
    {id:'null_finding_tolerance',meaning:'om prosjektet tåler at et metodisk godt nullfunn forblir et resultat i stedet for et problem som må skjules',runtime_binding:'editorial_only_until_governed'}
  ],
  season:{days:14,day_phases:phases,coverage},
  situated_reputation_model,
  primary_threads:[
    {id:'analyseintegritet_og_sporbarhet',beat_refs:['1/morning','3/morning','4/morning','7/morning','9/morning','12/morning','14/morning']},
    {id:'metodekritikk_og_faglig_standing',beat_refs:['2/lunch','4/lunch','7/lunch','8/lunch','11/lunch','14/lunch']},
    {id:'partnerpress_personvern_og_formidling',beat_refs:['5/afternoon','6/afternoon','10/afternoon','12/afternoon','13/afternoon','14/afternoon']},
    {id:'forskningsmiljo_og_review',beat_refs:['3/lunch','8/afternoon','9/lunch','11/afternoon','12/lunch','13/lunch']},
    {id:'forskeridentitet_og_privatrelation',beat_refs:['1/evening','3/evening','6/evening','8/evening','11/evening','14/evening']}
  ],
  private_aftermath:[
    {after_ref:'3/evening',summary:'Det sterke post hoc funnet er faglig interessant, men forskeren kjenner skam over at hovedanalysen ikke leverte historien prosjektet ønsket. Privatlivet minner om at nullfunn ikke er personlig svikt.'},
    {after_ref:'5/evening',summary:'Partnerfriksjonen etter et avgrenset data-nei følger hjem. Forskerrollen må tåle at profesjonell integritet kan gi kortsiktig sosial kostnad uten at kostnaden betyr at beslutningen var feil.'},
    {after_ref:'7/evening',summary:'En figur går tilbake til rework etter at usikkerheten viste seg for dårlig synlig. Kvelden skiller nødvendig faglig revisjon fra forestillingen om at en kritisert figur gjør hele prosjektet mislykket.'},
    {after_ref:'11/evening',summary:'Intern kritikk av manusutkastet treffer statusfølelsen hardere enn selve metodeargumentet. Den private etterklangen viser hvorfor profesjonell standing og personlig verdi må holdes som to ulike akser.'},
    {after_ref:'14/evening',summary:'Slutten er ikke en global omdømmeseier. Forskerens relasjoner kan vurdere arbeidet ulikt, mens den private relasjonen bare trenger at prosjektet ikke fortsetter som identitet hele kvelden.'}
  ],
  delayed_consequences:[
    {id:'analysis_plan_returns',setup_ref:'1/morning',return_ref:'3/morning',summary:'Det forhåndsdefinerte hovedsporet blir avgjørende når et sterkere post hoc resultat dukker opp og må få en annen evidensstatus.'},
    {id:'measurement_critique_returns',setup_ref:'2/lunch',return_ref:'8/lunch',summary:'Metodekritikken vender tilbake som sensitivitetsanalyse og svekker effekten nok til at hovedteksten må revideres.'},
    {id:'privacy_delay_returns',setup_ref:'5/afternoon',return_ref:'10/afternoon',summary:'Den avgrensede leveransen gjør det mulig å møte partneren senere med tryggere data og tydeligere bruksgrense fremfor å reparere et forhastet råuttrekk.'},
    {id:'figure_rework_returns',setup_ref:'7/afternoon',return_ref:'11/afternoon',summary:'Den reviderte figuren gjør robustheten synlig nok til at intern review kan rette kritikken mot konklusjonen i stedet for å oppdage skjult usikkerhet sent.'},
    {id:'exploratory_finding_returns',setup_ref:'4/morning',return_ref:'12/morning',summary:'Det utforskende funnet vender tilbake som et avgrenset neste-studie-spørsmål i stedet for å bli retroaktivt omdøpt til bekreftet hovedfunn.'},
    {id:'robustness_returns_to_partner',setup_ref:'8/afternoon',return_ref:'13/afternoon',summary:'Den svakere sensitivitetsanalysen får en praktisk konsekvens når partneren spør hvor sikkert resultatet kan brukes og forskeren må kalibrere anvendelsen.'}
  ],
  cross_role_link:{
    status:'not_required_for_rollout',
    materialized:false,
    new_runtime:false,
    rule:'Cross-role kobling materialiseres ikke i denne rollouten. Delt arbeid skal bare kobles når et genuint shared work object allerede finnes; plausible akademiske eller kliniske naboer er ikke nok.'
  },
  materialization:{
    authored_dimensions:['situated_reputation'],
    no_new_runtime:true,
    existing_plan_preserved:true,
    existing_role_model_preserved:true,
    existing_work_grammar_preserved:true,
    existing_academic_gate_preserved:true,
    cross_role_link_materialized:false,
    source_refs:refCycle
  }
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.category === 'psykologi' && row.role_scope === ROLE)) {
  index.roles.push({category:'psykologi',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
}
index.status = 'twenty_one_role_worlds_materialized';
index.effective_date = '2026-08-28';
index.note = 'Reference- og pilotbevisene består uendret. Psykologi Forsker er materialisert som kontrollert Role World-rollout med audience-spesifikk forskningsstanding; evidensstatus, psykologautorisasjon, personvern og datatilgang forblir separate kontrakter.';
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds = checklist.reference_worlds || [];
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);

fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_PSYKOLOGI_FORSKER_PSYKOLOGI_ROLE_WORLD_ROLLOUT.md'), `# Civication Psykologi Forsker Role World rollout\n\nDato: **2026-08-28**\n\n## Resultat\n\n- Rolle: \`${KEY}\`\n- Status: \`role_world_complete\`\n- Authored dimension: \`situated_reputation\`\n- Sesongdekning: **14 dager × 4 faser = ${coverage.length} beats**\n- Eksisterende mailprovenance: **${refCycle.length}/9 canonicale mailtyper**\n- Ny runtime: **nei**\n- Cross-role work object: **ikke materialisert; ikke påkrevd for rollout**\n\n## Kontrakt\n\nForskerens standing er eksplisitt audience-spesifikk mellom prosjektledelse, metodekolleger/medforfattere, etikk/personvern, eksterne partnere, forskningsmiljø/review og private relasjoner. Det finnes ingen global reputation-score. Standing kan aldri gi psykologautorisasjon, diagnose- eller behandlingsmyndighet, persondatatilgang eller gjøre et planlagt/utforskende analysevalg til en annen evidenstype.\n\nEksisterende åtte-trinns mailplan, ni mailkataloger, roleModel, work grammar, akademisk kvalifikasjons-/ansettelsesgate og Scene Pipeline er bevart.\n`);

console.log(`Materialized ${KEY}: ${coverage.length} beats, ${refCycle.length} source refs, situated reputation only`);
