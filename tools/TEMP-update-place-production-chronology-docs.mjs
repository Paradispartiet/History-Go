import fs from 'node:fs';

const V2 = 'docs/PLACE_PRODUCTION_CHECKLIST.md';
const REF = 'docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function replaceOnce(text, needle, replacement, label) {
  const first = text.indexOf(needle);
  if (first < 0) throw new Error(`Missing anchor: ${label}`);
  if (text.indexOf(needle, first + needle.length) >= 0) throw new Error(`Non-unique anchor: ${label}`);
  return text.slice(0, first) + replacement + text.slice(first + needle.length);
}

let v2 = read(V2);
let ref = read(REF);

if (v2.includes('KRONOLOGI / EPOKE — OBLIGATORISK I FULL STEDSPRODUKSJON')) {
  throw new Error('V2 chronology gate already present');
}
if (ref.includes('## 2A. Kildebelagt kronologi og epoker — universell ferdigport')) {
  throw new Error('Reference chronology gate already present');
}

v2 = replaceOnce(v2, 'Sist kontrollert: **2026-08-25**', 'Sist kontrollert: **2026-08-27**', 'v2 date');

const v2ChronologyIntro = `**KRONOLOGI / EPOKE — OBLIGATORISK I FULL STEDSPRODUKSJON.** For hvert ordinært canonical Place skal kildearbeidet samtidig undersøke og materialisere stedets relevante historiske tidsankere. Dette er ikke et separat etterarbeid og skal ikke skyves til en senere «timeline-gap»-runde. Hvert tidslinjepunkt skal ha en inspectable kilde som støtter både hendelsen og dateringen. Et tiår, århundre, «omkring», «ca.» eller annen omtrentlig datering skal aldri gjøres om til et oppdiktet enkeltår. Når kildene faktisk bærer eksakte år, materialiseres de i en canonical evidensbane som `scripts/build-epoke-place-index.mjs` leser, og epokeindeks/runtime/epokeviser regenereres og kontrolleres i samme stedsproduksjon. Dersom dokumentert research ikke finner en kvalifisert eksakt datering, registreres **SOURCE-BOUNDED HOLDBACK** med søkte kilder; kronologivurderingen kan aldri hoppes over eller stå uavklart.

Arbeidskortet skal eksplisitt føre \`KRONOLOGI/EPOKE-STATUS:\`, \`KRONOLOGI-KILDER/ANKERE:\`, \`EPOKE-INDEX/RUNTIME-STATUS:\` og \`EPOKEVISER-QA:\`. Eldre Places som allerede var ferdigstilt før denne regelen kan fortsatt lukkes gjennom separate legacy gap-transer, men ny/full stedsproduksjon skal ikke skape nye slike gap.

`;
v2 = replaceOnce(v2, '> **Ett sted ferdig før neste. Faser reviewes sekvensielt. Mergegrenser følger reell risiko — ikke antall faser.**', v2ChronologyIntro + '> **Ett sted ferdig før neste. Faser reviewes sekvensielt. Mergegrenser følger reell risiko — ikke antall faser.**', 'v2 chronology intro');

v2 = replaceOnce(
  v2,
  '- faktisitet: `docs/FACTUALITY_CONTRACT.md`;',
  '- faktisitet: `docs/FACTUALITY_CONTRACT.md`;\n- kronologi/epoker: `scripts/build-epoke-place-index.mjs`, `data/epoker/epoke-place-index.json`, `.github/workflows/epoke-viewer-quality.yml` og `tests/epoke-place-index.test.mjs` / `tests/epoker-runtime-place-index.test.mjs` / `tests/epoke-viewer.test.mjs`;',
  'v2 authority chronology'
);

v2 = replaceOnce(
  v2,
  '- Stories, Quiz, Knowledge/Aha, Lesespor og ruter/relasjoner;\n- kilder, bilder/proveniens og faktisk UI-visning;',
  '- Stories, Quiz, Knowledge/Aha, Lesespor og ruter/relasjoner;\n- eksisterende chronology/leksikon, kildebelagte årankere, epokedekning, epokeindex/runtime og epokeviserstatus;\n- kilder, bilder/proveniens og faktisk UI-visning;',
  'v2 null measurement chronology'
);

v2 = replaceOnce(
  v2,
  '- Om/Historie/Fortellinger/Før–etter/Nyheter/Lesespor/Kilder/Språk;',
  '- Om/Historie/Fortellinger/Før–etter/Nyheter/Lesespor/Kilder/Språk;\n- kildebelagt chronology med relevante eksakte tidsankere og dokumentert dateringspresisjon;',
  'v2 canonical content chronology'
);

v2 = replaceOnce(
  v2,
  '- genererte indekser/manifester;\n- bred integrasjon;',
  '- genererte indekser/manifester;\n- regenerert epoke-place-index/runtime og kontrollert epokeviser etter chronology-endringer;\n- bred integrasjon;',
  'v2 integration chronology'
);

v2 = replaceOnce(
  v2,
  '- source → claim → text der kontrakten krever det;',
  '- source → claim → text der kontrakten krever det;\n- source → datert hendelse → chronology → epokeindex/runtime → epokeviser for relevante historiske tidsankere;',
  'v2 quality chronology'
);

const v2ChronologyDetail = `#### Kronologi og epoker

**KRONOLOGI/EPOKE — ALLE ORDINÆRE PLACES / RESEARCH ALDRI N/A**

- hvert sted researches for relevante historiske hendelser med eksplisitt dateringspresisjon i samme kildepass som øvrig stedsinnhold;
- eksakte år materialiseres bare når kilden faktisk støtter det eksakte året; tiår, århundrer, intervaller og omtrentlige dateringer konverteres ikke til tekniske enkeltår;
- prioriter identitetsbærende hendelser som etablering, bygging/åpning, funksjonsskifte, eierskifte med stedshistorisk betydning, utvidelse, nedleggelse, ombruk, navne-/institusjonsskifte og andre dokumenterte vendepunkter fremfor årstallsstøy;
- chronology kan materialiseres gjennom de canonicale evidensbanene som epokebyggeren faktisk leser, blant annet manifest-loadet leksikon-\`chronology[]\`, verifiserte historiske place-production-claims med eksakt år og HTTP-kilde, source-backed canonical Stories med eksplisitt år eller validert Historie-evidens;
- chronology brukes for **hva som skjedde når**; Story brukes bare når materialet også har selvstendig narrativ kvalitet etter Stories-kontrakten;
- etter chronology-endring regenereres epokeindeksen, og runtime/viewer-testene kjøres på den samme PR-headen;
- ferdigstatus er **PASS** når kvalifiserte kilder er undersøkt, relevante eksakte ankere er materialisert og epokeviseren viser stedet korrekt; **SOURCE-BOUNDED HOLDBACK** er kun tillatt når dokumentert research ikke finner en kilde som bærer en kvalifisert eksakt datering;
- dersom researchen har en kvalifisert, relevant og source-backed eksakt dato som ikke er materialisert, er stedet blokkert fra fullproduksjonsstatus;
- legacy timeline-gap kan ryddes separat for eldre ferdigproduserte steder, men ny/full stedsproduksjon skal ikke skape nye \`awaiting_source_backed_history\`-gap som kunne vært lukket med researchen som allerede er gjort.

`;
v2 = replaceOnce(v2, '#### Språkleksikon og dialekt', v2ChronologyDetail + '#### Språkleksikon og dialekt', 'v2 detail chronology');

const v2Ci = `Når chronology/epoke berøres, er minimumsgaten i tillegg:

\`\`\`bash
npm run epoker:places:build
npm run epoker:places:check
node --test tests/epoke-place-index.test.mjs tests/epoker-runtime-place-index.test.mjs tests/epoke-viewer.test.mjs
\`\`\`

Den genererte epokeindeksen skal committes fra source-bygging, aldri håndredigeres for å få et sted inn i epokeviseren.

`;
v2 = replaceOnce(v2, 'Main-/produksjonskontroll gjøres:', v2Ci + 'Main-/produksjonskontroll gjøres:', 'v2 CI chronology');

v2 = replaceOnce(
  v2,
  '- kontroller Stories/obligatorisk Quiz/People/Objects/Brands og ruter slik de faktisk vises;\n- registrer tomme eller feilroutede flater',
  '- kontroller Stories/obligatorisk Quiz/People/Objects/Brands og ruter slik de faktisk vises;\n- åpne epokeviseren for stedet og kontroller at hvert materialisert tidsanker ligger i riktig epoke, har riktig sted og kildeproveniens, og at ingen omtrentlig datering er blitt fremstilt som et eksakt år;\n- registrer tomme eller feilroutede flater',
  'v2 manual QA chronology'
);

v2 = replaceOnce(
  v2,
  '**Review hver fase. Merge ved reelle risikogrenser. Behold full kvalitet. Alle Places har Språk; bare dialekt kan mangle. Ikke bruk GitHub-PR-er som fasebokføring.**',
  '**Review hver fase. Merge ved reelle risikogrenser. Behold full kvalitet. Produser kildebelagt kronologi og epokedekning samtidig med stedet. Alle Places har Språk; bare dialekt kan mangle. Ikke bruk GitHub-PR-er som fasebokføring.**',
  'v2 short rule'
);

ref = replaceOnce(ref, 'Sist kontrollert: **2026-08-24**', 'Sist kontrollert: **2026-08-27**', 'reference date');

ref = replaceOnce(
  ref,
  '| Historie — stedsgate og produksjonsrapport | `data/places/regler/historie_place_production_v1.schema.json` og `scripts/audit-historie-place-production.mjs` |',
  '| Historie — stedsgate og produksjonsrapport | `data/places/regler/historie_place_production_v1.schema.json` og `scripts/audit-historie-place-production.mjs` |\n| Kronologi / epokeviser | `scripts/build-epoke-place-index.mjs`, `data/epoker/epoke-place-index.json`, `.github/workflows/epoke-viewer-quality.yml`, `tests/epoke-place-index.test.mjs`, `tests/epoker-runtime-place-index.test.mjs` og `tests/epoke-viewer.test.mjs` |',
  'reference authority chronology'
);

ref = replaceOnce(
  ref,
  'alle relevante popupfaner, inkludert datastyrte direktefaner, PlaceCard-samlinger, People, Objects, Brands, Badges, Stories, Quiz, Knowledge, kilder og faktisk UI-visning.',
  'alle relevante popupfaner, inkludert datastyrte direktefaner, PlaceCard-samlinger, People, Objects, Brands, Badges, Stories, Quiz, Knowledge, kildebelagt chronology/epokedekning, kilder og faktisk UI-visning.',
  'reference null measurement chronology'
);

ref = replaceOnce(
  ref,
  'LEKSIKON-ID/FIL:\nSPRÅKLEKSIKON-STATUS:',
  'LEKSIKON-ID/FIL:\nKRONOLOGI/EPOKE-STATUS — PASS / SOURCE-BOUNDED HOLDBACK / BLOKKERT:\nKRONOLOGI-KILDER/ANKERE:\nEPOKE-INDEX/RUNTIME-STATUS:\nEPOKEVISER-QA:\nSPRÅKLEKSIKON-STATUS:',
  'reference workcard chronology'
);

const refChronologySection = `## 2A. Kildebelagt kronologi og epoker — universell ferdigport

Denne fasen gjelder **alle ordinære canonicale Places**, uavhengig av primærkategori. Historie-gaten i 4B kan skjerpe kravene for et Historie-sted, men kronologi/epoke er ikke forbeholdt Historie-kategorien. Researchen gjøres mens kildegrunnlaget er ferskt, og materialiseringen ferdigstilles i samme stedsproduksjon.

**LES FØRST — obligatorisk:**

- \`docs/FACTUALITY_CONTRACT.md\`;
- \`scripts/build-epoke-place-index.mjs\`;
- \`.github/workflows/epoke-viewer-quality.yml\`;
- relevante leksikon-/place-production-/Historie-/Stories-kontrakter for evidensbanen som brukes.

### A. Research kronologi samtidig med stedet

- [ ] søk etter relevante, stedsspesifikke historiske hendelser mens de samme kildene brukes til description, Historie, People, Brands, Før/etter og øvrig research;
- [ ] registrer eksplisitt hvilke kilder som støtter hvilke daterte hendelser;
- [ ] prioriter identitetsbærende og forklarende tidsankere: etablering, bygging/åpning, funksjonsskifte, viktige utvidelser, dokumenterte eierskifter når de forklarer stedet, nedleggelse, ombruk, institusjons-/navneskifte og andre reelle vendepunkter;
- [ ] ikke fyll timeline med trivielle årstall bare fordi en kilde inneholder dem;
- [ ] eksisterende chronology og epokedekning auditeres før nye ankere opprettes, slik at samme hendelse ikke dupliseres.

### B. Dateringspresisjon er source-bounded

- [ ] et eksakt år brukes bare når kilden faktisk støtter et eksakt år;
- [ ] \`ca.\`, \`cirka\`, \`omkring\`, \`rundt\`, usikker datering, tiår, århundre eller periode gjøres aldri om til et oppdiktet enkeltår;
- [ ] flere år i samme claim skilles til egne hendelser eller får eksplisitt \`timelineYear\` bare når claimet og kilden faktisk bærer den valgte ankeringen;
- [ ] hendelsesår, publiseringsår, byggeperiode, flytteår og senere minne-/jubileumsår blandes ikke;
- [ ] chronology brukes ikke som årsaksbevis; den dokumenterer først og fremst **hva som skjedde når**.

### C. Materialiser gjennom en canonical evidensbane

\`scripts/build-epoke-place-index.mjs\` leser flere source-backed baner. Bruk den banen som faktisk eier evidensen; ikke håndrediger den genererte epokeindeksen.

- [ ] manifest-loadet leksikon-\`chronology[]\` kan brukes når posten har numerisk \`year\` og inspectable HTTP-kilde;
- [ ] verifiserte place-production-claims kan brukes når claimet er historisk, har eksakt kvalifisert år, inspectable \`sourceUrl\` og claim-/source-location-proveniens;
- [ ] canonical Story kan bidra bare når den allerede består Stories-kontrakten, har eksplisitt år og inspectable kilde; et årstall alene er aldri grunn til å lage en Story;
- [ ] validert Historie-evidens kan brukes når den canonicale Historie-banen og kildeproveniensen faktisk er komplett;
- [ ] samme hendelse dupliseres ikke mekanisk mellom leksikon, claim, Story og Historie-evidens bare for å øke antall milestones.

### D. Bygg epokeindeksen og kontroller spillerflaten

Etter chronology-endringer kjøres minst:

\`\`\`bash
npm run epoker:places:build
npm run epoker:places:check
node --test tests/epoke-place-index.test.mjs tests/epoker-runtime-place-index.test.mjs tests/epoke-viewer.test.mjs
\`\`\`

- [ ] generert \`data/epoker/epoke-place-index.json\` er resultat av source-bygging, ikke håndredigering;
- [ ] hvert nytt milestone ligger i riktig canonical epoke;
- [ ] stedets navn/ID/geografi løses riktig i epokeviseren;
- [ ] kilde og konsekvenstekst peker tilbake til riktig hendelse uten å overdrive kilden;
- [ ] epokeviserens land-/byfiltrering og stedskobling fungerer for stedet der den er relevant;
- [ ] endringen skaper ikke nye ubegrunnede \`awaiting_source_backed_history\`-gap.

### E. Ferdigstatus

Kronologivurderingen er **aldri N/A** for et ordinært fullprodusert Place. Den ender i én av tre eksplisitte statuser:

- **PASS** — kvalifiserte kilder er undersøkt, relevante source-backed eksakte ankere er materialisert, genererte flater er i sync og epokeviseren er kontrollert;
- **SOURCE-BOUNDED HOLDBACK** — dokumentert research er utført, men ingen kvalifisert kilde bærer en relevant eksakt datering som dagens epokebygger kan materialisere uten å dikte presisjon;
- **BLOKKERT** — researchen har en relevant, kvalifisert og source-backed eksakt dato som ikke er materialisert, eller epokeindex/runtime/viewer er ute av sync.

Et sted kan ikke merkes fullprodusert med **BLOKKERT** status. **SOURCE-BOUNDED HOLDBACK** skal føre hvilke kilder som er søkt og hvorfor presisjonen ikke kan materialiseres; det er en dokumentert kildegrense, ikke en snarvei eller N/A.

Separate timeline-gap-transer er kun en legacy-mekanisme for steder som ble ferdigstilt før denne regelen. Ny/full stedsproduksjon skal lukke chronology/epoke samtidig og skal ikke bevisst skyve kvalifiserte tidsankere til en senere backlog.

---

`;
ref = replaceOnce(ref, '## 3. Koordinat, anker, radius og geometry', refChronologySection + '## 3. Koordinat, anker, radius og geometry', 'reference chronology phase');

ref = replaceOnce(
  ref,
  '- [ ] genererte indekser regenereres fra source, aldri håndredigeres;\n- [ ] category gyldig;',
  '- [ ] genererte indekser regenereres fra source, aldri håndredigeres;\n- [ ] chronology/epoke-status er PASS eller dokumentert SOURCE-BOUNDED HOLDBACK; BLOKKERT er ikke sluttstatus;\n- [ ] `data/epoker/epoke-place-index.json` er regenerert når chronology-evidence er endret, og epoke-place/runtime/viewer-testene passerer;\n- [ ] category gyldig;',
  'reference data QA chronology'
);

ref = replaceOnce(
  ref,
  '- [ ] `popupDesc`/popup åpner riktig;\n- [ ] popup har Om · Historie · Fortellinger · Før/etter · Nyheter · Lesespor · Kilder · Mer;',
  '- [ ] `popupDesc`/popup åpner riktig;\n- [ ] epokeviseren åpner riktig sted, viser materialiserte tidsankere i riktig epoke og bevarer source-bounded dateringspresisjon;\n- [ ] popup har Om · Historie · Fortellinger · Før/etter · Nyheter · Lesespor · Kilder · Mer;',
  'reference UI QA chronology'
);

ref = replaceOnce(
  ref,
  '- [ ] datoer/år/roller/tall kontrollert;\n- [ ] People-koblinger følger People of Places;',
  '- [ ] datoer/år/roller/tall kontrollert;\n- [ ] chronology inneholder relevante source-backed ankere fra researchen uten oppdiktede enkeltår, og Story er ikke brukt som timeline-filler;\n- [ ] People-koblinger følger People of Places;',
  'reference content QA chronology'
);

ref = replaceOnce(
  ref,
  '- [ ] Stories gate når Stories berøres;\n- [ ] quiz/category governance når Quiz/kategori berøres;',
  '- [ ] Stories gate når Stories berøres;\n- [ ] Epoke Viewer Quality + `npm run epoker:places:check` og epoke-place/runtime/viewer-testene når chronology/epoke-evidens berøres;\n- [ ] quiz/category governance når Quiz/kategori berøres;',
  'reference CI chronology'
);

const finalChronology = `### Kronologi og epoke
- [ ] chronology/epoke er eksplisitt vurdert og står ikke uavklart;
- [ ] relevante source-backed eksakte tidsankere fra stedsresearchen er materialisert gjennom canonical evidensbane;
- [ ] omtrentlig eller usikker datering er ikke gjort om til oppdiktet enkeltår;
- [ ] epokeindex/runtime/viewer er regenerert og kontrollert når chronology er endret;
- [ ] status er PASS, eller SOURCE-BOUNDED HOLDBACK med dokumentert kildesøk og presis begrunnelse;
- [ ] BLOKKERT chronology/epoke-status forekommer ikke ved sluttgodkjenning.

`;
ref = replaceOnce(ref, '### Geografi\n', finalChronology + '### Geografi\n', 'reference final definition chronology');

ref = replaceOnce(
  ref,
  '- [ ] relevant CI\n- [ ] ren slutt-diff',
  '- [ ] chronology/epoke PASS eller dokumentert SOURCE-BOUNDED HOLDBACK + epokeviser kontrollert\n- [ ] relevant CI\n- [ ] ren slutt-diff',
  'reference compact closeout chronology'
);

fs.writeFileSync(V2, v2);
fs.writeFileSync(REF, ref);
console.log('Updated both place-production checklist documents with universal chronology/epoch governance.');
