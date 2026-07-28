# History GO — canonical PlaceCard-rundinger

Status: **canonical produksjons- og presentasjonskontrakt**  
Eier: `place_rounds_contract`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-07-29**

Denne filen er **eneste autoritative oppskrift for PlaceCard-rundinger**. Andre dokumenter kan peke hit, men skal ikke vedlikeholde egne rundingspaletter, antallsregler eller prioriteringsmatriser.

> **Rundinger er fire faste innganger. Stedspopupen viser kunnskap. På stedet viser hva som skjer eller kan gjøres der.**

## 1. Alltid fire

Et PlaceCard viser **alltid nøyaktig fire rundinger i et 2 × 2-felt**.

Det finnes ikke:

- 6-rundersvariant;
- 9-rundersvariant;
- kategoriavhengig antall;
- automatisk utfylling med tilfeldige samlinger;
- per-sted prioriteringsmatrise som bestemmer antallet.

Previewbildet i en runding er bare presentasjon. Det skal **aldri filtrere eller redefinere innholdet bak rundingen**.

## 2. De to canonical profilene

### Vanlige steder

```text
Merker · People · Gjenstander · Brands
```

Canonical IDs:

```text
badges · people · objects · brands
```

**Vanlige steder skal aldri ha Kart-runding.**

### Natursteder

```text
Merker · Flora · Fauna · Kart
```

Canonical IDs:

```text
badges · flora · fauna · map
```

På natursteder erstatter **Flora og Fauna** People og Gjenstander. Natur er ikke en egen runding.

`category: "natur"` bruker naturprofilen. Andre kategorier bruker vanlig profil med mindre en senere eksplisitt canonical produktbeslutning sier noe annet.

## 3. Merker (`badges`)

Merker er fast runding på alle steder.

- hovedkategori kommer fra `place.category`;
- relevante underbadges kan komme fra `underbadge_ids`;
- klikk følger gjeldende Fagverk-navigasjon;
- bruk faktisk badgegrafikk når den finnes.

Detaljert navigasjonsrolle eies av `docs/FAGVERK_NAVIGATION.md`.

## 4. People (`people`)

People brukes på vanlige steder.

- bruk canonical People-records;
- stedstilknytningen skal være dokumentert etter People of Places-kontrakten;
- rundingen kan vise ett representativt portrett;
- portrettet er **ikke et filter**;
- popupen skal fortsatt vise alle canonical personer med gyldig stedstilknytning;
- ikke innfør `people_ids`-filtrering eller annen personkuratering bare for å styre rundingspreviewet.

Følg:

- `docs/people-of-places-method.md`;
- `docs/PEOPLE_PROFILE_CANONICAL.md`;
- `docs/PEOPLE_IMAGES.md`.

### Verk hører under personen

`works` er **ikke en PlaceCard-runding**.

Personens produksjon hører i personprofilen/popupen, for eksempel:

- forfatter → bibliografi;
- filmskaper/skuespiller → filmografi, produksjoner eller roller;
- komponist/musiker → komposisjoner eller diskografi;
- kunstner → kunstnerisk produksjon;
- arkitekt → arkitekturverk/prosjekter.

Legacy `works` i place-data/runtime er compatibility-gjeld og skal ikke brukes i ny produksjon.

## 5. Gjenstander (`objects`)

Gjenstander brukes på vanlige steder og betyr **fysiske, identifiserbare ting med dokumentert stedstilknytning**.

Typiske eksempler:

- artefakt eller arkeologisk funn;
- maskin, kjøretøy eller teknisk utstyr;
- våpen, instrument, drakt, pokal eller produkt;
- dokumentobjekt, relikvie eller museumsgjenstand;
- maleri, skulptur, statue eller installasjon;
- fysisk stedsspesifikk street art.

Fysiske kunstverk er altså **Gjenstander**, ikke en Works-runding.

Canonical place-felt for nye/reviderte elementer er `place.objects`.

Minimum:

```json
{
  "id": "stabil_id",
  "title": "Navn på gjenstanden",
  "image": "bilder/...",
  "description": "Hvorfor gjenstanden hører til stedet"
}
```

Legacy `place.artifacts` og fysisk kvalifiserte Civication-elementer kan leses som compatibility-kilder, men skal ikke bli ny standard.

## 6. Brands (`brands`)

Brands brukes på vanlige steder.

Brands betyr fortsatt bare **bedrifter og kjente merker med dokumentert stedskobling**.

- gjenbruk eksisterende canonical Brand;
- eksisterende Brands-data er source of truth;
- bruk korrekt logo/brandbilde;
- Brands er ikke restkategori for organisasjoner, personer, klubber, skilt eller gjenstander;
- ikke opprett et Brand bare for å fylle rundingen.

Hvis et vanlig sted mangler reell Brand-kobling, er det et **datadekningsproblem**, ikke en invitasjon til å finne på en femte rundingstype. Produktprofilen er fortsatt fire faste rundinger.

## 7. Flora (`flora`)

Flora brukes bare på natursteder.

- bruk canonical flora-ID-er fra det eksisterende natursystemet;
- vis planter/trær/andre floraentiteter som faktisk er dokumentert eller mappet til stedet;
- previewbildet er bare representativt;
- Flora og Fauna skal aldri slås sammen til en generell Nature-runding.

Produksjon og mapping følger `README/nature_mapping_workflow.md`.

## 8. Fauna (`fauna`)

Fauna brukes bare på natursteder.

- bruk canonical fauna-ID-er fra det eksisterende natursystemet;
- vis dyr/fugler/insekter/andre faunaentiteter som faktisk er dokumentert eller mappet til stedet;
- previewbildet er bare representativt;
- ikke opprett artsfunn eller koordinater som ikke finnes i en gyldig kilde.

Produksjon og mapping følger `README/nature_mapping_workflow.md`.

## 9. Kart (`map`) — bare natursteder

Kart er en runding **kun på natursteder**.

Kart-rundingen skal **ikke**:

- finnes på vanlige steder;
- bare lukke PlaceCard og vise History GOs vanlige hovedkart;
- være et generisk bykart med høyere zoom;
- late som et turkart uten tur-/naturdata.

Kart-rundingen skal åpne en **egen tur-/naturkartflate for det aktuelle naturstedet**.

### Canonical kartgrunnlag

Naturkartet skal bygges fra åpne, autoritative eller eksplisitt lisensierte kartkilder. Førstevalg for Norge:

1. **Kartverket/Norgeskart topografisk grunnlag** — turvennlig topografi/terreng;
2. **Kartverkets Nasjonale database for turruter** — merkede/skiltede turruter via tilgjengelige kart-API-er;
3. **Miljødirektoratet/Naturbase** — relevante verneområder og naturtypelag;
4. **Artsdatabanken/Artskart** — artsobservasjoner når de er egnede, presise nok og lovlige å vise.

Kartverket er canonical førstepartskilde for selve tur-/terrengkartet. UT kan brukes som research-/kvalitetsreferanse, men History GO skal ikke kopiere eller embedde UIs eller kartlag uten eksplisitt tillatelse. Kartverkets turrutedata brukes direkte fra eierkilden.

MapAnt skal ikke være canonical kartkilde så lenge lisensgrunnlaget ikke er klart for vår bruk.

### Minstekrav til naturkart

Et naturkart skal, når data finnes, kunne vise:

- stier og merkede turruter;
- terreng/høyde/topografi;
- vann, elver og andre sentrale landskapselementer;
- stedets relevante delområder eller turmål;
- verneområde/naturtype som valgfrie faglag;
- flora-/faunaobservasjoner som valgfrie faglag når kildene støtter presis visning.

Ingen kartmarkør eller artskoordinat skal opprettes ved gjetting.

Kildekreditering og lisenskrav skal vises etter den enkelte datakildens vilkår.

## 10. Dette er ikke rundinger

Følgende skal ikke brukes som canonical PlaceCard-rundinger:

```text
works
details
spots
nature
map på vanlige steder
civication
wonderkammer
stories / fortellinger
før_nå
leksikon
play
training
tasks
quiz
nyheter
statistikk
chronology
historiske events
```

`details`, `spots`, `subplaces`, `nature_profile` og tilsvarende kan fortsatt være gyldige place-/popupdata. At data finnes betyr ikke at de er en runding.

## 11. Forestillinger, oppsetninger og andre tidsbundne produksjoner

En forestilling, teateroppsetning, konsert, visning eller annen tidsbundet produksjon ved stedet er et **Event**.

Den skal ligge under **Events i «På stedet»-baren** og skal ikke flyttes til People, Gjenstander eller en Works-runding.

En historisk forestilling kan i tillegg omtales i Historie eller Stories når den har selvstendig historisk/narrativ verdi. Selve event-objektet er fortsatt et Event.

## 12. Legacy-felt og gammel runtime

`place.rounds`, `place.rundinger`, `rounds_exclude`, gamle 4/6-profiler, gamle 9-rundersprofiler og gamle rundingsprioritetsmatriser er **legacy/compatibility**.

De skal ikke brukes til å bestemme ny canonical presentasjon.

Aktiv runtime skal avlede profilen slik:

```text
category === "natur"
  → badges · flora · fauna · map
ellers
  → badges · people · objects · brands
```

Gamle DOM-elementer eller data kan beholdes midlertidig for andre flater under migrering, men de skal ikke kunne opptre som aktive canonical rundinger.

## 13. Produksjonsgate

Rundingsflaten er ferdig når:

1. PlaceCard viser nøyaktig fire rundinger i 2 × 2;
2. riktig profil brukes for vanlig sted eller natursted;
3. vanlige steder aldri viser Kart;
4. natursteder viser Flora og Fauna separat og ikke Nature;
5. naturstedets Kart åpner dedikert tur-/naturkart, ikke hovedkartet;
6. People-preview filtrerer ikke People-popupen;
7. fysiske kunstverk behandles som Gjenstander;
8. tidsbundne forestillinger/oppsetninger behandles som Events i På stedet;
9. gamle Works/Details/Spots/Nature/6-/9-rundersregler kan ikke påvirke aktiv rundingsflate;
10. relevante tester og governance passerer.

For full stedproduksjon brukes `docs/PLACE_PRODUCTION_CHECKLIST.md`, som skal **peke til denne filen og ikke duplisere rundingsreglene**.
