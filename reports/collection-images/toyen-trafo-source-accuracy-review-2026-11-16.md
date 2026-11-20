# Tøyen trafo — arkivkilde og illustrasjonskontroll (16.11.2026)

**Omfang:** To Objects-kandidater i PR #7348. Status **HOLD: kildeoriginalene er ikke visuelt sammenlignet, og kandidatene skal ikke publiseres eller kobles til canonical Objects.**

## 1916 – Apparatpult

- Oppført i Oslo byarkivs katalog som **«Tøyen transformatorstasjon, Apparatpult»**, datert **1916**.
- Katalogreferanse: `A-20138/Ua/0004/054`, eierinstitusjon Oslo byarkiv.
- Kildesøk: https://oslobilder.no/search?query=T%C3%B8yen%20transformatorstasjon
- Forsøk på å åpne originalbildet via `https://oslobilder.no/BAR/A-20138/Ua/0004/054` mislyktes i denne gjennomgangen. **Motivet er derfor ikke fotografisk sammenlignet.**
- I KI-kandidaten vises et enkelt kontrollskap med tre runde instrumenter og håndtak. **Verken form, antall instrumenter, skilt eller rom er bekreftet av arkivfotoet.**
- **Avgjørelse:** behold som *fri illustrasjon av gjenstandstype*, ikke publiser som stedtro portrett av 1916-pulten.

## 1918 – Kjerne for transformatormotor

- Oslo byarkiv katalogiserer dette som **«Tøyen transformatorstasjon, kjerne for transformatormotor 6250 k.v.a.»**, **1918**, `A-20138/Ua/0004/091`, fotograf ukjent.
- Den konkrete katalogens felt **Motiv** sier **«person viser fram motoren»**. Dette er en viktig kildeopplysning: https://oslobilder.no/BAR/A-20138/Ua/0004/091
- Den KI-genererte kandidaten viser en stor, maskinell ringformet kobberkjerne alene, uten personen, og med oppdiktede viklinger, geometri og omgivelser. Motivet er **ikke en fotografisk rekonstruksjon** og teknisk gjenstandslikhet er ikke verifisert.
- **Avgjørelse:** `HOLD_MOTIF_MISMATCH`. Ikke promoter dette til canonical. Neste revidering krever faktisk bildeinspeksjon; katalogtekst alene er ikke nok til å gjette kjernen eller personen.

## Kontekst: to typer kilde

- Oslo byleksikon beskriver stasjonsbygningen i Hovinveien 1 (arkitekt Thorvald Astrup, oppført 1915, i drift fra 1917). https://oslobyleksikon.no/side/T%C3%B8yen_transformatorstasjon
- Oslo Museum har et fotografi av hele bygningen fra **1924**, `OB.Y2599`, fotograf **Anders Beer Wilse**. https://www.oslobilder.no/OMU/OB.Y2599 og https://digitaltmuseum.no/011014874900/toien-transformator
- Dette er relevante kilder for **Structures/stedet**, men kan ikke erstatte dokumentasjonen for **Objects**. Eventuell gjenbruk av et fotografi krever rettighetskontroll for akkurat det filobjektet, ikke en antakelse fra fotografens navn eller generelle samlingsvilkår.

## Aksept før noen av de to bildene publiseres

1. Åpne faktisk arkivfoto (eller innhent historisk referanse fra Oslo byarkiv); noter person/maskin/rom og identifiser eksakt gjenstandstype.
2. Vurder originalfoto med dokumentert lisens og korrekt kreditering som førstevalg dersom bruk tillates. Ellers illustrer kildetro uten oppdiktede påstander.
3. Velg kortbildets utsnitt med faktisk PlaceCard-preview, mobil og desktop. Merk genererte verk «Illustrasjon» og skill opphav til illustrasjon fra kildefoto.
4. Uavhengig visuell/faglig godkjenning og tester. **Pass på binærintegritet er ikke PASS på historisk representasjon.**

Inntil videre forblir `editorialApproval: false` og `publishable: false` for begge kandidater.

## Nye illustrasjonskandidater 18.11.2026 – gjelder ikke den gamle vurderingen over

På brukers uttrykkelige ønske om **illustrasjoner i stedet for nye arkivfotohenvendelser** er to nye originale bildefiler lagt i **de samme upubliserte kandidatbanene** i PR #7348. Tidligere kandidatversjoner fra 16.11 er bevart i Git-historikken. Ingen originale Oslo byarkiv-bildepiksler er kopiert; arkivnumrene er historiske **kontekstreferanser**, ikke en påstand om fotografisk kildeidentitet.

- **Apparatpult, rundt 1916:** historisk inspirert panel med mange målere og brytere i et industrilokale. Paneldesign, antall instrumenter og rommets detaljer er ikke verifisert mot den faktiske Tøyen-pulten. Ny kandidat: 900×520 WebP, SHA-256 `edd5ae1c044cd0766e612f7986d983c03199eb774cd665f55ef8b46c7badf8a5`.
- **Maskinkjerne, rundt 1918:** en **tegnet, oppdiktet tekniker** presenterer en stor lamellert maskinkjerne. Dette tolker katalogens motiv «person viser fram motoren», men gjengir ikke en bekreftet person, maskin eller setting ved Tøyen. Ny kandidat: 900×520 WebP, SHA-256 `16a3485835c77d216f121e1d0d2911a6d10c145b78c9e0a8a5ef582e628916ff`.

Begge bildene har et lite synlig felt **«Illustrasjon»** nederst til høyre. Dette feltet må beholdes i alle visninger. **Redaksjonell port er fortsatt HOLD:** `editorialApproval: false`, `publishable: false`. Ingen canonical Objects-bane, PlaceCard-asset eller produksjonsbilde er endret. Kandidatene kan vurderes **som tydelig fiktive illustrasjoner** uten å late som om de er nøyaktige rekonstruksjoner eller fotografier; før publisering kreves separat kontroll av faktisk PlaceCard-utsnitt/kreditering på mobil/desktop og eksplisitt redaksjonell godkjenning.

## Canonical Tøyen-illustrasjoner (18.11.2026)

Etter uttrykkelig ønske om illustrasjoner fremfor videre arkivfotohenvendelser er **to nye, frie, KI-assisterte svart-hvitt-illustrasjoner** koblet til canonical Tøyen Objects i både stedsdata og Place-open: `bilder/objects/toyen_trafo_apparatpult_1916_illustrasjon.webp` og `bilder/objects/toyen_trafo_transformatorkjerne_1918_illustrasjon.webp` (900×520). Bildene har synlig «Illustrasjon»-merking. Den ene viser en tenkt pult og rom, den andre en fiktiv tekniker og maskinkjerne. **Ingen av detaljene er verifisert mot arkivfotografiene**, som fortsatt ikke er hentet. Arkivnumrene er kildehenvisninger for den dokumenterte gjenstandstypen, ikke opphav til bildepikslene.

Kandidatbanene under `bilder/kort/objects/candidates/` er fortsatt separat upublisert, med `publishable: false` som gjelder *kandidatstiene*. Canonical bildefiler har egen release-oppføring: `reports/collection-images/toyen-trafo-illustration-release-2026-11-18.json`. Verken Foto-kandidatene eller bildefiler fra Oslo byarkiv er publisert. Nettleser-QA, CI og merge er egne kontrollporter; status må ikke hevdes PASS før kjøring er observert.
