from __future__ import annotations

import re
from datetime import UTC, datetime, timedelta
from uuid import UUID

from app.core.config import Settings
from app.domains.social_meet.models import KnowledgeFingerprint, ProfileVisibility
from app.domains.social_meet.presence_models import (
    MAX_PLACE_PRESENCE_PEOPLE,
    PlacePresenceProfile,
    PlacePresenceResponse,
    PlacePresenceState,
)
from app.domains.social_meet.presence_repository import SocialMeetPlacePresenceRepository
from app.domains.social_meet.repository import SocialMeetIdentityRepository
from app.domains.social_meet.service import SUPPORTED_CONSENT_VERSION, SocialMeetDomainError

_PLACE_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{0,179}$")


class SocialMeetPlacePresenceService:
    def __init__(
        self,
        settings: Settings,
        identity_repository: SocialMeetIdentityRepository,
        presence_repository: SocialMeetPlacePresenceRepository,
    ) -> None:
        self._settings = settings
        self._identity_repository = identity_repository
        self._presence_repository = presence_repository

    def set_presence(
        self,
        auth_user_id: UUID,
        place_id: str,
        *,
        now: datetime | None = None,
    ) -> PlacePresenceState:
        self._require_enabled()
        actor = self._require_participant(auth_user_id)
        canonical_place_id = _place_id(place_id)
        timestamp = now or datetime.now(UTC)
        expires_at = timestamp + timedelta(
            seconds=self._settings.social_meet_place_presence_ttl_seconds
        )
        self._presence_repository.set_presence(
            actor.profile_id,
            canonical_place_id,
            now=timestamp,
            expires_at=expires_at,
        )
        return PlacePresenceState(
            place_id=canonical_place_id,
            active=True,
            expires_at=expires_at,
        )

    def clear_presence(
        self,
        auth_user_id: UUID,
        place_id: str,
    ) -> PlacePresenceState:
        self._require_enabled()
        actor = self._require_participant(auth_user_id)
        canonical_place_id = _place_id(place_id)
        self._presence_repository.clear_presence(actor.profile_id)
        return PlacePresenceState(
            place_id=canonical_place_id,
            active=False,
            expires_at=None,
        )

    def list_presence(
        self,
        auth_user_id: UUID,
        place_id: str,
        *,
        now: datetime | None = None,
    ) -> PlacePresenceResponse:
        self._require_enabled()
        actor = self._require_participant(auth_user_id)
        canonical_place_id = _place_id(place_id)
        timestamp = now or datetime.now(UTC)
        own_presence = self._presence_repository.get_presence(actor.profile_id, now=timestamp)
        own_active = bool(own_presence and own_presence[0] == canonical_place_id)
        own_expires_at = own_presence[1] if own_active and own_presence else None
        records = self._presence_repository.list_people(
            requester_profile_id=actor.profile_id,
            place_id=canonical_place_id,
            supported_consent_version=SUPPORTED_CONSENT_VERSION,
            now=timestamp,
            limit=MAX_PLACE_PRESENCE_PEOPLE,
        )
        return PlacePresenceResponse(
            place_id=canonical_place_id,
            generated_at=timestamp,
            self_active=own_active,
            self_expires_at=own_expires_at,
            people=[
                PlacePresenceProfile(
                    profile_id=record.profile_id,
                    display_name=record.display_name,
                    avatar_ref=record.avatar_ref,
                    short_bio=record.short_bio,
                    preferred_themes=list(record.preferred_themes),
                    favorite_eras=list(record.favorite_eras),
                    learning_goals=list(record.learning_goals),
                    knowledge_fingerprint_summary=KnowledgeFingerprint.model_validate(
                        record.knowledge_fingerprint_summary
                    ),
                )
                for record in records
            ],
        )

    def _require_enabled(self) -> None:
        if not self._settings.social_meet_place_presence_allowed():
            raise SocialMeetDomainError(
                code="backend_not_enabled",
                detail="Manual Place presence is not enabled",
            )

    def _require_participant(self, auth_user_id: UUID):
        actor = self._identity_repository.get_or_create_for_user(auth_user_id)
        if (
            actor.profile_id is None
            or actor.display_name is None
            or actor.profile_visibility is not ProfileVisibility.DISCOVERABLE
            or actor.consent_version != SUPPORTED_CONSENT_VERSION
        ):
            raise SocialMeetDomainError(
                code="profile_not_published",
                detail="A current discoverable Social Meet profile is required for Place presence",
            )
        return actor


def _place_id(value: str) -> str:
    place_id = str(value or "").strip()
    if not _PLACE_ID_RE.fullmatch(place_id):
        raise SocialMeetDomainError(
            code="invalid_place_id",
            detail="Place presence requires a canonical Place id",
        )
    return place_id
