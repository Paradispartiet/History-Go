# Oslo v1 – fire bildekandidater produsert 18. oktober 2026

**Ferdig produsert:** 4 steder × 3 alternative WebP-utgaver = **12 faktiske bildefiler**.
GitHub Actions: [bestått kandidatproduksjon](https://github.com/Paradispartiet/History-Go/actions/runs/39149263676).
Ingen plasser er oppgradert til `v1`, og ingen levende PlaceCard-bilder er byttet.

## Visuell gjennomgang

[Åpne kontaktark med ekte 1400×900 hero og 900×1350 portrett i samme rad](editorial-contact-sheet.jpg).

| Sted | Alternativ motiv | Hero | Portrett | Kort | Opphav og vilkår |
| --- | --- | --- | --- | --- | --- |
| Groruddammen | Dammen sett ovenfra i Grorudparken | [hero](../../bilder/places/candidates/oslo-v1-20261018/groruddammen_hero.webp) | [portrett](../../bilder/places/candidates/oslo-v1-20261018/groruddammen_portrait.webp) | [kort](../../bilder/places/candidates/oslo-v1-20261018/groruddammen_card.webp) | Ida Tolgensbakk, [CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:Groruddammen_seen_from_above..JPG) |
| Alna ved Bryn | Brynfossen – mer synlig elv | [hero](../../bilder/places/candidates/oslo-v1-20261018/alna_bryn_hero.webp) | [portrett](../../bilder/places/candidates/oslo-v1-20261018/alna_bryn_portrait.webp) | [kort](../../bilder/places/candidates/oslo-v1-20261018/alna_bryn_card.webp) | PaulVIF, [CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:Brynfoss.JPG) |
| Blå | Interiøret på spillestedet | [hero](../../bilder/places/candidates/oslo-v1-20261018/blaa_hero.webp) | [portrett](../../bilder/places/candidates/oslo-v1-20261018/blaa_portrait.webp) | [kort](../../bilder/places/candidates/oslo-v1-20261018/blaa_card.webp) | Marthe Thu (opplasting Blaaoslo), [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Bl%C3%A5_04.jpg) |
| Rockefeller | Soen-konsert ved Rockefeller februar 2026 | [hero](../../bilder/places/candidates/oslo-v1-20261018/rockefeller_hero.webp) | [portrett](../../bilder/places/candidates/oslo-v1-20261018/rockefeller_portrait.webp) | [kort](../../bilder/places/candidates/oslo-v1-20261018/rockefeller_card.webp) | Birgit Fostervold, [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Soen_in_Oslo_2026_-02.jpg) |

### Kontroller utført

- Wikimedia Commons API gav gyldig lisens, fotografmetadata og faktisk bildefil for **4/4**.
- 12 WebP-filer er kontrollert mot 1400×900, 900×1350 og 900×600.
- Eget kontaktark er generert. Bildenes utsnitt er styrt eksplisitt per format, ikke overlatt til tilfeldig CSS-beskjæring.
- Eksisterende `bilder/places/<id>.webp`, `frontImage`, `cardImage` og runtime-data er uendret.
- [Maskinlesbart resultat](report.json): 4 produsert, 0 holdt, 0 endelige v1-godkjenninger.

### Redaksjonell port før publisering

Vurder hvert motiv faktisk i kontaktarket og i PlaceCard: stedsgjenkjennelse, vann/elv eller sceneidentitet, ansikter/lys og fravær av utilsiktet klipping. Kontroller 390 og 768 px hvis runtime-bindinger endres i en egen PR. Ved godkjenning kan kandidatfilene brukes som nye lokale bildefiler med kilde/creator/lisens/transformasjon synkronisert i canonical place-file, runtime og indeks.

**Ikke kall denne PR-en en bildepublisering.** Den produserer alternative filer og bevarer eksisterende v1-kandidatstatus til visuell godkjenning.
