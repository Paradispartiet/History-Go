import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const SOURCE_REL = 'data/places/historie/oslo/places_historie.json';
const SOURCE = path.join(ROOT, SOURCE_REL);
const EROOT = path.join(ROOT, 'data/coordinate-evidence');
const EMANIFEST = path.join(EROOT, 'manifest.json');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const REPORT = path.join(ROOT, 'reports/oslo-coordinate-control-batch-18/README.md');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, v) => { fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };
const text = (p, v) => { fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, v.endsWith('\n') ? v : v + '\n'); };
const sha = s => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const snap = p => ({lat:p?.lat??null, lon:p?.lon??null, r:p?.r??null, coordStatus:p?.coordStatus??'', coordSource:p?.coordSource??'', coordType:p?.coordType??'', coordNote:p?.coordNote??''});

const places = read(SOURCE);
if (!Array.isArray(places)) throw new Error('places_historie.json er ikke en array');
const byId = new Map(places.map(p => [p.id, p]));

const defs = {
  middelalder_oslo: ['park','municipality','oslo-kommune:kultureiendommer:middelalderparken','verified_geometry','park_center','Oslo kommune – Middelalderparken','https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/middelalderparken/','Representativt områdeanker inne i Middelalderparken. Oslo kommune dokumenterer parkområdet sør for Bispegata og øst for Sørenggata med middelalderruinene som del av kulturmiljøet. Eksisterende punkt beholdes som park-/ruinområdets displayanker, ikke som adressepunkt for én enkelt ruin.'],
  gamlebyen_gravlund: ['linear_area','municipality','oslo-kommune:gravplass:gamlebyen-gravlund','verified_geometry','cemetery_center','Oslo kommune – Gamlebyen gravlund','https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/gamlebyen-gravlund/','Representativt områdeanker inne på Gamlebyen gravlund. Oslo kommune dokumenterer gravlunden og besøksadressen Ekebergveien 4. Eksisterende punkt beholdes inne i gravlundsområdet og brukes ikke som adressepunkt for kapell, port eller parkeringsinnkjøring.'],
  akershus_festning: ['historic_site','manual_research','forsvarsbygg:akershus-festning','verified_historical_source','historical_site','Forsvarsbygg – Akershus festning','https://www.forsvarsbygg.no/eiendomsforvaltning/festningene/akershus-festning','Representativt områdeanker i Akershus festning-komplekset. Forsvarsbygg dokumenterer festningen som det historiske anlegget og nasjonalsymbolet. Punktet beholdes som anker for hele festningsområdet, ikke som egen koordinat for Akershus slott inne i komplekset.'],
  var_frelsers_gravlund: ['linear_area','municipality','oslo-kommune:gravplass:var-frelsers-gravlund','verified_geometry','cemetery_center','Oslo kommune – Vår Frelsers gravlund','https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/var-frelsers-gravlund/','Representativt områdeanker inne på Vår Frelsers gravlund. Oslo kommune dokumenterer gravlunden og besøksadressen Akersbakken 32. Eksisterende punkt beholdes som gravlundens displayanker, ikke som punkt for én bestemt grav eller Æreslunden alene.'],
  hovedoya_kloster: ['archaeological_site','manual_research','oslo-kommune:rehabilitering:hovedoya-klosterruin','verified_historical_source','ruin_center','Oslo kommune – Rehabilitering av Hovedøya klosterruin','https://www.oslo.kommune.no/slik-bygger-vi-oslo/rehabilitering-av-hovedoya-klosterruin/','Representativt områdeanker ved klosterruinene på Hovedøya. Oslo kommune dokumenterer det konkrete klosterruin-anlegget og pågående bevaring. Eksisterende punkt beholdes som ruinområdets displayanker, ikke som koordinat for hele Hovedøya.']
};

for (const [id,d] of Object.entries(defs)) {
  const p = byId.get(id); if (!p) throw new Error('Mangler ' + id);
  Object.assign(p, {locatorType:d[0], sourceProvider:d[1], sourceObjectId:d[2], geocodeAccuracy:'semantic_anchor', coordRole:'area_anchor', coordStatus:d[3], coordType:d[4], coordSource:d[5], coordSourceId:d[2], coordSourceUrl:d[6], coordVerifiedAt:DATE, coordNote:d[7]});
}
const alias = byId.get('akerhus_slott');
const grini = byId.get('grini_fangeleir');
if (!alias || !grini) throw new Error('Mangler legacy alias eller Grini');
write(SOURCE, places);

// Sync only places_historie split files/manifest/index.
const hdir = path.join(ROOT, 'data/places/historie/oslo');
const splitDir = path.join(hdir, 'places_historie');
fs.mkdirSync(splitDir, {recursive:true});
const rows = [], idx = [];
for (let i=0;i<places.length;i++) {
  const p=places[i], file=`places_historie/${p.id}.json`, body=JSON.stringify(p,null,2)+'\n';
  fs.writeFileSync(path.join(hdir,file), body);
  rows.push({id:p.id,name:p.name??null,category:p.category??null,file,order:i,sha256:sha(body)});
  idx.push({id:p.id,name:p.name??null,category:p.category??null,lat:p.lat??null,lon:p.lon??null,r:p.r??null,year:p.year??null,coordStatus:p.coordStatus??null,coordType:p.coordType??null,file});
}
const sourceText=fs.readFileSync(SOURCE,'utf8');
const mp=path.join(hdir,'places_historie_manifest.json');
const oldm=read(mp);
write(mp,{...oldm,source_sha256:sha(sourceText),generated_at:new Date().toISOString(),place_count:places.length,places:rows});
write(path.join(hdir,'places_historie_index.json'),idx);

function approvedEvidence(id, resolved, finding) {
  const p=byId.get(id), d=defs[id];
  return {placeId:id,placeFile:SOURCE_REL,evidenceStatus:'applied_to_place',coordinateDecision:'do_not_change_coordinates_yet',currentCoordinate:snap(p),identity:{currentName:p.name,resolvedIdentity:resolved,identityStatus:'resolved',identityProblem:'',locatorTypeCandidate:d[0],requiresSplit:false,splitReason:''},requiredEvidence:['stabil kildeidentitet','objekttilpasset representasjon','fysisk avgrensning mot nærliggende canonical steder'],evidence:[{sourceProvider:d[1],sourceName:d[5],sourceUrl:d[6],sourceObjectId:d[2],sourceQuality:d[1]==='municipality'?'stable_object_or_extent':'stable_historical_site_identity',finding,canVerifyCoordinate:true,reason:d[7]}],addressCandidates:[],sourceObjectCandidates:[{sourceProvider:d[1],sourceObjectId:d[2],canApplyToPlace:true}],geometryCandidates:[],coordinateCandidates:[{lat:p.lat,lon:p.lon,coordRole:p.coordRole,canApplyToPlace:true}],decision:{canBecomeVerified:true,blockedReason:'',nextAction:'Kildekontrakt og representasjonsanker er anvendt på canonical place.'},notes:[d[7]]};
}
const approvedEv = {
  middelalder_oslo: approvedEvidence('middelalder_oslo','Middelalderparken som avgrenset park- og ruinområde i Gamle Oslo','Oslo kommune dokumenterer Middelalderparken som et konkret parkområde med bevarte middelalderruiner.'),
  gamlebyen_gravlund: approvedEvidence('gamlebyen_gravlund','Gamlebyen gravlund som avgrenset kommunal gravplass','Oslo kommune dokumenterer Gamlebyen gravlund som egen gravplass med besøksadresse Ekebergveien 4.'),
  akershus_festning: approvedEvidence('akershus_festning','Akershus festning som samlet historisk festningsanlegg','Forsvarsbygg dokumenterer Akershus festning som det samlede historiske festningsanlegget og skiller anlegget fra Akershus slott som delobjekt.'),
  var_frelsers_gravlund: approvedEvidence('var_frelsers_gravlund','Vår Frelsers gravlund som avgrenset kommunal gravplass og kulturhistorisk minnelandskap','Oslo kommune dokumenterer Vår Frelsers gravlund som egen gravplass med besøksadresse Akersbakken 32.'),
  hovedoya_kloster: approvedEvidence('hovedoya_kloster','det konkrete middelalderske klosterruin-anlegget på Hovedøya','Oslo kommune dokumenterer det konkrete klosterruin-anlegget på Hovedøya som eget bevarings- og rehabiliteringsobjekt.')
};
for (const [id,v] of Object.entries(approvedEv)) write(path.join(EROOT,`oslo/historie/${id}.json`),v);

write(path.join(EROOT,'oslo/historie/akerhus_slott.json'),{placeId:'akerhus_slott',placeFile:SOURCE_REL,evidenceStatus:'rejected',coordinateDecision:'needs_identity_split',currentCoordinate:snap(alias),identity:{currentName:alias.name,resolvedIdentity:'legacy-ID og typofeil beholdt for bakoverkompatibilitet; fysisk objekt er canonical akershus_festning',identityStatus:'conflict',identityProblem:'Repoets migreringsrapport dokumenterer akerhus_slott som legacy typo og akershus_festning som korrekt canonical placeId.',locatorTypeCandidate:'historic_site',requiresSplit:false,splitReason:'Det er ikke to fysiske steder; dette er en legacy-alias-konflikt.'},requiredEvidence:['bevar bakoverkompatibilitet','ikke tell aliaset som selvstendig canonical fysisk sted'],evidence:[{sourceProvider:'manual_research',sourceName:'History Go – Akershus festning place target fix report',sourceUrl:'reports/akershus_festning_place_target_fix_report.json',sourceObjectId:'history-go:legacy-alias:akerhus_slott',sourceQuality:'repository_identity_audit',finding:'Repoets egen migreringsrapport sier at akerhus_slott er en typo/legacy-kandidat og at akershus_festning er canonical placeId.',canVerifyCoordinate:false,reason:'Aliaset skal ikke få separat fysisk koordinatgodkjenning.'}],addressCandidates:[],sourceObjectCandidates:[],geometryCandidates:[],coordinateCandidates:[],decision:{canBecomeVerified:false,blockedReason:'Legacy-alias for samme fysiske objekt som canonical akershus_festning.',nextAction:'Behold bare som bakoverkompatibel resolver til gamle referanser er migrert; ikke tell som selvstendig koordinatkontroll.'},notes:['Ingen koordinatendring på legacy-recorden.']});

write(path.join(EROOT,'oslo/historie/grini_fangeleir.json'),{placeId:'grini_fangeleir',placeFile:SOURCE_REL,evidenceStatus:'needs_research',coordinateDecision:'needs_identity_split',currentCoordinate:snap(grini),identity:{currentName:grini.name,resolvedIdentity:'Grini fangeleir / Grinimuseet-området i Eiksmarka, Bærum kommune',identityStatus:'resolved',identityProblem:'Recorden ligger i Oslo-kildefilen, men både place-teksten og Grinimuseets besøksinformasjon plasserer stedet i Bærum.',locatorTypeCandidate:'historic_site',requiresSplit:false,splitReason:'PlaceId kan beholdes, men recorden må flyttes til korrekt fylkes-/kommunekontekst før ny canonical koordinatgodkjenning.'},requiredEvidence:['flytt canonical place-record til Akershus/Bærum','verifiser historisk leiravgrensning eller dokumentert representasjonsanker etter flytting'],evidence:[{sourceProvider:'manual_research',sourceName:'Grinimuseet – Besøk oss',sourceUrl:'https://mia.no/grinimuseet/velkommen-til-grinimuseet',sourceObjectId:'mia:grinimuseet:jossingveien-31',sourceQuality:'official_institution_location',finding:'Grinimuseet oppgir Jøssingveien 31 på Eiksmarka i Bærum kommune.',canVerifyCoordinate:false,reason:'Koordinaten kan ikke godkjennes som Oslo-canonical mens recorden ligger i Oslo-kildefilen; den historiske leiren er dessuten et område, ikke bare museumsadressen.'}],addressCandidates:[{address:'Jøssingveien 31, Eiksmarka, Bærum',sourceProvider:'manual_research',canApplyToPlace:false}],sourceObjectCandidates:[{sourceProvider:'manual_research',sourceObjectId:'mia:grinimuseet:jossingveien-31',canApplyToPlace:false}],geometryCandidates:[],coordinateCandidates:[],decision:{canBecomeVerified:false,blockedReason:'Feil geografisk kildefil: stedet ligger i Bærum, ikke Oslo.',nextAction:'Flytt placeId uendret til Akershus/Bærum og kjør ny objekttilpasset koordinatkontroll der.'},notes:['Ingen koordinatendring i Oslo-batch 18.']});

const em=read(EMANIFEST);
for (const f of ['oslo/historie/middelalder_oslo.json','oslo/historie/gamlebyen_gravlund.json','oslo/historie/akerhus_slott.json','oslo/historie/akershus_festning.json','oslo/historie/var_frelsers_gravlund.json','oslo/historie/hovedoya_kloster.json','oslo/historie/grini_fangeleir.json']) if (!em.files.includes(f)) em.files.push(f);
write(EMANIFEST,em);

let ptxt=fs.readFileSync(PROTOCOL,'utf8');
ptxt=ptxt.replace(/^Oslo-tabellen inneholder nå .*$/m,'Oslo-tabellen inneholder nå 108 verifiserte eller kildekontrollerte canonical steder. Batch 18 omfatter sju fullførte kontroller: fem godkjente park-, gravlund-, festnings- og ruinankre, mens legacy-ID-en `akerhus_slott` og den geografisk feilplasserte `grini_fangeleir` står separat uten godkjent Oslo-koordinat. Åtte fullførte Oslo-kontroller står dermed separat uten godkjent koordinat. Senere visuell kontroll korrigerte ankrene for Oslo domkirke, Tronsmo Bokhandel, Grønland basarene, Møllergata 19 og Villa Grande uten at de ble telt på nytt.');
const anchor='| 17 | `vika_kino` | Vika kino | verified | `geonorge-adresser-v1:0301:16038:14` |';
if(!ptxt.includes(anchor)) throw new Error('Mangler batch17-ankerrad');
const rows18=['| 18 | `middelalder_oslo` | Middelalderparken | verified_geometry | `oslo-kommune:kultureiendommer:middelalderparken` |','| 18 | `gamlebyen_gravlund` | Gamlebyen gravlund | verified_geometry | `oslo-kommune:gravplass:gamlebyen-gravlund` |','| 18 | `akershus_festning` | Akershus festning | verified_historical_source | `forsvarsbygg:akershus-festning` |','| 18 | `var_frelsers_gravlund` | Vår Frelsers gravlund | verified_geometry | `oslo-kommune:gravplass:var-frelsers-gravlund` |','| 18 | `hovedoya_kloster` | Hovedøya kloster | verified_historical_source | `oslo-kommune:rehabilitering:hovedoya-klosterruin` |'].join('\n');
if(!ptxt.includes('| 18 | `middelalder_oslo`')) ptxt=ptxt.replace(anchor,anchor+'\n'+rows18);
ptxt=ptxt.replace('Disse kontrollene er fullført, men teller ikke blant de 103 verifiserte eller kildekontrollerte canonical stedene.','Disse kontrollene er fullført, men teller ikke blant de 108 verifiserte eller kildekontrollerte canonical stedene.');
const hartvig='| `hartvig_nissens_skole_skam` – Hartvig Nissens skole (SKAM) | needs_review | Det historiske SKAM-skolebygget er identifisert, men Geonorge gir flere ikke-entydige treff for President Harbitz\' gate 11. | Krever offisiell bygningsgeometri eller eksplisitt kobling mellom det historiske bygget og ett konkret adressepunkt. |';
if(!ptxt.includes(hartvig)) throw new Error('Mangler Hartvig-rad');
const nr=['| `akerhus_slott` – Akerhus Slott (legacy-ID) | needs_review | Repoets egen migreringsrapport dokumenterer `akerhus_slott` som en typo/legacy-ID beholdt for bakoverkompatibilitet, mens `akershus_festning` er korrekt canonical placeId for det samme fysiske anlegget. | Ikke gi aliaset en separat fysisk koordinatgodkjenning; migrer gamle referanser før legacy-recorden eventuelt fjernes. |','| `grini_fangeleir` – Grini fangeleir | needs_review | Place-recorden ligger i Oslo-kildefilen, men stedet og Grinimuseet ligger i Eiksmarka i Bærum kommune. | Flytt placeId uendret til Akershus/Bærum og verifiser historisk leirgeometri eller eget representasjonsanker der. |'].join('\n');
if(!ptxt.includes('`akerhus_slott` – Akerhus Slott (legacy-ID)')) ptxt=ptxt.replace(hartvig,hartvig+'\n'+nr);
ptxt=ptxt.replace('- Neste nye Oslo-kontroll er nummer 108 og starter batch 18.','- Neste nye Oslo-kontroll er nummer 115 og starter batch 19.');
ptxt=ptxt.replace('- Batch 17 er fullført med seks godkjente ankere og én dokumentert adresse-/bygningskonflikt for Hartvig Nissens skole (SKAM).','- Batch 18 er fullført med fem godkjente ankere, én dokumentert legacy-ID-konflikt (`akerhus_slott`) og én dokumentert geografisk kildefeil (`grini_fangeleir` i Bærum).');
text(PROTOCOL,ptxt);

text(REPORT,`# Oslo coordinate control batch 18\n\nDato: ${DATE}\n\n## Kontroll 108–114\n\nGodkjent:\n- middelalder_oslo – Middelalderparken – verified_geometry\n- gamlebyen_gravlund – Gamlebyen gravlund – verified_geometry\n- akershus_festning – Akershus festning – verified_historical_source\n- var_frelsers_gravlund – Vår Frelsers gravlund – verified_geometry\n- hovedoya_kloster – Hovedøya kloster – verified_historical_source\n\nFullført uten godkjent Oslo-koordinat:\n- akerhus_slott – legacy typo/alias for canonical akershus_festning.\n- grini_fangeleir – ligger i Bærum og må flyttes ut av Oslo-kildefilen før ny canonical koordinatgodkjenning.\n\nIngen eksisterende lat/lon ble flyttet i denne batchen. Områdeobjekter fikk eksplisitt area_anchor og stabil kildeidentitet; legacy-alias og feil kommuneplassering ble ikke presset gjennom som verifiserte koordinater.\n`);
console.log('Batch 18 applied: 5 approved, 2 needs_review.');
