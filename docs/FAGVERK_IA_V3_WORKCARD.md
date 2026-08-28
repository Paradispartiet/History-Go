# History GO — Fagverk IA v3 arbeidskort

Status: **aktiv migrering**  
Eier: `fagverk_ia_v3`  
Opprettet: **2026-08-28**

## Mål

Rydd Fagverket uten å bygge en ny parallell fagmodell. Bevar den eksisterende manifest-first subject-motoren, canonicale `subject` / `domain` / `emne` / `chapter`-dypkoblinger, fagdata, Knowledge, quiz og progresjonskilder.

Målbildet er:

```text
Fagverket
  → Fag
      → Oversikt
      → Emner
          → Fagområde
          → Emne
      → Lærestoff
          → Canonicale kapitler / eksplisitte curriculum-stier
      → Utforsk
          → steder og dokumenterte fagkoblinger
      → Progresjon
          → badgeidentitet, poeng, nivå, emnedekning og quizhistorikk
```

`Merke` beholdes som gameplay-/progresjonsidentitet og canonical badge-data, men den separate merkesiden skal på sikt ikke være en likestilt innholdsflate ved siden av fagsiden.

## Bekreftet repo-baseline

- Alle canonicale fag åpnes allerede gjennom `fagverk.html?subject=<subject_id>`.
- Felles runtime velger allerede `chapter → emne → domain → overview` fra URL-parametere.
- Canonicale emnesider finnes allerede gjennom `renderEmne()` og skal gjenbrukes og forbedres, ikke erstattes.
- Emne er canonical kunnskapsenhet; kapittel er redigert lærestoff som kan dekke ett eller flere emner.
- `emner.html` er i praksis et personlig progresjonsdashboard, ikke en full emnekatalog, fordi fag/emner uten målbar dekning filtreres bort.
- Merkesidene er fragmenterte: gamle statiske teorisider, nyere tynne generic-sider og minst én rik runtime-side (Politikk).
- `merker/merker.html` er legacy og avviker fra dagens canonicale kategorikontrakt.
- `HGFagverkSubjectModel.readProgress()` er allerede read-model over eksisterende state og skal gjenbrukes; ingen ny progresjonsstorage skal innføres.
- Den generelle fagsidemotoren er allerede materialisert for alle fag. IA-endringer skal derfor gjøres i felles shell/runtime og valideres mot alle fag, ikke implementeres som separate fagmotorer.

## Bindende designbeslutninger

1. **Ingen ny `view=`-semantikk.** Eksisterende canonical URL-kontrakt beholdes.
2. **Ingen ny fagdata-sannhetskilde.** `category_contract` + `fag_manifest` + canonical fagfiler forblir autoritative.
3. **Ingen ny progresjonsstorage.** Eksisterende read-model og state-kilder normaliseres videre.
4. **Alle emner skal være synlige uavhengig av brukerprogresjon.** Progresjon er metadata, ikke synlighetsfilter.
5. **Fagområde er struktur; emne er primær canonical læringsenhet; kapittel er redigert lærestoff; merke er gameplay/progresjonsidentitet.**
6. **Curriculum/læringsløp skal bare presenteres som anbefalt eller eksplisitt rekkefølge når canonical source faktisk definerer dette.** Renderer skal ikke finne på pedagogisk rekkefølge.
7. **Steder forblir egne tverrfaglige fagverkssider.** Fagsiden lenker til dem, men kopierer dem ikke inn som lokale fagkapitler.
8. **Legacy-merkesider avvikles først etter funksjons- og innholdsekvivalens.** Unik gyldig kunnskap og funksjonalitet skal inventeres før redirect.

## Ny fagside-IA

### Oversikt

Rolig startflate med:

- fagets navn og korte eide beskrivelse;
- kompakt progresjonsstatus;
- tydelig inngang til Emner;
- tydelig inngang til Lærestoff;
- eventuelt «fortsett» når eksisterende read-model kan støtte det uten ny state;
- begrenset, kuratert fremvisning av fagområder eller aktuelle innganger.

Oversikten skal ikke samtidig dumpe alle fagområder, alle kapitler, alle metoder og alle steder.

### Emner

- viser **alle** `model.emners`;
- grupperer etter `model.domains`;
- har søk over emnetittel, definisjon og relevante canonicale begreper;
- viser progresjon sekundært;
- bruker eksisterende canonical `domainUrl()` og `emneUrl()`;
- beholder dagens emnerenderer som detaljside;
- emnedetaljen kan vise emnets beregnede progresjon og tydelig lenke til relevant redigert lærestoff.

### Lærestoff

- viser materialiserte canonicale kapitler fra registry;
- viser eksplisitte curriculum/pathway-strukturer når source eier dem;
- skiller mellom læringsrekkefølge og teknisk fagregister;
- kopierer ikke emneobjekter inn i kapitler eller omvendt.

### Utforsk

- relevante steder og andre dokumenterte tverrkoblinger som den normaliserte modellen faktisk bærer;
- skal være en utforskingsflate, ikke hovedhierarkiet for fagstrukturen.

### Progresjon

- badgeidentitet;
- poeng og nivå;
- emnedekning;
- dekning per fagområde;
- relevante quizresultater/historikk;
- undermerker når disse er normalisert fra eide badgekilder;
- eventuell kurs-/pensumstatus gjennom eksisterende Courses/read-model, ikke en ny lagringsmodell.

## Legacy-migrering

### `emner.html`

Rollen omdefineres fra «emnekatalog» til global **Min læring** / progresjonsoversikt. Den kan beholde eksisterende beregninger, men skal ikke være stedet brukeren forventes å finne hele emnekatalogen.

### Merkesider

Inventer hvert fag som:

- `legacy_static_theory`
- `rich_runtime`
- `generic_fallback`

Før avvikling skal vi kontrollere:

- unik faglig tekst som ikke finnes canonicalt;
- undermerke-/progressfunksjoner;
- emne-/begrepssøk;
- quizhistorikk;
- stedslister;
- andre aktive lenkemål.

Når funksjons- og innholdsekvivalens er bevist, kan gammel merkeside redirecte til fagets progresjonsflate.

### `merker/merker.html`

Avvikles som egen canonical portal etter at Fagverkforsiden er eneste komplette portal. Legacy-ruten beholdes som redirect/compatibility så lenge eksterne eller interne lenker krever det.

## Implementeringsrekkefølge

### Batch A — kontrakt og felles shell

- Oppdater `docs/FAGVERK.md`, `docs/FAGVERK_NAVIGATION.md` og relevante arkitekturtekster med ny siderolle.
- Behold eksisterende canonical query-parametere.
- Gjør Fagverk-shellen mindre støyende: fjern permanent duplisering mellom sidebar og hovedinnhold.
- Innfør tydelige hovedinnganger til Oversikt, Emner, Lærestoff, Utforsk og Progresjon uten ny query-state.
- Bygg full Emner-katalog fra normalisert modell.
- Bygg Progresjon-flate fra `MODEL.readProgress()`.
- Bevar eksisterende domain/emne/chapter-dypkoblinger.
- Kjør all-subject general-engine og relevante link-/browserporter.

### Batch B — innholdsseparasjon

- Flytt/rendyrk curriculum til Lærestoff.
- Skill generelle fagoversikter fra fagspesifikke studieløp.
- Rendyrk Utforsk.
- Forbedre emnedetaljen med progresjon + sterkere overgang til relevant kapittel.
- Rydd mobilnavigasjonen.

### Batch C — legacy-ekvivalens og avvikling

- Inventer alle merkesider.
- Migrer kun unik, gyldig kunnskap som mangler canonicalt.
- Flytt rik runtime-funksjonalitet til Fagverk der den hører hjemme.
- Gjør `emner.html` til Min læring/compatibility.
- Redirect legacy merkesider etter fagvis equivalence-gate.
- Redirect `merker/merker.html` når Fagverkforsiden er komplett.
- Fjern døde CSS-/JS-lag etter permanent referanse- og browseraudit.

## Representativ QA

Utviklingskontroll skal minst dekke:

- **By** — compatibility-schema og gammel statisk merkeside;
- **Historie** — stor curriculum/periodisering og mange emner;
- **Politikk** — rik curriculum, stort begrepsregister og rik legacy merkeside;
- **ett foundation-fag** — mindre schemafamilie;
- **Vitenskap** — vitenskapelig pakke og nested Teknologi-spesialisering;
- deretter **alle materialiserte fag** gjennom permanent general-engine/all-subject-audit.

## Ferdigdefinisjon

Migrasjonen er først ferdig når:

1. Fagverkforsiden har én primær vei inn i hvert fag.
2. En ny bruker kan åpne et fag og se alle canonicale emner uten å ha tatt quiz.
3. Domain-, emne- og chapter-dypkoblinger er fortsatt stabile og fail-closed.
4. Emne og kapittel har tydelig forskjellige roller i UI-et.
5. Progresjon leses fra eksisterende canonical state/read-model uten ny lagring.
6. All funksjonalitet som faktisk trengs fra aktive merkesider finnes i Fagverket før legacy-sidene redirectes.
7. Ingen unik, gyldig fagkunnskap slettes i legacy-migreringen.
8. `merker/merker.html` og gamle merkesider er enten avviklet eller eksplisitt compatibility-only.
9. Mobil og desktop har forståelig hierarki uten en lang, duplisert sidebar før læringsinnholdet.
10. Permanente all-subject-, link-, schema-, TypeScript- og browserporter er grønne på `main`.
