# Lisboa v4 — svake badges

## Oversikt

Lisboa-pakken hadde før dette arbeidet ca. 119 entries. v4-pakken styrker fem
svake/tomme kategorier (vitenskap, sport, media, film_tv, populaerkultur) med
**31 nye entries**, slik at total Lisboa-count nå er **150**.

## Tall

| Felt | Verdi |
|------|------|
| Kandidater vurdert | 32 |
| Nye entries lagt inn | 31 |
| Hoppet over som duplikat | 1 |
| Filer endret | 3 |
| Nye filer opprettet | 2 |
| Manifest endret | Ja |

## Per kategori

| Kategori | Kandidater | Lagt inn | Hoppet over |
|----------|------------|----------|-------------|
| vitenskap | 10 | 10 | 0 |
| sport | 6 | 6 | 0 |
| media | 5 | 4 | 1 |
| film_tv | 5 | 5 | 0 |
| populaerkultur | 6 | 6 | 0 |

## Filer

### Nye filer
- `data/places/vitenskap/europe/portugal/lisbon/places_lisbon_vitenskap.json` (10 entries)
- `data/places/popkultur/europe/portugal/lisbon/places_lisbon_populaerkultur.json` (6 entries)

Merk: `populaerkultur`-fila er plassert under `popkultur/`-mappen for å matche
eksisterende mappekonvensjon (Oslo-fila ligger på `places/popkultur/oslo/places_oslo_populaerkultur.json`).
Oppgaven sa "ikke endre eksisterende mappestruktur"; å opprette en parallell
`populaerkultur/`-mappe ville bryte den konsistensen. Selve `category`-feltet i
hver entry er `"populaerkultur"`, som matcher badge-id i `data/badges.json`.

### Endrede filer
- `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` (+6 entries)
- `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` (+4 entries)
- `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` (+5 entries)
- `data/places/manifest.json` (+2 stier)

## Hoppet over

### Skipped: already exists

- **Hemeroteca Municipal de Lisboa** — finnes som `lisbon_hemeroteca_municipal`
  i `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json`.
  Per duplikatregel: ikke lagt inn under media. Diário de Notícias og Lusa
  dekker pressehukommelses- og presseinfrastrukturvinklene som Hemeroteca
  ellers ville ha bidratt med under media.

### Justerte (ikke duplikat, men tilstøtende)

- **Arquivo RTP** (`lisbon_arquivo_rtp`) ble lagt inn med tydelig audiovisuell
  arkivvinkel og må ikke leses som duplikat av `lisbon_rtp` (som dekker RTP som
  kringkasterinstitusjon i sin helhet).
- **Doclisboa** (`lisbon_doclisboa`) bruker Cinema São Jorge som hovedlokasjon
  men er beskrevet rent som festival/kuratorisk plattform, ikke som kino-entry.
- **Jardim Botânico Tropical** (`lisbon_jardim_botanico_tropical`) er en annen
  institusjon enn `lisbon_jardim_botanico` (Jardim Botânico de Lisboa,
  Príncipe Real); ingen duplikat.

## Entries som trenger koordinatverifisering

| Entry | Kommentar |
|-------|-----------|
| `lisbon_hipodromo_do_campo_grande` | Hipódromet ble demontert tidlig på 1900-tallet. Koordinatene peker mot dagens Jardim do Campo Grande, men eksakt utstrekning av den gamle løpsbanen bør verifiseres mot historiske kart. |
| `lisbon_tobis_portuguesa` | Eksakt adresse for det historiske studio-anlegget i Lumiar bør verifiseres. Koordinater er omtrentlig basert på Lumiar-området. |
| `lisbon_antena_1_rdp` | Den historiske Emissora Nacional / RDP-adressen i Rua do Quelhas bør verifiseres. Beskrivelsen åpner for at studioene har flyttet til RTP-anlegget på Avenida Marechal Gomes da Costa. |
| `lisbon_arquivo_rtp` | Arkivenheten ligger på samme RTP-campus som `lisbon_rtp`. Koordinatene er svakt forskjøvet for å reflektere arkivenheten, men nøyaktig plassering innenfor anlegget er ikke verifisert. |
| `lisbon_marchas_populares` | Lat/lon peker mot Avenida da Liberdade som hovedrute, men paraden bruker også Praça do Comércio og nabolag som Alfama. Stor radius (800) reflekterer dette. |
| `lisbon_santo_antonio_festival` | Lat/lon peker mot Alfama som hovedarena for folkefesten, men feiringen sprer seg over Mouraria, Castelo, Graça og Bica. Stor radius (700). |

## Entries med usikker kategori

| Entry | Kommentar |
|-------|-----------|
| `lisbon_torre_do_tombo` | Plassert under `vitenskap` for å styrke kunnskaps-/arkivdimensjonen. Kunne også gått under `historie` eller `media`. Per oppgave-anbefaling: bruk `vitenskap`. |
| `lisbon_diario_de_noticias` | `media` er hovedkategorien. Bygget er også `naeringsliv`-verdig (mediebedrift), men presseoffentlighet er primærdimensjonen. |
| `lisbon_feira_da_ladra` | Kunne også passet under `naeringsliv` (uformell handel) eller `subkultur`. Per oppgave: bruk `populaerkultur`. |
| `lisbon_feira_do_livro` | Kunne også passet under `litteratur`. Per oppgave: bruk `populaerkultur` (den finnes). |

## Entries som bør vente til Lisboa v5

Ingen kandidater fra v4-listen er utsatt. Følgende er observasjoner for v5-arbeid:

- **Olisipo / arkeologisk kontekst rundt Torre do Tombo og Sé**: `vitenskap`/`historie`-overlapp som krever videre arbeid.
- **Estádio do Jamor (Cross Country, Final da Taça)**: ligger i Oeiras kommune, utenfor Lisboas administrative grenser. Bør vurderes som egen "Greater Lisbon"-utvidelse.
- **Cordoaria / sentrums-kinoer som er nedlagt (Cinema Tivoli, Cinema Eden, Politeama)**: vil styrke `film_tv` ytterligere.
- **MEO Arena (Altice Arena) i Parque das Nações**: bør inn under `populaerkultur`/`musikk` i en senere runde.
- **Pavilhão Carlos Lopes**: kan styrke både `sport` og `by`-kategoriene.

## Validering kjørt

- ✅ Alle endrede JSON-filer parser
- ✅ `data/places/manifest.json` parser
- ✅ Alle manifest-paths finnes
- ✅ Alle nye entries har gyldig category fra `data/badges.json`
- ✅ Ingen nye entries har bildepaths (alle `image`/`frontImage`/`cardImage` er tomme strenger)
- ✅ Ingen nye entries har forbudte felter (`suggested_path`, `duplicate_check_note`, `country`, `continent`, `secondary_category`, `verification_needed`)
- ✅ Alle nye entries har `popupDesc`, `quiz_profile`, `wonderkammer`, `emne_ids`
- ✅ 31 nye entries har 31 unike id-er (ingen interne duplikater)
- ✅ Ingen nye id-er kolliderer med eksisterende id-er i manifestet

### Pre-eksisterende validering-utfordringer (utenfor scope)

Validering avdekket at en del eksisterende **Oslo**-entries i
`places/popkultur/oslo/places_oslo_populaerkultur.json` bruker `category: "popkultur"`,
mens badge-id i `data/badges.json` er `populaerkultur`. Dette er en pre-eksisterende
inkonsistens i Oslo-data. Per oppgaven ("Ikke endre Oslo/Norge-data") er dette
**ikke rørt** og bør håndteres separat.

## Liste: nye entries

### vitenskap (10)
1. `lisbon_museu_nacional_de_historia_natural_e_da_ciencia` — Museu Nacional de História Natural e da Ciência
2. `lisbon_observatorio_astronomico` — Observatório Astronómico de Lisboa
3. `lisbon_instituto_superior_tecnico` — Instituto Superior Técnico
4. `lisbon_faculdade_de_ciencias` — Faculdade de Ciências da Universidade de Lisboa
5. `lisbon_pavilhao_do_conhecimento` — Pavilhão do Conhecimento
6. `lisbon_jardim_botanico_tropical` — Jardim Botânico Tropical
7. `lisbon_instituto_higiene_medicina_tropical` — Instituto de Higiene e Medicina Tropical
8. `lisbon_laboratorio_nacional_engenharia_civil` — Laboratório Nacional de Engenharia Civil
9. `lisbon_instituto_ricardo_jorge` — Instituto Nacional de Saúde Doutor Ricardo Jorge
10. `lisbon_torre_do_tombo` — Arquivo Nacional da Torre do Tombo

### sport (6)
11. `lisbon_estadio_universitario` — Estádio Universitário de Lisboa
12. `lisbon_pavilhao_joao_rocha` — Pavilhão João Rocha
13. `lisbon_hipodromo_do_campo_grande` — Hipódromo do Campo Grande
14. `lisbon_centro_nautico_de_belem` — Centro Náutico de Belém
15. `lisbon_pista_moniz_pereira` — Pista de Atletismo Professor Moniz Pereira
16. `lisbon_complexo_desportivo_do_restelo` — Estádio do Restelo (Complexo Desportivo do Restelo)

### media (4, en hoppet over)
17. `lisbon_diario_de_noticias` — Diário de Notícias-bygget
18. `lisbon_lusa` — Lusa – Agência de Notícias de Portugal
19. `lisbon_antena_1_rdp` — Antena 1 / RDP-radiohistorie
20. `lisbon_arquivo_rtp` — Arquivo RTP

(Hemeroteca Municipal hoppet over — finnes som `lisbon_hemeroteca_municipal` i litteratur.)

### film_tv (5)
21. `lisbon_cinema_sao_jorge` — Cinema São Jorge
22. `lisbon_cinema_ideal` — Cinema Ideal
23. `lisbon_cinema_nimas` — Cinema Nimas
24. `lisbon_tobis_portuguesa` — Tobis Portuguesa
25. `lisbon_doclisboa` — Doclisboa – Festival Internacional de Cinema

### populaerkultur (6)
26. `lisbon_casa_museu_amalia_rodrigues` — Casa-Museu Amália Rodrigues
27. `lisbon_tram_28` — Tram 28 (Eléctrico 28)
28. `lisbon_marchas_populares` — Marchas Populares de Lisboa
29. `lisbon_feira_da_ladra` — Feira da Ladra
30. `lisbon_santo_antonio_festival` — Santo António-festivalen i Lisboa
31. `lisbon_feira_do_livro` — Feira do Livro de Lisboa
