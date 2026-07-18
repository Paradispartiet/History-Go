# Etne psykologi batch 1 — research and place gate

Date: 2026-07-18

## Scope

This batch adds two documented physical service locations for Etne municipality's `Psykisk helse og rus` service:

- `psykisk_helse_rus_etne` — Holmavegen 24, 5590 Etne
- `psykisk_helse_rus_skanevik` — Skånevikvegen 17, 5593 Skånevik

The two records represent separate physical visiting locations for the same municipal service, not duplicate names for one building.

## Category gate

The canonical psychology guidance explicitly allows concrete mental-health institutions, clinics, treatment settings, therapy and care services when psychology/mental health is the primary function.

Etne municipality documents the service as a low-threshold mental-health and substance-use service and describes individual follow-up that may include:

- guidance
- supportive conversations
- cognitive therapy
- conversations with relatives
- individual plan and/or coordinator when needed

The main quiz angle is therefore documented treatment, care, access and service practice. The records must not be used to diagnose named individuals, visitors or users.

Selected canonical topics:

- `em_psy_psykisk_helse`
- `em_psy_behandling_omsorg`
- `em_psy_institusjoner_psykiatri`

## Duplicate gate

Current repository state was searched before record creation for:

- `Holmavegen 24`
- `Skånevikvegen 17`
- `psykisk_helse_rus_etne`
- `psykisk_helse_rus_skanevik`
- competing Etne psychology PRs

No existing canonical psychology service place record was found for either address.

A historical research report contains a different Skånevik address (`Skånevikvegen 10`) for the Reichwald Stolpersteine; this is a separate physical place and does not overlap the new service point at number 17.

## Coordinate method

The repository's address-first coordinate finder was run before the canonical records were created. Both outputs were saved in the same bash block with `tee`.

### Etne service location

```bash
npm run places:coords:find:address -- --address "Holmavegen 24, 5590 Etne" \
  | tee reports/etne-psykologi-batch-1-coordinate-intake/psykisk-helse-etne-holmavegen-24.json
```

Result:

- status: `verified_candidate`
- one clear Geonorge address hit
- coordinate: `59.66534125070043, 5.943034081601908`
- radius: `60`
- `sourceObjectId: geonorge-adresser-v1:4611:1034:24`
- `coordType: address_point`
- `coordStatus: verified`
- `locatorType: building`
- `geocodeAccuracy: rooftop`

### Skånevik service location

```bash
npm run places:coords:find:address -- --address "Skånevikvegen 17, 5593 Skånevik" \
  | tee reports/etne-psykologi-batch-1-coordinate-intake/psykisk-helse-skanevik-skanevikvegen-17.json
```

Result:

- status: `verified_candidate`
- one clear Geonorge address hit
- coordinate: `59.73234389428389, 5.935277893100119`
- radius: `60`
- `sourceObjectId: geonorge-adresser-v1:4611:1152:17`
- `coordType: address_point`
- `coordStatus: verified`
- `locatorType: building`
- `geocodeAccuracy: rooftop`

Raw coordinate evidence:

- `reports/etne-psykologi-batch-1-coordinate-intake/psykisk-helse-etne-holmavegen-24.json`
- `reports/etne-psykologi-batch-1-coordinate-intake/psykisk-helse-skanevik-skanevikvegen-17.json`

## Editorial safeguards

- Do not diagnose people, historical figures, users or visitors.
- Do not turn quiz questions into personal mental-health advice or self-help instructions.
- Start from documented service practice, treatment forms, institutional role, access or care systems.
- Keep the two physical service locations distinct while acknowledging that they are part of the same municipal service.
- Avoid individual patient stories and current case information.

## Sources

1. Etne kommune — Psykisk helse og rus
   - https://www.etne.kommune.no/helse-og-omsorg/helsetenesta/psykisk-helse-og-rus/
2. Etne kommune — Individuell oppfølging
   - https://www.etne.kommune.no/helse-og-omsorg/helsetenesta/psykisk-helse-og-rus/individuell-oppfolging/
3. Etne kommune — Arbeid og aktivitet
   - https://www.etne.kommune.no/helse-og-omsorg/helsetenesta/psykisk-helse-og-rus/arbeid-og-aktivitet/
4. Geonorge Adresser API v1
   - saved through the repository coordinate finder under `reports/etne-psykologi-batch-1-coordinate-intake/`
5. `data/fag/psykologi/SET_MAL_README_psykologi_v4_3.md`
   - category and canonical-emne guidance only; not used as factual source
