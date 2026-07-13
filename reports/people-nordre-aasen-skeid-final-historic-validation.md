# Nordre Åsen – siste historiske Skeid-batch: validering

## Innhold

Fem nye personer er lagt til som separate JSON-filer:

- `tor_egil_johansen`
- `finn_thorsen`
- `pal_saethrang`
- `stein_thunberg`
- `mike_kjolo`

Alle fem bruker:

- `placeId: nordre_aasen_idrettspark`
- `places: [nordre_aasen_idrettspark]`
- `category: sport`

## Manifest

De fem nye filene er registrert enkeltvis i `data/people/manifest.json`, direkte etter de tidligere Nordre Åsen-profilene.

## Avgrensning

Nettodiffen mot `main` består av:

- fem nye personfiler
- people-manifestet
- researchrapporten
- denne valideringsrapporten

Ingen eksisterende personfiler, place-filer, place-ID-er, bilder, UI-filer, runtimefiler eller permanente workflowfiler er endret.

## Automatiske kontroller

Kontrollene på den rene branchen etter at den midlertidige manifestworkflowen var fjernet ga:

- People data: **success**
- Places data: **success**

People-kontrollen dekker blant annet JSON-parsing, unike person-ID-er, manifestfiler, gyldige place-referanser og People of Places-auditene.

## Produksjonsgrense

Denne batchen avslutter den navngitte Skeid-utvidelsen i denne produksjonsrunden. Videre profiler vil i hovedsak bevege arbeidet fra kuratert personutvalg mot nær komplett laghistorikk.
