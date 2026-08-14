# Civication Career Knowledge Bridge v1

Career Knowledge Bridge kobler canonicale `role_scope` i Civication til det eksisterende Fagverket uten å kopiere fagtekst inn i jobbdata.

## Eiergrenser

- Badge eier inngang, tittelstige og eventuelle jobbtilbud.
- `role_scope` eier den delte arbeidsverdenen.
- roleModel og FWG eier arbeid, ansvar, myndighetsgrenser og karrierevei.
- Fagverket eier definisjoner, teorier, metoder, funn, faglig uenighet, case, claims og kilder.
- Broen eier bare stabile referanser og beskriver hvor kunnskapen brukes i jobben.

Kunnskap kan forbedre beslutningsgrunnlag, kvalitet, tillit og risiko. Den gir aldri alene en jobb, akademisk kvalifikasjon, myndighet, forfremmelse eller utnevnelse.

## Hvorfor senere fagverksforbedringer slår gjennom

Jobbfilene peker på canonicale `subject_id`, `topic_id` og `method_id`. Runtime kan lese gjeldende artikkel og metoderegister med `no-store`, og stillingsbeskrivelsens faglige fordypning bygges fra disse kildene. Når en definisjon, metodebeskrivelse, kilde eller faglig uenighet forbedres under samme stabile ID, blir forbedringen tilgjengelig som fordypning uten at jobbfilen må skrives om.

Selve gameplayet er ikke flytende. Hver kunnskapsmail har en versjonert `knowledge_contract` som låser:

- læringsmålet;
- beslutningsregelen spilleren skal bruke;
- den vanlige faglige feilen;
- et legitimt hjelpespor;
- sammenhengen mellom valg og konsekvenser;
- hvilken Fagverk-revisjon kontrakten ble kontrollert mot.

Nye Fagverk-tekster kan derfor aldri automatisk endre hvilket valg som er godt, flytte konsekvenser eller omskrive en mail. En faglig betydningsendring krever manuell review og ny kontraktversjon. Dette gir fast spilldesign med levende fordypning.

En endring er bakoverkompatibel når ID og faglig identitet består. Fjerning eller omdøping av en referert ID er en kontraktsendring og krever eksplisitt migrasjon i `data/Civication/careerKnowledgeBridge.json`. CI-auditen avviser døde referanser, feil område, uferdige artikler, svake kvalitetsporter, ukjente mailreferanser og mailer uten en komplett spikret kunnskapskontrakt.

Ved en midlertidig lastefeil degraderer runtime til en merket uløst referanse. Den fabulerer ikke fagtekst og gir ikke spilleren kunnskapsfordeler.

## Spillmodell

Tre tilstander brukes i en konkret arbeidssituasjon:

- `qualified`: spillerens lagrede Knowledge treffer minst ett av situasjonens canonicale kunnskapssignaler.
- `assisted`: spilleren har relevant fagkunnskap eller støtte, men ikke et sikkert treff på situasjonen.
- `missing`: spilleren mangler dokumentert relevant innsikt.

Broen bruker `advisory` valgpolicy. Manglende kunnskap fjerner derfor ikke automatisk det beste valget. Den gir svakere beslutningsstøtte og gjør hjelp, usikkerhet og risiko synlig. En separat, eksplisitt kontrakt må finnes dersom kunnskap noen gang skal være en hard gate.

## Pilot

Første pilot er `religion/religion_forskning`. Den bruker Religionsfagverkets levende artikler og metoder til:

- en generert stillingsbeskrivelse;
- kunnskapsmailer om analytiske kategorier, intervju/forskningsetikk og arkivstillhet;
- lagret Knowledge som faktisk beslutningsstøtte;
- omvendt oppslag fra et fagverksemne eller en metode til jobbene som bruker det.

Neste roller skal legges til i samme register. Det skal ikke opprettes parallelle fagtekster i roleModels eller mailfamilier.
