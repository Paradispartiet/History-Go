# Torggata – fase 8B Objects audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Canonical place: `data/places/by/oslo/places/torggata.json`
- Rundingskontrakt: `data/places/README_place_rounds.md`
- Baseline: 8A closeout PR #4843 + workcard PR #4845
- Status: **GODKJENT – canonical Objects materialisert og runtime-verifisert**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
CANONICAL objects[] PÅ FERSK MAIN: manglet
LEGACY COMPATIBILITY-KILDE: fire civication_store-poster
BESLUTNING: RETROFIT – ikke promoter Civication-listen; bygg bare fysisk identifiserbare, kilde- og bildeverifiserte Objects
```

## Kontrakten

Objects er fysiske, identifiserbare gjenstander med dokumentert stedstilknytning. Canonical eier er `place.objects`. En Civication-post kan bare fungere som compatibility-kilde når den faktisk består Objects-kontrakten; Civication er ikke en runding.

Det finnes ingen minimumskvote. Én reell gjenstand er bedre enn flere abstrakte eller dårlig dokumenterte kort.

## Legacy-vurdering

| Legacy-post | Fysisk? | Bilde-/identitetsbevis | 8B-beslutning |
| --- | --- | --- | --- |
| `torggata_gateskilt` | ja i gammel modell | ingen egen verifisert bildeidentitet funnet i preflight | **HOLDBACK** – ikke promoter bare fordi teksten sier `physicalObject: true` |
| `torggata_sykkel_gagate_symbol` | ja i gammel modell | tittelen er generisk og preflight fant ikke et verifisert fotografi av akkurat denne beskrevne markeringen | **ERSTATTET AV KONKRET OBJEKT** – dokumentert Byrute 8-skilt |
| `torggata_serveringssone_markor` | påstått fysisk | «markør» er ikke tilstrekkelig identifisert som én bestemt gjenstand | **HOLDBACK** |
| `torggata_for_na_bildekort` | nei | samlekort, ikke fysisk gateobjekt | **AVVIST SOM OBJECT** |

Legacy-postene beholdes urørt som Civication-historikk i denne fasen; 8E eier eventuell senere sanering av legacy-presentasjonsdata.

## Godkjent canonical Object

### Byrute 8-skilt for sykkel

**ID:** `torggata_byrute_8_sykkelskilt`

Dette er et konkret fysisk trafikkskilt fotografert i Torggata-kontekst:

- Wikimedia Commons-filen `Skilt for byrute 8 for sykkel Oslo 2020.jpg` beskriver et fysisk skilt for byrute 8, testutforming fra Bymiljøetaten, fotografert 8. oktober 2020 av Helge Høifødt;
- Commons-filen er kategorisert både under `Cycle lanes in Oslo` og `Torggata, Oslo`;
- bildet er lisensiert CC BY-SA 4.0;
- Torggata Gateforening beskriver den østre delen av Torggata som gang- og sykkelprioritert og gaten som en viktig ferdselsåre for gående og syklende mellom sentrum og Grünerløkka;
- Tiltakskatalogen for transport og miljø bruker Torggata som norsk eksempel på sykkelgate.

Kildene gir både objektidentitet, Torggata-stedskobling og faglig relevans. Objektet representerer ikke «sykling» abstrakt; det viser en fysisk orienterings-/ruteskilting som kan observeres i gatebildet.

### Bilde og attribusjon

- bildefil: `https://upload.wikimedia.org/wikipedia/commons/6/66/Skilt_for_byrute_8_for_sykkel_Oslo_2020.jpg`
- kildeside: `https://commons.wikimedia.org/wiki/File:Skilt_for_byrute_8_for_sykkel_Oslo_2020.jpg`
- fotograf: Helge Høifødt
- lisens: CC BY-SA 4.0
- lisens-URL: `https://creativecommons.org/licenses/by-sa/4.0/`

Bildet brukes direkte fra Commons og metadataene beholdes i Object-recorden. Det opprettes ikke en ukildet lokal kopi eller et generert erstatningsbilde.

## Kilder

- Wikimedia Commons – `File:Skilt for byrute 8 for sykkel Oslo 2020.jpg`
  - `https://commons.wikimedia.org/wiki/File:Skilt_for_byrute_8_for_sykkel_Oslo_2020.jpg`
- Wikimedia Commons – `Category:Torggata, Oslo`
  - `https://commons.wikimedia.org/wiki/Category:Torggata,_Oslo`
- Torggata Gateforening – Om Torggata
  - `https://www.torggata.oslo.no/om-torggata/`
- Tiltakskatalog for transport og miljø – Sykkelgate
  - `https://www.tiltak.no/b-endre-transportmiddelfordeling/b-3-tilrettelegging-sykkel/b-3-8/`

## Godkjent resultat

8B materialiserer **én** canonical Object-post nå. Det er ikke en kvote og ikke en påstand om at Torggata bare har én interessant fysisk gjenstand. Flere kan legges til senere når de er selvstendig identifisert, kildeverifisert og har trygg visuell dokumentasjon.

Engangs-materialiseringskjøringen passerte:

- materialisering av canonical `place.objects`;
- `tests/torggata-phase8b-objects.test.mjs`;
- `tests/place-rounds-visual-collections.test.mjs`;
- `tests/place-rounds-grid-exclusivity.test.mjs`;
- automatisk cleanup av midlertidig workflow og materialiserer.

Den fokuserte kontrakten verifiserer at:

- `place.objects` inneholder den dokumenterte posten;
- Object-posten har fysisk/stedsspesifikk identitet, bilde og lisensmetadata;
- de fire legacy-ID-ene ikke er blitt promotert til canonical Objects;
- `HGPlaceRounds.getItems(place, "objects")` finner posten fra `place.objects`;
- Civication ikke gjenoppstår som egen PlaceCard-runding.

**8B Objects = GODKJENT.** Ordinær PR-CI skal være grønn på denne permanente slutt-headen før merge.
