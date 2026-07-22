# Subkultur Oslo – randsoner batch 02

Dato: 2026-07-22

## Lagt til

- `plata_oslo` – Plata
- `prindsen_mottakssenter` – Prindsen mottakssenter
- `fyrlyset_oslo` – Fyrlyset
- `evangeliesenteret_kontaktsenter_oslo` – Evangeliesenterets kontaktsenter

## Redaksjonell avgrensning

Batchen utvider Subkultur med dokumenterte sosiale randsoner og støttepunkter. Stedstekstene skiller mellom historisk åpen russcene, sosial møteplass og lavterskel hjelpeinfrastruktur, og unngår å romantisere eller stigmatisere menneskene som bruker stedene.

## Faglig QA

Første PR-kjøring avdekket at `em_sub_marginalisering` var brukt som om det var en canonical `emne_id`, selv om marginalisering bare finnes som faglig begrep i styringsmaterialet. Alle fire nye steder er derfor korrigert til eksisterende canonical emner: `em_sub_rett_til_byen` og `em_sub_tilhorighet_miljo`. Split-filene og indeksene ble regenerert etter korrigeringen, og place-/emne-/koordinatkontrollene ble kjørt på nytt før denne notisen ble lagt til.

## Koordinater

- Plata bruker et dokumentert historisk områdeanker fra Lokalhistoriewiki, kryssjekket mot Oslo kommunes beskrivelse av Christian Frederiks plass.
- Prindsen, Fyrlyset og Evangeliesenterets kontaktsenter bruker eksakte Geonorge-adressepunkter hentet address-first i denne batchen. Rå Geonorge-svar er lagret under `reports/subkultur-oslo-randsoner-batch-02/geonorge/`.

## Bevisst utsatt

- Brugata/Storgata-rusmiljøet legges ikke inn som ny markør i denne batchen. `storgata` finnes allerede som canonical fysisk sted under By, og en egen oppfølging må avgjøre om Subkultur skal legges som sekundært lag på eksisterende sted eller om et separat sosialhistorisk anker er nødvendig.
