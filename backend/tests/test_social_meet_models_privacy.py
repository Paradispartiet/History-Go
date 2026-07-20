import pytest
from pydantic import ValidationError

from app.domains.social_meet.models import ProfileUpsertRequest
from app.domains.social_meet.privacy import find_forbidden_fields


def test_profile_payload_normalizes_and_deduplicates_public_tags() -> None:
    profile = ProfileUpsertRequest.model_validate(
        {
            "displayName": "  Ada  ",
            "preferredThemes": [" industrial_history ", "industrial_history", ""],
            "learningGoals": [" compare sources ", "compare sources"],
            "fingerprintInputs": {
                "themeTags": [" industrial_history ", "industrial_history"],
            },
        }
    )

    assert profile.display_name == "Ada"
    assert profile.preferred_themes == ["industrial_history"]
    assert profile.learning_goals == ["compare sources"]
    assert profile.fingerprint_inputs.theme_tags == ["industrial_history"]


def test_profile_payload_rejects_unknown_fields() -> None:
    with pytest.raises(ValidationError):
        ProfileUpsertRequest.model_validate(
            {
                "displayName": "Ada",
                "publicHomePlaceId": "not-a-social-meet-field",
            }
        )


def test_privacy_scanner_finds_forbidden_fields_at_any_depth() -> None:
    forbidden = find_forbidden_fields(
        {
            "displayName": "Ada",
            "fingerprintInputs": {
                "themeTags": ["history"],
                "metadata": [{"live_location": "secret"}, {"lastSeen": "now"}],
            },
            "visited-places": ["place_a"],
        }
    )

    assert [(item.field, item.path) for item in forbidden] == [
        ("live_location", "fingerprintInputs.metadata[0].live_location"),
        ("lastSeen", "fingerprintInputs.metadata[1].lastSeen"),
        ("visited-places", "visited-places"),
    ]


def test_privacy_scanner_does_not_block_explicit_interest_places() -> None:
    assert find_forbidden_fields({"interestPlaces": ["industrial_regions"]}) == ()
