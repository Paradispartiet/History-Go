# Historie: eget kartpunkt eller underpunkt/leksikon

Dato: 2026-05-12

Denne rapporten vurderer de nye historie-place-batchene og bestemmer om hvert forslag bør bli:

- `EGET_PLACE` = eget kartpunkt i `places_historie.json`
- `UNDERPUNKT` = leksikon/Wonderkammer/underinnhold under et større eksisterende sted
- `AVVENT` = behold i batch inntil koordinat, overlapp eller faglig plassering er kontrollert
- `FJERNET` = skal ikke brukes som eget place

Hovedregel: Ikke lag kartpunkter for rene historiske fenomener, institusjonsnavn eller underfortellinger hvis brukeren egentlig besøker samme fysiske sted som et eksisterende place. Et kartpunkt skal være et sted man faktisk kan peke på og besøke uten at det blir kunstig duplikat.

## Endelig fjernet

### `akershus_slaveri`

Status: `FJERNET`

Skal ikke være eget kartpunkt.

Begrunnelse:

- Dette er ikke et selvstendig sted i app-forstand.
- Det er en historisk funksjon/underfortelling knyttet til Akershus festning.
- Innholdet kan brukes som leksikon-, Wonderkammer- eller fordypningsinnhold under `akerhus_slott`.

Tiltak:

- Fjernet fra `data/places/historie/oslo/places_historie_next_batch_straff_sosial_01.json`.
- Skal ikke gjenopprettes som eget place.

## Anbefalt som egne kartpunkter

### `nonneseter_kloster`

Status: `EGET_PLACE`

Begrunnelse:

- Klosteret har egen historisk lokalisering og egen faglig profil.
- Det ligger ikke som et rent underpunkt inne i samme ruincluster som Hallvardskatedralen/Mariakirken.
- Det gir en viktig inngang til kvinnelig klosterliv, eiendom, kirke og middelalderby.

Krav før merge:

- Koordinat må kontrolleres visuelt.

### `oslo_ladegard`

Status: `EGET_PLACE`

Begrunnelse:

- Fysisk bygning og klart besøkbart sted.
- Fungerer som inngang/formidlingspunkt for middelalderbyen.
- Har egne historiske lag som ikke bare er ruin-underpunkt.

Krav før merge:

- Koordinat må kontrolleres visuelt.

### `gamle_radhus`

Status: `EGET_PLACE`

Begrunnelse:

- Fysisk bygning i Kvadraturen.
- Tydelig institusjonshistorisk rolle: bystyre, rett, borgerskap og Christiania etter 1624.
- Ikke bare underpunkt under `christiania_torv`, selv om det ligger tett på.

Krav før merge:

- Koordinat må kontrolleres visuelt.

### `galgeberg`

Status: `EGET_PLACE`

Begrunnelse:

- Et faktisk stedsnavn/byområde med historisk betydning.
- Gir historie-kategorien en viktig retts- og sosialhistorisk inngang.
- Skal behandles som områdepunkt, ikke bygning.

Krav før merge:

- Koordinat og radius må kontrolleres visuelt som historisk områdepunkt.

### `oslo_hospital`

Status: `EGET_PLACE`

Begrunnelse:

- Fysisk og historisk institusjonssted.
- Dekker omsorg, reformasjon, fattigvesen, sykdom og sosialhistorie.
- Ikke bare underpunkt under middelalderbyen.

Krav før merge:

- Koordinat må kontrolleres visuelt.

### `tukthuset`

Status: `AVVENT`, mulig `EGET_PLACE`

Begrunnelse:

- Faglig relevant som straff, fattigdom, tvangsarbeid og sosial kontroll.
- Må bekreftes som presist nok sted før det blir eget kartpunkt.
- Hvis fysisk plassering ikke kan avklares godt nok, bør innholdet heller gå inn som underpunkt/leksikon under relevant byområde/institusjonshistorie.

Krav før merge:

- Verifiser konkret historisk lokasjon.
- Verifiser at det ikke overlapper bedre med `prinds_christian_augusts_minde` eller annet eksisterende sted.

### `botsfengselet`

Status: `EGET_PLACE`

Begrunnelse:

- Klart fysisk fengselsanlegg.
- Sterk og selvstendig straffe- og institusjonshistorie.
- Ikke et kunstig underpunkt.

Krav før merge:

- Koordinat må kontrolleres visuelt.

### `prinds_christian_augusts_minde`

Status: `EGET_PLACE`

Begrunnelse:

- Klart fysisk og sosialhistorisk anlegg i Storgata 36.
- Bærer egen historie om fattigomsorg, asyl, arbeid, utenforskap og institusjonsmakt.
- Sterk nok til eget kartpunkt.

Krav før merge:

- Koordinat må kontrolleres visuelt.

### `ruth_maier_minne`

Status: `EGET_PLACE`

Begrunnelse:

- Presist minnepunkt knyttet til Ruth Maiers plass / Dalsbergstien 3 / snublestein.
- Ruth Maier skal behandles som historie, ikke litteratur som hovedkategori.
- Stedet gir Holocaust-historien en konkret lokal forankring.

Krav før merge:

- Koordinat må kontrolleres visuelt.
- Sjekk senere om Ruth Maier allerede finnes i litteraturdata og normaliser hovedkategori til historie.

## Bør vurderes som underpunkter under `middelalder_oslo`

Disse er historisk ekte steder, men ligger tett i samme ruinlandskap. For å unngå overfragmentering på kartet bør de som hovedregel først behandles som leksikon-/Wonderkammer-underpunkter under `middelalder_oslo`, med mindre appen faktisk skal ha en egen middelalder-ruinzoom eller subkart.

### `mariakirken`

Status: `UNDERPUNKT`, mulig `EGET_PLACE` senere

Anbefalt hovedsted:

- `middelalder_oslo`

Begrunnelse:

- Faglig viktig og reelt sted.
- Ligger tett i middelalderbyens ruincluster.
- Kan bli eget punkt senere hvis vi lager mer detaljert middelalderkart.

Bruk som underinnhold:

- kongelig kirke
- Håkon V
- Eufemia
- gravlegging
- kongemakt/kirke

### `clemenskirken`

Status: `UNDERPUNKT`, mulig `EGET_PLACE` senere

Anbefalt hovedsted:

- `middelalder_oslo`

Begrunnelse:

- Ekte ruin, men tett på øvrige middelalderruiner.
- Fungerer godt som leksikonpunkt om tidlig kirkelig byvekst.

Bruk som underinnhold:

- tidlig middelalderkirke
- kirkelig landskap
- gravplass og byvekst

### `hallvardskatedralen`

Status: `UNDERPUNKT`, mulig `EGET_PLACE` senere

Anbefalt hovedsted:

- `middelalder_oslo`

Begrunnelse:

- Meget viktig ruin og historisk anker.
- Likevel bør den ikke nødvendigvis bli eget kartpunkt hvis middelalderbyen allerede fungerer som samlet sted.
- Kan bli eget sted hvis vi senere lager høyoppløst middelalderrute.

Bruk som underinnhold:

- middelalderens domkirke
- St. Hallvard
- bispemakt
- helgenkult og byidentitet

### `bispeborgen`

Status: `UNDERPUNKT`, mulig `EGET_PLACE` senere

Anbefalt hovedsted:

- `middelalder_oslo`

Begrunnelse:

- Faglig sterk, men tett koblet til samme middelaldercluster.
- Viktig som makt-underpunkt: kirkelig makt, befestet bispegård, biskop/konge.

Bruk som underinnhold:

- biskopens makt
- kirke mot kongemakt
- befestet gård/borg

### `kongsgarden_middelalder_oslo`

Status: `UNDERPUNKT`, mulig `EGET_PLACE` senere

Anbefalt hovedsted:

- `middelalder_oslo`

Begrunnelse:

- Mer en historisk funksjon/maktlokasjon enn et enkelt moderne besøkssted.
- Viktig, men bør ligge som underpunkt til middelalderbyen inntil koordinat og besøkslogikk er klar.

Bruk som underinnhold:

- kongemakt
- hoff
- statsdannelse
- Oslo som politisk sentrum før Akershus/Christiania

### `olavsklosteret`

Status: `UNDERPUNKT`, mulig `EGET_PLACE` senere

Anbefalt hovedsted:

- `middelalder_oslo` eller `oslo_ladegard`

Begrunnelse:

- Historisk reelt klosteranlegg.
- Ligger tett på Ladegården/bispegårdslagene.
- Kan fungere bedre som fordypning under Ladegården eller middelalderbyen enn som eget punkt.

Bruk som underinnhold:

- dominikanerkloster
- kirkelig lærdom
- europeiske ordensnettverk
- kloster/bispegård

### `korskirken`

Status: `UNDERPUNKT`, mulig `EGET_PLACE` senere

Anbefalt hovedsted:

- `middelalder_oslo`

Begrunnelse:

- Ekte ruin, men tett i samme område.
- Faglig verdi ligger særlig i hverdagsliv, menighet og sognekirke.

Bruk som underinnhold:

- sognekirke
- menighet og gravplass
- hverdagsliv i middelalderbyen

## Bør vurderes som underpunkt under `christiania_torv`

### `anatomigarden`

Status: `UNDERPUNKT`, mulig `EGET_PLACE` hvis fysisk stedslogikk er ønsket

Anbefalt hovedsted:

- `christiania_torv`

Begrunnelse:

- Det er et faktisk bygg/sted, men ligger svært tett på Christiania torv og Gamle rådhus.
- Faglig innhold er sterkt som underfortelling: skarpretterhistorie, kropp, rett, anatomi, tidlig moderne kunnskap.
- Kartmessig kan det bli for tett hvis både `christiania_torv`, `gamle_radhus` og `anatomigarden` er egne punkt.

Bruk som underinnhold:

- rett/kropp/anatomi
- skarpretterhistorie
- tidlig moderne kunnskapsinstitusjoner

## Anbefalt aktiv merge nå

Hvis vi skal merge raskt uten å overfragmentere kartet, bør første aktive place-merge være:

- `nonneseter_kloster`
- `oslo_ladegard`
- `gamle_radhus`
- `galgeberg`
- `oslo_hospital`
- `botsfengselet`
- `prinds_christian_augusts_minde`
- `ruth_maier_minne`

Avvent eller flytt til underpunkt før aktiv place-merge:

- `mariakirken`
- `clemenskirken`
- `hallvardskatedralen`
- `bispeborgen`
- `kongsgarden_middelalder_oslo`
- `olavsklosteret`
- `korskirken`
- `anatomigarden`
- `tukthuset`

## Anbefalt underpunkt-struktur

### Under `middelalder_oslo`

- `mariakirken`
- `clemenskirken`
- `hallvardskatedralen`
- `bispeborgen`
- `kongsgarden_middelalder_oslo`
- `korskirken`

### Under `oslo_ladegard`

- `olavsklosteret`
- eventuelt bispegårdslag og formidling av middelalderbyen

### Under `christiania_torv`

- `anatomigarden`
- eventuelt skarpretterhistorie og tidlig moderne rett/kropp/kunnskap

### Under `akerhus_slott`

- Akershus som fengsel/straffarbeidsanstalt/slaveri, men ikke som eget place-ID

## Neste praktiske steg

1. Koordinatsjekk de anbefalte `EGET_PLACE`-stedene først.
2. Ikke merge `UNDERPUNKT`-stedene som egne kartpunkter ennå.
3. Lag en egen leksikon-/Wonderkammer-batch for underpunktene.
4. Merge bare de godkjente kartpunktene inn i `places_historie.json`.
5. Deretter merge people-batchene, men juster place-koblinger for personer som peker til underpunkter.

## Viktig før people-merge

Hvis underpunktene ikke blir egne places, må people-koblinger normaliseres:

- Personer som peker til `mariakirken`, `bispeborgen`, `kongsgarden_middelalder_oslo` eller andre underpunkter bør bruke `middelalder_oslo` som `placeId`.
- Underpunktet kan ligge i `places[]` bare hvis appen støtter ikke-place underreferanser. Hvis ikke, må underpunktet flyttes til leksikon/Wonderkammer, ikke `places[]`.
