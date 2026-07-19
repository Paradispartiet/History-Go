# Oppdag Kvadraturen — BaBYvandring Kunst completeness audit

Dato: 2026-07-19

## Konklusjon

BaBYvandring Kunst er allerede fullstendig representert i History Go gjennom eksisterende canonical foreldre og eksisterende Wonderkammer `actual_site_treasure`-kamre.

Ingen nye canonical steder, koordinater eller Wonderkammer-kamre skal opprettes for denne vandringen.

Den barne-/babyvennlige innrammingen er en rute- og formidlingskontekst, ikke en ny fysisk stedshistorie. Å duplisere de samme åtte kunstverkene med egne `baby`-ID-er ville gitt parallelle kopier av identisk fysisk innhold og svekket canonical-modellen.

## Offisiell rute

Kilde: Oppdag Kvadraturen / Oslo kommune

- https://www.oppdagkvadraturen.no/vandringer/babyvandring-kunst

Ruten har åtte stopp:

1. Hansken — Wenche Gulbransen
2. Marriage — Tony Smith
3. Politihesten Tor — Kirsten Kokkin
4. Den røde prikk — Otto Künzli
5. Sittende pike med hodetelefon — Marit Krogh
6. Johannes Brun — Brynjulf Bergslien
7. Mann med liten håndbevegelse — István Lisztes
8. Lyttende — István Lisztes

## 8/8 canonical gjenbruk

| # | Offisielt stopp | History Go parent | Eksisterende chamber | Status |
|---|---|---|---|---|
| 1 | Hansken | `christiania_torv` | `wk_christiania_torv_hansken_wenche_gulbransen` | Gjenbruk |
| 2 | Marriage | `kontraskjaeret` | `wk_kontraskjaeret_marriage_tony_smith` | Gjenbruk |
| 3 | Politihesten Tor | `myntgatakvartalet` | `wk_myntgatakvartalet_politihesten_tor_kirsten_kokkin` | Gjenbruk |
| 4 | Den røde prikk | `mustadgarden_kongens_gate_3` | `wk_mustadgarden_kongens_gate_3_den_rode_prikk_otto_kunzli` | Gjenbruk |
| 5 | Sittende pike med hodetelefon | `bankplassen` | `wk_bankplassen_sittende_pike_hodetelefon_marit_krogh` | Gjenbruk |
| 6 | Johannes Brun | `bankplassen` | `wk_bankplassen_johannes_brun_brynjulf_bergslien` | Gjenbruk |
| 7 | Mann med liten håndbevegelse | `bankplassen` | `wk_bankplassen_mann_med_liten_handbevegelse_istvan_lisztes` | Gjenbruk |
| 8 | Lyttende | `bankplassen` | `wk_bankplassen_lyttende_istvan_lisztes` | Gjenbruk |

## Datagrunnlag

De sju kamrene uten Den røde prikk ligger i:

- `data/wonderkammer/oslo_oppdag_kvadraturen_art_microplaces_batch_1.json`

Den røde prikk ligger på det fysisk korrekte foreldreankeret Mustadgården i:

- `data/wonderkammer/oslo_oppdag_kvadraturen_art_microplaces_batch_2.json`

Begge filene er allerede registrert i Wonderkammer-manifestet.

## Representasjonsbeslutninger

### Ikke egne BaBY-kamre

BaBYvandringen endrer målgruppe, rekkefølge og formidlingsramme, men ikke identiteten til kunstverkene eller deres fysiske plassering. Eksisterende kamre har allerede:

- korrekt fysisk foreldreanker
- kunstverkets identitet og kunstner
- stedsspesifikk forklaring
- `treasureScope: actual_site_treasure`
- `whereToFind`
- observasjons-/oppdagelseshandlinger
- collectible-/collection-metadata

Det finnes derfor ikke et innholdsgap som rettferdiggjør parallelle kamre.

### Den røde prikk

`Den røde prikk` skal fortsatt ligge som Wonderkammer-mikrosted under `mustadgarden_kongens_gate_3` og ikke få en egen overlappende canonical kartmarkør.

### Bankplassen

De fire Bankplassen/Revierstredet-verkene er separate kamre under samme canonical områdeanker. De skal ikke splittes ut til nye markører bare fordi BaBYvandringen besøker dem som fire separate stopp.

## Completeness-resultat

- Offisielle BaBY-stopp: **8**
- Eksisterende korrekte History Go-foreldre: **8/8**
- Eksisterende presise Wonderkammer-kamre: **8/8**
- Manglende kunstverk: **0**
- Nye canonical steder nødvendig: **0**
- Nye koordinater nødvendig: **0**
- Nye Wonderkammer-kamre nødvendig: **0**

## Oppdag Kvadraturen-status etter denne auditen

BaBYvandring Kunst kan markeres som dekket gjennom gjenbruk av eksisterende kunstlag. Denne auditen skal hindre at senere completeness-pass feilaktig oppretter åtte målgruppebaserte duplikater.
