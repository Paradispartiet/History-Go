
Typer items (kind)

Wonderkammer støtter flere typer pekere:

kind: "place"
	•	leder til nytt sted (place popup)
	•	brukes for:
	•	parallelle steder
	•	maktakser
	•	nisjemiljøer

kind: "person"
	•	leder til person popup
	•	brukes når personen er en inngang videre, ikke bare deltaker

kind: "institution"
	•	forlag, organisasjoner, maktsentre
	•	fungerer som knutepunkt

kind: "practice"
	•	praksiser må alltid peke videre
	•	eksempel:
	•	“Stortingets åpning → Stortinget”

kind: "work"
	•	verk fungerer som noder
	•	kan senere kobles til:
	•	søk
	•	knowledge
	•	emnekart

kind: "trace"
	•	historiske spor / tapte steder
	•	peker bakover i tid eller sideveis i byen

⸻

Place-Wonderkammer (standard)

Place-Wonderkammer er det viktigste laget og følger en fast rekkefølge.

Standard kamre (maks 6)
	1.	Personer som fører videre
	2.	Steder i samme krets (lokalt)
	3.	Steder i samme tradisjon (utenfor byen)
	4.	Praksiser → nye steder
	5.	Institusjoner / knutepunkt
	6.	Historiske spor / tapte steder

Du kan utelate kamre, men rekkefølgen skal ikke endres.

Anbefalt omfang:
	•	5–12 items totalt per sted

⸻

People-Wonderkammer (bevisst asymmetri)

People har allerede relasjoner.
People-Wonderkammer brukes kun når det gir merverdi.

Når brukes People-Wonderkammer?
	•	litterært / faglig slektskap
	•	intellektuelle linjer
	•	kuraterte paralleller
	•	verk og institusjoner som ikke fanges av relasjoner

Når brukes det ikke?
	•	perifere personer
	•	personer med én enkel kobling
	•	der relasjoner er tilstrekkelig

Typiske kamre for personer
	•	Litterært / faglig slektskap
	•	Europeisk / internasjonal linje
	•	Institusjoner
	•	Verk (som noder)

Eksempel: Dag Solstad (litteraturhistorisk, ikke sosialt).

⸻

UI-regler (viktig)
	•	Wonderkammer vises som seksjoner i popup
	•	Ingen lange tekstblokker
	•	Ingen forklarende avsnitt
	•	Titler er korte og presise
	•	Items er alltid klikkbare eller tydelig “leder videre”

Brukeren skal føle:

“Her kan jeg gå videre.”

Ikke:

“Dette må jeg lese ferdig.”

⸻

Kvalitetssjekk (bruk denne)

Et Wonderkammer er godt nok hvis:
	•	man kan klikke minst 3 steg videre
	•	hvert klikk åpner noe nytt
	•	ingenting føles abstrakt
	•	ingenting må forklares

Hvis ikke → kutt.

⸻

Arbeidsflyt (systematisk videre)

Når du legger til et nytt sted:
	1.	Legg stedet i places.json
	2.	Legg faktiske koblinger i relations.json
	3.	Finn 3 sterke veier videre
	•	én person
	•	ett parallelt sted
	•	én praksis eller institusjon
	4.	Legg disse i wonderkammer.json
	5.	Test navigasjon i appen

Wonderkammeret skal vokse organisk, ikke fylles ferdig.

⸻

Designprinsipp (kort)

Wonderkammeret er:
	•	frivillig
	•	utforskende
	•	retningsgivende

Det er ikke:
	•	pensum
	•	forklaring
	•	fasit

⸻

Status og videre arbeid
	•	Wonderkammer er aktivt for:
	•	Tronsmo
	•	Slottet
	•	Stortinget
	•	Akershus festning
	•	utvalgte personer (Dag Solstad m.fl.)
	•	Systemet kan skaleres til nye steder uten refaktorering

⸻

Dette dokumentet er kontrakten for Wonderkammeret.
Hvis noe bryter med dette → det skal ut.



Godt sett – det bør med, og det er faktisk helt sentralt for det du bygger.

La meg legge det inn presist og uten fluff, og også vise hva det betyr operativt (ikke bare historisk).

⸻

Hukommelsesteateret (Memory Theatre) – hvorfor Wonderkammeret finnes

Historisk bakgrunn (kort og korrekt)

I renessansen og tidlig moderne tid (1500–1600) oppsto ideen om hukommelsesteateret (theatrum memoriae):
	•	verden forstått som et rom man beveger seg i
	•	kunnskap ordnet romlig, ikke lineært
	•	minner festes gjennom steder, figurer og assosiasjoner

Det mest kjente prinsippet:

Man husker ved å gå.

Wonderkammeret og hukommelsesteateret er søsken:
	•	Wonderkammeret samler objekter og forbindelser
	•	Hukommelsesteateret organiserer dem i et mentalt rom

⸻

Hva dette betyr i History GO

History GO er bokstavelig talt et hukommelsesteater:
	•	byen = scenen
	•	steder = rom
	•	personer = aktører
	•	relasjoner = innganger og overganger
	•	Wonderkammer = kulissene som leder videre

Brukeren lærer ikke ved å lese,
men ved å bevege seg mellom rom.

⸻

Wonderkammerets rolle i hukommelsesteateret

Wonderkammeret er ikke kunnskap i seg selv.

Det er:
	•	et orienteringsapparat
	•	et sett med innganger til hukommelse
	•	en måte å gjøre byen til et minnesystem

Derfor er reglene så strenge:
	•	ingen forklaringer
	•	ingen teorier
	•	bare veier videre

For forklaringer bryter hukommelsen – bevegelse bygger den.

⸻

Praktisk konsekvens (viktig)

Dette er grunnen til at:
	•	Wonderkammer kun finnes i popupen
	•	Wonderkammer ikke er en egen side
	•	Wonderkammer ikke har lange tekster
	•	Person-Wonderkammer er selektivt
	•	Relasjoner og Wonderkammer er adskilt

Alt dette er ikke designvalg –
det er hukommelsesteater-prinsippet anvendt i software.

⸻

