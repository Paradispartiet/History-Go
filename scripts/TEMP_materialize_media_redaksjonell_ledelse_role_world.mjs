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

const ROLE = 'media_redaksjonell_ledelse';
const KEY = 'media/media_redaksjonell_ledelse';
const WORLD_PATH = 'data/Civication/roleWorlds/media/media_redaksjonell_ledelse.json';
const catalogPath = type => `data/Civication/mailFamilies/media/${type}/media_redaksjonell_ledelse_${type}.json`;
const refs = {
  job: `${catalogPath('job')}#media_redaksjonell_ledelse_job_prioritering_001`,
  sharedJob: `${catalogPath('job')}#media_cross_role_editor_shared_case_review_001`,
  people: `${catalogPath('people')}#media_redaksjonell_ledelse_people_status_001`,
  conflict: `${catalogPath('conflict')}#media_redaksjonell_ledelse_conflict_press_001`,
  knowledge: `${catalogPath('knowledge')}#media_redaksjonell_ledelse_knowledge_belegg_001`,
  event: `${catalogPath('event')}#media_redaksjonell_ledelse_event_nyopplysning_001`,
  micro: `${catalogPath('micro')}#media_redaksjonell_ledelse_micro_eier_001`,
  followup: `${catalogPath('followup')}#media_redaksjonell_ledelse_followup_rettelse_001`,
  story: `${catalogPath('story')}#media_redaksjonell_ledelse_story_tillit_001`,
  consequence: `${catalogPath('consequence')}#media_redaksjonell_ledelse_consequence_publisering_001`
};
const refCycle = Object.values(refs);
const phases = ['morning','lunch','afternoon','evening'];
const phaseTypes = { morning:'info', lunch:'conversation', afternoon:'task', evening:'private_consequence' };
const phaseThread = {
  morning:'desk_operational_trust',
  lunch:'reporter_standing_and_rework',
  afternoon:'editorial_public_independence',
  evening:'private_leadership_mask'
};
const dayThemes = [
  'Desken har tre sterke saker og kapasitet til to. Lederens omdømme splittes allerede: reportere ser om prioriteringen er faglig begrunnet, vaktsjefen ser om kapasiteten faktisk styres, og øverste redaktørnivå ser om risikoen er synlig før den blir et problem.',
  'En reporter ber om et presist mandat for en belastende detalj med svakere belegg. Tillit hos reporteren avhenger av tydelig avgrensning, mens deskens tillit avhenger av at beslutningen kommer tidsnok og ikke skyves nedover som skjult ansvar.',
  'En mektig aktør truer med mindre tilgang dersom saken publiseres. Kilder, reporterteam, publikum og sjefredaktørnivå kan alle lese den samme lederbeslutningen ulikt, og tilgang må aldri bli et skjult mål på sannhet eller profesjonell verdi.',
  'Den runtime-beviste shared publication case kommer til lederperspektivet. Reporteren vurderer om evidensarbeidet respekteres, desken vurderer om rework er presist, og lederlinjen vurderer om samme sak kan flyttes videre uten privilege leakage.',
  'Tittelen sier at en aktør «visste», mens dokumentene bare viser at informasjonen var tilgjengelig i organisasjonen. Standing hos publikum og reporterne avhenger av at lederstatus ikke brukes til å gjøre en slutning sterkere enn belegget.',
  'Ny dokumentasjon svekker den investerte vinkelen kort før publisering. Å endre kurs kan koste kortsiktig intern prestisje, men bygger annen type tillit hos reportere, desk og publikum enn det å beskytte tidligere lederbeslutninger.',
  'To ingressversjoner ligger klare og den sterkeste mangler synlig beslutningseier. Vaktsjefen trenger sporbarhet, reporteren trenger at ansvar ikke skyves nedover, og sjefredaktørnivået trenger en beslutning som kan forklares etterpå.',
  'En offentlig rettelse er publisert. Publikum ser åpenheten, reporterteamet ser om læringen fordeler ansvar rettferdig, og ledelsen oppover ser om kontrollpunktet faktisk gjør neste sak mindre risikofylt.',
  'Etter rettelsen er omdømmet asymmetrisk: én reporter kan ha økt tillit til lederen, en annen kan oppleve rework som statusmarkering, mens publikum bare ser det offentlige resultatet. Ingen av disse vurderingene får bli ett samlet reputation-tall.',
  'Den delte publiseringssaken returnerer etter rework. Lederrollen må skille mellom å ha myndighet til å kreve nytt arbeid og å ha sosial rett til å ta kreditt, omskrive reporterens evidens eller tolke lydighet som faglig tillit.',
  'En kritisk leser og en berørt kilde peker på ulike svakheter i samme sak. Publikumstillit, kilderelasjon og intern profesjonell standing må kunne bevege seg i forskjellige retninger uten at mest støyende audience vinner beslutningen.',
  'En ny kapasitetskonflikt tester om tidligere læring overlever når redaksjonen igjen er presset. Deskens operative tillit handler om tempo og varsling; reporterens tillit handler om rimelig arbeidsdeling og at usikkerhet kan sies høyt uten statustap.',
  'Redaksjonen gjennomgår beslutningssporet fra prioritering til rettelse. Sjefredaktørnivået vurderer styrbarhet, reporterne vurderer rettferdighet og læring, og publikum vurderer bare det som faktisk ble synlig i publiseringen og rettelsen.',
  'Rollouten lukkes med at redaksjonell tillit forstås som et mønster av relasjoner, ikke en rangering. Lederrollen består av formell myndighet innen klare grenser og flere separate former for standing som må fortjenes hos dem som faktisk er avhengige av beslutningene.'
];
const phaseTail = {
  morning:'Morgenen gjør deskens situerte vurdering konkret: om status, kapasitet, risiko og beslutningseier er tydelige nok til at andre kan arbeide uten å gjette.',
  lunch:'Lunsjen gjør reporter- og kollegastanding konkret: om lederen lytter til motbevis, fordeler rework redelig, beskytter kreditt og lar faglig uenighet eksistere uten at den blir lest som illojalitet.',
  afternoon:'Ettermiddagen setter lederbeslutningen mot et annet audience — sjefredaktørnivå, kilde eller publikum — og viser at uavhengighet, presisjon og åpen rettelse vurderes med andre kriterier enn intern leveransefart.',
  evening:'Kvelden skiller den private personen fra ledermasken: svekket standing hos én arbeidsrelasjon er ikke et totalt mål på egen verdi og gir aldri mer eller mindre formell myndighet.'
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
  'bureaucratic_power',
  'precarity',
  'public_private_leakage'
];

const situated_reputation_model = {
  global_score_allowed:false,
  rule:'Standing er audience-spesifikk og kan divergere. Ingen samlet reputation-score kan brukes som evidens, publiseringsgrunnlag eller erstatning for formell authority.',
  audiences:[
    {id:'reporter_staff',standing_axis:'reporter_staff_standing',cares_about:['tydelig mandat','rettferdig rework','faglig lytting','kreditt og evidenseierskap'],cannot_grant:'formell redaktørmyndighet eller sannhetsstatus til reporterens funn'},
    {id:'desk_and_shift_leads',standing_axis:'desk_operational_standing',cares_about:['presis status','kapasitetsstyring','beslutninger tidsnok','synlig risiko'],cannot_grant:'rett til å hoppe over kildekritikk eller dokumentasjon'},
    {id:'editor_in_chief_line',standing_axis:'editorial_upward_standing',cares_about:['styrbar risiko','uavhengighet','sporbar beslutning','åpen korrigering'],cannot_grant:'ubegrenset mandat eller adgang til å omskrive reporterens evidens'},
    {id:'sources_and_affected',standing_axis:'source_independence_standing',cares_about:['redelig forventningsstyring','uavhengighet','presis attribusjon','rettferdig svarrom'],cannot_grant:'veto over publisering eller rett til å bytte tilgang mot dekning'},
    {id:'public',standing_axis:'public_correction_standing',cares_about:['presisjon','synlig rettelse','forklarbart beslutningsspor','at ny evidens faktisk kan endre teksten'],cannot_grant:'sannhetsstatus gjennom popularitet, trafikk eller applaus'},
    {id:'private_relationships',standing_axis:'private_relationship_standing',cares_about:['tilstedeværelse','evne til å skille rolle og person','ikke gjøre all kritikk til profesjonelt angrep'],cannot_grant:'arbeidsmyndighet eller profesjonell rang'}
  ],
  divergence_examples:[
    'Å stoppe en svak sak kan redusere kortsiktig standing hos en reporter som mister publisering, men øke desk- og publikumsrelatert tillit når begrunnelsen er presis.',
    'Å returnere en shared case for rework kan øke sjefredaktørnivåets tillit til kontroll og samtidig svekke reporterstanding dersom rework brukes som statusmarkering eller tar kreditt fra evidensarbeidet.',
    'En synlig rettelse kan gi kortsiktig omdømmetap hos publikum, men bygge langsiktig correction standing og intern profesjonskultur dersom beslutningssporet faktisk forbedres.'
  ],
  authority_separation:'Standing påvirker editorial forståelse av relasjoner, men kan aldri gjøre forbidden authority executable, endre work-object-eierskap eller gjøre svakt belegg sterkere.'
};

const world = {
  schema:'civication_role_world_v1',
  version:1,
  category:'media',
  role_scope:ROLE,
  title:'Redaksjonell ledelse — situert tillit, uavhengighet og ansvar',
  status:'role_world_complete',
  sociological_core:{
    main_problem:'Å lede publisering under tid, kapasitets- og omdømmepress uten å behandle formell redaktørmyndighet som sannhetsbevis, og uten å redusere reporter-, desk-, kilde-, publikums- og lederlinjens tillit til ett globalt omdømmetall.',
    description:'Role World-en lukker bare readiness-gjelden situated_reputation. Eksisterende work grammar, åtte-trinns mailplan, ni mailtyper og runtime-bevist shared publication case beholdes. Samme beslutning kan gi ulik standing hos ulike audiences, mens authority, evidens og work-object-eierskap forblir styrt av eksisterende kontrakter.'
  },
  theme_ids,
  social_environments:[
    'Fjordby Dagblads fiktive nyhetsdesk som shared-world institusjon der reporterens evidensspor og lederens beslutningsansvar møtes uten privilege leakage.',
    'Vaktsjef- og deskmøtet der kapasitet, versjon, status og beslutningseier må være eksplisitte før tempo kan kalles kontroll.',
    'Reporterrelasjonen der rework, faglig uenighet og kreditt avgjør lokal standing selv når formell ledermyndighet er uendret.',
    'Redaktørkjeden der sjefredaktørnivået trenger styrbar risiko, uavhengighet og et etterprøvbart beslutningsspor framfor performativ sikkerhet.',
    'Kilde- og berørtkontakt der tilgang og press må holdes adskilt fra redaksjonell beslutning og evidensstyrke.',
    'Publikumsflaten etter publisering og rettelse der respons kan gi kunnskap, men aldri automatisk sannhetsstatus.',
    'VG-huset, NRK Marienlyst og Aftenposten/Akersgata som eksisterende canonicale arbeids-/kontekstflater, uten at Role World-en dikter opp konkrete ansatte eller hendelser hos de virkelige institusjonene.',
    'Privatlivet etter en hard nyhetsdag der lederen må tåle at arbeidsmessig standing er situert og ikke er identisk med personlig verdi.'
  ],
  recurring_people_archetypes:[
    {id:'lina_vaktsjef_ledelse',social_function:'vaktsjef som er avhengig av presis lederstatus for å fordele kapasitet og publiseringsrekkefølge',class_position:'redaksjonell mellomleder med operativt leveranseansvar',status:'høy situert deskstatus',power_over_player:'kan gjøre svak prioritering og sen varsling synlig i den daglige produksjonen, men kan ikke utvide spillerens formelle mandat',wants:'tidlige beslutninger, eksplisitt risiko og færre skjulte blokkeringer',conceals:'at hun selv blir målt på tempo og derfor kan belønne overdrevet sikkerhet',speech_style:'kort og operativ; spør hva som er klart, hva som venter og hvem som beslutter',teaches_player:'at deskstanding bygges av leverbar status og varsling, ikke av lederprestisje'},
    {id:'amina_reporter_ledelse',social_function:'reporter som mottar mandat, rework og feedback og eier sitt dokumenterte evidensarbeid',class_position:'kunnskapsarbeider under redaksjonell myndighetslinje, men med eget faglig ansvar',status:'høy situert fagstatus når kildearbeidet er sterkt',power_over_player:'kan levere motbevis, gjøre dårlig handoff kostbar og forme kollegers tillit til lederens faglige redelighet',wants:'tydelige rammer, faglig lytting, rettferdig rework og bevart kreditt',conceals:'at avvist publisering kan oppleves som statustap også når beslutningen er faglig forsvarlig',speech_style:'konkret og evidensorientert; spør hva som må endres og hva som faktisk er beslutningsgrunnlaget',teaches_player:'at reporterstanding er relasjonell og ikke følger automatisk av hierarki'},
    {id:'jonas_deskredaktor_ledelse',social_function:'deskredaktør som kvalitetssikrer versjon, attribusjon og siste publiseringsgrunnlag',class_position:'redaksjonell spesialist med stor informasjonsmakt i siste kontroll',status:'høy situert kvalitetstillit',power_over_player:'kan avdekke versjonsuklarhet og gjøre et tilsynelatende ferdig løp uegnet for publisering',wants:'en leder som ikke gjør teknisk sisteversjon til redaksjonell godkjenning',conceals:'at han kan bli defensiv når egne tidligere deskvalg må revideres',speech_style:'presis, ordnær og konsekvensorientert',teaches_player:'at sporbarhet bygger en annen type standing enn tempo og synlighet'},
    {id:'ingrid_sjefredaktor_ledelse',social_function:'øverste redaktørnivå som vurderer uavhengighet, risiko, myndighetsgrenser og systemlæring',class_position:'øverste formelle redaktørmyndighet i den fiktive institusjonen',status:'høy formell status',power_over_player:'kan sette rammer, overprøve eller kreve eskalering innen institusjonens faktiske myndighetsstruktur',wants:'at tvil, ekstern påvirkning og systemsvakhet blir synlig før de blir omdømmerisiko',conceals:'at også hun kan belønne beslutninger som ser sikre ut oppover selv når faglig arbeid fortsatt er åpent',speech_style:'kort, prinsipielt og opptatt av hva redaksjonen kan stå inne for offentlig',teaches_player:'at upward standing ikke er det samme som ubegrenset mandat'},
    {id:'ellen_kilde_ledelse',social_function:'kilde eller berørt aktør som møter redaksjonell ledelse gjennom svarrom, forventningsstyring og publiseringsvalg',class_position:'utenfor redaksjonen og uten intern myndighet, men med situert kunnskap og mulig personlig risiko',status:'varierende offentlig/institusjonell status uten redaksjonell beslutningsmakt',power_over_player:'kan åpne eller lukke tilgang, tilføre dokumentasjon og utfordre redaksjonens formuleringer',wants:'redelig behandling og tydelig skille mellom det som er dokumentert, påstått og besluttet',conceals:'at egen interesse i utfallet kan blandes med reell kunnskapsverdi',speech_style:'detaljert, avgrensende og opptatt av konkrete formuleringer',teaches_player:'at kildestanding må holdes adskilt fra tilgangspress og publiseringsmyndighet'},
    {id:'sara_leser_ledelse',social_function:'fagkyndig publikummer som kan tilføre korrigerende kunnskap etter publisering',class_position:'utenfor redaksjonshierarkiet',status:'ingen formell redaksjonell status, men mulig høy evidensverdi',power_over_player:'kan gjøre feil og rettelser offentlig synlige og påvirke publikums tillit',wants:'presis tekst, synlig endring og forklarbar rettelse',conceals:'at også korrekt kritikk kan være motivert av frustrasjon eller konflikt',speech_style:'konkret og dokumenterende; peker på setninger og kilder som kan kontrolleres',teaches_player:'at public standing må bygges gjennom etterprøvbarhet, ikke responsvolum'},
    {id:'mari_venn_ledelse',social_function:'privat venn uten redaksjonell rang som møter personen etter beslutninger som har skapt konflikt eller skam',class_position:'privat likemann',status:'emosjonell nærhet uten profesjonell myndighet',power_over_player:'kan utfordre behovet for å gjøre kritikk fra jobb til total dom over egen verdi',wants:'at spilleren kan snakke om hvem tilliten faktisk er svekket hos og hvorfor',conceals:'at hun blir sliten når alle private samtaler blir en forlengelse av lederrollen',speech_style:'uformell og direkte; spør hvem som faktisk er uenig og hva det betyr i praksis',teaches_player:'at situert omdømme nettopp er situert og ikke bør lekke sammen til én identitetsdom'}
  ],
  slow_axes:[
    {id:'reporter_staff_standing',meaning:'reporternes situerte tillit til tydelig mandat, faglig lytting, rettferdig rework og bevart evidens-/kredittansvar',runtime_binding:'editorial_only_until_governed'},
    {id:'desk_operational_standing',meaning:'vaktsjef og desk sin situerte tillit til presis status, kapasitetsstyring, versjonsklarhet og beslutninger tidsnok',runtime_binding:'editorial_only_until_governed'},
    {id:'editorial_upward_standing',meaning:'sjefredaktørnivåets situerte vurdering av styrbar risiko, uavhengighet og etterprøvbart beslutningsspor',runtime_binding:'editorial_only_until_governed'},
    {id:'source_independence_standing',meaning:'kilders og berørtes situerte erfaring av redelig forventningsstyring og at tilgang ikke kjøper publiseringsmakt',runtime_binding:'editorial_only_until_governed'},
    {id:'public_correction_standing',meaning:'publikums situerte tillit til presisjon, synlig rettelse og at ny kunnskap faktisk kan endre redaksjonens tekst',runtime_binding:'editorial_only_until_governed'},
    {id:'peer_professional_standing',meaning:'kollegers situerte vurdering av om lederen tåler motbevis, deler kreditt og gjør feil til læring fremfor statusforsvar',runtime_binding:'editorial_only_until_governed'},
    {id:'authority_clarity',meaning:'om sosial standing holdes tydelig adskilt fra formell redaktørmyndighet, evidensstyrke og executable authority-actions',runtime_binding:'editorial_only_until_governed'},
    {id:'private_leadership_mask',meaning:'om spilleren klarer å skille arbeidsmessig status, offentlig omdømme og privat identitet etter krevende beslutninger',runtime_binding:'editorial_only_until_governed'}
  ],
  situated_reputation_model,
  cross_role_proof:{
    status:'reuse_existing_runtime_proof',
    work_object_id:'media_redaksjon_publication_case_001',
    reporter_role_scope:'media_redaksjon',
    leader_role_scope:ROLE,
    leader_scene_id:'media_cross_role_editor_shared_case_review_001',
    rule:'Samme work object kan være shared uten at privilege, evidenseierskap eller role_scope blir shared.',
    forbidden_authority_action:'overwrite_reporter_evidence',
    new_runtime:false
  },
  season:{days:14,day_phases:phases,coverage},
  primary_threads:[
    {id:'desk_operational_trust',relationship:'kapasitet, status, versjon og beslutninger som må komme tidsnok',beat_refs:['1/morning','2/morning','4/morning','7/morning','10/morning','12/morning','14/morning']},
    {id:'reporter_standing_and_rework',relationship:'mandat, faglig lytting, rework, kreditt og evidenseierskap',beat_refs:['1/lunch','2/lunch','4/lunch','6/lunch','10/lunch','12/lunch','14/lunch']},
    {id:'editorial_public_independence',relationship:'uavhengighet, evidensstyrke, publiseringsvalg og rettelser sett av lederlinje, kilder og publikum',beat_refs:['3/afternoon','5/afternoon','6/afternoon','8/afternoon','11/afternoon','13/afternoon','14/afternoon']},
    {id:'shared_case_without_privilege_leakage',relationship:'samme publiseringssak gjennom reporter- og lederperspektiv uten at shared work blir shared privilege',beat_refs:['4/morning','4/afternoon','7/afternoon','10/morning','10/afternoon','13/morning']},
    {id:'private_leadership_mask',relationship:'skille mellom situert profesjonell standing og privat egenverdi',beat_refs:['1/evening','4/evening','7/evening','10/evening','14/evening']}
  ],
  private_aftermath:[
    {id:'after_capacity_cut',beat_ref:'1/evening',summary:'Spilleren kjenner skyld over saken som måtte vente og må skille reporterens skuffelse fra et globalt tegn på dårlig ledelse.'},
    {id:'after_access_pressure',beat_ref:'3/evening',summary:'Eksternt press følger hjem som tvil om karriere og relasjoner; uavhengighet gir ikke automatisk sosial belønning.'},
    {id:'after_shared_rework',beat_ref:'4/evening',summary:'Rework på en reporters sak kjennes personlig selv om authority-grensen var korrekt; privat refleksjon handler om hvordan makt faktisk ble brukt.'},
    {id:'after_public_correction',beat_ref:'8/evening',summary:'En synlig rettelse gir skam og lettelse samtidig, mens publikumsstanding og intern standing kan bevege seg ulikt.'},
    {id:'after_rollout_close',beat_ref:'14/evening',summary:'Spilleren kan navngi hvem som har økt eller redusert tillit og hvorfor, uten å gjøre det til én score eller en dom over identiteten.'}
  ],
  delayed_consequences:[
    {id:'capacity_priority_returns',setup_ref:'1/morning',return_ref:'12/morning',summary:'Den første kapasitetsprioriteringen kommer tilbake når redaksjonen igjen har for mange saker; deskstanding avhenger av om læringen faktisk brukes.'},
    {id:'reporter_mandate_returns',setup_ref:'2/lunch',return_ref:'10/lunch',summary:'Måten mandat ble gitt på former hvor mye reporteren stoler på senere rework og om uenighet sies høyt.'},
    {id:'access_pressure_returns',setup_ref:'3/afternoon',return_ref:'11/afternoon',summary:'Ekstern tilgang og kildepress kommer tilbake i en ny form og tester om source standing fortsatt holdes adskilt fra publiseringsgrunnlag.'},
    {id:'shared_case_returns',setup_ref:'4/afternoon',return_ref:'10/afternoon',summary:'Den samme shared publication case kommer tilbake etter rework uten at reporterens evidenshistorikk eller role_scope er overskrevet.'},
    {id:'new_evidence_returns',setup_ref:'6/afternoon',return_ref:'13/afternoon',summary:'Beslutningen om å endre kurs blir senere brukt som test på om lederlinjen faktisk belønner redaksjoner som lar ny evidens endre resultatet.'},
    {id:'correction_culture_returns',setup_ref:'8/afternoon',return_ref:'14/afternoon',summary:'Den synlige rettelsen blir til langsiktig standing bare dersom kontrollpunkt og beslutningsspor faktisk består.'}
  ],
  materialization:{
    no_new_runtime:true,
    source_refs:refCycle,
    authored_dimensions:['situated_reputation'],
    existing_plan_preserved:true,
    existing_cross_role_runtime_proof_reused:true,
    note:'Standing er editorial-only og audience-spesifikk. Eksisterende Scene Pipeline, WorkWorld, WorkRhythm og InstitutionAuthority forblir autoritative.'
  }
};

write(WORLD_PATH, world);

const index = read('data/Civication/roleWorlds/index.json');
if (!(index.roles || []).some(row => row.category === 'media' && row.role_scope === ROLE)) {
  index.roles.push({category:'media',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
}
index.status = 'eighteen_role_worlds_materialized';
index.effective_date = '2026-08-28';
index.note = 'Reference- og pilotbevisene består uendret. Media Redaksjonell ledelse er materialisert som kontrollert Role World-rollout med audience-spesifikk standing; shared work, evidens og formell authority forblir separate kontrakter.';
write('data/Civication/roleWorlds/index.json', index);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
checklist.reference_worlds = checklist.reference_worlds || [];
if (!checklist.reference_worlds.includes(WORLD_PATH)) checklist.reference_worlds.push(WORLD_PATH);
write('data/Civication/roleWorldAuthoringChecklist.json', checklist);

const themeBank = read('data/Civication/roleWorldThemeBank.json');
themeBank.reference_profiles = themeBank.reference_profiles || {};
themeBank.reference_profiles[KEY] = theme_ids;
write('data/Civication/roleWorldThemeBank.json', themeBank);

fs.writeFileSync(path.join(ROOT, 'reports/CIVICATION_MEDIA_REDAKSJONELL_LEDELSE_ROLE_WORLD_ROLLOUT.md'), `# Civication Media Redaksjonell ledelse Role World rollout\n\nDato: **2026-08-28**\n\n- Rolle: \`${KEY}\`\n- Status: \`role_world_complete\`\n- Readiness-gjeld lukket: \`situated_reputation\`\n- Season: 14 dager × 4 faser = 56 beats\n- Audience-spesifikke standing-akser: reporter, desk, lederlinje, kilde/berørt, publikum, profesjonskolleger og privat rollegrense\n- Global reputation-score: forbudt i denne modellen\n- Cross-role: eksisterende runtime-bevist \`media_redaksjon_publication_case_001\` gjenbrukes; shared work er ikke shared privilege\n- Authority: standing kan ikke endre evidensstyrke, work-object-eierskap eller executable authority\n- Runtime: ingen ny runtime; eksisterende Scene Pipeline beholdes\n- Plan: eksisterende 8-trinns plan uendret\n- Provenance: de eksisterende ni mailtypene + den eksisterende cross-role leder-scenen\n\nEndelig merge-status og CI-resultat skal bare fastslås fra GitHub på PR-ens eksakte final head.\n`);

console.log('Materialized Media Redaksjonell ledelse Role World with situated reputation only.');
