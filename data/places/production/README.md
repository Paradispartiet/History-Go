# Place description production packets

Denne mappen inneholder interne produksjonspakker for nye eller reviderte `desc`/`popupDesc` under canonical standard 4.2.

Filnavn:

`<place_id>.json`

Hver pakke skal følge:

`data/places/regler/place_description_production_v4_2.schema.json`

Pakken skal ikke lastes av brukergrensesnittet. Den dokumenterer identitetsport, claims, setning–claim-dekning, teksthash, metadata-snapshot, faktareview, redaksjonell review, quiz-readiness og versjonert ferdigstatus.

Et verifisert historisk claim kan angi `timelineYear` når claim-teksten nevner flere eksakte år, men bare ett av dem er det redaksjonelt riktige tidslinjeankeret. Året må stå eksplisitt i claim-teksten, og `temporalStatus` må være `historical`. Feltet skal ikke brukes til å datere påstander som bare inneholder postnummer, merkenavn, omtrentlige perioder eller utledede årstall.

## Lengde

Ordtall er redaksjonell veiledning, ikke en validatorport. Rundt 300–1200 ord er et mulig orienteringsrom for mange `popupDesc`, men stofftilgang, stedets kompleksitet, identitetsavgrensning og inspectable kilder bestemmer faktisk lengde.

Produksjonsstatuser:

- `ready_v4_2`
- `needs_research`
- `source_conflict`
- `identity_unresolved`
- `blocked_insufficient_sources`
- `metadata_correction_required`

Kjør full kontroll med gjeldende policy:

```bash
node scripts/validate-place-description-production-v4_2_policy.mjs --all
```

Kjør PR-port mot base og head:

```bash
node scripts/validate-place-description-production-v4_2_policy.mjs --changed --base <base-sha> --head <head-sha>
```

Den underliggende validatoren beholder alle claim-, kilde-, review-, struktur-, quiz-, metadata-, likhets- og scope-porter. Policy-laget gjør bare rene ordtallsfunn ikke-blokkerende.
