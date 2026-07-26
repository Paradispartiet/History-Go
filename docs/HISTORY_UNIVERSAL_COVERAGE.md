# Historie — universell heldekning

Status: **canonical dekningspolicy og operativ auditinngang**  
Eier: History GO fagdata  
Sist kontrollert: **2026-07-26**

## Beslutning

Historie V5.5 skal ikke omtales som et komplett historiefag bare fordi den eksisterende strukturen har 20/20 domener, 200/200 emner eller status `FREEZE_READY`.

Disse tallene viser at en forhåndsvalgt modell er fylt ut og kvalitetskontrollert. De beviser ikke at modellen inneholder alle nødvendige tidsperioder, temafelt, geografiske nivåer, aktørperspektiver eller produksjonsgrunnlag.

Frysing beskytter en versjon. Frysing er ikke en dekningsmåling.

## Bindende målestokk

Universell heldekning krever fem uavhengige akser:

1. **Tid** — fra forhistorie til samtid uten store kronologiske hull.
2. **Tema** — sentrale politiske, økonomiske, sosiale, kulturelle, religiøse, teknologiske, miljømessige og materielle historiefelt.
3. **Geografi** — lokal, nasjonal, nordisk, europeisk og global dekning, med konkrete ikke-europeiske forløp.
4. **Aktører** — både makthavere og grupper som ofte blir underrepresentert i kilder og tradisjonelle framstillinger.
5. **Historiefaglig produksjon** — metoder, kronologi, alternative fortolkninger, representative cases, claims, kilder og stedsevidens.

Alle fem aksene må være komplette før Historie kan få universell status `COMPLETE`.

## Canonical kontrakt

Den maskinlesbare referansen ligger i:

```text
data/fag/historie/historie_universal_coverage_contract_v1.json
```

Kontrakten er uavhengig av de eksisterende 20 domenene. Nye dekningsceller skal begrunnes ut fra historiefagets innhold, ikke ut fra hva dagens filer tilfeldigvis allerede inneholder.

## Permanent audit

Kjør:

```bash
mkdir -p reports/historie-universal-coverage

node tools/audit-historie-universal-coverage.mjs \
  | tee reports/historie-universal-coverage/audit-command.log
```

Kontroller at materialiserte rapporter er oppdatert:

```bash
node tools/audit-historie-universal-coverage.mjs --check
```

Krev full heldekning eksplisitt:

```bash
node tools/audit-historie-universal-coverage.mjs --check --require-complete
```

`--require-complete` skal ikke aktiveres som grønn hovedport før alle reelle gap er lukket. Fram til da skal workflowen håndheve at auditkontrakten og rapportene er gyldige og oppdaterte, samtidig som rapportstatusen ærlig forblir `INCOMPLETE`.

## Tre dekningsnivåer

Auditen skiller mellom:

- `COVERED` — feltet har nok dedikerte emner, støttende emner og fagområder;
- `PARTIAL` — feltet nevnes eller støttes, men mangler tilstrekkelig eksplisitt dybde;
- `MISSING` — modellen har ingen meningsfull dekning av feltet.

Et tilfeldig ordtreff kan aldri alene gi `COVERED`. Kjernedekning krever at feltet er synlig i emnetittel, område, kortetikett eller annen dedikert fagstruktur.

## Produksjon er en egen akse

Et godt formulert emne er ikke ferdig produksjonsgrunnlag. Full status krever blant annet:

- metodekobling;
- kronologi og eksplisitt tidsavgrensning;
- alternative historiografiske fortolkninger;
- geografinøytrale casekoblinger;
- canonical claim-register;
- canonical kilderegister;
- eksplisitt sted–emne–claim–kilde-evidens;
- teoriobjekter som først blir `evidence_ready` etter at dette grunnlaget er validert.

Krav om at en framtidig quiz skal bruke en ekstern kilde er ikke det samme som at claimet og kilden allerede finnes.

## Forholdet til universelle fagfiler

`docs/SUBJECT_FILE_CONTRACT.md` gjelder fullt ut:

- fagkart, emner, begreper, teorier og metoder er universelle;
- Oslo, Akershus, Norge og andre geografier realiserer faget gjennom profiler, mappings, cases, claims, kilder, steder, personer og quiz;
- manglende lokal produksjon skal ikke løses med komplette landkopier av faget;
- lokale Oslo-felt i dagens canonical objekter er migreringsgjeld, ikke en modell for nye landfiler.

## Endringsregel

Når auditen viser et gap:

1. Kontroller om gapet gjelder den universelle fagmodellen eller bare geografisk produksjon.
2. Utvid universelle domener og emner når selve faget mangler et område.
3. Utvid geografiske profiler og evidenslag når fagobjektet finnes, men lokale cases eller kilder mangler.
4. Ikke reduser terskelen eller legg til svake ankere bare for å få grønn status.
5. Oppdater kontrakt, rapport og relevant dokumentasjon i samme PR.
6. Dersom autoritative V5.5-filer må endres, bruk den bevisste endringsprosedyren og opprett en ny fagversjon eller oppdater frysemanifestet med eksplisitt begrunnelse.

## Mål

V5.5 er en gjennomarbeidet og beskyttet kjerne. Den universelle heldekningsauditen avgjør hva som må legges til før Historie kan regnes som komplett.
