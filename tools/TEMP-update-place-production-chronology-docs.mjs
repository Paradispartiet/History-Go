import fs from 'node:fs';

const V2 = 'docs/PLACE_PRODUCTION_CHECKLIST.md';
const REF = 'docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md';

function replaceRequired(text, anchor, replacement, label) {
  const pos = text.indexOf(anchor);
  if (pos < 0) throw new Error(`Missing anchor: ${label}`);
  if (text.indexOf(anchor, pos + anchor.length) >= 0) throw new Error(`Non-unique anchor: ${label}`);
  return text.slice(0, pos) + replacement + text.slice(pos + anchor.length);
}

function insertBefore(text, anchor, insertion, label) {
  return replaceRequired(text, anchor, insertion + anchor, label);
}

function insertAfter(text, anchor, insertion, label) {
  return replaceRequired(text, anchor, anchor + insertion, label);
}

let v2 = fs.readFileSync(V2, 'utf8');
let ref = fs.readFileSync(REF, 'utf8');

if (v2.includes('KRONOLOGI / EPOKE — OBLIGATORISK I FULL STEDSPRODUKSJON')) throw new Error('V2 gate already present');
if (ref.includes('## 2A. Kildebelagt kronologi og epoker — universell ferdigport')) throw new Error('Reference gate already present');

v2 = replaceRequired(v2, 'Sist kontrollert: **2026-08-25**', 'Sist kontrollert: **2026-08-27**', 'v2 date');

v2 = insertBefore(v2,
  '> **Ett sted ferdig før neste. Faser reviewes sekvensielt. Mergegrenser følger reell risiko — ikke antall faser.**',
  `**KRONOLOGI / EPOKE — OBLIGATORISK I FULL STEDSPRODUKSJON.** For hvert ordinært canonical Place skal kildearbeidet samtidig undersøke og materialisere stedets relevante historiske tidsankere. Dette er ikke separat etterarbeid og skal ikke skyves til en senere timeline-gap-runde. Hvert tidslinjepunkt skal ha en inspectable kilde som støtter både hendelsen og dateringen. Et tiår, århundre, «omkring», «ca.» eller annen omtrentlig datering skal aldri gjøres om til et oppdiktet enkeltår. Når kildene faktisk bærer eksakte år, materialiseres de gjennom en canonical evidensbane som \`scripts/build-epoke-place-index.mjs\` leser, og epokeindeks/runtime/epokeviser regenereres og kontrolleres i samme stedsproduksjon. Dersom dokumentert research ikke finner en kvalifisert eksakt datering, registreres **SOURCE-BOUNDED HOLDBACK** med søkte kilder; kronologivurderingen kan aldri hoppes over eller stå uavklart.\n\nArbeidskortet skal eksplisitt føre \`KRONOLOGI/EPOKE-STATUS:\`, \`KRONOLOGI-KILDER/ANKERE:\`, \`EPOKE-INDEX/RUNTIME-STATUS:\` og \`EPOKEVISER-QA:\`. Eldre Places som allerede var ferdigstilt før denne regelen kan fortsatt lukkes gjennom separate legacy gap-transer, men ny/full stedsproduksjon skal ikke skape nye slike gap.\n\n`,
  'v2 chronology intro');

v2 = insertAfter(v2,
  '- faktisitet: `docs/FACTUALITY_CONTRACT.md`;',
  '\n- kronologi/epoker: `scripts/build-epoke-place-index.mjs`, `data/epoker/epoke-place-index.json`, `.github/workflows/epoke-viewer-quality.yml` og `tests/epoke-place-index.test.mjs` / `tests/epoker-runtime-place-index.test.mjs` / `tests/epoke-viewer.test.mjs`;',
  'v2 authority');

v2 = insertBefore(v2,
  '- kilder, bilder/proveniens og faktisk UI-visning;',
  '- eksisterende chronology/leksikon, kildebelagte årankere, epokedekning, epokeindex/runtime og epokeviserstatus;\n',
  'v2 baseline');

v2 = insertAfter(v2,
  '- Om/Historie/Fortellinger/Før–etter/Nyheter/Lesespor/Kilder/Språk;',
  '\n- kildebelagt chronology med relevante eksakte tidsankere og dokumentert dateringspresisjon;',
  'v2 canonical content');

v2 = insertAfter(v2,
  '- genererte indekser/manifester;',
  '\n- regenerert epoke-place-index/runtime og kontrollert epokeviser etter chronology-endringer;',
  'v2 integration');

const v2Detail = `#### Kronologi og epoker

**KRONOLOGI/EPOKE — ALLE ORDINÆRE PLACES / RESEARCH ALDRI N/A**

- hvert sted researches for relevante historiske hendelser med eksplisitt dateringspresisjon i samme kildepass som øvrig stedsinnhold;
- eksakte år materialiseres bare når kilden faktisk støtter det eksakte året; tiår, århundrer, intervaller og omtrentlige dateringer konverteres ikke til tekniske enkeltår;
- prioriter identitetsbærende hendelser som etablering, bygging/åpning, funksjonsskifte, eierskifte med stedshistorisk betydning, utvidelse, nedleggelse, ombruk, navne-/institusjonsskifte og andre dokumenterte vendepunkter fremfor årstallsstøy;
- chronology materialiseres gjennom en canonical evidensbane som epokebyggeren faktisk leser, blant annet manifest-loadet leksikon-\`chronology[]\`, verifiserte historiske place-production-claims med eksakt år og HTTP-kilde, source-backed canonical Stories med eksplisitt år eller validert Historie-evidens;
- chronology brukes for **hva som skjedde når**; Story brukes bare når materialet også har selvstendig narrativ kvalitet etter Stories-kontrakten;
- etter chronology-endring regenereres epokeindeksen, og runtime/viewer-testene kjøres på den samme PR-headen;
- ferdigstatus er **PASS** når kvalifiserte kilder er undersøkt, relevante eksakte ankere er materialisert og epokeviseren viser stedet korrekt;
- **SOURCE-BOUNDED HOLDBACK** er kun tillatt når dokumentert research ikke finner en kilde som bærer en kvalifisert eksakt datering;
- dersom researchen har en kvalifisert, relevant og source-backed eksakt dato som ikke er materialisert, er stedet **BLOKKERT** fra fullproduksjonsstatus;
- legacy timeline-gap kan ryddes separat for eldre ferdigproduserte steder, men ny/full stedsproduksjon skal ikke skape nye \`awaiting_source_backed_history\`-gap som kunne vært lukket med researchen som allerede er gjort.

`;
v2 = insertBefore(v2, '#### Språkleksikon og dialekt', v2Detail, 'v2 detail section');

const v2Ci = `Når chronology/epoke berøres, er minimumsgaten i tillegg:

\`\`\`bash
npm run epoker:places:build
npm run epoker:places:check
node --test tests/epoke-place-index.test.mjs tests/epoker-runtime-place-index.test.mjs tests/epoke-viewer.test.mjs
\`\`\`

Den genererte epokeindeksen skal committes fra source-bygging, aldri håndredigeres for å få et sted inn i epokeviseren. Manuell slutt-QA skal åpne epokeviseren og kontrollere riktig sted, riktig epoke, source-proveniens og at omtrentlig datering ikke fremstilles som et eksakt år.

`;
v2 = insertBefore(v2, 'Main-/produksjonskontroll gjøres:', v2Ci, 'v2 CI');

v2 = replaceRequired(v2,
  '**Review hver fase. Merge ved reelle risikogrenser. Behold full kvalitet. Alle Places har Språk; bare dialekt kan mangle. Ikke bruk GitHub-PR-er som fasebokføring.**',
  '**Review hver fase. Merge ved reelle risikogrenser. Behold full kvalitet. Produser kildebelagt kronologi og epokedekning samtidig med stedet. Alle Places har Språk; bare dialekt kan mangle. Ikke bruk GitHub-PR-er som fasebokføring.**',
  'v2 short rule');

ref = replaceRequired(ref, 'Sist kontrollert: **2026-08-24**', 'Sist kontrollert: **2026-08-27**', 'reference date');

ref = insertAfter(ref,
  '| Historie — stedsgate og produksjonsrapport | `data/places/regler/historie_place_production_v1.schema.json` og `scripts/audit-historie-place-production.mjs` |',
  '\n| Kronologi / epokeviser | `scripts/build-epoke-place-index.mjs`, `data/epoker/epoke-place-index.json`, `.github/workflows/epoke-viewer-quality.yml`, `tests/epoke-place-index.test.mjs`, `tests/epoker-runtime-place-index.test.mjs` og `tests/epoke-viewer.test.mjs` |',
  'reference authority');

ref = replaceRequired(ref,
  'Stories, Quiz, Knowledge, kilder og faktisk UI-visning.',
  'Stories, Quiz, Knowledge, kildebelagt chronology/epokedekning, kilder og faktisk UI-visning.',
  'reference baseline');

ref = insertAfter(ref,
  'LEKSIKON-ID/FIL:',
  '\nKRONOLOGI/EPOKE-STATUS — PASS / SOURCE-BOUNDED HOLDBACK / BLOKKERT:\nKRONOLOGI-KILDER/ANKERE:\nEPOKE-INDEX/RUNTIME-STATUS:\nEPOKEVISER-QA:',
  'reference workcard');

const refSection = `## 2A. Kildebelagt kronologi og epoker — universell ferdigport

Denne fasen gjelder **alle ordinære canonicale Places**, uavhengig av primærkategori. Historie-gaten kan skjerpe kravene for et Historie-sted, men kronologi/epoke er ikke forbeholdt Historie-kategorien. Researchen gjøres mens kildegrunnlaget er ferskt, og materialiseringen ferdigstilles i samme stedsproduksjon.

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

### C. Materialiser gjennom canonical evidensbane

\`scripts/build-epoke-place-index.mjs\` leser flere source-backed baner. Bruk banen som faktisk eier evidensen; ikke håndrediger den genererte epokeindeksen.

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
- [ ] land-/byfiltrering og stedskobling fungerer der det er relevant;
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
ref = insertBefore(ref, '## 3. Koordinat, anker, radius og geometry', refSection, 'reference phase 2A');

const finalGate = `### Kronologi og epoke — slutt-QA

- [ ] chronology/epoke er eksplisitt vurdert og står ikke uavklart;
- [ ] relevante source-backed eksakte tidsankere fra stedsresearchen er materialisert gjennom canonical evidensbane;
- [ ] omtrentlig eller usikker datering er ikke gjort om til oppdiktet enkeltår;
- [ ] epokeindex/runtime/viewer er regenerert og kontrollert når chronology er endret;
- [ ] status er PASS, eller SOURCE-BOUNDED HOLDBACK med dokumentert kildesøk og presis begrunnelse;
- [ ] BLOKKERT chronology/epoke-status forekommer ikke ved sluttgodkjenning.

`;
ref = insertBefore(ref, '# DEL C', finalGate, 'reference final QA');

fs.writeFileSync(V2, v2);
fs.writeFileSync(REF, ref);
console.log('Updated both place-production checklist documents with universal chronology/epoch governance.');
