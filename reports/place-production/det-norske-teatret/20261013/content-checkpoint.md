# Det Norske Teatret — innholdscheckpoint B

Base: `bc760241137443d67db5bf3534bb47e8fe14f24b`. Kilde- og redaksjonell kontroll: 13. oktober 2026.

## Leveransen

Historisk ingress og seksavsnittsartikkel erstatter generisk institusjonsprosa. Institusjonen fra 1912 skilles fra hovedhuset fra 1985. Oslo-premieren i 1913 plasseres uttrykkelig i Bøndernes hus. Kongelig åpning 6. mai og åpningsforestilling 19. september 1985 har forskjellige betydninger.

Place eier et selvstendig fullnivå-Fagverk: sju avsnitt, fem linser, seks undersøkelsesspørsmål, ti begreper, tre observerbare spor, fem Scenekunst-emner og tre kapitler. Dokumenterte case er Cats 1985 og Tid for glede 2022. Beckers perspektiv på kollektiv handling og hans uenighet med Bourdieus feltbegrep er tydelig attribuert. Produksjonskreditering er ikke bevis for konkrete prøvevalg, maktforhold eller publikumsopplevelse. Sceneteppet er et betinget innendørsspor.

Beskrivelsespakken har 21 verifiserte claims med konkrete kildesteder og dekning av alle 29 setninger i ingress/artikkel. Fagverkets feltkoblinger og den separate bildeclaimen finnes i `content-review.json`. Definisjoner og metodegrenser peker til leste canonicale Scenekunst-emner på immutable base. Readiness-spørsmålene i pakken er ikke aktive quizsett.

Hovedfotoet er Hans A. Rosbachs uendrede Commons-original fra 2006, med CC BY-SA 3.0-kreditering og proveniens. Eksakt fotodato er uavklart; kun året oppgis. Bildets dato er dokumentasjonsmetadata, ikke et nytt hendelsesanker. Engelsk, spansk og portugisisk har hele artikkelen og kildehash `e8ac7d0e0a5b3710`.

Generert stedsindeks, place-open-payload, epokeindeks, Fagverk-release og dekningsrapport er synkronisert. Nye claims om eldre spillesteder er `institution_context` og blir ikke bygningshendelser. Den eksisterende 1913-Storyen og dens allerede materialiserte epokekobling er ikke revidert her; stedseierskapet gjenstår til Story-checkpointet.

## Utført verifikasjon

- `node scripts/place-production-rule-preflight.mjs validate --workcard reports/place-production/det-norske-teatret-workcard-current.json`: PASS, regelfilhashene er aktuelle.
- `node scripts/validate-place-description-production-v4_2_policy.mjs --all`: 190 pakker, 179 ready, null blokkerende feil. Ordtall og quizløse Micro Places behandles av eksisterende policy.
- Beskrivelses-, lengde-, ingress- og READ-FIRST-regresjoner: 30/30 tester bestått.
- `node scripts/audit-fagverk-place-pages.mjs`: PASS; 111 curated totalt. Fem Fagverk-testfiler: 36/36 tester bestått.
- Direkte JSDOM-gjengivelse med faktisk Place-source, generert payload, faktisk `fagverk-subject-core.js`, `fagverk-subject-model.js` og renderer: sju artikkelavsnitt, fem operative emnelinser, seks spørsmål, tre spor, fem emner, tre kapitler og ni operative kildelenker. Ufullført-fallback er skjult for dette Fagverket.
- `npm run places:index:check`, `npm run place-open:check`, `npm run epoker:places:check`, `node scripts/build-fagverk-release-manifest.mjs --check` og `npm run places:emner:check`: PASS. Koordinater og adressemetadata er uendret.
- `node scripts/check-place-i18n-freshness.mjs det_norske_teatret`: PASS for en/es/pt. Alle tre oversettelser er gjennomgått mot originalen, har seks avsnitt og bevarer navn, årstall, adresser og produksjonsroller.
- `node scripts/audit-place-images.mjs --mode=all --verify-summary=data/places/place_image_backlog_summary.json`: summary-paritet PASS; hovedfotoet finnes lokalt og er visuelt kontrollert. Global backlog er fortsatt 1266 manglende og ni ugyldige bilder ved andre steder.
- `git diff --check`: PASS. Endringsscope er gjennomgått: én Place-source, tilhørende packet, oversettelsesoppføringene, bilde og nødvendige indekser/rapporter.

Den eldre `i18n-quality-places.js`-auditen feiler med 741 `extra_translation_id`-feil for hvert av en/es/pt. De samme 741 feilene er reproduksjonstestet med de uendrede dataene fra basecommit. Årsaken er at kvalitetsauditens `rows()` ikke leser individuelle Place-objekter i det gjeldende manifestet. Dette er ikke en bestått global audit. Ingen endring av auditmotoren inngår i dette checkpointet; den stedsspesifikke freshness-porten og direkte tekstkontrollen er bestått.

GitHub CI på eksakt publisert PR-head, changed-description-scope og changed-image-port kontrolleres før merge. Disse skal ikke regnes som utført ut fra lokal status alene. Live-nettlesergjennomgang utføres etter Pages-publisering.

## Seksdelt kvalitetsvurdering

Vurderingen gjelder kun checkpoint B, ikke hele stedspakken. Selvkontroll av Codex; uavhengig menneskelig godkjenning er ikke hevdet.

| Dimensjon | Score | Evidens og grense |
|---|---:|---|
| Korrekthet og evidens | 5/5 | Konkrete kildesteder, 21 tekstclaims, setningsdekning og eksplisitte adresse-/datogrenser; fotodatoens usikkerhet oppgis. |
| Dekning og ferdigstillelse | 4/5 | Alle tekster og tre oversettelser i checkpoint B gjennomgått. Full Place, separat frontImage, People, samlinger og quiz står åpne. |
| Faglig/redaksjonell kvalitet | 4/5 | Historien kommer først; eget Fagverk med to dokumenterte case, attribuert teoriuenighet og kildekritiske metoder. Hele innholdet er lest. |
| Teknisk integritet | 4/5 | 66 relevante regresjoner, faktisk modellgjengivelse og deterministiske synkroniseringsporter består. Live mobil/iPad og eldre global oversettelsesaudit er ikke erklært bestått. |
| Sikkerhet og ansvarlighet | 5/5 | Dokumentarfoto med lisens/proveniens; ingen spillerprogresjon skrevet. Ingen udokumentert konflikt eller estetisk effekt tilskrives medvirkende. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Place er innholdseier; registry er indeks. Claims, metadatahash, asset-hash og genererte data er sporbare. Daterte baseline-filer beholdes. |

**27/30.** Lokal kvalitetsport består for det avgrensede checkpointet. Merge krever i tillegg grønn CI på eksakt PR-head. Full Place-production forblir `in_progress` med `universal_core_status: BLOCKED`.

## Neste delcheckpoint

Kildeavgrenset People-gjennomgang og portretter, ekte Forestillinger-medlemmer med bildeproveniens, separat frontImage, Story-eierskap og de øvrige innholdssporene. Quiz og QuizCard behandles i det planlagte separate quizløpet. Ingen reservesamlinger eller filler er opprettet.
