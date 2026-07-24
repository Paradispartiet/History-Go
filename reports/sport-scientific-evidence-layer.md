# Sport & lek – vitenskapelig evidenslag v1

Status: **validert**

Dette laget gjør V5-fagkartet etterprøvbart på påstands-, kilde-, modell- og målenivå. Det erstatter ikke emne- og teorilaget, men legger obligatorisk evidensmetadata over forsknings-, helse-, trenings-, måle-, risiko- og modellpåstander.

## Omfang

- 17 kontrollerte kilder
- 16 kanoniske påstander
- 12 modellbeskrivelser
- 15 målemetoder og avledede mål
- 10 produksjonsporter
- ett eksplisitt evidenshierarki med nedgraderingsdomener

## Forbedringer

- Påstander spores fra `claim_id` til konkrete `source_ids`.
- Påstandstype skiller deskriptivt, kausalt, prediktivt, normativt, mekanistisk, klinisk og regulatorisk språk.
- Hver påstand har populasjon, kontekst, evidensgrad, usikkerhet og ekstern-validitetsnote.
- Målinger krever instrument, protokoll, enhet, versjon og målekvalitet.
- Modelloutput krever modellnavn, implementasjon, inputdefinisjon og valideringsområde.
- Rapporteringsstandarder behandles ikke som kvalitets- eller evidensscore.
- Motstridende forskning skal registreres, ikke skjules.
- Doping- og regeldata er versjons- og datobundet.
- Klinisk innhold kan ikke produsere diagnose, individuell skadeprediksjon eller retur-til-spill-beslutning.
- Analysebaserte tall krever data-provenance og beregningsregel.

## Quizmetadata

Forskningsbaserte spørsmål får et `scientific_evidence`-objekt med minst:

```json
{
  "claim_id": "claim_sport_...",
  "source_ids": ["src_sport_..."],
  "claim_type": "methodological",
  "evidence_grade": "high",
  "population": "...",
  "context": "...",
  "uncertainty_note": "...",
  "external_validity_note": "..."
}
```

Måle- og modellpåstander legger i tillegg inn `measurement_ids` og `model_ids`.

## Sikkerhet

Quiz eller apptekst skal ikke:

- diagnostisere hjernerystelse, REDs, skade eller sykdom
- anbefale individuell behandling eller retur til sport
- bruke en gruppemodell som individuell skadeprediksjon
- gi treningsresept uten målgruppe, dose, progresjon og sikkerhetsramme
- omtale WADA-status uten gjeldende liste og virkningsdato

## Validering

`tools/validate-sport-evidence.mjs` kontrollerer unike ID-er, alle kryssreferanser, obligatoriske metadata, kausalspråk, modell- og målebegrensninger, produksjonsporter, profilintegrasjon og medisinske sikkerhetsgrenser.
