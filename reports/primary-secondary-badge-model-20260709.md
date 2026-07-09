# Primary/secondary badge model

Dato: 2026-07-09

## Beslutning

History Go bruker nå en eksplisitt modell for primær- og sekundærbadges på places.

## Felt

### `category`

`category` er fortsatt obligatorisk og singular.

Det er primærbadge / hoveddomene for stedet.

Spørsmålet er:

> Hva er dette stedet først og fremst som History Go-spillobjekt?

### `secondaryBadgeIds`

`secondaryBadgeIds` er nytt valgfritt felt for krysskoblinger.

Eksempel:

```json
{
  "category": "subkultur",
  "secondaryBadgeIds": ["musikk"]
}
```

Regler:

- Må være array hvis feltet finnes.
- Må bare inneholde aktive runtime badge-id-er fra `data/badges/index.json`.
- Kan bruke aliaser som `popkultur`, men audit normaliserer dem til runtime-id.
- Må ikke gjenta primær `category`.
- Må ikke ha duplikater.

## Hvorfor

Punk, hiphop, rave/klubbkultur og underground-scener ligger i skjæringspunktet mellom `musikk` og `subkultur`.

Tidligere ble dette løst ved å plassere mange rene konsert-/klubbmiljøer direkte i `subkultur`. Det gir feil datamodell når `musikk` allerede er egen badge med underfeltene rock, elektronisk, hiphop og konsertsteder.

Ny modell:

- Velg én primærkategori.
- Bruk sekundærbadges for reelle krysskoblinger.

## Praktiske klassifiseringsregler

### Primært `musikk`

Bruk `category: "musikk"` når stedet først og fremst er:

- konsertsted
- musikkscene
- klubb som musikk-/DJ-infrastruktur
- scene for artister, band, DJ-er, konserter eller musikkproduksjon

Legg til `secondaryBadgeIds: ["subkultur"]` hvis stedet også har tydelig undergrunns-/DIY-/motkulturprofil.

### Primært `subkultur`

Bruk `category: "subkultur"` når stedet først og fremst er:

- selvorganisert hus
- aktivist-/motkulturhus
- ungdomskulturhus
- skate-/graffiti-/streetkultursted
- zine-/fanzine-/småforlagsmiljø
- fandom-/nerdekultursted
- alternativ mote-/stil-/identitetsmiljø
- fysisk infrastruktur for miljø og praksis mer enn musikkprogram

Legg til `secondaryBadgeIds: ["musikk"]` hvis konserter/musikk er en vesentlig del av stedet.

## Subkultur-badge underfelt

Subkultur-badgen er oppdatert fra brede musikkord til mer presise subkulturord:

- `punk_motkultur`
- `hiphop_kultur`
- `rave_og_klubbkultur`
- `skate`
- `graffiti`
- `diy_og_selvorganisering`
- `fanziner_og_smaforlag`
- `fandom_og_nerdekultur`
- `alternativ_mote`
- `motkulturhistorie`

## Validering

Ny audit:

```bash
node scripts/audit-place-secondary-badges.mjs
```

Denne kjøres nå fra:

```bash
bash scripts/check-places.sh
```

Audit feiler hvis:

- `category` mangler
- `category` ikke er aktiv badge-id
- `secondaryBadgeIds` ikke er array
- sekundærbadge er ugyldig
- sekundærbadge gjentar primærkategori
- sekundærbadge forekommer flere ganger

## Ikke gjort i denne PR-en

Denne PR-en flytter ikke eksisterende places eller people.

Faktisk rydding skal tas etterpå i små batcher:

1. Audit subkultur-places.
2. Flytt rene musikksteder til `musikk` og gi eventuell sekundær `subkultur`.
3. Audit subkultur-people.
4. Flytt rene artister/musikkpersoner til `musikk` og gi eventuell sekundær `subkultur` når people-modellen også støtter dette eksplisitt.
5. Behold skate/graffiti/DIY/fandom/motkultur under `subkultur`.

## Ikke gjør

- Ikke bruk `subkultur` som fallback for alt alternativt.
- Ikke legg rene konsertsteder i `subkultur` bare fordi musikken er alternativ.
- Ikke opprett nye badge-id-er uten å endre `docs/DOMAIN_CONTRACT.md` først.
- Ikke bruk `secondaryBadgeIds` til å slippe å velge primærkategori.
