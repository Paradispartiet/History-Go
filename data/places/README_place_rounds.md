# History GO — canonical PlaceCard-rundinger

Status: **canonical produksjons- og presentasjonskontrakt**  
Eier: `place_rounds_contract`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-07-28**

Denne filen er **eneste autoritative oppskrift for PlaceCard-rundinger**. Andre dokumenter kan peke hit, men skal ikke vedlikeholde egne rundingspaletter, antallsregler eller prioriteringsmatriser.

## 1. Grunnregel

Et PlaceCard viser **alltid nøyaktig fire rundinger i et 2 × 2-felt**.

Det finnes ikke en 6-rundersvariant, kategoriavhengig antall eller automatisk utvidelse.

### Vanlige steder

```text
Merker · People · Gjenstander · Kart
```

Canonical IDs:

```text
badges · people · objects · map
```

### Natursteder

```text
Merker · Flora · Fauna · Kart
```

Canonical IDs:

```text
badges · flora · fauna · map
```

På natursteder **erstatter Flora og Fauna People og Gjenstander**. `nature` er ikke en egen runding.

`place.rounds`, `place.rundinger`, gamle kategori-profiler og gamle prioriteringsmatriser er legacy/compatibility og skal ikke styre ny produksjon. Canonical rundingssett avledes bare av om stedet er et natursted eller ikke.

## 2. Hva en runding er

Rundinger er små innganger i PlaceCard. De skal ikke bli en ekstra meny for all kunnskap og alle handlinger ved et sted.

Previewet i en runding er presentasjon. Det skal **aldri brukes som filter for innholdet bak rundingen**.

Eksempel: People-rundingen kan vise ett representativt portrett, men popupen skal fortsatt vise alle canonical personer med gyldig stedstilknytning.

`Kart` er den bevisste funksjonelle unntakstypen: den åpner ikke en samlingspopup, men minimerer PlaceCard og viser kartet igjen med det valgte stedet som kartkontekst.

## 3. `badges` — Merker

Merker er fast runding på alle steder.

- hovedkategori kommer fra `place.category`;
- relevante underbadges kan vises fra `underbadge_ids`;
- klikk leder til stedets fagverk/fagflate etter gjeldende navigasjonskontrakt;
- bruk faktisk badgegrafikk når den finnes.

## 4. `people` — People

People brukes på alle ikke-natursteder.

- bruk canonical People-records;
- stedstilknytningen skal være dokumentert etter People of Places-kontrakten;
- rundingens ene preview-portrett er bare visuelt;
- previewet skal ikke begrense People-popupen;
- ikke innfør `people_ids`-filtrering eller annen stedsspesifikk personkuratering som bieffekt av rundingsarbeid.

### Verk hører under personen

`works` er **ikke en PlaceCard-runding**.

Personers verk hører i personprofilen/popupen, for eksempel:

- forfatter → bibliografi;
- filmskaper/skuespiller → filmografi, produksjoner eller roller;
- komponist/musiker → komposisjoner/diskografi;
- kunstner → kunstnerisk produksjon;
- arkitekt → arkitekturverk/prosjekter.

## 5. `objects` — Gjenstander

Gjenstander brukes på alle ikke-natursteder.

Dette er fysiske, identifiserbare ting med dokumentert stedstilknytning, for eksempel:

- artefakter og arkeologiske funn;
- maskiner, kjøretøy, våpen og instrumenter;
- klær, drakter, pokaler og produkter;
- dokumentobjekter, relikvier og museumsgjenstander;
- billedkunstverk;
- skulpturer og statuer;
- installasjoner og offentlig kunst;
- fysisk stedsspesifikk street art.

Canonical dataform er `place.objects` når objektet eies direkte av place-data. Eksisterende canonical objektsystemer skal gjenbrukes der de allerede eier objektet.

## 6. `flora` og `fauna`

Flora og Fauna brukes **bare på natursteder**, som to separate rundinger.

De skal lese eksisterende canonical naturdata og eksisterende stedskoblinger/mappinger. Det skal ikke opprettes en ny parallell flora-/faunamodell for rundingene.

- `flora` viser flora knyttet til stedet;
- `fauna` viser fauna knyttet til stedet;
- hvert rundingspreview kan bruke ett egnet artsbilde;
- previewet filtrerer ikke artslisten bak rundingen;
- klikk på en art skal bruke eksisterende naturkort/naturpopup.

`nature` som samlet PlaceCard-runding er legacy og skal ikke brukes i ny/revidert presentasjon.

## 7. `map` — Kart

Kart er fast runding på **alle** steder.

Kart-rundingen bruker den eksisterende hovedkartflaten. Den skal ikke innføre et eget kartdatasett eller en separat kartmotor.

Ved klikk:

1. behold gjeldende valgte sted/kartkontekst;
2. minimer PlaceCard gjennom eksisterende `collapsePlaceCard()` når funksjonen finnes;
3. vis hovedkartet igjen.

Kart-rundingen er derfor en navigasjonsinngang tilbake til det geografiske stedet.

## 8. Dette er ikke rundinger

Følgende skal **ikke** være canonical PlaceCard-rundinger:

- Works / Verk;
- Details / Detaljer;
- Spots / Punkter;
- Nature / Natur som samlet runding;
- Brands / Aktører;
- Civication;
- Før / nå;
- Fortellinger / Stories;
- Leksikon;
- Lek;
- Trening;
- Oppgaver / Tasks;
- Routes / Rute;
- Observations.

At data ikke er en runding betyr ikke at dataene skal slettes. De skal ligge i riktig eksisterende eierflate.

### Viktige plasseringer

- personers verk → People/personprofil;
- fysiske kunstverk → Gjenstander;
- forestillinger, oppsetninger, konserter og andre arrangementer → **Events i På stedet**;
- historiske hendelser kan i tillegg omtales i Historie/Stories når de har egen narrativ verdi;
- Brands beholdes som eget canonical datasystem der det brukes, men ikke som PlaceCard-runding;
- Detaljer og Punkter kan fortsatt finnes som steddata der de har en annen dokumentert rolle, men de er ikke rundinger.

## 9. Produksjonsgate

Et sted er rundingsmessig korrekt når:

- PlaceCard viser nøyaktig fire rundinger;
- ikke-natursted viser `badges`, `people`, `objects`, `map`;
- natursted viser `badges`, `flora`, `fauna`, `map`;
- ingen legacy-runding lekker inn i 2 × 2-gridet;
- People-preview filtrerer ikke People-popupen;
- Flora/Fauna bruker eksisterende canonical naturkoblinger;
- Kart bruker eksisterende hovedkart og oppretter ingen parallell kartmodell.
