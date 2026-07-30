# Fagverket — inventar, status og runtime-audits

Status: **reproduserbare operative rapporter**  
Canonical kontrakt: [`docs/FAGVERK.md`](../../docs/FAGVERK.md)  
Maskinlesbart inventar: [`data/fagverk/subject_inventory.json`](../../data/fagverk/subject_inventory.json)  
Maskinlesbar status: [`data/fagverk/subject_status.json`](../../data/fagverk/subject_status.json)

Denne mappen eier ikke fagarkitekturen eller betydningen av ferdigstatusene. Den inneholder deterministiske rapporter som viser hva repositoryet faktisk kan dokumentere.

## Rapporter

- `subject-baseline.json` — levende projeksjon av 17 toppfag, én Teknologi-spesialisering, fire schemafamilier, 72 required kjernefiler og gjeldende navigasjons-, audit- og redaksjonell status.
- `general-engine-audit.json` — evidens for den felles fagsidemotoren, manifest-first lasting, adaptergrensen, normalisert modell og fravær av politikkfallback.
- `historie-subject-audit.json` — individuell strukturaudit for Historie gjennom standard canonical-adapteren.
- `natur-pilot-audit.json` — individuell utbyggingsevidens for Natur: canonical tolvdelsrekkefølge, 65 emner, 45 metoder, 65 mappingrader, 110 hooks og 11 redigerte lærekapitler.
- `natur-quality-audit.json` — emne-, metode-, quiz-, Knowledge- og merkesidekvalitet for Natur & miljø.
- `natur-fagkart-quality-audit.json` — kvalitets- og referansegate for alle 110 Natur-hooks og 65 emner, inkludert egne fagkartlag for artskunnskap, evolusjon, botanikk, zoologi og fysiologi.
- `natur-universal-coverage-audit.json` — dokumenterer hvilke biologiske og geologiske fagområder som må materialiseres før Natur kan bli redaksjonelt komplett.
- `politikk-quality-audit.json` — deterministisk kvalitetsgate for 13 fagområder, 123 emner, 71 metoder, 123 mappingrader, quiz, Knowledge, merke og Fagverk-visning.
- `politikk-thinker-integrity-audit.json` — kontrollerer at alle Politikk-tenker-ID-er har ett canonicalt visningsnavn og at alle forekomster er synkronisert.
- `politikk-regimer-institusjoner-audit.json` — kapittelgate for 15 emner, 16 metoder, tre redigerte moduler, 29 sporede claims og 16 inspectable kilder.
- `politikk-valg-partier-velgeratferd-audit.json` — kapittelgate for 5 emner, 5 metoder, tre redigerte moduler, 33 sporede claims og 23 inspectable kilder.
- `politikk-offentlig-politikk-beslutning-implementering-audit.json` — kapittelgate for 5 emner, 5 metoder, tre redigerte moduler, 33 sporede claims og 21 bærende kilder.

## Regenerering

```bash
node scripts/audit-fagverk-subject-inventory.mjs --write-report
node scripts/audit-fagverk-subject-inventory.mjs
node scripts/audit-fagverk-general-engine.mjs --write-report
node scripts/audit-fagverk-general-engine.mjs
node scripts/audit-fagverk-historie.mjs --write-report
node scripts/audit-fagverk-historie.mjs
node scripts/audit-fagverk-natur-pilot.mjs --write-report
node scripts/audit-fagverk-natur-pilot.mjs
node scripts/audit-natur-subject-quality.mjs --write-report
node scripts/audit-natur-subject-quality.mjs
node scripts/audit-natur-fagkart-quality.mjs --write-report
node scripts/audit-natur-fagkart-quality.mjs
node scripts/audit-natur-universal-coverage.mjs --write-report
node scripts/audit-natur-universal-coverage.mjs
node scripts/audit-politikk-subject-quality.mjs --write-report
node scripts/audit-politikk-subject-quality.mjs
node scripts/audit-politikk-thinker-integrity.mjs --write-report
node scripts/audit-politikk-thinker-integrity.mjs
node scripts/audit-politikk-chapter-regimer-institusjoner.mjs --write-report
node scripts/audit-politikk-chapter-regimer-institusjoner.mjs
node scripts/audit-politikk-chapter-valg-partier-velgeratferd.mjs --write-report
node scripts/audit-politikk-chapter-valg-partier-velgeratferd.mjs
node scripts/audit-politikk-chapter-offentlig-politikk-beslutning-implementering.mjs --write-report
node scripts/audit-politikk-chapter-offentlig-politikk-beslutning-implementering.mjs
node --test tests/fagverk-subject-inventory.test.mjs tests/fagverk-general-engine.test.mjs tests/fagverk-historie.test.mjs tests/fagverk-natur-pilot.test.mjs tests/natur-subject-quality.test.mjs tests/natur-fagkart-quality.test.mjs tests/natur-universal-coverage.test.mjs tests/politikk-subject-quality.test.mjs tests/politikk-thinker-integrity.test.mjs tests/politikk-chapter-regimer-institusjoner.test.mjs tests/politikk-chapter-valg-partier-velgeratferd.test.mjs tests/politikk-chapter-offentlig-politikk-beslutning-implementering.test.mjs
```

`subject-baseline.json` er ikke lenger låst til at alle fag må stå urørt på Phase 0. Status kan bare flyttes videre når portalstatus, individuell audit og redaksjonell status følger den bindende progresjonsregelen.

## Hva inventarauditen blokkerer

Auditen feiler når kategori-, manifest-, portal-, inventar- eller statusrekkefølgen avviker; required kjernefiler mangler; schemafamilien ikke samsvarer med manifestet; eller en status hevder mer fremdrift enn navigasjon og audit kan dokumentere.

## Hva motor-auditen blokkerer

Motor-auditen feiler når:

- `fagverk.html` laster politikkspesifikk subject-runtime;
- `subject` mangler eller får alias-/politikkfallback;
- required filstier hardkodes utenfor `data/fag/fag_manifest.json`;
- merkesiden ikke løses gjennom portalregisteret;
- et materialisert fag mangler fagområder, emner eller metoder;
- emner peker til ukjente fagområder eller metoder;
- committed runtime-rapport ikke samsvarer med faktisk kode og data.

## Gjeldende produksjonsstatus

Historie står `materialized`, `audited` og `chapters_in_progress`. Fire av 23 fagområder har registrerte fullverdige kapitler: historisk tid og periodisering, kilder/arkiv/spor, makt/stat/institusjoner og middelalder/kirke/kongemakt. Nitten fagområder, universell theory-evidence og full publiseringsaudit gjenstår.

Natur står `materialized`, `audited` og `chapters_in_progress`. De seks opprinnelige miljøkapitlene og biologifase 1 er bevart. Evolusjon/biologisk mangfold og organismebiologi/fysiologi er nå materialisert med egne emner, metoder, mappinger, fagkart og kapitler. Elleve kapitler dekker alle 65 materialiserte emner. Sopp/lav/mikroorganismer og geologiens indre prosesser står fortsatt som eksplisitte hull før faget kan bli `complete`.

Politikk står `materialized`, `audited` og `chapters_in_progress`. Seks av tretten fagområder har registrerte kapitler, mens sju fortsatt mangler fullverdig hovedkapittel. `Regimer og institusjoner`, `Valg, partier og velgeratferd`, `Offentlig politikk, beslutning og implementering` og `Internasjonal politikk, sikkerhet og samarbeid` har egne briefs, påstandsregistre, avsnittssporing og permanente kapittelaudits. Faget har i tillegg permanente kvalitetsgater for 123 emner, 71 operative metoder, 123 mappingrader, 152 hooks, normal quizåpning, Knowledge-leveranse og canonical ID–navn-integritet for teoripersoner.

De gjenværende fase-2-pilotene er `religion`, `by` og `vitenskap`; Teknologi inngår som nested spesialisering i Vitenskap-piloten. De skal materialiseres individuelt og må passere samme gate før portalstatusen endres.
