# Youngstorget – fase 5 `desc` + `popupDesc` review V1

- Dato: 2026-08-23
- Place ID: `youngstorget`
- Baseline `main`: `7da39fab4381b1671527108d01d8736de51c63f4`
- Canonical Place: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Production packet: `data/places/production/youngstorget.json`
- Source pack: `reports/place-production/content-factory-pilot-01-oslo-sentrum-ost-source-pack-v1.json`
- Schema: `data/places/regler/place_description_production_v4_2.schema.json`
- Validator: `scripts/validate-place-description-production-v4_2.mjs` (`4.2.1`)
- Status på branch: **PRODUSERT – KLAR FOR CI/VALIDATOR**

## 1. Korrigert faktagrunnlag

Den dokumenterte regresjonen er fjernet fra begge synlige description-feltene.

Tidligere tekst slo sammen to ulike milepæler ved å si at Youngstorget «ble anlagt som Nytorvet i 1852».

Ny tekst skiller eksplisitt:

- **1846:** torget ble anlagt/etablert;
- **1852–1951:** `Nytorvet` var offisielt navn;
- **1951:** `Youngstorget` ble offisielt navn.

`year: 1852` beholdes med vilje som eksisterende representativ navnemilepæl. Repoets generelle Place-policy gjør `year` til et anbefalt felt uten universell etableringsårssemantikk, og Torggata viser samme modell ved å ha et representativt `year` som ikke er identisk med første opparbeidelsesår. Production packet låser samtidig `identity.period: 1846–` og metadataSnapshot.year=1852, slik at metadata og source-eid kronologi ikke blandes.

## 2. Omfang

### `desc`

- 55 ord;
- 3 setninger;
- innenfor v4.2-normalområdet 40–80 ord;
- alle setninger har eksplisitt claim-dekning.

### `popupDesc`

- 421 ord;
- 6 avsnitt;
- 26 setninger med `Intl.Segmenter('nb')`-logikk;
- over v4.2-minimum på 300 ord og tre avsnitt;
- alle 26 setninger har eksplisitt claim-dekning.

Teksten er bevisst fyldig. Content Factory er brukt til å unngå gjentatt source discovery, ikke til å redusere innholdsmengden.

## 3. Innholdslag i den nye teksten

Den nye `popupDesc` bygger stedet gjennom konkrete Youngstorget-ankere:

1. anlegget i 1846, Jørgen Young og navnehistorien;
2. marked for landbruksvarer, kveghandel og flytting av markedstrafikk fra Stortorvet;
3. basarbygningen som fysisk markedsspor;
4. arbeiderbevegelsens samlings- og demonstrasjonsbruk;
5. 1. mai-prosesjonen fra Youngstorget til Tullinløkka i 1890, med Arbarks oppgitte deltakerantall;
6. dokumenterte massemøter i 1920- og 1930-årene;
7. Pioneren av Per Palle Storm, avduket i 1958;
8. fredsmonumentet av Hagbart Solløs, reist i 1997;
9. den permanente historiske fotoutstillingen med 24 fotografier;
10. 1990-tallsomformingen og 1996-milepælen med fontenen;
11. nyere kommunale fysiske tiltak på torget;
12. kommunens dokumenterte bruksbredde for demonstrasjoner, markeringer, handel, servering, kultur og arrangementer;
13. konkrete 2026-hendelser: kvinnedagen og 1. mai;
14. kommunens arbeid fra 2023 med balansen mellom hverdagsliv og store arrangementer;
15. torgets konkrete romlige grense og relasjon til Torggata og nabogatene.

## 4. Source → claim → sentence

Production packet har **17 verified claims**.

Kildetypene omfatter:

- Oslo kommune – official;
- Oslo byleksikon – institutional;
- Arbeiderbevegelsens arkiv og bibliotek – archive;
- LO – primary;
- Oslo Museum – institutional.

Description coverage:

- 3/3 setninger har én eller flere claim-ID-er.

Popup coverage:

- 26/26 setninger har én eller flere claim-ID-er.

Text hashes er låst til canonical Place-feltene:

- `desc`: `765c03475dc669b8329dff41176f06b386b54ad6dd1396aa0829e2ec0f5c661a`;
- `popupDesc`: `3427607f379949531537fba8b67225daa56b4041c89a008c6351486761b6db08`.

## 5. Sterke claims og freshness

Ingen av source packens tilbakeholdte sterke «første»-påstander er brukt i synlig tekst:

- ikke «første» 1. mai-demonstrasjonsprosesjon i hovedstaden;
- ikke «første» kvinnedemonstrasjonsprosesjon;
- ikke «første» hovedarrangement for 1. mai på Youngstorget.

1890-hendelsen er formulert bare på nivået kilden faktisk støtter uten den tilbakeholdte superlativen.

Nåtids-/periodiske claims fra Oslo kommune er verifisert `2026-08-23`. De konkrete 2026-hendelsene er behandlet som historiske, datofestede hendelser etter at datoene har passert, ikke som løfter om framtidig gjentakelse.

Planlagte framtidstiltak fra source packen er **ikke** tatt inn i den langsiktige description-teksten; de hører bedre hjemme i den senere Nyheter/current-status-fasen med egen ferskhetsport.

## 6. Anti-generisk QA

### `name-swap`

**PASS.**

Teksten kan ikke flyttes til et annet Oslo-torg ved å bytte navn. Den inneholder Youngstorget-spesifikke tidsmarkører, navn, markedshistorie, 1890-rute, Pioneren, fredsmonumentet, fotoutstillingen, 1996-omforming og eksplisitt gategeometri.

### `cross-place duplicate`

**PASS i denne fase-diffen.**

Ingen avsnitt er kopiert fra Torggata. Shared cluster research er bare brukt der source scope inkluderer Youngstorget. TØI-claimet for Torggata/Brugata er ikke brukt i Youngstorget-teksten.

### `place-specific evidence anchors`

**PASS.**

Alle seks popupavsnitt har konkrete fysiske, kronologiske eller hendelsesbaserte Youngstorget-ankere.

### `source → claim → text`

**PASS på production-packet-nivå.**

Alle synlige setninger er dekket av verified claims. CI/validator skal fortsatt være den tekniske sluttporten før merge.

### `local experience`

**PASS.**

Teksten peker på elementer som faktisk kan forstås i det fysiske plassrommet: basaren, Pioneren, fredsmonumentet, fotoutstillingen, fontenen/omformingen og gatene som rammer inn torget.

### `fullness`

**PASS for description-fasen.**

Den gamle popupen var i stor grad en generell forklaring på demonstrasjonslogistikk, medier og demokratisk offentlighet. Den nye teksten bruker 421 ord på dokumentert Youngstorget-historie og nåtidsforankring uten å redusere omfanget til et minimum.

## 7. Sanert meta-/proxytekst

Følgende typer tekst er fjernet fra description-flaten:

- bruker-/spillmeta som «markøren gjelder» og «På stedet kan History Go ...»;
- generiske instruksjoner om scene, lyd, vakter og presseområder uten Youngstorget-spesifikk kilde;
- generiske teorisetninger om demokrati og regulert uenighet som ikke hører hjemme som place-fakta;
- proxyargumentasjon der nærheten til organisasjonsbygg blir brukt som erstatning for faktiske Youngstorget-hendelser;
- generelle mediepåstander som ikke hadde source-eid dekning i description-pakken.

Det eksisterende mediert-offentlighetsemnet er ikke slettet; fase 4 viste at det er en legitim fagkobling. Men fagkoblingen gir ikke blankofullmakt til å skrive udokumentert medieteori i `popupDesc`.

## 8. Avgrensning

Denne fasen endrer bare:

- canonical `desc`;
- canonical `popupDesc`;
- ny v4.2 description production packet;
- fase-5-rapport/workcard.

Følgende er bevisst ikke sanert eller produsert i samme fase:

- legacy `rounds`;
- `layers.populaerkultur`;
- People;
- Brands;
- Objects;
- Stories;
- Før/etter;
- Nyheter;
- Lesespor;
- source_summary;
- bilder;
- språk;
- onsite.

De følger egne checklist-faser og egne prior-work-/evidensporter.

## 9. Fasebeslutning før CI

```text
DESC: PRODUSERT
POPUPDESC: PRODUSERT
DESCRIPTION PACKAGE: ready_v4_2 KANDIDAT
CLAIMS: 17/17 verified
DESC SENTENCE COVERAGE: 3/3
POPUP SENTENCE COVERAGE: 26/26
1846/1852 REGRESJON: RETTET I SYNLIG TEKST
HELD-BACK STRONG CLAIMS PUBLISERT: NEI
NAME-SWAP: PASS
CROSS-PLACE DUPLICATE: PASS
PLACE-SPECIFIC ANCHORS: PASS
LOCAL EXPERIENCE: PASS
FULLNESS: PASS FOR DESCRIPTION-FASEN
CI/VALIDATOR: GJENSTÅR FØR MERGE
```

Hvis CI/validator er grønn, kan fase 5 klassifiseres **FERDIG**. Neste fase er **6 – strukturerte place-profiler**, der temporal/spatial/history-struktur materialiseres bare der source packen gir reell substans.