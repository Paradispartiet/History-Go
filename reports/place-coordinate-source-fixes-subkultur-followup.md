# Place coordinate source fixes – subkultur follow-up (2026-05-03)

| id/name | gammel lat/lon/r | ny lat/lon/r | kilde | sourceUrl / sourceId | coordType | status | kort begrunnelse |
|---|---|---|---|---|---|---|---|
| sofienbergparken_subkultur / Sofienbergparken | 59.9229, 10.7630, 180 | 59.9228, 10.7622, 140 | Oslo kommune (parkavgrensning og plassering) | https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/sofienbergparken / `oslo_kommune_sofienbergparken` | park_center | corrected | Satt til park-senterpunkt innenfor området mellom oppgitte gater, og markert verifisert med kilde. |
| hausmania / Hausmania | 59.9208, 10.7538, 150 | 59.919075, 10.752097, 90 | Hausmania offisiell kontakt + adresse (Hausmannsgate 34) | https://www.hausmania.org/kontakt-oss / `hausmania_kontakt_hausmannsgate34` | building_center | corrected | Oppdatert til verifisert byggpunkt for Hausmannsgate 34 basert på offisiell kontaktadresse. |
| skur13 / Skur 13 | 59.9066, 10.7315, 150 | 59.9066, 10.7315, 100 | SKUR13 offisiell kontakt (Filipstadveien, 0252 Oslo; Filipstadveien 3 brukt som adresseverifikasjon) | https://www.skur13.no/kontakt-oss / `skur13_kontakt_filipstadveien` | building_center | corrected | Koordinat beholdt som samsvarende med lokasjon, men satt som verifisert med kilde og strammere radius. |
| stovnertarnet / Stovnertårnet | 59.9705, 10.9238, 200 | 59.9705, 10.9238, 120 | Oslo byleksikon (Karl Fossums vei 30, Fossumberget) | https://oslobyleksikon.no/side/Stovnert%C3%A5rnet / `oslobyleksikon_stovnertarnet_karl_fossums_vei_30` | monument | corrected | Eksisterende punkt samsvarer med tårnplassering; markert verifisert med kilde og redusert radius. |

## Koordinatkilde-notat
- Adressekilder er hentet fra de oppgitte offisielle sidene.
- For Hausmania er koordinatpunkt satt fra verifisert adressepunkt (Hausmannsgate 34).
- For Skur 13 og Stovnertårnet ble offisiell plassering/adresse brukt til verifikasjon av eksisterende punkt før status ble endret til `verified`.
