# Dokumentarfilm – undermerke v1 (2. november 2026)

## Status
**Ingenting aktivert.** Spillefilm og Kortfilm har allerede egne godkjente WebP-filer i `main`, og må ikke tegnes eller kobles på nytt. Dette dokumentet gjelder bare **Dokumentarfilm**.

## Visuelt produksjonskrav
- Én **selvstendig** rund brodert stoffpatch, med realistisk trådtekstur og tykk sydd kant.
- **DOKUMENTARFILM** sydd i bue **innenfor den øvre innerkanten**.
- **FILM & TV** sydd i en mindre bue **innenfor nedre innerkant**, om lag 48 % av høyden til hovedteksten, i dempet liljehvit tråd.
- Korrekte Film & TV-farger: magenta `#C2188B` som primær, liljehvit `#E7F8FF` som sekundær. Svart og grå tråd er tillatt som nøytrale detaljer.
- Distinkt dokumentarmotiv: samtale mellom intervjuer og intervjuobjekt i et autentisk utemiljø; en diskret lydopptaker, observasjon eller feltopptak. Tre broderte dokumentariske landskaps-/miljøbilder i en filmstripe kan brukes som støtte.
- **Ingen** kopiert filmkamera, klapperbrett, manus eller stoppeklokke fra hovedmerkene og de to ferdige Film & TV-undermerkene.
- 1024 × 1024 WebP med transparens og lesbarhet på 64 px.

## Forkastede utkast
To genererte illustrasjoner fikk feilaktig teksten **KORTFILM** i stedet for DOKUMENTARFILM. Ingen av dem ble overført eller aktivert. **Ikke** konverter dem til WebP eller bruk dem som bildekilde for dette undermerket.

## Integrasjon etter billedgodkjenning
1. Generer og kontroller en ny selvstendig fil med korrekt navn og motiv.
2. Legg godkjent WebP til `bilder/merker/film_tv/undermerker/dokumentarfilm-brodert-v1.webp`. Verifiser SHA-256, 1024 × 1024 og alfa.
3. Oppdater `data/badges/film_tv.json`: `subBadgeImages.dokumentarfilm`.
4. Registrer filhash, kilde, visuell og teknisk godkjenningsstatus i `underbadge_batch01_production.json`, og kjør den målrettede testen.
5. Ikke endre eksisterende hovedmerker eller tidligere godkjente Film & TV- og Scenekunst-undermerker.

## Målrettet kontroll
`node --test tests/badge-dokumentarfilm-v1-production.test.mjs`

Dette er en design- og sikkerhetskontrakt, **ikke en påstand om at illustrasjonen er ferdig**.

## Ny felles undermerkeregel
Et undermerke viser fra nå av både underkategorinavn øverst og hovedkategorinavn nederst, begge som broderte bokstaver inni merket. Underkategorinavnet skal være visuelt dominerende. Tidligere godkjente bilder oppdateres separat etter visuell vurdering – de overskrives ikke automatisk.

Forsøket på å visualisere dette 2. november viste riktig plassering av «FILM & TV» nederst, men genererte nok en gang **KORTFILM** øverst og et Kortfilm-motiv. Dette er bare layoutreferanse, ikke en godkjent Dokumentarfilm-fil. Totalt tre avviste bildeforsøk; ingen ny WebP fra disse forsøkene aktiveres.
