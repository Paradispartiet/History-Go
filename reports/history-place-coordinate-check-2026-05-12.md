# Koordinatsjekk: historie merge candidates 01

Dato: 2026-05-12

Fil kontrollert og oppdatert:

- `data/places/historie/oslo/places_historie_merge_candidates_01.json`

## Resultat

Alle 8 merge-kandidater er koordinatsjekket mot eksterne kilder/adressegrunnlag.

Viktig: `coordStatus` betyr ikke at koordinaten er visuelt testet i appkartet. Det betyr at koordinaten er kontrollert mot ekstern kilde/adresse. Neste steg er fortsatt visuell karttest i appen.

## Oppdatert koordinatstatus

### `nonneseter_kloster`

Status: `verified_source_coordinate`

Ny koordinat:

- lat: `59.908905`
- lon: `10.768087`

Kilde:

- Lokalhistoriewiki-koordinat for Nonneseter kloster.

Endring:

- Flyttet fra ca. `59.9086, 10.7665` til `59.908905, 10.768087`.

### `oslo_ladegard`

Status: `verified_source_coordinate`

Ny koordinat:

- lat: `59.9061`
- lon: `10.7676`

Kilde:

- Koordinat oppgitt for Oslo Ladegård, kontrollert mot adresse/omtale av Oslo ladegård som besøks-/formidlingssted.

Endring:

- Flyttet fra ca. `59.9061, 10.7629` til `59.9061, 10.7676`.

### `gamle_radhus`

Status: `verified_source_coordinate`

Ny koordinat:

- lat: `59.909846`
- lon: `10.740149`

Kilde:

- Adresse-/koordinatkilde for Gamle Raadhus/Gamle rådhus, kontrollert mot Christiania torv/Nedre Slottsgate-området.

Endring:

- Flyttet fra ca. `59.9079, 10.7412` til `59.909846, 10.740149`.

### `galgeberg`

Status: `verified_source_coordinate`

Ny koordinat:

- lat: `59.90734`
- lon: `10.779786`

Kilde:

- Lokalhistoriewiki-koordinat for Galgeberg.

Endring:

- Flyttet fra ca. `59.9095, 10.7794` til `59.90734, 10.779786`.

Merknad:

- Dette er et områdepunkt/stedsnavn, ikke bygningssenter.

### `oslo_hospital`

Status: `verified_source_coordinate`

Ny koordinat:

- lat: `59.903189`
- lon: `10.767664`

Kilde:

- Wikimedia Commons-koordinat for Oslo Hospital, kontrollert mot adresse/omtale i Oslo Byleksikon.

Endring:

- Flyttet fra ca. `59.9064, 10.7689` til `59.903189, 10.767664`.

### `botsfengselet`

Status: `verified_source_coordinate`

Ny koordinat:

- lat: `59.909876`
- lon: `10.770404`

Kilde:

- Lokalhistoriewiki-koordinat for Botsfengselet.

Endring:

- Flyttet fra ca. `59.9107, 10.7759` til `59.909876, 10.770404`.

### `prinds_christian_augusts_minde`

Status: `verified_source_coordinate`

Ny koordinat:

- lat: `59.915289`
- lon: `10.75595`

Kilde:

- Wikimedia Commons-koordinat for Prinds Christian Augusts Minde, kontrollert mot Storgata 36/Prindsen.

Endring:

- Flyttet fra ca. `59.9162, 10.7545` til `59.915289, 10.75595`.

### `ruth_maier_minne`

Status: `verified_address_coordinate`

Ny koordinat:

- lat: `59.922731`
- lon: `10.737931`

Kilde:

- Dalsbergstien 3 adressekoordinat fra Merinfo, konvertert fra UTM33 til WGS84, kontrollert mot Oslo Byleksikons omtale av Ruth Maiers plass/Dalsbergstien.

Endring:

- Flyttet fra ca. `59.9227, 10.7376` til `59.922731, 10.737931`.

Merknad:

- Koordinaten er lagt ved Dalsbergstien 3/snublesteinen, ikke midt på Ruth Maiers plass, fordi entryen også skal dekke minnemarkeringen ved boligen.

## Fortsatt nødvendig før endelig merge

Selv om koordinatene nå er kildekontrollert, bør de visuelt testes i appkartet:

1. Sjekk at prikkene havner på riktig side av gaten/bygget.
2. Sjekk at de ikke kolliderer visuelt med eksisterende steder.
3. Sjekk at radius gir mening for fysisk stedstype.
4. Sjekk om noen bør flyttes fra eget kartpunkt til underpunkt etter kartvisning.

## Anbefalt neste steg

1. Kjør lokal/appvisning av `places_historie_merge_candidates_01.json`.
2. Test punktene visuelt i kartet.
3. Hvis karttest er god: merge disse 8 inn i `places_historie.json`.
4. Etter merge: kjør coverage/duplicate-ID-kontroll.
