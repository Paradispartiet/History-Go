# Lisboa v3 – Datautvidelsesrapport

Generert: 2026-05-03

## Sammendrag

- **Antall nye entries lagt inn:** 52
- **Antall nye filer opprettet:** 2 (`places_lisbon_film_tv.json`, `places_lisbon_media.json`)
- **Antall eksisterende filer endret:** 9
- **Manifest oppdatert:** Ja (to nye filstier lagt til)
- **Forbidden fields i app-entries:** ingen
- **Bildepaths i app-entries:** ingen (alle `image`, `frontImage`, `cardImage` er tomme strenger)
- **emne_ids i app-entries:** alle satt til `[]` per oppgavens hovedregel
- **Totalt antall places i datasettet etter endring:** 364 (var 312)
- **Duplikate id-er i datasettet:** ingen

Alle 52 entries fra Lisboa v3-listen er lagt inn. Ingen eksisterende Lisboa-,
Oslo- eller Norge-entries er endret. Ingen appkode, ingen UI og ingen
emnefiler er rørt.

## Endrede filer

- `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` (+10)
- `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` (+6)
- `data/places/politikk/europe/portugal/lisbon/places_lisbon_politikk.json` (+5)
- `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` (+7)
- `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` (+5)
- `data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json` (+4)
- `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` (+4)
- `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` (+3)
- `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` (+6)

## Nye filer

- `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` (1 entry: Cinemateca Portuguesa)
- `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` (1 entry: RTP)

## Manifestendring

Ja. To nye stier lagt til i `data/places/manifest.json`:

- `places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json`
- `places/media/europe/portugal/lisbon/places_lisbon_media.json`

Begrunnelse: kategoriene `film_tv` og `media` finnes i `data/badges.json`,
og `category` i de to nye entries refererer direkte dit. Eksisterende Oslo-
filer for film og media er ikke endret. Strukturen følger oppgavens
mappespesifikasjon (`data/places/{category}/europe/portugal/lisbon/...`).

## Entries gruppert etter kategori

### by (10)
1. `lisbon_chiado` – Chiado
2. `lisbon_campo_de_ourique` – Campo de Ourique
3. `lisbon_estrela` – Estrela
4. `lisbon_lapa` – Lapa
5. `lisbon_ajuda` – Ajuda
6. `lisbon_campo_pequeno` – Campo Pequeno
7. `lisbon_entrecampos` – Entrecampos
8. `lisbon_oriente_station` – Estação do Oriente
9. `lisbon_martim_moniz_mouraria_axis` – Martim Moniz–Mouraria-aksen
10. `lisbon_gare_do_cais_do_sodre` – Gare do Cais do Sodré

### historie (6)
11. `lisbon_igreja_de_santo_antonio`
12. `lisbon_igreja_de_sao_roque`
13. `lisbon_museu_do_aljube`
14. `lisbon_igreja_de_sao_domingos`
15. `lisbon_museu_de_marinha`
16. `lisbon_museu_nacional_dos_coches`

### politikk (5)
17. `lisbon_praca_do_municipio`
18. `lisbon_tribunal_constitucional`
19. `lisbon_fundacao_mario_soares_maria_barroso`
20. `lisbon_avenida_24_de_julho`
21. `lisbon_palacio_de_belem`

### kunst (7)
22. `lisbon_museu_nacional_de_arte_contemporanea_do_chiado`
23. `lisbon_mude`
24. `lisbon_teatro_nacional_d_maria_ii`
25. `lisbon_teatro_sao_luiz`
26. `lisbon_culturgest`
27. `lisbon_museu_arpad_szenes_vieira_da_silva`
28. `lisbon_museu_bordalo_pinheiro`

### litteratur (5)
29. `lisbon_praca_luis_de_camoes`
30. `lisbon_estatua_eca_de_queiros`
31. `lisbon_hemeroteca_municipal`
32. `lisbon_gremio_literario`
33. `lisbon_casa_dos_estudantes_do_imperio`

### musikk (4)
34. `lisbon_coliseu_dos_recreios`
35. `lisbon_teatro_tivoli_bbva`
36. `lisbon_clube_de_fado`
37. `lisbon_tasca_do_chico`

### subkultur (4)
38. `lisbon_crew_hassan`
39. `lisbon_village_underground`
40. `lisbon_desterro`
41. `lisbon_anjos70`

### naeringsliv (3)
42. `lisbon_mercado_de_campo_de_ourique`
43. `lisbon_armazens_do_chiado`
44. `lisbon_terminal_de_cruzeiros`

### natur (6)
45. `lisbon_jardim_da_estrela`
46. `lisbon_jardim_do_torel`
47. `lisbon_miradouro_da_senhora_do_monte`
48. `lisbon_tapada_da_ajuda`
49. `lisbon_jardim_gulbenkian`
50. `lisbon_jardim_do_principe_real`

### film_tv (1)
51. `lisbon_cinemateca_portuguesa`

### media (1)
52. `lisbon_rtp`

## Validering

| Sjekk | Resultat |
|------|----------|
| Alle endrede JSON-filer parser | OK |
| `data/places/manifest.json` parser | OK |
| Alle manifest-paths finnes på disk | OK |
| Alle nye entries har gyldig `category` fra `data/badges.json` | OK |
| Ingen nye entries har bildepaths | OK |
| Ingen nye entries har forbidden fields | OK |
| Ingen duplicate place IDs i hele datasettet | OK (364 unike) |
| Alle nye entries har `popupDesc`, `quiz_profile`, `wonderkammer`, `emne_ids` | OK |
| Alle nye entries har tomme `image` / `frontImage` / `cardImage` | OK |
| `tools/audit-place-data.mjs` kjørt | OK (forventede `mangler image / cardImage / emne_ids`-funn for nye entries) |

Audit-scriptet flagger som forventet manglende image/cardImage/emne_ids for
de 52 nye entries; dette er bevisst per oppgavens spesifikasjon (ingen
bildepaths, `emne_ids` skal være `[]`). Ingen feil i form av manglende
`popupDesc` eller `quiz_profile` for de nye entries.

## Entries som trenger koordinatverifisering

Koordinatene er satt etter beste tilgjengelige plassering, men disse bør
verifiseres mot offisielle kilder før Lisboa v4:

- `lisbon_rtp` – RTPs hovedkvarter (Av. Marechal Gomes da Costa). Adressen
  er kjent, men nøyaktig (lat/lon) bør sjekkes mot kommunal kart.
- `lisbon_casa_dos_estudantes_do_imperio` – CEI hadde flere adresser
  gjennom historien (Av. Duque d'Ávila og Rua dos Lusíadas i Alcântara);
  satt til en sentral plassering. Bør avklares hvilken adresse som er
  primær for entry, og koordinater oppdateres deretter.
- `lisbon_crew_hassan` – Kollektivet har hatt flere adresser
  (bl.a. Rua do Poço dos Negros og Martim Moniz-området). Koordinatene er
  omtrentlige, og bør forankres til en konkret nåværende eller historisk
  adresse.
- `lisbon_anjos70` – Anjos-området, men nøyaktig adresse i Rua Maria da
  Fonte / nærliggende lager bør verifiseres.
- `lisbon_desterro` – satt nær Hospital do Desterro-bygget; adressen er
  kjent, men det bør verifiseres at koordinatene treffer hovedinngangen.
- `lisbon_martim_moniz_mouraria_axis` – aksen har stor utstrekning; et
  midtpunkt er valgt, men senterkoordinatet bør valideres mot kommunens
  bydelsavgrensning.
- `lisbon_estatua_eca_de_queiros` – Largo do Barão de Quintela; bør
  verifiseres mot kommunal monumentdatabase.
- `lisbon_hemeroteca_municipal` – Palácio das Galveias; bør verifiseres.

Øvrige entries (basilikaer, museer, plasser, parker) bruker kjente og
veletablerte koordinater og er regnet som tilstrekkelig pålitelige.

## Entries med usikker badge-sub

Hver entry har en `Badge-sub: <verdi>`-merkelapp i
`quiz_profile.notes`. Alle valgte sub-er finnes i `data/badges.json` for
hovedkategorien. Følgende valg er gjort med små forbehold:

- `lisbon_chiado`, `lisbon_estrela`, `lisbon_oriente_station`,
  `lisbon_martim_moniz_mouraria_axis`, `lisbon_gare_do_cais_do_sodre`,
  `lisbon_entrecampos`, `lisbon_ajuda` → Badge-sub `byplanlegging`
  eller `infrastruktur` / `samtidsarkitektur`. Begge er gyldige under
  `by`-badge.
- `lisbon_lapa`, `lisbon_campo_de_ourique` → `bolig_og_bomiljo`.
- `lisbon_campo_pequeno` → `monumenter_og_landemerker` (alternativt
  kunne `infrastruktur` vurderes; valgt etter byggets ikoniske form).
- `lisbon_terminal_de_cruzeiros` → `shipping_og_havn` (riktig under
  `naeringsliv`-badge).
- `lisbon_tribunal_constitucional` → `rettsstat_og_domstoler`
  (eksisterer i `politikk`-badge).
- `lisbon_avenida_24_de_julho` → `arbeiderbevegelse` (eksisterer i
  `politikk`-badge); subset kunne også vært `kommune_og_byraad`.

Ingen `foreslått:`-prefiks ble nødvendig — alle valgte sub-er er
allerede i `data/badges.json`.

## Entries med usikker kategori

Ingen. Alle 52 valg av `category` følger oppgavens forhåndsdefinerte
liste og passer eksisterende badge-id i `data/badges.json`.

Mulig grenseoppgang verdt å notere for v4:

- `lisbon_avenida_24_de_julho` ble plassert under `politikk` for å
  fremheve aksens politisk-historiske navnehistorie og arbeider-/havnearv.
  Den kunne alternativt vært under `by` eller `naeringsliv`. Valget her er
  konsistent med eksisterende politikk-entries som
  `lisbon_largo_do_carmo` og `lisbon_praca_dos_restauradores`.
- `lisbon_terminal_de_cruzeiros` er plassert under `naeringsliv` for å
  betone cruiseøkonomi/havn; ville kunne vært `by` for å vektlegge
  arkitektur. Valget her følger samme logikk som
  `lisbon_doca_de_alcantara` (også `naeringsliv`).
- `lisbon_oriente_station` plassert under `by` for å understreke
  byutvidelsesperspektivet og infrastrukturrollen, parallelt med
  `lisbon_estacao_do_rossio` som ligger under `historie`. For v4 kan en
  vurdere konsistens på tvers av stasjonene.

## Entries som er flyttet fra v3 til v4

Ingen. Alle 52 entries fra spesifikasjonen er lagt inn i v3.

## Avgrensninger og redaksjonelle valg

- Sensitive temaer (kolonihistorie, slaveri, inkvisisjon, diktatur,
  politisk vold, gentrifisering, masseturisme) er omtalt nøkternt i
  `desc`, `popupDesc`, `quiz_profile.must_include` og
  `quiz_profile.avoid_angles`.
- `Mouraria-aksen` og `Cais do Sodré`-stasjonen er bevisst skrevet om
  bystruktur, transport og handel for å unngå overlapp med eksisterende
  fado- og nattlivsentries.
- `Casa dos Estudantes do Império` er klassifisert som
  `litteratur` med Badge-sub `forfattere_og_litteratursteder`/
  `migrasjon_og_minoritetshistorie` for å speile det intellektuelt-
  litterære miljøet rundt CEI; alternativ plassering under `politikk` er
  vurdert, men litteraturen rundt huset (Noémia de Sousa, Alda Espírito
  Santo m.fl.) gjør litteratur-kategoriseringen forsvarlig.
- `Bordalo Pinheiro`-museet ligger under `kunst` (Badge-sub
  `tegning_og_grafikk`), ikke `media`, fordi samlingen er en
  kunstnerinstitusjon med tegninger og keramikk, ikke en
  pressesamling.
- `Hemeroteca Municipal` er plassert under `litteratur`
  (Badge-sub `sakprosa`) som videreføring av `Biblioteca Nacional de
  Portugal`-logikken; en alternativ plassering under `media` er mulig,
  men eksisterende Lisboa-litteraturentries dekker arkiv-/biblioteks-
  geografien best.

## Endringer utenfor mandatets ramme

Ingen. Det er ikke lagt inn nye `emne_ids`, ikke endret eksisterende
Lisboa-entries, ikke endret Oslo-/Norge-data, ikke gjort endringer i
appkode eller UI, og ikke opprettet nye emnefiler.
