import fs from 'node:fs';

const p='data/Civication/roleWorlds/subkultur/subkultur_program_og_koordinering.json';
const world=JSON.parse(fs.readFileSync(p,'utf8'));
const relationships={
  program_criteria_and_gatekeeping:'Programkriterier, smak, gatekeeping og begrunnelse følger hele sesongen fra første brief til ettervurdering. Tråden viser hvordan transparente kriterier kan være sosialt krevende, hvordan valg og avslag må kunne forklares, og hvordan vennskap, intern status eller miljøtilhørighet aldri får erstatte dokumentert formål, helhetsvurdering og sporbar prioritering.',
  booking_promise_contract_and_rights:'Bookingdialogen følger skillet mellom interesse, sondering, forhandling, mandat, økonomisk godkjenning, signatur, kontrakt og rettigheter gjennom flere returer. Tråden undersøker særlig hvordan relasjonell varme og tidspress kan skape falske løfter, og hvordan presis status, forbehold og dokumentert handoff beskytter både artistrelasjon og virksomhet.',
  budget_honour_and_real_work:'Total kostnad, honorar og synliggjøring av arbeid følger programmet fra første alternativ til siste ettervurdering. Tråden gjør skjult gratisarbeid, partnerbelastning, reise, produksjonsbehov og andre underbudsjetterte kostnader til reelle programkonsekvenser, slik at økonomisk realisme ikke kan ofres for å bevare et attraktivt programbilde.',
  local_scene_partnership_and_representation:'Forholdet til lokal scene og partnere undersøker lytting, representasjon, byrdefordeling, kriterier og avslag gjennom hele programsesongen. Tråden viser hvordan historisk tilhørighet og vennskap kan gi viktig kunnskap uten å bli automatisk programrett, og hvordan representasjon mister verdi dersom små aktører må bære uforholdsmessig ulønnet arbeid eller risiko.',
  publication_capacity_and_change_control:'Publisering, arena, kapasitet, logistikk og endringskontroll binder offentlig løfte til faktisk gjennomførbarhet. Tråden følger hvordan betinget booking, rom, tidsbruk, produksjonshandoff og rettighetsstatus må avklares før kommunikasjonen blir endelig, og hvordan en sen endring skal gjenåpne bare berørte ledd i stedet for å bli skjult produksjonsgjeld.',
  public_criticism_status_and_future_work:'Kritikk, synlighet og fremtidig arbeid følger hvordan spilleren forklarer programvalg, tåler legitim uenighet og møter anklager om smak, nettverk og gatekeeping. Tråden undersøker presset til å omskrive kriterier eller bruke fortrolig informasjon som statusforsvar, samtidig som langsiktig profesjonell tillit bygges gjennom konsistent begrunnelse, tidlig korreksjon og respekt for grenser.',
  private_boundary_and_recovery:'Privatlivet følger hvordan avslag, nettverkspress, kveldsarbeid, offentlig kritikk og ansvar for andres skuffelse kan lekke ut av jobben. Tråden gjør restitusjon, fortrolighet og identitetsgrense til en langsom profesjonell faktor: spilleren må kunne avslutte arbeidsdagen uten å kjøpe sosial ro med nye løfter, dele sensitiv informasjon eller gjøre programstatus til privat egenverdi.'
};
if(!Array.isArray(world.primary_threads)||world.primary_threads.length!==7) throw new Error('Expected seven primary threads');
for(const t of world.primary_threads){
  const value=relationships[t.id];
  if(!value) throw new Error(`Unexpected primary thread ${t.id}`);
  if(value.length<220) throw new Error(`Strengthened relationship still too short: ${t.id} ${value.length}`);
  t.relationship=value;
}
fs.writeFileSync(p,JSON.stringify(world,null,2)+'\n');
console.log('Strengthened all seven primary thread relationships');
