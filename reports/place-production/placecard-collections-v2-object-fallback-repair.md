# PlaceCard collections v2 — Objects fallback repair

Dato: **2026-08-24**  
Status: **KLAR FOR REPARASJONS-PR**

## Funn

Christiania Torv-piloten avdekket at runtime bare tok med fysiske Civication-objekter når posten også hadde et eget bilde. Det motsa v2-kontrakten: et dokumentert fysisk objekt skal kunne vises med samlingens ikon og antall når et egnet previewbilde mangler.

## Reparasjon

- fysisk og stedsspesifikk objektidentitet avgjøres av objektmetadata, ikke av bildefeltet;
- Objects-popupen beholder den dokumenterte posten;
- previewet bruker eksisterende ikon-/antallsfallback;
- ingen generisk place-bildekopi eller oppdiktet objektillustrasjon opprettes;
- popup-runtime og place-data er urørt.

## Test

En ny runtime-test låser at et dokumentert fysisk Civication-objekt uten bilde:

1. inngår i Objects;
2. rendres i Objects-listen;
3. ikke lager et ødelagt `<img>`;
4. viser Objects-ikon og korrekt antall.

## Seksdelt kvalitetsvurdering

| Dimensjon | Score |
| --- | ---: |
| Faktisitet og kontraktskorrekthet | 5/5 |
| Dekning og bakoverkompatibilitet | 5/5 |
| Redaksjonell kvalitet | 5/5 |
| Brukeropplevelse og tilgjengelighet | 5/5 |
| Teknisk robusthet | 5/5 |
| Operasjonell trygghet | 4/5 |

**Sum: 29/30.** Siste operasjonelle poeng krever grønn obligatorisk CI.
