import fs from 'node:fs';
import { execSync } from 'node:child_process';

const placePath = 'data/places/historie/oslo/places_historie/gamle_aker_kirke.json';
const leksikonPath = 'data/leksikon/places/oslo/historie/gamle_aker_kirke.html';
const reportPath = 'reports/place-production/gamle-aker-kirke-historie-v1.md';

const links = [
  {
    label: 'Store norske leksikon: Gamle Aker kirke',
    url: 'https://snl.no/Gamle_Aker_kirke',
    type: 'scholarly',
    lang: 'nb',
    verifiedAt: '2026-08-02',
    sourceLocation: 'Avsnittene «Bygningen», «Datering og eldre historie», «Nyere historie» og «Restaurering og rehabilitering»',
    coverage: 'Datering, bygningshistorie, eierskap, restaureringer og interiør.',
    limitations: 'Dateringen er uttrykkelig usikker og må ikke reduseres til ett sikkert byggeår.'
  },
  {
    label: 'Den norske kirke: Gamle Aker kirke',
    url: 'https://www.kirken.no/nn-NO/fellesrad/kirkeneioslo/menigheter/sthans/forsideoppslag/gamle-aker/',
    type: 'official',
    lang: 'nb',
    verifiedAt: '2026-08-02',
    sourceLocation: 'Avsnittet «Gamle Aker kirkes historie» og kontaktfeltet for Akersbakken 26',
    coverage: 'Kirkehistorie, adresse og dagens bruk som menighetskirke.',
    limitations: 'Formidlingssiden bruker et smalere dateringsintervall enn den faglige SNL-artikkelen.'
  },
  {
    label: 'Riksantikvaren: Gamle Aker med ny energi',
    url: 'https://riksantikvaren.no/eksempelsamling/energieffektivisering/gamle-aker-med-ny-energi/',
    type: 'heritage',
    lang: 'nb',
    verifiedAt: '2026-08-02',
    sourceLocation: 'Prosjektfakta og avsnittene om bygningshistorie, restaureringer, vern og bruk',
    coverage: 'Fredning, materiallag, tekniske tiltak, energieffektivisering og fortsatt bruk.',
    limitations: 'Prosjektcaset er ikke en fullstendig historie om alle eierskifter eller dateringsforslag.'
  },
  {
    label: 'Oslo Byleksikon: Gamle Aker kirke',
    url: 'https://oslobyleksikon.no/side/Gamle_Aker_kirke',
    type: 'local_history',
    lang: 'nb',
    verifiedAt: '2026-08-02',
    sourceLocation: 'Hovedartikkelen om adresse, bygg, bruk, restaureringer og inventar',
    coverage: 'Lokal bygningshistorie, arkitektur, inventar og tilknyttede underjordiske lag.',
    limitations: 'Oppslagsformatet oppgir få eksplisitte kildehenvisninger og kan avvike i enkelte årstall.'
  },
  {
    label: 'Den norske kirke: Rehabilitering av Gamle Aker kirke',
    url: 'https://www.kirken.no/sthans/rehabilitering',
    type: 'current_project',
    lang: 'nb',
    verifiedAt: '2026-08-02',
    sourceLocation: 'Tidslinjen og avsnittene om arbeid i 2023–2025 og planlagt fase i 2026–2027',
    coverage: 'Gjennomførte rehabiliteringsarbeider, gjenåpning og planlagt sluttfase.',
    limitations: 'Planlagte tidspunkt kan endres og må kontrolleres på nytt etter prosjektperioden.'
  },
  {
    label: 'Wikimedia Commons: Gamle Aker kirke fra sør (2008)',
    url: 'https://commons.wikimedia.org/wiki/File:Gamle_Aker_kirke_S.jpg',
    type: 'image_archive',
    lang: 'nb',
    verifiedAt: '2026-08-02',
    sourceLocation: 'Filside med fotograf, dato, motiv og public-domain-status',
    coverage: 'Hoved- og kortbildets opphav, motiv og rettighetsstatus.',
    limitations: 'Bildet er fra 2008 og dokumenterer ikke rehabiliteringen i 2023–2024.'
  },
  {
    label: 'Wikimedia Commons / Oslo Museum: Kirken og kirkegården ca. 1863–1883',
    url: 'https://commons.wikimedia.org/wiki/File:Gamle_Aker_kirke_og_kirkeg%C3%A5rd,_Ole_Tobias_Olsen_OB.OT347.jpg',
    type: 'image_archive',
    lang: 'nb',
    verifiedAt: '2026-08-02',
    sourceLocation: 'Filside med fotograf, museums-ID, periode og CC BY-SA 4.0-lisens',
    coverage: 'Arkivbildet i Før/etter og den historiske sørsiden etter restaureringen i 1858–1861.',
    limitations: 'Fotografiet er tatt etter 1800-tallsrestaureringen og viser ikke en urørt middelalderkirke.'
  }
];

const place = JSON.parse(fs.readFileSync(placePath, 'utf8'));
place.externalLinks = links;
place.source_summary = {
  ...(place.source_summary || {}),
  safe_sources: links.map(link => link.label)
};
fs.writeFileSync(placePath, `${JSON.stringify(place, null, 2)}\n`);

let leksikon = fs.readFileSync(leksikonPath, 'utf8');
const sourceSection = `      <section aria-labelledby="kilder">
        <h2 id="kilder">Kilder</h2>
        <p class="note">Kildene er valgt for å skille faglig datering, offisiell bruk, kulturminneforvaltning, lokalhistorie, løpende rehabilitering og bildeproveniens. Begrensningene er oppgitt fordi kildene dekker ulike deler av stedet.</p>
        <ul class="source-list">
${links.map(link => `          <li><a href="${link.url}" target="_blank" rel="noopener noreferrer"><strong>${link.label}</strong></a><br>${link.coverage}<br><span class="note">Kildeplassering: ${link.sourceLocation}. Begrensning: ${link.limitations}</span></li>`).join('\n')}
        </ul>
      </section>`;
const sourcePattern = /      <section aria-labelledby="kilder">[\s\S]*?      <\/section>/;
if (!sourcePattern.test(leksikon)) throw new Error('Fant ikke Kilder-seksjonen i leksikonfilen.');
leksikon = leksikon.replace(sourcePattern, sourceSection);
fs.writeFileSync(leksikonPath, leksikon);

let report = fs.readFileSync(reportPath, 'utf8');
report = report.replace(
  'Status: **fase 6 – tre åpne og komplementære Lesespor klare for review; stedet er ennå ikke samlet produksjonsklart**',
  'Status: **fase 7 – syv brukerrettede, dedupliserte Kilder klare for review; stedet er ennå ikke samlet produksjonsklart**'
);
report = report.replace(
  '| Lesespor | MANGLER | Ingen eksplisitt stedskoblet, åpen Lesespor-pakke er funnet. |',
  '| Lesespor | PASS – fase 6 | Tre åpne, stedsspesifikke og komplementære Lesespor er godkjent og manifestlastet. |'
);
report = report.replace(
  '| Kilder | IKKE GODKJENT | Leksikon `sources` er tom. `source_summary.safe_sources` består hovedsakelig av kildenavn og interne History Go-data, ikke en brukerrettet, deduplisert HTTPS-liste. |',
  '| Kilder | PASS – fase 7 | Syv dedupliserte HTTPS-kilder dekker faglig historie, offisiell bruk, vern, lokalhistorie, rehabilitering og begge bildeposter; interne History Go-filer vises ikke som kilder. |'
);
report = report.replace('- brukerrettet Kilder-fane;\n', '');
report = report.replace(
  '| 6 | Lesespor | **KLAR FOR REVIEW** |\n| 7 | Brukerrettede Kilder | IKKE STARTET |',
  '| 6 | Lesespor | **GODKJENT – PR #4658, merge `c78cb05353bfb61eb68fef74ee9f115dfacc3a8b`** |\n| 7 | Brukerrettede Kilder | **KLAR FOR REVIEW – PR #4663** |'
);
const activeScopeIndex = report.indexOf('## Aktivt filscope');
if (activeScopeIndex < 0) throw new Error('Fant ikke aktivt filscope i produksjonsrapporten.');
report = `${report.slice(0, activeScopeIndex)}## Resultat i fase 7

- Syv eksterne HTTPS-kilder er materialisert som én deduplisert `externalLinks`-liste og samme syv brukerrettede etiketter i `source_summary.safe_sources`.
- Kildebanken skiller fagartikkel, offisiell kirkeinformasjon, kulturminneforvaltning, lokalhistorie, løpende rehabilitering og to bildearkivposter.
- Hver lenke har norsk etikett, kildetype, kontrollert dato, konkret kildeplassering, dekningsområde og uttrykt begrensning.
- Interne History Go-data, quizfiler, Story-filer, auditor og produksjonsrapporter er fjernet fra den brukerrettede Kilder-flaten.
- De tre hold-back-påstandene om eldre trekirke, Olav Kyrre og førkristent tingsted beholdes som forskningsnotater og er ikke gjort til kildelenker eller brukerfakta.
- Leksikonets Kilder-seksjon viser de samme syv URL-ene med `noopener noreferrer` og forklarer hva hver kilde kan og ikke kan dokumentere.
- Fase 6 er tilbakeført som godkjent med PR #4658 og merge-SHA; fase 7 er registrert som aktiv PR #4663.

## Aktivt filscope

Fase 7 endrer bare:

- canonical place-fil for `gamle_aker_kirke`;
- den statiske leksikonsiden for stedet;
- den genererte runtime-indeksen og eventuelle deterministiske quizkontekster som faktisk endres ved rebuild;
- en egen Kilder-regresjonspakke;
- dette arbeidskortet.

Ingen Story-, Lesespor-, People-, Objects-, Brands-, Knowledge-, bilde-, koordinat-, manifest- eller Historie-produksjonsrapportfil endres redaksjonelt i fase 7.

## Ferdigport for fase 7

Fase 7 kan godkjennes når:

1. nøyaktig syv eksterne lenker har unike HTTPS-URL-er, norske etiketter og kontrollert dato;
2. kildebanken dekker historie, offisiell bruk, vern, lokalhistorie, rehabilitering og begge aktive bildeposter;
3. hver lenke har kildeplassering, dekningsområde og begrensning;
4. `source_summary.safe_sources` og `externalLinks` har samme syv brukerrettede etiketter;
5. interne History Go-filer og produksjonsartefakter ikke vises som brukerrettede kilder;
6. hold-back-påstandene forblir utenfor brukerflaten;
7. Leksikon viser samme URL-sett uten duplikater og åpner eksterne lenker sikkert;
8. place-index, quiz production context, Historie-rapport og PR-review består uten drift.
`;
fs.writeFileSync(reportPath, report);

const run = command => execSync(command, { stdio: 'inherit', shell: '/bin/bash' });
run('npm run places:index:build');
run('npm run quiz:context');
run('node --test tests/gamle-aker-sources-phase.test.mjs');
run('node --test tests/gamle-aker-*.test.mjs');
run('npm run places:index:check');
run('npm run audit:quiz-production-context');
run('npm run audit:places-split-manifest-sync');
console.log('Gamle Aker Sources phase materialized and validated.');
