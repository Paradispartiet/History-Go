# Historie — universell heldekning

Status: **canonical dekningspolicy og operativ auditinngang**  
Eier: `history_universal_coverage`
Sist kontrollert: **2026-07-26**

## Beslutning

Historie V5.5 skal ikke omtales som et komplett historiefag bare fordi den eksisterende strukturen hadde 20/20 domener, 200/200 emner eller status `FREEZE_READY`.

Disse tallene viste at en forhåndsvalgt modell var fylt ut og kvalitetskontrollert. De beviste ikke at modellen inneholdt alle nødvendige tidsperioder, temafelt, geografiske nivåer, aktørperspektiver eller produksjonsgrunnlag.

Frysing beskytter en versjon. Frysing er ikke en dekningsmåling.

## Autoritetsgrense

Denne filen er den canonical menneskelesbare eieren av **universell Historie-dekning**.

De aktive maskinautoritetene er:

- `data/fag/historie/historie_v5_contract.json` — aktiv Historie-modell og forventede V5.7-kvalitetstall;
- `data/fag/historie/historie_universal_coverage_contract_v1.json` — uavhengig heldekningskontrakt;
- `data/fag/historie/historie_v5_7_freeze_manifest.json` — aktivt kvalitets- og frysemanifest;
- `reports/historie-v5/historie-v5-7-quality-depth.json` — materialisert V5.7-kvalitetsaudit;
- `reports/historie-universal-coverage/historie-universal-coverage.json` — materialisert heldekningsaudit.

`docs/HISTORY_V5_5_FREEZE.md` er en historisk baseline. Den eier ikke aktiv modell, aktiv heldekning eller aktiv kvalitetsfrys. V5.6 er også en historisk, reproduserbar mellomversjon; V5.7 er aktiv modell.

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

Kontrakten er uavhengig av den til enhver tid aktive domenetellingen. Nye dekningsceller skal begrunnes ut fra historiefagets innhold, ikke ut fra hva dagens filer tilfeldigvis allerede inneholder.

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
6. Dersom autoritative V5.7-filer må endres, bruk den bevisste endringsprosedyren og oppdater frysemanifestet med eksplisitt begrunnelse.

## Mål

V5.5 og V5.6 er historiske, reproduserbare kvalitetsbaselines. V5.7 er den aktive universelle Historie-modellen. Heldekningsauditen avgjør hva som fortsatt må legges til før Historie kan regnes som komplett.

<!-- V5_6_PREHISTORY:START -->
## Første faglige reparasjon: V5.6

Den første utvidelsen etter heldekningsauditen opprettet **Forhistorie og arkeologi** som universelt domene. Domenet dekker:

- arkeologisk kontekst og formasjonsprosesser;
- datering, stratigrafi, typologi og seriasjon;
- menneskelig utvikling, mobilitet og jeger-sanker-samfunn;
- steinalder;
- neolitisering, jordbruk og bofasthet;
- bronsealder;
- jernalder;
- vikingtid som transregionalt forløp;
- landskaps- og miljøarkeologi;
- bioarkeologi, helse, kosthold og demografi.

De nye emnene bruker geografinøytrale `recommended_cases` med representative eksempler fra flere verdensregioner. De oppretter ikke norske eller landvise fagkopier. Oslo-spesifikke compatibility-felt i de eldre 200 emnene er fortsatt et separat produksjons- og migreringsgap.
<!-- V5_6_PREHISTORY:END -->

<!-- V5_7_WAR_INTERWAR:START -->
## Andre faglige reparasjon: V5.7

V5.7 opprettet **Første verdenskrig og mellomkrigstiden** som universelt domene med ti emner. Utvidelsen dekker krigsutbruddet i 1914, total og global krig, sivilsamfunn og krigsøkonomi, norsk og nordisk nøytralitet, revolusjoner og fredsoppgjør, demokrati og massepolitikk, autoritære ideologier, den store depresjonen og kultur-, idé- og kunsthistorie i perioden 1914–1939.

Domenet bruker sammenlignbare nordiske, europeiske og globale cases. Eksisterende globalhistorie og offentlighetshistorie er samtidig koblet eksplisitt til nordiske og europeiske mellomkrigsforløp, slik at geografi ikke blir isolert i ett periodedomene.
<!-- V5_7_WAR_INTERWAR:END -->
