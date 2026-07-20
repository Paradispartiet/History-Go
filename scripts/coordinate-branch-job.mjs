import fs from 'node:fs';

const file = 'docs/coordinates/coordinate-control-protocol.md';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  'Batch 36 (2026-07-20) gjenåpner konkrete needs_review-saker med objekt-type-først-metoden. Bare kandidater med ett entydig navngitt OSM-objekt etter dokumentert adresse-/identitetskontroll promoteres; øvrige kandidater forblir uendret.',
  'Batch 36 (2026-07-20) gjenåpner konkrete needs_review-saker med objekt-type-først-metoden. Tre steder er løst uten proxy-gjetting: Prindsen med dokumentert historisk kompleksidentitet og eksakt OSM-områdegeometri etter tvetydig Geonorge-oppslag, Hartvig Nissens skole med entydig navngitt OSM-skoleobjekt etter tvetydig adresseoppslag, og Inger Hagerups plass med eksplisitt kildekoordinat kryssjekket mot Oslo byleksikon og Oslo bykart. Sigrid Undset-statuen forblir needs_review fordi eksakt sokkelpunkt fortsatt mangler.'
);

text = text.replace(
  'Disse kontrollene er fullført, men teller ikke blant de 165 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 168 verifiserte eller kildekontrollerte canonical Oslo-stedene.'
);

fs.writeFileSync(file, text);
console.log('Coordinate protocol batch 36 documentation normalized.');
