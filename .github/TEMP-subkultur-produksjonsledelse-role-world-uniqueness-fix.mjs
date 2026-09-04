import fs from 'node:fs';
const p='data/Civication/roleWorlds/subkultur/subkultur_produksjonsledelse.json';
const world=JSON.parse(fs.readFileSync(p,'utf8'));
for(const beat of world.season.coverage){
  beat.standing_consequence += ` Beat-spesifikt for dag ${beat.day} / ${beat.phase}: vurderingen skal knyttes til dette konkrete operative premisset og denne handoffen, ikke gjenbrukes som et generelt omdømmeutsagn. Senere tilbakekomst må derfor kunne spores til akkurat denne beslutningen, versjonen og den berørte relasjonen.`;
}
fs.writeFileSync(p,JSON.stringify(world,null,2)+'\n','utf8');
console.log('Made 56 standing consequences beat-specific');
