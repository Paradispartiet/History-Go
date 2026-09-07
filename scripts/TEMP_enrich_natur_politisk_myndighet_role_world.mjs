import fs from 'node:fs';

const WORLD = 'data/Civication/roleWorlds/natur/natur_politisk_myndighet.json';
const world = JSON.parse(fs.readFileSync(WORLD, 'utf8'));

const additions = {
  mandat_hjemmel_og_embetsverk: ' Den gjør det også synlig at høy intern tillit aldri kan erstatte public_office_appointment, juridisk hjemmel eller korrekt beslutningseier når saken skifter nivå; nettopp derfor må embetsverkets motstand kunne stå som institusjonell kvalitet uten å bli tolket som personlig illojalitet.',
  fag_politikk_uten_faktaomskriving: ' Tråden lar derfor både politisk handlekraft og faglig uavhengighet være sosialt reelle samtidig, uten å la den ene bli bevis for den andre.',
  regjeringssamordning_og_kompromiss: ' Den holder også fast ved at intern politisk tillit ikke kan gjøre et kompromiss til faglig evidens eller flytte myndighet fra riktig organ.',
  storting_kontroll_og_korrigering: ' Senere ståing må dermed kunne styrkes av åpen korrigering selv når den samme korrigeringen har en kortsiktig politisk kostnad.',
  offentlighet_berorte_og_tillit: ' Berørt tillit blir derfor et spørsmål om redelig prosess og lesbar konsekvens, ikke en uformell folkeavstemning om hjemmel eller vedtak.',
  implementering_og_etterkontroll: ' Implementeringsstanding kan slik vokse når statsråden tåler at nye fakta endrer kursen, uten at gjennomføringslinjen får ny myndighet av den grunn.',
  privatliv_uten_embetsmakt: ' Privat nærhet kan dermed stå i direkte kontrast til politisk omdømme uten å bli en skjult rådgivnings-, beslutnings- eller lekkasjekanal.'
};

for (const thread of world.primary_threads || []) {
  const extra = additions[thread.id];
  if (!extra) continue;
  if (!thread.relationship.includes(extra.trim())) thread.relationship += extra;
  if (thread.relationship.length < 420) {
    throw new Error(`${thread.id} remains under enriched quality floor: ${thread.relationship.length}`);
  }
}

fs.writeFileSync(WORLD, `${JSON.stringify(world, null, 2)}\n`);
console.log(Object.fromEntries((world.primary_threads || []).map((t) => [t.id, t.relationship.length])));
