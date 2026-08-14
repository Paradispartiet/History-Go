# Torggata – gjenåpnet fase 7G Lesespor audit V1

- Dato: 2026-08-14
- Place ID: `torggata`
- Canonical eier: `data/lesespor/manifest.json`
- Ny datafil: `data/lesespor/oslo/lesespor_oslo_by_torggata.json`
- Runtime: `js/ui/place-popup-tabs.js`
- Status: **KLAR FOR REVIEW**

## Problem og mål

Manuell kvalitetsgjennomgang gjenåpnet Torggata fordi Lesespor-fanen var tom. Det gamle fasekortet viste til betalingslåste kandidater og avsluttet søket uten å etablere åpne alternativer.

Målet er et lite, tydelig og direkte lesbart fordypningsspor om selve gaten. Oppføringene skal tilføre ulike lesemåter — historisk, empirisk og fysisk/faglig — og ikke bare gjenta Kilder-fanen som en uannotert lenkeliste.

## Repo-søk

Alle 14 Oslo-filer som er lastet av `data/lesespor/manifest.json` ble søkt etter `torggata` og Torggata-varianter. Ingen manifest-lastet Torggata-oppføring fantes 2026-08-14.

Den tidligere generelle merknaden om betalingslåste Torggata-koblinger kunne derfor ikke brukes som dokumentasjon for dagens brukerflate. Betalingsmur er uansett en holdback-grunn, ikke en N/A-grunn for å stoppe søket etter åpne alternativer.

## Eksternt søk og utvalg

| Kildeeier | Åpen/direkte | Torggata-kobling | Beslutning |
| --- | --- | --- | --- |
| Oslo byleksikon – Torggata | Ja, full gateartikkel | Hele gateløpet, historien og bygninger | **Publisert** |
| Transportøkonomisk institutt – rapport 1581/2017 | Ja, åpent sammendrag og lenke til hele rapporten | Videodata, fart og interaksjoner i Torggata/Brugata | **Publisert** |
| Norske landskapsarkitekters forening – Torggata | Ja, full prosjektpresentasjon | Gateprofil, materialer, aktører og prosjektfakta | **Publisert** |
| Arkitektur skaper verdi – Torggata | Ja | Ombygging og påståtte sosiale/økonomiske resultater | **Holdt som kilde, ikke fjerde Lesespor**; tre valgte spor gir bedre balanse og mindre duplisering |
| Torggata Gateforening | Ja | Gate-/områdepresentasjon | **Holdt som Nyheter/Kilde**; mindre egnet som selvstendig fordypning |
| Torggata Bad-artikler | Flere er åpne | Eget History GO-place | **Avvist som parent-place-spor** |

## Publiserte Lesespor

### 1. Oslo byleksikon – «Torggata»

- ID: `lesespor_torggata_byleksikon_001`
- Type: leksikonartikkel
- Tilgang: åpen
- Rettighetshåndtering: `link_only`
- Direkte URL: https://oslobyleksikon.no/index.php/Torggata
- Kontrollert: 2026-08-14

Sporet gir sammenhengende historisk lesning av gaten fra Stortorvet til Ankertorget, med opparbeiding, navneform, forretnings- og underholdningshistorie og bygninger langs gaten.

### 2. TØI – «Sykling i gågater: Torggata og Brugata i Oslo»

- ID: `lesespor_torggata_toi_2017_001`
- Forfattere: Torkel Bjørnskau, Oddrun Helen Hagen og Ole Aasvik
- Rapport: 1581/2017
- Type: forskningsrapport
- Tilgang: åpent sammendrag og lenke til hele rapporten
- Rettighetshåndtering: `link_only`
- Direkte URL: https://www.toi.no/publikasjoner/sykling-i-gagater-trafikkomfang-samhandling-og-konflikter-mellom-syklister-og-fotgjengere-i-torggata-og-brugata-i-oslo
- Kontrollert: 2026-08-14

Sporet er metodisk og empirisk: videoregistrering, fartsmåling, interaksjoner og konflikter. Det er mer enn en bakgrunnskilde fordi leseren kan følge metode og resultater i en hel rapport.

### 3. NLA – «Torggata»

- ID: `lesespor_torggata_nla_001`
- Type: prosjektpresentasjon
- Prosjekt ferdigstilt: 2014
- Tilgang: åpen
- Rettighetshåndtering: `link_only`
- Direkte URL: https://landskapsarkitektur.no/prosjekter/torggata
- Kontrollert: 2026-08-14

Sporet forklarer den asymmetriske gateprofilen, materialene, prioriteringen av gående og syklende og navngitte prosjektaktører. `year: 2014` er eksplisitt prosjektets ferdigstillelsesår, ikke påstått publiseringsdato.

## Identitet, balanse og rettigheter

- Alle tre oppføringer har eksplisitt `place_ids: ["torggata"]`.
- Ingen oppføring bruker Torggata Bad, Rockefeller eller Youngstorget som stedfortreder for gaten.
- Oslo byleksikon gir historie, TØI gir empirisk forskning, og NLA gir detaljert fysisk/faglig lesning.
- Tre spor er proporsjonalt: nok til en reell fane, men ikke en generell lenkekatalog.
- Bare metadata, egen kort relevansbeskrivelse og ekstern lenke lagres. Ingen artikkel- eller rapporttekst kopieres.
- `access: open` ble kontrollert 2026-08-14; fremtidig tilgangsendring må føre til ny review.

## Runtime-QA

`renderLesespor()`:

1. krever at `place_ids` inneholder aktiv place-ID;
2. filtrerer bort treff med betalingsmur-/abonnementsmarkører;
3. sorterer daterte spor;
4. viser tittel, forfatter, publikasjon, år/dato, type, kort relevans og direkte HTTPS-lenke.

De tre nye oppføringene består denne kontrakten. Automatiske tester kan låse data, manifest, åpningstilgang, URL-er og runtimefilter, men beviser ikke alene at den ferdige fanen er visuelt eller redaksjonelt god. Ny manuell UI-QA inngår fortsatt i sluttporten.

## Beslutning

**Lesespor-blokkeren er løst av gjenåpnet fase 7G** når data, manifest, backlog, workcard og test er merget med grønn CI.

Neste blocker i bindende rekkefølge: **Mer**.
