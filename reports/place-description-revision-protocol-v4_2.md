# Versjonert protokoll for stedsbeskrivelser – standard 4.2

Dette dokumentet supplerer den historiske detaljlisten i `reports/place-description-revision-protocol.md`.

## Gjeldende ferdigdefinisjon

Et sted teller som **current** bare når produksjonspakken har:

- `status: ready_v4_2`;
- `completedUnder: 4.2`;
- full claim-dekning;
- full setning–claim-paritet;
- bestått faktareview;
- bestått redaksjonell review uten nye fakta;
- bestått normal-quiz-test;
- bestått metadata-, likhets- og PR-scope-port;
- `validatorVersion: 4.2.x`.

## Migreringsstatus

Den eksisterende protokollen registrerer **260 steder** som ferdige under standard 4.1. Disse oppføringene beholdes som historisk produksjonsstatus, men de er ikke automatisk ferdige under 4.2.

Standardisert migreringsstatus:

```json
{
  "completedUnder": "4.1",
  "currentStatus": "requires_4_2_review"
}
```

Dette betyr ikke at tekstene er feil. Det betyr at 4.1-protokollen ikke dokumenterte claim-register, setningsdekning, separate reviews og versjonert ferdigstatus på 4.2-nivå.

## Nye registreringer

Nye eller reviderte steder skal registreres gjennom `data/places/production/<place_id>.json`. Markdown-listen er ikke lenger den autoritative ferdigporten.

Den historiske tabellen kan migreres maskinelt med:

```bash
node scripts/upgrade-place-description-protocol-v4_2.mjs --write
```

Dette genererer `reports/place-description-completion-registry-v4_2.json` der alle eksisterende tabelloppføringer blir markert `completedUnder: 4.1` og `currentStatus: requires_4_2_review`.

## Statusfelt

Tillatte produksjonsstatuser:

- `ready_v4_2`
- `needs_research`
- `source_conflict`
- `identity_unresolved`
- `blocked_insufficient_sources`
- `metadata_correction_required`

Bare `ready_v4_2` kan gi `currentStatus: current`.

## Review-prinsipp

Faktareview og redaksjonell review skal logges separat. En redaksjonell endring som innfører en ny faktisk bestanddel, sender teksten tilbake til claim- og faktareviewfasen.

## Ordtall

300 ord er et ferdigkrav for `ready_v4_2`, ikke et krav om fylltekst. Når kildene ikke gir nok dokumentert stoff, brukes `blocked_insufficient_sources` eller `needs_research`.
