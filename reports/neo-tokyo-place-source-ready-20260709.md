# Neo Tokyo Oslo — source-ready place report

Dato: 2026-07-09

## Kandidat

- Proposed placeId: `neo_tokyo_oslo`
- Proposed name: `Neo Tokyo Oslo`
- Proposed category: `subkultur`
- Proposed place type: fysisk butikk / japansk popkulturbutikk / anime- og spillmerch

## Hvorfor dette er et konkret sted

Neo Tokyo er ikke et miljøpunkt, en akse, et veggfelt eller en byromskonstruksjon. Det er en konkret fysisk butikk i Arkaden i Oslo sentrum.

Offisiell side oppgir:

- Karl Johans Gate 7
- Arkaden 2. etasje
- 0154 Oslo

## Hvorfor det passer subkultur/popkultur

Offisiell side viser tydelig profil rundt japansk popkultur og fandomrelatert butikkultur, blant annet:

- `ANIME & SPILL MERCH`
- `Japanske produkter`
- `POKÉMON`
- `K-POP`
- gacha/capsule toy
- figurer/samlefigurer
- Studio Ghibli
- Nintendo

Dette gjør stedet relevant som fysisk distribusjons- og møtepunkt for anime-, manga-, spill-, japansk popkultur-, Pokémon- og K-pop-interesse i Oslo.

## Anbefalt place-entry

```json
{
  "id": "neo_tokyo_oslo",
  "name": "Neo Tokyo Oslo",
  "lat": null,
  "lon": null,
  "r": 80,
  "category": "subkultur",
  "year": 2006,
  "desc": "Japansk popkulturbutikk i Arkaden, knyttet til anime, spillmerch, Pokémon, K-pop, figurer, japanske produkter og fandomkultur i Oslo sentrum.",
  "popupDesc": "Neo Tokyo Oslo fungerer som et konkret butikkanker for japansk popkultur, anime, spillmerch, Pokémon, K-pop og samlerkultur i Oslo. I History Go bør stedet leses som fysisk distribusjonsrom for fandom, nisjekultur og importert populærkultur, ikke som generisk handel eller kjøpesenterpunkt.",
  "emne_ids": [
    "subkultur",
    "popkultur",
    "japansk_popkultur",
    "anime",
    "spillkultur",
    "fandom"
  ],
  "underbadge_ids": [
    "subkultur",
    "popkultur",
    "nerdekultur"
  ],
  "quiz_profile": {
    "place_type": "butikk",
    "subtype": "japansk_popkulturbutikk",
    "themes": [
      "anime",
      "spillmerch",
      "pokemon",
      "kpop",
      "japansk_popkultur",
      "fandom"
    ]
  },
  "coordType": "address",
  "coordSource": "pending_geocode",
  "coordSourceId": "Karl Johans Gate 7, Arkaden 2. etasje, 0154 Oslo",
  "coordSourceUrl": "https://www.neo-tokyo.no/",
  "coordStatus": "needs_review",
  "coordPrecisionM": null,
  "coordVerifiedAt": null,
  "coordNote": "Adresse og funksjon er kildeverifisert fra offisiell Neo Tokyo-side. Koordinat skal ikke håndgjettes; geokodes/verifiseres før place-fil merges."
}
```

## Må gjøres før place-fil

1. Geokode/verifiser koordinat for Karl Johans Gate 7 / Arkaden.
2. Sjekk at underbadge_ids finnes i eksisterende badge-registry.
3. Kjør `bash scripts/check-places.sh`.
4. Inkluder oppdatert `data/places/places_index.json` hvis ny place-fil opprettes.

## Ikke gjort her

- Ingen place-fil opprettet.
- Ingen manifest endret.
- Ingen index endret.
- Ingen people lagt til.
- Ingen UI/runtime endret.

## Konklusjon

`neo_tokyo_oslo` er klar for faktisk place-batch så snart koordinat og badge-ID-er er mekanisk verifisert.
