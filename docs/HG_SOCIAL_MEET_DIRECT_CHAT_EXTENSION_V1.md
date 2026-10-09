# Social Meet → privat chat i AHA (2026-10-09)

## Vedtatt utvidelse av Social Meet

Tidligere Social Meet v1 tillot kun preset-baserte invitasjoner og forbød fri chat. Den begrensningen gjelder **fortsatt før gjensidig aksept**, i discovery, i invitasjonspayloaden og i History Go-kjernen. Denne endringen tillater **privat fritekstsamtale etter at mottakeren eksplisitt har akseptert en ekte, servereid Spotmeeting-invitasjon**.

Det er ingen åpen DM mot fremmede, ingen fritekstinvitasjoner, og akseptert møte innebærer **ikke** automatisk AHA-vennskap.

## Teknisk eierskap

- History Go Social Meet eier profil/discovery, møteinvitasjoner, samtykke, blokkering og moderering.
- AHA eier én delt meldingstjeneste: `public.aha_friend_requests` og `public.aha_friend_messages`.
- `source='friend'` krever AHA-venneinvitasjon og særskilt aksept.
- `source='social_meet'` oppstår kun via servervalidert Supabase RPC `aha_open_social_meet_chat`, med `hg_spotmeeting_invites` som eneste autoritet.
- RPC binder `auth.uid()` mot faktisk sender/mottaker, kontrollerer begge AHA-profiler, aktivt møte eller gjennomført møte, HG-blokkering, HG-suspensjon og AHA-blokkering. En tilfeldig invitasjons-ID gir ikke tilgang.
- RLS kontrollerer samme grenser ved **hver** melding og lesing. Avslått, kansellert, blokkert, rapportert, utløpt eller falsk invitasjon gir ikke meldingstilgang. Gjennomført møte kan fortsette som kontakt.
- Frontend sender aldri GPS, besøkslogg, stedsstatus, historiske quizsvar eller Social Meet-persondata til AHA.
- Social Meet viser `Privat chat` kun fra ekte `fastapi`-inbox med UUID og status `accepted` / `completed`; lokal demo og fallback viser ingen chatknapp.
- Chatten åpnes i eget innrammet AHA-grensesnitt inne i Social Meet. Brukeren må være innlogget med samme verifiserte Supabase-konto og begge må ha opprettet AHA-profil.
- Chat blir ikke automatisk AHA-minne, kunnskap eller AI-treningsmateriale. Ikke ende-til-ende-kryptert.

## Separat vennskap

Når chatten er åpnet etter møte, er brukerne **kontakter**, ikke venner. AHA viser disse separat i `Kontakter fra Social Meet`. `Bli venner` oppretter en egen AHA-venneinvitasjon, som mottakeren må godta.

## Utrullingsporter

1. AHA-migrasjonen `supabase/social-meet-direct-chat.sql` må være testet og lagt til i rett produksjonsdatabase.
2. AHA-PR må være merget og publisert før History Go-PR åpnes for reelle brukere.
3. Både AHA og History Go CI må være grønne på respektive eksakte head.
4. Ekstern flerkontotest med innlogget AHA + History Go, blokkering og kansellering må gjennomføres før allmenn markedsføring. Ingen test uten påloggede kontoer kan dokumentere full produksjonsflyt.

Denne utvidelsen er kun et tillegg til Social Meet-laget, ikke en endring av History Go core.
