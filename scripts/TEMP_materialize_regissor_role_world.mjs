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

const ROLE = 'regissor';
const KEY = 'film_tv/regissor';
const WORLD_PATH = 'data/Civication/roleWorlds/film_tv/regissor.json';
const PLAN_PATH = 'data/Civication/mailPlans/film_tv/regissor_plan.json';
const catalogPath = type => `data/Civication/mailFamilies/film_tv/${type}/regissor_${type}.json`;

const refs = {
  job: `${catalogPath('job')}#film_tv_regi_job_sceneplan_001`,
  people: `${catalogPath('people')}#film_tv_regi_people_blocking_001`,
  conflict: `${catalogPath('conflict')}#film_tv_regi_conflict_dekning_001`,
  story: `${catalogPath('story')}#film_tv_regi_story_grense_001`,
  event: `${catalogPath('event')}#film_tv_regi_event_lysfall_001`,
  micro: `${catalogPath('micro')}#film_tv_regi_micro_kontinuitet_001`,
  knowledge: `${catalogPath('knowledge')}#film_tv_regi_knowledge_carlmar_001`,
  followup: `${catalogPath('followup')}#film_tv_regi_followup_klipp_001`,
  consequence: `${catalogPath('consequence')}#film_tv_regi_consequence_dekning_001`
};
const TYPES = ['job','people','conflict','story','event','micro','knowledge','followup','consequence'];
const refCycle = TYPES.map(type => refs[type]);
const phaseTypes = { morning:'info', lunch:'conversation', afternoon:'task', evening:'private_consequence' };
const phaseThread = {
  morning:'sceneintensjon_og_dekning',
  lunch:'samarbeid_samtykke_og_tillit',
  afternoon:'tid_sikkerhet_og_produksjonsvalg',
  evening:'klipp_etterarbeid_og_regissoridentitet'
};
const dayThemes = [
  'Prosjektet starter med at sceneintensjon og nødvendig dekning skilles fra en ønskeliste av bilder, slik at regien kan prioritere før kamera går.',
  'Blocking-prøven viser at medvirkendes arbeid, kamera og lys må samordnes rundt samme vendepunkt i stedet for at én avdeling blir fasit.',
  'Dagsplanen strammes inn og regien må gjøre den fortellingskritiske dekningsprioriteringen eksplisitt før tidspresset gjør valget tilfeldig.',
  'En medvirkende setter en legitim grense og tvinger scenen til å finne en ny form uten at samtykke behandles som et hinder som kan forhandles bort.',
  'Lysforholdene endrer opptaksrekkefølgen og viser at kunstnerisk ledelse også er evnen til å velge hvilket materiale som må sikres først.',
  'Et lite kontinuitetsavvik ved monitoren gjør klippbarhet til et nåtidsproblem og ikke noe som automatisk kan skyves til etterarbeidet.',
  'Filmhistorisk kildebruk gir regissøren kontekst om praksis og kultur, men historiske profiler holdes tydelig adskilt fra dagens operative beslutningsmyndighet.',
  'Produksjonen går videre med færre perfekte bilder, men et tydeligere spor av hvilke kompromisser som ble gjort og hvorfor de fortsatt bærer sceneintensjonen.',
  'Relasjonene til produsent, fotograf og første regiassistent blir prøvd av at samme kunstneriske valg kan ha ulike budsjett-, sikkerhets- og gjennomføringskonsekvenser.',
  'Regissøren må tåle at en sterk opprinnelig idé ikke gir særrett til tid, samtykke eller sikkerhetsunntak når produksjonens andre beslutningseiere setter grenser.',
  'Første klipp returnerer materialet til regien og gjør forskjellen mellom planlagt intensjon og faktisk tilgjengelig dekning umulig å skjule.',
  'Noor prøver eksisterende materiale før pickup foreslås, slik at etterarbeidet diagnostiserer problemet før produksjonen påføres ny kostnad.',
  'En tidligere dekningssnarvei kommer tilbake som konkret klipperisiko og tvinger regissøren til å eie beslutningssporet uten å skyve ansvaret nedover.',
  'Sesongen avsluttes med at regissøren skiller kunstnerisk autoritet fra personlig status: god regi er samarbeid, prioritering og revisjon når materialet eller grensene krever det.'
];
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (const [pi, phase] of ['morning','lunch','afternoon','evening'].entries()) {
    const ref = refCycle[((day - 1) * 4 + pi) % refCycle.length];
    const phaseTail = phase === 'morning'
      ? 'Morgenen låser hva scenen eller materialet faktisk må oppnå før nye løsninger får prestisje.'
      : phase === 'lunch'
        ? 'Lunsjflaten gjør hvordan Sara, Martin, Leila og Noor leser regissørens samarbeid og grenser sosialt synlig.'
        : phase === 'afternoon'
          ? 'Ettermiddagen krever et konkret produksjonsvalg om dekning, blocking, tid, kontinuitet, sikkerhet eller eskalering til riktig eier.'
          : 'Kvelden viser hva kontrolltap, kompromiss og ønsket om å forsvare den opprinnelige planen gjør med regissørens profesjonsidentitet.';
    coverage.push({
      day,
      phase,
      beat_type: phaseTypes[phase],
      summary: `Dag ${day}, ${phase}: ${dayThemes[day - 1]} ${phaseTail}`,
      thread_ids: [phaseThread[phase]],
      materialization_refs: [ref]
    });
  }
}
const thread = (id, relationship, beat_refs) => ({ id, relationship, beat_refs });

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:'film_tv',
  role_scope:ROLE,
  title:'Regissør — sceneintensjon, samarbeid, grenser og klippbarhet',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Å lede en kunstnerisk helhet gjennom mennesker, avdelinger, tid og faktisk materiale uten at regissørstatus blir brukt til å overstyre sikkerhet, samtykke, produksjonsmandat eller det andre fagfunksjoner faktisk ser.',
    description:'Denne Role World-en materialiserer Regissørens allerede komplette ni-mail-type arbeidsflate som en 14-dagers sammenhengende produksjonsverden. Den følger sceneintensjon fra preproduksjon via blocking, dekningsprioritering, medvirkendegrense, lysfall og kontinuitet til filmhistorisk refleksjon, første klipp og konkret pickup-konsekvens. Ingen ny runtime eller kunstig authored debt introduseres.'
  },
  theme_ids:['professional_culture','status_anxiety','shame_reputation','loyalty_up_down','social_mask','bureaucratic_power','gender_sexuality','public_private_leakage'],
  social_environments:[
    'Regiens preproduksjonsrom der shotliste, sceneintensjon, avdelingsbehov og produksjonsmandat må gjøres forhandlingsbare før opptak.',
    'Filmsettet der medvirkende, fotografi, lys, lyd, tid, sikkerhet og samtykke møtes samtidig og gjør kunstneriske valg organisatoriske.',
    'Regimonitoren der et take må vurderes som både prestasjon, kontinuitet og fremtidig klipperessurs før settet går videre.',
    'Klipperommet der materialet som faktisk finnes kan motsi regissørens minne om hva scenen skulle ha blitt.',
    'Cinemateket i Oslo som read-only History Go-anker for norsk filmhistorie og regissørprofiler, ikke som dagens produksjonssett eller normativ fasit.',
    'Den private kvelden etter opptak eller klipp der regissørens offentlige sikkerhet kan falle sammen med tvil om kompromissene fortsatt bærer verket.'
  ],
  recurring_people_archetypes:[
    {id:'sara_produsent_regi',social_function:'produsent og beslutningseier for budsjett, hovedplan, større tidsavvik og eventuell pickup',class_position:'produksjonsleder med formell økonomisk og planmessig makt',status:'høy formell status',power_over_player:'kan godkjenne eller avvise større produksjonsomlegginger og vurdere om regien arbeider innen prosjektets rammer',wants:'en kunstnerisk tydelig regi som gjør konsekvenser og prioriteringer beslutningsbare før de blir kostnad',conceals:'hvor ofte produsentens eget behov for planstabilitet gjør kreative revisjoner sosialt dyrere enn de faglig burde være',speech_style:'kort, konkret og konsekvensorientert; spør hva scenen trenger, hva det koster og hvem som må beslutte',teaches_player:'at kunstnerisk ledelse blir sterkere når produksjonskonsekvensene er eksplisitte'},
    {id:'martin_fotograf_regi',social_function:'fotograf som gjør lys-, kamera-, blocking- og dekningskonsekvenser synlige',class_position:'avdelingsleder med høy situert fagstatus og eget fotografisk ansvar',status:'høy situert fagstatus',power_over_player:'kan gjøre regiplanen gjennomførbar eller synliggjøre at den kolliderer med lys, kamera eller tid',wants:'en sceneintensjon som er tydelig nok til at fotografiske kompromisser kan vurderes mot samme mål',conceals:'hvor sterkt fotografisk identitet også kan trekke mot et bilde som er vakrere enn scenen trenger',speech_style:'visuell og praktisk; beskriver linser, lys, bevegelse og hva kamera faktisk kan se',teaches_player:'at bildeplanen er et samarbeidende faglig svar, ikke regissørens private ordre'},
    {id:'leila_forste_regiassistent',social_function:'første regiassistent som beskytter dagsplan, settflyt og eskaleringslinjer for sikkerhet og gjennomføring',class_position:'operativ nøkkelrolle med sterk situert myndighet over settflyt og sikkerhetsprosedyrer',status:'høy situert arbeidsstatus',power_over_player:'kan stanse eller eskalere gjennomføringen når plan, sikkerhet eller samtykke ikke er avklart',wants:'en regi som prioriterer tydelig nok til at settet kan arbeide trygt og uten skjulte planendringer',conceals:'hvor mye tidspress hun selv bærer fra produksjonen når kunstneriske ønsker vokser sent i dagen',speech_style:'presis og tidsbevisst; spør hva som skjer nå, hva som faller bort og hvilken avklaring som mangler',teaches_player:'at tydelig prioritering og respekt for stoppgrenser er en del av regi, ikke et tap av regi'},
    {id:'noor_klipper_regi',social_function:'klipper som konfronterer regien med materialets faktiske rytme, kontinuitet og manglende dekning',class_position:'etterarbeidsspesialist med høy situert fagstatus, men uten produsentens budsjettfullmakt',status:'høy situert fagstatus',power_over_player:'kan vise at planlagt intensjon ikke finnes tydelig i materialet og dermed tvinge frem omstrukturering eller et presist pickup-behov',wants:'at regien diagnostiserer materialet som finnes før den forsvarer planen som var',conceals:'hvor ofte klipperens eget ønske om en elegant løsning kan gjøre alternative strukturer mer attraktive enn regissørens opprinnelige rytme',speech_style:'analytisk og materialnær; peker på konkrete takes, reaksjoner, overganger og rytmiske hull',teaches_player:'at etterarbeidsdommekraft begynner med å skille intensjon fra tilgjengelig materiale'},
    {id:'amalie_regissor_venn',social_function:'privat venn uten produksjonsmakt som møter spilleren etter dager med kunstnerisk ansvar og sosial eksponering',class_position:'privat relasjon uten arbeidsrang',status:'emosjonell nærhet uten produksjonsstatus',power_over_player:'kan utfordre behovet for å gjøre alle kompromisser til bevis på egen verdi som regissør',wants:'at spilleren kan beskrive tvil, ansvar og samarbeid uten å gjøre samtalen til en pitch for hvorfor alle valg var riktige',conceals:'at hun blir sliten av å møte en profesjonsmaske når hun forsøker å spørre hvordan spilleren faktisk har det',speech_style:'uformell og direkte; spør hvem som måtte gi seg, hva som faktisk ble bedre og hva som fortsatt gnager',teaches_player:'at regissørstatus ikke er det samme som personlig verdi eller retten til å ha siste ord'}
  ],
  slow_axes:[
    {id:'producer_trust',meaning:'Saras situerte tillit til at regissøren gjør kunstneriske prioriteringer og produksjonskonsekvenser synlige før eskalering',runtime_binding:'existing'},
    {id:'department_trust',meaning:'Martins og Leilas situerte tillit til at sceneintensjon brukes som felles mål og at andre faggrenser ikke underordnes regissørstatus',runtime_binding:'existing'},
    {id:'consent_and_safety_integrity',meaning:'om medvirkendegrenser og sikkerhetslinjer behandles som reelle rammer som kan kreve ny blocking eller bildeplan',runtime_binding:'existing'},
    {id:'coverage_debt',meaning:'hvor mye fortellings- og kontinuitetsrisiko som skyves fra settet til klipperommet når dekning droppes under tidspress',runtime_binding:'editorial_only_until_governed'},
    {id:'editability',meaning:'om sceneplan, reaksjoner, overganger og kontinuitet gir Noor faktisk materiale til å bygge vendepunkt og rytme',runtime_binding:'existing'},
    {id:'authority_clarity',meaning:'om kunstnerisk ledelse holdes adskilt fra sikkerhets-, samtykke-, kontrakts-, budsjett- og pickupmyndighet',runtime_binding:'existing'},
    {id:'historical_source_boundary',meaning:'om History Go-profiler brukes som kildeforankret filmhistorisk kontekst uten å bli fiktive rådgivere eller fasit',runtime_binding:'existing'},
    {id:'private_director_mask',meaning:'om behovet for å fremstå sikker og visjonær lekker inn i privat identitet etter produksjonskompromisser',runtime_binding:'editorial_only_until_governed'}
  ],
  season:{days:14,day_phases:['morning','lunch','afternoon','evening'],coverage},
  primary_threads:[
    thread('sceneintensjon_og_dekning','Hvordan sceneintensjon blir omgjort til nødvendig dekning, kontinuitet og klippbarhet uten at shotlisten blir et mål i seg selv.',['1/morning','2/morning','3/afternoon','5/morning','6/afternoon','8/morning','13/afternoon']),
    thread('samarbeid_samtykke_og_tillit','Forholdet til Martin, Leila og medvirkende der blocking, faggrenser og samtykke må forbli reelle også under tidspress.',['1/lunch','2/lunch','4/lunch','4/afternoon','6/lunch','9/lunch','12/lunch']),
    thread('tid_sikkerhet_og_produksjonsvalg','Forholdet mellom kunstnerisk ambisjon, dagsplan, lys, sikkerhet og Saras faktiske beslutningsmyndighet over større konsekvenser.',['3/morning','3/afternoon','5/afternoon','7/afternoon','9/afternoon','10/afternoon','12/afternoon']),
    thread('klipp_etterarbeid_og_regissoridentitet','Hvordan Noor og det faktiske materialet returnerer tidligere valg til regissøren som diagnose, omklipp eller begrunnet pickup.',['8/evening','10/evening','11/morning','11/afternoon','12/evening','13/evening','14/evening']),
    thread('filmhistorie_og_kildegrense','Hvordan canonical Film/TV-historie gir refleksjonskontekst uten å bli dagens produksjonsmyndighet eller normativ oppskrift.',['2/evening','4/evening','7/morning','7/evening','9/evening','11/evening'])
  ],
  private_aftermath:[
    {id:'shotlist_identity',description:'Etter at halvparten av shotlisten er strøket, merker spilleren hvor lett en plan kan bli blandet sammen med egen verdi som visjonær regissør.',materialization_refs:[refs.job,refs.conflict]},
    {id:'boundary_aftertaste',description:'Etter medvirkendegrensen må spilleren tåle at en ny og bedre sceneform kan oppstå nettopp fordi den opprinnelige ideen ikke hadde rett til å fortsette uendret.',materialization_refs:[refs.story,refs.people]},
    {id:'coverage_regret',description:'Når klipperommet viser et faktisk hull, kommer angeren over den droppede reaksjonen tilbake uten at den automatisk legitimerer en dyr ny opptaksdag.',materialization_refs:[refs.followup,refs.consequence]},
    {id:'director_mask_home',description:'Etter siste beslutning blir det privat tydelig at profesjonell sikkerhet kan være nyttig på settet, men skadelig hvis den hindrer spilleren i å erkjenne tvil og læring.',materialization_refs:[refs.consequence,refs.knowledge]}
  ],
  delayed_consequences:[
    {id:'sceneplan_returns_in_edit',setup_ref:'1/morning',return_ref:'11/morning',domains:['work','narrative']},
    {id:'blocking_trust_returns',setup_ref:'2/lunch',return_ref:'9/lunch',domains:['reputation','work']},
    {id:'coverage_shortcut_returns',setup_ref:'3/afternoon',return_ref:'13/afternoon',domains:['work','cost','reputation']},
    {id:'performer_boundary_returns',setup_ref:'4/afternoon',return_ref:'11/afternoon',domains:['reputation','consent','narrative']},
    {id:'continuity_choice_returns',setup_ref:'6/afternoon',return_ref:'12/evening',domains:['work','narrative']},
    {id:'historical_source_boundary_returns',setup_ref:'7/morning',return_ref:'14/evening',domains:['knowledge','identity']}
  ],
  materialization:{no_new_runtime:true,source_refs:Object.values(refs)}
};
write(WORLD_PATH, world);

const indexPath = 'data/Civication/roleWorlds/index.json';
const index = read(indexPath);
index.roles = (index.roles || []).filter(row => `${row.category}/${row.role_scope}` !== KEY);
index.roles.push({category:'film_tv',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
write(indexPath,index);

const checklistPath = 'data/Civication/roleWorldAuthoringChecklist.json';
const checklist = read(checklistPath);
checklist.reference_worlds = [...new Set([...(checklist.reference_worlds || []),WORLD_PATH])];
write(checklistPath,checklist);

const themePath = 'data/Civication/roleWorldThemeBank.json';
const themeBank = read(themePath);
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = world.theme_ids;
write(themePath,themeBank);

const plan = read(PLAN_PATH);
if ((plan.sequence || []).length !== 9) throw new Error(`Regissør plan must remain 9 steps, got ${(plan.sequence || []).length}`);

const report = `# Civication Role World rollout — Film/TV Regissør\n\nStatus: Materialisert som world-only kontrollert rollout; completion gjelder først etter fail-closed generatorer, streng rolleport, full Civication-suite, exact-head CI og post-merge-verifisering.\n\n## Scope\n\n- Canonical readiness oppga ingen authored debt for \`film_tv/regissor\`; rollouten skal derfor ikke oppfinne nye mangler.\n- Eksisterende 9/9 mailtyper og 9-trinns mailplan forblir authored grunnlag uten nye mails eller plansteg.\n- Role World binder den eksisterende buen fra sceneplan, blocking, dekning, samtykke, lysfall og kontinuitet til History Go-kildebruk, klipp og konkret pickup-konsekvens over 14 dager × 4 faser.\n- Kunstnerisk ledelse holdes adskilt fra sikkerhet, samtykke, kontrakt, budsjett og pickupmyndighet.\n- Ingen ny runtime, ingen parallell scenemotor og ingen kunstig persistent-work-gjeld introduseres.\n\n## Materialisering\n\n- 14 dager × 4 faser = 56 dramaturgiske beats.\n- 0 nye mail-scener; alle beats materialiseres mot eksisterende canonical Regissør-mails.\n- 5 vedvarende dramaturgiske tråder, 5 tilbakevendende rollearketyper, 8 slow axes, 4 private aftermath og 6 delayed consequences.\n- Mailplanen skal forbli eksakt 9 steg.\n\n## Kvalitetsgrense\n\nRollouten skal feile lukket hvis 9/9 provenance, eksisterende plan, authority boundaries, History Go-kildegrense, compiled registry, Career Gameplay Matrix eller readiness ikke kan bevises samlet.\n`;
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'reports/CIVICATION_FILM_TV_REGISSOR_ROLE_WORLD_ROLLOUT.md'),report);

console.log('Materialized Film/TV Regissør world-only rollout');
console.log(JSON.stringify({world:WORLD_PATH,new_scenes:0,plan_steps:plan.sequence.length,source_refs:Object.keys(refs).length},null,2));
