# Nedre Foss – PlaceCard rounds batch 1

Dato: 2026-07-19

## Avgrensning

Batchen gjør `nedre_foss` om fra research seed til et ferdig stedskort med alle ni historie-rundinger. Koordinat, radius og coordinate-source metadata røres ikke.

## Kildegrunnlag

- Store norske leksikon, **Foss (Oslo)**.
- Oslo byleksikon, **Foss gård**.
- Industrimuseum, **Nedre Foss – fra klosterkorn og krongods til urbant miljøfyrtårn**.
- Oslo byleksikon, **Nedre Foss park**.

## Databeslutninger

- `year` rettes fra det generiske `1800` til `1220`, første dokumenterte omtale av kvern under Hovedøya kloster.
- Friedrich Grüner opprettes som canonical person med Nedre Foss som primært sted. Den dokumenterte koblingen er kjøpet av Nedre Foss Mølle/Kongens mølle i 1672.
- Nature-rundingen beholdes fordi fossen og Akerselva er selve naturgrunnlaget for stedets historiske funksjon. Det legges ikke inn artsinventar uten aktiv place-kartlegging.
- Works-rundingen skiller mellom det historiske mølleanlegget, hovedbygningen fra 1801/1802, kornsiloens senere gjenbruk og parkanlegget fra 2017.
- Nåværende restaurant- eller næringsvirksomheter hardkodes ikke; de er tidsavhengige og ikke nødvendige for den historiske gameplay-identiteten.

## Akerselva split-sikkerhet

Hele Akerselva-ruten skal ikke fullsplittes fra den eldre aggregate-filen. Bare disse route-elementene oppdateres:

- `nedre_foss.json`
- Nedre Foss-raden i route index
- Nedre Foss-radens hash i split-manifestet

Ingen andre Akerselva-place-filer skal endres.

## Rundinger

Canonical `historie`-profil:

1. Personer
2. Verk
3. Merker
4. Før / nå
5. Civication
6. Aktører
7. Natur
8. Fortellinger
9. Leksikon

## Validering

Finalizer-kjøringen passerte:

- place index build og parity-check
- split-manifest sync
- målrettet Nedre Foss-rundingtest
- canonical PlaceCard round runtime audit
- People-of-Places med 0 ugyldige referanser og 0 duplikat-ID-er
- guard mot endringer i andre Akerselva-place-filer
- JSON-parse og `git diff --check`
