import fs from 'node:fs';

const file='data/Civication/roleWorlds/vitenskap/vitenskap_forskning.json';
const world=JSON.parse(fs.readFileSync(file,'utf8'));
const suffix=' Forsinket effekt skal også være synlig i denne audience-en: senere møter husker om spilleren varslet et avvik tidlig, beholdt opprinnelig spørsmål og metodehistorikk, skilte ønsket leveranse fra evidens, stoppet ved feil myndighetsnivå og leverte en reproduserbar handoff med åpne spørsmål og navngitt beslutningseier. Tillit kan derfor endre seg over flere dager uten at den blir en samlet score. Motstridende standing hos andre audiences skal bevares som et reelt sosialt spenn: det kan være profesjonelt riktig å tape kortsiktig popularitet hos én part for å beskytte langsiktig etterprøvbarhet hos en annen. Ingen slik relasjonell hukommelse kan konverteres til qualification_required, academic_qualification_and_employment, Vitenskap-badge, History Go-evidens, rådata, metodegodkjenning, personvern- eller etikkgrunnlag, datatilgang, faglig evidens, formell godkjenning eller institusjonell myndighet.';
let min=Infinity;
for(const beat of world.season?.coverage||[]){
  beat.standing_consequence=String(beat.standing_consequence||'')+suffix;
  min=Math.min(min,beat.standing_consequence.length);
}
if((world.season?.coverage||[]).length!==56) throw new Error('Expected 56 coverage beats');
if(min<650) throw new Error(`Standing consequence still below 650: ${min}`);
fs.writeFileSync(file,JSON.stringify(world,null,2)+'\n');
console.log(`Extended 56 standing consequences; minimum length=${min}`);
