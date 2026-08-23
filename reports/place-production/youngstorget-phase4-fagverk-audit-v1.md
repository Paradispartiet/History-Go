# Youngstorget – fase 4 kategori, Badges, emner og Fagverk V1

- Dato: 2026-08-23
- Place ID: `youngstorget`
- Baseline `main`: `68080524e50489d45b78d8d18fc09a5ca1e6f657`
- Canonical Place: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Source pack: `reports/place-production/content-factory-pilot-01-oslo-sentrum-ost-source-pack-v1.json`
- Styrende kontrakter: `docs/PLACE_PRODUCTION_CHECKLIST.md`, `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`, `docs/FAGVERK.md`, `docs/FAGVERK_NAVIGATION.md`
- Status: **ALLEREDE FERDIG – INGEN FAGDATAENDRING**

## 1. Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: category=politikk; to canonicale politikk-underbadges; tre canonicale em_pol_*; politikkfaget materialisert; relevante kapitler chapter_ready og permanent auditert
KONKRET REGRESJONSEVIDENS: INGEN i kategori/underbadge/emne/Fagverk-koblingen
KLASSIFISERING: ALLEREDE FERDIG
BESLUTNING: BEHOLD eksisterende fagdata; ikke legg til emner eller underbadges for å fylle felt
```

Fase 4 vurderer den eksisterende koblingen på nytt etter dagens kontrakter. Den bruker ikke antall ID-er som kvalitetsmål: Fagverk-kontrakten krever faglig relevans og heldekning, men forbyr tallkvoter som grunnlag for fyllstoff eller kunstige koblinger.

## 2. Primærkategori – `politikk`

**Beslutning: BEHOLD.**

Youngstorget er i source packen dokumentert som et offentlig torg med langvarig bruk til blant annet arbeiderbevegelse, organisert mobilisering, demonstrasjoner, markeringer og andre politiske samlinger. Place-identiteten er selve torget/byrommet, ikke Folkets Hus eller andre naboinstitusjoner.

`politikk` er derfor den korrekte primærkategorien for den eksisterende Place-recorden. Det opprettes ingen parallell Place i `by`, `historie`, `media` eller andre kategorier for å uttrykke tverrfaglige lag.

## 3. Underbadges

Canonical Place har:

- `arbeiderbevegelse`
- `aktivisme_og_protest`

Begge ID-ene finnes i canonical `data/badges/politikk.json`.

### `arbeiderbevegelse` – BEHOLD

Source packen dokumenterer Youngstorget som tilbakevendende samlings- og demonstrasjonssted for arbeiderbevegelsen og fagbevegelsen, med historisk møte- og mobiliseringsbruk som er direkte knyttet til selve torget.

Dette er en place-spesifikk kobling, ikke en avledning fra nærheten til Folkets Hus.

### `aktivisme_og_protest` – BEHOLD

Source packen dokumenterer demonstrasjoner, politiske markeringer og kollektiv mobilisering på selve torget. Koblingen er derfor fysisk og hendelsesmessig forankret i Youngstorget.

### Ingen nye underbadges

Det legges ikke til flere underbadges bare fordi source packen også inneholder markedshistorie, mediebruk eller byromsendringer. Underbadges skal uttrykke presise hovedkoblinger, ikke fungere som en liste over alle mulige tolkningslag.

## 4. Emne-audit

Canonical Place har tre `emne_ids`.

### `em_pol_arbeidsliv_kollektiv_kamp` – BEHOLD

- direkte relevant for Youngstorgets dokumenterte fagbevegelses- og arbeiderbevegelseshistorie;
- ligger i det materialiserte Fagverk-kapittelet `konflikt-makt-sivilsamfunn`;
- kapittelet har `editorialStatus: chapter_ready`;
- permanent kapittelaudit har `status: passed` og bekrefter blant annet `registryAndRuntimeSynced: true`, inspectable sources og full claim trace.

Koblingen gir en faglig ramme for arbeidsliv, kollektiv organisering og mobilisering uten å gjøre torget til en erstatning for organisasjonenes egne Places.

### `em_pol_demonstrasjoner_protest` – BEHOLD

- direkte relevant for dokumenterte demonstrasjoner og torgets rolle som mobiliseringsrom;
- ligger i samme materialiserte `konflikt-makt-sivilsamfunn`-kapittel;
- runtime-manifestet mapper emnet eksplisitt til dette kapittelet;
- permanent kapittelaudit er grønn.

Koblingen er stedsspesifikk: den bygger på faktiske protest-/forsamlingshendelser på Youngstorget, ikke på at torget generelt er et offentlig rom.

### `em_pol_mediert_offentlighet` – BEHOLD

Denne ID-en er ikke en generell medie-tag eller en tilfeldig senere kobling. Den ble opprettet gjennom en egen Youngstorget-audit som fjernet feil familie-ID `em_pop_digital_offentlighet` og erstattet den med et fullverdig politikk-emne etter manuell place-vurdering.

Den tidligere auditen dokumenterte at Youngstorgets politikkdata også har et reelt mediert offentlighetslag: TV, direktesending, presse, breaking-news-situasjoner og politisk handling som blir offentlig representert.

I dagens Fagverk:

- `em_pol_mediert_offentlighet` er eksplisitt med i `data/fagverk/politikk/parlamentarisme.json`;
- kapittelet `parlamentarisme` har `editorialStatus: chapter_ready`;
- runtime-manifestet mapper emnet eksplisitt til `parlamentarisme`;
- permanent parlamentarisme-audit har `status: passed`, `registryAndRuntimeSynced: true` og `completeEditorialStatus: true`.

Koblingen beholdes, men senere description-/popuptekst må fortsatt bruke konkrete place-kilder og ikke gjenta udokumenterte generelle utsagn om «mediesentrum» bare fordi eldre tags finnes.

## 5. Emner som ikke legges til i fase 4

Source packen kunne gjøre flere politikk-emner tematisk plausible, blant annet bred offentlighet, sivilsamfunn eller politiske minnesteder. De legges **ikke** til automatisk.

Begrunnelse:

- eksisterende tre emner dekker Youngstorgets tydeligste politiske læringsspor;
- Fagverk-kontrakten har ingen emnekvote;
- overlappende emner kan gjøre stedssiden mindre presis;
- senere ny strukturert profil eller popupflate kan bare utløse en ny emnekobling dersom den viser et reelt, selvstendig kunnskapsbehov som dagens tre ikke dekker.

Fullness skal oppnås gjennom rikt, stedsspesifikt innhold – ikke gjennom flere metadata-ID-er.

## 6. Fagverk-routing og runtime

Politikk er teknisk materialisert i `data/fagverk/fagverk_portal.json`:

- badge: `data/fag/politikk/merke_politikk.html`;
- subject: `fagverk.html?subject=politikk`;
- `subjectStatus: materialized`.

Canonical stedsside er:

`fagverk-sted.html?place=youngstorget`

Den generiske stedssiden har permanente regresjonstester som krever:

- én generisk Fagverk-rute for canonical Places;
- ingen hardkodet Politikk-navigasjon for ikke-Politikk-steder;
- Politikk-overlaget kan bare kjøre når Place har eksplisitt Politikk-identitet gjennom `category: politikk`, `em_pol_*` eller sekundærbadge `politikk`;
- den resolvede modellen må fortsatt ha `subject === 'politikk'` før Politikk-overlaget kan skrive til DOM.

Youngstorget oppfyller den eksplisitte Politikk-identiteten både gjennom `category: politikk` og tre `em_pol_*`. Den generiske runtime-rettelsen som tidligere ble gjort under Torggata-produksjonen er derfor korrekt for Youngstorget: den blokkerer feil Politikk-lekkasje til andre steder uten å blokkere Youngstorgets legitime Politikk-lag.

`tests/politikk-fag-integration.test.mjs` låser i tillegg at politikkfaget leser canonical runtime-manifest, badge, pensum, emner, curriculum, concepts og Fagverk-registry og at place-integrasjonen bruker `HGPolitikkFagModel.resolvePlace`.

## 7. Kapittel- og runtimebevis

| Youngstorget-emne | Fagverk-kapittel | Kapittelstatus | Permanent audit |
| --- | --- | --- | --- |
| `em_pol_arbeidsliv_kollektiv_kamp` | `konflikt-makt-sivilsamfunn` | `chapter_ready` | `passed` |
| `em_pol_demonstrasjoner_protest` | `konflikt-makt-sivilsamfunn` | `chapter_ready` | `passed` |
| `em_pol_mediert_offentlighet` | `parlamentarisme` | `chapter_ready` | `passed` |

Begge kapittelauditene bekrefter registry/runtime-synkronisering og full redaksjonell/claim-sporbar kontrakt for de aktuelle kapitlene.

## 8. Content Factory-effekt i fase 4

Fase 4 krevde **ingen ny modellproduksjon og ingen ny fagresearch** fordi:

- source packen allerede hadde tilstrekkelig place-spesifikk evidens til å vurdere eksisterende koblinger;
- canonical badge- og emne-ID-er var allerede materialisert;
- tidligere place-spesifikk audit forklarte hvorfor `em_pol_mediert_offentlighet` finnes;
- Fagverk-kapitler, runtime-manifest og permanente audits ga deterministisk integrasjonsbevis.

Dette er riktig Content Factory-effekt: eksisterende kvalitet bevares og verifiseres i stedet for å genereres på nytt.

Det er **ikke** et argument for å redusere innholdsmengden i fase 5 eller senere.

## 9. Fasebeslutning

```text
SUBSYSTEM: category / underbadges / emne_ids / Fagverk
CATEGORY politikk: BEHOLD
UNDERBADGE arbeiderbevegelse: BEHOLD
UNDERBADGE aktivisme_og_protest: BEHOLD
EMNE em_pol_arbeidsliv_kollektiv_kamp: BEHOLD
EMNE em_pol_demonstrasjoner_protest: BEHOLD
EMNE em_pol_mediert_offentlighet: BEHOLD
NYE EMNER: INGEN – ingen dokumentert mangel som krever dem
NYE UNDERBADGES: INGEN
RUNTIME-/FAGVERK-REGRESJON FUNNET: INGEN
CANONICAL DATA MUTATION: NEI
KLASSIFISERING: ALLEREDE FERDIG
```

Neste fase etter merge er **fase 5 – `desc` + `popupDesc`**, som er første fase i Pilot 01 der canonical brukerrettet Youngstorget-tekst skal endres. Den skal bygge på Content Factory claim-banken, rette 1846/1852-regresjonen, etablere dagens description production package og bevare richness/fullness uten generisk tekst.