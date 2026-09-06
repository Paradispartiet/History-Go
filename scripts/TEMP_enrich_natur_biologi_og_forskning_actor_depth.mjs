import fs from 'node:fs';

const MODEL = 'data/Civication/roleModels/natur/natur_biologi_og_forskning.json';
const model = JSON.parse(fs.readFileSync(MODEL, 'utf8'));

const additions = {
  ingrid_seniorforsker_natur_biologi_og_forskning:
    'Ingrid gjør forskningsdesign, hypoteseprøving, alternative forklaringer, usikkerhet og review konkret og krever at prosjektet kan produsere et faglig meningsfullt negativt resultat. Hun binder forhåndsdefinerte kriterier, metodeversjon, kontrollgrunnlag og senere revisjon sammen, slik at endret konklusjon kan spores til ny evidens i stedet for status, bestillerpress eller personlig eierskap til hypotesen.',
  marius_feltkoordinator_natur_biologi_og_forskning:
    'Marius bærer feltmetode, lokalitets- og prøvespor, praktiske avvik og skiftende naturforhold og sørger for at variasjon i felt ikke blir slettet i ettertid. Han holder tidspunkt, habitat, vær, prøvetakingsvalg, observatør, sikkerhetsavvik og avvik fra design samlet, slik at senere analyse kan skille biologisk variasjon fra måle- eller innsamlingsfeil og vite hvilke prøver som faktisk kan sammenlignes.',
  leila_laboratorieansvarlig_natur_biologi_og_forskning:
    'Leila bærer laboratoriekvalitet, prøve-ID, kontrollserier, kalibrering, mulig kontaminasjon og retten til å stoppe en prøveflyt når kvaliteten ikke er tilstrekkelig dokumentert. Hun kobler mottak, lagring, preparering, kontrollmateriale, instrumentstatus og avvik til hver berørte prøve, slik at et senere kvalitetssignal kan avgrenses og reanalyseres uten å gjøre hele laboratorieperioden kunstig sikker eller usporbar.',
  noah_statistiker_dataforvalter_natur_biologi_og_forskning:
    'Noah bærer datasettversjoner, transformasjoner, manglende data, statistiske antakelser, kode-/analysevalg og reproduserbarhet mellom rådata og rapportert resultat. Han gjør det synlig hvilke filtreringer, modeller, sensitivitetsanalyser og beslutninger som faktisk endrer estimat eller usikkerhet, slik at samme analyse kan gjentas, alternative modeller kan sammenlignes og et senere replikasjonsavvik kan spores uten å omskrive rådata.'
};

const people = model.related_people || [];
for (const [id, text] of Object.entries(additions)) {
  const person = people.find((row) => row.id === id);
  if (!person) throw new Error(`Missing actor: ${id}`);
  person.function = text;
}

for (const person of people.filter((row) => Object.hasOwn(additions, row.id))) {
  if (person.function.length < 220) throw new Error(`${person.id}: function ${person.function.length}`);
  if ((person.authority_relation || '').length < 250) throw new Error(`${person.id}: authority_relation ${(person.authority_relation || '').length}`);
}

fs.writeFileSync(MODEL, `${JSON.stringify(model, null, 2)}\n`);
console.log(JSON.stringify(Object.fromEntries(people.filter((row) => Object.hasOwn(additions, row.id)).map((row) => [row.id, {function: row.function.length, authority_relation: row.authority_relation.length}])), null, 2));
