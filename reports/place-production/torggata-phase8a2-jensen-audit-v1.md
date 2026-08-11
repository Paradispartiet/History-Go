# Torggata – fase 8A2 Jensen-handel audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Underfase: 8A2 – Jensen-familiens gatehandel
- Baseline: fase 8A1 / PR #4831
- Profilstandard: `people_profile_v1.0`
- Status: **MATERIALISERT OG KLAR FOR MERGE**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT PÅ FERSK MAIN
CANONICAL DUPLIKATER: ingen av de fem Jensen-personene finnes som manifest-lastet People-record
EKSISTERENDE TREFF: Torggata-place, kilde-/auditmateriale og eldre research – ikke People-profiler
BESLUTNING: REELT NYTT PEOPLE-ARBEID; opprett fem profiler samlet for konsistent familie- og adressekontroll
```

## Kilder og kildekonflikt

Hovedkilden er Oslo byleksikons Torggata-artikkel, som eksplisitt fremhever Jensen-familien fordi den tidligere hadde fire forretninger i gaten. For Adelsten Jensen brukes i tillegg den dedikerte Oslo byleksikon-artikkelen. Den oppgir 1866–1918, grunnleggelse i Torggata 2 i 1890 og flytting til Torggata 1 i 1901. Dette korrigerer 8A-preflightens eldre 1866–1916 / «nr. 1 fra 1893»-formulering. Peter Marinius Jensens identitet, levetid og yrkesbetegnelse som kjøpmann krysskontrolleres mot Store norske leksikons biografi om sønnen Ludvig Irgens-Jensen.

## Materialiserte profiler

| ID | Person | Torggata-rolle | Primærår |
| --- | --- | --- | --- |
| `ludvig_christian_jensen` | Ludvig Christian Jensen | Ludvig Jensen & Co., Torggata 5a; bosted i nr. 5 | 1873 |
| `adelsten_jensen` | Adelsten Jensen | startet i Torggata 2; Hasselgården nr. 1 fra 1901 | 1890 |
| `peter_marinius_jensen` | Peter Marinius Jensen | P. M. Jensen, Torggata 5b | 1896 |
| `karl_a_jensen` | Karl A. Jensen | vilt- og lakseforretning, Torggata 7 | 1914 |
| `thorvald_jensen` | Thorvald Jensen | kompanjong i farens Ludvig Jensen & Co. | ikke datert i kilden |

Alle fem har egen claims-fil, felt–claim-paritet, setning–claim-paritet, eksplisitt Torggata-kobling, sikre HTTPS-kilder og tomme bildefelt fremfor oppdiktede eller lisensielt uklare portretter.

## Avgrensning

8A2 lager ikke butikkatalog og utvider ikke til andre Jensen-navn bare fordi de har handelstilknytning i Oslo. Klyngen er begrenset til familien som Oslo byleksikon selv fremhever som særpreget for Torggata. Axel Jensen-bedriften i Torggata 13 er et annet familiefirma og inngår ikke i denne klyngen.

## Neste steg

Etter merge går 8A videre til **8A3 – dokumenterte beboere, arbeidende og minnespor**. 8A som helhet lukkes først etter 8A3 og People-rundingens UI-kontroll.
