import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const WORLD = 'data/Civication/roleWorlds/natur/natur_felt_og_formidling.json';
const full = path.join(root, WORLD);
const world = JSON.parse(fs.readFileSync(full, 'utf8'));

const threadAdditions = {
  jonas_metadata_handoff: ' Over flere dager må spilleren derfor vise at en korrekt handoff ikke bare er administrasjon, men selve forutsetningen for at artsavklaring, sikkerhetsvurdering og senere korrigering kan skje uten å dikte opp manglende feltinformasjon.',
  eva_visitor_trust: ' Når gruppens reaksjon endrer seg etter forklarte grenser, skal spilleren kunne skille kortsiktig tilfredshet fra langsiktig tillit og dokumentere hvilke publikumsbehov som faktisk kan møtes uten å gjøre sårbarhet eller artsusikkerhet usynlig.',
  tariq_site_stewardship: ' Over tid blir det avgjørende om spilleren kan gjøre stedets begrensninger til en lesbar del av feltplanen og forklare dem til både oppdragsgiver og publikum, uten å late som lokalitetsforvaltning bestemmer artsfakta eller som feltmålet overstyrer vernegrunnlaget.',
  private_role_containment: ' Relasjonen utvikler seg derfor også gjennom evnen til å avslutte arbeidsdagen med et eksplisitt neste-eier-punkt, slik at faglig usikkerhet og ansvar kan forbli i arbeidsobjektet i stedet for å bli båret som privat beredskap eller personlig status.'
};

for (const thread of world.primary_threads || []) {
  if (threadAdditions[thread.id]) thread.relationship += threadAdditions[thread.id];
  if (thread.relationship.length < 380) throw new Error(`${thread.id}: relationship ${thread.relationship.length}`);
}

const aftermathAdditions = {
  usikkert_artsfunn_blir_identitet: ' Spilleren må samtidig bevare skillet mellom ønsket om å ha oppdaget noe viktig og plikten til å la nye kjennetegn, ekspertvurdering eller manglende dokumentasjon svekke den første vurderingen. Det private rommet kan gi støtte, men ikke fungere som faglig bekreftelse.',
  publikums_misnoye_etter_grense: ' Etterklangen blir dypere når spilleren også må tåle at god publikumsservice ikke alltid betyr maksimal tilgang: en forklart grense kan være riktig selv om tilfredsheten faller. Privat støtte kan hjelpe med perspektiv, men kan ikke omgjøre lokalitetsvilkår, sårbarhetsvurdering eller arbeidsgivermandat.',
  usynlig_metadataarbeid_etter_tid: ' Det sentrale private valget er å gjøre det siste nødvendige kontrollpunktet ferdig, navngi hvem som eier resten og faktisk stoppe arbeidet der. Ellers blir usynlig profesjonelt ansvar til grenseløs personlig beredskap, samtidig som metadataene likevel ikke blir mer pålitelige av å bæres i hodet.',
  korrigert_formidling_etter_offentlighet: ' Spilleren må kunne si at en offentlig korreksjon var faglig nødvendig uten å gjøre den til et personlig nederlag, og samtidig ta ansvar for å sende rettelsen tilbake til de kanalene som faktisk mottok den første forenklingen. Privat nærhet kan romme skammen, men kan ikke erstatte den profesjonelle korrigeringshandlingen.'
};

for (const aftermath of world.private_aftermath || []) {
  if (aftermathAdditions[aftermath.id]) aftermath.description += aftermathAdditions[aftermath.id];
  if (aftermath.description.length < 350) throw new Error(`${aftermath.id}: description ${aftermath.description.length}`);
}

fs.writeFileSync(full, `${JSON.stringify(world, null, 2)}\n`);
console.log(JSON.stringify({threads: world.primary_threads.map(({id,relationship})=>({id,length:relationship.length})), aftermaths: world.private_aftermath.map(({id,description})=>({id,length:description.length}))}, null, 2));