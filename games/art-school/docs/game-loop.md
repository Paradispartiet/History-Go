# Første game-loop for Kunstskolen

1. Spilleren starter på **Kunstskolen**.
2. Spilleren får første oppgave: tren blikket ved å studere ett kunstverk.
3. Spilleren velger et kunststed eller en kunstner.
4. Spilleren studerer ett kunstverk med korte observasjonsspørsmål.
5. Spilleren gjør én av tre oppgavetyper: observasjon, analyse eller skisse.
6. Spilleren får progresjon i `blikk`, `teknikk` eller `kunsthistorie`.
7. Resultatet lagres som et `PortfolioItem` i portfolio/galleri.
8. Neste oppgave låses opp.

Loop-en skal først kunne spilles lokalt med seed-data. History Go-kobling kommer senere via referansefelt, ikke direkte import av runtime eller datafiler.
