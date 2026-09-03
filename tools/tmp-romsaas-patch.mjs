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

replaceOnce(
  "const desc='Romsås ble bygd ut som en samlet drabantby i første halvdel av 1970-årene etter kommunal ekspropriasjon av store arealer i 1960-årene. Romsåsteamet fordelte rundt 2600 leiligheter i seks boliggrender mellom koller, skog og høydeforskjeller. Gangsystemene ble i stor grad skilt fra biltrafikken, som ble ført rundt området og inn mot parkering ved ytterkanten. Romsås senter åpnet i 1972, mens T-banestasjonen åpnet i 1974 som en fjellstasjon tegnet av Håkon Mjelva.';",
  "const desc='Romsås ble bygd ut som en samlet drabantby fra omkring 1970 etter kommunal ekspropriasjon av store arealer i 1960-årene. Romsåsteamet fordelte rundt 2600 leiligheter i seks boliggrender mellom koller, skog og høydeforskjeller. Gangsystemene ble i stor grad skilt fra biltrafikken, som ble ført rundt området og inn mot parkering ved ytterkanten. Romsås senter åpnet i 1972, mens T-banestasjonen åpnet i 1974 som en fjellstasjon tegnet av Håkon Mjelva.';",
  'description strong-claim wording'
);

replaceOnce(
  "const popupDesc='Før drabantbyen var Romsås et jord- og skogbruksområde med gårdsdrift, steinbrudd og bosetting knyttet til blant annet steinhogging. I 1960-årene eksproprierte Oslo kommune store arealer for en samlet boligplan på høydene nord for Grorud. Utbyggingen skjøt fart omkring 1970 og hoveddelen av boligene kom i perioden 1970–74. Romsåsteamet bestod av Alex Christiansen, Trygve Kleiven, Randi Kippgen, Olav Holm, Nils Rosland og Alf Bastiansen. Omtrent 2600 leiligheter ble fordelt på seks grender: Tiurleiken, Orremyr, Ravnkollen, Emanuelfjell, Svarttjern og Røverkollen. Blokkene ble lagt mellom terrengformene, og gangforbindelser bandt grendene sammen mens biltrafikken i stor grad ble holdt i randsonene. Oslo kommunes nyere byplanhistorie framhever bilfrie tun, naturkontakt og lokale møteplasser som sentrale kvaliteter i planen. Romsås senter åpnet i 1972 som et lokalt handels- og servicesenter. T-banestasjonen åpnet i 1974, ble tegnet av Håkon Mjelva og ble senere registrert som verneverdig; Sporveien framhever det detaljerte betongarbeidet og 1970-tallsuttrykket. Stasjonen fikk Betongtavlen i 1976 og rommer bronseskulpturen «Den spillende døren» av Bjørn Evensen. Svarttjernparken åpnet i 2009 og viser hvordan den opprinnelige drabantbystrukturen senere er supplert med nye offentlige funksjoner. Dagens Romsås kan derfor leses som flere lag samtidig: eldre stein- og gårdshistorie, 1970-tallets helhetlige plan, senere oppgraderinger og en sterk lokal stedsidentitet.';",
  "const popupDesc='Før drabantbyutbyggingen var Romsås et jord- og skogbruksområde med gårdsdrift, steinbrudd og bosetting knyttet til steinhogging. I 1960-årene eksproprierte Oslo kommune store arealer på høydene nord for Grorud for å legge til rette for en samlet boligplan. Utbyggingen skjøt fart omkring 1970, og hoveddelen av boligene kom i årene fram til 1974. Romsåsteamet bestod av Alex Christiansen, Trygve Kleiven, Randi Kippgen, Olav Holm, Nils Rosland og Alf Bastiansen. Omtrent 2600 leiligheter ble fordelt på seks grender med navnene Tiurleiken, Orremyr, Ravnkollen, Emanuelfjell, Svarttjern og Røverkollen.\\n\\nPlanen organiserte boligene som grender i et kupert landskap, med naturkontakt som en uttalt kvalitet i kommunens nyere framstilling av området. Området ble ikke lagt ut som ett sammenhengende flatt kvartalsmønster, men som flere delområder rundt landskapets høyder og grøntdrag. Gangforbindelsene bandt boligområdene sammen, mens biltrafikken i stor grad ble skilt fra de interne gangsystemene og lagt mot randsonene. Oslo kommunes byplanhistorie framhever også bilfrie tun og lokale møteplasser som deler av planens kvaliteter. Romsås senter åpnet i 1972 og etablerte et lokalt handels- og servicesenter i den nye drabantbyen. T-banestasjonen åpnet i 1974 som en fjellstasjon tegnet av Håkon Mjelva, og forbindelsen mellom senteret og banen ga området et tydelig kollektivknutepunkt.\\n\\nStasjonen fikk Betongtavlen i 1976 og rommer bronseskulpturen «Den spillende døren» av Bjørn Evensen. Sporveien beskriver stasjonen gjennom det detaljerte betongarbeidet og 1970-tallsuttrykket, samtidig som anlegget senere er registrert som verneverdig. Romsås kirke fikk et nytt bygg tatt i bruk i 1995 etter at den tidligere kirken brant i 1986. Svarttjernparken åpnet i 2009 og er et senere offentlig lag innenfor boligområdets eldre planstruktur. Oslo kommune bruker Don Martin som eksempel på hvordan Romsås-identitet også uttrykkes kunstnerisk, noe som gir en annen type kilde til stedsidentitet enn selve byformen. Romsås kan slik leses gjennom flere dokumenterte lag: eldre gårds- og steinindustri, boligbyggingen omkring 1970, transport- og senterstrukturen, og senere offentlige investeringer.';",
  'popup depth and paragraph structure'
);

replaceOnce(
  " ['traffic','Gangsystemer og biltrafikk ble i stor grad skilt fra hverandre.',urls.municipality,'Planprinsipper','official','ordinary','current'],",
  " ['traffic','Gangsystemer og biltrafikk ble i stor grad skilt fra hverandre.',urls.municipality,'Planprinsipper','official','ordinary','current'],\n ['terrain','Romsås-planen organiserer boliggrender i tett kontakt med kupert terreng og natur.',urls.municipality,'Planprinsipper','official','ordinary','current'],",
  'terrain claim insertion'
);

replaceOnce(
  " ['station','Romsås T-banestasjon åpnet i 1974 og ble tegnet av Håkon Mjelva.',urls.station,'Om stasjonen','official','ordinary','historical',1974],",
  " ['station','Romsås T-banestasjon åpnet i 1974 og ble tegnet av Håkon Mjelva.',urls.station,'Om stasjonen','official','ordinary','historical',1974],\n ['stationdetail','Sporveien framhever Romsås stasjons detaljerte betongarbeid og 1970-tallsuttrykk, og anlegget er registrert som verneverdig.',urls.station,'Om stasjonen','official','ordinary','current'],",
  'station detail claim insertion'
);

replaceOnce(
  "const popupCoverage=coverage(popupDesc,[['claim_romsaås_prehistory'],['claim_romsaås_expropriation'],['claim_romsaås_construction'],['claim_romsaås_team'],['claim_romsaås_grender','claim_romsaås_apartments'],['claim_romsaås_traffic'],['claim_romsaås_planquality'],['claim_romsaås_center'],['claim_romsaås_station'],['claim_romsaås_betong','claim_romsaås_art'],['claim_romsaås_park'],['claim_romsaås_prehistory','claim_romsaås_construction','claim_romsaås_station','claim_romsaås_park','claim_romsaås_identitydon']]);",
  "const popupCoverage=coverage(popupDesc,[['claim_romsaås_prehistory'],['claim_romsaås_expropriation'],['claim_romsaås_construction'],['claim_romsaås_team'],['claim_romsaås_grender','claim_romsaås_apartments'],['claim_romsaås_terrain','claim_romsaås_planquality'],['claim_romsaås_terrain'],['claim_romsaås_traffic'],['claim_romsaås_planquality'],['claim_romsaås_center'],['claim_romsaås_station','claim_romsaås_center'],['claim_romsaås_betong','claim_romsaås_art'],['claim_romsaås_stationdetail'],['claim_romsaås_church'],['claim_romsaås_park'],['claim_romsaås_identitydon'],['claim_romsaås_prehistory','claim_romsaås_construction','claim_romsaås_center','claim_romsaås_station','claim_romsaås_park']]);",
  'expanded popup coverage'
);

replaceOnce(
  "questions:questions.slice(0,8).map(x=>({question:x.question,answer:x.answer,type:x.question_type,normalKnowledgeQuestion:true,claimIds:[x.claim_id]}))",
  "questions:[{question:'Hva slags byområde er Romsås?',answer:'En planlagt drabantby',type:'hva',normalKnowledgeQuestion:true,claimIds:['claim_romsaås_identity']},{question:'Når skjøt hovedutbyggingen av Romsås fart?',answer:'Omkring 1970',type:'når',normalKnowledgeQuestion:true,claimIds:['claim_romsaås_construction']},{question:'Hvem inngikk i Romsåsteamet?',answer:'Alex Christiansen, Trygve Kleiven, Randi Kippgen, Olav Holm, Nils Rosland og Alf Bastiansen',type:'hvem',normalKnowledgeQuestion:true,claimIds:['claim_romsaås_team']},{question:'Hvor ble omtrent 2600 leiligheter organisert?',answer:'I seks boliggrender på Romsås',type:'hvor',normalKnowledgeQuestion:true,claimIds:['claim_romsaås_grender','claim_romsaås_apartments']},{question:'Hva ble i stor grad skilt fra biltrafikken i planen?',answer:'De interne gangsystemene',type:'hva',normalKnowledgeQuestion:true,claimIds:['claim_romsaås_traffic']},{question:'Når åpnet Romsås senter?',answer:'I 1972',type:'når',normalKnowledgeQuestion:true,claimIds:['claim_romsaås_center']},{question:'Hvem tegnet Romsås T-banestasjon?',answer:'Håkon Mjelva',type:'hvem',normalKnowledgeQuestion:true,claimIds:['claim_romsaås_station']},{question:'Hvilket verk av Bjørn Evensen finnes på Romsås stasjon?',answer:'«Den spillende døren»',type:'hvilket_verk_eller_objekt',normalKnowledgeQuestion:true,claimIds:['claim_romsaås_art']}]",
  'Description quiz readiness'
);

if (!text.includes('claim_romsaås_')) throw new Error('Expected accented Romsås claim IDs not found');
text = text.replaceAll('claim_romsaås_', 'claim_romsaas_');

fs.writeFileSync(file, text);
