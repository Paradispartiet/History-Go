import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const WORLD = 'data/Civication/roleWorlds/natur/natur_miljoledelse.json';
const full = path.join(ROOT, WORLD);

if (!fs.existsSync(full)) throw new Error(`Missing materialized Role World: ${WORLD}`);
const world = JSON.parse(fs.readFileSync(full, 'utf8'));
const audiences = world.situated_reputation_model?.audiences;
if (!Array.isArray(audiences) || audiences.length !== 7) {
  throw new Error(`Expected 7 situated-reputation audiences, got ${audiences?.length ?? 'missing'}`);
}

const additions = {
  miljorisiko_avvik_og_etterlevelse: ' Rest-risiko skal forbli eksplisitt åpen til påkrevd kontroll, dokumentasjon og etterkontroll faktisk finnes; budsjettpress, leveransetakt, omdømme eller appointment kan ikke nedgradere alvorlighetsgrad eller erstatte miljøfaglig evidens. Dersom tiltakseffekt er usikker, nye data endrer risikobildet eller kontrollkravet skjerpes, må berørt avviks- og tiltaksspor gjenåpnes og eskaleres til den eieren eller det mandatnivået som faktisk kan beslutte videre håndtering.',
  medarbeidere_og_lederlinje: ' Lederstanding kan heller ikke gjøre frivillig ekstraarbeid til varig kapasitet, normalisere overtid som bemanningsmodell eller flytte faglig og moralsk risiko nedover til den som har minst formell makt. Når kompetanse, tid eller støtte ikke matcher ansvaret, må lederen redusere scope, omfordele arbeid eller eskalere behovet; en lojal medarbeiderreaksjon er aldri samtykke til uforsvarlig belastning eller bevis på at delegeringen var forsvarlig.',
  toppledelse_og_virksomhetsstyring: ' Toppledelsens tillit kan påvirke hvor raskt en sak får oppmerksomhet, men kan ikke gjøre en ønsket KPI, tidsfrist eller omdømmefortelling sannere enn dokumentert miljørisiko og reell kapasitet. Dersom et mål bare kan nås ved å skjule restanse, svekke kontroll eller bruke fullmakt lederen ikke har, må beslutningsgrunnlaget vise konflikten og løfte den til riktig styringsnivå fremfor å behandle høy standing som stilltiende godkjenning.',
  lederkolleger_og_tverrfaglige_partnere: ' Peer-standing kan heller ikke gjøre muntlig forståelse til akseptert handoff når premisser, rest-risiko, avhengigheter eller neste eier fortsatt er uklare. Dersom en annen funksjon mangler myndighet, kompetanse eller kapasitet til å overta, skal saken returneres eller eskaleres med sporbar begrunnelse; kollegial velvilje er ikke samtykke til å flytte ansvar, og tverrfaglig konsensus kan ikke oppheve et dokumentert faglig forbehold.',
  private_relations: ' Privat nærhet kan heller ikke brukes til å outsource lederens moralske ansvar, søke uformell godkjenning for en arbeidsbeslutning eller gjøre hjemmet til permanent beredskapsrom. Når arbeidspress, skyld eller statusangst lekker over, er den relevante grensen å beskytte konfidensialitet, restitusjon og den andres rett til et forhold uten organisatorisk ansvar; støtte hjemme kan påvirke hvordan lederen tåler belastningen, men aldri hvem som eier saken på jobb.'
};

for (const audience of audiences) {
  const addition = additions[audience.id];
  if (addition && !audience.cannot_grant.includes(addition.trim())) {
    audience.cannot_grant += addition;
  }
}

const lengths = Object.fromEntries(audiences.map((audience) => [audience.id, audience.cannot_grant.length]));
for (const [id, length] of Object.entries(lengths)) {
  if (length < 650) throw new Error(`Standing authority boundary still too shallow: ${id}/${length}`);
}

fs.writeFileSync(full, `${JSON.stringify(world, null, 2)}\n`);
console.log(JSON.stringify({ world: WORLD, boundary_lengths: lengths }, null, 2));
