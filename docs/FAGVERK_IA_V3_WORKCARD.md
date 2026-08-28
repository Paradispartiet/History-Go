# History GO — Fagverk IA v3 arbeidskort

Status: **aktiv migrering — Batch A og B merget; Batch C neste**  
Eier: `fagverk_ia_v3`  
Opprettet: **2026-08-28**  
Sist oppdatert: **2026-08-28**

## Gjennomført

### Batch A — subject-first portal og felles shell

**Merget i PR #5420** som `378d5b58b25831e4b562d429da2ac01383bf1cf9`.

- Fagverkforsiden har faget som primær inngang; gamle merkesider er sekundære compatibility-lenker.
- Subject-roten har fem hash-drevne hovedflater: **Oversikt · Emner · Lærestoff · Utforsk · Progresjon**.
- Ingen ny `view=`-semantikk er innført.
- Alle canonicale emner er tilgjengelige uavhengig av progresjon.
- Emner er gruppert med progressive disclosure per fagområde og søk åpner bare relevante grupper.
- Source-eid curriculum/studieløp gjenbrukes under Lærestoff; renderer finner ikke på rekkefølge.
- Career Knowledge Bridge holdes inne i Utforsk.
- Progresjon leses fra eksisterende read-model uten ny storage.
- Den store subject-root-sidebarens duplisering er fjernet.
- Permanent IA-test er koblet inn i general-engine-workflowen.
- Hele PR-matrisen var grønn før merge.

### Batch B — domain-, emne- og chapter-detaljer

**Merget i PR #5427** som `0a7b177b9ec1cc0861004823452952f506706f5d`.

- Domain-, emne- og chapter-visninger har kompakt kontekstnavigasjon tilbake til faget.
- Den gamle fulle sidebarinventeringen skjules også på detaljflater.
- Emnet viser beregnet dekning fra eksisterende læringssignaler, uten egen emnestatus-storage.
- Direkte canonical chapter-binding løftes frem som primær vei til redigert lærestoff.
- Kapitler viser canonicale emnebindinger som sammenfoldbar navigasjon uten å kopiere emneinnhold.
- Detail-shim følger samme prioritet som base-rendereren: `chapter → emne → domain`, også når chapter-URL-er beholder emne/domain som kontekst.
- Topplinjen bruker rollene **Merkevisning** og **Min læring** i stedet for å late som merkesiden er en parallell læringsvei.
- Permanent detail-IA-test er koblet inn i general-engine-workflowen.
- Alle 14 workflowene på slutt-head var grønne før merge, inkludert general-engine, TypeScript/build, Historie, Politikk, By, Natur, Vitenskap, Religion, Film/TV, Musikk, Psykologi og place-learning.

## Dokumentasjonsreconciliation som står igjen

`FAGVERK_NAVIGATION.md` v3 eier eksplisitt navigasjon og sideroller og er derfor bindende for IA v3. `FAGVERK.md` har fortsatt eldre beskrivende tekst i seksjonen om fire produktflater. Dette skaper ikke runtime- eller eierskapsuklarhet fordi hovedkontrakten selv delegerer navigasjon/sideroller til `FAGVERK_NAVIGATION.md`, men prose-reconciliation skal gjøres i Batch C slik at dokumentene også er språklig samstemte.

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
- emnedetaljen viser beregnet progresjon og tydelig lenke til direkte bundet redigert lærestoff når binding finnes.

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

## Legacy-migrering — Batch C

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

### ✅ Batch A — kontrakt og felles shell

Runtime/product-del merget i PR #5420. Dokumentasjonsreconciliation av eldre `FAGVERK.md`-prosa flyttes eksplisitt til Batch C; `FAGVERK_NAVIGATION.md` v3 er allerede bindende eier av siderollene.

### ✅ Batch B — innholdsseparasjon

Merget i PR #5427. Subject-root, domain-, emne- og chapter-visninger følger nå IA v3 uten å endre canonical ressursidentitet.

### ▶ Batch C — legacy-ekvivalens og avvikling

- [ ] Reconcile eldre siderolleprosa i `FAGVERK.md` med navigasjonskontrakt v3.
- [ ] Inventer alle merkesider.
- [ ] Migrer kun unik, gyldig kunnskap som mangler canonicalt.
- [ ] Flytt rik runtime-funksjonalitet til Fagverk der den hører hjemme.
- [ ] Gjør `emner.html` til Min læring/compatibility.
- [ ] Redirect legacy merkesider etter fagvis equivalence-gate.
- [ ] Redirect `merker/merker.html` når Fagverkforsiden er komplett.
- [ ] Fjern døde CSS-/JS-lag etter permanent referanse- og browseraudit.

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

1. Fagverkforsiden har én primær vei inn i hvert fag. **Oppfylt i Batch A.**
2. En ny bruker kan åpne et fag og se alle canonicale emner uten å ha tatt quiz. **Oppfylt i Batch A.**
3. Domain-, emne- og chapter-dypkoblinger er fortsatt stabile og fail-closed. **Oppfylt og permanent testet i Batch A/B.**
4. Emne og kapittel har tydelig forskjellige roller i UI-et. **Oppfylt i Batch B.**
5. Progresjon leses fra eksisterende canonical state/read-model uten ny lagring. **Oppfylt og permanent testet.**
6. All funksjonalitet som faktisk trengs fra aktive merkesider finnes i Fagverket før legacy-sidene redirectes. **Gjenstår Batch C.**
7. Ingen unik, gyldig fagkunnskap slettes i legacy-migreringen. **Gjenstår Batch C-equivalence.**
8. `merker/merker.html` og gamle merkesider er enten avviklet eller eksplisitt compatibility-only. **Gjenstår Batch C.**
9. Mobil og desktop har forståelig hierarki uten en lang, duplisert sidebar før læringsinnholdet. **Strukturelt oppfylt i Batch A/B; visuell browser-sluttkontroll gjenstår før programclose.**
10. Permanente all-subject-, link-, schema-, TypeScript- og browserporter er grønne på `main`. **Automatiske all-subject/TypeScript-porter er grønne for A/B; endelig browser- og legacy-port gjenstår Batch C.**
