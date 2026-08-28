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

const ROLE = 'serieskaper';
const KEY = 'film_tv/serieskaper';
const WORLD_PATH = 'data/Civication/roleWorlds/film_tv/serieskaper.json';
const PLAN_PATH = 'data/Civication/mailPlans/film_tv/serieskaper_plan.json';
const catalogPath = type => `data/Civication/mailFamilies/film_tv/${type}/serieskaper_${type}.json`;
const refs = {
  job: `${catalogPath('job')}#film_tv_series_job_sesongrygg_001`,
  people: `${catalogPath('people')}#film_tv_series_people_bue_001`,
  conflict: `${catalogPath('conflict')}#film_tv_series_conflict_notes_001`,
  story: `${catalogPath('story')}#film_tv_series_story_rollefravaer_001`,
  event: `${catalogPath('event')}#film_tv_series_event_location_001`,
  micro: `${catalogPath('micro')}#film_tv_series_micro_bibel_001`,
  knowledge: `${catalogPath('knowledge')}#film_tv_series_knowledge_skouen_001`,
  followup: `${catalogPath('followup')}#film_tv_series_followup_rollefravaer_001`,
  consequence: `${catalogPath('consequence')}#film_tv_series_consequence_finalegjeld_001`
};
const TYPES = ['job','people','conflict','story','event','micro','knowledge','followup','consequence'];
const refCycle = TYPES.map(type => refs[type]);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = { morning:'info', lunch:'conversation', afternoon:'task', evening:'private_consequence' };
const phaseThread = {
  morning:'sesongrygg_og_rework',
  lunch:'situert_omdomme_og_profesjonsmaske',
  afternoon:'notes_handoff_og_beslutning',
  evening:'situert_omdomme_og_profesjonsmaske'
};
const dayThemes = [
  'Sesongryggen låses som et delt arbeidsobjekt, og Ingrid må kunne se hvilke karakterendringer som fortsatt er åpne før bestillermøtet.',
  'Jonas leverer en sterk episodeidé som må håndteres uten at writers room mister initiativ eller at et senere vendepunkt brukes opp for tidlig.',
  'Tre legitime notes kolliderer, og omskrivingen må vente på en eksplisitt prioritering i stedet for at serieskaperen skjuler konflikten i et nytt utkast.',
  'Et bekreftet rollefravær gjør omskriving til en flerleddet handoff mellom serieskaper, hovedforfatter, manusredaktør og produksjon med senere episodegjeld.',
  'Locationbortfall tvinger teamet til å skille dramatisk funksjon fra gammel løsning og dokumentere hva produksjonen faktisk kan levere videre.',
  'Amina finner en liten bibelkonflikt som krever rework på flere flater før nye episodeutkast kan fortsette uten parallelle sannheter.',
  'Arne Skouen brukes som filmhistorisk kontekst, samtidig som teamet holder den historiske kilden adskilt fra moderne mandat og arbeidsdeling.',
  'Teamet venter på et revidert episodeutkast, og serieskaperens standing avhenger av om ventingen brukes til tydelig avklaring eller til uformelt press nedover.',
  'En svak handoff gjør at produksjon og writers room arbeider mot ulike versjoner av samme scene, og rework-gjelden blir synlig i både tid og tillit.',
  'Ingrid, Jonas og Henrik vurderer samme serieskaper forskjellig: bestiller ser sporbarhet, writers room ser faglig lytting, og produksjon ser beslutninger som kommer tidsnok.',
  'Rollefraværet returnerer i episode sju og viser om tidligere omskriving faktisk ble husket eller om teamet resetter til en mer prestisjefylt gammel plan.',
  'Finalearbeidet krever en ny handoff fra writers room til produksjon, og åpen rework må skilles fra endeløs perfeksjonering som skyver risiko videre.',
  'Tidligere sesong- og kontinuitetsgjeld kommer tilbake i finalen og gjør det synlig hvem som eier reparasjonen og hvem som bare kan beslutte innen sitt mandat.',
  'Utviklingsperioden lukkes med en tydelig forskjell mellom kreativ standing og formell myndighet: tillit bygges gjennom sporbare valg, rework og ærlige handoffs.'
];
const coverage = [];
for (let day = 1; day <= 14; day += 1) {
  for (const [pi, phase] of phases.entries()) {
    const ref = refCycle[((day - 1) * 4 + pi) % refCycle.length];
    const phaseTail = phase === 'morning'
      ? 'Morgenen viser hvilket arbeid som faktisk er klart, hva som fortsatt venter, og hvilken versjon resten av teamet kan stole på.'
      : phase === 'lunch'
        ? 'Lunsjen gjør situated reputation konkret ved at Ingrid, Jonas, Amina og Henrik kan lese samme handling ulikt ut fra sitt ansvar og sin avhengighet.'
        : phase === 'afternoon'
          ? 'Ettermiddagen krever en eksplisitt handoff eller rework-beslutning med eier, mottaker, avhengighet og konsekvens dersom arbeidet ikke er klart.'
          : 'Kvelden viser hvordan synlighet, venting og omskriving påvirker profesjonsmasken privat uten å gjøre sosial standing til formell beslutningsmyndighet.';
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
const theme_ids = [
  'professional_culture',
  'status_anxiety',
  'shame_reputation',
  'loyalty_up_down',
  'social_mask',
  'bureaucratic_power',
  'precarity',
  'public_private_leakage'
];

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:'film_tv',
  role_scope:ROLE,
  title:'Serieskaper — sesongrygg, handoff, rework og situert standing',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Å holde en serie kreativt sammenhengende gjennom venting, handoffs og gjentatt omskriving uten at kreativt eierskap blir likestilt med uinnskrenket myndighet, og uten at omdømme blir behandlet som ett globalt tall løsrevet fra hvem som faktisk er avhengig av arbeidet.',
    description:'Role World-en bygger på den eksisterende komplette 9/9 Serieskaper-mailflaten og gjør de to readiness-manglene eksplisitte: rhythm/waiting/handoff/rework og situated reputation. Den følger samme sesongrygg, noteskonflikt, rollefravær, locationbortfall, seriebibel, filmhistoriske kildegrense, senere oppfølging og finalegjeld over 14 dager uten nye mails, nytt runtime-state eller parallell scenemotor.'
  },
  theme_ids,
  social_environments:[
    'Writers room der ideer må kunne vente på avklaring, sendes videre med eksplisitt versjon og returnere som rework uten at faglig uenighet blir personlig illojalitet.',
    'Seriebibel-flaten der canonical tilstand, åpne spørsmål og beslutningsspor bestemmer hvilken versjon senere forfattere og produksjon kan stole på.',
    'Utviklingsmøtet der bestiller-, produsent- og manusnotes får synlig eier og der en manglende prioritering legitimt kan stoppe omskriving.',
    'Produksjonsmøtet der en kreativ løsning må overleveres som gjennomførbart arbeid med kjente begrensninger, ikke bare som intensjon.',
    'Cinemateket i Oslo som read-only History Go-anker for norsk filmhistorie og Arne Skouen, ikke som normativ dokumentasjon av moderne writers-room-praksis.',
    'Den private kvelden etter notes eller omskriving der serieskaperen kan merke forskjellen mellom å ha mistet standing hos én samarbeidspartner og å ha mistet verdi eller mandat generelt.'
  ],
  recurring_people_archetypes:[
    {id:'ingrid_executive_producer_series',social_function:'executive producer og beslutningseier for bestilleravklaringer, hovedramme, større omlegginger og budsjettkonsekvenser',class_position:'bestiller- og produksjonsledelse med høy formell prosjektmakt',status:'høy formell status',power_over_player:'kan prioritere motstridende bestillingsmål og avgjøre større rammeendringer, men kan ikke gjøre serieskaperens faglige kreditering eller opphavsrett vilkårlig',wants:'en serieskaper som synliggjør konflikt, rework-gjeld og konsekvens før hun må beslutte',conceals:'at hennes behov for leveransesikkerhet kan gjøre legitim kreativ venting sosialt dyrere enn den burde være',speech_style:'kort og beslutningsorientert; spør hvilken versjon som gjelder, hva som venter og hva hun faktisk må prioritere',teaches_player:'at standing oppover bygges av sporbarhet og varsling, ikke av å late som all usikkerhet allerede er løst'},
    {id:'jonas_hovedforfatter_series',social_function:'hovedforfatter som leder konkret manusarbeid og mottar eller returnerer handoffs fra serieskaperen',class_position:'kreativ nøkkelrolle med høy situert fagstatus i writers room',status:'høy situert fagstatus',power_over_player:'kan gjøre sesongryggen skrivbar eller vise at en beslutning ikke gir fungerende episode- og karakterarbeid',wants:'en serieskaper som gir tydelige rammer, lytter til motbevis og lar rework ha en faglig begrunnelse',conceals:'at hyppige reverseringer kan oppleves som manglende respekt for forfatternes arbeid selv når hver enkelt endring kan forsvares',speech_style:'idéorientert og konkret; snakker om scene, karaktervalg, funksjon og hva en omskriving faktisk koster',teaches_player:'at standing i writers room er lokal og relasjonell og kan svekkes av dårlig handoff selv om bestiller fortsatt er fornøyd'},
    {id:'amina_manusredaktor_series',social_function:'manusredaktør som holder seriebibel, versjoner, beslutningsspor og avhengigheter synlige gjennom rework',class_position:'redaksjonell spesialist med høy informasjonsmakt, men uten bestillerens formelle beslutningsmandat',status:'høy situert tillit når dokumentasjonen er canonical',power_over_player:'kan avdekke at teamet arbeider mot ulike sannheter og dermed stoppe en falsk følelse av fremdrift',wants:'at muntlige beslutninger blir oversatt til sporbar canonical tilstand før neste handoff',conceals:'at hun ofte må absorbere sosial friksjon når andre ønsker å kalle en uavklart idé for låst',speech_style:'rolig og presis; spør siste godkjente versjon, beslutningseier og hvilke flater som nå må revideres',teaches_player:'at usynlig versjonsarbeid er en del av kreativ kvalitet og at rework må ha hukommelse'},
    {id:'henrik_produksjonsprodusent_series',social_function:'produksjonsprodusent som mottar kreative handoffs og gjør tid, location, medvirkende og kostnad til reelle begrensninger',class_position:'produksjonsleder med operativ og økonomisk situert makt',status:'høy situert gjennomføringsstatus',power_over_player:'kan avvise urealistiske leveranseforutsetninger og eskalere konsekvensen av sent kreativt rework',wants:'beslutninger som kommer tidsnok, tydelige avhengigheter og ærlige varsler når writers room fortsatt venter',conceals:'at planpress kan gjøre ham tilbøyelig til å foretrekke en svak låst løsning fremfor et åpent kreativt spørsmål',speech_style:'konsekvensorientert; spør hva som er låst, hva som kan endres, og hvilken opptaks- eller kostnadseffekt en ny versjon får',teaches_player:'at production standing ikke følger automatisk av kreativ autoritet, men av pålitelig handoff og realistisk timing'},
    {id:'mari_serieskaper_venn',social_function:'privat venn uten prosjektmakt som møter spilleren etter lange utviklingsdager og offentlig kreativ eksponering',class_position:'privat relasjon uten arbeidsrang',status:'emosjonell nærhet uten profesjonell myndighet',power_over_player:'kan utfordre behovet for å gjøre hver note, forsinkelse eller svekket standing til en dom over identiteten som serieskaper',wants:'at spilleren kan skille profesjonell kritikk fra personlig verdi og være konkret om hvem tilliten faktisk er svekket hos',conceals:'at hun blir sliten når every rework-runde blir gjenfortalt som en kamp om kunstnerisk verdighet',speech_style:'uformell og direkte; spør hvem som venter, hva som faktisk må gjøres om, og hvem spilleren prøver å imponere',teaches_player:'at situated reputation nettopp er situert og ikke bør lekke sammen til én total dom over selvet'}
  ],
  slow_axes:[
    {id:'executive_standing',meaning:'Ingrids situerte vurdering av om serieskaperen gjør usikkerhet, prioriteringsbehov og rework-gjeld beslutningsbart før bestillingsfrister',runtime_binding:'editorial_only_until_governed'},
    {id:'writers_room_standing',meaning:'Jonas og writers room sin situerte tillit til at rammer er tydelige, ideer blir hørt og rework begrunnes i seriehelhet fremfor status',runtime_binding:'editorial_only_until_governed'},
    {id:'production_standing',meaning:'Henriks situerte tillit til at kreative handoffs har riktig versjon, riktige avhengigheter og kommer tidsnok til faktisk produksjonsplan',runtime_binding:'editorial_only_until_governed'},
    {id:'handoff_reliability',meaning:'om arbeid sendes videre med eksplisitt eier, mottaker, canonical versjon, åpne spørsmål og tydelige avhengigheter',runtime_binding:'editorial_only_until_governed'},
    {id:'rework_debt',meaning:'mengden arbeid som må gjøres om fordi tidligere valg, notes, produksjonsendringer eller versjonsfeil ikke ble reparert gjennom hele sesongen',runtime_binding:'editorial_only_until_governed'},
    {id:'canonical_integrity',meaning:'om seriebibel og manus faktisk uttrykker samme godkjente karakter-, relasjons- og informasjonstilstand',runtime_binding:'existing'},
    {id:'authority_clarity',meaning:'om kreativ ledelse holdes adskilt fra bestilling, budsjett, sikkerhet, rettigheter, kreditering og andres faglige beslutningsrom',runtime_binding:'existing'},
    {id:'private_creator_mask',meaning:'om profesjonell standing hos én konkret gruppe lekker sammen med privat selvbilde etter venting, kritikk og omskriving',runtime_binding:'editorial_only_until_governed'}
  ],
  season:{days:14,day_phases:phases,coverage},
  primary_threads:[
    thread('sesongrygg_og_rework','Sesongryggen går fra første felles arbeidsobjekt til konkret finalereparasjon, med synlig rework hver gang et tidligere valg endrer senere avhengigheter.',['1/morning','2/afternoon','6/morning','9/afternoon','12/morning','13/afternoon','14/morning']),
    thread('notes_handoff_og_beslutning','Motstridende notes og manglende prioritering blir venting som først kan avsluttes når riktig eier har besluttet og handoffen sier hva som faktisk gjelder.',['3/morning','3/lunch','4/afternoon','8/morning','9/lunch','12/afternoon']),
    thread('rollefravaer_og_rewrite','Rollefraværet flytter informasjon og relasjonseffekt gjennom flere episoder og returnerer senere som test på om omskrivingen ble husket.',['4/morning','4/lunch','5/afternoon','8/afternoon','11/morning','11/afternoon','13/lunch']),
    thread('produksjonsendring_og_tillit','Location- og gjennomføringsendringer gjør production standing avhengig av realistiske, tidsriktige kreative handoffs fremfor generelt kreativt omdømme.',['5/morning','5/lunch','8/lunch','9/morning','10/afternoon','12/lunch']),
    thread('situert_omdomme_og_profesjonsmaske','Ingrid, Jonas og Henrik husker ulike sider av de samme valgene; standing kan derfor stige hos én og falle hos en annen uten å bli én global reputasjon.',['2/lunch','3/evening','7/evening','10/lunch','10/evening','13/evening','14/evening'])
  ],
  private_aftermath:[
    {beat_ref:'3/evening',surface:'private',effect:'Serieskaperen må tåle at legitim venting på Ingrid kan se ut som ubesluttsomhet i writers room uten å presse frem en falsk avklaring.'},
    {beat_ref:'6/evening',surface:'private',effect:'En liten bibelfeil blir pinlig fordi Amina oppdaget den; privat etterklang skiller skam fra det konkrete rework-ansvaret.'},
    {beat_ref:'9/evening',surface:'private',effect:'En svak handoff har kostet teamet tid, og spilleren må eie feilen uten å bruke kreativ status til å minimere andres merarbeid.'},
    {beat_ref:'10/evening',surface:'private',effect:'Ulik standing hos bestiller, writers room og produksjon gjør det mulig å være respektert ett sted og frustrerende et annet uten en total sosial dom.'},
    {beat_ref:'14/evening',surface:'private',effect:'Avslutningen lar profesjonsmasken slippe: god serieskaping måles i sammenheng, samarbeid og reparasjon, ikke i å aldri måtte gjøre om arbeid.'}
  ],
  delayed_consequences:[
    {id:'spine_shortcut_returns',setup_ref:'1/afternoon',return_ref:'6/morning',effect:'Et uavklart episodepremiss blir til konkret bibel- og kontinuitetsrework.'},
    {id:'notes_wait_returns',setup_ref:'3/afternoon',return_ref:'8/morning',effect:'Måten prioriteringsventingen ble kommunisert på påvirker senere executive- og writers-room-standing.'},
    {id:'absence_handoff_returns',setup_ref:'4/afternoon',return_ref:'11/morning',effect:'Rollefraværet returnerer i episode sju og avslører om handoffen faktisk flyttet informasjon og relasjonseffekt.'},
    {id:'location_rewrite_returns',setup_ref:'5/afternoon',return_ref:'12/afternoon',effect:'Den nye location-løsningen påvirker senere produksjonshandoff og hvor mye rework som må gjøres før finale.'},
    {id:'bible_debt_returns',setup_ref:'6/afternoon',return_ref:'13/morning',effect:'En tidlig canonical-feil blir finalegjeld dersom alle berørte flater ikke ble synkronisert.'},
    {id:'situated_standing_returns',setup_ref:'10/lunch',return_ref:'14/evening',effect:'Ulike publikums vurderinger av samme arbeidsmåte blir stående side om side og kan ikke erstattes av ett globalt reputation-tall.'}
  ],
  materialization:{
    no_new_runtime:true,
    authored_dimensions:['rhythm_waiting_handoff_rework','situated_reputation'],
    scene_pipeline:'existing_civication_scene_v1',
    source_refs:Object.values(refs),
    note:'Eksisterende 9/9 Serieskaper-mails og eksakt 9-trinns plan gjenbrukes. Role World-en legger varighet, venting, handoff, rework og audience-spesifikk standing over eksisterende authored hendelser uten nye mail-scener eller runtime-state.'
  }
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.category === 'film_tv' && row.role_scope === ROLE)) {
  index.roles.push({category:'film_tv',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
}
index.status = 'sixteen_role_worlds_materialized';
index.effective_date = '2026-08-28';
index.note = 'Reference- og pilotbevisene består uendret. Serieskaper er materialisert som kontrollert Role World-rollout med eksplisitt waiting/handoff/rework og audience-spesifikk standing; kreativ standing kan ikke erstatte bestiller-, produksjons-, rettighets- eller budsjettmyndighet.';
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds = checklist.reference_worlds || [];
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);

const report = `# Civication Role World rollout — Film/TV Serieskaper\n\nStatus: Materialisert som kontrollert Role World med eksisterende Scene Pipeline. Completion gjelder først etter streng rolleport, full Civication-suite, exact-head CI og post-merge-verifisering.\n\n## Scope\n\n- Canonical readiness krevde \`rhythm_waiting_handoff_rework\` og \`situated_reputation\`.\n- Eksisterende 9/9 mailtyper og eksakt 9-trinns mailplan beholdes uten nye mails eller plansteg.\n- Samme sesongrygg, noteskonflikt, rollefravær, locationbortfall, seriebibel, Arne Skouen-kildeoppgave, oppfølging og finalegjeld får en 14-dagers sammenhengende arbeidsverden.\n- Standing er audience-spesifikk: executive, writers room og produksjon kan huske samme handling forskjellig. Standing gir aldri formell bestiller-, budsjett-, sikkerhets-, rettighets- eller krediteringsmyndighet.\n- Ingen ny runtime eller parallell scenemotor introduseres.\n\n## Materialisering\n\n- 14 dager × 4 faser = 56 dramaturgiske beats.\n- 0 nye mail-scener; alle beats peker til de ni eksisterende canonical Serieskaper-mails.\n- 5 primære tråder, 5 recurring people-archetypes, 8 slow axes, 5 private aftermath og 6 delayed consequences.\n- Waiting er legitim når beslutningseier mangler; handoff må angi versjon/eier/mottaker/avhengighet; rework må bevare historisk beslutningsspor.\n\n## Kvalitetsgrense\n\nRollouten skal feile lukket hvis provenance, eksakt mailplan, readiness-gjeld, audience-spesifikk standing, handoff/rework, authority boundaries, History Go-kildegrense, compiled registry, Career Gameplay Matrix eller full Civication-suite ikke kan bevises samlet.\n`;
fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_FILM_TV_SERIESKAPER_ROLE_WORLD_ROLLOUT.md'), report);

console.log('Materialized Film/TV Serieskaper Role World from existing 9/9 canonical mail surface.');
