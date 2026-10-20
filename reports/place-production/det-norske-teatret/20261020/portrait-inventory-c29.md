# Det Norske Teatret – portrettinventar C29

**Kontroll:** 20. oktober 2026. **Kilde:** canonical `data/runtime/place-open/det_norske_teatret.json` på `main` `5a134917c176dda5968bda5aa345889afb26518a` (etter PR #6417), sammenholdt med lokale filreferanser og publiserte `imageMeta`-opplysninger. Dette er en inventarkontroll, ikke ny manuell lisensklarering av fotografiene.

## Reelt datagrunnlag

- **87** entydige People-koblinger i eksisterende Place-open-payload.
- **57** personer har både `image` og `cardImage` med lokalt lagrede filer, `imageMeta.reviewStatus=manually_approved`, lisens, kilde-URL og kreditering.
- **30** personer har ennå ikke bilde. Ingen kandidat skal publiseres før identitet, rettigheter og visuelt utsnitt er kontrollert.
- C21s **40/87** var korrekt *på det historiske checkpointet*, men ble stående uriktig som *nåværende* tall i arbeidsseddelen etter senere merge av portrettbatchene C23–C28.
- Baseline for denne kontrollen er `5a134917c176dda5968bda5aa345889afb26518a`; kontrollen endrer ingen People-ID, bildefil, quiz, brukerdata eller runtime-data.

## Gjenstående personer uten publisert portrett (30)

1. `ole_jorgen_nilsen` — Ole-Jørgen Nilsen
2. `anneke_von_der_lippe` — Anneke von der Lippe
3. `anne_marie_ottersen` — Anne Marie Ottersen
4. `otto_homlung` — Otto Homlung
5. `vidar_sandem` — Vidar Sandem
6. `erik_ulfsby` — Erik Ulfsby
7. `kjersti_horn` — Kjersti Horn
8. `arne_lygre` — Arne Lygre
9. `nils_sletta` — Nils Sletta
10. `britt_langlie` — Britt Langlie
11. `ragnhild_hilt` — Ragnhild Hilt
12. `jorunn_kjellsby` — Jorunn Kjellsby
13. `ragnhild_nygaard` — Ragnhild Nygaard
14. `heidi_gjermundsen_broch` — Heidi Gjermundsen Broch
15. `morten_svartveit` — Morten Svartveit
16. `bjorn_floberg` — Bjørn Floberg
17. `marie_blokhus` — Marie Blokhus
18. `gudrun_waadeland` — Gudrun Waadeland
19. `sverre_solberg` — Sverre Solberg
20. `ole_barman` — Ole Barman
21. `sossen_krohg_det_norske_teatret` — Sossen Krohg
22. `ellen_dorrit_petersen` — Ellen Dorrit Petersen
23. `silje_storstein` — Silje Storstein
24. `rolf_just_nilsen` — Rolf Just Nilsen
25. `per_jansen` — Per Jansen
26. `ola_b_johannessen` — Ola B. Johannessen
27. `vidar_magnussen` — Vidar Magnussen
28. `ulrikke_hansen_dovigen` — Ulrikke Hansen Døvigen
29. `lena_kristin_ellingsen` — Lena Kristin Ellingsen
30. `jon_eikemo` — Jon Eikemo

## Begrensninger og videre produksjonsrekkefølge

De 57 bildene er godkjent i eksisterende canonical metadata og finnes som lokale filer, men inventarauditen verifiserer ikke lisensen på nytt mot alle originalkilder. Bruk derfor den eksisterende personbilde-kandidatkøen, og foreta bilde-for-bilde-kontroll ved hver ny publisering. Samtidig er **Forestillinger**, **Objects**, **Brands**, separat stående **frontImage**, teaterspesifikt **QuizCard**, språk-/kildeavstemming og mobil/desktop-slutt-QA fortsatt egne blokkerende porter. Ingen samlet Place-status oppgraderes.

C9 har allerede kildegjennomgått 87/87 personkoblinger. Denne auditen teller kun foto og må ikke forveksles med en ny People-biografirevisjon.
