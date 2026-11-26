# History Go – medieregister før R2-migrering

## Beslutning 26. november 2026: eierskapsoverføring satt på pause

Brukeren har uttrykkelig pauset arbeidet med å flytte eller omdøpe app-repoet til HistoryGo-kontoen. Appen blir foreløpig i `Paradispartiet/History-Go`. Ingen videre repooverføring, navneendring eller sletting inngår i mediearbeidet. HistoryGo-kontoen er tilkoblet; dette er ikke bevis på at appen er flyttet. FootballManager- og Civication-flytting skal heller ikke gjennomføres som følge av denne planen.

Målet er nå å redusere publisert appstørrelse og videre medievekst ved å lagre bilder separat. Kontobytte alene reduserer verken filstørrelse, Git-historikk eller Pages-grensen. Publiserte Pages-nettsteder har en grense på 1 GB; GitHub beskriver 1 GB som anbefalt grense for kilderepoet. Disse målene må ikke forveksles med komprimert Actions-artefakt eller total Git-størrelse.

### Anbefalt retning

Behold appadresse, kode, quizdata, innlogging og brukerdata der de er. Bruk objektlagring med CDN/cache for godkjente offentlige runtime-bilder. Hold originalmastere og en separat verifisert sikkerhetskopi bevart. Første etappe kopierer bilder uten å slette Git-kilden.

**Teknisk førstevalg: Cloudflare R2 Standard**, under forutsetning av at kontoens abonnement/betalingsvilkår og egnet produksjonsadresse avklares. Gjenbruk eksisterende ti-bilders pilot, register og SHA-256-verifisering. Ikke start en ny parallell opplastingskjede. R2 har 10 GB-måned gratis lagring, 1 million Class A og 10 millioner Class B-operasjoner per måned; direkte utgående trafikk fra R2 er gratis. Dette er kvoter, ikke et løfte om null fremtidige kostnader. Andre tilknyttede tjenester kan koste.

Cloudflares oppstartsveiledning krever R2-abonnement og checkout; faktureringspolicyen omtaler betalingsmiddel og forhåndsautorisasjon. Ikke lov aktivering uten kort, og ikke be brukeren legge inn kort for denne utredningen. Faktisk kontotilgang/aktivering er ikke kontrollert. `r2.dev` er for utvikling, ikke anbefalt produksjonsadresse. Produksjonsdomene og eventuell domeneutgift er åpne punkter.

| Alternativ | Vurdering per 26.11.2026 |
| --- | --- |
| R2 Standard | Førstevalg teknisk: egnet kapasitet og gratis direkte egress; eksisterende pilot. Betaling/abonnement, produksjonsdomene og live cache må avklares. |
| Supabase Free Storage | 1 GB filplass, 5 GB egress og 5 GB cached egress. Historisk bilderegister er allerede omtrent 1,01 GB uten videre vekst. For lite spillerom som samlet bildelager; ikke bland denne oppgaven med auth-/databaseflytting. |
| Backblaze B2 | Mulig objektlager, men offentlig bucket krever verifisert e-post og betalingshistorikk eller en liten kortbetaling. Ikke en bekreftet løsning uten betalingskort. Flere oppsettsledd enn eksisterende R2-pilot. |
| Eget GitHub-medie-repo | Mulig midlertidig oppdeling uten nytt eksternt abonnement, men samme Git-/Pages-problem fortsetter å vokse. Et Pages-basert medielager har også 1 GB-grensen. Hele inventaret skal ikke ukritisk flyttes dit. Ikke anbefalt langsiktig hovedlager. |

Hvis betalingskort fortsatt er uaktuelt og R2-aktivering stopper på dette, behold produksjonen og fortsett avgrenset Pages-opprydding. Ingen av de undersøkte objektlagrene er verifisert som en ferdig offentlig løsning uten betalingsoppsett for denne kontoen. Ikke opprett mange kontoer for å omgå kapasitetsgrenser.

### Gjennomføringsplan for bilder

1. Oppdater inventaret fra faktisk main før flytting. Tallene lenger ned er et historisk øyeblikksbilde, ikke dagens fasit. Skill runtime-varianter fra PNG-mastere, kildefoto, metadata og upubliserte kandidater.
2. Avklar R2-aktivering og produksjonsadresse uten å endre appens egen adresse. Ingen abonnementskjøp eller betalingsopplysninger inngår i denne dokumentasjonsendringen.
3. Kopier de ti aktive musikk-WebPene med eksisterende pilot. Kontroller byte, SHA-256, MIME, lisens og kreditering på hver offentlig URL.
4. Bruk et lite versjonert register fra eksisterende bildesti til innholdsadressert objekt-URL. Behold lokale stier som reserve; aldri skriv ekstern URL blindt over hele katalogen.
5. Test faktiske bilder i merkepanel, Fagverk og stedskort på mobil/iPad/desktop; feil ved ekstern lagring, CORS, CSP og offline må inngå. Ugjennomsiktige cross-origin-svar må ikke antas å kunne lagres av dagens service worker.
6. Utvid i kontrollerte grupper. Utelat en runtime-fil fra Pages først etter at ekstern fil og reservestrategi er verifisert. Mål faktisk utpakket Pages-størrelse og nettverksytelse; en ekstra origin er ikke automatisk raskere.
7. Behold Git-originalene i første etappe. Fjerning fra dagens Pages-bygg reduserer publisert størrelse, men verken sletting i en ny commit eller ekstern hosting krymper gammel Git-historikk. Historikkopprydding krever egen plan, verifisert uavhengig backup og samordning av åpne grener/PR-er; ingen force-push er godkjent her.

### Bekreftet status fra den pausede migreringsøkten

- Ingen eierskapsoverføring er utført gjennom denne samtalen.
- Render-CORS ble utvidet til både `https://paradispartiet.github.io` og `https://historygo.github.io`. Faktiske OPTIONS-tester ga 200 og riktig Allow-Origin for begge etter deploy `dep-dc3u7qlg1s2s73cons10`.
- Denne Render-operasjonen startet automatisk deploy av main `d9d60952`. Databaseverdien ble ikke endret av assistenten.
- Backend-readiness ga fortsatt 503 med `unavailable:OperationalError`; auth-konfigurasjonens sjekk ga ok. Årsaken er ikke fastslått, og dette er ikke bevis på at hele appen er defekt.
- Brukerens maskerte Render-verdi viste allerede Session pooler på port 5432. Tidligere mistanke om direkte IPv6-tilkobling som forklaring er trukket tilbake. Ingen passordreset eller databaseflytting skal gjøres som del av bildeplanen.
- Ingen live R2-opplasting eller sikkerhetskopi er bekreftet gjennom denne samtalen.

### Kilder kontrollert 26.11.2026

- GitHub Pages-grenser: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- R2-priser: https://developers.cloudflare.com/r2/pricing/
- R2-aktivering: https://developers.cloudflare.com/r2/get-started/
- Cloudflare fakturering: https://developers.cloudflare.com/billing/understand/billing-policy/
- R2 offentlige adresser: https://developers.cloudflare.com/r2/buckets/public-buckets/
- Supabase-priser: https://supabase.com/pricing
- Backblaze offentlig bucket og betalingskrav: https://www.backblaze.com/docs/cloud-storage-create-and-manage-buckets

### Kvalitetsvurdering av dokumentasjonsendringen

Korrekthet/evidens 5/5: leverandørkilder og faktiske tester skilt fra antakelser. Dekning 4/5: pause og sammenligning dokumentert; kontovilkår og live pilot er åpne. Redaksjonell kvalitet 5/5: prosjektspesifikk vurdering med konkrete begrensninger. Teknisk integritet 4/5: kun dokumentasjon; tilbake-lesing kreves, ingen runtime-tester nødvendige for denne endringen. Ansvarlighet 5/5: ingen sletting, kjøp, passordendring eller dataflytting. Vedlikeholdbarhet 5/5: eksisterende dokument og pilot gjenbrukes. Totalt 28/30 for beslutningsnotatet, ikke for implementert bildelagring.

[Oppgave #7550](https://github.com/Paradispartiet/History-Go/issues/7550) · [Filregister (TSV)](R2_MEDIA_INVENTORY.tsv)

Registeret dekker alle Git-filer under `bilder/` ved commit `40434413dff74eeeabd037ca2ace1e144d302f40`. GitHub leverte det komplette katalogtreet `7f9a95c80ec1ba3c7a91a2e1bf5fc16950dc247c` uten avkorting.

| Filgruppe | Filer | Byte |
| --- | ---: | ---: |
| Bildeendelse (AVIF, GIF, JPG, PNG, SVG, WebP) | 2 170 | 1 017 056 529 |
| Øvrige filer | 23 | 29 669 |
| Totalt | 2 193 | 1 017 086 198 |

Hver rad viser filsti, filgruppe, byte og Git-blob-ID. Filgruppen er basert på endelse. De øvrige filene er blant annet dokumentasjon og JSON-metadata. Registeret beskriver innholdet i Git på den oppgitte commiten og gir grunnlag for å spore endringer. Det gir ingen godkjenning for flytting eller publisering. Aktiv bruk, lisens og kilde må avklares per fil før den tas med i en opplastingsgruppe.

### Oppdatering fra komplett main-tre 26. november 2026

Sammenlignet med forrige register: 11 nye stier, 0 endrede filer og 0 fjernede stier. Alle 2 193 rader er kontrollert mot unik filsti, byteantall og Git-blob-ID. De ti eksisterende SHA-256-verdiene og kandidatnøklene er beholdt bare fordi blob-ID og byteantall fortsatt samsvarer; øvrige SHA-256-felt er tomme. Ingen nye objekter er merket verifisert i R2. Filendelse er inventarklassifisering, ikke MIME-, lisens- eller runtime-godkjenning.

## Musikkpilot

[PR #7539](https://github.com/Paradispartiet/History-Go/pull/7539) videreførte piloten. [Actions-kjøring 45654760338](https://github.com/Paradispartiet/History-Go/actions/runs/45654760338) fullførte `inventory`. Jobben `mirror` ble hoppet over. Jeg fant ingen R2-kjøring blant de 46 manuelle kjøringene GitHub returnerte ved kontrollen.

Registeret inkluderer SHA-256 og foreslått R2-nøkkel for de ti aktive WebP-bildene fra kjøringens `r2-media-inventory`-rapport. Alle ti har samme Git-blob-ID og byteantall på `main` som i rapportens kildecommit `150a2e0c197263dd1e2206c35935aeb6f607642c`. Tomme felt betyr at registeret mangler en beregnet SHA-256 og R2-nøkkel for den filen. En foreslått nøkkel er ingen bekreftelse på at objektet finnes i R2.

En fullført `mirror`-jobb skal levere `r2-media-verified` med ti offentlige URL-er. Eksisterende pilotkode sjekker HTTP-status, innholdstype, størrelse og SHA-256 mot Git-kilden. Det observerte artefaktet er en lokal inventarrapport. Status for objektene i R2 er uverifisert.

Ved en godkjent opplasting gjenbrukes den manuelle piloten fra `main` med `upload=true` og miljøet `r2-media`. Før appen bytter URL-er, må de ti objektene verifiseres og merker, fallback og frakoblet bruk prøves i appen.
