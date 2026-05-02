# Civication role models from badges

1. Hvor mange badge-kategorier som ble lest: **16**.
2. Hvor mange stillinger/tier-labels som ble funnet: **244**.
3. Hvor mange roleModel-filer som ble opprettet: **244** rolefiler + `manifest.json`.
4. Eventuelle duplikate tier-labels på tvers av kategorier:
   - `Avdelingsleder` (2)
   - `Forsker` (2)
   - `Følger` (2)
   - `Førstekonsulent` (2)
   - `Ikon` (2)
   - `Konservator` (2)
   - `Kultfigur` (2)
   - `Kurator` (2)
   - `Leser` (2)
   - `Produksjonsassistent` (3)
   - `Publikum` (2)
   - `Redaksjonsmedarbeider` (2)
   - `Rådgiver` (2)
   - `Sceneassistent` (2)
   - `Seksjonsleder` (2)
   - `Senior konservator` (2)
   - `Senior kurator` (2)
   - `Seniorforsker` (2)
   - `Seniorrådgiver` (2)
   - `Studentassistent` (2)
   - `Trendsetter` (2)
5. Eventuelle labels som ga samme slug innen samme kategori:
   - Ingen kollisjoner.
6. Om eksisterende runtime faktisk kan lese alle nye filer.
   - Delvis: `civicationRoleModelRuntime.js` kan lese `data/Civication/roleModels/{category}/{roleScope}.json` og faller tilbake til slugget `title`. Det betyr at filer er lesbare når aktiv rolle-tittel samsvarer med badge-tier-label, men dagens hardkodede mapping dekker fortsatt bare noen eldre roller.
7. Hva som må gjøres senere for full mailintegrasjon.
   - Utvide `mailPlans`/`mailFamilies` for flere kategorier og role_scopes.
   - Bruke badge-tier-slug direkte i planoppslag i bridge/runtime i stedet for eldre rollegrupper.
   - Koble `recommended_mail_families`/`role_model_refs` til faktiske familier per rolle.