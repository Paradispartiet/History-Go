import fs from 'node:fs';

const file = 'tools/tmp-finalize-romsaas-completion.mjs';
let text = fs.readFileSync(file, 'utf8');

function replaceOnce(before, after, label) {
  if (!text.includes(before)) throw new Error(`Expected Romsås ${label} not found`);
  text = text.replace(before, after);
}

replaceOnce(
  "const claims=q.map((row,i)=>({claim_id:`claim_romsaås_quiz_${String(i+1).padStart(2,'0')}`,order:i+1,planned_phase:i<7?'opening':i<14?'middle':i<21?'bridge':'final',family:i>=21?'concept_theory':row[7]==='context'?'context':'fact',statement:row[4],source_ids:[row[5]],source_origin:'external',emne_id:row[6]}));",
  "const claims=q.map((row,i)=>({claim_id:`claim_romsaås_quiz_${String(i+1).padStart(2,'0')}`,order:i+1,planned_phase:i<7?'opening':i<14?'middle':i<21?'bridge':'final',family:i>=21?'concept_theory':row[6]==='context'?'context':'fact',statement:row[3],source_ids:[row[4]],source_origin:'external',emne_id:row[5]}));",
  'claims mapping'
);

if (!text.includes('Nils A. Rosland')) throw new Error('Expected abbreviated Romsås architect name not found');
text = text.replaceAll('Nils A. Rosland', 'Nils Rosland');

replaceOnce(
  " ['identity','Romsås er en planlagt drabantby øverst i Groruddalen.',urls.byleksikon,'Romsås','institutional','identity','current'],",
  " ['prehistory','Før drabantbyen var Romsås et jordbruks- og skogbruksområde med steinindustri og bosetting knyttet til steinhogging.',urls.byleksikon,'Romsås før utbyggingen','institutional','ordinary','historical'],\n ['identity','Romsås er en planlagt drabantby øverst i Groruddalen.',urls.byleksikon,'Romsås','institutional','identity','current'],",
  'prehistory claim insertion'
);

replaceOnce(
  "const popupCoverage=coverage(popupDesc,[['claim_romsaås_identity'],['claim_romsaås_expropriation'],['claim_romsaås_construction'],['claim_romsaås_team'],['claim_romsaås_grender','claim_romsaås_apartments'],['claim_romsaås_traffic'],['claim_romsaås_planquality'],['claim_romsaås_center'],['claim_romsaås_station'],['claim_romsaås_betong','claim_romsaås_art'],['claim_romsaås_park'],['claim_romsaås_identity','claim_romsaås_planquality']]);",
  "const popupCoverage=coverage(popupDesc,[['claim_romsaås_prehistory'],['claim_romsaås_expropriation'],['claim_romsaås_construction'],['claim_romsaås_team'],['claim_romsaås_grender','claim_romsaås_apartments'],['claim_romsaås_traffic'],['claim_romsaås_planquality'],['claim_romsaås_center'],['claim_romsaås_station'],['claim_romsaås_betong','claim_romsaås_art'],['claim_romsaås_park'],['claim_romsaås_prehistory','claim_romsaås_construction','claim_romsaås_station','claim_romsaås_park','claim_romsaås_identitydon']]);",
  'popup coverage mapping'
);

replaceOnce(
  "guiding_questions:['Hvordan følger boliggrendene terrenget?','Hvor blir trafikkseparasjonen tydeligst?','Hvordan fungerer senter og T-bane som felles knutepunkt?','Hva kan observeres direkte, og hva må dokumenteres i kilder?','Hvordan skiller man planmål fra senere sosialt utfall?','Hvilke senere lag har endret Romsås uten å fjerne grunnstrukturen?'],",
  "guiding_questions:['Hvordan kan boliggrendenes plassering leses i terrenget på Romsås?','Hvor i Romsås blir skillet mellom gangforbindelser og biltrafikk tydeligst?','Hvordan fungerer senter og T-bane som felles knutepunkt?','Hva kan observeres direkte, og hva må dokumenteres i kilder?','Hvordan skiller man planmål fra senere sosialt utfall?','Hvilke senere lag har endret Romsås uten å fjerne grunnstrukturen?'],",
  'guiding questions'
);

replaceOnce(
  "{title:'Fjellstasjonen',observation:'Betong, fjellrom og vertikal adkomst gjør transportinfrastrukturen fysisk markant.',interpretation_boundary:'Eksakte tekniske mål og vernevurderinger skal hentes fra dokumentasjon, ikke anslås i felt.',source_urls:[urls.station]}",
  "{title:'Fjellstasjonen som transportrom',observation:'Betong, fjellrom og vertikal adkomst gjør transportinfrastrukturen fysisk markant.',interpretation_boundary:'Eksakte tekniske mål og vernevurderinger skal hentes fra dokumentasjon, ikke anslås i felt.',source_urls:[urls.station]}",
  'station trace'
);

replaceOnce(
  "source_urls:[urls.byleksikon,urls.municipality,urls.center,urls.station,urls.obos,urls.park],verified_at:verifiedAt",
  "source_urls:[urls.byleksikon,urls.municipality,urls.center,urls.station,urls.obos,urls.obosJubilee,urls.park],verified_at:verifiedAt",
  'top-level Fagverk sources'
);

replaceOnce(
  "{type:'official',label:'OBOS – historien om OBOS',url:urls.obos,verifiedAt},{type:'source',label:'Oslo byleksikon – Svarttjernparken',url:urls.park,verifiedAt}",
  "{type:'official',label:'OBOS – historien om OBOS',url:urls.obos,verifiedAt},{type:'official',label:'OBOS – borettslagsjubilanter på Romsås',url:urls.obosJubilee,verifiedAt},{type:'source',label:'Oslo byleksikon – Svarttjernparken',url:urls.park,verifiedAt}",
  'OBOS external link area'
);

replaceOnce(
  "write(placeFile,place);",
  "write(placeFile,place);\nconst fagverkRegistry=read('data/fagverk/fagverk_registry.json');fagverkRegistry.placeLinks??={};fagverkRegistry.placeLinks[placeId]={sourceFile:placeFile.replace(/^data\\//,''),field:'fagverk',schema:fagverk.schema,level:fagverk.level,status:fagverk.status};write('data/fagverk/fagverk_registry.json',fagverkRegistry);",
  'Fagverk registry write'
);

const invalidKu = "primary_knowledge_unit_id:`ku_by_romsaås_${String(n).padStart(2,'0')}`,knowledge_unit_ids:[`ku_by_romsaås_${String(n).padStart(2,'0')}`]";
const validKu = "primary_knowledge_unit_id:`ku_by_romsaas_${String(n).padStart(2,'0')}`,knowledge_unit_ids:[`ku_by_romsaas_${String(n).padStart(2,'0')}`]";
replaceOnce(invalidKu, validKu, 'knowledge unit IDs');

fs.writeFileSync(file, text);
