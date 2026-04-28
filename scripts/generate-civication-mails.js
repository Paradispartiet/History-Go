#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const outPath = path.resolve(__dirname, '../data/Civication/workModels/naeringsliv_work_model.json');

const baseChoices = (a,b)=>[
  { id:'A', label:a, effect:1, tags:['kvalitet','kunde'], feedback:'Du prioriterer sporbarhet og forklaring, selv om det tar tid i øyeblikket.'},
  { id:'B', label:b, effect:-1, tags:['tempo','snarvei'], feedback:'Du løser presset raskt nå, men skyver risikoen videre til neste skift.'}
];

const mails = [
['job','kasse_og_pris','Pris i hylle stemmer ikke','En kunde viser bilde av hyllepris som er lavere enn kassen.','Køen bygger seg opp, og kunden vil ha svar nå.','customer_service','nøyaktighet_under_press','høy_kø','faktasjekk_vs_flyt','tillit_vs_tempo','forste_uke_pa_gulvet',baseChoices('Sjekk hylle og korriger pris med forklaring','Slå inn varen som registrert pris for å holde køen i gang')],
['job','kasse_og_pris','Terminalen faller ut i rush','Kortterminalen mister kontakt mens fem kunder venter.','En kollega roper at du må få køen ned umiddelbart.','cash_desk','problemlosning','teknisk_stopp','manualrutine_vs_improvisasjon','ro_vs_kaos','kundenes_blikk',baseChoices('Bytt til reservekasse og informer tydelig','Be kundene prøve kortet flere ganger uten plan')],
['job','kundemote_og_service','Retur uten kvittering','Kunden vil returnere en blender uten kvittering.','Hen viser bankutskrift, men varen er delvis åpnet.','returns','regelbruk_med_skjonn','kundepress','policy_vs_unntak','rettferdighet_vs_stoy','fra_ansatt_til_fagperson',baseChoices('Følg returprosedyre med sporbar løsning','Avvis kort for å unngå tidkrevende vurdering')],
['job','kundemote_og_service','Kunden spør om produkt du ikke kan','En kunde spør om forskjellen på to hudkremer du ikke kjenner.','Hen trenger råd før gavekjøp og står klar ved hylla.','product_guidance','faglig_nysgjerrighet','kunnskapshull','hente_hjelp_vs_late_som','treff_vs_mersalg','fra_ansatt_til_fagperson',baseChoices('Hent kollega/produktinfo før anbefaling','Anbefal den dyreste for å komme videre')],
];

// add generated scenario set
const families = ['vareflyt_og_hylle','lager_og_bestilling','svinn_og_kontroll','salg_og_veiledning','butikkstandard','ny_kollega_og_tillit','snarveier_og_rutine','forste_ansvar','travel_dag','apning_og_lukking'];
const types = ['job','people','conflict','story','event'];
let idx=5;
for (const t of types){
  const n = t==='job'?18:t==='people'||t==='conflict'||t==='event'?6:4;
  for(let i=0;i<n;i++){
    const fam=families[(idx+i)%families.length];
    mails.push([
      t,fam,
      `Ekspeditør-situasjon ${idx}`,
      `Du står i ${fam.replaceAll('_',' ')} og må ta et konkret valg i butikkdriften.`,
      'Små avvik i rutiner påvirker kundeopplevelse, svinn og samarbeid utover vakta.',
      ['customer_service','cash_desk','returns','stock_flow','campaign_setup','shrinkage_control','opening_closing'][i%7],
      ['prioritering','kommunikasjon','kvalitet','samarbeid','ansvar'][i%5],
      ['tidspress','kollegapress','kundepress','måltallspress'][i%4],
      ['kortsiktig_flyt_vs_langsiktig_kontroll','unngå_konflikt_vs_ta_samtalen','snarvei_vs_standard'][i%3],
      ['tempo_vs_tillit','synlighet_vs_presisjon','komfort_vs_laring'][i%3],
      ['forste_uke_pa_gulvet','kundenes_blikk','varene_som_system','snarveien','fra_ansatt_til_fagperson'][i%5],
      baseChoices('Følg rutine og forklar valget tydelig','Velg raskeste løsning og håp det går bra')
    ]);
    idx++;
  }
}

const items = mails.map((m, i) => ({
  id:`ekspeditor_${String(i+1).padStart(3,'0')}`,
  mail_type:m[0], mail_family:m[1], role_scope:'ekspeditor',
  subject:m[2], summary:m[2], situation:m[3], task_domain:m[5], competency:m[6], pressure:m[7],
  choice_axis:m[8], consequence_axis:m[9], narrative_arc:m[10], choices:m[11]
}));

const model = { model_id:'naeringsliv_work_model', version:'1.1.0', role_scope:'ekspeditor', mails: items };
fs.writeFileSync(outPath, JSON.stringify(model, null, 2)+'\n');
console.log(`Wrote ${items.length} mails to ${outPath}`);
