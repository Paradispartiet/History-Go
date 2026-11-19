# Regjeringskvartalet – kildebasert Brands-arbeidskø, runde 2

**Dato:** 16.11.2026  
**Omfang:** 12 manglende bildefelt i `data/brands/brands_master.json`, alle knyttet til `regjeringskvartalet`. **Ingen logoer hentet inn, lisensiert, generert eller publisert i denne runden.** En lenke til virksomhetens nettsted er ikke i seg selv dokumentert gjenbrukstillatelse.

## Kildekontrollerte utgangspunkt

| Brand-ID | Offisielt kildeutgangspunkt | Funn | Redaksjonell status |
| --- | --- | --- | --- |
| `veidekke` | https://www.veidekke.no/aktuelt/media/ og https://www.veidekke.no/aktuelt/grafisk-profil/ | Eget presseområde og profilveiledning. **Veidekke lanserte ny logo 13.01.2025**; den gamle profilen hadde vært i bruk siden 1997. https://www.veidekke.no/aktuelt/pressemeldinger/veidekkeveidekke-far-ny-logo/ | **Epokeport.** Dagens 2025-logo kan ikke presenteres som samtidigeffekter fra eldre byggeetapper. Eksakt filvariant og gjenbruksvilkår må undersøkes |
| `ramboll` | https://www.ramboll.com/news-media | Offisiell medieside viser til **Brand central** for logonedlasting og profilveiledning | **Kandidat til original fil**; avklar rettigheter og riktig merketidsperiode, ikke lag selv en logo |
| `skanska` | https://www.skanska.no/hvem-vi-er/media/presserom/ | Offisielt presserom tilbyr **«Skanska logo» – «Last ned original»** | **Kandidat til original fil**; registrer original-URL, vilkår, filhash og tidspunkt før innføring |
| `hent` | https://www.hent.no/ og https://www.hent.no/media/ | Offisiell virksomhets- og pressekilde kan brukes til identitetskontroll, men det er ikke dokumentert et eget, lisensavklart logonedlastingsarkiv | **Avvent originalfil og bruksgrunnlag** |
| `koro` | https://koro.no/om-koro/logoer/ | Offisiell logokilde; siden oppgir bruk **etter avtale** (også registrert i forrige runde) | **STOPP – innhent tillatelse**, ikke automatisk import |

## Gjenstående identiteter uten ferdig dokumentert logokilde

| Brand-ID | Nødvendig avklaring |
| --- | --- |
| `nordic_office_of_architecture` | Offisielt merkemateriell og korrekt virksomhetsidentitet på prosjektets tidspunkt |
| `cowi` | Egen, autoritativ logoressurs fra COWI og eventuelle historiske navne-/logoendringer |
| `aas_jakobsen` | Firmamerkets faktiske versjon og tillatt bruk |
| `bjorbekk_lindheim` | Offisiell landskapsarkitektlogo/ordmerke og kilde |
| `sla` | Skille firmaets faktiske logo fra generiske initialer |
| `agaia` | Bekreftet originalmerke og rettighetsgrunnlag |
| `mebyr` | Bekreftet originalmerke og rettighetsgrunnlag |

## Kontrollen som kreves for hver logo før `image` eller `logo` settes

1. Ekte originalfil fra rett virksomhet eller utgiver med kilde-URL; **ingen KI-logoer, fritt rekonstruerte bokstaver eller tilfeldig skjermbilde**.
2. Merkevariant tilpasset relevant tid: prosjektets historiske fase eller dagens merke, tydelig definert og merket.
3. dokumentert bruksgrunnlag og faktisk krediteringsbehov; en presseportal er ikke automatisk «Public domain».
4. Størrelse, kontrast og utsnitt kvalitetssikres for små PlaceCard-vinduer; transparent bakgrunn skal ikke ødelegges.
5. Originalfil og derivative lagres separat, med SHA-256, `sourcePage`, rettigheter, `imageKind: logo`, eventuell `validFrom`/periode.
6. Kjør `node scripts/audit-linked-brand-images.mjs --check` og en mobil-/desktop-PlaceCard-test før noen profil får `manually_approved`.

## Prioritering

**Første bildebunke:** Skanska og Veidekke (offisielle ressurser funnet), deretter Rambøll; HENT og KORO trenger videre rettighets-/filavklaring. De øvrige sju er satt til **source-needed**, ikke «ferdige».

**Publiseringsstatus:** 0 av disse 12 Brand-logoene er innført i denne runden. De inngår fortsatt i de totalt 15 manglende stedstilknyttede Brands-bildene i audit-en.

## Supplerende rettighetskontroll, 16.11.2026

- **Skanska:** Presserommet tilbyr en originalfil for Skanskas logo. Det er **ikke tilstrekkelig dokumentasjon på at den kan gjenpubliseres fritt**. Skanska Digital har en egen vilkårsside, https://digital.skanska.no/vilkar/, som uttrykkelig verner logoer og varemerker, men denne siden gjelder Skanska Digital og kan **ikke uten videre** brukes som rettighetsbevis for Skanska Norges presserom. Korrekt status: `original_available_rights_uncleared`, ingen automatisk import.
- **Veidekke:** https://www.veidekke.no/aktuelt/pressemeldinger/veidekkeveidekke-far-ny-logo/ dokumenterer lanseringen av den nye merkeidentiteten **13. januar 2025**, mens selskapet oppgir forrige logoendring i 1997. Historiske Brands må skille periode **1997–12.01.2025** fra **13.01.2025–**, og en logoressurs må kontrollere lisens og akkurat den filvarianten som brukes.
- **Rambøll:** Offisiell medieside https://www.ramboll.com/news-media henviser til Brand Central, men tilgangen til profilmateriale er ikke det samme som dokumentert fri gjenpublisering. Status: `source_found_rights_uncleared`.

**Ingen endring i de 15 manglende bildene:** Dette er ny proveniens og rettighetskunnskap, ikke nye publiserte logoer.
