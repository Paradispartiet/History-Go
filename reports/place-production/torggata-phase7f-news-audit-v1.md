# Torggata – fase 7F Nyheter audit V1

- Dato: 2026-08-14
- Place ID: `torggata`
- Canonical nyhetseier: manifest-lastede Leksikon-oppføringer
- Nyhetsdata: `data/leksikon/places/oslo/by/leksikon_oslo_by_torggata_news.json`
- Runtime: `js/ui/place-popup-tabs.js`
- Status: **KLAR FOR REVIEW**

## Problem og mål

Den manuelle kvalitetsgjennomgangen gjenåpnet Torggata fordi Nyheter-fanen var tom. Et aktivt og innholdsrikt bysted kan ikke godkjennes med tom fane bare fordi repoet ikke allerede inneholder notiser.

Målet i fase 7F er å publisere få, konkrete og daterte 2026-notiser som gjelder selve Torggata, har åpne direkte kilder og ikke låner identiteten til Torggata Bad, Youngstorget eller andre steder med egne place-oppføringer.

## Canonical eier og runtime

Nyheter-fanen leser manifest-lastede ekstraartikler fra `LEKSIKON_BY_PLACE[placeId]`. `classifyArticle()` klassifiserer oppføringer med `type/tags: news_note` som `news_notes`, og `renderNews()` viser dem under «Nyere notiser».

Derfor legges notisene i en egen Leksikon-fil for `place_id: torggata`, og filen registreres i `data/leksikon/manifest.json`. Place-filen får ikke et parallelt, ubrukt `news`-felt.

## Fersksøk 2026-08-14

| Kildeområde | Resultat | Beslutning |
| --- | --- | --- |
| Oslo kommune | Aktiv Oslometer-pilot 1. august–31. oktober 2026; Torggata er eksplisitt blant gatene i testområdet | **Publisert** som aktuell gatenotis |
| Torggata Gateforening | Forsiden annonserer Torggatelangs 13. juni og 19. september 2026 | **Publisert** som planlagt høstnotis 19. september |
| Gateforeningens aktivitetsside | Viser fortsatt høstdato for 2025 | **Avvist som 2026-kilde**; bare den oppdaterte forsiden brukes |
| Lokale medier | Treff om enkeltvirksomheter, enkelthendelser og kriminalitet i eller ved gaten | **Holdt tilbake** fordi de enten gjelder en egen aktør/place, er for smale eller gir en skjev hendelsesdrevet gateprofil |
| Historiske avisnotiser | Vurdert som mulig senere «Gamle nyheter»-lag | **Ikke publisert i denne fasen** uten eksakt åpen avisside, dato og direkte etterprøvbar tekst |

Søket dekker offisiell kommune, stedets gateforening og lokale medier. Tomt repo ble ikke brukt som N/A-grunn.

## Publiserte notiser

### 1. Oslometer-piloten er i gang i Torggata

- ID: `torggata_news_oslometer_2026`
- Hendelsesstart: 2026-08-01
- Gyldig til: 2026-10-31
- Status: aktiv
- Stedskobling: Oslo kommune nevner Torggata eksplisitt i testområdet
- Kilde: https://www.oslo.kommune.no/gate-transport-og-parkering/leie-torg-fortau-og-gater/oslometer-pilot-2026/
- Kontrollert: 2026-08-14

Påstanden er avgrenset til ordningens periode, én-meterregel og hovedvilkår. Notisen påstår ikke effekt på omsetning, støy eller byliv.

### 2. Torggatelangs er annonsert 19. september

- ID: `torggata_news_torggatelangs_september_2026`
- Hendelsesdato: 2026-09-19
- Status: planlagt
- Stedskobling: arrangementet heter Torggatelangs og annonseres av Torggata Gateforening for Torggata-området
- Kilde: https://www.torggata.oslo.no/
- Kontrollert: 2026-08-14

Notisen sier bare at datoen er annonsert og gjengir Gateforeningens korte kategorier handel, servering og aktiviteter. Den utgir ikke den eldre aktivitetssiden med 2025-dato for å være oppdatert.

## Identitets- og proporsjonalitetskontroll

- Ingen notis bruker Torggata Bad eller Rockefeller som stedfortreder for gaten.
- Ingen notis bruker Youngstorget som stedfortreder for gaten.
- Oslometer-notisen gjelder flere gater, men Torggata er eksplisitt navngitt og ordningen påvirker gategrunn langs Torggata direkte.
- Torggatelangs-notisen gjelder gaten/området som helhet, ikke bare én virksomhet.
- To notiser er nok til å gjøre fanen nyttig uten å gjøre den til en generell arrangements- eller kriminalitetsfeed.
- Notisene er ikke Stories; de mangler med vilje narrativ oppblåsing.

## Manuell QA

Kontrollert i data-/runtimekjeden:

1. begge oppføringer har `place_id: torggata`;
2. begge klassifiseres av eksisterende runtime som `news_notes`;
3. hendelsesdato, status, direkte HTTPS-kilde og `verifiedAt` finnes;
4. kildelenken kan vises av `newsCards()`;
5. ingen egen place brukes som parent-place-proxy.

Automatiske tester kan låse schema, manifest, klassifikator, datoer, kilder og køstatus. De beviser ikke alene at den ferdige Nyheter-fanen er visuelt eller redaksjonelt god; ny manuell UI-QA inngår fortsatt i sluttporten.

## Beslutning

**Nyheter-blokkeren er løst av fase 7F** når denne filen, manifestet, backloggen og regresjonstesten er merget og CI er grønn.

Neste blocker i bindende rekkefølge: **Lesespor**.
