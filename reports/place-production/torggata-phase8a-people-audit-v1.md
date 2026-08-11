# Torggata – fase 8A People audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Canonical place: `data/places/by/oslo/places/torggata.json`
- People-metode: `docs/people-of-places-method.md`
- People-profil: `docs/PEOPLE_PROFILE_CANONICAL.md`
- People-bilder: `docs/PEOPLE_IMAGES.md`
- Fase-8-audit: `reports/place-production/torggata-phase8-rounds-audit-v1.md`
- Baseline: PR #4829 / merge `3ee217c8427ede7bdf3273b55adc53f71ad08763`
- Status: **AUDIT FERDIG – 8A er ikke samlet godkjent**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
NULLMÅLINGENS GAMLE STATUS: «12 people ved torggata»
DAGENS CANONICAL SØK: 0 aktive People-records med placeId=torggata eller places[] som inneholder torggata
FALSKE TORGGTATA-TREFF: Subkultur-filer peker til det separate stedet torggata_blad og skal ikke blandes inn
BESLUTNING: GAMMEL DEKNINGSTELLING ER UTDATERT – bygg 8A fra dagens manifest/source og dokumenterte personroller
```

## Hvorfor 0 ikke kan godkjennes

People-of-Places-metoden tillater dokumentert 0 når research faktisk viser at et sted mangler relevante personer. Torggata består ikke denne 0-gaten.

Allerede godkjent Torggata-materiale og eksterne kilder dokumenterer direkte:

- grunnlegger/finansiør og byggmester for Torggata bad;
- arkitekter for både Eldorado/Fahlstrøms Theater og den senere badebygningen;
- teaterledere med faktisk drift i Torggata 9;
- en handelsfamilie som Oslo byleksikon eksplisitt fremhever som særpreget for gaten;
- dokumenterte beboere, arbeidende og forfulgte personer ved konkrete Torggata-adresser;
- en boliginspektør og institusjonsgrunnlegger som både bodde i gaten og er minnet med blått skilt.

Torggata skal derfor ha People-runding med reelle canonical personkoblinger. Det skal ikke fylles til et bestemt antall; de ulike vesentlige rollene bestemmer omfanget.

## Dagens canonical gjenbrukskandidater

Repo-søk viser eksisterende canonical profiler som skal **gjenbrukes**, ikke dupliseres:

| Person | Canonical status | Torggata-anker | Beslutning |
| --- | --- | --- | --- |
| `thorvald_meyer` | finnes i `data/people/historie/oslo/people_historie_oslo.json` | lot Torggata bad oppføre i 1861 og gav anlegget til kommunen i 1862 | **8A1 – legg til Torggata som sekundærkobling** |
| `henrik_bull` | finnes i `data/people/by/oslo/people_by_oslo.json` | tegnet ombyggingen til Fahlstrøms Theater i Torggata 9 | **8A1 – legg til Torggata** |
| `christian_morgenstierne` | split record i `data/people/by/oslo/folketeateret/christian_morgenstierne.json` | arkitektfirmaet Morgenstierne & Eide tegnet dagens Torggata bad | **8A1 – legg til Torggata** |
| `arne_eide` | split record i `data/people/by/oslo/folketeateret/arne_eide.json` | samme Torggata bad-oppdrag | **8A1 – legg til Torggata** |
| `wulff_becker` | finnes i `data/people/historie/oslo/jodisk_historie/wulff_becker.json` | bodde og hadde legekontor i Torggata 17b; snublestein ved stedet | **8A3 – legg til Torggata** |

Disse profilene skal ikke vesentlig omskrives bare for å legge til ett nytt sted. Torggata-koblingen dokumenteres i den aktuelle recorden når schemaet tillater det og i 8A-auditen.

## Nye profiler som Torggata-materialet krever

Repo-søk fant ingen eksisterende canonical People-record for personene nedenfor. De skal derfor opprettes som nye profiler **bare etter egen duplikat-/kildekontroll i produksjonsbatchen**.

### 8A1 – byggere, arkitekter og teaterledere

| Person | Dokumentert rolle ved Torggata | Primær evidens |
| --- | --- | --- |
| Thøger Binneballe | murmester som oppførte Bade- og Vadskeanstalten i Torggata 16 for Thorvald Meyer i 1861 | Oslo byleksikon – Torggata bad |
| Harald Olsen | arkitekt for Eldorado varietéteater i Torggata 9 | Oslo byleksikon – Eldorado; SNL identifiserer Olsen som arkitekt/ingeniør/murmester |
| Alma Fahlstrøm | drev Fahlstrøms Theater i Torggata 9; iscenesatte de fleste oppsetningene | Oslo byleksikon – Fahlstrøms Theater |
| Johan Fahlstrøm | drev Fahlstrøms Theater i Torggata 9; spilte hovedroller og tegnet dekorasjoner/kostymer | Oslo byleksikon – Fahlstrøms Theater |

Sammen med de fire eksisterende profilene over gir dette én komplett hovedgruppe for Torggatas to viktigste institusjonsbygg: Eldorado/Fahlstrøms Theater og Torggata bad.

### 8A2 – Jensen-familiens gatehandel

Oslo byleksikon beskriver det som **spesielt for Torggata** at én familie hadde fire forretninger i gaten. Dette er derfor ikke en tilfeldig butikkatalog, men en selvstendig stedshistorisk People-klynge.

Nye profiler:

1. Ludvig Christian Jensen (1834–1910) – delikatesseforretning i nr. 5a fra 1873; bodde også i nr. 5 i 1873–88.
2. Adelsten Jensen (1866–1916) – herre- og barneekvipering i nr. 1 fra 1893.
3. Peter Marinius Jensen (1860–1939) – P. M. Jensen, kjøttvare- og delikatessebutikk i nr. 5b fra 1896.
4. Karl A. Jensen (1861–1917) – vilt- og lakseforretning i nr. 7 fra 1914.
5. Thorvald Jensen (1870–1916) – kompanjong i farens firma.

Disse produseres samlet i **8A2**, slik at familieforhold, virksomhetsroller og adresser kan kontrolleres konsekvent.

### 8A3 – dokumenterte beboere, arbeidende og minnespor

Dette er ikke en generell «alle som har bodd i gaten»-liste. Kandidatene beholdes fordi koblingen er både fysisk presis og historisk betydningsfull eller offentlig minnet.

| Person | Torggata-anker | Hvorfor People-relevant |
| --- | --- | --- |
| Nanna Broch | bodde i 2. etasje i Østkantutstillingens bygning, Torggata 51; blått skilt | boliginspektør, grunnlegger av Østkantutstillingen og offentlig minne ved stedet |
| Wulff Becker | bodde og hadde legekontor i Torggata 17b; snublestein | arbeid + bosted + fysisk minnespor |
| Martin Heinz Zilsel | lå i dekning i Torggata 17b i oktober 1942; snublestein | konkret historisk episode og fysisk minnespor |
| Alexander Claes | drev dame- og herrefrisersalong i Torggata 18; deportert og drept | konkret arbeidssted og krigshistorie |
| Therese Hurwitz | bodde i Torggata 36 med barna; snublestein | dokumentert bosted og fysisk minnespor |
| Jenny Hurwitz | bodde med moren i Torggata 36; snublestein | dokumentert bosted og fysisk minnespor |
| Fredrik Hurwitz | bodde med moren i Torggata 36; snublestein | dokumentert bosted og fysisk minnespor |
| Moritz Glott | grunnla tobakksfabrikken som lå i Torggata 33 fra 1913 | stor dokumentert arbeids-/industrivirksomhet i gaten |

Wulff Becker gjenbrukes fra eksisterende canonical profil. De øvrige produseres bare dersom nytt repo-søk ved batchstart fortsatt bekrefter at de ikke allerede finnes.

## Bevisste holdbacks

Følgende navn er dokumentert i gatehistorien, men tas **ikke automatisk** inn i People-rundingen nå:

- Thorleif, William og Reidar Glott: dokumentert som medledere av fabrikken på 1930-tallet, men Moritz Glott er foreløpig hovedanker; sønnene vurderes bare hvis selvstendig betydning/source tilsier egne profiler.
- Per August, Carl Johan og Gustaf Adolf Beckman: fasade-/firmahistorikk i nr. 36, men People-rundingen skal ikke bli et register over alle firmaeiere; firma-/fasadesporet vurderes også mot Brands/Structures.
- Ingwald Nielsen: Torggata-artikkelen beskriver først og fremst firmaet/forretningen; et personnavn i foretaksidentiteten er ikke tilstrekkelig til å anta personlig stedsrolle uten egen biografisk evidens.
- Carl Michalsen, Harald Aars, Harald Petersen, K. H./H. N. Biong, O. Øvergaard og Henrik Nissen: dokumenterte arkitekter for enkeltgårder, men 8A prioriterer personer som driver de place-definerende narrativene eller har offentlig minne/arbeid/bosted av særskilt betydning. Disse kan gjenåpnes dersom 8D Structures gjør det nødvendig.
- tilfeldige artister som har opptrådt på Rockefeller/John Dee: én opptreden er ikke nok; venuebesøk skal ikke blåse People-listen opp uten varig dokumentert Torggata-relevans.

Holdback er ikke permanent avslag. Det er en eksplisitt grense mot å gjøre People-rundingen til adressebok.

## Kildegrunnlag som allerede er lest

### Torggata bad

Oslo byleksikon dokumenterer at Thorvald Meyer lot murmester Thøger Binneballe oppføre Bade- og Vadskeanstalten i 1861, gav den til kommunen året etter, og at dagens bygning ble oppført 1925–1932 av Morgenstierne og Eide.

### Eldorado / Fahlstrøms Theater

Oslo byleksikon dokumenterer:

- Harald Olsen som arkitekt for Eldorado varietéteater;
- Alma og Johan Fahlstrøm som driftspar ved Fahlstrøms Theater i Torggata 9;
- Henrik Bull som arkitekt for 1903-ombyggingen;
- Alma som iscenesetter for de fleste oppsetningene;
- Johan som hovedrolleinnehaver og designer av dekorasjoner/kostymer.

### Jensen-familien

Oslo byleksikon dokumenterer navn, leveår, adresse og virksomhetsrolle for Ludvig Christian Jensen og sønnene Adelsten, Peter Marinius, Karl A. og Thorvald.

### Krig, arbeid og minne

Oslo byleksikon dokumenterer Torggata-adresse, arbeid/bosted og minnespor for Wulff Becker, Martin Heinz Zilsel, Alexander Claes og familien Hurwitz.

### Nanna Broch og Moritz Glott

Oslo byleksikon dokumenterer:

- Nanna Broch som grunnlegger av Østkantutstillingen, beboer i Torggata 51 og person minnet med blått skilt;
- Moritz Glott som grunnlegger av tobakksfabrikken som lå i Torggata 33 fra 1913.

## Bildepolicy

8A skal ikke blokkere korrekte personkoblinger bare fordi et portrett mangler. People Images-kontrakten tillater placeholder når lisensiert bilde ikke er sikkert funnet.

For nye profiler:

- eventuelle portretter skal komme fra dokumentert Commons/Wikidata-kjede eller annen eksplisitt tillatt kilde;
- lokale `image`/`cardImage`-paths skal ikke diktes;
- eksisterende gode lokale bilder skal ikke overskrives;
- ingen Google Images-URL eller uklar lisens aksepteres.

Bildearbeid kan derfor bli en separat underbatch etter personidentitet og stedslink, dersom GitHub-nettverkspipelinen må brukes.

## Produksjonsrekkefølge for 8A

```text
8A audit
  → 8A1 byggere / arkitekter / teaterledere
  → 8A2 Jensen-handel
  → 8A3 beboere / arbeidende / minnespor
  → 8A closeout + People-runding UI-kontroll
```

Hver batch skal starte fra fersk `main`, søke ID/navnevarianter på nytt, og merge før neste batch.

## Stoppgate

8A kan ikke settes GODKJENT før:

- de fire eksisterende canonical profilene er koblet til Torggata der evidensen bærer det;
- nye nøkkelprofiler er opprettet uten duplikater;
- hver kobling har konkret type/reason og ekstern source i den modellen som eier recorden;
- historiske personer ikke presenteres som nåværende aktører;
- bilder enten er lisensielt trygge eller ærlig mangler;
- `getPeopleForPlace('torggata')` / relevant People-audit faktisk finner den nye canonical samlingen;
- People-rundingen fungerer som reell samling i PlaceCard;
- relevante tests/CI passerer.
