# Nedre Foss – source holdback cleanup

Dato: 2026-07-19

## Formål

PR #2530 fylte Nedre Foss med kildebelagt møllekronologi, bygningshistorie og Friedrich Grüner-relasjon. Eldre research-holdbacks i place-data og leksikon stod likevel igjen og sa at de samme opplysningene fortsatt manglet kildekontroll.

Denne cleanupen fjerner den interne selvmotsigelsen uten å endre canonical år, koordinater, radius, rundinger eller gameplay.

## Endringer

- fjerner de to løste research-holdbackene for møllekronologi og bygningshistorie
- beholder de reelt uløste holdbackene for skiftende virksomheter og presis geologi
- oppdaterer `source_summary` til faktisk sluttstatus
- erstatter det foreldede leksikon-counterpointet med kildekritisk presisering om at 1220 er første dokumenterte omtale, ikke nødvendigvis etableringsåret
- legger eksplisitte kildelenker på canonical `friedrich_gruner`
- legger Oslo kommune og SNL Friedrich Grüner inn blant stedets eksterne kilder
