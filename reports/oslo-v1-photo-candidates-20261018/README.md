# Oslo – fire utvalgte stedsfoto, 18. oktober 2026

Fire fotografier er valgt redaksjonelt og koblet inn i canonical Places, `places_index.json` og `data/runtime/place-open`. Hvert sted bruker tre separate WebP-filer: hero 1400×900, portrett 900×1350 og kort 900×600.

Dette er bildepublisering for fire eksisterende steder. `v1_candidate` og `v3_complete` endres ikke. En Chromium-kontroll ved mobilbredde er ikke fysisk mobilkontroll eller endelig v1-godkjenning.

## Motiver og utsnitt

[Kontaktark med hero og portrett](editorial-contact-sheet.jpg). Alle tolv faktiske bildefiler er visuelt gjennomgått, inkludert kortformatet. De ferdig produserte kandidatfilene brukes direkte; gamle bildefiler overskrives ikke.

| Sted | Motiv og vurdering | Fotograf og kilde |
| --- | --- | --- |
| Groruddammen | Dammen og parktrappene sett ovenfra. Vannflaten beholdes i både portrett og banner. | Ida Tolgensbakk, [Commons](https://commons.wikimedia.org/wiki/File:Groruddammen_seen_from_above..JPG), CC BY-SA 3.0 |
| Alna ved Bryn | Brynfossen med synlig vannføring. Bannerets fokus er senket til elva; bygningen gir stedskontekst. | PaulVIF, [Commons](https://commons.wikimedia.org/wiki/File:Brynfoss.JPG), CC BY-SA 3.0 |
| Blå | Varmt interiørlys, rom og publikum. Et bevisst interiørmotiv; ikke en fasadeoversikt. | Marthe Thu / opplasting Blaaoslo, [Commons](https://commons.wikimedia.org/wiki/File:Bl%C3%A5_04.jpg), CC BY-SA 4.0 |
| Rockefeller | Soen-konsert i februar 2026. Portrettet prioriterer vokalist og scene; gitaristen til høyre faller delvis utenfor. | Birgit Fostervold, [Commons](https://commons.wikimedia.org/wiki/File:Soen_in_Oslo_2026_-02.jpg), CC BY-SA 4.0 |

Kilde, fotograf, lisenslenke, bearbeiding og per-format utsnittsinnstillinger finnes i `imageMeta`, `frontImageMeta` og `cardImageMeta`. De opprinnelige Commons-metadataene er bevart i [produksjonsrapporten](report.json). Lisensene er [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) og [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## Kontroller og funn

- Produksjon: [4 steder / 12 filer produsert](https://github.com/Paradispartiet/History-Go/actions/runs/39149263676).
- Lokal bindingkontroll: alle tolv filer er gyldig WebP i forventet størrelse, alle fire canonical/indeks/runtime-bindinger og rettighetsfelt samsvarer.
- `node --test tests/oslo-v1-image-composition.test.mjs`: 3/3 består.
- Nettleserkontroll: [8/8 består ved 390 og 768 px, inkludert hele PlaceCard-tittelen](https://github.com/Paradispartiet/History-Go/actions/runs/39151941149).
- [Maskinlesbar nettleserrapport](browser-report.json) og faktiske PlaceCard-skjermbilder ligger i workflow-artifaktet.
- Visuell gjennomgang omfatter hero og portrett ved begge bredder, samt de fire kortutsnittene. QuizCard-baksidene kontrolleres for faktisk innhold og avklippet overskrift.
- Første skjermbildegjennomgang avdekket at pinned hero beholdt gammel høyde ved bytte til en lengre tittel. Høydemålingen er rettet for endret sted, bredde og tittelrad, og nettleserkontrollen krever nå at hele PlaceCard-tittelen ligger innenfor hero.
- Klikktesten bruker vanlig pointer-hit-kontroll på kortets nedre venstre del; et tvunget senterklikk kunne treffe den festede bildeheaderen etter automatisk scrolling.
- Produksjonsskriptet validerer en allerede materialisert bolk uten nettverkskall, overskriving eller sletting. Delvis eksisterende bolk stoppes før endringer.

## Kvalitetsvurdering – bildepublisering

| Dimensjon | Score | Evidens |
| --- | --- | --- |
| Korrekthet og evidens | 5/5 | Fire dokumenterte Commons-originaler; fotograf, lisens og kilde samsvarer med de tolv filene og alle bindingene. |
| Dekning og ferdigstillelse | 5/5 | Alle fire steder har tre varianter og synkronisert indeks/runtime. |
| Redaksjonell kvalitet | 4/5 | Alle motiver og formatutsnitt er vurdert; konsert/interiør er tydelig beskrevet som slike. |
| Teknisk integritet | 4/5 | Statiske kontroller, målrettet Chromium og PR-kontroller. Fysisk mobil er ikke kontrollert. |
| Sikkerhet og ansvarlighet | 5/5 | Lisens, opphav og bearbeiding er sporbare; gamle filer bevares; ingen udokumentert v1-oppgradering. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Utsnittsdata, metadata, nettleserrapport, skjermbilder og trygg gjentatt scriptkjøring. |

**Sum 28/30 for bildeleveransen. Motiver og utsnitt er redaksjonelt godkjent etter gjennomgang av alle fire steder ved begge bredder. Endelig merge følger den ordinære PR-porten.**
