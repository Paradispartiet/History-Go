# Civication Film/TV-kurator — kontrollert Role World rollout

Status: **materialisert på rollout-branch; må passere permanent CI før merge**

## Scope

Dette er første rolle i den kontrollerte brede rollouten etter readiness- og policy-gaten. Leveransen gjelder bare `film_tv/kurator_film_tv`; ingen cross-role-lenke tvinges inn fordi readiness-auditen markerer den som ikke nødvendig for denne rollen.

## Realismegjeld lukket

- **Persistent work object:** `film_tv_kurator_program_case_001` følger samme programcase fra premiss via rettighetshandoff og venting til rework, publikumsrespons og kuratorisk closure.
- **Rhythm / waiting / handoff / rework:** rettighetskoordinatoren er et faktisk handoff; programsaken går i `waiting`, History Go kan brukes mens svaret ventes, og senere scener krever historikk fra tidligere scene før de blir eligible.
- **Situated reputation:** separate akser brukes for `manager:film_tv_programansvarlig`, `professional:film_tv_rettighetskoordinator`, `team:film_tv_formidler` og `public:cinemateket_publikum`; ingen av dem gir myndighet.

## Authority

Kuratoren kan ferdigstille og anbefale en kuratorisk pakke. Offentlig programlås er fortsatt `approval_required` hos programansvarlig, og det er eksplisitt `forbidden` å love rettighet uten avtale. Arbeidsobjektets `completed` betyr derfor at kuratorens arbeid er ferdig som beslutningsgrunnlag, ikke at institusjonen automatisk har godkjent offentlig program.

## History Go / People / Places

History Go-oppgaven bruker canonical `cinemateket_oslo` som filmhistorisk og institusjonell kontekst. Den skiller filmarv, mandat og publikumsoppmerksomhet fra visningsrett og personlig smak. De eksisterende fiktive arbeidsaktørene forblir scenario-/Role World-personer og blir ikke fabrikkert inn i canonical People.

## Scene Pipeline

Sju nye authored realism-scener materialiseres i eksisterende mailFamily-kilder og kompileres til `civication_scene_v1`. Ingen ny engine, fallback eller parallell sceneformatfamilie introduseres.

## Completion

Role World-filen har 14 dager × fire faser = 56 unike dramaturgiske beats, fem relasjonelle tråder, privat etterklang og sju forsinkede konsekvensbuer. Permanent rolle-test verifiserer file#id-provenance, scene chain, authority, History Go-affordance, readiness-kø, Career runtime gate og compiled-registry-paritet.
