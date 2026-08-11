# Historie — universell heldekning

Status: **canonical dekningspolicy og operativ auditinngang**  
Eier: `history_universal_coverage`
Sist kontrollert: **2026-08-11**

## Beslutning

Historie skal ikke omtales som et komplett historiefag bare fordi en versjon har eksakte domenetall, full intern readiness eller status `FROZEN`.

Disse signalene viser at et versjonert inventar er fylt ut, kvalitetskontrollert og beskyttet. De beviser ikke at modellen inneholder alle nødvendige tidsperioder, temafelt, geografiske nivåer, aktørperspektiver eller produksjonsgrunnlag.

Frysing beskytter en versjon. Frysing er ikke en dekningsmåling.

Det samme gjelder emne- og teoriobjekttall. De 230 objektene i aktiv V5.8 er dagens canonicale inventar og en denominator for integritets- og evidensrapportering, ikke en evig faglig kvote. Hvis heldekningsauditen finner et nytt relevant historiefelt eller emne, skal fagmodellen og denominator utvides før Historie kan beholde `COMPLETE`; det nye emnet skal ikke avvises fordi et tidligere tall allerede er nådd.

## Autoritetsgrense

Følgende kilder har hvert sitt avgrensede ansvar:

1. `data/fag/historie/historie_v5_contract.json` eier aktiv fagversjon og versjonsspesifikke kvalitetsmål. Aktiv modell er V5.8.
2. Dette dokumentet eier den menneskelesbare policyen for universell Historie-dekning.
3. `data/fag/historie/historie_universal_coverage_contract_v1.json` og rapportene under `reports/historie-universal-coverage/` eier maskinell dekningsstatus.
4. `data/fag/historie/historie_v5_8_freeze_manifest.json` og `reports/historie-v5/historie-v5-8-quality-depth.json` eier aktiv kvalitets- og fryseverifikasjon.
5. `docs/HISTORY_V5_5_FREEZE.md` er en historisk baseline og eier ingen aktiv kontrakt.

V5.5–V5.7 skal behandles som reproduserbare baselines. De kan forklare utviklingen fram til V5.8, men kan ikke overstyre aktiv kontrakt, aktivt manifest eller den uavhengige heldekningsauditen.

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

Kontrakten er uavhengig av versjonsspesifikke domenetall. Nye dekningsceller skal begrunnes ut fra historiefagets innhold, ikke ut fra hva aktive filer tilfeldigvis allerede inneholder.

Full score mot dagens kontrakt er nødvendig, men ikke tilstrekkelig hvis kandidat-, gap- eller utelatelsesauditen viser at kontrakten selv mangler et relevant felt. `docs/FAGVERK.md` eier den felles heldekningsregelen uten tallkvoter.

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
6. Dersom autoritative filer for aktiv V5.8 må endres, bruk den bevisste endringsprosedyren og opprett en ny fagversjon eller oppdater aktivt frysemanifest med eksplisitt begrunnelse.

## Mål

V5.5–V5.7 er historiske, reproduserbare baselines. V5.8 er den aktive universelle Historie-modellen. Heldekningsauditen avgjør hva som fortsatt må legges til før Historie kan regnes som komplett.

<!-- V5_6_PREHISTORY:START -->
## Første faglige reparasjon: V5.6

Den første utvidelsen etter heldekningsauditen oppretter **Forhistorie og arkeologi** som universelt domene. Domenet dekker:

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

V5.7 oppretter **Første verdenskrig og mellomkrigstiden** som universelt domene med ti emner. Utvidelsen dekker krigsutbruddet i 1914, total og global krig, sivilsamfunn og krigsøkonomi, norsk og nordisk nøytralitet, revolusjoner og fredsoppgjør, demokrati og massepolitikk, autoritære ideologier, den store depresjonen og kultur-, idé- og kunsthistorie i perioden 1914–1939.

Domenet bruker sammenlignbare nordiske, europeiske og globale cases. Eksisterende globalhistorie og offentlighetshistorie er samtidig koblet eksplisitt til nordiske og europeiske mellomkrigsforløp, slik at geografi ikke blir isolert i ett periodedomene.
<!-- V5_7_WAR_INTERWAR:END -->

<!-- V5_8_COLD_WAR:START -->
## Tredje faglige reparasjon: V5.8

V5.8 oppretter **Den kalde krigen og etterkrigssamfunnet 1945–1991** som universelt domene med ti emner. Utvidelsen dekker supermakter og blokker, atomvåpen, globale stedfortrederkriger, avkolonisering og alliansefrihet, Europas deling og 1989, Norge og Norden, velferdsstat og planlegging, bønder og fiskere, religiøse fellesskap samt fattige og sosialt marginaliserte.

Domenet bruker sammenlignbare nordiske, europeiske og globale cases og lukker fire dokumenterte dekningsgap uten å redusere auditterskler. Oslo og Akershus forblir et separat geografisk profil- og produksjonsarbeid.
<!-- V5_8_COLD_WAR:END -->

## Status etter profil- og evidensgrunnlag V1

- Den universelle fagmatrisen har **58 av 58 dekningsceller** dekket.
- Oslo/Akershus er flyttet fra universell fagcelle til separat geografisk produksjonsprofil.
- `recommended_oslo_cases` er migrert ut av universelle emner.
- Alle 230 emner i det daværende canonicale inventaret refererer til fire universelle casekrav.
- Canonical claim-, source- og place-evidence-registre er etablert med Oslo rådhus som validert pilot.
- Totalstatus er fortsatt `INCOMPLETE` så lenge teoriobjektene ikke har fullt dokumentert evidensgrunnlag.
