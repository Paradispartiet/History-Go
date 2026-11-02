# TV-serier v1 – brodert undermerke
Dato: 2. november 2026

## Status
**Ferdig integrert – WebP aktivert i kategori-registeret i arbeidsgrenen.**

Film & TV har fra før tre godkjente, aktive undermerker: Spillefilm v2, Kortfilm v1 og Dokumentarfilm v1. Alle skal beholdes. Syv Scenekunst-undermerker og samtlige godkjente hovedmerker skal også være urørt.

## Individuelt motiv
- Rundt, realistisk brodert merke med tydelig sydd kant, ikke flate piktogrammer.
- **TV-SERIER** er sydd i bue langs den **øvre innerkanten**.
- **FILM & TV** er sydd mindre i bue langs den **nedre innerkanten** (omtrent 48 % av størrelsen på øvre tekst).
- Primærfarge magenta `#C2188B`, sekundærfarge liljehvit `#E7F8FF`.
- Senter: fjernsyn med **tre forskjellige episoderuter** som viser en tilbakevendende fiktiv karakter i tre ulike situasjoner. Liten fjernkontroll som markør, men ikke filmkamera eller nyhetsstudio.
- Ett originalbilde, 1024 × 1024 transparent WebP; lesbarhet ved 64 px.

## Bilder som ble forkastet
To bildegenereringer i denne produksjonsrunden gjentok feilaktig **DOKUMENTARFILM**. Ingen av dem skal brukes, omdøpes, aktiveres eller klippes om til TV-serier. Dette er ikke det samme motivet som ferdige Dokumentarfilm.

## Neste steg
1. Produser en riktig, selvstendig `TV-SERIER`-illustrasjon.
2. Kontroller visuelt topp- og bunntekst, korrekt stavemåte, motivets særpreg og broderiteknikk i full størrelse og ved 64 px.
3. Etter godkjenning lastes WebP opp til `bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp`.
4. Verifiser WebP, 1024 × 1024, transparent bakgrunn og SHA-256.
5. Registrer `subBadgeImages.tv_serier` i `data/badges/film_tv.json`, samt aktiv status og SHA i produksjonsmanifestet.
6. Kjør `node --test tests/badge-tv-serier-v1-production.test.mjs tests/badge-underbadge-batch01.test.mjs`.

**Ikke merge som ferdig bildekategori før illustrasjonen er korrekt og bildefilen integrert.**

## Integrert TV-serier v1 – 2. november 2026
- Fil: `bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp`, 448212 byte.
- SHA-256: `63fe4ce0804be6842605359abee6501350ce1b012239157e6c76aa6b3d047a44`.
- Topptekst **TV-SERIER**, nedre tekst **FILM & TV**, begge brodert inni ringkanten.
- Motiv: TV-skjerm med tre episoderuter, avspillingslinje, sesongbokser 1–3 og fjernkontroll. Liten filmklapper er kun en dekorativ birolle.
- 1024 × 1024 WebP med alfa. Visuell kontroll i 1024 og 64 px.
- Originalt selvstendig motiv, ikke utsnitt fra kontaktark.
- Spillefilm, Kortfilm, Dokumentarfilm og alle sju Scenekunst-merker er urørt.
- Målrettet test: `node --test tests/badge-tv-serier-v1-production.test.mjs tests/badge-underbadge-batch01.test.mjs`.

![TV-serier v1](../../bilder/merker/film_tv/undermerker/tv_serier-brodert-v1.webp)
