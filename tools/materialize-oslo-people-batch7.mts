import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file: string, value: unknown) => {
  const slash = file.lastIndexOf('/');
  if (slash !== -1) fs.mkdirSync(file.slice(0, slash), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const run = (command: string, args: string[]) => execFileSync(command, args, { stdio: 'inherit' });

run('npx', ['tsx', 'tools/audit-oslo-people-coverage.mts']);
run('npx', ['tsx', 'tools/audit-oslo-people-batch7-candidates.mts']);
const baseline = readJson('reports/oslo-people-coverage.json');
const candidateAudit = readJson('reports/oslo-people-batch7-candidate-audit.json');

const targetPlaceIds = ['det_andre_teatret','grusomhetens_teater','nordic_black_theatre_cafeteatret','teater_manu','centralteatret','dramatikkens_hus'];
const expectedIds = ['nils_petter_morland','lars_oyno','cliff_a_moustache','jarl_solberg','mira_zuckermann','harald_otto','anne_may_nilsen'];
const baselineUncovered = new Set((baseline.uncoveredRequired ?? []).map((place: { placeId: string }) => place.placeId));
for (const placeId of targetPlaceIds) if (!baselineUncovered.has(placeId)) throw new Error(`Target place is not uncovered at baseline: ${placeId}`);
for (const candidate of candidateAudit.candidates ?? []) if ((candidate.matches ?? []).length !== 0) throw new Error(`Batch 7 forbids reuse; existing candidate found: ${candidate.key}`);
for (const target of candidateAudit.targetPlaces ?? []) if ((target.matches ?? []).length !== 0) throw new Error(`Target already has People link: ${target.placeId}`);

const manifestPath = 'data/people/manifest.json';
const manifest = readJson(manifestPath) as { files: string[] };
const newManifestEntries = [
  'people/scenekunst/oslo/det_andre_teatret/nils_petter_morland.json',
  'people/scenekunst/oslo/grusomhetens_teater/lars_oyno.json',
  'people/scenekunst/oslo/nordic_black_theatre_cafeteatret/cliff_a_moustache.json',
  'people/scenekunst/oslo/nordic_black_theatre_cafeteatret/jarl_solberg.json',
  'people/scenekunst/oslo/teater_manu/mira_zuckermann.json',
  'people/scenekunst/oslo/centralteatret/harald_otto.json',
  'people/scenekunst/oslo/dramatikkens_hus/anne_may_nilsen.json'
];
for (const entry of newManifestEntries) {
  if (manifest.files.includes(entry)) throw new Error(`Manifest entry already exists: ${entry}`);
  manifest.files.push(entry);
}
writeJson(manifestPath, manifest);

writeJson('data/people/scenekunst/oslo/det_andre_teatret/nils_petter_morland.json', [{
  id: 'nils_petter_morland', name: 'Nils Petter Mørland', initials: 'NPM',
  desc: 'Teaterskaperen som var med på å etablere Det Andre Teatret og ledet teatret i oppstartsperioden.',
  tags: ['scenekunst','improvisasjon','grunnlegger','teatersjef','det_andre_teatret','lilleborg'],
  placeId: 'det_andre_teatret', category: 'scenekunst', year: 2011,
  popupDesc: 'Nils Petter Mørland var med på å etablere Det Andre Teatret da improscenen åpnet på Lilleborg i 2011, og var teatersjef fra 2011 til 2016. Rollen hans gjelder oppbyggingen av den faste institusjonen – repertoar, ensemble, frivillighet og publikumsarena – ikke bare enkeltforestillinger. Han er derfor et stedsspesifikt grunnlegger- og lederanker for hovedscenen.',
  places: ['det_andre_teatret'], image: '', cardImage: '',
  source_urls: ['https://detandreteatret.no/om','https://snl.no/Det_Andre_Teateret'], verifiedAt: '2026-07-25'
}]);

writeJson('data/people/scenekunst/oslo/grusomhetens_teater/lars_oyno.json', [{
  id: 'lars_oyno', name: 'Lars Øyno', initials: 'LØ',
  desc: 'Grunnleggeren og den kunstneriske lederen bak Grusomhetens Teater og scenen i Hausmanns gate.',
  tags: ['scenekunst','fysisk_teater','grunnlegger','kunstnerisk_leder','grusomhetens_teater','hausmannsgate'],
  placeId: 'grusomhetens_teater', category: 'scenekunst', year: 1992,
  popupDesc: 'Lars Øyno grunnla Grusomhetens Teater, som ble etablert som egen gruppe i 1992 etter sin første produksjon i 1989. Han har utviklet kompaniets fysiske og Artaud-inspirerte teaterspråk og ledet arbeidet med den egne scenen i Hausmanns gate 34, som teatret har hatt siden 2002. Koblingen gjelder både grunnleggelsen, den kunstneriske profilen og den konkrete faste scenen.',
  places: ['grusomhetens_teater'], image: '', cardImage: '',
  source_urls: ['https://www.grusomhetensteater.no/kompaniet/','https://www.grusomhetensteater.no/kontakt/'], verifiedAt: '2026-07-25'
}]);

writeJson('data/people/scenekunst/oslo/nordic_black_theatre_cafeteatret/cliff_a_moustache.json', [{
  id: 'cliff_a_moustache', name: 'Cliff A. Moustache', initials: 'CAM',
  desc: 'Medgrunnleggeren og den kunstneriske lederen som bygget Nordic Black Theatre og Cafeteatrets transkulturelle sceneprofil.',
  tags: ['scenekunst','grunnlegger','kunstnerisk_leder','transkulturell_scenekunst','nordic_black_theatre_cafeteatret','gronland'],
  placeId: 'nordic_black_theatre_cafeteatret', category: 'scenekunst', year: 1992,
  popupDesc: 'Cliff A. Moustache grunnla Nordic Black Theatre sammen med Jarl Solberg i 1992 og har vært teatrets kunstneriske leder. Da institusjonen fikk hjem i den tidligere metodistkirken i Hollendergata 8 i 2011, fulgte han med på å forme Cafeteatret som scene for teater, konserter, poesi, debatt og utvikling av transkulturelle kunstnere. Koblingen er en direkte grunnlegger- og kunstnerisk lederrolle ved stedet.',
  places: ['nordic_black_theatre_cafeteatret'], image: '', cardImage: '', source_urls: ['https://nordicblacktheatre.no/info'], verifiedAt: '2026-07-25'
}]);

writeJson('data/people/scenekunst/oslo/nordic_black_theatre_cafeteatret/jarl_solberg.json', [{
  id: 'jarl_solberg', name: 'Jarl Solberg', initials: 'JS',
  desc: 'Medgrunnleggeren og daglige lederen som bygget Nordic Black Theatre som varig institusjon og drev Cafeteatret.',
  tags: ['scenekunst','grunnlegger','daglig_leder','institusjonsbygger','nordic_black_theatre_cafeteatret','gronland'],
  placeId: 'nordic_black_theatre_cafeteatret', category: 'scenekunst', year: 1992,
  popupDesc: 'Jarl Solberg grunnla Nordic Black Theatre sammen med Cliff A. Moustache i 1992 og har hatt det daglige lederansvaret. Han fulgte institusjonen gjennom Parkteatret, teaterbåten MS Innvik og etableringen i Cafeteatret i Hollendergata 8 fra 2011. Rollen hans gjelder den langsiktige organisatoriske og praktiske oppbyggingen av akkurat denne teaterinstitusjonen og dens faste hjem på Grønland.',
  places: ['nordic_black_theatre_cafeteatret'], image: '', cardImage: '', source_urls: ['https://nordicblacktheatre.no/info'], verifiedAt: '2026-07-25'
}]);

writeJson('data/people/scenekunst/oslo/teater_manu/mira_zuckermann.json', [{
  id: 'mira_zuckermann', name: 'Mira Zuckermann', initials: 'MZ',
  desc: 'Pioneren som utredet, bygget opp og ledet Norges nasjonale tegnspråkteater gjennom de første to tiårene.',
  tags: ['scenekunst','tegnsprak','teatersjef','institusjonsbygger','teater_manu','grunerlokka'],
  placeId: 'teater_manu', category: 'scenekunst', year: 1998,
  popupDesc: 'Mira Zuckermann skrev den første utredningen om et norsk tegnspråkteater i 1987, ble prosjektleder da forsøksvirksomheten fikk finansiering i 1998 og var teatrets første sjef fram til utgangen av 2021. Hun ledet den første profesjonelle tegnspråkproduksjonen i 1999 og oppbyggingen av institusjonen som fra 2004 fikk fast hjem i Schleppegrells gate 32. Dette er en direkte stifter-, leder- og teaterhusforbindelse.',
  places: ['teater_manu'], image: '', cardImage: '',
  source_urls: ['https://teatermanu.no/om-teater-manu','https://teatermanu.no/artikler/janne-langaas-blir-ny-teatersjef-for-teater-manu/'], verifiedAt: '2026-07-25'
}]);

writeJson('data/people/scenekunst/oslo/centralteatret/harald_otto.json', [{
  id: 'harald_otto', name: 'Harald Otto', initials: 'HO',
  desc: 'Skuespilleren og teaterlederen som eide og ledet Centralteatret gjennom mer enn et kvart århundre.',
  tags: ['scenekunst','teatersjef','teatereier','centralteatret','privatteater','oslo_teaterhistorie'],
  placeId: 'centralteatret', category: 'scenekunst', year: 1902,
  popupDesc: 'Harald Otto kjøpte Centralteatret i 1902 og var både eier og teatersjef fram til 1928. Under hans ledelse ble scenen en stabil privat teaterinstitusjon i Akersgata, og familien Otto videreførte driften i flere tiår. Koblingen gjelder derfor et langvarig, fysisk og organisatorisk eierskap til Centralteatret – ikke bare en rolle på scenen.',
  places: ['centralteatret'], image: '', cardImage: '', source_urls: ['https://oslonye.no/historikk/'], verifiedAt: '2026-07-25'
}]);

writeJson('data/people/scenekunst/oslo/dramatikkens_hus/anne_may_nilsen.json', [{
  id: 'anne_may_nilsen', name: 'Anne-May Nilsen', initials: 'AMN',
  desc: 'Initiativtakeren, medstifteren og første teatersjefen for Det Åpne Teater, forløperen til Dramatikkens hus.',
  tags: ['scenekunst','grunnlegger','teatersjef','ny_dramatikk','dramatikkens_hus','gronland'],
  placeId: 'dramatikkens_hus', category: 'scenekunst', year: 1986,
  popupDesc: 'Anne-May Nilsen tok initiativ til Det Åpne Teater, var en av stifterne og teatersjef fra 1986 til 1999. Teatret flyttet inn i det nedslitte tidligere sveiseverkstedet i Tøyenbekken 34 i 1987, rehabiliterte bygningen og bidro til at den ble reddet fra rivning. Stiftelsen skiftet navn til Dramatikkens hus i 2010. Hun er dermed et direkte grunnlegger-, leder- og bygningsredningsanker for stedet.',
  places: ['dramatikkens_hus'], image: '', cardImage: '', source_urls: ['https://www.dramatikkenshus.no/om-oss'], verifiedAt: '2026-07-25'
}]);

run('npx', ['tsx', 'scripts/build-civication-history-people-index.mts']);
run('npx', ['tsx', 'tools/audit-oslo-people-coverage.mts']);
run('npx', ['tsx', 'tools/audit-oslo-latent-people-coverage.mts']);
const coverage = readJson('reports/oslo-people-coverage.json');
const before = baseline.totals;
const after = coverage.totals;
if (after.requiredNonNaturePlaces !== before.requiredNonNaturePlaces) throw new Error(`Required Oslo place count changed inside batch: ${before.requiredNonNaturePlaces} -> ${after.requiredNonNaturePlaces}`);
if (after.coveredRequiredPlaces !== before.coveredRequiredPlaces + 6 || after.uncoveredRequiredPlaces !== before.uncoveredRequiredPlaces - 6) throw new Error(`Unexpected Oslo coverage delta: ${JSON.stringify({ before, after })}`);
if (after.logicalPeople !== before.logicalPeople + 7) throw new Error(`Unexpected logical People delta: ${before.logicalPeople} -> ${after.logicalPeople}`);
const uncoveredIds = new Set((coverage.uncoveredRequired ?? []).map((place: { placeId: string }) => place.placeId));
for (const placeId of targetPlaceIds) if (uncoveredIds.has(placeId)) throw new Error(`Target place remains uncovered: ${placeId}`);
const indexText = fs.readFileSync('data/Civication/historyPeople_index.json', 'utf8');
for (const id of expectedIds) if (!indexText.includes(`\"${id}\"`)) throw new Error(`Missing ${id} from Civication People index`);

fs.writeFileSync('reports/people-oslo-zero-gap-batch7-validation.md', `# Oslo People zero-gap batch 7 – validation\n\n## Anti-overreuse policy\n\n- Planned and actual reused canonical People: **0**\n- Every target receives at least one newly created, venue-specific founder or institution builder.\n- No person is included merely for having performed at the venue.\n\n## Target places\n\n- \`det_andre_teatret\` → new \`nils_petter_morland\`\n- \`grusomhetens_teater\` → new \`lars_oyno\`\n- \`nordic_black_theatre_cafeteatret\` → new \`cliff_a_moustache\` and \`jarl_solberg\`\n- \`teater_manu\` → new \`mira_zuckermann\`\n- \`centralteatret\` → new \`harald_otto\`\n- \`dramatikkens_hus\` → new \`anne_may_nilsen\`\n\n## Repository audit\n\nThe candidate audit scanned ${candidateAudit.scannedPeopleJsonFiles} People JSON files and ${candidateAudit.scannedRecords} id/name records. All seven candidates had zero canonical or legacy matches. None of the six target place IDs had an existing People link.\n\n## Research gate\n\n- Nils Petter Mørland helped establish Det Andre Teatret in 2011 and was its first theatre director.\n- Lars Øyno founded Grusomhetens Teater and built its artistic profile and permanent Hausmannsgata stage.\n- Cliff A. Moustache and Jarl Solberg founded Nordic Black Theatre and established its long-term home at Cafeteatret.\n- Mira Zuckermann authored the first feasibility study, led the pilot project and served as Teater Manu's first theatre director through 2021.\n- Harald Otto owned and directed Centralteatret from 1902 to 1928.\n- Anne-May Nilsen initiated and co-founded Det Åpne Teater, led it from 1986 to 1999 and anchored it physically in Tøyenbekken 34.\n\n## Coverage gate\n\n- Required non-nature Oslo places: ${before.requiredNonNaturePlaces} → ${after.requiredNonNaturePlaces}\n- Covered required Oslo places: ${before.coveredRequiredPlaces} → ${after.coveredRequiredPlaces}\n- Uncovered required Oslo places: ${before.uncoveredRequiredPlaces} → ${after.uncoveredRequiredPlaces}\n- Logical People: ${before.logicalPeople} → ${after.logicalPeople}\n- New logical People: 7\n- Reused canonical People: 0\n`);
run('bash', ['scripts/check-people.sh']);
run('git', ['diff', '--check']);
