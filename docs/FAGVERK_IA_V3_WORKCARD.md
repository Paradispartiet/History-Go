# History GO — Fagverk IA v3 arbeidskort

Status: **aktiv migrering — Batch A og B merget; Batch C pågår**  
Eier: `fagverk_ia_v3`  
Opprettet: **2026-08-28**  
Sist oppdatert: **2026-08-30**

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
- Alle relevante workflowene på slutt-head var grønne før merge.

## Bindende produktbeslutning for Batch C

**Merket beholdes. Den separate merkesiden avvikles.**

Merket er gameplay-/progresjonsidentitet: badge, poeng, nivåer, undermerker og gameplay-konsekvenser. Faglig struktur og lærestoff eies av Fagverket.

Den gamle By-strukturen `merkeside → teori → fagkart → emneside` skal derfor **ikke** kopieres til alle fag. By brukes som en innholdskilde i equivalence-auditen, fordi den viser hvilken teori og struktur legacy-systemet kan inneholde, men dagens canonicale målarkitektur er Fagverket.

Se [`FAGVERK_BADGE_PAGE_EQUIVALENCE_V1.md`](./FAGVERK_BADGE_PAGE_EQUIVALENCE_V1.md).

## Mål

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
          → badgeidentitet, poeng, nivå, undermerker, emnedekning og quizhistorikk
```

## Bindende designbeslutninger

1. **Ingen ny `view=`-semantikk.** Eksisterende canonical URL-kontrakt beholdes.
2. **Ingen ny fagdata-sannhetskilde.** `category_contract` + `fag_manifest` + canonical fagfiler forblir autoritative.
3. **Ingen ny progresjonsstorage.** Eksisterende read-model og state-kilder gjenbrukes.
4. **Alle emner skal være synlige uavhengig av brukerprogresjon.** Progresjon er metadata, ikke synlighetsfilter.
5. **Fagområde er struktur; emne er primær canonical læringsenhet; kapittel er redigert lærestoff; merke er gameplay/progresjonsidentitet.**
6. **Curriculum/læringsløp vises bare når canonical source definerer det.**
7. **Steder forblir egne tverrfaglige fagverkssider.**
8. **Legacy-merkesider redirectes først etter funksjons- og innholdsekvivalens.**
9. **By-modellen er ikke ny standard for separate merkesider.** Innholdet auditeres og absorberes i riktige canonicale eiere.

## Batch C — legacy-ekvivalens og avvikling

### Equivalence-familier

Den permanente auditen klassifiserer hvert `badgePage` som:

- `progress_route`
- `rich_runtime`
- `legacy_static_theory`
- `legacy_stub`

`unknown` og `missing` er blokkerende feil.

### Pågående første tranche

- [x] Definer permanent badge-page equivalence-gate.
- [x] Flytt badgeidentitet, poeng/nivå, nivåstige og badge-undermerker inn i Fagverkets Progresjon.
- [x] Flytt Helse og Utdanning fra generisk `merke.html`-produktflate til direkte Progresjon-ruter i portalregisteret.
- [x] Gjør `merke.html?badge=<id>` til fail-closed compatibility-redirect til fagets Progresjon.
- [x] Kjør full CI og merge første Batch C-tranche.

### Gjenstående Batch C

- [x] Reconcile eldre siderolleprosa i `FAGVERK.md` med navigasjonskontrakt v3.
- [ ] Kjør innholdsaudit av `legacy_static_theory`, med By som representativt førstefag.
- [ ] Migrer kun unik, gyldig teori som mangler canonicalt til riktig emne/metode/begrep/kapittel/fagoversikt.
- [x] Migrer Politikkens `rich_runtime`-funksjoner til Progresjon/Emner/Utforsk, arkiver originalen byte-for-byte og pensjoner separat portalruntime.
- [ ] Audit `legacy_stub` for unik tekst og aktive lenker; redirect etter grønn gate.
- [x] Gjør `emner.html` eksplisitt til **Min læring** / global progresjonsflate.
- [ ] Redirect resterende legacy `badgePage` fagvis etter equivalence-gate.
- [x] Redirect `merker/merker.html` når ingen canonical brukerreise trenger portalen.
- [ ] Fjern døde CSS-/JS-lag etter permanent referanse- og browseraudit.

## Representativ QA

- **By** — statisk fullteori og eldre separat fagkart/emnesystem.
- **Politikk** — rik runtime med undermerker, emneprogresjon, quizhistorikk, steder og begreper.
- **Helse/Utdanning** — generisk badge-fallback; første sikre redirectfamilie.
- **Religion/Scenekunst** — tynne legacy-stubber.
- **Historie/Vitenskap** — store fagpakker som skal bevare canonical dypkobling og lærestoff.
- deretter alle materialiserte fag gjennom permanent general-engine/equivalence-audit.

## Ferdigdefinisjon

Migrasjonen er først ferdig når:

1. Fagverkforsiden har én primær vei inn i hvert fag. **Oppfylt.**
2. Alle canonicale emner kan finnes uten tidligere quizaktivitet. **Oppfylt.**
3. Domain-, emne- og chapter-dypkoblinger er stabile og fail-closed. **Oppfylt og testet.**
4. Emne og kapittel har tydelig forskjellige roller. **Oppfylt.**
5. Progresjon bruker eksisterende state/read-model uten ny lagring. **Oppfylt og testet.**
6. Badgeidentitet, nivåstige og undermerker finnes i Fagverket. **Implementert i første Batch C-tranche; CI gjenstår.**
7. Alle funksjoner som faktisk trengs fra rich legacy-sider finnes i Fagverket før redirect. **Oppfylt; Politikk er migrert og låst med permanent runtime-equivalence-port.**
8. Ingen unik gyldig fagkunnskap slettes. **Gjenstår innholdsaudit av statiske teorisider.**
9. Alle gamle merkesider er redirect/compatibility-only og `merker/merker.html` er avviklet. **Gjenstår.**
10. Permanente all-subject-, equivalence-, TypeScript- og browserporter er grønne på `main`. **Gjenstår sluttfase.**
