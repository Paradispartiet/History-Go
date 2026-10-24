# Oslo six culture and institutions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gi de seks eksisterende stedene kildebelagt v1-innhold og dokumentert appvisning i en separat PR.

**Architecture:** Bevar canonical Place-ID-er og korrekt eksisterende innhold. Place-filene eier Fagverk; quiz, QuizCards og Knowledge følger eksisterende manifester og deterministiske bygg. PR #6579 holdes separat.

**Tech Stack:** JSON, JavaScript/Node, eksisterende History GO-generatorer og nettleser-QA.

**Spec:** Brukerens seksstedsforslag og `docs/PLACE_PRODUCTION_MINIMUM_V1.md`, med aktive overstyringer i `docs/PLACE_PRODUCTION_CHECKLIST.md`.

## Global Constraints

- Bare de seks ID-ene i `reports/place-production/oslo-six-culture-institutions-intake-20261023.json`.
- Ingen nye kartpunkter eller endring av den andre kontoens Oslo-bolk 04.
- Ingen V3 `complete` eller publisert v1 før alle relevante porter består.
- Eksisterende god fullquiz og QuizCard bevares; ingen dubletter.
- Bilder krever stedlig identitet, faktisk fil, rettighet og appvisning; utgått `cardImage` videreføres ikke.

## Review Focus

- Eldorado: 1924 i teksten er i konflikt med kildenes 1911-kinostart.
- Sted/institusjon: byrom er ikke nabobygning, og museum er ikke Nobelkomiteen.
- Tid: planlagt åpning eller vedtatt tiltak er ikke faktisk åpning eller gjennomføring.
- Foto: historisk motiv kan ikke framstilles som dagens situasjon.
- QuizCard: test faktisk synlig og spillbar bakside, ikke bare DOM-tekst.

---

### Task 1: Kilde- og regelpreflight for alle seks

- [x] Bekreft canonical ID-er, kategori, hovedfiler og eksisterende quiz/QuizCards.
- [x] Les alle seks eksisterende `desc` og `popupDesc` og dokumenter konkrete forbedringsbehov.
- [ ] Les alle gjeldende READ-FIRST-filer og relevante tekst-, bilde-, Fagverk- og quizkontrakter; registrer ekte regelpreflight.
- [ ] Les primærkilder, løs navne-/datouenigheter og bygg stedsspesifikk claim-bank før profil og samlingsvalg.

### Task 2: Historie, Fagverk og bilder

**Files:** De seks canonicale Place-filene oppgitt i intake-JSON, tilhørende production-/claim-pakker og Fagverk-registry.

- [ ] Gjennomfør kildebelagt tekstrevisjon og nødvendige separate fakta-/språkreviews etter canonical tekstkontrakt.
- [ ] Bygg seks unike Place-eide Fagverk-sider med canonical emne-/kapittelreferanser, dokumenterte case og uttrykkelige tolkningsgrenser.
- [ ] Velg rettighetsklarerte motiver, lag separate stående/front- og brede bildefiler, og kontroller hvert utsnitt visuelt.
- [ ] Materialiser registry og Place-open med repoets gjeldende generatorer; kjør deres `--check`.

### Task 3: Fullquiz, QuizCards og Knowledge

**Files:** Eksisterende `data/quiz/litteratur/eldorado_bokhandel_sets_merged.json`, fem nye stedsspesifikke quizfiler etter kildebekreftet profil, eksisterende kategorimanifester og QuizCard-samlinger.

- [ ] Review alle Eldorados 30 eksisterende spørsmål og eksisterende QuizCard; bevar gode spørsmål og rett dokumenterte svakheter/profilavvik.
- [ ] Produser de fem andre fullquizene fra faktisk claim-bank, med plausible distraktorer og kilde per fasit/forklaring.
- [ ] Velg minst ti konkrete, forskjellige faktaspørsmål per sted og kontroller nøyaktig paritet i QuizCard.
- [ ] Regenerer Knowledge og relevante manifester; kjør determinismekontroll, kontekst-, progresjons- og teoribinding-audit.

### Task 4: Appvisning og closeout

- [ ] Test alle seks på mobil og desktop: PlaceCard, begge foto, faktisk flip, QuizCard-svar, fullquiz og Fagverk-lenker.
- [ ] Gjennomgå samtlige testbilder og løs funn; ikke erstatt visuell vurdering med grønn CI.
- [ ] Kjør relevante kontroller samlet og ordinær PR-CI på siste head.
- [ ] Dokumenter seks kvalitetsdimensjoner med konkret evidens; klassifiser bare v1 når minst 27/30 og alle dimensjoner minst 4/5 faktisk er oppnådd.
