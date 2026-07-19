# Batch 29 visual coordinate QA

Dato: 2026-07-19

Kart-QA ble rendret i headless Chrome mot OpenStreetMap-fliser etter at batchens faktiske koordinatendringer var anvendt.

## Resultat

- `kulturkirken_jakob_litteratur`: **godkjent visuelt**. Ny markør ligger på/ved det kartlagte Kulturkirken Jakob-anlegget ved Hausmanns gate 14.
- `ruth_maier_minne`: **godkjent visuelt som adresseanker**. Ny markør ligger på Dalsbergstien ved det dokumenterte Dalsbergstien 3-ankeret. Den påstår ikke millimeterpresis plassering av selve snublesteinen.
- `proysenhuset_rudshogda`: **godkjent visuelt**. Ny markør ligger direkte på bygget som kartet navngir `Prøysenhuset` ved Prestvegen.
- `alf_proysen_statue_nittedal`: **godkjent visuelt kun som host/site-anchor**. Punktet ligger på Kulturverket Flammen / Nittedal bibliotek-området. Det er uttrykkelig ikke godkjent som eksakt monument-/sokkelpunkt og beholder `needs_manual_visual_qa`.

## Artefakter

- `batch29-map-qa.png`: gammel og ny markør i samme kartbilde.
- `batch29-closeup-qa.png`: høyzoom-kontroll av de nye punktene.
