# Bispelokket people batch 1 validation

Dato: 2026-07-20

## Batchbeslutning

Denne batchen oppretter ingen ny person. Eksisterende canonical `guttorm_bruskeland` gjenbrukes og beholder `helsfyr` som primært `placeId`.

## Canonical audit

- Canonical ID: `guttorm_bruskeland`
- Eksisterende fil: `data/people/by/oslo/helsfyr/guttorm_bruskeland.json`
- Primæranker beholdt: `helsfyr`
- Ny sekundær stedskobling: `bispelokket`
- Ingen manifestendring er nødvendig.
- Ingen ny people-ID opprettes.

## Streng stedsgate

Guttorm Bruskeland tas inn på Bispelokket fordi han eksplisitt krediteres som arkitekten som tegnet trafikkanlegget. Koblingen gjelder dermed konkret ansvar for det fysiske Bispelokket, ikke en generell tilknytning til norsk modernisme, samferdsel eller Bjørvika.

To separate Aftenposten-artikler krediterer Bruskeland som arkitekt for Bispelokket. Den ene faktaboksen oppgir Statens vegvesen som kilde for Bispelokket-fakta. Kildene daterer ferdigstillelsen til 1967. Denne batchen endrer ikke den eksisterende canonical place-recorden eller dens årsfelt.

## Endringer

- `bispelokket` lagt til i `places` på eksisterende `guttorm_bruskeland`.
- `bispelokket`, `trafikkarkitektur` og `bilby` lagt til som tags.
- `popupDesc` utvidet med den konkrete arkitektrollen.
- To Bispelokket-kilder lagt til i `source_urls`.

## Kilder

- Aftenposten: «En nekrolog over Bispelokket» — faktaboks: Bispelokket var tegnet av arkitekt Guttorm Bruskeland og sto ferdig i 1967.
- Aftenposten: «Stor kunst på 60-tallet» — omtaler Bispelokket som tegnet av Guttorm Bruskeland; faktaboksen oppgir Statens vegvesen som kilde.
- Sporveien: Helsfyr stasjon — eksisterende kilde for Bruskelands primære canonical Helsfyr-kobling.

## Forventet datakontrakt

`placeId` og øvrige felter som brukes i den genererte Civication-personindeksen er uendret, så batchen skal ikke kreve en innholdsendring i `data/Civication/historyPeople_index.json`. Ordinær `bash scripts/check-people.sh` skal verifisere at indeksen fortsatt er i sync, at people-ID-er er unike og at alle place-referanser er gyldige.
