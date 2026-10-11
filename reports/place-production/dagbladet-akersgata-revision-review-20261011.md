# Dagbladet – rettelser og gjenstående produksjonsport

Branch: `production/dagbladet-akersgata-20261010`, PR [#6211](https://github.com/Paradispartiet/History-Go/pull/6211). Base `c19467307501d99f5237eab0d561e2a1373fc39e`. Implementasjonen er kontrollert i kildecommit `7fbebfbf695b501869306de8416ffa43b7b7d267`, med faktisk nettleserevidens i `89ecb964060e423c05fc4fe839a6693bf274b451`. Dette er en oppfølgende review, ikke en erklæring om fullført stedsproduksjon.

## Rettet

- Lesespor hadde den ugyldige verdien `recognized_publication`. Den ene Dagbladet-oppføringen bruker nå schemaets `recognized`; teksten og kildeartikkelen er bevart.
- Fagverkets adresselinse har et konkret, fullstendig spørsmål om grunnleggelsen i 1869 og innflyttingen i 1967. Begge allerede kontrollerte fasadefotografienes kildesider er ført opp i Fagverkets kildebank og som navngitte synlige lenker. Stedet har nå ti slike kilder.
- Den canonical personbeskrivelsen viser Stanghelles Dagbladet- og Aftenposten-perioder. Den eksisterende claim-koblingen er oppdatert til de riktige biografiske påstandene. Masterens primære sted og år er bevart.
- Place-open kunne fylle Stories mens aggregatet lastet. Den globale lasteren la så samme historie til en allerede fylt stedsindeks. Indeksene bygges nå på nytt fra dedupliserte aggregat-/payload-data. En kjørbar test dekker denne rekkefølgen, manglende historier i aggregatet og gjenåpning.
- Mobiloverskriften bruker egen fullbredderad; Brand-listen bruker riktig bildekolonne og viser hele logoen. CSS-versjonen og den eksisterende versjonstesten er oppdatert sammen.
- Place-open, People-shard, Lesespor-runtime, quizkontekst og personindeksene er regenerert fra canonical data. Civication får bare sine nødvendige avledede personfiler; ingen motor, scenarioforfatterdata eller History Go-kontrakt er endret.
- Bildebacklogens summary er regenerert fra den faktiske globale bildeauditen: Dagbladets gyldige stedsbilde øker lokale gyldige bilder fra 119 til 120 og reduserer manglende fra 1270 til 1269. De ni eldre ugyldige stedsbildene utenfor denne produksjonen er fortsatt eksplisitte i backloggen.

## Utført validering

`npm run place:verify -- dagbladet_akersgata` og de fem Dagbladet-integrasjonstestene består. `node scripts/audit-fagverk-place-pages.mjs`, `node dist/tools/validate_lesespor.mjs`, `node tools/audit-people-profile-canonical.mjs` og `bash scripts/check-people.sh` består. Lesespor har 17 eksisterende advarsler; ingen global advarselsfrihet hevdes.

Stories-/Place-open-/Lesespor-regresjonene har 11 beståtte tester. Dagbladet, Place Sheet-skallet og samlingsvisningen har 23 beståtte tester. Unified Place-overflate og avledede scenario-People har 12 beståtte tester. `build:web` er kjørt; kilde og commit-bundle er synkronisert. Scenario-People og bildebacklog består sine eksplisitte sync-kontroller.

[Actions 38139378858](https://github.com/Paradispartiet/History-Go/actions/runs/38139378858) består faktisk app-kontroll på 320×844, 390×844, 768×1024 og 1440×1000. Én canonical/indexert/synlig fortelling på hver bredde, ingen orddeling inne i tittelordene, full logo uten tekstoverlapp, begge samlinger åpner, QuizCard flipper/utvider/lukker, og kuratert Fagverk åpner. Null JavaScript-sidefeil. Alle 14 skjermbilder er manuelt gjennomgått i egen review. Dette er emulert Chromium, ikke native Safari eller fysisk iPad.

Ordinær CI kontrollerer den endelige oppfølgingscommit-en etter at engangsworkflowen fjernes. Resultatene skal avleses på PR-ens faktiske head, ikke arves fra kildecommit-en eller gamle kjøringer.

## Avgrenset videre bildeundersøkelse

Commons-kategorien [Dagbladet](https://commons.wikimedia.org/wiki/Category:Dagbladet) ble åpnet på nytt 11. oktober. De 16 direkte filene omfatter eldre norske forsider fra 1905/1910, en dansk avis fra 1851, bygnings-/personfotoer og logoer. Ingen av disse er et rettighetsavklart medlemsbilde av den konkrete norske utgivelsen fra Akersgata 49-perioden.

Søk i utgiverens Magasinet-/nettjubileumsmateriale og museums-/pressefotoarkiver ga historiske kandidater, men ingen ny kontrollert tillatelse til å publisere et passende utgivelsesbilde. Et datert Dagbladet-pressefoto er ikke automatisk bevis på hvilken avisutgave det ble publisert i. Ingen ny kandidat har derfor passert både periode, konkret publikasjon, bildefil og gjenbruksrettigheter.

**Gjenstående praktiske port:** minst ett autentisk medlemsbilde av en identifisert Dagbladet-utgivelse fra 1967–2008, med kontrollert kilde og tillatelse/lisens for bruk i History Go. Kvalifiserte utgivelser finnes; manglende bilde er fortsatt BLOCKED. Objects beholder den dokumenterte N/A-avgjørelsen. Den gamle UI-blockeren er fjernet; endelig visuell review av hele produksjonen avventer Utgivelser.

## Seksdelt kvalitetsvurdering etter rettelsene

| Dimensjon | Score | Evidens / begrensning |
| --- | --- | --- |
| Korrekthet og evidens | 4/5 | 33 sted-claims og biografiske claims; de nye setnings-/kildekoblingene er gjennomgått, ingen historisk påstand er lagt til uten tidligere kontrollert belegg. |
| Dekning og ferdigstillelse | 3/5 | Tidligere UI-/CI-avvik er rettet, men én kvalifisert samling mangler sitt medlemsbilde. |
| Faglig/redaksjonell kvalitet | 4/5 | Stedsspesifikt innhold og quiz; adressespørsmålet er presisert og Stanghelles listebeskrivelse viser riktig stedstilknytning. |
| Teknisk integritet | 4/5 | Målrettede tester, auditer, generert sync og fire faktiske nettleserprofiler består. Globale legacy-mangler er fortsatt synlige. |
| Sikkerhet og ansvarlighet | 4/5 | Kontrollerte bildelisenser og tydelig illustrasjonsmerking; uklar bildeproveniens er ikke godkjent. |
| Vedlikeholdbarhet og etterprøvbarhet | 4/5 | Rotårsaksretting, regresjon for lastingsrekkefølgen, canonical eiere, avledede projeksjoner og daterte skjermbilder. |

**23/30. Kvalitetsporten for fullproduksjon består ikke.** PR-en forblir utkast og V3-state blocked. Ingen merge eller ferdigstatus for Dagbladet kan avledes av at den implementerte visningen og tekniske kontrollene består.
