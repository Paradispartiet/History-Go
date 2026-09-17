# History GO — Place Production v3

Status: **canonical workflow-state og operatorflyt for migrerte Places**  
Eier: `place_by_place_production_workflow`  
Sist kontrollert: **2026-09-16**

Place Production v3 gjør produksjonen enklere ved å skille **faglig/faktuell source of truth** fra **workflow-state** og ved å derivere rapporter og CI-ruting i stedet for å vedlikeholde dem parallelt.

V3 endrer ikke kravene i `docs/PLACE_PRODUCTION_CHECKLIST.md`, `docs/PLACE_PRODUCTION_PROFILES.md`, `data/places/README_place_rounds.md` eller subsystemenes egne canonicale kontrakter.

## Én arbeidsflyt

For et Place som er migrert til V3 er den operative rekkefølgen:

```text
Place factuality/content sources
→ data/places/workflow/<place_id>.json
→ npm run place:plan -- <place_id>
→ innholds-/entityarbeid gjennom canonicale subsystemeiere
→ npm run place:build -- <place_id>
→ manuell bilde-/UI-QA
→ npm run place:verify -- <place_id>
→ PR → exact-head CI → merge
```

## Eierskap

`data/places/production/<place_id>.json` beholder sitt eksisterende factuality-/claim-eierskap. V3 skal aldri bruke denne filen som en generell workflow-logg.

`data/places/workflow/<place_id>.json` er den eneste håndvedlikeholdte V3-recorden for produksjonsstatus og eier bare:

- semantic contract-versjoner;
- produksjonsprofil og begrunnelse;
- source-review-status;
- samlings- og modulbeslutninger;
- eksplisitte blockers;
- manuelle review-attestasjoner;
- referanser til canonicale subsystemoutputs;
- avledet/sluttført workflow-state.

Workflow-recorden dupliserer aldri full People-, Object-, Brand-, Historical Event-, Production-, Quiz-, Knowledge-, Story-, Leksikon- eller factuality-data.

## Statusspråk

Samlings- og modulstatus er eksakt:

```text
PASS
BEGRUNNET_NA
BLOCKED
```

- `PASS`: reelt kvalifisert og ferdig materialisert.
- `BEGRUNNET_NA`: dokumentert kandidataudit fant ingen naturlig kvalifisert kandidat.
- `BLOCKED`: kvalifisert kandidat/innhold finnes, men evidens, asset, proveniens eller materialisering mangler.

Produksjonsprofil er eksakt:

```text
major | standard | focused | micro
```

Quiz-rikhet er fortsatt en separat beslutning. `rich` er ikke en V3-produksjonsprofil.

## Genererte flater

For et migrert V3-Place er disse projeksjoner og skal ikke håndredigeres:

```text
reports/place-production/<place>-workcard-current.json
reports/place-production/<place>-quality-gate-current.json
```

De bygges fra `data/places/workflow/<place_id>.json` og kontrolleres byte-deterministisk med `--check`.

## Kommandoer

### Plan

```bash
npm run place:plan -- <place_id>
```

Viser profil, avledet state, ferdige samlinger, blockers og factuality-kilden. Ingen writes.

### Build

```bash
npm run place:build -- <place_id>
```

Kjører bare registrerte deterministiske eiere/buildere og regenererer V3-projeksjoner. Ukjent nødvendig builder skal feile lukket i stedet for å gjettes.

### Verify

```bash
npm run place:verify -- <place_id>
```

Validerer workflow-record, factuality-referanse, projection freshness, generiske Place-gater, relevante place-regresjoner og at deklarert state er lik avledet state.

## CI-ruting

Canonical impact-ruting eies av:

```text
.github/ci/place-production-routing-v2.json
```

Moduser:

- `governance-only` — dokumentasjon/regeltekst som ikke endrer runtime eller schema;
- `shared-contract` — schema/routing/generator-kontrakter;
- `affected-places` — stedsspesifikke endringer;
- `full-matrix` — shared runtime/generator-endringer med reell global blast radius.

Precedens er:

```text
full-matrix > shared-contract > affected-places > governance-only
```

Ukjente V3 workflow-paths feiler lukket. Ren checklist-prosa skal ikke automatisk kjøre alle registrerte stedstester eller installere Chromium.

## Legacy og migrering

V3 er additivt:

- Places uten `data/places/workflow/<place_id>.json` følger eksisterende legacy-produksjonsløp;
- eksisterende bespoke phase-/completion-tester beholdes til tilsvarende generisk invariant eller uttrykkelig unik regel er på plass;
- ingen massekonvertering skjer bare for å få V3-dekning;
- factuality, provenance, koordinater, Quiz, Fagverk, bilder og manuell QA svekkes aldri av migreringen.

Akershus slott er første pilot. Piloten endrer workflow-state og rapport-eierskap, ikke factuality-bytene eller brukerrettet innhold.
