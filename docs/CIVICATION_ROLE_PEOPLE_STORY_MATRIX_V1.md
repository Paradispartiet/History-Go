# Civication – rolle-, People- og fortellingsmatrise (v1)

**Status:** Redaksjonell plan, ikke påstand om implementert spilling. 12. oktober 2026.

Rolle-ID-er i kolonnen «Aktiv Life Story» er verifisert mot `data/Civication/lifestory/manifest.json`. Tekst etter «utvidelse» er **ikke** en manifestrolle og må kobles til canonical Role World eller Life Position separat.

## Dekningsmatrise: alle 24 samtidige fortellinger

| ID | Civication-fortelling | Aktiv Life Story / mulig utvidelse | Hvem eller hva må finnes | Litterært spor | Booker-modell |
| --- | --- | --- | --- | --- | --- |
| C01 | Jobbtap og verdighet | arbeidsledig | ingen kontakt påkrevd | L02, L03, L06 | P02 |
| C02 | Muligheten uten garanti | arbeidsledig; musikk_frilansmusiker (utvidelse) | musikk, oppdaget kontakt | L04, L17 | P03 |
| C03 | Drømmen og regningene | arbeidsledig, controller; naeringsliv_sideprosjektbygger (utvidelse) | prosjekt/virksomhet, oppdaget kontakt | L02, L06 | P03 |
| C04 | Forespørselen som ikke er en kontrakt | controller, ekspeditor; naeringsliv_frilanser (utvidelse) | oppdaget samarbeidspartner eller institusjonell rolle | L12, L17 | — |
| C05 | Byråkratiet og personen | arbeidsledig, psykologi_arbeids_og_karriereveiledning | institusjon, ikke People-venn | L07, L16, L18 | P01 |
| C06 | Faglig integritet under press | arealplanlegger, fagansvarlig, klinikkleder | faglig kollega eller historisk faglig referanse | L07, L17, L19 | P06 |
| C07 | Tilhørighet mot frihet | arbeidsledig; subkultur_gangster / kulturmiljø (under kontroll) (utvidelse) | kultur-/subkulturkontakt; ikke kriminalitetskobling | L03, L18, L23 | — |
| C08 | Tjenesten som blir en gjeld | arbeidsledig, ekspeditor; subkultur_gangster (utvidelse) | oppdaget nettverkskontakt | L02, L17 | — |
| C09 | Vennskapet som glir fra | arbeidsledig, sport_utover | etablert kontakt, ikke automatisk venn | L09, L15 | P05 |
| C10 | Kjærlighet på feil tidspunkt | arbeidsledig | egen eksplisitt fiktiv privatlivsrolle; ikke navngitt People | L10, L11 | P05 |
| C11 | Familien som trenger deg | barnehageassistent, arbeidsledig | etablert privat relasjon, ikke automatisk People | L08, L10 | — |
| C12 | Grensen du ikke satte | psykologi_miljoarbeid, sport_utover | oppdaget organisasjonskontakt | L17, L18 | — |
| C13 | Hjemmet på usikker grunn | arbeidsledig, renholder, ekspeditor | bolig- og økonomiflate; ingen kontakt påkrevd | L05, L22 | — |
| C14 | Ryktet løper fra deg | arbeidsledig, ekspeditor | oppdaget bekjentskap + separat digital hendelse | L12, L13, L16 | P06 |
| C15 | Det digitale dobbeltlivet | arbeidsledig, controller | digital profil; AHA-bro krever egen kontrakt | L14, L20 | — |
| C16 | Klassereisen og kodene | ekspeditor, sport_utover; by/byflanor (livsposisjon) (utvidelse) | kulturkontakt, ikke ferdig sosial adgang | L03, L23, L04 | P04 |
| C17 | Å arbeide seg tom | renholder, barnehageassistent, psykologi_miljoarbeid | arbeidskollega; People kan gi historisk fagkontekst | L06, L09 | P06 |
| C18 | Ensom midt blant folk | arbeidsledig, sport_utover | valgfri kontakt; alene-forløp må fungere | L09, L24, L13 | — |
| C19 | Å begynne på nytt | arbeidsledig, controller, forsker_psykologi | faglig kontakt valgfri | L04, L15 | P07, P02 |
| C20 | Fellesskapet uten helt | psykologi_miljoarbeid, fagansvarlig; fellesskapsorienterte livsposisjoner (utvidelse) | flere kontakter med hver sin agenda | L11, L19, L13 | — |
| C21 | Byen som skifter ansikt | arealplanlegger, ekspeditor; by/byflanor eller historie/historievandrer (livsposisjon) (utvidelse) | historisk People som faktakilde, ikke dagens beslutningstaker | L21, L22, L13 | P04 |
| C22 | Kunnskap du ikke kan bekrefte | forsker_psykologi, professor_psykologi, psykolog; natur/artsjeger (livsposisjon) (utvidelse) | faglig People som kunnskapskilde | L17, L19, L20 | — |
| C23 | Den lille feilen som ikke forsvinner | controller, klinikkleder, fagansvarlig, arealplanlegger | institusjonell rolle eller faktisk kontakt | L01, L16, L15 | P06 |
| C24 | Den ufullstendige forsoningen | arbeidsledig, psykologi_miljoarbeid | bare tidligere etablert relasjon | L10, L15, L09 | P07 |

**Merknad:** Hver matriserad er en *mulighet*. `role_keys` i den tilhørende JSON er foreslåtte produksjonsprioriteringer, ikke en begrensning på andre relevante canonicale roller. L- og P-koblinger er bevart fra original `narrativeCrosswalkV1.json`; tom P betyr at ingen av Bookers sju plot er valgt.

## People-matrise – seks kontrollerte canonical eksempler

| Canonical People | Sted-ID | Faglig rolle fra People | Fortellingsmulighet | Ikke tillatt å anta |
| --- | --- | --- | --- | --- |
| `bugge_wesseltoft` – Bugge Wesseltoft | `blaa` | Pianist, komponist og produsent; nu-jazz | Musikalsk form- og improvisasjonsvalg | Personlig bekjentskap, oppdiktede private motiver eller fri NPC-dialog uten endret policy |
| `mari_boine` – Mari Boine | `rockefeller` | Sanger og låtskriver; samisk og norsk musikkliv | Språk, kunstnerisk uttrykk og samarbeidets rammer | Personlig bekjentskap, oppdiktede private motiver eller fri NPC-dialog uten endret policy |
| `attila_horvath` – Attila Horvath | `club_7_vika` | Club 7-initiativtaker; miljøbygging | Miljøbygging og hvem som slipper til | Personlig bekjentskap, oppdiktede private motiver eller fri NPC-dialog uten endret policy |
| `sossen_krohg` – Sossen Krohg | `club_7_vika` | Skuespiller og Scene 7 / Club 7 | Sceneproduksjon og kunstnerisk ansvar | Personlig bekjentskap, oppdiktede private motiver eller fri NPC-dialog uten endret policy |
| `jens_jacob_jensen_myrens` – Jens Jacob Jensen | `myrens_verksted` | Industrigründer; Myrens verksted | Industri, teknologisk utvikling og produksjonsvilkår | Personlig bekjentskap, oppdiktede private motiver eller fri NPC-dialog uten endret policy |
| `peter_emil_steen` – Peter Emil Steen | `steen_og_strom` | Kjøpmann; Steen & Strøm | Handel, organisering og virksomhetsutvikling | Personlig bekjentskap, oppdiktede private motiver eller fri NPC-dialog uten endret policy |

Dette er **ikke seks godkjente simulerte karakterer**. Det er dokumenterte People med forskjellig faglig materiale. Samarbeid må bare produseres hvis simuleringens governance og scenarioets tids-/stedskontekst tillater det.

## Rollefamilier og prioritet

| Rollefamilie | Eksisterende grunnlag | Mest relevante C-spor | People-funksjon |
| --- | --- | --- | --- |
| Arbeidsledig | `arbeidsledig` (systemrolle) | C01 C02 C05 C07 C08 C09 C13 C18 C19 C24 | People kan åpne miljø, faglig utvikling og frivillig kontakt |
| Musikk / frilansmusiker | Separate musikkfortsettelser, ikke i dette Life Story-manifestet | C02 C09 C14 C24 | Personens særpreg må endre selve samarbeidet |
| Prosjekt / frilanser / gründerdrømmer | Separate legacy-fortsettelser | C03 C04 C23 | Virksomhetstype og periode må styre prosjektets realisme |
| Kultur- og subkulturmiljø | Separate miljøfortsettelser | C07 C08 C12 C16 C20 | Deltakelse kan bygges; ingen oppdiktet kriminalitet |
| Arealplanlegging | `arealplanlegger` | C06 C21 C23 | People = historie og fagkontekst, ikke nåtidig vedtak |
| Renhold / butikk | `renholder`, `ekspeditor` | C13 C17 C23 | Nåtidsaktører må komme fra korrekt arbeidslivslag |
| Psykologi og omsorg | `psykolog`, `spesialistpsykolog`, `psykologi_miljoarbeid`, `barnehageassistent` mfl. | C06 C11 C12 C20 C22 C23 | Skille forskning/teori fra private pasientforhold |
| Ledelse og økonomi | `controller`, `fagansvarlig`, `klinikkleder` | C03 C04 C06 C15 C23 | Ikke gi bedriftsmyndighet gjennom People-unlock |
| Idrett | `sport_utover` | C09 C12 C16 C18 | Lag, konkurranse og vennskap krever faktisk relasjon |
| Forskning | `forsker_psykologi`, `professor_psykologi` | C19 C22 | Kildekritikk, hypotese og usikkerhet skal styre handlingene |

## Migrering av Mira, Lea og Arvid: funksjon, ikke identitet

| Gammelt narrativt anker | Bevar dramatisk problem | Ny kontaktgate | To **ulike** mulige retninger |
| --- | --- | --- | --- |
| Mira (`mira`) | Ubekreftet spilleforespørsel, kreativt samarbeid, avlysning | Oppdaget musikk-People + musikkrolle + eksplisitt fiksjonsport | Bugge-spor: samspill, improvisasjon, produksjon. Mari-spor: fortolkning, språk og kunstnerisk uttrykk. |
| Lea (`lea`) | Prototyp, kundebehov, uklart honorar, rett til å si nei | Oppdaget virksomhets-People + prosjekt-/arbeidsrolle + port | Myrens-spor: teknologi/produksjon. Steen & Strøm-spor: handel, sortiment og tillit. |
| Arvid (i filer ofte `amir`) | Tilhørighet, adgang til miljø, lojalitet og avgrensning | Oppdaget kultur-/subkultur-People + relevant livsposisjon + port | Attila-spor: organisering av møteplass. Sossen-spor: scene og produksjonsansvar. |

Eksemplene er **synopsisretninger**, ikke tillatelse til å tilskrive de virkelige personene konkrete ord eller handlinger. Ikke migrer ved å endre `navn` på gamle replikk- eller choice-objekter.

## Fullstendighetsmål

- 24/24 C-typer med rolleprioritet, litteraturkobling, valg, tilbakekomst og Symposium-bevis.
- 7/7 Booker-plotmodeller beholdt som valgfrie linser.
- 24/24 litterære L-spor bevart i kryssregisteret, også når enkelte ikke gir gameplay.
- Tre gamle fortellingsfunksjoner dokumentert som migreringskandidater.
- Seks kjente People med kontrollert canonical sted-ID; **0** personer autorisert til frie simulerte replikker ved denne planleveransen.
