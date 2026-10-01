# Skjult utviklermodus i History GO

Status: **canonical runtime- og produktsikkerhetskontrakt for index-appens testmodus**  
Runtime: [`../js/debug/HGTestMode.js`](../js/debug/HGTestMode.js)  
Entrypoint: [`../index.html`](../index.html)  
Sist kontrollert: **2026-07-26**

Dette dokumentet eier reglene for den skjulte utviklermodusen i `index.html`-appen. Runtimefilen eier den faktiske tilstanden og implementasjonen.

## Grunnregel

Testmodus er et utviklerverktøy og vises ikke i den vanlige menyen. Vanlige spillere skal aldri kunne omgå GPS-gaten ved et tilfeldig menytrykk.

Den eneste varige lagringsnøkkelen er:

```text
HG_TEST_MODE
```

Testmodus er ikke autentisering, autorisasjon eller en produksjonsrolle. Den kan ikke overstyre backend-kill-switcher, serverpolicy, privacy-gates, database-rollout eller andre fail-closed produksjonsgrenser.

## Aktivere og deaktivere

På en utviklerenhet kan testmodus aktiveres med:

```text
?hgTest=1
```

Eksempel:

```text
/History-Go/?hgTest=1
```

Den kan deaktiveres med:

```text
?hgTest=0
```

Parameteren fjernes fra adresselinjen etter at den er lest. Resultatet lagres eller fjernes i `localStorage` under `HG_TEST_MODE`.

Fra nettleserkonsollen kan utviklere bruke:

```js
HGTestMode.enable();
HGTestMode.disable();
HGTestMode.isEnabled();
```

`HGTestMode.setEnabled(value)` er runtimegrensen for eksplisitte utviklerverktøy. Endringer sender `hg:testModeChanged` med `{ enabled }`.

## Lastrekkefølge

`index.html` laster `js/debug/HGTestMode.js` før modul-entryen `js/app.js`.

Runtimefilen:

1. leser `hgTest=1` eller `hgTest=0` dersom parameteren finnes;
2. fjerner parameteren fra URL-en;
3. ellers leser den `HG_TEST_MODE` fra `localStorage`;
4. synkroniserer runtimealiasene;
5. fjerner legacy-broen når kritisk boot eller app-boot er ferdig.

## Kompatibilitet

Følgende beholdes som runtimealiaser for eldre kode:

```text
window.HG_TEST_MODE
window.TEST_MODE
window.OPEN_MODE
window.HG_ENV.testMode
window.HG_ENV.openMode
```

Aliasene er ikke egne moduser og skal ikke få separat lagring eller UI.

Den gamle lagringsnøkkelen `HG_OPEN_MODE` er ikke lenger en brukerinnstilling. Runtime kan legge den inn kort under oppstart når testmodus er aktivt og eldre boot-kode trenger broen. Den fjernes ved initialisering og senest når `hg:criticalReady` eller `hg:appReady` er sendt.

## Tillatt bruk

Testmodus kan brukes til:

- eksplisitt GPS-bypass i utvikling og QA;
- runtime health og smoke-tester;
- isolerte demoer og fixtures;
- utviklerkontroller som uttrykkelig leser `HGTestMode.isEnabled()`.

Testmodus gir ikke:

- offentlig knapp, menybryter eller synlig «Unlock all»-kontroll;
- produksjonsdiscovery eller ekte Social Meet-profiler;
- automatisk fallback fra serverfeil til demo-state;
- rett til å skrive til backend, database eller production storage;
- tilgang til skjulte admin- eller moderatorfunksjoner;
- fritak fra datakontrakter, manifests, validators eller CI-gates.

Demo-/TEST_MODE-data skal forbli atskilt fra ekte profiler og servereid state.

## Endringsregel

Endringer i query-key, storage-key, runtimealiaser, bootbro, synlig UI eller hvilke sikkerhetsgrenser testmodus kan påvirke skal oppdatere:

1. `js/debug/HGTestMode.js`;
2. dette dokumentet;
3. relevante smoke-/runtime-tester;
4. `README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md` dersom subsystemgrenser endres.
