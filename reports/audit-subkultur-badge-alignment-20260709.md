# Audit — subkultur places og people mot primær/sekundærbadge-modellen

Dato: 2026-07-09

## Grunnlag

Denne rapporten bygger på den nye primær-/sekundærbadge-modellen fra PR #2057.

Fasit:

- `place.category` er primærbadge.
- `secondaryBadgeIds` er valgfritt felt for reelle krysskoblinger.
- `subkultur` skal ikke brukes som fallback for alt alternativt.
- `musikk` dekker musikkpraksis, artister, konsertsteder, klubber som musikk-/DJ-infrastruktur og sjanger-/sceneproduksjon.
- `subkultur` dekker identitet, DIY, selvorganisering, motkultur, skate, graffiti, ziner, fandom, alternativ mote og undergrunnsformasjoner.

Badge-grunnlag:

- `subkultur.sub`: `punk_motkultur`, `hiphop_kultur`, `rave_og_klubbkultur`, `skate`, `graffiti`, `diy_og_selvorganisering`, `fanziner_og_smaforlag`, `fandom_og_nerdekultur`, `alternativ_mote`, `motkulturhistorie`
- `musikk.sub`: `klassisk`, `jazz`, `pop`, `rock`, `elektronisk`, `hiphop`, `samtidsmusikk`, `konsertsteder`, `scenekunst_og_show`

## Hovedfunn

Subkultur-dataene inneholder tre typer blanding:

1. **Riktige subkultur-objekter** — steder/miljøer der subkultur er primær identitet.
2. **Musikk-/venue-objekter** — steder/miljøer der primærkategori bør være `musikk`, med sekundær `subkultur` hvis undergrunn/motkultur er tydelig.
3. **By-/kunst-/media-/litteratur-/personprofil-objekter** — elementer som ligger i `subkultur` fordi de er alternative/særegne, men som ikke følger badge-kontrakten godt.

Denne rapporten flytter ingenting. Den er arbeidsliste for små cleanup-PR-er.

## Places — anbefalt klassifisering

### Behold primært `subkultur`

Disse bør normalt bli værende i `category: "subkultur"`:

| placeId | begrunnelse | anbefaling |
|---|---|---|
| `blitzhuset` | selvstyrt punk-/aktivist-/motkulturhus | behold `subkultur`, legg `secondaryBadgeIds: ["musikk"]` hvis konserter skal gi musikk-kobling |
| `hausmania` | selvorganisert kulturhus/motkultur/byaktivisme | behold `subkultur`, sekundær `kunst`/`musikk` kan vurderes |
| `skur13` | skate/graffiti/urban aktivitet | behold `subkultur` |
| `gamlebyen_sport_og_fritid` | skate/bowl/ungdomskultur/egenorganisert aktivitet | behold `subkultur`, eventuelt sekundær `sport` hvis fysisk aktivitet dominerer i UI |
| `oslo_skatehall` | skatehall/skatekultur | behold `subkultur`, eventuelt sekundær `sport` |
| `xray_ungdomskulturhus` | ungdomskulturhus, hiphop/dans/DIY-læring | behold `subkultur`, eventuelt sekundær `musikk` |
| `torggata_blad` | ziner/tegneserier/småforlag/uavhengig distribusjon | behold `subkultur`, vurder sekundær `litteratur` eller `populaerkultur` |
| `helvete_neseblod_records` | platebutikk og undergrunnshistorisk fysisk samlingspunkt | behold `subkultur` hvis vinklet som undergrunn/platekultur, sekundær `musikk` anbefales |
| `club_7_vika` | motkulturhus/alternativ offentlighet, ikke bare konsertsted | behold `subkultur`, sekundær `musikk`/`kunst` kan vurderes |

### Flytt eller vurder flytting til `musikk`

Disse ser ut som rene venue-/klubb-/musikk-infrastrukturer. De bør være primært `musikk` dersom place-data ikke dokumenterer at subkultur er selve hovedidentiteten.

| placeId | nåværende problem | anbefaling |
|---|---|---|
| `bla` | konsert-/klubb-/jazz-/elektronika-arena | flytt til `musikk`, legg `secondaryBadgeIds: ["subkultur"]` hvis undergrunnsprofil beholdes |
| `revolver_oslo` | konsert/klubb/uteliv | flytt til `musikk`, sekundær `subkultur` hvis undergrunn er eksplisitt |
| `the_villa` | elektronisk klubb/DJ/dansegulv | flytt til `musikk`, sekundær `subkultur` ved rave/klubbkultur-vinkel |
| `jaeger_oslo` | elektronisk klubb/DJ/bakgård | flytt til `musikk`, sekundær `subkultur` ved klubbkultur-vinkel |
| `kafe_haerverk` | bar/klubb/konsertsted/eksperimentell musikk | sannsynlig `musikk`, sekundær `subkultur` hvis DIY/undergrunn er hovedvinkel |
| `vaterland_bar_scene` | rock/punk/metal-konsertscene | sannsynlig `musikk`, sekundær `subkultur` hvis punk/undergrunnsmiljø er eksplisitt |
| `mir_grunerlokka_lufthavn` | konsert/kafé/kunst/musikkbar | vurder `musikk` eller `kunst`; `subkultur` kun hvis alternativmiljø er hovedvinkel |
| `sub_scene` | rusfritt ungdoms- og konsertsted | vurder: `subkultur` hvis ungdomskultur/lavterskel er hovedsak; `musikk` hvis venue-program er hovedsak |
| `last_train_oslo` | historisk/aktiv rockescene | bør ligge `musikk`, sekundær `subkultur` ved undergrunnshistorikk |
| `rock_in_oslo` | rock/metal-venue | bør ligge `musikk`, sekundær `subkultur` ved miljøvinkel |

### Vurder flytting til `by`, `kunst`, `litteratur`, `media` eller `populaerkultur`

| placeId | problem | anbefaling |
|---|---|---|
| `sofienbergparken_subkultur` | bypark brukt som uformell møteplass; ikke nødvendigvis primær subkultur | vurder `by` med `secondaryBadgeIds: ["subkultur"]`, eller behold kun hvis subkulturell bruk er dokumentert som hovedvinkel |
| `stovnertarnet` | konkret monument/utsiktspunkt; subkulturkobling svak | flytt sannsynlig til `by` eller `natur`, sekundær `subkultur` bare hvis stedets ungdoms-/miljøbruk dokumenteres |
| `torggata_blad` | nisjebokhandel/ziner/tegneserier | behold `subkultur` eller flytt til `litteratur`/`populaerkultur`; krever beslutning om zine/fandom-vekt |

### Allerede deaktivert — ikke bruk som people-ankre

Disse er riktig deaktivert i `data/places/place_exclusions.json` og skal ikke brukes som grunnlag for people-of-place:

- `vulkan_murvegger`
- `hausmannsgate_aksen`
- `kolstadgata_toyen_vegger`
- `gronland_underganger`
- `nybrua_pilarrom`
- `schweigaards_gate_lodalen`
- `kuba_akselpassasjer`
- `grunerlokka_bakgardsvegger`
- `brenneriveien_ingens_gate`

## People — anbefalt klassifisering

### Behold primært `subkultur`

Kollektive miljøankre som handler om miljø, identitet og fysisk praksis bør bli i `subkultur`:

- `blitz_miljoet`
- `hausmania_miljoet`
- `skur13_miljoet`
- `gamlebyen_sport_og_fritid_miljoet`
- `oslo_skatehall_miljoet`
- `xray_ungdomskulturhus_miljoet_concrete_anchor` — men ID bør ryddes senere
- `torggata_blad_miljoet`
- `gateavisa_miljoet`
- `radi_orakel`
- `oslo_graffiti_miljoet`
- `oslo_skateboardmiljoet`

### Flytt eller vurder flytting til `musikk`

Disse people/miljøankrene er først og fremst musikkscene-/venue-/artistrelaterte og bør vurderes for `musikk`:

- `revolver_oslo_miljoet`
- `the_villa_miljoet`
- `jaeger_oslo_miljoet`
- `mir_grunerlokka_lufthavn_miljoet`
- `kafe_haerverk_miljoet`
- `vaterland_bar_scene_miljoet`
- `bla_miljoet_concrete_anchor`
- `oystein_euronymous_aarseth` — musiker/platebutikkdriver; kan være `musikk` med subkultur som sekundær når people-modellen støtter det

### Duplikat-/ID-rydding

Disse ID-ene er ikke direkte duplikater etter audit, men de har dårlig navnestandard fordi `_concrete_anchor` ble lagt på for å unngå ID-kollisjon. De bør ryddes i egen PR:

- `hausmania_miljoet_concrete_anchor` — miljøet finnes allerede som `hausmania_miljoet`; bør fjernes eller merges
- `bla_miljoet_concrete_anchor` — bør enten bli stabilt `bla_miljoet` i riktig kategori eller flyttes til musikk
- `xray_ungdomskulturhus_miljoet_concrete_anchor` — bør omdøpes til `xray_ungdomskulturhus_miljoet` hvis ID er ledig og data støtter det

### Vurder flytting ut av `subkultur`

Disse ligger svakt i subkultur og bør vurderes mot andre badges:

| peopleId | problem | mulig primærbadge |
|---|---|---|
| `kolapalsen` | byoriginal/historisk byliv | `by` eller `historie` |
| `snippmoller` | byoriginal/historisk byliv | `by` eller `historie` |
| `lusefrants` | byoriginal/Vaterland-sosialhistorie | `by` eller `historie` |
| `lisa_kristoffersen` | Sagene-original/samfunnsengasjement | `by`, `historie` eller `politikk` |
| `advokat_hermansen` | sentrumsskikkelse/byoriginal | `by` eller `historie` |
| `ole_bjorn` | Oslo-original | `by` eller `historie` |
| `viggo_tigeren` | bysymbol/maskot, ikke person/miljø | bør kanskje ikke være people; eventuelt `by`/place-symboldata |
| `tinashe_williamson` | modell/forfatter/samfunnsdebattant med svak place-kobling | `media`, `litteratur`, `populaerkultur` eller needs_review |
| `stephen_butkus` | fotograf/kunstprofil | `kunst` eller `media` |

### Club 7-personer

Disse kan foreløpig beholdes i `subkultur` fordi Club 7 var motkulturell offentlighet og ikke bare musikkvenue:

- `kate_naess`
- `sossen_krohg`
- `attila_horvath`

Men de har også sterke koblinger til `litteratur`/`kunst`/`musikk`, og sekundærbadge-modellen bør senere utvides til people hvis vi ønsker samme presisjon der.

## Anbefalt cleanup-rekkefølge

### PR 1 — places: musikkvenues ut av subkultur

Flytt rene musikksteder til `musikk` og legg sekundær `subkultur` der det er relevant.

Start med liten batch:

- `bla`
- `the_villa`
- `jaeger_oslo`
- `revolver_oslo`

Ikke ta `Blitzhuset`, `Hausmania`, `X-Ray`, `Skur 13`, `Torggata Blad` i denne PR-en.

### PR 2 — people: venue-miljøankre til musikk

Etter PR 1:

- flytt `revolver_oslo_miljoet`
- flytt `the_villa_miljoet`
- flytt `jaeger_oslo_miljoet`
- vurder `bla_miljoet_concrete_anchor`

### PR 3 — ID cleanup for concrete_anchor-miljøer

- fjern/merge `hausmania_miljoet_concrete_anchor` mot eksisterende `hausmania_miljoet`
- rename/standardiser `xray_ungdomskulturhus_miljoet_concrete_anchor`
- avgjør `bla_miljoet_concrete_anchor` etter category-flytting

### PR 4 — byoriginaler ut av subkultur

Flytt Oslo-originalene til `by` eller `historie` etter egen vurdering av badge-modellen.

### PR 5 — weak/needs_review people

Vurder:

- `viggo_tigeren`
- `tinashe_williamson`
- `stephen_butkus`

## Ikke gjør

- Ikke bland musikk-venue-flytting med people-flytting i samme PR.
- Ikke flytt Club 7 før egen beslutning.
- Ikke bruk deaktivert hybrid-place som anker.
- Ikke opprett nye places mens cleanup pågår.
- Ikke endre `place_exclusions.json` uten egen begrunnelse.

## Validering etter hver cleanup-PR

For places:

```bash
bash scripts/check-places.sh
```

For people:

```bash
bash scripts/check-people.sh
```
