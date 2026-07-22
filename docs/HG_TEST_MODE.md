# Skjult utviklermodus i History GO

## Grunnregel

Testmodus er et utviklerverktøy og vises ikke i den vanlige menyen. Vanlige spillere skal aldri kunne omgå GPS-gaten ved et tilfeldig menytrykk.

Den eneste varige nøkkelen er:

`HG_TEST_MODE`

## Aktivere og deaktivere

På en utviklerenhet kan testmodus aktiveres med:

`?hgTest=1`

Eksempel:

`/History-Go/?hgTest=1`

Den kan deaktiveres med:

`?hgTest=0`

Parameteren fjernes fra adresselinjen etter at den er lest. Valget lagres i `localStorage`.

Fra nettleserkonsollen kan utviklere bruke:

`HGTestMode.enable()`

`HGTestMode.disable()`

`HGTestMode.isEnabled()`

## Kompatibilitet

`window.TEST_MODE` og `window.OPEN_MODE` beholdes midlertidig som runtime-aliaser for gammel kode.

Den gamle lagringsnøkkelen `HG_OPEN_MODE` er ikke lenger en brukerinnstilling. Runtime legger den bare inn kort under oppstart dersom eldre boot-kode trenger den, og sletter den når kritisk boot er ferdig.

## Produktkontrakt

Testmodus kan fortsatt brukes til GPS-bypass, runtime health, smoke-tester og isolerte demoer. Den gir ingen offentlig knapp, menybryter eller synlig Unlock all-kontroll.
