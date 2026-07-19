# Oslo kommune / Kulturetaten — kultureiendommer source completeness closure

Dato: 2026-07-19

## Formål

Denne rapporten lukker Oslo kommune / Kulturetatens kultureiendommer som et avgrenset source-level completeness-spor i History Go.

Arbeidet ble startet etter Atlas Obscura Oslo-gjennomgangen og gjennomført som en serie små, kilde- og koordinatkontrollerte batcher. Den avsluttende batchen, PR #2432, beskriver eksplisitt Bånkall gård og Frysja 33 / Brekke kraftstasjon som de to siste uavklarte kandidatene fra completeness-passet og integrerer begge.

Denne closuren oppretter ingen nye steder. Den dokumenterer den ferdige baselinen og representasjonsreglene som skal brukes ved senere delta-audits.

## Hovedforløp

### Første kultureiendommer-batch

PR #2327 — `Add Folkeobservatoriet and Kjeglebanen from Oslo cultural properties audit`

Integrerte blant annet:

- Folkeobservatoriet
- Kjeglebanen på Langgaardsløkken

Batchen etablerte samme strenge koordinatprinsipp som senere arbeid: konkrete adresser kjøres gjennom den normative address-first-finneren og terminalresultater lagres som evidens.

### Historiske bygårder og institusjoner

PR #2330 — `Add Rådmannsgården and Magistratgården from Oslo cultural properties audit`

Viktig representasjonsbeslutning:

- Rådmannsgården og Anatomibygget behandles som ett canonical sted fordi Oslo kommune behandler dem som én kultureiendom og de deler samme fysiske adresseanker.
- Magistratgården er en separat fysisk eiendom og får eget canonical sted.

### Kultur-, forsamlings- og transformasjonssteder

PR #2332 — `Add Hauges Minde and Slurpen from Oslo cultural properties audit`

PR #2335 — `Add Geitmyra gård Grønland politistasjon and Tøyen trafo from Oslo cultural properties audit`

PR #2338 — `Add four more Oslo cultural properties from completeness audit`

Disse batchene utvidet dekningen med fysisk distinkte steder, blant annet:

- Hauges Minde
- Slurpen
- Geitmyra gård
- Grønland politistasjon
- Tøyen trafo
- Hønse-Lovisas hus
- Sagene festivitetshus
- Etterstadgata 6
- Villa Furulund

Representasjonen skiller konsekvent mellom faktisk bygningshistorie og senere kulturell bruk. Fiktive eller litterære forbindelser behandles som formidlingslag, ikke som historisk-biografiske fakta.

### Villaer, kunstnersteder og større eiendomsmiljøer

PR #2342 — `Add Villa Romsli from Oslo cultural properties audit`

PR #2343 — `Add Stubljan pavilion in Hvervenbukta from Oslo cultural properties audit`

PR #2347 — `Add Trosterudvillaen from Oslo cultural properties audit`

Viktige beslutninger:

- Villa Romsli representeres som det konkrete stående stedet med både eldre sosialhistorie og nåværende kunstbruk.
- Hvervenbukta/Stubljan representeres med den bevarte strandpaviljongen som presist fysisk anker, mens den tapte hovedgården og det større historiske landskapet beskrives som historiske lag.
- Trosterudvillaen holdes fysisk og semantisk separat fra det bredere `trosterud_friomrade`.

### Frysja-ambiguity ble dokumentert, ikke gjettet

PR #2349 — `Document Frysja 33 coordinate ambiguity`

Denne auditen opprettet ikke et sted fordi kildene på det tidspunktet ikke kunne skille sikkert mellom Geonorge-punktene 151B og 151C.

Det var korrekt å utsette integrasjonen framfor å velge et vilkårlig adressepunkt.

### Stor verifisert adressebatch

PR #2357 — `Add seven Oslo cultural-property places`

Integrerte:

- Sporveismuseet
- Saxegården
- Øvre Fossum gård
- Lambertseter gård
- Nordre Skøyen hovedgård
- Lokomotivverkstedet
- Tveten gård

Alle integrerte records hadde konkrete offisielle adresser og entydige address-first-resultater.

Bånkall gård ble bevisst ikke tatt inn i denne batchen fordi Trondheimsveien 640 ga flere ikke-entydige bokstavtreff. Ingen kandidat ble valgt vilkårlig.

### Minneparken

PR #2414 — `Add Minneparken as distinct medieval ruin park`

Minneparken ble representert som ett selvstendig canonical ruin- og parkområde med et dokumentert arealanker.

Ruinene og de historiske kirkestedene inne i parken beholdes som historiske lag i stedet for flere overlappende canonical markører.

### Wegnerpaviljongen

PR #2427 — `Add Wegner pavilion Wonderkammer treasure`

Wegnerpaviljongen er et lite, fysisk oppdagbart objekt inne i det allerede representerte Frognerparken/Vigelandsparken-komplekset.

Den ble derfor korrekt modellert som Wonderkammer `actual_site_treasure` under `vigelandsparken`, uten en ny overlappende kartmarkør.

### De to siste uavklarte kandidatene

PR #2432 — `Add remaining Oslo cultural properties batch 13`

PR-en beskriver eksplisitt disse som de to siste uavklarte kandidatene fra kultureiendommer-completeness-passet:

#### Bånkall gård

- representeres som det bevarte historiske gårdsanlegget;
- ikke som en tilfeldig enkeltbygning;
- ikke som det bredere boligområdet;
- tidligere tvetydige bokstavaddresser ble forkastet;
- et dokumentert historisk `area_anchor` for gårdseiendommen gnr. 98/1 ble brukt i stedet.

#### Frysja 33 / Brekke kraftstasjon

- holdes separat fra det bredere `frysja_industriomrade`;
- den tidligere 151B/151C-ambiguityen ble først utsatt;
- senere adressehistorisk dokumentasjon identifiserte 151C som Brekke kraftstasjon / Frysja 33;
- det eksisterende offisielle Geonorge-punktet for Kjelsåsveien 151C ble deretter brukt.

## Låste representasjonsprinsipper

### 1. Adresse først når stedet faktisk er adressebart

Et konkret bygg med en dokumentert besøksadresse skal gå gjennom repoets normative address-first-flyt. Ett entydig resultat kan brukes; tvetydige treff skal ikke avgjøres ved gjetning.

### 2. Områder og historiske anlegg trenger semantisk riktig geometri

En gård, park eller større kultureiendom skal ikke presses inn på et tilfeldig adressepunkt dersom det punktet ikke representerer stedet som helhet.

Dokumenterte `area_anchor`- eller navngitte arealgeometrier kan brukes når de faktisk representerer den fysiske destinasjonen.

### 3. Stående parent foran duplikatmarkør

Små bygninger, objekter eller detaljer inne i et allerede robust representert sted kan ligge som Wonderkammer-lag når en ny canonical markør ville skape overlapp uten å tilføre en selvstendig stedsidentitet.

Wegnerpaviljongen er det tydeligste eksempelet i dette source-passet.

### 4. Historiske lag er ikke automatisk egne steder

Et forsvunnet bygg, tidligere bruk eller ruin inne i et tydelig eksisterende område skal behandles som historisk lag når dette gir en mer fysisk korrekt modell.

### 5. Ambiguity skal kunne ende i utsettelse

Frysja 33 og Bånkall viser at `needs_review` er et legitimt resultat. En candidate skal ikke integreres før identiteten eller geometrien kan dokumenteres godt nok.

## Sluttstatus

Oslo kommune / Kulturetatens kultureiendommer-completeness-pass kan etter PR #2432 behandles som lukket for den gjennomgåtte kildeversjonen.

Den avsluttende batchen løste eksplisitt de to gjenværende uavklarte kandidatene, Bånkall gård og Frysja 33 / Brekke kraftstasjon.

Per denne closuren finnes det derfor ingen kjent kandidat fra dette avgrensede completeness-passet som fortsatt står som en ubehandlet fysisk place-gap-sak.

Senere endringer i Oslo kommunes kultureiendommer skal behandles som delta-audits mot denne baselinen, ikke ved å starte hele passet på nytt.
