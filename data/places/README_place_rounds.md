# History GO — canonical PlaceCard-rundinger

Status: **eneste autoritative rundingskontrakt**  
Eier: `place_rounds_contract`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-07-28**

Denne filen er det eneste dokumentet som bestemmer **hva som er en PlaceCard-runding, hvor mange rundinger et sted har og hvilke rundinger som brukes**. Andre dokumenter og schemaer skal peke hit og skal ikke vedlikeholde egne rundingslister.

> **Rundingen er en visuell inngang. Previewet er for syns skyld og skal aldri filtrere eller redefinere innholdet bak.**

## 1. Fast regel: alltid fire

Et PlaceCard viser **alltid nøyaktig fire rundinger** i et 2 × 2-felt.

Det finnes ikke en 6-, 9- eller 12-rundersvariant.

## 2. Vanlige steder

Vanlige steder bruker dette faste settet:

```text
badges · people · objects · brands
```

- `badges` = Merker;
- `people` = People;
- `objects` = Gjenstander;
- `brands` = bedrifter/kjente merker med dokumentert stedskobling.

## 3. Natursteder

Canonical natursteder bruker dette faste settet:

```text
badges · map · flora · fauna
```

På natursteder erstatter **Flora** og **Fauna** People og Gjenstander. Natursteder bruker derfor ikke `people` eller `objects` som PlaceCard-rundinger.

### Kart på natursteder

`map` er et **eget turkart eller detaljert stedskart** for naturstedet.

Kartet skal være mer detaljert enn History GOs generelle hovedkart og skal, når relevant og kildegrunnlaget tillater det, vise stedsspesifikke naturelementer som for eksempel:

- stier, turtraséer og innfallsporter;
- vann, bekker, våtmark eller strandsoner;
- terreng/topografi og tydelige landskapsformer;
- vernegrenser eller naturtypeflater;
- utsiktspunkter, observasjonssoner eller andre dokumenterte naturpunkter;
- andre relevante naturelementer som faktisk hører til stedet.

**Et generisk hovedkart som bare zoomes inn på place-koordinaten oppfyller ikke kart-rundingen.** Runtime skal ikke bruke dette som fallback.

Artsmappingen som eies av `README/nature_mapping_workflow.md` og `js/nature_place_map_bridge.js` er kilde for Flora/Fauna-koblinger. Den er **ikke** i seg selv et turkart eller detaljkart.

## 4. Hele canonical rundingspoolen

```text
badges
people
objects
brands
map
flora
fauna
```

`map`, `flora` og `fauna` er naturspesifikke rundinger.

Følgende er uttrykkelig **ikke** rundinger:

- `nature`;
- `works` / Verk;
- `details` / Detaljer;
- `spots` / Punkter;
- Civication;
- Før/nå;
- Fortellinger/Stories;
- Leksikon;
- Lek;
- Trening;
- Oppgaver;
- Events;
- Quiz;
- Observer;
- Notat;
- Rute;
- Wonderkammer.

## 5. People er en inngang, ikke et filter

People-rundingen viser ett representativt portrett i sirkelen. Previewet bestemmer **ikke** hvem som finnes bak rundingen.

- alle canonical personer med gyldig stedstilknytning skal fortsatt kunne vises i People-popupen;
- ikke bruk `people_ids`, lokal kuratering eller previewvalg til å snevre inn People-popupen;
- en eventuell produktbeslutning om et redaksjonelt avgrenset People-sett må tas separat.

### Verk ligger under personen

Personens verk hører i personprofilen/People-popupen, for eksempel bibliografi, filmografi, diskografi, komposisjoner, roller eller arkitekturverk.

`works` er ikke PlaceCard-runding.

## 6. Gjenstander

`objects` er fysiske, identifiserbare ting med dokumentert stedstilknytning, blant annet artefakter, funn, maskiner, instrumenter, dokumentobjekter, museumsgjenstander, billedkunst, skulpturer, statuer og installasjoner.

Et fysisk kunstverk er **Gjenstand**, ikke Verk-runding.

Canonical felt for ny/revidert produksjon er `place.objects`. Legacy `artifacts` og fysisk kvalifiserte Civication-elementer kan leses som compatibility-kilder uten at Civication blir en runding.

## 7. Brands

Brands betyr **bedrifter og kjente merker med dokumentert stedskobling**. Det er ikke en generell aktørkategori.

- gjenbruk canonical Brand;
- bruk korrekt logo/brandbilde;
- ikke legg klubber, institusjoner, personer, skilt eller andre objekter i Brands for å fylle innhold.

## 8. Flora og Fauna

Flora/Fauna skal bruke eksisterende canonical naturarter og place-level naturmapping. Ikke opprett et parallelt artsregister i PlaceCard.

Sensitive arter eller lokaliteter skal ikke få presis kartplassering bare for å fylle kart- eller artsflaten.

## 9. Detaljer og Punkter er steddata, ikke rundinger

Eksisterende strukturer som `place.details`, `visual_details`, `site_details`, `place.spots`, `subplaces` eller `subPlaces` kan fortsatt være nyttige steddata. De er **ikke PlaceCard-rundinger**.

Denne kontrakten flytter dem ikke automatisk til en annen UI-flate.

## 10. Events og forestillinger

En forestilling, teateroppsetning, konsert, visning eller annen tidsbundet produksjon ved stedet er et **Event** og hører under **Events i På stedet-baren**.

Historiske forestillinger kan i tillegg omtales i Historie/Stories når de er dokumenterte historiske episoder. Event-identiteten endres ikke av dette.

## 11. Legacy `rounds`

`place.rounds`, `rundinger` og `rounds_exclude` er legacy presentasjonsgjeld. Nye/reviderte steder skal ikke bruke disse feltene til å finne opp egne rundingssett.

Runtime bruker de to faste profilene i denne kontrakten:

```text
vanlig: badges · people · objects · brands
natur:  badges · map · flora · fauna
```

Gamle round-ID-er skal ikke få gjenoppstå som canonical typer via aliaser eller fallback.

## 12. Produksjonsgate

Et sted er rundingsklart når:

1. PlaceCard viser nøyaktig fire rundinger;
2. rundingssettet er den faste profilen for vanlig sted eller natursted;
3. previewene er reelle og egnede;
4. People-preview filtrerer ikke People-popupen;
5. naturstedets kart er et faktisk tur-/detaljkart og ikke generisk hovedkart-zoom;
6. Flora/Fauna bruker canonical naturdata;
7. relevante rundings-/datagater passerer.
