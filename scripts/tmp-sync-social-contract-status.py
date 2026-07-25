from pathlib import Path
import json

root = Path(".")
verified = "2026-07-26"


def replace_once(path: str, old: str, new: str) -> None:
    file = root / path
    text = file.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Mangler forventet tekst i {path}: {old[:120]}")
    file.write_text(text.replace(old, new, 1), encoding="utf-8")


identity = "docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md"
replace_once(
    identity,
    "Date: 2026-06-30  \nStatus: Contract only. No backend implementation, runtime behavior, Civication behavior, GPS/live-location discovery, followers/feed, free chat, or passive tracking is introduced by this document.\n\n## 1. Purpose",
    """Contract date: 2026-06-30  
Status: **canonical requirements contract; Identity & Public Profile is implemented server-side, while production discoverability remains fail-closed behind explicit rollout gates.**  
Current implementation: [`../backend/README.md`](../backend/README.md) and migration `002_social_meet_identity_profiles.sql`  
Sist kontrollert: **2026-07-26**

This document owns identity, consent, public-profile and privacy requirements. It does not itself activate production discovery or introduce Civication behavior, GPS/live-location discovery, followers/feed, free chat, or passive tracking.

## Current implementation status

The FastAPI/PostgreSQL identity slice is implemented with authenticated current-user identity, opt-in public profiles, publication/visibility controls and non-enumerating public reads. The implemented API boundary includes:

```text
GET  /api/v1/social-meet/me
PUT  /api/v1/social-meet/profile
GET  /api/v1/social-meet/profiles/{profileId}
POST /api/v1/social-meet/profile/unpublish
```

`profile_id` is the stable public participant identity; auth IDs remain private. A discoverable profile still requires current consent and explicit publication. Broad production discovery is a separate rollout decision and remains fail-closed. `HG_TEST_MODE` and demo candidates remain separate from production identity and profile state.

Implementation details and rollout status are owned by `backend/README.md`, the migration and the concrete backend modules. The requirements below remain binding.

## 1. Purpose""",
)
replace_once(
    identity,
    "Current Spotmeeting behavior is local/demo-only: invite discovery is disabled in production until a privacy-reviewed backend exists, and demo candidates must remain separate from production people/profile storage.",
    "The privacy-reviewed identity backend now exists, but production invite discovery remains disabled unless its deployment and private rollout gates are explicitly enabled. Demo candidates must remain separate from production people/profile storage.",
)

invite = "docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md"
replace_once(
    invite,
    "Date: 2026-06-30  \nStatus: Backend persistence and safety contract only. No backend implementation, runtime behavior, Civication behavior, GPS/live-location discovery, nearby discovery, followers/feed, free chat, or passive tracking is introduced by this document.\n\n## 1. Purpose",
    """Contract date: 2026-06-30  
Status: **canonical requirements contract; the durable Spotmeeting invite lifecycle is implemented server-side, while production invite writes remain fail-closed without explicit backend configuration and policy gates.**  
Current implementation: [`HG_SPOTMEETING_INVITE_BACKEND.md`](./HG_SPOTMEETING_INVITE_BACKEND.md), [`../backend/README.md`](../backend/README.md) and migration `006_spotmeeting_invites_server.sql`  
Sist kontrollert: **2026-07-26**

This document owns persistence, authorization, context, preset-message, lifecycle, sync and safety requirements. It does not itself activate production writes or introduce Civication behavior, GPS/live-location discovery, nearby discovery, followers/feed, free chat, or passive tracking.

## Current implementation status

The FastAPI/PostgreSQL invite slice is implemented as the server-authoritative Spotmeeting lifecycle. The implemented API boundary includes preset reads, durable creation, inbox and cursor-based sync, plus accept, decline, cancel and complete actions.

Migrated browser operations use `HGSocialMeetAdapter.js` → `HGSocialMeetFastApiClient.ts` → FastAPI → PostgreSQL. Creation revalidates identity, publication, consent, blocks, moderation, abuse/cooldowns, rate limits, context, presets and duplicate state. Missing or disabled backend configuration fails closed; production errors must not create local fake invites.

Implementation details and exact runtime behavior are owned by `HG_SPOTMEETING_INVITE_BACKEND.md`, `backend/README.md`, the migration and backend code. The requirements below remain binding.

## 1. Purpose""",
)
replace_once(
    invite,
    "The current client layer is local/demo-only, so it cannot provide durable delivery, cross-device state, server-side block/report enforcement, retention, export, moderation, or abuse prevention.",
    "A local/demo store remains unsuitable as a production source of truth. The migrated production client boundary now uses the server-owned lifecycle for durable delivery, cross-device state and server-side safety enforcement.",
)

safety = "docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md"
replace_once(
    safety,
    "Date: 2026-06-30  \nStatus: Documentation/API contract only. No backend implementation, runtime behavior, Civication behavior, GPS/live-location discovery, nearby discovery, followers/feed, free chat, public visit history, or passive tracking is introduced by this document.\n\n## 1. Purpose",
    """Contract date: 2026-06-30  
Status: **canonical safety requirements contract; participant safety/export/deletion, moderation/appeals, abuse controls and retention/observability are implemented server-side. Participant-facing rollout and destructive retention remain explicitly gated.**  
Current implementation: [`../backend/README.md`](../backend/README.md), [`HG_SOCIAL_MEET_MODERATION_BACKEND.md`](./HG_SOCIAL_MEET_MODERATION_BACKEND.md), [`HG_SOCIAL_MEET_ABUSE_CONTROLS.md`](./HG_SOCIAL_MEET_ABUSE_CONTROLS.md) and [`HG_SOCIAL_MEET_RETENTION_OBSERVABILITY.md`](./HG_SOCIAL_MEET_RETENTION_OBSERVABILITY.md)  
Sist kontrollert: **2026-07-26**

This document owns block, report, moderation, retention, deletion, export, appeal and safety-audit requirements. It does not itself activate production discovery or introduce Civication behavior, GPS/live-location discovery, nearby discovery, followers/feed, free chat, public visit history, or passive tracking.

## Current implementation status

Server-owned Social Meet safety is implemented across migrations `003`–`005` and `008`:

- bidirectional blocks, confidential structured reports, participant export and Social Meet deletion/tombstoning;
- moderator/admin queue, restrictions, resolution and appeals with roles derived only from verified server-controlled `app_metadata`;
- invite abuse preflight, rate limits, duplicate suppression and cooldowns;
- retention holds, privacy-safe observability and an explicitly gated destructive apply path.

Safety checks are reused by discovery and invite operations. Private block/report causes collapse to non-enumerating participant errors. Broad production rollout remains a separate operational decision, and destructive retention requires its own apply flag and approved procedure.

Implementation details are owned by `backend/README.md`, the concrete slice documents, migrations and backend code. The requirements below remain binding.

## 1. Purpose""",
)
replace_once(
    safety,
    "Client-only blocking is useful for demos, but it cannot protect a real recipient across devices, cached candidate suggestions, inbox fan-out, notifications, or backend lifecycle transitions.",
    "Client-only blocking remains useful only for demos and compatibility surfaces. Production protection is provided by the implemented server-side safety, moderation and abuse-control boundaries.",
)

replace_once(
    "backend/README.md",
    "De opprinnelige statusavsnittene i kravfilene er tidsbundne. Denne filen og de konkrete slice-dokumentene eier gjeldende implementasjonsstatus.",
    "Kravkontraktene er synkronisert med implementert status og eier fortsatt de bindende identity-, invite- og safety-kravene. Denne filen og de konkrete slice-dokumentene eier detaljert implementasjons- og rolloutstatus.",
)

docs_path = root / "docs/README.md"
docs = docs_path.read_text(encoding="utf-8")
docs = docs.replace(
    "Kravinnholdet er fortsatt aktivt. Filenes opprinnelige statusavsnitt er tidsbundne og delvis eldre enn implementasjonen, derfor er dokumentene transitional til statusdelene er synkronisert eller skilt fra kravteksten. Gjeldende implementasjonsstatus ligger i backendinngangen og slice-dokumentene.",
    "De tre filene er canonical kravkontrakter. Statusavsnittene er synkronisert med implementert backend og fail-closed rollout, mens detaljert implementasjonsstatus fortsatt eies av backendinngangen, migrasjonene og slice-dokumentene.",
)
docs = docs.replace(
    "- Social-dokumentasjonen delt i canonical produkt/privacy, aktive backend-slices, transitional kravtekster og historiske overgangsdokumenter",
    "- Social-dokumentasjonen delt i canonical produkt/privacy/krav, aktive backend-slices og historiske overgangsdokumenter",
)
completion = "- statusavsnittene i de tre Social Meet-kravkontraktene synkronisert med implementert backend og fail-closed rollout\n"
if completion not in docs:
    docs = docs.replace(
        "- koordinatdokumentasjonen samlet under én source-kontrakt, én evidenskontrakt, én arbeidsflyt og én kontrollprotokoll\n",
        "- koordinatdokumentasjonen samlet under én source-kontrakt, én evidenskontrakt, én arbeidsflyt og én kontrollprotokoll\n" + completion,
    )
docs = docs.replace(
    "- synkroniser de tidsbundne statusavsnittene i de tre Social Meet-kravkontraktene uten å endre kravinnholdet\n",
    "",
)
docs_path.write_text(docs, encoding="utf-8")

registry_path = root / "docs/documentation_registry.json"
registry = json.loads(registry_path.read_text(encoding="utf-8"))
registry["last_verified"] = verified
targets = {
    "docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md": "Aktiv canonical kravkontrakt for autentisert Social Meet-identitet, consent og opt-in public profile",
    "docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md": "Aktiv canonical kravkontrakt for context-bound invite-persistence, authorization, lifecycle og sync",
    "docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md": "Aktiv canonical kravkontrakt for block, report, moderation, retention, deletion, export og safety audit",
}
for entry in registry["documents"]:
    role = targets.get(entry["path"])
    if role is None:
        continue
    entry["status"] = "canonical"
    entry["role"] = role
    entry["last_verified"] = verified
    entry.pop("debt", None)
registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
