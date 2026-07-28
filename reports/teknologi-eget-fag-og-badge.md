> **Status 2026-07-28:** Denne beslutningen er erstattet. Teknologi er nå en canonical spesialisering under toppmerket **Vitenskap & teknologi**. Rapporten beholdes som historikk.

# Teknologi som eget fag og badge

Status: **grunnlag etablert og validert**

## Beslutning

`teknologi` etableres som selvstendig runtime-kategori, fag-id og badge. `vitenskap` går tilbake til å være Vitenskap og beholder empirisk/formell kunnskapsproduksjon. Teknologi overtar ingeniørfag, maskiner, elektronikk, programvare, data, nettverk, robotikk, cybersikkerhet og digital infrastruktur.

## Omfang

- 18 canonical toppkategorier
- 7 teknologiske fagområder
- 14 aktive teknologi-emner
- 13 teknologi-metoder
- 7 pensummoduler
- 21 teorihooks i fagkartet
- 13 badge-nivåer

## Kategorigrense

Vitenskap spør primært hvordan vi vet. Teknologi spør hvordan konstruerte systemer virker, bygges, testes, vedlikeholdes og påvirker samfunnet.

Bedriften som virksomhet er normalt næringsliv. Medieinnholdet er media. Den tekniske løsningen er teknologi.

## Migrering

Eksisterende steder og quiz flyttes ikke automatisk. `data/fag/vitenskap/teknologi_it_extension_v1.json` er gjort om til en migreringspeker. Flytting av `em_vit_it_*` og steder skal skje i dokumenterte, evidensbaserte batcher.

## Validering

`tools/validate-teknologi-foundation.mjs` kontrollerer fagpakken. `scripts/audit-category-governance.mjs` kontrollerer at kontrakt, manifest, badgeindeks, quizregister, DomainRegistry, kategori-UI og place-policy har identiske kategorisett.
