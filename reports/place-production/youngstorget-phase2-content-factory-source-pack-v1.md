# Youngstorget – fase 2 Content Factory source/claim pack V1

- Dato: 2026-08-23
- Place ID: `youngstorget`
- Baseline `main`: `902a01c339fc3af75ac9c1d3053d1a06ca1c5136`
- Shared pack: `reports/place-production/content-factory-pilot-01-oslo-sentrum-ost-source-pack-v1.json`
- Content Factory-kontrakt: `data/places/regler/content_factory_v1.json`
- Status: **SOURCE/CLAIM PACK MATERIALISERT – KLAR FOR REVIEW**
- Brukerrettet/canonical innhold endret i fasen: **NEI**

## 1. Hva fase 2 faktisk har gjort

Denne fasen tester Content Factory som researchmetode, ikke som innholdssnarvei.

Det er bygget én delt source/claim-pakke for klyngen:

`Torggata → Youngstorget → Storgata / Brugata–Storgata`

Pakken har alle obligatoriske Content Factory-felter:

- cluster/family-id og scope;
- eksplisitt liste over vurderte Places;
- source registry;
- claim-bank;
- entity relations;
- conflicts/uncertainties;
- held-back claims;
- research gaps per Place;
- freshness notes;
- separat økonomi-/gjenbruksmåling.

Approval-unit er fortsatt **kun `youngstorget`**. Storgata og Brugata/Storgata er downstream seed/evidence, ikke batch-godkjente steder.

## 2. Source registry

Pakken inneholder **12 kilderegistre**.

### Youngstorget-spesifikke hovedkilder

1. Oslo kommune – Youngstorget: etablering, dagens bruk, basar, kunst, historisk fotoutstilling, gjennomførte tiltak og planlagte tiltak.
2. Oslo byleksikon – Youngstorget: identitet, 1846-anlegg, 1852–1951 Nytorvet, 1951-navn, marked, arbeiderbevegelse, krig, Lilletinget, 1990-tallsendring og monumenter.
3. Arbeiderbevegelsens arkiv og bibliotek – «Det røde torg»: historisk plassbruk, marked, demonstrasjoner, arbeiderbevegelse og fysisk endring.
4. Arbeiderbevegelsens arkiv og bibliotek – Youngstorget image series: historiske motiv/captions som researchgrunnlag; ikke automatisk publiseringsrett.
5. Arbark – Åttetimersdagen: dokumentert 1. mai 1890-hendelse.
6. LO – 1. mai 2026: fersk, hendelsesspesifikk bruk av Youngstorget.
7. Oslo Museum – Kvinnedagen 2026: fersk, hendelsesspesifikk bruk av Youngstorget.
8. Oslo kommune – bylivsanalyse Youngstorget/Storgata: områdekontekst, eksplisitt holdt adskilt fra place-spesifikke fakta.

### Gjenbrukte / downstream cluster-kilder

9. TØI 1581/2017 – **gjenbrukt fra Torggata source base** og eksplisitt scoped til `torggata` + ikke-Place-entiteten `street:brugata`; den gjelder ikke Youngstorget, Storgata eller rusmiljø-Place via nærhet.
10. Oslo byleksikon – Storgata: downstream Storgata-seed.
11. Oslo byleksikon – Brugata: holdes på `street:brugata` inntil canonical bare-Brugata-eier eventuelt finnes.
12. Oslo kommune – åpent rusmiljø Brugata/Storgata: **gjenbrukt fra canonical `brugata_storgata_rusmiljo`**, ikke restemplet på hele Brugata, Storgata eller Youngstorget.

## 3. Youngstorget-claims som nå er eksplisitt verifisert/scopet

Claim-banken skiller blant annet:

- torget ble anlagt/etablert i **1846**;
- `Nytorvet` var offisielt navn **1852–1951**;
- `Youngstorget` ble offisielt navn i **1951**, knyttet til Jørgen Young;
- historisk markeds-/kveghandelsbruk;
- basaren som fysisk markedsrelatert element;
- `Pioneren` av Per Palle Storm, avduket 1958, som Object/kunst-kandidat;
- Fredsmonumentet av Hagbart Solløs, reist 1997, som Object/minnesmerke-kandidat;
- permanent historisk fotoutstilling med 24 fotografier;
- kommunens dokumenterte nåtidsbruk av torget til demonstrasjoner, markeringer, handel, servering, kultur og arrangementer;
- kommunale utviklingstiltak fra 2023 og framover;
- gjennomførte oppgraderinger;
- planlagte tiltak, eksplisitt markert `current_volatile`;
- 1. mai-prosesjonen fra Youngstorget i 1890 uten å publisere den foreløpig som et ubetinget «første»-claim;
- tilbakevendende arbeiderbevegelses-/demonstrasjonsbruk;
- konkrete 2026-hendelser for 1. mai og 8. mars;
- 1990-talls/1996-omarbeiding som before/after-researchspor.

## 4. Claims som bevisst er holdt tilbake

Content Factory-pakken demonstrerer også at gjenbruk ikke betyr lavere evidenskrav.

Følgende sterke påstander er **ikke frigitt for publisering** ennå:

- at 1890 var den første 1. mai-demonstrasjonsprosesjonen i hovedstaden;
- at 1898 var den første kvinnedemonstrasjonsprosesjonen;
- at 1956 var første gang 1. mai-hovedarrangementet ble holdt på Youngstorget.

Arbark-materialet gir gode historiske holdepunkter, men flere Arbark-sider er fortsatt samme institusjon. Description-kontrakten krever uavhengig ekstra evidens for sterke «første»-claims.

Også disse kandidatene er eksplisitt avvist:

- at Youngstorgets eksisterende Brand-mappings automatisk er riktige bare fordi virksomhetene ligger nær torget;
- at TØIs Brugata-mobilitetsdata automatisk gjelder `brugata_storgata_rusmiljo`.

## 5. Dokumentert Content Factory-gjenbruk

Fase 2 registrerer foreløpig:

- **2 kilder gjenbrukt direkte fra eksisterende History GO-research/proveniens**;
- **10 nye eksterne kilder lagt til cluster-pakken**;
- **5 generiske/scope-ugyldige kandidater eksplisitt avvist**.

Det viktigste gjenbruket er ikke tallet i seg selv. Én kontrollert Youngstorget-kildepass kan nå støtte flere senere subsystemfaser — description, history, Objects, current use/news, before/after, quiz/knowledge og relations — uten at de samme kildene må oppdages på nytt for hver flate.

Tallene er **aldri completion- eller kvalitetsmål**.

## 6. Researchgap som fortsatt er obligatoriske

Source packen erklærer ikke Youngstorget ferdig. Den låser blant annet disse senere gapene:

1. uavhengig kilde for sterke «første»-claims dersom de skal brukes;
2. metadata-/`year`-semantikk i v4.2 description production package;
3. canonical Object-ID/eierskap for Pioneren, Fredsmonumentet, fontenen og basaren;
4. full own-place People-audit av de eksisterende 22+ koblingene;
5. full own-place Brand-audit av `internasjonalen`, `mono`, `sentrum_scene`, `stratos`;
6. chronology/Story-grenser;
7. before/after-bilder med provenance og publiseringsrett;
8. Språkleksikon-research, ikke automatisk N/A;
9. ferskkontroll av current/future kommunale tiltak før nyhets-/nåtidsflate godkjennes;
10. Lesespor-relevans/tilgang/kvalitet;
11. route/related-relasjoner bare ved faktisk narrativ/historisk forbindelse.

## 7. Anti-generisk kontroll i source packen

Pakken håndhever piloten før tekstfasen:

- Torggata-evidens blir ikke Youngstorget-evidens ved nærhet;
- Storgata-evidens blir ikke Youngstorget-evidens ved områdekontekst;
- Brugata-gatehistorie blir ikke rusmiljøhistorie ved navneoverlapp;
- nabobygg og organisasjoner blir ikke Youngstorget-People/Brands/Stories uten eksplisitt relasjon;
- historiske bilder er research-kandidater, ikke automatisk lisensierte assets;
- nåtids- og planclaims får freshness-status og kvalifisering.

Dette er den praktiske `source → claim → place scope`-porten som skal gjøre senere produksjon både billigere og strengere.

## 8. Fase-2 beslutning

```text
SOURCE PACK: MATERIALISERT
APPROVAL UNIT: youngstorget
SHARED RESEARCH: JA, KUN MED EKSPLISITT SCOPE
TØI TORGGT/BRUGATA → YOUNGSTORGET: NEI
TØI BRUGATA → RUSMILJØ-PLACE: NEI
STRONG FIRST-CLAIMS: HELD BACK TIL UAVHENGIG KILDE
CANONICAL USER CONTENT CHANGED: NEI
SOURCE PACK SUFFICIENT TO START NEXT PHASES: JA
SOURCE PACK SUFFICIENT TO CLOSE ALL YOUNGSTORGET SURFACES: NEI
NESTE FASE: 3 – koordinater/geometri, prior-work gate
```

Hvis en senere checklistflate mangler evidens, er korrekt Content Factory-adferd **mer Youngstorget-spesifikk research**, ikke kortere innhold, N/A av budsjettgrunner eller generisk tekst.