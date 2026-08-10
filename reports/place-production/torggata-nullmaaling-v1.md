# Torggata – sted-for-sted nullmåling V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Snapshot av `main`: `b8d156e3204a5324534b5d0eedbbc803193aae6b`
- Canonical place-fil: `data/places/by/oslo/places/torggata.json`
- Place-manifest: `data/places/manifest.json`
- Koordinat-evidence: `data/coordinate-evidence/oslo/by/torggata.json`
- Leksikon: `data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json`
- Quiz-manifestets aktive fil: `data/quiz/by/torggata_sets.json`
- Canonical Story: `data/stories/stories_torggata.json`
- Primærkategori: `by`
- Status: **NULLMÅLING FERDIG – ingen innholdsflate er godkjent som produksjonsklar av denne rapporten**

Denne rapporten er opprettet før første Torggata-innholdsendring etter `docs/PLACE_PRODUCTION_CHECKLIST.md`. Den er en behold/saner/produser-plan, ikke en readiness-erklæring. Hver senere fase skal lese checklistens `LES FØRST`-kontrakter før den fasen endres eller godkjennes, og bare én fase skal være `PÅGÅR` om gangen.

## 1. Canonical identitet og source

| Kontroll | Nullmåling | Beslutning |
| --- | --- | --- |
| Canonical ID | `torggata` | **BEHOLD** |
| Manifest-loadet source | `data/places/by/oslo/places/torggata.json` ligger i `data/places/manifest.json` | **BEHOLD** |
| Objektidentitet | Den navngitte Oslo-gaten Torggata, ikke enkeltbygg, virksomhet, scene, arrangement eller Torggata Blad | **BEHOLD** |
| Dokumentert gateutstrekning | Place-teksten og Oslo byleksikon beskriver Torggata fra Stortorvet til Ankertorget | **BEHOLD SOM IDENTITETSGRENSE** |
| Duplikatsøk | Ingen separat canonical place for gaten ble funnet under navnevariantene Torggata / Øvre Torvegade / Torvegaden. `torggata_blad` er et separat Subkultur-objekt og skal ikke slås sammen med gaten. | **PASS** |
| Primærkategori | `by` | **BEHOLD inntil egen kategori/fagverkfase er gjennomført** |

### Blokkerende identitets-/geometrifunn

Canonical place beskriver hele Torggata fra **Stortorvet til Ankertorget**, mens gjeldende koordinat-evidence og `routeSegments` bare modellerer den navngitte kjeden **Youngstorget–Ankertorget**. Dette er en intern inkonsistens mellom stedets avgrensning og den lagrede gategeometrien.

Det skal **ikke** løses opportunistisk i nullmålingsfasen. Koordinatfasen må først lese coordinate-kontraktene, rekonstruere eksakt navngitt geometri for hele canonical gateidentiteten og oppdatere place/evidence konsistent eller dokumentere hvorfor identitetsgrensen må endres.

## 2. Eksisterende innhold – behold, saner eller re-auditer

| Flate/system | Dagens data | Nullmålingsstatus | Neste krav |
| --- | --- | --- | --- |
| `desc` | Finnes, stedsspesifikk og historisk konkret | **RE-AUDIT** | Place Description-kontrakten; claim-first production package |
| `popupDesc` | Lang artikkel med gateutbygging, Jensen-familien, Eldorado, Torggata bad og gateombygging | **RE-AUDIT** | Setning→claim, inspectable kilder, sourceLocation, faktareview og redaksjonell review |
| Description production package | Ingen `data/places/production/torggata.json` funnet i nullmålingen | **MANGLER / MÅ AVKLARES** | Les `PLACE_DESCRIPTION_CANONICAL.md` før opprettelse |
| Koordinater | `verified_geometry`, midpoint og 12 routeSegments | **BLOKKERT** | Geometrien dekker ikke hele oppgitt gateidentitet |
| `for_na` | Finnes | **RE-AUDIT** | Kilder og bildepar må kontrolleres; History GO/Wonderkammer kan ikke fungere som selvstendig faktabevis |
| `tasks_profile` | Tre stedlige observasjonsoppgaver | **RE-AUDIT** | På-stedet-kontraktene og fysisk gjennomførbarhet |
| `civication_store` | Fire legacy/stedsspesifikke items | **SANERINGSKANDIDAT** | Civication er separat system; bare reelle fysiske ting kan eventuelt kvalifisere som canonical Objects etter riktig kontrakt |
| `works` | Fem lokalt innlagte items | **RE-AUDIT / REKLASSIFISERING MULIG** | Kontroller om hvert item faktisk er Works, eller egentlig bygg, venue, ombruk, objekt eller historisk hendelse |
| `objects` | Ikke funnet i place-recorden | **MANGLER FOR NORMAL RUNDINGSPROFIL** | Vurderes først etter rundings-/object-eierkontrakt |
| `details` | Ikke funnet | **IKKE VURDERT** | Stedstype- og kontraktstyrt |
| `spots` | Ikke funnet | **IKKE VURDERT** | Stedstype- og kontraktstyrt |
| People | Global coverage-audit registrerer 12 people ved `torggata` | **EKSISTERER, IKKE RE-AUDITERT** | People-of-Places + People Profile + bildekontrakt før endring |
| Brands | 8 mappings i `brands_by_place.json`: `angst`, `arakataka`, `big_dipper`, `eldorado_bokhandel`, `john_dee`, `justisen`, `the_villa`, `tilt` | **EKSISTERER, IKKE RE-AUDITERT** | Brand rules før behold/fjern/utvid |
| Story | Én canonical Torggata-story finnes | **EKSISTERER, IKKE RE-AUDITERT** | Stories governance før endring eller godkjenning |
| Quiz | Aktiv manifestkilde er `data/quiz/by/torggata_sets.json`; en separat `_merged`-fil finnes også | **EKSISTERER, IKKE RE-AUDITERT** | Quiz-kontrakten; aldri rediger `_merged` som om den automatisk var canonical |
| Knowledge | Torggata treff finnes primært gjennom quiz-/genererte flater i nullmålingen | **IKKE BEVIST FERDIG** | Knowledge-synkronisering må kontrolleres i quizfasen |
| Leksikon | Torggata-oppføring finnes i By batch 1 | **BLOKKERT REDAKSJONELT** | `facts`, `chronology` og hovedoppføring har tomme `sources`; må kildebygges før ferdigstatus |
| Lesespor | Minst to eksisterende Oslo-batcher har entries der `place_ids` inkluderer `torggata` | **EKSISTERER, IKKE RE-AUDITERT** | Eksakt relevans, åpenhet, rettighet og direkte stedstilknytning må kontrolleres |
| Nyheter | Ingen egen Torggata-nyhetsflate identifisert i nullmålingen | **IKKE STARTET / KAN BLI N/A** | Må vurderes eksplisitt i popupfasen, ikke glemmes |
| `source_summary` | Ikke funnet i place-recorden | **MANGLER / MÅ VURDERES** | Kilder-fanen må ha canonical brukerrettet kildegrunnlag |
| Images | `image`, `frontImage` og `cardImage` peker til Torggata-assets | **PATH EKSISTERER I DATA, VISUELL/LISENS-AUDIT IKKE UTFØRT** | Bildekontraktene og faktisk UI-kontroll senere |

## 3. Fagidentitet og fagporter ved nullmåling

Dagens place bruker kun:

- `category: "by"`
- `em_by_gentrifisering_eiendom`
- `em_by_styring_forvaltning_planmakt`

Derfor er de spesialiserte fagportene **ikke automatisk aktive nå**:

| Fagport | Status nå | Begrunnelse |
| --- | --- | --- |
| Politikk | **BEGRUNNET N/A i nullmåling** | Ikke primærkategori `politikk`, ingen `em_pol_*`. Politisk/regulatorisk historie alene utløser ikke automatisk Politikk-place. |
| Historie | **BEGRUNNET N/A i nullmåling** | Ikke primærkategori `historie`, ingen `em_his_*`. At gaten er historisk viktig er ikke i seg selv grunn til å legge på Historie-emner. |
| Næringsliv | **BEGRUNNET N/A i nullmåling** | Ikke primærkategori `naeringsliv`, ingen `em_naering_*`. Handel og servering skal ikke automatisk omklassifisere gaten. |
| Subkultur | **BEGRUNNET N/A i nullmåling** | Ingen Subkultur-kategori, sekundærbadge eller `em_sub_*` på gaten. `torggata_blad` finnes separat som dokumentert Subkultur-objekt. |

Disse N/A-ene gjelder bare dagens identitet. Dersom kategori-/fagverkfasen senere foreslår en slik kobling, må den aktuelle fagporten leses og gjennomføres fullt før koblingen kan merges.

## 4. Popup – separat status for alle åtte faner

| Fane | Nullmålingsstatus | Evidens / blokkering |
| --- | --- | --- |
| Om | **PÅGÅR / ikke godkjent** | Rik `popupDesc` finnes, men canonical claim-/description package mangler eller er ikke funnet. Leksikon er ukildet. |
| Historie | **PÅGÅR / ikke godkjent** | Historisk stoff finnes i `popupDesc`; Leksikon har én generisk chronology-post uten kilder. Egen kildebelagt chronology/history_layers er ikke bevist ferdig. |
| Fortellinger | **PÅGÅR / ikke godkjent** | Én canonical Story finnes, men er ikke re-auditert mot dagens Story-governance. |
| Før/etter | **PÅGÅR / ikke godkjent** | `for_na` finnes, men kildeliste og faktisk bildepar er ikke auditert etter dagens kontrakt. |
| Nyheter | **IKKE STARTET** | Ingen godkjent Torggata-nyhetsflate identifisert. Senere vurderes ferdig eller begrunnet N/A. |
| Lesespor | **PÅGÅR / ikke godkjent** | Eksisterende Lesespor peker til `torggata`, men innholdet er ikke re-auditert. |
| Kilder | **IKKE FERDIG** | To `externalLinks` finnes på place, men `source_summary` er ikke funnet og Leksikon-kilder er tomme. |
| Mer | **IKKE STARTET** | Språkleksikon, observations, funfacts, relasjoner og «legg merke til» er ikke særskilt auditert for Torggata. |

Ingen popupfane arver ferdigstatus fra en annen.

## 5. Rundinger – legacy-avvik som må saneres senere

`place.rounds` inneholder i dag ni entries:

`people · tasks · badges · works · civication · brands · før_nå · fortellinger · leksikon`

Den eldre `reports/torggata-rounds-audit.md` godkjente denne ni-rundersmodellen. Den rapporten er nå **historisk sporbarhet, ikke canonical produksjonsbevis**.

Dagens `PLACE_STANDARD.md` og `PLACE_PRODUCTION_CHECKLIST.md` peker på den nyere rundingskontrakten. Før rundingsendring skal `data/places/README_place_rounds.md` leses. Nullmålingen registrerer foreløpig:

- Badges har egen fast plass og skal ikke vurderes som en av tre normale innholdsrundinger;
- `tasks`, `civication`, `før_nå`, `fortellinger` og `leksikon` er ikke automatisk canonicale innholdsrundinger;
- normal Torggata-profil forventes å måtte vurderes mot `people · objects · brands`;
- People og Brands har eksisterende data;
- canonical Objects er ikke funnet og er derfor et faktisk produksjonshull, ikke noe som kan skjules bak `civication_store` eller legacy `works`.

## 6. Foreløpig kildegrunnlag

Nullmålingen bruker eksisterende repo-evidens til inventar og identitetskontroll. Før brukerrettet innhold endres skal relevante eksterne kilder åpnes og kobles til konkrete claims.

Allerede identifiserte kildetyper som senere kan inngå i påstandsbanken:

- Oslo byleksikon – Torggata: gateidentitet, navnehistorie og utviklingshistorie;
- OpenStreetMap eksakt navngitt gategeometri: geometri/topologi, aldri som historisk innholdskilde;
- Oslo kommune / Bymiljøetaten: gateombygging, bruk og plan-/mobilitetsforhold;
- institusjons-/arkivkilder for Eldorado/Fahlstrøms Theater, Torggata bad, Rockefeller/John Dee og andre konkrete case;
- uavhengige sekundærkilder når betydning, konflikt, gentrifisering, kommersialisering eller årsak tolkes.

History GO-tekst, gammel audit, Wonderkammer, fagkart, emnelister eller språkmodell skal ikke være eneste bevis for noen faktapåstand.

## 7. Sanerings- og produksjonsplan

Fasene skal gjennomføres sekvensielt. Før hver fase leses alle `LES FØRST`-filer checklisten peker til for akkurat den fasen.

| Fase | Status | Avgrenset leveranse |
| --- | --- | --- |
| 0. Nullmåling | **KLAR FOR REVIEW** | Denne rapporten; ingen place-innholdsendringer |
| 1. Canonical identity/source | **IKKE STARTET** | Bekreft full gateidentitet, duplikatgrense og korrekt canonical source på faktisk `main` |
| 2. Kildebase | **IKKE STARTET** | Bygg inspectable claim/source-inventar for Torggatas sentrale identitet, historie, bygg og omforming |
| 3. Koordinater/geometri | **IKKE STARTET – BLOKKERENDE FUNN KJENT** | Les coordinate-kontraktene; korriger/avklar Stortorvet–Ankertorget kontra Youngstorget–Ankertorget |
| 4. Kategori, Badges, emner og Fagverk | **IKKE STARTET** | Les category + FAGVERK-kontraktene; audit `by` og de to `em_by_*`; kontroller `fagverk-sted.html?place=torggata` |
| 5. `desc` / `popupDesc` | **IKKE STARTET** | Claim-first description package, tekstsynk, faktareview, redaksjonell review |
| 6. Strukturerte profiler | **IKKE STARTET** | Gateavgrensning, segmenter, kryss, navnehistorie, temporal/history-lag etter aktive schemaer |
| 7. Popupfaner | **IKKE STARTET** | Om, Historie, Fortellinger, Før/etter, Nyheter, Lesespor, Kilder, Mer separat |
| 8. Rundinger | **IKKE STARTET** | Saner legacy-runder og bygg canonical tre-runders innhold med reelle data |
| 9. På stedet | **IKKE STARTET** | Tasks/events/møter/play/training etter kontrakt og relevans |
| 10. Quiz + Knowledge | **IKKE STARTET** | Audit aktiv `torggata_sets.json`, source-led progresjon, Knowledge-synk |
| 11. People | **IKKE STARTET** | Re-audit eksisterende 12; behold bare dokumentert fysisk/institusjonell/arbeidsmessig stedskobling |
| 12. Objects/Details/Spots | **IKKE STARTET** | Identifiser reelle Torggata-objekter; ikke konverter Civication/Works mekanisk |
| 13. Brands | **IKKE STARTET** | Re-audit alle åtte eksisterende mappings og eventuelle mangler |
| 14. Assets/UI | **IKKE STARTET** | Lisens/path, PlaceCard, popup, Fagverk, mobil/desktop, skjulte/fallback-flater |
| 15. Sluttgate | **IKKE STARTET** | Hele checklisten, relevant CI, faktisk `main`/produksjon; først da kan «produksjonsklar» vurderes |

## 8. Aktivt arbeidskort etter nullmålingen

| Felt | Verdi |
| --- | --- |
| Aktiv fase | `0. Nullmåling` |
| Aktiv filscope | `reports/place-production/torggata-nullmaaling-v1.md` |
| Place-filer endret i fasen | **Ingen** |
| Forrige fase merged/live-check | N/A – første fase |
| Neste fase etter godkjenning | `1. Canonical identity/source` |
| Hovedblokkerer videre | Gateidentiteten og lagret gategeometri dekker ikke samme strekning |
| Sekundær redaksjonell blokkerer | Leksikonets Torggata facts/chronology mangler kilder |
| Legacy som ikke må arves som sannhet | Ni-runders Torggata-audit; intern History GO/Wonderkammer som faktakilde; `_merged`-quiz som automatisk edit-target |

## 9. Nullmålingskonklusjon

Torggata har mye eksisterende innhold, men er **ikke produksjonsklar etter den nye sted-for-sted-kontrakten**. Hovedjobben er derfor ikke å fylle flest mulig felt. Den er å:

1. gjøre én konsistent canonical gateidentitet fysisk og datamessig sann;
2. erstatte legacy-readiness med source-led, kontrakteid innhold;
3. kildebygge og redaksjonelt revidere popupflatene;
4. sanere legacy-rundinger og fylle faktiske canonical hull;
5. re-auditere eksisterende People, Brands, Works, Story, Quiz, Leksikon og Lesespor uten å anta at eldre grønn status fortsatt gjelder;
6. merge og kontrollere hver fase på faktisk `main` før neste fase startes.

Denne rapporten endrer ingen brukerrettet sannhet. Den låser bare arbeidsgrunnlaget slik at resten av Torggata-produksjonen kan gjennomføres uten dobbeltarbeid, scope-glidning eller falsk ferdigstatus.
