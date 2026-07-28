# Wonderkammer training migration — batch 1

Dato: 2026-07-28  
Kilde: `data/wonderkammer/training.json`  
Status: **fully retired from active Wonderkammer manifest**

## Formål

`training.json` tilhørte den gamle aktivitets-Wonderkammer-modellen. Batchen klassifiserer hvert sted og flytter bare innhold som har en klar canonical destinasjon.

Hovedregel:

- ekte stedsegnet fysisk ferdighet → `training_profile` / På stedet → Gjør på stedet;
- orientering og stedlesing → `tasks_profile` / På stedet → Gjør på stedet;
- innhold som allerede dekkes bedre canonical → ikke dupliser;
- aktivitet som er dårlig eller utrygt tilpasset stedet → avvis, ikke migrer mekanisk.

## Disposisjon per legacy-entry

### `majorstuen_krysset`

Legacy:
- `wk_majorstuen_krysset_urban_gange`
- `wk_majorstuen_krysset_rask_gange`
- `wk_majorstuen_krysset_orienteringsdrag`

Beslutning: **migrate_to_tasks**.

Begrunnelse:
Majorstukrysset er et presset trafikk- og overgangsrom. «Rask gange mellom punkter» er ikke en god treningsinstruks i et slikt sted. Den reelle pedagogiske kjernen er signalforståelse og trygg byorientering.

Canonical resultat:
`data/places/by/oslo/places/majorstuen_krysset.json` får `tasks_profile` med:
- `majorstuen_task_signaler`
- `majorstuen_task_alternativ_rute`

Instruksene krever trygt fortau, gangfelt og rolig orientering.

### `nationaltheatret_stasjon`

Legacy:
- `wk_nationaltheatret_stasjon_trapper_og_overganger`
- `wk_nationaltheatret_stasjon_trappevalg`
- `wk_nationaltheatret_stasjon_overgangsrytme`

Beslutning: **migrate_to_tasks**.

Begrunnelse:
Nationaltheatret er et underjordisk kollektivknutepunkt, ikke et treningsanlegg. Legacy-innholdets verdi er å forstå nivåer, skilt og overganger. Instruks om å velge trapper framfor rulletrapp fjernes; canonical innhold skal ikke gjøre tilgjengelighetsvalg til treningskrav.

Canonical resultat:
`data/places/by/oslo/places/nationaltheatret_stasjon.json` får `tasks_profile` med:
- `nationaltheatret_task_nivaaer`
- `nationaltheatret_task_overgang`

### `jernbanetorget`

Legacy:
- `wk_jernbanetorget_bevegelsesknutepunkt`
- `wk_jernbanetorget_rutevalg`
- `wk_jernbanetorget_trapp_og_gange`

Beslutning: **reject_or_duplicate**.

Begrunnelse:
Canonical `tasks_profile` finnes allerede og dekker stedet bedre:
- Tell transportsystemene
- Følg en menneskestrøm
- Finn en flaskehals

Legacy-entryen tilfører ikke en egen nødvendig handlingskontrakt og migreres derfor ikke.

### `ring_3`

Legacy:
- `wk_ring_3_infrastrukturblikk`
- `wk_ring_3_gangbrodrag`
- `wk_ring_3_stoy_og_pust`

Beslutning: **reject_or_duplicate / no action migration**.

Begrunnelse:
Ring 3 er canonical modellert som en tung trafikk- og infrastrukturrute med forbindelse/barriere som hovedtema. Å gjøre gangbroer og soner rundt hovedveien til treningsdrag er semantisk feil og unødvendig risikofremmende. Observasjon av infrastruktur kan eventuelt produseres senere som eksplisitt stedlesing, men legacy-treningen migreres ikke.

Ingen canonical place-fil endres for dette entryet.

### `skur13`

Legacy:
- `wk_skur13_fysisk_ferdighet`
- `wk_skur13_fysisk_ferdighet_balansestart`
- `wk_skur13_fysisk_ferdighet_fallforstaelse`

Beslutning: **migrate_to_actions → training_profile**.

Begrunnelse:
Skur 13 er en faktisk skate-/aktivitetshall. Balanse, kontroll og trygg stopp er fysisk stedsegnet ferdighetsinnhold og passer canonical treningskontrakt.

Canonical resultat:
`data/places/subkultur/oslo/places_subkultur/skur13.json` får `training_profile` med:
- `skur13_training_balansestart`
- `skur13_training_stoppkontroll`

Profilen fremhever lav fart, hjelm, kontroll og at man går av før kontrollen mistes. Den bygger på legacy-innholdet uten å gjøre generisk risikotrening til stedets identitet.

## Runtime og skjema

Batchen registrerer den eksisterende runtimekontrakten eksplisitt i `schemas/place.ts`:

- `PlaceTrainingProfile`
- `PlaceTrainingProfileExercise`
- `Place.training_profile`

`js/ui/place-onsite-surface.js` renderer nå `tasks_profile` og `training_profile` direkte når brukeren åpner Oppgaver eller Trening under **På stedet → Gjør på stedet**. Dette fjerner avhengigheten av skjulte legacy-rundingslister.

## Manifestendring

`data/wonderkammer/training.json` fjernes fra:
- `data/wonderkammer/index.json` → `files`
- `data/wonderkammer/index.json` → `groups.training`

Filen slettes etter at alle fem entries er eksplisitt klassifisert.

`groups.training` består fortsatt av:
- `data/wonderkammer/training_expansion.json`
- `data/wonderkammer/oslo_lekeplasser_trening_flat.json`

Disse migreres i senere batcher og er ikke behandlet her.

## Resultat

- legacy entries vurdert: 5 steder / 11 underentries
- migrert til `tasks_profile`: 2 steder
- migrert til `training_profile`: 1 sted
- duplikatforkastet: 1 sted
- avvist som feil/uegnet treningsflate: 1 sted
- slettet uten eksplisitt beslutning: 0
- `training.json` aktiv i Wonderkammer etter batch: nei
