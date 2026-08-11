# Torggata – fase 4 kategori, Badges, emner og Fagverk

- Dato: 2026-08-11
- Place ID: `torggata`
- Fase: 4 – Kategori, Badges, underbadges, emner og Fagverk
- Baseline ved oppstart: `9257aaa3de313500270cdbe510ab46c415361e7b`
- Styrende kontrakter: `docs/PLACE_PRODUCTION_CHECKLIST.md`, `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`, `data/categories/category_contract.json`, `docs/FAGVERK_NAVIGATION.md`
- Status: **KLAR FOR REVIEW – runtime-regresjon rettet, CI/merge/main-kontroll gjenstår**

## 1. Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: Ingen tidligere PR funnet som godkjenner Torggata fase 4 etter dagens place-checklist
SISTE GODKJENTE TILSTAND: Eksisterende category=by, em_by_gentrifisering_eiendom, em_by_styring_forvaltning_planmakt og Badges-runding
KONKRET REGRESJONSEVIDENS: Ikke en tidligere fase-4-regresjon; dagens runtime har derimot en generell Politikk-hardkoding på fagverk-sted.html som gjør ikke-Politikk-steders side feil
BESLUTNING: REELT NYTT AUDITARBEID – behold fagdata når de består, rett kun konkret runtimefeil
```

Tidligere Torggata-PR-er dokumenterer flere andre subsystemer, men ingen senere PR ble funnet som har kjørt og godkjent akkurat fase 4 etter den nåværende `PLACE_PRODUCTION_CHECKLIST.md`. Eksisterende fagkoblinger behandles derfor som arvet data som må auditeres, ikke som automatisk ferdig arbeid.

## 2. Primærkategori

Canonical `category` er `by`.

Dette **beholdes**.

Begrunnelse:

- `by` finnes som canonical runtime- og fag-ID i `data/categories/category_contract.json`;
- kontraktens label er `By & arkitektur`;
- Torggata-place er selve gaten som byrom og transformert sentrumsgate, ikke ett enkelt kultursted, én virksomhet eller én politisk institusjon;
- den dokumenterte kildebasen dekker gateutvikling, offentlig-rom-ombygging, mobilitet, handel, kommersiell transformasjon og plan-/aktørprosesser.

Det opprettes ingen duplikat-place i andre kategorier for å uttrykke tverrfaglighet.

## 3. Emne-audit

### `em_by_gentrifisering_eiendom` – BEHOLD

Koblingen har konkret stedlig evidens i `torggata-source-base-v1.md`:

- S9, den fagfellevurderte studien *The directors of urban transformation*, omtaler Torggata som et delvis gentrifisert case;
- claim `torg_change_001` dokumenterer samspill mellom kommune og stor eiendomsaktør i fysisk og kommersiell transformasjon;
- claim `torg_change_002` dokumenterer strategisk tenant-miks og høyere leie-/eiendomsverdier som eksplisitte mål/virkemidler hos den analyserte aktøren;
- claim `torg_change_003` låser inferensgrensen: Torggata kan brukes som gentrifiserings-/kommersialiseringscase, men ikke beskrives som fullstendig gentrifisert eller med udokumentert total fortrengning.

Emnet er derfor relevant når det brukes med denne avgrensningen.

### `em_by_styring_forvaltning_planmakt` – BEHOLD MED AVGRENSNING

Koblingen støttes av konkrete stedsprosesser:

- kildebasens S8 dokumenterer gateopprustningen som stod ferdig i 2014 og et prosjektgrunnlag som undersøker planprosess og aktører;
- S9 analyserer offentlig/private aktører i Torggatas transformasjon;
- gateutformingen og prioriteringen av gående/syklende er fysisk observerbare resultater av styring av offentlig gateareal.

Koblingen skal ikke brukes til å hevde udokumentert enkel kausalitet, at kommunen alene skapte den sosiale transformasjonen, eller at alle markedsendringer følger direkte av gateombyggingen.

Begge ID-ene finnes i det canonicale By-systemet og i `fagverk_registry`, med `subject: by`.

## 4. Underbadges

Torggata har ingen `underbadge_ids` i canonical place-recorden.

**Beslutning: ikke legg til underbadge bare for å fylle feltet.** Fase 4 krever at underbadges vurderes, ikke at alle steder må ha dem. Primærkategori og de to stedsspesifikke `em_by_*`-koblingene gir allerede en eksplisitt faglig vei.

## 5. Badges og Fagverk-routing

- `badges` finnes i Torggatas place-rundinger;
- canonical stedssiderute er `fagverk-sted.html?place=torggata`;
- By er `materialized` i `data/fagverk/fagverk_portal.json`;
- By-merket peker til `data/fag/by/merke_by.html`;
- By-faget peker til `fagverk.html?subject=by`;
- `fagverk-sted.js` løser canonical place via `DataHub.loadFullPlace`, leser place-emnene fra registry og faller tilbake til `subject=by` for kategori `by`.

## 6. Blokkerende runtimefunn

Fase-4-auditen fant et faktisk kontraktbrudd i den generiske stedssiden:

1. `fagverk-sted.html` hadde hardkodede lenker til Politikkforsiden og `fagverk.html?subject=politikk`, samt teksten «Politikkmerke og undermerker».
2. `fagverk-place-canonical-integration.js` kjørte Politikk-spesifikk modell for alle place-ID-er.
3. For Torggata finner `HGPolitikkFagModel` ingen `em_by_*` i Politikk-emneregisteret. Politikk-overlaget kunne dermed overskrive den korrekte generiske By-renderingen med tomme kapitler, begreper og emner.

Dette betyr at den generiske URL-en alene ikke oppfylte checklistens stoppgate for Torggata.

## 7. Rettelse i denne fasen

Runtimefeilen rettes generelt, ikke med Torggata-spesialkode:

- den statiske stedssiden er gjort fagnøytral og peker til Fagverkforsiden i stedet for Politikk;
- den Politikk-spesifikke canonical-integrasjonen laster først place-recorden;
- den returnerer uten å laste Politikk-core dersom stedet ikke har eksplisitt Politikk-identitet gjennom `category: politikk`, `em_pol_*` eller sekundærbadge `politikk`;
- etter resolver kreves dessuten `model.subject === 'politikk'` før Politikk-overlaget får skrive i DOM-en;
- Torggatas generiske By-rendering blir dermed stående urørt.

Ingen Torggata `category`, `emne_ids`, underbadges, koordinater, tekst, quiz, Story, People, Brands eller Works endres.

## 8. Regresjonsgate

`tests/fagverk-place-pages.test.mjs` er utvidet slik at den krever:

- ingen hardkodet Politikk-navigasjon i den generiske place-siden;
- eksplisitt Politikk-identitetsguard før Politikk-overlaget kjører;
- Torggata beholder `category: by`;
- Torggatas to emne-ID-er eies av `subject: by` i Fagverk-registry;
- `badges` finnes;
- By har materialisert fag- og merkeside i portalregisteret.

## 9. Fasekonklusjon før merge

**Fagdata: PASS.** `category: by` og begge eksisterende `em_by_*` beholdes. Ingen underbadge legges til.

**Runtime på branch: rettet.** Den konkrete Politikk-lekkasjen er fjernet for ikke-Politikk-steder.

**Gjenstår før fase 4 kan settes GODKJENT:** relevante tester/CI, merge, og kontroll av den faktiske mergede `main`-tilstanden. Dersom dette passerer, skal fase 4 lukkes uten ytterligere fagdataendringer.
