# Civication Role Pack Index v1

Generert av `node scripts/audit-civication-role-packs.mjs`. Rapporten er en audit/statusoversikt og endrer ikke runtime eller UI.

## Statusdefinisjoner

- `complete_reference`: referansepakke etter rollepakke-standarden.
- `playable_v1`: spillbar pakke med roleModel, mailPlan, mailFamilies og test, men ikke markert som referanse.
- `partial_pack`: noe produksjonsdata finnes, men pakken er ikke komplett.
- `role_model_only`: kun roleModel finnes.
- `generated_stub`: roleModel finnes, men virker som generert startpunkt uten produksjonspakke.
- `broken_mapping`: mailPlan finnes uten matchende roleModel i manifestet.
- `missing`: ingen synlig pakke i auditgrunnlaget.

## Sammendrag

- complete_reference: 2
- playable_v1: 0
- partial_pack: 7
- role_model_only: 236
- generated_stub: 0
- broken_mapping: 16
- missing: 0

## Rolleindeks

| category | role_scope | role_id | title | roleModel finnes | mailPlan finnes | job-mails finnes | people-mails finnes | conflict-mails finnes | story-mails finnes | event-mails finnes | micro-mails finnes | followup-mails finnes | knowledge-mails finnes | consequence-mails finnes | test finnes | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| by | by_radgiver_plan | by_arealplanlegger | Arealplanlegger | ja | ja | ja | ja | ja | ja | ja | ja | ja | ja | ja | ja | complete_reference |
| by | arkitekt | by_arkitekt | Arkitekt | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| by | by_arkitekt |  | by_arkitekt | nei | ja | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | broken_mapping |
| by | by_assistent |  | by_assistent | nei | ja | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | broken_mapping |
| by | by_prosjektleder |  | by_prosjektleder | nei | ja | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | broken_mapping |
| by | by_saksbehandler |  | by_saksbehandler | nei | ja | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | broken_mapping |
| by | byarkitekt | by_byarkitekt | Byarkitekt | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | byplanlegger | by_byplanlegger | Byplanlegger | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | direktor_byutvikling | by_direktor_byutvikling | Direktør (byutvikling) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | fagsjef_plan_bygg | by_fagsjef_plan_bygg | Fagsjef (plan/bygg) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | forstekonsulent | by_forstekonsulent | Førstekonsulent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | praktikant_arkitektur_plan | by_praktikant_arkitektur_plan | Praktikant (arkitektur/plan) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | prosjektleder_byutvikling | by_prosjektleder_byutvikling | Prosjektleder (byutvikling) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | prosjektmedarbeider | by_prosjektmedarbeider | Prosjektmedarbeider | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | radgiver_byutvikling | by_radgiver_byutvikling | Rådgiver (byutvikling) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | saksbehandler_plan_bygg | by_saksbehandler_plan_bygg | Saksbehandler (plan/bygg) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | seksjonsleder | by_seksjonsleder | Seksjonsleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | seniorarkitekt | by_seniorarkitekt | Seniorarkitekt | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | seniorradgiver_byutvikling | by_seniorradgiver_byutvikling | Seniorrådgiver (byutvikling) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| by | studentassistent | by_studentassistent | Studentassistent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | connaisseur | film_tv_connaisseur | Connaisseur | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | film_og_tv_stjerne | film_tv_film_og_tv_stjerne | Film- og TV-stjerne | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | filmfantast | film_tv_filmfantast | Filmfantast | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | filminteressert | film_tv_filminteressert | Filminteressert | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | ikon | film_tv_ikon | Ikon | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| film_tv | internasjonalt_gjennomslag | film_tv_internasjonalt_gjennomslag | Internasjonalt gjennomslag | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | kjenner | film_tv_kjenner | Kjenner | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| film_tv | kurator_film_tv | film_tv_kurator_film_tv | Kurator (film/TV) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | manusmedarbeider | film_tv_manusmedarbeider | Manusmedarbeider | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | prisvinner | film_tv_prisvinner | Prisvinner | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | produksjonsassistent | film_tv_produksjonsassistent | Produksjonsassistent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | programleder | film_tv_programleder | Programleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | regissor | film_tv_regissor | Regissør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | seer | film_tv_seer | Seer | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| film_tv | serieskaper | film_tv_serieskaper | Serieskaper | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | arkivar | historie_arkivar | Arkivar | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | arkivmedarbeider | historie_arkivmedarbeider | Arkivmedarbeider | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | avdelingsdirektor | historie_avdelingsdirektor | Avdelingsdirektør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | avdelingsleder | historie_avdelingsleder | Avdelingsleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| historie | direktor | historie_direktor | Direktør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | doktorgradsstudent | historie_doktorgradsstudent | Doktorgradsstudent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | forsker | historie_forsker | Forsker | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | forstekonsulent | historie_forstekonsulent | Førstekonsulent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | konservator | historie_konservator | Konservator | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | kurator | historie_kurator | Kurator | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | masterstuden | historie_masterstuden | Masterstuden | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | radgiver | historie_radgiver | Rådgiver | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| historie | saksbehandler | historie_saksbehandler | Saksbehandler | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | seksjonsleder | historie_seksjonsleder | Seksjonsleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | senior_konservator | historie_senior_konservator | Senior konservator | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | senior_kurator | historie_senior_kurator | Senior kurator | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | seniorforsker | historie_seniorforsker | Seniorforsker | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | seniorradgiver | historie_seniorradgiver | Seniorrådgiver | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | spesialradgiver | historie_spesialradgiver | Spesialrådgiver | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| historie | student | historie_student | Student | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| kunst | formidler | kunst_formidler | Formidler | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| kunst | gallerimedarbeider | kunst_gallerimedarbeider | Gallerimedarbeider | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| kunst | gallerist | kunst_gallerist | Gallerist | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| kunst | konservator | kunst_konservator | Konservator | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| kunst | kunstnerisk_leder | kunst_kunstnerisk_leder | Kunstnerisk leder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| kunst | kurator | kunst_kurator | Kurator | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| kunst | kuratorassistent | kunst_kuratorassistent | Kuratorassistent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| kunst | museumsdirektor | kunst_museumsdirektor | Museumsdirektør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| kunst | produksjonsassistent | kunst_produksjonsassistent | Produksjonsassistent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| kunst | senior_konservator | kunst_senior_konservator | Senior konservator | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| kunst | senior_kurator | kunst_senior_kurator | Senior kurator | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| kunst | utstillingskoordinator | kunst_utstillingskoordinator | Utstillingskoordinator | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| kunst | utstillingsprodusent | kunst_utstillingsprodusent | Utstillingsprodusent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| kunst | vertskap_museum_galleri | kunst_vertskap_museum_galleri | Vertskap (museum/galleri) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | aktiv_leser | litteratur_aktiv_leser | Aktiv leser | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | anmelder | litteratur_anmelder | Anmelder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | bestselgerforfatter | litteratur_bestselgerforfatter | Bestselgerforfatter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | dramatiker | litteratur_dramatiker | Dramatiker | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | essayist | litteratur_essayist | Essayist | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | etablert_forfatter | litteratur_etablert_forfatter | Etablert forfatter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | forfatter | litteratur_forfatter | Forfatter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | kanonisert_forfatter | litteratur_kanonisert_forfatter | Kanonisert forfatter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | leser | litteratur_leser | Leser | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| litteratur | litteraturinteressert | litteratur_litteraturinteressert | Litteraturinteressert | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | litteraturkritiker | litteratur_litteraturkritiker | Litteraturkritiker | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | poet | litteratur_poet | Poet | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| litteratur | prisvinnende_forfatter | litteratur_prisvinnende_forfatter | Prisvinnende forfatter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | redaksjonsmedarbeider | litteratur_redaksjonsmedarbeider | Redaksjonsmedarbeider | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | redaktor_bok | litteratur_redaktor_bok | Redaktør (bok) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | skald | litteratur_skald | Skald | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| litteratur | skribent | litteratur_skribent | Skribent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| media | bidragsyter | media_bidragsyter | Bidragsyter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| media | frilansjournalist | media_frilansjournalist | Frilansjournalist | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| media | folger | media_folger | Følger | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| media | journalist | media_journalist | Journalist | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| media | kommentator_felt | media_kommentator_felt | Kommentator (felt) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| media | leser | media_leser | Leser | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| media | medieprofil | media_medieprofil | Medieprofil | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| media | mediestjerne | media_mediestjerne | Mediestjerne | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| media | nyhetsleder | media_nyhetsleder | Nyhetsleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| media | offentlig_dagsordensetter | media_offentlig_dagsordensetter | Offentlig dagsordensetter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| media | offentlighetsmakt | media_offentlighetsmakt | Offentlighetsmakt | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| media | redaksjonsmedarbeider | media_redaksjonsmedarbeider | Redaksjonsmedarbeider | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| media | redaktor | media_redaktor | Redaktør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| media | reporter | media_reporter | Reporter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| media | sjefredaktor | media_sjefredaktor | Sjefredaktør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | artist | musikk_artist | Artist | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | etablert_artist | musikk_etablert_artist | Etablert artist | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | fast_musiker_band_ensemble | musikk_fast_musiker_band_ensemble | Fast musiker (band/ensemble) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | frilansmusiker | musikk_frilansmusiker | Frilansmusiker | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | headliner | musikk_headliner | Headliner | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | plateartist | musikk_plateartist | Plateartist | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | popstjerne | musikk_popstjerne | Popstjerne | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | produksjonsassistent | musikk_produksjonsassistent | Produksjonsassistent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | produksjonskoordinator | musikk_produksjonskoordinator | Produksjonskoordinator | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | publikum_deltaker | musikk_publikum_deltaker | Publikum / deltaker | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | sceneassistent | musikk_sceneassistent | Sceneassistent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | solist | musikk_solist | Solist | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | stjerneartist | musikk_stjerneartist | Stjerneartist | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | tekniker_lys_lyd | musikk_tekniker_lys_lyd | Tekniker (lys/lyd) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| musikk | utovende_musiker | musikk_utovende_musiker | Utøvende musiker | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | administrasjonsmedarbeider |  | administrasjonsmedarbeider | nei | ja | ja | ja | nei | nei | nei | nei | nei | nei | nei | ja | broken_mapping |
| naeringsliv | arbeider |  | arbeider | nei | ja | ja | ja | ja | ja | ja | nei | nei | nei | nei | ja | broken_mapping |
| naeringsliv | avdelingsleder | naer_avdelingsleder | Avdelingsleder | ja | ja | ja | ja | ja | ja | ja | ja | nei | nei | nei | ja | partial_pack |
| naeringsliv | bedriftseier | naeringsliv_bedriftseier | Bedriftseier | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | butikksjef_enhetsleder | naeringsliv_butikksjef_enhetsleder | Butikksjef / enhetsleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | controller | naer_controller | Controller | ja | ja | ja | ja | ja | ja | ja | nei | nei | nei | nei | ja | partial_pack |
| naeringsliv | daglig_leder | naeringsliv_daglig_leder | Daglig leder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | driftsleder | naeringsliv_driftsleder | Driftsleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | ekspeditor |  | ekspeditor | nei | ja | ja | ja | ja | ja | ja | nei | nei | nei | nei | ja | broken_mapping |
| naeringsliv | ekspeditor_butikkmedarbeider | naeringsliv_ekspeditor_butikkmedarbeider | Ekspeditør / butikkmedarbeider | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| naeringsliv | fagarbeider | naeringsliv_fagarbeider | Fagarbeider | ja | ja | ja | ja | ja | ja | ja | nei | nei | nei | nei | ja | partial_pack |
| naeringsliv | finansanalytiker | naer_finansanalytiker | Finansanalytiker | ja | ja | ja | nei | ja | ja | ja | nei | nei | nei | nei | nei | partial_pack |
| naeringsliv | finansdirektor | naer_finansdirektor | Finansdirektør | ja | ja | ja | nei | ja | ja | ja | nei | nei | nei | nei | nei | partial_pack |
| naeringsliv | formann |  | formann | nei | ja | ja | ja | ja | ja | ja | nei | nei | nei | nei | ja | broken_mapping |
| naeringsliv | formann_arbeidsleder | naeringsliv_formann_arbeidsleder | Formann / arbeidsleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | grunder | naeringsliv_grunder | Gründer | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | industribygger | naeringsliv_industribygger | Industribygger | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | industrieier | naeringsliv_industrieier | Industrieier | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | investor | naeringsliv_investor | Investor | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | kapital_og_eierskap |  | kapital_og_eierskap | nei | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | broken_mapping |
| naeringsliv | kapitalforvalter | naeringsliv_kapitalforvalter | Kapitalforvalter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | konserndirektor | naeringsliv_konserndirektor | Konserndirektør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | konsernsjef | naeringsliv_konsernsjef | Konsernsjef | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | lager_og_driftsmedarbeider | naer_lager_og_driftsmedarbeider | Lager- og driftsmedarbeider | ja | ja | ja | ja | nei | nei | nei | nei | nei | nei | nei | ja | partial_pack |
| naeringsliv | mellomleder |  | mellomleder | nei | ja | ja | ja | ja | ja | ja | nei | nei | nei | nei | ja | broken_mapping |
| naeringsliv | produksjonsleder | naeringsliv_produksjonsleder | Produksjonsleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | renholder |  | renholder | nei | ja | ja | ja | nei | nei | nei | nei | nei | nei | nei | ja | broken_mapping |
| naeringsliv | skiftleder | naeringsliv_skiftleder | Skiftleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | okonomi_og_administrasjonsmedarbeider | naeringsliv_okonomi_og_administrasjonsmedarbeider | Økonomi- og administrasjonsmedarbeider | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| naeringsliv | okonomi_og_finanssjef | naer_okonomi_og_finanssjef | Økonomi- og finanssjef | ja | ja | ja | nei | ja | ja | ja | nei | nei | nei | nei | nei | partial_pack |
| natur | artsobservator | natur_artsobservator | Artsobservatør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | biolog | natur_biolog | Biolog | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | feltassistent | natur_feltassistent | Feltassistent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | feltobservator | natur_feltobservator | Feltobservatør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | forsker_miljo_natur | natur_forsker_miljo_natur | Forsker (miljø/natur) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | miljodirektor | natur_miljodirektor | Miljødirektør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | miljosjef | natur_miljosjef | Miljøsjef | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | naturforvalter | natur_naturforvalter | Naturforvalter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | naturinteressert | natur_naturinteressert | Naturinteressert | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | naturveileder | natur_naturveileder | Naturveileder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | naturvernleder | natur_naturvernleder | Naturvernleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | radgiver_miljo_natur | natur_radgiver_miljo_natur | Rådgiver (miljø/natur) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | seniorforsker_miljo_natur | natur_seniorforsker_miljo_natur | Seniorforsker (miljø/natur) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | seniorradgiver_miljo_natur | natur_seniorradgiver_miljo_natur | Seniorrådgiver (miljø/natur) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | statsrad_klima_og_miljo | natur_statsrad_klima_og_miljo | Statsråd (klima og miljø) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| natur | okolog | natur_okolog | Økolog | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | aktivist | politikk_aktivist | Aktivist | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | diktator | politikk_diktator | Diktator | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | fylkespolitiker | politikk_fylkespolitiker | Fylkespolitiker | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | komiteleder | politikk_komiteleder | Komitéleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | kommunestyrerepresentant | politikk_kommunestyrerepresentant | Kommunestyrerepresentant | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | ordforer | politikk_ordforer | Ordfører | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | organisasjonssekretaer | politikk_organisasjonssekretaer | Organisasjonssekretær | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | partileder | politikk_partileder | Partileder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | politisk_radgiver | politikk_politisk_radgiver | Politisk rådgiver | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | president | politikk_president | President | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | samfunnsengasjert_borger | politikk_samfunnsengasjert_borger | Samfunnsengasjert borger | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | statsminister | politikk_statsminister | Statsminister | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | statsrad_minister | politikk_statsrad_minister | Statsråd (minister) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | statssekretaer | politikk_statssekretaer | Statssekretær | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | stortingsrepresentant | politikk_stortingsrepresentant | Stortingsrepresentant | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| politikk | tillitsvalgt | politikk_tillitsvalgt | Tillitsvalgt | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| populaerkultur | community_medlem | populaerkultur_community_medlem | Community-medlem | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| populaerkultur | fan | populaerkultur_fan | Fan | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| populaerkultur | folger | populaerkultur_folger | Følger | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| populaerkultur | ikon | populaerkultur_ikon | Ikon | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| populaerkultur | influencer | populaerkultur_influencer | Influencer | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| populaerkultur | innholdsskaper | populaerkultur_innholdsskaper | Innholdsskaper | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| populaerkultur | kreator | populaerkultur_kreator | Kreatør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| populaerkultur | kultfigur | populaerkultur_kultfigur | Kultfigur | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| populaerkultur | legende | populaerkultur_legende | Legende | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| populaerkultur | profil | populaerkultur_profil | Profil | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| populaerkultur | publikum | populaerkultur_publikum | Publikum | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| populaerkultur | superfan | populaerkultur_superfan | Superfan | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| populaerkultur | trendsetter | populaerkultur_trendsetter | Trendsetter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| psykologi | analytiker | psykologi_analytiker | Analytiker | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| psykologi | atferdsobservator | psykologi_atferdsobservator | Atferdsobservatør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| psykologi | fagansvarlig | psykologi_fagansvarlig | Fagansvarlig | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| psykologi | forsker_psykologi | psykologi_forsker_psykologi | Forsker (psykologi) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| psykologi | klinikkleder | psykologi_klinikkleder | Klinikkleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| psykologi | professor_psykologi | psykologi_professor_psykologi | Professor (psykologi) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| psykologi | psykolog | psykologi_psykolog | Psykolog | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| psykologi | radgiver | psykologi_radgiver | Rådgiver | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| psykologi | samtalepartner | psykologi_samtalepartner | Samtalepartner | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| psykologi | seniorradgiver | psykologi_seniorradgiver | Seniorrådgiver | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| psykologi | spesialistpsykolog | psykologi_spesialistpsykolog | Spesialistpsykolog | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| psykologi | titter | psykologi_titter | Titter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| psykologi | veileder | psykologi_veileder | Veileder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sosial_laering | barnehageassistent | sosial_laering_barnehageassistent | Barnehageassistent / pedagogisk medarbeider | ja | ja | ja | ja | ja | ja | ja | ja | ja | ja | ja | ja | complete_reference |
| sport | aktiv_utover | sport_aktiv_utover | Aktiv utøver | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | eliteseriespiller | sport_eliteseriespiller | Eliteseriespiller | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | hovedtrener | sport_hovedtrener | Hovedtrener | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | idrettslegende | sport_idrettslegende | Idrettslegende | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | idrettsstjerne | sport_idrettsstjerne | Idrettsstjerne | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | kaptein | sport_kaptein | Kaptein | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | klubbspiller | sport_klubbspiller | Klubbspiller | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | konkurranseutover | sport_konkurranseutover | Konkurranseutøver | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | landslagsutover | sport_landslagsutover | Landslagsutøver | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | mosjonist | sport_mosjonist | Mosjonist | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | olympisk_mester | sport_olympisk_mester | Olympisk Mester | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | profesjonell_utover | sport_profesjonell_utover | Profesjonell utøver | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | sport_kaptein |  | sport_kaptein | nei | ja | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | broken_mapping |
| sport | sport_legende |  | sport_legende | nei | ja | ja | nei | nei | nei | nei | nei | nei | nei | nei | ja | broken_mapping |
| sport | sport_sportsledelse |  | sport_sportsledelse | nei | ja | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | broken_mapping |
| sport | sport_trener |  | sport_trener | nei | ja | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | broken_mapping |
| sport | sport_utover |  | sport_utover | nei | ja | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | broken_mapping |
| sport | sportssjef | sport_sportssjef | Sportssjef | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| sport | trener | sport_trener | Trener | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| subkultur | crew | subkultur_crew | Crew | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| subkultur | dandy | subkultur_dandy | Dandy | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| subkultur | deltaker | subkultur_deltaker | Deltaker | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| subkultur | gangster | subkultur_gangster | Gangster | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| subkultur | gatesmart | subkultur_gatesmart | Gatesmart | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| subkultur | hakkekylling | subkultur_hakkekylling | Hakkekylling | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| subkultur | kultfigur | subkultur_kultfigur | Kultfigur | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| subkultur | legend | subkultur_legend | Legend | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | ja | role_model_only |
| subkultur | observor | subkultur_observor | Observør | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| subkultur | trendsetter | subkultur_trendsetter | Trendsetter | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| subkultur | undergrunnsikon | subkultur_undergrunnsikon | Undergrunnsikon | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | ensemblemedlem | teater_ensemblemedlem | Ensemblemedlem | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | fast_publikummer | teater_fast_publikummer | Fast publikummer | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | hovedrolleinnehaver | teater_hovedrolleinnehaver | Hovedrolleinnehaver | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | kjent_scenenavn | teater_kjent_scenenavn | Kjent scenenavn | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | prisvinnende_scenekunstner | teater_prisvinnende_scenekunstner | Prisvinnende scenekunstner | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | produksjonsmedarbeider | teater_produksjonsmedarbeider | Produksjonsmedarbeider | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | publikum | teater_publikum | Publikum | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | regissor_teater | teater_regissor_teater | Regissør (teater) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | sceneassistent | teater_sceneassistent | Sceneassistent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | scenestjerne | teater_scenestjerne | Scenestjerne | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | scenisk_ikon | teater_scenisk_ikon | Scenisk ikon | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | skuespiller | teater_skuespiller | Skuespiller | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| teater | teatergjenger | teater_teatergjenger | Teatergjenger | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | dekan | vitenskap_dekan | Dekan | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | forsker | vitenskap_forsker | Forsker | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | forskningsassistent | vitenskap_forskningsassistent | Forskningsassistent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | forskningsleder | vitenskap_forskningsleder | Forskningsleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | forsteamanuensis | vitenskap_forsteamanuensis | Førsteamanuensis | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | instituttleder | vitenskap_instituttleder | Instituttleder | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | laboratorieassistent | vitenskap_laboratorieassistent | Laboratorieassistent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | postdoktor | vitenskap_postdoktor | Postdoktor | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | professor | vitenskap_professor | Professor | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | seniorforsker | vitenskap_seniorforsker | Seniorforsker | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | stipendiat_phd | vitenskap_stipendiat_phd | Stipendiat (PhD) | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | studentassistent | vitenskap_studentassistent | Studentassistent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |
| vitenskap | vitenskapelig_assistent | vitenskap_vitenskapelig_assistent | Vitenskapelig assistent | ja | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | nei | role_model_only |

