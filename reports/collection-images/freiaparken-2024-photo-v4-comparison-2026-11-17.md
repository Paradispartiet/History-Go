# Freiaparken – fotografi mot illustrasjon v4 (17.11.2026)

**Redaksjonell avgjørelse:** Foretrekk dokumentert fotografi fra 2024 fremfor syntetisk Structure-gjengivelse. **Ingen prod-fil er byttet.** Begge kildefilene er inspisert visuelt: Wikimedia-originalen på kildesiden og vår lokale v4-illustrasjon.

## Fotografiet som best dokumenterer parken

**Freiaparken bassenget langs Freias bygning.jpg**, Helge Høifødt, fotografert 21. september 2024 kl. 11:52, 2048 × 1365 piksler. Originalen ligger på [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Freiaparken_bassenget_langs_Freias_bygning.jpg), lisens **CC BY-SA 4.0** (https://creativecommons.org/licenses/by-sa/4.0/), arkivfilens SHA-1: `c019ba8643ff19e18421d634343b768404e9ae4c`. Wikimedia oppgir originalstørrelse 1 558 639 byte og foto av Helge Høifødt. Se `freiaparken-photo-2024-commons-candidate.json` for strukturert proveniens.

Dette fotografiet viser det reelle, langstrakte bassenget, murbygningen langs kanten, skulpturer, benker, kantstein, trevegetasjon og den moderne boligblokken i bakgrunnen. **Det er et dokumentarfoto fra 2024, ikke et bilde fra innvielsen i 1923.**

**Rettigheter:** Fotografen krever kreditering, lenke til lisensen og angivelse av eventuelle endringer. En tilpasset derivative må vurderes etter dele-på-samme-vilkår-kravet. I tillegg må eventuelle selvstendige rettigheter for skulpturene i motivet avklares. Wikimedia-lisensen på fotografiet er ikke automatisk en lisens til alle avbildede kunstverk. Ingen nedlastet fil eller binær-derivative er ennå arkivert i GitHub-grenen.

## V4-illustrasjonen – konkret visuell sammenligning

| Kriterium | Dokumentarisk foto 2024 | Illustrasjon v4 | QA |
| --- | --- | --- | --- |
| Langt rektangulært vannbasseng | Ja, riktig lengdeakse og utstrekning | Generelt korrekt som et avlangt basseng, men annen vinkel og geometri | DELVIS |
| Murverk/bygning | Den faktiske Freia-muren til venstre og moderne boligblokk i fond | Høye grønne vegger og gule bygninger med oppdiktet utforming | **FEIL** |
| Skulpturer | Konkrete figurative skulpturer ved og rundt bassenget | Uidentifiserte stolpelignende dekorfigurer i enden | **FEIL** |
| Gangvei, terreng, plassering | Uregelmessig grøntanlegg, buktet trapp/sti, hvite benker | Symmetrisk allé, generiske blomster og benker | **FRI TOLKNING** |
| Fototidsepoke | Dokumentert 21.09.2024 | Ingen eksakt tidsrekonstruksjon | IKKE DIREKTE SAMMENLIGNBART |
| Proveniens | Kamera, fotograf, lisens og original tilgjengelig | Original KI-illustrasjon med deklarert illustrasjonsstatus | BEGGE DOKUMENTERT, FOTO MER STEDSTRO |

**Konklusjon for v4:** `HOLD_NOT_SITE_FAITHFUL`. V4 illustrerer en generell vakker hage, men er fremdeles ikke en stedtro gjengivelse av Freiaparken, særlig på grunn av feil skulpturformer og bakgrunnsarkitektur. **Ingen promotion til canonical `structures[].image`.**

## Åpne punkter

1. Last ned originalen direkte fra Commons og kontroller SHA-1 `c019ba8643ff19e18421d634343b768404e9ae4c` samt bildepiksler og dimensjon.
2. Lag en egen, fullstendig synlig WebP-derivativ og en originalkopi. Aldri beskjær bort skulpturer, basseng eller kantvegetasjon.
3. Verifiser rettigheter til skulpturene i motivet. Deretter registreres kreditering, lenker, lisens og avledet filhash.
4. Kjør visningstest på aktuell `freiaparken` Structure-runde ved mobil, nettbrett og desktop. Kildetilordning og fotoalder må være synlig.
5. Først ved godkjent dokumentasjon: endre `data/places/naeringsliv/oslo/places_naeringsliv/freia_fabrikken.json` og tilhørende generert Place-open. Ingen endring i dette punktet nå.

**Teknisk bildeintegritet i PR er separat fra denne redaksjonelle beslutningen.** Andre kandidater, spesielt Tøyen trafo, har tilsvarende uavklarte kildeporter.
